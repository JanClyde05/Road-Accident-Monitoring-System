/*
 * Road Accident Monitoring System (RAMS) - Standalone Desktop Rescuer Application
 * =================================================================================
 * High-performance, zero-external-dependency Windows desktop host for the RAMS
 * Emergency Command & Dispatch Operations Center.
 *
 * Capabilities:
 *  - Embedded multi-threaded HTTP server (System.Net.HttpListener)
 *  - Full offline execution (works in mobile command centers without internet)
 *  - Auto-detecting USB Serial Bridge for direct LoRa Base Station hardware sync
 *  - Direct LoRa Base Station Receiver ingestion (/api/upload, /api/events)
 *  - Real-time incident telemetry feed (/api/events)
 *  - Persistent local incident storage (incidents.json)
 *  - Native chromeless window via Microsoft Edge App Mode (--app=http://...)
 *
 * Compiles directly with:
 *   C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:winexe /out:RAMS_Rescuer_Desktop.exe Program.cs
 */

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Ports;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Globalization;
using System.Reflection;
using System.Net.NetworkInformation;

namespace RamsRescuerDesktop
{
    class Program
    {
        private static HttpListener _listener;
        private static int _port = 8080;
        private static string _wwwDir;
        private static string _dataFilePath;
        private static string _registrationsFilePath;
        private static readonly object _lock = new object();
        private static List<string> _eventsJsonList = new List<string>();
        private static Dictionary<string, string> _registrations = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        private static DateTime _lastActivity = DateTime.UtcNow;
        private static volatile bool _exitRequested = false;

        // Serial Receiver Integration Fields
        private static Thread _serialMonitorThread;
        private static volatile bool _serialRunning = true;
        private static readonly Dictionary<string, Thread> _activePortReaders = new Dictionary<string, Thread>(StringComparer.OrdinalIgnoreCase);
        private static readonly Dictionary<string, SerialPort> _activeSerialPorts = new Dictionary<string, SerialPort>(StringComparer.OrdinalIgnoreCase);
        private static readonly HashSet<string> _connectedPortNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        private static string _lastDetectedPort = "NONE";
        private static List<string> _localLanIPs = new List<string>();
        private static TcpListener _lanTcpListener;
        private static Thread _lanTcpThread;
        private static UdpClient _discoveryUdp;
        private static Thread _discoveryThread;

        public static void CloseAllSerialPorts()
        {
            _serialRunning = false;
            lock (_lock)
            {
                foreach (var kvp in _activeSerialPorts)
                {
                    try
                    {
                        if (kvp.Value != null)
                        {
                            if (kvp.Value.IsOpen) kvp.Value.Close();
                            kvp.Value.Dispose();
                        }
                    }
                    catch { }
                }
                _activeSerialPorts.Clear();
                _connectedPortNames.Clear();
            }
        }

        // Ping Measurement & Range Verification Engine
        private static readonly object _pingLock = new object();
        private static string _pingLogPath;
        private static string _stationConfigPath;
        private static double? _stationLat = null;
        private static double? _stationLon = null;
        private static string _stationLabel = "Base Station";
        private static string _stationSource = "manual";
        private static double? _stationAccuracyM = null;
        private static DateTime _stationUpdatedUtc = DateTime.UtcNow;
        private static readonly List<string> _recentPingsBuffer = new List<string>();
        private class PingTokenState
        {
            public long T2Ms;
            public long T0Ms;
        }
        private static readonly Dictionary<string, PingTokenState> _lastPingByToken = new Dictionary<string, PingTokenState>(StringComparer.OrdinalIgnoreCase);

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                // Terminate any previous orphaned instances of RAMS_Rescuer_Desktop
                try
                {
                    Process currentProc = Process.GetCurrentProcess();
                    foreach (Process p in Process.GetProcessesByName(currentProc.ProcessName))
                    {
                        if (p.Id != currentProc.Id)
                        {
                            try { p.Kill(); p.WaitForExit(1000); } catch { }
                        }
                    }
                }
                catch { }

                // Ensure all serial ports are closed if process exits unexpectedly
                AppDomain.CurrentDomain.ProcessExit += (s, e) => CloseAllSerialPorts();

                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                _wwwDir = Path.Combine(appDir, "www");
                _dataFilePath = Path.Combine(appDir, "incidents.json");
                _registrationsFilePath = Path.Combine(appDir, "registrations.json");
                _pingLogPath = Path.Combine(appDir, "ping-log.jsonl");
                _stationConfigPath = Path.Combine(appDir, "station-config.json");

                // Initialize station config, incident and registration stores
                LoadStationConfig();
                LoadRegistrations();
                LoadIncidents();

                // Start Auto-Detecting USB Serial Bridge for direct LoRa Base Station hardware ingestion
                StartSerialReceiverBridge();

                // Start Non-Admin LAN TCP Bridge on port 8888 for optional Wi-Fi receiver ingestion
                StartLanReceiverBridge();

                // Start UDP Discovery Responder on port 8889 for receiver backend auto-discovery
                StartDiscoveryResponder();

                // Start Embedded Local HTTP Server on open port (8080-8095)
                _port = StartServer(8080);

                // Handle optional --ping argument to launch into Range & Latency Benchmark panel directly
                bool openPingMode = false;
                if (args != null)
                {
                    for (int i = 0; i < args.Length; i++)
                    {
                        if (string.Equals(args[i], "--ping", StringComparison.OrdinalIgnoreCase))
                        {
                            openPingMode = true;
                            break;
                        }
                    }
                }

                // Launch Native Desktop App Window via Edge App Mode
                string appUrl = openPingMode ? string.Format("http://127.0.0.1:{0}/ping.html", _port) : string.Format("http://127.0.0.1:{0}/", _port);
                Process edgeProc = null;
                try
                {
                    edgeProc = LaunchEdgeApp(appUrl);
                    if (edgeProc == null)
                    {
                        edgeProc = Process.Start(appUrl);
                    }
                }
                catch { }

                DateTime startupTime = DateTime.UtcNow;
                _lastActivity = DateTime.UtcNow;

                // Monitor application window: auto-terminate and release COM ports when user closes window
                while (!_exitRequested)
                {
                    Thread.Sleep(500);

                    // Check 1: Edge process exited
                    if (edgeProc != null)
                    {
                        try
                        {
                            if (edgeProc.HasExited)
                            {
                                _exitRequested = true;
                                break;
                            }
                        }
                        catch { }
                    }

                    // Check 2: Browser Inactivity Watchdog
                    // React dashboard polls /api/events every 2.5s. If no HTTP traffic for > 7s after 15s initial startup:
                    if ((DateTime.UtcNow - startupTime).TotalSeconds > 15 && 
                        (DateTime.UtcNow - _lastActivity).TotalSeconds > 7)
                    {
                        _exitRequested = true;
                        break;
                    }
                }

                // Window closed or exit requested — immediately release all COM ports and resources
                CloseAllSerialPorts();
                try { if (_lanTcpListener != null) _lanTcpListener.Stop(); } catch { }
                try { if (_discoveryUdp != null) _discoveryUdp.Close(); } catch { }
                try
                {
                    if (_listener != null && _listener.IsListening)
                    {
                        _listener.Stop();
                        _listener.Close();
                    }
                }
                catch { }
                Environment.Exit(0);
            }
            catch (Exception ex)
            {
                try
                {
                    File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "crash.log"), ex.ToString());
                }
                catch { }
            }
        }

        private static int StartServer(int startingPort)
        {
            // Record local IPv4 addresses for network info / status reporting
            try
            {
                string hostName = Dns.GetHostName();
                IPHostEntry hostEntry = Dns.GetHostEntry(hostName);
                foreach (IPAddress ip in hostEntry.AddressList)
                {
                    if (ip.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(ip))
                    {
                        string ipStr = ip.ToString();
                        if (!_localLanIPs.Contains(ipStr)) _localLanIPs.Add(ipStr);
                    }
                }
            }
            catch { }

            for (int p = startingPort; p <= 8095; p++)
            {
                try
                {
                    _listener = new HttpListener();
                    _listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", p));
                    _listener.Prefixes.Add(string.Format("http://localhost:{0}/", p));

                    _listener.Start();
                    _listener.BeginGetContext(OnRequest, null);
                    _port = p;
                    return p;
                }
                catch
                {
                    try { if (_listener != null) _listener.Close(); } catch { }
                }
            }

            // Fallback emergency start on port 8080 loopback
            try
            {
                _port = 8080;
                _listener = new HttpListener();
                _listener.Prefixes.Add("http://127.0.0.1:8080/");
                _listener.Prefixes.Add("http://localhost:8080/");
                _listener.Start();
                _listener.BeginGetContext(OnRequest, null);
                return 8080;
            }
            catch
            {
                return 8080;
            }
        }

        #region Serial Port LoRa Receiver Auto-Connect Bridge

        private static void StartSerialReceiverBridge()
        {
            _serialMonitorThread = new Thread(SerialMonitorWorker)
            {
                IsBackground = true,
                Name = "RAMS_Serial_Monitor"
            };
            _serialMonitorThread.Start();
        }

        private static void SerialMonitorWorker()
        {
            while (_serialRunning && !_exitRequested)
            {
                try
                {
                    string[] portNames = SerialPort.GetPortNames();
                    if (portNames != null && portNames.Length > 0)
                    {
                        foreach (string p in portNames)
                        {
                            if (!_serialRunning || _exitRequested) break;
                            lock (_lock)
                            {
                                if (_activePortReaders.ContainsKey(p)) continue;

                                string portCapture = p;
                                Thread readerThread = new Thread(() => ReadPortWorker(portCapture))
                                {
                                    IsBackground = true,
                                    Name = "RAMS_Reader_" + portCapture
                                };
                                _activePortReaders[portCapture] = readerThread;
                                readerThread.Start();
                            }
                        }
                    }
                }
                catch { }

                Thread.Sleep(2000); // Check for new USB connections every 2 seconds
            }
        }

        private static void ReadPortWorker(string portName)
        {
            SerialPort sp = null;
            try
            {
                sp = new SerialPort(portName, 115200, Parity.None, 8, StopBits.One)
                {
                    ReadTimeout = 2500,
                    WriteTimeout = 1500,
                    DtrEnable = true,  // Required for ESP32-S3 USB CDC
                    RtsEnable = false // Crucial: Keep RTS false so auto-reset does not hold ESP32 in ROM bootloader
                };

                sp.Open();
                lock (_lock)
                {
                    _activeSerialPorts[portName] = sp;
                    _connectedPortNames.Add(portName);
                    _lastDetectedPort = portName;
                }

                while (_serialRunning && !_exitRequested && sp.IsOpen)
                {
                    try
                    {
                        string line = sp.ReadLine();
                        if (!string.IsNullOrEmpty(line))
                        {
                            line = line.Trim();
                            // Accept any JSON object from serial (LoRa events, alerts, telemetry)
                            if (line.StartsWith("{") && line.EndsWith("}"))
                            {
                                ProcessIncomingReceiverPacket(line, portName);
                            }
                        }
                    }
                    catch (TimeoutException)
                    {
                        // Normal timeout when no incoming packet, keep reading
                    }
                    catch (Exception)
                    {
                        break;
                    }
                }
            }
            catch
            {
                // Port couldn't be opened (might be in use by Arduino IDE or another tool)
            }
            finally
            {
                lock (_lock)
                {
                    _activeSerialPorts.Remove(portName);
                    _connectedPortNames.Remove(portName);
                    _activePortReaders.Remove(portName);
                }
                if (sp != null)
                {
                    try
                    {
                        if (sp.IsOpen) sp.Close();
                        sp.Dispose();
                    }
                    catch { }
                }
            }
        }

        private static void ProcessIncomingReceiverPacket(string jsonLine, string source)
        {
            ProcessIncomingPayload(jsonLine, "RAMS-");
        }

        private static void ProcessIncomingPayload(string payload, string defaultPrefix)
        {
            if (string.IsNullOrEmpty(payload)) return;

            string eventField = ExtractField(payload, "event");
            string token = ExtractField(payload, "deviceToken") ?? ExtractField(payload, "token") ?? "";

            // Intercept LoRa Ping packets for latency and range analysis (never record as incident)
            if (!string.IsNullOrEmpty(eventField) && eventField.Equals("LORA_PING", StringComparison.OrdinalIgnoreCase))
            {
                RecordPing(payload, "serial", DateTime.UtcNow);
                return;
            }

            string packetType = "alert";
            if (!string.IsNullOrEmpty(eventField))
            {
                if (eventField.Equals("LORA_ALERT", StringComparison.OrdinalIgnoreCase)) packetType = "alert";
                else if (eventField.Equals("LORA_TELEMETRY", StringComparison.OrdinalIgnoreCase)) packetType = "telemetry";
                else if (eventField.Equals("LORA_RIDER_PROFILE", StringComparison.OrdinalIgnoreCase)) packetType = "rider_profile";
                else if (eventField.Equals("LORA_REGISTER", StringComparison.OrdinalIgnoreCase)) packetType = "register";
                else if (eventField.Equals("LORA_FALSE_ALARM", StringComparison.OrdinalIgnoreCase)) packetType = "false_alarm";
                else if (eventField.Equals("LORA_USER_TYPE", StringComparison.OrdinalIgnoreCase)) packetType = "user_type";
                else if (eventField.Equals("LORA_TEST", StringComparison.OrdinalIgnoreCase)) packetType = "test";
            }
            else
            {
                packetType = ExtractField(payload, "packetType") ?? ExtractField(payload, "type") ?? "alert";
            }

            // 1. Handle Registration / Profile Sync packets (saves to registrations, not incidents)
            // 1. Handle Registration / Profile Sync packets (saves to registrations, not incidents)
            if (packetType.Equals("register", StringComparison.OrdinalIgnoreCase) || packetType.Equals("rider_profile", StringComparison.OrdinalIgnoreCase))
            {
                string rName = ExtractField(payload, "riderName") ?? ExtractField(payload, "name") ?? "";
                string rPhoto = ExtractField(payload, "photoUrl") ?? ExtractField(payload, "driveLinkConverted") ?? ExtractField(payload, "driveLink") ?? "";
                string rPlate = ExtractField(payload, "plateNumber") ?? ExtractField(payload, "plate") ?? "";
                string rPhone = ExtractField(payload, "contactNumber") ?? ExtractField(payload, "phone") ?? ExtractField(payload, "contact") ?? "";
                string rBlood = ExtractField(payload, "bloodType") ?? ExtractField(payload, "blood") ?? "";
                string rCat = ExtractField(payload, "category") ?? "";
                string rVehicle = ExtractField(payload, "vehicleModel") ?? ExtractField(payload, "vehicle") ?? (!string.IsNullOrEmpty(rCat) ? rCat : "");
                string rEmerName = ExtractField(payload, "emergencyContactName") ?? "";
                string rEmerPhone = ExtractField(payload, "emergencyContactPhone") ?? ExtractField(payload, "emergencyPhone") ?? "";
                string rAllergies = ExtractField(payload, "allergies") ?? "";

                if (!string.IsNullOrEmpty(token))
                {
                    lock (_lock)
                    {
                        string existingReg = null;
                        _registrations.TryGetValue(token, out existingReg);

                        string photoUrl = ConvertGoogleDriveUrl(rPhoto);
                        if (string.IsNullOrEmpty(photoUrl) && existingReg != null) photoUrl = ExtractField(existingReg, "photoUrl");

                        string finalName = !string.IsNullOrEmpty(rName) ? rName : (existingReg != null ? (ExtractField(existingReg, "name") ?? "") : "");
                        string finalPhoto = photoUrl ?? "";
                        string finalVehicle = !string.IsNullOrEmpty(rVehicle) ? rVehicle : (existingReg != null ? (ExtractField(existingReg, "vehicleModel") ?? "Motorcycle") : "Motorcycle");
                        string finalPlate = !string.IsNullOrEmpty(rPlate) ? rPlate : (existingReg != null ? (ExtractField(existingReg, "plateNumber") ?? "EMERGENCY") : "EMERGENCY");
                        string finalPhone = !string.IsNullOrEmpty(rPhone) ? rPhone : (existingReg != null ? (ExtractField(existingReg, "contactNumber") ?? "+63 900 000 0000") : "+63 900 000 0000");
                        string finalEmerName = !string.IsNullOrEmpty(rEmerName) ? rEmerName : (existingReg != null ? (ExtractField(existingReg, "emergencyContactName") ?? "Dispatch EOC") : "Dispatch EOC");
                        string finalEmerPhone = !string.IsNullOrEmpty(rEmerPhone) ? rEmerPhone : (existingReg != null ? (ExtractField(existingReg, "emergencyContactPhone") ?? "+63 911 000 0000") : "+63 911 000 0000");
                        string finalEmerRel = existingReg != null ? (ExtractField(existingReg, "emergencyRelationship") ?? "Emergency Services") : "Emergency Services";
                        string finalBlood = !string.IsNullOrEmpty(rBlood) ? rBlood : (existingReg != null ? (ExtractField(existingReg, "bloodType") ?? "O+") : "O+");
                        string finalAllergies = !string.IsNullOrEmpty(rAllergies) ? rAllergies : (existingReg != null ? (ExtractField(existingReg, "allergies") ?? "None") : "None");

                        string regEntry = string.Format(
                            System.Globalization.CultureInfo.InvariantCulture,
                            "{{\"token\":\"{0}\",\"name\":\"{1}\",\"photoUrl\":\"{2}\",\"vehicleModel\":\"{3}\",\"plateNumber\":\"{4}\",\"contactNumber\":\"{5}\",\"emergencyContactName\":\"{6}\",\"emergencyContactPhone\":\"{7}\",\"emergencyRelationship\":\"{8}\",\"bloodType\":\"{9}\",\"allergies\":\"{10}\",\"updatedAt\":\"{11}\"}}",
                            token, finalName, finalPhoto, finalVehicle, finalPlate, finalPhone, finalEmerName, finalEmerPhone, finalEmerRel, finalBlood, finalAllergies, DateTime.UtcNow.ToString("o")
                        );

                        _registrations[token] = regEntry;
                        SaveRegistrations();

                        // Enrich existing events with rider credentials
                        for (int i = 0; i < _eventsJsonList.Count; i++)
                        {
                            string ev = _eventsJsonList[i];
                            if (token.Equals(ExtractField(ev, "deviceToken"), StringComparison.OrdinalIgnoreCase))
                            {
                                string updated = ev;
                                if (!string.IsNullOrEmpty(finalPhoto))
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(updated, "\"photoUrl\":\\s*\"[^\"]*\"", "\"photoUrl\":\"" + finalPhoto + "\"");
                                }
                                if (!string.IsNullOrEmpty(finalName))
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(updated, "\"riderName\":\\s*\"[^\"]*\"", "\"riderName\":\"" + finalName + "\"");
                                    updated = System.Text.RegularExpressions.Regex.Replace(updated, "\"deviceName\":\\s*\"[^\"]*\"", "\"deviceName\":\"" + finalName + "\"");
                                }
                                if (!string.IsNullOrEmpty(finalVehicle))
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(updated, "\"vehicleModel\":\\s*\"[^\"]*\"", "\"vehicleModel\":\"" + finalVehicle + "\"");
                                }
                                if (!string.IsNullOrEmpty(finalPlate) && finalPlate != "EMERGENCY")
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(updated, "\"plateNumber\":\\s*\"[^\"]*\"", "\"plateNumber\":\"" + finalPlate + "\"");
                                }
                                if (!string.IsNullOrEmpty(finalPhone) && finalPhone != "+63 900 000 0000")
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(updated, "\"contactNumber\":\\s*\"[^\"]*\"", "\"contactNumber\":\"" + finalPhone + "\"");
                                }
                                if (!string.IsNullOrEmpty(finalEmerName) && finalEmerName != "Dispatch EOC")
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(updated, "\"emergencyContactName\":\\s*\"[^\"]*\"", "\"emergencyContactName\":\"" + finalEmerName + "\"");
                                }
                                if (!string.IsNullOrEmpty(finalEmerPhone) && finalEmerPhone != "+63 911 000 0000")
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(updated, "\"emergencyContactPhone\":\\s*\"[^\"]*\"", "\"emergencyContactPhone\":\"" + finalEmerPhone + "\"");
                                }
                                if (!string.IsNullOrEmpty(finalBlood))
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(updated, "\"bloodType\":\\s*\"[^\"]*\"", "\"bloodType\":\"" + finalBlood + "\"");
                                }
                                if (!string.IsNullOrEmpty(finalAllergies) && finalAllergies != "None")
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(updated, "\"allergies\":\\s*\"[^\"]*\"", "\"allergies\":\"" + finalAllergies + "\"");
                                }
                                if (updated != ev) _eventsJsonList[i] = updated;
                            }
                        }
                        SaveIncidents();
                    }
                }
                return;
            }

            // 2. Handle User Type / Vehicle Category updates
            if (packetType.Equals("user_type", StringComparison.OrdinalIgnoreCase))
            {
                string cat = ExtractField(payload, "category") ?? ExtractField(payload, "userType") ?? ExtractField(payload, "vehicle") ?? "";
                if (!string.IsNullOrEmpty(token) && !string.IsNullOrEmpty(cat))
                {
                    lock (_lock)
                    {
                        string existingReg = null;
                        if (_registrations.TryGetValue(token, out existingReg) && existingReg != null)
                        {
                            existingReg = System.Text.RegularExpressions.Regex.Replace(existingReg, "\"vehicleModel\":\\s*\"[^\"]*\"", "\"vehicleModel\":\"" + cat + "\"");
                            _registrations[token] = existingReg;
                            SaveRegistrations();
                        }
                    }
                }
                return;
            }

            // 3. Coordinate validation
            string latStr = ExtractField(payload, "lat");
            string lonStr = ExtractField(payload, "lon");
            double lat = 0.0, lon = 0.0;
            if (!string.IsNullOrEmpty(latStr)) double.TryParse(latStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out lat);
            if (!string.IsNullOrEmpty(lonStr)) double.TryParse(lonStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out lon);
            bool hasValidCoords = (Math.Abs(lat) > 0.0001 || Math.Abs(lon) > 0.0001);

            // TELEMETRY: Discard immediately if coordinates are (0, 0) — unacquired GPS fix
            if (packetType.Equals("telemetry", StringComparison.OrdinalIgnoreCase))
            {
                if (!hasValidCoords) return;

                // Keep only the latest live telemetry beacon per device token
                lock (_lock)
                {
                    if (!string.IsNullOrEmpty(token))
                    {
                        _eventsJsonList.RemoveAll(ev =>
                            token.Equals(ExtractField(ev, "deviceToken"), StringComparison.OrdinalIgnoreCase) &&
                            "telemetry".Equals(ExtractField(ev, "type"), StringComparison.OrdinalIgnoreCase));
                    }
                    string eventId = "RAMS-TEL-" + (!string.IsNullOrEmpty(token) ? token : "NODE");
                    string formatted = BuildEventFromJsonOrForm(payload, eventId);
                    _eventsJsonList.Insert(0, formatted);
                    SaveIncidents();
                }
                return;
            }

            // 4. Handle False Alarm cancellation
            if (packetType.Equals("false_alarm", StringComparison.OrdinalIgnoreCase))
            {
                lock (_lock)
                {
                    bool matched = false;
                    string cleanToken = (token ?? "").Trim();

                    // Pass 1: Match by device token (exact or prefix/contains)
                    for (int i = 0; i < _eventsJsonList.Count; i++)
                    {
                        string ev = _eventsJsonList[i];
                        string evToken = (ExtractField(ev, "deviceToken") ?? "").Trim();
                        string evStatus = (ExtractField(ev, "status") ?? "").Trim();
                        string evType = (ExtractField(ev, "type") ?? "").Trim();

                        bool isAlert = evType.Equals("alert", StringComparison.OrdinalIgnoreCase) || 
                                       evStatus.IndexOf("ALERT", StringComparison.OrdinalIgnoreCase) >= 0;

                        bool tokenMatch = !string.IsNullOrEmpty(cleanToken) && !string.IsNullOrEmpty(evToken) && (
                            cleanToken.Equals(evToken, StringComparison.OrdinalIgnoreCase) ||
                            (cleanToken.Length >= 3 && evToken.IndexOf(cleanToken, StringComparison.OrdinalIgnoreCase) >= 0) ||
                            (evToken.Length >= 3 && cleanToken.IndexOf(evToken, StringComparison.OrdinalIgnoreCase) >= 0)
                        );

                        if (tokenMatch && isAlert)
                        {
                            string updated = System.Text.RegularExpressions.Regex.Replace(
                                ev,
                                "\"status\":\\s*\"[^\"]*\"",
                                "\"status\":\"FALSE ALARM\""
                            );
                            updated = System.Text.RegularExpressions.Regex.Replace(
                                updated,
                                "\"type\":\\s*\"[^\"]*\"",
                                "\"type\":\"false_alarm\""
                            );
                            _eventsJsonList[i] = updated;
                            matched = true;
                        }
                    }

                    // Pass 2 Fallback: If token had minor transmission noise, cancel the most recent ACTIVE ALERT on the network
                    if (!matched)
                    {
                        for (int i = 0; i < _eventsJsonList.Count; i++)
                        {
                            string ev = _eventsJsonList[i];
                            string evStatus = (ExtractField(ev, "status") ?? "").Trim();
                            string evType = (ExtractField(ev, "type") ?? "").Trim();

                            if (evType.Equals("alert", StringComparison.OrdinalIgnoreCase) || 
                                evStatus.IndexOf("ALERT", StringComparison.OrdinalIgnoreCase) >= 0)
                            {
                                string updated = System.Text.RegularExpressions.Regex.Replace(
                                    ev,
                                    "\"status\":\\s*\"[^\"]*\"",
                                    "\"status\":\"FALSE ALARM\""
                                );
                                updated = System.Text.RegularExpressions.Regex.Replace(
                                    updated,
                                    "\"type\":\\s*\"[^\"]*\"",
                                    "\"type\":\"false_alarm\""
                                );
                                _eventsJsonList[i] = updated;
                                matched = true;
                                break;
                            }
                        }
                    }

                    // Only insert a new false alarm record if there was never any prior alert in the system
                    if (!matched && !string.IsNullOrEmpty(cleanToken) && cleanToken.Length >= 3 && (Math.Abs(lat) > 0.0001 || Math.Abs(lon) > 0.0001))
                    {
                        string eventId = "RAMS-FA-" + DateTime.Now.ToString("yyyyMMdd-HHmmss-fff");
                        string formatted = BuildEventFromJsonOrForm(payload, eventId);
                        _eventsJsonList.Insert(0, formatted);
                    }
                    SaveIncidents();
                }
                return;
            }

            // 5. Handle Real Alerts (Accident / Crash / Fall / High-G Impact)
            if (packetType.Equals("alert", StringComparison.OrdinalIgnoreCase) || packetType.Equals("test", StringComparison.OrdinalIgnoreCase))
            {
                // If coordinates are missing (0,0), attempt fallback to last-known valid location for this device
                if (!hasValidCoords && !string.IsNullOrEmpty(token))
                {
                    lock (_lock)
                    {
                        foreach (var ev in _eventsJsonList)
                        {
                            if (token.Equals(ExtractField(ev, "deviceToken"), StringComparison.OrdinalIgnoreCase))
                            {
                                string pLat = ExtractField(ev, "lat");
                                string pLon = ExtractField(ev, "lon");
                                double pl = 0, pn = 0;
                                if (double.TryParse(pLat, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out pl) &&
                                    double.TryParse(pLon, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out pn) &&
                                    (Math.Abs(pl) > 0.0001 || Math.Abs(pn) > 0.0001))
                                {
                                    lat = pl;
                                    lon = pn;
                                    break;
                                }
                            }
                        }
                    }
                }

                string eventId = (defaultPrefix ?? "RAMS-ALERT-") + DateTime.Now.ToString("yyyyMMdd-HHmmss-fff");
                string formatted = BuildEventFromJsonOrForm(payload, eventId);

                lock (_lock)
                {
                    _eventsJsonList.Insert(0, formatted);
                    SaveIncidents();
                }
            }
        }

        #endregion

        #region LAN Wi-Fi Receiver Ingestion Bridge (Port 8888 - Non-Admin)

        private static void StartLanReceiverBridge()
        {
            try
            {
                _lanTcpListener = new TcpListener(IPAddress.Any, 8888);
                _lanTcpListener.Start();
                _lanTcpThread = new Thread(LanTcpWorker)
                {
                    IsBackground = true,
                    Name = "RAMS_LAN_Bridge"
                };
                _lanTcpThread.Start();
                Console.WriteLine("[LAN-BRIDGE] Listening on port 8888");
            }
            catch (Exception ex)
            {
                Console.WriteLine("[LAN-BRIDGE] Failed to bind 8888: {0}", ex.Message);
            }
        }

        private static void StartDiscoveryResponder()
        {
            try
            {
                _discoveryUdp = new UdpClient(8889);
                _discoveryThread = new Thread(DiscoveryWorker) { IsBackground = true, Name = "RAMS_Discovery" };
                _discoveryThread.Start();
                Console.WriteLine("[DISCOVERY] Responding on UDP 8889");
            }
            catch (Exception ex)
            {
                Console.WriteLine("[DISCOVERY] Bind failed: {0}", ex.Message);
            }
        }

        private static string LocalAddressFor(IPAddress remote)
        {
            try
            {
                byte[] rBytes = remote.GetAddressBytes();
                foreach (NetworkInterface netInterface in NetworkInterface.GetAllNetworkInterfaces())
                {
                    if (netInterface.OperationalStatus != OperationalStatus.Up) continue;
                    IPInterfaceProperties ipProps = netInterface.GetIPProperties();
                    foreach (UnicastIPAddressInformation addr in ipProps.UnicastAddresses)
                    {
                        if (addr.Address.AddressFamily == AddressFamily.InterNetwork)
                        {
                            byte[] lBytes = addr.Address.GetAddressBytes();
                            if (lBytes[0] == rBytes[0] && lBytes[1] == rBytes[1] && lBytes[2] == rBytes[2])
                            {
                                return addr.Address.ToString();
                            }
                        }
                    }
                }
                foreach (IPAddress ip in Dns.GetHostAddresses(Dns.GetHostName()))
                {
                    if (ip.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(ip))
                    {
                        return ip.ToString();
                    }
                }
            }
            catch { }
            return "127.0.0.1";
        }

        private static void DiscoveryWorker()
        {
            IPEndPoint remote = new IPEndPoint(IPAddress.Any, 0);
            while (!_exitRequested)
            {
                try
                {
                    byte[] data = _discoveryUdp.Receive(ref remote);
                    string text = Encoding.ASCII.GetString(data);
                    if (!text.StartsWith("RAMS_DISCOVER_V1 ")) continue;

                    string nonce = text.Substring(17).Trim();
                    string host = LocalAddressFor(remote.Address);
                    string json = string.Format(
                        "{{\"svc\":\"rams-desktop\",\"v\":1,\"host\":\"{0}\",\"port\":8888,\"nonce\":\"{1}\"}}",
                        host, nonce);
                    byte[] reply = Encoding.UTF8.GetBytes(json);
                    _discoveryUdp.Send(reply, reply.Length, remote);
                    Console.WriteLine("[DISCOVERY] Answered {0} with {1}", remote, host);
                }
                catch (SocketException) { }
                catch (ObjectDisposedException) { break; }
                catch { }
            }
        }

        private static void LanTcpWorker()
        {
            while (_serialRunning && !_exitRequested)
            {
                try
                {
                    TcpClient client = _lanTcpListener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem(state => HandleLanClient((TcpClient)state), client);
                }
                catch
                {
                    break;
                }
            }
        }

        private static void HandleLanClient(TcpClient client)
        {
            try
            {
                using (client)
                using (NetworkStream stream = client.GetStream())
                {
                    stream.ReadTimeout = 5000;
                    stream.WriteTimeout = 5000;
                    byte[] buffer = new byte[8192];
                    int bytesRead = stream.Read(buffer, 0, buffer.Length);
                    if (bytesRead > 0)
                    {
                        string req = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                        if (req.StartsWith("GET /api/health", StringComparison.OrdinalIgnoreCase) || req.IndexOf("GET /api/health", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            string healthBody = "{\"status\":\"OK\",\"svc\":\"rams-desktop\",\"port\":8888}";
                            byte[] payload = Encoding.UTF8.GetBytes(healthBody);
                            string head = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\nContent-Length: " + payload.Length + "\r\n\r\n";
                            byte[] headBytes = Encoding.ASCII.GetBytes(head);
                            stream.Write(headBytes, 0, headBytes.Length);
                            stream.Write(payload, 0, payload.Length);
                            stream.Flush();
                            return;
                        }

                        int bodyIdx = req.IndexOf("\r\n\r\n");
                        if (bodyIdx >= 0)
                        {
                            string body = req.Substring(bodyIdx + 4);

                            // Read remaining body bytes if Content-Length exceeds initial buffer
                            int clIdx = req.IndexOf("Content-Length:", StringComparison.OrdinalIgnoreCase);
                            if (clIdx >= 0)
                            {
                                int clEnd = req.IndexOf("\r\n", clIdx);
                                if (clEnd > clIdx)
                                {
                                    string clStr = req.Substring(clIdx + 15, clEnd - (clIdx + 15)).Trim();
                                    int contentLength;
                                    if (int.TryParse(clStr, out contentLength))
                                    {
                                        int bodyBytesRead = Encoding.UTF8.GetByteCount(body);
                                        while (bodyBytesRead < contentLength)
                                        {
                                            int readMore = stream.Read(buffer, 0, Math.Min(buffer.Length, contentLength - bodyBytesRead));
                                            if (readMore <= 0) break;
                                            body += Encoding.UTF8.GetString(buffer, 0, readMore);
                                            bodyBytesRead += readMore;
                                        }
                                    }
                                }
                            }

                            if (req.IndexOf("POST", StringComparison.OrdinalIgnoreCase) >= 0 && !string.IsNullOrEmpty(body.Trim()))
                            {
                                _lastActivity = DateTime.UtcNow;
                                Console.WriteLine("[LAN-BRIDGE] Ingested packet from receiver: {0} chars", body.Length);
                                ProcessIncomingPayload(body, "RAMS-ALERT-");
                            }
                        }

                        byte[] resp = Encoding.UTF8.GetBytes("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nConnection: close\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: 15\r\n\r\n{\"status\":\"OK\"}");
                        stream.Write(resp, 0, resp.Length);
                        stream.Flush();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("[LAN-BRIDGE] Client error: {0}", ex.Message);
            }
        }

        #endregion

        private static void OnRequest(IAsyncResult ar)
        {
            if (_listener == null || !_listener.IsListening) return;

            HttpListenerContext context = null;
            try
            {
                context = _listener.EndGetContext(ar);
            }
            catch
            {
                return;
            }
            finally
            {
                if (_listener != null && _listener.IsListening)
                {
                    _listener.BeginGetContext(OnRequest, null);
                }
            }

            if (context == null) return;

            try
            {
                ProcessContext(context);
            }
            catch (Exception ex)
            {
                try
                {
                    context.Response.StatusCode = 500;
                    byte[] err = Encoding.UTF8.GetBytes("Internal Server Error: " + ex.Message);
                    context.Response.ContentType = "text/plain";
                    context.Response.OutputStream.Write(err, 0, err.Length);
                    context.Response.Close();
                }
                catch { }
            }
        }

        private static void ProcessContext(HttpListenerContext context)
        {
            HttpListenerRequest req = context.Request;
            HttpListenerResponse res = context.Response;

            // Enable CORS headers for cross-origin or local receiver communication
            res.AddHeader("Access-Control-Allow-Origin", "*");
            res.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
            res.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Device-Token");

            if (req.HttpMethod.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                res.StatusCode = 200;
                res.Close();
                return;
            }

            _lastActivity = DateTime.UtcNow;

            string rawUrl = req.Url.AbsolutePath;

            // Route: POST /api/exit (Explicit Clean App Shutdown from Exit Protocol)
            if (rawUrl.Equals("/api/exit", StringComparison.OrdinalIgnoreCase) &&
                req.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase))
            {
                CloseAllSerialPorts();
                res.ContentType = "application/json; charset=utf-8";
                byte[] exitBytes = Encoding.UTF8.GetBytes("{\"status\":\"EXIT_INITIATED\"}");
                res.OutputStream.Write(exitBytes, 0, exitBytes.Length);
                res.Close();
                _exitRequested = true;
                new Thread(() => {
                    Thread.Sleep(100);
                    Environment.Exit(0);
                }).Start();
                return;
            }

            // Route: DELETE /api/events or /api/events?clear=true
            if (rawUrl.Equals("/api/events", StringComparison.OrdinalIgnoreCase) && 
                (req.HttpMethod.Equals("DELETE", StringComparison.OrdinalIgnoreCase) || req.QueryString["clear"] == "true"))
            {
                lock (_lock)
                {
                    _eventsJsonList.Clear();
                    SaveIncidents();
                }
                res.ContentType = "application/json; charset=utf-8";
                res.StatusCode = 200;
                byte[] okBytes = Encoding.UTF8.GetBytes("{\"status\":\"OK\",\"message\":\"All events cleared\"}");
                res.OutputStream.Write(okBytes, 0, okBytes.Length);
                res.Close();
                return;
            }

            // Route: GET /api/events
            if (rawUrl.Equals("/api/events", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                HandleGetEvents(res);
                return;
            }

            // Route: POST /api/events or POST /api/upload (ESP32 LoRa Receiver Base Station Ingestion)
            if ((rawUrl.Equals("/api/upload", StringComparison.OrdinalIgnoreCase) || rawUrl.Equals("/api/events", StringComparison.OrdinalIgnoreCase)) 
                && req.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase))
            {
                HandlePostUpload(req, res);
                return;
            }

            // Route: GET /api/status
            if (rawUrl.Equals("/api/status", StringComparison.OrdinalIgnoreCase))
            {
                res.ContentType = "application/json; charset=utf-8";
                string ipsJson = "[" + string.Join(",", _localLanIPs.ConvertAll(ip => "\"" + ip + "\"").ToArray()) + "]";
                string portsJson = "[" + string.Join(",", new List<string>(_connectedPortNames).ConvertAll(p => "\"" + p + "\"").ToArray()) + "]";

                string statusJson = string.Format("{{\"status\":\"ONLINE\",\"port\":{0},\"mode\":\"STANDALONE_DESKTOP\",\"activeSerialPort\":\"{1}\",\"connectedPorts\":{2},\"localIPs\":{3},\"eventsCount\":{4},\"registrationsCount\":{5},\"timestamp\":\"{6}\"}}",
                    _port, _lastDetectedPort, portsJson, ipsJson, _eventsJsonList.Count, _registrations.Count, DateTime.UtcNow.ToString("o"));
                byte[] statusBytes = Encoding.UTF8.GetBytes(statusJson);
                res.OutputStream.Write(statusBytes, 0, statusBytes.Length);
                res.Close();
                return;
            }

            // Route: POST /api/register or POST /api/registrations
            if ((rawUrl.Equals("/api/register", StringComparison.OrdinalIgnoreCase) || rawUrl.Equals("/api/registrations", StringComparison.OrdinalIgnoreCase)) 
                && req.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase))
            {
                HandlePostRegister(req, res);
                return;
            }

            // Route: POST /api/events/rescue or POST /api/rescue (Clearance protocol)
            if ((rawUrl.Equals("/api/events/rescue", StringComparison.OrdinalIgnoreCase) || rawUrl.Equals("/api/rescue", StringComparison.OrdinalIgnoreCase)) 
                && req.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase))
            {
                HandlePostRescue(req, res);
                return;
            }

            // Route: GET /api/registrations
            if (rawUrl.Equals("/api/registrations", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                HandleGetRegistrations(res);
                return;
            }

            // Route: GET /api/ai/hotspots (Spatial Haversine DBSCAN Hotspot Prediction)
            if (rawUrl.Equals("/api/ai/hotspots", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                HandleGetAiHotspots(res);
                return;
            }

            // Route: GET or POST /api/ai/report (Local LLM Incident Intelligence Brief)
            if (rawUrl.Equals("/api/ai/report", StringComparison.OrdinalIgnoreCase))
            {
                HandleGetAiReport(req, res);
                return;
            }

            // Route: GET /api/health (Discovery & System Health Check)
            if (rawUrl.Equals("/api/health", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                res.ContentType = "application/json; charset=utf-8";
                res.StatusCode = 200;
                string healthJson = string.Format("{{\"status\":\"HEALTHY\",\"port\":{0},\"mode\":\"STANDALONE_DESKTOP\",\"timestamp\":\"{1}\"}}", _port, DateTime.UtcNow.ToString("o"));
                byte[] healthBytes = Encoding.UTF8.GetBytes(healthJson);
                res.OutputStream.Write(healthBytes, 0, healthBytes.Length);
                res.Close();
                return;
            }

            // Route: GET /api/ping/recent (Last N LoRa Ping Records)
            if (rawUrl.StartsWith("/api/ping/recent", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                HandleGetPingRecent(req, res);
                return;
            }

            // Route: GET /api/ping/summary (Aggregated Latency, Jitter, Loss & Path Loss Summary)
            if (rawUrl.Equals("/api/ping/summary", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                HandleGetPingSummary(res);
                return;
            }

            // Route: GET /api/ping/export.csv (CSV Export for Field Tests)
            if (rawUrl.Equals("/api/ping/export.csv", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                HandleGetPingExportCsv(res);
                return;
            }

            // Route: POST /api/ping (Wi-Fi Receiver Direct Ingestion)
            if (rawUrl.Equals("/api/ping", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase))
            {
                HandlePostPing(req, res);
                return;
            }

            // Route: GET or POST /api/station (Base Station Coordinates Config)
            if (rawUrl.Equals("/api/station", StringComparison.OrdinalIgnoreCase))
            {
                if (req.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase))
                {
                    HandlePostStationConfig(req, res);
                }
                else
                {
                    HandleGetStationConfig(res);
                }
                return;
            }

            // Route: POST /api/station/detect (Attempt Windows Location Service Auto-Fix)
            if (rawUrl.Equals("/api/station/detect", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase))
            {
                HandleDetectStationLocation(res);
                return;
            }

            // Static File Serving from www/
            ServeStaticFile(rawUrl, res);
        }

        private static void HandleGetAiHotspots(HttpListenerResponse res)
        {
            res.ContentType = "application/json; charset=utf-8";
            List<IncidentRecord> records = ParseIncidentRecords();
            List<AccidentCluster> hotspots = HotspotPredictor.ComputeHotspots(records, 150.0, 3);

            StringBuilder sb = new StringBuilder();
            sb.Append("{\"hotspots\":[");
            for (int i = 0; i < hotspots.Count; i++)
            {
                var h = hotspots[i];
                string hoursJson = "[" + string.Join(",", h.PeakRiskHours.ConvertAll(delegate(string hr) { return "\"" + hr + "\""; }).ToArray()) + "]";
                sb.Append(string.Format(
                    System.Globalization.CultureInfo.InvariantCulture,
                    "{{\"clusterId\":\"{0}\",\"centerLat\":{1:F6},\"centerLon\":{2:F6},\"radiusMeters\":{3:F1},\"incidentCount\":{4},\"hotspotDangerIndex\":{5:F2},\"riskTier\":\"{6}\",\"meanImpactG\":{7:F2},\"meanPreCrashSpeedKmh\":{8:F1},\"peakRiskHours\":{9},\"dominantAccidentType\":\"{10}\"}}",
                    h.ClusterId, h.CenterLat, h.CenterLon, h.RadiusMeters, h.IncidentCount, h.HotspotDangerIndex, h.RiskTier, h.MeanImpactG, h.MeanPreCrashSpeedKmh, hoursJson, h.DominantAccidentType ?? "Impact Collision"
                ));
                if (i < hotspots.Count - 1) sb.Append(",");
            }
            sb.Append(string.Format(
                System.Globalization.CultureInfo.InvariantCulture,
                "],\"totalAnalyzed\":{0},\"hotspotCount\":{1},\"timestamp\":\"{2}\"}}",
                records.Count, hotspots.Count, DateTime.UtcNow.ToString("o")
            ));

            byte[] data = Encoding.UTF8.GetBytes(sb.ToString());
            res.OutputStream.Write(data, 0, data.Length);
            res.Close();
        }

        private static void HandleGetAiReport(HttpListenerRequest req, HttpListenerResponse res)
        {
            res.ContentType = "application/json; charset=utf-8";
            List<IncidentRecord> records = ParseIncidentRecords();
            List<AccidentCluster> hotspots = HotspotPredictor.ComputeHotspots(records, 150.0, 3);

            DesktopAiReportGenerator gen = new DesktopAiReportGenerator();
            string executiveReport = gen.GenerateExecutiveReport(hotspots, records.Count);

            string escapedReport = executiveReport.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "").Replace("\n", "\\n");
            string json = string.Format(
                System.Globalization.CultureInfo.InvariantCulture,
                "{{\"status\":\"OK\",\"reportMarkdown\":\"{0}\",\"hotspotsCount\":{1},\"totalAnalyzed\":{2},\"timestamp\":\"{3}\"}}",
                escapedReport, hotspots.Count, records.Count, DateTime.UtcNow.ToString("o")
            );

            byte[] data = Encoding.UTF8.GetBytes(json);
            res.OutputStream.Write(data, 0, data.Length);
            res.Close();
        }

        private static string EscapeJsonString(string s)
        {
            if (string.IsNullOrEmpty(s)) return "";
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "").Replace("\n", "\\n");
        }

        private static void LoadStationConfig()
        {
            try
            {
                if (File.Exists(_stationConfigPath))
                {
                    string json = File.ReadAllText(_stationConfigPath, Encoding.UTF8);
                    string latStr = ExtractField(json, "lat");
                    string lonStr = ExtractField(json, "lon");
                    string labelStr = ExtractField(json, "label");
                    string srcStr = ExtractField(json, "source");
                    string accStr = ExtractField(json, "accuracyM");
                    string updStr = ExtractField(json, "updatedUtc");

                    double latVal, lonVal, accVal;
                    if (!string.IsNullOrEmpty(latStr) && double.TryParse(latStr, NumberStyles.Float, CultureInfo.InvariantCulture, out latVal))
                        _stationLat = latVal;
                    if (!string.IsNullOrEmpty(lonStr) && double.TryParse(lonStr, NumberStyles.Float, CultureInfo.InvariantCulture, out lonVal))
                        _stationLon = lonVal;
                    if (!string.IsNullOrEmpty(labelStr)) _stationLabel = labelStr;
                    if (!string.IsNullOrEmpty(srcStr)) _stationSource = srcStr;
                    if (!string.IsNullOrEmpty(accStr) && double.TryParse(accStr, NumberStyles.Float, CultureInfo.InvariantCulture, out accVal))
                        _stationAccuracyM = accVal;
                    DateTime dt;
                    if (!string.IsNullOrEmpty(updStr) && DateTime.TryParse(updStr, null, DateTimeStyles.AdjustToUniversal, out dt))
                        _stationUpdatedUtc = dt;
                }
                else
                {
                    _stationLat = 17.613200;
                    _stationLon = 121.727000;
                    _stationLabel = "Base Station (KM 42 Tuguegarao)";
                    _stationSource = "manual";
                    _stationAccuracyM = null;
                    SaveStationConfig();
                }
            }
            catch { }
        }

        private static void SaveStationConfig()
        {
            try
            {
                StringBuilder sb = new StringBuilder();
                sb.Append("{");
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"lat\":{0},", _stationLat.HasValue ? _stationLat.Value.ToString("0.000000", CultureInfo.InvariantCulture) : "null");
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"lon\":{0},", _stationLon.HasValue ? _stationLon.Value.ToString("0.000000", CultureInfo.InvariantCulture) : "null");
                sb.AppendFormat("\"label\":\"{0}\",", EscapeJsonString(_stationLabel));
                sb.AppendFormat("\"source\":\"{0}\",", EscapeJsonString(_stationSource));
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"accuracyM\":{0},", _stationAccuracyM.HasValue ? _stationAccuracyM.Value.ToString("0.0", CultureInfo.InvariantCulture) : "null");
                sb.AppendFormat("\"updatedUtc\":\"{0}\"", _stationUpdatedUtc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
                sb.Append("}");
                File.WriteAllText(_stationConfigPath, sb.ToString(), Encoding.UTF8);
            }
            catch { }
        }

        private static void RecordPing(string payload, string via, DateTime ingestTime)
        {
            try
            {
                string token = ExtractField(payload, "token");
                if (string.IsNullOrEmpty(token)) token = ExtractField(payload, "deviceToken");
                if (string.IsNullOrEmpty(token)) token = "UNKNOWN";

                string seqStr = ExtractField(payload, "seq");
                if (string.IsNullOrEmpty(seqStr)) seqStr = ExtractField(payload, "pingSequence");
                long seq = 0;
                long.TryParse(seqStr, out seq);

                string latStr = ExtractField(payload, "lat");
                if (string.IsNullOrEmpty(latStr)) latStr = ExtractField(payload, "latitude");
                double lat = 0.0;
                double.TryParse(latStr, NumberStyles.Float, CultureInfo.InvariantCulture, out lat);

                string lonStr = ExtractField(payload, "lon");
                if (string.IsNullOrEmpty(lonStr)) lonStr = ExtractField(payload, "longitude");
                double lon = 0.0;
                double.TryParse(lonStr, NumberStyles.Float, CultureInfo.InvariantCulture, out lon);

                string phoneEpochStr = ExtractField(payload, "phoneEpoch");
                if (string.IsNullOrEmpty(phoneEpochStr)) phoneEpochStr = ExtractField(payload, "phoneEpochMs");
                long phoneEpoch = 0;
                long.TryParse(phoneEpochStr, out phoneEpoch);

                string rssiStr = ExtractField(payload, "rssi");
                int rssi = -999;
                int.TryParse(rssiStr, out rssi);

                string snrStr = ExtractField(payload, "snr");
                double snr = 0.0;
                double.TryParse(snrStr, NumberStyles.Float, CultureInfo.InvariantCulture, out snr);

                string airtimeStr = ExtractField(payload, "airtimeMs");
                double airtime = 246.8;
                if (!string.IsNullOrEmpty(airtimeStr))
                    double.TryParse(airtimeStr, NumberStyles.Float, CultureInfo.InvariantCulture, out airtime);

                bool noFix = (Math.Abs(lat) < 0.000001 && Math.Abs(lon) < 0.000001) ||
                             string.Equals(ExtractField(payload, "noFix"), "true", StringComparison.OrdinalIgnoreCase);

                long t2Ms = (long)(ingestTime - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
                long latencyMs = t2Ms - phoneEpoch;

                double? distanceM = null;
                if (!noFix && _stationLat.HasValue && _stationLon.HasValue)
                {
                    distanceM = HotspotPredictor.CalculateHaversineDistance(_stationLat.Value, _stationLon.Value, lat, lon);
                }

                long? jitterMs = null;
                lock (_pingLock)
                {
                    PingTokenState prev;
                    if (_lastPingByToken.TryGetValue(token, out prev))
                    {
                        long t2Diff = t2Ms - prev.T2Ms;
                        long t0Diff = phoneEpoch - prev.T0Ms;
                        jitterMs = Math.Abs(t2Diff - t0Diff);
                    }
                    _lastPingByToken[token] = new PingTokenState { T2Ms = t2Ms, T0Ms = phoneEpoch };
                }

                bool clockSkewSuspect = (latencyMs < 0 || latencyMs < (long)airtime);

                StringBuilder sb = new StringBuilder();
                sb.Append("{");
                sb.Append("\"v\":1,");
                sb.AppendFormat("\"recvUtc\":\"{0}\",", ingestTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
                sb.AppendFormat("\"t2Ms\":{0},", t2Ms);
                sb.AppendFormat("\"via\":\"{0}\",", via);
                sb.AppendFormat("\"token\":\"{0}\",", EscapeJsonString(token));
                sb.AppendFormat("\"seq\":{0},", seq);
                sb.AppendFormat("\"t0Ms\":{0},", phoneEpoch);
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"airtimeMs\":{0:0.0},", airtime);
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"lat\":{0:0.000000},", lat);
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"lon\":{0:0.000000},", lon);
                sb.AppendFormat("\"noFix\":{0},", noFix ? "true" : "false");
                sb.AppendFormat("\"rssi\":{0},", rssi);
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"snr\":{0:0.0},", snr);
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"stationLat\":{0},", _stationLat.HasValue ? _stationLat.Value.ToString("0.000000", CultureInfo.InvariantCulture) : "null");
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"stationLon\":{0},", _stationLon.HasValue ? _stationLon.Value.ToString("0.000000", CultureInfo.InvariantCulture) : "null");
                sb.AppendFormat("\"stationSrc\":\"{0}\",", EscapeJsonString(_stationSource));
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"stationAccM\":{0},", _stationAccuracyM.HasValue ? _stationAccuracyM.Value.ToString("0.0", CultureInfo.InvariantCulture) : "null");
                sb.AppendFormat(CultureInfo.InvariantCulture, "\"distanceM\":{0},", distanceM.HasValue ? distanceM.Value.ToString("0.0", CultureInfo.InvariantCulture) : "null");
                sb.AppendFormat("\"latencyMs\":{0},", latencyMs);
                sb.AppendFormat("\"jitterMs\":{0},", jitterMs.HasValue ? jitterMs.Value.ToString() : "null");
                sb.AppendFormat("\"clockSkewSuspect\":{0}", clockSkewSuspect ? "true" : "false");
                sb.Append("}");

                string recordJson = sb.ToString();

                lock (_pingLock)
                {
                    if (!string.IsNullOrEmpty(_pingLogPath))
                    {
                        File.AppendAllText(_pingLogPath, recordJson + "\n", Encoding.UTF8);
                    }
                    _recentPingsBuffer.Insert(0, recordJson);
                    if (_recentPingsBuffer.Count > 200)
                    {
                        _recentPingsBuffer.RemoveAt(_recentPingsBuffer.Count - 1);
                    }
                }
            }
            catch { }
        }

        private static void HandleGetPingRecent(HttpListenerRequest req, HttpListenerResponse res)
        {
            res.ContentType = "application/json; charset=utf-8";
            int limit = 50;
            string nStr = req.QueryString["n"];
            if (!string.IsNullOrEmpty(nStr)) int.TryParse(nStr, out limit);
            if (limit <= 0) limit = 50;
            if (limit > 200) limit = 200;

            StringBuilder sb = new StringBuilder();
            sb.Append("[");
            lock (_pingLock)
            {
                int count = Math.Min(limit, _recentPingsBuffer.Count);
                for (int i = 0; i < count; i++)
                {
                    if (i > 0) sb.Append(",");
                    sb.Append(_recentPingsBuffer[i]);
                }
            }
            sb.Append("]");
            byte[] bytes = Encoding.UTF8.GetBytes(sb.ToString());
            res.OutputStream.Write(bytes, 0, bytes.Length);
            res.Close();
        }

        private static void HandleGetPingSummary(HttpListenerResponse res)
        {
            res.ContentType = "application/json; charset=utf-8";
            List<string> snapshot = new List<string>();
            lock (_pingLock)
            {
                snapshot.AddRange(_recentPingsBuffer);
            }

            int count = snapshot.Count;
            long minSeq = long.MaxValue, maxSeq = long.MinValue;
            List<double> latenciesSerial = new List<double>();
            List<double> latenciesHttp = new List<double>();
            List<double> jitters = new List<double>();
            List<double> distances = new List<double>();
            List<double> logDistances = new List<double>();
            List<double> rssiList = new List<double>();
            double lastSnr = 0.0;
            int skewCount = 0;

            for (int i = 0; i < count; i++)
            {
                string p = snapshot[i];
                string sSeq = ExtractField(p, "seq");
                long seqVal;
                if (long.TryParse(sSeq, out seqVal))
                {
                    if (seqVal < minSeq) minSeq = seqVal;
                    if (seqVal > maxSeq) maxSeq = seqVal;
                }

                string via = ExtractField(p, "via") ?? "serial";
                string sLat = ExtractField(p, "latencyMs");
                double latVal;
                if (double.TryParse(sLat, NumberStyles.Float, CultureInfo.InvariantCulture, out latVal))
                {
                    if (via.Equals("http", StringComparison.OrdinalIgnoreCase)) latenciesHttp.Add(latVal);
                    else latenciesSerial.Add(latVal);
                }

                string sJit = ExtractField(p, "jitterMs");
                double jitVal;
                if (!string.IsNullOrEmpty(sJit) && double.TryParse(sJit, NumberStyles.Float, CultureInfo.InvariantCulture, out jitVal))
                {
                    jitters.Add(jitVal);
                }

                string sDist = ExtractField(p, "distanceM");
                string sNoFix = ExtractField(p, "noFix");
                double distVal;
                if (!string.Equals(sNoFix, "true", StringComparison.OrdinalIgnoreCase) &&
                    !string.IsNullOrEmpty(sDist) && double.TryParse(sDist, NumberStyles.Float, CultureInfo.InvariantCulture, out distVal))
                {
                    if (distVal > 0)
                    {
                        distances.Add(distVal);
                        string sRssi = ExtractField(p, "rssi");
                        double rVal;
                        if (double.TryParse(sRssi, NumberStyles.Float, CultureInfo.InvariantCulture, out rVal))
                        {
                            logDistances.Add(Math.Log10(distVal));
                            rssiList.Add(rVal);
                        }
                    }
                }

                if (i == 0)
                {
                    string sSnr = ExtractField(p, "snr");
                    double.TryParse(sSnr, NumberStyles.Float, CultureInfo.InvariantCulture, out lastSnr);
                }

                if (string.Equals(ExtractField(p, "clockSkewSuspect"), "true", StringComparison.OrdinalIgnoreCase))
                {
                    skewCount++;
                }
            }

            double lossPct = 0.0;
            if (minSeq <= maxSeq && maxSeq > 0)
            {
                long expected = maxSeq - minSeq + 1;
                if (expected > count)
                {
                    lossPct = ((double)(expected - count) / expected) * 100.0;
                }
            }

            latenciesSerial.Sort();
            latenciesHttp.Sort();
            distances.Sort();

            double p50Serial = latenciesSerial.Count > 0 ? latenciesSerial[latenciesSerial.Count / 2] : 0.0;
            double p95Serial = latenciesSerial.Count > 0 ? latenciesSerial[(int)(latenciesSerial.Count * 0.95)] : 0.0;
            double maxSerial = latenciesSerial.Count > 0 ? latenciesSerial[latenciesSerial.Count - 1] : 0.0;

            double p50Http = latenciesHttp.Count > 0 ? latenciesHttp[latenciesHttp.Count / 2] : 0.0;
            double p95Http = latenciesHttp.Count > 0 ? latenciesHttp[(int)(latenciesHttp.Count * 0.95)] : 0.0;
            double maxHttp = latenciesHttp.Count > 0 ? latenciesHttp[latenciesHttp.Count - 1] : 0.0;

            double meanJitter = 0.0;
            if (jitters.Count > 0)
            {
                double sum = 0;
                for (int j = 0; j < jitters.Count; j++) sum += jitters[j];
                meanJitter = sum / jitters.Count;
            }

            double minDist = distances.Count > 0 ? distances[0] : 0.0;
            double medDist = distances.Count > 0 ? distances[distances.Count / 2] : 0.0;
            double maxDist = distances.Count > 0 ? distances[distances.Count - 1] : 0.0;

            double pathLossN = 0.0, pathLossK = 0.0, pathLossR2 = 0.0;
            if (logDistances.Count >= 10)
            {
                int nPts = logDistances.Count;
                double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
                for (int k = 0; k < nPts; k++)
                {
                    double x = logDistances[k];
                    double y = rssiList[k];
                    sumX += x;
                    sumY += y;
                    sumXY += x * y;
                    sumX2 += x * x;
                    sumY2 += y * y;
                }
                double denom = (nPts * sumX2 - sumX * sumX);
                if (Math.Abs(denom) > 1e-9)
                {
                    double slope = (nPts * sumXY - sumX * sumY) / denom;
                    double intercept = (sumY - slope * sumX) / nPts;
                    pathLossK = intercept;
                    pathLossN = -slope / 10.0;

                    double rDenom = Math.Sqrt((nPts * sumX2 - sumX * sumX) * (nPts * sumY2 - sumY * sumY));
                    if (rDenom > 1e-9)
                    {
                        double r = (nPts * sumXY - sumX * sumY) / rDenom;
                        pathLossR2 = r * r;
                    }
                }
            }

            double linkMargin = lastSnr - (-12.5); // Demodulation floor for SF9: -12.5 dB

            StringBuilder sb = new StringBuilder();
            sb.Append("{");
            sb.AppendFormat("\"totalRecords\":{0},", count);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"packetLossPct\":{0:0.1},", lossPct);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"serialLatencyP50\":{0:0.0},", p50Serial);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"serialLatencyP95\":{0:0.0},", p95Serial);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"serialLatencyMax\":{0:0.0},", maxSerial);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"httpLatencyP50\":{0:0.0},", p50Http);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"httpLatencyP95\":{0:0.0},", p95Http);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"httpLatencyMax\":{0:0.0},", maxHttp);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"meanJitterMs\":{0:0.1},", meanJitter);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"distanceMinM\":{0:0.0},", minDist);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"distanceMedianM\":{0:0.0},", medDist);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"distanceMaxM\":{0:0.0},", maxDist);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"pathLossN\":{0:0.2},", pathLossN);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"pathLossK\":{0:0.1},", pathLossK);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"pathLossR2\":{0:0.3},", pathLossR2);
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"linkMarginDb\":{0:0.1},", linkMargin);
            sb.AppendFormat("\"clockSkewSuspectCount\":{0}", skewCount);
            sb.Append("}");

            byte[] bytes = Encoding.UTF8.GetBytes(sb.ToString());
            res.OutputStream.Write(bytes, 0, bytes.Length);
            res.Close();
        }

        private static void HandleGetPingExportCsv(HttpListenerResponse res)
        {
            res.ContentType = "text/csv; charset=utf-8";
            res.Headers.Add("Content-Disposition", "attachment; filename=\"rams_ping_export.csv\"");

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("recvUtc,via,token,seq,t0Ms,t2Ms,latencyMs,jitterMs,airtimeMs,lat,lon,noFix,rssi,snr,stationLat,stationLon,distanceM,clockSkewSuspect");

            lock (_pingLock)
            {
                if (File.Exists(_pingLogPath))
                {
                    using (StreamReader sr = new StreamReader(_pingLogPath, Encoding.UTF8))
                    {
                        string line;
                        while ((line = sr.ReadLine()) != null)
                        {
                            if (string.IsNullOrEmpty(line)) continue;
                            sb.AppendFormat(CultureInfo.InvariantCulture, "{0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11},{12},{13},{14},{15},{16},{17}\n",
                                ExtractField(line, "recvUtc") ?? "",
                                ExtractField(line, "via") ?? "serial",
                                ExtractField(line, "token") ?? "",
                                ExtractField(line, "seq") ?? "0",
                                ExtractField(line, "t0Ms") ?? "0",
                                ExtractField(line, "t2Ms") ?? "0",
                                ExtractField(line, "latencyMs") ?? "0",
                                ExtractField(line, "jitterMs") ?? "",
                                ExtractField(line, "airtimeMs") ?? "246.8",
                                ExtractField(line, "lat") ?? "0",
                                ExtractField(line, "lon") ?? "0",
                                ExtractField(line, "noFix") ?? "false",
                                ExtractField(line, "rssi") ?? "-999",
                                ExtractField(line, "snr") ?? "0",
                                ExtractField(line, "stationLat") ?? "",
                                ExtractField(line, "stationLon") ?? "",
                                ExtractField(line, "distanceM") ?? "",
                                ExtractField(line, "clockSkewSuspect") ?? "false");
                        }
                    }
                }
            }

            byte[] bytes = Encoding.UTF8.GetBytes(sb.ToString());
            res.OutputStream.Write(bytes, 0, bytes.Length);
            res.Close();
        }

        private static void HandleGetStationConfig(HttpListenerResponse res)
        {
            res.ContentType = "application/json; charset=utf-8";
            StringBuilder sb = new StringBuilder();
            sb.Append("{");
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"lat\":{0},", _stationLat.HasValue ? _stationLat.Value.ToString("0.000000", CultureInfo.InvariantCulture) : "null");
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"lon\":{0},", _stationLon.HasValue ? _stationLon.Value.ToString("0.000000", CultureInfo.InvariantCulture) : "null");
            sb.AppendFormat("\"label\":\"{0}\",", EscapeJsonString(_stationLabel));
            sb.AppendFormat("\"source\":\"{0}\",", EscapeJsonString(_stationSource));
            sb.AppendFormat(CultureInfo.InvariantCulture, "\"accuracyM\":{0},", _stationAccuracyM.HasValue ? _stationAccuracyM.Value.ToString("0.0", CultureInfo.InvariantCulture) : "null");
            sb.AppendFormat("\"updatedUtc\":\"{0}\"", _stationUpdatedUtc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
            sb.Append("}");
            byte[] bytes = Encoding.UTF8.GetBytes(sb.ToString());
            res.OutputStream.Write(bytes, 0, bytes.Length);
            res.Close();
        }

        private static void HandlePostStationConfig(HttpListenerRequest req, HttpListenerResponse res)
        {
            res.ContentType = "application/json; charset=utf-8";
            string body = "";
            using (StreamReader sr = new StreamReader(req.InputStream, req.ContentEncoding))
            {
                body = sr.ReadToEnd();
            }

            string latStr = ExtractField(body, "lat");
            string lonStr = ExtractField(body, "lon");
            string labelStr = ExtractField(body, "label");

            double latVal, lonVal;
            if (!string.IsNullOrEmpty(latStr) && double.TryParse(latStr, NumberStyles.Float, CultureInfo.InvariantCulture, out latVal))
                _stationLat = latVal;
            if (!string.IsNullOrEmpty(lonStr) && double.TryParse(lonStr, NumberStyles.Float, CultureInfo.InvariantCulture, out lonVal))
                _stationLon = lonVal;
            if (!string.IsNullOrEmpty(labelStr))
                _stationLabel = labelStr;

            _stationSource = "manual";
            _stationAccuracyM = null;
            _stationUpdatedUtc = DateTime.UtcNow;
            SaveStationConfig();

            res.StatusCode = 200;
            byte[] bytes = Encoding.UTF8.GetBytes("{\"status\":\"OK\",\"message\":\"Station coordinates updated\"}");
            res.OutputStream.Write(bytes, 0, bytes.Length);
            res.Close();
        }

        private static void HandleDetectStationLocation(HttpListenerResponse res)
        {
            res.ContentType = "application/json; charset=utf-8";
            bool success = false;
            try
            {
                Type watcherType = Type.GetType("System.Device.Location.GeoCoordinateWatcher, System.Device, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089");
                if (watcherType != null)
                {
                    object watcher = Activator.CreateInstance(watcherType);
                    MethodInfo tryStart = watcherType.GetMethod("TryStart", new Type[] { typeof(bool), typeof(TimeSpan) });
                    if (tryStart != null)
                    {
                        bool started = (bool)tryStart.Invoke(watcher, new object[] { false, TimeSpan.FromSeconds(8) });
                        if (started)
                        {
                            PropertyInfo posProp = watcherType.GetProperty("Position");
                            object pos = posProp.GetValue(watcher, null);
                            if (pos != null)
                            {
                                PropertyInfo locProp = pos.GetType().GetProperty("Location");
                                object loc = locProp.GetValue(pos, null);
                                if (loc != null)
                                {
                                    PropertyInfo isUnknownProp = loc.GetType().GetProperty("IsUnknown");
                                    bool isUnknown = (bool)isUnknownProp.GetValue(loc, null);
                                    PropertyInfo accProp = loc.GetType().GetProperty("HorizontalAccuracy");
                                    double acc = (double)accProp.GetValue(loc, null);
                                    if (!isUnknown && acc > 0 && acc <= 50)
                                    {
                                        PropertyInfo latProp = loc.GetType().GetProperty("Latitude");
                                        PropertyInfo lonProp = loc.GetType().GetProperty("Longitude");
                                        _stationLat = (double)latProp.GetValue(loc, null);
                                        _stationLon = (double)lonProp.GetValue(loc, null);
                                        _stationAccuracyM = acc;
                                        _stationSource = "windows";
                                        _stationUpdatedUtc = DateTime.UtcNow;
                                        SaveStationConfig();
                                        success = true;
                                    }
                                }
                            }
                        }
                    }
                    MethodInfo stop = watcherType.GetMethod("Stop");
                    if (stop != null) stop.Invoke(watcher, null);
                }
            }
            catch { }

            string status = success ? "OK" : "REJECTED_OR_UNAVAILABLE";
            string json = string.Format("{{\"status\":\"{0}\",\"source\":\"{1}\",\"lat\":{2},\"lon\":{3},\"accuracyM\":{4}}}",
                status, _stationSource,
                _stationLat.HasValue ? _stationLat.Value.ToString("0.000000", CultureInfo.InvariantCulture) : "null",
                _stationLon.HasValue ? _stationLon.Value.ToString("0.000000", CultureInfo.InvariantCulture) : "null",
                _stationAccuracyM.HasValue ? _stationAccuracyM.Value.ToString("0.0", CultureInfo.InvariantCulture) : "null");
            byte[] bytes = Encoding.UTF8.GetBytes(json);
            res.OutputStream.Write(bytes, 0, bytes.Length);
            res.Close();
        }

        private static void HandlePostPing(HttpListenerRequest req, HttpListenerResponse res)
        {
            string body = "";
            using (StreamReader sr = new StreamReader(req.InputStream, req.ContentEncoding))
            {
                body = sr.ReadToEnd();
            }
            RecordPing(body, "http", DateTime.UtcNow);
            res.ContentType = "application/json; charset=utf-8";
            res.StatusCode = 200;
            byte[] bytes = Encoding.UTF8.GetBytes("{\"status\":\"OK\"}");
            res.OutputStream.Write(bytes, 0, bytes.Length);
            res.Close();
        }

        private static List<IncidentRecord> ParseIncidentRecords()
        {
            List<IncidentRecord> list = new List<IncidentRecord>();
            lock (_lock)
            {
                foreach (string json in _eventsJsonList)
                {
                    try
                    {
                        string latStr = ExtractField(json, "lat");
                        string lonStr = ExtractField(json, "lon");
                        double lat, lon;
                        if (!double.TryParse(latStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out lat)) continue;
                        if (!double.TryParse(lonStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out lon)) continue;
                        if (lat == 0.0 && lon == 0.0) continue;

                        string aMagStr = ExtractField(json, "aMag");
                        double aMag = 1.0;
                        if (!string.IsNullOrEmpty(aMagStr))
                        {
                            double.TryParse(aMagStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out aMag);
                        }

                        string speedStr = ExtractField(json, "speedKmh");
                        if (string.IsNullOrEmpty(speedStr)) speedStr = ExtractField(json, "speed");
                        double speed = 0.0;
                        if (!string.IsNullOrEmpty(speedStr))
                        {
                            double.TryParse(speedStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out speed);
                        }

                        string id = ExtractField(json, "id");
                        if (string.IsNullOrEmpty(id)) id = Guid.NewGuid().ToString();

                        string type = ExtractField(json, "type");
                        if (string.IsNullOrEmpty(type)) type = "alert";

                        string status = ExtractField(json, "status") ?? "";
                        string notes = ExtractField(json, "notes") ?? "";
                        string dateStr = ExtractField(json, "createdAt") ?? "";

                        DateTime dt = DateTime.UtcNow;
                        if (!string.IsNullOrEmpty(dateStr))
                        {
                            DateTime.TryParse(dateStr, out dt);
                        }

                        bool unresponsive = status.IndexOf("unresponsive", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                            notes.IndexOf("unresponsive", StringComparison.OrdinalIgnoreCase) >= 0;

                        string eventTypeName = ExtractField(json, "eventTypeName");
                        if (string.IsNullOrEmpty(eventTypeName))
                        {
                            string itemTitle = (ExtractField(json, "title") ?? "").ToLowerInvariant();
                            if (itemTitle.Contains("skid") || itemTitle.Contains("traction")) eventTypeName = "Skid / Loss of Traction";
                            else if (itemTitle.Contains("fall")) eventTypeName = "Rider Fall Detected";
                            else eventTypeName = "Direct High-G Impact";
                        }

                        IncidentRecord rec = new IncidentRecord();
                        rec.IncidentId = id;
                        rec.Latitude = lat;
                        rec.Longitude = lon;
                        rec.PeakG = aMag;
                        rec.SpeedKmh = speed;
                        rec.EventType = eventTypeName;
                        rec.TimestampUtc = dt;
                        rec.IsUnresponsive = unresponsive;
                        rec.StreetName = ExtractField(json, "locationAddress") ?? "";

                        list.Add(rec);
                    }
                    catch { }
                }
            }
            return list;
        }

        private static void HandleGetEvents(HttpListenerResponse res)
        {
            res.ContentType = "application/json; charset=utf-8";
            StringBuilder sb = new StringBuilder();
            sb.Append("{\"events\":[");
            lock (_lock)
            {
                for (int i = 0; i < _eventsJsonList.Count; i++)
                {
                    sb.Append(_eventsJsonList[i]);
                    if (i < _eventsJsonList.Count - 1) sb.Append(",");
                }
            }
            sb.Append(string.Format("],\"count\":{0}}}", _eventsJsonList.Count));

            byte[] data = Encoding.UTF8.GetBytes(sb.ToString());
            res.OutputStream.Write(data, 0, data.Length);
            res.Close();
        }

        private static void HandlePostUpload(HttpListenerRequest req, HttpListenerResponse res)
        {
            string body = "";
            using (var reader = new StreamReader(req.InputStream, req.ContentEncoding))
            {
                body = reader.ReadToEnd();
            }

            ProcessIncomingPayload(body, "RAMS-ALERT-");

            res.ContentType = "application/json; charset=utf-8";
            res.StatusCode = 200;
            string responseMsg = "{\"status\":\"OK\",\"message\":\"Payload processed successfully\"}";
            byte[] responseBytes = Encoding.UTF8.GetBytes(responseMsg);
            res.OutputStream.Write(responseBytes, 0, responseBytes.Length);
            res.Close();
        }

        private static void HandlePostRescue(HttpListenerRequest req, HttpListenerResponse res)
        {
            string body = "";
            using (var reader = new StreamReader(req.InputStream, req.ContentEncoding))
            {
                body = reader.ReadToEnd();
            }

            string eventId = ExtractField(body, "id") ?? ExtractField(body, "eventId") ?? req.QueryString["id"] ?? "";
            string token = ExtractField(body, "deviceToken") ?? ExtractField(body, "token") ?? req.QueryString["token"] ?? "";

            bool found = false;
            lock (_lock)
            {
                for (int i = 0; i < _eventsJsonList.Count; i++)
                {
                    string ev = _eventsJsonList[i];
                    string curId = ExtractField(ev, "id");
                    string curToken = ExtractField(ev, "deviceToken");

                    bool match = (!string.IsNullOrEmpty(eventId) && eventId.Equals(curId, StringComparison.OrdinalIgnoreCase)) ||
                                 (!string.IsNullOrEmpty(token) && token.Equals(curToken, StringComparison.OrdinalIgnoreCase));

                    if (match)
                    {
                        found = true;
                        string updated = ev;
                        if (updated.Contains("\"status\":"))
                        {
                            updated = System.Text.RegularExpressions.Regex.Replace(
                                updated,
                                "\"status\":\\s*\"[^\"]*\"",
                                "\"status\":\"RESCUED\""
                            );
                        }
                        else
                        {
                            updated = updated.TrimEnd('}') + ",\"status\":\"RESCUED\"}";
                        }
                        _eventsJsonList[i] = updated;
                    }
                }
                if (found)
                {
                    SaveIncidents();
                }
            }

            res.ContentType = "application/json; charset=utf-8";
            res.StatusCode = 200;
            string responseMsg = found ? "{\"status\":\"OK\",\"message\":\"Incident marked as RESCUED\"}" : "{\"status\":\"NOT_FOUND\",\"message\":\"No incident found matching identifier\"}";
            byte[] responseBytes = Encoding.UTF8.GetBytes(responseMsg);
            res.OutputStream.Write(responseBytes, 0, responseBytes.Length);
            res.Close();
        }

        private static void HandleGetRegistrations(HttpListenerResponse res)
        {
            res.ContentType = "application/json; charset=utf-8";
            StringBuilder sb = new StringBuilder();
            sb.Append("{\"registrations\":[");
            lock (_lock)
            {
                int count = 0;
                foreach (var kvp in _registrations)
                {
                    sb.Append(kvp.Value);
                    if (++count < _registrations.Count) sb.Append(",");
                }
            }
            sb.Append("]}");
            byte[] data = Encoding.UTF8.GetBytes(sb.ToString());
            res.OutputStream.Write(data, 0, data.Length);
            res.Close();
        }

        private static void HandlePostRegister(HttpListenerRequest req, HttpListenerResponse res)
        {
            string body = "";
            using (var reader = new StreamReader(req.InputStream, req.ContentEncoding))
            {
                body = reader.ReadToEnd();
            }

            string token = ExtractField(body, "token") ?? ExtractField(body, "deviceToken") ?? "";
            string name = ExtractField(body, "name") ?? ExtractField(body, "riderName") ?? ExtractField(body, "rider") ?? "";
            string rawPhoto = ExtractField(body, "photoUrl") ?? ExtractField(body, "driveLink") ?? ExtractField(body, "driveLinkConverted") ?? "";
            string photoUrl = ConvertGoogleDriveUrl(rawPhoto);
            string vehicle = ExtractField(body, "vehicleModel") ?? ExtractField(body, "vehicle") ?? "Motorcycle";
            string plate = ExtractField(body, "plateNumber") ?? ExtractField(body, "plate") ?? "EMERGENCY";
            string phone = ExtractField(body, "contactNumber") ?? ExtractField(body, "phone") ?? ExtractField(body, "contact") ?? "+63 900 000 0000";
            string emerName = ExtractField(body, "emergencyContactName") ?? "Dispatch EOC";
            string emerPhone = ExtractField(body, "emergencyContactPhone") ?? ExtractField(body, "emergencyPhone") ?? "+63 911 000 0000";
            string emerRel = ExtractField(body, "emergencyRelationship") ?? "Next of Kin";
            string blood = ExtractField(body, "bloodType") ?? ExtractField(body, "blood") ?? "O+";
            string allergies = ExtractField(body, "allergies") ?? "None";

            string regEntry = string.Format(
                System.Globalization.CultureInfo.InvariantCulture,
                "{{\"token\":\"{0}\",\"name\":\"{1}\",\"photoUrl\":\"{2}\",\"vehicleModel\":\"{3}\",\"plateNumber\":\"{4}\",\"contactNumber\":\"{5}\",\"emergencyContactName\":\"{6}\",\"emergencyContactPhone\":\"{7}\",\"emergencyRelationship\":\"{8}\",\"bloodType\":\"{9}\",\"allergies\":\"{10}\",\"updatedAt\":\"{11}\"}}",
                token, name, photoUrl, vehicle, plate, phone, emerName, emerPhone, emerRel, blood, allergies, DateTime.UtcNow.ToString("o")
            );

            lock (_lock)
            {
                _registrations[token] = regEntry;
                SaveRegistrations();

                // Retroactively enrich all existing events for this token
                for (int i = 0; i < _eventsJsonList.Count; i++)
                {
                    string ev = _eventsJsonList[i];
                    if (token.Equals(ExtractField(ev, "deviceToken"), StringComparison.OrdinalIgnoreCase))
                    {
                        string updated = ev;
                        if (!string.IsNullOrEmpty(photoUrl))
                        {
                            updated = System.Text.RegularExpressions.Regex.Replace(
                                updated,
                                "\"photoUrl\":\\s*\"[^\"]*\"",
                                "\"photoUrl\":\"" + photoUrl + "\""
                            );
                        }
                        if (!string.IsNullOrEmpty(name))
                        {
                            updated = System.Text.RegularExpressions.Regex.Replace(
                                updated,
                                "\"riderName\":\\s*\"[^\"]*\"",
                                "\"riderName\":\"" + name + "\""
                            );
                            updated = System.Text.RegularExpressions.Regex.Replace(
                                updated,
                                "\"deviceName\":\\s*\"[^\"]*\"",
                                "\"deviceName\":\"" + name + "\""
                            );
                        }
                        if (updated != ev)
                        {
                            _eventsJsonList[i] = updated;
                        }
                    }
                }
                SaveIncidents();
            }

            res.ContentType = "application/json; charset=utf-8";
            res.StatusCode = 200;
            string resp = string.Format("{{\"status\":\"OK\",\"message\":\"Rider profile saved\",\"token\":\"{0}\",\"name\":\"{1}\",\"photoUrl\":\"{2}\"}}", token, name, photoUrl);
            byte[] bytes = Encoding.UTF8.GetBytes(resp);
            res.OutputStream.Write(bytes, 0, bytes.Length);
            res.Close();
        }

        private static string BuildEventFromJsonOrForm(string payload, string eventId)
        {
            string eventField = ExtractField(payload, "event");
            string token = ExtractField(payload, "deviceToken") ?? ExtractField(payload, "token") ?? "";

            // If ping reaches here, ignore it and return null
            if (!string.IsNullOrEmpty(eventField) && eventField.Equals("LORA_PING", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            string packetType = "alert";
            if (!string.IsNullOrEmpty(eventField))
            {
                if (eventField.Equals("LORA_ALERT", StringComparison.OrdinalIgnoreCase)) packetType = "alert";
                else if (eventField.Equals("LORA_TELEMETRY", StringComparison.OrdinalIgnoreCase)) packetType = "telemetry";
                else if (eventField.Equals("LORA_RIDER_PROFILE", StringComparison.OrdinalIgnoreCase)) packetType = "register";
                else if (eventField.Equals("LORA_REGISTER", StringComparison.OrdinalIgnoreCase)) packetType = "register";
                else if (eventField.Equals("LORA_FALSE_ALARM", StringComparison.OrdinalIgnoreCase)) packetType = "false_alarm";
                else if (eventField.Equals("LORA_USER_TYPE", StringComparison.OrdinalIgnoreCase)) packetType = "user_type";
                else if (eventField.Equals("LORA_TEST", StringComparison.OrdinalIgnoreCase)) packetType = "test";
            }
            else
            {
                packetType = ExtractField(payload, "packetType") ?? ExtractField(payload, "type") ?? "alert";
            }

            string latStr = ExtractField(payload, "lat");
            string lonStr = ExtractField(payload, "lon");
            string amagStr = ExtractField(payload, "aMag") ?? ExtractField(payload, "amag") ?? "0";
            string battStr = ExtractField(payload, "battPct") ?? ExtractField(payload, "batt") ?? "100";
            string eventTypeStr = ExtractField(payload, "eventType");

            // Look up existing registration if present
            string savedReg = null;
            lock (_lock)
            {
                _registrations.TryGetValue(token, out savedReg);
            }

            string riderName = ExtractField(payload, "riderName") 
                ?? ExtractField(payload, "name") 
                ?? ExtractField(payload, "rider")
                ?? (savedReg != null ? ExtractField(savedReg, "name") : null);

            // Filter out token or device-generated placeholder if mistakenly passed as rider name
            if (!string.IsNullOrEmpty(riderName) && (
                riderName.Equals(token, StringComparison.OrdinalIgnoreCase) || 
                riderName.StartsWith("Rider ", StringComparison.OrdinalIgnoreCase) ||
                riderName.StartsWith("RAMS-", StringComparison.OrdinalIgnoreCase) ||
                riderName.StartsWith("RAMS0", StringComparison.OrdinalIgnoreCase) ||
                riderName.StartsWith("DEV-", StringComparison.OrdinalIgnoreCase)))
            {
                if (savedReg != null)
                {
                    string regName = ExtractField(savedReg, "name");
                    riderName = (!string.IsNullOrEmpty(regName) && 
                        !regName.Equals(token, StringComparison.OrdinalIgnoreCase) &&
                        !regName.StartsWith("RAMS-", StringComparison.OrdinalIgnoreCase) &&
                        !regName.StartsWith("Rider ", StringComparison.OrdinalIgnoreCase)) ? regName : "";
                }
                else
                {
                    riderName = "";
                }
            }
            if (riderName == null) riderName = "";

            string rawPhotoUrl = ExtractField(payload, "photoUrl");
            if (string.IsNullOrEmpty(rawPhotoUrl)) rawPhotoUrl = ExtractField(payload, "driveLinkConverted");
            if (string.IsNullOrEmpty(rawPhotoUrl)) rawPhotoUrl = ExtractField(payload, "driveLink");
            if (string.IsNullOrEmpty(rawPhotoUrl) && savedReg != null)
            {
                rawPhotoUrl = ExtractField(savedReg, "photoUrl");
                if (string.IsNullOrEmpty(rawPhotoUrl)) rawPhotoUrl = ExtractField(savedReg, "driveLink");
            }

            // Convert Google Drive share links to direct CDN image URLs
            string photoUrl = ConvertGoogleDriveUrl(rawPhotoUrl);
            if (string.IsNullOrEmpty(photoUrl)) photoUrl = "";

            string vehicle = ExtractField(payload, "vehicleModel");
            if (string.IsNullOrEmpty(vehicle)) vehicle = ExtractField(payload, "vehicle");
            if (string.IsNullOrEmpty(vehicle)) vehicle = ExtractField(payload, "category");
            if (string.IsNullOrEmpty(vehicle) && savedReg != null) vehicle = ExtractField(savedReg, "vehicleModel");
            if (string.IsNullOrEmpty(vehicle)) vehicle = "Motorcycle";

            string plate = ExtractField(payload, "plateNumber");
            if (string.IsNullOrEmpty(plate)) plate = ExtractField(payload, "plate");
            if (string.IsNullOrEmpty(plate) && savedReg != null) plate = ExtractField(savedReg, "plateNumber");
            if (string.IsNullOrEmpty(plate)) plate = "EMERGENCY";

            string contactNumber = ExtractField(payload, "contactNumber");
            if (string.IsNullOrEmpty(contactNumber)) contactNumber = ExtractField(payload, "phone");
            if (string.IsNullOrEmpty(contactNumber)) contactNumber = ExtractField(payload, "contact");
            if (string.IsNullOrEmpty(contactNumber) && savedReg != null) contactNumber = ExtractField(savedReg, "contactNumber");
            if (string.IsNullOrEmpty(contactNumber)) contactNumber = "+63 900 000 0000";

            string emergencyContactName = ExtractField(payload, "emergencyContactName");
            if (string.IsNullOrEmpty(emergencyContactName) && savedReg != null) emergencyContactName = ExtractField(savedReg, "emergencyContactName");
            if (string.IsNullOrEmpty(emergencyContactName)) emergencyContactName = "Dispatch EOC";

            string emergencyContactPhone = ExtractField(payload, "emergencyContactPhone");
            if (string.IsNullOrEmpty(emergencyContactPhone)) emergencyContactPhone = ExtractField(payload, "emergencyPhone");
            if (string.IsNullOrEmpty(emergencyContactPhone) && savedReg != null) emergencyContactPhone = ExtractField(savedReg, "emergencyContactPhone");
            if (string.IsNullOrEmpty(emergencyContactPhone)) emergencyContactPhone = "+63 911 000 0000";

            string emergencyRelationship = ExtractField(payload, "emergencyRelationship");
            if (string.IsNullOrEmpty(emergencyRelationship) && savedReg != null) emergencyRelationship = ExtractField(savedReg, "emergencyRelationship");
            if (string.IsNullOrEmpty(emergencyRelationship)) emergencyRelationship = "Emergency Services";

            string bloodType = ExtractField(payload, "bloodType");
            if (string.IsNullOrEmpty(bloodType)) bloodType = ExtractField(payload, "blood");
            if (string.IsNullOrEmpty(bloodType) && savedReg != null) bloodType = ExtractField(savedReg, "bloodType");
            if (string.IsNullOrEmpty(bloodType)) bloodType = "O+";

            string allergies = ExtractField(payload, "allergies");
            if (string.IsNullOrEmpty(allergies) && savedReg != null) allergies = ExtractField(savedReg, "allergies");
            if (string.IsNullOrEmpty(allergies)) allergies = "None";

            // Cache registration data only if we have an actual rider name or real photo URL
            if (!string.IsNullOrEmpty(riderName) || (!string.IsNullOrEmpty(photoUrl) && photoUrl != "/logo.png"))
            {
                string regEntry = string.Format(
                    System.Globalization.CultureInfo.InvariantCulture,
                    "{{\"token\":\"{0}\",\"name\":\"{1}\",\"photoUrl\":\"{2}\",\"vehicleModel\":\"{3}\",\"plateNumber\":\"{4}\",\"contactNumber\":\"{5}\",\"emergencyContactName\":\"{6}\",\"emergencyContactPhone\":\"{7}\",\"emergencyRelationship\":\"{8}\",\"bloodType\":\"{9}\",\"allergies\":\"{10}\",\"updatedAt\":\"{11}\"}}",
                    token, riderName, photoUrl, vehicle, plate, contactNumber, emergencyContactName, emergencyContactPhone, emergencyRelationship, bloodType, allergies, DateTime.UtcNow.ToString("o")
                );
                lock (_lock)
                {
                    _registrations[token] = regEntry;
                    SaveRegistrations();

                    // If rider has real name or photo, enrich existing events for this device token
                    if ((!string.IsNullOrEmpty(riderName) && !riderName.StartsWith("Rider ")) || (!string.IsNullOrEmpty(photoUrl) && photoUrl != "/logo.png"))
                    {
                        bool changed = false;
                        for (int i = 0; i < _eventsJsonList.Count; i++)
                        {
                            string ev = _eventsJsonList[i];
                            if (token.Equals(ExtractField(ev, "deviceToken"), StringComparison.OrdinalIgnoreCase))
                            {
                                string updated = ev;
                                if (!string.IsNullOrEmpty(photoUrl) && photoUrl != "/logo.png")
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(
                                        updated,
                                        "\"photoUrl\":\\s*\"[^\"]*\"",
                                        "\"photoUrl\":\"" + photoUrl + "\""
                                    );
                                }
                                if (!string.IsNullOrEmpty(riderName) && !riderName.StartsWith("Rider "))
                                {
                                    updated = System.Text.RegularExpressions.Regex.Replace(
                                        updated,
                                        "\"riderName\":\\s*\"[^\"]*\"",
                                        "\"riderName\":\"" + riderName + "\""
                                    );
                                    updated = System.Text.RegularExpressions.Regex.Replace(
                                        updated,
                                        "\"deviceName\":\\s*\"[^\"]*\"",
                                        "\"deviceName\":\"" + riderName + "\""
                                    );
                                }
                                if (updated != ev)
                                {
                                    _eventsJsonList[i] = updated;
                                    changed = true;
                                }
                            }
                        }
                        if (changed) SaveIncidents();
                    }
                }
            }

            // Parse lat/lon strictly from payload — no hardcoded fallback coordinates
            double lat = 0.0;
            if (!string.IsNullOrEmpty(latStr))
            {
                double.TryParse(latStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out lat);
            }

            double lon = 0.0;
            if (!string.IsNullOrEmpty(lonStr))
            {
                double.TryParse(lonStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out lon);
            }

            // If GPS data is missing (0,0), try to reuse coordinates from a previous event for this device
            if (lat == 0.0 && lon == 0.0 && !string.IsNullOrEmpty(token))
            {
                lock (_lock)
                {
                    foreach (var ev in _eventsJsonList)
                    {
                        if (token.Equals(ExtractField(ev, "deviceToken"), StringComparison.OrdinalIgnoreCase))
                        {
                            string prevLat = ExtractField(ev, "lat");
                            string prevLon = ExtractField(ev, "lon");
                            if (!string.IsNullOrEmpty(prevLat) && !string.IsNullOrEmpty(prevLon))
                            {
                                double pLat = 0, pLon = 0;
                                if (double.TryParse(prevLat, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out pLat) &&
                                    double.TryParse(prevLon, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out pLon) &&
                                    (pLat != 0.0 || pLon != 0.0))
                                {
                                    lat = pLat;
                                    lon = pLon;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            double aMag = 0.0;
            double.TryParse(amagStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out aMag);

            int battPct = 100;
            int.TryParse(battStr, out battPct);

            int eventType = -1;
            if (!string.IsNullOrEmpty(eventTypeStr))
            {
                int.TryParse(eventTypeStr, out eventType);
            }

            string crashMechanism = "Impact Collision";
            string accidentCategory = "CRASH";
            string accidentDesc = "Vehicular kinetic impact collision.";

            if (packetType.Equals("alert", StringComparison.OrdinalIgnoreCase))
            {
                if (!string.IsNullOrEmpty(eventField) && eventField.Equals("LORA_ALERT", StringComparison.OrdinalIgnoreCase))
                {
                    string alertTypeStr = ExtractField(payload, "type");
                    if (!string.IsNullOrEmpty(alertTypeStr)) crashMechanism = alertTypeStr;
                }
                else if (eventType >= 0)
                {
                    switch (eventType)
                    {
                        case 0:
                            crashMechanism = "Rider Fall Detected";
                            accidentCategory = "FALL";
                            accidentDesc = "Full FSM-confirmed fall sequence with rapid lateral tilt and kinetic rest.";
                            break;
                        case 1:
                            crashMechanism = "Skid / Loss of Traction";
                            accidentCategory = "SKID";
                            accidentDesc = "Loss of tire traction detected with high roll-rate and lateral deceleration.";
                            break;
                        case 2:
                            crashMechanism = "Direct High-G Impact";
                            accidentCategory = "CRASH";
                            accidentDesc = "Severe vehicular collision shockwave exceeding 4.0G baseline.";
                            break;
                        case 3:
                            crashMechanism = "Ground Shock / Rollover";
                            accidentCategory = "ROLLOVER";
                            accidentDesc = "Chassis rollover and structural ground shock detected.";
                            break;
                        case 4:
                            crashMechanism = "Wave Motion / Severe Oscillation";
                            accidentCategory = "OSCILLATION";
                            accidentDesc = "Dangerous speed wobble or chassis oscillation detected.";
                            break;
                    }
                }
                else
                {
                    string cmLower = crashMechanism.ToLowerInvariant();
                    if (cmLower.Contains("fall"))
                    {
                        crashMechanism = "Rider Fall Detected";
                        accidentCategory = "FALL";
                        accidentDesc = "Kinematic fall sequence with lateral tilt and prolonged rest.";
                    }
                    else if (cmLower.Contains("skid") || cmLower.Contains("traction"))
                    {
                        crashMechanism = "Skid / Loss of Traction";
                        accidentCategory = "SKID";
                        accidentDesc = "Loss of tire traction detected with lateral acceleration.";
                    }
                    else if (aMag >= 4.0)
                    {
                        crashMechanism = "Direct High-G Impact";
                        accidentCategory = "CRASH";
                        accidentDesc = "High-energy collision shockwave with abrupt deceleration.";
                    }
                    else
                    {
                        crashMechanism = "Impact Collision";
                        accidentCategory = "CRASH";
                        accidentDesc = "Vehicular kinetic impact requiring emergency response.";
                    }
                }
            }
            else if (packetType.Equals("false_alarm", StringComparison.OrdinalIgnoreCase))
            {
                accidentCategory = "FALSE_ALARM";
                accidentDesc = "Impact alert cancelled by user via hands-free voice or wearable button.";
                crashMechanism = "False Alarm (Cancelled)";
            }
            else if (packetType.Equals("telemetry", StringComparison.OrdinalIgnoreCase))
            {
                accidentCategory = "TELEMETRY";
                accidentDesc = "Periodic GPS beacon and system health monitoring.";
                crashMechanism = "Routine GPS Telemetry";
            }
            else if (packetType.Equals("test", StringComparison.OrdinalIgnoreCase))
            {
                accidentCategory = "TEST";
                accidentDesc = "Diagnostic hardware test sequence.";
                crashMechanism = "Diagnostic Test";
            }

            string status = "ACTIVE ALERT";
            string title = string.Format(System.Globalization.CultureInfo.InvariantCulture, "{0} ({1:F1}g)", crashMechanism, aMag);

            if (packetType.Equals("alert", StringComparison.OrdinalIgnoreCase))
            {
                status = (aMag >= 4.0) ? "CRITICAL HIGH-G IMPACT" : "ACTIVE ALERT";
                title = string.Format(System.Globalization.CultureInfo.InvariantCulture, "{0} ({1:F1}g)", crashMechanism, aMag);
            }
            else if (packetType.Equals("test", StringComparison.OrdinalIgnoreCase))
            {
                status = "DIAGNOSTIC TEST";
                title = string.Format(System.Globalization.CultureInfo.InvariantCulture, "Routine Sensor Diagnostic ({0:F1}g)", aMag);
            }
            else if (packetType.Equals("false_alarm", StringComparison.OrdinalIgnoreCase))
            {
                status = "FALSE ALARM";
                title = "Impact Sensor False Alarm - Cancelled by User";
            }
            else if (packetType.Equals("telemetry", StringComparison.OrdinalIgnoreCase))
            {
                status = "NORMAL TELEMETRY";
                title = "Live GPS Telemetry Beacon Broadcast";
            }
            else if (packetType.Equals("register", StringComparison.OrdinalIgnoreCase) || packetType.Equals("rider_profile", StringComparison.OrdinalIgnoreCase))
            {
                status = "PROFILE SYNCED";
                title = string.Format("Rider Profile Synchronized: {0} ({1})", riderName, vehicle);
            }

            string locAddress = ExtractField(payload, "locationAddress") ?? ((Math.Abs(lat) > 0.0001 || Math.Abs(lon) > 0.0001) ? string.Format(System.Globalization.CultureInfo.InvariantCulture, "GPS Coordinates: {0:F5}, {1:F5}", lat, lon) : "GPS Signal Unacquired");

            // Use rider name as device name instead of generic "Receiver Unit Node"
            string displayDeviceName = (!string.IsNullOrEmpty(riderName) && !riderName.StartsWith("Rider ") && !riderName.StartsWith("RAMS-") && !riderName.Equals(token, StringComparison.OrdinalIgnoreCase)) ? riderName : (!string.IsNullOrEmpty(token) ? ("RAMS Wearable (" + token + ")") : "Unknown Device");

            int numEventType = (eventType >= 0) ? eventType : (accidentCategory == "FALL" ? 0 : (accidentCategory == "SKID" ? 1 : 2));

            return string.Format(
                System.Globalization.CultureInfo.InvariantCulture,
                "{{\"id\":\"{0}\",\"deviceToken\":\"{1}\",\"deviceName\":\"{21}\",\"riderName\":\"{2}\",\"riderRole\":\"Registered Highway User\",\"contactNumber\":\"{3}\",\"emergencyContactName\":\"{4}\",\"emergencyContactPhone\":\"{5}\",\"emergencyRelationship\":\"{6}\",\"bloodType\":\"{7}\",\"allergies\":\"{8}\",\"vehicleModel\":\"{9}\",\"plateNumber\":\"{10}\",\"locationAddress\":\"{11}\",\"title\":\"{12}\",\"type\":\"{13}\",\"lat\":{14},\"lon\":{15},\"aMag\":{16},\"battPct\":{17},\"createdAt\":\"{18}\",\"status\":\"{19}\",\"photoUrl\":\"{20}\",\"eventType\":{22},\"eventTypeName\":\"{23}\",\"accidentType\":\"{24}\",\"accidentDescription\":\"{25}\"}}",
                eventId, token, riderName, contactNumber, emergencyContactName, emergencyContactPhone, emergencyRelationship, bloodType, allergies, vehicle, plate, locAddress, title, packetType, lat, lon, aMag, battPct, DateTime.UtcNow.ToString("o"), status, photoUrl, displayDeviceName, numEventType, crashMechanism, accidentCategory, accidentDesc
            );
        }

        private static string ExtractField(string source, string field)
        {
            if (string.IsNullOrEmpty(source)) return null;

            // JSON format: "field": "val" or "field": 123
            string jsonPattern = "\"" + field + "\"";
            int idx = source.IndexOf(jsonPattern, StringComparison.OrdinalIgnoreCase);
            if (idx >= 0)
            {
                int colon = source.IndexOf(':', idx + jsonPattern.Length);
                if (colon > 0)
                {
                    int start = colon + 1;
                    while (start < source.Length && (source[start] == ' ' || source[start] == '\"' || source[start] == '\t')) start++;
                    int end = start;
                    while (end < source.Length && source[end] != '\"' && source[end] != ',' && source[end] != '}' && source[end] != '\r' && source[end] != '\n') end++;
                    if (end > start)
                    {
                        return source.Substring(start, end - start).Trim();
                    }
                }
            }

            // Form format: field=val
            string formPattern = field + "=";
            idx = source.IndexOf(formPattern, StringComparison.OrdinalIgnoreCase);
            if (idx >= 0)
            {
                int start = idx + formPattern.Length;
                int end = source.IndexOf('&', start);
                if (end < 0) end = source.Length;
                return Uri.UnescapeDataString(source.Substring(start, end - start)).Trim();
            }

            return null;
        }

        /// <summary>
        /// Converts Google Drive share URLs to direct CDN image URLs.
        /// Input formats: https://drive.google.com/file/d/FILE_ID/view, https://drive.google.com/open?id=FILE_ID
        /// Output: https://lh3.googleusercontent.com/d/FILE_ID
        /// </summary>
        private static string ConvertGoogleDriveUrl(string url)
        {
            if (string.IsNullOrEmpty(url)) return "";
            url = url.Trim().Trim('\"', '\'').Trim();
            if (string.IsNullOrEmpty(url) || url == "/logo.png" || url == "/logo.jpg") return url;
            // Already a direct GDrive CDN link
            if (url.Contains("lh3.googleusercontent.com")) return url;
            // Not a drive link at all
            if (!url.Contains("drive.google.com") && !url.Contains("docs.google.com")) return url;

            // Extract file ID from various formats
            // Pattern 1: /d/FILE_ID or /d/FILE_ID/
            int dIdx = url.IndexOf("/d/");
            if (dIdx >= 0)
            {
                int start = dIdx + 3;
                int end = start;
                while (end < url.Length && url[end] != '/' && url[end] != '?' && url[end] != '&') end++;
                if (end > start)
                {
                    string fileId = url.Substring(start, end - start);
                    return "https://lh3.googleusercontent.com/d/" + fileId;
                }
            }
            // Pattern 2: id=FILE_ID
            int idIdx = url.IndexOf("id=");
            if (idIdx >= 0)
            {
                int start = idIdx + 3;
                int end = start;
                while (end < url.Length && url[end] != '&' && url[end] != '#') end++;
                if (end > start)
                {
                    string fileId = url.Substring(start, end - start);
                    return "https://lh3.googleusercontent.com/d/" + fileId;
                }
            }
            return url;
        }

        private static void ServeStaticFile(string rawUrl, HttpListenerResponse res)
        {
            if (string.IsNullOrEmpty(rawUrl) || rawUrl == "/")
            {
                rawUrl = "/index.html";
            }

            string relPath = rawUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            string fullPath = Path.Combine(_wwwDir, relPath);

            // SPA Fallback: If not found, fall back to index.html for client-side routing
            if (!File.Exists(fullPath))
            {
                fullPath = Path.Combine(_wwwDir, "index.html");
            }

            if (!File.Exists(fullPath))
            {
                res.StatusCode = 404;
                byte[] notFound = Encoding.UTF8.GetBytes("404 - File Not Found in RAMS Desktop www directory.");
                res.ContentType = "text/plain";
                res.OutputStream.Write(notFound, 0, notFound.Length);
                res.Close();
                return;
            }

            string ext = Path.GetExtension(fullPath).ToLowerInvariant();
            res.ContentType = GetMimeType(ext);

            try
            {
                byte[] fileBytes = File.ReadAllBytes(fullPath);
                res.ContentLength64 = fileBytes.Length;
                res.OutputStream.Write(fileBytes, 0, fileBytes.Length);
            }
            catch (Exception ex)
            {
                res.StatusCode = 500;
                byte[] err = Encoding.UTF8.GetBytes("Error serving file: " + ex.Message);
                res.OutputStream.Write(err, 0, err.Length);
            }
            finally
            {
                res.Close();
            }
        }

        private static string GetMimeType(string ext)
        {
            switch (ext)
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".json": return "application/json; charset=utf-8";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".svg": return "image/svg+xml";
                case ".ico": return "image/x-icon";
                case ".txt": return "text/plain; charset=utf-8";
                case ".woff": return "font/woff";
                case ".woff2": return "font/woff2";
                case ".ttf": return "font/ttf";
                default: return "application/octet-stream";
            }
        }

        private static Process LaunchEdgeApp(string appUrl)
        {
            try
            {
                string[] possiblePaths = new string[]
                {
                    @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                    @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                    @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                    @"C:\Program Files\Google\Chrome\Application\chrome.exe"
                };

                string browserPath = null;
                foreach (var p in possiblePaths)
                {
                    if (File.Exists(p))
                    {
                        browserPath = p;
                        break;
                    }
                }

                if (browserPath == null) return null;

                string userDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RAMS_Rescuer_Desktop");

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = browserPath;
                // Desktop app window with window controls visible (min/max/close) and custom profile — launches maximized
                psi.Arguments = string.Format("--app=\"{0}\" --start-maximized --user-data-dir=\"{1}\" --app-id=\"RAMS_Rescuer_Station\"", appUrl, userDataDir);
                psi.UseShellExecute = false;

                return Process.Start(psi);
            }
            catch
            {
                return null;
            }
        }

        private static void LoadIncidents()
        {
            if (File.Exists(_dataFilePath))
            {
                try
                {
                    string content = File.ReadAllText(_dataFilePath, Encoding.UTF8);
                    // Extract items from JSON array
                    var all = ParseJsonArrayObjects(content);
                    _eventsJsonList = new List<string>();
                    foreach (var item in all)
                    {
                        string t = (ExtractField(item, "type") ?? "").ToLowerInvariant();
                        string name = (ExtractField(item, "riderName") ?? "").ToLowerInvariant();
                        string dev = (ExtractField(item, "deviceToken") ?? "").ToLowerInvariant();
                        string id = (ExtractField(item, "id") ?? "").ToLowerInvariant();
                        // Strictly filter out test data and fake names
                        if (t.Contains("test") || name.Contains("test") || dev.Contains("test") || id.Contains("test")
                            || dev.StartsWith("rams-sim-") || name.Contains("ramirez") || name.Contains("jane doe"))
                        {
                            continue;
                        }

                        string enriched = item;
                        if (string.IsNullOrEmpty(ExtractField(item, "eventTypeName")))
                        {
                            string itemTitle = (ExtractField(item, "title") ?? "").ToLowerInvariant();
                            string itemType = (ExtractField(item, "type") ?? "").ToLowerInvariant();
                            string aMagStr = ExtractField(item, "aMag");
                            double g = 0;
                            double.TryParse(aMagStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out g);

                            string evtName = "Direct High-G Impact";
                            string accType = "CRASH";
                            string accDesc = "Vehicular impact collision with high kinetic deceleration.";

                            if (itemType == "telemetry")
                            {
                                evtName = "Routine GPS Telemetry";
                                accType = "TELEMETRY";
                                accDesc = "Periodic GPS beacon and system health monitoring.";
                            }
                            else if (itemType == "false_alarm" || itemTitle.Contains("false alarm"))
                            {
                                evtName = "False Alarm (Cancelled)";
                                accType = "FALSE_ALARM";
                                accDesc = "Impact alert cancelled by user via hands-free voice or wearable button.";
                            }
                            else if (itemTitle.Contains("skid") || itemTitle.Contains("traction"))
                            {
                                evtName = "Skid / Loss of Traction";
                                accType = "SKID";
                                accDesc = "Loss of tire traction detected with lateral deceleration and high roll-rate.";
                            }
                            else if (itemTitle.Contains("fall"))
                            {
                                evtName = "Rider Fall Detected";
                                accType = "FALL";
                                accDesc = "Full FSM-confirmed fall sequence with lateral tilt and kinetic rest.";
                            }
                            else if (g >= 4.0)
                            {
                                evtName = "Direct High-G Impact";
                                accType = "CRASH";
                                accDesc = "Severe vehicular collision shockwave exceeding 4.0G baseline.";
                            }

                            int closeBrace = enriched.LastIndexOf('}');
                            if (closeBrace > 0)
                            {
                                string toInsert = string.Format(
                                    System.Globalization.CultureInfo.InvariantCulture,
                                    ",\"eventTypeName\":\"{0}\",\"accidentType\":\"{1}\",\"accidentDescription\":\"{2}\"}}",
                                    evtName, accType, accDesc
                                );
                                enriched = enriched.Substring(0, closeBrace) + toInsert;
                            }
                        }

                        _eventsJsonList.Add(enriched);
                    }
                    if (_eventsJsonList.Count > 0) return;
                }
                catch { }
            }

            // Start clean — no synthetic seed data. Real incidents arrive from LoRa receiver.
            _eventsJsonList = new List<string>();
            SaveIncidents();
        }

        private static void LoadRegistrations()
        {
            if (File.Exists(_registrationsFilePath))
            {
                try
                {
                    string content = File.ReadAllText(_registrationsFilePath, Encoding.UTF8);
                    var items = ParseJsonArrayObjects(content);
                    lock (_lock)
                    {
                        _registrations.Clear();
                        foreach (var item in items)
                        {
                            string t = ExtractField(item, "token");
                            string n = (ExtractField(item, "name") ?? "").ToLowerInvariant();
                            if (!string.IsNullOrEmpty(t) && !t.ToLowerInvariant().Contains("test") && !t.StartsWith("RAMS-SIM-", StringComparison.OrdinalIgnoreCase) && !n.Contains("test") && !n.Contains("ramirez") && !n.Contains("jane doe"))
                            {
                                _registrations[t] = item;
                            }
                        }
                    }
                }
                catch { }
            }
        }

        private static void SaveRegistrations()
        {
            try
            {
                StringBuilder sb = new StringBuilder();
                sb.Append("[\n");
                lock (_lock)
                {
                    int i = 0;
                    foreach (var kvp in _registrations)
                    {
                        sb.Append("  " + kvp.Value);
                        if (++i < _registrations.Count) sb.Append(",\n");
                    }
                }
                sb.Append("\n]");
                File.WriteAllText(_registrationsFilePath, sb.ToString(), Encoding.UTF8);
            }
            catch { }
        }

        private static void SaveIncidents()
        {
            try
            {
                StringBuilder sb = new StringBuilder();
                sb.Append("[\n");
                for (int i = 0; i < _eventsJsonList.Count; i++)
                {
                    sb.Append("  " + _eventsJsonList[i]);
                    if (i < _eventsJsonList.Count - 1) sb.Append(",\n");
                }
                sb.Append("\n]");
                File.WriteAllText(_dataFilePath, sb.ToString(), Encoding.UTF8);
            }
            catch { }
        }

        private static List<string> ParseJsonArrayObjects(string json)
        {
            var list = new List<string>();
            int depth = 0;
            int start = -1;
            bool inString = false;

            for (int i = 0; i < json.Length; i++)
            {
                char c = json[i];
                if (c == '\"' && (i == 0 || json[i - 1] != '\\'))
                {
                    inString = !inString;
                }
                else if (!inString)
                {
                    if (c == '{')
                    {
                        if (depth == 0) start = i;
                        depth++;
                    }
                    else if (c == '}')
                    {
                        depth--;
                        if (depth == 0 && start >= 0)
                        {
                            list.Add(json.Substring(start, i - start + 1).Trim());
                            start = -1;
                        }
                    }
                }
            }
            return list;
        }
    }
}

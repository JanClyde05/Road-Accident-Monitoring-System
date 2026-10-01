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
        private static readonly HashSet<string> _connectedPortNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        private static string _lastDetectedPort = "NONE";
        private static List<string> _localLanIPs = new List<string>();
        private static TcpListener _lanTcpListener;
        private static Thread _lanTcpThread;

        [STAThread]
        static void Main(string[] args)
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            _wwwDir = Path.Combine(appDir, "www");
            _dataFilePath = Path.Combine(appDir, "incidents.json");
            _registrationsFilePath = Path.Combine(appDir, "registrations.json");

            // Initialize incident and registration stores
            LoadRegistrations();
            LoadIncidents();

            // Start Auto-Detecting USB Serial Bridge for direct LoRa Base Station hardware ingestion
            StartSerialReceiverBridge();

            // Start Non-Admin LAN TCP Bridge on port 8888 for optional Wi-Fi receiver ingestion
            StartLanReceiverBridge();

            // Find an open port starting from 8080
            _port = FindAvailablePort(8080, 8095);

            // Start Embedded Local HTTP Server
            StartServer(_port);

            // Launch Native Desktop App Window via Edge App Mode
            string appUrl = string.Format("http://127.0.0.1:{0}/", _port);
            Process edgeProc = LaunchEdgeApp(appUrl);
            if (edgeProc == null)
            {
                // Fallback: Open in default browser
                try { Process.Start(appUrl); } catch { }
            }

            DateTime startupTime = DateTime.UtcNow;
            _lastActivity = DateTime.UtcNow;

            // Maintain operations server while window is open:
            // Checks for explicit /api/exit request, or inactivity after startup grace period
            while (!_exitRequested)
            {
                Thread.Sleep(1000);
                double elapsedSinceStart = (DateTime.UtcNow - startupTime).TotalSeconds;
                if (elapsedSinceStart > 30.0) // 30-second initial startup grace period
                {
                    double inactiveSeconds = (DateTime.UtcNow - _lastActivity).TotalSeconds;
                    if (inactiveSeconds > 15.0) // 15 seconds without client polling
                    {
                        break;
                    }
                }
            }

            // Cleanup server when user closes the app window
            _serialRunning = false;
            try { if (_lanTcpListener != null) _lanTcpListener.Stop(); } catch { }
            try
            {
                if (_listener != null && _listener.IsListening)
                {
                    _listener.Stop();
                    _listener.Close();
                }
            }
            catch { }
        }

        private static int FindAvailablePort(int startingPort, int maxPort)
        {
            for (int p = startingPort; p <= maxPort; p++)
            {
                try
                {
                    TcpListener tcp = new TcpListener(IPAddress.Loopback, p);
                    tcp.Start();
                    tcp.Stop();
                    return p;
                }
                catch
                {
                    // Port is in use, try next
                }
            }
            return startingPort;
        }

        private static void StartServer(int port)
        {
            _listener = new HttpListener();
            _listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", port));
            _listener.Prefixes.Add(string.Format("http://localhost:{0}/", port));

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

            // Attempt to also bind HttpListener on LAN IPs so receiver ESP32 can reach /api/upload directly
            // This requires either admin rights or an existing URL ACL reservation; gracefully skip if it fails
            foreach (string lanIp in _localLanIPs)
            {
                try
                {
                    _listener.Prefixes.Add(string.Format("http://{0}:{1}/", lanIp, port));
                }
                catch { }
            }

            // Also try wildcard '+' prefix (requires admin / URL ACL) as fallback for any-interface binding
            try
            {
                _listener.Prefixes.Add(string.Format("http://+:{0}/", port));
            }
            catch { }

            try
            {
                _listener.Start();
                _listener.BeginGetContext(OnRequest, null);
            }
            catch (Exception)
            {
                // If wildcard or LAN prefix causes Access Denied, fall back to loopback only
                try
                {
                    _listener.Close();
                }
                catch { }

                _listener = new HttpListener();
                _listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", port));
                _listener.Prefixes.Add(string.Format("http://localhost:{0}/", port));
                try
                {
                    _listener.Start();
                    _listener.BeginGetContext(OnRequest, null);
                }
                catch (Exception ex)
                {
                    System.Windows.Forms.MessageBox.Show(
                        "Failed to start RAMS Local Operations Server:\n" + ex.Message,
                        "RAMS Rescuer Operations - Error",
                        System.Windows.Forms.MessageBoxButtons.OK,
                        System.Windows.Forms.MessageBoxIcon.Error
                    );
                    Environment.Exit(1);
                }
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
            }
            catch { }
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

            // Route: POST/GET /api/exit (Clean App Shutdown from Exit Protocol)
            if (rawUrl.Equals("/api/exit", StringComparison.OrdinalIgnoreCase))
            {
                res.ContentType = "application/json; charset=utf-8";
                byte[] exitBytes = Encoding.UTF8.GetBytes("{\"status\":\"EXIT_INITIATED\"}");
                res.OutputStream.Write(exitBytes, 0, exitBytes.Length);
                res.Close();
                _exitRequested = true;
                new Thread(() => {
                    Thread.Sleep(300);
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

            // Static File Serving from www/
            ServeStaticFile(rawUrl, res);
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
            if (!string.IsNullOrEmpty(eventField) && eventField.Equals("LORA_ALERT", StringComparison.OrdinalIgnoreCase))
            {
                string alertTypeStr = ExtractField(payload, "type");
                if (!string.IsNullOrEmpty(alertTypeStr)) crashMechanism = alertTypeStr;
            }
            else if (eventType >= 0)
            {
                switch (eventType)
                {
                    case 0: crashMechanism = "Rider Fall Detected"; break;
                    case 1: crashMechanism = "Skid / Loss of Traction"; break;
                    case 2: crashMechanism = "Direct High-G Impact"; break;
                    case 3: crashMechanism = "Ground Shock / Rollover"; break;
                    case 4: crashMechanism = "Wave Motion / Severe Oscillation"; break;
                }
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

            return string.Format(
                System.Globalization.CultureInfo.InvariantCulture,
                "{{\"id\":\"{0}\",\"deviceToken\":\"{1}\",\"deviceName\":\"{21}\",\"riderName\":\"{2}\",\"riderRole\":\"Registered Highway User\",\"contactNumber\":\"{3}\",\"emergencyContactName\":\"{4}\",\"emergencyContactPhone\":\"{5}\",\"emergencyRelationship\":\"{6}\",\"bloodType\":\"{7}\",\"allergies\":\"{8}\",\"vehicleModel\":\"{9}\",\"plateNumber\":\"{10}\",\"locationAddress\":\"{11}\",\"title\":\"{12}\",\"type\":\"{13}\",\"lat\":{14},\"lon\":{15},\"aMag\":{16},\"battPct\":{17},\"createdAt\":\"{18}\",\"status\":\"{19}\",\"photoUrl\":\"{20}\"}}",
                eventId, token, riderName, contactNumber, emergencyContactName, emergencyContactPhone, emergencyRelationship, bloodType, allergies, vehicle, plate, locAddress, title, packetType, lat, lon, aMag, battPct, DateTime.UtcNow.ToString("o"), status, photoUrl, displayDeviceName
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
                        // Strictly filter out test data
                        if (t.Contains("test") || name.Contains("test") || dev.Contains("test") || id.Contains("test"))
                        {
                            continue;
                        }
                        _eventsJsonList.Add(item);
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
                            if (!string.IsNullOrEmpty(t) && !t.ToLowerInvariant().Contains("test") && !n.Contains("test"))
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

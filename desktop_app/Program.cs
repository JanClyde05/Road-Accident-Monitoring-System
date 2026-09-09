/*
 * Road Accident Monitoring System (RAMS) - Standalone Desktop Rescuer Application
 * =================================================================================
 * High-performance, zero-external-dependency Windows desktop host for the RAMS
 * Emergency Command & Dispatch Operations Center.
 *
 * Capabilities:
 *  - Embedded multi-threaded HTTP server (System.Net.HttpListener)
 *  - Full offline execution (works in mobile command centers without internet)
 *  - Direct LoRa Base Station Receiver ingestion (/api/upload)
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

            // Route: GET /api/events
            if (rawUrl.Equals("/api/events", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase))
            {
                HandleGetEvents(res);
                return;
            }

            // Route: POST /api/upload (ESP32 LoRa Receiver Base Station Ingestion)
            if (rawUrl.Equals("/api/upload", StringComparison.OrdinalIgnoreCase) && req.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase))
            {
                HandlePostUpload(req, res);
                return;
            }

            // Route: GET /api/status
            if (rawUrl.Equals("/api/status", StringComparison.OrdinalIgnoreCase))
            {
                res.ContentType = "application/json; charset=utf-8";
                string statusJson = string.Format("{{\"status\":\"ONLINE\",\"port\":{0},\"mode\":\"STANDALONE_DESKTOP\",\"eventsCount\":{1},\"registrationsCount\":{2},\"timestamp\":\"{3}\"}}",
                    _port, _eventsJsonList.Count, _registrations.Count, DateTime.UtcNow.ToString("o"));
                byte[] statusBytes = Encoding.UTF8.GetBytes(statusJson);
                res.OutputStream.Write(statusBytes, 0, statusBytes.Length);
                res.Close();
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

            string eventId = "RAMS-ALERT-" + DateTime.Now.ToString("yyyyMMdd-HHmmss");
            string formattedEvent = BuildEventFromJsonOrForm(body, eventId);

            lock (_lock)
            {
                _eventsJsonList.Insert(0, formattedEvent);
                SaveIncidents();
            }

            res.ContentType = "application/json; charset=utf-8";
            res.StatusCode = 200;
            string responseMsg = string.Format("{{\"status\":\"OK\",\"message\":\"Incident logged successfully\",\"id\":\"{0}\"}}", eventId);
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

        private static string BuildEventFromJsonOrForm(string payload, string eventId)
        {
            // Robust extractor supporting both receiver firmware LoRa JSON & mobile app POST formats
            string token = ExtractField(payload, "deviceToken") ?? ExtractField(payload, "token") ?? "RAMS-UNIT-RX";
            string packetType = ExtractField(payload, "packetType") ?? ExtractField(payload, "type") ?? "alert";
            string latStr = ExtractField(payload, "lat") ?? "17.6132";
            string lonStr = ExtractField(payload, "lon") ?? "121.7270";
            string amagStr = ExtractField(payload, "aMag") ?? ExtractField(payload, "amag") ?? "3.8";
            string battStr = ExtractField(payload, "battPct") ?? "100";
            string eventTypeStr = ExtractField(payload, "eventType");

            // Look up existing registration if present
            string savedReg = null;
            lock (_lock)
            {
                _registrations.TryGetValue(token, out savedReg);
            }

            string riderName = ExtractField(payload, "riderName") 
                ?? ExtractField(payload, "name") 
                ?? (savedReg != null ? ExtractField(savedReg, "name") : null) 
                ?? ("Rider " + token);

            string photoUrl = ExtractField(payload, "photoUrl") 
                ?? ExtractField(payload, "driveLinkConverted") 
                ?? (savedReg != null ? ExtractField(savedReg, "photoUrl") : null) 
                ?? "/logo.png";

            string vehicle = ExtractField(payload, "vehicleModel") 
                ?? ExtractField(payload, "vehicle") 
                ?? (savedReg != null ? ExtractField(savedReg, "vehicleModel") : null) 
                ?? "Motorcycle";

            string plate = ExtractField(payload, "plateNumber") 
                ?? ExtractField(payload, "plate") 
                ?? (savedReg != null ? ExtractField(savedReg, "plateNumber") : null) 
                ?? "EMERGENCY";

            string contactNumber = ExtractField(payload, "contactNumber") 
                ?? ExtractField(payload, "phone") 
                ?? (savedReg != null ? ExtractField(savedReg, "contactNumber") : null) 
                ?? "+63 900 000 0000";

            string emergencyContactName = ExtractField(payload, "emergencyContactName") 
                ?? (savedReg != null ? ExtractField(savedReg, "emergencyContactName") : null) 
                ?? "Dispatch EOC";

            string emergencyContactPhone = ExtractField(payload, "emergencyContactPhone") 
                ?? (savedReg != null ? ExtractField(savedReg, "emergencyContactPhone") : null) 
                ?? "+63 911 000 0000";

            string emergencyRelationship = ExtractField(payload, "emergencyRelationship") 
                ?? (savedReg != null ? ExtractField(savedReg, "emergencyRelationship") : null) 
                ?? "Emergency Services";

            string bloodType = ExtractField(payload, "bloodType") 
                ?? (savedReg != null ? ExtractField(savedReg, "bloodType") : null) 
                ?? "O+";

            string allergies = ExtractField(payload, "allergies") 
                ?? (savedReg != null ? ExtractField(savedReg, "allergies") : null) 
                ?? "None";

            // If packet is registration, update registration store
            if (packetType.Equals("register", StringComparison.OrdinalIgnoreCase))
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
                }
            }

            double lat = 17.6132;
            double.TryParse(latStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out lat);

            double lon = 121.7270;
            double.TryParse(lonStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out lon);

            double aMag = 3.8;
            double.TryParse(amagStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out aMag);

            int battPct = 100;
            int.TryParse(battStr, out battPct);

            int eventType = -1;
            if (!string.IsNullOrEmpty(eventTypeStr))
            {
                int.TryParse(eventTypeStr, out eventType);
            }

            string crashMechanism = "Impact Collision";
            switch (eventType)
            {
                case 0: crashMechanism = "Rider Fall Detected"; break;
                case 1: crashMechanism = "Skid / Loss of Traction"; break;
                case 2: crashMechanism = "Direct High-G Impact"; break;
                case 3: crashMechanism = "Ground Shock / Rollover"; break;
                case 4: crashMechanism = "Wave Motion / Severe Oscillation"; break;
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
            else if (packetType.Equals("register", StringComparison.OrdinalIgnoreCase))
            {
                status = "REGISTERED USER";
                title = string.Format("Rider Profile Synchronized: {0}", riderName);
            }

            string locAddress = ExtractField(payload, "locationAddress") ?? string.Format(System.Globalization.CultureInfo.InvariantCulture, "GPS Coordinates: {0:F5}, {1:F5}", lat, lon);

            return string.Format(
                System.Globalization.CultureInfo.InvariantCulture,
                "{{\"id\":\"{0}\",\"deviceToken\":\"{1}\",\"deviceName\":\"Receiver Unit Node ({1})\",\"riderName\":\"{2}\",\"riderRole\":\"Registered Highway User\",\"contactNumber\":\"{3}\",\"emergencyContactName\":\"{4}\",\"emergencyContactPhone\":\"{5}\",\"emergencyRelationship\":\"{6}\",\"bloodType\":\"{7}\",\"allergies\":\"{8}\",\"vehicleModel\":\"{9}\",\"plateNumber\":\"{10}\",\"locationAddress\":\"{11}\",\"title\":\"{12}\",\"type\":\"{13}\",\"lat\":{14},\"lon\":{15},\"aMag\":{16},\"battPct\":{17},\"createdAt\":\"{18}\",\"status\":\"{19}\",\"photoUrl\":\"{20}\"}}",
                eventId, token, riderName, contactNumber, emergencyContactName, emergencyContactPhone, emergencyRelationship, bloodType, allergies, vehicle, plate, locAddress, title, packetType, lat, lon, aMag, battPct, DateTime.UtcNow.ToString("o"), status, photoUrl
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
            // Chromeless desktop app window with high performance, borderless fullscreen, and custom profile
            psi.Arguments = string.Format("--app=\"{0}\" --start-fullscreen --user-data-dir=\"{1}\" --app-id=\"RAMS_Rescuer_Station\"", appUrl, userDataDir);
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
                    _eventsJsonList = ParseJsonArrayObjects(content);
                    if (_eventsJsonList.Count > 0) return;
                }
                catch { }
            }

            // Initial Tuguegarao & Cagayan Valley Tactical Incidents
            _eventsJsonList.Add(
                "{\"id\":\"RAMS-ALERT-9901\",\"deviceToken\":\"RAMS-UNIT-01\",\"deviceName\":\"Motorcycle Patrol Unit 01\",\"riderName\":\"Juan Dela Cruz\",\"riderRole\":\"Lead Highway Patrol Officer\",\"contactNumber\":\"+63 917 123 4567\",\"emergencyContactName\":\"Maria Dela Cruz\",\"emergencyContactPhone\":\"+63 917 555 0192\",\"emergencyRelationship\":\"Spouse\",\"bloodType\":\"O+\",\"allergies\":\"Penicillin, Latex\",\"vehicleModel\":\"Yamaha NMAX 155 (Black)\",\"plateNumber\":\"BG-9921\",\"locationAddress\":\"Maharlika Highway, Carig Sur, Tuguegarao City\",\"title\":\"High-G Impact Collision Detected (4.8g)\",\"type\":\"alert\",\"lat\":17.6132,\"lon\":121.7270,\"aMag\":4.8,\"battPct\":92,\"createdAt\":\"" + DateTime.UtcNow.AddMinutes(-5).ToString("o") + "\",\"status\":\"ACTIVE ALERT\",\"photoUrl\":\"/logo.png\"}"
            );
            _eventsJsonList.Add(
                "{\"id\":\"RAMS-TEST-8802\",\"deviceToken\":\"RAMS-UNIT-02\",\"deviceName\":\"Wearable Sensor Pack 02\",\"riderName\":\"Engr. Mark Santos\",\"riderRole\":\"Field Testing Specialist\",\"contactNumber\":\"+63 918 987 6543\",\"emergencyContactName\":\"Elena Santos\",\"emergencyContactPhone\":\"+63 918 555 9911\",\"emergencyRelationship\":\"Sister\",\"bloodType\":\"A+\",\"allergies\":\"None\",\"vehicleModel\":\"Honda Click 125i (Red)\",\"plateNumber\":\"7712-XY\",\"locationAddress\":\"Cagayan Valley Road, San Gabriel, Tuguegarao City\",\"title\":\"Diagnostic Crash Sensor Routine Test\",\"type\":\"test\",\"lat\":17.6190,\"lon\":121.7340,\"aMag\":2.1,\"battPct\":88,\"createdAt\":\"" + DateTime.UtcNow.AddMinutes(-25).ToString("o") + "\",\"status\":\"DIAGNOSTIC TEST\",\"photoUrl\":\"/logo.png\"}"
            );
            _eventsJsonList.Add(
                "{\"id\":\"RAMS-FALSE-7703\",\"deviceToken\":\"RAMS-UNIT-03\",\"deviceName\":\"Patrol Unit 03 Wearable\",\"riderName\":\"Officer Pedro Penduko\",\"riderRole\":\"Traffic Management Officer\",\"contactNumber\":\"+63 920 111 2233\",\"emergencyContactName\":\"Ana Penduko\",\"emergencyContactPhone\":\"+63 920 555 3344\",\"emergencyRelationship\":\"Wife\",\"bloodType\":\"B+\",\"allergies\":\"Dust, Shellfish\",\"vehicleModel\":\"Kawasaki Barako II (Silver)\",\"plateNumber\":\"4452-AB\",\"locationAddress\":\"College Ave, Centro 02, Tuguegarao City\",\"title\":\"Impact Sensor False Alarm - Cancelled by User\",\"type\":\"false_alarm\",\"lat\":17.6085,\"lon\":121.7215,\"aMag\":1.2,\"battPct\":95,\"createdAt\":\"" + DateTime.UtcNow.AddMinutes(-45).ToString("o") + "\",\"status\":\"FALSE ALARM\",\"photoUrl\":\"/logo.png\"}"
            );
            _eventsJsonList.Add(
                "{\"id\":\"RAMS-TELEM-6604\",\"deviceToken\":\"RAMS-UNIT-04\",\"deviceName\":\"Wearable Unit 04\",\"riderName\":\"Rider Roberto Gomez\",\"riderRole\":\"Dispatch Logistics Patrol\",\"contactNumber\":\"+63 922 444 5566\",\"emergencyContactName\":\"Clara Gomez\",\"emergencyContactPhone\":\"+63 922 555 6677\",\"emergencyRelationship\":\"Mother\",\"bloodType\":\"AB+\",\"allergies\":\"Aspirin\",\"vehicleModel\":\"Suzuki Raider R150 (Blue)\",\"plateNumber\":\"8831-CD\",\"locationAddress\":\"Buntun Bridge, Tuguegarao City\",\"title\":\"Live GPS Telemetry Beacon Broadcast\",\"type\":\"telemetry\",\"lat\":17.6160,\"lon\":121.7110,\"aMag\":0.9,\"battPct\":99,\"createdAt\":\"" + DateTime.UtcNow.AddMinutes(-2).ToString("o") + "\",\"status\":\"NORMAL TELEMETRY\",\"photoUrl\":\"/logo.png\"}"
            );

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
                            if (!string.IsNullOrEmpty(t))
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

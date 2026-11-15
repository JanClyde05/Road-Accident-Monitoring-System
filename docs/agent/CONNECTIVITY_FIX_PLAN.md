# Receiver Backend Discovery Plan

Eliminates the "reflash the receiver whenever the laptop IP changes" loop.

Status: proposed. Enforced by `FW-001` through `FW-005` in
`scripts/verify/check_invariants.py`.

---

## 1. Summary

The receiver currently compiles its upload target into flash:

```c
// firmware/receiver_withDesktop/config.h:44
#define BACKEND_URL "http://10.238.240.180:8888"
```

A DHCP lease change, a new router, a different laptop, or a hotspot rename all
turn a working unit into a silent black hole. There is no runtime override and
no way to observe the failure from the field: uploads fail, the local queue
fills, and the only recovery is a USB cable and a rebuild.

The fix is a four-level resolution ladder with a validated cache:

1. Last known good host from NVS, confirmed by an HTTP health probe.
2. UDP broadcast discovery on port 8889, repeated three times.
3. The compile-time fallback address.
4. Manual entry in the captive portal, applied without a reboot.

The receiver stops caring what the IP is. It only cares that
`http://<host>:<port>/api/health` answers.

## 2. Evidence

| Fact | Location |
| --- | --- |
| Private IP is the active define | `firmware/receiver_withDesktop/config.h:44` |
| Upload URL is built from it twice | `firmware/receiver_withDesktop/http_upload.cpp:39`, `:136` |
| NVS stores only Wi-Fi credentials | `firmware/receiver_withDesktop/nvs_store.cpp:13-19` |
| Portal accepts SSID and password only | `firmware/receiver_withDesktop/wifi_manager.cpp:312` |
| Desktop bridge listens on all interfaces at 8888 | `apps/new_ai_applications/desktop_ai_app/Program.cs:596` |
| Desktop HTTP UI binds loopback only | `apps/new_ai_applications/desktop_ai_app/Program.cs:146-147` |
| Bridge parses HTTP by hand and ignores the path | `apps/new_ai_applications/desktop_ai_app/Program.cs:624-684` |

Two consequences worth stating explicitly:

- Port 8888 is not the same server as the 8080 UI. 8888 is a hand-rolled TCP
  listener that accepts any POST with a body and returns a fixed
  `{"status":"OK"}`. Any health probe must target 8888, not 8080.
- `StartLanReceiverBridge()` swallows every exception. If 8888 is taken, the
  application starts, looks healthy, and never ingests a packet. Discovery will
  make that failure visible, and the bridge must log the bind failure.

## 3. Why editing the define is the wrong fix

| Option | Why it fails |
| --- | --- |
| Change the IP and rebuild | The unit is inside an enclosure. Every network change is a bench visit. |
| Static IP on the laptop | Works until the phone hotspot subnet changes, which is exactly when the system is used. |
| mDNS only | Android hotspots and many consumer APs drop multicast. It is a good secondary signal, not a primary. |
| Hardcode a hostname | Requires DNS on the LAN; a phone hotspot has none. |

The only stable assumption is that both devices share a broadcast domain and the
desktop can answer a datagram.

## 4. Target behavior

```
boot
 |
 +-- NVS host present? -- yes --> health probe (1200 ms)
 |                                  |-- 200 --> use it
 |                                  +-- fail -> keep as suspect, continue
 |
 +-- UDP discovery, 3 x 450 ms
 |        |-- valid response + health 200 --> save to NVS, use it
 |
 +-- compile-time fallback (BACKEND_URL_FALLBACK)
 |
 +-- unresolved: queue locally, retry discovery every 60 s
```

Runtime rules:

- Every 10 minutes, re-probe the active host. A moved laptop is picked up within
  one interval without a reboot.
- After 3 consecutive upload failures, mark the host suspect, run discovery once,
  and only switch if the new host passes the health probe. Never drop a working
  host for an unvalidated one.
- The portal override takes effect immediately and is written to NVS.

Latency budget: worst case boot resolution is about 2.7 s (1.2 s probe + 1.35 s
discovery). That is inside the existing `WIFI_CONNECT_TIMEOUT_MS` of 15 s and
does not delay LoRa reception, which runs on its own task.

<a id="stage-1"></a>
## 5. Stage 1 - Discovery protocol and resolver module

### Wire format

Request, UDP to `255.255.255.255:8889` and to the subnet-directed broadcast:

```
RAMS_DISCOVER_V1 <8 hex nonce>
```

Response, unicast back to the sender:

```json
{"svc":"rams-desktop","v":1,"host":"192.168.1.42","port":8888,"nonce":"a1b2c3d4"}
```

Rules that keep this safe and cheap:

- The responder answers only to the exact magic prefix and only with a unicast
  reply. No reflection, no amplification.
- The nonce must match, so a stale or spoofed reply from another subnet is
  ignored.
- `host` and `port` are both data. A port change needs no firmware change.
- The receiver validates the candidate with `GET /api/health` before persisting.
- Discovery runs on an ephemeral local port, so it cannot collide with the
  desktop listener.

### `config.h`

```c
// Replace the single hardcoded URL with a fallback plus discovery constants.
#define BACKEND_URL_FALLBACK   ""            // empty = no compile-time default
#define BACKEND_UDP_PORT       8889
#define BACKEND_HEALTH_PATH    "/api/health"
#define BACKEND_PROBE_TIMEOUT_MS 1200
#define BACKEND_DISCOVER_TRIES 3
#define BACKEND_DISCOVER_WINDOW_MS 450
#define BACKEND_REPROBE_INTERVAL_MS 600000UL   // 10 min
#define BACKEND_FAIL_THRESHOLD 3
```

Leaving the fallback empty is deliberate: a wrong default is worse than no
default, because it produces confident failures. Set it only for a fixed
installation.

### `backend_resolver.h`

```c
#pragma once
#include <Arduino.h>

void     backendInit();
bool     backendResolve();
String   backendBaseUrl();          // "http://host:port", empty if unresolved
String   backendHost();
uint16_t backendPort();
bool     backendUsingFallback();
void     backendSetManual(const String& hostPort);
void     backendNoteUpload(bool ok);
void     backendTick();             // call from loop()
```

### `backend_resolver.cpp`

```c
#include "backend_resolver.h"
#include "config.h"
#include "nvs_store.h"
#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>

static WiFiUdp  _udp;
static String   _host;
static uint16_t _port = 0;
static bool     _fallback = false;
static uint32_t _lastProbeMs = 0;
static uint8_t  _failStreak = 0;
static uint32_t _nonceSeq = 0;

static bool _health(const String& host, uint16_t port) {
  WiFiClient c;
  if (!c.connect(host.c_str(), port, BACKEND_PROBE_TIMEOUT_MS)) return false;
  c.printf("GET %s HTTP/1.1\r\nHost: %s\r\nConnection: close\r\n\r\n",
           BACKEND_HEALTH_PATH, host.c_str());
  uint32_t start = millis();
  while (!c.available() && millis() - start < BACKEND_PROBE_TIMEOUT_MS) delay(5);
  if (!c.available()) { c.stop(); return false; }
  String status = c.readStringUntil('\n');
  c.stop();
  return status.indexOf(" 200") > 0;
}

static bool _adopt(const String& host, uint16_t port, bool persist) {
  if (!_health(host, port)) return false;
  _host = host;
  _port = port;
  _fallback = false;
  _failStreak = 0;
  _lastProbeMs = millis();
  if (persist) nvsSaveBackend(host, port);
  Serial.printf("[NET] Backend resolved to %s:%u\n", host.c_str(), port);
  return true;
}

static bool _discoverOnce() {
  _udp.stop();
  if (!_udp.begin(0)) return false;

  char req[40];
  char nonce[9];
  snprintf(nonce, sizeof(nonce), "%08lx",
           (unsigned long)((++_nonceSeq * 2654435761UL) ^ millis()));
  snprintf(req, sizeof(req), "RAMS_DISCOVER_V1 %s", nonce);

  IPAddress mask = WiFi.subnetMask();
  IPAddress bcast = WiFi.localIP();
  for (int i = 0; i < 4; i++) bcast[i] |= (uint8_t)~mask[i];

  const IPAddress targets[2] = { IPAddress(255, 255, 255, 255), bcast };
  for (int i = 0; i < 2; i++) {
    _udp.beginPacket(targets[i], BACKEND_UDP_PORT);
    _udp.write((const uint8_t*)req, strlen(req));
    _udp.endPacket();
  }

  bool found = false;
  uint32_t deadline = millis() + BACKEND_DISCOVER_WINDOW_MS;
  char buf[192];
  while (!found && millis() < deadline) {
    int len = _udp.parsePacket();
    if (len > 0 && len < (int)sizeof(buf)) {
      int n = _udp.read(buf, sizeof(buf) - 1);
      buf[n] = 0;
      JsonDocument doc;
      if (deserializeJson(doc, buf) == DeserializationError::Ok
          && doc["svc"] == "rams-desktop"
          && doc["nonce"] == nonce) {
        String host = doc["host"] | "";
        uint16_t port = doc["port"] | 0;
        if (host.isEmpty()) host = _udp.remoteIP().toString();
        found = _adopt(host, port, true);
      }
    }
    delay(5);
  }
  _udp.stop();
  return found;
}

void backendInit() {
  _host = nvsGetBackendHost();
  _port = nvsGetBackendPort();
  if (_host.isEmpty() || _port == 0) {
    _host = ""; _port = 0;
  }
}

bool backendResolve() {
  if (!wifiIsConnected()) return false;
  if (!_host.isEmpty() && _adopt(_host, _port, false)) return true;
  for (int i = 0; i < BACKEND_DISCOVER_TRIES; i++) {
    if (_discoverOnce()) return true;
    delay(120);
  }
  if (strlen(BACKEND_URL_FALLBACK) > 0) {
    String fb = BACKEND_URL_FALLBACK;
    int colon = fb.lastIndexOf(':');
    _host = fb.substring(0, colon);
    _port = fb.substring(colon + 1).toInt();
    _fallback = true;
    Serial.println(F("[NET] Using compile-time fallback"));
    return true;
  }
  Serial.println(F("[NET] Backend unresolved; events stay queued"));
  return false;
}

String backendBaseUrl() {
  if (_host.isEmpty() || _port == 0) return "";
  return "http://" + _host + ":" + String(_port);
}

String backendHost() { return _host; }
uint16_t backendPort() { return _port; }
bool backendUsingFallback() { return _fallback; }

void backendSetManual(const String& hostPort) {
  String v = hostPort;
  v.trim();
  int colon = v.lastIndexOf(':');
  String h = colon > 0 ? v.substring(0, colon) : v;
  uint16_t p = colon > 0 ? v.substring(colon + 1).toInt() : 8888;
  if (h.isEmpty() || p == 0) return;
  _adopt(h, p, true);
}

void backendNoteUpload(bool ok) {
  if (ok) {
    _failStreak = 0;
    _lastProbeMs = millis();
    return;
  }
  if (_failStreak < 255) _failStreak++;
}

void backendTick() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (_host.isEmpty()) { backendResolve(); return; }
  uint32_t now = millis();
  if (now - _lastProbeMs < BACKEND_REPROBE_INTERVAL_MS) return;
  _lastProbeMs = now;
  if (_failStreak >= BACKEND_FAIL_THRESHOLD) {
    Serial.println(F("[NET] Backend suspect; rediscovering"));
    _host = "";
    backendResolve();
    return;
  }
  if (_health(_host, _port)) _failStreak = 0;
  else _failStreak++;
}
```

`backendSetManual()` should be called from the portal handler, not from the main
loop, so validation happens before the response is written.

<a id="stage-2"></a>
## 6. Stage 2 - NVS cache

Add to `nvs_store.cpp`, using the existing `rams_rx` namespace and `_prefs`
handle:

```c
void nvsSaveBackend(const String& host, uint16_t port) {
  _prefs.putString("backend_host", host);
  _prefs.putUShort("backend_port", port);
  _prefs.putUInt("backend_ts", (uint32_t)(millis() / 1000));
}

String nvsGetBackendHost() { return _prefs.getString("backend_host", ""); }
uint16_t nvsGetBackendPort() { return _prefs.getUShort("backend_port", 0); }

void nvsClearBackend() {
  _prefs.remove("backend_host");
  _prefs.remove("backend_port");
  _prefs.remove("backend_ts");
}
```

Declare all three in `nvs_store.h`. Do not store the URL string: host and port
have different change rates and a combined string invites parse bugs.

<a id="stage-3"></a>
## 7. Stage 3 - Upload path

Two call sites, identical change:

```c
// http_upload.cpp:39 and :136
String url = backendBaseUrl() + String(UPLOAD_ENDPOINT);
if (url.length() <= 8) {           // "http://" only, nothing resolved
  httpUploadNoteResult(false);
  return false;
}
```

and after the HTTP exchange:

```c
httpUploadNoteResult(httpResponseCode > 0 && httpResponseCode < 400);
```

`httpUploadNoteResult()` is a thin wrapper over `backendNoteUpload()` in
`http_upload.cpp` so that the resolver keeps a single failure counter.

This makes `FW-002` pass and removes the last place where a stale constant can
silently win.

<a id="stage-4"></a>
## 8. Stage 4 - Portal override

The portal is the recovery path when discovery is blocked (guest Wi-Fi with
client isolation, for example). Add one optional field to the existing
`/connect` form:

```html
<label for="server">Server address (optional)</label>
<input id="server" name="server" placeholder="192.168.1.42:8888" />
```

Handler change at `wifi_manager.cpp:312`:

```cpp
String server;
if (request->hasParam("server", true)) {
  server = request->getParam("server", true)->value();
  server.trim();
  if (server.length() > 63 || server.indexOf(' ') >= 0) {
    request->send(400, "application/json", "{\"error\":\"invalid server\"}");
    return;
  }
}
```

After the Wi-Fi credentials are accepted and the station connects, apply it:

```cpp
if (server.length()) backendSetManual(server);
```

The portal must not require the field. An empty value keeps the discovery path.

<a id="stage-1-desktop"></a>
<a id="stage-5"></a>
## 9. Stage 5 - Desktop responder

Add a `UdpDiscoveryResponder` to `Program.cs`, started next to
`StartLanReceiverBridge()`.

```csharp
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

private static void DiscoveryWorker()
{
    var remote = new IPEndPoint(IPAddress.Any, 0);
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
    }
}
```

`LocalAddressFor` picks the local IPv4 address in the same /24 as the requester,
falling back to the first non-loopback address. This matters on a laptop with
Wi-Fi, Ethernet, and a Hyper-V adapter: the naive first address is often the
virtual one.

Also add a real health route to `HandleLanClient`, before the generic POST
branch:

```csharp
if (req.StartsWith("GET " + "/api/health"))
{
    string body = "{\"status\":\"OK\",\"svc\":\"rams-desktop\",\"port\":8888}";
    byte[] payload = Encoding.UTF8.GetBytes(body);
    string head = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n" +
                  "Connection: close\r\nContent-Length: " + payload.Length + "\r\n\r\n";
    byte[] headBytes = Encoding.ASCII.GetBytes(head);
    stream.Write(headBytes, 0, headBytes.Length);
    stream.Write(payload, 0, payload.Length);
    return;
}
```

The existing response hardcodes `Content-Length: 15`, which is only correct for
`{"status":"OK"}`. Compute it. And log the catch block in
`StartLanReceiverBridge()`:

```csharp
catch (Exception ex)
{
    Console.WriteLine("[LAN-BRIDGE] Failed to bind 8888: {0}", ex.Message);
}
```

Firewall, run once per machine (private profile only, never public):

```powershell
netsh advfirewall firewall add rule name="RAMS Discovery UDP 8889" dir=in action=allow protocol=UDP localport=8889 profile=private
netsh advfirewall firewall add rule name="RAMS Ingestion TCP 8888" dir=in action=allow protocol=TCP localport=8888 profile=private
```

<a id="stage-6"></a>
## 10. Stage 6 - Verification and rollout

Order matters. Each step is independently shippable.

1. Desktop: discovery responder, health route, bind logging, firewall rule.
   Old receivers keep posting to 8888 and are unaffected.
2. Receiver: resolver, NVS, upload path, portal field.
   Old desktops simply do not answer discovery, so the fallback applies.
3. Run `python scripts/verify/check_invariants.py --filter FW-` until `FW-001`
   through `FW-005` pass.
4. Field test with the acceptance matrix below.

Rollback is a single revert of the receiver commit. The desktop addition is
inert without a receiver that asks.

## 11. Failure modes

| Symptom | Likely cause | Observable signal |
| --- | --- | --- |
| Boot hangs, no LoRa LEDs | Discovery blocking before Wi-Fi is up | `[NET]` lines absent after `[WIFI]` |
| Never resolves | AP client isolation blocks broadcast | 3 discovery attempts logged, then fallback or queue |
| Resolves to the wrong host | Another machine answers the magic string | nonce mismatch or health probe rejects it |
| Uploads fail after a laptop sleep | Host address changed, cache stale | fail streak reaches 3, rediscovery runs |
| 8888 bound by another process | Bridge catches and swallows | new `[LAN-BRIDGE] Failed to bind 8888` line |

## 11a. Build budget

<a id="build-budget"></a>

The baseline receiver build reports:

```
Sketch uses 1304383 bytes (99%) of program storage space. Maximum is 1310720 bytes.
Global variables use 45596 bytes (13%) of dynamic memory.
```

That is 6,337 bytes of headroom. `backend_resolver.cpp` plus its format strings
and the JSON parse path will not fit reliably. Change the partition scheme before
writing the module, not after a failed link:

```bat
"%CLI%" compile --fqbn esp32:esp32:esp32s3:CDCOnBoot=cdc,PartitionScheme=huge_app "%~dp0."
"%CLI%" upload  -p %PORT% --fqbn esp32:esp32:esp32s3:CDCOnBoot=cdc,PartitionScheme=huge_app "%~dp0."
```

`huge_app` gives a 3 MB application partition and drops OTA, which this product
does not use (updates are over USB). `verify_all.ps1` must use the same FQBN so a
green build means a flashable build. `FW-009` tracks this.

## 12. Acceptance tests

| ID | Test | Pass condition |
| --- | --- | --- |
| NET-01 | Change the laptop Wi-Fi IP, power-cycle the receiver | Resolves within 10 s, no reflash, first event arrives |
| NET-02 | Move the desktop to port 8890 and update the responder | Receiver follows the advertised port |
| NET-03 | Block UDP 8889 on the AP | Receiver uses the NVS host or fallback, and logs the failure |
| NET-04 | Enter a wrong host in the portal, then the correct one | Bad value rejected, good value applied without reboot |
| NET-05 | Leave the receiver off for a week, then boot | Cached host is used, probe succeeds, no discovery traffic needed |
| NET-06 | Two desktops on the same LAN | Nonce and health probe pick a working host; no flapping after 10 minutes |
| NET-07 | Desktop closed, receiver running | Events queue locally, no crash, uploads resume after desktop starts |

## 13. Non-goals

- mDNS as a primary mechanism. It is a reasonable tertiary signal later; it does
  not survive hotspot multicast filtering.
- Cloud discovery or a registration service. The product must work on an isolated
  LAN.
- Changing the 8888 ingestion contract or the JSON payload shape.

## 14. Open questions

1. Should the responder advertise the UI port (8080-8095) as well, so a phone on
   the same LAN can open the dashboard? Currently only the ingestion port is
   needed.
2. Is a shared secret required on the discovery reply? On a hostile LAN the
   health probe already limits damage to "a host that answers 200", and uploads
   carry no credentials. Add a token only if the deployment requires it.

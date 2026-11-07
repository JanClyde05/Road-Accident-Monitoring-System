/*
 * Road Accident Monitoring System — WebSocket Stream Implementation
 * ====================================================================
 * Streams IMU samples as JSON over WebSocket at 100Hz.
 *
 * Each sample format:
 *   {"trial_id":"...","label":"...","t_ms":12345,
 *    "ax":0.01,"ay":-0.02,"az":1.00,"gx":0.5,"gy":-0.3,"gz":0.1}
 *
 * The companion web page (data/index.html) receives these, accumulates
 * them client-side, and offers a CSV download button.
 */

#include "ws_stream.h"
#include <WebSocketsServer.h>

static WebSocketsServer _ws(81);
static String _trialId = "default";
static String _label = "unlabeled";
static bool _clientConnected = false;

static void _onEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      _clientConnected = true;
      Serial.printf("[WS] Client #%u connected\n", num);
      break;
    case WStype_DISCONNECTED:
      _clientConnected = false;
      Serial.printf("[WS] Client #%u disconnected\n", num);
      break;
    case WStype_TEXT: {
      // Receive trial metadata updates from the companion page
      String msg = String((char*)payload);
      if (msg.indexOf("\"trial_id\"") >= 0) {
        int s1 = msg.indexOf("\"trial_id\":\"") + 12;
        int e1 = msg.indexOf("\"", s1);
        if (s1 > 11 && e1 > s1) _trialId = msg.substring(s1, e1);

        int s2 = msg.indexOf("\"label\":\"") + 9;
        int e2 = msg.indexOf("\"", s2);
        if (s2 > 8 && e2 > s2) _label = msg.substring(s2, e2);

        Serial.printf("[WS] Trial: id=%s label=%s\n", _trialId.c_str(), _label.c_str());
      }
      break;
    }
    default: break;
  }
}

void wsStreamInit() {
  _ws.begin();
  _ws.onEvent(_onEvent);
  Serial.println(F("[WS] WebSocket server started on port 81"));
}

void wsStreamUpdate() {
  _ws.loop();
}

bool wsStreamIsConnected() {
  return _clientConnected;
}

void wsStreamSetTrial(const String& trialId, const String& label) {
  _trialId = trialId;
  _label = label;
}

void wsStreamSendSample(const IMUSample& sample, uint32_t timestampMs) {
  if (!_clientConnected) return;

  // Build JSON string — manual concatenation is faster than ArduinoJson
  // for this high-frequency path (100 calls/second)
  char buf[256];
  snprintf(buf, sizeof(buf),
    "{\"trial_id\":\"%s\",\"label\":\"%s\",\"t_ms\":%u,"
    "\"ax\":%.4f,\"ay\":%.4f,\"az\":%.4f,"
    "\"gx\":%.2f,\"gy\":%.2f,\"gz\":%.2f}",
    _trialId.c_str(), _label.c_str(), timestampMs,
    sample.ax, sample.ay, sample.az,
    sample.gx, sample.gy, sample.gz);

  _ws.broadcastTXT(buf);
}

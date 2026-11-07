/*
 * Road Accident Monitoring System — Upload Function
 * ====================================================
 * Receives JSON payloads from the receiver (ESP32) via HTTPS POST.
 *
 * POST /api/upload
 * Body: {
 *   deviceToken, packetType, lat?, lon?, eventType?, battPct?,
 *   aMag?, name?, driveLinkConverted?, timestamp
 * }
 *
 * packetType="register" → upsert into devices store
 * packetType="alert"|"telemetry"|"false_alarm"|"test" → write to events store
 */

import type { Context } from "@netlify/functions";
import {
  saveEvent,
  saveDevice,
  getDevice,
  updateEventIndex,
} from "./store.js";

// Event type display names for the frontend
const EVENT_TYPE_NAMES: Record<number, string> = {
  0: "Fall",
  1: "Skid",
  2: "Direct Impact",
  3: "Ground Shock",
  4: "Wave Motion",
};

export default async (request: Request, context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const {
      deviceToken = "",
      packetType = "",
      lat = 0,
      lon = 0,
      eventType = 0,
      battPct = 0,
      aMag = 0,
      name = "",
      driveLinkConverted = "",
      timestamp = Date.now(),
    } = body;

    console.log(
      `[UPLOAD] Received ${packetType} from token=${deviceToken} at ${lat},${lon}`
    );

    // ── Handle device registration ────────────────────────────────────────
    if (packetType === "register") {
      const deviceData = {
        token: deviceToken,
        name: name,
        photoUrl: driveLinkConverted,
        registeredAt: new Date().toISOString(),
      };

      await saveDevice(deviceToken, deviceData);
      console.log(
        `[UPLOAD] Device registered: token=${deviceToken} name=${name}`
      );

      return new Response(
        JSON.stringify({ status: "ok", type: "register", deviceToken }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Handle telemetry (upsert per-device latest position) ──────────────
    if (packetType === "telemetry") {
      // Look up device profile for display name
      const device = await getDevice(deviceToken);

      const eventId = `evt_telem_${deviceToken}`;
      const eventData = {
        id: eventId,
        deviceToken,
        type: "telemetry",
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        battPct: parseInt(battPct) || 0,
        timestamp: parseInt(timestamp) || Date.now(),
        createdAt: new Date().toISOString(),
        status: "normal",
        title: "Live GPS Telemetry",
        // Joined device info
        deviceName: device?.name || deviceToken,
        photoUrl: device?.photoUrl || "",
      };

      await saveEvent(eventId, eventData);
      await updateEventIndex(eventId);

      return new Response(
        JSON.stringify({ status: "ok", type: "telemetry", deviceToken }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Handle alert / test / false_alarm ──────────────────────────────────
    const device = await getDevice(deviceToken);
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Determine display properties
    let title = "";
    let status = "";

    switch (packetType) {
      case "alert":
        title = `🚨 ${EVENT_TYPE_NAMES[eventType] || "Unknown"} Detected`;
        status = "alert";
        break;
      case "test":
        title = `🧪 Test Alert (${EVENT_TYPE_NAMES[eventType] || "Simulated"})`;
        status = "test";
        break;
      case "false_alarm":
        title = "✅ False Alarm — Cancelled by user";
        status = "false_alarm";
        break;
      default:
        title = `Event: ${packetType}`;
        status = packetType;
    }

    const eventData = {
      id: eventId,
      deviceToken,
      type: packetType,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      eventType: parseInt(eventType) || 0,
      eventTypeName: EVENT_TYPE_NAMES[eventType] || "Unknown",
      aMag: parseFloat(aMag) || 0,
      timestamp: parseInt(timestamp) || Date.now(),
      createdAt: new Date().toISOString(),
      status,
      title,
      // Joined device info
      deviceName: device?.name || deviceToken,
      photoUrl: device?.photoUrl || "",
    };

    await saveEvent(eventId, eventData);

    // Also update the telemetry pin to the alert's location
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    if (parsedLat !== 0 || parsedLon !== 0) {
      const telemId = `evt_telem_${deviceToken}`;
      const telemUpdate = {
        id: telemId,
        deviceToken,
        type: "telemetry",
        lat: parsedLat,
        lon: parsedLon,
        battPct: 0,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        status: "normal",
        title: "Last Known Location",
        deviceName: device?.name || deviceToken,
        photoUrl: device?.photoUrl || "",
      };
      await saveEvent(telemId, telemUpdate);
      await updateEventIndex([eventId, telemId]);
    } else {
      await updateEventIndex(eventId);
    }

    console.log(`[UPLOAD] ✅ Event ${eventId}: ${packetType} from ${deviceToken}`);

    return new Response(
      JSON.stringify({ status: "ok", eventId, type: packetType }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[UPLOAD] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/upload",
};

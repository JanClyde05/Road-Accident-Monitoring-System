/*
 * Road Accident Monitoring System — Events Function
 * ====================================================
 * Returns event log (JSON) for the frontend dashboard.
 * Polled every 2-3 seconds by the React app.
 *
 * GET /api/events          → all events (newest first)
 * GET /api/events?id=xxx   → single event detail
 * DELETE /api/events       → clear all events
 */

import type { Context } from "@netlify/functions";
import { getEvent, getEventIndex, clearAllStores } from "./store.js";

export default async (request: Request, context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  try {
    const url = new URL(request.url);
    const eventId = url.searchParams.get("id");
    const clearParam = url.searchParams.get("clear");

    // ── Clear all events ──────────────────────────────────────────────────
    if (request.method === "DELETE" || clearParam === "true") {
      await clearAllStores();
      return new Response(
        JSON.stringify({ status: "ok", message: "All events cleared" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Single event detail ───────────────────────────────────────────────
    if (eventId) {
      const event = await getEvent(eventId);
      if (!event) {
        return new Response(JSON.stringify({ error: "Event not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(event), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── List all events (newest first) ────────────────────────────────────
    const index = await getEventIndex();
    const events = [];

    for (const id of index) {
      const evt = await getEvent(id);
      if (evt) {
        events.push(evt);
      }
    }

    // Sort newest first
    events.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
      return timeB - timeA;
    });

    return new Response(
      JSON.stringify({ events, total: events.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[EVENTS] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: ["/api/events", "/api/events/*"],
};

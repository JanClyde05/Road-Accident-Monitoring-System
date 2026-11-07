/*
 * Road Accident Monitoring System — Netlify Blob Store
 * ======================================================
 * Two blob stores:
 *   "events"  — alert, telemetry, false_alarm, test events
 *   "devices" — registered device profiles (token, name, photoUrl)
 *
 * In-memory fallback for local development without Netlify Blobs.
 */

import { getStore } from "@netlify/blobs";

// ── In-Memory Fallback ──────────────────────────────────────────────────────

const memoryEvents = new Map<string, any>();
const memoryDevices = new Map<string, any>();
let memoryIndex: string[] = [];

// ── Events ──────────────────────────────────────────────────────────────────

export async function saveEvent(eventId: string, eventData: any) {
  memoryEvents.set(eventId, eventData);
  try {
    const store = getStore("events");
    await store.setJSON(eventId, eventData);
  } catch (err) {
    console.warn(`[STORE] Netlify Blobs unavailable for event ${eventId}`);
  }
}

export async function getEvent(eventId: string): Promise<any> {
  try {
    const store = getStore("events");
    const data = await store.get(eventId, { type: "json" });
    if (data) return data;
  } catch {}
  return memoryEvents.get(eventId) || null;
}

export async function getEventIndex(): Promise<string[]> {
  let blobsIndex: string[] = [];
  try {
    const store = getStore("events");
    const existing = (await store.get("_index", { type: "json" })) as
      | string[]
      | null;
    if (existing && Array.isArray(existing)) blobsIndex = existing;

    // Auto-discover unindexed event blobs
    const { blobs } = await store.list();
    if (blobs && Array.isArray(blobs)) {
      const discovered = blobs
        .map((b) => b.key)
        .filter((k) => k !== "_index" && k.startsWith("evt_"));
      blobsIndex = Array.from(new Set([...blobsIndex, ...discovered]));
    }
  } catch {}

  return Array.from(
    new Set([
      ...memoryIndex,
      ...blobsIndex,
      ...Array.from(memoryEvents.keys()),
    ])
  ).slice(0, 200);
}

export async function updateEventIndex(eventIds: string | string[]) {
  const idsToAdd = Array.isArray(eventIds) ? eventIds : [eventIds];
  let index = await getEventIndex();

  for (const id of idsToAdd) {
    index = [id, ...index.filter((existing) => existing !== id)];
  }
  index = index.slice(0, 200);
  memoryIndex = index;

  try {
    const store = getStore("events");
    await store.setJSON("_index", index);
  } catch {}
}

// ── Devices ─────────────────────────────────────────────────────────────────

export async function saveDevice(token: string, deviceData: any) {
  memoryDevices.set(token, deviceData);
  try {
    const store = getStore("devices");
    await store.setJSON(token, deviceData);
  } catch (err) {
    console.warn(`[STORE] Netlify Blobs unavailable for device ${token}`);
  }
}

export async function getDevice(token: string): Promise<any> {
  try {
    const store = getStore("devices");
    const data = await store.get(token, { type: "json" });
    if (data) return data;
  } catch {}
  return memoryDevices.get(token) || null;
}

// ── Clear ───────────────────────────────────────────────────────────────────

export async function clearAllStores() {
  memoryEvents.clear();
  memoryDevices.clear();
  memoryIndex = [];

  try {
    const eventStore = getStore("events");
    const existingIndex = (await eventStore.get("_index", {
      type: "json",
    })) as string[] | null;
    if (existingIndex && Array.isArray(existingIndex)) {
      for (const id of existingIndex) {
        try {
          await eventStore.delete(id);
        } catch {}
      }
    }
    await eventStore.setJSON("_index", []);
  } catch {}
}

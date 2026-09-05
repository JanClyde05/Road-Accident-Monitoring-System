import express from "express";
import path from "path";
import multer from "multer";
import cors from "cors";
import { createServer as createViteServer } from "vite";

interface StoredEvent {
  id: string;
  deviceName?: string;
  deviceToken?: string;
  lat: number;
  lon: number;
  type: string;
  isTelemetry?: boolean;
  audioKey?: string;
  audioSize?: number;
  batt?: number | string;
  battPct?: number;
  aMag?: number;
  signal?: number | string;
  speed?: number;
  accuracy?: number;
  createdAt: string;
  status?: 'normal' | 'alert' | 'critical';
  title?: string;
  eventTypeName?: string;
  photoUrl?: string;
  riderName?: string;
  riderRole?: string;
  contactNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelationship?: string;
  bloodType?: string;
  allergies?: string;
  vehicleModel?: string;
  plateNumber?: string;
  locationAddress?: string;
  formFactor?: string;
  firmware?: string;
}

// Stores binary WAV audio files in memory
const audioStore = new Map<string, Buffer>();

// Helper to generate sample WAV tone
function generateSampleWavBuffer(durationSeconds = 4, freq = 440): Buffer {
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = sampleRate * durationSeconds;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.sin((Math.PI * i) / numSamples);
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.4 + Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.15;
    const intSample = Math.floor(sample * envelope * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

const sampleWavCache = generateSampleWavBuffer(4, 440);

function getSampleEvents(): StoredEvent[] {
  return [
    {
      id: "evt-rams-01",
      deviceName: "Juan Dela Cruz",
      deviceToken: "DEV-8821",
      lat: 17.61325,
      lon: 121.72705,
      type: "alert",
      title: "Severe Impact Collision Detected",
      eventTypeName: "Impact / High G Shock",
      aMag: 4.82,
      battPct: 78,
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      riderName: "Juan Dela Cruz",
      riderRole: "Express Delivery Courier",
      contactNumber: "+63 917 555 2381",
      emergencyContactName: "Elena Dela Cruz",
      emergencyContactPhone: "+63 928 444 8920",
      emergencyRelationship: "Spouse / Next of Kin",
      bloodType: "O+",
      allergies: "Penicillin, NSAIDs (Alert EMT)",
      vehicleModel: "Yamaha Sniper 155",
      plateNumber: "NCR-8821",
      locationAddress: "Maharlika Highway cor. Caritan Norte, Tuguegarao City",
      formFactor: "Belt Clip-On Wearable",
      firmware: "v2.4.1-LoRa915",
      createdAt: new Date(Date.now() - 35000).toISOString(),
      status: "critical"
    },
    {
      id: "evt-rams-02",
      deviceName: "Maria Santos",
      deviceToken: "DEV-4319",
      lat: 17.61850,
      lon: 121.73120,
      type: "test",
      title: "Routine Diagnostic Sensor Calibration",
      eventTypeName: "Manual Test Broadcast",
      aMag: 1.15,
      battPct: 92,
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
      riderName: "Maria Santos",
      riderRole: "Elderly Care Wearable",
      contactNumber: "+63 918 222 1099",
      emergencyContactName: "Dr. Carlos Santos",
      emergencyContactPhone: "+63 920 333 4455",
      emergencyRelationship: "Son / Primary Physician",
      bloodType: "A+",
      allergies: "None Reported",
      vehicleModel: "Pedestrian / Wheelchair Assisted",
      plateNumber: "N/A (Pedestrian)",
      locationAddress: "College Avenue near St. Paul University, Tuguegarao City",
      formFactor: "Lanyard / Chest Clip Wearable",
      firmware: "v2.4.0-LoRa915",
      createdAt: new Date(Date.now() - 140000).toISOString(),
      status: "normal"
    },
    {
      id: "evt-rams-03",
      deviceName: "Gabriel Mendoza",
      deviceToken: "DEV-9904",
      lat: 17.60910,
      lon: 121.72140,
      type: "telemetry",
      title: "Active Road Transit Telemetry Ping",
      eventTypeName: "GPS Beacon",
      aMag: 0.95,
      battPct: 65,
      riderName: "Gabriel Mendoza",
      riderRole: "PUV Jeepney Transit Operator",
      contactNumber: "+63 922 888 7766",
      emergencyContactName: "Rosa Mendoza",
      emergencyContactPhone: "+63 922 888 7767",
      emergencyRelationship: "Sister",
      bloodType: "B+",
      allergies: "Sulfa Drugs",
      vehicleModel: "Modernized PUV Isuzu NLR",
      plateNumber: "CAG-9904",
      locationAddress: "Buntun Bridge Highway, Tuguegarao City",
      formFactor: "Dashboard Clip Mount",
      firmware: "v2.4.1-LoRa915",
      createdAt: new Date(Date.now() - 260000).toISOString(),
      status: "normal"
    },
    {
      id: "evt-rams-04",
      deviceName: "Roberto Rivera",
      deviceToken: "DEV-7712",
      lat: 17.62500,
      lon: 121.73800,
      type: "false_alarm",
      title: "Pothole Shock Trigger (User Cleared)",
      eventTypeName: "False Positive Dismissed",
      aMag: 2.45,
      battPct: 88,
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      riderName: "Roberto Rivera",
      riderRole: "Tricycle Transport Operator",
      contactNumber: "+63 927 654 3210",
      emergencyContactName: "Mercedes Rivera",
      emergencyContactPhone: "+63 919 876 5432",
      emergencyRelationship: "Wife",
      bloodType: "O+",
      allergies: "Aspirin Sensitivity",
      vehicleModel: "Kawasaki Barako 175 with Sidecar",
      plateNumber: "TRIC-7712",
      locationAddress: "Balzain East cor. National Rd, Tuguegarao City",
      formFactor: "Handlebar / Vest Clip Wearable",
      firmware: "v2.4.1-LoRa915",
      createdAt: new Date(Date.now() - 480000).toISOString(),
      status: "normal"
    },
    {
      id: "evt-telemetry-latest",
      deviceName: "GuardianTrack Wearable #1",
      deviceToken: "GT-WEAR-01",
      lat: 17.6150,
      lon: 121.7240,
      type: "telemetry",
      isTelemetry: true,
      batt: 88,
      signal: 95,
      speed: 1.4,
      accuracy: 2.8,
      createdAt: new Date().toISOString(),
      status: "normal",
      title: "Live GPS Telemetry Pin"
    },
    {
      id: "evt-audio-init",
      deviceName: "GuardianTrack Wearable #1",
      deviceToken: "GT-WEAR-01",
      lat: 17.6110,
      lon: 121.7290,
      type: "audio",
      isTelemetry: false,
      audioKey: "alert_sample.wav",
      audioSize: 64044,
      batt: 88,
      signal: 92,
      speed: 1.1,
      accuracy: 3.2,
      createdAt: new Date(Date.now() - 120000).toISOString(),
      status: "alert",
      title: "Wearable Audio Alert Capture"
    }
  ];
}

// In-memory events store initialized with sample telemetry
let eventsStore: StoredEvent[] = getSampleEvents();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  const upload = multer({ storage: multer.memoryStorage() });

  // 1. GET /api/events (Return events list, single event detail, or stream audio)
  app.get("/api/events", (req, res) => {
    const audioKey = req.query.audio as string;
    const eventId = req.query.id as string;

    if (audioKey) {
      let storedBuffer = audioStore.get(audioKey);
      if (!storedBuffer && !audioKey.endsWith(".wav")) {
        storedBuffer = audioStore.get(`${audioKey}.wav`);
      }
      if (!storedBuffer && audioKey.endsWith(".wav")) {
        storedBuffer = audioStore.get(audioKey.replace(/\.wav$/, ""));
      }

      const bufferToSend = storedBuffer || sampleWavCache;

      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", bufferToSend.length);
      res.setHeader("Accept-Ranges", "bytes");
      return res.send(bufferToSend);
    }

    if (eventId) {
      const target = eventsStore.find(e => e.id === eventId || e.id.replace(/\.wav$/, '') === eventId.replace(/\.wav$/, ''));
      if (target) return res.json(target);
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({
      status: "ok",
      count: eventsStore.length,
      events: eventsStore
    });
  });

  // POST /api/events (Create incident event from RAMS dashboard)
  app.post("/api/events", (req, res) => {
    const newEvt: StoredEvent = {
      id: req.body.id || `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      deviceName: req.body.deviceName || req.body.riderName || "Juan Dela Cruz",
      deviceToken: req.body.deviceToken || "DEV-8821",
      lat: parseFloat(req.body.lat) || 17.6132,
      lon: parseFloat(req.body.lon) || 121.7270,
      type: req.body.type || "alert",
      title: req.body.title || "Severe Deceleration Incident Detected",
      eventTypeName: req.body.eventTypeName || "Impact Collision Sensor",
      aMag: parseFloat(req.body.aMag) || 3.84,
      battPct: parseInt(req.body.battPct, 10) || 84,
      photoUrl: req.body.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      riderName: req.body.riderName || req.body.deviceName || "Juan Dela Cruz",
      riderRole: req.body.riderRole || "Express Delivery Courier",
      contactNumber: req.body.contactNumber || "+63 917 555 2381",
      emergencyContactName: req.body.emergencyContactName || "Elena Dela Cruz",
      emergencyContactPhone: req.body.emergencyContactPhone || "+63 928 444 8920",
      emergencyRelationship: req.body.emergencyRelationship || "Spouse / Next of Kin",
      bloodType: req.body.bloodType || "O+",
      allergies: req.body.allergies || "Penicillin, NSAIDs (Alert EMT)",
      vehicleModel: req.body.vehicleModel || "Yamaha Sniper 155",
      plateNumber: req.body.plateNumber || "NCR-8821",
      locationAddress: req.body.locationAddress || "Maharlika Highway, Tuguegarao City",
      formFactor: req.body.formFactor || "Belt Clip-On Wearable",
      firmware: req.body.firmware || "v2.4.1-LoRa915",
      createdAt: new Date().toISOString(),
      status: req.body.type === "alert" ? "critical" : "normal"
    };
    eventsStore.unshift(newEvt);
    console.log(`[RAMS] Incident created: ${newEvt.id} (${newEvt.type})`);
    res.json({
      status: "success",
      eventId: newEvt.id,
      event: newEvt
    });
  });

  // 2. DELETE /api/events (Clear logs)
  app.delete("/api/events", (req, res) => {
    eventsStore = [];
    audioStore.clear();
    res.json({
      status: "ok",
      message: "Events cleared successfully",
      events: eventsStore
    });
  });

  // 3. POST /clear-memory (Purge ESP32 Receiver & Server Memory)
  app.post("/clear-memory", (req, res) => {
    eventsStore = [];
    audioStore.clear();
    console.log("[SERVER] Memory and event store purged.");
    res.json({ status: "ok", message: "Receiver and server memory cleared" });
  });

  // Conditional middleware for /api/upload: handles both multipart/form-data & raw binary audio
  const uploadMiddleware = (req: any, res: any, next: any) => {
    const contentType = (req.headers["content-type"] || "").toLowerCase();
    if (contentType.includes("multipart/form-data")) {
      upload.single("audio")(req, res, next);
    } else {
      express.raw({ type: "*/*", limit: "50mb" })(req, res, next);
    }
  };

  // 4. POST /api/upload (Telemetry & Audio upload endpoint for ESP32 and UI testing)
  app.post("/api/upload", uploadMiddleware, (req: any, res) => {
    try {
      const latStr = (req.query.lat as string) || req.body.lat || req.headers["x-lat"] || "0";
      const lonStr = (req.query.lon as string) || req.body.lon || req.headers["x-lon"] || "0";
      const typeStr = (req.query.type as string) || req.body.type || req.headers["x-type"] || "audio";

      const lat = parseFloat(latStr) || 0;
      const lon = parseFloat(lonStr) || 0;
      const type = typeStr === "telemetry" ? "telemetry" : (typeStr === "sos" ? "sos" : "audio");
      const isTelemetry = type === "telemetry";
      const battRaw = req.body.batt ?? req.query.batt ?? req.headers["x-batt"];
      const batt = (battRaw !== undefined && battRaw !== null && battRaw !== "") ? parseInt(String(battRaw), 10) : 0;

      let audioBuffer: Buffer | null = null;
      if (req.file) {
        audioBuffer = req.file.buffer;
      } else if (Buffer.isBuffer(req.body) && req.body.length > 0) {
        audioBuffer = req.body;
      }

      const audioSize = audioBuffer ? audioBuffer.length : (isTelemetry ? 0 : 64044);
      const eventId = isTelemetry ? "evt-telemetry-latest" : `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const audioKey = !isTelemetry ? `${eventId}.wav` : undefined;

      if (audioBuffer && audioKey) {
        audioStore.set(audioKey, audioBuffer);
      }

      const newEvent: StoredEvent = {
        id: eventId,
        lat,
        lon,
        type,
        isTelemetry,
        audioKey,
        audioSize,
        batt,
        signal: 95,
        speed: parseFloat(req.body.speed || req.query.speed) || 1.1,
        accuracy: 3.2,
        createdAt: new Date().toISOString(),
        status: isTelemetry ? "normal" : (type === "sos" ? "critical" : "alert"),
        title: isTelemetry ? "Live GPS Telemetry Pin" : (type === "sos" ? "Emergency SOS Trigger" : "Wearable Audio Alert Capture")
      };

      if (isTelemetry) {
        eventsStore = eventsStore.filter(e => !e.isTelemetry);
      }

      eventsStore.unshift(newEvent);

      if (!isTelemetry && lat !== 0 && lon !== 0) {
        eventsStore = eventsStore.filter(e => e.id !== "evt-telemetry-latest");
        const telemetryUpdate: StoredEvent = {
          id: "evt-telemetry-latest",
          lat,
          lon,
          type: "telemetry",
          isTelemetry: true,
          batt: batt || 85,
          speed: 0.0,
          accuracy: 0,
          createdAt: new Date().toISOString(),
          status: "normal",
          title: "Last Known Location (from Audio Alert)"
        };
        eventsStore.unshift(telemetryUpdate);
      }

      if (eventsStore.length > 100) {
        eventsStore = eventsStore.slice(0, 100);
      }

      console.log(`[UPLOAD] Event recorded: ${eventId} (${type}), GPS: ${lat}, ${lon}`);

      res.status(200).json({
        status: "success",
        eventId,
        event: newEvent
      });
    } catch (err: any) {
      console.error("[UPLOAD] Error:", err);
      res.status(500).json({ error: err.message || "Failed to process upload" });
    }
  });

  // 5. POST /api/events/seed (Reset with seed data)
  app.post("/api/events/seed", (req, res) => {
    eventsStore = getSampleEvents();
    res.json({ status: "ok", events: eventsStore });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GuardianTrack Server running on port ${PORT}`);
  });
}

startServer();

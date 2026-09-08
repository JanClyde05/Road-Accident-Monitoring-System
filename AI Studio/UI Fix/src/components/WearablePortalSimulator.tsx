import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, 
  Activity, 
  MapPin, 
  ShieldAlert, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Pause, 
  Layers,
  FileText,
  Terminal,
  ChevronRight,
  ChevronLeft,
  Info,
  Radio,
  Sparkles,
  X,
  Copy,
  Check,
  Send,
  Trash2,
  HardDrive,
  Eye,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface WearablePortalSimulatorProps {
  onSwitchToReceiver?: () => void;
}

type WearablePage = 'setup' | 'telemetry' | 'map' | 'protocol';

interface WsPacket {
  id: string;
  time: string;
  dir: 'tx' | 'rx';
  type: 'register' | 'register_result' | 'tel' | 'gps' | 'ping' | 'pong';
  payload: string;
}

interface TutorialStep {
  step: number;
  title: string;
  badge: string;
  target: 'softap' | 'user-name' | 'photo-link' | 'register-btn' | 'navigation';
  description: string;
  actionHint: string;
  tab: WearablePage;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: '1. Connect to Wearable SoftAP',
    badge: 'STEP 1: GET CONNECTED',
    target: 'softap',
    description: 'Power on your wearable safety device. Open Wi-Fi settings on your mobile device or laptop and connect to "RAMS-WEARABLE". The interface establishes an immediate persistent WebSocket uplink on port 81 (no HTTP webserver overhead).',
    actionHint: 'Look for the status badge at the top. When it indicates "PORT 81: CONNECTED", you are ready to proceed.',
    tab: 'setup'
  },
  {
    step: 2,
    title: '2. Register Road User Profile',
    badge: 'STEP 2: ROAD USER PROFILE',
    target: 'user-name',
    description: 'Enter your full name. The RAMS system monitors all road user categories: pedestrians, cyclists, commuters, and motorcyclists. In an emergency or fall, responders instantly access who you are.',
    actionHint: 'Type your full name into the Road User Profile input box.',
    tab: 'setup'
  },
  {
    step: 3,
    title: '3. Attach Emergency Photo Link',
    badge: 'STEP 3: IDENTIFICATION PHOTO',
    target: 'photo-link',
    description: 'Paste a Google Drive image link. Having your photo securely attached allows emergency dispatch and local barangay responders to immediately identify you.',
    actionHint: 'Paste your link, and you will see the image thumbnail preview update in real-time.',
    tab: 'setup'
  },
  {
    step: 4,
    title: '4. Save Device via WebSocket',
    badge: 'STEP 4: SAVE TO DEVICE',
    target: 'register-btn',
    description: 'Click "SAVE & REGISTER (WEBSOCKET)". A compact JSON frame is transmitted over port 81 and permanently saved to the ESP32 NVS flash storage. No HTTP server needed.',
    actionHint: 'Click the high-contrast "SAVE & REGISTER (WEBSOCKET)" action button.',
    tab: 'setup'
  },
  {
    step: 5,
    title: '5. Live Telemetry & Radar Protection',
    badge: 'STEP 5: READY & MONITORING',
    target: 'navigation',
    description: 'Your wearable device is now actively monitoring. It streams high-frequency 100Hz IMU samples over WebSocket and triggers automatic LoRa emergency broadcast packets upon collision.',
    actionHint: 'Use the navigation bar to inspect Live Telemetry, Offline Radar Map, or the raw WebSocket Protocol stream.',
    tab: 'telemetry'
  }
];

export const WearablePortalSimulator: React.FC<WearablePortalSimulatorProps> = ({ onSwitchToReceiver }) => {
  const [currentPage, setCurrentPage] = useState<WearablePage>('telemetry');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  // Tutorial Tour State
  const [isTutorialActive, setIsTutorialActive] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  // Simulated Sensor & Device Data
  const [fsmState, setFsmState] = useState<number>(0); // 0=Idle, 1=Freefall, 2=Impact, 3=Stillness, 4=Emergency
  const [userName, setUserName] = useState<string>('Juan Dela Cruz');
  const [driveLink, setDriveLink] = useState<string>('https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9/view');
  const [regStatus, setRegStatus] = useState<string | null>(null);
  const [deviceToken, setDeviceToken] = useState<string>('RAMS-9921');

  // Telemetry values
  const [accel, setAccel] = useState({ x: 0.04, y: -0.02, z: 0.99, mag: 1.00 });
  const [gyro, setGyro] = useState({ x: 1.2, y: -0.8, z: 0.4 });
  const [gps, setGps] = useState({ lat: 17.6132, lon: 121.7269, sats: 9, hasFix: true });
  const [emergencyCountdown, setEmergencyCountdown] = useState<number | null>(null);
  const [wsLatencyMs, setWsLatencyMs] = useState<number>(4);
  const [wsPacketsCount, setWsPacketsCount] = useState<number>(1420);

  // WebSocket Live Packet Log Stream
  const [wsLogs, setWsLogs] = useState<WsPacket[]>([
    {
      id: 'ws-init-1',
      time: '16:20:00.102',
      dir: 'rx',
      type: 'tel',
      payload: '{"type":"tel","ax":0.038,"ay":-0.019,"az":0.992,"gx":1.1,"gy":-0.7,"gz":0.3,"am":0.993,"fsm":0}'
    },
    {
      id: 'ws-init-2',
      time: '16:20:01.000',
      dir: 'rx',
      type: 'gps',
      payload: '{"type":"gps","lat":17.613240,"lon":121.726910,"sats":9,"fix":true}'
    },
    {
      id: 'ws-init-3',
      time: '16:20:02.450',
      dir: 'tx',
      type: 'register',
      payload: '{"type":"register","name":"Juan Dela Cruz","driveLink":"https://drive.google.com/..."}'
    },
    {
      id: 'ws-init-4',
      time: '16:20:02.482',
      dir: 'rx',
      type: 'register_result',
      payload: '{"type":"register_result","success":true,"token":"RAMS-9921"}'
    }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<Array<[number, number, number]>>([]);

  // FSM Names mapping (Strict Zero-Emoji)
  const fsmNames = [
    '0: IDLE (ARMED)',
    '1: FREEFALL DETECTED',
    '2: IMPACT SPIKE',
    '3: STILLNESS VERIFY',
    '4: EMERGENCY ALARM'
  ];

  // Continuous telemetry stream simulation over WebSocket
  useEffect(() => {
    if (!isStreaming || !wsConnected) return;

    const interval = setInterval(() => {
      setAccel((prev) => {
        let nx = prev.x;
        let ny = prev.y;
        let nz = prev.z;

        if (fsmState === 0) {
          nx = (Math.random() - 0.5) * 0.12;
          ny = (Math.random() - 0.5) * 0.12;
          nz = 0.98 + (Math.random() - 0.5) * 0.08;
        } else if (fsmState === 1) {
          nx = (Math.random() - 0.5) * 0.08;
          ny = (Math.random() - 0.5) * 0.08;
          nz = 0.18 + (Math.random() - 0.5) * 0.08;
        } else if (fsmState === 2) {
          nx = 2.4 + (Math.random() - 0.5) * 1.0;
          ny = 3.1 + (Math.random() - 0.5) * 0.8;
          nz = 4.2 + (Math.random() - 0.5) * 1.5;
        } else if (fsmState === 3 || fsmState === 4) {
          nx = 0.01;
          ny = 0.02;
          nz = 0.99;
        }

        const mag = Math.sqrt(nx * nx + ny * ny + nz * nz);
        historyRef.current.push([nx, ny, nz]);
        if (historyRef.current.length > 100) {
          historyRef.current.shift();
        }
        return { x: nx, y: ny, z: nz, mag };
      });

      setGyro(() => ({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 3,
      }));

      setWsPacketsCount((c) => c + 1);

      // Periodically append a telemetry packet to the live WS console (every ~1.5s to avoid flood)
      if (Math.random() > 0.85) {
        const now = new Date();
        const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
        const newPkt: WsPacket = {
          id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          time: timeStr,
          dir: 'rx',
          type: 'tel',
          payload: `{"type":"tel","ax":${(accel.x).toFixed(3)},"ay":${(accel.y).toFixed(3)},"az":${(accel.z).toFixed(3)},"am":${(accel.mag).toFixed(3)},"fsm":${fsmState}}`
        };
        setWsLogs((prev) => [newPkt, ...prev.slice(0, 49)]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isStreaming, wsConnected, fsmState, accel]);

  // Emergency countdown timer
  useEffect(() => {
    if (fsmState === 4) {
      setEmergencyCountdown(10);
      const timer = setInterval(() => {
        setEmergencyCountdown((c) => {
          if (c === null || c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setEmergencyCountdown(null);
    }
  }, [fsmState]);

  // Waveform canvas drawing (Monochromatic & High-Contrast Axes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, w, h);

    // Center 0g baseline
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    const data = historyRef.current;
    if (data.length < 2) return;

    const step = w / 100;
    const colors = ['#f87171', '#34d399', '#60a5fa']; // X: Red, Y: Green, Z: Blue

    for (let axis = 0; axis < 3; axis++) {
      ctx.strokeStyle = colors[axis];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = i * step;
        const val = data[i][axis];
        let y = h / 2 - val * (h / 8);
        if (y < 2) y = 2;
        if (y > h - 2) y = h - 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [accel]);

  const handleSimulateFall = () => {
    setFsmState(1); // Freefall
    setTimeout(() => {
      setFsmState(2); // Impact
      setTimeout(() => {
        setFsmState(3); // Stillness
        setTimeout(() => {
          setFsmState(4); // Confirmed alarm
          // Inject WS Emergency Alert Packet into log
          const now = new Date();
          const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
          setWsLogs((prev) => [
            {
              id: `ws-alert-${Date.now()}`,
              time: timeStr,
              dir: 'rx',
              type: 'tel',
              payload: `{"type":"tel","fsm":4,"alert":"CRASH_CONFIRMED","peakG":${accel.mag.toFixed(2)},"token":"${deviceToken}"}`
            },
            ...prev
          ]);
        }, 1500);
      }, 1000);
    }, 800);
  };

  const handleResetFsm = () => {
    setFsmState(0);
    setEmergencyCountdown(null);
  };

  const handleMockRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsConnected) return;

    setRegStatus('registering');
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;

    // 1. Client TX frame over WebSocket
    const txPkt: WsPacket = {
      id: `ws-tx-${Date.now()}`,
      time: timeStr,
      dir: 'tx',
      type: 'register',
      payload: JSON.stringify({ type: 'register', name: userName, driveLink })
    };

    setWsLogs((prev) => [txPkt, ...prev]);

    setTimeout(() => {
      const generatedToken = `RAMS-${Math.floor(1000 + Math.random() * 9000)}`;
      setDeviceToken(generatedToken);
      setRegStatus('success');

      // 2. ESP32 RX confirmation frame over WebSocket
      const now2 = new Date();
      const timeStr2 = `${now2.toTimeString().split(' ')[0]}.${String(now2.getMilliseconds()).padStart(3, '0')}`;
      const rxPkt: WsPacket = {
        id: `ws-rx-${Date.now()}`,
        time: timeStr2,
        dir: 'rx',
        type: 'register_result',
        payload: JSON.stringify({ type: 'register_result', success: true, token: generatedToken })
      };
      setWsLogs((prev) => [rxPkt, ...prev]);
    }, 350);
  };

  const handleSendWsPing = () => {
    if (!wsConnected) return;
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const txPkt: WsPacket = {
      id: `ws-ping-${Date.now()}`,
      time: timeStr,
      dir: 'tx',
      type: 'ping',
      payload: '{"type":"ping"}'
    };
    setWsLogs((prev) => [txPkt, ...prev]);

    setTimeout(() => {
      const now2 = new Date();
      const timeStr2 = `${now2.toTimeString().split(' ')[0]}.${String(now2.getMilliseconds()).padStart(3, '0')}`;
      const rxPkt: WsPacket = {
        id: `ws-pong-${Date.now()}`,
        time: timeStr2,
        dir: 'rx',
        type: 'pong',
        payload: '{"type":"pong","uptime":14285,"status":"armed"}'
      };
      setWsLogs((prev) => [rxPkt, ...prev]);
      setWsLatencyMs(Math.floor(2 + Math.random() * 4));
    }, 15);
  };

  return (
    <div className="space-y-6" id="wearable-portal-stage">
      {/* Top Banner & Control Deck */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-950 text-white">
                <Radio className="h-4 w-4" />
              </span>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
                Wearable WebSocket Live Console & Telemetry Stream
              </h2>
              <span className="px-2 py-0.5 rounded border border-neutral-700 bg-neutral-950 text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-wider">
                Port 81 (No WebServer)
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-medium max-w-3xl">
              Production simulator for the Wearable ESP32-S3 dedicated WebSocket architecture (<code className="text-neutral-200 font-mono">ws://192.168.4.1:81/</code>).
              WebServer HTTP routing has been deprecated in favor of full-duplex WebSocket messaging for both on-device profile registration and 100Hz real-time telemetry streaming.
            </p>
          </div>

          {/* Mode Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            {onSwitchToReceiver && (
              <button
                onClick={onSwitchToReceiver}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border border-neutral-700 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 transition-colors cursor-pointer"
                title="Switch to Receiver Base Station Portal"
              >
                <Radio className="h-3.5 w-3.5 text-neutral-400" />
                <span>View Receiver Portal &rarr;</span>
              </button>
            )}

            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                showComparison
                  ? 'bg-white text-neutral-950 border-white shadow-xs'
                  : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{showComparison ? 'Hide Architecture Matrix' : 'Architecture Matrix'}</span>
            </button>

            <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  deviceMode === 'mobile'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Mobile Phone Viewport"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile</span>
              </button>
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  deviceMode === 'desktop'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Widescreen Viewport"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Widescreen</span>
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentPage('setup');
                setTutorialStep(0);
                setIsTutorialActive(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-white hover:bg-neutral-200 text-neutral-950 shadow-xs transition-colors cursor-pointer"
              title="Launch Interface Tutorial Tour for Setup"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Setup Tour</span>
            </button>
          </div>
        </div>

        {/* Live WebSocket Test Deck */}
        <div className="mt-4 pt-3.5 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-neutral-500 font-bold text-[10px] uppercase tracking-wider">HARDWARE WS BRIDGE:</span>
            
            <button
              onClick={() => setWsConnected(!wsConnected)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                wsConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{wsConnected ? `PORT 81: CONNECTED (${wsLatencyMs}ms)` : 'WS: DISCONNECTED'}</span>
            </button>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-700 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              {isStreaming ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span>{isStreaming ? 'STREAM 100HZ' : 'PAUSED'}</span>
            </button>

            <button
              onClick={handleSendWsPing}
              disabled={!wsConnected}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-700 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-40"
              title="Transmit WebSocket ping frame to measure round-trip latency"
            >
              <Send className="h-3 w-3" />
              <span>PING WS</span>
            </button>

            <span className="text-[10px] text-neutral-500">
              Frames: <strong className="text-neutral-300">{wsPacketsCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateFall}
              disabled={fsmState !== 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 font-mono font-bold text-[11px] uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <AlertTriangle className="h-3 w-3 text-rose-400" />
              <span>Simulate Crash Event</span>
            </button>

            <button
              onClick={handleResetFsm}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 font-mono font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Architectural Matrix Comparison (Collapsible) */}
      {showComparison && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/95 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="font-black text-xs uppercase tracking-tight text-white">
                Architectural Evolution: Legacy WebServer vs. Dedicated WebSocket Protocol
              </h3>
            </div>
            <button
              onClick={() => setShowComparison(false)}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {/* Deprecated WebServer Column */}
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-rose-900/40 space-y-2">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-neutral-800">
                <span>Legacy HTTP WebServer (Deprecated)</span>
                <span className="text-rose-500 font-normal">ELIMINATED</span>
              </div>
              <ul className="space-y-1.5 text-neutral-400 text-[11px] list-disc pl-4 leading-relaxed">
                <li>Heavy flash memory & RAM footprint for HTTP request/response headers and static assets.</li>
                <li>Synchronous request handling stalls the 100Hz detection engine loop during HTTP POST.</li>
                <li>No live high-frequency streaming: requires continuous HTTP polling storm from client.</li>
                <li>Socket exhaustion under SoftAP when mobile browsers open multiple concurrent connections.</li>
                <li>Vulnerable to non-null terminated string buffer over-reads during manual URI parsing.</li>
              </ul>
            </div>

            {/* Audited WebSocket Column */}
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-emerald-900/40 space-y-2">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-neutral-800">
                <span>Audited WebSocket Architecture (Port 81)</span>
                <span className="text-emerald-400 font-bold">CURRENT SPEC</span>
              </div>
              <ul className="space-y-1.5 text-neutral-300 text-[11px] list-disc pl-4 leading-relaxed">
                <li>Single persistent, bi-directional TCP socket connection (<code className="text-white">ws://192.168.4.1:81/</code>).</li>
                <li>Zero HTTP server overhead; pure asynchronous event-driven message dispatcher.</li>
                <li>Sub-5ms telemetry stream delivering 20Hz-100Hz IMU vectors and GPS fixes without polling.</li>
                <li>Deterministic JSON message framing (<code className="text-white">register</code>, <code className="text-white">tel</code>, <code className="text-white">gps</code>).</li>
                <li>Bounded JSON parsing with explicit length validation, preventing memory leaks and crashes.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div className="flex justify-center">
        <div
          className={`transition-all duration-300 w-full ${
            deviceMode === 'mobile' ? 'max-w-[440px]' : 'max-w-4xl'
          }`}
        >
          {/* Simulated Device Frame Shell (Ink High Contrast) */}
          <div className="rounded-2xl border border-neutral-800 bg-[#09090b] shadow-2xl overflow-hidden p-2 sm:p-3">
            
            {/* Top WebSocket Connection Bar (Zero-Emoji RFC 6455 Indicator) */}
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-950 rounded-xl border border-neutral-800 mb-3 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2 truncate">
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-800"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-800"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-800"></span>
                </div>
                <span className="text-[11px] text-neutral-300 ml-2 font-bold truncate">
                  ws://192.168.4.1:81/
                </span>
                <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                  RFC 6455
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300">
                  AP: RAMS-WEARABLE
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`} />
              </div>
            </div>

            {/* Portal Card (Strict Monochromatic Minimalist Aesthetic) */}
            <div className="rounded-xl border border-neutral-800 bg-[#121214] p-4 sm:p-6 space-y-4">
              
              {/* Header Branding */}
              <div className="text-center pb-3 border-b border-neutral-800">
                <div className="inline-flex items-center justify-center p-2 rounded-xl bg-neutral-900 border border-neutral-700 mb-2.5">
                  <img
                    src="/logo.jpg"
                    alt="RAMS Logo"
                    className="w-10 h-10 object-contain rounded"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                </div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  Road Accident Monitoring System
                </h1>
                <p className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-neutral-400 uppercase mt-0.5">
                  Wearable ESP32-S3 • WebSocket Interface (Port 81)
                </p>
              </div>

              {/* Single-Line Atomic WebSocket Status Pill */}
              <div className={`transition-all duration-300 ${
                isTutorialActive && TUTORIAL_STEPS[tutorialStep].target === 'softap'
                  ? 'relative z-50 ring-4 ring-white shadow-[0_0_30px_rgba(255,255,255,0.45)] rounded-lg'
                  : ''
              }`}>
                <div
                  className={`flex items-center justify-between py-2 px-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors ${
                    wsConnected
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60'
                      : 'bg-rose-950/40 text-rose-300 border-rose-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                      }`}
                    ></span>
                    <span>{wsConnected ? 'WEBSOCKET: LIVE STREAM (PORT 81)' : 'WEBSOCKET: DISCONNECTED'}</span>
                  </div>
                  <span className="text-[9px] text-neutral-400">
                    {wsConnected ? `${wsLatencyMs}ms • 100Hz` : 'RECONNECTING'}
                  </span>
                </div>
              </div>

              {/* Emergency Alert Banner (Shown if FSM is in state 4) */}
              {fsmState === 4 && (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-700 text-white">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 animate-bounce" />
                      <div>
                        <div className="font-mono font-bold text-[11px] uppercase tracking-wider text-white">
                          CRASH DETECTED • BUZZER ACTIVE
                        </div>
                        <div className="text-[10px] font-mono text-neutral-300">
                          Broadcasting LoRa packet in {emergencyCountdown}s
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleResetFsm}
                      className="px-2.5 py-1 rounded bg-white text-neutral-950 hover:bg-neutral-200 font-mono font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Capsule Bar (Top Position for Optimal Ergonomics) */}
              <div className={`flex gap-1.5 pb-3 border-b border-neutral-800 transition-all duration-300 ${
                isTutorialActive && TUTORIAL_STEPS[tutorialStep].target === 'navigation'
                  ? 'relative z-50 ring-4 ring-white shadow-[0_0_30px_rgba(255,255,255,0.45)] p-1.5 bg-neutral-950 rounded-lg'
                  : ''
              }`}>
                <button
                  onClick={() => setCurrentPage('setup')}
                  className={`flex-1 py-2 px-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    currentPage === 'setup'
                      ? 'bg-white text-neutral-950 border-white shadow-xs font-black'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span>SETUP</span>
                </button>

                <button
                  onClick={() => setCurrentPage('telemetry')}
                  className={`flex-1 py-2 px-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    currentPage === 'telemetry'
                      ? 'bg-white text-neutral-950 border-white shadow-xs font-black'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800'
                  }`}
                >
                  <Activity className="h-3 w-3" />
                  <span>TELEMETRY</span>
                </button>

                <button
                  onClick={() => setCurrentPage('map')}
                  className={`flex-1 py-2 px-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    currentPage === 'map'
                      ? 'bg-white text-neutral-950 border-white shadow-xs font-black'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800'
                  }`}
                >
                  <MapPin className="h-3 w-3" />
                  <span>RADAR</span>
                </button>

                <button
                  onClick={() => setCurrentPage('protocol')}
                  className={`flex-1 py-2 px-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    currentPage === 'protocol'
                      ? 'bg-white text-neutral-950 border-white shadow-xs font-black'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800'
                  }`}
                >
                  <Terminal className="h-3 w-3" />
                  <span>WS LOGS</span>
                </button>
              </div>

              {/* VIEW 1: REGISTRATION & SETUP */}
              {currentPage === 'setup' && (
                <div className="space-y-3">
                  {/* Setup Sequence Guide Banner */}
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-neutral-900 border border-neutral-700 text-amber-400">
                          <Sparkles className="h-3 w-3" />
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                          Quick Device Setup (WebSocket Direct Save)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTutorialStep(0);
                          setIsTutorialActive(true);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-white underline cursor-pointer"
                      >
                        <span>Start Tour</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
                      Register your profile directly to the wearable via WebSocket. Details are saved to on-device NVS flash and transmitted over LoRa to the base receiver.
                    </p>
                  </div>

                  <form onSubmit={handleMockRegister} className="space-y-3">
                    <div className={`transition-all duration-300 rounded-lg ${
                      isTutorialActive && TUTORIAL_STEPS[tutorialStep].target === 'user-name'
                        ? 'relative z-50 ring-4 ring-white shadow-[0_0_30px_rgba(255,255,255,0.45)] bg-neutral-950 p-2'
                        : ''
                    }`}>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Road User Full Name (Pedestrian, Cyclist, Commuter, or Rider)
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. Juan Dela Cruz"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono outline-none focus:border-white transition-colors"
                        required
                      />
                    </div>

                    <div className={`transition-all duration-300 rounded-lg space-y-2 ${
                      isTutorialActive && TUTORIAL_STEPS[tutorialStep].target === 'photo-link'
                        ? 'relative z-50 ring-4 ring-white shadow-[0_0_30px_rgba(255,255,255,0.45)] bg-neutral-950 p-2'
                        : ''
                    }`}>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                          ID Photo (Google Drive Share Link)
                        </label>
                        <input
                          type="url"
                          value={driveLink}
                          onChange={(e) => setDriveLink(e.target.value)}
                          placeholder="https://drive.google.com/file/d/.../view"
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono outline-none focus:border-white transition-colors"
                        />
                      </div>

                      {/* Photo preview info */}
                      <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
                        <div className="w-10 h-10 rounded border border-neutral-700 bg-black flex items-center justify-center overflow-hidden shrink-0">
                          {driveLink ? (
                            <img
                              src={
                                driveLink.includes('/d/')
                                  ? `https://lh3.googleusercontent.com/d/${driveLink.split('/d/')[1].split('/')[0]}=s220`
                                  : '/logo.jpg'
                              }
                              alt="Thumbnail preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-neutral-500 font-mono text-[9px]">
                              PHOTO
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 leading-snug truncate">
                          <span className="text-white font-bold block truncate">{userName || 'Your Name'}</span>
                          <span className="truncate block">Token: <strong className="text-emerald-400 font-mono">{deviceToken}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* High-Contrast Action Button (White on Dark, Zero Gradients) */}
                    <button
                      type="submit"
                      disabled={!wsConnected}
                      className={`w-full py-2.5 px-4 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-mono font-black text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 ${
                        isTutorialActive && TUTORIAL_STEPS[tutorialStep].target === 'register-btn'
                          ? 'relative z-50 ring-4 ring-white shadow-[0_0_30px_rgba(255,255,255,0.45)] scale-[1.02]'
                          : ''
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{regStatus === 'registering' ? 'TRANSMITTING VIA WS...' : 'SAVE & REGISTER (WEBSOCKET)'}</span>
                    </button>
                  </form>

                  {regStatus === 'success' && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-mono text-center text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>PROFILE REGISTERED OVER WEBSOCKET • TOKEN: {deviceToken}</span>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: LIVE TELEMETRY */}
              {currentPage === 'telemetry' && (
                <div className="space-y-2.5">
                  {/* FSM State & Peak Magnitude */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-center">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                        FSM Detection State
                      </div>
                      <div
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase mt-1 border ${
                          fsmState === 0
                            ? 'bg-neutral-950 text-white border-neutral-700'
                            : fsmState === 1
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : fsmState === 2
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                            : fsmState === 3
                            ? 'bg-neutral-950 text-purple-300 border-purple-800'
                            : 'bg-rose-600 text-white border-rose-500'
                        }`}
                      >
                        {fsmNames[fsmState]}
                      </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-center">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                        Total Vector Accel (|A|)
                      </div>
                      <div className="font-mono text-sm font-black text-white mt-0.5">
                        {accel.mag.toFixed(3)} g
                      </div>
                    </div>
                  </div>

                  {/* 3-Axis Accel */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-center">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#f87171]">Ax (X-Axis)</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">{accel.x.toFixed(2)} g</div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-center">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#34d399]">Ay (Y-Axis)</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">{accel.y.toFixed(2)} g</div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-center">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#60a5fa]">Az (Z-Axis)</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">{accel.z.toFixed(2)} g</div>
                    </div>
                  </div>

                  {/* Live Waveform Canvas */}
                  <div>
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      <span>Live Waveform Stream (X=Red, Y=Green, Z=Blue)</span>
                      <span className="text-emerald-400 font-bold">100Hz WebSocket Stream</span>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={480}
                      height={96}
                      className="w-full h-22 bg-[#09090b] border border-neutral-800 rounded-lg block"
                    />
                  </div>

                  {/* Gyroscope Readings */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-center">
                      <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-neutral-400">Gyro X</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">{gyro.x.toFixed(1)} deg/s</div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-center">
                      <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-neutral-400">Gyro Y</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">{gyro.y.toFixed(1)} deg/s</div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-center">
                      <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-neutral-400">Gyro Z</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">{gyro.z.toFixed(1)} deg/s</div>
                    </div>
                  </div>

                  {/* GPS Coordinates */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-center">
                      <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-neutral-400">Latitude</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">{gps.lat.toFixed(4)}° N</div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-center">
                      <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-neutral-400">Longitude</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">{gps.lon.toFixed(4)}° E</div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-center">
                      <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-neutral-400">GPS Status</div>
                      <div className="font-mono text-xs font-bold text-emerald-400 mt-0.5">{gps.sats} Sats (3D)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: OFFLINE RADAR MAP */}
              {currentPage === 'map' && (
                <div className="space-y-2.5">
                  <div className="relative w-full h-52 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {/* Concentric Vector Radar Rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-44 h-44 rounded-full border border-neutral-800"></div>
                      <div className="w-30 h-30 rounded-full border border-neutral-800/80"></div>
                      <div className="w-16 h-16 rounded-full border border-neutral-800/60"></div>
                      <div className="absolute w-full h-[1px] bg-neutral-800/70"></div>
                      <div className="absolute h-full w-[1px] bg-neutral-800/70"></div>
                    </div>

                    {/* GPS Position Pin */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative">
                        <div className="h-3 w-3 rounded-full bg-rose-500 border border-white"></div>
                        <div className="absolute -inset-1.5 rounded-full border border-rose-500/50 animate-ping"></div>
                      </div>
                      <span className="mt-2 text-[9px] font-mono font-bold bg-neutral-950 text-white px-2 py-0.5 rounded border border-neutral-700 uppercase tracking-wider">
                        USER LOCATION
                      </span>
                    </div>

                    {/* Coordinate Overlay */}
                    <div className="absolute top-2 left-2 bg-neutral-950/90 px-2 py-0.5 rounded text-[9px] font-mono text-neutral-300 border border-neutral-800">
                      Tuguegarao Sector 17°N
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 px-1">
                    <span>LAT: {gps.lat.toFixed(6)}  LON: {gps.lon.toFixed(6)}</span>
                    <span className="text-emerald-400 font-bold uppercase">{gps.sats} SATELLITES (LOCKED)</span>
                  </div>
                </div>
              )}

              {/* VIEW 4: WEBSOCKET PROTOCOL INSPECTOR (NEW!) */}
              {currentPage === 'protocol' && (
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-neutral-800 text-[10px] text-neutral-400">
                    <span className="font-bold uppercase text-white">LIVE WEBSOCKET FRAMES (PORT 81)</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSendWsPing}
                        className="text-neutral-300 hover:text-white underline cursor-pointer"
                      >
                        Ping Frame
                      </button>
                      <button
                        onClick={() => setWsLogs([])}
                        className="text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        Clear Log
                      </button>
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 max-h-56 overflow-y-auto space-y-1.5 text-[10px]">
                    {wsLogs.length === 0 ? (
                      <div className="text-neutral-600 text-center py-4">Waiting for WebSocket traffic...</div>
                    ) : (
                      wsLogs.map((pkt) => (
                        <div key={pkt.id} className="flex items-start gap-2 border-b border-neutral-900 pb-1">
                          <span className="text-neutral-500 shrink-0">{pkt.time}</span>
                          <span className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                            pkt.dir === 'tx' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {pkt.dir === 'tx' ? 'TX ->' : 'RX <-'}
                          </span>
                          <span className="text-neutral-300 break-all">{pkt.payload}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-[9px] text-neutral-400 flex items-center justify-between">
                    <span>Protocol: RFC 6455 Binary/Text Frames</span>
                    <span className="text-emerald-400 font-bold">Port 81 • Fully Non-Blocking</span>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Architecture Descriptor */}
            <div className="text-center text-[10px] font-mono uppercase tracking-wider text-neutral-600 mt-3 pt-1 border-t border-neutral-800/60">
              Autonomous ESP32-S3 SoftAP • Dedicated WebSocket Server (Port 81) • WebServer Deprecated
            </div>

          </div>
        </div>
      </div>

      {/* Interactive Setup Tutorial Dialog */}
      {isTutorialActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
          {/* Background Blur Overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsTutorialActive(false)}
          />

          {/* Dialog Container */}
          <div className="relative z-50 w-full max-w-lg bg-[#141417] border border-neutral-700 rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white">
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-700 text-amber-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      EASY SETUP GUIDE
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {TUTORIAL_STEPS[tutorialStep].badge}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">
                    Step {TUTORIAL_STEPS[tutorialStep].step} of {TUTORIAL_STEPS.length}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsTutorialActive(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Exit Tutorial"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>{TUTORIAL_STEPS[tutorialStep].title}</span>
              </h3>
              <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                {TUTORIAL_STEPS[tutorialStep].description}
              </p>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono text-neutral-200">
                <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-400 uppercase tracking-wider text-[10px] block mb-0.5">Quick Action:</strong>
                  {TUTORIAL_STEPS[tutorialStep].actionHint}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {TUTORIAL_STEPS.map((stepItem, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTutorialStep(idx);
                      setCurrentPage(stepItem.tab);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      tutorialStep === idx
                        ? 'w-7 bg-white'
                        : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                    }`}
                    title={`Jump to Step ${idx + 1}: ${stepItem.title}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setIsTutorialActive(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  Skip
                </button>
                
                {tutorialStep > 0 && (
                  <button
                    onClick={() => {
                      const prev = tutorialStep - 1;
                      setTutorialStep(prev);
                      setCurrentPage(TUTORIAL_STEPS[prev].tab);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
                      const next = tutorialStep + 1;
                      setTutorialStep(next);
                      setCurrentPage(TUTORIAL_STEPS[next].tab);
                    } else {
                      setIsTutorialActive(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-mono font-black uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                >
                  <span>{tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
                  {tutorialStep < TUTORIAL_STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

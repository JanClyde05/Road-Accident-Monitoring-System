import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Radio, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Trash2, 
  Server, 
  Activity, 
  Signal, 
  Lock, 
  Unlock, 
  Layers, 
  Info, 
  ChevronRight, 
  Sparkles, 
  X, 
  Send,
  ExternalLink,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

interface ScannedNetwork {
  ssid: string;
  rssi: number;
  quality: number; // 0 - 100
  security: 'WPA2' | 'WPA3' | 'OPEN';
  channel: number;
}

const DEFAULT_NETWORKS: ScannedNetwork[] = [
  { ssid: 'Brgy-SanJose-CommandCenter', rssi: -54, quality: 92, security: 'WPA2', channel: 6 },
  { ssid: 'RHU-Emergency-Uplink', rssi: -62, quality: 82, security: 'WPA2', channel: 1 },
  { ssid: 'MDRRMO-Rescue-Station', rssi: -71, quality: 68, security: 'WPA2', channel: 11 },
  { ssid: 'PLDT_Home_Fibr_Base', rssi: -79, quality: 50, security: 'WPA2', channel: 4 },
  { ssid: 'Barangay_Public_FreeWiFi', rssi: -86, quality: 38, security: 'OPEN', channel: 9 },
];

interface ReceiverPortalSimulatorProps {
  onSwitchToWearable?: () => void;
}

export const ReceiverPortalSimulator: React.FC<ReceiverPortalSimulatorProps> = ({ onSwitchToWearable }) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Connection state
  const [connStatus, setConnStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [stationIp, setStationIp] = useState<string>('Pending DHCP');
  const [ssid, setSsid] = useState<string>('Brgy-SanJose-CommandCenter');
  const [password, setPassword] = useState<string>('SanJoseRescue2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [cloudEndpoint, setCloudEndpoint] = useState<string>('https://rams-backend.netlify.app/api/upload');
  const [stationNodeId, setStationNodeId] = useState<string>('RAMS-BASE-01');

  // Scanner state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [networks, setNetworks] = useState<ScannedNetwork[]>(DEFAULT_NETWORKS);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Diagnostics & Queue state
  const [queueSize, setQueueSize] = useState<number>(3);
  const [packetsReceived, setPacketsReceived] = useState<number>(18);
  const [lastRssi, setLastRssi] = useState<number>(-89);
  const [lastSnr, setLastSnr] = useState<number>(8.5);
  const [cloudPingStatus, setCloudPingStatus] = useState<'idle' | 'pinging' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Simulate LoRa RF incoming packets periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setPacketsReceived((prev) => prev + 1);
        setLastRssi(-85 - Math.floor(Math.random() * 14));
        setLastSnr(parseFloat((6.0 + Math.random() * 4.5).toFixed(1)));
        
        // If disconnected, offline queue increments!
        if (connStatus !== 'connected') {
          setQueueSize((prev) => Math.min(prev + 1, 50));
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [connStatus]);

  // Handle Rescan
  const handleRescan = () => {
    setIsScanning(true);
    setScanMessage('Scanning 2.4GHz spectrum for Wi-Fi beacons...');
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('Found 5 Wi-Fi networks within range.');
      // Randomize RSSI slightly to reflect real air environment
      setNetworks(
        DEFAULT_NETWORKS.map((net) => {
          const delta = Math.floor(Math.random() * 7) - 3;
          const newRssi = Math.min(-45, Math.max(-95, net.rssi + delta));
          const newQual = Math.round(Math.min(100, Math.max(20, 100 - (Math.abs(newRssi) - 40) * 1.2)));
          return { ...net, rssi: newRssi, quality: newQual };
        })
      );
      setTimeout(() => setScanMessage(null), 3000);
    }, 1200);
  };

  // Handle Connect
  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid.trim()) {
      setStatusMessage({ text: 'Please choose or type a Wi-Fi network SSID.', type: 'error' });
      return;
    }

    setConnStatus('connecting');
    setStatusMessage({ 
      text: `Authenticating with "${ssid}" via WPA2-PSK...`, 
      type: 'info' 
    });

    setTimeout(() => {
      setConnStatus('connected');
      const assignedIp = `192.168.1.${120 + Math.floor(Math.random() * 60)}`;
      setStationIp(assignedIp);
      setStatusMessage({ 
        text: `Connected successfully! Station IP: ${assignedIp}. Netlify cloud uplink synchronized.`, 
        type: 'success' 
      });

      // Flushed queue simulation
      if (queueSize > 0) {
        setTimeout(() => {
          setStatusMessage({
            text: `Forwarded ${queueSize} stored offline packets to cloud backend. Queue size now 0.`,
            type: 'success'
          });
          setQueueSize(0);
        }, 1800);
      }
    }, 1600);
  };

  // Handle Disconnect
  const handleDisconnect = () => {
    setConnStatus('disconnected');
    setStationIp('Pending DHCP');
    setStatusMessage({ text: 'Disconnected from Wi-Fi. Receiver operating in offline buffer mode.', type: 'info' });
  };

  // Handle Clear Queue
  const handleClearQueue = () => {
    if (queueSize === 0) {
      setStatusMessage({ text: 'Flash queue is already empty.', type: 'info' });
      return;
    }
    setQueueSize(0);
    setStatusMessage({ text: 'LittleFS offline packet queue wiped successfully.', type: 'info' });
  };

  // Handle Cloud Ping
  const handleCloudPing = () => {
    if (connStatus !== 'connected') {
      setStatusMessage({ text: 'Cannot ping cloud: Receiver is currently disconnected from Wi-Fi.', type: 'error' });
      return;
    }
    setCloudPingStatus('pinging');
    setTimeout(() => {
      setCloudPingStatus('success');
      setStatusMessage({ text: 'Cloud Ping OK: Netlify endpoint responded with HTTP 200 (68ms roundtrip).', type: 'success' });
      setTimeout(() => setCloudPingStatus('idle'), 3000);
    }, 800);
  };

  const TOUR_STEPS = [
    {
      title: '1. Connect to Receiver Gateway SoftAP',
      badge: 'GATEWAY WI-FI',
      description: 'The RAMS Receiver Base Station broadcasts its own Wi-Fi network named "RAMS-RECEIVER". Responders or technicians connect using their phone or laptop, which automatically opens this setup portal at http://192.168.4.1.',
    },
    {
      title: '2. Select Station Wi-Fi Network',
      badge: 'WI-FI SCANNER',
      description: 'Tap any discovered network from the list (such as your Barangay Hall, RHU Clinic, or mobile hotspot). The portal automatically fills the SSID and signal metrics.',
    },
    {
      title: '3. Enter Wi-Fi Password & Connect',
      badge: 'STATION LINK',
      description: 'Enter the password and tap "CONNECT TO WI-FI". The ESP32 connects to your local network, obtains an IP address, and immediately begins forwarding emergency LoRa alerts to the online cloud dashboard.',
    },
    {
      title: '4. Offline Buffer & Hardware Diagnostics',
      badge: 'FAIL-SAFE QUEUE',
      description: 'If the internet ever goes down, the receiver never drops an alert. It saves packets to built-in flash memory (Offline Queue) and automatically flushes them the second internet connectivity returns.',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Controller */}
      <div className="p-4 sm:p-6 rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-950 text-white">
                <Radio className="h-4 w-4" />
              </span>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
                Receiver Wi-Fi Captive Portal & Gateway Diagnostics
              </h2>
              <span className="px-2 py-0.5 rounded border border-neutral-700 bg-neutral-950 text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-wider">
                ESP32 SoftAP 192.168.4.1
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-medium max-w-3xl">
              Live simulation of the Receiver Base Station’s built-in Wi-Fi provisioning captive portal.
              Redesigned to match the project’s strict monochromatic aesthetic: zero artificial gradients, bold Plus Jakarta Sans display typography, and JetBrains Mono tabular diagnostics.
            </p>
          </div>

          {/* Mode & Tour Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {onSwitchToWearable && (
              <button
                onClick={onSwitchToWearable}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border border-neutral-700 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 transition-colors cursor-pointer"
                title="Switch to Wearable Portal"
              >
                <Wifi className="h-3.5 w-3.5 text-neutral-400" />
                <span>← View Wearable Portal</span>
              </button>
            )}

            <button
              onClick={() => setShowTour(!showTour)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                showTour
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-xs'
                  : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{showTour ? 'Exit Tour' : 'Setup Guide Tour'}</span>
            </button>

            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                showComparison
                  ? 'bg-white text-neutral-950 border-white shadow-xs'
                  : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{showComparison ? 'Hide Comparison' : 'Design System Matrix'}</span>
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
                title="Widescreen Gateway Console"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guided Tour Banner (When Active) */}
      {showTour && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 text-amber-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-400 text-neutral-950 font-mono font-bold text-xs">
                Step {tourStep + 1} of {TOUR_STEPS.length}
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                {TOUR_STEPS[tourStep].badge}
              </span>
            </div>
            <button 
              onClick={() => setShowTour(false)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h4 className="text-sm font-black text-white mt-1.5 uppercase">
            {TOUR_STEPS[tourStep].title}
          </h4>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            {TOUR_STEPS[tourStep].description}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800">
            <button
              onClick={() => setTourStep((prev) => Math.max(0, prev - 1))}
              disabled={tourStep === 0}
              className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              ← Previous
            </button>
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`w-2 h-2 rounded-full ${idx === tourStep ? 'bg-amber-400' : 'bg-neutral-700'}`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                if (tourStep < TOUR_STEPS.length - 1) {
                  setTourStep(tourStep + 1);
                } else {
                  setShowTour(false);
                }
              }}
              className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              {tourStep === TOUR_STEPS.length - 1 ? 'Finish Guide' : 'Next Step →'}
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="flex justify-center">
        <div className={`w-full transition-all duration-300 ${
          deviceMode === 'mobile' ? 'max-w-[420px]' : 'max-w-4xl'
        }`}>
          {/* Hardware Frame Shell */}
          <div className="rounded-2xl border border-neutral-800 bg-[#09090b] shadow-2xl overflow-hidden p-2 sm:p-3">
            
            {/* Top Browser URL Bar Simulation */}
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-950 rounded-xl border border-neutral-800 mb-3 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-800"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-800"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-800"></span>
                </div>
                <span className="text-[11px] text-neutral-300 ml-2 truncate">
                  http://192.168.4.1/
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300">
                  AP: RAMS-RECEIVER
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  connStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`} />
              </div>
            </div>

            {/* Portal Card (Strict Redesign Aesthetics) */}
            <div className="rounded-xl border border-neutral-800 bg-[#121214] p-4 sm:p-6 space-y-6">
              
              {/* Header Branding */}
              <div className="text-center pb-4 border-b border-neutral-800/80">
                <div className="inline-flex items-center justify-center p-2 rounded-xl bg-neutral-900 border border-neutral-700 mb-3">
                  <img
                    src="/logo.jpg"
                    alt="RAMS Logo"
                    className="w-10 h-10 object-contain rounded"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                </div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
                  RAMS RECEIVER SETUP
                </h1>
                <p className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-neutral-400 uppercase mt-1">
                  ROAD ACCIDENT MONITORING SYSTEM — CAPTIVE PORTAL
                </p>
              </div>

              {/* Status Bar */}
              <div className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                connStatus === 'connected' 
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : connStatus === 'connecting'
                    ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    connStatus === 'connected' 
                      ? 'bg-emerald-400 animate-pulse' 
                      : connStatus === 'connecting' 
                        ? 'bg-amber-400 animate-ping' 
                        : 'bg-rose-400'
                  }`} />
                  <span>
                    {connStatus === 'connected' 
                      ? 'CONNECTED' 
                      : connStatus === 'connecting' 
                        ? 'CONNECTING TO WI-FI...' 
                        : 'NOT CONNECTED'}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400">
                  {connStatus === 'connected' ? stationIp : 'SOFTAP ACTIVE'}
                </span>
              </div>

              {/* Status Notification Box */}
              {statusMessage && (
                <div className={`p-3 rounded-lg border text-xs font-mono leading-relaxed flex items-start gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : statusMessage.type === 'error'
                      ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                }`}>
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1 text-[11px]">
                    {statusMessage.text}
                  </div>
                  <button 
                    onClick={() => setStatusMessage(null)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Section 1: Available Networks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono font-black tracking-wider uppercase text-white flex items-center gap-1.5">
                    <Wifi className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Available Networks</span>
                  </h2>
                  <span className="text-[10px] font-mono text-neutral-400">
                    2.4GHz Band
                  </span>
                </div>

                {/* Scanned Network List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {isScanning ? (
                    <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-3 text-xs font-mono text-neutral-400">
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>Scanning networks...</span>
                    </div>
                  ) : (
                    networks.map((net) => {
                      const isSelected = ssid === net.ssid;
                      return (
                        <div
                          key={net.ssid}
                          onClick={() => setSsid(net.ssid)}
                          className={`p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-neutral-900 border-white text-white shadow-xs'
                              : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className={`p-1 rounded ${isSelected ? 'bg-white text-neutral-950' : 'bg-neutral-800 text-neutral-400'}`}>
                              <Signal className="h-3 w-3" />
                            </span>
                            <div className="truncate">
                              <span className="font-bold block truncate">{net.ssid}</span>
                              <span className="text-[9px] text-neutral-500">Ch {net.channel} • {net.rssi} dBm</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {net.security === 'OPEN' ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                                <Unlock className="h-2.5 w-2.5" /> Open
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                                <Lock className="h-2.5 w-2.5" /> WPA2
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-neutral-400">
                              {net.quality}%
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Rescan Button */}
                <button
                  type="button"
                  onClick={handleRescan}
                  disabled={isScanning}
                  className="w-full py-2 px-3 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>RESCAN NETWORKS</span>
                </button>
                {scanMessage && (
                  <p className="text-[10px] font-mono text-emerald-400 text-center">{scanMessage}</p>
                )}
              </div>

              {/* Section 2: Connect Form */}
              <form onSubmit={handleConnect} className="space-y-3 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono font-black tracking-wider uppercase text-white">
                    Connect to Station
                  </h2>
                  <span className="text-[10px] font-mono text-neutral-500">
                    DHCP Client
                  </span>
                </div>

                {/* SSID Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Network (SSID)
                  </label>
                  <input
                    type="text"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    placeholder="Select network above or enter manually"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono outline-none focus:border-white transition-colors"
                    required
                  />
                </div>

                {/* Password Input with Show/Hide Toggle */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter WiFi password"
                      className="w-full px-3 py-2 pr-10 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono outline-none focus:border-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Connect / Disconnect Buttons */}
                <div className="pt-1 flex gap-2">
                  <button
                    type="submit"
                    disabled={connStatus === 'connecting'}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-mono font-black text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {connStatus === 'connecting' ? 'CONNECTING...' : 'CONNECT'}
                  </button>

                  {connStatus === 'connected' && (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="py-2.5 px-3 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      DISCONNECT
                    </button>
                  )}
                </div>
              </form>

              {/* Section 3: Device Status & Diagnostics */}
              <div className="space-y-3 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono font-black tracking-wider uppercase text-white flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Device Status & Diagnostics</span>
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    SX1278 ACTIVE
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800">
                    <span className="text-[9px] text-neutral-500 uppercase font-bold block">
                      SoftAP IP Address
                    </span>
                    <span className="font-bold text-white text-xs mt-0.5 block">
                      192.168.4.1
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800">
                    <span className="text-[9px] text-neutral-500 uppercase font-bold block">
                      Station IP Address
                    </span>
                    <span className={`font-bold text-xs mt-0.5 block truncate ${
                      connStatus === 'connected' ? 'text-emerald-400' : 'text-neutral-500'
                    }`}>
                      {connStatus === 'connected' ? stationIp : 'Offline'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800">
                    <span className="text-[9px] text-neutral-500 uppercase font-bold block">
                      Offline Flash Queue
                    </span>
                    <span className={`font-bold text-xs mt-0.5 block ${
                      queueSize > 0 ? 'text-amber-400' : 'text-neutral-400'
                    }`}>
                      {queueSize} PACKETS
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800">
                    <span className="text-[9px] text-neutral-500 uppercase font-bold block">
                      LoRa Reception
                    </span>
                    <span className="font-bold text-white text-xs mt-0.5 block truncate">
                      {packetsReceived} Pkts • {lastRssi} dBm
                    </span>
                  </div>
                </div>

                {/* LoRa Radio Specs Pill */}
                <div className="p-2 rounded bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>RF: 433.000 MHz • SF9 • BW 125kHz</span>
                  <span className="text-emerald-400 font-bold">SNR: +{lastSnr} dB</span>
                </div>

                {/* Diagnostics Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCloudPing}
                    disabled={cloudPingStatus === 'pinging'}
                    className="py-2 px-2.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`h-3 w-3 ${cloudPingStatus === 'pinging' ? 'animate-pulse' : ''}`} />
                    <span>{cloudPingStatus === 'pinging' ? 'PINGING...' : 'PING CLOUD'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearQueue}
                    className="py-2 px-2.5 rounded-lg border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>CLEAR QUEUE</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Design System Matrix Comparison (When Toggled) */}
      {showComparison && (
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/95 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                Architectural Evaluation
              </span>
              <h3 className="text-sm font-black text-white uppercase">
                Receiver Captive Portal: Legacy vs. Redesigned Interface
              </h3>
            </div>
            <button
              onClick={() => setShowComparison(false)}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Legacy Column */}
            <div className="p-4 rounded-lg bg-neutral-950 border border-rose-900/40 space-y-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                Legacy Receiver Portal (Previous Implementation)
              </span>
              <ul className="space-y-1.5 text-neutral-400 list-disc pl-4 text-[11px] leading-relaxed">
                <li>Cluttered generic styles without coherent typography hierarchy or tabular figures.</li>
                <li>No visual feedback on Wi-Fi signal quality (dBm / channel metrics hidden).</li>
                <li>Passwords entered blindly without toggle visibility, causing typing failures on mobile.</li>
                <li>No indication of LoRa RF parameters (SX1278 SNR / RSSI invisible to field technicians).</li>
                <li>Offline flash queue status obscure; no clear distinction between local AP and Cloud status.</li>
              </ul>
            </div>

            {/* Redesigned Column */}
            <div className="p-4 rounded-lg bg-neutral-950 border border-emerald-900/40 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Audited High-Contrast Minimalist Interface
              </span>
              <ul className="space-y-1.5 text-neutral-300 list-disc pl-4 text-[11px] leading-relaxed">
                <li>Strict monochromatic slate palette with zero artificial gradients or neon glow.</li>
                <li>Live Wi-Fi scanner with RSSI bars, signal percentage, and one-tap auto-fill.</li>
                <li>Password reveal eye toggle preventing authentication lockouts during field setup.</li>
                <li>Full LoRa RF diagnostics: live packet counter, SNR (+8.5 dB), and signal dBm display.</li>
                <li>Flash queue indicator with safe flush diagnostics and Netlify cloud health ping.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

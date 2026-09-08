import React from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Github, 
  Layers, 
  Search, 
  Activity, 
  Network, 
  GitPullRequest,
  Cpu,
  Download,
  Wifi,
  Radio,
  BookOpen
} from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenDesignRules: () => void;
}

export const Header: React.FC<Props> = ({ activeTab, onTabChange, onOpenDesignRules }) => {
  const tabs = [
    { id: 'overview', label: 'Executive Scorecard', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'wearable_ui', label: 'Wearable Portal & WS', icon: <Wifi className="w-3.5 h-3.5" /> },
    { id: 'receiver_ui', label: 'Receiver Wi-Fi Portal', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'findings', label: 'Code Audit & Bugs', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'simulator', label: 'FSM Live Simulator', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'architecture', label: 'System Topology', icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'patches', label: 'Git Patches & Fixes', icon: <GitPullRequest className="w-3.5 h-3.5" /> },
    { id: 'hardware', label: 'Hardware & RF Guide', icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-[#09090b]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-3.5 gap-4">
          {/* Brand Mark & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center bg-neutral-900 overflow-hidden shadow-xs shrink-0 p-0.5">
              <img
                src="/logo.jpg"
                alt="RAMS Logo"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-white uppercase truncate">
                  ROAD ACCIDENT MONITORING SYSTEM
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-200 tracking-wider">
                  v2.0 AUDIT
                </span>
              </div>
              <p className="text-[10px] font-mono font-semibold tracking-wide uppercase text-neutral-400 mt-0.5">
                PGC DIGITAL INNOVATION CHALLENGE 2026 • SYSTEM SPECIFICATION
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Design Rules Trigger */}
            <button
              onClick={onOpenDesignRules}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Inspect Design System Rules Specification"
            >
              <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
              <span>Design Rules</span>
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/JanClyde05/Road-Accident-Monitoring-System"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden md:inline">GitHub</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>

            {/* Direct Firmware / Code Download */}
            <a
              href="/rams-google-ai-studio.zip"
              download="rams-google-ai-studio.zip"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-mono text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
              title="Download patched RAMS firmware and LittleFS data files"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Code (.zip)</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs (Monochrome Minimalist 8pt Grid) */}
        <nav className="flex space-x-1.5 overflow-x-auto pt-1 pb-3 scrollbar-none border-t border-neutral-800/80">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80 border border-transparent hover:border-neutral-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};


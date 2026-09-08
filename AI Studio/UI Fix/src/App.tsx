import React, { useState } from 'react';
import { Header } from './components/Header';
import { ScorecardOverview } from './components/ScorecardOverview';
import { AuditFindingsList } from './components/AuditFindingsList';
import { FSMSimulator } from './components/FSMSimulator';
import { ArchitectureMap } from './components/ArchitectureMap';
import { PatchesView } from './components/PatchesView';
import { HardwareGuide } from './components/HardwareGuide';
import { WearablePortalSimulator } from './components/WearablePortalSimulator';
import { ReceiverPortalSimulator } from './components/ReceiverPortalSimulator';
import { DesignRulesModal } from './components/DesignRulesModal';
import { ShieldCheck, ExternalLink, Github } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedFindingId, setSelectedFindingId] = useState<string>('FIND-01');
  const [isDesignRulesOpen, setIsDesignRulesOpen] = useState<boolean>(false);

  const handleSelectFindingFromOverview = (id: string) => {
    setSelectedFindingId(id);
    setActiveTab('findings');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans antialiased selection:bg-neutral-800 selection:text-white">
      {/* Top Application Header */}
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onOpenDesignRules={() => setIsDesignRulesOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <ScorecardOverview 
            onSelectTab={setActiveTab}
            onSelectFinding={handleSelectFindingFromOverview}
          />
        )}

        {activeTab === 'findings' && (
          <AuditFindingsList 
            selectedFindingId={selectedFindingId}
            onSelectFinding={setSelectedFindingId}
          />
        )}

        {activeTab === 'wearable_ui' && (
          <WearablePortalSimulator onSwitchToReceiver={() => setActiveTab('receiver_ui')} />
        )}

        {activeTab === 'receiver_ui' && (
          <ReceiverPortalSimulator onSwitchToWearable={() => setActiveTab('wearable_ui')} />
        )}

        {activeTab === 'simulator' && (
          <FSMSimulator />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureMap />
        )}

        {activeTab === 'patches' && (
          <PatchesView />
        )}

        {activeTab === 'hardware' && (
          <HardwareGuide />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-[#09090b] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white uppercase">RAMS Architectural Audit Suite</span>
            <span className="text-neutral-600">•</span>
            <span>PGC Digital Innovation Challenge 2026</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDesignRulesOpen(true)}
              className="text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Design System Spec
            </button>
            <a
              href="https://github.com/JanClyde05/Road-Accident-Monitoring-System"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              <span>JanClyde05/Road-Accident-Monitoring-System</span>
              <ExternalLink className="h-3 w-3 text-neutral-500" />
            </a>
          </div>
        </div>
      </footer>

      {/* Design System Rules Modal */}
      <DesignRulesModal 
        isOpen={isDesignRulesOpen} 
        onClose={() => setIsDesignRulesOpen(false)} 
      />
    </div>
  );
}


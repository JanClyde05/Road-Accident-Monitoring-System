import React, { useState } from 'react';
import { ARCHITECTURE_NODES } from '../data/findingsData';
import { ArchitectureNode } from '../types';
import { 
  Network, 
  Radio, 
  Cpu, 
  Server, 
  Monitor, 
  AlertTriangle, 
  ArrowRight, 
  FileCode,
  CheckCircle2,
  Zap
} from 'lucide-react';

export const ArchitectureMap: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(ARCHITECTURE_NODES[0].id);

  const selectedNode = ARCHITECTURE_NODES.find(n => n.id === selectedNodeId) || ARCHITECTURE_NODES[0];

  const getNodeIcon = (id: string) => {
    switch (id) {
      case 'wearable': return <Cpu className="h-5 w-5" />;
      case 'lora-channel': return <Radio className="h-5 w-5" />;
      case 'receiver': return <Server className="h-5 w-5" />;
      case 'backend': return <Network className="h-5 w-5" />;
      case 'dashboard': return <Monitor className="h-5 w-5" />;
      default: return <Cpu className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6" id="architecture-section">
      {/* Header */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xs">
        <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Network className="h-4 w-4 text-neutral-400" />
          <span>System Topology & End-to-End Data Pipeline</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-medium">
          Interactive pipeline tracing how sensor data flows from physical sensors on the motorcycle through 433MHz LoRa to the cloud dispatch map. Click any stage to inspect vulnerabilities and design contracts.
        </p>
      </div>

      {/* Horizontal Interactive Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {ARCHITECTURE_NODES.map((node, index) => {
          const isSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all relative ${
                isSelected 
                  ? 'border-white bg-neutral-900 shadow-sm' 
                  : 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg border ${isSelected ? 'bg-white text-neutral-950 border-white' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}>
                  {getNodeIcon(node.id)}
                </div>
                <span className="text-[10px] font-mono text-neutral-500">0{index + 1}</span>
              </div>

              <h3 className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-white">{node.title}</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1 font-medium">{node.role}</p>

              <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono">
                <span className="text-neutral-500">LATENCY:</span>
                <span className="font-bold text-neutral-300">{node.latency.split(' ')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Inspection Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white text-neutral-950">
              {getNodeIcon(selectedNode.id)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-tight text-white">{selectedNode.title}</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider bg-neutral-950 border border-neutral-800 text-neutral-300 font-bold px-2 py-0.5 rounded">
                  {selectedNode.role}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                Hardware / Environment: <span className="text-neutral-300">{selectedNode.hardware}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-400 uppercase tracking-wider text-[10px]">Latency Profile:</span>
            <span className="font-bold bg-neutral-950 border border-neutral-800 px-2.5 py-1 rounded text-white">
              {selectedNode.latency}
            </span>
          </div>
        </div>

        {/* Node Specs Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Protocol Interfaces */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Communication Interfaces
            </h4>

            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-2 text-xs font-mono">
              <div className="flex items-start gap-2">
                <span className="text-neutral-500 uppercase text-[10px] w-24 shrink-0">Inbound Data:</span>
                <span className="text-neutral-200">{selectedNode.protocolIn}</span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-neutral-800">
                <span className="text-neutral-500 uppercase text-[10px] w-24 shrink-0">Outbound Data:</span>
                <span className="text-neutral-200">{selectedNode.protocolOut}</span>
              </div>
            </div>

            {/* Key Repo Files */}
            <div>
              <h4 className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Key Implementation Files
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedNode.keyFiles.map((file, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 text-xs font-mono bg-neutral-950 text-neutral-300 px-2.5 py-1 rounded border border-neutral-800"
                  >
                    <FileCode className="h-3 w-3 text-neutral-500" />
                    {file}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Critical Vulnerabilities & Architectural Risks */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>Identified Architectural Failure Modes</span>
            </h4>

            <div className="space-y-2">
              {selectedNode.criticalRisks.map((risk, idx) => (
                <div 
                  key={idx} 
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-300 flex items-start gap-2.5 font-medium"
                >
                  <span className="font-mono font-bold text-rose-400 shrink-0">{idx + 1}.</span>
                  <span className="leading-relaxed">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

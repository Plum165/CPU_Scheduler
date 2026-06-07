/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import SchedulerSimulator from './components/SchedulerSimulator';
import ConceptAcademy from './components/ConceptAcademy';
import PracticeModule from './components/PracticeModule';
import JavaSourceViewer from './components/JavaSourceViewer';
import { Cpu, GraduationCap, LayoutGrid, Award, Code2, Clock, Globe } from 'lucide-react';

type TabId = 'SIMULATOR' | 'ACADEMY' | 'PRACTICE' | 'JAVA_SOURCE';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('SIMULATOR');
  const [utcTime, setUtcTime] = useState<string>('2026-06-07 09:01:20 UTC');

  // Real-time UTC clock
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      const yr = date.getUTCFullYear();
      const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
      const dy = String(date.getUTCDate()).padStart(2, '0');
      const hr = String(date.getUTCHours()).padStart(2, '0');
      const mi = String(date.getUTCMinutes()).padStart(2, '0');
      const se = String(date.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${yr}-${mo}-${dy} ${hr}:${mi}:${se} UTC`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans select-none pb-12">
      {/* Visual background atmospheric orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      {/* Main Nav Header */}
      <header className="sticky top-0 z-50 bg-slate-900/50 border-b border-white/10 py-4 px-6 md:px-12 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] glow-active">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg md:text-xl tracking-tight text-white flex items-center gap-1.5">
                CPU <span className="text-indigo-400">Scheduling Academy</span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400 font-medium">
                Multi-algorithm OS simulations &amp; practice platform
              </p>
            </div>
          </div>

          {/* Real-time system clocks */}
          <div className="flex items-center gap-4 text-slate-400 text-xs font-mono">
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900/50 border border-white/10 px-3.5 py-1.5 rounded-full text-slate-400">
              <Globe className="w-3.5 h-3.5 text-indigo-400/80" />
              <span>Offline Ready</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/50 border border-white/10 px-3.5 py-1.5 rounded-full text-indigo-400">
              <Clock className="w-3.5 h-3.5 text-indigo-400/80" />
              <span>{utcTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Center Layout */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-8 mt-8 flex-1 flex flex-col space-y-8">
        
        {/* Navigation Deck Selection Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-900/55 p-1 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {[
            { id: 'SIMULATOR', label: 'Dynamic Simulator', icon: LayoutGrid, color: 'text-indigo-400' },
            { id: 'ACADEMY', label: 'Concept Academy', icon: GraduationCap, color: 'text-indigo-300' },
            { id: 'PRACTICE', label: 'Practice Lab', icon: Award, color: 'text-violet-400' },
            { id: 'JAVA_SOURCE', label: 'Java Source', icon: Code2, color: 'text-amber-500' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 md:py-4 px-3 rounded-xl transition duration-200 cursor-pointer text-center font-display font-medium text-xs md:text-sm ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-xl border border-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Main Sandbox Panels */}
        <div className="flex-1">
          {activeTab === 'SIMULATOR' && <SchedulerSimulator />}
          {activeTab === 'ACADEMY' && <ConceptAcademy />}
          {activeTab === 'PRACTICE' && <PracticeModule />}
          {activeTab === 'JAVA_SOURCE' && <JavaSourceViewer />}
        </div>
      </main>

      {/* Aesthetic Footer */}
      <footer className="max-w-7xl mx-auto w-full px-8 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
        <p>© 2026 CPU Scheduling Academy. Operating Systems Learning Core.</p>
        <div className="flex items-center gap-4">
          <span>Version 1.2.0 (SPA)</span>
          <span>•</span>
          <span>Fully Cacheable &amp; Local</span>
        </div>
      </footer>
    </div>
  );
}

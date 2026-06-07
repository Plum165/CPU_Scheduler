/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SchedulerSimulator from './components/SchedulerSimulator';
import ConceptAcademy from './components/ConceptAcademy';
import PracticeModule from './components/PracticeModule';
import JavaSourceViewer from './components/JavaSourceViewer';
import { Cpu, GraduationCap, LayoutGrid, Award, Code2 } from 'lucide-react';

type TabId = 'SIMULATOR' | 'ACADEMY' | 'PRACTICE' | 'JAVA_SOURCE';

export const THEME_ACCENTS: Record<string, {
  text: string;
  bg: string;
  border: string;
  hoverBg: string;
  btn: string;
  glow: string;
  accent: string;
  cardGlow: string;
  subtleText: string;
}> = {
  indigo: {
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    hoverBg: 'hover:bg-indigo-500/20',
    btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    glow: 'rgba(99, 102, 241, 0.3)',
    accent: '#6366f1',
    cardGlow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]',
    subtleText: 'text-indigo-300',
  },
  nordic: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    hoverBg: 'hover:bg-cyan-500/20',
    btn: 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold',
    glow: 'rgba(6, 182, 212, 0.3)',
    accent: '#06b6d4',
    cardGlow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    subtleText: 'text-cyan-300',
  },
  emerald: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    hoverBg: 'hover:bg-emerald-500/20',
    btn: 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold',
    glow: 'rgba(16, 185, 129, 0.3)',
    accent: '#10b981',
    cardGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    subtleText: 'text-emerald-300',
  },
  cyberpunk: {
    text: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    hoverBg: 'hover:bg-pink-500/20',
    btn: 'bg-pink-600 hover:bg-pink-500 text-white font-semibold',
    glow: 'rgba(236, 72, 153, 0.4)',
    accent: '#ec4899',
    cardGlow: 'shadow-[0_0_15px_rgba(236,72,153,0.2)]',
    subtleText: 'text-pink-300',
  },
  amber: {
    text: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    hoverBg: 'hover:bg-amber-500/20',
    btn: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold',
    glow: 'rgba(245, 158, 11, 0.3)',
    accent: '#f59e0b',
    cardGlow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    subtleText: 'text-amber-400',
  },
  'light-indigo': {
    text: 'text-indigo-600',
    bg: 'bg-indigo-50/60',
    border: 'border-indigo-200',
    hoverBg: 'hover:bg-indigo-100/40',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold',
    glow: 'rgba(79, 70, 229, 0.15)',
    accent: '#4f46e5',
    cardGlow: 'shadow-[0_4px_20px_-2px_rgba(79,70,229,0.08)]',
    subtleText: 'text-indigo-700',
  },
  'light-teal': {
    text: 'text-teal-600',
    bg: 'bg-teal-50/60',
    border: 'border-teal-200',
    hoverBg: 'hover:bg-teal-100/40',
    btn: 'bg-teal-600 hover:bg-teal-700 text-white font-semibold',
    glow: 'rgba(13, 148, 136, 0.15)',
    accent: '#0d9488',
    cardGlow: 'shadow-[0_4px_20px_-2px_rgba(13,148,136,0.08)]',
    subtleText: 'text-teal-700',
  },
  'light-rose': {
    text: 'text-rose-600',
    bg: 'bg-rose-50/60',
    border: 'border-rose-200',
    hoverBg: 'hover:bg-rose-100/40',
    btn: 'bg-rose-600 hover:bg-rose-700 text-white font-semibold',
    glow: 'rgba(225, 29, 72, 0.15)',
    accent: '#e11d48',
    cardGlow: 'shadow-[0_4px_20px_-2px_rgba(225,29,72,0.08)]',
    subtleText: 'text-rose-700',
  },
  'light-amber': {
    text: 'text-amber-700',
    bg: 'bg-amber-50/60',
    border: 'border-amber-200',
    hoverBg: 'hover:bg-amber-100/40',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white font-semibold',
    glow: 'rgba(217, 119, 6, 0.15)',
    accent: '#d97706',
    cardGlow: 'shadow-[0_4px_20px_-2px_rgba(217,119,6,0.08)]',
    subtleText: 'text-amber-800',
  }
};

const THEME_BACKGROUNDS: Record<string, string> = {
  indigo: 'bg-[#020617]',
  nordic: 'bg-[#031014]',
  emerald: 'bg-[#010c08]',
  cyberpunk: 'bg-[#0c0211]',
  amber: 'bg-[#0b0701]',
  'light-indigo': 'bg-[#f8fafc]',
  'light-teal': 'bg-[#f8fafc]',
  'light-rose': 'bg-[#fafafa]',
  'light-amber': 'bg-[#fafaf9]'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('SIMULATOR');
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'indigo');

  const currAccent = THEME_ACCENTS[theme] || THEME_ACCENTS.indigo;
  const isLight = theme.startsWith('light-');

  return (
    <div className={`min-h-screen ${THEME_BACKGROUNDS[theme] || 'bg-[#020617]'} ${isLight ? 'light-theme text-slate-800' : 'text-slate-200'} flex flex-col font-sans select-none pb-12 transition-colors duration-300`}>
      {/* Visual background atmospheric orb */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 blur-[120px] pointer-events-none rounded-full transition-all duration-300"
        style={{
          backgroundColor: `${currAccent.accent}12`,
        }}
      ></div>

      {/* Main Nav Header */}
      <header className={`sticky top-0 z-50 border-b py-4 px-6 md:px-12 backdrop-blur-md transition-all duration-300 ${
        isLight ? 'bg-slate-100/70 border-slate-300/40' : 'bg-slate-900/50 border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className={`p-2.5 rounded-xl bg-white/5 border border-white/10 transition-all duration-300`}
              style={{
                borderColor: isLight ? `${currAccent.accent}40` : `${currAccent.accent}33`,
                backgroundColor: isLight ? `${currAccent.accent}0a` : `${currAccent.accent}12`,
                boxShadow: isLight ? `0 0 15px ${currAccent.accent}1f` : `0 0 15px ${currAccent.accent}40`,
              }}
            >
              <Cpu className="w-6 h-6" style={{ color: currAccent.accent }} />
            </div>
            <div>
              <h1 className="font-display font-black text-lg md:text-xl tracking-tight flex items-center gap-1.5 transition-colors duration-300" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                CPU <span style={{ color: currAccent.accent }}>Scheduling Academy</span>
              </h1>
              <p className={`text-[10px] md:text-xs font-medium transition-colors duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Multi-algorithm OS simulations &amp; practice platform
              </p>
            </div>
          </div>

          {/* Theme Switcher Widget */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
              isLight 
                ? 'text-slate-700 bg-slate-200/50 border-slate-300/60' 
                : 'text-slate-400 bg-slate-950/50 border-white/10'
            }`}>
              <span className="w-2.5 h-2.5 rounded-full inline-block transition-colors duration-300" style={{ backgroundColor: currAccent.accent }}></span>
              <span>Theme:</span>
              <select
                value={theme}
                onChange={e => {
                  const nt = e.target.value;
                  setTheme(nt);
                  localStorage.setItem('theme', nt);
                }}
                className={`bg-transparent font-mono outline-none cursor-pointer border-none focus:outline-none focus:ring-0 text-xs py-0 pl-1 pr-1 font-bold transition-colors duration-300`}
                style={{ color: isLight ? '#0f172a' : '#ffffff' }}
              >
                <optgroup label="Dark Themes" className="bg-slate-900 text-white">
                  <option value="indigo">indigo</option>
                  <option value="nordic">nordic</option>
                  <option value="emerald">emerald</option>
                  <option value="cyberpunk">cyberpunk</option>
                  <option value="amber">amber</option>
                </optgroup>
                <optgroup label="Light Themes" className="bg-white text-slate-900">
                  <option value="light-indigo">light-indigo</option>
                  <option value="light-teal">light-teal</option>
                  <option value="light-rose">light-rose</option>
                  <option value="light-amber">light-amber</option>
                </optgroup>
              </select>
            </span>
          </div>
        </div>
      </header>

      {/* Primary Center Layout */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-8 mt-8 flex-1 flex flex-col space-y-8">
        
        {/* Navigation Deck Selection Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-900/55 p-1 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {[
            { id: 'SIMULATOR', label: 'Dynamic Simulator', icon: LayoutGrid, activeColor: currAccent.accent },
            { id: 'ACADEMY', label: 'Concept Academy', icon: GraduationCap, activeColor: currAccent.accent },
            { id: 'PRACTICE', label: 'Practice Lab', icon: Award, activeColor: currAccent.accent },
            { id: 'JAVA_SOURCE', label: 'Java Source', icon: Code2, activeColor: currAccent.accent },
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
                <Icon className="w-4 h-4" style={{ color: isActive ? tab.activeColor : '#64748b' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Main Sandbox Panels */}
        <div className="flex-1">
          {activeTab === 'SIMULATOR' && <SchedulerSimulator theme={theme} />}
          {activeTab === 'ACADEMY' && <ConceptAcademy theme={theme} />}
          {activeTab === 'PRACTICE' && <PracticeModule theme={theme} />}
          {activeTab === 'JAVA_SOURCE' && <JavaSourceViewer theme={theme} />}
        </div>
      </main>

      {/* Aesthetic Footer */}
      <footer className="max-w-7xl mx-auto w-full px-8 mt-12 pt-6 border-t border-white/5 flex items-center justify-center text-xs text-slate-500 font-mono">
        <p>© 2026 CPU Scheduling Academy. Operating Systems Learning Core.</p>
      </footer>
    </div>
  );
}

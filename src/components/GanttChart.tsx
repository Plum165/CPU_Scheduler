/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GanttBlock, ProcessResult } from '../types';

interface GanttChartProps {
  gantt: GanttBlock[];
  maxTime: number;
  playbackTime: number;
  isPlaying: boolean;
  processes: ProcessResult[];
}

export const getProcessColorClass = (id: number, type: 'bg' | 'text' | 'border' | 'fill' | 'accent' = 'bg'): string => {
  const colors = [
    { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', fill: '#10b981', accent: 'bg-emerald-500' },
    { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', fill: '#06b6d4', accent: 'bg-cyan-500' },
    { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30', fill: '#8b5cf6', accent: 'bg-violet-500' },
    { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', fill: '#f59e0b', accent: 'bg-amber-500' },
    { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', fill: '#f43f5e', accent: 'bg-rose-500' },
    { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', fill: '#a855f7', accent: 'bg-purple-500' },
    { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', fill: '#3b82f6', accent: 'bg-blue-500' },
  ];
  const choice = colors[id % colors.length];
  return choice[type] || choice.bg;
};

export default function GanttChart({
  gantt,
  maxTime,
  playbackTime,
  isPlaying,
  processes
}: GanttChartProps) {
  if (!gantt || gantt.length === 0 || maxTime <= 0) {
    return (
      <div className="h-24 flex items-center justify-center text-sm text-gray-400 border border-white/5 bg-white/5 rounded-xl">
        No scheduler data available to map.
      </div>
    );
  }

  // Calculate percentages for SVG widths based on maxTime
  const getPct = (time: number) => (time / maxTime) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-medium text-sm text-accent flex items-center gap-2">
          <span>■</span> Dynamic CPU Gantt Chart
        </h4>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-600 block"></span>
            <span className="text-gray-400">CPU Idle</span>
          </span>
          {processes.map(p => (
            <span key={p.id} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded ${getProcessColorClass(p.id, 'accent')}`}></span>
              <span className="text-gray-300 font-mono">P{p.id}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Gantt Visual Block */}
      <div className="relative pt-2 pb-6 px-1 bg-slate-950/40 rounded-xl border border-white/5 overflow-x-auto">
        <div className="min-w-[600px] relative h-28 select-none p-2">
          {/* Main timeline container */}
          <div className="absolute top-4 left-4 right-4 h-12 bg-slate-900 border border-white/5 rounded-lg flex overflow-hidden">
            {gantt.map((block, idx) => {
              const width = Math.max(0.5, getPct(block.endTime) - getPct(block.startTime));
              const isIdle = block.type === 'idle';
              const pid = block.processId ?? 0;
              const fillClass = isIdle ? 'bg-slate-800' : getProcessColorClass(pid, 'bg');
              const borderClass = isIdle ? 'border-slate-700/50' : getProcessColorClass(pid, 'border');
              const textClass = isIdle ? 'text-gray-500' : getProcessColorClass(pid, 'text');

              // Highlight during dynamic playback helper
              const isExecutingNow =
                !isIdle &&
                playbackTime >= block.startTime &&
                playbackTime < block.endTime;

              return (
                <div
                  key={idx}
                  style={{ width: `${width}%` }}
                  className={`h-full border-r ${borderClass} ${fillClass} flex flex-col items-center justify-center relative cursor-help transition-all duration-200 group ${
                    isExecutingNow ? 'ring-2 ring-indigo-400 ring-inset shadow-lg shadow-indigo-500/20' : ''
                  }`}
                >
                  <span className={`text-xs font-mono font-semibold ${textClass}`}>
                    {isIdle ? 'Idle' : `P${pid}`}
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">
                    {block.endTime - block.startTime}s
                  </span>

                  {/* Tooltip on hovering gantt slot */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-slate-950/95 border border-white/10 rounded-lg p-2 text-[10px] w-40 font-mono text-gray-200 z-50 shadow-2xl space-y-1 pointer-events-none">
                    <p className="font-semibold text-indigo-400">
                      {isIdle ? 'CPU Idle Frame' : `Process execution: P${pid}`}
                    </p>
                    <p>Starts: {block.startTime}s</p>
                    <p>Completes: {block.endTime}s</p>
                    <p>Duration: {block.endTime - block.startTime}s</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time axis ticks */}
          <div className="absolute top-16 left-4 right-4 h-6 flex justify-between">
            {Array.from({ length: maxTime + 1 }).map((_, t) => {
              // Only draw every tick if total maxTime <= 25, else skip some for clean aesthetics
              const step = maxTime > 25 ? Math.ceil(maxTime / 15) : 1;
              if (t % step !== 0 && t !== maxTime) return null;

              const positionPct = getPct(t);
              return (
                <div
                  key={t}
                  style={{ left: `${positionPct}%` }}
                  className="absolute flex flex-col items-center translate-y-2"
                >
                  <div className="w-[1px] h-1.5 bg-gray-600"></div>
                  <span className="text-[10px] font-mono text-gray-400 mt-1">{t}</span>
                </div>
              );
            })}
          </div>

          {/* Dynamic scanline for simulated player head */}
          {isPlaying && (
            <div
              style={{
                left: `calc(1rem + ${getPct(playbackTime)}% * (100% - 2rem) / 100)`,
                transition: 'left 200ms linear',
              }}
              className="absolute top-1 bottom-4 w-[2px] bg-indigo-400 glow-active z-30"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 absolute -top-1 left-1/2 -translate-x-1/2 shadow-lg shadow-indigo-500/50"></div>
              <div className="absolute top-0 -translate-x-1/2 left-1/2 bg-indigo-950 border border-indigo-400 text-[9px] text-indigo-200 font-mono px-1 rounded -translate-y-5">
                {playbackTime}s
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

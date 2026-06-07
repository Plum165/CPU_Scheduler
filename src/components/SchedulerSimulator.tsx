/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ProcessInput, ProcessResult, GanttBlock, TraceStep, SchedulingAlgorithm, SimulationResult } from '../types';
import { 
  simulateFCFS, 
  simulateSJF, 
  simulateSRTF, 
  simulateRR, 
  simulatePriorityNonPreemptive, 
  simulatePriorityPreemptive 
} from '../algorithms';
import GanttChart, { getProcessColorClass } from './GanttChart';
import { exportToExcel } from '../excelExporter';
import { 
  FileText, Play, Pause, SkipBack, ChevronLeft, ChevronRight, 
  Download, Shuffle, Plus, Trash2, Sliders, RefreshCw, LayoutGrid
} from 'lucide-react';

const INITIAL_PROCESSES: ProcessInput[] = [
  { id: 0, arrivalTime: 0, burstTime: 5, priority: 3 },
  { id: 1, arrivalTime: 1, burstTime: 3, priority: 1 },
  { id: 2, arrivalTime: 2, burstTime: 8, priority: 4 },
  { id: 3, arrivalTime: 3, burstTime: 6, priority: 2 }
];

export default function SchedulerSimulator() {
  const [processes, setProcesses] = useState<ProcessInput[]>(INITIAL_PROCESSES);
  const [algorithm, setAlgorithm] = useState<SchedulingAlgorithm>('FCFS');
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [pasteData, setPasteData] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Simulation outputs
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  // Animation Playback controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per second step
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Compute simulation outcomes whenever inputs change
  useEffect(() => {
    runSimulation();
    // Stop playback on input change
    setIsPlaying(false);
    setPlaybackTime(0);
  }, [processes, algorithm, timeQuantum]);

  // Clean intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Handle Playback Interval
  useEffect(() => {
    if (isPlaying && simResult) {
      intervalRef.current = setInterval(() => {
        setPlaybackTime(prev => {
          if (prev >= simResult.maxTime) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return simResult.maxTime;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, simResult, playbackSpeed]);

  const runSimulation = () => {
    if (processes.length === 0) {
      setSimResult(null);
      return;
    }

    let result: SimulationResult;
    switch (algorithm) {
      case 'FCFS':
        result = simulateFCFS(processes);
        break;
      case 'SJF':
        result = simulateSJF(processes);
        break;
      case 'SRTF':
        result = simulateSRTF(processes);
        break;
      case 'RR':
        result = simulateRR(processes, timeQuantum);
        break;
      case 'PRI_NP':
        result = simulatePriorityNonPreemptive(processes);
        break;
      case 'PRI_P':
        result = simulatePriorityPreemptive(processes);
        break;
      default:
        result = simulateFCFS(processes);
    }
    setSimResult(result);
    // Boundary checks for playback when timeline changes
    if (playbackTime > result.maxTime) {
      setPlaybackTime(0);
    }
  };

  // Add single empty process
  const handleAddProcess = () => {
    if (processes.length >= 10) return; // Limit to 10 rows for clean visual layouts
    const nextId = processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1;
    setProcesses(prev => [
      ...prev,
      { id: nextId, arrivalTime: Math.min(10, nextId), burstTime: Math.max(1, Math.round(Math.random() * 8) + 1), priority: 3 }
    ]);
  };

  // Remove individual process
  const handleRemoveProcess = (id: number) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  };

  // Edit fields
  const handleUpdateProcessValue = (id: number, field: keyof ProcessInput, value: number) => {
    setProcesses(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Random preset generator
  const handleRandomize = () => {
    const size = Math.floor(Math.random() * 3) + 3; // 3 to 5 processes
    const rands: ProcessInput[] = Array.from({ length: size }).map((_, idx) => ({
      id: idx,
      arrivalTime: Math.floor(Math.random() * 6),
      burstTime: Math.floor(Math.random() * 9) + 1,
      priority: Math.floor(Math.random() * 5) + 1
    }));
    setProcesses(rands);
    setPlaybackTime(0);
    setIsPlaying(false);
  };

  // Pasting raw process blocks directly matching processes.txt format!
  const handleParsePaste = () => {
    setErrorMessage('');
    if (!pasteData.trim()) {
      setErrorMessage('Input paste cannot be empty.');
      return;
    }

    try {
      const lines = pasteData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        throw new Error('Please ensure you specify the number of processes followed by headers and process rows.');
      }

      // Check if first line is number of processes
      const numProcesses = parseInt(lines[0], 10);
      if (isNaN(numProcesses)) {
        throw new Error('Format must start with a number representing lines of processes (e.g., 4)');
      }

      const rows: ProcessInput[] = [];
      let processesFound = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Skip header lines with names like "Processor", "Arrival Time", "CPU Burst"
        if (line.toLowerCase().includes('arrival') || line.toLowerCase().includes('burst') || line.toLowerCase().includes('processor') || line.toLowerCase().includes('cpu')) {
          continue;
        }

        const parts = line.split(/\s+/);
        if (parts.length >= 3) {
          const id = parseInt(parts[0], 10);
          const arrival = parseInt(parts[1], 10);
          const burst = parseInt(parts[2], 10);
          const priority = parts[3] ? parseInt(parts[3], 10) : 3;

          if (isNaN(id) || isNaN(arrival) || isNaN(burst)) {
            continue; // Skip faulty lines
          }

          rows.push({ id, arrivalTime: arrival, burstTime: burst, priority });
          processesFound++;
          if (processesFound >= numProcesses) break;
        }
      }

      if (rows.length === 0) {
        throw new Error('Could not parse any valid processes. Verify columns are delimited by spaces or tabs.');
      }

      setProcesses(rows);
      setShowPasteModal(false);
      setPasteData('');
      setPlaybackTime(0);
      setIsPlaying(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Parsing failure. Ensure standard copy-pasted layout.');
    }
  };

  // Excel trigger matching user's specific POI layout
  const handleDownloadExcel = () => {
    if (!simResult) return;
    exportToExcel(simResult.algorithm, simResult.processes, simResult.gantt, simResult.maxTime);
  };

  // Playback step navigation
  const handlePrevStep = () => {
    setIsPlaying(false);
    setPlaybackTime(prev => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (simResult) {
      setPlaybackTime(prev => Math.min(simResult.maxTime, prev + 1));
    }
  };

  const handleResetPlayback = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  // Find active Trace step matching clock ticker
  const activeTraceStep: TraceStep | undefined = simResult?.trace.find(t => t.time === playbackTime);

  // Identify process currently assigned to CPU at 'playbackTime'
  const activeRunningPid = activeTraceStep ? activeTraceStep.runningProcessId : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Process Input Table (lg: 5-columns width) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="glass-panel border border-white/5 rounded-2xl p-5 md:p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display font-semibold text-sm text-gray-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" /> Process Directory
                </h3>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowPasteModal(true)}
                    className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-indigo-500/20 text-xs px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer"
                    title="Paste processes.txt input text directly"
                  >
                    <FileText className="w-3.5 h-3.5" /> Import
                  </button>
                  <button
                    onClick={handleRandomize}
                    className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-gray-300 border border-white/5 text-xs px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> Random
                  </button>
                </div>
              </div>

              {/* Input grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-gray-300">
                  <thead className="text-gray-500 bg-slate-950/40">
                    <tr>
                      <th className="p-2">ID</th>
                      <th className="p-2">Arrival (s)</th>
                      <th className="p-2">Burst (s)</th>
                      {(algorithm === 'PRI_NP' || algorithm === 'PRI_P') && (
                        <th className="p-2">Priority</th>
                      )}
                      <th className="p-2 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {processes.map(p => (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-slate-900/30 transition duration-150 ${
                          activeRunningPid === p.id && isPlaying ? 'bg-indigo-500/10' : ''
                        }`}
                      >
                        <td className="p-2 font-bold text-gray-200">
                          <span className={`inline-block w-2.5 h-2.5 rounded mr-1.5 ${getProcessColorClass(p.id, 'accent')}`}></span>
                          P{p.id}
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={p.arrivalTime}
                            onChange={e => handleUpdateProcessValue(p.id, 'arrivalTime', Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-slate-950 border border-white/10 rounded px-1.5 py-1 w-14 text-center focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={p.burstTime}
                            onChange={e => handleUpdateProcessValue(p.id, 'burstTime', Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-slate-950 border border-white/10 rounded px-1.5 py-1 w-14 text-center focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                        {(algorithm === 'PRI_NP' || algorithm === 'PRI_P') && (
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={p.priority}
                              onChange={e => handleUpdateProcessValue(p.id, 'priority', Math.max(1, parseInt(e.target.value) || 1))}
                              className="bg-slate-950 border border-white/10 rounded px-1.5 py-1 w-14 text-center focus:border-indigo-500 focus:outline-none"
                              title="Low priority number represents HIGHER operating priority"
                            />
                          </td>
                        )}
                        <td className="p-2 text-right">
                          <button
                            onClick={() => handleRemoveProcess(p.id)}
                            className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {processes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                          Process list is empty. Add columns or import processes to calculate scheduling.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex gap-2">
              <button
                onClick={handleAddProcess}
                disabled={processes.length >= 10}
                className="flex-1 bg-slate-900 border border-white/10 hover:border-white/15 hover:bg-slate-800 text-gray-300 font-sans text-xs font-medium py-2 px-3 rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" /> New Process (Max 10)
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Algo Controls and Metrics (lg: 7-columns width) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="glass-panel border border-white/5 rounded-2xl p-5 md:p-6 space-y-6">
            
            {/* Algorithm selector and options */}
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-sm text-gray-200">
                ⚙️ Scheduling Core Configuration
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: 'FCFS', label: 'FCFS (First-Come)' },
                  { value: 'SJF', label: 'SJF (Shortest Job)' },
                  { value: 'SRTF', label: 'SRTF (Preemptive)' },
                  { value: 'RR', label: 'Round Robin (RR)' },
                  { value: 'PRI_NP', label: 'Priority (Non-Pre)' },
                  { value: 'PRI_P', label: 'Priority (Preemptive)' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAlgorithm(opt.value as SchedulingAlgorithm)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition duration-150 cursor-pointer ${
                      algorithm === opt.value
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300 shadow-md shadow-indigo-500/5'
                        : 'border-white/5 bg-slate-900/30 text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Round Robin Dynamic Time Slice slider */}
              {algorithm === 'RR' && (
                <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4 font-mono text-xs">
                  <div>
                    <h4 className="text-gray-300 font-semibold">Time Quantum (Slice Duration)</h4>
                    <p className="text-gray-500 text-[10px] mt-0.5">CPU cycles limits per process context-switch</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={timeQuantum}
                      onChange={e => setTimeQuantum(parseInt(e.target.value))}
                      className="accent-indigo-500"
                    />
                    <span className="text-indigo-400 font-bold bg-indigo-950/50 border border-indigo-500/20 px-2.5 py-1 rounded w-10 text-center">
                      {timeQuantum}s
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Average statistics indicator */}
            {simResult && (
              <div className="space-y-3 pt-2">
                <h4 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-widest">
                  📊 Algorithmic Metrics Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#121623]/80 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">Average Turnaround Time</span>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-3xl font-display font-bold text-gray-100">{simResult.avgTurnaroundTime}</span>
                      <span className="text-xs text-gray-500 font-mono">seconds</span>
                    </div>
                  </div>

                  <div className="bg-[#121623]/80 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">Average Waiting Time</span>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-3xl font-display font-bold text-teal-400">{simResult.avgWaitingTime}</span>
                      <span className="text-xs text-gray-500 font-mono">seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Gantt chart and Playback ticker outputs */}
      {simResult && (
        <div className="glass-panel border border-white/5 rounded-2xl p-5 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-100 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-400" /> Simulation Results Viewer
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                Active core: <span className="text-indigo-300 font-bold">{simResult.algorithm}</span>
              </p>
            </div>
            {/* Multi-Tab Microsoft Excel export download */}
            <button
              onClick={handleDownloadExcel}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-sans font-bold text-xs px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Download className="w-4 h-4" /> Download POI Multi-tab XLS
            </button>
          </div>

          {/* Render Gantt Chart */}
          <GanttChart 
            gantt={simResult.gantt} 
            maxTime={simResult.maxTime} 
            playbackTime={playbackTime}
            isPlaying={isPlaying}
            processes={simResult.processes}
          />

          {/* Visual animation and timeline players */}
          <div className="bg-slate-950/40 rounded-xl border border-white/5 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Playback action deck */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleResetPlayback}
                  className="bg-slate-900 border border-white/5 hover:bg-slate-800 p-2 rounded-lg text-gray-400 hover:text-gray-200 transition duration-150 cursor-pointer"
                  title="Return block timer to 0s"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrevStep}
                  className="bg-slate-900 border border-white/5 hover:bg-slate-800 p-2 rounded-lg text-gray-400 hover:text-gray-200 transition duration-150 cursor-pointer"
                  title="Step block backward (1s)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {isPlaying ? (
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 p-2 px-3.5 rounded-lg font-bold flex items-center gap-1.5 transition duration-150 cursor-pointer"
                  >
                    <Pause className="w-4 h-4" /> Pause
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 p-2 px-3.5 rounded-lg font-bold flex items-center gap-1.5 transition duration-150 cursor-pointer animate-pulse"
                  >
                    <Play className="w-4 h-4 text-white" /> Play
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  className="bg-slate-900 border border-white/10 hover:bg-slate-800 p-2 rounded-lg text-gray-400 hover:text-gray-200 transition duration-150 cursor-pointer"
                  title="Step block forward (1s)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Slider control */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-gray-400">Step Interval:</span>
                <select
                  value={playbackSpeed}
                  onChange={e => setPlaybackSpeed(parseInt(e.target.value))}
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-indigo-400 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value={2000}>Slow (2.0s)</option>
                  <option value={1000}>Classic (1.0s)</option>
                  <option value={500}>Speedy (0.5s)</option>
                  <option value={200}>Super Clock (0.2s)</option>
                </select>
              </div>
            </div>

            {/* Micro second detailed tracer logs */}
            <div className="bg-slate-950/80 rounded-lg p-3.5 border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-4 font-mono text-xs">
              <div className="md:col-span-2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 pb-3 md:pb-0">
                <span className="text-gray-500 uppercase tracking-wider text-[10px]">CPU Execution tick</span>
                <span className="text-2xl font-bold text-indigo-400 mt-1">{playbackTime}s / {simResult.maxTime}s</span>
              </div>
              <div className="md:col-span-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 pb-3 md:pb-0">
                <span className="text-gray-500 uppercase tracking-wider text-[10px] block">OS Ready Queue Status</span>
                <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                  {activeTraceStep && activeTraceStep.readyQueue.length > 0 ? (
                    activeTraceStep.readyQueue.map(pid => (
                      <span key={pid} className={`px-2 py-0.5 rounded text-[10px] font-bold ${getProcessColorClass(pid, 'bg')} ${getProcessColorClass(pid, 'text')}`}>
                        P{pid}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic text-[11px]">Ready Queue is Empty</span>
                  )}
                </div>
              </div>
              <div className="md:col-span-6 flex flex-col justify-center">
                <span className="text-gray-500 uppercase tracking-wider text-[10px]">Analytical OS Step Trace</span>
                <p className="text-gray-300 mt-1 pb-1.5 leading-relaxed text-[11px] font-sans">
                  {activeTraceStep ? activeTraceStep.explanation : 'No statement processed for this timestep.'}
                </p>
              </div>
            </div>
          </div>

          {/* Complete process statistics grid */}
          <div className="space-y-3 pt-2">
            <h4 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-widest">
              📊 Process Output Table &amp; POI Styling
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-gray-300 border border-white/5 rounded-xl overflow-hidden">
                <thead className="bg-slate-950/60 text-gray-400">
                  <tr className="border-b border-white/5">
                    <th className="p-3">Process ID</th>
                    <th className="p-3">Arrival Time</th>
                    <th className="p-3">Burst Time</th>
                    {processes[0]?.priority !== undefined && <th className="p-3">Priority</th>}
                    <th className="p-3">Start Time</th>
                    <th className="p-3">Completion Time</th>
                    <th className="p-3">Turnaround Time</th>
                    <th className="p-3">WaitingTime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {simResult.processes.map(p => {
                    // Waiting time visual coloring matching Java org.apache.poi FCFS Excel summary style
                    // <= 5 light green, > 5 light red
                    const waitColorClass = p.waitingTime <= 5 
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" 
                      : "bg-red-500/10 text-red-300 border border-red-500/20";

                    return (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-slate-900/40 transition duration-150 ${
                          activeRunningPid === p.id && isPlaying ? 'bg-indigo-500/10 font-bold' : ''
                        }`}
                      >
                        <td className="p-3 font-semibold text-gray-100">
                          <span className={`inline-block w-2.5 h-2.5 rounded mr-2 ${getProcessColorClass(p.id, 'accent')}`}></span>
                          P{p.id}
                        </td>
                        <td className="p-3">{p.arrivalTime}s</td>
                        <td className="p-3">{p.burstTime}s</td>
                        {p.priority !== undefined && <td className="p-3">{p.priority}</td>}
                        <td className="p-3">{p.startTime}s</td>
                        <td className="p-3">{p.completionTime}s</td>
                        <td className="p-3">{p.turnaroundTime}s</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded font-bold text-[10px] ${waitColorClass}`}>
                            {p.waitingTime}s
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-[11px] text-gray-500 pt-1 font-mono">
              <p>
                * Average calculations: $\sum TAT / n$, $\sum WT / n$ with exact decimal margins.
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded"></span> Wait time ≤ 5s (POI Green Rule)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-red-500/20 border border-red-500/30 rounded"></span> Wait time &gt; 5s (POI Red Rule)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PASTE DIALOG / MODAL PANEL */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-slate-950/80 m-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#121623] border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="font-display font-semibold text-sm text-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> parse processes.txt Input Blocks
              </h4>
              <button
                onClick={() => { setShowPasteModal(false); setErrorMessage(''); }}
                className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Paste raw process parameters matching standard tabular formats. You can paste the exact input sequence provided in the assignment description below:
              </p>
            </div>

            <pre className="bg-slate-950/80 p-2 text-[10px] font-mono text-gray-500 border border-white/5 rounded-lg select-all">
{`4
Processor	Arrival Time	CPU Burst
0	        0	        5
1	        1	        3
2	        2	        8
3	        3	        6`}
            </pre>

            <textarea
              className="bg-slate-950 border border-white/10 w-full h-36 font-mono text-xs p-3 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-200"
              placeholder={`Paste format here...`}
              value={pasteData}
              onChange={e => setPasteData(e.target.value)}
            />

            {errorMessage && (
              <p className="text-xs text-red-400 font-mono bg-red-950/20 border border-red-500/20 p-2.5 rounded">
                ⚠ {errorMessage}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
              <button
                onClick={() => { setShowPasteModal(false); setErrorMessage(''); }}
                className="bg-slate-900 border border-white/5 text-gray-400 hover:text-gray-200 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleParsePaste}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Import Process Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProcessInput {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority: number; // For Priority scheduling, support low number = high priority
}

export interface ProcessResult extends ProcessInput {
  startTime: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
}

export interface GanttBlock {
  type: 'process' | 'idle';
  processId?: number; // undefined if idle
  startTime: number;
  endTime: number;
}

export interface TraceStep {
  time: number;
  readyQueue: number[]; // Array of process IDs currently in readiness queue
  runningProcessId: number | null; // Currently executing process ID, null if idle
  explanation: string; // Dynamic message explaining the scheduler's action at this second
  remainingBursts: Record<number, number>; // Maps processId to current remaining burst time
}

export interface SimulationResult {
  algorithm: string;
  processes: ProcessResult[];
  gantt: GanttBlock[];
  trace: TraceStep[];
  avgTurnaroundTime: number;
  avgWaitingTime: number;
  maxTime: number;
}

export type SchedulingAlgorithm = 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'PRI_NP' | 'PRI_P';

export interface PracticeQuestion {
  id: number;
  scenario: string;
  algorithm: SchedulingAlgorithm;
  timeQuantum?: number;
  processes: { id: number; arrivalTime: number; burstTime: number; priority?: number }[];
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

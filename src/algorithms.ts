/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessInput, ProcessResult, GanttBlock, TraceStep, SimulationResult } from './types';

// Helper to clone process inputs
const cloneInputs = (inputs: ProcessInput[]): ProcessInput[] => {
  return inputs.map(p => ({ ...p }));
};

/**
 * 1. FIRST-COME, FIRST-SERVED (FCFS)
 */
export function simulateFCFS(inputs: ProcessInput[]): SimulationResult {
  const sorted = cloneInputs(inputs).sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id - b.id; // Tie-breaker: original ID
  });

  const processes: ProcessResult[] = [];
  const gantt: GanttBlock[] = [];
  const trace: TraceStep[] = [];

  let currentTime = 0;
  const remainingBursts: Record<number, number> = {};
  inputs.forEach(p => { remainingBursts[p.id] = p.burstTime; });

  for (const p of sorted) {
    if (currentTime < p.arrivalTime) {
      // CPU was Idle
      gantt.push({
        type: 'idle',
        startTime: currentTime,
        endTime: p.arrivalTime,
      });

      // Trace idle units
      for (let t = currentTime; t < p.arrivalTime; t++) {
        trace.push({
          time: t,
          readyQueue: [],
          runningProcessId: null,
          explanation: `System is idle. Waiting for Process P${p.id} to arrive.`,
          remainingBursts: { ...remainingBursts },
        });
      }
      currentTime = p.arrivalTime;
    }

    const startTime = currentTime;
    const completionTime = startTime + p.burstTime;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = startTime - p.arrivalTime;

    const result: ProcessResult = {
      ...p,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
    };
    processes.push(result);

    gantt.push({
      type: 'process',
      processId: p.id,
      startTime,
      endTime: completionTime,
    });

    // Record trace clock-by-clock for FCFS
    for (let t = startTime; t < completionTime; t++) {
      remainingBursts[p.id] = completionTime - t;
      // Get other arrived processes for the ready queue
      const readyQueue = inputs
        .filter(ip => ip.id !== p.id && ip.arrivalTime <= t && remainingBursts[ip.id] > 0)
        .sort((a, b) => a.arrivalTime - b.arrivalTime)
        .map(ip => ip.id);

      trace.push({
        time: t,
        readyQueue,
        runningProcessId: p.id,
        explanation: t === startTime 
          ? `Process P${p.id} arrives or starts executing immediately as it is the first in line (arrival=${p.arrivalTime}).`
          : `Process P${p.id} continues executing (rem: ${remainingBursts[p.id]}s).`,
        remainingBursts: { ...remainingBursts },
      });
    }

    currentTime = completionTime;
    remainingBursts[p.id] = 0;
  }

  // Calculate stats
  const totalTurnaround = processes.reduce((acc, p) => acc + p.turnaroundTime, 0);
  const totalWaiting = processes.reduce((acc, p) => acc + p.waitingTime, 0);
  const maxTime = currentTime;

  // Final step trace
  trace.push({
    time: maxTime,
    readyQueue: [],
    runningProcessId: null,
    explanation: 'All processes have completed execution successfully!',
    remainingBursts: { ...remainingBursts },
  });

  return {
    algorithm: 'First-Come-First-Serve (FCFS)',
    processes: processes.sort((a, b) => a.id - b.id),
    gantt,
    trace,
    avgTurnaroundTime: Number((totalTurnaround / inputs.length).toFixed(2)),
    avgWaitingTime: Number((totalWaiting / inputs.length).toFixed(2)),
    maxTime,
  };
}

/**
 * 2. SHORTEST JOB FIRST (SJF) - Non-Preemptive
 */
export function simulateSJF(inputs: ProcessInput[]): SimulationResult {
  const processes: ProcessResult[] = [];
  const gantt: GanttBlock[] = [];
  const trace: TraceStep[] = [];

  const uncompleted = cloneInputs(inputs);
  const remainingBursts: Record<number, number> = {};
  inputs.forEach(p => { remainingBursts[p.id] = p.burstTime; });

  let currentTime = 0;

  while (uncompleted.length > 0) {
    // Collect ready processes
    const ready = uncompleted.filter(p => p.arrivalTime <= currentTime);

    if (ready.length === 0) {
      // Find the next arrival time
      const nextArrival = Math.min(...uncompleted.map(p => p.arrivalTime));
      gantt.push({
        type: 'idle',
        startTime: currentTime,
        endTime: nextArrival,
      });

      for (let t = currentTime; t < nextArrival; t++) {
        trace.push({
          time: t,
          readyQueue: [],
          runningProcessId: null,
          explanation: 'CPU is idle. No processes are currently in the Ready Queue.',
          remainingBursts: { ...remainingBursts },
        });
      }
      currentTime = nextArrival;
      continue;
    }

    // Sort by burst time, then by arrival time, then by ID (SJF rules)
    ready.sort((a, b) => {
      if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id - b.id;
    });

    const selected = ready[0];
    const index = uncompleted.findIndex(p => p.id === selected.id);
    uncompleted.splice(index, 1);

    const startTime = currentTime;
    const completionTime = startTime + selected.burstTime;
    const turnaroundTime = completionTime - selected.arrivalTime;
    const waitingTime = startTime - selected.arrivalTime;

    processes.push({
      ...selected,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
    });

    gantt.push({
      type: 'process',
      processId: selected.id,
      startTime,
      endTime: completionTime,
    });

    // Trace clock times for block
    for (let t = startTime; t < completionTime; t++) {
      remainingBursts[selected.id] = completionTime - t;
      const readyQueue = uncompleted
        .filter(up => up.arrivalTime <= t)
        .sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime)
        .map(up => up.id);

      trace.push({
        time: t,
        readyQueue,
        runningProcessId: selected.id,
        explanation: t === startTime
          ? `Scheduler selects Process P${selected.id} (burst: ${selected.burstTime}) because it has the shortest CPU burst among all ready processes.`
          : `Process P${selected.id} continues executing dynamically (rem: ${remainingBursts[selected.id]}s).`,
        remainingBursts: { ...remainingBursts },
      });
    }

    currentTime = completionTime;
    remainingBursts[selected.id] = 0;
  }

  const totalTurnaround = processes.reduce((acc, p) => acc + p.turnaroundTime, 0);
  const totalWaiting = processes.reduce((acc, p) => acc + p.waitingTime, 0);
  const maxTime = currentTime;

  trace.push({
    time: maxTime,
    readyQueue: [],
    runningProcessId: null,
    explanation: 'Shortest Job First (SJF) execution concludes successfully.',
    remainingBursts: { ...remainingBursts },
  });

  return {
    algorithm: 'Shortest Job First (SJF)',
    processes: processes.sort((a, b) => a.id - b.id),
    gantt,
    trace,
    avgTurnaroundTime: Number((totalTurnaround / inputs.length).toFixed(2)),
    avgWaitingTime: Number((totalWaiting / inputs.length).toFixed(2)),
    maxTime,
  };
}

/**
 * 3. SHORTEST REMAINING TIME FIRST (SRTF) - Preemptive SJF
 */
export function simulateSRTF(inputs: ProcessInput[]): SimulationResult {
  const processes: { [key: number]: Partial<ProcessResult> & { id: number } } = {};
  inputs.forEach(p => {
    processes[p.id] = {
      ...p,
      startTime: -1,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
    };
  });

  const gantt: GanttBlock[] = [];
  const trace: TraceStep[] = [];

  const remainingBursts: Record<number, number> = {};
  inputs.forEach(p => { remainingBursts[p.id] = p.burstTime; });

  const totalProcessCount = inputs.length;
  let completedCount = 0;
  let t = 0;
  let lastActiveId: number | null = null;
  let blockStartTime = 0;

  while (completedCount < totalProcessCount) {
    // Find all arrived, uncompleted processes at time 't'
    const ready = inputs.filter(p => p.arrivalTime <= t && remainingBursts[p.id] > 0);

    if (ready.length === 0) {
      // Idle state
      if (lastActiveId !== null) {
        gantt.push({
          type: 'process',
          processId: lastActiveId,
          startTime: blockStartTime,
          endTime: t,
        });
        lastActiveId = null;
      }

      const idleBlockStart = t;
      trace.push({
        time: t,
        readyQueue: [],
        runningProcessId: null,
        explanation: 'Preemptive scheduler detects no active ready processes. CPU is idling.',
        remainingBursts: { ...remainingBursts },
      });

      // Advance 1 step
      t++;
      // If next steps continue idle, they'll draw properly
      continue;
    }

    // Sort ready processes by remaining burst limit, tie break by arrival, then by ID
    ready.sort((a, b) => {
      const remA = remainingBursts[a.id];
      const remB = remainingBursts[b.id];
      if (remA !== remB) return remA - remB;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id - b.id;
    });

    const currentProcess = ready[0];
    const pid = currentProcess.id;

    // Start time logging
    if (processes[pid].startTime === -1) {
      processes[pid].startTime = t;
    }

    // Context Switch and Gantt layout building
    if (lastActiveId !== pid) {
      // Close the previous block if existed
      if (lastActiveId !== null) {
        gantt.push({
          type: 'process',
          processId: lastActiveId,
          startTime: blockStartTime,
          endTime: t,
        });
      } else {
        // If there was an idle section before, seal it
        const prevIdleIndex = gantt.findIndex(b => b.type === 'idle' && b.endTime === t);
        if (prevIdleIndex === -1 && t > 0) {
          // Fill missing idle
          const latestClosedTime = gantt.length > 0 ? gantt[gantt.length - 1].endTime : 0;
          if (latestClosedTime < t) {
            gantt.push({
              type: 'idle',
              startTime: latestClosedTime,
              endTime: t,
            });
          }
        }
      }
      blockStartTime = t;
      lastActiveId = pid;
    }

    // Capture queue
    const readyQueue = ready
      .filter(p => p.id !== pid)
      .map(p => p.id);

    // Dynamic traces
    let expl = `Process P${pid} is chosen for execution (remaining: ${remainingBursts[pid]}s).`;
    if (readyQueue.length > 0) {
      expl += ` It preempts or beats out P${readyQueue.join(', P')} due to shorter remaining time.`;
    }

    trace.push({
      time: t,
      readyQueue,
      runningProcessId: pid,
      explanation: expl,
      remainingBursts: { ...remainingBursts },
    });

    // Execute 1 time unit
    remainingBursts[pid]--;
    t++;

    if (remainingBursts[pid] === 0) {
      // Process has completed
      processes[pid].completionTime = t;
      processes[pid].turnaroundTime = t - processes[pid].arrivalTime!;
      processes[pid].waitingTime = processes[pid].turnaroundTime! - processes[pid].burstTime!;
      completedCount++;

      // Close Gantt Block
      gantt.push({
        type: 'process',
        processId: pid,
        startTime: blockStartTime,
        endTime: t,
      });
      lastActiveId = null; // Forces next loop to restart blockStartTime
    }
  }

  // Record final step
  trace.push({
    time: t,
    readyQueue: [],
    runningProcessId: null,
    explanation: 'Preemptive SRTF Scheduling has concluded all jobs.',
    remainingBursts: { ...remainingBursts },
  });

  // Consolidate continuous idle/process blocks in Gantt for visual clarity
  const mergedGantt: GanttBlock[] = [];
  for (const block of gantt) {
    if (block.startTime === block.endTime) continue; // Skip zero-length blocks
    
    if (mergedGantt.length > 0) {
      const prev = mergedGantt[mergedGantt.length - 1];
      if (prev.type === block.type && prev.processId === block.processId) {
        prev.endTime = block.endTime;
      } else {
        mergedGantt.push({ ...block });
      }
    } else {
      mergedGantt.push({ ...block });
    }
  }

  const finishedProcs = Object.values(processes) as ProcessResult[];
  const totalTurnaround = finishedProcs.reduce((acc, p) => acc + p.turnaroundTime, 0);
  const totalWaiting = finishedProcs.reduce((acc, p) => acc + p.waitingTime, 0);

  return {
    algorithm: 'Shortest Remaining Time First (SRTF)',
    processes: finishedProcs.sort((a, b) => a.id - b.id),
    gantt: mergedGantt,
    trace,
    avgTurnaroundTime: Number((totalTurnaround / inputs.length).toFixed(2)),
    avgWaitingTime: Number((totalWaiting / inputs.length).toFixed(2)),
    maxTime: t,
  };
}

/**
 * 4. ROUND ROBIN (RR)
 */
export function simulateRR(inputs: ProcessInput[], timeQuantum: number, rrMode: 'standard' | 'academic' = 'standard'): SimulationResult {
  const processes: { [key: number]: Partial<ProcessResult> & { id: number } } = {};
  inputs.forEach(p => {
    processes[p.id] = {
      ...p,
      startTime: -1,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
    };
  });

  const gantt: GanttBlock[] = [];
  const trace: TraceStep[] = [];

  const remainingBursts: Record<number, number> = {};
  inputs.forEach(p => { remainingBursts[p.id] = p.burstTime; });

  const unstarted = cloneInputs(inputs).sort((a, b) => a.arrivalTime - b.arrivalTime || a.id - b.id);
  const readyQueue: number[] = [];
  
  let t = 0;
  let completedCount = 0;
  const n = inputs.length;

  // Let's implement queue and track execution chunks
  let activeId: number | null = null;
  let qRemaining = 0;
  let blockStart = 0;
  let lastScheduledId = -1; // For academic mode tracking

  if (rrMode === 'standard') {
    // Add initial arrivals at time 0
    while (unstarted.length > 0 && unstarted[0].arrivalTime <= 0) {
      const p = unstarted.shift()!;
      readyQueue.push(p.id);
    }

    while (completedCount < n) {
      if (activeId === null) {
        if (readyQueue.length === 0) {
          // Idle
          const nextArrival = unstarted.length > 0 ? unstarted[0].arrivalTime : t + 1;
          gantt.push({
            type: 'idle',
            startTime: t,
            endTime: nextArrival,
          });

          for (let timeStep = t; timeStep < nextArrival; timeStep++) {
            // Handle arrivals mid-idle step
            while (unstarted.length > 0 && unstarted[0].arrivalTime <= timeStep) {
              const p = unstarted.shift()!;
              readyQueue.push(p.id);
            }

            trace.push({
              time: timeStep,
              readyQueue: [...readyQueue],
              runningProcessId: null,
              explanation: `No process is ready. CPU idling. Waiting for next arrival.`,
              remainingBursts: { ...remainingBursts },
            });
          }
          t = nextArrival;
          
          // Push newly arrived
          while (unstarted.length > 0 && unstarted[0].arrivalTime <= t) {
            const p = unstarted.shift()!;
            if (!readyQueue.includes(p.id)) readyQueue.push(p.id);
          }
          continue;
        }

        // Pop next from Ready Queue
        activeId = readyQueue.shift()!;
        qRemaining = Math.min(timeQuantum, remainingBursts[activeId]);
        blockStart = t;

        if (processes[activeId].startTime === -1) {
          processes[activeId].startTime = t;
        }
      }

      // Capture other processes ready queue list
      const tracingReady = [...readyQueue];

      trace.push({
        time: t,
        readyQueue: tracingReady,
        runningProcessId: activeId,
        explanation: `Process P${activeId} executes. Time quantum slice remaining: ${qRemaining}s (burst left: ${remainingBursts[activeId]}s).`,
        remainingBursts: { ...remainingBursts },
      });

      // Execute 1 unit
      remainingBursts[activeId]--;
      qRemaining--;
      t++;

      // Load newly arrived processes EXACTLY at this time unit
      // Crucial operating system rule: new processes arriving at 't' enter ready queue BEFORE preempted processes go back in
      const newlyArrived: number[] = [];
      while (unstarted.length > 0 && unstarted[0].arrivalTime <= t) {
        const p = unstarted.shift()!;
        newlyArrived.push(p.id);
      }
      // Push new arrivals into main queue
      readyQueue.push(...newlyArrived);

      if (remainingBursts[activeId] === 0) {
        // Process finished
        processes[activeId].completionTime = t;
        processes[activeId].turnaroundTime = t - processes[activeId].arrivalTime!;
        processes[activeId].waitingTime = processes[activeId].turnaroundTime! - processes[activeId].burstTime!;
        completedCount++;

        gantt.push({
          type: 'process',
          processId: activeId,
          startTime: blockStart,
          endTime: t,
        });

        activeId = null;
      } else if (qRemaining === 0) {
        // Quantum time limit exhausted, Preempt & send to back of queue
        gantt.push({
          type: 'process',
          processId: activeId,
          startTime: blockStart,
          endTime: t,
        });

        readyQueue.push(activeId);
        activeId = null;
      }
    }
  } else {
    // Academic Circular Mode (scans candidates in circle of arrived/active process IDs)
    while (completedCount < n) {
      // Find arrived candidates with remaining burst
      const candidates = inputs.filter(p => p.arrivalTime <= t && remainingBursts[p.id] > 0);

      if (activeId === null) {
        if (candidates.length === 0) {
          // Idle state until next arrival
          const nextArriv = unstarted.length > 0 ? unstarted[0].arrivalTime : t + 1;
          gantt.push({
            type: 'idle',
            startTime: t,
            endTime: nextArriv,
          });

          for (let timeStep = t; timeStep < nextArriv; timeStep++) {
            trace.push({
              time: timeStep,
              readyQueue: [],
              runningProcessId: null,
              explanation: `No process is ready at t=${timeStep}s. CPU idling. Waiting for next arrival.`,
              remainingBursts: { ...remainingBursts },
            });
          }
          t = nextArriv;
          
          // Pull arrived ones out of unstarted
          while (unstarted.length > 0 && unstarted[0].arrivalTime <= t) {
            unstarted.shift();
          }
          continue;
        }

        // Sort candidates based on academic circular distance from lastScheduledId
        const sortedCandidates = [...candidates].sort((a, b) => {
          const distA = a.id > lastScheduledId ? (a.id - lastScheduledId) : (a.id - lastScheduledId + 1000);
          const distB = b.id > lastScheduledId ? (b.id - lastScheduledId) : (b.id - lastScheduledId + 1000);
          return distA - distB;
        });

        activeId = sortedCandidates[0].id;
        qRemaining = Math.min(timeQuantum, remainingBursts[activeId]);
        blockStart = t;
        lastScheduledId = activeId;

        if (processes[activeId].startTime === -1) {
          processes[activeId].startTime = t;
        }
      }

      // Ready list for tracing: Other active candidates ordered circularly for presentation
      const readyQueueForTrace = candidates
        .filter(c => c.id !== activeId)
        .sort((a, b) => {
          const distA = a.id > lastScheduledId ? (a.id - lastScheduledId) : (a.id - lastScheduledId + 1000);
          const distB = b.id > lastScheduledId ? (b.id - lastScheduledId) : (b.id - lastScheduledId + 1000);
          return distA - distB;
        })
        .map(c => c.id);

      trace.push({
        time: t,
        readyQueue: readyQueueForTrace,
        runningProcessId: activeId,
        explanation: `Process P${activeId} executes. Time quantum slice remaining: ${qRemaining}s (burst left: ${remainingBursts[activeId]}s).`,
        remainingBursts: { ...remainingBursts },
      });

      // Execute 1 unit
      remainingBursts[activeId]--;
      qRemaining--;
      t++;

      // Pull from unstarted for any newly arrived strictly up to 't'
      while (unstarted.length > 0 && unstarted[0].arrivalTime <= t) {
        unstarted.shift();
      }

      if (remainingBursts[activeId] === 0) {
        processes[activeId].completionTime = t;
        processes[activeId].turnaroundTime = t - processes[activeId].arrivalTime!;
        processes[activeId].waitingTime = processes[activeId].turnaroundTime! - processes[activeId].burstTime!;
        completedCount++;

        gantt.push({
          type: 'process',
          processId: activeId,
          startTime: blockStart,
          endTime: t,
        });

        activeId = null;
      } else if (qRemaining === 0) {
        gantt.push({
          type: 'process',
          processId: activeId,
          startTime: blockStart,
          endTime: t,
        });

        activeId = null;
      }
    }
  }

  trace.push({
    time: t,
    readyQueue: [],
    runningProcessId: null,
    explanation: 'Round Robin scheduling simulation completes successfully.',
    remainingBursts: { ...remainingBursts },
  });

  const finishedProcs = Object.values(processes) as ProcessResult[];
  const totalTurnaround = finishedProcs.reduce((acc, p) => acc + p.turnaroundTime, 0);
  const totalWaiting = finishedProcs.reduce((acc, p) => acc + p.waitingTime, 0);

  return {
    algorithm: `Round Robin (RR, Quantum = ${timeQuantum}${rrMode === 'academic' ? ', Academic' : ''})`,
    processes: finishedProcs.sort((a, b) => a.id - b.id),
    gantt,
    trace,
    avgTurnaroundTime: Number((totalTurnaround / inputs.length).toFixed(2)),
    avgWaitingTime: Number((totalWaiting / inputs.length).toFixed(2)),
    maxTime: t,
  };
}

/**
 * 5. PRIORITY SCHEDULING - Non-Preemptive (Low value = High priority)
 */
export function simulatePriorityNonPreemptive(inputs: ProcessInput[]): SimulationResult {
  const processes: ProcessResult[] = [];
  const gantt: GanttBlock[] = [];
  const trace: TraceStep[] = [];

  const uncompleted = cloneInputs(inputs);
  const remainingBursts: Record<number, number> = {};
  inputs.forEach(p => { remainingBursts[p.id] = p.burstTime; });

  let currentTime = 0;

  while (uncompleted.length > 0) {
    const ready = uncompleted.filter(p => p.arrivalTime <= currentTime);

    if (ready.length === 0) {
      const nextArrival = Math.min(...uncompleted.map(p => p.arrivalTime));
      gantt.push({
        type: 'idle',
        startTime: currentTime,
        endTime: nextArrival,
      });

      for (let t = currentTime; t < nextArrival; t++) {
        trace.push({
          time: t,
          readyQueue: [],
          runningProcessId: null,
          explanation: 'CPU idling. Ready queue empty. Next process arrives at ' + nextArrival + 's.',
          remainingBursts: { ...remainingBursts },
        });
      }
      currentTime = nextArrival;
      continue;
    }

    // Sort by Priority (Ascending, so lower is higher priority), and tie break by arrival, then by ID
    ready.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id - b.id;
    });

    const selected = ready[0];
    const index = uncompleted.findIndex(p => p.id === selected.id);
    uncompleted.splice(index, 1);

    const startTime = currentTime;
    const completionTime = startTime + selected.burstTime;
    const turnaroundTime = completionTime - selected.arrivalTime;
    const waitingTime = startTime - selected.arrivalTime;

    processes.push({
      ...selected,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
    });

    gantt.push({
      type: 'process',
      processId: selected.id,
      startTime,
      endTime: completionTime,
    });

    for (let t = startTime; t < completionTime; t++) {
      remainingBursts[selected.id] = completionTime - t;
      const readyQueue = uncompleted
        .filter(up => up.arrivalTime <= t)
        .sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime)
        .map(up => up.id);

      trace.push({
        time: t,
        readyQueue,
        runningProcessId: selected.id,
        explanation: t === startTime
          ? `Priority Scheduler is starting P${selected.id} (Priority: ${selected.priority}). It has the highest priority value (rem: ${selected.burstTime}s).`
          : `Process P${selected.id} continues executing (rem: ${remainingBursts[selected.id]}s).`,
        remainingBursts: { ...remainingBursts },
      });
    }

    currentTime = completionTime;
    remainingBursts[selected.id] = 0;
  }

  const totalTurnaround = processes.reduce((acc, p) => acc + p.turnaroundTime, 0);
  const totalWaiting = processes.reduce((acc, p) => acc + p.waitingTime, 0);
  const maxTime = currentTime;

  trace.push({
    time: maxTime,
    readyQueue: [],
    runningProcessId: null,
    explanation: 'Non-Preemptive Priority execution has finalized successfully.',
    remainingBursts: { ...remainingBursts },
  });

  return {
    algorithm: 'Priority Scheduling (Non-Preemptive)',
    processes: processes.sort((a, b) => a.id - b.id),
    gantt,
    trace,
    avgTurnaroundTime: Number((totalTurnaround / inputs.length).toFixed(2)),
    avgWaitingTime: Number((totalWaiting / inputs.length).toFixed(2)),
    maxTime,
  };
}

/**
 * 6. PRIORITY SCHEDULING - Preemptive (Low value = High priority)
 */
export function simulatePriorityPreemptive(inputs: ProcessInput[]): SimulationResult {
  const processes: { [key: number]: Partial<ProcessResult> & { id: number } } = {};
  inputs.forEach(p => {
    processes[p.id] = {
      ...p,
      startTime: -1,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
    };
  });

  const gantt: GanttBlock[] = [];
  const trace: TraceStep[] = [];

  const remainingBursts: Record<number, number> = {};
  inputs.forEach(p => { remainingBursts[p.id] = p.burstTime; });

  const totalProcessCount = inputs.length;
  let completedCount = 0;
  let t = 0;
  let lastActiveId: number | null = null;
  let blockStartTime = 0;

  while (completedCount < totalProcessCount) {
    const ready = inputs.filter(p => p.arrivalTime <= t && remainingBursts[p.id] > 0);

    if (ready.length === 0) {
      if (lastActiveId !== null) {
        gantt.push({
          type: 'process',
          processId: lastActiveId,
          startTime: blockStartTime,
          endTime: t,
        });
        lastActiveId = null;
      }

      const idleBlockStart = t;
      trace.push({
        time: t,
        readyQueue: [],
        runningProcessId: null,
        explanation: 'Priority scheduler detects no processes. CPU is idling.',
        remainingBursts: { ...remainingBursts },
      });

      t++;
      continue;
    }

    // Sort ready processes by priority (ascending, low is higher priority), tie break by arrival, then by ID
    ready.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id - b.id;
    });

    const currentProcess = ready[0];
    const pid = currentProcess.id;

    if (processes[pid].startTime === -1) {
      processes[pid].startTime = t;
    }

    if (lastActiveId !== pid) {
      if (lastActiveId !== null) {
        gantt.push({
          type: 'process',
          processId: lastActiveId,
          startTime: blockStartTime,
          endTime: t,
        });
      } else {
        const latestClosedTime = gantt.length > 0 ? gantt[gantt.length - 1].endTime : 0;
        if (latestClosedTime < t) {
          gantt.push({
            type: 'idle',
            startTime: latestClosedTime,
            endTime: t,
          });
        }
      }
      blockStartTime = t;
      lastActiveId = pid;
    }

    const readyQueue = ready.filter(p => p.id !== pid).map(p => p.id);
    let expl = `Process P${pid} is executing (Priority: ${currentProcess.priority}, remaining: ${remainingBursts[pid]}s).`;
    if (readyQueue.length > 0) {
      expl += ` P${pid} runs because it has the highest priority value active in the ready queue.`;
    }

    trace.push({
      time: t,
      readyQueue,
      runningProcessId: pid,
      explanation: expl,
      remainingBursts: { ...remainingBursts },
    });

    remainingBursts[pid]--;
    t++;

    if (remainingBursts[pid] === 0) {
      processes[pid].completionTime = t;
      processes[pid].turnaroundTime = t - processes[pid].arrivalTime!;
      processes[pid].waitingTime = processes[pid].turnaroundTime! - processes[pid].burstTime!;
      completedCount++;

      gantt.push({
        type: 'process',
        processId: pid,
        startTime: blockStartTime,
        endTime: t,
      });
      lastActiveId = null;
    }
  }

  trace.push({
    time: t,
    readyQueue: [],
    runningProcessId: null,
    explanation: 'Preemptive Priority Scheduling concludes.',
    remainingBursts: { ...remainingBursts },
  });

  const mergedGantt: GanttBlock[] = [];
  for (const block of gantt) {
    if (block.startTime === block.endTime) continue;
    if (mergedGantt.length > 0) {
      const prev = mergedGantt[mergedGantt.length - 1];
      if (prev.type === block.type && prev.processId === block.processId) {
        prev.endTime = block.endTime;
      } else {
        mergedGantt.push({ ...block });
      }
    } else {
      mergedGantt.push({ ...block });
    }
  }

  const finishedProcs = Object.values(processes) as ProcessResult[];
  const totalTurnaround = finishedProcs.reduce((acc, p) => acc + p.turnaroundTime, 0);
  const totalWaiting = finishedProcs.reduce((acc, p) => acc + p.waitingTime, 0);

  return {
    algorithm: 'Priority Scheduling (Preemptive)',
    processes: finishedProcs.sort((a, b) => a.id - b.id),
    gantt: mergedGantt,
    trace,
    avgTurnaroundTime: Number((totalTurnaround / inputs.length).toFixed(2)),
    avgWaitingTime: Number((totalWaiting / inputs.length).toFixed(2)),
    maxTime: t,
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Cpu, Layers, HelpCircle, GraduationCap, ChevronRight } from 'lucide-react';

interface ConceptDetail {
  title: string;
  whatIsIt: string;
  whyItMatters: string;
  whenUsed: string;
  formulas: { label: string; formula: string }[];
  workedExample: {
    inputs: string[];
    steps: string[];
    finalAnswer: string;
  };
  detailsPractice: {
    q: string;
    ans: string;
  }[];
  realWorld: {
    domain: string;
    example: string;
  }[];
}

const CONCEPTS: Record<string, ConceptDetail> = {
  FCFS: {
    title: "First-Come, First-Served (FCFS)",
    whatIsIt: "FCFS is the simplest scheduling algorithm. The CPU executes processes in the exact chronological order of their arrival, matching a standard FIFO (First-In, First-Out) queue structure. Once a process gets the CPU, it holds it until it completes (it is completely non-preemptive).",
    whyItMatters: "FCFS serves as the foundational baseline of all scheduler theories. While simple to program, it is highly prone to the Convoy Effect. If a long compute-heavy process runs first, smaller I/O-bound processes are blocked waiting behind it, leading to poor CPU and device utilization.",
    whenUsed: "Best utilized in Batch Operating Systems, embedded systems with deterministic workloads, and light print queues where context-switching overhead outweighs compute times.",
    formulas: [
      { label: "Turnaround Time (TAT) Calculation", formula: "$TAT = Completion\\;Time - Arrival\\;Time$" },
      { label: "Waiting Time (WT) Calculation", formula: "$WT = Start\\;Time - Arrival\\;Time$" },
      { label: "Average Waiting Time Ratio", formula: "$Avg\\;WT = \\frac{\\sum WT_i}{n}$" }
    ],
    workedExample: {
      inputs: [
        "P0: Arrival = 0s, Burst = 5s",
        "P1: Arrival = 1s, Burst = 3s"
      ],
      steps: [
        "P0 arrives first at $t=0$, starts immediately, finishes at $t=5$. Turnaround = $5 - 0 = 5$s, Wait = $0$s.",
        "P1 arrives at $t=1$, waits in FIFO queue. Starts execution at $t=5$, finishes at $t=8$. Turnaround = $8 - 1 = 7$s, Wait = $5 - 1 = 4$s.",
        "Average Waiting Time is calculated as: $\\frac{0 + 4}{2} = 2.0$s."
      ],
      finalAnswer: "Avg Turnaround Time = 6.00s | Avg Waiting Time = 2.00s"
    },
    detailsPractice: [
      {
        q: "What is the Convoy Effect and how does FCFS cause it?",
        ans: "The Convoy Effect happens when a single execution-duration intensive process holds up multiple short processes waiting in the FIFO queue. Because FCFS is non-preemptive, those fast processes remain starved, inflating the overall average waiting times and leaving resources underutilized."
      },
      {
        q: "Assume three processes: P1 (Arrival=0, Burst=24), P2 (Arrival=0, Burst=3), P3 (Arrival=0, Burst=3). Compare FCFS Average Waiting times if scheduled as [P1, P2, P3] vs [P2, P3, P1].",
        ans: "Order [P1, P2, P3]: P1 starts at 0, P2 starts at 24, P3 starts at 27. Avg WT = $\\frac{0 + 24 + 27}{3} = 17$s. Order [P2, P3, P1]: P2 starts at 0, P3 starts at 3, P1 starts at 6. Avg WT = $\\frac{0 + 3 + 6}{3} = 3$s. This displays how execution sequence affects performance dramatically!"
      }
    ],
    realWorld: [
      { domain: "Banking Transactions", example: "Lightweight ATM transaction requests are processed chronologically in the order that PIN submissions are validated." },
      { domain: "Medical Triage Logs", example: "First-come medical triage desks register administrative details prior to patient distribution." }
    ]
  },
  SJF: {
    title: "Shortest Job First (SJF)",
    whatIsIt: "SJF is a non-preemptive scheduling policy that associates each process with its next CPU burst duration. When the CPU becomes free, the scheduler selects the waiting process with the smallest remaining burst requirement to run.",
    whyItMatters: "SJF is provably optimal. It guarantees the absolute minimum average waiting time for any given set of stationary processes. However, it is mathematically difficult to implement in real general-purpose OS because predicting the exact duration of a future CPU burst is impossible.",
    whenUsed: "Often used in long-term batch queue schedulers (e.g. cloud supercomputer grids) where jobs declare estimated compute limits upon submission.",
    formulas: [
      { label: "Provable Optimality theorem", formula: "$Avg\\;WT_{SJF} \\le Avg\\;WT_{any\\;other}$" },
      { label: "Next CPU Burst Estimation (Exponential Smoothing)", formula: "$\\tau_{n+1} = \\alpha t_n + (1 - \\alpha) \\tau_n$" }
    ],
    workedExample: {
      inputs: [
        "P1: Arrival = 0s, Burst = 6s",
        "P2: Arrival = 2s, Burst = 2s",
        "P3: Arrival = 3s, Burst = 3s"
      ],
      steps: [
        "At $t=0$, only P1 has arrived. Start P1 immediately. It runs non-preemptively from $t=0$ to $6$.",
        "During this interval, P2 (at $t=2$) and P3 (at $t=3$) arrive. They wait in queue.",
        "At $t=6$, P1 finishes. We choose between P2 (burst=2) and P3 (burst=3). P2 is shorter, so it runs next from $t=6$ to $8$.",
        "At $t=8$, P3 executes from $t=8$ to $11$.",
        "Calculate Waiting Times: P1 = $0$, P2 = $6 - 2 = 4$s, P3 = $8 - 3 = 5$s."
      ],
      finalAnswer: "Avg Waiting Time = $\\frac{0 + 4 + 5}{3} = 3.00$s"
    },
    detailsPractice: [
      {
        q: "What is the biggest challenge of SJF, and how does the OS solve it?",
        ans: "The primary challenge is knowing the CPU burst length *before* execution. Modern Operating Systems approximate this value under virtual execution environments by tracking history using the Exponential Smoothing formula: $\\tau_{n+1} = \\alpha t_n + (1 - \\alpha)\\tau_n$."
      },
      {
        q: "Can Starvation occur under non-preemptive SJF?",
        ans: "Yes. If there is a steady stream of incoming short processes, longer processes may wait in the ready queue indefinitely, suffering from Starvation or Livelock."
      }
    ],
    realWorld: [
      { domain: "Research Simulators", example: "University compute clusters scheduling micro-simulations ahead of multi-day climate modeling jobs." },
      { domain: "Retail Checkout Lanes", example: "A store manager directing customers with 1-2 items to go ahead of heavy cart orders to increase rapid throughput." }
    ]
  },
  SRTF: {
    title: "Shortest Remaining Time First (SRTF)",
    whatIsIt: "SRTF is the preemptive version of SJF. When a new process arrives in the Ready Queue, its total burst time is compared against the remaining burst time of the currently executing process. If the counter of the newcomer is shorter, the active process is preempted and context-switched out.",
    whyItMatters: "SRTF is highly responsive, guaranteeing shorter average waiting times than non-preemptive SJF because newly arrived fast tasks don't get trapped behind lingering heavy tasks.",
    whenUsed: "Interactive systems with mixed workloads, where the operating system can preempt threads easily like web or graphic execution cores.",
    formulas: [
      { label: "Preemption Condition", formula: "$Remaining\\;Burst_{New} < Remaining\\;Burst_{Active}$" },
      { label: "Response Time (RT)", formula: "$RT = First\\;Start\\;Time - Arrival\\;Time$" }
    ],
    workedExample: {
      inputs: [
        "P1: Arrival = 0s, Burst = 8s",
        "P2: Arrival = 1s, Burst = 4s"
      ],
      steps: [
        "P1 starts running at $t=0$.",
        "At $t=1$, P2 arrives with burst = 4. P1's remaining burst is $8 - 1 = 7$.",
        "Because P2's burst (4) is shorter than P1's remaining (7), P1 is preempted immediately and P2 gets the CPU.",
        "P2 runs to completion from $t=1$ to $5$.",
        "At $t=5$, P1 resumes execution, running for its remaining 7s to finish at $t=12$."
      ],
      finalAnswer: "Completion Time: P2 = 5s, P1 = 12s | Avg waiting time = 2.0s"
    },
    detailsPractice: [
      {
        q: "How does SRTF affect the context switching overhead of a system?",
        ans: "SRTF triggers significantly more context switches than FCFS or SJF because arriving processes can constantly interrupt the CPU. Each switch drains system cycles to store state in Process Control Blocks (PCBs)."
      }
    ],
    realWorld: [
      { domain: "Healthcare Systems", example: "Emergency triage centers where high-severity traumas immediately bump standard care patients out of active treatment beds." },
      { domain: "Web Servers", example: "Handling micro-API heartbeats ahead of heavy multi-gigabyte media asset uploads." }
    ]
  },
  RR: {
    title: "Round Robin (RR)",
    whatIsIt: "Round Robin is specifically designed for time-sharing systems. The scheduler cycles through a circular Ready Queue, granting each process a tiny, fixed slice of CPU execution duration known as a Time Quantum (or Time Slice). When the quantum expires, the process is preempted and sent to the back of the queue.",
    whyItMatters: "Round Robin is highly fair and provides excellent Response Times. No process can starve because everyone gets a turn within a guaranteed scheduling cycle. However, its efficiency is heavily dependent on the chosen Time Quantum.",
    whenUsed: "Standard default scheduling foundation for desktop computing, server virtualization cores, and interactive terminals.",
    formulas: [
      { label: "Time Quantum Constraint (High limit)", formula: "$Quantum \\to \\infty \\implies RR \\to FCFS$" },
      { label: "Frictional Boundary (Low limit)", formula: "$Quantum \\to 0 \\implies Overhead \\to 100\\%$" }
    ],
    workedExample: {
      inputs: [
        "P1: Arrival = 0s, Burst = 5s",
        "P2: Arrival = 0s, Burst = 3s",
        "Time Quantum = 2s"
      ],
      steps: [
        "Ready Queue: [P1, P2]. P1 runs for quantum slice of 2s, finishing at $t=2$ (burst left = 3). Sent to back.",
        "Ready Queue: [P2, P1]. P2 runs for 2s, finishing at $t=4$ (burst left = 1). Sent to back.",
        "Ready Queue: [P1, P2]. P1 runs for 2s, finishing at $t=6$ (burst left = 1). Sent to back.",
        "Ready Queue: [P2, P1]. P2 runs for its remaining 1s, finishing at $t=7$ (completes completely).",
        "P1 runs its remaining 1s, completing at $t=8$."
      ],
      finalAnswer: "Perfect circular sharing. Avg WT = 3.5s"
    },
    detailsPractice: [
      {
        q: "What is the impact of choosing an extremely small vs extremely large Time Quantum?",
        ans: "An excessively large quantum turns RR into pure FCFS. An excessively small quantum creates high context-switching CPU overhead, where the microprocessor spends more time saving registers than doing actual application work."
      }
    ],
    realWorld: [
      { domain: "Virtualization hypervisors", example: "Allocating CPU cores to multiple guest virtual machines in equal time-slices." },
      { domain: "Broadband Routers", example: "Cycling through multiple network streams so that individual users experiences fluid browsing latency." }
    ]
  }
};

export default function ConceptAcademy() {
  const [activeTab, setActiveTab] = useState<string>('FCFS');

  const curr = CONCEPTS[activeTab] || CONCEPTS.FCFS;

  // Let MathJax parse the text when active tab changes
  useEffect(() => {
    const win = window as any;
    if (win.MathJax && win.winMathJax !== undefined && win.MathJax.typeset) {
      // guard
    }
    if (win.MathJax && win.MathJax.typeset) {
      setTimeout(() => {
        try {
          win.MathJax.typeset();
        } catch (e) {
          console.error("MathJax typesetting error", e);
        }
      }, 100);
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-slate-950/70 p-1.5 rounded-xl border border-white/5 overflow-x-auto gap-1">
        {Object.keys(CONCEPTS).map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 text-xs md:text-sm font-display font-medium px-4 py-2 rounded-lg transition duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            {CONCEPTS[key].title.split('(')[0]}
          </button>
        ))}
      </div>

      {/* Main Content Pane */}
      <div className="glass-panel border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <span className="text-xs bg-indigo-950/40 text-indigo-400 font-mono tracking-widest uppercase border border-indigo-500/20 px-3 py-1 rounded-full">
            Concept Education Card
          </span>
          <h2 className="font-display font-bold text-2xl text-gray-100 mt-2.5 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" /> {curr.title}
          </h2>
        </div>

        {/* What / Why / When Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-950/30 p-5 rounded-xl border border-white/5 space-y-2">
            <h3 className="font-display font-semibold text-gray-200 text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> What is it?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              {curr.whatIsIt}
            </p>
          </div>

          <div className="bg-slate-950/30 p-5 rounded-xl border border-white/5 space-y-2">
            <h3 className="font-display font-semibold text-gray-200 text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Layers className="w-4 h-4 text-teal-400" /> Why it matters?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              {curr.whyItMatters}
            </p>
          </div>

          <div className="bg-slate-950/30 p-5 rounded-xl border border-white/5 space-y-2">
            <h3 className="font-display font-semibold text-gray-200 text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
              <GraduationCap className="w-4 h-4 text-purple-400" /> When is it used?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              {curr.whenUsed}
            </p>
          </div>
        </div>

        {/* Formulas and Math Block */}
        <div className="bg-slate-950/50 rounded-xl border border-white/5 p-5 md:p-6 space-y-4">
          <h3 className="font-display font-semibold text-sm text-indigo-400 flex items-center gap-1.5 pb-2 border-b border-white/5">
            🧮 Offline Math &amp; Mathematical Formulary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {curr.formulas.map((frm, idx) => (
              <div key={idx} className="bg-slate-950/80 p-3.5 rounded-lg border border-white/5 max-w-full overflow-x-auto">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">{frm.label}</p>
                <div className="text-sm font-mono text-indigo-300 py-1 select-all select-none">
                  {frm.formula}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step-By-Step Worked Example */}
        <div className="border border-white/5 rounded-xl bg-slate-950/20 overflow-hidden">
          <div className="bg-slate-900/60 p-4 border-b border-white/5">
            <h3 className="font-display font-semibold text-sm text-gray-200">
              ✍️ Classroom Worked Example
            </h3>
          </div>
          <div className="p-5 md:p-6 space-y-4">
            <div>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Theoretical Inputs</p>
              <div className="flex flex-wrap gap-2">
                {curr.workedExample.inputs.map((inp, idx) => (
                  <span key={idx} className="bg-slate-900 border border-white/5 text-gray-300 font-mono text-xs px-3 py-1 rounded">
                    {inp}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Step-by-Step Analytical Log</p>
              <ol className="list-decimal pl-5 text-xs text-gray-400 space-y-2 font-mono">
                {curr.workedExample.steps.map((st, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {st}
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-3 border-t border-white/5">
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Final Outcome</p>
              <div className="text-xs bg-indigo-950/30 text-indigo-300 border border-indigo-500/20 p-3 rounded-lg font-mono inline-block">
                {curr.workedExample.finalAnswer}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive accordion questions for validation */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm text-gray-200">
            🙋 Concept Self-Check Questions
          </h3>
          <div className="space-y-2">
            {curr.detailsPractice.map((dp, idx) => (
              <details
                key={idx}
                className="group border border-white/5 bg-slate-950/40 rounded-xl transition duration-150 overflow-hidden"
              >
                <summary className="p-4 list-none text-xs md:text-sm font-sans font-medium text-gray-300 cursor-pointer flex items-center justify-between hover:bg-slate-900/40 select-none">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    {dp.q}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-open:rotate-90 transition duration-150" />
                </summary>
                <div className="p-4 border-t border-white/5 bg-slate-950/60 text-xs text-gray-400 leading-relaxed font-mono">
                  {dp.ans}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Real World Applications block */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm text-gray-200">
            🌐 Real-world Scheduling Scenarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {curr.realWorld.map((rw, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950/50 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {rw.domain}
                </span>
                <p className="text-xs text-gray-300 font-sans leading-relaxed pt-1.5">
                  {rw.example}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

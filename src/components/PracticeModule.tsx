/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PRACTICE_QUESTIONS } from '../practiceData';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, ArrowRight, Award } from 'lucide-react';

export default function PracticeModule() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState<Record<number, { chosen: number; isCorrect: boolean }>>({});

  const activeQuestion = PRACTICE_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOpt(idx);
  };

  const handleSubmit = () => {
    if (selectedOpt === null || isSubmitted) return;
    
    const isCorrect = selectedOpt === activeQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: { chosen: selectedOpt, isCorrect }
    }));

    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentIdx < PRACTICE_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsSubmitted(false);
    } else {
      setShowSummary(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsSubmitted(false);
    setScore(0);
    setShowSummary(false);
    setAnswers({});
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/5 p-6 md:p-8 space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="font-display font-semibold text-xl text-accent flex items-center gap-2">
            <HelpCircle className="w-5 h-5" /> CPU Scheduler Practice Lab
          </h2>
          <p className="text-sm text-gray-400">
            Check your analytical Operating Systems skills by solving scheduling puzzles.
          </p>
        </div>
        {!showSummary && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-800 text-gray-300 font-mono px-2.5 py-1 rounded-full">
              Question {currentIdx + 1} of {PRACTICE_QUESTIONS.length}
            </span>
            <span className="text-xs bg-indigo-950/40 text-indigo-400 font-mono px-2.5 py-1 rounded-full border border-indigo-500/25">
              Score: {score}/{PRACTICE_QUESTIONS.length}
            </span>
          </div>
        )}
      </div>

      {showSummary ? (
        /* Quiz Summary Screen */
        <div className="py-8 text-center max-w-lg mx-auto space-y-6">
          <div className="inline-flex p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Award className="w-12 h-12" />
          </div>
          <h3 className="font-display font-bold text-2xl text-gray-100">Lab Practice Concluded!</h3>
          <p className="text-gray-300 leading-relaxed md:text-base">
            You successfully solved <strong className="text-indigo-400">{score}</strong> out of <strong className="text-gray-100">{PRACTICE_QUESTIONS.length}</strong> operational scheduling challenges.
          </p>

          <div className="bg-slate-950/40 rounded-xl border border-white/5 p-4 space-y-3 divide-y divide-white/5 text-left font-mono text-xs">
            {PRACTICE_QUESTIONS.map((q, idx) => {
              const res = answers[q.id];
              return (
                <div key={q.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-200">
                      {idx + 1}. {q.scenario} ({q.algorithm})
                    </p>
                    <p className="text-gray-400 mt-1">
                      Your choice: {q.options[res?.chosen ?? 0]}
                    </p>
                  </div>
                  <div>
                    {res?.isCorrect ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold px-6 py-3 rounded-xl transition duration-250 font-sans cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <RotateCcw className="w-4 h-4" /> Restart Practice Quiz
          </button>
        </div>
      ) : (
        /* Active Question Display */
        <div className="space-y-6">
          <div className="bg-slate-950/30 border border-white/5 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 font-mono tracking-widest uppercase">
                Scenario: {activeQuestion.scenario}
              </span>
              <span className="text-xs font-mono text-gray-400">
                Algorithm: {activeQuestion.algorithm} 
                {activeQuestion.timeQuantum && ` (Q = ${activeQuestion.timeQuantum})`}
              </span>
            </div>

            {/* Input processes table for reference */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border border-white/5">
                <thead className="bg-slate-900 text-gray-300">
                  <tr>
                    <th className="p-2 border-b border-white/5">Process ID</th>
                    <th className="p-2 border-b border-white/5">Arrival Time</th>
                    <th className="p-2 border-b border-white/5">Burst Time</th>
                    {activeQuestion.processes[0].priority !== undefined && (
                      <th className="p-2 border-b border-white/5">Priority</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-400">
                  {activeQuestion.processes.map(proc => (
                    <tr key={proc.id} className="hover:bg-white/5">
                      <td className="p-2 font-semibold text-gray-300">P{proc.id}</td>
                      <td className="p-2">{proc.arrivalTime}s</td>
                      <td className="p-2">{proc.burstTime}s</td>
                      {proc.priority !== undefined && <td className="p-2">{proc.priority}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-gray-100 font-medium md:text-base leading-relaxed mt-2 pt-2 border-t border-white/5">
              {activeQuestion.question}
            </p>
          </div>

          {/* Solution Alternatives */}
          <div className="grid grid-cols-1 gap-3">
            {activeQuestion.options.map((option, idx) => {
              const isSelected = selectedOpt === idx;
              let btnClass = "border-white/5 bg-slate-900/40 text-gray-300 hover:bg-slate-900/80 hover:border-white/20";
              
              if (isSelected) {
                btnClass = "border-indigo-500/50 bg-indigo-500/10 text-indigo-300";
              }

              if (isSubmitted) {
                if (idx === activeQuestion.correctIndex) {
                  btnClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                } else if (isSelected) {
                  btnClass = "border-red-500/50 bg-red-500/10 text-red-300";
                } else {
                  btnClass = "border-white/5 bg-slate-950/20 text-gray-500 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-4 rounded-xl border ${btnClass} transition duration-200 flex items-center justify-between font-mono text-xs cursor-pointer`}
                >
                  <span>{option}</span>
                  {isSubmitted && idx === activeQuestion.correctIndex && (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Correct Answer
                    </span>
                  )}
                  {isSubmitted && isSelected && idx !== activeQuestion.correctIndex && (
                    <span className="text-red-400 flex items-center gap-1 font-semibold text-[10px] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      <XCircle className="w-3 h-3" /> Incorrect
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              {selectedOpt === null && !isSubmitted && (
                <p className="text-xs text-gray-500">Select an alternative to continue.</p>
              )}
            </div>
            
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOpt === null}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-semibold px-5 py-2.5 rounded-xl text-xs transition duration-200 cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition duration-200 flex items-center gap-1 cursor-pointer"
              >
                {currentIdx < PRACTICE_QUESTIONS.length - 1 ? 'Next Challenge' : 'Finish Lab'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Deep-Dive LaTeX Solution Explanation (Reveals after submit) */}
          {isSubmitted && (
            <div className="bg-slate-950/60 rounded-xl border border-white/5 p-4 space-y-2 animate-fade-in">
              <h4 className="font-display font-medium text-xs text-indigo-400 uppercase tracking-wider">
                🔬 Detailed Worked Solution
              </h4>
              <div className="text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">
                {activeQuestion.explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

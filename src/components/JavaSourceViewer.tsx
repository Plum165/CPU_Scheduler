/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JAVA_SOURCE_CODE } from '../originalJavaSource';
import { Code2, Download, Check, Copy } from 'lucide-react';

export default function JavaSourceViewer() {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JAVA_SOURCE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JAVA_SOURCE_CODE], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CPUScheduler.java';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-gray-200 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-500" /> Original Java Source (Legacy)
          </h3>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Compare the console Java Apache POI FCFS implementation against the modernized interactive web system.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-gray-300 border border-white/5 text-xs px-3 py-2 rounded-lg transition duration-150 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" /> Copy Code
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg transition duration-200 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <Download className="w-3.5 h-3.5" /> Download `.java` Source
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="relative bg-slate-950/80 rounded-xl overflow-hidden border border-white/5 p-4 max-h-96 overflow-y-auto font-mono text-xs text-amber-100/90 leading-relaxed scrollbar">
        <pre className="whitespace-pre overflow-x-auto select-all">
          {JAVA_SOURCE_CODE}
        </pre>
      </div>

      <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 text-xs text-gray-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <p className="font-sans leading-relaxed">
          * Note: The original Java Code utilizes <strong>Apache POI</strong> libraries to output high-fidelity styled Excel Sheets under custom solid cell formatting.
        </p>
        <span className="font-mono text-[10px] bg-slate-800 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded">
          Class: CPUScheduler
        </span>
      </div>
    </div>
  );
}

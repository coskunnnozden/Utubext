
import React, { useState } from 'react';
import { AnalysisResult } from '../types';

interface Props {
  result: AnalysisResult;
}

const ScriptSection: React.FC<Props> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.fullScriptPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Titles */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-inner">
        <h3 className="text-[11px] font-black text-red-500 mb-3 flex items-center uppercase tracking-widest">
          <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Viral UK Titles (CTR Optimized)
        </h3>
        <ul className="space-y-2">
          {result.suggestedTitles.map((title, i) => (
            <li key={i} className="flex items-start group">
              <span className="text-red-500/50 font-bold text-[10px] mr-2 mt-0.5">{i+1}.</span>
              <p className="text-slate-300 text-[11px] font-medium leading-snug group-hover:text-white transition-colors cursor-default">{title}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Hooks */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <h3 className="text-[11px] font-black text-blue-400 mb-3 flex items-center uppercase tracking-widest">
          <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          Audience Retention Hooks
        </h3>
        <div className="space-y-2">
          {result.viralHooks.map((hook, i) => (
            <div key={i} className="bg-slate-950/50 p-2.5 rounded-lg border-l-2 border-blue-500 text-slate-400 italic text-[10px] leading-relaxed">
              "{hook}"
            </div>
          ))}
        </div>
      </div>

      {/* Main Prompt */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-slate-800/50 p-3 flex justify-between items-center border-b border-indigo-500/10">
          <h3 className="text-[10px] font-black text-white flex items-center tracking-widest">
            <span className="bg-indigo-600 text-[8px] px-1.5 py-0.5 rounded mr-2 uppercase">Sub-Agent</span>
            SCRIPT ARCHITECTURE
          </h3>
          <button 
            onClick={copyToClipboard}
            className={`flex items-center px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95'}`}
          >
            {copied ? 'COPIED' : 'COPY PROMPT'}
          </button>
        </div>
        <div className="p-3 bg-slate-950/50 max-h-48 overflow-y-auto font-mono text-[10px] text-indigo-200/80 leading-relaxed whitespace-pre-wrap scrollbar-thin">
          {result.fullScriptPrompt}
        </div>
      </div>

      {/* Cloud Grounding Sources */}
      {result.sources.length > 0 && (
        <div className="pt-4 px-1">
          <div className="flex items-center space-x-2 mb-3">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
             <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verified Cloud Sources</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {result.sources.map((src, i) => (
              <a 
                key={i} 
                href={src.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-900/50 hover:bg-indigo-950/20 border border-slate-800 p-2 rounded-lg transition-all flex flex-col group"
              >
                <span className="text-indigo-400 text-[9px] font-bold group-hover:text-indigo-300 truncate">{src.title}</span>
                <span className="text-[7px] text-slate-600 truncate mt-0.5">{src.uri}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptSection;

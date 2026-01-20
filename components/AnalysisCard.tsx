
import React from 'react';
import { AnalysisResult } from '../types';

interface Props {
  result: AnalysisResult;
}

const AnalysisCard: React.FC<Props> = ({ result }) => {
  const isSweetSpot = result.trendScore >= 70 && result.competitionLevel === 'Düşük';
  
  const getScoreColor = (score: number) => {
    if (score > 75) return 'text-emerald-400';
    if (score > 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {isSweetSpot && (
        <div className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] py-1.5 rounded-lg text-center shadow-lg shadow-amber-500/20">
          💎 High-Yield Opportunity Detected
        </div>
      )}
      
      <div className="flex gap-3">
        <div className="flex-1 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Momentum</h3>
          <div className={`text-3xl font-black ${getScoreColor(result.trendScore)}`}>
            %{result.trendScore}
          </div>
        </div>

        <div className="flex-1 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-sm">
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Saturation</h3>
          <div className={`text-xl font-black uppercase tracking-tighter ${result.competitionLevel === 'Düşük' ? 'text-green-400' : 'text-slate-200'}`}>
            {result.competitionLevel}
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${result.competitionLevel === 'Düşük' ? 'w-1/3 bg-green-500' : result.competitionLevel === 'Orta' ? 'w-2/3 bg-amber-500' : 'w-full bg-rose-500'}`}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-sm">
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Arbitrage Keywords</h3>
        <div className="flex flex-wrap gap-1.5">
          {result.topKeywords.map((kw, i) => (
            <span key={i} className="bg-slate-950 text-indigo-300 px-2 py-1 rounded text-[9px] font-black border border-indigo-900/30 uppercase tracking-tight">
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;

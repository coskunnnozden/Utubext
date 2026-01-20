
import React, { useState, useEffect } from 'react';
import { analyzeYouTubeTrend } from './services/geminiService';
import { saveAnalysis, getRecentAnalyses } from './services/storageService';
import { AnalysisResult, LoadingState } from './types';
import AnalysisCard from './components/AnalysisCard';
import ScriptSection from './components/ScriptSection';

const isExtension = typeof chrome !== 'undefined' && chrome.tabs !== undefined;
type FilterType = 'all' | 'high-trend' | 'low-comp' | 'sweet-spot' | 'custom';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [videoMetadata, setVideoMetadata] = useState<any>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Gelişmiş Filtre Durumları
  const [minTrendScore, setMinTrendScore] = useState<number>(0);
  const [targetComp, setTargetComp] = useState<string>('all');
  
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle', message: '' });

  useEffect(() => {
    if (isExtension) fetchDeepMetadata();
    fetchHistory();
  }, []);

  const fetchDeepMetadata = () => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        const activeTab = tabs[0];
        if (activeTab?.url?.includes('youtube.com/watch')) {
          chrome.tabs.sendMessage(activeTab.id, { type: 'GET_VIDEO_METADATA' }, (response: any) => {
            if (response && response.success) {
              setVideoMetadata(response);
              setTopic(response.title);
            }
          });
        }
      });
    } catch (e) { console.warn("utubext: Extension API access limited."); }
  };

  const fetchHistory = async () => {
    const pastAnalyses = await getRecentAnalyses(40);
    setHistory(pastAnalyses);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading({ status: 'searching', message: 'utubext Cloud Engine: Analiz yapılıyor...' });
    setResult(null);

    try {
      const enrichedTopic = videoMetadata 
        ? `Video: ${videoMetadata.title}. Hedeflenen Filtreler -> Trend: %${minTrendScore}, Rekabet: ${targetComp}.`
        : `Konu: ${topic}. Filtreler: Trend > ${minTrendScore}, Rekabet: ${targetComp}.`;

      const data = await analyzeYouTubeTrend(enrichedTopic);
      setLoading({ status: 'completed', message: '' });
      setResult(data);
      
      await saveAnalysis(data);
      fetchHistory();
    } catch (err: any) {
      setLoading({ status: 'error', message: err.message || 'Analiz başarısız.' });
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesTrend = item.trendScore >= minTrendScore;
    const matchesComp = targetComp === 'all' || item.competitionLevel === targetComp;
    
    // Preset butonları aktifse onlara göre filtrele
    if (filter === 'high-trend') return item.trendScore >= 75;
    if (filter === 'low-comp') return item.competitionLevel === 'Düşük';
    if (filter === 'sweet-spot') return item.trendScore >= 70 && item.competitionLevel === 'Düşük';
    
    return matchesTrend && matchesComp;
  });

  return (
    <div className={`bg-slate-950 ${isExtension ? 'w-[450px] max-h-[600px]' : 'min-h-screen w-full'} overflow-y-auto overflow-x-hidden flex flex-col font-sans border-x border-slate-800 shadow-2xl mx-auto`}>
      {/* Üst Durum Çubuğu */}
      <div className="bg-indigo-600 text-[9px] text-white font-black px-4 py-1.5 flex justify-between items-center tracking-widest uppercase shrink-0">
        <div className="flex items-center space-x-2">
           <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
           <span>ENGINE: ONLINE</span>
        </div>
        <span>v2.9.0 FILTERS ACTIVE</span>
      </div>

      <header className="bg-slate-900/95 backdrop-blur-md border-b border-indigo-500/20 sticky top-0 z-50 p-5 shadow-xl shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-black tracking-tighter text-white italic">UTUBE<span className="text-indigo-500 not-italic font-light">EXT</span></h1>
          </div>
          {isExtension && videoMetadata && (
            <div className="bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[8px] font-black text-red-500 uppercase animate-pulse">
              Live Detect
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Arama Barı */}
          <form onSubmit={handleSearch} className="flex shadow-2xl rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50 focus-within:border-indigo-500/50 transition-all">
            <input 
              type="text" 
              placeholder="Konu veya anahtar kelime..."
              className="w-full bg-transparent text-white text-xs px-4 py-3 focus:outline-none placeholder:text-slate-600 font-medium"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading.status === 'searching'}
            />
            <button 
              type="submit"
              disabled={loading.status === 'searching' || !topic.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white px-5 py-3 font-black text-[10px] uppercase tracking-widest transition-colors"
            >
              TARAMA
            </button>
          </form>

          {/* Dinamik Filtre Paneli */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-2.5 flex flex-col">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Min Trend</label>
                <span className="text-[10px] font-black text-indigo-400">%{minTrendScore}</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={minTrendScore}
                onChange={(e) => { setMinTrendScore(Number(e.target.value)); setFilter('custom'); }}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-2.5 flex flex-col relative">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1">Rekabet Limiti</label>
              <select 
                value={targetComp}
                onChange={(e) => { setTargetComp(e.target.value); setFilter('custom'); }}
                className="bg-transparent text-indigo-400 text-[11px] font-black focus:outline-none appearance-none cursor-pointer pr-4"
              >
                <option value="all" className="bg-slate-900">Hepsi</option>
                <option value="Düşük" className="bg-slate-900">Düşük</option>
                <option value="Orta" className="bg-slate-900">Orta</option>
                <option value="Yüksek" className="bg-slate-900">Yüksek</option>
              </select>
              <div className="absolute right-2.5 bottom-2.5 pointer-events-none text-slate-600">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5">
        {loading.status === 'searching' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] animate-pulse">Pazar Analizi Yapılıyor...</p>
          </div>
        )}

        {result ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="mb-6 bg-slate-900/80 border border-indigo-500/20 p-5 rounded-2xl backdrop-blur-sm">
              <h2 className="text-lg font-black text-white mb-2 leading-tight">{result.title}</h2>
              <p className="text-slate-400 text-[11px] leading-relaxed font-medium">{result.summary}</p>
            </div>
            <div className="space-y-6">
              <AnalysisCard result={result} />
              <ScriptSection result={result} />
            </div>
            <button 
              onClick={() => setResult(null)} 
              className="mt-8 w-full py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-800 rounded-xl hover:bg-slate-900 transition-all"
            >
              ← KASAYA DÖN
            </button>
          </div>
        ) : loading.status === 'idle' && history.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-2">
               <h3 className="text-slate-500 uppercase tracking-[0.2em] font-black text-[9px]">Analiz Geçmişi</h3>
               <div className="h-px flex-1 bg-slate-900"></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredHistory.map((item) => {
                const isSweetSpot = item.trendScore >= 70 && item.competitionLevel === 'Düşük';
                return (
                  <button 
                    key={item.id}
                    onClick={() => {setResult(item); window.scrollTo({top:0, behavior:'smooth'});}}
                    className={`group relative w-full bg-slate-900/40 border p-4 rounded-2xl text-left transition-all flex justify-between items-center ${
                      isSweetSpot ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500' : 'border-slate-800/50 hover:border-indigo-500/40 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-slate-200 text-sm font-bold truncate group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </h4>
                        {isSweetSpot && <span className="text-amber-500 animate-pulse text-xs">💎</span>}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${item.competitionLevel === 'Düşük' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {item.competitionLevel} Rekabet
                        </span>
                        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">
                          Trend: %{item.trendScore}
                        </span>
                      </div>
                    </div>
                    <div className={`font-black text-xs px-2.5 py-1.5 rounded-xl border ${isSweetSpot ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                      %{item.trendScore}
                    </div>
                  </button>
                );
              })}
              {filteredHistory.length === 0 && (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl opacity-50">
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Filtrelere uygun veri yok</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 border-t border-slate-900 text-center opacity-30 select-none">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">utubext opportunity architect</p>
      </footer>
    </div>
  );
};

export default App;

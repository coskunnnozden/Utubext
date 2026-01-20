
export interface AnalysisResult {
  id?: string;
  timestamp?: any;
  title: string;
  summary: string;
  trendScore: number;
  competitionLevel: 'Düşük' | 'Orta' | 'Yüksek';
  topKeywords: string[];
  viralHooks: string[];
  suggestedTitles: string[];
  fullScriptPrompt: string;
  sources: { title: string; uri: string }[];
}

export interface LoadingState {
  status: 'idle' | 'searching' | 'analyzing' | 'generating' | 'completed' | 'error';
  message: string;
}

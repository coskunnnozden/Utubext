
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeYouTubeTrend(topic: string): Promise<AnalysisResult> {
  const modelName = 'gemini-3-flash-preview';
  
  // Phase 1: Derin Rekabet ve Trend Analizi
  const searchPrompt = `Search for: "${topic}". 
  Specific Focus: Identify if this topic has high search demand but low high-quality video supply on YouTube UK. 
  Extract: Weekly trend momentum, keyword difficulty for new channels, and specific UK income gaps (e.g. side hustles for cost of living).`;

  const researchResponse = await ai.models.generateContent({
    model: modelName,
    contents: searchPrompt,
    config: { tools: [{ googleSearch: {} }] },
  });

  const sources = researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((chunk: any) => chunk.web)
    ?.map((chunk: any) => ({
      title: chunk.web.title || "Source",
      uri: chunk.web.uri,
    })) || [];

  const systemInstruction = `# ROLE: utubext Arbitrage Finder (UK Market)

## 1. OPPORTUNITY METRICS
Your primary goal is to find "SWEET SPOTS": Topics with TrendScore > 70 and CompetitionLevel = "Düşük".
- TrendScore: Based on search velocity and social media mentions in the UK.
- CompetitionLevel: Based on how many big UK creators (1M+ subs) have covered this in the last 30 days.

## 2. OUTPUT SCHEMA (JSON)
Return ONLY valid JSON:
{
  "title": "CTR Optimized UK Title",
  "summary": "Why this is an arbitrage opportunity or why it's high risk",
  "trendScore": 0-100,
  "competitionLevel": "Düşük" | "Orta" | "Yüksek",
  "topKeywords": ["UK-Specific Keyword", "Passive Income Tag"],
  "viralHooks": ["Psychological Hook 1", "Pattern Interrupt 2"],
  "suggestedTitles": ["CTR Title 1", "CTR Title 2", "CTR Title 3"],
  "fullScriptPrompt": "Step-by-step retention-optimized script prompt"
}`;

  const finalResponse = await ai.models.generateContent({
    model: modelName,
    contents: `Apply Arbitrage Logic to: "${topic}". Search Data: ${researchResponse.text}`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
    },
  });

  try {
    const data = JSON.parse(finalResponse.text || '{}');
    return {
      ...data,
      sources: sources.slice(0, 6),
    };
  } catch (e) {
    throw new Error("AI Analiz Motoru Hatası.");
  }
}

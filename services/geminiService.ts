import { GoogleGenAI, Type } from "@google/genai";
import { TradeSetup, Candle, Timeframe } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeMarketStructure = async (
  timeframe: Timeframe, 
  data: Candle[]
): Promise<TradeSetup | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  // Take the last 30 candles to save context
  const recentData = data.slice(-30).map(c => ({
    time: c.time,
    open: c.open.toFixed(2),
    high: c.high.toFixed(2),
    low: c.low.toFixed(2),
    close: c.close.toFixed(2)
  }));

  const prompt = `
    Analyze the following recent OHLC market data for a ${timeframe} timeframe.
    The data is an array of objects with time, open, high, low, close.
    
    Data: ${JSON.stringify(recentData)}
    
    As a professional senior technical analyst, provide a detailed trade setup report.
    1. Identify the Bias (Bullish/Bearish/Neutral).
    2. Define the Market Condition (e.g., Uptrend Pullback, Range Bound).
    3. Identify key Entry Zone.
    4. Provide specific Entry Advice (e.g., "Wait for 15m candle close above...", "Limit order at...").
    5. Set Targets and Invalidation.
    6. Estimate Risk/Reward Ratio (e.g., "1:3").
    7. Assign a Confidence Score (0-100) based on confluence.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bias: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral'] },
            condition: { type: Type.STRING },
            entryZone: { type: Type.STRING },
            targets: { type: Type.ARRAY, items: { type: Type.STRING } },
            invalidation: { type: Type.STRING },
            summary: { type: Type.STRING },
            entryAdvice: { type: Type.STRING, description: "Actionable advice on how to enter the trade" },
            riskRewardRatio: { type: Type.STRING, description: "e.g. 1:3" },
            confidenceScore: { type: Type.NUMBER, description: "0-100" }
          },
          required: ['bias', 'condition', 'entryZone', 'targets', 'invalidation', 'summary', 'entryAdvice', 'riskRewardRatio', 'confidenceScore']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as TradeSetup;
    }
    return null;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return null;
  }
};
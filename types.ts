export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma7?: number;
  ma25?: number;
  ma99?: number;
}

export interface TradeSetup {
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  condition: string;
  entryZone: string;
  targets: string[];
  invalidation: string;
  summary: string;
  entryAdvice: string;
  riskRewardRatio: string;
  confidenceScore: number;
}

export enum Timeframe {
  Daily = 'Daily',
  H4 = '4H',
  H2 = '2H',
  H1 = '1H',
  M30 = '30m'
}

export interface ChartContext {
  id: string;
  timeframe: Timeframe;
  symbol: string;
  data: Candle[];
  title: string;
  description: string;
  supplyZones?: { top: number; bottom: number; label: string }[];
  demandZones?: { top: number; bottom: number; label: string }[];
}
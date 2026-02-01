import { Candle } from '../types';

export const generateMarketData = (startPrice: number, count: number, volatility: number = 0.005): Candle[] => {
  let currentPrice = startPrice;
  const data: Candle[] = [];
  const now = new Date();
  
  // Initialize MAs
  const closeHistory: number[] = [];

  for (let i = 0; i < count; i++) {
    const time = new Date(now.getTime() - (count - i) * 1000 * 60 * 60 * 4); // 4 hour candles
    const change = currentPrice * (Math.random() - 0.5) * volatility * 2;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * (currentPrice * 0.002);
    const low = Math.min(open, close) - Math.random() * (currentPrice * 0.002);
    const volume = Math.floor(Math.random() * 1000) + 100;

    currentPrice = close;
    closeHistory.push(close);

    const candle: Candle = {
      time: time.toISOString(),
      open,
      high,
      low,
      close,
      volume,
    };

    // Simple MA calc
    if (i >= 6) candle.ma7 = closeHistory.slice(i - 6, i + 1).reduce((a, b) => a + b, 0) / 7;
    if (i >= 24) candle.ma25 = closeHistory.slice(i - 24, i + 1).reduce((a, b) => a + b, 0) / 25;
    if (i >= 98) candle.ma99 = closeHistory.slice(i - 98, i + 1).reduce((a, b) => a + b, 0) / 99;

    data.push(candle);
  }

  return data;
};

// Helper to format currency
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

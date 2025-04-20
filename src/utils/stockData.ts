
export const POPULAR_STOCKS = [
  { value: "AAPL", label: "AAPL - Apple Inc." },
  { value: "MSFT", label: "MSFT - Microsoft Corporation" },
  { value: "GOOGL", label: "GOOGL - Alphabet Inc." },
  { value: "AMZN", label: "AMZN - Amazon.com Inc." },
  { value: "META", label: "META - Meta Platforms Inc." },
  { value: "TSLA", label: "TSLA - Tesla Inc." },
  { value: "NVDA", label: "NVDA - NVIDIA Corporation" },
  { value: "JPM", label: "JPM - JPMorgan Chase & Co." },
  { value: "V", label: "V - Visa Inc." },
  { value: "WMT", label: "WMT - Walmart Inc." }
];

// Base prices updated to reflect more current market values (as of 2024)
const BASE_PRICES: Record<string, number> = {
  AAPL: 168,
  MSFT: 425,
  GOOGL: 156,
  AMZN: 185,
  META: 510,
  TSLA: 147,
  NVDA: 870,
  JPM: 182,
  V: 275,
  WMT: 60
};

// Mock data for when the API fails
export const generateMockStockData = (symbol: string, timeRange: string) => {
  const basePrice = BASE_PRICES[symbol] || 100;

  const now = new Date();
  const points = timeRange === "1d" ? 78 : 
                timeRange === "5d" ? 5 * 78 : 
                timeRange === "1m" ? 22 : 
                timeRange === "3m" ? 66 :
                timeRange === "6m" ? 132 :
                timeRange === "1y" ? 52 : 260;

  return Array.from({ length: points }, (_, i) => {
    const timestamp = new Date(now);
    if (timeRange === "1d") {
      timestamp.setMinutes(timestamp.getMinutes() - (points - i) * 5);
    } else if (timeRange === "5d") {
      timestamp.setMinutes(timestamp.getMinutes() - (points - i));
    } else if (timeRange === "1m") {
      timestamp.setDate(timestamp.getDate() - (points - i));
    } else if (timeRange === "3m" || timeRange === "6m") {
      timestamp.setDate(timestamp.getDate() - (points - i));
    } else {
      timestamp.setDate(timestamp.getDate() - (points - i) * 7);
    }

    const volatility = timeRange === "1d" ? 0.5 : 
                       timeRange === "5d" ? 1 : 
                       timeRange === "1m" ? 2 : 3;
    
    const randomChange = (Math.random() - 0.5) * volatility;
    const price = basePrice + randomChange;
    const open = price - (Math.random() - 0.5) * (volatility * 0.5);
    const high = Math.max(price, open) + (Math.random() * volatility * 0.3);
    const low = Math.min(price, open) - (Math.random() * volatility * 0.3);

    return {
      timestamp: timestamp.toISOString(),
      open,
      high,
      low,
      close: price,
      volume: Math.floor(Math.random() * 1000000) + 500000
    };
  });
};

export const generateMockQuote = (symbol: string) => {
  const basePrice = BASE_PRICES[symbol] || 100;

  const randomChange = (Math.random() - 0.5) * 5;
  const price = basePrice + randomChange;
  const change = randomChange;
  const changePercent = (change / basePrice) * 100;

  return {
    symbol,
    price,
    change,
    changePercent,
    volume: Math.floor(Math.random() * 1000000) + 500000,
    high: price + 2,
    low: price - 2,
    open: price - 1,
    prevClose: price - change
  };
};

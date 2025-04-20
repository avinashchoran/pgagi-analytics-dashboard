
import { useQuery } from "@tanstack/react-query";
import { ALPHA_VANTAGE_API_KEY, API_ENDPOINTS, getUserApiKey } from "@/utils/apiConfig";
import { generateMockStockData } from "@/utils/stockData";
import { toast } from "sonner";

// Define the valid time range values
export type TimeRange = "1d" | "5d" | "1m" | "3m" | "6m" | "1y" | "5y";

interface StockHistoryData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const getTimeSeries = (range: TimeRange) => {
  switch (range) {
    case "1d":
    case "5d":
      return "TIME_SERIES_INTRADAY";
    case "1m":
    case "3m":
    case "6m":
      return "TIME_SERIES_DAILY";
    case "1y":
    case "5y":
      return "TIME_SERIES_WEEKLY";
    default:
      return "TIME_SERIES_DAILY";
  }
};

const getInterval = (range: TimeRange) => {
  switch (range) {
    case "1d":
    case "5d":
      return "5min";
    default:
      return undefined;
  }
};

const getDataPoints = (range: TimeRange) => {
  switch (range) {
    case "1d":
      return 78; // 6.5 hours of trading * 12 points per hour
    case "5d":
      return 5 * 78; // 5 days * 78 points per day
    case "1m":
      return 22; // ~22 trading days
    case "3m":
      return 66; // ~66 trading days (3 months)
    case "6m":
      return 132; // ~132 trading days (6 months)
    case "1y":
      return 52; // 52 weeks
    case "5y":
      return 260; // 5 years * 52 weeks
    default:
      return 22;
  }
};

export function useStockHistory(symbol: string, range: TimeRange) {
  return useQuery({
    queryKey: ['stockHistory', symbol, range],
    queryFn: async () => {
      try {
        const function_name = getTimeSeries(range);
        const interval = getInterval(range);
        const url = new URL(API_ENDPOINTS.stocks);
        
        // Get the API key - either from localStorage or from default
        const apiKey = getUserApiKey('stocks');
        
        url.searchParams.append('function', function_name);
        url.searchParams.append('symbol', symbol);
        if (interval) {
          url.searchParams.append('interval', interval);
        }
        url.searchParams.append('apikey', apiKey);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Failed to fetch stock history');
        
        const data = await response.json();
        
        // Check for API limit error
        if (data.Note || data['Error Message']) {
          throw new Error(data.Note || data['Error Message']);
        }

        const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
        if (!timeSeriesKey) throw new Error('No time series data found');

        const timeSeries = data[timeSeriesKey];
        const timestamps = Object.keys(timeSeries)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .slice(-getDataPoints(range));

        return timestamps.map(timestamp => ({
          timestamp,
          open: parseFloat(timeSeries[timestamp]['1. open']),
          high: parseFloat(timeSeries[timestamp]['2. high']),
          low: parseFloat(timeSeries[timestamp]['3. low']),
          close: parseFloat(timeSeries[timestamp]['4. close']),
          volume: parseFloat(timeSeries[timestamp]['5. volume']),
        }));
      } catch (error) {
        // Show error toast only for API-specific errors
        if (error instanceof Error && !error.message.includes('Failed to fetch')) {
          toast.error('API Error', {
            description: 'Using demo data. ' + error.message
          });
        }
        // Return mock data as fallback
        return generateMockStockData(symbol, range);
      }
    },
    refetchInterval: range === "1d" ? 60000 : undefined, // Refresh every minute for intraday data
  });
}

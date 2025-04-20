
// Weather types
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike?: number;
  pressure?: number;
  visibility?: number;
}

export interface ForecastDay {
  date: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

// News types
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
  description?: string;
  imageUrl?: string;
  category?: string;
}

// Stock types
export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

export interface StockHistoryData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// GitHub types
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  updated_at: string;
  created_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
  topics?: string[];
  license?: {
    key: string;
    name: string;
    url: string;
  };
}

export type TimeRange = "1D" | "1W" | "1M" | "1Y";
export type NewsCategory = "technology" | "business" | "sports" | "health" | "entertainment" | "science" | "general";

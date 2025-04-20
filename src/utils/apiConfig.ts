// Environment variables for API keys
export const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "";
export const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || "";
export const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "";
export const GITHUB_API_KEY = import.meta.env.VITE_GITHUB_TOKEN || "";
export const GEODB_API_KEY = import.meta.env.VITE_GEODB_API_KEY || "";

export const API_ENDPOINTS = {
  weather: "https://api.openweathermap.org/data/2.5",
  news: "https://newsapi.org/v2",
  stocks: "https://www.alphavantage.co/query",
  github: "https://api.github.com",
  geodb: "https://wft-geo-db.p.rapidapi.com/v1/geo",
} as const;

// Helper function to get the user's API key or use the default
export const getUserApiKey = (service: 'weather' | 'news' | 'stocks' | 'github' | 'geodb'): string => {
  switch (service) {
    case 'weather':
      return localStorage.getItem('weatherApiKey') || WEATHER_API_KEY;
    case 'news':
      return localStorage.getItem('newsApiKey') || NEWS_API_KEY;
    case 'stocks':
      return localStorage.getItem('alphavantageApiKey') || ALPHA_VANTAGE_API_KEY;
    case 'github':
      return localStorage.getItem('githubApiKey') || GITHUB_API_KEY;
    case 'geodb':
      return localStorage.getItem('geodbApiKey') || GEODB_API_KEY;
    default:
      return '';
  }
};

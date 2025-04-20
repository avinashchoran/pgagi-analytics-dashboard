
import { useQuery } from "@tanstack/react-query";
import { WEATHER_API_KEY, API_ENDPOINTS } from "@/utils/apiConfig";
import { toast } from "sonner";

export interface ForecastDay {
  date: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

export function useWeatherForecast(location: string, unit: "imperial" | "metric" = "imperial") {
  return useQuery({
    queryKey: ['weather-forecast', location, unit],
    queryFn: async (): Promise<ForecastDay[]> => {
      try {
        // First get coordinates for the location
        const geoResponse = await fetch(
          `${API_ENDPOINTS.weather}/weather?q=${location}&appid=${WEATHER_API_KEY}`
        );
        if (!geoResponse.ok) {
          const errorData = await geoResponse.json();
          throw new Error(errorData.message || 'Failed to get location coordinates');
        }
        const geoData = await geoResponse.json();
        
        // Then get the 7-day forecast using coordinates
        const forecastResponse = await fetch(
          `${API_ENDPOINTS.weather}/forecast?lat=${geoData.coord.lat}&lon=${geoData.coord.lon}&appid=${WEATHER_API_KEY}&units=${unit}&cnt=7`
        );
        if (!forecastResponse.ok) {
          const errorData = await forecastResponse.json();
          throw new Error(errorData.message || 'Forecast data fetch failed');
        }
        const forecastData = await forecastResponse.json();
        
        return forecastData.list.map((day: any) => ({
          date: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temperature: Math.round(day.main.temp),
          condition: day.weather[0].main,
          icon: day.weather[0].icon,
          humidity: day.main.humidity,
          windSpeed: Math.round(day.wind.speed),
        }));
      } catch (error) {
        toast.error("Weather forecast error", {
          description: error instanceof Error ? error.message : "Failed to fetch forecast data"
        });
        return [];
      }
    },
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
  });
}

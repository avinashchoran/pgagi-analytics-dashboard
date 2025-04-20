import React from "react";
import { useQuery } from "@tanstack/react-query";
import WidgetCard from "./WidgetCard";
import { Cloud, CloudRain, Sun, Thermometer } from "lucide-react";
import { WEATHER_API_KEY, API_ENDPOINTS } from "@/utils/apiConfig";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherWidgetProps {
  className?: string;
  location?: string;
  unit?: "imperial" | "metric";
}

const WeatherWidget = ({ className, location, unit }: WeatherWidgetProps) => {
  const [storedCity] = useLocalStorage("selectedCity", "New York,US");
  const [storedUnit] = useLocalStorage<"imperial" | "metric">("weatherUnit", "imperial");
  const cityToUse = location || storedCity;
  const unitToUse = unit || storedUnit;

  const { data: weatherData, isLoading } = useQuery({
    queryKey: ['weather', cityToUse, unitToUse],
    queryFn: async (): Promise<WeatherData> => {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.weather}/weather?q=${cityToUse}&appid=${WEATHER_API_KEY}&units=${unitToUse}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Weather data fetch failed');
        }
        const data = await response.json();
        
        return {
          location: data.name,
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed),
        };
      } catch (error) {
        toast.error("Weather data error", {
          description: error instanceof Error ? error.message : "Failed to fetch weather data"
        });
        throw error;
      }
    },
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="h-12 w-12 text-amber-500" />;
      case "rainy":
      case "rain":
        return <CloudRain className="h-12 w-12 text-sky-500" />;
      case "cloudy":
      case "clouds":
      default:
        return <Cloud className="h-12 w-12 text-slate-500" />;
    }
  };

  return (
    <WidgetCard 
      title="Weather" 
      isLoading={isLoading} 
      className={className}
    >
      {weatherData && (
        <div className="flex flex-col items-center bg-background/50 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2 text-foreground/90">{weatherData.location}</h3>
          
          <div className="flex items-center justify-center gap-4 my-4">
            {getWeatherIcon(weatherData.condition)}
            <div className="text-3xl font-bold flex items-start text-foreground">
              {weatherData.temperature}
              <span className="text-lg text-foreground/80">°{unitToUse === "imperial" ? "F" : "C"}</span>
            </div>
          </div>
          
          <p className="text-foreground/70 mb-4 font-medium">{weatherData.condition}</p>
          
          <div className="w-full grid grid-cols-2 gap-4 mt-2 bg-muted/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-rose-500" />
              <span className="text-sm text-foreground/80">Humidity: {weatherData.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-sky-500" />
              <span className="text-sm text-foreground/80">Wind: {weatherData.windSpeed} {unitToUse === "imperial" ? "mph" : "m/s"}</span>
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  );
};

export default WeatherWidget;

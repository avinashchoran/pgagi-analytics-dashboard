import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import { SearchCombobox } from "@/components/ui/search-combobox";
import { useCitySearch } from "@/hooks/use-city-search";
import { useWeatherForecast } from "@/hooks/use-weather-forecast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { motion } from "framer-motion";

const Weather = () => {
  const [weatherUnit] = useLocalStorage<"imperial" | "metric">("weatherUnit", "imperial");
  const [selectedCity, setSelectedCity] = useLocalStorage("selectedCity", "New York,US");
  const [searchQuery, setSearchQuery] = useState(selectedCity);
  const { options, loading, handleSubmit } = useCitySearch(searchQuery);
  const { data: forecastData, isLoading: forecastLoading } = useWeatherForecast(selectedCity, weatherUnit);

  useEffect(() => {
    setSearchQuery(selectedCity);
  }, [selectedCity]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case "rainy":
      case "rain":
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case "cloudy":
      case "clouds":
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatTemperature = (temp: number) => {
    return `${temp}°${weatherUnit === "imperial" ? "F" : "C"}`;
  };

  const tempChartData = forecastData?.map(day => ({
    name: day.date,
    temperature: day.temperature,
    humidity: day.humidity || 0,
    windSpeed: day.windSpeed || 0
  }));

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Weather Dashboard</h1>
        
        <div className="max-w-md mb-6">
          <SearchCombobox
            options={options}
            value={selectedCity}
            onValueChange={setSelectedCity}
            onInputChange={setSearchQuery}
            onSubmit={handleSubmit}
            placeholder="Enter city name"
            emptyMessage="No cities found"
            loading={loading}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Weather</CardTitle>
            </CardHeader>
            <CardContent>
              <WeatherWidget 
                className="bg-transparent shadow-none border-0"
                location={selectedCity}
                unit={weatherUnit}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Temperature Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {forecastLoading ? (
                <div className="h-64 w-full bg-muted/20 animate-pulse rounded-lg"></div>
              ) : tempChartData ? (
                <motion.div 
                  className="h-64 w-full" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tempChartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis 
                        label={{ 
                          value: weatherUnit === "imperial" ? "Temperature (°F)" : "Temperature (°C)", 
                          angle: -90, 
                          position: 'insideLeft' 
                        }} 
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} ${weatherUnit === "imperial" ? "°F" : "°C"}`, "Temperature"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#colorTemp)" 
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <div className="text-center py-8">No forecast data available</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Humidity & Wind Speed</CardTitle>
            </CardHeader>
            <CardContent>
              {forecastLoading ? (
                <div className="h-64 w-full bg-muted/20 animate-pulse rounded-lg"></div>
              ) : tempChartData ? (
                <motion.div 
                  className="h-64 w-full" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={tempChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                      <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                      <Tooltip />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="humidity" 
                        stroke="#82ca9d" 
                        name="Humidity (%)"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        animationDuration={1000}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="windSpeed" 
                        stroke="#8884d8" 
                        name={`Wind Speed (${weatherUnit === "imperial" ? "mph" : "m/s"})`}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <div className="text-center py-8">No humidity/wind data available</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {forecastLoading ? (
                  [...Array(7)].map((_, index) => (
                    <div key={index} className="flex flex-col items-center p-4 rounded-lg bg-muted/20 animate-pulse">
                      <div className="h-5 w-16 bg-muted mb-2 rounded" />
                      <div className="h-8 w-8 bg-muted rounded-full my-2" />
                      <div className="h-5 w-12 bg-muted rounded" />
                    </div>
                  ))
                ) : (
                  forecastData?.map((day, index) => (
                    <motion.div 
                      key={index} 
                      className="flex flex-col items-center p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                    >
                      <span className="text-sm text-muted-foreground">
                        {day.date}
                      </span>
                      <div className="my-2">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <span className="font-medium">{formatTemperature(day.temperature)}</span>
                      <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                        {day.humidity && (
                          <span className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" /> 
                            {day.humidity}%
                          </span>
                        )}
                        {day.windSpeed && (
                          <span className="flex items-center gap-1">
                            <Wind className="h-3 w-3" /> 
                            {day.windSpeed}{weatherUnit === "imperial" ? "mph" : "m/s"}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Weather;

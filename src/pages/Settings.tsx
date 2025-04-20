
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";
import { AlertCircle, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [animationsEnabled, setAnimationsEnabled] = useLocalStorage<boolean>("animationsEnabled", true);
  const [autoRefresh, setAutoRefresh] = useLocalStorage<boolean>("autoRefresh", false);
  const [refreshInterval, setRefreshInterval] = useLocalStorage<number>("refreshInterval", 60);
  const [weatherUnit, setWeatherUnit] = useLocalStorage<"imperial" | "metric">("weatherUnit", "imperial");
  const [preferredNewsCategory, setPreferredNewsCategory] = useLocalStorage<string>("preferredNewsCategory", "technology");
  
  // API key storage
  const [weatherApiKey, setWeatherApiKey] = useLocalStorage<string>("weatherApiKey", "");
  const [newsApiKey, setNewsApiKey] = useLocalStorage<string>("newsApiKey", "");
  const [alphavantageApiKey, setAlphavantageApiKey] = useLocalStorage<string>("alphavantageApiKey", "");
  
  // Auto-refresh timer
  useEffect(() => {
    let timer: number | undefined;
    
    if (autoRefresh && refreshInterval > 0) {
      timer = window.setInterval(() => {
        toast.info(`Auto-refreshing data (every ${refreshInterval} seconds)`);
        // Simulate refresh logic
        document.dispatchEvent(new CustomEvent('dashboard:refresh'));
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefresh, refreshInterval]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences and API keys.</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="api">API Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Preferences</CardTitle>
                <CardDescription>Configure how data is displayed in the application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="weather-unit">Weather Unit</Label>
                    <Select value={weatherUnit} onValueChange={(value: "imperial" | "metric") => {
                      setWeatherUnit(value);
                      toast.success(`Weather unit changed to ${value === "imperial" ? "Fahrenheit" : "Celsius"}`);
                    }}>
                      <SelectTrigger id="weather-unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="imperial">Fahrenheit (°F)</SelectItem>
                        <SelectItem value="metric">Celsius (°C)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="news-category">Preferred News Category</Label>
                    <Select value={preferredNewsCategory} onValueChange={(value) => {
                      setPreferredNewsCategory(value);
                      toast.success(`Preferred news category changed to ${value}`);
                    }}>
                      <SelectTrigger id="news-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-refresh">Auto-refresh Data</Label>
                      <Switch 
                        id="auto-refresh" 
                        checked={autoRefresh}
                        onCheckedChange={(checked) => {
                          setAutoRefresh(checked);
                          toast.success(`Auto-refresh ${checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically refresh dashboard data at the specified interval.
                    </p>
                  </div>
                  
                  {autoRefresh && (
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="refresh-interval" 
                          type="number" 
                          min="10" 
                          value={refreshInterval} 
                          onChange={(e) => setRefreshInterval(Number(e.target.value))}
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            if (refreshInterval >= 10) {
                              toast.success(`Refresh interval set to ${refreshInterval} seconds`);
                            } else {
                              setRefreshInterval(10);
                              toast.error(`Minimum refresh interval is 10 seconds`);
                            }
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => {
                      setTheme(value);
                      toast.success(`Theme changed to ${value}`);
                    }}>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-animations">Enable Animations</Label>
                      <Switch 
                        id="enable-animations" 
                        checked={animationsEnabled}
                        onCheckedChange={setAnimationsEnabled}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Toggle animations throughout the application for transitions and effects.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Enter your API keys to use your own data sources. These keys are stored locally in your browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    If the default APIs don't work, you can provide your own API keys.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openweathermap-key">OpenWeatherMap API Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="openweathermap-key" 
                        value={weatherApiKey} 
                        onChange={(e) => setWeatherApiKey(e.target.value)}
                        type="password"
                        placeholder="Enter your OpenWeatherMap API key"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          if (weatherApiKey.trim()) {
                            toast.success("OpenWeatherMap API key saved");
                          } else {
                            setWeatherApiKey("");
                            toast.success("OpenWeatherMap API key removed");
                          }
                        }}
                      >
                        {weatherApiKey ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newsapi-key">NewsAPI Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="newsapi-key" 
                        value={newsApiKey} 
                        onChange={(e) => setNewsApiKey(e.target.value)}
                        type="password"
                        placeholder="Enter your NewsAPI key"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          if (newsApiKey.trim()) {
                            toast.success("NewsAPI key saved");
                          } else {
                            setNewsApiKey("");
                            toast.success("NewsAPI key removed");
                          }
                        }}
                      >
                        {newsApiKey ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alphavantage-key">Alpha Vantage API Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="alphavantage-key" 
                        value={alphavantageApiKey} 
                        onChange={(e) => setAlphavantageApiKey(e.target.value)}
                        type="password"
                        placeholder="Enter your Alpha Vantage API key"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          if (alphavantageApiKey.trim()) {
                            toast.success("Alpha Vantage API key saved");
                          } else {
                            setAlphavantageApiKey("");
                            toast.success("Alpha Vantage API key removed");
                          }
                        }}
                      >
                        {alphavantageApiKey ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;

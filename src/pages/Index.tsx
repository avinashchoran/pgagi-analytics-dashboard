import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import LineChartWidget from "@/components/widgets/LineChartWidget";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import NewsWidget from "@/components/widgets/NewsWidget";
import StockWidget from "@/components/widgets/StockWidget";
import StockChartWidget from "@/components/widgets/StockChartWidget";
import GitHubWidget from "@/components/widgets/GitHubWidget";
import { RefreshCw, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

// Animated widget container component
const AnimatedWidget = ({ 
  children, 
  index, 
  onClick = undefined 
}: { 
  children: React.ReactNode; 
  index: number; 
  onClick?: () => void 
}) => {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
          }
        })
      }}
      className={cn(
        "h-full flex flex-col transition-shadow duration-200",
        onClick && "cursor-pointer",
        "hover:shadow-lg hover:border-primary/50"
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

const Index = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [weatherUnit] = useLocalStorage<"imperial" | "metric">("weatherUnit", "imperial");
  const [newsCategory] = useLocalStorage<string>("newsCategory", "technology");
  const [selectedStock] = useLocalStorage<string>("selectedStock", null);
  const navigate = useNavigate();

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info("Refreshing dashboard data...");
    
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Dashboard data refreshed");
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </motion.div>
        </div>

        {/* First row: Weather, News, and Market Watch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedWidget index={0} onClick={() => navigate('/weather')}>
            <WeatherWidget className="flex-1" unit={weatherUnit} />
            <Link to="/weather" className="mt-2 text-xs text-right text-muted-foreground hover:text-foreground flex items-center justify-end">
              View detailed weather <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </AnimatedWidget>
          
          <AnimatedWidget index={1} onClick={() => navigate('/news')}>
            <NewsWidget className="flex-1" category={newsCategory} />
            <Link to="/news" className="mt-2 text-xs text-right text-muted-foreground hover:text-foreground flex items-center justify-end">
              View all news <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </AnimatedWidget>
          
          <AnimatedWidget index={2} onClick={() => navigate('/stocks')}>
            <StockWidget className="flex-1" />
            <Link to="/stocks" className="mt-2 text-xs text-right text-muted-foreground hover:text-foreground flex items-center justify-end">
              View detailed market data <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </AnimatedWidget>
        </div>

        {/* Second row: GitHub and Stock Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatedWidget index={3} onClick={() => navigate('/github')}>
            <GitHubWidget className="flex-1" />
            <Link to="/github" className="mt-2 text-xs text-right text-muted-foreground hover:text-foreground flex items-center justify-end">
              Explore GitHub repositories <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </AnimatedWidget>
          
          <AnimatedWidget index={4} onClick={() => navigate('/stocks')}>
            {selectedStock ? (
              <StockChartWidget symbol={selectedStock} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-card p-6 rounded-lg border">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  Select a stock to monitor its performance
                </p>
                <Button size="sm" onClick={() => navigate('/stocks')}>
                  Choose Stock
                </Button>
              </div>
            )}
            <Link to="/stocks" className="mt-2 text-xs text-right text-muted-foreground hover:text-foreground flex items-center justify-end">
              View detailed market data <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </AnimatedWidget>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;

import React, { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar
} from "recharts";
import { useStockHistory } from "@/hooks/use-stock-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { POPULAR_STOCKS } from "@/utils/stockData";
import { TimeRange } from "@/hooks/use-stock-history";

interface StockChartWidgetProps {
  symbol: string;
}

const timeRanges = [
  { label: "1D", value: "1d" as TimeRange },
  { label: "5D", value: "5d" as TimeRange },
  { label: "1M", value: "1m" as TimeRange },
  { label: "3M", value: "3m" as TimeRange },
  { label: "6M", value: "6m" as TimeRange },
  { label: "1Y", value: "1y" as TimeRange },
  { label: "5Y", value: "5y" as TimeRange },
];

const CandlestickChart = ({ data, formatDate, customTooltip }) => {
  if (!data || data.length === 0) return null;
  
  const candleData = data.map((item) => {
    const isPositive = item.close >= item.open;
    return {
      ...item,
      color: isPositive 
        ? 'hsl(var(--success))'
        : 'hsl(var(--destructive))',
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{ 
          top: 20, 
          right: 30, 
          bottom: 20, 
          left: 20 
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          opacity={0.1} 
        />
        <XAxis 
          dataKey="timestamp" 
          name="Date" 
          tickFormatter={formatDate}
          minTickGap={30}
          padding={{ 
            left: 20, 
            right: 20 
          }}
        />
        <YAxis 
          dataKey="close" 
          name="Price" 
          domain={['auto', 'auto']}
          tickFormatter={(value) => `$${value.toFixed(2)}`}
          padding={{ 
            top: 20, 
            bottom: 20 
          }}
        />
        <Tooltip 
          content={customTooltip} 
          cursor={{ 
            strokeWidth: 1, 
            stroke: 'hsl(var(--muted-foreground))' 
          }} 
        />
        
        <Scatter
          name="Stock Data"
          data={candleData}
          shape={(props) => {
            const { cx, cy, payload } = props;
            const { open, close, high, low, color } = payload;
            const isPositive = close >= open;
            
            const candleWidth = 8;
            const xLeft = cx - candleWidth / 2;
            const xRight = cx + candleWidth / 2;
            
            const yHigh = props.yAxis.scale(high);
            const yLow = props.yAxis.scale(low);
            const yOpen = props.yAxis.scale(open);
            const yClose = props.yAxis.scale(close);
            
            return (
              <g key={`candle-${cx}-${cy}`}>
                <line
                  x1={cx}
                  y1={yHigh}
                  x2={cx}
                  y2={yLow}
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.7}
                />
                
                <rect
                  x={xLeft}
                  y={isPositive ? yOpen : yClose}
                  width={candleWidth}
                  height={Math.abs(yClose - yOpen)}
                  fill={color}
                  stroke={color}
                  opacity={0.8}
                />
              </g>
            );
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

const StockChartWidget = ({ symbol }: StockChartWidgetProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1m");
  const [chartType, setChartType] = useState("area");
  const { data, isLoading, error } = useStockHistory(symbol, timeRange);
  
  const stockName = POPULAR_STOCKS.find(stock => stock.value === symbol)?.label.split(" - ")[1] || symbol;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: timeRange === "1y" || timeRange === "5y" ? "numeric" : undefined,
      hour: timeRange === "1d" || timeRange === "5d" ? "numeric" : undefined,
      minute: timeRange === "1d" || timeRange === "5d" ? "numeric" : undefined,
    }).format(date);
  };

  const formatTooltipDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: timeRange === "1d" || timeRange === "5d" ? "numeric" : undefined,
      minute: timeRange === "1d" || timeRange === "5d" ? "numeric" : undefined,
    }).format(date);
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium">{formatTooltipDate(label || payload[0]?.payload?.timestamp)}</p>
          {chartType === "candlestick" ? (
            <div className="space-y-1 mt-2">
              <p>Open: <span className="font-medium">{formatCurrency(payload[0].payload.open)}</span></p>
              <p>High: <span className="font-medium">{formatCurrency(payload[0].payload.high)}</span></p>
              <p>Low: <span className="font-medium">{formatCurrency(payload[0].payload.low)}</span></p>
              <p>Close: <span className="font-medium">{formatCurrency(payload[0].payload.close)}</span></p>
            </div>
          ) : (
            <p className="font-medium">
              {formatCurrency(payload[0].value)}
            </p>
          )}
          {payload[0].payload.volume && (
            <p className="text-xs text-muted-foreground mt-1">
              Volume: {payload[0].payload.volume.toLocaleString()}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  const renderChart = () => {
    if (isLoading) {
      return <Skeleton className="w-full h-full" />;
    }
    
    if (error || !data || data.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-muted-foreground">
            Unable to load stock data at this time.
          </p>
        </div>
      );
    }

    switch (chartType) {
      case "area":
        return (
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              minTickGap={30}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={customTooltip} />
            <Area
              type="monotone"
              dataKey="close"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorPrice)"
              animationDuration={750}
            />
          </AreaChart>
        );
      case "line":
        return (
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              minTickGap={30}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={customTooltip} />
            <Line
              type="monotone"
              dataKey="close"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              animationDuration={750}
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              minTickGap={30}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={customTooltip} />
            <Bar
              dataKey="close"
              fill="hsl(var(--primary))"
              animationDuration={750}
            />
          </BarChart>
        );
      case "candlestick":
        return (
          <CandlestickChart 
            data={data}
            formatDate={formatDate}
            customTooltip={customTooltip}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            {stockName} Performance
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    {chartType === "candlestick" 
                      ? "Candlestick charts show the open, high, low, and close prices"
                      : "Showing historical stock price data"}
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {chartType === "area" && "Area"}
                  {chartType === "line" && "Line"}
                  {chartType === "bar" && "Bar"}
                  {chartType === "candlestick" && "Candlestick"}
                  <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setChartType("area")}>
                  Area
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("line")}>
                  Line
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("bar")}>
                  Bar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("candlestick")}>
                  Candlestick
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {timeRanges.find((t) => t.value === timeRange)?.label}
                  <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {timeRanges.map((range) => (
                  <DropdownMenuItem
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                  >
                    {range.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChartWidget;

import React from "react";
import { useQuery } from "@tanstack/react-query";
import WidgetCard from "./WidgetCard";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALPHA_VANTAGE_API_KEY, API_ENDPOINTS } from "@/utils/apiConfig";
import { POPULAR_STOCKS, generateMockQuote } from "@/utils/stockData";

interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface StockWidgetProps {
  stocks?: string[];
  selectedStock?: string;
  isLoading?: boolean;
  className?: string;
}

const StockWidget = ({
  stocks = POPULAR_STOCKS.map(s => s.value),
  selectedStock,
  isLoading: externalLoading = false,
  className,
}: StockWidgetProps) => {
  const stocksToFetch = selectedStock
    ? [selectedStock, ...stocks.filter(s => s !== selectedStock).slice(0, 4)]
    : stocks.slice(0, 5);

  const { data: stockItems, isLoading: queryLoading } = useQuery({
    queryKey: ['stocks', stocksToFetch],
    queryFn: async (): Promise<StockItem[]> => {
      try {
        const stockData = await Promise.all(
          stocksToFetch.map(async (symbol) => {
            try {
              const response = await fetch(
                `${API_ENDPOINTS.stocks}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
              );
              if (!response.ok) throw new Error('Stock data fetch failed');
              const data = await response.json();

              // Check for API limit error
              if (data.Note || data['Error Message']) {
                throw new Error(data.Note || data['Error Message']);
              }
              
              const quote = data['Global Quote'];
              return {
                symbol,
                name: POPULAR_STOCKS.find(s => s.value === symbol)?.label.split(" - ")[1] || symbol,
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
              };
            } catch (error) {
              // Return mock data for individual stock errors
              const mockData = generateMockQuote(symbol);
              return {
                symbol,
                name: POPULAR_STOCKS.find(s => s.value === symbol)?.label.split(" - ")[1] || symbol,
                price: mockData.price,
                change: mockData.change,
              };
            }
          })
        );
        
        return stockData;
      } catch (error) {
        // If the entire request fails, generate mock data for all stocks
        return stocksToFetch.map(symbol => {
          const mockData = generateMockQuote(symbol);
          return {
            symbol,
            name: POPULAR_STOCKS.find(s => s.value === symbol)?.label.split(" - ")[1] || symbol,
            price: mockData.price,
            change: mockData.change,
          };
        });
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const isLoading = queryLoading || externalLoading;

  return (
    <WidgetCard 
      title="Market Watch" 
      isLoading={isLoading} 
      className={className}
    >
      <div className="space-y-2">
        {stockItems?.map((stock) => (
          <div 
            key={stock.symbol} 
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-colors",
              selectedStock === stock.symbol ? "bg-primary/10" : "hover:bg-muted/10",
              "border border-transparent hover:border-muted/20"
            )}
          >
            <div>
              <div className="font-medium text-foreground/90">{stock.symbol}</div>
              <div className="text-xs text-muted-foreground">{stock.name}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-foreground/90">${stock.price.toFixed(2)}</div>
              <div className={cn(
                "text-xs flex items-center justify-end font-medium",
                stock.change >= 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                {stock.change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stock.change).toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
};

export default StockWidget;

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NEWS_API_KEY, API_ENDPOINTS } from "@/utils/apiConfig";
import WidgetCard from "./WidgetCard";
import { ArrowUpRight, Clock, AlertCircle } from "lucide-react";
import { cn, handleImageError } from "@/lib/utils";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsWidgetProps {
  className?: string;
  category?: string;
}

const NewsWidget = ({ className, category = "technology" }: NewsWidgetProps) => {
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['news', category],
    queryFn: async (): Promise<NewsItem[]> => {
      try {
        // Use custom API key if available
        const userApiKey = localStorage.getItem('newsApiKey');
        const apiKey = userApiKey || NEWS_API_KEY;
        
        const response = await fetch(
          `${API_ENDPOINTS.news}/top-headlines?country=us&category=${category}&apiKey=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error(`News API Error: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.articles || !Array.isArray(data.articles)) {
          throw new Error('Invalid response format from News API');
        }
        
        // Reset mock data flag since we got real data
        setIsUsingMockData(false);
        
        // Map the API response to ensure all required fields are present
        return data.articles.slice(0, 5).map(article => ({
          title: article.title,
          description: article.description,
          url: article.url || '#', // Fallback to # if URL is missing
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: {
            name: article.source?.name || 'Unknown Source'
          }
        }));
      } catch (error) {
        console.error('Error fetching news:', error);
        setIsUsingMockData(true);
        return getMockNewsData(category);
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <WidgetCard title="Latest News" isLoading={isLoading} className={className}>
      {isUsingMockData && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Using demo data. Live news feed is currently unavailable.
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        {data?.map((item, index) => (
          <motion.a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="group flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="relative block w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                {!isUsingMockData && item.urlToImage ? (
                  <img 
                    src={item.urlToImage} 
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => handleImageError(e, 'news')}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                  <ArrowUpRight className="inline-flex h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted">
                    {item.source.name}
                  </span>
                  <span className="text-xs flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(item.publishedAt)}
                  </span>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </WidgetCard>
  );
};

// Mock data in case the API fails
const getMockNewsData = (category: string): NewsItem[] => {
  const now = new Date();
  
  const categoryTitles: Record<string, string[]> = {
    technology: [
      "New AI model breaks records in natural language understanding",
      "Tech giant unveils revolutionary quantum computing breakthrough",
      "Startup raises $50M to develop sustainable battery technology",
      "Next-generation smartphone announced with innovative features",
      "Major cybersecurity flaw discovered in popular software"
    ],
    business: [
      "Global markets react to central bank interest rate decision",
      "Merger creates new leader in renewable energy sector",
      "Supply chain innovations lead to record quarterly profits",
      "Startup valuation reaches $1B after latest funding round",
      "Economic report shows unexpected growth in manufacturing"
    ],
    science: [
      "Astronomers discover potentially habitable exoplanet",
      "Breakthrough in fusion energy brings commercial use closer",
      "New study reveals surprising findings about deep ocean ecosystems",
      "Scientists develop biodegradable alternative to plastic",
      "Research team maps complete neural network of small organism"
    ],
    general: [
      "Global climate summit reaches historic agreement on emissions",
      "Major breakthrough in renewable energy technology announced",
      "International space mission successfully launches to Mars",
      "New healthcare policy reform set to transform medical access",
      "Groundbreaking education initiative shows promising results"
    ]
  };

  const categorySourceNames: Record<string, string[]> = {
    technology: ["TechCrunch", "Wired", "The Verge", "CNET", "MIT Technology Review"],
    business: ["Bloomberg", "Reuters", "Financial Times", "Wall Street Journal", "Forbes"],
    science: ["Nature", "Science Daily", "Scientific American", "Space.com", "New Scientist"],
    general: ["Associated Press", "Reuters", "BBC News", "The Guardian", "CNN"]
  };
  
  const titles = categoryTitles[category] || categoryTitles.default;
  const sourceNames = categorySourceNames[category] || categorySourceNames.general;
  
  return titles.map((title, index) => ({
    title,
    description: `This is a mock description for the article about ${title.toLowerCase()}.`,
    url: "https://example.com/news",
    urlToImage: `https://source.unsplash.com/random/300x200?${category}&sig=${index}`,
    publishedAt: new Date(now.getTime() - (index + 1) * 3600000).toISOString(),
    source: {
      name: sourceNames[index]
    }
  }));
};

export default NewsWidget;

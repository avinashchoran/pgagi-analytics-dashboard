import { useState, useEffect, useCallback } from 'react';
import { ALPHA_VANTAGE_API_KEY, API_ENDPOINTS } from '@/utils/apiConfig';
import { areSimilarStrings } from '@/utils/stringUtils';
import { POPULAR_STOCKS } from '@/utils/stockData';
import type { SearchOption } from '@/components/ui/search-combobox';
import { toast } from "sonner";

// Helper function to calculate similarity score
const getSimilarityScore = (str1: string, str2: string): number => {
  const maxLen = Math.max(str1.length, str2.length);
  let matches = 0;
  const lowerStr1 = str1.toLowerCase();
  const lowerStr2 = str2.toLowerCase();

  // Check for exact match or starts with
  if (lowerStr1 === lowerStr2) return 1;
  if (lowerStr1.startsWith(lowerStr2)) return 0.9;
  if (lowerStr2.startsWith(lowerStr1)) return 0.9;

  // Check character matches
  for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
    if (lowerStr1[i] === lowerStr2[i]) matches++;
  }

  // Calculate similarity score
  return matches / maxLen;
};

export function useStockSearch(query: string) {
  const [options, setOptions] = useState<SearchOption[]>(POPULAR_STOCKS);
  const [loading, setLoading] = useState(false);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState("");
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    if (query.length < 1) {
      setOptions(POPULAR_STOCKS);
      return;
    }

    // Always do local fuzzy search first for immediate feedback
    const fuzzyMatches = POPULAR_STOCKS.filter(stock => {
      const symbolScore = getSimilarityScore(stock.value, query);
      const nameScore = getSimilarityScore(stock.label, query);
      return symbolScore > 0.3 || nameScore > 0.3;
    }).sort((a, b) => {
      // Calculate similarity scores
      const aSymbolScore = getSimilarityScore(a.value, query);
      const aNameScore = getSimilarityScore(a.label, query);
      const bSymbolScore = getSimilarityScore(b.value, query);
      const bNameScore = getSimilarityScore(b.label, query);

      // Use the best score between symbol and name
      const aScore = Math.max(aSymbolScore, aNameScore);
      const bScore = Math.max(bSymbolScore, bNameScore);
      
      // Sort by highest score first
      return bScore - aScore;
    });

    // Set local results immediately
    setOptions(fuzzyMatches);

    // If the query is long enough and different from last API call, try API search
    if (query.length >= 2 && query !== lastSubmittedQuery && apiAvailable) {
      const searchStocks = async () => {
        setLoading(true);
        try {
          const userApiKey = localStorage.getItem('alphavantageApiKey');
          const apiKey = userApiKey || ALPHA_VANTAGE_API_KEY;
          
          const response = await fetch(
            `${API_ENDPOINTS.stocks}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${apiKey}`
          );

          if (!response.ok) throw new Error('Failed to fetch stocks');
          
          const data = await response.json();
          
          if (data.Note || data['Error Message']) {
            throw new Error(data.Note || data['Error Message']);
          }

          // Combine API results with fuzzy matches
          const apiResults = (data.bestMatches || []).map((stock: any) => ({
            value: stock['1. symbol'],
            label: `${stock['1. symbol']} - ${stock['2. name']}`,
          }));

          // Merge API results with fuzzy matches, removing duplicates
          const allResults = [...fuzzyMatches];
          apiResults.forEach(result => {
            if (!allResults.some(opt => opt.value === result.value)) {
              allResults.push(result);
            }
          });

          setOptions(allResults);
          setLastSubmittedQuery(query);
        } catch (error) {
          console.error('Error fetching stocks:', error);
          if (error instanceof Error && !error.message.includes('Failed to fetch')) {
            toast.error('API Error', {
              description: 'Using local stock data only. ' + error.message
            });
            setApiAvailable(false);
          }
          // Keep the fuzzy matches if API fails
          setOptions(fuzzyMatches);
        } finally {
          setLoading(false);
        }
      };

      const debounceTimer = setTimeout(searchStocks, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [query, lastSubmittedQuery, apiAvailable]);

  const handleSubmit = useCallback((query: string) => {
    if (query.length >= 2) {
      // Try exact match first
      const exactMatch = POPULAR_STOCKS.find(
        stock => stock.value.toLowerCase() === query.toLowerCase()
      );
      
      if (exactMatch) {
        setOptions([exactMatch]);
        return;
      }
      
      // Try fuzzy match if no exact match
      const fuzzyMatches = POPULAR_STOCKS.filter(stock => {
        const symbolScore = getSimilarityScore(stock.value, query);
        const nameScore = getSimilarityScore(stock.label, query);
        return symbolScore > 0.3 || nameScore > 0.3;
      }).sort((a, b) => {
        const aScore = Math.max(
          getSimilarityScore(a.value, query),
          getSimilarityScore(a.label, query)
        );
        const bScore = Math.max(
          getSimilarityScore(b.value, query),
          getSimilarityScore(b.label, query)
        );
        return bScore - aScore;
      });
      
      setOptions(fuzzyMatches);
    }
  }, []);

  return { options, loading, handleSubmit };
}


import { useState, useEffect, useCallback, useRef } from 'react';
import { WEATHER_API_KEY, API_ENDPOINTS, GEODB_API_KEY } from '@/utils/apiConfig';
import { areSimilarStrings } from '@/utils/stringUtils';
import type { SearchOption } from '@/components/ui/search-combobox';

interface City {
  name: string;
  country: string;
}

interface CityResult extends City {
  similarity: number;
}

interface WeatherApiCity {
  name: string;
  sys: {
    country: string;
  };
}

// Common cities to help with fuzzy matching
const COMMON_CITIES: City[] = [
  { name: "New York", country: "US" },
  { name: "London", country: "GB" },
  { name: "Tokyo", country: "JP" },
  { name: "Paris", country: "FR" },
  { name: "Berlin", country: "DE" },
  { name: "Sydney", country: "AU" },
  { name: "Mumbai", country: "IN" },
  { name: "Beijing", country: "CN" },
  { name: "Cairo", country: "EG" },
  { name: "Rio de Janeiro", country: "BR" },
];

interface CityCache {
  [key: string]: (City & { timestamp: number })[];
}

export function useCitySearch(query: string) {
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState("");
  const cityCache = useRef<CityCache>({});

  const searchWithGeoDB = useCallback(async (searchQuery: string) => {
    setLoading(true);
    const results: CityResult[] = [];
    
    // Check cache and common cities first
    const normalizedQuery = searchQuery.toLowerCase();
    const allCities = [
      ...(cityCache.current[normalizedQuery.charAt(0)] || []),
      ...COMMON_CITIES
    ];

    // Add fuzzy matches from cache and common cities
    allCities.forEach(city => {
      if (areSimilarStrings(city.name, searchQuery, 65)) {
        results.push({
          name: city.name,
          country: city.country,
          similarity: 100 // Give high priority to fuzzy matches from known cities
        });
      }
    });

    try {
      // Try GeoDB API if the key is available
      if (GEODB_API_KEY) {
        const headers = {
          'X-RapidAPI-Key': GEODB_API_KEY,
          'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
        };

        const response = await fetch(
          `${API_ENDPOINTS.geodb}/cities?namePrefix=${searchQuery}&limit=10&sort=-population`,
          { headers }
        );
        
        if (response.ok) {
          const data = await response.json();
          const geoDBResults: CityResult[] = data.data.map((city: any) => ({
            name: city.name,
            country: city.countryCode,
            similarity: areSimilarStrings(city.name, searchQuery, 0) ? 95 : 80
          }));
          
          results.push(...geoDBResults);
        } else {
          // Fallback to OpenWeatherMap if GeoDB fails
          await fallbackToWeatherAPI(searchQuery, results);
        }
      } else {
        // No GeoDB key, use OpenWeatherMap
        await fallbackToWeatherAPI(searchQuery, results);
      }

      // Combine and deduplicate results
      const combined = [...results]
        .reduce((acc, current) => {
          const key = `${current.name},${current.country}`;
          if (!acc[key] || acc[key].similarity < current.similarity) {
            acc[key] = current;
          }
          return acc;
        }, {} as Record<string, CityResult>);

      // Update cache with new cities
      const firstChar = searchQuery.toLowerCase().charAt(0);
      if (!cityCache.current[firstChar]) {
        cityCache.current[firstChar] = [];
      }
      Object.values(combined).forEach(city => {
        if (!cityCache.current[firstChar].some(c => 
          c.name === city.name && c.country === city.country
        )) {
          cityCache.current[firstChar].push({
            name: city.name,
            country: city.country,
            timestamp: Date.now()
          });
        }
      });

      // Convert to options and sort by similarity
      const sortedOptions = Object.values(combined)
        .sort((a, b) => b.similarity - a.similarity)
        .map(city => ({
          value: `${city.name},${city.country}`,
          label: `${city.name}, ${city.country}`
        }));

      setOptions(sortedOptions);
    } catch (error) {
      console.error('Error fetching cities:', error);
      // Still show fuzzy matches even if API fails
      setOptions(results.map(city => ({
        value: `${city.name},${city.country}`,
        label: `${city.name}, ${city.country}`
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  const fallbackToWeatherAPI = async (searchQuery: string, results: CityResult[]) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.weather}/find?q=${searchQuery}&type=like&sort=population&cnt=10&appid=${WEATHER_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch cities');
      
      const data = await response.json();
      const apiResults: CityResult[] = data.list.map((city: WeatherApiCity) => ({
        name: city.name,
        country: city.sys.country,
        similarity: areSimilarStrings(city.name, searchQuery, 0) ? 90 : 70
      }));
      
      results.push(...apiResults);
    } catch (error) {
      console.error('Fallback weather API error:', error);
    }
  };

  useEffect(() => {
    if (query.length < 2) {
      setOptions([]);
      return;
    }

    if (query !== lastSubmittedQuery) {
      const debounceTimer = setTimeout(() => searchWithGeoDB(query), 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [query, lastSubmittedQuery, searchWithGeoDB]);

  const handleSubmit = (query: string) => {
    setLastSubmittedQuery(query);
    searchWithGeoDB(query);
  };

  return { options, loading, handleSubmit };
}

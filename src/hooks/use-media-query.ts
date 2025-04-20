
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Use matchMedia if available (client-side only)
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;
    
    // Set up media query matching
    const mediaQuery = window.matchMedia(query);
    
    // Update state immediately
    setMatches(mediaQuery.matches);
    
    // Set up change handler
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    // Modern browsers
    mediaQuery.addEventListener("change", handler);
    
    // Cleanup
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

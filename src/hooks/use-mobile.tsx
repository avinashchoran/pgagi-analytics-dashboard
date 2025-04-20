
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// Add the missing useMedia function
export function useMedia(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(() => {
    // Use matchMedia if available (client-side only)
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  React.useEffect(() => {
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

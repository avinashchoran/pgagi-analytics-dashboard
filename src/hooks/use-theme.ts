
import { useState, useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setThemeValue] = useLocalStorage<Theme>(
    "theme",
    // Initialize from localStorage or system preference
    (localStorage.getItem("theme") as Theme) || "system"
  );
  
  const [mounted, setMounted] = useState(false);

  // Calculate the actual theme based on system preference if set to "system"
  const actualTheme = 
    typeof window !== "undefined" && theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  // Update the document root classes to reflect the current theme
  useEffect(() => {
    // Avoid hydration mismatch by only running on client side
    setMounted(true);
    
    if (typeof window === "undefined") return;
    
    const root = document.documentElement;
    const currentTheme = root.classList.contains("dark") ? "dark" : "light";
    
    if (currentTheme !== actualTheme) {
      root.classList.remove(currentTheme);
      root.classList.add(actualTheme);
    }

    // Listen for system theme changes if set to "system"
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? "dark" : "light";
        root.classList.remove(newTheme === "dark" ? "light" : "dark");
        root.classList.add(newTheme);
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, actualTheme]);

  // Wrapper function for setTheme that handles local storage and DOM updates
  const setTheme = (newTheme: Theme) => {
    setThemeValue(newTheme);
  };

  return {
    theme,
    setTheme,
    actualTheme,
    // Only return true once mounted to avoid hydration mismatch
    mounted
  };
}

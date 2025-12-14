import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme | undefined;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize to undefined so we don't override the SSR/Script-injected theme
  // until we know for sure what the client preference is.
  const [theme, setThemeState] = useState<Theme | undefined>(() => {
    if (typeof window !== "undefined" && window.__theme) {
      return window.__theme;
    }
    return undefined;
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("theme");
      } catch (e) {}

      // 1. LocalStorage checking
      const local = localStorage.getItem(
        "flexjar-theme-preference",
      ) as Theme | null;
      if (local === "light" || local === "dark") {
        console.log(
          "[ThemeDebug] Effect: Found localStorage preference:",
          local,
        );
        // Only update if different, to avoid loop
        if (local !== theme) setThemeState(local);
        return;
      }

      // 2. System preference checking
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const computed = systemDark ? "dark" : "light";
      console.log("[ThemeDebug] Effect: Fallback to system:", computed);
      // Only update if different
      if (computed !== theme) setThemeState(computed);
    }
  }, []);

  useEffect(() => {
    if (!theme) return; // Don't do anything if theme is undefined

    const root = document.documentElement;
    const body = document.body;

    // Only update if the theme actually changed or is different from attribute
    if (root.getAttribute("data-theme") !== theme) {
      console.log("[ThemeDebug] Effect: Updating DOM attributes to:", theme);
      root.setAttribute("data-theme", theme);
      root.style.colorScheme = theme;
      body.setAttribute("data-theme", theme);
      body.style.colorScheme = theme;
    }

    console.log("[ThemeDebug] Effect: Persisting to localStorage:", theme);
    localStorage.setItem("flexjar-theme-preference", theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      // If undefined, we need to know what the current resolved theme is to toggle.
      // However, typically by the time a user clicks toggle, the effect has run and set a theme.
      // If strictly needed, we could read from DOM or fallback.
      // Fallback: If undefined, assume we are currently properly synced (e.g. via script)
      // so we just toggle based on what we think is there or default to dark -> light.
      // Safer: Default to "dark" if undefined implies we want to go "light"?
      // Or better: read from data-theme attribute if prev is undefined.
      if (!prev) {
        const current = document.documentElement.getAttribute(
          "data-theme",
        ) as Theme;
        return current === "light" ? "dark" : "light";
      }
      return prev === "light" ? "dark" : "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

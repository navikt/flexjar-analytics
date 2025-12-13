import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Server always renders dark mode (matches default HTML attributes)
    // We initialize this to "dark" to ensure hydration matches server HTML.
    const [theme, setThemeState] = useState<Theme>("dark");

    // We add a mounted state to track client-side hydration
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== "undefined") {
            try {
                localStorage.removeItem("theme");
            } catch (e) { }

            // 1. LocalStorage checking
            const local = localStorage.getItem("flexjar-theme-preference") as Theme | null;
            if (local === "light" || local === "dark") {
                console.log("[ThemeDebug] Effect: Found localStorage preference:", local);
                if (local !== theme) setThemeState(local);
                return;
            }

            // 2. System preference checking
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const computed = systemDark ? "dark" : "light";
            console.log("[ThemeDebug] Effect: Fallback to system:", computed);
            if (computed !== theme) setThemeState(computed);
        }
    }, []);

    useEffect(() => {
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
        setThemeState((prev) => (prev === "light" ? "dark" : "light"));
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

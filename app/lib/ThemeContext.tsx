import { createContext } from "react";

type Theme = "dark";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Static dark mode
    return (
        <ThemeContext.Provider value={{ theme: "dark", setTheme: () => { }, resolvedTheme: "dark" }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return { theme: "dark", setTheme: () => { }, resolvedTheme: "dark" } as ThemeContextType;
}

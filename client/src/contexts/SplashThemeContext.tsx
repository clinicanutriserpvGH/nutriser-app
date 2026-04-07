import React, { createContext, useContext, useState } from "react";

type SplashTheme = "dark" | "light";

interface SplashThemeContextType {
  splashTheme: SplashTheme;
  toggleSplashTheme: () => void;
  isLight: boolean;
}

const SplashThemeContext = createContext<SplashThemeContextType | undefined>(undefined);

export function SplashThemeProvider({ children }: { children: React.ReactNode }) {
  const [splashTheme, setSplashTheme] = useState<SplashTheme>(() => {
    const stored = localStorage.getItem("nutriser_splash_theme");
    return (stored as SplashTheme) || "dark";
  });

  const toggleSplashTheme = () => {
    setSplashTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("nutriser_splash_theme", next);
      return next;
    });
  };

  return (
    <SplashThemeContext.Provider value={{ splashTheme, toggleSplashTheme, isLight: splashTheme === "light" }}>
      {children}
    </SplashThemeContext.Provider>
  );
}

export function useSplashTheme() {
  const ctx = useContext(SplashThemeContext);
  if (!ctx) throw new Error("useSplashTheme must be used within SplashThemeProvider");
  return ctx;
}

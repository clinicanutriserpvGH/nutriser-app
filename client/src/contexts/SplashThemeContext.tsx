import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type SplashTheme = "dark" | "light";
type ThemeSource = "auto" | "manual";

interface SplashThemeContextType {
  splashTheme: SplashTheme;
  toggleSplashTheme: () => void;
  resetToAuto: () => void;
  isLight: boolean;
  isAuto: boolean;
}

const SplashThemeContext = createContext<SplashThemeContextType | undefined>(undefined);

/**
 * Determina el tema según la hora local del dispositivo.
 * De 7:00 AM a 6:59 PM → "light" (modo claro, día)
 * De 7:00 PM a 6:59 AM → "dark"  (modo oscuro, noche)
 */
function getThemeByTime(): SplashTheme {
  const hour = new Date().getHours(); // 0–23 hora local del dispositivo
  // Claro: 7 AM (7) hasta antes de 7 PM (19)
  return hour >= 7 && hour < 19 ? "light" : "dark";
}

const STORAGE_KEY = "nutriser_splash_theme";
const SOURCE_KEY = "nutriser_splash_theme_source";

export function SplashThemeProvider({ children }: { children: React.ReactNode }) {
  const [splashTheme, setSplashTheme] = useState<SplashTheme>(() => {
    const source = localStorage.getItem(SOURCE_KEY) as ThemeSource | null;
    if (source === "manual") {
      const stored = localStorage.getItem(STORAGE_KEY) as SplashTheme | null;
      if (stored === "light" || stored === "dark") return stored;
    }
    // Sin preferencia manual → usar hora local
    return getThemeByTime();
  });

  const [isAuto, setIsAuto] = useState<boolean>(() => {
    const source = localStorage.getItem(SOURCE_KEY);
    return source !== "manual";
  });

  // En modo auto: actualizar el tema cada minuto según la hora local
  useEffect(() => {
    if (!isAuto) return;

    // Sincronizar inmediatamente
    setSplashTheme(getThemeByTime());

    // Revisar cada minuto si cambió la hora (para el momento exacto del cambio 7 AM / 7 PM)
    const interval = setInterval(() => {
      setSplashTheme(getThemeByTime());
    }, 60_000); // cada 60 segundos

    return () => clearInterval(interval);
  }, [isAuto]);

  const toggleSplashTheme = useCallback(() => {
    setSplashTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      localStorage.setItem(SOURCE_KEY, "manual");
      return next;
    });
    setIsAuto(false);
  }, []);

  /** Vuelve al modo automático (basado en hora local) */
  const resetToAuto = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(SOURCE_KEY, "auto");
    setIsAuto(true);
    setSplashTheme(getThemeByTime());
  }, []);

  return (
    <SplashThemeContext.Provider
      value={{
        splashTheme,
        toggleSplashTheme,
        resetToAuto,
        isLight: splashTheme === "light",
        isAuto,
      }}
    >
      {children}
    </SplashThemeContext.Provider>
  );
}

export function useSplashTheme() {
  const ctx = useContext(SplashThemeContext);
  if (!ctx) throw new Error("useSplashTheme must be used within SplashThemeProvider");
  return ctx;
}

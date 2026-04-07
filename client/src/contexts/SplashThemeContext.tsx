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

/** Devuelve el tema que corresponde según la hora local del dispositivo.
 *  Modo claro: 06:00 – 18:59  (6am a 7pm)
 *  Modo oscuro: 19:00 – 05:59 (7pm a 6am)
 */
function getAutoTheme(): SplashTheme {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 19 ? "light" : "dark";
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
    // Sin preferencia manual → usar detección automática
    return getAutoTheme();
  });

  const [isAuto, setIsAuto] = useState<boolean>(() => {
    const source = localStorage.getItem(SOURCE_KEY);
    return source !== "manual";
  });

  // Actualizar automáticamente cada minuto por si cambia la hora
  useEffect(() => {
    if (!isAuto) return;

    const tick = () => {
      const auto = getAutoTheme();
      setSplashTheme(auto);
    };

    // Calcular ms hasta el próximo minuto para sincronizar el intervalo
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      tick();
      const interval = setInterval(tick, 60_000);
      return () => clearInterval(interval);
    }, msToNextMinute);

    return () => clearTimeout(timeout);
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

  /** Vuelve al modo automático por horario */
  const resetToAuto = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(SOURCE_KEY, "auto");
    setIsAuto(true);
    setSplashTheme(getAutoTheme());
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

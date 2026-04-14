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

/** Devuelve el tema del sistema operativo del dispositivo.
 *  Si el sistema está en modo oscuro → "dark"
 *  Si el sistema está en modo claro → "light"
 */
function getSystemTheme(): SplashTheme {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
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
    // Sin preferencia manual → usar tema del sistema operativo
    return getSystemTheme();
  });

  const [isAuto, setIsAuto] = useState<boolean>(() => {
    const source = localStorage.getItem(SOURCE_KEY);
    return source !== "manual";
  });

  // Escuchar cambios en el tema del sistema operativo en tiempo real
  useEffect(() => {
    if (!isAuto) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSplashTheme(e.matches ? "dark" : "light");
    };

    // Sincronizar inmediatamente con el estado actual del sistema
    setSplashTheme(mediaQuery.matches ? "dark" : "light");

    // Escuchar cambios futuros
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
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

  /** Vuelve al modo automático (tema del sistema) */
  const resetToAuto = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(SOURCE_KEY, "auto");
    setIsAuto(true);
    setSplashTheme(getSystemTheme());
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

import { createContext, useContext } from "react";

interface SplashContextValue {
  showSplash: () => void;   // volver al Splash 0
  showSplash1: () => void;  // volver al Splash 1
}

export const SplashContext = createContext<SplashContextValue>({
  showSplash: () => {},
  showSplash1: () => {},
});

export function useSplash() {
  return useContext(SplashContext);
}

import { createContext, useContext } from "react";

interface SplashContextValue {
  showSplash: () => void;
}

export const SplashContext = createContext<SplashContextValue>({
  showSplash: () => {},
});

export function useSplash() {
  return useContext(SplashContext);
}

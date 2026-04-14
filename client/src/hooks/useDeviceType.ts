/**
 * useDeviceType — hook para detectar si el usuario está en desktop o móvil/tableta
 * Desktop: computadora/laptop/Mac → NO tiene acceso a splashes
 * Mobile/Tablet: celular/tableta → tiene acceso a splashes (PWA)
 */
import { useMemo } from "react";

function detectIsDesktop(): boolean {
  if (typeof window === "undefined") return true;
  const ua = navigator.userAgent;
  const isMobileOrTablet = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|touch/i.test(ua);
  const isLargeScreen = window.innerWidth >= 1024;
  const hasTouchScreen = navigator.maxTouchPoints > 0;
  if (isMobileOrTablet) return false;
  if (hasTouchScreen && !isLargeScreen) return false;
  return true;
}

export function useDeviceType() {
  const isDesktop = useMemo(() => detectIsDesktop(), []);
  return { isDesktop, isMobile: !isDesktop };
}

/** Función estática (no hook) para usar fuera de componentes React */
export function isDesktopDevice(): boolean {
  return detectIsDesktop();
}

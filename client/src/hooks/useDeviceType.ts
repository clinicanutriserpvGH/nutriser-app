/**
 * useDeviceType — hook para detectar si el usuario está en desktop o móvil/tableta
 * Desktop: computadora/laptop/Mac (sin pantalla táctil) → NO tiene acceso a splashes
 * Mobile/Tablet: celular/tableta/iPad → tiene acceso a splashes (PWA)
 *
 * NOTA IMPORTANTE: iPadOS 13+ reporta "Macintosh" en el user-agent,
 * por lo que debemos usar navigator.maxTouchPoints para detectar iPads modernos.
 */
import { useMemo } from "react";

function detectIsDesktop(): boolean {
  if (typeof window === "undefined") return true;
  const ua = navigator.userAgent;

  // 1. Detección directa por user-agent (celulares y tabletas antiguas)
  const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
  if (isMobileUA) return false;

  // 2. Detección de iPad explícito en user-agent (iPadOS < 13)
  const isIPadUA = /ipad/i.test(ua);
  if (isIPadUA) return false;

  // 3. Detección de tabletas genéricas por user-agent
  const isTabletUA = /tablet|kindle|silk|playbook/i.test(ua);
  if (isTabletUA) return false;

  // 4. Detección de iPad moderno (iPadOS 13+): reporta "Macintosh" pero tiene touch
  //    Los Macs reales con trackpad reportan maxTouchPoints = 0 o 1
  //    Los iPads reportan maxTouchPoints >= 2 (multi-touch)
  const isMacUA = /macintosh/i.test(ua);
  const hasTouchScreen = navigator.maxTouchPoints > 1;
  if (isMacUA && hasTouchScreen) return false;

  // 5. Detección por pantalla táctil + tamaño pequeño (otros dispositivos táctiles)
  const isSmallScreen = window.innerWidth < 1024;
  if (hasTouchScreen && isSmallScreen) return false;

  // 6. Android tablets que no incluyen "mobile" en el UA pero sí "android"
  const isAndroid = /android/i.test(ua);
  if (isAndroid) return false;

  // Si nada de lo anterior aplica, es desktop
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

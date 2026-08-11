export const MOBILE_REDIRECT_URL = "https://portaldesaludnutriser.club";

const MOBILE_OR_TABLET_USER_AGENT = /android|webos|iphone|ipod|ipad|iemobile|opera mini|mobile|tablet|kindle|silk|playbook/i;
const STATIC_FILE_EXTENSION = /\.(?:css|js|mjs|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|mp4|webm|mov|pdf|xml|txt|json)(?:$|\?)/i;

export interface MobileRedirectRequest {
  userAgent?: string;
  secChUaMobile?: string;
  path: string;
}

export function isMobileOrTablet({ userAgent = "", secChUaMobile = "" }: Pick<MobileRedirectRequest, "userAgent" | "secChUaMobile">): boolean {
  return secChUaMobile.trim() === "?1" || MOBILE_OR_TABLET_USER_AGENT.test(userAgent);
}

export function shouldRedirectMobileRequest({ userAgent, secChUaMobile, path }: MobileRedirectRequest): boolean {
  if (!isMobileOrTablet({ userAgent, secChUaMobile })) return false;

  const pathname = `/${path.replace(/^\/+/, "").split("?", 1)[0] || ""}`;

  // Nunca redirigir APIs, almacenamiento ni archivos necesarios para solicitudes internas.
  if (pathname === "/api" || pathname.startsWith("/api/")) return false;
  if (pathname === "/manus-storage" || pathname.startsWith("/manus-storage/")) return false;
  if (STATIC_FILE_EXTENSION.test(pathname)) return false;

  return true;
}

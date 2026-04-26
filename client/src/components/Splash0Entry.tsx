/*
 * Splash0Entry — Pantalla de entrada principal (único splash)
 * Solo para móvil/tablet (PC va directo al sitio web)
 * Grid de 3 tarjetas:
 *   - Tienda Nutriser → /memberships
 *   - Academia Nutriser → /cursos
 *   - Portal de Salud Nutriser → app externa
 * En móvil: apilado vertical
 * En tablet/desktop: 3 columnas iguales
 * Nota: la misma cuenta de paciente funciona para Shop y Academy.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingBag, CalendarCheck, Moon, Sun } from "lucide-react";
import { useSplashTheme } from "@/contexts/SplashThemeContext";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const CLINIC_SHOP_IMG =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663459263490/wrAlJInZiLZvEqGh.png";
const IMG_ACADEMY =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-academy-hub-v2-B6bpVdHqtSSKFqZdAvvqyS.webp";
const PORTAL_IMG =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663459263490/MFJTqCeAfeXYamlP.png";
const NUTRISER_ICON =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-silhouette-icon_f9345ac8.png";

interface Splash0EntryProps {
  onEnterNutriserWeb: () => void; // conservado por compatibilidad (ya no se usa en el flujo)
  onGoToWebsite?: () => void;     // sitio web — solo para PC (oculto en splash)
  onNavigate?: (path: string) => void; // → navegar a ruta interna
}

export default function Splash0Entry({ onEnterNutriserWeb, onGoToWebsite, onNavigate }: Splash0EntryProps) {
  const [leaving, setLeaving] = useState(false);
  // Detectar orientación: landscape = tarjetas lado a lado, portrait = apiladas
  const [isLandscape, setIsLandscape] = useState(
    () => typeof window !== 'undefined' && window.innerWidth > window.innerHeight
  );
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  const { isLight, isAuto, toggleSplashTheme, resetToAuto } = useSplashTheme();
  const bg = isLight
    ? "linear-gradient(160deg, #FAF7F2 0%, #F5EFE4 50%, #FAF7F2 100%)"
    : "linear-gradient(160deg, #0f0f0f 0%, #1a1208 50%, #0f0f0f 100%)";

  const handleNavigate = (path: string) => {
    setLeaving(true);
    setTimeout(() => {
      if (onNavigate) onNavigate(path);
      else window.location.href = path;
    }, 200);
  };

  // Portal de Salud → app externa
  const handlePortalSalud = () => {
    setLeaving(true);
    setTimeout(() => {
      window.location.href = "https://portaldesaludnutriser.club";
    }, 200);
  };

  // Secret admin access: long-press 3 seconds on logo to open admin panel
  const logoLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [logoHoldProgress, setLogoHoldProgress] = useState(0);
  const logoHoldInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLogoLongPress = useCallback(() => {
    setLogoHoldProgress(0);
    logoHoldInterval.current = setInterval(() => {
      setLogoHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(logoHoldInterval.current!);
          return 100;
        }
        return prev + (100 / 30); // 30 ticks en 3 segundos (100ms cada tick)
      });
    }, 100);
    logoLongPressTimer.current = setTimeout(() => {
      clearInterval(logoHoldInterval.current!);
      setLogoHoldProgress(0);
      handleNavigate("/admin/login");
    }, 3000);
  }, []);

  const cancelLogoLongPress = useCallback(() => {
    if (logoLongPressTimer.current) clearTimeout(logoLongPressTimer.current);
    if (logoHoldInterval.current) clearInterval(logoHoldInterval.current);
    setLogoHoldProgress(0);
  }, []);

  // Secret website access: long-press 3 seconds on header text
  const webLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startWebLongPress = useCallback(() => {
    webLongPressTimer.current = setTimeout(() => {
      if (onGoToWebsite) onGoToWebsite();
      else if (onEnterNutriserWeb) onEnterNutriserWeb();
    }, 3000);
  }, [onGoToWebsite, onEnterNutriserWeb]);

  const cancelWebLongPress = useCallback(() => {
    if (webLongPressTimer.current) clearTimeout(webLongPressTimer.current);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-x-hidden overflow-y-auto transition-all duration-500"
      style={{
        background: bg,
        opacity: leaving ? 0 : 1,
        transition: leaving ? "opacity 0.4s ease" : "background 0.5s ease",
      }}
    >
      <div
        className="h-screen w-full flex flex-col items-center px-3 sm:px-4 md:px-6 lg:px-12 xl:px-16 box-border overflow-y-auto"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px) + 12px, 20px)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 8px, 16px)",
        }}
      >
        <div className="w-full max-w-[480px] sm:max-w-[600px] md:max-w-[900px] lg:max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] flex flex-col" style={{ minHeight: '100%' }}>

          {/* ── Header ── */}
          <div className={`flex items-center gap-3 mb-3 md:mb-4 px-3 py-2.5 rounded-2xl transition-all duration-500 ${
            isLight ? "bg-[#2a1f0a]/90 shadow-lg shadow-[#C5A55A]/10" : "bg-transparent"
          }`}>
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onMouseDown={startLogoLongPress}
                onMouseUp={cancelLogoLongPress}
                onMouseLeave={cancelLogoLongPress}
                onTouchStart={startLogoLongPress}
                onTouchEnd={cancelLogoLongPress}
                onTouchCancel={cancelLogoLongPress}
                onClick={e => e.preventDefault()}
                className="block cursor-pointer focus:outline-none relative select-none"
                aria-label="Nutriser"
                style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
              >
                <img src={LOGO_URL} alt="Nutriser" className="relative w-11 h-11 md:w-14 md:h-14 object-contain" loading="eager" fetchPriority="high" />
                {logoHoldProgress > 0 && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="22" cy="22" r="20" fill="none" stroke="#C5A55A" strokeWidth="2.5"
                      strokeDasharray={`${(logoHoldProgress / 100) * 125.6} 125.6`}
                      strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.1s linear' }}
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="w-px h-10 bg-[#C5A55A]/50 flex-shrink-0" />
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <button
                type="button"
                onMouseDown={startWebLongPress}
                onMouseUp={cancelWebLongPress}
                onMouseLeave={cancelWebLongPress}
                onTouchStart={startWebLongPress}
                onTouchEnd={cancelWebLongPress}
                onTouchCancel={cancelWebLongPress}
                onClick={e => e.preventDefault()}
                className="text-left cursor-pointer focus:outline-none"
                title="Nutriser"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', userSelect: 'none', WebkitTouchCallout: 'none' } as React.CSSProperties}
              >
                <p className="text-[#C5A55A] text-[9px] md:text-[11px] tracking-[0.25em] uppercase font-light leading-tight hover:text-[#E8C97A] transition-colors">
                  Aesthetic &amp; Nutrition
                </p>
              </button>
              <h1 className="text-white text-xs md:text-sm font-semibold tracking-wider uppercase leading-tight mt-0.5">
                Bienvenido a Nutriser
              </h1>
            </div>

          </div>

          {/* ── Grid principal — portrait: columna vertical | landscape: fila horizontal ── */}
          <div
            className="gap-3 mb-3"
            style={{ display: 'flex', flexDirection: isLandscape ? 'row' : 'column', flex: 1, minHeight: 0 }}
          >

            {/* ── Tarjeta 3: Portal de Salud Nutriser ── */}
            <div style={{ flex: isLandscape ? '6' : '1', minHeight: isLandscape ? '0' : '160px' }}>
              <button
                type="button"
                onClick={handlePortalSalud}
                className="group relative w-full rounded-3xl overflow-hidden focus:outline-none h-full cursor-pointer"
                style={{ minHeight: "150px", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                <img
                  src={PORTAL_IMG}
                  alt="Portal de Salud Nutriser"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                  style={{ objectPosition: "center 30%" }}
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80 pointer-events-none" />
                <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 md:p-6 text-left pointer-events-none">
                  {/* Fila superior: badge App Pacientes */}
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'rgba(0,0,0,0.75)', border: '2px solid rgba(197,165,90,0.9)', backdropFilter: 'blur(6px)' }}>
                      <img
                        src={NUTRISER_ICON}
                        alt="Nutriser"
                        className="w-5 h-5 md:w-6 md:h-6 object-contain"
                      />
                    </div>
                    <span className="text-[11px] md:text-xs font-bold tracking-widest uppercase text-[#E8C97A]" style={{ textShadow: '0 1px 6px rgba(0,0,0,1), 0 0 16px rgba(0,0,0,1)', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '6px' }}>
                      App Pacientes
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-2 md:mb-3 drop-shadow-lg text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)' }}>
                      Portal de Salud<br />Nutriser
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm md:text-sm font-bold tracking-wide shadow-lg transition-all duration-200 group-hover:scale-105 bg-white/20 backdrop-blur-sm text-white border border-white/40">
                      Mi Asesoría Nutricional
                    </span>
                  </div>
                </div>
              </button>
            </div>



            {/* ── Tarjeta 1: Tienda Nutriser ── */}
            <div style={{ flex: isLandscape ? '6' : '1', minHeight: isLandscape ? '0' : '160px' }}>
              <button
                type="button"
                onClick={() => handleNavigate('/memberships')}
                className="group relative w-full rounded-3xl overflow-hidden focus:outline-none h-full cursor-pointer"
                style={{ minHeight: "150px", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                <img
                  src={CLINIC_SHOP_IMG}
                  alt="Tienda Nutriser"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                  style={{ objectPosition: "center 40%" }}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/85 pointer-events-none" />
                <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 md:p-6 text-left pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-[#C5A55A]">
                      <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-black" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold tracking-wide uppercase text-white" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.9)' }}>Tienda Nutriser</span>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold leading-tight mb-0.5 md:mb-1 text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)' }}>
                      Tienda en Línea
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl font-semibold text-[#C5A55A] mb-2 md:mb-3" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>Nutriser</p>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm md:text-sm font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 bg-[#C5A55A] text-black">
                      <ShoppingBag className="w-3.5 h-3.5" /> Visitar
                    </span>
                  </div>
                </div>
              </button>
            </div>


            {/* Academia Nutriser: eliminada del splash. Solo aparece en PC vía menú de navegación */}


          </div>{/* fin grid principal */}

          {/* ── Íconos de redes sociales + Agendar Cita ── */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-6 mb-3 md:mb-4 mt-1 flex-nowrap w-full overflow-x-auto px-1">

            {/* Agendar Cita */}
            <a
              href="/appointment-form"
              onClick={e => { e.preventDefault(); handleNavigate('/appointment-form'); }}
              className="flex flex-col items-center gap-1 group flex-shrink-0"
              aria-label="Agendar Cita"
            >
              <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-200"
                style={isLight
                  ? { background: 'linear-gradient(145deg, #C5A55A 0%, #d4b46a 100%)', border: '1px solid rgba(197,165,90,0.6)' }
                  : { background: 'linear-gradient(145deg, #C5A55A 0%, #d4b46a 100%)', border: '1px solid rgba(197,165,90,0.6)' }}>
                <CalendarCheck className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-black" />
              </div>
              <span className={`text-[9px] sm:text-[10px] md:text-xs font-medium text-center leading-tight ${isLight ? 'text-[#9a8050]' : 'text-[#C5A55A]/80'}`}>Agendar<br/>Cita</span>
            </a>

            {/* WhatsApp — botón dorado brillante */}
            <a href="https://wa.me/523221007799?text=Hola%2C%20me%20interesa%20agendar%20una%20valoraci%C3%B3n%20en%20Nutriser" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group flex-shrink-0" aria-label="WhatsApp Nutriser">
              <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 active:scale-95"
                style={{
                  background: 'linear-gradient(145deg, #C5A55A 0%, #E8C97A 50%, #C5A55A 100%)',
                  boxShadow: '0 0 12px rgba(197,165,90,0.8), 0 0 24px rgba(197,165,90,0.5), 0 0 40px rgba(197,165,90,0.3)',
                  border: '1px solid rgba(232,201,122,0.6)'
                }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-[#1A1A1A]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-[#C5A55A]">WhatsApp</span>
            </a>

            {/* Instagram */}
            <a href="https://instagram.com/nutriserpv" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group flex-shrink-0" aria-label="Instagram @nutriserpv">
              <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-200"
                style={isLight
                  ? { background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)' }
                  : { background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)' }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ fill: isLight ? '#7a6030' : 'white' }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <span className={`text-[9px] sm:text-[10px] md:text-xs font-medium ${isLight ? 'text-[#9a8050]' : 'text-[#C5A55A]/80'}`}>Instagram</span>
            </a>

            {/* Facebook */}
            <a href="https://facebook.com/nutriserpv" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group flex-shrink-0" aria-label="Facebook @nutriserpv">
              <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-200"
                style={isLight
                  ? { background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)' }
                  : { background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)' }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ fill: isLight ? '#7a6030' : 'white' }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span className={`text-[9px] sm:text-[10px] md:text-xs font-medium ${isLight ? 'text-[#9a8050]' : 'text-[#C5A55A]/80'}`}>Facebook</span>
            </a>

            {/* Correo */}
            <a
              href="https://mail.google.com/mail/?view=cm&to=clinicanutriserpv@gmail.com&su=Consulta+Nutriser"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group flex-shrink-0" aria-label="Enviar correo a Nutriser">
              <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-200"
                style={isLight
                  ? { background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)' }
                  : { background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)' }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ fill: isLight ? '#7a6030' : 'white' }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <span className={`text-[9px] sm:text-[10px] md:text-xs font-medium ${isLight ? 'text-[#9a8050]' : 'text-[#C5A55A]/80'}`}>Correo</span>
            </a>

            {/* Ubicación */}
            <a href="https://maps.google.com/?q=Nutriser+Aesthetic+%26+Nutrition+Puerto+Vallarta"
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group flex-shrink-0" aria-label="Cómo llegar a Nutriser">
              <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-200"
                style={isLight
                  ? { background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)' }
                  : { background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)' }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ fill: isLight ? '#7a6030' : 'white' }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span className={`text-[9px] sm:text-[10px] md:text-xs font-medium ${isLight ? 'text-[#9a8050]' : 'text-[#C5A55A]/80'}`}>Ubicación</span>
            </a>

          </div>

          {/* ── Pie ── */}
          <div className="flex items-center justify-between mt-1 md:mt-2">
            <p className={`text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-center flex-1 ${isLight ? "text-[#9a8050]/40" : "text-white/20"}`}>
              Nutriser Aesthetic &amp; Nutrition
            </p>
            {/* Toggle discreto modo claro/oscuro */}
            <div className="flex flex-col items-end gap-0.5">
              <button
                onClick={toggleSplashTheme}
                aria-label={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] transition-all duration-300 ${
                  isLight ? "text-[#9a8050]/50 hover:text-[#7a6030]" : "text-white/20 hover:text-white/50"
                }`}
              >
                {isLight ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                <span className="tracking-wide">{isLight ? "Claro" : "Oscuro"}</span>
                <span className={`relative inline-block w-6 h-3 rounded-full transition-colors duration-300 flex-shrink-0 ${
                  isLight ? "bg-[#C5A55A]/50" : "bg-white/15"
                }`}>
                  <span className={`absolute top-0.5 w-2 h-2 rounded-full bg-white/70 shadow transition-transform duration-300 ${
                    isLight ? "translate-x-3" : "translate-x-0.5"
                  }`} />
                </span>
              </button>
              {isAuto ? (
                <span className={`text-[8px] pr-1 ${isLight ? "text-[#9a8050]/30" : "text-white/15"}`}>auto</span>
              ) : (
                <button
                  onClick={resetToAuto}
                  className={`text-[8px] pr-1 underline underline-offset-1 transition-colors ${
                    isLight ? "text-[#9a8050]/40 hover:text-[#7a6030]" : "text-white/20 hover:text-white/50"
                  }`}
                >
                  auto
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

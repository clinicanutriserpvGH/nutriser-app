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
import { ShoppingBag, CalendarCheck, Moon, Sun, Wallet } from "lucide-react";
import { useSplashTheme } from "@/contexts/SplashThemeContext";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const CLINIC_SHOP_IMG =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663459263490/wrAlJInZiLZvEqGh.png";
const IMG_ACADEMY =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-academy-hub-v2-B6bpVdHqtSSKFqZdAvvqyS.webp";
const PORTAL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/portal-salud-celular-logo-original-2q2xZLeMp5j2VFQbjkrBYg.webp";
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

  // Secret admin access: long-press 3 seconds on footer text to open admin panel
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
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/40 pointer-events-none" />
                <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 md:p-6 text-left pointer-events-none">
                  {/* Fila superior: badge Portal de Salud Nutriser */}
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'rgba(0,0,0,0.75)', border: '2px solid rgba(197,165,90,0.9)', backdropFilter: 'blur(6px)' }}>
                      <img
                        src={NUTRISER_ICON}
                        alt="Nutriser"
                        className="w-5 h-5 md:w-6 md:h-6 object-contain"
                      />
                    </div>
                    <span className="text-[11px] md:text-xs font-bold tracking-widest uppercase text-[#E8C97A]" style={{ textShadow: '0 1px 6px rgba(0,0,0,1), 0 0 16px rgba(0,0,0,1)', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '6px' }}>
                      Portal de Salud Nutriser
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight mb-2 md:mb-3 drop-shadow-lg text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)' }}>
                      Consulta tu plan, avances,<br />mediciones y seguimiento
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm md:text-sm font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 text-black" style={{
                        background: 'linear-gradient(145deg, #C5A55A 0%, #E8C97A 50%, #C5A55A 100%)',
                        boxShadow: '0 0 12px rgba(197,165,90,0.9), 0 0 24px rgba(197,165,90,0.6), 0 0 40px rgba(197,165,90,0.3)',
                        border: '1px solid rgba(232,201,122,0.7)'
                      }}>
                      Entrar a mi Portal
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
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50 pointer-events-none" />
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
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm md:text-sm font-bold tracking-wide uppercase transition-all duration-200 group-hover:scale-105 text-black"
                      style={{
                        background: 'linear-gradient(145deg, #C5A55A 0%, #E8C97A 50%, #C5A55A 100%)',
                        boxShadow: '0 0 12px rgba(197,165,90,0.9), 0 0 24px rgba(197,165,90,0.6), 0 0 40px rgba(197,165,90,0.3)',
                        border: '1px solid rgba(232,201,122,0.7)'
                      }}>
                      <ShoppingBag className="w-3.5 h-3.5" /> Visitar
                    </span>
                  </div>
                </div>
              </button>
            </div>


            {/* Academia Nutriser: eliminada del splash. Solo aparece en PC vía menú de navegación */}


          </div>{/* fin grid principal */}

          {/* ── Barra de ayuda: ¿Necesitas ayuda? ── */}
          <div className="flex flex-col items-center gap-3 mt-4 md:mt-6 mb-2">
            <p className={`text-xs md:text-sm font-medium tracking-wide ${isLight ? 'text-[#7a6030]' : 'text-white/60'}`}>─── ¿Necesitas ayuda? ───</p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap px-2 w-full">
              {/* WhatsApp */}
              <a
                href="https://wa.me/523221007799?text=Hola%2C%20me%20interesa%20agendar%20una%20valoraci%C3%B3n%20en%20Nutriser"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A55A]/40 hover:border-[#C5A55A]/80 hover:bg-[#C5A55A]/10 transition-all duration-300"
                aria-label="WhatsApp Nutriser"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: '#C5A55A' }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-xs md:text-sm font-medium text-[#C5A55A]">WhatsApp</span>
              </a>

              {/* Agendar cita */}
              <a
                href="/appointment-form"
                onClick={e => { e.preventDefault(); handleNavigate('/appointment-form'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A55A]/40 hover:border-[#C5A55A]/80 hover:bg-[#C5A55A]/10 transition-all duration-300"
                aria-label="Agendar Cita"
              >
                <CalendarCheck className="w-4 h-4" style={{ color: '#C5A55A' }} />
                <span className="text-xs md:text-sm font-medium text-[#C5A55A]">Agendar cita</span>
              </a>

              {/* Mi monedero */}
              <a
                href="#"
                onClick={e => { e.preventDefault(); handleNavigate('/monedero?fromSplash=true'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A55A]/40 hover:border-[#C5A55A]/80 hover:bg-[#C5A55A]/10 transition-all duration-300"
                aria-label="Mi Monedero"
              >
                <Wallet className="w-4 h-4" style={{ color: '#C5A55A' }} />
                <span className="text-xs md:text-sm font-medium text-[#C5A55A]">Mi monedero</span>
              </a>
            </div>
          </div>




          {/* ── Pie con acceso admin ── */}
          <div className="flex items-center justify-between mt-1 md:mt-2">
            <button
              type="button"
              onMouseDown={startLogoLongPress}
              onMouseUp={cancelLogoLongPress}
              onMouseLeave={cancelLogoLongPress}
              onTouchStart={startLogoLongPress}
              onTouchEnd={cancelLogoLongPress}
              onTouchCancel={cancelLogoLongPress}
              onClick={e => e.preventDefault()}
              className="relative cursor-pointer focus:outline-none select-none flex-1 transition-all duration-300"
              aria-label="Nutriser - Presiona 3 segundos para acceso admin"
              style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
            >
              <p className={`text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-center ${isLight ? "text-[#9a8050]/40 hover:text-[#7a6030]/60" : "text-white/20 hover:text-white/40"} transition-colors`}>
                Nutriser Aesthetic &amp; Nutrition
              </p>
              {logoHoldProgress > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 10" style={{ transform: 'scaleX(-1)' }}>
                  <line x1="0" y1="5" x2={logoHoldProgress} y2="5" stroke="#C5A55A" strokeWidth="1" opacity="0.6" />
                </svg>
              )}
            </button>
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

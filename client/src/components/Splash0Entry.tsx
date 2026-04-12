/*
 * Splash0Entry — Pantalla de entrada principal
 * Muestra dos opciones: "Nutriser Web" (→ Splash 1) y "Portal Salud" (→ portal externo)
 * Mismo diseño de tarjetas que SplashSelector (Splash 1)
 */
import { useState } from "react";
import { Globe, HeartPulse, Utensils, Camera, ClipboardList, PauseCircle, ShoppingCart, BookOpen, Ruler, Repeat2 } from "lucide-react";
import { useSplashTheme } from "@/contexts/SplashThemeContext";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const CLINIC_IMG2 =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-imac-web-T2sERsyMxZB3iGgxpbi7eW.webp";
const PORTAL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-portal-salud-v2_e87113cf.png";
const NUTRISER_ICON =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-silhouette-icon_f9345ac8.png";

interface Splash0EntryProps {
  onEnterNutriserWeb: () => void; // → muestra Splash 1
}

export default function Splash0Entry({ onEnterNutriserWeb }: Splash0EntryProps) {
  const [leaving, setLeaving] = useState(false);
  const { isLight } = useSplashTheme();

  const bg = isLight
    ? "linear-gradient(160deg, #FAF7F2 0%, #F5EFE4 50%, #FAF7F2 100%)"
    : "linear-gradient(160deg, #0f0f0f 0%, #1a1208 50%, #0f0f0f 100%)";

  const handleNutriserWeb = () => {
    setLeaving(true);
    setTimeout(() => onEnterNutriserWeb(), 400);
  };

  const handlePortalSalud = () => {
    setLeaving(true);
    setTimeout(() => {
      window.location.href = "https://portaldesaludnutriser.club";
    }, 400);
  };

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
        className="min-h-full w-full flex flex-col items-center px-3 sm:px-4 md:px-6 box-border"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px) + 16px, 24px)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 8px, 16px)",
        }}
      >
        <div className="w-full max-w-[480px] sm:max-w-[580px] md:max-w-[700px]">

          {/* ── Header ── */}
          <div className={`flex items-center gap-3 mb-6 px-3 py-2.5 rounded-2xl transition-all duration-500 ${
            isLight ? "bg-[#2a1f0a]/90 shadow-lg shadow-[#C5A55A]/10" : "bg-transparent"
          }`}>
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-[#C5A55A]/30 blur-lg scale-150" />
              <img src={LOGO_URL} alt="Nutriser" className="relative w-12 h-12 object-contain" />
            </div>
            <div className="w-px h-10 bg-[#C5A55A]/50 flex-shrink-0" />
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <p className="text-[#C5A55A] text-[9px] tracking-[0.25em] uppercase font-light leading-tight">
                Aesthetic &amp; Nutrition
              </p>
              <h1 className="text-white text-xs font-semibold tracking-wider uppercase leading-tight mt-0.5">
                Soy Nutriser y Vivo Mejor
              </h1>
            </div>
          </div>

          {/* ── Tarjeta 1: Nutriser Web ── */}
          <div className="mb-3">
            <button
              onClick={handleNutriserWeb}
              className="group relative w-full rounded-3xl overflow-hidden focus:outline-none"
              style={{ minHeight: "180px" }}
            >
              <img
                src={CLINIC_IMG2}
                alt="Nutriser Web"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ objectPosition: "center center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
              <div className="relative flex flex-col justify-between p-4 text-left" style={{ minHeight: "180px" }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-[#C5A55A]">
                    <Globe className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide uppercase drop-shadow text-white/90">
                    Sitio Web
                  </span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-3 drop-shadow-lg text-white">
                    Nutriser Web
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 bg-[#C5A55A] text-black">
                    Entrar
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* ── Tarjeta 2: Portal de Salud (mismo diseño que en Splash 1) ── */}
          <div className="mb-4">
            <button
              onClick={handlePortalSalud}
              className="group relative w-full rounded-3xl overflow-hidden focus:outline-none"
              style={{ minHeight: "180px" }}
            >
              <img
                src={PORTAL_IMG}
                alt="Portal de Salud Nutriser"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/80" />
              <div className="relative flex flex-col justify-between p-4 text-left" style={{ minHeight: "180px" }}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden ${isLight ? "bg-[#C5A55A]/20" : "bg-black/30 backdrop-blur-sm"}`}>
                    <img
                      src={NUTRISER_ICON}
                      alt="Nutriser"
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide uppercase drop-shadow text-white/90">
                    App Pacientes
                  </span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-1.5 drop-shadow-lg text-white">
                    Portal de Salud Nutriser
                  </h2>
                  <div className="grid grid-cols-4 gap-x-2 gap-y-3 mb-3 w-full">
                    {[
                      { icon: Utensils, label: "Mi Dieta" },
                      { icon: Camera, label: "Scan Food" },
                      { icon: ClipboardList, label: "Detonantes" },
                      { icon: PauseCircle, label: "Pausa" },
                      { icon: ShoppingCart, label: "Lista Súper" },
                      { icon: BookOpen, label: "Recetario" },
                      { icon: Ruler, label: "Mediciones" },
                      { icon: Repeat2, label: "Hábitos" },
                    ].map(({ icon: Ic, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full border flex items-center justify-center bg-black/40 backdrop-blur-sm border-white/30">
                          <Ic className="w-4 h-4 text-[#C5A55A]" />
                        </div>
                        <span className="text-[8px] font-medium leading-tight text-center w-full text-white/80">{label}</span>
                      </div>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 mt-1 bg-white/20 backdrop-blur-sm text-white border border-white/40">
                    Acceder / Crear Cuenta
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* ── Pie ── */}
          <p className={`text-center text-[9px] tracking-[0.2em] uppercase mt-2 ${isLight ? "text-[#9a8050]/40" : "text-white/20"}`}>
            Nutriser Aesthetic &amp; Nutrition · Puerto Vallarta
          </p>

        </div>
      </div>
    </div>
  );
}

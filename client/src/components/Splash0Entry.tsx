/*
 * Splash0Entry — Pantalla de entrada principal
 * Muestra dos opciones: "Nutriser Web" (→ Splash 1) y "Portal Salud" (→ portal externo)
 * Mismo diseño de tarjetas que SplashSelector (Splash 1)
 */
import { useState } from "react";
import { Home, Utensils, Camera, ClipboardList, PauseCircle, ShoppingCart, BookOpen, Ruler, Repeat2, Sparkles, CalendarCheck, Moon, Sun, Lock } from "lucide-react";
import { useSplashTheme } from "@/contexts/SplashThemeContext";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const CLINIC_IMG2 =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-reception-new_959bc342.png";
const PORTAL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-portal-salud-v2_e87113cf.png";
const NUTRISER_ICON =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-silhouette-icon_f9345ac8.png";

interface Splash0EntryProps {
  onEnterNutriserWeb: () => void; // → muestra Splash 1
}

export default function Splash0Entry({ onEnterNutriserWeb }: Splash0EntryProps) {
  const [leaving, setLeaving] = useState(false);
  const { isLight, isAuto, toggleSplashTheme, resetToAuto } = useSplashTheme();

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
        className="min-h-screen w-full flex flex-col items-center justify-center px-3 sm:px-4 md:px-8 lg:px-12 xl:px-16 box-border"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px) + 16px, 24px)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 8px, 24px)",
        }}
      >
        <div className="w-full max-w-[480px] sm:max-w-[600px] md:max-w-[780px] lg:max-w-[1100px] xl:max-w-[1300px] 2xl:max-w-[1500px]">

          {/* ── Header ── */}
          <div className={`flex items-center gap-3 mb-5 px-3 py-2.5 rounded-2xl transition-all duration-500 ${
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

          {/* ── Tarjetas: Nutriser Home + Portal Salud ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 mb-5">

            {/* Tarjeta 1: Nutriser Home */}
            <button
              onClick={handleNutriserWeb}
              className="group relative w-full rounded-3xl overflow-hidden focus:outline-none"
              style={{ minHeight: "220px", aspectRatio: "16/9" }}
            >
              <img
                src={CLINIC_IMG2}
                alt="Nutriser Home"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ objectPosition: "center center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/85" />
              {/* Contenido: badge arriba, título+botón ABAJO */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 text-left">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-[#C5A55A]">
                    <Home className="w-4 h-4 text-black" />
                  </div>

                </div>
                {/* Título y botón siempre abajo */}
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 drop-shadow-lg text-white">
                    Nutriser Home
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 bg-[#C5A55A] text-black">
                    Entrar
                  </span>
                </div>
              </div>
            </button>

            {/* Tarjeta 2: Portal de Salud */}
            <button
              onClick={handlePortalSalud}
              className="group relative w-full rounded-3xl overflow-hidden focus:outline-none"
              style={{ minHeight: "220px", aspectRatio: "16/9" }}
            >
              <img
                src={PORTAL_IMG}
                alt="Portal de Salud Nutriser"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/85" />
              <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'rgba(0,0,0,0.45)', border: '1.5px solid rgba(197,165,90,0.6)', backdropFilter: 'blur(4px)' }}>
                    <img
                      src={NUTRISER_ICON}
                      alt="Nutriser"
                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#C5A55A]" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                    App Pacientes
                  </span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-2 drop-shadow-lg text-white">
                    Portal de Salud Nutriser
                  </h2>
                  {/* Íconos — solo visibles en pantallas más grandes */}
                  <div className="hidden sm:grid grid-cols-4 gap-x-2 gap-y-1.5 mb-3 w-full">
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
                      <div key={label} className="flex flex-col items-center gap-0.5">
                        <div className="w-8 h-8 rounded-full border flex items-center justify-center bg-black/40 backdrop-blur-sm border-white/30">
                          <Ic className="w-3.5 h-3.5 text-[#C5A55A]" />
                        </div>
                        <span className="text-[7px] font-medium leading-tight text-center w-full text-white/80">{label}</span>
                      </div>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg transition-all duration-200 group-hover:scale-105 bg-white/20 backdrop-blur-sm text-white border border-white/40">
                    Acceder / Crear Cuenta
                  </span>
                </div>
              </div>
            </button>

          </div>{/* fin grid tarjetas */}

          {/* ── Agendar Cita + Seguimiento de Mis Tratamientos (botones compactos sin imagen) ── */}
          <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4 mb-4">

            {/* Agendar Cita — debajo de Nutriser Home (izquierda) */}
            <button
              onClick={() => { window.location.href = '/appointment-form'; }}
              className="relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200 group bg-[#2a1f0a]/85 border-[#C5A55A]/60 hover:border-[#C5A55A] hover:bg-[#2a1f0a]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#C5A55A] flex items-center justify-center shadow-lg shadow-[#C5A55A]/50">
                <CalendarCheck className="w-5 h-5 text-black" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-center leading-tight text-white">
                Agendar Cita
              </span>
            </button>

            {/* Seguimiento de Mis Tratamientos — debajo del Portal de Salud (derecha) */}
            <button
              onClick={() => { window.location.href = '/mis-tratamientos'; }}
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200 group bg-[#2a1f0a]/75 border-[#C5A55A]/40 hover:border-[#C5A55A]/80 hover:bg-[#2a1f0a]/90"
            >
              <div className="w-9 h-9 rounded-xl bg-[#C5A55A]/30 group-hover:bg-[#C5A55A]/50 flex items-center justify-center transition-colors">
                <Sparkles className="w-5 h-5 text-[#C5A55A]" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight text-white/90">
                Seguimiento a Mis Tratamientos
              </span>
            </button>

          </div>

          {/* ── Íconos de redes sociales — más grandes en desktop ── */}
          <div className="flex items-center justify-center gap-5 sm:gap-6 lg:gap-8 mb-4 mt-1">

            {/* WhatsApp */}
            <a href="https://wa.me/523221007799?text=Hola%2C%20me%20interesa%20agendar%20una%20valoraci%C3%B3n%20en%20Nutriser" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 group" aria-label="WhatsApp Nutriser">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-200"
                style={isLight
                  ? { background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)' }
                  : { background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)' }}>
                <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8" style={{ fill: isLight ? '#7a6030' : 'white' }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span className={`text-[10px] sm:text-xs font-medium ${isLight ? 'text-[#9a8050]' : 'text-[#C5A55A]/80'}`}>WhatsApp</span>
            </a>

            {/* Instagram */}
            <a href="https://instagram.com/nutriserpv" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 group" aria-label="Instagram @nutriserpv">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-200"
                style={isLight
                  ? { background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)' }
                  : { background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)' }}>
                <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8" style={{ fill: isLight ? '#7a6030' : 'white' }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <span className={`text-[10px] sm:text-xs font-medium ${isLight ? 'text-[#9a8050]' : 'text-[#C5A55A]/80'}`}>Instagram</span>
            </a>

            {/* Facebook */}
            <a href="https://facebook.com/nutriserpv" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 group" aria-label="Facebook @nutriserpv">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-200"
                style={isLight
                  ? { background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)' }
                  : { background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)' }}>
                <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8" style={{ fill: isLight ? '#7a6030' : 'white' }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span className={`text-[10px] sm:text-xs font-medium ${isLight ? 'text-[#9a8050]' : 'text-[#C5A55A]/80'}`}>Facebook</span>
            </a>

            {/* Correo */}
            <a
              href="#"
              onClick={e => { e.preventDefault(); window.location.href = 'mailto:clinicanutriserpv@gmail.com?subject=Consulta%20Nutriser'; }}
              className="flex flex-col items-center gap-1.5 group" aria-label="Enviar correo a Nutriser">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-200"
                style={isLight
                  ? { background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)' }
                  : { background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)' }}>
                <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8" style={{ fill: isLight ? '#7a6030' : 'white' }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <span className={`text-[10px] sm:text-xs font-medium ${isLight ? 'text-[#9a8050]' : 'text-[#C5A55A]/80'}`}>Correo</span>
            </a>

            {/* Ubicación */}
            <a href="https://maps.google.com/?q=Nutriser+Aesthetic+%26+Nutrition+Puerto+Vallarta"
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 group" aria-label="Cómo llegar a Nutriser">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-200"
                style={isLight
                  ? { background: 'linear-gradient(145deg, #EDE5D5 0%, #E0D5C0 50%, #F5EFE4 100%)', border: '1px solid rgba(197,165,90,0.4)' }
                  : { background: 'linear-gradient(145deg, #2a1f0a 0%, #3d2e10 50%, #1a1208 100%)', border: '1px solid rgba(197,165,90,0.4)' }}>
                <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8" style={{ fill: isLight ? '#7a6030' : 'white' }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span className={`text-[10px] sm:text-xs font-medium ${isLight ? 'text-[#9a8050]' : 'text-[#C5A55A]/80'}`}>Ubicación</span>
            </a>

          </div>

          {/* ── Botón Administración ── */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => { window.location.href = '/admin'; }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[11px] font-medium transition-all duration-200 ${
                isLight
                  ? "bg-[#EDE5D5]/60 hover:bg-[#E0D5C0]/80 border-[#C5A55A]/20 hover:border-[#C5A55A]/50 text-[#9a8050] hover:text-[#7a6030]"
                  : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-[#C5A55A]/30 text-white/40 hover:text-white/70"
              }`}
            >
              <Lock className="w-3 h-3" />
              Administración
            </button>
          </div>

          {/* ── Pie ── */}
          <div className="flex items-center justify-between mt-2">
            <p className={`text-[9px] tracking-[0.2em] uppercase ${isLight ? "text-[#9a8050]/40" : "text-white/20"}`}>
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

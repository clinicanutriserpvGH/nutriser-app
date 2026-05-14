/*
 * Splash0Entry — Pantalla de entrada principal (único splash)
 * Solo para móvil/tablet (PC va directo al sitio web)
 *
 * FLUJO:
 *   1. Si el usuario NO tiene sesión activa → muestra formulario de login/registro
 *   2. Si el usuario YA tiene sesión → muestra las tarjetas (Portal + Tienda)
 *
 * Tarjetas:
 *   - Portal de Salud Nutriser → app externa (portaldesaludnutriser.club)
 *   - Tienda Nutriser → /memberships
 *
 * Nota: la misma cuenta sirve para Portal de Salud, Tienda y Monedero Nutriser.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingBag, CalendarCheck, Moon, Sun, Wallet, LogIn, UserPlus, Mail, Lock, Eye, EyeOff, User, Phone, Calendar, Loader2, ChevronRight, Star, Shield, Gift } from "lucide-react";
import { useSplashTheme } from "@/contexts/SplashThemeContext";
import { usePatientAuth, PatientSession } from "@/hooks/usePatientAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";
const CLINIC_SHOP_IMG =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663459263490/wrAlJInZiLZvEqGh.png";
const PORTAL_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/portal-salud-celular-final-ex4KpAuU6C5wW3NJXLKWeL.webp";
const NUTRISER_ICON =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-silhouette-icon_f9345ac8.png";

interface Splash0EntryProps {
  onEnterNutriserWeb: () => void;
  onGoToWebsite?: () => void;
  onNavigate?: (path: string) => void;
}

// ─── Formulario de Login/Registro inline ─────────────────────────────────────
function AuthForm({ onSuccess, isLight }: { onSuccess: (patient: PatientSession) => void; isLight: boolean }) {
  const { login } = usePatientAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const refCode = new URLSearchParams(window.location.search).get('ref') || null;

  const loginMutation = trpc.patients.login.useMutation({
    onSuccess: (data) => {
      const patient = data as PatientSession;
      login(patient);
      toast.success(`¡Bienvenido, ${patient.name}!`);
      onSuccess(patient);
    },
    onError: (err) => toast.error(err.message || "Correo o contraseña incorrectos"),
  });

  const registerMutation = trpc.patients.register.useMutation({
    onSuccess: (data) => {
      const patient = data as PatientSession;
      login(patient);
      toast.success(`¡Cuenta creada! Bienvenido, ${patient.name}`);
      onSuccess(patient);
    },
    onError: (err) => toast.error(err.message || "Error al crear la cuenta"),
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    loginMutation.mutate({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;
    if (password !== confirm) { toast.error("Las contraseñas no coinciden"); return; }
    if (!birthDay || !birthMonth || !birthYear) { toast.error("La fecha de nacimiento es obligatoria"); return; }
    const dd = birthDay.padStart(2, "0");
    const mm = birthMonth.padStart(2, "0");
    const birthday = `${birthYear}-${mm}-${dd}`;
    registerMutation.mutate({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password,
      phone: fd.get("phone") as string,
      birthday,
      referredByWalletCode: refCode || undefined,
    });
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const inputClass = "w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#C5A55A]/60 transition-colors";
  const inputClassLight = "w-full bg-black/5 border border-black/10 text-[#1a1208] placeholder-black/30 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#C5A55A]/60 transition-colors";
  const ic = isLight ? inputClassLight : inputClass;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Header con logo */}
      <div className="flex flex-col items-center mb-5">
        <img src={LOGO_URL} alt="Nutriser" className="w-16 h-16 object-contain mb-3" />
        <h1 className={`text-xl font-black tracking-tight text-center ${isLight ? 'text-[#1a1208]' : 'text-white'}`}>
          Bienvenido a Nutriser
        </h1>
        <p className={`text-xs text-center mt-1.5 leading-relaxed px-2 ${isLight ? 'text-[#7a6030]' : 'text-white/50'}`}>
          Una sola cuenta para tu <span className="text-[#C5A55A] font-semibold">Portal de Salud</span>, tu <span className="text-[#C5A55A] font-semibold">Monedero</span> y la <span className="text-[#C5A55A] font-semibold">Tienda Nutriser</span>
        </p>
      </div>

      {/* Beneficios rápidos */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#C5A55A]" />
          <span className={`text-[10px] font-medium ${isLight ? 'text-[#7a6030]' : 'text-white/50'}`}>Portal de Salud</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-[#C5A55A]" />
          <span className={`text-[10px] font-medium ${isLight ? 'text-[#7a6030]' : 'text-white/50'}`}>Monedero</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Gift className="w-3.5 h-3.5 text-[#C5A55A]" />
          <span className={`text-[10px] font-medium ${isLight ? 'text-[#7a6030]' : 'text-white/50'}`}>Descuentos</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex mb-4 rounded-xl p-1 gap-1 ${isLight ? 'bg-black/5' : 'bg-white/5'}`}>
        <button
          onClick={() => setMode("login")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mode === "login" ? "bg-[#C5A55A] text-black shadow-md" : isLight ? "text-[#7a6030]/60 hover:text-[#7a6030]" : "text-white/50 hover:text-white"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" /> Iniciar sesión
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mode === "register" ? "bg-[#C5A55A] text-black shadow-md" : isLight ? "text-[#7a6030]/60 hover:text-[#7a6030]" : "text-white/50 hover:text-white"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" /> Crear cuenta
        </button>
      </div>

      {/* Login Form */}
      {mode === "login" && (
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-black/30' : 'text-white/30'}`} />
            <input name="email" type="email" required placeholder="Correo electrónico" className={ic} />
          </div>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-black/30' : 'text-white/30'}`} />
            <input name="password" type={showPass ? "text" : "password"} required placeholder="Contraseña" className={`${ic} pr-10`} />
            <button type="button" onClick={() => setShowPass(p => !p)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-black/30 hover:text-black/60' : 'text-white/30 hover:text-white/60'}`}>
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button type="submit" disabled={isPending}
            className="w-full bg-[#C5A55A] hover:bg-[#d4b46a] text-black font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg mt-1">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Entrar
          </button>
          <p className={`text-center text-xs ${isLight ? 'text-black/30' : 'text-white/30'}`}>
            ¿No tienes cuenta?{" "}
            <button type="button" onClick={() => setMode("register")} className="text-[#C5A55A] hover:underline font-semibold">
              Regístrate aquí
            </button>
          </p>
        </form>
      )}

      {/* Register Form */}
      {mode === "register" && (
        <form onSubmit={handleRegister} className="space-y-3">
          <div className="relative">
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-black/30' : 'text-white/30'}`} />
            <input name="name" type="text" required minLength={2} placeholder="Nombre completo" className={ic} />
          </div>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-black/30' : 'text-white/30'}`} />
            <input name="email" type="email" required placeholder="Correo electrónico" className={ic} />
          </div>
          <div className="relative">
            <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-black/30' : 'text-white/30'}`} />
            <input name="phone" type="tel" required minLength={8} placeholder="Teléfono / WhatsApp" className={ic} />
          </div>
          {/* Fecha de nacimiento */}
          <div>
            <label className={`flex items-center gap-2 text-xs mb-1.5 ${isLight ? 'text-black/40' : 'text-white/40'}`}>
              <Calendar className="w-3.5 h-3.5" /> Fecha de nacimiento <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: birthDay, setter: setBirthDay, placeholder: "Día", options: Array.from({ length: 31 }, (_, i) => ({ val: String(i + 1), label: String(i + 1) })) },
                { value: birthMonth, setter: setBirthMonth, placeholder: "Mes", options: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].map((m, i) => ({ val: String(i + 1), label: m })) },
                { value: birthYear, setter: setBirthYear, placeholder: "Año", options: Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 10 - i).map(y => ({ val: String(y), label: String(y) })) },
              ].map(({ value, setter, placeholder, options }) => (
                <select key={placeholder} value={value} onChange={e => setter(e.target.value)}
                  className={`${isLight ? 'bg-black/5 border-black/10 text-[#1a1208]' : 'bg-white/5 border-white/10 text-white'} border text-sm rounded-xl px-2 py-3 outline-none focus:border-[#C5A55A]/50 appearance-none text-center`}>
                  <option value="" className="bg-[#1a1a1a]">{placeholder}</option>
                  {options.map(o => <option key={o.val} value={o.val} className="bg-[#1a1a1a]">{o.label}</option>)}
                </select>
              ))}
            </div>
          </div>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-black/30' : 'text-white/30'}`} />
            <input name="password" type={showPass ? "text" : "password"} required minLength={6} placeholder="Contraseña (mín. 6 caracteres)" className={`${ic} pr-10`} />
            <button type="button" onClick={() => setShowPass(p => !p)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-black/30 hover:text-black/60' : 'text-white/30 hover:text-white/60'}`}>
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-black/30' : 'text-white/30'}`} />
            <input name="confirm" type={showConfirm ? "text" : "password"} required minLength={6} placeholder="Confirmar contraseña" className={`${ic} pr-10`} />
            <button type="button" onClick={() => setShowConfirm(p => !p)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-black/30 hover:text-black/60' : 'text-white/30 hover:text-white/60'}`}>
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button type="submit" disabled={isPending}
            className="w-full bg-[#C5A55A] hover:bg-[#d4b46a] text-black font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg mt-1">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Crear cuenta gratis
          </button>
          <p className={`text-center text-xs ${isLight ? 'text-black/30' : 'text-white/30'}`}>
            ¿Ya tienes cuenta?{" "}
            <button type="button" onClick={() => setMode("login")} className="text-[#C5A55A] hover:underline font-semibold">
              Inicia sesión
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Splash0Entry({ onEnterNutriserWeb, onGoToWebsite, onNavigate }: Splash0EntryProps) {
  const { patient, isLoggedIn } = usePatientAuth();
  const [leaving, setLeaving] = useState(false);
  const [isLandscape, setIsLandscape] = useState(
    () => typeof window !== 'undefined' && window.innerWidth > window.innerHeight
  );
  useEffect(() => {
    const checkOrientation = () => setIsLandscape(window.innerWidth > window.innerHeight);
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

  const handlePortalSalud = () => {
    setLeaving(true);
    setTimeout(() => {
      window.location.href = "https://portaldesaludnutriser.club";
    }, 200);
  };

  // Secret admin access: long-press 3 seconds on footer text
  const logoLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [logoHoldProgress, setLogoHoldProgress] = useState(0);
  const logoHoldInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLogoLongPress = useCallback(() => {
    setLogoHoldProgress(0);
    logoHoldInterval.current = setInterval(() => {
      setLogoHoldProgress(prev => {
        if (prev >= 100) { clearInterval(logoHoldInterval.current!); return 100; }
        return prev + (100 / 30);
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
        className="min-h-screen w-full flex flex-col items-center px-4 sm:px-6 box-border"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px) + 12px, 20px)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 8px, 24px)",
        }}
      >
        <div className="w-full max-w-[420px] flex flex-col" style={{ minHeight: '100%' }}>

          {/* ── PANTALLA 1: Login/Registro (si NO está autenticado) ── */}
          {!isLoggedIn && (
            <div className="flex-1 flex flex-col justify-center py-4">
              <AuthForm onSuccess={() => {}} isLight={isLight} />
            </div>
          )}

          {/* ── PANTALLA 2: Tarjetas Portal + Tienda (si YA está autenticado) ── */}
          {isLoggedIn && (
            <>
              {/* Saludo */}
              <div className="flex items-center justify-between mb-4 pt-2">
                <div>
                  <p className={`text-xs font-medium ${isLight ? 'text-[#7a6030]/70' : 'text-white/40'}`}>Bienvenido de vuelta</p>
                  <p className={`text-base font-black ${isLight ? 'text-[#1a1208]' : 'text-white'}`}>{patient?.name?.split(' ')[0] ?? 'Nutriser'}</p>
                </div>
                <img src={LOGO_URL} alt="Nutriser" className="w-10 h-10 object-contain" />
              </div>

              {/* Grid de tarjetas */}
              <div
                className="gap-3 mb-3"
                style={{ display: 'flex', flexDirection: isLandscape ? 'row' : 'column', flex: 1, minHeight: 0 }}
              >
                {/* ── Tarjeta: Portal de Salud Nutriser ── */}
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
                    <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 text-left pointer-events-none">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'rgba(0,0,0,0.75)', border: '2px solid rgba(197,165,90,0.9)', backdropFilter: 'blur(6px)' }}>
                          <img src={NUTRISER_ICON} alt="Nutriser" className="w-5 h-5 object-contain" />
                        </div>
                        <span className="text-sm font-bold tracking-widest uppercase text-[#E8C97A]" style={{ textShadow: '0 1px 6px rgba(0,0,0,1)', background: 'rgba(0,0,0,0.7)', padding: '6px 16px', borderRadius: '8px' }}>
                          Portal de Salud Nutriser
                        </span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold leading-tight mb-2 drop-shadow-lg text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                          Consulta tu plan, diario, racha 🔥 y seguimiento
                        </h2>
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold tracking-wide uppercase shadow-lg text-black" style={{
                          background: 'linear-gradient(145deg, #C5A55A 0%, #E8C97A 50%, #C5A55A 100%)',
                          boxShadow: '0 0 12px rgba(197,165,90,0.9)',
                          border: '1px solid rgba(232,201,122,0.7)'
                        }}>
                          Entrar a mi Portal
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                {/* ── Tarjeta: Tienda Nutriser ── */}
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
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50 pointer-events-none" />
                    <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 text-left pointer-events-none">
                      <div className="flex items-center gap-1.5">
                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-[#C5A55A]">
                          <ShoppingBag className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-sm font-bold tracking-wide uppercase text-white" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.95)', background: 'rgba(0,0,0,0.7)', padding: '6px 16px', borderRadius: '8px' }}>Tienda Nutriser</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold leading-tight mb-2 text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                          Tienda en Línea
                        </h2>
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold tracking-wide uppercase text-black" style={{
                          background: 'linear-gradient(145deg, #C5A55A 0%, #E8C97A 50%, #C5A55A 100%)',
                          boxShadow: '0 0 12px rgba(197,165,90,0.9)',
                          border: '1px solid rgba(232,201,122,0.7)'
                        }}>
                          <ShoppingBag className="w-3.5 h-3.5" /> Visitar
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* ── Barra de ayuda ── */}
              <div className="flex flex-col items-center gap-3 mt-2 mb-2">
                <p className={`text-xs font-medium tracking-wide ${isLight ? 'text-[#7a6030]' : 'text-white/60'}`}>─── ¿Necesitas ayuda? ───</p>
                <div className="flex items-center justify-center gap-3 flex-wrap px-2 w-full">
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/523221007799"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A55A]/40 hover:border-[#C5A55A]/80 hover:bg-[#C5A55A]/10 transition-all duration-300"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: '#C5A55A' }} xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-xs font-medium text-[#C5A55A]">WhatsApp</span>
                  </a>
                  {/* Agendar cita */}
                  <a
                    href="/appointment-form"
                    onClick={e => { e.preventDefault(); handleNavigate('/appointment-form'); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A55A]/40 hover:border-[#C5A55A]/80 hover:bg-[#C5A55A]/10 transition-all duration-300"
                  >
                    <CalendarCheck className="w-4 h-4" style={{ color: '#C5A55A' }} />
                    <span className="text-xs font-medium text-[#C5A55A]">Agendar cita</span>
                  </a>
                  {/* Mi monedero */}
                  <a
                    href="#"
                    onClick={e => { e.preventDefault(); handleNavigate('/monedero?fromSplash=true'); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A55A]/40 hover:border-[#C5A55A]/80 hover:bg-[#C5A55A]/10 transition-all duration-300"
                  >
                    <Wallet className="w-4 h-4" style={{ color: '#C5A55A' }} />
                    <span className="text-xs font-medium text-[#C5A55A]">Mi monedero</span>
                  </a>
                </div>
              </div>
            </>
          )}

          {/* ── Pie con acceso admin ── */}
          <div className="flex items-center justify-between mt-2">
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
              <p className={`text-[9px] tracking-[0.2em] uppercase text-center ${isLight ? "text-[#9a8050]/40 hover:text-[#7a6030]/60" : "text-white/20 hover:text-white/40"} transition-colors`}>
                Nutriser Aesthetic &amp; Nutrition
              </p>
              {logoHoldProgress > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 10" style={{ transform: 'scaleX(-1)' }}>
                  <line x1="0" y1="5" x2={logoHoldProgress} y2="5" stroke="#C5A55A" strokeWidth="1" opacity="0.6" />
                </svg>
              )}
            </button>
            {/* Toggle modo claro/oscuro */}
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
                <span className={`relative inline-block w-6 h-3 rounded-full transition-colors duration-300 flex-shrink-0 ${isLight ? "bg-[#C5A55A]/50" : "bg-white/15"}`}>
                  <span className={`absolute top-0.5 w-2 h-2 rounded-full bg-white/70 shadow transition-transform duration-300 ${isLight ? "translate-x-3" : "translate-x-0.5"}`} />
                </span>
              </button>
              {isAuto ? (
                <span className={`text-[8px] pr-1 ${isLight ? "text-[#9a8050]/30" : "text-white/15"}`}>auto</span>
              ) : (
                <button onClick={resetToAuto} className={`text-[8px] pr-1 underline underline-offset-1 transition-colors ${isLight ? "text-[#9a8050]/40 hover:text-[#7a6030]" : "text-white/20 hover:text-white/50"}`}>
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

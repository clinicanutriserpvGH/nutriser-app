/**
 * NutriserAuthModal — Modal de login/registro unificado para toda la app Nutriser
 *
 * Usado en:
 *   - Splash 1 (botón "Iniciar sesión" en la barra superior)
 *   - Nutriser Shop (al agregar al carrito sin sesión)
 *   - Nutriser Academy (al intentar suscribirse sin sesión)
 *   - Mis Tratamientos (pantalla de autenticación)
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { X, Eye, EyeOff, Loader2, User, Mail, Phone, Lock, LogIn, UserPlus } from "lucide-react";
import { usePatientAuth, PatientSession } from "@/hooks/usePatientAuth";

interface NutriserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (patient: PatientSession) => void;
  /** Mensaje contextual que aparece arriba del formulario */
  contextMessage?: string;
}

export default function NutriserAuthModal({ isOpen, onClose, onSuccess, contextMessage }: NutriserAuthModalProps) {
  const { login } = usePatientAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loginMutation = trpc.patients.login.useMutation({
    onSuccess: (data) => {
      const patient = data as PatientSession;
      login(patient);
      toast.success(`¡Bienvenido, ${patient.name}!`);
      onSuccess?.(patient);
      onClose();
    },
    onError: (err) => toast.error(err.message || "Correo o contraseña incorrectos"),
  });

  const registerMutation = trpc.patients.register.useMutation({
    onSuccess: (data) => {
      const patient = data as PatientSession;
      login(patient);
      toast.success(`¡Cuenta creada! Bienvenido, ${patient.name}`);
      onSuccess?.(patient);
      onClose();
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
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    registerMutation.mutate({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password,
      phone: fd.get("phone") as string,
    });
  };

  if (!isOpen) return null;

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#111] border border-[#C5A55A]/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-white font-black text-xl tracking-tight">
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </h2>
            <p className="text-white/40 text-xs mt-0.5">Accede a tu monedero, cupones y beneficios</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Context message */}
        {contextMessage && (
          <div className="mx-5 mb-3 bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-xl px-3 py-2">
            <p className="text-[#C5A55A] text-xs font-medium">{contextMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex mx-5 mb-4 bg-white/5 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === "login" ? "bg-[#C5A55A] text-black" : "text-white/50 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Iniciar sesión
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === "register" ? "bg-[#C5A55A] text-black" : "text-white/50 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Crear cuenta
          </button>
        </div>

        {/* Login Form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="px-5 pb-5 space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="email"
                type="email"
                required
                placeholder="Correo electrónico"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#C5A55A]/50"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="password"
                type={showPass ? "text" : "password"}
                required
                placeholder="Contraseña"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-[#C5A55A]/50"
              />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#C5A55A] hover:bg-[#d4b46a] text-black font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Entrar
            </button>
            <p className="text-center text-white/30 text-xs">
              ¿No tienes cuenta?{" "}
              <button type="button" onClick={() => setMode("register")} className="text-[#C5A55A] hover:underline">
                Regístrate aquí
              </button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="px-5 pb-5 space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="name"
                type="text"
                required
                minLength={2}
                placeholder="Nombre completo"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#C5A55A]/50"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="email"
                type="email"
                required
                placeholder="Correo electrónico"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#C5A55A]/50"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="phone"
                type="tel"
                required
                minLength={8}
                placeholder="Teléfono / WhatsApp"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#C5A55A]/50"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="password"
                type={showPass ? "text" : "password"}
                required
                minLength={6}
                placeholder="Contraseña (mín. 6 caracteres)"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-[#C5A55A]/50"
              />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="confirm"
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Confirmar contraseña"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-[#C5A55A]/50"
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#C5A55A] hover:bg-[#d4b46a] text-black font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Crear mi cuenta
            </button>
            <p className="text-center text-white/30 text-xs">
              ¿Ya tienes cuenta?{" "}
              <button type="button" onClick={() => setMode("login")} className="text-[#C5A55A] hover:underline">
                Inicia sesión
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

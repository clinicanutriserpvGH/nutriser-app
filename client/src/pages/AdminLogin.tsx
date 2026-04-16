import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Mail, CheckCircle2, ArrowLeft, Home, Shield, Loader2, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estado 2FA
  const [awaitingAuth, setAwaitingAuth] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 min en segundos
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detectar si el usuario viene del Splash 2
  const fromSplash2 = new URLSearchParams(window.location.search).get("from") === "splash2";

  // Estado para el modal de recuperación
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setResetSent(true);
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al enviar el correo");
    },
  });

  const loginMutation = trpc.auth.adminLogin.useMutation({
    onSuccess: (data) => {
      if (data.pendingAuthorization) {
        setPendingEmail(data.email);
        setAwaitingAuth(true);
        setCountdown(600);
        toast.success("Correo de autorización enviado. Revisa tu bandeja.");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Credenciales inválidas");
      setIsLoading(false);
    },
  });

  const authorizeMutation = trpc.auth.authorizeLogin.useMutation();

  // Polling para verificar autorización
  const checkAuthQuery = trpc.auth.checkLoginAuthorization.useQuery(
    { email: pendingEmail },
    {
      enabled: awaitingAuth && !!pendingEmail,
      refetchInterval: awaitingAuth ? 3000 : false, // cada 3 segundos
    }
  );

  useEffect(() => {
    if (checkAuthQuery.data?.authorized) {
      // ¡Autorizado! Guardar sesión y redirigir
      localStorage.setItem("adminSession", JSON.stringify({
        email: checkAuthQuery.data.email,
        loggedIn: true,
        timestamp: new Date().toISOString(),
      }));
      toast.success("¡Acceso autorizado! Bienvenido al panel.");
      setAwaitingAuth(false);
      setIsLoading(false);
      navigate("/admin/dashboard");
    }
  }, [checkAuthQuery.data]);

  // Countdown timer
  useEffect(() => {
    if (awaitingAuth) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Tiempo expirado
            setAwaitingAuth(false);
            setIsLoading(false);
            toast.error("El tiempo de autorización ha expirado. Intenta de nuevo.");
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [awaitingAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Ingresa tu correo y contraseña");
      return;
    }
    setIsLoading(true);
    loginMutation.mutate({
      email,
      password,
      origin: window.location.origin,
    });
  };

  const handleRequestReset = () => {
    if (!resetEmail) {
      toast.error("Ingresa tu correo de administrador");
      return;
    }
    requestResetMutation.mutate({
      email: resetEmail,
      origin: window.location.origin,
    });
  };

  const handleCancelAuth = () => {
    setAwaitingAuth(false);
    setIsLoading(false);
    setPendingEmail("");
    setCountdown(600);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-white flex items-center justify-center py-12 px-4">
      {/* Botones de navegación */}
      <div className="fixed top-12 left-4 z-50 flex items-center gap-2">
        {fromSplash2 && (
          <button
            onClick={() => { window.location.href = '/nutriser-home'; }}
            className="flex items-center gap-1.5 bg-[#C5A55A] hover:bg-[#B8963E] text-black text-sm font-semibold px-4 py-2 rounded-full shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </button>
        )}
        <button
          onClick={() => {
            sessionStorage.removeItem("nutriser_splash_seen");
            window.location.href = "/";
          }}
          className="flex items-center gap-2 text-black text-sm font-extrabold tracking-widest uppercase bg-[#C5A55A] border-2 border-[#C5A55A] px-4 py-2.5 rounded-full shadow-lg shadow-[#C5A55A]/30 hover:bg-[#B8944A] active:scale-95 transition-all duration-200"
        >
          <Home className="w-4 h-4" />
          INICIO
        </button>
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-[#1A1A1A] mb-2">Nutriser</h1>
          <p className="text-[#666]">Panel de Administración</p>
        </div>

        {awaitingAuth ? (
          /* ── Esperando autorización 2FA ── */
          <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent text-center">
              <div className="mx-auto mb-2">
                <Shield className="w-12 h-12 text-[#C5A55A] mx-auto" />
              </div>
              <CardTitle className="text-[#C5A55A]">Verificación de Seguridad</CardTitle>
              <CardDescription>Esperando autorización por correo</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="bg-[#FFF8E1] border border-[#C5A55A]/30 rounded-lg p-4 text-center">
                <p className="text-sm text-[#856404] mb-2">
                  Se envió un enlace de autorización a los correos de seguridad de Nutriser.
                </p>
                <p className="text-xs text-[#856404]/80">
                  Un administrador debe hacer clic en el enlace para autorizar tu acceso.
                </p>
              </div>

              {/* Animación de espera */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-[#C5A55A] animate-spin" />
                </div>
                <p className="text-[#666] text-sm font-medium">Esperando autorización...</p>
                <div className="flex items-center gap-2 text-[#999] text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expira en {formatTime(countdown)}</span>
                </div>
              </div>

              {/* Indicador de correo */}
              <div className="bg-[#f5f5f5] rounded-lg p-3 text-center">
                <p className="text-xs text-[#999] mb-1">Sesión solicitada para:</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">{pendingEmail}</p>
              </div>

              <Button
                onClick={handleCancelAuth}
                variant="outline"
                className="w-full border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A]/10"
              >
                Cancelar e intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        ) : !showForgot ? (
          /* ── Login normal con campo de correo editable ── */
          <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent">
              <CardTitle className="text-[#C5A55A]">Iniciar Sesión</CardTitle>
              <CardDescription>Accede al panel de administración</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                {/* Correo editable */}
                <div>
                  <Label htmlFor="admin-email" className="flex items-center gap-2 mb-2 text-[#666]">
                    <Mail className="w-4 h-4 text-[#C5A55A]" />
                    Correo de Administrador
                  </Label>
                  <Input
                    id="admin-email"
                    name="admin-email-field"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu-correo@ejemplo.com"
                    required
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-[#C5A55A]" />
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="admin-pass-field"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      className="border-[#C5A55A]/30 focus:border-[#C5A55A] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A55A] hover:text-[#B8963E]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Nota de seguridad */}
                <div className="bg-[#f0f7ff] border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">
                    Después de verificar tus credenciales, se enviará un enlace de autorización a los correos de seguridad de Nutriser. Solo podrás acceder si se aprueba.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || loginMutation.isPending}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 text-lg font-bold tracking-wider"
                >
                  {isLoading || loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verificando...
                    </span>
                  ) : "Iniciar Sesión"}
                </Button>

                {/* Enlace olvidé contraseña */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-sm text-[#C5A55A] hover:text-[#B8963E] underline underline-offset-2"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* ── Modal de recuperación con campo editable ── */
          <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent">
              <CardTitle className="text-[#C5A55A]">Recuperar Contraseña</CardTitle>
              <CardDescription>Ingresa tu correo de administrador</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!resetSent ? (
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="reset-email" className="flex items-center gap-2 mb-2 text-[#666]">
                      <Mail className="w-4 h-4 text-[#C5A55A]" />
                      Correo del administrador
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="tu-correo@ejemplo.com"
                      required
                      className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                    />
                  </div>

                  <p className="text-sm text-[#666]">
                    Se enviará un enlace de restablecimiento al correo ingresado. El enlace es válido por 1 hora.
                  </p>

                  <Button
                    onClick={handleRequestReset}
                    disabled={requestResetMutation.isPending}
                    className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 font-bold"
                  >
                    {requestResetMutation.isPending ? "Enviando..." : "Enviar enlace de recuperación"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="text-sm text-[#999] hover:text-[#666]"
                    >
                      ← Volver al login
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
                  <h3 className="text-xl font-bold text-[#1A1A1A]">¡Correo enviado!</h3>
                  <p className="text-[#666] text-sm">
                    Revisa tu bandeja de entrada y haz clic en el enlace para crear una nueva contraseña.
                  </p>
                  <p className="text-[#999] text-xs">El enlace expira en 1 hora.</p>
                  <Button
                    onClick={() => { setShowForgot(false); setResetSent(false); setResetEmail(""); }}
                    variant="outline"
                    className="border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A]/10"
                  >
                    Volver al login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-[#999] text-sm mt-6">
          Panel exclusivo para administradores de Nutriser
        </p>
      </div>
    </div>
  );
}

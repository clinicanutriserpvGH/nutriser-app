import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Mail, CheckCircle2, ArrowLeft, Home, Shield, Loader2, KeyRound } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estado del flujo
  const [step, setStep] = useState<"credentials" | "passphrase">("credentials");
  const [pendingEmail, setPendingEmail] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);

  // Estado para el modal de recuperación
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Detectar si el usuario viene del Splash 2
  const fromSplash2 = new URLSearchParams(window.location.search).get("from") === "splash2";

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => setResetSent(true),
    onError: (err: any) => toast.error(err.message || "Error al enviar el correo"),
  });

  // Paso 1: Verificar correo + contraseña
  const loginMutation = trpc.auth.adminLogin.useMutation({
    onSuccess: (data) => {
      if (data.requirePassphrase) {
        setPendingEmail(data.email);
        setStep("passphrase");
        toast.success("Credenciales correctas. Ingresa la palabra clave.");
      }
    },
    onError: (err: any) => toast.error(err.message || "Credenciales inválidas"),
  });

  // Paso 2: Verificar palabra clave
  const passphraseLoginMutation = trpc.auth.adminLoginWithPassphrase.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("adminSession", JSON.stringify({
        email: data.email,
        loggedIn: true,
        timestamp: new Date().toISOString(),
      }));
      localStorage.removeItem("adminSession");
      localStorage.removeItem("adminSessionToken");
      toast.success("¡Acceso autorizado! Bienvenido al panel.");
      navigate("/admin/dashboard");
    },
    onError: (err: any) => toast.error(err.message || "Palabra clave incorrecta"),
  });

  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Ingresa tu correo y contraseña");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleSubmitPassphrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) {
      toast.error("Ingresa la palabra clave");
      return;
    }
    passphraseLoginMutation.mutate({ email: pendingEmail, passphrase: passphrase.trim() });
  };

  const handleRequestReset = () => {
    if (!resetEmail) {
      toast.error("Ingresa tu correo de administrador");
      return;
    }
    requestResetMutation.mutate({ email: resetEmail, origin: window.location.origin });
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

        {step === "passphrase" ? (
          /* ── Paso 2: Palabra Clave ── */
          <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent text-center">
              <div className="mx-auto mb-2">
                <KeyRound className="w-12 h-12 text-[#C5A55A] mx-auto" />
              </div>
              <CardTitle className="text-[#C5A55A]">Palabra Clave</CardTitle>
              <CardDescription>Ingresa la palabra clave de seguridad</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitPassphrase} className="space-y-5">
                <div className="bg-[#FFF8E1] border border-[#C5A55A]/30 rounded-lg p-3 text-center">
                  <p className="text-sm text-[#856404]">
                    Sesión para: <span className="font-semibold">{pendingEmail}</span>
                  </p>
                </div>

                <div>
                  <Label htmlFor="passphrase" className="flex items-center gap-2 mb-2 text-[#666]">
                    <Shield className="w-4 h-4 text-[#C5A55A]" />
                    Palabra Clave de Seguridad
                  </Label>
                  <div className="relative">
                    <Input
                      id="passphrase"
                      type={showPassphrase ? "text" : "password"}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Ingresa la palabra clave"
                      required
                      autoComplete="off"
                      autoFocus
                      className="border-[#C5A55A]/30 focus:border-[#C5A55A] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A55A] hover:text-[#B8963E]"
                    >
                      {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#999] mt-1.5">
                    El administrador general te proporcionará esta palabra clave.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={passphraseLoginMutation.isPending}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 text-lg font-bold tracking-wider"
                >
                  {passphraseLoginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verificando...
                    </span>
                  ) : "Ingresar al Panel"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setStep("credentials"); setPassphrase(""); }}
                    className="text-sm text-[#999] hover:text-[#666]"
                  >
                    ← Volver a credenciales
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : !showForgot ? (
          /* ── Paso 1: Correo + Contraseña ── */
          <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent">
              <CardTitle className="text-[#C5A55A]">Iniciar Sesión</CardTitle>
              <CardDescription>Accede al panel de administración</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitCredentials} className="space-y-6" autoComplete="off">
                {/* Correo */}
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
                    Después de verificar tus credenciales, se te pedirá una palabra clave de seguridad.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 text-lg font-bold tracking-wider"
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verificando...
                    </span>
                  ) : "Continuar"}
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
          /* ── Recuperar contraseña ── */
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
      </div>
    </div>
  );
}

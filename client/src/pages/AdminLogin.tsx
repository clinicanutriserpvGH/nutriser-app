import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, User, Mail, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const ADMIN_EMAIL = "clinicanutriserpv@gmail.com";
const ADMIN_PASSWORD = "nutriser2024";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estado para el modal de recuperación
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setResetSent(true);
    },
    onError: (err) => {
      toast.error(err.message || "Error al enviar el correo");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("adminSession", JSON.stringify({
          email: ADMIN_EMAIL,
          loggedIn: true,
          timestamp: new Date().toISOString(),
        }));
        toast.success("Sesión iniciada correctamente");
        navigate("/admin/dashboard");
      } else {
        toast.error("Contraseña incorrecta");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = () => {
    requestResetMutation.mutate({
      email: ADMIN_EMAIL,
      origin: window.location.origin,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-[#1A1A1A] mb-2">Nutriser</h1>
          <p className="text-[#666]">Panel de Administración</p>
        </div>

        {!showForgot ? (
          /* ── Login normal ── */
          <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent">
              <CardTitle className="text-[#C5A55A]">Iniciar Sesión</CardTitle>
              <CardDescription>Accede al panel de administración</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Correo pre-llenado (solo lectura) */}
                <div>
                  <Label className="flex items-center gap-2 mb-2 text-[#666]">
                    <User className="w-4 h-4 text-[#C5A55A]" />
                    Administrador
                  </Label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#C5A55A]/20 bg-[#FAF7F2] text-[#666] text-sm select-none">
                    <span className="flex-1">{ADMIN_EMAIL}</span>
                  </div>
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
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoFocus
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 text-lg font-bold tracking-wider"
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
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
          /* ── Modal de recuperación ── */
          <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent">
              <CardTitle className="text-[#C5A55A]">Recuperar Contraseña</CardTitle>
              <CardDescription>Te enviaremos un enlace a tu correo registrado</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!resetSent ? (
                <div className="space-y-5">
                  {/* Correo pre-llenado */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-[#666]">
                      <Mail className="w-4 h-4 text-[#C5A55A]" />
                      Correo del administrador
                    </Label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#C5A55A]/20 bg-[#FAF7F2] text-[#666] text-sm">
                      <span className="flex-1">{ADMIN_EMAIL}</span>
                    </div>
                  </div>

                  <p className="text-sm text-[#666]">
                    Se enviará un enlace de restablecimiento a <strong>{ADMIN_EMAIL}</strong>. El enlace es válido por 1 hora.
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
                    Revisa tu bandeja de entrada en <strong>{ADMIN_EMAIL}</strong> y haz clic en el enlace para crear una nueva contraseña.
                  </p>
                  <p className="text-[#999] text-xs">El enlace expira en 1 hora.</p>
                  <Button
                    onClick={() => { setShowForgot(false); setResetSent(false); }}
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

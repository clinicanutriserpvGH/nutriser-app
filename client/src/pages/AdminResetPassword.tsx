import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminResetPassword() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      toast.success("Contraseña actualizada correctamente");
      setTimeout(() => navigate("/admin"), 3000);
    },
    onError: (err) => {
      toast.error(err.message || "Error al restablecer la contraseña");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    resetMutation.mutate({ token, newPassword });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Enlace inválido</h2>
          <p className="text-[#666] mb-6">Este enlace de restablecimiento no es válido.</p>
          <Button onClick={() => navigate("/admin")} className="bg-[#C5A55A] hover:bg-[#B8963E] text-white">
            Volver al Login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">¡Contraseña actualizada!</h2>
          <p className="text-[#666] mb-2">Tu contraseña ha sido cambiada exitosamente.</p>
          <p className="text-[#999] text-sm">Redirigiendo al login en unos segundos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-[#1A1A1A] mb-2">Nutriser</h1>
          <p className="text-[#666]">Restablecer Contraseña</p>
        </div>

        <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent">
            <CardTitle className="text-[#C5A55A]">Nueva Contraseña</CardTitle>
            <CardDescription>Ingresa tu nueva contraseña para el panel de administración</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nueva contraseña */}
              <div>
                <Label htmlFor="new-password" className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-[#C5A55A]" />
                  Nueva contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
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

              {/* Confirmar contraseña */}
              <div>
                <Label htmlFor="confirm-password" className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-[#C5A55A]" />
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    required
                    className="border-[#C5A55A]/30 focus:border-[#C5A55A] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A55A] hover:text-[#B8963E]"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={resetMutation.isPending || !newPassword || !confirmPassword}
                className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 text-lg font-bold tracking-wider"
              >
                {resetMutation.isPending ? "Guardando..." : "Guardar Nueva Contraseña"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

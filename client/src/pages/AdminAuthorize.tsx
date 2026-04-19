import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, XCircle, Loader2, Home, LogIn } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminAuthorize() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [authorizedEmail, setAuthorizedEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const authorizeMutation = trpc.auth.authorizeLogin.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setAuthorizedEmail(data.email);
      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
        // sessionStorage: expira al cerrar el tab/navegador (más seguro)
        sessionStorage.setItem("adminSession", data.sessionToken);
        // Limpiar localStorage viejo por seguridad
        localStorage.removeItem("adminSession");
        localStorage.removeItem("adminSessionToken");
        // Redirigir automáticamente al panel después de 2 segundos
        setTimeout(() => {
          window.location.href = `/admin/dashboard?st=${data.sessionToken}`;
        }, 2000);
      }
    },
    onError: (err: any) => {
      setStatus("error");
      setErrorMessage(err.message || "Error al autorizar el acceso");
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      authorizeMutation.mutate({ token });
    } else {
      setStatus("error");
      setErrorMessage("No se proporcionó un token de autorización.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-[#1A1A1A] mb-2">Nutriser</h1>
          <p className="text-[#666]">Sistema de Seguridad</p>
        </div>

        <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent text-center">
            <div className="mx-auto mb-2">
              <Shield className="w-12 h-12 text-[#C5A55A] mx-auto" />
            </div>
            <CardTitle className="text-[#C5A55A]">Autorización de Acceso</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {status === "loading" && (
              <div className="text-center space-y-4 py-6">
                <Loader2 className="w-12 h-12 text-[#C5A55A] animate-spin mx-auto" />
                <p className="text-[#666]">Autorizando acceso...</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center space-y-4 py-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-[#1A1A1A]">¡Acceso Autorizado!</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    Acceso autorizado para:
                  </p>
                  <p className="text-lg font-bold text-green-800 mt-1">{authorizedEmail}</p>
                </div>
                <p className="text-sm text-[#666]">
                  Redirigiendo al panel de administración...
                </p>
                <Loader2 className="w-6 h-6 text-[#C5A55A] animate-spin mx-auto" />
                {sessionToken && (
                  <Button
                    onClick={() => { window.location.href = `/admin/dashboard?st=${sessionToken}`; }}
                    className="bg-[#C5A55A] hover:bg-[#B8944A] text-white mt-2 w-full"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Ir al Panel Ahora
                  </Button>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="text-center space-y-4 py-6">
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                <h3 className="text-xl font-bold text-[#1A1A1A]">Error de Autorización</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
                <p className="text-sm text-[#666]">
                  El enlace puede haber expirado o ya fue utilizado. El administrador deberá intentar iniciar sesión nuevamente.
                </p>
                <Button
                  onClick={() => navigate("/admin/login")}
                  variant="outline"
                  className="border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A]/10 mt-2"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Volver al Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-[#999] text-sm mt-6">
          Nutriser Aesthetic & Nutrition — Sistema de Seguridad
        </p>
      </div>
    </div>
  );
}

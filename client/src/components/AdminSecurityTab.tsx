import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, KeyRound, Eye, EyeOff, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminSecurityTab() {
  // Paso 1: Verificar credenciales del admin general
  const [masterEmail, setMasterEmail] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Paso 2: Nueva palabra clave
  const [newPassphrase, setNewPassphrase] = useState("");
  const [showNewPassphrase, setShowNewPassphrase] = useState(false);
  const [success, setSuccess] = useState(false);

  const updatePassphraseMutation = trpc.auth.updateAdminPassphrase.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setNewPassphrase("");
      toast.success("Palabra clave actualizada correctamente.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al actualizar la palabra clave");
    },
  });

  // Verificar credenciales del admin general usando la query
  const verifyQuery = trpc.auth.getAdminPassphrase.useQuery(
    { masterEmail, masterPassword },
    { enabled: false }
  );

  const handleVerify = async () => {
    if (!masterEmail || !masterPassword) {
      toast.error("Ingresa el correo y contraseña del administrador general");
      return;
    }
    setIsVerifying(true);
    try {
      const result = await verifyQuery.refetch();
      if (result.data) {
        setVerified(true);
        toast.success("Identidad verificada. Ahora puedes cambiar la palabra clave.");
      }
    } catch (err: any) {
      toast.error(err.message || "Credenciales incorrectas");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdatePassphrase = () => {
    if (!newPassphrase.trim()) {
      toast.error("Ingresa la nueva palabra clave");
      return;
    }
    if (newPassphrase.trim().length < 3) {
      toast.error("La palabra clave debe tener al menos 3 caracteres");
      return;
    }
    updatePassphraseMutation.mutate({
      masterEmail,
      masterPassword,
      newPassphrase: newPassphrase.trim(),
    });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-7 h-7 text-[#C5A55A]" />
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Seguridad del Panel</h2>
          <p className="text-sm text-[#666]">Administra la palabra clave de acceso para los administradores</p>
        </div>
      </div>

      {/* Explicación del sistema */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <KeyRound className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-semibold">¿Cómo funciona la Palabra Clave?</p>
              <p>Al iniciar sesión, todos los administradores deben ingresar esta palabra clave después de su correo y contraseña.</p>
              <p>Cámbiala periódicamente y comunica la nueva a los administradores para mantener la seguridad.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!verified ? (
        /* Paso 1: Verificar identidad del admin general */
        <Card className="border-2 border-[#C5A55A]/20">
          <CardHeader>
            <CardTitle className="text-[#C5A55A] text-lg flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Verificación de Identidad
            </CardTitle>
            <CardDescription>
              Solo el administrador general puede cambiar la palabra clave.
              Ingresa las credenciales especiales para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#666] mb-1.5 block">Correo del Administrador General</Label>
              <Input
                type="email"
                value={masterEmail}
                onChange={(e) => setMasterEmail(e.target.value)}
                placeholder="clinicanutriserpv@gmail.com"
                className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                autoComplete="off"
              />
            </div>
            <div>
              <Label className="text-[#666] mb-1.5 block">Contraseña Especial</Label>
              <div className="relative">
                <Input
                  type={showMasterPassword ? "text" : "password"}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A] pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPassword(!showMasterPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A55A]"
                >
                  {showMasterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </span>
              ) : "Verificar Identidad"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Paso 2: Cambiar la palabra clave */
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700 text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Identidad Verificada
            </CardTitle>
            <CardDescription>
              Ingresa la nueva palabra clave para los administradores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {success ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
                <h3 className="text-lg font-bold text-[#1A1A1A]">¡Palabra clave actualizada!</h3>
                <p className="text-sm text-[#666]">
                  Todos los administradores deberán usar la nueva palabra clave en su próximo inicio de sesión.
                </p>
                <Button
                  onClick={() => { setSuccess(false); setVerified(false); setMasterEmail(""); setMasterPassword(""); }}
                  variant="outline"
                  className="border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A]/10"
                >
                  Cambiar de nuevo
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-[#666] mb-1.5 block">Nueva Palabra Clave</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassphrase ? "text" : "password"}
                      value={newPassphrase}
                      onChange={(e) => setNewPassphrase(e.target.value)}
                      placeholder="Ej: primavera, luna, estrella..."
                      className="border-[#C5A55A]/30 focus:border-[#C5A55A] pr-10"
                      autoComplete="off"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassphrase(!showNewPassphrase)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A55A]"
                    >
                      {showNewPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#999] mt-1.5">
                    Puede ser una palabra, frase corta o combinación. Comunícala a los administradores.
                  </p>
                </div>
                <Button
                  onClick={handleUpdatePassphrase}
                  disabled={updatePassphraseMutation.isPending}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold"
                >
                  {updatePassphraseMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Actualizando...
                    </span>
                  ) : "Actualizar Palabra Clave"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

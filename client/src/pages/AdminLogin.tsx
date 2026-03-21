import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For now, we'll use a simple client-side check
      // In production, this should be a server-side authentication
      if (email === "clinicanutriserpv@gmail.com" && password === "nutriser2024") {
        // Store admin session in localStorage
        localStorage.setItem("adminSession", JSON.stringify({
          email,
          loggedIn: true,
          timestamp: new Date().toISOString(),
        }));
        toast.success("Sesión iniciada correctamente");
        navigate("/admin/dashboard");
      } else {
        toast.error("Email o contraseña incorrectos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-[#1A1A1A] mb-2">
            Nutriser
          </h1>
          <p className="text-[#666]">Panel de Administración</p>
        </div>

        <Card className="border-2 border-[#C5A55A]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent">
            <CardTitle className="text-[#C5A55A]">Iniciar Sesión</CardTitle>
            <CardDescription>Accede al panel de administración</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#C5A55A]" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="clinicanutriserpv@gmail.com"
                  required
                  className="border-[#C5A55A]/30 focus:border-[#C5A55A]"
                />
              </div>

              {/* Password */}
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
                    className="border-[#C5A55A]/30 focus:border-[#C5A55A] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A55A] hover:text-[#B8963E]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white py-3 text-lg font-bold tracking-wider"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[#999] text-sm mt-6">
          Panel exclusivo para administradores de Nutriser
        </p>
      </div>
    </div>
  );
}

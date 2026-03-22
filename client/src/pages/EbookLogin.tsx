/**
 * EbookLogin - Página de acceso seguro al eBook de Nutriser
 * El comprador ingresa su correo y contraseña (enviados por email al aprobar la compra)
 * para acceder al visor PDF protegido.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { BookOpen, Eye, EyeOff, ArrowLeft, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export default function EbookLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = trpc.ebook.login.useMutation({
    onSuccess: (data) => {
      // Guardar el token de acceso en sessionStorage (se borra al cerrar el navegador)
      sessionStorage.setItem("ebookAccessToken", data.accessToken);
      sessionStorage.setItem("ebookTitle", data.title || "");
      sessionStorage.setItem("ebookPdfUrl", data.pdfUrl || "");
      sessionStorage.setItem("ebookBuyerName", data.buyerName || "");
      toast.success(`¡Bienvenido/a, ${data.buyerName}!`);
      navigate("/ebook/read");
    },
    onError: (error) => {
      toast.error(error.message || "Credenciales incorrectas");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Ingresa tu correo y contraseña");
      return;
    }
    loginMutation.mutate({ email: email.trim(), password });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {/* Header */}
      <header className="bg-[#1A1A1A] py-4 px-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/ebook")}
          className="flex items-center gap-2 text-[#C5A55A] hover:text-[#D4B86A] transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </button>
        <div className="flex items-center gap-2 text-white">
          <BookOpen className="w-5 h-5 text-[#C5A55A]" />
          <span className="font-serif text-lg">Nutriser · eBook</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#C5A55A]/20 overflow-hidden">
            {/* Top accent */}
            <div className="h-2 bg-gradient-to-r from-[#C5A55A] to-[#D4B86A]" />

            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#C5A55A]/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-[#C5A55A]" />
                </div>
              </div>

              <h1 className="text-2xl font-serif font-bold text-[#1A1A1A] text-center mb-2">
                Acceso a tu eBook
              </h1>
              <p className="text-[#666] text-center text-sm mb-8">
                Ingresa las credenciales que recibiste en tu correo cuando tu compra fue aprobada.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full pl-10 pr-4 py-3 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A] bg-[#FAF7F2] text-[#1A1A1A]"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña de acceso"
                      className="w-full pl-10 pr-12 py-3 border border-[#C5A55A]/30 rounded-lg focus:outline-none focus:border-[#C5A55A] bg-[#FAF7F2] text-[#1A1A1A]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#C5A55A] transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-[#C5A55A] hover:bg-[#B39548] text-white font-bold py-3 rounded-lg text-base disabled:opacity-50"
                >
                  {loginMutation.isPending ? "Verificando..." : "Acceder a mi eBook"}
                </Button>
              </form>

              {/* Info */}
              <div className="mt-6 p-4 bg-[#FAF7F2] rounded-lg border border-[#C5A55A]/20">
                <p className="text-xs text-[#888] text-center leading-relaxed">
                  ¿No tienes credenciales aún? Primero debes{" "}
                  <button
                    onClick={() => navigate("/ebook")}
                    className="text-[#C5A55A] underline hover:text-[#B39548]"
                  >
                    comprar el eBook
                  </button>{" "}
                  y esperar la aprobación de tu pago. Recibirás un correo con tus credenciales.
                </p>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700 text-center leading-relaxed">
                  <strong>Importante:</strong> Tus credenciales son personales e intransferibles.
                  El eBook solo puede leerse en línea y no puede descargarse.
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-[#999] mt-6">
            ¿Problemas para acceder? Escríbenos a{" "}
            <a
              href="mailto:clinicanutriserpv@gmail.com"
              className="text-[#C5A55A] hover:underline"
            >
              clinicanutriserpv@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

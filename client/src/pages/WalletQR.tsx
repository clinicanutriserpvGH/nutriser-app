/**
 * WalletQR — Página del QR inteligente del Monedero Nutriser
 *
 * URL: /monedero/:walletNumber
 *
 * Comportamiento:
 *  - Si quien escanea es un admin autenticado → redirige al panel admin con la ficha del paciente
 *  - Cualquier otra persona → redirige directo a la tienda (/memberships)
 */
import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function WalletQR() {
  const [, params] = useRoute("/monedero/:walletNumber");
  const walletNumber = params?.walletNumber ?? "";
  const [, navigate] = useLocation();

  // Verificar si el usuario actual es admin
  const { data: me, isLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (isLoading) return;

    if (me && (me as any).role === "admin") {
      // Admin: ir al panel admin con la ficha del paciente
      navigate(`/admin?tab=wallet&search=${encodeURIComponent(walletNumber)}`);
    } else {
      // Cualquier otra persona: ir a la tienda
      navigate("/memberships");
    }
  }, [me, isLoading, walletNumber, navigate]);

  // Pantalla de carga mientras redirige
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A1A]">
      <img
        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png"
        alt="Nutriser"
        className="w-20 h-20 object-contain mb-6 animate-pulse"
      />
      <div className="w-48 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#8B6914] via-[#C5A55A] to-[#8B6914] rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: "60%" }} />
      </div>
      <p className="text-[#C5A55A] text-sm mt-4 tracking-widest uppercase">Cargando...</p>
    </div>
  );
}

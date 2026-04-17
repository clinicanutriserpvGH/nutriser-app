/*
 * ShopPromoSplash — Pop-up promocional de Nutriser Shop
 * Aparece automáticamente al abrir la app (antes del Splash 0), una vez por sesión.
 * Muestra las 4 imágenes de la tienda + cupones activos dinámicos + botón a la tienda.
 */
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-original_6511adec.png";

const GRID_IMAGES = [
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/hollywood-peel_68e9f2e1.png",
    label: "Hollywood Peel",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/mesoterapia_ac528d0f.png",
    label: "Mesoterapia",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/productos-nutriser_239dc577.png",
    label: "Farmacia Nutriser",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/libro-nutriser_562fd181.png",
    label: "Librería",
  },
];

interface ShopPromoSplashProps {
  onClose: () => void;
  onGoToShop: () => void;
}

export default function ShopPromoSplash({ onClose, onGoToShop }: ShopPromoSplashProps) {
  const [visible, setVisible] = useState(false);
  const { data: promotions = [] } = trpc.promotions.list.useQuery();

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Only show active promos with a discount
  const activePromos = promotions
    .filter((p: any) => p.isActive && p.price && p.regularPrice)
    .slice(0, 3);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const handleGoToShop = () => {
    setVisible(false);
    setTimeout(onGoToShop, 200);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
    >
      {/* Card */}
      <div
        className="relative mx-4 overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "#141008",
          maxWidth: 420,
          width: "100%",
          transition: "opacity 0.25s, transform 0.25s",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors"
          style={{ width: 32, height: 32 }}
          aria-label="Cerrar"
        >
          <X size={16} color="#222" strokeWidth={2.5} />
        </button>

        {/* Logo */}
        <div className="flex justify-center pt-4 pb-2 px-4" style={{ background: "#141008" }}>
          <img
            src={LOGO_URL}
            alt="Nutriser"
            style={{ height: 52, objectFit: "contain" }}
          />
        </div>

        {/* 2x2 image grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            borderTop: "1px solid #5a4010",
            borderBottom: "1px solid #5a4010",
          }}
        >
          {GRID_IMAGES.map((img, i) => (
            <div key={i} className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover"
              />
              {/* Label overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 px-2 py-1"
                style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}
              >
                <span style={{ color: "#C5A55A", fontSize: 11, fontWeight: 600 }}>
                  {img.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="px-5 pt-4 pb-5" style={{ background: "#141008" }}>
          {/* Title */}
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 38,
              fontWeight: 700,
              color: "#D4AF6A",
              lineHeight: 1.1,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Nutriser Shop
          </h2>

          {/* Subtitle */}
          <p
            style={{
              color: "#b8b0a0",
              fontSize: 13,
              textAlign: "center",
              marginBottom: 14,
            }}
          >
            Tu tienda digital de salud y bienestar
          </p>

          {/* Coupon pills — dynamic from DB */}
          {activePromos.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {activePromos.map((promo: any) => {
                const reg = parseFloat(promo.regularPrice ?? "0");
                const sale = parseFloat(promo.price ?? "0");
                const pct = reg > 0 ? Math.round(((reg - sale) / reg) * 100) : 0;
                return (
                  <span
                    key={promo.id}
                    style={{
                      border: "1.5px solid #C5A55A",
                      borderRadius: 999,
                      padding: "4px 14px",
                      color: "#D4AF6A",
                      fontSize: 12,
                      fontWeight: 600,
                      background: "rgba(197,165,90,0.08)",
                    }}
                  >
                    {promo.title}{pct > 0 ? ` ${pct}% OFF` : ""}
                  </span>
                );
              })}
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleGoToShop}
            className="w-full font-semibold rounded-full transition-opacity hover:opacity-90 active:opacity-75"
            style={{
              background: "#C5A55A",
              color: "#141008",
              fontSize: 16,
              padding: "13px 0",
              letterSpacing: "0.02em",
            }}
          >
            Visitar Tienda →
          </button>
        </div>
      </div>
    </div>
  );
}

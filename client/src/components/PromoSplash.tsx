/*
 * PromoSplash — Pop-up de publicidad al entrar a Tienda Nutriser
 * Muestra automáticamente los cupones/promociones activos de la cuponera
 * + una tarjeta promocional del Monedero Nutriser invitando a crear cuenta.
 * La tarjeta del monedero es la PRIMERA slide del carrusel.
 *
 * Guard: si el usuario no está autenticado y presiona "¡LO QUIERO!" o "¡Crear mi Monedero!",
 * se muestra el MobileAuthGuard. Al presionar "Después" en el guard, regresa a la tienda
 * (ya que el usuario estaba navegando en /memberships).
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { X, Gift, Clock, ChevronLeft, ChevronRight, Flame, Wallet, Star, Percent, Sparkles } from "lucide-react";
import NutriserAuthModal from "@/components/NutriserAuthModal";
import { useDeviceType } from "@/hooks/useDeviceType";
import { WalletCard } from "@/components/WalletCardPrint";

const DEMO_CARD = {
  patientName: "SOFÍA MARTÍNEZ",
  walletNumber: "NUT-XXXX-XXXX",
  qrUrl: "https://nutriserpv.com/monedero",
  isActive: true,
};

const WALLET_CARD_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-wallet-card-promo_af671ddf.png";

function useCountdown(expiresAt: Date | string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!expiresAt) { setTimeLeft(""); return; }
    const target = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expirado"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return timeLeft;
}

interface PromoSplashProps {
  onClose: () => void;
  onGoToCoupon?: (promoId: number) => void;
  onOpenWallet?: () => void;
  /** Si el usuario ya inició sesión; si no, se muestra el guard al intentar comprar */
  isAuthenticated?: boolean;
}

interface Promo {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: string | null;
  regularPrice?: string | null;
  maxCoupons?: number | null;
  isActive: boolean;
  expiresAt?: Date | string | null;
  couponsSold?: number;
  couponsRemaining?: number | null;
}

/* ── Tarjeta de oferta/cupón ── */
function PromoCard({ promo, onAction }: { promo: Promo; onAction: () => void }) {
  const countdown = useCountdown(promo.expiresAt);
  // Porcentaje ficticio entre 40-75% basado en ID del cupón (igual que cuponera) para generar urgencia
  const soldPercent = promo.maxCoupons
    ? 40 + ((promo.id * 17 + 7) % 36)
    : 0;

  return (
    <div className="relative w-full flex-shrink-0">
      <div className="relative h-[55vh] min-h-[380px] max-h-[520px] md:max-h-[600px] lg:max-h-[700px] w-full overflow-hidden rounded-2xl">
        {promo.imageUrl ? (
          <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#C5A55A] via-[#D4B96A] to-[#8B6914]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">
          <Flame className="w-3.5 h-3.5" />
          OFERTA
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
          <h3 className="text-white font-bold text-xl md:text-2xl lg:text-3xl leading-tight drop-shadow-lg">{promo.title}</h3>
          {promo.description && (
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{promo.description}</p>
          )}
          {(promo.price || promo.regularPrice) && (
            <div className="flex items-end gap-3">
              {promo.regularPrice && (
                <div>
                  <span className="text-white/50 text-[10px] uppercase tracking-wider">Antes</span>
                  <p className="text-white/50 text-lg line-through">{promo.regularPrice}</p>
                </div>
              )}
              {promo.price && (
                <div>
                  <span className="text-[#C5A55A] text-[10px] uppercase tracking-wider font-bold">Ahora</span>
                  <p className="text-[#C5A55A] text-3xl font-black">{promo.price}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-4">
            {countdown && countdown !== "Expirado" && (
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A55A]" />
                <span className="text-white text-xs font-medium">{countdown}</span>
              </div>
            )}
            {promo.maxCoupons && (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 h-2.5 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full transition-all duration-700" style={{ width: `${soldPercent}%` }} />
                </div>
                <span className="text-orange-200 text-[10px] font-bold whitespace-nowrap">🔥 {soldPercent}% vendido</span>
              </div>
            )}
          </div>
          <button
            onClick={onAction}
            className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold py-3.5 md:py-4 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#C5A55A]/30 transition-all active:scale-[0.98]"
          >
            <Gift className="w-5 h-5" />
            ¡LO QUIERO!
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta promocional del Monedero Nutriser — compacta, tipo crédito ── */
function MonederoPromoCard({ onAction }: { onAction: () => void }) {
  return (
    <div className="relative w-full flex-shrink-0">
      <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#1A1A1A] via-[#222222] to-[#1A1A1A] border border-[#C5A55A]/20">
        {/* Decorative gold line top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A55A]/60 to-transparent" />

        <div className="relative z-10 flex flex-col items-center px-5 py-6">
          {/* Tarjeta real del Monedero — con nombre ficticio */}
          <div className="mb-4 md:mb-6" style={{ transform: "scale(0.78)", transformOrigin: "top center", height: 160 }}>
            <WalletCard card={DEMO_CARD} />
          </div>

          {/* Title */}
          <h3 className="text-[#C5A55A] font-black text-lg md:text-xl lg:text-2xl text-center leading-tight mb-1">
            Crea tu Monedero Nutriser
          </h3>
          <p className="text-gray-400 text-xs md:text-sm text-center leading-relaxed mb-4 md:mb-5 max-w-[260px] md:max-w-[320px]">
            Regístrate y obtén tu tarjeta digital con beneficios exclusivos
          </p>

          {/* Benefits — compact 2-column grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:gap-x-4 md:gap-y-3 mb-5 md:mb-6 w-full max-w-[280px] md:max-w-[340px]">
            {[
              { icon: Percent, text: "Cashback en compras" },
              { icon: Star, text: "Lealtad y recompensas" },
              { icon: Sparkles, text: "4ta consulta GRATIS" },
              { icon: Wallet, text: "Saldo electrónico" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#C5A55A]/15 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-2.5 h-2.5 text-[#C5A55A]" />
                </div>
                <span className="text-white/80 text-[11px] md:text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={onAction}
            className="w-full max-w-[260px] md:max-w-[320px] bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold py-3 md:py-4 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#C5A55A]/30 transition-all active:scale-[0.98]"
          >
            <Wallet className="w-4 h-4" />
            ¡Crear mi Monedero!
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromoSplash({ onClose, onGoToCoupon, onOpenWallet, isAuthenticated = false }: PromoSplashProps) {
  const { data: promotions = [], isLoading: loadingPromos } = trpc.promotions.list.useQuery();
  const { data: tiendaAds = [], isLoading: loadingAds } = (trpc.splashAds.getActive as any).useQuery({ type: 'tienda' });
  const { data: splashConfigData, isLoading: loadingConfig } = (trpc.splashAds.getConfig as any).useQuery({ type: 'tienda' });
  const activePromos = (promotions as Promo[]).filter((p) => p.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [showAuthGuard, setShowAuthGuard] = useState(false);
  const [guardFeature, setGuardFeature] = useState("acceder a esta función");
  const { isMobile } = useDeviceType();
  const [, navigate] = useLocation();

  // Slides: imágenes admin (tipo tienda) + [Monedero SOLO si el admin lo activó Y usuario NO tiene sesión] + promos activas
  // REGLA: showDefault=true → mostrar slide del Monedero SOLO si el usuario NO tiene sesión activa.
  //        Si el usuario ya tiene cuenta/monedero → la slide del Monedero se omite siempre.
  // Las imágenes admin siempre aparecen si están subidas. Los cupones activos siempre aparecen para todos.
  // Si no hay nada activo → totalSlides=0 → shouldShow=false → no aparece nada.
  const adminTiendaAds = tiendaAds as Array<{ id: number; imageUrl: string; title: string }>;
  const adminWantsMonederoSlide = !!(splashConfigData?.showDefault); // Admin lo activó
  // Solo mostrar la slide del monedero si el admin la activó Y el usuario NO tiene sesión
  const showDefaultSlide = adminWantsMonederoSlide && !isAuthenticated;
  const customImageUrl: string | null = (splashConfigData as any)?.customImageUrl ?? null;
  const adminAdsCount = adminTiendaAds.length;
  const defaultSlideCount = showDefaultSlide ? 1 : 0;
  const totalSlides = adminAdsCount + defaultSlideCount + activePromos.length;
  const isAdminTiendaSlide = currentIndex < adminAdsCount;
  const isMonederoSlide = !isAdminTiendaSlide && currentIndex === adminAdsCount && showDefaultSlide;
  const promoIndex = currentIndex - adminAdsCount - defaultSlideCount;

  const shouldShow = totalSlides > 0 && !dismissed;
  const dataLoaded = !loadingPromos && !loadingAds && !loadingConfig;

  // Cuando los datos ya cargaron y no hay nada que mostrar → cerrar automáticamente
  useEffect(() => {
    if (dataLoaded && totalSlides === 0) {
      onClose();
    }
  }, [dataLoaded, totalSlides, onClose]);

  const handleClose = useCallback(() => {
    setDismissed(true);
    onClose();
  }, [onClose]);

  const handleAction = useCallback((promoId: number) => {
    if (!isAuthenticated) {
      // Siempre redirigir al formulario principal de registro/login
      navigate("/mis-tratamientos?returnTo=/memberships");
      handleClose();
      return;
    }
    if (onGoToCoupon) {
      onGoToCoupon(promoId);
    } else {
      handleClose();
    }
  }, [isAuthenticated, isMobile, navigate, onGoToCoupon, handleClose]);

  const handleMonederoAction = useCallback(() => {
    if (!isAuthenticated) {
      // Siempre redirigir al formulario principal de registro/login
      navigate("/mis-tratamientos?returnTo=/memberships");
      handleClose();
      return;
    }
    if (onOpenWallet) {
      onOpenWallet();
    }
    handleClose();
  }, [isAuthenticated, isMobile, navigate, onOpenWallet, handleClose]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  if (!shouldShow) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 z-[110] w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl relative my-auto">
          {/* Header */}
          <div className="text-center mb-3">
            <div className="inline-flex items-center gap-2 bg-[#C5A55A]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-1">
              <Gift className="w-4 h-4 text-[#C5A55A]" />
              <span className="text-[#C5A55A] text-sm md:text-base lg:text-lg font-bold tracking-wide">
                {isMonederoSlide ? "BENEFICIOS EXCLUSIVOS" : "OFERTAS EXCLUSIVAS"}
              </span>
            </div>
            {totalSlides > 1 && (
              <p className="text-white/60 text-xs">
                {currentIndex + 1} de {totalSlides}
              </p>
            )}
          </div>

          {/* Card — admin ads (tienda) first, then monedero, then promos */}
          {isAdminTiendaSlide ? (
            <div className="relative w-full flex-shrink-0">
              <div
                className="relative w-full overflow-hidden rounded-2xl"
                style={{ background: "#141008", border: "1px solid rgba(197,165,90,0.2)" }}
              >
                <img
                  src={adminTiendaAds[currentIndex]?.imageUrl}
                  alt={adminTiendaAds[currentIndex]?.title || 'Publicidad Nutriser'}
                  className="w-full h-auto block"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          ) : isMonederoSlide ? (
            customImageUrl ? (
              // Imagen personalizada del admin para la slide del Monedero
              <div className="relative w-full flex-shrink-0">
                <div
                  className="relative w-full overflow-hidden rounded-2xl"
                  style={{ background: "#141008", border: "1px solid rgba(197,165,90,0.2)" }}
                >
                  <img
                    src={customImageUrl}
                    alt="Monedero Nutriser"
                    className="w-full h-auto block"
                    style={{ display: 'block', cursor: 'pointer' }}
                    onClick={handleMonederoAction}
                  />
                </div>
              </div>
            ) : (
              <MonederoPromoCard onAction={handleMonederoAction} />
            )
          ) : (
            activePromos[promoIndex] && (
              <PromoCard
                promo={activePromos[promoIndex]}
                onAction={() => handleAction(activePromos[promoIndex].id)}
              />
            )
          )}

          {/* Navigation arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition z-20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex
                      ? "bg-[#C5A55A] w-6"
                      : "bg-white/30 hover:bg-white/50 w-2"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Dismiss text */}
          <button
            onClick={handleClose}
            className="w-full text-center mt-3 text-white/50 text-sm hover:text-white/70 transition"
          >
            Después
          </button>
        </div>
      </div>

      {/* Modal de login/registro integrado — funciona sin salir de la página */}
      <NutriserAuthModal
        isOpen={showAuthGuard}
        onClose={() => setShowAuthGuard(false)}
        contextMessage={`Inicia sesión para ${guardFeature}`}
        onSuccess={() => { setShowAuthGuard(false); handleClose(); }}
      />

    </>
  );
}

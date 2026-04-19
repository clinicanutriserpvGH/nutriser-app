/**
 * MobileAuthGuard — Modal de guard de autenticación para usuarios móviles
 *
 * Cuando un usuario de la app móvil (splash/PWA) intenta acceder a una función
 * protegida sin haber iniciado sesión, se muestra este modal con dos opciones:
 *   1. "Crear cuenta / Iniciar sesión" → redirige a Mi Cuenta Nutriser (showSplash)
 *   2. "Después" → cierra el modal y el usuario sigue navegando sin funciones
 *
 * El guard SOLO aplica en móvil/tablet. En desktop (md+) se usa el flujo normal
 * de la tienda (NutriserAuthModal).
 */
import { useDeviceType } from "@/hooks/useDeviceType";
import { UserCircle, X, LogIn, Clock } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

interface MobileAuthGuardProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Descripción de la función que requiere sesión, p. ej. "ver tu monedero" */
  featureDescription?: string;
}

export default function MobileAuthGuard({
  isOpen,
  onClose,
  featureDescription = "acceder a esta función",
}: MobileAuthGuardProps) {
  const { isMobile } = useDeviceType();

  // Solo renderizar en móvil/tablet
  if (!isOpen || !isMobile) return null;

  const handleGoToAccount = () => {
    onClose();
    // Navegar directo a Mi Cuenta Nutriser (/mis-tratamientos)
    // Esta ruta está en NO_SPLASH_ROUTES, por lo que bypasea el splash y va directo al login/registro
    window.location.href = "/mis-tratamientos";
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center">
      {/* Overlay oscuro */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="relative w-full max-w-sm mx-auto rounded-t-3xl shadow-2xl overflow-hidden"
        style={{
          background: "#1A1A1A",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
          animation: "mobileGuardSlideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Barra de agarre */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.08)" }}
          aria-label="Cerrar"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        {/* Contenido */}
        <div className="px-6 pt-2 pb-6">
          {/* Logo + ícono */}
          <div className="flex flex-col items-center mb-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(197,165,90,0.15) 0%, rgba(197,165,90,0.05) 100%)",
                border: "1.5px solid rgba(197,165,90,0.3)",
              }}
            >
              <img
                src={LOGO_URL}
                alt="Nutriser"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h2
              className="text-white font-black text-xl text-center leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Inicia sesión
            </h2>
            <p className="text-white/50 text-sm text-center mt-1">
              Necesitas una cuenta para{" "}
              <span style={{ color: "#C5A55A" }}>{featureDescription}</span>.
            </p>
          </div>

          {/* Separador dorado */}
          <div
            className="mb-5"
            style={{
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(197,165,90,0.4), transparent)",
            }}
          />

          {/* Descripción principal */}
          <p className="text-white/65 text-sm text-center leading-relaxed mb-6 px-1">
            Crea tu cuenta Nutriser para dar seguimiento a tus tratamientos, acceder a descuentos exclusivos en tienda y disfrutar de cursos, contenido especializado y la comunidad de Academia Nutriser.
          </p>

          {/* Botones */}
          <div className="space-y-3">
            {/* Botón principal: ir a Mi Cuenta Nutriser */}
            <button
              onClick={handleGoToAccount}
              className="w-full flex items-center justify-center gap-2.5 font-black text-base py-4 rounded-2xl transition-all active:scale-[0.97]"
              style={{
                background:
                  "linear-gradient(135deg, #C5A55A 0%, #D4B86A 50%, #B8963E 100%)",
                color: "#1A1A1A",
                boxShadow: "0 4px 20px rgba(197,165,90,0.35)",
              }}
            >
              <LogIn className="w-5 h-5" />
              Crear cuenta / Iniciar sesión
            </button>

            {/* Botón secundario: después */}
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-3.5 rounded-2xl transition-all active:scale-[0.97]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <Clock className="w-4 h-4" />
              Después
            </button>
          </div>

          <p className="text-center text-white/30 text-[10px] mt-4">
            Puedes seguir explorando la tienda sin iniciar sesión
          </p>
        </div>
      </div>

      <style>{`
        @keyframes mobileGuardSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

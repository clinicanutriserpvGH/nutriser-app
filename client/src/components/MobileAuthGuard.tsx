/**
 * AuthGuard — Modal de guard de autenticación universal (móvil, tableta y desktop)
 *
 * Cuando un usuario intenta acceder a una función protegida sin haber iniciado sesión,
 * se muestra este modal con dos opciones:
 *   1. "Crear cuenta / Iniciar sesión" → redirige a Mi Monedero Nutriser con returnTo
 *   2. "Después" → cierra el modal y el usuario sigue navegando en la misma página
 *
 * En móvil/tablet: aparece como bottom sheet (desliza desde abajo)
 * En desktop: aparece centrado como modal flotante
 */
import { useDeviceType } from "@/hooks/useDeviceType";
import { X, LogIn, Clock } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

interface MobileAuthGuardProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Descripción de la función que requiere sesión, p. ej. "ver tu monedero" */
  featureDescription?: string;
  /**
   * Ruta a la que regresar después del login/registro.
   * Si se omite, regresa a /memberships por defecto.
   */
  returnTo?: string;
  /**
   * Callback opcional para el botón "Después".
   * Si se omite, simplemente llama a onClose (el usuario se queda en la misma página).
   */
  onDismiss?: () => void;
}

export default function MobileAuthGuard({
  isOpen,
  onClose,
  featureDescription = "acceder a esta función",
  returnTo = "/memberships",
  onDismiss,
}: MobileAuthGuardProps) {
  const { isMobile } = useDeviceType();

  if (!isOpen) return null;

  const handleGoToAccount = () => {
    onClose();
    // Navegar a Mi Monedero Nutriser con returnTo para regresar al destino original
    window.location.href = `/mis-tratamientos?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      onClose(); // Se queda en la misma página
    }
  };

  // En móvil/tablet: bottom sheet. En desktop: modal centrado
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-end justify-center">
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
              Obtén tu Monedero Nutriser, acumula cashback en cada compra y accede a descuentos exclusivos en tratamientos y productos. Lleva el seguimiento de tus tratamientos en clínica, compra fácilmente en nuestra tienda y <span style={{ color: "#C5A55A" }}>agenda tus citas</span> con nuestros especialistas.
            </p>

            {/* Botones */}
            <div className="space-y-3">
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
                Crear Monedero Nutriser
              </button>

              <button
                onClick={handleDismiss}
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
              Puedes seguir explorando sin iniciar sesión
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

  // Desktop: modal centrado
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* Overlay oscuro */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal centrado */}
      <div
        className="relative w-full max-w-md mx-4 rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: "#1A1A1A",
          animation: "desktopGuardFadeIn 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
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
        <div className="px-8 pt-8 pb-8">
          {/* Logo + título */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(197,165,90,0.15) 0%, rgba(197,165,90,0.05) 100%)",
                border: "1.5px solid rgba(197,165,90,0.3)",
              }}
            >
              <img
                src={LOGO_URL}
                alt="Nutriser"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h2
              className="text-white font-black text-2xl text-center leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Inicia sesión
            </h2>
            <p className="text-white/50 text-sm text-center mt-2">
              Necesitas una cuenta para{" "}
              <span style={{ color: "#C5A55A" }}>{featureDescription}</span>.
            </p>
          </div>

          {/* Separador dorado */}
          <div
            className="mb-6"
            style={{
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(197,165,90,0.4), transparent)",
            }}
          />

          {/* Descripción */}
          <p className="text-white/65 text-sm text-center leading-relaxed mb-7 px-2">
            Obtén tu Monedero Nutriser, acumula cashback en cada compra y accede a descuentos exclusivos en tratamientos y productos. Lleva el seguimiento de tus tratamientos en clínica, compra fácilmente en nuestra tienda y <span style={{ color: "#C5A55A" }}>agenda tus citas</span> con nuestros especialistas.
          </p>

          {/* Botones */}
          <div className="space-y-3">
            <button
              onClick={handleGoToAccount}
              className="w-full flex items-center justify-center gap-2.5 font-black text-base py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, #C5A55A 0%, #D4B86A 50%, #B8963E 100%)",
                color: "#1A1A1A",
                boxShadow: "0 4px 20px rgba(197,165,90,0.35)",
              }}
            >
              <LogIn className="w-5 h-5" />
              Crear Monedero Nutriser
            </button>

            <button
              onClick={handleDismiss}
              className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-3.5 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.98]"
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
            Puedes seguir explorando sin iniciar sesión
          </p>
        </div>
      </div>

      <style>{`
        @keyframes desktopGuardFadeIn {
          from { transform: scale(0.95) translateY(8px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

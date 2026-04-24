/**
 * DebtBlockBanner — Banner de bloqueo de compras por deuda activa.
 * Se muestra cuando el paciente tiene una notificación de tipo 'cobro' activa.
 * No bloquea la navegación, solo los botones de compra.
 */
import { AlertTriangle, ShieldX } from "lucide-react";

interface DebtBlockBannerProps {
  /** Si true, muestra el banner de deuda */
  hasDebt: boolean;
  /** Si true, muestra el banner de monedero suspendido (prioridad sobre deuda) */
  isSuspended?: boolean;
  className?: string;
}

export default function DebtBlockBanner({ hasDebt, isSuspended = false, className = "" }: DebtBlockBannerProps) {
  if (!hasDebt && !isSuspended) return null;

  if (isSuspended) {
    return (
      <div className={`flex items-start gap-3 bg-red-50 border border-red-300 rounded-2xl px-4 py-3 ${className}`}>
        <ShieldX className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-700 font-bold text-sm">Monedero Suspendido</p>
          <p className="text-red-600 text-xs mt-0.5 leading-relaxed">
            Tu monedero ha sido dado de baja. No puedes realizar compras.
            Pasa a administración a revisar tu situación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 bg-amber-50 border border-amber-400 rounded-2xl px-4 py-3 ${className}`}>
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-amber-800 font-bold text-sm">Cuenta con deuda activa</p>
        <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
          Tienes una deuda pendiente con Nutriser. Tus compras quedarán
          <strong> pendientes de autorización por administración</strong> hasta que
          regularices tu situación. Acércate a la clínica para más información.
        </p>
      </div>
    </div>
  );
}

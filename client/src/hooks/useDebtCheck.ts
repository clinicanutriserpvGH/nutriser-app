/**
 * useDebtCheck — Verifica si el paciente tiene una deuda activa
 * (notificación de tipo 'cobro' activa en su monedero).
 * Si hasDebt = true, cualquier compra debe mostrarse bloqueada con aviso.
 */
import { trpc } from "@/lib/trpc";

interface UseDebtCheckResult {
  hasDebt: boolean;
  hasPendingRequest: boolean;
  isLoading: boolean;
}

export function useDebtCheck(patientId: number | null | undefined): UseDebtCheckResult {
  const { data, isLoading } = trpc.debtAuth.checkDebt.useQuery(
    { patientId: patientId! },
    { enabled: !!patientId }
  );

  return {
    hasDebt: data?.hasDebt ?? false,
    hasPendingRequest: data?.hasPendingRequest ?? false,
    isLoading,
  };
}

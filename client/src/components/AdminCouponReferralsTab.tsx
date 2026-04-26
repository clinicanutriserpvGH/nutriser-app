/**
 * AdminCouponReferralsTab
 * Estadísticas de referidos de cupones por monedero.
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  isAuthenticated: boolean;
}

export default function AdminCouponReferralsTab({ isAuthenticated }: Props) {
  const [sessionToken, setSessionToken] = useState<string>("");
  const [expandedWallet, setExpandedWallet] = useState<number | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("adminSession") || "";
    setSessionToken(token);
  }, []);

  const { data: stats, isLoading, error } = trpc.couponReferrals.getStats.useQuery(
    { sessionToken },
    { enabled: isAuthenticated && !!sessionToken }
  );

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
            🔗 Referidos de Cupones
          </CardTitle>
          <p className="text-sm text-gray-500">
            Usuarios que han compartido cupones y generado referidos. El cashback se acredita cuando el admin aprueba la compra del referido.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p className="font-medium">Error al cargar estadísticas</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          ) : !stats || stats.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🔗</p>
              <p className="font-medium text-gray-600">Sin referidos aún</p>
              <p className="text-sm mt-1">Cuando los usuarios compartan cupones y sus recomendados se registren, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Resumen global */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#C5A55A]">{stats.length}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Referidores activos</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.reduce((s: number, r: { totalReferidos: number }) => s + r.totalReferidos, 0)}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Referidos registrados</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${(stats.reduce((s: number, r: { totalCashbackGanado: number }) => s + r.totalCashbackGanado, 0) / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">Cashback total MXN</p>
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Usuario</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Monedero</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-700">Referidos</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-700">Compraron</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Cashback</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats as any[]).map((row) => (
                      <>
                        <tr
                          key={row.walletId}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setExpandedWallet(expandedWallet === row.walletId ? null : row.walletId)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{row.patientName}</p>
                            <p className="text-xs text-gray-400">{row.patientEmail}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700">
                              {row.walletNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                              {row.totalReferidos}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              row.referidosQueCompraron > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {row.referidosQueCompraron}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${row.totalCashbackGanado > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              ${(row.totalCashbackGanado / 100).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {expandedWallet === row.walletId
                              ? <ChevronDown className="w-4 h-4 text-gray-400" />
                              : <ChevronRight className="w-4 h-4 text-gray-400" />
                            }
                          </td>
                        </tr>
                        {expandedWallet === row.walletId && row.referidos.length > 0 && (
                          <tr key={`detail-${row.walletId}`} className="bg-gray-50">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                  Referidos de {row.patientName}
                                </p>
                                {row.referidos.map((ref: any) => (
                                  <div key={ref.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">{ref.name}</p>
                                      <p className="text-xs text-gray-400">{ref.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400">
                                        {ref.fechaRegistro ? new Date(ref.fechaRegistro).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                      </span>
                                      {ref.compro ? (
                                        <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ Compró</span>
                                      ) : (
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Sin compra</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

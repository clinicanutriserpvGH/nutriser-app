import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSiteConfigTab() {
  const utils = trpc.useUtils();

  // Obtener configuración actual
  const { data: academiaConfig, isLoading } = trpc.siteVisibility.getAcademiaVisible.useQuery();
  const academiaVisible = academiaConfig?.visible ?? false;

  // Mutation para cambiar visibilidad
  const setAcademiaMutation = trpc.siteVisibility.setAcademiaVisible.useMutation({
    onSuccess: () => {
      utils.siteVisibility.getAcademiaVisible.invalidate();
      toast.success(
        academiaConfig?.visible
          ? "Academia ocultada. El botón desaparece del sitio web."
          : "Academia activada. El botón ya es visible en el sitio web."
      );
    },
    onError: (err) => {
      toast.error("Error al guardar: " + err.message);
    },
  });

  const handleToggle = () => {
    setAcademiaMutation.mutate({ visible: !academiaVisible });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">⚙️ Configuración del Sitio</h2>
        <p className="text-sm text-gray-500 mt-1">
          Controla qué secciones son visibles para los usuarios del sitio web.
        </p>
      </div>

      {/* Card: Academia Nutriser */}
      <Card className="border border-[#C5A55A]/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-[#1A1A1A]">
            <GraduationCap className="w-5 h-5 text-[#C5A55A]" />
            Academia Nutriser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Controla si el botón de <strong>Academia Nutriser</strong> aparece en el sitio web
            (usuarios de computadora). Cuando está oculta, el botón desaparece completamente del
            sitio. Puedes activarla o desactivarla en cualquier momento.
          </p>

          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Cargando configuración...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-lg border border-[#C5A55A]/20">
              <div className="flex items-center gap-3">
                {academiaVisible ? (
                  <Eye className="w-5 h-5 text-green-600" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-semibold text-sm text-[#1A1A1A]">
                    Estado actual:{" "}
                    <span className={academiaVisible ? "text-green-600" : "text-gray-400"}>
                      {academiaVisible ? "Visible — botón activo en el sitio" : "Oculta — botón no visible"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {academiaVisible
                      ? "Los usuarios de PC pueden ver y acceder a la Academia desde el sitio web."
                      : "El botón de Academia no aparece en el sitio web. Los de celular/tablet nunca lo ven."}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleToggle}
                disabled={setAcademiaMutation.isPending}
                variant={academiaVisible ? "outline" : "default"}
                className={
                  academiaVisible
                    ? "border-red-300 text-red-600 hover:bg-red-50"
                    : "bg-[#C5A55A] hover:bg-[#b8944a] text-white"
                }
              >
                {setAcademiaMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : academiaVisible ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {setAcademiaMutation.isPending
                  ? "Guardando..."
                  : academiaVisible
                  ? "Ocultar Academia"
                  : "Mostrar Academia"}
              </Button>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Cómo funciona:</strong> Cuando la Academia está <strong>oculta</strong>,
              el botón desaparece automáticamente del sitio web (PC). Los usuarios de celular y
              tableta nunca ven la Academia en sus pantallas de inicio. Cuando la <strong>activas</strong>,
              el botón reaparece de inmediato en el sitio web.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * AdminSplashAdsTab - Gestión de Splash Ads (Aparador de Publicidad)
 * El admin puede subir imágenes para los pop-ups de inicio y tienda.
 * Flujo: Seleccionar imagen → Previsualizar → Publicar
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload, Eye, Trash2, ToggleLeft, ToggleRight, ImageIcon,
  Info, Smartphone, Store, Home, CheckCircle2, X, Plus
} from "lucide-react";

const SPECS = {
  formato: "JPG o PNG",
  resolucion: "1080 × 1920 px",
  orientacion: "Vertical (9:16, como historia de Instagram)",
  pesoMax: "2 MB máximo",
  consejo: "Texto grande, mínimo 40px, con buen contraste sobre el fondo",
};

type AdType = "inicio" | "tienda";

export default function AdminSplashAdsTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del formulario de nueva publicidad
  const [selectedType, setSelectedType] = useState<AdType>("inicio");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [title, setTitle] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Queries y mutations
  const { data: allAds, refetch } = trpc.splashAds.getAll.useQuery();
  const createMutation = trpc.splashAds.create.useMutation({
    onSuccess: () => {
      toast.success("✅ Publicidad publicada. El pop-up ya está activo para los pacientes.");
      refetch();
      resetForm();
    },
    onError: (e) => toast.error("Error al publicar: " + e.message),
  });
  const toggleMutation = trpc.splashAds.toggle.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.splashAds.delete.useMutation({
    onSuccess: () => { toast.success("Publicidad eliminada"); refetch(); },
  });

  const resetForm = () => {
    setPreviewUrl(null);
    setImageBase64(null);
    setTitle("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Formato no válido. Solo se aceptan JPG o PNG.");
      return;
    }
    // Validar tamaño (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagen muy pesada. El archivo no debe superar 2 MB.");
      return;
    }

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // result es "data:image/jpeg;base64,XXXX"
      const base64 = result.split(",")[1];
      setImageBase64(base64);
      setPreviewUrl(result); // URL completa para preview
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!imageBase64) return;
    setIsUploading(true);
    try {
      await createMutation.mutateAsync({
        type: selectedType,
        imageBase64,
        mimeType: imageMime,
        title: title || undefined,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const inicioAds = allAds?.filter((a) => a.type === "inicio") ?? [];
  const tiendaAds = allAds?.filter((a) => a.type === "tienda") ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#C5A55A]" />
          Aparador de Publicidad
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Sube imágenes para los pop-ups que ven los pacientes al abrir la app y al entrar a la tienda.
        </p>
      </div>

      {/* Especificaciones */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-2">Especificaciones recomendadas para mejores resultados:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-amber-700">
              <span>📐 <strong>Resolución:</strong> {SPECS.resolucion}</span>
              <span>📱 <strong>Orientación:</strong> {SPECS.orientacion}</span>
              <span>🖼️ <strong>Formato:</strong> {SPECS.formato}</span>
              <span>⚖️ <strong>Peso:</strong> {SPECS.pesoMax}</span>
            </div>
            <p className="text-xs text-amber-600 mt-2">💡 {SPECS.consejo}</p>
          </div>
        </div>
      </div>

      {/* Formulario de nueva publicidad */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#C5A55A]" />
          Nueva Publicidad
        </h3>

        {/* Selector de tipo */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setSelectedType("inicio")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
              selectedType === "inicio"
                ? "border-[#C5A55A] bg-amber-50 text-[#C5A55A]"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <Home className="w-4 h-4" />
            Pop-up de Inicio
          </button>
          <button
            onClick={() => setSelectedType("tienda")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
              selectedType === "tienda"
                ? "border-[#C5A55A] bg-amber-50 text-[#C5A55A]"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <Store className="w-4 h-4" />
            Pop-up de Tienda
          </button>
        </div>

        {/* Título opcional */}
        <input
          type="text"
          placeholder="Nombre interno (ej: Promo Verano 2026) — solo para referencia"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30"
        />

        {/* Zona de subida */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            previewUrl ? "border-[#C5A55A] bg-amber-50/30" : "border-gray-300 hover:border-[#C5A55A] hover:bg-amber-50/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />

          {previewUrl ? (
            <div className="flex items-center gap-4 p-4">
              {/* Miniatura */}
              <div className="relative w-16 h-28 rounded-lg overflow-hidden shrink-0 shadow-md border border-gray-200">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Imagen lista
                </p>
                <p className="text-xs text-gray-500 mt-1">Toca "Previsualizar" para ver cómo quedará el pop-up</p>
                <button
                  onClick={(e) => { e.stopPropagation(); resetForm(); }}
                  className="text-xs text-red-400 hover:text-red-600 mt-2 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Cambiar imagen
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">Toca para seleccionar imagen</p>
              <p className="text-xs text-gray-400 mt-1">JPG o PNG · máx. 2 MB · 1080×1920 px</p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        {previewUrl && (
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setShowPreviewModal(true)}
            >
              <Eye className="w-4 h-4" />
              Previsualizar
            </Button>
            <Button
              className="flex-1 gap-2 bg-[#C5A55A] hover:bg-[#b8954e] text-white"
              onClick={handlePublish}
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Publicando...</span>
              ) : (
                <><Upload className="w-4 h-4" /> Publicar</>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Modal de previsualización */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Así verá el paciente el pop-up de {selectedType === "inicio" ? "inicio" : "tienda"}
                </span>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulación del pop-up */}
            <div className="relative bg-black" style={{ aspectRatio: "9/16", maxHeight: "70vh" }}>
              <img
                src={previewUrl}
                alt="Preview del pop-up"
                className="w-full h-full object-cover"
              />
              {/* Overlay con botón de cerrar simulado */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/40 to-transparent">
                <div className="flex justify-center">
                  <div className="bg-white/20 backdrop-blur-sm border border-white/40 rounded-full px-6 py-2 text-white text-sm font-medium">
                    Ver más →
                  </div>
                </div>
              </div>
              {/* Botón X simulado */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="p-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowPreviewModal(false)}>
                Cambiar imagen
              </Button>
              <Button
                className="flex-1 bg-[#C5A55A] hover:bg-[#b8954e] text-white gap-2"
                onClick={() => { setShowPreviewModal(false); handlePublish(); }}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4" />
                Publicar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Listado de publicidades existentes */}
      {[
        { label: "Pop-ups de Inicio", icon: Home, ads: inicioAds, type: "inicio" as AdType },
        { label: "Pop-ups de Tienda", icon: Store, ads: tiendaAds, type: "tienda" as AdType },
      ].map(({ label, icon: Icon, ads }) => (
        <div key={label}>
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4 text-[#C5A55A]" />
            {label}
            <Badge variant="secondary" className="text-xs">{ads.length}</Badge>
          </h3>

          {ads.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
              No hay publicidades activas. Sube la primera arriba.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ads.map((ad) => (
                <div key={ad.id} className={`relative rounded-xl overflow-hidden border-2 shadow-sm ${ad.isActive ? "border-green-400" : "border-gray-200 opacity-60"}`}>
                  {/* Imagen */}
                  <div className="relative" style={{ aspectRatio: "9/16" }}>
                    <img src={ad.imageUrl} alt={ad.title ?? "Splash ad"} className="w-full h-full object-cover" />
                    {/* Badge activo/inactivo */}
                    <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${ad.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
                      {ad.isActive ? "Activo" : "Inactivo"}
                    </div>
                  </div>

                  {/* Controles */}
                  <div className="bg-white p-2 flex items-center justify-between gap-1">
                    <p className="text-xs text-gray-500 truncate flex-1">{ad.title || `Ad #${ad.id}`}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleMutation.mutate({ id: ad.id, isActive: !ad.isActive })}
                        className={`p-1.5 rounded-lg transition-colors ${ad.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}
                        title={ad.isActive ? "Desactivar" : "Activar"}
                      >
                        {ad.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar esta publicidad?")) deleteMutation.mutate({ id: ad.id });
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

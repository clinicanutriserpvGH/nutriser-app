/**
 * AdminStoreBannersTab — Aparador Tienda Principal
 * Permite al admin subir, activar/desactivar, reordenar y eliminar
 * las imágenes del carrusel principal de la Tienda Nutriser.
 *
 * Especificaciones de imagen recomendadas:
 *   - Relación de aspecto: 16:9 (horizontal) — ej. 1200×675 px o 1920×1080 px
 *   - Resolución mínima: 1200×675 px
 *   - Peso máximo: 3 MB
 *   - Formato: JPG o PNG
 *   - El texto importante debe estar centrado o hacia la izquierda (no en los bordes)
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, ImageIcon, Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MAX_FILE_SIZE_MB = 3;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AdminStoreBannersTab() {
  const utils = trpc.useUtils();
  const { data: banners = [], isLoading } = trpc.storeBanners.getAll.useQuery();

  const createMutation = trpc.storeBanners.create.useMutation({
    onSuccess: () => { utils.storeBanners.getAll.invalidate(); toast.success("Banner subido correctamente"); setPreview(null); setTitle(""); setLinkUrl(""); },
    onError: (e) => toast.error("Error al subir: " + e.message),
  });
  const toggleMutation = trpc.storeBanners.toggle.useMutation({
    onSuccess: () => utils.storeBanners.getAll.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.storeBanners.delete.useMutation({
    onSuccess: () => { utils.storeBanners.getAll.invalidate(); toast.success("Banner eliminado"); },
    onError: (e) => toast.error(e.message),
  });
  const orderMutation = trpc.storeBanners.updateOrder.useMutation({
    onSuccess: () => utils.storeBanners.getAll.invalidate(),
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [fileMime, setFileMime] = useState<string>("image/jpeg");
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Solo se aceptan imágenes JPG, PNG o WebP");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`La imagen no debe superar ${MAX_FILE_SIZE_MB} MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // result = "data:image/jpeg;base64,XXXX"
      const base64 = result.split(",")[1];
      setFileBase64(base64);
      setFileMime(file.type);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!fileBase64) { toast.error("Selecciona una imagen primero"); return; }
    createMutation.mutate({
      imageBase64: fileBase64,
      mimeType: fileMime,
      title: title || undefined,
      linkUrl: linkUrl || undefined,
      sortOrder: banners.length,
    });
  };

  const moveUp = (banner: { id: number; sortOrder: number }, idx: number) => {
    if (idx === 0) return;
    const prev = banners[idx - 1];
    orderMutation.mutate({ id: banner.id, sortOrder: prev.sortOrder });
    orderMutation.mutate({ id: prev.id, sortOrder: banner.sortOrder });
  };

  const moveDown = (banner: { id: number; sortOrder: number }, idx: number) => {
    if (idx === banners.length - 1) return;
    const next = banners[idx + 1];
    orderMutation.mutate({ id: banner.id, sortOrder: next.sortOrder });
    orderMutation.mutate({ id: next.id, sortOrder: banner.sortOrder });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-black text-[#1A1A1A]">🛍️ Aparador — Tienda Principal</h2>
        <p className="text-sm text-[#1A1A1A]/60 mt-1">
          Gestiona las imágenes del carrusel principal que aparece en la Tienda Nutriser.
          Los banners marcados como <strong>Sistema</strong> son automáticos (no se pueden eliminar, solo activar/desactivar).
        </p>
      </div>

      {/* Especificaciones de imagen */}
      <Card className="border-[#C5A55A]/30 bg-[#FAF7F2]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#C5A55A] flex items-center gap-2">
            <Info className="w-4 h-4" /> Especificaciones de imagen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-[#C5A55A]/20 text-center">
              <div className="font-black text-[#C5A55A] text-lg">16:9</div>
              <div className="text-[#1A1A1A]/60 text-xs">Relación de aspecto</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-[#C5A55A]/20 text-center">
              <div className="font-black text-[#C5A55A] text-lg">1200×675</div>
              <div className="text-[#1A1A1A]/60 text-xs">Píxeles mínimos</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-[#C5A55A]/20 text-center">
              <div className="font-black text-[#C5A55A] text-lg">≤ 3 MB</div>
              <div className="text-[#1A1A1A]/60 text-xs">Peso máximo</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-[#C5A55A]/20 text-center">
              <div className="font-black text-[#C5A55A] text-lg">JPG / PNG</div>
              <div className="text-[#1A1A1A]/60 text-xs">Formato</div>
            </div>
          </div>
          <p className="text-xs text-[#1A1A1A]/50 mt-3">
            💡 Tip: El texto importante debe estar centrado o hacia la izquierda de la imagen.
            En móvil se recortan ligeramente los bordes laterales.
          </p>
        </CardContent>
      </Card>

      {/* Subir nuevo banner */}
      <Card className="border-[#C5A55A]/20">
        <CardHeader>
          <CardTitle className="text-lg text-[#1A1A1A]">Subir nuevo banner</CardTitle>
          <CardDescription>La imagen se mostrará en el carrusel de la Tienda Nutriser</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-[#C5A55A]/40 rounded-xl p-6 text-center cursor-pointer hover:border-[#C5A55A] hover:bg-[#C5A55A]/5 transition-all"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <div className="space-y-2">
                <img src={preview} alt="Vista previa" className="w-full max-h-48 object-contain rounded-lg mx-auto" />
                <p className="text-xs text-[#1A1A1A]/50">Haz clic para cambiar la imagen</p>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="w-12 h-12 text-[#C5A55A]/40 mx-auto" />
                <p className="text-sm font-medium text-[#1A1A1A]/60">Haz clic para seleccionar imagen</p>
                <p className="text-xs text-[#1A1A1A]/40">JPG, PNG o WebP · máx. 3 MB · relación 16:9</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#1A1A1A]/60">Título interno (referencia, no se muestra)</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Promo Día de las Madres"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-[#1A1A1A]/60">URL al hacer clic (opcional)</Label>
              <Input
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!fileBase64 || createMutation.isPending}
            className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold"
          >
            <Upload className="w-4 h-4 mr-2" />
            {createMutation.isPending ? "Subiendo..." : "Subir banner al carrusel"}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de banners */}
      <Card className="border-[#C5A55A]/20">
        <CardHeader>
          <CardTitle className="text-lg text-[#1A1A1A]">
            Banners actuales ({banners.length})
          </CardTitle>
          <CardDescription>
            {banners.filter((b: any) => b.isActive).length} activos ·{" "}
            {banners.filter((b: any) => !b.isActive).length} inactivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#1A1A1A]/40">Cargando...</div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-[#C5A55A]/30 mx-auto mb-3" />
              <p className="text-[#1A1A1A]/50 text-sm">No hay banners. Sube el primero arriba.</p>
              <p className="text-[#1A1A1A]/40 text-xs mt-1">
                Mientras no haya banners, se mostrarán los banners automáticos de paquetes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((banner: any, idx: number) => (
                <div
                  key={banner.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    banner.isActive
                      ? "border-[#C5A55A]/30 bg-[#FAF7F2]"
                      : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  {/* Imagen miniatura */}
                  <div className="w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || `Banner ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[#1A1A1A] truncate">
                        {banner.title || `Banner ${idx + 1}`}
                      </span>
                      <Badge
                        variant={banner.isActive ? "default" : "secondary"}
                        className={banner.isActive ? "bg-green-100 text-green-700 text-xs" : "text-xs"}
                      >
                        {banner.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      {banner.isSystem && (
                        <Badge variant="outline" className="text-xs border-[#C5A55A]/50 text-[#C5A55A] flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Sistema
                        </Badge>
                      )}
                    </div>
                    {banner.linkUrl && (
                      <p className="text-xs text-[#1A1A1A]/40 truncate mt-0.5">{banner.linkUrl}</p>
                    )}
                    <p className="text-xs text-[#1A1A1A]/30 mt-0.5">Orden: {banner.sortOrder}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Subir/bajar */}
                    <button
                      onClick={() => moveUp(banner, idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-[#C5A55A]/10 disabled:opacity-30 transition-all"
                      title="Subir"
                    >
                      <ArrowUp className="w-4 h-4 text-[#C5A55A]" />
                    </button>
                    <button
                      onClick={() => moveDown(banner, idx)}
                      disabled={idx === banners.length - 1}
                      className="p-1.5 rounded-lg hover:bg-[#C5A55A]/10 disabled:opacity-30 transition-all"
                      title="Bajar"
                    >
                      <ArrowDown className="w-4 h-4 text-[#C5A55A]" />
                    </button>
                    {/* Activar/desactivar */}
                    <button
                      onClick={() => toggleMutation.mutate({ id: banner.id, isActive: !banner.isActive })}
                      className="p-1.5 rounded-lg hover:bg-[#C5A55A]/10 transition-all"
                      title={banner.isActive ? "Desactivar" : "Activar"}
                    >
                      {banner.isActive
                        ? <Eye className="w-4 h-4 text-green-600" />
                        : <EyeOff className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                    {/* Eliminar — solo para banners no-sistema */}
                    {!banner.isSystem && (
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar este banner?")) {
                            deleteMutation.mutate({ id: banner.id });
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

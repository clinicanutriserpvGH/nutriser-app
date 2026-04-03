import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff, Plus, Upload, Pencil, X, Check } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  nutricion: "Nutrición",
  estetica: "Estética",
  ambos: "Nutrición & Estética",
};

type Photo = {
  id: number;
  patientName: string;
  category: string;
  description: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
  isVisible: boolean;
  sortOrder: number;
};

export default function AdminBeforeAfterTab() {
  const utils = trpc.useUtils();
  const { data: photos, isLoading } = trpc.beforeAfter.listAll.useQuery();

  const deleteMutation = trpc.beforeAfter.delete.useMutation({
    onSuccess: () => {
      utils.beforeAfter.listAll.invalidate();
      utils.beforeAfter.list.invalidate();
      toast.success("Foto eliminada correctamente");
    },
    onError: () => toast.error("Error al eliminar la foto"),
  });

  const toggleMutation = trpc.beforeAfter.toggleVisibility.useMutation({
    onSuccess: () => {
      utils.beforeAfter.listAll.invalidate();
      utils.beforeAfter.list.invalidate();
    },
    onError: () => toast.error("Error al cambiar visibilidad"),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  return (
    <div className="space-y-6">
      <Card className="border-[#C5A55A]/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#1A1A1A] text-lg">Fotos Antes y Después</CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#C5A55A] hover:bg-[#b8944d] text-black text-xs"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar Foto
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <AddPhotoForm
              onSuccess={() => {
                setShowForm(false);
                utils.beforeAfter.listAll.invalidate();
                utils.beforeAfter.list.invalidate();
              }}
            />
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Cargando...</div>
          ) : !photos || photos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No hay fotos aún. Agrega la primera usando el botón de arriba.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`border rounded-xl overflow-hidden ${
                    photo.isVisible ? "border-[#C5A55A]/30" : "border-gray-200 opacity-60"
                  }`}
                >
                  {/* Imágenes */}
                  <div className="grid grid-cols-2 h-48">
                    <div className="relative">
                      <img
                        src={photo.beforeImageUrl}
                        alt="Antes"
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                        Antes
                      </div>
                    </div>
                    <div className="relative">
                      <img
                        src={photo.afterImageUrl}
                        alt="Después"
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute bottom-1 left-1 bg-[#C5A55A]/80 text-black text-xs px-2 py-0.5 rounded font-semibold">
                        Después
                      </div>
                    </div>
                  </div>

                  {/* Info y acciones */}
                  <div className="p-3 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-[#1A1A1A]">{photo.patientName}</span>
                      <span className="text-xs text-[#C5A55A] bg-[#C5A55A]/10 px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[photo.category] ?? photo.category}
                      </span>
                    </div>
                    {photo.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{photo.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {/* Botón Editar */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs text-[#C5A55A] border-[#C5A55A]/40 hover:bg-[#C5A55A]/10"
                        onClick={() => setEditingPhoto(photo as Photo)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      {/* Botón Ocultar/Mostrar */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() =>
                          toggleMutation.mutate({ id: photo.id, isVisible: !photo.isVisible })
                        }
                        disabled={toggleMutation.isPending}
                      >
                        {photo.isVisible ? (
                          <><EyeOff className="w-3 h-3 mr-1" /> Ocultar</>
                        ) : (
                          <><Eye className="w-3 h-3 mr-1" /> Mostrar</>
                        )}
                      </Button>
                      {/* Botón Eliminar */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 text-xs"
                        onClick={() => {
                          if (confirm(`¿Eliminar la foto de ${photo.patientName}?`)) {
                            deleteMutation.mutate({ id: photo.id });
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      {editingPhoto && (
        <EditPhotoModal
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSuccess={() => {
            setEditingPhoto(null);
            utils.beforeAfter.listAll.invalidate();
            utils.beforeAfter.list.invalidate();
          }}
        />
      )}
    </div>
  );
}

function EditPhotoModal({
  photo,
  onClose,
  onSuccess,
}: {
  photo: Photo;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [patientName, setPatientName] = useState(photo.patientName);
  const [category, setCategory] = useState<"nutricion" | "estetica" | "ambos">(
    photo.category as "nutricion" | "estetica" | "ambos"
  );
  const [description, setDescription] = useState(photo.description ?? "");

  const updateMutation = trpc.beforeAfter.update.useMutation({
    onSuccess: () => {
      toast.success("Foto actualizada correctamente");
      onSuccess();
    },
    onError: () => toast.error("Error al actualizar la foto"),
  });

  const handleSave = () => {
    if (!patientName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    updateMutation.mutate({
      id: photo.id,
      patientName: patientName.trim(),
      category,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Editar Transformación</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview de imágenes */}
        <div className="grid grid-cols-2 gap-2 mb-5 h-32 rounded-lg overflow-hidden">
          <div className="relative">
            <img src={photo.beforeImageUrl} alt="Antes" className="w-full h-full object-cover object-top" />
            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">Antes</div>
          </div>
          <div className="relative">
            <img src={photo.afterImageUrl} alt="Después" className="w-full h-full object-cover object-top" />
            <div className="absolute bottom-1 left-1 bg-[#C5A55A]/80 text-black text-xs px-2 py-0.5 rounded font-semibold">Después</div>
          </div>
        </div>

        {/* Campos editables */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Nombre o iniciales del paciente *</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Ej: Juana M."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C5A55A] text-[#1A1A1A]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Categoría *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "nutricion" | "estetica" | "ambos")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C5A55A] text-[#1A1A1A]"
            >
              <option value="nutricion">Nutrición</option>
              <option value="estetica">Estética</option>
              <option value="ambos">Nutrición & Estética</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Increíble transformación con dedicación y esfuerzo."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C5A55A] text-[#1A1A1A] resize-none"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 text-sm"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-[#C5A55A] hover:bg-[#b8944d] text-black text-sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <Check className="w-4 h-4 mr-1" />
            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddPhotoForm({ onSuccess }: { onSuccess: () => void }) {
  const [patientName, setPatientName] = useState("");
  const [category, setCategory] = useState<"nutricion" | "estetica" | "ambos">("nutricion");
  const [description, setDescription] = useState("");
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [beforeBase64, setBeforeBase64] = useState<string | null>(null);
  const [afterBase64, setAfterBase64] = useState<string | null>(null);
  const [beforeFilename, setBeforeFilename] = useState("");
  const [afterFilename, setAfterFilename] = useState("");
  const [beforeMime, setBeforeMime] = useState("");
  const [afterMime, setAfterMime] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.beforeAfter.uploadImage.useMutation();
  const createMutation = trpc.beforeAfter.create.useMutation({
    onSuccess,
    onError: () => {
      toast.error("Error al guardar la foto");
      setIsUploading(false);
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "before" | "after"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(",")[1];
      if (type === "before") {
        setBeforePreview(result);
        setBeforeBase64(base64);
        setBeforeFilename(file.name);
        setBeforeMime(file.type);
      } else {
        setAfterPreview(result);
        setAfterBase64(base64);
        setAfterFilename(file.name);
        setAfterMime(file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!patientName.trim()) return toast.error("Ingresa el nombre del paciente");
    if (!beforeBase64) return toast.error("Selecciona la foto ANTES");
    if (!afterBase64) return toast.error("Selecciona la foto DESPUÉS");

    setIsUploading(true);
    try {
      const [beforeResult, afterResult] = await Promise.all([
        uploadMutation.mutateAsync({ base64: beforeBase64, filename: beforeFilename, mimeType: beforeMime }),
        uploadMutation.mutateAsync({ base64: afterBase64, filename: afterFilename, mimeType: afterMime }),
      ]);
      await createMutation.mutateAsync({
        patientName: patientName.trim(),
        category,
        description: description.trim() || undefined,
        beforeImageUrl: beforeResult.url,
        afterImageUrl: afterResult.url,
        sortOrder: 0,
      });
      toast.success("Foto agregada correctamente");
    } catch {
      toast.error("Error al subir las imágenes");
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] rounded-xl p-4 mb-6 border border-[#C5A55A]/20">
      <h3 className="font-semibold text-[#1A1A1A] mb-4 text-sm">Nueva Transformación</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">Nombre o iniciales del paciente *</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Ej: Juana M."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C5A55A]"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Categoría *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as "nutricion" | "estetica" | "ambos")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C5A55A]"
          >
            <option value="nutricion">Nutrición</option>
            <option value="estetica">Estética</option>
            <option value="ambos">Nutrición & Estética</option>
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Descripción breve (opcional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Perdió 12 kg en 3 meses"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C5A55A]"
          />
        </div>

        {/* Foto ANTES */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Foto ANTES *</label>
          <input ref={beforeRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "before")} />
          <div
            onClick={() => beforeRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-[#C5A55A] transition-colors overflow-hidden"
          >
            {beforePreview ? (
              <img src={beforePreview} alt="Antes" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <Upload className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Subir foto ANTES</span>
              </div>
            )}
          </div>
        </div>

        {/* Foto DESPUÉS */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Foto DESPUÉS *</label>
          <input ref={afterRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "after")} />
          <div
            onClick={() => afterRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-[#C5A55A] transition-colors overflow-hidden"
          >
            {afterPreview ? (
              <img src={afterPreview} alt="Después" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <Upload className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Subir foto DESPUÉS</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button
          onClick={handleSubmit}
          disabled={isUploading}
          className="bg-[#C5A55A] hover:bg-[#b8944d] text-black text-xs"
          size="sm"
        >
          {isUploading ? "Subiendo..." : "Guardar Transformación"}
        </Button>
      </div>
    </div>
  );
}

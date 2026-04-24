import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const CATEGORIES = [
  { value: "nutricion", label: "Nutrición" },
  { value: "corporales", label: "Corporales" },
  { value: "faciales", label: "Faciales" },
  { value: "medicina", label: "Medicina" },
  { value: "otros", label: "Otros" },
];

const BADGES = [
  { value: "none", label: "Sin badge" },
  { value: "mostPopular", label: "Más Popular" },
  { value: "maxSavings", label: "Máximo Ahorro" },
  { value: "new", label: "Nuevo" },
];

const BADGE_LABELS: Record<string, string> = {
  mostPopular: "Más Popular",
  maxSavings: "Máximo Ahorro",
  new: "Nuevo",
};

type Pkg = {
  id: number;
  slug: string;
  name: string;
  nameEn?: string;
  price: number;
  regularPrice?: number;
  description?: string;
  descriptionEn?: string;
  features?: string;
  featuresEn?: string;
  imageUrl?: string;
  category: string;
  badge?: string;
  isActive: boolean;
  sortOrder: number;
};

const emptyForm = {
  slug: "",
  name: "",
  nameEn: "",
  price: "",
  regularPrice: "",
  description: "",
  descriptionEn: "",
  features: "",
  featuresEn: "",
  imageUrl: "",
  category: "nutricion",
  badge: "none",
  isActive: true,
  sortOrder: "0",
  passphrase: "",
};

export default function AdminPackages() {
  const [adminSession] = useState(() => localStorage.getItem("adminSession") || "");
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletePassphrase, setDeletePassphrase] = useState("");

  const pkgsQuery = trpc.packages.listAll.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.packages.create.useMutation({
    onSuccess: () => {
      toast.success("Paquete creado correctamente");
      utils.packages.listAll.invalidate();
      setShowForm(false);
      setForm({ ...emptyForm });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.packages.update.useMutation({
    onSuccess: () => {
      toast.success("Paquete actualizado");
      utils.packages.listAll.invalidate();
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.packages.delete.useMutation({
    onSuccess: () => {
      toast.success("Paquete eliminado");
      utils.packages.listAll.invalidate();
      setDeleteId(null);
      setDeletePassphrase("");
    },
    onError: (e) => toast.error(e.message),
  });

  const parseFeatures = (str: string): string[] =>
    str.split("\n").map((s) => s.trim()).filter(Boolean);

  const handleEdit = (pkg: Pkg) => {
    setEditingId(pkg.id);
    setForm({
      slug: pkg.slug,
      name: pkg.name,
      nameEn: pkg.nameEn ?? "",
      price: String(pkg.price),
      regularPrice: pkg.regularPrice ? String(pkg.regularPrice) : "",
      description: pkg.description ?? "",
      descriptionEn: pkg.descriptionEn ?? "",
      features: pkg.features ? JSON.parse(pkg.features).join("\n") : "",
      featuresEn: pkg.featuresEn ? JSON.parse(pkg.featuresEn).join("\n") : "",
      imageUrl: pkg.imageUrl ?? "",
      category: pkg.category,
      badge: pkg.badge ?? "none",
      isActive: pkg.isActive,
      sortOrder: String(pkg.sortOrder),
      passphrase: "",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.passphrase) { toast.error("Ingresa la palabra clave"); return; }
    if (!form.name || !form.price) { toast.error("Nombre y precio son obligatorios"); return; }
    const price = parseInt(form.price);
    const regularPrice = form.regularPrice ? parseInt(form.regularPrice) : undefined;
    const sortOrder = parseInt(form.sortOrder) || 0;
    const features = form.features ? parseFeatures(form.features) : undefined;
    const featuresEn = form.featuresEn ? parseFeatures(form.featuresEn) : undefined;

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: form.name,
        nameEn: form.nameEn || undefined,
        price,
        regularPrice: regularPrice ?? null,
        description: form.description || undefined,
        descriptionEn: form.descriptionEn || undefined,
        features,
        featuresEn,
        imageUrl: form.imageUrl || undefined,
        category: form.category,
        badge: form.badge === "none" ? null : (form.badge || null),
        isActive: form.isActive,
        sortOrder,
        passphrase: form.passphrase,
      });
    } else {
      if (!form.slug) { toast.error("El slug es obligatorio"); return; }
      createMutation.mutate({
        slug: form.slug,
        name: form.name,
        nameEn: form.nameEn || undefined,
        price,
        regularPrice,
        description: form.description || undefined,
        descriptionEn: form.descriptionEn || undefined,
        features,
        featuresEn,
        imageUrl: form.imageUrl || undefined,
        category: form.category,
        badge: form.badge === "none" ? undefined : (form.badge || undefined),
        isActive: form.isActive,
        sortOrder,
        passphrase: form.passphrase,
      });
    }
  };

  const packages: Pkg[] = pkgsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F5F1E8] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-[#1A1A1A]">Gestión de Paquetes</h1>
            <p className="text-sm text-gray-500 mt-1">Crea, edita y administra los paquetes de membresía del sitio</p>
          </div>
          <Button
            onClick={() => { setEditingId(null); setForm({ ...emptyForm }); setShowForm(true); }}
            className="bg-[#C5A55A] hover:bg-[#b8944a] text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Paquete
          </Button>
        </div>

        {/* Package list */}
        {pkgsQuery.isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#C5A55A]" /></div>
        ) : packages.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay paquetes registrados. Crea el primero.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`border-l-4 ${pkg.isActive ? "border-l-[#C5A55A]" : "border-l-gray-300 opacity-70"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-bold text-[#1A1A1A] truncate">{pkg.name}</CardTitle>
                      <p className="text-xs text-gray-400 mt-0.5">{pkg.slug} · {pkg.category}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {pkg.badge && (
                        <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">{BADGE_LABELS[pkg.badge] ?? pkg.badge}</Badge>
                      )}
                      {pkg.isActive ? (
                        <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">Activo</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-gray-400">Inactivo</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-[#C5A55A]">${pkg.price.toLocaleString()}</span>
                    {pkg.regularPrice && (
                      <span className="text-sm text-gray-400 line-through">${pkg.regularPrice.toLocaleString()}</span>
                    )}
                    <span className="text-xs text-gray-400">MXN</span>
                  </div>
                  {pkg.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">{pkg.description}</p>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 text-xs"
                      onClick={() => handleEdit(pkg)}
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 text-xs text-red-600 hover:bg-red-50 border-red-200"
                      onClick={() => setDeleteId(pkg.id)}
                    >
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { if (!v) { setShowForm(false); setEditingId(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#1A1A1A]">
              {editingId ? "Editar Paquete" : "Nuevo Paquete"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Slug (solo al crear) */}
            {!editingId && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-600 mb-1 block">Slug (ID único) *</Label>
                  <Input
                    placeholder="pkg-nutricion"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Solo letras, números y guiones</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600 mb-1 block">Orden</Label>
                  <Input type="number" placeholder="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                </div>
              </div>
            )}

            {/* Nombre */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1 block">Nombre (ES) *</Label>
                <Input placeholder="Paquete Nutrición" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1 block">Nombre (EN)</Label>
                <Input placeholder="Nutrition Package" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
              </div>
            </div>

            {/* Precios */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1 block">Precio MXN *</Label>
                <Input type="number" placeholder="2000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1 block">Precio regular (tachado)</Label>
                <Input type="number" placeholder="3200" value={form.regularPrice} onChange={(e) => setForm({ ...form, regularPrice: e.target.value })} />
              </div>
            </div>

            {/* Categoría y badge */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1 block">Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1 block">Badge</Label>
                <Select value={form.badge} onValueChange={(v) => setForm({ ...form, badge: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BADGES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descripción */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1 block">Descripción (ES)</Label>
                <Textarea rows={3} placeholder="Descripción del paquete..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1 block">Descripción (EN)</Label>
                <Textarea rows={3} placeholder="Package description..." value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1 block">Beneficios (ES) — uno por línea</Label>
                <Textarea rows={4} placeholder={"4 asesorías nutricionales\n4 escaneos corporales"} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1 block">Beneficios (EN) — uno por línea</Label>
                <Textarea rows={4} placeholder={"4 nutritional consultations\n4 body scans"} value={form.featuresEn} onChange={(e) => setForm({ ...form, featuresEn: e.target.value })} />
              </div>
            </div>

            {/* Imagen */}
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1 block">URL de imagen</Label>
              <Input placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>

            {/* Activo */}
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label className="text-sm text-gray-700">{form.isActive ? "Visible en el sitio" : "Oculto (inactivo)"}</Label>
            </div>

            {/* Palabra clave */}
            <div className="border-t pt-4">
              <Label className="text-xs font-semibold text-red-600 mb-1 block">Palabra clave de seguridad *</Label>
              <Input
                type="password"
                placeholder="Ingresa la palabra clave del admin"
                value={form.passphrase}
                onChange={(e) => setForm({ ...form, passphrase: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
            <Button
              className="bg-[#C5A55A] hover:bg-[#b8944a] text-white"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Guardar cambios" : "Crear paquete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={(v) => { if (!v) { setDeleteId(null); setDeletePassphrase(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Eliminar paquete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Esta acción no se puede deshacer. Ingresa la palabra clave para confirmar.</p>
          <Input
            type="password"
            placeholder="Palabra clave de seguridad"
            value={deletePassphrase}
            onChange={(e) => setDeletePassphrase(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteId(null); setDeletePassphrase(""); }}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deletePassphrase) { toast.error("Ingresa la palabra clave"); return; }
                deleteMutation.mutate({ id: deleteId!, passphrase: deletePassphrase });
              }}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

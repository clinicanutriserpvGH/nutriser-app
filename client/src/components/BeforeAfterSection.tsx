import { trpc } from "@/lib/trpc";
import { useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  nutricion: "Nutrición",
  estetica: "Estética",
  ambos: "Nutrición & Estética",
};

export default function BeforeAfterSection() {
  const { data: photos, isLoading } = trpc.beforeAfter.list.useQuery();
  const [activeFilter, setActiveFilter] = useState<"all" | "nutricion" | "estetica">("all");

  const filtered = photos?.filter(
    (p) => activeFilter === "all" || p.category === activeFilter
  );

  if (isLoading) {
    return (
      <section className="py-20 bg-[#111]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-[#1a1a1a] rounded-2xl h-80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!filtered || filtered.length === 0) return null;

  return (
    <section className="py-20 bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#C5A55A] tracking-[0.3em] text-xs uppercase mb-3 font-light">
            Resultados Reales
          </p>
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
            Transformaciones de Nuestros Pacientes
          </h2>
          <div className="w-16 h-px bg-[#C5A55A] mx-auto mb-6" />
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Cada historia es única. Estos son algunos de los resultados que nuestros
            pacientes han logrado con dedicación y nuestro acompañamiento profesional.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {(["all", "nutricion", "estetica"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveFilter(f); }}
              className={`px-5 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-200 border ${
                activeFilter === f
                  ? "bg-[#C5A55A] border-[#C5A55A] text-black font-semibold"
                  : "border-white/20 text-white/60 hover:border-[#C5A55A] hover:text-[#C5A55A]"
              }`}
            >
              {f === "all" ? "Todos" : CATEGORY_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Grid de fotos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((photo) => (
            <BeforeAfterCard key={photo.id} photo={photo} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeAfterCard({ photo }: { photo: {
  id: number;
  patientName: string;
  category: string;
  description: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
} }) {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-[#C5A55A]/30 transition-all duration-300 group">
      {/* Imagen única (ya contiene antes y después) */}
      <div className="relative">
        <img
          src={photo.beforeImageUrl}
          alt={`Transformación - ${photo.patientName}`}
          className="w-full h-72 object-cover object-top"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex gap-4">
          <span className="text-white/80 text-xs tracking-widest uppercase font-light">Antes</span>
          <span className="text-[#C5A55A]/60 text-xs">→</span>
          <span className="text-[#C5A55A] text-xs tracking-widest uppercase font-semibold">Después</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium text-sm">{photo.patientName}</span>
          <span className="text-[#C5A55A] text-xs tracking-wider uppercase bg-[#C5A55A]/10 px-3 py-1 rounded-full">
            {CATEGORY_LABELS[photo.category] ?? photo.category}
          </span>
        </div>
        {photo.description && (
          <p className="text-white/50 text-xs leading-relaxed">{photo.description}</p>
        )}
      </div>
    </div>
  );
}

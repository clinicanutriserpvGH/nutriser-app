/**
 * TreatmentsTab — Pestaña "Mis Tratamientos" para el Monedero Nutriser
 * Muestra el seguimiento de tratamientos y fotos del paciente.
 * Reutiliza la misma lógica de MyTreatments.tsx pero sin el header/auth propio.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import {
  Camera, Clock, Sparkles, X,
} from "lucide-react";

// ─── Tipos locales ─────────────────────────────────────────────────────────────
type Treatment = {
  id: number; patientId: number; serviceName: string; totalSessions: number;
  completedSessions: number; status: "pending" | "in_progress" | "completed";
  notes?: string | null; createdAt: Date; updatedAt: Date;
};
type Appointment = {
  id: number; patientId: number; treatmentId: number; appointmentDate: string;
  appointmentTime: string; status: "scheduled" | "completed" | "cancelled";
  notes?: string | null; createdAt: Date;
};
type Photo = {
  id: number; patientId: number; treatmentId?: number | null;
  type: "before" | "after" | "progress"; photoUrl: string; photoDate: string;
  notes?: string | null; createdAt: Date;
};

interface TreatmentsTabProps {
  patientId: number;
}

const photoTypeLabel = (t: Photo["type"]) =>
  t === "before" ? "Antes" : t === "after" ? "Después" : "Progreso";

const photoTypeColor = (t: Photo["type"]) =>
  t === "before" ? "bg-orange-50 text-orange-700" :
  t === "after" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700";

export default function TreatmentsTab({ patientId }: TreatmentsTabProps) {
  const [activeTab, setActiveTab] = useState<"tracking" | "photos">("tracking");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const { data: treatments = [], isLoading: loadingTreatments } = trpc.patients.getTreatments.useQuery(
    { patientId },
    { enabled: !!patientId }
  );
  const { data: appointments = [] } = trpc.patients.getAppointments.useQuery(
    { patientId },
    { enabled: !!patientId }
  );
  const { data: photos = [], isLoading: loadingPhotos } = trpc.patients.getPhotos.useQuery(
    { patientId },
    { enabled: !!patientId && activeTab === "photos" }
  );

  const activeTreatments = (treatments as Treatment[]).filter(t => t.status !== "completed");
  const completedTreatments = (treatments as Treatment[]).filter(t => t.status === "completed");
  const upcomingAppointments = (appointments as Appointment[]).filter(a => a.status === "scheduled").slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-[#C5A55A]">{activeTreatments.length}</p>
          <p className="text-gray-500 text-xs mt-0.5">Activos</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">{completedTreatments.length}</p>
          <p className="text-gray-500 text-xs mt-0.5">Finalizados</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</p>
          <p className="text-gray-500 text-xs mt-0.5">Próximas citas</p>
        </div>
      </div>

      {/* Próximas citas */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-[#C5A55A]/5 border border-[#C5A55A]/20 rounded-2xl p-4">
          <h3 className="text-gray-900 font-semibold text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C5A55A]" /> Próximas citas
          </h3>
          <div className="space-y-2">
            {upcomingAppointments.map((a: Appointment) => {
              const treatment = (treatments as Treatment[]).find(t => t.id === a.treatmentId);
              return (
                <div key={a.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                  <div>
                    <p className="text-gray-900 text-xs font-semibold">{treatment?.serviceName ?? "Tratamiento"}</p>
                    <p className="text-gray-400 text-xs">{a.appointmentDate} · {a.appointmentTime}</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Programada</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-pestañas: Seguimiento / Fotos */}
      <div className="flex bg-white border border-gray-100 rounded-xl p-1 gap-1 shadow-sm">
        {[
          { id: "tracking" as const, icon: Sparkles, label: "Seguimiento" },
          { id: "photos" as const, icon: Camera, label: "Fotos" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id ? "bg-[#1A1A1A] text-[#C5A55A]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Seguimiento ── */}
      {activeTab === "tracking" && (
        <div className="space-y-4">
          {loadingTreatments ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-[#C5A55A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-400 text-xs">Cargando tratamientos...</p>
            </div>
          ) : (treatments as Treatment[]).length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Aún no tienes tratamientos asignados.</p>
              <p className="text-gray-300 text-xs mt-1">El equipo de Nutriser los agregará pronto.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(treatments as Treatment[]).map(t => {
                const progress = t.totalSessions > 0 ? Math.round((t.completedSessions / t.totalSessions) * 100) : 0;
                const tAppointments = (appointments as Appointment[]).filter(a => a.treatmentId === t.id);
                return (
                  <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-gray-900 font-bold text-sm">{t.serviceName}</p>
                        {t.notes && <p className="text-gray-400 text-xs mt-0.5">{t.notes}</p>}
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        t.status === "completed" ? "bg-green-50 text-green-700" :
                        t.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                        "bg-yellow-50 text-yellow-700"
                      }`}>
                        {t.status === "completed" ? "Completado" :
                         t.status === "in_progress" ? "En progreso" : "Pendiente"}
                      </span>
                    </div>
                    {t.totalSessions > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-500 text-xs">Sesiones completadas</span>
                          <span className="text-[#C5A55A] text-xs font-bold">{t.completedSessions} / {t.totalSessions}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-[#C5A55A] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-gray-400 text-xs mt-1 text-right">{progress}% completado</p>
                      </div>
                    )}
                    {tAppointments.length > 0 && (
                      <div>
                        <p className="text-gray-500 text-xs font-semibold mb-2">Historial de citas</p>
                        <div className="space-y-1.5">
                          {tAppointments.map((a: Appointment) => (
                            <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                              <div>
                                <p className="text-gray-900 text-xs">{a.appointmentDate} · {a.appointmentTime}</p>
                                {a.notes && <p className="text-gray-400 text-[10px]">{a.notes}</p>}
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                a.status === "completed" ? "bg-green-50 text-green-700" :
                                a.status === "cancelled" ? "bg-red-50 text-red-700" :
                                "bg-blue-50 text-blue-700"
                              }`}>
                                {a.status === "completed" ? "Dada" :
                                 a.status === "cancelled" ? "Perdida" : "Programada"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Fotos ── */}
      {activeTab === "photos" && (
        <div className="space-y-4">
          {loadingPhotos ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-[#C5A55A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-400 text-xs">Cargando fotos...</p>
            </div>
          ) : (photos as Photo[]).length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Aún no tienes fotos de seguimiento.</p>
              <p className="text-gray-300 text-xs mt-1">El equipo de Nutriser las subirá conforme avance tu tratamiento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(photos as Photo[]).map(photo => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white"
                >
                  <img src={photo.photoUrl} alt="Foto" className="w-full aspect-square object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${photoTypeColor(photo.type)}`}>
                      {photoTypeLabel(photo.type)}
                    </span>
                    <p className="text-white text-[10px] mt-0.5">{photo.photoDate}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal foto ampliada */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedPhoto.photoUrl} alt="Foto" className="w-full rounded-2xl" />
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${photoTypeColor(selectedPhoto.type)}`}>
                {photoTypeLabel(selectedPhoto.type)}
              </span>
              <span className="text-white/50 text-xs">{selectedPhoto.photoDate}</span>
            </div>
            {selectedPhoto.notes && (
              <p className="text-white/50 text-xs mt-1">{selectedPhoto.notes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

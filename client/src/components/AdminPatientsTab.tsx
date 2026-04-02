/**
 * AdminPatientsTab — Pestaña de gestión de pacientes presenciales
 * El admin puede: ver pacientes, asignar tratamientos, citas, subir fotos y enviar notificaciones.
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Bell, Calendar, Camera, ChevronDown, ChevronRight, FileText,
  Loader2, Mail, Phone, Plus, Scissors, Send, Trash2, User, X,
} from "lucide-react";

type Patient = {
  id: number; name: string; email: string; phone: string;
  birthday?: string | null; consentAcceptedAt?: Date | null;
  consentPdfUrl?: string | null; createdAt: Date;
};
type Treatment = {
  id: number; patientId: number; serviceName: string;
  totalSessions: number; completedSessions: number;
  status: "pending" | "in_progress" | "completed"; notes?: string | null; createdAt: Date;
};
type Appointment = {
  id: number; patientId: number; treatmentId: number;
  appointmentDate: string; appointmentTime: string;
  status: "scheduled" | "completed" | "cancelled"; notes?: string | null; createdAt: Date;
};
type Photo = {
  id: number; patientId: number; treatmentId?: number | null;
  type: "before" | "after" | "progress"; photoUrl: string; photoDate: string;
  notes?: string | null; createdAt: Date;
};

export default function AdminPatientsTab() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientTab, setPatientTab] = useState<"treatments" | "appointments" | "photos" | "info">("treatments");
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifyType, setNotifyType] = useState<"push" | "email" | "both">("both");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoType, setPhotoType] = useState<"before" | "after" | "progress">("before");
  const [photoTreatmentId, setPhotoTreatmentId] = useState<number | undefined>();
  const [photoNotes, setPhotoNotes] = useState("");
  const [selectedTreatmentForAppt, setSelectedTreatmentForAppt] = useState<number | undefined>();
  const [newTreatmentSessions, setNewTreatmentSessions] = useState(1);
  const [expandedTreatment, setExpandedTreatment] = useState<number | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: patients = [], isLoading: loadingPatients, refetch: refetchPatients } =
    trpc.patients.listAll.useQuery();

  const { data: treatments = [], refetch: refetchTreatments } =
    trpc.patients.getTreatments.useQuery(
      { patientId: selectedPatient?.id ?? 0 },
      { enabled: !!selectedPatient }
    );

  const { data: appointments = [], refetch: refetchAppointments } =
    trpc.patients.getAppointments.useQuery(
      { patientId: selectedPatient?.id ?? 0 },
      { enabled: !!selectedPatient }
    );

  const { data: photos = [], refetch: refetchPhotos } =
    trpc.patients.getPhotos.useQuery(
      { patientId: selectedPatient?.id ?? 0 },
      { enabled: !!selectedPatient && patientTab === "photos" }
    );

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const addTreatmentMutation = trpc.patients.addTreatment.useMutation({
    onSuccess: () => { refetchTreatments(); setShowAddTreatment(false); toast.success("Tratamiento agregado"); },
    onError: (e) => toast.error(e.message),
  });

  const updateTreatmentMutation = trpc.patients.updateTreatment.useMutation({
    onSuccess: () => { refetchTreatments(); toast.success("Tratamiento actualizado"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteTreatmentMutation = trpc.patients.deleteTreatment.useMutation({
    onSuccess: () => { refetchTreatments(); toast.success("Tratamiento eliminado"); },
    onError: (e) => toast.error(e.message),
  });

  const addAppointmentMutation = trpc.patients.addAppointment.useMutation({
    onSuccess: () => { refetchAppointments(); setShowAddAppointment(false); toast.success("Cita agregada"); },
    onError: (e) => toast.error(e.message),
  });

  const updateAppointmentMutation = trpc.patients.updateAppointment.useMutation({
    onSuccess: () => { refetchAppointments(); toast.success("Cita actualizada"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteAppointmentMutation = trpc.patients.deleteAppointment.useMutation({
    onSuccess: () => { refetchAppointments(); toast.success("Cita eliminada"); },
    onError: (e) => toast.error(e.message),
  });

  const addPhotoMutation = trpc.patients.addPhoto.useMutation({
    onSuccess: () => { refetchPhotos(); toast.success("Foto subida"); setUploadingPhoto(false); },
    onError: (e) => { toast.error(e.message); setUploadingPhoto(false); },
  });

  const deletePhotoMutation = trpc.patients.deletePhoto.useMutation({
    onSuccess: () => { refetchPhotos(); toast.success("Foto eliminada"); },
    onError: (e) => toast.error(e.message),
  });

  const notifyPushMutation = trpc.patients.notifyAllPatients.useMutation({
    onSuccess: (d) => { toast.success(`Push enviado a ${d.sent} pacientes`); },
    onError: (e) => toast.error(e.message),
  });

  const notifyEmailMutation = trpc.patients.emailAllPatients.useMutation({
    onSuccess: (d) => { toast.success(`Email enviado a ${d.sent} pacientes`); },
    onError: (e) => toast.error(e.message),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAddTreatment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const fd = new FormData(e.currentTarget);
    addTreatmentMutation.mutate({
      patientId: selectedPatient.id,
      serviceName: fd.get("serviceName") as string,
      totalSessions: newTreatmentSessions,
      notes: (fd.get("notes") as string) || undefined,
    });
  };

  const handleAddAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient || !selectedTreatmentForAppt) { toast.error("Selecciona un tratamiento"); return; }
    const fd = new FormData(e.currentTarget);
    addAppointmentMutation.mutate({
      patientId: selectedPatient.id,
      treatmentId: selectedTreatmentForAppt,
      appointmentDate: fd.get("date") as string,
      appointmentTime: fd.get("time") as string,
      notes: (fd.get("notes") as string) || undefined,
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPatient) return;
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      addPhotoMutation.mutate({
        patientId: selectedPatient.id,
        treatmentId: photoTreatmentId,
        type: photoType,
        photoData: base64,
        photoDate: new Date().toISOString().split("T")[0],
        notes: photoNotes || undefined,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendNotification = async () => {
    if (!notifyTitle.trim() || !notifyMsg.trim()) { toast.error("Completa título y mensaje"); return; }
    if (notifyType === "push" || notifyType === "both") {
      notifyPushMutation.mutate({ title: notifyTitle, body: notifyMsg });
    }
    if (notifyType === "email" || notifyType === "both") {
      notifyEmailMutation.mutate({ subject: notifyTitle, message: notifyMsg });
    }
    setShowNotifyModal(false);
    setNotifyTitle(""); setNotifyMsg("");
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const statusLabel = (s: Treatment["status"]) =>
    s === "pending" ? "Pendiente" : s === "in_progress" ? "En progreso" : "Finalizado";
  const statusColor = (s: Treatment["status"]) =>
    s === "pending" ? "bg-yellow-100 text-yellow-700" :
    s === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";
  const apptStatusLabel = (s: Appointment["status"]) =>
    s === "scheduled" ? "Programada" : s === "completed" ? "Realizada" : "Cancelada";
  const apptStatusColor = (s: Appointment["status"]) =>
    s === "scheduled" ? "bg-blue-100 text-blue-700" :
    s === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  const photoTypeLabel = (t: Photo["type"]) =>
    t === "before" ? "Antes" : t === "after" ? "Después" : "Progreso";
  const photoTypeColor = (t: Photo["type"]) =>
    t === "before" ? "bg-orange-100 text-orange-700" :
    t === "after" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700";

  const appointmentsForTreatment = (tid: number) =>
    appointments.filter(a => a.treatmentId === tid);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-[#1A1A1A] text-xl">🏥 Gestión de Pacientes</CardTitle>
            <CardDescription>
              Administra los pacientes presenciales: tratamientos, citas, fotos antes/después y notificaciones.
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowNotifyModal(true)}
            className="bg-[#C5A55A] hover:bg-[#d4b46a] text-black text-sm flex items-center gap-2"
          >
            <Bell className="w-4 h-4" /> Notificar a todos
          </Button>
        </CardHeader>
        <CardContent>
          {loadingPatients ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#C5A55A]" /></div>
          ) : (patients as Patient[]).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Aún no hay pacientes registrados.</p>
              <p className="text-xs mt-1">Los pacientes se registran desde la app en "Mis Tratamientos".</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(patients as Patient[]).map(p => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedPatient(p); setPatientTab("treatments"); }}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedPatient?.id === p.id ? "border-[#C5A55A] bg-[#C5A55A]/5" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#C5A55A]/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#C5A55A]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.email} · {p.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.consentAcceptedAt ? (
                      <Badge className="bg-green-100 text-green-700 text-[10px]">✅ Firmado</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">⏳ Sin firma</Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Panel del paciente seleccionado ── */}
      {selectedPatient && (
        <Card className="border-[#C5A55A]/30">
          <CardHeader className="flex flex-row items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-[#1A1A1A] text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-[#C5A55A]" />
                {selectedPatient.name}
              </CardTitle>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedPatient.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{selectedPatient.phone}</span>
                {selectedPatient.birthday && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Cumpleaños: {selectedPatient.birthday}</span>}
              </div>
            </div>
            <button onClick={() => setSelectedPatient(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1 flex-wrap">
              {([
                { id: "treatments", icon: Scissors, label: "Tratamientos" },
                { id: "appointments", icon: Calendar, label: "Citas" },
                { id: "photos", icon: Camera, label: "Fotos" },
                { id: "info", icon: FileText, label: "Contrato" },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setPatientTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${patientTab === tab.id ? "bg-[#C5A55A] text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tratamientos ── */}
            {patientTab === "treatments" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-700">Tratamientos asignados</h4>
                  <Button size="sm" onClick={() => setShowAddTreatment(t => !t)}
                    className="bg-[#C5A55A] hover:bg-[#d4b46a] text-black text-xs h-8">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Agregar
                  </Button>
                </div>

                {showAddTreatment && (
                  <form onSubmit={handleAddTreatment} className="bg-gray-50 rounded-xl p-4 space-y-3 border">
                    <Input name="serviceName" placeholder="Nombre del servicio / tratamiento" required className="text-sm" />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 whitespace-nowrap">Sesiones totales:</label>
                      <Input type="number" min={1} value={newTreatmentSessions}
                        onChange={e => setNewTreatmentSessions(Number(e.target.value))}
                        className="text-sm w-24" />
                    </div>
                    <Input name="notes" placeholder="Notas (opcional)" className="text-sm" />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={addTreatmentMutation.isPending}
                        className="bg-[#C5A55A] hover:bg-[#d4b46a] text-black text-xs">
                        {addTreatmentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Guardar"}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowAddTreatment(false)} className="text-xs">Cancelar</Button>
                    </div>
                  </form>
                )}

                {(treatments as Treatment[]).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Sin tratamientos asignados aún.</p>
                ) : (
                  (treatments as Treatment[]).map(t => (
                    <div key={t.id} className="border rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedTreatment(expandedTreatment === t.id ? null : t.id)}>
                        <div className="flex items-center gap-2">
                          {expandedTreatment === t.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                          <div>
                            <p className="font-semibold text-sm text-[#1A1A1A]">{t.serviceName}</p>
                            <p className="text-xs text-gray-400">{t.completedSessions}/{t.totalSessions} sesiones</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(t.status)}`}>
                            {statusLabel(t.status)}
                          </span>
                        </div>
                      </div>

                      {expandedTreatment === t.id && (
                        <div className="border-t px-3 pb-3 pt-2 space-y-3 bg-gray-50">
                          {/* Barra de progreso */}
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progreso</span>
                              <span>{t.completedSessions}/{t.totalSessions}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-[#C5A55A] rounded-full" style={{ width: `${t.totalSessions > 0 ? (t.completedSessions / t.totalSessions) * 100 : 0}%` }} />
                            </div>
                          </div>
                          {t.notes && <p className="text-xs text-gray-500">{t.notes}</p>}
                          {/* Acciones */}
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" className="text-xs h-7"
                              onClick={() => updateTreatmentMutation.mutate({ id: t.id, completedSessions: Math.min(t.completedSessions + 1, t.totalSessions) })}
                              disabled={t.completedSessions >= t.totalSessions || updateTreatmentMutation.isPending}>
                              +1 Sesión
                            </Button>
                            {t.status !== "in_progress" && t.status !== "completed" && (
                              <Button size="sm" variant="outline" className="text-xs h-7 border-blue-300 text-blue-600"
                                onClick={() => updateTreatmentMutation.mutate({ id: t.id, status: "in_progress" })}
                                disabled={updateTreatmentMutation.isPending}>
                                Iniciar
                              </Button>
                            )}
                            {t.status !== "completed" && (
                              <Button size="sm" variant="outline" className="text-xs h-7 border-green-300 text-green-600"
                                onClick={() => updateTreatmentMutation.mutate({ id: t.id, status: "completed" })}
                                disabled={updateTreatmentMutation.isPending}>
                                Finalizar
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-xs h-7 border-red-200 text-red-500"
                              onClick={() => { if (confirm("¿Eliminar este tratamiento?")) deleteTreatmentMutation.mutate({ id: t.id }); }}
                              disabled={deleteTreatmentMutation.isPending}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Citas ── */}
            {patientTab === "appointments" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-700">Citas programadas</h4>
                  <Button size="sm" onClick={() => setShowAddAppointment(t => !t)}
                    className="bg-[#C5A55A] hover:bg-[#d4b46a] text-black text-xs h-8">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Agregar cita
                  </Button>
                </div>

                {showAddAppointment && (
                  <form onSubmit={handleAddAppointment} className="bg-gray-50 rounded-xl p-4 space-y-3 border">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Tratamiento:</label>
                      <select
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                        value={selectedTreatmentForAppt ?? ""}
                        onChange={e => setSelectedTreatmentForAppt(Number(e.target.value) || undefined)}
                        required
                      >
                        <option value="">Selecciona un tratamiento</option>
                        {(treatments as Treatment[]).map(t => (
                          <option key={t.id} value={t.id}>{t.serviceName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Fecha:</label>
                        <Input name="date" type="date" required className="text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Hora:</label>
                        <Input name="time" type="time" required className="text-sm" />
                      </div>
                    </div>
                    <Input name="notes" placeholder="Notas (opcional)" className="text-sm" />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={addAppointmentMutation.isPending}
                        className="bg-[#C5A55A] hover:bg-[#d4b46a] text-black text-xs">
                        {addAppointmentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Guardar cita"}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowAddAppointment(false)} className="text-xs">Cancelar</Button>
                    </div>
                  </form>
                )}

                {(appointments as Appointment[]).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Sin citas registradas.</p>
                ) : (
                  (appointments as Appointment[]).map(a => {
                    const treatment = (treatments as Treatment[]).find(t => t.id === a.treatmentId);
                    return (
                      <div key={a.id} className="border rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm text-[#1A1A1A]">{treatment?.serviceName ?? "Tratamiento"}</p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {a.appointmentDate} · {a.appointmentTime}
                            </p>
                            {a.notes && <p className="text-xs text-gray-400 mt-0.5">{a.notes}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${apptStatusColor(a.status)}`}>
                              {apptStatusLabel(a.status)}
                            </span>
                            <div className="flex gap-1">
                              {a.status === "scheduled" && (
                                <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-green-300 text-green-600"
                                  onClick={() => updateAppointmentMutation.mutate({ id: a.id, status: "completed" })}>
                                  Realizada
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 border-red-200 text-red-500"
                                onClick={() => { if (confirm("¿Eliminar esta cita?")) deleteAppointmentMutation.mutate({ id: a.id }); }}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── Fotos ── */}
            {patientTab === "photos" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-semibold text-sm text-gray-700">Fotos antes/después</h4>
                  <Button size="sm" onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="bg-[#C5A55A] hover:bg-[#d4b46a] text-black text-xs h-8">
                    {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Camera className="w-3.5 h-3.5 mr-1" />}
                    Subir foto
                  </Button>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>

                {/* Opciones de foto */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2 border">
                  <div className="flex gap-2 flex-wrap">
                    {(["before", "after", "progress"] as const).map(t => (
                      <button key={t} onClick={() => setPhotoType(t)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${photoType === t ? "bg-[#C5A55A] text-black" : "bg-gray-200 text-gray-600"}`}>
                        {t === "before" ? "Antes" : t === "after" ? "Después" : "Progreso"}
                      </button>
                    ))}
                  </div>
                  <select className="w-full border rounded-lg px-3 py-1.5 text-xs bg-white"
                    value={photoTreatmentId ?? ""}
                    onChange={e => setPhotoTreatmentId(Number(e.target.value) || undefined)}>
                    <option value="">Sin tratamiento específico</option>
                    {(treatments as Treatment[]).map(t => (
                      <option key={t.id} value={t.id}>{t.serviceName}</option>
                    ))}
                  </select>
                  <Input placeholder="Notas de la foto (opcional)" value={photoNotes}
                    onChange={e => setPhotoNotes(e.target.value)} className="text-xs" />
                </div>

                {(photos as Photo[]).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Sin fotos registradas.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(photos as Photo[]).map(photo => (
                      <div key={photo.id} className="relative rounded-xl overflow-hidden group aspect-square">
                        <img src={photo.photoUrl} alt={photoTypeLabel(photo.type)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${photoTypeColor(photo.type)}`}>
                            {photoTypeLabel(photo.type)}
                          </span>
                          <span className="text-white/60 text-[9px]">{photo.photoDate}</span>
                        </div>
                        <button
                          onClick={() => { if (confirm("¿Eliminar esta foto?")) deletePhotoMutation.mutate({ id: photo.id }); }}
                          className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Contrato / Info ── */}
            {patientTab === "info" && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500">Información del paciente</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400 text-xs">Nombre:</span><p className="font-semibold">{selectedPatient.name}</p></div>
                    <div><span className="text-gray-400 text-xs">Email:</span><p className="font-semibold">{selectedPatient.email}</p></div>
                    <div><span className="text-gray-400 text-xs">Teléfono:</span><p className="font-semibold">{selectedPatient.phone}</p></div>
                    <div><span className="text-gray-400 text-xs">Cumpleaños:</span><p className="font-semibold">{selectedPatient.birthday ?? "No registrado"}</p></div>
                    <div><span className="text-gray-400 text-xs">Registro:</span><p className="font-semibold">{new Date(selectedPatient.createdAt).toLocaleDateString("es-MX")}</p></div>
                  </div>
                </div>
                {selectedPatient.consentAcceptedAt ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-700 font-semibold text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Consentimiento firmado
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      Firmado el {new Date(selectedPatient.consentAcceptedAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    {selectedPatient.consentPdfUrl && (
                      <a href={selectedPatient.consentPdfUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[#C5A55A] text-xs hover:underline">
                        <FileText className="w-3.5 h-3.5" /> Ver PDF firmado
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-700 font-semibold text-sm">⏳ Consentimiento pendiente</p>
                    <p className="text-yellow-600 text-xs mt-1">El paciente aún no ha firmado el consentimiento informado.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Modal de notificaciones ── */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#C5A55A]" /> Notificar a todos los pacientes
              </h3>
              <button onClick={() => setShowNotifyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {(["push", "email", "both"] as const).map(t => (
                <button key={t} onClick={() => setNotifyType(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${notifyType === t ? "bg-[#C5A55A] text-black" : "text-gray-500"}`}>
                  {t === "push" ? "🔔 Push" : t === "email" ? "📧 Email" : "Ambos"}
                </button>
              ))}
            </div>
            <Input placeholder="Asunto / Título" value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} className="text-sm" />
            <textarea
              placeholder="Mensaje..."
              value={notifyMsg}
              onChange={e => setNotifyMsg(e.target.value)}
              rows={4}
              className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30"
            />
            <div className="flex gap-2">
              <Button onClick={handleSendNotification}
                disabled={notifyPushMutation.isPending || notifyEmailMutation.isPending}
                className="flex-1 bg-[#C5A55A] hover:bg-[#d4b46a] text-black text-sm">
                {(notifyPushMutation.isPending || notifyEmailMutation.isPending)
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Send className="w-4 h-4 mr-1.5" /> Enviar</>}
              </Button>
              <Button variant="outline" onClick={() => setShowNotifyModal(false)} className="text-sm">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

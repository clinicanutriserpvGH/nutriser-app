/**
 * Nutriser — Portal "Mis Tratamientos"
 * Registro / Login de pacientes presenciales.
 * Tras autenticarse ven sus tratamientos, citas, fotos antes/después,
 * consentimiento informado, cupones y catálogo de servicios.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Camera, CheckCircle2, ChevronLeft, Clock, Eye, EyeOff,
  FileText, Heart, Loader2, Lock, LogOut, Mail, Phone, Scissors,
  ShieldCheck, Sparkles, Star, Tag, User, X,
} from "lucide-react";
import { jsPDF } from "jspdf";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

// ─── Tipos locales ────────────────────────────────────────────────────────────
type PatientSafe = {
  id: number; name: string; email: string; phone: string; birthday?: string | null;
  consentAcceptedAt?: Date | null; consentPdfUrl?: string | null; consentSignature?: string | null;
  pushSubscription?: string | null; createdAt: Date; updatedAt: Date;
};
type Treatment = { id: number; patientId: number; serviceName: string; totalSessions: number; completedSessions: number; status: "pending" | "in_progress" | "completed"; notes?: string | null; createdAt: Date; updatedAt: Date; };
type Appointment = { id: number; patientId: number; treatmentId: number; appointmentDate: string; appointmentTime: string; status: "scheduled" | "completed" | "cancelled"; notes?: string | null; createdAt: Date; };
type Photo = { id: number; patientId: number; treatmentId?: number | null; type: "before" | "after" | "progress"; photoUrl: string; photoDate: string; notes?: string | null; createdAt: Date; };

// ─── Texto del consentimiento ─────────────────────────────────────────────────
const CONSENT_TEXT = `CONTRATO DE CONSENTIMIENTO INFORMADO
Nutriser Aesthetic & Nutrition — Puerto Vallarta, Jalisco, México
Fecha: 31 de marzo de 2026

Yo, el/la paciente que firma el presente documento, declaro haber sido informado/a de manera clara y comprensible sobre los tratamientos estéticos y de nutrición que recibiré en Nutriser Aesthetic & Nutrition.

1. NATURALEZA DE LOS TRATAMIENTOS
Los tratamientos ofrecidos por Nutriser incluyen procedimientos estéticos no invasivos e invasivos, planes nutricionales personalizados y terapias de bienestar. Todos los procedimientos son realizados por profesionales certificados.

2. RIESGOS Y BENEFICIOS
Entiendo que, como en cualquier procedimiento estético o médico, pueden existir riesgos asociados, incluyendo pero no limitados a: reacciones alérgicas, irritación cutánea, inflamación temporal u otros efectos secundarios. Declaro haber informado al equipo de Nutriser sobre cualquier alergia, condición médica preexistente o medicamento que esté tomando.

3. RESPONSABILIDAD DEL PACIENTE
Me comprometo a:
- Informar verazmente sobre mi estado de salud y antecedentes médicos.
- Seguir las indicaciones post-tratamiento proporcionadas por el equipo.
- No responsabilizar a Nutriser por consecuencias derivadas de información ocultada o de un manejo inadecuado de las indicaciones post-tratamiento por parte del paciente.

4. CONFIDENCIALIDAD
Nutriser se compromete a proteger mis datos personales y fotografías de acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).

5. CONSENTIMIENTO
Al firmar este documento, confirmo que:
- He leído y comprendido el contenido de este consentimiento.
- Acepto voluntariamente los tratamientos y sus condiciones.
- Libero a Nutriser Aesthetic & Nutrition de responsabilidad por consecuencias derivadas de información omitida o mal manejo post-tratamiento por parte del paciente.

Este documento tiene validez legal y no podrá ser modificado una vez firmado.`;

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MyTreatments() {
  const [view, setView] = useState<"auth" | "consent" | "portal">("auth");
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [patient, setPatient] = useState<PatientSafe | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"treatments" | "photos" | "consent" | "coupons">("treatments");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [signingConsent, setSigningConsent] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const consentScrollRef = useRef<HTMLDivElement>(null);
  const [consentScrolled, setConsentScrolled] = useState(false);
  const sigCanvasRef = useRef<SignatureCanvas>(null);

  // Persistir sesión en sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("nutriser_patient");
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setPatient(p);
        setView(p.consentAcceptedAt ? "portal" : "consent");
      } catch {}
    }
  }, []);

  const persistPatient = (p: PatientSafe) => {
    sessionStorage.setItem("nutriser_patient", JSON.stringify(p));
    setPatient(p);
  };

  // ─── Queries ────────────────────────────────────────────────────────────────
  const { data: treatments = [], refetch: refetchTreatments } = trpc.patients.getTreatments.useQuery(
    { patientId: patient?.id ?? 0 },
    { enabled: !!patient && view === "portal" }
  );
  const { data: appointments = [], refetch: refetchAppointments } = trpc.patients.getAppointments.useQuery(
    { patientId: patient?.id ?? 0 },
    { enabled: !!patient && view === "portal" }
  );
  const { data: photos = [], refetch: refetchPhotos } = trpc.patients.getPhotos.useQuery(
    { patientId: patient?.id ?? 0 },
    { enabled: !!patient && view === "portal" && activeTab === "photos" }
  );
  const { data: promotions = [] } = trpc.promotions.list.useQuery(undefined, { enabled: !!patient && activeTab === "coupons" });

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const registerMutation = trpc.patients.register.useMutation({
    onSuccess: (data) => {
      persistPatient(data as PatientSafe);
      setView("consent");
      toast.success("¡Cuenta creada! Por favor lee y firma el consentimiento.");
    },
    onError: (e) => toast.error(e.message),
  });

  const loginMutation = trpc.patients.login.useMutation({
    onSuccess: (data) => {
      persistPatient(data as PatientSafe);
      setView((data as PatientSafe).consentAcceptedAt ? "portal" : "consent");
    },
    onError: (e) => toast.error(e.message),
  });

  const forgotMutation = trpc.patients.requestPasswordReset.useMutation({
    onSuccess: () => toast.success("Si el correo existe, recibirás un enlace de recuperación."),
    onError: (e) => toast.error(e.message),
  });

  const consentMutation = trpc.patients.saveConsent.useMutation({
    onSuccess: (data) => {
      if (patient) {
        const updated = { ...patient, consentAcceptedAt: new Date(), consentPdfUrl: data.pdfUrl, consentSignature: data.pdfUrl };
        persistPatient(updated as PatientSafe);
      }
      setView("portal");
      toast.success("¡Consentimiento firmado y guardado exitosamente!");
    },
    onError: (e) => toast.error(e.message),
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    registerMutation.mutate({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      phone: fd.get("phone") as string,
      birthday: fd.get("birthday") as string || undefined,
    });
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    loginMutation.mutate({ email: fd.get("email") as string, password: fd.get("password") as string });
  };

  const handleForgot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    forgotMutation.mutate({ email: fd.get("email") as string, origin: window.location.origin });
  };

  const handleSignConsent = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      toast.error("Por favor dibuja tu firma para continuar.");
      return;
    }
    if (!patient) return;
    setSigningConsent(true);
    try {
      // Solo enviar la imagen de la firma — el servidor genera el PDF
      const signatureDataUrl = sigCanvasRef.current.toDataURL("image/png");
      await consentMutation.mutateAsync({
        patientId: patient.id,
        signature: signatureDataUrl,
        patientName: patient.name,
      });
    } finally {
      setSigningConsent(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("nutriser_patient");
    setPatient(null);
    setView("auth");
    setAuthMode("login");
  };

  // ─── Helpers UI ─────────────────────────────────────────────────────────────
  const statusLabel = (s: Treatment["status"]) =>
    s === "pending" ? "Pendiente" : s === "in_progress" ? "En progreso" : "Finalizado";
  const statusColor = (s: Treatment["status"]) =>
    s === "pending" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
    s === "in_progress" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
    "bg-green-500/20 text-green-300 border-green-500/30";
  const apptStatusColor = (s: Appointment["status"]) =>
    s === "scheduled" ? "bg-blue-500/20 text-blue-300" :
    s === "completed" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300";
  const apptStatusLabel = (s: Appointment["status"]) =>
    s === "scheduled" ? "Programada" : s === "completed" ? "Realizada" : "Cancelada";
  const photoTypeLabel = (t: Photo["type"]) =>
    t === "before" ? "Antes" : t === "after" ? "Después" : "Progreso";
  const photoTypeColor = (t: Photo["type"]) =>
    t === "before" ? "bg-orange-500/20 text-orange-300" :
    t === "after" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300";

  const appointmentsForTreatment = (treatmentId: number) =>
    appointments.filter(a => a.treatmentId === treatmentId);

  // ─── Pantalla de autenticación ───────────────────────────────────────────────
  if (view === "auth") {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src={LOGO_URL} alt="Nutriser" className="h-16 mb-3" />
            <h1 className="text-2xl font-bold text-white">Mis Tratamientos</h1>
            <p className="text-white/50 text-sm mt-1 text-center">Accede al seguimiento de tus tratamientos y descuentos exclusivos en tratamientos faciales y corporales</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            {/* Tabs */}
            {authMode !== "forgot" && (
              <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
                {(["login", "register"] as const).map(m => (
                  <button key={m} onClick={() => setAuthMode(m)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${authMode === m ? "bg-[#C5A55A] text-black" : "text-white/50 hover:text-white"}`}>
                    {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
                  </button>
                ))}
              </div>
            )}

            {/* Login */}
            {authMode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input name="email" type="email" placeholder="Correo electrónico" required className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input name="password" type={showPassword ? "text" : "password"} placeholder="Contraseña" required className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button type="submit" disabled={loginMutation.isPending} className="w-full bg-[#C5A55A] hover:bg-[#d4b46a] text-black font-bold">
                  {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </Button>
                <button type="button" onClick={() => setAuthMode("forgot")} className="w-full text-center text-white/40 text-xs hover:text-white/60 transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </form>
            )}

            {/* Register */}
            {authMode === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input name="name" placeholder="Nombre completo" required minLength={2} className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input name="email" type="email" placeholder="Correo electrónico" required className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input name="phone" type="tel" placeholder="Teléfono / Celular" required minLength={8} className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <div className="pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-md flex items-center">
                    <label className="text-white/40 text-sm mr-2 whitespace-nowrap">Fecha de nacimiento:</label>
                    <input name="birthday" type="date" className="bg-transparent text-white text-sm flex-1 outline-none [color-scheme:dark]" />
                  </div>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input name="password" type={showPassword ? "text" : "password"} placeholder="Contraseña (mín. 6 caracteres)" required minLength={6} className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button type="submit" disabled={registerMutation.isPending} className="w-full bg-[#C5A55A] hover:bg-[#d4b46a] text-black font-bold">
                  {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear mi cuenta"}
                </Button>
              </form>
            )}

            {/* Forgot */}
            {authMode === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4">
                <button type="button" onClick={() => setAuthMode("login")} className="flex items-center gap-1 text-white/50 text-sm hover:text-white/80 mb-2">
                  <ChevronLeft className="w-4 h-4" /> Volver
                </button>
                <p className="text-white/70 text-sm">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input name="email" type="email" placeholder="Correo electrónico" required className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <Button type="submit" disabled={forgotMutation.isPending} className="w-full bg-[#C5A55A] hover:bg-[#d4b46a] text-black font-bold">
                  {forgotMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar enlace"}
                </Button>
              </form>
            )}
          </div>

          {/* Back to splash */}
          <button
            onClick={() => {
              sessionStorage.removeItem('nutriser_splash_seen');
              window.location.href = '/';
            }}
            className="mt-6 w-full text-center text-white/30 text-xs hover:text-white/50 transition-colors"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ─── Pantalla de consentimiento ───────────────────────────────────────────────
  if (view === "consent") {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="flex flex-col items-center mb-6">
            <ShieldCheck className="w-12 h-12 text-[#C5A55A] mb-2" />
            <h1 className="text-2xl font-bold text-white">Consentimiento Informado</h1>
            <p className="text-white/50 text-sm mt-1 text-center">Lee el documento completo y fírmalo para continuar</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            {/* Documento */}
            <div
              ref={consentScrollRef}
              onScroll={() => {
                const el = consentScrollRef.current;
                if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setConsentScrolled(true);
              }}
              className="h-64 overflow-y-auto bg-black/30 rounded-2xl p-4 mb-4 text-white/70 text-xs leading-relaxed whitespace-pre-line border border-white/10"
            >
              {patient ? CONSENT_TEXT.replace(
                "Yo, el/la paciente que firma el presente documento,",
                `Yo, ${patient.name}, paciente que firma el presente documento,`
              ) : CONSENT_TEXT}
            </div>
            {!consentScrolled && (
              <p className="text-yellow-400/80 text-xs text-center mb-3 flex items-center justify-center gap-1">
                <span>↓</span> Desplázate hasta el final para poder firmar
              </p>
            )}

            {/* Firma digital */}
            <div className="space-y-3">
              <label className="text-white/70 text-sm font-semibold">Firma digital (dibuja con tu dedo o mouse):</label>
              <div className="bg-white rounded-2xl p-2">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  canvasProps={{
                    className: "w-full border border-gray-300 rounded-xl",
                    style: { height: '180px', touchAction: 'none', display: 'block' },
                  }}
                  onEnd={() => setSignatureEmpty(sigCanvasRef.current?.isEmpty() ?? true)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    sigCanvasRef.current?.clear();
                    setSignatureEmpty(true);
                  }}
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                  disabled={!consentScrolled}
                >
                  <X className="w-4 h-4 mr-2" /> Borrar
                </Button>
                <Button
                  onClick={handleSignConsent}
                  disabled={!consentScrolled || signatureEmpty || signingConsent || consentMutation.isPending}
                  className="flex-1 bg-[#C5A55A] hover:bg-[#d4b46a] text-black font-bold"
                >
                  {signingConsent || consentMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando PDF...</>
                    : <><FileText className="w-4 h-4 mr-2" /> Firmar y continuar</>}
                </Button>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="mt-4 w-full text-center text-white/30 text-xs hover:text-white/50 transition-colors">
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // ─── Portal del paciente ──────────────────────────────────────────────────────
  const upcomingAppointments = appointments.filter(a => a.status === "scheduled").slice(0, 3);
  const activeTreatments = treatments.filter(t => t.status !== "completed");
  const completedTreatments = treatments.filter(t => t.status === "completed");

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Nutriser" className="h-8" />
            <div>
              <p className="text-white text-sm font-bold leading-tight">{patient?.name}</p>
              <p className="text-white/40 text-xs">Mis Tratamientos</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Resumen rápido */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-[#C5A55A]">{activeTreatments.length}</p>
            <p className="text-white/50 text-xs mt-0.5">Activos</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{completedTreatments.length}</p>
            <p className="text-white/50 text-xs mt-0.5">Finalizados</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{upcomingAppointments.length}</p>
            <p className="text-white/50 text-xs mt-0.5">Próximas citas</p>
          </div>
        </div>

        {/* Próximas citas */}
        {upcomingAppointments.length > 0 && (
          <div className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent border border-[#C5A55A]/20 rounded-2xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C5A55A]" /> Próximas citas
            </h3>
            <div className="space-y-2">
              {upcomingAppointments.map(a => {
                const treatment = treatments.find(t => t.id === a.treatmentId);
                return (
                  <div key={a.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-white text-xs font-semibold">{treatment?.serviceName ?? "Tratamiento"}</p>
                      <p className="text-white/50 text-xs">{a.appointmentDate} · {a.appointmentTime}</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">Programada</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
          {([
            { id: "treatments", icon: Scissors, label: "Tratamientos" },
            { id: "photos", icon: Camera, label: "Fotos" },
            { id: "coupons", icon: Tag, label: "Cupones" },
            { id: "consent", icon: FileText, label: "Contrato" },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold transition-all ${activeTab === tab.id ? "bg-[#C5A55A] text-black" : "text-white/40 hover:text-white/70"}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Tratamientos ── */}
        {activeTab === "treatments" && (
          <div className="space-y-4">
            {treatments.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">Aún no tienes tratamientos asignados.</p>
                <p className="text-white/30 text-xs mt-1">El equipo de Nutriser los agregará pronto.</p>
              </div>
            ) : (
              treatments.map(t => {
                const appts = appointmentsForTreatment(t.id);
                const progress = t.totalSessions > 0 ? (t.completedSessions / t.totalSessions) * 100 : 0;
                return (
                  <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-white font-bold text-sm">{t.serviceName}</h3>
                        {t.notes && <p className="text-white/40 text-xs mt-0.5">{t.notes}</p>}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${statusColor(t.status)}`}>
                        {statusLabel(t.status)}
                      </span>
                    </div>
                    {/* Progreso */}
                    <div>
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>Sesiones</span>
                        <span>{t.completedSessions} / {t.totalSessions}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C5A55A] rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    {/* Citas de este tratamiento */}
                    {appts.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-white/50 text-xs font-semibold">Citas:</p>
                        {appts.map(a => (
                          <div key={a.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#C5A55A]" />
                              <span className="text-white/70 text-xs">{a.appointmentDate} · {a.appointmentTime}</span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${apptStatusColor(a.status)}`}>
                              {apptStatusLabel(a.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Tab: Fotos ── */}
        {activeTab === "photos" && (
          <div className="space-y-4">
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">Aún no hay fotos registradas.</p>
                <p className="text-white/30 text-xs mt-1">El equipo de Nutriser agregará fotos de tu progreso.</p>
              </div>
            ) : (
              <>
                {/* Agrupar por tratamiento */}
                {Array.from(new Set(photos.map(p => p.treatmentId ?? 0))).map(tid => {
                  const groupPhotos = photos.filter(p => (p.treatmentId ?? 0) === tid);
                  const treatment = treatments.find(t => t.id === tid);
                  return (
                    <div key={tid}>
                      <p className="text-white/50 text-xs font-semibold mb-2">
                        {treatment ? treatment.serviceName : "General"}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {groupPhotos.map(photo => (
                          <button key={photo.id} onClick={() => setSelectedPhoto(photo)}
                            className="relative rounded-2xl overflow-hidden aspect-square group">
                            <img src={photo.photoUrl} alt={photoTypeLabel(photo.type)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${photoTypeColor(photo.type)}`}>
                                {photoTypeLabel(photo.type)}
                              </span>
                              <span className="text-white/60 text-[10px]">{photo.photoDate}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── Tab: Cupones ── */}
        {activeTab === "coupons" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#C5A55A]/10 to-transparent border border-[#C5A55A]/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-[#C5A55A]" />
                <h3 className="text-white font-bold text-sm">Promociones Exclusivas</h3>
              </div>
              <p className="text-white/50 text-xs">Como paciente de Nutriser tienes acceso a estas promociones especiales.</p>
            </div>
            {(promotions as any[]).length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-10 h-10 text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">Próximamente habrá cupones disponibles para ti.</p>
              </div>
            ) : (
              (promotions as any[]).map((promo: any) => (
                <div key={promo.id} className="bg-white/5 border border-[#C5A55A]/20 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-white font-bold text-sm">{promo.title}</h4>
                      {promo.description && <p className="text-white/50 text-xs mt-1">{promo.description}</p>}
                    </div>
                    {promo.discountPercent && (
                      <span className="bg-[#C5A55A] text-black text-xs font-bold px-2 py-1 rounded-xl whitespace-nowrap">
                        {promo.discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  {promo.code && (
                    <div className="mt-3 bg-black/30 rounded-xl px-3 py-2 flex items-center justify-between">
                      <span className="text-[#C5A55A] font-mono font-bold text-sm">{promo.code}</span>
                      <button onClick={() => { navigator.clipboard.writeText(promo.code); toast.success("Código copiado"); }}
                        className="text-white/40 hover:text-white/70 text-xs transition-colors">Copiar</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Tab: Contrato ── */}
        {activeTab === "consent" && (
          <div className="space-y-4">
            {patient?.consentAcceptedAt ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-bold text-sm">Consentimiento firmado</h3>
                </div>
                <p className="text-white/50 text-xs">
                  Firmado el {new Date(patient.consentAcceptedAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                {patient.consentSignature && (
                  <p className="text-white/40 text-xs mt-1">Firma: <span className="font-serif italic text-white/60">{patient.consentSignature}</span></p>
                )}
                {patient.consentPdfUrl && (
                  <a href={patient.consentPdfUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[#C5A55A] text-xs hover:underline">
                    <FileText className="w-4 h-4" /> Ver PDF firmado
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShieldCheck className="w-10 h-10 text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No has firmado el consentimiento aún.</p>
                <Button onClick={() => setView("consent")} className="mt-3 bg-[#C5A55A] hover:bg-[#d4b46a] text-black text-xs">
                  Firmar ahora
                </Button>
              </div>
            )}
            {/* Texto del contrato */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h4 className="text-white/70 text-xs font-semibold mb-2">Contenido del contrato:</h4>
              <pre className="text-white/40 text-[10px] leading-relaxed whitespace-pre-wrap">{CONSENT_TEXT}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Modal foto ampliada */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedPhoto(null)} className="absolute -top-10 right-0 text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <img src={selectedPhoto.photoUrl} alt="Foto" className="w-full rounded-2xl" />
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${photoTypeColor(selectedPhoto.type)}`}>
                {photoTypeLabel(selectedPhoto.type)}
              </span>
              <span className="text-white/50 text-xs">{selectedPhoto.photoDate}</span>
            </div>
            {selectedPhoto.notes && <p className="text-white/50 text-xs mt-1">{selectedPhoto.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

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
  AlertTriangle, ArrowRight, Bell, BellOff, Calendar, Camera, CheckCircle2, ChevronLeft, Clock, Eye, EyeOff,
  FileText, Flame, Heart, Loader2, Lock, LogOut, Mail, Phone, Scissors,
  ShieldCheck, Sparkles, Star, Tag, User, X,
} from "lucide-react";
import { jsPDF } from "jspdf";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

// ─── Componente contador regresivo para cupones ─────────────────────────────
function PromoCountdown({ expiresAt }: { expiresAt: Date | string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft('¡Expirado!'); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setIsUrgent(days < 2);
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
      else setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return (
    <div className={`flex items-center gap-2 mb-3 text-xs font-bold px-3 py-2 rounded-lg ${
      isUrgent ? 'bg-red-900/40 text-red-200 animate-pulse' : 'bg-black/20 text-white/80'
    }`}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{isUrgent ? '🔥 ' : '⏳ '}Oferta termina en: <strong className="text-white">{timeLeft}</strong></span>
    </div>
  );
}

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
const CONSENT_TEXT = `CARTA DE CONSENTIMIENTO INFORMADO PARA TRATAMIENTOS ESTÉTICOS Y NUTRICIONALES

ESTABLECIMIENTO: Nutriser Aesthetic & Nutrition
DOMICILIO: Puerto Vallarta, Jalisco, México
TELÉFONO: +52 (322) 100-7799
CORREO: clinicanutriserpv@gmail.com
FECHA DE EMISIÓN: 31 de marzo de 2026

Documento elaborado en cumplimiento de la NOM-004-SSA3-2012 del Expediente Clínico, el Artículo 51 Bis 2 de la Ley General de Salud, y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I. IDENTIFICACIÓN DE LAS PARTES

PRESTADOR DEL SERVICIO: Nutriser Aesthetic & Nutrition, establecimiento de salud y bienestar estético ubicado en Puerto Vallarta, Jalisco, México, con atención por profesionales certificados en nutrición clínica y procedimientos estéticos no invasivos.

PACIENTE: El/la suscrito/a, cuyos datos personales constan en el expediente clínico del establecimiento, y cuya firma al calce del presente documento acredita su identidad y conformidad.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

II. ACTO MÉDICO AUTORIZADO

El presente consentimiento ampara la realización de tratamientos estéticos no invasivos y/o mínimamente invasivos, así como asesorías y planes nutricionales personalizados, que pueden incluir, según el caso clínico de cada paciente:

• Cavitación ultrasónica (reducción de grasa localizada)
• Radiofrecuencia corporal y facial (reafirmación de tejidos)
• Mesoterapia reductora (aplicación de microinyecciones con principios activos)
• Tratamientos para estrías, cicatrices de acné, celulitis e hiperpigmentación
• Asesoría y seguimiento nutricional personalizado
• Otros procedimientos estéticos no invasivos indicados por el profesional tratante

El tratamiento específico a realizar será informado verbalmente y por escrito al paciente antes de cada sesión, con la posibilidad de hacer preguntas y recibir respuestas claras.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

III. OBJETIVOS Y BENEFICIOS ESPERADOS

Los tratamientos ofrecidos por Nutriser tienen como objetivo la mejoría estética y el bienestar del paciente. El prestador del servicio se compromete a informar de manera realista sobre los resultados esperados, los cuales pueden variar según las características individuales de cada persona (tipo de piel, metabolismo, edad, condición física y adherencia a las indicaciones post-tratamiento). Nutriser NO garantiza resultados específicos, sino una mejoría progresiva y proporcional al seguimiento del plan indicado.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IV. RIESGOS Y POSIBLES COMPLICACIONES

El paciente declara haber sido informado sobre los siguientes riesgos asociados a los procedimientos estéticos:

Riesgos frecuentes (leves y transitorios):
• Enrojecimiento, inflamación o sensibilidad en la zona tratada
• Hematomas o equimosis temporales
• Sensación de calor o molestia durante el procedimiento
• Cambios temporales en la pigmentación de la piel

Riesgos infrecuentes (que requieren atención médica):
• Reacciones alérgicas a los productos o principios activos utilizados
• Infección en el sitio de aplicación (en procedimientos con microinyecciones)
• Quemaduras superficiales por mal manejo de equipos térmicos
• Irregularidades en el contorno corporal

Riesgos personalizados: El paciente declara haber informado al equipo de Nutriser sobre todas sus condiciones médicas preexistentes, alergias conocidas, medicamentos en uso, embarazo o lactancia, y cualquier otro factor de salud relevante. La omisión de esta información exime de responsabilidad al establecimiento por complicaciones derivadas de dicha omisión.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

V. ALTERNATIVAS AL TRATAMIENTO

El paciente ha sido informado de que existen alternativas a los procedimientos propuestos, incluyendo tratamientos quirúrgicos, otros procedimientos no invasivos, o la opción de no realizar ningún tratamiento. La elección del tratamiento ha sido libre y voluntaria, con base en la información proporcionada por el profesional tratante.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VI. CUIDADOS POST-TRATAMIENTO

El paciente se compromete a seguir las indicaciones post-tratamiento proporcionadas por el equipo de Nutriser, que pueden incluir:

• Evitar exposición solar directa en las zonas tratadas por el tiempo indicado
• Aplicar los productos recomendados por el profesional tratante
• Mantener hidratación adecuada y seguir el plan nutricional asignado
• Evitar actividad física intensa durante las primeras horas post-sesión
• Reportar de inmediato cualquier reacción adversa inusual

El incumplimiento de estas indicaciones puede afectar los resultados del tratamiento y exime al establecimiento de responsabilidad por complicaciones derivadas de dicho incumplimiento.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VII. AUTORIZACIÓN PARA CONTINGENCIAS

El paciente autoriza al personal de salud de Nutriser Aesthetic & Nutrition para atender cualquier contingencia o urgencia derivada del acto médico autorizado, de conformidad con el principio de libertad prescriptiva establecido en la NOM-004-SSA3-2012.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VIII. PROTECCIÓN DE DATOS PERSONALES

En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, Nutriser Aesthetic & Nutrition informa al paciente que:

• Sus datos personales (nombre, correo electrónico, teléfono, fecha de nacimiento, fotografías y expediente clínico) serán tratados con la finalidad de prestar los servicios contratados, llevar el seguimiento de su tratamiento y comunicar resultados y citas.
• Los datos no serán compartidos con terceros sin consentimiento expreso del paciente, salvo obligación legal.
• El paciente puede ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) enviando una solicitud al correo clinicanutriserpv@gmail.com.
• Las fotografías de antes/después tomadas durante el tratamiento son propiedad del paciente y solo podrán ser utilizadas con fines de seguimiento clínico, salvo autorización expresa por escrito para uso promocional.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IX. DERECHO DE REVOCACIÓN

El paciente tiene el derecho de revocar el presente consentimiento en cualquier momento antes del inicio del procedimiento, sin necesidad de expresar causa alguna y sin que ello afecte la calidad de la atención que recibirá en el establecimiento. La revocación deberá comunicarse verbalmente o por escrito al profesional tratante.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

X. DECLARACIÓN DE CONSENTIMIENTO

Yo, el/la paciente que suscribe el presente documento, declaro bajo protesta de decir verdad que:

1. He recibido información clara, completa, veraz y oportuna sobre los tratamientos, sus objetivos, riesgos, beneficios y alternativas.
2. He tenido la oportunidad de realizar todas las preguntas que consideré necesarias y estas fueron respondidas satisfactoriamente.
3. Comprendo que los resultados pueden variar según mis características individuales y mi adherencia a las indicaciones.
4. Otorgo mi consentimiento de manera libre, voluntaria y sin coacción alguna para la realización de los tratamientos indicados.
5. He informado verazmente sobre mi estado de salud, antecedentes médicos, alergias y medicamentos en uso.
6. He leído íntegramente el presente documento y acepto todas sus cláusulas.

Este documento tiene plena validez legal conforme a los artículos 1803 y 1834 del Código Civil Federal, el artículo 51 Bis 2 de la Ley General de Salud, y la NOM-004-SSA3-2012. No podrá ser modificado una vez firmado digitalmente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Firma del paciente: [FIRMA DIGITAL AL CALCE]
Fecha de firma: [FECHA DE FIRMA]
Nombre del profesional tratante: Equipo Nutriser Aesthetic & Nutrition
Establecimiento: Nutriser Aesthetic & Nutrition, Puerto Vallarta, Jalisco, México`;

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

  // Validar sesión contra la BD al cargar (detecta si el admin eliminó al paciente)
  const [sessionChecked, setSessionChecked] = useState(false);
  const verifySession = trpc.patients.getById.useQuery(
    { id: patient?.id ?? 0 },
    {
      enabled: sessionChecked === false && !!patient && patient.id > 0,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (verifySession.isSuccess) {
      setSessionChecked(true);
    } else if (verifySession.isError) {
      // El paciente ya no existe en la BD (fue eliminado por el admin)
      localStorage.removeItem("nutriser_patient");
      setPatient(null);
      setView("auth");
      setSessionChecked(true);
      toast.error("Tu cuenta ya no está activa. Por favor crea una nueva cuenta.");
    }
  }, [verifySession.isSuccess, verifySession.isError]);

  // Persistir sesión en localStorage (sobrevive al cerrar el navegador)
  useEffect(() => {
    const stored = localStorage.getItem("nutriser_patient");
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setPatient(p);
        setView(p.consentAcceptedAt ? "portal" : "consent");
      } catch {
        localStorage.removeItem("nutriser_patient");
      }
    }
  }, []);

  const persistPatient = (p: PatientSafe) => {
    localStorage.setItem("nutriser_patient", JSON.stringify(p));
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

  // ─── Notificaciones push ────────────────────────────────────────────────────
  const [notifStatus, setNotifStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const savePushMutation = trpc.patients.savePush.useMutation();

  const handleEnableNotifications = async () => {
    if (!patient) return;
    setNotifStatus('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotifStatus('denied');
        toast.error('Debes permitir las notificaciones en tu navegador para activarlas.');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
      const subJson = JSON.stringify(sub);
      await savePushMutation.mutateAsync({ patientId: patient.id, pushSubscription: subJson });
      persistPatient({ ...patient, pushSubscription: subJson });
      setNotifStatus('granted');
      toast.success('¡Notificaciones activadas! Te avisaremos cuando tengas nuevas citas o tratamientos.');
    } catch (e) {
      console.error('[Push]', e);
      setNotifStatus('idle');
      toast.error('No se pudieron activar las notificaciones. Intenta de nuevo.');
    }
  };

  const handleDisableNotifications = async () => {
    if (!patient) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await savePushMutation.mutateAsync({ patientId: patient.id, pushSubscription: null });
      persistPatient({ ...patient, pushSubscription: null });
      setNotifStatus('idle');
      toast.success('Notificaciones desactivadas.');
    } catch (e) {
      toast.error('No se pudieron desactivar las notificaciones.');
    }
  };

  // Detectar si ya tiene notificaciones activas al cargar
  useEffect(() => {
    if (patient?.pushSubscription && Notification.permission === 'granted') {
      setNotifStatus('granted');
    }
  }, [patient?.id]);

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
    localStorage.removeItem("nutriser_patient");
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

          {/* Botón Inicio — arriba, visible */}
          <div className="flex justify-start mb-6">
            <button
              onClick={() => {
                sessionStorage.removeItem('nutriser_splash_seen');
                window.location.href = '/';
              }}
              className="flex items-center gap-2 bg-[#C5A55A] border-2 border-[#C5A55A] text-black px-4 py-2.5 rounded-full text-sm font-extrabold tracking-widest uppercase shadow-lg shadow-[#C5A55A]/30 hover:bg-[#B8944A] active:scale-95 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              INICIO
            </button>
          </div>

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
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-[#C5A55A] transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-[#C5A55A] transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
      <div
        className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Nutriser" className="h-8" />
            <div>
              <p className="text-white text-sm font-bold leading-tight">{patient?.name}</p>
              <p className="text-white/40 text-xs">Mis Tratamientos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Botón notificaciones */}
            <button
              onClick={notifStatus === 'granted' ? handleDisableNotifications : handleEnableNotifications}
              disabled={notifStatus === 'loading'}
              title={notifStatus === 'granted' ? 'Desactivar notificaciones' : 'Activar notificaciones'}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                notifStatus === 'granted'
                  ? 'bg-[#C5A55A]/20 text-[#C5A55A] hover:bg-[#C5A55A]/30'
                  : 'text-white/40 hover:text-[#C5A55A]'
              }`}
            >
              {notifStatus === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : notifStatus === 'granted' ? (
                <>
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#C5A55A] rounded-full" />
                </>
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('nutriser_splash_seen');
                window.location.href = '/';
              }}
              className="flex items-center gap-1 text-white/40 hover:text-[#C5A55A] text-xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Inicio
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors">
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
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
              (promotions as any[]).map((promo: any) => {
                const maxC = promo.maxCoupons ?? null;
                const remaining = promo.couponsRemaining ?? null;
                const pct = maxC && remaining != null ? Math.round(((maxC - remaining) / maxC) * 100) : null;
                const isSoldOut = remaining === 0;
                const isCritical = pct != null && pct >= 80 && !isSoldOut;
                const isLow = pct != null && pct >= 50 && pct < 80 && !isSoldOut;
                return (
                  <div key={promo.id} className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${isSoldOut ? 'opacity-70 grayscale' : ''}`}>
                    {/* Urgency ribbon */}
                    {isCritical && !isSoldOut && (
                      <div className="absolute top-0 left-0 right-0 z-20 bg-red-600 text-white text-center py-1.5 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1 animate-pulse">
                        <Flame className="w-3.5 h-3.5" /> ¡ÚTIMOS CUPONES! <Flame className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {isLow && !isSoldOut && (
                      <div className="absolute top-0 left-0 right-0 z-20 bg-orange-500 text-white text-center py-1.5 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pocos cupones disponibles
                      </div>
                    )}

                    {/* Imagen o header */}
                    {promo.imageUrl ? (
                      <div className={`relative overflow-hidden ${isCritical || isLow ? 'mt-7' : ''}`} style={{ height: '180px' }}>
                        <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {promo.regularPrice && promo.price && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                            🔥 OFERTA
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-serif text-lg text-white leading-tight drop-shadow-lg">{promo.title}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className={`bg-gradient-to-br from-[#1A1A1A] to-[#2a2a2a] p-4 ${isCritical || isLow ? 'mt-7' : ''}`}>
                        {promo.regularPrice && promo.price && (
                          <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black mb-2">🔥 OFERTA</div>
                        )}
                        <h3 className="font-serif text-lg text-white leading-tight">{promo.title}</h3>
                      </div>
                    )}

                    {/* Cuerpo dorado */}
                    <div className="bg-gradient-to-br from-[#C5A55A] via-[#B8963E] to-[#9E7D2A] p-4">
                      {promo.description && (
                        <p className="text-white/90 text-sm leading-relaxed mb-3">{promo.description}</p>
                      )}

                      {/* Precio comparativo */}
                      {(promo.regularPrice || promo.price) && (
                        <div className="bg-black/20 rounded-xl p-3 mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {promo.regularPrice && (
                              <div className="text-center">
                                <div className="text-white/50 text-[10px] uppercase tracking-wider">Antes</div>
                                <div className="text-white/60 text-base line-through font-semibold">{promo.regularPrice}</div>
                              </div>
                            )}
                            {promo.regularPrice && promo.price && (
                              <ArrowRight className="w-4 h-4 text-white/60 flex-shrink-0" />
                            )}
                            {promo.price && (
                              <div className="text-center">
                                <div className="text-yellow-200 text-[10px] uppercase tracking-wider font-bold">Ahora</div>
                                <div className="text-white text-xl font-black">{promo.price}</div>
                              </div>
                            )}
                          </div>
                          {promo.regularPrice && promo.price && (
                            <div className="bg-green-500 text-white text-xs font-black px-2 py-1 rounded-lg text-center">
                              ¡AHORRA!
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contador regresivo */}
                      {promo.expiresAt && (
                        <PromoCountdown expiresAt={promo.expiresAt} />
                      )}

                      {/* Barra de vendidos */}
                      {maxC != null && remaining != null && (
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-xs font-bold flex items-center gap-1 ${
                              isCritical ? 'text-red-200' : isLow ? 'text-orange-200' : 'text-white/80'
                            }`}>
                              {isCritical && <Flame className="w-3.5 h-3.5" />}
                              {isSoldOut ? '❌ AGOTADO' : '⚡ Cupones limitados'}
                            </span>
                            <span className="text-white/70 text-xs font-bold">🔥 {pct}% vendido</span>
                          </div>
                          <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                isCritical ? 'bg-red-500 animate-pulse' : isLow ? 'bg-orange-400' : 'bg-green-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Código de descuento si tiene */}
                      {promo.code && (
                        <div className="mb-3 bg-black/20 rounded-xl px-3 py-2 flex items-center justify-between">
                          <span className="text-yellow-200 font-mono font-black text-sm tracking-widest">{promo.code}</span>
                          <button
                            onClick={() => { navigator.clipboard.writeText(promo.code); toast.success("Código copiado"); }}
                            className="text-white/60 hover:text-white text-xs transition-colors font-bold"
                          >
                            Copiar
                          </button>
                        </div>
                      )}

                      {/* Botón Lo Quiero */}
                      <button
                        onClick={() => {
                          if (isSoldOut) { toast.error("Esta promoción ya no tiene cupones disponibles"); return; }
                          const waUrl = `https://wa.me/526441234567?text=${encodeURIComponent(`Hola, me interesa la promoción: ${promo.title}`)}`;
                          window.open(waUrl, '_blank');
                        }}
                        disabled={isSoldOut}
                        className={`block w-full py-3 px-4 rounded-xl font-black text-sm text-center uppercase tracking-widest transition-all duration-200 shadow-lg ${
                          isSoldOut
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-white text-[#8B6914] hover:bg-[#FAF7F2] hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        {isSoldOut ? '❌ Agotado' : '🎁 ¡Lo Quiero!'}
                      </button>
                    </div>
                  </div>
                );
              })
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
                {patient.consentPdfUrl && (
                  <button
                    onClick={() => {
                      // En iOS WKWebView, target="_blank" no funciona — usar location directa
                      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
                      if (isIOS) {
                        window.location.href = patient.consentPdfUrl!;
                      } else {
                        window.open(patient.consentPdfUrl!, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 text-[#C5A55A] text-xs hover:underline cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> Ver PDF firmado
                  </button>
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

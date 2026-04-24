/**
 * Nutriser — Portal "Mi Cuenta Nutriser"
 * Registro / Login de pacientes presenciales.
 * Tras autenticarse ven sus tratamientos, citas, fotos antes/después,
 * consentimiento informado, cupones y catálogo de servicios.
 * 
 * DISEÑO: Tema claro integrado con la tienda (fondo #f5f5f5, tarjetas blancas, acentos dorados)
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useDeviceType } from "@/hooks/useDeviceType";
import SignatureCanvas from "react-signature-canvas";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Bell, BellOff, Calendar, Camera, CheckCircle2, ChevronLeft, Clock, Eye, EyeOff,
  FileText, Flame, Heart, Loader2, Lock, LogOut, Mail, Phone, Scissors,
  ShieldCheck, Sparkles, Star, Tag, User, X,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { useLocation } from "wouter";
import { useSplash } from "@/contexts/SplashContext";

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
      isUrgent ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-600'
    }`}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{isUrgent ? '🔥 ' : '⏳ '}Oferta termina en: <strong className="text-gray-900">{timeLeft}</strong></span>
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
DOMICILIO: Nutriser Aesthetic & Nutrition
TELÉFONO: +52 (322) 100-7799
CORREO: clinicanutriserpv@gmail.com
FECHA DE EMISIÓN: 31 de marzo de 2026

Documento elaborado en cumplimiento de la NOM-004-SSA3-2012 del Expediente Clínico, el Artículo 51 Bis 2 de la Ley General de Salud, y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I. IDENTIFICACIÓN DE LAS PARTES

PRESTADOR DEL SERVICIO: Nutriser Aesthetic & Nutrition, establecimiento de salud y bienestar estético, con atención por profesionales certificados en nutrición clínica y procedimientos estéticos no invasivos.

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
Establecimiento: Nutriser Aesthetic & Nutrition`;

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MyTreatments() {
  const [location, navigate] = useLocation();
  const { isDesktop } = useDeviceType();
  // Leer returnTo del query string (ej: /mis-tratamientos?returnTo=/memberships)
  const returnTo = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('returnTo') || null;
    } catch { return null; }
  })();
  // Sesión unificada: si el usuario ya inició sesión en Shop/Academy/Splash1, se detecta aquí
  const { patient: unifiedPatient, login: unifiedLogin, logout: unifiedLogout, updateSession } = usePatientAuth();
  const patient = unifiedPatient as PatientSafe | null;

  const [view, setView] = useState<"auth" | "consent" | "portal">("auth");
  const [authMode, setAuthMode] = useState<"login" | "register" | "register-form" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  // Selectores de fecha de nacimiento
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [activeTab, setActiveTab] = useState<"tracking" | "photos" | "consent">("tracking");

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [signingConsent, setSigningConsent] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const consentScrollRef = useRef<HTMLDivElement>(null);
  const [consentScrolled, setConsentScrolled] = useState(false);
  const sigCanvasRef = useRef<SignatureCanvas>(null);

  // Validar sesión contra la BD al cargar
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
      unifiedLogout();
      setView("auth");
      setSessionChecked(true);
      toast.error("Tu cuenta ya no está activa. Por favor crea una nueva cuenta.");
    }
  }, [verifySession.isSuccess, verifySession.isError]);

  useEffect(() => {
    if (patient) {
      setView(patient.consentAcceptedAt ? "portal" : "consent");
    }
  }, []);

  useEffect(() => {
    if (patient && view === "auth") {
      setView(patient.consentAcceptedAt ? "portal" : "consent");
    }
  }, [patient]);

  const persistPatient = (p: PatientSafe) => {
    unifiedLogin(p as any);
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
  const { data: myPurchases, isLoading: purchasesLoading } = trpc.patients.getMyPurchases.useQuery(
    { email: patient?.email ?? 'x@x.com' },
    { enabled: false }
  );

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const registerMutation = trpc.patients.register.useMutation({
    onSuccess: (data) => {
      persistPatient(data as PatientSafe);
      setView("consent");
      toast.success("¡Cuenta creada! Por favor lee y firma el consentimiento.");
    },
    onError: (e) => toast.error(e.message),
  });

  // Redirigir al destino returnTo tras login/registro exitoso (solo cuando el consentimiento ya está firmado)
  const redirectAfterAuth = useCallback((p: PatientSafe) => {
    if (returnTo && p.consentAcceptedAt) {
      window.location.href = returnTo;
    }
  }, [returnTo]);

  const loginMutation = trpc.patients.login.useMutation({
    onSuccess: (data) => {
      const p = data as PatientSafe;
      persistPatient(p);
      if (returnTo) {
        // Si vino desde otra sección (tienda, monedero, etc.), regresar ahí siempre
        window.location.href = returnTo;
      } else {
        setView(p.consentAcceptedAt ? "portal" : "consent");
      }
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
      toast.success('¡Notificaciones activadas!');
    } catch (e) {
      console.error('[Push]', e);
      setNotifStatus('idle');
      toast.error('No se pudieron activar las notificaciones.');
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
        if (returnTo) {
          // Tras firmar el consentimiento, redirigir al destino original
          window.location.href = returnTo;
          return;
        }
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
    // Validar que la fecha de nacimiento sea obligatoria
    if (!birthDay || !birthMonth || !birthYear) {
      toast.error("La fecha de nacimiento es obligatoria");
      return;
    }
    // Construir fecha de nacimiento desde los 3 selectores
    const dd = birthDay.padStart(2, "0");
    const mm = birthMonth.padStart(2, "0");
    const birthday = `${birthYear}-${mm}-${dd}`;
    registerMutation.mutate({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      phone: fd.get("phone") as string,
      birthday,
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
    unifiedLogout();
    setView("auth");
    setAuthMode("login");
  };

  const { showSplash } = useSplash();
  const goBackToStore = () => {
    if (returnTo) {
      // Vino desde la tienda u otra sección → regresar ahí (aplica a todos los dispositivos)
      navigate(returnTo);
    } else if (isDesktop) {
      // PC sin returnTo → regresa al sitio web
      navigate('/');
    } else {
      // Móvil/tableta sin returnTo → regresa al splash hub
      showSplash();
    }
  };

  // ─── Helpers UI ─────────────────────────────────────────────────────────────
  const statusLabel = (s: Treatment["status"]) =>
    s === "pending" ? "Pendiente" : s === "in_progress" ? "En progreso" : "Finalizado";
  const statusColor = (s: Treatment["status"]) =>
    s === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
    s === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
    "bg-green-50 text-green-700 border-green-200";
  const apptStatusColor = (s: Appointment["status"]) =>
    s === "scheduled" ? "bg-blue-50 text-blue-700" :
    s === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700";
  const apptStatusLabel = (s: Appointment["status"]) =>
    s === "scheduled" ? "Programada" : s === "completed" ? "Realizada" : "Cancelada";
  const photoTypeLabel = (t: Photo["type"]) =>
    t === "before" ? "Antes" : t === "after" ? "Después" : "Progreso";
  const photoTypeColor = (t: Photo["type"]) =>
    t === "before" ? "bg-orange-50 text-orange-700" :
    t === "after" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700";

  const appointmentsForTreatment = (treatmentId: number) =>
    appointments.filter(a => a.treatmentId === treatmentId);

  // ─── Pantalla de autenticación ───────────────────────────────────────────────
  if (view === "auth") {
    return (
      <div className="fixed inset-0 bg-[#f5f5f5] overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 24px, 40px)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 24px, 40px)' }}>
        <div className="w-full max-w-md">

          {/* Botón Regresar */}
          <div className="flex justify-start mb-6">
            <button
              onClick={goBackToStore}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Regresar
            </button>
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src={LOGO_URL} alt="Nutriser" className="h-16 mb-3" />
            <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta Nutriser</h1>
            <p className="text-gray-500 text-sm text-center mt-2 max-w-xs leading-relaxed">
              Obtén tu Monedero Nutriser, acumula cashback en cada compra y accede a descuentos exclusivos en tratamientos y productos. Lleva el seguimiento de tus tratamientos en clínica y compra fácilmente en nuestra tienda.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            {/* Tabs */}
            {authMode !== "forgot" && authMode !== "register-form" && (
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                {(["login", "register"] as Array<"login" | "register" | "register-form">).map(m => (
                  <button key={m} onClick={() => setAuthMode(m)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${(authMode === m || (m === "register" && (authMode as string) === "register-form")) ? "bg-[#C5A55A] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
                  </button>
                ))}
              </div>
            )}

            {/* Login */}
            {authMode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input name="email" type="email" placeholder="Correo electrónico" required className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input name="password" type={showPassword ? "text" : "password"} placeholder="Contraseña" required className="pl-10 pr-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400" />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C5A55A] transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <Button type="submit" disabled={loginMutation.isPending} className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold">
                  {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </Button>
                <button type="button" onClick={() => setAuthMode("forgot")} className="w-full text-center text-gray-400 text-xs hover:text-gray-600 transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </form>
            )}

            {/* Register - Aviso de contrato */}
            {authMode === "register" && (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="w-14 h-14 rounded-full bg-[#C5A55A]/10 flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7 text-[#C5A55A]" />
                  </div>
                  <h3 className="text-gray-900 font-bold text-lg text-center">Contrato de Consentimiento</h3>
                  <p className="text-gray-500 text-sm text-center leading-relaxed">
                    Para crear tu cuenta en Nutriser es necesario que leas y firmes el{" "}
                    <strong className="text-gray-700">Contrato de Consentimiento Informado</strong>.
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <p className="text-[#C5A55A] text-xs font-semibold uppercase tracking-wider mb-2">¿Cómo firmar?</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {isDesktop
                      ? "Usa el mouse para dibujar tu firma en el recuadro. Se debe usar la firma de tu identificación oficial."
                      : "Usa tu dedo o S Pen para firmar directamente en la pantalla. Se debe usar la firma de tu identificación oficial."}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setAuthMode("register-form")}
                  className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold py-3"
                >
                  Continuar y leer contrato
                </Button>
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="w-full text-center text-gray-400 text-xs hover:text-gray-600 transition-colors"
                >
                  Ya tengo cuenta — Iniciar sesión
                </button>
              </div>
            )}
            {/* Register Form */}
            {authMode === "register-form" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <button type="button" onClick={() => setAuthMode("register")} className="flex items-center gap-1 text-gray-400 text-sm hover:text-gray-600 mb-2">
                  <ChevronLeft className="w-4 h-4" /> Volver
                </button>
                {/* Mensaje informativo: usar mismo correo del Portal de Salud */}
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3">
                  <span className="text-amber-500 text-base mt-0.5 flex-shrink-0">ℹ️</span>
                  <p className="text-amber-800 text-xs leading-relaxed">
                    <strong>¿Ya tienes cuenta en el Portal de Salud Nutriser?</strong> Te recomendamos usar el mismo correo electrónico y contraseña para acceder fácilmente desde cualquier parte de la app.
                  </p>
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input name="name" placeholder="Nombre completo" required minLength={2} className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input name="email" type="email" placeholder="Correo electrónico" required className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input name="phone" type="tel" placeholder="Teléfono / Celular" required minLength={8} className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400" />
                </div>
                {/* Fecha de nacimiento — 3 selectores para fácil uso en móvil */}
                <div>
                  <label className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Fecha de nacimiento <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={birthDay}
                      onChange={e => setBirthDay(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md px-2 py-2.5 outline-none focus:border-[#C5A55A]/60 appearance-none text-center"
                    >
                      <option value="">Día</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={String(d)}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={birthMonth}
                      onChange={e => setBirthMonth(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md px-2 py-2.5 outline-none focus:border-[#C5A55A]/60 appearance-none text-center"
                    >
                      <option value="">Mes</option>
                      {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m, i) => (
                        <option key={i} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={birthYear}
                      onChange={e => setBirthYear(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-md px-2 py-2.5 outline-none focus:border-[#C5A55A]/60 appearance-none text-center"
                    >
                      <option value="">Año</option>
                      {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 10 - i).map(y => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input name="password" type={showPassword ? "text" : "password"} placeholder="Contraseña (mín. 6 caracteres)" required minLength={6} className="pl-10 pr-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400" />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C5A55A] transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <Button type="submit" disabled={registerMutation.isPending} className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold">
                  {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear mi cuenta"}
                </Button>
              </form>
            )}

            {/* Forgot */}
            {authMode === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4">
                <button type="button" onClick={() => setAuthMode("login")} className="flex items-center gap-1 text-gray-400 text-sm hover:text-gray-600 mb-2">
                  <ChevronLeft className="w-4 h-4" /> Volver
                </button>
                <p className="text-gray-500 text-sm">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input name="email" type="email" placeholder="Correo electrónico" required className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400" />
                </div>
                <Button type="submit" disabled={forgotMutation.isPending} className="w-full bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold">
                  {forgotMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar enlace"}
                </Button>
              </form>
            )}
          </div>


        </div>
      </div>
      </div>
    );
  }

  // ─── Pantalla de consentimiento ───────────────────────────────────────────────
  if (view === "consent") {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-start px-4" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 24px, 40px)', paddingBottom: '24px' }}>
        <div className="w-full max-w-lg">
          {/* Botón Regresar — siempre lleva al splash en móvil/tableta, nunca al sitio web */}
          <div className="flex justify-start mb-4">
            <button
              onClick={goBackToStore}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Regresar
            </button>
          </div>
          <div className="flex flex-col items-center mb-6">
            <ShieldCheck className="w-12 h-12 text-[#C5A55A] mb-2" />
            <h1 className="text-2xl font-bold text-gray-900">Consentimiento Informado</h1>
            <p className="text-gray-500 text-sm mt-1 text-center">Lee el documento completo y fírmalo para continuar</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            {/* Documento */}
            <div
              ref={consentScrollRef}
              onScroll={() => {
                const el = consentScrollRef.current;
                if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setConsentScrolled(true);
              }}
              className="h-64 overflow-y-auto bg-gray-50 rounded-2xl p-4 mb-4 text-gray-600 text-xs leading-relaxed whitespace-pre-line border border-gray-200"
            >
              {patient ? CONSENT_TEXT.replace(
                "Yo, el/la paciente que firma el presente documento,",
                `Yo, ${patient.name}, paciente que firma el presente documento,`
              ) : CONSENT_TEXT}
            </div>
            {!consentScrolled && (
              <p className="text-[#C5A55A] text-xs text-center mb-3 flex items-center justify-center gap-1">
                <span>↓</span> Desplázate hasta el final para poder firmar
              </p>
            )}

            {/* Firma digital */}
            <div className="space-y-3">
              <label className="text-gray-700 text-sm font-semibold">
                {isDesktop ? "Firma digital (dibuja con el mouse):" : "Firma digital (dibuja con tu dedo):"}
              </label>
              <div className="bg-white rounded-2xl p-2 border border-gray-200">
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
                  className="flex-1 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  disabled={!consentScrolled}
                >
                  <X className="w-4 h-4 mr-2" /> Borrar
                </Button>
                <Button
                  onClick={handleSignConsent}
                  disabled={!consentScrolled || signatureEmpty || signingConsent || consentMutation.isPending}
                  className="flex-1 bg-[#C5A55A] hover:bg-[#B8963E] text-white font-bold"
                >
                  {signingConsent || consentMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando PDF...</>
                    : <><FileText className="w-4 h-4 mr-2" /> Firmar y continuar</>}
                </Button>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="mt-4 w-full text-center text-gray-400 text-xs hover:text-gray-600 transition-colors">
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
    <div className="min-h-screen bg-[#f5f5f5]" style={{ paddingBottom: '24px' }}>
      {/* Header — Estilo tienda */}
      <div
        className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBackToStore} className="flex items-center gap-1.5 text-gray-500 hover:text-[#C5A55A] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src={LOGO_URL} alt="Nutriser" className="h-8" />
            <div>
              <p className="text-[#C5A55A] text-[9px] tracking-[0.15em] uppercase font-semibold">Aesthetic & Nutrition</p>
              <p className="text-gray-900 text-sm font-bold leading-tight">Mi Cuenta Nutriser</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Nombre del paciente */}
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[#C5A55A] text-[10px] font-bold leading-tight">
                {patient?.name?.split(' ')[0]}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-green-600 text-[8px] font-semibold">Activa</span>
              </div>
            </div>
            {/* Notificaciones activas: solo mostrar campana dorada en el header cuando ya están activas */}
            {notifStatus === 'granted' && (
              <button
                onClick={handleDisableNotifications}
                title="Notificaciones push activas — haz clic para desactivar"
                className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#C5A55A]/10 text-[#C5A55A] transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#C5A55A] rounded-full" />
              </button>
            )}
            {/* Cerrar sesión */}
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 text-xs font-medium transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Banner de notificaciones push (solo visible cuando no están activas) ─── */}
      {notifStatus !== 'granted' && notifStatus !== 'loading' && (
        <div className="max-w-5xl mx-auto px-4 pt-3 pb-0">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#1A1A1A] to-[#2a2a2a] rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-lg">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #C5A55A 0%, transparent 60%)' }} />
            {/* Campana animada */}
            <button
              onClick={handleEnableNotifications}
              className="relative flex-shrink-0 w-12 h-12 rounded-full bg-[#C5A55A] flex items-center justify-center shadow-md shadow-[#C5A55A]/40 animate-bounce hover:scale-110 transition-transform"
              aria-label="Activar notificaciones push"
            >
              <Bell className="w-6 h-6 text-black" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1A1A1A]" />
            </button>
            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">
                ¡Activa las notificaciones push!
              </p>
              <p className="text-[#C5A55A] text-xs mt-0.5 leading-snug">
                Suscríbete y no te pierdas de exclusivas promociones y cupones de descuento solo para ti.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Layout: mobile=1col, desktop=2col */}
      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── Columna izquierda (sidebar en desktop) ── */}
          <div className="lg:w-64 xl:w-72 flex-shrink-0 space-y-4">
            {/* Resumen rápido */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
              <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center lg:text-left lg:flex lg:items-center lg:gap-3 shadow-sm">
                <p className="text-2xl font-bold text-[#C5A55A] lg:text-xl">{activeTreatments.length}</p>
                <p className="text-gray-500 text-xs mt-0.5 lg:mt-0">Activos</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center lg:text-left lg:flex lg:items-center lg:gap-3 shadow-sm">
                <p className="text-2xl font-bold text-green-600 lg:text-xl">{completedTreatments.length}</p>
                <p className="text-gray-500 text-xs mt-0.5 lg:mt-0">Finalizados</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center lg:text-left lg:flex lg:items-center lg:gap-3 shadow-sm">
                <p className="text-2xl font-bold text-blue-600 lg:text-xl">{upcomingAppointments.length}</p>
                <p className="text-gray-500 text-xs mt-0.5 lg:mt-0">Próximas citas</p>
              </div>
            </div>

            {/* Próximas citas (solo desktop) */}
            {upcomingAppointments.length > 0 && (
              <div className="hidden lg:block bg-[#C5A55A]/5 border border-[#C5A55A]/20 rounded-2xl p-4">
                <h3 className="text-gray-900 font-semibold text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C5A55A]" /> Próximas citas
                </h3>
                <div className="space-y-2">
                  {upcomingAppointments.map(a => {
                    const treatment = treatments.find(t => t.id === a.treatmentId);
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

            {/* Tabs — horizontal en móvil, vertical en desktop */}
            <div className="flex lg:flex-col bg-white border border-gray-100 rounded-2xl p-1 gap-1 shadow-sm">
              {([
                { id: "tracking", icon: Sparkles, label: "Seguimiento" },
                { id: "photos", icon: Camera, label: "Fotos" },
                { id: "consent", icon: FileText, label: "Contrato" },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 lg:flex-none flex flex-col lg:flex-row items-center lg:items-center gap-0.5 lg:gap-2 py-2 lg:py-2.5 lg:px-3 rounded-xl text-[10px] lg:text-xs font-semibold transition-all ${activeTab === tab.id ? "bg-[#C5A55A] text-white shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Próximas citas (solo móvil) */}
            {upcomingAppointments.length > 0 && (
              <div className="lg:hidden bg-[#C5A55A]/5 border border-[#C5A55A]/20 rounded-2xl p-4">
                <h3 className="text-gray-900 font-semibold text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C5A55A]" /> Próximas citas
                </h3>
                <div className="space-y-2">
                  {upcomingAppointments.map(a => {
                    const treatment = treatments.find(t => t.id === a.treatmentId);
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
          </div>

          {/* ── Columna derecha (contenido del tab) ── */}
          <div className="flex-1 min-w-0 space-y-5">


        {/* ── Tab: Seguimiento ── */}
        {activeTab === "tracking" && (
          <div className="space-y-4">
            {treatments.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aún no tienes tratamientos asignados.</p>
                <p className="text-gray-400 text-xs mt-1">El equipo de Nutriser los agregará pronto.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {treatments.map(t => {
                  const progress = t.totalSessions > 0 ? Math.round((t.completedSessions / t.totalSessions) * 100) : 0;
                  const tAppointments = appointments.filter(a => a.treatmentId === t.id);
                  return (
                    <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-gray-900 font-bold text-sm">{t.serviceName}</p>
                          {t.notes && <p className="text-gray-400 text-xs mt-0.5">{t.notes}</p>}
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          t.status === 'completed' ? 'bg-green-50 text-green-700' :
                          t.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                          'bg-yellow-50 text-yellow-700'
                        }`}>
                          {t.status === 'completed' ? 'Completado' :
                           t.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
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
                            {tAppointments.map(a => (
                              <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                                <div>
                                  <p className="text-gray-900 text-xs">{a.appointmentDate} · {a.appointmentTime}</p>
                                  {a.notes && <p className="text-gray-400 text-[10px]">{a.notes}</p>}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  a.status === 'completed' ? 'bg-green-50 text-green-700' :
                                  a.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                  'bg-blue-50 text-blue-700'
                                }`}>
                                  {a.status === 'completed' ? 'Dada' :
                                   a.status === 'cancelled' ? 'Perdida' : 'Programada'}
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
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aún no tienes fotos de seguimiento.</p>
                <p className="text-gray-400 text-xs mt-1">El equipo de Nutriser las subirá conforme avance tu tratamiento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map(photo => (
                  <button key={photo.id} onClick={() => setSelectedPhoto(photo)} className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
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

        {/* ── Tab: Contrato ── */}
        {activeTab === "consent" && (
          <div className="space-y-4">
            {patient?.consentAcceptedAt ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="text-gray-900 font-bold text-sm">Consentimiento firmado</h3>
                </div>
                <p className="text-gray-500 text-xs">
                  Firmado el {new Date(patient.consentAcceptedAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                {patient.consentPdfUrl && (
                  <button
                    onClick={() => {
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
                <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No has firmado el consentimiento aún.</p>
                <Button onClick={() => setView("consent")} className="mt-3 bg-[#C5A55A] hover:bg-[#B8963E] text-white text-xs">
                  Firmar ahora
                </Button>
              </div>
            )}
          </div>
        )}
          </div>
          {/* fin columna derecha */}
        </div>
        {/* fin flex row */}
      </div>
      {/* fin max-w-5xl */}

      {/* Modal foto ampliada */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
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

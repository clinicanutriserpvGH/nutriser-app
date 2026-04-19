import { useState, useMemo, useEffect } from "react";
import { useSplash } from "@/contexts/SplashContext";
import { trpc } from "@/lib/trpc";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useLocation } from "wouter";
import NutriserAuthModal from "@/components/NutriserAuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PlayCircle, FileText, MessageSquare, Bell, BellOff, ChevronLeft, Download, Clock, BookOpen, Send, CheckCircle, ThumbsUp, Lightbulb, Users, LogOut } from "lucide-react";
import BackToSplash from "@/components/BackToSplash";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

type Video = {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: string | null;
  sortOrder: number;
  isPublished: boolean;
};

type Course = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  isPublished: boolean;
};

type Document = {
  id: number;
  videoId: number;
  title: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
};

type Comment = {
  id: number;
  videoId: number;
  authorName: string;
  content: string;
  createdAt: Date;
};

export default function Courses() {
  const { showSplash } = useSplash();

  // Sesión unificada: detecta si el usuario ya inició sesión en Shop/Mis Tratamientos/Splash1
  const { patient, isLoggedIn, logout } = usePatientAuth();
  const { isMobile } = useDeviceType();
  const [, navigate] = useLocation();

  // Guard móvil
  const [mobileGuardOpen, setMobileGuardOpen] = useState(false);
  const [mobileGuardFeature, setMobileGuardFeature] = useState("acceder a esta función");

  /** Muestra el modal de auth (funciona en móvil, tableta y desktop) */
  const requireAuth = (featureDescription: string): boolean => {
    if (isLoggedIn) return true;
    setMobileGuardFeature(featureDescription);
    setMobileGuardOpen(true);
    return false;
  };

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState(() => patient?.email || "");
  const [subscribeName, setSubscribeName] = useState(() => patient?.name || "");
  const [subscribeEmailNotify, setSubscribeEmailNotify] = useState(true);
  const [subscribePushNotify, setSubscribePushNotify] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "comments" | "documents">("videos");

  // Datos del suscriptor guardados en localStorage
  const [savedSubscriber] = useState<{name: string; email: string} | null>(() => {
    try {
      const saved = localStorage.getItem('nutriser_academy_subscriber');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Foro de sugerencias
  const [suggestionTitle, setSuggestionTitle] = useState("");
  const [suggestionDesc, setSuggestionDesc] = useState("");
  const [suggestionName, setSuggestionName] = useState(() => patient?.name || "");
  const [suggestionEmail, setSuggestionEmail] = useState(() => patient?.email || "");
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);
  const [submittedSuggestion, setSubmittedSuggestion] = useState<{title: string; description: string; authorName: string} | null>(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [voterFingerprint] = useState(() => {
    let fp = localStorage.getItem('nutriser_voter_fp');
    if (!fp) {
      fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('nutriser_voter_fp', fp);
    }
    return fp;
  });
  const [votedIds, setVotedIds] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem('nutriser_voted_suggestions');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const { data: vapidData } = trpc.push.getVapidPublicKey.useQuery();
  const pushSubscribeMutation = trpc.push.subscribe.useMutation();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
    }
  }, []);

  const { data: courses = [], isLoading } = trpc.courses.list.useQuery();
  const { data: videos = [] } = trpc.courses.getVideos.useQuery(
    { courseId: selectedCourse?.id ?? 0 },
    { enabled: !!selectedCourse }
  );
  const { data: documents = [] } = trpc.courses.getDocuments.useQuery(
    { videoId: selectedVideo?.id ?? 0 },
    { enabled: !!selectedVideo }
  );
  const { data: comments = [] } = trpc.courses.getComments.useQuery(
    { videoId: selectedVideo?.id ?? 0 },
    { enabled: !!selectedVideo }
  );

  const { data: suggestions = [], refetch: refetchSuggestions } = trpc.suggestions.listApproved.useQuery();

  const createSuggestionMutation = trpc.suggestions.create.useMutation({
    onSuccess: () => {
      setSubmittedSuggestion({ title: suggestionTitle.trim(), description: suggestionDesc.trim(), authorName: suggestionName.trim() });
      setSuggestionSubmitted(true);
      setSuggestionTitle("");
      setSuggestionDesc("");
      setSuggestionName("");
      setSuggestionEmail("");
      setShowSuggestionForm(false);
      refetchSuggestions();
      toast.success("¡Sugerencia enviada y ya eres parte de la comunidad Nutriser!");
    },
    onError: () => {
      toast.error("No se pudo enviar la sugerencia.");
    },
  });

  const voteMutation = trpc.suggestions.vote.useMutation({
    onSuccess: (data, variables) => {
      if (data.alreadyVoted) {
        toast.info("Ya votaste por esta sugerencia.");
      } else {
        const newVoted = new Set(votedIds);
        newVoted.add(variables.suggestionId);
        setVotedIds(newVoted);
        localStorage.setItem('nutriser_voted_suggestions', JSON.stringify(Array.from(newVoted)));
        refetchSuggestions();
        toast.success("\u00a1Voto registrado!");
      }
    },
  });

  const handleSubmitSuggestion = () => {
    if (!suggestionName.trim()) {
      toast.error("El nombre es obligatorio para participar en el foro.");
      return;
    }
    if (!suggestionEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suggestionEmail.trim())) {
      toast.error("Ingresa un correo electrónico válido para unirte a la comunidad.");
      return;
    }
    if (!suggestionTitle.trim() || suggestionTitle.trim().length < 5) {
      toast.error("El título debe tener al menos 5 caracteres.");
      return;
    }
    // Guardar datos en localStorage para futuras visitas
    localStorage.setItem('nutriser_academy_subscriber', JSON.stringify({
      name: suggestionName.trim(),
      email: suggestionEmail.trim(),
    }));
    // Suscribir automáticamente al canal de la comunidad
    subscribeMutation.mutate({
      email: suggestionEmail.trim(),
      name: suggestionName.trim(),
      notifyByEmail: true,
    });
    createSuggestionMutation.mutate({
      title: suggestionTitle.trim(),
      description: suggestionDesc.trim() || undefined,
      authorName: suggestionName.trim(),
      authorEmail: suggestionEmail.trim(),
    });
  };

  const subscribeMutation = trpc.courses.subscribe.useMutation({
    onSuccess: () => {
      // Guardar datos en localStorage para autocompletar el foro
      localStorage.setItem('nutriser_academy_subscriber', JSON.stringify({
        name: subscribeName.trim(),
        email: subscribeEmail.trim(),
      }));
      toast.success("¡Bienvenido a la comunidad Academia Nutriser! Ya puedes participar en el foro.");
      setShowSubscribeModal(false);
      setSubscribeEmail("");
      setSubscribeName("");
    },
    onError: () => {
      toast.error("No se pudo completar la suscripción.");
    },
  });

  const createCommentMutation = trpc.courses.createComment.useMutation({
    onSuccess: () => {
      setCommentSubmitted(true);
      setCommentName("");
      setCommentEmail("");
      setCommentContent("");
    },
    onError: () => {
      toast.error("No se pudo enviar el comentario.");
    },
  });

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  };

  const handleSubscribe = async () => {
    // Requerir login antes de suscribirse
    if (!isLoggedIn) {
      if (isMobile) {
        setMobileGuardFeature("suscribirte a Academia Nutriser");
        setMobileGuardOpen(true);
      } else {
        navigate("/mis-tratamientos?returnTo=/cursos");
      }
      return;
    }
    if (!subscribeName.trim()) {
      toast.error("Por favor ingresa tu nombre.");
      return;
    }
    if (!subscribeEmail) {
      toast.error("Por favor ingresa tu correo electrónico.");
      return;
    }
    let pushSubscriptionStr: string | undefined;
    if (subscribePushNotify && pushSupported && vapidData?.publicKey) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          // Reusar suscripción existente si ya hay una activa (evita duplicados)
          let sub = await registration.pushManager.getSubscription();
          if (!sub) {
            sub = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey),
            });
          }
          const subJson = sub.toJSON();
          const p256dhKey = sub.getKey('p256dh')!;
          const authKey = sub.getKey('auth')!;
          const p256dhArray = Array.from(new Uint8Array(p256dhKey));
          const authArray = Array.from(new Uint8Array(authKey));
          // Guardar email en localStorage para vincularlo con la suscripción push
          localStorage.setItem('nutriser_subscriber_email', subscribeEmail.trim());
          await pushSubscribeMutation.mutateAsync({
            endpoint: subJson.endpoint!,
            p256dh: btoa(String.fromCharCode(...p256dhArray)),
            auth: btoa(String.fromCharCode(...authArray)),
            email: subscribeEmail.trim(),
          });
          pushSubscriptionStr = JSON.stringify(subJson);
        } else {
          toast.error('Permiso de notificaciones denegado. Solo se suscribirá por correo.');
        }
      } catch (e) {
        console.error('Error subscribing to push:', e);
        toast.error('No se pudo activar las notificaciones push. Solo correo.');
      }
    }
    subscribeMutation.mutate({
      email: subscribeEmail,
      name: subscribeName,
      notifyByEmail: subscribeEmailNotify,
      notifyByPush: subscribePushNotify && !!pushSubscriptionStr,
      pushSubscription: pushSubscriptionStr,
    });
  };

  const handleSubmitComment = () => {
    if (!commentName || !commentContent) {
      toast.error("Por favor completa tu nombre y comentario.");
      return;
    }
    if (!selectedVideo) return;
    createCommentMutation.mutate({
      videoId: selectedVideo.id,
      authorName: commentName,
      authorEmail: commentEmail || undefined,
      content: commentContent,
    });
  };

  const categoryLabels: Record<string, string> = {
    nutricion: "Nutrición",
    recetas: "Recetas",
    bienestar: "Bienestar",
    estetica: "Estética",
    general: "General",
  };

  const categoryColors: Record<string, string> = {
    nutricion: "bg-green-100 text-green-800",
    recetas: "bg-orange-100 text-orange-800",
    bienestar: "bg-blue-100 text-blue-800",
    estetica: "bg-pink-100 text-pink-800",
    general: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <BackToSplash hideHome />

      {/* Modal de login/registro integrado — funciona sin salir de la página */}
      <NutriserAuthModal
        isOpen={mobileGuardOpen}
        onClose={() => setMobileGuardOpen(false)}
        contextMessage={`Inicia sesión para ${mobileGuardFeature}`}
        onSuccess={() => setMobileGuardOpen(false)}
      />

      {/* Hero de Cursos */}
      <section className="relative bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] py-16 px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }}>

        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-[#C5A55A]" />
            <span className="text-[#C5A55A] font-semibold text-sm uppercase tracking-widest">Academia Nutriser</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Formación Digital <span className="text-[#C5A55A] italic">en Salud</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Accede a cursos, videos y material de apoyo creado por profesionales en nutrición, salud y medicina estética.
            Un espacio de aprendizaje digital con contenido práctico, actualizado y exclusivo.
          </p>
          {/* Bienvenida con nombre del usuario o botón de login */}
          {isLoggedIn && patient ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-5 py-2">
                <span className="text-white/70 text-sm">Hola,</span>
                <span className="text-[#C5A55A] font-semibold text-sm">{patient.name}</span>
              </div>
              {/* Cerrar sesión — solo visible en desktop */}
              <button
                onClick={() => logout()}
                className="hidden md:flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={() => requireAuth("suscribirte y acceder a contenido exclusivo de Academia") && setShowSubscribeModal(true)}
                className="bg-[#C5A55A] hover:bg-[#B8944A] text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 mx-auto"
              >
                <Bell className="w-5 h-5" />
                Suscríbete para acceder a contenido exclusivo
              </Button>
            </div>
          )}
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">

        {/* Vista de video seleccionado */}
        {selectedVideo && selectedCourse ? (
          <div>
            {/* Breadcrumb */}
            <button
              onClick={() => { setSelectedVideo(null); setCommentSubmitted(false); setActiveTab("videos"); }}
              className="flex items-center gap-2 text-[#C5A55A] hover:text-[#B8944A] mb-6 font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver a {selectedCourse.title}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reproductor principal */}
              <div className="lg:col-span-2">
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative">
                  <video
                    key={selectedVideo.id}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full"
                    poster={selectedVideo.thumbnailUrl || undefined}
                    onContextMenu={(e) => e.preventDefault()}
                    playsInline
                    preload="auto"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const errDiv = target.nextElementSibling as HTMLElement;
                      if (errDiv) errDiv.style.display = 'flex';
                    }}
                  >
                    {/* Servir todos los videos como video/mp4 — Safari acepta MOV/H.264 con este MIME type */}
                    <source src={selectedVideo.videoUrl} type="video/mp4" />
                    <source src={selectedVideo.videoUrl} type="video/quicktime" />
                    <source src={selectedVideo.videoUrl} type="video/webm" />
                    Tu navegador no soporta la reproducción de video.
                  </video>
                  <div className="absolute inset-0 flex-col items-center justify-center bg-black text-white text-center p-4 hidden">
                    <p className="text-lg font-semibold mb-2">⚠️ No se puede reproducir el video</p>
                    <p className="text-sm text-gray-400 mb-4">El formato del video puede no ser compatible con tu navegador.</p>
                    <a href={selectedVideo.videoUrl} download className="px-4 py-2 bg-[#C5A55A] text-white rounded-lg text-sm hover:bg-[#B8963E] transition-colors">Descargar video</a>
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-2">{selectedVideo.title}</h2>
                  {selectedVideo.duration && (
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                      <Clock className="w-4 h-4" />
                      <span>{selectedVideo.duration}</span>
                    </div>
                  )}
                  {selectedVideo.description && (
                    <p className="text-gray-600 leading-relaxed">{selectedVideo.description}</p>
                  )}
                </div>

                {/* Tabs: Documentos y Comentarios */}
                <div className="mt-8">
                  <div className="flex gap-1 border-b border-gray-200 mb-6">
                    <button
                      onClick={() => setActiveTab("documents")}
                      className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "documents" ? "bg-[#C5A55A] text-white" : "text-gray-600 hover:text-[#C5A55A]"}`}
                    >
                      <span className="flex items-center gap-2"><FileText className="w-4 h-4" />Material ({documents.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("comments")}
                      className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === "comments" ? "bg-[#C5A55A] text-white" : "text-gray-600 hover:text-[#C5A55A]"}`}
                    >
                      <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Comentarios ({comments.length})</span>
                    </button>
                  </div>

                  {/* Documentos */}
                  {activeTab === "documents" && (
                    <div>
                      {documents.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay material de apoyo para este video.</p>
                      ) : (
                        <div className="space-y-3">
                          {documents.map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => {
                                const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
                                if (isIOS) {
                                  window.location.href = doc.fileUrl;
                                } else {
                                  window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#C5A55A] hover:shadow-md transition-all group w-full text-left"
                            >
                              <div className="w-10 h-10 bg-[#C5A55A]/10 rounded-lg flex items-center justify-center group-hover:bg-[#C5A55A]/20">
                                <FileText className="w-5 h-5 text-[#C5A55A]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[#1A1A1A] truncate">{doc.title}</p>
                                <p className="text-xs text-gray-500 uppercase">{doc.fileType || "PDF"}{doc.fileSize ? ` · ${(doc.fileSize / 1024 / 1024).toFixed(1)} MB` : ""}</p>
                              </div>
                              <Download className="w-5 h-5 text-[#C5A55A] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comentarios */}
                  {activeTab === "comments" && (
                    <div>
                      {/* Formulario de comentario */}
                      {commentSubmitted ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="font-medium text-green-800">¡Comentario enviado!</p>
                          <p className="text-green-600 text-sm">Tu comentario está pendiente de revisión y será publicado pronto.</p>
                          <button onClick={() => setCommentSubmitted(false)} className="mt-3 text-sm text-[#C5A55A] hover:underline">Escribir otro comentario</button>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                          <h3 className="font-semibold text-[#1A1A1A] mb-4">Deja tu comentario</h3>
                          <p className="text-xs text-gray-500 mb-4">Los comentarios son revisados antes de publicarse.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <Input
                              placeholder="Tu nombre *"
                              value={commentName}
                              onChange={(e) => setCommentName(e.target.value)}
                            />
                            <Input
                              placeholder="Tu correo (opcional)"
                              type="email"
                              value={commentEmail}
                              onChange={(e) => setCommentEmail(e.target.value)}
                            />
                          </div>
                          <Textarea
                            placeholder="Escribe tu comentario o pregunta..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            rows={3}
                            className="mb-3"
                          />
                          <Button
                            onClick={handleSubmitComment}
                            disabled={createCommentMutation.isPending}
                            className="bg-[#C5A55A] hover:bg-[#B8944A] text-white flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            {createCommentMutation.isPending ? "Enviando..." : "Enviar comentario"}
                          </Button>
                        </div>
                      )}

                      {/* Lista de comentarios aprobados */}
                      {comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Sé el primero en comentar.</p>
                      ) : (
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <div key={comment.id} className="bg-white rounded-xl border border-gray-100 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-[#C5A55A]/20 rounded-full flex items-center justify-center text-[#C5A55A] font-bold text-sm">
                                  {comment.authorName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-[#1A1A1A] text-sm">{comment.authorName}</p>
                                  <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</p>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de videos del curso */}
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-[#C5A55A]" />
                  Videos del curso ({videos.length})
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {videos.map((video, idx) => (
                    <button
                      key={video.id}
                      onClick={() => { setSelectedVideo(video); setCommentSubmitted(false); }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${selectedVideo.id === video.id ? "border-[#C5A55A] bg-[#C5A55A]/5" : "border-gray-100 bg-white hover:border-[#C5A55A]/50"}`}
                    >
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0 w-16 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
                              <PlayCircle className="w-6 h-6 text-[#C5A55A]" />
                            </div>
                          )}
                          {selectedVideo.id === video.id && (
                            <div className="absolute inset-0 bg-[#C5A55A]/30 flex items-center justify-center">
                              <PlayCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium mb-0.5 ${selectedVideo.id === video.id ? "text-[#C5A55A]" : "text-gray-400"}`}>Video {idx + 1}</p>
                          <p className="text-sm font-medium text-[#1A1A1A] line-clamp-2 leading-tight">{video.title}</p>
                          {video.duration && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{video.duration}</p>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : selectedCourse ? (
          /* Vista de videos de un curso */
          <div>
            <button
              onClick={() => setSelectedCourse(null)}
              className="flex items-center gap-2 text-[#C5A55A] hover:text-[#B8944A] mb-6 font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Todos los cursos
            </button>

            <div className="flex items-start gap-4 mb-8">
              {selectedCourse.thumbnailUrl && (
                <img src={selectedCourse.thumbnailUrl} alt={selectedCourse.title} className="w-24 h-24 rounded-xl object-cover shadow-md" />
              )}
              <div>
                <Badge className={`mb-2 ${categoryColors[selectedCourse.category || "general"] || "bg-gray-100 text-gray-800"}`}>
                  {categoryLabels[selectedCourse.category || "general"] || selectedCourse.category}
                </Badge>
                <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">{selectedCourse.title}</h2>
                {selectedCourse.description && <p className="text-gray-600 mt-2">{selectedCourse.description}</p>}
                <p className="text-sm text-gray-400 mt-1">{videos.length} video{videos.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {videos.length === 0 ? (
              <div className="text-center py-16">
                <PlayCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">Este curso aún no tiene videos publicados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, idx) => (
                  <button
                    key={video.id}
                    onClick={() => { setSelectedVideo(video); setActiveTab("videos"); }}
                    className="text-left bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#C5A55A] hover:shadow-lg transition-all group"
                  >
                    <div className="relative aspect-video bg-[#1A1A1A]">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PlayCircle className="w-12 h-12 text-[#C5A55A]" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="w-14 h-14 bg-[#C5A55A] rounded-full flex items-center justify-center shadow-lg">
                          <PlayCircle className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />{video.duration}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-[#C5A55A] font-medium mb-1">Video {idx + 1}</p>
                      <h3 className="font-semibold text-[#1A1A1A] line-clamp-2 leading-tight">{video.title}</h3>
                      {video.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Vista principal: lista de cursos */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Cursos y Contenido Especializado</h2>
                <p className="text-gray-500 text-sm mt-1">{courses.length} curso{courses.length !== 1 ? "s" : ""} disponible{courses.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-100" />
                    <div className="p-5">
                      <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                      <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="max-w-2xl mx-auto">
                  <div className="relative inline-block mb-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#C5A55A]/20 to-[#C5A55A]/5 flex items-center justify-center mx-auto">
                      <BookOpen className="w-14 h-14 text-[#C5A55A]/60" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#C5A55A]/20 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-[#C5A55A]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-3">Contenido en preparación</h3>
                  <p className="text-gray-500">Estamos preparando cursos, clases en video y recursos exclusivos para ti.</p>
                  {isLoggedIn && patient ? (
                    <div className="flex flex-col items-center gap-3 mb-8">
                      <div className="flex items-center gap-2 bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-full px-5 py-2">
                        <CheckCircle className="w-4 h-4 text-[#C5A55A]" />
                        <span className="text-[#C5A55A] text-sm font-medium">Ya eres miembro de la comunidad, <strong>{patient.name}</strong></span>
                      </div>
                      <p className="text-gray-400 text-sm">El contenido estará disponible próximamente. Te notificaremos cuando haya nuevos cursos.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">Suscríbete para recibir notificaciones sobre nuevos contenidos y próximos lanzamientos de Academia Nutriser.</p>
                      <Button
                        onClick={() => requireAuth("unirte a la comunidad y recibir contenido exclusivo de Academia Nutriser") && setShowSubscribeModal(true)}
                        className="bg-[#C5A55A] hover:bg-[#B8944A] text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-[#C5A55A]/20 mb-8"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Suscríbeme y únete a la comunidad
                      </Button>
                    </>
                  )}
                  <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div className="bg-white rounded-xl border border-[#C5A55A]/15 p-4">
                      <div className="w-8 h-8 rounded-full bg-[#C5A55A]/10 flex items-center justify-center mb-3">
                        <Bell className="w-4 h-4 text-[#C5A55A]" />
                      </div>
                      <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Avisos de nuevo contenido</p>
                      <p className="text-xs text-gray-400">Recibe un aviso en el momento que nuestros expertos publiquen nuevo contenido.</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#C5A55A]/15 p-4">
                      <div className="w-8 h-8 rounded-full bg-[#C5A55A]/10 flex items-center justify-center mb-3">
                        <FileText className="w-4 h-4 text-[#C5A55A]" />
                      </div>
                      <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Recursos descargables</p>
                      <p className="text-xs text-gray-400">Cada curso incluye documentos, guías y recursos descargables de nuestros expertos.</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#C5A55A]/15 p-4">
                      <div className="w-8 h-8 rounded-full bg-[#C5A55A]/10 flex items-center justify-center mb-3">
                        <MessageSquare className="w-4 h-4 text-[#C5A55A]" />
                      </div>
                      <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Comunidad Nutriser</p>
                      <p className="text-xs text-gray-400">Al suscribirte puedes proponer temas y votar en el foro. Solo miembros de la comunidad pueden participar.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="text-left bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#C5A55A] hover:shadow-xl transition-all group"
                  >
                    <div className="relative aspect-video bg-[#1A1A1A]">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-[#C5A55A]" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div className="bg-[#C5A55A] text-white text-sm font-semibold px-4 py-2 rounded-full">Ver contenido</div>
                      </div>
                    </div>
                    <div className="p-5">
                      <Badge className={`mb-3 text-xs ${categoryColors[course.category || "general"] || "bg-gray-100 text-gray-800"}`}>
                        {categoryLabels[course.category || "general"] || course.category}
                      </Badge>
                      <h3 className="font-serif font-bold text-[#1A1A1A] text-lg leading-tight mb-2 group-hover:text-[#C5A55A] transition-colors">{course.title}</h3>
                      {course.description && <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>}
                      <div className="flex items-center gap-1 mt-3 text-[#C5A55A] text-sm font-medium">
                        <PlayCircle className="w-4 h-4" />
                        <span>Ver contenido →</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de suscripción */}
      <Dialog open={showSubscribeModal} onOpenChange={setShowSubscribeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#C5A55A]" />
              Únete a la comunidad Academia Nutriser
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-500 text-sm">Suscríbete para recibir notificaciones de nuevo contenido y pertenecer a la comunidad. Solo los miembros pueden participar en el foro de sugerencias.</p>
          <div className="space-y-3 mt-2">
            <Input
              placeholder="Tu nombre *"
              value={subscribeName}
              onChange={(e) => setSubscribeName(e.target.value)}
            />
            <Input
              placeholder="Tu correo electrónico *"
              type="email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={subscribeEmailNotify}
                onChange={(e) => setSubscribeEmailNotify(e.target.checked)}
                className="rounded"
              />
              Recibir notificaciones por correo
            </label>
            {pushSupported && (
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribePushNotify}
                  onChange={(e) => setSubscribePushNotify(e.target.checked)}
                  className="rounded"
                />
                Recibir notificaciones push en este dispositivo
              </label>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowSubscribeModal(false)} className="flex-1">Cancelar</Button>
            <Button
              onClick={handleSubscribe}
              disabled={subscribeMutation.isPending}
              className="flex-1 bg-[#C5A55A] hover:bg-[#B8944A] text-white"
            >
              {subscribeMutation.isPending ? "Suscribiendo..." : "Suscribirme"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================
           FORO DE SUGERENCIAS DE TEMAS
           ============================================================ */}
      <section className="bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Encabezado */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Lightbulb className="w-7 h-7 text-[#C5A55A]" />
              <span className="text-[#C5A55A] font-semibold text-sm uppercase tracking-widest">Foro de Sugerencias</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-white mb-3">
              ¿Qué tema quieres que aborden nuestros expertos?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Propón temas de salud y estética, y vota por las sugerencias de otros. Los temas más votados serán cubiertos por nuestros expertos.
            </p>
          </div>

          {/* Formulario de sugerencia */}
          {!showSuggestionForm && !suggestionSubmitted ? (
            <div className="text-center mb-10">
              <Button
                onClick={() => { if (!requireAuth("participar en el foro y sugerir temas")) return; setShowSuggestionForm(true); }}
                className="bg-[#C5A55A] hover:bg-[#B8944A] text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 mx-auto"
              >
                <Lightbulb className="w-5 h-5" />
                Sugerir un tema
              </Button>
            </div>
          ) : suggestionSubmitted ? (
            <div className="mb-10">
              {/* Post pendiente - se ve como tarjeta de sugerencia pero con badge de pendiente */}
              <div className="bg-white/5 border border-[#C5A55A]/40 rounded-2xl p-5 mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-white/20 text-gray-500">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm font-bold">0</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white leading-tight">{submittedSuggestion?.title}</p>
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">⏳ Pendiente de aprobación</span>
                    </div>
                    {submittedSuggestion?.description && (
                      <p className="text-gray-400 text-sm mt-1 leading-relaxed">{submittedSuggestion.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Por {submittedSuggestion?.authorName}</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-[#C5A55A] text-sm mb-3">
                  <CheckCircle className="w-4 h-4" />
                  <span>Tu sugerencia fue enviada y será visible una vez que el equipo la apruebe.</span>
                </div>
                <button
                  onClick={() => { setSuggestionSubmitted(false); setSubmittedSuggestion(null); }}
                  className="text-[#C5A55A] text-sm hover:underline"
                >
                  Enviar otra sugerencia
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#C5A55A]" />
                Nueva sugerencia de tema
              </h3>
              <div className="space-y-3">
                {isLoggedIn && patient ? (
                  <div className="flex items-center gap-2 bg-[#C5A55A]/10 border border-[#C5A55A]/30 rounded-lg px-3 py-2">
                    <span className="text-[#C5A55A] text-sm">✓</span>
                    <span className="text-[#C5A55A] text-sm font-medium">Participando como <strong>{patient.name}</strong></span>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder="Tu nombre *"
                      value={suggestionName}
                      onChange={(e) => setSuggestionName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                    <Input
                      type="email"
                      placeholder="Tu correo electrónico * (para unirte a la comunidad)"
                      value={suggestionEmail}
                      onChange={(e) => setSuggestionEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                    <p className="text-[11px] text-[#C5A55A]/70 -mt-1 px-1">
                      ✓ Al enviar quedarás suscrito a la comunidad Academia Nutriser
                    </p>
                  </>
                )}
                <Input
                  placeholder="Título del tema * (mín. 5 caracteres)"
                  value={suggestionTitle}
                  onChange={(e) => setSuggestionTitle(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
                <Textarea
                  placeholder="Descripción adicional (opcional) — ¿Por qué es importante este tema?"
                  value={suggestionDesc}
                  onChange={(e) => setSuggestionDesc(e.target.value)}
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSuggestionForm(false)}
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitSuggestion}
                  disabled={createSuggestionMutation.isPending}
                  className="bg-[#C5A55A] hover:bg-[#B8944A] text-white flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createSuggestionMutation.isPending ? "Enviando..." : "Enviar sugerencia"}
                </Button>
              </div>
            </div>
          )}

          {/* Lista de sugerencias aprobadas */}
          {suggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-5 h-5 text-[#C5A55A]" />
                <h3 className="text-white font-semibold">
                  Sugerencias de la comunidad ({suggestions.length})
                </h3>
              </div>
              <div className="space-y-3">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4 hover:border-[#C5A55A]/30 transition-colors"
                  >
                    {/* Botón de voto */}
                    <button
                      onClick={() => voteMutation.mutate({ suggestionId: s.id, voterFingerprint: voterFingerprint })}
                      disabled={votedIds.has(s.id) || voteMutation.isPending}
                      className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${
                        votedIds.has(s.id)
                          ? 'border-[#C5A55A] bg-[#C5A55A]/10 text-[#C5A55A]'
                          : 'border-white/20 text-gray-400 hover:border-[#C5A55A]/50 hover:text-[#C5A55A]'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-bold">{s.votes}</span>
                    </button>
                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white leading-tight">{s.title}</p>
                      {s.description && (
                        <p className="text-gray-400 text-sm mt-1 leading-relaxed">{s.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">
                          Por {s.authorName || 'Anónimo'}
                        </span>
                        {s.status === 'published' && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            ✅ Ya publicado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.length === 0 && (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-[#C5A55A]/30 mx-auto mb-3" />
              <p className="text-gray-500">¡Sé el primero en sugerir un tema!</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

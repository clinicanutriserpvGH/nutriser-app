/**
 * Nutriser - Lector de eBook
 * Visor PDF seguro: muestra el PDF en línea sin permitir descarga.
 * Acceso controlado por:
 *   1. Login con correo + contraseña → datos en sessionStorage
 *   2. Token URL (compatibilidad hacia atrás)
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { BookOpen, ZoomIn, ZoomOut, Loader2, AlertCircle, Lock, LogOut } from "lucide-react";

// Obtener token de la URL (compatibilidad hacia atrás)
function getTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

// Obtener datos de sesión guardados por EbookLogin
function getSessionData() {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem("ebookAccessToken");
  const pdfUrl = sessionStorage.getItem("ebookPdfUrl");
  const title = sessionStorage.getItem("ebookTitle");
  const buyerName = sessionStorage.getItem("ebookBuyerName");
  if (token && pdfUrl) return { token, pdfUrl, title: title || "eBook Nutriser", buyerName: buyerName || "" };
  return null;
}

export default function EbookReader() {
  const [, navigate] = useLocation();
  const [zoom, setZoom] = useState(100);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determinar modo de acceso
  const urlToken = getTokenFromUrl();
  const sessionData = getSessionData();

  // Modo 1: Acceso por sessionStorage (login con correo+contraseña)
  const [directAccess] = useState(() => sessionData);

  // Modo 2: Acceso por token URL (compatibilidad hacia atrás)
  const { data: tokenAccess, isLoading: tokenLoading, error: tokenError } = trpc.ebook.getAccess.useQuery(
    { token: urlToken ?? "" },
    {
      enabled: !!urlToken && !directAccess,
      retry: false,
    }
  );

  // Bloquear click derecho y atajos de teclado de descarga
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("ebookAccessToken");
    sessionStorage.removeItem("ebookPdfUrl");
    sessionStorage.removeItem("ebookTitle");
    sessionStorage.removeItem("ebookBuyerName");
    navigate("/ebook/login");
  };

  // Sin acceso de ningún tipo
  if (!directAccess && !urlToken) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 text-[#C5A55A]/50 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-white mb-3">Acceso requerido</h2>
          <p className="text-[#999] mb-6">
            Debes iniciar sesión con tu correo y contraseña para leer el eBook.
          </p>
          <button
            onClick={() => navigate("/ebook/login")}
            className="bg-[#C5A55A] hover:bg-[#B39548] text-white font-bold px-8 py-3 rounded-lg transition"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  // Cargando token URL
  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C5A55A] animate-spin mx-auto mb-4" />
          <p className="text-[#999]">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Error de token URL
  if (urlToken && !directAccess && (tokenError || !tokenAccess)) {
    const errorMsg = tokenError?.message || "Acceso no válido";
    const isPending = errorMsg.includes("pendiente");
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isPending ? "text-yellow-500" : "text-red-500"}`} />
          <h2 className="font-serif text-2xl text-white mb-3">
            {isPending ? "Pago en revisión" : "Acceso no válido"}
          </h2>
          <p className="text-[#999] leading-relaxed mb-6">
            {isPending
              ? "Tu compra está siendo verificada. Recibirás un correo con tus credenciales de acceso una vez que se apruebe tu pago."
              : "Este enlace no es válido. Usa el login con correo y contraseña."}
          </p>
          <button
            onClick={() => navigate("/ebook/login")}
            className="bg-[#C5A55A] hover:bg-[#B39548] text-white font-bold px-8 py-3 rounded-lg transition"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  // Determinar datos del PDF a mostrar
  const pdfData = directAccess
    ? { pdfUrl: directAccess.pdfUrl, title: directAccess.title, buyerName: directAccess.buyerName }
    : tokenAccess
    ? { pdfUrl: tokenAccess.pdfUrl, title: tokenAccess.title, buyerName: "" }
    : null;

  if (!pdfData?.pdfUrl) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#C5A55A]/50 mx-auto mb-3" />
          <p className="text-[#999]">El archivo PDF no está disponible aún. Contacta a Nutriser.</p>
        </div>
      </div>
    );
  }

  const pdfViewerUrl = `${pdfData.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=${zoom}`;

  return (
    <div
      className="min-h-screen bg-[#1A1A1A] flex flex-col select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* Header */}
      <div className="bg-[#111] border-b border-[#C5A55A]/20 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C5A55A]/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[#C5A55A]" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm line-clamp-1">{pdfData.title}</h1>
            {pdfData.buyerName && (
              <p className="text-[#666] text-xs">Hola, {pdfData.buyerName} · Solo lectura en línea</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="w-8 h-8 bg-[#333] hover:bg-[#444] text-white rounded-lg flex items-center justify-center transition"
              title="Reducir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[#999] text-sm w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="w-8 h-8 bg-[#333] hover:bg-[#444] text-white rounded-lg flex items-center justify-center transition"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Logout (solo si acceso por login) */}
          {directAccess && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-[#666] hover:text-[#C5A55A] transition text-xs"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative overflow-hidden">
        {!pdfLoaded && !pdfError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] z-10">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-[#C5A55A] animate-spin mx-auto mb-3" />
              <p className="text-[#999] text-sm">Cargando eBook...</p>
            </div>
          </div>
        )}

        {pdfError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] z-10">
            <div className="text-center max-w-sm px-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-white font-semibold mb-2">Error al cargar el eBook</p>
              <p className="text-[#999] text-sm">
                Por favor recarga la página. Si el problema persiste, contacta a Nutriser.
              </p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={pdfViewerUrl}
          className="w-full h-full border-0"
          style={{ height: "calc(100vh - 60px)" }}
          onLoad={() => setPdfLoaded(true)}
          onError={() => setPdfError(true)}
          title={pdfData.title}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Footer */}
      <div className="bg-[#111] border-t border-[#C5A55A]/20 px-4 py-2 flex items-center justify-center">
        <p className="text-[#555] text-xs">
          © Nutriser Aesthetic & Nutrition · Contenido protegido · Solo lectura en línea
        </p>
      </div>
    </div>
  );
}

/**
 * Nutriser - Lector de eBook
 * Visor PDF seguro: muestra el PDF en línea sin permitir descarga
 * Acceso controlado por token único enviado por email
 */
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { BookOpen, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle, Lock } from "lucide-react";

// Obtener token de la URL
function getTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

export default function EbookReader() {
  const [token] = useState(() => getTokenFromUrl());
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: access, isLoading, error } = trpc.ebook.getAccess.useQuery(
    { token: token ?? "" },
    {
      enabled: !!token,
      retry: false,
    }
  );

  // Bloquear click derecho y atajos de teclado de descarga
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear Ctrl+S, Ctrl+P, Ctrl+Shift+S
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

  if (!token) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 text-[#C5A55A]/50 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-white mb-3">Acceso no válido</h2>
          <p className="text-[#999]">
            Este enlace no es válido. Por favor utiliza el enlace que recibiste por correo electrónico.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C5A55A] animate-spin mx-auto mb-4" />
          <p className="text-[#999]">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (error || !access) {
    const errorMsg = error?.message || "Acceso no válido";
    const isPending = errorMsg.includes("pendiente");

    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isPending ? "text-yellow-500" : "text-red-500"}`} />
          <h2 className="font-serif text-2xl text-white mb-3">
            {isPending ? "Pago en revisión" : "Acceso no válido"}
          </h2>
          <p className="text-[#999] leading-relaxed">
            {isPending
              ? "Tu compra está siendo verificada. Recibirás un correo con el enlace de acceso una vez que se apruebe tu pago. Esto puede tomar hasta 24 horas hábiles."
              : "Este enlace de acceso no es válido o ha expirado. Por favor contacta a Nutriser para obtener ayuda."}
          </p>
          {isPending && (
            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-400 text-sm">
                Si ya pasaron más de 24 horas, contáctanos al WhatsApp: <strong>322 450 3257</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Construir URL del PDF con parámetros para deshabilitar la barra de herramientas
  const pdfViewerUrl = access.pdfUrl
    ? `${access.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=${zoom}`
    : null;

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
            <h1 className="text-white font-semibold text-sm line-clamp-1">{access.title}</h1>
            <p className="text-[#666] text-xs">Nutriser · Lectura en línea</p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
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
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative overflow-hidden">
        {!pdfLoaded && !pdfError && pdfViewerUrl && (
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

        {pdfViewerUrl ? (
          <iframe
            ref={iframeRef}
            src={pdfViewerUrl}
            className="w-full h-full border-0"
            style={{
              height: "calc(100vh - 60px)",
              pointerEvents: "auto",
            }}
            onLoad={() => setPdfLoaded(true)}
            onError={() => setPdfError(true)}
            title={access.title}
            // Atributos de seguridad para prevenir descarga
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-[#C5A55A]/50 mx-auto mb-3" />
              <p className="text-[#999]">El archivo PDF no está disponible</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#111] border-t border-[#C5A55A]/20 px-4 py-2 flex items-center justify-center">
        <p className="text-[#555] text-xs">
          © Nutriser Aesthetic & Nutrition · Puerto Vallarta · Contenido protegido · Solo lectura en línea
        </p>
      </div>
    </div>
  );
}

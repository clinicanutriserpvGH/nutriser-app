/**
 * EbookViewer — Lector de libro digital tipo ePub/Kindle
 * - Acceso directo desde el monedero (sin contraseña)
 * - Modo día/noche, ajuste de fuente, navegación por páginas
 * - Sin opción de descarga
 * - Optimizado para celular e iPad
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  BookOpen,
  X,
  Menu,
  ArrowLeft,
  Loader2,
  Lock,
} from "lucide-react";

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

export default function EbookViewer() {
  const [, params] = useRoute("/mis-libros/:ebookId");
  const [, setLocation] = useLocation();
  const { patient, isLoggedIn } = usePatientAuth();

  const ebookId = params?.ebookId ? parseInt(params.ebookId) : null;

  // Obtener mis ebooks del paciente
  const myEbooksQuery = trpc.ebook.getMyEbooks.useQuery(
    { email: patient?.email ?? "x@x.com" },
    { enabled: isLoggedIn && !!patient?.email }
  );

  const ebook = myEbooksQuery.data?.find((e: any) => e.ebookId === ebookId);

  // Estado del lector
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [showTOC, setShowTOC] = useState(false);
  const [pageInput, setPageInput] = useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Medir el ancho del contenedor para adaptar el PDF
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Guardar progreso de lectura en localStorage
  useEffect(() => {
    if (ebookId && pageNumber > 1) {
      localStorage.setItem(`ebook-progress-${ebookId}`, String(pageNumber));
    }
  }, [ebookId, pageNumber]);

  // Restaurar progreso al abrir
  useEffect(() => {
    if (ebookId) {
      const saved = localStorage.getItem(`ebook-progress-${ebookId}`);
      if (saved) setPageNumber(parseInt(saved));
    }
  }, [ebookId]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setIsLoading(false);
    setLoadError(true);
  }, []);

  const goToPrev = () => {
    setPageNumber((p) => Math.max(1, p - 1));
    setPageInput(String(Math.max(1, pageNumber - 1)));
  };

  const goToNext = () => {
    setPageNumber((p) => Math.min(numPages, p + 1));
    setPageInput(String(Math.min(numPages, pageNumber + 1)));
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    const n = parseInt(pageInput);
    if (!isNaN(n) && n >= 1 && n <= numPages) {
      setPageNumber(n);
    } else {
      setPageInput(String(pageNumber));
    }
  };

  const handlePageInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handlePageInputBlur();
  };

  // Swipe para cambiar página en móvil
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    touchStartX.current = null;
  };

  // Si no está autenticado
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 text-center">
        <Lock className="w-12 h-12 text-[#C5A55A] mb-4" />
        <h2 className="text-[#1A1A1A] font-bold text-xl mb-2">Acceso restringido</h2>
        <p className="text-gray-500 text-sm mb-6">Inicia sesión en tu Monedero Nutriser para leer tus libros.</p>
        <button
          onClick={() => setLocation("/monedero")}
          className="bg-[#C5A55A] text-white font-bold px-6 py-3 rounded-xl"
        >
          Ir al Monedero
        </button>
      </div>
    );
  }

  // Cargando
  if (myEbooksQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center">
        <img src={LOGO_URL} alt="Nutriser" className="w-16 h-16 object-contain mb-4" />
        <Loader2 className="w-8 h-8 text-[#C5A55A] animate-spin mb-2" />
        <p className="text-gray-400 text-sm">Cargando tu biblioteca...</p>
      </div>
    );
  }

  // Libro no encontrado o no aprobado
  if (!ebook || !ebook.pdfUrl) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 text-center">
        <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-[#1A1A1A] font-bold text-xl mb-2">Libro no disponible</h2>
        <p className="text-gray-500 text-sm mb-6">
          {ebook?.status === "pending"
            ? "Tu compra está pendiente de aprobación. Te notificaremos cuando esté lista."
            : "Este libro no está disponible en tu biblioteca."}
        </p>
        <button
          onClick={() => setLocation("/monedero")}
          className="bg-[#C5A55A] text-white font-bold px-6 py-3 rounded-xl"
        >
          Volver al Monedero
        </button>
      </div>
    );
  }

  const bgClass = darkMode ? "bg-[#1A1A1A]" : "bg-[#F5F0E8]";
  const textClass = darkMode ? "text-gray-200" : "text-[#1A1A1A]";
  const headerBg = darkMode ? "bg-[#111]" : "bg-white";
  const headerBorder = darkMode ? "border-gray-800" : "border-gray-200";

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} transition-colors duration-300`}>
      {/* ── Header del lector ── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 ${headerBg} border-b ${headerBorder} shadow-sm`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between px-3 py-2 gap-2">
          {/* Botón volver */}
          <button
            onClick={() => setLocation("/monedero")}
            className={`flex items-center gap-1 ${textClass} opacity-70 hover:opacity-100 transition-opacity`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-medium hidden sm:inline">Mis Libros</span>
          </button>

          {/* Título */}
          <div className="flex-1 text-center">
            <p className={`text-xs font-bold truncate ${textClass}`}>{ebook.ebookTitle ?? "Libro"}</p>
            <p className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Página {pageNumber} de {numPages || "..."}
            </p>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
              className={`p-1.5 rounded-lg ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} ${textClass}`}
              title="Reducir"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
              className={`p-1.5 rounded-lg ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} ${textClass}`}
              title="Ampliar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDarkMode((d) => !d)}
              className={`p-1.5 rounded-lg ${darkMode ? "hover:bg-gray-800 text-yellow-400" : "hover:bg-gray-100 text-gray-600"}`}
              title={darkMode ? "Modo día" : "Modo noche"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Barra de progreso de lectura */}
        <div className={`h-0.5 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          <div
            className="h-full bg-[#C5A55A] transition-all duration-300"
            style={{ width: numPages ? `${(pageNumber / numPages) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* ── Área del libro ── */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-start pt-16 pb-24 px-2 overflow-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Sombra tipo libro */}
        <div
          className="relative mt-4"
          style={{
            boxShadow: darkMode
              ? "0 8px 40px rgba(0,0,0,0.7), 4px 0 12px rgba(0,0,0,0.4)"
              : "0 8px 40px rgba(0,0,0,0.15), 4px 0 12px rgba(0,0,0,0.08)",
            borderRadius: "4px 12px 12px 4px",
            overflow: "hidden",
          }}
        >
          {/* Lomo del libro */}
          <div
            className="absolute left-0 top-0 bottom-0 w-3 z-10"
            style={{
              background: darkMode
                ? "linear-gradient(to right, #000, #222)"
                : "linear-gradient(to right, #8B7355, #C5A55A)",
              borderRadius: "4px 0 0 4px",
            }}
          />

          <div className="pl-3">
            {isLoading && (
              <div
                className={`flex flex-col items-center justify-center ${darkMode ? "bg-[#222]" : "bg-white"}`}
                style={{ width: containerWidth > 0 ? containerWidth - 24 : 320, minHeight: 400 }}
              >
                <img src={LOGO_URL} alt="Nutriser" className="w-12 h-12 object-contain mb-3 opacity-50" />
                <Loader2 className="w-6 h-6 text-[#C5A55A] animate-spin mb-2" />
                <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Cargando libro...</p>
              </div>
            )}

            {loadError && (
              <div
                className={`flex flex-col items-center justify-center p-8 ${darkMode ? "bg-[#222]" : "bg-white"}`}
                style={{ width: containerWidth > 0 ? containerWidth - 24 : 320, minHeight: 400 }}
              >
                <BookOpen className="w-10 h-10 text-gray-300 mb-3" />
                <p className={`text-sm font-medium ${textClass}`}>Error al cargar el libro</p>
                <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Verifica tu conexión e intenta de nuevo.
                </p>
              </div>
            )}

            <Document
              file={`/api/ebook-proxy?token=${ebook.accessToken}`}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              className={darkMode ? "invert brightness-90" : ""}
            >
              <Page
                pageNumber={pageNumber}
                width={containerWidth > 0 ? Math.min(containerWidth - 24, 700) * scale : 320 * scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                loading={null}
              />
            </Document>
          </div>
        </div>

        {/* Número de página en el libro */}
        {numPages > 0 && (
          <p className={`mt-3 text-xs ${darkMode ? "text-gray-600" : "text-gray-400"} font-serif italic`}>
            — {pageNumber} —
          </p>
        )}
      </div>

      {/* ── Barra de navegación inferior ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 ${headerBg} border-t ${headerBorder} shadow-[0_-4px_20px_rgba(0,0,0,0.08)]`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-2 gap-3">
          {/* Página anterior */}
          <button
            onClick={goToPrev}
            disabled={pageNumber <= 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              pageNumber <= 1
                ? "opacity-30 cursor-not-allowed"
                : darkMode
                ? "bg-gray-800 text-gray-200 active:bg-gray-700"
                : "bg-gray-100 text-[#1A1A1A] active:bg-gray-200"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Input de página */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={numPages}
              value={pageInput}
              onChange={handlePageInput}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKey}
              className={`w-14 text-center text-sm font-bold border rounded-lg py-1.5 px-1 outline-none focus:ring-2 focus:ring-[#C5A55A] ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-200 text-[#1A1A1A]"
              }`}
            />
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              / {numPages || "..."}
            </span>
          </div>

          {/* Página siguiente */}
          <button
            onClick={goToNext}
            disabled={pageNumber >= numPages}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              pageNumber >= numPages
                ? "opacity-30 cursor-not-allowed"
                : "bg-[#C5A55A] text-white active:bg-[#b8944e]"
            }`}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

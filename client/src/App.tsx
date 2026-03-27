import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Memberships from "./pages/Memberships";
import AdminMemberships from "./pages/AdminMemberships";
import Appointments from "./pages/Appointments";
import AppointmentForm from "./pages/AppointmentForm";
import AdminLogin from "./pages/AdminLogin";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import EbookStore from "./pages/EbookStore";
import EbookReader from "./pages/EbookReader";
import EbookLogin from "./pages/EbookLogin";
import Store from "@/pages/Store";
import CouponPage from "@/pages/CouponPage";
import Courses from "@/pages/Courses";
import BackgroundMusic from "@/components/BackgroundMusic";
import SplashSelector from "@/components/SplashSelector";
import { SplashContext } from "@/contexts/SplashContext";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// Rutas que NUNCA muestran el splash (admin, rutas técnicas)
const ADMIN_ROUTES = ["/admin", "/ebook/read", "/ebook/login", "/cupon"];

function isAdminRoute(path: string) {
  return ADMIN_ROUTES.some((r) => path.startsWith(r));
}

const NUTRISER_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

// Pantalla de carga instantánea mientras la app inicializa
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[999999] bg-[#0f0f0f] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Logo real de Nutriser con spinner alrededor */}
        <div className="relative flex items-center justify-center">
          {/* Spinner giratorio */}
          <div className="absolute w-28 h-28 rounded-full border-t-2 border-[#C5A55A] animate-spin" />
          <div className="absolute w-28 h-28 rounded-full border border-[#C5A55A]/20" />
          {/* Logo centrado */}
          <img
            src={NUTRISER_LOGO}
            alt="Nutriser"
            className="w-20 h-20 object-contain"
          />
        </div>
        {/* Texto */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-[#C5A55A] text-xs tracking-[0.4em] uppercase font-light animate-pulse">
            Cargando
          </p>
          <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase">
            Aesthetic & Nutrition
          </p>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/memberships"} component={Memberships} />
      <Route path={"/appointments"} component={Appointments} />
      <Route path={"/appointment-form"} component={AppointmentForm} />
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path={"/admin/reset-password"} component={AdminResetPassword} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/memberships"} component={AdminMemberships} />
      <Route path={"/ebook"} component={EbookStore} />
      <Route path={"/ebook/login"} component={EbookLogin} />
      <Route path={"/ebook/read"} component={EbookReader} />
      <Route path={"/tienda"} component={Store} />
      <Route path={"/cupon/:id"} component={CouponPage} />
      <Route path={"/cursos"} component={Courses} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location, navigate] = useLocation();

  // Estado del splash
  const [showSplash, setShowSplash] = useState(() => {
    if (isAdminRoute(location)) return false;
    const seen = sessionStorage.getItem("nutriser_splash_seen");
    return !seen;
  });

  // Estado de navegación pendiente: mientras es true, el Router NO renderiza
  // Esto evita completamente el flash del Home
  const [navigating, setNavigating] = useState(false);

  // La pantalla de carga inicial está en index.html (CSS puro) y se oculta
  // automáticamente cuando React monta el primer componente.
  // appReady siempre es true aquí porque index.html ya cubrió el flash blanco.
  const appReady = true;

  // Entrar al sitio principal (Nutriser Home)
  const handleEnterSite = () => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    setNavigating(true);
    navigate("/");
    // Pequeño delay para que el router cambie antes de mostrar el contenido
    setTimeout(() => {
      setShowSplash(false);
      setNavigating(false);
    }, 50);
  };

  // Volver al splash desde cualquier página
  const handleShowSplash = () => {
    sessionStorage.removeItem("nutriser_splash_seen");
    setShowSplash(true);
  };

  // Navegar desde el splash a una ruta interna SIN flash del Home:
  // 1. Activar estado "navigating" → el Router deja de renderizar (pantalla negra)
  // 2. Navegar a la ruta destino
  // 3. Esperar 2 frames para que el componente destino esté listo
  // 4. Ocultar splash y desactivar navigating → el usuario ve directamente la página destino
  const handleNavigateFromSplash = (path: string) => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    setNavigating(true);
    navigate(path);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShowSplash(false);
        setNavigating(false);
      });
    });
  };

  // Mostrar pantalla de carga mientras la app inicializa
  if (!appReady) {
    return <LoadingScreen />;
  }

  return (
    <SplashContext.Provider value={{ showSplash: handleShowSplash }}>
      <BackgroundMusic />
      {/* El Router solo renderiza cuando no estamos en medio de una navegación desde el splash */}
      {!navigating && <Router />}
      {/* El splash se superpone sobre cualquier ruta como overlay fixed */}
      {showSplash && !isAdminRoute(location) && (
        <SplashSelector
          onEnterSite={handleEnterSite}
          onNavigate={handleNavigateFromSplash}
        />
      )}
      {/* Pantalla de transición durante navegación desde splash */}
      {navigating && (
        <div className="fixed inset-0 z-[99998] bg-[#0f0f0f]" />
      )}
    </SplashContext.Provider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

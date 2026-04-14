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
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import DeleteAccount from "./pages/DeleteAccount";
import MyTreatments from "./pages/MyTreatments";
import NutriserHomePage from "./pages/NutriserHomePage";
import BackgroundMusic from "@/components/BackgroundMusic";
import SplashSelector from "@/components/SplashSelector";
import Splash0Entry from "@/components/Splash0Entry";
import { SplashContext } from "@/contexts/SplashContext";
import { SplashThemeProvider } from "@/contexts/SplashThemeContext";
import { useState } from "react";
import { useLocation } from "wouter";

// ── Detección de dispositivo ────────────────────────────────────────────────
// Retorna true si el usuario está en una computadora/laptop/Mac (NO móvil ni tablet)
function isDesktopDevice(): boolean {
  const ua = navigator.userAgent;
  // Detectar móviles y tablets por User-Agent
  const isMobileOrTablet = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|touch/i.test(ua);
  // También verificar por tamaño de pantalla como respaldo
  // Pantallas >= 1024px de ancho sin touch se consideran desktop
  const isLargeScreen = window.innerWidth >= 1024;
  const hasTouchScreen = navigator.maxTouchPoints > 0;
  // Es desktop si: NO es móvil/tablet por UA, Y (pantalla grande O sin touch)
  if (isMobileOrTablet) return false;
  // iPad en modo desktop puede tener UA de desktop, verificar touch
  if (hasTouchScreen && !isLargeScreen) return false;
  return true;
}

// Rutas que NUNCA muestran el splash
const NO_SPLASH_ROUTES = ["/admin", "/ebook/read", "/ebook/login", "/cupon", "/memberships", "/tienda", "/ebook", "/cursos", "/appointments", "/appointment-form", "/coupons", "/services", "/privacy-policy", "/delete-account", "/mis-tratamientos", "/nutriser-home"];

function isNoSplashRoute(path: string) {
  return NO_SPLASH_ROUTES.some((r) => path === r || path.startsWith(r + "/") || path.startsWith(r + "?"));
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
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/delete-account"} component={DeleteAccount} />
      <Route path={"/mis-tratamientos"} component={MyTreatments} />
      <Route path={"/nutriser-home"} component={NutriserHomePage} />
      <Route path={"/coupons"} component={() => { sessionStorage.setItem("nutriser_scroll_to", "promociones"); window.location.replace("/"); return null; }} />
      <Route path={"/services"} component={() => { sessionStorage.setItem("nutriser_scroll_to", "servicios"); window.location.replace("/"); return null; }} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Estado del splash:
// "splash0" → mostrar Splash 0 (pantalla de entrada: Nutriser Home + Portal Salud + Nutriser Web)
// "splash1" → mostrar Splash 1 (hub: Shop + Academy + Mis Tratamientos + login)
// "site"    → mostrar el sitio principal (Home)
type SplashState = "splash0" | "splash1" | "site";

// Versión del splash — incrementar cuando cambie el diseño para forzar que todos vean el nuevo splash
const SPLASH_VERSION = "v3";

function AppContent() {
  const [location] = useLocation();

  const [splashState, setSplashState] = useState<SplashState>(() => {
    // Nunca mostrar splash en rutas de admin/internas
    if (isNoSplashRoute(location)) return "site";
    // Solo mostrar en "/"
    if (location !== "/") return "site";

    // ── DETECCIÓN DE DISPOSITIVO ──────────────────────────────────────────
    // Si es computadora/laptop/Mac → ir directo al sitio web (más formal)
    if (isDesktopDevice()) {
      return "site";
    }

    // Si la versión del splash cambió, limpiar el estado guardado
    const savedVersion = sessionStorage.getItem("nutriser_splash_version");
    if (savedVersion !== SPLASH_VERSION) {
      sessionStorage.removeItem("nutriser_splash_seen");
      sessionStorage.removeItem("nutriser_chose_splash1");
      sessionStorage.setItem("nutriser_splash_version", SPLASH_VERSION);
    }

    // Si hay bandera de ir directo al sitio (ej: desde botón Cuponera), saltarse el splash
    const goToSite = sessionStorage.getItem("nutriser_go_to_site");
    if (goToSite) {
      sessionStorage.removeItem("nutriser_go_to_site");
      return "site";
    }

    // Si hay bandera de ir directo al Splash 1 (ej: desde botón Regresar en Nutriser Shop/Academy/Tratamientos)
    const goToSplash1 = sessionStorage.getItem("nutriser_go_to_splash1");
    if (goToSplash1) {
      sessionStorage.removeItem("nutriser_go_to_splash1");
      return "splash1";
    }

    // Móvil/tablet → Splash 0
    return "splash0";
  });

  // Desde Splash 0: el usuario eligió "Nutriser Web" → mostrar Splash 1
  const handleEnterSplash1 = () => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    sessionStorage.setItem("nutriser_chose_splash1", "1");
    setSplashState("splash1");
  };

  // Desde Splash 1: el usuario entra al sitio principal
  const handleEnterSite = () => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    sessionStorage.removeItem("nutriser_chose_splash1");
    setSplashState("site");
  };

  // Navegar a una ruta interna desde el Splash 1
  const handleNavigateFromSplash = (path: string) => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    sessionStorage.removeItem("nutriser_chose_splash1");
    window.location.href = path;
  };

  // Volver al Splash 0 (usado por botones "Regresar" en páginas internas cuando vienen de Splash 0)
  const handleShowSplash = () => {
    sessionStorage.removeItem("nutriser_splash_seen");
    sessionStorage.removeItem("nutriser_chose_splash1");
    if (location === "/") {
      setSplashState("splash0");
    } else {
      window.location.href = "/";
    }
  };

  // Volver al Splash 1 (hub de Nutriser) — usado por Nutriser Shop, Academy y Mis Tratamientos
  const handleShowSplash1 = () => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    sessionStorage.setItem("nutriser_chose_splash1", "1");
    sessionStorage.setItem("nutriser_go_to_splash1", "1");
    if (location === "/") {
      setSplashState("splash1");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <SplashThemeProvider>
    <SplashContext.Provider value={{ showSplash: handleShowSplash, showSplash1: handleShowSplash1 }}>
      <BackgroundMusic />

      {/* Splash 0: pantalla de entrada — Nutriser Home + Portal Salud + Nutriser Web */}
      {splashState === "splash0" && (
        <Splash0Entry
          onEnterNutriserWeb={handleEnterSplash1}
          onGoToWebsite={() => { window.location.href = 'https://www.nutriserpv.com'; }}
          onNavigate={handleNavigateFromSplash}
        />
      )}

      {/* Splash 1: hub de servicios — Shop + Academy + Mis Tratamientos + login */}
      {splashState === "splash1" && (
        <SplashSelector
          onEnterSite={handleEnterSite}
          onNavigate={handleNavigateFromSplash}
          onBack={() => setSplashState("splash0")}
        />
      )}

      {/* Sitio principal */}
      {splashState === "site" && <Router />}
    </SplashContext.Provider>
    </SplashThemeProvider>
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

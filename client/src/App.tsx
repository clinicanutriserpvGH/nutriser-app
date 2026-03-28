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
import { useState } from "react";
import { useLocation } from "wouter";

// Rutas que NUNCA muestran el splash
const NO_SPLASH_ROUTES = ["/admin", "/ebook/read", "/ebook/login", "/cupon", "/memberships", "/tienda", "/ebook", "/cursos", "/appointments", "/appointment-form", "/coupons", "/services"];

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
      <Route path={"/coupons"} component={() => { sessionStorage.setItem("nutriser_scroll_to", "promociones"); window.location.replace("/"); return null; }} />
      <Route path={"/services"} component={() => { sessionStorage.setItem("nutriser_scroll_to", "servicios"); window.location.replace("/"); return null; }} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();

  // El splash se muestra SOLO en la ruta "/" cuando el usuario no lo ha visto aún
  const [showSplash, setShowSplash] = useState(() => {
    // Nunca mostrar splash en rutas de admin/internas
    if (isNoSplashRoute(location)) return false;
    // Solo mostrar en "/"
    if (location !== "/") return false;
    const seen = sessionStorage.getItem("nutriser_splash_seen");
    return !seen;
  });

  // Entrar al sitio principal (Nutriser Home) — solo oculta el splash
  const handleEnterSite = () => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    setShowSplash(false);
  };

  // Navegar a una ruta interna desde el splash.
  // Usamos window.location.href para una navegación real: la URL cambia,
  // React monta directamente la página destino sin pasar por Home.
  const handleNavigateFromSplash = (path: string) => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    window.location.href = path;
  };

  // Volver al splash: navegar a "/" y mostrar el splash
  const handleShowSplash = () => {
    sessionStorage.removeItem("nutriser_splash_seen");
    // Si ya estamos en "/", solo mostrar el splash
    if (location === "/") {
      setShowSplash(true);
    } else {
      // Navegar a "/" — el splash se mostrará porque borramos la clave
      window.location.href = "/";
    }
  };

  return (
    <SplashContext.Provider value={{ showSplash: handleShowSplash }}>
      <BackgroundMusic />
      {/* El splash se superpone como overlay fixed cuando está activo */}
      {showSplash && (
        <SplashSelector
          onEnterSite={handleEnterSite}
          onNavigate={handleNavigateFromSplash}
        />
      )}
      {/* El Router solo renderiza cuando el splash NO está activo */}
      {!showSplash && <Router />}
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

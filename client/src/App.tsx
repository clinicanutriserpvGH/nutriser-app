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

// Rutas que NUNCA muestran el splash (admin, rutas técnicas)
const ADMIN_ROUTES = ["/admin", "/ebook/read", "/ebook/login", "/cupon"];

function isAdminRoute(path: string) {
  return ADMIN_ROUTES.some((r) => path.startsWith(r));
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
  const [location] = useLocation();

  // El splash se muestra en CUALQUIER ruta al inicio de sesión,
  // excepto rutas de admin/técnicas. sessionStorage se borra al cerrar el navegador.
  const [showSplash, setShowSplash] = useState(() => {
    if (isAdminRoute(location)) return false;
    const seen = sessionStorage.getItem("nutriser_splash_seen");
    return !seen;
  });

  // Al elegir desde el splash: marca como visto y oculta el splash.
  // La navegación real la hace el SplashSelector con window.location.replace
  const handleEnterSite = () => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    setShowSplash(false);
  };

  // Volver al splash desde cualquier página
  const handleShowSplash = () => {
    sessionStorage.removeItem("nutriser_splash_seen");
    // Navegar a "/" y mostrar el splash
    window.history.pushState({}, "", "/");
    setShowSplash(true);
  };

  return (
    <SplashContext.Provider value={{ showSplash: handleShowSplash }}>
      <BackgroundMusic />
      <Router />
      {/* El splash se superpone sobre cualquier ruta como overlay fixed */}
      {showSplash && !isAdminRoute(location) && (
        <SplashSelector onEnterSite={handleEnterSite} />
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

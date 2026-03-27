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

function Router() {
  // make sure to consider if you need authentication for certain routes
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
  // Only show splash on the root path, not on admin or other routes
  const isRootPath = location === "/";

  // Siempre mostrar splash al abrir la app (sessionStorage: se limpia al cerrar el navegador/pestaña)
  const [showSplash, setShowSplash] = useState(() => {
    if (!isRootPath) return false;
    // Si ya eligió en esta sesión, no mostrar de nuevo
    const seen = sessionStorage.getItem("nutriser_splash_seen");
    return !seen;
  });

  // Si navega a otra ruta, ocultar splash
  useEffect(() => {
    if (!isRootPath) {
      setShowSplash(false);
    }
  }, [isRootPath]);

  const handleEnterSite = () => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    setShowSplash(false);
  };

  // Permite volver al selector desde la página principal
  const handleShowSplash = () => {
    sessionStorage.removeItem("nutriser_splash_seen");
    setShowSplash(true);
  };

  return (
    <SplashContext.Provider value={{ showSplash: handleShowSplash }}>
      <BackgroundMusic />
      <Router />
      {showSplash && <SplashSelector onEnterSite={handleEnterSite} />}
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

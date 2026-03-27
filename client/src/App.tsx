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
import { useState, useCallback, useRef, createContext, useContext } from "react";
import { useLocation } from "wouter";

// Rutas que NUNCA muestran el splash (admin, rutas técnicas)
const ADMIN_ROUTES = ["/admin", "/ebook/read", "/ebook/login", "/cupon"];

function isAdminRoute(path: string) {
  return ADMIN_ROUTES.some((r) => path.startsWith(r));
}

// ─── Contexto para que las páginas destino notifiquen que están listas ─────────
// Cuando el usuario navega desde el splash, el splash se mantiene visible
// hasta que la página destino llama a onPageReady()
interface NavigationContextValue {
  /** La página destino llama esto cuando su contenido principal está montado */
  onPageReady: () => void;
  /** true si estamos esperando que la página destino confirme que está lista */
  waitingForPage: boolean;
}

export const NavigationContext = createContext<NavigationContextValue>({
  onPageReady: () => {},
  waitingForPage: false,
});

export function usePageReady() {
  return useContext(NavigationContext);
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

  // Cuando waitingForPage=true, el splash se mantiene encima aunque el router
  // ya haya cambiado de ruta. El splash desaparece solo cuando la página
  // destino llama onPageReady().
  const [waitingForPage, setWaitingForPage] = useState(false);
  // Ref para que handlePageReady siempre lea el valor actual (evita closure stale)
  const waitingForPageRef = useRef(false);

  // Entrar al sitio principal (Nutriser Home)
  const handleEnterSite = useCallback(() => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    navigate("/");
    setShowSplash(false);
  }, [navigate]);

  // Volver al splash desde cualquier página
  const handleShowSplash = useCallback(() => {
    sessionStorage.removeItem("nutriser_splash_seen");
    setShowSplash(true);
    setWaitingForPage(false);
  }, []);

  // Navegar desde el splash a una ruta interna SIN flash del Home:
  // 1. Marcar waitingForPage=true → el splash se mantiene visible como overlay
  // 2. Navegar a la ruta destino (el router cambia pero el splash lo cubre)
  // 3. La página destino llama onPageReady() cuando su contenido está listo
  // 4. onPageReady oculta el splash → el usuario ve directamente la página destino
  const handleNavigateFromSplash = useCallback((path: string) => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    waitingForPageRef.current = true;
    setWaitingForPage(true);
    navigate(path);
    // Safety timeout: si la página destino no llama onPageReady en 2s,
    // ocultamos el splash de todas formas para no dejar al usuario bloqueado
    setTimeout(() => {
      waitingForPageRef.current = false;
      setWaitingForPage(false);
      setShowSplash(false);
    }, 2000);
  }, [navigate]);

  // La página destino llama esto cuando su contenido principal está montado.
  // Usa el ref para evitar el problema de closure stale con useEffect(fn, []).
  const handlePageReady = useCallback(() => {
    if (waitingForPageRef.current) {
      waitingForPageRef.current = false;
      setWaitingForPage(false);
      setShowSplash(false);
    }
  }, []);

  const navContextValue: NavigationContextValue = {
    onPageReady: handlePageReady,
    waitingForPage,
  };

  return (
    <NavigationContext.Provider value={navContextValue}>
      <SplashContext.Provider value={{ showSplash: handleShowSplash }}>
        <BackgroundMusic />
        {/* El Router siempre renderiza — el splash lo cubre como overlay */}
        <Router />
        {/* El splash se superpone sobre cualquier ruta como overlay fixed */}
        {(showSplash || waitingForPage) && !isAdminRoute(location) && (
          <SplashSelector
            onEnterSite={handleEnterSite}
            onNavigate={handleNavigateFromSplash}
            isTransitioning={waitingForPage && !showSplash}
          />
        )}
      </SplashContext.Provider>
    </NavigationContext.Provider>
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

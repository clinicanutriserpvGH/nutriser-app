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
import AdminAuthorize from "./pages/AdminAuthorize";
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
import WalletPage from "./pages/WalletPage";
import WalletQR from "./pages/WalletQR";
import ServicePage from "./pages/ServicePage";
import Cupones from "./pages/Cupones";
import Servicios from "./pages/Servicios";
import Transformaciones from "./pages/Transformaciones";
import BackgroundMusic from "@/components/BackgroundMusic";
import SplashSelector from "@/components/SplashSelector";
import Splash0Entry from "@/components/Splash0Entry";
import ShopPromoSplash from "@/components/ShopPromoSplash";
import { SplashContext } from "@/contexts/SplashContext";
import { SplashThemeProvider } from "@/contexts/SplashThemeContext";
import { useState } from "react";
import { useLocation } from "wouter";
import { isDesktopDevice } from "@/hooks/useDeviceType";
import { usePatientAuth } from "@/hooks/usePatientAuth";

// Rutas que NUNCA muestran el splash
const NO_SPLASH_ROUTES = ["/admin", "/ebook/read", "/ebook/login", "/cupon", "/memberships", "/tienda", "/ebook", "/cursos", "/appointments", "/appointment-form", "/coupons", "/cupones", "/servicios", "/transformaciones", "/services", "/privacy-policy", "/delete-account", "/mis-tratamientos", "/nutriser-home", "/monedero", "/servicio", "/c"];

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
      <Route path={"/admin/authorize"} component={AdminAuthorize} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/memberships"} component={AdminMemberships} />
      <Route path={"/ebook"} component={() => { window.location.replace("/memberships?tab=library"); return null; }} />
      <Route path={"/ebook/login"} component={EbookLogin} />
      <Route path={"/ebook/read"} component={EbookReader} />
      <Route path={"/tienda"} component={Store} />
      <Route path={"/cupon/:id"} component={CouponPage} />
      <Route path={"/cursos"} component={Courses} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/delete-account"} component={DeleteAccount} />
      <Route path={"/mis-tratamientos"} component={MyTreatments} />
      <Route path={"/nutriser-home"} component={NutriserHomePage} />
      <Route path={"/monedero/:walletNumber?"} component={WalletPage} />
      <Route path={"/c/:walletNumber"} component={WalletQR} />
      <Route path={"/servicio/:serviceId"} component={(props: any) => <ServicePage serviceId={props.params.serviceId} />} />
      <Route path={"/cupones"} component={Cupones} />
      <Route path={"/servicios"} component={Servicios} />
      <Route path={"/transformaciones"} component={Transformaciones} />
      <Route path={"/coupons"} component={() => { window.location.replace("/cupones"); return null; }} />
      <Route path={"/services"} component={() => { window.location.replace("/servicios"); return null; }} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Estado del splash:
// "splash0" → mostrar Splash 0 (pantalla de entrada: Shop + Academy + Portal de Salud)
// "site"    → mostrar el sitio principal (Home) — solo en PC/escritorio
type SplashState = "splash0" | "site";

// Versión del splash — incrementar cuando cambie el diseño para forzar que todos vean el nuevo splash
const SPLASH_VERSION = "v3";

function AppContent() {
  const [location] = useLocation();
  // Auth del paciente para pasar isAuthenticated a los splashes
  const { isLoggedIn: patientIsLoggedIn } = usePatientAuth();

  // ShopPromoSplash: mostrar una vez por sesión antes del Splash 0 (solo móvil)
  const [showShopPromo, setShowShopPromo] = useState<boolean>(() => {
    if (isNoSplashRoute(location)) return false;
    if (location !== "/") return false;
    if (isDesktopDevice()) return false;
    return !sessionStorage.getItem("nutriser_shop_promo_seen");
  });

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

    // Si el usuario ya eligió ir al sitio web en esta sesión, no volver al splash
    const splashSeen = sessionStorage.getItem("nutriser_splash_seen");
    if (splashSeen) {
      return "site";
    }

    // Móvil/tablet → Splash 0
    return "splash0";
  });

  // Navegar a una ruta interna desde el Splash 0
  const handleNavigateFromSplash = (path: string) => {
    sessionStorage.setItem("nutriser_splash_seen", "1");
    window.location.href = path;
  };

  // Volver al Splash 0 (usado por botones "Regresar" en páginas internas)
  const handleShowSplash = () => {
    sessionStorage.removeItem("nutriser_splash_seen");
    if (location === "/") {
      setSplashState("splash0");
    } else {
      window.location.href = "/";
    }
  };

  // Compatibilidad: volver al Splash 0 (ya no hay Splash 1)
  const handleShowSplash1 = () => {
    sessionStorage.removeItem("nutriser_splash_seen");
    if (location === "/") {
      setSplashState("splash0");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <SplashThemeProvider>
    <SplashContext.Provider value={{ showSplash: handleShowSplash, showSplash1: handleShowSplash1 }}>
      {/* Música de fondo solo en la página principal del sitio web */}
      {splashState === "site" && location === "/" && <BackgroundMusic />}

      {/* ShopPromoSplash: reemplaza completamente el Splash 0 hasta que el usuario lo cierre */}
      {showShopPromo ? (
        <ShopPromoSplash
          isAuthenticated={patientIsLoggedIn}
          onClose={() => {
            sessionStorage.setItem("nutriser_shop_promo_seen", "1");
            setShowShopPromo(false);
          }}
          onGoToShop={() => {
            sessionStorage.setItem("nutriser_shop_promo_seen", "1");
            setShowShopPromo(false);
            window.open("https://nutriserpv.com/memberships", "_blank");
          }}
        />
      ) : (
        <>
          {/* Splash 0: pantalla de entrada — Shop + Academy + Portal de Salud */}
          {splashState === "splash0" && (
            <Splash0Entry
              onEnterNutriserWeb={() => { sessionStorage.setItem('nutriser_splash_seen', '1'); setSplashState('site'); }}
              onGoToWebsite={() => { sessionStorage.setItem('nutriser_splash_seen', '1'); setSplashState('site'); }}
              onNavigate={handleNavigateFromSplash}
            />
          )}
        </>
      )}

      {/* Sitio principal: solo si el ShopPromoSplash ya fue cerrado */}
      {!showShopPromo && (
        <>
          {/* Sitio principal */}
          {splashState === "site" && <Router />}
        </>
      )}
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

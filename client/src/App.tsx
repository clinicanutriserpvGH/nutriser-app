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
import AdminDashboard from "./pages/AdminDashboard";
import EbookStore from "./pages/EbookStore";
import EbookReader from "./pages/EbookReader";
import EbookLogin from "./pages/EbookLogin";
import Store from "@/pages/Store";
import CouponPage from "@/pages/CouponPage";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
       <Route path={"/"} component={Home} />
      <Route path={"/memberships"} component={Memberships} />
      <Route path={"/appointments"} component={Appointments} />
      <Route path={"/appointment-form"} component={AppointmentForm} />
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/memberships"} component={AdminMemberships} />
      <Route path={"/ebook"} component={EbookStore} />
      <Route path={"/ebook/login"} component={EbookLogin} />
      <Route path={"/ebook/read"} component={EbookReader} />
      <Route path={"/tienda"} component={Store} />
      <Route path={"/cupon/:id"} component={CouponPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

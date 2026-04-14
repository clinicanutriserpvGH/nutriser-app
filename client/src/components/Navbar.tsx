/*
 * Nutriser - Navbar Component
 * Design: Neo-Art Deco with warm organic feel
 * Gold accent on scroll, transparent initially
 *
 * LÓGICA DE DISPOSITIVOS:
 * ─ Móvil/Tableta (PWA): Botones Inicio (→ Splash 0) y Regresar (→ Splash 1)
 * ─ Desktop (computadora): Botón "Nutriser Shop" que lleva a /memberships
 *   Los splashes son exclusivos de la app móvil, desktop NO debe ir a splashes.
 */
import { useState, useEffect } from "react";
import { Menu, X, Phone, Instagram, Facebook, Ruler, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useSplash } from "@/contexts/SplashContext";
import { useDeviceType } from "@/hooks/useDeviceType";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

const navLinks = [
  { label: "Servicios", href: "#servicios" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
  { label: "Administración", href: "/admin/login" },
];

interface NavbarProps {
  lightBg?: boolean;
  onShowSplash?: () => void;
}

export default function Navbar({ lightBg = false, onShowSplash }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();
  const { showSplash, showSplash1 } = useSplash();
  const { isDesktop } = useDeviceType();

  // Móvil: Regresar → Splash 1 (hub de Nutriser)
  const handleRegresar = showSplash1;
  // Móvil: Inicio → Splash 0 (pantalla de entrada)
  const handleInicio = onShowSplash ?? showSplash;
  // Desktop: Ir a Nutriser Shop
  const handleGoToShop = () => navigate("/memberships");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("http")) {
      window.open(href, "_blank");
      return;
    }
    if (href.startsWith("/")) {
      navigate(href);
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        data-navbar
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || lightBg
            ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(197,165,90,0.08)]"
            : "bg-transparent"
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="container flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#inicio");
            }}
            className="flex items-center gap-2"
          >
            <img
              src={LOGO_URL}
              alt="Nutriser - Aesthetic & Nutrition"
              className="h-12 w-auto object-contain transition-all duration-500"
            />
          </a>

          {/* ═══ DESKTOP: Botón Nutriser Shop (sin botones de splash) ═══ */}
          {isDesktop && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={handleGoToShop}
                title="Ir a Nutriser Shop"
                className={`flex items-center gap-2 text-xs tracking-[0.12em] uppercase font-bold px-4 py-2 rounded-full border transition-all duration-300 ${
                  scrolled || lightBg
                    ? "border-[#C5A55A] text-[#C5A55A] hover:bg-[#C5A55A] hover:text-white"
                    : "border-white/40 text-white hover:bg-white/10"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Nutriser Shop
              </button>
            </div>
          )}

          {/* ═══ MÓVIL/TABLETA: Botones Inicio + Regresar (a splashes) ═══ */}
          {!isDesktop && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={handleInicio}
                title="Ir a la pantalla de inicio"
                className={`flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase font-bold px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  scrolled || lightBg
                    ? "border-[#C5A55A]/30 text-[#C5A55A]/70 hover:bg-[#C5A55A]/10"
                    : "border-white/20 text-white/60 hover:bg-white/10"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Inicio
              </button>
              <button
                onClick={handleRegresar}
                title="Regresar al menú de Nutriser"
                className={`flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase font-bold px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  scrolled || lightBg
                    ? "border-[#C5A55A]/30 text-[#C5A55A]/70 hover:bg-[#C5A55A]/10"
                    : "border-white/20 text-white/60 hover:bg-white/10"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Regresar
              </button>
            </div>
          )}

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={(link as any).external ? "_blank" : undefined}
                rel={(link as any).external ? "noopener noreferrer" : undefined}
                onClick={(e) => {
                  if (!(link as any).external) {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }}
                className={`text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:text-[#C5A55A] relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-[#C5A55A] after:transition-all after:duration-300 hover:after:w-full ${
                  scrolled || lightBg ? "text-[#1A1A1A]/70" : "text-white/80"
                } ${(link as any).external ? "flex items-center gap-1" : ""}`}
              >
                {(link as any).external && <Ruler className="w-3.5 h-3.5" />}
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-4">
              {/* Social Links */}
              <a
                href="https://instagram.com/nutriserpv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1A1A1A]/50 hover:text-[#C5A55A] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/nutriserpv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1A1A1A]/50 hover:text-[#C5A55A] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              {/* Call Button */}
              <a
                href="tel:3224503257"
                className="flex items-center gap-2 bg-[#C5A55A] text-white px-5 py-2.5 text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:bg-[#B8963E] hover:shadow-lg hover:shadow-[#C5A55A]/20"
              >
                <Phone className="w-3.5 h-3.5" />
                Llamada: 322 450 3257
              </a>
            </div>
          </div>

          {/* ═══ Mobile: Botones según dispositivo + Toggle ═══ */}
          <div className="lg:hidden flex items-center gap-1.5">
            {/* MÓVIL/TABLETA: Inicio + Regresar a splashes */}
            {!isDesktop && (
              <>
                <button
                  onClick={handleInicio}
                  aria-label="Ir a la pantalla de inicio"
                  className="flex items-center gap-1 text-[10px] tracking-widest uppercase font-extrabold px-2.5 py-2 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-sm active:scale-95 transition-all duration-200"
                  style={scrolled ? { background: 'rgba(197,165,90,0.15)', color: '#C5A55A', borderColor: 'rgba(197,165,90,0.4)' } : {}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Inicio
                </button>
                <button
                  onClick={handleRegresar}
                  aria-label="Regresar al menú de Nutriser"
                  className="flex items-center gap-1 text-[10px] tracking-widest uppercase font-extrabold px-2.5 py-2 rounded-full bg-[#C5A55A] text-black border-2 border-[#C5A55A] shadow-lg shadow-[#C5A55A]/30 active:scale-95 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                  Regresar
                </button>
              </>
            )}

            {/* DESKTOP: Botón Nutriser Shop (en caso de que la ventana sea pequeña) */}
            {isDesktop && (
              <button
                onClick={handleGoToShop}
                aria-label="Ir a Nutriser Shop"
                className="flex items-center gap-1 text-[10px] tracking-widest uppercase font-extrabold px-2.5 py-2 rounded-full bg-[#C5A55A] text-black border-2 border-[#C5A55A] shadow-lg shadow-[#C5A55A]/30 active:scale-95 transition-all duration-200"
              >
                <ShoppingBag className="w-3 h-3" />
                Shop
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`transition-colors duration-300 ${
                scrolled || lightBg ? "text-[#1A1A1A]" : "text-white"
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white/98 backdrop-blur-lg px-8 overflow-y-auto"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 6rem)' }}
          >
            <div className="flex flex-col gap-6">
              {/* Desktop: Agregar enlace a Nutriser Shop en el menú móvil */}
              {isDesktop && (
                <motion.a
                  href="/memberships"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    navigate("/memberships");
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0 }}
                  className="font-serif text-3xl text-[#C5A55A] hover:text-[#B8963E] transition-colors flex items-center gap-3"
                >
                  <ShoppingBag className="w-6 h-6" />
                  Nutriser Shop
                </motion.a>
              )}

              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  target={(link as any).external ? "_blank" : undefined}
                  rel={(link as any).external ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (!(link as any).external) {
                      e.preventDefault();
                      handleNavClick(link.href);
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (isDesktop ? i + 1 : i) * 0.1 }}
                  className="font-serif text-3xl text-[#1A1A1A]/80 hover:text-[#C5A55A] transition-colors flex items-center gap-3"
                >
                  {(link as any).external && <Ruler className="w-6 h-6 text-[#C5A55A]" />}
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-4 mt-4"
              >
                <a
                  href="tel:3224503257"
                  className="inline-flex items-center gap-2 bg-[#C5A55A] text-white px-6 py-3 font-serif text-lg w-fit hover:bg-[#B8963E] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Llamada: 322 450 3257
                </a>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#1A1A1A]/60">Síguenos:</span>
                  <a
                    href="https://instagram.com/nutriserpv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1A1A1A]/60 hover:text-[#C5A55A] transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://facebook.com/nutriserpv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1A1A1A]/60 hover:text-[#C5A55A] transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

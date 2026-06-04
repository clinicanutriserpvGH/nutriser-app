/*
 * Nutriser - Navbar Component (Desktop Marketing Site Only)
 * Design: Neo-Art Deco with warm organic feel
 * Gold accent on scroll, transparent initially
 * All users see the same marketing website
 */
import { useState, useEffect } from "react";
import { Menu, X, Phone, Instagram, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/servicios" },
  { label: "Cupones", href: "/cupones" },
  { label: "Transformaciones", href: "/transformaciones" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

interface NavbarProps {
  lightBg?: boolean;
  onShowSplash?: () => void;
  isHome?: boolean;
  hideNavLinks?: boolean;
  hideLogo?: boolean;
}

export default function Navbar({ lightBg = false, onShowSplash, isHome = false, hideNavLinks = false, hideLogo = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();

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
    // Enlace de ancla (#nosotros, #contacto, etc.)
    const sectionId = href.replace("#", "");
    const el = document.getElementById(sectionId);
    if (el) {
      // La sección existe en la página actual → scroll directo
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // La sección no existe aquí → ir a Home y luego hacer scroll
      sessionStorage.setItem("nutriser_scroll_to", sectionId);
      navigate("/");
    }
  };

  // Secret admin access: long press logo to open admin panel (3 seconds for security)
  let logoLongPressTimer: NodeJS.Timeout | null = null;
  const handleLogoMouseDown = () => {
    logoLongPressTimer = setTimeout(() => {
      navigate("/admin/login");
    }, 3000);
  };
  const handleLogoMouseUp = () => {
    if (logoLongPressTimer) {
      clearTimeout(logoLongPressTimer);
      logoLongPressTimer = null;
    }
  };
  const handleLogoTouchStart = () => {
    logoLongPressTimer = setTimeout(() => {
      navigate("/admin/login");
    }, 3000);
  };
  const handleLogoTouchEnd = () => {
    if (logoLongPressTimer) {
      clearTimeout(logoLongPressTimer);
      logoLongPressTimer = null;
    }
  };

  return (
    <>
      <nav
        data-navbar
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          !isHome || scrolled || lightBg
            ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(197,165,90,0.08)]"
            : "bg-transparent"
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="container flex items-center justify-between h-20">
          {/* Logo */}
          {!hideLogo ? (
          <div
            onMouseDown={handleLogoMouseDown}
            onMouseUp={handleLogoMouseUp}
            onTouchStart={handleLogoTouchStart}
            onTouchEnd={handleLogoTouchEnd}
            className="flex items-center gap-2 cursor-pointer select-none"
            title="Nutriser Home (Mantén presionado para panel admin)"
          >
            <img
              src={LOGO_URL}
              alt="Nutriser - Aesthetic & Nutrition"
              className="h-12 w-auto object-contain transition-all duration-500"
            />
          </div>
          ) : <div className="w-12" />}

          {/* Desktop Nav Links */}
          <div className={`hidden lg:flex items-center gap-8 ${hideNavLinks ? 'invisible pointer-events-none' : ''}`}>
            {navLinks.map((link: any) => (
              <div key={link.href} className="relative group">
                <a
                  href={link.href}
                  target={(link as any).external ? "_blank" : undefined}
                  rel={(link as any).external ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (!(link as any).external && !link.submenu) {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }
                  }}
                  className={`text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:text-[#C5A55A] relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-[#C5A55A] after:transition-all after:duration-300 hover:after:w-full ${
                    !isHome || scrolled || lightBg ? "text-[#1A1A1A]/70" : "text-white/80"
                  }`}
                >
                  {link.label}
                </a>
              </div>
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

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-1.5">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`transition-colors duration-300 ${
                !isHome || scrolled || lightBg ? "text-[#1A1A1A]" : "text-white"
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
                  transition={{ delay: i * 0.1 }}
                  className="font-serif text-3xl text-[#1A1A1A]/80 hover:text-[#C5A55A] transition-colors flex items-center gap-3"
                >
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

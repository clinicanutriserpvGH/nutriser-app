/*
 * Nutriser - Navbar Component
 * Design: Neo-Art Deco with warm organic feel
 * Gold accent on scroll, transparent initially
 * Uses real Nutriser logo
 */
import { useState, useEffect } from "react";
import { Menu, X, Phone, Instagram, Facebook, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
  { label: "Tienda eBook", href: "/ebook" },
  { label: "Comprar Programa Nutrición", href: "/memberships" },
  { label: "Administración", href: "/admin/login" },
];

interface NavbarProps {
  /** Cuando true, el navbar asume fondo claro desde el inicio (no invierte el logo) */
  lightBg?: boolean;
}

export default function Navbar({ lightBg = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    // Si es una ruta (comienza con /), navega directamente
    if (href.startsWith("/")) {
      window.location.href = href;
      return;
    }
    // Si es un ancla, hace scroll
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || lightBg
            ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(197,165,90,0.08)]"
            : "bg-transparent"
        }`}
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

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (link.href.startsWith("/")) {
                    window.location.href = link.href;
                  } else {
                    handleNavClick(link.href);
                  }
                }}
                className={`text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:text-[#C5A55A] relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-[#C5A55A] after:transition-all after:duration-300 hover:after:w-full ${
                  scrolled || lightBg ? "text-[#1A1A1A]/70" : "text-white/80"
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-6">
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
              {/* Portal de Salud Button */}
              <a
                href="https://portaldesaludnutriser.club"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#1A1A1A] text-[#C5A55A] px-5 py-2.5 text-sm tracking-[0.1em] uppercase border-2 border-[#C5A55A] transition-all duration-300 hover:bg-[#C5A55A] hover:text-[#1A1A1A] hover:shadow-lg hover:shadow-[#C5A55A]/20"
              >
                <Ruler className="w-3.5 h-3.5" />
                Portal de Salud
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

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden transition-colors duration-300 ${
              scrolled || lightBg ? "text-[#1A1A1A]" : "text-white"
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
            className="fixed inset-0 z-40 bg-white/98 backdrop-blur-lg pt-24 px-8"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (link.href.startsWith("/")) {
                      window.location.href = link.href;
                    } else {
                      handleNavClick(link.href);
                    }
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="font-serif text-3xl text-[#1A1A1A]/80 hover:text-[#C5A55A] transition-colors"
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
                  href="https://portaldesaludnutriser.club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1A1A1A] text-[#C5A55A] px-6 py-3 font-serif text-lg w-fit border-2 border-[#C5A55A] hover:bg-[#C5A55A] hover:text-[#1A1A1A] transition-colors"
                >
                  <Ruler className="w-5 h-5" />
                  Ingresa a tu Portal de Salud
                </a>
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

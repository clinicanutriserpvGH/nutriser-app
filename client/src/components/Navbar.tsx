/*
 * Nutriser - Navbar Component
 * Design: Neo-Art Deco with warm organic feel
 * Gold accent on scroll, transparent initially
 * Playfair Display for brand, Lato for nav links
 */
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Tratamientos", href: "#tratamientos" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
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
            <span
              className={`font-serif text-2xl tracking-wide transition-colors duration-500 ${
                scrolled ? "text-[#C5A55A]" : "text-white"
              }`}
            >
              nutriser
            </span>
            <span
              className={`text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 ${
                scrolled ? "text-[#C5A55A]/70" : "text-white/70"
              }`}
            >
              aesthetic & nutrition
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:text-[#C5A55A] relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-[#C5A55A] after:transition-all after:duration-300 hover:after:w-full ${
                  scrolled ? "text-warm-black/70" : "text-white/80"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://wa.me/523221007799"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#C5A55A] text-white px-5 py-2.5 text-sm tracking-[0.1em] uppercase transition-all duration-300 hover:bg-[#B8963E] hover:shadow-lg hover:shadow-[#C5A55A]/20"
            >
              <Phone className="w-3.5 h-3.5" />
              Agendar Cita
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden transition-colors duration-300 ${
              scrolled ? "text-warm-black" : "text-white"
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
                    handleNavClick(link.href);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="font-serif text-3xl text-warm-black/80 hover:text-[#C5A55A] transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="https://wa.me/523221007799"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 bg-[#C5A55A] text-white px-6 py-3 font-serif text-xl w-fit mt-4 hover:bg-[#B8963E] transition-colors"
              >
                <Phone className="w-5 h-5" />
                Agendar Cita
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

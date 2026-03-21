/*
 * Nutriser - Contact Section
 * Design: Dark background with gold accents
 * Contact info, WhatsApp CTA, social links, embedded map
 * Updated with email from full catalog
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  Instagram,
  Facebook,
  Clock,
  Mail,
  Gift,
} from "lucide-react";
import { useLocation } from "wouter";

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [, navigate] = useLocation();

  return (
    <section id="contacto" className="py-24 lg:py-32 bg-[#1A1A1A] text-white">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-[#C5A55A] text-xs tracking-[0.3em] uppercase">
              Contáctanos
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl text-white mt-4 mb-6">
              Comienza tu{" "}
              <span className="italic text-[#C5A55A]">transformación</span>
            </h2>
            <div className="w-16 h-[1px] bg-[#C5A55A] mx-auto mb-6" />
            <p className="text-white/60 max-w-xl mx-auto text-lg">
              Agenda tu valoración y déjanos acompañarte. Estamos para
              responder todas tus preguntas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="space-y-6">
              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/523221007799"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-6 bg-[#25D366]/10 border border-[#25D366]/20 transition-all duration-300 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 group"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-[#25D366] text-white flex-shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs tracking-[0.2em] uppercase text-[#25D366]">
                    WhatsApp
                  </span>
                  <p className="text-white text-lg font-medium">
                    322 100 7799
                  </p>
                  <p className="text-white/50 text-sm">
                    Escríbenos para agendar tu cita
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+523224503257"
                className="flex items-center gap-5 p-6 bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-[#C5A55A]/30"
              >
                <div className="w-14 h-14 flex items-center justify-center border border-[#C5A55A]/40 flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#C5A55A]" />
                </div>
                <div>
                  <span className="text-xs tracking-[0.2em] uppercase text-[#C5A55A]">
                    Teléfono
                  </span>
                  <p className="text-white text-lg font-medium">
                    322 450 3257
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:clinicanutriserpv@gmail.com"
                className="flex items-center gap-5 p-6 bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-[#C5A55A]/30"
              >
                <div className="w-14 h-14 flex items-center justify-center border border-[#C5A55A]/40 flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#C5A55A]" />
                </div>
                <div>
                  <span className="text-xs tracking-[0.2em] uppercase text-[#C5A55A]">
                    Email
                  </span>
                  <p className="text-white text-lg font-medium">
                    clinicanutriserpv@gmail.com
                  </p>
                </div>
              </a>

              {/* Address */}
              <div className="flex items-start gap-5 p-6 bg-white/5 border border-white/10">
                <div className="w-14 h-14 flex items-center justify-center border border-[#C5A55A]/40 flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#C5A55A]" />
                </div>
                <div>
                  <span className="text-xs tracking-[0.2em] uppercase text-[#C5A55A]">
                    Ubicación
                  </span>
                  <p className="text-white text-lg font-medium">
                    Emiliano Zapata #2
                  </p>
                  <p className="text-white/50">
                    Col. Valentín Gómez Farías, Puerto Vallarta, Jalisco
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-5 p-6 bg-white/5 border border-white/10">
                <div className="w-14 h-14 flex items-center justify-center border border-[#C5A55A]/40 flex-shrink-0">
                  <Clock className="w-6 h-6 text-[#C5A55A]" />
                </div>
                <div>
                  <span className="text-xs tracking-[0.2em] uppercase text-[#C5A55A]">
                    Horario
                  </span>
                  <p className="text-white text-lg font-medium">
                    Lunes a Sábado
                  </p>
                  <p className="text-white/50">Agenda tu cita por WhatsApp</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <a
                  href="tel:3224503257"
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 text-xs tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-green-700"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
                <a
                  href="https://wa.me/523221007799"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 text-xs tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#1FAE5D]"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <button
                  onClick={() => navigate("/appointment-form")}
                  className="flex items-center justify-center gap-2 bg-[#C5A55A] text-white px-4 py-3 text-xs tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#B8963E]"
                >
                  <Clock className="w-4 h-4" />
                  Agendar
                </button>
                <button
                  onClick={() => navigate("/memberships")}
                  className="flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#C5A55A] text-[#C5A55A] px-4 py-3 text-xs tracking-[0.15em] uppercase font-bold transition-all duration-300 hover:bg-[#C5A55A] hover:text-[#1A1A1A]"
                >
                  <Gift className="w-4 h-4" />
                  Programas
                </button>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 pt-4">
                <span className="text-xs tracking-[0.2em] uppercase text-[#C5A55A]">
                  Síguenos
                </span>
                <div className="w-8 h-[1px] bg-[#C5A55A]/40" />
                <a
                  href="https://instagram.com/nutriserpv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-white/20 text-white/60 hover:border-[#C5A55A] hover:text-[#C5A55A] transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com/nutriserpv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-white/20 text-white/60 hover:border-[#C5A55A] hover:text-[#C5A55A] transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://x.com/nutriserpv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-white/20 text-white/60 hover:border-[#C5A55A] hover:text-[#C5A55A] transition-all duration-300"
                  aria-label="X (Twitter)"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="relative">
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[400px] overflow-hidden border border-white/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.7!2d-105.2305!3d20.6128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842145a1b0c0a0a1%3A0x0!2sEmiliano+Zapata+2%2C+Valent%C3%ADn+G%C3%B3mez+Far%C3%ADas%2C+Puerto+Vallarta%2C+Jalisco!5e0!3m2!1ses!2smx!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "grayscale(0.3) contrast(1.1)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Nutriser"
                />
              </div>
              {/* Gold corner accents */}
              <div className="absolute -top-2 -left-2 w-12 h-12 border-t border-l border-[#C5A55A]" />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b border-r border-[#C5A55A]" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

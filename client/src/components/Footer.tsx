/*
 * Nutriser - Footer
 * Design: Minimal dark footer with gold accents and real logo
 */

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo_988aec8f.jpeg";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] text-white/40 py-10">
      <div className="container">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C5A55A]/30 to-transparent mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <img
            src={LOGO_URL}
            alt="Nutriser"
            className="h-10 w-auto object-contain brightness-0 invert opacity-60"
          />
          <p className="text-sm text-center">
            &copy; {year} Nutriser Soluciones. Todos los derechos reservados.
          </p>
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-sm">Puerto Vallarta, Jalisco, México</p>
            <div className="flex gap-3">
              <a
                href="/privacy-policy"
                className="text-xs text-[#C5A55A]/60 hover:text-[#C5A55A] transition-colors underline"
              >
                Política de Privacidad
              </a>
              <span className="text-[#C5A55A]/30">·</span>
              <a
                href="/delete-account"
                className="text-xs text-[#C5A55A]/60 hover:text-[#C5A55A] transition-colors underline"
              >
                Eliminar cuenta
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

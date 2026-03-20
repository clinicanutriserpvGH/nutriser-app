/*
 * Nutriser - Footer
 * Design: Minimal dark footer with gold accents
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] text-white/40 py-10">
      <div className="container">
        <div className="gold-line mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg text-[#C5A55A]">nutriser</span>
            <span className="text-[9px] tracking-[0.15em] uppercase text-white/30">
              aesthetic & nutrition
            </span>
          </div>
          <p className="text-sm">
            &copy; {year} Nutriser Soluciones. Todos los derechos reservados.
          </p>
          <p className="text-sm">
            Puerto Vallarta, Jalisco, México
          </p>
        </div>
      </div>
    </footer>
  );
}

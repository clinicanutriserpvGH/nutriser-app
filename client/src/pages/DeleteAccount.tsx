import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const MAILTO_URL =
  "mailto:clinicanutriserpv@gmail.com?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20cuenta&body=Hola%2C%20solicito%20la%20eliminaci%C3%B3n%20de%20mi%20cuenta%20de%20Nutriser.%0A%0ACorreo%20asociado%20a%20mi%20cuenta%3A%20";

export default function DeleteAccount() {
  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Usar window.location.href funciona mejor en iPhone Safari para abrir la app de correo
    window.location.href = MAILTO_URL;
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#FAF7F2] flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full bg-[#222] rounded-2xl p-8 shadow-xl border border-[#C5A55A]/20">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img
            src="https://cdn.manus.space/nutriser-logo.png"
            alt="Nutriser Logo"
            className="h-12 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="text-[#C5A55A] font-semibold text-xl">Nutriser</span>
        </div>

        <h1 className="text-2xl font-bold text-[#C5A55A] mb-4">
          Solicitud de Eliminación de Cuenta
        </h1>

        <p className="text-[#FAF7F2]/80 mb-6 leading-relaxed">
          Si deseas eliminar tu cuenta y todos los datos asociados de Nutriser Aesthetic &amp; Nutrition, 
          puedes solicitarlo enviando un correo electrónico a nuestro equipo. Procesaremos tu solicitud 
          en un plazo máximo de <strong>30 días hábiles</strong>.
        </p>

        <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6 border border-[#C5A55A]/10">
          <h2 className="text-[#C5A55A] font-semibold mb-3">¿Qué datos se eliminarán?</h2>
          <ul className="space-y-2 text-[#FAF7F2]/70 text-sm">
            <li>• Nombre y dirección de correo electrónico</li>
            <li>• Historial de mediciones y seguimiento nutricional</li>
            <li>• Plan de alimentación personalizado</li>
            <li>• Historial de citas y consultas</li>
            <li>• Compras de membresías y ebooks (los registros de facturación se conservan por obligación legal por 5 años)</li>
          </ul>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-6 mb-8 border border-[#C5A55A]/10">
          <h2 className="text-[#C5A55A] font-semibold mb-3">Cómo solicitar la eliminación</h2>
          <p className="text-[#FAF7F2]/70 text-sm mb-3">
            Envía un correo electrónico con el asunto <strong>"Solicitud de eliminación de cuenta"</strong> a:
          </p>
          <a
            href={MAILTO_URL}
            onClick={handleEmailClick}
            className="flex items-center justify-center gap-2 w-full bg-[#C5A55A] text-[#1A1A1A] font-bold px-6 py-4 rounded-xl hover:bg-[#d4b46a] active:scale-95 transition-all duration-200 text-base shadow-lg shadow-[#C5A55A]/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Enviar correo a clinicanutriserpv@gmail.com
          </a>
          <p className="text-[#FAF7F2]/50 text-xs mt-3">
            Incluye el correo electrónico asociado a tu cuenta para que podamos identificarla.
          </p>
        </div>

        <Link href="/">
          <Button variant="outline" className="border-[#C5A55A]/40 text-[#C5A55A] hover:bg-[#C5A55A]/10">
            ← Regresar al inicio
          </Button>
        </Link>
      </div>

      <p className="text-[#FAF7F2]/30 text-xs mt-8 text-center">
        Nutriser Aesthetic &amp; Nutrition<br />
        clinicanutriserpv@gmail.com
      </p>
    </div>
  );
}

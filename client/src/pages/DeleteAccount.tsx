import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DeleteAccount() {
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
            href="mailto:clinicanutriserpv@gmail.com?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20cuenta"
            className="inline-block bg-[#C5A55A] text-[#1A1A1A] font-semibold px-6 py-3 rounded-lg hover:bg-[#d4b46a] transition-colors"
          >
            clinicanutriserpv@gmail.com
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
        Nutriser Aesthetic &amp; Nutrition · Puerto Vallarta, Jalisco, México<br />
        clinicanutriserpv@gmail.com
      </p>
    </div>
  );
}

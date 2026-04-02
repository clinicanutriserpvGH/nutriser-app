export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A]">
      {/* Barra de navegación superior */}
      <div className="bg-[#1A1A1A] border-b border-[#C5A55A]/20 px-4 py-3">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[#C5A55A] hover:text-[#C5A55A]/80 transition-colors text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Regresar al inicio
        </a>
      </div>

      {/* Header */}
      <div className="bg-[#1A1A1A] py-8 px-4 text-center">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png"
          alt="Nutriser"
          className="h-14 mx-auto mb-3"
        />
        <h1 className="text-2xl font-bold text-[#C5A55A]">Política de Privacidad</h1>
        <p className="text-[#C5A55A]/70 text-sm mt-1">Nutriser Aesthetic &amp; Nutrition</p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 text-[15px] leading-relaxed">

        <p className="text-gray-600 text-sm">Última actualización: 30 de marzo de 2026</p>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">1. Responsable del tratamiento</h2>
          <p>
            <strong>Nutriser Aesthetic &amp; Nutrition</strong> (en adelante "Nutriser") es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
          </p>
          <p className="mt-2">Contacto: <a href="mailto:clinicanutriserpv@gmail.com" className="text-[#C5A55A] underline">clinicanutriserpv@gmail.com</a></p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">2. Datos personales que recopilamos</h2>
          <p>A través de nuestra aplicación y sitio web podemos recopilar los siguientes datos:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Datos de salud: peso, talla, medidas corporales, plan nutricional</li>
            <li>Historial de citas y consultas</li>
            <li>Información de pago (procesada por terceros seguros)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">3. Finalidades del tratamiento</h2>
          <p>Sus datos son utilizados para:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Gestionar su cuenta en el Portal de Salud Nutriser</li>
            <li>Brindar seguimiento nutricional y estético personalizado</li>
            <li>Agendar y gestionar citas médicas</li>
            <li>Enviar notificaciones sobre su plan de salud, cupones y promociones</li>
            <li>Mejorar nuestros servicios y la experiencia del usuario</li>
            <li>Cumplir con obligaciones legales y fiscales</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">4. Transferencia de datos</h2>
          <p>
            Nutriser no vende ni transfiere sus datos personales a terceros con fines comerciales. Únicamente los compartimos con proveedores de servicios tecnológicos (almacenamiento en nube, procesamiento de pagos) bajo estrictos acuerdos de confidencialidad, y cuando sea requerido por autoridades competentes conforme a la ley.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">5. Seguridad de los datos</h2>
          <p>
            Implementamos medidas técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, pérdida o divulgación, incluyendo cifrado SSL/TLS, autenticación segura y acceso restringido al personal autorizado.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">6. Derechos ARCO</h2>
          <p>
            Usted tiene derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse</strong> al tratamiento de sus datos personales (derechos ARCO). Para ejercerlos, envíe un correo a <a href="mailto:clinicanutriserpv@gmail.com" className="text-[#C5A55A] underline">clinicanutriserpv@gmail.com</a> con su nombre completo, descripción de la solicitud y copia de identificación oficial.
          </p>
          <p className="mt-2">Responderemos en un plazo máximo de 20 días hábiles.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">7. Cookies y tecnologías de rastreo</h2>
          <p>
            Nuestra aplicación puede utilizar cookies y tecnologías similares para mejorar la experiencia del usuario, recordar preferencias y analizar el uso de la app. Puede desactivar las cookies desde la configuración de su dispositivo, aunque esto puede afectar algunas funcionalidades.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">8. Cambios a esta política</h2>
          <p>
            Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Le notificaremos de cambios significativos a través de la aplicación o por correo electrónico. El uso continuado de la app implica la aceptación de los cambios.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">9. Contacto</h2>
          <p>
            Para cualquier duda o solicitud relacionada con esta política, contáctenos en:
          </p>
          <ul className="mt-2 space-y-1 text-gray-700">
            <li>📧 <a href="mailto:clinicanutriserpv@gmail.com" className="text-[#C5A55A] underline">clinicanutriserpv@gmail.com</a></li>
            <li>🌐 <a href="https://www.nutriserpv.com" className="text-[#C5A55A] underline">www.nutriserpv.com</a></li>

          </ul>
        </section>

      </div>

      {/* Footer */}
      <div className="bg-[#1A1A1A] text-center py-6 text-[#C5A55A]/60 text-sm">
        © 2026 Nutriser Aesthetic &amp; Nutrition · Todos los derechos reservados
      </div>
    </div>
  );
}

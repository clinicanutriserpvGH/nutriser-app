import nodemailer from "nodemailer";
import { ENV } from "./env";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

export function getEmailTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.gmailUser,
        pass: ENV.gmailPassword,
      },
    });
  }
  return transporter;
}

export async function sendConfirmationEmail(
  clientEmail: string,
  clientName: string,
  programType: "basic" | "premium" | "treatment",
  accessCode?: string
) {
  const transporter = getEmailTransporter();

  const programName = programType === "basic" ? "Básico" : programType === "premium" ? "Premium" : "Tratamiento";
  const price = programType === "basic" ? "$2,500 MXN" : programType === "premium" ? "$4,500 MXN" : "$5,499 MXN";

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #C5A55A;">Nutriser - Aesthetic & Nutrition</h1>
          
          <p>Hola <strong>${clientName}</strong>,</p>
          
          <p>¡Gracias por adquirir el programa <strong>${programName}</strong> de Nutriser!</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #C5A55A; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #C5A55A;">Detalles de tu Membresía</h3>
            <p><strong>Programa:</strong> ${programName}</p>
            <p><strong>Precio:</strong> ${price} (Pago único)</p>
            ${programType === "basic" ? `
              <p><strong>Incluye:</strong></p>
              <ul>
                <li>4 Asesorías Nutricionales Personalizadas</li>
                <li>4 Escaneos Corporales</li>
                <li>5% de descuento en tratamientos corporales</li>
              </ul>
            ` : programType === "premium" ? `
              <p><strong>Incluye:</strong></p>
              <ul>
                <li>8 Asesorías Nutricionales Personalizadas</li>
                <li>8 Escaneos Corporales</li>
                <li>10% de descuento en todos los tratamientos</li>
                <li>Acceso a seguimiento online</li>
              </ul>
            ` : `
              <p><strong>Incluye:</strong></p>
              <ul>
                <li>4 sesiones de Cavitación corporal</li>
                <li>4 sesiones de Radiofrecuencia corporal</li>
                <li>4 sesiones de Mesoterapia reductora</li>
                <li>Seguimiento personalizado de tu progreso</li>
                <li>Válido en Nutriser Puerto Vallarta</li>
              </ul>
            `}
          </div>
          
          <p>¡Tu pago ha sido <strong>confirmado y aprobado</strong> por nuestro equipo! 🎉</p>
          
          ${accessCode ? `
          <div style="background-color: #C5A55A; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px;">Tu código de acceso exclusivo es:</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 6px; font-family: monospace;">${accessCode}</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.9;">Guarda este código — lo necesitarás para acceder a tu programa</p>
          </div>
          ` : ''}
          
          <p>En breve nos pondremos en contacto contigo para coordinar tus primeras asesorías.</p>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp: <strong>+52 322 100 7799</strong> o por correo a <strong>clinicanutriserpv@gmail.com</strong>.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999;">
            Nutriser - Aesthetic & Nutrition
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      to: clientEmail,
      subject: `✅ Pago Confirmado - Programa ${programName} Nutriser`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return false;
  }
}

export async function sendMembershipNotificationToAdmin(
  adminEmail: string,
  clientName: string,
  clientEmail: string,
  clientPhone: string | undefined,
  programType: "basic" | "premium" | "treatment",
  discountCode?: string,
  discountPercent?: number
) {
  const transporter = getEmailTransporter();
  const programName = programType === "basic" ? "Básico" : programType === "premium" ? "Premium" : "Tratamiento";
  const basePrice = programType === "basic" ? 2500 : programType === "premium" ? 4500 : 5499;
  const finalPrice = discountPercent ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice;
  const priceDisplay = `$${finalPrice.toLocaleString('es-MX')} MXN`;
  const discountLine = discountCode && discountPercent
    ? `<p><strong>Código aplicado:</strong> ${discountCode} (-${discountPercent}%)</p>
            <p><strong>Precio original:</strong> <span style="text-decoration:line-through; color:#999;">$${basePrice.toLocaleString('es-MX')} MXN</span></p>
            <p><strong>Precio con descuento:</strong> <span style="color:#C5A55A; font-size:1.1em; font-weight:bold;">${priceDisplay}</span></p>`
    : `<p><strong>Precio:</strong> ${priceDisplay}</p>`;

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #C5A55A;">Nueva Inscripción a Membresía</h1>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #C5A55A; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #C5A55A;">Detalles del Cliente</h3>
            <p><strong>Nombre:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Teléfono:</strong> ${clientPhone || "No proporcionado"}</p>
            <p><strong>Programa:</strong> ${programName}</p>
            ${discountLine}
          </div>
          
          <p>El cliente ha completado su inscripción y está esperando confirmar el pago. Revisa el panel de administración para ver el comprobante cuando lo suba.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999;">
            Este es un correo automático de Nutriser.
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      replyTo: clientEmail,
      to: adminEmail,
      subject: `Nueva Inscripción a Membresía - ${clientName} (${programName})`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending membership notification:", error);
    return false;
  }
}

export async function sendAppointmentConfirmationToClient(
  clientName: string,
  clientEmail: string,
  appointmentDate: Date,
  appointmentTime: string
) {
  const transporter = getEmailTransporter();

  const formattedDate = appointmentDate.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #C5A55A;">Nutriser - Aesthetic & Nutrition</h1>
          
          <p>Hola <strong>${clientName}</strong>,</p>
          
          <p>Gracias por agendar una valoración con nosotros. Pronto nos comunicaremos con usted para confirmar su cita.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #C5A55A; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #C5A55A;">Detalles de tu Cita</h3>
            <p><strong>Fecha Solicitada:</strong> ${formattedDate}</p>
            <p><strong>Hora Solicitada:</strong> ${appointmentTime}</p>
            <p><strong>Servicio:</strong> Valoración Nutricional</p>
          </div>
          
          <p>Si tienes alguna pregunta o necesitas cambiar la fecha, por favor contáctanos por WhatsApp: <strong>+52 322 100 7799</strong></p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999;">
            Nutriser - Aesthetic & Nutrition
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      to: clientEmail,
      subject: `Confirmación de Solicitud de Cita - Nutriser`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending appointment confirmation:", error);
    return false;
  }
}

export async function sendAppointmentNotification(
  adminEmail: string,
  clientName: string,
  clientEmail: string,
  clientPhone: string | undefined,
  appointmentDate: Date,
  appointmentTime: string,
  serviceType: string
) {
  const transporter = getEmailTransporter();

  const formattedDate = appointmentDate.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #C5A55A;">Nueva Cita Agendada</h1>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #C5A55A; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #C5A55A;">Detalles de la Cita</h3>
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Teléfono:</strong> ${clientPhone || "No proporcionado"}</p>
            <p><strong>Fecha:</strong> ${formattedDate}</p>
            <p><strong>Hora:</strong> ${appointmentTime}</p>
            <p><strong>Servicio:</strong> ${serviceType}</p>
          </div>
          
          <p>Una nueva cita ha sido agendada en tu sistema. Por favor revisa el panel de administración para más detalles.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999;">
            Este es un correo automático. Por favor no respondas a este mensaje.
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      to: adminEmail,
      subject: `Nueva Cita Agendada - ${clientName}`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending appointment notification:", error);
    return false;
  }
}

export async function sendCouponPurchaseNotificationToAdmin(
  adminEmail: string,
  buyerName: string,
  buyerEmail: string,
  buyerPhone: string | undefined,
  couponCode: string,
  promotionTitle: string,
  isGift: boolean,
  recipientName?: string
) {
  const transporter = getEmailTransporter();
  const giftType = isGift && recipientName ? `regalo para <strong>${recipientName}</strong>` : 'uso personal';

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f6f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0 10px;">
            <h1 style="color: #C5A55A; font-size: 24px; margin: 0;">Nutriser</h1>
            <p style="color: #888; font-size: 12px; margin: 4px 0 0;">Aesthetic & Nutrition</p>
          </div>
          <h2 style="color: #333; font-size: 18px;">\uD83C\uDF81 Nueva compra de cup\u00f3n</h2>
          <div style="background-color: #fff8e1; border-left: 4px solid #C5A55A; padding: 15px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Comprador:</strong> ${buyerName}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${buyerEmail}</p>
            <p style="margin: 4px 0;"><strong>Tel\u00e9fono:</strong> ${buyerPhone || 'No proporcionado'}</p>
            <p style="margin: 4px 0;"><strong>Promoci\u00f3n:</strong> ${promotionTitle}</p>
            <p style="margin: 4px 0;"><strong>C\u00f3digo:</strong> ${couponCode}</p>
            <p style="margin: 4px 0;"><strong>Tipo:</strong> ${giftType}</p>
          </div>
          <p>Revisa el panel de administraci\u00f3n para <strong>autorizar o rechazar</strong> este cup\u00f3n.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 11px; color: #aaa; text-align: center;">Nutriser - Aesthetic & Nutrition \u00b7 nutriserpv.com</p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      replyTo: buyerEmail,
      to: adminEmail,
      subject: `\uD83C\uDF81 Nueva compra de cup\u00f3n - ${buyerName} (${couponCode})`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending coupon purchase notification:', error);
    return false;
  }
}

export async function sendCouponApprovedEmail(
  buyerEmail: string,
  buyerName: string,
  couponCode: string,
  promotionTitle: string,
  isGift: boolean,
  recipientName?: string,
  expiresAt?: Date
) {
  const transporter = getEmailTransporter();

  const holderName = isGift && recipientName ? recipientName : buyerName;
  const giftNote = isGift && recipientName
    ? `<p>Este cupón fue adquirido por <strong>${buyerName}</strong> como regalo para <strong>${recipientName}</strong>.</p>`
    : '';

  const expiresBlock = expiresAt
    ? `<div style="background: #C5A55A22; border: 1px solid #C5A55A44; border-radius: 8px; padding: 10px 16px; margin: 12px 0; text-align: center;">
        <p style="color: #C5A55A; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px;">Válido hasta</p>
        <p style="color: #F0D080; font-size: 15px; font-weight: bold; margin: 0;">${new Date(expiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>`
    : '';

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f6f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

          <!-- Header -->
          <div style="text-align: center; padding: 30px 0 10px;">
            <h1 style="color: #C5A55A; font-size: 28px; margin: 0;">Nutriser</h1>
            <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Aesthetic & Nutrition</p>
          </div>

          <p>Hola <strong>${buyerName}</strong>,</p>
          <p>¡Tu cupón ha sido <strong style="color: #2e7d32;">autorizado</strong>! Ya puedes usarlo en cualquiera de nuestros servicios.</p>

          ${giftNote}

          <!-- Cupón visual -->
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2416 50%, #1a1a1a 100%); border-radius: 16px; padding: 30px; margin: 24px 0; text-align: center; border: 2px solid #C5A55A;">
            <p style="color: #C5A55A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">Cupón Válido</p>
            <h2 style="color: #fff; font-size: 20px; margin: 0 0 16px;">${promotionTitle}</h2>
            <div style="border-top: 1px dashed rgba(197,165,90,0.4); border-bottom: 1px dashed rgba(197,165,90,0.4); padding: 16px 0; margin: 16px 0;">
              <p style="color: #C5A55A; font-size: 11px; letter-spacing: 2px; margin: 0 0 6px;">A NOMBRE DE</p>
              <p style="color: #fff; font-size: 18px; font-weight: bold; margin: 0;">${holderName}</p>
            </div>
            <p style="color: #aaa; font-size: 11px; letter-spacing: 2px; margin: 0 0 6px;">CÓDIGO ÚNICO</p>
            <p style="color: #C5A55A; font-size: 28px; font-family: monospace; font-weight: bold; letter-spacing: 4px; margin: 0;">${couponCode}</p>
            ${expiresBlock}
            <p style="color: #666; font-size: 10px; margin: 16px 0 0;">Presenta este código en Nutriser para redimir tu cupón.</p>
          </div>

          <!-- Aviso de cita previa -->
          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #2e7d32;">
              📞 <strong>Recuerda agendar tu cita previa</strong><br>
              Llama al <strong>322 450 3257</strong> o escríbenos por WhatsApp para reservar tu lugar.
            </p>
          </div>

          <div style="background-color: #fff8e1; border-left: 4px solid #C5A55A; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #555;">
              <strong>¿Cómo usar tu cupón?</strong><br>
              Presenta el código <strong>${couponCode}</strong> en recepción o muestra este correo al momento de tu cita.
            </p>
          </div>

          <p style="font-size: 13px; color: #666;">¿Tienes dudas? Contáctanos por WhatsApp: <strong>+52 322 100 7799</strong></p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
          <p style="font-size: 11px; color: #aaa; text-align: center;">Nutriser - Aesthetic & Nutrition · nutriserpv.com</p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      to: buyerEmail,
      subject: `🎁 Tu cupón ${couponCode} ha sido autorizado - Nutriser`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending coupon approved email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(adminEmail: string, resetLink: string) {
  const transporter = getEmailTransporter();

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #C5A55A;">Nutriser - Panel de Administración</h1>
          
          <p>Recibiste una solicitud para restablecer la contraseña del panel de administración.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #C5A55A; margin: 20px 0; text-align: center;">
            <p style="margin-bottom: 16px;">Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <a href="${resetLink}" 
               style="background-color: #C5A55A; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Este enlace es válido por <strong>1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este correo.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
            <a href="${resetLink}" style="color: #C5A55A;">${resetLink}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">
            Nutriser Aesthetic &amp; Nutrition — Puerto Vallarta
          </p>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Nutriser Admin" <${ENV.gmailUser}>`,
    to: adminEmail,
    subject: "Restablecer contraseña — Panel Admin Nutriser",
    html: htmlContent,
  });
}

export async function sendPatientNotificationEmail(
  patientEmail: string,
  subject: string,
  title: string,
  message: string
) {
  const transporter = getEmailTransporter();
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f6f1;">
        <div style="max-width: 600px; margin: 0 auto; padding: 0;">
          <div style="background-color: #1A1A1A; padding: 28px 32px; text-align: center;">
            <h1 style="color: #C5A55A; margin: 0; font-size: 22px; letter-spacing: 1px;">NUTRISER</h1>
            <p style="color: #C5A55A; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">AESTHETIC &amp; NUTRITION</p>
          </div>
          <div style="background-color: #ffffff; padding: 32px;">
            <h2 style="color: #1A1A1A; font-size: 20px; margin-top: 0;">${title}</h2>
            <div style="color: #444; font-size: 15px; white-space: pre-line;">${message}</div>
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #eee;">
              <a href="https://nutriserpv.com/mis-tratamientos"
                 style="background-color: #C5A55A; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
                Ver mi portal
              </a>
            </div>
          </div>
          <div style="background-color: #1A1A1A; padding: 20px 32px; text-align: center;">
            <p style="color: #888; font-size: 12px; margin: 0;">
              Nutriser Aesthetic &amp; Nutrition — Puerto Vallarta, Jalisco, México<br/>
              <a href="mailto:clinicanutriserpv@gmail.com" style="color: #C5A55A;">clinicanutriserpv@gmail.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  await transporter.sendMail({
    from: `"Nutriser Aesthetic & Nutrition" <${ENV.gmailUser}>`,
    to: patientEmail,
    subject,
    html: htmlContent,
  });
}

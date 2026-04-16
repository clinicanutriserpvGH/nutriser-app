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
  accessCode?: string,
  customProgramName?: string
) {
  const transporter = getEmailTransporter();

  // Usar el nombre real del paquete si está disponible, sino usar el nombre actualizado
  const programName = customProgramName || (programType === "basic" ? "Paquete Nutrición" : programType === "premium" ? "Paquete Reductor Nutriser" : "Tratamiento");
  const price = programType === "basic" ? "$2,500 MXN" : programType === "premium" ? "$4,500 MXN" : "$5,499 MXN";

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f6f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 24px 0 12px; background-color: #1a1a1a; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #C5A55A; font-size: 26px; margin: 0 0 4px;">Nutriser</h1>
            <p style="color: #cccccc; font-size: 13px; margin: 0;">Aesthetic &amp; Nutrition</p>
          </div>
          
          <p style="color: #333333;">Hola <strong style="color: #1a1a1a;">${clientName}</strong>,</p>
          
          <p style="color: #333333;">¡Gracias por adquirir el programa <strong style="color: #1a1a1a;">${programName}</strong> de Nutriser!</p>
          
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #C5A55A; margin: 20px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <h3 style="margin-top: 0; color: #C5A55A;">Detalles de tu Membresía</h3>
            <p><strong>Programa:</strong> ${programName}</p>
            <p><strong>Precio:</strong> ${price} (Pago único)</p>
            ${programType === "basic" ? `
              <p><strong>Incluye:</strong></p>
              <ul>
                <li>4 asesorías nutricionales personalizadas</li>
                <li>4 escaneos corporales</li>
                <li>10% de descuento en tratamientos corporales</li>
                <li>Acceso a seguimiento online</li>
              </ul>
            ` : programType === "premium" ? `
              <p><strong>Incluye:</strong></p>
              <ul>
                <li>4 asesorías nutricionales personalizadas</li>
                <li>4 sesiones de Cavitación corporal</li>
                <li>4 sesiones de Radiofrecuencia corporal</li>
                <li>4 sesiones de Mesoterapia reductora</li>
                <li>10% de descuento en tratamientos faciales</li>
                <li>10% de descuento en compra de productos</li>
              </ul>
            ` : `
              <p><strong>Incluye:</strong></p>
              <ul>
                <li>Consulta con el equipo Nutriser para detalles</li>
              </ul>
            `}
          </div>
          
          <p style="color: #333333;">¡Tu pago ha sido <strong style="color: #1a7a32;">confirmado y aprobado</strong> por nuestro equipo!</p>
          
          ${accessCode ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #C5A55A; border-radius: 8px; margin: 20px 0;">
            <tr><td style="padding: 20px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff;">Tu c&#243;digo de acceso exclusivo es:</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 6px; font-family: 'Courier New', monospace; color: #ffffff;">${accessCode}</p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #ffffff;">Guarda este c&#243;digo &#8212; lo necesitar&#225;s para acceder a tu programa</p>
            </td></tr>
          </table>
          ` : ''}
          
          <p style="color: #333333;">En breve nos pondremos en contacto contigo para coordinar tus primeras asesor&#237;as.</p>
          
          <p style="color: #333333;">Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp: <strong>+52 322 100 7799</strong> o por correo a <strong>clinicanutriserpv@gmail.com</strong>.</p>
          
          <hr style="border: none; border-top: 1px solid #dddddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999999; text-align: center;">
            Nutriser - Aesthetic &amp; Nutrition &middot; nutriserpv.com
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      to: clientEmail,
      subject: `✅ Pago Confirmado - ${programName} - Nutriser`,
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
  discountPercent?: number,
  customProgramName?: string
) {
  const transporter = getEmailTransporter();
  const programName = customProgramName || (programType === "basic" ? "Paquete Nutrición" : programType === "premium" ? "Paquete Reductor Nutriser" : "Tratamiento");
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
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f6f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0 10px; background-color: #1a1a1a; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #C5A55A; font-size: 22px; margin: 0 0 4px;">Nutriser Admin</h1>
            <p style="color: #cccccc; font-size: 12px; margin: 0;">Nueva Inscripci&#243;n a Membres&#237;a</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #C5A55A; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #C5A55A;">Detalles del Cliente</h3>
            <p style="color: #333333; margin: 4px 0;"><strong>Nombre:</strong> ${clientName}</p>
            <p style="color: #333333; margin: 4px 0;"><strong>Email:</strong> ${clientEmail}</p>
            <p style="color: #333333; margin: 4px 0;"><strong>Tel&#233;fono:</strong> ${clientPhone || 'No proporcionado'}</p>
            <p style="color: #333333; margin: 4px 0;"><strong>Programa:</strong> ${programName}</p>
            ${discountLine}
          </div>
          
          <p style="color: #333333;">El cliente ha completado su inscripci&#243;n y est&#225; esperando confirmar el pago. Revisa el panel de administraci&#243;n para ver el comprobante cuando lo suba.</p>
          
          <hr style="border: none; border-top: 1px solid #dddddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999999; text-align: center;">
            Nutriser - Aesthetic &amp; Nutrition &middot; nutriserpv.com
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
    ? `<div style="background-color: rgba(197,165,90,0.15); border: 1px solid #C5A55A; border-radius: 8px; padding: 10px 16px; margin: 12px 0; text-align: center;">
        <p style="color: #C5A55A; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px;">V&#225;lido hasta</p>
        <p style="color: #ffffff; font-size: 15px; font-weight: bold; margin: 0;">${new Date(expiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>`
    : '';

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f6f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

          <!-- Header -->
          <div style="text-align: center; padding: 30px 0 10px; background-color: #1a1a1a; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #C5A55A; font-size: 28px; margin: 0 0 4px;">Nutriser</h1>
            <p style="color: #cccccc; font-size: 13px; margin: 0;">Aesthetic &amp; Nutrition</p>
          </div>

          <p style="color: #333333;">Hola <strong style="color: #1a1a1a;">${buyerName}</strong>,</p>
          <p style="color: #333333;">¡Tu cup&#243;n ha sido <strong style="color: #1a7a32;">autorizado</strong>! Ya puedes usarlo en cualquiera de nuestros servicios.</p>

          ${giftNote}

          <!-- Cupón visual con fondo sólido para compatibilidad -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; border: 2px solid #C5A55A; margin: 24px 0;">
            <tr><td style="padding: 30px; text-align: center;">
              <p style="color: #C5A55A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">Cup&#243;n V&#225;lido</p>
              <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 16px;">${promotionTitle}</h2>
              <hr style="border: none; border-top: 1px dashed #C5A55A; margin: 12px 0;">
              <p style="color: #C5A55A; font-size: 11px; letter-spacing: 2px; margin: 0 0 6px;">A NOMBRE DE</p>
              <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 0 0 16px;">${holderName}</p>
              <hr style="border: none; border-top: 1px dashed #C5A55A; margin: 12px 0;">
              <p style="color: #aaaaaa; font-size: 11px; letter-spacing: 2px; margin: 0 0 6px;">C&#211;DIGO &#218;NICO</p>
              <p style="color: #C5A55A; font-size: 28px; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 4px; margin: 0;">${couponCode}</p>
              ${expiresBlock}
              <p style="color: #aaaaaa; font-size: 10px; margin: 16px 0 0;">Presenta este c&#243;digo en Nutriser para redimir tu cup&#243;n.</p>
            </td></tr>
          </table>

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
            Nutriser Aesthetic &amp; Nutrition
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
              Nutriser Aesthetic &amp; Nutrition<br/>
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

/**
 * Envía correo de autorización 2FA para login admin.
 * Se envía a los dos correos de seguridad para que cualquiera autorice.
 */
export async function sendLoginAuthorizationEmail(
  adminEmail: string,
  authLink: string,
  securityEmails: string[]
) {
  const transporter = getEmailTransporter();
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1A1A1A; padding: 28px 32px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #C5A55A; margin: 0; font-size: 22px; letter-spacing: 1px;">NUTRISER</h1>
            <p style="color: #C5A55A; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">PANEL DE ADMINISTRACI&Oacute;N</p>
          </div>
          
          <div style="background-color: #fff; padding: 32px; border: 1px solid #eee; border-top: none;">
            <div style="background-color: #FFF3CD; border: 1px solid #FFEAA7; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #856404; font-weight: bold;">&#9888;&#65039; Solicitud de Acceso al Panel Admin</p>
            </div>
            
            <p>Alguien est&aacute; intentando acceder al panel de administraci&oacute;n con el correo:</p>
            <p style="font-weight: bold; font-size: 18px; color: #1A1A1A; background: #f5f5f5; padding: 12px; border-radius: 6px; text-align: center;">${adminEmail}</p>
            
            <p>Si reconoces este acceso y deseas <strong>autorizar la entrada</strong>, haz clic en el siguiente bot&oacute;n:</p>
            
            <div style="text-align: center; margin: 28px 0;">
              <a href="${authLink}" 
                 style="background-color: #28a745; color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                &#10003; Autorizar Acceso
              </a>
            </div>
            
            <p style="color: #dc3545; font-weight: bold;">Si NO reconoces este intento de acceso, NO hagas clic en el bot&oacute;n. El acceso ser&aacute; denegado autom&aacute;ticamente.</p>
            
            <p style="color: #666; font-size: 14px;">
              Este enlace es v&aacute;lido por <strong>10 minutos</strong>. Despu&eacute;s de ese tiempo, el intento de acceso ser&aacute; rechazado.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Si el bot&oacute;n no funciona, copia y pega este enlace en tu navegador:<br/>
              <a href="${authLink}" style="color: #C5A55A;">${authLink}</a>
            </p>
          </div>
          
          <div style="background-color: #1A1A1A; padding: 16px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #888; font-size: 12px; margin: 0;">
              Nutriser Aesthetic &amp; Nutrition &mdash; Sistema de Seguridad
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  // Enviar a todos los correos de seguridad
  for (const email of securityEmails) {
    try {
      await transporter.sendMail({
        from: `"Nutriser Seguridad" <${ENV.gmailUser}>`,
        to: email,
        subject: "Autorizacion de acceso - Panel Admin Nutriser",
        html: htmlContent,
      });
    } catch (err) {
      console.error(`[Email] Failed to send 2FA email to ${email}:`, err);
    }
  }
}

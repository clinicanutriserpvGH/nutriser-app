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
  programType: "basic" | "premium"
) {
  const transporter = getEmailTransporter();

  const programName = programType === "basic" ? "Básico" : "Premium";
  const price = programType === "basic" ? "$2,500 MXN" : "$4,000 MXN";

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
            ` : `
              <p><strong>Incluye:</strong></p>
              <ul>
                <li>8 Asesorías Nutricionales Personalizadas</li>
                <li>8 Escaneos Corporales</li>
                <li>10% de descuento en todos los tratamientos</li>
                <li>Acceso a seguimiento online</li>
              </ul>
            `}
          </div>
          
          <p>Tu solicitud ha sido recibida. Pronto nos pondremos en contacto contigo para confirmar tu programa y coordinar tus primeras asesorías.</p>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp: <strong>+52 322 100 7799</strong> o por correo.</p>
          
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
      subject: `Bienvenido a Nutriser - Programa ${programName}`,
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
  programType: "basic" | "premium"
) {
  const transporter = getEmailTransporter();
  const programName = programType === "basic" ? "Básico" : "Premium";
  const price = programType === "basic" ? "$2,500 MXN" : "$4,000 MXN";

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
            <p><strong>Precio:</strong> ${price}</p>
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

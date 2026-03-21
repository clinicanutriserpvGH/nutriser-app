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
  const price = programType === "basic" ? "$2,000 MXN" : "$3,000 MXN";

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #C5A55A;">Nutriser - Aesthetic & Nutrition</h1>
          
          <p>Hola <strong>${clientName}</strong>,</p>
          
          <p>¡Gracias por haber se inscrito en el programa <strong>${programName}</strong> de Nutriser!</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #C5A55A; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #C5A55A;">Detalles de tu Membresía</h3>
            <p><strong>Programa:</strong> ${programName}</p>
            <p><strong>Precio:</strong> ${price} (Pago único)</p>
            ${programType === "basic" ? `
              <p><strong>Incluye:</strong></p>
              <ul>
                <li>4 Asesorías Nutricionales</li>
                <li>4 Escaneos Corporales</li>
                <li>5% de descuento en tratamientos corporales</li>
              </ul>
            ` : `
              <p><strong>Incluye:</strong></p>
              <ul>
                <li>10 Asesorías Nutricionales</li>
                <li>10 Escaneos Corporales</li>
                <li>10% de descuento en todos los tratamientos</li>
              </ul>
            `}
          </div>
          
          <p>Tu solicitud ha sido recibida y está en proceso de validación. Pronto nos pondremos en contacto contigo para confirmar tu membresía.</p>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp: <strong>+52 322 100 7799</strong></p>
          
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
      from: ENV.gmailUser,
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
      from: ENV.gmailUser,
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

import { getEmailTransporter } from "./email";
import { ENV } from "./env";

// ─── Notificación a suscriptores cuando se publica un nuevo cupón ─────────────

export async function sendNewCouponNotificationToSubscribers(
  subscribers: Array<{ email: string; whatsapp: string }>,
  couponTitle: string,
  couponDescription: string | null,
  couponPrice: string | null,
  couponRegularPrice: string | null,
  couponId: number
) {
  const transporter = getEmailTransporter();
  const couponUrl = `https://nutriserpv.com/api/og/cupon/${couponId}`;

  const priceBlock = couponPrice
    ? `
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2416 50%, #1a1a1a 100%); border-radius: 12px; padding: 20px; margin: 16px 0; text-align: center; border: 2px solid #C5A55A;">
        ${couponRegularPrice ? `<p style="color: #aaa; font-size: 13px; text-decoration: line-through; margin: 0 0 4px;">Precio regular: ${couponRegularPrice}</p>` : ''}
        <p style="color: #C5A55A; font-size: 24px; font-weight: bold; margin: 0;">Precio especial: ${couponPrice}</p>
      </div>
    `
    : '';

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f6f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0 10px;">
            <h1 style="color: #C5A55A; font-size: 28px; margin: 0;">Nutriser</h1>
            <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Aesthetic &amp; Nutrition</p>
          </div>
          <div style="background: #fff8e1; border-left: 4px solid #C5A55A; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="color: #C5A55A; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px;">&#128276; Nueva Oferta Exclusiva</p>
            <h2 style="color: #1a1a1a; font-size: 22px; margin: 0;">${couponTitle}</h2>
          </div>
          ${couponDescription ? `<p style="color: #555; font-size: 15px;">${couponDescription}</p>` : ''}
          ${priceBlock}
          <div style="text-align: center; margin: 24px 0;">
            <a href="${couponUrl}" style="display: inline-block; background: linear-gradient(135deg, #C5A55A, #8B6914); color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
              &#127873; Ver y Adquirir Cupon
            </a>
          </div>
          <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #2e7d32;">
              Recuerda agendar tu cita previa. Llama al <strong>322 450 3257</strong> o escríbenos por WhatsApp: <strong>+52 322 100 7799</strong>
            </p>
          </div>
          <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">
            Recibes este correo porque te suscribiste a las ofertas de Nutriser.<br>
            <a href="https://nutriserpv.com" style="color: #C5A55A;">nutriserpv.com</a>
          </p>
        </div>
      </body>
    </html>
  `;

  const results = await Promise.allSettled(
    subscribers.map(sub =>
      transporter.sendMail({
        from: `"Nutriser Ofertas" <${ENV.gmailUser}>`,
        to: sub.email,
        subject: `Nueva oferta en Nutriser: ${couponTitle}`,
        html: htmlContent,
      })
    )
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`[Coupon notification] Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed };
}

// ─── Notificación al admin cuando llega compra de servicio ───────────────────

export async function sendServicePurchaseNotificationToAdmin(
  adminEmail: string,
  buyerName: string,
  buyerEmail: string,
  buyerPhone: string | undefined,
  serviceName: string,
  serviceCode: string
) {
  const transporter = getEmailTransporter();

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f6f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0 10px;">
            <h1 style="color: #C5A55A; font-size: 24px; margin: 0;">Nutriser</h1>
            <p style="color: #888; font-size: 12px; margin: 4px 0 0;">Aesthetic &amp; Nutrition</p>
          </div>
          <h2 style="color: #333; font-size: 18px;">&#128722; Nueva compra de servicio</h2>
          <div style="background-color: #fff8e1; border-left: 4px solid #C5A55A; padding: 15px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Servicio:</strong> ${serviceName}</p>
            <p style="margin: 4px 0;"><strong>Codigo:</strong> ${serviceCode}</p>
            <p style="margin: 4px 0;"><strong>Comprador:</strong> ${buyerName}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${buyerEmail}</p>
            <p style="margin: 4px 0;"><strong>Telefono:</strong> ${buyerPhone || 'No proporcionado'}</p>
          </div>
          <p>Revisa el panel de administracion para ver el comprobante de pago y aprobar la compra.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 11px; color: #aaa; text-align: center;">Nutriser - Aesthetic &amp; Nutrition - nutriserpv.com</p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      replyTo: buyerEmail,
      to: adminEmail,
      subject: `Nueva compra de servicio - ${buyerName} (${serviceCode})`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending service purchase notification:', error);
    return false;
  }
}

// ─── Correo al cliente cuando se aprueba su compra de servicio ───────────────

export async function sendServicePurchaseApprovedEmail(
  buyerEmail: string,
  buyerName: string,
  serviceName: string,
  serviceCode: string
) {
  const transporter = getEmailTransporter();

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f6f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 30px 0 10px;">
            <h1 style="color: #C5A55A; font-size: 28px; margin: 0;">Nutriser</h1>
            <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Aesthetic &amp; Nutrition</p>
          </div>
          <p>Hola <strong>${buyerName}</strong>,</p>
          <p>Tu pago ha sido <strong style="color: #2e7d32;">confirmado</strong>. Tu servicio esta listo.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; border: 2px solid #C5A55A; margin: 24px 0;">
            <tr><td style="padding: 28px; text-align: center;">
              <p style="color: #C5A55A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">Servicio Confirmado</p>
              <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 16px;">${serviceName}</h2>
              <hr style="border: none; border-top: 1px dashed #C5A55A; margin: 12px 0;">
              <p style="color: #aaaaaa; font-size: 11px; letter-spacing: 2px; margin: 0 0 6px;">C&#211;DIGO &#218;NICO</p>
              <p style="color: #C5A55A; font-size: 26px; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 4px; margin: 0;">${serviceCode}</p>
              <hr style="border: none; border-top: 1px dashed #C5A55A; margin: 12px 0;">
              <p style="color: #aaaaaa; font-size: 11px; margin: 8px 0 0;">Presenta este c&#243;digo en Nutriser al momento de tu cita.</p>
            </td></tr>
          </table>
          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #2e7d32;">
              Agenda tu cita: Llama al <strong>322 450 3257</strong> o escríbenos por WhatsApp: <strong>+52 322 100 7799</strong>
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
          <p style="font-size: 11px; color: #aaa; text-align: center;">Nutriser - Aesthetic &amp; Nutrition - nutriserpv.com</p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      to: buyerEmail,
      subject: `Tu servicio ${serviceCode} ha sido confirmado - Nutriser`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending service purchase approved email:', error);
    return false;
  }
}

// ─── Notificación al paciente: comprobante recibido (pendiente de aprobación) ─

export async function sendPurchaseReceivedEmail(
  buyerEmail: string,
  buyerName: string,
  itemName: string
) {
  const transporter = getEmailTransporter();
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f6f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 30px 0 10px;">
            <h1 style="color: #C5A55A; font-size: 28px; margin: 0;">Nutriser</h1>
            <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Aesthetic &amp; Nutrition</p>
          </div>
          <p>Hola <strong>${buyerName}</strong>,</p>
          <p>Recibimos tu comprobante de pago. Estamos revisando tu compra:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff8e1; border-radius: 12px; border: 2px solid #C5A55A; margin: 24px 0;">
            <tr><td style="padding: 24px; text-align: center;">
              <p style="color: #C5A55A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">Pendiente de Aprobacion</p>
              <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 8px;">${itemName}</h2>
              <p style="color: #666; font-size: 13px; margin: 0;">Te avisaremos cuando sea aprobada. Solo presenta tu <strong>Monedero Nutriser</strong> en la clinica.</p>
            </td></tr>
          </table>
          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #2e7d32;">
              Dudas? Llama al <strong>322 450 3257</strong> o WhatsApp: <strong>+52 322 100 7799</strong>
            </p>
          </div>
          <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 24px;">Nutriser - Aesthetic &amp; Nutrition - nutriserpv.com</p>
        </div>
      </body>
    </html>
  `;
  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      to: buyerEmail,
      subject: `Comprobante recibido: ${itemName} - Nutriser`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending purchase received email:', error);
    return false;
  }
}

// ─── Notificación al paciente: compra aprobada (sin código, solo monedero) ───

export async function sendPurchaseApprovedEmail(
  buyerEmail: string,
  buyerName: string,
  itemName: string
) {
  const transporter = getEmailTransporter();
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f6f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 30px 0 10px;">
            <h1 style="color: #C5A55A; font-size: 28px; margin: 0;">Nutriser</h1>
            <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Aesthetic &amp; Nutrition</p>
          </div>
          <p>Hola <strong>${buyerName}</strong>,</p>
          <p>Tu compra ha sido <strong style="color: #2e7d32;">aprobada</strong>!</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; border: 2px solid #C5A55A; margin: 24px 0;">
            <tr><td style="padding: 28px; text-align: center;">
              <p style="color: #C5A55A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">Compra Aprobada</p>
              <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 12px;">${itemName}</h2>
              <hr style="border: none; border-top: 1px dashed #C5A55A; margin: 12px 0;">
              <p style="color: #aaaaaa; font-size: 14px; margin: 8px 0 0;">Solo presenta tu <strong style="color: #C5A55A;">Monedero Nutriser</strong> al llegar a la clinica.</p>
            </td></tr>
          </table>
          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #2e7d32;">
              Agenda tu cita: <strong>322 450 3257</strong> o WhatsApp: <strong>+52 322 100 7799</strong>
            </p>
          </div>
          <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 24px;">Nutriser - Aesthetic &amp; Nutrition - nutriserpv.com</p>
        </div>
      </body>
    </html>
  `;
  try {
    await transporter.sendMail({
      from: `"Nutriser" <${ENV.gmailUser}>`,
      to: buyerEmail,
      subject: `Tu compra fue aprobada! ${itemName} - Nutriser`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending purchase approved email:', error);
    return false;
  }
}


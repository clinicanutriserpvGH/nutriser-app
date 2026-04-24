/**
 * Jobs programados para automatizaciones de pacientes
 * - Recordatorio de citas 24h antes
 * - Notificación de cumpleaños con cupón especial
 * - Recordatorio semanal de vencimiento de cashback (lunes 10 AM)
 */

import { ENV } from "./_core/env";
import { getDb } from "./db";
import { patientAccounts, patientAppointments, patientTreatments, wallets, walletTransactions } from "../drizzle/schema";
import { eq, and, sql, gt } from "drizzle-orm";

/**
 * Envía recordatorio de cita por email 24 horas antes
 * Se ejecuta diariamente a las 10:00 AM
 */
export async function sendAppointmentReminders() {
  console.log("[Job] Ejecutando sendAppointmentReminders...");
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const db = await getDb();
    if (!db) { console.warn('[Job] DB no disponible'); return; }
    const appointments = await db
      .select({
        appointment: patientAppointments,
        patient: patientAccounts,
        treatment: patientTreatments,
      })
      .from(patientAppointments)
      .leftJoin(patientAccounts, eq(patientAppointments.patientId, patientAccounts.id))
      .leftJoin(patientTreatments, eq(patientAppointments.treatmentId, patientTreatments.id))
      .where(
        and(
          eq(patientAppointments.appointmentDate, tomorrowStr),
          eq(patientAppointments.status, "scheduled")
        )
      );
    
    console.log(`[Job] Encontradas ${appointments.length} citas para mañana (${tomorrowStr})`);
    if (appointments.length === 0) return;
    
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: { user: ENV.gmailUser, pass: ENV.gmailPassword },
    });
    
    for (const { appointment, patient, treatment } of appointments) {
      if (!patient || !appointment) continue;
      const serviceName = treatment?.serviceName || "su tratamiento";
      const appointmentTime = appointment.appointmentTime;
      try {
        await transporter.sendMail({
          from: `"Nutriser" <${ENV.gmailUser}>`,
          to: patient.email,
          subject: `🔔 Recordatorio: Cita mañana a las ${appointmentTime}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF7F2; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #C5A55A; margin: 0;">Nutriser Aesthetic & Nutrition</h1>
              </div>
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #1A1A1A; margin-top: 0;">¡Hola ${patient.name}! 👋</h2>
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  Te recordamos que tienes una cita programada para <strong>mañana ${tomorrowStr}</strong> a las <strong>${appointmentTime}</strong>.
                </p>
                <div style="background-color: #FAF7F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C5A55A;">
                  <p style="margin: 0; color: #1A1A1A;"><strong>📋 Servicio:</strong> ${serviceName}</p>
                  <p style="margin: 10px 0 0 0; color: #1A1A1A;"><strong>🕐 Hora:</strong> ${appointmentTime}</p>
                  <p style="margin: 10px 0 0 0; color: #1A1A1A;"><strong>📅 Fecha:</strong> ${tomorrowStr}</p>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                  Si necesitas reprogramar o tienes alguna duda, contáctanos por WhatsApp al <a href="https://wa.me/523221007799" style="color: #C5A55A; text-decoration: none;">322 100 7799</a>.
                </p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://nutriserpv.com/mis-tratamientos" style="display: inline-block; background-color: #C5A55A; color: #1A1A1A; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Ver Mis Tratamientos
                  </a>
                </div>
              </div>
              <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p>© 2026 Nutriser Aesthetic & Nutrition</p>
              </div>
            </div>
          `,
        });
        console.log(`[Job] Recordatorio enviado a ${patient.email} para cita del ${tomorrowStr} a las ${appointmentTime}`);
      } catch (error) {
        console.error(`[Job] Error enviando recordatorio a ${patient.email}:`, error);
      }
    }
    console.log("[Job] sendAppointmentReminders completado");
  } catch (error) {
    console.error("[Job] Error en sendAppointmentReminders:", error);
  }
}

/**
 * Detecta pacientes con cumpleaños hoy y les envía un cupón especial
 * Se ejecuta diariamente a las 9:00 AM
 */
export async function sendBirthdayGreetings() {
  console.log("[Job] Ejecutando sendBirthdayGreetings...");
  try {
    const today = new Date();
    const todayMMDD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const db = await getDb();
    if (!db) { console.warn('[Job] DB no disponible'); return; }
    const patients = await db
      .select()
      .from(patientAccounts)
      .where(sql`SUBSTRING(${patientAccounts.birthday}, 6) = ${todayMMDD}`);
    
    console.log(`[Job] Encontrados ${patients.length} pacientes con cumpleaños hoy (${todayMMDD})`);
    if (patients.length === 0) return;
    
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: { user: ENV.gmailUser, pass: ENV.gmailPassword },
    });
    
    for (const patient of patients) {
      try {
        await transporter.sendMail({
          from: `"Nutriser" <${ENV.gmailUser}>`,
          to: patient.email,
          subject: `🎉 ¡Feliz Cumpleaños ${patient.name}! 🎁 Regalo especial de Nutriser`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #FAF7F2 0%, #FFF5E6 100%); border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #C5A55A; margin: 0; font-size: 32px;">🎉 ¡Feliz Cumpleaños! 🎉</h1>
              </div>
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(197, 165, 90, 0.2);">
                <h2 style="color: #1A1A1A; margin-top: 0; text-align: center;">¡${patient.name}, hoy es tu día especial! 🎂</h2>
                <p style="color: #333; font-size: 16px; line-height: 1.6; text-align: center;">
                  En Nutriser queremos celebrar contigo. Por eso, te regalamos un <strong style="color: #C5A55A;">cupón de descuento del 20%</strong> en cualquier tratamiento de nuestra clínica.
                </p>
                <div style="background: linear-gradient(135deg, #C5A55A 0%, #D4B46A 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; box-shadow: 0 4px 15px rgba(197, 165, 90, 0.3);">
                  <p style="color: white; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Tu Cupón de Cumpleaños</p>
                  <p style="color: #1A1A1A; font-size: 32px; font-weight: bold; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 3px;">CUMPLE20</p>
                  <p style="color: white; font-size: 18px; margin: 15px 0 0 0; font-weight: bold;">20% de Descuento</p>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
                  Válido por <strong>30 días</strong> desde hoy. Aplica en cualquier tratamiento estético o nutricional.
                </p>
                <div style="background-color: #FAF7F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #1A1A1A; font-size: 14px; margin: 0; text-align: center;">
                    📞 Agenda tu cita: <a href="https://wa.me/523221007799?text=Hola%2C%20quiero%20usar%20mi%20cupón%20de%20cumpleaños%20CUMPLE20" style="color: #C5A55A; text-decoration: none; font-weight: bold;">322 100 7799</a>
                  </p>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://nutriserpv.com/services" style="display: inline-block; background-color: #C5A55A; color: #1A1A1A; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Ver Servicios Disponibles
                  </a>
                </div>
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; line-height: 1.5;">
                  ¡Que tengas un día maravilloso lleno de alegría y bendiciones! 💝<br>
                  Equipo Nutriser
                </p>
              </div>
              <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p>© 2026 Nutriser Aesthetic & Nutrition</p>
              </div>
            </div>
          `,
        });
        console.log(`[Job] Felicitación de cumpleaños enviada a ${patient.email}`);
      } catch (error) {
        console.error(`[Job] Error enviando felicitación a ${patient.email}:`, error);
      }
    }
    console.log("[Job] sendBirthdayGreetings completado");
  } catch (error) {
    console.error("[Job] Error en sendBirthdayGreetings:", error);
  }
}

/**
 * Recordatorio semanal inteligente de vencimiento de cashback.
 * Busca todos los monederos activos con saldo positivo,
 * calcula la fecha exacta de vencimiento del cashback más antiguo (2 meses desde creación),
 * y notifica al paciente por: notificación en monedero + push + correo.
 * Se ejecuta cada lunes a las 10:00 AM hora de México.
 */
export async function sendCashbackExpiryReminders() {
  console.log("[Job] Ejecutando recordatorio de vencimiento de cashback...");
  try {
    const db = await getDb();
    if (!db) { console.warn('[Job] DB no disponible'); return; }

    // Monederos activos con saldo positivo
    const activeWallets = await db.select().from(wallets)
      .where(and(eq(wallets.isActive, true), gt(wallets.balance, 0)));

    if (activeWallets.length === 0) {
      console.log('[Job] No hay monederos activos con saldo.');
      return;
    }

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: { user: ENV.gmailUser, pass: ENV.gmailPassword },
    });
    const { sendAdminNotification } = await import('./db');
    const { sendPushToPatient } = await import('./pushNotifications');

    let notified = 0;
    const now = new Date();

    for (const wallet of activeWallets) {
      try {
        // Obtener transacciones de cashback del monedero ordenadas por fecha
        const txs = await db.select().from(walletTransactions)
          .where(and(
            eq(walletTransactions.walletId, wallet.id),
            eq(walletTransactions.type, 'cashback')
          ))
          .orderBy(walletTransactions.createdAt);

        if (txs.length === 0) continue;

        // El cashback más antiguo vence primero: createdAt + 2 meses
        const oldestCashback = txs[0];
        const expiryDate = new Date(oldestCashback.createdAt);
        expiryDate.setMonth(expiryDate.getMonth() + 2);

        // Si ya venció, no recordar
        if (expiryDate <= now) continue;

        // Días restantes
        const msLeft = expiryDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

        // Fecha formateada en español
        const expiryStr = expiryDate.toLocaleDateString('es-MX', {
          day: 'numeric', month: 'long', year: 'numeric',
        });

        // Saldo en pesos
        const saldoPesos = (wallet.balance / 100).toFixed(2);

        // Urgencia según días restantes
        let urgencia = '';
        if (daysLeft <= 7) urgencia = '🚨 ¡Urgente! ';
        else if (daysLeft <= 14) urgencia = '⚠️ ';
        else urgencia = '💰 ';

        const titulo = `${urgencia}Tu cashback vence el ${expiryStr}`;
        const mensaje = `Tienes $${saldoPesos} MXN en tu Monedero Nutriser que vencen el ${expiryStr} (en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}). ¡Úsalo antes de que expire en tu próxima compra o visita!`;

        // 1. Notificación en el monedero (aparece en la campanita del paciente)
        await sendAdminNotification({
          walletId: wallet.id,
          patientId: wallet.patientId,
          title: titulo,
          message: mensaje,
          type: 'general',
          sentBy: 'system:cashback-reminder',
        });

        // 2. Obtener datos del paciente para push + email
        const patientRows = await db.select().from(patientAccounts)
          .where(eq(patientAccounts.id, wallet.patientId)).limit(1);
        const pat = patientRows[0];
        if (!pat) continue;

        // 3. Notificación push (si tiene suscripción activa)
        if (pat.pushSubscription) {
          await sendPushToPatient(
            pat.pushSubscription,
            titulo,
            `Tienes $${saldoPesos} MXN que vencen el ${expiryStr}. ¡No los pierdas!`,
            'https://nutriserpv.com/monedero',
          ).catch(() => {});
        }

        // 4. Correo electrónico
        if (pat.email) {
          await transporter.sendMail({
            from: `"Nutriser" <${ENV.gmailUser}>`,
            to: pat.email,
            subject: `${urgencia}Tu cashback Nutriser vence el ${expiryStr}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF7F2; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #C5A55A; margin: 0;">Nutriser Aesthetic & Nutrition</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h2 style="color: #1A1A1A; margin-top: 0;">¡Hola ${pat.name}! 👋</h2>
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    Tienes <strong style="color: #C5A55A;">$${saldoPesos} MXN</strong> en tu Monedero Nutriser que
                    <strong>vencen el ${expiryStr}</strong> (en <strong>${daysLeft} día${daysLeft !== 1 ? 's' : ''}</strong>).
                  </p>
                  <div style="background: linear-gradient(135deg, #C5A55A 0%, #D4B46A 100%); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                    <p style="color: white; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Tu saldo disponible</p>
                    <p style="color: #1A1A1A; font-size: 36px; font-weight: bold; margin: 0;">$${saldoPesos} MXN</p>
                    <p style="color: white; font-size: 13px; margin: 10px 0 0 0;">⏰ Vence el ${expiryStr}</p>
                  </div>
                  <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    Úsalo en tu próxima visita a la clínica o en nuestra tienda en línea. ¡No lo dejes vencer!
                  </p>
                  <div style="text-align: center; margin-top: 25px;">
                    <a href="https://nutriserpv.com/tienda" style="display: inline-block; background-color: #C5A55A; color: #1A1A1A; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                      Ir a la Tienda Nutriser
                    </a>
                  </div>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                  <p>© 2026 Nutriser Aesthetic & Nutrition | <a href="https://nutriserpv.com" style="color: #C5A55A;">nutriserpv.com</a></p>
                </div>
              </div>
            `,
          }).catch((err: any) => console.error(`[Job] Error enviando email cashback a ${pat.email}:`, err));
        }

        notified++;
      } catch (err) {
        console.error(`[Job] Error procesando wallet ${wallet.id}:`, err);
      }
    }
    console.log(`[Job] sendCashbackExpiryReminders completado: ${notified} pacientes notificados`);
  } catch (error) {
    console.error("[Job] Error en sendCashbackExpiryReminders:", error);
  }
}

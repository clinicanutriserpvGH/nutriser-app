/**
 * Jobs programados para automatizaciones de pacientes
 * - Recordatorio de citas 24h antes
 * - Notificación de cumpleaños con cupón especial
 */

import { ENV } from "./_core/env";
import { getDb } from "./db";
import { patientAccounts, patientAppointments, patientTreatments } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Envía recordatorio de cita por email 24 horas antes
 * Se ejecuta diariamente a las 10:00 AM
 */
export async function sendAppointmentReminders() {
  console.log("[Job] Ejecutando sendAppointmentReminders...");
  
  try {
    // Calcular la fecha de mañana (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Buscar todas las citas programadas para mañana
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
    
    if (appointments.length === 0) {
      return;
    }
    
    // Enviar email a cada paciente
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
                <p>Puerto Vallarta, Jalisco, México</p>
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
    // Obtener día y mes de hoy (MM-DD)
    const today = new Date();
    const todayMMDD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Buscar pacientes cuyo cumpleaños sea hoy (comparando solo MM-DD)
    // birthday está guardado como YYYY-MM-DD, extraemos los últimos 5 caracteres
    const db = await getDb();
    if (!db) { console.warn('[Job] DB no disponible'); return; }
    const patients = await db
      .select()
      .from(patientAccounts)
      .where(sql`SUBSTRING(${patientAccounts.birthday}, 6) = ${todayMMDD}`);
    
    console.log(`[Job] Encontrados ${patients.length} pacientes con cumpleaños hoy (${todayMMDD})`);
    
    if (patients.length === 0) {
      return;
    }
    
    // Enviar email con cupón especial a cada paciente
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
                <p>Puerto Vallarta, Jalisco, México</p>
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

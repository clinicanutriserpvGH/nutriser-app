import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createMembership, getAllMemberships, getMembershipById, updateMembershipStatus, createPaymentProof, getPaymentProofByMembershipId, createAppointment, getAllAppointments, getAdminByEmail, createAdminCredential, setAdminResetToken, getAdminByResetToken, updateAdminPassword, deleteMembership, getCouponByCode, getAllCoupons, approveCoupon, rejectCoupon, createMembershipCoupon, getAllPromotions, getPromotionsWithCouponCounts, createPromotion, updatePromotion, deletePromotion, getAllPromotionsForAdmin, deleteAppointment, deleteAllAppointments, cancelAppointment, createGiftPurchase, getAllGiftPurchases, getGiftPurchaseById, updateGiftPurchaseStatus, deleteGiftPurchase, getActiveEbook, getAllEbooks, upsertEbook, createEbookPurchase, getAllEbookPurchases, getEbookPurchaseByToken, updateEbookPurchaseStatus, deleteEbookPurchase, getEbookPurchaseByEmail, getAllEbookDiscountCodes, getEbookDiscountCodeByCode, toggleEbookDiscountCode, createServicePurchase, getAllServicePurchases, updateServicePurchaseStatus, deleteServicePurchase, getAllServices, getAllActiveServices, createService, updateService, deleteService, setAdminLoginToken, getAdminByLoginToken, authorizeAdminLogin, checkAdminLoginAuthorized, clearAdminLoginToken, getAdminBySessionToken } from "./db";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import { ENV } from "./_core/env";
import { sendConfirmationEmail, sendAppointmentNotification, sendMembershipNotificationToAdmin, sendAppointmentConfirmationToClient, sendCouponApprovedEmail, sendCouponPurchaseNotificationToAdmin, sendPasswordResetEmail, sendPatientNotificationEmail, sendLoginAuthorizationEmail, sendPurchaseReceiptEmail } from "./_core/email";
import { sendNewCouponNotificationToSubscribers, sendServicePurchaseNotificationToAdmin, sendServicePurchaseApprovedEmail } from './_core/email_extra';
import { getAllProducts, getAllActiveProducts, createProduct, updateProduct, deleteProduct, createProductPurchase, getAllProductPurchases, updateProductPurchaseStatus, deleteProductPurchase, validateDiscountCode, getAllDiscountCodes, toggleDiscountCode, incrementDiscountCodeUsage } from './db';
import { getAllCourses, getPublishedCourses, getCourseById, createCourse, updateCourse, deleteCourse, getVideosByCourse, getVideoById, createCourseVideo, updateCourseVideo, deleteCourseVideo, getDocumentsByVideo, createCourseDocument, deleteCourseDocument, getApprovedCommentsByVideo, getPendingComments, getAllCourseComments, createCourseComment, updateCommentStatus, deleteCourseComment, getAllCourseSubscribers, createCourseSubscriber, deleteCourseSubscriber } from './db';
import { getApprovedSuggestions, getAllSuggestions, getPendingSuggestions, createTopicSuggestion, approveSuggestion, rejectSuggestion, markSuggestionPublished, deleteSuggestion, voteForSuggestion, hasVoted } from './db';
import { createPatientAccount, getPatientByEmail, getPatientById, getAllPatients, updatePatientConsent, setPatientResetToken, getPatientByResetToken, updatePatientPassword, updatePatientPushSubscription, createPatientTreatment, getPatientTreatments, updatePatientTreatment, deletePatientTreatment, createPatientAppointment, getPatientAppointments, updatePatientAppointment, deletePatientAppointment, createPatientPhoto, getPatientPhotos, deletePatientPhoto, deletePatientAccount } from './db';
import { createWallet, getWalletByPatientId, getWalletById, getWalletByNumber, getAllWallets, addWalletTransaction, getWalletTransactions, getLoyaltyTracker, recordConsultation, useFreeConsultation, createLoyaltyPlan, getActiveLoyaltyPlans, getAllLoyaltyPlans, updateLoyaltyPlan, deleteLoyaltyPlan, getWalletLoyaltyProgress, recordLoyaltyPurchase, useLoyaltyReward, adminSetWalletBalance, toggleWalletActive, trackBehaviorEvent, getTopBehaviorItems, getBehaviorSummary, getBehaviorTrend, resetAllBehaviorEvents, createCashPendingPayment, getCashPendingPaymentsByWallet, getAllCashPendingPayments, confirmCashPayment, cancelCashPayment, getCashPaymentHistoryByWallet, deleteWalletTransaction, clearAllWalletTransactions, setWalletDiscount, removeWalletDiscount, deleteCashPayment, adminResetWallet, adminSuspendWallet, adminUnsuspendWallet, getCashPendingPaymentById } from './db';
import { getActiveSplashAds, getAllSplashAds, createSplashAd, toggleSplashAd, deleteSplashAd, updateSplashAdOrder, getSplashConfig, setSplashShowDefault, setSplashCustomImage } from './db';
import { createInstallmentPlan, confirmInstallmentPayment, getInstallmentPlansByWallet, getAllInstallmentPlans, sendAdminNotification, getAdminNotificationsByWallet, countUnreadAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead, deleteAdminNotification, deleteAllAdminNotifications, updateAdminNotification, sendCashbackNotification } from './db';
import { getActiveStoreBanners, getAllStoreBanners, createStoreBanner, toggleStoreBanner, deleteStoreBanner, updateStoreBannerOrder } from './db';
import { createBannerInterest, getPendingBannerInterests, getAllBannerInterests, getBannerInterestsByUser, attendBannerInterest, deleteBannerInterest } from './db';
import { getSystemConfig, setSystemConfig } from './db';
import { savePushSubscription, deletePushSubscription, sendPushNotificationToAll, getAllPushSubscriptions, sendPushToPatient } from "./pushNotifications";
import { saveAPNsToken, sendAPNsPushToAll, isAPNsConfigured } from "./apnsService";
import { storagePut } from "./storage";
import bcrypt from "bcrypt";
import { eq, desc } from "drizzle-orm";
import { adminCredentials, pushSubscriptions } from "../drizzle/schema";
import { getDb } from "./db";

// ── Helper: enviar correo + push al paciente cuando el admin manda notificación ──
async function sendAdminNotifEmailAndPush(
  patient: any,
  title: string,
  message: string,
  type: string,
  imageUrl?: string
) {
  const typeEmoji: Record<string, string> = { cobro: '💳', promocion: '🎁', felicitacion: '🎉', general: '🔔' };
  const emoji = typeEmoji[type] || '🔔';
  // Correo al paciente
  if (patient?.email) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: { user: ENV.gmailUser, pass: ENV.gmailPassword },
      });
      await transporter.sendMail({
        from: `"Nutriser" <${ENV.gmailUser}>`,
        to: patient.email,
        subject: `${emoji} ${title} - Nutriser`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FAF7F2;padding:32px;border-radius:8px;border:1px solid #C5A55A">
            <div style="text-align:center;margin-bottom:24px">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/nutriser-logo-transparent_8c59cfa6.png" alt="Nutriser" style="height:60px;object-fit:contain" />
            </div>
            <h2 style="color:#C5A55A;font-size:22px;margin:0 0 8px">${emoji} ${title}</h2>
            <p style="color:#1A1A1A;font-size:15px;line-height:1.6;margin:0 0 16px">${message}</p>
            ${imageUrl ? `<img src="${imageUrl}" alt="" style="width:100%;border-radius:8px;margin-bottom:16px" />` : ''}
            <div style="background:#1A1A1A;border-radius:8px;padding:16px;text-align:center;margin-top:24px">
              <a href="https://nutriserpv.com/monedero" style="color:#C5A55A;font-weight:bold;font-size:15px;text-decoration:none">📲 Ver en mi Monedero Nutriser</a>
            </div>
            <p style="color:#999;font-size:11px;text-align:center;margin-top:16px">Nutriser Aesthetic &amp; Nutrition &bull; Puerto Vallarta</p>
          </div>
        `,
      });
    } catch (e) { console.warn('[AdminNotif] Email error:', e); }
  }
  // Push notification al paciente
  if (patient?.pushSubscription) {
    try {
      await sendPushToPatient(
        patient.pushSubscription,
        title,
        message,
        '/monedero'
      );
    } catch (_) { /* push es opcional */ }
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    // Paso 1: Verifica correo+contraseña y devuelve que se requiere palabra clave
    adminLogin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const admin = await getAdminByEmail(input.email);
        if (!admin) throw new Error('Credenciales inválidas');
        const isPasswordValid = await bcrypt.compare(input.password, admin.passwordHash);
        if (!isPasswordValid) throw new Error('Credenciales inválidas');
        // Credenciales correctas — el frontend pedirá la palabra clave
        return {
          success: true,
          requirePassphrase: true,
          email: admin.email,
        };
      }),

    // Paso 2: Verifica la palabra clave e inicia sesión
    adminLoginWithPassphrase: publicProcedure
      .input(z.object({
        email: z.string().email(),
        passphrase: z.string(),
      }))
      .mutation(async ({ input }) => {
        const admin = await getAdminByEmail(input.email);
        if (!admin) throw new Error('Sesión expirada. Vuelve a ingresar tus credenciales.');
        // Obtener la palabra clave actual de la BD
        const currentPassphrase = await getSystemConfig('adminPassphrase');
        if (!currentPassphrase) throw new Error('Palabra clave no configurada. Contacta al administrador general.');
        if (input.passphrase.trim().toLowerCase() !== currentPassphrase.trim().toLowerCase()) {
          throw new Error('Palabra clave incorrecta');
        }
        // Generar session token de 24 horas
        const crypto = await import('crypto');
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const sessionTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const db = await getDb();
        if (db) {
          await db.update(adminCredentials)
            .set({ sessionToken, sessionTokenExpiresAt })
            .where(eq(adminCredentials.email, input.email));
        }
        return { success: true, email: admin.email, sessionToken };
      }),

    // Verificar session token (para acceso al panel sin cookies)
    verifySessionToken: publicProcedure
      .input(z.object({ sessionToken: z.string() }))
      .query(async ({ input }) => {
        const admin = await getAdminBySessionToken(input.sessionToken);
        if (!admin) return { valid: false };
        return { valid: true, email: admin.email, adminId: admin.id };
      }),

    // Obtener la palabra clave actual (solo para admin general con contraseña especial)
    getAdminPassphrase: publicProcedure
      .input(z.object({
        masterEmail: z.string().email(),
        masterPassword: z.string(),
      }))
      .query(async ({ input }) => {
        const MASTER_EMAIL = 'clinicanutriserpv@gmail.com';
        const MASTER_PASSWORD = 'nutriser8055374408';
        if (input.masterEmail !== MASTER_EMAIL || input.masterPassword !== MASTER_PASSWORD) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciales de administrador general incorrectas' });
        }
        const passphrase = await getSystemConfig('adminPassphrase');
        return { passphrase: passphrase ?? '' };
      }),

    // Actualizar la palabra clave (solo admin general con contraseña especial)
    updateAdminPassphrase: publicProcedure
      .input(z.object({
        masterEmail: z.string().email(),
        masterPassword: z.string(),
        newPassphrase: z.string().min(3, 'La palabra clave debe tener al menos 3 caracteres'),
      }))
      .mutation(async ({ input }) => {
        const MASTER_EMAIL = 'clinicanutriserpv@gmail.com';
        const MASTER_PASSWORD = 'nutriser8055374408';
        if (input.masterEmail !== MASTER_EMAIL || input.masterPassword !== MASTER_PASSWORD) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciales de administrador general incorrectas' });
        }
        await setSystemConfig('adminPassphrase', input.newPassphrase.trim());
        return { success: true };
      }),

    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
        origin: z.string(), // URL base del sitio para construir el link
      }))
      .mutation(async ({ input }) => {
        const admin = await getAdminByEmail(input.email);
        // Siempre devolver éxito para no revelar si el email existe
        if (!admin) return { success: true };

        // Generar token seguro de 64 caracteres hex
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await setAdminResetToken(input.email, token, expiresAt);

        const resetLink = `${input.origin}/admin/reset-password?token=${token}`;
        await sendPasswordResetEmail(input.email, resetLink);

        return { success: true };
      }),

    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
      }))
      .mutation(async ({ input }) => {
        const admin = await getAdminByResetToken(input.token);
        if (!admin) throw new Error('Token inválido o expirado');

        // Verificar que el token no haya expirado
        if (!admin.resetTokenExpiresAt || new Date() > admin.resetTokenExpiresAt) {
          throw new Error('El enlace ha expirado. Solicita uno nuevo.');
        }

        const newHash = await bcrypt.hash(input.newPassword, 10);
        await updateAdminPassword(admin.email, newHash);

        return { success: true };
      }),
  }),

  memberships: router({
    create: publicProcedure
      .input(z.object({
        clientName: z.string().min(1),
        clientEmail: z.string().email(),
        clientPhone: z.string().optional(),
        programType: z.enum(["basic", "premium", "treatment"]),
        programName: z.string().optional(),
        discountCode: z.string().optional(),
        discountPercent: z.number().optional(),
        walletDiscount: z.number().optional(),
        patientEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        const basePrice = input.programType === "basic" ? 2500 : input.programType === "premium" ? 4500 : 5499;
        const finalPrice = input.discountPercent
          ? Math.round(basePrice * (1 - input.discountPercent / 100))
          : basePrice;

        // ── Descontar saldo del monedero INMEDIATAMENTE ──
        const walletDiscountAmt = input.walletDiscount || 0;
        if (walletDiscountAmt > 0 && input.patientEmail) {
          try {
            const patient = await getPatientByEmail(input.patientEmail);
            if (patient) {
              const wallet = await getWalletByPatientId(patient.id);
              if (wallet && wallet.isActive) {
                const toDeduct = Math.min(Math.round(walletDiscountAmt * 100), wallet.balance);
                if (toDeduct > 0) {
                  await addWalletTransaction({
                    walletId: wallet.id,
                    type: 'redeem',
                    amount: -toDeduct,
                    description: `Descuento monedero en ${input.programName || 'paquete'}`,
                    referenceType: 'membership',
                    createdBy: 'patient',
                  });
                }
              }
            }
          } catch (e) { console.warn('Wallet deduct error (membership):', e); }
        }
        const programLabel = input.programType === "basic" ? "Básico" : input.programType === "premium" ? "Premium" : "Tratamiento";
        const realProgramName = input.programName || (input.programType === "basic" ? "Paquete Nutrición" : input.programType === "premium" ? "Paquete Reductor Nutriser" : "Tratamiento");
        const membership = await createMembership({
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          programType: input.programType,
          programName: realProgramName,
          price: String(finalPrice),
          depositConcept: `${input.clientName} - ${realProgramName}`,
          discountCode: input.discountCode,
          discountPercent: input.discountPercent,
          originalPrice: input.discountPercent ? String(basePrice) : undefined,
        });
        
        // NO enviar notificaciones aquí - solo crear la membresía
        // Las notificaciones se envían cuando el cliente sube el comprobante (uploadProof)
        return membership;
      }),
    
    uploadProof: publicProcedure
      .input(z.object({
        membershipId: z.number(),
        proofData: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ input }) => {
        const membership = await getMembershipById(input.membershipId);
        if (!membership) throw new Error("Membership not found");
        
        // Convert base64 to buffer
        const base64Data = input.proofData.split(',')[1] || input.proofData;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Upload to S3
        const fileKey = `memberships/${input.membershipId}-${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
        
        const proof = await createPaymentProof({
          membershipId: input.membershipId,
          proofUrl: url,
        });
        
        // Send proof notification email from client
        await sendMembershipNotificationToAdmin(
          ENV.gmailUser || "clinicanutriserpv@gmail.com",
          membership.clientName,
          membership.clientEmail,
          membership.clientPhone || undefined,
          membership.programType,
          membership.discountCode || undefined,
          membership.discountPercent || undefined,
          membership.programName || undefined
        );
        
        await notifyOwner({
          title: "Nuevo Comprobante de Membresía",
          content: `Cliente: ${membership.clientName}\nEmail: ${membership.clientEmail}\nTeléfono: ${membership.clientPhone || "No proporcionado"}\nPrograma: ${membership.programType === "basic" ? "Básico" : "Premium"}\nConcepto: ${membership.depositConcept}\nArchivo: ${input.fileName}`,
        });
        
        return proof;
      }),
    
    list: publicProcedure.query(async () => {
      // Admin validation is done on client-side via localStorage
      // This endpoint is public but admin dashboard checks localStorage before displaying
      return await getAllMemberships();
    }),
    
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getMembershipById(input);
      }),
    
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "verified", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        // Admin validation is done on client-side via localStorage
        const membership = await updateMembershipStatus(input.id, input.status);
        
        // If status is verified, send activation email with access code
        if (input.status === "verified" && membership) {
          await sendConfirmationEmail(
            membership.clientEmail,
            membership.clientName,
            membership.programType,
            membership.accessCode || undefined,
            membership.programName || undefined
          );

          // ── Auto-acreditar cashback al monedero del paciente ──
          try {
            const patient = await getPatientByEmail(membership.clientEmail);
            if (patient) {
              const wallet = await getWalletByPatientId(patient.id);
              if (wallet && wallet.isActive) {
                const priceInCents = Math.round(parseFloat(String(membership.price)) * 100);
                if (priceInCents > 0) {
                  const CASHBACK_PERCENT = 2; // 2% cashback
                  const cashbackAmount = Math.round(priceInCents * CASHBACK_PERCENT / 100);
                  if (cashbackAmount > 0) {
                    await addWalletTransaction({
                      walletId: wallet.id,
                      type: 'cashback',
                      amount: cashbackAmount,
                      description: `Cashback ${CASHBACK_PERCENT}% por compra: ${membership.programName || membership.programType}`,
                      referenceType: 'membership',
                      referenceId: membership.id,
                      createdBy: 'system',
                    });
                  }
                }
              }
            }
          } catch (e) {
            console.error('[Cashback] Error al acreditar cashback automático:', e);
            // No bloquear la verificación si falla el cashback
          }
        }
        
        return membership;
      }),
    
    getProof: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getPaymentProofByMembershipId(input);
      }),
    
    cancel: publicProcedure
      .input(z.object({
        membershipId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const membership = await getMembershipById(input.membershipId);
        if (!membership) throw new Error("Membership not found");
        
        await deleteMembership(input.membershipId);
        
        await notifyOwner({
          title: "Inscripción a Membresía Cancelada (Timeout)",
          content: `Cliente: ${membership.clientName}\nEmail: ${membership.clientEmail}\nPrograma: ${membership.programType === "basic" ? "Básico" : "Premium"}\nRazón: No se subió comprobante dentro de 15 minutos`,
        });
        
        return { success: true };
      }),

    // Verificar paquete por correo + código (para el panel del paciente)
    lookupByEmailAndCode: publicProcedure
      .input(z.object({
        email: z.string().email(),
        code: z.string().min(1),
      }))
      .query(async ({ input }) => {
        const all = await getAllMemberships();
        const match = all.find(
          m => m.clientEmail.toLowerCase() === input.email.toLowerCase().trim()
            && (m.accessCode ?? '').toUpperCase() === input.code.toUpperCase().trim()
        );
        if (!match) return { found: false };
        const programLabels: Record<string, string> = {
          basic: 'Paquete Básico',
          premium: 'Paquete Premium',
          treatment: 'Paquete Tratamiento',
        };
        const programLabel = programLabels[match.programType] ?? match.programType;
        return {
          found: true,
          accessCode: match.accessCode,
          clientName: match.clientName,
          programLabel,
          programType: match.programType,
          status: match.status,
          verifiedAt: match.verifiedAt,
          price: match.price,
        };
      }),
  }),

  appointments: router({
    create: publicProcedure
      .input(z.object({
        clientName: z.string().min(1),
        clientEmail: z.string().email(),
        clientPhone: z.string().optional(),
        appointmentDate: z.date(),
        appointmentTime: z.string(),
        serviceType: z.string().min(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const appointment = await createAppointment({
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          appointmentDate: input.appointmentDate,
          appointmentTime: input.appointmentTime,
          serviceType: input.serviceType,
          notes: input.notes,
          status: "pending",
        });
        
        // Send confirmation email to client from clinic email
        await sendAppointmentConfirmationToClient(
          input.clientName,
          input.clientEmail,
          input.appointmentDate,
          input.appointmentTime
        );
        
        // Send notification to admin
        await sendAppointmentNotification(
          "clinicanutriserpv@gmail.com",
          input.clientName,
          input.clientEmail,
          input.clientPhone,
          input.appointmentDate,
          input.appointmentTime,
          input.serviceType
        );
        
        // Notify owner
        await notifyOwner({
          title: "Nueva Cita Agendada",
          content: `Cliente: ${input.clientName}\nEmail: ${input.clientEmail}\nTeléfono: ${input.clientPhone || "No proporcionado"}\nFecha: ${input.appointmentDate.toLocaleDateString()}\nHora: ${input.appointmentTime}\nServicio: ${input.serviceType}`,
        });
        
        return appointment;
      }),
    
    list: publicProcedure.query(async () => {
      // Admin validation is done on client-side via localStorage
      // This endpoint is public but admin dashboard checks localStorage before displaying
      return await getAllAppointments();
    }),

    delete: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await deleteAppointment(input.id);
      }),

    deleteAll: publicProcedure
      .mutation(async () => {
        return await deleteAllAppointments();
      }),

    cancel: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await cancelAppointment(input.id);
      }),
  }),

  coupons: router({
    validateCoupon: publicProcedure
      .input(z.object({
        code: z.string().min(1),
      }))
      .query(async ({ input }) => {
        const coupon = await getCouponByCode(input.code.toUpperCase());
        if (!coupon) {
          return { valid: false, discount: 0 };
        }
        if (coupon.status !== "active") {
          return { valid: false, discount: 0, message: "Cupón no disponible" };
        }
        return {
          valid: true,
          discount: coupon.discountPercentage,
          couponId: coupon.id,
        };
      }),

    list: publicProcedure.query(async () => {
      return await getAllCoupons();
    }),

    approve: publicProcedure
      .input(z.object({
        couponId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // In a real app, check if user is admin
        await approveCoupon(input.couponId, 1); // adminId = 1 for now
        return { success: true };
      }),

    reject: publicProcedure
      .input(z.object({
        couponId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await rejectCoupon(input.couponId);
        return { success: true };
      }),
  }),

  giftPurchases: router({
    create: publicProcedure
      .input(z.object({
        promotionId: z.number(),
        buyerName: z.string().min(1),
        buyerEmail: z.string().email(),
        buyerPhone: z.string().optional(),
        proofData: z.string(), // base64
        proofMimeType: z.string(),
        isGift: z.boolean().default(false),
        recipientName: z.string().optional(),
        recipientContact: z.string().optional(),
        walletDiscount: z.number().optional(),
        patientEmail: z.string().email().optional(),
        promotionTitle: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // NO se genera el código aquí — se genera al aprobar (igual que paquetes/membersías)
        // Upload proof to S3
        const buffer = Buffer.from(input.proofData, 'base64');
        const fileName = `gift-proof-${Date.now()}.${input.proofMimeType.split('/')[1]}`;
        const { url } = await storagePut(`gift-proofs/${fileName}`, buffer, input.proofMimeType);

        // ── Descontar saldo del monedero INMEDIATAMENTE ──
        const walletDiscountAmt = input.walletDiscount || 0;
        if (walletDiscountAmt > 0 && input.patientEmail) {
          try {
            const patient = await getPatientByEmail(input.patientEmail);
            if (patient) {
              const wallet = await getWalletByPatientId(patient.id);
              if (wallet && wallet.isActive) {
                const toDeduct = Math.min(Math.round(walletDiscountAmt * 100), wallet.balance);
                if (toDeduct > 0) {
                  await addWalletTransaction({
                    walletId: wallet.id,
                    type: 'redeem',
                    amount: -toDeduct,
                    description: `Descuento monedero en ${input.promotionTitle || 'cupón'}`,
                    referenceType: 'gift_purchase',
                    createdBy: 'patient',
                  });
                }
              }
            }
          } catch (e) { console.warn('Wallet deduct error (gift):', e); }
        }

        const purchase = await createGiftPurchase({
          promotionId: input.promotionId,
          couponCode: '', // se asigna al aprobar
          buyerName: input.buyerName,
          buyerEmail: input.buyerEmail,
          buyerPhone: input.buyerPhone,
          proofUrl: url,
          isGift: input.isGift,
          recipientName: input.recipientName,
          recipientContact: input.recipientContact,
          status: 'pending',
          walletDiscount: walletDiscountAmt > 0 ? String(walletDiscountAmt) : undefined,
          patientEmail: input.patientEmail,
        });

        // Notify admin via Gmail (sin código aún)
        try {
          const { getAllPromotionsForAdmin } = await import('./db');
          const promos = await getAllPromotionsForAdmin();
          const promo = promos.find(p => p.id === input.promotionId);
          const promotionTitle = promo?.title ?? 'Promoción Nutriser';
          await sendCouponPurchaseNotificationToAdmin(
            ENV.gmailUser,
            input.buyerName,
            input.buyerEmail,
            input.buyerPhone,
            '(pendiente de autorización)',
            promotionTitle,
            input.isGift,
            input.recipientName
          );
        } catch (e) {
          console.error('Error sending coupon purchase notification:', e);
        }

        // Solo devolvemos el id, NO el código — el usuario verá mensaje de espera
        return { success: true, id: purchase.id };
      }),

    list: publicProcedure.query(async () => {
      return await getAllGiftPurchases();
    }),

    approve: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const purchase = await getGiftPurchaseById(input.id);
        if (!purchase) throw new Error('Compra no encontrada');

        // Generar código único AHORA al aprobar (no al crear)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const couponCode = `NUT-${part1}-${part2}`;

        await updateGiftPurchaseStatus(input.id, 'approved', couponCode);

        // Get promotion title and expiresAt
        let promotionTitle = 'Promoción Nutriser';
        let promotionExpiresAt: Date | null = null;
        try {
          const { getAllPromotionsForAdmin } = await import('./db');
          const promos = await getAllPromotionsForAdmin();
          const promo = promos.find(p => p.id === purchase.promotionId);
          if (promo) {
            promotionTitle = promo.title;
            promotionExpiresAt = promo.expiresAt ?? null;
          }
        } catch {}

        // Send email to buyer with the newly generated code
        await sendCouponApprovedEmail(
          purchase.buyerEmail,
          purchase.buyerName,
          couponCode,
          promotionTitle,
          purchase.isGift ?? false,
          purchase.recipientName ?? undefined,
          promotionExpiresAt ?? undefined
        );

        // Build WhatsApp message for admin to send manually
        const holderName = (purchase.isGift && purchase.recipientName) ? purchase.recipientName : purchase.buyerName;
        const whatsappPhone = purchase.buyerPhone?.replace(/[^0-9]/g, '') || '';
        const expiresLine = promotionExpiresAt
          ? `\n📅 Válido hasta: ${new Date(promotionExpiresAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`
          : '';
        const whatsappMsg = encodeURIComponent(
          `🎁 ¡Hola ${purchase.buyerName}! Tu cupón de Nutriser ha sido autorizado.\n\n` +
          `📋 Promoción: ${promotionTitle}\n` +
          `👤 A nombre de: ${holderName}\n` +
          `🔑 Código: ${purchase.couponCode}${expiresLine}\n\n` +
          `📞 Recuerda agendar tu cita previa al 322 450 3257\n` +
          `Preséntalo en recepción para redimirlo. ¡Te esperamos! 💛`
        );
        const whatsappUrl = whatsappPhone
          ? `https://wa.me/52${whatsappPhone}?text=${whatsappMsg}`
          : `https://wa.me/?text=${whatsappMsg}`;

        return { success: true, whatsappUrl, buyerPhone: purchase.buyerPhone };
      }),

    reject: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateGiftPurchaseStatus(input.id, 'rejected');
        return { success: true };
      }),

    markUsed: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const purchase = await getGiftPurchaseById(input.id);
        if (!purchase) throw new Error('Compra no encontrada');
        await updateGiftPurchaseStatus(input.id, 'used');
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const purchase = await getGiftPurchaseById(input.id);
        if (!purchase) throw new Error('Compra no encontrada');
        if (purchase.status !== 'used' && purchase.status !== 'rejected') {
          throw new Error('Solo se pueden eliminar cupónes usados o rechazados');
        }
        await deleteGiftPurchase(input.id);
        return { success: true };
      }),

    // Verificar cupón por correo + código (para el panel del paciente)
    lookupByEmailAndCode: publicProcedure
      .input(z.object({
        email: z.string().email(),
        code: z.string().min(1),
      }))
      .query(async ({ input }) => {
        const all = await getAllGiftPurchases();
        const match = all.find(
          p => p.buyerEmail.toLowerCase() === input.email.toLowerCase().trim()
            && p.couponCode.toUpperCase() === input.code.toUpperCase().trim()
        );
        if (!match) return { found: false };
        // Obtener el título de la promoción
        let promotionTitle = 'Cupón Nutriser';
        let promotionExpiresAt: Date | null = null;
        try {
          const { getAllPromotionsForAdmin } = await import('./db');
          const promos = await getAllPromotionsForAdmin();
          const promo = promos.find(p => p.id === match.promotionId);
          if (promo) {
            promotionTitle = promo.title;
            promotionExpiresAt = promo.expiresAt ?? null;
          }
        } catch {}
        // Determinar si está vencido
        const isExpired = promotionExpiresAt ? new Date() > new Date(promotionExpiresAt) : false;
        const displayStatus = isExpired && match.status === 'approved' ? 'expired' : match.status;
        return {
          found: true,
          couponCode: match.couponCode,
          buyerName: match.buyerName,
          promotionTitle,
          status: displayStatus,
          approvedAt: match.approvedAt,
          expiresAt: promotionExpiresAt,
          isGift: match.isGift,
          recipientName: match.recipientName,
        };
      }),
  }),

  promotions: router({
    list: publicProcedure.query(async () => {
      return await getPromotionsWithCouponCounts();
    }),

    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        price: z.string().optional(), // Precio promocional
        regularPrice: z.string().optional(), // Precio regular (para comparativa)
        imageBase64: z.string().optional(), // Imagen en base64
        imageMimeType: z.string().optional(),
        maxCoupons: z.number().int().positive().optional(), // Límite de cupones
        expiresAt: z.string().optional(), // ISO date string
      }))
      .mutation(async ({ input }) => {
        let imageUrl: string | null = null;
        if (input.imageBase64 && input.imageMimeType) {
          const buffer = Buffer.from(input.imageBase64, 'base64');
          const ext = input.imageMimeType.split('/')[1] || 'jpg';
          const key = `promo-images/promo-${Date.now()}.${ext}`;
          const result = await storagePut(key, buffer, input.imageMimeType);
          imageUrl = result.url;
        }
        const newPromo = await createPromotion({
          title: input.title,
          description: input.description,
          price: input.price ?? null,
          regularPrice: input.regularPrice ?? null,
          imageUrl,
          maxCoupons: input.maxCoupons ?? null,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          isActive: true,
        });

        // Push notifications are sent to all push subscribers (couponSubscribers concept removed)

        // Send push notification to all push subscribers
        try {
          const couponUrl = `https://nutriserpv.com/#cupon-${newPromo.id}`;
          const priceText = input.price ? ` - ${input.price}` : '';
          await sendPushNotificationToAll(
            `Nueva oferta en Nutriser: ${input.title}`,
            `${input.description || 'Aprovecha esta oferta exclusiva'}${priceText}`,
            couponUrl
          );
        } catch (e) {
          console.error('Error sending push notifications:', e);
        }

        return newPromo;
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.string().nullable().optional(),
        regularPrice: z.string().nullable().optional(),
        imageBase64: z.string().optional(),
        imageMimeType: z.string().optional(),
        maxCoupons: z.number().int().positive().nullable().optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, expiresAt, imageBase64, imageMimeType, ...rest } = input;
        const data: Record<string, unknown> = { ...rest };
        if (expiresAt !== undefined) {
          data.expiresAt = expiresAt ? new Date(expiresAt) : null;
        }
        if (imageBase64 && imageMimeType) {
          const buffer = Buffer.from(imageBase64, 'base64');
          const ext = imageMimeType.split('/')[1] || 'jpg';
          const key = `promo-images/promo-${Date.now()}.${ext}`;
          const result = await storagePut(key, buffer, imageMimeType);
          data.imageUrl = result.url;
        }
        return await updatePromotion(id, data as Parameters<typeof updatePromotion>[1]);
      }),

    delete: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await deletePromotion(input.id);
        return { success: true };
      }),

    listForAdmin: publicProcedure.query(async () => {
      return await getAllPromotionsForAdmin();
    }),
  }),

  ebook: router({
    // Obtener el ebook activo (público)
    getActive: publicProcedure.query(async () => {
      return await getActiveEbook();
    }),

    // Listar todos los ebooks (admin)
    listAll: publicProcedure.query(async () => {
      return await getAllEbooks();
    }),

    // Crear o actualizar el ebook (admin)
    upsert: publicProcedure
      .input(z.object({
        id: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        price: z.string().min(1),
        presalePrice: z.string().nullable().optional(), // Precio de pre-venta (para comparativa)
        coverBase64: z.string().optional(),
        pdfBase64: z.string().optional(),
        isActive: z.boolean().optional(),
        comingSoon: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, coverBase64, pdfBase64, ...rest } = input;
        const data: Record<string, unknown> = { ...rest };

        if (coverBase64) {
          const buf = Buffer.from(coverBase64.split(',')[1] ?? coverBase64, 'base64');
          const { url } = await storagePut(`ebooks/cover-${Date.now()}.jpg`, buf, 'image/jpeg');
          data.coverUrl = url;
        }
        if (pdfBase64) {
          const buf = Buffer.from(pdfBase64.split(',')[1] ?? pdfBase64, 'base64');
          const { url } = await storagePut(`ebooks/pdf-${Date.now()}.pdf`, buf, 'application/pdf');
          data.pdfUrl = url;
        }

        return await upsertEbook({ id, ...data } as any);
      }),

    // Comprar ebook (público)
    purchase: publicProcedure
      .input(z.object({
        ebookId: z.number(),
        buyerName: z.string().min(1),
        buyerEmail: z.string().email(),
        proofBase64: z.string().min(1),
        referredBy: z.string().optional(),
        discountCode: z.string().optional(),
        walletDiscount: z.number().optional(),
        patientEmail: z.string().email().optional(),
        ebookTitle: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { proofBase64, discountCode, walletDiscount: walletDiscountAmt = 0, patientEmail, ebookTitle, ...rest } = input;

        // ── Descontar saldo del monedero INMEDIATAMENTE ──
        if (walletDiscountAmt > 0 && patientEmail) {
          try {
            const patient = await getPatientByEmail(patientEmail);
            if (patient) {
              const wallet = await getWalletByPatientId(patient.id);
              if (wallet && wallet.isActive) {
                const toDeduct = Math.min(Math.round(walletDiscountAmt * 100), wallet.balance);
                if (toDeduct > 0) {
                  await addWalletTransaction({
                    walletId: wallet.id,
                    type: 'redeem',
                    amount: -toDeduct,
                    description: `Descuento monedero en ${ebookTitle || 'ebook'}`,
                    referenceType: 'ebook_purchase',
                    createdBy: 'patient',
                  });
                }
              }
            }
          } catch (e) { console.warn('Wallet deduct error (ebook):', e); }
        }
        
        // Validar código de descuento si se proporcionó
        let discountInfo = '';
        if (discountCode) {
          const code = await getEbookDiscountCodeByCode(discountCode);
          if (code && code.isActive) {
            discountInfo = `<p><em>Código de descuento: <strong>${discountCode}</strong> (${code.discountPercent}% off)</em></p>`;
          }
        }
        
        // Si es gratuito, no subir imagen real
        let proofUrl: string;
        if (proofBase64 === 'free_ebook_code') {
          proofUrl = 'free_ebook_code'; // Marcador especial
        } else {
          const buf = Buffer.from(proofBase64.split(',')[1] ?? proofBase64, 'base64');
          const uploaded = await storagePut(`ebooks/proof-${Date.now()}.jpg`, buf, 'image/jpeg');
          proofUrl = uploaded.url;
        }
        
        const accessToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const purchase = await createEbookPurchase({ ...rest, proofUrl, accessToken, status: 'pending' });
        // Notificar al admin
        try {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.default.createTransport({
            service: 'gmail',
            auth: { user: ENV.gmailUser, pass: ENV.gmailPassword },
          });
          const referralNote = rest.referredBy ? `<p><em>Recomendado por: <strong>${rest.referredBy}</strong></em></p>` : '';
          const freeNote = proofBase64 === 'free_ebook_code' ? '<p><strong>✅ eBook GRATUITO (código 100% descuento)</strong></p>' : '';
          await transporter.sendMail({
            from: `"Nutriser" <${ENV.gmailUser}>`,
            to: ENV.gmailUser,
            subject: `📚 Nueva compra de Ebook - ${rest.buyerName}`,
            html: `<p><strong>${rest.buyerName}</strong> (${rest.buyerEmail}) compró el ebook. Revisa el panel de administración para autorizar.</p>${referralNote}${discountInfo}${freeNote}`,
          });
        } catch (e) { console.warn('Email admin ebook error:', e); }
        return { success: true, purchaseId: purchase.id };
      }),

    // Activar un ebook específico (admin)
    setActive: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await (await import('./db')).getDb();
        if (!db) throw new Error('DB no disponible');
        const { ebooks } = await import('../drizzle/schema');
        // Desactivar todos
        await db.update(ebooks).set({ isActive: false });
        // Activar el seleccionado
        await db.update(ebooks).set({ isActive: true }).where((await import('drizzle-orm')).eq(ebooks.id, input.id));
        return { success: true };
      }),

    // Listar compras (admin)
    listPurchases: publicProcedure.query(async () => {
      return await getAllEbookPurchases();
    }),

    // Aprobar/rechazar compra (admin)
    updatePurchaseStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['approved', 'rejected']),
      }))
      .mutation(async ({ input }) => {
        if (input.status === 'approved') {
          // Generar contraseña aleatoria segura (8 caracteres alfanuméricos)
          const rawPassword = Math.random().toString(36).slice(2, 6).toUpperCase() +
            Math.random().toString(36).slice(2, 6);
          const passwordHash = await bcrypt.hash(rawPassword, 10);
          await updateEbookPurchaseStatus(input.id, input.status, passwordHash);

          // Obtener la compra para enviar email
          const purchases = await getAllEbookPurchases();
          const purchase = purchases.find(p => p.id === input.id);
          if (purchase) {
            try {
              const nodemailer = await import('nodemailer');
              const transporter = nodemailer.default.createTransport({
                service: 'gmail',
                auth: { user: ENV.gmailUser, pass: ENV.gmailPassword },
              });
              const loginUrl = `https://nutriserpv.com/ebook/login`;
              await transporter.sendMail({
                from: `"Nutriser" <${ENV.gmailUser}>`,
                to: purchase.buyerEmail,
                subject: '📚 Tu acceso al Ebook de Nutriser está listo',
                html: `
                  <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FAF7F2;padding:32px;border-radius:8px">
                    <h2 style="color:#C5A55A">¡Tu compra fue aprobada!</h2>
                    <p>Hola <strong>${purchase.buyerName}</strong>,</p>
                    <p>Tu pago fue verificado. Aquí están tus credenciales de acceso al ebook:</p>
                    <div style="background:#fff;border:1px solid #C5A55A;border-radius:8px;padding:20px;margin:16px 0">
                      <p style="margin:4px 0"><strong>Correo:</strong> ${purchase.buyerEmail}</p>
                      <p style="margin:4px 0"><strong>Contraseña:</strong> <span style="font-family:monospace;font-size:18px;color:#C5A55A">${rawPassword}</span></p>
                    </div>
                    <a href="${loginUrl}" style="display:inline-block;background:#C5A55A;color:#fff;padding:14px 28px;text-decoration:none;border-radius:4px;font-weight:bold;margin:16px 0">Acceder a mi Ebook</a>
                    <p style="color:#888;font-size:12px">Guarda estas credenciales. Son personales e intransferibles. El contenido solo puede visualizarse en línea.</p>
                    <p style="color:#888;font-size:12px">Nutriser Aesthetic &amp; Nutrition</p>
                  </div>
                `,
              });
            } catch (e) { console.warn('Email ebook access error:', e); }
          }
        } else {
          await updateEbookPurchaseStatus(input.id, input.status);
        }
        return { success: true };
      }),

    // Revocar acceso / eliminar compra de eBook (admin)
    revokeAccess: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteEbookPurchase(input.id);
        return { success: true };
      }),

    // Login con correo y contraseña para acceder al ebook
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const purchase = await getEbookPurchaseByEmail(input.email);
        if (!purchase || purchase.status !== 'approved') {
          throw new Error('Correo no encontrado o compra pendiente de aprobación');
        }
        if (!purchase.accessPasswordHash) {
          throw new Error('Credenciales no configuradas. Contacta a Nutriser.');
        }
        const isValid = await bcrypt.compare(input.password, purchase.accessPasswordHash);
        if (!isValid) {
          throw new Error('Contraseña incorrecta');
        }
        const ebook = await getActiveEbook();
        if (!ebook || !ebook.pdfUrl) throw new Error('Ebook no disponible');
        return {
          pdfUrl: ebook.pdfUrl,
          title: ebook.title,
          buyerName: purchase.buyerName,
          // Devolver token para sesión temporal
          accessToken: purchase.accessToken,
        };
      }),

    // Acceder al PDF con token (público, protegido por token) - mantenido para compatibilidad
    getAccess: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const purchase = await getEbookPurchaseByToken(input.token);
        if (!purchase || purchase.status !== 'approved') {
          throw new Error('Acceso no válido o pendiente de aprobación');
        }
        const ebook = await getActiveEbook();
        if (!ebook) throw new Error('Ebook no encontrado');
        return { pdfUrl: ebook.pdfUrl, title: ebook.title };
      }),

    // Validar código de descuento (público)
    validateDiscountCode: publicProcedure
      .input(z.object({ code: z.string().min(1) }))
      .query(async ({ input }) => {
        const discountCode = await getEbookDiscountCodeByCode(input.code);
        if (!discountCode) {
          return { valid: false, message: 'Código de descuento no encontrado' };
        }
        if (!discountCode.isActive) {
          return { valid: false, message: 'Este código de descuento no está activo' };
        }
        return {
          valid: true,
          discountPercent: discountCode.discountPercent,
          description: discountCode.description,
          isFree: discountCode.discountPercent === 100,
        };
      }),

    // Listar códigos de descuento (admin)
    listDiscountCodes: publicProcedure.query(async () => {
      return await getAllEbookDiscountCodes();
    }),

    // Activar/desactivar código de descuento (admin)
    toggleDiscountCode: publicProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        return await toggleEbookDiscountCode(input.id, input.isActive);
      }),
  }),

  // ─── Push Notificationss ─────────────────────────────────────────────────────
  push: router({
    subscribe: publicProcedure
      .input(z.object({
        endpoint: z.string().url(),
        p256dh: z.string(),
        auth: z.string(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        return await savePushSubscription(input.endpoint, input.p256dh, input.auth, input.email);
      }),

    unsubscribe: publicProcedure
      .input(z.object({ endpoint: z.string() }))
      .mutation(async ({ input }) => {
        return await deletePushSubscription(input.endpoint);
      }),

    getVapidPublicKey: publicProcedure.query(() => {
      return { publicKey: ENV.vapidPublicKey || process.env.VITE_VAPID_PUBLIC_KEY || '' };
    }),

    // Enviar notificación push de prueba (solo admin)
    sendTest: publicProcedure
      .input(z.object({
        adminPassword: z.string(),
        title: z.string().optional(),
        body: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // El admin usa contraseña hardcodeada (igual que el login del admin)
        const ADMIN_PASSWORD = 'nutriser2024';
        if (input.adminPassword !== ADMIN_PASSWORD) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Contraseña incorrecta' });
        }

        const title = input.title?.trim() || '🔔 Notificación de Prueba - Nutriser';
        const body = input.body?.trim() || 'Esta es una notificación de prueba. Si escuchas el sonido, ¡todo funciona correctamente!';

        const result = await sendPushNotificationToAll(title, body, 'https://nutriserpv.com');
        return result;
      }),

    // Contar suscriptores activos (personas únicas por email, o total si no tienen email)
    countSubscribers: publicProcedure.query(async () => {
      const subs = await getAllPushSubscriptions();
      const withEmail = subs.filter(s => s.email);
      const withoutEmail = subs.filter(s => !s.email);
      const uniqueEmails = new Set(withEmail.map(s => s.email!.toLowerCase()));
      // Personas únicas = emails únicos + dispositivos sin email
      const uniquePeople = uniqueEmails.size + withoutEmail.length;
      return { count: uniquePeople, totalDevices: subs.length };
    }),

    // Listar todas las suscripciones push con detalle (solo admin)
    listSubscriptions: publicProcedure.query(async () => {
      const subs = await getAllPushSubscriptions();
      return subs.map(sub => ({
        id: sub.id,
        email: sub.email || null,
        // Detectar tipo de dispositivo por el endpoint
        deviceType: sub.endpoint.includes('apple.com') ? 'Apple (Safari/iPhone)'
          : sub.endpoint.includes('googleapis.com') ? 'Android (Chrome)'
          : sub.endpoint.includes('mozilla.com') || sub.endpoint.includes('firefox') ? 'Firefox'
          : 'Otro',
        endpointPreview: sub.endpoint.substring(0, 50) + '...',
        createdAt: sub.createdAt,
      }));
    }),

    // Eliminar una suscripción push por ID (solo admin)
    deleteById: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Base de datos no disponible' });
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, input.id));
        return { success: true };
      }),

    // ─── APNs (Native iOS App) ─────────────────────────────────────────────

    // Register APNs device token from native iOS app
    registerAPNsToken: publicProcedure
      .input(z.object({
        deviceToken: z.string().min(10),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        return await saveAPNsToken(input.deviceToken, input.email);
      }),

    // Send push to all iOS native devices (APNs) — admin only
    sendAPNsTest: publicProcedure
      .input(z.object({
        adminPassword: z.string(),
        title: z.string().optional(),
        body: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const ADMIN_PASSWORD = 'nutriser2024';
        if (input.adminPassword !== ADMIN_PASSWORD) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Contraseña incorrecta' });
        }
        if (!isAPNsConfigured()) {
          throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'APNs no está configurado. Agrega APNS_KEY_ID, APNS_TEAM_ID y APNS_PRIVATE_KEY.' });
        }
        const title = input.title?.trim() || '🔔 Notificación de Prueba - Nutriser';
        const body = input.body?.trim() || 'Haz clic en la campanita y no te pierdas de los descuentos especiales que Nutriser tiene para ti';
        return await sendAPNsPushToAll(title, body, 'https://nutriserpv.com');
      }),

    // Check if APNs is configured
    apnsStatus: publicProcedure.query(() => {
      return { configured: isAPNsConfigured() };
    }),
  }),

  // ─── Catálogo de servicios (admin CRUD + público) ──────────────────────────
  services: router({
    // Listar todos los servicios activos (público)
    list: publicProcedure.query(async () => {
      return await getAllActiveServices();
    }),

    // Listar todos los servicios (admin)
    listAll: publicProcedure.query(async () => {
      return await getAllServices();
    }),

    // Crear servicio (admin)
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().min(1).default('general'),
        price: z.string().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }))
      .mutation(async ({ input }) => {
        return await createService(input);
      }),

    // Actualizar servicio (admin)
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        price: z.string().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateService(id, data);
      }),

    // Eliminar servicio (admin)
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteService(input.id);
      }),
  }),

  // ─── Compras de servicios ────────────────────────────────────────────────────
  servicePurchases: router({
    create: publicProcedure
      .input(z.object({
        serviceName: z.string().min(1),
        buyerName: z.string().min(1),
        buyerEmail: z.string().email(),
        buyerPhone: z.string().optional(),
        proofData: z.string(), // base64
        proofMimeType: z.string(),
        discountCode: z.string().optional(),
        discountPercent: z.number().optional(),
        originalPrice: z.string().optional(),
        walletDiscount: z.number().optional(), // Monto en pesos MXN a descontar del monedero
        patientEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        // Upload proof to S3
        const buffer = Buffer.from(input.proofData, 'base64');
        const ext = input.proofMimeType.split('/')[1] || 'jpg';
        const fileName = `service-proof-${Date.now()}.${ext}`;
        const { url } = await storagePut(`service-proofs/${fileName}`, buffer, input.proofMimeType);

        // Increment discount code usage if provided
        if (input.discountCode) {
          try { await incrementDiscountCodeUsage(input.discountCode); } catch {}
        }

        // ── Descontar saldo del monedero INMEDIATAMENTE al enviar comprobante ──
        const walletDiscountAmt = input.walletDiscount || 0;
        if (walletDiscountAmt > 0 && input.patientEmail) {
          try {
            const patient = await getPatientByEmail(input.patientEmail);
            if (patient) {
              const wallet = await getWalletByPatientId(patient.id);
              if (wallet && wallet.isActive) {
                const toDeduct = Math.min(Math.round(walletDiscountAmt * 100), wallet.balance);
                if (toDeduct > 0) {
                  await addWalletTransaction({
                    walletId: wallet.id,
                    type: 'redeem',
                    amount: -toDeduct,
                    description: `Descuento monedero en ${input.serviceName}`,
                    referenceType: 'service_purchase',
                    createdBy: 'patient',
                  });
                }
              }
            }
          } catch (e) { console.warn('Wallet deduct error (service):', e); }
        }

        // NOTE: serviceCode is NOT generated here — it is generated when admin approves
        const purchase = await createServicePurchase({
          serviceName: input.serviceName,
          buyerName: input.buyerName,
          buyerEmail: input.buyerEmail,
          buyerPhone: input.buyerPhone,
          proofUrl: url,
          serviceCode: '', // placeholder, assigned on approval
          status: 'pending',
          discountCode: input.discountCode,
          discountPercent: input.discountPercent,
          originalPrice: input.originalPrice,
          walletDiscount: walletDiscountAmt > 0 ? String(walletDiscountAmt) : undefined,
          patientEmail: input.patientEmail,
        });

        // Notify admin via email (no code yet)
        try {
          await sendServicePurchaseNotificationToAdmin(
            ENV.gmailUser,
            input.buyerName,
            input.buyerEmail,
            input.buyerPhone,
            input.serviceName,
            'PENDIENTE DE AUTORIZACIÓN'
          );
        } catch (e) {
          console.error('Error sending service purchase notification:', e);
        }

        // Return success WITHOUT the code — user must wait for admin approval
        return { success: true };
      }),

    list: publicProcedure.query(async () => {
      return await getAllServicePurchases();
    }),

    approve: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const purchases = await getAllServicePurchases();
        const purchase = purchases.find(p => p.id === input.id);
        if (!purchase) throw new Error('Compra no encontrada');

        // Generate unique service code NOW (on approval, not on creation)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const part = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const serviceCode = `NUT-SRV-${part}`;

        await updateServicePurchaseStatus(input.id, 'approved', serviceCode);

        // Add 2% cashback to patient's wallet
        try {
          const { getPatientByEmail, getWalletByPatientId, createWallet, addWalletTransaction } = await import('./db');
          const patient = await getPatientByEmail(purchase.buyerEmail);
          if (patient) {
            let wallet = await getWalletByPatientId(patient.id);
            if (!wallet) {
              wallet = await createWallet(patient.id);
            }
            // Clean the price string: remove $, MXN, spaces, commas to get a pure number
            // NOTE: purchase.originalPrice already stores the final price after discount
            // (frontend sends discountedTotal, not checkoutTotal)
            const rawPrice = String(purchase.originalPrice || '0');
            const cleanedPrice = rawPrice.replace(/[^0-9.]/g, '');
            const finalPrice = parseFloat(cleanedPrice) || 0;
            const cashbackAmount = Math.round(finalPrice * 0.02 * 100); // 2% of final price in cents
            if (cashbackAmount > 0) {
              await addWalletTransaction({
                walletId: wallet.id,
                type: 'cashback',
                amount: cashbackAmount,
                description: `Cashback 2% por compra de ${purchase.serviceName}`,
                referenceType: 'service_purchase',
                referenceId: input.id,
              });
            }
          }
        } catch (e) {
          console.warn('Error adding cashback to wallet:', e);
        }

        // Send approval email to buyer WITH the code
        try {
          await sendServicePurchaseApprovedEmail(
            purchase.buyerEmail,
            purchase.buyerName,
            purchase.serviceName,
            serviceCode
          );
        } catch (e) {
          console.error('Error sending service approval email:', e);
        }

        return { success: true };
      }),

    reject: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateServicePurchaseStatus(input.id, 'rejected');
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteServicePurchase(input.id);
      }),
    // Reintentar cashback para una compra ya aprobada (backfill)
    retryCashback: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const purchases = await getAllServicePurchases();
        const purchase = purchases.find(p => p.id === input.id);
        if (!purchase) throw new Error('Compra no encontrada');
        if (purchase.status !== 'approved') throw new Error('La compra no está aprobada');

        const { getPatientByEmail, getWalletByPatientId, createWallet, addWalletTransaction } = await import('./db');
        const patient = await getPatientByEmail(purchase.buyerEmail);
        if (!patient) throw new Error(`No se encontró paciente con email: ${purchase.buyerEmail}`);

        let wallet = await getWalletByPatientId(patient.id);
        if (!wallet) {
          wallet = await createWallet(patient.id);
        }

        // Check if cashback was already credited for this purchase
        const { getDb } = await import('./db');
        const db = await getDb();
        if (!db) throw new Error('DB no disponible');
        const { walletTransactions } = await import('../drizzle/schema');
        const { and, eq } = await import('drizzle-orm');
        const existing = await db.select().from(walletTransactions)
          .where(and(
            eq(walletTransactions.walletId, wallet.id),
            eq(walletTransactions.referenceType, 'service_purchase'),
            eq(walletTransactions.referenceId, input.id),
            eq(walletTransactions.type, 'cashback')
          ))
          .limit(1);

        if (existing.length > 0) {
          return { success: false, message: 'El cashback ya fue acreditado para esta compra' };
        }

        const rawPrice = String(purchase.originalPrice || '0');
        const cleanedPrice = rawPrice.replace(/[^0-9.]/g, '');
        const originalPrice = parseFloat(cleanedPrice) || 0;
        const cashbackAmount = Math.round(originalPrice * 0.02 * 100); // 2% in cents

        if (cashbackAmount <= 0) throw new Error('El precio no es válido para calcular cashback');

        await addWalletTransaction({
          walletId: wallet.id,
          type: 'cashback',
          amount: cashbackAmount,
          description: `Cashback 2% por compra de ${purchase.serviceName} (reintento)`,
          referenceType: 'service_purchase',
          referenceId: input.id,
        });

        return { success: true, message: `Cashback de $${(cashbackAmount / 100).toFixed(2)} MXN acreditado correctamente` };
      }),

    // Verificar servicio por email+código (paciente logueado)
    lookupByEmailAndCode: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string().min(1) }))
      .query(async ({ input }) => {
        const { lookupServiceByEmailAndCode } = await import('./db');
        const result = await lookupServiceByEmailAndCode(input.email, input.code);
        if (!result) return { found: false };
        return {
          found: true,
          serviceCode: result.serviceCode,
          buyerName: result.buyerName,
          serviceName: result.serviceName,
          status: result.status,
          approvedAt: result.approvedAt,
          originalPrice: result.originalPrice,
        };
      }),
  }),

  // ─── Products catalog ─────────────────────────────────────────────────────
  products: router({
    list: publicProcedure.query(async () => {
      return await getAllActiveProducts();
    }),
    listAll: publicProcedure.query(async () => {
      return await getAllProducts();
    }),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().min(1).default('general'),
        price: z.string().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().int().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }))
      .mutation(async ({ input }) => {
        return await createProduct(input);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        price: z.string().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().int().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateProduct(id, data);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteProduct(input.id);
      }),
    uploadImage: publicProcedure
      .input(z.object({ imageData: z.string(), mimeType: z.string() }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.imageData, 'base64');
        const ext = input.mimeType.split('/')[1] || 'jpg';
        const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { url } = await storagePut(`products/${fileName}`, buffer, input.mimeType);
        return { url };
      }),
  }),

  // ─── Product purchases ─────────────────────────────────────────────────────
  productPurchases: router({
    create: publicProcedure
      .input(z.object({
        productId: z.number(),
        productName: z.string(),
        buyerName: z.string().min(1),
        buyerEmail: z.string().email(),
        buyerPhone: z.string().optional(),
        quantity: z.number().int().min(1).default(1),
        proofData: z.string(),
        proofMimeType: z.string(),
        walletDiscount: z.number().optional(),
        patientEmail: z.string().email().optional(),
        originalPrice: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const part = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const purchaseCode = `NUT-PRD-${part}`;
        const buffer = Buffer.from(input.proofData, 'base64');
        const ext = input.proofMimeType.split('/')[1] || 'jpg';
        const fileName = `product-proof-${Date.now()}.${ext}`;
        const { url: proofUrl } = await storagePut(`product-proofs/${fileName}`, buffer, input.proofMimeType);

        // ── Descontar saldo del monedero INMEDIATAMENTE ──
        const walletDiscountAmt = input.walletDiscount || 0;
        if (walletDiscountAmt > 0 && input.patientEmail) {
          try {
            const patient = await getPatientByEmail(input.patientEmail);
            if (patient) {
              const wallet = await getWalletByPatientId(patient.id);
              if (wallet && wallet.isActive) {
                const toDeduct = Math.min(Math.round(walletDiscountAmt * 100), wallet.balance);
                if (toDeduct > 0) {
                  await addWalletTransaction({
                    walletId: wallet.id,
                    type: 'redeem',
                    amount: -toDeduct,
                    description: `Descuento monedero en ${input.productName}`,
                    referenceType: 'product_purchase',
                    createdBy: 'patient',
                  });
                }
              }
            }
          } catch (e) { console.warn('Wallet deduct error (product):', e); }
        }

        const purchase = await createProductPurchase({
          productId: input.productId,
          productName: input.productName,
          buyerName: input.buyerName,
          buyerEmail: input.buyerEmail,
          buyerPhone: input.buyerPhone,
          quantity: input.quantity,
          proofUrl,
          purchaseCode,
          status: 'pending',
          walletDiscount: walletDiscountAmt > 0 ? String(walletDiscountAmt) : undefined,
          patientEmail: input.patientEmail,
        });
        return { purchaseCode, id: purchase.id };
      }),
    listAll: publicProcedure.query(async () => {
      return await getAllProductPurchases();
    }),
    verify: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateProductPurchaseStatus(input.id, 'verified');
        return { success: true };
      }),
    reject: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateProductPurchaseStatus(input.id, 'rejected');
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteProductPurchase(input.id);
      }),
  }),
  courses: router({
    // Público: listar cursos publicados
    list: publicProcedure.query(async () => {
      return await getPublishedCourses();
    }),
    // Admin: listar todos los cursos
    listAll: publicProcedure.query(async () => {
      return await getAllCourses();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCourseById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createCourse(input);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        category: z.string().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateCourse(id, data);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCourse(input.id);
      }),
    // Videos
    getVideos: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return await getVideosByCourse(input.courseId);
      }),
    getVideoById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getVideoById(input.id);
      }),
    createVideo: publicProcedure
      .input(z.object({
        courseId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        videoUrl: z.string().min(1),
        thumbnailUrl: z.string().optional(),
        duration: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createCourseVideo(input);
      }),
    updateVideo: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        duration: z.string().optional(),
        sortOrder: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateCourseVideo(id, data);
      }),
    deleteVideo: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCourseVideo(input.id);
      }),
    // Documentos
    getDocuments: publicProcedure
      .input(z.object({ videoId: z.number() }))
      .query(async ({ input }) => {
        return await getDocumentsByVideo(input.videoId);
      }),
    createDocument: publicProcedure
      .input(z.object({
        videoId: z.number(),
        title: z.string().min(1),
        fileUrl: z.string().min(1),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createCourseDocument(input);
      }),
    deleteDocument: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCourseDocument(input.id);
      }),
    // Comentarios
    getComments: publicProcedure
      .input(z.object({ videoId: z.number() }))
      .query(async ({ input }) => {
        return await getApprovedCommentsByVideo(input.videoId);
      }),
    getPendingComments: publicProcedure.query(async () => {
      return await getPendingComments();
    }),
    getAllComments: publicProcedure.query(async () => {
      return await getAllCourseComments();
    }),
    createComment: publicProcedure
      .input(z.object({
        videoId: z.number(),
        authorName: z.string().min(1),
        authorEmail: z.string().email().optional(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        // Filtro de contenido inapropiado
        const BLOCKED_WORDS = [
          'puta', 'puto', 'pinche', 'chinga', 'chingada', 'mierda', 'cabrón', 'cabron', 'pendejo',
          'culero', 'verga', 'pene', 'vagina', 'sexo', 'porno', 'xxx', 'coger', 'follar',
          'mamar', 'mamada', 'culo', 'nalgas', 'tetas', 'pezón', 'pezon', 'desnud',
          'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cock', 'pussy', 'sex', 'porn',
        ];
        const contentLower = input.content.toLowerCase();
        const nameLower = input.authorName.toLowerCase();
        const hasInappropriate = BLOCKED_WORDS.some(w => contentLower.includes(w) || nameLower.includes(w));
        if (hasInappropriate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Tu comentario contiene contenido inapropiado y no puede ser enviado.',
          });
        }
        const comment = await createCourseComment(input);
        await notifyOwner({
          title: 'Nuevo comentario pendiente de moderación',
          content: `Video ID: ${input.videoId}\nAutor: ${input.authorName}\nComentario: ${input.content}`,
        });
        return comment;
      }),
    approveComment: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await updateCommentStatus(input.id, 'approved');
      }),
    rejectComment: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await updateCommentStatus(input.id, 'rejected');
      }),
    deleteComment: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCourseComment(input.id);
      }),
    // Suscriptores
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email().optional(),
        name: z.string().optional(),
        pushSubscription: z.string().optional(),
        notifyByEmail: z.boolean().optional(),
        notifyByPush: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createCourseSubscriber(input);
      }),
    getSubscribers: publicProcedure.query(async () => {
      return await getAllCourseSubscribers();
    }),
    deleteSubscriber: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCourseSubscriber(input.id);
      }),
    // Notificar a suscriptores cuando se sube un nuevo curso
    notifySubscribers: publicProcedure
      .input(z.object({
        courseTitle: z.string(),
        courseDescription: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const subscribers = await getAllCourseSubscribers();
        const emailSubscribers = subscribers.filter(s => s.notifyByEmail && s.email);
        // Enviar notificación al owner
        await notifyOwner({
          title: `Nuevo curso publicado: ${input.courseTitle}`,
          content: `Se notificó a ${emailSubscribers.length} suscriptores por email.`,
        });
        return { notified: emailSubscribers.length };
      }),
  }),
  beforeAfter: router({
    // Obtener todas las fotos visibles (para la página pública)
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const { beforeAfterPhotos } = await import("../drizzle/schema");
      return db.select().from(beforeAfterPhotos)
        .where(eq(beforeAfterPhotos.isVisible, true))
        .orderBy(beforeAfterPhotos.sortOrder);
    }),
    // Obtener todas las fotos (para el admin)
    listAll: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const { beforeAfterPhotos } = await import("../drizzle/schema");
      return db.select().from(beforeAfterPhotos).orderBy(beforeAfterPhotos.sortOrder);
    }),
    // Crear nueva foto (admin)
    create: publicProcedure
      .input(z.object({
        patientName: z.string().min(1),
        category: z.enum(["nutricion", "estetica", "ambos"]),
        description: z.string().optional(),
        beforeImageUrl: z.string().url(),
        afterImageUrl: z.string().url(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB not available");
        const { beforeAfterPhotos } = await import("../drizzle/schema");
        await db.insert(beforeAfterPhotos).values({
          patientName: input.patientName,
          category: input.category,
          description: input.description,
          beforeImageUrl: input.beforeImageUrl,
          afterImageUrl: input.afterImageUrl,
          isVisible: true,
          sortOrder: input.sortOrder,
        });
        return { success: true };
      }),
    // Eliminar foto (admin)
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB not available");
        const { beforeAfterPhotos } = await import("../drizzle/schema");
        await db.delete(beforeAfterPhotos).where(eq(beforeAfterPhotos.id, input.id));
        return { success: true };
      }),
    // Cambiar visibilidad (admin)
    toggleVisibility: publicProcedure
      .input(z.object({ id: z.number(), isVisible: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB not available");
        const { beforeAfterPhotos } = await import("../drizzle/schema");
        await db.update(beforeAfterPhotos)
          .set({ isVisible: input.isVisible })
          .where(eq(beforeAfterPhotos.id, input.id));
        return { success: true };
      }),
    // Editar datos de foto (admin)
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        patientName: z.string().min(1),
        category: z.enum(["nutricion", "estetica", "ambos"]),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB not available");
        const { beforeAfterPhotos } = await import("../drizzle/schema");
        await db.update(beforeAfterPhotos)
          .set({
            patientName: input.patientName,
            category: input.category,
            description: input.description ?? null,
          })
          .where(eq(beforeAfterPhotos.id, input.id));
        return { success: true };
      }),
    // Subir imagen a S3 y retornar URL
    uploadImage: publicProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const suffix = Math.random().toString(36).substring(2, 8);
        const key = `before-after/${Date.now()}-${suffix}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),
  }),
  discountCodes: router({
    validate: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const code = await validateDiscountCode(input.code);
        if (!code) return { valid: false, discount: null, isGift: false, isTwoForOne: false, description: null };
        return {
          valid: true,
          discount: code.discountPercent,
          isGift: code.isGift,
          isTwoForOne: code.isTwoForOne ?? false,
          description: code.description,
        };
      }),
    listAll: publicProcedure.query(async () => {
      return await getAllDiscountCodes();
    }),
    toggle: publicProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        return await toggleDiscountCode(input.id, input.isActive);
      }),
  }),

  // ============================================================
  // TOPIC SUGGESTIONS - Foro de sugerencias para Nutriser Academy
  // ============================================================
  suggestions: router({
    listApproved: publicProcedure.query(async () => {
      return await getApprovedSuggestions();
    }),
    listAll: publicProcedure.query(async () => {
      return await getAllSuggestions();
    }),
    listPending: publicProcedure.query(async () => {
      return await getPendingSuggestions();
    }),
    create: publicProcedure
      .input(z.object({
        title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
        description: z.string().max(1000).optional(),
        authorName: z.string().max(100).default('Anónimo'),
        authorEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        // Filtro de contenido inapropiado
        const BLOCKED_WORDS = [
          'puta', 'puto', 'pinche', 'chinga', 'chingada', 'mierda', 'cabrón', 'cabron', 'pendejo',
          'culero', 'verga', 'pene', 'vagina', 'sexo', 'porno', 'xxx', 'coger', 'follar',
          'mamar', 'mamada', 'culo', 'nalgas', 'tetas', 'pezón', 'pezon', 'desnud',
          'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cock', 'pussy', 'sex', 'porn',
        ];
        const titleLower = input.title.toLowerCase();
        const descLower = (input.description || '').toLowerCase();
        const nameLower = (input.authorName || '').toLowerCase();
        const hasInappropriate = BLOCKED_WORDS.some(w => titleLower.includes(w) || descLower.includes(w) || nameLower.includes(w));
        if (hasInappropriate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Tu sugerencia contiene contenido inapropiado y no puede ser enviada.',
          });
        }
        return await createTopicSuggestion({
          title: input.title,
          description: input.description,
          authorName: input.authorName || 'Anónimo',
          authorEmail: input.authorEmail,
          status: 'pending',
          votes: 0,
        });
      }),
    vote: publicProcedure
      .input(z.object({
        suggestionId: z.number(),
        voterFingerprint: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return await voteForSuggestion(input.suggestionId, input.voterFingerprint);
      }),
    hasVoted: publicProcedure
      .input(z.object({
        suggestionId: z.number(),
        voterFingerprint: z.string().min(1),
      }))
      .query(async ({ input }) => {
        return await hasVoted(input.suggestionId, input.voterFingerprint);
      }),
    approve: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await approveSuggestion(input.id);
      }),
    reject: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await rejectSuggestion(input.id);
      }),
    markPublished: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await markSuggestionPublished(input.id);
      }),
     delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteSuggestion(input.id);
      }),
  }),


  // ─── MÓDULO MIS TRATAMIENTOS — Pacientes Presenciales ──────────────────────────────────────────────
  patients: router({
    // Registro de nuevo paciente
    register: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().min(8),
        birthday: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const existing = await getPatientByEmail(input.email);
        if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Ya existe una cuenta con ese correo.' });
        const passwordHash = await bcrypt.hash(input.password, 10);
        const patient = await createPatientAccount({
          name: input.name,
          email: input.email,
          passwordHash,
          phone: input.phone,
          birthday: input.birthday,
        });
        // Auto-crear monedero electrónico
        try {
          await createWallet(patient.id);
        } catch (e) {
          console.warn('Could not auto-create wallet:', e);
        }
        // couponSubscribers concept removed — patients receive push notifications instead
        // Devolver sin el hash
        const { passwordHash: _, resetToken: __, ...safe } = patient;
        return safe;
      }),

    // Login de paciente
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const patient = await getPatientByEmail(input.email);
        if (!patient) throw new TRPCError({ code: 'NOT_FOUND', message: 'Correo o contraseña incorrectos.' });
        const valid = await bcrypt.compare(input.password, patient.passwordHash);
        if (!valid) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Correo o contraseña incorrectos.' });
        const { passwordHash: _, resetToken: __, ...safe } = patient;
        return safe;
      }),

    // Obtener datos del paciente por ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const patient = await getPatientById(input.id);
        if (!patient) throw new TRPCError({ code: 'NOT_FOUND', message: 'Paciente no encontrado.' });
        const { passwordHash: _, resetToken: __, ...safe } = patient;
        return safe;
      }),

    // Listar todos los pacientes (admin)
    listAll: publicProcedure.query(async () => {
      const patients = await getAllPatients();
      return patients.map(({ passwordHash: _, resetToken: __, ...safe }) => safe);
    }),

    // Guardar consentimiento firmado
    saveConsent: publicProcedure
      .input(z.object({
        patientId: z.number(),
        signature: z.string(), // base64 de la imagen de la firma
        patientName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Generar PDF con pdfkit en el servidor
        const PDFDocument = (await import('pdfkit')).default;
        const patient = await getPatientById(input.patientId);
        const patientName = input.patientName || patient?.name || 'Paciente';
        
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        
        await new Promise<void>((resolve) => {
          doc.on('end', resolve);
          
          // Encabezado
          doc.fontSize(20).font('Helvetica-Bold').text('NUTRISER AESTHETIC & NUTRITION', { align: 'center' });
          doc.fontSize(14).font('Helvetica').text('Consentimiento Informado', { align: 'center' });
          doc.moveDown();
          doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'right' });
          doc.moveDown();
          
          // Datos del paciente
          doc.fontSize(12).font('Helvetica-Bold').text('Datos del Paciente:');
          doc.fontSize(11).font('Helvetica').text(`Nombre: ${patientName}`);
          if (patient?.email) doc.text(`Email: ${patient.email}`);
          if (patient?.phone) doc.text(`Teléfono: ${patient.phone}`);
          doc.moveDown();
          
          // Nota legal
          doc.fontSize(8).font('Helvetica').fillColor('#555555').text(
            'Documento elaborado en cumplimiento de la NOM-004-SSA3-2012 del Expediente Clínico, el Artículo 51 Bis 2 de la Ley General de Salud, y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).',
            { align: 'justify' }
          );
          doc.fillColor('#000000');
          doc.moveDown();

          // I. Identificación de las partes
          doc.fontSize(11).font('Helvetica-Bold').text('I. IDENTIFICACIÓN DE LAS PARTES');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(
            'PRESTADOR DEL SERVICIO: Nutriser Aesthetic & Nutrition, establecimiento de salud y bienestar estético. Tel: +52 (322) 100-7799. Correo: clinicanutriserpv@gmail.com.',
            { align: 'justify' }
          );
          doc.moveDown(0.5);
          doc.fontSize(10).font('Helvetica').text(
            'PACIENTE: El/la suscrito/a, cuyos datos personales constan en el expediente clínico del establecimiento, y cuya firma al calce del presente documento acredita su identidad y conformidad.',
            { align: 'justify' }
          );
          doc.moveDown();

          // II. Acto médico autorizado
          doc.fontSize(11).font('Helvetica-Bold').text('II. ACTO MÉDICO AUTORIZADO');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(
            'El presente consentimiento ampara la realización de tratamientos estéticos no invasivos y/o mínimamente invasivos, así como asesorías y planes nutricionales personalizados, que pueden incluir según el caso clínico: cavitación ultrasónica, radiofrecuencia corporal y facial, mesoterapia reductora, tratamientos para estrías, cicatrices de acné, celulitis e hiperpigmentación, asesoría nutricional personalizada, y otros procedimientos estéticos no invasivos indicados por el profesional tratante. El tratamiento específico será informado verbalmente y por escrito antes de cada sesión.',
            { align: 'justify' }
          );
          doc.moveDown();

          // III. Objetivos y beneficios
          doc.fontSize(11).font('Helvetica-Bold').text('III. OBJETIVOS Y BENEFICIOS ESPERADOS');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(
            'Los tratamientos tienen como objetivo la mejoría estética y el bienestar del paciente. Los resultados pueden variar según las características individuales (tipo de piel, metabolismo, edad, condición física y adherencia a las indicaciones). Nutriser NO garantiza resultados específicos, sino una mejoría progresiva y proporcional al seguimiento del plan indicado.',
            { align: 'justify' }
          );
          doc.moveDown();

          // IV. Riesgos
          doc.fontSize(11).font('Helvetica-Bold').text('IV. RIESGOS Y POSIBLES COMPLICACIONES');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(
            'Riesgos frecuentes (leves y transitorios): enrojecimiento, inflamación o sensibilidad en la zona tratada, hematomas o equimosis temporales, sensación de calor o molestia durante el procedimiento, cambios temporales en la pigmentación.\n\nRiesgos infrecuentes (que requieren atención médica): reacciones alérgicas a los productos utilizados, infección en el sitio de aplicación en procedimientos con microinyecciones, quemaduras superficiales por mal manejo de equipos térmicos, irregularidades en el contorno corporal.\n\nEl paciente declara haber informado al equipo sobre todas sus condiciones médicas preexistentes, alergias conocidas, medicamentos en uso, embarazo o lactancia. La omisión de esta información exime de responsabilidad al establecimiento.',
            { align: 'justify' }
          );
          doc.moveDown();

          // V. Alternativas
          doc.fontSize(11).font('Helvetica-Bold').text('V. ALTERNATIVAS AL TRATAMIENTO');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(
            'El paciente ha sido informado de que existen alternativas a los procedimientos propuestos, incluyendo tratamientos quirúrgicos, otros procedimientos no invasivos, o la opción de no realizar ningún tratamiento. La elección del tratamiento ha sido libre y voluntaria.',
            { align: 'justify' }
          );
          doc.moveDown();

          // VI. Cuidados post-tratamiento
          doc.fontSize(11).font('Helvetica-Bold').text('VI. CUIDADOS POST-TRATAMIENTO');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(
            'El paciente se compromete a: evitar exposición solar directa en las zonas tratadas, aplicar los productos recomendados, mantener hidratación adecuada y seguir el plan nutricional asignado, evitar actividad física intensa durante las primeras horas post-sesión, y reportar de inmediato cualquier reacción adversa inusual. El incumplimiento exime al establecimiento de responsabilidad por complicaciones derivadas de dicho incumplimiento.',
            { align: 'justify' }
          );
          doc.moveDown();

          // VII. Autorización para contingencias
          doc.fontSize(11).font('Helvetica-Bold').text('VII. AUTORIZACIÓN PARA CONTINGENCIAS');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(
            'El paciente autoriza al personal de salud de Nutriser Aesthetic & Nutrition para atender cualquier contingencia o urgencia derivada del acto médico autorizado, de conformidad con el principio de libertad prescriptiva establecido en la NOM-004-SSA3-2012.',
            { align: 'justify' }
          );
          doc.moveDown();

          // VIII. Protección de datos
          doc.fontSize(11).font('Helvetica-Bold').text('VIII. PROTECCIÓN DE DATOS PERSONALES (LFPDPPP)');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(
            'Los datos personales del paciente (nombre, correo, teléfono, fotografías y expediente clínico) serán tratados únicamente para prestar los servicios contratados y llevar el seguimiento del tratamiento. No serán compartidos con terceros sin consentimiento expreso, salvo obligación legal. El paciente puede ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) enviando solicitud a clinicanutriserpv@gmail.com. Las fotografías de antes/después solo podrán usarse con fines promocionales con autorización expresa por escrito.',
            { align: 'justify' }
          );
          doc.moveDown();

          // IX. Derecho de revocación
          doc.fontSize(11).font('Helvetica-Bold').text('IX. DERECHO DE REVOCACIÓN');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(
            'El paciente tiene el derecho de revocar el presente consentimiento en cualquier momento antes del inicio del procedimiento, sin necesidad de expresar causa alguna y sin que ello afecte la calidad de la atención que recibirá.',
            { align: 'justify' }
          );
          doc.moveDown();

          // X. Declaración de consentimiento
          doc.fontSize(11).font('Helvetica-Bold').text('X. DECLARACIÓN DE CONSENTIMIENTO');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text(
            'Yo, el/la paciente que suscribe el presente documento, declaro bajo protesta de decir verdad que:\n\n' +
            '1. He recibido información clara, completa, veraz y oportuna sobre los tratamientos, sus objetivos, riesgos, beneficios y alternativas.\n' +
            '2. He tenido la oportunidad de realizar todas las preguntas que consideré necesarias y estas fueron respondidas satisfactoriamente.\n' +
            '3. Comprendo que los resultados pueden variar según mis características individuales y mi adherencia a las indicaciones.\n' +
            '4. Otorgo mi consentimiento de manera libre, voluntaria y sin coacción alguna para la realización de los tratamientos indicados.\n' +
            '5. He informado verazmente sobre mi estado de salud, antecedentes médicos, alergias y medicamentos en uso.\n' +
            '6. He leído íntegramente el presente documento y acepto todas sus cláusulas.\n\n' +
            'Este documento tiene plena validez legal conforme a los artículos 1803 y 1834 del Código Civil Federal, el artículo 51 Bis 2 de la Ley General de Salud, y la NOM-004-SSA3-2012.',
            { align: 'justify' }
          );
          doc.moveDown(2);
          
          // Firma
          doc.fontSize(12).font('Helvetica-Bold').text('Firma del Paciente:');
          doc.moveDown(0.5);
          
          // Insertar imagen de la firma si existe
          if (input.signature && input.signature.startsWith('data:image')) {
            try {
              const sigBase64 = input.signature.split(',')[1];
              const sigBuffer = Buffer.from(sigBase64, 'base64');
              doc.image(sigBuffer, { width: 200, height: 80 });
            } catch (e) {
              doc.text('[Firma digital adjunta]');
            }
          }
          
          doc.moveDown();
          doc.fontSize(10).font('Helvetica').text(`Nombre: ${patientName}`);
          doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`);
          
          doc.end();
        });
        
        const pdfBuffer = Buffer.concat(chunks);
        const fileKey = `patient-consents/${input.patientId}-consent-${Date.now()}.pdf`;
        const { url } = await storagePut(fileKey, pdfBuffer, 'application/pdf');
        await updatePatientConsent(input.patientId, input.signature, url);
        return { success: true, pdfUrl: url };
      }),

    // Eliminar cuenta de paciente (admin)
    deleteAccount: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deletePatientAccount(input.id);
      }),

    // Solicitar reset de contraseña
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email(), origin: z.string() }))
      .mutation(async ({ input }) => {
        const patient = await getPatientByEmail(input.email);
        if (!patient) return { success: true }; // No revelar si existe
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await setPatientResetToken(input.email, token, expiresAt);
        const resetLink = `${input.origin}/mis-tratamientos/reset-password?token=${token}`;
        await sendPasswordResetEmail(input.email, resetLink);
        return { success: true };
      }),

    // Restablecer contraseña
    resetPassword: publicProcedure
      .input(z.object({ token: z.string(), newPassword: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const patient = await getPatientByResetToken(input.token);
        if (!patient) throw new TRPCError({ code: 'NOT_FOUND', message: 'Token inválido o expirado.' });
        if (!patient.resetTokenExpiresAt || new Date() > patient.resetTokenExpiresAt) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'El enlace ha expirado. Solicita uno nuevo.' });
        }
        const hash = await bcrypt.hash(input.newPassword, 10);
        await updatePatientPassword(patient.id, hash);
        return { success: true };
      }),

    // Guardar suscripción push del paciente
    savePush: publicProcedure
      .input(z.object({ patientId: z.number(), pushSubscription: z.string().nullable() }))
      .mutation(async ({ input }) => {
        await updatePatientPushSubscription(input.patientId, input.pushSubscription);
        return { success: true };
      }),

    // ─── Tratamientos (admin asigna) ───
    addTreatment: publicProcedure
      .input(z.object({
        patientId: z.number(),
        serviceName: z.string().min(1),
        totalSessions: z.number().min(1).default(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createPatientTreatment({
          patientId: input.patientId,
          serviceName: input.serviceName,
          totalSessions: input.totalSessions,
          notes: input.notes,
        });
        // Enviar push al paciente si tiene suscripción activa
        try {
          const patient = await getPatientById(input.patientId);
          if (patient?.pushSubscription) {
            await sendPushToPatient(
              patient.pushSubscription,
              '🌿 Nuevo tratamiento asignado',
              `Se te ha asignado el tratamiento: ${input.serviceName}. Entra a tu portal para ver los detalles.`,
              '/mis-tratamientos'
            );
          }
        } catch (e) {
          console.warn('[Push] Error enviando push de tratamiento:', e);
        }
        return result;
      }),

    updateTreatment: publicProcedure
      .input(z.object({
        id: z.number(),
        serviceName: z.string().optional(),
        totalSessions: z.number().optional(),
        completedSessions: z.number().optional(),
        status: z.enum(['pending', 'in_progress', 'completed']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const result = await updatePatientTreatment(id, data);
        // Enviar push al paciente cuando el tratamiento se marca como completado
        if (input.status === 'completed' && result?.patientId) {
          try {
            const patient = await getPatientById(result.patientId);
            if (patient?.pushSubscription) {
              await sendPushToPatient(
                patient.pushSubscription,
                '✅ ¡Tratamiento completado!',
                `Tu tratamiento "${result.serviceName}" ha sido completado. ¡Felicidades por tu progreso en Nutriser!`,
                '/mis-tratamientos'
              );
            }
          } catch (e) {
            console.warn('[Push] Error enviando push de tratamiento completado:', e);
          }
        }
        return result;
      }),

    deleteTreatment: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deletePatientTreatment(input.id);
      }),

    getTreatments: publicProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await getPatientTreatments(input.patientId);
      }),

    // ─── Citas (admin asigna) ───
    addAppointment: publicProcedure
      .input(z.object({
        patientId: z.number(),
        treatmentId: z.number(),
        appointmentDate: z.string(),
        appointmentTime: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createPatientAppointment(input);
        // Enviar push al paciente si tiene suscripción activa
        try {
          const patient = await getPatientById(input.patientId);
          if (patient?.pushSubscription) {
            await sendPushToPatient(
              patient.pushSubscription,
              '📅 Nueva cita agendada',
              `Tienes una cita programada para el ${input.appointmentDate} a las ${input.appointmentTime}. ¡Te esperamos en Nutriser!`,
              '/mis-tratamientos'
            );
          }
        } catch (e) {
          console.warn('[Push] Error enviando push de cita:', e);
        }
        return result;
      }),

    updateAppointment: publicProcedure
      .input(z.object({
        id: z.number(),
        appointmentDate: z.string().optional(),
        appointmentTime: z.string().optional(),
        status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updatePatientAppointment(id, data);
      }),

    deleteAppointment: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deletePatientAppointment(input.id);
      }),

    getAppointments: publicProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await getPatientAppointments(input.patientId);
      }),

    // ─── Fotos antes/después (admin sube) ───
    addPhoto: publicProcedure
      .input(z.object({
        patientId: z.number(),
        treatmentId: z.number().optional(),
        type: z.enum(['before', 'after', 'progress']),
        photoData: z.string(), // base64
        photoDate: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const base64Data = input.photoData.split(',')[1] || input.photoData;
        const buffer = Buffer.from(base64Data, 'base64');
        const fileKey = `patient-photos/${input.patientId}-${input.type}-${Date.now()}.jpg`;
        const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
        return await createPatientPhoto({
          patientId: input.patientId,
          treatmentId: input.treatmentId,
          type: input.type,
          photoUrl: url,
          photoDate: input.photoDate,
          notes: input.notes,
        });
      }),

    deletePhoto: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deletePatientPhoto(input.id);
      }),

    getPhotos: publicProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await getPatientPhotos(input.patientId);
      }),

    // Enviar notificación push a todos los pacientes (admin)
    notifyAllPatients: publicProcedure
      .input(z.object({ title: z.string(), body: z.string() }))
      .mutation(async ({ input }) => {
        const result = await sendPushNotificationToAll(input.title, input.body, '/');
        return { success: true, sent: result.sent };
      }),

    // Enviar email a todos los pacientes (admin)
    emailAllPatients: publicProcedure
      .input(z.object({ subject: z.string(), message: z.string() }))
      .mutation(async ({ input }) => {
        const patients = await getAllPatients();
        let sent = 0;
        for (const patient of patients) {
          try {
            await sendPatientNotificationEmail(
              patient.email,
              input.subject || 'Mensaje de Nutriser Aesthetic & Nutrition',
              input.subject || 'Mensaje de Nutriser',
              input.message
            );
            sent++;
          } catch {}
        }
        return { success: true, sent };
      }),
    // Notificar push a un paciente específico (admin)
    notifyOnePatient: publicProcedure
      .input(z.object({ patientId: z.number(), title: z.string(), body: z.string() }))
      .mutation(async ({ input }) => {
        const patient = await getPatientById(input.patientId);
        if (!patient?.pushSubscription) return { success: false, reason: 'no_subscription' };
        try {
          await sendPushToPatient(patient.pushSubscription, input.title, input.body, '/mis-tratamientos');
          return { success: true };
        } catch (e) {
          console.warn('[Push] Error notifyOnePatient:', e);
          return { success: false, reason: 'send_failed' };
        }
      }),
    // Enviar email a un paciente específico (admin)
    emailOnePatient: publicProcedure
      .input(z.object({ patientId: z.number(), subject: z.string(), message: z.string() }))
      .mutation(async ({ input }) => {
        const patient = await getPatientById(input.patientId);
        if (!patient?.email) return { success: false, reason: 'no_email' };
        await sendPatientNotificationEmail(
          patient.email,
          input.subject || 'Mensaje de Nutriser',
          input.subject || 'Mensaje de Nutriser',
          input.message
        );
        return { success: true };
      }),
    // Obtener paquetes (memberships) vinculados al email del paciente (admin)
    getPackagesByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const { getMembershipsByEmail } = await import('./db');
        return await getMembershipsByEmail(input.email);
      }),
    // Obtener cupones comprados vinculados al email del paciente (admin)
    getCouponsByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const { getGiftPurchasesByEmail } = await import('./db');
        const purchases = await getGiftPurchasesByEmail(input.email);
        // Enriquecer con el título de la promoción
        const { getAllPromotionsForAdmin } = await import('./db');
        const promos = await getAllPromotionsForAdmin();
        return purchases.map(p => ({
          ...p,
          promotionTitle: promos.find((pr: any) => pr.id === p.promotionId)?.title ?? 'Promoción',
        }));
      }),
    // Obtener servicios comprados vinculados al email del paciente (admin)
    getServicesByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const { getServicePurchasesByEmail } = await import('./db');
        return await getServicePurchasesByEmail(input.email);
      }),
    // Verificar servicio por email+código (paciente logueado)
    lookupServiceByCode: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string().min(1) }))
      .query(async ({ input }) => {
        const { lookupServiceByEmailAndCode } = await import('./db');
        return await lookupServiceByEmailAndCode(input.email, input.code);
      }),
    // Obtener TODAS las compras del paciente por email (servicios + cupones + paquetes + productos + ebooks + pagos en clínica)
    getMyPurchases: publicProcedure
      .input(z.object({ email: z.string().email(), patientId: z.number().optional() }))
      .query(async ({ input }) => {
        const {
          getMembershipsByEmail,
          getGiftPurchasesByEmail,
          getServicePurchasesByEmail,
          getAllPromotionsForAdmin,
          getConfirmedCashPaymentsByPatient,
        } = await import('./db');

        // Helpers inline para productPurchases y ebookPurchases por email
        const { getDb } = await import('./db');
        const { productPurchases, ebookPurchases, ebooks } = await import('../drizzle/schema');
        const { eq, or, desc } = await import('drizzle-orm');
        const db = await getDb();

        const emailLower = input.email.toLowerCase().trim();

        const [membershipsData, giftPurchasesData, servicePurchasesData, promos, cashPayments] = await Promise.all([
          getMembershipsByEmail(emailLower),
          getGiftPurchasesByEmail(emailLower),
          getServicePurchasesByEmail(emailLower),
          getAllPromotionsForAdmin(),
          input.patientId ? getConfirmedCashPaymentsByPatient(input.patientId) : Promise.resolve([]),
        ]);

        // Productos comprados (por buyerEmail o patientEmail)
        const productsData = db ? await db.select().from(productPurchases)
          .where(or(eq(productPurchases.buyerEmail, emailLower), eq(productPurchases.patientEmail, emailLower)))
          .orderBy(desc(productPurchases.createdAt)) : [];

        // Ebooks comprados (por buyerEmail o patientEmail)
        const ebooksData = db ? await db.select({
          id: ebookPurchases.id,
          ebookId: ebookPurchases.ebookId,
          buyerName: ebookPurchases.buyerName,
          buyerEmail: ebookPurchases.buyerEmail,
          patientEmail: ebookPurchases.patientEmail,
          status: ebookPurchases.status,
          accessToken: ebookPurchases.accessToken,
          walletDiscount: ebookPurchases.walletDiscount,
          createdAt: ebookPurchases.createdAt,
          ebookTitle: ebooks.title,
          ebookPrice: ebooks.price,
          ebookImageUrl: ebooks.coverUrl,
        }).from(ebookPurchases)
          .leftJoin(ebooks, eq(ebookPurchases.ebookId, ebooks.id))
          .where(or(eq(ebookPurchases.buyerEmail, emailLower), eq(ebookPurchases.patientEmail, emailLower)))
          .orderBy(desc(ebookPurchases.createdAt)) : [];

        // Memberships también por patientEmail (para pagos en clínica registrados por admin)
        const membershipsByPatientEmail = db ? await db.select().from(
          (await import('../drizzle/schema')).memberships
        ).where(eq((await import('../drizzle/schema')).memberships.patientEmail, emailLower))
          .orderBy(desc((await import('../drizzle/schema')).memberships.createdAt)) : [];

        // Combinar memberships evitando duplicados por id
        const allMembershipsMap = new Map();
        [...membershipsData, ...membershipsByPatientEmail].forEach((m: any) => allMembershipsMap.set(m.id, m));
        const allMemberships = Array.from(allMembershipsMap.values());

        return {
          packages: allMemberships,
          coupons: giftPurchasesData.map((p: any) => ({
            ...p,
            promotionTitle: (promos as any[]).find((pr: any) => pr.id === p.promotionId)?.title ?? 'Promoción',
          })),
          services: servicePurchasesData,
          products: productsData,
          ebooks: ebooksData,
          cashPayments: cashPayments.map((cp: any) => ({
            id: cp.id,
            concept: cp.concept,
            itemType: cp.itemType,
            amountCents: cp.amountCents,
            status: cp.status,
            confirmedAt: cp.confirmedAt,
            createdAt: cp.createdAt,
          })),
        };
      }),
  }),
  // ══════════════════════════════════════════════════════════════════════
  // CARRITO PERSISTENTE — Nutriser Shop
  // ══════════════════════════════════════════════════════════════════════
  cart: router({
    // Obtener items del carrito del paciente
    getItems: publicProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        const { getCartItemsByPatient } = await import('./db');
        return await getCartItemsByPatient(input.patientId);
      }),
    // Agregar o actualizar item en el carrito
    upsertItem: publicProcedure
      .input(z.object({
        patientId: z.number(),
        itemKey: z.string(),
        itemType: z.enum(['service', 'product', 'ebook', 'package']),
        name: z.string(),
        price: z.number(),
        priceLabel: z.string().optional(),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
        qty: z.number().min(1).default(1),
        serviceId: z.number().optional(),
        productId: z.number().optional(),
        ebookId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { upsertCartItem } = await import('./db');
        const { patientId, ...data } = input;
        await upsertCartItem(patientId, data as any);
        return { success: true };
      }),
    // Eliminar item del carrito
    removeItem: publicProcedure
      .input(z.object({ patientId: z.number(), itemKey: z.string() }))
      .mutation(async ({ input }) => {
        const { removeCartItem } = await import('./db');
        await removeCartItem(input.patientId, input.itemKey);
        return { success: true };
      }),
    // Vaciar carrito completo
    clearCart: publicProcedure
      .input(z.object({ patientId: z.number() }))
      .mutation(async ({ input }) => {
        const { clearCart } = await import('./db');
        await clearCart(input.patientId);
        return { success: true };
      }),
  }),

  // ============================================================
  // MONEDERO ELECTRÓNICO NUTRISER
  // ============================================================
  wallet: router({
    // Obtener monedero del paciente (requiere login)
    getMyWallet: publicProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        const wallet = await getWalletByPatientId(input.patientId);
        if (!wallet) {
          // Auto-crear si no existe
          const newWallet = await createWallet(input.patientId);
          const tracker = await getLoyaltyTracker(newWallet.id);
          const progress = await getWalletLoyaltyProgress(newWallet.id);
          return { wallet: newWallet, tracker, progress, transactions: [] };
        }
        const [tracker, progress, transactions] = await Promise.all([
          getLoyaltyTracker(wallet.id),
          getWalletLoyaltyProgress(wallet.id),
          getWalletTransactions(wallet.id, 50),
        ]);
        return { wallet, tracker, progress, transactions };
      }),

    // Buscar monedero por número (para QR público — requiere login después)
    lookupByNumber: publicProcedure
      .input(z.object({ walletNumber: z.string() }))
      .query(async ({ input }) => {
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Tarjeta no encontrada' });
        const patient = await getPatientById(wallet.patientId);
        return {
          walletNumber: wallet.walletNumber,
          patientName: patient?.name || 'Usuario',
          isActive: wallet.isActive,
        };
      }),

    // Obtener saldo por número de tarjeta (para checkout)
    getBalanceByCode: publicProcedure
      .input(z.object({ walletNumber: z.string(), patientId: z.number() }))
      .query(async ({ input }) => {
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Tarjeta no encontrada' });
        if (wallet.patientId !== input.patientId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Esta tarjeta no te pertenece' });
        }
        if (!wallet.isActive) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Tarjeta desactivada' });
        }
        return { balance: wallet.balance, walletId: wallet.id };
      }),

    // Canjear saldo del monedero en una compra
    redeem: publicProcedure
      .input(z.object({
        patientId: z.number(),
        amount: z.number().min(1), // centavos a descontar
        description: z.string(),
        referenceType: z.string().optional(),
        referenceId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const wallet = await getWalletByPatientId(input.patientId);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'No tienes monedero activo' });
        if (!wallet.isActive) throw new TRPCError({ code: 'FORBIDDEN', message: 'Tarjeta desactivada' });
        if (wallet.balance < input.amount) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Saldo insuficiente' });
        
        const txn = await addWalletTransaction({
          walletId: wallet.id,
          type: 'redeem',
          amount: -input.amount,
          description: input.description,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          createdBy: 'system',
        });
        return { success: true, newBalance: txn.balanceAfter, transaction: txn };
      }),

    // Obtener planes de lealtad activos
    getActivePlans: publicProcedure.query(async () => {
      return getActiveLoyaltyPlans();
    }),

    // Obtener historial de transacciones
    getTransactions: publicProcedure
      .input(z.object({ patientId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        const wallet = await getWalletByPatientId(input.patientId);
        if (!wallet) return [];
        return getWalletTransactions(wallet.id, input.limit || 50);
      }),

    // ===== ADMIN ENDPOINTS =====

       // Listar todas las tarjetas (admin)
    adminListAll: publicProcedure.query(async () => {
      const rows = await getAllWallets();
      // Flatten nested { wallet, patient, tracker, progress } structure
      return rows.map((row: any) => {
        const w = row.wallet ?? row;
        const p = row.patient ?? {};
        const t = row.tracker ?? {}; // loyaltyTracker real
        const prog = row.progress ?? []; // loyaltyProgress array
        // Calcular consultas en ciclo actual (cada 3 consultas = 1 gratis)
        const totalConsultations = t.nutritionConsultations ?? 0;
        const consultationsInCycle = totalConsultations % 3; // posición en el ciclo actual
        return {
          id: w.id,
          patientId: w.patientId,
          walletNumber: w.walletNumber,
          balance: w.balance ?? 0,
          totalCashback: w.totalCashback ?? 0,
          totalRedeemed: w.totalRedeemed ?? 0,
          isActive: w.isActive,
          status: w.isActive ? 'active' : 'suspended',
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
          patientName: p.name ?? w.patientName ?? null,
          patientEmail: p.email ?? w.patientEmail ?? null,
          patientPhone: p.phone ?? w.patientPhone ?? null,
          consultationsInCycle,
          totalConsultations,
          freeConsultationsEarned: t.freeConsultationsEarned ?? 0,
          freeConsultationsUsed: t.freeConsultationsUsed ?? 0,
          freeConsultationsAvailable: (t.freeConsultationsEarned ?? 0) - (t.freeConsultationsUsed ?? 0),
          totalCredited: w.totalCashback ?? 0,
          loyaltyProgress: prog, // progreso en planes de lealtad por producto
          discountPercent: w.discountPercent ?? null,
        };
      });
    }),
    // Acreditar cashback (admin))
    adminAddCashback: publicProcedure
      .input(z.object({
        walletId: z.number(),
        amount: z.number().min(1), // centavos
        description: z.string(),
        referenceType: z.string().optional(),
        referenceId: z.number().optional(),
        adminPassword: z.string(),
      }))
      .mutation(async ({ input }) => {
        const ADMIN_PASSWORD = 'nutriser2024';
        if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Palabra clave incorrecta' });
        const walletCheck = await getWalletById(input.walletId);
        if (!walletCheck) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        if (!walletCheck.isActive) throw new TRPCError({ code: 'FORBIDDEN', message: 'Este monedero está dado de baja. Reactívalo antes de operar.' });
        const txn = await addWalletTransaction({
          walletId: input.walletId,
          type: 'cashback',
          amount: input.amount,
          description: input.description,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          createdBy: 'admin',
        });
        return { success: true, transaction: txn };
      }),

    // Bonificación manual (admin)
    adminAddBonus: publicProcedure
      .input(z.object({
        walletId: z.number(),
        amount: z.number(), // puede ser positivo o negativo
        description: z.string(),
        adminPassword: z.string(),
      }))
      .mutation(async ({ input }) => {
        const ADMIN_PASSWORD = 'nutriser2024';
        if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Palabra clave incorrecta' });
        const walletCheck = await getWalletById(input.walletId);
        if (!walletCheck) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        if (!walletCheck.isActive) throw new TRPCError({ code: 'FORBIDDEN', message: 'Este monedero está dado de baja. Reactívalo antes de operar.' });
        const txn = await addWalletTransaction({
          walletId: input.walletId,
          type: input.amount >= 0 ? 'bonus' : 'adjustment',
          amount: input.amount,
          description: input.description,
          createdBy: 'admin',
        });
        return { success: true, transaction: txn };
      }),

    // Ajustar saldo directamente (admin)
    adminSetBalance: publicProcedure
      .input(z.object({
        walletId: z.number(),
        newBalance: z.number().min(0),
        adminEmail: z.string(),
      }))
      .mutation(async ({ input }) => {
        await adminSetWalletBalance(input.walletId, input.newBalance, input.adminEmail);
        return { success: true };
      }),

    // Activar/desactivar tarjeta (admin)
    adminToggleActive: publicProcedure
      .input(z.object({ walletId: z.number() }))
      .mutation(async ({ input }) => {
        const newStatus = await toggleWalletActive(input.walletId);
        return { success: true, isActive: newStatus };
      }),

    // Admin: obtener transacciones de un monedero por walletId
    adminGetTransactions: publicProcedure
      .input(z.object({ walletId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getWalletTransactions(input.walletId, input.limit || 100);
      }),
    // Admin: eliminar una transacción específica del historial
    adminDeleteTransaction: publicProcedure
      .input(z.object({ transactionId: z.number() }))
      .mutation(async ({ input }) => {
        const result = await deleteWalletTransaction(input.transactionId);
        return { success: true, deleted: result.deleted };
      }),
    // Admin: limpiar todos los movimientos del historial de un monedero
    adminClearAllTransactions: publicProcedure
      .input(z.object({ walletId: z.number() }))
      .mutation(async ({ input }) => {
        const result = await clearAllWalletTransactions(input.walletId);
        return { success: true, deleted: result.deleted };
      }),
     // Registrar consulta nutricional (admin)
    adminRecordConsultation: publicProcedure
      .input(z.object({ walletId: z.number() }))
      .mutation(async ({ input }) => {
        const walletCheck = await getWalletById(input.walletId);
        if (!walletCheck) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        if (!walletCheck.isActive) throw new TRPCError({ code: 'FORBIDDEN', message: 'Este monedero está dado de baja. Reactívalo antes de operar.' });
        return recordConsultation(input.walletId);
      }),
    // Usar consulta gratis (admin)
    adminUseFreeConsultation: publicProcedure
      .input(z.object({ walletId: z.number() }))
      .mutation(async ({ input }) => {
        const walletCheck = await getWalletById(input.walletId);
        if (!walletCheck) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        if (!walletCheck.isActive) throw new TRPCError({ code: 'FORBIDDEN', message: 'Este monedero está dado de baja. Reactívalo antes de operar.' });
        const used = await useFreeConsultation(input.walletId);
        if (!used) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No hay consultas gratis disponibles' });
        return { success: true };
      }),

     // Registrar compra para plan de lealtad (admin)
    adminRecordLoyaltyPurchase: publicProcedure
      .input(z.object({ walletId: z.number(), planId: z.number() }))
      .mutation(async ({ input }) => {
        const walletCheck = await getWalletById(input.walletId);
        if (!walletCheck) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        if (!walletCheck.isActive) throw new TRPCError({ code: 'FORBIDDEN', message: 'Este monedero está dado de baja. Reactívalo antes de operar.' });
        return recordLoyaltyPurchase(input.walletId, input.planId);
      }),
    // Usar recompensa de lealtad (admin)
    adminUseLoyaltyReward: publicProcedure
      .input(z.object({ walletId: z.number(), planId: z.number() }))
      .mutation(async ({ input }) => {
        const used = await useLoyaltyReward(input.walletId, input.planId);
        if (!used) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No hay recompensas disponibles' });
        return { success: true };
      }),

    // ===== PLANES DE LEALTAD (ADMIN) =====

    adminCreatePlan: publicProcedure
      .input(z.object({
        name: z.string(),
        productName: z.string(),
        category: z.enum(['consultation', 'product', 'service']),
        requiredPurchases: z.number().min(2),
        rewardDescription: z.string().optional(),
        expiresAt: z.string().optional(), // ISO date string
      }))
      .mutation(async ({ input }) => {
        const plan = await createLoyaltyPlan({
          name: input.name,
          productName: input.productName,
          category: input.category,
          requiredPurchases: input.requiredPurchases,
          rewardDescription: input.rewardDescription || '1 GRATIS',
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        });
        return plan;
      }),

    adminListPlans: publicProcedure.query(async () => {
      return getAllLoyaltyPlans();
    }),

    adminUpdatePlan: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        productName: z.string().optional(),
        requiredPurchases: z.number().optional(),
        rewardDescription: z.string().optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, expiresAt, ...rest } = input;
        const data: any = { ...rest };
        if (expiresAt !== undefined) {
          data.expiresAt = expiresAt ? new Date(expiresAt) : null;
        }
        await updateLoyaltyPlan(id, data);
        return { success: true };
      }),

    adminDeletePlan: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteLoyaltyPlan(input.id);
        return { success: true };
      }),

    // Crear monedero para paciente existente que no tiene (admin)
    adminCreateWallet: publicProcedure
      .input(z.object({ patientId: z.number() }))
      .mutation(async ({ input }) => {
        const wallet = await createWallet(input.patientId);
        return wallet;
      }),

    // Registrar compra presencial (admin escanea QR)
    adminRegisterPresentialPurchase: publicProcedure
      .input(z.object({
        walletNumber: z.string(),
        itemType: z.enum(['service', 'package', 'product']),
        itemName: z.string(),
        itemPrice: z.number().min(0), // centavos
        cashbackPercent: z.number().min(0).max(100).default(2),
        walletAmountToUse: z.number().min(0).default(0), // centavos a descontar del monedero
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        if (!wallet.isActive) throw new TRPCError({ code: 'FORBIDDEN', message: 'Monedero desactivado' });

        // Validar que hay saldo suficiente
        const walletDeduct = Math.min(input.walletAmountToUse, wallet.balance);
        if (walletDeduct > wallet.balance) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Saldo insuficiente en el monedero' });
        }

        // Descontar saldo del monedero si se usa
        if (walletDeduct > 0) {
          await addWalletTransaction({
            walletId: wallet.id,
            type: 'redeem',
            amount: -walletDeduct,
            description: `Pago presencial con monedero: ${input.itemName}${input.notes ? ` (${input.notes})` : ''}`,
            referenceType: `presential_${input.itemType}`,
            createdBy: 'admin',
          });
        }

        // Calcular cashback sobre el monto pagado en efectivo (precio - monedero usado)
        const efectivoPagado = Math.max(0, input.itemPrice - walletDeduct);
        const cashbackAmount = Math.round(efectivoPagado * (input.cashbackPercent / 100));
        
        // Acreditar cashback al monedero (sobre lo que pagó en efectivo)
        if (cashbackAmount > 0) {
          await addWalletTransaction({
            walletId: wallet.id,
            type: 'cashback',
            amount: cashbackAmount,
            description: `Cashback ${input.cashbackPercent}% por ${input.itemType}: ${input.itemName}${input.notes ? ` (${input.notes})` : ''}`,
            referenceType: `presential_${input.itemType}`,
            createdBy: 'admin',
          });
        }

        const patient = await getPatientById(wallet.patientId);
        return {
          success: true,
          patientName: patient?.name || 'Usuario',
          cashbackAmount,
          walletDeducted: walletDeduct,
          efectivoPagado,
          newBalance: wallet.balance - walletDeduct + cashbackAmount,
        };
      }),

    // Buscar monedero completo por número (admin — para QR scan)
    adminLookupByNumber: publicProcedure
      .input(z.object({ walletNumber: z.string() }))
      .query(async ({ input }) => {
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        const patient = await getPatientById(wallet.patientId);
        const transactions = await getWalletTransactions(wallet.id, 10);
        return {
          walletId: wallet.id,
          walletNumber: wallet.walletNumber,
          patientId: wallet.patientId,
          patientName: patient?.name || 'Usuario',
          patientEmail: patient?.email || '',
          patientPhone: patient?.phone || '',
          balance: wallet.balance,
          isActive: wallet.isActive,
          discountPercent: wallet.discountPercent ?? null,
          discountActivatedAt: wallet.discountActivatedAt ?? null,
          recentTransactions: transactions,
        };
      }),
    // Activar descuento en monedero (solo admin)
    adminSetDiscount: publicProcedure
      .input(z.object({
        walletNumber: z.string(),
        discountPercent: z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(25), z.literal(30)]),
        adminPassword: z.string(),
      }))
      .mutation(async ({ input }) => {
        const ADMIN_PASSWORD = 'nutriser2024';
        if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Palabra clave incorrecta' });
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        await setWalletDiscount(wallet.id, input.discountPercent);
        return { ok: true, discountPercent: input.discountPercent };
      }),
    // Desactivar descuento en monedero (solo admin)
    adminRemoveDiscount: publicProcedure
      .input(z.object({ walletNumber: z.string(), adminPassword: z.string() }))
      .mutation(async ({ input }) => {
        const ADMIN_PASSWORD = 'nutriser2024';
        if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Palabra clave incorrecta' });
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        await removeWalletDiscount(wallet.id);
        return { ok: true };
      }),
    // Reiniciar monedero (solo admin) — pone balance, cashback y canjeado en 0
    adminResetWallet: publicProcedure
      .input(z.object({ walletNumber: z.string(), adminEmail: z.string(), adminPassword: z.string() }))
      .mutation(async ({ input }) => {
        const ADMIN_PASSWORD = 'nutriser2024';
        if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Palabra clave incorrecta' });
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        await adminResetWallet(wallet.id, input.adminEmail);
        return { ok: true };
      }),
    // Dar de baja monedero (solo admin) — suspende sin borrar datos
    adminSuspendWallet: publicProcedure
      .input(z.object({ walletNumber: z.string(), adminPassword: z.string() }))
      .mutation(async ({ input }) => {
        const ADMIN_PASSWORD = 'nutriser2024';
        if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Palabra clave incorrecta' });
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        await adminSuspendWallet(wallet.id);
        return { ok: true };
      }),
    // Dar de alta monedero (solo admin) — reactiva un monedero suspendido
    adminUnsuspendWallet: publicProcedure
      .input(z.object({ walletNumber: z.string(), adminPassword: z.string() }))
      .mutation(async ({ input }) => {
        const ADMIN_PASSWORD = 'nutriser2024';
        if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Palabra clave incorrecta' });
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        await adminUnsuspendWallet(wallet.id);
        return { ok: true };
      }),
  }),

  // ─── Analítica de Comportamiento ─────────────────────────────────────────────
  analytics: router({
    // Público: registrar un evento de comportamiento (fire-and-forget)
    track: publicProcedure
      .input(z.object({
        itemType: z.enum(["service", "product", "ebook", "package", "promotion"]),
        itemId: z.string(),
        itemName: z.string(),
        eventType: z.enum(["view", "wishlist", "cart", "info", "purchase"]),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await trackBehaviorEvent({
          itemType: input.itemType,
          itemId: input.itemId,
          itemName: input.itemName,
          eventType: input.eventType,
          sessionId: input.sessionId ?? null,
          patientId: null,
        });
        return { ok: true };
      }),

    // Admin: top items por evento/tipo
    getTopItems: publicProcedure
      .input(z.object({
        eventType: z.enum(["view", "wishlist", "cart", "info", "purchase"]).optional(),
        itemType: z.enum(["service", "product", "ebook", "package", "promotion"]).optional(),
        limit: z.number().default(10),
        days: z.number().default(30),
      }))
      .query(async ({ input }) => getTopBehaviorItems(input)),

    // Admin: resumen de eventos (objeto con conteos por tipo)
    getSummary: publicProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ input }) => {
        const rows = await getBehaviorSummary(input.days);
        const result: Record<string, number> = { view: 0, info: 0, cart: 0, wishlist: 0, purchase: 0 };
        for (const row of rows) { result[row.eventType] = Number(row.count); }
        return result;
      }),

    // Admin: tendencia diaria (array de {date, view, info, cart, wishlist, purchase})
    getTrend: publicProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ input }) => {
        const rows = await getBehaviorTrend(input.days);
        const byDate: Record<string, Record<string, number>> = {};
        for (const row of rows) {
          if (!byDate[row.date]) byDate[row.date] = { view: 0, info: 0, cart: 0, wishlist: 0, purchase: 0 };
          byDate[row.date][row.eventType] = Number(row.count);
        }
        return Object.entries(byDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, counts]) => ({ date, ...counts }));
      }),

    // Admin: reiniciar todos los eventos de comportamiento
    resetAll: publicProcedure
      .input(z.object({ adminPassword: z.string() }))
      .mutation(async ({ input }) => {
        const ADMIN_PASSWORD = 'nutriser2024';
        if (input.adminPassword !== ADMIN_PASSWORD) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Contraseña incorrecta' });
        }
        const result = await resetAllBehaviorEvents();
        return { success: true, deleted: result.deleted };
      }),
  }),

  // ============================================================
  // PAGOS EN EFECTIVO PENDIENTES
  // ============================================================
  cashPayments: router({
    // Paciente: crear un pago en efectivo pendiente (al elegir "Pagar en Efectivo")
    createPending: publicProcedure
      .input(z.object({
        walletId: z.number(),
        patientId: z.number(),
        concept: z.string().min(1),
        itemType: z.enum(['service', 'product', 'ebook', 'package', 'promotion', 'course', 'other']),
        itemId: z.string().optional(),
        amountCents: z.number().min(1),
        walletAmountUsedCents: z.number().min(0).default(0), // Saldo del monedero a descontar
        cashbackPercent: z.number().min(0).max(100).default(0),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Validar que el saldo a usar no supere el total
        const walletUsed = Math.min(input.walletAmountUsedCents, input.amountCents);
        const payment = await createCashPendingPayment({
          walletId: input.walletId,
          patientId: input.patientId,
          concept: input.concept,
          itemType: input.itemType,
          itemId: input.itemId ?? null,
          amountCents: input.amountCents,
          walletAmountUsedCents: walletUsed,
          cashbackPercent: input.cashbackPercent,
          notes: input.notes ?? null,
        });
        return { success: true, payment };
      }),

    // Paciente: ver sus pagos pendientes en efectivo
    getMyPending: publicProcedure
      .input(z.object({ walletId: z.number() }))
      .query(async ({ input }) => {
        return await getCashPendingPaymentsByWallet(input.walletId);
      }),

    // Paciente: historial completo de pagos en efectivo
    getMyHistory: publicProcedure
      .input(z.object({ walletId: z.number() }))
      .query(async ({ input }) => {
        return await getCashPaymentHistoryByWallet(input.walletId);
      }),

    // Admin: ver todos los pagos pendientes en efectivo
    getAllPending: publicProcedure
      .query(async () => {
        return await getAllCashPendingPayments();
      }),

    // Admin: confirmar un pago en efectivo, descontar saldo del monedero y acumular cashback
    confirm: publicProcedure
      .input(z.object({ id: z.number(), adminEmail: z.string().optional() }))
      .mutation(async ({ input }) => {
        // Verificar que el monedero no esté suspendido antes de confirmar el pago
        const pendingPayment = await getCashPendingPaymentById(input.id);
        if (pendingPayment) {
          const walletForCheck = await getWalletById(pendingPayment.walletId);
          if (walletForCheck && !walletForCheck.isActive) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Este monedero está dado de baja. Reactívalo antes de confirmar el pago.' });
          }
        }
        const payment = await confirmCashPayment(input.id, input.adminEmail ?? 'admin');
        // 1. Descontar saldo del monedero si el paciente eligió usar parte de su saldo
        if (payment.walletAmountUsedCents > 0) {
          const walletRow = await getWalletById(payment.walletId);
          const availableBalance = walletRow?.balance ?? 0;
          const amountToDeduct = Math.min(payment.walletAmountUsedCents, availableBalance);
          if (amountToDeduct > 0) {
            await addWalletTransaction({
              walletId: payment.walletId,
              type: 'redeem',
              amount: -amountToDeduct,
              description: `Saldo usado para pago en efectivo: ${payment.concept}`,
              referenceType: 'cash_payment',
              referenceId: payment.id,
              createdBy: `admin:${input.adminEmail ?? 'admin'}`,
            });
          }
        }
        // 2. Acumular cashback si corresponde (sobre el monto total)
        if (payment.cashbackPercent > 0) {
          const cashbackCents = Math.round(payment.amountCents * payment.cashbackPercent / 100);
          if (cashbackCents > 0) {
            await addWalletTransaction({
              walletId: payment.walletId,
              type: 'cashback',
              amount: cashbackCents,
              description: `Cashback ${payment.cashbackPercent}% por pago en efectivo: ${payment.concept}`,
              referenceType: 'cash_payment',
              referenceId: payment.id,
              createdBy: `admin:${input.adminEmail ?? 'admin'}`,
            });
          }
        }
        // 3. Enviar recibo de compra al paciente por correo
        try {
          const walletRow = await getWalletById(payment.walletId);
          const patientRow = walletRow?.patientId ? await getPatientById(walletRow.patientId) : null;
          if (patientRow?.email) {
            await sendPurchaseReceiptEmail({
              clientEmail: patientRow.email,
              clientName: patientRow.name || 'Paciente',
              concept: payment.concept,
              amountCents: payment.amountCents,
              walletAmountUsedCents: payment.walletAmountUsedCents ?? 0,
              cashbackPercent: payment.cashbackPercent ?? 0,
              itemType: payment.itemType ?? 'other',
              paymentDate: new Date(),
              walletNumber: walletRow?.walletNumber,
            });
          }
        } catch (emailErr) {
          console.error('[cashPayments.confirm] Error sending receipt email:', emailErr);
        }
        return { success: true, payment };
      }),

    // Admin: cancelar un pago pendiente
    cancel: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await cancelCashPayment(input.id);
        return { success: true };
      }),

    // Admin: eliminar permanentemente una compra del historial (para corregir errores)
    adminDelete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCashPayment(input.id);
        return { success: true };
      }),

    // Admin: obtener historial de compras de un paciente (para ver y borrar)
    getPatientHistory: publicProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const { cashPendingPayments } = await import('../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');
        return await db.select().from(cashPendingPayments)
          .where(eq(cashPendingPayments.patientId, input.patientId))
          .orderBy(desc(cashPendingPayments.createdAt));
      }),
  }),

  // ─── Splash Ads ────────────────────────────────────────────────────────────
  // --- Solicitudes de Tarjeta Fisica ---
  physicalCard: router({
    request: publicProcedure
      .input(z.object({
        walletId: z.number(),
        patientName: z.string(),
        walletNumber: z.string(),
        patientEmail: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
        const { physicalCardRequests } = await import('../drizzle/schema');
        const existing = await db.select().from(physicalCardRequests)
          .where(eq(physicalCardRequests.walletId, input.walletId))
          .limit(1);
        const hasPending = existing.some((r) => r.status === 'pending');
        if (hasPending) {
          return { success: true, alreadyRequested: true };
        }
        await db.insert(physicalCardRequests).values({
          walletId: input.walletId,
          patientName: input.patientName,
          walletNumber: input.walletNumber,
          patientEmail: input.patientEmail || null,
          status: 'pending',
        });
        await notifyOwner({
          title: 'Nueva solicitud de tarjeta fisica',
          content: input.patientName + ' (' + input.walletNumber + ') ha solicitado su tarjeta fisica del Monedero Nutriser.',
        });
        return { success: true, alreadyRequested: false };
      }),

    adminList: publicProcedure
      .input(z.object({ status: z.enum(['pending', 'printed', 'delivered', 'all']).optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
        const { physicalCardRequests } = await import('../drizzle/schema');
        const rows = await db.select().from(physicalCardRequests)
          .orderBy(desc(physicalCardRequests.requestedAt));
        if (input.status && input.status !== 'all') {
          return rows.filter((r) => r.status === input.status);
        }
        return rows;
      }),

    markPrinted: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
        const { physicalCardRequests } = await import('../drizzle/schema');
        await db.update(physicalCardRequests)
          .set({ status: 'printed', printedAt: new Date() })
          .where(eq(physicalCardRequests.id, input.id));
        return { success: true };
      }),

    markDelivered: publicProcedure
      .input(z.object({ id: z.number(), notes: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
        const { physicalCardRequests } = await import('../drizzle/schema');
        await db.update(physicalCardRequests)
          .set({ status: 'delivered', deliveredAt: new Date(), notes: input.notes || null })
          .where(eq(physicalCardRequests.id, input.id));
        return { success: true };
      }),

    getMyStatus: publicProcedure
      .input(z.object({ walletId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { hasRequest: false, status: null };
        const { physicalCardRequests } = await import('../drizzle/schema');
        const rows = await db.select().from(physicalCardRequests)
          .where(eq(physicalCardRequests.walletId, input.walletId))
          .orderBy(desc(physicalCardRequests.requestedAt))
          .limit(1);
        if (rows.length === 0) return { hasRequest: false, status: null };
        return { hasRequest: true, status: rows[0].status, requestedAt: rows[0].requestedAt };
      }),
  }),

  splashAds: router({
    // Público: obtener splash ads activos por tipo
    getActive: publicProcedure
      .input(z.object({ type: z.enum(['inicio', 'tienda']) }))
      .query(async ({ input }) => {
        return await getActiveSplashAds(input.type);
      }),

    // Admin: obtener todos los splash ads
    getAll: publicProcedure
      .query(async () => {
        return await getAllSplashAds();
      }),

    // Admin: crear splash ad (subir imagen a S3 primero, luego registrar)
    create: publicProcedure
      .input(z.object({
        type: z.enum(['inicio', 'tienda']),
        imageBase64: z.string(), // base64 de la imagen
        mimeType: z.string().default('image/jpeg'),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        linkUrl: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // Subir imagen a S3
        const buffer = Buffer.from(input.imageBase64, 'base64');
        const fileName = `splash-ads/${input.type}-${Date.now()}.jpg`;
        const { url } = await storagePut(fileName, buffer, input.mimeType);
        const ad = await createSplashAd({
          type: input.type,
          imageUrl: url,
          title: input.title ?? null,
          subtitle: input.subtitle ?? null,
          linkUrl: input.linkUrl ?? null,
          sortOrder: input.sortOrder ?? 0,
        });
        return { success: true, ad };
      }),

    // Admin: activar/desactivar
    toggle: publicProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await toggleSplashAd(input.id, input.isActive);
        return { success: true };
      }),

    // Admin: eliminar
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSplashAd(input.id);
        return { success: true };
      }),

    // Admin: actualizar orden
    updateOrder: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ input }) => {
        await updateSplashAdOrder(input.id, input.sortOrder);
        return { success: true };
      }),

    // Público: obtener configuración de showDefault para un tipo
    getConfig: publicProcedure
      .input(z.object({ type: z.enum(['inicio', 'tienda']) }))
      .query(async ({ input }) => {
        return await getSplashConfig(input.type);
      }),

    // Admin: activar/desactivar la slide fija (Monedero/ShopCard)
    setShowDefault: publicProcedure
      .input(z.object({ type: z.enum(['inicio', 'tienda']), showDefault: z.boolean() }))
      .mutation(async ({ input }) => {
        await setSplashShowDefault(input.type, input.showDefault);
        return { success: true };
      }),
    // Admin: subir imagen personalizada para la slide fija (null = restaurar diseño automático)
    setCustomImage: publicProcedure
      .input(z.object({
        type: z.enum(['inicio', 'tienda']),
        imageBase64: z.string().nullable(),
        imageMime: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        if (input.imageBase64 === null) {
          await setSplashCustomImage(input.type, null);
          return { success: true, imageUrl: null };
        }
        const buffer = Buffer.from(input.imageBase64, 'base64');
        const ext = (input.imageMime ?? 'image/jpeg').includes('png') ? 'png' : 'jpg';
        const key = `splash-custom/${input.type}-${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.imageMime ?? 'image/jpeg');
        await setSplashCustomImage(input.type, url);
        return { success: true, imageUrl: url };
      }),
  }),

  // ─── Traducción automática con LLM ─────────────────────────────────────────
  translate: router({
    texts: publicProcedure
      .input(z.object({
        texts: z.array(z.string()).max(50),
        targetLang: z.enum(["EN"]),
      }))
      .mutation(async ({ input }) => {
        if (input.texts.length === 0) return { translations: [] };
        const prompt = `You are a professional medical spa translator. Translate the following Spanish texts to English. These are names and descriptions of aesthetic and nutrition treatments/services from a Mexican clinic. Keep proper nouns (brand names, treatment names like "Cavitación", "Radiofrecuencia", "Mesoterapia") in their commonly used English or Spanish form. Return ONLY a JSON array of strings with the translations in the same order, no extra text.\n\nTexts to translate:\n${JSON.stringify(input.texts)}`;
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a professional medical spa translator. Return only valid JSON arrays." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "translations",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  translations: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["translations"],
                additionalProperties: false,
              },
            },
          },
        });
        const rawContent = response.choices?.[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : null;
        if (!content) return { translations: input.texts };
        try {
          const parsed = JSON.parse(content);
          const arr = parsed.translations ?? parsed;
          if (Array.isArray(arr) && arr.length === input.texts.length) {
            return { translations: arr as string[] };
          }
        } catch {
          // fallback
        }
        return { translations: input.texts };
      }),
  }),

  // ─── Aparador - Tienda Principal ───────────────────────────────────────────────────
  storeBanners: router({
    // Público: banners activos para el carrusel de la tienda
    getActive: publicProcedure.query(async () => {
      return await getActiveStoreBanners();
    }),
    // Admin: todos los banners
    getAll: publicProcedure.query(async () => {
      return await getAllStoreBanners();
    }),
    // Admin: crear banner (imagen en base64)
    create: publicProcedure
      .input(z.object({
        imageBase64: z.string(),
        mimeType: z.string().default('image/jpeg'),
        title: z.string().optional(),
        linkUrl: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.imageBase64, 'base64');
        const ext = input.mimeType.includes('png') ? 'png' : 'jpg';
        const key = `store-banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        const banner = await createStoreBanner({
          imageUrl: url,
          title: input.title ?? null,
          linkUrl: input.linkUrl ?? null,
          sortOrder: input.sortOrder ?? 0,
          isActive: true,
        });
        return { success: true, banner };
      }),
    // Admin: activar/desactivar
    toggle: publicProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await toggleStoreBanner(input.id, input.isActive);
        return { success: true };
      }),
    // Admin: eliminar (no se pueden eliminar banners del sistema)
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const allBanners = await getAllStoreBanners();
        const banner = allBanners.find((b: any) => b.id === input.id);
        if (banner?.isSystem) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Los banners del sistema no se pueden eliminar. Solo puedes activarlos o desactivarlos.' });
        }
        await deleteStoreBanner(input.id);
        return { success: true };
      }),
    // Admin: actualizar orden
    updateOrder: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ input }) => {
        await updateStoreBannerOrder(input.id, input.sortOrder);
        return { success: true };
      }),
  }),

  // ─── Banner Interests - Solicitudes de interés en promociones ───────────────
  bannerInterests: router({
    // Usuario: registrar interés en una promoción del banner
    create: publicProcedure
      .input(z.object({
        bannerId: z.number().optional(),
        bannerTitle: z.string().optional(),
        bannerImageUrl: z.string().optional(),
        patientId: z.number().optional(),
        patientName: z.string().optional(),
        patientEmail: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Soporta tanto pacientes (sistema propio) como usuarios Manus OAuth
        const userId = input.patientId ?? ctx.user?.id ?? 0;
        const patientName = input.patientName ?? ctx.user?.name ?? null;
        const patientEmail = input.patientEmail ?? ctx.user?.email ?? null;
        const interest = await createBannerInterest({
          userId,
          bannerId: input.bannerId ?? null,
          bannerTitle: input.bannerTitle ?? null,
          bannerImageUrl: input.bannerImageUrl ?? null,
          patientName,
          patientEmail,
          status: 'pending',
        });
        // Notificar al admin
        await notifyOwner({
          title: `🏷️ Nueva solicitud de promoción: ${input.bannerTitle ?? 'Sin título'}`,
          content: `El paciente ${patientName ?? patientEmail ?? 'desconocido'} quiere comprar en clínica la promoción: "${input.bannerTitle ?? 'Sin título'}". Revisa la sección Solicitudes del Monedero.`,
        });
        return { success: true, interest };
      }),
    // Usuario: ver sus propias solicitudes (soporta sistema propio de pacientes y Manus OAuth)
    myInterests: publicProcedure
      .input(z.object({ patientId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const userId = input?.patientId ?? ctx.user?.id;
        if (!userId) return [];
        return await getBannerInterestsByUser(userId);
      }),
    // Admin: ver todas las solicitudes pendientes
    getPending: publicProcedure.query(async () => {
      return await getPendingBannerInterests();
    }),
    // Admin: ver todas las solicitudes
    getAll: publicProcedure.query(async () => {
      return await getAllBannerInterests();
    }),
    // Admin: eliminar solicitud de promoción
    delete: publicProcedure
      .input(z.object({ interestId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBannerInterest(input.interestId);
        return { success: true };
      }),
    // Admin: atender solicitud + acreditar al monedero
    attend: publicProcedure
      .input(z.object({
        interestId: z.number(),
        walletId: z.number(),
        amount: z.number().positive(),
        concept: z.string().optional(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Acreditar al monedero del paciente (tipo 'bonus' = acreditación manual del admin)
        await addWalletTransaction({
          walletId: input.walletId,
          type: 'bonus',
          amount: input.amount,
          description: input.concept ?? `Pago en clínica - Promoción banner`,
          referenceType: 'banner_interest',
          createdBy: 'admin',
        });
        // Marcar solicitud como atendida
        await attendBannerInterest(input.interestId, input.adminNotes);
        return { success: true };
      }),
  }),

  // ============================================================
  // ROUTER: PAGOS A PLAZOS
  // ============================================================
  installments: router({
    create: publicProcedure
      .input(z.object({
        walletNumber: z.string(),
        concept: z.string().min(1),
        originalAmount: z.number().positive(),
        modalidad: z.enum(['quincenal', 'semanal']),
        adminEmail: z.string(),
      }))
      .mutation(async ({ input }) => {
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        if (!wallet.isActive) throw new TRPCError({ code: 'FORBIDDEN', message: 'Este monedero está dado de baja' });
        const originalAmountCents = Math.round(input.originalAmount * 100);
        const plan = await createInstallmentPlan({
          walletId: wallet.id,
          patientId: wallet.patientId,
          concept: input.concept,
          originalAmountCents,
          modalidad: input.modalidad,
          createdBy: input.adminEmail,
        });
        // SIN cashback — los pagos a plazos no acumulan
        return { success: true, plan };
      }),

    confirmPayment: publicProcedure
      .input(z.object({
        paymentId: z.number(),
        adminEmail: z.string(),
      }))
      .mutation(async ({ input }) => {
        await confirmInstallmentPayment(input.paymentId, input.adminEmail);
        return { success: true };
      }),

    adminListAll: publicProcedure
      .query(async () => {
        return await getAllInstallmentPlans();
      }),

    getMyPlans: publicProcedure
      .input(z.object({ walletNumber: z.string() }))
      .query(async ({ input }) => {
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) return [];
        return await getInstallmentPlansByWallet(wallet.id);
      }),
  }),

  // ============================================================
  // ROUTER: NOTIFICACIONES ADMIN → PACIENTE
  // ============================================================
  // ── Helper: enviar correo + push al paciente cuando el admin manda notificación ──
  // (definido como variable local para reutilizar en send y sendByWalletId)

  adminNotifs: router({
    send: publicProcedure
      .input(z.object({
        walletNumber: z.string(),
        title: z.string().min(1).max(255),
        message: z.string().min(1),
        imageUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
        type: z.enum(['cobro', 'promocion', 'felicitacion', 'general']).default('general'),
        adminEmail: z.string().default('admin'),
      }))
      .mutation(async ({ input }) => {
        // 1. Buscar monedero — si no existe, error claro
        const wallet = await getWalletByNumber(input.walletNumber).catch(() => undefined);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        // 2. Guardar notificación en BD (siempre, sin importar lo que pase después)
        let notif: any = null;
        try {
          notif = await sendAdminNotification({
            walletId: wallet.id,
            patientId: wallet.patientId,
            title: input.title,
            message: input.message,
            imageUrl: input.imageUrl,
            type: input.type,
            sentBy: input.adminEmail || 'admin',
          });
        } catch (dbErr) {
          console.error('[AdminNotif] DB error:', dbErr);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error al guardar la notificación' });
        }
        // 3. Correo y Push — nunca bloquean la respuesta
        getPatientById(wallet.patientId)
          .then(p => sendAdminNotifEmailAndPush(p, input.title, input.message, input.type, input.imageUrl))
          .catch(e => console.warn('[AdminNotif] Email/Push error (non-blocking):', e));
        return { success: true, notif };
      }),
    sendByWalletId: publicProcedure
      .input(z.object({
        walletId: z.number(),
        title: z.string().min(1).max(255),
        message: z.string().min(1),
        imageUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
        type: z.enum(['cobro', 'promocion', 'felicitacion', 'general']).default('general'),
        adminEmail: z.string().default('admin'),
      }))
      .mutation(async ({ input }) => {
        // 1. Buscar monedero — si no existe, error claro
        const wallet = await getWalletById(input.walletId).catch(() => undefined);
        if (!wallet) throw new TRPCError({ code: 'NOT_FOUND', message: 'Monedero no encontrado' });
        // 2. Guardar notificación en BD (siempre, sin importar lo que pase después)
        let notif: any = null;
        try {
          notif = await sendAdminNotification({
            walletId: wallet.id,
            patientId: wallet.patientId,
            title: input.title,
            message: input.message,
            imageUrl: input.imageUrl,
            type: input.type,
            sentBy: input.adminEmail || 'admin',
          });
        } catch (dbErr) {
          console.error('[AdminNotif] DB error:', dbErr);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error al guardar la notificación' });
        }
        // 3. Correo y Push — nunca bloquean la respuesta
        getPatientById(wallet.patientId)
          .then(p => sendAdminNotifEmailAndPush(p, input.title, input.message, input.type, input.imageUrl))
          .catch(e => console.warn('[AdminNotif] Email/Push error (non-blocking):', e));
        return { success: true, notif };
      }),

    getMyNotifs: publicProcedure
      .input(z.object({ walletNumber: z.string() }))
      .query(async ({ input }) => {
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) return [];
        return await getAdminNotificationsByWallet(wallet.id);
      }),

    countUnread: publicProcedure
      .input(z.object({ walletNumber: z.string() }))
      .query(async ({ input }) => {
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) return 0;
        return await countUnreadAdminNotifications(wallet.id);
      }),

    markRead: publicProcedure
      .input(z.object({ notifId: z.number() }))
      .mutation(async ({ input }) => {
        await markAdminNotificationRead(input.notifId);
        return { success: true };
      }),

    markAllRead: publicProcedure
      .input(z.object({ walletNumber: z.string() }))
      .mutation(async ({ input }) => {
        const wallet = await getWalletByNumber(input.walletNumber);
        if (!wallet) return { success: false };
        await markAllAdminNotificationsRead(wallet.id);
        return { success: true };
      }),

    deleteNotif: publicProcedure
      .input(z.object({ notifId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAdminNotification(input.notifId);
        return { success: true };
      }),

    deleteAllNotifs: publicProcedure
      .input(z.object({ walletId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAllAdminNotifications(input.walletId);
        return { success: true };
      }),

    getByWalletId: publicProcedure
      .input(z.object({ walletId: z.number() }))
      .query(async ({ input }) => {
        return await getAdminNotificationsByWallet(input.walletId);
      }),
    editNotif: publicProcedure
      .input(z.object({
        notifId: z.number(),
        title: z.string().min(1).max(255),
        message: z.string().min(1),
        type: z.enum(['cobro', 'promocion', 'felicitacion', 'general']),
        imageUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
      }))
      .mutation(async ({ input }) => {
        await updateAdminNotification(input.notifId, {
          title: input.title,
          message: input.message,
          type: input.type,
          imageUrl: input.imageUrl,
        });
        return { success: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
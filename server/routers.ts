import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createMembership, getAllMemberships, getMembershipById, updateMembershipStatus, createPaymentProof, getPaymentProofByMembershipId, createAppointment, getAllAppointments, getAdminByEmail, createAdminCredential, setAdminResetToken, getAdminByResetToken, updateAdminPassword, deleteMembership, getCouponByCode, getAllCoupons, approveCoupon, rejectCoupon, createMembershipCoupon, getAllPromotions, getPromotionsWithCouponCounts, createPromotion, updatePromotion, deletePromotion, getAllPromotionsForAdmin, deleteAppointment, deleteAllAppointments, cancelAppointment, createGiftPurchase, getAllGiftPurchases, getGiftPurchaseById, updateGiftPurchaseStatus, deleteGiftPurchase, getActiveEbook, getAllEbooks, upsertEbook, createEbookPurchase, getAllEbookPurchases, getEbookPurchaseByToken, updateEbookPurchaseStatus, deleteEbookPurchase, getEbookPurchaseByEmail, getAllEbookDiscountCodes, getEbookDiscountCodeByCode, toggleEbookDiscountCode, createServicePurchase, getAllServicePurchases, updateServicePurchaseStatus, deleteServicePurchase, subscribeToCoupons, getAllCouponSubscribers, deleteCouponSubscriber, getAllServices, getAllActiveServices, createService, updateService, deleteService } from "./db";
import { notifyOwner } from "./_core/notification";
import { ENV } from "./_core/env";
import { sendConfirmationEmail, sendAppointmentNotification, sendMembershipNotificationToAdmin, sendAppointmentConfirmationToClient, sendCouponApprovedEmail, sendCouponPurchaseNotificationToAdmin, sendPasswordResetEmail } from "./_core/email";
import { sendNewCouponNotificationToSubscribers, sendServicePurchaseNotificationToAdmin, sendServicePurchaseApprovedEmail } from './_core/email_extra';
import { getAllProducts, getAllActiveProducts, createProduct, updateProduct, deleteProduct, createProductPurchase, getAllProductPurchases, updateProductPurchaseStatus, deleteProductPurchase, validateDiscountCode, getAllDiscountCodes, toggleDiscountCode, incrementDiscountCodeUsage } from './db';
import { getAllCourses, getPublishedCourses, getCourseById, createCourse, updateCourse, deleteCourse, getVideosByCourse, getVideoById, createCourseVideo, updateCourseVideo, deleteCourseVideo, getDocumentsByVideo, createCourseDocument, deleteCourseDocument, getApprovedCommentsByVideo, getPendingComments, getAllCourseComments, createCourseComment, updateCommentStatus, deleteCourseComment, getAllCourseSubscribers, createCourseSubscriber, deleteCourseSubscriber } from './db';
import { savePushSubscription, deletePushSubscription, sendPushNotificationToAll, getAllPushSubscriptions } from "./pushNotifications";
import { storagePut } from "./storage";
import bcrypt from "bcrypt";
import { eq, desc } from "drizzle-orm";
import { adminCredentials } from "../drizzle/schema";
import { getDb } from "./db";

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
    adminLogin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const admin = await getAdminByEmail(input.email);
        if (!admin) throw new Error("Admin not found");
        
        const isPasswordValid = await bcrypt.compare(input.password, admin.passwordHash);
        if (!isPasswordValid) throw new Error("Invalid password");
        
        return {
          success: true,
          adminId: admin.id,
          email: admin.email,
        };
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
        programType: z.enum(["basic", "premium"]),
      }))
      .mutation(async ({ input }) => {
        const price = input.programType === "basic" ? "2000" : "3000";
        const membership = await createMembership({
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          programType: input.programType,
          price: price,
          depositConcept: `${input.clientName} - Programa ${input.programType === "basic" ? "Básico" : "Premium"}`,
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
          membership.programType
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
            membership.accessCode || undefined
          );
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
      }))
      .mutation(async ({ input }) => {
        // Generate unique coupon code: NUT-XXXX-XXXX
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const couponCode = `NUT-${part1}-${part2}`;

        // Upload proof to S3
        const buffer = Buffer.from(input.proofData, 'base64');
        const fileName = `gift-proof-${Date.now()}.${input.proofMimeType.split('/')[1]}`;
        const { url } = await storagePut(`gift-proofs/${fileName}`, buffer, input.proofMimeType);

        const purchase = await createGiftPurchase({
          promotionId: input.promotionId,
          couponCode,
          buyerName: input.buyerName,
          buyerEmail: input.buyerEmail,
          buyerPhone: input.buyerPhone,
          proofUrl: url,
          isGift: input.isGift,
          recipientName: input.recipientName,
          recipientContact: input.recipientContact,
          status: 'pending',
        });

        // Notify admin via Gmail
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
            couponCode,
            promotionTitle,
            input.isGift,
            input.recipientName
          );
        } catch (e) {
          console.error('Error sending coupon purchase notification:', e);
        }

        return { success: true, id: purchase.id, couponCode };
      }),

    list: publicProcedure.query(async () => {
      return await getAllGiftPurchases();
    }),

    approve: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const purchase = await getGiftPurchaseById(input.id);
        if (!purchase) throw new Error('Compra no encontrada');

        await updateGiftPurchaseStatus(input.id, 'approved');

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

        // Send email to buyer
        await sendCouponApprovedEmail(
          purchase.buyerEmail,
          purchase.buyerName,
          purchase.couponCode,
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

        // Notify all active subscribers about the new coupon
        try {
          const subscribers = await getAllCouponSubscribers();
          if (subscribers.length > 0) {
            await sendNewCouponNotificationToSubscribers(
              subscribers,
              input.title,
              input.description ?? null,
              input.price ?? null,
              input.regularPrice ?? null,
              newPromo.id
            );
          }
        } catch (e) {
          console.error('Error notifying subscribers:', e);
        }

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
        referredBy: z.string().optional(), // Nombre del comprador que recomendó
        discountCode: z.string().optional(), // Código de descuento aplicado
      }))
      .mutation(async ({ input }) => {
        const { proofBase64, discountCode, ...rest } = input;
        
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
                    <p style="color:#888;font-size:12px">Nutriser Aesthetic &amp; Nutrition · Puerto Vallarta, Jalisco</p>
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

  // ─── Suscriptores a la cuponera ─────────────────────────────────────────────
  couponSubscribers: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        whatsapp: z.string().optional().default(""),
      }))
      .mutation(async ({ input }) => {
        await subscribeToCoupons({
          email: input.email,
          whatsapp: input.whatsapp || "",
          isActive: true,
        });
        return { success: true };
      }),

    list: publicProcedure.query(async () => {
      return await getAllCouponSubscribers();
    }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteCouponSubscriber(input.id);
      }),
  }),

  // ─── Push Notifications ─────────────────────────────────────────────────────
  push: router({
    subscribe: publicProcedure
      .input(z.object({
        endpoint: z.string().url(),
        p256dh: z.string(),
        auth: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await savePushSubscription(input.endpoint, input.p256dh, input.auth);
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
        // Verificar contraseña: buscar el primer admin disponible en la base de datos
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Base de datos no disponible' });
        const admins = await db.select().from(adminCredentials).limit(1);
        if (!admins.length) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Admin no configurado' });
        const valid = await bcrypt.compare(input.adminPassword, admins[0].passwordHash);
        if (!valid) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Contraseña incorrecta' });

        const title = input.title?.trim() || '🔔 Notificación de Prueba - Nutriser';
        const body = input.body?.trim() || 'Esta es una notificación de prueba. Si escuchas el sonido, ¡todo funciona correctamente!';

        const result = await sendPushNotificationToAll(title, body, 'https://nutriserpv.com');
        return result;
      }),

    // Contar suscriptores activos
    countSubscribers: publicProcedure.query(async () => {
      const subs = await getAllPushSubscriptions();
      return { count: subs.length };
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
      }))
      .mutation(async ({ input }) => {
        // Generate unique service code: NUT-SRV-XXXX
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const part = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const serviceCode = `NUT-SRV-${part}`;

        // Upload proof to S3
        const buffer = Buffer.from(input.proofData, 'base64');
        const ext = input.proofMimeType.split('/')[1] || 'jpg';
        const fileName = `service-proof-${Date.now()}.${ext}`;
        const { url } = await storagePut(`service-proofs/${fileName}`, buffer, input.proofMimeType);

        // Increment discount code usage if provided
        if (input.discountCode) {
          try { await incrementDiscountCodeUsage(input.discountCode); } catch {}
        }

        const purchase = await createServicePurchase({
          serviceName: input.serviceName,
          buyerName: input.buyerName,
          buyerEmail: input.buyerEmail,
          buyerPhone: input.buyerPhone,
          proofUrl: url,
          serviceCode,
          status: 'pending',
          discountCode: input.discountCode,
          discountPercent: input.discountPercent,
          originalPrice: input.originalPrice,
        });

        // Notify admin via email
        try {
          await sendServicePurchaseNotificationToAdmin(
            ENV.gmailUser,
            input.buyerName,
            input.buyerEmail,
            input.buyerPhone,
            input.serviceName,
            serviceCode
          );
        } catch (e) {
          console.error('Error sending service purchase notification:', e);
        }

        return { success: true, serviceCode };
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

        await updateServicePurchaseStatus(input.id, 'approved');

        // Send approval email to buyer
        try {
          await sendServicePurchaseApprovedEmail(
            purchase.buyerEmail,
            purchase.buyerName,
            purchase.serviceName,
            purchase.serviceCode
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
      }))
      .mutation(async ({ input }) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const part = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const purchaseCode = `NUT-PRD-${part}`;
        const buffer = Buffer.from(input.proofData, 'base64');
        const ext = input.proofMimeType.split('/')[1] || 'jpg';
        const fileName = `product-proof-${Date.now()}.${ext}`;
        const { url: proofUrl } = await storagePut(`product-proofs/${fileName}`, buffer, input.proofMimeType);
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
});

export type AppRouter = typeof appRouter;

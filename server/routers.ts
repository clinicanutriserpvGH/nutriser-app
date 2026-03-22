import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createMembership, getAllMemberships, getMembershipById, updateMembershipStatus, createPaymentProof, getPaymentProofByMembershipId, createAppointment, getAllAppointments, getAdminByEmail, createAdminCredential, deleteMembership, getCouponByCode, getAllCoupons, approveCoupon, rejectCoupon, createMembershipCoupon, getAllPromotions, createPromotion, updatePromotion, deletePromotion, getAllPromotionsForAdmin, deleteAppointment, deleteAllAppointments, cancelAppointment, createGiftPurchase, getAllGiftPurchases, getGiftPurchaseById, updateGiftPurchaseStatus, getActiveEbook, getAllEbooks, upsertEbook, createEbookPurchase, getAllEbookPurchases, getEbookPurchaseByToken, updateEbookPurchaseStatus, getEbookPurchaseByEmail, getAllEbookDiscountCodes, getEbookDiscountCodeByCode, toggleEbookDiscountCode } from "./db";
import { notifyOwner } from "./_core/notification";
import { ENV } from "./_core/env";
import { sendConfirmationEmail, sendAppointmentNotification, sendMembershipNotificationToAdmin, sendAppointmentConfirmationToClient, sendCouponApprovedEmail, sendCouponPurchaseNotificationToAdmin } from "./_core/email";
import { storagePut } from "./storage";
import bcrypt from "bcrypt";
import { eq, desc } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie("session", { ...cookieOptions, maxAge: -1 });
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
        
        // Send confirmation email
        await sendConfirmationEmail(input.clientEmail, input.clientName, input.programType);
        
        // Send membership notification to admin from client email
        await sendMembershipNotificationToAdmin(
          ENV.gmailUser || "clinicanutriserpv@gmail.com",
          input.clientName,
          input.clientEmail,
          input.clientPhone,
          input.programType
        );
        
        // Notify owner via system notification
        await notifyOwner({
          title: "Nueva Inscripción a Membresía",
          content: `Cliente: ${input.clientName}\nEmail: ${input.clientEmail}\nTeléfono: ${input.clientPhone || "No proporcionado"}\nPrograma: ${input.programType === "basic" ? "Básico" : "Premium"}`,
        });
        
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
        
        // If status is verified, send activation email
        if (input.status === "verified" && membership) {
          const membershipData = await getMembershipById(input.id);
          if (membershipData) {
            await sendConfirmationEmail(membershipData.clientEmail, membershipData.clientName, membershipData.programType);
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
  }),

  promotions: router({
    list: publicProcedure.query(async () => {
      return await getAllPromotions();
    }),

    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        expiresAt: z.string().optional(), // ISO date string
      }))
      .mutation(async ({ input }) => {
        return await createPromotion({
          title: input.title,
          description: input.description,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          isActive: true,
        });
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.string().nullable().optional(), // ISO date string or null
      }))
      .mutation(async ({ input }) => {
        const { id, expiresAt, ...rest } = input;
        const data: Record<string, unknown> = { ...rest };
        if (expiresAt !== undefined) {
          data.expiresAt = expiresAt ? new Date(expiresAt) : null;
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
        coverBase64: z.string().optional(),
        backCoverBase64: z.string().optional(),
        pdfBase64: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, coverBase64, backCoverBase64, pdfBase64, ...rest } = input;
        const data: Record<string, unknown> = { ...rest };

        if (coverBase64) {
          const buf = Buffer.from(coverBase64.split(',')[1] ?? coverBase64, 'base64');
          const { url } = await storagePut(`ebooks/cover-${Date.now()}.jpg`, buf, 'image/jpeg');
          data.coverUrl = url;
        }
        if (backCoverBase64) {
          const buf = Buffer.from(backCoverBase64.split(',')[1] ?? backCoverBase64, 'base64');
          const { url } = await storagePut(`ebooks/backcover-${Date.now()}.jpg`, buf, 'image/jpeg');
          data.backCoverUrl = url;
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
});

export type AppRouter = typeof appRouter;

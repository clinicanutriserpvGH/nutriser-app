import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createMembership, getAllMemberships, getMembershipById, updateMembershipStatus, createPaymentProof, getPaymentProofByMembershipId, createAppointment, getAllAppointments, getAdminByEmail, createAdminCredential, deleteMembership, getCouponByCode, getAllCoupons, approveCoupon, rejectCoupon, createMembershipCoupon, getAllPromotions, createPromotion, updatePromotion, deletePromotion, getAllPromotionsForAdmin, deleteAppointment, deleteAllAppointments, cancelAppointment, createGiftPurchase, getAllGiftPurchases, getGiftPurchaseById, updateGiftPurchaseStatus } from "./db";
import { notifyOwner } from "./_core/notification";
import { sendConfirmationEmail, sendAppointmentNotification, sendMembershipNotificationToAdmin, sendAppointmentConfirmationToClient } from "./_core/email";
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
          "clinicanutricerpv@gmail.com",
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
          "clinicanutricerpv@gmail.com",
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
      }))
      .mutation(async ({ input }) => {
        // Upload proof to S3
        const buffer = Buffer.from(input.proofData, 'base64');
        const fileName = `gift-proof-${Date.now()}.${input.proofMimeType.split('/')[1]}`;
        const { url } = await storagePut(`gift-proofs/${fileName}`, buffer, input.proofMimeType);

        const purchase = await createGiftPurchase({
          promotionId: input.promotionId,
          buyerName: input.buyerName,
          buyerEmail: input.buyerEmail,
          buyerPhone: input.buyerPhone,
          proofUrl: url,
          status: 'pending',
        });

        // Notify admin
        await notifyOwner({
          title: 'Nueva compra de cupón de regalo',
          content: `${input.buyerName} (${input.buyerEmail}) compró un cupón de regalo. Revisa el panel de administración para autorizar.`,
        });

        return { success: true, id: purchase.id };
      }),

    list: publicProcedure.query(async () => {
      return await getAllGiftPurchases();
    }),

    approve: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateGiftPurchaseStatus(input.id, 'approved');
        return { success: true };
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
        imageUrl: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        return await createPromotion({
          ...input,
          isActive: true,
        });
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updatePromotion(id, data);
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
});

export type AppRouter = typeof appRouter;

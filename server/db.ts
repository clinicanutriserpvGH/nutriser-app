import { eq, desc, asc, and, lt, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, memberships, paymentProofs, InsertMembership, InsertPaymentProof, appointments, InsertAppointment, adminCredentials, InsertAdminCredential, coupons, InsertCoupon, membershipCoupons, InsertMembershipCoupon, promotions, InsertPromotion, giftPurchases, InsertGiftPurchase, ebooks, InsertEbook, ebookPurchases, InsertEbookPurchase, ebookDiscountCodes, servicePurchases, InsertServicePurchase, services, InsertService, topicSuggestions, InsertTopicSuggestion, topicVotes } from "../drizzle/schema";
import { ENV } from './_core/env';
import { products, InsertProduct, productPurchases, InsertProductPurchase, discountCodes, InsertDiscountCode, DiscountCode } from '../drizzle/schema';
import { patientAccounts, InsertPatientAccount, PatientAccount, patientTreatments, InsertPatientTreatment, patientAppointments, InsertPatientAppointment, patientPhotos, InsertPatientPhoto } from '../drizzle/schema';
import { storeBanners, type InsertStoreBanner, bannerInterests, type InsertBannerInterest, systemConfig } from '../drizzle/schema';
import { installmentPlans, installmentPayments, adminNotifications, type InstallmentPlan, type InstallmentPayment, type AdminNotification } from '../drizzle/schema';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Membership queries
export async function createMembership(data: InsertMembership) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(memberships).values(data);
  // Obtener el ID insertado
  const inserted = await db.select().from(memberships).orderBy(desc(memberships.id)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create membership");
  return inserted[0];
}

export async function getMembershipById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(memberships).where(eq(memberships.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllMemberships() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(memberships).orderBy(desc(memberships.createdAt));
}

export async function updateMembershipStatus(id: number, status: "pending" | "verified" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let accessCode: string | undefined = undefined;
  if (status === "verified") {
    // Generar código único de 8 caracteres alfanuméricos en mayúsculas
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin O, I, 0, 1 para evitar confusión
    accessCode = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  await db.update(memberships).set({
    status,
    verifiedAt: status === "verified" ? new Date() : undefined,
    ...(accessCode ? { accessCode } : {}),
  }).where(eq(memberships.id, id));
  
  // Devolver la membresía actualizada con el accessCode
  const updated = await db.select().from(memberships).where(eq(memberships.id, id)).limit(1);
  return updated.length > 0 ? updated[0] : undefined;
}

export async function deleteMembership(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Primero eliminar los comprobantes de pago asociados
  await db.delete(paymentProofs).where(eq(paymentProofs.membershipId, id));
  
  // Luego eliminar la membresía
  return await db.delete(memberships).where(eq(memberships.id, id));
}

// Payment proof queries
export async function createPaymentProof(data: InsertPaymentProof) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(paymentProofs).values(data);
}

export async function getPaymentProofByMembershipId(membershipId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(paymentProofs).where(eq(paymentProofs.membershipId, membershipId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Appointments queries
export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(appointments).values(data);
  const inserted = await db.select().from(appointments).orderBy(desc(appointments.id)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create appointment");
  return inserted[0];
}

export async function getAllAppointments() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Admin credentials queries
export async function getAdminByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(adminCredentials).where(eq(adminCredentials.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAdminCredential(data: InsertAdminCredential) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(adminCredentials).values(data);
}

export async function setAdminResetToken(email: string, token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(adminCredentials)
    .set({ resetToken: token, resetTokenExpiresAt: expiresAt })
    .where(eq(adminCredentials.email, email));
}

export async function getAdminByResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adminCredentials)
    .where(eq(adminCredentials.resetToken, token))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAdminPassword(email: string, newPasswordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(adminCredentials)
    .set({ passwordHash: newPasswordHash, resetToken: null, resetTokenExpiresAt: null })
    .where(eq(adminCredentials.email, email));
}

// ── 2FA Login Token helpers ──
export async function setAdminLoginToken(email: string, token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(adminCredentials)
    .set({ loginToken: token, loginTokenExpiresAt: expiresAt, loginAuthorized: false })
    .where(eq(adminCredentials.email, email));
}

export async function getAdminByLoginToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adminCredentials)
    .where(eq(adminCredentials.loginToken, token))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function authorizeAdminLogin(token: string): Promise<string | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Generar session token único de 24 horas
  const crypto = await import('crypto');
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const sessionTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
  await db.update(adminCredentials)
    .set({ loginAuthorized: true, sessionToken, sessionTokenExpiresAt })
    .where(eq(adminCredentials.loginToken, token));
  return sessionToken;
}

export async function getAdminBySessionToken(sessionToken: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adminCredentials)
    .where(eq(adminCredentials.sessionToken, sessionToken))
    .limit(1);
  if (result.length === 0) return undefined;
  const admin = result[0];
  if (!admin.sessionTokenExpiresAt || new Date() > admin.sessionTokenExpiresAt) return undefined;
  return admin;
}

export async function checkAdminLoginAuthorized(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(adminCredentials)
    .where(eq(adminCredentials.email, email))
    .limit(1);
  if (result.length === 0) return false;
  const admin = result[0];
  if (!admin.loginToken || !admin.loginTokenExpiresAt) return false;
  if (new Date() > admin.loginTokenExpiresAt) return false;
  return admin.loginAuthorized === true;
}

export async function clearAdminLoginToken(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(adminCredentials)
    .set({ loginToken: null, loginTokenExpiresAt: null, loginAuthorized: false })
    .where(eq(adminCredentials.email, email));
}

export async function clearAdminSessionToken(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(adminCredentials)
    .set({ sessionToken: null, sessionTokenExpiresAt: null })
    .where(eq(adminCredentials.email, email));
}

// Coupon queries
export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCoupons() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function createCoupon(data: InsertCoupon) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(coupons).values(data);
  const inserted = await db.select().from(coupons).orderBy(desc(coupons.id)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create coupon");
  return inserted[0];
}

export async function approveCoupon(couponId: number, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(coupons)
    .set({ status: "active", approvedAt: new Date(), approvedBy: adminId })
    .where(eq(coupons.id, couponId));
  
  const result = await db.select().from(coupons).where(eq(coupons.id, couponId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function rejectCoupon(couponId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(coupons)
    .set({ status: "inactive" })
    .where(eq(coupons.id, couponId));
}

export async function createMembershipCoupon(data: InsertMembershipCoupon) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(membershipCoupons).values(data);
  const inserted = await db.select().from(membershipCoupons).orderBy(desc(membershipCoupons.id)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create membership coupon");
  return inserted[0];
}


// Promotion queries
export async function getAllPromotions() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  // Marcar automáticamente como inactivas las promociones vencidas
  await db.update(promotions)
    .set({ isActive: false })
    .where(
      and(
        eq(promotions.isActive, true),
        lt(promotions.expiresAt, now)
      )
    );
  
  return await db.select().from(promotions).where(eq(promotions.isActive, true)).orderBy(desc(promotions.createdAt));
}

export async function getPromotionsWithCouponCounts() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  // Marcar automáticamente como inactivas las promociones vencidas
  await db.update(promotions)
    .set({ isActive: false })
    .where(
      and(
        eq(promotions.isActive, true),
        lt(promotions.expiresAt, now)
      )
    );
  
  const promos = await db.select().from(promotions).where(eq(promotions.isActive, true)).orderBy(desc(promotions.createdAt));
  
  if (promos.length === 0) return [];
  
  // Contar cupones comprados (approved o used) por promoción
  const promoIds = promos.map(p => p.id);
  const counts = await db.select({
    promotionId: giftPurchases.promotionId,
    count: sql<number>`COUNT(*)`.as('count'),
  })
    .from(giftPurchases)
    .where(
      and(
        inArray(giftPurchases.promotionId, promoIds),
        inArray(giftPurchases.status, ['approved', 'used', 'pending'])
      )
    )
    .groupBy(giftPurchases.promotionId);
  
  const countMap = new Map(counts.map(c => [c.promotionId, Number(c.count)]));
  
  return promos.map(p => ({
    ...p,
    couponsSold: countMap.get(p.id) || 0,
    couponsRemaining: p.maxCoupons ? Math.max(0, p.maxCoupons - (countMap.get(p.id) || 0)) : null,
  }));
}

export async function getPromotionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(promotions).where(eq(promotions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPromotion(data: InsertPromotion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(promotions).values(data);
  const inserted = await db.select().from(promotions).orderBy(desc(promotions.id)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create promotion");
  return inserted[0];
}

export async function updatePromotion(id: number, data: Partial<InsertPromotion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(promotions)
    .set(data)
    .where(eq(promotions.id, id));
  
  const result = await db.select().from(promotions).where(eq(promotions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deletePromotion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Primero eliminar las compras de cupones asociadas (FK constraint)
  await db.delete(giftPurchases).where(eq(giftPurchases.promotionId, id));
  
  // Luego eliminar la promoción
  await db.delete(promotions).where(eq(promotions.id, id));
}

export async function getAllPromotionsForAdmin() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(promotions).orderBy(desc(promotions.createdAt));
}

export async function deleteAppointment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(appointments).where(eq(appointments.id, id));
  return { success: true };
}

export async function deleteAllAppointments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(appointments);
  return { success: true };
}

export async function cancelAppointment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(appointments).set({ status: "cancelled" }).where(eq(appointments.id, id));
  return { success: true };
}

// ===== GIFT PURCHASES =====

export async function createGiftPurchase(data: InsertGiftPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(giftPurchases).values(data);
  const id = (result as any)[0]?.insertId;
  return { id, ...data };
}

export async function getAllGiftPurchases() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(giftPurchases).orderBy(desc(giftPurchases.createdAt));
}

export async function getGiftPurchaseById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(giftPurchases).where(eq(giftPurchases.id, id));
  return result[0] || null;
}

export async function updateGiftPurchaseStatus(id: number, status: "pending" | "approved" | "rejected" | "used", couponCode?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(giftPurchases).set({ 
    status,
    approvedAt: status === "approved" ? new Date() : undefined,
    ...(couponCode ? { couponCode } : {}),
  }).where(eq(giftPurchases.id, id));
  return { success: true };
}

export async function deleteGiftPurchase(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(giftPurchases).where(eq(giftPurchases.id, id));
  return { success: true };
}

// ===== EBOOKS =====

export async function getActiveEbook() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(ebooks).where(eq(ebooks.isActive, true)).limit(1);
  return result[0] || null;
}

export async function getAllEbooks() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(ebooks).orderBy(desc(ebooks.createdAt));
}

export async function upsertEbook(data: Partial<InsertEbook> & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(ebooks).set(rest).where(eq(ebooks.id, id));
    const result = await db.select().from(ebooks).where(eq(ebooks.id, id)).limit(1);
    return result[0];
  } else {
    const result = await db.insert(ebooks).values(data as InsertEbook);
    const id = (result as any)[0]?.insertId;
    return { id, ...data };
  }
}

export async function createEbookPurchase(data: InsertEbookPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(ebookPurchases).values(data);
  const id = (result as any)[0]?.insertId;
  return { id, ...data };
}

export async function getAllEbookPurchases() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(ebookPurchases).orderBy(desc(ebookPurchases.createdAt));
}

export async function getEbookPurchaseByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(ebookPurchases).where(eq(ebookPurchases.accessToken, token)).limit(1);
  return result[0] || null;
}

export async function updateEbookPurchaseStatus(id: number, status: "pending" | "approved" | "rejected", accessPasswordHash?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(ebookPurchases).set({
    status,
    approvedAt: status === "approved" ? new Date() : undefined,
    ...(accessPasswordHash ? { accessPasswordHash } : {}),
  }).where(eq(ebookPurchases.id, id));
  return { success: true };
}

export async function deleteEbookPurchase(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(ebookPurchases).where(eq(ebookPurchases.id, id));
  return { success: true };
}

export async function getEbookPurchaseByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Obtener la compra aprobada más reciente para este email
  const result = await db.select().from(ebookPurchases)
    .where(eq(ebookPurchases.buyerEmail, email))
    .orderBy(desc(ebookPurchases.createdAt))
    .limit(1);
  return result[0] || null;
}

// ─── Códigos de descuento para eBook ─────────────────────────────────────────

export async function getAllEbookDiscountCodes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ebookDiscountCodes).orderBy(ebookDiscountCodes.discountPercent);
}

export async function getEbookDiscountCodeByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ebookDiscountCodes)
    .where(eq(ebookDiscountCodes.code, code.toLowerCase().trim()))
    .limit(1);
  return result[0] || null;
}

export async function toggleEbookDiscountCode(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.update(ebookDiscountCodes).set({ isActive }).where(eq(ebookDiscountCodes.id, id));
  return { success: true };
}

// ===== SERVICE PURCHASES =====

export async function createServicePurchase(data: InsertServicePurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(servicePurchases).values(data);
  const id = (result as any)[0]?.insertId;
  return { id, ...data };
}

export async function getAllServicePurchases() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(servicePurchases).orderBy(desc(servicePurchases.createdAt));
}

export async function updateServicePurchaseStatus(id: number, status: "pending" | "approved" | "rejected", serviceCode?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(servicePurchases).set({
    status,
    approvedAt: status === "approved" ? new Date() : undefined,
    ...(serviceCode ? { serviceCode } : {}),
  }).where(eq(servicePurchases.id, id));
  return { success: true };
}

export async function deleteServicePurchase(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(servicePurchases).where(eq(servicePurchases.id, id));
  return { success: true };
}

// ===== SERVICES CATALOG =====
export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(services).orderBy(services.sortOrder, services.id);
}

export async function getAllActiveServices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(services)
    .where(eq(services.isActive, true))
    .orderBy(services.sortOrder, services.id);
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(services).where(eq(services.id, id));
  return rows[0] ?? null;
}

export async function createService(data: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(services).values(data);
  return { id: Number((result as any)[0]?.insertId ?? 0) };
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(services).set(data).where(eq(services.id, id));
  return { success: true };
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(services).where(eq(services.id, id));
  return { success: true };
}

// ===== PRODUCTS CATALOG =====
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).orderBy(products.sortOrder, products.id);
}
export async function getAllActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.sortOrder, products.id);
}
export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0] ?? null;
}
export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return { id: Number((result as any)[0]?.insertId ?? 0) };
}
export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
  return { success: true };
}
export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
  return { success: true };
}

// ===== PRODUCT PURCHASES =====
export async function createProductPurchase(data: InsertProductPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(productPurchases).values(data);
  return { id: Number((result as any)[0]?.insertId ?? 0) };
}
export async function getAllProductPurchases() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(productPurchases).orderBy(desc(productPurchases.createdAt));
}
export async function updateProductPurchaseStatus(id: number, status: 'pending' | 'verified' | 'rejected') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productPurchases).set({ status }).where(eq(productPurchases.id, id));
  return { success: true };
}
export async function deleteProductPurchase(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productPurchases).where(eq(productPurchases.id, id));
  return { success: true };
}

// ===== DISCOUNT CODES (GENERAL) =====
export async function getAllDiscountCodes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(discountCodes).orderBy(discountCodes.discountPercent);
}

export async function validateDiscountCode(code: string): Promise<DiscountCode | null> {
  const db = await getDb();
  if (!db) return null;
  // Case-insensitive: normalize both sides to uppercase
  const normalizedCode = code.trim().toUpperCase();
  const result = await db.select().from(discountCodes)
    .where(and(
      sql`UPPER(${discountCodes.code}) = ${normalizedCode}`,
      eq(discountCodes.isActive, true)
    ))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function toggleDiscountCode(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(discountCodes).set({ isActive }).where(eq(discountCodes.id, id));
  return { success: true };
}

export async function incrementDiscountCodeUsage(code: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(discountCodes)
    .set({ usageCount: sql`${discountCodes.usageCount} + 1` })
    .where(eq(discountCodes.code, code));
}

// ===== CURSOS GRATUITOS =====
import { courses, courseVideos, courseDocuments, courseComments, courseSubscribers } from "../drizzle/schema";

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  const allCourses = await db.select().from(courses).orderBy(desc(courses.createdAt));
  // Cargar videos y documentos de cada curso para el panel admin
  const result = await Promise.all(allCourses.map(async (course) => {
    const videos = await db!.select().from(courseVideos).where(eq(courseVideos.courseId, course.id)).orderBy(courseVideos.sortOrder);
    const videosWithDocs = await Promise.all(videos.map(async (video) => {
      const documents = await db!.select().from(courseDocuments).where(eq(courseDocuments.videoId, video.id));
      return { ...video, documents };
    }));
    return { ...course, videos: videosWithDocs };
  }));
  return result;
}

export async function getPublishedCourses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses).where(eq(courses.isPublished, true)).orderBy(desc(courses.createdAt));
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return course;
}

export async function createCourse(data: { title: string; description?: string; thumbnailUrl?: string; category?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(courses).values(data);
  const [inserted] = await db.select().from(courses).orderBy(desc(courses.id)).limit(1);
  return inserted;
}

export async function updateCourse(id: number, data: Partial<{ title: string; description: string; thumbnailUrl: string; category: string; isPublished: boolean }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courses).set({ ...data, updatedAt: new Date() }).where(eq(courses.id, id));
  return { success: true };
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Obtener todos los videos del curso para eliminar sus comentarios y documentos
  const videos = await db.select().from(courseVideos).where(eq(courseVideos.courseId, id));
  for (const video of videos) {
    await db.delete(courseDocuments).where(eq(courseDocuments.videoId, video.id));
    await db.delete(courseComments).where(eq(courseComments.videoId, video.id));
  }
  await db.delete(courseVideos).where(eq(courseVideos.courseId, id));
  await db.delete(courses).where(eq(courses.id, id));
  return { success: true };
}

// Videos
export async function getVideosByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courseVideos).where(eq(courseVideos.courseId, courseId)).orderBy(courseVideos.sortOrder);
}

export async function getVideoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [video] = await db.select().from(courseVideos).where(eq(courseVideos.id, id)).limit(1);
  return video;
}

export async function createCourseVideo(data: { courseId: number; title: string; description?: string; videoUrl: string; thumbnailUrl?: string; duration?: string; sortOrder?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(courseVideos).values(data);
  const [inserted] = await db.select().from(courseVideos).orderBy(desc(courseVideos.id)).limit(1);
  return inserted;
}

export async function updateCourseVideo(id: number, data: Partial<{ title: string; description: string; thumbnailUrl: string; duration: string; sortOrder: number; isPublished: boolean }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courseVideos).set({ ...data, updatedAt: new Date() }).where(eq(courseVideos.id, id));
  return { success: true };
}

export async function deleteCourseVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(courseDocuments).where(eq(courseDocuments.videoId, id));
  await db.delete(courseComments).where(eq(courseComments.videoId, id));
  await db.delete(courseVideos).where(eq(courseVideos.id, id));
  return { success: true };
}

// Documentos
export async function getDocumentsByVideo(videoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courseDocuments).where(eq(courseDocuments.videoId, videoId));
}

export async function createCourseDocument(data: { videoId: number; title: string; fileUrl: string; fileType?: string; fileSize?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(courseDocuments).values(data);
  const [inserted] = await db.select().from(courseDocuments).orderBy(desc(courseDocuments.id)).limit(1);
  return inserted;
}

export async function deleteCourseDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(courseDocuments).where(eq(courseDocuments.id, id));
  return { success: true };
}

// Comentarios
export async function getApprovedCommentsByVideo(videoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courseComments)
    .where(and(eq(courseComments.videoId, videoId), eq(courseComments.status, "approved")))
    .orderBy(desc(courseComments.createdAt));
}

export async function getPendingComments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courseComments).where(eq(courseComments.status, "pending")).orderBy(desc(courseComments.createdAt));
}

export async function getAllCourseComments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courseComments).orderBy(desc(courseComments.createdAt));
}

export async function createCourseComment(data: { videoId: number; authorName: string; authorEmail?: string; content: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(courseComments).values(data);
  const [inserted] = await db.select().from(courseComments).orderBy(desc(courseComments.id)).limit(1);
  return inserted;
}

export async function updateCommentStatus(id: number, status: "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courseComments).set({
    status,
    approvedAt: status === "approved" ? new Date() : null,
  }).where(eq(courseComments.id, id));
  return { success: true };
}

export async function deleteCourseComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(courseComments).where(eq(courseComments.id, id));
  return { success: true };
}

// Suscriptores
export async function getAllCourseSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courseSubscribers).orderBy(desc(courseSubscribers.createdAt));
}

export async function createCourseSubscriber(data: { email?: string; name?: string; pushSubscription?: string; notifyByEmail?: boolean; notifyByPush?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(courseSubscribers).values(data);
  const [inserted] = await db.select().from(courseSubscribers).orderBy(desc(courseSubscribers.id)).limit(1);
  return inserted;
}

export async function deleteCourseSubscriber(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(courseSubscribers).where(eq(courseSubscribers.id, id));
  return { success: true };
}


// ============================================================
// TOPIC SUGGESTIONS (Foro de sugerencias para Nutriser Academy)
// ============================================================

export async function getApprovedSuggestions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(topicSuggestions)
    .where(inArray(topicSuggestions.status, ['approved', 'published']))
    .orderBy(desc(topicSuggestions.votes), desc(topicSuggestions.createdAt));
}

export async function getAllSuggestions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(topicSuggestions)
    .orderBy(desc(topicSuggestions.createdAt));
}

export async function getPendingSuggestions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(topicSuggestions)
    .where(eq(topicSuggestions.status, "pending"))
    .orderBy(desc(topicSuggestions.createdAt));
}

export async function createTopicSuggestion(data: InsertTopicSuggestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(topicSuggestions).values(data);
  const [inserted] = await db.select().from(topicSuggestions).orderBy(desc(topicSuggestions.id)).limit(1);
  return inserted;
}

export async function approveSuggestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(topicSuggestions).set({ status: "approved" }).where(eq(topicSuggestions.id, id));
  return { success: true };
}

export async function rejectSuggestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(topicSuggestions).set({ status: "rejected" }).where(eq(topicSuggestions.id, id));
  return { success: true };
}

export async function markSuggestionPublished(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(topicSuggestions).set({ status: "published" }).where(eq(topicSuggestions.id, id));
  return { success: true };
}

export async function deleteSuggestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(topicVotes).where(eq(topicVotes.suggestionId, id));
  await db.delete(topicSuggestions).where(eq(topicSuggestions.id, id));
  return { success: true };
}

export async function voteForSuggestion(suggestionId: number, voterFingerprint: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if already voted
  const [existing] = await db.select().from(topicVotes)
    .where(and(eq(topicVotes.suggestionId, suggestionId), eq(topicVotes.voterFingerprint, voterFingerprint)));
  if (existing) return { alreadyVoted: true };
  // Register vote
  await db.insert(topicVotes).values({ suggestionId, voterFingerprint });
  await db.update(topicSuggestions).set({ votes: sql`votes + 1` }).where(eq(topicSuggestions.id, suggestionId));
  return { alreadyVoted: false };
}

export async function hasVoted(suggestionId: number, voterFingerprint: string) {
  const db = await getDb();
  if (!db) return false;
  const [existing] = await db.select().from(topicVotes)
    .where(and(eq(topicVotes.suggestionId, suggestionId), eq(topicVotes.voterFingerprint, voterFingerprint)));
  return !!existing;
}

// ============================================================
// MÓDULO MIS TRATAMIENTOS — Helpers de pacientes
// ============================================================

export async function createPatientAccount(data: InsertPatientAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(patientAccounts).values(data);
  const inserted = await db.select().from(patientAccounts).where(eq(patientAccounts.email, data.email)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create patient account");
  return inserted[0];
}

export async function getPatientByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  // Case-insensitive email search
  const result = await db.select().from(patientAccounts)
    .where(sql`LOWER(${patientAccounts.email}) = LOWER(${email})`)
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patientAccounts).where(eq(patientAccounts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPatients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patientAccounts).orderBy(desc(patientAccounts.createdAt));
}

export async function updatePatientConsent(id: number, signature: string, pdfUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(patientAccounts).set({
    consentAcceptedAt: new Date(),
    consentSignature: signature,
    consentPdfUrl: pdfUrl,
  }).where(eq(patientAccounts.id, id));
  return { success: true };
}

export async function setPatientResetToken(email: string, token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(patientAccounts).set({ resetToken: token, resetTokenExpiresAt: expiresAt }).where(eq(patientAccounts.email, email));
  return { success: true };
}

export async function getPatientByResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patientAccounts).where(eq(patientAccounts.resetToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePatientPassword(id: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(patientAccounts).set({ passwordHash, resetToken: null, resetTokenExpiresAt: null }).where(eq(patientAccounts.id, id));
  return { success: true };
}

export async function updatePatientPushSubscription(id: number, pushSubscription: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(patientAccounts).set({ pushSubscription }).where(eq(patientAccounts.id, id));
  return { success: true };
}

// Patient Treatments
export async function createPatientTreatment(data: InsertPatientTreatment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(patientTreatments).values(data);
  const inserted = await db.select().from(patientTreatments).orderBy(desc(patientTreatments.id)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create treatment");
  return inserted[0];
}

export async function getPatientTreatments(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patientTreatments).where(eq(patientTreatments.patientId, patientId)).orderBy(desc(patientTreatments.createdAt));
}

export async function updatePatientTreatment(id: number, data: Partial<InsertPatientTreatment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(patientTreatments).set(data).where(eq(patientTreatments.id, id));
  const updated = await db.select().from(patientTreatments).where(eq(patientTreatments.id, id)).limit(1);
  return updated.length > 0 ? updated[0] : undefined;
}

export async function deletePatientTreatment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(patientAppointments).where(eq(patientAppointments.treatmentId, id));
  await db.delete(patientTreatments).where(eq(patientTreatments.id, id));
  return { success: true };
}

// Patient Appointments
export async function createPatientAppointment(data: InsertPatientAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(patientAppointments).values(data);
  const inserted = await db.select().from(patientAppointments).orderBy(desc(patientAppointments.id)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create appointment");
  return inserted[0];
}

export async function getPatientAppointments(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patientAppointments).where(eq(patientAppointments.patientId, patientId)).orderBy(patientAppointments.appointmentDate, patientAppointments.appointmentTime);
}

export async function updatePatientAppointment(id: number, data: Partial<InsertPatientAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(patientAppointments).set(data).where(eq(patientAppointments.id, id));
  return { success: true };
}

export async function deletePatientAppointment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(patientAppointments).where(eq(patientAppointments.id, id));
  return { success: true };
}

// Patient Photos
export async function createPatientPhoto(data: InsertPatientPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(patientPhotos).values(data);
  const inserted = await db.select().from(patientPhotos).orderBy(desc(patientPhotos.id)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create photo");
  return inserted[0];
}

export async function getPatientPhotos(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patientPhotos).where(eq(patientPhotos.patientId, patientId)).orderBy(patientPhotos.photoDate, patientPhotos.createdAt);
}

export async function deletePatientPhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(patientPhotos).where(eq(patientPhotos.id, id));
  return { success: true };
}

// Delete patient account and all related data
export async function deletePatientAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete related data first (cascade)
  await db.delete(patientPhotos).where(eq(patientPhotos.patientId, id));
  await db.delete(patientAppointments).where(eq(patientAppointments.patientId, id));
  await db.delete(patientTreatments).where(eq(patientTreatments.patientId, id));
  await db.delete(patientAccounts).where(eq(patientAccounts.id, id));
  return { success: true };
}

// Get memberships (paquetes) by patient email — for admin patient detail view
export async function getMembershipsByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberships).where(eq(memberships.clientEmail, email.toLowerCase().trim())).orderBy(desc(memberships.createdAt));
}

// Get gift purchases (cupones comprados) by buyer email — for admin patient detail view
export async function getGiftPurchasesByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(giftPurchases).where(eq(giftPurchases.buyerEmail, email.toLowerCase().trim())).orderBy(desc(giftPurchases.createdAt));
}

export async function getServicePurchasesByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(servicePurchases).where(eq(servicePurchases.buyerEmail, email.toLowerCase().trim())).orderBy(desc(servicePurchases.createdAt));
}

export async function lookupServiceByEmailAndCode(email: string, code: string) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(servicePurchases).where(
    and(
      eq(servicePurchases.buyerEmail, email.toLowerCase().trim()),
      eq(servicePurchases.serviceCode, code.toUpperCase().trim())
    )
  ).limit(1);
  return results[0] ?? null;
}

// ============================================================
// CARRITO PERSISTENTE — Nutriser Shop
// ============================================================
import { shopCartItems, InsertShopCartItem, ShopCartItem } from '../drizzle/schema';

export async function getCartItemsByPatient(patientId: number): Promise<ShopCartItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shopCartItems).where(eq(shopCartItems.patientId, patientId)).orderBy(shopCartItems.createdAt);
}

export async function upsertCartItem(patientId: number, data: Omit<InsertShopCartItem, 'patientId' | 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if item already exists
  const existing = await db.select().from(shopCartItems)
    .where(and(eq(shopCartItems.patientId, patientId), eq(shopCartItems.itemKey, data.itemKey)))
    .limit(1);
  if (existing.length > 0) {
    await db.update(shopCartItems)
      .set({ qty: data.qty, updatedAt: new Date() })
      .where(and(eq(shopCartItems.patientId, patientId), eq(shopCartItems.itemKey, data.itemKey)));
  } else {
    await db.insert(shopCartItems).values({ ...data, patientId });
  }
}

export async function removeCartItem(patientId: number, itemKey: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(shopCartItems).where(and(eq(shopCartItems.patientId, patientId), eq(shopCartItems.itemKey, itemKey)));
}

export async function clearCart(patientId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(shopCartItems).where(eq(shopCartItems.patientId, patientId));
}


// ============================================================
// MONEDERO ELECTRÓNICO — DB Helpers
// ============================================================
import { wallets, InsertWallet, Wallet, walletTransactions, InsertWalletTransaction, WalletTransaction, loyaltyTracker, InsertLoyaltyTracker, LoyaltyTracker, loyaltyPlans, InsertLoyaltyPlan, LoyaltyPlan, loyaltyProgress, InsertLoyaltyProgress, LoyaltyProgress } from '../drizzle/schema';

/** Generate unique wallet number like NUT-XXXX-XXXX */
function generateWalletNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const seg2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `NUT-${seg1}-${seg2}`;
}

/** Create wallet for a patient (called on registration) */
export async function createWallet(patientId: number): Promise<Wallet> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if wallet already exists
  const existing = await db.select().from(wallets).where(eq(wallets.patientId, patientId)).limit(1);
  if (existing.length > 0) return existing[0];
  
  // Generate unique number with retry
  let walletNumber = generateWalletNumber();
  for (let i = 0; i < 5; i++) {
    const dup = await db.select().from(wallets).where(eq(wallets.walletNumber, walletNumber)).limit(1);
    if (dup.length === 0) break;
    walletNumber = generateWalletNumber();
  }
  
  // Calcular fecha de caducidad bimestral (2 meses desde hoy)
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 2);
  
  await db.insert(wallets).values({ patientId, walletNumber, balanceExpiresAt: expiresAt });
  const [wallet] = await db.select().from(wallets).where(eq(wallets.patientId, patientId)).limit(1);
  
  // Also create loyalty tracker
  await db.insert(loyaltyTracker).values({ walletId: wallet.id }).catch(() => {});
  
  return wallet;
}

/** Get wallet by patient ID */
export async function getWalletByPatientId(patientId: number): Promise<Wallet | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [wallet] = await db.select().from(wallets).where(eq(wallets.patientId, patientId)).limit(1);
  return wallet;
}

/** Get wallet by ID */
export async function getWalletById(walletId: number): Promise<Wallet | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [wallet] = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
  return wallet;
}

/** Get wallet by wallet number (for QR/code lookup) */
export async function getWalletByNumber(walletNumber: string): Promise<Wallet | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [wallet] = await db.select().from(wallets).where(eq(wallets.walletNumber, walletNumber)).limit(1);
  return wallet;
}

/** Get all wallets (admin) */
export async function getAllWallets() {
  const db = await getDb();
  if (!db) return [];
  // Obtener wallets con datos del paciente
  const rows = await db.select({
    wallet: wallets,
    patient: {
      id: patientAccounts.id,
      name: patientAccounts.name,
      email: patientAccounts.email,
      phone: patientAccounts.phone,
    }
  }).from(wallets)
    .innerJoin(patientAccounts, eq(wallets.patientId, patientAccounts.id))
    .orderBy(desc(wallets.createdAt));

  // Enriquecer con loyaltyTracker y loyaltyProgress de cada wallet
  const enriched = await Promise.all(rows.map(async (row) => {
    const tracker = await getLoyaltyTracker(row.wallet.id);
    const progress = await getWalletLoyaltyProgress(row.wallet.id);
    return { ...row, tracker, progress };
  }));
  return enriched;
}

/** Add a transaction to a wallet */
export async function addWalletTransaction(data: {
  walletId: number;
  type: "cashback" | "redeem" | "bonus" | "adjustment" | "free_consultation";
  amount: number; // centavos, positivo = ingreso, negativo = egreso
  description: string;
  referenceType?: string;
  referenceId?: number;
  createdBy?: string;
}): Promise<WalletTransaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get current wallet
  const [wallet] = await db.select().from(wallets).where(eq(wallets.id, data.walletId)).limit(1);
  if (!wallet) throw new Error("Wallet not found");
  
  const newBalance = wallet.balance + data.amount;
  if (newBalance < 0) throw new Error("Saldo insuficiente");
  
  // Update wallet balance
  const updateData: Record<string, any> = { balance: newBalance };
  if (data.amount > 0 && (data.type === 'cashback' || data.type === 'bonus')) {
    updateData.totalCashback = wallet.totalCashback + data.amount;
    // Renovar fecha de caducidad bimestral al acreditar saldo
    const newExpiry = new Date();
    newExpiry.setMonth(newExpiry.getMonth() + 2);
    updateData.balanceExpiresAt = newExpiry;
  }
  if (data.amount < 0 && data.type === 'redeem') {
    updateData.totalRedeemed = wallet.totalRedeemed + Math.abs(data.amount);
  }
  await db.update(wallets).set(updateData).where(eq(wallets.id, data.walletId));
  
  // Insert transaction
  await db.insert(walletTransactions).values({
    walletId: data.walletId,
    type: data.type,
    amount: data.amount,
    description: data.description,
    referenceType: data.referenceType || null,
    referenceId: data.referenceId || null,
    balanceAfter: newBalance,
    createdBy: data.createdBy || 'system',
  });
  
  const txns = await db.select().from(walletTransactions)
    .where(eq(walletTransactions.walletId, data.walletId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(1);
  return txns[0];
}

/** Get wallet transactions */
export async function getWalletTransactions(walletId: number, limit = 50): Promise<WalletTransaction[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(walletTransactions)
    .where(eq(walletTransactions.walletId, walletId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(limit);
}

/** Admin: eliminar una transacción específica del historial */
export async function deleteWalletTransaction(transactionId: number): Promise<{ deleted: number }> {
  const db = await getDb();
  if (!db) return { deleted: 0 };
  const result = await db.delete(walletTransactions).where(eq(walletTransactions.id, transactionId));
  return { deleted: (result as any).affectedRows ?? 0 };
}

/** Admin: eliminar todos los movimientos del historial de un monedero */
export async function clearAllWalletTransactions(walletId: number): Promise<{ deleted: number }> {
  const db = await getDb();
  if (!db) return { deleted: 0 };
  const result = await db.delete(walletTransactions).where(eq(walletTransactions.walletId, walletId));
  return { deleted: (result as any).affectedRows ?? 0 };
}

/** Get loyalty tracker for a wallet */
export async function getLoyaltyTracker(walletId: number): Promise<LoyaltyTracker | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [tracker] = await db.select().from(loyaltyTracker).where(eq(loyaltyTracker.walletId, walletId)).limit(1);
  return tracker;
}

/** Increment consultation count and check for free consultation */
export async function recordConsultation(walletId: number): Promise<{ freeEarned: boolean; totalConsultations: number; freeAvailable: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let [tracker] = await db.select().from(loyaltyTracker).where(eq(loyaltyTracker.walletId, walletId)).limit(1);
  if (!tracker) {
    await db.insert(loyaltyTracker).values({ walletId });
    [tracker] = await db.select().from(loyaltyTracker).where(eq(loyaltyTracker.walletId, walletId)).limit(1);
  }
  
  const newCount = tracker.nutritionConsultations + 1;
  const newFreeEarned = Math.floor(newCount / 3);
  const earnedThisTime = newFreeEarned > tracker.freeConsultationsEarned;
  
  await db.update(loyaltyTracker).set({
    nutritionConsultations: newCount,
    freeConsultationsEarned: newFreeEarned,
  }).where(eq(loyaltyTracker.id, tracker.id));
  
  if (earnedThisTime) {
    await addWalletTransaction({
      walletId,
      type: 'free_consultation',
      amount: 0,
      description: `¡Consulta nutricional #${newCount}! Has ganado 1 consulta GRATIS`,
      referenceType: 'consultation',
      createdBy: 'system',
    });
  }
  
  return {
    freeEarned: earnedThisTime,
    totalConsultations: newCount,
    freeAvailable: newFreeEarned - tracker.freeConsultationsUsed,
  };
}

/** Use a free consultation */
export async function useFreeConsultation(walletId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const [tracker] = await db.select().from(loyaltyTracker).where(eq(loyaltyTracker.walletId, walletId)).limit(1);
  if (!tracker) return false;
  
  const available = tracker.freeConsultationsEarned - tracker.freeConsultationsUsed;
  if (available <= 0) return false;
  
  await db.update(loyaltyTracker).set({
    freeConsultationsUsed: tracker.freeConsultationsUsed + 1,
  }).where(eq(loyaltyTracker.id, tracker.id));
  
  return true;
}

// ============================================================
// PLANES DE LEALTAD — DB Helpers
// ============================================================

/** Create a loyalty plan (admin) */
export async function createLoyaltyPlan(data: InsertLoyaltyPlan): Promise<LoyaltyPlan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(loyaltyPlans).values(data);
  const plans = await db.select().from(loyaltyPlans).orderBy(desc(loyaltyPlans.createdAt)).limit(1);
  return plans[0];
}

/** Get all active loyalty plans */
export async function getActiveLoyaltyPlans(): Promise<LoyaltyPlan[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loyaltyPlans).where(eq(loyaltyPlans.isActive, true)).orderBy(loyaltyPlans.createdAt);
}

/** Get all loyalty plans (admin) */
export async function getAllLoyaltyPlans(): Promise<LoyaltyPlan[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loyaltyPlans).orderBy(desc(loyaltyPlans.createdAt));
}

/** Update loyalty plan */
export async function updateLoyaltyPlan(id: number, data: Partial<InsertLoyaltyPlan>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(loyaltyPlans).set(data).where(eq(loyaltyPlans.id, id));
}

/** Delete loyalty plan */
export async function deleteLoyaltyPlan(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(loyaltyPlans).where(eq(loyaltyPlans.id, id));
}

/** Get loyalty progress for a wallet */
export async function getWalletLoyaltyProgress(walletId: number): Promise<(LoyaltyProgress & { plan: LoyaltyPlan })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    progress: loyaltyProgress,
    plan: loyaltyPlans,
  }).from(loyaltyProgress)
    .innerJoin(loyaltyPlans, eq(loyaltyProgress.planId, loyaltyPlans.id))
    .where(eq(loyaltyProgress.walletId, walletId));
  return rows.map(r => ({ ...r.progress, plan: r.plan }));
}

/** Record a purchase for a loyalty plan */
export async function recordLoyaltyPurchase(walletId: number, planId: number): Promise<{ rewardEarned: boolean; currentCount: number; required: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get plan
  const [plan] = await db.select().from(loyaltyPlans).where(eq(loyaltyPlans.id, planId)).limit(1);
  if (!plan) throw new Error("Plan not found");
  
  // Get or create progress
  let [progress] = await db.select().from(loyaltyProgress)
    .where(and(eq(loyaltyProgress.walletId, walletId), eq(loyaltyProgress.planId, planId)))
    .limit(1);
  
  if (!progress) {
    await db.insert(loyaltyProgress).values({ walletId, planId, currentCount: 0 });
    [progress] = await db.select().from(loyaltyProgress)
      .where(and(eq(loyaltyProgress.walletId, walletId), eq(loyaltyProgress.planId, planId)))
      .limit(1);
  }
  
  const newCount = progress.currentCount + 1;
  const rewardEarned = newCount >= plan.requiredPurchases;
  
  if (rewardEarned) {
    // Reset counter and increment rewards
    await db.update(loyaltyProgress).set({
      currentCount: 0,
      rewardsEarned: progress.rewardsEarned + 1,
    }).where(eq(loyaltyProgress.id, progress.id));
  } else {
    await db.update(loyaltyProgress).set({
      currentCount: newCount,
    }).where(eq(loyaltyProgress.id, progress.id));
  }
  
  return {
    rewardEarned,
    currentCount: rewardEarned ? 0 : newCount,
    required: plan.requiredPurchases,
  };
}

/** Use a loyalty reward */
export async function useLoyaltyReward(walletId: number, planId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const [progress] = await db.select().from(loyaltyProgress)
    .where(and(eq(loyaltyProgress.walletId, walletId), eq(loyaltyProgress.planId, planId)))
    .limit(1);
  
  if (!progress) return false;
  const available = progress.rewardsEarned - progress.rewardsUsed;
  if (available <= 0) return false;
  
  await db.update(loyaltyProgress).set({
    rewardsUsed: progress.rewardsUsed + 1,
  }).where(eq(loyaltyProgress.id, progress.id));
  
  return true;
}

/** Admin: set wallet balance directly */
export async function adminSetWalletBalance(walletId: number, newBalance: number, adminEmail: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [wallet] = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
  if (!wallet) throw new Error("Wallet not found");
  
  const diff = newBalance - wallet.balance;
  await db.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, walletId));
  
  await db.insert(walletTransactions).values({
    walletId,
    type: 'adjustment',
    amount: diff,
    description: `Ajuste manual por admin: ${adminEmail}`,
    balanceAfter: newBalance,
    createdBy: `admin:${adminEmail}`,
  });
}

/** Admin: toggle wallet active status */
export async function toggleWalletActive(walletId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [wallet] = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
  if (!wallet) throw new Error("Wallet not found");
  const newStatus = !wallet.isActive;
  await db.update(wallets).set({ isActive: newStatus }).where(eq(wallets.id, walletId));
  return newStatus;
}

/** Activar un descuento en el monedero (10, 15, 20, 25 o 30%) */
export async function setWalletDiscount(walletId: number, discountPercent: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(wallets)
    .set({ discountPercent, discountActivatedAt: new Date() })
    .where(eq(wallets.id, walletId));
}

/** Desactivar el descuento del monedero (pone null) */
export async function removeWalletDiscount(walletId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(wallets)
    .set({ discountPercent: null, discountActivatedAt: null })
    .where(eq(wallets.id, walletId));
}

// ─── Analítica de Comportamiento ──────────────────────────────────────────────
import { userBehaviorEvents, InsertUserBehaviorEvent } from '../drizzle/schema';

/** Registrar un evento de comportamiento de usuario */
export async function trackBehaviorEvent(data: InsertUserBehaviorEvent): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(userBehaviorEvents).values(data);
}

/** Obtener top items por tipo de evento */
export async function getTopBehaviorItems(opts: {
  eventType?: "view" | "wishlist" | "cart" | "info" | "purchase";
  itemType?: "service" | "product" | "ebook" | "package" | "promotion";
  limit?: number;
  days?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const { eventType, itemType, limit = 10, days = 30 } = opts;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const conditions: any[] = [sql`${userBehaviorEvents.createdAt} >= ${since}`];
  if (eventType) conditions.push(eq(userBehaviorEvents.eventType, eventType));
  if (itemType) conditions.push(eq(userBehaviorEvents.itemType, itemType));
  return await db
    .select({
      itemId: userBehaviorEvents.itemId,
      itemName: userBehaviorEvents.itemName,
      itemType: userBehaviorEvents.itemType,
      eventType: userBehaviorEvents.eventType,
      count: sql<number>`COUNT(*)`,
    })
    .from(userBehaviorEvents)
    .where(and(...conditions))
    .groupBy(
      userBehaviorEvents.itemId,
      userBehaviorEvents.itemName,
      userBehaviorEvents.itemType,
      userBehaviorEvents.eventType
    )
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);
}

/** Resumen de eventos por tipo */
export async function getBehaviorSummary(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return await db
    .select({
      eventType: userBehaviorEvents.eventType,
      count: sql<number>`COUNT(*)`,
    })
    .from(userBehaviorEvents)
    .where(sql`${userBehaviorEvents.createdAt} >= ${since}`)
    .groupBy(userBehaviorEvents.eventType)
    .orderBy(sql`COUNT(*) DESC`);
}

/** Tendencia diaria */
export async function getBehaviorTrend(days = 7) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  // Use raw SQL with alias to avoid MySQL only_full_group_by restriction
  const rows = await db.execute(
    sql`SELECT DATE(createdAt) AS date, eventType, COUNT(*) AS count
        FROM userBehaviorEvents
        WHERE createdAt >= ${since}
        GROUP BY DATE(createdAt), eventType
        ORDER BY DATE(createdAt) ASC`
  );
  return (rows[0] as unknown as any[]).map((r: any) => ({
    date: typeof r.date === "string" ? r.date : (r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date)),
    eventType: r.eventType as string,
    count: Number(r.count),
  }));
}

/** Reiniciar todos los eventos de comportamiento (borrar todos los registros) */
export async function resetAllBehaviorEvents(): Promise<{ deleted: number }> {
  const db = await getDb();
  if (!db) return { deleted: 0 };
  // Count first
  const countResult = await db.select({ count: sql<number>`COUNT(*)` }).from(userBehaviorEvents);
  const total = Number(countResult[0]?.count ?? 0);
  // Delete all
  await db.delete(userBehaviorEvents);
  return { deleted: total };
}

// ============================================================
// PAGOS EN EFECTIVO PENDIENTES
// ============================================================

import { cashPendingPayments, type InsertCashPendingPayment, type CashPendingPayment } from '../drizzle/schema';
import { splashAds, type SplashAd, type InsertSplashAd } from '../drizzle/schema';

/** Crear un pago en efectivo pendiente */
export async function createCashPendingPayment(data: InsertCashPendingPayment): Promise<CashPendingPayment> {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const [row] = await db.insert(cashPendingPayments).values(data).$returningId();
  const result = await db.select().from(cashPendingPayments).where(eq(cashPendingPayments.id, row.id)).limit(1);
  return result[0];
}

/** Obtener pagos pendientes de un wallet */
export async function getCashPendingPaymentsByWallet(walletId: number): Promise<CashPendingPayment[]> {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(cashPendingPayments)
    .where(and(eq(cashPendingPayments.walletId, walletId), eq(cashPendingPayments.status, 'pending')))
    .orderBy(cashPendingPayments.createdAt);
}

/** Obtener todos los pagos pendientes (para admin) */
export async function getAllCashPendingPayments(): Promise<CashPendingPayment[]> {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(cashPendingPayments)
    .where(eq(cashPendingPayments.status, 'pending'))
    .orderBy(cashPendingPayments.createdAt);
}

/** Obtener un pago pendiente por ID */
export async function getCashPendingPaymentById(id: number): Promise<CashPendingPayment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(cashPendingPayments).where(eq(cashPendingPayments.id, id)).limit(1);
  return row;
}

/** Confirmar un pago en efectivo (admin) */
export async function confirmCashPayment(id: number, confirmedBy: string): Promise<CashPendingPayment> {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.update(cashPendingPayments)
    .set({ status: 'confirmed', confirmedAt: new Date(), confirmedBy })
    .where(eq(cashPendingPayments.id, id));
  const result = await db.select().from(cashPendingPayments).where(eq(cashPendingPayments.id, id)).limit(1);
  return result[0];
}

/** Cancelar un pago en efectivo */
export async function cancelCashPayment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(cashPendingPayments)
    .set({ status: 'cancelled', cancelledAt: new Date() })
    .where(eq(cashPendingPayments.id, id));
}

/** Historial de pagos en efectivo de un wallet (todos los estados) */
export async function getCashPaymentHistoryByWallet(walletId: number): Promise<CashPendingPayment[]> {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(cashPendingPayments)
    .where(eq(cashPendingPayments.walletId, walletId))
    .orderBy(cashPendingPayments.createdAt);
}

/** Obtener pagos en clínica confirmados de un paciente (por patientId) — para Mis Compras */
export async function getConfirmedCashPaymentsByPatient(patientId: number): Promise<CashPendingPayment[]> {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(cashPendingPayments)
    .where(and(eq(cashPendingPayments.patientId, patientId), eq(cashPendingPayments.status, 'confirmed')))
    .orderBy(desc(cashPendingPayments.createdAt));
}

/** Eliminar un pago en efectivo del historial (admin) — para corregir errores */
export async function deleteCashPayment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(cashPendingPayments).where(eq(cashPendingPayments.id, id));
}

// ─── Splash Ads ────────────────────────────────────────────────────────────────

/** Obtener todos los splash ads activos de un tipo (para mostrar al paciente) */
export async function getActiveSplashAds(type: 'inicio' | 'tienda') {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(splashAds)
    .where(and(eq(splashAds.type, type), eq(splashAds.isActive, true)))
    .orderBy(asc(splashAds.sortOrder), desc(splashAds.createdAt));
}

/** Obtener todos los splash ads (admin) */
export async function getAllSplashAds() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(splashAds)
    .orderBy(asc(splashAds.type), asc(splashAds.sortOrder), desc(splashAds.createdAt));
}

/** Crear un nuevo splash ad */
export async function createSplashAd(data: {
  type: 'inicio' | 'tienda';
  imageUrl: string;
  title?: string | null;
  subtitle?: string | null;
  linkUrl?: string | null;
  sortOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const [result] = await db.insert(splashAds).values({
    type: data.type,
    imageUrl: data.imageUrl,
    title: data.title ?? null,
    subtitle: data.subtitle ?? null,
    linkUrl: data.linkUrl ?? null,
    isActive: true,
    sortOrder: data.sortOrder ?? 0,
  });
  const [ad] = await db.select().from(splashAds).where(eq(splashAds.id, (result as any).insertId)).limit(1);
  return ad;
}

/** Activar/desactivar un splash ad */
export async function toggleSplashAd(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(splashAds).set({ isActive }).where(eq(splashAds.id, id));
}

/** Eliminar un splash ad */
export async function deleteSplashAd(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(splashAds).where(eq(splashAds.id, id));
}

/** Actualizar orden de splash ads */
export async function updateSplashAdOrder(id: number, sortOrder: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(splashAds).set({ sortOrder }).where(eq(splashAds.id, id));
}

// ─── Splash Config ───────────────────────────────────────────────────────────
import { splashConfig } from '../drizzle/schema';

/** Obtiene si se debe mostrar la slide fija (Monedero/ShopCard) para un tipo de splash */
export async function getSplashConfig(type: 'inicio' | 'tienda') {
  const db = await getDb();
  if (!db) return { showDefault: false };
  const [row] = await db.select().from(splashConfig).where(eq(splashConfig.type, type)).limit(1);
  return row ?? { showDefault: false };
}

/** Actualiza si se debe mostrar la slide fija para un tipo de splash */
export async function setSplashShowDefault(type: 'inicio' | 'tienda', showDefault: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(splashConfig).set({ showDefault }).where(eq(splashConfig.type, type));
}

/** Actualiza la imagen personalizada de la slide fija (null = usar diseño automático) */
export async function setSplashCustomImage(type: 'inicio' | 'tienda', customImageUrl: string | null) {
  const db = await getDb();
  if (!db) return;
  const [existing] = await db.select().from(splashConfig).where(eq(splashConfig.type, type)).limit(1);
  if (existing) {
    await db.update(splashConfig).set({ customImageUrl }).where(eq(splashConfig.type, type));
  } else {
    await db.insert(splashConfig).values({ type, showDefault: false, customImageUrl });
  }
}

// ─── Auto-desactivación de promociones vencidas ──────────────────────────────
// ─── Aparador - Tienda Principal (storeBanners) ──────────────────────────────
/** Obtiene todos los banners activos ordenados por sortOrder */
export async function getActiveStoreBanners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(storeBanners)
    .where(eq(storeBanners.isActive, true))
    .orderBy(storeBanners.sortOrder);
}
/** Obtiene todos los banners (admin) */
export async function getAllStoreBanners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(storeBanners).orderBy(storeBanners.sortOrder);
}
/** Crea un banner */
export async function createStoreBanner(data: Omit<InsertStoreBanner, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.insert(storeBanners).values(data);
  const [inserted] = await db.select().from(storeBanners).orderBy(desc(storeBanners.id)).limit(1);
  return inserted;
}
/** Activa/desactiva un banner */
export async function toggleStoreBanner(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(storeBanners).set({ isActive }).where(eq(storeBanners.id, id));
}
/** Elimina un banner */
export async function deleteStoreBanner(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(storeBanners).where(eq(storeBanners.id, id));
}
/** Actualiza el orden de un banner */
export async function updateStoreBannerOrder(id: number, sortOrder: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(storeBanners).set({ sortOrder }).where(eq(storeBanners.id, id));
}

// ─── Banner Interests - Solicitudes de interés en promociones ───────────────
/** Crea una solicitud de interés en una promoción del banner */
export async function createBannerInterest(data: Omit<InsertBannerInterest, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.insert(bannerInterests).values(data);
  const [inserted] = await db.select().from(bannerInterests).orderBy(desc(bannerInterests.id)).limit(1);
  return inserted;
}
/** Obtiene todas las solicitudes pendientes (para el admin) */
export async function getPendingBannerInterests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bannerInterests)
    .where(eq(bannerInterests.status, 'pending'))
    .orderBy(desc(bannerInterests.createdAt));
}
/** Obtiene todas las solicitudes (para el admin) */
export async function getAllBannerInterests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bannerInterests).orderBy(desc(bannerInterests.createdAt));
}
/** Obtiene las solicitudes de un usuario */
export async function getBannerInterestsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bannerInterests)
    .where(eq(bannerInterests.userId, userId))
    .orderBy(desc(bannerInterests.createdAt));
}
/** Marca una solicitud como atendida y acredita al monedero */
export async function attendBannerInterest(id: number, adminNotes?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(bannerInterests)
    .set({ status: 'attended', adminNotes: adminNotes ?? null, attendedAt: new Date() })
    .where(eq(bannerInterests.id, id));
}

export async function deleteBannerInterest(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(bannerInterests).where(eq(bannerInterests.id, id));
}

/** Desactiva automáticamente todas las promociones cuyo expiresAt ya pasó. Retorna el número de filas afectadas. */
export async function autoDeactivateExpiredPromotions(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const now = new Date();
  const result = await db.update(promotions)
    .set({ isActive: false })
    .where(
      and(
        eq(promotions.isActive, true),
        lt(promotions.expiresAt, now)
      )
    );
  return (result as any)?.[0]?.affectedRows ?? 0;
}

// ─── Configuración del sistema ─────────────────────────────────────────────
/** Obtiene el valor de una clave de configuración del sistema */
export async function getSystemConfig(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(systemConfig).where(eq(systemConfig.key, key)).limit(1);
  return rows[0]?.value ?? null;
}
/** Establece o actualiza el valor de una clave de configuración del sistema */
export async function setSystemConfig(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.execute(
    sql`INSERT INTO systemConfig (\`key\`, value) VALUES (${key}, ${value})
        ON DUPLICATE KEY UPDATE value = ${value}`
  );
}

// ─── Administración del Monedero ──────────────────────────────────────────────

/**
 * Reinicia el monedero de un paciente: pone balance, totalCashback y totalRedeemed en 0.
 * También elimina el descuento activo y registra un movimiento de auditoría.
 */
export async function adminResetWallet(walletId: number, adminEmail: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // 1. Reiniciar saldo y cashback
  await db.update(wallets)
    .set({
      balance: 0,
      totalCashback: 0,
      totalRedeemed: 0,
      discountPercent: null,
      discountActivatedAt: null,
    })
    .where(eq(wallets.id, walletId));
  // 2. Cancelar todos los pagos en clínica pendientes de este monedero
  await db.update(cashPendingPayments)
    .set({ status: 'cancelled', cancelledAt: new Date() })
    .where(and(
      eq(cashPendingPayments.walletId, walletId),
      eq(cashPendingPayments.status, 'pending')
    ));
  // 3. Resetear el tracker de consultas de lealtad (consultas acumuladas, gratis ganadas/usadas)
  await db.update(loyaltyTracker)
    .set({ nutritionConsultations: 0, freeConsultationsEarned: 0, freeConsultationsUsed: 0 })
    .where(eq(loyaltyTracker.walletId, walletId));
  // 4. Borrar el progreso en todos los planes de lealtad por producto
  await db.delete(loyaltyProgress).where(eq(loyaltyProgress.walletId, walletId));
  // 5. Borrar todo el historial de movimientos del monedero
  await db.delete(walletTransactions).where(eq(walletTransactions.walletId, walletId));
  // 6. Registrar un único movimiento de auditoría post-reinicio
  await db.insert(walletTransactions).values({
    walletId,
    type: "adjustment",
    amount: 0,
    balanceAfter: 0,
    description: `Monedero reiniciado por admin (${adminEmail})`,
    createdBy: `admin:${adminEmail}`,
  }).catch(() => {});
}

/**
 * Suspende (da de baja) el monedero de un paciente sin borrar datos.
 */
export async function adminSuspendWallet(walletId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(wallets)
    .set({ isActive: false })
    .where(eq(wallets.id, walletId));
}

/**
 * Reactiva (da de alta) el monedero de un paciente suspendido.
 */
export async function adminUnsuspendWallet(walletId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(wallets)
    .set({ isActive: true })
    .where(eq(wallets.id, walletId));
}

// ============================================================
// HELPERS: PAGOS A PLAZOS
// ============================================================

/**
 * Avanza una fecha saltando domingos (día 0).
 * Si la fecha resultante cae en domingo, se mueve al lunes siguiente.
 */
function skipSunday(date: Date): Date {
  const d = new Date(date);
  if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1); // mover al lunes
  }
  return d;
}

/**
 * Calcula las fechas de vencimiento de los plazos a partir de la fecha de inicio.
 * - quincenal: cada 15 días hábiles (sin domingos)
 * - semanal: cada 7 días hábiles (sin domingos)
 */
function calcInstallmentDueDates(startDate: Date, modalidad: 'quincenal' | 'semanal', count: number): Date[] {
  const intervalDays = modalidad === 'quincenal' ? 15 : 7;
  const dates: Date[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + intervalDays * i);
    dates.push(skipSunday(d));
  }
  return dates;
}

/**
 * Crea un plan de pago a plazos y sus cuotas individuales.
 */
export async function createInstallmentPlan(data: {
  walletId: number;
  patientId: number;
  concept: string;
  originalAmountCents: number;
  modalidad: 'quincenal' | 'semanal';
  createdBy: string;
}): Promise<InstallmentPlan & { payments: InstallmentPayment[] }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const surchargePercent = data.modalidad === 'quincenal' ? 10 : 15;
  const totalInstallments = data.modalidad === 'quincenal' ? 2 : 4;
  const totalAmountCents = Math.round(data.originalAmountCents * (1 + surchargePercent / 100));
  const perInstallmentCents = Math.round(totalAmountCents / totalInstallments);

  // Crear el plan
  await db.insert(installmentPlans).values({
    walletId: data.walletId,
    patientId: data.patientId,
    concept: data.concept,
    originalAmountCents: data.originalAmountCents,
    totalAmountCents,
    surchargePercent,
    modalidad: data.modalidad,
    totalInstallments,
    paidInstallments: 0,
    status: 'active',
    createdBy: data.createdBy,
  });

  const [plan] = await db.select().from(installmentPlans)
    .orderBy(desc(installmentPlans.id)).limit(1);

  // Calcular fechas de vencimiento (sin domingos)
  const dueDates = calcInstallmentDueDates(new Date(), data.modalidad, totalInstallments);

  // Crear los pagos individuales
  const paymentRows = dueDates.map((dueDate, idx) => ({
    planId: plan.id,
    walletId: data.walletId,
    installmentNumber: idx + 1,
    amountCents: perInstallmentCents,
    dueDate,
    status: 'pending' as const,
  }));

  await db.insert(installmentPayments).values(paymentRows);

  const payments = await db.select().from(installmentPayments)
    .where(eq(installmentPayments.planId, plan.id))
    .orderBy(asc(installmentPayments.installmentNumber));

  return { ...plan, payments };
}

/**
 * Confirma el pago de una cuota específica.
 */
export async function confirmInstallmentPayment(paymentId: number, confirmedBy: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [payment] = await db.select().from(installmentPayments)
    .where(eq(installmentPayments.id, paymentId)).limit(1);
  if (!payment) throw new Error("Cuota no encontrada");
  if (payment.status === 'paid') throw new Error("Esta cuota ya fue pagada");

  await db.update(installmentPayments)
    .set({ status: 'paid', paidAt: new Date(), confirmedBy })
    .where(eq(installmentPayments.id, paymentId));

  // Contar cuotas pagadas del plan
  const allPayments = await db.select().from(installmentPayments)
    .where(eq(installmentPayments.planId, payment.planId));
  const paidCount = allPayments.filter(p => p.status === 'paid' || p.id === paymentId).length;
  const [plan] = await db.select().from(installmentPlans)
    .where(eq(installmentPlans.id, payment.planId)).limit(1);

  const newStatus = paidCount >= (plan?.totalInstallments ?? 0) ? 'completed' : 'active';
  await db.update(installmentPlans)
    .set({ paidInstallments: paidCount, status: newStatus })
    .where(eq(installmentPlans.id, payment.planId));
}

/**
 * Obtiene todos los planes de plazos activos de un monedero.
 */
export async function getInstallmentPlansByWallet(walletId: number): Promise<(InstallmentPlan & { payments: InstallmentPayment[] })[]> {
  const db = await getDb();
  if (!db) return [];

  const plans = await db.select().from(installmentPlans)
    .where(and(eq(installmentPlans.walletId, walletId), eq(installmentPlans.status, 'active')))
    .orderBy(desc(installmentPlans.createdAt));

  return await Promise.all(plans.map(async (plan) => {
    const payments = await db.select().from(installmentPayments)
      .where(eq(installmentPayments.planId, plan.id))
      .orderBy(asc(installmentPayments.installmentNumber));
    return { ...plan, payments };
  }));
}

/**
 * Obtiene todos los planes de plazos (admin: todos los monederos).
 */
export async function getAllInstallmentPlans(): Promise<(InstallmentPlan & { payments: InstallmentPayment[] })[]> {
  const db = await getDb();
  if (!db) return [];

  const plans = await db.select().from(installmentPlans)
    .orderBy(desc(installmentPlans.createdAt));

  return await Promise.all(plans.map(async (plan) => {
    const payments = await db.select().from(installmentPayments)
      .where(eq(installmentPayments.planId, plan.id))
      .orderBy(asc(installmentPayments.installmentNumber));
    return { ...plan, payments };
  }));
}

// ============================================================
// HELPERS: NOTIFICACIONES ADMIN → PACIENTE
// ============================================================

/**
 * Envía una notificación personalizada del admin a un paciente.
 */
export async function sendAdminNotification(data: {
  walletId: number;
  patientId: number;
  title: string;
  message: string;
  imageUrl?: string;
  type: 'cobro' | 'promocion' | 'felicitacion' | 'general';
  sentBy: string;
}): Promise<AdminNotification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(adminNotifications).values({
    walletId: data.walletId,
    patientId: data.patientId,
    title: data.title,
    message: data.message,
    imageUrl: data.imageUrl ?? null,
    type: data.type,
    isRead: false,
    sentBy: data.sentBy,
  });

  const [notif] = await db.select().from(adminNotifications)
    .orderBy(desc(adminNotifications.id)).limit(1);
  return notif;
}

/**
 * Obtiene las notificaciones de un monedero (para el paciente).
 */
export async function getAdminNotificationsByWallet(walletId: number): Promise<AdminNotification[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(adminNotifications)
    .where(eq(adminNotifications.walletId, walletId))
    .orderBy(desc(adminNotifications.createdAt));
}

/**
 * Cuenta las notificaciones no leídas de un monedero.
 */
export async function countUnreadAdminNotifications(walletId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select().from(adminNotifications)
    .where(and(eq(adminNotifications.walletId, walletId), eq(adminNotifications.isRead, false)));
  return rows.length;
}

/**
 * Marca una notificación como leída.
 */
export async function markAdminNotificationRead(notifId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(adminNotifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(adminNotifications.id, notifId));
}

/**
 * Marca todas las notificaciones de un monedero como leídas.
 */
export async function markAllAdminNotificationsRead(walletId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(adminNotifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(adminNotifications.walletId, walletId), eq(adminNotifications.isRead, false)));
}

/**
 * Elimina una notificación admin por id.
 */
export async function deleteAdminNotification(notifId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(adminNotifications).where(eq(adminNotifications.id, notifId));
}
/**
 * Actualiza el contenido de una notificación (el admin puede editar título, mensaje y tipo).
 * Resetea isRead para que el paciente vea el mensaje actualizado.
 */
export async function updateAdminNotification(notifId: number, data: {
  title: string;
  message: string;
  type: 'cobro' | 'promocion' | 'felicitacion' | 'general';
  imageUrl?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(adminNotifications)
    .set({
      title: data.title,
      message: data.message,
      type: data.type,
      imageUrl: data.imageUrl ?? null,
      isRead: false,
      readAt: null,
    })
    .where(eq(adminNotifications.id, notifId));
}

/**
 * Elimina todas las notificaciones de un monedero.
 */
export async function deleteAllAdminNotifications(walletId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(adminNotifications).where(eq(adminNotifications.walletId, walletId));
}

/**
 * Crea una notificación automática de cashback acreditado.
 * amountCents: monto en centavos (igual que el saldo del monedero).
 */
export async function sendCashbackNotification(walletId: number, amountCents: number, description: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Obtener patientId del wallet
  const walletRows = await db.select({ patientId: wallets.patientId }).from(wallets).where(eq(wallets.id, walletId)).limit(1);
  if (!walletRows.length) return;
  const patientId = walletRows[0].patientId;
  const amountFormatted = `$${(amountCents / 100).toFixed(2)}`;
  await db.insert(adminNotifications).values({
    walletId,
    patientId,
    title: `💰 ¡Cashback acreditado: ${amountFormatted}!`,
    message: `Se acreditaron ${amountFormatted} a tu Monedero Nutriser. ${description}`,
    type: 'general',
    sentBy: 'sistema',
    isRead: false,
    createdAt: new Date(),
  });
}

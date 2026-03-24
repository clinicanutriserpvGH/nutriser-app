import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Membresías de clientes
 * Almacena información de membresías Básico y Premium
 */
export const memberships = mysqlTable("memberships", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }),
  programType: mysqlEnum("programType", ["basic", "premium"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  depositConcept: text("depositConcept"), // Concepto del depósito (nombre + programa)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  verifiedAt: timestamp("verifiedAt"),
});

export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;

/**
 * Comprobantes de pago
 * Almacena las fotos de los comprobantes de depósito
 */
export const paymentProofs = mysqlTable("paymentProofs", {
  id: int("id").autoincrement().primaryKey(),
  membershipId: int("membershipId").notNull(),
  proofUrl: text("proofUrl").notNull(), // URL de la imagen en S3
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type PaymentProof = typeof paymentProofs.$inferSelect;
export type InsertPaymentProof = typeof paymentProofs.$inferInsert;

/**
 * Citas agendadas
 * Almacena las citas agendadas por clientes
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }),
  appointmentDate: timestamp("appointmentDate").notNull(),
  appointmentTime: varchar("appointmentTime", { length: 10 }).notNull(), // HH:MM format
  serviceType: varchar("serviceType", { length: 255 }).notNull(), // Tipo de servicio/tratamiento
  notes: text("notes"), // Notas adicionales
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Credenciales de administrador
 * Almacena credenciales para acceso al panel admin
 */
export const adminCredentials = mysqlTable("adminCredentials", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type InsertAdminCredential = typeof adminCredentials.$inferInsert;


/**
 * Cupones de descuento
 * Almacena cupones para membresías con descuentos predefinidos
 */
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountPercentage: int("discountPercentage").notNull(), // 10, 20, 30
  status: mysqlEnum("status", ["pending", "active", "inactive"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy"), // ID del admin que aprobó
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * Cupones usados en membresías
 * Registra qué cupón se usó en cada membresía
 */
export const membershipCoupons = mysqlTable("membershipCoupons", {
  id: int("id").autoincrement().primaryKey(),
  membershipId: int("membershipId").notNull().references(() => memberships.id),
  couponId: int("couponId").notNull().references(() => coupons.id),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MembershipCoupon = typeof membershipCoupons.$inferSelect;
export type InsertMembershipCoupon = typeof membershipCoupons.$inferInsert;


/**
 * Promociones vigentes
 * Almacena promociones que el admin puede crear y mostrar en la página
 */
export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"), // URL de imagen (opcional)
  price: decimal("price", { precision: 10, scale: 2 }), // Precio promocional del cupón
  regularPrice: decimal("regularPrice", { precision: 10, scale: 2 }), // Precio regular (para comparativa)
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"), // Fecha límite para canjear el cupón (null = sin vencimiento)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

/**
 * Compras de cupones de regalo
 * Almacena compras de cupones pagados que pueden ser compartidos como regalo
 */
export const giftPurchases = mysqlTable("giftPurchases", {
  id: int("id").autoincrement().primaryKey(),
  promotionId: int("promotionId").notNull().references(() => promotions.id),
  couponCode: varchar("couponCode", { length: 20 }).notNull().unique(), // Código único NUT-XXXX-XXXX
  buyerName: varchar("buyerName", { length: 255 }).notNull(),
  buyerEmail: varchar("buyerEmail", { length: 320 }).notNull(),
  buyerPhone: varchar("buyerPhone", { length: 20 }),
  proofUrl: text("proofUrl").notNull(), // URL del comprobante de pago
  isGift: boolean("isGift").default(false).notNull(), // true = regalo para otra persona
  recipientName: varchar("recipientName", { length: 255 }), // Nombre del destinatario (si es regalo)
  recipientContact: varchar("recipientContact", { length: 320 }), // WhatsApp o email del destinatario
  status: mysqlEnum("status", ["pending", "approved", "rejected", "used"]).default("pending").notNull(),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy"), // ID del admin que aprobó
  sharedWith: varchar("sharedWith", { length: 320 }), // Email del destinatario
  sharedMethod: mysqlEnum("sharedMethod", ["whatsapp", "email"]), // Método de compartir
  sharedAt: timestamp("sharedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GiftPurchase = typeof giftPurchases.$inferSelect;
export type InsertGiftPurchase = typeof giftPurchases.$inferInsert;

/**
 * Ebook
 * Almacena la información del ebook (solo habrá uno activo a la vez)
 */
export const ebooks = mysqlTable("ebooks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  coverUrl: text("coverUrl"), // URL portada en S3
  pdfUrl: text("pdfUrl"), // URL del PDF en S3 (protegido)
  presalePrice: decimal("presalePrice", { precision: 10, scale: 2 }), // Precio de pre-venta (opcional, para comparativa)
  isActive: boolean("isActive").default(true).notNull(),
  comingSoon: boolean("comingSoon").default(false).notNull(), // true = próxima publicación, sin compra
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ebook = typeof ebooks.$inferSelect;
export type InsertEbook = typeof ebooks.$inferInsert;

/**
 * Compras de ebook
 * Registra cada compra del ebook con su comprobante de pago
 */
export const ebookPurchases = mysqlTable("ebookPurchases", {
  id: int("id").autoincrement().primaryKey(),
  ebookId: int("ebookId").notNull().references(() => ebooks.id),
  buyerName: varchar("buyerName", { length: 255 }).notNull(),
  buyerEmail: varchar("buyerEmail", { length: 320 }).notNull(),
  proofUrl: text("proofUrl").notNull(), // URL del comprobante en S3
  accessToken: varchar("accessToken", { length: 64 }).notNull().unique(), // Token único para acceder al PDF
  accessPasswordHash: varchar("accessPasswordHash", { length: 255 }), // Contraseña hasheada para login seguro
  referredBy: varchar("referredBy", { length: 255 }), // Nombre del comprador que recomendó el eBook
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EbookPurchase = typeof ebookPurchases.$inferSelect;
export type InsertEbookPurchase = typeof ebookPurchases.$inferInsert;

/**
 * Códigos de descuento para eBook
 * Administrador puede activar/desactivar cada código
 * Códigos predefinidos: ebook10 (10%), ebook20 (20%), ebook30 (30%), ebookfree (100%)
 */
export const ebookDiscountCodes = mysqlTable("ebookDiscountCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // ej: ebook10
  discountPercent: int("discountPercent").notNull(), // 10, 20, 30, 100
  isActive: boolean("isActive").default(false).notNull(), // Admin activa/desactiva
  description: varchar("description", { length: 255 }), // ej: "10% de descuento"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EbookDiscountCode = typeof ebookDiscountCodes.$inferSelect;
export type InsertEbookDiscountCode = typeof ebookDiscountCodes.$inferInsert;

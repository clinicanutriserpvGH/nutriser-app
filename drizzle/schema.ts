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
  discountCode: varchar("discountCode", { length: 50 }), // Código de descuento aplicado
  discountPercent: int("discountPercent"), // Porcentaje de descuento aplicado
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }), // Precio antes del descuento
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
  price: varchar("price", { length: 100 }), // Precio promocional del cupón (texto libre, ej: $1,299)
  regularPrice: varchar("regularPrice", { length: 100 }), // Precio regular para comparativa (texto libre, ej: $1,800)
  maxCoupons: int("maxCoupons"), // Límite de cupones disponibles (null = ilimitado)
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

/**
 * Compras de servicios individuales
 * Registra cada compra de un servicio del catálogo con comprobante y código único
 */
export const servicePurchases = mysqlTable("servicePurchases", {
  id: int("id").autoincrement().primaryKey(),
  serviceName: varchar("serviceName", { length: 255 }).notNull(), // Nombre del servicio comprado
  buyerName: varchar("buyerName", { length: 255 }).notNull(),
  buyerEmail: varchar("buyerEmail", { length: 320 }).notNull(),
  buyerPhone: varchar("buyerPhone", { length: 20 }),
  proofUrl: text("proofUrl").notNull(), // URL del comprobante en S3
  serviceCode: varchar("serviceCode", { length: 20 }).notNull().unique(), // Código único NUT-SRV-XXXX
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"), // Notas del administrador
  discountCode: varchar("discountCode", { length: 50 }), // Código de descuento aplicado
  discountPercent: int("discountPercent"), // Porcentaje de descuento aplicado
  originalPrice: varchar("originalPrice", { length: 100 }), // Precio antes del descuento
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ServicePurchase = typeof servicePurchases.$inferSelect;
export type InsertServicePurchase = typeof servicePurchases.$inferInsert;

/**
 * Suscriptores a la cuponera de descuentos
 * Reciben notificaciones por correo y WhatsApp cuando se publican nuevas promociones
 */
export const couponSubscribers = mysqlTable("couponSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CouponSubscriber = typeof couponSubscribers.$inferSelect;
export type InsertCouponSubscriber = typeof couponSubscribers.$inferInsert;

/**
 * Suscripciones push del navegador
 * Almacena las suscripciones Web Push para notificaciones en el navegador
 */
export const pushSubscriptions = mysqlTable("pushSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Catálogo de servicios del sitio
 * Los servicios se muestran en la sección de servicios de la página principal
 * El admin puede crear, editar y eliminar servicios desde el panel de administración
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull().default("general"),
  price: varchar("price", { length: 100 }), // Precio libre: "$1,500 MXN" o "Desde $800"
  imageUrl: text("imageUrl"), // URL de la imagen en S3
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(), // Para ordenar los servicios
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Catálogo de productos de la tienda
 * El admin puede crear, editar y eliminar productos desde el panel de administración
 * Los usuarios pueden ver y comprar productos desde la tienda pública
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull().default("general"),
  price: varchar("price", { length: 100 }), // Precio libre: "$1,500 MXN" o "Desde $800"
  imageUrl: text("imageUrl"), // URL de la imagen en S3
  stock: int("stock").default(0), // null = sin límite
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Compras de productos
 */
export const productPurchases = mysqlTable("productPurchases", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  buyerName: varchar("buyerName", { length: 255 }).notNull(),
  buyerEmail: varchar("buyerEmail", { length: 320 }).notNull(),
  buyerPhone: varchar("buyerPhone", { length: 50 }),
  quantity: int("quantity").default(1).notNull(),
  proofUrl: text("proofUrl"), // URL del comprobante en S3
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  purchaseCode: varchar("purchaseCode", { length: 30 }).notNull(),
  notes: text("notes"),
  discountCode: varchar("discountCode", { length: 50 }), // Código de descuento aplicado
  discountPercent: int("discountPercent"), // Porcentaje de descuento aplicado
  originalPrice: varchar("originalPrice", { length: 100 }), // Precio antes del descuento
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProductPurchase = typeof productPurchases.$inferSelect;
export type InsertProductPurchase = typeof productPurchases.$inferInsert;

/**
 * Códigos de descuento generales
 * Aplican a programas de nutrición, productos y servicios
 * El administrador activa/desactiva cada código desde el panel
 */
export const discountCodes = mysqlTable("discountCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // ej: Nutriser10
  discountPercent: int("discountPercent").notNull(), // 10, 15, 20, 25, 30, 100
  isGift: boolean("isGift").default(false).notNull(), // true = Nutriserfree (100% = regalo)
  isTwoForOne: boolean("isTwoForOne").default(false).notNull(), // true = Nutriser2x1 (2 por precio de 1)
  isActive: boolean("isActive").default(false).notNull(), // Admin debe activar
  description: varchar("description", { length: 255 }), // ej: "10% de descuento en todo"
  usageCount: int("usageCount").default(0).notNull(), // Contador de usos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = typeof discountCodes.$inferInsert;

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
  programType: mysqlEnum("programType", ["basic", "premium", "treatment"]).notNull(),
  programName: varchar("programName", { length: 255 }), // Nombre real del paquete tal como aparece en el sitio
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  depositConcept: text("depositConcept"), // Concepto del depósito (nombre + programa)
  discountCode: varchar("discountCode", { length: 50 }), // Código de descuento aplicado
  discountPercent: int("discountPercent"), // Porcentaje de descuento aplicado
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }), // Precio antes del descuento
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  verifiedAt: timestamp("verifiedAt"),
  accessCode: varchar("accessCode", { length: 20 }), // Código único generado al aprobar
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
  resetToken: varchar("resetToken", { length: 128 }),       // Token para restablecer contraseña
  resetTokenExpiresAt: timestamp("resetTokenExpiresAt"),    // Expira en 1 hora
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
 * Fotos de Antes y Después
 * Almacena las transformaciones de pacientes para mostrar en la página principal
 */
export const beforeAfterPhotos = mysqlTable("beforeAfterPhotos", {
  id: int("id").autoincrement().primaryKey(),
  patientName: varchar("patientName", { length: 255 }).notNull(), // Nombre o iniciales del paciente
  category: mysqlEnum("category", ["nutricion", "estetica", "ambos"]).default("nutricion").notNull(),
  description: text("description"), // Breve descripción del logro
  beforeImageUrl: text("beforeImageUrl").notNull(), // URL imagen ANTES en S3
  afterImageUrl: text("afterImageUrl").notNull(),  // URL imagen DESPUÉS en S3
  isVisible: boolean("isVisible").default(true).notNull(), // Mostrar/ocultar en la página
  sortOrder: int("sortOrder").default(0).notNull(), // Orden de aparición
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BeforeAfterPhoto = typeof beforeAfterPhotos.$inferSelect;
export type InsertBeforeAfterPhoto = typeof beforeAfterPhotos.$inferInsert;

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
  /** Email del suscriptor (opcional, para vincular con couponSubscribers) */
  email: varchar("email", { length: 320 }),
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

/**
 * Cursos gratuitos de nutrición
 * El administrador crea y gestiona los cursos desde el panel
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnailUrl"), // Imagen de portada del curso
  category: varchar("category", { length: 100 }).default("nutricion"), // nutricion, recetas, bienestar, etc.
  isPublished: boolean("isPublished").default(false).notNull(), // Admin publica cuando está listo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Videos de cada curso
 * Almacenados en S3, solo visualización (sin descarga)
 */
export const courseVideos = mysqlTable("courseVideos", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(), // FK a courses.id
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: text("videoUrl").notNull(), // URL de S3 del video
  thumbnailUrl: text("thumbnailUrl"), // Miniatura del video
  duration: varchar("duration", { length: 20 }), // ej: "12:34"
  sortOrder: int("sortOrder").default(0).notNull(), // Orden dentro del curso
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CourseVideo = typeof courseVideos.$inferSelect;
export type InsertCourseVideo = typeof courseVideos.$inferInsert;

/**
 * Documentos de apoyo por video
 * PDFs y archivos descargables asociados a cada video
 */
export const courseDocuments = mysqlTable("courseDocuments", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull(), // FK a courseVideos.id
  title: varchar("title", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(), // URL de S3 del documento
  fileType: varchar("fileType", { length: 255 }).default("pdf"), // pdf, docx, etc. (MIME type completo)
  fileSize: int("fileSize"), // Tamaño en bytes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CourseDocument = typeof courseDocuments.$inferSelect;
export type InsertCourseDocument = typeof courseDocuments.$inferInsert;

/**
 * Comentarios en videos de cursos
 * Requieren aprobación del admin antes de mostrarse
 */
export const courseComments = mysqlTable("courseComments", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull(), // FK a courseVideos.id
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
});
export type CourseComment = typeof courseComments.$inferSelect;
export type InsertCourseComment = typeof courseComments.$inferInsert;

/**
 * Suscriptores a notificaciones de nuevos cursos
 * Email y/o push notifications
 */
export const courseSubscribers = mysqlTable("courseSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }),
  name: varchar("name", { length: 255 }),
  pushSubscription: text("pushSubscription"), // JSON del push subscription
  notifyByEmail: boolean("notifyByEmail").default(true).notNull(),
  notifyByPush: boolean("notifyByPush").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CourseSubscriber = typeof courseSubscribers.$inferSelect;
export type InsertCourseSubscriber = typeof courseSubscribers.$inferInsert;

/**
 * Sugerencias de temas para Nutriser Academy
 * Los usuarios proponen temas y pueden votar los de otros
 */
export const topicSuggestions = mysqlTable("topicSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }),
  title: varchar("title", { length: 255 }).notNull(), // Título del tema sugerido
  description: text("description"), // Descripción opcional
  votes: int("votes").default(0).notNull(), // Contador de votos
  status: mysqlEnum("status", ["pending", "approved", "rejected", "published"]).default("pending").notNull(),
  // pending = esperando moderación, approved = visible, rejected = rechazado, published = ya se hizo el video
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TopicSuggestion = typeof topicSuggestions.$inferSelect;
export type InsertTopicSuggestion = typeof topicSuggestions.$inferInsert;

/**
 * Votos de sugerencias de temas
 * Evita que el mismo dispositivo vote dos veces
 */
export const topicVotes = mysqlTable("topicVotes", {
  id: int("id").autoincrement().primaryKey(),
  suggestionId: int("suggestionId").notNull(),
  voterFingerprint: varchar("voterFingerprint", { length: 255 }).notNull(), // IP + user agent hash
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TopicVote = typeof topicVotes.$inferSelect;
export type InsertTopicVote = typeof topicVotes.$inferInsert;

// ============================================================
// MÓDULO MIS TRATAMIENTOS — Pacientes presenciales
// ============================================================

/**
 * Cuentas de pacientes presenciales de la clínica
 */
export const patientAccounts = mysqlTable("patientAccounts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  birthday: varchar("birthday", { length: 10 }),
  resetToken: varchar("resetToken", { length: 128 }),
  resetTokenExpiresAt: timestamp("resetTokenExpiresAt"),
  pushSubscription: text("pushSubscription"),
  apnsToken: varchar("apnsToken", { length: 200 }), // Token APNs para notificaciones nativas en iOS
  consentAcceptedAt: timestamp("consentAcceptedAt"), // Fecha en que aceptó el contrato
  consentPdfUrl: text("consentPdfUrl"), // URL del PDF firmado en S3
  consentSignature: text("consentSignature"), // URL de la firma o imagen base64
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PatientAccount = typeof patientAccounts.$inferSelect;
export type InsertPatientAccount = typeof patientAccounts.$inferInsert;

/**
 * Tratamientos asignados a cada paciente por el administrador
 */
export const patientTreatments = mysqlTable("patientTreatments", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  serviceName: varchar("serviceName", { length: 255 }).notNull(),
  totalSessions: int("totalSessions").default(1).notNull(),
  completedSessions: int("completedSessions").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PatientTreatment = typeof patientTreatments.$inferSelect;
export type InsertPatientTreatment = typeof patientTreatments.$inferInsert;

/**
 * Citas programadas para cada tratamiento de un paciente
 */
export const patientAppointments = mysqlTable("patientAppointments", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  treatmentId: int("treatmentId").notNull(),
  appointmentDate: varchar("appointmentDate", { length: 10 }).notNull(),
  appointmentTime: varchar("appointmentTime", { length: 5 }).notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PatientAppointment = typeof patientAppointments.$inferSelect;
export type InsertPatientAppointment = typeof patientAppointments.$inferInsert;

/**
 * Fotos de antes y después por paciente y tratamiento
 * El admin las sube, el paciente las ve en su portal
 */
export const patientPhotos = mysqlTable("patientPhotos", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  treatmentId: int("treatmentId"), // FK a patientTreatments.id (opcional, puede ser general)
  type: mysqlEnum("type", ["before", "after", "progress"]).notNull(),
  photoUrl: text("photoUrl").notNull(),
  photoDate: varchar("photoDate", { length: 10 }).notNull(), // "YYYY-MM-DD"
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PatientPhoto = typeof patientPhotos.$inferSelect;
export type InsertPatientPhoto = typeof patientPhotos.$inferInsert;

// ============================================================
// CARRITO PERSISTENTE — Nutriser Shop
// ============================================================
/**
 * Items del carrito de compras persistente por paciente.
 * Se sincroniza con la cuenta del usuario para que el carrito
 * se mantenga entre sesiones y dispositivos.
 */
export const shopCartItems = mysqlTable("shopCartItems", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(), // FK a patientAccounts.id
  itemKey: varchar("itemKey", { length: 100 }).notNull(), // ej: "svc-5", "ebook-2", "pkg-nutricion"
  itemType: mysqlEnum("itemType", ["service", "product", "ebook", "package"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  price: int("price").default(0).notNull(), // precio en MXN (entero)
  priceLabel: varchar("priceLabel", { length: 100 }),
  imageUrl: text("imageUrl"),
  category: varchar("category", { length: 100 }),
  qty: int("qty").default(1).notNull(),
  serviceId: int("serviceId"),
  productId: int("productId"),
  ebookId: int("ebookId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ShopCartItem = typeof shopCartItems.$inferSelect;
export type InsertShopCartItem = typeof shopCartItems.$inferInsert;

/**
 * Banners promocionales para Nutriser Shop
 * El administrador crea promociones con plantillas prediseñadas
 * que aparecen como pop-up al entrar a la tienda
 */
export const shopPromotions = mysqlTable("shopPromotions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  description: text("description"),
  discountText: varchar("discountText", { length: 100 }), // ej: "65%", "2x1", "$500 OFF"
  couponCode: varchar("couponCode", { length: 50 }),
  imageUrl: text("imageUrl"), // imagen principal del banner
  ctaText: varchar("ctaText", { length: 100 }).default("Ver oferta"), // texto del botón CTA
  ctaLink: varchar("ctaLink", { length: 500 }), // enlace del CTA (opcional)
  template: mysqlEnum("template", [
    "gold_elegant",     // Dorado elegante — estilo Nutriser
    "vibrant_orange",   // Naranja vibrante — estilo Farmacias
    "fresh_green",      // Verde fresco — salud/nutrición
    "royal_purple",     // Púrpura real — premium/lujo
    "clean_white",      // Blanco limpio — minimalista
    "dark_luxury",      // Negro/dorado — lujo oscuro
  ]).default("gold_elegant").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isFullscreen: boolean("isFullscreen").default(false).notNull(), // true = pantalla completa, false = modal
  priority: int("priority").default(0).notNull(), // mayor = más prioridad
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ShopPromotion = typeof shopPromotions.$inferSelect;
export type InsertShopPromotion = typeof shopPromotions.$inferInsert;


// ============================================================
// MONEDERO ELECTRÓNICO NUTRISER
// ============================================================

/**
 * Monedero electrónico del paciente
 * Cada paciente registrado obtiene un monedero único con QR
 * Acumula cashback del 1% por cada compra verificada
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull().unique(), // FK a patientAccounts.id — 1:1
  walletNumber: varchar("walletNumber", { length: 20 }).notNull().unique(), // Número único tipo NUT-XXXX-XXXX
  balance: int("balance").default(0).notNull(), // Saldo en centavos MXN (ej: 4500 = $45.00)
  totalCashback: int("totalCashback").default(0).notNull(), // Total acumulado histórico en centavos
  totalRedeemed: int("totalRedeemed").default(0).notNull(), // Total canjeado histórico en centavos
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Transacciones del monedero
 * Registra cada movimiento: cashback, canje, bonificación, ajuste
 */
export const walletTransactions = mysqlTable("walletTransactions", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(), // FK a wallets.id
  type: mysqlEnum("type", ["cashback", "redeem", "bonus", "adjustment", "free_consultation"]).notNull(),
  amount: int("amount").notNull(), // Monto en centavos (positivo = ingreso, negativo = egreso)
  description: varchar("description", { length: 500 }).notNull(),
  referenceType: varchar("referenceType", { length: 50 }), // "membership", "service", "product", "gift", "consultation"
  referenceId: int("referenceId"), // ID de la compra que generó el cashback
  balanceAfter: int("balanceAfter").notNull(), // Saldo después de la transacción
  createdBy: varchar("createdBy", { length: 100 }), // "system" o "admin:email"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;

/**
 * Programa de lealtad — Consultas nutricionales
 * Por cada 3 consultas nutricionales, la 4ta es gratis
 */
export const loyaltyTracker = mysqlTable("loyaltyTracker", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull().unique(), // FK a wallets.id — 1:1
  nutritionConsultations: int("nutritionConsultations").default(0).notNull(), // Total de consultas pagadas
  freeConsultationsEarned: int("freeConsultationsEarned").default(0).notNull(), // Consultas gratis ganadas
  freeConsultationsUsed: int("freeConsultationsUsed").default(0).notNull(), // Consultas gratis usadas
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LoyaltyTracker = typeof loyaltyTracker.$inferSelect;
export type InsertLoyaltyTracker = typeof loyaltyTracker.$inferInsert;

// ============================================================
// PLANES DE LEALTAD POR PRODUCTO (estilo Farmacia del Ahorro)
// ============================================================

/**
 * Planes de lealtad configurables por el admin
 * Ej: "Acumula 3 consultas y la 4ta es GRATIS"
 * Ej: "Acumula 4 compras de Serum y el 5to es GRATIS"
 */
export const loyaltyPlans = mysqlTable("loyaltyPlans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // "Acumula 3 y llévate 1 gratis"
  productName: varchar("productName", { length: 255 }).notNull(), // Nombre del producto/servicio
  category: mysqlEnum("category", ["consultation", "product", "service"]).notNull(),
  requiredPurchases: int("requiredPurchases").default(3).notNull(), // Compras necesarias para ganar recompensa
  rewardDescription: varchar("rewardDescription", { length: 255 }).default("1 GRATIS").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"), // Vigencia del plan (null = sin vencimiento)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LoyaltyPlan = typeof loyaltyPlans.$inferSelect;
export type InsertLoyaltyPlan = typeof loyaltyPlans.$inferInsert;

/**
 * Progreso individual de cada usuario en cada plan de lealtad
 * Registra cuántas compras lleva y cuántas recompensas ha ganado/usado
 */
export const loyaltyProgress = mysqlTable("loyaltyProgress", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(), // FK a wallets.id
  planId: int("planId").notNull(), // FK a loyaltyPlans.id
  currentCount: int("currentCount").default(0).notNull(), // Compras acumuladas en ciclo actual
  rewardsEarned: int("rewardsEarned").default(0).notNull(), // Total de recompensas ganadas
  rewardsUsed: int("rewardsUsed").default(0).notNull(), // Total de recompensas usadas
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LoyaltyProgress = typeof loyaltyProgress.$inferSelect;
export type InsertLoyaltyProgress = typeof loyaltyProgress.$inferInsert;

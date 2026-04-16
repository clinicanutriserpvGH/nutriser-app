/**
 * Nutriser Shop — Internationalization (ES/EN)
 * All user-facing strings for the Memberships/Shop page.
 */

export type Lang = "ES" | "EN";

const translations = {
  // ─── Header ──────────────────────────────────────────────────────────────
  aestheticNutrition: { ES: "Aesthetic & Nutrition", EN: "Aesthetic & Nutrition" },
  nutriserShop: { ES: "Nutriser Shop", EN: "Nutriser Shop" },
  searchPlaceholder: { ES: "¿Qué estás buscando?", EN: "What are you looking for?" },
  closeSession: { ES: "Cerrar sesión", EN: "Log out" },
  switchToEnglish: { ES: "Switch to English", EN: "Cambiar a Español" },
  active: { ES: "Activa", EN: "Active" },

  // ─── Back button ─────────────────────────────────────────────────────────
  back: { ES: "Regresar", EN: "Back" },
  backToStore: { ES: "Regresar a la tienda", EN: "Back to store" },

  // ─── Bottom navigation ───────────────────────────────────────────────────
  tabTreatments: { ES: "Tratamientos", EN: "Treatments" },
  tabFarmacy: { ES: "Farmacy", EN: "Pharmacy" },
  tabWallet: { ES: "Monedero", EN: "Wallet" },
  tabLibrary: { ES: "Library", EN: "Library" },
  tabWishlist: { ES: "Deseos", EN: "Wishlist" },
  tabAccount: { ES: "Cuenta", EN: "Account" },

  // ─── Categories ──────────────────────────────────────────────────────────
  categories: { ES: "Categorías", EN: "Categories" },
  catAll: { ES: "Todos", EN: "All" },
  catPackages: { ES: "Paquetes", EN: "Packages" },
  catNutricion: { ES: "Nutrición", EN: "Nutrition" },
  catCorporales: { ES: "Corporales", EN: "Body" },
  catFaciales: { ES: "Faciales", EN: "Facial" },
  catMedicina: { ES: "Medicina", EN: "Medicine" },
  catOtros: { ES: "Otros", EN: "Others" },
  catProductos: { ES: "Productos", EN: "Products" },
  catGeneral: { ES: "General", EN: "General" },

  // ─── Packages section ────────────────────────────────────────────────────
  specialPackages: { ES: "Paquetes Especiales", EN: "Special Packages" },
  bestPricesCombined: { ES: "Los mejores precios en tratamientos combinados", EN: "Best prices on combined treatments" },
  viewAll: { ES: "Ver todo", EN: "View all" },
  mostPopular: { ES: "Más popular", EN: "Most popular" },
  maxSavings: { ES: "Ahorro máximo", EN: "Max savings" },
  youSave: { ES: "Ahorras", EN: "You save" },
  more: { ES: "más", EN: "more" },
  addToCart: { ES: "Al carrito", EN: "Add to cart" },
  buy: { ES: "Comprar", EN: "Buy" },
  buyNow: { ES: "Comprar ahora", EN: "Buy now" },
  discount: { ES: "DESCUENTO", EN: "DISCOUNT" },

  // ─── Banner ──────────────────────────────────────────────────────────────
  nutritionPackage: { ES: "Paquete Nutrición", EN: "Nutrition Package" },
  reductorPackage: { ES: "Paquete Reductor", EN: "Reductor Package" },
  save700: { ES: "Ahorra $700 MXN", EN: "Save $700 MXN" },
  save2000: { ES: "Ahorra $2,000 MXN", EN: "Save $2,000 MXN" },

  // ─── Package descriptions ────────────────────────────────────────────────
  nutritionPkgName: { ES: "Paquete Nutrición", EN: "Nutrition Package" },
  nutritionPkgDesc: {
    ES: "Programa completo de asesoría nutricional personalizada con seguimiento y escaneos corporales.",
    EN: "Complete personalized nutritional counseling program with follow-up and body scans.",
  },
  nutritionPkgFeatures: {
    ES: [
      "4 asesorías nutricionales personalizadas",
      "4 escaneos corporales",
      "10% de descuento en tratamientos corporales",
      "Acceso a seguimiento online",
    ],
    EN: [
      "4 personalized nutritional consultations",
      "4 body scans",
      "10% discount on body treatments",
      "Online follow-up access",
    ],
  },
  reductorPkgName: { ES: "Paquete Reductor Nutriser", EN: "Nutriser Reductor Package" },
  reductorPkgDesc: {
    ES: "Paquete integral de reducción corporal: cavitaciones, radiofrecuencias y mesoterapia reductora.",
    EN: "Comprehensive body reduction package: cavitation, radiofrequency and reducing mesotherapy.",
  },
  reductorPkgFeatures: {
    ES: [
      "4 asesorías nutricionales personalizadas",
      "4 sesiones de Cavitación corporal",
      "4 sesiones de Radiofrecuencia corporal",
      "4 sesiones de Mesoterapia reductora",
      "10% de descuento en tratamientos faciales",
      "10% de descuento en compra de productos",
    ],
    EN: [
      "4 personalized nutritional consultations",
      "4 body Cavitation sessions",
      "4 body Radiofrequency sessions",
      "4 reducing Mesotherapy sessions",
      "10% discount on facial treatments",
      "10% discount on product purchases",
    ],
  },

  // ─── Services ────────────────────────────────────────────────────────────
  noServicesFound: { ES: "No se encontraron servicios", EN: "No services found" },
  consultPrice: { ES: "Consultar precio", EN: "Contact for price" },
  consult: { ES: "Consultar", EN: "Contact" },
  lastUnits: { ES: "Últimas", EN: "Last" },

  // ─── Farmacy ─────────────────────────────────────────────────────────────
  nutriserFarmacy: { ES: "Nutriser Farmacy", EN: "Nutriser Pharmacy" },
  premiumProducts: { ES: "Productos nutricionales y cosméticos premium", EN: "Premium nutritional and cosmetic products" },
  comingSoon: { ES: "Próximamente", EN: "Coming soon" },
  farmacyEmpty: {
    ES: "Estamos preparando nuestra farmacia con productos nutricionales y cosméticos de alta calidad.",
    EN: "We are preparing our pharmacy with high-quality nutritional and cosmetic products.",
  },
  product: { ES: "Producto", EN: "Product" },

  // ─── Library ─────────────────────────────────────────────────────────────
  nutriserLibrary: { ES: "Nutriser Library", EN: "Nutriser Library" },
  digitalResources: { ES: "Recursos digitales exclusivos para tu bienestar", EN: "Exclusive digital resources for your wellness" },
  libraryEmpty: {
    ES: "Estamos preparando libros y recursos digitales exclusivos para ti.",
    EN: "We are preparing exclusive books and digital resources for you.",
  },
  ebookDigital: { ES: "eBook Digital", EN: "Digital eBook" },
  preOrder: { ES: "Pre-compra", EN: "Pre-order" },
  specialPrice: { ES: "Precio especial", EN: "Special price" },
  regularPrice: { ES: "Precio regular:", EN: "Regular price:" },
  comingSoonAvailable: { ES: "Próximamente disponible", EN: "Coming soon" },
  subscribeNotification: { ES: "Suscríbete para recibir notificación", EN: "Subscribe to get notified" },
  viewFullEbook: { ES: "Para ver el eBook completo, visita", EN: "To view the full eBook, visit" },

  // ─── Wishlist ────────────────────────────────────────────────────────────
  wishlist: { ES: "Lista de Deseos", EN: "Wishlist" },
  itemSaved: { ES: "artículo guardado", EN: "item saved" },
  itemsSaved: { ES: "artículos guardados", EN: "items saved" },
  emptyWishlist: { ES: "Tu lista está vacía", EN: "Your list is empty" },
  emptyWishlistHint: {
    ES: "Toca el corazón en cualquier artículo para guardarlo aquí.",
    EN: "Tap the heart on any item to save it here.",
  },
  exploreTreatments: { ES: "Explorar tratamientos", EN: "Explore treatments" },
  add: { ES: "Agregar", EN: "Add" },
  typeService: { ES: "Tratamiento", EN: "Treatment" },
  typePackage: { ES: "Paquete", EN: "Package" },
  typeProduct: { ES: "Producto", EN: "Product" },
  typeEbook: { ES: "eBook", EN: "eBook" },
  typeItem: { ES: "Artículo", EN: "Item" },

  // ─── Cart ────────────────────────────────────────────────────────────────
  myCart: { ES: "Mi Carrito", EN: "My Cart" },
  emptyCart: { ES: "Tu carrito está vacío", EN: "Your cart is empty" },
  emptyCartHint: { ES: "Agrega tratamientos, productos o libros", EN: "Add treatments, products or books" },
  total: { ES: "Total", EN: "Total" },
  proceedToPayment: { ES: "Proceder al pago", EN: "Proceed to payment" },
  addedToCart: { ES: "agregado al carrito", EN: "added to cart" },

  // ─── Checkout ────────────────────────────────────────────────────────────
  orderSent: { ES: "¡Pedido Enviado!", EN: "Order Sent!" },
  finalizePurchase: { ES: "Finalizar Compra", EN: "Complete Purchase" },
  receiptReceived: { ES: "¡Comprobante recibido!", EN: "Receipt received!" },
  orderInReview: {
    ES: "Tu pedido está en revisión. Te contactaremos pronto para confirmar.",
    EN: "Your order is under review. We will contact you soon to confirm.",
  },
  trackingCode: { ES: "Código de seguimiento", EN: "Tracking code" },
  done: { ES: "Listo", EN: "Done" },
  yourOrder: { ES: "Tu pedido", EN: "Your order" },

  // ─── Discount code ──────────────────────────────────────────────────────
  discountCode: { ES: "Código de descuento", EN: "Discount code" },
  enterDiscountCode: { ES: "Ingresa tu código de descuento", EN: "Enter your discount code" },
  apply: { ES: "Aplicar", EN: "Apply" },
  giftApplied: { ES: "¡Regalo aplicado! Tu compra es gratis.", EN: "Gift applied! Your purchase is free." },
  twoForOneApplied: { ES: "¡2x1 aplicado!", EN: "2-for-1 applied!" },
  discountApplied: { ES: "de descuento — Total:", EN: "discount — Total:" },
  invalidCode: { ES: "Código inválido o no está activo.", EN: "Invalid or inactive code." },
  enterCode: { ES: "Ingresa un código", EN: "Enter a code" },
  codeValidationError: { ES: "Error al validar el código.", EN: "Error validating code." },
  twoForOneToast: { ES: "¡Código 2x1 aplicado!", EN: "2-for-1 code applied!" },
  giftCodeToast: { ES: "¡Código de regalo aplicado!", EN: "Gift code applied!" },
  discountToast: { ES: "de descuento aplicado!", EN: "discount applied!" },

  // ─── Buyer info ──────────────────────────────────────────────────────────
  yourData: { ES: "Tus datos", EN: "Your information" },
  fullName: { ES: "Nombre completo *", EN: "Full name *" },
  fullNamePlaceholder: { ES: "Tu nombre completo", EN: "Your full name" },
  email: { ES: "Correo electrónico *", EN: "Email *" },
  phone: { ES: "Teléfono *", EN: "Phone *" },
  enterName: { ES: "Ingresa tu nombre", EN: "Enter your name" },
  enterEmail: { ES: "Ingresa tu correo", EN: "Enter your email" },
  enterPhone: { ES: "Ingresa tu teléfono", EN: "Enter your phone" },
  uploadProof: { ES: "Sube el comprobante de pago", EN: "Upload payment receipt" },

  // ─── Wallet in checkout ──────────────────────────────────────────────────
  walletNutriser: { ES: "Monedero Nutriser", EN: "Nutriser Wallet" },
  yourBalance: { ES: "Tu saldo", EN: "Your balance" },
  available: { ES: "Disponible:", EN: "Available:" },
  useBalanceToPay: { ES: "Usar saldo para pagar", EN: "Use balance to pay" },
  walletDiscount: { ES: "Descuento monedero:", EN: "Wallet discount:" },
  coveredByWallet: { ES: "Cubierto con monedero", EN: "Covered by wallet" },
  remainingToTransfer: { ES: "Restante a transferir:", EN: "Remaining to transfer:" },
  cashbackEarn: { ES: "Con esta compra ganarás", EN: "With this purchase you will earn" },
  cashbackWallet: { ES: "de cashback en tu monedero", EN: "cashback in your wallet" },
  availableNextPurchase: { ES: "(disponible para tu próxima compra)", EN: "(available for your next purchase)" },
  walletLabel: { ES: "monedero:", EN: "wallet:" },

  // ─── Bank transfer ───────────────────────────────────────────────────────
  transferData: { ES: "Datos para transferencia", EN: "Transfer details" },
  bank: { ES: "Banco:", EN: "Bank:" },
  clabe: { ES: "CLABE:", EN: "CLABE:" },
  amount: { ES: "Monto:", EN: "Amount:" },

  // ─── Proof upload ────────────────────────────────────────────────────────
  paymentProof: { ES: "Comprobante de pago *", EN: "Payment receipt *" },
  tapToChange: { ES: "Toca para cambiar", EN: "Tap to change" },
  uploadReceipt: { ES: "Subir comprobante", EN: "Upload receipt" },
  fileFormats: { ES: "JPG, PNG o PDF — máx. 5MB", EN: "JPG, PNG or PDF — max 5MB" },
  maxFileSize: { ES: "Máximo 5MB", EN: "Maximum 5MB" },
  confirmWalletPurchase: { ES: "Confirmar compra con monedero", EN: "Confirm purchase with wallet" },
  sendProofAndConfirm: { ES: "Enviar comprobante y confirmar pedido", EN: "Send receipt and confirm order" },

  // ─── Wallet sheet ────────────────────────────────────────────────────────
  yourWalletNutriser: { ES: "Tu Monedero Nutriser", EN: "Your Nutriser Wallet" },
  walletActive: { ES: "ACTIVA", EN: "ACTIVE" },
  availableBalance: { ES: "Saldo disponible", EN: "Available balance" },
  viewStatement: { ES: "Ver Estado de Cuenta", EN: "View Statement" },
  goToMyWallet: { ES: "Ir a mi monedero", EN: "Go to my wallet" },
  numberCopied: { ES: "Número copiado", EN: "Number copied" },
  copied: { ES: "Copiado", EN: "Copied" },
  copy: { ES: "Copiar", EN: "Copy" },

  // ─── Auth modal ──────────────────────────────────────────────────────────
  authMessage: {
    ES: "Necesitas una cuenta para acceder a tu monedero, cupones, beneficios de lealtad y realizar compras.",
    EN: "You need an account to access your wallet, coupons, loyalty benefits and make purchases.",
  },

  // ─── Toast errors ────────────────────────────────────────────────────────
  walletPayError: { ES: "Error al procesar pago con monedero:", EN: "Error processing wallet payment:" },
  walletDeductError: { ES: "Error al descontar monedero:", EN: "Error deducting wallet:" },
  tryAgain: { ES: "Intenta de nuevo", EN: "Try again" },
} as const;

export type TranslationKey = keyof typeof translations;

/**
 * Returns the translated string for the given key and language.
 */
export function t(key: TranslationKey, lang: Lang): string {
  const entry = translations[key];
  if (!entry) return key;
  return (entry as any)[lang] ?? (entry as any).ES ?? key;
}

/**
 * Returns the translated array for package features.
 */
export function tArray(key: "nutritionPkgFeatures" | "reductorPkgFeatures", lang: Lang): readonly string[] {
  return translations[key][lang];
}

/**
 * Returns category label translations.
 */
export function getCategoryLabel(cat: string, lang: Lang): string {
  const map: Record<string, TranslationKey> = {
    nutricion: "catNutricion",
    corporales: "catCorporales",
    faciales: "catFaciales",
    medicina: "catMedicina",
    otros: "catOtros",
    productos: "catProductos",
    general: "catGeneral",
  };
  const key = map[cat];
  return key ? t(key, lang) : cat;
}

/**
 * Returns type label translations for wishlist items.
 */
export function getTypeLabel(itemType: string, lang: Lang): string {
  const map: Record<string, TranslationKey> = {
    service: "typeService",
    package: "typePackage",
    product: "typeProduct",
    ebook: "typeEbook",
  };
  const key = map[itemType];
  return key ? t(key, lang) : t("typeItem", lang);
}

export default translations;

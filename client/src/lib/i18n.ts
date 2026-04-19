export const translations = {
  ES: {
    // Header
    aestheticNutrition: "Aesthetic & Nutrition",
    nutriserShop: "Tienda Nutriser",
    searchPlaceholder: "¿Qué estás buscando?",
    closeSession: "Cerrar sesión",
    back: "Regresar",
    
    // Tabs
    tabTreatments: "Tratamientos",
    tabFarmacy: "Farmacy",
    tabWallet: "Monedero",
    tabLibrary: "Librería",
    tabWishlist: "Deseos",
    tabAccount: "Cuenta",
    
    // Categories
    catAll: "Todos",
    catPackages: "Paquetes",
    catNutricion: "Nutrición",
    catCorporales: "Corporales",
    catFaciales: "Faciales",
    catMedicina: "Medicina",
    catOtros: "Otros",
    catProductos: "Productos",
    catGeneral: "General",
    
    // Buttons
    viewAll: "Ver todo",
    buy: "Comprar",
    buyNow: "Comprar ahora",
    addToCart: "Al carrito",
    add: "Agregar",
    proceedToPayment: "Proceder al pago",
    done: "Listo",
    apply: "Aplicar",
    
    // Messages
    noServicesFound: "No se encontraron servicios",
    consultPrice: "Consultar precio",
    comingSoon: "Próximamente",
    lastUnits: "Últimas",
    addedToCart: "agregado al carrito",
    enterCode: "Ingresa un código",
    twoForOneToast: "¡Código 2x1 aplicado!",
    giftCodeToast: "¡Código de regalo aplicado!",
    discountToast: "de descuento aplicado",
    invalidCode: "Código inválido o no está activo",
    codeValidationError: "Error al validar el código",
    enterName: "Ingresa tu nombre",
    enterEmail: "Ingresa tu correo",
    enterPhone: "Ingresa tu teléfono",
    uploadProof: "Sube el comprobante de pago",
    walletPayError: "Error al procesar pago con monedero",
    tryAgain: "Intenta de nuevo",
    walletDeductError: "Error al descontar monedero",
    maxFileSize: "Máximo 5MB",
    numberCopied: "Número copiado",
  },
  EN: {
    // Header
    aestheticNutrition: "Aesthetic & Nutrition",
    nutriserShop: "Tienda Nutriser",
    searchPlaceholder: "What are you looking for?",
    closeSession: "Close session",
    back: "Back",
    
    // Tabs
    tabTreatments: "Treatments",
    tabFarmacy: "Pharmacy",
    tabWallet: "Wallet",
    tabLibrary: "Librería",
    tabWishlist: "Wishlist",
    tabAccount: "Account",
    
    // Categories
    catAll: "All",
    catPackages: "Packages",
    catNutricion: "Nutrition",
    catCorporales: "Body",
    catFaciales: "Facials",
    catMedicina: "Medicine",
    catOtros: "Others",
    catProductos: "Products",
    catGeneral: "General",
    
    // Buttons
    viewAll: "View all",
    buy: "Buy",
    buyNow: "Buy now",
    addToCart: "Add to cart",
    add: "Add",
    proceedToPayment: "Proceed to payment",
    done: "Done",
    apply: "Apply",
    
    // Messages
    noServicesFound: "No services found",
    consultPrice: "Consult price",
    comingSoon: "Coming soon",
    lastUnits: "Last units",
    addedToCart: "added to cart",
    enterCode: "Enter a code",
    twoForOneToast: "2x1 code applied!",
    giftCodeToast: "Gift code applied!",
    discountToast: "discount applied",
    invalidCode: "Invalid or inactive code",
    codeValidationError: "Error validating code",
    enterName: "Enter your name",
    enterEmail: "Enter your email",
    enterPhone: "Enter your phone",
    uploadProof: "Upload payment proof",
    walletPayError: "Error processing wallet payment",
    tryAgain: "Try again",
    walletDeductError: "Error deducting wallet",
    maxFileSize: "Maximum 5MB",
    numberCopied: "Number copied",
  },
};

export type Lang = "ES" | "EN";

export const t = (key: keyof typeof translations.ES, lang: Lang): string => {
  return translations[lang][key] || translations.ES[key];
};

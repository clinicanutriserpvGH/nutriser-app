# 3 Problemas a resolver

## 1. Botón "¡LO QUIERO!" del PromoSplash
- Actualmente navega a `/coupons` que es un redirect a Home con scroll a "promociones"
- Debería navegar a `/cupon/:id` con el ID del cupón específico para que el usuario pueda comprarlo
- La ruta `/cupon/:id` existe y tiene CouponPage con flujo de pago completo
- Fix: En PromoSplash, pasar el ID de la promo al onGoToCoupon callback
- En Memberships.tsx, cambiar navigate("/coupons") a navigate(`/cupon/${promoId}`)

## 2. Botón Nutriser Shop en navbar desktop
- Actualmente aparece arriba en el navbar
- Debe estar en el hero donde está "Cuponera de Descuentos", con estilo brillante
- Fix: Quitar del Navbar.tsx el botón para desktop
- En HeroSection.tsx, agregar botón "Nutriser Shop" donde está Cuponera, solo visible en desktop

## 3. Responsive de la tienda
- En desktop las tarjetas se ven desacomodadas
- Mejorar grid/layout para desktop, tableta y celular

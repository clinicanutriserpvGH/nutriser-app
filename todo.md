# Nutriser - Tareas Completadas

## Página Principal
- [x] Leer catálogo completo DOCX para extraer todos los servicios
- [x] Subir fotos reales de la clínica (recepción, sala de espera) como assets CDN
- [x] Subir logo oficial de Nutriser como asset CDN
- [x] Agregar todos los 27 servicios en 6 categorías con tabs interactivos
- [x] Reemplazar imágenes generadas con fotos reales de la clínica
- [x] Integrar el logo oficial en navbar y footer

## Sistema de Membresías

### Base de Datos
- [x] Crear tabla de membresías en drizzle/schema.ts
- [x] Crear tabla de comprobantes de pago en drizzle/schema.ts
- [x] Ejecutar migraciones con pnpm db:push

### Backend (tRPC)
- [x] Crear procedimiento para crear membresía
- [x] Crear procedimiento para subir comprobante
- [x] Crear procedimiento para listar membresías (admin)
- [x] Crear procedimiento para validar membresía

### Frontend - Página de Membresías
- [x] Crear página de membresías con tarjetas Básico y Premium
- [x] Mostrar clave interbancaria de Banamex (002470701448743487)
- [x] Mostrar detalles de cada programa
- [x] Formulario para datos de cliente

### Frontend - Formulario de Comprobante
- [x] Crear formulario para subir foto del comprobante
- [x] Validar que sea imagen
- [x] Enviar al servidor

### Frontend - Panel de Administrador
- [x] Crear página admin con tabla de membresías
- [x] Mostrar estado de cada membresía
- [x] Mostrar comprobante de pago
- [x] Opción para validar/rechazar membresía

### Integración
- [x] Agregar enlace a membresías en navegación
- [x] Agregar enlace a admin en navegación

## Tests
- [x] Crear tests unitarios para procedimientos de membresías
- [x] Ejecutar y verificar que todos los tests pasen

## Correcciones Solicitadas
- [x] Agregar botón visible de "Programas de Membresía" en la página principal
- [x] Corregir servicios de Nutrición para dejar solo "Asesoría Nutricional Personalizada"

## Errores a Corregir
- [x] Arreglar subida de imagen del comprobante (no permite subir)
- [x] Reparar enlace de Membresías en navegación (no funciona)
- [x] Configurar envío automático de correos a clinicanutriserpv@gmail.com con foto y datos


## Nuevas Funcionalidades Solicitadas

### Base de Datos y Backend
- [ ] Crear tabla de citas en drizzle/schema.ts
- [ ] Crear procedimientos tRPC para crear y listar citas
- [ ] Crear tabla de admin con credenciales (email: clinicanutriserpv@gmail.com, contraseña: admin123456)

### Correos Automáticos
- [ ] Configurar envío de correo de confirmación de membresía desde clinicanutriserpv@gmail.com
- [ ] Enviar correo de confirmación de cita cuando se agenda

### Panel de Administración
- [ ] Crear página de login para admin
- [ ] Crear dashboard admin con tabla de membresías
- [ ] Mostrar tabla de citas agendadas

### Sistema de Agendamiento
- [ ] Crear página de agendamiento de citas con calendario
- [ ] Permitir seleccionar fecha y hora
- [ ] Guardar cita en base de datos

### Notificaciones
- [ ] Enviar notificación al admin cuando se agenda una cita
- [ ] Enviar correo al admin cuando se agenda una cita

## Correcciones Solicitadas - Sesión 2

### Admin Dashboard
- [x] Cambiar credenciales admin a: clinicanutricerpv@gmail.com / nutricer 2024
- [x] Crear tabla de membresías en dashboard (quién está inscrito, quién compró programa)
- [x] Crear tabla de citas en dashboard
- [x] Asegurar que el login admin funciona correctamente

### Formulario de Citas
- [x] Crear formulario separado para "Agenda tu valoración" (no WhatsApp)
- [x] Agregar campos: nombre, correo, teléfono, fecha, horario (todos obligatorios)
- [x] Guardar citas en base de datos
- [x] Mostrar citas en panel de administración

### Validaciones
- [x] Hacer teléfono obligatorio en membresías (no opcional)
- [x] Validar que todos los campos requeridos estén completos

### Notificaciones por Correo
- [x] Configurar notificaciones de membresías como correo directo desde la persona
- [x] Enviar correo de confirmación de cita al admin
- [x] Enviar correo de confirmación de cita al cliente

## Correcciones Sesión 3

- [x] Corregir email de admin a clinicanutriserpv@gmail.com (contraseña: nutriser 2024)
- [x] Configurar correos de citas para que lleguen desde clinicanutriserpv@gmail.com
- [x] Verificar que el login de admin funciona correctamente
- [x] Verificar que los correos de citas llegan desde el email de la clínica

## Correcciones Sesión 4

- [x] Corregir contraseña de admin a nutriser2024 (sin espacio)
- [x] Agregar toggle de visibilidad de contraseña en login (ícono de ojo)
- [x] Agregar botones de volver en todas las páginas (membresías, citas, admin, etc.)

## Correcciones Sesión 5

- [x] Corregir correos de membresía para que vengan SOLO desde clinicanutriserpv@gmail.com
- [x] Corregir correos de citas para que vengan SOLO desde clinicanutriserpv@gmail.com
- [x] Remover correos automáticos del sitio en procedimientos
- [x] Verificar que NO se envíen correos desde el sitio al paciente

## Correcciones Sesión 6

- [x] Agregar selector de servicios en formulario de citas
- [x] Mostrar todos los servicios disponibles (Asesoría Nutricional, Valoración, etc.)
- [x] Permitir que el usuario seleccione el servicio que desea agendar
- [x] Verificar que NO se envíen correos del sitio en ningún lado
- [x] Asegurar que TODOS los correos vengan desde clinicanutriserpv@gmail.com

## Correcciones Críticas Sesión 7

- [x] Remover OAuth - permitir acceso directo al admin sin login
- [x] Reparar panel admin para mostrar comprobantes de membresías
- [x] Agregar botón "Verificar" en comprobantes para activar membresía
- [x] Enviar correo de activación desde clinicanutriserpv@gmail.com cuando admin activa
- [x] Mostrar citas agendadas en panel admin con detalles
- [x] Eliminar TODOS los correos automáticos del sitio (solo desde clínica)
- [x] Verificar que NO se redirige a OAuth en ningún lado
- [x] Verificar funcionalidad completa: membresías, comprobantes, citas

## Correcciones Sesión 8 - Panel Admin

- [x] Implementar modal para ver comprobante de pago (botón "Ver")
- [x] Cambiar verificación de automática a manual (admin debe confirmar después de ver comprobante)
- [x] Agregar botón "Eliminar" para membresías verificadas
- [x] Agregar funcionalidad de "Agendar" citas con selector de fecha/hora
- [x] Modal de agendar citas con campos de fecha y hora
- [x] Mensaje informativo sobre correo de confirmación desde la clínica
- [ ] Completar integración de enviar correo de confirmación de cita agendada
- [ ] Incluir número de WhatsApp/teléfono en correo de cita

## Correcciones Sesión 9 - Visualización de Comprobantes

- [ ] Revisar cómo se guardan los comprobantes en S3
- [ ] Verificar que la URL se recupera correctamente de la BD
- [ ] Corregir modal para mostrar imagen correctamente
- [ ] Probar visualización de comprobante en navegador

## Correcciones Sesión 10 - Comprobantes y Citas

- [ ] Corregir visualización de comprobantes en modal (la imagen no se muestra)
- [x] Cambiar funcionalidad de citas de "Agendar" a "Aprobar" (confirmar cita del paciente)
- [x] Implementar horarios fijos de la clínica:
  - [x] Mañana: 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30
  - [x] Tarde: 16:00, 16:30, 17:00, 17:30, 18:00, 18:30, 19:00, 19:30
- [x] Actualizar modal de citas para mostrar dropdown de horarios disponibles
- [x] Actualizar formulario de citas del cliente para mostrar dropdown de horarios
- [ ] Verificar que el admin puede aprobar citas correctamente
- [ ] Verificar que las imágenes de comprobantes se muestran en el modal

## Correcciones Sesión 11 - Flujo de Citas y UI

### Panel Admin - Citas
- [ ] Cambiar flujo: paciente selecciona hora, admin solo APRUEBA
- [ ] Remover selector de hora del modal de aprobación
- [ ] Mostrar solo la hora que el paciente seleccionó

### Panel Admin - Comprobantes
- [ ] Arreglar visualización de imágenes en modal
- [ ] Agregar botón "Verificar Todo" para aprobar todas las membresías pendientes
- [ ] Agregar botón "Eliminar Todo" para eliminar todas las membresías

### Página de Inicio - Botones CTA
- [ ] Cambiar botón de llamada arriba para mostrar número 3224503257
- [ ] Agregar botón "Adquirir programa" junto a WhatsApp en sección CTA
- [ ] Cambiar sección de abajo a 4 botones: Llamada, WhatsApp, Agendar Valoración, Adquirir Programa
- [ ] Hacer que todos los botones sean funcionales y consistentes

## Correcciones Sesión 11 - Completadas

### Panel Admin - Citas
- [x] Cambiar flujo: paciente selecciona hora, admin solo APRUEBA
- [x] Remover selector de hora del modal de aprobación
- [x] Mostrar solo la hora que el paciente seleccionó

### Panel Admin - Comprobantes
- [x] Arreglar visualización de imágenes en modal (con estado de carga y manejo de errores)
- [x] Agregar botón "Verificar Todo" para aprobar todas las membresías pendientes
- [x] Agregar botón "Eliminar Todo" para eliminar todas las membresías

### Página de Inicio - Botones CTA
- [x] Cambiar botón de llamada arriba para mostrar número 3224503257 (verde con icono)
- [x] Agregar botón "Adquirir programa" junto a WhatsApp en sección CTA
- [x] Cambiar sección de abajo a 4 botones: Llamada, WhatsApp, Agendar Valoración, Adquirir Programa
- [x] Hacer que todos los botones sean funcionales y consistentes

### Archivos Modificados:
- HeroSection.tsx: Agregado botón de llamada verde con número
- CtaBanner.tsx: Agregado botón WhatsApp y cambio de "Programas de Membresía" a "Adquirir Programa"
- ContactSection.tsx: Agregados 4 botones en grid (Llamar, WhatsApp, Agendar, Programas)
- AdminDashboard.tsx: Modal de citas mejorado, botones de verificar/eliminar todo, modal de comprobantes con estado de carga


## Correcciones Sesión 12 - Sistema de Cupones y Navbar

### Navbar
- [ ] Cambiar botón "AGENDAR CITA" a "LLAMADA: 322 450 3257" con icono de teléfono
- [ ] Agregar redes sociales en navbar: Instagram y Facebook (@nutriserpv)

### Hero Section
- [ ] Cambiar botón verde "LLAMADA" a "ADQUIRIR PROGRAMA" con icono de regalo
- [ ] Color negro con dorado llamativo para destacar

### Sistema de Cupones
- [ ] Crear tabla de cupones en drizzle/schema.ts con campos: código, descuento, estado (activo/inactivo)
- [ ] Crear cupones predefinidos: Nutri-ser 10 (10%), Nutri-ser 20 (20%), Nutri-ser 30 (30%)
- [ ] Agregar campo de cupón en formulario de membresías
- [ ] Validar cupón en tiempo real y mostrar descuento
- [ ] Calcular precio final con descuento aplicado
- [ ] Crear tabla de cupones en panel admin
- [ ] Admin debe aprobar cupones antes de activarlos
- [ ] Mostrar estado de cada cupón (Activo/Inactivo/Pendiente de aprobación)

## Correcciones Sesión 13 - Imágenes de Promociones y WhatsApp

### Problema de Imágenes
- [x] Corregir visualización de imágenes de promociones (URLs S3 no se cargan)
- [x] Investigar problema de CORS o permisos en S3
- [x] Crear proxy de imágenes si es necesario
- [x] Verificar que las URLs se guardan correctamente en BD

### Botón de Promociones
- [x] Cambiar botón "Más Información" a "Lo Quiero"
- [x] Integrar WhatsApp con número 3221007799
- [x] Mensaje predefinido: "Quiero la promoción: [nombre de la promoción]"
- [x] Botón abre WhatsApp automáticamente con mensaje

## Corrección Flujo Modal de Regalo
- [x] Dividir modal en 2 pasos: Paso 1 (datos del comprador), Paso 2 (pago + timer 15 min)
- [x] Timer solo empieza cuando el usuario hace click en "Continuar" al paso 2
- [x] Mensaje claro: "Tienes 15 minutos para subir tu comprobante. Si no lo subes, deberás registrarte de nuevo"

## Sistema de Cupones con Código Único
- [x] Agregar campo couponCode (código único NUT-XXXX-XXXX) en tabla giftPurchases
- [x] Agregar campo isGift (boolean) y recipientName, recipientContact en tabla
- [x] Generar código único automáticamente al crear compra
- [x] Modal 3 pasos: Paso 1 (datos comprador), Paso 2 (¿para mí o regalo?), Paso 3 (pago + timer)
- [x] Si es regalo: pedir nombre y contacto del destinatario
- [x] Panel admin: mostrar código único, nombre comprador, destinatario si es regalo
- [x] Mostrar estado: Pendiente / Autorizado / Usado
- [ ] Al autorizar: generar imagen/tarjeta del cupón con código visible

## Imagen Visual del Cupón Autorizado
- [x] Crear componente CouponCard con diseño elegante dorado (logo, nombre titular, promoción, código)
- [x] Usar html2canvas para convertir tarjeta a imagen descargable
- [x] Mostrar tarjeta visual cuando el cupón está autorizado
- [x] Botón "Descargar Imagen" para guardar el cupón
- [x] Botón "Compartir por WhatsApp" que abre WhatsApp con mensaje + imagen

## Notificación de Cupón Autorizado
- [x] Quitar tarjeta del paso "success" - solo mostrar mensaje de espera con código
- [x] Al autorizar en admin: enviar email al comprador con tarjeta del cupón
- [x] Al autorizar en admin: abrir WhatsApp automáticamente al número del comprador
- [x] Email incluye: código, nombre, promoción, instrucciones para usar

## Fecha Límite de Cupones y Cita Previa
- [x] Agregar campo `expiresAt` (fecha límite) en tabla `promotions` del schema
- [x] Backend: al listar cupones, marcar automáticamente como expirados si pasó la fecha
- [x] Panel admin: campo de fecha límite al crear/editar promoción
- [x] Cupón visual: mostrar fecha límite y texto "Previa cita requerida"
- [x] Email de autorización: incluir fecha límite y aviso de cita previa
- [x] Sección de promociones: mostrar fecha límite en cada cupón

## Botón "Lo Quiero" = Flujo de Compra
- [x] Cambiar botón "Lo Quiero" para abrir el modal de compra de 3 pasos (igual que el icono regalo)

## Correos siempre desde clinicanutriserpv@gmail.com
- [x] Verificar y fijar remitente en todos los emails a clinicanutriserpv@gmail.com

## Eliminar notificaciones de Manus Team
- [x] Reemplazar notifyOwner (Manus) en compra de cupón por email Gmail desde clinicanutriserpv@gmail.com

## WhatsApp al autorizar cupón
- [ ] Corregir envío de WhatsApp al comprador cuando admin autoriza el cupón

## Quitar bloque WhatsApp de confirmación de cupón
- [x] Eliminar bloque de WhatsApp de la pantalla de éxito y dejar solo correo electrónico

## Link directo a cupón específico
- [x] Agregar ID a cada tarjeta de cupón y scroll automático al abrir link compartido
- [x] Resaltar visualmente el cupón al que apunta el link

## Link directo en todos los botones de compartir
- [x] Incluir vínculo directo al cupón en Email y Copiar link (igual que WhatsApp)

## Bug: Error imageUrl al crear promoción
- [x] Eliminar campo imageUrl de promociones (ya no se usan imágenes en cupónes)

## Mejoras botones Hero
- [x] Botón "Promociones Vigentes": agregar luz parpadeante + icono de regalo
- [x] Botón "Adquirir Programa" → renombrar a "Comprar Programa Nutrición"

## Renombrar textos globales
- [x] "Promociones Vigentes" → "Cuponera Nutriser" en hero
- [x] "Adquirir Programa" → "Comprar Programa Nutrición" en navbar, hero, CTA y demás

## Correcciones formulario y mapa
- [x] Cambiar "Agenda tu valoración" por "Agenda tu cita" en el formulario
- [x] Corregir ubicación del mapa a Emiliano Zapata #2, Col. Valentín Gómez Farías, Puerto Vallarta

## Mejoras ContactSection y ServicesSection
- [x] Agregar botón "Cuponera Nutriser" en la sección de contacto con vínculo a la sección de cupones
- [x] Personalizar mensaje de WhatsApp en botón "Consultar" de cada servicio con su nombre específico

## Cuponera en CtaBanner
- [x] Agregar botón "Cuponera Nutriser" en el banner CTA dorado

## Correcciones urgentes
- [x] "Cuenta" → "CLABE Interbancaria" en datos de transferencia de membresías
- [x] Concepto de pago → solo "Programa Premium" o "Programa Básico" (sin nombre)
- [x] "Agenda tu Valoración" → "Agenda tu Cita" en sección About y que el botón funcione

## Tienda Ebook
- [ ] Schema y backend: tabla ebooks, tabla ebook_purchases, upload PDF a S3
- [ ] Panel admin: subir portada, contraportada, descripción y PDF del ebook
- [ ] Página pública del ebook: portada, descripción, botón comprar, flujo de pago
- [ ] Visor PDF en línea sin descarga (protegido, solo tras compra)
- [ ] Botón "Tienda Ebook" en hero y menú de navegación

## Sistema eBook - Sesión Actual

- [x] Verificar que bugs reportados ya estaban corregidos (CLABE, concepto, About)
- [x] Crear tabla ebooks en drizzle/schema.ts (ya existía de sesión anterior)
- [x] Crear tabla ebookPurchases en drizzle/schema.ts (ya existía)
- [x] Implementar backend: getActive, getAllEbooks, upsertEbook, purchase, listPurchases, updatePurchaseStatus, getAccess
- [x] Corregir error TypeScript en routers.ts (oauthServerUrl → oAuthServerUrl)
- [x] Agregar tab "eBook" en panel de administración (AdminDashboard.tsx)
- [x] Formulario admin: título, descripción, precio, portada, contraportada, PDF
- [x] Lista de compras de eBook en panel admin con botones Aprobar/Rechazar
- [x] Crear página pública EbookStore.tsx con flujo de 3 pasos
- [x] Crear visor PDF seguro EbookReader.tsx (sin descarga, acceso por token)
- [x] Agregar rutas /ebook y /ebook/read en App.tsx
- [x] Agregar "Tienda eBook" en Navbar.tsx
- [x] Agregar botón "Tienda eBook" en HeroSection.tsx
- [x] Escribir 7 tests de vitest para el sistema eBook (todos pasan)

## Correcciones eBook - Sesión Actual

- [ ] Corregir botón "Actualizar eBook" que no hace nada al presionar
- [ ] Implementar sistema de acceso seguro: correo + contraseña para compradores
- [ ] Guardar credenciales de acceso en BD al aprobar compra
- [ ] Enviar correo al comprador con su correo y contraseña de acceso
- [ ] Crear página de login para acceder al eBook
- [ ] Proteger visor PDF: solo accesible con credenciales válidas
- [ ] Panel admin: mostrar credenciales de acceso de cada comprador

## Correcciones Sesión Actual - Sistema eBook Seguro

- [x] Corregir correo GMAIL_USER a clinicanutriserpv@gmail.com en secretos
- [x] Eliminar correos hardcodeados incorrectos del código del servidor
- [x] Agregar campo accessPasswordHash a tabla ebookPurchases
- [x] Generar contraseña automática al aprobar compra de eBook
- [x] Enviar credenciales (correo + contraseña) por email al aprobar
- [x] Crear página /ebook/login con formulario de acceso seguro
- [x] Actualizar visor PDF para soportar acceso por sessionStorage (login)
- [x] Actualizar panel admin: confirmación antes de aprobar, badge de credenciales enviadas
- [x] Agregar ruta /ebook/login en App.tsx
- [x] Tests para ebook.login (9 tests pasan en total)

## Sistema de Referidos eBook
- [x] Agregar columna referredBy en tabla ebookPurchases
- [x] Capturar parámetro ?ref= en la URL de la tienda eBook
- [x] Guardar el referido al crear la compra
- [x] Mostrar botón "Recomendar por WhatsApp" en el paso de confirmación
- [x] Mostrar el referido en el panel admin de compras

## Correcciones y Nuevas Funciones - Sesión Actual
- [ ] Corregir botón "Recomendar por WhatsApp" que no aparece en la tienda eBook
- [ ] Crear tabla ebookDiscountCodes en schema (ebook10/20/30/ebookfree)
- [ ] Backend: validar código de descuento y calcular precio final
- [ ] Frontend: campo de código de descuento en tienda eBook con validación en tiempo real
- [ ] Panel admin: activar/desactivar códigos de descuento del eBook

## Dominio Oficial
- [x] Corregir links generados para usar siempre nutriserpv.com (no dominios de Manus)

## PWA (Progressive Web App)
- [x] Crear manifest.json con nombre, colores e iconos de Nutriser
- [x] Implementar Service Worker para cache y funcionamiento offline
- [x] Agregar meta tags para iOS (apple-touch-icon, apple-mobile-web-app)
- [x] Generar iconos en múltiples tamaños (192x192, 512x512)
- [x] Configurar Vite para registrar el Service Worker

## Cambios Sesión Actual

- [x] Agregar "Acceso a seguimiento online" al Programa Básico
- [x] Agregar "10% de descuento en compra de eBook" al Programa Premium

## Portal de Salud - Sesión Actual

- [x] Agregar botón "Ingresa a tu Portal de Salud Nutriser" con ícono de cinta de medir en Navbar
- [x] Agregar botón "Ingresa a tu Portal de Salud Nutriser" con ícono de cinta de medir en HeroSection
- [x] Enlace apunta a https://nutriserseguimiento.manus.space

## Limpieza de Botones Hero y Navbar

- [x] Hero: Eliminar botón "Agenda tu Cita"
- [x] Hero: Eliminar botón "Agenda por WhatsApp"
- [x] Hero: Dejar solo 4 botones: Tienda eBook, Comprar Programa Nutrición, Portal de Salud Nutriser, Cuponera Nutriser
- [x] Navbar: Agregar botón "Agenda tu Cita" que lleva al formulario /appointment-form

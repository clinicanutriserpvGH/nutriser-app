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

## Correcciones Sesión Actual

- [x] Hero desktop: reorganizar 4 botones en 2 filas de 2 para que no se corten
- [x] Admin: corregir error al eliminar promociones/cupones

## Tienda eBook - Mejoras

- [x] Quitar campo contraportada (backCoverUrl) del schema, db.ts, routers y admin
- [x] Agregar campo comingSoon (boolean) al schema de ebooks
- [x] Actualizar panel admin: mostrar toggle "Próxima publicación" y quitar campo contraportada
- [x] Actualizar tienda pública: mostrar badge "Próximamente" y ocultar botón de compra para eBooks comingSoon

## Bug Descuento eBook

- [x] Corregir monto en pantalla de pago para mostrar precio con descuento aplicado

## Pre-venta eBook Próximamente

- [x] EbookStore: mostrar aviso de pre-venta en tarjeta de eBook comingSoon ("Puedes adquirirlo ahora, disponible al publicarse")
- [x] EbookStore: en pantalla de confirmación de compra (paso 3 Listo), mostrar mensaje especial si el eBook es comingSoon
- [x] EbookStore: ocultar botón de descarga/lectura si el eBook es comingSoon (mostrar mensaje "Disponible próximamente")
- [x] Mis compras: si el eBook comprado es comingSoon, mostrar estado "Pendiente de publicación" en lugar del botón de descarga

## Bug Correos Programas de Nutrición

- [x] Quitar envío de correo al usuario al momento de enviar comprobante
- [x] Mostrar mensaje en pantalla de éxito: "Tu comprobante fue recibido, en cuanto sea confirmado tu pago se autorizará el acceso"
- [x] Enviar correo de confirmación al usuario SOLO cuando el admin aprueba el pago
- [x] Correo de aprobación debe indicar que serán contactados para instrucciones de acceso

## Correos - Remitente y Referencias Manus

- [x] Asegurar que todos los correos se envíen desde clinicanutriserpv@gmail.com
- [x] Eliminar cualquier referencia a Manus en el contenido de los correos
- [x] Verificar que el correo de confirmación de membresía solo se envíe al aprobar el admin

## Mejoras Cupones y eBook - Sesión Mar 24

- [x] DB: campo usedAt no necesario, se usa status='used' en giftPurchases
- [x] DB: campo price (decimal nullable) en promotions ya existe
- [x] DB: campo presalePrice (decimal nullable) en ebooks ya existe
- [x] Admin: cupones adquiridos - botón "Marcar como usado" implementado
- [x] Admin: cupones adquiridos - botón "Eliminar" visible solo cuando status='used' o 'rejected'
- [x] Admin: promociones - botón "Editar" implementado con formulario inline
- [x] Admin: promociones - campo precio al publicar nueva promoción
- [x] Admin: eBook - campo "Precio de pre-venta" separado del precio normal
- [x] EbookStore: comparativa precio normal vs precio de pre-venta cuando comingSoon

## Correcciones Sesión Mar 24 - Adicionales
- [x] Bug logout: corregido nombre de cookie en auth.logout (usaba 'session' en vez de COOKIE_NAME)
- [x] Test memberships.uploadProof: corregido para crear membresía válida antes de subir comprobante
- [x] Todos los 18 tests pasan correctamente

## Bug Fix - Marcar Cupón como Usado (Mar 24 - Fix 2)
- [x] Bug: updateGiftPurchaseStatus solo aceptaba "pending"|"approved"|"rejected", no "used"
- [x] Fix: Actualizar firma de updateGiftPurchaseStatus para incluir "used" en los tipos aceptados
- [x] Fix: Agregar función deleteGiftPurchase en db.ts usando Drizzle ORM (en lugar de SQL raw)
- [x] Fix: Reemplazar SQL raw en markUsed y delete por llamadas a funciones de db.ts
- [x] Todos los 18 tests siguen pasando

## Bug Fix - Migración BD giftPurchases (Mar 24 - Fix 3)
- [x] Causa raíz: el ENUM del campo status en la tabla giftPurchases en MySQL solo tenía ('pending','approved','rejected') - faltaba 'used'
- [x] Fix: ALTER TABLE giftPurchases MODIFY COLUMN status ENUM('pending','approved','rejected','used') NOT NULL DEFAULT 'pending'
- [x] Verificado: markUsed y delete funcionan correctamente en producción (nutriserpv.com)

## Mejora Cupones Dinámicos (Mar 24)
- [x] DB: campo regularPrice (decimal nullable) agregado a promotions
- [x] DB: price = precio promocional, regularPrice = precio regular original
- [x] DB: imageUrl ya existía en promotions, ahora se usa activamente
- [x] Admin: formulario de crear/editar promoción con precio regular, precio promocional e imagen
- [x] Admin: subir imagen para la promoción con preview y botón eliminar
- [x] Cuponera pública: imagen del cupón con badge "OFERTA" y gradiente
- [x] Cuponera pública: comparativa de precios (regular tachado → flecha → promocional destacado + mensaje)
- [x] Tests: 18 tests pasan correctamente

## Open Graph dinámico para cupones (Mar 24)
- [x] Endpoint SSR /cupon/:id con meta tags OG dinámicas (imagen, título, descripción, precios)
- [x] Enlaces de compartir actualizados: WhatsApp, Email, Copiar usan /cupon/:id
- [x] Bots (WhatsApp, Facebook, etc.) reciben HTML con OG; usuarios normales redirigidos a /#cupon-:id

## Contador de cupones restantes (Mar 24)
- [x] OG dinámico: ruta corregida a /api/og/cupon/:id (evita conflicto con serveStatic)
- [x] DB: campo maxCoupons (int nullable) agregado a promotions
- [x] Admin: campo "Cupones disponibles" al crear/editar promoción con preview
- [x] Backend: getPromotionsWithCouponCounts cuenta cupones vendidos por promoción
- [x] Cuponera pública: contador visual con barra de progreso (vendidos/total)
- [x] Cuponera pública: colores de urgencia (verde → naranja → rojo)
- [x] Botón "Lo Quiero" deshabilitado cuando cupones agotados
- [x] Tests: 18 tests pasan correctamente

## Correcciones Sesión Mar 24 - Lote 2
- [x] Cupón compacto: tarjeta rediseñada más compacta (imagen reducida, info condensada en una línea)
- [x] Compartir: botón Email reemplazado por Instagram (abre instagram.com/nutriserpv)
- [x] OG dinámico: ruta /api/og/cupon/:id funciona en producción con imagen del cupón
- [x] Correo al comprador: sistema verificado - funciona desde clinicanutriserpv@gmail.com; correo enviado manualmente a Mohamed (NUT-PVE8-EF0R)
- [x] Admin eBook: botón '🚫 Revocar Acceso' para aprobados + botón '🗑 Eliminar' para rechazados
- [x] Tests: 18 tests pasan correctamente

## Mejoras Mar 24 - Lote 3
- [ ] OG dinámico: corregir para que WhatsApp y Facebook muestren imagen del cupón al compartir
- [ ] Compartir: quitar botón Instagram, dejar solo WhatsApp y Copiar link
- [ ] Cupón: rediseñar con más urgencia visual (contador de disponibles más llamativo)
- [ ] Servicios: agregar imágenes compactas a cada servicio
- [ ] Servicios: botón "Adquirir" visible en móvil (no solo al pasar cursor)
- [ ] Sistema de compra de servicios: tabla servicePurchases en BD
- [ ] Sistema de compra de servicios: formulario con nombre, correo, teléfono, comprobante
- [ ] Sistema de compra de servicios: código único por compra
- [ ] Admin: panel de compras de servicios con aprobación
- [ ] Admin: correo al admin cuando llega compra de servicio

## Suscripción a Cuponera (Mar 24 - Lote 4)
- [ ] DB: tabla couponSubscribers (id, email, whatsapp, isActive, createdAt)
- [ ] Backend: procedimiento subscribe (guarda correo + WhatsApp)
- [ ] Backend: notificar suscriptores al publicar nuevo cupón (correo + WhatsApp via wa.me)
- [ ] Cuponera: botón "🔔 Suscribirse a ofertas" en cada cupón con modal
- [ ] Admin: lista de suscriptores a la cuponera

## Implementación Completa - Sesión Mar 24 Lote 4+
- [ ] Backend: procedimientos tRPC para suscriptores (subscribe, listSubscribers, deleteSubscriber)
- [ ] Backend: notificación por correo a todos los suscriptores al publicar cupón
- [ ] Backend: procedimientos tRPC para compras de servicios (create, list, updateStatus, delete)
- [ ] Frontend: botón "Suscribirse a ofertas" prominente en sección cuponera
- [ ] Frontend: modal de suscripción con campos email + WhatsApp
- [ ] Frontend: notificaciones push del navegador (Web Push API con VAPID)
- [ ] Frontend: service worker extendido con push listener
- [ ] Frontend: sistema de compra de servicios con formulario y comprobante
- [ ] Admin: panel de suscriptores con lista y opción eliminar
- [ ] Admin: panel de compras de servicios con aprobación
- [ ] Email: función sendNewCouponNotificationToSubscribers
- [ ] Email: función sendServicePurchaseNotificationToAdmin
- [ ] Email: función sendServicePurchaseApprovedToClient

## Sistema de Suscripción y Notificaciones (Mar 24 2026)

- [x] Botón "Suscribirse a Ofertas" prominente en la sección cuponera con badge GRATIS
- [x] Modal de suscripción con formulario de correo + WhatsApp
- [x] Activación de notificaciones push del navegador (Web Push API) desde el modal
- [x] Service Worker actualizado con manejo de push notifications y notificationclick
- [x] Tabla pushSubscriptions en la BD para guardar suscripciones push
- [x] Procedimiento tRPC push.subscribe / push.unsubscribe / push.getVapidPublicKey
- [x] Procedimiento tRPC couponSubscribers.subscribe / list / delete
- [x] Notificación automática por correo a todos los suscriptores al publicar cupón
- [x] Notificación push automática a todos los suscriptores al publicar cupón
- [x] Tab "Suscriptores" en panel admin con tabla y botón eliminar
- [x] Tab "Compras Servicios" en panel admin con aprobar/rechazar/eliminar
- [x] Procedimientos tRPC servicePurchases.create / list / approve / reject / delete
- [x] Email automático al admin cuando se crea una compra de servicio
- [x] Email automático al comprador cuando se aprueba su compra de servicio
- [x] Tests de vitest para todos los nuevos procedimientos (14 tests, todos pasan)

## Correcciones Sesión - Mar 24 2026 (Tarde)

- [x] Mejorar modal de push: agregar instrucciones para iOS (agregar a pantalla de inicio)
- [x] Agregar botón "Adquirir" visible siempre en cada tarjeta de servicios
- [x] Agregar modal de compra de servicio con formulario y comprobante
- [x] Corregir compartir cupón: link al inicio del mensaje para que WhatsApp genere vista previa con imagen

## Correcciones Modal Suscripción - Mar 24 2026

- [x] Quitar campo WhatsApp del modal de suscripción
- [x] Separar en dos opciones: "Correo" y "Notificaciones Push"
- [x] Detectar iOS/Safari y mostrar instrucciones solo en ese caso
- [x] Explicar que en Android se activa con un solo clic

## Correcciones Push - Mar 24 2026
- [x] Cambiar texto botón iOS de "Ya la agregué, activar" a "Activar Notificaciones Push"
- [x] Deduplicar suscripciones push por endpoint (evitar múltiples registros del mismo dispositivo)
- [x] Agregar requireInteraction:true en las notificaciones push para que no desaparezcan solas
- [x] Agregar tag 'nutriser-promo' para que notificaciones se reemplacen en lugar de acumularse

## Corrección OG Image Cupón - Mar 24 2026
- [x] Corregir endpoint /api/og/cupon/:id para que devuelva og:image con la imagen real del cupón
- [x] Crear nueva ruta /cupon/:id que siempre devuelve HTML con OG tags (sin depender de bot detection)
- [x] Actualizar URL compartida en WhatsApp y Copiar Link a https://nutriserpv.com/cupon/:id
- [x] Verificar que el endpoint devuelve la imagen real del cupón en og:image

## Gestión de Servicios - Mar 24 2026
- [ ] Corregir "Vacunterapia" → "Vacuumterapia" en ServicesSection
- [ ] Agregar tabla `services` en la BD con campos: nombre, descripción, categoría, precio, imagen
- [ ] Migrar servicios estáticos a la BD (seed inicial)
- [ ] Procedimientos tRPC: services.list, services.create, services.update, services.delete
- [ ] Admin: tab "Servicios" con tabla, botón agregar, editar, eliminar y subir imagen
- [ ] Frontend ServicesSection: leer servicios desde la BD en lugar de datos estáticos

## Gestión Servicios + OG Image Cupón - Mar 24 2026
- [ ] Corregir "Vacunterapia" → "Vacuumterapia" en ServicesSection
- [ ] Tabla `services` en BD: nombre, descripción, categoría, precio, imageUrl, isActive
- [ ] Seed inicial de los 27 servicios en la BD
- [ ] tRPC: services.list, services.create, services.update, services.delete
- [ ] Admin: tab "Servicios" con tabla, agregar/editar/eliminar, subir imagen
- [ ] ServicesSection: leer desde BD en lugar de datos estáticos
- [ ] OG Image: generar imagen del cupón completo con canvas/sharp en el servidor
- [ ] Usar imagen generada como og:image en el endpoint /cupon/:id

## Correcciones Sesión Actual - Servicios y Cupón WhatsApp

- [x] Corregir tipografía "Vacunterapia" → "Vacuumterapia" en ServicesSection
- [x] Crear tabla `services` en la base de datos (schema + migración)
- [x] Agregar procedimientos tRPC: services.listAll, services.create, services.update, services.delete
- [x] Agregar tab "Servicios" en AdminDashboard con formulario crear/editar y tabla editable
- [x] Instalar @resvg/resvg-js para generación de imágenes PNG desde SVG en el servidor
- [x] Crear módulo couponImageGenerator.ts que genera imagen 1200x630 del cupón en SVG/PNG
- [x] Agregar endpoint GET /api/og/cupon-image/:id que devuelve PNG del cupón
- [x] Actualizar buildCouponOGPage para usar la imagen PNG generada como og:image
- [x] Meta tags OG actualizados: og:image apunta a /api/og/cupon-image/:id (PNG 1200x630)

## Sesión Mar 24 - Catálogo y Tienda de Productos

- [ ] ServicesSection lee servicios desde BD (no array estático)
- [ ] Tabla `products` en schema con migración
- [ ] CRUD de productos en server/db.ts y server/routers.ts
- [ ] Tab Productos en AdminDashboard (crear/editar/eliminar/imagen)
- [ ] Sección pública Tienda de Productos (página /tienda)
- [ ] Botón "Tienda de Productos" en la página principal

## Sesión Mar 24 - Catálogo Servicios BD + Tienda de Productos

- [x] Conectar catálogo de servicios a la BD (ServicesSection lee desde trpc.services.list)
- [x] Insertar 26 servicios del catálogo estático en la tabla services de la BD
- [x] Crear tabla products en la BD con schema Drizzle
- [x] Crear tabla productPurchases en la BD con schema Drizzle
- [x] Agregar funciones CRUD de productos y compras en db.ts
- [x] Agregar routers tRPC: products.list, products.create, products.update, products.delete, products.uploadImage
- [x] Agregar routers tRPC: productPurchases.create, productPurchases.listAll, productPurchases.verify, productPurchases.reject, productPurchases.delete
- [x] Tab Productos en AdminDashboard con CRUD completo e imagen
- [x] Tab Compras de Productos en AdminDashboard con aprobar/rechazar
- [x] Página pública /tienda con catálogo de productos y modal de compra
- [x] Botón "Tienda de Productos" en el Hero de la página principal
- [x] Texto "Cuponera de Descuentos" en lugar de "Cuponera de Promociones"
- [x] Reorganizar tabs del AdminDashboard para que no se amonten en móvil
- [ ] Bug crítico: ruta /cupon/:id devuelve 404 en producción al acceder desde WhatsApp

## Correcciones Sesión Actual - Deep Link Cupones WhatsApp

- [x] Crear página dedicada /cupon/:id en React que muestre el cupón directamente
- [ ] Actualizar redirect del servidor para apuntar a /cupon/:id en lugar de /#cupon-:id
- [x] Verificar que la imagen OG aparece en el preview de WhatsApp

## Correcciones Imagen OG WhatsApp - Mar 25 2026

- [x] Corregir imagen OG en blanco — activar loadSystemFonts en resvg y usar fuentes Noto disponibles en servidor
- [x] Descargar imagen del cupón como base64 para incluirla en el SVG (resvg no carga URLs externas HTTP)
- [x] Panel derecho de imagen OG ahora muestra la foto real del tratamiento con overlay de marca

## Sistema de Códigos de Descuento General - Mar 25 2026

- [ ] Crear tabla `discountCodes` en drizzle/schema.ts (código, porcentaje, isActive, isGift)
- [ ] Migrar schema con pnpm db:push
- [ ] Seed de los 6 códigos predefinidos: Nutriser10(10%), Nutriser15(15%), Nutriser20(20%), Nutriser25(25%), Nutriser30(30%), Nutriserfree(100%)
- [ ] Procedimientos tRPC: discountCodes.validate, discountCodes.list, discountCodes.toggle
- [ ] Agregar campo de código de descuento en formulario de compra de programas de nutrición
- [ ] Agregar campo de código de descuento en formulario de compra de productos
- [ ] Agregar campo de código de descuento en formulario de servicios (si aplica)
- [ ] Mostrar precio final con descuento aplicado en tiempo real
- [ ] Tab "Códigos de Descuento" en AdminDashboard para activar/desactivar códigos
- [ ] Guardar código usado en cada compra (membresías y productos)
- [ ] Agregar botón visible "Ver Catálogo de Servicios" en la página principal (Hero o sección dedicada)

## Bug: Admin Servicios - Edición y Foto - Mar 25 2026

- [ ] Corregir tab Servicios en AdminDashboard: el botón Editar no abre el formulario de edición
- [ ] Corregir subida de foto en el formulario de servicios (crear y editar)


## Bug: Carga de Imágenes en Servicios y Productos
- [x] Diagnosticar por qué no se cargan imágenes en catálogo de servicios
- [x] Corregir handleServiceImageChange para subir a S3 correctamente
- [x] Corregir handleProductImageChange para subir a S3 correctamente
- [x] Verificar que funcione igual que en tienda de eBook

## Sistema de Códigos de Promoción (Sesión Mar 25)
- [x] Actualizar tabla discountCodes con los 7 códigos correctos (Nutriser10/15/20/25/30, Nutriserfree, Nutriser2x1)
- [x] Agregar tipo "2x1" en la lógica de descuentos
- [x] Agregar campo de código de descuento en formulario de compra de servicios
- [x] Verificar campo de código en formulario de compra de productos
- [x] Verificar campo de código en formulario de compra de programas de nutrición
- [x] Agregar tab "Códigos de Descuento" en panel admin para activar/desactivar
- [x] Mostrar descuento aplicado visualmente en el formulario de compra

## Corrección Formularios de Pago - Mar 25 2026
- [x] Eliminar campo "Titular: Nutriser" de todos los formularios de pago
- [x] Dejar solo el concepto con nombre del cliente y servicio/producto adquirido

## Corrección Formulario Cupones - Mar 25 2026
- [x] Hacer teléfono obligatorio en formulario de adquirir cupón

## Sección Cursos Gratuitos - Mar 25 2026
- [ ] Crear tablas BD: courses, courseVideos, courseDocuments, courseComments, courseSubscribers
- [ ] Procedimientos tRPC: listar cursos, videos, documentos, comentarios, suscripción push/email
- [ ] Página pública /cursos con lista de videos y reproductor (solo visualización, sin descarga)
- [ ] Reproductor de video en alta calidad (hasta 4K) con controles básicos
- [ ] Sección de documentos descargables por video
- [ ] Foro de comentarios por video con moderación del admin
- [ ] Botón de suscripción a notificaciones push en página de cursos
- [ ] Notificación por correo cuando se sube nuevo curso
- [ ] Panel admin: subir/editar/eliminar cursos y videos
- [ ] Panel admin: subir/eliminar documentos por video
- [ ] Panel admin: moderar y aprobar/rechazar comentarios
- [ ] Agregar enlace a Cursos en la navegación principal

## Mejora Visual Página Principal - Mar 25 2026
- [ ] Mejorar el hero con imagen más profesional y tipografía más impactante
- [ ] Actualizar sección de servicios con mejor presentación visual
- [ ] Agregar sección de testimonios o estadísticas de impacto

## Sesión Mar 25 2026 - Continuación
- [x] HeroSection: carrusel automático de 4 imágenes de clínica con transición suave
- [x] HeroSection: botón 'Cursos Nutriser' agregado al grid de botones
- [x] Cursos: push notifications integradas en modal de suscripción (checkbox + solicitud de permiso)
- [x] Corregir test discountCodes.test.ts para usar funciones correctas (validateDiscountCode)

## Correcciones Sesión Mar 25 - Formularios y Cursos
- [x] Formulario servicios: mostrar precio original tachado + precio con descuento aplicado
- [x] Formulario programas nutrición: agregar campo de cupón igual que servicios, sin leyenda genérica
- [x] Formulario productos: mostrar precio original tachado + precio con descuento
- [x] Página Cursos: quitar 'Gratuitos', cambiar a 'Nutriser Academy' con texto de suscripción
- [x] Hero: corregir hueco visual (botón Cursos Nutriser col-span-2)

## Sesión Mar 25 - Correcciones urgentes
- [x] Agregar botón de regreso en la página de Cursos
- [x] Panel admin Cursos: agregar subida de videos por curso (UI mejorada con selector visual)
- [x] Panel admin Cursos: agregar subida de documentos por video (UI mejorada)
- [x] Corregir endpoint /api/upload para aceptar videos y documentos con extensión correcta (500MB)

## Sesión Mar 25 - Correcciones críticas
- [x] Panel admin Cursos: corregido getAllCourses para incluir videos y documentos de cada curso
- [x] Códigos de descuento activados en BD (Nutriser10 al Nutriser30, free, 2x1 todos activos)
- [x] Tests actualizados para reflejar estado real de la BD (37/37 pasando)

## Sesión Mar 25 - Códigos de descuento universales
- [x] Corregido: Memberships.tsx usa utils.discountCodes.validate.fetch() en lugar de useQuery+refetch
- [x] Corregido: ServicesSection.tsx usa utils.discountCodes.validate.fetch() en lugar de useQuery+refetch
- [x] Corregido: Store.tsx usa utils.discountCodes.validate.fetch() en lugar de useQuery+refetch
- [x] Los 3 formularios ahora validan el código correctamente sin problemas de caché

## Sesión Mar 25 - Códigos case-insensitive
- [x] Corregido validateDiscountCode en db.ts: usa UPPER() en SQL para comparación case-insensitive
- [x] Todos los códigos activados en BD de producción (Nutriser10, 15, 20, 25, 30, free, 2x1)

## Sesión Mar 25 - Limpieza y Cursos
- [ ] Eliminar todas las membresías de prueba de la BD (Test User, María García, Juan Pérez)
- [ ] Rediseñar panel admin Cursos: subida de videos y documentos visible e inmediata

## Sesión Mar 25 - Error subida videos
- [ ] Corregir error al subir videos en /api/upload (error en producción)
- [ ] Agregar sección de material de apoyo (PDF/Word) visible desde el mismo formulario del video

## Correcciones de Flujo de Membresías (Mar 25)
- [ ] Limpiar datos de prueba (@example.com) de la BD de producción
- [ ] Rediseñar flujo: NO crear membresía hasta que se suba el comprobante
- [ ] Agregar campo accessCode a la tabla memberships para código único
- [ ] Al aprobar membresía: generar código único automáticamente y enviarlo por correo
- [ ] Rediseñar frontend: flujo de 3 pasos (datos → datos bancarios → subir comprobante)
- [ ] Enviar solo UNA notificación al admin por membresía (al subir comprobante)
- [ ] Eliminar notificaciones duplicadas del flujo actual

## Correcciones Sesión Actual - Videos

- [x] Agregar botón "Eliminar video" en panel admin de cursos
- [x] Agregar procedimiento tRPC deleteCourseVideo en backend

## Mejoras UX - Sesión Actual

- [x] Pre-llenar correo del admin en la página de login (solo ingresar contraseña)
- [x] Agregar botón "Copiar" para la CLABE interbancaria en la página de membresías
- [x] Sistema de recuperación de contraseña por correo (link de restablecimiento)
- [x] Página de restablecer contraseña con token seguro
- [x] Botón "¿Olvidaste tu contraseña?" en login del admin
- [x] Mostrar código único de acceso en cada membresía del panel admin
- [x] Implementar subida de videos en chunks para evitar error 413 del proxy
- [x] Música de fondo bossa nova en página principal con autoplay

## Correcciones Sesión - Botón de Música

- [x] Mover botón de música a esquina inferior izquierda para que no choque con botón de WhatsApp (esquina inferior derecha)
- [x] El botón ahora es visible en todas las páginas incluyendo el inicio

## Notificaciones Push - Botón de Prueba en Admin

- [x] Agregar botón "Enviar notificación de prueba" en el panel admin
- [x] Crear procedimiento tRPC para enviar push de prueba a todos los suscriptores
- [x] Mostrar feedback visual (éxito/error) al enviar la notificación

## Push Admin - Lista activa y selector de emojis

- [ ] Agregar procedimiento tRPC para listar suscripciones push con tipo de dispositivo y fecha
- [ ] Mostrar lista de suscripciones push activas en el panel admin con botón eliminar
- [ ] Agregar selector de emojis para personalizar título y cuerpo de la notificación

## Push - Vincular con email de suscriptor

- [ ] Agregar campo email (nullable) a la tabla pushSubscriptions
- [ ] Actualizar procedimiento push.subscribe para aceptar email opcional
- [ ] Actualizar frontend para enviar email al suscribirse a push
- [ ] Mostrar personas únicas en el contador del panel admin
- [ ] Mostrar lista agrupada por persona con sus dispositivos

## Hero Rediseño - Portal de Salud destacado

- [x] Rediseñar hero para que el Portal de Salud sea el elemento más destacado
- [x] Agregar sección explicativa con funciones del portal (seguimiento, dietas, historial, citas)
- [x] Agregar CTA de "Crear cuenta" prominente en el portal
- [x] Mantener los demás botones en segundo plano visual

## Hero - Correcciones Portal de Salud

- [x] Corregir URL del botón "Crear cuenta" (apuntar a portaldesaludnutriser.club directamente)
- [x] Agregar animación de pulso en el ícono HeartPulse del Portal de Salud

## Hero - Botón Valoración General

- [ ] Cambiar texto del botón "Agenda tu Cita" del hero a "Agenda una Valoración General"
- [ ] Hacer que el formulario abra con "Valoración General" preseleccionado via query param

## Servicios - Botón Agendar Cita por servicio

- [x] Agregar botón "Agendar Cita" en cada tarjeta de ServicesSection
- [x] Al presionar, abrir formulario con el servicio de esa tarjeta preseleccionado

## Hero - Botón Crear Cuenta
- [ ] Encontrar URL del portal que abre directamente en pestaña Crear Cuenta
- [ ] Actualizar botón "Crear Cuenta" en HeroSection con la URL correcta

## Hero - Botón Portal Genérico
- [x] Unificar "Iniciar Sesión" y "Crear Cuenta" en un solo botón genérico

## Splash Selector - Pantalla de Bienvenida
- [x] Crear componente SplashSelector con logo, título y dos tarjetas visuales
- [x] Tarjeta 1: Nutriser Aesthetic & Nutrition (página principal)
- [x] Tarjeta 2: Portal de Salud Nutriser (portal externo)
- [x] Integrar en App.tsx para que aparezca al entrar por primera vez
- [x] Recordar elección del usuario en sessionStorage para no mostrar en cada recarga

## Hero + Splash - Ajustes
- [ ] Quitar tarjeta Portal de Salud del HeroSection (ya está en el splash)
- [ ] Cambiar splash de sessionStorage a localStorage con expiración de 24h

## Cambios Sesión Actual

- [x] Cambiar botón "Agenda tu Cita" en AboutSection por "Catálogo de Servicios" con scroll a sección #servicios
- [x] Cambiar botón "Ver Servicios" en HeroSection por "Catálogo de Servicios"
- [x] Agregar mensaje informativo en formulario de citas explicando que deben seleccionar el servicio deseado
- [ ] Agregar botón de ubicación en HeroSection que abra Google Maps con la dirección de Nutriser
- [x] Agregar botón de ubicación en HeroSection que abra Google Maps con la dirección de Nutriser
- [x] Cambiar botón "Precio" en tarjetas de servicios por "Preguntar precio"
- [x] Corregir modal de comprobantes en admin: estado de carga infinito y caché de query anterior
- [x] Mejorar validación en formulario de membresías con mensajes de error específicos por campo
- [x] Mostrar precio con descuento y código de cupón en el correo de notificación de nueva membresía
- [x] Asegurar que todos los correos se envíen solo desde clinicanutriserpv@gmail.com sin referencias a Manus
- [x] Agregar botón "Compartir" en pantalla Hub que copie el link nutriserpv.com al portapapeles
- [x] Rediseñar botón de notificaciones push en SplashSelector: grande, con brillo animado y texto llamativo de descuentos
- [x] Convertir botón de campana push en círculo flotante solo con ícono, igual al botón de WhatsApp
- [x] Mejorar texto del botón de correo en SplashSelector: más llamativo sobre exclusivas promociones
- [x] Agregar etiqueta explicativa junto al botón de campana: "¡Toca la campanita y recibe promociones exclusivas solo para ti!"
- [x] Cambiar texto botón correo a "Suscríbete a nuestra Cuponera de Descuentos Nutriser"
- [x] Agregar íconos circulares de Instagram y Facebook junto a campana y WhatsApp en SplashSelector
- [x] Cambiar texto pie de SplashSelector a "Todos los derechos reservados © Nutriserpv"
- [x] Corregir diseño responsivo para celulares, tablets y PC en toda la aplicación

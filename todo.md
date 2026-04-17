# Nutriser - Tareas Completadas

## Sesión 17 - Correcciones de Cashback y UI
- [x] Corregir búsqueda de email en getPatientByEmail para ser insensible a mayúsculas (LOWER() SQL)
- [x] Agregar endpoint retryCashback para acreditar cashback manualmente a compras ya aprobadas
- [x] Agregar botón "💰 Cashback" en panel admin para compras aprobadas sin cashback
- [x] Corregir nombre duplicado en Mis Compras: "1x 1x Paquete Nutrición" → "Paquete Nutrición"
- [x] Corregir precio duplicado en Mis Compras: "$$2,500 MXN MXN" → "$2,500 MXN"
- [x] Corregir formato de serviceName al guardar: qty=1 no agrega prefijo "1x"
- [x] Verificar que MyTreatments.tsx compila sin errores (error de Vite era caché de sesión anterior)

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
- [x] Corrección profunda de responsividad en SplashSelector: viewport, overflow y layout adaptativo
- [x] Corregir desbordamiento horizontal en Samsung Fold: overflow-x hidden global y ancho adaptativo
- [ ] Rediseñar SplashSelector estilo widget iOS: grid compacto, tarjetas visuales sin chips ni texto largo

## Rediseño Hub (SplashSelector) - Sesión actual

- [x] Rediseñar SplashSelector con estilo widget iOS: fondo oscuro, tarjetas con imagen, ícono, título corto
- [x] Eliminar chips y descripciones largas de las tarjetas
- [x] WidgetLarge (2:1) para Nutriser y Portal de Salud
- [x] WidgetSquare (1:1) para Membresía, Tienda, eBook y Academy
- [x] Barra de acciones rápidas: Cuponera (email), Campana push, WhatsApp
- [x] Íconos sociales: Instagram, Facebook, TikTok
- [x] Fondo degradado oscuro tipo app nativa
- [x] Mantener toda la funcionalidad: push, email, modal de notificaciones, compartir

## Correcciones Sesión Actual

- [x] Error 1: Botón "Ver todas las promociones" en CouponPage ahora navega correctamente a la cuponera usando sessionStorage scroll
- [x] Error 2: Imagen Open Graph del cupón para WhatsApp ahora usa imageUrl de la BD si está disponible, con fallback a imagen generada dinámicamente
- [x] Error WhatsApp: Botones "Recomendar por WhatsApp" en EbookStore y PromotionsSection corregidos de window.open/target="_blank" a window.location.href para compatibilidad con WebView iOS
- [x] Cambiar "Programas Nutrición" a "Programas Nutriser" en el splash
- [x] Agregar Paquete Tratamiento ($5,499 MXN) gestionable desde admin: 4 cavitaciones + 4 radiofrecuencias + 4 mesoterapias reductoras

## Correcciones Sesión Academy - Textos y Comentarios

- [x] Quitar "nutrición" de descripción de Nutriser Academy, generalizar a "salud y estética"
- [x] Quitar "nutrición" del Foro de Sugerencias, generalizar a "salud y estética"
- [x] Sugerencias de temas: mostrar como posts/comentarios visibles tras aprobación del admin
- [x] Moderación de sugerencias: admin aprueba antes de que aparezcan públicamente, puede eliminar
- [x] Comentarios en videos: cada video puede recibir comentarios
- [x] Comentarios en videos: filtro de contenido inapropiado (groserías, contenido sexual)
- [x] Comentarios en videos: aprobación del admin antes de publicarse
- [x] Panel admin: pestaña de moderación de comentarios de videos (aprobar/rechazar/eliminar)

## Módulo Mis Tratamientos + Fix Foro Expertos

- [x] Fix: Foro Expertos admin — "Marcar publicado" no debe eliminar, agregar botón Eliminar separado
- [x] BD: tablas patient_accounts, patient_treatments, patient_appointments
- [x] Backend: registro/login de pacientes (email + contraseña), CRUD tratamientos y citas por admin
- [x] Portal paciente: página Mis Tratamientos con estados (pendiente/tomado/finalizado), citas, cupones y catálogo
- [x] Splash: botón "Mis Tratamientos" pequeño
- [x] Admin: pestaña para gestionar pacientes y asignar tratamientos/citas

## Módulo Mis Tratamientos (Detalle Completo)

- [x] Fix: getApprovedSuggestions incluir status "published" para que no desaparezcan
- [x] Fix: Foro Expertos admin — botón Eliminar separado y visible siempre
- [x] BD: tabla patient_accounts (nombre, correo, hash contraseña, teléfono, fecha nacimiento, reset token)
- [x] BD: tabla patient_treatments (paciente, servicio nombre, estado: pendiente/tomado/finalizado, notas)
- [x] BD: tabla patient_appointments (paciente, tratamiento, fecha, hora, notas)
- [x] Backend: registro paciente (nombre, correo, contraseña, teléfono, cumpleaños)
- [x] Backend: login paciente con JWT cookie
- [x] Backend: recuperación de contraseña por email (clinicanutriserpv@gmail.com)
- [x] Backend: CRUD tratamientos por admin (asignar, cambiar estado, eliminar)
- [x] Backend: CRUD citas por admin (crear, editar, eliminar)
- [x] Backend: enviar notificaciones email + push a todos los pacientes desde admin
- [x] Portal paciente: página Mis Tratamientos (tratamientos con estados, citas, cupones, catálogo)
- [x] Portal paciente: suscripción push desde la página
- [x] Splash: botón pequeño "Mis Tratamientos"
- [x] Admin: pestaña "Pacientes" con lista, detalle, asignar tratamientos/citas, notificaciones
- [x] BD: tabla patient_photos (fotos antes/después por paciente y tratamiento, con fecha)
- [x] BD: campo consentAcceptedAt en patientAccounts (fecha de aceptación del contrato)
- [x] Contrato de confidencialidad: el paciente debe aceptar al registrarse (queda registrado)
- [x] Admin: subir fotos antes/después vinculadas al paciente y tratamiento
- [x] Portal paciente: galería de fotos antes/después ordenadas por fecha y tratamiento

## Automatizaciones Pacientes

- [x] Job recordatorio de citas: enviar email 24h antes de la cita al paciente desde clinicanutriserpv@gmail.com
- [x] Job cumpleaños: detectar pacientes con cumpleaños hoy y enviarles email con cupón de descuento especial
- [x] Registrar ambos jobs como cron en el servidor (se ejecutan diariamente)

## Correcciones Mis Tratamientos

- [ ] Fix: Error SQL al crear cuenta de paciente (Failed query on INSERT)
- [ ] Fix: Campo fecha de cumpleaños aparece en blanco (problema de contraste)
- [x] Migración BD: crear tablas patientAccounts, patientTreatments, patientAppointments, patientPhotos
- [x] Fix: campo fecha cumpleaños invisible (blanco)
- [x] Fix: "Volver al inicio" debe redirigir al splash (/)
- [x] Fix: descripción del botón Mis Tratamientos en splash más descriptiva
- [x] Consentimiento: nombre del paciente pre-llenado en el documento (tomado del registro)
- [x] Consentimiento: firma digital con canvas (dibujo con dedo/mouse), no solo texto

## Correcciones Sesión Actual

- [x] Corregir bug firma consentimiento: canvas más grande, servidor genera PDF con pdfkit
- [x] Agregar botón eliminar paciente en panel admin (Gestión de Pacientes)

## Rediseño Tienda Ebook - Sesión Actual
- [x] Reducir imagen de portada del ebook a tamaño pequeño estilo Amazon (layout 2 columnas)
- [x] Eliminar módulo "Códigos Extra" (compartir con 5 personas / CUPONEXTRA5) del proyecto
- [x] Agregar botón "Editar" en Antes/Después del admin para modificar nombre, descripción y categoría
- [x] Reposicionar etiqueta verde de ahorro en paquetes para que no tape el nombre
- [x] Mejorar cupones en Mis Tratamientos: fecha límite, contador vendidos y botón "Lo quiero comprar"
- [x] Corregir error PromoCountdown en cupones de MyTreatments
- [x] Agregar iconitos de funciones en recuadro Portal de Salud (pantalla principal)
- [x] Corregir Portal de Salud en iPad: botón "Acceder/Crear Cuenta" no se ve por falta de espacio
- [x] Cambiar etiqueta "Calorías" por "Monitor Cal." con icono en Portal de Salud

## Gestión de Múltiples eBooks - Sesión Actual

- [x] Agregar lista de todos los eBooks en el tab de eBook del panel admin
- [x] Agregar botón "Nuevo eBook" para crear eBooks adicionales
- [x] Agregar botón "Activar" para marcar qué eBook aparece en la tienda
- [x] Agregar botón "Editar" (lápiz) para cada eBook en la lista
- [x] Mostrar badge "Activo" en el eBook actualmente publicado en tienda
- [x] Formulario de eBook ahora es condicional (solo visible al crear/editar)
- [x] Estado editingEbookId para distinguir entre crear nuevo y editar existente
- [x] Tests unitarios para ebook.listAll y ebook.setActive

## Mejoras Responsive Desktop/Tablet - Sesión Actual

- [x] Limitar ancho máximo del SplashSelector en desktop (max ~480px centrado)
- [x] Limitar ancho máximo del NutriserHomePage en desktop (max ~480px centrado)
- [x] Contenido centrado con fondo oscuro a los lados en desktop/tablet
- [x] Eliminar escalado excesivo en md/lg breakpoints

## Fix Dynamic Island / Safe Area
- [x] Agregar safe-area-inset-top al logo del SplashSelector para que no quede tapado por el Dynamic Island

## Botón Admin en Splash 1
- [x] Agregar botón de acceso al panel de administración en el Splash 1 igual al del Splash 2

## Mover botón Compartir
- [x] Quitar botón Compartir del header del Splash 1 y ponerlo junto al botón Administración al final

## Reordenar Widgets Splash 1
- [x] Poner Mis Tratamientos y Agendar Cita antes de Cuponera, Campana y Servicios

## Quitar botón Regresar del AdminLogin
- [x] Eliminar el botón Regresar de la página de login del panel de administración

## Botón Regresar condicional en AdminLogin
- [x] Mostrar Regresar en AdminLogin solo si el usuario viene del Splash 2 (/nutriser-home)

## Fix botón ACCEDER/CREAR CUENTA
- [x] Corregir el botón ACCEDER/CREAR CUENTA del widget Portal de Salud que se ve cortado

## Fix botón Servicios Splash 1
- [x] Corregir enlace del botón Servicios para ir directo a la sección de servicios del sitio web

## Reorganizar íconos Portal de Salud
- [x] Cambiar íconos del widget Portal de Salud de fila horizontal a grid 4×2 alineado

## Renombrar widgets Splash 1
- [x] Cambiar "Nutriser Home" → "Nutriser Mall" (tienda/shop)
- [x] Cambiar "Nutriser Web" → "Nutriser Home"
- [x] Intercambiar posiciones: Nutriser Home a la izquierda, Nutriser Mall a la derecha

## Fix Paquete Reductor
- [x] Corregir precio de referencia y agregar badge verde de ahorro al Paquete Reductor

## Cambios Sesión Actual

- [x] Cambiar título del Splash 2 de "Nutriser Home" a "Nutriser Mall"
- [x] Cambiar etiqueta "NUTRICIÓN" del widget de paquetes a "SHOP"

## Toggle Modo Claro/Oscuro

- [x] Crear contexto global SplashThemeContext para persistir preferencia de tema
- [x] Agregar botón toggle (palanca) en Splash 1 (SplashSelector)
- [x] Agregar botón toggle (palanca) en Splash 2 (NutriserHomePage)
- [x] Aplicar fondo crema y textos oscuros en modo claro para Splash 1
- [x] Aplicar fondo crema y textos oscuros en modo claro para Splash 2

## Corrección Modo Claro - Contraste

- [x] Mejorar overlays sobre fotos en modo claro (más oscuros para que se vean imágenes y texto)
- [x] Aumentar contraste de textos en modo claro (títulos, etiquetas, botones)
- [x] Mejorar visibilidad de botones CTA en modo claro

## Detección Automática de Horario (Modo Claro/Oscuro)

- [x] Actualizar SplashThemeContext para detectar hora del dispositivo (6am-7pm = claro, 7pm-6am = oscuro)
- [x] Permitir override manual con el toggle (guarda preferencia en localStorage)
- [x] Actualizar toggle para mostrar si está en modo automático o manual

## Toggle Discreto al Pie de Página

- [x] Mover toggle de modo claro/oscuro del header al pie de página (esquina inferior discreta) en Splash 1 y Splash 2

## Header Horizontal Splash 1

- [x] Rediseñar header de Splash 1: logo al lado del texto en fila horizontal compacta para que todo quepa en una pantalla

## Reorganización Barra Acciones Splash 1

- [x] Mover botón campana al header (al lado del texto "Soy Nutriser y Vivo Mejor")
- [x] Dejar barra de acciones rápidas solo con Cuponera y Servicios (quitar campana de ahí)
- [x] Rediseñar header de Splash 2 (NutriserHomePage): logo al lado del texto en fila horizontal compacta

## Toggle Solo en Splash 1

- [ ] Quitar ThemeToggle del footer de Splash 2 (NutriserHomePage) — solo cambia automáticamente por horario

## Mejoras Modo Claro Splash 1

- [x] Quitar ThemeToggle del footer de Splash 2 (solo cambia por horario automático)
- [x] Header Splash 1 modo claro: agregar fondo sutil detrás del logo+texto para que resalte sobre el crema
- [x] Textos "Aesthetic & Nutrition" y "Soy Nutriser y Vivo Mejor" más oscuros/definidos en modo claro
- [x] Botones Cuponera y Servicios más visibles y elegantes en modo claro

## Contraste Modo Claro Splash 2

- [x] Header Splash 2 modo claro: fondo oscuro cálido detrás del logo+texto igual que Splash 1
- [x] Botones y textos del Splash 2 con mejor contraste en modo claro

## Limpieza Splash 2

- [x] Quitar botones Cuponera y Catálogo de Servicios del Splash 2 (ya están en Splash 1)

## Corrección Paquete Nutrición

- [x] Cambiar "10% de descuento en tratamientos faciales" por "10% de descuento en tratamientos corporales" en Paquete Nutrición

## Corrección Paquete Reductor

- [x] Quitar "10% de descuento en compra de eBook" del Paquete Reductor Nutriser

## Foro Academia - Suscripción Obligatoria

- [x] Hacer campo "Nombre" obligatorio en el formulario del foro
- [x] Agregar campo "Correo electrónico" obligatorio en el formulario del foro
- [x] Al enviar sugerencia, suscribir automáticamente el correo al canal de la comunidad
- [x] Unificar lógica: suscribirse = poder comentar en el foro

## Textos Suscripción Academia

- [x] Actualizar textos de suscripción en Academia: agregar que suscribirse permite pertenecer a la comunidad y participar en el foro

## Suscripción Academia - Mejoras

- [x] Actualizar textos de suscripción para mencionar comunidad y foro
- [x] Agregar campo nombre en el modal de suscripción
- [x] Guardar nombre y email en localStorage al suscribirse para autocompletar el foro
- [x] Si ya está suscrito, el foro no pide nombre ni correo (campos ocultos y prellenados)

## Botón Inicio Más Visible

- [x] Agrandar botón "INICIO" en todas las páginas internas para que sea más visible y fácil de encontrar

## Corrección Botón Correo - Eliminar Cuenta

- [x] Corregir botón de correo en página "Eliminar cuenta" para que abra app de correo con mailto: y asunto prellenado

## Bug: Botón de correo en Eliminar Cuenta no abre app de correo en iPhone

- [x] Cambiar el enlace mailto: en DeleteAccount.tsx para que funcione en iPhone — quitar target="_blank" y usar window.location.href en onClick

## Bug: Mapa de Google al fondo de la página principal abre URL de embed con error

- [x] Corregir iframe de Google Maps en ContactSection.tsx: mostrar preview del mapa pero con overlay de tap-to-open — al tocar el mapa debe abrir Google Maps, no navegar a la URL de embed

## Panel Admin: Botón Regresar → Splash 1

- [x] Cambiar botón "← Regresar" en AdminDashboard para que lleve al Splash 1 (limpiar sessionStorage y redirigir a /)
- [x] Quitar el botón/texto "Inicio" que aparece junto al botón Regresar

## Panel Admin: Safe Area iPhone

- [x] Agregar padding-top con env(safe-area-inset-top) en AdminDashboard para que el botón Regresar no quede sobre el reloj del iPhone

## Splash 0: Pantalla de entrada con dos opciones

- [x] Crear componente Splash0Entry con dos tarjetas igual al diseño del Splash 1: "Nutriser Web" (→ Splash 1) y "Portal Salud" (→ portaldesaludnutriser.club, misma tarjeta que en Splash 1)
- [x] Conectar Splash0Entry como primera pantalla en App.tsx
- [x] Cambiar texto "Nutriser Home" por "Nutriser Web" en la tarjeta del Splash 1
- [x] Al regresar desde Splash 1, volver al Splash 0

## Splash 1: Quitar Portal de Salud

- [x] Eliminar la tarjeta "Portal de Salud Nutriser" del Splash 1 (SplashSelector.tsx) ya que ahora está en el Splash 0

## Splash 0: Modo día/noche automático

- [ ] Agregar lógica de color automático día/noche en Splash0Entry.tsx igual que en SplashSelector (fondo claro de día, oscuro de noche)

## Splash 1: Botón Regresar + Redes Sociales en Splash 0

- [x] Agregar botón "← Regresar" en Splash 1 (SplashSelector) que lleve al Splash 0
- [x] Copiar los íconos de redes sociales del Splash 1 al Splash 0 (Splash0Entry)
- [x] Quitar los íconos de redes sociales del Splash 1 (ya estarán en Splash 0)

## Navbar: Botón Regresar al Splash 1

- [x] Agregar botón "← Regresar" en la Navbar del sitio principal que lleve al Splash 1 (usando SplashContext)

## Navbar: Dos botones — INICIO (Splash 0) y Regresar (Splash 1)

- [x] Agregar botón "INICIO" en Navbar que lleve al Splash 0 (showSplash)
- [x] Mantener botón "← Regresar" en Navbar que lleve al Splash 1 (showSplash1)

## Splash 0: Imagen Nutriser Home y quitar Puerto Vallarta

- [x] Quitar texto "Puerto Vallarta" del pie de página en Splash0Entry
- [x] Reemplazar imagen de tarjeta Nutriser Home (iMac) por imagen de clínica/interior de Nutriser

## Splash 2: Imagen Nutriser Mall

- [x] Reemplazar imagen de la tarjeta "Nutriser Mall" en NutriserHomePage por una imagen de tienda/productos de Nutriser

## Splash 1: Nueva imagen Nutriser Mall (hub completo)

- [x] Generar imagen que represente tratamientos + libros + cursos + productos para la tarjeta Nutriser Mall en SplashSelector

## Responsividad Desktop/Tablet/Móvil

- [x] Splash 0 (Splash0Entry): ampliar max-w en desktop, tarjetas en grid 2 columnas en pantallas grandes
- [x] Splash 1 (SplashSelector): ampliar max-w en desktop, tarjetas en grid 2 columnas en pantallas grandes
- [x] NutriserHomePage (Nutriser Mall): ampliar max-w y grid responsivo para desktop
- [ ] PaquetesPage: ampliar max-w, cards de paquetes en grid 2-3 columnas en desktop
- [ ] Revisar otras páginas internas (Servicios, Cursos, eBooks, etc.) para responsividad desktop

## Corrección Responsividad Desktop (Round 2)

- [ ] NutriserHomePage: quitar lg:hidden de la segunda fila para que las 4 tarjetas aparezcan en desktop en una sola fila de 4 columnas
- [ ] Splash 1 (SplashSelector): corregir proporciones de tarjetas grandes en desktop (no deben ser cuadradas gigantes)
- [ ] Splash 0 (Splash0Entry): igualar altura de las dos tarjetas en desktop

## Rediseño Portal Paciente - Sesión Actual

- [ ] Backend: endpoint getMyPurchases(email) que retorna servicios+cupones+paquetes del paciente automáticamente
- [ ] Portal paciente: reemplazar tabs Mis Servicios/Cupones/Paquetes con un solo tab "Mis Compras" automático
- [ ] Portal paciente: tab "Seguimiento" con sesiones (dadas, perdidas, vencidas) actualizado por admin
- [ ] Admin: en panel de pacientes, poder marcar sesiones de tratamiento como dada/perdida/vencida
- [ ] Quitar formularios de código de verificación del portal del paciente

## Correcciones Sesión Actual - Contraste y Correos

- [x] Mejorar contraste de botones "Para mí" / "Para regalar" en modal de cupones (texto muy claro sobre fondo blanco)
- [x] Corregir plantillas de correo de cupones para que se vean nombres y detalles correctamente
- [x] Corregir plantillas de correo de paquetes para que se vea todo el texto correctamente

## Sistema de Cuenta Unificada - Sesión Actual
- [x] Corregir botón "Regresar" en todas las páginas internas para que vaya al Splash 1 (no Splash 0)
- [x] Habilitar compra del libro en pre-compra (quitar bloqueo "Próximamente disponible")
- [x] Extender schema DB: tabla shopCartItems para carrito persistente
- [x] Crear procedimientos tRPC: cart.getItems, cart.addItem, cart.updateItem, cart.removeItem, cart.clear
- [x] Crear hook usePatientAuth: maneja sesión unificada (localStorage), expone patient/login/logout/register
- [x] Nutriser Shop: mostrar modal de login/registro antes de agregar al carrito o comprar
- [x] Nutriser Shop: mostrar "Bienvenido, [Nombre]" y botón cerrar sesión cuando está logueado
- [ ] Nutriser Shop: carrito persistente en DB (sincronizar con cuenta del usuario) [pendiente - carrito local funcional]
- [x] Mis Tratamientos: si ya tiene sesión activa (mismo correo), entrar directo al login sin re-registrar
- [x] Mis Tratamientos: consentimiento obligatorio siempre (no se puede saltar)
- [x] Mis Tratamientos: detectar cuenta existente de Shop y no pedir registro nuevo
- [x] Splash 0: reestructurar con Nutriser Home + Portal Salud + Nutriser Web
- [x] Splash 1: reestructurar con Shop + Academy + Mis Tratamientos + login/sesión arriba
- [x] Detección de dispositivo: PC/Mac/Laptop → sitio web directo, móvil/tablet → Splash 0
- [x] Nutriser Academy: sesión unificada con "Hola, [Nombre]" y botón iniciar sesión
- [x] Nutriser Academy: botón Regresar corregido para ir a Splash 1

- [x] Corregir botón Nutriser Web: navegar internamente al sitio web (setSplashState site) en lugar de URL externa

## Rediseño Nutriser Shop + Sesión Unificada
- [ ] Rediseñar Nutriser Shop: layout limpio con categorías en iconos circulares, secciones separadas
- [ ] Agregar botón flotante de WhatsApp en la tienda
- [ ] Corregir sesión unificada: iniciar sesión una vez y que funcione en Shop, Academy y Mis Tratamientos

## Sistema de Banners Promocionales (Pop-ups de Ofertas)

### Base de Datos
- [ ] Crear tabla shop_promotions en drizzle/schema.ts (título, descripción, descuento, cupón, imagen, plantilla, activo, fechas)
- [ ] Ejecutar migraciones con pnpm db:push

### Backend (tRPC)
- [ ] Crear procedimientos para CRUD de promociones (admin)
- [ ] Crear procedimiento público para obtener promociones activas

### Panel Admin
- [ ] Crear sección de gestión de banners promocionales en admin
- [ ] Formulario para crear/editar promoción con selector de plantilla
- [ ] Vista previa de la plantilla seleccionada
- [ ] Activar/desactivar promociones

### Frontend - Pop-up en Tienda
- [x] Crear componente PromoSplash con diseño tipo aparador publicitario
- [x] Mostrar pop-up al entrar a Nutriser Shop si hay promociones activas
- [x] Botón cerrar (X) y botón "Después" para cerrar
- [x] No mostrar el mismo pop-up dos veces en la misma sesión (sessionStorage)
- [x] Carrusel con flechas de navegación y dots indicadores
- [x] Mostrar imagen, título, descripción, precios, timer de expiración y barra de progreso
- [x] Test unitario para promotions.list endpoint

### Investigación - Pop-up no aparece en versión publicada
- [x] Investigar por qué la tienda publicada muestra un diseño diferente al código local
- [x] Verificar que Memberships.tsx (no Store.tsx) es la tienda real en /memberships
- [x] Integrar PromoSplash en Memberships.tsx correctamente

### Rediseño Completo de Nutriser Shop
- [x] Rediseñar header con estilo premium (gradiente, logo, sesión, carrito)
- [x] Rediseñar tabs principales con estilo más elegante
- [x] Rediseñar sección de Paquetes Especiales con tarjetas premium
- [x] Rediseñar tarjetas de servicios individuales con imágenes y diseño atractivo
- [x] Rediseñar sección de Farmacy con grid mejorado
- [x] Rediseñar sección de Library
- [x] Verificar diseño responsive en móvil
- [x] Mantener funcionalidad de carrito, checkout y autenticación

### Rediseño Nutriser Shop - Estilo Farmacia del Ahorro
- [x] Cambiar fondo a blanco/claro tipo tienda comercial digital
- [x] Banner carrusel de ofertas/promociones en la parte superior
- [x] Categorías con scroll horizontal e iconos circulares
- [x] Servicios en scroll horizontal (no grid vertical)
- [x] Paquetes especiales en scroll horizontal tipo tarjetas de oferta
- [x] Productos (Farmacy) en scroll horizontal
- [x] Diseño más dinámico y colorido tipo e-commerce
- [x] Mantener funcionalidad completa (carrito, checkout, auth, PromoSplash)

### Navegación diferenciada desktop vs móvil/tableta
- [x] Desktop: Quitar botones "Regresar" e "Inicio" que llevan a splashes (splashes son exclusivos de la app móvil)
- [x] Desktop: Agregar botón "Nutriser Shop" en el sitio web que lleve a la tienda
- [x] Desktop: En la tienda, botón "Regresar" lleva de vuelta al sitio web (no a splashes)
- [x] Móvil/tableta: Mantener botón "Regresar" que lleva al Splash 0
- [x] Móvil/tableta: En la tienda, botón "Regresar" lleva al Splash 1
- [x] Detectar tipo de dispositivo (desktop vs móvil/tableta) con hook compartido useDeviceType

### Corrección Navbar móvil - Solo botón Inicio en Home
- [x] En móvil, sitio web (Home): solo mostrar botón "Inicio" (→ Splash 0), sin "Regresar"
- [x] El botón "Regresar" solo aparece en páginas internas (tienda, cursos, etc.)

### Correcciones urgentes
- [x] Bug: Botón "¡LO QUIERO!" del PromoSplash ahora navega a /cupon/:id para comprar
- [x] Desktop Home: Quitar botón "Nutriser Shop" del navbar superior
- [x] Desktop Home: Agregar botón "Nutriser Shop" en el hero donde está "Cuponera de Descuentos", con estilo brillante/dorado
- [x] Tienda: Mejorar layout responsive para desktop (tarjetas, categorías, paquetes bien acomodados)
- [x] Tienda: Mejorar layout responsive para tableta
- [x] Tienda: Verificar layout en celular sigue bien

### Ajustes navegación desktop + responsive tienda
- [x] Desktop Home: Quitar botón "Nutriser Shop" del navbar superior
- [x] Desktop Home: Agregar botón "Nutriser Shop" en el hero donde está "Cuponera de Descuentos", con estilo brillante/dorado
- [x] Tienda: Mejorar layout responsive para desktop (tarjetas, categorías, paquetes bien acomodados)
- [x] Tienda: Mejorar layout responsive para tableta
- [x] Tienda: Verificar layout en celular sigue bien

### Correcciones tienda - Abril 14
- [x] Banner carrusel de ofertas clickeable y lleva a comprar la promoción/paquete
- [x] PromoSplash: X respeta zona segura del iPhone (safe-area-inset-top)

### Bug navegación cupón desde tienda
- [x] Botón Regresar en página del cupón SIGUE yendo al Splash 1 — CORREGIDO: query param ?from=store + z-index z-[60] en BackToSplash
- [x] Banner carrusel clickeable navega al paquete correspondiente

## Notificaciones Push en iPhone/iOS
- [x] Diagnosticar por qué las notificaciones push no funcionan en iPhone
- [x] Verificar manifest.json tiene los campos requeridos por iOS (display: standalone)
- [x] Corregir service worker v4 compatible con iOS/Safari (sin vibrate, requireInteraction, actions)
- [x] Corregir SplashSelector: VAPID key como Uint8Array (no string) — requerido por Safari
- [x] Crear pushHelper.ts centralizado con detección iOS, conversión VAPID, y suscripción
- [x] Refactorizar PromotionsSection y SplashSelector para usar pushHelper
- [x] Agregar update forzado del SW en index.html para dispositivos con cache viejo
- [x] Tests unitarios para push notifications server-side

## Corrección Push en App Nativa (WKWebView del App Store)
- [x] En WKWebView genérico (Instagram, etc): ocultar botón push
- [x] En app nativa Nutriser: mostrar botón push que usa APNs via bridge Swift
- [x] En SplashSelector: usar showPushSection que detecta app nativa vs WKWebView genérico
- [x] En PromotionsSection: usar isNativeAppFlag para habilitar push via bridge

## Proyecto Xcode con APNs para App Nativa iOS
- [x] Investigar integración APNs + WKWebView + backend Nutriser
- [x] Crear endpoint en servidor para registrar device tokens de APNs (push.registerAPNsToken)
- [x] Crear endpoint en servidor para enviar push via APNs (push.sendAPNsPush)
- [x] Crear módulo apnsService.ts con JWT auth, envío individual y masivo
- [x] Crear proyecto Xcode completo (WKWebView + APNs + NotificationServiceExtension)
- [x] Crear bridge JavaScript ↔ Swift (window.NutriserNative)
- [x] Actualizar pushHelper.ts con soporte nativo (requestNativePushPermission, checkNativePushStatus)
- [x] Empaquetar proyecto como ZIP (NutriserApp-iOS-Push.zip)
- [x] Tests unitarios para apnsService

## Bug: Sesión de paciente no se mantiene en la tienda
- [x] La sesión no persistía después de iniciar sesión — CORREGIDO: usePatientAuth reescrito con useSyncExternalStore
- [x] Causa raíz: múltiples instancias del hook useState no se sincronizaban entre modal y página
- [x] Solución: PatientAuthStore singleton + useSyncExternalStore + listeners globales
- [x] Verificado: sesión persiste después de recarga de página (localStorage funciona correctamente)

## Correcciones Página del Cupón (reportado por usuario)
- [x] Eliminar botones duplicados de REGRESAR en página del cupón — removido Navbar y botón inline, dejando solo BackToSplash
- [x] Respetar safe area del iPhone — espaciador con env(safe-area-inset-top) + modal con paddingTop
- [x] Auto-rellenar nombre, correo y teléfono en formulario "Adquirir cupón" si el usuario ya inició sesión (usePatientAuth)
- [x] Cambiar placeholder "Tony Robles" por "Tu nombre completo"

## Monedero Electrónico Nutriser

### Base de Datos
- [x] Crear tabla `wallets` (id, patientAccountId, walletNumber, qrCode, balance, totalCashback, isActive, createdAt)
- [x] Crear tabla `walletTransactions` (id, walletId, type: cashback/redeem/bonus/adjustment, amount, description, referenceId, createdAt)
- [x] Crear tabla `loyaltyTracker` (id, walletId, nutritionConsultations, freeConsultationsEarned, freeConsultationsUsed, createdAt)
- [x] Ejecutar migraciones con pnpm db:push

### Backend (tRPC)
- [x] Endpoint para crear monedero al registrarse (genera número único + QR)
- [x] Endpoint para ver saldo y estado de cuenta
- [x] Endpoint para acreditar cashback del 1% por compra
- [x] Endpoint para canjear saldo del monedero
- [x] Endpoint para registrar consultas nutricionales y calcular 4ta gratis
- [x] Endpoint admin para gestionar monederos y transacciones

### Frontend - Página Monedero
- [x] Tarjeta digital estilo Farmacia del Ahorro con QR, nombre, número, saldo
- [x] Diseño con identidad Nutriser (dorado, crema, negro)
- [x] Estado de cuenta con historial de transacciones
- [x] Progreso de programa de lealtad (consultas nutricionales)
- [x] Botón copiar número de monedero

### Integración
- [x] Monedero integrado en checkout de Nutriser Shop
- [x] Monedero integrado en checkout de Cupones
- [x] Panel admin para gestionar monederos, acreditar cashback, ver lealtad

### Programa de Lealtad por Producto (estilo Farmacia del Ahorro)
- [x] Crear tabla `loyaltyPlans` (id, name, productName, requiredPurchases, vigencia, isActive)
- [x] Crear tabla `loyaltyProgress` (id, walletId, planId, currentCount, rewardsEarned, rewardsUsed)
- [x] Consultas nutricionales: 3 compras → 4ta GRATIS
- [x] Productos: configurable por admin (acumula N → 1 GRATIS)
- [x] Barra de progreso visual por cada plan (1 → 2 → 3 → GRATIS)
- [x] Vigencia configurable por plan

### Seguridad del Monedero
- [x] Login requerido para ver/usar tarjeta
- [x] QR escaneable que abre la página del monedero (requiere login)
- [x] Código único de tarjeta para identificar usuario al comprar
- [x] Descuento automático del saldo al usar monedero en checkout

### Panel Admin - Gestión de Tarjetas
- [x] Vista de todas las tarjetas: nombre, correo, código, saldo
- [x] Acreditar/debitar saldo manualmente
- [x] Gestionar planes de lealtad (crear, editar, desactivar)
- [x] Registrar compras y consultas para acumular progreso

### Monedero dentro de Nutriser Shop
- [x] Pestaña "Monedero" en tabs de Nutriser Shop que navega a /monedero
- [x] Botón flotante circular con logo Nutriser (estilo Farmacia del Ahorro)
- [x] Bottom sheet al presionar botón flotante: tarjeta monedero (QR, nombre, número, saldo)
- [x] Botón "Ir a mi monedero" en bottom sheet que navega a /monedero
- [x] Asegurar que funcione en móvil y desktop

### Mejora Botón Flotante Monedero
- [x] Hacer botón flotante más grande y visible (más contraste, sombra, logo claro)

### Correcciones Botón Flotante Monedero
- [x] Agregar botón flotante del monedero en Memberships.tsx (tienda real con productos)
- [x] Cambiar descripción del modal de login: incluir monedero y beneficios, no solo carrito/compras
- [x] Botón flotante navega directo a /monedero (requiere login primero, muestra bottom sheet con tarjeta)
- [x] Quitar botón INICIO de la página del Monedero, dejar solo REGRESAR
- [x] Botón flotante del monedero mejorado en Nutriser Shop (Memberships.tsx): 76px, pulso dorado, etiqueta, z-60
- [x] Texto del modal de login actualizado: menciona monedero, cupones y beneficios
- [x] Carrito flotante reposicionado para no solapar con botón del monedero
- [x] Ocultar botón flotante del monedero cuando el bottom sheet está abierto (tapa el contenido)
- [x] Rediseñar tarjeta del monedero en bottom sheet estilo Farmacias del Ahorro: fondo blanco, código de barras, diseño limpio
- [x] Ocultar botón flotante cuando bottom sheet está abierto
- [x] Mover tabs de navegación (Tratamientos, Farmacy, Library, Monedero) a barra fija inferior estilo Farmacias del Ahorro
- [x] Integrar botón flotante del monedero en el centro de la barra inferior
- [x] Quitar tabs de navegación de la parte superior de la tienda
- [x] Quitar badges "Sesión activa" de las tres tarjetas en SplashSelector
- [x] Agregar nombre de usuario + punto verde "Activa" junto al icono de usuario en header del SplashSelector
- [x] Agregar nombre de usuario + punto verde "Activa" junto al icono de usuario en header de Nutriser Shop
- [x] Mover botón de música a esquina superior izquierda para no tapar barra inferior
- [x] Ocultar barra de navegación inferior y carrito flotante cuando el modal de checkout está abierto
- [x] Reemplazar código de barras por QR en el bottom sheet del monedero (con logo Nutriser al centro)
- [ ] Crear sistema de cobro presencial en panel admin con escáner QR
- [x] Mejorar carrito: respetar zona segura, ocultar barra inferior cuando está abierto, mejorar diseño
- [ ] Crear página Cuenta estilo Farmacias del Ahorro: perfil, monedero, pedidos, favoritos, notificaciones
- [ ] Agregar sistema de favoritos: tabla DB, procedimientos backend, botón corazón en productos
- [ ] Tab Cuenta en barra inferior abre página de cuenta (no el monedero)
- [ ] Notificaciones: integrar suscripción por email (sistema existente)
- [x] Unificar diseño de tarjeta del bottom sheet del monedero con la página completa (fondo oscuro, número, titular, saldo, QR)
- [x] Mover botón de sonido al lado derecho (opuesto al botón Regresar) para que no tape
- [x] Agregar barra de navegación inferior en WalletPage (/monedero) con Inicio (regresa a tienda), Monedero (activo), etc.

## Rediseño Tarjeta Monedero - Sesión Actual

- [x] Rediseñar tarjeta del monedero estilo Farmacias del Ahorro con logo Nutriser más grande
- [x] Mejorar presentación visual de la tarjeta (fondo, gradientes, tipografía)
- [x] Logo Nutriser prominente en la tarjeta
- [x] Unificar diseño en bottom sheet y página /monedero
- [ ] Agregar barra de navegación inferior en /monedero con opción Inicio
- [ ] Implementar backend de favoritos (db helpers + tRPC procedures)
- [ ] Crear página de Cuenta completa
- [ ] Agregar botones de corazón en tarjetas de productos
- [x] Crear banner promocional del Monedero Nutriser en el carrusel de cupones/promociones de la tienda
- [x] Banner debe incitar a crear cuenta y obtener monedero con beneficios (cashback, puntos, recompensas)

## Correcciones Sesión Actual - Monedero y PromoSplash

- [x] Generar imagen de tarjeta tipo crédito elegante (no en mesa) para promo del monedero
- [x] Corregir PromoSplash: navegación entre slides rota, no se puede cambiar a otras promos
- [x] Reducir tamaño de la slide del monedero en PromoSplash para que quepa toda la info
- [x] Rediseñar WalletPage: tarjeta compacta arriba estilo Farmacias del Ahorro con logo grande DENTRO
- [x] Quitar el cuadro blanco separado del logo, integrar logo en la tarjeta misma
- [x] Mover/ocultar botón de sonido para que no estorbe
- [x] Quitar botón de sonido de la tienda (Memberships), dejarlo solo en el sitio web principal (Home)
- [x] Agregar pestaña 'Mis Tratamientos' en la barra inferior de la tienda (al lado de Cuenta)
- [x] Quitar 'Mis Tratamientos' del Splash 1 (hub Nutriser Web) para simplificar navegación
- [x] Quitar descripción 'Shop · Academy · Mis Tratamientos' de la tarjeta Nutriser Home en Splash 0
- [x] Mover Nutriser Web de Splash 0 a Splash 1
- [x] Splash 0 queda solo con: Nutriser Home + Portal de Salud
- [x] Splash 1 queda con: Nutriser Shop + Nutriser Academy + Nutriser Web
- [x] Mejorar diseño de Mis Tratamientos: fondo integrado a la tienda (crema, dorado, mismo estilo)
- [x] Botón Regresar en Mis Tratamientos debe llevar de vuelta a la tienda (/memberships)
- [x] Bug: Carrito se borra al navegar a /monedero y regresar — persistir carrito en localStorage
- [x] Implementar lista de deseos (wishlist) con localStorage persistente
- [x] Agregar botón de corazón en cada artículo (tratamientos, farmacy, library)
- [x] Agregar pestaña 'Lista de Deseos' con icono de corazón en la barra inferior de la tienda
- [x] Panel de lista de deseos donde se puedan ver todos los artículos guardados y agregar al carrito
- [x] Corregir error de parse en SplashSelector.tsx (HTML entities &amp; en JSX)
- [x] Lista de Deseos: botón Regresar debe mostrar también opción de ir al inicio (igual que Monedero)
- [x] Tienda: restaurar solo botón Regresar (sin INICIO) en todas las pestañas excepto Deseos
- [x] Lista de Deseos: Regresar debe llevar de vuelta a la tienda (pestaña Tratamientos), no al Splash
- [x] Reducir tamaño de los botones de navegación (INICIO/Regresar) para que no sean tan grandes
- [x] Botón Regresar dentro de la tienda (al ver servicio/categoría) debe regresar a la tienda, no al Splash
- [x] Tabletas (iPad) deben detectarse como móviles y mostrar Splashes, no el sitio web de escritorio
- [x] Optimizar layout del Splash 1 (hub) para que se vea bien en tabletas (iPad)

## Monedero en Checkout y Sistema QR Presencial

### Bug Fix
- [x] Corregir bug "$NaN MXN" cuando servicio tiene precio "Consultar precio"

### Checkout - Integración Monedero
- [x] Mostrar saldo disponible del monedero en modal Finalizar Compra
- [x] Opción checkbox/toggle para usar saldo del monedero para pagar
- [x] Si saldo cubre todo → no necesita subir comprobante
- [x] Si saldo no cubre todo → pagar diferencia por transferencia
- [x] Mostrar cuánto cashback ganará con esta compra (informativo, no usable ahora)
- [x] Cashback se acredita solo después de que admin verifica comprobante (online)

### QR del Usuario
- [x] Generar QR único por usuario (vinculado a su cuenta) (ya existía)
- [x] Mostrar QR en la pestaña Monedero de la tienda (ya existía)
- [x] QR debe contener ID del usuario para identificarlo (ya existía)

### Panel Admin - Compras Presenciales
- [x] Agregar opción "Escanear QR" en panel admin
- [x] Al escanear QR → abrir monedero del usuario
- [x] Mostrar opciones de servicios/paquetes/productos para seleccionar qué compró
- [x] Al confirmar → acreditar cashback correspondiente al monedero del usuario

### Acreditación Automática Online
- [x] Al verificar comprobante de compra online → acreditar cashback automáticamente al monedero
- [x] Ajustar tamaño del PromoSplash para que se vea más grande en pantallas de computadora
- [x] Optimizar Splash 0 para tabletas (iPad) — tarjetas desproporcionadas, imágenes cortadas
- [x] Fix Splash 0 tablet: imagen de clínica sigue cortando el logo Nutriser del lado izquierdo
- [x] Revisar Splash 1 tablet: verificar que el layout de 3 tarjetas se vea correcto (ya se ve bien, no requiere cambios)
- [x] Fix Splash 0: imagen clínica sigue cortando la "n" de nutriser — mover objectPosition más a la izquierda (20% center)
- [x] Fix Splash 1: tarjeta Shop demasiado alta vs Academy/Web en tablet — cambiado a 3 columnas iguales
- [x] Fix monedero flotante en desktop: se abre pantalla completa, debe verse como tarjeta/popup pequeña
- [x] Fix monedero popup desktop: usar flex centering para tarjeta centrada en sm+
- [x] Escalar barra de categorías (Tratamientos, Farmacia, Library, etc.) para desktop
- [x] Escalar botón flotante del monedero para desktop
- [x] Escalar header de la tienda para desktop (título, usuario, carrito más grandes)
- [x] Escalar barra de búsqueda para desktop
- [x] Escalar productos para desktop (imágenes, texto, grid 2 columnas)
- [x] Escalar barra inferior de navegación para desktop (Tratamientos, Farmacy, Library, etc.)
- [ ] Integrar cashback del monedero en el flujo de checkout (Finalizar Compra)
- [ ] Mostrar cuánto cashback ganará el usuario con la compra
- [ ] Agregar opción de usar saldo del monedero para pagar parte del pedido
- [ ] Calcular totales correctamente con descuento de monedero y cashback

## Admin Login con Doble Seguridad (2FA por correo)
- [x] Quitar correo pre-llenado del login admin — campo editable vacío
- [x] Crear campos loginToken/loginTokenExpiresAt/loginAuthorized en adminCredentials
- [x] Crear procedimiento backend para enviar enlace de verificación a ambos correos
- [x] Enviar enlace de autorización a clinicanutriserpv@gmail.com Y nutriologoantoniobustos@gmail.com
- [x] Crear página /admin/authorize para autorizar el acceso por token
- [x] Modificar flujo: login → esperar autorización (polling 3s) → acceso concedido
- [x] Si no se presiona el enlace en 10 min, denegar acceso automáticamente
- [x] Tests unitarios para el flujo 2FA
- [x] Deshabilitar autocompletado del navegador en campos de correo y contraseña del login admin
- [x] Fix bug: credenciales válidas — tabla adminCredentials estaba vacía, se creó el registro
- [ ] Cambiar cashback del monedero de 1% a 2%
- [ ] Agregar "MXN" a precios de servicios individuales (igual que paquetes)
- [ ] Botón de cambiar idioma (español/inglés) en la tienda al lado del carrito
- [ ] Quitar placeholder "Ej: Nutriser20" del campo de código de descuento — dejarlo en blanco o genérico por seguridad

## Correcciones Sesión Actual

- [x] Corregir panel de notificaciones cortado en portal de salud — descartado, es de app externa (portaldesaludnutriser.club)
- [x] Agregar botón de cambio de idioma (EN/ES) en la tienda
- [x] Cambiar cashback de 1% a 2% en backend y frontend
- [x] Formato de precios de servicios: "$500" → "$500 MXN", "$3500" → "$3,500 MXN"
- [x] Quitar placeholder "Ej: Nutriser20" del campo de código de descuento
- [x] Seed admin credentials en BD con bcrypt
- [x] Monedero popup centrado en desktop (md+) como tarjeta de 420px


## Correcciones Sesión Actual - Simplificación y Expansión de Contenido

### Home Page - Hero Section
- [ ] Remover botón "Catálogo de Servicios"
- [ ] Remover botón "Ubicación"
- [ ] Dejar solo: "Nutriser Shop" (o Cuponera en móvil) y "Agenda tu Cita"
- [ ] Agregar más espacio visual antes de la sección "Cada piel y cada cuerpo merecen soluciones"

### Página de Servicios (/servicios)
- [ ] Expandir descripciones de servicios con información detallada:
  - [ ] ¿Qué es el servicio?
  - [ ] Beneficios principales
  - [ ] Duración del tratamiento
  - [ ] Cuidados post-tratamiento
  - [ ] Indicaciones y contraindicaciones
- [ ] Agregar modal "Más Información" para cada servicio
- [ ] Aplicar descripciones expandidas a los 27 servicios

### Sistema de Traducción ES/EN
- [ ] Extender diccionario de traducciones en client/src/lib/i18n.ts
- [ ] Agregar claves para descripciones de servicios
- [ ] Agregar claves para beneficios y cuidados
- [ ] Implementar traducción en ServicesSection.tsx
- [ ] Implementar traducción en Memberships.tsx (tienda)
- [ ] Verificar que el toggle de idioma funciona en todas las páginas


## Correcciones Sesión 13 - Descripciones de Servicios

### Simplificación del Hero
- [x] Remover botón "Catálogo de Servicios" del Hero
- [x] Remover botón "Ubicación" del Hero
- [x] Dejar solo "Nutriser Shop" y "Agenda tu Cita"
- [x] Agregar espaciado adecuado antes de la sección de servicios

### Expansión de Descripciones de Servicios
- [x] Crear archivo serviceDescriptions.ts con descripciones detalladas para todos los 27 servicios
- [x] Cada servicio incluye: qué es, beneficios, duración, cuidados post-tratamiento
- [x] Agregar botón "Más Info" en cada tarjeta de servicio
- [x] Crear modal de información detallada con:
  - [x] Descripción completa del servicio
  - [x] Lista de beneficios principales
  - [x] Duración del tratamiento
  - [x] Cuidados post-tratamiento
  - [x] Botones de CTA (Adquirir y Agendar Cita)
- [x] Reorganizar botones en tarjetas: "Más Info" + "Precio" en primera fila
- [x] Segunda fila: "Adquirir" + "Cita"

### Corrección de Typo
- [ ] Corregir typo "Asthethic" a "Aesthetic" en el nombre del proyecto (para SEO)


## Correcciones Sesión 13 - Descripciones y Espaciado

- [x] Simplificar Hero Section (remover Catálogo y Ubicación)
- [x] Expandir descripciones de servicios con información detallada (qué es, beneficios, duración, cuidados)
- [x] Cambiar botón "Precio" por "WhatsApp" para mayor claridad
- [x] Agregar espaciado en desktop entre Hero y sección dorada "Cada piel y cada cuerpo merecen soluciones"
- [x] Actualizar todas las descripciones de servicios corporales, faciales y medicina
- [x] Incluir servicios faltantes: Hidratación Facial, Peeling Químico, Microdermoabrasión, IPL, Mesoterapia Facial, Bioestimuladores

## Correcciones Sesión 14 - CAPTCHA Anti-bots

- [x] Crear componente SimpleCaptcha con verificación matemática local
- [x] Integrar CAPTCHA en formulario de citas (AppointmentForm)
- [x] CAPTCHA desactiva botón de envío hasta ser verificado
- [x] Verificar funcionamiento en navegador


## Correcciones Sesión 15 - Limpieza de UI y Navegación

- [ ] Remover botón "Cuponera de Descuentos" del Hero Section
- [ ] Remover botón "CUPONERA NUTRISER" del footer/contacto
- [ ] Remover texto "CATÁLOGO" del header en página de servicios
- [ ] Arreglar botones "Volver" para regresar a sitio web principal (/)
- [ ] Verificar cambios en móvil y desktop
- [ ] Remover botón de llamada en desktop (mantener solo en móvil)


## Correcciones Sesión 15 - Limpieza de UI y Acceso Admin

- [x] Remover botón "Cuponera" del Hero
- [x] Remover "CATÁLOGO" de servicios
- [x] Arreglar botón "Volver" para regresar a sitio web (/)
- [x] Remover botón de llamada en desktop (mantener solo en móvil)
- [x] Remover "ADMINISTRACIÓN" del navbar
- [x] Hacer logo clickeable para acceso secreto a admin
- [x] Ajustar espaciado entre Hero y sección dorada


## Correcciones Sesión 16 - Actualización de Descripción

- [x] Cambiar descripción de "Sobre Nutriser" con nuevo texto más informativo

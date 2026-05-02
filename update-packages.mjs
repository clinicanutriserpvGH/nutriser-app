/**
 * Script para actualizar paquetes:
 * 1. Eliminar "Paquete Nutrición"
 * 2. Crear nuevo paquete "New Skin"
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('🔄 Iniciando actualización de paquetes...');

    // 1. Eliminar paquete Nutrición
    console.log('❌ Eliminando "Paquete Nutrición"...');
    const [deleteResult] = await conn.execute(
      `DELETE FROM membershipPackages WHERE slug = 'paquete-nutricion' OR name = 'Paquete Nutrición'`
    );
    console.log(`✅ Eliminado: ${deleteResult.affectedRows} paquete(s)`);

    // 2. Crear paquete New Skin
    console.log('✨ Creando paquete "New Skin"...');
    const newSkinFeatures = `
• Radiofrecuencia Facial
• Hollywood Peel
• Fototerapia LED
• Ozonoterapia
• Mascarilla Rica en Antioxidantes
• Alta Frecuencia
• Aplicación de Bloqueador Solar
    `.trim();

    const newSkinDescription = 'Tratamiento facial completo para renovación y protección de la piel. Incluye 7 servicios especializados para rejuvenecimiento y cuidado profesional.';

    const [insertResult] = await conn.execute(
      `INSERT INTO membershipPackages (slug, name, nameEn, price, regularPrice, description, descriptionEn, features, featuresEn, imageUrl, category, badge, isActive, sortOrder, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'new-skin',
        'New Skin',
        'New Skin',
        3500, // precio en MXN
        4500, // precio regular
        newSkinDescription,
        'Complete facial treatment for skin renewal and protection. Includes 7 specialized services for rejuvenation and professional care.',
        newSkinFeatures,
        `
• Facial Radiofrequency
• Hollywood Peel
• LED Phototherapy
• Ozonotherapy
• Antioxidant-Rich Mask
• High Frequency
• Sunscreen Application
        `.trim(),
        null, // imageUrl (se puede actualizar después)
        'skincare', // categoría
        'Nuevo', // badge
        true, // isActive
        1 // sortOrder
      ]
    );
    console.log(`✅ Paquete "New Skin" creado con ID: ${insertResult.insertId}`);

    console.log('\n✨ ¡Actualización completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();

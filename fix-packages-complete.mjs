/**
 * Script COMPLETO para:
 * 1. Eliminar TODOS los registros de "Nutrición" (cualquier variante)
 * 2. Eliminar el paquete New Skin si existe
 * 3. Crear el paquete New Skin correctamente
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
const IMAGE_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/new-skin-package-PntQdC6ebPTbPExZ2Qk5BZ.webp';

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('🔄 LIMPIEZA COMPLETA DE PAQUETES\n');

    // 1. Listar todos los paquetes ANTES
    console.log('📋 PAQUETES ANTES:');
    const [beforePkgs] = await conn.execute(`SELECT id, slug, name FROM membershipPackages ORDER BY id DESC`);
    beforePkgs.forEach(pkg => console.log(`   - ID ${pkg.id}: ${pkg.name} (${pkg.slug})`));

    // 2. Eliminar TODOS los paquetes que contengan "nutricion" (cualquier caso)
    console.log('\n❌ Eliminando todos los paquetes de Nutrición...');
    const [deleteResult1] = await conn.execute(
      `DELETE FROM membershipPackages WHERE LOWER(name) LIKE '%nutricion%' OR LOWER(slug) LIKE '%nutricion%'`
    );
    console.log(`   ✅ Eliminados: ${deleteResult1.affectedRows} paquete(s)`);

    // 3. Eliminar paquete New Skin si existe (para recrearlo limpio)
    console.log('\n🔄 Eliminando New Skin anterior si existe...');
    const [deleteResult2] = await conn.execute(
      `DELETE FROM membershipPackages WHERE slug = 'new-skin' OR LOWER(name) = 'new skin'`
    );
    console.log(`   ✅ Eliminados: ${deleteResult2.affectedRows} paquete(s)`);

    // 4. Crear el paquete New Skin NUEVO
    console.log('\n✨ Creando paquete "New Skin"...');
    const newSkinFeatures = `• Radiofrecuencia Facial
• Hollywood Peel
• Fototerapia LED
• Ozonoterapia
• Mascarilla Rica en Antioxidantes
• Alta Frecuencia
• Aplicación de Bloqueador Solar`;

    const newSkinDescription = 'Tratamiento facial completo para renovación y protección de la piel. Incluye 7 servicios especializados para rejuvenecimiento y cuidado profesional.';

    const [insertResult] = await conn.execute(
      `INSERT INTO membershipPackages (slug, name, nameEn, price, regularPrice, description, descriptionEn, features, featuresEn, imageUrl, category, badge, isActive, sortOrder, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'new-skin',
        'New Skin',
        'New Skin',
        3500,
        4500,
        newSkinDescription,
        'Complete facial treatment for skin renewal and protection. Includes 7 specialized services for rejuvenation and professional care.',
        newSkinFeatures,
        `• Facial Radiofrequency
• Hollywood Peel
• LED Phototherapy
• Ozonotherapy
• Antioxidant-Rich Mask
• High Frequency
• Sunscreen Application`,
        IMAGE_URL,
        'skincare',
        'Nuevo',
        true,
        1
      ]
    );
    console.log(`   ✅ Paquete "New Skin" creado con ID: ${insertResult.insertId}`);

    // 5. Listar todos los paquetes DESPUÉS
    console.log('\n📋 PAQUETES DESPUÉS:');
    const [afterPkgs] = await conn.execute(`SELECT id, slug, name, price, isActive FROM membershipPackages ORDER BY id DESC`);
    afterPkgs.forEach(pkg => console.log(`   - ID ${pkg.id}: ${pkg.name} (${pkg.slug}) - $${pkg.price} - Activo: ${pkg.isActive ? 'Sí' : 'No'}`));

    console.log('\n✨ ¡LIMPIEZA Y RECREACIÓN COMPLETADAS!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();

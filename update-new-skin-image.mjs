/**
 * Script para actualizar la imagen del paquete "New Skin"
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
    console.log('🔄 Actualizando imagen del paquete "New Skin"...');

    const [result] = await conn.execute(
      `UPDATE membershipPackages SET imageUrl = ? WHERE slug = 'new-skin'`,
      [IMAGE_URL]
    );

    if (result.affectedRows > 0) {
      console.log('✅ Imagen actualizada exitosamente');
      console.log(`📸 URL: ${IMAGE_URL}`);
    } else {
      console.log('⚠️ No se encontró el paquete "New Skin"');
    }
  } catch (error) {
    console.error('❌ Error al actualizar imagen:', error);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();

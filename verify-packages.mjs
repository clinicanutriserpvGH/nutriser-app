/**
 * Script para verificar y corregir paquetes en la base de datos
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
    console.log('🔍 Verificando paquetes en la base de datos...\n');

    // Listar todos los paquetes
    const [packages] = await conn.execute(`SELECT id, slug, name, price, regularPrice, isActive FROM membershipPackages ORDER BY id DESC`);
    
    console.log('📦 PAQUETES ACTUALES:');
    console.log('─'.repeat(80));
    packages.forEach((pkg, idx) => {
      console.log(`${idx + 1}. ID: ${pkg.id} | Slug: ${pkg.slug} | Nombre: ${pkg.name}`);
      console.log(`   Precio: $${pkg.price} | Regular: $${pkg.regularPrice} | Activo: ${pkg.isActive ? 'Sí' : 'No'}`);
    });
    
    console.log('\n' + '─'.repeat(80));
    
    // Verificar si existe "Paquete Nutrición"
    const [nutricionPkg] = await conn.execute(
      `SELECT * FROM membershipPackages WHERE slug LIKE '%nutricion%' OR name LIKE '%Nutrición%' OR name LIKE '%nutricion%'`
    );
    
    if (nutricionPkg.length > 0) {
      console.log('\n⚠️  PROBLEMA: "Paquete Nutrición" SIGUE EN LA BASE DE DATOS');
      nutricionPkg.forEach(pkg => {
        console.log(`   - ID: ${pkg.id}, Slug: ${pkg.slug}, Nombre: ${pkg.name}`);
      });
    } else {
      console.log('\n✅ "Paquete Nutrición" eliminado correctamente');
    }
    
    // Verificar si existe "New Skin"
    const [newSkinPkg] = await conn.execute(
      `SELECT * FROM membershipPackages WHERE slug = 'new-skin' OR name = 'New Skin'`
    );
    
    if (newSkinPkg.length > 0) {
      console.log('\n✅ "New Skin" EXISTE en la base de datos');
      newSkinPkg.forEach(pkg => {
        console.log(`   - ID: ${pkg.id}, Slug: ${pkg.slug}, Nombre: ${pkg.name}`);
        console.log(`   - Precio: $${pkg.price}, Regular: $${pkg.regularPrice}`);
        console.log(`   - Imagen: ${pkg.imageUrl ? 'Sí' : 'No'}`);
      });
    } else {
      console.log('\n❌ PROBLEMA: "New Skin" NO EXISTE en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();

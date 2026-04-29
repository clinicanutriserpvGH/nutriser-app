import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);

async function debug() {
  const conn = await pool.getConnection();
  
  try {
    console.log('=== Estructura de Monederos ===\n');
    
    // Ver todos los monederos con sus pacientes
    const [wallets] = await conn.query(`
      SELECT 
        w.id,
        w.patientId,
        w.walletNumber,
        w.balance,
        pa.name,
        pa.email
      FROM wallets w
      LEFT JOIN patientAccounts pa ON w.patientId = pa.id
      LIMIT 20
    `);
    console.log('Monederos:', wallets);
    
    // Contar compras por tipo
    const [serviceCounts] = await conn.query(`
      SELECT patientEmail, COUNT(*) as count FROM servicePurchases GROUP BY patientEmail
    `);
    console.log('\nServicios por email:', serviceCounts);
    
    const [productCounts] = await conn.query(`
      SELECT patientEmail, COUNT(*) as count FROM productPurchases GROUP BY patientEmail
    `);
    console.log('\nProductos por email:', productCounts);
    
    const [ebookCounts] = await conn.query(`
      SELECT patientEmail, COUNT(*) as count FROM ebookPurchases GROUP BY patientEmail
    `);
    console.log('\nLibros por email:', ebookCounts);
    
    // Ver todas las compras sin agrupar
    const [allServices] = await conn.query(`
      SELECT id, serviceName, buyerName, buyerEmail, patientEmail FROM servicePurchases LIMIT 10
    `);
    console.log('\nPrimeros 10 servicios:', allServices);
    
    const [allProducts] = await conn.query(`
      SELECT id, productName, buyerName, buyerEmail, patientEmail FROM productPurchases LIMIT 10
    `);
    console.log('\nPrimeros 10 productos:', allProducts);
    
    const [allEbooks] = await conn.query(`
      SELECT id, buyerName, buyerEmail, patientEmail FROM ebookPurchases LIMIT 10
    `);
    console.log('\nPrimeros 10 libros:', allEbooks);
    
  } finally {
    conn.release();
    pool.end();
  }
}

debug().catch(console.error);

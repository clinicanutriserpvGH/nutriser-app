import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);

async function debug() {
  const conn = await pool.getConnection();
  
  try {
    // Buscar TONY en TODAS las tablas
    console.log('=== Buscando TONY ROBLES en todas las tablas ===\n');
    
    // En wallets (por walletNumber)
    const [walletsByNumber] = await conn.query(
      'SELECT id, patientId, walletNumber, balance FROM wallets WHERE walletNumber LIKE ?',
      ['%TONY%']
    );
    console.log('Wallets por walletNumber:', walletsByNumber);
    
    // En patientAccounts
    const [patientsByName] = await conn.query(
      'SELECT id, name, email FROM patientAccounts WHERE name LIKE ? OR email LIKE ?',
      ['%TONY%', '%TONY%']
    );
    console.log('PatientAccounts:', patientsByName);
    
    // En users
    const [usersByName] = await conn.query(
      'SELECT id, name, email FROM users WHERE name LIKE ? OR email LIKE ?',
      ['%TONY%', '%TONY%']
    );
    console.log('Users:', usersByName);
    
    // En servicePurchases (buyerName)
    const [servicesByBuyer] = await conn.query(
      'SELECT id, serviceName, buyerName, buyerEmail, patientEmail FROM servicePurchases WHERE buyerName LIKE ?',
      ['%TONY%']
    );
    console.log('\nServicios comprados por TONY:', servicesByBuyer);
    
    // En productPurchases (buyerName)
    const [productsByBuyer] = await conn.query(
      'SELECT id, productName, buyerName, buyerEmail, patientEmail FROM productPurchases WHERE buyerName LIKE ?',
      ['%TONY%']
    );
    console.log('Productos comprados por TONY:', productsByBuyer);
    
    // En ebookPurchases (buyerName)
    const [ebooksByBuyer] = await conn.query(
      'SELECT id, buyerName, buyerEmail, patientEmail FROM ebookPurchases WHERE buyerName LIKE ?',
      ['%TONY%']
    );
    console.log('Libros comprados por TONY:', ebooksByBuyer);
    
    // Si encontramos compras, buscar el monedero asociado
    if (servicesByBuyer.length > 0 || productsByBuyer.length > 0 || ebooksByBuyer.length > 0) {
      const buyerEmail = servicesByBuyer[0]?.buyerEmail || productsByBuyer[0]?.buyerEmail || ebooksByBuyer[0]?.buyerEmail;
      console.log(`\n=== Información del comprador: ${buyerEmail} ===`);
      
      // Buscar el monedero por email
      const [walletsByEmail] = await conn.query(
        'SELECT w.id, w.patientId, w.balance FROM wallets w JOIN patientAccounts pa ON w.patientId = pa.id WHERE pa.email = ?',
        [buyerEmail]
      );
      console.log('Monedero del comprador:', walletsByEmail);
      
      if (walletsByEmail.length > 0) {
        const walletId = walletsByEmail[0].id;
        const patientId = walletsByEmail[0].patientId;
        console.log(`\nWallet ID: ${walletId}, Patient ID: ${patientId}`);
      }
    }
    
  } finally {
    conn.release();
    pool.end();
  }
}

debug().catch(console.error);

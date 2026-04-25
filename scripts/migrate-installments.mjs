/**
 * Migración: Crear tablas installmentPlans e installmentPayments
 * Ejecutar con: node scripts/migrate-installments.mjs
 */
import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL no definida'); process.exit(1); }

async function run() {
  const conn = await createConnection(url);
  console.log('Conectado a la base de datos.');

  // Verificar si ya existen
  const [existing] = await conn.execute('SHOW TABLES LIKE "%installment%"');
  if (existing.length > 0) {
    console.log('Tablas ya existen:', existing.map(r => Object.values(r)[0]).join(', '));
  }

  // Crear tabla installmentPlans
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS \`installmentPlans\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`walletId\` int NOT NULL,
      \`patientId\` int NOT NULL,
      \`concept\` varchar(255) NOT NULL,
      \`originalAmountCents\` int NOT NULL,
      \`totalAmountCents\` int NOT NULL,
      \`surchargePercent\` int NOT NULL,
      \`modalidad\` enum('quincenal','semanal') NOT NULL,
      \`totalInstallments\` int NOT NULL,
      \`paidInstallments\` int NOT NULL DEFAULT 0,
      \`status\` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
      \`createdBy\` varchar(255),
      \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ Tabla installmentPlans creada (o ya existía).');

  // Crear tabla installmentPayments
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS \`installmentPayments\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`planId\` int NOT NULL,
      \`walletId\` int NOT NULL,
      \`installmentNumber\` int NOT NULL,
      \`amountCents\` int NOT NULL,
      \`dueDate\` timestamp NOT NULL,
      \`status\` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
      \`paidAt\` timestamp,
      \`confirmedBy\` varchar(255),
      \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`planId_idx\` (\`planId\`),
      KEY \`walletId_idx\` (\`walletId\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ Tabla installmentPayments creada (o ya existía).');

  await conn.end();
  console.log('Migración completada.');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });

import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const conn = await createConnection(DATABASE_URL);
try {
  await conn.execute('ALTER TABLE `cashPendingPayments` ADD COLUMN `itemsJson` text');
  console.log('SUCCESS: columna itemsJson agregada a cashPendingPayments');
} catch(e) {
  if (e.code === 'ER_DUP_FIELDNAME') {
    console.log('La columna itemsJson ya existe — no se necesita migración');
  } else {
    console.error('ERROR:', e.message);
  }
}
await conn.end();

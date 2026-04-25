/**
 * Migración v2: Agregar cashPaymentId e itemsJson a installmentPlans
 */
import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL no definida'); process.exit(1); }

async function run() {
  const conn = await createConnection(url);
  console.log('Conectado a la base de datos.');

  const [cols] = await conn.execute('SHOW COLUMNS FROM installmentPlans');
  const existing = cols.map(c => c.Field);
  console.log('Columnas actuales:', existing.join(', '));

  if (existing.includes('cashPaymentId')) {
    console.log('cashPaymentId ya existe, omitiendo.');
  } else {
    await conn.execute('ALTER TABLE installmentPlans ADD COLUMN cashPaymentId int NULL');
    console.log('✅ Columna cashPaymentId agregada');
  }

  if (existing.includes('itemsJson')) {
    console.log('itemsJson ya existe, omitiendo.');
  } else {
    await conn.execute('ALTER TABLE installmentPlans ADD COLUMN itemsJson text NULL');
    console.log('✅ Columna itemsJson agregada');
  }

  await conn.end();
  console.log('Migración v2 completada.');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });

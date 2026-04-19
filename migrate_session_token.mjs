import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';
config();
const conn = await createConnection(process.env.DATABASE_URL);
try {
  await conn.execute(`ALTER TABLE adminCredentials ADD COLUMN IF NOT EXISTS sessionToken VARCHAR(128) NULL`);
  await conn.execute(`ALTER TABLE adminCredentials ADD COLUMN IF NOT EXISTS sessionTokenExpiresAt DATETIME NULL`);
  console.log('✅ sessionToken columns added');
} catch(e) { console.error(e.message); } finally { await conn.end(); }

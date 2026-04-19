import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const conn = await createConnection(DATABASE_URL);

try {
  await conn.execute(`CREATE TABLE IF NOT EXISTS \`userBehaviorEvents\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`itemType\` enum('service','product','ebook','package','promotion') NOT NULL,
    \`itemId\` varchar(100) NOT NULL,
    \`itemName\` varchar(255) NOT NULL,
    \`eventType\` enum('view','wishlist','cart','info','purchase') NOT NULL,
    \`patientId\` int,
    \`sessionId\` varchar(64),
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`userBehaviorEvents_id\` PRIMARY KEY(\`id\`)
  )`);
  console.log('✅ Table userBehaviorEvents created OK');
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await conn.end();
}

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

await conn.execute(`CREATE TABLE IF NOT EXISTS \`shareRequests\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`clientName\` varchar(255) NOT NULL,
  \`clientPhone\` varchar(20) NOT NULL,
  \`clientEmail\` varchar(320),
  \`promotionId\` int NOT NULL,
  \`promotionTitle\` varchar(255) NOT NULL,
  \`screenshotUrls\` text NOT NULL,
  \`status\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  \`codeGenerated\` varchar(50),
  \`adminNotes\` text,
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  \`approvedAt\` timestamp,
  CONSTRAINT \`shareRequests_id\` PRIMARY KEY(\`id\`)
)`);

console.log('✅ Tabla shareRequests creada correctamente');
await conn.end();

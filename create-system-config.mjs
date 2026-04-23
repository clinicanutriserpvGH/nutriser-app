import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;

async function createTable() {
  const conn = await mysql.createConnection(url);
  
  // Crear tabla con el nombre que usa Drizzle: systemConfig
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS \`systemConfig\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`key\` VARCHAR(100) NOT NULL UNIQUE,
      value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  // Insertar la palabra clave inicial 'madre'
  await conn.execute(`
    INSERT INTO \`systemConfig\` (\`key\`, value) VALUES ('adminPassphrase', 'madre')
    ON DUPLICATE KEY UPDATE value = 'madre'
  `);
  
  const [rows] = await conn.execute('SELECT * FROM `systemConfig`');
  console.log('Created and seeded:', rows);
  await conn.end();
}

createTable().catch(console.error);

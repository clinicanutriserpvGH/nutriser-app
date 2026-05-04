import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function cleanup() {
  const conn = await pool.getConnection();
  try {
    // Eliminar TODOS los paquetes con nombre que contenga "Nutrición"
    const result = await conn.query(
      'DELETE FROM membershipPackages WHERE name LIKE ?',
      ['%Nutrición%']
    );
    console.log(`✅ Eliminados ${result[0].affectedRows} paquetes de Nutrición`);

    // Verificar que New Skin existe
    const [newSkin] = await conn.query(
      'SELECT id, name FROM membershipPackages WHERE name = ?',
      ['New Skin']
    );
    if (newSkin.length > 0) {
      console.log(`✅ New Skin existe: ${newSkin[0].name}`);
    } else {
      console.log('❌ New Skin no encontrado');
    }

    // Listar todos los paquetes
    const [all] = await conn.query('SELECT id, name FROM membershipPackages');
    console.log('\n📦 Paquetes activos:');
    all.forEach(pkg => console.log(`  - ${pkg.name}`));
  } finally {
    conn.release();
    pool.end();
  }
}

cleanup().catch(console.error);

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

async function fixBanners() {
  const conn = await pool.getConnection();
  try {
    // Eliminar banner de Nutrición
    const del = await conn.query(
      'DELETE FROM storeBanners WHERE title LIKE ?',
      ['%Nutrición%']
    );
    console.log(`✅ Eliminados ${del[0].affectedRows} banners de Nutrición`);

    // Listar banners actuales
    const [banners] = await conn.query('SELECT id, title FROM storeBanners');
    console.log('\n📺 Banners actuales:');
    banners.forEach(b => console.log(`  - ${b.title}`));
  } finally {
    conn.release();
    pool.end();
  }
}

fixBanners().catch(console.error);

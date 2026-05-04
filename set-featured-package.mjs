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

async function setFeatured() {
  const conn = await pool.getConnection();
  try {
    // Eliminar todos los paquetes de Nutrición
    const del = await conn.query('DELETE FROM membershipPackages WHERE name LIKE ?', ['%Nutrición%']);
    console.log(`✅ Eliminados ${del[0].affectedRows} paquetes de Nutrición`);

    // Actualizar New Skin para que sea el paquete destacado (badge = "Nuevo")
    const upd = await conn.query(
      'UPDATE membershipPackages SET badge = ? WHERE name = ?',
      ['Nuevo', 'New Skin']
    );
    console.log(`✅ New Skin configurado como paquete destacado`);

    // Listar paquetes
    const [all] = await conn.query('SELECT id, name, badge FROM membershipPackages ORDER BY id DESC LIMIT 5');
    console.log('\n📦 Últimos paquetes:');
    all.forEach(pkg => console.log(`  - ${pkg.name} (${pkg.badge || 'sin badge'})`));
  } finally {
    conn.release();
    pool.end();
  }
}

setFeatured().catch(console.error);

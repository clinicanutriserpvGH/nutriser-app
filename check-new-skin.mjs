import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
});

async function check() {
  const conn = await pool.getConnection();
  try {
    const [pkg] = await conn.query('SELECT * FROM membershipPackages WHERE name = ?', ['New Skin']);
    console.log('New Skin:', JSON.stringify(pkg[0], null, 2));
  } finally {
    conn.release();
    pool.end();
  }
}

check().catch(console.error);

import mysql from 'mysql2/promise.js';
const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [result] = await conn.execute('DELETE FROM storeBanners WHERE title = "New Skin"');
console.log('Deleted:', result.affectedRows, 'New Skin banner');
await conn.end();

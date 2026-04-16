/**
 * Seed script: Insert admin credentials into adminCredentials table
 * Uses bcrypt (NOT bcryptjs) to hash the password
 * Run: node seed-admin.mjs
 */
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const ADMIN_EMAIL = "clinicanutriserpv@gmail.com";
const ADMIN_PASSWORD = "nutriser2024";

async function main() {
  console.log("Connecting to database...");
  const connection = await mysql.createConnection(DATABASE_URL);

  // Hash password with bcrypt (10 salt rounds)
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
  console.log("Password hashed successfully with bcrypt");

  // Check if admin already exists
  const [existing] = await connection.execute(
    "SELECT id, email FROM adminCredentials WHERE email = ?",
    [ADMIN_EMAIL]
  );

  if (Array.isArray(existing) && existing.length > 0) {
    // Update existing record with new hash
    await connection.execute(
      "UPDATE adminCredentials SET passwordHash = ? WHERE email = ?",
      [passwordHash, ADMIN_EMAIL]
    );
    console.log(`Admin credentials UPDATED for: ${ADMIN_EMAIL}`);
  } else {
    // Insert new record
    await connection.execute(
      "INSERT INTO adminCredentials (email, passwordHash, createdAt) VALUES (?, ?, NOW())",
      [ADMIN_EMAIL, passwordHash]
    );
    console.log(`Admin credentials INSERTED for: ${ADMIN_EMAIL}`);
  }

  // Verify the record
  const [rows] = await connection.execute(
    "SELECT id, email, LEFT(passwordHash, 20) as hashPreview, createdAt FROM adminCredentials WHERE email = ?",
    [ADMIN_EMAIL]
  );
  console.log("Verification:", rows);

  await connection.end();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

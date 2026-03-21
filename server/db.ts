import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, memberships, paymentProofs, InsertMembership, InsertPaymentProof, appointments, InsertAppointment, adminCredentials, InsertAdminCredential } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Membership queries
export async function createMembership(data: InsertMembership) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(memberships).values(data);
  // Obtener el ID insertado
  const inserted = await db.select().from(memberships).orderBy(desc(memberships.id)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create membership");
  return inserted[0];
}

export async function getMembershipById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(memberships).where(eq(memberships.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllMemberships() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(memberships).orderBy(desc(memberships.createdAt));
}

export async function updateMembershipStatus(id: number, status: "pending" | "verified" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(memberships).set({ status, verifiedAt: status === "verified" ? new Date() : undefined }).where(eq(memberships.id, id));
}

// Payment proof queries
export async function createPaymentProof(data: InsertPaymentProof) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(paymentProofs).values(data);
}

export async function getPaymentProofByMembershipId(membershipId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(paymentProofs).where(eq(paymentProofs.membershipId, membershipId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Appointments queries
export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(appointments).values(data);
  const inserted = await db.select().from(appointments).orderBy(desc(appointments.id)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create appointment");
  return inserted[0];
}

export async function getAllAppointments() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Admin credentials queries
export async function getAdminByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(adminCredentials).where(eq(adminCredentials.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAdminCredential(data: InsertAdminCredential) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(adminCredentials).values(data);
}

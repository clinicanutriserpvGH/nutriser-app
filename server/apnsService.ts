/**
 * APNs (Apple Push Notification service) Module
 * 
 * Sends native push notifications to iOS devices via APNs HTTP/2.
 * Used for the native iOS app (WKWebView wrapper) where Web Push is not supported.
 * 
 * Requirements:
 * - APNS_KEY_ID: Key ID from Apple Developer Portal
 * - APNS_TEAM_ID: Team ID from Apple Developer Portal
 * - APNS_PRIVATE_KEY: Contents of the .p8 file (AuthKey)
 * - APNS_BUNDLE_ID: Bundle identifier of the iOS app (default: com.nutriser.app)
 */

import { ENV } from './_core/env';
import { getDb } from './db';
import { patientAccounts } from '../drizzle/schema';
import { eq, isNotNull } from 'drizzle-orm';

// APNs HTTP/2 endpoint
const APNS_HOST_PROD = 'https://api.push.apple.com';
const APNS_HOST_DEV = 'https://api.sandbox.push.apple.com';

let cachedJWT: { token: string; expiresAt: number } | null = null;

/**
 * Generate a JWT for APNs authentication (token-based).
 * Tokens are valid for up to 1 hour; we cache and refresh at 50 minutes.
 */
async function getAPNsJWT(): Promise<string> {
  if (cachedJWT && Date.now() < cachedJWT.expiresAt) {
    return cachedJWT.token;
  }

  const { apnsKeyId, apnsTeamId, apnsPrivateKey } = ENV;
  if (!apnsKeyId || !apnsTeamId || !apnsPrivateKey) {
    throw new Error('APNs credentials not configured (APNS_KEY_ID, APNS_TEAM_ID, APNS_PRIVATE_KEY)');
  }

  // Use jose library for JWT signing with ES256
  const { SignJWT, importPKCS8 } = await import('jose');

  // The private key from Apple is in PKCS8 PEM format
  const privateKeyPem = apnsPrivateKey.includes('BEGIN PRIVATE KEY')
    ? apnsPrivateKey
    : `-----BEGIN PRIVATE KEY-----\n${apnsPrivateKey}\n-----END PRIVATE KEY-----`;

  const privateKey = await importPKCS8(privateKeyPem, 'ES256');

  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: apnsKeyId })
    .setIssuer(apnsTeamId)
    .setIssuedAt(now)
    .sign(privateKey);

  // Cache for 50 minutes (APNs tokens valid for 1 hour)
  cachedJWT = {
    token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };

  return token;
}

/**
 * Send a push notification to a single iOS device via APNs.
 */
export async function sendAPNsPush(
  deviceToken: string,
  title: string,
  body: string,
  url?: string,
  sound: string = 'default',
  useSandbox: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const jwt = await getAPNsJWT();
    const host = useSandbox ? APNS_HOST_DEV : APNS_HOST_PROD;
    const bundleId = ENV.apnsBundleId || 'com.nutriser.app';

    const payload = {
      aps: {
        alert: {
          title,
          body,
        },
        sound: sound || 'default',
        badge: 1,
        'mutable-content': 1,
        'content-available': 1,
      },
      // Custom data — the app reads this to navigate to the right screen
      url: url || 'https://nutriserpv.com',
      type: 'promotion',
    };

    const response = await fetch(`${host}/3/device/${deviceToken}`, {
      method: 'POST',
      headers: {
        'authorization': `bearer ${jwt}`,
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'apns-expiration': '0',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[APNs] Push sent successfully to device: ${deviceToken.substring(0, 8)}...`);
      return { success: true };
    } else {
      const errorBody = await response.text();
      console.warn(`[APNs] Push failed (${response.status}): ${errorBody}`);

      // If token is invalid, we should clean it up
      if (response.status === 410 || response.status === 400) {
        await removeInvalidAPNsToken(deviceToken);
      }

      return { success: false, error: `APNs ${response.status}: ${errorBody}` };
    }
  } catch (err: any) {
    console.error('[APNs] Error sending push:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Remove an invalid APNs token from the database.
 */
async function removeInvalidAPNsToken(deviceToken: string) {
  try {
    const db = await getDb();
    if (!db) return;
    await db.update(patientAccounts)
      .set({ apnsToken: null })
      .where(eq(patientAccounts.apnsToken, deviceToken));
    console.log(`[APNs] Removed invalid token: ${deviceToken.substring(0, 8)}...`);
  } catch (e) {
    console.warn('[APNs] Failed to remove invalid token:', e);
  }
}

/**
 * Send push notification to ALL registered iOS devices (APNs tokens in patientAccounts).
 */
export async function sendAPNsPushToAll(
  title: string,
  body: string,
  url?: string,
  sound?: string
): Promise<{ sent: number; failed: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, failed: 0 };

  // Get all patients with APNs tokens
  const patients = await db.select({
    apnsToken: patientAccounts.apnsToken,
  })
    .from(patientAccounts)
    .where(isNotNull(patientAccounts.apnsToken));

  const tokens = patients
    .map(p => p.apnsToken)
    .filter((t): t is string => !!t && t.length > 0);

  if (tokens.length === 0) {
    console.log('[APNs] No registered devices found');
    return { sent: 0, failed: 0 };
  }

  console.log(`[APNs] Sending push to ${tokens.length} iOS device(s)...`);

  const results = await Promise.allSettled(
    tokens.map(token => sendAPNsPush(token, title, body, url, sound))
  );

  const sent = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
  const failed = results.length - sent;

  console.log(`[APNs] Results: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}

/**
 * Save an APNs device token for a patient.
 * If no patient account exists, create a minimal one.
 */
export async function saveAPNsToken(
  deviceToken: string,
  email?: string
): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  if (email) {
    // Try to find existing patient by email
    const existing = await db.select()
      .from(patientAccounts)
      .where(eq(patientAccounts.email, email));

    if (existing.length > 0) {
      // Update existing patient with APNs token
      await db.update(patientAccounts)
        .set({ apnsToken: deviceToken })
        .where(eq(patientAccounts.email, email));
      console.log(`[APNs] Updated token for patient: ${email}`);
      return { success: true };
    }
  }

  // Check if this token already exists for any patient
  const existingToken = await db.select()
    .from(patientAccounts)
    .where(eq(patientAccounts.apnsToken, deviceToken));

  if (existingToken.length > 0) {
    console.log(`[APNs] Token already registered`);
    return { success: true };
  }

  // Create a minimal patient account with just the APNs token
  try {
    await db.insert(patientAccounts).values({
      email: email || `ios-device-${deviceToken.substring(0, 8)}@nutriser.app`,
      passwordHash: '', // No password — this is a device-only registration
      name: 'Usuario iOS',
      phone: '',
      apnsToken: deviceToken,
    });
    console.log(`[APNs] Created new device registration for token: ${deviceToken.substring(0, 8)}...`);
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') {
      // Email already exists, update the token
      if (email) {
        await db.update(patientAccounts)
          .set({ apnsToken: deviceToken })
          .where(eq(patientAccounts.email, email));
      }
    } else {
      throw e;
    }
  }

  return { success: true };
}

/**
 * Check if APNs is configured and ready to use.
 */
export function isAPNsConfigured(): boolean {
  return !!(ENV.apnsKeyId && ENV.apnsTeamId && ENV.apnsPrivateKey);
}

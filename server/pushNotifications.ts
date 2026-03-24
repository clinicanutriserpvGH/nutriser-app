import webpush from 'web-push';
import { ENV } from './_core/env';
import { getDb } from './db';
import { pushSubscriptions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (!vapidConfigured && ENV.vapidPublicKey && ENV.vapidPrivateKey) {
    webpush.setVapidDetails(
      'mailto:clinicanutriserpv@gmail.com',
      ENV.vapidPublicKey,
      ENV.vapidPrivateKey
    );
    vapidConfigured = true;
  }
}

export async function savePushSubscription(endpoint: string, p256dh: string, auth: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Upsert: if endpoint already exists, update keys
  try {
    await db.insert(pushSubscriptions).values({ endpoint, p256dh, auth });
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') {
      await db.update(pushSubscriptions)
        .set({ p256dh, auth })
        .where(eq(pushSubscriptions.endpoint, endpoint));
    } else {
      throw e;
    }
  }
  return { success: true };
}

export async function deletePushSubscription(endpoint: string) {
  const db = await getDb();
  if (!db) return { success: false };
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  return { success: true };
}

export async function getAllPushSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(pushSubscriptions);
}

export async function sendPushNotificationToAll(
  title: string,
  body: string,
  url: string,
  icon?: string
) {
  ensureVapidConfigured();
  if (!ENV.vapidPublicKey || !ENV.vapidPrivateKey) {
    console.warn('[Push] VAPID keys not configured, skipping push notifications');
    return { sent: 0, failed: 0 };
  }

  const subs = await getAllPushSubscriptions();
  if (subs.length === 0) return { sent: 0, failed: 0 };

  const payload = JSON.stringify({
    title,
    body,
    url,
    icon: icon || '/icons/icon-192x192.png',
    requireInteraction: true,  // Notification stays until user taps it
    tag: 'nutriser-promo',     // Same tag = replaces previous notification (no duplicates on screen)
    renotify: false,           // Don't vibrate again if tag already exists
  });

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      ).catch(async (err) => {
        // Remove expired/invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          await deletePushSubscription(sub.endpoint);
        }
        throw err;
      })
    )
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`[Push] Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed };
}

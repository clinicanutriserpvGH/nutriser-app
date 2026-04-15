/**
 * Push Notification Helper — iOS/Safari compatible
 *
 * iOS Web Push Requirements (iOS 16.4+):
 * 1. The PWA MUST be installed on Home Screen (Add to Home Screen)
 * 2. The app MUST be opened from the Home Screen icon (standalone mode)
 * 3. VAPID applicationServerKey MUST be a Uint8Array, not a string
 * 4. Safari does NOT support: vibrate, actions, requireInteraction in notifications
 * 5. Push permission can ONLY be requested from a user gesture (click/tap)
 */

/** Detect if running on iOS */
export function isIOSDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Detect if running in standalone PWA mode (Home Screen app) */
export function isPWAStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/** Detect if running inside a WKWebView (native iOS app wrapper) */
export function isWKWebView(): boolean {
  return isIOSDevice() && !('serviceWorker' in navigator);
}

/** Check if push notifications are supported in the current environment */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Check if the current iOS environment can receive push notifications.
 * Returns an object with the status and a message for the user.
 */
export function checkIOSPushReadiness(): {
  ready: boolean;
  reason?: 'not_ios' | 'wkwebview' | 'not_standalone' | 'not_supported' | 'ready';
  message?: string;
} {
  if (!isIOSDevice()) {
    return { ready: true, reason: 'not_ios' };
  }

  if (isWKWebView()) {
    // WKWebView doesn't support service workers at all
    return {
      ready: false,
      reason: 'wkwebview',
      message: 'Las notificaciones push no están disponibles en esta app. Abre nutriserpv.com en Safari para activarlas.',
    };
  }

  if (!isPWAStandalone()) {
    return {
      ready: false,
      reason: 'not_standalone',
      message: 'Para recibir notificaciones en iPhone, primero debes instalar la app en tu pantalla de inicio.',
    };
  }

  if (!isPushSupported()) {
    return {
      ready: false,
      reason: 'not_supported',
      message: 'Tu dispositivo no soporta notificaciones push. Asegúrate de tener iOS 16.4 o superior.',
    };
  }

  return { ready: true, reason: 'ready' };
}

/**
 * Convert a base64url-encoded VAPID public key to a Uint8Array.
 * This is REQUIRED for Safari/iOS — passing a raw string will fail silently.
 */
export function vapidKeyToUint8Array(base64UrlKey: string): Uint8Array {
  const padding = '='.repeat((4 - base64UrlKey.length % 4) % 4);
  const base64 = (base64UrlKey + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications.
 * Handles the full flow: permission request, service worker ready, subscribe.
 * Returns the subscription keys or throws an error.
 */
export async function subscribeToPush(vapidPublicKey: string): Promise<{
  endpoint: string;
  p256dh: string;
  auth: string;
}> {
  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('PERMISSION_DENIED');
  }

  // Wait for service worker
  const reg = await navigator.serviceWorker.ready;

  // Convert VAPID key to Uint8Array (required for Safari/iOS)
  const applicationServerKey = vapidKeyToUint8Array(vapidPublicKey);

  // Reuse existing subscription if available (avoid duplicates)
  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    });
  }

  // Extract keys
  const p256dhArr = new Uint8Array(subscription.getKey('p256dh')!);
  const authArr = new Uint8Array(subscription.getKey('auth')!);
  const p256dh = btoa(Array.from(p256dhArr).map(b => String.fromCharCode(b)).join(''));
  const auth = btoa(Array.from(authArr).map(b => String.fromCharCode(b)).join(''));

  return {
    endpoint: subscription.endpoint,
    p256dh,
    auth,
  };
}

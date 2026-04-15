/**
 * Push Notification Helper — iOS/Safari + Native App compatible
 *
 * Supports THREE environments:
 * 1. Web browsers (Chrome, Firefox, etc.) → Web Push via Service Worker
 * 2. iOS Safari PWA (Home Screen) → Web Push via Service Worker (iOS 16.4+)
 * 3. Native iOS App (WKWebView from App Store) → APNs via Swift bridge
 *
 * The native app injects `window.isNutriserNativeApp = true` and
 * `window.NutriserNative` object for communication.
 */

declare global {
  interface Window {
    isNutriserNativeApp?: boolean;
    isNutriserIOSApp?: boolean;
    NutriserNative?: {
      requestPushPermission: () => void;
      getDeviceToken: () => void;
      checkPushStatus: () => void;
      openSettings: () => void;
    };
  }
}

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

/** Detect if running inside the native Nutriser iOS app */
export function isNativeApp(): boolean {
  return window.isNutriserNativeApp === true;
}

/** Detect if running inside a WKWebView (native iOS app wrapper) WITHOUT our bridge */
export function isWKWebView(): boolean {
  // If our native bridge is present, it's our app — don't block
  if (isNativeApp()) return false;
  // Generic WKWebView detection (e.g., Instagram, Facebook in-app browser)
  return isIOSDevice() && !('serviceWorker' in navigator);
}

/** Check if Web Push notifications are supported in the current environment */
export function isPushSupported(): boolean {
  // Native app uses APNs, not Web Push
  if (isNativeApp()) return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/** Check if ANY form of push is available (Web Push OR native APNs) */
export function isAnyPushAvailable(): boolean {
  return isNativeApp() || isPushSupported();
}

/**
 * Check if the current iOS environment can receive push notifications.
 * Returns an object with the status and a message for the user.
 */
export function checkIOSPushReadiness(): {
  ready: boolean;
  reason?: 'not_ios' | 'native_app' | 'wkwebview' | 'not_standalone' | 'not_supported' | 'ready';
  message?: string;
} {
  if (!isIOSDevice()) {
    return { ready: true, reason: 'not_ios' };
  }

  // Native Nutriser app — push is available via APNs bridge
  if (isNativeApp()) {
    return { ready: true, reason: 'native_app' };
  }

  if (isWKWebView()) {
    // Generic WKWebView (Instagram, Facebook, etc.) — no push support
    return {
      ready: false,
      reason: 'wkwebview',
      message: 'Las notificaciones push no están disponibles en este navegador. Abre nutriserpv.com en Safari para activarlas.',
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
 * Subscribe to push notifications via Web Push (Service Worker).
 * For web browsers and iOS PWA only — NOT for native app.
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

/**
 * Request push permission in the native iOS app via the Swift bridge.
 * Returns a Promise that resolves when the native app responds.
 */
export function requestNativePushPermission(): Promise<{
  status: string;
  token: string;
  registered: boolean;
}> {
  return new Promise((resolve, reject) => {
    if (!window.NutriserNative) {
      reject(new Error('Native bridge not available'));
      return;
    }

    // Listen for the response from the native app
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      window.removeEventListener('nutriserPushStatus', handler);
      clearTimeout(timeout);

      if (detail.status === 'granted') {
        resolve(detail);
      } else if (detail.status === 'denied') {
        reject(new Error('PERMISSION_DENIED_NATIVE'));
      } else {
        reject(new Error(`Native push status: ${detail.status}`));
      }
    };

    window.addEventListener('nutriserPushStatus', handler);

    // Timeout after 15 seconds
    const timeout = setTimeout(() => {
      window.removeEventListener('nutriserPushStatus', handler);
      reject(new Error('Native push permission timeout'));
    }, 15000);

    // Request permission via the bridge
    window.NutriserNative.requestPushPermission();
  });
}

/**
 * Check native push status without requesting permission.
 */
export function checkNativePushStatus(): Promise<{
  status: string;
  token: string;
  registered: boolean;
}> {
  return new Promise((resolve, reject) => {
    if (!window.NutriserNative) {
      reject(new Error('Native bridge not available'));
      return;
    }

    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      window.removeEventListener('nutriserPushStatus', handler);
      clearTimeout(timeout);
      resolve(detail);
    };

    window.addEventListener('nutriserPushStatus', handler);

    const timeout = setTimeout(() => {
      window.removeEventListener('nutriserPushStatus', handler);
      reject(new Error('Native push status check timeout'));
    }, 5000);

    window.NutriserNative.checkPushStatus();
  });
}

// Nutriser PWA Service Worker v4 — iOS/Safari compatible
const CACHE_NAME = 'nutriser-v4';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/icon-512x512-maskable.png',
];

// Detect iOS/Safari
const isIOS = /iphone|ipad|ipod/i.test(self.navigator?.userAgent || '');

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first strategy for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first for HTML navigation with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cached) => cached || caches.match('/offline.html') || caches.match('/'));
        })
    );
    return;
  }

  // Cache-first for local icons
  if (url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Cache-first for CDN assets (images, fonts, etc.)
  if (
    url.hostname.includes('cloudfront.net') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }
});

// ─── Push Notifications (iOS/Safari compatible) ───────────────────────────────

const NOTIFICATION_SOUND_URL = 'https://res.cloudinary.com/dikinwkjq/video/upload/v1774457153/nutriser-audio/notification-bell.mp3';

// Play notification sound in all open tabs/windows
async function playNotificationSound() {
  try {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      client.postMessage({ type: 'PLAY_NOTIFICATION_SOUND', url: NOTIFICATION_SOUND_URL });
    }
  } catch (e) {
    // Silently fail if no clients are open
  }
}

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Nutriser', body: event.data ? event.data.text() : 'Nueva notificación' };
  }

  const title = data.title || 'Nutriser - Nueva Oferta';

  // Build notification options — iOS/Safari compatible
  // Safari does NOT support: vibrate, actions, requireInteraction, renotify
  const options = {
    body: data.body || 'Hay una nueva oferta disponible para ti.',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'nutriser-promo',
    data: {
      url: data.url || 'https://nutriserpv.com',
    },
  };

  // Only add non-iOS features when NOT on iOS
  if (!isIOS) {
    options.vibrate = [200, 100, 200];
    options.requireInteraction = true;
    options.renotify = false;
    options.actions = [
      { action: 'open', title: 'Ver Oferta' },
      { action: 'close', title: 'Cerrar' },
    ];
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      playNotificationSound(),
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || 'https://nutriserpv.com';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window first
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            client.navigate(url);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
    }).then((subscription) => {
      const p256dhArr = new Uint8Array(subscription.getKey('p256dh'));
      const authArr = new Uint8Array(subscription.getKey('auth'));
      return fetch('/api/trpc/push.subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: btoa(Array.from(p256dhArr).map(b => String.fromCharCode(b)).join('')),
          auth: btoa(Array.from(authArr).map(b => String.fromCharCode(b)).join('')),
        }),
      });
    })
  );
});

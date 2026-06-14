/**
 * 🎬 Service Worker - Footage Archive
 * Soporte offline, caching, y PWA features
 */

const CACHE_VERSION = 'v2.0-cinema-retro';
const CACHE_NAME = `footage-archive-${CACHE_VERSION}`;

// Archivos que se cachean automáticamente
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/shared.css',
  '/shared.js',
  '/phase3-gallery.css',
  '/phase3-gallery.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap'
];

/**
 * 🔧 Install Event - Cache inicial
 */
self.addEventListener('install', event => {
  console.log('🎬 Service Worker installing...', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching precache assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch(err => console.error('❌ Cache install error:', err))
      .then(() => self.skipWaiting())
  );
});

/**
 * 🗑️ Activate Event - Limpiar caches viejos
 */
self.addEventListener('activate', event => {
  console.log('🎬 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== CACHE_NAME && cacheName.startsWith('footage-archive-');
            })
            .map(cacheName => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * 📡 Fetch Event - Network/Cache Strategy
 */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Strategy para HTML pages: Network-first
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cached => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Strategy para Assets: Cache-first
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));

            return response;
          })
          .catch(() => {
            // Fallback para imágenes
            if (event.request.destination === 'image') {
              return caches.match('/offline-image.png');
            }
          });
      })
  );
});

/**
 * 💬 Message Handler - Comunicación con cliente
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});

/**
 * 🔔 Background Sync (Soporte para compartir offline)
 */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-shares') {
    event.waitUntil(
      // Aquí iría la lógica para sincronizar comparticiones cuando vuelva online
      Promise.resolve()
    );
  }
});

/**
 * 🔊 Push Notifications
 */
self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'Nueva notificación de Footage Archive',
    icon: 'https://xcjzydmprmbpbqkacjwb.supabase.co/storage/v1/object/public/avatars/avatar.png',
    badge: 'https://xcjzydmprmbpbqkacjwb.supabase.co/storage/v1/object/public/avatars/avatar.png',
    vibrate: [200, 100, 200],
    tag: 'footage-archive',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('🎬 Footage Archive', options)
  );
});

/**
 * 🖱️ Notification Click
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Si ya hay una ventana abierta, enfocarla
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

console.log('🎬 Service Worker loaded successfully');

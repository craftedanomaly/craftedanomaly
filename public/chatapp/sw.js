// Service Worker for ChatApp PWA
const CACHE_NAME = 'chatapp-v3';
const urlsToCache = [
  '/chatapp/',
  '/chatapp/index.html',
  '/chatapp/styles/app.css',
  '/chatapp/scripts/app.js',
  '/chatapp/scripts/store.js',
  '/chatapp/scripts/ui.js',
  '/chatapp/scripts/initMessages.js',
  '/chatapp/scripts/components/ChatView.js',
  '/chatapp/scripts/components/ChatsList.js',
  '/chatapp/scripts/components/StatusList.js',
  '/chatapp/scripts/components/StatusViewer.js',
  '/chatapp/data/users.json',
  '/chatapp/data/chats.json',
  '/chatapp/data/statuses.json',
  '/chatapp/data/calls.json',
  '/chatapp/manifest.webmanifest'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network for same-origin GET requests only
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Only handle requests within our origin (avoid hijacking CDN or extension requests)
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          });
      })
      .catch(() => caches.match('/chatapp/index.html'))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Background sync (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Placeholder for syncing messages when back online
  console.log('Syncing messages...');
}

// Push notifications (optional)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Message';
  const options = {
    body: data.body || 'You have a new message',
    icon: '/chatapp/media/logo.png',
    badge: '/chatapp/media/logo.png',
    vibrate: [200, 100, 200],
    data: data.url || '/chatapp/'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || '/chatapp/')
  );
});

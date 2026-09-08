// ========================================
// MY LIFE - SERVICE WORKER v1.8
// يدعم العمل دون اتصال + إدارة كاش محسّنة
// ========================================

const CACHE_NAME = 'my-life-v8';
const RUNTIME_CACHE = 'runtime-v1';

const ASSETS_TO_CACHE = [
  'index.html',
  'css/style.css',
  'css/notes.css',
  'css/events.css',
  'css/program.css',
  'js/main.js',
  'js/storage.js',
  'js/week.js',
  'js/day.js',
  'js/task.js',
  'js/Achievements.js',
  'js/note.js',
  'js/events.js',
  'js/program.js',
  'js/profile.js',
  'js/notification.js',
  'js/backup.js',
  'js/translations.js',
  'js/update.js',
  'js/hour.js',
  'lang/en.js',
  'lang/ar.js',
  'lang/fr.js',
  'manifest.json',
  'icons/icon-512.png',
  'icons/icon-192.png',
  'icons/icon-96.png',
  
  // ===== الموارد الخارجية (CDN) =====
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', function(event) {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Caching assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(function() {
        console.log('[SW] Installation complete!');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('[SW] Installation failed:', error);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function() {
        console.log('[SW] Activation complete!');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);
  
  if (requestUrl.pathname.includes('analytics') || 
      requestUrl.pathname.includes('beacon') ||
      requestUrl.pathname.includes('logging')) {
    return;
  }
  
  // ===== معالجة CDN بشكل خاص (كاش منفصل) =====
  if (requestUrl.hostname.includes('unpkg.com') || 
      requestUrl.hostname.includes('fonts.googleapis.com') ||
      requestUrl.hostname.includes('fonts.gstatic.com')) {
    
    event.respondWith(
      caches.open(RUNTIME_CACHE)
        .then(function(cache) {
          return cache.match(event.request)
            .then(function(cachedResponse) {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              return fetch(event.request)
                .then(function(networkResponse) {
                  if (networkResponse && networkResponse.status === 200) {
                    cache.put(event.request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(function() {
                  return new Response('', { status: 200, statusText: 'OK' });
                });
            });
        })
    );
    return;
  }
  
  // ===== الملفات الثابتة (كاش رئيسي) =====
  if (isStaticAsset(requestUrl)) {
    event.respondWith(
      caches.open(CACHE_NAME)
        .then(function(cache) {
          return cache.match(event.request)
            .then(function(cachedResponse) {
              if (cachedResponse) {
                // تحديث الكاش في الخلفية
                fetch(event.request)
                  .then(function(networkResponse) {
                    if (networkResponse && networkResponse.status === 200) {
                      cache.put(event.request, networkResponse.clone());
                    }
                  })
                  .catch(function() {});
                return cachedResponse;
              }
              
              return fetch(event.request)
                .then(function(networkResponse) {
                  if (networkResponse && networkResponse.status === 200) {
                    cache.put(event.request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(function() {
                  return new Response('⚠️ You are offline. Please check your internet connection.', {
                    status: 503,
                    statusText: 'Service Unavailable'
                  });
                });
            });
        })
    );
    return;
  }
  
  // ===== Offline Fallback لصفحة index.html =====
  if (requestUrl.pathname.endsWith('/') || requestUrl.pathname.endsWith('/index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, clonedResponse);
              });
          }
          return networkResponse;
        })
        .catch(function() {
          return caches.match('index.html')
            .then(function(cachedResponse) {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response('⚠️ You are offline. The app has not been cached yet.', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
    return;
  }
  
  // ===== استراتيجية افتراضية =====
  event.respondWith(
    fetch(event.request)
      .then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, clonedResponse);
            });
        }
        return networkResponse;
      })
      .catch(function() {
        return caches.match(event.request)
          .then(function(cachedResponse) {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response('⚠️ Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

function isStaticAsset(url) {
  const staticExtensions = [
    '.css', '.js', '.html', '.json',
    '.png', '.jpg', '.jpeg', '.svg', '.gif',
    '.ico', '.woff', '.woff2', '.ttf', '.otf'
  ];
  
  return staticExtensions.some(function(ext) {
    return url.pathname.endsWith(ext);
  });
}

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'My Life';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || 'icons/icon-192.png',
    badge: 'icons/icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || 'index.html'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || 'index.html';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.endsWith(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Service Worker loaded successfully!');
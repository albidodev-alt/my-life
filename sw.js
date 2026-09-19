// ========================================
// MY LIFE - SERVICE WORKER v16
// يدعم العمل دون اتصال بشكل كامل
// ========================================

const CACHE_NAME = 'my-life-v16';
const RUNTIME_CACHE = 'runtime-v16';

const ASSETS_TO_CACHE = [
  // ===== HTML =====
  './',
  'index.html',

  // ===== CSS =====
  'css/fonts.css',
  'css/modal-base.css',
  'css/toast.css',
  'css/style.css',
  'css/notes.css',
  'css/events.css',
  'css/program.css',
  'css/drops.css',

  // ===== JS (Core) =====
  'js/utils.js',
  'js/toast.js',
  'js/modal-helper.js',
  'js/main.js',
  'js/storage.js',
  'js/week.js',
  'js/day.js',
  'js/task.js',
  'js/achievements.js',
  'js/note.js',
  'js/events.js',
  'js/program.js',
  'js/drops.js',
  'js/profile.js',

  // ===== JS (Secondary) =====
  'js/notification.js',
  'js/backup.js',
  'js/translations.js',
  'js/update.js',
  'js/hour.js',

  // ===== Fonts (محلية - للعمل بدون إنترنت) =====
  'fonts/inter-v20-latin-regular.woff2',
  'fonts/inter-v20-latin-500.woff2',
  'fonts/inter-v20-latin-600.woff2',
  'fonts/inter-v20-latin-700.woff2',
  'fonts/quicksand-v37-latin-regular.woff2',
  'fonts/quicksand-v37-latin-500.woff2',
  'fonts/quicksand-v37-latin-600.woff2',
  'fonts/quicksand-v37-latin-700.woff2',

  // ===== Vendor (Lucide Icons محلي) =====
  'vendor/lucide.min.js',

  // ===== Languages =====
  'lang/en.js',
  'lang/ar.js',
  'lang/fr.js',

  // ===== PWA =====
  'manifest.json',
  'icons/icon-512.png',
  'icons/icon-192.png',
  'icons/icon-96.png'
];

// ========================================
// INSTALL - تخزين كل الملفات
// ========================================
self.addEventListener('install', function(event) {
  console.log('[SW] Installing v16...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Caching all assets...');
        // استخدام Promise.allSettled لتجنب فشل التثبيت إذا فشل ملف واحد
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(function(url) {
            return cache.add(url).catch(function(err) {
              console.warn('[SW] Failed to cache:', url, err);
            });
          })
        );
      })
      .then(function() {
        console.log('[SW] Installation complete!');
        return self.skipWaiting();
      })
  );
});

// ========================================
// ACTIVATE - حذف الكاش القديم
// ========================================
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating v16...');
  
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

// ========================================
// FETCH - استراتيجية محسّنة للعمل بدون إنترنت
// ========================================
self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);
  
  // تجاهل الطلبات غير GET
  if (event.request.method !== 'GET') return;
  
  // تجاهل طلبات chrome-extension وغيرها
  if (!requestUrl.protocol.startsWith('http')) return;
  
  // ===== ملفات CDN: Cache-First (احتياطي فقط) =====
  if (requestUrl.hostname.includes('unpkg.com') || 
      requestUrl.hostname.includes('fonts.googleapis.com') ||
      requestUrl.hostname.includes('fonts.gstatic.com') ||
      requestUrl.hostname.includes('cdn.jsdelivr.net')) {
    
    event.respondWith(
      caches.open(RUNTIME_CACHE)
        .then(function(cache) {
          return cache.match(event.request)
            .then(function(cached) {
              if (cached) {
                return cached;
              }
              return fetch(event.request)
                .then(function(response) {
                  if (response && response.status === 200) {
                    cache.put(event.request, response.clone());
                  }
                  return response;
                })
                .catch(function() {
                  return new Response('', { status: 503 });
                });
            });
        })
    );
    return;
  }
  
  // ===== الملفات المحلية: Cache-First =====
  event.respondWith(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.match(event.request)
          .then(function(cachedResponse) {
            if (cachedResponse) {
              // تحديث خلفي (Stale-While-Revalidate)
              fetch(event.request)
                .then(function(networkResponse) {
                  if (networkResponse && networkResponse.status === 200) {
                    cache.put(event.request, networkResponse.clone());
                  }
                })
                .catch(function() { /* offline - تجاهل */ });
              
              return cachedResponse;
            }
            
            // غير موجود في الكاش - جرب الشبكة
            return fetch(event.request)
              .then(function(networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                  const cloned = networkResponse.clone();
                  cache.put(event.request, cloned);
                }
                return networkResponse;
              })
              .catch(function() {
                // Offline fallback للصفحات
                if (event.request.mode === 'navigate') {
                  return caches.match('index.html');
                }
                return new Response('Offline', { status: 503 });
              });
          });
      })
  );
});

// ========================================
// PUSH NOTIFICATIONS
// ========================================
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

// ========================================
// NOTIFICATION CLICK
// ========================================
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

// ========================================
// MESSAGE HANDLER
// ========================================
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // رسالة لمسح الكاش (للتحديثات)
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(function(names) {
      names.forEach(function(name) {
        caches.delete(name);
      });
    });
  }
});

console.log('✅ Service Worker v16 loaded successfully!');
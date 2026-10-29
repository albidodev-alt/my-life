// ========================================
// MY LIFE - SERVICE WORKER v2.2
// (Updated: Cache Version + Better Error Handling)
// ========================================

const CACHE_VERSION = 'v2.2';
const CACHE_NAME = `my-life-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// ========================================
// الملفات المطلوب تخزينها مسبقاً
// ========================================
const ASSETS_TO_CACHE = [
  // HTML
  './',
  'index.html',

  // CSS
  'css/fonts.css',
  'css/splash.css',
  'css/modal-base.css',
  'css/toast.css',
  'css/style.css',
  'css/dark-mode.css',
  'css/notes.css',
  'css/events.css',
  'css/program.css',
  'css/drops.css',

  // JS (Core)
  'js/utils.js',
  'js/theme.js',
  'js/splash.js',
  'js/toast.js',
  'js/modal-helper.js',
  'js/storage.js',
  'js/hour.js',
  'js/week.js',

  // JS (Features - Lazy Loaded)
  'js/day.js',
  'js/task.js',
  'js/achievements.js',
  'js/note.js',
  'js/events.js',
  'js/program.js',
  'js/drops.js',

  // JS (Secondary)
  'js/backup.js',
  'js/profile.js',
  'js/notification.js',
  'js/translations.js',
  'js/update.js',
  'js/main.js',

  // Fonts
  'fonts/inter-v20-latin-regular.woff2',
  'fonts/inter-v20-latin-500.woff2',
  'fonts/inter-v20-latin-600.woff2',
  'fonts/inter-v20-latin-700.woff2',
  'fonts/quicksand-v37-latin-regular.woff2',
  'fonts/quicksand-v37-latin-500.woff2',
  'fonts/quicksand-v37-latin-600.woff2',
  'fonts/quicksand-v37-latin-700.woff2',

  // Vendor
  'vendor/lucide.min.js',

  // Languages
  'lang/en.js',
  'lang/ar.js',
  'lang/fr.js',

  // PWA
  'manifest.json',
  'icons/icon-512.png',
  'icons/icon-192.png',
  'icons/icon-96.png'
];

// ========================================
// ✅ تخزين آمن — يستقبل Response جاهزاً (لا يستنسخ)
// ========================================
async function safeCachePut(cache, request, response) {
  try {
    await cache.put(request, response);
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.warn('[SW] Quota exceeded. Cleaning old entries...');
      const keys = await cache.keys();
      const deleteCount = Math.max(1, Math.floor(keys.length * 0.2));
      for (let i = 0; i < deleteCount; i++) {
        await cache.delete(keys[i]);
      }
      try {
        await cache.put(request, response);
        return true;
      } catch (retryErr) {
        console.error('[SW] Failed to cache after cleanup:', retryErr);
        return false;
      }
    }
    console.error('[SW] Cache put error:', err);
    return false;
  }
}

// ========================================
// ✅ backgroundCachePut — يستقبل Response (clone جاهز من المستدعي)
// ========================================
function backgroundCachePut(cacheName, request, response) {
  caches.open(cacheName).then(function (cache) {
    return safeCachePut(cache, request, response);
  }).catch(function (err) {
    console.warn('[SW] Background cache error:', err);
  });
}

// ========================================
// INSTALL
// ========================================
self.addEventListener('install', function (event) {
  console.log(`[SW ${CACHE_VERSION}] Installing...`);
  self.skipWaiting(); // تفعيل فوري للإصدار الجديد

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log(`[SW ${CACHE_VERSION}] Caching all assets...`);
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(function (url) {
            return cache.add(url).catch(function (err) {
              console.warn(`[SW ${CACHE_VERSION}] Failed to cache:`, url, err);
            });
          })
        );
      })
      .then(function () {
        console.log(`[SW ${CACHE_VERSION}] Installation complete!`);
      })
  );
});

// ========================================
// ACTIVATE
// ========================================
self.addEventListener('activate', function (event) {
  console.log(`[SW ${CACHE_VERSION}] Activating...`);

  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            // حذف أي كاش قديم لا يطابق الإصدار الحالي
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log(`[SW ${CACHE_VERSION}] Deleting old cache:`, cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        console.log(`[SW ${CACHE_VERSION}] Activation complete!`);
        return self.clients.claim(); // السيطرة على الصفحات المفتوحة فوراً
      })
  );
});

// ========================================
// FETCH — استراتيجيات مخصصة
// ========================================
self.addEventListener('fetch', function (event) {
  const requestUrl = new URL(event.request.url);

  if (event.request.method !== 'GET') return;
  if (!requestUrl.protocol.startsWith('http')) return;

  // ========================================
  // ✅ 1. HTML → Network-First
  // ========================================
  if (event.request.mode === 'navigate' ||
      (event.request.headers.get('accept') || '').includes('text/html')) {

    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          if (response && response.status === 200) {
            backgroundCachePut(CACHE_NAME, event.request, response.clone());
          }
          return response;
        })
        .catch(function () {
          return caches.match(event.request)
            .then(function (cached) {
              return cached || caches.match('index.html');
            });
        })
    );
    return;
  }

  // ========================================
  // ✅ 2. JS Modules → Network-First
  // ========================================
  if (requestUrl.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          if (response && response.status === 200) {
            backgroundCachePut(CACHE_NAME, event.request, response.clone());
          }
          return response;
        })
        .catch(function () {
          return caches.match(event.request)
            .then(function (cached) {
              if (cached) return cached;
              console.warn(`[SW] JS not in cache (offline): ${event.request.url}`);
              return new Response('', {
                status: 503,
                statusText: 'Offline - Module not cached'
              });
            });
        })
    );
    return;
  }

  // ========================================
  // ✅ 3. CDN → Cache-First
  // ========================================
  if (requestUrl.hostname.includes('unpkg.com') ||
      requestUrl.hostname.includes('fonts.googleapis.com') ||
      requestUrl.hostname.includes('fonts.gstatic.com') ||
      requestUrl.hostname.includes('cdn.jsdelivr.net')) {

    event.respondWith(
      caches.open(RUNTIME_CACHE)
        .then(function (cache) {
          return cache.match(event.request)
            .then(function (cached) {
              if (cached) return cached;
              return fetch(event.request)
                .then(function (response) {
                  if (response && response.status === 200) {
                    safeCachePut(cache, event.request, response.clone());
                  }
                  return response;
                })
                .catch(function () {
                  return new Response('', { status: 503 });
                });
            });
        })
    );
    return;
  }

  // ========================================
  // ✅ 4. CSS / Fonts / Images → Cache-First
  // ========================================
  event.respondWith(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.match(event.request)
          .then(function (cachedResponse) {
            if (cachedResponse) {
              // تحديث الكاش في الخلفية (Stale-While-Revalidate)
              fetch(event.request)
                .then(function (networkResponse) {
                  if (networkResponse && networkResponse.status === 200) {
                    safeCachePut(cache, event.request, networkResponse.clone());
                  }
                })
                .catch(function () { /* Offline - ignore */ });

              return cachedResponse;
            }

            return fetch(event.request)
              .then(function (networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                  safeCachePut(cache, event.request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(function () {
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
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'My Life';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || 'icons/icon-192.png',
    badge: 'icons/icon-96.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || 'index.html' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || 'index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
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
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(function (names) {
      names.forEach(function (name) {
        caches.delete(name);
      });
    });
  }

  if (event.data && event.data.type === 'CACHE_STATS') {
    caches.keys().then(function (names) {
      const stats = {};
      let pending = names.length;

      if (pending === 0) {
        event.ports[0].postMessage({ stats: {} });
        return;
      }

      names.forEach(function (name) {
        caches.open(name).then(function (cache) {
          cache.keys().then(function (keys) {
            stats[name] = keys.length;
            pending--;
            if (pending === 0) {
              event.ports[0].postMessage({ stats: stats });
            }
          });
        });
      });
    });
  }
});

console.log(`✅ Service Worker ${CACHE_VERSION} loaded successfully! (v2.2)`);
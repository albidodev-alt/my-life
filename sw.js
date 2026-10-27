// ========================================
// MY LIFE - SERVICE WORKER v19.0
// (Splash screen added to cache)
// ========================================

const CACHE_NAME = 'my-life-v19';
const RUNTIME_CACHE = 'runtime-v19';

// ========================================
// ✅ قائمة الملفات المطلوب تخزينها مسبقاً
// ========================================
const ASSETS_TO_CACHE = [
  // ===== HTML =====
  './',
  'index.html',

  // ===== CSS =====
  'css/fonts.css',
  'css/splash.css',
  'css/modal-base.css',
  'css/toast.css',
  'css/style.css',
  'css/notes.css',
  'css/events.css',
  'css/program.css',
  'css/drops.css',

  // ===== JS (Core) =====
  'js/utils.js',
  'js/theme.js',
  'js/splash.js',
  'js/toast.js',
  'js/modal-helper.js',
  'js/storage.js',
  'js/week.js',
  'js/day.js',
  'js/task.js',
  'js/achievements.js',
  'js/note.js',
  'js/events.js',
  'js/program.js',
  'js/drops.js',
  'js/backup.js',
  'js/profile.js',

  // ===== JS (Secondary) =====
  'js/notification.js',
  'js/translations.js',
  'js/update.js',
  'js/hour.js',
  'js/main.js',

  // ===== Fonts (محلية) =====
  'fonts/inter-v20-latin-regular.woff2',
  'fonts/inter-v20-latin-500.woff2',
  'fonts/inter-v20-latin-600.woff2',
  'fonts/inter-v20-latin-700.woff2',
  'fonts/quicksand-v37-latin-regular.woff2',
  'fonts/quicksand-v37-latin-500.woff2',
  'fonts/quicksand-v37-latin-600.woff2',
  'fonts/quicksand-v37-latin-700.woff2',

  // ===== Vendor (Lucide محلي) =====
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
// ✅ دالة تخزين آمنة (معالجة QuotaExceededError)
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

function backgroundCachePut(cacheName, request, response) {
  caches.open(cacheName).then(function (cache) {
    safeCachePut(cache, request, response.clone());
  }).catch(function (err) {
    console.warn('[SW] Background cache error:', err);
  });
}

// ========================================
// INSTALL
// ========================================
self.addEventListener('install', function (event) {
  console.log('[SW v19] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('[SW v19] Caching all assets...');
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(function (url) {
            return cache.add(url).catch(function (err) {
              console.warn('[SW v19] Failed to cache:', url, err);
            });
          })
        );
      })
      .then(function () {
        console.log('[SW v19] Installation complete!');
        return self.skipWaiting();
      })
  );
});

// ========================================
// ACTIVATE
// ========================================
self.addEventListener('activate', function (event) {
  console.log('[SW v19] Activating...');

  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW v19] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        console.log('[SW v19] Activation complete!');
        return self.clients.claim();
      })
  );
});

// ========================================
// FETCH
// ========================================
self.addEventListener('fetch', function (event) {
  const requestUrl = new URL(event.request.url);

  if (event.request.method !== 'GET') return;
  if (!requestUrl.protocol.startsWith('http')) return;

  // ✅ 1. HTML: Stale-While-Revalidate
  if (event.request.mode === 'navigate' ||
      (event.request.headers.get('accept') || '').includes('text/html')) {

    event.respondWith(
      caches.match(event.request).then(function (cachedResponse) {
        const fetchPromise = fetch(event.request)
          .then(function (networkResponse) {
            if (networkResponse && networkResponse.status === 200) {
              backgroundCachePut(CACHE_NAME, event.request, networkResponse);
            }
            return networkResponse;
          })
          .catch(function () {
            return caches.match('index.html');
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // ✅ 2. CDN: Cache-First
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

  // ✅ 3. الملفات المحلية: Cache-First + تحديث خلفي
  event.respondWith(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.match(event.request)
          .then(function (cachedResponse) {
            if (cachedResponse) {
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
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || 'index.html';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
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

console.log('✅ Service Worker v19.0 loaded successfully! (Splash screen cached)');
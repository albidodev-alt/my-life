// ========================================
// MY LIFE - SERVICE WORKER v17.0
// (Network-First HTML + Quota Handling + Better Offline)
// ========================================

const CACHE_NAME = 'my-life-v17';
const RUNTIME_CACHE = 'runtime-v17';

// ========================================
// ✅ قائمة الملفات المطلوب تخزينها مسبقاً
// ========================================
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

      // احصل على مفاتيح الكاش
      const keys = await cache.keys();

      // احذف أقدم 20% من المدخلات
      const deleteCount = Math.max(1, Math.floor(keys.length * 0.2));
      for (let i = 0; i < deleteCount; i++) {
        await cache.delete(keys[i]);
      }

      // حاول مرة أخرى
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
// INSTALL - تخزين كل الملفات
// ========================================
self.addEventListener('install', function (event) {
  console.log('[SW v17] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('[SW v17] Caching all assets...');

        // استخدام Promise.allSettled لتفادي فشل التثبيت إذا فشل ملف
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(function (url) {
            return cache.add(url).catch(function (err) {
              console.warn('[SW v17] Failed to cache:', url, err);
            });
          })
        );
      })
      .then(function () {
        console.log('[SW v17] Installation complete!');
        return self.skipWaiting();
      })
  );
});

// ========================================
// ACTIVATE - حذف الكاش القديم
// ========================================
self.addEventListener('activate', function (event) {
  console.log('[SW v17] Activating...');

  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW v17] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        console.log('[SW v17] Activation complete!');
        return self.clients.claim();
      })
  );
});

// ========================================
// FETCH - استراتيجية محسّنة
// ========================================
self.addEventListener('fetch', function (event) {
  const requestUrl = new URL(event.request.url);

  // تجاهل الطلبات غير GET
  if (event.request.method !== 'GET') return;

  // تجاهل البروتوكولات غير HTTP(S)
  if (!requestUrl.protocol.startsWith('http')) return;

  // ========================================
  // ✅ 1. HTML: Network-First (يضمن آخر تحديث)
  // ========================================
  if (event.request.mode === 'navigate' ||
      (event.request.headers.get('accept') || '').includes('text/html')) {

    event.respondWith(
      fetch(event.request)
        .then(function (networkResponse) {
          // ✅ خزّن النسخة الجديدة
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              safeCachePut(cache, event.request, cloned);
            });
          }
          return networkResponse;
        })
        .catch(function () {
          // ❌ فشل الاتصال → استخدم الكاش
          console.log('[SW v17] Network failed, using cache for:', event.request.url);
          return caches.match(event.request)
            .then(function (cached) {
              return cached || caches.match('index.html');
            });
        })
    );
    return;
  }

  // ========================================
  // ✅ 2. ملفات CDN: Cache-First (احتياطي فقط)
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
              if (cached) {
                return cached;
              }
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
  // ✅ 3. الملفات المحلية: Cache-First + تحديث خلفي
  // ========================================
  event.respondWith(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.match(event.request)
          .then(function (cachedResponse) {
            if (cachedResponse) {
              // ✅ تحديث خلفي (Stale-While-Revalidate)
              fetch(event.request)
                .then(function (networkResponse) {
                  if (networkResponse && networkResponse.status === 200) {
                    safeCachePut(cache, event.request, networkResponse.clone());
                  }
                })
                .catch(function () {
                  // Offline - تجاهل
                });

              return cachedResponse;
            }

            // غير موجود في الكاش - جرب الشبكة
            return fetch(event.request)
              .then(function (networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                  safeCachePut(cache, event.request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(function () {
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
// ✅ MESSAGE HANDLER (مع إضافة CACHE_STATS)
// ========================================
self.addEventListener('message', function (event) {
  // تخطي الانتظار للتحديث
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // مسح كل الكاش (للتحديثات الكاملة)
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(function (names) {
      names.forEach(function (name) {
        caches.delete(name);
      });
    });
  }

  // ✅ الحصول على إحصاءات الكاش
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

console.log('✅ Service Worker v17.0 loaded successfully!');
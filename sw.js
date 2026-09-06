// ========================================
// MY LIFE - SERVICE WORKER v1.0
// يدعم العمل دون اتصال والتحديثات التلقائية
// ========================================

const CACHE_NAME = 'my-life-v1';
const ASSETS_TO_CACHE = [
  // الصفحة الرئيسية
  '/my-life/index.html',
  
  // CSS
  '/my-life/css/style.css',
  '/my-life/css/notes.css',
  '/my-life/css/events.css',
  '/my-life/css/program.css',
  
  // JavaScript
  '/my-life/js/main.js',
  '/my-life/js/storage.js',
  '/my-life/js/week.js',
  '/my-life/js/day.js',
  '/my-life/js/task.js',
  '/my-life/js/Achievements.js',
  '/my-life/js/note.js',
  '/my-life/js/events.js',
  '/my-life/js/program.js',
  '/my-life/js/profile.js',
  '/my-life/js/notification.js',
  '/my-life/js/backup.js',
  '/my-life/js/translations.js',
  
  // ===== ملفات الترجمة الجديدة =====
  '/my-life/lang/en.js',
  '/my-life/lang/ar.js',
  '/my-life/lang/fr.js',
  
  // Lucide Icons (CDN)
  'https://unpkg.com/lucide@latest',
  
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap',
  
  // Manifest
  '/my-life/manifest.json'
];

// ========================================
// تثبيت Service Worker
// ========================================

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
      })
  );
});

// ========================================
// تنشيط Service Worker
// ========================================

self.addEventListener('activate', function(event) {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
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
// استراتيجية: Stale-While-Revalidate + Network First
// ========================================

self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);
  
  // تجاهل طلبات التحليلات والإحصائيات
  if (requestUrl.pathname.includes('analytics') || 
      requestUrl.pathname.includes('beacon') ||
      requestUrl.pathname.includes('logging')) {
    return;
  }
  
  // استراتيجية خاصة للملفات الثابتة
  if (isStaticAsset(requestUrl)) {
    event.respondWith(
      caches.match(event.request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            // تحديث الكاش في الخلفية
            fetch(event.request)
              .then(function(networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                  caches.open(CACHE_NAME)
                    .then(function(cache) {
                      cache.put(event.request, networkResponse);
                    });
                }
              })
              .catch(function() {
                // تجاهل أخطاء الشبكة
              });
            return cachedResponse;
          }
          
          // إذا لم يكن في الكاش، حاول من الشبكة
          return fetch(event.request)
            .then(function(networkResponse) {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(event.request, networkResponse.clone());
                  });
              }
              return networkResponse;
            })
            .catch(function() {
              // عرض صفحة الخطأ المخصصة
              return new Response('⚠️ You are offline. Please check your internet connection.', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
    return;
  }
  
  // استراتيجية Network First للـ API والبيانات
  if (requestUrl.pathname.includes('/api/') || 
      requestUrl.pathname.includes('localStorage') ||
      requestUrl.pathname.includes('indexedDB')) {
    event.respondWith(
      fetch(event.request)
        .catch(function() {
          return caches.match(event.request)
            .then(function(cachedResponse) {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response('⚠️ Offline - Data not available', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
    return;
  }
  
  // استراتيجية Cache First للصور والخطوط
  if (isImageOrFont(requestUrl)) {
    event.respondWith(
      caches.match(event.request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(function(networkResponse) {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(event.request, networkResponse.clone());
                  });
              }
              return networkResponse;
            });
        })
    );
    return;
  }
  
  // استراتيجية افتراضية: Network First مع fallback إلى الكاش
  event.respondWith(
    fetch(event.request)
      .then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          // تحديث الكاش
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, networkResponse.clone());
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
            // عرض صفحة بديلة
            return new Response('⚠️ Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// ========================================
// دوال مساعدة
// ========================================

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

function isImageOrFont(url) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.webp'];
  const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf'];
  const allExtensions = imageExtensions.concat(fontExtensions);
  
  return allExtensions.some(function(ext) {
    return url.pathname.endsWith(ext);
  });
}

// ========================================
// معالجة الإشعارات
// ========================================

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'My Life';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/my-life/icons/icon-192.png',
    badge: '/my-life/icons/icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/my-life/index.html'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/my-life/index.html';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
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
// تحديث التطبيق تلقائياً
// ========================================

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Service Worker loaded successfully!');
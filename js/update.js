// ========================================
// MY LIFE HUB - PWA UPDATE MANAGER v2.0
// (Visibility-Aware + Better UX + Clean Timers)
// ========================================

let updateAvailable = false;
let updatePromise = null;
let updateCheckInterval = null;
let isUpdating = false;

// ========================================
// ✅ التحقق من التحديثات
// ========================================
function checkForUpdates() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(false);
  if (!navigator.onLine) return Promise.resolve(false);

  return navigator.serviceWorker.ready
    .then(function (registration) {
      return registration.update();
    })
    .then(function () {
      console.log('✅ Checked for updates');
      return true;
    })
    .catch(function (error) {
      console.warn('⚠️ Update check failed:', error);
      return false;
    });
}

// ========================================
// ✅ إشعار التحديث المتاح
// ========================================
function showUpdateNotification() {
  // لا تُظهر أكثر من إشعار
  const existing = document.getElementById('update-notification');
  if (existing) return;

  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: max(90px, calc(env(safe-area-inset-bottom, 0px) + 90px));
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-card);
    border: 1px solid var(--primary);
    border-radius: 14px;
    padding: 16px 24px;
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: calc(100% - 32px);
    width: auto;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    animation: slideUp 0.3s ease;
    -webkit-user-select: none;
    user-select: none;
  `;

  const message = document.createElement('span');
  message.style.cssText = `
    font-family: var(--font-handwritten);
    font-size: 16px;
    color: var(--text-primary);
    font-weight: 500;
    white-space: nowrap;
  `;
  message.textContent = typeof t === 'function'
    ? t('new_update_available', '🔄 New update available!')
    : '🔄 New update available!';

  const updateBtn = document.createElement('button');
  updateBtn.style.cssText = `
    padding: 8px 20px;
    background: var(--primary-gradient);
    color: white;
    border: none;
    border-radius: 8px;
    font-family: var(--font-handwritten);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    min-height: 40px;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  `;
  updateBtn.textContent = typeof t === 'function'
    ? t('update_now', 'Update Now')
    : 'Update Now';

  updateBtn.addEventListener('mouseenter', function () {
    this.style.transform = 'translateY(-2px)';
    this.style.boxShadow = 'var(--shadow-md)';
  });
  updateBtn.addEventListener('mouseleave', function () {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = 'none';
  });

  updateBtn.addEventListener('click', function () {
    updateApp();
  });

  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 22px;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    line-height: 1;
    transition: background-color 0.2s ease, color 0.2s ease;
    min-width: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
  `;
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Dismiss');

  closeBtn.addEventListener('mouseenter', function () {
    this.style.backgroundColor = 'var(--bg-hover)';
    this.style.color = 'var(--text-primary)';
  });
  closeBtn.addEventListener('mouseleave', function () {
    this.style.backgroundColor = 'transparent';
    this.style.color = 'var(--text-muted)';
  });

  closeBtn.addEventListener('click', function () {
    notification.remove();
    console.log('📌 Update dismissed by user');
  });

  notification.appendChild(message);
  notification.appendChild(updateBtn);
  notification.appendChild(closeBtn);
  document.body.appendChild(notification);

  // ✅ إزالة تلقائية بعد دقيقة
  setTimeout(function () {
    if (document.getElementById('update-notification')) {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      setTimeout(function () {
        notification.remove();
      }, 300);
    }
  }, 60000);
}

// ========================================
// ✅ تحديث التطبيق
// ========================================
function updateApp() {
  if (!('serviceWorker' in navigator)) return;
  if (isUpdating) return;

  isUpdating = true;

  navigator.serviceWorker.ready
    .then(function (registration) {
      // إرسال رسالة لتخطي الانتظار
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // إعادة تحميل الصفحة بعد تحديث الـ SW
      document.getElementById('update-notification')?.remove();

      showUpdateLoadingOverlay();

      // إعادة التحميل بعد 1.5 ثانية
      setTimeout(function () {
        location.reload();
      }, 1500);
    })
    .catch(function (error) {
      console.error('Update failed:', error);
      isUpdating = false;

      if (typeof showToast === 'function') {
        showToast(
          '❌ ' + (typeof t === 'function' ? t('update_failed', 'Update failed. Please try again.') : 'Update failed. Please try again.'),
          'error'
        );
      }
    });
}

// ========================================
// ✅ شاشة تحميل عند التحديث
// ========================================
function showUpdateLoadingOverlay() {
  const loading = document.createElement('div');
  loading.id = 'update-loading-overlay';
  loading.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    flex-direction: column;
    gap: 16px;
    animation: fadeIn 0.3s ease;
  `;

  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  `;

  const text = document.createElement('span');
  text.style.cssText = `
    color: white;
    font-family: var(--font-handwritten);
    font-size: 18px;
    font-weight: 500;
  `;
  text.textContent = typeof t === 'function'
    ? t('updating', '🔄 Updating...')
    : '🔄 Updating...';

  loading.appendChild(spinner);
  loading.appendChild(text);
  document.body.appendChild(loading);

  // ✅ إضافة keyframes إذا لم تكن موجودة
  if (!document.getElementById('update-spin-keyframes')) {
    const style = document.createElement('style');
    style.id = 'update-spin-keyframes';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ========================================
// ✅ بدء وإيقاف فحص التحديثات
// ========================================
function startUpdateTimer() {
  if (updateCheckInterval) return;

  updateCheckInterval = setInterval(function () {
    if (!document.hidden && navigator.onLine) {
      checkForUpdates();
    }
  }, 5 * 60 * 1000); // 5 دقائق
}

function stopUpdateTimer() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
}

// ========================================
// ✅ مراقبة تحديثات Service Worker
// ========================================
if ('serviceWorker' in navigator) {

  // حالة الـ SW عند التحميل
  navigator.serviceWorker.ready
    .then(function (registration) {
      // إذا كان هناك SW منتظر → أظهر إشعار
      if (registration.waiting) {
        updateAvailable = true;
        showUpdateNotification();
      }

      // مراقبة التغييرات
      registration.addEventListener('updatefound', function () {
        const newWorker = registration.installing;
        console.log('📌 New Service Worker found');

        newWorker.addEventListener('statechange', function () {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            updateAvailable = true;
            showUpdateNotification();
          }
        });
      });
    })
    .catch(function (error) {
      console.warn('⚠️ Service Worker not ready:', error);
    });

  // رسائل من الـ SW
  navigator.serviceWorker.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
      showUpdateNotification();
    }
  });
}

// ========================================
// ✅ Visibility-Aware Update Timer
// ========================================
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    stopUpdateTimer();
  } else {
    startUpdateTimer();
    // ✅ فحص فوري عند العودة
    if (navigator.onLine) {
      checkForUpdates();
    }
  }
});

// ✅ ابدأ عند التحميل
if (!document.hidden) {
  startUpdateTimer();
}

// ✅ فحص عند العودة للاتصال
window.addEventListener('online', function () {
  console.log('✅ Back online. Checking for updates...');
  checkForUpdates();
});

// ✅ فحص عند تغيير الصفحة (بعد 30 ثانية)
setTimeout(function () {
  if (navigator.onLine) {
    checkForUpdates();
  }
}, 30000);

// ========================================
// ✅ تصدير الدوال
// ========================================
window.checkForUpdates = checkForUpdates;
window.showUpdateNotification = showUpdateNotification;
window.updateApp = updateApp;
window.startUpdateTimer = startUpdateTimer;
window.stopUpdateTimer = stopUpdateTimer;

console.log('✅ PWA Update Manager v2.0 loaded successfully!');
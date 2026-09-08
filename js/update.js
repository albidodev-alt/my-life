// ========================================
// MY LIFE HUB - PWA UPDATE MANAGER
// إدارة تحديثات التطبيق وإشعارات التحديث
// ========================================

let updateAvailable = false;
let updatePromise = null;

function checkForUpdates() {
  if (!('serviceWorker' in navigator)) return;
  
  navigator.serviceWorker.ready
    .then(function(registration) {
      return registration.update();
    })
    .then(function() {
      console.log('✅ Checked for updates');
    })
    .catch(function(error) {
      console.warn('⚠️ Update check failed:', error);
    });
}

function showUpdateNotification() {
  const existing = document.getElementById('update-notification');
  if (existing) return;
  
  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 90px;
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
    max-width: 90%;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    animation: slideUp 0.3s ease;
  `;
  
  const message = document.createElement('span');
  message.style.cssText = `
    font-family: var(--font-handwritten);
    font-size: 16px;
    color: var(--text-primary);
    font-weight: 500;
  `;
  message.textContent = '🔄 New update available!';
  
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
    transition: transform 0.2s ease;
  `;
  updateBtn.textContent = 'Update Now';
  updateBtn.addEventListener('click', function() {
    updateApp();
  });
  
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 20px;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px 8px;
  `;
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', function() {
    notification.remove();
  });
  
  notification.appendChild(message);
  notification.appendChild(updateBtn);
  notification.appendChild(closeBtn);
  document.body.appendChild(notification);
  
  // إزالة الإشعار بعد دقيقة
  setTimeout(function() {
    if (document.getElementById('update-notification')) {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      setTimeout(function() {
        notification.remove();
      }, 300);
    }
  }, 60000);
}

function updateApp() {
  if (!('serviceWorker' in navigator)) return;
  
  navigator.serviceWorker.ready
    .then(function(registration) {
      // إرسال رسالة لتخطي الانتظار
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // إعادة تحميل الصفحة بعد تحديث الـ SW
      document.getElementById('update-notification')?.remove();
      
      const loading = document.createElement('div');
      loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        flex-direction: column;
        gap: 16px;
      `;
      
      const spinner = document.createElement('div');
      spinner.style.cssText = `
        width: 48px;
        height: 48px;
        border: 4px solid white;
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
      text.textContent = '🔄 Updating...';
      
      loading.appendChild(spinner);
      loading.appendChild(text);
      document.body.appendChild(loading);
      
      // إعادة التحميل بعد 2 ثانية
      setTimeout(function() {
        location.reload();
      }, 2000);
    })
    .catch(function(error) {
      console.error('Update failed:', error);
    });
}

// ========================================
// مراقبة تحديثات Service Worker
// ========================================

if ('serviceWorker' in navigator) {
  // مراقبة حالة الـ SW
  navigator.serviceWorker.ready
    .then(function(registration) {
      // التحقق من وجود تحديث عند تفعيل الـ SW
      if (registration.waiting) {
        updateAvailable = true;
        showUpdateNotification();
      }
      
      // مراقبة التغييرات
      registration.addEventListener('updatefound', function() {
        const newWorker = registration.installing;
        console.log('📌 New Service Worker found');
        
        newWorker.addEventListener('statechange', function() {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            updateAvailable = true;
            showUpdateNotification();
          }
        });
      });
    });
  
  // مراقبة رسائل من الـ SW
  navigator.serviceWorker.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
      showUpdateNotification();
    }
  });
}

// ========================================
// التحقق من التحديثات بشكل دوري
// ========================================

// كل 5 دقائق
setInterval(function() {
  if (navigator.onLine) {
    checkForUpdates();
  }
}, 5 * 60 * 1000);

// عند العودة إلى وضع الاتصال
window.addEventListener('online', function() {
  checkForUpdates();
});

console.log('✅ PWA Update Manager loaded successfully!');
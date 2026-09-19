// ========================================
// MY LIFE HUB - TOAST NOTIFICATIONS
// نظام الرسائل المنبثقة الموحد
// ========================================

/**
 * إظهار رسالة منبثقة (Toast)
 * @param {string} message - نص الرسالة
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - مدة الظهور بالمللي ثانية (افتراضي: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
  // ===== إنشاء الحاوية إن لم تكن موجودة =====
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  // ===== تحديد الأيقونة =====
  const icons = {
    success: 'check-circle',
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'info'
  };
  const iconName = icons[type] || icons.info;

  // ===== إنشاء العنصر =====
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');

  // ===== بناء المحتوى =====
  const iconEl = document.createElement('span');
  iconEl.className = 'toast-icon';
  iconEl.innerHTML = `<span data-lucide="${iconName}"></span>`;

  const messageEl = document.createElement('span');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;

  toast.appendChild(iconEl);
  toast.appendChild(messageEl);
  container.appendChild(toast);

  // ===== إعادة تهيئة أيقونات Lucide =====
  setTimeout(() => {
    if (typeof initLucideIcons === 'function') {
      initLucideIcons();
    }
  }, 30);

  // ===== إخفاء الرسالة بعد المدة =====
  const hideTimer = setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      toast.remove();
      // إزالة الحاوية إن أصبحت فارغة
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, duration);

  // ===== إرجاع دالة الإخفاء الفوري =====
  return {
    dismiss: () => {
      clearTimeout(hideTimer);
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        toast.remove();
        if (container && container.children.length === 0) {
          container.remove();
        }
      }, 300);
    }
  };
}


// ========================================
// تصدير الدالة للاستخدام من ملفات أخرى
// ========================================

window.showToast = showToast;

console.log("✅ Toast loaded successfully!");
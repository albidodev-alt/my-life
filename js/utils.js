// ========================================
// MY LIFE HUB - UTILITIES v2.0
// دوال مساعدة موحدة لكل المشروع
// (Crypto UUID + Enhanced Helpers)
// ========================================

/**
 * تهريب HTML الآمن لمنع XSS
 * @param {string} text - النص المراد تهريبه
 * @returns {string} - النص الآمن
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * إنشاء أيقونة Lucide
 * @param {string} name - اسم الأيقونة
 * @param {Object} options - { size, color, className }
 * @returns {HTMLElement}
 */
function createLucideIcon(name, options = {}) {
  const { size = 16, color = "currentColor", className = "" } = options;
  const span = document.createElement("span");
  span.setAttribute("data-lucide", name);
  span.className = className;
  span.style.cssText = `width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;color:${color};`;
  return span;
}

/**
 * Debounce - تأخير تنفيذ الدالة
 * @param {Function} fn - الدالة
 * @param {number} delay - التأخير بالمللي ثانية
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle - تحديد معدل تنفيذ الدالة
 * @param {Function} fn - الدالة
 * @param {number} limit - الحد الأدنى بين التنفيذات
 * @returns {Function}
 */
function throttle(fn, limit = 300) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * ✅ إنشاء ID فريد (باستخدام crypto.randomUUID إذا متوفر)
 * @returns {string|number}
 */
function generateId() {
  // ✅ استخدام crypto.randomUUID في المتصفحات الحديثة
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // fallback
    }
  }

  // ✅ fallback: timestamp + random + counter
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * تنسيق التاريخ بشكل آمن
 * @param {string} dateString
 * @param {Object} options
 * @returns {string}
 */
function formatDateSafe(dateString, options = {}) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options
  });
}

/**
 * الانتظار
 * @param {number} ms
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * التحقق من كائن فارغ
 * @param {Object} obj
 * @returns {boolean}
 */
function isEmptyObject(obj) {
  return obj && typeof obj === "object" && Object.keys(obj).length === 0;
}

/**
 * ✅ التحقق من وجود إنترنت
 * @returns {boolean}
 */
function isOnline() {
  return navigator.onLine;
}

/**
 * ✅ التحقق من دعم ميزة
 * @param {string} feature
 * @returns {boolean}
 */
function supports(feature) {
  try {
    switch (feature) {
      case 'dvh':
        return CSS.supports('height', '100dvh');
      case 'aspect-ratio':
        return CSS.supports('aspect-ratio', '1');
      case 'backdrop-filter':
        return CSS.supports('backdrop-filter', 'blur(1px)') ||
               CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
      case 'safe-area':
        return CSS.supports('padding-top', 'env(safe-area-inset-top)');
      case 'visualViewport':
        return 'visualViewport' in window;
      case 'crypto.randomUUID':
        return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';
      case 'CompressionStream':
        return typeof CompressionStream !== 'undefined';
      default:
        return false;
    }
  } catch (e) {
    return false;
  }
}

/**
 * ✅ الحصول على حجم الجهاز
 * @returns {string} 'mobile' | 'tablet' | 'desktop'
 */
function getDeviceType() {
  const width = window.innerWidth;
  if (width <= 480) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

/**
 * ✅ التحقق من الوضع الأفقي
 * @returns {boolean}
 */
function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches;
}

/**
 * ✅ التحقق من الوضع الليلي للنظام
 * @returns {boolean}
 */
function prefersDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * ✅ التحقق من تفضيل تقليل الحركة
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * ✅ نسخ نص إلى الحافظة
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // fallback للمتصفحات القديمة
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}

/**
 * ✅ حساب النسبة المئوية
 * @param {number} value
 * @param {number} total
 * @returns {number} 0-100
 */
function percentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * ✅ تقصير نص طويل
 * @param {string} text
 * @param {number} maxLength
 * @param {string} suffix
 * @returns {string}
 */
function truncate(text, maxLength = 50, suffix = '...') {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * ✅ أخذ أول حرف كحرف أولي
 * @param {string} name
 * @returns {string}
 */
function getInitial(name) {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase() || '?';
}

/**
 * ✅ تنسيق حجم الملف
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * ✅ التحقق من صحة التاريخ
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {boolean}
 */
function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr + 'T00:00:00');
  return !isNaN(date.getTime());
}

/**
 * ✅ الحصول على تاريخ اليوم بصيغة YYYY-MM-DD
 * @returns {string}
 */
function getTodayString() {
  const today = new Date();
  return today.getFullYear() + '-' + 
         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
         String(today.getDate()).padStart(2, '0');
}

/**
 * ✅ الحصول على تاريخ الغد بصيغة YYYY-MM-DD
 * @returns {string}
 */
function getTomorrowString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getFullYear() + '-' + 
         String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + 
         String(tomorrow.getDate()).padStart(2, '0');
}

/**
 * ✅ الحصول على التاريخ قبل N يوم بصيغة YYYY-MM-DD
 * @param {number} days
 * @returns {string}
 */
function getDateBefore(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.getFullYear() + '-' + 
         String(date.getMonth() + 1).padStart(2, '0') + '-' + 
         String(date.getDate()).padStart(2, '0');
}

/**
 * ✅ الانتظار حتى يتم تحميل الصورة
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

/**
 * ✅ تشغيل دالة بأمان (catch errors)
 * @param {Function} fn
 * @param {any} fallback
 * @returns {any}
 */
function trySafe(fn, fallback = null) {
  try {
    return fn();
  } catch (err) {
    console.warn('Safe execution failed:', err);
    return fallback;
  }
}

/**
 * ✅ تشغيل Promise بأمان
 * @param {Promise} promise
 * @param {any} fallback
 * @returns {Promise<any>}
 */
async function trySafeAsync(promise, fallback = null) {
  try {
    return await promise;
  } catch (err) {
    console.warn('Safe async execution failed:', err);
    return fallback;
  }
}

/**
 * ✅ التحقق من كون الكائن array-like
 * @param {any} obj
 * @returns {boolean}
 */
function isArrayLike(obj) {
  if (!obj || typeof obj === 'string') return false;
  return typeof obj.length === 'number' && obj.length >= 0;
}

/**
 * ✅ دمج كائنات بأمان
 * @param  {...Object} objects
 * @returns {Object}
 */
function safeMerge(...objects) {
  return objects.reduce((result, obj) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return { ...result, ...obj };
    }
    return result;
  }, {});
}

/**
 * ✅ إزالة القيم المكررة من مصفوفة
 * @param {Array} arr
 * @returns {Array}
 */
function unique(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr)];
}

// ========================================
// ✅ التصدير
// ========================================
window.escapeHtml = escapeHtml;
window.createLucideIcon = createLucideIcon;
window.debounce = debounce;
window.throttle = throttle;
window.generateId = generateId;
window.formatDateSafe = formatDateSafe;
window.sleep = sleep;
window.isEmptyObject = isEmptyObject;

// ✅ دوال جديدة
window.isOnline = isOnline;
window.supports = supports;
window.getDeviceType = getDeviceType;
window.isLandscape = isLandscape;
window.prefersDarkMode = prefersDarkMode;
window.prefersReducedMotion = prefersReducedMotion;
window.copyToClipboard = copyToClipboard;
window.percentage = percentage;
window.truncate = truncate;
window.getInitial = getInitial;
window.formatBytes = formatBytes;
window.isValidDate = isValidDate;
window.getTodayString = getTodayString;
window.getTomorrowString = getTomorrowString;
window.getDateBefore = getDateBefore;
window.loadImage = loadImage;
window.trySafe = trySafe;
window.trySafeAsync = trySafeAsync;
window.isArrayLike = isArrayLike;
window.safeMerge = safeMerge;
window.unique = unique;

// ========================================
// ✅ تأكيد التحميل
// ========================================
console.log("✅ Utils v2.0 loaded successfully!");

// ✅ عرض معلومات البيئة (للتشخيص)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      console.log('🔍 Environment Check:');
      console.log('   - Device:', getDeviceType());
      console.log('   - Online:', isOnline());
      console.log('   - dvh support:', supports('dvh'));
      console.log('   - safe-area support:', supports('safe-area'));
      console.log('   - crypto.randomUUID:', supports('crypto.randomUUID'));
      console.log('   - visualViewport:', supports('visualViewport'));
    } catch (e) {
      // تجاهل
    }
  }, 1000);
}
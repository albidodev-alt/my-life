// ========================================
// MY LIFE HUB - UTILITIES
// دوال مساعدة موحدة لكل المشروع
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
 * إنشاء ID فريد
 * @returns {number}
 */
function generateId() {
  return Date.now() + Math.random() * 1000;
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

// ===== التصدير =====
window.escapeHtml = escapeHtml;
window.createLucideIcon = createLucideIcon;
window.debounce = debounce;
window.throttle = throttle;
window.generateId = generateId;
window.formatDateSafe = formatDateSafe;
window.sleep = sleep;
window.isEmptyObject = isEmptyObject;

console.log("✅ Utils loaded successfully!");
// ========================================
// MY LIFE HUB - THEME MANAGER v2.0
// نظام إدارة الثيمات (Light / Dark فقط - بدون تلقائي)
// ========================================

const THEME_STORAGE_KEY = 'myLifeHub_theme';

// ===== الحالات المتاحة (بدون AUTO) =====
const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// ===== كاش للحالة الحالية =====
let currentThemeMode = 'light';

// ========================================
// 1. قراءة الثيم المحفوظ
// ========================================
function getSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    // ✅ إذا كان المحفوظ "auto" (من إصدار قديم)، نرجعه "light" كافتراضي
    if (saved === THEME_MODES.LIGHT || saved === THEME_MODES.DARK) {
      return saved;
    }
    if (saved === 'auto') {
      // ترقية المستخدمين القدامى: auto يصبح light
      localStorage.setItem(THEME_STORAGE_KEY, THEME_MODES.LIGHT);
      return THEME_MODES.LIGHT;
    }
  } catch (e) {
    console.warn('Failed to read theme:', e);
  }
  return THEME_MODES.LIGHT; // ✅ الافتراضي: فاتح
}

// ========================================
// 2. تطبيق الثيم على الـ DOM
// ========================================
function applyTheme(mode) {
  const root = document.documentElement;
  const body = document.body;

  // ✅ data-theme attribute
  root.setAttribute('data-theme', mode);
  root.setAttribute('data-theme-mode', mode);

  // ✅ class على <html> و <body>
  if (mode === THEME_MODES.DARK) {
    root.classList.add('dark-mode');
    if (body) body.classList.add('dark-mode');
  } else {
    root.classList.remove('dark-mode');
    if (body) body.classList.remove('dark-mode');
  }

  // ✅ تحديث meta theme-color
  updateMetaThemeColor(mode);

  // ✅ تحديث أي عناصر تعرض الحالة
  updateThemeUI();

  // ✅ dispatch event
  window.dispatchEvent(new CustomEvent('themechange', {
    detail: { mode }
  }));

  console.log(`🎨 Theme applied: ${mode}`);
}

// ========================================
// 3. تحديث meta theme-color
// ========================================
function updateMetaThemeColor(mode) {
  const metaTags = document.querySelectorAll('meta[name="theme-color"]');
  metaTags.forEach(meta => {
    if (meta.getAttribute('media')) {
      return;
    }
    meta.setAttribute('content', mode === THEME_MODES.DARK ? '#1a2d4a' : '#4f8edb');
  });
}

// ========================================
// 4. تعيين الثيم (وتحفظ)
// ========================================
function setTheme(mode) {
  if (mode !== THEME_MODES.LIGHT && mode !== THEME_MODES.DARK) {
    console.warn('Invalid theme mode:', mode);
    return false;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (e) {
    console.warn('Failed to save theme:', e);
    return false;
  }

  currentThemeMode = mode;
  applyTheme(mode);
  return true;
}

// ========================================
// 5. تبديل سريع (light ↔ dark)
// ========================================
function toggleTheme() {
  const next = currentThemeMode === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK;
  setTheme(next);
  return next;
}

// ========================================
// 6. الحصول على الثيم الحالي
// ========================================
function getThemeMode() {
  return currentThemeMode;
}

function getThemeEffective() {
  return currentThemeMode; // لم يعد هناك "auto"، فالفعال هو نفسه المختار
}

// ========================================
// 7. تحديث واجهة الثيم
// ========================================
function updateThemeUI() {
  const rowValue = document.getElementById('theme-row-value');
  if (rowValue && typeof getThemeModeDisplayName === 'function') {
    rowValue.textContent = getThemeModeDisplayName(currentThemeMode);
  }

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.setAttribute('data-theme', currentThemeMode);
  }
}

// ========================================
// 8. التهيئة الأولى
// ========================================
function initTheme() {
  currentThemeMode = getSavedTheme();
  applyTheme(currentThemeMode);
  console.log(`✅ Theme initialized: ${currentThemeMode}`);
}

// ✅ تشغيل التهيئة فوراً
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

// ========================================
// ✅ التصدير
// ========================================
window.THEME_MODES = THEME_MODES;
window.getSavedTheme = getSavedTheme;
window.getThemeMode = getThemeMode;
window.getThemeEffective = getThemeEffective;
window.getEffectiveTheme = getThemeEffective;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;
window.initTheme = initTheme;

console.log('✅ Theme.js v2.0 loaded successfully! (No Auto Mode)');
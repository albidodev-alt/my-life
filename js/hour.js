// ========================================
// MY LIFE - HOUR SYSTEM (12h / 24h) v2.0
// نظام الساعات (12 ساعة / 24 ساعة)
// (Optimized: Uses Cached Values)
// ========================================

// ========================================
// دوال مساعدة
// ========================================

/**
 * ✅ الحصول على نظام الساعات (مع كاش)
 */
function getHourSystem() {
    // استخدام الكاش أولاً
    if (typeof window.getCachedHourSystem === 'function') {
        const cached = window.getCachedHourSystem();
        if (cached) return cached;
    }

    // fallback
    try {
        return localStorage.getItem('hourSystem') || '12h';
    } catch (e) {
        return '12h';
    }
}

/**
 * ✅ تعيين نظام الساعات
 * ملاحظة: لا يتم إعادة التوجيه تلقائياً.
 * المستخدم يبقى في الصفحة الحالية.
 */
function setHourSystem(system) {
    if (system !== '12h' && system !== '24h') {
        console.warn('setHourSystem: invalid value:', system);
        return;
    }

    try {
        localStorage.setItem('hourSystem', system);
    } catch (e) {
        console.warn('Failed to save hourSystem:', e);
    }

    // ✅ تحديث الكاش
    if (typeof window.updateCachedHourSystem === 'function') {
        window.updateCachedHourSystem(system);
    }

    console.log('✅ Hour system changed to:', system);
}

/**
 * ✅ الحصول على اللغة (مع كاش)
 */
function _getLanguage() {
    if (typeof window.getCachedLanguage === 'function') {
        const cached = window.getCachedLanguage();
        if (cached) return cached;
    }

    try {
        return localStorage.getItem('language') || 'en';
    } catch (e) {
        return 'en';
    }
}

// ========================================
// تنسيق الوقت
// ========================================

/**
 * تنسيق الوقت حسب النظام المختار
 */
function formatTime(hour, minute = 0) {
    const system = getHourSystem();

    if (system === '24h') {
        // نظام 24 ساعة
        return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
    } else {
        // نظام 12 ساعة
        const isArabic = _getLanguage() === 'ar';
        const h12 = hour % 12 || 12;
        const m = String(minute).padStart(2, '0');
        const ampm = isArabic ? (hour >= 12 ? 'مساءً' : 'صباحاً') : (hour >= 12 ? 'PM' : 'AM');
        return h12 + ':' + m + ' ' + ampm;
    }
}

/**
 * تنسيق نطاق الساعات (مثلاً: 9:00 - 10:00)
 */
function formatHourRange(h) {
    const system = getHourSystem();

    if (system === '24h') {
        return String(h).padStart(2, '0') + ':00 - ' + String(h + 1).padStart(2, '0') + ':00';
    } else {
        const f = h => ((h % 12) || 12) + ':00 ' + (h >= 12 ? 'PM' : 'AM');
        return f(h) + ' - ' + f(h + 1);
    }
}

// ========================================
// تصدير الدوال
// ========================================

window.getHourSystem = getHourSystem;
window.setHourSystem = setHourSystem;
window.formatTime = formatTime;
window.formatHourRange = formatHourRange;

console.log('✅ Hour.js v2.0 loaded successfully!');
// ========================================
// MY LIFE - HOUR SYSTEM (12h / 24h)
// نظام الساعات (12 ساعة / 24 ساعة)
// ========================================

// ========================================
// دوال مساعدة
// ========================================

function getHourSystem() {
    return localStorage.getItem('hourSystem') || '12h';
}

function setHourSystem(system) {
    localStorage.setItem('hourSystem', system);
    // تحديث الصفحة الحالية
    if (typeof navigateTo === 'function') {
        navigateTo('routine');
    }
}

// تنسيق الوقت حسب النظام المختار
function formatTime(hour, minute = 0) {
    const system = getHourSystem();
    
    if (system === '24h') {
        // نظام 24 ساعة
        return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
    } else {
        // نظام 12 ساعة
        const isArabic = localStorage.getItem('language') === 'ar';
        const h12 = hour % 12 || 12;
        const m = String(minute).padStart(2, '0');
        const ampm = isArabic ? (hour >= 12 ? 'مساءً' : 'صباحاً') : (hour >= 12 ? 'PM' : 'AM');
        return h12 + ':' + m + ' ' + ampm;
    }
}

// تنسيق نطاق الساعات (مثلاً: 9:00 - 10:00)
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

console.log('✅ Hour.js loaded successfully!');
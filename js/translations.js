// ========================================
// MY LIFE - TRANSLATION SYSTEM
// نظام الترجمة المتكامل (يدعم الملفات الخارجية)
// ========================================

let currentLanguage = 'en';
let translations = {};

// ========================================
// تحميل الترجمات من الملفات الخارجية
// ========================================

function loadTranslationsFromFiles() {
    try {
        // التحقق من وجود الترجمات في النطاق العام
        if (typeof translationsEN !== 'undefined' && translationsEN) {
            translations = translationsEN;
            console.log('✅ English translations loaded');
            return true;
        }
        if (typeof translationsAR !== 'undefined' && translationsAR) {
            translations = translationsAR;
            console.log('✅ Arabic translations loaded');
            return true;
        }
        if (typeof translationsFR !== 'undefined' && translationsFR) {
            translations = translationsFR;
            console.log('✅ French translations loaded');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading translations from files:', error);
        return false;
    }
}

// ========================================
// تحميل الترجمة حسب اللغة
// ========================================

function loadTranslations(lang) {
    try {
        switch (lang) {
            case 'en':
                if (typeof translationsEN !== 'undefined' && translationsEN) {
                    translations = translationsEN;
                    currentLanguage = 'en';
                    localStorage.setItem('language', 'en');
                    console.log('✅ Language loaded: English');
                    return translations;
                }
                break;
                
            case 'ar':
                if (typeof translationsAR !== 'undefined' && translationsAR) {
                    translations = translationsAR;
                    currentLanguage = 'ar';
                    localStorage.setItem('language', 'ar');
                    console.log('✅ Language loaded: العربية');
                    return translations;
                }
                break;
                
            case 'fr':
                if (typeof translationsFR !== 'undefined' && translationsFR) {
                    translations = translationsFR;
                    currentLanguage = 'fr';
                    localStorage.setItem('language', 'fr');
                    console.log('✅ Language loaded: Français');
                    return translations;
                }
                break;
                
            default:
                console.warn('⚠️ Language not found, falling back to English');
                if (typeof translationsEN !== 'undefined' && translationsEN) {
                    translations = translationsEN;
                    currentLanguage = 'en';
                    localStorage.setItem('language', 'en');
                    return translations;
                }
        }
        
        // إذا لم توجد اللغة المطلوبة، نستخدم أول ملف متاح
        return loadTranslationsFromFiles() || {};
        
    } catch (error) {
        console.error('Error loading translations:', error);
        return {};
    }
}

// ========================================
// الحصول على ترجمة نص
// ========================================

function t(key, defaultValue = '') {
    if (translations && translations[key]) {
        return translations[key];
    }
    return defaultValue || key;
}

// ========================================
// ترجمة أيام الأسبوع
// ========================================

function translateDay(dayName) {
    const dayMap = {
        'sunday': 'sunday',
        'monday': 'monday',
        'tuesday': 'tuesday',
        'wednesday': 'wednesday',
        'thursday': 'thursday',
        'friday': 'friday',
        'saturday': 'saturday',
        'Sunday': 'sunday',
        'Monday': 'monday',
        'Tuesday': 'tuesday',
        'Wednesday': 'wednesday',
        'Thursday': 'thursday',
        'Friday': 'friday',
        'Saturday': 'saturday'
    };
    
    const key = dayMap[dayName];
    if (key && translations[key]) {
        return translations[key];
    }
    return dayName;
}

// ========================================
// تطبيق الترجمة على جميع العناصر
// ========================================

function applyTranslations() {
    // ❌ لا نترجم اسم الموقع - نتركه "My Life" دائماً

    // ✅ تحديث أزرار الـ Sidebar
    const navBtns = document.querySelectorAll('.nav-btn');
    const navTargets = ['routine', 'task', 'completed', 'notes', 'events', 'program'];
    navBtns.forEach((btn, index) => {
        if (index < navTargets.length) {
            const target = navTargets[index];
            btn.textContent = t(target, target.charAt(0).toUpperCase() + target.slice(1));
        }
    });

    // ✅ تحديث أزرار الـ Bottom Navigation
    const bottomBtns = document.querySelectorAll('.bottom-nav-btn');
    const bottomTargets = ['routine', 'task', 'events', 'program'];
    bottomBtns.forEach((btn, index) => {
        if (index < bottomTargets.length) {
            const target = bottomTargets[index];
            const label = btn.querySelector('.bn-label');
            if (label) {
                label.textContent = t(target, target.charAt(0).toUpperCase() + target.slice(1));
            }
        }
    });

    // ✅ تحديث زر Notes FAB (tooltip)
    const fabBtn = document.getElementById('notes-fab-btn');
    if (fabBtn) {
        fabBtn.setAttribute('aria-label', t('notes', 'Notes'));
    }

    // ✅ تحديث أيام الأسبوع في صفحة الروتين
    translateWeekDays();

    console.log('✅ Translations applied for language:', currentLanguage);
}

// ========================================
// ترجمة أيام الأسبوع في صفحة الروتين
// ========================================

function translateWeekDays() {
    const dayCards = document.querySelectorAll('.day-card');
    dayCards.forEach(function(card) {
        const dayBtn = card.querySelector('.day-btn');
        if (dayBtn) {
            const dayName = dayBtn.textContent.trim();
            const translated = translateDay(dayName);
            if (translated !== dayName) {
                dayBtn.textContent = translated;
            }
        }
    });
}

// ========================================
// تغيير اللغة
// ========================================

function changeLanguage(lang) {
    if (lang === currentLanguage) return;
    
    const success = loadTranslations(lang);
    if (success && Object.keys(success).length > 0) {
        applyTranslations();
        updateLanguageSelector();
        
        // تحديث الصفحة الحالية
        const currentPage = document.querySelector('.nav-btn.active')?.dataset.target || 'routine';
        if (typeof navigateTo === 'function') {
            navigateTo(currentPage);
        }
        
        const langNames = {
            'en': 'English',
            'ar': 'العربية',
            'fr': 'Français'
        };
        
        if (typeof showToast === 'function') {
            showToast(`🌐 Language changed to ${langNames[lang] || lang}`, 'success');
        } else {
            console.log(`✅ Language changed to ${langNames[lang] || lang}`);
        }
    }
}

// ========================================
// تحديث محدد اللغة في الإعدادات
// ========================================

function updateLanguageSelector() {
    const selector = document.getElementById('language-select');
    if (selector) {
        selector.value = currentLanguage;
    }
}

// ========================================
// تهيئة نظام الترجمة
// ========================================

function initTranslations() {
    const savedLang = localStorage.getItem('language') || 'en';
    console.log('📌 Saved language:', savedLang);
    
    const loaded = loadTranslations(savedLang);
    
    if (!loaded || Object.keys(loaded).length === 0) {
        console.warn('⚠️ Could not load translations, using fallback');
        loadTranslationsFromFiles();
    }
    
    applyTranslations();
    updateLanguageSelector();
    
    console.log('✅ Translation system initialized with language:', currentLanguage);
    return Promise.resolve();
}

// ========================================
// تصدير الدوال للاستخدام من ملفات أخرى
// ========================================

window.t = t;
window.translateDay = translateDay;
window.loadTranslations = loadTranslations;
window.applyTranslations = applyTranslations;
window.initTranslations = initTranslations;
window.changeLanguage = changeLanguage;
window.updateLanguageSelector = updateLanguageSelector;
window.translateWeekDays = translateWeekDays;

console.log('✅ Translation system loaded successfully!');
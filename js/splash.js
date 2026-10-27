// ========================================
// MY LIFE HUB - SPLASH SCREEN v1.0
// (Auto-hide + Min display time + Preload readiness)
// ========================================

(function () {
  'use strict';

  const MIN_DISPLAY_TIME = 1800; // 1.8 ثانية كحد أدنى
  const MAX_DISPLAY_TIME = 5000; // 5 ثواني كحد أقصى (حماية)

  const splashStartTime = Date.now();
  let splashHidden = false;

  /**
   * إخفاء شاشة الترحيب بسلاسة
   */
  function hideSplash() {
    if (splashHidden) return;
    splashHidden = true;

    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    const elapsed = Date.now() - splashStartTime;
    const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

    setTimeout(function () {
      splash.classList.add('splash-hidden');

      setTimeout(function () {
        if (splash.parentNode) {
          splash.parentNode.removeChild(splash);
        }
        console.log('✅ Splash screen removed');
      }, 700);
    }, remaining);
  }

  /**
   * الانتظار حتى يكتمل تحميل كل شيء
   */
  function waitForReady() {
    if (document.readyState === 'complete') {
      hideSplash();
      return;
    }

    window.addEventListener('load', function () {
      setTimeout(hideSplash, 300);
    });

    setTimeout(function () {
      if (!splashHidden) {
        console.warn('⚠️ Splash timed out, forcing hide');
        hideSplash();
      }
    }, MAX_DISPLAY_TIME);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForReady);
  } else {
    waitForReady();
  }

  window.dismissSplash = hideSplash;

  console.log('✅ Splash.js loaded');
})();
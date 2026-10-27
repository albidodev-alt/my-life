// ========================================
// MY LIFE HUB - MAIN v4.0
// (Lazy Loading + Dynamic Imports + Async Navigation + Performance Optimized)
// ========================================

let mainAbortController = null;
let currentPage = null;
let notificationInterval = null;

// ========================================
// ✅ Cached Settings (تحسين الأداء)
// ========================================
let cachedLanguage = (typeof localStorage !== 'undefined')
  ? (localStorage.getItem('language') || 'en')
  : 'en';

let cachedHourSystem = (typeof localStorage !== 'undefined')
  ? (localStorage.getItem('hourSystem') || '12h')
  : '12h';

function getCachedLanguage() {
  return cachedLanguage;
}

function getCachedHourSystem() {
  return cachedHourSystem;
}

function updateCachedLanguage(lang) {
  cachedLanguage = lang || 'en';
}

function updateCachedHourSystem(system) {
  cachedHourSystem = system || '12h';
}

window.getCachedLanguage = getCachedLanguage;
window.getCachedHourSystem = getCachedHourSystem;
window.updateCachedLanguage = updateCachedLanguage;
window.updateCachedHourSystem = updateCachedHourSystem;

window.addEventListener('storage', function (e) {
  if (e.key === 'language' && e.newValue) {
    cachedLanguage = e.newValue;
    console.log('🔄 Language updated from another tab:', cachedLanguage);
  }
  if (e.key === 'hourSystem' && e.newValue) {
    cachedHourSystem = e.newValue;
    console.log('🔄 HourSystem updated from another tab:', cachedHourSystem);
  }
});

// ========================================
// ✅ Lucide Icons - Debounced + Lazy-aware
// ========================================
let lucideTimer = null;
let lucidePending = false;
let lucideInitialized = false;

function debouncedLucide(delay = 50) {
  if (lucideTimer) return;

  lucidePending = true;

  lucideTimer = setTimeout(() => {
    lucideTimer = null;

    if (!lucidePending) return;
    lucidePending = false;

    if (typeof lucide !== "undefined" && lucide.createIcons) {
      try {
        lucide.createIcons();
        lucideInitialized = true;
      } catch (e) {
        console.warn("Lucide render error:", e);
      }
    }
  }, delay);
}

function initLucideIcons() {
  debouncedLucide(50);
}

function forceLucideRender() {
  if (lucideTimer) {
    clearTimeout(lucideTimer);
    lucideTimer = null;
  }
  lucidePending = false;

  if (typeof lucide !== "undefined" && lucide.createIcons) {
    try {
      lucide.createIcons();
      lucideInitialized = true;
    } catch (e) {
      console.warn("Lucide render error:", e);
    }
  }
}

window.debouncedLucide = debouncedLucide;
window.initLucideIcons = initLucideIcons;
window.forceLucideRender = forceLucideRender;

// ========================================
// ✅ Performance Marks
// ========================================
function perfMark(name) {
  if (typeof performance !== "undefined" && performance.mark) {
    try { performance.mark(name); } catch (e) {}
  }
}

function perfMeasure(name, startMark, endMark) {
  if (typeof performance !== "undefined" && performance.measure) {
    try { performance.measure(name, startMark, endMark); } catch (e) {}
  }
}

// ========================================
// Error Boundary
// ========================================
function safeRender(renderFn, fallbackMessage = "Something went wrong") {
  try {
    renderFn();
  } catch (error) {
    console.error("❌ Render error:", error);
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
          <div style="font-size:64px;margin-bottom:16px;">⚠️</div>
          <h2 style="color:var(--text-primary);margin-bottom:8px;"></h2>
          <p style="font-size:14px;margin-bottom:24px;"></p>
          <button onclick="location.reload()" style="padding:12px 24px;background:var(--primary-gradient);color:white;border:none;border-radius:10px;cursor:pointer;font-family:var(--font-handwritten);font-size:16px;font-weight:600;min-height:48px;">
            🔄 Reload Page
          </button>
        </div>
      `;
      const h2 = app.querySelector('h2');
      const p = app.querySelector('p');
      if (h2) h2.textContent = fallbackMessage;
      if (p) p.textContent = error.message || "Unknown error";
    }
  }
}
window.safeRender = safeRender;

// ========================================
// ✅ Lazy Loading Manager
// ========================================
const moduleCache = {
  day: null,
  task: null,
  achievements: null,
  note: null,
  events: null,
  program: null,
  drops: null
};

const modulePaths = {
  day: './day.js',
  task: './task.js',
  achievements: './achievements.js',
  note: './note.js',
  events: './events.js',
  program: './program.js',
  drops: './drops.js'
};

/**
 * ✅ تحميل وحدة (module) بشكل ديناميكي مع كاش
 * @param {string} moduleName - اسم الوحدة
 * @returns {Promise<void>}
 */
async function loadModule(moduleName) {
  // ✅ إذا كانت محمّلة مسبقاً → لا تُحمّلها مرة أخرى
  if (moduleCache[moduleName]) {
    return moduleCache[moduleName];
  }

  const path = modulePaths[moduleName];
  if (!path) {
    console.warn(`⚠️ Unknown module: ${moduleName}`);
    return;
  }

  try {
    console.log(`📌 Loading ${moduleName}.js dynamically...`);
    moduleCache[moduleName] = import(path);
    await moduleCache[moduleName];
    console.log(`✅ ${moduleName}.js loaded successfully`);
  } catch (error) {
    console.error(`❌ Failed to load ${moduleName}.js:`, error);
    moduleCache[moduleName] = null; // اسمح بإعادة المحاولة
    throw error;
  }
}

window.loadModule = loadModule;

// ========================================
// ✅ Page Initializers (with Lazy Loading)
// ========================================
const pageInitializers = {
  routine: async () => {
    if (typeof renderWeek === "undefined") {
      await loadModule('day'); // day.js يحتوي على renderWeek في بعض الحالات
    }
    if (typeof renderWeek === "function") renderWeek();
  },

  task: async () => {
    if (typeof renderTasks === "undefined") {
      await loadModule('task');
    }
    if (typeof renderTasks === "function") renderTasks();
  },

  completed: async () => {
    if (typeof window.renderCompleted === "undefined") {
      await loadModule('achievements');
    }
    if (typeof window.renderCompleted === "function") {
      window.renderCompleted();
    } else if (typeof renderCompleted === "function") {
      renderCompleted();
    } else {
      renderCompletedFallback();
    }
  },

  notes: async () => {
    if (typeof window.renderNotesPageV2 === "undefined") {
      await loadModule('note');
    }
    if (typeof window.renderNotesPageV2 === "function") {
      window.renderNotesPageV2();
    } else {
      renderNotesPage();
    }
  },

  events: async () => {
    if (typeof renderEventsPage === "undefined") {
      await loadModule('events');
    }
    if (typeof renderEventsPage === "function") renderEventsPage();
  },

  program: async () => {
    if (typeof window.renderProgramPage === "undefined") {
      await loadModule('program');
    }
    if (typeof window.renderProgramPage === "function") {
      window.renderProgramPage();
    } else if (typeof renderProgramPage === "function") {
      renderProgramPage();
    } else {
      renderProgramFallback();
    }
  }
};

// ========================================
// ✅ Keyboard Detection (Mobile)
// ========================================
function setupKeyboardDetection() {
  if (!window.visualViewport) return;

  const body = document.body;
  let initialHeight = window.visualViewport.height;
  let rafId = null;

  function handleViewportResize() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const currentHeight = window.visualViewport.height;
      const isKeyboardOpen = currentHeight < initialHeight * 0.75;

      if (isKeyboardOpen) {
        if (!body.classList.contains('keyboard-open')) {
          body.classList.add('keyboard-open');
        }
      } else {
        if (body.classList.contains('keyboard-open')) {
          body.classList.remove('keyboard-open');
        }
      }
    });
  }

  window.visualViewport.addEventListener('resize', handleViewportResize);

  window.addEventListener('orientationchange', function () {
    setTimeout(() => {
      initialHeight = window.visualViewport.height;
    }, 300);
  });
}

// ========================================
// ✅ Scroll Performance Optimization (Mobile)
// ✅ إضافة body.is-scrolling أثناء التمرير لتعطيل animations
// ========================================
function setupScrollPerformance() {
  const app = document.getElementById('app');
  if (!app) return;

  let scrollTimer = null;
  let rafId = null;

  app.addEventListener('scroll', function () {
    // ✅ استخدام requestAnimationFrame للأداء الأمثل
    if (rafId) return;

    rafId = requestAnimationFrame(function () {
      rafId = null;

      if (!document.body.classList.contains('is-scrolling')) {
        document.body.classList.add('is-scrolling');
      }

      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        document.body.classList.remove('is-scrolling');
        scrollTimer = null;
      }, 120);
    });
  }, { passive: true });
}

// ========================================
// ✅ Visibility-Aware Notification Timer
// ========================================
function startNotificationTimer() {
  if (notificationInterval) return;

  notificationInterval = setInterval(function () {
    if (!document.hidden && typeof refreshNotifications === "function") {
      refreshNotifications();
    }
  }, 15 * 60 * 1000);
}

function stopNotificationTimer() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}

function setupVisibilityAwareTimers() {
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopNotificationTimer();
    } else {
      startNotificationTimer();
      if (typeof refreshNotifications === "function") {
        refreshNotifications();
      }
    }
  });

  if (!document.hidden) {
    startNotificationTimer();
  }
}

// ========================================
// DOMContentLoaded
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  perfMark("app-start");

  // ✅ تهيئة اللغة أولاً
  if (typeof initTranslations === "function") {
    initTranslations().then(function () {
      console.log("✅ Translations ready");
    });
  }

  updateUserHeader();
  setupNavigation();
  setupProfileButton();
  setupSidebarToggle();
  setupBottomNav();
  setupKeyboardDetection();
  setupScrollPerformance();  // ✅ جديد

  const notesFabBtn = document.getElementById("notes-fab-btn");
  if (notesFabBtn) {
    notesFabBtn.addEventListener("click", function () {
      navigateTo("notes");
    });
  }

  if (typeof setupNotificationButton === "function") {
    setupNotificationButton();
  }

  // ✅ الإشعارات تُؤخّر حتى بعد load
  initPWA();
  navigateTo("routine");
  initLucideIcons();

  perfMark("app-ready");
  perfMeasure("app-init", "app-start", "app-ready");

  // ========================================
  // ✅ تأخير الإشعارات حتى بعد load + 2 ثانية
  // ========================================
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (typeof refreshNotifications === "function") {
        refreshNotifications();
      }
      if (typeof setupVisibilityAwareTimers === "function") {
        setupVisibilityAwareTimers();
      }
    }, 2000);
  });
});

// ========================================
// Navigation (Async + Lazy Loading)
// ========================================
async function navigateTo(page) {
  const app = document.getElementById("app");
  if (!app) return;

  // ✅ إلغاء أي عملية سابقة
  if (mainAbortController) {
    mainAbortController.abort();
    mainAbortController = null;
  }

  mainAbortController = new AbortController();

  // ✅ تحديث الأزرار النشطة
  document.querySelectorAll(".nav-btn").forEach(function (button) {
    button.classList.toggle("active", button.dataset.target === page);
  });

  document.querySelectorAll(".bottom-nav-btn").forEach(function (button) {
    button.classList.toggle("active", button.dataset.target === page);
  });

  updateNavTranslations();
  currentPage = page;

  perfMark(`page-${page}-start`);

  const initializer = pageInitializers[page];

  try {
    if (initializer) {
      await initializer();
    } else {
      renderNotFoundPage();
    }
  } catch (error) {
    console.error(`❌ Error loading page "${page}":`, error);
    safeRender(() => {
      const appEl = document.getElementById("app");
      if (appEl) {
        appEl.innerHTML = `
          <div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
            <div style="font-size:64px;margin-bottom:16px;">⚠️</div>
            <h2 style="color:var(--text-primary);margin-bottom:8px;">Failed to load page</h2>
            <p style="font-size:14px;margin-bottom:24px;">${error.message || 'Unknown error'}</p>
            <button onclick="location.reload()" style="padding:12px 24px;background:var(--primary-gradient);color:white;border:none;border-radius:10px;cursor:pointer;font-family:var(--font-handwritten);font-size:16px;font-weight:600;min-height:48px;">
              🔄 Reload Page
            </button>
          </div>
        `;
      }
    });
  }

  perfMark(`page-${page}-end`);
  perfMeasure(`page-${page}`, `page-${page}-start`, `page-${page}-end`);

  debouncedLucide(50);
}

// ========================================
// Setup Functions
// ========================================
function setupNavigation() {
  document.querySelectorAll(".nav-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      navigateTo(button.dataset.target);
    });
  });
}

function setupBottomNav() {
  document.querySelectorAll(".bottom-nav-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      navigateTo(button.dataset.target);
    });
  });
}

function updateNavTranslations() {
  if (typeof t !== "function") return;

  const navTargets = ["routine", "task", "completed", "notes", "events", "program"];
  document.querySelectorAll(".nav-btn").forEach(function (btn, index) {
    if (index < navTargets.length) {
      const target = navTargets[index];
      btn.textContent = t(target, target.charAt(0).toUpperCase() + target.slice(1));
    }
  });

  const bottomTargets = ["routine", "task", "events", "program"];
  document.querySelectorAll(".bottom-nav-btn").forEach(function (btn, index) {
    if (index < bottomTargets.length) {
      const target = bottomTargets[index];
      const label = btn.querySelector(".bn-label");
      if (label) {
        label.textContent = t(target, target.charAt(0).toUpperCase() + target.slice(1));
      }
    }
  });
}

function setupProfileButton() {
  const profileButton = document.getElementById("user-profile-btn");
  if (!profileButton) return;

  profileButton.addEventListener("click", function () {
    document.querySelectorAll(".nav-btn, .bottom-nav-btn").forEach(function (button) {
      button.classList.remove("active");
    });
    if (typeof renderProfile === "function") renderProfile();
  });
}

function setupSidebarToggle() {
  const toggleBtn = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  if (!toggleBtn || !sidebar) return;

  const isClosed = localStorage.getItem("sidebarClosed") === "true";
  if (isClosed) {
    sidebar.classList.add("closed");
    toggleBtn.classList.add("active");
  }

  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("closed");
    this.classList.toggle("active");
    localStorage.setItem("sidebarClosed", sidebar.classList.contains("closed"));
  });
}

// ========================================
// Render Fallbacks
// ========================================
function renderCompletedFallback() {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `
    <h2>✅ Completed Tasks</h2>
    <div style="padding:40px;text-align:center;color:var(--text-muted);">
      <p style="font-size:18px;margin-bottom:16px;">⚠️ The Achievements module couldn't be loaded.</p>
      <button onclick="location.reload()" style="padding:12px 24px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;font-family:var(--font-handwritten);font-size:16px;font-weight:600;">🔄 Refresh Page</button>
    </div>
  `;
}

function renderProgramFallback() {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `
    <div style="padding:40px;text-align:center;color:var(--text-muted);">
      <h3>⚠️ Program module not loaded</h3>
      <p>Please check that program.js is loaded correctly.</p>
      <button onclick="location.reload()" style="padding:10px 24px;margin-top:16px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;">Reload</button>
    </div>
  `;
}

function renderNotesPage() {
  const app = document.getElementById("app");
  if (!app) return;
  app.replaceChildren();

  if (typeof renderNotesPageV2 === "function") {
    renderNotesPageV2();
    return;
  }

  const section = document.createElement("section");
  section.className = "page-section";

  const h2 = document.createElement("h2");
  h2.textContent = typeof t === "function" ? t("notes", "📝 Notes") : "📝 Notes";
  section.appendChild(h2);

  const p = document.createElement("p");
  p.className = "page-description";
  p.textContent = typeof t === "function" ? t("notes", "Write down anything you want to remember.") : "Write down anything you want to remember.";
  section.appendChild(p);

  const notesDiv = document.createElement("div");
  notesDiv.id = "notes-panel-content";
  section.appendChild(notesDiv);
  app.appendChild(section);

  if (typeof renderNotesPanel === "function") renderNotesPanel();
}

function renderNotFoundPage() {
  const app = document.getElementById("app");
  if (!app) return;
  app.replaceChildren();

  const section = document.createElement("section");
  section.className = "page-section";
  const h2 = document.createElement("h2");
  h2.textContent = "Page not found";
  section.appendChild(h2);

  const p = document.createElement("p");
  p.className = "empty-message";
  p.textContent = "The requested page does not exist.";
  section.appendChild(p);
  app.appendChild(section);
}

// ========================================
// User Header
// ========================================
function updateUserHeader() {
  if (typeof getProfileData !== "function") return;

  const profile = getProfileData();
  const avatarImg = document.getElementById("user-avatar-icon");
  const nameSpan = document.getElementById("user-name-icon");

  if (nameSpan) nameSpan.textContent = profile.name || "User 1";
  if (avatarImg) {
    avatarImg.src = profile.avatar || createDefaultAvatar(profile.name || "User 1");
  }
}

function createDefaultAvatar(name) {
  const firstLetter = (name || "U").trim().charAt(0).toUpperCase() || "U";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#4f8edb"/><text x="20" y="26" text-anchor="middle" font-size="18" font-family="Arial" fill="white">${firstLetter}</text></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

// ========================================
// PWA SUPPORT
// ========================================
let deferredPrompt = null;

function initPWA() {
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    console.log("📌 App install prompt available");
    showInstallButtons(true);
  });

  window.addEventListener("appinstalled", function () {
    console.log("✅ App installed successfully!");
    deferredPrompt = null;
    showInstallButtons(false);
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(function (registration) {
        console.log("✅ ServiceWorker registered successfully");

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('📌 New ServiceWorker found');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✅ New content available; please refresh.');
              if (typeof showUpdateNotification === "function") {
                showUpdateNotification();
              }
            }
          });
        });

        if (registration.waiting) {
          setTimeout(function () {
            if (typeof showUpdateNotification === "function") {
              showUpdateNotification();
            }
          }, 2000);
        }
      })
      .catch(function (error) {
        console.warn("⚠️ ServiceWorker registration failed:", error);
      });
  }

  addProfileInstallButton();
}

function showInstallButtons(show) {
  const profileBtn = document.getElementById("profile-install-btn");
  if (profileBtn) profileBtn.style.display = show ? "flex" : "none";
}

function addProfileInstallButton() {
  const observer = new MutationObserver(function () {
    const profileSection = document.getElementById("settings-section");
    if (profileSection && !document.getElementById("profile-install-btn")) {
      const installBtn = document.createElement("button");
      installBtn.id = "profile-install-btn";
      installBtn.style.cssText = "width:100%;padding:12px 20px;background:var(--primary-gradient);color:white;border:none;border-radius:10px;font-family:var(--font-handwritten);font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s ease;margin-top:12px;display:none;align-items:center;justify-content:center;gap:10px;min-height:48px;";
      installBtn.innerHTML = "📲 Install App";
      installBtn.addEventListener("click", handleInstallClick);
      profileSection.parentNode.insertBefore(installBtn, profileSection.nextSibling);

      if (!window.matchMedia("(display-mode: standalone)").matches && deferredPrompt) {
        installBtn.style.display = "flex";
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function handleInstallClick() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function (choice) {
      if (choice.outcome === "accepted") {
        showInstallButtons(false);
      }
      deferredPrompt = null;
    });
  } else {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      infoModal({
        title: typeof t === "function" ? t("app_installed", "App Already Installed") : "App Already Installed",
        message: "The app is already installed on your device.",
        icon: "check-circle",
        iconType: "success",
        confirmLabel: typeof t === "function" ? t("close", "OK") : "OK"
      });
    } else {
      infoModal({
        title: typeof t === "function" ? t("install_app", "Install App") : "Install App",
        message: "To install this app:\n\n• On Chrome: Tap the menu (⋮) → \"Install App\"\n• On Safari: Tap Share → \"Add to Home Screen\"\n• On Firefox: Tap the menu → \"Install\"",
        icon: "download",
        iconType: "primary",
        confirmLabel: typeof t === "function" ? t("close", "Got it") : "Got it"
      });
    }
  }
}

// ========================================
// openAchievements (للتوافق)
// ========================================
window.openAchievements = function () {
  console.log("📌 Opening Achievements via window.openAchievements");

  if (typeof window.renderCompleted === "function") {
    document.querySelectorAll(".nav-btn, .bottom-nav-btn").forEach(function (btn) {
      btn.classList.remove("active");
    });
    window.renderCompleted();
    return true;
  }

  if (typeof renderCompleted === "function") {
    document.querySelectorAll(".nav-btn, .bottom-nav-btn").forEach(function (btn) {
      btn.classList.remove("active");
    });
    renderCompleted();
    return true;
  }

  if (typeof navigateTo === "function") {
    navigateTo("completed");
    return true;
  }

  console.error("❌ Cannot open Achievements");
  return false;
};

// ========================================
// ✅ Performance API
// ========================================
window.getPerfMetrics = function () {
  if (typeof performance === "undefined") return null;

  const nav = performance.getEntriesByType("navigation")[0];
  if (!nav) return null;

  return {
    dnsLookup: Math.round(nav.domainLookupEnd - nav.domainLookupStart) + "ms",
    tcpConnect: Math.round(nav.connectEnd - nav.connectStart) + "ms",
    ttfb: Math.round(nav.responseStart - nav.requestStart) + "ms",
    domLoad: Math.round(nav.domContentLoadedEventEnd - nav.startTime) + "ms",
    fullLoad: Math.round(nav.loadEventEnd - nav.startTime) + "ms",
  };
};

// ========================================
// ✅ دوال تشخيص
// ========================================
window.getAppState = function () {
  return {
    currentPage: currentPage,
    swVersion: 'v19',
    lucideInitialized: lucideInitialized,
    deferredPrompt: !!deferredPrompt,
    isStandalone: window.matchMedia("(display-mode: standalone)").matches,
    isOnline: navigator.onLine,
    language: cachedLanguage,
    hourSystem: cachedHourSystem,
    loadedModules: Object.keys(moduleCache).filter(k => moduleCache[k] !== null)
  };
};

// ========================================
// ✅ تنظيف عند إغلاق الصفحة
// ========================================
window.addEventListener('beforeunload', function () {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
  if (lucideTimer) {
    clearTimeout(lucideTimer);
    lucideTimer = null;
  }
  if (mainAbortController) {
    mainAbortController.abort();
    mainAbortController = null;
  }
});

// ========================================
// التصدير
// ========================================
window.navigateTo = navigateTo;
window.renderNotesPage = renderNotesPage;
window.updateUserHeader = updateUserHeader;
window.createDefaultAvatar = createDefaultAvatar;
window.updateNavTranslations = updateNavTranslations;
window.initPWA = initPWA;
window.showInstallButtons = showInstallButtons;
window.handleInstallClick = handleInstallClick;
window.loadModule = loadModule;

console.log("📌 Main.js v4.0 loaded successfully!");
console.log("   - Lazy Loading: dynamic imports enabled");
console.log("   - Async Navigation: navigateTo is now async");
console.log("   - Scroll Performance: body.is-scrolling enabled");
console.log("   - Try: getAppState() to inspect app state");
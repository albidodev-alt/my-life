// ========================================
// MY LIFE HUB - MAIN (Optimized v2.1)
// ========================================

let mainAbortController = null;
let currentPage = null;

// ========================================
// ✅ Lucide Icons - Debounced + RAF (تحسين الأداء)
// ========================================
let lucideTimer = null;
let lucideRafId = null;
let lucidePending = false;
let lucideInitialized = false;

/**
 * ✅ Debounced Lucide مع requestAnimationFrame
 * - يجمع الطلبات المتكررة في تنفيذ واحد
 * - يستخدم RAF للتزامن مع دورة رسم المتصفح
 * - لا تغيير بصري - فقط أسرع
 */
function debouncedLucide(delay = 50) {
  if (lucideTimer) clearTimeout(lucideTimer);
  if (lucideRafId) cancelAnimationFrame(lucideRafId);
  lucidePending = true;

  lucideTimer = setTimeout(() => {
    lucideTimer = null;
    lucideRafId = requestAnimationFrame(() => {
      lucideRafId = null;
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
    });
  }, delay);
}

// توافق مع الكود القديم
function initLucideIcons() {
  debouncedLucide(50);
}

window.debouncedLucide = debouncedLucide;
window.initLucideIcons = initLucideIcons;

// ========================================
// ✅ Performance Marks (قياس الأداء - اختياري)
// لا يؤثر على السلوك، فقط للتصحيح
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
// Error Boundary - حماية من الأخطاء
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
          <h2 style="color:var(--text-primary);margin-bottom:8px;">${fallbackMessage}</h2>
          <p style="font-size:14px;margin-bottom:24px;">${error.message || "Unknown error"}</p>
          <button onclick="location.reload()" style="padding:12px 24px;background:var(--primary-gradient);color:white;border:none;border-radius:10px;cursor:pointer;font-family:var(--font-handwritten);font-size:16px;font-weight:600;">
            🔄 Reload Page
          </button>
        </div>
      `;
    }
  }
}
window.safeRender = safeRender;

// ========================================
// ✅ Page Initializers Map (كود أنظف)
// ========================================
const pageInitializers = {
  routine: () => {
    if (typeof renderWeek === "function") renderWeek();
  },
  task: () => {
    if (typeof renderTasks === "function") renderTasks();
  },
  completed: () => {
    if (typeof window.renderCompleted === "function") {
      window.renderCompleted();
    } else if (typeof renderCompleted === "function") {
      renderCompleted();
    } else {
      renderCompletedFallback();
    }
  },
  notes: () => renderNotesPage(),
  events: () => {
    if (typeof renderEventsPage === "function") renderEventsPage();
  },
  program: () => {
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
// DOMContentLoaded
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  perfMark("app-start");

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

  const notesFabBtn = document.getElementById("notes-fab-btn");
  if (notesFabBtn) {
    notesFabBtn.addEventListener("click", function () {
      navigateTo("notes");
    });
  }

  if (typeof setupNotificationButton === "function") {
    setupNotificationButton();
  }

  if (typeof refreshNotifications === "function") {
    refreshNotifications();
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) refreshNotifications();
    });
    setInterval(refreshNotifications, 15 * 60 * 1000);
  }

  initPWA();
  navigateTo("routine");
  initLucideIcons();

  perfMark("app-ready");
  perfMeasure("app-init", "app-start", "app-ready");
});

// ========================================
// navigation - مع safeRender (بدون تغيير في السلوك)
// ========================================
function navigateTo(page) {
  const app = document.getElementById("app");
  if (!app) return;

  if (mainAbortController) {
    mainAbortController.abort();
    mainAbortController = null;
  }

  mainAbortController = new AbortController();

  document.querySelectorAll(".nav-btn").forEach(function (button) {
    button.classList.toggle("active", button.dataset.target === page);
  });

  document.querySelectorAll(".bottom-nav-btn").forEach(function (button) {
    button.classList.toggle("active", button.dataset.target === page);
  });

  updateNavTranslations();
  currentPage = page;

  perfMark(`page-${page}-start`);

  // ✅ استخدام Map للتنفيذ
  const initializer = pageInitializers[page];

  safeRender(() => {
    if (initializer) {
      initializer();
    } else {
      renderNotFoundPage();
    }
  });

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
      installBtn.style.cssText = "width:100%;padding:12px 20px;background:var(--primary-gradient);color:white;border:none;border-radius:10px;font-family:var(--font-handwritten);font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s ease;margin-top:12px;display:none;align-items:center;justify-content:center;gap:10px;";
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
// ✅ Performance API (اختياري - للتصحيح فقط)
// يمكن للمستخدم كتابة getPerfMetrics() في Console
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

console.log("📌 Main.js loaded successfully (optimized v2.1)");
// ========================================
// MY LIFE HUB - MAIN
// ========================================

let mainAbortController = null;

document.addEventListener("DOMContentLoaded", function () {

  // ===== تهيئة نظام الترجمة =====
  if (typeof initTranslations === 'function') {
    initTranslations().then(function() {
      console.log('✅ Translations ready');
    });
  }

  updateUserHeader();

  setupNavigation();
  setupProfileButton();
  setupSidebarToggle();
  setupBottomNav();

  // ===== زر Notes FAB =====
  const notesFabBtn = document.getElementById("notes-fab-btn");
  if (notesFabBtn) {
    notesFabBtn.addEventListener("click", function() {
      navigateTo("notes");
    });
  }

  // ===== ✅ تهيئة زر الإشعارات =====
  if (typeof setupNotificationButton === "function") {
    setupNotificationButton();
  }

  // ===== ✅ تحديث الإشعارات =====
  if (typeof refreshNotifications === "function") {
    refreshNotifications();
    setInterval(refreshNotifications, 5 * 60 * 1000);
  }

  // ===== ✅ تهيئة PWA =====
  initPWA();

  navigateTo("routine");

  initLucideIcons();
});

// ========================================
// INITIALIZE LUCDIE ICONS
// ========================================

function initLucideIcons() {
  if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
    console.log("✅ Lucide icons initialized!");
  } else {
    console.warn("⚠️ Lucide library not loaded, retrying...");
    setTimeout(function() {
      if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
        console.log("✅ Lucide icons initialized (delayed)!");
      } else {
        console.error("❌ Lucide library failed to load.");
      }
    }, 500);
  }
}

window.initLucideIcons = initLucideIcons;


function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const target = button.dataset.target;
      navigateTo(target);
    });
  });
}


function setupBottomNav() {
  const bottomNavButtons = document.querySelectorAll(".bottom-nav-btn");
  bottomNavButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const target = button.dataset.target;
      navigateTo(target);
    });
  });
}


function navigateTo(page) {
  const app = document.getElementById("app");
  if (!app) return;

  if (mainAbortController) {
    mainAbortController.abort();
    mainAbortController = null;
  }

  mainAbortController = new AbortController();

  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(function (button) {
    button.classList.toggle(
      "active",
      button.dataset.target === page
    );
  });

  const bottomNavButtons = document.querySelectorAll(".bottom-nav-btn");
  bottomNavButtons.forEach(function (button) {
    button.classList.toggle(
      "active",
      button.dataset.target === page
    );
  });

  // تحديث أسماء الأزرار المترجمة
  updateNavTranslations();

  switch (page) {
    case "routine":
      if (typeof renderWeek === "function") {
        renderWeek();
      }
      break;

    case "task":
      if (typeof renderTasks === "function") {
        renderTasks();
      }
      break;

    case "completed":
      if (typeof renderCompleted === "function") {
        renderCompleted();
      }
      break;

    case "notes":
      renderNotesPage();
      break;

    case "events":
      if (typeof renderEventsPage === "function") {
        renderEventsPage();
      }
      break;

    case "program":
      if (typeof window.renderProgramPage === "function") {
        window.renderProgramPage();
      } else if (typeof renderProgramPage === "function") {
        renderProgramPage();
      } else {
        app.innerHTML = `
          <div style="padding: 40px; text-align: center; color: var(--text-muted);">
            <h3>⚠️ Program module not loaded</h3>
            <p>Please check that program.js is loaded correctly.</p>
            <button onclick="location.reload()" style="padding: 10px 24px; margin-top: 16px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">Reload</button>
          </div>
        `;
      }
      break;

    default:
      renderNotFoundPage();
  }

  setTimeout(function() {
    initLucideIcons();
  }, 50);
}

// ========================================
// تحديث ترجمة أزرار التنقل
// ========================================

function updateNavTranslations() {
  if (typeof t !== 'function') return;

  const navTargets = ['routine', 'task', 'completed', 'notes', 'events', 'program'];
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach(function(btn, index) {
    if (index < navTargets.length) {
      const target = navTargets[index];
      btn.textContent = t(target, target.charAt(0).toUpperCase() + target.slice(1));
    }
  });

  const bottomTargets = ['routine', 'task', 'events', 'program'];
  const bottomBtns = document.querySelectorAll(".bottom-nav-btn");
  bottomBtns.forEach(function(btn, index) {
    if (index < bottomTargets.length) {
      const target = bottomTargets[index];
      const label = btn.querySelector('.bn-label');
      if (label) {
        label.textContent = t(target, target.charAt(0).toUpperCase() + target.slice(1));
      }
    }
  });
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
  h2.textContent = typeof t === 'function' ? t('notes', '📝 Notes') : "📝 Notes";
  section.appendChild(h2);

  const p = document.createElement("p");
  p.className = "page-description";
  p.textContent = typeof t === 'function' ? t('notes', 'Write down anything you want to remember.') : "Write down anything you want to remember.";
  section.appendChild(p);

  const notesDiv = document.createElement("div");
  notesDiv.id = "notes-panel-content";
  section.appendChild(notesDiv);

  app.appendChild(section);

  if (typeof renderNotesPanel === "function") {
    renderNotesPanel();
  }
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


function setupProfileButton() {
  const profileButton = document.getElementById("user-profile-btn");
  if (!profileButton) return;

  profileButton.addEventListener("click", function () {
    document.querySelectorAll(".nav-btn").forEach(function (button) {
      button.classList.remove("active");
    });
    document.querySelectorAll(".bottom-nav-btn").forEach(function (button) {
      button.classList.remove("active");
    });

    if (typeof renderProfile === "function") {
      renderProfile();
    }
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

  toggleBtn.addEventListener("click", function() {
    sidebar.classList.toggle("closed");
    this.classList.toggle("active");
    
    const isNowClosed = sidebar.classList.contains("closed");
    localStorage.setItem("sidebarClosed", isNowClosed);
  });
}


function updateUserHeader() {
  if (typeof getProfileData !== "function") {
    return;
  }

  const profile = getProfileData();

  const avatarImg = document.getElementById("user-avatar-icon");
  const nameSpan = document.getElementById("user-name-icon");

  if (nameSpan) {
    nameSpan.textContent = profile.name || "User 1";
  }

  if (avatarImg) {
    if (profile.avatar) {
      avatarImg.src = profile.avatar;
    } else {
      avatarImg.src = createDefaultAvatar(profile.name || "User 1");
    }
  }
}


function createDefaultAvatar(name) {
  const firstLetter = name.trim().charAt(0).toUpperCase() || "U";

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
    >
      <rect
        width="40"
        height="40"
        rx="20"
        fill="#4f8edb"
      />
      <text
        x="20"
        y="26"
        text-anchor="middle"
        font-size="18"
        font-family="Arial"
        fill="white"
      >
        ${firstLetter}
      </text>
    </svg>
  `;

  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}


window.navigateTo = navigateTo;
window.renderNotesPage = renderNotesPage;
window.updateUserHeader = updateUserHeader;
window.createDefaultAvatar = createDefaultAvatar;
window.initLucideIcons = initLucideIcons;
window.updateNavTranslations = updateNavTranslations;


function cleanupElement(element) {
  if (!element) return;
  const clone = element.cloneNode(true);
  element.parentNode?.replaceChild(clone, element);
  return clone;
}

function clearAllTimers() {
  const maxIntervalId = setInterval(function() {}, 0);
  for (let i = 0; i < maxIntervalId; i++) {
    clearInterval(i);
    clearTimeout(i);
  }
}

function cleanupGlobalListeners(controller) {
  if (controller) {
    controller.abort();
  }
}


// ========================================
// ===== PWA SUPPORT =====
// ========================================

let deferredPrompt = null;

function initPWA() {
  // ===== مراقبة حدث beforeinstallprompt =====
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📌 App install prompt available');
    
    // إظهار زر التثبيت في البروفايل فقط
    showInstallButtons(true);
  });

  // ===== مراقبة حدث appinstalled =====
  window.addEventListener('appinstalled', function() {
    console.log('✅ App installed successfully!');
    deferredPrompt = null;
    showInstallButtons(false);
  });

  // ===== تسجيل Service Worker =====
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(function(registration) {
        console.log('✅ ServiceWorker registered successfully');
        
        // التحقق من وجود تحديث
        if (registration.waiting) {
          setTimeout(function() {
            if (typeof showUpdateNotification === 'function') {
              showUpdateNotification();
            }
          }, 2000);
        }
      })
      .catch(function(error) {
        console.warn('⚠️ ServiceWorker registration failed:', error);
      });
  }

  // ===== إضافة زر التثبيت في البروفايل فقط =====
  addProfileInstallButton();
}

// ===== إظهار/إخفاء أزرار التثبيت =====
function showInstallButtons(show) {
  // زر البروفايل فقط
  const profileBtn = document.getElementById('profile-install-btn');
  if (profileBtn) {
    profileBtn.style.display = show ? 'flex' : 'none';
  }
}

// ===== إضافة زر التثبيت في البروفايل =====
function addProfileInstallButton() {
  // ننتظر حتى يتم تحميل البروفايل
  const observer = new MutationObserver(function(mutations) {
    const profileSection = document.getElementById('settings-section');
    if (profileSection) {
      // التحقق من وجود الزر بالفعل
      if (document.getElementById('profile-install-btn')) return;
      
      const installBtn = document.createElement('button');
      installBtn.id = 'profile-install-btn';
      installBtn.style.cssText = `
        width: 100%;
        padding: 12px 20px;
        background: var(--primary-gradient);
        color: white;
        border: none;
        border-radius: 10px;
        font-family: var(--font-handwritten);
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 12px;
        display: none;
        align-items: center;
        justify-content: center;
        gap: 10px;
      `;
      installBtn.innerHTML = '📲 Install App';
      
      installBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = 'var(--shadow-md)';
      });
      installBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      });
      
      installBtn.addEventListener('click', function() {
        handleInstallClick();
      });
      
      // إضافة الزر بعد قسم الإعدادات
      profileSection.parentNode.insertBefore(installBtn, profileSection.nextSibling);
      
      // إذا كان التطبيق غير مثبت، نعرض الزر
      if (!window.matchMedia('(display-mode: standalone)').matches && deferredPrompt) {
        installBtn.style.display = 'flex';
      }
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// ===== معالجة زر التثبيت =====
function handleInstallClick() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(choice) {
      if (choice.outcome === 'accepted') {
        console.log('✅ User installed the app');
        showInstallButtons(false);
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  } else {
    // إذا لم يكن هناك deferredPrompt، نعرض رسالة
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      alert('✅ App is already installed!');
    } else {
      alert('📲 To install this app:\n\n' +
            '• On Chrome: Tap the menu (⋮) → "Install App"\n' +
            '• On Safari: Tap Share → "Add to Home Screen"\n' +
            '• On Firefox: Tap the menu → "Install"');
    }
  }
}

// ========================================
// تصدير الدوال للاستخدام من ملفات أخرى
// ========================================

window.initPWA = initPWA;
window.showInstallButtons = showInstallButtons;
window.handleInstallClick = handleInstallClick;
window.deferredPrompt = deferredPrompt;

console.log("📌 Main.js loaded successfully");
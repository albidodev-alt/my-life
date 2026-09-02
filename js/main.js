// ========================================
// MY LIFE HUB - MAIN
// ========================================

// ===== Controller لإدارة الـ Event Listeners العالمية =====
let mainAbortController = null;

document.addEventListener("DOMContentLoaded", function () {

  // ----------------------------------------
  // Initialize application
  // ----------------------------------------

  updateUserHeader();

  setupNavigation();
  setupProfileButton();
  setupSidebarToggle();

  // الصفحة الافتراضية
  navigateTo("routine");
});


// ========================================
// NAVIGATION
// ========================================

function setupNavigation() {

  const navButtons = document.querySelectorAll(".nav-btn");

  navButtons.forEach(function (button) {

    button.addEventListener("click", function () {

      const target = button.dataset.target;

      navigateTo(target);

    });

  });

}


// ========================================
// CHANGE PAGE
// ========================================

function navigateTo(page) {

  const app = document.getElementById("app");

  if (!app) return;

  // ✅ إلغاء أي AbortController سابق
  if (mainAbortController) {
    mainAbortController.abort();
    mainAbortController = null;
  }

  // ✅ إنشاء AbortController جديد للصفحة الحالية
  mainAbortController = new AbortController();

  // إزالة active من جميع الأزرار
  const navButtons = document.querySelectorAll(".nav-btn");

  navButtons.forEach(function (button) {

    button.classList.toggle(
      "active",
      button.dataset.target === page
    );

  });


  // ----------------------------------------
  // Render selected page
  // ----------------------------------------

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

      // ✅ تحسين التحقق من الدالة
      if (typeof window.renderProgramPage === "function") {
        window.renderProgramPage();
      } else if (typeof renderProgramPage === "function") {
        renderProgramPage();
      } else {
        // رسالة خطأ واضحة
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

}


// ========================================
// NOTES PAGE - VERSION 2.0
// ========================================

function renderNotesPage() {

  const app = document.getElementById("app");

  if (!app) return;

  // ✅ استخدام replaceChildren بدلاً من innerHTML حيثما أمكن
  app.replaceChildren();

  // استخدام نظام الملاحظات الجديد v2.0
  // التحقق من وجود الدالة الجديدة
  if (typeof renderNotesPageV2 === "function") {
    renderNotesPageV2();
    return;
  }

  // Fallback للنسخة القديمة (في حال عدم تحميل note.js الجديد)
  const section = document.createElement("section");
  section.className = "page-section";

  const h2 = document.createElement("h2");
  h2.textContent = "📝 Notes";
  section.appendChild(h2);

  const p = document.createElement("p");
  p.className = "page-description";
  p.textContent = "Write down anything you want to remember.";
  section.appendChild(p);

  const notesDiv = document.createElement("div");
  notesDiv.id = "notes-panel-content";
  section.appendChild(notesDiv);

  app.appendChild(section);

  // تشغيل نظام Notes القديم
  if (typeof renderNotesPanel === "function") {
    renderNotesPanel();
  }

}


// ========================================
// PAGE NOT FOUND
// ========================================

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
// PROFILE BUTTON
// ========================================

function setupProfileButton() {

  const profileButton =
    document.getElementById("user-profile-btn");

  if (!profileButton) return;

  profileButton.addEventListener("click", function () {

    // إزالة active من Sidebar
    document.querySelectorAll(".nav-btn").forEach(function (button) {
      button.classList.remove("active");
    });

    if (typeof renderProfile === "function") {
      renderProfile();
    }

  });

}


// ========================================
// SIDEBAR TOGGLE (DeepSeek Style)
// ========================================

function setupSidebarToggle() {
  const toggleBtn = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");

  if (!toggleBtn || !sidebar) return;

  // استرجاع الحالة من localStorage
  const isClosed = localStorage.getItem("sidebarClosed") === "true";
  if (isClosed) {
    sidebar.classList.add("closed");
    toggleBtn.classList.add("active");
  }

  toggleBtn.addEventListener("click", function() {
    // تبديل حالة الـ Sidebar
    sidebar.classList.toggle("closed");
    this.classList.toggle("active");
    
    // حفظ الحالة
    const isNowClosed = sidebar.classList.contains("closed");
    localStorage.setItem("sidebarClosed", isNowClosed);
  });
}


// ========================================
// UPDATE HEADER USER
// ========================================

function updateUserHeader() {

  if (typeof getProfileData !== "function") {
    return;
  }

  const profile = getProfileData();

  const avatarImg =
    document.getElementById("user-avatar-icon");

  const nameSpan =
    document.getElementById("user-name-icon");


  // ----------------------------------------
  // User name
  // ----------------------------------------

  if (nameSpan) {

    nameSpan.textContent =
      profile.name || "User 1";

  }


  // ----------------------------------------
  // Avatar
  // ----------------------------------------

  if (avatarImg) {

    if (profile.avatar) {

      avatarImg.src = profile.avatar;

    } else {

      avatarImg.src =
        createDefaultAvatar(profile.name || "User 1");

    }

  }

}


// ========================================
// DEFAULT AVATAR
// ========================================

function createDefaultAvatar(name) {

  const firstLetter =
    name.trim().charAt(0).toUpperCase() || "U";

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

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg);

}


// ========================================
// EXPOSE FUNCTIONS GLOBALLY
// ========================================

// جعل الدوال متاحة للاستخدام من ملفات أخرى
window.navigateTo = navigateTo;
window.renderNotesPage = renderNotesPage;
window.updateUserHeader = updateUserHeader;
window.createDefaultAvatar = createDefaultAvatar;


// ========================================
// CLEANUP HELPERS
// ========================================

// ✅ دالة لتنظيف الـ Event Listeners على العناصر
function cleanupElement(element) {
  if (!element) return;
  // cloneNode يحل محل العنصر ويزيل جميع الـ Listeners
  const clone = element.cloneNode(true);
  element.parentNode?.replaceChild(clone, element);
  return clone;
}

// ✅ دالة لتنظيف جميع الـ Intervals و Timeouts
function clearAllTimers() {
  // الحصول على أعلى ID للـ interval
  const maxIntervalId = setInterval(function() {}, 0);
  for (let i = 0; i < maxIntervalId; i++) {
    clearInterval(i);
    clearTimeout(i);
  }
}

// ✅ دالة لتنظيف الـ Event Listeners على window و document
function cleanupGlobalListeners(controller) {
  if (controller) {
    controller.abort();
  }
}


// ========================================
// DEBUGGING HELPERS (اختياري)
// ========================================

// يمكن إزالة هذا الجزء في الإنتاج
if (window.DEBUG_MODE) {
  console.log("✅ Main.js loaded successfully");
  console.log("📌 Available pages: routine, task, completed, notes, events, program");
}

console.log("📌 Main.js: renderProgramPage available:", typeof window.renderProgramPage === "function");
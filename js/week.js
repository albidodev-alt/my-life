const days = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

function renderWeek() {
  const app = document.getElementById("app");
  if (!app) return;

  app.replaceChildren();

  const title = document.createElement("h2");
  title.textContent = typeof t === 'function' ? t('my_routine', 'My Routine') : "My Routine";
  app.appendChild(title);

  const weekContainer = document.createElement("div");
  weekContainer.id = "week-container";

  const today = new Date();
  const todayName = days[today.getDay()];

  days.forEach(function (day) {
    const dayData = getDayData(day);
    const dayForText = dayData.dayFor || "";

    const dayCard = document.createElement("div");
    dayCard.className = "day-card";

    if (day === todayName) {
      dayCard.classList.add("today-card");
    }

    const dayBtn = document.createElement("button");
    const translatedDay = typeof translateDay === 'function' ? translateDay(day) : day;
    dayBtn.textContent = translatedDay;
    dayBtn.classList.add("day-btn");

    // ✅ Lazy load day.js عند النقر
    dayBtn.addEventListener("click", async function () {
      try {
        // ✅ إذا لم تكن day.js محمّلة → حمّلها
        if (typeof openDay === "undefined") {
          if (typeof window.loadModule === "function") {
            await window.loadModule('day');
          } else {
            // fallback: تحميل مباشر
            await import('./day.js');
          }
        }

        // ✅ الآن openDay متاحة
        if (typeof openDay === "function") {
          openDay(day);
        } else {
          console.error("❌ openDay still not defined after loading day.js");
        }
      } catch (error) {
        console.error("❌ Failed to open day:", error);
        if (typeof showToast === "function") {
          showToast('❌ Failed to open day. Please try again.', 'error');
        }
      }
    });

    dayCard.appendChild(dayBtn);

    // ===== عرض "Day For" =====
    if (dayForText) {
      const dayForSpan = document.createElement("span");
      dayForSpan.className = "day-for-label";
      dayForSpan.textContent = dayForText;

      dayForSpan.style.cssText = `
        display: block;
        padding: 4px 8px;
        margin: 4px 8px 8px 8px;
        color: #4f8edb;
        font-weight: 700;
        font-size: 13px;
        text-align: center;
        background: rgba(79, 142, 219, 0.12);
        border-radius: 6px;
        border: 1px solid rgba(79, 142, 219, 0.3);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        line-height: 1.4;
      `;

      dayForSpan.title = dayForText;
      dayCard.appendChild(dayForSpan);
    }

    weekContainer.appendChild(dayCard);
  });

  app.appendChild(weekContainer);

  setTimeout(function() {
    if (typeof initLucideIcons === 'function') {
      initLucideIcons();
    }
  }, 50);
}

window.renderWeek = renderWeek;

console.log("✅ Week.js v2.0 loaded successfully! (With Lazy Load for day.js)");
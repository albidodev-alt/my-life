const days = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

function renderWeek() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const title = document.createElement("h2");
  // استخدام الترجمة لـ "My Routine"
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
    // ترجمة اسم اليوم
    const translatedDay = typeof translateDay === 'function' ? translateDay(day) : day;
    dayBtn.textContent = translatedDay;
    dayBtn.classList.add("day-btn");
    dayBtn.addEventListener("click", function () { openDay(day); });
    dayCard.appendChild(dayBtn);

    // ===== عرض "Day For" باللون الأزرق الفاتح مع إصلاح النصوص الطويلة =====
    if (dayForText) {
      const dayForSpan = document.createElement("span");
      dayForSpan.className = "day-for-label";
      dayForSpan.textContent = dayForText;
      
      // تنسيق باللون الأزرق الفاتح مع إصلاح النصوص الطويلة
      dayForSpan.style.cssText = `
        display: block;
        padding: 4px 8px;
        margin: 4px 8px 8px 8px;
        color: #4f8edb;  /* أزرق فاتح - نفس اللون الأساسي للموقع */
        font-weight: 700;
        font-size: 13px;
        text-align: center;
        background: rgba(79, 142, 219, 0.12);  /* خلفية زرقاء فاتحة */
        border-radius: 6px;
        border: 1px solid rgba(79, 142, 219, 0.3);  /* حدود زرقاء */
        /* ✅ إصلاح النصوص الطويلة */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        line-height: 1.4;
      `;
      
      // إضافة title لعرض النص الكامل عند التمرير
      dayForSpan.title = dayForText;
      
      dayCard.appendChild(dayForSpan);
    }

    weekContainer.appendChild(dayCard);
  });

  app.appendChild(weekContainer);
  
  // ✅ إعادة تهيئة أيقونات Lucide
  setTimeout(function() {
    if (typeof initLucideIcons === 'function') {
      initLucideIcons();
    }
  }, 50);
}

console.log("✅ Week.js loaded successfully!");
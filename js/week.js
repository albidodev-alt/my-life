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

    // ===== عرض "Day For" باللون الأخضر مثل التفاح =====
    if (dayForText) {
      const dayForSpan = document.createElement("span");
      dayForSpan.className = "day-for-label";
      dayForSpan.textContent = dayForText;
      
      // تنسيق باللون الأخضر مثل التفاح
      dayForSpan.style.cssText = `
        display: block;
        padding: 4px 8px;
        margin: 4px 8px 8px 8px;
        color: #228B22;  /* أخضر غامق مثل التفاح */
        font-weight: 700;
        font-size: 13px;
        text-align: center;
        background: rgba(34, 139, 34, 0.12);  /* خلفية خضراء فاتحة */
        border-radius: 6px;
        border: 1px solid rgba(34, 139, 34, 0.3);  /* حدود خضراء */
      `;
      
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
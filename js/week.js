const days = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

function renderWeek() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "My Routine";
  app.appendChild(title);

  const weekContainer = document.createElement("div");
  weekContainer.id = "week-container";

  days.forEach(function (day) {
    // ===== جلب بيانات اليوم =====
    const dayData = getDayData(day);
    const dayForText = dayData.dayFor || "";

    // ===== إنشاء بطاقة اليوم =====
    const dayCard = document.createElement("div");
    dayCard.className = "day-card";

    // ===== زر اليوم =====
    const dayBtn = document.createElement("button");
    dayBtn.textContent = day;
    dayBtn.classList.add("day-btn");
    dayBtn.addEventListener("click", function () { openDay(day); });
    dayCard.appendChild(dayBtn);

    // ===== عرض Day For (إن وجد) =====
    if (dayForText) {
      const dayForSpan = document.createElement("span");
      dayForSpan.className = "day-for-label";
      
      // إضافة أيقونة
      const iconSpan = document.createElement("span");
      iconSpan.textContent = "📌 ";
      
      const textSpan = document.createElement("span");
      textSpan.textContent = dayForText;
      
      dayForSpan.appendChild(iconSpan);
      dayForSpan.appendChild(textSpan);
      dayCard.appendChild(dayForSpan);
    }

    weekContainer.appendChild(dayCard);
  });

  app.appendChild(weekContainer);
}
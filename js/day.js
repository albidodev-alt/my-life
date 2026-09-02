const activitySuggestions = [
  { icon: "😴", name: "Sleep" },
  { icon: "📚", name: "Study" },
  { icon: "🎓", name: "University" },
  { icon: "🏋️", name: "Gym" },
  { icon: "⚽", name: "Sport" },
  { icon: "💻", name: "Work" },
  { icon: "🍽️", name: "Food" },
  { icon: "🧘", name: "Rest" },
  { icon: "🚗", name: "Commute" },
  { icon: "🎮", name: "Free Time" }
];

// ========================================
// دالة مساعدة لتنسيق الوقت بصيغة AM/PM
// ========================================

function formatHourRange(startHour) {
  const start = startHour;
  const end = startHour + 1;
  
  function formatHour(hour) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return hour12 + ':00 ' + ampm;
  }
  
  return formatHour(start) + ' - ' + formatHour(end);
}

// ========================================
// دالة حساب التدرج اللوني باستخدام منحنى متعدد النقاط (Hermite Spline)
// ========================================

function getHourColor(hour) {
  // ===== نقاط التحكم (Control Points) =====
  const controlPoints = [
    { time: 0, color: { r: 13, g: 27, b: 42 } },     // 12:00 AM
    { time: 3, color: { r: 20, g: 40, b: 65 } },     // 3:00 AM
    { time: 5, color: { r: 30, g: 58, b: 95 } },     // 5:00 AM
    { time: 6, color: { r: 80, g: 130, b: 200 } },   // 6:00 AM
    { time: 8, color: { r: 180, g: 210, b: 250 } },  // 8:00 AM
    { time: 10, color: { r: 210, g: 225, b: 255 } }, // 10:00 AM
    { time: 12, color: { r: 235, g: 242, b: 255 } }, // 12:00 PM
    { time: 14, color: { r: 210, g: 225, b: 255 } }, // 2:00 PM
    { time: 16, color: { r: 180, g: 210, b: 250 } }, // 4:00 PM
    { time: 18, color: { r: 120, g: 160, b: 210 } }, // 6:00 PM
    { time: 19, color: { r: 74, g: 122, b: 170 } },  // 7:00 PM
    { time: 20, color: { r: 40, g: 70, b: 110 } },   // 8:00 PM
    { time: 22, color: { r: 20, g: 40, b: 65 } },    // 10:00 PM
    { time: 24, color: { r: 13, g: 27, b: 42 } },    // 12:00 AM
  ];

  let p1 = controlPoints[0];
  let p2 = controlPoints[controlPoints.length - 1];
  
  for (let i = 0; i < controlPoints.length - 1; i++) {
    if (hour >= controlPoints[i].time && hour < controlPoints[i + 1].time) {
      p1 = controlPoints[i];
      p2 = controlPoints[i + 1];
      break;
    }
  }
  
  const timeDiff = p2.time - p1.time;
  let progress = timeDiff === 0 ? 0 : (hour - p1.time) / timeDiff;
  progress = Math.max(0, Math.min(1, progress));
  
  const smooth = progress * progress * (3 - 2 * progress);
  
  const color = {
    r: Math.round(p1.color.r + (p2.color.r - p1.color.r) * smooth),
    g: Math.round(p1.color.g + (p2.color.g - p1.color.g) * smooth),
    b: Math.round(p1.color.b + (p2.color.b - p1.color.b) * smooth)
  };
  
  return rgbToHex(color.r, color.g, color.b);
}

// ========================================
// تحويل RGB إلى Hex
// ========================================

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// ========================================
// دالة تحديد لون النص مع توهج قوي
// ========================================

function getTextStyle(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  if (luminance > 0.5) {
    return {
      color: '#1e293b',
      textShadow: 'none',
      labelColor: 'rgba(30, 41, 59, 0.5)'
    };
  } else {
    return {
      color: '#ffffff',
      textShadow: '0 0 15px rgba(100, 180, 255, 0.5), 0 0 30px rgba(100, 180, 255, 0.2), 0 0 50px rgba(100, 180, 255, 0.1)',
      labelColor: 'rgba(255, 255, 255, 0.8)'
    };
  }
}

// ========================================
// دالة تنسيق الوقت بصيغة 12-hour
// ========================================

function formatTime12(hour, minute = 0) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  const minuteStr = minute.toString().padStart(2, '0');
  return hour12 + ':' + minuteStr + ' ' + ampm;
}

// ========================================
// دالة حساب فرق الساعات بين وقتين
// ========================================

function calculateSleepDuration(sleepHour, sleepMinute, wakeHour, wakeMinute) {
  // تحويل الأوقات إلى دقائق
  const sleepTotal = sleepHour * 60 + sleepMinute;
  const wakeTotal = wakeHour * 60 + wakeMinute;
  
  let diff = wakeTotal - sleepTotal;
  
  // إذا كان وقت الاستيقاظ قبل وقت النوم (نوم عبر منتصف الليل)
  if (diff < 0) {
    diff += 24 * 60;
  }
  
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  
  return { hours, minutes, totalMinutes: diff };
}

// ========================================
// دالة عرض مؤشر جودة النوم
// ========================================

function getSleepQuality(hours) {
  if (hours >= 7 && hours <= 9) {
    return { emoji: '🟢', label: 'Excellent' };
  } else if (hours >= 6 && hours < 7) {
    return { emoji: '🟡', label: 'Good' };
  } else if (hours >= 5 && hours < 6) {
    return { emoji: '🟠', label: 'Fair' };
  } else {
    return { emoji: '🔴', label: 'Poor' };
  }
}

// ========================================
// دالة عرض إحصائيات اليوم مع Sleep Tracker
// ========================================

function renderDayStatistics(container, hoursArray, dayName) {
  const stats = countActivities(hoursArray);

  const statsTitle = document.createElement("h3");
  statsTitle.textContent = "📊 Today's Statistics";
  statsTitle.style.marginTop = "24px";
  container.appendChild(statsTitle);

  // ===== Sleep Tracker =====
  const dayData = getDayData(dayName);
  const sleepHour = dayData.sleepHour !== undefined ? dayData.sleepHour : 23; // 11:00 PM
  const sleepMinute = dayData.sleepMinute !== undefined ? dayData.sleepMinute : 0;
  const wakeHour = dayData.wakeHour !== undefined ? dayData.wakeHour : 6; // 6:00 AM
  const wakeMinute = dayData.wakeMinute !== undefined ? dayData.wakeMinute : 0;

  const sleepCard = document.createElement("div");
  sleepCard.style.cssText = `
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 16px;
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
    cursor: pointer;
  `;
  
  sleepCard.addEventListener('mouseenter', function() {
    this.style.boxShadow = 'var(--shadow-md)';
    this.style.transform = 'translateY(-2px)';
  });
  
  sleepCard.addEventListener('mouseleave', function() {
    this.style.boxShadow = 'var(--shadow-sm)';
    this.style.transform = 'translateY(0)';
  });

  // صف النوم
  const sleepRow = document.createElement("div");
  sleepRow.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  `;

  const sleepInfo = document.createElement("div");
  sleepInfo.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-handwritten);
    font-size: 16px;
    color: var(--text-primary);
  `;

  const sleepIcon = document.createElement("span");
  sleepIcon.textContent = "😴";
  sleepIcon.style.fontSize = "22px";

  const sleepText = document.createElement("span");
  sleepText.textContent = "Sleep: " + formatTime12(sleepHour, sleepMinute);
  sleepText.style.fontWeight = "600";

  sleepInfo.appendChild(sleepIcon);
  sleepInfo.appendChild(sleepText);

  // صف الاستيقاظ
  const wakeInfo = document.createElement("div");
  wakeInfo.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-handwritten);
    font-size: 16px;
    color: var(--text-primary);
  `;

  const wakeIcon = document.createElement("span");
  wakeIcon.textContent = "🌅";
  wakeIcon.style.fontSize = "22px";

  const wakeText = document.createElement("span");
  wakeText.textContent = "Wake: " + formatTime12(wakeHour, wakeMinute);
  wakeText.style.fontWeight = "600";

  wakeInfo.appendChild(wakeIcon);
  wakeInfo.appendChild(wakeText);

  sleepRow.appendChild(sleepInfo);
  sleepRow.appendChild(wakeInfo);

  // صف إجمالي ساعات النوم
  const duration = calculateSleepDuration(sleepHour, sleepMinute, wakeHour, wakeMinute);
  const quality = getSleepQuality(duration.hours);

  const durationRow = document.createElement("div");
  durationRow.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--border-light);
    font-family: var(--font-handwritten);
    font-size: 15px;
    color: var(--text-secondary);
    flex-wrap: wrap;
    gap: 8px;
  `;

  const durationText = document.createElement("span");
  durationText.textContent = `⏱️ Total Sleep: ${duration.hours}h ${duration.minutes > 0 ? duration.minutes + 'm' : ''}`;
  durationText.style.fontWeight = "600";

  const qualityText = document.createElement("span");
  qualityText.textContent = `${quality.emoji} ${quality.label}`;
  qualityText.style.cssText = `
    padding: 4px 12px;
    border-radius: 20px;
    background: ${quality.emoji === '🟢' ? 'rgba(76, 175, 132, 0.15)' : 
                quality.emoji === '🟡' ? 'rgba(245, 166, 35, 0.15)' :
                quality.emoji === '🟠' ? 'rgba(255, 152, 0, 0.15)' :
                'rgba(231, 76, 94, 0.15)'};
    color: ${quality.emoji === '🟢' ? '#2e7d5e' : 
            quality.emoji === '🟡' ? '#b7791f' :
            quality.emoji === '🟠' ? '#c77800' :
            '#c0392b'};
    font-weight: 600;
    font-size: 13px;
  `;

  durationRow.appendChild(durationText);
  durationRow.appendChild(qualityText);

  sleepCard.appendChild(sleepRow);
  sleepCard.appendChild(durationRow);

  // ===== نافذة تعديل أوقات النوم =====
  sleepCard.addEventListener("click", function() {
    openSleepModal(dayName);
  });

  container.appendChild(sleepCard);

  // ===== إحصائيات الأنشطة =====
  const statsContainer = document.createElement("div");
  statsContainer.id = "statistics-list";

  if (Object.keys(stats).length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "No activities recorded yet. Add some!";
    statsContainer.appendChild(empty);
  } else {
    const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    const maxCount = sortedStats[0][1];

    sortedStats.forEach(function ([activity, count]) {
      const item = document.createElement("div");
      item.className = "statistics-item";

      const name = document.createElement("span");
      name.className = "statistics-item-name";
      name.textContent = activity;

      const barContainer = document.createElement("div");
      barContainer.className = "statistics-bar-container";

      const bar = document.createElement("div");
      bar.className = "statistics-bar";
      const percentage = (count / maxCount) * 100;
      bar.style.width = percentage + "%";

      barContainer.appendChild(bar);

      const hoursCount = document.createElement("span");
      hoursCount.className = "statistics-item-hours";
      hoursCount.textContent = count + " hour" + (count > 1 ? "s" : "");

      item.appendChild(name);
      item.appendChild(barContainer);
      item.appendChild(hoursCount);
      statsContainer.appendChild(item);
    });
  }

  container.appendChild(statsContainer);
}

// ========================================
// نافذة تعديل أوقات النوم
// ========================================

function openSleepModal(dayName) {
  const dayData = getDayData(dayName);
  const sleepHour = dayData.sleepHour !== undefined ? dayData.sleepHour : 23;
  const sleepMinute = dayData.sleepMinute !== undefined ? dayData.sleepMinute : 0;
  const wakeHour = dayData.wakeHour !== undefined ? dayData.wakeHour : 6;
  const wakeMinute = dayData.wakeMinute !== undefined ? dayData.wakeMinute : 0;

  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";

  const modal = document.createElement("div");
  modal.id = "hour-modal";

  const title = document.createElement("h3");
  title.textContent = "😴 Sleep Settings";
  modal.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "modal-subtitle";
  subtitle.textContent = "Set your sleep and wake-up times";
  modal.appendChild(subtitle);

  // ===== وقت النوم =====
  const sleepLabel = document.createElement("p");
  sleepLabel.className = "modal-subtitle";
  sleepLabel.textContent = "🌙 Sleep Time";
  sleepLabel.style.fontWeight = "600";
  sleepLabel.style.marginTop = "8px";
  modal.appendChild(sleepLabel);

  const sleepContainer = document.createElement("div");
  sleepContainer.style.cssText = "display: flex; gap: 12px; margin-bottom: 12px;";

  // ساعة النوم
  const sleepHourSelect = document.createElement("select");
  sleepHourSelect.id = "sleep-hour-select";
  sleepHourSelect.style.cssText = "flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary);";
  for (let i = 0; i < 24; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i.toString().padStart(2, '0') + ':00';
    if (i === sleepHour) option.selected = true;
    sleepHourSelect.appendChild(option);
  }

  // دقيقة النوم
  const sleepMinuteSelect = document.createElement("select");
  sleepMinuteSelect.id = "sleep-minute-select";
  sleepMinuteSelect.style.cssText = "flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary);";
  for (let i = 0; i < 60; i += 5) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = ':' + i.toString().padStart(2, '0');
    if (i === sleepMinute) option.selected = true;
    sleepMinuteSelect.appendChild(option);
  }

  sleepContainer.appendChild(sleepHourSelect);
  sleepContainer.appendChild(sleepMinuteSelect);
  modal.appendChild(sleepContainer);

  // ===== وقت الاستيقاظ =====
  const wakeLabel = document.createElement("p");
  wakeLabel.className = "modal-subtitle";
  wakeLabel.textContent = "☀️ Wake Time";
  wakeLabel.style.fontWeight = "600";
  wakeLabel.style.marginTop = "8px";
  modal.appendChild(wakeLabel);

  const wakeContainer = document.createElement("div");
  wakeContainer.style.cssText = "display: flex; gap: 12px; margin-bottom: 16px;";

  // ساعة الاستيقاظ
  const wakeHourSelect = document.createElement("select");
  wakeHourSelect.id = "wake-hour-select";
  wakeHourSelect.style.cssText = "flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary);";
  for (let i = 0; i < 24; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i.toString().padStart(2, '0') + ':00';
    if (i === wakeHour) option.selected = true;
    wakeHourSelect.appendChild(option);
  }

  // دقيقة الاستيقاظ
  const wakeMinuteSelect = document.createElement("select");
  wakeMinuteSelect.id = "wake-minute-select";
  wakeMinuteSelect.style.cssText = "flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-input); background: var(--bg-input); color: var(--text-primary);";
  for (let i = 0; i < 60; i += 5) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = ':' + i.toString().padStart(2, '0');
    if (i === wakeMinute) option.selected = true;
    wakeMinuteSelect.appendChild(option);
  }

  wakeContainer.appendChild(wakeHourSelect);
  wakeContainer.appendChild(wakeMinuteSelect);
  modal.appendChild(wakeContainer);

  // ===== أزرار الإجراءات =====
  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = "display: flex; gap: 8px; margin-top: 8px;";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾 Save";
  saveBtn.id = "save-custom-btn";
  saveBtn.style.flex = "1";
  saveBtn.addEventListener("click", function() {
    const newSleepHour = parseInt(sleepHourSelect.value);
    const newSleepMinute = parseInt(sleepMinuteSelect.value);
    const newWakeHour = parseInt(wakeHourSelect.value);
    const newWakeMinute = parseInt(wakeMinuteSelect.value);

    const dayData = getDayData(dayName);
    dayData.sleepHour = newSleepHour;
    dayData.sleepMinute = newSleepMinute;
    dayData.wakeHour = newWakeHour;
    dayData.wakeMinute = newWakeMinute;
    saveDayData(dayName, dayData);

    closeModal();
    openDay(dayName);
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.cssText = "flex: 1; padding: 12px; border: 1px solid var(--border-input); border-radius: 6px; background: var(--bg-input); color: var(--text-secondary); cursor: pointer; font-family: var(--font-handwritten); font-size: 16px; font-weight: 600; transition: 0.2s;";
  cancelBtn.addEventListener("mouseenter", function() {
    this.style.backgroundColor = "var(--bg-hover)";
  });
  cancelBtn.addEventListener("mouseleave", function() {
    this.style.backgroundColor = "var(--bg-input)";
  });
  cancelBtn.addEventListener("click", closeModal);

  buttonContainer.appendChild(cancelBtn);
  buttonContainer.appendChild(saveBtn);
  modal.appendChild(buttonContainer);

  // ===== زر الإغلاق =====
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.id = "close-modal-btn";
  closeBtn.addEventListener("click", closeModal);
  modal.appendChild(closeBtn);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closeModal();
  });

  function closeModal() {
    overlay.remove();
  }
}

// ========================================
// ✅ دالة معالجة النقر على الساعات (Event Delegation)
// ========================================

function handleHourClick(event) {
  const hourBox = event.target.closest(".hour-box");
  if (!hourBox) return;
  
  const dayName = hourBox.closest("#hours-grid")?.dataset.dayName;
  if (!dayName) return;
  
  const hourIndex = parseInt(hourBox.dataset.hour);
  const label = hourBox.dataset.label;
  const activity = hourBox.dataset.activity || "";
  
  openHourModal(dayName, hourIndex, label, activity);
}

// ========================================
// فتح صفحة اليوم
// ========================================

function openDay(dayName) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back";
  backBtn.id = "back-btn";
  backBtn.addEventListener("click", function () { renderWeek(); });
  app.appendChild(backBtn);

  const title = document.createElement("h2");
  title.textContent = dayName;
  app.appendChild(title);

  const dayData = getDayData(dayName);

  const hoursGrid = document.createElement("div");
  hoursGrid.id = "hours-grid";
  hoursGrid.dataset.dayName = dayName;

  // ✅ استخدام DocumentFragment لتجميع جميع الساعات
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 24; i++) {
    const hourBox = document.createElement("div");
    hourBox.className = "hour-box";
    
    const label = formatHourRange(i);
    const activity = dayData.hours[i] ? dayData.hours[i] : "";
    
    // تخزين البيانات في dataset
    hourBox.dataset.hour = i;
    hourBox.dataset.label = label;
    hourBox.dataset.activity = activity;
    
    const bgColor = getHourColor(i);
    const textStyle = getTextStyle(bgColor);
    
    hourBox.style.backgroundColor = bgColor;
    hourBox.style.color = textStyle.color;
    hourBox.style.textShadow = textStyle.textShadow;
    hourBox.style.borderColor = textStyle.color === '#ffffff' 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(79, 142, 219, 0.2)';

    const labelSpan = document.createElement("span");
    labelSpan.className = "hour-label";
    labelSpan.textContent = label;
    labelSpan.style.color = textStyle.labelColor || (textStyle.color === '#ffffff' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.5)');
    labelSpan.style.textShadow = textStyle.textShadow;

    const activitySpan = document.createElement("span");
    activitySpan.className = "hour-activity";
    activitySpan.textContent = activity;
    activitySpan.style.color = textStyle.color;
    activitySpan.style.textShadow = textStyle.textShadow;

    hourBox.appendChild(labelSpan);
    hourBox.appendChild(activitySpan);

    fragment.appendChild(hourBox);
  }

  // ✅ إضافة جميع الساعات دفعة واحدة
  hoursGrid.appendChild(fragment);
  
  // ✅ إضافة Event Delegation واحد فقط على الحاوية
  // ✅ تم إزالة mouseenter/mouseleave (تم نقلها إلى CSS)
  hoursGrid.addEventListener("click", handleHourClick);

  app.appendChild(hoursGrid);

  // ===== Day For? =====
  const dayForBox = document.createElement("div");
  dayForBox.id = "day-for-box";

  const dayForLabel = document.createElement("strong");
  dayForLabel.textContent = "Day For? ";

  const dayForValue = document.createElement("span");
  dayForValue.id = "day-for-value";
  dayForValue.textContent = dayData.dayFor ? dayData.dayFor : "Click to set";

  dayForBox.appendChild(dayForLabel);
  dayForBox.appendChild(dayForValue);

  dayForBox.addEventListener("click", function () {
    const current = dayData.dayFor ? dayData.dayFor : "";
    const newDayFor = prompt("What is this day for?", current);
    if (newDayFor !== null) {
      dayData.dayFor = newDayFor;
      saveDayData(dayName, dayData);
      openDay(dayName);
    }
  });

  app.appendChild(dayForBox);

  // ===== 📊 Today's Statistics =====
  renderDayStatistics(app, dayData.hours, dayName);
}

// ===== دالة حساب تكرار الأنشطة =====
function countActivities(hoursArray) {
  const counts = {};

  hoursArray.forEach(function (activity) {
    if (activity && activity.trim() !== "") {
      counts[activity] = (counts[activity] || 0) + 1;
    }
  });

  return counts;
}

// ===== دالة فتح المودال =====
function openHourModal(dayName, hourIndex, label, currentActivity) {
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";

  const modal = document.createElement("div");
  modal.id = "hour-modal";

  const title = document.createElement("h3");
  title.textContent = label;
  modal.appendChild(title);

  const currentActivityDisplay = document.createElement("p");
  currentActivityDisplay.className = "modal-subtitle";
  if (currentActivity) {
    currentActivityDisplay.textContent = "Current: " + currentActivity;
    currentActivityDisplay.style.color = "#3b82f6";
    currentActivityDisplay.style.fontWeight = "500";
  } else {
    currentActivityDisplay.textContent = "No activity selected";
    currentActivityDisplay.style.color = "#9ca3af";
  }
  modal.appendChild(currentActivityDisplay);

  const subtitle = document.createElement("p");
  subtitle.className = "modal-subtitle";
  subtitle.textContent = "Choose an activity";
  modal.appendChild(subtitle);

  const suggestionsGrid = document.createElement("div");
  suggestionsGrid.id = "suggestions-grid";

  activitySuggestions.forEach(function (item) {
    const btn = document.createElement("button");
    btn.className = "suggestion-btn";
    if (item.name === currentActivity) {
      btn.classList.add("selected");
    }

    const iconSpan = document.createElement("span");
    iconSpan.className = "suggestion-icon";
    iconSpan.textContent = item.icon;

    const nameSpan = document.createElement("span");
    nameSpan.textContent = item.name;

    btn.appendChild(iconSpan);
    btn.appendChild(nameSpan);

    btn.addEventListener("click", function () {
      saveHourActivity(dayName, hourIndex, item.name);
      closeModal();
    });

    suggestionsGrid.appendChild(btn);
  });
  modal.appendChild(suggestionsGrid);

  const customInput = document.createElement("input");
  customInput.type = "text";
  customInput.placeholder = "Or type your own...";
  customInput.value = "";
  customInput.id = "custom-activity-input";
  modal.appendChild(customInput);

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "8px";
  buttonContainer.style.marginTop = "8px";

  const customBtn = document.createElement("button");
  customBtn.textContent = "💾 Save";
  customBtn.id = "save-custom-btn";
  customBtn.style.flex = "1";
  customBtn.addEventListener("click", function () {
    if (customInput.value.trim() !== "") {
      saveHourActivity(dayName, hourIndex, customInput.value.trim());
    }
    closeModal();
  });
  buttonContainer.appendChild(customBtn);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "🗑️ Remove";
  removeBtn.style.flex = "1";
  removeBtn.style.backgroundColor = "#ef4444";
  removeBtn.style.color = "#fff";
  removeBtn.style.border = "none";
  removeBtn.style.borderRadius = "6px";
  removeBtn.style.padding = "10px";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.fontSize = "14px";
  removeBtn.style.fontWeight = "500";
  removeBtn.style.transition = "0.2s";

  removeBtn.addEventListener("mouseenter", function () {
    removeBtn.style.backgroundColor = "#dc2626";
  });
  removeBtn.addEventListener("mouseleave", function () {
    removeBtn.style.backgroundColor = "#ef4444";
  });

  removeBtn.addEventListener("click", function () {
    const dayData = getDayData(dayName);
    dayData.hours[hourIndex] = "";
    saveDayData(dayName, dayData);
    closeModal();
    openDay(dayName);
  });

  if (currentActivity) {
    buttonContainer.appendChild(removeBtn);
  }

  modal.appendChild(buttonContainer);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.id = "close-modal-btn";
  closeBtn.addEventListener("click", function () { closeModal(); });
  modal.appendChild(closeBtn);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
}

// ===== دالة حفظ النشاط =====
function saveHourActivity(dayName, hourIndex, activityName) {
  const dayData = getDayData(dayName);
  dayData.hours[hourIndex] = activityName;
  saveDayData(dayName, dayData);
  openDay(dayName);
}

// ===== دالة إغلاق المودال =====
function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) overlay.remove();
}
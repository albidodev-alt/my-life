// ========================================
// MY LIFE HUB - DAY VIEW (Fixed Modals)
// ========================================

const activitySuggestions = [
  { icon: "☀️", name: "Wake Up", lucide: "alarm-clock" },
  { icon: "😴", name: "Sleep", lucide: "moon" },
  { icon: "📚", name: "Study", lucide: "book-open" },
  { icon: "🎓", name: "University", lucide: "graduation-cap" },
  { icon: "🏫", name: "High School", lucide: "school" },
  { icon: "🏋️", name: "Gym", lucide: "dumbbell" },
  { icon: "⚽", name: "Sport", lucide: "activity" },
  { icon: "💻", name: "Work", lucide: "briefcase" },
  { icon: "🍽️", name: "Food", lucide: "utensils" },
  { icon: "🧘", name: "Rest", lucide: "coffee" },
  { icon: "🚗", name: "Commute", lucide: "car" },
  { icon: "🎮", name: "Free Time", lucide: "gamepad-2" }
];

// ========================================
// دوال مساعدة
// ========================================

function formatHourRange(h) {
  if (typeof getHourSystem === 'function' && getHourSystem() === '24h') {
    return String(h).padStart(2, '0') + ':00 - ' + String(h + 1).padStart(2, '0') + ':00';
  }
  const f = h => ((h % 12) || 12) + ':00 ' + (h >= 12 ? 'PM' : 'AM');
  return f(h) + ' - ' + f(h + 1);
}

function getHourColor() { return '#dbeafe'; }

function getTextStyle() {
  return { color: '#1e293b', textShadow: 'none', labelColor: 'rgba(30,41,59,0.5)' };
}

function getActivityIcon(name) {
  return activitySuggestions.find(s => s.name === name)?.lucide || 'circle';
}

function getActivityName(hourData) {
  if (!hourData) return '';
  if (typeof hourData === 'string') return hourData;
  if (typeof hourData === 'object') return hourData.activity || '';
  return '';
}

function getAlternativeName(hourData) {
  if (!hourData || typeof hourData !== 'object') return '';
  return hourData.alternative || '';
}

function getCurrentDisplayedActivity(hourData) {
  if (!hourData || typeof hourData !== 'object') {
    return typeof hourData === 'string' ? hourData : '';
  }
  return hourData.showingAlternative ? hourData.alternative : hourData.activity;
}

// ========================================
// تنسيق الوقت
// ========================================

function formatTime12(hour, minute = 0) {
  if (typeof getHourSystem === 'function' && getHourSystem() === '24h') {
    return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
  }
  const isArabic = localStorage.getItem('language') === 'ar';
  const h12 = hour % 12 || 12;
  const m = minute.toString().padStart(2, '0');
  const ampm = isArabic ? (hour >= 12 ? 'مساءً' : 'صباحاً') : (hour >= 12 ? 'PM' : 'AM');
  return h12 + ':' + m + ' ' + ampm;
}

// ========================================
// دوال النوم
// ========================================

function calcSleep(sh, sm, wh, wm) {
  let diff = (wh * 60 + wm) - (sh * 60 + sm);
  if (diff < 0) diff += 1440;
  return { hours: Math.floor(diff / 60), minutes: diff % 60 };
}

function getSleepQuality(hours) {
  if (hours >= 7 && hours <= 9) return { emoji: '🟢', label: 'excellent' };
  if (hours >= 6) return { emoji: '🟡', label: 'good' };
  if (hours >= 5) return { emoji: '🟠', label: 'fair' };
  return { emoji: '🔴', label: 'poor' };
}

function getLabel(key, fallback) {
  return typeof t === 'function' ? t(key, fallback) : fallback;
}

function formatSleepDisplay(label, time, label2, time2) {
  return `
    <span class="sleep-info-item">
      <span data-lucide="moon" class="sleep-info-icon sleep-icon"></span>
      <span class="sleep-info-label">${label}</span>
      <span class="sleep-info-time">${time}</span>
    </span>
    <span class="sleep-info-divider"></span>
    <span class="sleep-info-item">
      <span data-lucide="sun" class="sleep-info-icon wake-icon"></span>
      <span class="sleep-info-label">${label2}</span>
      <span class="sleep-info-time">${time2}</span>
    </span>
  `;
}

// ========================================
// مودال النوم (باستخدام createModal)
// ========================================

function openSleepModal(dayName) {
  const data = getDayData(dayName);
  const sH = data.sleepHour ?? 23, sM = data.sleepMinute ?? 0;
  const wH = data.wakeHour ?? 6, wM = data.wakeMinute ?? 0;

  const t = (k, fb) => typeof window.t === 'function' ? window.t(k, fb) : fb;

  const modal = createModal({
    id: 'sleep-modal',
    title: `<span data-lucide="moon"></span> ${t('sleep_settings', 'Sleep Settings')}`,
    size: 'small'
  });

  // رسالة توضيحية
  const subtitle = document.createElement('p');
  subtitle.className = 'modal-base-message';
  subtitle.style.marginBottom = '16px';
  subtitle.textContent = t('set_sleep_wake', 'Set your sleep and wake-up times');
  modal.body.appendChild(subtitle);

  // ===== وقت النوم =====
  const sleepLabel = document.createElement('label');
  sleepLabel.className = 'modal-base-label';
  sleepLabel.innerHTML = '<span data-lucide="moon" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;color:#6366f1;"></span> ' + t('sleep_time', 'Sleep Time');
  modal.body.appendChild(sleepLabel);

  const sleepRow = document.createElement('div');
  sleepRow.style.cssText = 'display:flex;gap:12px;margin-bottom:16px;';

  const sleepHourSelect = document.createElement('select');
  sleepHourSelect.className = 'modal-base-select';
  sleepHourSelect.style.flex = '1';
  for (let i = 0; i < 24; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = String(i).padStart(2, '0') + ':00';
    if (i === sH) opt.selected = true;
    sleepHourSelect.appendChild(opt);
  }

  const sleepMinuteSelect = document.createElement('select');
  sleepMinuteSelect.className = 'modal-base-select';
  sleepMinuteSelect.style.flex = '1';
  for (let i = 0; i < 12; i++) {
    const m = i * 5;
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = ':' + String(m).padStart(2, '0');
    if (m === sM) opt.selected = true;
    sleepMinuteSelect.appendChild(opt);
  }

  sleepRow.appendChild(sleepHourSelect);
  sleepRow.appendChild(sleepMinuteSelect);
  modal.body.appendChild(sleepRow);

  // ===== وقت الاستيقاظ =====
  const wakeLabel = document.createElement('label');
  wakeLabel.className = 'modal-base-label';
  wakeLabel.innerHTML = '<span data-lucide="sun" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;color:#f59e0b;"></span> ' + t('wake_time', 'Wake Time');
  modal.body.appendChild(wakeLabel);

  const wakeRow = document.createElement('div');
  wakeRow.style.cssText = 'display:flex;gap:12px;margin-bottom:16px;';

  const wakeHourSelect = document.createElement('select');
  wakeHourSelect.className = 'modal-base-select';
  wakeHourSelect.style.flex = '1';
  for (let i = 0; i < 24; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = String(i).padStart(2, '0') + ':00';
    if (i === wH) opt.selected = true;
    wakeHourSelect.appendChild(opt);
  }

  const wakeMinuteSelect = document.createElement('select');
  wakeMinuteSelect.className = 'modal-base-select';
  wakeMinuteSelect.style.flex = '1';
  for (let i = 0; i < 12; i++) {
    const m = i * 5;
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = ':' + String(m).padStart(2, '0');
    if (m === wM) opt.selected = true;
    wakeMinuteSelect.appendChild(opt);
  }

  wakeRow.appendChild(wakeHourSelect);
  wakeRow.appendChild(wakeMinuteSelect);
  modal.body.appendChild(wakeRow);

  // ===== الأزرار =====
  const actions = createModalActions([
    {
      label: t('cancel', 'Cancel'),
      type: 'secondary',
      onClick: () => modal.close()
    },
    {
      label: `<span data-lucide="check"></span> ${t('save', 'Save')}`,
      type: 'primary',
      onClick: () => {
        const d = getDayData(dayName);
        d.sleepHour = +sleepHourSelect.value;
        d.sleepMinute = +sleepMinuteSelect.value;
        d.wakeHour = +wakeHourSelect.value;
        d.wakeMinute = +wakeMinuteSelect.value;
        saveDayData(dayName, d);
        modal.close();
        setTimeout(() => openDay(dayName), 250);
      }
    }
  ]);
  modal.body.appendChild(actions);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// فتح صفحة اليوم
// ========================================

function openDay(dayName) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const data = getDayData(dayName);
  const isToday = dayName === ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const currentHour = isToday ? new Date().getHours() : -1;

  const back = document.createElement('button');
  back.id = 'back-btn';
  back.textContent = '← ' + (typeof t === 'function' ? t('back', 'Back') : 'Back');
  back.onclick = () => renderWeek();
  app.appendChild(back);

  const title = document.createElement('h2');
  title.textContent = typeof translateDay === 'function' ? translateDay(dayName) : dayName;
  app.appendChild(title);

  const grid = document.createElement('div');
  grid.id = 'hours-grid';
  grid.dataset.dayName = dayName;

  for (let i = 0; i < 24; i++) {
    const box = document.createElement('div');
    box.className = 'hour-box' + (isToday && i === currentHour ? ' current-hour' : '');
    box.dataset.hour = i;
    box.dataset.label = formatHourRange(i);
    
    const hourData = data.hours[i];
    const displayedActivity = getCurrentDisplayedActivity(hourData);
    const hasAlternative = getAlternativeName(hourData) !== '';
    
    box.dataset.activity = displayedActivity || '';
    box.dataset.hasAlternative = hasAlternative ? 'true' : 'false';
    
    box.style.cssText = 'background:#dbeafe;color:#1e293b;border-color:rgba(79,142,219,0.2);overflow:hidden;min-width:0;position:relative;';

    const label = document.createElement('span');
    label.className = 'hour-label';
    label.textContent = formatHourRange(i);
    label.style.color = 'rgba(30,41,59,0.5)';
    box.appendChild(label);

    const act = document.createElement('div');
    act.className = 'hour-activity';
    act.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      color: #1e293b;
      font-family: var(--font-handwritten);
      font-size: var(--font-sm);
      font-weight: 600;
      overflow: hidden;
      max-width: 100%;
      min-width: 0;
    `;

    if (displayedActivity) {
      const icon = document.createElement('span');
      icon.setAttribute('data-lucide', getActivityIcon(displayedActivity));
      icon.style.cssText = `
        width: 16px;
        height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      `;
      act.appendChild(icon);
      
      const txt = document.createElement('span');
      const translatedText = typeof t === 'function' ? t(displayedActivity, displayedActivity) : displayedActivity;
      txt.textContent = translatedText;
      
      txt.style.cssText = `
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        min-width: 0;
        display: block;
      `;
      
      act.appendChild(txt);
    }
    box.appendChild(act);

    if (hasAlternative) {
      const swapIcon = document.createElement('span');
      swapIcon.className = 'hour-swap-icon';
      swapIcon.setAttribute('data-lucide', 'refresh-cw');
      swapIcon.dataset.hour = i;
      swapIcon.dataset.dayName = dayName;
      swapIcon.title = typeof t === 'function' ? t('swap_activity', 'Swap with alternative') : 'Swap with alternative';
      box.appendChild(swapIcon);
    }

    grid.appendChild(box);
  }

  grid.onclick = e => {
    const swapIcon = e.target.closest('.hour-swap-icon');
    if (swapIcon) {
      e.stopPropagation();
      const hourIndex = +swapIcon.dataset.hour;
      swapActivity(dayName, hourIndex);
      return;
    }
    
    const box = e.target.closest('.hour-box');
    if (!box) return;
    const day = box.closest('#hours-grid')?.dataset.dayName;
    if (!day) return;
    openHourModal(day, +box.dataset.hour, box.dataset.label, box.dataset.activity);
  };

  app.appendChild(grid);

  // ========================================
  // Day For Card
  // ========================================
  const dfBox = document.createElement('div');
  dfBox.id = 'day-for-box';
  dfBox.className = 'day-for-card';
  
  const dfIcon = document.createElement('div');
  dfIcon.className = 'day-for-icon';
  dfIcon.innerHTML = '<span data-lucide="target"></span>';
  
  const dfContent = document.createElement('div');
  dfContent.className = 'day-for-content';
  
  const dfLabel = document.createElement('div');
  dfLabel.className = 'day-for-title';
  dfLabel.innerHTML = '<span data-lucide="sparkles" class="day-for-title-icon"></span>' + 
    (typeof t === 'function' ? t('day_for', 'Day For') : 'Day For');
  
  const dfValue = document.createElement('div');
  dfValue.id = 'day-for-value';
  dfValue.className = 'day-for-value' + (data.dayFor ? '' : ' empty');
  dfValue.textContent = data.dayFor || (typeof t === 'function' ? t('click_to_set', 'Click to set your focus for today') : 'Click to set your focus for today');
  
  const dfEdit = document.createElement('div');
  dfEdit.className = 'day-for-edit';
  dfEdit.innerHTML = '<span data-lucide="pencil"></span>';
  
  dfContent.append(dfLabel, dfValue);
  dfBox.append(dfIcon, dfContent, dfEdit);
  
  dfBox.onclick = () => {
    promptModal({
      title: typeof t === 'function' ? t('day_for', 'Day For') : 'Day For',
      message: typeof t === 'function' ? t('what_is_day_for', 'What is this day for?') : 'What is this day for?',
      label: typeof t === 'function' ? t('day_for', 'Focus') : 'Focus',
      placeholder: typeof t === 'function' ? t('click_to_set', 'e.g. Study for exams') : 'e.g. Study for exams',
      defaultValue: data.dayFor || '',
      confirmLabel: typeof t === 'function' ? t('save', 'Save') : 'Save',
      cancelLabel: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
      maxLength: 100,
      onConfirm: (value) => {
        data.dayFor = value;
        saveDayData(dayName, data);
        openDay(dayName);
      }
    });
  };
  app.appendChild(dfBox);

  // ========================================
  // Sleep Card
  // ========================================
  const sH = data.sleepHour, sM = data.sleepMinute, wH = data.wakeHour, wM = data.wakeMinute;
  const hasSleep = sH !== undefined && sH !== null && sM !== undefined && sM !== null;
  const hasWake = wH !== undefined && wH !== null && wM !== undefined && wM !== null;

  const card = document.createElement('div');
  card.className = 'sleep-card';
  card.style.cssText = `
    background:var(--bg-card);
    border:1px solid var(--border-color);
    border-radius:12px;
    padding:16px 20px;
    margin-top:16px;
    box-shadow:var(--shadow-sm);
    transition:all 0.2s ease;
    cursor:pointer;
    overflow: hidden;
    word-break: break-word;
  `;
  card.onmouseenter = function() { this.style.boxShadow = 'var(--shadow-md)'; this.style.transform = 'translateY(-2px)'; };
  card.onmouseleave = function() { this.style.boxShadow = 'var(--shadow-sm)'; this.style.transform = 'translateY(0)'; };
  card.onclick = () => openSleepModal(dayName);

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;';
  
  const info = document.createElement('div');
  info.style.cssText = 'display:flex;align-items:center;gap:12px;font-family:var(--font-handwritten);font-size:16px;color:var(--text-primary);flex:1;min-width:0;flex-wrap:wrap;';
  
  const txt = document.createElement('span');
  txt.style.cssText = 'font-weight:600;direction:ltr;word-break: break-word;overflow: hidden;text-overflow: ellipsis;display: flex;align-items: center; gap: 8px; flex-wrap: wrap;';

  const sl = getLabel('sleep', 'Sleep');
  const wl = getLabel('wake', 'Wake');
  const ns = getLabel('not_set', 'Not set');

  if (hasSleep && hasWake) {
    txt.innerHTML = formatSleepDisplay(sl, formatTime12(sH, sM), wl, formatTime12(wH, wM));
  } else if (hasSleep) {
    txt.innerHTML = `
      <span class="sleep-info-item">
        <span data-lucide="moon" class="sleep-info-icon sleep-icon"></span>
        <span class="sleep-info-label">${sl}</span>
        <span class="sleep-info-time">${formatTime12(sH, sM)}</span>
      </span>
      <span class="sleep-info-divider"></span>
      <span class="sleep-info-item">
        <span data-lucide="sun" class="sleep-info-icon wake-icon"></span>
        <span class="sleep-info-label">${wl}</span>
        <span class="sleep-info-time sleep-info-empty">${ns}</span>
      </span>
    `;
  } else if (hasWake) {
    txt.innerHTML = `
      <span class="sleep-info-item">
        <span data-lucide="moon" class="sleep-info-icon sleep-icon"></span>
        <span class="sleep-info-label">${sl}</span>
        <span class="sleep-info-time sleep-info-empty">${ns}</span>
      </span>
      <span class="sleep-info-divider"></span>
      <span class="sleep-info-item">
        <span data-lucide="sun" class="sleep-info-icon wake-icon"></span>
        <span class="sleep-info-label">${wl}</span>
        <span class="sleep-info-time">${formatTime12(wH, wM)}</span>
      </span>
    `;
  } else {
    txt.innerHTML = `
      <span class="sleep-info-item">
        <span data-lucide="moon" class="sleep-info-icon sleep-icon"></span>
        <span class="sleep-info-label">${sl}</span>
        <span class="sleep-info-time sleep-info-empty">${ns}</span>
      </span>
      <span class="sleep-info-divider"></span>
      <span class="sleep-info-item">
        <span data-lucide="sun" class="sleep-info-icon wake-icon"></span>
        <span class="sleep-info-label">${wl}</span>
        <span class="sleep-info-time sleep-info-empty">${ns}</span>
      </span>
    `;
  }
  info.appendChild(txt);
  row.appendChild(info);

  const durRow = document.createElement('div');
  durRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-light);font-family:var(--font-handwritten);font-size:15px;color:var(--text-secondary);flex-wrap:wrap;gap:8px;';

  if (hasSleep && hasWake) {
    const dur = calcSleep(sH, sM, wH, wM);
    const q = getSleepQuality(dur.hours);
    const qLabel = typeof t === 'function' && t(q.label) ? t(q.label) : q.label.charAt(0).toUpperCase() + q.label.slice(1);
    const isArabic = localStorage.getItem('language') === 'ar';
    const durStr = isArabic 
      ? `${dur.hours} ساعة${dur.hours > 1 ? 'ات' : ''}${dur.minutes > 0 ? ' و ' + dur.minutes + ' دقيقة' : ''}`
      : `${dur.hours}h${dur.minutes > 0 ? ' ' + dur.minutes + 'm' : ''}`;
    
    const dText = document.createElement('span');
    dText.textContent = '⏱️ ' + (typeof t === 'function' ? t('total_sleep', 'Total Sleep') : 'Total Sleep') + ': ' + durStr;
    dText.style.fontWeight = '600';

    const qText = document.createElement('span');
    qText.textContent = q.emoji + ' ' + qLabel;
    qText.style.cssText = `
      padding:4px 12px;border-radius:20px;
      background:${q.emoji === '🟢' ? 'rgba(76,175,132,0.15)' : q.emoji === '🟡' ? 'rgba(245,166,35,0.15)' : q.emoji === '🟠' ? 'rgba(255,152,0,0.15)' : 'rgba(231,76,94,0.15)'};
      color:${q.emoji === '🟢' ? '#2e7d5e' : q.emoji === '🟡' ? '#b7791f' : q.emoji === '🟠' ? '#c77800' : '#c0392b'};
      font-weight:600;font-size:13px;
    `;
    durRow.append(dText, qText);
  } else {
    const nt = document.createElement('span');
    nt.textContent = typeof t === 'function' ? t('track_sleep', '⏱️ Set sleep and wake times to track your sleep') : '⏱️ Set sleep and wake times to track your sleep';
    nt.style.opacity = '0.6';
    durRow.appendChild(nt);
  }

  card.append(row, durRow);
  app.appendChild(card);

  setTimeout(() => { if (typeof initLucideIcons === 'function') initLucideIcons(); }, 50);
}

// ========================================
// دالة التبديل
// ========================================

function swapActivity(dayName, hourIndex) {
  const data = getDayData(dayName);
  const hourData = data.hours[hourIndex];
  
  if (!hourData || typeof hourData !== 'object') return;
  if (!hourData.alternative) return;
  
  hourData.showingAlternative = !hourData.showingAlternative;
  saveDayData(dayName, data);
  
  const box = document.querySelector(`#hours-grid .hour-box[data-hour="${hourIndex}"]`);
  if (!box) return;
  
  const newActivity = hourData.showingAlternative ? hourData.alternative : hourData.activity;
  box.dataset.activity = newActivity;
  
  const act = box.querySelector('.hour-activity');
  if (act) {
    act.innerHTML = '';
    
    const icon = document.createElement('span');
    icon.setAttribute('data-lucide', getActivityIcon(newActivity));
    icon.style.cssText = 'width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;';
    act.appendChild(icon);
    
    const txt = document.createElement('span');
    const translatedText = typeof t === 'function' ? t(newActivity, newActivity) : newActivity;
    txt.textContent = translatedText;
    txt.style.cssText = 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;min-width:0;display:block;';
    act.appendChild(txt);
  }
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }, 10);
}

// ========================================
// مودال النشاط (باستخدام createModal)
// ========================================

function openHourModal(dayName, hourIndex, label, currentActivity) {
  const t = (k, fb) => typeof window.t === 'function' ? window.t(k, fb) : fb;
  const data = getDayData(dayName);
  const hourData = data.hours[hourIndex];
  
  const primaryActivity = getActivityName(hourData) || currentActivity;
  const alternativeActivity = getAlternativeName(hourData);
  
  const translatedCurrentActivity = primaryActivity ? t(primaryActivity, primaryActivity) : '';
  const translatedAlternative = alternativeActivity ? t(alternativeActivity, alternativeActivity) : '';

  const modal = createModal({
    id: 'hour-modal',
    title: label,
    size: 'medium'
  });

  // ===== القسم الأساسي =====
  const primarySection = document.createElement('div');
  primarySection.className = 'activity-section';
  
  const primaryLabel = document.createElement('div');
  primaryLabel.className = 'activity-section-label';
  primaryLabel.innerHTML = `
    <span data-lucide="star" class="activity-section-icon primary-icon"></span>
    <span>${t('primary_activity', 'Primary Activity')}</span>
  `;
  primarySection.appendChild(primaryLabel);

  if (primaryActivity) {
    const primaryCard = document.createElement('div');
    primaryCard.className = 'activity-display-card primary-card';
    primaryCard.innerHTML = `
      <span data-lucide="${getActivityIcon(primaryActivity)}" class="activity-display-icon"></span>
      <span class="activity-display-name">${translatedCurrentActivity}</span>
    `;
    primarySection.appendChild(primaryCard);
  } else {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'activity-display-card empty-card';
    emptyCard.innerHTML = `
      <span data-lucide="circle-dashed" class="activity-display-icon"></span>
      <span class="activity-display-name">${t('no_activity_selected', 'No activity selected')}</span>
    `;
    primarySection.appendChild(emptyCard);
  }
  modal.body.appendChild(primarySection);

  // ===== قسم البديل =====
  if (primaryActivity) {
    const altSection = document.createElement('div');
    altSection.className = 'activity-section';
    
    const altLabel = document.createElement('div');
    altLabel.className = 'activity-section-label';
    altLabel.innerHTML = `
      <span data-lucide="refresh-cw" class="activity-section-icon alt-icon"></span>
      <span>${t('alternative_activity', 'Alternative Activity')}</span>
    `;

    if (alternativeActivity) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'activity-remove-btn';
      removeBtn.title = t('remove_alternative', 'Remove Alternative');
      removeBtn.innerHTML = '<span data-lucide="trash-2"></span>';
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        const d = getDayData(dayName);
        const existing = d.hours[hourIndex];
        if (typeof existing === 'object') {
          d.hours[hourIndex] = existing.activity || '';
        }
        saveDayData(dayName, d);
        modal.close();
        setTimeout(() => openDay(dayName), 250);
      };
      altLabel.appendChild(removeBtn);
    }
    altSection.appendChild(altLabel);

    if (alternativeActivity) {
      const altCard = document.createElement('div');
      altCard.className = 'activity-display-card alternative-card';
      altCard.innerHTML = `
        <span data-lucide="${getActivityIcon(alternativeActivity)}" class="activity-display-icon"></span>
        <span class="activity-display-name">${translatedAlternative}</span>
      `;
      
      const changeBtn = document.createElement('button');
      changeBtn.type = 'button';
      changeBtn.className = 'activity-change-btn';
      changeBtn.title = t('change_alternative', 'Change Alternative');
      changeBtn.innerHTML = '<span data-lucide="pencil"></span>';
      changeBtn.onclick = (e) => {
        e.stopPropagation();
        modal.close();
        setTimeout(() => openAlternativeModal(dayName, hourIndex), 250);
      };
      altCard.appendChild(changeBtn);
      
      altSection.appendChild(altCard);
    } else {
      const addAltBtn = document.createElement('button');
      addAltBtn.type = 'button';
      addAltBtn.className = 'activity-add-alt-btn';
      addAltBtn.innerHTML = `
        <span data-lucide="plus"></span>
        <span>${t('add_alternative', 'Add Alternative Activity')}</span>
      `;
      addAltBtn.onclick = () => {
        modal.close();
        setTimeout(() => openAlternativeModal(dayName, hourIndex), 250);
      };
      altSection.appendChild(addAltBtn);
    }
    modal.body.appendChild(altSection);
  }

  // ===== اختيار النشاط =====
  const chooseLabel = document.createElement('p');
  chooseLabel.className = 'modal-base-message';
  chooseLabel.style.marginTop = '16px';
  chooseLabel.style.marginBottom = '12px';
  chooseLabel.textContent = t('choose_activity', 'Choose an activity');
  modal.body.appendChild(chooseLabel);

  const suggestionsGrid = document.createElement('div');
  suggestionsGrid.id = 'suggestions-grid';
  suggestionsGrid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;';

  activitySuggestions.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'suggestion-btn' + (item.name === primaryActivity ? ' selected' : '');
    btn.dataset.activity = item.name;
    btn.innerHTML = `
      <span data-lucide="${item.lucide}" class="suggestion-btn-icon"></span>
      <span class="suggestion-btn-label">${t(item.name, item.name)}</span>
    `;
    btn.onclick = () => {
      const d = getDayData(dayName);
      const existing = d.hours[hourIndex];
      
      if (typeof existing === 'object' && existing.alternative) {
        d.hours[hourIndex] = {
          activity: item.name,
          alternative: existing.alternative,
          showingAlternative: false
        };
      } else {
        d.hours[hourIndex] = item.name;
      }
      
      saveDayData(dayName, d);
      modal.close();
      setTimeout(() => openDay(dayName), 250);
    };
    suggestionsGrid.appendChild(btn);
  });
  modal.body.appendChild(suggestionsGrid);

  // ===== حقل الإدخال المخصص =====
  const customInput = document.createElement('input');
  customInput.type = 'text';
  customInput.className = 'activity-custom-input';
  customInput.placeholder = t('type_own_activity', 'Or type your own...');
  modal.body.appendChild(customInput);

  // ===== الأزرار =====
  const buttons = [];

  if (primaryActivity) {
    buttons.push({
      label: `<span data-lucide="trash-2"></span> ${t('remove', 'Remove')}`,
      type: 'danger',
      onClick: () => {
        const d = getDayData(dayName);
        d.hours[hourIndex] = '';
        saveDayData(dayName, d);
        modal.close();
        setTimeout(() => openDay(dayName), 250);
      }
    });
  }

  buttons.push({
    label: `<span data-lucide="check"></span> ${t('save', 'Save')}`,
    type: 'primary',
    onClick: () => {
      const value = customInput.value.trim();
      if (!value) {
        customInput.classList.add('modal-base-input-error');
        customInput.focus();
        setTimeout(() => customInput.classList.remove('modal-base-input-error'), 500);
        return;
      }
      
      const d = getDayData(dayName);
      const existing = d.hours[hourIndex];
      
      if (typeof existing === 'object' && existing.alternative) {
        d.hours[hourIndex] = {
          activity: value,
          alternative: existing.alternative,
          showingAlternative: false
        };
      } else {
        d.hours[hourIndex] = value;
      }
      
      saveDayData(dayName, d);
      modal.close();
      setTimeout(() => openDay(dayName), 250);
    }
  });

  const actions = createModalActions(buttons);
  modal.body.appendChild(actions);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// نافذة اختيار النشاط البديل (باستخدام createModal)
// ========================================

function openAlternativeModal(dayName, hourIndex) {
  const t = (k, fb) => typeof window.t === 'function' ? window.t(k, fb) : fb;
  const data = getDayData(dayName);
  const hourData = data.hours[hourIndex];
  const primaryActivity = getActivityName(hourData);
  const currentAlternative = getAlternativeName(hourData);

  let selectedAlternative = currentAlternative || '';

  const modal = createModal({
    id: 'alternative-modal',
    title: `<span data-lucide="refresh-cw"></span> ${t('choose_alternative', 'Choose Alternative')}`,
    size: 'medium'
  });

  // ===== معلومات النشاط الأساسي =====
  const primaryInfo = document.createElement('div');
  primaryInfo.className = 'alternative-primary-info';
  primaryInfo.innerHTML = `
    <span data-lucide="${getActivityIcon(primaryActivity)}" class="alternative-primary-icon"></span>
    <span class="alternative-primary-label">${t('primary_activity', 'Primary')}:</span>
    <strong class="alternative-primary-name">${t(primaryActivity, primaryActivity)}</strong>
  `;
  modal.body.appendChild(primaryInfo);

  // ===== رسالة توضيحية =====
  const hint = document.createElement('p');
  hint.className = 'modal-base-message';
  hint.style.marginBottom = '12px';
  hint.textContent = t('choose_alternative_hint', 'Choose an alternative activity for this hour');
  modal.body.appendChild(hint);

  // ===== شبكة البدائل =====
  const grid = document.createElement('div');
  grid.className = 'alternative-grid';
  grid.id = 'alternative-grid';

  const filteredSuggestions = activitySuggestions.filter(item => item.name !== primaryActivity);

  filteredSuggestions.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'alternative-option-btn' + (item.name === selectedAlternative ? ' selected' : '');
    btn.dataset.activity = item.name;
    btn.innerHTML = `
      <span data-lucide="${item.lucide}" class="alternative-option-icon"></span>
      <span class="alternative-option-label">${t(item.name, item.name)}</span>
    `;
    btn.onclick = () => {
      grid.querySelectorAll('.alternative-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAlternative = item.name;
      customInput.value = '';
    };
    grid.appendChild(btn);
  });
  modal.body.appendChild(grid);

  // ===== حقل الإدخال المخصص =====
  const isCustomValue = selectedAlternative && !activitySuggestions.find(s => s.name === selectedAlternative);
  
  const customInput = document.createElement('input');
  customInput.type = 'text';
  customInput.className = 'activity-custom-input';
  customInput.placeholder = t('type_own_activity', 'Or type your own...');
  customInput.value = isCustomValue ? selectedAlternative : '';
  
  customInput.addEventListener('input', function() {
    if (this.value.trim()) {
      grid.querySelectorAll('.alternative-option-btn').forEach(b => b.classList.remove('selected'));
      selectedAlternative = '';
    }
  });
  modal.body.appendChild(customInput);

  // ===== الأزرار =====
  const actions = createModalActions([
    {
      label: `<span data-lucide="x"></span> ${t('cancel', 'Cancel')}`,
      type: 'secondary',
      onClick: () => {
        modal.close();
        setTimeout(() => openHourModal(dayName, hourIndex, formatHourRange(hourIndex), primaryActivity), 250);
      }
    },
    {
      label: `<span data-lucide="check"></span> ${t('save', 'Save')}`,
      type: 'primary',
      onClick: () => {
        const custom = customInput.value.trim();
        const finalAlternative = custom || selectedAlternative;
        
        if (!finalAlternative) {
          customInput.classList.add('modal-base-input-error');
          customInput.focus();
          setTimeout(() => customInput.classList.remove('modal-base-input-error'), 500);
          return;
        }
        
        const d = getDayData(dayName);
        const hd = d.hours[hourIndex];
        const primary = getActivityName(hd) || '';
        
        d.hours[hourIndex] = {
          activity: primary,
          alternative: finalAlternative,
          showingAlternative: false
        };
        
        saveDayData(dayName, d);
        modal.close();
        setTimeout(() => openDay(dayName), 250);
      }
    }
  ]);
  modal.body.appendChild(actions);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// دالة مساعدة للتهريب الآمن
// ========================================

function escapeHtmlAlt(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// دوال التصدير
// ========================================

function saveHourActivity(dayName, hourIndex, activityName) {
  const data = getDayData(dayName);
  data.hours[hourIndex] = activityName;
  saveDayData(dayName, data);
  openDay(dayName);
}

function closeModal() {
  document.getElementById('modal-overlay')?.remove();
}

window.openDay = openDay;
window.openHourModal = openHourModal;
window.openAlternativeModal = openAlternativeModal;
window.swapActivity = swapActivity;
window.saveHourActivity = saveHourActivity;
window.closeModal = closeModal;
window.openSleepModal = openSleepModal;

console.log('✅ Day.js loaded successfully!');
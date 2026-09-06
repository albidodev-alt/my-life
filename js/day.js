const activitySuggestions = [
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

// ========================================
// تنسيق الوقت مع دعم العربية
// ========================================

function formatTime12(hour, minute = 0) {
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
  const isArabic = localStorage.getItem('language') === 'ar';
  const icon1 = isArabic ? '🛌' : '🌙';
  const icon2 = isArabic ? '☀️' : '🌅';
  return `${icon1} ${label}: ${time}  |  ${icon2} ${label2}: ${time2}`;
}

// ========================================
// مودال النوم
// ========================================

function openSleepModal(dayName) {
  const data = getDayData(dayName);
  const sH = data.sleepHour ?? 23, sM = data.sleepMinute ?? 0;
  const wH = data.wakeHour ?? 6, wM = data.wakeMinute ?? 0;

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  const modal = document.createElement('div');
  modal.id = 'hour-modal';

  const t = (k, fb) => typeof window.t === 'function' ? window.t(k, fb) : fb;

  modal.innerHTML = `
    <h3>${t('sleep_settings', 'Sleep Settings')}</h3>
    <p class="modal-subtitle">${t('set_sleep_wake', 'Set your sleep and wake-up times')}</p>
    
    <p class="modal-subtitle" style="font-weight:600;margin-top:8px;">${t('sleep_time', 'Sleep Time')}</p>
    <div style="display:flex;gap:12px;margin-bottom:12px;">
      <select id="sleep-hour" style="flex:1;padding:8px 12px;border-radius:6px;border:1px solid var(--border-input);background:var(--bg-input);color:var(--text-primary);">
        ${Array.from({length:24}, (_,i) => `<option value="${i}" ${i===sH?'selected':''}>${String(i).padStart(2,'0')}:00</option>`).join('')}
      </select>
      <select id="sleep-minute" style="flex:1;padding:8px 12px;border-radius:6px;border:1px solid var(--border-input);background:var(--bg-input);color:var(--text-primary);">
        ${Array.from({length:12}, (_,i) => i*5).map(i => `<option value="${i}" ${i===sM?'selected':''}>:${String(i).padStart(2,'0')}</option>`).join('')}
      </select>
    </div>

    <p class="modal-subtitle" style="font-weight:600;margin-top:8px;">${t('wake_time', 'Wake Time')}</p>
    <div style="display:flex;gap:12px;margin-bottom:16px;">
      <select id="wake-hour" style="flex:1;padding:8px 12px;border-radius:6px;border:1px solid var(--border-input);background:var(--bg-input);color:var(--text-primary);">
        ${Array.from({length:24}, (_,i) => `<option value="${i}" ${i===wH?'selected':''}>${String(i).padStart(2,'0')}:00</option>`).join('')}
      </select>
      <select id="wake-minute" style="flex:1;padding:8px 12px;border-radius:6px;border:1px solid var(--border-input);background:var(--bg-input);color:var(--text-primary);">
        ${Array.from({length:12}, (_,i) => i*5).map(i => `<option value="${i}" ${i===wM?'selected':''}>:${String(i).padStart(2,'0')}</option>`).join('')}
      </select>
    </div>

    <div style="display:flex;gap:8px;margin-top:8px;">
      <button id="sleep-cancel" style="flex:1;padding:12px;border:1px solid var(--border-input);border-radius:6px;background:var(--bg-input);color:var(--text-secondary);cursor:pointer;font-family:var(--font-handwritten);font-size:16px;font-weight:600;">${t('cancel', 'Cancel')}</button>
      <button id="sleep-save" style="flex:1;padding:12px;background:var(--primary-gradient);color:white;border:none;border-radius:6px;cursor:pointer;font-family:var(--font-handwritten);font-size:16px;font-weight:600;">💾 ${t('save', 'Save')}</button>
    </div>
    <button id="close-modal-btn" style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted);padding:4px 8px;border-radius:6px;line-height:1;">✕</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  modal.querySelector('#sleep-save').onclick = () => {
    const data = getDayData(dayName);
    data.sleepHour = +modal.querySelector('#sleep-hour').value;
    data.sleepMinute = +modal.querySelector('#sleep-minute').value;
    data.wakeHour = +modal.querySelector('#wake-hour').value;
    data.wakeMinute = +modal.querySelector('#wake-minute').value;
    saveDayData(dayName, data);
    close();
    openDay(dayName);
  };

  modal.querySelector('#sleep-cancel').onclick = close;
  modal.querySelector('#close-modal-btn').onclick = close;
  overlay.onclick = e => { if (e.target === overlay) close(); };
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

  // Back button
  const back = document.createElement('button');
  back.id = 'back-btn';
  back.textContent = '← ' + (typeof t === 'function' ? t('back', 'Back') : 'Back');
  back.onclick = () => renderWeek();
  app.appendChild(back);

  // Title
  const title = document.createElement('h2');
  title.textContent = typeof translateDay === 'function' ? translateDay(dayName) : dayName;
  app.appendChild(title);

  // Hours grid
  const grid = document.createElement('div');
  grid.id = 'hours-grid';
  grid.dataset.dayName = dayName;

  for (let i = 0; i < 24; i++) {
    const box = document.createElement('div');
    box.className = 'hour-box' + (isToday && i === currentHour ? ' current-hour' : '');
    box.dataset.hour = i;
    box.dataset.label = formatHourRange(i);
    box.dataset.activity = data.hours[i] || '';
    box.style.cssText = 'background:#dbeafe;color:#1e293b;border-color:rgba(79,142,219,0.2)';

    const label = document.createElement('span');
    label.className = 'hour-label';
    label.textContent = formatHourRange(i);
    label.style.color = 'rgba(30,41,59,0.5)';
    box.appendChild(label);

    const act = document.createElement('div');
    act.className = 'hour-activity';
    act.style.cssText = 'display:flex;align-items:center;gap:6px;color:#1e293b;font-family:var(--font-handwritten);font-size:var(--font-sm);font-weight:600;';

    if (data.hours[i]) {
      const icon = document.createElement('span');
      icon.setAttribute('data-lucide', getActivityIcon(data.hours[i]));
      icon.style.cssText = 'width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;';
      act.appendChild(icon);
      const txt = document.createElement('span');
      txt.textContent = data.hours[i];
      act.appendChild(txt);
    }
    box.appendChild(act);
    grid.appendChild(box);
  }

  grid.onclick = e => {
    const box = e.target.closest('.hour-box');
    if (!box) return;
    const day = box.closest('#hours-grid')?.dataset.dayName;
    if (!day) return;
    openHourModal(day, +box.dataset.hour, box.dataset.label, box.dataset.activity);
  };

  app.appendChild(grid);

  // Day For
  const dfBox = document.createElement('div');
  dfBox.id = 'day-for-box';
  const dfLabel = document.createElement('span');
  dfLabel.style.cssText = 'font-weight:600;color:var(--text-primary);';
  dfLabel.textContent = typeof t === 'function' ? t('day_for', 'Day For? ') : 'Day For? ';
  const dfValue = document.createElement('span');
  dfValue.id = 'day-for-value';
  dfValue.style.cssText = 'color:var(--text-secondary);font-weight:500;';
  dfValue.textContent = data.dayFor || (typeof t === 'function' ? t('click_to_set', 'Click to set') : 'Click to set');
  dfBox.append(dfLabel, dfValue);
  dfBox.onclick = () => {
    const val = prompt(typeof t === 'function' ? t('what_is_day_for', 'What is this day for?') : 'What is this day for?', data.dayFor || '');
    if (val !== null) { data.dayFor = val; saveDayData(dayName, data); openDay(dayName); }
  };
  app.appendChild(dfBox);

  // Sleep card
  const sH = data.sleepHour, sM = data.sleepMinute, wH = data.wakeHour, wM = data.wakeMinute;
  const hasSleep = sH !== undefined && sH !== null && sM !== undefined && sM !== null;
  const hasWake = wH !== undefined && wH !== null && wM !== undefined && wM !== null;

  const card = document.createElement('div');
  card.className = 'sleep-card';
  card.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:16px 20px;margin-top:16px;box-shadow:var(--shadow-sm);transition:all 0.2s ease;cursor:pointer;';
  card.onmouseenter = function() { this.style.boxShadow = 'var(--shadow-md)'; this.style.transform = 'translateY(-2px)'; };
  card.onmouseleave = function() { this.style.boxShadow = 'var(--shadow-sm)'; this.style.transform = 'translateY(0)'; };
  card.onclick = () => openSleepModal(dayName);

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;';
  const info = document.createElement('div');
  info.style.cssText = 'display:flex;align-items:center;gap:12px;font-family:var(--font-handwritten);font-size:16px;color:var(--text-primary);flex:1;';
  const txt = document.createElement('span');
  txt.style.cssText = 'font-weight:600;direction:ltr;';

  const sl = getLabel('sleep', 'Sleep');
  const wl = getLabel('wake', 'Wake');
  const ns = getLabel('not_set', 'Not set');

  if (hasSleep && hasWake) {
    txt.textContent = formatSleepDisplay(sl, formatTime12(sH, sM), wl, formatTime12(wH, wM));
  } else if (hasSleep) {
    txt.textContent = `${sl}: ${formatTime12(sH, sM)} | ${wl}: ${ns}`;
  } else if (hasWake) {
    txt.textContent = `${sl}: ${ns} | ${wl}: ${formatTime12(wH, wM)}`;
  } else {
    txt.textContent = `${sl}: ${ns} | ${wl}: ${ns}`;
    txt.style.opacity = '0.6';
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

  // Lucide icons
  setTimeout(() => { if (typeof initLucideIcons === 'function') initLucideIcons(); }, 50);
}

// ========================================
// مودال النشاط
// ========================================

function openHourModal(dayName, hourIndex, label, currentActivity) {
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  const modal = document.createElement('div');
  modal.id = 'hour-modal';

  const t = (k, fb) => typeof window.t === 'function' ? window.t(k, fb) : fb;

  modal.innerHTML = `
    <h3>${label}</h3>
    <p class="modal-subtitle" style="color:${currentActivity ? '#3b82f6' : '#9ca3af'};font-weight:500;">
      ${currentActivity ? t('current_activity', 'Current') + ': ' + currentActivity : t('no_activity_selected', 'No activity selected')}
    </p>
    <p class="modal-subtitle">${t('choose_activity', 'Choose an activity')}</p>
    
    <div id="suggestions-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
      ${activitySuggestions.map(item => `
        <button class="suggestion-btn${item.name === currentActivity ? ' selected' : ''}" 
                style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:12px 8px;
                       border:2px solid ${item.name === currentActivity ? 'var(--primary)' : 'var(--border-light)'};
                       border-radius:12px;background:${item.name === currentActivity ? 'var(--primary-light)' : 'var(--bg-surface)'};
                       cursor:pointer;transition:all 0.25s ease;font-family:var(--font-handwritten);font-size:12px;font-weight:600;
                       color:${item.name === currentActivity ? 'var(--primary-dark)' : 'var(--text-secondary)'};
                       min-height:64px;position:relative;box-shadow:${item.name === currentActivity ? '0 0 20px rgba(79,142,219,0.15)' : 'none'};"
                data-activity="${item.name}">
          <span data-lucide="${item.lucide}" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:${item.name === currentActivity ? 'var(--primary)' : 'var(--text-muted)'};"></span>
          <span style="font-size:11px;font-weight:600;text-align:center;line-height:1.2;color:${item.name === currentActivity ? 'var(--primary-dark)' : 'var(--text-secondary)'};">${item.name}</span>
        </button>
      `).join('')}
    </div>

    <input type="text" id="custom-activity-input" placeholder="${t('type_own_activity', 'Or type your own...')}" 
           style="width:100%;padding:10px 14px;border:2px solid var(--border-input);border-radius:10px;font-family:var(--font-body);font-size:14px;background:var(--bg-input);color:var(--text-primary);transition:all 0.2s ease;margin-bottom:12px;">

    <div style="display:flex;gap:8px;margin-top:4px;">
      <button id="save-custom-btn" style="flex:1;padding:12px;background:var(--primary-gradient);color:white;border:none;border-radius:10px;font-family:var(--font-handwritten);font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s ease;box-shadow:var(--shadow-sm);">💾 ${t('save', 'Save')}</button>
      ${currentActivity ? `<button id="remove-activity-btn" style="flex:1;padding:12px;background:#ef4444;color:white;border:none;border-radius:10px;font-family:var(--font-handwritten);font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s ease;">🗑️ ${t('remove', 'Remove')}</button>` : ''}
    </div>
    <button id="close-modal-btn" style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted);transition:all 0.2s ease;padding:4px 8px;border-radius:6px;line-height:1;">✕</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  // Suggestions
  modal.querySelectorAll('#suggestions-grid .suggestion-btn').forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.activity;
      const data = getDayData(dayName);
      data.hours[hourIndex] = name;
      saveDayData(dayName, data);
      close();
      openDay(dayName);
    };
    btn.onmouseenter = function() { if (!this.classList.contains('selected')) { this.style.borderColor = 'var(--primary)'; this.style.background = 'var(--bg-hover)'; this.style.transform = 'translateY(-3px)'; this.style.boxShadow = 'var(--shadow-sm)'; } };
    btn.onmouseleave = function() { if (!this.classList.contains('selected')) { this.style.borderColor = 'var(--border-light)'; this.style.background = 'var(--bg-surface)'; this.style.transform = 'translateY(0)'; this.style.boxShadow = 'none'; } };
  });

  // Custom activity
  const customInput = modal.querySelector('#custom-activity-input');
  modal.querySelector('#save-custom-btn').onclick = () => {
    if (customInput.value.trim()) {
      const data = getDayData(dayName);
      data.hours[hourIndex] = customInput.value.trim();
      saveDayData(dayName, data);
      close();
      openDay(dayName);
    }
  };

  // Remove
  const removeBtn = modal.querySelector('#remove-activity-btn');
  if (removeBtn) {
    removeBtn.onclick = () => {
      const data = getDayData(dayName);
      data.hours[hourIndex] = '';
      saveDayData(dayName, data);
      close();
      openDay(dayName);
    };
  }

  modal.querySelector('#close-modal-btn').onclick = close;
  overlay.onclick = e => { if (e.target === overlay) close(); };

  setTimeout(() => { if (typeof initLucideIcons === 'function') initLucideIcons(); }, 50);
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

// ========================================
// تصدير للاستخدام الخارجي
// ========================================

window.openDay = openDay;
window.openHourModal = openHourModal;
window.saveHourActivity = saveHourActivity;
window.closeModal = closeModal;
window.openSleepModal = openSleepModal;

console.log('✅ Day.js loaded successfully!');
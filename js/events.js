// ========================================
// MY LIFE HUB - EVENTS (CALENDAR) v2.4
// (Quick Add + No Add Event Button + Inline Add From Day)
// ========================================

const EVENTS_STORAGE_KEY = "myLifeHub_events";

// ===== ✅ كاش في الذاكرة =====
let eventsCache = null;

// ========================================
// ✅ إبطال الكاش
// ========================================
function invalidateEventsCache() {
  eventsCache = null;
}

// ========================================
// ✅ مزامنة بين Tabs
// ========================================
if (typeof window !== 'undefined') {
  window.addEventListener('storage', function (e) {
    if (e.key === EVENTS_STORAGE_KEY) {
      console.log('🔄 Events changed in another tab. Invalidating cache.');
      eventsCache = null;
    }
  });
}

// ========================================
// ✅ دوال التخزين الآمنة
// ========================================
function safeSetEvents(key, value) {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.warn('⚠️ localStorage quota exceeded for events');
      if (typeof showToast === 'function') {
        showToast(
          '⚠️ ' + (typeof t === 'function'
            ? t('storage_full', 'Storage is full. Please delete some events.')
            : 'Storage is full. Please delete some events.'),
          'warning',
          5000
        );
      }
      return { success: false, error: 'quota' };
    }
    console.error('Error saving events:', err);
    return { success: false, error: 'unknown' };
  }
}

// ========================================
// ✅ نسخة من الأحداث (للاستخدام عند التعديل)
// ========================================
function getEventsCopy() {
  if (typeof deepClone === 'function') {
    return deepClone(getAllEvents());
  }
  try {
    return JSON.parse(JSON.stringify(getAllEvents()));
  } catch (e) {
    console.warn('getEventsCopy failed:', e);
    return getAllEvents();
  }
}

// ========================================
// ✅ قراءة آمنة للتاريخ
// ========================================
function parseEventDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const d = new Date(dateStr + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

// ========================================
// دوال التخزين (مع كاش)
// ========================================

function getAllEvents() {
  if (eventsCache !== null) return eventsCache;

  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      eventsCache = [];
      return eventsCache;
    }
    const events = JSON.parse(raw);
    eventsCache = Array.isArray(events) ? events : [];
    return eventsCache;
  } catch (error) {
    console.error("Error loading events:", error);
    eventsCache = [];
    return eventsCache;
  }
}

function saveAllEvents(events) {
  if (!Array.isArray(events)) {
    console.error("saveAllEvents: events must be an array");
    return false;
  }

  const result = safeSetEvents(EVENTS_STORAGE_KEY, JSON.stringify(events));

  if (result.success) {
    eventsCache = events;
  }

  return result.success;
}

function addEvent(title, date, description = "") {
  const trimmedTitle = (title || '').trim();
  if (!trimmedTitle || !date) return null;

  const events = getEventsCopy();
  const newEvent = {
    id: (typeof generateId === "function") ? generateId() : Date.now() + Math.random(),
    title: trimmedTitle,
    date: date,
    description: (description || '').trim(),
    pinned: false,
    createdAt: new Date().toISOString()
  };

  events.push(newEvent);
  const success = saveAllEvents(events);
  return success ? newEvent : null;
}

function updateEvent(eventId, title, date, description) {
  const trimmedTitle = (title || '').trim();
  if (!trimmedTitle || !date) return false;

  const events = getEventsCopy();
  const index = events.findIndex(e => e.id === eventId);
  if (index === -1) return false;

  events[index].title = trimmedTitle;
  events[index].date = date;
  events[index].description = (description || '').trim();
  return saveAllEvents(events);
}

function deleteEvent(eventId) {
  const events = getEventsCopy();
  const updatedEvents = events.filter(e => e.id !== eventId);
  return saveAllEvents(updatedEvents);
}

function togglePinEvent(eventId) {
  const events = getEventsCopy();
  const event = events.find(e => e.id === eventId);
  if (!event) return false;

  event.pinned = !event.pinned;
  return saveAllEvents(events);
}

function getEventsByDate(events, date) {
  return events.filter(e => e.date === date);
}

function getTimeRemaining(eventDate) {
  const target = parseEventDate(eventDate);
  if (!target) return "";

  const now = new Date();
  const diff = target - now;

  if (diff < 0) return typeof t === 'function' ? t('event_passed', 'Event passed') : "Event passed";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days === 0 && hours === 0) return typeof t === 'function' ? t('today', 'Today! 🎉') : "Today! 🎉";
  if (days === 0) return hours + " " + (typeof t === 'function' ? t('hours_left', 'hours left') : "hours left");
  if (hours === 0) return days + " " + (typeof t === 'function' ? t('days_left', 'days left') : "days left");

  return days + " " + (typeof t === 'function' ? t('days', 'days') : "days") + ", " + hours + " " + (typeof t === 'function' ? t('hours', 'hours') : "hours") + " " + (typeof t === 'function' ? t('left', 'left') : "left");
}

function getEventsByMonth(events, year, month) {
  return events.filter(e => {
    if (!e.date) return false;
    const parts = e.date.split('-');
    if (parts.length !== 3) return false;
    return parseInt(parts[0], 10) === year && parseInt(parts[1], 10) === month;
  });
}

function escapeHtmlEvt(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// ✅ الحصول على لون الوقت المتبقي
// ========================================
function getRemainingColor(eventDate) {
  const target = parseEventDate(eventDate);
  if (!target) return "#6b7280";

  const now = new Date();
  const diff = target - now;
  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diff < 0) return "#6b7280";
  if (daysLeft <= 3) return "#ef4444";
  if (daysLeft <= 7) return "#f59e0b";
  return "#22c55e";
}

// ========================================
// ✅ الحصول على أيقونة الوقت المتبقي
// ========================================
function getRemainingIcon(eventDate) {
  const target = parseEventDate(eventDate);
  if (!target) return "clock";

  const now = new Date();
  const diff = target - now;
  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diff < 0) return "clock";
  if (daysLeft <= 3) return "alert-triangle";
  if (daysLeft <= 7) return "alert-circle";
  return "clock";
}

// ========================================
// ✅ تنسيق التاريخ الكامل (للعنوان)
// ========================================
function formatFullDate(dateStr) {
  const target = parseEventDate(dateStr);
  if (!target) return dateStr;

  return target.toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ========================================
// ✅ نافذة الإضافة السريعة (عنوان + وصف)
// ========================================
function openQuickAddEventModal(dateStr) {
  if (!dateStr) return;

  const modal = createModal({
    id: 'quick-add-event-modal',
    title: '<span data-lucide="calendar-plus"></span> ' + (typeof t === 'function' ? t('add_event', 'Add Event') : 'Add Event'),
    size: 'small'
  });

  // ===== عرض التاريخ =====
  const dateDisplay = document.createElement('div');
  dateDisplay.style.cssText = `
    padding: 10px 14px;
    margin-bottom: 16px;
    background: var(--primary-light);
    border: 1px solid rgba(79, 142, 219, 0.2);
    border-radius: 10px;
    font-family: var(--font-handwritten);
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-dark);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  `;
  dateDisplay.innerHTML = `
    <span data-lucide="calendar" style="width: 16px; height: 16px;"></span>
    <span>${formatFullDate(dateStr)}</span>
  `;
  modal.body.appendChild(dateDisplay);

  // ===== حقل العنوان =====
  const titleField = createModalField({
    id: 'quick-event-title',
    label: (typeof t === 'function' ? t('title', 'Title') : 'Title') + ' *',
    type: 'text',
    placeholder: typeof t === 'function' ? t('enter_event_title', 'Enter event title...') : 'Enter event title...',
    required: true,
    maxLength: 120,
    inputMode: 'text'
  });
  modal.body.appendChild(titleField.field);

  // ✅ حماية
  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(titleField.input, 'text');
  }

  // ===== حقل الوصف (اختياري) =====
  const descField = createModalField({
    id: 'quick-event-desc',
    label: typeof t === 'function' ? t('description', 'Description (optional)') : 'Description (optional)',
    type: 'textarea',
    rows: 2,
    placeholder: typeof t === 'function' ? t('add_description', 'Add a description...') : 'Add a description...',
    maxLength: 500,
    inputMode: 'content'
  });
  modal.body.appendChild(descField.field);

  // ✅ حماية
  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(descField.input, 'content');
  }

  // ===== زر الحفظ =====
  function handleSave() {
    const title = titleField.input.value.trim();
    const description = descField.input.value.trim();

    if (!title) {
      titleField.input.classList.add("modal-base-input-error");
      titleField.input.focus();
      setTimeout(() => titleField.input.classList.remove("modal-base-input-error"), 500);
      return;
    }

    const newEvent = addEvent(title, dateStr, description);

    if (!newEvent) {
      if (typeof showToast === 'function') {
        showToast('❌ ' + (typeof t === 'function' ? t('save_failed', 'Failed to save event') : 'Failed to save event'), 'error');
      }
      return;
    }

    modal.close();
    if (typeof showToast === 'function') {
      showToast('✅ ' + (typeof t === 'function' ? t('event_added', 'Event added!') : 'Event added!'), 'success', 1500);
    }
    setTimeout(() => renderEventsPage(), 250);
  }

  // ===== Enter في حقل العنوان = الحفظ =====
  titleField.input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  });

  const actions = createModalActions([
    {
      label: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
      type: 'secondary',
      onClick: () => modal.close()
    },
    {
      label: '<span data-lucide="check"></span> ' + (typeof t === 'function' ? t('add', 'Add') : 'Add'),
      type: 'primary',
      onClick: handleSave
    }
  ]);
  modal.body.appendChild(actions);

  setTimeout(() => titleField.input.focus(), 100);
}

// ========================================
// عرض تفاصيل الحدث في نافذة منبثقة
// ========================================
function openEventDetailsModal(events, dateStr) {
  const target = parseEventDate(dateStr);
  if (!target) return;

  const formattedDate = target.toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const modal = createModal({
    id: 'events-details-modal',
    title: formattedDate,
    size: 'medium'
  });

  // ========================================
  // ✅ زر "إضافة حدث لهذا اليوم" (في الأعلى)
  // ========================================
  const addEventBtn = document.createElement("button");
  addEventBtn.type = "button";
  addEventBtn.style.cssText = `
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: var(--primary-gradient);
    color: #ffffff;
    border: none;
    border-radius: 10px;
    font-family: var(--font-handwritten);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: var(--shadow-sm);
    min-height: 44px;
    -webkit-tap-highlight-color: transparent;
  `;
  addEventBtn.innerHTML = `
    <span data-lucide="plus" style="width: 16px; height: 16px; pointer-events: none;"></span>
    <span>${typeof t === 'function' ? t('add_event_to_day', 'Add Event to This Day') : 'Add Event to This Day'}</span>
  `;

  addEventBtn.addEventListener("mouseenter", function() {
    this.style.transform = "translateY(-2px)";
    this.style.boxShadow = "var(--shadow-md)";
  });
  addEventBtn.addEventListener("mouseleave", function() {
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "var(--shadow-sm)";
  });

  addEventBtn.addEventListener("click", function() {
    modal.close();
    setTimeout(() => {
      openQuickAddEventModal(dateStr);
    }, 250);
  });

  modal.body.appendChild(addEventBtn);

  // ===== عدد الأحداث =====
  const countLabel = document.createElement("p");
  countLabel.className = "modal-base-message";
  countLabel.style.marginBottom = "16px";
  countLabel.style.fontSize = "14px";
  countLabel.style.color = "var(--text-muted)";
  countLabel.textContent = events.length + " " + (typeof t === 'function' ? t('events', 'event') : "event") + (events.length > 1 ? "s" : "");
  modal.body.appendChild(countLabel);

  // ===== قائمة الأحداث =====
  const eventsList = document.createElement("div");
  eventsList.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
    max-height: 400px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  `;

  events.forEach(event => {
    const eventCard = document.createElement("div");
    eventCard.style.cssText = `
      padding: 14px 16px;
      border: 1px solid var(--border-light);
      border-radius: 10px;
      background: var(--bg-surface);
      transition: background-color 0.2s ease;
    `;

    if (event.pinned) {
      eventCard.style.borderLeft = "3px solid var(--primary)";
      eventCard.style.background = "var(--primary-light)";
    }

    const titleRow = document.createElement("div");
    titleRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-handwritten);
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      overflow-wrap: anywhere;
    `;

    if (event.pinned) {
      const pinIcon = document.createElement("span");
      pinIcon.innerHTML = '<span data-lucide="pin" style="width: 16px; height: 16px; fill: var(--primary); stroke: var(--primary); flex-shrink: 0;"></span>';
      titleRow.appendChild(pinIcon);
    }

    const eventTitle = document.createElement("span");
    eventTitle.textContent = event.title;
    titleRow.appendChild(eventTitle);

    const descRow = document.createElement("div");
    descRow.style.cssText = `
      margin-top: 6px;
      font-size: 14px;
      color: var(--text-secondary);
      overflow-wrap: anywhere;
    `;

    if (event.description) {
      descRow.innerHTML = '<span data-lucide="file-text" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + escapeHtmlEvt(event.description);
    } else {
      descRow.textContent = typeof t === 'function' ? t('no_description', 'No description') : "No description";
      descRow.style.opacity = "0.5";
    }

    const remainingRow = document.createElement("div");
    remainingRow.style.cssText = `
      margin-top: 6px;
      font-size: 13px;
      font-weight: 500;
      color: ${getRemainingColor(event.date)};
    `;

    const remaining = getTimeRemaining(event.date);
    const remainingIcon = getRemainingIcon(event.date);
    remainingRow.innerHTML = `<span data-lucide="${remainingIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ` + remaining;

    const actionsRow = document.createElement("div");
    actionsRow.style.cssText = `
      display: flex;
      gap: 8px;
      margin-top: 10px;
      flex-wrap: wrap;
    `;

    // ===== ✅ زر التثبيت =====
    const pinBtn = document.createElement("button");
    pinBtn.type = "button";
    if (event.pinned) {
      pinBtn.innerHTML = '<span data-lucide="pin-off" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + (typeof t === 'function' ? t('unpin', 'Unpin') : "Unpin");
    } else {
      pinBtn.innerHTML = '<span data-lucide="pin" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + (typeof t === 'function' ? t('pin', 'Pin') : "Pin");
    }
    pinBtn.style.cssText = `
      padding: 6px 12px;
      border: 1px solid ${event.pinned ? 'var(--primary)' : 'var(--border-input)'};
      border-radius: 6px;
      background: ${event.pinned ? 'var(--primary-light)' : 'var(--bg-input)'};
      color: ${event.pinned ? 'var(--primary-dark)' : 'var(--text-primary)'};
      cursor: pointer;
      font-family: var(--font-handwritten);
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s ease, border-color 0.2s ease;
      min-height: 36px;
    `;

    pinBtn.addEventListener("mouseenter", function() {
      this.style.backgroundColor = event.pinned ? "var(--primary)" : "var(--bg-hover)";
      this.style.color = event.pinned ? "white" : "var(--text-primary)";
      this.style.borderColor = "var(--primary)";
    });
    pinBtn.addEventListener("mouseleave", function() {
      this.style.backgroundColor = event.pinned ? "var(--primary-light)" : "var(--bg-input)";
      this.style.color = event.pinned ? "var(--primary-dark)" : "var(--text-primary)";
      this.style.borderColor = event.pinned ? "var(--primary)" : "var(--border-input)";
    });

    pinBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      togglePinEvent(event.id);
      modal.close();
      setTimeout(() => openEventDetailsModal(getAllEvents().filter(ev => ev.date === dateStr), dateStr), 250);
    });

    // ===== زر التعديل =====
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.innerHTML = '<span data-lucide="pencil" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + (typeof t === 'function' ? t('edit', 'Edit') : "Edit");
    editBtn.style.cssText = `
      padding: 6px 12px;
      border: 1px solid var(--border-input);
      border-radius: 6px;
      background: var(--bg-input);
      color: var(--text-primary);
      cursor: pointer;
      font-family: var(--font-handwritten);
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s ease, border-color 0.2s ease;
      min-height: 36px;
    `;
    editBtn.addEventListener("mouseenter", function() {
      this.style.backgroundColor = "var(--bg-hover)";
      this.style.borderColor = "var(--primary)";
    });
    editBtn.addEventListener("mouseleave", function() {
      this.style.backgroundColor = "var(--bg-input)";
      this.style.borderColor = "var(--border-input)";
    });

    editBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      modal.close();
      setTimeout(() => openEventModal(event), 250);
    });

    // ===== زر الحذف =====
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + (typeof t === 'function' ? t('delete', 'Delete') : "Delete");
    deleteBtn.style.cssText = `
      padding: 6px 12px;
      border: 1px solid #ef4444;
      border-radius: 6px;
      background: transparent;
      color: #ef4444;
      cursor: pointer;
      font-family: var(--font-handwritten);
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s ease, color 0.2s ease;
      min-height: 36px;
    `;
    deleteBtn.addEventListener("mouseenter", function() {
      this.style.backgroundColor = "#ef4444";
      this.style.color = "#ffffff";
    });
    deleteBtn.addEventListener("mouseleave", function() {
      this.style.backgroundColor = "transparent";
      this.style.color = "#ef4444";
    });

    deleteBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      deleteModal({
        itemName: event.title,
        itemType: 'event',
        onConfirm: () => {
          deleteEvent(event.id);
          modal.close();
          renderEventsPage();
        }
      });
    });

    actionsRow.appendChild(pinBtn);
    actionsRow.appendChild(editBtn);
    actionsRow.appendChild(deleteBtn);

    eventCard.appendChild(titleRow);
    eventCard.appendChild(descRow);
    eventCard.appendChild(remainingRow);
    eventCard.appendChild(actionsRow);
    eventsList.appendChild(eventCard);
  });

  modal.body.appendChild(eventsList);

  const closeActions = createModalActions([
    {
      label: typeof t === 'function' ? t('close', 'Close') : 'Close',
      type: 'secondary',
      onClick: () => modal.close()
    }
  ]);
  modal.body.appendChild(closeActions);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// عرض صفحة الأحداث
// ========================================
function renderEventsPage() {
  const app = document.getElementById("app");
  if (!app) return;

  app.replaceChildren();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // ===== Container =====
  const container = document.createElement("div");
  container.id = "events-container";

  // ===== Header (بدون زر Add Event) =====
  const header = document.createElement("div");
  header.className = "events-header";

  const headerTitleWrapper = document.createElement("div");
  headerTitleWrapper.style.cssText = "display: flex; align-items: center; gap: 12px;";

  const headerIcon = document.createElement("span");
  headerIcon.setAttribute("data-lucide", "calendar");
  headerIcon.style.cssText = "width: 32px; height: 32px; color: var(--primary);";

  const headerTitle = document.createElement("h2");
  headerTitle.className = "events-title";
  headerTitle.style.margin = "0";
  headerTitle.textContent = typeof t === 'function' ? t('events_title', 'Events') : 'Events';

  headerTitleWrapper.appendChild(headerIcon);
  headerTitleWrapper.appendChild(headerTitle);

  header.appendChild(headerTitleWrapper);
  container.appendChild(header);

  // ===== Calendar Wrapper =====
  const calendarWrapper = document.createElement("div");
  calendarWrapper.className = "calendar-wrapper";

  const calendarNav = document.createElement("div");
  calendarNav.className = "calendar-nav";

  const prevBtn = document.createElement("button");
  prevBtn.className = "calendar-nav-btn";
  prevBtn.id = "calendar-prev";
  prevBtn.type = "button";
  prevBtn.setAttribute("aria-label", "Previous month");
  prevBtn.innerHTML = '<span data-lucide="chevron-left" style="width: 24px; height: 24px;"></span>';

  const monthLabel = document.createElement("span");
  monthLabel.className = "calendar-month-year";
  monthLabel.id = "calendar-label";
  monthLabel.textContent = "January 2026";

  const nextBtn = document.createElement("button");
  nextBtn.className = "calendar-nav-btn";
  nextBtn.id = "calendar-next";
  nextBtn.type = "button";
  nextBtn.setAttribute("aria-label", "Next month");
  nextBtn.innerHTML = '<span data-lucide="chevron-right" style="width: 24px; height: 24px;"></span>';

  calendarNav.appendChild(prevBtn);
  calendarNav.appendChild(monthLabel);
  calendarNav.appendChild(nextBtn);
  calendarWrapper.appendChild(calendarNav);

  const calendarGrid = document.createElement("div");
  calendarGrid.className = "calendar-grid";

  const weekdaysRow = document.createElement("div");
  weekdaysRow.className = "calendar-weekdays";
  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach(day => {
    const span = document.createElement("span");
    span.textContent = typeof t === 'function' ? t(day, day.charAt(0).toUpperCase() + day.slice(1,3)) : day.charAt(0).toUpperCase() + day.slice(1,3);
    weekdaysRow.appendChild(span);
  });
  calendarGrid.appendChild(weekdaysRow);

  const daysContainer = document.createElement("div");
  daysContainer.className = "calendar-days";
  daysContainer.id = "calendar-days";
  calendarGrid.appendChild(daysContainer);

  calendarWrapper.appendChild(calendarGrid);
  container.appendChild(calendarWrapper);

  // ===== Events List Section =====
  const eventsListSection = document.createElement("div");
  eventsListSection.className = "events-list-section";

  const eventsListContainer = document.createElement("div");
  eventsListContainer.id = "events-list";
  eventsListSection.appendChild(eventsListContainer);

  container.appendChild(eventsListSection);

  app.appendChild(container);

  // ========================================
  // ✅ State
  // ========================================
  let currentYearState = currentYear;
  let currentMonthState = currentMonth;

  // ========================================
  // ✅ renderCalendar
  // ========================================
  function renderCalendar(year, month) {
    const daysEl = document.getElementById("calendar-days");
    const label = document.getElementById("calendar-label");
    if (!daysEl) return;

    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    label.textContent = monthNames[month - 1] + " " + year;

    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const todayStr = today.getFullYear() + '-' +
                     String(today.getMonth() + 1).padStart(2, '0') + '-' +
                     String(today.getDate()).padStart(2, '0');

    const allEvents = getAllEvents();
    const eventsThisMonth = getEventsByMonth(allEvents, year, month);
    const eventDates = new Set(eventsThisMonth.map(e => e.date));

    const pinnedDates = new Set();
    eventsThisMonth.forEach(e => {
      if (e.pinned) pinnedDates.add(e.date);
    });

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "calendar-day-empty";
      fragment.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement("div");
      const dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      const isToday = dateStr === todayStr;
      const hasEvent = eventDates.has(dateStr);
      const hasPinned = pinnedDates.has(dateStr);

      dayDiv.className = "calendar-day";
      if (isToday) dayDiv.classList.add("calendar-day-today");
      if (hasEvent) dayDiv.classList.add("calendar-day-has-event");
      if (hasPinned) dayDiv.classList.add("calendar-day-pinned");

      dayDiv.textContent = day;

      if (hasPinned) {
        const pinIcon = document.createElement("span");
        pinIcon.className = "calendar-pin-icon";
        pinIcon.innerHTML = '<span data-lucide="pin" style="width: 10px; height: 10px; fill: var(--primary); stroke: var(--primary);"></span>';
        dayDiv.appendChild(pinIcon);
      }

      // ========================================
      // ✅ سلوك الضغط على اليوم (جديد)
      // ========================================
      dayDiv.addEventListener("click", function() {
        const eventsOnDay = getEventsByDate(getAllEvents(), dateStr);

        if (eventsOnDay.length > 0) {
          // ✅ يوجد أحداث → نافذة التفاصيل (فيها زر إضافة)
          openEventDetailsModal(eventsOnDay, dateStr);
        } else {
          // ✅ فارغ → نافذة الإضافة السريعة
          openQuickAddEventModal(dateStr);
        }
      });

      fragment.appendChild(dayDiv);
    }

    daysEl.replaceChildren(fragment);
  }

  // ========================================
  // ✅ createEventCard
  // ========================================
  function createEventCard(event, showPinButton = true) {
    const card = document.createElement("div");
    card.className = "event-card";
    if (event.pinned) {
      card.classList.add("event-card-pinned");
    }

    const infoDiv = document.createElement("div");
    infoDiv.className = "event-info";

    const titleDiv = document.createElement("div");
    titleDiv.className = "event-title-row";

    const pinIcon = document.createElement("span");
    pinIcon.className = "event-pin-icon";
    if (event.pinned) {
      pinIcon.innerHTML = '<span data-lucide="pin" style="width: 16px; height: 16px; fill: var(--primary); stroke: var(--primary);"></span>';
    }
    pinIcon.style.marginRight = "6px";
    pinIcon.style.flexShrink = "0";

    const titleSpan = document.createElement("span");
    titleSpan.className = "event-title";
    titleSpan.textContent = event.title;

    titleDiv.appendChild(pinIcon);
    titleDiv.appendChild(titleSpan);

    const dateSpan = document.createElement("span");
    dateSpan.className = "event-date";
    const targetDate = parseEventDate(event.date);
    const formattedDate = targetDate
      ? targetDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })
      : event.date;
    dateSpan.innerHTML = '<span data-lucide="calendar" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + formattedDate;

    const remainingSpan = document.createElement("span");
    remainingSpan.className = "event-remaining";
    const remaining = getTimeRemaining(event.date);
    const remainingIcon = getRemainingIcon(event.date);
    remainingSpan.innerHTML = `<span data-lucide="${remainingIcon}" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ` + remaining;
    remainingSpan.style.color = getRemainingColor(event.date);

    const descSpan = document.createElement("span");
    descSpan.className = "event-description";
    if (event.description) {
      descSpan.innerHTML = '<span data-lucide="file-text" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + escapeHtmlEvt(event.description);
    }

    infoDiv.appendChild(titleDiv);
    infoDiv.appendChild(dateSpan);
    infoDiv.appendChild(remainingSpan);
    if (event.description) {
      infoDiv.appendChild(descSpan);
    }

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "event-actions";

    if (showPinButton) {
      const pinBtn = document.createElement("button");
      pinBtn.type = "button";
      pinBtn.className = "event-pin-btn";
      if (event.pinned) {
        pinBtn.innerHTML = '<span data-lucide="pin" style="width: 16px; height: 16px; fill: var(--primary); stroke: var(--primary);"></span>';
      } else {
        pinBtn.innerHTML = '<span data-lucide="pin" style="width: 16px; height: 16px;"></span>';
      }
      pinBtn.title = event.pinned ? (typeof t === 'function' ? t('unpin', 'Unpin event') : "Unpin event") : (typeof t === 'function' ? t('pin', 'Pin event') : "Pin event");
      pinBtn.setAttribute("aria-label", pinBtn.title);

      pinBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        togglePinEvent(event.id);
        renderEventsPage();
      });

      actionsDiv.appendChild(pinBtn);
    }

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "event-edit-btn";
    editBtn.innerHTML = '<span data-lucide="pencil" style="width: 16px; height: 16px;"></span>';
    editBtn.title = typeof t === 'function' ? t('edit', 'Edit event') : "Edit event";
    editBtn.setAttribute("aria-label", "Edit event");

    editBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      openEventModal(event);
    });

    actionsDiv.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "event-delete-btn";
    deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width: 16px; height: 16px;"></span>';
    deleteBtn.title = typeof t === 'function' ? t('delete', 'Delete event') : "Delete event";
    deleteBtn.setAttribute("aria-label", "Delete event");

    deleteBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      deleteModal({
        itemName: event.title,
        itemType: 'event',
        onConfirm: () => {
          deleteEvent(event.id);
          renderEventsPage();
        }
      });
    });

    actionsDiv.appendChild(deleteBtn);

    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);

    return card;
  }

  // ========================================
  // ✅ renderEventsList
  // ========================================
  function renderEventsList() {
    const listContainer = document.getElementById("events-list");
    if (!listContainer) return;

    const allEvents = getAllEvents();
    const now = new Date();
    const todayStr = now.getFullYear() + '-' +
                     String(now.getMonth() + 1).padStart(2, '0') + '-' +
                     String(now.getDate()).padStart(2, '0');

    const upcomingEvents = allEvents.filter(e => e.date && e.date >= todayStr);
    upcomingEvents.sort((a, b) => a.date.localeCompare(b.date));

    const pinnedEvents = upcomingEvents.filter(e => e.pinned);
    const unpinnedEvents = upcomingEvents.filter(e => !e.pinned);

    const fragment = document.createDocumentFragment();

    if (upcomingEvents.length === 0) {
      const empty = document.createElement("p");
      empty.className = "events-empty";
      empty.innerHTML = '<span data-lucide="calendar-x" style="width: 32px; height: 32px; vertical-align: middle; margin-right: 8px; opacity: 0.5;"></span> ' + (typeof t === 'function' ? t('no_events', 'No upcoming events. Tap a day to add one!') : "No upcoming events. Tap a day to add one!");
      fragment.appendChild(empty);
    } else {
      if (pinnedEvents.length > 0) {
        const pinnedTitle = document.createElement("h4");
        pinnedTitle.className = "events-subtitle";
        pinnedTitle.innerHTML = '<span data-lucide="pin" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; color: var(--primary);"></span> ' + (typeof t === 'function' ? t('pinned_events', 'Pinned Events') : "Pinned Events");
        fragment.appendChild(pinnedTitle);

        pinnedEvents.forEach(e => {
          const card = createEventCard(e, true);
          fragment.appendChild(card);
        });
      }

      if (unpinnedEvents.length > 0) {
        const unpinnedTitle = document.createElement("h4");
        unpinnedTitle.className = "events-subtitle";
        unpinnedTitle.innerHTML = '<span data-lucide="calendar" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; color: var(--primary);"></span> ' + (pinnedEvents.length > 0 ? (typeof t === 'function' ? t('all_events', 'All Events') : "All Events") : (typeof t === 'function' ? t('upcoming_events', 'Upcoming Events') : "Upcoming Events"));
        fragment.appendChild(unpinnedTitle);

        unpinnedEvents.forEach(e => {
          const card = createEventCard(e, true);
          fragment.appendChild(card);
        });
      }
    }

    listContainer.replaceChildren(fragment);

    if (typeof debouncedLucide === 'function') debouncedLucide(50);
  }

  // ========================================
  // ✅ Event Listeners
  // ========================================
  prevBtn.addEventListener("click", function() {
    currentMonthState--;
    if (currentMonthState < 1) {
      currentMonthState = 12;
      currentYearState--;
    }
    renderCalendar(currentYearState, currentMonthState);
    renderEventsList();
  });

  nextBtn.addEventListener("click", function() {
    currentMonthState++;
    if (currentMonthState > 12) {
      currentMonthState = 1;
      currentYearState++;
    }
    renderCalendar(currentYearState, currentMonthState);
    renderEventsList();
  });

  // ✅ Initial Render
  renderCalendar(currentYearState, currentMonthState);
  renderEventsList();
}

// ========================================
// نافذة إضافة/تعديل حدث (من التفاصيل أو التعديل)
// ========================================
function openEventModal(editEvent = null) {
  const isEditing = editEvent !== null;

  const modal = createModal({
    id: 'event-modal',
    title: isEditing
      ? '<span data-lucide="pencil"></span> ' + (typeof t === 'function' ? t('edit_event', 'Edit Event') : 'Edit Event')
      : '<span data-lucide="plus"></span> ' + (typeof t === 'function' ? t('add_event', 'Add Event') : 'Add Event'),
    size: 'medium'
  });

  const titleField = createModalField({
    id: 'events-modal-title-input',
    label: typeof t === 'function' ? t('title', 'Title') : 'Title',
    type: 'text',
    value: isEditing ? editEvent.title : '',
    placeholder: typeof t === 'function' ? t('enter_event_title', 'Enter event title...') : 'Enter event title...',
    required: true,
    maxLength: 120,
    inputMode: 'text'
  });
  modal.body.appendChild(titleField.field);

  // ✅ حماية
  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(titleField.input, 'text');
  }

  const dateField = createModalField({
    id: 'events-modal-date-input',
    label: typeof t === 'function' ? t('date', 'Date') : 'Date',
    type: 'date',
    value: isEditing ? editEvent.date : '',
    required: true
  });
  modal.body.appendChild(dateField.field);

  const descField = createModalField({
    id: 'events-modal-desc-input',
    label: typeof t === 'function' ? t('description', 'Description (optional)') : 'Description (optional)',
    type: 'textarea',
    rows: 3,
    value: isEditing ? editEvent.description : '',
    placeholder: typeof t === 'function' ? t('add_description', 'Add a description...') : 'Add a description...',
    maxLength: 500,
    inputMode: 'content'
  });
  modal.body.appendChild(descField.field);

  // ✅ حماية
  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(descField.input, 'content');
  }

  function handleSave() {
    const newTitle = titleField.input.value.trim();
    const newDate = dateField.input.value;
    const newDesc = descField.input.value.trim();

    if (!newTitle) {
      titleField.input.classList.add("modal-base-input-error");
      titleField.input.focus();
      setTimeout(() => titleField.input.classList.remove("modal-base-input-error"), 500);
      return;
    }

    if (!newDate) {
      dateField.input.classList.add("modal-base-input-error");
      dateField.input.focus();
      setTimeout(() => dateField.input.classList.remove("modal-base-input-error"), 500);
      return;
    }

    let success = false;
    if (isEditing) {
      success = updateEvent(editEvent.id, newTitle, newDate, newDesc);
    } else {
      const newEvent = addEvent(newTitle, newDate, newDesc);
      success = newEvent !== null;
    }

    if (success) {
      modal.close();
      setTimeout(() => renderEventsPage(), 250);
    } else {
      if (typeof showToast === 'function') {
        showToast('❌ ' + (typeof t === 'function' ? t('save_failed', 'Failed to save event') : 'Failed to save event'), 'error');
      }
    }
  }

  const actions = createModalActions([
    {
      label: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
      type: 'secondary',
      onClick: () => modal.close()
    },
    {
      label: isEditing
        ? '<span data-lucide="check"></span> ' + (typeof t === 'function' ? t('update', 'Update') : 'Update')
        : '<span data-lucide="plus"></span> ' + (typeof t === 'function' ? t('add', 'Add') : 'Add'),
      type: 'primary',
      onClick: handleSave
    }
  ]);
  modal.body.appendChild(actions);

  setTimeout(() => titleField.input.focus(), 100);
}

// ========================================
// ✅ دوال إضافية
// ========================================

function getUpcomingEventsCount() {
  const now = new Date();
  const todayStr = now.getFullYear() + '-' +
                   String(now.getMonth() + 1).padStart(2, '0') + '-' +
                   String(now.getDate()).padStart(2, '0');

  return getAllEvents().filter(e => e.date && e.date >= todayStr).length;
}

function getTodayEvents() {
  const now = new Date();
  const todayStr = now.getFullYear() + '-' +
                   String(now.getMonth() + 1).padStart(2, '0') + '-' +
                   String(now.getDate()).padStart(2, '0');

  return getAllEvents().filter(e => e.date === todayStr);
}

function getTomorrowEvents() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.getFullYear() + '-' +
                      String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' +
                      String(tomorrow.getDate()).padStart(2, '0');

  return getAllEvents().filter(e => e.date === tomorrowStr);
}

// ========================================
// التصدير
// ========================================

window.renderEventsPage = renderEventsPage;
window.getAllEvents = getAllEvents;
window.getEventsCopy = getEventsCopy;
window.addEvent = addEvent;
window.updateEvent = updateEvent;
window.deleteEvent = deleteEvent;
window.togglePinEvent = togglePinEvent;
window.getUpcomingEventsCount = getUpcomingEventsCount;
window.getTodayEvents = getTodayEvents;
window.getTomorrowEvents = getTomorrowEvents;
window.openQuickAddEventModal = openQuickAddEventModal;
window.invalidateEventsCache = invalidateEventsCache;

console.log("✅ Events v2.4 loaded successfully! (Quick Add + No Add Button)");
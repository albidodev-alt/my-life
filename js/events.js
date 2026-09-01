// ========================================
// MY LIFE HUB - EVENTS (CALENDAR)
// ========================================

const EVENTS_STORAGE_KEY = "myLifeHub_events";

// ========================================
// دوال التخزين
// ========================================

function getAllEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const events = JSON.parse(raw);
    return Array.isArray(events) ? events : [];
  } catch (error) {
    console.error("Error loading events:", error);
    return [];
  }
}

function saveAllEvents(events) {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Error saving events:", error);
  }
}

function addEvent(title, date, description = "") {
  const trimmedTitle = title.trim();
  if (!trimmedTitle || !date) return null;

  const events = getAllEvents();
  const newEvent = {
    id: Date.now() + Math.random() * 1000,
    title: trimmedTitle,
    date: date,
    description: description.trim(),
    pinned: false,
    createdAt: new Date().toISOString()
  };

  events.push(newEvent);
  saveAllEvents(events);
  return newEvent;
}

function updateEvent(eventId, title, date, description) {
  const events = getAllEvents();
  const index = events.findIndex(e => e.id === eventId);
  if (index === -1) return false;

  events[index].title = title.trim();
  events[index].date = date;
  events[index].description = description.trim();
  saveAllEvents(events);
  return true;
}

function deleteEvent(eventId) {
  const events = getAllEvents();
  const updatedEvents = events.filter(e => e.id !== eventId);
  saveAllEvents(updatedEvents);
}

function togglePinEvent(eventId) {
  const events = getAllEvents();
  const event = events.find(e => e.id === eventId);
  if (!event) return;
  
  event.pinned = !event.pinned;
  saveAllEvents(events);
}

function getEventsByDate(events, date) {
  return events.filter(e => e.date === date);
}

function getTimeRemaining(eventDate) {
  const now = new Date();
  const target = new Date(eventDate + "T00:00:00");
  const diff = target - now;
  
  if (diff < 0) return "Event passed";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days === 0 && hours === 0) return "Today! 🎉";
  if (days === 0) return hours + " hours left";
  if (hours === 0) return days + " days left";
  
  return days + " days, " + hours + " hours left";
}

function getEventsByMonth(events, year, month) {
  const monthStr = String(month).padStart(2, '0');
  return events.filter(e => {
    const [eYear, eMonth] = e.date.split('-');
    return parseInt(eYear) === year && parseInt(eMonth) === month;
  });
}

// ========================================
// عرض تفاصيل الحدث في نافذة منبثقة
// ========================================

function openEventDetailsModal(events, dateStr) {
  const overlay = document.createElement("div");
  overlay.className = "notes-modal-overlay";
  overlay.id = "events-details-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "notes-modal";
  modal.id = "events-details-modal";

  // عنوان
  const formattedDate = new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const title = document.createElement("h3");
  title.className = "notes-modal-title";
  title.textContent = "📅 " + formattedDate;
  modal.appendChild(title);

  // عدد الأحداث
  const countLabel = document.createElement("p");
  countLabel.className = "modal-subtitle";
  countLabel.textContent = events.length + " event" + (events.length > 1 ? "s" : "");
  modal.appendChild(countLabel);

  // قائمة الأحداث
  const eventsList = document.createElement("div");
  eventsList.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
    max-height: 400px;
    overflow-y: auto;
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

    // عنوان الحدث
    const titleRow = document.createElement("div");
    titleRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-handwritten);
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    `;

    if (event.pinned) {
      const pinIcon = document.createElement("span");
      pinIcon.textContent = "📌";
      titleRow.appendChild(pinIcon);
    }

    const eventTitle = document.createElement("span");
    eventTitle.textContent = event.title;
    titleRow.appendChild(eventTitle);

    // الوصف
    const descRow = document.createElement("div");
    descRow.style.cssText = `
      margin-top: 6px;
      font-size: 14px;
      color: var(--text-secondary);
    `;

    if (event.description) {
      descRow.textContent = "📝 " + event.description;
    } else {
      descRow.textContent = "No description";
      descRow.style.opacity = "0.5";
    }

    // الوقت المتبقي
    const remainingRow = document.createElement("div");
    remainingRow.style.cssText = `
      margin-top: 6px;
      font-size: 13px;
      font-weight: 500;
    `;

    const remaining = getTimeRemaining(event.date);
    const now = new Date();
    const target = new Date(event.date + "T00:00:00");
    const diff = target - now;
    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      remainingRow.textContent = "⏳ Event passed";
      remainingRow.style.color = "#6b7280";
    } else if (daysLeft <= 3) {
      remainingRow.textContent = "⏳ " + remaining;
      remainingRow.style.color = "#ef4444";
    } else if (daysLeft <= 7) {
      remainingRow.textContent = "⏳ " + remaining;
      remainingRow.style.color = "#f59e0b";
    } else {
      remainingRow.textContent = "⏳ " + remaining;
      remainingRow.style.color = "#22c55e";
    }

    // ===== أزرار الإجراءات (تعديل + حذف) =====
    const actionsRow = document.createElement("div");
    actionsRow.style.cssText = `
      display: flex;
      gap: 8px;
      margin-top: 8px;
    `;

    // زر تعديل
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️ Edit";
    editBtn.style.cssText = `
      padding: 4px 12px;
      border: 1px solid var(--border-input);
      border-radius: 6px;
      background: var(--bg-input);
      color: var(--text-primary);
      cursor: pointer;
      font-family: var(--font-handwritten);
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    `;
    editBtn.addEventListener("mouseenter", function() {
      this.style.backgroundColor = "var(--bg-hover)";
    });
    editBtn.addEventListener("mouseleave", function() {
      this.style.backgroundColor = "var(--bg-input)";
    });

    editBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      overlay.remove();
      openEventModal(event);
    });

    // زر حذف
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ Delete";
    deleteBtn.style.cssText = `
      padding: 4px 12px;
      border: 1px solid #ef4444;
      border-radius: 6px;
      background: transparent;
      color: #ef4444;
      cursor: pointer;
      font-family: var(--font-handwritten);
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
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
      if (confirm('Delete "' + event.title + '" permanently?')) {
        deleteEvent(event.id);
        overlay.remove();
        renderEventsPage();
      }
    });

    actionsRow.appendChild(editBtn);
    actionsRow.appendChild(deleteBtn);

    eventCard.appendChild(titleRow);
    eventCard.appendChild(descRow);
    eventCard.appendChild(remainingRow);
    eventCard.appendChild(actionsRow);
    eventsList.appendChild(eventCard);
  });

  modal.appendChild(eventsList);

  // ===== زر الإغلاق =====
  const closeBtn = document.createElement("button");
  closeBtn.className = "notes-modal-close-btn";
  closeBtn.textContent = "✕";
  closeBtn.setAttribute("aria-label", "Close");

  closeBtn.addEventListener("click", function() {
    overlay.remove();
  });

  modal.appendChild(closeBtn);

  // ===== زر إغلاق إضافي =====
  const closeModalBtn = document.createElement("button");
  closeModalBtn.className = "notes-modal-save-btn";
  closeModalBtn.textContent = "Close";
  closeModalBtn.style.marginTop = "8px";

  closeModalBtn.addEventListener("click", function() {
    overlay.remove();
  });

  modal.appendChild(closeModalBtn);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // إغلاق عند النقر خارج المودال
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) overlay.remove();
  });

  // إغلاق بالـ Escape
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && document.getElementById("events-details-modal-overlay")) {
      overlay.remove();
    }
  });
}

// ========================================
// عرض صفحة الأحداث
// ========================================

function renderEventsPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  app.innerHTML = `
    <div id="events-container">
      <!-- Header -->
      <div class="events-header">
        <h2 class="events-title">📅 Events</h2>
        <button class="events-add-btn" id="events-add-btn">
          <span class="events-add-icon">＋</span>
          Add Event
        </button>
      </div>

      <!-- Calendar -->
      <div class="calendar-wrapper">
        <div class="calendar-nav">
          <button class="calendar-nav-btn" id="calendar-prev">◀</button>
          <span class="calendar-month-year" id="calendar-label">January 2026</span>
          <button class="calendar-nav-btn" id="calendar-next">▶</button>
        </div>

        <div class="calendar-grid">
          <div class="calendar-weekdays">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>
          <div class="calendar-days" id="calendar-days"></div>
        </div>
      </div>

      <!-- Events List -->
      <div class="events-list-section">
        <div id="events-list"></div>
      </div>
    </div>
  `;

  // ===== إضافة أحداث =====
  let currentYearState = currentYear;
  let currentMonthState = currentMonth;

  function renderCalendar(year, month) {
    const daysContainer = document.getElementById("calendar-days");
    const label = document.getElementById("calendar-label");
    if (!daysContainer) return;

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
    
    // الأيام التي فيها أحداث مثبتة
    const pinnedDates = new Set();
    eventsThisMonth.forEach(e => {
      if (e.pinned) pinnedDates.add(e.date);
    });

    daysContainer.innerHTML = "";

    // أيام فارغة قبل أول يوم
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "calendar-day-empty";
      daysContainer.appendChild(empty);
    }

    // أيام الشهر
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

      // إضافة أيقونة pin للأيام التي فيها أحداث مثبتة
      if (hasPinned) {
        const pinIcon = document.createElement("span");
        pinIcon.className = "calendar-pin-icon";
        pinIcon.textContent = "📌";
        dayDiv.appendChild(pinIcon);
      }

      // عرض الأحداث عند النقر على اليوم
      dayDiv.addEventListener("click", function() {
        const eventsOnDay = getEventsByDate(allEvents, dateStr);
        if (eventsOnDay.length > 0) {
          openEventDetailsModal(eventsOnDay, dateStr);
        }
      });

      daysContainer.appendChild(dayDiv);
    }
  }

  function createEventCard(event, showPinButton = true) {
    const card = document.createElement("div");
    card.className = "event-card";
    if (event.pinned) {
      card.classList.add("event-card-pinned");
    }

    const infoDiv = document.createElement("div");
    infoDiv.className = "event-info";

    // عنوان مع أيقونة التثبيت
    const titleDiv = document.createElement("div");
    titleDiv.className = "event-title-row";

    const pinIcon = document.createElement("span");
    pinIcon.className = "event-pin-icon";
    pinIcon.textContent = event.pinned ? "📌" : "";
    pinIcon.style.marginRight = "6px";

    const titleSpan = document.createElement("span");
    titleSpan.className = "event-title";
    titleSpan.textContent = event.title;

    titleDiv.appendChild(pinIcon);
    titleDiv.appendChild(titleSpan);

    // باقي التفاصيل
    const dateSpan = document.createElement("span");
    dateSpan.className = "event-date";
    const formattedDate = new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    dateSpan.textContent = "📅 " + formattedDate;

    const remainingSpan = document.createElement("span");
    remainingSpan.className = "event-remaining";
    const remaining = getTimeRemaining(event.date);
    remainingSpan.textContent = "⏳ " + remaining;

    // تحديد لون الوقت المتبقي
    const now = new Date();
    const target = new Date(event.date + "T00:00:00");
    const diff = target - now;
    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      remainingSpan.style.color = "#6b7280";
    } else if (daysLeft <= 3) {
      remainingSpan.style.color = "#ef4444";
      remainingSpan.style.fontWeight = "600";
    } else if (daysLeft <= 7) {
      remainingSpan.style.color = "#f59e0b";
    } else {
      remainingSpan.style.color = "#22c55e";
    }

    const descSpan = document.createElement("span");
    descSpan.className = "event-description";
    descSpan.textContent = event.description || "";

    infoDiv.appendChild(titleDiv);
    infoDiv.appendChild(dateSpan);
    infoDiv.appendChild(remainingSpan);
    if (event.description) {
      infoDiv.appendChild(descSpan);
    }

    // ===== أزرار الإجراءات =====
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "event-actions";

    // زر التثبيت
    if (showPinButton) {
      const pinBtn = document.createElement("button");
      pinBtn.className = "event-pin-btn";
      pinBtn.textContent = event.pinned ? "📌" : "📍";
      pinBtn.title = event.pinned ? "Unpin event" : "Pin event";
      pinBtn.setAttribute("aria-label", pinBtn.title);

      pinBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        togglePinEvent(event.id);
        renderEventsPage();
      });

      actionsDiv.appendChild(pinBtn);
    }

    // زر تعديل
    const editBtn = document.createElement("button");
    editBtn.className = "event-edit-btn";
    editBtn.textContent = "✏️";
    editBtn.title = "Edit event";
    editBtn.setAttribute("aria-label", "Edit event");

    editBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      openEventModal(event);
    });

    actionsDiv.appendChild(editBtn);

    // زر الحذف
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "event-delete-btn";
    deleteBtn.textContent = "🗑️";
    deleteBtn.title = "Delete event";
    deleteBtn.setAttribute("aria-label", "Delete event");

    deleteBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      if (confirm('Delete "' + event.title + '"?')) {
        deleteEvent(event.id);
        renderEventsPage();
      }
    });

    actionsDiv.appendChild(deleteBtn);

    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);

    return card;
  }

  function renderEventsList(events) {
    const container = document.getElementById("events-list");
    if (!container) return;

    container.innerHTML = "";

    // ===== فصل الأحداث المثبتة =====
    const allEvents = events.length > 0 ? events : getAllEvents();
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0');

    // تصفية الأحداث القادمة
    const upcomingEvents = allEvents.filter(e => e.date >= todayStr);
    upcomingEvents.sort((a, b) => a.date.localeCompare(b.date));

    const pinnedEvents = upcomingEvents.filter(e => e.pinned);
    const unpinnedEvents = upcomingEvents.filter(e => !e.pinned);

    if (upcomingEvents.length === 0) {
      const empty = document.createElement("p");
      empty.className = "events-empty";
      empty.textContent = "No upcoming events. Add one!";
      container.appendChild(empty);
      return;
    }

    // ===== عرض الأحداث المثبتة =====
    if (pinnedEvents.length > 0) {
      const pinnedTitle = document.createElement("h4");
      pinnedTitle.className = "events-subtitle";
      pinnedTitle.textContent = "📌 Pinned Events";
      container.appendChild(pinnedTitle);

      pinnedEvents.forEach(e => {
        const card = createEventCard(e, true);
        container.appendChild(card);
      });
    }

    // ===== عرض الأحداث العادية =====
    if (unpinnedEvents.length > 0) {
      const unpinnedTitle = document.createElement("h4");
      unpinnedTitle.className = "events-subtitle";
      unpinnedTitle.textContent = pinnedEvents.length > 0 ? "📋 All Events" : "📌 Upcoming Events";
      container.appendChild(unpinnedTitle);

      unpinnedEvents.forEach(e => {
        const card = createEventCard(e, true);
        container.appendChild(card);
      });
    }
  }

  // ===== التنقل بين الأشهر =====
  document.getElementById("calendar-prev").addEventListener("click", function() {
    currentMonthState--;
    if (currentMonthState < 1) {
      currentMonthState = 12;
      currentYearState--;
    }
    renderCalendar(currentYearState, currentMonthState);
    renderEventsList([]);
  });

  document.getElementById("calendar-next").addEventListener("click", function() {
    currentMonthState++;
    if (currentMonthState > 12) {
      currentMonthState = 1;
      currentYearState++;
    }
    renderCalendar(currentYearState, currentMonthState);
    renderEventsList([]);
  });

  // ===== زر إضافة حدث =====
  document.getElementById("events-add-btn").addEventListener("click", function() {
    openEventModal();
  });

  // ===== العرض الأولي =====
  renderCalendar(currentYearState, currentMonthState);
  renderEventsList([]);
}

// ========================================
// نافذة إضافة/تعديل حدث
// ========================================

function openEventModal(editEvent = null) {
  const isEditing = editEvent !== null;
  const overlay = document.createElement("div");
  overlay.className = "notes-modal-overlay";
  overlay.id = "events-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "notes-modal";
  modal.id = "events-modal";

  const title = document.createElement("h3");
  title.className = "notes-modal-title";
  title.textContent = isEditing ? "✏️ Edit Event" : "➕ Add Event";

  // حقل العنوان
  const titleLabel = document.createElement("label");
  titleLabel.className = "notes-modal-label";
  titleLabel.textContent = "Title";
  titleLabel.setAttribute("for", "events-modal-title-input");

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.id = "events-modal-title-input";
  titleInput.className = "notes-modal-input";
  titleInput.placeholder = "Enter event title...";
  titleInput.maxLength = 120;
  titleInput.value = isEditing ? editEvent.title : "";

  // حقل التاريخ
  const dateLabel = document.createElement("label");
  dateLabel.className = "notes-modal-label";
  dateLabel.textContent = "Date";
  dateLabel.setAttribute("for", "events-modal-date-input");

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "events-modal-date-input";
  dateInput.className = "notes-modal-input";
  dateInput.value = isEditing ? editEvent.date : "";

  // حقل الوصف
  const descLabel = document.createElement("label");
  descLabel.className = "notes-modal-label";
  descLabel.textContent = "Description (optional)";
  descLabel.setAttribute("for", "events-modal-desc-input");

  const descInput = document.createElement("textarea");
  descInput.id = "events-modal-desc-input";
  descInput.className = "notes-modal-textarea";
  descInput.placeholder = "Add a description...";
  descInput.rows = 3;
  descInput.value = isEditing ? editEvent.description : "";

  // أزرار
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "notes-modal-actions";

  const saveBtn = document.createElement("button");
  saveBtn.className = "notes-modal-save-btn";
  saveBtn.textContent = isEditing ? "💾 Update" : "➕ Add";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "notes-modal-cancel-btn";
  cancelBtn.textContent = "Cancel";

  const closeBtn = document.createElement("button");
  closeBtn.className = "notes-modal-close-btn";
  closeBtn.textContent = "✕";

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(titleLabel);
  modal.appendChild(titleInput);
  modal.appendChild(dateLabel);
  modal.appendChild(dateInput);
  modal.appendChild(descLabel);
  modal.appendChild(descInput);
  actionsDiv.appendChild(cancelBtn);
  actionsDiv.appendChild(saveBtn);
  modal.appendChild(actionsDiv);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function closeModal() {
    overlay.remove();
  }

  function handleSave() {
    const newTitle = titleInput.value.trim();
    const newDate = dateInput.value;
    const newDesc = descInput.value.trim();

    if (!newTitle) {
      titleInput.classList.add("notes-modal-input-error");
      titleInput.focus();
      setTimeout(() => titleInput.classList.remove("notes-modal-input-error"), 500);
      return;
    }

    if (!newDate) {
      dateInput.classList.add("notes-modal-input-error");
      dateInput.focus();
      setTimeout(() => dateInput.classList.remove("notes-modal-input-error"), 500);
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
      closeModal();
      renderEventsPage();
    }
  }

  saveBtn.addEventListener("click", handleSave);
  cancelBtn.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && document.getElementById("events-modal-overlay")) {
      closeModal();
    }
  });

  setTimeout(() => titleInput.focus(), 100);
}

// ========================================
// تصدير الدالة للاستخدام من main.js
// ========================================

window.renderEventsPage = renderEventsPage;

console.log("✅ Events (Calendar) loaded successfully!");
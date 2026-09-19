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
  
  if (diff < 0) return typeof t === 'function' ? t('event_passed', 'Event passed') : "Event passed";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days === 0 && hours === 0) return typeof t === 'function' ? t('today', 'Today! 🎉') : "Today! 🎉";
  if (days === 0) return hours + " " + (typeof t === 'function' ? t('hours_left', 'hours left') : "hours left");
  if (hours === 0) return days + " " + (typeof t === 'function' ? t('days_left', 'days left') : "days left");
  
  return days + " " + (typeof t === 'function' ? t('days', 'days') : "days") + ", " + hours + " " + (typeof t === 'function' ? t('hours', 'hours') : "hours") + " " + (typeof t === 'function' ? t('left', 'left') : "left");
}

function getEventsByMonth(events, year, month) {
  const monthStr = String(month).padStart(2, '0');
  return events.filter(e => {
    const [eYear, eMonth] = e.date.split('-');
    return parseInt(eYear) === year && parseInt(eMonth) === month;
  });
}

function escapeHtmlEvt(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// عرض تفاصيل الحدث في نافذة منبثقة
// ========================================

function openEventDetailsModal(events, dateStr) {
  const formattedDate = new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
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

  const countLabel = document.createElement("p");
  countLabel.className = "modal-base-message";
  countLabel.style.marginBottom = "16px";
  countLabel.style.fontSize = "14px";
  countLabel.style.color = "var(--text-muted)";
  countLabel.textContent = events.length + " " + (typeof t === 'function' ? t('events', 'event') : "event") + (events.length > 1 ? "s" : "");
  modal.body.appendChild(countLabel);

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
      pinIcon.innerHTML = '<span data-lucide="pin" style="width: 16px; height: 16px; fill: var(--primary); stroke: var(--primary);"></span>';
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
    `;

    const remaining = getTimeRemaining(event.date);
    const now = new Date();
    const target = new Date(event.date + "T00:00:00");
    const diff = target - now;
    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      remainingRow.innerHTML = '<span data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + (typeof t === 'function' ? t('event_passed', 'Event passed') : "Event passed");
      remainingRow.style.color = "#6b7280";
    } else if (daysLeft <= 3) {
      remainingRow.innerHTML = '<span data-lucide="alert-triangle" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + remaining;
      remainingRow.style.color = "#ef4444";
    } else if (daysLeft <= 7) {
      remainingRow.innerHTML = '<span data-lucide="alert-circle" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + remaining;
      remainingRow.style.color = "#f59e0b";
    } else {
      remainingRow.innerHTML = '<span data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + remaining;
      remainingRow.style.color = "#22c55e";
    }

    const actionsRow = document.createElement("div");
    actionsRow.style.cssText = `
      display: flex;
      gap: 8px;
      margin-top: 8px;
    `;

    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<span data-lucide="pencil" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + (typeof t === 'function' ? t('edit', 'Edit') : "Edit");
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
      modal.close();
      openEventModal(event);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + (typeof t === 'function' ? t('delete', 'Delete') : "Delete");
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

    // ✨ استخدام deleteModal
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
      <div class="events-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span data-lucide="calendar" style="width: 32px; height: 32px; color: var(--primary);"></span>
          <h2 class="events-title" style="margin: 0;">${typeof t === 'function' ? t('events_title', 'Events') : 'Events'}</h2>
        </div>
        <button class="events-add-btn" id="events-add-btn">
          <span class="events-add-icon" data-lucide="plus" style="width: 20px; height: 20px;"></span>
          ${typeof t === 'function' ? t('add_event_btn', 'Add Event') : 'Add Event'}
        </button>
      </div>

      <div class="calendar-wrapper">
        <div class="calendar-nav">
          <button class="calendar-nav-btn" id="calendar-prev">
            <span data-lucide="chevron-left" style="width: 24px; height: 24px;"></span>
          </button>
          <span class="calendar-month-year" id="calendar-label">January 2026</span>
          <button class="calendar-nav-btn" id="calendar-next">
            <span data-lucide="chevron-right" style="width: 24px; height: 24px;"></span>
          </button>
        </div>

        <div class="calendar-grid">
          <div class="calendar-weekdays">
            <span>${typeof t === 'function' ? t('sunday', 'Sun') : 'Sun'}</span>
            <span>${typeof t === 'function' ? t('monday', 'Mon') : 'Mon'}</span>
            <span>${typeof t === 'function' ? t('tuesday', 'Tue') : 'Tue'}</span>
            <span>${typeof t === 'function' ? t('wednesday', 'Wed') : 'Wed'}</span>
            <span>${typeof t === 'function' ? t('thursday', 'Thu') : 'Thu'}</span>
            <span>${typeof t === 'function' ? t('friday', 'Fri') : 'Fri'}</span>
            <span>${typeof t === 'function' ? t('saturday', 'Sat') : 'Sat'}</span>
          </div>
          <div class="calendar-days" id="calendar-days"></div>
        </div>
      </div>

      <div class="events-list-section">
        <div id="events-list"></div>
      </div>
    </div>
  `;

  setTimeout(function() {
    if (typeof initLucideIcons === 'function') {
      initLucideIcons();
    }
  }, 50);

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
    
    const pinnedDates = new Set();
    eventsThisMonth.forEach(e => {
      if (e.pinned) pinnedDates.add(e.date);
    });

    daysContainer.innerHTML = "";

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "calendar-day-empty";
      daysContainer.appendChild(empty);
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

    const titleDiv = document.createElement("div");
    titleDiv.className = "event-title-row";

    const pinIcon = document.createElement("span");
    pinIcon.className = "event-pin-icon";
    if (event.pinned) {
      pinIcon.innerHTML = '<span data-lucide="pin" style="width: 16px; height: 16px; fill: var(--primary); stroke: var(--primary);"></span>';
    }
    pinIcon.style.marginRight = "6px";

    const titleSpan = document.createElement("span");
    titleSpan.className = "event-title";
    titleSpan.textContent = event.title;

    titleDiv.appendChild(pinIcon);
    titleDiv.appendChild(titleSpan);

    const dateSpan = document.createElement("span");
    dateSpan.className = "event-date";
    const formattedDate = new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    dateSpan.innerHTML = '<span data-lucide="calendar" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + formattedDate;

    const remainingSpan = document.createElement("span");
    remainingSpan.className = "event-remaining";
    const remaining = getTimeRemaining(event.date);
    const now = new Date();
    const target = new Date(event.date + "T00:00:00");
    const diff = target - now;
    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      remainingSpan.innerHTML = '<span data-lucide="clock" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + remaining;
      remainingSpan.style.color = "#6b7280";
    } else if (daysLeft <= 3) {
      remainingSpan.innerHTML = '<span data-lucide="alert-triangle" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + remaining;
      remainingSpan.style.color = "#ef4444";
      remainingSpan.style.fontWeight = "600";
    } else if (daysLeft <= 7) {
      remainingSpan.innerHTML = '<span data-lucide="alert-circle" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + remaining;
      remainingSpan.style.color = "#f59e0b";
    } else {
      remainingSpan.innerHTML = '<span data-lucide="clock" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + remaining;
      remainingSpan.style.color = "#22c55e";
    }

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
    deleteBtn.className = "event-delete-btn";
    deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width: 16px; height: 16px;"></span>';
    deleteBtn.title = typeof t === 'function' ? t('delete', 'Delete event') : "Delete event";
    deleteBtn.setAttribute("aria-label", "Delete event");

    // ✨ استخدام deleteModal
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

  function renderEventsList(events) {
    const container = document.getElementById("events-list");
    if (!container) return;

    const allEvents = events.length > 0 ? events : getAllEvents();
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0');

    const upcomingEvents = allEvents.filter(e => e.date >= todayStr);
    upcomingEvents.sort((a, b) => a.date.localeCompare(b.date));

    const pinnedEvents = upcomingEvents.filter(e => e.pinned);
    const unpinnedEvents = upcomingEvents.filter(e => !e.pinned);

    const fragment = document.createDocumentFragment();

    if (upcomingEvents.length === 0) {
      const empty = document.createElement("p");
      empty.className = "events-empty";
      empty.innerHTML = '<span data-lucide="calendar-x" style="width: 32px; height: 32px; vertical-align: middle; margin-right: 8px; opacity: 0.5;"></span> ' + (typeof t === 'function' ? t('no_events', 'No upcoming events. Add one!') : "No upcoming events. Add one!");
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

    container.innerHTML = "";
    container.appendChild(fragment);
  }

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

  document.getElementById("events-add-btn").addEventListener("click", function() {
    openEventModal();
  });

  renderCalendar(currentYearState, currentMonthState);
  renderEventsList([]);
}

// ========================================
// نافذة إضافة/تعديل حدث
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
    maxLength: 120
  });
  modal.body.appendChild(titleField.field);

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
    placeholder: typeof t === 'function' ? t('add_description', 'Add a description...') : 'Add a description...'
  });
  modal.body.appendChild(descField.field);

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
      renderEventsPage();
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
// تصدير الدالة
// ========================================

window.renderEventsPage = renderEventsPage;

console.log("✅ Events (Calendar) loaded successfully!");
// ========================================
// MY LIFE HUB - NOTIFICATIONS
// نظام الإشعارات المتكامل
// ========================================

const NOTIFICATIONS_STORAGE_KEY = "myLifeHub_notifications";

// ===== كاش في الذاكرة =====
let notificationsCache = null;

// ========================================
// دوال التخزين الأساسية
// ========================================

function getAllNotifications() {
  if (notificationsCache !== null) return notificationsCache;
  
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const notifications = JSON.parse(raw);
    notificationsCache = Array.isArray(notifications) ? notifications : [];
    return notificationsCache;
  } catch (error) {
    console.error("Error loading notifications:", error);
    return [];
  }
}

function saveAllNotifications(notifications) {
  notificationsCache = notifications;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
}

function addNotification(type, title, message, relatedId = null) {
  const notifications = getAllNotifications();
  const newNotification = {
    id: Date.now() + Math.random() * 1000,
    type: type,
    title: title,
    message: message,
    date: new Date().toISOString(),
    read: false,
    createdAt: new Date().toISOString(),
    relatedId: relatedId
  };
  notifications.unshift(newNotification);
  saveAllNotifications(notifications);
  updateNotificationBadge();
  return newNotification;
}

function markNotificationAsRead(notificationId) {
  const notifications = getAllNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    saveAllNotifications(notifications);
    updateNotificationBadge();
  }
}

function markAllNotificationsAsRead() {
  const notifications = getAllNotifications();
  notifications.forEach(n => n.read = true);
  saveAllNotifications(notifications);
  updateNotificationBadge();
}

function deleteNotification(notificationId) {
  const notifications = getAllNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveAllNotifications(filtered);
  updateNotificationBadge();
}

function deleteAllNotifications() {
  saveAllNotifications([]);
  updateNotificationBadge();
}

function getUnreadCount() {
  const notifications = getAllNotifications();
  return notifications.filter(n => !n.read).length;
}

function tr(key, fallback) {
  return typeof t === 'function' ? t(key, fallback) : fallback;
}

// ========================================
// تحديث عداد الإشعارات
// ========================================

function updateNotificationBadge() {
  const count = getUnreadCount();
  const badge = document.getElementById("notification-badge");
  
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }
}

// ========================================
// إنشاء الإشعارات تلقائياً
// ========================================

function generateNotifications() {
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + 
                   String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(today.getDate()).padStart(2, '0');
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.getFullYear() + '-' + 
                      String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(tomorrow.getDate()).padStart(2, '0');

  const notifications = [];
  
  // 1. المهام المقررة اليوم
  const tasks = getAllTasks();
  const todayTasks = tasks.filter(t => t.dueDate === todayStr && !t.completed);
  
  todayTasks.forEach(task => {
    notifications.push({
      type: "task",
      title: tr('task_due_today', 'Task Due Today'),
      message: `"${task.text}" ` + tr('is_due_today', 'is due today!'),
      relatedId: task.id
    });
  });
  
  // 2. المهام المتأخرة
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < todayStr && !t.completed);
  
  overdueTasks.forEach(task => {
    notifications.push({
      type: "task",
      title: tr('overdue_task', 'Overdue Task'),
      message: `"${task.text}" ` + tr('is_overdue', 'is overdue!'),
      relatedId: task.id
    });
  });
  
  // 3. أحداث الغد
  const events = getAllEvents();
  const tomorrowEvents = events.filter(e => e.date === tomorrowStr);
  
  tomorrowEvents.forEach(event => {
    notifications.push({
      type: "event",
      title: tr('event_tomorrow', 'Event Tomorrow'),
      message: `"${event.title}" ` + tr('is_tomorrow', 'is tomorrow!'),
      relatedId: event.id
    });
  });
  
  // 4. أحداث الأيام القادمة
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  const threeDaysStr = threeDaysLater.getFullYear() + '-' + 
                       String(threeDaysLater.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(threeDaysLater.getDate()).padStart(2, '0');
  
  const upcomingEvents = events.filter(e => e.date > todayStr && e.date <= threeDaysStr && e.date !== tomorrowStr);
  
  upcomingEvents.forEach(event => {
    const dateObj = new Date(event.date + "T00:00:00");
    const daysLeft = Math.ceil((dateObj - today) / (1000 * 60 * 60 * 24));
    notifications.push({
      type: "event",
      title: tr('upcoming_event', 'Upcoming Event'),
      message: `"${event.title}" ` + tr('is_in', 'is in') + ` ${daysLeft} ` + (daysLeft > 1 ? tr('days', 'days') : tr('day', 'day')) + `!`,
      relatedId: event.id
    });
  });
  
  // 5. وقت النوم
  const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
  const dayData = getDayData(todayName);
  
  if (dayData.sleepHour !== undefined && dayData.sleepHour !== null && 
      dayData.sleepMinute !== undefined && dayData.sleepMinute !== null &&
      dayData.wakeHour !== undefined && dayData.wakeHour !== null && 
      dayData.wakeMinute !== undefined && dayData.wakeMinute !== null) {
    
    const sleepTime = new Date();
    sleepTime.setHours(dayData.sleepHour, dayData.sleepMinute, 0, 0);
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const sleepHourNum = dayData.sleepHour;
    const sleepMinuteNum = dayData.sleepMinute;
    
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const oneHourBeforeTotal = (sleepHourNum - 1) * 60 + sleepMinuteNum;
    const halfHourBeforeTotal = sleepHourNum * 60 + sleepMinuteNum - 30;
    const sleepTotal = sleepHourNum * 60 + sleepMinuteNum;
    
    const sleepTimeStr = formatTime12(dayData.sleepHour, dayData.sleepMinute);
    
    if (currentTotalMinutes >= oneHourBeforeTotal && currentTotalMinutes < halfHourBeforeTotal) {
      notifications.push({
        type: "sleep",
        title: tr('bedtime_reminder', 'Bedtime Reminder'),
        message: tr('you_should_go_to_bed_1h', 'You should go to bed in about 1 hour') + ` (${sleepTimeStr}). ` + tr('get_ready', 'Get ready for a good night\'s sleep!'),
        relatedId: null
      });
    }
    else if (currentTotalMinutes >= halfHourBeforeTotal && currentTotalMinutes < sleepTotal) {
      notifications.push({
        type: "sleep",
        title: tr('time_to_sleep_soon', 'Time to Sleep Soon'),
        message: tr('you_should_go_to_bed_30min', 'You should go to bed in about 30 minutes') + ` (${sleepTimeStr}). ` + tr('start_winding_down', 'Start winding down!'),
        relatedId: null
      });
    }
    else if (currentTotalMinutes >= sleepTotal && currentTotalMinutes < sleepTotal + 60) {
      notifications.push({
        type: "sleep",
        title: tr('time_to_sleep', 'Time to Sleep!'),
        message: tr('its', 'It\'s') + ` ${sleepTimeStr}. ` + tr('time_to_go_to_bed', 'Time to go to bed!'),
        relatedId: null
      });
    }
    
    // تقرير النوم اليومي
    const wakeHourNum = dayData.wakeHour;
    const wakeMinuteNum = dayData.wakeMinute;
    const wakeTotal = wakeHourNum * 60 + wakeMinuteNum;
    
    if (currentTotalMinutes >= wakeTotal && currentTotalMinutes < wakeTotal + 120) {
      const wakeTime = new Date();
      wakeTime.setHours(dayData.wakeHour, dayData.wakeMinute, 0, 0);
      let sleepDuration = (wakeTime - sleepTime) / (1000 * 60 * 60);
      if (sleepDuration < 0) sleepDuration += 24;
      
      const quality = sleepDuration >= 7 && sleepDuration <= 9 ? "excellent" :
                     sleepDuration >= 6 ? "good" :
                     sleepDuration >= 5 ? "fair" : "poor";
      
      const qualityEmoji = quality === "excellent" ? "🟢" :
                          quality === "good" ? "🟡" :
                          quality === "fair" ? "🟠" : "🔴";
      
      const qualityLabel = quality === "excellent" ? tr('excellent', 'Excellent') :
                          quality === "good" ? tr('good', 'Good') :
                          quality === "fair" ? tr('fair', 'Fair') : tr('poor', 'Poor');
      
      notifications.push({
        type: "sleep",
        title: tr('sleep_report', 'Sleep Report'),
        message: tr('sleep', 'Sleep') + `: ${formatTime12(dayData.sleepHour, dayData.sleepMinute)} - ${formatTime12(dayData.wakeHour, dayData.wakeMinute)} (${Math.round(sleepDuration)}h) ${qualityEmoji} ${qualityLabel}`,
        relatedId: null
      });
    }
  }
  
  return notifications;
}

// ========================================
// دالة مساعدة لتنسيق الوقت
// ========================================

function formatTime12(hour, minute = 0) {
  const lang = localStorage.getItem('language') || 'en';
  const hour12 = hour % 12 || 12;
  const minuteStr = minute.toString().padStart(2, '0');
  
  let ampm;
  if (lang === 'ar') {
    ampm = hour >= 12 ? 'مساءً' : 'صباحاً';
  } else {
    ampm = hour >= 12 ? 'PM' : 'AM';
  }
  return hour12 + ':' + minuteStr + ' ' + ampm;
}

// ========================================
// تحديث الإشعارات
// ========================================

function refreshNotifications() {
  const allNotifications = getAllNotifications();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const filtered = allNotifications.filter(n => {
    const createdAt = new Date(n.createdAt);
    return createdAt > sevenDaysAgo;
  });
  
  saveAllNotifications(filtered);
  
  const newNotifications = generateNotifications();
  const existingIds = new Set(filtered.map(n => n.relatedId + n.type + n.message));
  
  newNotifications.forEach(newNotif => {
    const key = newNotif.relatedId + newNotif.type + newNotif.message;
    if (!existingIds.has(key)) {
      addNotification(newNotif.type, newNotif.title, newNotif.message, newNotif.relatedId);
    }
  });
  
  updateNotificationBadge();
}

// ========================================
// عرض نافذة الإشعارات (باستخدام createModal)
// ========================================

function openNotificationsModal() {
  const notifications = getAllNotifications();
  
  const modal = createModal({
    id: 'notifications-modal',
    title: '<span data-lucide="bell"></span> ' + tr('notifications', 'Notifications'),
    size: 'medium'
  });

  // شريط الإجراءات (تحديد الكل + حذف الكل)
  const topActions = document.createElement("div");
  topActions.style.cssText = "display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;";

  const markAllBtn = document.createElement("button");
  markAllBtn.type = "button";
  markAllBtn.className = "modal-base-btn modal-base-btn-secondary";
  markAllBtn.style.cssText = "flex: 1; min-width: 120px; padding: 8px 12px; font-size: 13px;";
  markAllBtn.innerHTML = '<span data-lucide="check-check"></span> ' + tr('mark_all_read', 'Mark all read');

  // ✅ استخدام confirmModal بدلاً من confirm
  markAllBtn.addEventListener("click", function() {
    confirmModal({
      title: tr('mark_all_read', 'Mark All Read'),
      message: tr('mark_all_read_confirm', 'Mark all notifications as read?'),
      confirmLabel: tr('confirm', 'Confirm'),
      cancelLabel: tr('cancel', 'Cancel'),
      type: 'primary',
      icon: 'check-check',
      onConfirm: () => {
        markAllNotificationsAsRead();
        modal.close();
        openNotificationsModal();
      }
    });
  });

  const deleteAllBtn = document.createElement("button");
  deleteAllBtn.type = "button";
  deleteAllBtn.className = "modal-base-btn modal-base-btn-danger";
  deleteAllBtn.style.cssText = "flex: 1; min-width: 120px; padding: 8px 12px; font-size: 13px;";
  deleteAllBtn.innerHTML = '<span data-lucide="trash-2"></span> ' + tr('clear_all', 'Clear all');

  // ✅ استخدام confirmModal بدلاً من confirm
  deleteAllBtn.addEventListener("click", function() {
    confirmModal({
      title: tr('clear_all', 'Clear All'),
      message: tr('delete_all_confirm', 'Delete all notifications?'),
      confirmLabel: tr('delete', 'Delete'),
      cancelLabel: tr('cancel', 'Cancel'),
      type: 'danger',
      icon: 'trash-2',
      onConfirm: () => {
        deleteAllNotifications();
        modal.close();
        openNotificationsModal();
      }
    });
  });

  topActions.appendChild(markAllBtn);
  topActions.appendChild(deleteAllBtn);
  modal.body.appendChild(topActions);

  // عدد الإشعارات
  const countLabel = document.createElement("p");
  countLabel.className = "modal-base-message";
  countLabel.style.cssText = "margin-bottom: 12px; font-size: 14px; color: var(--text-muted);";
  countLabel.textContent = `${notifications.length} ` + tr('notifications', 'notifications');
  modal.body.appendChild(countLabel);

  // قائمة الإشعارات
  const listContainer = document.createElement("div");
  listContainer.style.cssText = `
    max-height: 400px;
    overflow-y: auto;
    margin: 12px 0;
  `;

  if (notifications.length === 0) {
    const empty = document.createElement("div");
    empty.style.cssText = `
      text-align: center;
      padding: 30px 0;
      color: var(--text-muted);
      font-family: var(--font-handwritten);
      font-size: 16px;
    `;
    empty.innerHTML = '<span data-lucide="bell-off" style="width: 32px; height: 32px; vertical-align: middle; margin-right: 8px; opacity: 0.3;"></span> ' + tr('no_notifications', 'No notifications yet!');
    listContainer.appendChild(empty);
  } else {
    notifications.forEach(notification => {
      const item = document.createElement("div");
      item.style.cssText = `
        padding: 12px 14px;
        border: 1px solid ${notification.read ? 'var(--border-light)' : 'var(--primary)'};
        border-radius: 8px;
        margin-bottom: 8px;
        background: ${notification.read ? 'var(--bg-surface)' : 'var(--primary-light)'};
        transition: all 0.2s ease;
        cursor: pointer;
      `;
      
      item.addEventListener("mouseenter", function() {
        this.style.transform = "translateX(4px)";
        this.style.boxShadow = "var(--shadow-sm)";
      });
      item.addEventListener("mouseleave", function() {
        this.style.transform = "translateX(0)";
        this.style.boxShadow = "none";
      });
      
      const headerRow = document.createElement("div");
      headerRow.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
      `;
      
      const titleSpan = document.createElement("span");
      titleSpan.style.cssText = `
        font-family: var(--font-handwritten);
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      `;
      titleSpan.textContent = notification.title;
      
      const typeBadge = document.createElement("span");
      const typeColors = {
        task: "#4f8edb",
        event: "#f59e0b",
        sleep: "#22c55e",
        reminder: "#8b5cf6"
      };
      const typeLabels = {
        task: tr('task', 'Task'),
        event: tr('event', 'Event'),
        sleep: tr('sleep', 'Sleep'),
        reminder: tr('reminder', 'Reminder')
      };
      typeBadge.style.cssText = `
        font-size: 10px;
        font-weight: 600;
        padding: 2px 10px;
        border-radius: 12px;
        background: ${typeColors[notification.type] || '#6b7280'}20;
        color: ${typeColors[notification.type] || '#6b7280'};
      `;
      typeBadge.textContent = typeLabels[notification.type] || notification.type.toUpperCase();
      
      headerRow.appendChild(titleSpan);
      headerRow.appendChild(typeBadge);
      
      const messageSpan = document.createElement("p");
      messageSpan.style.cssText = `
        margin: 4px 0;
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.5;
      `;
      messageSpan.textContent = notification.message;
      
      const dateSpan = document.createElement("span");
      dateSpan.style.cssText = `
        font-size: 11px;
        color: var(--text-muted);
        display: block;
        margin-top: 4px;
      `;
      dateSpan.innerHTML = '<span data-lucide="clock" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + new Date(notification.createdAt).toLocaleDateString("en-US", {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const actionsDiv = document.createElement("div");
      actionsDiv.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 8px;
      `;
      
      if (!notification.read) {
        const readBtn = document.createElement("button");
        readBtn.type = "button";
        readBtn.innerHTML = '<span data-lucide="check" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + tr('mark_read', 'Mark as read');
        readBtn.style.cssText = `
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          background: var(--primary-light);
          color: var(--primary-dark);
          font-family: var(--font-handwritten);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        `;
        readBtn.addEventListener("mouseenter", function() {
          this.style.background = "var(--primary)";
          this.style.color = "white";
        });
        readBtn.addEventListener("mouseleave", function() {
          this.style.background = "var(--primary-light)";
          this.style.color = "var(--primary-dark)";
        });
        readBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          markNotificationAsRead(notification.id);
          modal.close();
          openNotificationsModal();
        });
        actionsDiv.appendChild(readBtn);
      }
      
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + tr('delete', 'Delete');
      deleteBtn.style.cssText = `
        padding: 4px 12px;
        border: none;
        border-radius: 4px;
        background: rgba(231, 76, 94, 0.1);
        color: var(--danger);
        font-family: var(--font-handwritten);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      `;
      deleteBtn.addEventListener("mouseenter", function() {
        this.style.background = "var(--danger)";
        this.style.color = "white";
      });
      deleteBtn.addEventListener("mouseleave", function() {
        this.style.background = "rgba(231, 76, 94, 0.1)";
        this.style.color = "var(--danger)";
      });

      // ✅ استخدام confirmModal بدلاً من confirm
      deleteBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        confirmModal({
          title: tr('delete', 'Delete'),
          message: tr('delete_notification_confirm', 'Delete this notification?'),
          confirmLabel: tr('delete', 'Delete'),
          cancelLabel: tr('cancel', 'Cancel'),
          type: 'danger',
          icon: 'trash-2',
          onConfirm: () => {
            deleteNotification(notification.id);
            modal.close();
            openNotificationsModal();
          }
        });
      });
      actionsDiv.appendChild(deleteBtn);
      
      if (notification.relatedId && (notification.type === "task" || notification.type === "event")) {
        const viewBtn = document.createElement("button");
        viewBtn.type = "button";
        viewBtn.innerHTML = '<span data-lucide="eye" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span> ' + tr('view', 'View');
        viewBtn.style.cssText = `
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          background: var(--bg-surface);
          color: var(--text-primary);
          font-family: var(--font-handwritten);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--border-light);
          transition: all 0.2s ease;
        `;
        viewBtn.addEventListener("mouseenter", function() {
          this.style.background = "var(--bg-hover)";
        });
        viewBtn.addEventListener("mouseleave", function() {
          this.style.background = "var(--bg-surface)";
        });
        viewBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          modal.close();
          if (notification.type === "task") {
            navigateTo("task");
          } else if (notification.type === "event") {
            navigateTo("events");
          }
        });
        actionsDiv.appendChild(viewBtn);
      }
      
      item.appendChild(headerRow);
      item.appendChild(messageSpan);
      item.appendChild(dateSpan);
      if (actionsDiv.children.length > 0) {
        item.appendChild(actionsDiv);
      }
      
      listContainer.appendChild(item);
    });
  }
  
  modal.body.appendChild(listContainer);

  // زر الإغلاق
  const closeActions = createModalActions([
    {
      label: tr('close', 'Close'),
      type: 'secondary',
      onClick: () => modal.close()
    }
  ]);
  modal.body.appendChild(closeActions);
  
  updateNotificationBadge();
}

function closeNotificationsModal() {
  const overlay = document.getElementById("notifications-modal-overlay");
  if (overlay) overlay.remove();
}

// ========================================
// تهيئة زر الإشعارات في الـ Header
// ========================================

function setupNotificationButton() {
  let notificationBtn = document.getElementById("notification-btn");
  
  if (!notificationBtn) {
    const header = document.getElementById("main-header");
    if (!header) return;
    
    const headerLeft = header.querySelector(".header-left");
    if (!headerLeft) return;
    
    notificationBtn = document.createElement("button");
    notificationBtn.id = "notification-btn";
    notificationBtn.className = "notification-toggle";
    notificationBtn.setAttribute("aria-label", tr('notifications', 'Notifications'));
    notificationBtn.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 38px;
      height: 38px;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: 1.5px solid rgba(79, 142, 219, 0.12);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
      font-size: 18px;
      color: var(--text-primary);
    `;
    
    notificationBtn.innerHTML = `
      <span data-lucide="bell" style="width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center;"></span>
      <span id="notification-badge" style="
        display: none;
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ef4444;
        color: white;
        font-size: 10px;
        font-weight: 700;
        min-width: 18px;
        height: 18px;
        border-radius: 50%;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        font-family: var(--font-body);
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
      ">0</span>
    `;
    
    notificationBtn.addEventListener("mouseenter", function() {
      this.style.background = "rgba(255, 255, 255, 0.2)";
      this.style.borderColor = "rgba(79, 142, 219, 0.25)";
      this.style.transform = "scale(1.05)";
    });
    
    notificationBtn.addEventListener("mouseleave", function() {
      this.style.background = "rgba(255, 255, 255, 0.12)";
      this.style.borderColor = "rgba(79, 142, 219, 0.12)";
      this.style.transform = "scale(1)";
    });
    
    notificationBtn.addEventListener("click", function() {
      openNotificationsModal();
    });
    
    headerLeft.appendChild(notificationBtn);
  }
  
  setTimeout(function() {
    if (typeof initLucideIcons === 'function') {
      initLucideIcons();
    }
  }, 50);
  
  updateNotificationBadge();
}

// ========================================
// تصدير الدوال
// ========================================

window.openNotificationsModal = openNotificationsModal;
window.refreshNotifications = refreshNotifications;
window.setupNotificationButton = setupNotificationButton;
window.updateNotificationBadge = updateNotificationBadge;

console.log("✅ Notifications module loaded successfully!");
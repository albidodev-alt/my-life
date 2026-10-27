// ========================================
// MY LIFE HUB - TASKS v2.5
// (Lucide Icons + Priority/Difficulty Configs + Text Date Input)
// ========================================

// ========================================
// ✅ Priority & Difficulty Configs (Lucide Icons)
// ========================================

const PRIORITY_CONFIG = {
  high: {
    key: 'high',
    fallback: 'High',
    icon: 'flame',
    color: '#e74c5e',
    bgColor: 'rgba(231, 76, 94, 0.10)'
  },
  medium: {
    key: 'medium',
    fallback: 'Medium',
    icon: 'zap',
    color: '#f5a623',
    bgColor: 'rgba(245, 166, 35, 0.10)'
  },
  low: {
    key: 'low',
    fallback: 'Low',
    icon: 'leaf',
    color: '#4caf84',
    bgColor: 'rgba(76, 175, 132, 0.10)'
  }
};

const DIFFICULTY_CONFIG = {
  Easy: {
    key: 'easy',
    fallback: 'Easy',
    icon: 'circle-check',
    color: '#4caf84',
    bgColor: 'rgba(76, 175, 132, 0.10)'
  },
  Medium: {
    key: 'medium',
    fallback: 'Medium',
    icon: 'circle-check',
    color: '#f5a623',
    bgColor: 'rgba(245, 166, 35, 0.10)'
  },
  Hard: {
    key: 'hard',
    fallback: 'Hard',
    icon: 'circle-check',
    color: '#e74c5e',
    bgColor: 'rgba(231, 76, 94, 0.10)'
  }
};

// ========================================
// ✅ Helper: بناء HTML لأيقونة الأولوية
// ========================================
function buildPriorityIconHTML(priority, size = 14) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return `<span data-lucide="${cfg.icon}" style="width:${size}px;height:${size}px;vertical-align:middle;margin-right:4px;color:${cfg.color};"></span>`;
}

// ========================================
// ✅ Helper: بناء HTML لأيقونة الصعوبة
// ========================================
function buildDifficultyIconHTML(difficulty, size = 14) {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Medium;
  return `<span data-lucide="${cfg.icon}" style="width:${size}px;height:${size}px;vertical-align:middle;margin-right:4px;color:${cfg.color};"></span>`;
}

// ========================================
// ✅ ترجمة الأولوية (Priority)
// ========================================
function translatePriority(priority) {
  if (!priority) return "";
  const cfg = PRIORITY_CONFIG[priority];
  if (!cfg) return priority;
  return typeof t === 'function' ? t(cfg.key, cfg.fallback) : cfg.fallback;
}

// ========================================
// ✅ ترجمة الصعوبة (Difficulty)
// ========================================
function translateDifficulty(difficulty) {
  if (!difficulty) return "";
  const cfg = DIFFICULTY_CONFIG[difficulty];
  if (!cfg) return difficulty;
  return typeof t === 'function' ? t(cfg.key, cfg.fallback) : cfg.fallback;
}

const categoryOptions = [
  "University", "Programming", "Fitness", "Personal", "Work", "Home"
];

// ========================================
// ✅ Debounce للبحث (مع حماية من الضغط المتكرر)
// ========================================
const debouncedTaskSearch = (typeof debounce === 'function')
  ? debounce((filter, searchTerm) => {
      renderTaskList(filter, searchTerm);
    }, 200)
  : (filter, searchTerm) => renderTaskList(filter, searchTerm);

// ========================================
// ✅ قراءة آمنة للتواريخ
// ========================================
function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// ========================================
// ✅ التحقق من صحة تاريخ نصي (YYYY-MM-DD)
// ========================================
function isValidDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  
  // التحقق من الصيغة: YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  // التحقق من صحة التاريخ الفعلي
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // التحقق الدقيق (مثلاً: 31 فبراير غير صحيح)
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// ========================================
// ✅ الحصول على تاريخ اليوم (YYYY-MM-DD)
// ========================================
function getTodayDateString() {
  const today = new Date();
  return today.getFullYear() + '-' +
         String(today.getMonth() + 1).padStart(2, '0') + '-' +
         String(today.getDate()).padStart(2, '0');
}

// ========================================
// ✅ الحصول على تاريخ الغد (YYYY-MM-DD)
// ========================================
function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getFullYear() + '-' +
         String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' +
         String(tomorrow.getDate()).padStart(2, '0');
}

// ========================================
// ✅ بناء حقل تاريخ نصي مع أزرار سريعة
// ========================================
function buildDateFieldWithShortcuts(options = {}) {
  const {
    id = 'date-input-' + Date.now(),
    label = 'Date',
    value = '',
    placeholder = 'YYYY-MM-DD',
    required = false,
    helper = 'Format: YYYY-MM-DD',
    showShortcuts = true
  } = options;

  // ===== الحقل الأساسي =====
  const field = createModalField({
    id: id,
    label: label,
    type: 'text',
    value: value,
    placeholder: placeholder,
    required: required,
    helper: helper,
    inputMode: 'text',
    inputAttributes: {
      'maxlength': '10',
      'pattern': '\\d{4}-\\d{2}-\\d{2}'
    }
  });

  // ===== إضافة أزرار الاختصارات =====
  if (showShortcuts) {
    const shortcutsRow = document.createElement('div');
    shortcutsRow.style.cssText = 'display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;';

    const createShortcutBtn = (label, dateValue, icon) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = `
        padding: 6px 12px;
        background: var(--bg-surface);
        border: 1px solid var(--border-input);
        border-radius: 6px;
        font-family: var(--font-handwritten);
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        -webkit-tap-highlight-color: transparent;
      `;
      btn.innerHTML = `<span data-lucide="${icon}" style="width: 12px; height: 12px; pointer-events: none;"></span> ${label}`;
      
      btn.addEventListener('mouseenter', function() {
        this.style.background = 'var(--primary-light)';
        this.style.borderColor = 'var(--primary)';
        this.style.color = 'var(--primary-dark)';
      });
      btn.addEventListener('mouseleave', function() {
        this.style.background = 'var(--bg-surface)';
        this.style.borderColor = 'var(--border-input)';
        this.style.color = 'var(--text-secondary)';
      });
      
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        field.input.value = dateValue;
        field.input.classList.remove('modal-base-input-error');
        field.errorEl.classList.remove('show');
      });
      
      return btn;
    };

    const todayLabel = typeof t === 'function' ? t('today', 'Today') : 'Today';
    const tomorrowLabel = typeof t === 'function' ? t('tomorrow', 'Tomorrow') : 'Tomorrow';

    shortcutsRow.appendChild(createShortcutBtn(todayLabel, getTodayDateString(), 'sun'));
    shortcutsRow.appendChild(createShortcutBtn(tomorrowLabel, getTomorrowDateString(), 'arrow-right'));

    // ✅ زر Clear
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.style.cssText = `
      padding: 6px 12px;
      background: transparent;
      border: 1px solid var(--border-input);
      border-radius: 6px;
      font-family: var(--font-handwritten);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      -webkit-tap-highlight-color: transparent;
    `;
    clearBtn.innerHTML = `<span data-lucide="x" style="width: 12px; height: 12px; pointer-events: none;"></span> ${typeof t === 'function' ? t('clear', 'Clear') : 'Clear'}`;
    
    clearBtn.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(231, 76, 94, 0.08)';
      this.style.borderColor = 'var(--danger)';
      this.style.color = 'var(--danger)';
    });
    clearBtn.addEventListener('mouseleave', function() {
      this.style.background = 'transparent';
      this.style.borderColor = 'var(--border-input)';
      this.style.color = 'var(--text-muted)';
    });
    clearBtn.addEventListener('click', function(e) {
      e.preventDefault();
      field.input.value = '';
      field.input.classList.remove('modal-base-input-error');
      field.errorEl.classList.remove('show');
    });
    
    shortcutsRow.appendChild(clearBtn);

    field.field.appendChild(shortcutsRow);
  }

  return field;
}

// ========================================
// ✅ Debounce للحقول القابلة للكتابة
// ========================================
function _taskDebounce(fn, delay = 400) {
  if (typeof debounce === 'function') return debounce(fn, delay);
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ========================================
// عرض صفحة المهام
// ========================================
function renderTasks() {
  const app = document.getElementById("app");
  if (!app) return;

  app.replaceChildren();

  // ===== العنوان وزر الإضافة =====
  const headerDiv = document.createElement("div");
  headerDiv.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px;";

  const titleWrapper = document.createElement("div");
  titleWrapper.style.cssText = "display:flex;align-items:center;gap:12px;";

  const titleIcon = document.createElement("span");
  titleIcon.setAttribute("data-lucide", "list-checks");
  titleIcon.style.cssText = "width:28px;height:28px;color:var(--primary);display:inline-flex;align-items:center;justify-content:center;";

  const title = document.createElement("h2");
  title.textContent = typeof t === 'function' ? t('task_title', 'Tasks') : "Tasks";
  title.style.marginBottom = "0";

  titleWrapper.appendChild(titleIcon);
  titleWrapper.appendChild(title);
  headerDiv.appendChild(titleWrapper);

  const addBtn = document.createElement("button");
  addBtn.id = "add-task-btn";
  addBtn.type = "button";
  addBtn.textContent = "+ " + (typeof t === 'function' ? t('add_task', 'Add Task') : "Add Task");
  addBtn.style.marginBottom = "0";
  addBtn.addEventListener("click", function () { openAddTaskModal(); });
  headerDiv.appendChild(addBtn);

  app.appendChild(headerDiv);

  // ===== شريط البحث =====
  const searchDiv = document.createElement("div");
  searchDiv.style.cssText = "margin-bottom:16px;position:relative;";

  const searchIcon = document.createElement("span");
  searchIcon.setAttribute("data-lucide", "search");
  searchIcon.style.cssText = "position:absolute;left:14px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--text-muted);pointer-events:none;display:flex;align-items:center;justify-content:center;";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "task-search-input";
  searchInput.placeholder = typeof t === 'function' ? t('search_tasks', 'Search tasks...') : "Search tasks...";
  searchInput.autocomplete = "off";
  searchInput.style.cssText = "width:100%;height:48px;padding:0 16px 0 44px;background:var(--bg-input);color:var(--text-primary);border:1px solid var(--border-input);border-radius:12px;font-family:var(--font-body);font-size:14px;transition:border-color 0.2s ease, box-shadow 0.2s ease;outline:none;";

  searchInput.addEventListener("focus", function () {
    this.style.borderColor = "var(--primary)";
    this.style.boxShadow = "0 0 0 3px rgba(79, 142, 219, 0.12)";
  });

  searchInput.addEventListener("blur", function () {
    this.style.borderColor = "var(--border-input)";
    this.style.boxShadow = "none";
  });

  searchInput.addEventListener("input", function () {
    const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
    debouncedTaskSearch(activeFilter, this.value);
  });

  searchDiv.appendChild(searchIcon);
  searchDiv.appendChild(searchInput);
  app.appendChild(searchDiv);

  // ===== الفلاتر =====
  const filterDiv = document.createElement("div");
  filterDiv.id = "task-filters";
  filterDiv.style.cssText = "display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;";

  const filterLabel = document.createElement("span");
  filterLabel.textContent = (typeof t === 'function' ? t('filter_by_priority', 'Filter by priority:') : "Filter by priority:");
  filterLabel.style.cssText = "font-size:14px;font-weight:500;";
  filterDiv.appendChild(filterLabel);

  // ✅ زر "الكل"
  const filterAll = document.createElement("button");
  filterAll.type = "button";
  filterAll.textContent = typeof t === 'function' ? t('all', 'All') : "All";
  filterAll.className = "filter-btn active";
  filterAll.dataset.filter = "all";
  filterDiv.appendChild(filterAll);

  // ✅ أزرار الأولويات (بأيقونات Lucide)
  Object.keys(PRIORITY_CONFIG).forEach(function (priorityKey) {
    const cfg = PRIORITY_CONFIG[priorityKey];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-btn";
    btn.dataset.filter = priorityKey;
    btn.innerHTML = `
      <span data-lucide="${cfg.icon}" 
            style="width:14px;height:14px;vertical-align:middle;
                   margin-right:4px;color:${cfg.color};pointer-events:none;"></span>
      ${typeof t === 'function' ? t(cfg.key, cfg.fallback) : cfg.fallback}
    `;
    filterDiv.appendChild(btn);
  });

  app.appendChild(filterDiv);

  // ===== قائمة المهام =====
  const taskList = document.createElement("div");
  taskList.id = "task-list";
  app.appendChild(taskList);

  // ===== إضافة أحداث الفلاتر =====
  filterDiv.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterDiv.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      renderTaskList(btn.dataset.filter, document.getElementById("task-search-input")?.value || "");
    });
  });

  renderTaskList("all", "");
}

// ========================================
// عرض قائمة المهام
// ========================================
function renderTaskList(filter = "all", searchTerm = "") {
  const taskList = document.getElementById("task-list");
  if (!taskList) return;

  const allTasks = (typeof getTasksCopy === 'function')
    ? getTasksCopy()
    : (typeof getAllTasks === 'function' ? getAllTasks() : []);

  let tasks = allTasks.filter(function (t) { return !t.completed; });

  if (filter !== "all") {
    tasks = tasks.filter(function (t) { return t.priority === filter; });
  }

  if (searchTerm && searchTerm.trim() !== "") {
    const query = searchTerm.trim().toLowerCase();
    tasks = tasks.filter(function (t) {
      const textMatch = (t.text || "").toLowerCase().includes(query);
      const categoryMatch = (t.category || "").toLowerCase().includes(query);
      return textMatch || categoryMatch;
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort(function (a, b) {
    return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
  });

  const fragment = document.createDocumentFragment();

  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.style.cssText = "text-align:center;padding:40px 20px;color:var(--text-muted);";

    const emptyIcon = document.createElement("div");
    emptyIcon.innerHTML = '<span data-lucide="inbox" style="width:48px;height:48px;opacity:0.3;"></span>';
    emptyIcon.style.marginBottom = "12px";

    const emptyText = document.createElement("p");
    emptyText.style.cssText = "font-size:16px;font-family:var(--font-handwritten);";

    if (searchTerm) {
      emptyText.textContent = typeof t === 'function' ? t('no_tasks_found', 'No tasks found matching your search') : "No tasks found matching your search";
    } else if (filter !== "all") {
      emptyText.textContent = (typeof t === 'function' ? t('no_tasks_priority', 'No tasks with this priority.') : "No tasks with this priority.");
    } else {
      emptyText.textContent = typeof t === 'function' ? t('no_tasks', 'No tasks yet. Add one!') : "No tasks yet. Add one!";
    }

    empty.appendChild(emptyIcon);
    empty.appendChild(emptyText);
    fragment.appendChild(empty);
  } else {
    tasks.forEach(function (task) {
      const item = document.createElement("div");
      item.className = "task-item priority-" + task.priority;

      const leftDiv = document.createElement("div");
      leftDiv.style.cssText = "display:flex;align-items:center;gap:12px;flex:1;min-width:0;";

      // ===== زر إكمال المهمة =====
      const circleBtn = document.createElement("button");
      circleBtn.type = "button";
      circleBtn.className = "task-circle";
      circleBtn.title = typeof t === 'function' ? t('complete_task', 'Mark as completed') : "Mark as completed";
      circleBtn.setAttribute("aria-label", circleBtn.title);
      circleBtn.addEventListener("click", function () {
        openCompleteTaskModal(task);
      });

      const textDiv = document.createElement("div");
      textDiv.style.cssText = "display:flex;flex-direction:column;min-width:0;";

      const textSpan = document.createElement("span");
      textSpan.className = "task-text";
      textSpan.textContent = task.text;
      textSpan.style.overflowWrap = "anywhere";
      textSpan.style.wordBreak = "break-word";

      const metaDiv = document.createElement("div");
      metaDiv.style.cssText = "display:flex;gap:8px;font-size:12px;color:#6b7280;flex-wrap:wrap;align-items:center;";

      // ✅ الأولوية (بأيقونة Lucide)
      const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
      const prioritySpan = document.createElement("span");
      prioritySpan.className = "task-category";
      prioritySpan.innerHTML = `
        <span data-lucide="${priorityCfg.icon}" 
              style="width:12px;height:12px;vertical-align:middle;
                     margin-right:3px;color:${priorityCfg.color};"></span>
        ${translatePriority(task.priority)}
      `;
      prioritySpan.style.color = priorityCfg.color;
      metaDiv.appendChild(prioritySpan);

      // ===== التصنيف =====
      const categorySpan = document.createElement("span");
      categorySpan.className = "task-category";
      const categoryKey = task.category ? task.category.toLowerCase() : "";
      const translatedCategory = (typeof t === 'function' && t(categoryKey) !== categoryKey) ? t(categoryKey, task.category) : task.category;
      categorySpan.textContent = translatedCategory || task.category || "";
      metaDiv.appendChild(categorySpan);

      // ===== تاريخ الاستحقاق =====
      if (task.dueDate) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "task-date";

        const dueDate = parseDate(task.dueDate);
        if (dueDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate < today) {
            dateSpan.style.color = "#ef4444";
            dateSpan.innerHTML = `<span data-lucide="alert-triangle" style="width:12px;height:12px;vertical-align:middle;margin-right:3px;"></span>${typeof t === 'function' ? t('overdue', 'Overdue') : "Overdue"}: ${task.dueDate}`;
          } else if (dueDate.getTime() === today.getTime()) {
            dateSpan.style.color = "#f59e0b";
            dateSpan.innerHTML = `<span data-lucide="clock" style="width:12px;height:12px;vertical-align:middle;margin-right:3px;"></span>${typeof t === 'function' ? t('today', 'Today') : "Today"}`;
          } else {
            dateSpan.innerHTML = `<span data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle;margin-right:3px;"></span>${task.dueDate}`;
          }
          metaDiv.appendChild(dateSpan);
        }
      }

      textDiv.appendChild(textSpan);
      textDiv.appendChild(metaDiv);

      leftDiv.appendChild(circleBtn);
      leftDiv.appendChild(textDiv);

      const rightDiv = document.createElement("div");
      rightDiv.style.cssText = "display:flex;gap:6px;flex-shrink:0;";

      // ===== زر التعديل =====
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.innerHTML = '<span data-lucide="pencil" style="width:16px;height:16px;pointer-events:none;"></span>';
      editBtn.className = "task-action-btn";
      editBtn.title = typeof t === 'function' ? t('edit_task', 'Edit task') : "Edit task";
      editBtn.setAttribute("aria-label", editBtn.title);
      editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openEditTaskModal(task);
      });

      // ===== زر الحذف =====
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width:16px;height:16px;pointer-events:none;"></span>';
      deleteBtn.className = "task-action-btn";
      deleteBtn.title = typeof t === 'function' ? t('delete_task', 'Delete task') : "Delete task";
      deleteBtn.setAttribute("aria-label", deleteBtn.title);

      deleteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        deleteModal({
          itemName: task.text,
          itemType: 'task',
          onConfirm: () => {
            deleteTask(task.id);
            renderTaskList(
              document.querySelector(".filter-btn.active")?.dataset.filter || "all",
              document.getElementById("task-search-input")?.value || ""
            );
          }
        });
      });

      rightDiv.appendChild(editBtn);
      rightDiv.appendChild(deleteBtn);

      item.appendChild(leftDiv);
      item.appendChild(rightDiv);
      fragment.appendChild(item);
    });
  }

  taskList.replaceChildren(fragment);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// نافذة إضافة مهمة
// ========================================
function openAddTaskModal() {
  let selectedPriority = "medium";

  const modal = createModal({
    id: 'add-task-modal',
    title: '<span data-lucide="plus"></span> ' + (typeof t === 'function' ? t('add_task', 'New Task') : 'New Task'),
    size: 'medium'
  });

  const textField = createModalField({
    id: 'task-text-input',
    label: typeof t === 'function' ? t('task_description', 'Task description') : 'Task description',
    type: 'text',
    placeholder: typeof t === 'function' ? t('task_description', 'Task description') : 'Task description',
    required: true,
    maxLength: 200
  });
  modal.body.appendChild(textField.field);

  const priorityLabel = document.createElement("label");
  priorityLabel.className = "modal-base-label";
  priorityLabel.textContent = typeof t === 'function' ? t('priority', 'Priority') : 'Priority';
  modal.body.appendChild(priorityLabel);

  const priorityGrid = document.createElement("div");
  priorityGrid.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;";

  Object.keys(PRIORITY_CONFIG).forEach(function (priorityKey) {
    const cfg = PRIORITY_CONFIG[priorityKey];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-base-btn " + (priorityKey === selectedPriority ? "modal-base-btn-primary" : "modal-base-btn-secondary");
    btn.style.cssText = "padding:10px;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:6px;";
    btn.innerHTML = `
      <span data-lucide="${cfg.icon}" 
            style="width:16px;height:16px;color:${priorityKey === selectedPriority ? '#ffffff' : cfg.color};pointer-events:none;"></span>
      <span>${typeof t === 'function' ? t(cfg.key, cfg.fallback) : cfg.fallback}</span>
    `;

    btn.addEventListener("click", function () {
      selectedPriority = priorityKey;
      priorityGrid.querySelectorAll("button").forEach(function (b) {
        b.className = "modal-base-btn modal-base-btn-secondary";
        b.style.cssText = "padding:10px;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:6px;";
      });
      btn.className = "modal-base-btn modal-base-btn-primary";
      btn.style.cssText = "padding:10px;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:6px;";

      if (typeof debouncedLucide === 'function') debouncedLucide(30);
    });

    priorityGrid.appendChild(btn);
  });
  modal.body.appendChild(priorityGrid);

  const categoryField = createModalField({
    id: 'task-category-select',
    label: typeof t === 'function' ? t('category', 'Category') : 'Category',
    type: 'select',
    value: categoryOptions[0],
    options: categoryOptions.map(cat => {
      const catKey = cat.toLowerCase();
      const translatedCat = (typeof t === 'function' && t(catKey) !== catKey) ? t(catKey, cat) : cat;
      return { value: cat, label: translatedCat };
    })
  });
  modal.body.appendChild(categoryField.field);

  // ✅ حقل تاريخ نصي مع أزرار سريعة
  const dateField = buildDateFieldWithShortcuts({
    id: 'task-date-input',
    label: typeof t === 'function' ? t('due_date', 'Due Date (optional)') : 'Due Date (optional)',
    value: '',
    placeholder: 'YYYY-MM-DD',
    required: false,
    helper: typeof t === 'function' ? t('date_format_hint', 'Format: YYYY-MM-DD') : 'Format: YYYY-MM-DD',
    showShortcuts: true
  });
  modal.body.appendChild(dateField.field);

  const actions = createModalActions([
    {
      label: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
      type: 'secondary',
      onClick: () => modal.close()
    },
    {
      label: typeof t === 'function' ? t('save_task', 'Save Task') : 'Save Task',
      type: 'primary',
      onClick: () => {
        const text = textField.input.value.trim();
        if (!text) {
          textField.input.classList.add("modal-base-input-error");
          textField.input.focus();
          setTimeout(() => textField.input.classList.remove("modal-base-input-error"), 500);
          return;
        }

        // ✅ التحقق من صحة التاريخ
        const dueDateValue = dateField.input.value.trim();
        if (dueDateValue && !isValidDateString(dueDateValue)) {
          dateField.input.classList.add("modal-base-input-error");
          dateField.errorEl.textContent = typeof t === 'function' 
            ? t('invalid_date', 'Invalid date. Use YYYY-MM-DD format (e.g. 2026-10-26)') 
            : 'Invalid date. Use YYYY-MM-DD format (e.g. 2026-10-26)';
          dateField.errorEl.classList.add('show');
          dateField.input.focus();
          setTimeout(() => {
            dateField.input.classList.remove("modal-base-input-error");
          }, 2000);
          return;
        }

        const newTask = addTask({
          text: text,
          priority: selectedPriority,
          category: categoryField.input.value,
          dueDate: dueDateValue || null
        });

        if (!newTask) {
          if (typeof showToast === 'function') {
            showToast('❌ ' + (typeof t === 'function' ? t('save_failed', 'Failed to save task') : 'Failed to save task'), 'error');
          }
          return;
        }

        modal.close();
        setTimeout(() => {
          renderTaskList(
            document.querySelector(".filter-btn.active")?.dataset.filter || "all",
            document.getElementById("task-search-input")?.value || ""
          );
        }, 250);
      }
    }
  ]);
  modal.body.appendChild(actions);

  setTimeout(() => textField.input.focus(), 100);
}

// ========================================
// نافذة تعديل مهمة
// ========================================
function openEditTaskModal(task) {
  let selectedPriority = task.priority || "medium";

  const modal = createModal({
    id: 'edit-task-modal',
    title: '<span data-lucide="pencil"></span> ' + (typeof t === 'function' ? t('edit_task', 'Edit Task') : 'Edit Task'),
    size: 'medium'
  });

  const textField = createModalField({
    id: 'task-text-input',
    label: typeof t === 'function' ? t('task_description', 'Task description') : 'Task description',
    type: 'text',
    value: task.text,
    placeholder: typeof t === 'function' ? t('task_description', 'Task description') : 'Task description',
    required: true,
    maxLength: 200
  });
  modal.body.appendChild(textField.field);

  const priorityLabel = document.createElement("label");
  priorityLabel.className = "modal-base-label";
  priorityLabel.textContent = typeof t === 'function' ? t('priority', 'Priority') : 'Priority';
  modal.body.appendChild(priorityLabel);

  const priorityGrid = document.createElement("div");
  priorityGrid.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;";

  Object.keys(PRIORITY_CONFIG).forEach(function (priorityKey) {
    const cfg = PRIORITY_CONFIG[priorityKey];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-base-btn " + (priorityKey === selectedPriority ? "modal-base-btn-primary" : "modal-base-btn-secondary");
    btn.style.cssText = "padding:10px;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:6px;";
    btn.innerHTML = `
      <span data-lucide="${cfg.icon}" 
            style="width:16px;height:16px;color:${priorityKey === selectedPriority ? '#ffffff' : cfg.color};pointer-events:none;"></span>
      <span>${typeof t === 'function' ? t(cfg.key, cfg.fallback) : cfg.fallback}</span>
    `;

    btn.addEventListener("click", function () {
      selectedPriority = priorityKey;
      priorityGrid.querySelectorAll("button").forEach(function (b) {
        b.className = "modal-base-btn modal-base-btn-secondary";
        b.style.cssText = "padding:10px;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:6px;";
      });
      btn.className = "modal-base-btn modal-base-btn-primary";
      btn.style.cssText = "padding:10px;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:6px;";

      if (typeof debouncedLucide === 'function') debouncedLucide(30);
    });

    priorityGrid.appendChild(btn);
  });
  modal.body.appendChild(priorityGrid);

  const categoryField = createModalField({
    id: 'task-category-select',
    label: typeof t === 'function' ? t('category', 'Category') : 'Category',
    type: 'select',
    value: task.category || categoryOptions[0],
    options: categoryOptions.map(cat => {
      const catKey = cat.toLowerCase();
      const translatedCat = (typeof t === 'function' && t(catKey) !== catKey) ? t(catKey, cat) : cat;
      return { value: cat, label: translatedCat };
    })
  });
  modal.body.appendChild(categoryField.field);

  // ✅ حقل تاريخ نصي مع أزرار سريعة
  const dateField = buildDateFieldWithShortcuts({
    id: 'task-date-input',
    label: typeof t === 'function' ? t('due_date', 'Due Date') : 'Due Date',
    value: task.dueDate || '',
    placeholder: 'YYYY-MM-DD',
    required: false,
    helper: typeof t === 'function' ? t('date_format_hint', 'Format: YYYY-MM-DD') : 'Format: YYYY-MM-DD',
    showShortcuts: true
  });
  modal.body.appendChild(dateField.field);

  const actions = createModalActions([
    {
      label: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
      type: 'secondary',
      onClick: () => modal.close()
    },
    {
      label: typeof t === 'function' ? t('update', 'Update Task') : 'Update Task',
      type: 'primary',
      onClick: () => {
        const text = textField.input.value.trim();
        if (!text) {
          textField.input.classList.add("modal-base-input-error");
          textField.input.focus();
          setTimeout(() => textField.input.classList.remove("modal-base-input-error"), 500);
          return;
        }

        // ✅ التحقق من صحة التاريخ
        const dueDateValue = dateField.input.value.trim();
        if (dueDateValue && !isValidDateString(dueDateValue)) {
          dateField.input.classList.add("modal-base-input-error");
          dateField.errorEl.textContent = typeof t === 'function' 
            ? t('invalid_date', 'Invalid date. Use YYYY-MM-DD format (e.g. 2026-10-26)') 
            : 'Invalid date. Use YYYY-MM-DD format (e.g. 2026-10-26)';
          dateField.errorEl.classList.add('show');
          dateField.input.focus();
          setTimeout(() => {
            dateField.input.classList.remove("modal-base-input-error");
          }, 2000);
          return;
        }

        const success = updateTask(task.id, {
          text: text,
          priority: selectedPriority,
          category: categoryField.input.value,
          dueDate: dueDateValue || null
        });

        if (!success) {
          if (typeof showToast === 'function') {
            showToast('❌ ' + (typeof t === 'function' ? t('save_failed', 'Failed to update task') : 'Failed to update task'), 'error');
          }
          return;
        }

        modal.close();
        setTimeout(() => {
          renderTaskList(
            document.querySelector(".filter-btn.active")?.dataset.filter || "all",
            document.getElementById("task-search-input")?.value || ""
          );
        }, 250);
      }
    }
  ]);
  modal.body.appendChild(actions);

  setTimeout(() => textField.input.focus(), 100);
}

// ========================================
// نافذة إكمال مهمة
// ========================================
function openCompleteTaskModal(task) {
  let selectedDifficulty = "Medium";

  const modal = createModal({
    id: 'complete-task-modal',
    title: '<span data-lucide="check-circle"></span> ' + (typeof t === 'function' ? t('complete_task', 'Complete Task') : 'Complete Task'),
    size: 'medium'
  });

  const taskName = document.createElement("p");
  taskName.className = "modal-base-message";
  taskName.style.marginBottom = "16px";
  taskName.innerHTML = `<strong>${escapeHtml(task.text)}</strong>`;
  modal.body.appendChild(taskName);

  const difficultyLabel = document.createElement("label");
  difficultyLabel.className = "modal-base-label";
  difficultyLabel.textContent = typeof t === 'function' ? t('difficulty', 'Difficulty') : 'Difficulty';
  modal.body.appendChild(difficultyLabel);

  const difficultyGrid = document.createElement("div");
  difficultyGrid.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;";

  Object.keys(DIFFICULTY_CONFIG).forEach(function (diffKey) {
    const cfg = DIFFICULTY_CONFIG[diffKey];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-base-btn " + (diffKey === selectedDifficulty ? "modal-base-btn-primary" : "modal-base-btn-secondary");
    btn.style.cssText = "padding:10px;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:6px;";
    btn.innerHTML = `
      <span data-lucide="${cfg.icon}" 
            style="width:16px;height:16px;color:${diffKey === selectedDifficulty ? '#ffffff' : cfg.color};pointer-events:none;"></span>
      <span>${typeof t === 'function' ? t(cfg.key, cfg.fallback) : cfg.fallback}</span>
    `;

    btn.addEventListener("click", function () {
      selectedDifficulty = diffKey;
      difficultyGrid.querySelectorAll("button").forEach(function (b) {
        b.className = "modal-base-btn modal-base-btn-secondary";
        b.style.cssText = "padding:10px;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:6px;";
      });
      btn.className = "modal-base-btn modal-base-btn-primary";
      btn.style.cssText = "padding:10px;font-size:14px;display:inline-flex;align-items:center;justify-content:center;gap:6px;";

      if (typeof debouncedLucide === 'function') debouncedLucide(30);
    });

    difficultyGrid.appendChild(btn);
  });
  modal.body.appendChild(difficultyGrid);

  // ✅ حقل تاريخ نصي مع أزرار سريعة
  const dateField = buildDateFieldWithShortcuts({
    id: 'completion-date-input',
    label: typeof t === 'function' ? t('completion_date', 'Completion date') : 'Completion date',
    value: getTodayDateString(),
    placeholder: 'YYYY-MM-DD',
    required: false,
    helper: typeof t === 'function' ? t('date_format_hint', 'Format: YYYY-MM-DD') : 'Format: YYYY-MM-DD',
    showShortcuts: true
  });
  modal.body.appendChild(dateField.field);

  const actions = createModalActions([
    {
      label: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
      type: 'secondary',
      onClick: () => modal.close()
    },
    {
      label: '<span data-lucide="check"></span> ' + (typeof t === 'function' ? t('done', 'Done') : 'Done'),
      type: 'primary',
      onClick: () => {
        // ✅ التحقق من صحة التاريخ
        const completionDateValue = dateField.input.value.trim();
        if (!completionDateValue) {
          // إذا كان فارغاً، استخدم اليوم
          dateField.input.value = getTodayDateString();
        } else if (!isValidDateString(completionDateValue)) {
          dateField.input.classList.add("modal-base-input-error");
          dateField.errorEl.textContent = typeof t === 'function' 
            ? t('invalid_date', 'Invalid date. Use YYYY-MM-DD format (e.g. 2026-10-26)') 
            : 'Invalid date. Use YYYY-MM-DD format (e.g. 2026-10-26)';
          dateField.errorEl.classList.add('show');
          dateField.input.focus();
          setTimeout(() => {
            dateField.input.classList.remove("modal-base-input-error");
          }, 2000);
          return;
        }

        const success = completeTask(task.id, selectedDifficulty, dateField.input.value.trim());

        if (!success) {
          if (typeof showToast === 'function') {
            showToast('❌ ' + (typeof t === 'function' ? t('save_failed', 'Failed to complete task') : 'Failed to complete task'), 'error');
          }
          return;
        }

        modal.close();
        setTimeout(() => {
          renderTaskList(
            document.querySelector(".filter-btn.active")?.dataset.filter || "all",
            document.getElementById("task-search-input")?.value || ""
          );
        }, 250);
      }
    }
  ]);
  modal.body.appendChild(actions);
}

// ========================================
// ✅ دوال إضافية (تستخدم getTasksCopy)
// ========================================

function getActiveTasks() {
  const tasks = (typeof getTasksCopy === 'function')
    ? getTasksCopy()
    : (typeof getAllTasks === 'function' ? getAllTasks() : []);
  return tasks.filter(t => !t.completed);
}

function getOverdueTasks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = (typeof getTasksCopy === 'function')
    ? getTasksCopy()
    : (typeof getAllTasks === 'function' ? getAllTasks() : []);

  return tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    const dueDate = parseDate(t.dueDate);
    return dueDate && dueDate < today;
  });
}

function getTodayTasks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = (typeof getTasksCopy === 'function')
    ? getTasksCopy()
    : (typeof getAllTasks === 'function' ? getAllTasks() : []);

  return tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    const dueDate = parseDate(t.dueDate);
    return dueDate && dueDate.getTime() === today.getTime();
  });
}

// ========================================
// التصدير
// ========================================
window.renderTasks = renderTasks;
window.renderTaskList = renderTaskList;
window.getActiveTasks = getActiveTasks;
window.getOverdueTasks = getOverdueTasks;
window.getTodayTasks = getTodayTasks;
window.isValidDateString = isValidDateString;

// ✅ تصدير الإعدادات (للاستخدام في ملفات أخرى مثل achievements.js)
window.PRIORITY_CONFIG = PRIORITY_CONFIG;
window.DIFFICULTY_CONFIG = DIFFICULTY_CONFIG;
window.buildPriorityIconHTML = buildPriorityIconHTML;
window.buildDifficultyIconHTML = buildDifficultyIconHTML;

console.log("✅ Tasks.js v2.5 loaded successfully! (Text Date Input)");
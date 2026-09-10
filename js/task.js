const priorityOptions = [
  { value: "high", label: "🔴 " + (typeof t === 'function' ? t('high', 'High') : "High") },
  { value: "medium", label: "🟡 " + (typeof t === 'function' ? t('medium', 'Medium') : "Medium") },
  { value: "low", label: "🟢 " + (typeof t === 'function' ? t('low', 'Low') : "Low") }
];

const categoryOptions = [
  "University", "Programming", "Fitness", "Personal", "Work", "Home"
];

const difficultyOptions = [
  (typeof t === 'function' ? t('easy', 'Easy') : "Easy"),
  (typeof t === 'function' ? t('medium', 'Medium') : "Medium"),
  (typeof t === 'function' ? t('hard', 'Hard') : "Hard")
];

function renderTasks() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  // ===== العنوان وزر الإضافة =====
  const headerDiv = document.createElement("div");
  headerDiv.style.display = "flex";
  headerDiv.style.justifyContent = "space-between";
  headerDiv.style.alignItems = "center";
  headerDiv.style.marginBottom = "16px";

  const titleWrapper = document.createElement("div");
  titleWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  const titleIcon = document.createElement("span");
  titleIcon.setAttribute("data-lucide", "list-checks");
  titleIcon.style.cssText = `
    width: 28px;
    height: 28px;
    color: var(--primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `;

  const title = document.createElement("h2");
  title.textContent = typeof t === 'function' ? t('task_title', 'Tasks') : "Tasks";
  title.style.marginBottom = "0";

  titleWrapper.appendChild(titleIcon);
  titleWrapper.appendChild(title);
  headerDiv.appendChild(titleWrapper);

  const addBtn = document.createElement("button");
  addBtn.id = "add-task-btn";
  addBtn.textContent = "+ " + (typeof t === 'function' ? t('add_task', 'Add Task') : "Add Task");
  addBtn.style.marginBottom = "0";
  addBtn.addEventListener("click", function () { openAddTaskModal(); });
  headerDiv.appendChild(addBtn);

  app.appendChild(headerDiv);

  // ===== شريط البحث =====
  const searchDiv = document.createElement("div");
  searchDiv.style.cssText = `
    margin-bottom: 16px;
    position: relative;
  `;

  const searchIcon = document.createElement("span");
  searchIcon.setAttribute("data-lucide", "search");
  searchIcon.style.cssText = `
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: var(--text-muted);
    pointer-events: none;
  `;

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "task-search-input";
  searchInput.placeholder = typeof t === 'function' ? t('search_tasks', 'Search tasks...') : "Search tasks...";
  searchInput.style.cssText = `
    width: 100%;
    height: 46px;
    padding: 0 16px 0 44px;
    background: var(--bg-input);
    color: var(--text-primary);
    border: 1px solid var(--border-input);
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 14px;
    transition: all 0.2s ease;
    outline: none;
  `;

  searchInput.addEventListener("focus", function() {
    this.style.borderColor = "var(--primary)";
    this.style.boxShadow = "0 0 0 3px rgba(79, 142, 219, 0.12)";
  });

  searchInput.addEventListener("blur", function() {
    this.style.borderColor = "var(--border-input)";
    this.style.boxShadow = "none";
  });

  searchInput.addEventListener("input", function() {
    renderTaskList(
      document.querySelector(".filter-btn.active")?.dataset.filter || "all",
      this.value
    );
  });

  searchDiv.appendChild(searchIcon);
  searchDiv.appendChild(searchInput);
  app.appendChild(searchDiv);

  // ===== الفلاتر =====
  const filterDiv = document.createElement("div");
  filterDiv.id = "task-filters";
  filterDiv.style.display = "flex";
  filterDiv.style.gap = "10px";
  filterDiv.style.marginBottom = "16px";
  filterDiv.style.flexWrap = "wrap";

  const filterLabel = document.createElement("span");
  filterLabel.textContent = (typeof t === 'function' ? t('filter_by_priority', 'Filter by priority:') : "Filter by priority:");
  filterLabel.style.fontSize = "14px";
  filterLabel.style.fontWeight = "500";
  filterDiv.appendChild(filterLabel);

  const filterAll = document.createElement("button");
  filterAll.textContent = typeof t === 'function' ? t('all', 'All') : "All";
  filterAll.className = "filter-btn active";
  filterAll.dataset.filter = "all";
  filterDiv.appendChild(filterAll);

  priorityOptions.forEach(function (opt) {
    const btn = document.createElement("button");
    btn.textContent = opt.label;
    btn.className = "filter-btn";
    btn.dataset.filter = opt.value;
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
  
  setTimeout(function() {
    if (typeof initLucideIcons === 'function') {
      initLucideIcons();
    }
  }, 50);
}

function renderTaskList(filter = "all", searchTerm = "") {
  const taskList = document.getElementById("task-list");
  if (!taskList) return;

  let tasks = getAllTasks().filter(function (t) { return !t.completed; });

  // تطبيق الفلتر حسب الأولوية
  if (filter !== "all") {
    tasks = tasks.filter(function (t) { return t.priority === filter; });
  }

  // تطبيق البحث
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
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const fragment = document.createDocumentFragment();

  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.style.cssText = `
      text-align: center;
      padding: 40px 20px;
      color: var(--text-muted);
    `;

    const emptyIcon = document.createElement("div");
    emptyIcon.innerHTML = '<span data-lucide="inbox" style="width: 48px; height: 48px; opacity: 0.3;"></span>';
    emptyIcon.style.marginBottom = "12px";

    const emptyText = document.createElement("p");
    emptyText.style.fontSize = "16px";
    emptyText.style.fontFamily = "var(--font-handwritten)";

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
      leftDiv.style.display = "flex";
      leftDiv.style.alignItems = "center";
      leftDiv.style.gap = "12px";
      leftDiv.style.flex = "1";

      const circleBtn = document.createElement("button");
      circleBtn.className = "task-circle";
      circleBtn.title = typeof t === 'function' ? t('complete_task', 'Mark as completed') : "Mark as completed";
      circleBtn.addEventListener("click", function () {
        openCompleteTaskModal(task);
      });

      const textDiv = document.createElement("div");
      textDiv.style.display = "flex";
      textDiv.style.flexDirection = "column";

      const textSpan = document.createElement("span");
      textSpan.className = "task-text";
      textSpan.textContent = task.text;

      const metaDiv = document.createElement("div");
      metaDiv.style.display = "flex";
      metaDiv.style.gap = "8px";
      metaDiv.style.fontSize = "12px";
      metaDiv.style.color = "#6b7280";

      const categorySpan = document.createElement("span");
      categorySpan.className = "task-category";
      // ترجمة التصنيف إذا كان موجوداً في الترجمة
      const categoryKey = task.category ? task.category.toLowerCase() : "";
      const translatedCategory = (typeof t === 'function' && t(categoryKey) !== categoryKey) ? t(categoryKey, task.category) : task.category;
      categorySpan.textContent = translatedCategory || task.category;

      metaDiv.appendChild(categorySpan);

      if (task.dueDate) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "task-date";
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          dateSpan.style.color = "#ef4444";
          dateSpan.textContent = "🔴 " + (typeof t === 'function' ? t('overdue', 'Overdue') : "Overdue") + ": " + task.dueDate;
        } else if (dueDate.getTime() === today.getTime()) {
          dateSpan.style.color = "#f59e0b";
          dateSpan.textContent = "🟡 " + (typeof t === 'function' ? t('today', 'Today') : "Today");
        } else {
          dateSpan.textContent = "📅 " + task.dueDate;
        }
        
        metaDiv.appendChild(dateSpan);
      }

      textDiv.appendChild(textSpan);
      textDiv.appendChild(metaDiv);

      leftDiv.appendChild(circleBtn);
      leftDiv.appendChild(textDiv);

      const rightDiv = document.createElement("div");
      rightDiv.style.display = "flex";
      rightDiv.style.gap = "6px";

      const editBtn = document.createElement("button");
      editBtn.innerHTML = '<span data-lucide="pencil" style="width: 16px; height: 16px;"></span>';
      editBtn.className = "task-action-btn";
      editBtn.title = typeof t === 'function' ? t('edit_task', 'Edit task') : "Edit task";
      editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openEditTaskModal(task);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width: 16px; height: 16px;"></span>';
      deleteBtn.className = "task-action-btn";
      deleteBtn.title = typeof t === 'function' ? t('delete_task', 'Delete task') : "Delete task";
      deleteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (confirm("Delete this task?")) {
          deleteTask(task.id);
          renderTaskList(
            document.querySelector(".filter-btn.active")?.dataset.filter || "all",
            document.getElementById("task-search-input")?.value || ""
          );
        }
      });

      rightDiv.appendChild(editBtn);
      rightDiv.appendChild(deleteBtn);

      item.appendChild(leftDiv);
      item.appendChild(rightDiv);
      fragment.appendChild(item);
    });
  }

  taskList.innerHTML = "";
  taskList.appendChild(fragment);
  
  setTimeout(function() {
    if (typeof initLucideIcons === 'function') {
      initLucideIcons();
    }
  }, 50);
}

// ===== دوال CRUD =====
function deleteTask(taskId) {
  const tasks = getAllTasks();
  const updatedTasks = tasks.filter(function (t) { return t.id !== taskId; });
  saveAllTasks(updatedTasks);
}

function updateTask(taskId, updatedData) {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex(function (t) { return t.id === taskId; });
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedData };
    saveAllTasks(tasks);
  }
}

// ===== نافذة إضافة مهمة (مع دعم الترجمة) =====
function openAddTaskModal() {
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";

  const modal = document.createElement("div");
  modal.id = "hour-modal";

  const title = document.createElement("h3");
  title.textContent = "➕ " + (typeof t === 'function' ? t('add_task', 'New Task') : "New Task");
  modal.appendChild(title);

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = typeof t === 'function' ? t('task_description', 'Task description') : "Task description";
  textInput.id = "task-text-input";
  modal.appendChild(textInput);

  const priorityLabel = document.createElement("p");
  priorityLabel.className = "modal-subtitle";
  priorityLabel.textContent = typeof t === 'function' ? t('priority', 'Priority') : "Priority";
  modal.appendChild(priorityLabel);

  const priorityGrid = document.createElement("div");
  priorityGrid.id = "suggestions-grid";
  let selectedPriority = "medium";

  priorityOptions.forEach(function (opt) {
    const btn = document.createElement("button");
    btn.className = "suggestion-btn";
    btn.textContent = opt.label;
    if (opt.value === selectedPriority) btn.classList.add("selected");

    btn.addEventListener("click", function () {
      selectedPriority = opt.value;
      priorityGrid.querySelectorAll(".suggestion-btn").forEach(function (b) {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");
    });

    priorityGrid.appendChild(btn);
  });
  modal.appendChild(priorityGrid);

  const categoryLabel = document.createElement("p");
  categoryLabel.className = "modal-subtitle";
  categoryLabel.textContent = typeof t === 'function' ? t('category', 'Category') : "Category";
  modal.appendChild(categoryLabel);

  const categorySelect = document.createElement("select");
  categorySelect.id = "task-category-select";
  categoryOptions.forEach(function (cat) {
    const option = document.createElement("option");
    option.value = cat;
    // ترجمة التصنيف
    const catKey = cat.toLowerCase();
    const translatedCat = (typeof t === 'function' && t(catKey) !== catKey) ? t(catKey, cat) : cat;
    option.textContent = translatedCat;
    categorySelect.appendChild(option);
  });
  modal.appendChild(categorySelect);

  const dateLabel = document.createElement("p");
  dateLabel.className = "modal-subtitle";
  dateLabel.textContent = typeof t === 'function' ? t('due_date', 'Due Date (optional)') : "Due Date (optional)";
  modal.appendChild(dateLabel);

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "task-date-input";
  modal.appendChild(dateInput);

  const saveBtn = document.createElement("button");
  saveBtn.id = "save-custom-btn";
  saveBtn.textContent = typeof t === 'function' ? t('save_task', 'Save Task') : "Save Task";
  saveBtn.addEventListener("click", function () {
    if (textInput.value.trim() === "") return;
    addTask({
      text: textInput.value.trim(),
      priority: selectedPriority,
      category: categorySelect.value,
      dueDate: dateInput.value || null
    });
    closeModal();
    renderTaskList(document.querySelector(".filter-btn.active")?.dataset.filter || "all", document.getElementById("task-search-input")?.value || "");
  });
  modal.appendChild(saveBtn);

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = '<span data-lucide="x" style="width: 20px; height: 20px;"></span>';
  closeBtn.id = "close-modal-btn";
  closeBtn.addEventListener("click", function () { closeModal(); });
  modal.appendChild(closeBtn);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
}

// ===== نافذة تعديل المهمة (مع دعم الترجمة) =====
function openEditTaskModal(task) {
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";

  const modal = document.createElement("div");
  modal.id = "hour-modal";

  const title = document.createElement("h3");
  title.innerHTML = '<span data-lucide="pencil" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 4px;"></span> ' + (typeof t === 'function' ? t('edit_task', 'Edit Task') : "Edit Task");
  modal.appendChild(title);

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = typeof t === 'function' ? t('task_description', 'Task description') : "Task description";
  textInput.id = "task-text-input";
  textInput.value = task.text;
  modal.appendChild(textInput);

  const priorityLabel = document.createElement("p");
  priorityLabel.className = "modal-subtitle";
  priorityLabel.textContent = typeof t === 'function' ? t('priority', 'Priority') : "Priority";
  modal.appendChild(priorityLabel);

  const priorityGrid = document.createElement("div");
  priorityGrid.id = "suggestions-grid";
  let selectedPriority = task.priority;

  priorityOptions.forEach(function (opt) {
    const btn = document.createElement("button");
    btn.className = "suggestion-btn";
    btn.textContent = opt.label;
    if (opt.value === selectedPriority) btn.classList.add("selected");

    btn.addEventListener("click", function () {
      selectedPriority = opt.value;
      priorityGrid.querySelectorAll(".suggestion-btn").forEach(function (b) {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");
    });

    priorityGrid.appendChild(btn);
  });
  modal.appendChild(priorityGrid);

  const categoryLabel = document.createElement("p");
  categoryLabel.className = "modal-subtitle";
  categoryLabel.textContent = typeof t === 'function' ? t('category', 'Category') : "Category";
  modal.appendChild(categoryLabel);

  const categorySelect = document.createElement("select");
  categorySelect.id = "task-category-select";
  categoryOptions.forEach(function (cat) {
    const option = document.createElement("option");
    option.value = cat;
    const catKey = cat.toLowerCase();
    const translatedCat = (typeof t === 'function' && t(catKey) !== catKey) ? t(catKey, cat) : cat;
    option.textContent = translatedCat;
    if (cat === task.category) option.selected = true;
    categorySelect.appendChild(option);
  });
  modal.appendChild(categorySelect);

  const dateLabel = document.createElement("p");
  dateLabel.className = "modal-subtitle";
  dateLabel.textContent = typeof t === 'function' ? t('due_date', 'Due Date') : "Due Date";
  modal.appendChild(dateLabel);

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "task-date-input";
  dateInput.value = task.dueDate || "";
  modal.appendChild(dateInput);

  const saveBtn = document.createElement("button");
  saveBtn.id = "save-custom-btn";
  saveBtn.textContent = typeof t === 'function' ? t('update', 'Update Task') : "Update Task";
  saveBtn.addEventListener("click", function () {
    if (textInput.value.trim() === "") return;
    updateTask(task.id, {
      text: textInput.value.trim(),
      priority: selectedPriority,
      category: categorySelect.value,
      dueDate: dateInput.value || null
    });
    closeModal();
    renderTaskList(document.querySelector(".filter-btn.active")?.dataset.filter || "all", document.getElementById("task-search-input")?.value || "");
  });
  modal.appendChild(saveBtn);

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = '<span data-lucide="x" style="width: 20px; height: 20px;"></span>';
  closeBtn.id = "close-modal-btn";
  closeBtn.addEventListener("click", function () { closeModal(); });
  modal.appendChild(closeBtn);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
}

// ===== نافذة إكمال المهمة (مع دعم الترجمة) =====
function openCompleteTaskModal(task) {
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";

  const modal = document.createElement("div");
  modal.id = "hour-modal";

  const title = document.createElement("h3");
  title.textContent = "✅ " + (typeof t === 'function' ? t('complete_task', 'Complete Task') : "Complete Task");
  modal.appendChild(title);

  const taskNameP = document.createElement("p");
  taskNameP.className = "modal-subtitle";
  taskNameP.textContent = task.text;
  modal.appendChild(taskNameP);

  const difficultyLabel = document.createElement("p");
  difficultyLabel.className = "modal-subtitle";
  difficultyLabel.textContent = typeof t === 'function' ? t('difficulty', 'Difficulty') : "Difficulty";
  modal.appendChild(difficultyLabel);

  const difficultyGrid = document.createElement("div");
  difficultyGrid.id = "suggestions-grid";
  let selectedDifficulty = "Medium";

  const diffOptions = [
    { value: "Easy", label: typeof t === 'function' ? t('easy', '🟢 Easy') : "🟢 Easy" },
    { value: "Medium", label: typeof t === 'function' ? t('medium', '🟡 Medium') : "🟡 Medium" },
    { value: "Hard", label: typeof t === 'function' ? t('hard', '🔴 Hard') : "🔴 Hard" }
  ];

  diffOptions.forEach(function (level) {
    const btn = document.createElement("button");
    btn.className = "suggestion-btn";
    btn.textContent = level.label;
    if (level.value === selectedDifficulty) btn.classList.add("selected");

    btn.addEventListener("click", function () {
      selectedDifficulty = level.value;
      difficultyGrid.querySelectorAll(".suggestion-btn").forEach(function (b) {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");
    });

    difficultyGrid.appendChild(btn);
  });
  modal.appendChild(difficultyGrid);

  const dateLabel = document.createElement("p");
  dateLabel.className = "modal-subtitle";
  dateLabel.textContent = typeof t === 'function' ? t('completion_date', 'Completion date') : "Completion date";
  modal.appendChild(dateLabel);

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "completion-date-input";
  dateInput.value = new Date().toISOString().split("T")[0];
  modal.appendChild(dateInput);

  const doneBtn = document.createElement("button");
  doneBtn.id = "save-custom-btn";
  doneBtn.textContent = typeof t === 'function' ? t('done', 'Done') : "Done";
  doneBtn.addEventListener("click", function () {
    completeTask(task.id, selectedDifficulty, dateInput.value);
    closeModal();
    renderTaskList(document.querySelector(".filter-btn.active")?.dataset.filter || "all", document.getElementById("task-search-input")?.value || "");
  });
  modal.appendChild(doneBtn);

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = '<span data-lucide="x" style="width: 20px; height: 20px;"></span>';
  closeBtn.id = "close-modal-btn";
  closeBtn.addEventListener("click", function () { closeModal(); });
  modal.appendChild(closeBtn);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
}

// ========================================
// ✅ تصدير الدوال للاستخدام من ملفات أخرى
// ========================================

window.renderTasks = renderTasks;
window.renderTaskList = renderTaskList;

console.log("✅ Tasks.js loaded successfully!");
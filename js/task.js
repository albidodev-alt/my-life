// ========================================
// MY LIFE HUB - TASKS
// ========================================

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

// ========================================
// عرض صفحة المهام
// ========================================
function renderTasks() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  // ===== العنوان وزر الإضافة =====
  const headerDiv = document.createElement("div");
  headerDiv.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;";

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
  searchIcon.style.cssText = "position:absolute;left:14px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--text-muted);pointer-events:none;";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "task-search-input";
  searchInput.placeholder = typeof t === 'function' ? t('search_tasks', 'Search tasks...') : "Search tasks...";
  searchInput.style.cssText = "width:100%;height:46px;padding:0 16px 0 44px;background:var(--bg-input);color:var(--text-primary);border:1px solid var(--border-input);border-radius:12px;font-family:var(--font-body);font-size:14px;transition:all 0.2s ease;outline:none;";

  searchInput.addEventListener("focus", function () {
    this.style.borderColor = "var(--primary)";
    this.style.boxShadow = "0 0 0 3px rgba(79, 142, 219, 0.12)";
  });

  searchInput.addEventListener("blur", function () {
    this.style.borderColor = "var(--border-input)";
    this.style.boxShadow = "none";
  });

  searchInput.addEventListener("input", function () {
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
  filterDiv.style.cssText = "display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;";

  const filterLabel = document.createElement("span");
  filterLabel.textContent = (typeof t === 'function' ? t('filter_by_priority', 'Filter by priority:') : "Filter by priority:");
  filterLabel.style.cssText = "font-size:14px;font-weight:500;";
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

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// عرض قائمة المهام
// ========================================
function renderTaskList(filter = "all", searchTerm = "") {
  const taskList = document.getElementById("task-list");
  if (!taskList) return;

  let tasks = getAllTasks().filter(function (t) { return !t.completed; });

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
    return priorityOrder[a.priority] - priorityOrder[b.priority];
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
      leftDiv.style.cssText = "display:flex;align-items:center;gap:12px;flex:1;";

      const circleBtn = document.createElement("button");
      circleBtn.className = "task-circle";
      circleBtn.title = typeof t === 'function' ? t('complete_task', 'Mark as completed') : "Mark as completed";
      circleBtn.addEventListener("click", function () {
        openCompleteTaskModal(task);
      });

      const textDiv = document.createElement("div");
      textDiv.style.cssText = "display:flex;flex-direction:column;";

      const textSpan = document.createElement("span");
      textSpan.className = "task-text";
      textSpan.textContent = task.text;

      const metaDiv = document.createElement("div");
      metaDiv.style.cssText = "display:flex;gap:8px;font-size:12px;color:#6b7280;";

      const categorySpan = document.createElement("span");
      categorySpan.className = "task-category";
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
      rightDiv.style.cssText = "display:flex;gap:6px;";

      const editBtn = document.createElement("button");
      editBtn.innerHTML = '<span data-lucide="pencil" style="width:16px;height:16px;"></span>';
      editBtn.className = "task-action-btn";
      editBtn.title = typeof t === 'function' ? t('edit_task', 'Edit task') : "Edit task";
      editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openEditTaskModal(task);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width:16px;height:16px;"></span>';
      deleteBtn.className = "task-action-btn";
      deleteBtn.title = typeof t === 'function' ? t('delete_task', 'Delete task') : "Delete task";

      // ✨ استخدام deleteModal
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

  taskList.innerHTML = "";
  taskList.appendChild(fragment);

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
    required: true
  });
  modal.body.appendChild(textField.field);

  const priorityLabel = document.createElement("label");
  priorityLabel.className = "modal-base-label";
  priorityLabel.textContent = typeof t === 'function' ? t('priority', 'Priority') : 'Priority';
  modal.body.appendChild(priorityLabel);

  const priorityGrid = document.createElement("div");
  priorityGrid.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;";

  priorityOptions.forEach(function (opt) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-base-btn " + (opt.value === selectedPriority ? "modal-base-btn-primary" : "modal-base-btn-secondary");
    btn.style.cssText = "padding:10px;font-size:14px;";
    btn.textContent = opt.label;

    btn.addEventListener("click", function () {
      selectedPriority = opt.value;
      priorityGrid.querySelectorAll("button").forEach(function (b) {
        b.className = "modal-base-btn modal-base-btn-secondary";
        b.style.cssText = "padding:10px;font-size:14px;";
      });
      btn.className = "modal-base-btn modal-base-btn-primary";
      btn.style.cssText = "padding:10px;font-size:14px;";
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

  const dateField = createModalField({
    id: 'task-date-input',
    label: typeof t === 'function' ? t('due_date', 'Due Date (optional)') : 'Due Date (optional)',
    type: 'date'
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

        addTask({
          text: text,
          priority: selectedPriority,
          category: categoryField.input.value,
          dueDate: dateField.input.value || null
        });

        modal.close();
        renderTaskList(
          document.querySelector(".filter-btn.active")?.dataset.filter || "all",
          document.getElementById("task-search-input")?.value || ""
        );
      }
    }
  ]);
  modal.body.appendChild(actions);
}

// ========================================
// نافذة تعديل مهمة
// ========================================
function openEditTaskModal(task) {
  let selectedPriority = task.priority;

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
    required: true
  });
  modal.body.appendChild(textField.field);

  const priorityLabel = document.createElement("label");
  priorityLabel.className = "modal-base-label";
  priorityLabel.textContent = typeof t === 'function' ? t('priority', 'Priority') : 'Priority';
  modal.body.appendChild(priorityLabel);

  const priorityGrid = document.createElement("div");
  priorityGrid.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;";

  priorityOptions.forEach(function (opt) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-base-btn " + (opt.value === selectedPriority ? "modal-base-btn-primary" : "modal-base-btn-secondary");
    btn.style.cssText = "padding:10px;font-size:14px;";
    btn.textContent = opt.label;

    btn.addEventListener("click", function () {
      selectedPriority = opt.value;
      priorityGrid.querySelectorAll("button").forEach(function (b) {
        b.className = "modal-base-btn modal-base-btn-secondary";
        b.style.cssText = "padding:10px;font-size:14px;";
      });
      btn.className = "modal-base-btn modal-base-btn-primary";
      btn.style.cssText = "padding:10px;font-size:14px;";
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

  const dateField = createModalField({
    id: 'task-date-input',
    label: typeof t === 'function' ? t('due_date', 'Due Date') : 'Due Date',
    type: 'date',
    value: task.dueDate || ''
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

        updateTask(task.id, {
          text: text,
          priority: selectedPriority,
          category: categoryField.input.value,
          dueDate: dateField.input.value || null
        });

        modal.close();
        renderTaskList(
          document.querySelector(".filter-btn.active")?.dataset.filter || "all",
          document.getElementById("task-search-input")?.value || ""
        );
      }
    }
  ]);
  modal.body.appendChild(actions);
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

  const diffOptions = [
    { value: "Easy", label: "🟢 " + (typeof t === 'function' ? t('easy', 'Easy') : "Easy") },
    { value: "Medium", label: "🟡 " + (typeof t === 'function' ? t('medium', 'Medium') : "Medium") },
    { value: "Hard", label: "🔴 " + (typeof t === 'function' ? t('hard', 'Hard') : "Hard") }
  ];

  diffOptions.forEach(function (level) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-base-btn " + (level.value === selectedDifficulty ? "modal-base-btn-primary" : "modal-base-btn-secondary");
    btn.style.cssText = "padding:10px;font-size:14px;";
    btn.textContent = level.label;

    btn.addEventListener("click", function () {
      selectedDifficulty = level.value;
      difficultyGrid.querySelectorAll("button").forEach(function (b) {
        b.className = "modal-base-btn modal-base-btn-secondary";
        b.style.cssText = "padding:10px;font-size:14px;";
      });
      btn.className = "modal-base-btn modal-base-btn-primary";
      btn.style.cssText = "padding:10px;font-size:14px;";
    });

    difficultyGrid.appendChild(btn);
  });
  modal.body.appendChild(difficultyGrid);

  const dateField = createModalField({
    id: 'completion-date-input',
    label: typeof t === 'function' ? t('completion_date', 'Completion date') : 'Completion date',
    type: 'date',
    value: new Date().toISOString().split("T")[0]
  });
  modal.body.appendChild(dateField.field);

  const actions = createModalActions([
    {
      label: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
      type: 'secondary',
      onClick: () => modal.close()
    },
    {
      label: '✅ ' + (typeof t === 'function' ? t('done', 'Done') : 'Done'),
      type: 'primary',
      onClick: () => {
        completeTask(task.id, selectedDifficulty, dateField.input.value);
        modal.close();
        renderTaskList(
          document.querySelector(".filter-btn.active")?.dataset.filter || "all",
          document.getElementById("task-search-input")?.value || ""
        );
      }
    }
  ]);
  modal.body.appendChild(actions);
}

// ========================================
// التصدير
// ========================================
window.renderTasks = renderTasks;
window.renderTaskList = renderTaskList;

console.log("✅ Tasks.js loaded successfully!");
const priorityOptions = [
  { value: "high", label: "🔴 High" },
  { value: "medium", label: "🟡 Medium" },
  { value: "low", label: "🟢 Low" }
];

const categoryOptions = ["University", "Programming", "Fitness", "Personal", "Work", "Home"];
const difficultyOptions = ["Easy", "Medium", "Hard"];

function renderTasks() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  // ===== العنوان وزر الإضافة =====
  const headerDiv = document.createElement("div");
  headerDiv.style.display = "flex";
  headerDiv.style.justifyContent = "space-between";
  headerDiv.style.alignItems = "center";
  headerDiv.style.marginBottom = "16px";

  const title = document.createElement("h2");
  title.textContent = "📋 Tasks";
  title.style.marginBottom = "0";
  headerDiv.appendChild(title);

  const addBtn = document.createElement("button");
  addBtn.id = "add-task-btn";
  addBtn.textContent = "+ Add Task";
  addBtn.style.marginBottom = "0";
  addBtn.addEventListener("click", function () { openAddTaskModal(); });
  headerDiv.appendChild(addBtn);

  app.appendChild(headerDiv);

  // ===== الفلاتر =====
  const filterDiv = document.createElement("div");
  filterDiv.id = "task-filters";
  filterDiv.style.display = "flex";
  filterDiv.style.gap = "10px";
  filterDiv.style.marginBottom = "16px";
  filterDiv.style.flexWrap = "wrap";

  const filterLabel = document.createElement("span");
  filterLabel.textContent = "Filter by priority:";
  filterLabel.style.fontSize = "14px";
  filterLabel.style.fontWeight = "500";
  filterDiv.appendChild(filterLabel);

  const filterAll = document.createElement("button");
  filterAll.textContent = "All";
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
      renderTaskList(btn.dataset.filter);
    });
  });

  renderTaskList("all");
}

function renderTaskList(filter = "all") {
  const taskList = document.getElementById("task-list");
  if (!taskList) return;

  let tasks = getAllTasks().filter(function (t) { return !t.completed; });

  // تطبيق الفلتر
  if (filter !== "all") {
    tasks = tasks.filter(function (t) { return t.priority === filter; });
  }

  // ترتيب حسب الأولوية (High → Medium → Low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort(function (a, b) {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // ===== ✅ استخدام DocumentFragment لتجميع العناصر =====
  const fragment = document.createDocumentFragment();

  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = filter === "all" ? "No tasks yet. Add one!" : "No tasks with this priority.";
    fragment.appendChild(empty);
  } else {
    tasks.forEach(function (task) {
      const item = document.createElement("div");
      item.className = "task-item priority-" + task.priority;

      // ===== الجانب الأيسر (دائرة + نص) =====
      const leftDiv = document.createElement("div");
      leftDiv.style.display = "flex";
      leftDiv.style.alignItems = "center";
      leftDiv.style.gap = "12px";
      leftDiv.style.flex = "1";

      const circleBtn = document.createElement("button");
      circleBtn.className = "task-circle";
      circleBtn.title = "Mark as completed";
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
      categorySpan.textContent = task.category;

      metaDiv.appendChild(categorySpan);

      // عرض التاريخ إذا موجود
      if (task.dueDate) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "task-date";
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          dateSpan.style.color = "#ef4444";
          dateSpan.textContent = "🔴 Overdue: " + task.dueDate;
        } else if (dueDate.getTime() === today.getTime()) {
          dateSpan.style.color = "#f59e0b";
          dateSpan.textContent = "🟡 Today";
        } else {
          dateSpan.textContent = "📅 " + task.dueDate;
        }
        
        metaDiv.appendChild(dateSpan);
      }

      textDiv.appendChild(textSpan);
      textDiv.appendChild(metaDiv);

      leftDiv.appendChild(circleBtn);
      leftDiv.appendChild(textDiv);

      // ===== الجانب الأيمن (أزرار Edit + Delete) =====
      const rightDiv = document.createElement("div");
      rightDiv.style.display = "flex";
      rightDiv.style.gap = "6px";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.className = "task-action-btn";
      editBtn.title = "Edit task";
      editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openEditTaskModal(task);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.className = "task-action-btn";
      deleteBtn.title = "Delete task";
      deleteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (confirm("Delete this task?")) {
          deleteTask(task.id);
          renderTaskList(filter);
        }
      });

      rightDiv.appendChild(editBtn);
      rightDiv.appendChild(deleteBtn);

      item.appendChild(leftDiv);
      item.appendChild(rightDiv);
      fragment.appendChild(item);
    });
  }

  // ===== ✅ إضافة جميع العناصر دفعة واحدة =====
  taskList.innerHTML = "";
  taskList.appendChild(fragment);
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

// ===== نافذة إضافة مهمة (معدلة مع تاريخ) =====
function openAddTaskModal() {
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";

  const modal = document.createElement("div");
  modal.id = "hour-modal";

  const title = document.createElement("h3");
  title.textContent = "➕ New Task";
  modal.appendChild(title);

  // نص المهمة
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Task description";
  textInput.id = "task-text-input";
  modal.appendChild(textInput);

  // الأولوية
  const priorityLabel = document.createElement("p");
  priorityLabel.className = "modal-subtitle";
  priorityLabel.textContent = "Priority";
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

  // التصنيف
  const categoryLabel = document.createElement("p");
  categoryLabel.className = "modal-subtitle";
  categoryLabel.textContent = "Category";
  modal.appendChild(categoryLabel);

  const categorySelect = document.createElement("select");
  categorySelect.id = "task-category-select";
  categoryOptions.forEach(function (cat) {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
  modal.appendChild(categorySelect);

  // التاريخ (جديد)
  const dateLabel = document.createElement("p");
  dateLabel.className = "modal-subtitle";
  dateLabel.textContent = "Due Date (optional)";
  modal.appendChild(dateLabel);

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "task-date-input";
  modal.appendChild(dateInput);

  const saveBtn = document.createElement("button");
  saveBtn.id = "save-custom-btn";
  saveBtn.textContent = "Save Task";
  saveBtn.addEventListener("click", function () {
    if (textInput.value.trim() === "") return;
    addTask({
      text: textInput.value.trim(),
      priority: selectedPriority,
      category: categorySelect.value,
      dueDate: dateInput.value || null
    });
    closeModal();
    renderTaskList(document.querySelector(".filter-btn.active")?.dataset.filter || "all");
  });
  modal.appendChild(saveBtn);

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

// ===== نافذة تعديل المهمة (جديد) =====
function openEditTaskModal(task) {
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";

  const modal = document.createElement("div");
  modal.id = "hour-modal";

  const title = document.createElement("h3");
  title.textContent = "✏️ Edit Task";
  modal.appendChild(title);

  // نص المهمة
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Task description";
  textInput.id = "task-text-input";
  textInput.value = task.text;
  modal.appendChild(textInput);

  // الأولوية
  const priorityLabel = document.createElement("p");
  priorityLabel.className = "modal-subtitle";
  priorityLabel.textContent = "Priority";
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

  // التصنيف
  const categoryLabel = document.createElement("p");
  categoryLabel.className = "modal-subtitle";
  categoryLabel.textContent = "Category";
  modal.appendChild(categoryLabel);

  const categorySelect = document.createElement("select");
  categorySelect.id = "task-category-select";
  categoryOptions.forEach(function (cat) {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === task.category) option.selected = true;
    categorySelect.appendChild(option);
  });
  modal.appendChild(categorySelect);

  // التاريخ
  const dateLabel = document.createElement("p");
  dateLabel.className = "modal-subtitle";
  dateLabel.textContent = "Due Date";
  modal.appendChild(dateLabel);

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "task-date-input";
  dateInput.value = task.dueDate || "";
  modal.appendChild(dateInput);

  const saveBtn = document.createElement("button");
  saveBtn.id = "save-custom-btn";
  saveBtn.textContent = "Update Task";
  saveBtn.addEventListener("click", function () {
    if (textInput.value.trim() === "") return;
    updateTask(task.id, {
      text: textInput.value.trim(),
      priority: selectedPriority,
      category: categorySelect.value,
      dueDate: dateInput.value || null
    });
    closeModal();
    renderTaskList(document.querySelector(".filter-btn.active")?.dataset.filter || "all");
  });
  modal.appendChild(saveBtn);

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

// ===== نافذة إكمال المهمة (معدلة) =====
function openCompleteTaskModal(task) {
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";

  const modal = document.createElement("div");
  modal.id = "hour-modal";

  const title = document.createElement("h3");
  title.textContent = "✅ Complete Task";
  modal.appendChild(title);

  const taskNameP = document.createElement("p");
  taskNameP.className = "modal-subtitle";
  taskNameP.textContent = task.text;
  modal.appendChild(taskNameP);

  const difficultyLabel = document.createElement("p");
  difficultyLabel.className = "modal-subtitle";
  difficultyLabel.textContent = "Difficulty";
  modal.appendChild(difficultyLabel);

  const difficultyGrid = document.createElement("div");
  difficultyGrid.id = "suggestions-grid";
  let selectedDifficulty = "Medium";

  difficultyOptions.forEach(function (level) {
    const btn = document.createElement("button");
    btn.className = "suggestion-btn";
    btn.textContent = level;
    if (level === selectedDifficulty) btn.classList.add("selected");

    btn.addEventListener("click", function () {
      selectedDifficulty = level;
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
  dateLabel.textContent = "Completion date";
  modal.appendChild(dateLabel);

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "completion-date-input";
  dateInput.value = new Date().toISOString().split("T")[0];
  modal.appendChild(dateInput);

  const doneBtn = document.createElement("button");
  doneBtn.id = "save-custom-btn";
  doneBtn.textContent = "Done";
  doneBtn.addEventListener("click", function () {
    completeTask(task.id, selectedDifficulty, dateInput.value);
    closeModal();
    renderTaskList(document.querySelector(".filter-btn.active")?.dataset.filter || "all");
  });
  modal.appendChild(doneBtn);

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
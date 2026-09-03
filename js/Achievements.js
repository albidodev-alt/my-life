function renderCompleted() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  // ===== العنوان =====
  const title = document.createElement("h2");
  title.textContent = " Completed";
  app.appendChild(title);

  // ===== الفلاتر =====
  const filterDiv = document.createElement("div");
  filterDiv.id = "task-filters";
  filterDiv.style.display = "flex";
  filterDiv.style.gap = "10px";
  filterDiv.style.marginBottom = "16px";
  filterDiv.style.flexWrap = "wrap";

  const filterLabel = document.createElement("span");
  filterLabel.textContent = "Filter by difficulty:";
  filterLabel.style.fontSize = "14px";
  filterLabel.style.fontWeight = "500";
  filterDiv.appendChild(filterLabel);

  const filters = [
    { value: "all", label: "All" },
    { value: "Easy", label: "🟢 Easy" },
    { value: "Medium", label: "🟡 Medium" },
    { value: "Hard", label: "🔴 Hard" }
  ];

  filters.forEach(function (f) {
    const btn = document.createElement("button");
    btn.textContent = f.label;
    btn.className = "filter-btn" + (f.value === "all" ? " active" : "");
    btn.dataset.filter = f.value;
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
      renderCompletedList(btn.dataset.filter);
    });
  });

  renderCompletedList("all");
}

function renderCompletedList(filter = "all") {
  const taskList = document.getElementById("task-list");
  if (!taskList) return;
  taskList.innerHTML = "";

  let tasks = getAllTasks().filter(function (t) {
    return t.completed === true;
  });

  // تطبيق الفلتر
  if (filter !== "all") {
    tasks = tasks.filter(function (t) {
      return t.difficulty === filter;
    });
  }

  // ترتيب من الأحدث إلى الأقدم
  tasks.sort(function (a, b) {
    return new Date(b.completionDate) - new Date(a.completionDate);
  });

  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = filter === "all" 
      ? "No completed tasks yet." 
      : "No completed tasks with " + filter + " difficulty.";
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach(function (task) {
    const item = document.createElement("div");
    item.className = "task-item";

    // ===== لون حسب الصعوبة =====
    if (task.difficulty === "Hard") {
      item.style.borderLeft = "3px solid #ef4444";
    } else if (task.difficulty === "Medium") {
      item.style.borderLeft = "3px solid #f59e0b";
    } else if (task.difficulty === "Easy") {
      item.style.borderLeft = "3px solid #22c55e";
    }

    // ===== المعلومات =====
    const leftDiv = document.createElement("div");
    leftDiv.style.display = "flex";
    leftDiv.style.flexDirection = "column";
    leftDiv.style.gap = "4px";
    leftDiv.style.flex = "1";

    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = task.text;
    textSpan.style.fontWeight = "500";

    const metaDiv = document.createElement("div");
    metaDiv.style.display = "flex";
    metaDiv.style.gap = "12px";
    metaDiv.style.fontSize = "12px";
    metaDiv.style.color = "#6b7280";
    metaDiv.style.flexWrap = "wrap";

    // الصعوبة
    const difficultySpan = document.createElement("span");
    difficultySpan.className = "task-category";
    const difficultyEmoji = task.difficulty === "Hard" ? "🔴" : 
                           task.difficulty === "Medium" ? "🟡" : "🟢";
    difficultySpan.textContent = difficultyEmoji + " " + task.difficulty;

    // التصنيف
    const categorySpan = document.createElement("span");
    categorySpan.className = "task-category";
    categorySpan.textContent = "📂 " + (task.category || "General");

    // تاريخ الإكمال
    const dateSpan = document.createElement("span");
    dateSpan.className = "task-date";
    dateSpan.textContent = "✅ " + task.completionDate;

    metaDiv.appendChild(difficultySpan);
    metaDiv.appendChild(categorySpan);
    metaDiv.appendChild(dateSpan);

    leftDiv.appendChild(textSpan);
    leftDiv.appendChild(metaDiv);

    // ===== زر الحذف =====
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "task-action-btn";
    deleteBtn.title = "Delete permanently";
    deleteBtn.style.opacity = "0.5";
    deleteBtn.style.fontSize = "18px";
    deleteBtn.style.padding = "6px 12px";

    deleteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (confirm('Delete "' + task.text + '" permanently?')) {
        deleteTaskPermanently(task.id);
        renderCompletedList(
          document.querySelector(".filter-btn.active")?.dataset.filter || "all"
        );
      }
    });

    deleteBtn.addEventListener("mouseenter", function () {
      this.style.opacity = "1";
      this.style.color = "#ef4444";
    });
    deleteBtn.addEventListener("mouseleave", function () {
      this.style.opacity = "0.5";
      this.style.color = "inherit";
    });

    const rightDiv = document.createElement("div");
    rightDiv.style.display = "flex";
    rightDiv.style.alignItems = "center";
    rightDiv.appendChild(deleteBtn);

    item.appendChild(leftDiv);
    item.appendChild(rightDiv);
    taskList.appendChild(item);
  });
}

// ===== دالة حذف المهمة نهائياً =====
function deleteTaskPermanently(taskId) {
  const tasks = getAllTasks();
  const updatedTasks = tasks.filter(function (t) {
    return t.id !== taskId;
  });
  saveAllTasks(updatedTasks);
}
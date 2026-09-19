// ========================================
// MY LIFE HUB - ACHIEVEMENTS (COMPLETED TASKS)
// ========================================

function renderCompleted() {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";

  // ===== العنوان =====
  const title = document.createElement("h2");
  title.innerHTML = '<span data-lucide="check-circle" style="width:28px;height:28px;vertical-align:middle;margin-right:8px;color:var(--primary);"></span> ' +
    (typeof t === "function" ? t("completed", "Completed") : "Completed");
  app.appendChild(title);

  // ===== الفلاتر =====
  const filterDiv = document.createElement("div");
  filterDiv.id = "task-filters";
  filterDiv.style.cssText = "display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;";

  const filterLabel = document.createElement("span");
  filterLabel.innerHTML = '<span data-lucide="filter" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></span> ' +
    (typeof t === "function" ? t("filter_by_difficulty", "Filter by difficulty:") : "Filter by difficulty:");
  filterLabel.style.cssText = "font-size:14px;font-weight:500;";
  filterDiv.appendChild(filterLabel);

  const filters = [
    { value: "all", label: typeof t === "function" ? t("all", "All") : "All" },
    { value: "Easy", label: "🟢 " + (typeof t === "function" ? t("easy", "Easy") : "Easy") },
    { value: "Medium", label: "🟡 " + (typeof t === "function" ? t("medium", "Medium") : "Medium") },
    { value: "Hard", label: "🔴 " + (typeof t === "function" ? t("hard", "Hard") : "Hard") }
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

  if (typeof debouncedLucide === "function") debouncedLucide(50);
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
    empty.innerHTML = '<span data-lucide="inbox" style="width:24px;height:24px;vertical-align:middle;margin-right:8px;opacity:0.5;"></span> ' +
      (filter === "all"
        ? (typeof t === "function" ? t("no_completed_tasks", "No completed tasks yet.") : "No completed tasks yet.")
        : (typeof t === "function" ? t("no_completed_with_difficulty", "No completed tasks with ") : "No completed tasks with ") + filter + " " + (typeof t === "function" ? t("difficulty", "difficulty.") : "difficulty."));
    taskList.appendChild(empty);

    if (typeof debouncedLucide === "function") debouncedLucide(50);
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
    leftDiv.style.cssText = "display:flex;flex-direction:column;gap:4px;flex:1;";

    // ✅ استخدام textContent للنص الآمن
    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.style.fontWeight = "500";

    const checkIcon = document.createElement("span");
    checkIcon.setAttribute("data-lucide", "check-circle");
    checkIcon.style.cssText = "width:18px;height:18px;vertical-align:middle;margin-right:6px;color:#4caf84;display:inline-flex;";
    textSpan.appendChild(checkIcon);

    const taskTextNode = document.createElement("span");
    taskTextNode.textContent = task.text;
    textSpan.appendChild(taskTextNode);

    const metaDiv = document.createElement("div");
    metaDiv.style.cssText = "display:flex;gap:12px;font-size:12px;color:#6b7280;flex-wrap:wrap;";

    // الصعوبة
    const difficultySpan = document.createElement("span");
    difficultySpan.className = "task-category";
    const difficultyEmoji = task.difficulty === "Hard" ? "🔴" :
                           task.difficulty === "Medium" ? "🟡" : "🟢";
    const difficultyLabel = typeof t === "function" ? t(task.difficulty.toLowerCase(), task.difficulty) : task.difficulty;
    difficultySpan.textContent = difficultyEmoji + " " + difficultyLabel;

    // التصنيف
    const categorySpan = document.createElement("span");
    categorySpan.className = "task-category";
    const categoryLabel = typeof t === "function" ? t("category", "Category") : "Category";
    categorySpan.textContent = (task.category || categoryLabel);

    // تاريخ الإكمال
    const dateSpan = document.createElement("span");
    dateSpan.className = "task-date";
    dateSpan.textContent = "📅 " + (task.completionDate || "");

    metaDiv.appendChild(difficultySpan);
    metaDiv.appendChild(categorySpan);
    metaDiv.appendChild(dateSpan);

    leftDiv.appendChild(textSpan);
    leftDiv.appendChild(metaDiv);

    // ===== زر الحذف =====
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task-action-btn";
    deleteBtn.title = typeof t === "function" ? t("delete_permanently", "Delete permanently") : "Delete permanently";
    deleteBtn.style.cssText = "opacity:0.5;padding:6px 12px;background:none;border:none;cursor:pointer;color:inherit;font-size:18px;";

    const trashIcon = document.createElement("span");
    trashIcon.setAttribute("data-lucide", "trash-2");
    trashIcon.style.cssText = "width:16px;height:16px;";
    deleteBtn.appendChild(trashIcon);

    deleteBtn.addEventListener("mouseenter", function () {
      this.style.opacity = "1";
      this.style.color = "#ef4444";
    });
    deleteBtn.addEventListener("mouseleave", function () {
      this.style.opacity = "0.5";
      this.style.color = "inherit";
    });

    // ✅ استخدام deleteModal الموحدة (نفس نافذة باقي المهام)
    deleteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      deleteModal({
        itemName: task.text,
        itemType: 'task',
        onConfirm: () => {
          deleteTask(task.id);
          renderCompletedList(
            document.querySelector(".filter-btn.active")?.dataset.filter || "all"
          );
        }
      });
    });

    const rightDiv = document.createElement("div");
    rightDiv.style.cssText = "display:flex;align-items:center;";
    rightDiv.appendChild(deleteBtn);

    item.appendChild(leftDiv);
    item.appendChild(rightDiv);
    taskList.appendChild(item);
  });

  if (typeof debouncedLucide === "function") debouncedLucide(50);
}

// ========================================
// التصدير
// ========================================
window.renderCompleted = renderCompleted;
window.renderCompletedList = renderCompletedList;

console.log("✅ Achievements.js loaded successfully!");
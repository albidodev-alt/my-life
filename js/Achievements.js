// ========================================
// MY LIFE HUB - ACHIEVEMENTS v3.3
// (replaceChildren + Clean Lucide + Stats Cards + Grid of 20 Tasks)
// ========================================

// ========================================
// خريطة الألوان والأيقونات حسب الصعوبة
// ========================================
const ACHIEVEMENT_DIFFICULTY_MAP = {
  easy: {
    label: 'Easy',
    translationKey: 'easy',
    color: '#4caf84',
    bgColor: 'rgba(76, 175, 132, 0.10)',
    borderColor: 'rgba(76, 175, 132, 0.30)',
    icon: 'circle-check'
  },
  medium: {
    label: 'Medium',
    translationKey: 'medium',
    color: '#f5a623',
    bgColor: 'rgba(245, 166, 35, 0.10)',
    borderColor: 'rgba(245, 166, 35, 0.30)',
    icon: 'circle-check'
  },
  hard: {
    label: 'Hard',
    translationKey: 'hard',
    color: '#e74c5e',
    bgColor: 'rgba(231, 76, 94, 0.10)',
    borderColor: 'rgba(231, 76, 94, 0.30)',
    icon: 'circle-check'
  }
};

// ========================================
// الحصول على بيانات الصعوبة
// ========================================
function getAchievementDifficultyConfig(difficulty) {
  const key = (difficulty || 'Easy').toLowerCase();
  return ACHIEVEMENT_DIFFICULTY_MAP[key] || ACHIEVEMENT_DIFFICULTY_MAP.easy;
}

// ========================================
// عرض صفحة الإنجازات
// ========================================
function renderCompleted() {
  const app = document.getElementById("app");
  if (!app) return;

  // ✅ استخدام replaceChildren
  app.replaceChildren();

  // ===== الإحصائيات =====
  const stats = typeof getAchievementStats === 'function'
    ? getAchievementStats()
    : { totalCompleted: 0, easyCount: 0, mediumCount: 0, hardCount: 0 };

  // ===== الرأس =====
  const header = document.createElement("div");
  header.className = "achievements-header";

  const titleRow = document.createElement("div");
  titleRow.className = "achievements-title-row";

  const titleIcon = document.createElement("span");
  titleIcon.setAttribute("data-lucide", "trophy");
  titleIcon.className = "achievements-title-icon";

  const title = document.createElement("h2");
  title.className = "achievements-title";
  title.textContent = typeof t === 'function' ? t('achievements', 'Achievements') : 'Achievements';

  titleRow.appendChild(titleIcon);
  titleRow.appendChild(title);
  header.appendChild(titleRow);

  app.appendChild(header);

  // ===== بطاقات الإحصائيات =====
  const statsGrid = document.createElement("div");
  statsGrid.className = "achievements-stats-grid";

  const totalCard = document.createElement("div");
  totalCard.className = "achievement-stat-card achievement-stat-total";
  totalCard.innerHTML = `
    <div class="achievement-stat-value">${stats.totalCompleted}</div>
    <div class="achievement-stat-label">
      <span data-lucide="trophy" class="achievement-stat-icon"></span>
      ${typeof t === 'function' ? t('total_completed', 'Total') : 'Total'}
    </div>
  `;
  statsGrid.appendChild(totalCard);

  const easyCard = document.createElement("div");
  easyCard.className = "achievement-stat-card achievement-stat-easy";
  easyCard.innerHTML = `
    <div class="achievement-stat-value">${stats.easyCount}</div>
    <div class="achievement-stat-label">
      <span data-lucide="circle-check" class="achievement-stat-icon"></span>
      ${typeof t === 'function' ? t('easy', 'Easy') : 'Easy'}
    </div>
  `;
  statsGrid.appendChild(easyCard);

  const mediumCard = document.createElement("div");
  mediumCard.className = "achievement-stat-card achievement-stat-medium";
  mediumCard.innerHTML = `
    <div class="achievement-stat-value">${stats.mediumCount}</div>
    <div class="achievement-stat-label">
      <span data-lucide="circle-check" class="achievement-stat-icon"></span>
      ${typeof t === 'function' ? t('medium', 'Medium') : 'Medium'}
    </div>
  `;
  statsGrid.appendChild(mediumCard);

  const hardCard = document.createElement("div");
  hardCard.className = "achievement-stat-card achievement-stat-hard";
  hardCard.innerHTML = `
    <div class="achievement-stat-value">${stats.hardCount}</div>
    <div class="achievement-stat-label">
      <span data-lucide="circle-check" class="achievement-stat-icon"></span>
      ${typeof t === 'function' ? t('hard', 'Hard') : 'Hard'}
    </div>
  `;
  statsGrid.appendChild(hardCard);

  app.appendChild(statsGrid);

  // ===== الفلاتر =====
  const filterDiv = document.createElement("div");
  filterDiv.id = "task-filters";
  filterDiv.style.cssText = "display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;";

  const filterLabel = document.createElement("span");
  filterLabel.innerHTML = '<span data-lucide="filter" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></span> ' +
    (typeof t === 'function' ? t('filter_by_difficulty', 'Filter by difficulty:') : 'Filter by difficulty:');
  filterLabel.style.cssText = "font-size:14px;font-weight:500;";
  filterDiv.appendChild(filterLabel);

  const filters = [
    { value: "all", label: typeof t === 'function' ? t('all', 'All') : 'All' },
    { value: "Easy", label: typeof t === 'function' ? t('easy', 'Easy') : 'Easy' },
    { value: "Medium", label: typeof t === 'function' ? t('medium', 'Medium') : 'Medium' },
    { value: "Hard", label: typeof t === 'function' ? t('hard', 'Hard') : 'Hard' }
  ];

  filters.forEach(function (f) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = f.label;
    btn.className = "filter-btn" + (f.value === "all" ? " active" : "");
    btn.dataset.filter = f.value;
    filterDiv.appendChild(btn);
  });

  app.appendChild(filterDiv);

  // ===== شبكة المهام =====
  const grid = document.createElement("div");
  grid.id = "achievements-grid";
  grid.className = "achievements-grid";
  app.appendChild(grid);

  // ===== أحداث الفلاتر =====
  filterDiv.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterDiv.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      renderAchievementsGrid(btn.dataset.filter);
    });
  });

  renderAchievementsGrid("all");

  // ✅ Lucide يُدار من main.js
}

// ========================================
// عرض شبكة المهام المكتملة (مع replaceChildren)
// ========================================
function renderAchievementsGrid(filter = "all") {
  const grid = document.getElementById("achievements-grid");
  if (!grid) return;

  let tasks = typeof getCompletedTasksSorted === 'function'
    ? getCompletedTasksSorted()
    : [];

  if (filter !== "all") {
    tasks = tasks.filter(t => t.difficulty === filter);
  }

  // ✅ استخدام DocumentFragment
  const fragment = document.createDocumentFragment();

  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "achievements-empty";
    empty.innerHTML = `
      <span data-lucide="inbox" class="achievements-empty-icon"></span>
      <p class="achievements-empty-text">
        ${filter === "all"
          ? (typeof t === 'function' ? t('no_completed_tasks', 'No completed tasks yet.') : 'No completed tasks yet.')
          : (typeof t === 'function' ? t('no_completed_with_difficulty', 'No completed tasks with ') : 'No completed tasks with ') + filter + ' ' + (typeof t === 'function' ? t('difficulty', 'difficulty.') : 'difficulty.')}
      </p>
    `;
    fragment.appendChild(empty);
  } else {
    tasks.forEach(task => {
      const card = createAchievementCard(task);
      fragment.appendChild(card);
    });
  }

  // ✅ استخدام replaceChildren
  grid.replaceChildren(fragment);

  // ✅ Lucide يُدار من main.js أو من الدوال المستدعية
  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// إنشاء بطاقة إنجاز
// ========================================
function createAchievementCard(task) {
  const config = getAchievementDifficultyConfig(task.difficulty);

  const card = document.createElement("div");
  card.className = "achievement-card";
  card.style.setProperty('--card-color', config.color);
  card.style.setProperty('--card-bg', config.bgColor);
  card.style.setProperty('--card-border', config.borderColor);

  // ===== الرأس (أيقونة ✓ + زر الحذف) =====
  const header = document.createElement("div");
  header.className = "achievement-card-header";

  const checkIcon = document.createElement("span");
  checkIcon.className = "achievement-card-check";
  checkIcon.setAttribute("data-lucide", "check-circle");

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "achievement-card-delete";
  deleteBtn.innerHTML = '<span data-lucide="trash-2"></span>';
  deleteBtn.title = typeof t === 'function' ? t('delete', 'Delete') : 'Delete';
  deleteBtn.setAttribute("aria-label", deleteBtn.title);

  deleteBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (typeof deleteModal === 'function') {
      deleteModal({
        itemName: task.text,
        itemType: 'task',
        onConfirm: () => {
          if (typeof deleteTask === 'function') {
            deleteTask(task.id);
          }
          renderCompleted();
        }
      });
    }
  });

  header.appendChild(checkIcon);
  header.appendChild(deleteBtn);

  // ===== نص المهمة =====
  const title = document.createElement("div");
  title.className = "achievement-card-title";
  title.textContent = task.text;
  title.title = task.text;

  // ===== شارة الصعوبة =====
  const difficultyBadge = document.createElement("div");
  difficultyBadge.className = "achievement-card-badge";
  difficultyBadge.style.color = config.color;
  difficultyBadge.innerHTML = `
    <span data-lucide="${config.icon}" class="achievement-card-badge-icon"></span>
    <span>${typeof t === 'function' ? t(config.translationKey, config.label) : config.label}</span>
  `;

  // ===== التصنيف (للـ tooltip) =====
  const categoryKey = task.category ? task.category.toLowerCase() : "";
  const translatedCategory = (typeof t === 'function' && t(categoryKey) !== categoryKey)
    ? t(categoryKey, task.category)
    : task.category;

  // ===== Footer: Badge + Date =====
  const footer = document.createElement("div");
  footer.className = "achievement-card-footer";

  const metaEl = document.createElement("div");
  metaEl.className = "achievement-card-meta";
  metaEl.innerHTML = `
    <span data-lucide="calendar" class="achievement-card-meta-icon"></span>
    <span>${task.completionDate || ''}</span>
  `;
  metaEl.title = translatedCategory || 'Personal';

  footer.appendChild(difficultyBadge);
  footer.appendChild(metaEl);

  // ===== ركّب البطاقة =====
  card.appendChild(header);
  card.appendChild(title);
  card.appendChild(footer);

  // ✅ فتح نافذة التفاصيل عند الضغط على البطاقة
  card.addEventListener("click", function (e) {
    if (e.target.closest(".achievement-card-delete")) return;
    openAchievementDetails(task);
  });

  return card;
}

// ========================================
// فتح نافذة تفاصيل الإنجاز
// ========================================
function openAchievementDetails(task) {
  const config = getAchievementDifficultyConfig(task.difficulty);
  const categoryKey = task.category ? task.category.toLowerCase() : "";
  const translatedCategory = (typeof t === 'function' && t(categoryKey) !== categoryKey)
    ? t(categoryKey, task.category)
    : (task.category || 'Personal');

  const modal = createModal({
    id: 'achievement-details-modal',
    title: `<span data-lucide="trophy"></span> ${typeof t === 'function' ? t('achievement_details', 'Achievement Details') : 'Achievement Details'}`,
    size: 'small'
  });

  // ===== عنوان المهمة =====
  const titleEl = document.createElement("div");
  titleEl.style.cssText = `
    font-family: var(--font-handwritten);
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.4;
    text-align: center;
    margin-bottom: 20px;
    padding: 0 12px;
    overflow-wrap: anywhere;
    word-break: break-word;
  `;
  titleEl.textContent = task.text;
  modal.body.appendChild(titleEl);

  // ===== صف المعلومات =====
  const infoList = document.createElement("div");
  infoList.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  `;

  // ===== الصعوبة =====
  const difficultyRow = document.createElement("div");
  difficultyRow.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    background: ${config.bgColor};
    border: 1px solid ${config.borderColor};
    border-radius: 10px;
  `;
  difficultyRow.innerHTML = `
    <span style="display:flex;align-items:center;gap:6px;font-family:var(--font-handwritten);font-size:14px;font-weight:600;color:var(--text-secondary);">
      <span data-lucide="bar-chart" style="width:16px;height:16px;"></span>
      ${typeof t === 'function' ? t('difficulty', 'Difficulty') : 'Difficulty'}
    </span>
    <span style="display:flex;align-items:center;gap:5px;font-family:var(--font-handwritten);font-size:15px;font-weight:700;color:${config.color};">
      <span data-lucide="${config.icon}" style="width:14px;height:14px;"></span>
      ${typeof t === 'function' ? t(config.translationKey, config.label) : config.label}
    </span>
  `;
  infoList.appendChild(difficultyRow);

  // ===== التصنيف =====
  const categoryRow = document.createElement("div");
  categoryRow.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: 10px;
  `;
  categoryRow.innerHTML = `
    <span style="display:flex;align-items:center;gap:6px;font-family:var(--font-handwritten);font-size:14px;font-weight:600;color:var(--text-secondary);">
      <span data-lucide="folder" style="width:16px;height:16px;"></span>
      ${typeof t === 'function' ? t('category', 'Category') : 'Category'}
    </span>
    <span style="font-family:var(--font-handwritten);font-size:15px;font-weight:700;color:var(--text-primary);">
      ${translatedCategory}
    </span>
  `;
  infoList.appendChild(categoryRow);

  // ===== تاريخ الإكمال =====
  if (task.completionDate) {
    const dateRow = document.createElement("div");
    dateRow.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: 10px;
    `;
    dateRow.innerHTML = `
      <span style="display:flex;align-items:center;gap:6px;font-family:var(--font-handwritten);font-size:14px;font-weight:600;color:var(--text-secondary);">
        <span data-lucide="calendar" style="width:16px;height:16px;"></span>
        ${typeof t === 'function' ? t('completion_date', 'Completed') : 'Completed'}
      </span>
      <span style="font-family:var(--font-handwritten);font-size:15px;font-weight:700;color:var(--text-primary);">
        ${task.completionDate}
      </span>
    `;
    infoList.appendChild(dateRow);
  }

  modal.body.appendChild(infoList);

  // ===== الأزرار =====
  const actions = createModalActions([
    {
      label: typeof t === 'function' ? t('close', 'Close') : 'Close',
      type: 'secondary',
      onClick: () => modal.close()
    },
    {
      label: `<span data-lucide="trash-2"></span> ${typeof t === 'function' ? t('delete', 'Delete') : 'Delete'}`,
      type: 'danger',
      onClick: () => {
        modal.close();
        setTimeout(() => {
          if (typeof deleteModal === 'function') {
            deleteModal({
              itemName: task.text,
              itemType: 'task',
              onConfirm: () => {
                if (typeof deleteTask === 'function') {
                  deleteTask(task.id);
                }
                renderCompleted();
              }
            });
          }
        }, 250);
      }
    }
  ]);
  modal.body.appendChild(actions);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// ✅ دوال مساعدة (للاستخدام الخارجي)
// ========================================

/**
 * إعادة عرض صفحة الإنجازات (للتوافق مع الأزرار القديمة)
 */
function refreshAchievements() {
  renderCompleted();
}

// ========================================
// التصدير
// ========================================
window.renderCompleted = renderCompleted;
window.renderAchievementsGrid = renderAchievementsGrid;
window.openAchievementDetails = openAchievementDetails;
window.refreshAchievements = refreshAchievements;

console.log("✅ achievements.js v3.3 loaded successfully!");
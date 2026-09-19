// ========================================
// MY LIFE HUB - DROPS COLLECTION
// صفحة مجموعتي - رحلة البحر 🌊
// ========================================

const DROPS_LEVELS = [
  { id: 1,  required: 10,   icon: 'sprout',       nameKey: 'drops_item_1',  nameFallback: 'Sea Grass',  color: '#93c5fd' },
  { id: 2,  required: 25,   icon: 'shell',        nameKey: 'drops_item_2',  nameFallback: 'Shell',      color: '#7dd3fc' },
  { id: 3,  required: 50,   icon: 'fish',         nameKey: 'drops_item_3',  nameFallback: 'Fish',       color: '#60a5fa' },
  { id: 4,  required: 100,  icon: 'fish-symbol',  nameKey: 'drops_item_4',  nameFallback: 'Sardine',    color: '#4f8edb' },
  { id: 5,  required: 200,  icon: 'shrimp',       nameKey: 'drops_item_5',  nameFallback: 'Shrimp',     color: '#3b82f6' },
  { id: 6,  required: 350,  icon: 'waves',        nameKey: 'drops_item_6',  nameFallback: 'Waves',      color: '#2563eb' },
  { id: 7,  required: 500,  icon: 'sailboat',     nameKey: 'drops_item_7',  nameFallback: 'Sailboat',   color: '#1d4ed8' },
  { id: 8,  required: 750,  icon: 'ship',         nameKey: 'drops_item_8',  nameFallback: 'Ship',       color: '#1e40af' },
  { id: 9,  required: 1000, icon: 'anchor',       nameKey: 'drops_item_9',  nameFallback: 'Anchor',     color: '#1e3a8a' },
  { id: 10, required: 1500, icon: 'gem',          nameKey: 'drops_item_10', nameFallback: 'Sea Gem',    color: '#172554' }
];

// ========================================
// دوال مساعدة
// ========================================

function getDropsCount() {
  if (typeof getAllTasks !== 'function') return 0;
  const tasks = getAllTasks();
  return tasks.filter(t => t.completed).length;
}

function getNextLevel(drops) {
  return DROPS_LEVELS.find(level => drops < level.required) || null;
}

function getUnlockedLevels(drops) {
  return DROPS_LEVELS.filter(level => drops >= level.required);
}

function tr(key, fallback) {
  return typeof t === 'function' ? t(key, fallback) : fallback;
}

// ========================================
// عرض صفحة المجموعة
// ========================================

function renderDropsPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const drops = getDropsCount();
  const next = getNextLevel(drops);
  const unlockedLevels = getUnlockedLevels(drops);

  app.innerHTML = `
    <div id="drops-container">
      <button id="drops-back-btn" class="profile-back-btn">
        ← ${tr('back', 'Back')}
      </button>

      <!-- ===== My Sea Collection ===== -->
      <div class="drops-section">
        <div class="drops-section-header">
          <h3 class="drops-section-title">
            <span data-lucide="waves" style="width:20px;height:20px;vertical-align:middle;margin-right:8px;color:var(--primary);"></span>
            ${tr('drops_collection', 'My Sea Collection')}
          </h3>
          <div class="drops-counter-badge" title="${tr('drops_current', 'Current drops')}">
            <span data-lucide="droplet" class="drops-counter-badge-icon"></span>
            <span class="drops-counter-badge-number">${drops}</span>
            <span class="drops-counter-badge-label">${tr('drops', 'Drops')}</span>
          </div>
        </div>
        <div class="drops-items-row" id="drops-unlocked-items-row"></div>
      </div>

      <!-- ===== Next Item ===== -->
      <div class="drops-section" id="drops-next-section"></div>
    </div>
  `;

  const unlockedRow = document.getElementById('drops-unlocked-items-row');

  // ===== عرض المستويات المفتوحة =====
  if (unlockedLevels.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.style.cssText = "grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--text-muted);";
    emptyDiv.innerHTML = `
      <span data-lucide="fish" style="width:48px;height:48px;opacity:0.3;display:block;margin:0 auto 12px;"></span>
      <p style="font-family:var(--font-handwritten);font-size:16px;">
        ${tr('drops_no_items', 'Complete tasks to collect your first item!')}
      </p>
    `;
    unlockedRow.appendChild(emptyDiv);
    unlockedRow.style.display = "block";
  } else {
    unlockedLevels.forEach(level => {
      const item = document.createElement('div');
      item.className = 'drops-item drops-item-unlocked';
      item.innerHTML = `
        <div class="drops-item-icon" style="color: ${level.color};">
          <span data-lucide="${level.icon}" style="width:48px;height:48px;display:inline-flex;align-items:center;justify-content:center;"></span>
        </div>
        <div class="drops-item-name">${tr(level.nameKey, level.nameFallback)}</div>
        <div class="drops-item-count">${level.required} ${tr('drops', 'Drops')}</div>
      `;
      unlockedRow.appendChild(item);
    });
  }

  // ===== Next Item =====
  const nextSection = document.getElementById('drops-next-section');

  if (next) {
    const currentDrops = drops;
    const requiredDrops = next.required;
    const previousLevel = DROPS_LEVELS.filter(l => l.required <= drops).pop();
    const startDrops = previousLevel ? previousLevel.required : 0;
    const progress = Math.min(100, Math.round(((currentDrops - startDrops) / (requiredDrops - startDrops)) * 100));
    const remaining = requiredDrops - currentDrops;

    nextSection.innerHTML = `
      <h3 class="drops-section-title">
        <span data-lucide="target" style="width:20px;height:20px;vertical-align:middle;margin-right:8px;color:var(--primary);"></span>
        ${tr('drops_next', 'Next Item')}
      </h3>
      <div class="drops-next-card">
        <div class="drops-next-icon" style="color: ${next.color};">
          <span data-lucide="${next.icon}" style="width:64px;height:64px;display:inline-flex;align-items:center;justify-content:center;"></span>
        </div>
        <div class="drops-next-name">${tr(next.nameKey, next.nameFallback)}</div>
        <div class="drops-progress-bar">
          <div class="drops-progress-fill" style="width: ${progress}%;"></div>
        </div>
        <div class="drops-progress-text">
          ${remaining} ${tr('drops_remaining', 'drops left')}
        </div>
      </div>
    `;
  } else {
    nextSection.innerHTML = `
      <div class="drops-max-level">
        <span data-lucide="trophy" style="width:48px;height:48px;color:#f5a623;"></span>
        <h3>${tr('drops_max_level', 'You unlocked everything!')}</h3>
        <p>${tr('drops_max_desc', 'Amazing job! You have collected all items.')}</p>
      </div>
    `;
  }

  document.getElementById('drops-back-btn')?.addEventListener('click', () => {
    if (typeof renderProfile === 'function') {
      renderProfile();
    }
  });

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

window.renderDropsPage = renderDropsPage;
window.getDropsCount = getDropsCount;

console.log("✅ Drops (Sea Collection) loaded successfully!");
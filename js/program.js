// ========================================
// MY LIFE HUB - PROGRAM (Learning Only) v2.4
// (Removed: Learning field + Star Rating)
// (Kept: Timer + Difficulty + Steps + Sessions)
// (Gboard Fix: type="search" for resource inputs)
// ========================================

const PROGRAM_STORAGE_KEY = "myLifeHub_programs";

// ========================================
// دوال التخزين الأساسية
// ========================================

function getAllPrograms() {
  try {
    const raw = localStorage.getItem(PROGRAM_STORAGE_KEY);
    if (!raw) return [];
    const programs = JSON.parse(raw);
    return Array.isArray(programs) ? programs : [];
  } catch (error) {
    console.error("Error loading programs:", error);
    return [];
  }
}

/**
 * ✅ نسخة من البرامج (للاستخدام عند التعديل)
 */
function getProgramsCopy() {
  if (typeof deepClone === 'function') {
    return deepClone(getAllPrograms());
  }
  try {
    return JSON.parse(JSON.stringify(getAllPrograms()));
  } catch (e) {
    console.warn('getProgramsCopy failed:', e);
    return getAllPrograms();
  }
}

/**
 * ✅ حفظ آمن مع معالجة QuotaExceededError
 */
function saveAllPrograms(programs) {
  if (!Array.isArray(programs)) {
    console.error("saveAllPrograms: programs must be an array");
    return false;
  }

  try {
    localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(programs));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('⚠️ localStorage quota exceeded for programs');
      if (typeof showToast === 'function') {
        showToast(
          '⚠️ ' + (typeof t === 'function'
            ? t('storage_full', 'Storage is full. Please delete some programs.')
            : 'Storage is full. Please delete some programs.'),
          'warning',
          5000
        );
      }
    } else {
      console.error("Error saving programs:", error);
    }
    return false;
  }
}

function getProgram(programId) {
  const programs = getAllPrograms();
  return programs.find(p => p.id === programId) || null;
}

function updateProgram(updatedProgram) {
  if (!updatedProgram || !updatedProgram.id) return false;

  const programs = getProgramsCopy();
  const index = programs.findIndex(p => p.id === updatedProgram.id);
  if (index === -1) return false;

  programs[index] = updatedProgram;
  return saveAllPrograms(programs);
}

function deleteProgram(programId) {
  const programs = getProgramsCopy();
  const filtered = programs.filter(p => p.id !== programId);
  return saveAllPrograms(filtered);
}

// ========================================
// دوال مساعدة
// ========================================

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function tr(key, fallback) {
  return typeof t === 'function' ? t(key, fallback) : fallback;
}

// ========================================
// إنشاء برنامج جديد
// ========================================

function createProgram(name, description, goal, resources) {
  const programs = getProgramsCopy();
  const newProgram = {
    id: Date.now() + Math.random() * 1000,
    name: name.trim(),
    description: description.trim(),
    goal: goal.trim(),
    resources: resources || [],
    type: "Learning",
    status: "active",
    steps: [],
    sessions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  };
  programs.push(newProgram);
  saveAllPrograms(programs);
  return newProgram;
}

// ========================================
// دوال إدارة الموارد
// ========================================

function addResource(programId, name, url) {
  const program = getProgram(programId);
  if (!program) return null;
  if (!program.resources) program.resources = [];

  const newResource = {
    id: Date.now() + Math.random() * 1000,
    name: name.trim(),
    url: url.trim() || ""
  };

  program.resources.push(newResource);
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return newResource;
}

function deleteResource(programId, resourceId) {
  const program = getProgram(programId);
  if (!program || !program.resources) return false;

  program.resources = program.resources.filter(r => r.id !== resourceId);
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

// ========================================
// دوال إدارة الخطوات
// ========================================

function addStep(programId, stepName) {
  const program = getProgram(programId);
  if (!program) return null;
  if (!program.steps) program.steps = [];

  const newStep = {
    id: Date.now() + Math.random() * 1000,
    name: stepName.trim(),
    completed: false,
    completedAt: null,
    duration: null,
    difficulty: null
  };

  program.steps.push(newStep);
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return newStep;
}

function deleteStep(programId, stepId) {
  const program = getProgram(programId);
  if (!program || !program.steps) return false;

  program.steps = program.steps.filter(s => s.id !== stepId);
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function reorderSteps(programId, stepIds) {
  const program = getProgram(programId);
  if (!program || !program.steps) return false;

  const newSteps = [];
  stepIds.forEach(id => {
    const step = program.steps.find(s => s.id === id);
    if (step) newSteps.push(step);
  });

  program.steps = newSteps;
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

/**
 * ✅ إكمال خطوة (بدون learning و rating)
 */
function completeStep(programId, stepId, duration, difficulty) {
  const program = getProgram(programId);
  if (!program || !program.steps) return false;

  const step = program.steps.find(s => s.id === stepId);
  if (!step) return false;

  if (!program.sessions) program.sessions = [];

  const session = {
    id: Date.now() + Math.random() * 1000,
    stepId: stepId,
    stepName: step.name,
    completedAt: new Date().toISOString(),
    duration: duration,
    difficulty: difficulty
  };

  program.sessions.push(session);

  step.completed = true;
  step.completedAt = new Date().toISOString();
  step.duration = duration;
  step.difficulty = difficulty;

  const allCompleted = program.steps.every(s => s.completed);
  if (allCompleted && program.steps.length > 0) {
    program.status = "completed";
    program.completedAt = new Date().toISOString();
  }

  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function getNextStep(program) {
  if (!program.steps) return null;
  return program.steps.find(s => !s.completed) || null;
}

function calculateProgress(program) {
  const total = program.steps ? program.steps.length : 0;
  const completed = program.steps ? program.steps.filter(s => s.completed).length : 0;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percentage };
}

function getProgramStats(program) {
  const progress = calculateProgress(program);
  const totalSessions = program.sessions ? program.sessions.length : 0;

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentSessions = program.sessions
    ? program.sessions.filter(s => new Date(s.completedAt) >= weekAgo)
    : [];

  return {
    totalSteps: progress.total,
    completedSteps: progress.completed,
    percentage: progress.percentage,
    totalSessions: totalSessions,
    recentSessions: recentSessions.length
  };
}

// ========================================
// عرض الصفحة الرئيسية
// ========================================

function renderProgramPage() {
  console.log("📌 renderProgramPage called");
  const app = document.getElementById("app");
  if (!app) {
    console.error("❌ app element not found");
    return;
  }

  app.replaceChildren();

  const programs = getAllPrograms();
  console.log("📌 Programs loaded:", programs.length);

  const activePrograms = programs.filter(p => p.status === "active");
  const completedPrograms = programs.filter(p => p.status !== "active");

  // ===== Container =====
  const container = document.createElement("div");
  container.id = "program-container";

  // ===== Header =====
  const header = document.createElement("div");
  header.className = "program-header";

  const titleArea = document.createElement("div");
  titleArea.className = "program-title-area";

  const titleRow = document.createElement("div");
  titleRow.style.cssText = "display: flex; align-items: center; gap: 12px;";

  const titleIcon = document.createElement("span");
  titleIcon.setAttribute("data-lucide", "graduation-cap");
  titleIcon.style.cssText = "width: 32px; height: 32px; color: var(--primary);";

  const title = document.createElement("h2");
  title.className = "program-main-title";
  title.style.margin = "0";
  title.textContent = tr('program', 'Learning Programs');

  titleRow.appendChild(titleIcon);
  titleRow.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "program-main-subtitle";
  subtitle.textContent = tr('program_subtitle', 'Create your learning programs and track your progress step by step');

  titleArea.appendChild(titleRow);
  titleArea.appendChild(subtitle);

  const addBtn = document.createElement("button");
  addBtn.className = "program-add-btn";
  addBtn.id = "program-add-btn";
  addBtn.type = "button";
  addBtn.innerHTML = `
    <span class="program-add-icon" data-lucide="plus" style="width: 20px; height: 20px;"></span>
    ${tr('add_program', 'New Program')}
  `;

  header.appendChild(titleArea);
  header.appendChild(addBtn);
  container.appendChild(header);

  // ===== Active Programs Grid =====
  const grid = document.createElement("div");
  grid.className = "program-grid";
  grid.id = "program-grid";

  if (activePrograms.length > 0) {
    const gridFragment = document.createDocumentFragment();
    activePrograms.forEach(p => {
      const cardHTML = createProgramCardHTML(p);
      const temp = document.createElement("div");
      temp.innerHTML = cardHTML;
      while (temp.firstChild) gridFragment.appendChild(temp.firstChild);
    });
    grid.appendChild(gridFragment);
  } else {
    const emptyHTML = `
      <div class="program-empty-state">
        <div class="program-empty-icon">
          <span data-lucide="graduation-cap" style="width: 32px; height: 32px; color: var(--primary);"></span>
        </div>
        <h3 class="program-empty-title">${tr('no_programs', 'No programs yet')}</h3>
        <p class="program-empty-desc">${tr('create_first_program', 'Create your first learning program')}</p>
      </div>
    `;
    const temp = document.createElement("div");
    temp.innerHTML = emptyHTML;
    while (temp.firstChild) grid.appendChild(temp.firstChild);
  }

  container.appendChild(grid);

  // ===== Completed Programs Section =====
  if (completedPrograms.length > 0) {
    const completedTitle = document.createElement("h3");
    completedTitle.className = "program-section-title";
    completedTitle.textContent = "✅ " + tr('completed_programs', 'Completed Programs');
    container.appendChild(completedTitle);

    const subgrid = document.createElement("div");
    subgrid.className = "program-section-subgrid";

    const subFragment = document.createDocumentFragment();
    completedPrograms.forEach(p => {
      const cardHTML = createCompletedCardHTML(p);
      const temp = document.createElement("div");
      temp.innerHTML = cardHTML;
      while (temp.firstChild) subFragment.appendChild(temp.firstChild);
    });
    subgrid.appendChild(subFragment);
    container.appendChild(subgrid);
  }

  app.appendChild(container);

  // ========================================
  // ✅ ربط الأحداث بـ Event Delegation
  // ========================================

  // 1. زر الإضافة
  addBtn.addEventListener("click", () => openProgramBuilder());

  // 2. Event Delegation لكل الأزرار داخل الـ container
  container.addEventListener("click", function(e) {
    const target = e.target.closest("button");
    if (!target) return;

    // ✅ زر المتابعة
    if (target.classList.contains("program-card-continue-btn")) {
      e.preventDefault();
      e.stopPropagation();
      const id = parseFloat(target.dataset.programId);
      if (id) openProgramDetail(id);
      return;
    }

    // ✅ زر الحذف
    if (target.classList.contains("program-card-delete-btn")) {
      e.preventDefault();
      e.stopPropagation();
      const id = parseFloat(target.dataset.programId);
      const program = getProgram(id);
      if (!program) return;

      deleteModal({
        itemName: program.name,
        itemType: 'program',
        onConfirm: () => {
          deleteProgram(id);
          renderProgramPage();
        }
      });
      return;
    }

    // ✅ زر العرض (للبرامج المكتملة)
    if (target.classList.contains("program-card-small-btn")) {
      e.preventDefault();
      e.stopPropagation();
      const id = parseFloat(target.dataset.programId);
      if (id) openProgramDetail(id);
      return;
    }
  });
}

// ========================================
// إنشاء بطاقات البرامج
// ========================================

function createProgramCardHTML(program) {
  const stats = getProgramStats(program);
  const progress = stats.percentage;
  const nextStep = getNextStep(program);
  const nextStepName = nextStep ? escapeHtml(nextStep.name) : 
                       (stats.totalSteps > 0 && stats.completedSteps === stats.totalSteps ? 
                       "✅ " + tr('completed', 'Completed!') : tr('no_steps_added', 'No steps added'));

  return `
    <div class="program-card">
      <div class="program-card-header">
        <span class="program-card-icon" data-lucide="book-open" style="width: 28px; height: 28px; color: var(--primary);"></span>
        <span class="program-card-name">${escapeHtml(program.name)}</span>
      </div>
      <p class="program-card-description">${escapeHtml(program.description) || tr('no_description', 'No description')}</p>
      ${program.goal ? `<p class="program-card-goal"><span data-lucide="target" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span> ${escapeHtml(program.goal)}</p>` : ''}
      <div class="program-card-progress">
        <div class="program-card-progress-bar">
          <div class="program-card-progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="program-card-progress-text">
          <span>${progress}% ${tr('complete', 'Complete')}</span>
          <span>${stats.completedSteps}/${stats.totalSteps} ${tr('steps', 'Steps')}</span>
        </div>
      </div>
      <div class="program-card-stats">
        <span class="program-card-stat"><span data-lucide="arrow-right-circle" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span> ${tr('next', 'Next')}: ${nextStepName}</span>
        <span class="program-card-stat"><span data-lucide="clock" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span> ${stats.totalSessions} ${tr('sessions', 'Sessions')}</span>
      </div>
      <div class="program-card-actions">
        <button class="program-card-continue-btn" data-program-id="${program.id}" type="button">
          ${stats.totalSteps === 0 ? tr('add_steps', 'Add Steps →') : tr('continue', 'Continue →')}
        </button>
        <button class="program-card-delete-btn" data-program-id="${program.id}" type="button">
          <span data-lucide="trash-2" style="width: 16px; height: 16px; pointer-events: none;"></span>
        </button>
      </div>
    </div>
  `;
}

function createCompletedCardHTML(program) {
  const stats = getProgramStats(program);
  return `
    <div class="program-card-small">
      <div class="program-card-small-info">
        <div class="program-card-small-name">
          <span data-lucide="book-open" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; color: var(--primary);"></span>
          ${escapeHtml(program.name)}
        </div>
        <div class="program-card-small-progress">
          <span data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
          ${stats.totalSessions} ${tr('sessions', 'Sessions')} • 
          <span data-lucide="check-circle" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; margin-left: 4px;"></span>
          ${stats.completedSteps}/${stats.totalSteps} ${tr('steps', 'Steps')}
        </div>
      </div>
      <button class="program-card-small-btn" data-program-id="${program.id}" type="button">
        <span data-lucide="eye" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>
        ${tr('view', 'View')}
      </button>
    </div>
  `;
}

// ========================================
// Program Builder Modal
// ========================================

function openProgramBuilder() {
  let tempResources = [];

  const modal = createModal({
    id: 'program-builder-modal',
    title: '<span data-lucide="graduation-cap"></span> ' + tr('create_learning_program', 'Create Learning Program'),
    size: 'medium'
  });

  const nameField = createModalField({
    id: 'program-builder-name',
    label: tr('program_name', 'Program Name') + ' *',
    type: 'text',
    placeholder: tr('program_name_placeholder', 'e.g. Read a Book'),
    required: true
  });
  modal.body.appendChild(nameField.field);

    if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(nameField.input, 'text');
  }

  const descField = createModalField({
    id: 'program-builder-desc',
    label: tr('description', 'Description'),
    type: 'textarea',
    rows: 3,
    placeholder: tr('describe_program', 'Describe your program...')
  });
  modal.body.appendChild(descField.field);

    if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(descField.input, 'content');
  }

  const goalField = createModalField({
    id: 'program-builder-goal',
    label: tr('goal', 'Goal'),
    type: 'text',
    placeholder: tr('goal_placeholder', 'e.g. Understand the fundamentals...')
  });
  modal.body.appendChild(goalField.field);

    if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(goalField.input, 'text');
  }

  // ===== Resources Section =====
  const resourcesLabel = document.createElement("label");
  resourcesLabel.className = "modal-base-label";
  resourcesLabel.textContent = tr('resources_optional', 'Resources (optional)');
  modal.body.appendChild(resourcesLabel);

  const resourceRow = document.createElement("div");
  resourceRow.style.cssText = "display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;";

  // ✅ Gboard Fix: type="search"
  const resourceNameInput = document.createElement("input");
  resourceNameInput.type = "search";
  resourceNameInput.className = "modal-base-input";
  resourceNameInput.placeholder = tr('resource_name', 'Resource name...');
  resourceNameInput.style.cssText = "flex: 1; min-width: 120px;";
  resourceNameInput.setAttribute('autocomplete', 'off');
  resourceNameInput.setAttribute('data-lpignore', 'true');
  resourceNameInput.setAttribute('data-1p-ignore', 'true');
  resourceNameInput.setAttribute('data-bwignore', 'true');
  resourceNameInput.setAttribute('spellcheck', 'false');

  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(resourceNameInput, 'text');
  }

  // ✅ Gboard Fix: type="search"
  const resourceUrlInput = document.createElement("input");
  resourceUrlInput.type = "search";
  resourceUrlInput.className = "modal-base-input";
  resourceUrlInput.placeholder = tr('url_optional', 'URL (optional)');
  resourceUrlInput.style.cssText = "flex: 1.5; min-width: 150px;";
  resourceUrlInput.setAttribute('autocomplete', 'off');
  resourceUrlInput.setAttribute('data-lpignore', 'true');
  resourceUrlInput.setAttribute('data-1p-ignore', 'true');
  resourceUrlInput.setAttribute('data-bwignore', 'true');
  resourceUrlInput.setAttribute('spellcheck', 'false');

  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(resourceUrlInput, 'url');
  }

  const addResourceBtn = document.createElement("button");
  addResourceBtn.type = "button";
  addResourceBtn.className = "modal-base-btn modal-base-btn-secondary";
  addResourceBtn.style.cssText = "padding: 12px 16px; flex: 0 0 auto;";
  addResourceBtn.innerHTML = '<span data-lucide="plus" style="width: 16px; height: 16px;"></span> ' + tr('add', 'Add');

  resourceRow.appendChild(resourceNameInput);
  resourceRow.appendChild(resourceUrlInput);
  resourceRow.appendChild(addResourceBtn);
  modal.body.appendChild(resourceRow);

  const resourcesList = document.createElement("div");
  resourcesList.style.cssText = "display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px;";
  modal.body.appendChild(resourcesList);

  function renderTempResources() {
    resourcesList.replaceChildren();

    tempResources.forEach((r, i) => {
      const div = document.createElement("div");
      div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: 6px; font-size: 13px;";

      const text = document.createElement("span");
      text.textContent = r.name + (r.url ? " 🔗" : "");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = '<span data-lucide="x" style="width: 14px; height: 14px;"></span>';
      btn.style.cssText = "background: none; border: none; color: var(--danger); cursor: pointer; padding: 0 4px;";
      btn.onclick = () => {
        tempResources.splice(i, 1);
        renderTempResources();
      };

      div.appendChild(text);
      div.appendChild(btn);
      resourcesList.appendChild(div);
    });

    if (typeof debouncedLucide === 'function') debouncedLucide(30);
  }

  addResourceBtn.onclick = () => {
    const name = resourceNameInput.value.trim();
    const url = resourceUrlInput.value.trim();
    if (name) {
      tempResources.push({ name, url });
      resourceNameInput.value = "";
      resourceUrlInput.value = "";
      renderTempResources();
    }
  };

  // ===== Actions =====
  const actions = createModalActions([
    {
      label: tr('cancel', 'Cancel'),
      type: 'secondary',
      onClick: () => modal.close()
    },
    {
      label: '<span data-lucide="check"></span> ' + tr('create_program', 'Create Program'),
      type: 'primary',
      onClick: () => {
        const name = nameField.input.value.trim();
        const desc = descField.input.value.trim();
        const goal = goalField.input.value.trim();

        if (!name) {
          nameField.input.classList.add("modal-base-input-error");
          nameField.input.focus();
          setTimeout(() => nameField.input.classList.remove("modal-base-input-error"), 500);
          return;
        }

        const program = createProgram(name, desc, goal, tempResources);
        modal.close();
        openProgramDetail(program.id);
      }
    }
  ]);
  modal.body.appendChild(actions);
}

// ========================================
// Program Detail
// ========================================

let currentProgramId = null;
let currentTab = "overview";

function openProgramDetail(programId) {
  console.log("📌 openProgramDetail called with id:", programId);
  const program = getProgram(programId);
  if (!program) {
    console.error("❌ Program not found:", programId);
    renderProgramPage();
    return;
  }

  currentProgramId = programId;
  currentTab = "overview";
  renderProgramDetail(program);
}

function renderProgramDetail(program) {
  console.log("📌 renderProgramDetail called for:", program.name);
  const app = document.getElementById("app");
  if (!app) return;

  app.replaceChildren();

  const stats = getProgramStats(program);
  const progress = stats.percentage;

  // ===== Container =====
  const container = document.createElement("div");
  container.className = "program-detail-container";

  // ===== Header =====
  const header = document.createElement("div");
  header.className = "program-detail-header";

  const titleArea = document.createElement("div");
  titleArea.className = "program-detail-title-area";

  const detailIcon = document.createElement("span");
  detailIcon.className = "program-detail-icon";
  detailIcon.setAttribute("data-lucide", "book-open");
  detailIcon.style.cssText = "width: 32px; height: 32px; color: var(--primary);";

  const titleWrapper = document.createElement("div");

  const detailName = document.createElement("h2");
  detailName.className = "program-detail-name";
  detailName.textContent = program.name;

  const detailType = document.createElement("span");
  detailType.className = "program-detail-type";
  detailType.textContent = program.status;

  titleWrapper.appendChild(detailName);
  titleWrapper.appendChild(detailType);

  if (program.goal) {
    const goalSpan = document.createElement("span");
    goalSpan.className = "program-detail-goal";
    goalSpan.innerHTML = '<span data-lucide="target" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span> ' + escapeHtml(program.goal);
    titleWrapper.appendChild(goalSpan);
  }

  titleArea.appendChild(detailIcon);
  titleArea.appendChild(titleWrapper);

  const headerActions = document.createElement("div");
  headerActions.className = "program-detail-actions";

  const backBtn = document.createElement("button");
  backBtn.className = "program-detail-back-btn";
  backBtn.id = "program-detail-back";
  backBtn.type = "button";
  backBtn.innerHTML = '<span data-lucide="arrow-left" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>' + tr('back', 'Back');

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "program-detail-delete-btn";
  deleteBtn.id = "program-detail-delete";
  deleteBtn.type = "button";
  deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>' + tr('delete', 'Delete');

  headerActions.appendChild(backBtn);
  headerActions.appendChild(deleteBtn);

  header.appendChild(titleArea);
  header.appendChild(headerActions);
  container.appendChild(header);

  // ===== Progress Bar =====
  const progressBox = document.createElement("div");
  progressBox.style.cssText = "margin-bottom: 20px; background: var(--bg-card); padding: 16px 20px; border-radius: 12px; border: 1px solid var(--border-color);";

  const progressHeader = document.createElement("div");
  progressHeader.style.cssText = "display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); margin-bottom: 6px;";
  progressHeader.innerHTML = `
    <span>${tr('progress', 'Progress')}</span>
    <span>${progress}% (${stats.completedSteps}/${stats.totalSteps} ${tr('steps', 'steps')})</span>
  `;

  const progressBar = document.createElement("div");
  progressBar.style.cssText = "width: 100%; height: 8px; background: var(--border-light); border-radius: 10px; overflow: hidden;";

  const progressFill = document.createElement("div");
  progressFill.style.cssText = `height: 100%; width: ${progress}%; background: var(--primary-gradient); border-radius: 10px; transition: width 0.6s ease;`;

  progressBar.appendChild(progressFill);
  progressBox.appendChild(progressHeader);
  progressBox.appendChild(progressBar);
  container.appendChild(progressBox);

  // ===== Tabs =====
  const tabs = document.createElement("div");
  tabs.className = "program-detail-tabs";

  const tabDefs = [
    { id: 'overview', icon: 'info', label: tr('overview', 'Overview') },
    { id: 'steps', icon: 'list', label: tr('steps', 'Steps') },
    { id: 'resources', icon: 'link', label: tr('resources', 'Resources') },
    { id: 'sessions', icon: 'clock', label: tr('sessions', 'Sessions') }
  ];

  tabDefs.forEach(tab => {
    const btn = document.createElement("button");
    btn.className = "program-detail-tab" + (currentTab === tab.id ? ' active' : '');
    btn.dataset.tab = tab.id;
    btn.type = "button";
    btn.innerHTML = `
      <span data-lucide="${tab.icon}" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>
      ${tab.label}
    `;
    tabs.appendChild(btn);
  });

  container.appendChild(tabs);

  // ===== Tab Content =====
  const content = document.createElement("div");
  content.id = "program-tab-content";
  container.appendChild(content);

  app.appendChild(container);

  // ========================================
  // ✅ ربط الأحداث
  // ========================================

  // ✅ زر الرجوع
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    renderProgramPage();
  });

  // ✅ زر الحذف
  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteModal({
      itemName: program.name,
      itemType: 'program',
      onConfirm: () => {
        deleteProgram(program.id);
        renderProgramPage();
      }
    });
  });

  // ✅ Event Delegation للـ Tabs
  tabs.addEventListener("click", function(e) {
    const tabBtn = e.target.closest(".program-detail-tab");
    if (!tabBtn) return;

    e.preventDefault();
    e.stopPropagation();

    currentTab = tabBtn.dataset.tab;
    renderProgramDetail(program);
  });

  // ===== Render Active Tab =====
  switch (currentTab) {
    case "overview": renderOverview(content, program); break;
    case "steps": renderSteps(content, program); break;
    case "resources": renderResources(content, program); break;
    case "sessions": renderSessions(content, program); break;
  }
}

// ========================================
// Overview Tab
// ========================================

function renderOverview(container, program) {
  const stats = getProgramStats(program);
  const nextStep = getNextStep(program);

  const overview = document.createElement("div");
  overview.className = "program-overview";

  const grid = document.createElement("div");
  grid.className = "program-overview-grid";

  const items = [
    { icon: 'file-text', label: tr('description', 'Description'), value: escapeHtml(program.description) || tr('no_description', 'No description') },
    { icon: 'target', label: tr('goal', 'Goal'), value: escapeHtml(program.goal) || tr('not_set', 'Not set') },
    { icon: 'activity', label: tr('status', 'Status'), value: program.status },
    { icon: 'trending-up', label: tr('progress', 'Progress'), value: `${stats.percentage}%` },
    { icon: 'list', label: tr('steps', 'Steps'), value: `${stats.completedSteps}/${stats.totalSteps}` },
    { icon: 'clock', label: tr('sessions', 'Sessions'), value: stats.totalSessions },
    { icon: 'link', label: tr('resources', 'Resources'), value: program.resources ? program.resources.length : 0 },
    { icon: 'arrow-right-circle', label: tr('next_step', 'Next Step'), value: nextStep ? escapeHtml(nextStep.name) : (stats.totalSteps > 0 ? "✅ " + tr('all_completed', 'All completed!') : tr('no_steps_added', 'No steps added')) },
    { icon: 'calendar', label: tr('created', 'Created'), value: formatDate(program.createdAt) }
  ];

  if (program.completedAt) {
    items.push({ icon: 'check-circle', label: tr('completed', 'Completed'), value: formatDate(program.completedAt) });
  }

  items.forEach(item => {
    const itemEl = document.createElement("div");
    itemEl.className = "program-overview-item";
    itemEl.innerHTML = `
      <span class="program-overview-label">
        <span data-lucide="${item.icon}" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>
        ${item.label}
      </span>
      <span class="program-overview-value">${item.value}</span>
    `;
    grid.appendChild(itemEl);
  });

  overview.appendChild(grid);

  // ===== Start Session Button =====
  if (program.status === "active") {
    const startBtn = document.createElement("button");
    startBtn.className = "program-card-continue-btn";
    startBtn.id = "program-start-session";
    startBtn.type = "button";
    startBtn.style.cssText = "width: 100%; margin-top: 12px;";

    const next = getNextStep(program);
    let label = '';
    if (next) {
      label = tr('start_session', 'Start Session') + ': ' + escapeHtml(next.name) + ' →';
    } else if (stats.totalSteps === 0) {
      label = tr('add_steps_first', 'Add Steps First →');
    } else {
      label = '✅ ' + tr('all_steps_completed', 'All Steps Completed!');
    }

    startBtn.innerHTML = `<span data-lucide="play" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>${label}`;
    overview.appendChild(startBtn);

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      startSession(program.id);
    });
  }

  if (program.status === "completed") {
    const completedBadge = document.createElement("div");
    completedBadge.style.cssText = "text-align: center; padding: 12px; background: #4caf84; color: white; border-radius: 8px; margin-top: 12px;";
    completedBadge.innerHTML = `
      <span data-lucide="check-circle" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>
      ${tr('program_completed', 'Program Completed! All')} ${stats.totalSteps} ${tr('steps_done', 'steps done!')}
    `;
    overview.appendChild(completedBadge);
  }

  container.replaceChildren(overview);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// Steps Tab
// ========================================

function renderSteps(container, program) {
  const wrapper = document.createElement("div");
  wrapper.className = "program-structure";
  wrapper.id = "program-steps-container";

  if (!program.steps || program.steps.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.style.cssText = "text-align: center; padding: 30px; color: var(--text-muted);";
    emptyMsg.innerHTML = `<p>${tr('no_steps_added_yet', 'No steps added yet. Add your first step below!')}</p>`;
    wrapper.appendChild(emptyMsg);
  } else {
    program.steps.forEach(step => {
      const phaseDiv = document.createElement("div");
      phaseDiv.className = "program-phase";
      phaseDiv.dataset.stepId = step.id;
      phaseDiv.draggable = true;

      // ===== Header =====
      const headerDiv = document.createElement("div");
      headerDiv.className = "program-phase-header";

      const nameSpan = document.createElement("span");
      nameSpan.className = "program-phase-name";
      nameSpan.innerHTML = (step.completed ? '<span data-lucide="check-circle" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; color: #4caf84; pointer-events: none;"></span>' : '<span data-lucide="circle" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>') + ' ' + escapeHtml(step.name);
      headerDiv.appendChild(nameSpan);

      if (step.completed) {
        const dateSpan = document.createElement("span");
        dateSpan.style.cssText = "font-size: 12px; color: var(--text-muted);";
        dateSpan.innerHTML = '<span data-lucide="calendar" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>' + formatDate(step.completedAt);
        headerDiv.appendChild(dateSpan);

        if (step.difficulty) {
          const diffSpan = document.createElement("span");
          diffSpan.style.cssText = "font-size: 12px; color: var(--text-muted);";
          diffSpan.textContent = tr(step.difficulty.toLowerCase(), step.difficulty);
          headerDiv.appendChild(diffSpan);
        }
      }

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "program-phase-actions";

      if (!step.completed) {
        const editBtn = document.createElement("button");
        editBtn.className = "program-phase-btn program-edit-step-btn";
        editBtn.type = "button";
        editBtn.innerHTML = '<span data-lucide="pencil" style="width: 16px; height: 16px; pointer-events: none;"></span>';
        editBtn.dataset.stepId = step.id;
        actionsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "program-phase-btn program-phase-btn-danger program-delete-step-btn";
        deleteBtn.type = "button";
        deleteBtn.innerHTML = '<span data-lucide="x" style="width: 16px; height: 16px; pointer-events: none;"></span>';
        deleteBtn.dataset.stepId = step.id;
        actionsDiv.appendChild(deleteBtn);
      }

      headerDiv.appendChild(actionsDiv);
      phaseDiv.appendChild(headerDiv);

      // ===== Duration =====
      if (step.completed && step.duration) {
        const durationDiv = document.createElement("div");
        durationDiv.style.cssText = "font-size: 12px; color: var(--text-muted); padding: 2px 0 0 24px;";
        durationDiv.innerHTML = '<span data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>' + step.duration + ' min';
        phaseDiv.appendChild(durationDiv);
      }

      wrapper.appendChild(phaseDiv);
    });
  }

  // ===== Add Step Button =====
  const addBtn = document.createElement("button");
  addBtn.className = "program-add-phase-btn";
  addBtn.id = "program-add-step";
  addBtn.type = "button";
  addBtn.style.marginTop = "12px";
  addBtn.innerHTML = '<span data-lucide="plus" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>' + tr('add_step', 'Add Step');
  wrapper.appendChild(addBtn);

  container.replaceChildren(wrapper);

  // ========================================
  // ✅ Event Delegation للخطوات
  // ========================================

  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    promptModal({
      title: tr('add_step', 'Add Step'),
      message: tr('enter_step_name', 'Enter a descriptive name for this step'),
      label: tr('step_name', 'Step Name'),
      placeholder: tr('step_name_placeholder', 'e.g. Read Chapter 1'),
      validate: (v) => v.length > 0 && v.length <= 100,
      errorMessage: tr('invalid_step_name', 'Step name must be 1-100 characters'),
      confirmLabel: tr('add', 'Add'),
      cancelLabel: tr('cancel', 'Cancel'),
            inputMode: 'text',
      onConfirm: (name) => {
        const result = addStep(program.id, name);
        if (result) {
          const updated = getProgram(program.id);
          if (updated) renderProgramDetail(updated);
        }
      }
    });
  });

  wrapper.addEventListener("click", function(e) {
    const target = e.target.closest("button");
    if (!target) return;

    // ✅ زر تعديل الخطوة
    if (target.classList.contains("program-edit-step-btn")) {
      e.preventDefault();
      e.stopPropagation();

      const stepId = parseFloat(target.dataset.stepId);
      const p = getProgram(program.id);
      if (!p) return;
      const step = p.steps.find(s => s.id === stepId);
      if (!step) return;

      promptModal({
        title: tr('edit_step', 'Edit Step'),
        message: tr('edit_step_name', 'Edit the step name'),
        label: tr('step_name', 'Step Name'),
        defaultValue: step.name,
        validate: (v) => v.length > 0 && v.length <= 100,
        errorMessage: tr('invalid_step_name', 'Step name must be 1-100 characters'),
        confirmLabel: tr('update', 'Update'),
        cancelLabel: tr('cancel', 'Cancel'),
        onConfirm: (newName) => {
          step.name = newName;
          p.updatedAt = new Date().toISOString();
          updateProgram(p);
          renderProgramDetail(p);
        }
      });
      return;
    }

    // ✅ زر حذف الخطوة
    if (target.classList.contains("program-delete-step-btn")) {
      e.preventDefault();
      e.stopPropagation();

      const stepId = parseFloat(target.dataset.stepId);
      const step = program.steps.find(s => s.id === stepId);
      if (!step) return;

      deleteModal({
        itemName: step.name,
        itemType: 'program',
        onConfirm: () => {
          deleteStep(program.id, stepId);
          const updated = getProgram(program.id);
          if (updated) renderProgramDetail(updated);
        }
      });
      return;
    }
  });

  setupStepDragAndDrop(program.id);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// Resources Tab
// ========================================

function renderResources(container, program) {
  const overview = document.createElement("div");
  overview.className = "program-overview";

  if (!program.resources || program.resources.length === 0) {
    const empty = document.createElement("p");
    empty.style.cssText = "text-align: center; color: var(--text-muted); padding: 20px 0;";
    empty.textContent = tr('no_resources', 'No resources added.');
    overview.appendChild(empty);
  } else {
    program.resources.forEach(res => {
      const resDiv = document.createElement("div");
      resDiv.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 8px; background: var(--bg-surface);";

      const infoDiv = document.createElement("div");
      infoDiv.innerHTML = `
        <span style="font-weight: 500; color: var(--text-primary);">
          <span data-lucide="link" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; color: var(--primary); pointer-events: none;"></span>
          ${escapeHtml(res.name)}
        </span>
        ${res.url ? `<a href="${escapeHtml(res.url)}" target="_blank" rel="noopener noreferrer" style="margin-left: 12px; color: var(--primary); text-decoration: none; font-size: 13px;"><span data-lucide="external-link" style="width: 14px; height: 14px; vertical-align: middle; pointer-events: none;"></span> ${tr('open', 'Open')}</a>` : ''}
      `;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "program-phase-btn program-phase-btn-danger program-delete-resource-btn";
      deleteBtn.type = "button";
      deleteBtn.dataset.resourceId = res.id;
      deleteBtn.style.cssText = "padding: 4px 10px;";
      deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width: 14px; height: 14px; pointer-events: none;"></span>';

      resDiv.appendChild(infoDiv);
      resDiv.appendChild(deleteBtn);
      overview.appendChild(resDiv);
    });
  }

  // ===== Add Resource Form =====
  const addForm = document.createElement("div");
  addForm.style.cssText = "margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-light);";

  const addRow = document.createElement("div");
  addRow.style.cssText = "display: flex; gap: 8px; flex-wrap: wrap;";

  // ✅ Gboard Fix: type="search"
  const nameInput = document.createElement("input");
  nameInput.type = "search";
  nameInput.id = "program-add-resource-name";
  nameInput.placeholder = tr('resource_name', 'Resource name...');
  nameInput.style.cssText = "flex: 1; min-width: 150px; padding: 8px 12px; border: 1px solid var(--border-input); border-radius: 6px; background: var(--bg-input); color: var(--text-primary);";
  nameInput.setAttribute('autocomplete', 'off');
  nameInput.setAttribute('data-lpignore', 'true');
  nameInput.setAttribute('data-1p-ignore', 'true');
  nameInput.setAttribute('data-bwignore', 'true');
  nameInput.setAttribute('spellcheck', 'false');

  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(nameInput, 'text');
  }

  // ✅ Gboard Fix: type="search"
  const urlInput = document.createElement("input");
  urlInput.type = "search";
  urlInput.id = "program-add-resource-url";
  urlInput.placeholder = tr('url_optional', 'URL (optional)');
  urlInput.style.cssText = "flex: 1.5; min-width: 150px; padding: 8px 12px; border: 1px solid var(--border-input); border-radius: 6px; background: var(--bg-input); color: var(--text-primary);";
  urlInput.setAttribute('autocomplete', 'off');
  urlInput.setAttribute('data-lpignore', 'true');
  urlInput.setAttribute('data-1p-ignore', 'true');
  urlInput.setAttribute('data-bwignore', 'true');
  urlInput.setAttribute('spellcheck', 'false');

  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(urlInput, 'url');
  }

  const addBtn = document.createElement("button");
  addBtn.className = "program-card-continue-btn program-add-resource-btn";
  addBtn.id = "program-add-resource-btn";
  addBtn.type = "button";
  addBtn.style.cssText = "padding: 8px 20px;";
  addBtn.innerHTML = '<span data-lucide="plus" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>' + tr('add_resource', 'Add Resource');

  addRow.appendChild(nameInput);
  addRow.appendChild(urlInput);
  addRow.appendChild(addBtn);
  addForm.appendChild(addRow);
  overview.appendChild(addForm);

  container.replaceChildren(overview);

  // ========================================
  // ✅ Event Delegation للموارد
  // ========================================

  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    if (name) {
      addResource(program.id, name, url);
      nameInput.value = "";
      urlInput.value = "";
      const updated = getProgram(program.id);
      if (updated) renderProgramDetail(updated);
    }
  });

  overview.addEventListener("click", function(e) {
    const target = e.target.closest(".program-delete-resource-btn");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const resourceId = parseFloat(target.dataset.resourceId);
    const res = program.resources.find(r => r.id === resourceId);
    if (!res) return;

    deleteModal({
      itemName: res.name,
      itemType: 'program',
      onConfirm: () => {
        deleteResource(program.id, resourceId);
        const updated = getProgram(program.id);
        if (updated) renderProgramDetail(updated);
      }
    });
  });

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// Sessions Tab
// ========================================

function renderSessions(container, program) {
  const sessions = program.sessions || [];
  const overview = document.createElement("div");
  overview.className = "program-overview";

  if (sessions.length === 0) {
    const empty = document.createElement("p");
    empty.style.cssText = "text-align: center; color: var(--text-muted); padding: 20px 0;";
    empty.textContent = tr('no_sessions', 'No sessions completed yet. Start your first session!');
    overview.appendChild(empty);

    if (program.status === "active" && program.steps && program.steps.length > 0) {
      const nextStep = getNextStep(program);
      if (nextStep) {
        const startBtn = document.createElement("button");
        startBtn.className = "program-card-continue-btn program-start-session-btn";
        startBtn.type = "button";
        startBtn.style.cssText = "width: 100%;";
        startBtn.innerHTML = `<span data-lucide="play" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>${tr('start_session', 'Start Session')} →`;
        overview.appendChild(startBtn);
      }
    }

    container.replaceChildren(overview);

    overview.addEventListener("click", function(e) {
      const target = e.target.closest(".program-start-session-btn");
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      startSession(program.id);
    });

    if (typeof debouncedLucide === 'function') debouncedLucide(50);
    return;
  }

  const sortedSessions = [...sessions].reverse();

  // ===== Header =====
  const header = document.createElement("div");
  header.style.cssText = "margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;";

  const countSpan = document.createElement("span");
  countSpan.style.cssText = "font-weight: 600; color: var(--text-primary);";
  countSpan.innerHTML = `
    <span data-lucide="clock" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 4px; color: var(--primary); pointer-events: none;"></span>
    ${sessions.length} ${tr('sessions_completed', 'Sessions Completed')}
  `;
  header.appendChild(countSpan);

  if (program.status === "active" && getNextStep(program)) {
    const startBtn = document.createElement("button");
    startBtn.className = "program-card-continue-btn program-start-session-btn";
    startBtn.type = "button";
    startBtn.innerHTML = `<span data-lucide="play" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span>${tr('start_session', 'Start Session')} →`;
    header.appendChild(startBtn);
  }

  overview.appendChild(header);

  // ===== Sessions List =====
  sortedSessions.forEach(session => {
    const difficultyEmoji = session.difficulty === "Hard" ? "🔴" : session.difficulty === "Medium" ? "🟡" : "🟢";
    const difficultyLabel = tr(session.difficulty?.toLowerCase() || 'medium', session.difficulty || 'Medium');

    const sessionDiv = document.createElement("div");
    sessionDiv.style.cssText = "padding: 12px 16px; border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 8px; background: var(--bg-surface);";

    sessionDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div>
          <span style="font-weight: 600; color: var(--text-primary);">
            <span data-lucide="book-open" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; color: var(--primary); pointer-events: none;"></span>
            ${escapeHtml(session.stepName)}
          </span>
        </div>
        <div style="display: flex; gap: 12px; font-size: 13px; color: var(--text-muted);">
          <span>${difficultyEmoji} ${difficultyLabel}</span>
          ${session.duration ? `<span><span data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 2px; pointer-events: none;"></span>${session.duration} min</span>` : ''}
        </div>
      </div>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
        <span data-lucide="calendar" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 2px; pointer-events: none;"></span>
        ${formatDate(session.completedAt)}
      </div>
    `;

    overview.appendChild(sessionDiv);
  });

  container.replaceChildren(overview);

  overview.addEventListener("click", function(e) {
    const target = e.target.closest(".program-start-session-btn");
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    startSession(program.id);
  });

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// Drag & Drop
// ========================================

function setupStepDragAndDrop(programId) {
  const container = document.getElementById("program-steps-container");
  if (!container) return;

  let dragSrcIndex = null;
  const steps = document.querySelectorAll(".program-phase");

  steps.forEach(step => {
    step.addEventListener("dragstart", function(e) {
      dragSrcIndex = this;
      this.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", this.dataset.stepId);
    });

    step.addEventListener("dragend", function() {
      this.classList.remove("dragging");
      document.querySelectorAll(".program-phase").forEach(s => s.classList.remove("drag-over"));
    });

    step.addEventListener("dragover", function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (this !== dragSrcIndex) this.classList.add("drag-over");
    });

    step.addEventListener("dragleave", function() {
      this.classList.remove("drag-over");
    });

    step.addEventListener("drop", function(e) {
      e.preventDefault();
      this.classList.remove("drag-over");

      const draggedId = parseFloat(e.dataTransfer.getData("text/plain"));
      const targetId = parseFloat(this.dataset.stepId);
      if (draggedId === targetId) return;

      const program = getProgram(programId);
      if (!program || !program.steps) return;

      const stepIds = program.steps.map(s => s.id);
      const draggedIndex = stepIds.indexOf(draggedId);
      const targetIndex = stepIds.indexOf(targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      stepIds.splice(draggedIndex, 1);
      stepIds.splice(targetIndex, 0, draggedId);

      reorderSteps(programId, stepIds);
      const updated = getProgram(programId);
      if (updated) renderProgramDetail(updated);
    });
  });
}

// ========================================
// Start Session with Timer
// ========================================

function startSession(programId) {
  const program = getProgram(programId);
  if (!program) return;

  if (program.status === "completed") {
    infoModal({
      title: tr('program_completed', 'Program Completed'),
      message: '🎉 ' + tr('all_steps_completed', 'All steps are completed! This program is finished.'),
      icon: 'check-circle',
      iconType: 'success',
      confirmLabel: tr('close', 'OK')
    });
    return;
  }

  const nextStep = getNextStep(program);
  if (!nextStep) {
    if (!program.steps || program.steps.length === 0) {
      infoModal({
        title: tr('no_steps', 'No Steps'),
        message: tr('add_steps_first', 'You need to add steps first! Go to the Steps tab.'),
        icon: 'alert-triangle',
        iconType: 'warning',
        confirmLabel: tr('close', 'OK')
      });
    } else {
      infoModal({
        title: tr('program_completed', 'Program Completed'),
        message: '🎉 ' + tr('all_steps_completed', 'All steps are completed!'),
        icon: 'check-circle',
        iconType: 'success',
        confirmLabel: tr('close', 'OK')
      });
    }
    return;
  }

  openSessionModal(programId, nextStep.id, nextStep.name);
}

/**
 * ✅ نافذة الجلسة (بدون Learning + Rating)
 */
function openSessionModal(programId, stepId, stepName) {
  let timerSeconds = 0;
  let timerInterval = null;
  let isTimerRunning = false;
  let selectedDifficulty = "Medium";

  const modal = createModal({
    id: 'session-modal',
    title: '<span data-lucide="clock"></span> ' + tr('session', 'Session'),
    size: 'medium',
    onClose: () => {
      if (timerInterval) clearInterval(timerInterval);
    }
  });

  const stepTitle = document.createElement("p");
  stepTitle.style.cssText = "font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; text-align: center;";
  stepTitle.innerHTML = '<span data-lucide="book-open" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; color: var(--primary); pointer-events: none;"></span> ' + escapeHtml(stepName);
  modal.body.appendChild(stepTitle);

  // ===== Timer Box =====
  const timerBox = document.createElement("div");
  timerBox.style.cssText = "text-align: center; margin: 16px 0;";
  timerBox.innerHTML = `
    <div style="font-size: 48px; font-weight: 700; font-family: monospace; color: var(--primary);" id="session-timer-display">00:00</div>
    <div style="display: flex; gap: 8px; justify-content: center; margin-top: 8px; flex-wrap: wrap;">
      <button type="button" class="modal-base-btn modal-base-btn-primary" id="session-timer-start" style="padding: 8px 20px; font-size: 14px; flex: 0 0 auto;">
        <span data-lucide="play" style="width: 14px; height: 14px; pointer-events: none;"></span>
        ${tr('start', 'Start')}
      </button>
      <button type="button" class="modal-base-btn modal-base-btn-secondary" id="session-timer-pause" style="padding: 8px 20px; font-size: 14px; flex: 0 0 auto; display: none;">
        <span data-lucide="pause" style="width: 14px; height: 14px; pointer-events: none;"></span>
        ${tr('pause', 'Pause')}
      </button>
      <button type="button" class="modal-base-btn modal-base-btn-secondary" id="session-timer-reset" style="padding: 8px 20px; font-size: 14px; flex: 0 0 auto;">
        <span data-lucide="rotate-ccw" style="width: 14px; height: 14px; pointer-events: none;"></span>
        ${tr('reset', 'Reset')}
      </button>
    </div>
  `;
  modal.body.appendChild(timerBox);

  const hr = document.createElement("hr");
  hr.style.cssText = "border: none; border-top: 1px solid var(--border-light); margin: 16px 0;";
  modal.body.appendChild(hr);

  // ===== Difficulty Selection =====
  const diffLabel = document.createElement("label");
  diffLabel.className = "modal-base-label";
  diffLabel.innerHTML = '<span data-lucide="bar-chart" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; pointer-events: none;"></span> ' + tr('how_was_step', 'How was this step?');
  modal.body.appendChild(diffLabel);

  const diffGrid = document.createElement("div");
  diffGrid.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;";

  const diffOptions = [
    { value: "Medium", label: tr('medium', 'Medium') },
    { value: "Hard", label: tr('hard', 'Hard') },
    { value: "Easy", label: tr('easy', 'Easy') }
  ];

  diffOptions.forEach(function(opt) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-base-btn " + (opt.value === selectedDifficulty ? "modal-base-btn-primary" : "modal-base-btn-secondary");
    btn.style.cssText = "padding: 10px; font-size: 14px;";
    btn.textContent = opt.label;
    btn.addEventListener("click", function() {
      selectedDifficulty = opt.value;
      diffGrid.querySelectorAll("button").forEach(b => {
        b.className = "modal-base-btn modal-base-btn-secondary";
        b.style.cssText = "padding: 10px; font-size: 14px;";
      });
      btn.className = "modal-base-btn modal-base-btn-primary";
      btn.style.cssText = "padding: 10px; font-size: 14px;";
    });
    diffGrid.appendChild(btn);
  });
  modal.body.appendChild(diffGrid);

  // ===== Timer Functions =====
  const updateDisplay = () => {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    const display = document.getElementById("session-timer-display");
    if (display) display.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  };

  const startTimer = () => {
    if (isTimerRunning) return;
    isTimerRunning = true;
    document.getElementById("session-timer-start").style.display = "none";
    document.getElementById("session-timer-pause").style.display = "inline-flex";
    timerInterval = setInterval(() => { timerSeconds++; updateDisplay(); }, 1000);
  };

  const pauseTimer = () => {
    if (!isTimerRunning) return;
    isTimerRunning = false;
    document.getElementById("session-timer-start").style.display = "inline-flex";
    document.getElementById("session-timer-pause").style.display = "none";
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  };

  const resetTimer = () => {
    pauseTimer();
    timerSeconds = 0;
    updateDisplay();
  };

  document.getElementById("session-timer-start").onclick = startTimer;
  document.getElementById("session-timer-pause").onclick = pauseTimer;
  document.getElementById("session-timer-reset").onclick = resetTimer;

  // ===== Actions =====
  const actions = createModalActions([
    {
      label: tr('cancel', 'Cancel'),
      type: 'secondary',
      onClick: () => {
        if (timerInterval) clearInterval(timerInterval);
        modal.close();
      }
    },
    {
      label: '<span data-lucide="check-circle"></span> ' + tr('complete_step', 'Complete Step'),
      type: 'primary',
      onClick: () => {
        pauseTimer();
        const duration = Math.ceil(timerSeconds / 60);

        confirmModal({
          title: tr('complete_step', 'Complete Step'),
          message: `${tr('complete_step_confirm', 'Complete this step? You spent')} <strong>${duration} ${tr('minutes', 'minutes')}</strong>.`,
          confirmLabel: tr('confirm', 'Confirm'),
          cancelLabel: tr('cancel', 'Cancel'),
          type: 'primary',
          icon: 'check-circle',
          onConfirm: () => {
            completeStep(programId, stepId, duration, selectedDifficulty);
            modal.close();
            openProgramDetail(programId);
          }
        });
      }
    }
  ]);
  modal.body.appendChild(actions);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// تصدير الدوال
// ========================================

window.renderProgramPage = renderProgramPage;
window.getAllPrograms = getAllPrograms;
window.getProgramsCopy = getProgramsCopy;
window.getProgram = getProgram;
window.createProgram = createProgram;
window.deleteProgram = deleteProgram;
window.updateProgram = updateProgram;
window.addStep = addStep;
window.deleteStep = deleteStep;
window.addResource = addResource;
window.deleteResource = deleteResource;
window.completeStep = completeStep;
window.getProgramStats = getProgramStats;
window.getNextStep = getNextStep;
window.reorderSteps = reorderSteps;
window.openProgramBuilder = openProgramBuilder;
window.openProgramDetail = openProgramDetail;
window.renderProgramDetail = renderProgramDetail;
window.startSession = startSession;
window.openSessionModal = openSessionModal;

console.log("✅ Program v2.4 loaded successfully! (Gboard Fix: type=search for resources)");
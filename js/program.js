// ========================================
// MY LIFE HUB - PROGRAM (Learning Only)
// نظام تعلم بسيط مع خطوات وتايمر حقيقي وموارد
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

function saveAllPrograms(programs) {
  try {
    localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(programs));
  } catch (error) {
    console.error("Error saving programs:", error);
  }
}

function getProgram(programId) {
  const programs = getAllPrograms();
  return programs.find(p => p.id === programId) || null;
}

function updateProgram(updatedProgram) {
  const programs = getAllPrograms();
  const index = programs.findIndex(p => p.id === updatedProgram.id);
  if (index === -1) return false;
  programs[index] = updatedProgram;
  saveAllPrograms(programs);
  return true;
}

function deleteProgram(programId) {
  const programs = getAllPrograms();
  const filtered = programs.filter(p => p.id !== programId);
  saveAllPrograms(filtered);
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
  const programs = getAllPrograms();
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
    difficulty: null,
    learning: null,
    rating: null
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

function completeStep(programId, stepId, duration, difficulty, learning, rating) {
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
    difficulty: difficulty,
    learning: learning,
    rating: rating
  };

  program.sessions.push(session);

  step.completed = true;
  step.completedAt = new Date().toISOString();
  step.duration = duration;
  step.difficulty = difficulty;
  step.learning = learning;
  step.rating = rating;

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

  const recentSessions = program.sessions ? program.sessions.filter(s => new Date(s.completedAt) >= weekAgo) : [];

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

  const programs = getAllPrograms();
  console.log("📌 Programs loaded:", programs.length);

  const activePrograms = programs.filter(p => p.status === "active");
  const completedPrograms = programs.filter(p => p.status !== "active");

  const html = `
    <div id="program-container">
      <div class="program-header">
        <div class="program-title-area">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span data-lucide="graduation-cap" style="width: 32px; height: 32px; color: var(--primary);"></span>
            <h2 class="program-main-title" style="margin: 0;">${tr('program', 'Learning Programs')}</h2>
          </div>
          <p class="program-main-subtitle">${tr('program_subtitle', 'Create your learning programs and track your progress step by step')}</p>
        </div>
        <button class="program-add-btn" id="program-add-btn">
          <span class="program-add-icon" data-lucide="plus" style="width: 20px; height: 20px;"></span>
          ${tr('add_program', 'New Program')}
        </button>
      </div>
    </div>
  `;

  app.innerHTML = html;

  const container = document.getElementById("program-container");
  const fragment = document.createDocumentFragment();
  const grid = document.createElement("div");
  grid.className = "program-grid";
  grid.id = "program-grid";

  if (activePrograms.length > 0) {
    activePrograms.forEach(p => {
      const card = createProgramCardHTML(p);
      const temp = document.createElement("div");
      temp.innerHTML = card;
      while (temp.firstChild) grid.appendChild(temp.firstChild);
    });
    fragment.appendChild(grid);
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
    while (temp.firstChild) fragment.appendChild(temp.firstChild);
  }

  if (completedPrograms.length > 0) {
    const sectionTitle = document.createElement("h3");
    sectionTitle.className = "program-section-title";
    sectionTitle.textContent = "✅ " + tr('completed_programs', 'Completed Programs');
    fragment.appendChild(sectionTitle);

    const subgrid = document.createElement("div");
    subgrid.className = "program-section-subgrid";
    completedPrograms.forEach(p => {
      const cardHTML = createCompletedCardHTML(p);
      const temp = document.createElement("div");
      temp.innerHTML = cardHTML;
      while (temp.firstChild) subgrid.appendChild(temp.firstChild);
    });
    fragment.appendChild(subgrid);
  }

  document.getElementById("program-grid")?.remove();
  container.querySelector(".program-empty-state")?.remove();
  container.querySelector(".program-section-title")?.remove();
  container.querySelector(".program-section-subgrid")?.remove();

  while (fragment.firstChild) {
    container.appendChild(fragment.firstChild);
  }

  // الأحداث
  document.getElementById("program-add-btn")?.addEventListener("click", () => openProgramBuilder());

  document.querySelectorAll(".program-card-continue-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      openProgramDetail(parseFloat(this.dataset.programId));
    });
  });

  // ✨ استخدام deleteModal
  document.querySelectorAll(".program-card-delete-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const id = parseFloat(this.dataset.programId);
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
    });
  });

  document.querySelectorAll(".program-card-small-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      openProgramDetail(parseFloat(this.dataset.programId));
    });
  });

  setTimeout(() => { 
    if (typeof initLucideIcons === 'function') {
      initLucideIcons();
    }
  }, 50);
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
        <button class="program-card-continue-btn" data-program-id="${program.id}">
          ${stats.totalSteps === 0 ? tr('add_steps', 'Add Steps →') : tr('continue', 'Continue →')}
        </button>
        <button class="program-card-delete-btn" data-program-id="${program.id}">
          <span data-lucide="trash-2" style="width: 16px; height: 16px;"></span>
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
      <button class="program-card-small-btn" data-program-id="${program.id}">
        <span data-lucide="eye" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span>
        ${tr('view', 'View')}
      </button>
    </div>
  `;
}

// ========================================
// Program Builder
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

  const descField = createModalField({
    id: 'program-builder-desc',
    label: tr('description', 'Description'),
    type: 'textarea',
    rows: 3,
    placeholder: tr('describe_program', 'Describe your program...')
  });
  modal.body.appendChild(descField.field);

  const goalField = createModalField({
    id: 'program-builder-goal',
    label: tr('goal', 'Goal'),
    type: 'text',
    placeholder: tr('goal_placeholder', 'e.g. Understand the fundamentals...')
  });
  modal.body.appendChild(goalField.field);

  const resourcesLabel = document.createElement("label");
  resourcesLabel.className = "modal-base-label";
  resourcesLabel.textContent = tr('resources_optional', 'Resources (optional)');
  modal.body.appendChild(resourcesLabel);

  const resourceRow = document.createElement("div");
  resourceRow.style.cssText = "display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;";

  const resourceNameInput = document.createElement("input");
  resourceNameInput.type = "text";
  resourceNameInput.className = "modal-base-input";
  resourceNameInput.placeholder = tr('resource_name', 'Resource name...');
  resourceNameInput.style.cssText = "flex: 1; min-width: 120px;";

  const resourceUrlInput = document.createElement("input");
  resourceUrlInput.type = "text";
  resourceUrlInput.className = "modal-base-input";
  resourceUrlInput.placeholder = tr('url_optional', 'URL (optional)');
  resourceUrlInput.style.cssText = "flex: 1.5; min-width: 150px;";

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
    resourcesList.innerHTML = "";
    tempResources.forEach((r, i) => {
      const div = document.createElement("div");
      div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: 6px; font-size: 13px;";
      const text = document.createElement("span");
      text.textContent = r.name + (r.url ? " 🔗" : "");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = '<span data-lucide="x" style="width: 14px; height: 14px;"></span>';
      btn.style.cssText = "background: none; border: none; color: var(--danger); cursor: pointer; padding: 0 4px;";
      btn.onclick = () => { tempResources.splice(i, 1); renderTempResources(); };
      div.appendChild(text);
      div.appendChild(btn);
      resourcesList.appendChild(div);
    });
    setTimeout(() => {
      if (typeof initLucideIcons === 'function') initLucideIcons();
    }, 30);
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

  const stats = getProgramStats(program);
  const progress = stats.percentage;

  const html = `
    <div class="program-detail-container">
      <div class="program-detail-header">
        <div class="program-detail-title-area">
          <span class="program-detail-icon" data-lucide="book-open" style="width: 32px; height: 32px; color: var(--primary);"></span>
          <div>
            <h2 class="program-detail-name">${escapeHtml(program.name)}</h2>
            <span class="program-detail-type">${program.status}</span>
            ${program.goal ? `<span class="program-detail-goal"><span data-lucide="target" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span> ${escapeHtml(program.goal)}</span>` : ''}
          </div>
        </div>
        <div class="program-detail-actions">
          <button class="program-detail-back-btn" id="program-detail-back">
            <span data-lucide="arrow-left" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('back', 'Back')}
          </button>
          <button class="program-detail-delete-btn" id="program-detail-delete">
            <span data-lucide="trash-2" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('delete', 'Delete')}
          </button>
        </div>
      </div>

      <div style="margin-bottom: 20px; background: var(--bg-card); padding: 16px 20px; border-radius: 12px; border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); margin-bottom: 6px;">
          <span>${tr('progress', 'Progress')}</span>
          <span>${progress}% (${stats.completedSteps}/${stats.totalSteps} ${tr('steps', 'steps')})</span>
        </div>
        <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 10px; overflow: hidden;">
          <div style="height: 100%; width: ${progress}%; background: var(--primary-gradient); border-radius: 10px; transition: width 0.6s ease;"></div>
        </div>
      </div>

      <div class="program-detail-tabs">
        <button class="program-detail-tab ${currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
          <span data-lucide="info" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
          ${tr('overview', 'Overview')}
        </button>
        <button class="program-detail-tab ${currentTab === 'steps' ? 'active' : ''}" data-tab="steps">
          <span data-lucide="list" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
          ${tr('steps', 'Steps')}
        </button>
        <button class="program-detail-tab ${currentTab === 'resources' ? 'active' : ''}" data-tab="resources">
          <span data-lucide="link" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
          ${tr('resources', 'Resources')}
        </button>
        <button class="program-detail-tab ${currentTab === 'sessions' ? 'active' : ''}" data-tab="sessions">
          <span data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
          ${tr('sessions', 'Sessions')}
        </button>
      </div>

      <div id="program-tab-content"></div>
    </div>
  `;

  app.innerHTML = html;

  setTimeout(() => { if (typeof initLucideIcons === 'function') initLucideIcons(); }, 50);

  document.getElementById("program-detail-back").onclick = () => renderProgramPage();

  // ✨ استخدام deleteModal
  document.getElementById("program-detail-delete").onclick = () => {
    deleteModal({
      itemName: program.name,
      itemType: 'program',
      onConfirm: () => {
        deleteProgram(program.id);
        renderProgramPage();
      }
    });
  };

  document.querySelectorAll(".program-detail-tab").forEach(tab => {
    tab.onclick = function() {
      currentTab = this.dataset.tab;
      renderProgramDetail(program);
    };
  });

  const content = document.getElementById("program-tab-content");
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

  const html = `
    <div class="program-overview">
      <div class="program-overview-grid">
        <div class="program-overview-item">
          <span class="program-overview-label">
            <span data-lucide="file-text" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('description', 'Description')}
          </span>
          <span class="program-overview-value">${escapeHtml(program.description) || tr('no_description', 'No description')}</span>
        </div>
        <div class="program-overview-item">
          <span class="program-overview-label">
            <span data-lucide="target" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('goal', 'Goal')}
          </span>
          <span class="program-overview-value">${escapeHtml(program.goal) || tr('not_set', 'Not set')}</span>
        </div>
        <div class="program-overview-item">
          <span class="program-overview-label">
            <span data-lucide="activity" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('status', 'Status')}
          </span>
          <span class="program-overview-value">${program.status}</span>
        </div>
        <div class="program-overview-item">
          <span class="program-overview-label">
            <span data-lucide="trending-up" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('progress', 'Progress')}
          </span>
          <span class="program-overview-value">${stats.percentage}%</span>
        </div>
        <div class="program-overview-item">
          <span class="program-overview-label">
            <span data-lucide="list" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('steps', 'Steps')}
          </span>
          <span class="program-overview-value">${stats.completedSteps}/${stats.totalSteps}</span>
        </div>
        <div class="program-overview-item">
          <span class="program-overview-label">
            <span data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('sessions', 'Sessions')}
          </span>
          <span class="program-overview-value">${stats.totalSessions}</span>
        </div>
        <div class="program-overview-item">
          <span class="program-overview-label">
            <span data-lucide="link" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('resources', 'Resources')}
          </span>
          <span class="program-overview-value">${program.resources ? program.resources.length : 0}</span>
        </div>
        <div class="program-overview-item">
          <span class="program-overview-label">
            <span data-lucide="arrow-right-circle" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('next_step', 'Next Step')}
          </span>
          <span class="program-overview-value">${nextStep ? escapeHtml(nextStep.name) : (stats.totalSteps > 0 ? "✅ " + tr('all_completed', 'All completed!') : tr('no_steps_added', 'No steps added'))}</span>
        </div>
        <div class="program-overview-item">
          <span class="program-overview-label">
            <span data-lucide="calendar" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('created', 'Created')}
          </span>
          <span class="program-overview-value">${formatDate(program.createdAt)}</span>
        </div>
        ${program.completedAt ? `
        <div class="program-overview-item">
          <span class="program-overview-label">
            <span data-lucide="check-circle" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>
            ${tr('completed', 'Completed')}
          </span>
          <span class="program-overview-value">${formatDate(program.completedAt)}</span>
        </div>` : ''}
      </div>

      ${program.status === "active" ? `
        <button class="program-card-continue-btn" id="program-start-session" style="width: 100%; margin-top: 12px;">
          <span data-lucide="play" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span>
          ${getNextStep(program) ? tr('start_session', 'Start Session') + ': ' + escapeHtml(getNextStep(program).name) + ' →' : (stats.totalSteps === 0 ? tr('add_steps_first', 'Add Steps First →') : '✅ ' + tr('all_steps_completed', 'All Steps Completed!'))}
        </button>` : ''}

      ${program.status === "completed" ? `
        <div style="text-align: center; padding: 12px; background: #4caf84; color: white; border-radius: 8px; margin-top: 12px;">
          <span data-lucide="check-circle" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 4px;"></span>
          ${tr('program_completed', 'Program Completed! All')} ${stats.totalSteps} ${tr('steps_done', 'steps done!')}
        </div>` : ''}
    </div>
  `;

  container.innerHTML = html;

  document.getElementById("program-start-session")?.addEventListener("click", () => startSession(program.id));
}

// ========================================
// Steps Tab
// ========================================

function renderSteps(container, program) {
  const fragment = document.createDocumentFragment();
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

      const headerDiv = document.createElement("div");
      headerDiv.className = "program-phase-header";

      const nameSpan = document.createElement("span");
      nameSpan.className = "program-phase-name";
      nameSpan.innerHTML = (step.completed ? '<span data-lucide="check-circle" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; color: #4caf84;"></span>' : '<span data-lucide="circle" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span>') + ' ' + escapeHtml(step.name);
      headerDiv.appendChild(nameSpan);

      if (step.completed) {
        const dateSpan = document.createElement("span");
        dateSpan.style.cssText = "font-size: 12px; color: var(--text-muted);";
        dateSpan.innerHTML = '<span data-lucide="calendar" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span>' + formatDate(step.completedAt);
        headerDiv.appendChild(dateSpan);

        if (step.difficulty) {
          const diffSpan = document.createElement("span");
          diffSpan.style.cssText = "font-size: 12px; color: var(--text-muted);";
          diffSpan.innerHTML = tr(step.difficulty.toLowerCase(), step.difficulty);
          headerDiv.appendChild(diffSpan);
        }

        if (step.rating) {
          const ratingSpan = document.createElement("span");
          ratingSpan.style.cssText = "font-size: 12px; color: var(--warning);";
          ratingSpan.innerHTML = '<span data-lucide="star" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; fill: #f5a623; stroke: #f5a623;"></span>' + step.rating + '/5';
          headerDiv.appendChild(ratingSpan);
        }
      }

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "program-phase-actions";

      if (!step.completed) {
        const editBtn = document.createElement("button");
        editBtn.className = "program-phase-btn program-edit-step-btn";
        editBtn.innerHTML = '<span data-lucide="pencil" style="width: 16px; height: 16px;"></span>';
        editBtn.dataset.stepId = step.id;
        actionsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "program-phase-btn program-phase-btn-danger program-delete-step-btn";
        deleteBtn.innerHTML = '<span data-lucide="x" style="width: 16px; height: 16px;"></span>';
        deleteBtn.dataset.stepId = step.id;
        actionsDiv.appendChild(deleteBtn);
      }

      headerDiv.appendChild(actionsDiv);
      phaseDiv.appendChild(headerDiv);

      if (step.completed && step.learning) {
        const learningDiv = document.createElement("div");
        learningDiv.style.cssText = "font-size: 13px; color: var(--text-secondary); padding: 4px 0 0 24px; font-style: italic;";
        learningDiv.innerHTML = '<span data-lucide="lightbulb" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; color: #f5a623;"></span>' + escapeHtml(step.learning);
        phaseDiv.appendChild(learningDiv);
      }

      if (step.completed && step.duration) {
        const durationDiv = document.createElement("div");
        durationDiv.style.cssText = "font-size: 12px; color: var(--text-muted); padding: 2px 0 0 24px;";
        durationDiv.innerHTML = '<span data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span>' + step.duration + ' min';
        phaseDiv.appendChild(durationDiv);
      }

      wrapper.appendChild(phaseDiv);
    });
  }

  const addBtn = document.createElement("button");
  addBtn.className = "program-add-phase-btn";
  addBtn.id = "program-add-step";
  addBtn.style.marginTop = "12px";
  addBtn.innerHTML = '<span data-lucide="plus" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span>' + tr('add_step', 'Add Step');
  wrapper.appendChild(addBtn);

  fragment.appendChild(wrapper);
  container.innerHTML = "";
  container.appendChild(fragment);

  // ✅ استخدام promptModal
  document.getElementById("program-add-step").onclick = () => {
    promptModal({
      title: tr('add_step', 'Add Step'),
      message: tr('enter_step_name', 'Enter a descriptive name for this step'),
      label: tr('step_name', 'Step Name'),
      placeholder: tr('step_name_placeholder', 'e.g. Read Chapter 1'),
      validate: (v) => v.length > 0 && v.length <= 100,
      errorMessage: tr('invalid_step_name', 'Step name must be 1-100 characters'),
      confirmLabel: tr('add', 'Add'),
      cancelLabel: tr('cancel', 'Cancel'),
      onConfirm: (name) => {
        const result = addStep(program.id, name);
        if (result) {
          const updated = getProgram(program.id);
          if (updated) renderProgramDetail(updated);
        }
      }
    });
  };

  // ✅ استخدام promptModal
  document.querySelectorAll(".program-edit-step-btn").forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const stepId = parseFloat(this.dataset.stepId);
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
    };
  });

  // ✨ استخدام deleteModal لحذف الخطوة
  document.querySelectorAll(".program-delete-step-btn").forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const stepId = parseFloat(this.dataset.stepId);
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
    };
  });

  setupStepDragAndDrop(program.id);
}

// ========================================
// Resources Tab
// ========================================

function renderResources(container, program) {
  let html = `<div class="program-overview">`;

  if (!program.resources || program.resources.length === 0) {
    html += `<p style="text-align: center; color: var(--text-muted); padding: 20px 0;">${tr('no_resources', 'No resources added.')}</p>`;
  } else {
    program.resources.forEach(res => {
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 8px; background: var(--bg-surface);">
          <div>
            <span style="font-weight: 500; color: var(--text-primary);">
              <span data-lucide="link" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; color: var(--primary);"></span>
              ${escapeHtml(res.name)}
            </span>
            ${res.url ? `<a href="${escapeHtml(res.url)}" target="_blank" style="margin-left: 12px; color: var(--primary); text-decoration: none; font-size: 13px;"><span data-lucide="external-link" style="width: 14px; height: 14px; vertical-align: middle;"></span> ${tr('open', 'Open')}</a>` : ''}
          </div>
          <button class="program-phase-btn program-phase-btn-danger" data-action="delete-resource" data-resource-id="${res.id}" style="padding: 4px 10px;">
            <span data-lucide="trash-2" style="width: 14px; height: 14px;"></span>
          </button>
        </div>
      `;
    });
  }

  html += `
    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-light);">
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <input type="text" id="program-add-resource-name" placeholder="${tr('resource_name', 'Resource name...')}" style="flex: 1; min-width: 150px; padding: 8px 12px; border: 1px solid var(--border-input); border-radius: 6px; background: var(--bg-input); color: var(--text-primary);" />
        <input type="text" id="program-add-resource-url" placeholder="${tr('url_optional', 'URL (optional)')}" style="flex: 1.5; min-width: 150px; padding: 8px 12px; border: 1px solid var(--border-input); border-radius: 6px; background: var(--bg-input); color: var(--text-primary);" />
        <button class="program-card-continue-btn" id="program-add-resource-btn" style="padding: 8px 20px;">
          <span data-lucide="plus" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span>
          ${tr('add_resource', 'Add Resource')}
        </button>
      </div>
    </div>
  `;

  html += `</div>`;
  container.innerHTML = html;

  document.getElementById("program-add-resource-btn").onclick = () => {
    const name = document.getElementById("program-add-resource-name").value.trim();
    const url = document.getElementById("program-add-resource-url").value.trim();
    if (name) {
      addResource(program.id, name, url);
      document.getElementById("program-add-resource-name").value = "";
      document.getElementById("program-add-resource-url").value = "";
      const updated = getProgram(program.id);
      if (updated) renderProgramDetail(updated);
    }
  };

  // ✨ استخدام deleteModal لحذف المورد
  container.querySelectorAll("[data-action='delete-resource']").forEach(btn => {
    btn.onclick = function() {
      const resourceId = parseFloat(this.dataset.resourceId);
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
    };
  });
}

// ========================================
// Sessions Tab
// ========================================

function renderSessions(container, program) {
  const sessions = program.sessions || [];

  if (sessions.length === 0) {
    let html = `<div class="program-overview">`;
    html += `<p style="text-align: center; color: var(--text-muted); padding: 20px 0;">${tr('no_sessions', 'No sessions completed yet. Start your first session!')}</p>`;
    if (program.status === "active" && program.steps && program.steps.length > 0) {
      const nextStep = getNextStep(program);
      if (nextStep) {
        html += `<button class="program-card-continue-btn" id="program-start-session-from-sessions" style="width: 100%;">
          <span data-lucide="play" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span>
          ${tr('start_session', 'Start Session')} →
        </button>`;
      }
    }
    html += `</div>`;
    container.innerHTML = html;
    document.getElementById("program-start-session-from-sessions")?.addEventListener("click", () => startSession(program.id));
    return;
  }

  const sortedSessions = [...sessions].reverse();

  let html = `<div class="program-overview">`;
  html += `
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
      <span style="font-weight: 600; color: var(--text-primary);">
        <span data-lucide="clock" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 4px; color: var(--primary);"></span>
        ${sessions.length} ${tr('sessions_completed', 'Sessions Completed')}
      </span>
      ${program.status === "active" && getNextStep(program) ? `<button class="program-card-continue-btn" id="program-start-session-from-sessions"><span data-lucide="play" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></span>${tr('start_session', 'Start Session')} →</button>` : ''}
    </div>
  `;

  sortedSessions.forEach(session => {
    const difficultyEmoji = session.difficulty === "Hard" ? "🔴" : session.difficulty === "Medium" ? "🟡" : "🟢";
    const difficultyLabel = tr(session.difficulty?.toLowerCase() || 'medium', session.difficulty || 'Medium');

    html += `
      <div style="padding: 12px 16px; border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 8px; background: var(--bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="font-weight: 600; color: var(--text-primary);">
              <span data-lucide="book-open" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; color: var(--primary);"></span>
              ${escapeHtml(session.stepName)}
            </span>
          </div>
          <div style="display: flex; gap: 12px; font-size: 13px; color: var(--text-muted);">
            <span>${difficultyEmoji} ${difficultyLabel}</span>
            <span><span data-lucide="star" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 2px; fill: #f5a623; stroke: #f5a623;"></span>${session.rating}/5</span>
            ${session.duration ? `<span><span data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 2px;"></span>${session.duration} min</span>` : ''}
          </div>
        </div>
        ${session.learning ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px; font-style: italic;"><span data-lucide="lightbulb" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; color: #f5a623;"></span>"${escapeHtml(session.learning)}"</div>` : ''}
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
          <span data-lucide="calendar" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 2px;"></span>
          ${formatDate(session.completedAt)}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;

  document.getElementById("program-start-session-from-sessions")?.addEventListener("click", () => startSession(program.id));
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

function openSessionModal(programId, stepId, stepName) {
  let timerSeconds = 0;
  let timerInterval = null;
  let isTimerRunning = false;
  let selectedDifficulty = "Medium";
  let selectedRating = 3;

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
  stepTitle.innerHTML = '<span data-lucide="book-open" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; color: var(--primary);"></span> ' + escapeHtml(stepName);
  modal.body.appendChild(stepTitle);

  const timerBox = document.createElement("div");
  timerBox.style.cssText = "text-align: center; margin: 16px 0;";
  timerBox.innerHTML = `
    <div style="font-size: 48px; font-weight: 700; font-family: monospace; color: var(--primary);" id="session-timer-display">00:00</div>
    <div style="display: flex; gap: 8px; justify-content: center; margin-top: 8px; flex-wrap: wrap;">
      <button type="button" class="modal-base-btn modal-base-btn-primary" id="session-timer-start" style="padding: 8px 20px; font-size: 14px; flex: 0 0 auto;">
        <span data-lucide="play" style="width: 14px; height: 14px;"></span>
        ${tr('start', 'Start')}
      </button>
      <button type="button" class="modal-base-btn modal-base-btn-secondary" id="session-timer-pause" style="padding: 8px 20px; font-size: 14px; flex: 0 0 auto; display: none;">
        <span data-lucide="pause" style="width: 14px; height: 14px;"></span>
        ${tr('pause', 'Pause')}
      </button>
      <button type="button" class="modal-base-btn modal-base-btn-secondary" id="session-timer-reset" style="padding: 8px 20px; font-size: 14px; flex: 0 0 auto;">
        <span data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></span>
        ${tr('reset', 'Reset')}
      </button>
    </div>
  `;
  modal.body.appendChild(timerBox);

  const hr = document.createElement("hr");
  hr.style.cssText = "border: none; border-top: 1px solid var(--border-light); margin: 16px 0;";
  modal.body.appendChild(hr);

  const diffLabel = document.createElement("label");
  diffLabel.className = "modal-base-label";
  diffLabel.innerHTML = '<span data-lucide="bar-chart" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></span> ' + tr('how_was_step', 'How was this step?');
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

  const learnField = createModalField({
    id: 'session-learning',
    label: tr('what_did_you_learn', 'What did you learn?'),
    type: 'text',
    placeholder: tr('learning_placeholder', 'e.g. I understood the concept...')
  });
  modal.body.appendChild(learnField.field);

  const ratingLabel = document.createElement("label");
  ratingLabel.className = "modal-base-label";
  ratingLabel.innerHTML = '<span data-lucide="star" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; color: #f5a623;"></span> ' + tr('rating', 'Rating') + ' (1-5)';
  modal.body.appendChild(ratingLabel);

  const ratingGrid = document.createElement("div");
  ratingGrid.id = "rating-stars";
  ratingGrid.style.cssText = "display: flex; gap: 8px; margin-bottom: 16px;";

  [1,2,3,4,5].forEach(function(i) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-base-btn modal-base-btn-secondary";
    btn.style.cssText = "flex: 1; padding: 10px; font-size: 20px;";
    btn.dataset.rating = i;
    btn.textContent = i <= selectedRating ? "★" : "☆";
    btn.style.color = i <= selectedRating ? "#f5a623" : "var(--text-muted)";
    btn.addEventListener("click", function() {
      selectedRating = i;
      ratingGrid.querySelectorAll("button").forEach(b => {
        const num = parseInt(b.dataset.rating);
        b.textContent = num <= i ? "★" : "☆";
        b.style.color = num <= i ? "#f5a623" : "var(--text-muted)";
      });
    });
    ratingGrid.appendChild(btn);
  });
  modal.body.appendChild(ratingGrid);

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
        const learning = learnField.input.value.trim() || tr('completed_successfully', 'Completed successfully!');
        const duration = Math.ceil(timerSeconds / 60);

        // ✅ استخدام confirmModal
        confirmModal({
          title: tr('complete_step', 'Complete Step'),
          message: `${tr('complete_step_confirm', 'Complete this step? You spent')} <strong>${duration} ${tr('minutes', 'minutes')}</strong>.`,
          confirmLabel: tr('confirm', 'Confirm'),
          cancelLabel: tr('cancel', 'Cancel'),
          type: 'primary',
          icon: 'check-circle',
          onConfirm: () => {
            completeStep(programId, stepId, duration, selectedDifficulty, learning, selectedRating);
            modal.close();
            openProgramDetail(programId);
          }
        });
      }
    }
  ]);
  modal.body.appendChild(actions);
}

// ========================================
// تصدير الدالة
// ========================================

window.renderProgramPage = renderProgramPage;

console.log("✅ Program (Learning with Timer & Resources) loaded successfully!");
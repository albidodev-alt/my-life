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
  var programs = getAllPrograms();
  for (var i = 0; i < programs.length; i++) {
    if (programs[i].id === programId) {
      return programs[i];
    }
  }
  return null;
}

function updateProgram(updatedProgram) {
  var programs = getAllPrograms();
  for (var i = 0; i < programs.length; i++) {
    if (programs[i].id === updatedProgram.id) {
      programs[i] = updatedProgram;
      saveAllPrograms(programs);
      return true;
    }
  }
  return false;
}

function deleteProgram(programId) {
  var programs = getAllPrograms();
  var filtered = [];
  for (var i = 0; i < programs.length; i++) {
    if (programs[i].id !== programId) {
      filtered.push(programs[i]);
    }
  }
  saveAllPrograms(filtered);
}

// ========================================
// دوال مساعدة (تم نقلها للأعلى)
// ========================================

function escapeHtml(text) {
  if (!text) return "";
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return "";
  var date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// ========================================
// إنشاء برنامج جديد
// ========================================

function createProgram(name, description, goal, resources) {
  var programs = getAllPrograms();
  var newProgram = {
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
// دوال إدارة الموارد (Resources)
// ========================================

function addResource(programId, name, url) {
  var program = getProgram(programId);
  if (!program) return null;

  if (!program.resources) {
    program.resources = [];
  }

  var newResource = {
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
  var program = getProgram(programId);
  if (!program) return false;

  if (!program.resources) {
    program.resources = [];
    return false;
  }

  var newResources = [];
  for (var i = 0; i < program.resources.length; i++) {
    if (program.resources[i].id !== resourceId) {
      newResources.push(program.resources[i]);
    }
  }
  program.resources = newResources;
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

// ========================================
// دوال إدارة الخطوات (Steps)
// ========================================

function addStep(programId, stepName) {
  var program = getProgram(programId);
  if (!program) return null;

  if (!program.steps) {
    program.steps = [];
  }

  var newStep = {
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
  var program = getProgram(programId);
  if (!program) return false;

  if (!program.steps) {
    program.steps = [];
    return false;
  }

  var newSteps = [];
  for (var i = 0; i < program.steps.length; i++) {
    if (program.steps[i].id !== stepId) {
      newSteps.push(program.steps[i]);
    }
  }
  program.steps = newSteps;
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function reorderSteps(programId, stepIds) {
  var program = getProgram(programId);
  if (!program) return false;

  if (!program.steps) {
    program.steps = [];
    return false;
  }

  var newSteps = [];
  for (var i = 0; i < stepIds.length; i++) {
    for (var j = 0; j < program.steps.length; j++) {
      if (program.steps[j].id === stepIds[i]) {
        newSteps.push(program.steps[j]);
        break;
      }
    }
  }

  program.steps = newSteps;
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function completeStep(programId, stepId, duration, difficulty, learning, rating) {
  var program = getProgram(programId);
  if (!program) return false;

  if (!program.steps) {
    program.steps = [];
    return false;
  }

  var step = null;
  for (var i = 0; i < program.steps.length; i++) {
    if (program.steps[i].id === stepId) {
      step = program.steps[i];
      break;
    }
  }
  if (!step) return false;

  if (!program.sessions) {
    program.sessions = [];
  }

  var session = {
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

  var allCompleted = true;
  for (var j = 0; j < program.steps.length; j++) {
    if (!program.steps[j].completed) {
      allCompleted = false;
      break;
    }
  }

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
  for (var i = 0; i < program.steps.length; i++) {
    if (!program.steps[i].completed) {
      return program.steps[i];
    }
  }
  return null;
}

function calculateProgress(program) {
  var total = program.steps ? program.steps.length : 0;
  var completed = 0;
  if (program.steps) {
    for (var i = 0; i < program.steps.length; i++) {
      if (program.steps[i].completed) completed++;
    }
  }
  var percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return {
    total: total,
    completed: completed,
    percentage: percentage
  };
}

function getProgramStats(program) {
  var progress = calculateProgress(program);
  var totalSessions = program.sessions ? program.sessions.length : 0;

  var now = new Date();
  var weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  var recentSessions = [];
  if (program.sessions) {
    for (var i = 0; i < program.sessions.length; i++) {
      if (new Date(program.sessions[i].completedAt) >= weekAgo) {
        recentSessions.push(program.sessions[i]);
      }
    }
  }

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
  var app = document.getElementById("app");
  if (!app) {
    console.error("❌ app element not found");
    return;
  }

  var programs = getAllPrograms();
  console.log("📌 Programs loaded:", programs.length);

  var activePrograms = [];
  var completedPrograms = [];
  
  for (var i = 0; i < programs.length; i++) {
    if (programs[i].status === "active") {
      activePrograms.push(programs[i]);
    } else {
      completedPrograms.push(programs[i]);
    }
  }

  var html = '';
  html += '<div id="program-container">';
  html += '  <div class="program-header">';
  html += '    <div class="program-title-area">';
  html += '      <h2 class="program-main-title">📚 Learning Programs</h2>';
  html += '      <p class="program-main-subtitle">Create your learning programs and track your progress step by step</p>';
  html += '    </div>';
  html += '    <button class="program-add-btn" id="program-add-btn">';
  html += '      <span class="program-add-icon">＋</span>';
  html += '      New Program';
  html += '    </button>';
  html += '  </div>';

  if (activePrograms.length > 0) {
    html += '  <div class="program-grid" id="program-grid">';
    for (var j = 0; j < activePrograms.length; j++) {
      html += renderProgramCard(activePrograms[j]);
    }
    html += '  </div>';
  } else {
    html += '  <div class="program-empty-state">';
    html += '    <div class="program-empty-icon">📚</div>';
    html += '    <h3 class="program-empty-title">No programs yet</h3>';
    html += '    <p class="program-empty-desc">Create your first learning program</p>';
    html += '  </div>';
  }

  if (completedPrograms.length > 0) {
    html += '  <h3 class="program-section-title">✅ Completed Programs</h3>';
    html += '  <div class="program-section-subgrid">';
    for (var k = 0; k < completedPrograms.length; k++) {
      html += renderCompletedCard(completedPrograms[k]);
    }
    html += '  </div>';
  }

  html += '</div>';
  app.innerHTML = html;

  var addBtn = document.getElementById("program-add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", function() {
      openProgramBuilder();
    });
  }

  var continueBtns = document.querySelectorAll(".program-card-continue-btn");
  for (var a = 0; a < continueBtns.length; a++) {
    continueBtns[a].addEventListener("click", function() {
      var programId = parseFloat(this.dataset.programId);
      openProgramDetail(programId);
    });
  }

  var deleteBtns = document.querySelectorAll(".program-card-delete-btn");
  for (var b = 0; b < deleteBtns.length; b++) {
    deleteBtns[b].addEventListener("click", function() {
      var programId = parseFloat(this.dataset.programId);
      if (confirm("Delete this program permanently?")) {
        deleteProgram(programId);
        renderProgramPage();
      }
    });
  }

  var smallBtns = document.querySelectorAll(".program-card-small-btn");
  for (var c = 0; c < smallBtns.length; c++) {
    smallBtns[c].addEventListener("click", function() {
      var programId = parseFloat(this.dataset.programId);
      openProgramDetail(programId);
    });
  }
}

// ========================================
// دوال عرض البطاقات
// ========================================

function renderProgramCard(program) {
  var stats = getProgramStats(program);
  var progress = stats.percentage;

  var nextStep = getNextStep(program);
  var nextStepName = nextStep ? nextStep.name : (stats.totalSteps > 0 && stats.completedSteps === stats.totalSteps ? "✅ Completed!" : "No steps added");

  var html = '';
  html += '<div class="program-card">';
  html += '  <div class="program-card-header">';
  html += '    <span class="program-card-icon">📚</span>';
  html += '    <span class="program-card-name">' + escapeHtml(program.name) + '</span>';
  html += '  </div>';
  html += '  <p class="program-card-description">' + (escapeHtml(program.description) || "No description") + '</p>';
  if (program.goal) {
    html += '  <p class="program-card-goal">🎯 ' + escapeHtml(program.goal) + '</p>';
  }
  html += '  <div class="program-card-progress">';
  html += '    <div class="program-card-progress-bar">';
  html += '      <div class="program-card-progress-fill" style="width: ' + progress + '%"></div>';
  html += '    </div>';
  html += '    <div class="program-card-progress-text">';
  html += '      <span>' + progress + '% Complete</span>';
  html += '      <span>' + stats.completedSteps + '/' + stats.totalSteps + ' Steps</span>';
  html += '    </div>';
  html += '  </div>';
  html += '  <div class="program-card-stats">';
  html += '    <span class="program-card-stat">📌 Next: ' + escapeHtml(nextStepName) + '</span>';
  html += '    <span class="program-card-stat">📋 ' + stats.totalSessions + ' Sessions</span>';
  html += '  </div>';
  html += '  <div class="program-card-actions">';
  html += '    <button class="program-card-continue-btn" data-program-id="' + program.id + '">';
  html +=       (stats.totalSteps === 0 ? 'Add Steps →' : 'Continue →');
  html += '    </button>';
  html += '    <button class="program-card-delete-btn" data-program-id="' + program.id + '">🗑️</button>';
  html += '  </div>';
  html += '</div>';

  return html;
}

function renderCompletedCard(program) {
  var stats = getProgramStats(program);

  var html = '';
  html += '<div class="program-card-small">';
  html += '  <div class="program-card-small-info">';
  html += '    <div class="program-card-small-name">📚 ' + escapeHtml(program.name) + '</div>';
  html += '    <div class="program-card-small-progress">' + stats.totalSessions + ' Sessions • ' + stats.completedSteps + '/' + stats.totalSteps + ' Steps</div>';
  html += '  </div>';
  html += '  <button class="program-card-small-btn" data-program-id="' + program.id + '">View</button>';
  html += '</div>';

  return html;
}

// ========================================
// Program Builder (مع موارد اختيارية)
// ========================================

function openProgramBuilder() {
  var overlay = document.createElement("div");
  overlay.className = "notes-modal-overlay";
  overlay.id = "program-builder-overlay";

  var modal = document.createElement("div");
  modal.className = "notes-modal";
  modal.id = "program-builder-modal";

  modal.innerHTML = `
    <button class="notes-modal-close-btn" id="program-builder-close">✕</button>
    <h3 class="notes-modal-title">📚 Create Learning Program</h3>

    <div class="program-builder-step">
      <label class="notes-modal-label">Program Name *</label>
      <input type="text" class="notes-modal-input" id="program-builder-name" placeholder="e.g. Read a Book" />

      <label class="notes-modal-label">Description</label>
      <textarea class="notes-modal-textarea" id="program-builder-desc" rows="3" placeholder="Describe your program..."></textarea>
      
      <label class="notes-modal-label">Goal</label>
      <input type="text" class="notes-modal-input" id="program-builder-goal" placeholder="e.g. Understand the fundamentals..." />

      <label class="notes-modal-label">Resources (optional)</label>
      <div id="program-builder-resources">
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <input type="text" class="notes-modal-input" id="program-builder-resource-name" placeholder="Resource name..." style="flex: 1; margin-bottom: 0;" />
          <input type="text" class="notes-modal-input" id="program-builder-resource-url" placeholder="URL (optional)" style="flex: 1.5; margin-bottom: 0;" />
          <button class="notes-modal-cancel-btn" id="program-builder-add-resource" style="padding: 12px 16px; flex: 0.5;">Add</button>
        </div>
        <div id="program-builder-resources-list" style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;"></div>
      </div>
    </div>

    <div class="notes-modal-actions">
      <button class="notes-modal-cancel-btn" id="program-builder-cancel">Cancel</button>
      <button class="notes-modal-save-btn" id="program-builder-create">Create Program →</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  var tempResources = [];

  function renderTempResources() {
    var list = document.getElementById("program-builder-resources-list");
    if (!list) return;
    list.innerHTML = "";
    for (var i = 0; i < tempResources.length; i++) {
      var r = tempResources[i];
      var div = document.createElement("div");
      div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: 4px; font-size: 13px;";
      var text = document.createElement("span");
      text.textContent = r.name + (r.url ? " 🔗" : "");
      var btn = document.createElement("button");
      btn.textContent = "✕";
      btn.style.cssText = "background: none; border: none; color: var(--danger); cursor: pointer; font-size: 14px;";
      btn.addEventListener("click", function() {
        var index = parseInt(this.dataset.index);
        tempResources.splice(index, 1);
        renderTempResources();
      });
      btn.dataset.index = i;
      div.appendChild(text);
      div.appendChild(btn);
      list.appendChild(div);
    }
  }

  document.getElementById("program-builder-add-resource").addEventListener("click", function() {
    var name = document.getElementById("program-builder-resource-name").value.trim();
    var url = document.getElementById("program-builder-resource-url").value.trim();
    if (name) {
      tempResources.push({ name: name, url: url });
      document.getElementById("program-builder-resource-name").value = "";
      document.getElementById("program-builder-resource-url").value = "";
      renderTempResources();
    }
  });

  function closeModal() {
    overlay.remove();
  }

  document.getElementById("program-builder-close").addEventListener("click", closeModal);
  document.getElementById("program-builder-cancel").addEventListener("click", closeModal);

  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closeModal();
  });

  document.getElementById("program-builder-create").addEventListener("click", function() {
    var name = document.getElementById("program-builder-name").value.trim();
    var desc = document.getElementById("program-builder-desc").value.trim();
    var goal = document.getElementById("program-builder-goal").value.trim();

    if (!name) {
      document.getElementById("program-builder-name").classList.add("notes-modal-input-error");
      setTimeout(function() {
        document.getElementById("program-builder-name").classList.remove("notes-modal-input-error");
      }, 500);
      return;
    }

    var program = createProgram(name, desc, goal, tempResources);
    closeModal();
    openProgramDetail(program.id);
  });
}

// ========================================
// Program Detail
// ========================================

var currentProgramId = null;
var currentTab = "overview";

function openProgramDetail(programId) {
  console.log("📌 openProgramDetail called with id:", programId);
  var program = getProgram(programId);
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
  var app = document.getElementById("app");
  if (!app) return;

  var stats = getProgramStats(program);
  var progress = stats.percentage;

  var html = '';
  html += '<div class="program-detail-container">';
  html += '  <div class="program-detail-header">';
  html += '    <div class="program-detail-title-area">';
  html += '      <span class="program-detail-icon">📚</span>';
  html += '      <div>';
  html += '        <h2 class="program-detail-name">' + escapeHtml(program.name) + '</h2>';
  html += '        <span class="program-detail-type">' + program.status + '</span>';
  if (program.goal) {
    html += '        <span class="program-detail-goal">🎯 ' + escapeHtml(program.goal) + '</span>';
  }
  html += '      </div>';
  html += '    </div>';
  html += '    <div class="program-detail-actions">';
  html += '      <button class="program-detail-back-btn" id="program-detail-back">← Back</button>';
  html += '      <button class="program-detail-delete-btn" id="program-detail-delete">🗑️ Delete</button>';
  html += '    </div>';
  html += '  </div>';

  // Progress bar
  html += '  <div style="margin-bottom: 20px; background: var(--bg-card); padding: 16px 20px; border-radius: 12px; border: 1px solid var(--border-color);">';
  html += '    <div style="display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); margin-bottom: 6px;">';
  html += '      <span>Progress</span>';
  html += '      <span>' + progress + '% (' + stats.completedSteps + '/' + stats.totalSteps + ' steps)</span>';
  html += '    </div>';
  html += '    <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 10px; overflow: hidden;">';
  html += '      <div style="height: 100%; width: ' + progress + '%; background: var(--primary-gradient); border-radius: 10px; transition: width 0.6s ease;"></div>';
  html += '    </div>';
  html += '  </div>';

  html += '  <div class="program-detail-tabs">';
  html += '    <button class="program-detail-tab ' + (currentTab === 'overview' ? 'active' : '') + '" data-tab="overview">Overview</button>';
  html += '    <button class="program-detail-tab ' + (currentTab === 'steps' ? 'active' : '') + '" data-tab="steps">Steps</button>';
  html += '    <button class="program-detail-tab ' + (currentTab === 'resources' ? 'active' : '') + '" data-tab="resources">Resources</button>';
  html += '    <button class="program-detail-tab ' + (currentTab === 'sessions' ? 'active' : '') + '" data-tab="sessions">Sessions</button>';
  html += '  </div>';

  html += '  <div id="program-tab-content"></div>';
  html += '</div>';

  app.innerHTML = html;

  document.getElementById("program-detail-back").addEventListener("click", function() {
    renderProgramPage();
  });

  document.getElementById("program-detail-delete").addEventListener("click", function() {
    if (confirm('Delete "' + program.name + '" permanently?')) {
      deleteProgram(program.id);
      renderProgramPage();
    }
  });

  var tabs = document.querySelectorAll(".program-detail-tab");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function() {
      currentTab = this.dataset.tab;
      renderProgramDetail(program);
    });
  }

  var content = document.getElementById("program-tab-content");

  switch (currentTab) {
    case "overview":
      renderOverview(content, program);
      break;
    case "steps":
      renderSteps(content, program);
      break;
    case "resources":
      renderResources(content, program);
      break;
    case "sessions":
      renderSessions(content, program);
      break;
  }
}

// ========================================
// Overview Tab
// ========================================

function renderOverview(container, program) {
  var stats = getProgramStats(program);
  var nextStep = getNextStep(program);

  var html = '';
  html += '<div class="program-overview">';
  html += '  <div class="program-overview-grid">';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Description</span>';
  html += '      <span class="program-overview-value">' + (escapeHtml(program.description) || "No description") + '</span>';
  html += '    </div>';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Goal</span>';
  html += '      <span class="program-overview-value">' + (escapeHtml(program.goal) || "Not set") + '</span>';
  html += '    </div>';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Status</span>';
  html += '      <span class="program-overview-value">' + program.status + '</span>';
  html += '    </div>';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Progress</span>';
  html += '      <span class="program-overview-value">' + stats.percentage + '%</span>';
  html += '    </div>';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Steps</span>';
  html += '      <span class="program-overview-value">' + stats.completedSteps + '/' + stats.totalSteps + '</span>';
  html += '    </div>';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Sessions</span>';
  html += '      <span class="program-overview-value">' + stats.totalSessions + '</span>';
  html += '    </div>';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Resources</span>';
  html += '      <span class="program-overview-value">' + (program.resources ? program.resources.length : 0) + '</span>';
  html += '    </div>';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Next Step</span>';
  html += '      <span class="program-overview-value">' + (nextStep ? escapeHtml(nextStep.name) : (stats.totalSteps > 0 ? "✅ All completed!" : "No steps added")) + '</span>';
  html += '    </div>';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Created</span>';
  html += '      <span class="program-overview-value">' + formatDate(program.createdAt) + '</span>';
  html += '    </div>';
  if (program.completedAt) {
    html += '    <div class="program-overview-item">';
    html += '      <span class="program-overview-label">Completed</span>';
    html += '      <span class="program-overview-value">' + formatDate(program.completedAt) + '</span>';
    html += '    </div>';
  }
  html += '  </div>';

  if (program.status === "active") {
    var nextStepCheck = getNextStep(program);
    html += '  <button class="program-card-continue-btn" id="program-start-session" style="width: 100%; margin-top: 12px;">';
    html +=    (nextStepCheck ? 'Start Session: ' + escapeHtml(nextStepCheck.name) + ' →' : (stats.totalSteps === 0 ? 'Add Steps First →' : '✅ All Steps Completed!'));
    html += '  </button>';
  }

  if (program.status === "completed") {
    html += '  <div style="text-align: center; padding: 12px; background: #4caf84; color: white; border-radius: 8px; margin-top: 12px;">';
    html += '    🎉 Program Completed! All ' + stats.totalSteps + ' steps done!';
    html += '  </div>';
  }

  html += '</div>';
  container.innerHTML = html;

  var startBtn = document.getElementById("program-start-session");
  if (startBtn) {
    startBtn.addEventListener("click", function() {
      startSession(program.id);
    });
  }
}

// ========================================
// Steps Tab
// ========================================

function renderSteps(container, program) {
  var html = '<div class="program-structure" id="program-steps-container">';

  if (!program.steps || program.steps.length === 0) {
    html += '  <div style="text-align: center; padding: 30px; color: var(--text-muted);">';
    html += '    <p>No steps added yet. Add your first step below!</p>';
    html += '  </div>';
  } else {
    for (var i = 0; i < program.steps.length; i++) {
      var step = program.steps[i];
      html += '<div class="program-phase" data-step-id="' + step.id + '" draggable="true">';
      html += '  <div class="program-phase-header">';
      html += '    <span class="program-phase-name">' + (step.completed ? '✅' : '⬜') + ' ' + escapeHtml(step.name) + '</span>';
      if (step.completed) {
        html += '    <span style="font-size: 12px; color: var(--text-muted);">' + formatDate(step.completedAt) + '</span>';
        if (step.difficulty) {
          html += '    <span style="font-size: 12px; color: var(--text-muted);">' + step.difficulty + '</span>';
        }
        if (step.rating) {
          html += '    <span style="font-size: 12px; color: var(--warning);">⭐ ' + step.rating + '/5</span>';
        }
      }
      html += '    <div class="program-phase-actions">';
      if (!step.completed) {
        html += '      <button class="program-phase-btn program-edit-step-btn" data-step-id="' + step.id + '">✏️</button>';
        html += '      <button class="program-phase-btn program-phase-btn-danger program-delete-step-btn" data-step-id="' + step.id + '">✕</button>';
      }
      html += '    </div>';
      html += '  </div>';
      if (step.completed && step.learning) {
        html += '  <div style="font-size: 13px; color: var(--text-secondary); padding: 4px 0 0 24px; font-style: italic;">💡 ' + escapeHtml(step.learning) + '</div>';
      }
      if (step.completed && step.duration) {
        html += '  <div style="font-size: 12px; color: var(--text-muted); padding: 2px 0 0 24px;">⏱️ ' + step.duration + ' min</div>';
      }
      html += '</div>';
    }
  }

  html += '  <button class="program-add-phase-btn" id="program-add-step" style="margin-top: 12px;">＋ Add Step</button>';
  html += '</div>';

  container.innerHTML = html;

  document.getElementById("program-add-step").addEventListener("click", function() {
    var name = prompt("Enter step name:");
    if (name && name.trim()) {
      var result = addStep(program.id, name.trim());
      if (result) {
        var updatedProgram = getProgram(program.id);
        if (updatedProgram) {
          renderProgramDetail(updatedProgram);
        }
      }
    }
  });

  var editBtns = document.querySelectorAll(".program-edit-step-btn");
  for (var e = 0; e < editBtns.length; e++) {
    editBtns[e].addEventListener("click", function(e) {
      e.stopPropagation();
      var stepId = parseFloat(this.dataset.stepId);
      var newName = prompt("Edit step name:");
      if (newName && newName.trim()) {
        var program2 = getProgram(program.id);
        if (program2) {
          for (var s = 0; s < program2.steps.length; s++) {
            if (program2.steps[s].id === stepId) {
              program2.steps[s].name = newName.trim();
              program2.updatedAt = new Date().toISOString();
              updateProgram(program2);
              renderProgramDetail(program2);
              break;
            }
          }
        }
      }
    });
  }

  var deleteBtns = document.querySelectorAll(".program-delete-step-btn");
  for (var d = 0; d < deleteBtns.length; d++) {
    deleteBtns[d].addEventListener("click", function(e) {
      e.stopPropagation();
      var stepId = parseFloat(this.dataset.stepId);
      if (confirm("Delete this step?")) {
        deleteStep(program.id, stepId);
        var updatedProgram = getProgram(program.id);
        if (updatedProgram) {
          renderProgramDetail(updatedProgram);
        }
      }
    });
  }

  setupStepDragAndDrop(program.id);
}

// ========================================
// Drag & Drop for Steps (تم إصلاحها)
// ========================================

function setupStepDragAndDrop(programId) {
  var container = document.getElementById("program-steps-container");
  if (!container) return;

  var dragSrcIndex = null;

  var steps = document.querySelectorAll(".program-phase");
  for (var i = 0; i < steps.length; i++) {
    steps[i].addEventListener("dragstart", function(e) {
      dragSrcIndex = this;
      this.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", this.dataset.stepId);
    });

    steps[i].addEventListener("dragend", function(e) {
      this.classList.remove("dragging");
      var allSteps = document.querySelectorAll(".program-phase");
      for (var j = 0; j < allSteps.length; j++) {
        allSteps[j].classList.remove("drag-over");
      }
    });

    steps[i].addEventListener("dragover", function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (this !== dragSrcIndex) {
        this.classList.add("drag-over");
      }
    });

    steps[i].addEventListener("dragleave", function(e) {
      this.classList.remove("drag-over");
    });

    steps[i].addEventListener("drop", function(e) {
      e.preventDefault();
      this.classList.remove("drag-over");

      var draggedId = parseFloat(e.dataTransfer.getData("text/plain"));
      var targetId = parseFloat(this.dataset.stepId);

      if (draggedId === targetId) return;

      var program = getProgram(programId);
      if (!program) {
        console.error("❌ Program not found for drag and drop:", programId);
        return;
      }

      if (!program.steps) {
        program.steps = [];
        return;
      }

      var stepIds = [];
      for (var k = 0; k < program.steps.length; k++) {
        stepIds.push(program.steps[k].id);
      }

      var draggedIndex = -1;
      var targetIndex = -1;
      for (var m = 0; m < stepIds.length; m++) {
        if (stepIds[m] === draggedId) draggedIndex = m;
        if (stepIds[m] === targetId) targetIndex = m;
      }

      if (draggedIndex === -1 || targetIndex === -1) return;

      stepIds.splice(draggedIndex, 1);
      stepIds.splice(targetIndex, 0, draggedId);

      reorderSteps(programId, stepIds);
      var updatedProgram = getProgram(programId);
      if (updatedProgram) {
        renderProgramDetail(updatedProgram);
      }
    });
  }
}

// ========================================
// Resources Tab
// ========================================

function renderResources(container, program) {
  var html = '<div class="program-overview">';

  if (!program.resources || program.resources.length === 0) {
    html += '  <p style="text-align: center; color: var(--text-muted); padding: 20px 0;">No resources added.</p>';
  } else {
    for (var i = 0; i < program.resources.length; i++) {
      var res = program.resources[i];
      html += '  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 8px; background: var(--bg-surface);">';
      html += '    <div>';
      html += '      <span style="font-weight: 500; color: var(--text-primary);">' + escapeHtml(res.name) + '</span>';
      if (res.url) {
        html += '      <a href="' + escapeHtml(res.url) + '" target="_blank" style="margin-left: 12px; color: var(--primary); text-decoration: none; font-size: 13px;">🔗 Open</a>';
      }
      html += '    </div>';
      html += '    <button class="program-phase-btn program-phase-btn-danger" data-action="delete-resource" data-resource-id="' + res.id + '" style="padding: 4px 10px;">✕</button>';
      html += '  </div>';
    }
  }

  html += '  <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-light);">';
  html += '    <div style="display: flex; gap: 8px; flex-wrap: wrap;">';
  html += '      <input type="text" id="program-add-resource-name" placeholder="Resource name..." style="flex: 1; min-width: 150px; padding: 8px 12px; border: 1px solid var(--border-input); border-radius: 6px; background: var(--bg-input); color: var(--text-primary);" />';
  html += '      <input type="text" id="program-add-resource-url" placeholder="URL (optional)" style="flex: 1.5; min-width: 150px; padding: 8px 12px; border: 1px solid var(--border-input); border-radius: 6px; background: var(--bg-input); color: var(--text-primary);" />';
  html += '      <button class="program-card-continue-btn" id="program-add-resource-btn" style="padding: 8px 20px;">Add Resource</button>';
  html += '    </div>';
  html += '  </div>';

  html += '</div>';
  container.innerHTML = html;

  document.getElementById("program-add-resource-btn").addEventListener("click", function() {
    var name = document.getElementById("program-add-resource-name").value.trim();
    var url = document.getElementById("program-add-resource-url").value.trim();
    if (name) {
      addResource(program.id, name, url);
      document.getElementById("program-add-resource-name").value = "";
      document.getElementById("program-add-resource-url").value = "";
      var updatedProgram = getProgram(program.id);
      if (updatedProgram) {
        renderProgramDetail(updatedProgram);
      }
    }
  });

  var deleteBtns = container.querySelectorAll("[data-action='delete-resource']");
  for (var d = 0; d < deleteBtns.length; d++) {
    deleteBtns[d].addEventListener("click", function() {
      var resourceId = parseFloat(this.dataset.resourceId);
      if (confirm("Delete this resource?")) {
        deleteResource(program.id, resourceId);
        var updatedProgram = getProgram(program.id);
        if (updatedProgram) {
          renderProgramDetail(updatedProgram);
        }
      }
    });
  }
}

// ========================================
// Sessions Tab
// ========================================

function renderSessions(container, program) {
  var sessions = program.sessions || [];

  if (sessions.length === 0) {
    var html = '<div class="program-overview">';
    html += '  <p style="text-align: center; color: var(--text-muted); padding: 20px 0;">No sessions completed yet. Start your first session!</p>';
    if (program.status === "active" && program.steps && program.steps.length > 0) {
      var nextStep = getNextStep(program);
      if (nextStep) {
        html += '  <button class="program-card-continue-btn" id="program-start-session-from-sessions" style="width: 100%;">Start Session →</button>';
      }
    }
    html += '</div>';
    container.innerHTML = html;

    var startBtn = document.getElementById("program-start-session-from-sessions");
    if (startBtn) {
      startBtn.addEventListener("click", function() {
        startSession(program.id);
      });
    }
    return;
  }

  var sortedSessions = [];
  for (var i = sessions.length - 1; i >= 0; i--) {
    sortedSessions.push(sessions[i]);
  }

  var html = '<div class="program-overview">';
  html += '  <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">';
  html += '    <span style="font-weight: 600; color: var(--text-primary);">' + sessions.length + ' Sessions Completed</span>';
  if (program.status === "active") {
    var nextStep = getNextStep(program);
    if (nextStep) {
      html += '    <button class="program-card-continue-btn" id="program-start-session-from-sessions">Start Session →</button>';
    }
  }
  html += '  </div>';

  for (var j = 0; j < sortedSessions.length; j++) {
    var session = sortedSessions[j];
    var difficultyEmoji = session.difficulty === "Hard" ? "🔴" : session.difficulty === "Medium" ? "🟡" : "🟢";

    html += '  <div style="padding: 12px 16px; border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 8px; background: var(--bg-surface);">';
    html += '    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">';
    html += '      <div>';
    html += '        <span style="font-weight: 600; color: var(--text-primary);">' + escapeHtml(session.stepName) + '</span>';
    html += '      </div>';
    html += '      <div style="display: flex; gap: 12px; font-size: 13px; color: var(--text-muted);">';
    html += '        <span>' + difficultyEmoji + ' ' + session.difficulty + '</span>';
    html += '        <span>⭐ ' + session.rating + '/5</span>';
    if (session.duration) {
      html += '        <span>⏱️ ' + session.duration + ' min</span>';
    }
    html += '      </div>';
    html += '    </div>';
    if (session.learning) {
      html += '    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px; font-style: italic;">💡 "' + escapeHtml(session.learning) + '"</div>';
    }
    html += '    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">' + formatDate(session.completedAt) + '</div>';
    html += '  </div>';
  }

  html += '</div>';
  container.innerHTML = html;

  var startBtn = document.getElementById("program-start-session-from-sessions");
  if (startBtn) {
    startBtn.addEventListener("click", function() {
      startSession(program.id);
    });
  }
}

// ========================================
// Start Session with Timer
// ========================================

function startSession(programId) {
  var program = getProgram(programId);
  if (!program) return;

  if (program.status === "completed") {
    alert("🎉 All steps are completed! This program is finished.");
    return;
  }

  var nextStep = getNextStep(program);
  if (!nextStep) {
    if (!program.steps || program.steps.length === 0) {
      alert("You need to add steps first! Go to the Steps tab.");
    } else {
      alert("🎉 All steps are completed!");
    }
    return;
  }

  openSessionModal(programId, nextStep.id, nextStep.name);
}

function openSessionModal(programId, stepId, stepName) {
  var overlay = document.createElement("div");
  overlay.className = "notes-modal-overlay";
  overlay.id = "session-modal-overlay";

  var modal = document.createElement("div");
  modal.className = "notes-modal";
  modal.id = "session-modal";

  var timerSeconds = 0;
  var timerInterval = null;
  var isTimerRunning = false;

  var html = '';
  html += '<button class="notes-modal-close-btn" id="session-modal-close">✕</button>';
  html += '<h3 class="notes-modal-title">⏱️ Session</h3>';
  html += '<p style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">' + escapeHtml(stepName) + '</p>';
  
  // Timer
  html += '<div style="text-align: center; margin: 16px 0;">';
  html += '  <div style="font-size: 48px; font-weight: 700; font-family: monospace; color: var(--primary);" id="session-timer-display">00:00</div>';
  html += '  <div style="display: flex; gap: 8px; justify-content: center; margin-top: 8px;">';
  html += '    <button class="notes-modal-cancel-btn" id="session-timer-start" style="padding: 6px 20px; font-size: 14px;">▶ Start</button>';
  html += '    <button class="notes-modal-cancel-btn" id="session-timer-pause" style="padding: 6px 20px; font-size: 14px; display: none;">⏸ Pause</button>';
  html += '    <button class="notes-modal-cancel-btn" id="session-timer-reset" style="padding: 6px 20px; font-size: 14px;">↺ Reset</button>';
  html += '  </div>';
  html += '</div>';

  html += '<hr style="border: none; border-top: 1px solid var(--border-light); margin: 12px 0;" />';

  html += '<div class="program-session-complete-form">';
  html += '  <label>How was this step?</label>';
  html += '  <div class="difficulty-grid">';
  html += '    <button class="difficulty-btn active" data-difficulty="Medium">Medium</button>';
  html += '    <button class="difficulty-btn" data-difficulty="Hard">Hard</button>';
  html += '    <button class="difficulty-btn" data-difficulty="Easy">Easy</button>';
  html += '  </div>';

  html += '  <label>What did you learn?</label>';
  html += '  <input type="text" id="session-learning" placeholder="e.g. I understood the concept..." />';

  html += '  <label>Rating (1-5)</label>';
  html += '  <div id="rating-stars">';
  for (var i = 1; i <= 5; i++) {
    html += '    <button class="difficulty-btn" data-rating="' + i + '">☆</button>';
  }
  html += '  </div>';

  html += '  <button class="notes-modal-save-btn" id="session-complete-btn" style="margin-top: 12px;">✅ Complete Step</button>';
  html += '</div>';

  modal.innerHTML = html;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  var selectedDifficulty = "Medium";
  var selectedRating = 3;

  function closeModal() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    overlay.remove();
  }

  document.getElementById("session-modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closeModal();
  });

  // ===== Timer Functions =====
  function updateTimerDisplay() {
    var mins = Math.floor(timerSeconds / 60);
    var secs = timerSeconds % 60;
    var display = document.getElementById("session-timer-display");
    if (display) {
      display.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    var startBtn = document.getElementById("session-timer-start");
    var pauseBtn = document.getElementById("session-timer-pause");
    if (startBtn) startBtn.style.display = "none";
    if (pauseBtn) pauseBtn.style.display = "block";
    timerInterval = setInterval(function() {
      timerSeconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function pauseTimer() {
    if (!isTimerRunning) return;
    isTimerRunning = false;
    var startBtn = document.getElementById("session-timer-start");
    var pauseBtn = document.getElementById("session-timer-pause");
    if (startBtn) startBtn.style.display = "block";
    if (pauseBtn) pauseBtn.style.display = "none";
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetTimer() {
    pauseTimer();
    timerSeconds = 0;
    updateTimerDisplay();
    var startBtn = document.getElementById("session-timer-start");
    var pauseBtn = document.getElementById("session-timer-pause");
    if (startBtn) startBtn.style.display = "block";
    if (pauseBtn) pauseBtn.style.display = "none";
  }

  var startBtn = document.getElementById("session-timer-start");
  var pauseBtn = document.getElementById("session-timer-pause");
  var resetBtn = document.getElementById("session-timer-reset");
  
  if (startBtn) startBtn.addEventListener("click", startTimer);
  if (pauseBtn) pauseBtn.addEventListener("click", pauseTimer);
  if (resetBtn) resetBtn.addEventListener("click", resetTimer);

  // ===== Difficulty Buttons =====
  var diffBtns = document.querySelectorAll(".difficulty-btn[data-difficulty]");
  for (var db = 0; db < diffBtns.length; db++) {
    diffBtns[db].addEventListener("click", function() {
      var allBtns = document.querySelectorAll(".difficulty-btn[data-difficulty]");
      for (var ab = 0; ab < allBtns.length; ab++) {
        allBtns[ab].classList.remove("active");
      }
      this.classList.add("active");
      selectedDifficulty = this.dataset.difficulty;
    });
  }

  // ===== Rating Stars =====
  var starBtns = document.querySelectorAll("[data-rating]");
  for (var s = 0; s < starBtns.length; s++) {
    starBtns[s].addEventListener("click", function() {
      var allStars = document.querySelectorAll("[data-rating]");
      var rating = parseInt(this.dataset.rating);
      selectedRating = rating;
      for (var rs = 0; rs < allStars.length; rs++) {
        var starNum = parseInt(allStars[rs].dataset.rating);
        allStars[rs].textContent = starNum <= rating ? "★" : "☆";
        allStars[rs].classList.toggle("active", starNum <= rating);
        if (starNum <= rating) {
          allStars[rs].style.color = "#f5a623";
        } else {
          allStars[rs].style.color = "var(--text-muted)";
        }
      }
    });
    // Set initial stars (3 stars default)
    if (s < 3) {
      starBtns[s].textContent = "★";
      starBtns[s].style.color = "#f5a623";
      starBtns[s].classList.add("active");
    }
  }

  // ===== Complete Step =====
  document.getElementById("session-complete-btn").addEventListener("click", function() {
    pauseTimer();
    
    var learning = document.getElementById("session-learning").value.trim() || "Completed successfully!";
    var duration = Math.ceil(timerSeconds / 60);

    if (confirm("Complete this step? You spent " + duration + " minutes.")) {
      completeStep(programId, stepId, duration, selectedDifficulty, learning, selectedRating);
      closeModal();
      openProgramDetail(programId);
    }
  });

  // ===== Keyboard shortcuts =====
  document.addEventListener("keydown", function(e) {
    if (e.key === " " && document.getElementById("session-modal-overlay")) {
      e.preventDefault();
      if (isTimerRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    }
    if (e.key === "Escape" && document.getElementById("session-modal-overlay")) {
      closeModal();
    }
  });

  var learningInput = document.getElementById("session-learning");
  if (learningInput) {
    learningInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        document.getElementById("session-complete-btn").click();
      }
    });
  }
}

// ========================================
// تصدير الدالة للاستخدام من main.js
// ========================================

window.renderProgramPage = renderProgramPage;

console.log("✅ Program (Learning with Timer & Resources) loaded successfully!");
// @ts-nocheck
// ========================================
// MY LIFE HUB - PROGRAM (Workout Session Tracking)
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
// إنشاء برنامج جديد
// ========================================

function createProgram(name, description, type, goal) {
  goal = goal || "";
  var programs = getAllPrograms();
  var newProgram = {
    id: Date.now() + Math.random() * 1000,
    name: name.trim(),
    description: description.trim(),
    type: type,
    goal: goal,
    status: "active",
    phases: [],
    currentTopicId: null,
    sessions: [],
    workoutLogs: [],
    personalRecords: [],
    totalSessions: 0,
    targetSessions: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  };
  programs.push(newProgram);
  saveAllPrograms(programs);
  return newProgram;
}

// ========================================
// دوال إدارة Phases و Topics
// ========================================

function addPhase(programId, phaseName) {
  var program = getProgram(programId);
  if (!program) return null;

  var newPhase = {
    id: Date.now() + Math.random() * 1000,
    name: phaseName.trim(),
    topics: [],
    isWorkoutDay: program.type === "Workout"
  };

  program.phases.push(newPhase);
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return newPhase;
}

function deletePhase(programId, phaseId) {
  var program = getProgram(programId);
  if (!program) return false;

  var newPhases = [];
  for (var i = 0; i < program.phases.length; i++) {
    if (program.phases[i].id !== phaseId) {
      newPhases.push(program.phases[i]);
    }
  }
  program.phases = newPhases;
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function reorderPhases(programId, phaseIds) {
  var program = getProgram(programId);
  if (!program) return false;

  var newPhases = [];
  for (var i = 0; i < phaseIds.length; i++) {
    for (var j = 0; j < program.phases.length; j++) {
      if (program.phases[j].id === phaseIds[i]) {
        newPhases.push(program.phases[j]);
        break;
      }
    }
  }

  program.phases = newPhases;
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function addTopic(programId, phaseId, topicName) {
  var program = getProgram(programId);
  if (!program) return null;

  var phase = null;
  for (var i = 0; i < program.phases.length; i++) {
    if (program.phases[i].id === phaseId) {
      phase = program.phases[i];
      break;
    }
  }
  if (!phase) return null;

  var newTopic = {
    id: Date.now() + Math.random() * 1000,
    name: topicName.trim(),
    objective: "",
    method: [],
    resources: [],
    completed: false,
    completedAt: null,
    sets: 0,
    reps: 0,
    weight: 0,
    rest: 0,
    notes: "",
    exerciseLogs: []
  };

  phase.topics.push(newTopic);
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return newTopic;
}

function deleteTopic(programId, phaseId, topicId) {
  var program = getProgram(programId);
  if (!program) return false;

  var phase = null;
  for (var i = 0; i < program.phases.length; i++) {
    if (program.phases[i].id === phaseId) {
      phase = program.phases[i];
      break;
    }
  }
  if (!phase) return false;

  var newTopics = [];
  for (var j = 0; j < phase.topics.length; j++) {
    if (phase.topics[j].id !== topicId) {
      newTopics.push(phase.topics[j]);
    }
  }
  phase.topics = newTopics;
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

// ========================================
// دوال إدارة Method
// ========================================

function updateTopicMethod(programId, phaseId, topicId, objective, methodSteps, resources) {
  var program = getProgram(programId);
  if (!program) return false;

  var phase = null;
  for (var i = 0; i < program.phases.length; i++) {
    if (program.phases[i].id === phaseId) {
      phase = program.phases[i];
      break;
    }
  }
  if (!phase) return false;

  var topic = null;
  for (var j = 0; j < phase.topics.length; j++) {
    if (phase.topics[j].id === topicId) {
      topic = phase.topics[j];
      break;
    }
  }
  if (!topic) return false;

  topic.objective = objective.trim();
  topic.method = methodSteps;
  topic.resources = resources;
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function updateWorkoutExercise(programId, phaseId, topicId, sets, reps, weight, rest, notes) {
  var program = getProgram(programId);
  if (!program) return false;

  var phase = null;
  for (var i = 0; i < program.phases.length; i++) {
    if (program.phases[i].id === phaseId) {
      phase = program.phases[i];
      break;
    }
  }
  if (!phase) return false;

  var topic = null;
  for (var j = 0; j < phase.topics.length; j++) {
    if (phase.topics[j].id === topicId) {
      topic = phase.topics[j];
      break;
    }
  }
  if (!topic) return false;

  topic.sets = parseInt(sets) || 0;
  topic.reps = parseInt(reps) || 0;
  topic.weight = parseFloat(weight) || 0;
  topic.rest = parseInt(rest) || 0;
  topic.notes = notes || "";
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function updateTargetSessions(programId, targetSessions) {
  var program = getProgram(programId);
  if (!program) return false;

  program.targetSessions = parseInt(targetSessions) || 0;
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function incrementTotalSessions(programId) {
  var program = getProgram(programId);
  if (!program) return false;

  program.totalSessions = (program.totalSessions || 0) + 1;
  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function getWorkoutProgress(program) {
  var target = program.targetSessions || 0;
  var completed = program.totalSessions || 0;
  var percentage = target === 0 ? 0 : Math.round((completed / target) * 100);
  return {
    target: target,
    completed: completed,
    remaining: Math.max(0, target - completed),
    percentage: Math.min(100, percentage)
  };
}

// ========================================
// دوال الجلسات (Sessions)
// ========================================

function completeWorkoutSession(programId, phaseId, exerciseLogs, difficulty, confidence, note) {
  var program = getProgram(programId);
  if (!program) return false;

  var phase = null;
  for (var i = 0; i < program.phases.length; i++) {
    if (program.phases[i].id === phaseId) {
      phase = program.phases[i];
      break;
    }
  }
  if (!phase) return false;

  var session = {
    id: Date.now() + Math.random() * 1000,
    phaseId: phaseId,
    phaseName: phase.name,
    completedAt: new Date().toISOString(),
    difficulty: difficulty,
    confidence: confidence,
    note: note.trim(),
    exerciseLogs: exerciseLogs
  };

  program.sessions.push(session);
  
  for (var k = 0; k < exerciseLogs.length; k++) {
    program.workoutLogs.push(exerciseLogs[k]);
  }

  program.totalSessions = (program.totalSessions || 0) + 1;

  program.currentTopicId = getNextTopicId(program);

  if (program.targetSessions > 0 && program.totalSessions >= program.targetSessions) {
    program.status = "completed";
    program.completedAt = new Date().toISOString();
  }

  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  updatePersonalRecords(program, exerciseLogs);

  return true;
}

function completeTopic(programId, phaseId, topicId, difficulty, confidence, note) {
  var program = getProgram(programId);
  if (!program) return false;

  var phase = null;
  for (var i = 0; i < program.phases.length; i++) {
    if (program.phases[i].id === phaseId) {
      phase = program.phases[i];
      break;
    }
  }
  if (!phase) return false;

  var topic = null;
  for (var j = 0; j < phase.topics.length; j++) {
    if (phase.topics[j].id === topicId) {
      topic = phase.topics[j];
      break;
    }
  }
  if (!topic) return false;

  var session = {
    id: Date.now() + Math.random() * 1000,
    topicId: topicId,
    topicName: topic.name,
    phaseName: phase.name,
    completedAt: new Date().toISOString(),
    difficulty: difficulty,
    confidence: confidence,
    note: note.trim()
  };

  program.sessions.push(session);
  topic.completed = true;
  topic.completedAt = new Date().toISOString();

  program.currentTopicId = getNextTopicId(program);

  if (program.currentTopicId === null) {
    program.status = "completed";
    program.completedAt = new Date().toISOString();
  }

  program.updatedAt = new Date().toISOString();
  updateProgram(program);
  return true;
}

function getNextTopicId(program) {
  for (var i = 0; i < program.phases.length; i++) {
    for (var j = 0; j < program.phases[i].topics.length; j++) {
      if (!program.phases[i].topics[j].completed) {
        return program.phases[i].topics[j].id;
      }
    }
  }
  return null;
}

function getCurrentTopic(program) {
  if (!program.currentTopicId) return null;
  for (var i = 0; i < program.phases.length; i++) {
    for (var j = 0; j < program.phases[i].topics.length; j++) {
      if (program.phases[i].topics[j].id === program.currentTopicId) {
        return { phase: program.phases[i], topic: program.phases[i].topics[j] };
      }
    }
  }
  return null;
}

// ========================================
// دوال Personal Records
// ========================================

function updatePersonalRecords(program, exerciseLogs) {
  for (var i = 0; i < exerciseLogs.length; i++) {
    var log = exerciseLogs[i];
    if (!log.completed) continue;
    
    var existingPR = null;
    for (var j = 0; j < program.personalRecords.length; j++) {
      if (program.personalRecords[j].exerciseName === log.exerciseName) {
        existingPR = program.personalRecords[j];
        break;
      }
    }
    
    if (existingPR) {
      if (log.weight > existingPR.weight || (log.weight === existingPR.weight && log.reps > existingPR.reps)) {
        existingPR.weight = log.weight;
        existingPR.reps = log.reps;
        existingPR.date = new Date().toISOString();
      }
    } else {
      program.personalRecords.push({
        exerciseName: log.exerciseName,
        weight: log.weight,
        reps: log.reps,
        date: new Date().toISOString()
      });
    }
  }
}

function getPersonalRecords(program) {
  return program.personalRecords || [];
}

// ========================================
// ✅ دالة حساب التقدم المعدلة
// ========================================

function calculateProgress(program) {
  // ✅ إذا كان Workout، استخدم الجلسات
  if (program.type === "Workout") {
    var target = program.targetSessions || 0;
    var completed = program.totalSessions || 0;
    var percentage = target === 0 ? 0 : Math.round((completed / target) * 100);
    return {
      totalTopics: target,
      completedTopics: completed,
      percentage: Math.min(100, percentage)
    };
  }

  // ✅ للأنواع الأخرى، استخدم الموضوعات
  var totalTopics = 0;
  var completedTopics = 0;

  for (var i = 0; i < program.phases.length; i++) {
    for (var j = 0; j < program.phases[i].topics.length; j++) {
      totalTopics++;
      if (program.phases[i].topics[j].completed) completedTopics++;
    }
  }

  var percentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
  return {
    totalTopics: totalTopics,
    completedTopics: completedTopics,
    percentage: percentage
  };
}

function getPhaseProgress(phase) {
  var total = phase.topics.length;
  var completed = 0;
  for (var i = 0; i < phase.topics.length; i++) {
    if (phase.topics[i].completed) completed++;
  }
  return {
    total: total,
    completed: completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100)
  };
}

function getProgramStats(program) {
  var totalSessions = program.sessions.length;
  var progress = calculateProgress(program);
  var workoutProgress = program.type === "Workout" ? getWorkoutProgress(program) : null;

  var now = new Date();
  var weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  var recentSessions = [];
  for (var i = 0; i < program.sessions.length; i++) {
    if (new Date(program.sessions[i].completedAt) >= weekAgo) {
      recentSessions.push(program.sessions[i]);
    }
  }

  return {
    totalSessions: totalSessions,
    recentSessions: recentSessions.length,
    totalTopics: progress.totalTopics,
    completedTopics: progress.completedTopics,
    percentage: progress.percentage,
    workoutProgress: workoutProgress
  };
}

function getExerciseStrengthProgress(program) {
  var progress = {};
  for (var i = 0; i < program.workoutLogs.length; i++) {
    var log = program.workoutLogs[i];
    if (!progress[log.exerciseName]) {
      progress[log.exerciseName] = {
        first: { weight: log.weight, reps: log.reps, date: log.date },
        last: { weight: log.weight, reps: log.reps, date: log.date }
      };
    } else {
      progress[log.exerciseName].last = { weight: log.weight, reps: log.reps, date: log.date };
    }
  }
  return progress;
}

// ========================================
// عرض الصفحة الرئيسية
// ========================================

function renderProgramPage() {
  var app = document.getElementById("app");
  if (!app) return;

  var programs = getAllPrograms();
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
  html += '      <h2 class="program-main-title">🚀 Program</h2>';
  html += '      <p class="program-main-subtitle">Build your own methods for learning, training, routines and personal goals.</p>';
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
    html += '    <div class="program-empty-icon">🚀</div>';
    html += '    <h3 class="program-empty-title">No programs yet</h3>';
    html += '    <p class="program-empty-desc">Create your first program to start building your methods.</p>';
    html += '  </div>';
  }

  if (completedPrograms.length > 0) {
    html += '  <h3 class="program-section-title">✅ Completed</h3>';
    html += '  <div class="program-section-subgrid">';
    for (var k = 0; k < completedPrograms.length; k++) {
      html += renderCompletedCard(completedPrograms[k]);
    }
    html += '  </div>';
  }

  html += '</div>';
  app.innerHTML = html;

  document.getElementById("program-add-btn").addEventListener("click", function() {
    openProgramBuilder();
  });

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

  var typeIcons = {
    "Learning": "📚",
    "Workout": "🏋️",
    "Routine": "🔄",
    "Reading": "📖",
    "Goal": "🎯",
    "Custom": "⚙️"
  };

  var icon = typeIcons[program.type] || "📌";

  var sessionProgress = "";
  if (program.type === "Workout" && stats.workoutProgress) {
    var wp = stats.workoutProgress;
    sessionProgress = wp.completed + '/' + wp.target + ' Sessions';
  }

  var currentTopicName = "Not started";
  var current = getCurrentTopic(program);
  if (current) {
    currentTopicName = current.topic.name;
  } else if (stats.totalTopics > 0 && stats.completedTopics === stats.totalTopics) {
    currentTopicName = "Completed! 🎉";
  }

  var html = '';
  html += '<div class="program-card">';
  html += '  <div class="program-card-header">';
  html += '    <span class="program-card-icon">' + icon + '</span>';
  html += '    <span class="program-card-name">' + escapeHtml(program.name) + '</span>';
  html += '    <span class="program-card-type">' + program.type + '</span>';
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
  html += '      <span>' + (program.type === "Workout" ? sessionProgress : stats.completedTopics + '/' + stats.totalTopics + ' Topics') + '</span>';
  html += '    </div>';
  html += '  </div>';
  html += '  <div class="program-card-stats">';
  html += '    <span class="program-card-stat">📌 Current: ' + escapeHtml(currentTopicName) + '</span>';
  html += '    <span class="program-card-stat">📋 ' + stats.totalSessions + ' Sessions</span>';
  html += '  </div>';
  html += '  <div class="program-card-actions">';
  html += '    <button class="program-card-continue-btn" data-program-id="' + program.id + '">';
  html +=       (stats.totalTopics === 0 ? 'Configure →' : 'Continue →');
  html += '    </button>';
  html += '    <button class="program-card-delete-btn" data-program-id="' + program.id + '">🗑️</button>';
  html += '  </div>';
  html += '</div>';

  return html;
}

function renderCompletedCard(program) {
  var stats = getProgramStats(program);
  var typeIcons = {
    "Learning": "📚",
    "Workout": "🏋️",
    "Routine": "🔄",
    "Reading": "📖",
    "Goal": "🎯",
    "Custom": "⚙️"
  };
  var icon = typeIcons[program.type] || "📌";

  var html = '';
  html += '<div class="program-card-small">';
  html += '  <div class="program-card-small-info">';
  html += '    <div class="program-card-small-name">' + icon + ' ' + escapeHtml(program.name) + '</div>';
  html += '    <div class="program-card-small-progress">' + stats.totalSessions + ' Sessions • Completed</div>';
  html += '  </div>';
  html += '  <button class="program-card-small-btn" data-program-id="' + program.id + '">View</button>';
  html += '</div>';

  return html;
}

// ========================================
// Program Builder
// ========================================

function openProgramBuilder() {
  var overlay = document.createElement("div");
  overlay.className = "notes-modal-overlay";
  overlay.id = "program-builder-overlay";

  var modal = document.createElement("div");
  modal.className = "notes-modal";
  modal.id = "program-builder-modal";

  var selectedType = "Learning";

  modal.innerHTML = `
    <button class="notes-modal-close-btn" id="program-builder-close">✕</button>
    <h3 class="notes-modal-title">🚀 Create Program</h3>

    <div class="program-builder-step">
      <div class="program-builder-step-title">Step 1 — Basic Information</div>
      <label class="notes-modal-label">Program Name</label>
      <input type="text" class="notes-modal-input" id="program-builder-name" placeholder="e.g. Learn Python" />

      <label class="notes-modal-label">Description</label>
      <textarea class="notes-modal-textarea" id="program-builder-desc" rows="3" placeholder="Describe your program..."></textarea>
      
      <label class="notes-modal-label">Goal (optional)</label>
      <input type="text" class="notes-modal-input" id="program-builder-goal" placeholder="e.g. Build strength, Learn fundamentals..." />
    </div>

    <div class="program-builder-step">
      <div class="program-builder-step-title">Step 2 — Program Type</div>
      <div class="program-builder-types">
        ${["Learning", "Workout", "Routine", "Reading", "Goal", "Custom"].map(function(type) {
          return '<button class="program-builder-type-btn ' + (type === selectedType ? 'active' : '') + '" data-type="' + type + '">' +
            '<span class="program-builder-type-icon">' + getTypeIcon(type) + '</span>' +
            '<span class="program-builder-type-name">' + type + '</span>' +
          '</button>';
        }).join('')}
      </div>
    </div>

    <div class="notes-modal-actions">
      <button class="notes-modal-cancel-btn" id="program-builder-cancel">Cancel</button>
      <button class="notes-modal-save-btn" id="program-builder-create">Create Program →</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  var typeBtns = document.querySelectorAll(".program-builder-type-btn");
  for (var i = 0; i < typeBtns.length; i++) {
    typeBtns[i].addEventListener("click", function() {
      var allBtns = document.querySelectorAll(".program-builder-type-btn");
      for (var j = 0; j < allBtns.length; j++) {
        allBtns[j].classList.remove("active");
      }
      this.classList.add("active");
      selectedType = this.dataset.type;
    });
  }

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

    var program = createProgram(name, desc, selectedType, goal);
    closeModal();
    openProgramDetail(program.id);
  });
}

function getTypeIcon(type) {
  var icons = {
    "Learning": "📚",
    "Workout": "🏋️",
    "Routine": "🔄",
    "Reading": "📖",
    "Goal": "🎯",
    "Custom": "⚙️"
  };
  return icons[type] || "📌";
}

// ========================================
// Program Detail
// ========================================

var currentProgramId = null;
var currentTab = "overview";
var editingTopicId = null;

function openProgramDetail(programId) {
  var program = getProgram(programId);
  if (!program) {
    renderProgramPage();
    return;
  }

  currentProgramId = programId;
  currentTab = "overview";
  editingTopicId = null;

  renderProgramDetail(program);
}

function renderProgramDetail(program) {
  var app = document.getElementById("app");
  if (!app) return;

  var stats = getProgramStats(program);
  var typeIcons = {
    "Learning": "📚",
    "Workout": "🏋️",
    "Routine": "🔄",
    "Reading": "📖",
    "Goal": "🎯",
    "Custom": "⚙️"
  };
  var icon = typeIcons[program.type] || "📌";

  var isWorkout = program.type === "Workout";

  var html = '';
  html += '<div class="program-detail-container">';
  html += '  <div class="program-detail-header">';
  html += '    <div class="program-detail-title-area">';
  html += '      <span class="program-detail-icon">' + icon + '</span>';
  html += '      <div>';
  html += '        <h2 class="program-detail-name">' + escapeHtml(program.name) + '</h2>';
  html += '        <span class="program-detail-type">' + program.type + ' • ' + program.status + '</span>';
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

  html += '  <div style="margin-bottom: 20px; background: var(--bg-card); padding: 16px 20px; border-radius: 12px; border: 1px solid var(--border-color);">';
  html += '    <div style="display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); margin-bottom: 6px;">';
  html += '      <span>Progress</span>';
  html += '      <span>' + stats.percentage + '%</span>';
  html += '    </div>';
  html += '    <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 10px; overflow: hidden;">';
  html += '      <div style="height: 100%; width: ' + stats.percentage + '%; background: var(--primary-gradient); border-radius: 10px; transition: width 0.6s ease;"></div>';
  html += '    </div>';
  html += '  </div>';

  html += '  <div class="program-detail-tabs">';
  html += '    <button class="program-detail-tab ' + (currentTab === 'overview' ? 'active' : '') + '" data-tab="overview">Overview</button>';
  html += '    <button class="program-detail-tab ' + (currentTab === 'structure' ? 'active' : '') + '" data-tab="structure">Structure</button>';
  html += '    <button class="program-detail-tab ' + (currentTab === 'method' ? 'active' : '') + '" data-tab="method">Method</button>';
  html += '    <button class="program-detail-tab ' + (currentTab === 'sessions' ? 'active' : '') + '" data-tab="sessions">Sessions</button>';
  html += '    <button class="program-detail-tab ' + (currentTab === 'progress' ? 'active' : '') + '" data-tab="progress">Progress</button>';
  if (isWorkout) {
    html += '    <button class="program-detail-tab ' + (currentTab === 'pr' ? 'active' : '') + '" data-tab="pr">🏆 PRs</button>';
  }
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
    case "structure":
      renderStructure(content, program);
      break;
    case "method":
      renderMethod(content, program);
      break;
    case "sessions":
      renderSessions(content, program);
      break;
    case "progress":
      renderProgress(content, program);
      break;
    case "pr":
      renderPRs(content, program);
      break;
  }
}

// ========================================
// Overview Tab
// ========================================

function renderOverview(container, program) {
  var stats = getProgramStats(program);
  var isWorkout = program.type === "Workout";

  var html = '';
  html += '<div class="program-overview">';
  html += '  <div class="program-overview-grid">';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Purpose</span>';
  html += '      <span class="program-overview-value">' + (escapeHtml(program.description) || "No description") + '</span>';
  html += '    </div>';
  if (program.goal) {
    html += '    <div class="program-overview-item">';
    html += '      <span class="program-overview-label">Goal</span>';
    html += '      <span class="program-overview-value">' + escapeHtml(program.goal) + '</span>';
    html += '    </div>';
  }
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Type</span>';
  html += '      <span class="program-overview-value">' + program.type + '</span>';
  html += '    </div>';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Status</span>';
  html += '      <span class="program-overview-value">' + program.status + '</span>';
  html += '    </div>';
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Progress</span>';
  html += '      <span class="program-overview-value">' + stats.percentage + '%</span>';
  html += '    </div>';
  
  if (isWorkout && stats.workoutProgress) {
    var wp = stats.workoutProgress;
    html += '    <div class="program-overview-item">';
    html += '      <span class="program-overview-label">Sessions</span>';
    html += '      <span class="program-overview-value">' + wp.completed + ' / ' + wp.target + '</span>';
    html += '    </div>';
  } else {
    html += '    <div class="program-overview-item">';
    html += '      <span class="program-overview-label">Topics</span>';
    html += '      <span class="program-overview-value">' + stats.completedTopics + '/' + stats.totalTopics + '</span>';
    html += '    </div>';
  }
  
  html += '    <div class="program-overview-item">';
  html += '      <span class="program-overview-label">Total Sessions</span>';
  html += '      <span class="program-overview-value">' + stats.totalSessions + '</span>';
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

  if (isWorkout) {
    var wp2 = stats.workoutProgress || { target: 0, completed: 0 };
    html += '  <div style="margin-top: 12px; padding: 12px 16px; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: 8px;">';
    html += '    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">';
    html += '      <div>';
    html += '        <span style="font-size: 13px; color: var(--text-muted);">Target Sessions</span>';
    html += '        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">';
    html += '          <input type="number" id="target-sessions-input" value="' + wp2.target + '" min="0" style="width: 80px; padding: 6px 10px; border: 1px solid var(--border-input); border-radius: 6px; background: var(--bg-input); color: var(--text-primary); font-size: 14px;" />';
    html += '          <button class="program-card-continue-btn" id="update-target-sessions" style="padding: 6px 16px; font-size: 14px;">Update</button>';
    html += '        </div>';
    html += '      </div>';
    html += '      <div style="text-align: right;">';
    html += '        <span style="font-size: 13px; color: var(--text-muted);">Progress</span>';
    html += '        <div style="font-size: 18px; font-weight: 700; color: var(--primary);">' + wp2.completed + ' / ' + wp2.target + '</div>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
  }

  if (program.status === "active" && stats.totalTopics > 0) {
    html += '  <button class="program-card-continue-btn" id="program-start-session" style="width: 100%; margin-top: 12px;">';
    html +=    (program.currentTopicId ? 'Continue Session →' : 'Start Session →');
    html += '  </button>';
  }

  if (program.status === "completed") {
    html += '  <div style="text-align: center; padding: 12px; background: var(--success); color: white; border-radius: 8px; margin-top: 12px;">';
    html += '    🎉 Program Completed!';
    html += '  </div>';
  }

  html += '</div>';
  container.innerHTML = html;

  var updateBtn = document.getElementById("update-target-sessions");
  if (updateBtn) {
    updateBtn.addEventListener("click", function() {
      var input = document.getElementById("target-sessions-input");
      var value = parseInt(input.value);
      if (value >= 0) {
        updateTargetSessions(program.id, value);
        var updatedProgram = getProgram(program.id);
        if (updatedProgram) {
          renderProgramDetail(updatedProgram);
        }
      }
    });
  }

  var startBtn = document.getElementById("program-start-session");
  if (startBtn) {
    startBtn.addEventListener("click", function() {
      startSession(program.id);
    });
  }
}

// ========================================
// Structure Tab
// ========================================

function renderStructure(container, program) {
  var isWorkout = program.type === "Workout";
  var html = '<div class="program-structure" id="program-structure-container">';

  for (var i = 0; i < program.phases.length; i++) {
    var phase = program.phases[i];
    var phaseProgress = getPhaseProgress(phase);
    html += '<div class="program-phase" data-phase-id="' + phase.id + '" draggable="true">';
    html += '  <div class="program-phase-header">';
    html += '    <span class="program-phase-name">📌 ' + escapeHtml(phase.name) + '</span>';
    html += '    <span style="font-size: 12px; color: var(--text-muted);">' + phaseProgress.completed + '/' + phaseProgress.total + '</span>';
    html += '    <div class="program-phase-actions">';
    html += '      <button class="program-phase-btn program-add-topic-btn" data-phase-id="' + phase.id + '">＋</button>';
    html += '      <button class="program-phase-btn program-phase-btn-danger program-delete-phase-btn" data-phase-id="' + phase.id + '">✕</button>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="program-topics">';

    for (var j = 0; j < phase.topics.length; j++) {
      var topic = phase.topics[j];
      html += '<div class="program-topic ' + (topic.completed ? 'program-topic-completed' : '') + '" data-topic-id="' + topic.id + '" data-phase-id="' + phase.id + '">';
      html += '  <span class="program-topic-status">' + (topic.completed ? '✅' : '⬜') + '</span>';
      html += '  <span class="program-topic-name">' + escapeHtml(topic.name) + '</span>';
      if (isWorkout) {
        html += '  <span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">';
        html +=    topic.sets + 'x' + topic.reps + ' ' + (topic.weight > 0 ? '· ' + topic.weight + 'kg' : '');
        html += '  </span>';
      }
      html += '  <div class="program-topic-actions">';
      html += '    <button class="program-topic-btn program-edit-topic-btn" data-topic-id="' + topic.id + '" data-phase-id="' + phase.id + '">✏️</button>';
      html += '    <button class="program-topic-btn program-topic-btn-danger program-delete-topic-btn" data-topic-id="' + topic.id + '" data-phase-id="' + phase.id + '">✕</button>';
      html += '  </div>';
      html += '</div>';
    }

    html += '    <button class="program-add-topic-btn" data-phase-id="' + phase.id + '">＋ Add Topic</button>';
    html += '  </div>';
    html += '</div>';
  }

  html += '  <button class="program-add-phase-btn" id="program-add-phase">＋ Add Phase</button>';
  html += '</div>';

  container.innerHTML = html;

  var addPhaseBtn = document.getElementById("program-add-phase");
  if (addPhaseBtn) {
    addPhaseBtn.addEventListener("click", function() {
      var name = prompt("Enter phase name:");
      if (name && name.trim()) {
        var result = addPhase(program.id, name.trim());
        if (result) {
          var updatedProgram = getProgram(program.id);
          if (updatedProgram) {
            renderProgramDetail(updatedProgram);
          }
        }
      }
    });
  }

  var addTopicBtns = document.querySelectorAll(".program-add-topic-btn");
  for (var a = 0; a < addTopicBtns.length; a++) {
    addTopicBtns[a].addEventListener("click", function(e) {
      e.stopPropagation();
      var phaseId = parseFloat(this.dataset.phaseId);
      var name = prompt("Enter topic name:");
      if (name && name.trim()) {
        var result = addTopic(program.id, phaseId, name.trim());
        if (result) {
          var updatedProgram = getProgram(program.id);
          if (updatedProgram) {
            renderProgramDetail(updatedProgram);
          }
        }
      }
    });
  }

  var deletePhaseBtns = document.querySelectorAll(".program-delete-phase-btn");
  for (var b = 0; b < deletePhaseBtns.length; b++) {
    deletePhaseBtns[b].addEventListener("click", function(e) {
      e.stopPropagation();
      var phaseId = parseFloat(this.dataset.phaseId);
      if (confirm("Delete this phase and all its topics?")) {
        deletePhase(program.id, phaseId);
        var updatedProgram = getProgram(program.id);
        if (updatedProgram) {
          renderProgramDetail(updatedProgram);
        }
      }
    });
  }

  var deleteTopicBtns = document.querySelectorAll(".program-delete-topic-btn");
  for (var c = 0; c < deleteTopicBtns.length; c++) {
    deleteTopicBtns[c].addEventListener("click", function(e) {
      e.stopPropagation();
      var phaseId = parseFloat(this.dataset.phaseId);
      var topicId = parseFloat(this.dataset.topicId);
      if (confirm("Delete this topic?")) {
        deleteTopic(program.id, phaseId, topicId);
        var updatedProgram = getProgram(program.id);
        if (updatedProgram) {
          renderProgramDetail(updatedProgram);
        }
      }
    });
  }

  var editTopicBtns = document.querySelectorAll(".program-edit-topic-btn");
  for (var d = 0; d < editTopicBtns.length; d++) {
    editTopicBtns[d].addEventListener("click", function(e) {
      e.stopPropagation();
      var topicId = parseFloat(this.dataset.topicId);
      var phaseId = parseFloat(this.dataset.phaseId);
      editingTopicId = topicId;
      currentTab = "method";
      window._editingPhaseId = phaseId;
      var updatedProgram = getProgram(program.id);
      if (updatedProgram) {
        renderProgramDetail(updatedProgram);
      }
    });
  }

  var topics = document.querySelectorAll(".program-topic");
  for (var e = 0; e < topics.length; e++) {
    topics[e].addEventListener("click", function() {
      var topicId = parseFloat(this.dataset.topicId);
      var phaseId = parseFloat(this.dataset.phaseId);
      editingTopicId = topicId;
      currentTab = "method";
      window._editingPhaseId = phaseId;
      var updatedProgram = getProgram(program.id);
      if (updatedProgram) {
        renderProgramDetail(updatedProgram);
      }
    });
  }

  setupDragAndDrop(program.id);
}

// ========================================
// Drag & Drop
// ========================================

function setupDragAndDrop(programId) {
  var container = document.getElementById("program-structure-container");
  if (!container) return;

  var dragSrcIndex = null;

  var phases = document.querySelectorAll(".program-phase");
  for (var i = 0; i < phases.length; i++) {
    phases[i].addEventListener("dragstart", function(e) {
      dragSrcIndex = this;
      this.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", this.dataset.phaseId);
    });

    phases[i].addEventListener("dragend", function(e) {
      this.classList.remove("dragging");
      var allPhases = document.querySelectorAll(".program-phase");
      for (var j = 0; j < allPhases.length; j++) {
        allPhases[j].classList.remove("drag-over");
      }
    });

    phases[i].addEventListener("dragover", function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (this !== dragSrcIndex) {
        this.classList.add("drag-over");
      }
    });

    phases[i].addEventListener("dragleave", function(e) {
      this.classList.remove("drag-over");
    });

    phases[i].addEventListener("drop", function(e) {
      e.preventDefault();
      this.classList.remove("drag-over");

      var draggedId = parseFloat(e.dataTransfer.getData("text/plain"));
      var targetId = parseFloat(this.dataset.phaseId);

      if (draggedId === targetId) return;

      var program = getProgram(programId);
      if (!program) return;

      var phaseIds = [];
      for (var k = 0; k < program.phases.length; k++) {
        phaseIds.push(program.phases[k].id);
      }

      var draggedIndex = -1;
      var targetIndex = -1;
      for (var m = 0; m < phaseIds.length; m++) {
        if (phaseIds[m] === draggedId) draggedIndex = m;
        if (phaseIds[m] === targetId) targetIndex = m;
      }

      if (draggedIndex === -1 || targetIndex === -1) return;

      phaseIds.splice(draggedIndex, 1);
      phaseIds.splice(targetIndex, 0, draggedId);

      reorderPhases(programId, phaseIds);
      var updatedProgram = getProgram(programId);
      if (updatedProgram) {
        renderProgramDetail(updatedProgram);
      }
    });
  }
}

// ========================================
// Method Tab
// ========================================

function renderMethod(container, program) {
  var isWorkout = program.type === "Workout";
  
  var phaseId = window._editingPhaseId || null;
  var topicId = editingTopicId || null;

  if (!topicId || !phaseId) {
    for (var i = 0; i < program.phases.length; i++) {
      var found = false;
      for (var j = 0; j < program.phases[i].topics.length; j++) {
        if (!program.phases[i].topics[j].completed) {
          phaseId = program.phases[i].id;
          topicId = program.phases[i].topics[j].id;
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }

  if (!topicId && program.phases.length > 0 && program.phases[0].topics.length > 0) {
    phaseId = program.phases[0].id;
    topicId = program.phases[0].topics[0].id;
  }

  if (!topicId || !phaseId) {
    container.innerHTML = '<div class="program-method-container"><p style="text-align: center; color: var(--text-muted); padding: 40px 0;">No topics available. Add topics in the Structure tab first.</p></div>';
    return;
  }

  var phase = null;
  for (var p = 0; p < program.phases.length; p++) {
    if (program.phases[p].id === phaseId) {
      phase = program.phases[p];
      break;
    }
  }
  if (!phase) {
    container.innerHTML = '<p style="color: var(--text-muted);">Phase not found.</p>';
    return;
  }

  var topic = null;
  for (var t = 0; t < phase.topics.length; t++) {
    if (phase.topics[t].id === topicId) {
      topic = phase.topics[t];
      break;
    }
  }
  if (!topic) {
    container.innerHTML = '<p style="color: var(--text-muted);">Topic not found.</p>';
    return;
  }

  window._currentPhaseId = phaseId;
  window._currentTopicId = topicId;

  var methodSteps = topic.method || [];
  var resources = topic.resources || [];

  var html = '<div class="program-method-container" id="program-method-container">';
  html += '  <h3 class="program-method-topic-title">' + escapeHtml(topic.name) + '</h3>';
  html += '  <p class="program-method-topic-sub">in ' + escapeHtml(phase.name) + '</p>';

  if (isWorkout) {
    html += '  <div class="program-method-workout-fields">';
    html += '    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin-bottom: 16px;">';
    html += '      <div><label class="program-method-objective-label">Sets</label><input type="number" class="program-method-objective-input" id="workout-sets" value="' + (topic.sets || 0) + '" min="0" /></div>';
    html += '      <div><label class="program-method-objective-label">Reps</label><input type="number" class="program-method-objective-input" id="workout-reps" value="' + (topic.reps || 0) + '" min="0" /></div>';
    html += '      <div><label class="program-method-objective-label">Weight (kg)</label><input type="number" class="program-method-objective-input" id="workout-weight" value="' + (topic.weight || 0) + '" min="0" step="0.5" /></div>';
    html += '      <div><label class="program-method-objective-label">Rest (sec)</label><input type="number" class="program-method-objective-input" id="workout-rest" value="' + (topic.rest || 0) + '" min="0" /></div>';
    html += '    </div>';
    html += '    <div><label class="program-method-objective-label">Notes</label><input type="text" class="program-method-objective-input" id="workout-notes" value="' + escapeHtml(topic.notes || '') + '" placeholder="Exercise notes..." /></div>';
    html += '  </div>';
  }

  html += '  <div class="program-method-objective">';
  html += '    <label class="program-method-objective-label">Objective</label>';
  html += '    <input type="text" class="program-method-objective-input" id="method-objective" value="' + escapeHtml(topic.objective || '') + '" placeholder="What\'s the goal of this topic?" />';
  html += '  </div>';

  html += '  <div class="program-method-steps">';
  html += '    <label class="program-method-steps-label">Learning Method</label>';
  html += '    <div id="method-steps-list">';
  for (var s = 0; s < methodSteps.length; s++) {
    html += '      <div class="program-method-step">';
    html += '        <span class="program-method-step-icon">' + (s + 1) + '.</span>';
    html += '        <span class="program-method-step-text">' + escapeHtml(methodSteps[s]) + '</span>';
    html += '        <div class="program-method-step-actions">';
    html += '          <button class="program-method-step-btn program-method-step-btn-danger" data-action="remove-step" data-index="' + s + '">✕</button>';
    html += '        </div>';
    html += '      </div>';
  }
  html += '    </div>';
  html += '    <div class="program-method-add-step">';
  html += '      <input type="text" class="program-method-add-step-input" id="method-new-step" placeholder="Add a step..." />';
  html += '      <button class="program-method-add-step-btn" id="method-add-step">Add</button>';
  html += '    </div>';
  html += '  </div>';

  html += '  <div class="program-method-resources">';
  html += '    <label class="program-method-resources-label">Resources</label>';
  html += '    <div id="method-resources-list">';
  for (var r = 0; r < resources.length; r++) {
    html += '      <div class="program-method-resource">';
    html += '        <span class="program-method-resource-name">📖 ' + escapeHtml(resources[r].name) + '</span>';
    if (resources[r].url) {
      html += '        <a href="' + escapeHtml(resources[r].url) + '" target="_blank" class="program-method-resource-url">🔗</a>';
    }
    html += '        <div class="program-method-step-actions">';
    html += '          <button class="program-method-step-btn program-method-step-btn-danger" data-action="remove-resource" data-index="' + r + '">✕</button>';
    html += '        </div>';
    html += '      </div>';
  }
  html += '    </div>';
  html += '    <div class="program-method-add-resource">';
  html += '      <input type="text" class="program-method-add-resource-input" id="method-resource-name" placeholder="Resource name..." />';
  html += '      <input type="text" class="program-method-add-resource-input" id="method-resource-url" placeholder="URL (optional)" style="flex: 0.7;" />';
  html += '      <button class="program-method-add-resource-btn" id="method-add-resource">Add</button>';
  html += '    </div>';
  html += '  </div>';

  html += '  <button class="program-method-save-btn" id="method-save">💾 Save Method</button>';
  html += '</div>';

  container.innerHTML = html;

  var addStepBtn = document.getElementById("method-add-step");
  if (addStepBtn) {
    addStepBtn.addEventListener("click", function() {
      var input = document.getElementById("method-new-step");
      var step = input.value.trim();
      if (step) {
        methodSteps.push(step);
        input.value = "";
        renderMethod(container, program);
      }
    });
  }

  var newStepInput = document.getElementById("method-new-step");
  if (newStepInput) {
    newStepInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        document.getElementById("method-add-step").click();
      }
    });
  }

  var removeStepBtns = document.querySelectorAll("[data-action='remove-step']");
  for (var rs = 0; rs < removeStepBtns.length; rs++) {
    removeStepBtns[rs].addEventListener("click", function() {
      var index = parseInt(this.dataset.index);
      methodSteps.splice(index, 1);
      renderMethod(container, program);
    });
  }

  var addResourceBtn = document.getElementById("method-add-resource");
  if (addResourceBtn) {
    addResourceBtn.addEventListener("click", function() {
      var name = document.getElementById("method-resource-name").value.trim();
      var url = document.getElementById("method-resource-url").value.trim();
      if (name) {
        resources.push({ name: name, url: url });
        document.getElementById("method-resource-name").value = "";
        document.getElementById("method-resource-url").value = "";
        renderMethod(container, program);
      }
    });
  }

  var resourceNameInput = document.getElementById("method-resource-name");
  if (resourceNameInput) {
    resourceNameInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        document.getElementById("method-add-resource").click();
      }
    });
  }

  var removeResourceBtns = document.querySelectorAll("[data-action='remove-resource']");
  for (var rr = 0; rr < removeResourceBtns.length; rr++) {
    removeResourceBtns[rr].addEventListener("click", function() {
      var index = parseInt(this.dataset.index);
      resources.splice(index, 1);
      renderMethod(container, program);
    });
  }

  var saveBtn = document.getElementById("method-save");
  if (saveBtn) {
    saveBtn.addEventListener("click", function() {
      var result = false;
      
      if (isWorkout) {
        var sets = document.getElementById("workout-sets")?.value || 0;
        var reps = document.getElementById("workout-reps")?.value || 0;
        var weight = document.getElementById("workout-weight")?.value || 0;
        var rest = document.getElementById("workout-rest")?.value || 0;
        var notes = document.getElementById("workout-notes")?.value || "";
        
        result = updateWorkoutExercise(program.id, phaseId, topicId, sets, reps, weight, rest, notes);
      } else {
        var objective = document.getElementById("method-objective").value.trim();
        result = updateTopicMethod(program.id, phaseId, topicId, objective, methodSteps, resources);
      }
      
      if (result) {
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
  var sessions = program.sessions;

  if (sessions.length === 0) {
    var html = '<div class="program-overview">';
    html += '  <p style="text-align: center; color: var(--text-muted); padding: 20px 0;">No sessions completed yet. Start a session to track your progress.</p>';
    if (program.status === "active") {
      html += '  <button class="program-card-continue-btn" id="program-start-session-from-sessions" style="width: 100%;">Start Session →</button>';
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
    html += '    <button class="program-card-continue-btn" id="program-start-session-from-sessions">Start Session →</button>';
  }
  html += '  </div>';

  for (var j = 0; j < sortedSessions.length; j++) {
    var session = sortedSessions[j];
    var difficultyEmoji = session.difficulty === "Hard" ? "🔴" : session.difficulty === "Medium" ? "🟡" : "🟢";

    html += '  <div style="padding: 12px 16px; border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 8px; background: var(--bg-surface);">';
    html += '    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">';
    html += '      <div>';
    html += '        <span style="font-weight: 600; color: var(--text-primary);">' + escapeHtml(session.phaseName) + '</span>';
    if (session.topicName) {
      html += '        <span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">' + escapeHtml(session.topicName) + '</span>';
    }
    html += '      </div>';
    html += '      <div style="display: flex; gap: 12px; font-size: 13px; color: var(--text-muted);">';
    html += '        <span>' + difficultyEmoji + ' ' + session.difficulty + '</span>';
    html += '        <span>⭐ ' + session.confidence + '/5</span>';
    html += '      </div>';
    html += '    </div>';
    if (session.note) {
      html += '    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px; font-style: italic;">"' + escapeHtml(session.note) + '"</div>';
    }
    if (session.exerciseLogs && session.exerciseLogs.length > 0) {
      var logText = '';
      for (var k = 0; k < session.exerciseLogs.length; k++) {
        if (k > 0) logText += ' | ';
        logText += escapeHtml(session.exerciseLogs[k].exerciseName) + ': ' + (session.exerciseLogs[k].setsCompleted || 0) + ' sets · ' + session.exerciseLogs[k].weight + 'kg';
      }
      html += '    <div style="margin-top: 6px; font-size: 12px; color: var(--text-muted);">' + logText + '</div>';
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
// Progress Tab
// ========================================

function renderProgress(container, program) {
  var stats = getProgramStats(program);
  var isWorkout = program.type === "Workout";
  var strengthProgress = isWorkout ? getExerciseStrengthProgress(program) : null;

  var html = '<div class="program-progress">';
  html += '  <div class="program-progress-overall">';
  html += '    <div class="program-progress-big-number">' + stats.percentage + '%</div>';
  html += '    <div class="program-progress-big-label">Overall Progress</div>';
  
  if (isWorkout && stats.workoutProgress) {
    var wp = stats.workoutProgress;
    html += '    <div style="font-size: 14px; color: var(--text-muted); margin-top: 4px;">' + wp.completed + ' / ' + wp.target + ' Sessions</div>';
  } else {
    html += '    <div style="font-size: 14px; color: var(--text-muted); margin-top: 4px;">' + stats.completedTopics + ' / ' + stats.totalTopics + ' Topics</div>';
  }
  html += '  </div>';

  html += '  <div style="margin-bottom: 20px;">';
  for (var i = 0; i < program.phases.length; i++) {
    var phase = program.phases[i];
    var phaseProgress = getPhaseProgress(phase);
    html += '    <div class="program-progress-phase">';
    html += '      <span class="program-progress-phase-name">' + escapeHtml(phase.name) + '</span>';
    html += '      <div class="program-progress-phase-bar">';
    html += '        <div class="program-progress-phase-fill" style="width: ' + phaseProgress.percentage + '%"></div>';
    html += '      </div>';
    html += '      <span class="program-progress-phase-percent">' + phaseProgress.percentage + '%</span>';
    html += '    </div>';
  }
  html += '  </div>';

  html += '  <div class="program-progress-stats">';
  html += '    <div class="program-progress-stat"><div class="program-progress-stat-number">' + stats.totalSessions + '</div><div class="program-progress-stat-label">Total Sessions</div></div>';
  html += '    <div class="program-progress-stat"><div class="program-progress-stat-number">' + stats.recentSessions + '</div><div class="program-progress-stat-label">This Week</div></div>';
  
  if (isWorkout && stats.workoutProgress) {
    var wp2 = stats.workoutProgress;
    html += '    <div class="program-progress-stat"><div class="program-progress-stat-number">' + wp2.remaining + '</div><div class="program-progress-stat-label">Remaining</div></div>';
  } else {
    html += '    <div class="program-progress-stat"><div class="program-progress-stat-number">' + stats.completedTopics + '/' + stats.totalTopics + '</div><div class="program-progress-stat-label">Topics Completed</div></div>';
  }
  
  html += '    <div class="program-progress-stat"><div class="program-progress-stat-number">' + program.phases.length + '</div><div class="program-progress-stat-label">Phases</div></div>';
  html += '  </div>';

  if (isWorkout && strengthProgress && Object.keys(strengthProgress).length > 0) {
    html += '  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-light);">';
    html += '    <h4 style="font-family: var(--font-handwritten); font-size: 18px; color: var(--text-primary); margin-bottom: 12px;">💪 Strength Progress</h4>';
    var keys = Object.keys(strengthProgress);
    for (var k = 0; k < keys.length; k++) {
      var name = keys[k];
      var data = strengthProgress[name];
      html += '    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border-light); font-size: 14px;">';
      html += '      <span style="color: var(--text-primary);">' + escapeHtml(name) + '</span>';
      html += '      <span style="color: var(--text-muted);">' + data.first.weight + 'kg → ' + data.last.weight + 'kg ' + (data.last.weight > data.first.weight ? '📈' : data.last.weight < data.first.weight ? '📉' : '➡️') + '</span>';
      html += '    </div>';
    }
    html += '  </div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// ========================================
// PRs Tab
// ========================================

function renderPRs(container, program) {
  var prs = getPersonalRecords(program);

  if (prs.length === 0) {
    container.innerHTML = '<div class="program-overview"><p style="text-align: center; color: var(--text-muted); padding: 40px 0;">No personal records yet. Complete more sessions to track your PRs! 🏆</p></div>';
    return;
  }

  var sortedPRs = [];
  for (var i = 0; i < prs.length; i++) {
    sortedPRs.push(prs[i]);
  }
  sortedPRs.sort(function(a, b) { return b.weight - a.weight; });

  var html = '<div class="program-overview"><h4 style="font-family: var(--font-handwritten); font-size: 20px; color: var(--text-primary); margin-bottom: 16px;">🏆 Personal Records</h4>';

  for (var j = 0; j < sortedPRs.length; j++) {
    var pr = sortedPRs[j];
    html += '  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 8px; background: var(--bg-surface);">';
    html += '    <div><span style="font-weight: 600; color: var(--text-primary);">' + escapeHtml(pr.exerciseName) + '</span></div>';
    html += '    <div style="display: flex; gap: 16px; align-items: center;">';
    html += '      <span style="font-weight: 700; color: var(--primary);">' + pr.weight + 'kg</span>';
    html += '      <span style="color: var(--text-muted);">× ' + pr.reps + '</span>';
    html += '      <span style="font-size: 12px; color: var(--text-muted);">' + formatDate(pr.date) + '</span>';
    html += '      <span style="font-size: 18px;">🏆</span>';
    html += '    </div>';
    html += '  </div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// ========================================
// Start Session
// ========================================

function startSession(programId) {
  var program = getProgram(programId);
  if (!program) return;

  if (program.type === "Workout") {
    var wp = getWorkoutProgress(program);
    if (wp.target > 0 && wp.completed >= wp.target) {
      alert("🎉 You've completed all " + wp.target + " sessions! This program is finished.");
      return;
    }
  }

  var isWorkout = program.type === "Workout";

  var targetPhaseId = null;
  var targetTopicId = null;

  if (program.currentTopicId) {
    for (var i = 0; i < program.phases.length; i++) {
      var found = false;
      for (var j = 0; j < program.phases[i].topics.length; j++) {
        if (program.phases[i].topics[j].id === program.currentTopicId) {
          targetPhaseId = program.phases[i].id;
          targetTopicId = program.currentTopicId;
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }

  if (!targetTopicId) {
    for (var p = 0; p < program.phases.length; p++) {
      var found2 = false;
      for (var t = 0; t < program.phases[p].topics.length; t++) {
        if (!program.phases[p].topics[t].completed) {
          targetPhaseId = program.phases[p].id;
          targetTopicId = program.phases[p].topics[t].id;
          found2 = true;
          break;
        }
      }
      if (found2) break;
    }
  }

  if (!targetTopicId) {
    alert("🎉 All topics are completed! This program is finished.");
    return;
  }

  var phase = null;
  for (var ph = 0; ph < program.phases.length; ph++) {
    if (program.phases[ph].id === targetPhaseId) {
      phase = program.phases[ph];
      break;
    }
  }
  
  var topic = null;
  for (var tp = 0; tp < phase.topics.length; tp++) {
    if (phase.topics[tp].id === targetTopicId) {
      topic = phase.topics[tp];
      break;
    }
  }

  if (isWorkout) {
    openWorkoutSessionModal(programId, targetPhaseId, targetTopicId, phase.name, topic);
  } else {
    openSessionModal(programId, targetPhaseId, targetTopicId, phase.name, topic);
  }
}

function openSessionModal(programId, phaseId, topicId, phaseName, topic) {
  var overlay = document.createElement("div");
  overlay.className = "notes-modal-overlay";
  overlay.id = "session-modal-overlay";

  var modal = document.createElement("div");
  modal.className = "notes-modal";
  modal.id = "session-modal";

  var steps = topic.method || [];
  var stepStatus = [];
  for (var i = 0; i < steps.length; i++) {
    stepStatus.push(false);
  }

  var html = '';
  html += '<button class="notes-modal-close-btn" id="session-modal-close">✕</button>';
  html += '<h3 class="notes-modal-title">📝 Session</h3>';
  html += '<p style="font-size: 14px; color: var(--text-muted); margin-bottom: 4px;">' + escapeHtml(topic.name) + '</p>';
  html += '<p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">in ' + escapeHtml(phaseName) + '</p>';

  html += '<div class="program-session-steps" id="session-steps">';
  for (var s = 0; s < steps.length; s++) {
    html += '  <div class="program-session-step" data-index="' + s + '">';
    html += '    <div class="program-session-step-checkbox" id="step-check-' + s + '">☐</div>';
    html += '    <span class="program-session-step-text" id="step-text-' + s + '">' + escapeHtml(steps[s]) + '</span>';
    html += '  </div>';
  }
  html += '</div>';

  html += '<div class="program-session-complete-form" id="session-complete-form" style="display: ' + (steps.length === 0 ? 'block' : 'none') + ';">';
  html += '  <label>What did you learn?</label>';
  html += '  <input type="text" id="session-note" placeholder="e.g. I learned how functions work..." />';
  html += '  <label>Difficulty</label>';
  html += '  <div class="difficulty-grid">';
  html += '    <button class="difficulty-btn active" data-difficulty="Medium">Medium</button>';
  html += '    <button class="difficulty-btn" data-difficulty="Hard">Hard</button>';
  html += '    <button class="difficulty-btn" data-difficulty="Easy">Easy</button>';
  html += '  </div>';
  html += '  <label>Confidence (1-5)</label>';
  html += '  <input type="range" class="confidence-slider" id="session-confidence" min="1" max="5" value="3" step="1" />';
  html += '  <div class="confidence-value" id="session-confidence-value">3/5</div>';
  html += '  <button class="notes-modal-save-btn" id="session-complete-btn" style="margin-top: 12px;">✅ Complete Session</button>';
  html += '</div>';

  modal.innerHTML = html;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  var selectedDifficulty = "Medium";
  var allStepsCompleted = steps.length === 0;

  function closeModal() {
    overlay.remove();
  }

  document.getElementById("session-modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closeModal();
  });

  if (steps.length > 0) {
    var stepEls = document.querySelectorAll(".program-session-step");
    for (var se = 0; se < stepEls.length; se++) {
      stepEls[se].addEventListener("click", function() {
        var index = parseInt(this.dataset.index);
        stepStatus[index] = !stepStatus[index];
        var checkbox = document.getElementById("step-check-" + index);
        var text = document.getElementById("step-text-" + index);
        if (stepStatus[index]) {
          checkbox.textContent = "✅";
          text.classList.add("done");
        } else {
          checkbox.textContent = "☐";
          text.classList.remove("done");
        }

        allStepsCompleted = true;
        for (var ss = 0; ss < stepStatus.length; ss++) {
          if (!stepStatus[ss]) { allStepsCompleted = false; break; }
        }
        var form = document.getElementById("session-complete-form");
        form.style.display = allStepsCompleted ? "block" : "none";
        if (allStepsCompleted) {
          form.style.animation = "notesFadeIn 0.3s ease";
        }
      });
    }
  }

  var diffBtns = document.querySelectorAll(".difficulty-btn");
  for (var db = 0; db < diffBtns.length; db++) {
    diffBtns[db].addEventListener("click", function() {
      var allBtns = document.querySelectorAll(".difficulty-btn");
      for (var ab = 0; ab < allBtns.length; ab++) {
        allBtns[ab].classList.remove("active");
      }
      this.classList.add("active");
      selectedDifficulty = this.dataset.difficulty;
    });
  }

  var confidenceSlider = document.getElementById("session-confidence");
  var confidenceValue = document.getElementById("session-confidence-value");
  if (confidenceSlider) {
    confidenceSlider.addEventListener("input", function() {
      confidenceValue.textContent = this.value + "/5";
    });
  }

  document.getElementById("session-complete-btn").addEventListener("click", function() {
    var note = document.getElementById("session-note")?.value || "";
    var confidence = parseInt(document.getElementById("session-confidence")?.value || 3);

    completeTopic(programId, phaseId, topicId, selectedDifficulty, confidence, note);
    closeModal();
    openProgramDetail(programId);
  });

  var noteInput = document.getElementById("session-note");
  if (noteInput) {
    noteInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        document.getElementById("session-complete-btn").click();
      }
    });
  }
}

function openWorkoutSessionModal(programId, phaseId, topicId, phaseName, topic) {
  var overlay = document.createElement("div");
  overlay.className = "notes-modal-overlay";
  overlay.id = "session-modal-overlay";

  var modal = document.createElement("div");
  modal.className = "notes-modal";
  modal.id = "session-modal";

  var exerciseName = topic.name;
  var targetSets = topic.sets || 3;
  var targetReps = topic.reps || 0;
  var targetWeight = topic.weight || 0;

  var exerciseLogs = [];
  var setStatus = [];

  for (var i = 0; i < targetSets; i++) {
    setStatus.push(false);
    exerciseLogs.push({
      setNumber: i + 1,
      reps: 0,
      weight: targetWeight,
      completed: false
    });
  }

  var allSetsCompleted = targetSets === 0;

  var html = '';
  html += '<button class="notes-modal-close-btn" id="session-modal-close">✕</button>';
  html += '<h3 class="notes-modal-title">🏋️ ' + escapeHtml(exerciseName) + '</h3>';
  html += '<p style="font-size: 14px; color: var(--text-muted); margin-bottom: 4px;">' + escapeHtml(phaseName) + '</p>';
  html += '<p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">' + targetSets + ' sets × ' + targetReps + ' reps · ' + targetWeight + 'kg</p>';

  html += '<div class="program-session-steps" id="session-steps">';
  for (var s = 0; s < targetSets; s++) {
    html += '  <div class="program-session-step" data-index="' + s + '">';
    html += '    <div class="program-session-step-checkbox" id="set-check-' + s + '">☐</div>';
    html += '    <span class="program-session-step-text" id="set-text-' + s + '">Set ' + (s + 1) + ': ' + targetWeight + 'kg × ' + targetReps + ' reps</span>';
    html += '    <div style="display: flex; gap: 8px; margin-left: 8px;">';
    html += '      <input type="number" class="set-reps-input" data-index="' + s + '" value="' + targetReps + '" min="0" placeholder="Reps" style="width: 50px; padding: 4px; border: 1px solid var(--border-input); border-radius: 4px; background: var(--bg-input); color: var(--text-primary); font-size: 12px;" />';
    html += '      <input type="number" class="set-weight-input" data-index="' + s + '" value="' + targetWeight + '" min="0" step="0.5" placeholder="kg" style="width: 50px; padding: 4px; border: 1px solid var(--border-input); border-radius: 4px; background: var(--bg-input); color: var(--text-primary); font-size: 12px;" />';
    html += '    </div>';
    html += '  </div>';
  }
  html += '</div>';

  html += '<div class="program-session-complete-form" id="session-complete-form" style="display: ' + (targetSets === 0 ? 'block' : 'none') + ';">';
  html += '  <label>Session Notes</label>';
  html += '  <input type="text" id="session-note" placeholder="How did this session go?" />';
  html += '  <label>Difficulty</label>';
  html += '  <div class="difficulty-grid">';
  html += '    <button class="difficulty-btn active" data-difficulty="Medium">Medium</button>';
  html += '    <button class="difficulty-btn" data-difficulty="Hard">Hard</button>';
  html += '    <button class="difficulty-btn" data-difficulty="Easy">Easy</button>';
  html += '  </div>';
  html += '  <label>Confidence (1-5)</label>';
  html += '  <input type="range" class="confidence-slider" id="session-confidence" min="1" max="5" value="3" step="1" />';
  html += '  <div class="confidence-value" id="session-confidence-value">3/5</div>';
  html += '  <button class="notes-modal-save-btn" id="session-complete-btn" style="margin-top: 12px;">✅ Complete Session</button>';
  html += '</div>';

  modal.innerHTML = html;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  var selectedDifficulty = "Medium";

  function closeModal() {
    overlay.remove();
  }

  document.getElementById("session-modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closeModal();
  });

  if (targetSets > 0) {
    var stepEls = document.querySelectorAll(".program-session-step");
    for (var se = 0; se < stepEls.length; se++) {
      stepEls[se].addEventListener("click", function(e) {
        if (e.target.closest('input')) return;
        
        var index = parseInt(this.dataset.index);
        setStatus[index] = !setStatus[index];
        var checkbox = document.getElementById("set-check-" + index);
        var text = document.getElementById("set-text-" + index);
        
        var repsInput = document.querySelector('.set-reps-input[data-index="' + index + '"]');
        var weightInput = document.querySelector('.set-weight-input[data-index="' + index + '"]');
        
        var reps = parseInt(repsInput?.value || 0);
        var weight = parseFloat(weightInput?.value || 0);
        
        if (setStatus[index]) {
          checkbox.textContent = "✅";
          text.classList.add("done");
          exerciseLogs[index].reps = reps;
          exerciseLogs[index].weight = weight;
          exerciseLogs[index].completed = true;
        } else {
          checkbox.textContent = "☐";
          text.classList.remove("done");
          exerciseLogs[index].completed = false;
        }

        allSetsCompleted = true;
        for (var ss = 0; ss < setStatus.length; ss++) {
          if (!setStatus[ss]) { allSetsCompleted = false; break; }
        }
        var form = document.getElementById("session-complete-form");
        form.style.display = allSetsCompleted ? "block" : "none";
        if (allSetsCompleted) {
          form.style.animation = "notesFadeIn 0.3s ease";
        }
      });
    }

    var repsInputs = document.querySelectorAll(".set-reps-input");
    for (var ri = 0; ri < repsInputs.length; ri++) {
      repsInputs[ri].addEventListener("change", function() {
        var index = parseInt(this.dataset.index);
        exerciseLogs[index].reps = parseInt(this.value || 0);
      });
    }

    var weightInputs = document.querySelectorAll(".set-weight-input");
    for (var wi = 0; wi < weightInputs.length; wi++) {
      weightInputs[wi].addEventListener("change", function() {
        var index = parseInt(this.dataset.index);
        exerciseLogs[index].weight = parseFloat(this.value || 0);
      });
    }
  }

  var diffBtns = document.querySelectorAll(".difficulty-btn");
  for (var db = 0; db < diffBtns.length; db++) {
    diffBtns[db].addEventListener("click", function() {
      var allBtns = document.querySelectorAll(".difficulty-btn");
      for (var ab = 0; ab < allBtns.length; ab++) {
        allBtns[ab].classList.remove("active");
      }
      this.classList.add("active");
      selectedDifficulty = this.dataset.difficulty;
    });
  }

  var confidenceSlider = document.getElementById("session-confidence");
  var confidenceValue = document.getElementById("session-confidence-value");
  if (confidenceSlider) {
    confidenceSlider.addEventListener("input", function() {
      confidenceValue.textContent = this.value + "/5";
    });
  }

  document.getElementById("session-complete-btn").addEventListener("click", function() {
    var note = document.getElementById("session-note")?.value || "";
    var confidence = parseInt(document.getElementById("session-confidence")?.value || 3);

    var allLogs = [];
    for (var l = 0; l < exerciseLogs.length; l++) {
      allLogs.push({
        exerciseName: exerciseName,
        setNumber: exerciseLogs[l].setNumber,
        reps: exerciseLogs[l].reps,
        weight: exerciseLogs[l].weight,
        completed: exerciseLogs[l].completed
      });
    }

    completeWorkoutSession(programId, phaseId, allLogs, selectedDifficulty, confidence, note);
    closeModal();
    openProgramDetail(programId);
  });

  var noteInput = document.getElementById("session-note");
  if (noteInput) {
    noteInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        document.getElementById("session-complete-btn").click();
      }
    });
  }
}

// ========================================
// دوال مساعدة
// ========================================

function escapeHtml(text) {
  if (!text) return "";
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  var date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// ========================================
// تصدير الدالة للاستخدام من main.js
// ========================================

window.renderProgramPage = renderProgramPage;

console.log("✅ Program (with Workout Session Tracking) loaded successfully!");
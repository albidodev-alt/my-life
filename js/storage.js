// ========================================
// STORAGE.JS - Unified Storage Layer v3.0
// (Fixed: Total completed counter + Last 20 display only)
// ========================================

const STORAGE_KEY = "myLifeHub_routine";
const TASKS_KEY = "myLifeHub_tasks";
const STATS_KEY = "myLifeHub_achievement_stats";

// ===== كاش في الذاكرة =====
let routineCache = null;
let tasksCache = null;
let statsCache = null;

// ✅ flag لمنع إعادة محاولة Migration
let statsMigrationAttempted = false;

// ✅ عدد المهام المعروضة في صفحة الإنجازات (للعرض فقط — لا حذف تلقائي)
const DISPLAY_COMPLETED_LIMIT = 20;

// ========================================
// ✅ دالة حفظ آمنة
// ========================================
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22 || err.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn('⚠️ localStorage quota exceeded for key:', key);

      if (typeof showToast === 'function') {
        showToast(
          '⚠️ ' + (typeof t === 'function'
            ? t('storage_full', 'Storage is full. Please free up space by clearing old data.')
            : 'Storage is full. Please free up space by clearing old data.'),
          'warning',
          5000
        );
      }

      return { success: false, error: 'quota' };
    }

    console.error('Error saving to localStorage:', err);

    if (typeof showToast === 'function') {
      showToast('❌ ' + (err.message || 'Save failed'), 'error');
    }

    return { success: false, error: 'unknown', message: err.message };
  }
}

// ========================================
// ✅ قراءة آمنة
// ========================================
function safeGetItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error parsing localStorage key:', key, err);
    return fallback;
  }
}

// ========================================
// ✅ نسخة عميقة آمنة
// ========================================
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj);
    } catch (e) { /* fallback */ }
  }

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.warn('deepClone failed, returning original:', e);
    return obj;
  }
}

// ========================================
// ✅ مزامنة بين Tabs
// ========================================
if (typeof window !== 'undefined') {
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      console.log('🔄 Routine data changed in another tab.');
      routineCache = null;
    }
    if (e.key === TASKS_KEY) {
      console.log('🔄 Tasks data changed in another tab.');
      tasksCache = null;
    }
    if (e.key === STATS_KEY) {
      console.log('🔄 Stats data changed in another tab.');
      statsCache = null;
    }
  });
}

// ========================================
// ROUTINE STORAGE
// ========================================
function getAllRoutineData() {
  if (routineCache !== null) return routineCache;

  const data = safeGetItem(STORAGE_KEY, {});
  routineCache = (data && typeof data === 'object') ? data : {};
  return routineCache;
}

function saveAllRoutineData(data) {
  if (!data || typeof data !== 'object') {
    console.error('saveAllRoutineData: invalid data');
    return false;
  }

  const result = safeSetItem(STORAGE_KEY, JSON.stringify(data));

  if (result.success) {
    routineCache = data;
    return true;
  }

  return false;
}

function getDayData(dayName) {
  const allData = getAllRoutineData();

  if (!allData[dayName]) {
    allData[dayName] = {
      hours: new Array(24).fill(""),
      dayFor: ""
    };
  }

  if (!Array.isArray(allData[dayName].hours)) {
    allData[dayName].hours = new Array(24).fill("");
  }

  while (allData[dayName].hours.length < 24) {
    allData[dayName].hours.push("");
  }

  return allData[dayName];
}

function saveDayData(dayName, dayData) {
  if (!dayName || !dayData) {
    console.error('saveDayData: invalid arguments');
    return false;
  }

  const allData = getAllRoutineData();
  allData[dayName] = dayData;
  return saveAllRoutineData(allData);
}

// ========================================
// ✅ إبطال الكاش
// ========================================
function invalidateRoutineCache() { routineCache = null; }
function invalidateTasksCache() { tasksCache = null; }
function invalidateStatsCache() { statsCache = null; }

function invalidateAllCaches() {
  routineCache = null;
  tasksCache = null;
  statsCache = null;

  if (typeof invalidateNotificationsCache === 'function') {
    invalidateNotificationsCache();
  }
}

// ========================================
// ✅ ACHIEVEMENT STATS (العداد التراكمي)
// ========================================
function getAchievementStats() {
  if (statsCache !== null) return statsCache;

  const stored = safeGetItem(STATS_KEY, null);

  if (stored && typeof stored === 'object' &&
      typeof stored.totalCompleted === 'number') {
    statsCache = {
      totalCompleted: stored.totalCompleted || 0,
      easyCount: stored.easyCount || 0,
      mediumCount: stored.mediumCount || 0,
      hardCount: stored.hardCount || 0,
      lastUpdated: stored.lastUpdated || new Date().toISOString()
    };
    return statsCache;
  }

  // ✅ Migration: جرّب مرة واحدة فقط
  if (!statsMigrationAttempted) {
    statsMigrationAttempted = true;
    console.log('📊 Migrating achievement stats from tasks...');
    statsCache = calculateStatsFromTasks();
    saveAchievementStats(statsCache);
    return statsCache;
  }

  statsCache = {
    totalCompleted: 0,
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0,
    lastUpdated: new Date().toISOString()
  };
  return statsCache;
}

function calculateStatsFromTasks() {
  const tasks = _getTasksRaw();
  const completed = tasks.filter(t => t.completed);

  const stats = {
    totalCompleted: completed.length,
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0,
    lastUpdated: new Date().toISOString()
  };

  completed.forEach(task => {
    const diff = (task.difficulty || 'Easy').toLowerCase();
    if (diff === 'easy') stats.easyCount++;
    else if (diff === 'medium') stats.mediumCount++;
    else if (diff === 'hard') stats.hardCount++;
  });

  return stats;
}

function saveAchievementStats(stats) {
  if (!stats || typeof stats !== 'object') {
    console.error('saveAchievementStats: invalid stats');
    return false;
  }

  const normalized = {
    totalCompleted: Math.max(0, stats.totalCompleted || 0),
    easyCount: Math.max(0, stats.easyCount || 0),
    mediumCount: Math.max(0, stats.mediumCount || 0),
    hardCount: Math.max(0, stats.hardCount || 0),
    lastUpdated: stats.lastUpdated || new Date().toISOString()
  };

  const result = safeSetItem(STATS_KEY, JSON.stringify(normalized));

  if (result.success) {
    statsCache = normalized;
    return true;
  }

  return false;
}

function incrementAchievementStats(difficulty) {
  const stats = getAchievementStats();
  const diff = (difficulty || 'Easy').toLowerCase();

  stats.totalCompleted++;
  if (diff === 'easy') stats.easyCount++;
  else if (diff === 'medium') stats.mediumCount++;
  else if (diff === 'hard') stats.hardCount++;
  stats.lastUpdated = new Date().toISOString();

  saveAchievementStats(stats);
  return stats;
}

function decrementAchievementStats(difficulty) {
  const stats = getAchievementStats();
  const diff = (difficulty || 'Easy').toLowerCase();

  stats.totalCompleted = Math.max(0, stats.totalCompleted - 1);
  if (diff === 'easy') stats.easyCount = Math.max(0, stats.easyCount - 1);
  else if (diff === 'medium') stats.mediumCount = Math.max(0, stats.mediumCount - 1);
  else if (diff === 'hard') stats.hardCount = Math.max(0, stats.hardCount - 1);
  stats.lastUpdated = new Date().toISOString();

  saveAchievementStats(stats);
  return stats;
}

function resetAchievementStats() {
  statsCache = null;
  statsMigrationAttempted = false;
  try {
    localStorage.removeItem(STATS_KEY);
  } catch (e) {
    console.warn('Error resetting achievement stats:', e);
  }
  return getAchievementStats();
}

function clearAchievementStats() {
  statsCache = null;
  statsMigrationAttempted = false;
  try {
    localStorage.removeItem(STATS_KEY);
  } catch (e) {
    console.warn('Error clearing achievement stats:', e);
  }
}

// ========================================
// ✅ TASKS STORAGE
// ========================================

/**
 * قراءة خام (داخلي فقط)
 */
function _getTasksRaw() {
  if (tasksCache === null) {
    const tasks = safeGetItem(TASKS_KEY, []);
    tasksCache = Array.isArray(tasks) ? tasks : [];
  }
  return tasksCache;
}

/**
 * قراءة آمنة (نسخة عميقة)
 */
function getAllTasks() {
  return deepClone(_getTasksRaw());
}

function getTasksCopy() {
  return deepClone(_getTasksRaw());
}

function saveAllTasks(tasks) {
  if (!Array.isArray(tasks)) {
    console.error('saveAllTasks: tasks must be an array');
    return false;
  }

  const result = safeSetItem(TASKS_KEY, JSON.stringify(tasks));

  if (result.success) {
    tasksCache = tasks;
    return true;
  }

  return false;
}

function addTask(task) {
  if (!task || typeof task !== 'object') {
    console.error('addTask: invalid task object');
    return null;
  }

  const tasks = deepClone(_getTasksRaw());

  task.id = (typeof generateId === "function")
    ? generateId()
    : Date.now() + Math.random();

  task.completed = false;
  task.createdAt = new Date().toISOString();

  if (!task.priority) task.priority = "medium";
  if (!task.category) task.category = "Personal";
  if (task.dueDate === undefined) task.dueDate = null;
  if (task.difficulty === undefined) task.difficulty = null;
  if (task.completionDate === undefined) task.completionDate = null;

  tasks.push(task);

  const success = saveAllTasks(tasks);
  return success ? task : null;
}

function updateTask(taskId, updatedData) {
  if (!taskId || !updatedData) return false;

  const tasks = deepClone(_getTasksRaw());
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    console.warn('updateTask: task not found', taskId);
    return false;
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...updatedData };
  return saveAllTasks(tasks);
}

/**
 * ✅ حذف مهمة — يُنقص العداد إذا كانت مكتملة
 */
function deleteTask(taskId) {
  if (!taskId) return false;

  const tasks = deepClone(_getTasksRaw());
  const taskToDelete = tasks.find((t) => t.id === taskId);

  if (!taskToDelete) {
    console.warn('deleteTask: task not found', taskId);
    return false;
  }

  // ✅ إذا كانت المهمة مكتملة → أنقص العداد
  if (taskToDelete.completed) {
    decrementAchievementStats(taskToDelete.difficulty);
  }

  const updated = tasks.filter((t) => t.id !== taskId);
  return saveAllTasks(updated);
}

/**
 * ✅ إكمال مهمة — يُزيد العداد (بدون حذف تلقائي)
 */
function completeTask(taskId, difficulty, completionDate) {
  const tasks = deepClone(_getTasksRaw());
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    console.warn('completeTask: task not found', taskId);
    return false;
  }

  const finalDifficulty = difficulty || "Medium";
  const finalDate = completionDate || new Date().toISOString().split('T')[0];

  task.completed = true;
  task.difficulty = finalDifficulty;
  task.completionDate = finalDate;
  task.completedAt = new Date().toISOString();

  // ✅ زيادة العداد التراكمي
  incrementAchievementStats(finalDifficulty);

  // ✅ لا حذف تلقائي — نحتفظ بجميع المهام
  return saveAllTasks(tasks);
}

function deleteTaskPermanently(taskId) {
  return deleteTask(taskId);
}

// ========================================
// ✅ دوال إحصائية جديدة
// ========================================

/**
 * ✅ العدد التراكمي للمهام المنجزة (لعدّاد القطرات والبروفايل)
 */
function getCompletedTasksCount() {
  const stats = getAchievementStats();
  return stats.totalCompleted;
}

function getTasksCount() {
  return _getTasksRaw().length;
}

function getActiveTasksCount() {
  return _getTasksRaw().filter(t => !t.completed).length;
}

/**
 * ✅ آخر N مهمة مكتملة (للعرض في صفحة الإنجازات)
 * @param {number} limit - افتراضي 20
 */
function getCompletedTasksSorted(limit = DISPLAY_COMPLETED_LIMIT) {
  const completed = _getTasksRaw().filter(t => t.completed);

  // ترتيب من الأحدث للأقدم
  const sorted = deepClone(completed).sort((a, b) => {
    const dateA = new Date(a.completedAt || a.completionDate || 0);
    const dateB = new Date(b.completedAt || b.completionDate || 0);
    return dateB - dateA;
  });

  // ✅ عرض آخر N فقط
  return sorted.slice(0, limit);
}

/**
 * المهام النشطة (مرتبة حسب الأولوية)
 */
function getActiveTasksSorted() {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const active = _getTasksRaw().filter(t => !t.completed);
  return deepClone(active).sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 3;
    const pb = priorityOrder[b.priority] ?? 3;
    return pa - pb;
  });
}

/**
 * التحقق من حجم التخزين
 */
function getStorageUsage() {
  let total = 0;
  const items = {};

  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = (localStorage[key].length + key.length) * 2;
        total += size;
        items[key] = size;
      }
    }
  } catch (e) {
    console.warn('Could not calculate storage usage:', e);
  }

  return {
    totalBytes: total,
    totalKB: (total / 1024).toFixed(2),
    totalMB: (total / 1024 / 1024).toFixed(2),
    items: items,
    percentage: ((total / (5 * 1024 * 1024)) * 100).toFixed(1)
  };
}

function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error('Error removing item:', key, err);
    return false;
  }
}

// ========================================
// ✅ تصدير صريح على window
// ========================================
window.getAllRoutineData = getAllRoutineData;
window.saveAllRoutineData = saveAllRoutineData;
window.getDayData = getDayData;
window.saveDayData = saveDayData;

// ✅ TASKS
window.getAllTasks = getAllTasks;
window.getTasksCopy = getTasksCopy;
window.saveAllTasks = saveAllTasks;
window.addTask = addTask;
window.updateTask = updateTask;
window.deleteTask = deleteTask;
window.completeTask = completeTask;
window.deleteTaskPermanently = deleteTaskPermanently;

// ✅ دوال مساعدة
window.safeSetItem = safeSetItem;
window.safeGetItem = safeGetItem;
window.safeRemoveItem = safeRemoveItem;
window.deepClone = deepClone;
window.invalidateRoutineCache = invalidateRoutineCache;
window.invalidateTasksCache = invalidateTasksCache;
window.invalidateStatsCache = invalidateStatsCache;
window.invalidateAllCaches = invalidateAllCaches;
window.getTasksCount = getTasksCount;
window.getCompletedTasksCount = getCompletedTasksCount;
window.getActiveTasksCount = getActiveTasksCount;
window.getCompletedTasksSorted = getCompletedTasksSorted;
window.getActiveTasksSorted = getActiveTasksSorted;
window.getStorageUsage = getStorageUsage;

// ✅ إحصائيات الإنجازات
window.getAchievementStats = getAchievementStats;
window.saveAchievementStats = saveAchievementStats;
window.incrementAchievementStats = incrementAchievementStats;
window.decrementAchievementStats = decrementAchievementStats;
window.resetAchievementStats = resetAchievementStats;
window.clearAchievementStats = clearAchievementStats;
window.calculateStatsFromTasks = calculateStatsFromTasks;
window.DISPLAY_COMPLETED_LIMIT = DISPLAY_COMPLETED_LIMIT;

// ========================================
// ✅ تأكيد التحميل
// ========================================
console.log("✅ Storage.js v3.0 loaded successfully!");
console.log("   - getAllTasks returns deep copy (safe)");
console.log("   - No auto-deletion of completed tasks");
console.log("   - Total counter persisted in STATS_KEY");
console.log("   - Display limit for achievements page:", DISPLAY_COMPLETED_LIMIT);

if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      const usage = getStorageUsage();
      console.log(`📊 Storage: ${usage.totalKB} KB (${usage.percentage}% of ~5MB)`);
    } catch (e) { /* ignore */ }
  }, 1000);
}
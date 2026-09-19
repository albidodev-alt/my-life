// ========================================
// STORAGE.JS - Unified Storage Layer v2.0
// (Quota Handling + Cross-Tab Sync + Safe Save)
// ========================================

const STORAGE_KEY = "myLifeHub_routine";
const TASKS_KEY = "myLifeHub_tasks";

// ===== كاش في الذاكرة =====
let routineCache = null;
let tasksCache = null;

// ========================================
// ✅ دالة حفظ آمنة (مع معالجة QuotaExceededError)
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
// ✅ قراءة آمنة (مع حماية من JSON الفاسد)
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
// ✅ مزامنة بين Tabs
// ========================================
if (typeof window !== 'undefined') {
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      console.log('🔄 Routine data changed in another tab. Invalidating cache.');
      routineCache = null;
    }
    if (e.key === TASKS_KEY) {
      console.log('🔄 Tasks data changed in another tab. Invalidating cache.');
      tasksCache = null;
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

  // ✅ تأكد من وجود مصفوفة hours
  if (!Array.isArray(allData[dayName].hours)) {
    allData[dayName].hours = new Array(24).fill("");
  }

  // ✅ تأكد من طول المصفوفة
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
// ✅ إبطال الكاش يدوياً
// ========================================
function invalidateRoutineCache() {
  routineCache = null;
}

function invalidateTasksCache() {
  tasksCache = null;
}

function invalidateAllCaches() {
  routineCache = null;
  tasksCache = null;
}

// ========================================
// TASKS STORAGE - Unified CRUD
// ========================================
function getAllTasks() {
  if (tasksCache !== null) return tasksCache;

  const tasks = safeGetItem(TASKS_KEY, []);
  tasksCache = Array.isArray(tasks) ? tasks : [];
  return tasksCache;
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

/**
 * إضافة مهمة جديدة
 */
function addTask(task) {
  if (!task || typeof task !== 'object') {
    console.error('addTask: invalid task object');
    return null;
  }

  const tasks = getAllTasks();

  // ✅ توليد ID فريد
  task.id = (typeof generateId === "function")
    ? generateId()
    : Date.now() + Math.random();

  task.completed = false;
  task.createdAt = new Date().toISOString();

  // ✅ قيم افتراضية
  if (!task.priority) task.priority = "medium";
  if (!task.category) task.category = "Personal";
  if (task.dueDate === undefined) task.dueDate = null;
  if (task.difficulty === undefined) task.difficulty = null;
  if (task.completionDate === undefined) task.completionDate = null;

  tasks.push(task);

  const success = saveAllTasks(tasks);
  return success ? task : null;
}

/**
 * تحديث مهمة موجودة
 */
function updateTask(taskId, updatedData) {
  if (!taskId || !updatedData) return false;

  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    console.warn('updateTask: task not found', taskId);
    return false;
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...updatedData };
  return saveAllTasks(tasks);
}

/**
 * حذف مهمة
 */
function deleteTask(taskId) {
  if (!taskId) return false;

  const tasks = getAllTasks();
  const updated = tasks.filter((t) => t.id !== taskId);

  if (updated.length === tasks.length) {
    console.warn('deleteTask: task not found', taskId);
    return false;
  }

  return saveAllTasks(updated);
}

/**
 * إكمال مهمة
 */
function completeTask(taskId, difficulty, completionDate) {
  return updateTask(taskId, {
    completed: true,
    difficulty: difficulty || "Medium",
    completionDate: completionDate || new Date().toISOString().split('T')[0]
  });
}

/**
 * حذف نهائي (للتوافق مع الكود القديم)
 */
function deleteTaskPermanently(taskId) {
  return deleteTask(taskId);
}

// ========================================
// ✅ دوال إضافية مفيدة
// ========================================

/**
 * عدد المهام الكلية
 */
function getTasksCount() {
  return getAllTasks().length;
}

/**
 * عدد المهام المكتملة
 */
function getCompletedTasksCount() {
  return getAllTasks().filter(t => t.completed).length;
}

/**
 * عدد المهام النشطة
 */
function getActiveTasksCount() {
  return getAllTasks().filter(t => !t.completed).length;
}

/**
 * التحقق من حجم التخزين المستخدم
 */
function getStorageUsage() {
  let total = 0;
  const items = {};

  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = (localStorage[key].length + key.length) * 2; // UTF-16
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
    percentage: ((total / (5 * 1024 * 1024)) * 100).toFixed(1) // 5MB typical limit
  };
}

/**
 * حذف آمن (مع التحقق)
 */
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
window.getAllTasks = getAllTasks;
window.saveAllTasks = saveAllTasks;
window.addTask = addTask;
window.updateTask = updateTask;
window.deleteTask = deleteTask;
window.completeTask = completeTask;
window.deleteTaskPermanently = deleteTaskPermanently;

// ✅ دوال جديدة
window.safeSetItem = safeSetItem;
window.safeGetItem = safeGetItem;
window.safeRemoveItem = safeRemoveItem;
window.invalidateRoutineCache = invalidateRoutineCache;
window.invalidateTasksCache = invalidateTasksCache;
window.invalidateAllCaches = invalidateAllCaches;
window.getTasksCount = getTasksCount;
window.getCompletedTasksCount = getCompletedTasksCount;
window.getActiveTasksCount = getActiveTasksCount;
window.getStorageUsage = getStorageUsage;

// ========================================
// ✅ تأكيد التحميل
// ========================================
console.log("✅ Storage.js v2.0 loaded successfully!");
console.log("   - getAllTasks:", typeof window.getAllTasks);
console.log("   - getDayData:", typeof window.getDayData);
console.log("   - addTask:", typeof window.addTask);
console.log("   - safeSetItem:", typeof window.safeSetItem);
console.log("   - getStorageUsage:", typeof window.getStorageUsage);

// ✅ عرض استخدام التخزين في Console (للتشخيص)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      const usage = getStorageUsage();
      console.log(`📊 Storage: ${usage.totalKB} KB (${usage.percentage}% of ~5MB)`);
    } catch (e) {
      // تجاهل
    }
  }, 1000);
}
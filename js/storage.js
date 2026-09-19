// ========================================
// STORAGE.JS - Unified Storage Layer
// ========================================

const STORAGE_KEY = "myLifeHub_routine";
const TASKS_KEY = "myLifeHub_tasks";

// ===== كاش في الذاكرة =====
let routineCache = null;
let tasksCache = null;

// ========================================
// ROUTINE STORAGE
// ========================================
function getAllRoutineData() {
  if (routineCache !== null) return routineCache;
  const raw = localStorage.getItem(STORAGE_KEY);
  routineCache = raw ? JSON.parse(raw) : {};
  return routineCache;
}

function saveAllRoutineData(data) {
  routineCache = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDayData(dayName) {
  const allData = getAllRoutineData();
  if (!allData[dayName]) {
    allData[dayName] = { hours: new Array(24).fill(""), dayFor: "" };
  }
  return allData[dayName];
}

function saveDayData(dayName, dayData) {
  const allData = getAllRoutineData();
  allData[dayName] = dayData;
  saveAllRoutineData(allData);
}

// ========================================
// TASKS STORAGE - Unified CRUD
// ========================================
function getAllTasks() {
  if (tasksCache !== null) return tasksCache;
  const raw = localStorage.getItem(TASKS_KEY);
  tasksCache = raw ? JSON.parse(raw) : [];
  return tasksCache;
}

function saveAllTasks(tasks) {
  tasksCache = tasks;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

/**
 * إضافة مهمة جديدة
 */
function addTask(task) {
  const tasks = getAllTasks();
  task.id = (typeof generateId === "function") ? generateId() : Date.now();
  task.completed = false;
  task.createdAt = new Date().toISOString();
  tasks.push(task);
  saveAllTasks(tasks);
}

/**
 * تحديث مهمة موجودة
 */
function updateTask(taskId, updatedData) {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedData };
    saveAllTasks(tasks);
    return true;
  }
  return false;
}

/**
 * حذف مهمة
 */
function deleteTask(taskId) {
  const tasks = getAllTasks();
  const updated = tasks.filter((t) => t.id !== taskId);
  saveAllTasks(updated);
}

/**
 * إكمال مهمة
 */
function completeTask(taskId, difficulty, completionDate) {
  return updateTask(taskId, {
    completed: true,
    difficulty: difficulty,
    completionDate: completionDate
  });
}

/**
 * حذف نهائي (للتوافق مع الكود القديم)
 */
function deleteTaskPermanently(taskId) {
  deleteTask(taskId);
}

// ========================================
// ✅ تصدير صريح على window (مهم جداً!)
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

// ========================================
// ✅ تأكيد التحميل
// ========================================
console.log("✅ Storage.js loaded successfully!");
console.log("   - getAllTasks:", typeof window.getAllTasks);
console.log("   - getDayData:", typeof window.getDayData);
console.log("   - addTask:", typeof window.addTask);
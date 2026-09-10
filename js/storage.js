// ========================================
// STORAGE.JS - مع تحسين الكاش في الذاكرة
// ========================================

const STORAGE_KEY = "myLifeHub_routine";
const TASKS_KEY = "myLifeHub_tasks";

// ===== كاش في الذاكرة =====
let routineCache = null;
let tasksCache = null;

// ===== Routine Storage =====
function getAllRoutineData() {
  // ✅ استخدام الكاش إذا كان موجوداً
  if (routineCache !== null) return routineCache;
  
  const raw = localStorage.getItem(STORAGE_KEY);
  routineCache = raw ? JSON.parse(raw) : {};
  return routineCache;
}

function saveAllRoutineData(data) {
  routineCache = data; // ✅ تحديث الكاش
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

// ===== Tasks Storage =====
function getAllTasks() {
  // ✅ استخدام الكاش إذا كان موجوداً
  if (tasksCache !== null) return tasksCache;
  
  const raw = localStorage.getItem(TASKS_KEY);
  tasksCache = raw ? JSON.parse(raw) : [];
  return tasksCache;
}

function saveAllTasks(tasks) {
  tasksCache = tasks; // ✅ تحديث الكاش
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function addTask(task) {
  const tasks = getAllTasks();
  task.id = Date.now();
  task.completed = false;
  tasks.push(task);
  saveAllTasks(tasks);
}

function completeTask(taskId, difficulty, completionDate) {
  const tasks = getAllTasks();
  const task = tasks.find(function (t) { return t.id === taskId; });
  if (task) {
    task.completed = true;
    task.difficulty = difficulty;
    task.completionDate = completionDate;
  }
  saveAllTasks(tasks);
}

// ===== تحديث مهمة =====
function updateTask(taskId, updatedData) {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex(function (t) { return t.id === taskId; });
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedData };
    saveAllTasks(tasks);
  }
}
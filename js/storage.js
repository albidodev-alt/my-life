const STORAGE_KEY = "myLifeHub_routine";
const TASKS_KEY = "myLifeHub_tasks";

// ===== Routine Storage =====
function getAllRoutineData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveAllRoutineData(data) {
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
  const raw = localStorage.getItem(TASKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAllTasks(tasks) {
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
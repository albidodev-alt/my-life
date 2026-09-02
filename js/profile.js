// ===== عرض صفحة البروفايل =====
function renderProfile() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  // ===== زر الرجوع =====
  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back";
  backBtn.id = "back-btn";
  backBtn.addEventListener("click", function () {
    renderWeek();
  });
  app.appendChild(backBtn);

  // ===== جلب بيانات البروفايل =====
  const profile = getProfileData();

  // ===== بطاقة البروفايل =====
  const profileCard = document.createElement("div");
  profileCard.className = "profile-card";

  // ===== الصورة الرمزية =====
  const avatarContainer = document.createElement("div");
  avatarContainer.className = "profile-avatar-container";

  const avatarWrapper = document.createElement("div");
  avatarWrapper.className = "profile-avatar-wrapper";

  const avatarImg = document.createElement("img");
  avatarImg.className = "profile-avatar-img";
  avatarImg.id = "profile-avatar-img";
  
  if (profile.avatar) {
    avatarImg.src = profile.avatar;
  } else {
    avatarImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='55' font-size='40' text-anchor='middle' fill='%239ca3af'%3E👤%3C/text%3E%3C/svg%3E";
  }

  const cameraBtn = document.createElement("button");
  cameraBtn.className = "profile-camera-btn";
  cameraBtn.textContent = "📷";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.id = "avatar-file-input";
  fileInput.style.display = "none";

  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const imageData = event.target.result;
        profile.avatar = imageData;
        saveProfileData(profile);
        avatarImg.src = imageData;
        updateUserHeader();
      };
      reader.readAsDataURL(file);
    }
  });

  cameraBtn.addEventListener("click", function () {
    fileInput.click();
  });

  avatarWrapper.appendChild(avatarImg);
  avatarWrapper.appendChild(cameraBtn);
  avatarWrapper.appendChild(fileInput);
  avatarContainer.appendChild(avatarWrapper);

  const nameDiv = document.createElement("div");
  nameDiv.className = "profile-name";
  nameDiv.textContent = profile.name || "User 1";
  profileCard.appendChild(avatarContainer);
  profileCard.appendChild(nameDiv);

  const bioDiv = document.createElement("div");
  bioDiv.className = "profile-bio";
  bioDiv.textContent = profile.bio || "Building my life one day at a time.";
  profileCard.appendChild(bioDiv);

  // ===== الإحصائيات =====
  const stats = getProfileStats();
  const statsGrid = document.createElement("div");
  statsGrid.className = "profile-stats-grid";

  const statItems = [
    { label: "Tasks", value: stats.totalTasks },
    { label: "Done", value: stats.completedTasks },
    { label: "Days", value: stats.daysPlanned }
  ];

  statItems.forEach(function (item) {
    const statBox = document.createElement("div");
    statBox.className = "profile-stat-box";

    const statValue = document.createElement("div");
    statValue.className = "profile-stat-value";
    statValue.textContent = item.value;

    const statLabel = document.createElement("div");
    statLabel.className = "profile-stat-label";
    statLabel.textContent = item.label;

    statBox.appendChild(statValue);
    statBox.appendChild(statLabel);
    statsGrid.appendChild(statBox);
  });

  profileCard.appendChild(statsGrid);
  app.appendChild(profileCard);

  // ===== About Me =====
  const aboutSection = document.createElement("div");
  aboutSection.className = "profile-section";

  const aboutTitle = document.createElement("h3");
  aboutTitle.className = "profile-section-title";
  aboutTitle.textContent = "📝 About Me";
  aboutSection.appendChild(aboutTitle);

  // حقل الاسم
  const nameField = document.createElement("div");
  nameField.className = "profile-field";

  const nameLabel = document.createElement("label");
  nameLabel.className = "profile-field-label";
  nameLabel.textContent = "Name";
  nameField.appendChild(nameLabel);

  const nameInput = document.createElement("input");
  nameInput.className = "profile-field-input";
  nameInput.type = "text";
  nameInput.value = profile.name || "User 1";
  nameInput.placeholder = "Your name";

  nameInput.addEventListener("change", function () {
    profile.name = nameInput.value;
    saveProfileData(profile);
    nameDiv.textContent = profile.name;
    updateUserHeader();
  });

  nameField.appendChild(nameInput);
  aboutSection.appendChild(nameField);

  // حقل البايو
  const bioField = document.createElement("div");
  bioField.className = "profile-field";

  const bioLabel = document.createElement("label");
  bioLabel.className = "profile-field-label";
  bioLabel.textContent = "Bio";
  bioField.appendChild(bioLabel);

  const bioTextarea = document.createElement("textarea");
  bioTextarea.className = "profile-field-textarea";
  bioTextarea.rows = 3;
  bioTextarea.value = profile.bio || "Building my life one day at a time.";
  bioTextarea.placeholder = "Tell us about yourself...";

  bioTextarea.addEventListener("change", function () {
    profile.bio = bioTextarea.value;
    saveProfileData(profile);
    bioDiv.textContent = profile.bio;
  });

  bioField.appendChild(bioTextarea);
  aboutSection.appendChild(bioField);

  app.appendChild(aboutSection);

  // ===== Member Since =====
  const memberSection = document.createElement("div");
  memberSection.className = "profile-section";
  memberSection.style.borderBottom = "none";
  memberSection.style.textAlign = "center";

  const memberInfo = document.createElement("p");
  memberInfo.className = "profile-member-info";
  const joinDate = profile.joinDate ? new Date(profile.joinDate) : new Date();
  memberInfo.textContent = "📅 Member since " + joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  memberSection.appendChild(memberInfo);

  app.appendChild(memberSection);

  // تحديث الرأس بعد التعديلات
  updateUserHeader();
}

// ===== دوال الإحصائيات =====
function getProfileStats() {
  const tasks = getAllTasks();
  const routineData = getAllRoutineData();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(function (t) { return t.completed; }).length;
  
  let daysPlanned = 0;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  days.forEach(function (day) {
    const data = routineData[day];
    if (data && data.hours) {
      const hasActivity = data.hours.some(function (h) {
        return h && h.trim() !== "";
      });
      if (hasActivity) daysPlanned++;
    }
  });

  return {
    totalTasks: totalTasks,
    completedTasks: completedTasks,
    daysPlanned: daysPlanned
  };
}

// ===== دوال تخزين البروفايل =====
const PROFILE_KEY = "myLifeHub_profile";

function getProfileData() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return getDefaultProfile();
    }
  }
  return getDefaultProfile();
}

function getDefaultProfile() {
  return {
    name: "User 1",
    bio: "Building my life one day at a time.",
    avatar: "",
    joinDate: new Date().toISOString()
  };
}

function saveProfileData(data) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
  updateUserHeader();
}
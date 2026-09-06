// ========================================
// MY LIFE - PROFILE
// ========================================

// ===== عرض صفحة البروفايل =====
function renderProfile() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  // ===== زر الرجوع =====
  const backBtn = document.createElement("button");
  backBtn.textContent = "← " + (typeof t === 'function' ? t('back', 'Back') : 'Back');
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
    { label: typeof t === 'function' ? t('tasks', 'Tasks') : "Tasks", value: stats.totalTasks, icon: "list-checks" },
    { label: typeof t === 'function' ? t('done', 'Done') : "Done", value: stats.completedTasks, icon: "check-circle" },
    { label: typeof t === 'function' ? t('days_planned', 'Days') : "Days", value: stats.daysPlanned, icon: "calendar-days" }
  ];

  statItems.forEach(function (item) {
    const statBox = document.createElement("div");
    statBox.className = "profile-stat-box";

    const iconWrapper = document.createElement("div");
    iconWrapper.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    `;
    const iconSpan = document.createElement("span");
    iconSpan.setAttribute("data-lucide", item.icon);
    iconSpan.style.cssText = `
      width: 24px;
      height: 24px;
      color: var(--primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    `;
    iconWrapper.appendChild(iconSpan);

    const statValue = document.createElement("div");
    statValue.className = "profile-stat-value";
    statValue.textContent = item.value;

    const statLabel = document.createElement("div");
    statLabel.className = "profile-stat-label";
    statLabel.textContent = item.label;

    statBox.appendChild(iconWrapper);
    statBox.appendChild(statValue);
    statBox.appendChild(statLabel);
    statsGrid.appendChild(statBox);
  });

  profileCard.appendChild(statsGrid);
  app.appendChild(profileCard);

  // ========================================
  // ===== ABOUT ME SECTION =====
  // ========================================
  
  const aboutSection = document.createElement("div");
  aboutSection.className = "profile-section";

  const aboutTitleWrapper = document.createElement("div");
  aboutTitleWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  `;
  
  const aboutIcon = document.createElement("span");
  aboutIcon.setAttribute("data-lucide", "user");
  aboutIcon.style.cssText = `
    width: 24px;
    height: 24px;
    color: var(--primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `;
  
  const aboutText = document.createElement("span");
  aboutText.className = "profile-section-title";
  aboutText.textContent = typeof t === 'function' ? t('about_me', 'About Me') : "About Me";
  aboutText.style.marginBottom = "0";
  
  aboutTitleWrapper.appendChild(aboutIcon);
  aboutTitleWrapper.appendChild(aboutText);
  aboutSection.appendChild(aboutTitleWrapper);

  // حقل الاسم
  const nameField = document.createElement("div");
  nameField.className = "profile-field";

  const nameLabel = document.createElement("label");
  nameLabel.className = "profile-field-label";
  nameLabel.textContent = typeof t === 'function' ? t('name', 'Name') : "Name";
  nameField.appendChild(nameLabel);

  const nameInput = document.createElement("input");
  nameInput.className = "profile-field-input";
  nameInput.type = "text";
  nameInput.value = profile.name || "User 1";
  nameInput.placeholder = typeof t === 'function' ? t('name', 'Your name') : "Your name";

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
  bioLabel.textContent = typeof t === 'function' ? t('bio', 'Bio') : "Bio";
  bioField.appendChild(bioLabel);

  const bioTextarea = document.createElement("textarea");
  bioTextarea.className = "profile-field-textarea";
  bioTextarea.rows = 3;
  bioTextarea.value = profile.bio || "Building my life one day at a time.";
  bioTextarea.placeholder = typeof t === 'function' ? t('bio', 'Tell us about yourself...') : "Tell us about yourself...";

  bioTextarea.addEventListener("change", function () {
    profile.bio = bioTextarea.value;
    saveProfileData(profile);
    bioDiv.textContent = profile.bio;
  });

  bioField.appendChild(bioTextarea);
  aboutSection.appendChild(bioField);

  app.appendChild(aboutSection);

  // ========================================
  // ===== SETTINGS SECTION =====
  // ========================================
  
  const settingsSection = document.createElement("div");
  settingsSection.className = "profile-section";
  settingsSection.id = "settings-section";

  const settingsTitleWrapper = document.createElement("div");
  settingsTitleWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  `;

  const settingsIcon = document.createElement("span");
  settingsIcon.setAttribute("data-lucide", "settings");
  settingsIcon.style.cssText = `
    width: 24px;
    height: 24px;
    color: var(--primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `;

  const settingsTitle = document.createElement("h3");
  settingsTitle.className = "profile-section-title";
  settingsTitle.textContent = typeof t === 'function' ? t('settings', 'Settings') : "Settings";
  settingsTitle.style.marginBottom = "0";

  settingsTitleWrapper.appendChild(settingsIcon);
  settingsTitleWrapper.appendChild(settingsTitle);
  settingsSection.appendChild(settingsTitleWrapper);

  // ===== إعدادات العرض =====
  const displaySettings = document.createElement("div");
  displaySettings.style.cssText = `
    margin-bottom: 16px;
  `;

  const displayTitle = document.createElement("h4");
  displayTitle.style.cssText = `
    font-family: var(--font-handwritten);
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 12px 0;
  `;
  displayTitle.textContent = typeof t === 'function' ? t('display', 'Display') : "Display";
  displaySettings.appendChild(displayTitle);

  // ===== إعدادات اللغة =====
  const languageRow = document.createElement("div");
  languageRow.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    margin-bottom: 8px;
  `;

  const languageLabel = document.createElement("span");
  languageLabel.style.cssText = `
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  `;
  languageLabel.textContent = "🌐 " + (typeof t === 'function' ? t('language', 'Language') : 'Language');

  const languageSelect = document.createElement("select");
  languageSelect.id = "language-select";
  languageSelect.style.cssText = `
    padding: 6px 12px;
    background: var(--bg-input);
    color: var(--text-primary);
    border: 1px solid var(--border-input);
    border-radius: 6px;
    font-family: var(--font-body);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  const languages = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
    { value: "fr", label: "Français" }
  ];

  languages.forEach(function(lang) {
    const option = document.createElement("option");
    option.value = lang.value;
    option.textContent = lang.label;
    languageSelect.appendChild(option);
  });

  const savedLanguage = localStorage.getItem("language") || "en";
  languageSelect.value = savedLanguage;

  languageSelect.addEventListener("change", function() {
    const selected = this.value;
    if (typeof changeLanguage === 'function') {
      changeLanguage(selected);
    } else {
      localStorage.setItem("language", selected);
      const langName = languages.find(l => l.value === selected)?.label || selected;
      showToast("🌐 Language changed to " + langName, "info");
      setTimeout(function() {
        location.reload();
      }, 500);
    }
  });

  languageRow.appendChild(languageLabel);
  languageRow.appendChild(languageSelect);
  displaySettings.appendChild(languageRow);

  settingsSection.appendChild(displaySettings);

  // ===== إعدادات البيانات =====
  const dataSettings = document.createElement("div");
  dataSettings.style.cssText = `
    margin-bottom: 0;
  `;

  const dataTitle = document.createElement("h4");
  dataTitle.style.cssText = `
    font-family: var(--font-handwritten);
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 12px 0;
  `;
  dataTitle.textContent = typeof t === 'function' ? t('data_backup', 'Data') : "Data";
  dataSettings.appendChild(dataTitle);

  const dataRow = document.createElement("div");
  dataRow.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    margin-bottom: 8px;
  `;

  const dataLabel = document.createElement("span");
  dataLabel.style.cssText = `
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  `;
  dataLabel.textContent = "🗑️ " + (typeof t === 'function' ? t('clear_all_data', 'Clear All Data') : 'Clear All Data');

  const clearDataBtn = document.createElement("button");
  clearDataBtn.style.cssText = `
    padding: 6px 16px;
    background: transparent;
    color: #ef4444;
    border: 1px solid #ef4444;
    border-radius: 6px;
    font-family: var(--font-handwritten);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  clearDataBtn.textContent = typeof t === 'function' ? t('clear', 'Clear') : "Clear";

  clearDataBtn.addEventListener("mouseenter", function() {
    this.style.background = "#ef4444";
    this.style.color = "white";
    this.style.transform = "scale(1.05)";
  });

  clearDataBtn.addEventListener("mouseleave", function() {
    this.style.background = "transparent";
    this.style.color = "#ef4444";
    this.style.transform = "scale(1)";
  });

  clearDataBtn.addEventListener("click", function() {
    if (confirm("⚠️ Are you sure you want to delete ALL your data?\n\nThis includes:\n- All tasks\n- All notes\n- All events\n- All programs\n- All routine data\n- All notifications\n- Your profile settings\n\nThis action cannot be undone!")) {
      if (confirm("⚠️ Last chance! Are you absolutely sure?")) {
        const keys = [
          "myLifeHub_routine",
          "myLifeHub_tasks",
          "myLifeHub_notes_v2",
          "myLifeHub_events",
          "myLifeHub_programs",
          "myLifeHub_profile",
          "myLifeHub_notifications",
          "myLifeHub_backup_metadata"
        ];
        
        keys.forEach(function(key) {
          localStorage.removeItem(key);
        });
        
        showToast("🗑️ All data has been cleared. Refreshing...", "error");
        
        setTimeout(function() {
          location.reload();
        }, 1500);
      }
    }
  });

  dataRow.appendChild(dataLabel);
  dataRow.appendChild(clearDataBtn);
  dataSettings.appendChild(dataRow);

  settingsSection.appendChild(dataSettings);
  app.appendChild(settingsSection);

  // ========================================
  // ===== ACHIEVEMENTS SECTION =====
  // ========================================

  const achievementsSection = document.createElement("div");
  achievementsSection.className = "profile-section";

  const achievementsTitle = document.createElement("h3");
  achievementsTitle.className = "profile-section-title";
  
  const achTitleWrapper = document.createElement("div");
  achTitleWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  `;
  
  const achIcon = document.createElement("span");
  achIcon.setAttribute("data-lucide", "trophy");
  achIcon.style.cssText = `
    width: 24px;
    height: 24px;
    color: var(--primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `;
  
  const achText = document.createElement("span");
  achText.className = "profile-section-title";
  achText.textContent = typeof t === 'function' ? t('achievements', 'Achievements') : "Achievements";
  achText.style.marginBottom = "0";
  
  achTitleWrapper.appendChild(achIcon);
  achTitleWrapper.appendChild(achText);
  achievementsSection.appendChild(achTitleWrapper);

  const stats2 = getProfileStats();
  const achievementBadge = document.createElement("div");
  achievementBadge.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--bg-surface);
    border-radius: 8px;
    margin-bottom: 12px;
    border: 1px solid var(--border-light);
  `;

  const badgeLabel = document.createElement("span");
  badgeLabel.textContent = "✅ " + (typeof t === 'function' ? t('completed_tasks', 'Completed Tasks') : 'Completed Tasks');
  badgeLabel.style.cssText = "font-weight: 500; color: var(--text-primary);";

  const badgeCount = document.createElement("span");
  badgeCount.textContent = stats2.completedTasks;
  badgeCount.style.cssText = `
    font-size: 20px;
    font-weight: 700;
    color: var(--primary);
  `;

  achievementBadge.appendChild(badgeLabel);
  achievementBadge.appendChild(badgeCount);
  achievementsSection.appendChild(achievementBadge);

  const achievementsDesc = document.createElement("p");
  achievementsDesc.style.cssText = `
    color: var(--text-muted);
    font-size: 14px;
    margin-bottom: 12px;
    font-family: var(--font-body);
  `;
  achievementsDesc.textContent = typeof t === 'function' ? t('view_achievements', 'View all your completed tasks and achievements.') : "View all your completed tasks and achievements.";
  achievementsSection.appendChild(achievementsDesc);

  const viewBtn = document.createElement("button");
  viewBtn.textContent = "📊 " + (typeof t === 'function' ? t('view_achievements', 'View Achievements') : 'View Achievements');
  viewBtn.style.cssText = `
    width: 100%;
    padding: 12px;
    background: var(--primary-gradient);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: var(--font-handwritten);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  viewBtn.addEventListener("mouseenter", function() {
    this.style.transform = "translateY(-2px)";
    this.style.boxShadow = "var(--shadow-md)";
  });

  viewBtn.addEventListener("mouseleave", function() {
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "none";
  });

  viewBtn.addEventListener("click", function() {
    if (typeof window.navigateTo === "function") {
      window.navigateTo("completed");
    } 
    else if (typeof navigateTo === "function") {
      navigateTo("completed");
    }
    else if (typeof renderCompleted === "function") {
      document.querySelectorAll(".nav-btn, .bottom-nav-btn").forEach(function(btn) {
        btn.classList.remove("active");
      });
      renderCompleted();
    } else {
      alert("Achievements page is not available. Please check if Achievements.js is loaded.");
    }
  });

  achievementsSection.appendChild(viewBtn);
  app.appendChild(achievementsSection);

  // ========================================
  // ===== BACKUP SECTION =====
  // ========================================

  if (typeof renderBackupSection === 'function') {
    const backupSection = renderBackupSection();
    app.appendChild(backupSection);
  }

  // ===== Member Since =====
  const memberSection = document.createElement("div");
  memberSection.className = "profile-section";
  memberSection.style.borderBottom = "none";
  memberSection.style.textAlign = "center";

  const memberWrapper = document.createElement("div");
  memberWrapper.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  `;
  
  const memberIcon = document.createElement("span");
  memberIcon.setAttribute("data-lucide", "calendar");
  memberIcon.style.cssText = `
    width: 18px;
    height: 18px;
    color: var(--text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `;

  const memberInfo = document.createElement("p");
  memberInfo.className = "profile-member-info";
  const joinDate = profile.joinDate ? new Date(profile.joinDate) : new Date();
  const memberText = typeof t === 'function' ? t('member_since', 'Member since') : 'Member since';
  memberInfo.textContent = memberText + " " + joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  memberInfo.style.margin = "0";

  memberWrapper.appendChild(memberIcon);
  memberWrapper.appendChild(memberInfo);
  memberSection.appendChild(memberWrapper);

  app.appendChild(memberSection);

  // ===== ✅ إعادة تهيئة أيقونات Lucide =====
  setTimeout(function() {
    if (typeof initLucideIcons === 'function') {
      initLucideIcons();
    }
  }, 50);

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

// ========================================
// Toast Notification
// ========================================

function showToast(message, type = "info") {
  const existingToast = document.getElementById("profile-toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = "profile-toast";
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: ${type === "success" ? "#4caf84" : type === "error" ? "#ef4444" : "#4f8edb"};
    color: white;
    border-radius: 12px;
    font-family: var(--font-handwritten);
    font-size: 16px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    max-width: 90%;
    text-align: center;
    animation: slideUp 0.3s ease;
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(function() {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(function() {
      toast.remove();
    }, 300);
  }, 4000);
}

// ========================================
// ✅ تصدير الدوال للاستخدام من ملفات أخرى
// ========================================

window.renderProfile = renderProfile;
window.getProfileStats = getProfileStats;
window.getProfileData = getProfileData;
window.saveProfileData = saveProfileData;
window.showToast = showToast;

console.log("✅ Profile.js loaded successfully!");
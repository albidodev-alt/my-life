// ========================================
// MY LIFE HUB - PROFILE (Optimized v2.0)
// (Image Compression + Quota Handling + Safe Save)
// ========================================

// ========================================
// ✅ ضغط الصورة (مهم جداً لتوفير مساحة localStorage)
// ========================================
function resizeImage(file, maxSize = 400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ========================================
// ✅ حفظ آمن مع معالجة QuotaExceededError
// ========================================
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.warn('⚠️ localStorage quota exceeded for key:', key);
      return {
        success: false,
        error: 'quota',
        message: 'Storage is full. Please free up space.'
      };
    }
    console.error('Error saving to localStorage:', err);
    return {
      success: false,
      error: 'unknown',
      message: err.message || 'Unknown error'
    };
  }
}

// ========================================
// ✅ التحقق من صحة الصورة
// ========================================
function isValidImageFile(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10 MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image (JPG, PNG, WebP, GIF)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image is too large (max 10 MB)' };
  }

  return { valid: true };
}

// ========================================
// عرض صفحة البروفايل
// ========================================
function renderProfile() {
  const app = document.getElementById("app");
  if (!app) return;

  // ===== جلب البيانات =====
  const profile = getProfileData();
  const stats = getProfileStats();
  const currentHourSystem = typeof getHourSystem === 'function' ? getHourSystem() : '12h';
  const savedLanguage = localStorage.getItem("language") || "en";

  // ===== بناء HTML كامل مرة واحدة =====
  app.innerHTML = `
    <button id="back-btn" class="profile-back-btn">
      ← ${typeof t === 'function' ? t('back', 'Back') : 'Back'}
    </button>

    <!-- ===== بطاقة البروفايل ===== -->
    <div class="profile-card">
      <div class="profile-avatar-container">
        <div class="profile-avatar-wrapper">
          <img
            id="profile-avatar-img"
            class="profile-avatar-img"
            src="${profile.avatar || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23e5e7eb%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2240%22 text-anchor=%22middle%22 fill=%22%239ca3af%22%3E👤%3C/text%3E%3C/svg%3E'}"
            alt="Avatar"
            title="${typeof t === 'function' ? t('change_photo', 'Click to change photo') : 'Click to change photo'}"
          />
          <input type="file" id="avatar-file-input" accept="image/*" style="display:none">
        </div>
      </div>

      <div class="profile-name" id="profile-name-display" title="${escapeHtmlProfile(profile.name || 'User 1')}">
        ${escapeHtmlProfile(profile.name || 'User 1')}
      </div>

      <div class="profile-bio" id="profile-bio-display" title="${escapeHtmlProfile(profile.bio || '')}">
        ${escapeHtmlProfile(profile.bio || 'Building my life one day at a time.')}
      </div>

      <!-- ===== شريط القطرات (قابل للضغط) ===== -->
      <div class="completed-counter-bar" id="drops-clickable" style="cursor: pointer;" title="${typeof t === 'function' ? t('drops_view', 'View collection') : 'View collection'}">
        <span class="completed-counter-drop" data-lucide="droplet"></span>
        <span class="completed-counter-number">${stats.completedTasks}</span>
        <span class="completed-counter-label">${typeof t === 'function' ? t('drops', 'Drops') : 'Drops'}</span>
      </div>

      <!-- ===== الإحصائيات ===== -->
      <div class="profile-stats-grid">
        <div class="profile-stat-box">
          <span data-lucide="list-checks" class="profile-stat-icon"></span>
          <div class="profile-stat-value">${stats.totalTasks}</div>
          <div class="profile-stat-label">${typeof t === 'function' ? t('tasks', 'Tasks') : 'Tasks'}</div>
        </div>
        <div class="profile-stat-box">
          <span data-lucide="check-circle" class="profile-stat-icon"></span>
          <div class="profile-stat-value">${stats.completedTasks}</div>
          <div class="profile-stat-label">${typeof t === 'function' ? t('done', 'Done') : 'Done'}</div>
        </div>
        <div class="profile-stat-box">
          <span data-lucide="calendar-days" class="profile-stat-icon"></span>
          <div class="profile-stat-value">${stats.daysPlanned}</div>
          <div class="profile-stat-label">${typeof t === 'function' ? t('days_planned', 'Days') : 'Days'}</div>
        </div>
      </div>
    </div>

    <!-- ===== About Me ===== -->
    <div class="profile-section">
      <div class="profile-section-header">
        <span data-lucide="user" class="profile-section-icon"></span>
        <h3 class="profile-section-title">${typeof t === 'function' ? t('about_me', 'About Me') : 'About Me'}</h3>
      </div>

      <div class="profile-field">
        <label class="profile-field-label" for="profile-name-input">
          ${typeof t === 'function' ? t('name', 'Name') : 'Name'}
        </label>
        <input
          type="text"
          id="profile-name-input"
          class="profile-field-input"
          value="${escapeHtmlProfile(profile.name || 'User 1')}"
          placeholder="${typeof t === 'function' ? t('name', 'Your name') : 'Your name'}"
          maxlength="20"
        />
        <div class="profile-char-counter" id="name-counter">
          ${(profile.name || 'User 1').length} / 20
        </div>
      </div>

      <div class="profile-field">
        <label class="profile-field-label" for="profile-bio-input">
          ${typeof t === 'function' ? t('bio', 'Bio') : 'Bio'}
        </label>
        <textarea
          id="profile-bio-input"
          class="profile-field-textarea"
          rows="3"
          maxlength="100"
          placeholder="${typeof t === 'function' ? t('bio', 'Tell us about yourself...') : 'Tell us about yourself...'}"
        >${escapeHtmlProfile(profile.bio || '')}</textarea>
        <div class="profile-char-counter" id="bio-counter">
          ${(profile.bio || 'Building my life one day at a time.').length} / 100
        </div>
      </div>
    </div>

    <!-- ===== الإعدادات ===== -->
    <div class="profile-section" id="settings-section">
      <div class="profile-section-header">
        <span data-lucide="settings" class="profile-section-icon"></span>
        <h3 class="profile-section-title">${typeof t === 'function' ? t('settings', 'Settings') : 'Settings'}</h3>
      </div>

      <h4 class="profile-subsection-title">${typeof t === 'function' ? t('display', 'Display') : 'Display'}</h4>

      <!-- ===== اللغة ===== -->
      <div class="profile-setting-row">
        <span class="profile-setting-label">
          <span data-lucide="globe" class="profile-setting-icon"></span>
          ${typeof t === 'function' ? t('language', 'Language') : 'Language'}
        </span>
        <select id="language-select" class="profile-setting-select">
          <option value="en" ${savedLanguage === 'en' ? 'selected' : ''}>English</option>
          <option value="ar" ${savedLanguage === 'ar' ? 'selected' : ''}>العربية</option>
          <option value="fr" ${savedLanguage === 'fr' ? 'selected' : ''}>Français</option>
        </select>
      </div>

      <!-- ===== نظام الساعات ===== -->
      <div class="profile-setting-row">
        <span class="profile-setting-label">
          <span data-lucide="clock" class="profile-setting-icon"></span>
          ${typeof t === 'function' ? t('hour_system', 'Hour System') : 'Hour System'}
        </span>
        <select id="hour-system-select" class="profile-setting-select">
          <option value="12h" ${currentHourSystem === '12h' ? 'selected' : ''}>12 ${typeof t === 'function' ? t('hours', 'hours') : 'hours'} (AM/PM)</option>
          <option value="24h" ${currentHourSystem === '24h' ? 'selected' : ''}>24 ${typeof t === 'function' ? t('hours', 'hours') : 'hours'}</option>
        </select>
      </div>

      <!-- ===== البيانات ===== -->
      <h4 class="profile-subsection-title">${typeof t === 'function' ? t('data_backup', 'Data') : 'Data'}</h4>

      <div class="profile-setting-row">
        <span class="profile-setting-label">
          <span data-lucide="trash-2" class="profile-setting-icon" style="color: #ef4444;"></span>
          ${typeof t === 'function' ? t('clear_all_data', 'Clear All Data') : 'Clear All Data'}
        </span>
        <button id="clear-data-btn" class="profile-clear-btn">
          ${typeof t === 'function' ? t('clear', 'Clear') : 'Clear'}
        </button>
      </div>
    </div>

    <!-- ===== PWA Install ===== -->
    <div class="profile-section" id="install-section">
      <div class="profile-section-header">
        <span data-lucide="download" class="profile-section-icon"></span>
        <h3 class="profile-section-title">${typeof t === 'function' ? t('install_app', 'Install App') : 'Install App'}</h3>
      </div>
      <button id="profile-install-btn" class="profile-install-btn" style="display:none;">
        <span data-lucide="download"></span>
        ${typeof t === 'function' ? t('install_app', 'Install App') : 'Install App'}
      </button>
    </div>

    <!-- ===== Achievements ===== -->
    <div class="profile-section">
      <div class="profile-section-header">
        <span data-lucide="trophy" class="profile-section-icon"></span>
        <h3 class="profile-section-title">${typeof t === 'function' ? t('achievements', 'Achievements') : 'Achievements'}</h3>
      </div>

      <div class="profile-badge-row">
        <span class="profile-badge-label">
          <span data-lucide="check-circle" style="width:16px;height:16px;color:#4caf84;"></span>
          ${typeof t === 'function' ? t('completed_tasks', 'Completed Tasks') : 'Completed Tasks'}
        </span>
        <span class="profile-badge-count">${stats.completedTasks}</span>
      </div>

      <p class="profile-section-desc">
        ${typeof t === 'function' ? t('view_achievements', 'View all your completed tasks and achievements.') : 'View all your completed tasks and achievements.'}
      </p>

      <button id="view-achievements-btn" class="profile-view-achievements-btn">
        <span data-lucide="bar-chart-3" style="width:18px;height:18px;"></span>
        ${typeof t === 'function' ? t('view_achievements', 'View Achievements') : 'View Achievements'}
      </button>
    </div>

    <!-- ===== Backup Section ===== -->
    <div id="backup-section-slot"></div>

    <!-- ===== Member Since ===== -->
    <div class="profile-section profile-member-section">
      <div class="profile-member-wrapper">
        <span data-lucide="calendar" style="width:18px;height:18px;color:var(--text-muted);"></span>
        <p class="profile-member-info">
          ${typeof t === 'function' ? t('member_since', 'Member since') : 'Member since'} 
          ${new Date(profile.joinDate || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  `;

  // ========================================
  // ✅ ربط الأحداث
  // ========================================

  // 1. زر الرجوع
  document.getElementById('back-btn')?.addEventListener('click', () => renderWeek());

  // 2. شريط القطرات
  document.getElementById('drops-clickable')?.addEventListener('click', function() {
    if (typeof renderDropsPage === 'function') {
      renderDropsPage();
    }
  });

  // ========================================
  // 3. صورة البروفايل (مع ضغط تلقائي)
  // ========================================
  const avatarImg = document.getElementById('profile-avatar-img');
  const fileInput = document.getElementById('avatar-file-input');

  avatarImg?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ التحقق من صحة الملف
    const validation = isValidImageFile(file);
    if (!validation.valid) {
      if (typeof showToast === 'function') {
        showToast('❌ ' + validation.error, 'error');
      }
      fileInput.value = '';
      return;
    }

    // ✅ إظهار مؤشر التحميل
    if (typeof showToast === 'function') {
      showToast('⏳ ' + (typeof t === 'function' ? t('loading', 'Processing image...') : 'Processing image...'), 'info', 2000);
    }

    try {
      // ✅ ضغط الصورة قبل الحفظ
      const compressedImage = await resizeImage(file, 400, 0.85);

      // ✅ حفظ آمن
      const currentProfile = getProfileData();
      currentProfile.avatar = compressedImage;

      const result = safeSetItem(PROFILE_KEY, JSON.stringify(currentProfile));

      if (!result.success) {
        if (typeof showToast === 'function') {
          showToast('❌ ' + (typeof t === 'function' ? t('storage_full', 'Storage is full. Please clear some data.') : 'Storage is full. Please clear some data.'), 'error');
        }
        fileInput.value = '';
        return;
      }

      // ✅ تحديث الصورة المعروضة
      avatarImg.src = compressedImage;
      updateUserHeader();

      if (typeof showToast === 'function') {
        showToast('✅ ' + (typeof t === 'function' ? t('photo_updated', 'Photo updated!') : 'Photo updated!'), 'success');
      }
    } catch (err) {
      console.error('Image processing error:', err);
      if (typeof showToast === 'function') {
        showToast('❌ ' + (typeof t === 'function' ? t('image_error', 'Failed to process image') : 'Failed to process image'), 'error');
      }
    }

    fileInput.value = '';
  });

  // ========================================
  // 4. حقل الاسم
  // ========================================
  const nameInput = document.getElementById('profile-name-input');
  const nameCounter = document.getElementById('name-counter');

  nameInput?.addEventListener('input', function() {
    if (this.value.length > 20) this.value = this.value.substring(0, 20);
    if (nameCounter) {
      nameCounter.textContent = this.value.length + ' / 20';
      nameCounter.style.color = this.value.length >= 20 ? '#ef4444' : 
                                this.value.length >= 17 ? '#f59e0b' : 'var(--text-muted)';
    }
  });

  nameInput?.addEventListener('change', function() {
    const newName = this.value.trim() || 'User 1';
    const currentProfile = getProfileData();
    currentProfile.name = newName;

    const result = safeSetItem(PROFILE_KEY, JSON.stringify(currentProfile));

    if (!result.success) {
      if (typeof showToast === 'function') {
        showToast('❌ ' + (typeof t === 'function' ? t('save_failed', 'Failed to save') : 'Failed to save'), 'error');
      }
      return;
    }

    const nameDisplay = document.getElementById('profile-name-display');
    if (nameDisplay) {
      nameDisplay.textContent = newName;
      nameDisplay.title = newName;
    }
    updateUserHeader();
  });

  // ========================================
  // 5. حقل البايو
  // ========================================
  const bioInput = document.getElementById('profile-bio-input');
  const bioCounter = document.getElementById('bio-counter');

  bioInput?.addEventListener('input', function() {
    if (this.value.length > 100) this.value = this.value.substring(0, 100);
    if (bioCounter) {
      bioCounter.textContent = this.value.length + ' / 100';
      bioCounter.style.color = this.value.length >= 100 ? '#ef4444' : 
                               this.value.length >= 85 ? '#f59e0b' : 'var(--text-muted)';
    }
  });

  bioInput?.addEventListener('change', function() {
    const newBio = this.value.trim();
    const currentProfile = getProfileData();
    currentProfile.bio = newBio;

    const result = safeSetItem(PROFILE_KEY, JSON.stringify(currentProfile));

    if (!result.success) {
      if (typeof showToast === 'function') {
        showToast('❌ ' + (typeof t === 'function' ? t('save_failed', 'Failed to save') : 'Failed to save'), 'error');
      }
      return;
    }

    const bioDisplay = document.getElementById('profile-bio-display');
    if (bioDisplay) {
      bioDisplay.textContent = newBio || 'Building my life one day at a time.';
      bioDisplay.title = newBio || '';
    }
  });

  // ========================================
  // 6. اللغة
  // ========================================
  document.getElementById('language-select')?.addEventListener('change', function() {
    if (typeof changeLanguage === 'function') {
      changeLanguage(this.value);
    } else {
      localStorage.setItem('language', this.value);
      location.reload();
    }
  });

  // ========================================
  // 7. نظام الساعات
  // ========================================
  document.getElementById('hour-system-select')?.addEventListener('change', function() {
    const selectedSystem = this.value;
    
    if (typeof setHourSystem === 'function') {
      setHourSystem(selectedSystem);
      
      const systemName = selectedSystem === '24h' ? '24h' : '12h (AM/PM)';
      if (typeof showToast === 'function') {
        showToast(`🕐 ${typeof t === 'function' ? t('hour_system', 'Hour System') : 'Hour System'}: ${systemName}`, 'success');
      }
    } else {
      localStorage.setItem('hourSystem', selectedSystem);
    }
  });

  // ========================================
  // 8. مسح البيانات
  // ========================================
  document.getElementById('clear-data-btn')?.addEventListener('click', function() {
    deleteModal({
      itemName: '',
      itemType: 'all',
      onConfirm: () => {
        deleteModal({
          itemName: '',
          itemType: 'all',
          onConfirm: () => {
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

            keys.forEach(key => localStorage.removeItem(key));

            // ✅ إبطال الكاش
            if (typeof routineCache !== 'undefined') routineCache = null;
            if (typeof tasksCache !== 'undefined') tasksCache = null;

            if (typeof showToast === 'function') {
              showToast('🗑️ ' + (typeof t === 'function' ? t('data_cleared', 'All data cleared') : 'All data cleared'), 'error');
            }

            setTimeout(() => location.reload(), 1500);
          }
        });
      }
    });
  });

  // ========================================
  // 9. PWA Install
  // ========================================
  const installBtn = document.getElementById('profile-install-btn');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  if (isStandalone) {
    if (installBtn) {
      installBtn.innerHTML = '✅ App Installed';
      installBtn.style.background = 'linear-gradient(135deg, #4caf84, #66bb6a)';
      installBtn.style.cursor = 'default';
      installBtn.disabled = true;
      installBtn.style.display = 'flex';
    }
  } else if (typeof deferredPrompt !== 'undefined' && deferredPrompt) {
    if (installBtn) {
      installBtn.style.display = 'flex';
      installBtn.addEventListener('click', () => {
        if (typeof handleInstallClick === 'function') handleInstallClick();
      });
    }
  }

  // ========================================
  // 10. Achievements
  // ========================================
  document.getElementById('view-achievements-btn')?.addEventListener('click', function() {
    if (typeof window.renderCompleted === 'function') {
      document.querySelectorAll(".nav-btn, .bottom-nav-btn").forEach(btn => btn.classList.remove("active"));
      window.renderCompleted();
    } else if (typeof navigateTo === 'function') {
      navigateTo('completed');
    }
  });

  // ========================================
  // 11. Backup Section
  // ========================================
  const backupSlot = document.getElementById('backup-section-slot');
  if (backupSlot) {
    if (typeof renderBackupSection === 'function') {
      try {
        const backupSection = renderBackupSection();
        if (backupSection && backupSection instanceof Node) {
          backupSlot.appendChild(backupSection);
        } else {
          throw new Error('renderBackupSection did not return a valid DOM node');
        }
      } catch (e) {
        console.warn('⚠️ Backup section failed to render:', e);
        const fallback = document.createElement('div');
        fallback.className = 'profile-section';
        fallback.innerHTML = `
          <div class="profile-section-header">
            <span data-lucide="database" class="profile-section-icon"></span>
            <h3 class="profile-section-title">${typeof t === 'function' ? t('data_backup', 'Data & Backup') : 'Data & Backup'}</h3>
          </div>
          <p style="color:var(--text-muted);font-size:14px;text-align:center;padding:12px;">
            ⚠️ ${typeof t === 'function' ? t('backup_unavailable', 'Backup section temporarily unavailable') : 'Backup section temporarily unavailable'}
          </p>
        `;
        backupSlot.appendChild(fallback);
      }
    } else {
      console.warn('⚠️ renderBackupSection not loaded yet');
      const fallback = document.createElement('div');
      fallback.className = 'profile-section';
      fallback.innerHTML = `
        <div class="profile-section-header">
          <span data-lucide="database" class="profile-section-icon"></span>
          <h3 class="profile-section-title">${typeof t === 'function' ? t('data_backup', 'Data & Backup') : 'Data & Backup'}</h3>
        </div>
        <p style="color:var(--text-muted);font-size:14px;text-align:center;padding:12px;">
          ⏳ ${typeof t === 'function' ? t('loading', 'Loading...') : 'Loading...'}
        </p>
      `;
      backupSlot.appendChild(fallback);
    }
  }

  // ========================================
  // 12. إعادة تهيئة Lucide
  // ========================================
  if (typeof debouncedLucide === 'function') debouncedLucide(30);

  updateUserHeader();
}

// ========================================
// Helper: Escape HTML
// ========================================
function escapeHtmlProfile(text) {
  if (typeof escapeHtml === "function") return escapeHtml(text);
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// دوال الإحصائيات
// ========================================
function getProfileStats() {
  const tasks = typeof getAllTasks === 'function' ? getAllTasks() : [];
  const routineData = typeof getAllRoutineData === 'function' ? getAllRoutineData() : {};

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  let daysPlanned = 0;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  days.forEach(day => {
    const data = routineData[day];
    if (data && data.hours) {
      if (data.hours.some(h => {
        if (!h) return false;
        if (typeof h === 'string') return h.trim() !== '';
        if (typeof h === 'object') return !!(h.activity && h.activity.trim() !== '');
        return false;
      })) {
        daysPlanned++;
      }
    }
  });

  return { totalTasks, completedTasks, daysPlanned };
}

// ========================================
// تخزين البروفايل
// ========================================
const PROFILE_KEY = "myLifeHub_profile";

function getProfileData() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name || "User 1",
        bio: parsed.bio || "Building my life one day at a time.",
        avatar: parsed.avatar || "",
        joinDate: parsed.joinDate || new Date().toISOString()
      };
    } catch (e) {
      console.warn('Failed to parse profile, using default');
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
  if (data.name && data.name.length > 20) data.name = data.name.substring(0, 20);
  if (data.bio && data.bio.length > 100) data.bio = data.bio.substring(0, 100);

  const result = safeSetItem(PROFILE_KEY, JSON.stringify(data));

  if (!result.success && typeof showToast === 'function') {
    showToast('❌ ' + (result.message || 'Failed to save profile'), 'error');
  }

  if (typeof updateUserHeader === 'function') updateUserHeader();

  return result.success;
}

// ========================================
// التصدير
// ========================================
window.renderProfile = renderProfile;
window.getProfileStats = getProfileStats;
window.getProfileData = getProfileData;
window.saveProfileData = saveProfileData;
window.resizeImage = resizeImage;
window.safeSetItem = safeSetItem;
window.isValidImageFile = isValidImageFile;

console.log("✅ Profile.js v2.0 (optimized) loaded successfully!");
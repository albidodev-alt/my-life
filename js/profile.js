// ========================================
// MY LIFE HUB - PROFILE v2.7
// (Performance Optimized + Lazy Load drops.js + Local DOM refs + Theme Support)
// ========================================

// ========================================
// ✅ ضغط الصورة
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
// ✅ التحقق من صحة الصورة
// ========================================
function isValidImageFile(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image (JPG, PNG, WebP, GIF)' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: 'Image is too large (max 10 MB)' };
  }
  return { valid: true };
}

// ========================================
// ✅ Debounce helper
// ========================================
function _profileDebounce(fn, delay = 400) {
  if (typeof debounce === 'function') return debounce(fn, delay);
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ========================================
// ✅ أسماء اللغات وأنظمة الساعات (مع كاش)
// ========================================
function getLanguageDisplayName(code) {
  const names = {
    en: 'English',
    ar: 'العربية',
    fr: 'Français'
  };
  return names[code] || code;
}

function _getCurrentLanguage() {
  if (typeof window.getCachedLanguage === 'function') {
    const cached = window.getCachedLanguage();
    if (cached) return cached;
  }
  try {
    return localStorage.getItem('language') || 'en';
  } catch (e) {
    return 'en';
  }
}

function _getCurrentHourSystem() {
  if (typeof window.getCachedHourSystem === 'function') {
    const cached = window.getCachedHourSystem();
    if (cached) return cached;
  }
  try {
    return localStorage.getItem('hourSystem') || '12h';
  } catch (e) {
    return '12h';
  }
}

function getHourSystemDisplayName(system) {
  const lang = _getCurrentLanguage();
  if (system === '24h') {
    if (lang === 'ar') return '24 ساعة';
    if (lang === 'fr') return '24 heures';
    return '24-Hour';
  }
  if (lang === 'ar') return '12 ساعة (AM/PM)';
  if (lang === 'fr') return '12 heures (AM/PM)';
  return '12-Hour (AM/PM)';
}

// ========================================
// ✅ اسم وضع الثيم (للعرض)
// ========================================
function getThemeModeDisplayName(mode) {
  const lang = _getCurrentLanguage();

  const names = {
    light: { en: 'Light', ar: 'فاتح', fr: 'Clair' },
    dark: { en: 'Dark', ar: 'ليلي', fr: 'Sombre' },
    auto: { en: 'Auto (System)', ar: 'تلقائي (النظام)', fr: 'Auto (Système)' }
  };

  const entry = names[mode] || names.auto;
  return entry[lang] || entry.en;
}

// ========================================
// ✅ نافذة تغيير اللغة
// ========================================
function openLanguageModal() {
  const currentLang = _getCurrentLanguage();

  const modal = createModal({
    id: 'language-modal',
    title: '<span data-lucide="languages"></span> ' + (typeof t === 'function' ? t('language', 'Language') : 'Language'),
    size: 'small'
  });

  const list = document.createElement('div');
  list.className = 'setting-choice-list';

  const languages = ['en', 'ar', 'fr'];

  languages.forEach(code => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'setting-choice-item' + (code === currentLang ? ' selected' : '');

    const icon = document.createElement('span');
    icon.className = 'setting-choice-icon';
    icon.innerHTML = '<span data-lucide="languages"></span>';

    const label = document.createElement('span');
    label.className = 'setting-choice-label';
    label.textContent = getLanguageDisplayName(code);

    const check = document.createElement('span');
    check.className = 'setting-choice-check';
    check.innerHTML = '<span data-lucide="check"></span>';

    item.appendChild(icon);
    item.appendChild(label);
    item.appendChild(check);

    item.addEventListener('click', function() {
      modal.close();

      if (code === currentLang) return;

      setTimeout(() => {
        if (typeof changeLanguage === 'function') {
          changeLanguage(code);
          if (typeof showToast === 'function') {
            showToast('🌐 ' + getLanguageDisplayName(code), 'success');
          }
        } else {
          localStorage.setItem('language', code);
          if (typeof window.updateCachedLanguage === 'function') {
            window.updateCachedLanguage(code);
          }
          location.reload();
        }
      }, 250);
    });

    list.appendChild(item);
  });

  modal.body.appendChild(list);

  const actions = createModalActions([
    {
      label: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
      type: 'secondary',
      onClick: () => modal.close()
    }
  ]);
  modal.body.appendChild(actions);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// ✅ نافذة تغيير نظام الساعات
// ========================================
function openHourSystemModal() {
  const currentSystem = _getCurrentHourSystem();

  const modal = createModal({
    id: 'hour-system-modal',
    title: '<span data-lucide="clock"></span> ' + (typeof t === 'function' ? t('hour_system', 'Hour Format') : 'Hour Format'),
    size: 'small'
  });

  const list = document.createElement('div');
  list.className = 'setting-choice-list';

  const systems = ['12h', '24h'];

  systems.forEach(system => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'setting-choice-item' + (system === currentSystem ? ' selected' : '');

    const icon = document.createElement('span');
    icon.className = 'setting-choice-icon';
    icon.innerHTML = '<span data-lucide="clock"></span>';

    const label = document.createElement('span');
    label.className = 'setting-choice-label';
    label.textContent = getHourSystemDisplayName(system);

    const check = document.createElement('span');
    check.className = 'setting-choice-check';
    check.innerHTML = '<span data-lucide="check"></span>';

    item.appendChild(icon);
    item.appendChild(label);
    item.appendChild(check);

    item.addEventListener('click', function() {
      modal.close();

      if (system === currentSystem) return;

      setTimeout(() => {
        if (typeof setHourSystem === 'function') {
          setHourSystem(system);
        } else {
          localStorage.setItem('hourSystem', system);
          if (typeof window.updateCachedHourSystem === 'function') {
            window.updateCachedHourSystem(system);
          }
        }

        updateProfileSettingRows();

        if (typeof showToast === 'function') {
          showToast('🕐 ' + getHourSystemDisplayName(system), 'success');
        }
      }, 250);
    });

    list.appendChild(item);
  });

  modal.body.appendChild(list);

  const actions = createModalActions([
    {
      label: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
      type: 'secondary',
      onClick: () => modal.close()
    }
  ]);
  modal.body.appendChild(actions);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}
// ========================================
// ✅ نافذة اختيار الثيم (Light / Dark فقط)
// ========================================
function openThemeModal() {
  const currentMode = (typeof getThemeMode === 'function') ? getThemeMode() : 'light';

  const modal = createModal({
    id: 'theme-modal',
    title: '<span data-lucide="palette"></span> ' + (typeof t === 'function' ? t('theme', 'Theme') : 'Theme'),
    size: 'small'
  });

  const list = document.createElement('div');
  list.className = 'setting-choice-list';

  // ✅ خياران فقط: فاتح وليلي (بدون تلقائي)
  const themes = [
    { mode: 'light', icon: 'sun', labelEn: 'Light', labelAr: 'فاتح', labelFr: 'Clair' },
    { mode: 'dark', icon: 'moon', labelEn: 'Dark', labelAr: 'ليلي', labelFr: 'Sombre' }
  ];

  const lang = _getCurrentLanguage();

  themes.forEach(theme => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'setting-choice-item' + (theme.mode === currentMode ? ' selected' : '');

    const icon = document.createElement('span');
    icon.className = 'setting-choice-icon';
    icon.innerHTML = `<span data-lucide="${theme.icon}"></span>`;

    const label = document.createElement('span');
    label.className = 'setting-choice-label';
    if (lang === 'ar') label.textContent = theme.labelAr;
    else if (lang === 'fr') label.textContent = theme.labelFr;
    else label.textContent = theme.labelEn;

    const check = document.createElement('span');
    check.className = 'setting-choice-check';
    check.innerHTML = '<span data-lucide="check"></span>';

    item.appendChild(icon);
    item.appendChild(label);
    item.appendChild(check);

    item.addEventListener('click', function() {
      modal.close();

      if (theme.mode === currentMode) return;

      setTimeout(() => {
        if (typeof setTheme === 'function') {
          setTheme(theme.mode);

          const displayName = lang === 'ar' ? theme.labelAr :
                              lang === 'fr' ? theme.labelFr :
                              theme.labelEn;

          if (typeof showToast === 'function') {
            showToast('🎨 ' + displayName, 'success');
          }

          // ✅ تحديث الصف في الإعدادات
          updateProfileSettingRows();
        }
      }, 250);
    });

    list.appendChild(item);
  });

  modal.body.appendChild(list);

  const actions = createModalActions([
    {
      label: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
      type: 'secondary',
      onClick: () => modal.close()
    }
  ]);
  modal.body.appendChild(actions);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// ✅ تحديث صفوف الإعدادات
// ========================================
function updateProfileSettingRows() {
  const langValue = document.getElementById('language-row-value');
  const hourValue = document.getElementById('hour-system-row-value');
  const themeValue = document.getElementById('theme-row-value');

  if (langValue) {
    langValue.textContent = getLanguageDisplayName(_getCurrentLanguage());
  }

  if (hourValue) {
    hourValue.textContent = getHourSystemDisplayName(_getCurrentHourSystem());
  }

  if (themeValue && typeof getThemeMode === 'function') {
    themeValue.textContent = getThemeModeDisplayName(getThemeMode());
  }
}

// ========================================
// عرض صفحة البروفايل (✅ محسّن للأداء)
// ========================================
function renderProfile() {
  const app = document.getElementById("app");
  if (!app) return;

  const profile = getProfileData();
  const stats = getProfileStats();
  const currentHourSystem = _getCurrentHourSystem();
  const savedLanguage = _getCurrentLanguage();
  const currentThemeMode = (typeof getThemeMode === 'function') ? getThemeMode() : 'auto';

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

      <div class="completed-counter-bar" id="drops-clickable" style="cursor: pointer;">
        <span class="completed-counter-drop" data-lucide="droplet"></span>
        <span class="completed-counter-number">${stats.completedTasks}</span>
        <span class="completed-counter-label">${typeof t === 'function' ? t('drops', 'Drops') : 'Drops'}</span>
      </div>

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
      <div class="profile-setting-row clickable" id="language-row" role="button" tabindex="0">
        <span class="profile-setting-label">
          <span data-lucide="globe" class="profile-setting-icon"></span>
          ${typeof t === 'function' ? t('language', 'Language') : 'Language'}
        </span>
        <span class="setting-row-value" id="language-row-value">${getLanguageDisplayName(savedLanguage)}</span>
        <span class="setting-row-arrow" data-lucide="chevron-right"></span>
      </div>

      <!-- ===== نظام الساعات ===== -->
      <div class="profile-setting-row clickable" id="hour-system-row" role="button" tabindex="0">
        <span class="profile-setting-label">
          <span data-lucide="clock" class="profile-setting-icon"></span>
          ${typeof t === 'function' ? t('hour_system', 'Hour System') : 'Hour System'}
        </span>
        <span class="setting-row-value" id="hour-system-row-value">${getHourSystemDisplayName(currentHourSystem)}</span>
        <span class="setting-row-arrow" data-lucide="chevron-right"></span>
      </div>

      <!-- ===== الثيم (جديد) ===== -->
      <div class="profile-setting-row clickable" id="theme-row" role="button" tabindex="0">
        <span class="profile-setting-label">
          <span data-lucide="palette" class="profile-setting-icon"></span>
          ${typeof t === 'function' ? t('theme', 'Theme') : 'Theme'}
        </span>
        <span class="setting-row-value" id="theme-row-value">${getThemeModeDisplayName(currentThemeMode)}</span>
        <span class="setting-row-arrow" data-lucide="chevron-right"></span>
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
  // ✅ ربط الأحداث (محسّن: متغيرات DOM محلية)
  // ========================================

  // 1. زر الرجوع
  document.getElementById('back-btn')?.addEventListener('click', () => renderWeek());

    // ========================================
  // ✅ حماية حقول البروفايل من Password Managers
  // ========================================
  setTimeout(() => {
    const nameInput = document.getElementById('profile-name-input');
    const bioInput = document.getElementById('profile-bio-input');
    
    if (nameInput && typeof window._applyInputProtection === 'function') {
      window._applyInputProtection(nameInput, 'name');
    }
    if (bioInput && typeof window._applyInputProtection === 'function') {
      window._applyInputProtection(bioInput, 'content');
    }
  }, 0);
  // ========================================
  // 2. شريط القطرات (✅ Lazy Load drops.js)
  // ========================================
  document.getElementById('drops-clickable')?.addEventListener('click', async function() {
    try {
      if (typeof renderDropsPage === 'undefined') {
        console.log('📌 Loading drops.js dynamically...');

        if (typeof window.loadModule === "function") {
          await window.loadModule('drops');
        } else {
          await import('./drops.js');
        }

        console.log('✅ drops.js loaded successfully');
      }

      if (typeof renderDropsPage === 'function') {
        renderDropsPage();
      } else {
        console.error("❌ renderDropsPage still not defined after loading drops.js");
        if (typeof showToast === 'function') {
          showToast('❌ Failed to open drops. Please try again.', 'error');
        }
      }
    } catch (error) {
      console.error("❌ Failed to open drops page:", error);
      if (typeof showToast === 'function') {
        showToast('❌ Failed to open drops. Please try again.', 'error');
      }
    }
  });

  // 3. صف اللغة
  const languageRow = document.getElementById('language-row');
  if (languageRow) {
    languageRow.addEventListener('click', function() {
      openLanguageModal();
    });
    languageRow.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLanguageModal();
      }
    });
  }

  // 4. صف نظام الساعات
  const hourSystemRow = document.getElementById('hour-system-row');
  if (hourSystemRow) {
    hourSystemRow.addEventListener('click', function() {
      openHourSystemModal();
    });
    hourSystemRow.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openHourSystemModal();
      }
    });
  }

  // 5. صف الثيم (جديد)
  const themeRow = document.getElementById('theme-row');
  if (themeRow) {
    themeRow.addEventListener('click', function() {
      openThemeModal();
    });
    themeRow.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openThemeModal();
      }
    });
  }

  // ========================================
  // 6. صورة البروفايل
  // ========================================
  const avatarImg = document.getElementById('profile-avatar-img');
  const fileInput = document.getElementById('avatar-file-input');

  avatarImg?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const validation = isValidImageFile(file);
    if (!validation.valid) {
      if (typeof showToast === 'function') {
        showToast('❌ ' + validation.error, 'error');
      }
      fileInput.value = '';
      return;
    }

    if (typeof showToast === 'function') {
      showToast('⏳ ' + (typeof t === 'function' ? t('loading', 'Processing image...') : 'Processing image...'), 'info', 2000);
    }

    try {
      const compressedImage = await resizeImage(file, 400, 0.85);

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
  // 7. حقل الاسم (✅ محسّن: متغيرات DOM محلية)
  // ========================================
  const nameInput = document.getElementById('profile-name-input');
  const nameCounter = document.getElementById('name-counter');
  const nameDisplay = document.getElementById('profile-name-display');

  nameInput?.addEventListener('input', function() {
    const len = this.value.length;
    if (len > 20) this.value = this.value.substring(0, 20);
    if (nameCounter) {
      nameCounter.textContent = len + ' / 20';
      nameCounter.style.color = len >= 20 ? '#ef4444' :
                                len >= 17 ? '#f59e0b' : 'var(--text-muted)';
    }
  });

  const saveNameDebounced = _profileDebounce(function() {
    const newName = nameInput.value.trim() || 'User 1';
    const currentProfile = getProfileData();
    if (currentProfile.name === newName) return;
    currentProfile.name = newName;

    const result = safeSetItem(PROFILE_KEY, JSON.stringify(currentProfile));
    if (!result.success) {
      if (typeof showToast === 'function') {
        showToast('❌ ' + (typeof t === 'function' ? t('save_failed', 'Failed to save') : 'Failed to save'), 'error');
      }
      return;
    }

    if (nameDisplay) {
      nameDisplay.textContent = newName;
      nameDisplay.title = newName;
    }
    updateUserHeader();
  }, 500);

  nameInput?.addEventListener('input', saveNameDebounced);

  nameInput?.addEventListener('blur', function() {
    const newName = this.value.trim() || 'User 1';
    const currentProfile = getProfileData();
    if (currentProfile.name === newName) return;
    currentProfile.name = newName;

    const result = safeSetItem(PROFILE_KEY, JSON.stringify(currentProfile));
    if (!result.success) return;

    if (nameDisplay) {
      nameDisplay.textContent = newName;
      nameDisplay.title = newName;
    }
    updateUserHeader();
  });

  // ========================================
  // 8. حقل البايو (✅ محسّن: متغيرات DOM محلية)
  // ========================================
  const bioInput = document.getElementById('profile-bio-input');
  const bioCounter = document.getElementById('bio-counter');
  const bioDisplay = document.getElementById('profile-bio-display');

  bioInput?.addEventListener('input', function() {
    const len = this.value.length;
    if (len > 100) this.value = this.value.substring(0, 100);
    if (bioCounter) {
      bioCounter.textContent = len + ' / 100';
      bioCounter.style.color = len >= 100 ? '#ef4444' :
                               len >= 85 ? '#f59e0b' : 'var(--text-muted)';
    }
  });

  const saveBioDebounced = _profileDebounce(function() {
    const newBio = bioInput.value.trim();
    const currentProfile = getProfileData();
    if (currentProfile.bio === newBio) return;
    currentProfile.bio = newBio;

    const result = safeSetItem(PROFILE_KEY, JSON.stringify(currentProfile));
    if (!result.success) {
      if (typeof showToast === 'function') {
        showToast('❌ ' + (typeof t === 'function' ? t('save_failed', 'Failed to save') : 'Failed to save'), 'error');
      }
      return;
    }

    if (bioDisplay) {
      bioDisplay.textContent = newBio || 'Building my life one day at a time.';
      bioDisplay.title = newBio || '';
    }
  }, 500);

  bioInput?.addEventListener('input', saveBioDebounced);

  bioInput?.addEventListener('blur', function() {
    const newBio = this.value.trim();
    const currentProfile = getProfileData();
    if (currentProfile.bio === newBio) return;
    currentProfile.bio = newBio;

    const result = safeSetItem(PROFILE_KEY, JSON.stringify(currentProfile));
    if (!result.success) return;

    if (bioDisplay) {
      bioDisplay.textContent = newBio || 'Building my life one day at a time.';
      bioDisplay.title = newBio || '';
    }
  });

  // ========================================
  // 9. مسح البيانات (مع إبطال الكاشات)
  // ========================================
  document.getElementById('clear-data-btn')?.addEventListener('click', function() {
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
          "myLifeHub_achievement_stats",
          "myLifeHub_backup_metadata"
        ];

        keys.forEach(key => localStorage.removeItem(key));

        if (typeof invalidateAllCaches === 'function') {
          invalidateAllCaches();
        }
        if (typeof clearAchievementStats === 'function') {
          clearAchievementStats();
        }
        if (typeof invalidateNotificationsCache === 'function') {
          invalidateNotificationsCache();
        }

        if (typeof showToast === 'function') {
          showToast('🗑️ ' + (typeof t === 'function' ? t('data_cleared', 'All data cleared') : 'All data cleared'), 'error');
        }

        setTimeout(() => location.reload(), 1500);
      }
    });
  });

  // ========================================
  // 10. PWA Install
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
  // 11. Achievements (✅ يستخدم navigateTo للـ Lazy Load)
  // ========================================
  document.getElementById('view-achievements-btn')?.addEventListener('click', async function() {
    document.querySelectorAll(".nav-btn, .bottom-nav-btn").forEach(btn => btn.classList.remove("active"));

    if (typeof navigateTo === 'function') {
      await navigateTo('completed');
    } else if (typeof window.renderCompleted === 'function') {
      window.renderCompleted();
    }
  });

  // ========================================
  // 12. Backup Section
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
  // 13. إعادة تهيئة Lucide
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
// ========================================
// دوال الإحصائيات
// ========================================
function getProfileStats() {
  const tasks = typeof getAllTasks === 'function' ? getAllTasks() : [];
  const routineData = typeof getAllRoutineData === 'function' ? getAllRoutineData() : {};

  const totalTasks = tasks.length;

  // ✅ استخدام العداد التراكمي للمهام المنجزة
  const completedTasks = typeof getCompletedTasksCount === 'function'
    ? getCompletedTasksCount()
    : tasks.filter(t => t.completed).length;

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
window.isValidImageFile = isValidImageFile;
window.openLanguageModal = openLanguageModal;
window.openHourSystemModal = openHourSystemModal;
window.openThemeModal = openThemeModal;
window.updateProfileSettingRows = updateProfileSettingRows;
window.getLanguageDisplayName = getLanguageDisplayName;
window.getHourSystemDisplayName = getHourSystemDisplayName;
window.getThemeModeDisplayName = getThemeModeDisplayName;

console.log("✅ Profile.js v2.7 loaded successfully! (Theme Support)");
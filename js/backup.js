// ========================================
// MY LIFE - BACKUP & RESTORE SYSTEM v2.3
// (Safe Export + Strong Validation + Achievement Stats)
// (Lucide Icons - No Emojis)
// ========================================

// ========================================
// 1. تعريف المفاتيح والثوابت
// ========================================

const BACKUP_KEYS = {
    ROUTINE: "myLifeHub_routine",
    TASKS: "myLifeHub_tasks",
    NOTES: "myLifeHub_notes_v2",
    EVENTS: "myLifeHub_events",
    PROGRAMS: "myLifeHub_programs",
    PROFILE: "myLifeHub_profile",
    NOTIFICATIONS: "myLifeHub_notifications",
    STATS: "myLifeHub_achievement_stats"
};

const BACKUP_VERSION = 1;
const BACKUP_APP_NAME = "My Life";
const BACKUP_METADATA_KEY = "myLifeHub_backup_metadata";

// ========================================
// 2. جمع البيانات من localStorage
// ========================================

function collectAllData() {
    try {
        const data = {
            profile: getData(BACKUP_KEYS.PROFILE),
            routine: getData(BACKUP_KEYS.ROUTINE),
            tasks: getData(BACKUP_KEYS.TASKS),
            notes: getData(BACKUP_KEYS.NOTES),
            events: getData(BACKUP_KEYS.EVENTS),
            programs: getData(BACKUP_KEYS.PROGRAMS),
            notifications: getData(BACKUP_KEYS.NOTIFICATIONS),
            achievementStats: getData(BACKUP_KEYS.STATS)
        };

        return data;
    } catch (error) {
        console.error("Error collecting data:", error);
        return null;
    }
}

function getData(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return null;
    }
}

// ========================================
// 3. إنشاء Backup Object
// ========================================

function createBackupObject() {
    const data = collectAllData();
    if (!data) return null;

    const backup = {
        app: BACKUP_APP_NAME,
        version: BACKUP_VERSION,
        createdAt: new Date().toISOString(),
        data: data,
        metadata: calculateMetadata(data)
    };

    return backup;
}

function calculateMetadata(data) {
    const metadata = {
        totalTasks: Array.isArray(data.tasks) ? data.tasks.length : 0,
        totalNotes: Array.isArray(data.notes) ? data.notes.length : 0,
        totalEvents: Array.isArray(data.events) ? data.events.length : 0,
        totalPrograms: Array.isArray(data.programs) ? data.programs.length : 0,
        totalNotifications: Array.isArray(data.notifications) ? data.notifications.length : 0,
        daysWithRoutine: 0,
        totalAchievements: 0
    };

    if (data.achievementStats && typeof data.achievementStats === 'object') {
        metadata.totalAchievements = data.achievementStats.totalCompleted || 0;
    }

    if (data.routine && typeof data.routine === 'object') {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        let count = 0;
        days.forEach(day => {
            if (data.routine[day] && data.routine[day].hours) {
                const hasActivity = data.routine[day].hours.some(h => {
                    if (!h) return false;
                    if (typeof h === 'string') return h.trim() !== "";
                    if (typeof h === 'object') return !!(h.activity && h.activity.trim() !== "");
                    return false;
                });
                if (hasActivity) count++;
            }
        });
        metadata.daysWithRoutine = count;
    }

    return metadata;
}

// ========================================
// 4. تصدير Backup (Export)
// ========================================

function exportBackup() {
    try {
        const backup = createBackupObject();
        if (!backup) {
            if (typeof showToast === 'function') {
                showToast("❌ Failed to create backup", "error");
            }
            return false;
        }

        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });

        if (!window.URL || !window.URL.createObjectURL) {
            downloadViaDataURL(json);
            return true;
        }

        const url = URL.createObjectURL(blob);

        const date = new Date();
        const dateStr = date.getFullYear() + '-' +
                       String(date.getMonth() + 1).padStart(2, '0') + '-' +
                       String(date.getDate()).padStart(2, '0');
        const filename = `My-Life-Backup-${dateStr}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        saveBackupMetadata({
            lastExport: new Date().toISOString(),
            filename: filename,
            size: blob.size,
            totalItems: backup.metadata
        });

        if (typeof showToast === 'function') {
            showToast(`✅ Backup exported successfully! (${filename})`, "success");
        }
        return true;
    } catch (error) {
        console.error("Export error:", error);
        if (typeof showToast === 'function') {
            showToast("❌ Export failed: " + error.message, "error");
        }
        return false;
    }
}

function downloadViaDataURL(json) {
    const date = new Date();
    const dateStr = date.getFullYear() + '-' +
                   String(date.getMonth() + 1).padStart(2, '0') + '-' +
                   String(date.getDate()).padStart(2, '0');
    const filename = `My-Life-Backup-${dateStr}.json`;

    const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (typeof showToast === 'function') {
        showToast(`✅ Backup exported! (${filename})`, "success");
    }
}

// ========================================
// 5. استيراد Backup (Import)
// ========================================

function importBackup(file) {
    return new Promise((resolve, reject) => {
        if (file.size > 50 * 1024 * 1024) {
            reject({ error: "File is too large (max 50 MB)" });
            return;
        }

        const reader = new FileReader();

        reader.onload = function(event) {
            try {
                const content = event.target.result;
                const backup = JSON.parse(content);

                const validation = validateBackup(backup);
                if (!validation.valid) {
                    reject({ error: validation.error });
                    return;
                }

                const metadata = backup.metadata || calculateMetadata(backup.data);
                const preview = {
                    createdAt: backup.createdAt,
                    version: backup.version,
                    metadata: metadata,
                    data: backup.data
                };

                resolve(preview);
            } catch (error) {
                reject({ error: "Invalid JSON file: " + error.message });
            }
        };

        reader.onerror = function() {
            reject({ error: "Failed to read file" });
        };

        reader.readAsText(file);
    });
}

// ========================================
// 6. التحقق من صحة Backup
// ========================================

function validateBackup(backup) {
    if (!backup) {
        return { valid: false, error: "Backup is empty" };
    }

    if (typeof backup !== 'object' || Array.isArray(backup)) {
        return { valid: false, error: "Backup must be a JSON object" };
    }

    if (backup.app !== BACKUP_APP_NAME) {
        return { valid: false, error: "This backup does not belong to My Life" };
    }

    if (!backup.version || backup.version > BACKUP_VERSION) {
        return { valid: false, error: `Unsupported version: ${backup.version}. Current version: ${BACKUP_VERSION}` };
    }

    if (!backup.data || typeof backup.data !== 'object' || Array.isArray(backup.data)) {
        return { valid: false, error: "Backup data is missing or invalid" };
    }

    const requiredKeys = ['profile', 'routine', 'tasks', 'notes', 'events', 'programs', 'notifications'];
    const missingKeys = requiredKeys.filter(key => !(key in backup.data));

    if (missingKeys.length > 0) {
        return { valid: false, error: `Missing data sections: ${missingKeys.join(', ')}` };
    }

    const data = backup.data;

    if (data.tasks !== null && !Array.isArray(data.tasks)) {
        return { valid: false, error: "Invalid 'tasks' section: must be an array or null" };
    }

    if (data.notes !== null && !Array.isArray(data.notes)) {
        return { valid: false, error: "Invalid 'notes' section: must be an array or null" };
    }

    if (data.events !== null && !Array.isArray(data.events)) {
        return { valid: false, error: "Invalid 'events' section: must be an array or null" };
    }

    if (data.programs !== null && !Array.isArray(data.programs)) {
        return { valid: false, error: "Invalid 'programs' section: must be an array or null" };
    }

    if (data.notifications !== null && !Array.isArray(data.notifications)) {
        return { valid: false, error: "Invalid 'notifications' section: must be an array or null" };
    }

    if (data.routine !== null && (typeof data.routine !== 'object' || Array.isArray(data.routine))) {
        return { valid: false, error: "Invalid 'routine' section: must be an object or null" };
    }

    if (data.profile !== null && (typeof data.profile !== 'object' || Array.isArray(data.profile))) {
        return { valid: false, error: "Invalid 'profile' section: must be an object or null" };
    }

    if (data.achievementStats !== undefined && data.achievementStats !== null) {
        if (typeof data.achievementStats !== 'object' || Array.isArray(data.achievementStats)) {
            return { valid: false, error: "Invalid 'achievementStats' section: must be an object or null" };
        }
    }

    if (Array.isArray(data.tasks)) {
        for (let i = 0; i < data.tasks.length; i++) {
            const task = data.tasks[i];
            if (!task || typeof task !== 'object' || Array.isArray(task)) {
                return { valid: false, error: `Invalid task at index ${i}: must be an object` };
            }
        }
    }

    if (Array.isArray(data.notes)) {
        for (let i = 0; i < data.notes.length; i++) {
            const note = data.notes[i];
            if (!note || typeof note !== 'object' || Array.isArray(note)) {
                return { valid: false, error: `Invalid note at index ${i}: must be an object` };
            }
        }
    }

    if (Array.isArray(data.events)) {
        for (let i = 0; i < data.events.length; i++) {
            const event = data.events[i];
            if (!event || typeof event !== 'object' || Array.isArray(event)) {
                return { valid: false, error: `Invalid event at index ${i}: must be an object` };
            }
        }
    }

    if (Array.isArray(data.programs)) {
        for (let i = 0; i < data.programs.length; i++) {
            const program = data.programs[i];
            if (!program || typeof program !== 'object' || Array.isArray(program)) {
                return { valid: false, error: `Invalid program at index ${i}: must be an object` };
            }
        }
    }

    return { valid: true };
}

// ========================================
// 7. استعادة البيانات (Restore)
// ========================================

function restoreBackup(backupData) {
    try {
        const data = backupData.data;

        const oldValues = {};
        Object.values(BACKUP_KEYS).forEach(key => {
            oldValues[key] = localStorage.getItem(key);
        });

        try {
            if (data.profile) {
                localStorage.setItem(BACKUP_KEYS.PROFILE, JSON.stringify(data.profile));
            }

            if (data.routine) {
                localStorage.setItem(BACKUP_KEYS.ROUTINE, JSON.stringify(data.routine));
            }

            if (data.tasks) {
                localStorage.setItem(BACKUP_KEYS.TASKS, JSON.stringify(data.tasks));
            }

            if (data.notes) {
                localStorage.setItem(BACKUP_KEYS.NOTES, JSON.stringify(data.notes));
            }

            if (data.events) {
                localStorage.setItem(BACKUP_KEYS.EVENTS, JSON.stringify(data.events));
            }

            if (data.programs) {
                localStorage.setItem(BACKUP_KEYS.PROGRAMS, JSON.stringify(data.programs));
            }

            if (data.notifications) {
                localStorage.setItem(BACKUP_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
            }

            if (data.achievementStats) {
                localStorage.setItem(BACKUP_KEYS.STATS, JSON.stringify(data.achievementStats));
            } else {
                localStorage.removeItem(BACKUP_KEYS.STATS);
            }

            if (typeof invalidateAllCaches === 'function') {
                invalidateAllCaches();
            }

            saveBackupMetadata({
                lastRestore: new Date().toISOString(),
                restoredAt: backupData.createdAt,
                totalItems: backupData.metadata || calculateMetadata(backupData.data)
            });

            return true;

        } catch (innerError) {
            console.error("Restore failed, rolling back...", innerError);

            Object.entries(oldValues).forEach(([key, value]) => {
                try {
                    if (value === null) {
                        localStorage.removeItem(key);
                    } else {
                        localStorage.setItem(key, value);
                    }
                } catch (e) {
                    console.error("Rollback error:", e);
                }
            });

            throw innerError;
        }

    } catch (error) {
        console.error("Restore error:", error);
        throw error;
    }
}

// ========================================
// 8. عرض معلومات Backup (Preview)
// ========================================

function showBackupPreview(preview) {
    const metadata = preview.metadata;

    const modal = createModal({
        id: 'backup-preview-modal',
        title: '<span data-lucide="file-json"></span> ' + (typeof t === 'function' ? t('restore_backup', 'Restore Backup') : 'Restore Backup'),
        size: 'medium'
    });

    const infoBox = document.createElement('div');
    infoBox.style.cssText = `
        margin: 0 0 16px 0;
        padding: 12px;
        background: var(--bg-surface);
        border-radius: 8px;
        border: 1px solid var(--border-light);
    `;
    infoBox.innerHTML = `
        <p style="margin: 4px 0; font-size: 14px; color: var(--text-secondary);">
            <strong>${typeof t === 'function' ? t('created', 'Created') : 'Created'}:</strong> ${new Date(preview.createdAt).toLocaleString()}
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: var(--text-secondary);">
            <strong>${typeof t === 'function' ? t('version', 'Version') : 'Version'}:</strong> ${preview.version}
        </p>
    `;
    modal.body.appendChild(infoBox);

    const contentsBox = document.createElement('div');
    contentsBox.style.cssText = `
        margin: 0 0 16px 0;
        padding: 12px;
        background: var(--bg-card);
        border-radius: 8px;
        border: 1px solid var(--border-color);
    `;
    contentsBox.innerHTML = `
        <h4 style="margin: 0 0 8px 0; font-family: var(--font-handwritten); color: var(--text-primary);">
            ${typeof t === 'function' ? t('contains', 'Contains') : 'Contains'}:
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                <span data-lucide="list-checks" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span>
                ${typeof t === 'function' ? t('tasks', 'Tasks') : 'Tasks'}: ${metadata.totalTasks || 0}
            </div>
            <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                <span data-lucide="file-text" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span>
                ${typeof t === 'function' ? t('notes', 'Notes') : 'Notes'}: ${metadata.totalNotes || 0}
            </div>
            <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                <span data-lucide="calendar" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span>
                ${typeof t === 'function' ? t('events', 'Events') : 'Events'}: ${metadata.totalEvents || 0}
            </div>
            <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                <span data-lucide="graduation-cap" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span>
                ${typeof t === 'function' ? t('program', 'Programs') : 'Programs'}: ${metadata.totalPrograms || 0}
            </div>
            <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                <span data-lucide="bell" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span>
                ${typeof t === 'function' ? t('notifications', 'Notifications') : 'Notifications'}: ${metadata.totalNotifications || 0}
            </div>
            <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                <span data-lucide="calendar-days" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span>
                ${typeof t === 'function' ? t('routine', 'Routine Days') : 'Routine Days'}: ${metadata.daysWithRoutine || 0}
            </div>
            <div style="padding: 6px 10px; background: linear-gradient(135deg, rgba(79,142,219,0.10), rgba(109,168,232,0.05)); border-radius: 4px; font-size: 14px; color: var(--primary-dark); font-weight: 600;">
                <span data-lucide="trophy" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span>
                ${typeof t === 'function' ? t('achievements', 'Achievements') : 'Achievements'}: ${metadata.totalAchievements || 0}
            </div>
        </div>
    `;
    modal.body.appendChild(contentsBox);

    const warningBox = document.createElement('div');
    warningBox.className = 'modal-base-warning';
    warningBox.innerHTML = `
        <span data-lucide="alert-triangle"></span>
        <span>${typeof t === 'function' ? t('restore_warning', 'Restoring this backup will replace all your current data.') : 'Restoring this backup will replace all your current data.'}</span>
    `;
    modal.body.appendChild(warningBox);

    const actions = createModalActions([
        {
            label: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
            type: 'secondary',
            onClick: () => modal.close()
        },
        {
            label: '<span data-lucide="rotate-ccw"></span> ' + (typeof t === 'function' ? t('restore_backup', 'Restore Backup') : 'Restore Backup'),
            type: 'danger',
            onClick: () => {
                modal.close();
                confirmModal({
                    title: '<span data-lucide="alert-octagon"></span> ' + (typeof t === 'function' ? t('confirm_restore', 'Confirm Restore') : 'Confirm Restore'),
                    message: typeof t === 'function'
                        ? 'سيتم استبدال جميع بياناتك الحالية ببيانات النسخة الاحتياطية. هل أنت متأكد؟'
                        : 'This will REPLACE all your current data with the backup data. Are you sure?',
                    confirmLabel: typeof t === 'function' ? t('yes_restore', 'Yes, Restore') : 'Yes, Restore',
                    cancelLabel: typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel',
                    type: 'danger',
                    icon: 'alert-octagon',
                    onConfirm: () => {
                        try {
                            const success = restoreBackup(preview);
                            if (success) {
                                if (typeof showToast === 'function') {
                                    showToast('✅ ' + (typeof t === 'function' ? t('backup_restored', 'Backup restored successfully!') : 'Backup restored successfully!'), "success");
                                }
                                setTimeout(() => location.reload(), 1500);
                            }
                        } catch (error) {
                            if (typeof showToast === 'function') {
                                showToast('❌ Restore failed: ' + error.message, "error");
                            }
                        }
                    }
                });
            }
        }
    ]);
    modal.body.appendChild(actions);

    if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// 9. حفظ واسترجاع Metadata
// ========================================

function saveBackupMetadata(metadata) {
    try {
        const current = getBackupMetadata();
        const updated = { ...current, ...metadata };
        localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error("Error saving backup metadata:", error);
    }
}

function getBackupMetadata() {
    try {
        const raw = localStorage.getItem(BACKUP_METADATA_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (error) {
        console.error("Error reading backup metadata:", error);
        return {};
    }
}

// ========================================
// 10. واجهة Backup في Profile
// ========================================

function renderBackupSection() {
    const metadata = getBackupMetadata();

    const section = document.createElement("div");
    section.className = "profile-section";
    section.id = "backup-section";

    // ===== العنوان =====
    const titleWrapper = document.createElement("div");
    titleWrapper.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
    `;

    const icon = document.createElement("span");
    icon.setAttribute("data-lucide", "database");
    icon.style.cssText = `
        width: 24px;
        height: 24px;
        color: var(--primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
    `;

    const title = document.createElement("h3");
    title.className = "profile-section-title";
    title.textContent = typeof t === 'function' ? t('data_backup', 'Data & Backup') : 'Data & Backup';
    title.style.marginBottom = "0";

    titleWrapper.appendChild(icon);
    titleWrapper.appendChild(title);
    section.appendChild(titleWrapper);

    // ===== وصف =====
    const desc = document.createElement("p");
    desc.style.cssText = `
        color: var(--text-muted);
        font-size: 14px;
        margin-bottom: 16px;
        font-family: var(--font-body);
    `;
    desc.textContent = typeof t === 'function'
        ? t('backup_desc', 'Your data is stored locally on this device. Export a backup to save your data, or import a previously exported backup.')
        : 'Your data is stored locally on this device. Export a backup to save your data, or import a previously exported backup.';
    section.appendChild(desc);

    // ===== معلومات آخر نسخ =====
    if (metadata.lastExport) {
        const infoDiv = document.createElement("div");
        infoDiv.style.cssText = `
            padding: 12px 16px;
            background: var(--bg-surface);
            border-radius: 8px;
            border: 1px solid var(--border-light);
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
        `;

        const infoText = document.createElement("span");
        infoText.style.cssText = `
            font-size: 13px;
            color: var(--text-secondary);
        `;
        infoText.innerHTML = `
            <span data-lucide="package" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; color: var(--text-muted);"></span>
            ${typeof t === 'function' ? t('last_backup', 'Last backup') : 'Last backup'}: ${new Date(metadata.lastExport).toLocaleString()}
        `;

        const sizeText = document.createElement("span");
        sizeText.style.cssText = `
            font-size: 12px;
            color: var(--text-muted);
        `;
        sizeText.textContent = metadata.size ? `(${(metadata.size / 1024).toFixed(1)} KB)` : '';

        infoDiv.appendChild(infoText);
        infoDiv.appendChild(sizeText);
        section.appendChild(infoDiv);
    }

    // ===== زر Export =====
    const exportBtn = document.createElement("button");
    exportBtn.type = "button";
    exportBtn.style.cssText = `
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
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        margin-bottom: 10px;
        min-height: 48px;
        -webkit-tap-highlight-color: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    `;
    exportBtn.innerHTML = `
        <span data-lucide="upload" style="width: 18px; height: 18px; pointer-events: none;"></span>
        <span>${typeof t === 'function' ? t('export_backup', 'Export Backup') : 'Export Backup'}</span>
    `;

    exportBtn.addEventListener("mouseenter", function() {
        this.style.transform = "translateY(-2px)";
        this.style.boxShadow = "var(--shadow-md)";
    });
    exportBtn.addEventListener("mouseleave", function() {
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "none";
    });

    exportBtn.addEventListener("click", function() {
        exportBackup();
    });
    section.appendChild(exportBtn);

    // ===== زر Import =====
    const importBtn = document.createElement("button");
    importBtn.type = "button";
    importBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        background: var(--bg-surface);
        color: var(--text-primary);
        border: 2px dashed var(--border-color);
        border-radius: 10px;
        font-family: var(--font-handwritten);
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
        min-height: 48px;
        -webkit-tap-highlight-color: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    `;
    importBtn.innerHTML = `
        <span data-lucide="download" style="width: 18px; height: 18px; pointer-events: none;"></span>
        <span>${typeof t === 'function' ? t('import_backup', 'Import Backup') : 'Import Backup'}</span>
    `;

    importBtn.addEventListener("mouseenter", function() {
        this.style.borderColor = "var(--primary)";
        this.style.background = "var(--bg-hover)";
        this.style.transform = "translateY(-2px)";
    });
    importBtn.addEventListener("mouseleave", function() {
        this.style.borderColor = "var(--border-color)";
        this.style.background = "var(--bg-surface)";
        this.style.transform = "translateY(0)";
    });

    importBtn.addEventListener("click", function() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json,application/json";
        fileInput.style.display = "none";

        fileInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.name.toLowerCase().endsWith('.json')) {
                if (typeof showToast === 'function') {
                    showToast("❌ " + (typeof t === 'function' ? t('select_json', 'Please select a JSON file') : 'Please select a JSON file'), "error");
                }
                return;
            }

            importBackup(file)
                .then(preview => {
                    showBackupPreview(preview);
                })
                .catch(error => {
                    if (typeof showToast === 'function') {
                        showToast("❌ " + error.error, "error");
                    }
                });
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
    section.appendChild(importBtn);

    // ===== ملاحظة أمان =====
    const note = document.createElement("p");
    note.style.cssText = `
        margin-top: 12px;
        font-size: 12px;
        color: var(--text-muted);
        text-align: center;
        font-style: italic;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 100%;
    `;

    const noteText = typeof t === 'function'
        ? t('backup_note', 'Your data never leaves your device. Backups are stored locally.')
        : 'Your data never leaves your device. Backups are stored locally.';

    note.innerHTML = `
        <span data-lucide="shield-check" style="width: 14px; height: 14px; color: var(--success); pointer-events: none; flex-shrink: 0;"></span>
        <span>${noteText}</span>
    `;
    section.appendChild(note);

    return section;
}

// ========================================
// ✅ دوال إضافية
// ========================================

function getBackupSize() {
    const backup = createBackupObject();
    if (!backup) return { bytes: 0, kb: "0", mb: "0" };

    const json = JSON.stringify(backup);
    const bytes = new Blob([json]).size;

    return {
        bytes: bytes,
        kb: (bytes / 1024).toFixed(2),
        mb: (bytes / 1024 / 1024).toFixed(2)
    };
}

function hasPreviousBackup() {
    const metadata = getBackupMetadata();
    return !!metadata.lastExport;
}

// ========================================
// تصدير الدوال
// ========================================

window.exportBackup = exportBackup;
window.importBackup = importBackup;
window.restoreBackup = restoreBackup;
window.showBackupPreview = showBackupPreview;
window.renderBackupSection = renderBackupSection;
window.getBackupMetadata = getBackupMetadata;
window.getBackupSize = getBackupSize;
window.hasPreviousBackup = hasPreviousBackup;
window.validateBackup = validateBackup;

console.log("✅ Backup & Restore v2.3 loaded successfully! (Lucide Icons)");
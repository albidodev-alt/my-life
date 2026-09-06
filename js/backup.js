// ========================================
// MY LIFE - BACKUP & RESTORE SYSTEM
// نظام النسخ الاحتياطي والاستعادة
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
    NOTIFICATIONS: "myLifeHub_notifications"
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
            notifications: getData(BACKUP_KEYS.NOTIFICATIONS)
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
        daysWithRoutine: 0
    };

    // حساب عدد الأيام التي تحتوي على روتين
    if (data.routine && typeof data.routine === 'object') {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        let count = 0;
        days.forEach(day => {
            if (data.routine[day] && data.routine[day].hours) {
                const hasActivity = data.routine[day].hours.some(h => h && h.trim() !== "");
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
            showToast("❌ Failed to create backup", "error");
            return false;
        }

        // تحويل إلى JSON
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // إنشاء اسم الملف
        const date = new Date();
        const dateStr = date.getFullYear() + '-' + 
                       String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(date.getDate()).padStart(2, '0');
        const filename = `My-Life-Backup-${dateStr}.json`;

        // تنزيل الملف
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // حفظ metadata آخر تصدير
        saveBackupMetadata({
            lastExport: new Date().toISOString(),
            filename: filename,
            size: blob.size,
            totalItems: backup.metadata
        });

        showToast(`✅ Backup exported successfully! (${filename})`, "success");
        return true;
    } catch (error) {
        console.error("Export error:", error);
        showToast("❌ Export failed: " + error.message, "error");
        return false;
    }
}

// ========================================
// 5. استيراد Backup (Import)
// ========================================

function importBackup(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(event) {
            try {
                // قراءة الملف
                const content = event.target.result;
                const backup = JSON.parse(content);

                // التحقق من صحة الملف
                const validation = validateBackup(backup);
                if (!validation.valid) {
                    reject({ error: validation.error });
                    return;
                }

                // عرض معلومات الـ Backup للمستخدم
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
    // 1. التحقق من وجود البيانات الأساسية
    if (!backup) {
        return { valid: false, error: "Backup is empty" };
    }

    // 2. التحقق من اسم التطبيق
    if (backup.app !== BACKUP_APP_NAME) {
        return { valid: false, error: "This backup does not belong to My Life" };
    }

    // 3. التحقق من الإصدار
    if (!backup.version || backup.version > BACKUP_VERSION) {
        return { valid: false, error: `Unsupported version: ${backup.version}. Current version: ${BACKUP_VERSION}` };
    }

    // 4. التحقق من وجود البيانات
    if (!backup.data || typeof backup.data !== 'object') {
        return { valid: false, error: "Backup data is missing or invalid" };
    }

    // 5. التحقق من هيكل البيانات (تحقق من وجود المفاتيح الأساسية)
    const requiredKeys = ['profile', 'routine', 'tasks', 'notes', 'events', 'programs', 'notifications'];
    const missingKeys = requiredKeys.filter(key => !(key in backup.data));
    
    if (missingKeys.length > 0) {
        return { valid: false, error: `Missing data sections: ${missingKeys.join(', ')}` };
    }

    return { valid: true };
}

// ========================================
// 7. استعادة البيانات (Restore)
// ========================================

function restoreBackup(backupData) {
    try {
        // 1. إنشاء نسخة احتياطية مؤقتة من البيانات الحالية
        const tempBackup = createBackupObject();
        if (!tempBackup) {
            throw new Error("Failed to create temporary backup");
        }

        // 2. استعادة البيانات
        const data = backupData.data;

        // استعادة كل قسم
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

        // 3. حفظ metadata آخر استعادة
        saveBackupMetadata({
            lastRestore: new Date().toISOString(),
            restoredAt: backupData.createdAt,
            totalItems: backupData.metadata || calculateMetadata(backupData.data)
        });

        return true;
    } catch (error) {
        console.error("Restore error:", error);
        throw error;
    }
}

// ========================================
// 8. عرض معلومات Backup (Preview)
// ========================================

function showBackupPreview(preview) {
    const overlay = document.createElement("div");
    overlay.className = "notes-modal-overlay";
    overlay.id = "backup-preview-overlay";

    const modal = document.createElement("div");
    modal.className = "notes-modal";
    modal.id = "backup-preview-modal";
    modal.style.maxWidth = "500px";

    const metadata = preview.metadata;

    const html = `
        <button class="notes-modal-close-btn" id="backup-preview-close">✕</button>
        <h3 class="notes-modal-title">📋 Restore Backup</h3>
        
        <div style="margin: 16px 0; padding: 12px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border-light);">
            <p style="margin: 4px 0; font-size: 14px; color: var(--text-secondary);">
                <strong>Created:</strong> ${new Date(preview.createdAt).toLocaleString()}
            </p>
            <p style="margin: 4px 0; font-size: 14px; color: var(--text-secondary);">
                <strong>Version:</strong> ${preview.version}
            </p>
        </div>

        <div style="margin: 16px 0; padding: 12px; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color);">
            <h4 style="margin: 0 0 8px 0; font-family: var(--font-handwritten); color: var(--text-primary);">Contains:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                    📋 Tasks: ${metadata.totalTasks || 0}
                </div>
                <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                    📝 Notes: ${metadata.totalNotes || 0}
                </div>
                <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                    📅 Events: ${metadata.totalEvents || 0}
                </div>
                <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                    🎓 Programs: ${metadata.totalPrograms || 0}
                </div>
                <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                    🔔 Notifications: ${metadata.totalNotifications || 0}
                </div>
                <div style="padding: 6px 10px; background: var(--bg-surface); border-radius: 4px; font-size: 14px; color: var(--text-primary);">
                    📆 Routine Days: ${metadata.daysWithRoutine || 0}
                </div>
            </div>
        </div>

        <div style="margin: 16px 0; padding: 12px; background: rgba(239, 68, 68, 0.08); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">
            <p style="margin: 0; font-size: 14px; color: #dc2626; font-weight: 500;">
                ⚠️ Restoring this backup will replace all your current data.
            </p>
        </div>

        <div class="notes-modal-actions">
            <button class="notes-modal-cancel-btn" id="backup-preview-cancel">Cancel</button>
            <button class="notes-modal-save-btn" id="backup-preview-restore" style="background: linear-gradient(135deg, #dc2626, #ef4444);">
                🔄 Restore Backup
            </button>
        </div>
    `;

    modal.innerHTML = html;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // ===== إضافة الأحداث =====
    function closeModal() {
        overlay.remove();
    }

    document.getElementById("backup-preview-close").addEventListener("click", closeModal);
    document.getElementById("backup-preview-cancel").addEventListener("click", closeModal);

    overlay.addEventListener("click", function(e) {
        if (e.target === overlay) closeModal();
    });

    document.getElementById("backup-preview-restore").addEventListener("click", function() {
        if (confirm("⚠️ Are you sure? This will REPLACE all your current data with the backup data.")) {
            try {
                const success = restoreBackup(preview);
                if (success) {
                    closeModal();
                    showToast("✅ Backup restored successfully!", "success");
                    
                    // تحديث الواجهة
                    setTimeout(function() {
                        location.reload();
                    }, 1000);
                }
            } catch (error) {
                showToast("❌ Restore failed: " + error.message, "error");
            }
        }
    });

    // ===== ✅ إعادة تهيئة أيقونات Lucide =====
    setTimeout(function() {
        if (typeof initLucideIcons === 'function') {
            initLucideIcons();
        }
    }, 50);
}

// ========================================
// 9. حفظ واسترجاع Metadata آخر Backup
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
// 10. عرض Toast Notifications
// ========================================

function showToast(message, type = "info") {
    const existingToast = document.getElementById("backup-toast");
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.id = "backup-toast";
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
// 11. واجهة Backup في Profile
// ========================================

function renderBackupSection() {
    const metadata = getBackupMetadata();
    
    const section = document.createElement("div");
    section.className = "profile-section";
    section.id = "backup-section";

    // ===== العنوان مع أيقونة =====
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
    title.textContent = "Data & Backup";
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
    desc.textContent = "Your data is stored locally on this device. Export a backup to save your data, or import a previously exported backup.";
    section.appendChild(desc);

    // ===== معلومات آخر نسخ احتياطي =====
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
        infoText.textContent = `📦 Last backup: ${new Date(metadata.lastExport).toLocaleString()}`;

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
        transition: all 0.2s ease;
        margin-bottom: 10px;
    `;
    exportBtn.textContent = "📤 Export Backup";

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
        transition: all 0.2s ease;
    `;
    importBtn.textContent = "📥 Import Backup";

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
        // إنشاء input file مخفي
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.style.display = "none";

        fileInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // التحقق من امتداد الملف
            if (!file.name.endsWith('.json')) {
                showToast("❌ Please select a JSON file", "error");
                return;
            }

            // استيراد الملف
            importBackup(file)
                .then(preview => {
                    showBackupPreview(preview);
                })
                .catch(error => {
                    showToast("❌ " + error.error, "error");
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
    `;
    note.textContent = "🔒 Your data never leaves your device. Backups are stored locally.";
    section.appendChild(note);

    return section;
}

// ========================================
// 12. تصدير الدوال للاستخدام من ملفات أخرى
// ========================================

window.exportBackup = exportBackup;
window.importBackup = importBackup;
window.restoreBackup = restoreBackup;
window.showBackupPreview = showBackupPreview;
window.renderBackupSection = renderBackupSection;
window.showToast = showToast;
window.getBackupMetadata = getBackupMetadata;

console.log("✅ Backup & Restore system loaded successfully!");
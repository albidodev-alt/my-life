// ========================================
// MY LIFE HUB - NOTES v2.1
// (Debounced Search + Safe Save + Better UX)
// ========================================

const NOTES_STORAGE_KEY = "myLifeHub_notes_v2";

// ========================================
// ✅ دوال التخزين الآمنة
// ========================================

function safeSetNotes(key, value) {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.warn('⚠️ localStorage quota exceeded for notes');
      if (typeof showToast === 'function') {
        showToast(
          '⚠️ ' + (typeof t === 'function'
            ? t('storage_full', 'Storage is full. Please delete some notes.')
            : 'Storage is full. Please delete some notes.'),
          'warning',
          5000
        );
      }
      return { success: false, error: 'quota' };
    }
    console.error('Error saving notes:', err);
    return { success: false, error: 'unknown' };
  }
}

// ========================================
// ✅ دوال التخزين الأساسية
// ========================================

function getAllNotes() {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return [];
    const notes = JSON.parse(raw);
    return Array.isArray(notes) ? notes : [];
  } catch (error) {
    console.error("Error loading notes:", error);
    return [];
  }
}

function saveAllNotes(notes) {
  if (!Array.isArray(notes)) {
    console.error("saveAllNotes: notes must be an array");
    return false;
  }
  
  const result = safeSetNotes(NOTES_STORAGE_KEY, JSON.stringify(notes));
  return result.success;
}

// ========================================
// ✅ العمليات الأساسية
// ========================================

function addNote(title, content) {
  const trimmedTitle = (title || '').trim();
  const trimmedContent = (content || '').trim();

  if (!trimmedTitle || !trimmedContent) {
    return null;
  }

  const notes = getAllNotes();
  const newNote = {
    id: (typeof generateId === "function") ? generateId() : Date.now() + Math.random(),
    title: trimmedTitle,
    content: trimmedContent,
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notes.unshift(newNote);
  const success = saveAllNotes(notes);
  return success ? newNote : null;
}

function updateNote(noteId, newTitle, newContent) {
  const trimmedTitle = (newTitle || '').trim();
  const trimmedContent = (newContent || '').trim();

  if (!trimmedTitle || !trimmedContent) {
    return false;
  }

  const notes = getAllNotes();
  const noteIndex = notes.findIndex(n => n.id === noteId);

  if (noteIndex === -1) return false;

  notes[noteIndex].title = trimmedTitle;
  notes[noteIndex].content = trimmedContent;
  notes[noteIndex].updatedAt = new Date().toISOString();

  return saveAllNotes(notes);
}

function deleteNote(noteId) {
  const notes = getAllNotes();
  const filteredNotes = notes.filter(n => n.id !== noteId);
  return saveAllNotes(filteredNotes);
}

function togglePinNote(noteId) {
  const notes = getAllNotes();
  const note = notes.find(n => n.id === noteId);

  if (!note) return false;

  note.pinned = !note.pinned;

  notes.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return saveAllNotes(notes);
}

// ========================================
// ✅ دوال مساعدة
// ========================================

function searchNotes(notes, searchTerm) {
  const query = (searchTerm || '').trim().toLowerCase();
  if (!query) return notes;

  return notes.filter(note => {
    const titleMatch = (note.title || "").toLowerCase().includes(query);
    const contentMatch = (note.content || "").toLowerCase().includes(query);
    return titleMatch || contentMatch;
  });
}

function formatNoteDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return (typeof t === 'function' ? t('today', 'Today') : 'Today') + " " + date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return (typeof t === 'function' ? t('yesterday', 'Yesterday') : 'Yesterday') + " " + date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return `${diffDays} ` + (typeof t === 'function' ? t('days_ago', 'days ago') : 'days ago');
  } else {
    return date.toLocaleDateString("en-US", {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

function tr(key, fallback) {
  return typeof t === 'function' ? t(key, fallback) : fallback;
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// ✅ Debounce (لتجنب إعادة الرسم المتكرر أثناء الكتابة)
// ========================================

const debouncedSearchRender = (typeof debounce === 'function')
  ? debounce((searchTerm) => {
      renderNotesList(searchTerm);
    }, 200)
  : (searchTerm) => renderNotesList(searchTerm);

// ========================================
// عرض صفحة الملاحظات
// ========================================

function renderNotesPageV2() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div id="notes-app-container">
      <div class="notes-header-section">
        <div class="notes-title-area">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span data-lucide="notebook-pen" style="width: 32px; height: 32px; color: var(--primary);"></span>
            <h2 class="notes-main-title" style="margin: 0;">${tr('notes', 'Notes')}</h2>
          </div>
          <p class="notes-main-subtitle">${tr('notes_subtitle', 'Capture your thoughts, ideas, and reminders')}</p>
        </div>
        <button class="notes-add-main-btn" id="notes-open-add-btn">
          <span class="notes-add-icon" data-lucide="plus" style="width: 20px; height: 20px;"></span>
          ${tr('add_note', 'New Note')}
        </button>
      </div>

      <div class="notes-search-container">
        <div class="notes-search-wrapper">
          <span class="notes-search-icon" data-lucide="search" style="width: 18px; height: 18px;"></span>
          <input 
            type="text" 
            class="notes-search-input" 
            id="notes-search-input"
            placeholder="${tr('search_notes', 'Search notes by title or content...')}"
            aria-label="${tr('search_notes', 'Search notes')}"
            autocomplete="off"
          />
        </div>
        <div class="notes-stats">
          <span id="notes-count">0 ${tr('notes', 'notes')}</span>
        </div>
      </div>

      <div class="notes-grid" id="notes-grid"></div>
    </div>
  `;

  const searchInput = document.getElementById("notes-search-input");
  if (searchInput) {
    // ✅ استخدام debounce لتحسين الأداء
    searchInput.addEventListener("input", function() {
      debouncedSearchRender(this.value);
    });
  }

  const addBtn = document.getElementById("notes-open-add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", function() {
      openNoteModal(null);
    });
  }

  renderNotesList("");

  setTimeout(function() {
    if (typeof initLucideIcons === 'function') {
      initLucideIcons();
    }
  }, 50);
}

// ========================================
// عرض قائمة الملاحظات
// ========================================

function renderNotesList(searchTerm = "") {
  const grid = document.getElementById("notes-grid");
  const countEl = document.getElementById("notes-count");
  if (!grid) return;

  const allNotes = getAllNotes();
  const filteredNotes = searchNotes(allNotes, searchTerm);

  if (countEl) {
    const count = filteredNotes.length;
    countEl.textContent = `${count} ${tr('notes', 'notes')}`;
  }

  const fragment = document.createDocumentFragment();

  if (filteredNotes.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "notes-empty-state";

    const icon = document.createElement("div");
    icon.className = "notes-empty-icon";
    icon.innerHTML = searchTerm 
      ? '<span data-lucide="search-x" style="width: 32px; height: 32px; color: var(--primary);"></span>'
      : '<span data-lucide="notebook-pen" style="width: 32px; height: 32px; color: var(--primary);"></span>';

    const title = document.createElement("h3");
    title.className = "notes-empty-title";
    title.textContent = searchTerm ? tr('no_notes_found', 'No notes found') : tr('notes_empty_title', 'Your notes will appear here');

    const desc = document.createElement("p");
    desc.className = "notes-empty-desc";
    desc.textContent = searchTerm 
      ? tr('try_different_keyword', 'Try searching with a different keyword')
      : tr('create_first_note', "Click the 'New Note' button to create your first note");

    emptyState.appendChild(icon);
    emptyState.appendChild(title);
    emptyState.appendChild(desc);
    fragment.appendChild(emptyState);
  } else {
    filteredNotes.forEach(note => {
      const card = createNoteCard(note);
      fragment.appendChild(card);
    });
  }

  grid.innerHTML = "";
  grid.appendChild(fragment);

  if (typeof debouncedLucide === 'function') {
    debouncedLucide(50);
  }
}

// ========================================
// إنشاء بطاقة ملاحظة
// ========================================

function createNoteCard(note) {
  const card = document.createElement("div");
  card.className = "notes-card";
  if (note.pinned) {
    card.classList.add("notes-card-pinned");
  }

  const header = document.createElement("div");
  header.className = "notes-card-header";

  const titleArea = document.createElement("div");
  titleArea.className = "notes-card-title-area";

  const title = document.createElement("h3");
  title.className = "notes-card-title";
  title.textContent = note.title || tr('untitled', 'Untitled');

  titleArea.appendChild(title);

  if (note.pinned) {
    const pinBadge = document.createElement("span");
    pinBadge.className = "notes-card-pin-badge";
    pinBadge.innerHTML = '<span data-lucide="pin" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span>' + tr('pinned', 'Pinned');
    titleArea.appendChild(pinBadge);
  }

  const actions = document.createElement("div");
  actions.className = "notes-card-actions";

  // ===== زر التثبيت =====
  const pinBtn = document.createElement("button");
  pinBtn.className = "notes-card-action-btn";
  pinBtn.type = "button";
  pinBtn.innerHTML = note.pinned 
    ? '<span data-lucide="pin" style="width: 16px; height: 16px; fill: var(--primary); stroke: var(--primary);"></span>'
    : '<span data-lucide="pin" style="width: 16px; height: 16px;"></span>';
  pinBtn.title = note.pinned ? tr('unpin', 'Unpin note') : tr('pin', 'Pin note');
  pinBtn.setAttribute("aria-label", pinBtn.title);

  pinBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    togglePinNote(note.id);
    renderNotesList(document.getElementById("notes-search-input")?.value || "");
  });

  // ===== زر التعديل =====
  const editBtn = document.createElement("button");
  editBtn.className = "notes-card-action-btn";
  editBtn.type = "button";
  editBtn.innerHTML = '<span data-lucide="pencil" style="width: 16px; height: 16px;"></span>';
  editBtn.title = tr('edit', 'Edit note');
  editBtn.setAttribute("aria-label", "Edit note");

  editBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    openNoteModal(note);
  });

  // ===== زر الحذف =====
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "notes-card-action-btn notes-delete-btn";
  deleteBtn.type = "button";
  deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width: 16px; height: 16px;"></span>';
  deleteBtn.title = tr('delete', 'Delete note');
  deleteBtn.setAttribute("aria-label", "Delete note");

  deleteBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    deleteModal({
      itemName: note.title,
      itemType: 'note',
      onConfirm: () => {
        deleteNote(note.id);
        renderNotesList(document.getElementById("notes-search-input")?.value || "");
      }
    });
  });

  actions.appendChild(pinBtn);
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  header.appendChild(titleArea);
  header.appendChild(actions);

  // ===== محتوى الملاحظة =====
  const content = document.createElement("p");
  content.className = "notes-card-content";
  content.textContent = note.content || "";

  // ===== تذييل البطاقة =====
  const footer = document.createElement("div");
  footer.className = "notes-card-footer";

  const dateSpan = document.createElement("span");
  dateSpan.className = "notes-card-date";
  dateSpan.innerHTML = '<span data-lucide="clock" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></span>' + formatNoteDate(note.updatedAt || note.createdAt);

  const editIndicator = document.createElement("span");
  editIndicator.className = "notes-card-edit-indicator";
  if (note.updatedAt && note.updatedAt !== note.createdAt) {
    editIndicator.innerHTML = '<span data-lucide="pencil" style="width: 10px; height: 10px; vertical-align: middle; margin-right: 2px;"></span>' + tr('edited', 'edited');
  }

  footer.appendChild(dateSpan);
  footer.appendChild(editIndicator);

  card.appendChild(header);
  card.appendChild(content);
  card.appendChild(footer);

  // ===== فتح الملاحظة عند النقر على البطاقة =====
  card.addEventListener("click", function(e) {
    if (e.target.closest("button")) return;
    openNoteModal(note);
  });

  return card;
}

// ========================================
// نافذة إضافة/تعديل ملاحظة
// ========================================

function openNoteModal(editNote = null) {
  const isEditing = editNote !== null;

  const modal = createModal({
    id: 'note-modal',
    title: isEditing 
      ? '<span data-lucide="pencil"></span> ' + tr('edit_note', 'Edit Note')
      : '<span data-lucide="plus"></span> ' + tr('new_note', 'New Note'),
    size: 'medium'
  });

  // ===== حقل العنوان =====
  const titleField = createModalField({
    id: 'notes-modal-title-input',
    label: tr('title', 'Title'),
    type: 'text',
    value: isEditing ? editNote.title : '',
    placeholder: tr('enter_note_title', 'Enter note title...'),
    maxLength: 120
  });

  // ===== حقل المحتوى =====
  const contentField = createModalField({
    id: 'notes-modal-content-input',
    label: tr('content', 'Content'),
    type: 'textarea',
    rows: 6,
    value: isEditing ? editNote.content : '',
    placeholder: tr('write_note_here', 'Write your note here...'),
    maxLength: 5000
  });

  modal.body.appendChild(titleField.field);
  modal.body.appendChild(contentField.field);

  // ===== حفظ =====
  function handleSave() {
    const newTitle = titleField.input.value.trim();
    const newContent = contentField.input.value.trim();

    if (!newTitle) {
      titleField.input.classList.add("modal-base-input-error");
      titleField.input.focus();
      setTimeout(() => titleField.input.classList.remove("modal-base-input-error"), 500);
      return;
    }

    if (!newContent) {
      contentField.input.classList.add("modal-base-input-error");
      contentField.input.focus();
      setTimeout(() => contentField.input.classList.remove("modal-base-input-error"), 500);
      return;
    }

    let success = false;
    if (isEditing) {
      success = updateNote(editNote.id, newTitle, newContent);
    } else {
      const newNote = addNote(newTitle, newContent);
      success = newNote !== null;
    }

    if (success) {
      modal.close();
      setTimeout(() => {
        renderNotesList(document.getElementById("notes-search-input")?.value || "");
      }, 250);
    } else {
      if (typeof showToast === 'function') {
        showToast('❌ ' + tr('save_failed', 'Failed to save note'), 'error');
      }
    }
  }

  // ===== الأزرار =====
  const actions = createModalActions([
    {
      label: tr('cancel', 'Cancel'),
      type: 'secondary',
      onClick: () => modal.close()
    },
    {
      label: isEditing 
        ? '<span data-lucide="check"></span> ' + tr('update_note', 'Update')
        : '<span data-lucide="plus"></span> ' + tr('add_note_btn', 'Add Note'),
      type: 'primary',
      onClick: handleSave
    }
  ]);

  modal.body.appendChild(actions);

  // ===== اختصارات لوحة المفاتيح =====
  titleField.input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      contentField.input.focus();
    }
  });

  contentField.input.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  });

  // ===== Focus تلقائي =====
  setTimeout(() => titleField.input.focus(), 100);
}

// ========================================
// ✅ دوال إضافية مفيدة
// ========================================

/**
 * عدد الملاحظات
 */
function getNotesCount() {
  return getAllNotes().length;
}

/**
 * عدد الملاحظات المثبتة
 */
function getPinnedNotesCount() {
  return getAllNotes().filter(n => n.pinned).length;
}

/**
 * بحث سريع
 */
function findNotes(query) {
  return searchNotes(getAllNotes(), query);
}

// ========================================
// تصدير الدوال
// ========================================

window.renderNotesPageV2 = renderNotesPageV2;
window.renderNotesList = renderNotesList;
window.getAllNotes = getAllNotes;
window.addNote = addNote;
window.updateNote = updateNote;
window.deleteNote = deleteNote;
window.togglePinNote = togglePinNote;
window.getNotesCount = getNotesCount;
window.getPinnedNotesCount = getPinnedNotesCount;
window.findNotes = findNotes;

console.log("✅ Notes v2.1 loaded successfully!");
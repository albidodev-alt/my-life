// ========================================
// MY LIFE HUB - NOTES v3.3
// (Inline Editor + Save/Back Buttons + Fixed Title Editing + Notes Cache + PM Protection)
// ========================================

const NOTES_STORAGE_KEY = "myLifeHub_notes_v2";

// ===== ✅ كاش في الذاكرة =====
let notesCache = null;

// ========================================
// ✅ إبطال الكاش
// ========================================
function invalidateNotesCache() {
  notesCache = null;
}

// ========================================
// ✅ مزامنة بين Tabs
// ========================================
if (typeof window !== 'undefined') {
  window.addEventListener('storage', function (e) {
    if (e.key === NOTES_STORAGE_KEY) {
      console.log('🔄 Notes changed in another tab. Invalidating cache.');
      notesCache = null;
    }
  });
}

// ========================================
// ✅ حالة المحرر (Editor State)
// ========================================
let _noteEditorState = {
  noteId: null,
  isNew: false,
  originalTitle: '',
  originalContent: '',
  autoSaveTimer: null,
  hasUnsavedChanges: false,
  isSaving: false
};

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
// ✅ دوال التخزين الأساسية (مع كاش)
// ========================================

function getAllNotes() {
  if (notesCache !== null) return notesCache;

  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      notesCache = [];
      return notesCache;
    }
    const notes = JSON.parse(raw);
    notesCache = Array.isArray(notes) ? notes : [];
    return notesCache;
  } catch (error) {
    console.error("Error loading notes:", error);
    notesCache = [];
    return notesCache;
  }
}

function getNotesCopy() {
  if (typeof deepClone === 'function') {
    return deepClone(getAllNotes());
  }
  try {
    return JSON.parse(JSON.stringify(getAllNotes()));
  } catch (e) {
    console.warn('getNotesCopy failed:', e);
    return getAllNotes();
  }
}

function saveAllNotes(notes) {
  if (!Array.isArray(notes)) {
    console.error("saveAllNotes: notes must be an array");
    return false;
  }

  const result = safeSetNotes(NOTES_STORAGE_KEY, JSON.stringify(notes));

  if (result.success) {
    notesCache = notes;
  }

  return result.success;
}

// ========================================
// ✅ العمليات الأساسية
// ========================================

function addNote(title, content) {
  const trimmedTitle = (title || '').trim();
  const trimmedContent = (content || '').trim();

  if (!trimmedTitle && !trimmedContent) {
    return null;
  }

  const notes = getNotesCopy();
  const newNote = {
    id: (typeof generateId === "function") ? generateId() : Date.now() + Math.random(),
    title: trimmedTitle || (typeof t === 'function' ? t('untitled', 'Untitled') : 'Untitled'),
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

  if (!trimmedTitle && !trimmedContent) {
    return false;
  }

  const notes = getNotesCopy();
  const noteIndex = notes.findIndex(n => n.id === noteId);

  if (noteIndex === -1) return false;

  notes[noteIndex].title = trimmedTitle || (typeof t === 'function' ? t('untitled', 'Untitled') : 'Untitled');
  notes[noteIndex].content = trimmedContent;
  notes[noteIndex].updatedAt = new Date().toISOString();

  return saveAllNotes(notes);
}

function deleteNote(noteId) {
  const notes = getNotesCopy();
  const filteredNotes = notes.filter(n => n.id !== noteId);
  return saveAllNotes(filteredNotes);
}

function togglePinNote(noteId) {
  const notes = getNotesCopy();
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
// ✅ Debounce للبحث
// ========================================

const debouncedSearchRender = (typeof debounce === 'function')
  ? debounce((searchTerm) => {
      renderNotesList(searchTerm);
    }, 200)
  : (searchTerm) => renderNotesList(searchTerm);

// ========================================
// ✨ عرض صفحة الملاحظات (القائمة الرئيسية)
// ========================================

function renderNotesPageV2() {
  const app = document.getElementById("app");
  if (!app) return;

  app.replaceChildren();

  const container = document.createElement("div");
  container.id = "notes-app-container";

  // ===== Header Section =====
  const headerSection = document.createElement("div");
  headerSection.className = "notes-header-section";

  const titleArea = document.createElement("div");
  titleArea.className = "notes-title-area";

  const titleRow = document.createElement("div");
  titleRow.style.cssText = "display: flex; align-items: center; gap: 12px;";

  const titleIcon = document.createElement("span");
  titleIcon.setAttribute("data-lucide", "notebook-pen");
  titleIcon.style.cssText = "width: 32px; height: 32px; color: var(--primary);";

  const title = document.createElement("h2");
  title.className = "notes-main-title";
  title.style.margin = "0";
  title.textContent = tr('notes', 'Notes');

  titleRow.appendChild(titleIcon);
  titleRow.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "notes-main-subtitle";
  subtitle.textContent = tr('notes_subtitle', 'Capture your thoughts, ideas, and reminders');

  titleArea.appendChild(titleRow);
  titleArea.appendChild(subtitle);

  const addBtn = document.createElement("button");
  addBtn.className = "notes-add-main-btn";
  addBtn.id = "notes-open-add-btn";
  addBtn.innerHTML = `
    <span class="notes-add-icon" data-lucide="plus" style="width: 20px; height: 20px;"></span>
    ${tr('add_note', 'New Note')}
  `;

  headerSection.appendChild(titleArea);
  headerSection.appendChild(addBtn);
  container.appendChild(headerSection);

  // ===== Search Container =====
  const searchContainer = document.createElement("div");
  searchContainer.className = "notes-search-container";

  const searchWrapper = document.createElement("div");
  searchWrapper.className = "notes-search-wrapper";

  const searchIcon = document.createElement("span");
  searchIcon.className = "notes-search-icon";
  searchIcon.setAttribute("data-lucide", "search");
  searchIcon.style.cssText = "width: 18px; height: 18px;";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "notes-search-input";
  searchInput.id = "notes-search-input";
  searchInput.placeholder = tr('search_notes', 'Search notes by title or content...');
  searchInput.setAttribute("aria-label", tr('search_notes', 'Search notes'));
  searchInput.autocomplete = "off";

  // ✅ حماية من Password Manager
  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(searchInput, 'search');
  }

  searchWrapper.appendChild(searchIcon);
  searchWrapper.appendChild(searchInput);

  const stats = document.createElement("div");
  stats.className = "notes-stats";

  const countEl = document.createElement("span");
  countEl.id = "notes-count";
  countEl.textContent = `0 ${tr('notes', 'notes')}`;
  stats.appendChild(countEl);

  searchContainer.appendChild(searchWrapper);
  searchContainer.appendChild(stats);
  container.appendChild(searchContainer);

  // ===== Notes Grid =====
  const grid = document.createElement("div");
  grid.className = "notes-grid";
  grid.id = "notes-grid";
  container.appendChild(grid);

  app.appendChild(container);

  // ===== ربط الأحداث =====
  searchInput.addEventListener("input", function() {
    debouncedSearchRender(this.value);
  });

  addBtn.addEventListener("click", function() {
    openNoteEditor(null);
  });

  renderNotesList("");
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

    const emptyTitle = document.createElement("h3");
    emptyTitle.className = "notes-empty-title";
    emptyTitle.textContent = searchTerm 
      ? tr('no_notes_found', 'No notes found') 
      : tr('notes_empty_title', 'Your notes will appear here');

    const desc = document.createElement("p");
    desc.className = "notes-empty-desc";
    desc.textContent = searchTerm 
      ? tr('try_different_keyword', 'Try searching with a different keyword')
      : tr('create_first_note', "Click the 'New Note' button to create your first note");

    emptyState.appendChild(icon);
    emptyState.appendChild(emptyTitle);
    emptyState.appendChild(desc);
    fragment.appendChild(emptyState);
  } else {
    filteredNotes.forEach(note => {
      const card = createNoteCard(note);
      fragment.appendChild(card);
    });
  }

  grid.replaceChildren(fragment);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
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
    ? '<span data-lucide="pin" style="width: 16px; height: 16px; fill: var(--primary); stroke: var(--primary); pointer-events:none;"></span>'
    : '<span data-lucide="pin" style="width: 16px; height: 16px; pointer-events:none;"></span>';
  pinBtn.title = note.pinned ? tr('unpin', 'Unpin note') : tr('pin', 'Pin note');
  pinBtn.setAttribute("aria-label", pinBtn.title);

  pinBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    togglePinNote(note.id);
    renderNotesList(document.getElementById("notes-search-input")?.value || "");
  });

  // ===== زر الحذف =====
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "notes-card-action-btn notes-delete-btn";
  deleteBtn.type = "button";
  deleteBtn.innerHTML = '<span data-lucide="trash-2" style="width: 16px; height: 16px; pointer-events:none;"></span>';
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

  card.addEventListener("click", function(e) {
    if (e.target.closest("button")) return;
    openNoteEditor(note.id);
  });

  return card;
}

// ========================================
// ✨ NOTE EDITOR - المحرر المدمج
// ========================================

function openNoteEditor(noteId = null) {
  const app = document.getElementById("app");
  if (!app) return;

  let note = null;
  if (noteId) {
    const allNotes = getAllNotes();
    note = allNotes.find(n => n.id === noteId);
    if (!note) {
      console.warn('Note not found:', noteId);
      return;
    }
  }

  _noteEditorState = {
    noteId: noteId,
    isNew: !noteId,
    originalTitle: note ? (note.title || '') : '',
    originalContent: note ? (note.content || '') : '',
    autoSaveTimer: null,
    hasUnsavedChanges: false,
    isSaving: false
  };

  app.replaceChildren();
  renderNoteEditor(note);

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// ✨ بناء واجهة المحرر
// ========================================

function renderNoteEditor(note) {
  const app = document.getElementById("app");
  if (!app) return;

  const editor = document.createElement("div");
  editor.className = "note-editor";
  editor.id = "note-editor";

  // ========================================
  // Header (Back + Delete + Save)
  // ========================================
  const header = document.createElement("div");
  header.className = "note-editor-header";

  // ===== يسار: زر Back =====
  const headerLeft = document.createElement("div");
  headerLeft.className = "note-editor-header-left";

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "note-editor-btn back";
  backBtn.setAttribute("aria-label", "Back");
  backBtn.title = tr('back', 'Back');
  backBtn.innerHTML = `
    <span data-lucide="arrow-left"></span>
    <span>${tr('back', 'Back')}</span>
  `;
  backBtn.addEventListener("click", () => closeNoteEditor());

  headerLeft.appendChild(backBtn);

  // ===== يمين: Delete + Save =====
  const headerRight = document.createElement("div");
  headerRight.className = "note-editor-header-right";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "note-editor-btn danger";
  deleteBtn.setAttribute("aria-label", "Delete");
  deleteBtn.title = tr('delete', 'Delete');
  deleteBtn.innerHTML = '<span data-lucide="trash-2"></span>';
  deleteBtn.addEventListener("click", () => handleEditorDelete());

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "note-editor-btn save";
  saveBtn.id = "note-editor-save-btn";
  saveBtn.setAttribute("aria-label", "Save");
  saveBtn.title = tr('save', 'Save');
  saveBtn.innerHTML = `
    <span data-lucide="check"></span>
    <span>${tr('save', 'Save')}</span>
  `;

  headerRight.appendChild(deleteBtn);
  headerRight.appendChild(saveBtn);

  header.appendChild(headerLeft);
  header.appendChild(headerRight);
  editor.appendChild(header);

  // ========================================
  // Body (Title + Divider + Content)
  // ========================================
  const body = document.createElement("div");
  body.className = "note-editor-body";

  // ===== Title Input =====
  const titleInput = document.createElement("textarea");
  titleInput.className = "note-editor-title";
  titleInput.id = "note-editor-title";
  titleInput.rows = 1;
  titleInput.placeholder = tr('enter_note_title', 'Note title...');
  titleInput.value = note ? (note.title || '') : '';
  titleInput.setAttribute("aria-label", "Note title");

  // ✅ حماية من Password Managers
  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(titleInput, 'text');
  }

  titleInput.style.webkitUserSelect = 'text';
  titleInput.style.userSelect = 'text';
  titleInput.style.cursor = 'text';

  const autoResizeTitle = () => {
    titleInput.style.height = 'auto';
    titleInput.style.height = Math.min(Math.max(titleInput.scrollHeight, 42), 120) + 'px';
  };
  titleInput.addEventListener('input', autoResizeTitle);

  // ===== Divider =====
  const divider = document.createElement("div");
  divider.className = "note-editor-divider";

  // ===== Content Textarea =====
  const contentInput = document.createElement("textarea");
  contentInput.className = "note-editor-content";
  contentInput.id = "note-editor-content";
  contentInput.placeholder = tr('write_note_here', 'Start writing...');
  contentInput.value = note ? (note.content || '') : '';
  contentInput.setAttribute("aria-label", "Note content");

  // ✅ حماية من Password Managers (وضع content)
  if (typeof window._applyInputProtection === 'function') {
    window._applyInputProtection(contentInput, 'content');
  }

  contentInput.style.webkitUserSelect = 'text';
  contentInput.style.userSelect = 'text';
  contentInput.style.cursor = 'text';

  body.appendChild(titleInput);
  body.appendChild(divider);
  body.appendChild(contentInput);
  editor.appendChild(body);

  // ========================================
  // Footer (Stats + Status)
  // ========================================
  const footer = document.createElement("div");
  footer.className = "note-editor-footer";

  const statsEl = document.createElement("div");
  statsEl.className = "note-editor-stats";
  statsEl.id = "note-editor-stats";

  const statusEl = document.createElement("div");
  statusEl.className = "note-editor-status";
  statusEl.id = "note-editor-status";
  statusEl.innerHTML = '';

  footer.appendChild(statsEl);
  footer.appendChild(statusEl);
  editor.appendChild(footer);

  app.appendChild(editor);

  // ========================================
  // ✅ إعادة تطبيق الحماية بعد إضافة المحرر للـ DOM
  // ========================================
  setTimeout(() => {
    const titleEl = document.getElementById('note-editor-title');
    const contentEl = document.getElementById('note-editor-content');

    if (titleEl && typeof window._applyInputProtection === 'function') {
      window._applyInputProtection(titleEl, 'text');
    }
    if (contentEl && typeof window._applyInputProtection === 'function') {
      window._applyInputProtection(contentEl, 'content');
    }

    // ✅ حماية إضافية شاملة
    if (typeof window.protectAllExistingInputs === 'function') {
      window.protectAllExistingInputs();
    }
  }, 10);

  // ========================================
  // ربط الأحداث
  // ========================================

  autoResizeTitle();

  // ===== تحديث الإحصائيات =====
  const updateStats = () => {
    const content = contentInput.value || '';
    const charCount = content.length;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    statsEl.innerHTML = `
      <span><span data-lucide="type" style="width:12px;height:12px;vertical-align:middle;margin-right:3px;pointer-events:none;"></span>${charCount} ${tr('characters', 'characters')}</span>
      <span class="note-editor-stats-divider"></span>
      <span><span data-lucide="align-left" style="width:12px;height:12px;vertical-align:middle;margin-right:3px;pointer-events:none;"></span>${wordCount} ${tr('words', 'words')}</span>
    `;

    if (typeof debouncedLucide === 'function') debouncedLucide(30);
  };

  // ===== مؤشر الحالة =====
  const setStatus = (status, message) => {
    const icons = {
      saving: 'loader-circle',
      saved: 'check-circle-2',
      error: 'alert-circle'
    };

    statusEl.className = 'note-editor-status ' + status;
    statusEl.innerHTML = `
      <span data-lucide="${icons[status] || 'info'}" style="width:12px;height:12px;pointer-events:none;"></span>
      <span>${message}</span>
    `;

    if (typeof debouncedLucide === 'function') debouncedLucide(30);
  };

  // ===== مؤشر "غير محفوظ" =====
  const setUnsavedIndicator = (show) => {
    const existingDot = backBtn.querySelector('.note-editor-unsaved-dot');
    if (show && !existingDot) {
      const dot = document.createElement('span');
      dot.className = 'note-editor-unsaved-dot';
      dot.title = tr('unsaved_changes', 'Unsaved changes');
      backBtn.appendChild(dot);
    } else if (!show && existingDot) {
      existingDot.remove();
    }
  };

  // ========================================
  // Auto-Save Logic
  // ========================================

  const checkChanges = () => {
    const currentTitle = titleInput.value;
    const currentContent = contentInput.value;
    return currentTitle !== _noteEditorState.originalTitle ||
           currentContent !== _noteEditorState.originalContent;
  };

  const performSave = (silent = false) => {
    if (_noteEditorState.isSaving) return false;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title && !content) {
      if (_noteEditorState.isNew) {
        return false;
      } else {
        deleteNote(_noteEditorState.noteId);
        _noteEditorState.originalTitle = '';
        _noteEditorState.originalContent = '';
        setUnsavedIndicator(false);
        return true;
      }
    }

    if (!checkChanges()) {
      if (!silent) {
        setStatus('saved', tr('saved', 'Saved'));
        setTimeout(() => {
          if (statusEl.classList.contains('saved')) {
            statusEl.className = 'note-editor-status';
            statusEl.innerHTML = '';
          }
        }, 2000);
      }
      return true;
    }

    _noteEditorState.isSaving = true;
    if (!silent) setStatus('saving', tr('saving', 'Saving...'));

    let success;
    if (_noteEditorState.isNew) {
      const newNote = addNote(title, content);
      if (newNote) {
        _noteEditorState.noteId = newNote.id;
        _noteEditorState.isNew = false;
        success = true;
      } else {
        success = false;
      }
    } else {
      success = updateNote(_noteEditorState.noteId, title, content);
    }

    _noteEditorState.isSaving = false;

    if (success) {
      _noteEditorState.originalTitle = titleInput.value;
      _noteEditorState.originalContent = contentInput.value;
      _noteEditorState.hasUnsavedChanges = false;
      setUnsavedIndicator(false);

      if (!silent) {
        setStatus('saved', tr('saved', 'Saved'));
        setTimeout(() => {
          if (statusEl.classList.contains('saved')) {
            statusEl.className = 'note-editor-status';
            statusEl.innerHTML = '';
          }
        }, 2000);
      }
    } else {
      setStatus('error', tr('save_failed', 'Save failed'));
    }

    return success;
  };

  const scheduleAutoSave = () => {
    if (_noteEditorState.autoSaveTimer) {
      clearTimeout(_noteEditorState.autoSaveTimer);
    }

    setUnsavedIndicator(true);

    _noteEditorState.autoSaveTimer = setTimeout(() => {
      if (checkChanges()) {
        performSave(false);
      }
    }, 800);
  };

  // ===== ربط الأحداث بالحقول =====
  titleInput.addEventListener('input', () => {
    autoResizeTitle();
    updateStats();
    scheduleAutoSave();
  });

  contentInput.addEventListener('input', () => {
    updateStats();
    scheduleAutoSave();
  });

  // ===== زر الحفظ اليدوي =====
  saveBtn.addEventListener('click', () => {
    if (_noteEditorState.autoSaveTimer) {
      clearTimeout(_noteEditorState.autoSaveTimer);
      _noteEditorState.autoSaveTimer = null;
    }

    const success = performSave(false);

    if (success && typeof showToast === 'function') {
      showToast('✅ ' + tr('note_saved', 'Note saved'), 'success', 1500);
    }
  });

  // ===== اختصارات لوحة المفاتيح =====
  const handleKeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveBtn.click();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      closeNoteEditor();
      return;
    }

    if (e.key === 'Tab' && !e.shiftKey && e.target === titleInput) {
      e.preventDefault();
      contentInput.focus();
      contentInput.setSelectionRange(contentInput.value.length, contentInput.value.length);
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey && e.target === titleInput) {
      e.preventDefault();
      contentInput.focus();
      contentInput.setSelectionRange(contentInput.value.length, contentInput.value.length);
      return;
    }
  };

  titleInput.addEventListener('keydown', handleKeydown);
  contentInput.addEventListener('keydown', handleKeydown);

  // ✅ عند التركيز على العنوان → اختر النص بالكامل
  titleInput.addEventListener('focus', function() {
    if (this.value && !this.dataset.hasSelected) {
      this.select();
      this.dataset.hasSelected = 'true';
    }
  });

  titleInput.addEventListener('blur', function() {
    delete this.dataset.hasSelected;
  });

  // ===== تحديث الإحصائيات أول مرة =====
  updateStats();

  // ===== Auto-focus =====
  setTimeout(() => {
    if (_noteEditorState.isNew) {
      titleInput.focus();
    } else {
      contentInput.focus();
      contentInput.setSelectionRange(contentInput.value.length, contentInput.value.length);
    }
  }, 100);
}

// ========================================
// ✨ إغلاق المحرر
// ========================================

function closeNoteEditor() {
  const titleInput = document.getElementById('note-editor-title');
  const contentInput = document.getElementById('note-editor-content');
  if (!titleInput || !contentInput) {
    renderNotesPageV2();
    return;
  }

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (_noteEditorState.autoSaveTimer) {
    clearTimeout(_noteEditorState.autoSaveTimer);
    _noteEditorState.autoSaveTimer = null;
  }

  const hasChanges = title !== _noteEditorState.originalTitle ||
                     content !== _noteEditorState.originalContent;

  // 1. ملاحظة جديدة + فارغة تماماً
  if (_noteEditorState.isNew && !title && !content) {
    renderNotesPageV2();
    return;
  }

  // 2. ملاحظة جديدة + فيها بيانات → حفظ
  if (_noteEditorState.isNew && (title || content)) {
    const newNote = addNote(title, content);
    if (newNote && typeof showToast === 'function') {
      showToast('✅ ' + tr('note_saved', 'Note saved'), 'success', 1500);
    }
    renderNotesPageV2();
    return;
  }

  // 3. ملاحظة موجودة + بدون تغييرات
  if (!_noteEditorState.isNew && !hasChanges) {
    renderNotesPageV2();
    return;
  }

  // 4. ملاحظة موجودة + أفرغت بالكامل → حذف
  if (!_noteEditorState.isNew && !title && !content) {
    deleteNote(_noteEditorState.noteId);
    if (typeof showToast === 'function') {
      showToast('🗑️ ' + tr('note_deleted', 'Note deleted'), 'info', 1500);
    }
    renderNotesPageV2();
    return;
  }

  // 5. ملاحظة موجودة + تغييرات → حفظ
  if (!_noteEditorState.isNew && hasChanges) {
    updateNote(_noteEditorState.noteId, title, content);
    if (typeof showToast === 'function') {
      showToast('✅ ' + tr('note_saved', 'Note saved'), 'success', 1500);
    }
    renderNotesPageV2();
    return;
  }

  renderNotesPageV2();
}

// ========================================
// ✨ معالج حذف من داخل المحرر
// ========================================

function handleEditorDelete() {
  const titleInput = document.getElementById('note-editor-title');
  const title = titleInput ? titleInput.value.trim() : '';

  // 1. ملاحظة جديدة غير محفوظة → رجوع فقط
  if (_noteEditorState.isNew) {
    renderNotesPageV2();
    if (typeof showToast === 'function') {
      showToast('🗑️ ' + tr('note_discarded', 'Discarded'), 'info', 1500);
    }
    return;
  }

  // 2. ملاحظة موجودة → تأكيد الحذف
  deleteModal({
    itemName: title || tr('untitled', 'Untitled'),
    itemType: 'note',
    onConfirm: () => {
      deleteNote(_noteEditorState.noteId);
      renderNotesPageV2();
      if (typeof showToast === 'function') {
        showToast('🗑️ ' + tr('note_deleted', 'Note deleted'), 'info', 1500);
      }
    }
  });
}

// ========================================
// ✅ دوال إضافية
// ========================================

function resetNoteEditorState() {
  if (_noteEditorState.autoSaveTimer) {
    clearTimeout(_noteEditorState.autoSaveTimer);
  }
  _noteEditorState = {
    noteId: null,
    isNew: false,
    originalTitle: '',
    originalContent: '',
    autoSaveTimer: null,
    hasUnsavedChanges: false,
    isSaving: false
  };
}

function getNotesCount() {
  return getAllNotes().length;
}

function getPinnedNotesCount() {
  return getAllNotes().filter(n => n.pinned).length;
}

function findNotes(query) {
  return searchNotes(getAllNotes(), query);
}

// ========================================
// ⚠️ Legacy: openNoteModal (deprecated)
// ========================================

function openNoteModal(editNote = null) {
  console.warn('openNoteModal is deprecated. Use openNoteEditor instead.');
  openNoteEditor(editNote ? editNote.id : null);
}

// ========================================
// تصدير الدوال
// ========================================

window.renderNotesPageV2 = renderNotesPageV2;
window.renderNotesList = renderNotesList;
window.getAllNotes = getAllNotes;
window.getNotesCopy = getNotesCopy;
window.addNote = addNote;
window.updateNote = updateNote;
window.deleteNote = deleteNote;
window.togglePinNote = togglePinNote;
window.getNotesCount = getNotesCount;
window.getPinnedNotesCount = getPinnedNotesCount;
window.findNotes = findNotes;

// ✨ دوال المحرر
window.openNoteEditor = openNoteEditor;
window.renderNoteEditor = renderNoteEditor;
window.closeNoteEditor = closeNoteEditor;
window.resetNoteEditorState = resetNoteEditorState;
window.handleEditorDelete = handleEditorDelete;

// ✅ دوال الكاش
window.invalidateNotesCache = invalidateNotesCache;

// ⚠️ Legacy
window.openNoteModal = openNoteModal;

console.log("✅ Notes v3.3 loaded successfully! (With PM Protection + Notes Cache + Cross-Tab Sync)");
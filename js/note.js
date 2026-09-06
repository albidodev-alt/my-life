// ========================================
// MY LIFE HUB - NOTES v2.0
// نظام ملاحظات متكامل ومستقل
// ========================================

const NOTES_STORAGE_KEY = "myLifeHub_notes_v2";

// ========================================
// هيكل الملاحظة الواحدة
// ========================================
/*
{
  id: number,
  title: string,
  content: string,
  pinned: boolean,
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
*/

// ========================================
// دوال التخزين الأساسية
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
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Error saving notes:", error);
  }
}

// ========================================
// العمليات الأساسية على الملاحظات
// ========================================

function addNote(title, content) {
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  if (!trimmedTitle || !trimmedContent) {
    return null;
  }

  const notes = getAllNotes();
  const newNote = {
    id: Date.now() + Math.random() * 1000,
    title: trimmedTitle,
    content: trimmedContent,
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notes.unshift(newNote);
  saveAllNotes(notes);
  return newNote;
}

function updateNote(noteId, newTitle, newContent) {
  const trimmedTitle = newTitle.trim();
  const trimmedContent = newContent.trim();

  if (!trimmedTitle || !trimmedContent) {
    return false;
  }

  const notes = getAllNotes();
  const noteIndex = notes.findIndex(n => n.id === noteId);

  if (noteIndex === -1) return false;

  notes[noteIndex].title = trimmedTitle;
  notes[noteIndex].content = trimmedContent;
  notes[noteIndex].updatedAt = new Date().toISOString();

  saveAllNotes(notes);
  return true;
}

function deleteNote(noteId) {
  const notes = getAllNotes();
  const filteredNotes = notes.filter(n => n.id !== noteId);
  saveAllNotes(filteredNotes);
}

function togglePinNote(noteId) {
  const notes = getAllNotes();
  const note = notes.find(n => n.id === noteId);

  if (!note) return;

  note.pinned = !note.pinned;

  // ترتيب الملاحظات: المثبتة أولاً ثم الأحدث
  notes.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  saveAllNotes(notes);
}

function searchNotes(notes, searchTerm) {
  const query = searchTerm.trim().toLowerCase();
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

// ========================================
// عرض صفحة الملاحظات الرئيسية (مع الترجمة)
// ========================================

function renderNotesPageV2() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div id="notes-app-container">
      <!-- Header Section -->
      <div class="notes-header-section">
        <div class="notes-title-area">
          <h2 class="notes-main-title">${tr('notes', '📝 Notes')}</h2>
          <p class="notes-main-subtitle">${tr('notes_subtitle', 'Capture your thoughts, ideas, and reminders')}</p>
        </div>
        <button class="notes-add-main-btn" id="notes-open-add-btn">
          <span class="notes-add-icon">＋</span>
          ${tr('add_note', 'New Note')}
        </button>
      </div>

      <!-- Search Bar -->
      <div class="notes-search-container">
        <div class="notes-search-wrapper">
          <span class="notes-search-icon">🔍</span>
          <input 
            type="text" 
            class="notes-search-input" 
            id="notes-search-input"
            placeholder="${tr('search_notes', 'Search notes by title or content...')}"
            aria-label="${tr('search_notes', 'Search notes')}"
          />
        </div>
        <div class="notes-stats">
          <span id="notes-count">0 ${tr('notes', 'notes')}</span>
        </div>
      </div>

      <!-- Notes Grid -->
      <div class="notes-grid" id="notes-grid"></div>
    </div>
  `;

  const searchInput = document.getElementById("notes-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function() {
      renderNotesList(this.value);
    });
  }

  const addBtn = document.getElementById("notes-open-add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", function() {
      openNoteModal(null);
    });
  }

  renderNotesList("");
}

// ========================================
// عرض قائمة الملاحظات (مع الترجمة)
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
    icon.textContent = searchTerm ? "🔍" : "📝";

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
}

// ========================================
// إنشاء بطاقة ملاحظة واحدة (مع الترجمة)
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
    pinBadge.textContent = "📌 " + tr('pinned', 'Pinned');
    titleArea.appendChild(pinBadge);
  }

  const actions = document.createElement("div");
  actions.className = "notes-card-actions";

  const pinBtn = document.createElement("button");
  pinBtn.className = "notes-card-action-btn";
  pinBtn.textContent = note.pinned ? "📌" : "📍";
  pinBtn.title = note.pinned ? tr('unpin', 'Unpin note') : tr('pin', 'Pin note');
  pinBtn.setAttribute("aria-label", pinBtn.title);

  pinBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    togglePinNote(note.id);
    renderNotesList(document.getElementById("notes-search-input")?.value || "");
  });

  const editBtn = document.createElement("button");
  editBtn.className = "notes-card-action-btn";
  editBtn.textContent = "✏️";
  editBtn.title = tr('edit', 'Edit note');
  editBtn.setAttribute("aria-label", "Edit note");

  editBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    openNoteModal(note);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "notes-card-action-btn notes-delete-btn";
  deleteBtn.textContent = "🗑️";
  deleteBtn.title = tr('delete', 'Delete note');
  deleteBtn.setAttribute("aria-label", "Delete note");

  deleteBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    if (confirm(tr('delete_note_confirm', 'Delete "') + note.title + '"?')) {
      deleteNote(note.id);
      renderNotesList(document.getElementById("notes-search-input")?.value || "");
    }
  });

  actions.appendChild(pinBtn);
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  header.appendChild(titleArea);
  header.appendChild(actions);

  const content = document.createElement("p");
  content.className = "notes-card-content";
  content.textContent = note.content || "";

  const footer = document.createElement("div");
  footer.className = "notes-card-footer";

  const dateSpan = document.createElement("span");
  dateSpan.className = "notes-card-date";
  dateSpan.textContent = formatNoteDate(note.updatedAt || note.createdAt);

  const editIndicator = document.createElement("span");
  editIndicator.className = "notes-card-edit-indicator";
  if (note.updatedAt && note.updatedAt !== note.createdAt) {
    editIndicator.textContent = " (" + tr('edited', 'edited') + ")";
  }

  footer.appendChild(dateSpan);
  footer.appendChild(editIndicator);

  card.appendChild(header);
  card.appendChild(content);
  card.appendChild(footer);

  card.addEventListener("click", function(e) {
    if (e.target.closest("button")) return;
    openNoteModal(note);
  });

  return card;
}

// ========================================
// نافذة إضافة/تعديل ملاحظة (مع الترجمة)
// ========================================

function openNoteModal(editNote = null) {
  const isEditing = editNote !== null;
  const overlay = document.createElement("div");
  overlay.className = "notes-modal-overlay";
  overlay.id = "notes-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "notes-modal";
  modal.id = "notes-modal";

  const title = document.createElement("h3");
  title.className = "notes-modal-title";
  title.textContent = isEditing ? ("✏️ " + tr('edit_note', 'Edit Note')) : ("➕ " + tr('new_note', 'New Note'));

  const titleLabel = document.createElement("label");
  titleLabel.className = "notes-modal-label";
  titleLabel.textContent = tr('title', 'Title');
  titleLabel.setAttribute("for", "notes-modal-title-input");

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.id = "notes-modal-title-input";
  titleInput.className = "notes-modal-input";
  titleInput.placeholder = tr('enter_note_title', 'Enter note title...');
  titleInput.maxLength = 120;
  titleInput.value = isEditing ? editNote.title : "";

  const contentLabel = document.createElement("label");
  contentLabel.className = "notes-modal-label";
  contentLabel.textContent = tr('content', 'Content');
  contentLabel.setAttribute("for", "notes-modal-content-input");

  const contentInput = document.createElement("textarea");
  contentInput.id = "notes-modal-content-input";
  contentInput.className = "notes-modal-textarea";
  contentInput.placeholder = tr('write_note_here', 'Write your note here...');
  contentInput.rows = 6;
  contentInput.maxLength = 5000;
  contentInput.value = isEditing ? editNote.content : "";

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "notes-modal-actions";

  const saveBtn = document.createElement("button");
  saveBtn.className = "notes-modal-save-btn";
  saveBtn.textContent = isEditing ? ("💾 " + tr('update_note', 'Update Note')) : ("➕ " + tr('add_note_btn', 'Add Note'));

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "notes-modal-cancel-btn";
  cancelBtn.textContent = tr('cancel', 'Cancel');

  const closeBtn = document.createElement("button");
  closeBtn.className = "notes-modal-close-btn";
  closeBtn.textContent = "✕";
  closeBtn.setAttribute("aria-label", "Close modal");

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(titleLabel);
  modal.appendChild(titleInput);
  modal.appendChild(contentLabel);
  modal.appendChild(contentInput);

  actionsDiv.appendChild(cancelBtn);
  actionsDiv.appendChild(saveBtn);
  modal.appendChild(actionsDiv);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function closeModal() {
    overlay.remove();
  }

  function handleSave() {
    const newTitle = titleInput.value.trim();
    const newContent = contentInput.value.trim();

    if (!newTitle) {
      titleInput.classList.add("notes-modal-input-error");
      titleInput.focus();
      setTimeout(() => titleInput.classList.remove("notes-modal-input-error"), 500);
      return;
    }

    if (!newContent) {
      contentInput.classList.add("notes-modal-input-error");
      contentInput.focus();
      setTimeout(() => contentInput.classList.remove("notes-modal-input-error"), 500);
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
      closeModal();
      renderNotesList(document.getElementById("notes-search-input")?.value || "");
    }
  }

  saveBtn.addEventListener("click", handleSave);

  cancelBtn.addEventListener("click", closeModal);

  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closeModal();
  });

  titleInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      contentInput.focus();
    }
  });

  contentInput.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && document.getElementById("notes-modal-overlay")) {
      closeModal();
    }
  });

  setTimeout(() => titleInput.focus(), 100);
}

// ========================================
// تصدير الدوال للاستخدام من ملفات أخرى
// ========================================

window.renderNotesPageV2 = renderNotesPageV2;
window.renderNotesList = renderNotesList;

console.log("✅ Notes v2.0 loaded successfully!");
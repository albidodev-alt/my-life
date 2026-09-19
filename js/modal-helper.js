// ========================================
// MY LIFE HUB - MODAL HELPER
// نظام النوافذ الموحدة - الدوال المساعدة
// ========================================

/**
 * إنشاء نافذة منبثقة موحدة
 */
function createModal(options = {}) {
  const {
    id = 'modal-' + Date.now(),
    title = '',
    content = '',
    size = 'medium',
    onClose = null,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true
  } = options;

  const existing = document.getElementById(`${id}-overlay`);
  if (existing) existing.remove();

  // ===== Overlay =====
  const overlay = document.createElement('div');
  overlay.className = 'modal-base-overlay';
  overlay.id = `${id}-overlay`;
  overlay.setAttribute('role', 'presentation');

  // ===== Modal =====
  const modal = document.createElement('div');
  modal.className = `modal-base modal-base-${size}`;
  modal.id = id;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  if (title) modal.setAttribute('aria-labelledby', `${id}-title`);

  // ===== Header =====
  const header = document.createElement('div');
  header.className = 'modal-base-header';

  const titleEl = document.createElement('h3');
  titleEl.className = 'modal-base-title';
  titleEl.id = `${id}-title`;
  titleEl.innerHTML = title;

  header.appendChild(titleEl);

  // ===== زر الإغلاق =====
  let closeBtn = null;
  if (showCloseButton) {
    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'modal-base-close';
    closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeBtn.setAttribute('aria-label', 'Close');
    header.appendChild(closeBtn);
  }

  // ===== Body =====
  const body = document.createElement('div');
  body.className = 'modal-base-body';

  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // ===== منع تمرير الصفحة الخلفية =====
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  // ===== دوال الإغلاق =====
  let isClosed = false;
  let escapeHandler = null;

  function close() {
    if (isClosed) return;
    isClosed = true;

    if (escapeHandler) {
      document.removeEventListener('keydown', escapeHandler);
    }

    document.body.style.overflow = previousOverflow;

    overlay.classList.add('closing');
    modal.classList.add('closing');

    setTimeout(() => {
      overlay.remove();
      if (typeof onClose === 'function') onClose();
    }, 200);
  }

  if (closeBtn) closeBtn.addEventListener('click', close);

  if (closeOnOverlayClick) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  if (closeOnEscape) {
    escapeHandler = (e) => {
      if (e.key === 'Escape' && document.body.contains(overlay)) {
        close();
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  if (typeof debouncedLucide === 'function') debouncedLucide(30);

  // ===== Focus على أول عنصر تفاعلي =====
  setTimeout(() => {
    const firstFocusable = modal.querySelector(
      'input:not([type="hidden"]), textarea, select, button:not(.modal-base-close)'
    );
    if (firstFocusable) firstFocusable.focus();
  }, 100);

  return {
    overlay,
    modal,
    body,
    header,
    close,
    setContent: (newContent) => {
      if (typeof newContent === 'string') {
        body.innerHTML = newContent;
      } else if (newContent instanceof HTMLElement) {
        body.replaceChildren(newContent);
      }
      if (typeof debouncedLucide === 'function') debouncedLucide(30);
    },
    setTitle: (newTitle) => {
      titleEl.innerHTML = newTitle;
      if (typeof debouncedLucide === 'function') debouncedLucide(30);
    }
  };
}

/**
 * إنشاء صف الأزرار (Actions)
 */
function createModalActions(actions = []) {
  const wrapper = document.createElement('div');
  wrapper.className = 'modal-base-actions';

  actions.forEach(action => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `modal-base-btn modal-base-btn-${action.type || 'secondary'}`;

    if (action.label) btn.innerHTML = action.label;
    if (action.disabled) btn.disabled = true;
    if (typeof action.onClick === 'function') btn.addEventListener('click', action.onClick);

    wrapper.appendChild(btn);
  });

  return wrapper;
}

/**
 * إنشاء حقل إدخال
 */
function createModalField(options = {}) {
  const {
    id = 'field-' + Date.now(),
    label = '',
    type = 'text',
    value = '',
    placeholder = '',
    required = false,
    options: selectOptions = [],
    rows = 4,
    maxLength = null,
    helper = ''
  } = options;

  const field = document.createElement('div');
  field.className = 'modal-base-field';

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'modal-base-label';
    labelEl.textContent = label + (required ? ' *' : '');
    labelEl.setAttribute('for', id);
    field.appendChild(labelEl);
  }

  let input;

  if (type === 'textarea') {
    input = document.createElement('textarea');
    input.className = 'modal-base-textarea';
    input.rows = rows;
    if (maxLength) input.maxLength = maxLength;
  } else if (type === 'select') {
    input = document.createElement('select');
    input.className = 'modal-base-select';

    selectOptions.forEach(opt => {
      const optionEl = document.createElement('option');
      optionEl.value = typeof opt === 'string' ? opt : opt.value;
      optionEl.textContent = typeof opt === 'string' ? opt : opt.label;
      if (optionEl.value === value) optionEl.selected = true;
      input.appendChild(optionEl);
    });
  } else {
    input = document.createElement('input');
    input.type = type;
    input.className = 'modal-base-input';
    input.value = value;
    if (maxLength) input.maxLength = maxLength;
  }

  input.id = id;
  if (placeholder) input.placeholder = placeholder;
  if (required) input.required = true;

  field.appendChild(input);

  if (helper) {
    const helperEl = document.createElement('div');
    helperEl.className = 'modal-base-helper';
    helperEl.textContent = helper;
    field.appendChild(helperEl);
  }

  const errorEl = document.createElement('div');
  errorEl.className = 'modal-base-error-message';
  errorEl.id = `${id}-error`;
  field.appendChild(errorEl);

  return { field, input, errorEl };
}

/**
 * نافذة تأكيد (بديل confirm)
 */
function confirmModal(options = {}) {
  const {
    title = 'Confirm',
    message = 'Are you sure?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    type = 'danger',
    icon = null,
    onConfirm = () => {},
    onCancel = null
  } = options;

  const modal = createModal({
    id: 'confirm-modal',
    title: title,
    size: 'small',
    onClose: () => {
      if (typeof onCancel === 'function') onCancel();
    }
  });

  if (icon) {
    const iconEl = document.createElement('div');
    iconEl.className = `modal-base-icon-centered ${type === 'danger' ? 'danger' : ''}`;
    iconEl.innerHTML = `<span data-lucide="${icon}"></span>`;
    modal.body.appendChild(iconEl);
  }

  const messageEl = document.createElement('p');
  messageEl.className = 'modal-base-message';
  messageEl.style.textAlign = icon ? 'center' : 'left';
  messageEl.innerHTML = message;
  modal.body.appendChild(messageEl);

  const actions = createModalActions([
    {
      label: cancelLabel,
      type: 'secondary',
      onClick: () => {
        modal.close();
        if (typeof onCancel === 'function') onCancel();
      }
    },
    {
      label: confirmLabel,
      type: type,
      onClick: () => {
        modal.close();
        onConfirm();
      }
    }
  ]);

  modal.body.appendChild(actions);
}

/**
 * نافذة إدخال نصي (بديل prompt)
 */
function promptModal(options = {}) {
  const {
    title = 'Input',
    message = '',
    label = '',
    placeholder = '',
    defaultValue = '',
    inputType = 'text',
    multiline = false,
    rows = 4,
    maxLength = null,
    confirmLabel = 'Save',
    cancelLabel = 'Cancel',
    validate = null,
    errorMessage = 'Invalid input',
    onConfirm = () => {},
    onCancel = null
  } = options;

  const modal = createModal({
    id: 'prompt-modal',
    title: title,
    size: 'small',
    onClose: () => {
      if (typeof onCancel === 'function') onCancel();
    }
  });

  if (message) {
    const messageEl = document.createElement('p');
    messageEl.className = 'modal-base-message';
    messageEl.style.marginBottom = '16px';
    messageEl.textContent = message;
    modal.body.appendChild(messageEl);
  }

  const field = createModalField({
    id: 'prompt-input',
    label: label,
    type: multiline ? 'textarea' : inputType,
    rows: rows,
    value: defaultValue,
    placeholder: placeholder,
    maxLength: maxLength
  });

  modal.body.appendChild(field.field);

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'modal-base-btn modal-base-btn-primary';
  confirmBtn.innerHTML = confirmLabel;

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'modal-base-btn modal-base-btn-secondary';
  cancelBtn.innerHTML = cancelLabel;

  function handleSave() {
    const value = field.input.value.trim();

    if (typeof validate === 'function' && !validate(value)) {
      field.errorEl.textContent = errorMessage;
      field.errorEl.classList.add('show');
      field.input.classList.add('modal-base-input-error');
      field.input.focus();
      return;
    }

    modal.close();
    onConfirm(value);
  }

  function handleCancel() {
    modal.close();
    if (typeof onCancel === 'function') onCancel();
  }

  confirmBtn.addEventListener('click', handleSave);
  cancelBtn.addEventListener('click', handleCancel);

  field.input.addEventListener('input', () => {
    field.errorEl.classList.remove('show');
    field.input.classList.remove('modal-base-input-error');
  });

  if (!multiline) {
    field.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    });
  } else {
    field.input.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    });
  }

  const actionsWrapper = document.createElement('div');
  actionsWrapper.className = 'modal-base-actions';
  actionsWrapper.appendChild(cancelBtn);
  actionsWrapper.appendChild(confirmBtn);
  modal.body.appendChild(actionsWrapper);

  setTimeout(() => {
    field.input.focus();
    if (defaultValue) {
      field.input.setSelectionRange(defaultValue.length, defaultValue.length);
    }
  }, 100);
}

/**
 * نافذة معلومات/تنبيه (بديل alert)
 */
function infoModal(options = {}) {
  const {
    title = 'Info',
    message = '',
    icon = 'info',
    iconType = 'primary',
    confirmLabel = 'OK',
    onConfirm = null,
    onClose = null
  } = options;

  const modal = createModal({
    id: 'info-modal',
    title: title,
    size: 'small',
    onClose: () => {
      if (typeof onClose === 'function') onClose();
    }
  });

  const iconEl = document.createElement('div');
  iconEl.className = `modal-base-icon-centered ${iconType}`;
  iconEl.innerHTML = `<span data-lucide="${icon}"></span>`;
  modal.body.appendChild(iconEl);

  const messageEl = document.createElement('p');
  messageEl.className = 'modal-base-message';
  messageEl.style.textAlign = 'center';
  messageEl.style.whiteSpace = 'pre-line';
  messageEl.textContent = message;
  modal.body.appendChild(messageEl);

  const actions = createModalActions([
    {
      label: confirmLabel,
      type: 'primary',
      onClick: () => {
        modal.close();
        if (typeof onConfirm === 'function') onConfirm();
      }
    }
  ]);

  modal.body.appendChild(actions);
  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// ✅ DELETE MODAL - مقسمة لدوال صغيرة
// ========================================

/**
 * إعدادات أنواع الحذف
 */
function getDeleteTypeConfig() {
  return {
    note: {
      icon: 'file-text',
      title: typeof t === 'function' ? t('delete_note', 'Delete Note') : 'Delete Note'
    },
    task: {
      icon: 'check-square',
      title: typeof t === 'function' ? t('delete_task', 'Delete Task') : 'Delete Task'
    },
    event: {
      icon: 'calendar-x',
      title: typeof t === 'function' ? t('delete_event', 'Delete Event') : 'Delete Event'
    },
    program: {
      icon: 'graduation-cap',
      title: typeof t === 'function' ? t('delete_program', 'Delete Program') : 'Delete Program'
    },
    all: {
      icon: 'alert-octagon',
      title: typeof t === 'function' ? t('delete_all_data', 'Do you want to delete all your data') : 'Do you want to delete all your data',
      isDangerous: true,
      warningText: typeof t === 'function' ? t('delete_all_warning', 'Tasks, notes, events, programs, routine, and settings will be permanently deleted.') : 'Tasks, notes, events, programs, routine, and settings will be permanently deleted.'
    }
  };
}

/**
 * إنشاء أيقونة الحذف
 */
function createDeleteIcon(config) {
  const BLUE_BG = 'rgba(79, 142, 219, 0.12)';
  const BLUE_COLOR = '#4f8edb';

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'delete-modal-icon';
  iconWrapper.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    margin: 8px auto 24px;
    background: ${config.isDangerous ? 'rgba(231, 76, 94, 0.12)' : BLUE_BG};
    border-radius: 50%;
    color: ${config.isDangerous ? '#e74c5e' : BLUE_COLOR};
    animation: deleteIconPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  if (config.isDangerous) {
    iconWrapper.style.animation = 'deleteIconPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), deleteIconPulse 1.5s ease-in-out 0.4s infinite';
  }

  const iconEl = document.createElement('span');
  iconEl.setAttribute('data-lucide', config.icon);
  iconEl.style.cssText = 'width: 40px; height: 40px;';
  iconWrapper.appendChild(iconEl);

  return iconWrapper;
}

/**
 * إنشاء عنوان الحذف
 */
function createDeleteTitle(config, itemName) {
  const BLUE_COLOR = '#4f8edb';
  const fragment = document.createDocumentFragment();

  // ===== العنوان الرئيسي =====
  const titleEl = document.createElement('h3');
  titleEl.style.cssText = `
    margin: 0 0 12px 0;
    font-family: var(--font-handwritten);
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    line-height: 1.3;
    padding: 0 12px;
  `;
  titleEl.textContent = config.title + (config.isDangerous ? '؟' : '?');
  fragment.appendChild(titleEl);

  // ===== اسم العنصر =====
  if (itemName && itemName.trim() !== '') {
    const nameEl = document.createElement('p');
    nameEl.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: ${config.isDangerous ? '#e74c5e' : BLUE_COLOR};
      text-align: center;
      font-family: var(--font-handwritten);
      word-break: break-word;
      line-height: 1.5;
      padding: 0 12px;
    `;
    nameEl.textContent = `"${itemName}"`;
    fragment.appendChild(nameEl);
  }

  // ===== تحذير =====
  if (config.isDangerous) {
    const warningEl = document.createElement('p');
    warningEl.style.cssText = `
      margin: 12px 0 0 0;
      font-size: 13px;
      color: var(--danger);
      text-align: center;
      font-weight: 500;
      line-height: 1.6;
      padding: 0 12px;
    `;
    warningEl.textContent = '⚠️ ' + (config.warningText || (typeof t === 'function' ? t('cannot_undo', 'Cannot be undone') : 'Cannot be undone'));
    fragment.appendChild(warningEl);
  }

  return fragment;
}

/**
 * إنشاء أزرار الحذف
 */
function createDeleteActions(config, onConfirm, onCancel, closeFn) {
  const BLUE_COLOR = '#4f8edb';
  const BLUE_BG = 'rgba(79, 142, 219, 0.12)';

  const actionsWrapper = document.createElement('div');
  actionsWrapper.style.cssText = 'display:flex;gap:10px;margin-top:24px;';

  // ===== زر الإلغاء =====
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'modal-base-btn modal-base-btn-secondary';
  cancelBtn.textContent = typeof t === 'function' ? t('cancel', 'Cancel') : 'Cancel';
  cancelBtn.addEventListener('click', () => {
    closeFn();
    if (typeof onCancel === 'function') onCancel();
  });

  // ===== زر الحذف =====
  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'modal-base-btn';

  const btnColor = config.isDangerous ? '#e74c5e' : BLUE_COLOR;
  const btnBg = config.isDangerous ? 'rgba(231, 76, 94, 0.12)' : BLUE_BG;

  confirmBtn.style.cssText = `
    background: ${btnColor};
    color: white;
    box-shadow: 0 4px 12px ${btnBg};
  `;
  confirmBtn.textContent = typeof t === 'function' ? t('delete', 'Delete') : 'Delete';

  confirmBtn.addEventListener('mouseenter', function () {
    this.style.transform = 'translateY(-2px)';
    this.style.boxShadow = `0 6px 16px ${btnBg}`;
  });
  confirmBtn.addEventListener('mouseleave', function () {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = `0 4px 12px ${btnBg}`;
  });

  confirmBtn.addEventListener('click', () => {
    closeFn();
    onConfirm();
  });

  actionsWrapper.appendChild(cancelBtn);
  actionsWrapper.appendChild(confirmBtn);

  return actionsWrapper;
}

/**
 * إنشاء زر الإغلاق (لنافذة الحذف)
 */
function createDeleteCloseBtn(closeFn) {
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-base-close';
  closeBtn.style.cssText = 'position:absolute;top:12px;right:12px;z-index:10;';
  closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.addEventListener('click', closeFn);
  return closeBtn;
}

/**
 * نافذة حذف موحدة (مبسطة الآن)
 */
function deleteModal(options = {}) {
  const {
    itemName = '',
    itemType = 'note',
    onConfirm = () => {},
    onCancel = null
  } = options;

  const allConfig = getDeleteTypeConfig();
  const config = allConfig[itemType] || allConfig.note;

  const modal = createModal({
    id: 'delete-modal',
    title: '',
    size: 'small',
    showCloseButton: false,
    onClose: () => {
      if (typeof onCancel === 'function') onCancel();
    }
  });

  // إخفاء الـ header
  modal.header.style.display = 'none';

  // ===== زر الإغلاق =====
  modal.modal.appendChild(createDeleteCloseBtn(() => modal.close()));

  // ===== الأيقونة =====
  modal.body.appendChild(createDeleteIcon(config));

  // ===== العنوان والاسم والتحذير =====
  modal.body.appendChild(createDeleteTitle(config, itemName));

  // ===== الأزرار =====
  modal.body.appendChild(
    createDeleteActions(config, onConfirm, onCancel, () => modal.close())
  );

  if (typeof debouncedLucide === 'function') debouncedLucide(50);
}

// ========================================
// التصدير
// ========================================
window.createModal = createModal;
window.createModalActions = createModalActions;
window.createModalField = createModalField;
window.confirmModal = confirmModal;
window.promptModal = promptModal;
window.infoModal = infoModal;
window.deleteModal = deleteModal;

console.log("✅ Modal Helper loaded successfully!");
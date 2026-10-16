/**
 * ============================================================================
 * TaskFlow — Modern Task & Productivity Manager
 * Author: Portfolio / Resume Ready
 * Description: Vanilla JavaScript task manager featuring CRUD operations,
 *              due dates, priority tagging, live search, advanced filtering,
 *              dynamic statistics, animated progress bar, dark/light themes,
 *              and persistent localStorage storage.
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. STATE & CONSTANTS
     ========================================================================== */
  const STORAGE_KEYS = {
    TASKS: 'taskflow_tasks_v1',
    THEME: 'taskflow_theme',
  };

  // Sample tasks loaded on the very first launch so the reviewer sees a populated, active dashboard
  const DEFAULT_SAMPLE_TASKS = [
    {
      id: 'task-sample-1',
      title: 'Complete web development portfolio project',
      description: 'Polish responsive layout, dark theme, and add comprehensive documentation.',
      priority: 'high',
      category: 'Work',
      dueDate: getRelativeDate(1), // Tomorrow
      completed: false,
      createdAt: Date.now() - 86400000,
      completedAt: null,
    },
    {
      id: 'task-sample-2',
      title: 'Review JavaScript ES6+ modern features & algorithms',
      description: 'Study asynchronous programming, closures, and performance optimization.',
      priority: 'medium',
      category: 'Study',
      dueDate: getRelativeDate(3),
      completed: false,
      createdAt: Date.now() - 43200000,
      completedAt: null,
    },
    {
      id: 'task-sample-3',
      title: 'Prepare resume and GitHub repository showcase',
      description: 'Add live demo links, clean README with badges, and license information.',
      priority: 'high',
      category: 'Work',
      dueDate: getRelativeDate(0), // Due Today
      completed: false,
      createdAt: Date.now() - 172800000,
      completedAt: null,
    },
    {
      id: 'task-sample-4',
      title: 'Morning 30-minute cardio & stretching routine',
      description: 'Stay healthy and active for better daily focus.',
      priority: 'low',
      category: 'Health',
      dueDate: getRelativeDate(-1), // Completed yesterday
      completed: true,
      createdAt: Date.now() - 259200000,
      completedAt: Date.now() - 86400000,
    },
  ];

  // Application State
  const state = {
    tasks: [],
    filter: 'all', // 'all' | 'active' | 'completed'
    priorityFilter: 'all', // 'all' | 'high' | 'medium' | 'low'
    categoryFilter: 'all', // 'all' | 'Work' | 'Personal' | 'Study' | etc.
    searchQuery: '',
    sortBy: 'due-asc', // 'due-asc' | 'due-desc' | 'priority-high' | 'priority-low' | 'newest' | 'oldest' | 'alpha'
    editingTaskId: null,
    pendingDeleteTaskId: null,
  };

  /* ==========================================================================
     2. DOM ELEMENT SELECTORS
     ========================================================================== */
  const elements = {
    // Theme & Clock
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    currentDateDisplay: document.getElementById('current-date-display'),

    // Statistics
    totalTasksCount: document.getElementById('total-tasks-count'),
    completedTasksCount: document.getElementById('completed-tasks-count'),
    pendingTasksCount: document.getElementById('pending-tasks-count'),
    overdueTasksCount: document.getElementById('overdue-tasks-count'),

    // Progress Bar
    progressBar: document.getElementById('progress-bar'),
    progressPercent: document.getElementById('progress-percent'),
    progressMessage: document.getElementById('progress-message'),

    // Task Creation Form
    taskForm: document.getElementById('task-form'),
    taskInput: document.getElementById('task-input'),
    taskPriority: document.getElementById('task-priority'),
    taskCategory: document.getElementById('task-category'),
    taskDueDate: document.getElementById('task-due-date'),
    toggleNotesBtn: document.getElementById('toggle-notes-btn'),
    notesContainer: document.getElementById('notes-container'),
    taskNotes: document.getElementById('task-notes'),

    // Search & Filters
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    filterTabBadges: {
      all: document.getElementById('badge-count-all'),
      active: document.getElementById('badge-count-active'),
      completed: document.getElementById('badge-count-completed'),
    },
    priorityFilter: document.getElementById('priority-filter'),
    categoryFilter: document.getElementById('category-filter'),
    sortBySelect: document.getElementById('sort-by-select'),
    clearCompletedBtn: document.getElementById('clear-completed-btn'),
    resetDemoBtn: document.getElementById('reset-demo-btn'),

    // Task List & Empty State
    taskList: document.getElementById('task-list'),
    taskListSummary: document.getElementById('task-list-summary'),
    emptyState: document.getElementById('empty-state'),
    emptyStateTitle: document.getElementById('empty-state-title'),
    emptyStateDesc: document.getElementById('empty-state-desc'),
    emptyStateActionBtn: document.getElementById('empty-state-action-btn'),

    // Edit Modal
    editModal: document.getElementById('edit-modal'),
    editModalCloseBtn: document.getElementById('edit-modal-close'),
    editModalCancelBtn: document.getElementById('edit-modal-cancel'),
    editForm: document.getElementById('edit-form'),
    editTitleInput: document.getElementById('edit-title-input'),
    editDescInput: document.getElementById('edit-desc-input'),
    editPrioritySelect: document.getElementById('edit-priority-select'),
    editCategorySelect: document.getElementById('edit-category-select'),
    editDueDateInput: document.getElementById('edit-due-date-input'),

    // Delete Confirmation Modal
    confirmModal: document.getElementById('confirm-modal'),
    confirmModalCloseBtn: document.getElementById('confirm-modal-close'),
    confirmModalCancelBtn: document.getElementById('confirm-modal-cancel'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
    confirmModalText: document.getElementById('confirm-modal-text'),

    // Toast Container
    toastContainer: document.getElementById('toast-container'),
  };

  /* ==========================================================================
     3. INITIALIZATION
     ========================================================================== */
  function init() {
    initTheme();
    updateDateDisplay();
    loadTasks();
    setupEventListeners();
    render();
  }

  /* ==========================================================================
     4. THEME MANAGEMENT (Dark / Light Mode)
     ========================================================================== */
  function initTheme() {
    // Check saved preference or system preference
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
  }

  /* ==========================================================================
     5. LOCALSTORAGE PERSISTENCE HELPERS
     ========================================================================== */
  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (stored) {
        state.tasks = JSON.parse(stored);
      } else {
        // First-time visit: seed with demo tasks
        state.tasks = [...DEFAULT_SAMPLE_TASKS];
        saveTasks();
      }
    } catch (err) {
      console.error('Failed to parse tasks from localStorage:', err);
      state.tasks = [...DEFAULT_SAMPLE_TASKS];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
    } catch (err) {
      console.error('Failed to save tasks to localStorage:', err);
      showToast('Storage quota exceeded or unavailable', 'danger');
    }
  }

  /* ==========================================================================
     6. TASK CRUD OPERATIONS
     ========================================================================== */
  /**
   * Adds a new task to the state
   */
  function addTask(title, priority, category, dueDate, description) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast('Please enter a task description', 'warning');
      elements.taskInput.focus();
      return;
    }

    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: trimmedTitle,
      description: description.trim(),
      priority: priority || 'medium',
      category: category || 'General',
      dueDate: dueDate || '',
      completed: false,
      createdAt: Date.now(),
      completedAt: null,
    };

    state.tasks.unshift(newTask);
    saveTasks();
    render();
    showToast('Task added successfully', 'success');

    // Reset Creation Form
    elements.taskInput.value = '';
    elements.taskNotes.value = '';
    elements.taskDueDate.value = '';
    elements.taskPriority.value = 'medium';
    elements.taskCategory.value = 'Work';
    if (elements.notesContainer.classList.contains('open')) {
      elements.notesContainer.classList.remove('open');
      elements.toggleNotesBtn.textContent = '+ Notes';
    }
    elements.taskInput.focus();
  }

  /**
   * Toggles task completion state
   */
  function toggleTask(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? Date.now() : null;

    saveTasks();
    render();

    if (task.completed) {
      showToast('Task completed! Great job! 🎉', 'success');
    } else {
      showToast('Task marked as active', 'info');
    }
  }

  /**
   * Prompts confirmation and deletes a task
   */
  function promptDeleteTask(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    state.pendingDeleteTaskId = id;
    elements.confirmModalText.textContent = `Are you sure you want to delete "${task.title}"? This cannot be undone.`;
    openModal(elements.confirmModal);
  }

  function confirmDelete() {
    if (!state.pendingDeleteTaskId) return;

    state.tasks = state.tasks.filter((t) => t.id !== state.pendingDeleteTaskId);
    state.pendingDeleteTaskId = null;
    closeModal(elements.confirmModal);
    saveTasks();
    render();
    showToast('Task deleted successfully', 'danger');
  }

  /**
   * Opens the edit modal with current task values
   */
  function openEditModal(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    state.editingTaskId = id;
    elements.editTitleInput.value = task.title;
    elements.editDescInput.value = task.description || '';
    elements.editPrioritySelect.value = task.priority || 'medium';
    elements.editCategorySelect.value = task.category || 'Work';
    elements.editDueDateInput.value = task.dueDate || '';

    openModal(elements.editModal);
    setTimeout(() => elements.editTitleInput.focus(), 50);
  }

  /**
   * Saves updates from the edit modal
   */
  function saveEditedTask() {
    if (!state.editingTaskId) return;

    const task = state.tasks.find((t) => t.id === state.editingTaskId);
    if (!task) return;

    const newTitle = elements.editTitleInput.value.trim();
    if (!newTitle) {
      showToast('Task title cannot be empty', 'warning');
      elements.editTitleInput.focus();
      return;
    }

    task.title = newTitle;
    task.description = elements.editDescInput.value.trim();
    task.priority = elements.editPrioritySelect.value;
    task.category = elements.editCategorySelect.value;
    task.dueDate = elements.editDueDateInput.value;

    saveTasks();
    closeModal(elements.editModal);
    state.editingTaskId = null;
    render();
    showToast('Task updated successfully', 'success');
  }

  /**
   * Clears all completed tasks from the list
   */
  function clearCompletedTasks() {
    const completedCount = state.tasks.filter((t) => t.completed).length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear', 'info');
      return;
    }

    state.tasks = state.tasks.filter((t) => !t.completed);
    saveTasks();
    render();
    showToast(`Removed ${completedCount} completed task${completedCount > 1 ? 's' : ''}`, 'info');
  }

  /**
   * Resets the list to demo sample tasks
   */
  function resetSampleTasks() {
    state.tasks = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_TASKS));
    saveTasks();
    render();
    showToast('Sample tasks loaded', 'success');
  }

  /* ==========================================================================
     7. FILTERING & SORTING LOGIC
     ========================================================================== */
  function getFilteredAndSortedTasks() {
    let result = [...state.tasks];

    // Status Filter (All / Active / Completed)
    if (state.filter === 'active') {
      result = result.filter((task) => !task.completed);
    } else if (state.filter === 'completed') {
      result = result.filter((task) => task.completed);
    }

    // Priority Filter
    if (state.priorityFilter !== 'all') {
      result = result.filter((task) => task.priority === state.priorityFilter);
    }

    // Category Filter
    if (state.categoryFilter !== 'all') {
      result = result.filter((task) => task.category === state.categoryFilter);
    }

    // Live Search Filter (searches both title and notes)
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          (task.description && task.description.toLowerCase().includes(q)) ||
          task.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      // Always group incomplete tasks before completed tasks
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      switch (state.sortBy) {
        case 'due-asc': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        case 'due-desc': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        }
        case 'priority-high': {
          const pMap = { high: 3, medium: 2, low: 1 };
          return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
        }
        case 'priority-low': {
          const pMap = { high: 3, medium: 2, low: 1 };
          return (pMap[a.priority] || 0) - (pMap[b.priority] || 0);
        }
        case 'newest': {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
        case 'oldest': {
          return (a.createdAt || 0) - (b.createdAt || 0);
        }
        case 'alpha': {
          return a.title.localeCompare(b.title);
        }
        default:
          return 0;
      }
    });

    return result;
  }

  /* ==========================================================================
     8. RENDERING FUNCTIONS
     ========================================================================== */
  function render() {
    renderStats();
    renderProgress();
    renderTasks();
  }

  /**
   * Renders the statistics dashboard
   */
  function renderStats() {
    const total = state.tasks.length;
    const completed = state.tasks.filter((t) => t.completed).length;
    const pending = total - completed;

    // Calculate overdue (only active tasks with a due date prior to today)
    const todayStr = getTodayDateString();
    const overdue = state.tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length;

    elements.totalTasksCount.textContent = total;
    elements.completedTasksCount.textContent = completed;
    elements.pendingTasksCount.textContent = pending;
    elements.overdueTasksCount.textContent = overdue;

    // Filter tab badge counts
    elements.filterTabBadges.all.textContent = total;
    elements.filterTabBadges.active.textContent = pending;
    elements.filterTabBadges.completed.textContent = completed;
  }

  /**
   * Renders the animated progress bar & message
   */
  function renderProgress() {
    const total = state.tasks.length;
    const completed = state.tasks.filter((t) => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    elements.progressBar.style.width = `${percentage}%`;
    elements.progressPercent.textContent = `${percentage}%`;

    // Dynamic motivating messages
    if (total === 0) {
      elements.progressMessage.textContent = 'No tasks recorded. Add your first task to begin!';
    } else if (percentage === 100) {
      elements.progressMessage.textContent = '🎉 Incredible! All tasks are completed!';
    } else if (percentage >= 75) {
      elements.progressMessage.textContent = 'Almost there! Finish strong!';
    } else if (percentage >= 50) {
      elements.progressMessage.textContent = 'Halfway done! Keep the momentum going!';
    } else if (percentage > 0) {
      elements.progressMessage.textContent = `${completed} of ${total} tasks finished. You got this!`;
    } else {
      elements.progressMessage.textContent = `${pending} tasks pending. Ready to take action?`;
    }
  }

  /**
   * Renders the filtered and sorted task list
   */
  function renderTasks() {
    const filteredTasks = getFilteredAndSortedTasks();

    // Update list summary text
    elements.taskListSummary.textContent = `Showing ${filteredTasks.length} ${
      filteredTasks.length === 1 ? 'task' : 'tasks'
    }`;

    // Clear current DOM items
    elements.taskList.innerHTML = '';

    // Handle Empty States
    if (filteredTasks.length === 0) {
      elements.emptyState.style.display = 'flex';

      if (state.searchQuery.trim() !== '') {
        elements.emptyStateTitle.textContent = 'No matching tasks found';
        elements.emptyStateDesc.textContent = `No tasks match your search "${state.searchQuery}". Try a different keyword or clear your search.`;
        elements.emptyStateActionBtn.textContent = 'Clear Search';
        elements.emptyStateActionBtn.onclick = () => {
          elements.searchInput.value = '';
          state.searchQuery = '';
          elements.searchClearBtn.classList.remove('visible');
          render();
        };
      } else if (state.filter === 'completed') {
        elements.emptyStateTitle.textContent = 'No completed tasks yet';
        elements.emptyStateDesc.textContent = 'Tasks you complete will appear here. Mark one as done above!';
        elements.emptyStateActionBtn.textContent = 'View All Tasks';
        elements.emptyStateActionBtn.onclick = () => setFilter('all');
      } else if (state.filter === 'active') {
        elements.emptyStateTitle.textContent = 'All caught up!';
        elements.emptyStateDesc.textContent = 'You have no pending tasks. Enjoy your free time or add a new one!';
        elements.emptyStateActionBtn.textContent = '+ Add New Task';
        elements.emptyStateActionBtn.onclick = () => elements.taskInput.focus();
      } else {
        elements.emptyStateTitle.textContent = 'Your task list is empty';
        elements.emptyStateDesc.textContent = 'Organize your day, set priorities, and track your progress in real-time.';
        elements.emptyStateActionBtn.textContent = 'Load Demo Tasks';
        elements.emptyStateActionBtn.onclick = () => resetSampleTasks();
      }
      return;
    }

    elements.emptyState.style.display = 'none';

    // Build DOM elements for each task
    filteredTasks.forEach((task) => {
      const li = createTaskElement(task);
      elements.taskList.appendChild(li);
    });
  }

  /**
   * Creates an accessible, modern DOM element for a task item
   */
  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);

    // 1. Checkbox Wrapper
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'task-checkbox-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    checkboxWrapper.appendChild(checkbox);

    // 2. Task Details (Title, Description, Tags)
    const details = document.createElement('div');
    details.className = 'task-details';

    const titleEl = document.createElement('div');
    titleEl.className = 'task-text';
    titleEl.textContent = task.title;
    details.appendChild(titleEl);

    // Notes/Description if available
    if (task.description && task.description.trim() !== '') {
      const descEl = document.createElement('div');
      descEl.className = 'task-description-preview';
      descEl.textContent = task.description;
      details.appendChild(descEl);
    }

    // Badges / Tags row
    const tagsRow = document.createElement('div');
    tagsRow.className = 'task-tags';

    // Priority badge
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge-priority ${task.priority}`;
    priorityBadge.innerHTML = `<span style="font-size: 0.65rem;">●</span> ${capitalize(task.priority)}`;
    tagsRow.appendChild(priorityBadge);

    // Category badge
    if (task.category) {
      const catBadge = document.createElement('span');
      catBadge.className = 'badge-category';
      catBadge.textContent = task.category;
      tagsRow.appendChild(catBadge);
    }

    // Due Date badge
    if (task.dueDate) {
      const dueDateBadge = document.createElement('span');
      const dateStatus = getDueDateStatus(task.dueDate, task.completed);
      dueDateBadge.className = `badge-due-date ${dateStatus.className}`;
      dueDateBadge.innerHTML = `${dateStatus.icon} ${dateStatus.label}`;
      tagsRow.appendChild(dueDateBadge);
    }

    details.appendChild(tagsRow);

    // 3. Task Action Buttons (Edit & Delete)
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn btn-edit';
    editBtn.setAttribute('title', 'Edit Task');
    editBtn.setAttribute('aria-label', `Edit task "${task.title}"`);
    editBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    `;
    editBtn.addEventListener('click', () => openEditModal(task.id));

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn btn-delete';
    deleteBtn.setAttribute('title', 'Delete Task');
    deleteBtn.setAttribute('aria-label', `Delete task "${task.title}"`);
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    `;
    deleteBtn.addEventListener('click', () => promptDeleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkboxWrapper);
    li.appendChild(details);
    li.appendChild(actions);

    return li;
  }

  /* ==========================================================================
     9. MODAL HANDLERS
     ========================================================================== */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  /* ==========================================================================
     10. TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else if (type === 'danger') {
      iconSvg = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
    } else if (type === 'warning') {
      iconSvg = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `;
    } else {
      iconSvg = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-msg">${escapeHtml(message)}</div>
    `;

    elements.toastContainer.appendChild(toast);

    // Auto remove toast after 3.2 seconds
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /* ==========================================================================
     11. EVENT LISTENERS & SETUP
     ========================================================================== */
  function setupEventListeners() {
    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Quick add task submit
    elements.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask(
        elements.taskInput.value,
        elements.taskPriority.value,
        elements.taskCategory.value,
        elements.taskDueDate.value,
        elements.taskNotes.value
      );
    });

    // Expand / collapse notes textarea
    elements.toggleNotesBtn.addEventListener('click', () => {
      const isOpen = elements.notesContainer.classList.toggle('open');
      elements.toggleNotesBtn.textContent = isOpen ? '− Notes' : '+ Notes';
      if (isOpen) {
        elements.taskNotes.focus();
      }
    });

    // Search input
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (state.searchQuery.length > 0) {
        elements.searchClearBtn.classList.add('visible');
      } else {
        elements.searchClearBtn.classList.remove('visible');
      }
      render();
    });

    // Clear search button
    elements.searchClearBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      elements.searchClearBtn.classList.remove('visible');
      render();
      elements.searchInput.focus();
    });

    // Filter status tabs (All, Active, Completed)
    elements.filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        elements.filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        setFilter(tab.getAttribute('data-filter'));
      });
    });

    // Secondary filters & sorting dropdowns
    elements.priorityFilter.addEventListener('change', (e) => {
      state.priorityFilter = e.target.value;
      render();
    });

    elements.categoryFilter.addEventListener('change', (e) => {
      state.categoryFilter = e.target.value;
      render();
    });

    elements.sortBySelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      render();
    });

    // Bulk buttons
    elements.clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    elements.resetDemoBtn.addEventListener('click', resetSampleTasks);

    // Edit modal form submission
    elements.editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveEditedTask();
    });

    // Close edit modal
    elements.editModalCloseBtn.addEventListener('click', () => closeModal(elements.editModal));
    elements.editModalCancelBtn.addEventListener('click', () => closeModal(elements.editModal));

    // Delete confirm modal
    elements.confirmDeleteBtn.addEventListener('click', confirmDelete);
    elements.confirmModalCloseBtn.addEventListener('click', () => closeModal(elements.confirmModal));
    elements.confirmModalCancelBtn.addEventListener('click', () => closeModal(elements.confirmModal));

    // Close modals on clicking backdrop
    elements.editModal.addEventListener('click', (e) => {
      if (e.target === elements.editModal) closeModal(elements.editModal);
    });
    elements.confirmModal.addEventListener('click', (e) => {
      if (e.target === elements.confirmModal) closeModal(elements.confirmModal);
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Escape closes modals
      if (e.key === 'Escape') {
        if (elements.editModal.classList.contains('open')) closeModal(elements.editModal);
        if (elements.confirmModal.classList.contains('open')) closeModal(elements.confirmModal);
      }

      // Quick focus search with '/' when not typing in an input
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        elements.searchInput.focus();
      }
    });
  }

  function setFilter(filterType) {
    state.filter = filterType;
    elements.filterTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-filter') === filterType);
    });
    render();
  }

  /* ==========================================================================
     12. DATE & UTILITY HELPERS
     ========================================================================== */
  function updateDateDisplay() {
    if (!elements.currentDateDisplay) return;
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    elements.currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);
  }

  function getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getRelativeDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getDueDateStatus(dueDateStr, isCompleted) {
    if (isCompleted) {
      return {
        className: 'completed',
        label: formatDisplayDate(dueDateStr),
        icon: '✓',
      };
    }

    const todayStr = getTodayDateString();
    if (dueDateStr < todayStr) {
      return {
        className: 'overdue',
        label: `Overdue (${formatDisplayDate(dueDateStr)})`,
        icon: '⚠️',
      };
    } else if (dueDateStr === todayStr) {
      return {
        className: 'due-today',
        label: 'Due Today',
        icon: '⏰',
      };
    } else if (dueDateStr === getRelativeDate(1)) {
      return {
        className: 'due-soon',
        label: 'Due Tomorrow',
        icon: '📅',
      };
    } else {
      return {
        className: 'upcoming',
        label: formatDisplayDate(dueDateStr),
        icon: '📅',
      };
    }
  }

  function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Start the application once DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

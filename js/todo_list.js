// Initialize task data structure
let tasks = [];
let categories = [
    { id: 'work', name: 'العمل', color: 'blue-500' },
    { id: 'personal', name: 'شخصي', color: 'green-500' },
    { id: 'shopping', name: 'تسوق', color: 'amber-500' },
    { id: 'health', name: 'صحة', color: 'red-500' },
    { id: 'education', name: 'تعليم', color: 'purple-500' }
];

// App settings
let appSettings = {
    darkMode: false,
    showCompleted: true,
    dueDateAlerts: true,
    showProgress: true,
    taskViewStyle: 'detailed'
};

// Current state variables
let currentTaskId = null;
let currentCategoryId = null;
let isEditMode = false;
let currentConfirmationCallback = null;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference or use system preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
        appSettings.darkMode = true;
        
        // Update toggle display
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            const dot = toggle.querySelector('.toggle-dot');
            if (dot) dot.classList.add('translate-x-6');
        }
    }
    
    // Load saved data if available
    loadFromLocalStorage();
    
    // Initialize UI
    setupEventListeners();
    renderTasks();
    renderCategories();
    updateTaskCount();
    
    // Set current year in footer
    document.getElementById('footerYear').textContent = new Date().getFullYear();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
    
    // Initialize Sortable for task list
    initSortable();
    
    // Check for due tasks
    checkDueTasks();
});

// Initialize Sortable.js for drag and drop functionality
function initSortable() {
    const taskList = document.getElementById('mainTaskList');
    if (!taskList) return;
    
    // Check if we're in kanban view
    if (appSettings.taskViewStyle === 'kanban') {
        // Initialize Sortable for each kanban column
        setTimeout(() => {
            const kanbanColumns = document.querySelectorAll('.kanban-tasks');
            if (kanbanColumns.length > 0) {
                kanbanColumns.forEach(column => {
                    new Sortable(column, {
                        group: 'kanban-tasks',
                        animation: 150,
                        ghostClass: 'sortable-ghost',
                        chosenClass: 'sortable-chosen',
                        dragClass: 'sortable-drag',
                        onEnd: function(evt) {
                            const taskId = evt.item.dataset.taskId;
                            const newColumn = evt.to.dataset.column;
                            
                            const taskIndex = tasks.findIndex(t => t.id === taskId);
                            if (taskIndex !== -1) {
                                // Update task status based on new column
                                if (newColumn === 'completed') {
                                    tasks[taskIndex].completed = true;
                                    tasks[taskIndex].inProgress = false;
                                } else if (newColumn === 'inProgress') {
                                    tasks[taskIndex].completed = false;
                                    tasks[taskIndex].inProgress = true;
                                } else if (newColumn === 'todo') {
                                    tasks[taskIndex].completed = false;
                                    tasks[taskIndex].inProgress = false;
                                }
                                
                                // Save the updated status
                                saveToLocalStorage();
                                updateTaskCount();
                                updateKanbanColumnCounts();
                                
                                // Update visual appearance
                                const taskTitle = evt.item.querySelector('h4');
                                if (taskTitle) {
                                    if (newColumn === 'completed') {
                                        taskTitle.classList.add('line-through', 'text-gray-500', 'dark:text-gray-400');
                                    } else {
                                        taskTitle.classList.remove('line-through', 'text-gray-500', 'dark:text-gray-400');
                                    }
                                }
                            }
                        }
                    });
                });
            }
        }, 100);
    } else {
        // Standard list view sorting
        new Sortable(taskList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            handle: '.task-item',
            onEnd: function() {
                // Update tasks array order based on new DOM order
                const newOrder = Array.from(taskList.children)
                    .filter(item => item.dataset.taskId)
                    .map(item => item.dataset.taskId);
                
                if (newOrder.length > 0) {
                    tasks = newOrder.map(id => tasks.find(task => task.id === id)).filter(Boolean);
                    saveToLocalStorage();
                }
            }
        });
    }
}

// Setup event listeners for all interactive elements
function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and hide all contents
            tabButtons.forEach(btn => btn.classList.remove('active', 'opacity-100'));
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Add active class to clicked button and show corresponding content
            button.classList.add('active', 'opacity-100');
            document.getElementById(`${button.dataset.tab}-tab`).classList.remove('hidden');
        });
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeSwitchInput = document.getElementById('themeSwitch');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
    }
    
    if (themeSwitchInput) {
        themeSwitchInput.addEventListener('change', toggleDarkMode);
    }
    
    // Dark mode toggle in settings tab
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleDarkMode);
    }
    
    // Task actions
    setupTaskEventListeners();
    
    // Category actions
    setupCategoryEventListeners();
    
    // Confirmation modal
    setupConfirmationModal();
    
    // Data management
    setupDataManagementListeners();
    
    // Filters and search
    setupFilterListeners();
    
    // Settings changes
    setupSettingsListeners();
    
    // Global event handlers
    setupGlobalEventHandlers();
}

// Task-related event listeners
function setupTaskEventListeners() {
    // Add task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => openTaskModal());
    }
    
    // Task form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', saveTask);
    }
    
    // Close and cancel buttons
    const closeTaskModal = document.getElementById('closeTaskModal');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    
    if (closeTaskModal) {
        closeTaskModal.addEventListener('click', hideTaskModal);
    }
    
    if (cancelTaskBtn) {
        cancelTaskBtn.addEventListener('click', hideTaskModal);
    }
    
    // Delete task button
    const deleteTaskBtn = document.getElementById('deleteTaskBtn');
    if (deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', () => confirmDeleteTask());
    }
    
    // Add subtask button in modal
    const addSubtaskBtn = document.getElementById('addSubtaskBtn');
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', addSubtaskField);
    }
    
    // Task modal background click to close
    const taskModal = document.getElementById('taskModal');
    if (taskModal) {
        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) {
                hideTaskModal();
            }
        });
    }
}

// Category-related event listeners
function setupCategoryEventListeners() {
    // Add category button
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addNewCategory);
    }
    
    // Category form submission
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', saveCategory);
    }
    
    // Close and cancel buttons
    const closeCategoryModal = document.getElementById('closeCategoryModal');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    
    if (closeCategoryModal) {
        closeCategoryModal.addEventListener('click', hideCategoryModal);
    }
    
    if (cancelCategoryBtn) {
        cancelCategoryBtn.addEventListener('click', hideCategoryModal);
    }
    
    // Delete category button
    const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');
    if (deleteCategoryBtn) {
        deleteCategoryBtn.addEventListener('click', confirmDeleteCategory);
    }
    
    // Category color options
    document.querySelectorAll('.category-color-option').forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('categoryColor').value = button.dataset.color;
            
            // Remove selected class from all buttons
            document.querySelectorAll('.category-color-option').forEach(btn => {
                btn.classList.remove('ring-2', 'ring-offset-2');
            });
            
            // Add selected class to clicked button
            button.classList.add('ring-2', 'ring-offset-2');
        });
    });
    
    // Category modal background click to close
    const categoryModal = document.getElementById('categoryModal');
    if (categoryModal) {
        categoryModal.addEventListener('click', (e) => {
            if (e.target === categoryModal) {
                hideCategoryModal();
            }
        });
    }
}

// Confirmation modal event listeners
function setupConfirmationModal() {
    const confirmCancel = document.getElementById('confirmCancel');
    const confirmAction = document.getElementById('confirmAction');
    
    if (confirmCancel) {
        confirmCancel.addEventListener('click', closeConfirmationModal);
    }
    
    if (confirmAction) {
        confirmAction.addEventListener('click', executeConfirmationAction);
    }
    
    // Confirmation modal background click to close
    const confirmationModal = document.getElementById('confirmationModal');
    if (confirmationModal) {
        confirmationModal.addEventListener('click', (e) => {
            if (e.target === confirmationModal) {
                closeConfirmationModal();
            }
        });
    }
}

// Data management event listeners
function setupDataManagementListeners() {
    // Export tasks
    const exportTasksBtn = document.getElementById('exportTasksBtn');
    if (exportTasksBtn) {
        exportTasksBtn.addEventListener('click', exportTasks);
    }
    
    // Print tasks as PDF
    const printTasksBtn = document.getElementById('printTasksBtn');
    if (printTasksBtn) {
        printTasksBtn.addEventListener('click', printTasksAsPDF);
    }
    
    // Export all data
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAllData);
    }
    
    // Clear all data
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', confirmClearAllData);
    }
    
    // Note: Import-related event listeners are now handled by ImportManager
}



// Filter and search event listeners
function setupFilterListeners() {
    // Search input
    const searchTasks = document.getElementById('searchTasks');
    if (searchTasks) {
        searchTasks.addEventListener('input', filterTasks);
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterTasks);
    }
    
    // Priority filter
    const priorityFilter = document.getElementById('priorityFilter');
    if (priorityFilter) {
        priorityFilter.addEventListener('change', filterTasks);
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTasks);
    }
    
    // Sort tasks
    const sortTasks = document.getElementById('sortTasks');
    if (sortTasks) {
        sortTasks.addEventListener('change', filterTasks);
    }
}

// Settings event listeners
function setupSettingsListeners() {
    // Show completed toggle
    const showCompletedToggle = document.getElementById('showCompletedToggle');
    if (showCompletedToggle) {
        showCompletedToggle.addEventListener('change', updateSettings);
        showCompletedToggle.checked = appSettings.showCompleted;
    }
    
    // Due date alerts toggle
    const dueDateAlertsToggle = document.getElementById('dueDateAlertsToggle');
    if (dueDateAlertsToggle) {
        dueDateAlertsToggle.addEventListener('change', updateSettings);
        dueDateAlertsToggle.checked = appSettings.dueDateAlerts;
    }
    
    // Show progress toggle
    const showProgressToggle = document.getElementById('showProgressToggle');
    if (showProgressToggle) {
        showProgressToggle.addEventListener('change', updateSettings);
        showProgressToggle.checked = appSettings.showProgress;
    }
    
    // Task view style
    const taskViewStyle = document.getElementById('taskViewStyle');
    if (taskViewStyle) {
        taskViewStyle.addEventListener('change', updateTaskViewStyle);
        taskViewStyle.value = appSettings.taskViewStyle;
    }
}

// Global event handlers
function setupGlobalEventHandlers() {
    // Close task menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.task-menu-btn') && !e.target.closest('.task-dropdown-menu')) {
            document.querySelectorAll('.task-dropdown-menu').forEach(menu => menu.remove());
        }
    });
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Close modals on Escape key
        if (e.key === 'Escape') {
            hideTaskModal();
            hideCategoryModal();
            closeConfirmationModal();
            
            // Remove any open menus
            document.querySelectorAll('.task-dropdown-menu').forEach(menu => menu.remove());
        }
    });
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is today, tomorrow, or yesterday
    if (date.getTime() === today.getTime()) {
        return 'اليوم';
    } else if (date.getTime() === tomorrow.getTime()) {
        return 'غداً';
    } else if (date.getTime() === yesterday.getTime()) {
        return 'أمس';
    }
    
    // Calculate days difference
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
        if (diffDays <= 7) {
            return `بعد ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`;
        }
    } else if (diffDays < 0) {
        const absDiffDays = Math.abs(diffDays);
        if (absDiffDays <= 7) {
            return `قبل ${absDiffDays} ${absDiffDays === 1 ? 'يوم' : 'أيام'}`;
        }
    }
    
    // Format date as DD/MM/YYYY
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Calculate days until due date
function getDaysUntilDueDate(dateString) {
    if (!dateString) return null;
    
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate task progress based on subtasks
function calculateTaskProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return task.completed ? 100 : 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
}

// Render tasks with appropriate view
function renderTasks() {
    const taskList = document.getElementById('mainTaskList');
    const emptyState = document.getElementById('emptyTaskList');
    
    if (!taskList || !emptyState) return;
    
    // Clear existing tasks
    taskList.innerHTML = '';
    
    // Filter tasks based on current filters
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        // Show empty state
        taskList.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        // Hide empty state and show tasks
        taskList.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        // Render based on view style
        const viewStyle = appSettings.taskViewStyle || 'detailed';
        
        if (viewStyle === 'kanban') {
            renderKanbanView(taskList, filteredTasks);
        } else {
            renderListView(taskList, filteredTasks, viewStyle);
        }
    }
}

// Render tasks in kanban view
function renderKanbanView(taskList, filteredTasks) {
    taskList.className = 'grid grid-cols-1 md:grid-cols-3 gap-4';
    
    // Ensure inProgress property is set for all tasks
    filteredTasks.forEach(task => {
        if (task.inProgress === undefined) {
            task.inProgress = false;
        }
    });
    
    // Define columns
    const columns = [
        {
            key: 'todo',
            title: 'المهام الجديدة',
            tasks: filteredTasks.filter(task => !task.completed && !task.inProgress),
            color: 'gray'
        },
        {
            key: 'inProgress',
            title: 'قيد التنفيذ',
            tasks: filteredTasks.filter(task => !task.completed && task.inProgress),
            color: 'blue'
        },
        {
            key: 'completed',
            title: 'مكتملة',
            tasks: filteredTasks.filter(task => task.completed),
            color: 'green'
        }
    ];
    
    // Create columns
    columns.forEach(column => {
        const columnEl = document.createElement('div');
        columnEl.className = `kanban-column bg-${column.color}-50 dark:bg-${column.color}-900/20 rounded-lg p-4`;
        columnEl.id = `kanban-column-${column.key}`;
        
        // Column header with count
        const header = document.createElement('div');
        header.className = `text-${column.color}-700 dark:text-${column.color}-300 font-bold mb-4 pb-2 border-b border-${column.color}-200 dark:border-${column.color}-700 flex justify-between items-center`;
        header.innerHTML = `
            <span>${column.title}</span>
            <span class="text-sm bg-${column.color}-100 dark:bg-${column.color}-800 text-${column.color}-800 dark:text-${column.color}-200 py-1 px-2 rounded-full column-count">${column.tasks.length}</span>
        `;
        columnEl.appendChild(header);
        
        // Tasks container
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'space-y-3 min-h-[100px] kanban-tasks';
        tasksContainer.dataset.column = column.key;
        tasksContainer.id = `kanban-tasks-${column.key}`;
        
        // Add tasks to column
        column.tasks.forEach(task => {
            const taskElement = createKanbanTaskCard(task);
            tasksContainer.appendChild(taskElement);
        });
        
        columnEl.appendChild(tasksContainer);
        taskList.appendChild(columnEl);
    });
}

// Render tasks in list view
function renderListView(taskList, filteredTasks, viewStyle) {
    taskList.className = 'space-y-3';
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task, viewStyle);
        taskList.appendChild(taskElement);
    });
}

// Create a kanban task card
function createKanbanTaskCard(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item mb-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 priority-${task.priority}`;
    taskElement.dataset.taskId = task.id;
    
    // Get category
    const category = categories.find(cat => cat.id === task.category) || { name: '', color: 'gray-500' };
    
    // Calculate progress
    const progress = calculateTaskProgress(task);
    
    // Get due date info
    const dueText = task.dueDate ? formatDate(task.dueDate) : '';
    const daysUntilDue = getDaysUntilDueDate(task.dueDate);
    let dueDateClass = '';
    
    if (daysUntilDue !== null) {
        if (daysUntilDue < 0) {
            dueDateClass = 'text-red-500 dark:text-red-400';
        } else if (daysUntilDue === 0) {
            dueDateClass = 'text-orange-500 dark:text-orange-400';
        } else if (daysUntilDue <= 2) {
            dueDateClass = 'text-yellow-500 dark:text-yellow-400';
        }
    }
    
    // Create task content
    taskElement.innerHTML = `
        <div class="p-3">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                    <span class="text-xs bg-${category.color} bg-opacity-20 text-${category.color} py-1 px-2 rounded-full">${category.name}</span>
                </div>
                <div class="flex items-center space-x-2 space-x-reverse">
                    <div class="dropdown relative">
                        <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full task-menu-btn">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-2 ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}">${task.title}</h4>
            
            ${task.description ? `<p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">${task.description}</p>` : ''}
            
            <div class="flex items-center justify-between mt-2">
                ${task.dueDate ? `
                <span class="text-xs ${dueDateClass}">
                    <i class="far fa-clock ml-1"></i>${dueText}
                </span>` : 
                `<span class="text-xs text-gray-500 dark:text-gray-400">بدون تاريخ</span>`}
                
                ${task.subtasks && task.subtasks.length > 0 ? 
                `<span class="text-xs text-gray-500 dark:text-gray-400">
                    <i class="fas fa-tasks ml-1"></i>${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}
                </span>` : ''}
            </div>
            
            ${appSettings.showProgress && (task.subtasks && task.subtasks.length > 0) ? `
            <div class="mt-2">
                <div class="progress-bar h-1.5">
                    <div class="progress-value ${getProgressColorClass(progress)}" style="width: ${progress}%"></div>
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    // Add event listeners
    const menuBtn = taskElement.querySelector('.task-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showTaskMenu(e, task.id);
        });
    }
    
    // Add click to edit
    taskElement.addEventListener('click', (e) => {
        if (!e.target.closest('.task-menu-btn') && !e.target.closest('.task-dropdown-menu')) {
            openTaskModal(task.id);
        }
    });
    
    return taskElement;
}

// Create a task element for list view
function createTaskElement(task, viewStyle) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item mb-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 priority-${task.priority}`;
    taskElement.dataset.taskId = task.id;
    
    // Calculate progress
    const progress = calculateTaskProgress(task);
    
    // Get category
    const category = categories.find(cat => cat.id === task.category) || { name: '', color: 'gray-500' };
    
    // Get due date status
    const daysUntilDue = getDaysUntilDueDate(task.dueDate);
    let dueDateClass = '';
    let dueDateText = task.dueDate ? formatDate(task.dueDate) : '';
    
    if (daysUntilDue !== null) {
        if (daysUntilDue < 0) {
            dueDateClass = 'due-date-overdue';
        } else if (daysUntilDue === 0) {
            dueDateClass = 'due-date-today';
        } else if (daysUntilDue <= 2) {
            dueDateClass = 'due-date-soon';
        }
    }
    
    // Create task content based on view style
    if (viewStyle === 'compact') {
        // Compact view
        taskElement.innerHTML = `
            <div class="p-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input type="checkbox" class="task-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ml-3" ${task.completed ? 'checked' : ''}>
                        <h4 class="font-medium text-gray-800 dark:text-gray-200 ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}">${task.title}</h4>
                    </div>
                    <div class="flex items-center space-x-2 space-x-reverse">
                        ${task.dueDate ? `<span class="text-xs ${dueDateClass}"><i class="far fa-clock ml-1"></i>${dueDateText}</span>` : ''}
                        <span class="text-xs bg-${category.color} bg-opacity-20 text-${category.color} py-1 px-2 rounded-full">${category.name}</span>
                        <div class="dropdown relative">
                            <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full task-menu-btn">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Detailed view
        taskElement.innerHTML = `
            <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center">
                        <input type="checkbox" class="task-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ml-3" ${task.completed ? 'checked' : ''}>
                        <h4 class="font-bold text-gray-800 dark:text-gray-200 ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}">${task.title}</h4>
                    </div>
                    <div class="flex items-center space-x-2 space-x-reverse">
                        ${task.dueDate ? `<span class="text-sm ${dueDateClass}"><i class="far fa-clock ml-1"></i>${dueDateText}</span>` : ''}
                        <span class="text-xs bg-${category.color} bg-opacity-20 text-${category.color} py-1 px-2 rounded-full">${category.name}</span>
                        <div class="dropdown relative">
                            <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full task-menu-btn">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                ${task.description ? `<p class="text-gray-600 dark:text-gray-400 text-sm mb-3">${task.description}</p>` : ''}
                
                ${appSettings.showProgress ? `
                <div class="mb-3">
                    <div class="flex items-center justify-between text-xs mb-1">
                        <span class="text-gray-600 dark:text-gray-400">التقدم</span>
                        <span class="text-gray-600 dark:text-gray-400">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-value ${getProgressColorClass(progress)}" style="width: ${progress}%"></div>
                    </div>
                </div>
                ` : ''}
                
                ${task.subtasks && task.subtasks.length > 0 ? `
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-2">
                        <button class="text-sm text-emerald-600 dark:text-emerald-400 flex items-center subtasks-toggle">
                            <i class="fas fa-chevron-down ml-1"></i>
                            <span>المهام الفرعية (${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length})</span>
                        </button>
                        <button class="text-sm text-emerald-600 dark:text-emerald-400 add-subtask-btn" data-task-id="${task.id}">
                            <i class="fas fa-plus ml-1"></i>إضافة مهمة فرعية
                        </button>
                    </div>
                    
                    <div class="subtasks-list pl-6 border-r-2 border-gray-200 dark:border-gray-600">
                        ${task.subtasks.map(subtask => `
                        <div class="subtask-item py-2 flex items-center justify-between" data-subtask-id="${subtask.id}">
                            <div class="flex items-center">
                                <input type="checkbox" class="subtask-checkbox w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ml-2" ${subtask.completed ? 'checked' : ''}>
                                <span class="subtask-title text-sm text-gray-700 dark:text-gray-300 ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}">${subtask.title}</span>
                            </div>
                            <button class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 delete-subtask-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    // Add event listeners
    const checkbox = taskElement.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
    
    const menuBtn = taskElement.querySelector('.task-menu-btn');
    menuBtn.addEventListener('click', (e) => showTaskMenu(e, task.id));
    
    // Add subtask event listeners if they exist
    const subtasksToggle = taskElement.querySelector('.subtasks-toggle');
    if (subtasksToggle) {
        subtasksToggle.addEventListener('click', () => {
            const subtasksList = taskElement.querySelector('.subtasks-list');
            subtasksList.classList.toggle('hidden');
            
            const icon = subtasksToggle.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-left');
        });
    }
    
    const addSubtaskBtn = taskElement.querySelector('.add-subtask-btn');
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', () => {
            openTaskModal(task.id);
            setTimeout(() => {
                const newSubtaskInput = document.getElementById('newSubtaskTitle');
                if (newSubtaskInput) {
                    newSubtaskInput.focus();
                }
            }, 100);
        });
    }
    
    const subtaskCheckboxes = taskElement.querySelectorAll('.subtask-checkbox');
    subtaskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const subtaskItem = e.target.closest('.subtask-item');
            const subtaskId = subtaskItem.dataset.subtaskId;
            toggleSubtaskCompletion(task.id, subtaskId);
        });
    });
    
    const deleteSubtaskBtns = taskElement.querySelectorAll('.delete-subtask-btn');
    deleteSubtaskBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const subtaskItem = e.target.closest('.subtask-item');
            const subtaskId = subtaskItem.dataset.subtaskId;
            deleteSubtask(task.id, subtaskId);
        });
    });
    
    return taskElement;
}

// Get progress color class based on percentage
function getProgressColorClass(progress) {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 75) return 'bg-yellow-500';
    if (progress < 100) return 'bg-blue-500';
    return 'bg-green-500';
}

// Open task modal for adding or editing tasks
function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const deleteBtn = document.getElementById('deleteTaskBtn');
    const modalTitle = document.getElementById('taskModalTitle');
    const subtasksList = document.getElementById('subtasksList');
    
    // Reset form
    form.reset();
    subtasksList.innerHTML = '';
    
    if (taskId) {
        // Edit mode
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            currentTaskId = taskId;
            isEditMode = true;
            
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            
            // Add subtasks
            if (task.subtasks && task.subtasks.length > 0) {
                task.subtasks.forEach(subtask => {
                    addSubtaskToModal(subtask.id, subtask.title, subtask.completed);
                });
            }
            
            modalTitle.textContent = 'تعديل المهمة';
            deleteBtn.classList.remove('hidden');
        }
    } else {
        // Add mode
        currentTaskId = null;
        isEditMode = false;
        document.getElementById('taskId').value = '';
        modalTitle.textContent = 'إضافة مهمة جديدة';
        deleteBtn.classList.add('hidden');
    }
    
    // Show modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    // Focus on title input
    setTimeout(() => {
        document.getElementById('taskTitle').focus();
    }, 100);
}

// Hide task modal
function hideTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// Add a subtask field to the task modal
function addSubtaskField(e) {
    if (e) e.preventDefault();
    
    const newSubtaskTitle = document.getElementById('newSubtaskTitle');
    if (!newSubtaskTitle) return;
    
    const title = newSubtaskTitle.value.trim();
    if (title) {
        const subtaskId = generateId();
        addSubtaskToModal(subtaskId, title, false);
        newSubtaskTitle.value = '';
        newSubtaskTitle.focus();
    }
}

// Add a subtask to the modal
function addSubtaskToModal(id, title, completed) {
    const subtasksList = document.getElementById('subtasksList');
    if (!subtasksList) return;
    
    const subtaskItem = document.createElement('div');
    subtaskItem.className = 'subtask-item flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded mb-2';
    subtaskItem.dataset.subtaskId = id;
    
    subtaskItem.innerHTML = `
        <div class="flex items-center">
            <input type="checkbox" class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ml-2" ${completed ? 'checked' : ''}>
            <span class="text-gray-700 dark:text-gray-300">${title}</span>
            <input type="hidden" name="subtaskId" value="${id}">
            <input type="hidden" name="subtaskTitle" value="${title}">
            <input type="hidden" name="subtaskCompleted" value="${completed}">
        </div>
        <button type="button" class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 remove-subtask-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add event listener to remove button
    const removeBtn = subtaskItem.querySelector('.remove-subtask-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            subtaskItem.remove();
        });
    }
    
    subtasksList.appendChild(subtaskItem);
}

// Save task from the modal form
function saveTask(e) {
    e.preventDefault();
    
    const taskTitleInput = document.getElementById('taskTitle');
    if (!taskTitleInput || taskTitleInput.value.trim() === '') {
        alert('عنوان المهمة مطلوب');
        return false;
    }
    
    const taskId = document.getElementById('taskId').value || generateId();
    const title = taskTitleInput.value.trim();
    const description = document.getElementById('taskDescription').value || '';
    const category = document.getElementById('taskCategory').value || 'personal';
    const priority = document.getElementById('taskPriority').value || 'medium';
    const dueDate = document.getElementById('taskDueDate').value || '';
    
    // Collect subtasks
    const subtasks = [];
    const subtaskItems = document.querySelectorAll('.subtask-item');
    
    subtaskItems.forEach(item => {
        try {
            const id = item.dataset.subtaskId || generateId();
            const title = item.querySelector('input[name="subtaskTitle"]').value || 
                        item.querySelector('span').textContent;
            const completed = item.querySelector('input[type="checkbox"]').checked;
            
            if (title.trim()) {
                subtasks.push({
                    id,
                    title: title.trim(),
                    completed
                });
            }
        } catch (err) {
            console.error('Error processing subtask:', err);
        }
    });
    
    // Create task object
    const task = {
        id: taskId,
        title,
        description,
        category,
        priority,
        dueDate,
        subtasks,
        completed: false,
        updatedAt: new Date().toISOString()
    };
    
    // If editing, preserve completion status and creation date
    if (isEditMode) {
        const existingTask = tasks.find(t => t.id === taskId);
        if (existingTask) {
            task.completed = existingTask.completed;
            task.createdAt = existingTask.createdAt;
            task.inProgress = existingTask.inProgress;
        } else {
            task.createdAt = new Date().toISOString();
        }
    } else {
        task.createdAt = new Date().toISOString();
    }
    
    // Add or update task in the array
    const existingIndex = tasks.findIndex(t => t.id === taskId);
    if (existingIndex !== -1) {
        tasks[existingIndex] = task;
    } else {
        tasks.push(task);
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Close modal and refresh task list
    hideTaskModal();
    renderTasks();
    updateTaskCount();
    
    // If in kanban view, update column counts
    if (appSettings.taskViewStyle === 'kanban') {
        updateKanbanColumnCounts();
    }
    
    // Show saved message
    showSavedMessage();
    
    return false;
}

// Show task menu
function showTaskMenu(event, taskId) {
    event.stopPropagation();
    
    // Remove any existing menus
    const existingMenus = document.querySelectorAll('.task-dropdown-menu');
    existingMenus.forEach(menu => menu.remove());
    
    // Create menu
    const menuElement = document.createElement('div');
    menuElement.className = 'task-dropdown-menu absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10';
    menuElement.style.top = '100%';
    
    menuElement.innerHTML = `
        <button class="edit-task-btn block w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-edit ml-2"></i>تعديل المهمة
        </button>
        <button class="duplicate-task-btn block w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-copy ml-2"></i>نسخ المهمة
        </button>
        <button class="delete-task-btn block w-full text-right px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <i class="fas fa-trash-alt ml-2"></i>حذف المهمة
        </button>
    `;
    
    // Add to DOM
    const buttonContainer = event.target.closest('.dropdown');
    buttonContainer.appendChild(menuElement);
    
    // Add event listeners
    menuElement.querySelector('.edit-task-btn').addEventListener('click', () => {
        openTaskModal(taskId);
        menuElement.remove();
    });
    
    menuElement.querySelector('.duplicate-task-btn').addEventListener('click', () => {
        duplicateTask(taskId);
        menuElement.remove();
    });
    
    menuElement.querySelector('.delete-task-btn').addEventListener('click', () => {
        confirmDeleteTask(taskId);
        menuElement.remove();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!menuElement.contains(e.target) && !buttonContainer.contains(e.target)) {
            menuElement.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Toggle task completion status
function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        
        // If the task has subtasks
        if (tasks[taskIndex].subtasks) {
            if (tasks[taskIndex].completed) {
                // If task is marked as completed, mark all subtasks as completed
                tasks[taskIndex].subtasks.forEach(subtask => {
                    subtask.completed = true;
                });
            } else {
                // If task is marked as uncompleted, mark all subtasks as uncompleted
                tasks[taskIndex].subtasks.forEach(subtask => {
                    subtask.completed = false;
                });
            }
        }
        
        saveToLocalStorage();
        renderTasks();
        updateTaskCount();
        
        if (appSettings.taskViewStyle === 'kanban') {
            updateKanbanColumnCounts();
        }
    }
}


// Toggle subtask completion status
function toggleSubtaskCompletion(taskId, subtaskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1 && tasks[taskIndex].subtasks) {
        const subtaskIndex = tasks[taskIndex].subtasks.findIndex(subtask => subtask.id === subtaskId);
        if (subtaskIndex !== -1) {
            tasks[taskIndex].subtasks[subtaskIndex].completed = !tasks[taskIndex].subtasks[subtaskIndex].completed;
            
            // Update task completion status based on subtasks
            const allSubtasksCompleted = tasks[taskIndex].subtasks.every(subtask => subtask.completed);
            tasks[taskIndex].completed = allSubtasksCompleted;
            
            saveToLocalStorage();
            renderTasks();
            updateTaskCount();
        }
    }
}

// Delete a subtask
function deleteSubtask(taskId, subtaskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1 && tasks[taskIndex].subtasks) {
        tasks[taskIndex].subtasks = tasks[taskIndex].subtasks.filter(subtask => subtask.id !== subtaskId);
        
        // Update task completion status based on remaining subtasks
        if (tasks[taskIndex].subtasks.length > 0) {
            const allSubtasksCompleted = tasks[taskIndex].subtasks.every(subtask => subtask.completed);
            tasks[taskIndex].completed = allSubtasksCompleted;
        }
        
        saveToLocalStorage();
        renderTasks();
        updateTaskCount();
    }
}

// Confirm delete task
function confirmDeleteTask(taskId) {
    if (!taskId && currentTaskId) {
        taskId = currentTaskId;
    }
    
    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            openConfirmationModal(
                'تأكيد حذف المهمة',
                `هل أنت متأكد من رغبتك في حذف المهمة "${task.title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
                () => deleteTask(taskId)
            );
        }
    }
}

// Delete a task
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveToLocalStorage();
    hideTaskModal();
    renderTasks();
    updateTaskCount();
    showSavedMessage();
    
    if (appSettings.taskViewStyle === 'kanban') {
        updateKanbanColumnCounts();
    }
}

// Duplicate a task
function duplicateTask(taskId) {
    const originalTask = tasks.find(task => task.id === taskId);
    if (originalTask) {
        const newTask = { ...originalTask };
        newTask.id = generateId();
        newTask.title = `نسخة من ${originalTask.title}`;
        newTask.completed = false;
        newTask.createdAt = new Date().toISOString();
        newTask.updatedAt = new Date().toISOString();
        
        // Duplicate subtasks with new IDs
        if (newTask.subtasks && newTask.subtasks.length > 0) {
            newTask.subtasks = newTask.subtasks.map(subtask => ({
                ...subtask,
                id: generateId(),
                completed: false
            }));
        }
        
        tasks.push(newTask);
        saveToLocalStorage();
        renderTasks();
        updateTaskCount();
        showSavedMessage();
        
        if (appSettings.taskViewStyle === 'kanban') {
            updateKanbanColumnCounts();
        }
    }
}

// Update kanban column counts
function updateKanbanColumnCounts() {
    const todo = tasks.filter(task => !task.completed && !task.inProgress).length;
    const inProgress = tasks.filter(task => !task.completed && task.inProgress).length;
    const completed = tasks.filter(task => task.completed).length;
    
    const todoColumn = document.querySelector('#kanban-column-todo .column-count');
    const inProgressColumn = document.querySelector('#kanban-column-inProgress .column-count');
    const completedColumn = document.querySelector('#kanban-column-completed .column-count');
    
    if (todoColumn) todoColumn.textContent = todo;
    if (inProgressColumn) inProgressColumn.textContent = inProgress;
    if (completedColumn) completedColumn.textContent = completed;
}

// Show saved message
function showSavedMessage() {
    const savedMessage = document.getElementById('savedMessage');
    if (savedMessage) {
        savedMessage.classList.remove('hidden', 'fade-out');
        savedMessage.classList.add('block');
        
        setTimeout(() => {
            savedMessage.classList.add('fade-out');
            setTimeout(() => {
                savedMessage.classList.remove('block');
                savedMessage.classList.add('hidden');
            }, 2000);
        }, 100);
    }
}

// Render categories
function renderCategories() {
    const categoryList = document.getElementById('categoriesList');
    const categoryFilter = document.getElementById('categoryFilter');
    const taskCategory = document.getElementById('taskCategory');
    
    if (!categoryList) return;
    
    // Clear existing categories
    categoryList.innerHTML = '';
    
    // Reset category filter options (keeping the "All" option)
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="all">جميع التصنيفات</option>';
    }
    
    // Reset task category dropdown
    if (taskCategory) {
        taskCategory.innerHTML = '';
    }
    
    // Render each category
    categories.forEach(category => {
        // Add to category list
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer';
        categoryElement.dataset.categoryId = category.id;
        
        const taskCount = getCategoryTaskCount(category.id);
        
        categoryElement.innerHTML = `
            <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-${category.color} ml-3"></div>
                <span class="text-gray-700 dark:text-gray-300">${category.name}</span>
            </div>
            <div class="flex items-center">
                <span class="text-gray-500 dark:text-gray-400 text-sm ml-2">${taskCount} ${taskCount === 1 ? 'مهمة' : 'مهام'}</span>
                <button class="edit-category-btn text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 p-1">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        categoryElement.addEventListener('click', () => filterTasksByCategory(category.id));
        const editBtn = categoryElement.querySelector('.edit-category-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openCategoryModal(category.id);
            });
        }
        
        categoryList.appendChild(categoryElement);
        
        // Add to category filter
        if (categoryFilter) {
            const filterOption = document.createElement('option');
            filterOption.value = category.id;
            filterOption.textContent = category.name;
            categoryFilter.appendChild(filterOption);
        }
        
        // Add to task category dropdown
        if (taskCategory) {
            const categoryOption = document.createElement('option');
            categoryOption.value = category.id;
            categoryOption.textContent = category.name;
            taskCategory.appendChild(categoryOption);
        }
    });
}

// Get task count for a category
function getCategoryTaskCount(categoryId) {
    return tasks.filter(task => task.category === categoryId).length;
}

// Filter tasks by category
function filterTasksByCategory(categoryId) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = categoryId;
        filterTasks();
    }
}

// Add a new category
function addNewCategory() {
    openCategoryModal();
}

// Open category modal for adding or editing
function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const deleteBtn = document.getElementById('deleteCategoryBtn');
    const modalTitle = document.getElementById('categoryModalTitle');
    
    if (!modal || !form) return;
    
    // Reset form
    form.reset();
    
    // Reset color selection
    document.querySelectorAll('.category-color-option').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-offset-2');
    });
    
    if (categoryId) {
        // Edit mode
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            currentCategoryId = categoryId;
            isEditMode = true;
            
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryColor').value = category.color;
            
            // Highlight selected color
            const selectedColorBtn = document.querySelector(`.category-color-option[data-color="${category.color}"]`);
            if (selectedColorBtn) {
                selectedColorBtn.classList.add('ring-2', 'ring-offset-2');
            }
            
            modalTitle.textContent = 'تعديل التصنيف';
            deleteBtn.classList.remove('hidden');
        }
    } else {
        // Add mode
        currentCategoryId = null;
        isEditMode = false;
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryColor').value = 'emerald-500';
        
        // Set default color
        const defaultColorBtn = document.querySelector('.category-color-option[data-color="emerald-500"]');
        if (defaultColorBtn) {
            defaultColorBtn.classList.add('ring-2', 'ring-offset-2');
        }
        
        modalTitle.textContent = 'إضافة تصنيف جديد';
        deleteBtn.classList.add('hidden');
    }
    
    // Show modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

// Hide category modal
function hideCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// Save category from the modal form
function saveCategory(e) {
    e.preventDefault();
    
    const categoryNameInput = document.getElementById('categoryName');
    if (!categoryNameInput || categoryNameInput.value.trim() === '') {
        alert('اسم التصنيف مطلوب');
        return false;
    }
    
    const categoryId = document.getElementById('categoryId')?.value || generateId();
    const name = categoryNameInput.value.trim();
    const color = document.getElementById('categoryColor')?.value || 'emerald-500';
    
    // Create category object
    const category = {
        id: categoryId,
        name,
        color
    };
    
    // Add or update category in the array
    const existingIndex = categories.findIndex(c => c.id === categoryId);
    if (existingIndex !== -1) {
        categories[existingIndex] = category;
    } else {
        categories.push(category);
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Close modal and refresh categories
    hideCategoryModal();
    renderCategories();
    showSavedMessage();
    
    return false;
}

// Confirm delete category
function confirmDeleteCategory() {
    if (currentCategoryId) {
        const category = categories.find(c => c.id === currentCategoryId);
        if (category) {
            const taskCount = getCategoryTaskCount(currentCategoryId);
            
            let message = `هل أنت متأكد من رغبتك في حذف تصنيف "${category.name}"؟`;
            if (taskCount > 0) {
                message += ` هناك ${taskCount} ${taskCount === 1 ? 'مهمة' : 'مهام'} مرتبطة بهذا التصنيف.`;
            }
            
            openConfirmationModal(
                'تأكيد حذف التصنيف',
                message,
                () => deleteCategory(currentCategoryId)
            );
        }
    }
}

// Delete a category
function deleteCategory(categoryId) {
    // Check if it's one of the default categories
    if (['work', 'personal', 'shopping', 'health', 'education'].includes(categoryId)) {
        alert('لا يمكن حذف التصنيفات الافتراضية');
        return;
    }
    
    // Remove category
    categories = categories.filter(category => category.id !== categoryId);
    
    // Update tasks with this category to use 'personal' category
    tasks.forEach(task => {
        if (task.category === categoryId) {
            task.category = 'personal';
        }
    });
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Close modal and refresh UI
    hideCategoryModal();
    renderCategories();
    renderTasks();
    showSavedMessage();
}

// Open confirmation modal
function openConfirmationModal(title, message, confirmCallback) {
    const modal = document.getElementById('confirmationModal');
    const titleElement = document.getElementById('confirmationTitle');
    const messageElement = document.getElementById('confirmationMessage');
    const confirmButton = document.getElementById('confirmAction');
    
    if (!modal || !titleElement || !messageElement || !confirmButton) return;
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    currentConfirmationCallback = confirmCallback;
    
    // Update confirmation button text
    confirmButton.textContent = title.includes('حذف') ? 'تأكيد الحذف' : 'تأكيد';
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

// Close confirmation modal
function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
    currentConfirmationCallback = null;
}

// Execute confirmation action
function executeConfirmationAction() {
    if (currentConfirmationCallback) {
        currentConfirmationCallback();
    }
    closeConfirmationModal();
}

// Filter tasks based on search, category, priority, and status
function filterTasks() {
    renderTasks();
}

// Get filtered tasks based on current filters
function getFilteredTasks() {
    const searchInput = document.getElementById('searchTasks');
    const categoryFilter = document.getElementById('categoryFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const statusFilter = document.getElementById('statusFilter');
    const sortSelect = document.getElementById('sortTasks');
    
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const categoryValue = categoryFilter?.value || 'all';
    const priorityValue = priorityFilter?.value || 'all';
    const statusValue = statusFilter?.value || 'all';
    const sortBy = sortSelect?.value || 'dueDate';
    
    let filteredTasks = [...tasks];
    
    // Apply search filter
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) || 
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply category filter
    if (categoryValue !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === categoryValue);
    }
    
    // Apply priority filter
    if (priorityValue !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityValue);
    }
    
    // Apply status filter
    if (statusValue === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (statusValue === 'active' || statusValue === 'pending') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (statusValue === 'in-progress') {
        filteredTasks = filteredTasks.filter(task => !task.completed && task.inProgress);
    } else if (statusValue === 'due-today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        filteredTasks = filteredTasks.filter(task => {
            if (!task.dueDate) return false;
            
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            return dueDate.getTime() === today.getTime();
        });
    } else if (statusValue === 'overdue') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        filteredTasks = filteredTasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            return dueDate < today;
        });
    }
    
    // Apply sorting
    if (sortBy === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === 'dueDate') {
        filteredTasks.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    } else if (sortBy === 'title' || sortBy === 'alphabetical') {
        filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'createdAt') {
        filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'progress') {
        filteredTasks.sort((a, b) => calculateTaskProgress(b) - calculateTaskProgress(a));
    }
    
    // Hide completed tasks if setting is disabled
    if (!appSettings.showCompleted) {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    }
    
    return filteredTasks;
}

// Update task count in UI
function updateTaskCount() {
    const totalTaskCount = document.getElementById('totalTaskCount');
    const activeTaskCount = document.getElementById('activeTaskCount');
    const completedTaskCount = document.getElementById('completedTaskCount');
    const overallProgress = document.getElementById('overallProgress');
    const overallProgressText = document.getElementById('overallProgressText');
    
    if (!totalTaskCount || !activeTaskCount || !completedTaskCount) return;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    
    totalTaskCount.textContent = totalTasks;
    activeTaskCount.textContent = activeTasks;
    completedTaskCount.textContent = completedTasks;
    
    // Update progress bar
    if (overallProgress && overallProgressText) {
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        overallProgress.style.width = `${progressPercentage}%`;
        overallProgress.className = `progress-value ${getProgressColorClass(progressPercentage)} h-2.5 rounded-full transition-all duration-300`;
        overallProgressText.textContent = `${progressPercentage}%`;
    }
}

// Toggle dark mode
function toggleDarkMode() {
    // Toggle dark class on html element
    document.documentElement.classList.toggle('dark');
    
    // Toggle dark-mode class on body
    document.body.classList.toggle('dark-mode');
    
    // Update toggle dot position
    const toggleDot = document.querySelector('.toggle-dot');
    if (toggleDot) {
        toggleDot.classList.toggle('translate-x-6');
    }
    
    // Update settings
    appSettings.darkMode = document.documentElement.classList.contains('dark');
    
    // Sync settings toggles
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = appSettings.darkMode;
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme', appSettings.darkMode ? 'dark' : 'light');
    saveToLocalStorage();
}

// Update app settings
function updateSettings() {
    const showCompletedToggle = document.getElementById('showCompletedToggle');
    const dueDateAlertsToggle = document.getElementById('dueDateAlertsToggle');
    const showProgressToggle = document.getElementById('showProgressToggle');
    
    appSettings.showCompleted = showCompletedToggle?.checked || false;
    appSettings.dueDateAlerts = dueDateAlertsToggle?.checked || false;
    appSettings.showProgress = showProgressToggle?.checked || false;
    
    saveToLocalStorage();
    renderTasks();
    showSavedMessage();
}

// Update task view style
function updateTaskViewStyle() {
    const taskViewStyle = document.getElementById('taskViewStyle');
    if (!taskViewStyle) return;
    
    appSettings.taskViewStyle = taskViewStyle.value;
    saveToLocalStorage();
    
    // Re-render tasks with new view style
    renderTasks();
    
    // Re-initialize sortable
    setTimeout(() => {
        initSortable();
    }, 100);
    
    showSavedMessage();
}

// Export tasks as JSON file
function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'tasks.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import tasks from JSON file
function importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            
            // Validate imported data
            if (Array.isArray(importedTasks)) {
                // Confirm before importing
                openConfirmationModal(
                    'استيراد المهام',
                    `هل تريد استيراد ${importedTasks.length} مهمة؟ سيتم دمجها مع المهام الحالية.`,
                    () => {
                        // Merge with existing tasks, avoiding duplicates by ID
                        const existingIds = tasks.map(task => task.id);
                        const newTasks = importedTasks.filter(task => !existingIds.includes(task.id));
                        
                        tasks = [...tasks, ...newTasks];
                        saveToLocalStorage();
                        renderTasks();
                        updateTaskCount();
                        
                        alert(`تم استيراد ${newTasks.length} مهمة بنجاح.`);
                    }
                );
            } else {
                alert('الملف المستورد ليس بالتنسيق الصحيح.');
            }
        } catch (error) {
            alert('حدث خطأ أثناء استيراد الملف: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Export all data (tasks and categories)
function exportAllData() {
    const data = {
        tasks,
        categories,
        appSettings,
        version: '1.0.0',
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'todo_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import all data
function importAllData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate imported data
            if (importedData.tasks && importedData.categories) {
                openConfirmationModal(
                    'استيراد البيانات',
                    'هل تريد استبدال البيانات الحالية بالبيانات المستوردة؟',
                    () => {
                        // Replace all data
                        tasks = importedData.tasks;
                        categories = importedData.categories;
                        
                        // Update settings if they exist in the imported data
                        if (importedData.appSettings) {
                            appSettings = importedData.appSettings;
                            
                            // Update UI to match imported settings
                            const showCompletedToggle = document.getElementById('showCompletedToggle');
                            if (showCompletedToggle) {
                                showCompletedToggle.checked = appSettings.showCompleted;
                            }
                            
                            const dueDateAlertsToggle = document.getElementById('dueDateAlertsToggle');
                            if (dueDateAlertsToggle) {
                                dueDateAlertsToggle.checked = appSettings.dueDateAlerts;
                            }
                            
                            const showProgressToggle = document.getElementById('showProgressToggle');
                            if (showProgressToggle) {
                                showProgressToggle.checked = appSettings.showProgress;
                            }
                            
                            const taskViewStyle = document.getElementById('taskViewStyle');
                            if (taskViewStyle) {
                                taskViewStyle.value = appSettings.taskViewStyle;
                            }
                            
                            // Apply dark mode setting
                            if (appSettings.darkMode) {
                                document.documentElement.classList.add('dark');
                                document.body.classList.add('dark-mode');
                            } else {
                                document.documentElement.classList.remove('dark');
                                document.body.classList.remove('dark-mode');
                            }
                        }
                        
                        // Save to localStorage
                        saveToLocalStorage();
                        
                        // Update UI
                        renderTasks();
                        renderCategories();
                        updateTaskCount();
                        
                        alert('تم استيراد البيانات بنجاح.');
                    }
                );
            } else {
                alert('الملف المستورد ليس بالتنسيق الصحيح.');
            }
        } catch (error) {
            alert('حدث خطأ أثناء استيراد الملف: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Confirm clear all data
function confirmClearAllData() {
    openConfirmationModal(
        'مسح جميع البيانات',
        'هل أنت متأكد من رغبتك في مسح جميع المهام والتصنيفات؟ لا يمكن التراجع عن هذا الإجراء.',
        clearAllData
    );
}

// Clear all data
function clearAllData() {
    // Reset to default categories
    categories = [
        { id: 'work', name: 'العمل', color: 'blue-500' },
        { id: 'personal', name: 'شخصي', color: 'green-500' },
        { id: 'shopping', name: 'تسوق', color: 'amber-500' },
        { id: 'health', name: 'صحة', color: 'red-500' },
        { id: 'education', name: 'تعليم', color: 'purple-500' }
    ];
    
    // Clear tasks
    tasks = [];
    
    saveToLocalStorage();
    renderTasks();
    renderCategories();
    updateTaskCount();
    showSavedMessage();
}

// Print tasks as PDF
function printTasksAsPDF() {
    const filteredTasks = getFilteredTasks();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Create print HTML
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>قائمة المهام</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
                body {
                    font-family: 'Tajawal', sans-serif;
                    padding: 20px;
                    color: #333;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 20px;
                    color: #059669;
                }
                .task-list {
                    width: 100%;
                }
                .task-item {
                    padding: 10px;
                    border-bottom: 1px solid #e5e7eb;
                    margin-bottom: 10px;
                }
                .task-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .task-title {
                    font-weight: bold;
                    font-size: 16px;
                }
                .task-completed {
                    text-decoration: line-through;
                    color: #6b7280;
                }
                .task-meta {
                    display: flex;
                    gap: 10px;
                    font-size: 12px;
                    color: #6b7280;
                }
                .task-description {
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                .subtasks {
                    padding-right: 20px;
                    margin-top: 8px;
                    border-right: 2px solid #e5e7eb;
                }
                .subtask-item {
                    font-size: 13px;
                    margin-bottom: 4px;
                }
                .priority-high {
                    border-right: 4px solid #ef4444;
                }
                .priority-medium {
                    border-right: 4px solid #f59e0b;
                }
                .priority-low {
                    border-right: 4px solid #3b82f6;
                }
                .summary {
                    margin-bottom: 20px;
                    padding: 10px;
                    background-color: #f9fafb;
                    border-radius: 5px;
                }
                .print-date {
                    text-align: center;
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <h1>قائمة المهام</h1>
            
            <div class="summary">
                <p>إجمالي المهام: ${filteredTasks.length}</p>
                <p>المهام المكتملة: ${filteredTasks.filter(task => task.completed).length}</p>
                <p>المهام المتبقية: ${filteredTasks.filter(task => !task.completed).length}</p>
            </div>
            
            <div class="task-list">
                ${filteredTasks.map(task => {
                    const category = categories.find(cat => cat.id === task.category) || { name: '', color: 'gray-500' };
                    
                    return `
                        <div class="task-item priority-${task.priority}">
                            <div class="task-header">
                                <div class="task-title ${task.completed ? 'task-completed' : ''}">${task.title}</div>
                                <div class="task-meta">
                                    <span>${category.name}</span>
                                    ${task.dueDate ? `<span>تاريخ الاستحقاق: ${formatDate(task.dueDate)}</span>` : ''}
                                    <span>الأولوية: ${
                                        task.priority === 'high' ? 'عالية' : 
                                        task.priority === 'medium' ? 'متوسطة' : 'منخفضة'
                                    }</span>
                                </div>
                            </div>
                            
                            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                            
                            ${task.subtasks && task.subtasks.length > 0 ? `
                                <div class="subtasks">
                                    ${task.subtasks.map(subtask => `
                                        <div class="subtask-item ${subtask.completed ? 'task-completed' : ''}">
                                            ${subtask.title}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="print-date">
                تم إنشاء هذا التقرير في ${new Date().toLocaleString('ar-SA')}
            </div>
        </body>
        </html>
    `);
    
    // Trigger print dialog
    printWindow.document.close();
    printWindow.focus();
    
    // Give a moment for styles to load
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
    localStorage.setItem('todoCategories', JSON.stringify(categories));
    localStorage.setItem('todoSettings', JSON.stringify(appSettings));
}

// Load data from localStorage
function loadFromLocalStorage() {
    const savedTasks = localStorage.getItem('todoTasks');
    const savedCategories = localStorage.getItem('todoCategories');
    const savedSettings = localStorage.getItem('todoSettings');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    }
    
    if (savedSettings) {
        appSettings = JSON.parse(savedSettings);
        
        // Update UI to match saved settings
        const showCompletedToggle = document.getElementById('showCompletedToggle');
        if (showCompletedToggle) {
            showCompletedToggle.checked = appSettings.showCompleted;
        }
        
        const dueDateAlertsToggle = document.getElementById('dueDateAlertsToggle');
        if (dueDateAlertsToggle) {
            dueDateAlertsToggle.checked = appSettings.dueDateAlerts;
        }
        
        const showProgressToggle = document.getElementById('showProgressToggle');
        if (showProgressToggle) {
            showProgressToggle.checked = appSettings.showProgress;
        }
        
        const taskViewStyle = document.getElementById('taskViewStyle');
        if (taskViewStyle) {
            taskViewStyle.value = appSettings.taskViewStyle;
        }
    }
}

// Initialize Sortable.js for drag and drop functionality
function initSortable() {
    const taskList = document.getElementById('mainTaskList');
    if (!taskList) return;
    
    // Check if we're in kanban view
    if (appSettings.taskViewStyle === 'kanban') {
        // Initialize Sortable for each kanban column
        const columns = taskList.querySelectorAll('[data-column]');
        columns.forEach(column => {
            new Sortable(column, {
                group: 'tasks',
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                onEnd: function(evt) {
                    // Get the column this item was dropped into
                    const toColumn = evt.to.dataset.column;
                    const taskId = evt.item.dataset.taskId;
                    
                    // Update task status based on the column
                    const taskIndex = tasks.findIndex(task => task.id === taskId);
                    if (taskIndex !== -1) {
                        if (toColumn === 'completed') {
                            tasks[taskIndex].completed = true;
                            tasks[taskIndex].inProgress = false;
                        } else if (toColumn === 'inProgress') {
                            tasks[taskIndex].completed = false;
                            tasks[taskIndex].inProgress = true;
                        } else if (toColumn === 'todo') {
                            tasks[taskIndex].completed = false;
                            tasks[taskIndex].inProgress = false;
                        }
                        
                        // Update storage
                        saveToLocalStorage();
                        
                        // Update UI
                        updateTaskCount();
                        updateKanbanColumnCounts();
                        
                        // Update the task appearance to match its new status
                        const taskElement = evt.item;
                        if (toColumn === 'completed') {
                            taskElement.querySelector('h4').classList.add('line-through', 'text-gray-500', 'dark:text-gray-400');
                        } else {
                            taskElement.querySelector('h4').classList.remove('line-through', 'text-gray-500', 'dark:text-gray-400');
                        }
                    }
                }
            });
        });
    } else {
        // Standard list view sorting
        new Sortable(taskList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            handle: '.task-item',
            onEnd: function() {
                // Update tasks array order based on new DOM order
                const newOrder = Array.from(taskList.children).map(item => item.dataset.taskId);
                tasks = newOrder.map(id => tasks.find(task => task.id === id)).filter(Boolean);
                saveToLocalStorage();
            }
        });
    }
}

// Check for due tasks and show notifications
function checkDueTasks() {
    if (!appSettings.dueDateAlerts) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueTasks = tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // Due today or overdue
        return dueDate <= today;
    });
    
    if (dueTasks.length > 0) {
        const overdueTasks = dueTasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
        });
        
        const todayTasks = dueTasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
        });
        
        let message = '';
        
        if (overdueTasks.length > 0) {
            message += `لديك ${overdueTasks.length} ${overdueTasks.length === 1 ? 'مهمة متأخرة' : 'مهام متأخرة'}\n`;
        }
        
        if (todayTasks.length > 0) {
            message += `لديك ${todayTasks.length} ${todayTasks.length === 1 ? 'مهمة تستحق اليوم' : 'مهام تستحق اليوم'}`;
        }
        
        if (message) {
            alert(`تنبيه المهام المستحقة!\n${message}`);
        }
    }
}

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Close modals on Escape key
        if (e.key === 'Escape') {
            hideTaskModal();
            hideCategoryModal();
            closeConfirmationModal();
            
            // Remove any open menus
            const menus = document.querySelectorAll('.task-dropdown-menu');
            menus.forEach(menu => menu.remove());
        }
    });
}

// Initialize global event handlers
function initializeGlobalEventHandlers() {
    // Close any open task menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.task-menu-btn') && !e.target.closest('.task-dropdown-menu')) {
            document.querySelectorAll('.task-dropdown-menu').forEach(menu => menu.remove());
        }
    });
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference or use system preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
        appSettings.darkMode = true;
        
        // Update toggle display
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            const dot = toggle.querySelector('.toggle-dot');
            if (dot) dot.classList.add('translate-x-6');
        }
    }
    
    // Load saved data if available
    loadFromLocalStorage();
    
    // Initialize UI
    setupEventListeners();
    renderTasks();
    renderCategories();
    updateTaskCount();
    initializeGlobalEventHandlers();
    
    // Set current year in footer
    document.getElementById('footerYear').textContent = new Date().getFullYear();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
    
    // Initialize Sortable for task list
    initSortable();
    
    // Check for due tasks
    checkDueTasks();
    
    // Initialize emergency subtask fix
    setTimeout(() => {
        if (typeof SubtaskEmergencyFix !== 'undefined') {
            SubtaskEmergencyFix.init();
        }
    }, 1000);

    ImportManager.init();
});

// SubtaskEmergencyFix namespace
const SubtaskEmergencyFix = {
    // Track subtasks for the current task
    currentSubtasks: [],
    
    // Initialize the fix
    init: function() {
        console.log("Initializing subtask fix");
        
        // Replace the Add Task button behavior
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.onclick = this.openTaskForm.bind(this);
        }
        
        // Replace task form submission
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.onsubmit = this.saveTaskWithSubtasks.bind(this);
        }
        
        // Handle subtask additions
        const addSubtaskBtn = document.getElementById('addSubtaskBtn');
        if (addSubtaskBtn) {
            addSubtaskBtn.onclick = this.addNewSubtask.bind(this);
        }
        
        // Wire up close buttons
        document.getElementById('closeTaskModal')?.addEventListener('click', this.closeModal.bind(this));
        document.getElementById('cancelTaskBtn')?.addEventListener('click', this.closeModal.bind(this));
        
        // Handle edit buttons via delegation
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-task-btn');
            if (editBtn) {
                const taskId = editBtn.closest('.task-item')?.dataset.taskId;
                if (taskId) this.openTaskForm(null, taskId);
            }
        });
    },
    
    // Open task form
    openTaskForm: function(e, taskId = null) {
        if (e) e.preventDefault();
        
        // Reset state
        this.currentSubtasks = [];
        
        // Reset form
        const form = document.getElementById('taskForm');
        form?.reset();
        
        // Clear subtasks UI
        const subtasksList = document.getElementById('subtasksList');
        if (subtasksList) subtasksList.innerHTML = '';
        
        // Setup for add or edit
        if (taskId) {
            // EDIT MODE
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;
            
            // Set form fields
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title || '';
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskCategory').value = task.category || 'personal';
            document.getElementById('taskPriority').value = task.priority || 'medium';
            document.getElementById('taskDueDate').value = task.dueDate || '';
            
            // Store and render subtasks
            if (task.subtasks && Array.isArray(task.subtasks)) {
                this.currentSubtasks = [...task.subtasks];
                this.renderSubtasks();
            }
            
            // Update UI
            document.getElementById('taskModalTitle').textContent = 'تعديل المهمة';
            document.getElementById('deleteTaskBtn').classList.remove('hidden');
        } else {
            // ADD MODE
            document.getElementById('taskId').value = '';
            document.getElementById('taskModalTitle').textContent = 'إضافة مهمة جديدة';
            document.getElementById('deleteTaskBtn').classList.add('hidden');
        }
        
        // Show modal
        const modal = document.getElementById('taskModal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    },
    
    // Add new subtask
    addNewSubtask: function(e) {
        if (e) e.preventDefault();
        
        const input = document.getElementById('newSubtaskTitle');
        if (!input) return;
        
        const title = input.value.trim();
        if (!title) return;
        
        // Add to our array
        this.currentSubtasks.push({
            id: generateId(),
            title: title,
            completed: false
        });
        
        // Update UI
        this.renderSubtasks();
        
        // Clear input
        input.value = '';
        input.focus();
    },
    
    // Render subtasks
    renderSubtasks: function() {
        const container = document.getElementById('subtasksList');
        if (!container) return;
        
        // Clear existing
        container.innerHTML = '';
        
        // Add each subtask
        this.currentSubtasks.forEach((subtask, index) => {
            const el = document.createElement('div');
            el.className = 'subtask-item flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded mb-2';
            el.dataset.index = index;
            
            el.innerHTML = `
                <div class="flex items-center">
                    <input type="checkbox" class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ml-2" 
                        ${subtask.completed ? 'checked' : ''}>
                    <span class="subtask-title text-sm ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}">${subtask.title}</span>
                </div>
                <button type="button" class="delete-subtask-btn text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add delete handler
            el.querySelector('.delete-subtask-btn').onclick = () => {
                this.currentSubtasks.splice(index, 1);
                this.renderSubtasks();
            };
            
            // Add checkbox handler
            el.querySelector('input[type="checkbox"]').onchange = (e) => {
                this.currentSubtasks[index].completed = e.target.checked;
                
                // Apply strikethrough immediately
                const titleSpan = el.querySelector('.subtask-title');
                if (e.target.checked) {
                    titleSpan.classList.add('line-through', 'text-gray-500', 'dark:text-gray-400');
                    titleSpan.classList.remove('text-gray-700', 'dark:text-gray-300');
                } else {
                    titleSpan.classList.remove('line-through', 'text-gray-500', 'dark:text-gray-400');
                    titleSpan.classList.add('text-gray-700', 'dark:text-gray-300');
                }
            };
            
            container.appendChild(el);
        });
    },
    
    // Save the task with subtasks
    saveTaskWithSubtasks: function(e) {
        if (e) e.preventDefault();
        
        try {
            // Get basic task info
            const taskId = document.getElementById('taskId').value || generateId();
            const title = document.getElementById('taskTitle').value.trim();
            
            if (!title) {
                alert('عنوان المهمة مطلوب');
                return false;
            }
            
            // Create task object
            const task = {
                id: taskId,
                title: title,
                description: document.getElementById('taskDescription').value,
                category: document.getElementById('taskCategory').value,
                priority: document.getElementById('taskPriority').value,
                dueDate: document.getElementById('taskDueDate').value,
                subtasks: [...this.currentSubtasks],
                updatedAt: new Date().toISOString()
            };
            
            // If editing, preserve original creation date and completion status
            if (document.getElementById('taskId').value) {
                const existingTask = tasks.find(t => t.id === taskId);
                if (existingTask) {
                    task.createdAt = existingTask.createdAt;
                    task.completed = existingTask.completed;
                    task.inProgress = existingTask.inProgress;
                } else {
                    task.createdAt = new Date().toISOString();
                    task.completed = false;
                    task.inProgress = false;
                }
            } else {
                task.createdAt = new Date().toISOString();
                task.completed = false;
                task.inProgress = false;
            }
            
            // Save to tasks array
            const existingIndex = tasks.findIndex(t => t.id === taskId);
            if (existingIndex !== -1) {
                tasks[existingIndex] = task;
            } else {
                tasks.push(task);
            }
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Close modal and update UI
            this.closeModal();
            renderTasks();
            updateTaskCount();
            showSavedMessage();
        } catch (err) {
            console.error("Error saving task:", err);
            alert("حدث خطأ أثناء حفظ المهمة");
        }
        
        return false;
    },
    
    // Close the modal
    closeModal: function() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }
};




// Create a dedicated import manager to handle all imports
const ImportManager = {
    // Initialize the import manager
    init: function() {
        console.log("Initializing import manager");
        this.setupEventListeners();
    },
    
    // Set up all import-related event listeners
    setupEventListeners: function() {
        // Remove any existing event listeners first (important!)
        const importFileInput = document.getElementById('importFileInput');
        const importTasksBtn = document.getElementById('importTasksBtn');
        const importDataBtn = document.getElementById('importDataBtn');
        
        if (importFileInput) {
            // Clone and replace the file input to remove all event listeners
            const newInput = importFileInput.cloneNode(true);
            importFileInput.parentNode.replaceChild(newInput, importFileInput);
            
            // Add our single event listener to the new input
            newInput.addEventListener('change', this.handleImportFileSelected.bind(this));
        }
        
        if (importTasksBtn) {
            // Clone and replace to remove existing listeners
            const newTasksBtn = importTasksBtn.cloneNode(true);
            importTasksBtn.parentNode.replaceChild(newTasksBtn, importTasksBtn);
            
            // Add our single event listener
            newTasksBtn.addEventListener('click', () => this.startImport('tasks'));
        }
        
        if (importDataBtn) {
            // Clone and replace to remove existing listeners
            const newDataBtn = importDataBtn.cloneNode(true);
            importDataBtn.parentNode.replaceChild(newDataBtn, importDataBtn);
            
            // Add our single event listener
            newDataBtn.addEventListener('click', () => this.startImport('all'));
        }
    },
    
    // Start import process
    startImport: function(type) {
        console.log(`Starting import of type: ${type}`);
        const importFileInput = document.getElementById('importFileInput');
        if (!importFileInput) return;
        
        // Store the import type in a data attribute
        importFileInput.dataset.importType = type;
        
        // Clear any previous selection and trigger the file dialog
        importFileInput.value = '';
        importFileInput.click();
    },
    
    // Handle the selected file
    handleImportFileSelected: function(event) {
        const importFileInput = event.target;
        const file = importFileInput.files[0];
        if (!file) return;
        
        // Get the import type from the data attribute
        const importType = importFileInput.dataset.importType || 'all';
        console.log(`File selected for import type: ${importType}`);
        
        // Process the file based on the import type
        if (importType === 'tasks') {
            this.importTasks(file);
        } else {
            this.importAllData(file);
        }
        
        // Clear the file input value
        importFileInput.value = '';
    },
    
    // Import just tasks
    importTasks: function(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedTasks = JSON.parse(e.target.result);
                
                // Validate imported data
                if (Array.isArray(importedTasks)) {
                    // Confirm before importing
                    openConfirmationModal(
                        'استيراد المهام',
                        `هل تريد استيراد ${importedTasks.length} مهمة؟ سيتم دمجها مع المهام الحالية.`,
                        () => {
                            // Merge with existing tasks, avoiding duplicates by ID
                            const existingIds = tasks.map(task => task.id);
                            const newTasks = importedTasks.filter(task => !existingIds.includes(task.id));
                            
                            tasks = [...tasks, ...newTasks];
                            saveToLocalStorage();
                            renderTasks();
                            updateTaskCount();
                            
                            alert(`تم استيراد ${newTasks.length} مهمة بنجاح.`);
                        }
                    );
                } else {
                    alert('الملف المستورد ليس بالتنسيق الصحيح.');
                }
            } catch (error) {
                alert('حدث خطأ أثناء استيراد الملف: ' + error.message);
            }
        };
        reader.readAsText(file);
    },
    
    // Import all data
    importAllData: function(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate imported data
                if (importedData.tasks && importedData.categories) {
                    openConfirmationModal(
                        'استيراد البيانات',
                        'هل تريد استبدال البيانات الحالية بالبيانات المستوردة؟',
                        () => {
                            // Replace all data
                            tasks = importedData.tasks;
                            categories = importedData.categories;
                            
                            // Update settings if they exist in the imported data
                            if (importedData.appSettings) {
                                appSettings = importedData.appSettings;
                                
                                // Update UI to match imported settings
                                updateSettingsUI(appSettings);
                            }
                            
                            // Save to localStorage
                            saveToLocalStorage();
                            
                            // Update UI
                            renderTasks();
                            renderCategories();
                            updateTaskCount();
                            
                            alert('تم استيراد البيانات بنجاح.');
                        }
                    );
                } else {
                    alert('الملف المستورد ليس بالتنسيق الصحيح.');
                }
            } catch (error) {
                alert('حدث خطأ أثناء استيراد الملف: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
};

// Helper function to update settings UI
function updateSettingsUI(settings) {
    const showCompletedToggle = document.getElementById('showCompletedToggle');
    if (showCompletedToggle) {
        showCompletedToggle.checked = settings.showCompleted;
    }
    
    const dueDateAlertsToggle = document.getElementById('dueDateAlertsToggle');
    if (dueDateAlertsToggle) {
        dueDateAlertsToggle.checked = settings.dueDateAlerts;
    }
    
    const showProgressToggle = document.getElementById('showProgressToggle');
    if (showProgressToggle) {
        showProgressToggle.checked = settings.showProgress;
    }
    
    const taskViewStyle = document.getElementById('taskViewStyle');
    if (taskViewStyle) {
        taskViewStyle.value = settings.taskViewStyle;
    }
    
    // Apply dark mode setting
    if (settings.darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark-mode');
    }
}

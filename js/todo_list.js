/**
 * Interactive To-Do List Application
 * 
 * A comprehensive task management application with categories, priorities,
 * and drag-and-drop functionality.
 */

const App = {
    // Application state
    tasks: [],
    categories: [],
    settings: {
        showCompleted: true,
        dueDateAlerts: true,
        showProgress: true,
        taskViewStyle: 'detailed'
    },
    currentTaskId: null,
    currentCategoryId: null,
    sortableTaskList: null,
    sortableCategories: null,
    confirmationCallback: null,
    
    /**
     * Initialize the application
     */
    initialize: function() {
        // Load data from local storage
        this.loadFromLocalStorage();
        
        // Setup UI
        this.setupTaskSortable();
        this.populateCategoryDropdowns();
        this.renderTasks();
        this.renderCategories();
        this.updateTaskCounts();
        this.updateOverallProgress();
        this.loadSettings();
        
        // Set footer year
        document.getElementById('footerYear').textContent = new Date().getFullYear();
        
        // Set last updated date
        document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString('ar-SA');
    },
    
    /**
     * Load data from local storage
     */
    loadFromLocalStorage: function() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        } else {
            // Add default category if no categories exist
            this.categories = [
                { id: this.generateId(), name: 'عام', color: 'gray-500' }
            ];
            this.saveToLocalStorage();
        }
        
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    },
    
    /**
     * Save data to local storage
     */
    saveToLocalStorage: function() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('categories', JSON.stringify(this.categories));
        localStorage.setItem('settings', JSON.stringify(this.settings));
        
        // Show saved message
        const savedMessage = document.getElementById('savedMessage');
        savedMessage.classList.remove('hidden');
        savedMessage.classList.add('fade-out');
        
        setTimeout(() => {
            savedMessage.classList.add('hidden');
            savedMessage.classList.remove('fade-out');
        }, 2000);
    },
    
    /**
     * Generate a unique ID
     */
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    /**
     * Set up sortable for task list
     */
    setupTaskSortable: function() {
        const taskList = document.getElementById('mainTaskList');
        
        this.sortableTaskList = new Sortable(taskList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: (evt) => {
                this.reorderTasks(evt);
            }
        });
    },
    
    /**
     * Reorder tasks after drag and drop
     */
    reorderTasks: function(evt) {
        const taskId = evt.item.getAttribute('data-task-id');
        const newIndex = evt.newIndex;
        
        // Find the task in the array
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        // Remove the task from its current position
        const [task] = this.tasks.splice(taskIndex, 1);
        
        // Insert it at the new position
        this.tasks.splice(newIndex, 0, task);
        
        // Save to local storage
        this.saveToLocalStorage();
    },
    
    /**
     * Switch between tabs
     */
    switchTab: function(tabBtn) {
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.opacity = '0.8';
        });
        
        // Add active class to the clicked tab button
        tabBtn.classList.add('active');
        tabBtn.style.opacity = '1';
        
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Show the selected tab content
        const tabId = tabBtn.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    },
    
    /**
     * Populate category dropdowns
     */
    populateCategoryDropdowns: function() {
        const taskCategorySelect = document.getElementById('taskCategory');
        const categoryFilterSelect = document.getElementById('categoryFilter');
        
        // Clear existing options except the "All Categories" option in filter
        taskCategorySelect.innerHTML = '';
        
        // Keep only the first option in category filter (All Categories)
        categoryFilterSelect.innerHTML = '<option value="all">جميع التصنيفات</option>';
        
        // Add categories to both dropdowns
        this.categories.forEach(category => {
            const taskOption = document.createElement('option');
            taskOption.value = category.id;
            taskOption.textContent = category.name;
            taskCategorySelect.appendChild(taskOption);
            
            const filterOption = document.createElement('option');
            filterOption.value = category.id;
            filterOption.textContent = category.name;
            categoryFilterSelect.appendChild(filterOption);
        });
    },
    
    /**
     * Render tasks
     */
    renderTasks: function() {
        const taskList = document.getElementById('mainTaskList');
        const emptyTaskList = document.getElementById('emptyTaskList');
        
        // Clear existing tasks
        taskList.innerHTML = '';
        
        // Filter tasks based on current filters
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            taskList.classList.add('hidden');
            emptyTaskList.classList.remove('hidden');
            return;
        }
        
        taskList.classList.remove('hidden');
        emptyTaskList.classList.add('hidden');
        
        // Get view style from settings
        const viewStyle = this.settings.taskViewStyle || 'detailed';
        
        // Render each task based on view style
        filteredTasks.forEach(task => {
            if (viewStyle === 'detailed') {
                taskList.appendChild(this.createDetailedTaskElement(task));
            } else if (viewStyle === 'compact') {
                taskList.appendChild(this.createCompactTaskElement(task));
            } else if (viewStyle === 'kanban') {
                // Kanban view is handled differently
                // For simplicity, we'll use detailed view here
                taskList.appendChild(this.createDetailedTaskElement(task));
            }
        });
    },
    
    /**
     * Get filtered tasks based on current filters
     */
    getFilteredTasks: function() {
        let filteredTasks = [...this.tasks];
        
        // Get filter values
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const searchText = document.getElementById('searchTasks').value.toLowerCase();
        
        // Apply category filter
        if (categoryFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.categoryId === categoryFilter);
        }
        
        // Apply priority filter
        if (priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            switch (statusFilter) {
                case 'active':
                    filteredTasks = filteredTasks.filter(task => !task.completed);
                    break;
                case 'completed':
                    filteredTasks = filteredTasks.filter(task => task.completed);
                    break;
                case 'in-progress':
                    filteredTasks = filteredTasks.filter(task => 
                        !task.completed && 
                        task.subtasks && 
                        task.subtasks.some(subtask => subtask.completed)
                    );
                    break;
                case 'due-today':
                    filteredTasks = filteredTasks.filter(task => {
                        if (!task.dueDate || task.completed) return false;
                        const dueDate = new Date(task.dueDate);
                        dueDate.setHours(0, 0, 0, 0);
                        return dueDate.getTime() === today.getTime();
                    });
                    break;
                case 'overdue':
                    filteredTasks = filteredTasks.filter(task => {
                        if (!task.dueDate || task.completed) return false;
                        const dueDate = new Date(task.dueDate);
                        dueDate.setHours(0, 0, 0, 0);
                        return dueDate < today;
                    });
                    break;
            }
        }
        
        // Apply search filter
        if (searchText) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchText) || 
                (task.description && task.description.toLowerCase().includes(searchText))
            );
        }
        
        // Hide completed tasks if setting is disabled
        if (!this.settings.showCompleted) {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        }
        
        // Apply sorting
        const sortBy = document.getElementById('sortTasks').value;
        
        switch (sortBy) {
            case 'dueDate':
                filteredTasks.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'priority':
                const priorityValues = { high: 1, medium: 2, low: 3 };
                filteredTasks.sort((a, b) => priorityValues[a.priority] - priorityValues[b.priority]);
                break;
            case 'title':
                filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'createdAt':
                filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'progress':
                filteredTasks.sort((a, b) => this.calculateTaskProgress(b) - this.calculateTaskProgress(a));
                break;
        }
        
        return filteredTasks;
    },
    
    /**
     * Create a detailed task element
     */
    createDetailedTaskElement: function(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item bg-white rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${task.completed ? 'opacity-75' : ''}`;
        taskElement.setAttribute('data-task-id', task.id);
        
        // Add priority class
        taskElement.classList.add(`priority-${task.priority}`);
        
        // Find task category
        const category = this.categories.find(cat => cat.id === task.categoryId) || { name: 'عام', color: 'gray-500' };
        
        // Calculate progress for tasks with subtasks
        let progressHtml = '';
        if (task.subtasks && task.subtasks.length > 0 && this.settings.showProgress) {
            const progress = this.calculateTaskProgress(task);
            progressHtml = `
                <div class="mt-3">
                    <div class="flex justify-between text-xs mb-1">
                        <span>${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} مكتملة</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-value bg-${category.color}" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }
        
        // Format due date
        let dueDateHtml = '';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const dueDateFormatted = dueDate.toLocaleDateString('ar-SA');
            
            let dueDateClass = 'due-date-future';
            if (dueDate < today) {
                dueDateClass = 'due-date-overdue';
            } else if (dueDate.getTime() === today.getTime()) {
                dueDateClass = 'due-date-soon';
            }
            
            dueDateHtml = `
                <div class="flex items-center text-sm ${dueDateClass}">
                    <i class="fas fa-calendar-day ml-1"></i>
                    <span>${dueDateFormatted}</span>
                </div>
            `;
        }
        
        // Generate subtasks HTML if any
        let subtasksHtml = '';
        if (task.subtasks && task.subtasks.length > 0) {
            const subtasksToShow = task.subtasks.slice(0, 3); // Show only first 3 subtasks
            subtasksHtml = `
                <div class="mt-3 border-t border-gray-100 pt-2">
                    <p class="text-xs text-gray-500 mb-1">المهام الفرعية:</p>
                    <div class="space-y-1">
                        ${subtasksToShow.map(subtask => `
                            <div class="flex items-center subtask ${subtask.completed ? 'subtask-completed' : ''}">
                                <div class="ml-2">
                                    <input type="checkbox" ${subtask.completed ? 'checked' : ''} 
                                    onclick="App.toggleSubtaskStatus('${task.id}', '${subtask.id}', this.checked)">
                                </div>
                                <span class="text-sm subtask-title">${subtask.title}</span>
                            </div>
                        `).join('')}
                        ${task.subtasks.length > 3 ? `<p class="text-xs text-gray-500">+${task.subtasks.length - 3} مهام أخرى</p>` : ''}
                    </div>
                </div>
            `;
        }
        
        taskElement.innerHTML = `
            <div class="p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="ml-3">
                            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                            onclick="App.toggleTaskStatus('${task.id}', this.checked)">
                        </div>
                        <h3 class="text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${task.title}</h3>
                    </div>
                    <div class="flex items-center">
                        <span class="inline-block px-2 py-1 text-xs rounded-full bg-${category.color} bg-opacity-20 text-${category.color} ml-2">
                            ${category.name}
                        </span>
                        <div class="dropdown relative">
                            <button class="text-gray-400 hover:text-gray-600" onclick="App.toggleTaskActions('${task.id}')">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div id="taskActions-${task.id}" class="dropdown-menu hidden absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                <div class="py-1">
                                    <button onclick="App.editTask('${task.id}')" class="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i class="fas fa-edit ml-1"></i>تعديل
                                    </button>
                                    <button onclick="App.confirmDeleteTask('${task.id}')" class="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                        <i class="fas fa-trash-alt ml-1"></i>حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${task.description ? `<p class="mt-2 text-gray-600">${task.description}</p>` : ''}
                
                <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center">
                        <div class="tooltip">
                            <div class="flex items-center text-sm text-gray-500">
                                <i class="fas fa-flag ml-1 ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'}"></i>
                                <span>${task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</span>
                            </div>
                            <span class="tooltip-text">مستوى الأولوية</span>
                        </div>
                    </div>
                    ${dueDateHtml}
                </div>
                
                ${progressHtml}
                ${subtasksHtml}
            </div>
        `;
        
        return taskElement;
    },
    
    /**
     * Create a compact task element
     */
    createCompactTaskElement: function(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item bg-white rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${task.completed ? 'opacity-75' : ''}`;
        taskElement.setAttribute('data-task-id', task.id);
        
        // Add priority class
        taskElement.classList.add(`priority-${task.priority}`);
        
        // Find task category
        const category = this.categories.find(cat => cat.id === task.categoryId) || { name: 'عام', color: 'gray-500' };
        
        // Format due date
        let dueDateHtml = '';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const dueDateFormatted = dueDate.toLocaleDateString('ar-SA');
            
            let dueDateClass = 'text-emerald-500';
            if (dueDate < today) {
                dueDateClass = 'text-red-500';
            } else if (dueDate.getTime() === today.getTime()) {
                dueDateClass = 'text-amber-500';
            }
            
            dueDateHtml = `
                <div class="flex items-center text-sm ${dueDateClass}">
                    <i class="fas fa-calendar-day ml-1"></i>
                    <span>${dueDateFormatted}</span>
                </div>
            `;
        }
        
        taskElement.innerHTML = `
            <div class="p-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="ml-2">
                            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                            onclick="App.toggleTaskStatus('${task.id}', this.checked)">
                        </div>
                        <h3 class="font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${task.title}</h3>
                    </div>
                    <div class="flex items-center">
                        <span class="inline-block px-2 py-1 text-xs rounded-full bg-${category.color} bg-opacity-20 text-${category.color} ml-2">
                            ${category.name}
                        </span>
                        <button class="text-gray-400 hover:text-gray-600 mr-2" onclick="App.editTask('${task.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return taskElement;
    },
    
    /**
     * Calculate task progress
     */
    calculateTaskProgress: function(task) {
        if (!task.subtasks || task.subtasks.length === 0) {
            return task.completed ? 100 : 0;
        }
        
        const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
        return Math.round((completedSubtasks / task.subtasks.length) * 100);
    },
    
    /**
     * Toggle task dropdown actions
     */
    toggleTaskActions: function(taskId) {
        const dropdown = document.getElementById(`taskActions-${taskId}`);
        dropdown.classList.toggle('hidden');
        
        // Close dropdown when clicking outside
        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && !e.target.closest(`[onclick="App.toggleTaskActions('${taskId}')"]`)) {
                dropdown.classList.add('hidden');
                document.removeEventListener('click', closeDropdown);
            }
        };
        
        if (!dropdown.classList.contains('hidden')) {
            setTimeout(() => {
                document.addEventListener('click', closeDropdown);
            }, 0);
        }
    },
    
    /**
     * Toggle task completed status
     */
    toggleTaskStatus: function(taskId, isCompleted) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        this.tasks[taskIndex].completed = isCompleted;
        
        // If task is completed, also complete all subtasks
        if (isCompleted && this.tasks[taskIndex].subtasks) {
            this.tasks[taskIndex].subtasks.forEach(subtask => {
                subtask.completed = true;
            });
        }
        
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateTaskCounts();
        this.updateOverallProgress();
    },
    
    /**
     * Toggle subtask completed status
     */
    toggleSubtaskStatus: function(taskId, subtaskId, isCompleted) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        const task = this.tasks[taskIndex];
        if (!task.subtasks) return;
        
        const subtaskIndex = task.subtasks.findIndex(subtask => subtask.id === subtaskId);
        if (subtaskIndex === -1) return;
        
        task.subtasks[subtaskIndex].completed = isCompleted;
        
        // Update task status based on subtasks
        const allSubtasksCompleted = task.subtasks.every(subtask => subtask.completed);
        task.completed = allSubtasksCompleted;
        
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateTaskCounts();
        this.updateOverallProgress();
    },
    
    /**
     * Update task counts
     */
    updateTaskCounts: function() {
        document.getElementById('totalTaskCount').textContent = this.tasks.length;
        document.getElementById('activeTaskCount').textContent = this.tasks.filter(task => !task.completed).length;
        document.getElementById('completedTaskCount').textContent = this.tasks.filter(task => task.completed).length;
    },
    
    /**
     * Update overall progress
     */
    updateOverallProgress: function() {
        const totalTasks = this.tasks.length;
        if (totalTasks === 0) {
            document.getElementById('overallProgress').style.width = '0%';
            document.getElementById('overallProgressText').textContent = '0%';
            return;
        }
        
        let completedCount = 0;
        
        this.tasks.forEach(task => {
            if (task.subtasks && task.subtasks.length > 0) {
                completedCount += this.calculateTaskProgress(task) / 100;
            } else if (task.completed) {
                completedCount += 1;
            }
        });
        
        const progress = Math.round((completedCount / totalTasks) * 100);
        document.getElementById('overallProgress').style.width = `${progress}%`;
        document.getElementById('overallProgressText').textContent = `${progress}%`;
    },
    
    /**
     * Filter tasks
     */
    filterTasks: function() {
        this.renderTasks();
    },
    
    /**
     * Open task modal for adding a new task
     */
    openTaskModal: function() {
        // Reset form
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        document.getElementById('taskModalTitle').textContent = 'إضافة مهمة جديدة';
        document.getElementById('deleteTaskBtn').classList.add('hidden');
        document.getElementById('subtasksList').innerHTML = '';
        
        // Show modal
        document.getElementById('taskModal').classList.remove('hidden');
    },
    
    /**
     * Hide task modal
     */
    hideTaskModal: function() {
        document.getElementById('taskModal').classList.add('hidden');
    },
    
    /**
     * Edit existing task
     */
    editTask: function(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Set current task ID
        this.currentTaskId = taskId;
        
        // Fill form with task data
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskCategory').value = task.categoryId;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate || '';
        
        // Clear existing subtasks
        document.getElementById('subtasksList').innerHTML = '';
        
        // Add subtasks to form
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(subtask => {
                this.addSubtaskToForm(subtask);
            });
        }
        
        // Update modal title and show delete button
        document.getElementById('taskModalTitle').textContent = 'تعديل المهمة';
        document.getElementById('deleteTaskBtn').classList.remove('hidden');
        
        // Show modal
        document.getElementById('taskModal').classList.remove('hidden');
    },
    
    /**
     * Add subtask field to form
     */
    addSubtaskField: function(event) {
        event.preventDefault();
        
        const newSubtaskInput = document.getElementById('newSubtaskTitle');
        const title = newSubtaskInput.value.trim();
        
        if (!title) return;
        
        // Create subtask object
        const subtask = {
            id: this.generateId(),
            title: title,
            completed: false
        };
        
        // Add to form
        this.addSubtaskToForm(subtask);
        
        // Clear input
        newSubtaskInput.value = '';
        newSubtaskInput.focus();
    },
    
    /**
     * Add subtask to form
     */
    addSubtaskToForm: function(subtask) {
        const subtasksList = document.getElementById('subtasksList');
        
        const subtaskElement = document.createElement('div');
        subtaskElement.className = 'flex items-center justify-between';
        subtaskElement.innerHTML = `
            <div class="flex items-center">
                <div class="ml-2">
                    <input type="checkbox" ${subtask.completed ? 'checked' : ''} data-subtask-id="${subtask.id}" class="subtask-check">
                </div>
                <span class="text-sm">${subtask.title}</span>
            </div>
            <button type="button" class="text-red-500 hover:text-red-700" onclick="App.removeSubtaskField(this)" data-subtask-id="${subtask.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        subtasksList.appendChild(subtaskElement);
    },
    
    /**
     * Remove subtask field from form
     */
    removeSubtaskField: function(button) {
        const subtaskElement = button.closest('div.flex.items-center.justify-between');
        if (subtaskElement) {
            subtaskElement.remove();
        }
    },
    
    /**
     * Save task (add new or update existing)
     */
    saveTask: function(event) {
        event.preventDefault();
        
        // Get form data
        const id = document.getElementById('taskId').value || this.generateId();
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const categoryId = document.getElementById('taskCategory').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        // Get subtasks from form
        const subtasks = [];
        document.querySelectorAll('#subtasksList > div').forEach(subtaskEl => {
            const subtaskId = subtaskEl.querySelector('[data-subtask-id]').getAttribute('data-subtask-id');
            const subtaskTitle = subtaskEl.querySelector('span').textContent;
            const isCompleted = subtaskEl.querySelector('.subtask-check').checked;
            
            subtasks.push({
                id: subtaskId,
                title: subtaskTitle,
                completed: isCompleted
            });
        });
        
        // Create task object
        const task = {
            id,
            title,
            description,
            categoryId,
            priority,
            dueDate,
            subtasks,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Check if editing existing task
        const existingTaskIndex = this.tasks.findIndex(t => t.id === id);
        if (existingTaskIndex !== -1) {
            // Preserve completed status
            task.completed = this.tasks[existingTaskIndex].completed;
            task.createdAt = this.tasks[existingTaskIndex].createdAt;
            
            // Update task
            this.tasks[existingTaskIndex] = task;
        } else {
            // Add new task
            this.tasks.push(task);
        }
        
        // Save and update UI
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateTaskCounts();
        this.updateOverallProgress();
        
        // Hide modal
        this.hideTaskModal();
        
        return false;
    },
    
    /**
     * Confirm delete task
     */
    confirmDeleteTask: function(taskId) {
        if (!taskId) {
            taskId = document.getElementById('taskId').value;
            if (!taskId) return;
        }
        
        // Set up confirmation
        document.getElementById('confirmationTitle').textContent = 'تأكيد حذف المهمة';
        document.getElementById('confirmationMessage').textContent = 'هل أنت متأكد من رغبتك في حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء.';
        
        // Set up confirmation callback
        this.confirmationCallback = () => {
            this.deleteTask(taskId);
            this.hideConfirmationModal();
            this.hideTaskModal();
        };
        
        document.getElementById('confirmActionBtn').onclick = () => this.confirmationCallback();
        
        // Show confirmation modal
        document.getElementById('confirmationModal').classList.remove('hidden');
    },
    
    /**
     * Hide confirmation modal
     */
    hideConfirmationModal: function() {
        document.getElementById('confirmationModal').classList.add('hidden');
    },
    
    /**
     * Delete task
     */
    deleteTask: function(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        this.tasks.splice(taskIndex, 1);
        
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateTaskCounts();
        this.updateOverallProgress();
    },
    
    /**
     * Render categories
     */
    renderCategories: function() {
        const categoriesList = document.getElementById('categoriesList');
        
        // Clear existing categories
        categoriesList.innerHTML = '';
        
        if (this.categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    لا توجد تصنيفات حالياً. أضف تصنيفاً جديداً لتنظيم مهامك.
                </div>
            `;
            return;
        }
        
        // Add each category
        this.categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'p-4 flex items-center justify-between';
            
            // Count tasks in this category
            const taskCount = this.tasks.filter(task => task.categoryId === category.id).length;
            
            categoryElement.innerHTML = `
                <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full bg-${category.color} ml-3"></div>
                    <span class="font-medium text-gray-800">${category.name}</span>
                </div>
                <div class="flex items-center">
                    <span class="text-sm text-gray-500 ml-4">${taskCount} مهمة</span>
                    <button onclick="App.editCategory('${category.id}')" class="text-gray-400 hover:text-gray-600 ml-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="App.confirmDeleteCategory('${category.id}')" class="text-gray-400 hover:text-red-600">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            categoriesList.appendChild(categoryElement);
        });
    },
    
    /**
     * Open category modal for adding a new category
     */
    openCategoryModal: function() {
        // Reset form
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryModalTitle').textContent = 'إضافة تصنيف جديد';
        document.getElementById('deleteCategoryBtn').classList.add('hidden');
        
        // Reset color selection
        document.querySelectorAll('.category-color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-color') === 'emerald-500') {
                option.classList.add('selected');
            }
        });
        document.getElementById('categoryColor').value = 'emerald-500';
        
        // Show modal
        document.getElementById('categoryModal').classList.remove('hidden');
    },
    
    /**
     * Hide category modal
     */
    hideCategoryModal: function() {
        document.getElementById('categoryModal').classList.add('hidden');
    },
    
    /**
     * Edit existing category
     */
    editCategory: function(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;
        
        // Set current category ID
        this.currentCategoryId = categoryId;
        
        // Fill form with category data
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryColor').value = category.color;
        
        // Update color selection
        document.querySelectorAll('.category-color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-color') === category.color) {
                option.classList.add('selected');
            }
        });
        
        // Update modal title and show delete button
        document.getElementById('categoryModalTitle').textContent = 'تعديل التصنيف';
        document.getElementById('deleteCategoryBtn').classList.remove('hidden');
        
        // Show modal
        document.getElementById('categoryModal').classList.remove('hidden');
    },
    
    /**
     * Select category color
     */
    selectCategoryColor: function(button) {
        // Remove selected class from all options
        document.querySelectorAll('.category-color-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        button.classList.add('selected');
        
        // Update hidden input
        document.getElementById('categoryColor').value = button.getAttribute('data-color');
    },
    
    /**
     * Save category (add new or update existing)
     */
    saveCategory: function(event) {
        event.preventDefault();
        
        // Get form data
        const id = document.getElementById('categoryId').value || this.generateId();
        const name = document.getElementById('categoryName').value;
        const color = document.getElementById('categoryColor').value;
        
        // Create category object
        const category = {
            id,
            name,
            color
        };
        
        // Check if editing existing category
        const existingCategoryIndex = this.categories.findIndex(c => c.id === id);
        if (existingCategoryIndex !== -1) {
            // Update category
            this.categories[existingCategoryIndex] = category;
        } else {
            // Add new category
            this.categories.push(category);
        }
        
        // Save and update UI
        this.saveToLocalStorage();
        this.renderCategories();
        this.populateCategoryDropdowns();
        
        // Hide modal
        this.hideCategoryModal();
        
        return false;
    },
    
    /**
     * Confirm delete category
     */
    confirmDeleteCategory: function(categoryId) {
        if (!categoryId) {
            categoryId = document.getElementById('categoryId').value;
            if (!categoryId) return;
        }
        
        // Check if this is the only category
        if (this.categories.length <= 1) {
            alert('لا يمكن حذف التصنيف الوحيد. أضف تصنيفاً آخر أولاً.');
            return;
        }
        
        // Count tasks using this category
        const tasksUsingCategory = this.tasks.filter(task => task.categoryId === categoryId).length;
        
        // Set up confirmation
        document.getElementById('confirmationTitle').textContent = 'تأكيد حذف التصنيف';
        
        let message = 'هل أنت متأكد من رغبتك في حذف هذا التصنيف؟';
        if (tasksUsingCategory > 0) {
            message += ` هناك ${tasksUsingCategory} مهمة تستخدم هذا التصنيف وسيتم تحويلها إلى التصنيف الافتراضي.`;
        }
        
        document.getElementById('confirmationMessage').textContent = message;
        
        // Set up confirmation callback
        this.confirmationCallback = () => {
            this.deleteCategory(categoryId);
            this.hideConfirmationModal();
            this.hideCategoryModal();
        };
        
        document.getElementById('confirmActionBtn').onclick = () => this.confirmationCallback();
        
        // Show confirmation modal
        document.getElementById('confirmationModal').classList.remove('hidden');
    },
    
    /**
     * Delete category
     */
    deleteCategory: function(categoryId) {
        const categoryIndex = this.categories.findIndex(category => category.id === categoryId);
        if (categoryIndex === -1) return;
        
        // Get default category (first one that's not being deleted)
        const defaultCategory = this.categories.find(c => c.id !== categoryId);
        
        // Update all tasks using this category
        this.tasks.forEach(task => {
            if (task.categoryId === categoryId) {
                task.categoryId = defaultCategory.id;
            }
        });
        
        // Remove the category
        this.categories.splice(categoryIndex, 1);
        
        this.saveToLocalStorage();
        this.renderCategories();
        this.populateCategoryDropdowns();
        this.renderTasks();
    },
    
    /**
     * Load settings
     */
    loadSettings: function() {
        document.getElementById('showCompletedToggle').checked = this.settings.showCompleted;
        document.getElementById('dueDateAlertsToggle').checked = this.settings.dueDateAlerts;
        document.getElementById('showProgressToggle').checked = this.settings.showProgress;
        document.getElementById('taskViewStyle').value = this.settings.taskViewStyle || 'detailed';
    },
    
    /**
     * Update settings
     */
    updateSettings: function() {
        this.settings.showCompleted = document.getElementById('showCompletedToggle').checked;
        this.settings.dueDateAlerts = document.getElementById('dueDateAlertsToggle').checked;
        this.settings.showProgress = document.getElementById('showProgressToggle').checked;
        
        this.saveToLocalStorage();
        this.renderTasks();
    },
    
    /**
     * Update task view style
     */
    updateTaskViewStyle: function() {
        this.settings.taskViewStyle = document.getElementById('taskViewStyle').value;
        
        this.saveToLocalStorage();
        this.renderTasks();
    },
    
    /**
     * Export tasks to JSON file
     */
    exportTasks: function() {
        const data = JSON.stringify(this.tasks, null, 2);
        this.downloadFile(data, 'tasks.json', 'application/json');
    },
    
    /**
     * Export all data to JSON file
     */
    exportAllData: function() {
        const data = JSON.stringify({
            tasks: this.tasks,
            categories: this.categories,
            settings: this.settings
        }, null, 2);
        
        this.downloadFile(data, 'todo_data.json', 'application/json');
    },
    
    /**
     * Helper function to download a file
     */
    downloadFile: function(data, filename, type) {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    /**
     * Handle import file
     */
    handleImportFile: function(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importType = input.dataset.importType;
                const data = JSON.parse(e.target.result);
                
                if (importType === 'tasks' && Array.isArray(data)) {
                    // Import only tasks
                    this.importTasks(data);
                } else if (importType === 'all' && data.tasks && data.categories) {
                    // Import all data
                    this.importAllData(data);
                } else {
                    throw new Error('Invalid data format');
                }
                
                alert('تم استيراد البيانات بنجاح');
            } catch (error) {
                alert('حدث خطأ أثناء استيراد البيانات: ' + error.message);
            }
            
            // Reset file input
            input.value = '';
        };
        
        reader.readAsText(file);
    },
    
    /**
     * Import tasks from JSON
     */
    importTasks: function(tasks) {
        if (!Array.isArray(tasks)) {
            throw new Error('بيانات المهام غير صالحة');
        }
        
        // Validate task data
        tasks.forEach(task => {
            if (!task.id || !task.title) {
                throw new Error('بعض المهام تفتقد إلى المعلومات الأساسية');
            }
            
            // Ensure all tasks have a valid category
            if (!this.categories.some(c => c.id === task.categoryId)) {
                // Set to default category (first one)
                task.categoryId = this.categories[0].id;
            }
        });
        
        // Add imported tasks to existing tasks
        this.tasks = [...this.tasks, ...tasks];
        
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateTaskCounts();
        this.updateOverallProgress();
    },
    
    /**
     * Import all data from JSON
     */
    importAllData: function(data) {
        if (!data.tasks || !data.categories) {
            throw new Error('بيانات غير مكتملة');
        }
        
        // Import categories first
        if (Array.isArray(data.categories)) {
            this.categories = data.categories;
        }
        
        // Then import tasks
        if (Array.isArray(data.tasks)) {
            this.tasks = data.tasks;
        }
        
        // Import settings if available
        if (data.settings) {
            this.settings = { ...this.settings, ...data.settings };
        }
        
        this.saveToLocalStorage();
        this.populateCategoryDropdowns();
        this.renderCategories();
        this.renderTasks();
        this.updateTaskCounts();
        this.updateOverallProgress();
        this.loadSettings();
    },
    
    /**
     * Confirm clear all data
     */
    confirmClearAllData: function() {
        document.getElementById('confirmationTitle').textContent = 'تأكيد مسح كل البيانات';
        document.getElementById('confirmationMessage').textContent = 
            'هل أنت متأكد من رغبتك في مسح كل البيانات؟ سيتم حذف جميع المهام والتصنيفات والإعدادات. هذا الإجراء لا يمكن التراجع عنه.';
        
        this.confirmationCallback = () => {
            this.clearAllData();
            this.hideConfirmationModal();
        };
        
        document.getElementById('confirmActionBtn').onclick = () => this.confirmationCallback();
        document.getElementById('confirmationModal').classList.remove('hidden');
    },
    
    /**
     * Clear all data
     */
    clearAllData: function() {
        // Reset to initial state
        this.tasks = [];
        this.categories = [
            { id: this.generateId(), name: 'عام', color: 'gray-500' }
        ];
        this.settings = {
            showCompleted: true,
            dueDateAlerts: true,
            showProgress: true,
            taskViewStyle: 'detailed'
        };
        
        this.saveToLocalStorage();
        this.populateCategoryDropdowns();
        this.renderCategories();
        this.renderTasks();
        this.updateTaskCounts();
        this.updateOverallProgress();
        this.loadSettings();
        
        alert('تم مسح جميع البيانات بنجاح');
    },
    
    /**
     * Print tasks as PDF
     */
    printTasksAsPDF: function() {
        // Create a new element to print
        const printElement = document.createElement('div');
        printElement.className = 'p-6 bg-white';
        
        // Add header
        printElement.innerHTML = `
            <div class="text-center mb-6">
                <h1 class="text-2xl font-bold mb-2">قائمة المهام</h1>
                <p class="text-gray-600">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
        `;
        
        // Create task list container
        const taskListElement = document.createElement('div');
        taskListElement.className = 'space-y-4';
        
        // Get filtered tasks
        const filteredTasks = this.getFilteredTasks();
        
        // Add each task
        filteredTasks.forEach(task => {
            const category = this.categories.find(cat => cat.id === task.categoryId) || { name: 'عام' };
            
            // Create task element
            const taskElement = document.createElement('div');
            taskElement.className = 'p-4 border border-gray-200 rounded-lg';
            
            // Format priority
            const priorityText = task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة';
            
            // Format due date
            let dueDateText = 'غير محدد';
            if (task.dueDate) {
                dueDateText = new Date(task.dueDate).toLocaleDateString('ar-SA');
            }
            
            // Add task content
            taskElement.innerHTML = `
                <div class="flex items-start">
                    <div class="mr-2">${task.completed ? '✓' : '□'}</div>
                    <div class="flex-1">
                        <h3 class="font-bold ${task.completed ? 'line-through' : ''}">${task.title}</h3>
                        ${task.description ? `<p class="text-gray-700 mt-1">${task.description}</p>` : ''}
                        
                        <div class="flex flex-wrap gap-2 mt-2 text-sm">
                            <span class="px-2 py-1 bg-gray-100 rounded-full">التصنيف: ${category.name}</span>
                            <span class="px-2 py-1 bg-gray-100 rounded-full">الأولوية: ${priorityText}</span>
                            <span class="px-2 py-1 bg-gray-100 rounded-full">تاريخ الاستحقاق: ${dueDateText}</span>
                        </div>
                        
                        ${task.subtasks && task.subtasks.length > 0 ? `
                            <div class="mt-3 border-t border-gray-100 pt-2">
                                <p class="text-sm font-medium">المهام الفرعية:</p>
                                <ul class="list-disc list-inside mt-1">
                                    ${task.subtasks.map(subtask => `
                                        <li class="${subtask.completed ? 'line-through text-gray-500' : ''}">${subtask.title}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            taskListElement.appendChild(taskElement);
        });
        
        // Add task list to print element
        printElement.appendChild(taskListElement);
        
        // Add summary
        printElement.innerHTML += `
            <div class="mt-6 text-center text-sm text-gray-600">
                <p>إجمالي المهام: ${this.tasks.length} | المهام المكتملة: ${this.tasks.filter(t => t.completed).length}</p>
            </div>
        `;
        
        // Generate PDF
        const pdfOptions = {
            margin: 10,
            filename: 'tasks.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Convert to PDF
        html2pdf().from(printElement).set(pdfOptions).save();
    }
};

// Initialize app when document is ready
document.addEventListener('DOMContentLoaded', function() {
    App.initialize();
});

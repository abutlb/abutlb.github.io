                    /**
                    * Content Calendar Builder
                    * A tool for planning and organizing content creation across different platforms
                    * 
                    * Class-based implementation
                    */
                   
                   // Main application class
                   class ContentCalendar {
                    constructor() {
                        // Initialize properties
                        this.posts = [];
                        this.settings = {
                            darkMode: true,
                            showAdjacentMonths: true,
                            showCharts: true,
                            postViewStyle: 'detailed',
                            firstDayOfWeek: 'sunday'
                        };
                        this.currentDate = new Date();
                        this.selectedMonth = this.currentDate.getMonth();
                        this.selectedYear = this.currentDate.getFullYear();
                        this.selectedDay = null;
                        this.selectedPostId = null;
                        this.charts = {};
                        
                        // Initialize UI components
                        this.ui = new UI(this);
                        
                        // Initialize data controller
                        this.dataController = new DataController(this);
                        
                        // Load data from local storage
                        this.loadData();
                        
                        // Initialize event listeners
                        this.initEventListeners();
                        
                        // Render the calendar
                        this.renderCalendar();
                        
                        // Update charts and statistics
                        this.updateAnalytics();
                    }
                    
                    /**
                     * Initialize all event listeners
                     */
                    initEventListeners() {
                        // Tab switching
                        document.querySelectorAll('.tab-btn').forEach(btn => {
                            btn.addEventListener('click', () => this.ui.switchTab(btn.dataset.tab));
                        });
                        
                        // Theme switching
                        document.getElementById('themeToggle').addEventListener('click', () => this.ui.toggleTheme());
                        
                        // Calendar month picker
                        document.getElementById('calendarMonth').addEventListener('change', (e) => {
                            const [year, month] = e.target.value.split('-');
                            this.selectedYear = parseInt(year);
                            this.selectedMonth = parseInt(month) - 1;
                            this.renderCalendar();
                        });
                        
                        // Add post button
                        document.getElementById('addPostBtn').addEventListener('click', () => this.ui.openPostModal());
                        
                        // Print calendar
                        document.getElementById('printCalendarBtn').addEventListener('click', () => this.printCalendar());
                        
                        // Export calendar
                        document.getElementById('exportCalendarBtn').addEventListener('click', () => this.dataController.exportData());
                        
                        // Import calendar
                        document.getElementById('importCalendarBtn').addEventListener('click', () => {
                            document.getElementById('importFileInput').click();
                        });
                        
                        // Check readiness
                        document.getElementById('checkReadinessBtn').addEventListener('click', () => this.checkReadiness());
                        
                        // Import file input change
                        document.getElementById('importFileInput').addEventListener('change', (e) => {
                            this.dataController.importData(e.target.files[0]);
                        });
                        
                        // Filters
                        document.getElementById('platformFilter').addEventListener('change', () => this.renderCalendar());
                        document.getElementById('contentTypeFilter').addEventListener('change', () => this.renderCalendar());
                        document.getElementById('categoryFilter').addEventListener('change', () => this.renderCalendar());
                        
                        // Post modal form submission
                        document.getElementById('postForm').addEventListener('submit', (e) => {
                            e.preventDefault();
                            this.savePost();
                        });
                        
                        // Post modal close buttons
                        document.getElementById('closePostModal').addEventListener('click', () => this.ui.closePostModal());
                        document.getElementById('cancelPostBtn').addEventListener('click', () => this.ui.closePostModal());
                        
                        // Delete post button
                        document.getElementById('deletePostBtn').addEventListener('click', () => {
                            if (this.selectedPostId) {
                                this.ui.openConfirmationModal(
                                    'تأكيد الحذف',
                                    'هل أنت متأكد من رغبتك في حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.',
                                    () => this.deletePost(this.selectedPostId)
                                );
                            }
                        });
                        
                        // Confirmation modal buttons
                        document.getElementById('confirmCancel').addEventListener('click', () => this.ui.closeConfirmationModal());
                        document.getElementById('confirmAction').addEventListener('click', () => {
                            if (this.ui.confirmCallback) {
                                this.ui.confirmCallback();
                                this.ui.closeConfirmationModal();
                            }
                        });
                        
                        // Readiness modal close buttons
                        document.getElementById('closeReadinessModal').addEventListener('click', () => this.ui.closeReadinessModal());
                        document.getElementById('closeReadinessBtn').addEventListener('click', () => this.ui.closeReadinessModal());
                        
                        // Settings
                        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
                            this.settings.darkMode = e.target.checked;
                            this.ui.applyTheme();
                            this.saveSettings();
                        });
                        
                        document.getElementById('adjacentMonthsToggle').addEventListener('change', (e) => {
                            this.settings.showAdjacentMonths = e.target.checked;
                            this.renderCalendar();
                            this.saveSettings();
                        });
                        
                        document.getElementById('showChartsToggle').addEventListener('change', (e) => {
                            this.settings.showCharts = e.target.checked;
                            this.ui.toggleCharts();
                            this.saveSettings();
                        });
                        
                        document.getElementById('postViewStyle').addEventListener('change', (e) => {
                            this.settings.postViewStyle = e.target.value;
                            this.renderCalendar();
                            this.saveSettings();
                        });
                        
                        document.getElementById('firstDayOfWeek').addEventListener('change', (e) => {
                            this.settings.firstDayOfWeek = e.target.value;
                            this.renderCalendar();
                            this.saveSettings();
                        });
                        
                        // Data management
                        document.getElementById('exportDataBtn').addEventListener('click', () => this.dataController.exportData());
                        document.getElementById('importDataBtn').addEventListener('click', () => {
                            document.getElementById('importFileInput').click();
                        });
                        
                        document.getElementById('clearDataBtn').addEventListener('click', () => {
                            this.ui.openConfirmationModal(
                                'تأكيد حذف البيانات',
                                'هل أنت متأكد من رغبتك في حذف جميع المنشورات؟ لا يمكن التراجع عن هذا الإجراء.',
                                () => this.dataController.clearData()
                            );
                        });
                        
                        // Update year in footer
                        document.getElementById('footerYear').textContent = new Date().getFullYear();
                        document.getElementById('currentYear').textContent = new Date().getFullYear();
                    }
                    
                    /**
                     * Load data from localStorage
                     */
                    loadData() {
                        this.dataController.loadData();
                    }
                    
                    /**
                     * Save settings to localStorage
                     */
                    saveSettings() {
                        this.dataController.saveSettings();
                    }
                    
                    /**
                     * Render the calendar with current month/year
                     */
                    renderCalendar() {
                        const calendarGrid = document.getElementById('calendarGrid');
                        calendarGrid.innerHTML = '';
                        
                        // Set calendar title
                        const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                        document.getElementById('calendarTitle').textContent = `${months[this.selectedMonth]} ${this.selectedYear}`;
                        
                        // Update month picker
                        const monthPicker = document.getElementById('calendarMonth');
                        monthPicker.value = `${this.selectedYear}-${(this.selectedMonth + 1).toString().padStart(2, '0')}`;
                        
                        // Get first day of the month
                        const firstDay = new Date(this.selectedYear, this.selectedMonth, 1);
                        
                        // Get last day of the month
                        const lastDay = new Date(this.selectedYear, this.selectedMonth + 1, 0);
                        
                        // Determine start day based on firstDayOfWeek setting
                        let startDayIndex = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
                        
                        if (this.settings.firstDayOfWeek === 'monday') {
                            startDayIndex = (startDayIndex === 0) ? 6 : startDayIndex - 1;
                        } else if (this.settings.firstDayOfWeek === 'saturday') {
                            startDayIndex = (startDayIndex < 6) ? startDayIndex + 1 : 0;
                        }
                        
                        // Calculate previous month's days to show
                        const prevMonthDays = startDayIndex;
                        
                        // Get the previous month's last day
                        const prevMonthLastDay = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
                        
                        // Calculate next month's days to show
                        const totalCells = 42; // 6 rows × 7 days
                        const currentMonthDays = lastDay.getDate();
                        const nextMonthDays = totalCells - (prevMonthDays + currentMonthDays);
                        
                        // Apply filters
                        const platformFilter = document.getElementById('platformFilter').value;
                        const contentTypeFilter = document.getElementById('contentTypeFilter').value;
                        const categoryFilter = document.getElementById('categoryFilter').value;
                        
                        // Render previous month days
                        if (this.settings.showAdjacentMonths) {
                            for (let i = 0; i < prevMonthDays; i++) {
                                const day = prevMonthLastDay - prevMonthDays + i + 1;
                                const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
                                const dayPosts = this.getPostsForDate(date).filter(post => this.filterPost(post, platformFilter, contentTypeFilter, categoryFilter));
                                const dayEl = this.createDayElement(day, date, dayPosts, true);
                                calendarGrid.appendChild(dayEl);
                            }
                        } else {
                            for (let i = 0; i < prevMonthDays; i++) {
                                const emptyDayEl = document.createElement('div');
                                emptyDayEl.className = 'calendar-day bg-gray-100 dark:bg-gray-800 opacity-40';
                                calendarGrid.appendChild(emptyDayEl);
                            }
                        }
                        
                        // Render current month days
                        for (let day = 1; day <= currentMonthDays; day++) {
                            const date = new Date(this.selectedYear, this.selectedMonth, day);
                            const dayPosts = this.getPostsForDate(date).filter(post => this.filterPost(post, platformFilter, contentTypeFilter, categoryFilter));
                            const dayEl = this.createDayElement(day, date, dayPosts);
                            calendarGrid.appendChild(dayEl);
                        }
                        
                        // Render next month days
                        if (this.settings.showAdjacentMonths) {
                            for (let day = 1; day <= nextMonthDays; day++) {
                                const date = new Date(this.selectedYear, this.selectedMonth + 1, day);
                                const dayPosts = this.getPostsForDate(date).filter(post => this.filterPost(post, platformFilter, contentTypeFilter, categoryFilter));
                                const dayEl = this.createDayElement(day, date, dayPosts, true);
                                calendarGrid.appendChild(dayEl);
                            }
                        } else {
                            for (let i = 0; i < nextMonthDays; i++) {
                                const emptyDayEl = document.createElement('div');
                                emptyDayEl.className = 'calendar-day bg-gray-100 dark:bg-gray-800 opacity-40';
                                calendarGrid.appendChild(emptyDayEl);
                            }
                        }
                        
                        // Update post count
                        document.getElementById('totalPostCount').textContent = this.posts.length;
                        
                        // Update analytics after rendering
                        this.updateAnalytics();
                    }
                    
                    /**
                     * Create a day element for the calendar
                     * @param {number} day The day number
                     * @param {Date} date The date object
                     * @param {Array} posts Array of posts for this day
                     * @param {boolean} isAdjacent Whether this day is from adjacent month
                     * @returns {HTMLElement} The day element
                     */
                    createDayElement(day, date, posts, isAdjacent = false) {
                        const dayEl = document.createElement('div');
                        dayEl.className = `calendar-day ${isAdjacent ? 'bg-gray-100 dark:bg-gray-800 opacity-70' : 'bg-white dark:bg-gray-700'}`;
                        
                        // Check if this is today
                        const today = new Date();
                        const isToday = date.toDateString() === today.toDateString();
                        
                        if (isToday) {
                            dayEl.classList.add('border-2', 'border-violet-500', 'dark:border-violet-400');
                        }
                        
                        // Add day number
                        const dayHeader = document.createElement('div');
                        dayHeader.className = 'flex justify-between items-center mb-2';
                        
                        const dayNumber = document.createElement('span');
                        dayNumber.className = `day-number ${isToday ? 'bg-violet-500 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`;
                        dayNumber.textContent = day;
                        dayHeader.appendChild(dayNumber);
                        
                        // Add add post button
                        const addBtn = document.createElement('button');
                        addBtn.className = 'text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 p-1';
                        addBtn.innerHTML = '<i class="fas fa-plus-circle"></i>';
                        addBtn.title = 'إضافة منشور';
                        addBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.selectedDay = date;
                            this.ui.openPostModal(null, date);
                        });
                        dayHeader.appendChild(addBtn);
                        
                        dayEl.appendChild(dayHeader);
                        
                        // Add posts
                        const postsContainer = document.createElement('div');
                        postsContainer.className = 'posts-container space-y-1';
                        
                        posts.forEach(post => {
                            const postEl = this.createPostElement(post);
                            postsContainer.appendChild(postEl);
                        });
                        
                        dayEl.appendChild(postsContainer);
                        
                        // Add click event to open add post modal
                        dayEl.addEventListener('click', () => {
                            this.selectedDay = date;
                            this.ui.openPostModal(null, date);
                        });
                        
                        return dayEl;
                    }
                    
                    /**
                     * Create a post element
                     * @param {Object} post The post object
                     * @returns {HTMLElement} The post element
                     */
                    createPostElement(post) {
                        const postEl = document.createElement('div');
                        postEl.className = 'post-item p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition';
                        postEl.dataset.id = post.id;
                        
                        // Apply view style
                        if (this.settings.postViewStyle === 'compact') {
                            postEl.innerHTML = `
                                <div class="flex items-center">
                                    <span class="w-2 h-2 rounded-full mr-2" style="background-color: ${this.getPlatformColor(post.platform)}"></span>
                                    <span class="text-sm text-gray-700 dark:text-gray-300 truncate">${post.title}</span>
                                </div>
                            `;
                        } else if (this.settings.postViewStyle === 'icon') {
                            postEl.innerHTML = `
                                <div class="flex justify-center text-xl" title="${post.title}">
                                    <i class="${this.getPlatformIcon(post.platform)}" style="color: ${this.getPlatformColor(post.platform)}"></i>
                                </div>
                            `;
                        } else {
                            // Detailed view (default)
                            postEl.innerHTML = `
                                <div class="flex items-start">
                                    <div class="flex-shrink-0 ml-2">
                                        <div class="w-6 h-6 rounded-full flex items-center justify-center" style="background-color: ${this.getPlatformColor(post.platform)}">
                                            <i class="${this.getPlatformIcon(post.platform)} text-white text-xs"></i>
                                        </div>
                                    </div>
                                    <div class="flex-grow min-w-0">
                                        <div class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">${post.title}</div>
                                        <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span class="inline-block px-1.5 py-0.5 rounded-full ${this.getCategoryBg(post.category)}">${this.getCategoryName(post.category)}</span>
                                            <span class="mx-1">•</span>
                                            <span>${this.getContentTypeName(post.contentType)}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                        
                        // Add click event to open edit post modal
                        postEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.ui.openPostModal(post);
                        });
                        
                        return postEl;
                    }
                    
                    /**
                     * Get posts for a specific date
                     * @param {Date} date The date to get posts for
                     * @returns {Array} Array of posts for the date
                     */
                    getPostsForDate(date) {
                        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
                        return this.posts.filter(post => post.date === dateStr);
                    }
                    
                    /**
                     * Filter post based on current filters
                     * @param {Object} post The post to filter
                     * @param {string} platformFilter The platform filter
                     * @param {string} contentTypeFilter The content type filter
                     * @param {string} categoryFilter The category filter
                     * @returns {boolean} Whether the post passes the filters
                     */
                     filterPost(post, platformFilter, contentTypeFilter, categoryFilter) {
                         if (platformFilter !== 'all' && post.platform !== platformFilter) return false;
                         if (contentTypeFilter !== 'all' && post.contentType !== contentTypeFilter) return false;
                         if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;
                         return true;
                     }
                     
                     /**
                      * Save post from form
                      */
                     savePost() {
                         const id = document.getElementById('postId').value || this.generateId();
                         const date = document.getElementById('postDate').value;
                         const title = document.getElementById('postTitle').value;
                         const platform = document.getElementById('postPlatform').value;
                         const contentType = document.getElementById('postContentType').value;
                         const category = document.getElementById('postCategory').value;
                         const content = document.getElementById('postContent').value;
                         const link = document.getElementById('postLink').value;
                         const notes = document.getElementById('postNotes').value;
                         
                         const post = {
                             id,
                             date,
                             title,
                             platform,
                             contentType,
                             category,
                             content,
                             link,
                             notes
                         };
                         
                         // Check if this is a new post or an edit
                         const existingPostIndex = this.posts.findIndex(p => p.id === id);
                         
                         if (existingPostIndex !== -1) {
                             // Update existing post
                             this.posts[existingPostIndex] = post;
                         } else {
                             // Add new post
                             this.posts.push(post);
                         }
                         
                         // Save to localStorage
                         this.dataController.savePosts();
                         
                         // Close modal
                         this.ui.closePostModal();
                         
                         // Re-render calendar
                         this.renderCalendar();
                         
                         // Show saved message
                         this.ui.showSavedMessage();
                     }
                     
                     /**
                      * Delete a post
                      * @param {string} id The post ID to delete
                      */
                     deletePost(id) {
                         this.posts = this.posts.filter(post => post.id !== id);
                         
                         // Save to localStorage
                         this.dataController.savePosts();
                         
                         // Close modal
                         this.ui.closePostModal();
                         
                         // Re-render calendar
                         this.renderCalendar();
                     }
                     
                     /**
                      * Update analytics and charts
                      */
                     updateAnalytics() {
                         const analytics = new Analytics(this);
                         analytics.updateCharts();
                     }
                     
                     /**
                      * Check content readiness and show recommendations
                      */
                     checkReadiness() {
                         const analytics = new Analytics(this);
                         const readinessReport = analytics.generateReadinessReport();
                         this.ui.showReadinessReport(readinessReport);
                     }
                     
                     /**
                      * Print calendar as PDF
                      */
                     printCalendar() {
                         window.print();
                     }
                     
                     /**
                      * Generate a unique ID
                      * @returns {string} A unique ID
                      */
                     generateId() {
                         return 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                     }
                     
                     /**
                      * Get platform icon class
                      * @param {string} platform The platform
                      * @returns {string} The icon class
                      */
                     getPlatformIcon(platform) {
                         const icons = {
                             telegram: 'fab fa-telegram-plane',
                             twitter: 'fab fa-twitter',
                             instagram: 'fab fa-instagram',
                             youtube: 'fab fa-youtube',
                             facebook: 'fab fa-facebook-f',
                             tiktok: 'fab fa-tiktok',
                             linkedin: 'fab fa-linkedin-in'
                         };
                         
                         return icons[platform] || 'fas fa-globe';
                     }
                     
                     /**
                      * Get platform color
                      * @param {string} platform The platform
                      * @returns {string} The platform color
                      */
                     getPlatformColor(platform) {
                         const colors = {
                             telegram: '#0088cc',
                             twitter: '#1DA1F2',
                             instagram: '#E1306C',
                             youtube: '#FF0000',
                             facebook: '#4267B2',
                             tiktok: '#000000',
                             linkedin: '#0077B5'
                         };
                         
                         return colors[platform] || '#718096';
                     }
                     
                     /**
                      * Get category background class
                      * @param {string} category The category
                      * @returns {string} The background class
                      */
                     getCategoryBg(category) {
                         const bgClasses = {
                             educational: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
                             motivational: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
                             entertainment: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
                             ad: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
                             challenge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
                             quote: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
                         };
                         
                         return bgClasses[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
                     }
                     
                     /**
                      * Get category display name
                      * @param {string} category The category
                      * @returns {string} The display name
                      */
                     getCategoryName(category) {
                         const names = {
                             educational: 'تعليمي',
                             motivational: 'تحفيزي',
                             entertainment: 'ترفيهي',
                             ad: 'إعلان',
                             challenge: 'تحدي',
                             quote: 'اقتباس'
                         };
                         
                         return names[category] || category;
                     }
                     
                     /**
                      * Get content type display name
                      * @param {string} contentType The content type
                      * @returns {string} The display name
                      */
                     getContentTypeName(contentType) {
                         const names = {
                             image: 'صورة',
                             video: 'فيديو',
                             text: 'نص',
                             link: 'رابط'
                         };
                         
                         return names[contentType] || contentType;
                     }
                 }
                 
                 /**
                  * UI Class - Handles all UI interactions
                  */
                 class UI {
                     constructor(calendar) {
                         this.calendar = calendar;
                         this.confirmCallback = null;
                         
                         // Apply theme on init
                         this.applyTheme();
                     }
                     
                     /**
                      * Switch between tabs
                      * @param {string} tabId The tab ID to switch to
                      */
                     switchTab(tabId) {
                         // Hide all tab content
                         document.querySelectorAll('.tab-content').forEach(tab => {
                             tab.classList.add('hidden');
                         });
                         
                         // Show selected tab content
                         document.getElementById(`${tabId}-tab`).classList.remove('hidden');
                         
                         // Update active state on tab buttons
                         document.querySelectorAll('.tab-btn').forEach(btn => {
                             btn.classList.remove('active', 'opacity-100');
                             btn.classList.add('opacity-80');
                         });
                         
                         // Set active tab button
                         document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active', 'opacity-100');
                         document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.remove('opacity-80');
                     }
                     
                     /**
                      * Toggle dark/light theme
                      */
                     toggleTheme() {
                         this.calendar.settings.darkMode = !this.calendar.settings.darkMode;
                         this.applyTheme();
                         this.calendar.saveSettings();
                     }
                     
                     /**
                      * Apply current theme
                      */
                     applyTheme() {
                         if (this.calendar.settings.darkMode) {
                             document.documentElement.classList.add('dark');
                             document.getElementById('darkModeToggle').checked = true;
                             document.querySelector('.toggle-dot').classList.add('translate-x-6');
                         } else {
                             document.documentElement.classList.remove('dark');
                             document.getElementById('darkModeToggle').checked = false;
                             document.querySelector('.toggle-dot').classList.remove('translate-x-6');
                         }
                     }
                     
                     /**
                      * Open post modal
                      * @param {Object} post The post to edit, or null for a new post
                      * @param {Date} date The date for a new post
                      */
                     openPostModal(post = null, date = null) {
                         const modalTitle = document.getElementById('postModalTitle');
                         const postForm = document.getElementById('postForm');
                         const deleteBtn = document.getElementById('deletePostBtn');
                         
                         if (post) {
                             // Edit existing post
                             modalTitle.textContent = 'تعديل المنشور';
                             this.calendar.selectedPostId = post.id;
                             
                             document.getElementById('postId').value = post.id;
                             document.getElementById('postDate').value = post.date;
                             document.getElementById('postTitle').value = post.title;
                             document.getElementById('postPlatform').value = post.platform;
                             document.getElementById('postContentType').value = post.contentType;
                             document.getElementById('postCategory').value = post.category;
                             document.getElementById('postContent').value = post.content;
                             document.getElementById('postLink').value = post.link;
                             document.getElementById('postNotes').value = post.notes;
                             
                             deleteBtn.classList.remove('hidden');
                         } else {
                             // Add new post
                             modalTitle.textContent = 'إضافة منشور جديد';
                             this.calendar.selectedPostId = null;
                             
                             postForm.reset();
                             document.getElementById('postId').value = '';
                             
                             if (date) {
                                 const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
                                 document.getElementById('postDate').value = dateStr;
                             } else {
                                 const today = new Date();
                                 const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
                                 document.getElementById('postDate').value = dateStr;
                             }
                             
                             deleteBtn.classList.add('hidden');
                         }
                         
                         document.getElementById('postModal').classList.remove('hidden');
                     }
                     
                     /**
                      * Close post modal
                      */
                     closePostModal() {
                         document.getElementById('postModal').classList.add('hidden');
                         this.calendar.selectedPostId = null;
                     }
                     
                     /**
                      * Open confirmation modal
                      * @param {string} title The modal title
                      * @param {string} message The confirmation message
                      * @param {Function} callback The function to call on confirm
                      */
                     openConfirmationModal(title, message, callback) {
                         document.getElementById('confirmationTitle').textContent = title;
                         document.getElementById('confirmationMessage').textContent = message;
                         this.confirmCallback = callback;
                         document.getElementById('confirmationModal').classList.remove('hidden');
                     }
                     
                     /**
                      * Close confirmation modal
                      */
                     closeConfirmationModal() {
                         document.getElementById('confirmationModal').classList.add('hidden');
                         this.confirmCallback = null;
                     }
                     
                     /**
                      * Show readiness report
                      * @param {Object} report The readiness report object
                      */
                     showReadinessReport(report) {
                         const readinessContent = document.getElementById('readinessContent');
                         
                         let strengthsHtml = '';
                         report.strengths.forEach(strength => {
                             strengthsHtml += `<li>${strength}</li>`;
                         });
                         
                         let opportunitiesHtml = '';
                         report.opportunities.forEach(opportunity => {
                             opportunitiesHtml += `<li>${opportunity}</li>`;
                         });
                         
                         readinessContent.innerHTML = `
                             <div class="text-center mb-6">
                                 <div class="inline-block p-4 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mb-4">
                                     <i class="fas fa-check-circle text-5xl"></i>
                                 </div>
                                 <h4 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">نسبة الجاهزية: ${report.score}%</h4>
                                 <p class="text-gray-600 dark:text-gray-400">${report.message}</p>
                             </div>
                             
                             <div class="bg-violet-50 dark:bg-violet-900/30 p-4 rounded-lg mb-4">
                                 <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">نقاط القوة:</h5>
                                 <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                                     ${strengthsHtml}
                                 </ul>
                             </div>
                             
                             <div class="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
                                 <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">فرص التحسين:</h5>
                                 <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                                     ${opportunitiesHtml}
                                 </ul>
                             </div>
                         `;
                         
                         document.getElementById('readinessModal').classList.remove('hidden');
                     }
                     
                     /**
                      * Close readiness modal
                      */
                     closeReadinessModal() {
                         document.getElementById('readinessModal').classList.add('hidden');
                     }
                     
                     /**
                      * Toggle charts visibility
                      */
                     toggleCharts() {
                         const chartContainers = document.querySelectorAll('.chart-container');
                         if (this.calendar.settings.showCharts) {
                             chartContainers.forEach(container => {
                                 container.classList.remove('hidden');
                             });
                         } else {
                             chartContainers.forEach(container => {
                                 container.classList.add('hidden');
                             });
                         }
                     }
                     
                     /**
                      * Show saved message with fade out
                      */
                     showSavedMessage() {
                         const savedMessage = document.getElementById('savedMessage');
                         savedMessage.classList.remove('hidden', 'fade-out');
                         savedMessage.classList.add('flex');
                         
                         // Force reflow to restart animation
                         void savedMessage.offsetWidth;
                         
                         savedMessage.classList.add('fade-out');
                         
                         setTimeout(() => {
                             savedMessage.classList.remove('flex');
                             savedMessage.classList.add('hidden');
                         }, 2000);
                     }
                 }
                 
                 /**
                  * DataController Class - Handles data persistence
                  */
                 class DataController {
                     constructor(calendar) {
                         this.calendar = calendar;
                     }
                     
                     /**
                     * Load data from localStorage
                     */
                    loadData() {
                        // Load posts
                        const savedPosts = localStorage.getItem('content_calendar_posts');
                        if (savedPosts) {
                            try {
                                this.calendar.posts = JSON.parse(savedPosts);
                            } catch (e) {
                                console.error('Error loading posts from localStorage', e);
                                this.calendar.posts = [];
                            }
                        }
                        
                        // Load settings
                        const savedSettings = localStorage.getItem('content_calendar_settings');
                        if (savedSettings) {
                            try {
                                const settings = JSON.parse(savedSettings);
                                this.calendar.settings = { ...this.calendar.settings, ...settings };
                            } catch (e) {
                                console.error('Error loading settings from localStorage', e);
                            }
                        }
                        
                        // Update UI based on loaded settings
                        this.calendar.ui.applyTheme();
                        document.getElementById('adjacentMonthsToggle').checked = this.calendar.settings.showAdjacentMonths;
                        document.getElementById('showChartsToggle').checked = this.calendar.settings.showCharts;
                        document.getElementById('postViewStyle').value = this.calendar.settings.postViewStyle;
                        document.getElementById('firstDayOfWeek').value = this.calendar.settings.firstDayOfWeek;
                    }
                    
                    /**
                     * Save posts to localStorage
                     */
                    savePosts() {
                        try {
                            localStorage.setItem('content_calendar_posts', JSON.stringify(this.calendar.posts));
                        } catch (e) {
                            console.error('Error saving posts to localStorage', e);
                            alert('حدث خطأ أثناء حفظ المنشورات. قد تكون مساحة التخزين المحلي ممتلئة.');
                        }
                    }
                    
                    /**
                     * Save settings to localStorage
                     */
                    saveSettings() {
                        try {
                            localStorage.setItem('content_calendar_settings', JSON.stringify(this.calendar.settings));
                        } catch (e) {
                            console.error('Error saving settings to localStorage', e);
                        }
                    }
                    
                    /**
                     * Export data as JSON file
                     */
                    exportData() {
                        const data = {
                            posts: this.calendar.posts,
                            settings: this.calendar.settings,
                            exportDate: new Date().toISOString()
                        };
                        
                        const dataStr = JSON.stringify(data, null, 2);
                        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                        
                        const exportFileName = `content_calendar_export_${new Date().toISOString().slice(0, 10)}.json`;
                        
                        const linkElement = document.createElement('a');
                        linkElement.setAttribute('href', dataUri);
                        linkElement.setAttribute('download', exportFileName);
                        linkElement.click();
                    }
                    
                    /**
                     * Import data from JSON file
                     * @param {File} file The JSON file to import
                     */
                    importData(file) {
                        if (!file) return;
                        
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            try {
                                const data = JSON.parse(e.target.result);
                                
                                if (!data.posts || !Array.isArray(data.posts)) {
                                    throw new Error('Invalid data format: posts array not found');
                                }
                                
                                // Get import option
                                const importOption = document.querySelector('input[name="importOption"]:checked').value;
                                
                                if (importOption === 'replace') {
                                    // Replace all data
                                    this.calendar.posts = data.posts;
                                } else {
                                    // Merge with existing data
                                    // First, create a map of existing posts by ID for quick lookup
                                    const existingPostsMap = new Map();
                                    this.calendar.posts.forEach(post => {
                                        existingPostsMap.set(post.id, post);
                                    });
                                    
                                    // Merge in new posts, overwriting existing ones with same ID
                                    data.posts.forEach(post => {
                                        existingPostsMap.set(post.id, post);
                                    });
                                    
                                    // Convert map back to array
                                    this.calendar.posts = Array.from(existingPostsMap.values());
                                }
                                
                                // Import settings if available
                                if (data.settings) {
                                    this.calendar.settings = { ...this.calendar.settings, ...data.settings };
                                    this.calendar.ui.applyTheme();
                                }
                                
                                // Save to localStorage
                                this.savePosts();
                                this.saveSettings();
                                
                                // Re-render calendar
                                this.calendar.renderCalendar();
                                
                                // Show success message
                                alert('تم استيراد البيانات بنجاح!');
                            } catch (e) {
                                console.error('Error importing data', e);
                                alert('حدث خطأ أثناء استيراد البيانات. تأكد من أن الملف بالتنسيق الصحيح.');
                            }
                        };
                        
                        reader.readAsText(file);
                    }
                    
                    /**
                     * Clear all data
                     */
                    clearData() {
                        this.calendar.posts = [];
                        this.savePosts();
                        this.calendar.renderCalendar();
                        this.calendar.ui.showSavedMessage();
                    }
                }
                
                /**
                 * Analytics Class - Handles analytics and charts
                 */
                class Analytics {
                    constructor(calendar) {
                        this.calendar = calendar;
                        this.chartColors = {
                            platforms: [
                                'rgba(0, 136, 204, 0.8)',  // Telegram
                                'rgba(29, 161, 242, 0.8)',  // Twitter
                                'rgba(225, 48, 108, 0.8)',  // Instagram
                                'rgba(255, 0, 0, 0.8)',     // YouTube
                                'rgba(66, 103, 178, 0.8)',  // Facebook
                                'rgba(0, 0, 0, 0.8)',       // TikTok
                                'rgba(0, 119, 181, 0.8)'    // LinkedIn
                            ],
                            contentTypes: [
                                'rgba(59, 130, 246, 0.8)',  // Image
                                'rgba(239, 68, 68, 0.8)',   // Video
                                'rgba(16, 185, 129, 0.8)',  // Text
                                'rgba(245, 158, 11, 0.8)'   // Link
                            ],
                            categories: [
                                'rgba(59, 130, 246, 0.8)',   // Educational
                                'rgba(245, 158, 11, 0.8)',   // Motivational
                                'rgba(16, 185, 129, 0.8)',   // Entertainment
                                'rgba(239, 68, 68, 0.8)',    // Ad
                                'rgba(139, 92, 246, 0.8)',   // Challenge
                                'rgba(79, 70, 229, 0.8)'     // Quote
                            ]
                        };
                    }
                    
                    /**
                     * Update all charts
                     */
                    updateCharts() {
                        this.updatePlatformDistributionChart();
                        this.updateContentTypeDistributionChart();
                        this.updateCategoryDistributionChart();
                        this.updateDailyDistributionChart();
                        this.updateWeeklyDistributionChart();
                    }
                    
                    /**
                     * Update platform distribution chart
                     */
                    updatePlatformDistributionChart() {
                        const platformCounts = {
                            telegram: 0,
                            twitter: 0,
                            instagram: 0,
                            youtube: 0,
                            facebook: 0,
                            tiktok: 0,
                            linkedin: 0
                        };
                        
                        // Count posts by platform
                        this.calendar.posts.forEach(post => {
                            if (platformCounts.hasOwnProperty(post.platform)) {
                                platformCounts[post.platform]++;
                            }
                        });
                        
                        // Prepare data for chart
                        const labels = {
                            telegram: 'تيليجرام',
                            twitter: 'تويتر',
                            instagram: 'إنستغرام',
                            youtube: 'يوتيوب',
                            facebook: 'فيسبوك',
                            tiktok: 'تيك توك',
                            linkedin: 'لينكد إن'
                        };
                        
                        const chartData = {
                            labels: Object.keys(platformCounts).map(key => labels[key]),
                            datasets: [{
                                data: Object.values(platformCounts),
                                backgroundColor: this.chartColors.platforms
                            }]
                        };
                        
                        // Create or update chart
                        const ctx = document.getElementById('platformChart').getContext('2d');
                        
                        if (this.calendar.charts.platformChart) {
                            this.calendar.charts.platformChart.data = chartData;
                            this.calendar.charts.platformChart.update();
                        } else {
                            this.calendar.charts.platformChart = new Chart(ctx, {
                                type: 'doughnut',
                                data: chartData,
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: {
                                                font: {
                                                    family: 'Tajawal, sans-serif'
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                    
                    /**
                     * Update content type distribution chart
                     */
                    updateContentTypeDistributionChart() {
                        const contentTypeCounts = {
                            image: 0,
                            video: 0,
                            text: 0,
                            link: 0
                        };
                        
                        // Count posts by content type
                        this.calendar.posts.forEach(post => {
                            if (contentTypeCounts.hasOwnProperty(post.contentType)) {
                                contentTypeCounts[post.contentType]++;
                            }
                        });
                        
                        // Prepare data for chart
                        const labels = {
                            image: 'صورة',
                            video: 'فيديو',
                            text: 'نص',
                            link: 'رابط'
                        };
                        
                        const chartData = {
                            labels: Object.keys(contentTypeCounts).map(key => labels[key]),
                            datasets: [{
                                data: Object.values(contentTypeCounts),
                                backgroundColor: this.chartColors.contentTypes
                            }]
                        };
                        
                        // Create or update chart
                        const ctx = document.getElementById('contentTypeChart').getContext('2d');
                        
                        if (this.calendar.charts.contentTypeChart) {
                            this.calendar.charts.contentTypeChart.data = chartData;
                            this.calendar.charts.contentTypeChart.update();
                        } else {
                            this.calendar.charts.contentTypeChart = new Chart(ctx, {
                                type: 'pie',
                                data: chartData,
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: {
                                                font: {
                                                    family: 'Tajawal, sans-serif'
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                    
                    /**
                     * Update category distribution chart
                     */
                    updateCategoryDistributionChart() {
                        const categoryCounts = {
                            educational: 0,
                            motivational: 0,
                            entertainment: 0,
                            ad: 0,
                            challenge: 0,
                            quote: 0
                        };
                        
                        // Count posts by category
                        this.calendar.posts.forEach(post => {
                            if (categoryCounts.hasOwnProperty(post.category)) {
                                categoryCounts[post.category]++;
                            }
                        });
                        
                        // Prepare data for chart
                        const labels = {
                            educational: 'تعليمي',
                            motivational: 'تحفيزي',
                            entertainment: 'ترفيهي',
                            ad: 'إعلان',
                            challenge: 'تحدي',
                            quote: 'اقتباس'
                        };
                        
                        const chartData = {
                            labels: Object.keys(categoryCounts).map(key => labels[key]),
                            datasets: [{
                                data: Object.values(categoryCounts),
                                backgroundColor: this.chartColors.categories
                            }]
                        };
                        
                        // Create or update chart
                        const ctx = document.getElementById('categoryChart').getContext('2d');
                        
                        if (this.calendar.charts.categoryChart) {
                            this.calendar.charts.categoryChart.data = chartData;
                            this.calendar.charts.categoryChart.update();
                        } else {
                            this.calendar.charts.categoryChart = new Chart(ctx, {
                                type: 'pie',
                                data: chartData,
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: {
                                                font: {
                                                    family: 'Tajawal, sans-serif'
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                    
                    /**
                     * Update daily distribution chart
                     */
                    updateDailyDistributionChart() {
                        const dailyCounts = Array(31).fill(0);
                        
                        // Count posts by day of month
                        this.calendar.posts.forEach(post => {
                            const day = parseInt(post.date.split('-')[2]);
                            if (!isNaN(day) && day >= 1 && day <= 31) {
                                dailyCounts[day - 1]++;
                            }
                        });
                        
                        // Prepare data for chart
                        const chartData = {
                            labels: Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
                            datasets: [{
                                label: 'المنشورات في اليوم',
                                data: dailyCounts,
                                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                                borderColor: 'rgba(139, 92, 246, 1)',
                                borderWidth: 1
                            }]
                        };
                        
                        // Create or update chart
                        const ctx = document.getElementById('dailyDistributionChart').getContext('2d');
                        
                        if (this.calendar.charts.dailyDistributionChart) {
                            this.calendar.charts.dailyDistributionChart.data = chartData;
                            this.calendar.charts.dailyDistributionChart.update();
                        } else {
                            this.calendar.charts.dailyDistributionChart = new Chart(ctx, {
                                type: 'bar',
                                data: chartData,
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                precision: 0
                                            }
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    }
                                }
                            });
                        }
                    }
                    
                    /**
                    * Update weekly distribution chart
                    */
                   updateWeeklyDistributionChart() {
                       const weeklyCounts = {
                           sunday: 0,
                           monday: 0,
                           tuesday: 0,
                           wednesday: 0,
                           thursday: 0,
                           friday: 0,
                           saturday: 0
                       };
                       
                       // Count posts by day of week
                       this.calendar.posts.forEach(post => {
                           const date = new Date(post.date);
                           const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
                           
                           const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                           const day = dayNames[dayOfWeek];
                           
                           if (weeklyCounts.hasOwnProperty(day)) {
                               weeklyCounts[day]++;
                           }
                       });
                       
                       // Prepare data for chart
                       const labels = {
                           sunday: 'الأحد',
                           monday: 'الاثنين',
                           tuesday: 'الثلاثاء',
                           wednesday: 'الأربعاء',
                           thursday: 'الخميس',
                           friday: 'الجمعة',
                           saturday: 'السبت'
                       };
                       
                       const chartData = {
                           labels: Object.keys(weeklyCounts).map(key => labels[key]),
                           datasets: [{
                               label: 'المنشورات في اليوم',
                               data: Object.values(weeklyCounts),
                               backgroundColor: 'rgba(79, 70, 229, 0.5)',
                               borderColor: 'rgba(79, 70, 229, 1)',
                               borderWidth: 1
                           }]
                       };
                       
                       // Create or update chart
                       const ctx = document.getElementById('weeklyDistributionChart').getContext('2d');
                       
                       if (this.calendar.charts.weeklyDistributionChart) {
                           this.calendar.charts.weeklyDistributionChart.data = chartData;
                           this.calendar.charts.weeklyDistributionChart.update();
                       } else {
                           this.calendar.charts.weeklyDistributionChart = new Chart(ctx, {
                               type: 'bar',
                               data: chartData,
                               options: {
                                   responsive: true,
                                   maintainAspectRatio: false,
                                   scales: {
                                       y: {
                                           beginAtZero: true,
                                           ticks: {
                                               precision: 0
                                           }
                                       }
                                   },
                                   plugins: {
                                       legend: {
                                           display: false
                                       }
                                   }
                               }
                           });
                       }
                   }
                   
                   /**
                    * Generate readiness report for content plan
                    * @returns {Object} Readiness report with score, message, strengths, and opportunities
                    */
                   generateReadinessReport() {
                       const report = {
                           score: 0,
                           message: '',
                           strengths: [],
                           opportunities: []
                       };
                       
                       // Count total posts
                       const totalPosts = this.calendar.posts.length;
                       if (totalPosts === 0) {
                           report.score = 0;
                           report.message = 'لم يتم إضافة أي منشورات بعد';
                           report.opportunities.push('ابدأ بإضافة بعض المنشورات إلى التقويم');
                           return report;
                       }
                       
                       // Analyze platform distribution
                       const platformCounts = {};
                       this.calendar.posts.forEach(post => {
                           platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1;
                       });
                       
                       const platforms = Object.keys(platformCounts);
                       const platformPercentages = platforms.map(platform => platformCounts[platform] / totalPosts * 100);
                       
                       // Check platform balance
                       if (platforms.length >= 3) {
                           report.strengths.push('تنوع جيد في المنصات المستخدمة');
                           report.score += 15;
                       } else {
                           report.opportunities.push('يمكنك استخدام المزيد من المنصات لزيادة الوصول');
                       }
                       
                       // Find dominant platform
                       const dominantPlatform = platforms.reduce((a, b) => 
                           platformCounts[a] > platformCounts[b] ? a : b, platforms[0]);
                       
                       const dominantPlatformPercentage = (platformCounts[dominantPlatform] / totalPosts * 100).toFixed(0);
                       
                       if (dominantPlatformPercentage > 70) {
                           report.opportunities.push(`${dominantPlatformPercentage}% من منشوراتك على ${this.calendar.getCategoryName(dominantPlatform)}. حاول توزيع المحتوى بشكل أكثر توازناً`);
                       } else if (platformPercentages.every(percentage => percentage < 50)) {
                           report.strengths.push('توزيع متوازن للمحتوى عبر المنصات المختلفة');
                           report.score += 10;
                       }
                       
                       // Analyze content type distribution
                       const contentTypeCounts = {};
                       this.calendar.posts.forEach(post => {
                           contentTypeCounts[post.contentType] = (contentTypeCounts[post.contentType] || 0) + 1;
                       });
                       
                       const contentTypes = Object.keys(contentTypeCounts);
                       
                       // Check content type balance
                       if (contentTypes.length >= 3) {
                           report.strengths.push('تنوع جيد في أنواع المحتوى');
                           report.score += 15;
                       } else {
                           report.opportunities.push('جرب أنواعاً مختلفة من المحتوى لجذب المزيد من الجمهور');
                       }
                       
                       // Check for video content
                       if (!contentTypeCounts.video || contentTypeCounts.video / totalPosts < 0.15) {
                           report.opportunities.push('زيادة محتوى الفيديو قد يساعد في زيادة التفاعل');
                       } else {
                           report.strengths.push('نسبة جيدة من محتوى الفيديو');
                           report.score += 10;
                       }
                       
                       // Analyze category distribution
                       const categoryCounts = {};
                       this.calendar.posts.forEach(post => {
                           categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
                       });
                       
                       const categories = Object.keys(categoryCounts);
                       
                       // Check category balance
                       if (categories.length >= 4) {
                           report.strengths.push('تنوع ممتاز في تصنيفات المحتوى');
                           report.score += 15;
                       } else if (categories.length >= 2) {
                           report.strengths.push('تنوع جيد في تصنيفات المحتوى');
                           report.score += 10;
                       } else {
                           report.opportunities.push('حاول تنويع تصنيفات المحتوى لجذب اهتمامات مختلفة');
                       }
                       
                       // Check educational vs entertainment balance
                       const educationalCount = categoryCounts.educational || 0;
                       const entertainmentCount = categoryCounts.entertainment || 0;
                       
                       if (educationalCount > 0 && entertainmentCount > 0) {
                           report.strengths.push('مزيج جيد من المحتوى التعليمي والترفيهي');
                           report.score += 10;
                       } else {
                           report.opportunities.push('حاول الموازنة بين المحتوى التعليمي والترفيهي');
                       }
                       
                       // Analyze weekly distribution
                       const weekdayCounts = Array(7).fill(0);
                       
                       this.calendar.posts.forEach(post => {
                           const date = new Date(post.date);
                           const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
                           weekdayCounts[dayOfWeek]++;
                       });
                       
                       // Check posting consistency
                       const daysWithPosts = weekdayCounts.filter(count => count > 0).length;
                       
                       if (daysWithPosts >= 5) {
                           report.strengths.push('تغطية ممتازة لأيام الأسبوع');
                           report.score += 15;
                       } else if (daysWithPosts >= 3) {
                           report.strengths.push('تغطية جيدة لأيام الأسبوع');
                           report.score += 10;
                       } else {
                           report.opportunities.push('حاول توزيع المنشورات على المزيد من أيام الأسبوع');
                       }
                       
                       // Check for very high or low days
                       const maxDayPosts = Math.max(...weekdayCounts);
                       const minDayPosts = Math.min(...weekdayCounts.filter(count => count > 0));
                       
                       if (maxDayPosts > minDayPosts * 3) {
                           report.opportunities.push('بعض الأيام تحتوي على منشورات أكثر بكثير من أيام أخرى. حاول تحقيق توازن أفضل');
                       }
                       
                       // Finalize score and message
                       // Cap score at 100
                       report.score = Math.min(Math.round(report.score), 100);
                       
                       if (report.score >= 85) {
                           report.message = 'خطة محتوى متوازنة بشكل ممتاز';
                       } else if (report.score >= 70) {
                           report.message = 'خطة محتوى متوازنة بشكل جيد';
                       } else if (report.score >= 50) {
                           report.message = 'خطة محتوى متوسطة التوازن';
                       } else {
                           report.message = 'خطة المحتوى بحاجة إلى تحسين';
                       }
                       
                       // Ensure there's always at least one strength and opportunity
                       if (report.strengths.length === 0) {
                           report.strengths.push('لديك بداية جيدة في خطة المحتوى');
                       }
                       if (report.opportunities.length === 0) {
                           report.opportunities.push('استمر في تجربة أنواع وتصنيفات مختلفة من المحتوى');
                       }
                       
                       return report;
                   }
               }
               
               // Initialize the content calendar when the DOM is loaded
               document.addEventListener('DOMContentLoaded', () => {
                   window.contentCalendar = new ContentCalendar();
               });
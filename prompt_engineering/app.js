// ملف JavaScript للتفاعلات
document.addEventListener('DOMContentLoaded', function() {
    // متغيرات عامة
    let currentPromptText = '';
    let originalPromptText = '';
    const cardsContainer = document.getElementById('cards-container');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const promptText = document.getElementById('prompt-text');
    const resetButton = document.getElementById('reset-button');
    const copyButton = document.getElementById('copy-button');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const promptModal = document.getElementById('promptModal');
    const closeModal = document.getElementById('closeModal');
    const promptCount = document.getElementById('prompt-count');
    const noResults = document.getElementById('no-results');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const categoryFilters = document.getElementById('category-filters');
    const currentYearElement = document.getElementById('currentYear');

    // تعيين السنة الحالية في التذييل
    currentYearElement.textContent = new Date().getFullYear();

    // إنشاء فقاعات الخلفية
    createBubbles();

    // إنشاء فلاتر الفئات ديناميكيًا
    createCategoryFilters();

    // تبديل وضع الظلام
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // التحقق من وضع الظلام المفضل
    if (localStorage.getItem('darkMode') === 'true' || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && localStorage.getItem('darkMode') !== 'false')) {
        document.body.classList.add('dark');
    }

    // إنشاء البطاقات من البيانات
    function renderCards(prompts) {
        cardsContainer.innerHTML = '';
        
        if (prompts.length === 0) {
            noResults.classList.remove('hidden');
            promptCount.textContent = '0';
            return;
        }
        
        noResults.classList.add('hidden');
        promptCount.textContent = prompts.length;
        
        prompts.forEach(prompt => {
            const card = document.createElement('div');
            card.innerHTML = `
                <div class="glass-container card-hover p-4 h-full prompt-card" data-id="${prompt.id}">
                    <div class="font-bold text-lg mb-2 text-gray-800 dark:text-white">
                        ${prompt.title}
                    </div>
                    <p class="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                        ${prompt.description}
                    </p>
                    <div class="flex justify-between items-center mb-4">
                        <span class="framework-badge">${prompt.framework}</span>
                        <span class="framework-badge">${prompt.category}</span>
                    </div>
                    <button class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 view-prompt-btn">
                        عرض الأمر
                    </button>
                </div>
            `;
            cardsContainer.appendChild(card);
        });

        // إضافة مستمعي الأحداث للبطاقات
        addCardEventListeners();
    }

    // إضافة مستمعي الأحداث للبطاقات
    function addCardEventListeners() {
        const viewPromptButtons = document.querySelectorAll('.view-prompt-btn');
        viewPromptButtons.forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.prompt-card');
                const promptId = card.getAttribute('data-id');
                openPromptModal(promptId);
            });
        });
    }

    // فتح النافذة المنبثقة مع تفاصيل الأمر
    function openPromptModal(promptId) {
        const prompt = promptsData.find(p => p.id === parseInt(promptId));
        if (prompt) {
            document.getElementById('promptModalLabel').textContent = prompt.title;
            originalPromptText = prompt.text;
            currentPromptText = prompt.text;
            promptText.value = currentPromptText;
            promptModal.classList.add('show');
        }
    }

    // إغلاق النافذة المنبثقة
    closeModal.addEventListener('click', function() {
        promptModal.classList.remove('show');
    });

    // إغلاق النافذة المنبثقة عند النقر خارجها
    window.addEventListener('click', function(event) {
        if (event.target === promptModal) {
            promptModal.classList.remove('show');
        }
    });

    // البحث في الأوامر
    function searchPrompts(query) {
        query = query.toLowerCase().trim();
        if (query === '') {
            return promptsData;
        }
        
        return promptsData.filter(prompt => 
            prompt.title.toLowerCase().includes(query) || 
            prompt.description.toLowerCase().includes(query) || 
            prompt.framework.toLowerCase().includes(query) || 
            prompt.category.toLowerCase().includes(query) ||
            prompt.text.toLowerCase().includes(query)
        );
    }

    // تصفية الأوامر حسب الإطار
    function filterPromptsByFramework(framework) {
        if (framework === 'all') {
            return promptsData;
        }
        
        return promptsData.filter(prompt => prompt.framework === framework);
    }

    // تصفية الأوامر حسب الفئة
    function filterPromptsByCategory(category) {
        if (category === 'all') {
            return promptsData;
        }
        
        return promptsData.filter(prompt => prompt.category === category);
    }

    // إنشاء فلاتر الفئات ديناميكيًا
    function createCategoryFilters() {
        // استخراج الفئات الفريدة
        const categories = [...new Set(promptsData.map(prompt => prompt.category))];
        
        // إنشاء زر "جميع الفئات"
        const allCategoriesItem = document.createElement('li');
        allCategoriesItem.innerHTML = `
            <button data-category="all" class="nav-link category-btn active w-full text-right">
                <i class="fas fa-layer-group ml-2"></i>
                جميع الفئات
            </button>
        `;
        categoryFilters.appendChild(allCategoriesItem);
        
        // إنشاء زر لكل فئة
        categories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <button data-category="${category}" class="nav-link category-btn w-full text-right">
                    <i class="fas fa-tag ml-2"></i>
                    ${category}
                </button>
            `;
            categoryFilters.appendChild(listItem);
        });
        
        // إضافة مستمعي الأحداث لأزرار الفئات
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع أزرار الفئات
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                // إضافة الفئة النشطة للزر المحدد
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                const filteredPrompts = filterPromptsByCategory(category);
                renderCards(filteredPrompts);
            });
        });
    }

    // إنشاء فقاعات الخلفية
    function createBubbles() {
        const bubblesContainer = document.getElementById('bubbles-container');
        const bubbleCount = 15;
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            // حجم عشوائي
            const size = Math.random() * 100 + 50;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            // موقع عشوائي
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            bubble.style.left = `${posX}%`;
            bubble.style.top = `${posY}%`;
            
            // تأخير عشوائي للحركة
            bubble.style.animationDelay = `${Math.random() * 5}s`;
            
            bubblesContainer.appendChild(bubble);
        }
    }

    // تبديل وضع الظلام
    function toggleDarkMode() {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    }

    // مستمعي الأحداث
    searchButton.addEventListener('click', function() {
        const query = searchInput.value;
        const filteredPrompts = searchPrompts(query);
        renderCards(filteredPrompts);
    });

    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            const query = searchInput.value;
            const filteredPrompts = searchPrompts(query);
            renderCards(filteredPrompts);
        }
    });

    resetButton.addEventListener('click', function() {
        promptText.value = originalPromptText;
        currentPromptText = originalPromptText;
    });

    copyButton.addEventListener('click', function() {
        promptText.select();
        document.execCommand('copy');
        
        // تغيير نص الزر مؤقتًا للإشارة إلى نجاح النسخ
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fas fa-check ml-2"></i> تم النسخ';
        setTimeout(() => {
            copyButton.innerHTML = originalText;
        }, 2000);
    });

    promptText.addEventListener('input', function() {
        currentPromptText = this.value;
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // إضافة الفئة النشطة للزر المحدد
            this.classList.add('active');
            
            const framework = this.getAttribute('data-filter');
            const filteredPrompts = filterPromptsByFramework(framework);
            renderCards(filteredPrompts);
        });
    });

    // عرض جميع البطاقات عند تحميل الصفحة
    renderCards(promptsData);
});
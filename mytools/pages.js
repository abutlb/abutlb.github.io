// ================================================
// ================= تعريف الأقسام ================
// ================================================
const categories = [
    { id: 'data',        label: 'أدوات البيانات',    icon: 'fa-database',   gradient: 'from-blue-600 to-green-600',  navColor: 'text-blue-600'   },
    { id: 'calculators', label: 'الحاسبات والأدوات', icon: 'fa-calculator', gradient: 'from-blue-600 to-purple-600', navColor: 'text-purple-600' },
    { id: 'planning',    label: 'أدوات التخطيط',     icon: 'fa-tasks',      gradient: 'from-purple-600 to-pink-600', navColor: 'text-pink-600'   },
    { id: 'design',      label: 'أدوات التصميم',     icon: 'fa-palette',    gradient: 'from-pink-600 to-orange-600', navColor: 'text-orange-600' },
    { id: 'utility',     label: 'أدوات متنوعة',      icon: 'fa-tools',      gradient: 'from-blue-600 to-indigo-600', navColor: 'text-indigo-600' },
    { id: 'privacy',     label: 'الخصوصية والأمان',  icon: 'fa-shield-alt', gradient: 'from-red-600 to-pink-600',   navColor: 'text-red-600'    },
];

// ================================================
// ================== بناء الـ UI =================
// ================================================
function buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = '';

    categories.forEach((cat, i) => {
        const count = toolsPages.filter(p => p.category === cat.id && p.status === 'published').length;
        if (count === 0) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#${cat.id}" class="nav-link ${i === 0 ? 'active' : ''} flex items-center justify-between gap-2">
                <span><i class="fas ${cat.icon} ml-2 ${cat.navColor}"></i>${cat.label}</span>
                <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">${count}</span>
            </a>`;
        nav.appendChild(li);
    });
}

function buildCard(page) {
    const levelColors = {
        'مبتدئ': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        'متوسط': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        'متقدم': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };

    const card = document.createElement('a');
    card.href = `${page.slug}/index.html`;
    card.className = 'bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md card-hover block';
    card.innerHTML = `
        <div class="h-40 bg-gradient-to-r ${page.color} flex items-center justify-center relative">
            <i class="fas ${page.icon} text-white text-5xl"></i>
            <span class="absolute top-3 left-3 text-xs px-2 py-1 rounded-full ${levelColors[page.level] || 'bg-white/20 text-white'} backdrop-blur-sm font-medium">
                ${page.level || ''}
            </span>
        </div>
        <div class="p-5">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-1">${page.title}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">${page.desc}</p>
        </div>`;
    return card;
}

function buildSections() {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = '';

    categories.forEach(cat => {
        const catPages = toolsPages.filter(p => p.category === cat.id && p.status === 'published');
        if (catPages.length === 0) return;

        const section = document.createElement('section');
        section.id = cat.id;
        section.className = 'mb-16';

        const heading = document.createElement('h2');
        heading.className = `text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${cat.gradient} section-title`;
        heading.innerHTML = `<i class="fas ${cat.icon} ml-2"></i>${cat.label}`;
        section.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';
        catPages.forEach(p => grid.appendChild(buildCard(p)));

        section.appendChild(grid);
        main.appendChild(section);
    });
}

// ================================================
// ================= Dark Mode ====================
// ================================================
function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    document.body.classList.toggle('dark-mode', dark);
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.innerHTML = dark
            ? '<i class="fas fa-sun text-yellow-300 text-xl"></i>'
            : '<i class="fas fa-moon text-gray-600 text-xl"></i>';
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}

const prefersDark =
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

applyTheme(prefersDark);

const darkToggle = document.getElementById('darkModeToggle');
if (darkToggle) {
    darkToggle.addEventListener('click', () =>
        applyTheme(!document.documentElement.classList.contains('dark'))
    );
}

// ================================================
// ================= Scrollspy ====================
// ================================================
window.addEventListener('scroll', () => {
    const allSections = document.querySelectorAll('section[id]');
    const allLinks    = document.querySelectorAll('.nav-link');
    let current = '';
    allSections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    allLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
});

// ================================================
// ================== Bubbles =====================
// ================================================
const bubblesContainer = document.getElementById('bubbles-container');
if (bubblesContainer) {
    for (let i = 0; i < 15; i++) {
        const b = document.createElement('div');
        b.className = 'bubble';
        const size = Math.random() * 150 + 50;
        b.style.cssText = `
            width:${size}px; height:${size}px;
            left:${Math.random() * 100}%;
            top:${Math.random() * 100}%;
            animation-delay:${Math.random() * 8}s;
            opacity:${Math.random() * 0.4 + 0.05};`;
        bubblesContainer.appendChild(b);
    }
}

// ================================================
// ==================== Init ======================
// ================================================
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

buildSidebar();
buildSections();

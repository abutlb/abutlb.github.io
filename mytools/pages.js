// ── التصنيفات ──────────────────────────────────────────────────
const categories = [
    { id: 'data',        label: 'أدوات البيانات',    icon: 'fa-database',   gradient: 'from-blue-600 to-green-500',   navColor: 'text-blue-500'   },
    { id: 'calculators', label: 'الحاسبات',           icon: 'fa-calculator', gradient: 'from-purple-600 to-blue-500',  navColor: 'text-purple-500' },
    { id: 'planning',    label: 'أدوات التخطيط',     icon: 'fa-tasks',      gradient: 'from-pink-600 to-purple-500',  navColor: 'text-pink-500'   },
    { id: 'design',      label: 'أدوات التصميم',     icon: 'fa-palette',    gradient: 'from-orange-500 to-pink-500',  navColor: 'text-orange-500' },
    { id: 'utility',     label: 'أدوات متنوعة',      icon: 'fa-tools',      gradient: 'from-indigo-600 to-blue-500',  navColor: 'text-indigo-500' },
    { id: 'privacy',     label: 'الخصوصية والأمان',  icon: 'fa-shield-alt', gradient: 'from-red-600 to-pink-500',    navColor: 'text-red-500'    },
];

// ── Sidebar ────────────────────────────────────────────────────
function buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = '';

    categories.forEach((cat, i) => {
        const count = toolsPages.filter(p => p.category === cat.id && p.status === 'published').length;
        if (count === 0) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#${cat.id}" class="cat-link ${i === 0 ? 'active' : ''}">
                <span class="flex items-center gap-2 truncate">
                    <i class="fas ${cat.icon} w-4 text-center ${cat.navColor} flex-shrink-0"></i>
                    <span class="truncate">${cat.label}</span>
                </span>
                <span class="text-xs bg-gray-100 dark:bg-gray-800 text-gray-400
                             dark:text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">${count}</span>
            </a>`;
        nav.appendChild(li);
    });
}

// ── Card ───────────────────────────────────────────────────────
function buildCard(page) {
    const levelStyle = {
        'مبتدئ': 'background:rgba(16,185,129,.18);color:#d1fae5;',
        'متوسط': 'background:rgba(245,158,11,.18);color:#fef3c7;',
        'متقدم': 'background:rgba(239,68,68,.18);color:#fee2e2;',
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper';
    wrapper.setAttribute('data-search', (page.title + ' ' + page.desc).toLowerCase());

    const card = document.createElement('a');
    card.href  = `${page.slug}/index.html`;
    card.className = 'tool-card group';
    card.innerHTML = `
        <div class="h-36 bg-gradient-to-br ${page.color} flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
            <i class="fas ${page.icon} text-white text-[3rem] relative z-10
                       drop-shadow-lg group-hover:scale-110 transition-transform duration-300"></i>
            ${page.level ? `
            <span class="absolute top-3 left-3 text-xs px-2.5 py-0.5 rounded-full font-semibold backdrop-blur-sm"
                  style="${levelStyle[page.level] || 'background:rgba(255,255,255,.2);color:white;'}">
                ${page.level}
            </span>` : ''}
        </div>
        <div class="p-5">
            <h3 class="text-base font-bold text-gray-800 dark:text-white mb-1.5
                       group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                ${page.title}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed clamp-2 mb-4">
                ${page.desc}
            </p>
            <div class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                <span>فتح الأداة</span>
                <i class="fas fa-arrow-left text-xs group-hover:-translate-x-1 transition-transform"></i>
            </div>
        </div>`;

    wrapper.appendChild(card);
    return wrapper;
}

// ── Sections ───────────────────────────────────────────────────
function buildSections() {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = '';

    categories.forEach(cat => {
        const catPages = toolsPages.filter(p => p.category === cat.id && p.status === 'published');
        if (catPages.length === 0) return;

        const section = document.createElement('section');
        section.id        = cat.id;
        section.className = 'mb-12 sec-anchor';

        const heading = document.createElement('div');
        heading.className = 'flex items-center gap-3 mb-5';
        heading.innerHTML = `
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br ${cat.gradient}
                        flex items-center justify-center flex-shrink-0 shadow-sm">
                <i class="fas ${cat.icon} text-white text-sm"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">${cat.label}</h2>
            <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800
                         px-2 py-0.5 rounded-full">${catPages.length} أداة</span>`;
        section.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-5';
        catPages.forEach(p => grid.appendChild(buildCard(p)));
        section.appendChild(grid);
        main.appendChild(section);
    });
}

// ── Stats ──────────────────────────────────────────────────────
function buildStats() {
    const bar = document.getElementById('statsBar');
    if (!bar) return;
    const total = toolsPages.filter(p => p.status === 'published').length;
    bar.innerHTML = `
        <div class="text-center">
            <div class="text-3xl font-extrabold leading-none">${total}</div>
            <div class="text-blue-200 text-xs mt-1.5">أداة مجانية</div>
        </div>
        <div class="w-px h-10 bg-white/20"></div>
        <div class="text-center">
            <div class="text-3xl font-extrabold leading-none">${categories.length}</div>
            <div class="text-blue-200 text-xs mt-1.5">تصنيف</div>
        </div>`;
}

// ── Search ─────────────────────────────────────────────────────
function initSearch() {
    const input    = document.getElementById('searchInput');
    const noResult = document.getElementById('no-results');
    if (!input) return;

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();

        let totalVisible = 0;
        document.querySelectorAll('.card-wrapper').forEach(w => {
            const match = !q || w.getAttribute('data-search').includes(q);
            w.style.display = match ? '' : 'none';
            if (match) totalVisible++;
        });

        // hide/show empty sections
        document.querySelectorAll('section[id]').forEach(sec => {
            const visible = [...sec.querySelectorAll('.card-wrapper')]
                .some(w => w.style.display !== 'none');
            sec.style.display = visible ? '' : 'none';
        });

        if (noResult) noResult.style.display = totalVisible === 0 ? 'block' : 'none';
    });
}

// ── Dark Mode ──────────────────────────────────────────────────
function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    const btn  = document.getElementById('darkModeToggle');
    if (btn) btn.innerHTML = dark
        ? '<i class="fas fa-sun text-yellow-300"></i>'
        : '<i class="fas fa-moon"></i>';

    const wave = document.querySelector('.wave-fill');
    if (wave) wave.setAttribute('fill', dark ? '#030712' : '#f8fafc');

    localStorage.setItem('theme', dark ? 'dark' : 'light');
}

const prefersDark =
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
applyTheme(prefersDark);

document.getElementById('darkModeToggle')?.addEventListener('click', () =>
    applyTheme(!document.documentElement.classList.contains('dark'))
);

// ── Scrollspy ──────────────────────────────────────────────────
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.cat-link');
    let current    = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    links.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
}, { passive: true });

// ── Init ───────────────────────────────────────────────────────
document.getElementById('currentYear').textContent = new Date().getFullYear();

buildStats();
buildSidebar();
buildSections();
initSearch();

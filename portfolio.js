// ===== Year =====
document.getElementById('currentYear').textContent = new Date().getFullYear();

// ===== Dark Mode =====
const toggle = document.getElementById('darkModeToggle');

function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    document.body.style.backgroundColor = dark ? '#0f172a' : '#f0f9ff';
    document.body.style.color = dark ? '#e2e8f0' : '';
    toggle.innerHTML = dark
        ? '<i class="fas fa-sun text-yellow-300 text-lg"></i>'
        : '<i class="fas fa-moon text-gray-600 text-lg"></i>';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}

const prefersDark =
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') &&
     window.matchMedia('(prefers-color-scheme: dark)').matches);

applyTheme(prefersDark);
toggle.addEventListener('click', () =>
    applyTheme(!document.documentElement.classList.contains('dark'))
);

// ===== Bubbles =====
(function createBubbles() {
    const container = document.getElementById('bubbles-container');
    for (let i = 0; i < 12; i++) {
        const b = document.createElement('div');
        b.className = 'bubble';
        const size = Math.random() * 140 + 40;
        b.style.cssText = `
            width:${size}px;
            height:${size}px;
            left:${Math.random() * 100}%;
            top:${Math.random() * 100}%;
            animation-delay:${Math.random() * 10}s;
            animation-duration:${8 + Math.random() * 6}s;
            opacity:${Math.random() * 0.25 + 0.04};
        `;
        container.appendChild(b);
    }
})();

// ===== Floating Font Awesome Icons =====
(function createFloatingIcons() {
    // كل أيقونة: [class, size-rem]
    const icons = [
        ['fa-python',        1.6],
        ['fa-database',      1.5],
        ['fa-chart-bar',     1.5],
        ['fa-code',          1.4],
        ['fa-cogs',          1.6],
        ['fa-chart-line',    1.5],
        ['fa-robot',         1.5],
        ['fa-table',         1.4],
        ['fa-chart-pie',     1.5],
        ['fa-lightbulb',     1.4],
        ['fa-calculator',    1.4],
        ['fa-file-alt',      1.4],
        ['fa-brain',         1.5],
        ['fa-project-diagram',1.4],
    ];

    const container = document.getElementById('floating-icons-container');
    const total = icons.length;

    icons.forEach(([iconClass, size], i) => {
        const el = document.createElement('i');
        el.className = `fas ${iconClass} floating-icon`;
        el.style.cssText = `
            left: ${(i / total) * 100 + (Math.random() * 5 - 2.5)}%;
            font-size: ${size}rem;
            animation-duration: ${14 + Math.random() * 10}s;
            animation-delay: ${Math.random() * 14}s;
        `;
        container.appendChild(el);
    });
})();

// ===== Scroll Fade =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-section').forEach(s => observer.observe(s));

// ===== Scrollspy =====
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(l => {
        l.classList.toggle('active',
            l.getAttribute('href') === '#' + current);
    });
});

// ===== عرض الأدوات =====
function renderPreview(pagesData, containerId, baseUrl) {
    const container = document.getElementById(containerId);
    if (!container || !pagesData || pagesData.length === 0) {
        if (container) container.innerHTML = '';
        return;
    }

    const latest = pagesData
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.updated) - new Date(a.updated))
        .slice(0, 4);

    if (latest.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '';

    latest.forEach(page => {
        const card = document.createElement('a');
        card.href = `${baseUrl}${page.slug}/index.html`;
        card.className = [
            'flex items-center gap-4 p-3 rounded-xl',
            'hover:bg-blue-50 dark:hover:bg-blue-900/20',
            'transition-colors group'
        ].join(' ');

        card.innerHTML = `
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${page.color}
                 flex items-center justify-center text-white text-xl
                 flex-shrink-0 group-hover:scale-110 transition-transform">
                <i class="fas ${page.icon}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-800 dark:text-white text-sm truncate">
                    ${page.title}
                </p>
                <p class="text-gray-500 dark:text-gray-400 text-xs truncate">
                    ${page.desc}
                </p>
            </div>
            <span class="text-xs bg-gray-100 dark:bg-gray-700
                  text-gray-500 dark:text-gray-400
                  px-2 py-1 rounded-full flex-shrink-0">
                ${page.level || ''}
            </span>
        `;
        container.appendChild(card);
    });
}

// ===== استدعاء مباشر — بدون fetch =====
renderPreview(typeof toolsPages  !== 'undefined' ? toolsPages  : [], 'tools-preview',  'mytools/');
renderPreview(typeof sheetsPages !== 'undefined' ? sheetsPages : [], 'sheets-preview', 'cheat_sheet/');
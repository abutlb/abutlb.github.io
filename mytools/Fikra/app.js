// =====================================================
//  FIKRA — app.js
// =====================================================

const STORAGE_KEY = 'fikra_project';

const SECTIONS = [
    { id: 1, label: 'المشكلة',  icon: 'fa-magnifying-glass' },
    { id: 2, label: 'الحل',     icon: 'fa-lightbulb'        },
    { id: 3, label: 'المميزات', icon: 'fa-star'             },
    { id: 4, label: 'المقاييس', icon: 'fa-chart-line'       },
    { id: 5, label: 'الجدول',   icon: 'fa-calendar'         },
    { id: 6, label: 'الربح',    icon: 'fa-dollar-sign'      },
    { id: 7, label: 'التقنية',  icon: 'fa-code'             },
    { id: 8, label: 'الملخص',   icon: 'fa-flag-checkered'   },
];

// ─────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────
let state = {
    projectName    : '',
    currentSection : 0,
    problem: {
        statement  : '',
        audience   : '',
        painPoints : [],
        marketSize : '',
    },
    solution: {
        statement       : '',
        valueProp       : '',
        approach        : '',
        differentiation : '',
        competitors     : [],
    },
    features : [],
    metrics: {
        goal            : '',
        kpis            : [],
        successCriteria : '',
    },
    timeline: {
        start  : '',
        launch : '',
        phases : [],
    },
    business: {
        model       : '',
        revenues    : [],
        price       : '',
        revenueGoal : '',
        notes       : '',
    },
    tech: {
        productType : '',
        stack       : [],
        challenges  : '',
    },
};


// ─────────────────────────────────────────────────────
//  STORAGE
// ─────────────────────────────────────────────────────
function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) {
        console.warn('localStorage full:', e);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);

        // ── scalars ──────────────────────────────────
        if (s.projectName)    state.projectName    = s.projectName;
        if (s.currentSection) state.currentSection = s.currentSection;

        // ── problem ───────────────────────────────────
        if (s.problem) {
            if (s.problem.statement)  state.problem.statement  = s.problem.statement;
            if (s.problem.audience)   state.problem.audience   = s.problem.audience;
            if (s.problem.marketSize) state.problem.marketSize = s.problem.marketSize;
            if (Array.isArray(s.problem.painPoints))
                state.problem.painPoints = s.problem.painPoints;
        }

        // ── solution ──────────────────────────────────
        if (s.solution) {
            if (s.solution.statement)       state.solution.statement       = s.solution.statement;
            if (s.solution.valueProp)       state.solution.valueProp       = s.solution.valueProp;
            if (s.solution.approach)        state.solution.approach        = s.solution.approach;
            if (s.solution.differentiation) state.solution.differentiation = s.solution.differentiation;
            if (Array.isArray(s.solution.competitors))
                state.solution.competitors = s.solution.competitors;
        }

        // ── features ──────────────────────────────────
        if (Array.isArray(s.features)) state.features = s.features;

        // ── metrics ───────────────────────────────────
        if (s.metrics) {
            if (s.metrics.goal)            state.metrics.goal            = s.metrics.goal;
            if (s.metrics.successCriteria) state.metrics.successCriteria = s.metrics.successCriteria;
            if (Array.isArray(s.metrics.kpis)) state.metrics.kpis        = s.metrics.kpis;
        }

        // ── timeline ──────────────────────────────────
        if (s.timeline) {
            if (s.timeline.start)  state.timeline.start  = s.timeline.start;
            if (s.timeline.launch) state.timeline.launch = s.timeline.launch;
            if (Array.isArray(s.timeline.phases)) state.timeline.phases = s.timeline.phases;
        }

        // ── business ──────────────────────────────────
        if (s.business) {
            if (s.business.model)       state.business.model       = s.business.model;
            if (s.business.price)       state.business.price       = s.business.price;
            if (s.business.revenueGoal) state.business.revenueGoal = s.business.revenueGoal;
            if (s.business.notes)       state.business.notes       = s.business.notes;
            if (Array.isArray(s.business.revenues)) state.business.revenues = s.business.revenues;
        }

        // ── tech ──────────────────────────────────────
        if (s.tech) {
            if (s.tech.productType) state.tech.productType = s.tech.productType;
            if (s.tech.challenges)  state.tech.challenges  = s.tech.challenges;
            if (Array.isArray(s.tech.stack)) state.tech.stack = s.tech.stack;
        }

    } catch(e) {
        console.warn('Failed to load state:', e);
    }
}

function clearState() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
}


// ─────────────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────────────
function showLanding() {
    document.getElementById('screen-landing').style.display = '';
    document.querySelectorAll('.section-page').forEach(el => el.classList.remove('active'));
    document.getElementById('step-bar').classList.add('hidden');
    document.getElementById('nav-footer').classList.add('hidden');
    document.getElementById('export-btn').classList.add('hidden');
    document.getElementById('new-project-btn').classList.add('hidden');
    document.getElementById('project-badge').classList.add('hidden');
    state.currentSection = 0;
}

function startProject() {
    const name = document.getElementById('landing-project-name').value.trim();
    if (!name) return;

    state.projectName    = name;
    state.currentSection = 1;
    saveState();

    document.getElementById('screen-landing').style.display = 'none';
    document.getElementById('step-bar').classList.remove('hidden');
    document.getElementById('nav-footer').classList.remove('hidden');
    document.getElementById('export-btn').classList.remove('hidden');
    document.getElementById('new-project-btn').classList.remove('hidden');

    const badge = document.getElementById('project-badge');
    badge.classList.remove('hidden');
    badge.classList.add('flex');
    document.getElementById('project-badge-name').textContent = name;

    buildStepBar();
    goToSection(1);
}

function goToSection(num) {
    document.querySelectorAll('.section-page').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(`section-${num}`);
    if (!target) return;
    target.classList.add('active');

    state.currentSection = num;
    saveState();

    updateStepBar();
    updateNavButtons();

    document.getElementById('step-counter').textContent = `${num} / 8`;

    if (num === 8) buildSummaryCard();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavButtons() {
    const back = document.getElementById('btn-back');
    const next = document.getElementById('btn-next');
    const s    = state.currentSection;

    back.disabled = s <= 1;

    if (s === 8) {
        next.innerHTML = `<i class="fas fa-check text-xs"></i> إنهاء`;
        next.classList.add('bg-green-500', 'hover:bg-green-600');
        next.classList.remove('bg-brand-500', 'hover:bg-brand-600');
    } else {
        next.innerHTML = `التالي <i class="fas fa-arrow-left text-xs"></i>`;
        next.classList.remove('bg-green-500', 'hover:bg-green-600');
        next.classList.add('bg-brand-500', 'hover:bg-brand-600');
    }
}


// ─────────────────────────────────────────────────────
//  STEP BAR
// ─────────────────────────────────────────────────────
function buildStepBar() {
    const track = document.getElementById('steps-track');
    track.innerHTML = '';

    SECTIONS.forEach((sec, idx) => {
        const wrap = document.createElement('div');
        wrap.className = 'flex flex-col items-center gap-1 cursor-pointer';
        wrap.dataset.section = sec.id;

        const dot = document.createElement('button');
        dot.className = 'step-dot w-7 h-7 rounded-full border-2 text-xs font-bold transition-all flex items-center justify-center';
        dot.textContent = sec.id;
        dot.title = sec.label;
        dot.addEventListener('click', () => goToSection(sec.id));

        const label = document.createElement('span');
        label.className = 'step-label text-[10px] font-semibold whitespace-nowrap';
        label.textContent = sec.label;

        wrap.appendChild(dot);
        wrap.appendChild(label);
        track.appendChild(wrap);

        if (idx < SECTIONS.length - 1) {
            const line = document.createElement('div');
            line.className = 'step-line h-0.5 flex-1 min-w-[8px] self-start mt-3.5 mx-0.5 rounded-full transition-all';
            line.dataset.after = sec.id;
            track.appendChild(line);
        }
    });

    updateStepBar();
}

function updateStepBar() {
    const cur = state.currentSection;

    document.querySelectorAll('[data-section]').forEach(wrap => {
        const n   = parseInt(wrap.dataset.section);
        const dot = wrap.querySelector('.step-dot');
        const lbl = wrap.querySelector('.step-label');
        if (!dot) return;

        dot.className = 'step-dot w-7 h-7 rounded-full border-2 text-xs font-bold transition-all flex items-center justify-center';
        lbl.className = 'step-label text-[10px] font-semibold whitespace-nowrap';

        if (n < cur) {
            dot.classList.add('bg-emerald-500', 'border-emerald-500', 'text-white');
            dot.innerHTML = '<i class="fas fa-check text-[9px]"></i>';
            lbl.classList.add('text-emerald-600', 'dark:text-emerald-400');
        } else if (n === cur) {
            dot.classList.add('bg-brand-500', 'border-brand-500', 'text-white',
                              'shadow-[0_0_0_4px_rgba(61,90,254,0.15)]', 'scale-110');
            dot.textContent = n;
            lbl.classList.add('text-brand-600', 'dark:text-brand-400', 'font-bold');
        } else {
            dot.classList.add('bg-white', 'dark:bg-gray-800',
                              'border-gray-200', 'dark:border-gray-700', 'text-gray-400');
            dot.textContent = n;
            lbl.classList.add('text-gray-400', 'dark:text-gray-600');
        }
    });

    document.querySelectorAll('.step-line').forEach(line => {
        const after = parseInt(line.dataset.after);
        line.className = 'step-line h-0.5 flex-1 min-w-[8px] self-start mt-3.5 mx-0.5 rounded-full transition-all';
        if (after < cur) {
            line.classList.add('bg-emerald-400');
        } else {
            line.classList.add('bg-gray-200', 'dark:bg-gray-700');
        }
    });
}


// ─────────────────────────────────────────────────────
//  FORM BINDING
// ─────────────────────────────────────────────────────
function bindFields() {
    document.querySelectorAll('[data-key]').forEach(el => {
        const [section, field] = el.dataset.key.split('.');

        if (state[section] && state[section][field] !== undefined) {
            el.value = state[section][field];
        }

        el.addEventListener('input', () => {
            state[section][field] = el.value;
            saveState();
            updateCounter(el);
        });
    });
}

function updateCounter(el) {
    const counter = document.getElementById(`counter-${el.id.replace('f-', '')}`);
    if (!counter) return;
    counter.textContent = `${el.value.length} / ${el.maxLength || 500}`;
}


// ─────────────────────────────────────────────────────
//  CHIPS FACTORY
// ─────────────────────────────────────────────────────
function makeChip(text, color, onRemove) {
    const chip = document.createElement('span');
    chip.className = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${color}`;
    chip.innerHTML = `${text}<button class="opacity-60 hover:opacity-100 hover:text-red-500 transition-all leading-none text-sm ml-1" title="حذف">×</button>`;
    chip.querySelector('button').addEventListener('click', onRemove);
    return chip;
}

function renderChips(containerId, items, color, onRemove) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    items.forEach((item, idx) => {
        const text = typeof item === 'string' ? item : `${item.name}: ${item.target}`;
        container.appendChild(
            makeChip(text, color, () => {
                onRemove(idx);
                saveState();
                renderChips(containerId, items, color, onRemove);
            })
        );
    });
}


// ─────────────────────────────────────────────────────
//  PAIN POINTS
// ─────────────────────────────────────────────────────
function initPainPoints() {
    const input  = document.getElementById('pain-input');
    const addBtn = document.getElementById('pain-add-btn');
    const COLOR  = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';

    const render = () => renderChips('pain-chips', state.problem.painPoints, COLOR,
        idx => state.problem.painPoints.splice(idx, 1));

    const add = () => {
        const val = input.value.trim();
        if (!val) return;
        state.problem.painPoints.push(val);
        input.value = '';
        saveState();
        render();
    };

    addBtn.addEventListener('click', add);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    render();
}


// ─────────────────────────────────────────────────────
//  COMPETITORS
// ─────────────────────────────────────────────────────
function initCompetitors() {
    const input  = document.getElementById('competitor-input');
    const addBtn = document.getElementById('competitor-add-btn');
    const COLOR  = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';

    const render = () => renderChips('competitor-chips', state.solution.competitors, COLOR,
        idx => state.solution.competitors.splice(idx, 1));

    const add = () => {
        const val = input.value.trim();
        if (!val) return;
        state.solution.competitors.push(val);
        input.value = '';
        saveState();
        render();
    };

    addBtn.addEventListener('click', add);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    render();
}


// ─────────────────────────────────────────────────────
//  FEATURES
// ─────────────────────────────────────────────────────
function initFeatures() {
    const nameInput = document.getElementById('feature-name-input');
    const prioSel   = document.getElementById('feature-priority-select');
    const addBtn    = document.getElementById('feature-add-btn');
    const list      = document.getElementById('features-list');
    const empty     = document.getElementById('features-empty');

    const PRIO = {
        must  : { label: 'Must Have',   cls: 'bg-red-50 text-red-600 border-red-200'         },
        should: { label: 'Should Have', cls: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
        could : { label: 'Could Have',  cls: 'bg-blue-50 text-blue-600 border-blue-200'       },
    };

    const render = () => {
        [...list.children].forEach(c => { if (c !== empty) c.remove(); });

        if (!state.features.length) { empty.style.display = ''; return; }
        empty.style.display = 'none';

        state.features.forEach((feat, idx) => {
            const p   = PRIO[feat.priority] || PRIO.could;
            const row = document.createElement('div');
            row.className = 'flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-200 transition-all';
            row.innerHTML = `
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${p.cls}">${p.label}</span>
                <span class="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">${feat.name}</span>
                <button class="feat-del w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                    <i class="fas fa-trash-can text-xs"></i>
                </button>`;
            row.querySelector('.feat-del').addEventListener('click', () => {
                state.features.splice(idx, 1);
                saveState();
                render();
            });
            list.appendChild(row);
        });
    };

    const add = () => {
        const name = nameInput.value.trim();
        if (!name) { nameInput.focus(); return; }
        state.features.push({ name, priority: prioSel.value });
        nameInput.value = '';
        saveState();
        render();
    };

    addBtn.addEventListener('click', add);
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    render();
}


// ─────────────────────────────────────────────────────
//  KPIs
// ─────────────────────────────────────────────────────
function initKPIs() {
    const nameInput   = document.getElementById('kpi-name-input');
    const targetInput = document.getElementById('kpi-target-input');
    const addBtn      = document.getElementById('kpi-add-btn');
    const list        = document.getElementById('kpis-list');
    const empty       = document.getElementById('kpis-empty');

    const render = () => {
        [...list.children].forEach(c => { if (c !== empty) c.remove(); });

        if (!state.metrics.kpis.length) { empty.style.display = ''; return; }
        empty.style.display = 'none';

        state.metrics.kpis.forEach((kpi, idx) => {
            const row = document.createElement('div');
            row.className = 'flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700';
            row.innerHTML = `
                <i class="fas fa-chart-bar text-brand-400 text-sm flex-shrink-0"></i>
                <span class="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">${kpi.name}</span>
                <span class="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-lg">${kpi.target}</span>
                <button class="kpi-del w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                    <i class="fas fa-trash-can text-xs"></i>
                </button>`;
            row.querySelector('.kpi-del').addEventListener('click', () => {
                state.metrics.kpis.splice(idx, 1);
                saveState();
                render();
            });
            list.appendChild(row);
        });
    };

    const add = () => {
        const name   = nameInput.value.trim();
        const target = targetInput.value.trim();
        if (!name) { nameInput.focus(); return; }
        state.metrics.kpis.push({ name, target: target || '—' });
        nameInput.value   = '';
        targetInput.value = '';
        saveState();
        render();
    };

    addBtn.addEventListener('click', add);
    [nameInput, targetInput].forEach(inp =>
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } })
    );
    render();
}


// ─────────────────────────────────────────────────────
//  PHASES
// ─────────────────────────────────────────────────────
function initPhases() {
    const nameInput     = document.getElementById('phase-name-input');
    const durationInput = document.getElementById('phase-duration-input');
    const addBtn        = document.getElementById('phase-add-btn');
    const list          = document.getElementById('phases-list');
    const empty         = document.getElementById('phases-empty');

    const COLORS = ['bg-brand-500','bg-emerald-500','bg-amber-500','bg-purple-500','bg-pink-500','bg-cyan-500'];

    const render = () => {
        [...list.children].forEach(c => { if (c !== empty) c.remove(); });

        if (!state.timeline.phases.length) { empty.style.display = ''; return; }
        empty.style.display = 'none';

        state.timeline.phases.forEach((phase, idx) => {
            const color = COLORS[idx % COLORS.length];
            const row   = document.createElement('div');
            row.className = 'flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700';
            row.innerHTML = `
                <div class="w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}"></div>
                <span class="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">${phase.name}</span>
                <span class="text-xs text-gray-400 font-medium">${phase.duration}</span>
                <button class="phase-del w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                    <i class="fas fa-trash-can text-xs"></i>
                </button>`;
            row.querySelector('.phase-del').addEventListener('click', () => {
                state.timeline.phases.splice(idx, 1);
                saveState();
                render();
            });
            list.appendChild(row);
        });
    };

    const add = () => {
        const name     = nameInput.value.trim();
        const duration = durationInput.value.trim();
        if (!name) { nameInput.focus(); return; }
        state.timeline.phases.push({ name, duration: duration || '—' });
        nameInput.value     = '';
        durationInput.value = '';
        saveState();
        render();
    };

    addBtn.addEventListener('click', add);
    [nameInput, durationInput].forEach(inp =>
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } })
    );
    render();
}


// ─────────────────────────────────────────────────────
//  REVENUE
// ─────────────────────────────────────────────────────
function initRevenue() {
    const input  = document.getElementById('revenue-input');
    const addBtn = document.getElementById('revenue-add-btn');
    const COLOR  = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';

    const render = () => renderChips('revenue-chips', state.business.revenues, COLOR,
        idx => state.business.revenues.splice(idx, 1));

    const add = () => {
        const val = input.value.trim();
        if (!val) return;
        state.business.revenues.push(val);
        input.value = '';
        saveState();
        render();
    };

    addBtn.addEventListener('click', add);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    render();
}


// ─────────────────────────────────────────────────────
//  TECH STACK
// ─────────────────────────────────────────────────────
function initTechStack() {
    const input  = document.getElementById('tech-input');
    const addBtn = document.getElementById('tech-add-btn');
    const COLOR  = 'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20';

    const render = () => renderChips('tech-chips', state.tech.stack, COLOR,
        idx => state.tech.stack.splice(idx, 1));

    const add = () => {
        const val = input.value.trim();
        if (!val) return;
        state.tech.stack.push(val);
        input.value = '';
        saveState();
        render();
    };

    addBtn.addEventListener('click', add);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    render();
}


// ─────────────────────────────────────────────────────
//  PRODUCT TYPE
// ─────────────────────────────────────────────────────
function initProductType() {
    const btns = document.querySelectorAll('.product-type-btn');

    if (state.tech.productType) {
        btns.forEach(b => setActiveType(b, b.dataset.type === state.tech.productType));
    }

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.tech.productType = btn.dataset.type;
            saveState();
            btns.forEach(b => setActiveType(b, b === btn));
        });
    });
}

function setActiveType(btn, active) {
    if (active === undefined) active = btn.dataset.type === state.tech.productType;

    if (active) {
        btn.classList.add('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/10', 'text-brand-700', 'dark:text-brand-300');
        btn.classList.remove('border-gray-200', 'dark:border-gray-700', 'text-gray-600', 'dark:text-gray-300');
    } else {
        btn.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/10', 'text-brand-700', 'dark:text-brand-300');
        btn.classList.add('border-gray-200', 'dark:border-gray-700', 'text-gray-600', 'dark:text-gray-300');
    }
}


// ─────────────────────────────────────────────────────
//  SUMMARY CARD
// ─────────────────────────────────────────────────────
function buildSummaryCard() {
    const card = document.getElementById('project-summary-card');
    if (!card) return;

    const s          = state;
    const mustCount  = s.features.filter(f => f.priority === 'must').length;
    const totalFeats = s.features.length;
    const kpiCount   = s.metrics.kpis.length;
    const phaseCount = s.timeline.phases.length;

    card.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-base flex-shrink-0">ف</div>
            <div>
                <p class="font-black text-gray-900 dark:text-white text-base leading-tight">${s.projectName || 'مشروعك'}</p>
                <p class="text-xs text-gray-400">${s.solution.approach || 'نموذج العمل غير محدد'}</p>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
            ${summaryRow('fa-magnifying-glass', 'المشكلة',
                s.problem.statement ? s.problem.statement.slice(0,80) + (s.problem.statement.length > 80 ? '…' : '') : 'غير محدد')}
            ${summaryRow('fa-lightbulb', 'الحل',
                s.solution.valueProp || (s.solution.statement ? s.solution.statement.slice(0,60) : 'غير محدد'))}
            ${summaryRow('fa-star', 'المميزات',
                totalFeats > 0 ? `${totalFeats} ميزة (${mustCount} أساسية)` : 'لا توجد مميزات')}
            ${summaryRow('fa-chart-line', 'المقاييس',
                kpiCount > 0 ? `${kpiCount} مؤشر نجاح` : s.metrics.goal || 'غير محدد')}
            ${summaryRow('fa-calendar', 'الجدول',
                phaseCount > 0 ? `${phaseCount} مراحل` : (s.timeline.start ? `${s.timeline.start} ← ${s.timeline.launch}` : 'غير محدد'))}
            ${summaryRow('fa-dollar-sign', 'نموذج الربح', s.business.model || 'غير محدد')}
            ${summaryRow('fa-code', 'التقنية',
                s.tech.stack.length > 0 ? s.tech.stack.slice(0,3).join(', ') + (s.tech.stack.length > 3 ? '…' : '') : 'غير محدد')}
        </div>`;
}

function summaryRow(icon, label, value) {
    return `
        <div class="flex items-start gap-2 p-2 rounded-xl bg-white dark:bg-gray-800/60 border border-brand-100 dark:border-brand-500/10">
            <i class="fas ${icon} text-brand-400 mt-0.5 flex-shrink-0 text-xs"></i>
            <div class="min-w-0">
                <p class="text-[10px] text-gray-400 font-semibold">${label}</p>
                <p class="text-gray-700 dark:text-gray-200 font-semibold text-xs leading-snug truncate">${value}</p>
            </div>
        </div>`;
}


// ─────────────────────────────────────────────────────
//  DARK MODE
// ─────────────────────────────────────────────────────
function initTheme() {
    const btn  = document.getElementById('theme-btn');
    const html = document.documentElement;

    if (localStorage.getItem('fikra_theme') === 'dark') html.classList.add('dark');

    btn.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('fikra_theme', html.classList.contains('dark') ? 'dark' : 'light');
    });
}


// ─────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────
function toast(msg, type = 'info') {
    const STYLES = {
        success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        error  : 'bg-red-50 text-red-800 border-red-200',
        warning: 'bg-amber-50 text-amber-800 border-amber-200',
        info   : 'bg-blue-50 text-blue-800 border-blue-200',
    };
    const ICONS = {
        success: 'fa-circle-check',
        error  : 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info   : 'fa-circle-info',
    };

    const el = document.createElement('div');
    el.className = `flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-semibold shadow-lg pointer-events-auto ${STYLES[type] || STYLES.info}`;
    el.innerHTML = `<i class="fas ${ICONS[type] || ICONS.info}"></i> ${msg}`;

    document.getElementById('toast-container').appendChild(el);

    setTimeout(() => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(8px)';
        el.style.transition = '200ms ease';
        setTimeout(() => el.remove(), 200);
    }, 3000);
}


// ─────────────────────────────────────────────────────
//  EXPORT
// ─────────────────────────────────────────────────────
function initExportButtons() {
    document.getElementById('export-btn').addEventListener('click', () => {
        goToSection(8);
        toast('اختر القالب المناسب ثم اضغط تصدير', 'info');
    });

    document.getElementById('export-now-btn').addEventListener('click', () => {
        const selected = document.querySelector('input[name="template"]:checked');
        if (!selected) { toast('اختر قالباً أولاً', 'warning'); return; }
        if (typeof exportProject === 'function') {
            exportProject(selected.value);
        }
    });
}


// ─────────────────────────────────────────────────────
//  LANDING
// ─────────────────────────────────────────────────────
function initLanding() {
    const input    = document.getElementById('landing-project-name');
    const startBtn = document.getElementById('start-btn');

    input.addEventListener('input', () => {
        startBtn.disabled = input.value.trim().length === 0;
    });

    startBtn.addEventListener('click', startProject);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !startBtn.disabled) startProject();
    });
}


// ─────────────────────────────────────────────────────
//  NEW PROJECT
// ─────────────────────────────────────────────────────
function initNewProject() {
    document.getElementById('new-project-btn').addEventListener('click', () => {
        if (confirm('هل تريد بدء مشروع جديد؟ سيتم مسح البيانات الحالية.')) clearState();
    });
}


// ─────────────────────────────────────────────────────
//  NAV BUTTONS
// ─────────────────────────────────────────────────────
function initNavButtons() {
    document.getElementById('btn-next').addEventListener('click', () => {
        const cur = state.currentSection;
        if (cur < 8) goToSection(cur + 1);
        else toast('أحسنت! مشروعك جاهز للتصدير 🎉', 'success');
    });

    document.getElementById('btn-back').addEventListener('click', () => {
        if (state.currentSection > 1) goToSection(state.currentSection - 1);
    });
}


// ─────────────────────────────────────────────────────
//  RESTORE SESSION
// ─────────────────────────────────────────────────────
function restoreSession() {
    if (!state.projectName) return;

    document.getElementById('screen-landing').style.display = 'none';
    document.getElementById('step-bar').classList.remove('hidden');
    document.getElementById('nav-footer').classList.remove('hidden');
    document.getElementById('export-btn').classList.remove('hidden');
    document.getElementById('new-project-btn').classList.remove('hidden');

    const badge = document.getElementById('project-badge');
    badge.classList.remove('hidden');
    badge.classList.add('flex');
    document.getElementById('project-badge-name').textContent = state.projectName;
    document.getElementById('landing-project-name').value     = state.projectName;

    buildStepBar();
    goToSection(state.currentSection || 1);
}


// ─────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initTheme();
    initLanding();
    initNewProject();
    initNavButtons();
    bindFields();
    initPainPoints();
    initCompetitors();
    initFeatures();
    initKPIs();
    initPhases();
    initRevenue();
    initTechStack();
    initProductType();
    initExportButtons();
    restoreSession();
});

// app.js — نقطة الدخول | تحديث لحظي بدون زر

import { Store }               from "./core/Store.js";
import { Calculator }          from "./core/Calculator.js";
import { Recommender }         from "./core/Recommender.js";
import { PersonalScenario }    from "./scenarios/PersonalScenario.js";
import { FamilyScenario }      from "./scenarios/FamilyScenario.js";
import { InvestmentScenario }  from "./scenarios/InvestmentScenario.js";
import { ChartBuilder }        from "./reporting/ChartBuilder.js";
import { PDFExporter }         from "./reporting/PDFExporter.js";
import { ResultsRenderer }     from "./ui/ResultsRenderer.js";

// ── Instances ────────────────────────────────────────────
const store    = new Store();
const charts   = new ChartBuilder();
const renderer = new ResultsRenderer();

// ════════════════════════════════════════════════════════
//  DARK MODE
// ════════════════════════════════════════════════════════
const themeBtn  = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function applyTheme() {
    const dark = document.documentElement.classList.contains('dark');
    themeIcon.className = dark
        ? 'fas fa-sun'
        : 'fas fa-moon';
    themeIcon.style.fontSize = '.85rem';
    if (dark) themeIcon.style.color = '#fbbf24';
    else      themeIcon.style.color = '';
}
applyTheme();

themeBtn?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme();
});

// ════════════════════════════════════════════════════════
//  SCENARIO SWITCH
// ════════════════════════════════════════════════════════
document.querySelectorAll('.sc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const sc = btn.dataset.sc;
        store.setScenario(sc);

        document.querySelectorAll('.sc-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.getElementById('inputs-family')?.classList.toggle('visible', sc === 'family');
        document.getElementById('inputs-investment')?.classList.toggle('visible', sc === 'investment');

        calculate();
    });
});

// ════════════════════════════════════════════════════════
//  LIVE INPUT HINT
// ════════════════════════════════════════════════════════
function updateDownHint() {
    const price = +document.getElementById('propertyPrice')?.value || 0;
    const pct   = +document.getElementById('downPaymentPct')?.value || 0;
    const hint  = document.getElementById('downHint');
    if (hint) {
        hint.textContent = price > 0
            ? '= ' + new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(Math.round(price * pct / 100)) + ' ﷼'
            : '';
    }
}
['propertyPrice', 'downPaymentPct'].forEach(id =>
    document.getElementById(id)?.addEventListener('input', updateDownHint)
);
updateDownHint();

// ════════════════════════════════════════════════════════
//  DEBOUNCE + LIVE CALCULATE
// ════════════════════════════════════════════════════════
let debounceTimer;

function onInputChange() {
    const liveText = document.getElementById('liveText');
    if (liveText) liveText.textContent = 'جاري التحديث...';
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(calculate, 400);
}

document.querySelectorAll('.field').forEach(f =>
    f.addEventListener('input', onInputChange)
);

// ════════════════════════════════════════════════════════
//  READ INPUTS
// ════════════════════════════════════════════════════════
function readInputs() {
    const ids = [
        'propertyPrice', 'downPaymentPct', 'loanYears', 'interestRate',
        'monthlyRent', 'rentIncrease', 'appreciation', 'holdYears',
        'maintenance', 'closingCosts', 'sellingCosts', 'insuranceRate',
        'inflation', 'investRate', 'monthlyIncome',
        'familySize', 'currentAge', 'childrenCount',
        'invRent', 'vacancyRate', 'mgmtFee',
    ];
    const inputs = {};
    ids.forEach(id => {
        const el = document.getElementById(id);
        inputs[id] = el ? parseFloat(el.value) || 0 : 0;
    });
    return inputs;
}

// ════════════════════════════════════════════════════════
//  CALCULATE
// ════════════════════════════════════════════════════════
function calculate() {
    const inputs = readInputs();

    if (inputs.propertyPrice <= 0 || inputs.monthlyRent <= 0) {
        const liveText = document.getElementById('liveText');
        if (liveText) liveText.textContent = 'لحظي';
        return;
    }

    store.setInputs(inputs);

    const base           = Calculator.run(inputs);
    const recommendation = Recommender.analyze(base);

    const scenarioMap = { personal: PersonalScenario, family: FamilyScenario, investment: InvestmentScenario };
    const scenarioData = scenarioMap[store.scenario]?.calculate(inputs, base) ?? null;

    store.setResults({ base, recommendation, scenarioData });

    // أظهر منطقة النتائج
    document.getElementById('resultsArea')?.classList.remove('hidden');
    document.getElementById('pdfBtn').style.display = '';

    renderer.render(store, charts);

    const liveText = document.getElementById('liveText');
    if (liveText) liveText.textContent = 'محدّث';
}

// ════════════════════════════════════════════════════════
//  PDF
// ════════════════════════════════════════════════════════
document.getElementById('pdfBtn')?.addEventListener('click', () => {
    PDFExporter.export(store);
});

// ════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════
calculate();

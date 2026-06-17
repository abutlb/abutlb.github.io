// app.js — نقطة الدخول الرئيسية لمحاكي قرار السكن BOR

import { Store }               from "./core/Store.js";
import { Calculator }          from "./core/Calculator.js";
import { Recommender }         from "./core/Recommender.js";
import { PersonalScenario }    from "./scenarios/PersonalScenario.js";
import { FamilyScenario }      from "./scenarios/FamilyScenario.js";
import { InvestmentScenario }  from "./scenarios/InvestmentScenario.js";
import { ChartBuilder }        from "./reporting/ChartBuilder.js";
import { PDFExporter }         from "./reporting/PDFExporter.js";
import { SummaryTab }          from "./ui/SummaryTab.js";
import { AnalysisTab }         from "./ui/AnalysisTab.js";
import { YearlyTab }           from "./ui/YearlyTab.js";
import { ScenarioTab }         from "./ui/ScenarioTab.js";

// ── Instances ────────────────────────────────────────────────
const store        = new Store();
const chartBuilder = new ChartBuilder();
const summaryTab   = new SummaryTab();
const analysisTab  = new AnalysisTab();
const yearlyTab    = new YearlyTab();
const scenarioTab  = new ScenarioTab();

// ════════════════════════════════════════════════════════════
//  DARK MODE
// ════════════════════════════════════════════════════════════
document.getElementById('themeToggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('themeIcon').className =
        isDark ? 'fas fa-sun text-yellow-400 text-sm'
               : 'fas fa-moon text-gray-600 text-sm';
});

// ════════════════════════════════════════════════════════════
//  TAB NAVIGATION
// ════════════════════════════════════════════════════════════
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
}

// ════════════════════════════════════════════════════════════
//  SCENARIO SELECTOR
// ════════════════════════════════════════════════════════════
document.querySelectorAll('.sc-pill').forEach(btn => {
    btn.addEventListener('click', () => {
        const sc = btn.dataset.sc;
        store.setScenario(sc);

        document.querySelectorAll('.sc-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // إظهار / إخفاء حقول السيناريو
        document.querySelectorAll('.sc-section').forEach(el => el.classList.remove('visible'));
        if (sc !== 'personal') {
            document.getElementById(`sc-${sc}`)?.classList.add('visible');
        }

        // تبويب السيناريو في الـ results
        const scTabBtn   = document.getElementById('scTabBtn');
        const scTabLabel = document.getElementById('scTabLabel');
        if (sc === 'personal') {
            scTabBtn?.classList.add('hidden');
        } else {
            scTabBtn?.classList.remove('hidden');
            if (scTabLabel) {
                scTabLabel.textContent = sc === 'family' ? 'العائلي' : 'الاستثماري';
            }
        }
    });
});

// ════════════════════════════════════════════════════════════
//  قراءة المدخلات
// ════════════════════════════════════════════════════════════
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

// ── تحديث تلميح الدفعة المقدمة ──
function updateDownHint() {
    const price = parseFloat(document.getElementById('propertyPrice')?.value) || 0;
    const pct   = parseFloat(document.getElementById('downPaymentPct')?.value) || 0;
    const hint  = document.getElementById('downHint');
    if (hint) {
        hint.textContent = '= ' + new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 })
                                      .format(Math.round(price * pct / 100)) + ' ﷼';
    }
}

['propertyPrice', 'downPaymentPct'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateDownHint);
});
updateDownHint();

// ════════════════════════════════════════════════════════════
//  الحساب الرئيسي
// ════════════════════════════════════════════════════════════
function calculate() {
    const inputs = readInputs();

    // التحقق من المدخلات
    if (inputs.propertyPrice <= 0 || inputs.monthlyRent <= 0) {
        showToast('تأكد من إدخال سعر العقار والإيجار', 'warning');
        return;
    }

    store.setInputs(inputs);

    // ── الحسابات الأساسية ──
    const base           = Calculator.run(inputs);
    const recommendation = Recommender.analyze(base);

    // ── حسابات السيناريو ──
    const scenarioMap = {
        personal:   PersonalScenario,
        family:     FamilyScenario,
        investment: InvestmentScenario,
    };
    const ScenarioClass = scenarioMap[store.scenario];
    const scenarioData  = ScenarioClass ? ScenarioClass.calculate(inputs, base) : null;

    store.setResults({ base, recommendation, scenarioData });

    // ── تحديث الواجهة ──
    renderResults();
    showToast('تم التحليل بنجاح!', 'success');
}

// ════════════════════════════════════════════════════════════
//  عرض النتائج
// ════════════════════════════════════════════════════════════
function renderResults() {
    const { results, scenario } = store;
    const { base, recommendation: rec } = results;

    // إظهار منطقة النتائج
    document.getElementById('placeholder')?.classList.add('hidden');
    document.getElementById('resultsArea')?.classList.remove('hidden');
    document.getElementById('pdfBtn')?.classList.remove('hidden');

    // شريط المعلومات
    const scLabels = { personal:'👤 الشخصي', family:'👨‍👩‍👧‍👦 العائلي', investment:'📊 الاستثماري' };
    document.getElementById('scBadge').textContent   = scLabels[scenario];
    document.getElementById('metaTime').textContent  =
        `آخر تحديث: ${new Date().toLocaleTimeString('ar-SA')}`;

    // بادج نقطة التعادل
    const bb = document.getElementById('breakevenBadge');
    if (base.breakEvenYear) {
        bb.classList.remove('hidden');
        bb.textContent = `نقطة التعادل: السنة ${base.breakEvenYear}`;
    } else {
        bb.classList.add('hidden');
    }

    // تبويب السيناريو
    const scTabBtn = document.getElementById('scTabBtn');
    scTabBtn?.classList.toggle('hidden', scenario === 'personal');

    // ── عرض التبويبات ──
    chartBuilder.destroyAll();

    summaryTab.render(store);
    analysisTab.render(store, chartBuilder);
    yearlyTab.render(store);

    if (scenario !== 'personal') {
        scenarioTab.render(store, chartBuilder);
    }

    // العودة لتبويب الملخص
    switchTab('summary');
}

// ════════════════════════════════════════════════════════════
//  FILTER الجدول السنوي
// ════════════════════════════════════════════════════════════
document.getElementById('yearFilter')?.addEventListener('change', e => {
    yearlyTab.applyFilter(e.target.value);
});

// ════════════════════════════════════════════════════════════
//  PDF EXPORT
// ════════════════════════════════════════════════════════════
document.getElementById('pdfBtn')?.addEventListener('click', () => {
    PDFExporter.export(store);
});

// ════════════════════════════════════════════════════════════
//  TOAST
// ════════════════════════════════════════════════════════════
function showToast(msg, type = 'success') {
    const classMap = {
        success: 'toast-success',
        warning: 'toast-warning',
        error:   'toast-error',
    };
    const iconMap = {
        success: 'fa-check-circle text-emerald-400',
        warning: 'fa-exclamation-triangle text-amber-400',
        error:   'fa-times-circle text-red-400',
    };

    const el = document.createElement('div');
    el.className = `toast ${classMap[type]} flex items-center gap-2`;
    el.innerHTML = `<i class="fas ${iconMap[type]}"></i>${msg}`;

    const container = document.getElementById('toastContainer');
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// ════════════════════════════════════════════════════════════
//  زر الحساب — ربط الـ global
// ════════════════════════════════════════════════════════════
document.getElementById('calcBtn').addEventListener('click', calculate);

// ════════════════════════════════════════════════════════════
//  INIT — حساب فوري بالقيم الافتراضية
// ════════════════════════════════════════════════════════════
calculate();

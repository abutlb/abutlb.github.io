// app.js — نقطة الدخول الرئيسية

import { Store }                 from './core/Store.js';
import { Tokenizer }             from './core/Tokenizer.js';
import { StopwordsManager }      from './core/StopwordsManager.js';
import { FrequencyAnalyzer }     from './analysis/FrequencyAnalyzer.js';
import { SentimentAnalyzer }     from './analysis/SentimentAnalyzer.js';
import { ThemeAnalyzer }         from './analysis/ThemeAnalyzer.js';
import { TimelineAnalyzer }      from './analysis/TimelineAnalyzer.js';
import { SuggestionsExtractor }  from './analysis/SuggestionsExtractor.js';
import { GroupAnalyzer }         from './analysis/GroupAnalyzer.js';
import { ChartBuilder }          from './ui/ChartBuilder.js';
import { ResultsRenderer }       from './ui/ResultsRenderer.js';
import { SearchFilter }          from './ui/SearchFilter.js';
import { SummaryGenerator }      from './ui/SummaryGenerator.js';
import { CSVExporter }           from './reporting/CSVExporter.js';
import { ExcelExporter }         from './reporting/ExcelExporter.js';
import { THEME_DATA, DEFAULT_STOPWORDS, SAMPLE_DATA } from './data/analyzer-data.js';

// ════════════════════════════════════════════════════════
//  INSTANCES
// ════════════════════════════════════════════════════════
const store    = new Store();
const charts   = new ChartBuilder();
const renderer = new ResultsRenderer();
const stopwordsMgr = new StopwordsManager(DEFAULT_STOPWORDS);
const themeMgr     = new ThemeAnalyzer(THEME_DATA);
const searchFilter = new SearchFilter(store, () => renderer._renderFilteredTable(store.filteredData));

// ════════════════════════════════════════════════════════
//  DARK MODE
// ════════════════════════════════════════════════════════
const themeToggle = document.getElementById('themeToggle');
const toggleDot   = document.querySelector('.toggle-dot');

function applyDarkMode() {
    const dark = document.documentElement.classList.contains('dark');
    document.body.classList.toggle('dark-mode', dark);
    if (toggleDot) toggleDot.style.transform = dark ? 'translateX(1.5rem)' : 'translateX(0)';
}

if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
}
applyDarkMode();

themeToggle?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    applyDarkMode();
});

// ════════════════════════════════════════════════════════
//  TAB SWITCHING
// ════════════════════════════════════════════════════════
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active', 'opacity-100', 'border-b-2', 'border-white'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('block'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
        btn.classList.add('active', 'opacity-100');
        const content = document.getElementById(tab + '-tab');
        if (content) { content.classList.remove('hidden'); content.classList.add('block'); }
    });
});

// ════════════════════════════════════════════════════════
//  FILE UPLOAD
// ════════════════════════════════════════════════════════
const csvInput  = document.getElementById('csvFileInput');
const dropZone  = document.getElementById('dropZone');

dropZone?.addEventListener('click', () => csvInput?.click());
dropZone?.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('border-red-400'); });
dropZone?.addEventListener('dragleave',    () => dropZone.classList.remove('border-red-400'));
dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('border-red-400');
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) processCSVFile(file);
});

csvInput?.addEventListener('change', () => {
    const file = csvInput.files[0];
    if (file) processCSVFile(file);
});

function processCSVFile(file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data, meta }) => {
            const headers = meta.fields ?? [];
            store.setRawData(data, headers);
            populateColumnSelectors(headers);
            showColumnSelection();
            showPreview(data, headers);
            showToast(`تم تحميل ${data.length} سجل`, 'success');
        },
        error: () => showToast('خطأ في قراءة الملف', 'error'),
    });
}

function populateColumnSelectors(headers) {
    ['columnSelector', 'dateColumnSelector', 'groupColumnSelector'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const isText = id === 'columnSelector';
        sel.innerHTML = `<option value="">${isText ? '-- اختر عمود النص --' : '-- لا يوجد --'}</option>` +
            headers.map(h => `<option value="${h}">${h}</option>`).join('');
    });
}

function showColumnSelection() {
    document.getElementById('columnSelectionContainer')?.classList.remove('hidden');
    document.getElementById('dateColumnContainer')?.classList.remove('hidden');
    document.getElementById('groupColumnContainer')?.classList.remove('hidden');
}

function showPreview(data, headers) {
    const previewEl  = document.getElementById('dataPreview');
    const countEl    = document.getElementById('dataCount');
    if (!previewEl) return;
    if (countEl) countEl.textContent = data.length + ' سجلات';

    if (!data.length) { previewEl.innerHTML = '<p class="text-gray-400">لا توجد بيانات</p>'; return; }

    const cols  = headers.slice(0, 5);
    const rows  = data.slice(0, 8);
    previewEl.innerHTML = `<div class="overflow-x-auto text-sm">
        <table class="w-full border-collapse">
            <thead><tr>${cols.map(h => `<th class="border dark:border-gray-600 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs">${h}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(r => `<tr>${cols.map(c => `<td class="border dark:border-gray-600 px-2 py-1 text-xs max-w-xs truncate">${r[c] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        ${data.length > 8 ? `<p class="text-xs text-gray-400 mt-1">... و ${data.length - 8} سجلات أخرى</p>` : ''}
    </div>`;
}

// ════════════════════════════════════════════════════════
//  MANUAL INPUT
// ════════════════════════════════════════════════════════
document.getElementById('clearInputBtn')?.addEventListener('click', () => {
    const ta = document.getElementById('manualInput');
    if (ta) ta.value = '';
    store.reset();
    charts.destroyAll();
    document.getElementById('columnSelectionContainer')?.classList.add('hidden');
    document.getElementById('dataPreview').innerHTML = '<div class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400"><div class="text-center"><i class="fas fa-file-alt text-2xl mb-2"></i><p>قم بتحميل ملف CSV أو أدخل بيانات لرؤية المعاينة هنا...</p></div></div>';
    document.getElementById('dataCount').textContent = '0 سجلات';
    searchFilter.reset();
});

document.getElementById('exampleDataBtn')?.addEventListener('click', () => {
    const ta = document.getElementById('manualInput');
    if (ta) ta.value = SAMPLE_DATA.join('\n');
    store.setRawData([], []);
    document.getElementById('dataCount').textContent = SAMPLE_DATA.length + ' سجلات';
    document.getElementById('dataPreview').innerHTML = `<p class="text-sm text-gray-600 dark:text-gray-400">تم تحميل ${SAMPLE_DATA.length} تعليق تجريبي</p>`;
    showToast('تم تحميل البيانات التجريبية', 'success');
});

// ════════════════════════════════════════════════════════
//  ANALYZE
// ════════════════════════════════════════════════════════
document.getElementById('analyzeBtn')?.addEventListener('click', runAnalysis);

function runAnalysis() {
    const textCol   = document.getElementById('columnSelector')?.value   || '';
    const dateCol   = document.getElementById('dateColumnSelector')?.value || '';
    const groupCol  = document.getElementById('groupColumnSelector')?.value || '';
    const manual    = document.getElementById('manualInput')?.value?.trim() || '';
    const removeStop = document.getElementById('removeStopwords')?.checked ?? true;
    const topN       = parseInt(document.getElementById('topWordsCount')?.value ?? 20);

    store.setColumns({ selectedColumn: textCol, dateColumn: dateCol, groupColumn: groupCol });

    let texts = [];
    let rawData = [];

    if (store.rawData.length && textCol) {
        rawData = store.rawData;
        texts   = rawData.map(row => String(row[textCol] ?? '').trim()).filter(Boolean);
    } else if (manual) {
        texts   = manual.split('\n').map(t => t.trim()).filter(Boolean);
        rawData = texts.map(t => ({ text: t }));
        store.setRawData(rawData, ['text']);
    } else {
        showToast('يرجى تحميل ملف CSV أو إدخال النصوص أولاً', 'warning');
        return;
    }

    if (!texts.length) { showToast('لا توجد نصوص للتحليل', 'warning'); return; }

    const stopwords = removeStop ? stopwordsMgr.getAll() : new Set();

    // بناء textData
    const textData = texts.map(original => ({
        original,
        wordCount: Tokenizer.wordCount(original),
        sentiment: SentimentAnalyzer.analyze(original),
        theme:     themeMgr.detect(original),
    }));

    store.setTextData(textData);

    // تشغيل التحليلات
    const frequency         = FrequencyAnalyzer.analyze(textData, stopwords, topN);
    const lengthDist        = FrequencyAnalyzer.getLengthDistribution(textData);
    const sentimentStats    = SentimentAnalyzer.getSummaryStats(textData);
    const outliers          = SentimentAnalyzer.detectOutliers(textData);
    const themeDistribution = themeMgr.distribute(textData);
    const timeline          = TimelineAnalyzer.analyze(rawData, textData, dateCol || null);
    const groups            = GroupAnalyzer.compare(rawData, textData, groupCol || null);
    const suggestions       = SuggestionsExtractor.extractSuggestions(textData);
    const numbersRaw        = SuggestionsExtractor.extractNumbers(textData);
    const numbers           = { raw: numbersRaw, summary: SuggestionsExtractor.summarizeNumbers(numbersRaw) };

    const results = {
        frequency, lengthDist, sentimentStats, outliers,
        themeDistribution, timeline, groups,
        suggestions, numbers,
    };

    store.setAnalysisResults(results);

    charts.destroyAll();
    renderer.render(store, charts);

    // تحديث قوائم الفلترة
    searchFilter.updateThemeOptions(themeDistribution);

    // الملخص التنفيذي
    const summaryEl = document.getElementById('executiveSummary');
    if (summaryEl) summaryEl.innerHTML = SummaryGenerator.generateHTML(store);

    // إظهار التبويبات
    document.querySelectorAll('.tab-btn[data-tab="analysis"], .tab-btn[data-tab="themes"], .tab-btn[data-tab="explore"], .tab-btn[data-tab="report"]')
        .forEach(b => b.classList.remove('opacity-50', 'pointer-events-none'));

    // الانتقال التلقائي لتبويب التحليل
    document.querySelector('.tab-btn[data-tab="analysis"]')?.click();

    showToast(`تم تحليل ${textData.length} نص بنجاح`, 'success');
}

// ════════════════════════════════════════════════════════
//  THEME SELECTOR (تبويب المواضيع)
// ════════════════════════════════════════════════════════
document.getElementById('themeSelector')?.addEventListener('change', function() {
    const theme = this.value;
    if (!theme || !store.textData.length) return;

    const items   = store.textData.filter(d => d.theme === theme);
    const posCount = items.filter(d => d.sentiment === 'إيجابي').length;
    const negCount = items.filter(d => d.sentiment === 'سلبي').length;
    const pct      = items.length ? (posCount / items.length * 100).toFixed(1) : 0;

    const detailsEl = document.getElementById('themeDetails');
    if (detailsEl) {
        const keywords = themeMgr.getKeywords(theme);
        detailsEl.innerHTML = `
            <div class="mb-3">
                <p class="font-medium text-gray-700 dark:text-gray-300">عدد النصوص: <span class="font-bold text-red-600 dark:text-red-400">${items.length}</span></p>
                <p class="text-sm text-gray-600 dark:text-gray-400">${pct}% إيجابي، ${items.length ? (negCount / items.length * 100).toFixed(1) : 0}% سلبي</p>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div class="bg-green-500 h-2 rounded-full transition-all" style="width:${pct}%"></div>
            </div>
            <div class="flex flex-wrap gap-1 mb-2">
                ${keywords.slice(0, 12).map(k => `<span class="px-2 py-0.5 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded text-xs">${k}</span>`).join('')}
            </div>`;
    }

    const tbody = document.getElementById('themeCommentsTable')?.querySelector('tbody');
    if (tbody) {
        const sorted = [...items].sort((a, b) => b.wordCount - a.wordCount).slice(0, 10);
        tbody.innerHTML = sorted.map(d => `
            <tr>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-sm">${d.original}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center">${d.wordCount}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center ${d.sentiment === 'سلبي' ? 'text-red-500' : 'text-green-500'}">${d.sentiment}</td>
            </tr>`).join('');
    }
});

// ════════════════════════════════════════════════════════
//  CUSTOM THEMES (تبويب الإعدادات)
// ════════════════════════════════════════════════════════
document.getElementById('addThemeBtn')?.addEventListener('click', () => {
    const nameEl = document.getElementById('newThemeName');
    const kwEl   = document.getElementById('newThemeKeywords');
    if (!nameEl?.value.trim() || !kwEl?.value.trim()) {
        showToast('يرجى إدخال اسم الموضوع والكلمات المفتاحية', 'warning');
        return;
    }
    const keywords = kwEl.value.split(/[،,\n]/).map(k => k.trim()).filter(Boolean);
    if (themeMgr.addTheme(nameEl.value.trim(), keywords)) {
        showToast('تم إضافة الموضوع المخصص', 'success');
        nameEl.value = '';
        kwEl.value   = '';
        renderCustomThemesList();
    }
});

function renderCustomThemesList() {
    const el = document.getElementById('customThemesList');
    if (!el) return;
    const custom = themeMgr.getCustomThemes();
    const entries = Object.entries(custom);
    if (!entries.length) { el.innerHTML = '<p class="text-gray-400 text-sm">لا توجد مواضيع مخصصة بعد</p>'; return; }
    el.innerHTML = entries.map(([name, kws]) => `
        <div class="flex items-center justify-between py-1 border-b dark:border-gray-600">
            <span class="font-medium text-sm">${name}</span>
            <span class="text-xs text-gray-400">${kws.slice(0, 4).join('، ')}${kws.length > 4 ? '...' : ''}</span>
            <button onclick="removeCustomTheme('${name}')" class="text-red-500 hover:text-red-700 text-xs px-2">حذف</button>
        </div>`).join('');
}

window.removeCustomTheme = (name) => {
    themeMgr.removeTheme(name);
    renderCustomThemesList();
    showToast('تم حذف الموضوع', 'success');
};

// ════════════════════════════════════════════════════════
//  STOPWORDS MANAGER (تبويب الإعدادات)
// ════════════════════════════════════════════════════════
function renderStopwordsList() {
    const el = document.getElementById('customStopwordsList');
    if (!el) return;
    const custom = stopwordsMgr.getCustom();
    if (!custom.length) { el.innerHTML = '<p class="text-gray-400 text-sm">لا توجد كلمات مخصصة بعد</p>'; return; }
    el.innerHTML = custom.map(w => `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
            ${w}
            <button onclick="removeStopword('${w}')" class="text-red-500 hover:text-red-700 text-xs">✕</button>
        </span>`).join(' ');
}

document.getElementById('addStopwordBtn')?.addEventListener('click', () => {
    const input = document.getElementById('newStopwordInput');
    const words = (input?.value ?? '').split(/[,،\s]+/).map(w => w.trim()).filter(Boolean);
    words.forEach(w => stopwordsMgr.add(w));
    if (input) input.value = '';
    renderStopwordsList();
    showToast(`تمت إضافة ${words.length} كلمة`, 'success');
});

window.removeStopword = (word) => {
    stopwordsMgr.remove(word);
    renderStopwordsList();
};

document.getElementById('resetStopwordsBtn')?.addEventListener('click', () => {
    stopwordsMgr.reset();
    renderStopwordsList();
    showToast('تم إعادة تعيين كلمات التوقف', 'success');
});

// ════════════════════════════════════════════════════════
//  EXPORT
// ════════════════════════════════════════════════════════
document.getElementById('exportCSVBtn')?.addEventListener('click', () => {
    if (!store.textData.length) { showToast('يرجى تحليل البيانات أولاً', 'warning'); return; }
    CSVExporter.export(store.textData);
    showToast('تم تصدير CSV بنجاح', 'success');
});

document.getElementById('exportExcelBtn')?.addEventListener('click', () => {
    if (!store.textData.length) { showToast('يرجى تحليل البيانات أولاً', 'warning'); return; }
    ExcelExporter.export(store.textData, store.analysisResults);
    showToast('تم تصدير Excel بنجاح', 'success');
});

// ════════════════════════════════════════════════════════
//  N-GRAM TAB SWITCH
// ════════════════════════════════════════════════════════
document.querySelectorAll('.ngram-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        document.querySelectorAll('.ngram-btn').forEach(b => b.classList.remove('bg-red-600', 'text-white'));
        btn.classList.add('bg-red-600', 'text-white');
        document.querySelectorAll('.ngram-chart').forEach(c => c.classList.add('hidden'));
        document.getElementById(type + 'ChartWrapper')?.classList.remove('hidden');
    });
});

// ════════════════════════════════════════════════════════
//  TOAST
// ════════════════════════════════════════════════════════
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-yellow-500', info: 'bg-blue-500' };
    toast.className = `fixed bottom-4 left-4 px-4 py-2 rounded-lg shadow-lg z-50 text-white transform transition-transform duration-300 ${colors[type] ?? colors.info}`;
    toast.textContent = message;
    toast.classList.remove('hidden', 'translate-y-20');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.add('translate-y-20');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}

// ════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════
searchFilter.init();
renderCustomThemesList();
renderStopwordsList();

// تحديث سنة التذييل
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

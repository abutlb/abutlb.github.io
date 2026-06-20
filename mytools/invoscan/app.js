// app.js — InvoScan: نقطة الدخول والمنسق الرئيسي

import { Lang }           from './i18n/Lang.js';
import { FileHandler }    from './core/FileHandler.js';
import { PDFProcessor }   from './core/PDFProcessor.js';
import { ImageProcessor } from './core/ImageProcessor.js';
import { OCREngine }      from './core/OCREngine.js';
import { InvoiceParser }  from './extraction/InvoiceParser.js';
import { PreviewPanel }   from './ui/PreviewPanel.js';
import { ResultsTable }   from './ui/ResultsTable.js';
import { ProgressPanel }  from './ui/ProgressPanel.js';
import { SettingsPanel }  from './ui/SettingsPanel.js';
import { TemplateEditor } from './ui/TemplateEditor.js';
import { Toast }          from './ui/Toast.js';
import { ExcelExporter }  from './export/ExcelExporter.js';
import { CSVExporter }    from './export/CSVExporter.js';
import { TemplateExporter}from './export/TemplateExporter.js';
import { TemplateMatcher} from './core/TemplateMatcher.js';
import { TemplateEngine } from './core/TemplateEngine.js';

// ── Instances ────────────────────────────────────────────
const toast          = new Toast('toast-container');
const preview        = new PreviewPanel();
const results        = new ResultsTable();
const progress       = new ProgressPanel();
const settings       = new SettingsPanel();
const templateEditor = new TemplateEditor();

// ── State ─────────────────────────────────────────────────
const state = {
    phase:       'upload',
    queue:       [],
    canvases:    [],
    ocr:         null,
    results:     [],    // جميع الفواتير المعالجة
    currentIdx:  0,     // الفاتورة المعروضة حالياً
    currentFile: null,  // الملف الأخير المعالج (للقالب)
};

// ════════════════════════════════════════════════════════
//  FILE HANDLER
// ════════════════════════════════════════════════════════
const fileInput = document.getElementById('file-input');
const dropzone  = document.getElementById('dropzone');

new FileHandler(dropzone, fileInput, {
    onFiles: files => {
        if (files.length === 1 && state.queue.length === 0) {
            processSingle(files[0]);
        } else {
            files.forEach(addToQueue);
        }
    },
    onError: msg => toast.error(msg),
});

document.getElementById('dz-browse-btn').addEventListener('click', e => {
    e.stopPropagation();
    fileInput.click();
});

// ════════════════════════════════════════════════════════
//  BATCH QUEUE
// ════════════════════════════════════════════════════════
function addToQueue(file) {
    state.queue.push(file);
    renderQueue();
    document.getElementById('batch-queue').style.display  = 'block';
    document.getElementById('batch-pill').style.display   = 'flex';
    document.getElementById('batch-count-lbl').textContent = state.queue.length;
}

function renderQueue() {
    const list = document.getElementById('batch-list');
    list.innerHTML = '';
    state.queue.forEach((f, i) => {
        const item = document.createElement('div');
        item.className = 'batch-item';
        item.innerHTML = `
            <i class="fas ${FileHandler.fileIcon(f)}" style="color:var(--accent);font-size:.85rem"></i>
            <span class="bi-name">${f.name}</span>
            <span class="bi-size">${FileHandler.formatSize(f.size)}</span>
            <button class="bi-del" data-idx="${i}"><i class="fas fa-times"></i></button>`;
        item.querySelector('.bi-del').addEventListener('click', () => {
            state.queue.splice(i, 1);
            renderQueue();
            if (!state.queue.length) {
                document.getElementById('batch-queue').style.display = 'none';
                document.getElementById('batch-pill').style.display  = 'none';
            } else {
                document.getElementById('batch-count-lbl').textContent = state.queue.length;
            }
        });
        list.appendChild(item);
    });
}

document.getElementById('btn-add-more')?.addEventListener('click', () => fileInput.click());
document.getElementById('btn-process-all')?.addEventListener('click', () => processAllQueue());

// ════════════════════════════════════════════════════════
//  CORE PROCESSING
// ════════════════════════════════════════════════════════

// استخراج البيانات من ملف واحد — يُرجع parsed أو null
async function processFile(file) {
    const isPDF = file.type === 'application/pdf';
    let rawText = '', canvases = [], confidence = 0;

    progress.setFile(file.name);

    // Stage 0: تحميل
    progress.setStage(0);
    progress.setProgress(5, Lang.t('procLoading'));

    // Stage 1: تحويل
    progress.setStage(1);
    progress.setProgress(15, isPDF ? Lang.t('procConvertPdf') : Lang.t('procLoadImg'));

    if (isPDF) {
        const hasText = await PDFProcessor.hasEmbeddedText(file);
        canvases = await PDFProcessor.renderAll(file, (p, total, canvas) => {
            progress.showPageCanvas(canvas, p);
            const of = Lang.isRTL() ? 'من' : 'of';
            progress.setProgress(15 + Math.round((p / total) * 20), `${Lang.t('procPage')} ${p} ${of} ${total}...`);
        });

        if (hasText) {
            progress.doneStage(1);
            progress.setStage(2);
            progress.setProgress(50, Lang.t('procExtractTxt'));
            rawText    = await PDFProcessor.extractStructuredText(file);
            confidence = 95;
            progress.setStage(3);
            progress.doneStage(2);
            progress.doneStage(3);
        } else {
            const res  = await runPreprocessAndOCR(canvases);
            rawText    = res._text;
            confidence = res._conf;
            canvases   = res._canvases;
        }
    } else {
        const original = await ImageProcessor.fileToCanvas(file);
        canvases = [original];
        progress.showPageCanvas(original, 1);
        progress.doneStage(1);
        const res  = await runPreprocessAndOCR(canvases);
        rawText    = res._text;
        confidence = res._conf;
        canvases   = res._canvases;
    }

    // Stage 4: استخراج البيانات
    progress.setStage(4);
    progress.setProgress(95, settings.hasKey() ? Lang.t('procAiExtract') : Lang.t('procExtract'));
    await delay(200);

    // Debug
    console.group(`InvoScan — ${file.name}`);
    rawText.split('\n').forEach((l, i) => { if (l.trim()) console.log(`[${i}]`, JSON.stringify(l)); });
    console.groupEnd();

    const parsed     = await InvoiceParser.parse(rawText, confidence);
    parsed.filename  = file.name;
    parsed._canvases = canvases;

    // تطبيق القالب إن وُجد تطابق
    const matchedTmpl = TemplateMatcher.findMatch(rawText);
    if (matchedTmpl) {
        try {
            const tmplItems = await PDFProcessor.extractItems(file);
            const tmplResult = TemplateEngine.extract(tmplItems, matchedTmpl);
            for (const [k, v] of Object.entries(tmplResult)) {
                const valid = Array.isArray(v) ? v.length > 0 : String(v || '').trim();
                if (valid) parsed[k] = v;
            }
            parsed._templateUsed = matchedTmpl.name;
        } catch (e) {
            console.warn('[Template] Failed to apply:', e.message);
        }
    }

    state.currentFile = file;
    console.log('InvoScan — Parsed:', parsed);

    progress.setProgress(100, Lang.t('procDone'));
    progress.doneStage(4);
    await delay(400);

    return parsed;
}

async function runPreprocessAndOCR(canvases) {
    progress.setStage(2);
    progress.setProgress(35, Lang.t('procEnhance'));
    const processed = canvases.map(c => ImageProcessor.preprocess(c));
    progress.doneStage(2);

    progress.setStage(3);
    progress.setProgress(40, Lang.t('procInitOcr'));

    state.ocr = new OCREngine((pct, msg) => {
        if (pct !== null) progress.setProgress(40 + Math.round(pct * 0.5), msg || Lang.t('procOcr'));
        else if (msg)     progress.setProgress(null, msg);
    });

    await state.ocr.init();
    const res = await state.ocr.recognizeAll(processed);
    progress.doneStage(3);

    return { _text: res.text, _conf: res.confidence, _canvases: canvases };
}

// فاتورة واحدة
async function processSingle(file) {
    state.results   = [];
    state.currentIdx = 0;
    showPanel('processing');

    try {
        const parsed = await processFile(file);
        state.results.push(parsed);
        showResult(0);
        showPanel('results');
    } catch (err) {
        handleError(err);
    } finally {
        if (state.ocr) { await state.ocr.destroy(); state.ocr = null; }
    }
}

// معالجة كل الـ queue
async function processAllQueue() {
    if (!state.queue.length) return;
    state.results    = [];
    state.currentIdx = 0;
    const files = [...state.queue];
    state.queue = [];
    document.getElementById('batch-queue').style.display = 'none';
    document.getElementById('batch-pill').style.display  = 'none';

    showPanel('processing');

    for (let i = 0; i < files.length; i++) {
        progress.setFile(`${files[i].name} (${i + 1}/${files.length})`);
        try {
            const parsed = await processFile(files[i]);
            state.results.push(parsed);
        } catch (err) {
            if (err.message === 'cancelled') { handleError(err); return; }
            toast.warning(`تعذّر معالجة ${files[i].name}: ${err.message}`);
        } finally {
            if (state.ocr) { await state.ocr.destroy(); state.ocr = null; }
        }
    }

    if (state.results.length > 0) {
        showResult(0);
        showPanel('results');
    } else {
        showPanel('upload');
    }
}

function handleError(err) {
    if (err.message === 'cancelled') {
        toast.warning('تم إلغاء المعالجة');
    } else {
        console.error(err);
        toast.error('حدث خطأ: ' + err.message);
    }
    showPanel('upload');
}

// ════════════════════════════════════════════════════════
//  RESULTS NAVIGATION
// ════════════════════════════════════════════════════════
function showResult(idx) {
    const data = state.results[idx];
    if (!data) return;
    state.currentIdx = idx;
    state.canvases   = data._canvases || [];

    preview.setPages(state.canvases);
    results.render(data);
    document.getElementById('res-filename-lbl').textContent = data.filename || 'فاتورة';

    // AI badge
    const aiBadge = document.getElementById('ai-mode-badge');
    if (aiBadge) aiBadge.style.display = data._aiUsed ? 'flex' : 'none';

    // Template banner
    const tmplBanner = document.getElementById('template-used-banner');
    if (tmplBanner) {
        tmplBanner.style.display = data._templateUsed ? 'flex' : 'none';
        if (data._templateUsed) {
            document.getElementById('template-used-name').textContent = data._templateUsed;
        }
    }

    updateBatchNav();
}

function updateBatchNav() {
    const nav  = document.getElementById('batch-result-nav');
    const lbl  = document.getElementById('batch-nav-lbl');
    const prev = document.getElementById('btn-batch-prev');
    const next = document.getElementById('btn-batch-next');
    const btnAll    = document.getElementById('btn-export-all');
    const btnAllCsv = document.getElementById('btn-export-all-csv');
    const n    = state.results.length;

    if (nav)  nav.style.display    = n > 1 ? 'flex' : 'none';
    if (lbl)  lbl.textContent      = `${state.currentIdx + 1} / ${n}`;
    if (prev) prev.disabled        = state.currentIdx === 0;
    if (next) next.disabled        = state.currentIdx === n - 1;
    if (btnAll)    btnAll.style.display    = n > 1 ? 'flex' : 'none';
    if (btnAllCsv) btnAllCsv.style.display = n > 1 ? 'flex' : 'none';
}

document.getElementById('btn-batch-prev')?.addEventListener('click', () => {
    if (state.currentIdx > 0) showResult(state.currentIdx - 1);
});
document.getElementById('btn-batch-next')?.addEventListener('click', () => {
    if (state.currentIdx < state.results.length - 1) showResult(state.currentIdx + 1);
});

// ════════════════════════════════════════════════════════
//  PANEL NAVIGATION
// ════════════════════════════════════════════════════════
function showPanel(phase) {
    state.phase = phase;
    const panels = {
        upload:     'panel-upload',
        processing: 'panel-processing',
        results:    'panel-results',
        template:   'panel-template',
    };
    Object.entries(panels).forEach(([p, id]) => {
        const el = document.getElementById(id);
        if (el) el.style.display = p === phase ? 'flex' : 'none';
    });
    const showNew = phase === 'results';
    document.getElementById('btn-new-invoice').style.display = showNew ? 'flex' : 'none';
    document.getElementById('sep-new').style.display         = showNew ? 'block' : 'none';
}

function resetToUpload() {
    preview.clear();
    results.clear();
    state.results    = [];
    state.currentIdx = 0;
    state.canvases   = [];
    showPanel('upload');
}

document.getElementById('btn-back')?.addEventListener('click', () => {
    if (state.ocr) state.ocr.cancel();
    resetToUpload();
});
document.getElementById('btn-new-invoice')?.addEventListener('click', resetToUpload);
document.getElementById('btn-cancel-proc')?.addEventListener('click', () => {
    if (state.ocr) state.ocr.cancel();
    showPanel('upload');
});

// ════════════════════════════════════════════════════════
//  EXPORT
// ════════════════════════════════════════════════════════
const exportTrigger = document.querySelector('.btn-export-trigger');
const exportMenu    = document.querySelector('.dropdown-menu');

exportTrigger?.addEventListener('click', e => {
    e.stopPropagation();
    exportMenu.classList.toggle('open');
});
document.addEventListener('click', () => exportMenu?.classList.remove('open'));
exportMenu?.querySelectorAll('.dropdown-item').forEach(btn => {
    btn.addEventListener('click', () => exportMenu.classList.remove('open'));
});

document.getElementById('btn-export-excel')?.addEventListener('click', async () => {
    const data = results.getData();
    if (!data) { toast.warning('لا توجد بيانات للتصدير'); return; }
    try {
        await ExcelExporter.export(data);
        toast.success('تم تصدير Excel بنجاح');
    } catch (e) {
        toast.error('فشل تصدير Excel: ' + e.message);
    }
});

document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    const data = results.getData();
    if (!data) { toast.warning('لا توجد بيانات للتصدير'); return; }
    CSVExporter.export(data);
    toast.success('تم تصدير CSV بنجاح');
});

document.getElementById('btn-export-all')?.addEventListener('click', async () => {
    if (!state.results.length) return;
    try {
        await ExcelExporter.exportBatch(state.results);
        toast.success(`تم تصدير ${state.results.length} فاتورة في جدول واحد`);
    } catch (e) {
        toast.error('فشل التصدير: ' + e.message);
    }
});

document.getElementById('btn-export-all-csv')?.addEventListener('click', () => {
    if (!state.results.length) return;
    CSVExporter.exportBatch(state.results);
    toast.success(`تم تصدير ${state.results.length} فاتورة (CSV)`);
});

// ════════════════════════════════════════════════════════
//  TEMPLATE SYSTEM
// ════════════════════════════════════════════════════════

// زر "رجوع" من محرر القالب
document.getElementById('btn-tmpl-back')?.addEventListener('click', () => {
    if (state.results.length > 0) showPanel('results');
    else showPanel('upload');
});

// زر "قالب" في شريط النتائج → فتح محرر القالب بالملف الحالي
document.getElementById('btn-create-template')?.addEventListener('click', () => {
    if (state.currentFile) {
        showPanel('template');
        templateEditor.open(state.currentFile);
    } else {
        toast.warning('لا يوجد ملف محمّل حالياً');
    }
});

// إغلاق بانر القالب المكتشف
document.getElementById('btn-dismiss-template-banner')?.addEventListener('click', () => {
    document.getElementById('template-used-banner').style.display = 'none';
});

// استيراد قالب عبر JSON
document.getElementById('tmpl-import-input')?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const tmpl = await TemplateExporter.importJSON(file);
        toast.success(`تم استيراد القالب: ${tmpl.name}`);
        e.target.value = '';
    } catch (err) {
        toast.error('فشل الاستيراد: ' + err.message);
    }
});

// التقاط toast events من TemplateEditor
document.addEventListener('invoscan-toast', e => {
    const { msg, type } = e.detail;
    if (type === 'success') toast.success(msg);
    else if (type === 'error') toast.error(msg);
    else toast.warning(msg);
});

// ════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════
document.getElementById('btn-settings')?.addEventListener('click', () => settings.open());

// ════════════════════════════════════════════════════════
//  DARK MODE
// ════════════════════════════════════════════════════════
document.getElementById('btn-theme').addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('invoscan-theme', dark ? 'dark' : 'light');
    document.getElementById('theme-icon').className = dark ? 'fas fa-sun' : 'fas fa-moon';
});
if (document.documentElement.classList.contains('dark')) {
    document.getElementById('theme-icon').className = 'fas fa-sun';
}

// ════════════════════════════════════════════════════════
//  COPY RAW TEXT
// ════════════════════════════════════════════════════════
document.getElementById('btn-copy-raw')?.addEventListener('click', e => {
    e.stopPropagation();
    const pre = document.getElementById('raw-text-pre');
    if (!pre) return;
    navigator.clipboard?.writeText(pre.textContent).then(() => {
        const btn = document.getElementById('btn-copy-raw');
        if (btn) {
            btn.textContent = Lang.t('copiedRaw');
            setTimeout(() => { btn.textContent = Lang.t('copyRaw'); }, 2000);
        }
    }).catch(() => {});
});

// ════════════════════════════════════════════════════════
//  LANGUAGE
// ════════════════════════════════════════════════════════
Lang.init();
document.getElementById('btn-lang')?.addEventListener('click', () => Lang.toggle());

// ════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════
showPanel('upload');
setTimeout(() => toast.show(
    Lang.isRTL() ? 'مرحباً! ارفع فاتورة للبدء' : 'Welcome! Upload an invoice to start',
    'success'
), 600);

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

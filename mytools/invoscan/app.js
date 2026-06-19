// app.js — InvoScan: نقطة الدخول والمنسق الرئيسي

import { FileHandler }   from './core/FileHandler.js';
import { PDFProcessor }  from './core/PDFProcessor.js';
import { ImageProcessor} from './core/ImageProcessor.js';
import { OCREngine }     from './core/OCREngine.js';
import { InvoiceParser } from './extraction/InvoiceParser.js';
import { PreviewPanel }  from './ui/PreviewPanel.js';
import { ResultsTable }  from './ui/ResultsTable.js';
import { ProgressPanel } from './ui/ProgressPanel.js';
import { Toast }         from './ui/Toast.js';
import { ExcelExporter } from './export/ExcelExporter.js';
import { CSVExporter }   from './export/CSVExporter.js';

// ── Instances ────────────────────────────────────────────
const toast    = new Toast('toast-container');
const preview  = new PreviewPanel();
const results  = new ResultsTable();
const progress = new ProgressPanel();

// ── State ─────────────────────────────────────────────────
const state = {
    phase:   'upload',       // 'upload' | 'processing' | 'results'
    queue:   [],             // files waiting to process
    canvases:[],             // rendered page canvases
    ocr:     null,           // active OCREngine instance
    data:    null,           // last parsed invoice data
};

// ════════════════════════════════════════════════════════
//  FILE HANDLER
// ════════════════════════════════════════════════════════
const fileInput = document.getElementById('file-input');
const dropzone  = document.getElementById('dropzone');

new FileHandler(dropzone, fileInput, {
    onFiles: files => {
        if (files.length === 1 && state.queue.length === 0) {
            // Single file: process immediately
            processSingle(files[0]);
        } else {
            // Multiple files: add to queue
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
    document.getElementById('batch-queue').style.display = 'block';
    document.getElementById('batch-pill').style.display  = 'flex';
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
            <button class="bi-del" data-idx="${i}">
                <i class="fas fa-times"></i>
            </button>`;
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
document.getElementById('btn-process-all')?.addEventListener('click', () => processQueue());

// ════════════════════════════════════════════════════════
//  MAIN PROCESSING FLOW
// ════════════════════════════════════════════════════════
async function processSingle(file) {
    showPanel('processing');
    progress.setFile(file.name);

    const isPDF  = file.type === 'application/pdf';
    let rawText  = '';
    let canvases = [];
    let confidence = 0;

    try {
        // ── STAGE 0: Load ─────────────────────────────
        progress.setStage(0);
        progress.setProgress(5, 'جاري تحميل الملف...');

        // ── STAGE 1: Render ───────────────────────────
        progress.setStage(1);
        progress.setProgress(15, isPDF ? 'تحويل صفحات PDF...' : 'تحميل الصورة...');

        if (isPDF) {
            // Try embedded text first (fast path)
            const hasText = await PDFProcessor.hasEmbeddedText(file);

            canvases = await PDFProcessor.renderAll(file, (p, total, canvas) => {
                progress.showPageCanvas(canvas, p);
                progress.setProgress(15 + Math.round((p / total) * 20), `تحويل صفحة ${p} من ${total}...`);
            });

            if (hasText) {
                // Skip OCR — use structured text extraction (preserves table columns)
                progress.doneStage(1);
                progress.setStage(2);
                progress.setProgress(50, 'استخراج النص المنظم...');
                rawText    = await PDFProcessor.extractStructuredText(file);
                confidence = 95;
                progress.setStage(3);
                progress.doneStage(2);
                progress.doneStage(3);
            } else {
                // No embedded text → use OCR
                canvases = await runPreprocessAndOCR(canvases, progress);
                rawText     = canvases._text;
                confidence  = canvases._conf;
                canvases    = canvases._canvases;
            }
        } else {
            // Image file
            const original = await ImageProcessor.fileToCanvas(file);
            canvases = [original];
            progress.showPageCanvas(original, 1);
            progress.doneStage(1);

            const res = await runPreprocessAndOCR(canvases, progress);
            rawText    = res._text;
            confidence = res._conf;
            canvases   = res._canvases;
        }

        // ── STAGE 4: Extract ──────────────────────────
        progress.setStage(4);
        progress.setProgress(95, 'استخراج البيانات...');
        await delay(200); // small pause for UX

        // Debug: show raw structured text line-by-line
        console.group('InvoScan — Structured Text (lines)');
        rawText.split('\n').forEach((l, i) => { if (l.trim()) console.log(`[${i}]`, JSON.stringify(l)); });
        console.groupEnd();

        const parsed  = InvoiceParser.parse(rawText, confidence);
        parsed.filename = file.name;
        console.log('InvoScan — Parsed result:', parsed);

        state.canvases = canvases;
        state.data     = parsed;

        progress.setProgress(100, 'اكتمل!');
        progress.doneStage(4);
        await delay(400);

        // Show results
        preview.setPages(canvases);
        results.render(parsed);
        showPanel('results');

        document.getElementById('res-filename-lbl').textContent = file.name;

    } catch (err) {
        if (err.message === 'cancelled') {
            toast.warning('تم إلغاء المعالجة');
            showPanel('upload');
        } else {
            console.error(err);
            toast.error('حدث خطأ أثناء المعالجة: ' + err.message);
            showPanel('upload');
        }
    } finally {
        if (state.ocr) { await state.ocr.destroy(); state.ocr = null; }
    }
}

async function runPreprocessAndOCR(canvases, progress) {
    // Preprocess
    progress.setStage(2);
    progress.setProgress(35, 'تحسين جودة الصورة...');
    const processed = canvases.map(c => ImageProcessor.preprocess(c));
    progress.doneStage(2);

    // OCR
    progress.setStage(3);
    progress.setProgress(40, 'تهيئة محرك OCR...');

    state.ocr = new OCREngine((pct, msg) => {
        if (pct !== null) {
            progress.setProgress(40 + Math.round(pct * 0.5), msg || 'جاري التعرف على النص...');
        } else if (msg) {
            progress.setProgress(null, msg);
        }
    });

    await state.ocr.init();

    const res  = await state.ocr.recognizeAll(processed);
    progress.doneStage(3);

    return { _text: res.text, _conf: res.confidence, _canvases: canvases };
}

async function processQueue() {
    if (!state.queue.length) return;
    // Process first in queue (sequential for memory efficiency)
    const file = state.queue.shift();
    renderQueue();
    if (!state.queue.length) {
        document.getElementById('batch-queue').style.display = 'none';
        document.getElementById('batch-pill').style.display  = 'none';
    } else {
        document.getElementById('batch-count-lbl').textContent = state.queue.length;
    }
    await processSingle(file);
}

// ════════════════════════════════════════════════════════
//  PANEL NAVIGATION
// ════════════════════════════════════════════════════════
function showPanel(phase) {
    state.phase = phase;
    const panels = { upload: 'panel-upload', processing: 'panel-processing', results: 'panel-results' };

    Object.entries(panels).forEach(([p, id]) => {
        const el = document.getElementById(id);
        if (el) el.style.display = p === phase ? 'flex' : 'none';
    });

    // Show/hide toolbar buttons
    const showNew = phase === 'results';
    const btnNew  = document.getElementById('btn-new-invoice');
    const sepNew  = document.getElementById('sep-new');
    if (btnNew)  btnNew.style.display  = showNew ? 'flex' : 'none';
    if (sepNew)  sepNew.style.display  = showNew ? 'block' : 'none';
}

document.getElementById('btn-back')?.addEventListener('click', () => {
    if (state.ocr) { state.ocr.cancel(); }
    preview.clear();
    results.clear();
    state.data = null;
    state.canvases = [];
    showPanel('upload');
});

document.getElementById('btn-new-invoice')?.addEventListener('click', () => {
    preview.clear();
    results.clear();
    state.data = null;
    state.canvases = [];
    showPanel('upload');
});

document.getElementById('btn-cancel-proc')?.addEventListener('click', () => {
    if (state.ocr) state.ocr.cancel();
    showPanel('upload');
});

// ════════════════════════════════════════════════════════
//  EXPORT DROPDOWN (click-toggle — avoids hover-gap issue)
// ════════════════════════════════════════════════════════
const exportTrigger = document.querySelector('.btn-export-trigger');
const exportMenu    = document.querySelector('.dropdown-menu');

exportTrigger?.addEventListener('click', e => {
    e.stopPropagation();
    exportMenu.classList.toggle('open');
});

// Close when clicking anywhere else
document.addEventListener('click', () => exportMenu?.classList.remove('open'));

// Close after choosing an item
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
//  INIT
// ════════════════════════════════════════════════════════
showPanel('upload');
setTimeout(() => toast.show('مرحباً! ارفع فاتورة للبدء', 'success'), 600);

// ── Helpers ───────────────────────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

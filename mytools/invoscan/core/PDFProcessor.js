// core/PDFProcessor.js — تحويل صفحات PDF إلى canvas ونصوص منظمة

const RENDER_SCALE = 2.5;

export class PDFProcessor {
    static init() {
        if (!window.pdfjsLib) throw new Error('PDF.js لم يُحمَّل');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    // ── Render all pages to canvases ─────────────────────────
    static async renderAll(file, onPageDone) {
        PDFProcessor.init();
        const ab  = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
        const canvases = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            const canvas = await PDFProcessor._renderPage(pdf, i);
            canvases.push(canvas);
            if (onPageDone) onPageDone(i, pdf.numPages, canvas);
        }
        return canvases;
    }

    static async _renderPage(pdf, pageNum) {
        const page     = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas   = document.createElement('canvas');
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        return canvas;
    }

    // ── Structured text extraction (preserves table rows) ────
    //
    // Strategy: group text items by Y coordinate (same "row"),
    // sort each row left-to-right by X, join with TAB.
    // This preserves column structure far better than flat join.
    //
    static async extractStructuredText(file) {
        PDFProcessor.init();
        const ab  = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
        let allText = '';

        for (let p = 1; p <= pdf.numPages; p++) {
            const page     = await pdf.getPage(p);
            const viewport = page.getViewport({ scale: 1 });
            const content  = await page.getTextContent({ normalizeWhitespace: true });

            // Y-tolerance: ~0.8% of page height groups text on same visual line
            const Y_TOL = Math.max(4, viewport.height * 0.008);
            const rows  = [];

            for (const item of content.items) {
                const str = (item.str || '').trim();
                if (!str) continue;
                const x = item.transform[4];
                const y = item.transform[5];

                let row = rows.find(r => Math.abs(r.y - y) <= Y_TOL);
                if (!row) { row = { y, items: [] }; rows.push(row); }
                row.items.push({ x, str });
            }

            // Sort rows top→bottom (PDF Y axis is bottom-up)
            rows.sort((a, b) => b.y - a.y);

            const pageLines = rows.map(row => {
                row.items.sort((a, b) => a.x - b.x);
                // Gap threshold: 4% of page width = likely different column
                const TAB_THRESHOLD = viewport.width * 0.04;
                const parts = [];
                let prevEnd = null;
                for (const it of row.items) {
                    if (prevEnd !== null) {
                        const gap = it.x - prevEnd;
                        parts.push(gap > TAB_THRESHOLD ? '\t' : ' ');
                    }
                    parts.push(it.str);
                    // Use PDF item.width if available, else estimate from font size
                    const w = it.width > 0 ? it.width : (it.str.length * (it.height || 8) * 0.55);
                    prevEnd = it.x + w;
                }
                return parts.join('');
            });

            allText += pageLines.join('\n') + '\n\n';
        }
        return allText.trim();
    }

    // ── Legacy flat extraction (for hasEmbeddedText check) ───
    static async extractText(file) {
        PDFProcessor.init();
        const ab  = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
        let txt = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page    = await pdf.getPage(i);
            const content = await page.getTextContent();
            txt += content.items.map(it => it.str).join(' ') + '\n\n';
        }
        return txt.trim();
    }

    static async hasEmbeddedText(file) {
        try {
            const t = await PDFProcessor.extractText(file);
            return t.replace(/\s/g, '').length > 30;
        } catch { return false; }
    }

    // ── Extract text items with normalized (0-1) coordinates ─
    // يُستخدم من قِبَل TemplateEngine لتطبيق القوالب
    // x, y, w كلها بين 0 و 1 نسبةً لأبعاد الصفحة
    // ملاحظة: PDF y=0 في الأسفل → نعكسه ليصبح y=0 في الأعلى
    static async extractItems(file) {
        PDFProcessor.init();
        const ab  = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
        const allItems = [];

        for (let p = 1; p <= pdf.numPages; p++) {
            const page     = await pdf.getPage(p);
            const viewport = page.getViewport({ scale: 1 });
            const content  = await page.getTextContent({ normalizeWhitespace: true });

            for (const item of content.items) {
                const str = (item.str || '').trim();
                if (!str) continue;
                const pdfX = item.transform[4];
                const pdfY = item.transform[5];
                allItems.push({
                    str,
                    x: pdfX / viewport.width,
                    y: 1 - (pdfY / viewport.height), // flip Y
                    w: (item.width > 0 ? item.width : str.length * 6) / viewport.width,
                    page: p,
                });
            }
        }
        return allItems;
    }
}

// ui/TemplateEditor.js — محرر القوالب البصري

import { PDFProcessor }    from '../core/PDFProcessor.js';
import { TemplateEngine }  from '../core/TemplateEngine.js';
import { TemplateExporter} from '../export/TemplateExporter.js';

/* ── Field metadata ─────────────────────────────────────── */
const PALETTE = ['#2563eb','#16a34a','#dc2626','#d97706','#7c3aed','#0891b2','#db2777','#65a30d','#ea580c','#6366f1'];

const FIELD_META = {
    invoiceNumber: { label: 'رقم الفاتورة',       color: PALETTE[0] },
    date:          { label: 'تاريخ الفاتورة',      color: PALETTE[1] },
    dueDate:       { label: 'تاريخ الاستحقاق',     color: PALETTE[2] },
    supplier:      { label: 'المورد',               color: PALETTE[3] },
    customer:      { label: 'العميل',               color: PALETTE[4] },
    vatNumber:     { label: 'الرقم الضريبي',        color: PALETTE[5] },
    poNumber:      { label: 'رقم أمر الشراء',       color: PALETTE[6] },
    subtotal:      { label: 'المجموع قبل الضريبة',  color: PALETTE[0] },
    tax:           { label: 'قيمة الضريبة',         color: PALETTE[1] },
    discount:      { label: 'الخصم',                color: PALETTE[2] },
    total:         { label: 'الإجمالي الكلي',       color: PALETTE[3] },
    table:         { label: 'جدول البنود',           color: '#7c3aed', type: 'table' },
};

const COLUMN_FIELDS = [
    { id: 'skip',        label: '— تجاهل —' },
    { id: 'description', label: 'الوصف / البند' },
    { id: 'qty',         label: 'الكمية' },
    { id: 'unitPrice',   label: 'سعر الوحدة' },
    { id: 'total',       label: 'الإجمالي' },
    { id: 'discount',    label: 'الخصم' },
    { id: 'tax',         label: 'الضريبة' },
    { id: 'vatPct',      label: 'نسبة الضريبة %' },
    { id: 'itemCode',    label: 'رقم الصنف' },
];

export class TemplateEditor {
    constructor() {
        this._file        = null;
        this._textItems   = [];
        this._regions     = [];
        this._idCtr       = 0;
        this._drawing     = false;
        this._sx = this._sy = 0;
        this._currentDraw = null;
        this._pendingBox  = null;
        this._canvasW     = 0;
        this._canvasH     = 0;

        this._setupEvents();
    }

    // ── Public API ───────────────────────────────────────────

    async open(file) {
        this._file    = file;
        this._regions = [];
        this._idCtr   = 0;
        if (document.getElementById('tmpl-name'))   document.getElementById('tmpl-name').value   = '';
        if (document.getElementById('tmpl-anchor')) document.getElementById('tmpl-anchor').value = '';

        // رسم الصفحة الأولى على canvas الخلفية
        const bgCanvas  = document.getElementById('tmpl-bg-canvas');
        const drawCanvas= document.getElementById('tmpl-draw-canvas');
        if (!bgCanvas) return;

        try {
            const [rendered] = await PDFProcessor.renderAll(file, null);
            bgCanvas.width   = rendered.width;
            bgCanvas.height  = rendered.height;
            this._canvasW    = rendered.width;
            this._canvasH    = rendered.height;
            bgCanvas.getContext('2d').drawImage(rendered, 0, 0);

            drawCanvas.width  = rendered.width;
            drawCanvas.height = rendered.height;

            // استخراج العناصر النصية بإحداثيات نسبية
            this._textItems = await PDFProcessor.extractItems(file);
        } catch (e) {
            console.error('[TemplateEditor] Failed to render:', e);
        }

        this._redraw();
        this._renderRegionList();
    }

    // ── Event setup ──────────────────────────────────────────

    _setupEvents() {
        // سيُستدعى بعد أن يُبنى DOM
        document.addEventListener('DOMContentLoaded', () => this._bindDOM());
        // إذا DOM محمّل بالفعل (script type=module بعد body)
        if (document.readyState !== 'loading') this._bindDOM();
    }

    _bindDOM() {
        const drawCanvas = document.getElementById('tmpl-draw-canvas');
        if (drawCanvas) this._bindCanvas(drawCanvas);

        // btn-tmpl-back is handled by app.js (needs state.phase awareness)

        document.getElementById('btn-tmpl-clear')?.addEventListener('click', () => {
            this._regions = [];
            this._redraw();
            this._renderRegionList();
        });

        document.getElementById('btn-tmpl-save')?.addEventListener('click', () => this._save());
        document.getElementById('btn-tmpl-export')?.addEventListener('click', () => this._export());
        document.getElementById('btn-tmpl-library')?.addEventListener('click', () => this._openLibrary());
        document.getElementById('btn-lib-close')?.addEventListener('click', () => {
            document.getElementById('template-library-overlay').style.display = 'none';
        });
        document.getElementById('btn-col-confirm')?.addEventListener('click', () => this._confirmColumns());
        document.getElementById('btn-col-cancel')?.addEventListener('click', () => {
            this._regions.pop(); // remove pending table region
            document.getElementById('column-step').style.display = 'none';
            this._redraw();
            this._renderRegionList();
        });

        // إغلاق field picker بالنقر خارجه
        document.addEventListener('click', e => {
            const picker = document.getElementById('field-picker');
            if (picker && !picker.contains(e.target) && picker.style.display !== 'none') {
                picker.style.display = 'none';
                this._pendingBox = null;
                this._redraw();
            }
        });
    }

    _bindCanvas(canvas) {
        const getPos = e => {
            const r = canvas.getBoundingClientRect();
            return {
                x: ((e.clientX - r.left) / r.width),
                y: ((e.clientY - r.top)  / r.height),
            };
        };

        canvas.addEventListener('mousedown', e => {
            if (e.button !== 0) return;
            const p = getPos(e);
            this._sx = p.x; this._sy = p.y;
            this._drawing = true;
            this._currentDraw = null;
        });

        canvas.addEventListener('mousemove', e => {
            if (!this._drawing) return;
            const p = getPos(e);
            this._currentDraw = this._normBox(this._sx, this._sy, p.x, p.y);
            this._redraw();
        });

        canvas.addEventListener('mouseup', e => {
            if (!this._drawing) return;
            this._drawing = false;
            const p   = getPos(e);
            const box = this._normBox(this._sx, this._sy, p.x, p.y);
            this._currentDraw = null;
            if (box.w > 0.01 && box.h > 0.005) {
                this._pendingBox = box;
                this._showFieldPicker(box, e.clientX, e.clientY);
            }
            this._redraw();
        });

        canvas.addEventListener('mouseleave', () => {
            if (this._drawing) { this._drawing = false; this._currentDraw = null; this._redraw(); }
        });

        // منع click على canvas من إغلاق field picker
        canvas.addEventListener('click', e => e.stopPropagation());
    }

    // ── Drawing ──────────────────────────────────────────────

    _redraw() {
        const canvas = document.getElementById('tmpl-draw-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        for (const r of this._regions) {
            const { box } = r;
            const [bx, by, bw, bh] = [box.x * W, box.y * H, box.w * W, box.h * H];
            const color = r.color || '#2563eb';

            ctx.fillStyle   = color + '28';
            ctx.strokeStyle = color;
            ctx.lineWidth   = 2;
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeRect(bx, by, bw, bh);

            // label badge
            ctx.fillStyle   = color;
            ctx.font        = `bold ${Math.max(10, H * 0.014)}px Tajawal, sans-serif`;
            ctx.textAlign   = 'right';
            ctx.textBaseline = 'top';

            const labelX = bx + bw - 4;
            const labelY = by + 4;
            const text   = r.label;
            const tw     = ctx.measureText(text).width;

            ctx.fillStyle = color + 'cc';
            ctx.beginPath();
            ctx.roundRect?.(labelX - tw - 6, labelY - 2, tw + 10, 18, 4);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText(text, labelX, labelY);
            ctx.textAlign = 'left';

            // column dividers for table regions
            if (r.type === 'table' && r.columns?.length) {
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = color + 'aa';
                ctx.lineWidth   = 1.5;
                for (const col of r.columns) {
                    if (col.field === 'skip') continue;
                    const cx = (box.x + col.x) * W;
                    ctx.beginPath();
                    ctx.moveTo(cx, by);
                    ctx.lineTo(cx, by + bh);
                    ctx.stroke();
                }
                ctx.setLineDash([]);
            }
        }

        // current drag preview
        if (this._currentDraw) {
            const b = this._currentDraw;
            ctx.fillStyle   = 'rgba(37,99,235,.12)';
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth   = 2;
            ctx.setLineDash([5, 3]);
            ctx.fillRect(b.x * W, b.y * H, b.w * W, b.h * H);
            ctx.strokeRect(b.x * W, b.y * H, b.w * W, b.h * H);
            ctx.setLineDash([]);
        }
    }

    // ── Field picker ─────────────────────────────────────────

    _showFieldPicker(box, clientX, clientY) {
        const picker = document.getElementById('field-picker');
        if (!picker) return;

        picker.style.display = 'block';
        const vw = window.innerWidth, vh = window.innerHeight;
        let left = clientX + 10, top = clientY + 10;
        if (left + 210 > vw) left = clientX - 218;
        if (top  + 340 > vh) top  = clientY - 348;
        picker.style.left = left + 'px';
        picker.style.top  = top  + 'px';

        // ربط أزرار الاختيار
        picker.querySelectorAll('[data-field]').forEach(btn => {
            btn.onclick = e => {
                e.stopPropagation();
                picker.style.display = 'none';
                const field = btn.dataset.field;
                if (field === '__cancel__' || !this._pendingBox) {
                    this._pendingBox = null;
                    this._redraw();
                    return;
                }
                this._addRegion(this._pendingBox, field);
                this._pendingBox = null;
            };
        });
    }

    // ── Region management ────────────────────────────────────

    _addRegion(box, field) {
        const meta  = FIELD_META[field] || { label: field, color: '#6366f1' };
        const region = {
            id:    ++this._idCtr,
            field,
            label: meta.label,
            color: meta.color,
            type:  meta.type || 'field',
            box,
        };
        this._regions.push(region);

        if (field === 'table') {
            this._startColumnStep(region);
        } else {
            this._redraw();
            this._renderRegionList();
        }
    }

    _startColumnStep(tableRegion) {
        const inTable = this._textItems.filter(i =>
            i.x >= tableRegion.box.x && i.x <= tableRegion.box.x + tableRegion.box.w &&
            i.y >= tableRegion.box.y && i.y <= tableRegion.box.y + tableRegion.box.h
        );
        const detectedCols = TemplateEngine.detectColumns(inTable, tableRegion.box);

        const list = document.getElementById('column-assignments');
        if (list) {
            if (detectedCols.length === 0) {
                list.innerHTML = `
                    <p class="col-no-detect">
                        <i class="fas fa-exclamation-triangle"></i>
                        لم يُكتشف نص في رأس الجدول.
                        تأكد أن المنطقة تشمل صف الرأس.
                    </p>`;
            } else {
                list.innerHTML = detectedCols.map((col, i) => `
                    <div class="col-assign-row">
                        <span class="col-detected-label" title="${col.label}">${col.label || '—'}</span>
                        <select class="col-field-select" data-col="${i}">
                            ${COLUMN_FIELDS.map(f =>
                                `<option value="${f.id}">${f.label}</option>`
                            ).join('')}
                        </select>
                    </div>
                `).join('');
            }
        }

        // حفظ مؤقت
        tableRegion._detectedCols = detectedCols;
        const step = document.getElementById('column-step');
        if (step) step.style.display = 'flex';
    }

    _confirmColumns() {
        const tableRegion = this._regions.find(r => r.type === 'table' && !r.columns);
        if (!tableRegion) { document.getElementById('column-step').style.display = 'none'; return; }

        const list = document.getElementById('column-assignments');
        const cols = tableRegion._detectedCols || [];
        list?.querySelectorAll('.col-field-select').forEach((sel, i) => {
            if (cols[i]) cols[i].field = sel.value;
        });

        tableRegion.columns = cols;
        delete tableRegion._detectedCols;
        document.getElementById('column-step').style.display = 'none';
        this._redraw();
        this._renderRegionList();
    }

    // ── Sidebar list ─────────────────────────────────────────

    _renderRegionList() {
        const list  = document.getElementById('tmpl-regions-list');
        const count = document.getElementById('tmpl-count');
        if (!list) return;
        if (count) count.textContent = this._regions.length;

        if (!this._regions.length) {
            list.innerHTML = `
                <div class="tmpl-empty-hint">
                    <i class="fas fa-draw-polygon"></i>
                    ارسم مربعاً على الفاتورة لتحديد منطقة
                </div>`;
            return;
        }

        list.innerHTML = this._regions.map(r => `
            <div class="region-item">
                <span class="ri-dot" style="background:${r.color}"></span>
                <span class="ri-label">${r.label}</span>
                <span class="ri-badge ${r.type === 'table' ? 'ri-table' : 'ri-field'}">
                    ${r.type === 'table' ? 'جدول' : 'حقل'}
                </span>
                <button class="ri-del" data-id="${r.id}" title="حذف">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        list.querySelectorAll('.ri-del').forEach(btn => {
            btn.addEventListener('click', () => {
                this._regions = this._regions.filter(r => r.id !== +btn.dataset.id);
                this._redraw();
                this._renderRegionList();
            });
        });
    }

    // ── Save / Export / Library ──────────────────────────────

    _buildTemplate() {
        return {
            id:      crypto.randomUUID?.() || Date.now().toString(36),
            name:    document.getElementById('tmpl-name')?.value?.trim()   || 'قالب جديد',
            anchor:  document.getElementById('tmpl-anchor')?.value?.trim() || '',
            created: new Date().toISOString().slice(0, 10),
            version: '1.0',
            regions: this._regions.map(r => {
                const { id: _, color: __, ...clean } = r;
                return clean;
            }),
        };
    }

    _save() {
        const tmpl = this._buildTemplate();
        if (tmpl.regions.length === 0) {
            this._toast('ارسم منطقة واحدة على الأقل قبل الحفظ', 'warn');
            return;
        }
        TemplateExporter.save(tmpl);
        this._toast(`تم حفظ القالب: ${tmpl.name}`, 'success');
    }

    _export() {
        const tmpl = this._buildTemplate();
        if (tmpl.regions.length === 0) {
            this._toast('ارسم منطقة واحدة على الأقل أولاً', 'warn');
            return;
        }
        TemplateExporter.exportJSON(tmpl);
    }

    _openLibrary() {
        const overlay = document.getElementById('template-library-overlay');
        if (!overlay) return;
        this._renderLibrary();
        overlay.style.display = 'flex';
    }

    _renderLibrary() {
        const body = document.getElementById('template-library-body');
        if (!body) return;
        const templates = TemplateExporter.list();

        if (!templates.length) {
            body.innerHTML = `<p style="color:var(--muted);text-align:center;padding:20px">لا توجد قوالب محفوظة</p>`;
            return;
        }

        body.innerHTML = templates.map(t => `
            <div class="lib-item">
                <div class="lib-info">
                    <span class="lib-name">${t.name}</span>
                    <span class="lib-meta">
                        ${t.regions?.length || 0} منطقة
                        ${t.anchor ? `· anchor: "${t.anchor.slice(0, 20)}"` : ''}
                        · ${t.created || ''}
                    </span>
                </div>
                <div class="lib-actions">
                    <button class="lib-btn-export" data-id="${t.id}" title="تصدير">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="lib-btn-del" data-id="${t.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        body.querySelectorAll('.lib-btn-export').forEach(btn => {
            btn.addEventListener('click', () => {
                const t = TemplateExporter.list().find(x => x.id === btn.dataset.id);
                if (t) TemplateExporter.exportJSON(t);
            });
        });

        body.querySelectorAll('.lib-btn-del').forEach(btn => {
            btn.addEventListener('click', () => {
                TemplateExporter.delete(btn.dataset.id);
                this._renderLibrary();
            });
        });
    }

    // ── Helpers ──────────────────────────────────────────────

    _normBox(x1, y1, x2, y2) {
        return {
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            w: Math.abs(x2 - x1),
            h: Math.abs(y2 - y1),
        };
    }

    _toast(msg, type = 'success') {
        // إطلاق custom event ليلتقطه app.js
        document.dispatchEvent(new CustomEvent('invoscan-toast', { detail: { msg, type } }));
    }
}

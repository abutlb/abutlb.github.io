// ui/ResultsTable.js — جدول النتائج القابل للتعديل

import { InvoiceParser } from '../extraction/InvoiceParser.js';
import { OCREngine }     from '../core/OCREngine.js';

const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

export class ResultsTable {
    constructor() {
        this._data    = null;
        this._rowId   = 0;
    }

    // Render all results UI from parsed invoice data
    render(data) {
        this._data = data;
        this._renderFilename();
        this._renderQualityBadge();
        this._renderFields();
        this._renderItems();
        this._renderTotals();
        this._renderRawText();
    }

    getData() { return this._data; }

    _renderFilename() {
        const el = document.getElementById('res-filename-lbl');
        if (el) el.textContent = this._data.filename || 'فاتورة';
    }

    _renderQualityBadge() {
        const el  = document.getElementById('quality-badge');
        const raw = document.getElementById('raw-conf');
        if (!el) return;
        const q = OCREngine.qualityLabel(this._data.confidence);
        el.className = `quality-badge ${q.cls}`;
        el.innerHTML = `<i class="fas ${q.icon}"></i> ${q.label} (${q.pct}%)`;
        if (raw) raw.textContent = `ثقة OCR: ${q.pct}%`;
    }

    _renderFields() {
        const grid = document.getElementById('fields-grid');
        if (!grid) return;
        const defs = InvoiceParser.headerFields();
        grid.innerHTML = defs.map(f => {
            const val   = this._data[f.key] || '';
            const empty = !val;
            return `<div class="field-cell${empty ? ' empty' : ''}" style="${f.wide ? 'grid-column:span 2' : ''}">
                <label><i class="fas ${f.icon}" style="margin-inline-end:4px;opacity:.6"></i>${f.label}</label>
                <input data-field="${f.key}" value="${esc(val)}" placeholder="${empty ? 'لم يُكتشف' : ''}">
            </div>`;
        }).join('');

        // Bind changes back to data
        grid.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', () => {
                this._data[inp.dataset.field] = inp.value;
            });
        });
    }

    _renderItems() {
        const tbody    = document.getElementById('items-tbody');
        const badge    = document.getElementById('items-badge');
        if (!tbody) return;

        tbody.innerHTML = '';
        (this._data.items || []).forEach(item => this._addItemRow(item));

        if (badge) badge.textContent = this._data.items?.length || 0;

        document.getElementById('btn-add-row')?.addEventListener('click', () => {
            const item = { description: '', qty: '1', unitPrice: '', total: '' };
            this._data.items.push(item);
            this._addItemRow(item);
            if (badge) badge.textContent = this._data.items.length;
        });
    }

    _addItemRow(item) {
        const tbody = document.getElementById('items-tbody');
        const id    = ++this._rowId;
        const tr    = document.createElement('tr');
        tr.dataset.rowid = id;
        tr.innerHTML = `
            <td style="text-align:center;color:var(--muted);font-size:.75rem">${tbody.children.length + 1}</td>
            <td><input data-col="description" value="${esc(item.description)}" style="min-width:160px"></td>
            <td><input data-col="qty"         value="${esc(item.qty)}"         style="text-align:center"></td>
            <td><input data-col="unitPrice"   value="${esc(item.unitPrice)}"   style="text-align:left;direction:ltr"></td>
            <td><input data-col="total"       value="${esc(item.total)}"       style="text-align:left;direction:ltr;font-weight:700"></td>
            <td><button class="btn-row-del" title="حذف"><i class="fas fa-times"></i></button></td>`;

        // Bind inputs to item
        tr.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', () => { item[inp.dataset.col] = inp.value; });
        });

        // Delete row
        tr.querySelector('.btn-row-del').addEventListener('click', () => {
            const idx = this._data.items.indexOf(item);
            if (idx > -1) this._data.items.splice(idx, 1);
            tr.remove();
            const badge = document.getElementById('items-badge');
            if (badge) badge.textContent = this._data.items.length;
            // Re-number rows
            document.querySelectorAll('#items-tbody tr').forEach((r, i) => {
                r.cells[0].textContent = i + 1;
            });
        });

        tbody.appendChild(tr);
    }

    _renderTotals() {
        const grid = document.getElementById('totals-grid');
        if (!grid) return;
        const defs = InvoiceParser.totalFields();
        grid.innerHTML = defs.map(f => {
            const val = this._data[f.key] || '';
            if (!val && f.key !== 'total') return ''; // skip empty non-total rows
            return `<div class="total-row ${f.cls}">
                <span class="t-label">${f.label}</span>
                <input data-total="${f.key}" value="${esc(val)}" placeholder="—"
                    style="direction:ltr;text-align:left;min-width:100px">
            </div>`;
        }).join('');

        grid.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', () => { this._data[inp.dataset.total] = inp.value; });
        });
    }

    _renderRawText() {
        const pre = document.getElementById('raw-text-pre');
        if (pre) pre.textContent = this._data.rawText || '(لا يوجد نص خام)';
    }

    clear() {
        ['fields-grid','items-tbody','totals-grid','raw-text-pre'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });
        this._data = null;
    }
}

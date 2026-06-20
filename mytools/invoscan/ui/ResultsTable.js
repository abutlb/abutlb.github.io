// ui/ResultsTable.js — جدول النتائج القابل للتعديل

import { InvoiceParser } from '../extraction/InvoiceParser.js';
import { OCREngine }     from '../core/OCREngine.js';
import { Lang }          from '../i18n/Lang.js';

const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

export class ResultsTable {
    constructor() {
        this._data    = null;
        this._rowId   = 0;

        // Re-render labels when language changes (avoid re-binding item listeners)
        Lang.onChange(() => {
            if (!this._data) return;
            this._renderFields();
            this._renderTotals();
            this._applyLangLabels();
            // Update delete button titles in existing item rows without re-rendering
            document.querySelectorAll('#items-tbody .btn-row-del').forEach(btn => {
                btn.title = Lang.t('deleteRow');
            });
        });
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
        this._applyLangLabels();
    }

    getData() { return this._data; }

    _applyLangLabels() {
        // Update items table column headers
        const ths = document.querySelectorAll('#items-table th[data-i18n]');
        ths.forEach(th => { th.textContent = Lang.t(th.dataset.i18n); });
        // Update add-row button
        const addBtn = document.getElementById('btn-add-row');
        if (addBtn) { const sp = addBtn.querySelector('[data-i18n]'); if (sp) sp.textContent = Lang.t(sp.dataset.i18n); }
    }

    _renderFilename() {
        const el = document.getElementById('res-filename-lbl');
        if (el) el.textContent = this._data.filename || (Lang.isRTL() ? 'فاتورة' : 'Invoice');
    }

    _renderQualityBadge() {
        const el  = document.getElementById('quality-badge');
        const raw = document.getElementById('raw-conf');
        if (!el) return;
        const q = OCREngine.qualityLabel(this._data.confidence);
        el.className = `quality-badge ${q.cls}`;
        el.innerHTML = `<i class="fas ${q.icon}"></i> ${q.label} (${q.pct}%)`;
        if (raw) raw.textContent = `${Lang.t('ocrConf')}: ${q.pct}%`;
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
                <input data-field="${f.key}" value="${esc(val)}" placeholder="${empty ? Lang.t('notDetected') : ''}">
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
        const tbody = document.getElementById('items-tbody');
        const badge = document.getElementById('items-badge');
        if (!tbody) return;

        // Detect which extra columns exist across all items
        const items = this._data.items || [];
        this._extraCols = {
            discount:  items.some(it => it.discount  && it.discount  !== ''),
            vatPct:    items.some(it => it.vatPct    && it.vatPct    !== ''),
            vatAmount: items.some(it => it.vatAmount && it.vatAmount !== ''),
        };

        // Update table header to match
        this._updateTableHeader();

        tbody.innerHTML = '';
        items.forEach(item => this._addItemRow(item));

        if (badge) badge.textContent = items.length;

        document.getElementById('btn-add-row')?.addEventListener('click', () => {
            const item = { description: '', qty: '1', unitPrice: '', total: '' };
            this._data.items.push(item);
            this._addItemRow(item);
            if (badge) badge.textContent = this._data.items.length;
        });
    }

    _updateTableHeader() {
        const thead = document.querySelector('#items-table thead tr');
        if (!thead) return;

        const extra = this._extraCols || {};
        const t = k => Lang.t(k);
        thead.innerHTML =
            `<th style="width:32px">#</th>` +
            `<th data-i18n="colDesc">${t('colDesc')}</th>` +
            `<th style="width:72px" data-i18n="colQty">${t('colQty')}</th>` +
            `<th style="width:100px" data-i18n="colUnit">${t('colUnit')}</th>` +
            (extra.discount  ? `<th style="width:90px" data-i18n="colDiscount">${t('colDiscount')}</th>` : '') +
            (extra.vatPct    ? `<th style="width:60px" data-i18n="colVatPct">${t('colVatPct')}</th>` : '') +
            (extra.vatAmount ? `<th style="width:90px" data-i18n="colVatAmt">${t('colVatAmt')}</th>` : '') +
            `<th style="width:100px" data-i18n="colTotal">${t('colTotal')}</th>` +
            `<th style="width:32px"></th>`;
    }

    _addItemRow(item) {
        const tbody = document.getElementById('items-tbody');
        const extra = this._extraCols || {};
        const id    = ++this._rowId;
        const tr    = document.createElement('tr');
        tr.dataset.rowid = id;

        const numCell = (col, val, bold = false) =>
            `<td><input data-col="${col}" value="${esc(val)}" style="text-align:left;direction:ltr${bold ? ';font-weight:700' : ''}"></td>`;

        tr.innerHTML =
            `<td style="text-align:center;color:var(--muted);font-size:.75rem">${tbody.children.length + 1}</td>` +
            `<td><input data-col="description" value="${esc(item.description)}" style="min-width:150px"></td>` +
            `<td><input data-col="qty" value="${esc(item.qty)}" style="text-align:center"></td>` +
            numCell('unitPrice', item.unitPrice) +
            (extra.discount  ? numCell('discount',  item.discount  || '') : '') +
            (extra.vatPct    ? numCell('vatPct',     item.vatPct    || '') : '') +
            (extra.vatAmount ? numCell('vatAmount',  item.vatAmount || '') : '') +
            numCell('total', item.total, true) +
            `<td><button class="btn-row-del" title="${Lang.t('deleteRow')}"><i class="fas fa-times"></i></button></td>`;

        tr.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', () => { item[inp.dataset.col] = inp.value; });
        });

        tr.querySelector('.btn-row-del').addEventListener('click', () => {
            const idx = this._data.items.indexOf(item);
            if (idx > -1) this._data.items.splice(idx, 1);
            tr.remove();
            const badge = document.getElementById('items-badge');
            if (badge) badge.textContent = this._data.items.length;
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
        if (pre) pre.textContent = this._data.rawText || Lang.t('noRaw');
    }

    clear() {
        ['fields-grid','items-tbody','totals-grid','raw-text-pre'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });
        this._data = null;
    }
}

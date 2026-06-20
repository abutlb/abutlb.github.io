import { BasePlugin }          from '../engine/BasePlugin.js';
import { normD, cleanAmt, toFloat } from '../utils.js';

// ── Column classifier ─────────────────────────────────
function classify(s, colIndex) {
    const v = cleanAmt(s);
    if (!s?.trim()) return 'empty';
    if (!/^\d+(\.\d+)?$/.test(v)) return 'text';
    const isInt  = !(/[.,]/.test(v));
    const digits = v.replace('.', '').length;
    if (isInt && colIndex <= 1)                      return 'id';   // row# أو رقم صنف
    if (isInt && toFloat(v) <= 30 && colIndex > 1)  return 'pct';  // VAT%
    if (isInt && digits >= 5)                        return 'id';   // باركود / كود
    return 'amount';
}

const SKIP_RE   = /^\s*(?:الإجمالي\s*الكلي|Grand\s*Total|المجموع\s*الكلي|Total\s*Sold|Total\s*Discount|Total\s*Before|Subtotal|ضريبة\s*القيمة|VAT\s*Amount|شحن|Shipping|Sr\.\s*No|مسلسل$|الوصف$|الكمية$|سعر\s*الوحدة|الإجمالي$|البند$|Item$|Description$|Qty$|Unit\s*Price)/i;
const HEADER_RE = /(?:وصف\s*الصنف|Item\s*Description|اسم\s*الصنف|الوصف|البند|Description|Product|Service)/i;
const FOOTER_RE = /(?:الإجمالي\s*الكلي|Grand\s*Total|Total\s*Sold\s*Items|عدد\s*الاصناف\s*المباعة)/i;

export class TablePlugin extends BasePlugin {
    get name() { return 'table'; }

    extract(rawText) {
        const t      = normD(rawText);
        const items  = this._items(t);
        const hasTab = rawText.includes('\t');
        return {
            items: {
                value:      items,
                confidence: items.length > 0 ? (hasTab ? 0.82 : 0.65) : 0.05,
                method:     items.length > 0 ? (hasTab ? 'tab-structured' : 'numeric-heuristic') : 'none',
            },
        };
    }

    _items(t) {
        const tabItems = this._parseTabRows(t);
        if (tabItems.length > 0) return tabItems;
        return this._parseNumericLines(t);
    }

    // ── Pass 1: Tabs ──────────────────────────────────
    _parseTabRows(t) {
        const lines = t.split('\n');
        const items = [];
        let startI = 0, endI = lines.length;

        for (let i = 0; i < lines.length; i++) {
            if (HEADER_RE.test(lines[i])) startI = i + 1;
            if (FOOTER_RE.test(lines[i]) && i > startI + 1) { endI = i; break; }
        }

        for (let i = startI; i < endI; i++) {
            const line = lines[i];
            if (!line || !line.includes('\t')) continue;
            if (SKIP_RE.test(line)) continue;
            const cols = line.split('\t').map(c => c.trim()).filter(Boolean);
            if (cols.length < 2) continue;
            const item = this._colsToItem(cols);
            if (item) items.push(item);
        }

        return items;
    }

    _colsToItem(cols) {
        const classed = cols.map((c, i) => ({ c, cls: classify(c, i), i }));
        const amtCols = classed.filter(x => x.cls === 'amount');
        if (amtCols.length === 0) return null;

        const descParts = classed
            .filter(x => x.cls === 'text' || x.cls === 'id')
            .map(x => x.c).filter(Boolean);

        const desc = descParts.join(' ').trim();
        if (!desc || desc.length < 2) return null;
        if (/^\d+$/.test(desc.replace(/\s/g, ''))) return null;

        const total   = amtCols[amtCols.length - 1];
        const unitCol = amtCols.length >= 2 ? amtCols[amtCols.length - 2] : null;
        const qtyCol  = amtCols.length >= 3 ? amtCols[0] : null;

        if (toFloat(total.c) <= 0) return null;

        return {
            description: desc,
            qty:         qtyCol  ? cleanAmt(qtyCol.c)  : '',
            unitPrice:   unitCol ? cleanAmt(unitCol.c)  : '',
            total:       cleanAmt(total.c),
        };
    }

    // ── Pass 2: Numeric heuristic ─────────────────────
    _parseNumericLines(t) {
        const lines = t.split('\n').map(l => l.trim()).filter(Boolean);
        const items = [];
        const seen  = new Set();
        let startI = 0, endI = lines.length;

        for (let i = 0; i < lines.length; i++) {
            if (HEADER_RE.test(lines[i])) startI = i + 1;
            if (FOOTER_RE.test(lines[i]) && i > startI + 1) { endI = i; break; }
        }

        const scan = (from, to) => {
            for (let i = from; i < to; i++) {
                const line = lines[i];
                if (!line || SKIP_RE.test(line)) continue;
                const item = this._parseLine(line);
                if (!item) continue;
                const key = item.description.slice(0, 20);
                if (seen.has(key)) continue;
                seen.add(key);
                items.push(item);
            }
        };

        scan(startI, endI);
        if (!items.length) scan(0, lines.length);
        return items.slice(0, 50);
    }

    _parseLine(line) {
        const numRe   = /(?<!\d)\d+\.\d+(?!\d)/g;
        const amounts = [];
        let m;
        while ((m = numRe.exec(line)) !== null) {
            const v = cleanAmt(m[0]);
            if (toFloat(v) > 0) amounts.push({ val: v, start: m.index });
        }
        if (amounts.length < 1) return null;

        let desc = line.slice(0, amounts[0].start).trim();
        desc = desc.replace(/^\d{1,3}\s+/, '').replace(/\s+\d{5,8}$/, '');
        if (!desc || desc.length < 3) return null;
        if (SKIP_RE.test(desc)) return null;

        return {
            description: desc.trim(),
            qty:         amounts.length >= 3 ? amounts[0].val : '',
            unitPrice:   amounts.length >= 2 ? amounts[amounts.length - 2].val : '',
            total:       amounts[amounts.length - 1].val,
        };
    }
}

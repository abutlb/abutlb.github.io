// extraction/TableExtractor.js — استخراج بنود الفاتورة من النص المنظم

// ── Utilities ─────────────────────────────────────────────
function normD(s) {
    return (s || '').replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}
function cleanAmt(s) {
    return normD(s || '').replace(/[,،\s]/g, '').trim();
}
function toFloat(s) {
    return parseFloat(cleanAmt(s).replace(',', '.')) || 0;
}
function hasDecimal(s) {
    return /[.,]/.test(cleanAmt(s));
}
function isNumeric(s) {
    const v = cleanAmt(s);
    return /^\d+(\.\d+)?$/.test(v);
}

// Classify a column value
function classify(s, colIndex) {
    const v = cleanAmt(s);
    if (!isNumeric(s)) return 'text';

    const isInt  = !hasDecimal(s);
    const digits = v.replace('.', '').length;

    // Leading integers (pos 0-1) are row number / item code — treat as text
    if (isInt && colIndex <= 1) return 'id';

    // VAT percentage: integer, small value (5-30 range), appears in middle
    if (isInt && toFloat(v) >= 1 && toFloat(v) <= 30 && colIndex > 1) return 'pct';

    // Long integers with no decimal that look like barcodes/codes
    if (isInt && digits >= 5) return 'id';

    return 'amount';
}

// Skip lines that are clearly totals or headers
const SKIP_RE = /^\s*(?:الإجمالي\s*الكلي|Grand\s*Total|المجموع\s*الكلي|Total\s*Sold|Total\s*Discount|Total\s*Before|Subtotal|ضريبة\s*القيمة|VAT\s*Amount|خصم\s*العروض|Discount|شحن|Shipping|#\s*$|م\s*$|الوصف\s*$|الكمية\s*$|سعر\s*الوحدة|الإجمالي\s*$|البند\s*$|Item\s*$|Description\s*$|Qty\s*$|Unit\s*Price|Sr\.\s*No)/i;

const HEADER_RE = /(?:وصف\s*الصنف|Item\s*Description|اسم\s*الصنف|الوصف|البند|Description|Product|Service)/i;
const FOOTER_RE = /(?:الإجمالي\s*الكلي|Grand\s*Total|Total\s*Sold\s*Items|عدد\s*الاصناف\s*المباعة)/i;

export class TableExtractor {
    static extract(rawText) {
        const t = normD(rawText);
        return {
            items:    TableExtractor.items(t),
            subtotal: TableExtractor.subtotal(t),
            tax:      TableExtractor.tax(t),
            discount: TableExtractor.discount(t),
            total:    TableExtractor.total(t),
        };
    }

    static items(t) {
        // Pass 1: Tab-structured rows (preferred — from PDFProcessor.extractStructuredText)
        const tabItems = TableExtractor._parseTabRows(t);
        if (tabItems.length > 0) return tabItems;

        // Pass 2: Fallback — numeric-line heuristic
        return TableExtractor._parseNumericLines(t);
    }

    // ── Pass 1: Tab-separated columns ─────────────────────
    static _parseTabRows(t) {
        const lines   = t.split('\n');
        const items   = [];
        let   startI  = 0;
        let   endI    = lines.length;

        // Find table boundaries
        for (let i = 0; i < lines.length; i++) {
            if (HEADER_RE.test(lines[i])) startI = i + 1;
            if (FOOTER_RE.test(lines[i]) && i > startI + 1) { endI = i; break; }
        }

        // Scan rows in table section
        for (let i = startI; i < endI; i++) {
            const line = lines[i];
            if (!line || !line.includes('\t')) continue;
            if (SKIP_RE.test(line)) continue;

            const cols = line.split('\t').map(c => c.trim()).filter(Boolean);
            if (cols.length < 2) continue;

            const item = TableExtractor._colsToItem(cols);
            if (item) items.push(item);
        }

        return items;
    }

    // ── Convert tab-separated columns to item ─────────────
    static _colsToItem(cols) {
        // Classify each column
        const classed = cols.map((c, i) => ({ c, cls: classify(c, i), i }));

        // Amount columns only (not text, not id, not pct)
        const amtCols = classed.filter(x => x.cls === 'amount');

        // We need at least 1 amount (the total)
        if (amtCols.length === 0) return null;

        // Description = all text + id columns concatenated
        const descParts = classed
            .filter(x => x.cls === 'text' || x.cls === 'id')
            .map(x => x.c)
            .filter(Boolean);

        const desc = descParts.join(' ').trim();
        if (!desc || desc.length < 2) return null;

        // Skip if description is purely numeric (shouldn't happen after classify but safety)
        if (/^\d+$/.test(desc.replace(/\s/g, ''))) return null;

        // Last amount = total, second-to-last = unit price, first decimal = qty
        const total    = amtCols[amtCols.length - 1];
        const unitCol  = amtCols.length >= 2 ? amtCols[amtCols.length - 2] : null;
        const qtyCol   = amtCols.length >= 3 ? amtCols[0] : null;

        // Sanity: if only one amount column, it's the total — acceptable
        const totalVal = toFloat(total.c);
        if (totalVal <= 0) return null;

        return {
            description: desc,
            qty:         qtyCol   ? cleanAmt(qtyCol.c)  : '',
            unitPrice:   unitCol  ? cleanAmt(unitCol.c)  : '',
            total:       cleanAmt(total.c),
        };
    }

    // ── Pass 2: Numeric-line heuristic ────────────────────
    static _parseNumericLines(t) {
        const lines  = t.split('\n').map(l => l.trim()).filter(Boolean);
        const items  = [];
        const seen   = new Set();
        let   startI = 0;
        let   endI   = lines.length;

        for (let i = 0; i < lines.length; i++) {
            if (HEADER_RE.test(lines[i])) startI = i + 1;
            if (FOOTER_RE.test(lines[i]) && i > startI + 1) { endI = i; break; }
        }

        const scan = (from, to) => {
            for (let i = from; i < to; i++) {
                const line = lines[i];
                if (!line || SKIP_RE.test(line)) continue;
                const item = TableExtractor._parseLine(line);
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

    // Parse a single plain-text line into an item
    static _parseLine(line) {
        // Extract all decimal numbers (amounts) — integers at start are item codes
        const numRe  = /(?<!\d)\d+\.\d+(?!\d)/g;
        const amounts = [];
        let m;
        while ((m = numRe.exec(line)) !== null) {
            const v = cleanAmt(m[0]);
            if (toFloat(v) > 0) amounts.push({ val: v, start: m.index, end: m.index + m[0].length });
        }

        if (amounts.length < 1) return null;

        // Description = everything before the first decimal number
        const firstAmtStart = amounts[0].start;
        let desc = line.slice(0, firstAmtStart).trim();

        // Remove leading row number (1-3 digit integer + space)
        desc = desc.replace(/^\d{1,3}\s+/, '');

        // Remove trailing item code if it's a long integer at end of desc
        desc = desc.replace(/\s+\d{5,8}$/, '');

        if (!desc || desc.length < 3) return null;
        if (SKIP_RE.test(desc)) return null;

        const total    = amounts[amounts.length - 1].val;
        const unitPrice= amounts.length >= 2 ? amounts[amounts.length - 2].val : '';
        const qty      = amounts.length >= 3 ? amounts[0].val : '';

        return { description: desc.trim(), qty, unitPrice, total };
    }

    // ── Totals ─────────────────────────────────────────────
    static subtotal(t) {
        const m = t.match(
            /(?:المجموع\s*الفرعي|Subtotal|Sub-?total|Total\s*Before\s*VAT|الاجمالي\s*قبل\s*الضريبة)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i
        );
        return m ? cleanAmt(m[1]) : '';
    }

    static tax(t) {
        // Match "VAT  19.18" or "ضريبة القيمة المضافة  19.18"
        const m = t.match(
            /(?:ضريبة\s*القيمة\s*المضافة|^VAT$|VAT\s*[\t:：]|GST\s*[\t:：]|Tax\s*[\t:：])\s*([\d,،]+(?:\.\d+)?)/im
        );
        return m ? cleanAmt(m[1]) : '';
    }

    static discount(t) {
        const m = t.match(
            /(?:اجمالي\s*خصم\s*العروض|Total\s*Discount|خصم)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i
        );
        return m ? cleanAmt(m[1]) : '';
    }

    static total(t) {
        // Match "Grand Total (SAR)  147.01" or "الاجمالي (ريال سعودي)  147.01"
        const patterns = [
            /(?:Grand\s*Total\s*(?:\([^)]*\))?)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i,
            /(?:الاجمالي\s*\([^)]*\)|الإجمالي\s*الكلي|المبلغ\s*الإجمالي|Total\s*Due)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i,
            /(?:الإجمالي|Total\s*Amount)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i,
        ];
        for (const p of patterns) {
            const m = t.match(p);
            if (m) return cleanAmt(m[1]);
        }
        return '';
    }
}

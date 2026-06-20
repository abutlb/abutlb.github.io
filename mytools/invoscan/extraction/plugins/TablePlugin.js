import { BasePlugin }               from '../engine/BasePlugin.js';
import { normD, cleanAmt, toFloat } from '../utils.js';

// ════════════════════════════════════════════════════════════
//  Column semantic definitions — كل ما يمكن أن يظهر في جدول
// ════════════════════════════════════════════════════════════
const COL_DEFS = [
  // ── Row counter / serial — نتجاهله تماماً
  { role: 'skip', re: /^\s*(?:sr\.?\s*no\.?|مسلسل|تسلسل|ت\.?\s*م\.?|م\.|الرقم\s*المتسلسل|no\.|seq\.?|#|رقم\s*م\.?)\s*$/i },

  // ── Item code / SKU / barcode
  { role: 'itemCode', re: /item\s*code|part\s*(?:no|number|#)|product\s*(?:code|id|no)|رقم\s*(الصنف|المنتج|البضاعة|الكود|الرمز|الكودبار|الباركود|المادة)|material\s*(?:code|no)|bar\s*?code|barcode|sku|reference\s*(?:no|#)?|catalog/i },

  // ── Description — the main item text
  { role: 'description', re: /(?:item\s*)?(?:description|details?|name)|product(?:\s*name)?|service(?:\s*(?:name|desc|description))?|particulars|goods|material(?!\s*code)|merchandise|commodity|وصف|بيان|اسم\s*(الصنف|المنتج|البضاعة|الخدمة|السلعة|البند|المادة)|البند|المنتج|الصنف|الخدمة|البضاعة|السلعة|المادة|الوصف\s*(التفصيلي)?/i },

  // ── Unit of measure (kg, pcs, each …)
  { role: 'unit', re: /^\s*(?:unit\s*(?:of\s*measure)?|uom|u\.o\.m\.?|الوحدة|وحدة\s*(القياس|البيع|الحجم)?|وح\.?)\s*$/i },

  // ── Quantity
  { role: 'qty', re: /^(?:q(?:uant(?:ity)?)?|qty|nos?\.?|pcs\.?|pieces?|units?|count|عدد|كمية|الكمية|العدد|الكميه|quantity\s*ordered)\.?\s*$/i },

  // ── Unit price (before discount)
  { role: 'unitPrice', re: /unit\s*(?:price|rate|cost|value)|price\s*per\s*(?:unit|item|pc|piece)|rate\s*(?:per)?|list\s*price|original\s*price|سعر\s*(الوحدة|الصنف|المفرد|المنتج|الوحده|للوحدة|الواحدة)|ثمن\s*(الوحدة|المفرد)|سعر\s*البيع\s*(للوحدة)?/i },

  // ── Discount (amount or %)
  { role: 'discount', re: /disc(?:ount)?\.?\s*(?:amount|value|%|rate)?|promo(?:tion)?|rebate|allowance|خصم|تخفيض|الحسم|قيمة\s*خصم|مبلغ\s*خصم|نسبة\s*الخصم|العروض|قيمة\s*العروض/i },

  // ── Net / subtotal (after discount, before VAT)
  { role: 'subtotal', re: /(?:net|sub)\s*(?:total|amount|price|value)|before\s*(?:vat|tax|gst)|excl(?:uding)?\.?\s*(?:vat|tax|gst)|taxable\s*(?:amount|value)|amount\s*before|net\s*(?:value|amount|price)|قبل\s*(الضريبة|ضريبة|الخصم)|صافي\s*(السعر|القيمة|المبلغ|الاجمالي|الإجمالي)?|المبلغ\s*(?:قبل|الخاضع|الخاضع\s*للضريبة)|السعر\s*قبل|الوعاء\s*الضريبي|المبلغ\s*الخاضع/i },

  // ── VAT / Tax percentage
  { role: 'vatPct', re: /(?:vat|tax|gst)\s*(?:rate\s*)?%|%\s*(?:vat|tax|gst)|tax\s*rate|ضريبة\s*(?:القيمة\s*المضافة\s*)?%|نسبة\s*(الضريبة|ضريبة\s*القيمة\s*المضافة)|%\s*ضريبة|معدل\s*(الضريبة|ضريبة)/i },

  // ── VAT / Tax amount (money value)
  { role: 'vatAmount', re: /(?:vat|tax|gst)\s*(?:amount|value|amt)\b(?!\s*%)|tax\s*value|ضريبة\s*(القيمة\s*)?المضافة(?!\s*%)|قيمة\s*(الضريبة|ضريبة\s*القيمة)|مبلغ\s*الضريبة|الضريبة\s*المضافة(?!\s*%)/i },

  // ── Total (final price including VAT)
  { role: 'total', re: /^total(?:\s*price)?(?:\s*\(?[a-z]{2,4}\)?)?\s*$|grand\s*total|net\s*total|total\s*(?:incl|with|after|amount|due|payable)|amount\s*(?:due|payable|incl\.?)|incl(?:uding)?\.?\s*(?:vat|tax)|total\s*(?:incl\.?\s*)?(?:vat|tax)|(?:الإجمالي|الاجمالي)(?:\s*(الكلي|مع|شامل|بعد|للفاتورة|النهائي))?|السعر\s*(?:الإجمالي|الاجمالي)|المبلغ\s*(?:الإجمالي|الاجمالي)|(?:إجمالي|اجمالي)\s*(الفاتورة|مع|شامل|بعد)?|(?:الإجمالي|الاجمالي)\s*شامل|المبلغ\s*(?:الإجمالي|الاجمالي)\s*مع\s*الضريبة/i },
];

// Normalize Arabic alef variants (OCR often drops hamza)
function normAr(t) {
    return t
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g,     'ه')
        .replace(/ى/g,     'ي');
}

function classifyHeader(text) {
    if (!text?.trim()) return null;
    const raw  = text.trim();
    const norm = normAr(raw);
    for (const def of COL_DEFS) {
        if (def.re.test(raw) || def.re.test(norm)) return def.role;
    }
    return null;
}

// Lines that should stop item scanning
const FOOTER_RE = /(?:الإجمالي\s*الكلي|Grand\s*Total|Total\s*(?:Sold|Items|Amount|Due|Discount|Before)|عدد\s*الاصناف|مجموع\s*الفاتورة|Total\s*Before\s*VAT|Subtotal|ضريبة\s*القيمة\s*المضافة\s*الإجمالية|Total\s*VAT|Total\s*Tax)/i;

// Lines that look like a header (not data)
const HEADER_KEYWORD_RE = /(?:description|وصف|qty|quantity|كمية|unit\s*price|سعر\s*الوحدة|item|total|الإجمالي|discount|خصم|vat|ضريبة)/i;

// ════════════════════════════════════════════════════════════
export class TablePlugin extends BasePlugin {
    get name() { return 'table'; }

    extract(rawText) {
        const t     = normD(rawText);
        const items = this._items(t);
        const hasTab = rawText.includes('\t');
        return {
            items: {
                value:      items,
                confidence: items.length > 0 ? (hasTab ? 0.88 : 0.65) : 0.05,
                method:     items.length > 0 ? (hasTab ? 'header-mapped' : 'numeric-heuristic') : 'none',
            },
        };
    }

    _items(t) {
        const tabItems = this._parseTabRows(t);
        if (tabItems.length > 0) return tabItems;
        return this._parseNumericLines(t);
    }

    // ══════════════════════════════════════════════════════
    //  PASS 1A: Header-aware tab parsing
    // ══════════════════════════════════════════════════════
    _parseTabRows(t) {
        const lines = t.split('\n');

        const headerInfo = this._detectHeader(lines);
        if (headerInfo) return this._extractWithMap(lines, headerInfo);

        return this._parseTabHeuristic(lines);
    }

    // ── Find header row(s) and build column map ──────────
    _detectHeader(lines) {
        for (let i = 0; i < Math.min(lines.length, 25); i++) {
            const line = lines[i];
            if (!line?.includes('\t')) continue;

            const cols1 = line.split('\t').map(c => c.trim());

            // Single-line header
            const map1 = this._buildColMap(cols1);
            if (this._isValidMap(map1)) {
                return { dataStart: i + 1, colMap: map1, colCount: cols1.length };
            }

            // Two-line bilingual header: test each row SEPARATELY then merge.
            // This is critical — anchored patterns like ^QTY$ fail on combined "QTY الكمية".
            const next = lines[i + 1] || '';
            if (next.includes('\t')) {
                const cols2  = next.split('\t').map(c => c.trim());
                const maxLen = Math.max(cols1.length, cols2.length);

                const mapA = this._buildColMap(cols1);
                const mapB = this._buildColMap(cols2);
                const merged = {};
                for (let k = 0; k < maxLen; k++) {
                    merged[k] = mapA[k] || mapB[k] || null;
                }
                // Remove null entries
                Object.keys(merged).forEach(k => { if (!merged[k]) delete merged[k]; });

                if (this._isValidMap(merged)) {
                    return { dataStart: i + 2, colMap: merged, colCount: maxLen };
                }
            }
        }
        return null;
    }

    _buildColMap(cols) {
        const map = {};
        cols.forEach((col, idx) => {
            const role = classifyHeader(col);
            if (role) map[idx] = role;
        });
        return map;
    }

    _isValidMap(map) {
        const roles = Object.values(map);
        // Must have a description + at least one money column
        return roles.includes('description') &&
               (roles.includes('total') || roles.includes('unitPrice') || roles.includes('subtotal'));
    }

    // ── Extract items using the column map ───────────────
    _extractWithMap(lines, { dataStart, colMap, colCount }) {
        const items = [];

        for (let i = dataStart; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            if (FOOTER_RE.test(line)) break;

            if (!line.includes('\t')) {
                // Non-tab line: could be a continuation of the last item's description
                if (items.length > 0 && !HEADER_KEYWORD_RE.test(line) && line.length > 2) {
                    items[items.length - 1].description =
                        (items[items.length - 1].description + ' ' + line).trim();
                }
                continue;
            }

            const cols = line.split('\t').map(c => c.trim());
            const item = this._applyColMap(cols, colMap, colCount);
            if (item) items.push(item);
        }
        return items;
    }

    _applyColMap(cols, colMap, colCount) {
        // Helper: get value for a given role
        const getRaw = role => {
            const idx = Object.keys(colMap).map(Number).find(k => colMap[k] === role);
            return (idx !== undefined && idx < cols.length) ? cols[idx] : '';
        };
        const getAmt = role => cleanAmt(getRaw(role));

        // ── Description ─────────────────────────────────
        let desc = getRaw('description').trim();

        if (!desc) {
            // Try building from unmapped or text columns
            desc = cols
                .filter((c, i) => {
                    const role = colMap[i];
                    return (!role || role === 'description') && c &&
                           !/^\d+(\.\d{0,4})?$/.test(cleanAmt(c));
                })
                .join(' ').trim();
        }

        if (!desc || desc.length < 2) return null;
        if (/^\d[\d\s.,-]*$/.test(desc)) return null;  // pure number

        // ── Numeric fields ──────────────────────────────
        const qty       = getAmt('qty');
        const unitPrice = getAmt('unitPrice');
        const discount  = getAmt('discount');
        const subtotal  = getAmt('subtotal');
        const vatPct    = getAmt('vatPct');
        const vatAmount = getAmt('vatAmount');
        const total     = getAmt('total') || subtotal;  // use subtotal as fallback

        if (!total || toFloat(total) <= 0) {
            // If no mapped total, try the rightmost non-zero numeric column
            const fallbackTotal = this._rightmostAmount(cols, colMap);
            if (!fallbackTotal || toFloat(fallbackTotal) <= 0) return null;
            return this._buildItem(desc, qty, unitPrice, discount, vatPct, vatAmount, fallbackTotal);
        }

        return this._buildItem(desc, qty, unitPrice, discount, vatPct, vatAmount, total);
    }

    _rightmostAmount(cols, colMap) {
        for (let i = cols.length - 1; i >= 0; i--) {
            const role = colMap[i];
            if (role === 'skip' || role === 'itemCode' || role === 'description' ||
                role === 'unit' || role === 'qty' || role === 'vatPct') continue;
            const v = cleanAmt(cols[i]);
            if (/^\d+(\.\d+)?$/.test(v) && toFloat(v) > 0) return v;
        }
        return '';
    }

    _buildItem(desc, qty, unitPrice, discount, vatPct, vatAmount, total) {
        const item = { description: desc.trim(), qty, unitPrice, total };
        if (discount)  item.discount  = discount;
        if (vatPct)    item.vatPct    = vatPct;
        if (vatAmount) item.vatAmount = vatAmount;
        return item;
    }

    // ══════════════════════════════════════════════════════
    //  PASS 1B: Heuristic tab parsing (no header found)
    // ══════════════════════════════════════════════════════
    _parseTabHeuristic(lines) {
        const items = [];
        let dataStart = 0, dataEnd = lines.length;

        // Find approximate data region
        for (let i = 0; i < lines.length; i++) {
            if (/(?:وصف|description|item|product|service|البند)/i.test(lines[i])) dataStart = i + 1;
            if (FOOTER_RE.test(lines[i]) && i > dataStart + 1) { dataEnd = i; break; }
        }

        for (let i = dataStart; i < dataEnd; i++) {
            const line = lines[i];
            if (!line?.includes('\t')) continue;
            if (HEADER_KEYWORD_RE.test(line) && !this._hasNumbers(line)) continue;

            const cols  = line.split('\t').map(c => c.trim()).filter(Boolean);
            if (cols.length < 2) continue;

            const item = this._heuristicColsToItem(cols);
            if (item) items.push(item);
        }
        return items;
    }

    _hasNumbers(line) {
        return /\d+\.\d+/.test(line);
    }

    _heuristicColsToItem(cols) {
        // Classify each column
        const classified = cols.map((c, i) => {
            const v   = cleanAmt(c);
            const num = toFloat(v);
            let type  = 'text';

            if (!c) {
                type = 'empty';
            } else if (/^\d+(\.\d+)?$/.test(v) && num > 0) {
                if (num <= 9999 && !c.includes('.') && i <= 3) type = 'qty';
                else if (num <= 100 && !c.includes('.')) type = 'pct';
                else if (c.includes('.') && num >= 5)   type = 'amount';
                else type = 'id';
            }
            return { c, v, num, type, i };
        });

        const tabAmounts = classified.filter(x => x.type === 'amount');
        if (tabAmounts.length === 0) return null;

        const descParts = classified
            .filter(x => x.type === 'text' || x.type === 'id')
            .map(x => x.c)
            .filter(Boolean);
        let rawDesc = descParts.join(' ').trim();
        if (!rawDesc || rawDesc.length < 2) return null;
        if (/^\d[\d\s.,]*$/.test(rawDesc)) return null;

        const total = tabAmounts[tabAmounts.length - 1];
        if (toFloat(total.c) <= 0) return null;

        // ── Detect embedded financial numbers in the description text ──
        // Happens with bilingual RTL PDFs where QTY/UnitPrice/Discount columns
        // get merged into the description cell. Numbers appear in RTL column order:
        // Discount → UnitPrice → QTY (right-to-left reading = reversed LTR column order)
        let qty = '', unitPrice = '';
        const embRe = /\b(\d+\.\d+)\b/g;
        const embedded = [];
        let em;
        while ((em = embRe.exec(rawDesc)) !== null) {
            const v = toFloat(em[1]);
            if (v > 0) embedded.push({ val: cleanAmt(em[1]), num: v, idx: em.index });
        }

        // RTL PDF case: embedded decimals qualify if at least one looks like a price (≥ 5)
        const hasFinancialEmbedded = embedded.some(e => e.num >= 5);

        if (embedded.length >= 2 && tabAmounts.length <= 2 && hasFinancialEmbedded) {
            // Bilingual RTL PDF: QTY/UnitPrice/Discount merged into description column.
            // Numbers appear in RTL column order → Last = QTY, Second-to-last = UnitPrice
            const lastEmb       = embedded[embedded.length - 1];
            const secondLastEmb = embedded[embedded.length - 2];
            qty       = lastEmb.val;
            unitPrice = secondLastEmb.val;
            // Clean description: strip the embedded numbers
            rawDesc = rawDesc.replace(/\b\d+\.\d+\b/g, '').replace(/\s{2,}/g, ' ').trim();
        } else {
            // Normal case: use tab amount columns
            const qtyCol = classified.find(x => x.type === 'qty');
            qty       = qtyCol ? cleanAmt(qtyCol.c) : '';
            unitPrice = tabAmounts.length >= 2 ? cleanAmt(tabAmounts[tabAmounts.length - 2].c) : '';
        }

        // Strip leading serial/code from description
        rawDesc = rawDesc.replace(/^\d{1,3}\s+/, '').replace(/^\d{5,15}\s+/, '').trim();
        if (!rawDesc || rawDesc.length < 2) return null;

        return {
            description: rawDesc,
            qty,
            unitPrice,
            total: cleanAmt(total.c),
        };
    }

    // ══════════════════════════════════════════════════════
    //  PASS 2: Pure numeric line parsing (no tabs at all)
    // ══════════════════════════════════════════════════════
    _parseNumericLines(t) {
        const lines   = t.split('\n').map(l => l.trim()).filter(Boolean);
        const items   = [];
        const seen    = new Set();
        let dataStart = 0, dataEnd = lines.length;

        for (let i = 0; i < lines.length; i++) {
            if (/(?:وصف|description|item|product|service|البند)/i.test(lines[i])) dataStart = i + 1;
            if (FOOTER_RE.test(lines[i]) && i > dataStart + 1) { dataEnd = i; break; }
        }

        const scan = (from, to) => {
            for (let i = from; i < to; i++) {
                const line = lines[i];
                if (!line || FOOTER_RE.test(line)) continue;
                if (HEADER_KEYWORD_RE.test(line) && !this._hasNumbers(line)) continue;

                const item = this._parseNumericLine(line);
                if (!item) continue;

                const key = item.description.slice(0, 20);
                if (seen.has(key)) continue;
                seen.add(key);
                items.push(item);
            }
        };

        scan(dataStart, dataEnd);
        if (!items.length) scan(0, lines.length);
        return items.slice(0, 50);
    }

    _parseNumericLine(line) {
        const numRe   = /(?<!\d)\d+\.\d+(?!\d)/g;
        const amounts = [];
        let m;
        while ((m = numRe.exec(line)) !== null) {
            const v = cleanAmt(m[0]);
            if (toFloat(v) > 0) amounts.push({ val: v, num: toFloat(v), idx: m.index });
        }
        if (amounts.length < 1) return null;

        // Try to find where description ends and numbers begin.
        // For bilingual RTL PDFs, numbers can appear in the middle followed by more text.
        // Strategy: find the LAST run of text that's followed only by decimals → trailing group.
        const total = amounts[amounts.length - 1];

        // Find trailing decimal cluster (only whitespace/symbols between consecutive decimals)
        let trailingStart = amounts.length - 1;
        for (let i = amounts.length - 2; i >= 0; i--) {
            const between = line.slice(amounts[i].idx + amounts[i].val.length, amounts[i + 1].idx);
            if (/^[\s%٪$€£]*$/.test(between)) {
                trailingStart = i;
            } else {
                break;
            }
        }
        const trailingNums = amounts.slice(trailingStart);

        // Description = text before trailing numbers start
        let desc = line.slice(0, amounts[trailingStart].idx).trim();

        // If only 1-2 trailing decimals but there are more decimals earlier (in RTL merged text),
        // use ALL decimals for financial assignment (RTL order: last=QTY, second-last=UnitPrice)
        const useAll = trailingNums.length < 3 && amounts.length >= 3;
        const fin    = useAll ? amounts : trailingNums;
        const fn     = fin.length;

        // Strip leading row number and item code from description
        desc = desc.replace(/^\d{1,3}\s+/, '').replace(/^\d{5,15}\s+/, '').replace(/\s+\d{5,15}$/, '').trim();

        // If description is empty (all numbers), try using text before first amount
        if (!desc || desc.length < 3) {
            desc = line.slice(0, amounts[0].idx).replace(/^\d{1,3}\s+/, '').replace(/^\d{5,15}\s+/, '').trim();
        }
        if (!desc || desc.length < 3) return null;
        if (FOOTER_RE.test(desc)) return null;
        if (HEADER_KEYWORD_RE.test(desc) && !this._hasNumbers(desc)) return null;

        const totalVal = cleanAmt(total.val);
        if (toFloat(totalVal) <= 0) return null;

        if (fn >= 4) {
            // 4+ decimals: last=total, find best unitPrice (largest non-total)
            const candidates = fin.slice(0, fn - 1).sort((a, b) => b.num - a.num);
            const unitPrice  = cleanAmt(candidates[0]?.val || '');
            const qtyCand    = fin.find(x =>
                x.num <= 999 && Math.abs(x.num - Math.round(x.num)) < 0.01 &&
                x.val !== unitPrice && x.val !== totalVal
            );
            // Strip financial numbers that leaked into description
            if (useAll) {
                fin.forEach(x => { desc = desc.split(x.val).join(''); });
                desc = desc.replace(/\s{2,}/g, ' ').trim();
            }
            if (!desc || desc.length < 3) return null;
            return {
                description: desc,
                qty:         qtyCand ? cleanAmt(qtyCand.val) : '',
                unitPrice,
                total:       totalVal,
            };
        }

        return {
            description: desc,
            qty:         fn >= 3 ? cleanAmt(fin[fn - 3].val) : '',
            unitPrice:   fn >= 2 ? cleanAmt(fin[fn - 2].val) : '',
            total:       totalVal,
        };
    }
}

// core/TemplateEngine.js — استخراج بيانات الفاتورة بالإحداثيات النسبية

export class TemplateEngine {
    /**
     * استخراج البيانات باستخدام قالب محدد
     * @param {Array} textItems — مصفوفة عناصر النص من PDFProcessor.extractItems()
     *                            كل عنصر: { str, x, y, w, page }  (x,y,w  0-1 نسبية)
     * @param {Object} template — القالب من TemplateExporter
     * @returns {Object} — نفس شكل InvoiceParser.parse()
     */
    static extract(textItems, template) {
        const result = {};

        for (const region of (template.regions || [])) {
            const { box, field, type } = region;
            const inRegion = TemplateEngine._itemsInBox(textItems, box);

            if (type === 'table') {
                result.items = TemplateEngine._extractTable(inRegion, region, box);
            } else if (field) {
                const val = inRegion.map(i => i.str).join(' ').trim();
                if (val) result[field] = val;
            }
        }

        return result;
    }

    /**
     * اكتشاف أعمدة الجدول من صف الرأس تلقائياً
     * يُرجع مصفوفة أعمدة: [{ x, w, label, field }]
     */
    static detectColumns(textItems, tableBox) {
        // أخذ عناصر الربع الأول (20%) = الصف الرأسي تقريباً
        const headerMaxY = tableBox.y + tableBox.h * 0.20;
        const headerItems = textItems
            .filter(i => i.y >= tableBox.y && i.y <= headerMaxY)
            .sort((a, b) => a.x - b.x);

        if (!headerItems.length) return [];

        const GAP = 0.025; // 2.5% من عرض الصفحة = يُشير لعمود منفصل
        const clusters = [];

        for (const item of headerItems) {
            const last = clusters[clusters.length - 1];
            const itemEnd = item.x + (item.w || 0);

            if (!last || item.x - last.endX > GAP) {
                clusters.push({ x: item.x, endX: itemEnd, label: item.str });
            } else {
                last.endX  = Math.max(last.endX, itemEnd);
                last.label += ' ' + item.str;
            }
        }

        // كل عمود يمتد من بدايته حتى بداية العمود التالي
        return clusters.map((c, i) => ({
            x:     c.x,
            w:     i < clusters.length - 1
                       ? clusters[i + 1].x - c.x
                       : (tableBox.x + tableBox.w - c.x),
            label: c.label.trim(),
            field: 'skip',
        }));
    }

    // ── Private ─────────────────────────────────────────

    static _itemsInBox(items, box) {
        return items.filter(i =>
            i.x >= box.x && i.x <= box.x + box.w &&
            i.y >= box.y && i.y <= box.y + box.h
        );
    }

    static _extractTable(items, region, tableBox) {
        const { columns } = region;
        if (!columns?.length) return [];

        // تجميع العناصر بحسب الصف (تقارب Y)
        const Y_TOL = tableBox.h * 0.025;
        const rows  = [];

        for (const item of items) {
            const row = rows.find(r => Math.abs(r.y - item.y) < Y_TOL);
            if (row) row.items.push(item);
            else     rows.push({ y: item.y, items: [item] });
        }

        rows.sort((a, b) => a.y - b.y);

        // تخطي صف الرأس (الصف الأول)
        const dataRows = rows.slice(1);
        const results  = [];

        for (const row of dataRows) {
            const entry = { description: '', qty: '', unitPrice: '', total: '' };
            let hasData = false;

            for (const item of row.items) {
                const col = columns.find(c => item.x >= c.x && item.x <= c.x + c.w);
                if (col?.field && col.field !== 'skip') {
                    entry[col.field] = (entry[col.field] + ' ' + item.str).trim();
                    hasData = true;
                }
            }

            if (hasData && (entry.description || entry.total)) {
                results.push(entry);
            }
        }

        return results;
    }
}

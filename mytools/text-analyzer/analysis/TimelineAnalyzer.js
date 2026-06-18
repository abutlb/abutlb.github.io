// analysis/TimelineAnalyzer.js — تحليل الاتجاهات الزمنية (الميزة 6)

export class TimelineAnalyzer {

    static analyze(rawData, textData, dateColumn) {
        if (!dateColumn || !rawData.length) return null;

        const byDate = new Map();

        rawData.forEach((row, idx) => {
            const dateRaw = row[dateColumn];
            if (!dateRaw) return;

            const date = this._parseDate(String(dateRaw));
            if (!date) return;

            const key = this._toMonthKey(date);
            if (!byDate.has(key)) {
                byDate.set(key, { date, key, items: [] });
            }
            const item = textData[idx];
            if (item) byDate.get(key).items.push(item);
        });

        if (byDate.size === 0) return null;

        const sorted = [...byDate.values()].sort((a, b) => a.date - b.date);

        return sorted.map(({ key, items }) => ({
            label:    key,
            total:    items.length,
            positive: items.filter(i => i.sentiment === 'إيجابي').length,
            negative: items.filter(i => i.sentiment === 'سلبي').length,
            neutral:  items.filter(i => i.sentiment === 'محايد').length,
            avgWords: items.length
                ? Math.round(items.reduce((s, i) => s + i.wordCount, 0) / items.length)
                : 0,
        }));
    }

    static _parseDate(raw) {
        if (!raw) return null;
        // Try ISO, slash, and dot formats
        const cleaned = raw.trim().replace(/[/\\.]/g, '-');
        const d = new Date(cleaned);
        if (!isNaN(d)) return d;

        // Try reversed dd-mm-yyyy
        const parts = cleaned.split('-');
        if (parts.length === 3 && parts[2].length === 4) {
            const d2 = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
            if (!isNaN(d2)) return d2;
        }
        return null;
    }

    static _toMonthKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
}

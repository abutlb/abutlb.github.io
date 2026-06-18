// analysis/GroupAnalyzer.js — المقارنة بين المجموعات (الميزة 3)

export class GroupAnalyzer {

    static compare(rawData, textData, groupColumn) {
        if (!groupColumn || !rawData.length) return null;

        const groups = new Map();

        rawData.forEach((row, idx) => {
            const groupVal = row[groupColumn];
            if (groupVal === undefined || groupVal === null || groupVal === '') return;

            const key = String(groupVal).trim();
            if (!groups.has(key)) groups.set(key, []);

            const item = textData[idx];
            if (item) groups.get(key).push(item);
        });

        if (groups.size < 2) return null;

        return [...groups.entries()].map(([group, items]) => {
            const total    = items.length;
            const positive = items.filter(i => i.sentiment === 'إيجابي').length;
            const negative = items.filter(i => i.sentiment === 'سلبي').length;
            const neutral  = items.filter(i => i.sentiment === 'محايد').length;
            const avgWords = total
                ? Math.round(items.reduce((s, i) => s + i.wordCount, 0) / total)
                : 0;

            const themeCounts = {};
            for (const item of items) {
                themeCounts[item.theme] = (themeCounts[item.theme] ?? 0) + 1;
            }
            const topTheme = Object.entries(themeCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

            return {
                group,
                total,
                positive,
                negative,
                neutral,
                avgWords,
                topTheme,
                posRate: total ? Math.round(positive / total * 100) : 0,
                negRate: total ? Math.round(negative / total * 100) : 0,
            };
        }).sort((a, b) => b.total - a.total);
    }
}

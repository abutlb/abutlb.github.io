// reporting/ExcelExporter.js — تصدير Excel (الميزة 4) — يعتمد على مكتبة SheetJS (xlsx)

export class ExcelExporter {

    static export(textData, analysisResults) {
        if (typeof XLSX === 'undefined') {
            alert('مكتبة Excel غير محملة. يرجى الانتظار والمحاولة مرة أخرى.');
            return;
        }
        if (!textData.length) return;

        const wb = XLSX.utils.book_new();

        // ورقة 1: البيانات الكاملة
        const dataSheet = XLSX.utils.aoa_to_sheet([
            ['#', 'التعليق', 'عدد الكلمات', 'الموضوع', 'المشاعر'],
            ...textData.map((item, i) => [i + 1, item.original, item.wordCount, item.theme, item.sentiment]),
        ]);
        dataSheet['!cols'] = [{ wch: 5 }, { wch: 60 }, { wch: 12 }, { wch: 20 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, dataSheet, 'البيانات');

        // ورقة 2: الإحصائيات
        const stats = analysisResults?.sentimentStats;
        if (stats) {
            const statsSheet = XLSX.utils.aoa_to_sheet([
                ['المقياس', 'القيمة'],
                ['إجمالي النصوص', stats.total],
                ['إيجابي', stats.positive],
                ['سلبي',  stats.negative],
                ['محايد',  stats.neutral],
                ['نسبة الإيجابي', `${Math.round(stats.positive / stats.total * 100)}%`],
                ['نسبة السلبي',  `${Math.round(stats.negative / stats.total * 100)}%`],
            ]);
            XLSX.utils.book_append_sheet(wb, statsSheet, 'الإحصائيات');
        }

        // ورقة 3: أبرز الكلمات
        const words = analysisResults?.frequency?.words;
        if (words?.length) {
            const wordsSheet = XLSX.utils.aoa_to_sheet([
                ['الكلمة', 'التكرار'],
                ...words.slice(0, 30).map(w => [w.text, w.count]),
            ]);
            XLSX.utils.book_append_sheet(wb, wordsSheet, 'أبرز الكلمات');
        }

        // ورقة 4: توزيع المواضيع
        const themes = analysisResults?.themeDistribution;
        if (themes?.length) {
            const themesSheet = XLSX.utils.aoa_to_sheet([
                ['الموضوع', 'العدد', 'النسبة'],
                ...themes.map(t => [
                    t.theme,
                    t.count,
                    `${(t.count / (stats?.total || 1) * 100).toFixed(1)}%`,
                ]),
            ]);
            XLSX.utils.book_append_sheet(wb, themesSheet, 'المواضيع');
        }

        // ورقة 5: المقترحات
        const suggestions = analysisResults?.suggestions;
        if (suggestions?.length) {
            const suggSheet = XLSX.utils.aoa_to_sheet([
                ['المقترح', 'الموضوع', 'المشاعر'],
                ...suggestions.map(s => [s.text, s.theme, s.sentiment]),
            ]);
            XLSX.utils.book_append_sheet(wb, suggSheet, 'المقترحات');
        }

        XLSX.writeFile(wb, 'تحليل_النصوص.xlsx');
    }
}

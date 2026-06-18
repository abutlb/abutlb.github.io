// reporting/CSVExporter.js — تصدير CSV

export class CSVExporter {

    static export(textData) {
        if (!textData.length) return;

        const rows = [
            ['التعليق', 'عدد الكلمات', 'الموضوع', 'المشاعر'],
            ...textData.map(item => [
                `"${item.original.replace(/"/g, '""')}"`,
                item.wordCount,
                item.theme,
                item.sentiment,
            ]),
        ];

        const csv = rows.map(r => r.join(',')).join('\n');
        const bom = '﻿';
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        this._download(blob, 'تحليل_النصوص.csv');
    }

    static _download(blob, filename) {
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href  = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

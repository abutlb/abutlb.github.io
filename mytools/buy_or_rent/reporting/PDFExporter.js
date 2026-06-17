// reporting/PDFExporter.js — تصدير التقرير للطباعة/PDF

import { fmtK, fmtPct } from "../utils/Formatters.js";

export class PDFExporter {

    static export(store) {
        const { results, scenario, inputs } = store;
        if (!results) return;

        const scNames = { personal: 'شخصي', family: 'عائلي', investment: 'استثماري' };
        document.title = `تقرير قرار السكن (${scNames[scenario]}) — ${new Date().toLocaleDateString('ar-SA')}`;
        window.print();
    }
}

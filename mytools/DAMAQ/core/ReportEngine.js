// core/ReportEngine.js
import { HTMLReportBuilder } from "../reporting/HTMLReportBuilder.js";
import { ExcelExporter }     from "../reporting/ExcelExporter.js";
import { PDFExporter }       from "../reporting/PDFExporter.js";

export class ReportEngine {

    constructor(store) {
        this.store = store;
    }

    // ── تصدير HTML ───────────────────────────────────────────────
    exportHTML(options = {}) {
        const html     = HTMLReportBuilder.build(this.store, options);
        const fileName = `DQA_Report_${new Date().toISOString().slice(0, 10)}.html`;
        PDFExporter.downloadHTML(html, fileName);
        return html;
    }

    // ── طباعة / PDF ──────────────────────────────────────────────
    exportPDF(options = {}) {
        const html = HTMLReportBuilder.build(this.store, options);
        PDFExporter.printToPDF(html);
    }

    // ── تصدير Excel (async — يستخدم ExcelJS) ─────────────────────
    async exportExcel(options = {}) {
        await ExcelExporter.export(this.store, options);
    }

    // ── تصدير الكل دفعة واحدة ────────────────────────────────────
    async exportAll() {
        await this.exportExcel();
        setTimeout(() => this.exportHTML(), 600);
    }

    // ── معاينة في نافذة جديدة ────────────────────────────────────
    preview() {
        const html = HTMLReportBuilder.build(this.store);
        const win  = window.open("", "_blank", "width=1200,height=900");

        if (!win) {
            // Popup محجوب — نفتح كـ Blob URL بدلاً منه
            const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
            const url  = URL.createObjectURL(blob);
            window.open(url, "_blank");
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            return;
        }

        win.document.open();
        win.document.write(html);
        win.document.close();
    }
}

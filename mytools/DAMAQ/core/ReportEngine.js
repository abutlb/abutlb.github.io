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
        const fileName = `DQA_Report_${new Date().toISOString().slice(0,10)}.html`;
        PDFExporter.downloadHTML(html, fileName);
        return html;
    }

    // ── طباعة / PDF ──────────────────────────────────────────────
    exportPDF(options = {}) {
        const html = HTMLReportBuilder.build(this.store, options);
        PDFExporter.printToPDF(html);
    }

    // ── تصدير Excel ──────────────────────────────────────────────
    exportExcel(options = {}) {
        ExcelExporter.export(this.store, options);
    }

    // ── تصدير الكل دفعة واحدة ────────────────────────────────────
    exportAll() {
        this.exportExcel();
        setTimeout(() => this.exportHTML(), 500);
    }

    // ── معاينة في نافذة جديدة ────────────────────────────────────
    preview() {
        const html = HTMLReportBuilder.build(this.store);
        const win  = window.open("", "_blank", "width=1100,height=800");
        win.document.write(html);
        win.document.close();
    }
}

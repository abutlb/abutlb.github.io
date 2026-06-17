// reporting/ExcelExporter.js
// يستخدم ExcelJS (window.ExcelJS) للتصدير مع ألوان وتنسيق كامل + RTL

export class ExcelExporter {

    static async export(store, options = {}) {
        if (typeof ExcelJS === "undefined") {
            throw new Error("مكتبة ExcelJS غير محملة — تأكد من الاتصال بالإنترنت");
        }

        const wb = new ExcelJS.Workbook();
        wb.creator  = "DAMAQ";
        wb.created  = new Date();
        wb.modified = new Date();

        this._addDataSheet(wb, store.originalData, store.columns, "البيانات الأصلية");

        if (store.cleanedData) {
            this._addDataSheet(wb, store.cleanedData, store.columns, "البيانات المنظفة");
        }
        if (store.damaResults)                        this._addDAMASheet(wb, store.damaResults);
        if (store.profileResults)                     this._addProfileSheet(wb, store.profileResults, store.columns);
        if (store.ruleResults?.results?.length > 0)   this._addRulesSheet(wb, store.ruleResults);
        if (store.auditLog?.entries?.length > 0)      this._addAuditSheet(wb, store.auditLog);

        const fileName = options.fileName
            || `DQA_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

        const buffer = await wb.xlsx.writeBuffer();
        this._download(buffer, fileName);
    }

    // ── تنزيل الملف ──────────────────────────────────────────────
    static _download(buffer, fileName) {
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const url = URL.createObjectURL(blob);
        const a   = Object.assign(document.createElement("a"), {
            href    : url,
            download: fileName
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 200);
    }

    // ── مساعد: حدود ──────────────────────────────────────────────
    static _border(hex = "BFDBFE") {
        const s = { style: "thin", color: { argb: "FF" + hex } };
        return { top: s, bottom: s, left: s, right: s };
    }

    // ── مساعد: تنسيق صف الهيدر ───────────────────────────────────
    static _styleHeader(row, bgHex = "1D4ED8") {
        row.height = 22;
        row.eachCell(cell => {
            cell.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
            cell.fill      = { type: "pattern", pattern: "solid",
                               fgColor: { argb: "FF" + bgHex } };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.border    = this._border();
        });
    }

    // ── ورقة البيانات ────────────────────────────────────────────
    static _addDataSheet(wb, data, columns, sheetName) {
        const ws = wb.addWorksheet(sheetName, {
            views: [{ rightToLeft: true, state: "frozen", xSplit: 0, ySplit: 1 }]
        });

        // عرض الأعمدة
        columns.forEach((col, i) => {
            ws.getColumn(i + 1).width = Math.max(String(col).length + 6, 14);
        });

        // هيدر
        const headerRow = ws.addRow(columns);
        this._styleHeader(headerRow);

        // صفوف البيانات
        data.forEach((row, rowIdx) => {
            const dataRow = ws.addRow(columns.map(c => row[c] ?? ""));
            const bgArgb  = rowIdx % 2 === 0 ? "FFF0F7FF" : "FFFFFFFF";
            dataRow.eachCell(cell => {
                cell.fill      = { type: "pattern", pattern: "solid",
                                   fgColor: { argb: bgArgb } };
                cell.alignment = { horizontal: "right", vertical: "middle" };
                cell.border    = this._border("D1D5DB");
            });
        });
    }

    // ── ورقة DAMA ────────────────────────────────────────────────
    static _addDAMASheet(wb, dama) {
        const ws = wb.addWorksheet("تقرير DAMA", {
            views: [{ rightToLeft: true }]
        });
        [22, 14, 55, 12].forEach((w, i) => { ws.getColumn(i + 1).width = w; });

        const dimNames = {
            completeness:"الاكتمال", validity:"الصلاحية", consistency:"التناسق",
            accuracy:"الدقة",        timeliness:"الحداثة",  uniqueness:"التفرد",
            integrity:"السلامة"
        };

        // العنوان
        const titleRow = ws.addRow(["تقرير جودة البيانات — DAMA"]);
        titleRow.height = 30;
        titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: "FF1D4ED8" } };
        titleRow.getCell(1).fill = { type: "pattern", pattern: "solid",
                                     fgColor: { argb: "FFEFF6FF" } };
        titleRow.getCell(1).alignment = { horizontal: "center" };
        ws.mergeCells(1, 1, 1, 4);

        ws.addRow([]);

        // الدرجة الكلية
        const score      = dama.overall;
        const scoreArgb  = score >= 80 ? "FF059669" : score >= 60 ? "FFD97706" : "FFDC2626";
        const scoreRow   = ws.addRow(["الدرجة الكلية", score, dama.grade?.label || "", ""]);
        scoreRow.getCell(1).font = { bold: true, size: 12 };
        scoreRow.getCell(2).font = { bold: true, size: 14, color: { argb: scoreArgb } };

        ws.addRow(["تاريخ التقييم", new Date(dama.evaluatedAt).toLocaleString("ar-SA")]);
        ws.addRow([]);

        // هيدر جدول الأبعاد
        const dimHeader = ws.addRow(["البُعد", "الدرجة %", "التفاصيل", "الوزن %"]);
        this._styleHeader(dimHeader);

        // صفوف الأبعاد
        Object.entries(dama.dimensions).forEach(([key, dim]) => {
            const s       = dim.score;
            const tArgb   = s >= 80 ? "FF059669" : s >= 60 ? "FFD97706" : "FFDC2626";
            const bgArgb  = s >= 80 ? "FFD1FAE5" : s >= 60 ? "FFFEF3C7" : "FFFEE2E2";

            const row = ws.addRow([
                dimNames[key] || key,
                s,
                dim.details || (dim.skipped ? "لا ينطبق" : ""),
                +((dama.weights?.[key] || 0) * 100).toFixed(0)
            ]);
            row.eachCell(cell => { cell.border = this._border("D1D5DB"); });
            row.getCell(2).font      = { bold: true, color: { argb: tArgb } };
            row.getCell(2).fill      = { type: "pattern", pattern: "solid",
                                         fgColor: { argb: bgArgb } };
            row.getCell(2).alignment = { horizontal: "center" };
        });

        // التوصيات
        if (dama.recommendations?.length > 0) {
            ws.addRow([]);
            const recTitle = ws.addRow(["التوصيات"]);
            recTitle.getCell(1).font = { bold: true, size: 13, color: { argb: "FF7C3AED" } };

            const recHeader = ws.addRow(["الأولوية", "البُعد", "الإجراء المقترح", ""]);
            this._styleHeader(recHeader, "7C3AED");

            dama.recommendations.forEach(r => {
                ws.addRow([r.priority, r.dimension, r.action, ""]);
            });
        }
    }

    // ── ورقة تحليل الأعمدة ───────────────────────────────────────
    static _addProfileSheet(wb, profile, columns) {
        const ws = wb.addWorksheet("تحليل الأعمدة", {
            views: [{ rightToLeft: true, state: "frozen", xSplit: 0, ySplit: 1 }]
        });

        const widths  = [20, 10, 10, 10, 8, 10, 10, 10, 12, 12, 10, 10, 16];
        const headers = ["العمود","النوع","الإجمالي","غير فارغ","فارغ","% فارغ",
                         "فريد","% فريد","الحد الأدنى","الحد الأقصى","المتوسط","الوسيط","الحالة"];

        widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

        const headerRow = ws.addRow(headers);
        this._styleHeader(headerRow, "0F766E");

        columns.forEach(col => {
            const p = profile[col];
            if (!p) return;

            const status = p.isConstant   ? "ثابت"  :
                           p.isNearEmpty  ? "شبه فارغ" :
                           p.emptyPct > 20? "يحتاج مراجعة" : "جيد";

            const row = ws.addRow([
                col, p.type, p.total, p.nonEmpty, p.empty,
                p.emptyPct, p.unique, p.uniquePct,
                p.min ?? "", p.max ?? "", p.mean ?? "", p.median ?? "",
                status
            ]);

            // تلوين % فارغ (عمود 6)
            const pct      = p.emptyPct;
            const eTxt     = pct > 50 ? "FFDC2626" : pct > 20 ? "FFD97706" : "FF059669";
            const eBg      = pct > 50 ? "FFFEE2E2" : pct > 20 ? "FFFEF3C7" : "FFD1FAE5";
            const eCell    = row.getCell(6);
            eCell.font      = { color: { argb: eTxt } };
            eCell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: eBg } };
            eCell.alignment = { horizontal: "center" };

            // تلوين الحالة (عمود 13)
            const sMap = {
                "جيد"          : { t: "FF065F46", b: "FFD1FAE5" },
                "يحتاج مراجعة": { t: "FF92400E", b: "FFFEF3C7" },
                "شبه فارغ"    : { t: "FF991B1B", b: "FFFEE2E2" },
                "ثابت"         : { t: "FF92400E", b: "FFFEF9C3" }
            };
            const sc        = sMap[status] || { t: "FF374151", b: "FFF3F4F6" };
            const sCell     = row.getCell(13);
            sCell.font      = { bold: true, color: { argb: sc.t } };
            sCell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: sc.b } };
            sCell.alignment = { horizontal: "center" };
        });
    }

    // ── ورقة نتائج القواعد ───────────────────────────────────────
    static _addRulesSheet(wb, ruleResults) {
        const ws = wb.addWorksheet("نتائج القواعد", {
            views: [{ rightToLeft: true, state: "frozen", xSplit: 0, ySplit: 1 }]
        });
        [35, 18, 12, 12, 45].forEach((w, i) => { ws.getColumn(i + 1).width = w; });

        const headerRow = ws.addRow(["القاعدة","النوع","الحالة","الدرجة %","الملخص"]);
        this._styleHeader(headerRow, "7C3AED");

        ruleResults.results.forEach(r => {
            const row  = ws.addRow([r.ruleName, r.type,
                r.passed ? "✅ نجح" : "❌ فشل", r.score, r.summary || ""]);

            const sc   = row.getCell(3);
            sc.font    = { bold: true, color: { argb: r.passed ? "FF065F46" : "FF991B1B" } };
            sc.fill    = { type: "pattern", pattern: "solid",
                           fgColor: { argb: r.passed ? "FFD1FAE5" : "FFFEE2E2" } };
            sc.alignment = { horizontal: "center" };

            const s     = r.score;
            const sCell = row.getCell(4);
            sCell.font  = { color: { argb: s >= 80 ? "FF059669" : s >= 60 ? "FFD97706" : "FFDC2626" } };
            sCell.alignment = { horizontal: "center" };
        });
    }

    // ── ورقة سجل التعديلات ───────────────────────────────────────
    static _addAuditSheet(wb, auditLog) {
        const ws = wb.addWorksheet("سجل التعديلات", {
            views: [{ rightToLeft: true, state: "frozen", xSplit: 0, ySplit: 1 }]
        });
        [6, 24, 18, 20, 18, 16, 55].forEach((w, i) => { ws.getColumn(i + 1).width = w; });

        const headerRow = ws.addRow(["#","الوقت","النوع","العمود","الطريقة","الصفوف المتأثرة","الوصف"]);
        this._styleHeader(headerRow, "0369A1");

        auditLog.entries.forEach((e, i) => {
            const row    = ws.addRow([
                e.id,
                new Date(e.timestamp).toLocaleString("ar-SA"),
                e.type,
                e.column || "الكل",
                e.method || "—",
                e.affected || 0,
                e.description || ""
            ]);
            const bgArgb = i % 2 === 0 ? "FFF0F9FF" : "FFFFFFFF";
            row.eachCell(cell => {
                cell.fill   = { type: "pattern", pattern: "solid",
                                fgColor: { argb: bgArgb } };
                cell.border = this._border("E0F2FE");
            });
        });
    }
}

// reporting/ExcelExporter.js
// يعتمد على SheetJS (XLSX) — نفس المكتبة المستخدمة في ExcelParser

export class ExcelExporter {

    static export(store, options = {}) {
        const wb = XLSX.utils.book_new();

        // ── ورقة 1: البيانات الأصلية ─────────────────────────────
        this._addDataSheet(
            wb,
            store.originalData,
            store.columns,
            "البيانات الأصلية"
        );

        // ── ورقة 2: البيانات المنظفة (إن وُجدت) ─────────────────
        if (store.cleanedData) {
            this._addDataSheet(
                wb,
                store.cleanedData,
                store.columns,
                "البيانات المنظفة"
            );
        }

        // ── ورقة 3: تقرير جودة DAMA ──────────────────────────────
        if (store.damaResults) {
            this._addDAMASheet(wb, store.damaResults);
        }

        // ── ورقة 4: تحليل الأعمدة ────────────────────────────────
        if (store.profileResults) {
            this._addProfileSheet(wb, store.profileResults, store.columns);
        }

        // ── ورقة 5: نتائج القواعد ────────────────────────────────
        if (store.ruleResults?.results?.length > 0) {
            this._addRulesSheet(wb, store.ruleResults);
        }

        // ── ورقة 6: سجل التعديلات ────────────────────────────────
        if (store.auditLog?.entries?.length > 0) {
            this._addAuditSheet(wb, store.auditLog);
        }

        // ── تصدير الملف ──────────────────────────────────────────
        const fileName = options.fileName
            || `DQA_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

        XLSX.writeFile(wb, fileName,{
        bookType: "xlsx", 
        type: "binary"});
    }

    // ── ورقة البيانات ────────────────────────────────────────────
    static _addDataSheet(wb, data, columns, sheetName) {
        const rows = [
            columns,
            ...data.map(row => columns.map(c => row[c] ?? ""))
        ];
        const ws = XLSX.utils.json_to_sheet(rows);

        // تنسيق الـ Header
        columns.forEach((_, i) => {
            const cell = XLSX.utils.encode_cell({ r: 0, c: i });
            if (!ws[cell]) return;
            ws[cell].s = {
                font     : { bold: true, color: { rgb: "FFFFFF" } },
                fill     : { fgColor: { rgb: "2563EB" } },
                alignment: { horizontal: "center" }
            };
        });

        // عرض الأعمدة تلقائي
        ws["!cols"] = columns.map(c => ({
            wch: Math.max(c.length + 4, 12)
        }));

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    // ── ورقة DAMA ────────────────────────────────────────────────
    static _addDAMASheet(wb, dama) {
        const dimNames = {
            completeness : "الاكتمال",
            validity     : "الصلاحية",
            consistency  : "التناسق",
            accuracy     : "الدقة",
            timeliness   : "الحداثة",
            uniqueness   : "التفرد",
            integrity    : "السلامة"
        };

        const rows = [
            ["تقرير جودة البيانات — DAMA"],
            [""],
            ["الدرجة الكلية", dama.overall, dama.grade?.label],
            ["تاريخ التقييم", dama.evaluatedAt],
            [""],
            ["البُعد", "الدرجة", "التفاصيل", "الوزن"],
            ...Object.entries(dama.dimensions).map(([key, dim]) => [
                dimNames[key] || key,
                `${dim.score}%`,
                dim.details || "",
                `${((dama.weights?.[key] || 0) * 100).toFixed(0)}%`
            ]),
            [""],
            ["التوصيات"],
            ["الأولوية", "البُعد", "الإجراء المقترح"],
            ...(dama.recommendations || []).map(r => [
                r.priority, r.dimension, r.action
            ])
        ];

        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 50 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, ws, "تقرير DAMA");
    }

    // ── ورقة تحليل الأعمدة ───────────────────────────────────────
    static _addProfileSheet(wb, profile, columns) {
        const headers = [
            "العمود", "النوع", "الإجمالي", "غير فارغ",
            "فارغ", "% فارغ", "فريد", "% فريد",
            "الحد الأدنى", "الحد الأقصى", "المتوسط", "الوسيط"
        ];

        const rows = [
            headers,
            ...columns.map(col => {
                const p = profile[col];
                if (!p) return [col, ...Array(11).fill("")];
                return [
                    col,
                    p.type,
                    p.total,
                    p.nonEmpty,
                    p.empty,
                    `${p.emptyPct}%`,
                    p.unique,
                    `${p.uniquePct}%`,
                    p.min ?? "",
                    p.max ?? "",
                    p.mean ?? "",
                    p.median ?? ""
                ];
            })
        ];

        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = headers.map(() => ({ wch: 14 }));
        XLSX.utils.book_append_sheet(wb, ws, "تحليل الأعمدة");
    }

    // ── ورقة نتائج القواعد ───────────────────────────────────────
    static _addRulesSheet(wb, ruleResults) {
        const headers = ["القاعدة", "النوع", "الحالة", "الدرجة", "الملخص"];

        const rows = [
            headers,
            ...ruleResults.results.map(r => [
                r.ruleName,
                r.type,
                r.passed ? "✅ نجح" : "❌ فشل",
                `${r.score}%`,
                r.summary || ""
            ])
        ];

        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [{ wch: 35 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(wb, ws, "نتائج القواعد");
    }

    // ── ورقة سجل التعديلات ───────────────────────────────────────
    static _addAuditSheet(wb, auditLog) {
        const headers = ["#", "الوقت", "النوع", "العمود", "الطريقة", "المتأثر", "الوصف"];

        const rows = [
            headers,
            ...auditLog.entries.map(e => [
                e.id,
                e.timestamp,
                e.type,
                e.column || "الكل",
                e.method || "—",
                e.affected || 0,
                e.description || ""
            ])
        ];

        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [
            { wch: 5 }, { wch: 22 }, { wch: 18 },
            { wch: 20 }, { wch: 18 }, { wch: 10 }, { wch: 50 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, "سجل التعديلات");
    }
}

// cleaning/AuditLog.js
export class AuditLog {

    constructor() {
        this.entries = [];
    }

    // تسجيل إجراء
    log(action) {
        const entry = {
            id        : this.entries.length + 1,
            timestamp : new Date().toISOString(),
            ...action
            /*
            action يحتوي:
            {
                type      : "fill_missing" | "remove_outlier" | "dedup" | "normalize" | ...
                column    : "اسم العمود" (أو null إذا كان على كل البيانات)
                method    : "median" | "mean" | "mode" | "iqr" | ...
                affected  : 12,          ← عدد الصفوف المتأثرة
                before    : [...],        ← القيم قبل (اختياري)
                after     : [...],        ← القيم بعد (اختياري)
                description: "نص وصفي"
            }
            */
        };
        this.entries.push(entry);
        return entry;
    }

    // آخر N إجراءات
    recent(n = 10) {
        return this.entries.slice(-n).reverse();
    }

    // ملخص كل الإجراءات
    summary() {
        const byType = {};
        let totalAffected = 0;

        this.entries.forEach(e => {
            byType[e.type] = (byType[e.type] || 0) + 1;
            totalAffected += e.affected || 0;
        });

        return {
            totalActions : this.entries.length,
            totalAffected,
            byType,
            entries      : this.entries
        };
    }

    // تصدير كـ CSV
    toCSV() {
        const headers = ["#", "الوقت", "النوع", "العمود", "الطريقة", "المتأثر", "الوصف"];
        const rows = this.entries.map(e => [
            e.id,
            e.timestamp,
            e.type,
            e.column || "الكل",
            e.method || "—",
            e.affected || 0,
            e.description || ""
        ]);

        return [headers, ...rows]
            .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
            .join("\n");
    }

    clear() { this.entries = []; }
}

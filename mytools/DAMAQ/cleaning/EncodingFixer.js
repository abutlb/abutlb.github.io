// cleaning/EncodingFixer.js
export class EncodingFixer {

    // إصلاح مشاكل الترميز الشائعة
    static fix(value) {
        if (typeof value !== "string") return value;

        let v = value;

        // إصلاح Mojibake الشائع (UTF-8 مقروء كـ Latin-1)
        const mojibakeMap = {
            "Ã¢â‚¬â€œ" : "—",
            "Ã¢â‚¬â„¢" : "'",
            'Ã¢â‚¬Å"' : '"',
            "Ã¢â‚¬"   : '"',
            "Ã©"       : "é",
            "Ã¨"       : "è",
            "Ã "       : "à",
            "Ã®"       : "î",
            "Ã´"       : "ô"
        };

        Object.entries(mojibakeMap).forEach(([bad, good]) => {
            v = v.replaceAll(bad, good);
        });

        // إزالة أحرف التحكم غير المرئية
        v = v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

        // إزالة BOM
        v = v.replace(/^\uFEFF/, "");

        // إزالة Zero-width characters
        v = v.replace(/[\u200B-\u200D\uFEFF]/g, "");

        return v;
    }

    static fixColumn(data, column) {
        const affected = [];

        data.forEach((row, idx) => {
            const before = row[column];
            if (typeof before !== "string") return;

            const after = this.fix(before);
            if (before !== after) {
                affected.push({ rowIndex: idx, before, after });
                row[column] = after;
            }
        });

        return { affected, count: affected.length };
    }

    // فحص هل العمود يحتوي مشاكل
    static scan(data, column) {
        const issues = [];

        data.forEach((row, idx) => {
            const v = String(row[column] || "");
            if (/[\uFFFD]/.test(v))
                issues.push({ rowIndex: idx, type: "replacement_char", value: v });
            if (/[\u200B\u200C\u200D\uFEFF]/.test(v))
                issues.push({ rowIndex: idx, type: "zero_width", value: v });
            if (/Ã[©¨ ]/.test(v))
                issues.push({ rowIndex: idx, type: "mojibake", value: v });
        });

        return { issues, count: issues.length };
    }
}

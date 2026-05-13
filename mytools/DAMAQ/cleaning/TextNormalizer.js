// cleaning/TextNormalizer.js
export class TextNormalizer {

    static normalize(value, options = {}) {
        if (typeof value !== "string") return value;
        let v = value;

        // إزالة المسافات الزائدة
        if (options.trimSpaces !== false) {
            v = v.trim().replace(/\s+/g, " ");
        }

        // إزالة أحرف Unicode المخفية
        if (options.removeHiddenChars !== false) {
            v = v.replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, "");
        }

        // توحيد الحالة
        if (options.case === "upper")  v = v.toUpperCase();
        if (options.case === "lower")  v = v.toLowerCase();
        if (options.case === "title")  v = this._toTitleCase(v);

        // توحيد الأرقام العربية → إنجليزية
        if (options.normalizeNumbers !== false) {
            v = v.replace(/[٠١٢٣٤٥٦٧٨٩]/g, d =>
                "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString()
            );
        }

        // إزالة علامات الترقيم الزائدة
        if (options.removePunctuation) {
            v = v.replace(/[^\w\s\u0600-\u06FF]/g, "");
        }

        return v;
    }

    static _toTitleCase(str) {
        return str.replace(/\b\w/g, c => c.toUpperCase());
    }

    // تطبيق على عمود كامل
    static normalizeColumn(data, column, options = {}) {
        const affected = [];

        data.forEach((row, idx) => {
            const before = row[column];
            if (typeof before !== "string" || before === "") return;

            const after = this.normalize(before, options);

            if (before !== after) {
                affected.push({ rowIndex: idx, before, after });
                row[column] = after;
            }
        });

        return { affected, count: affected.length };
    }
}

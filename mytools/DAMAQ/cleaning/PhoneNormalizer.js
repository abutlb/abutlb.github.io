// cleaning/PhoneNormalizer.js
export class PhoneNormalizer {

    // توحيد الجوال السعودي لتنسيق 05XXXXXXXX
    static normalize(value) {
        if (!value) return { normalized: value, valid: false };

        let v = String(value).trim().replace(/[\s\-().+]/g, "");

        // إزالة كود الدولة
        if (v.startsWith("9665"))  v = "0" + v.slice(3);
        if (v.startsWith("9660"))  v = "0" + v.slice(3);
        if (v.startsWith("00966")) v = "0" + v.slice(5);

        // إذا يبدأ بـ 5 فقط → أضف 0
        if (/^5\d{8}$/.test(v)) v = "0" + v;

        const valid = /^05\d{8}$/.test(v);

        return {
            normalized : valid ? v : value,
            valid,
            original   : value
        };
    }

    static normalizeColumn(data, column) {
        const affected = [];
        const invalid  = [];

        data.forEach((row, idx) => {
            const before = row[column];
            if (!before) return;

            const { normalized, valid } = this.normalize(before);

            if (!valid) {
                invalid.push({ rowIndex: idx, value: before });
                return;
            }

            if (before !== normalized) {
                affected.push({ rowIndex: idx, before, after: normalized });
                row[column] = normalized;
            }
        });

        return {
            affected,
            invalid,
            count        : affected.length,
            invalidCount : invalid.length
        };
    }
}

// cleaning/DateNormalizer.js
export class DateNormalizer {

    static normalize(value, targetFormat = "YYYY-MM-DD") {
        if (!value) return { normalized: value, valid: false };

        // أنماط التاريخ الشائعة
        const patterns = [
            { rx: /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,  order: [1, 2, 3] }, // YYYY-MM-DD
            { rx: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,  order: [3, 2, 1] }, // DD-MM-YYYY
            { rx: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/,  order: [3, 2, 1] }, // DD-MM-YY
        ];

        let parsed = null;

        for (const { rx, order } of patterns) {
            const m = String(value).trim().match(rx);
            if (m) {
                const [y, mo, d] = order.map(i => parseInt(m[i]));
                const year = y < 100 ? 2000 + y : y;
                parsed = new Date(year, mo - 1, d);
                break;
            }
        }

        // محاولة أخيرة بـ Date.parse
        if (!parsed || isNaN(parsed.getTime())) {
            parsed = new Date(value);
        }

        if (!parsed || isNaN(parsed.getTime())) {
            return { normalized: value, valid: false, reason: "تنسيق تاريخ غير معروف" };
        }

        const y  = parsed.getFullYear();
        const mo = String(parsed.getMonth() + 1).padStart(2, "0");
        const d  = String(parsed.getDate()).padStart(2, "0");

        return {
            normalized : `${y}-${mo}-${d}`,
            valid      : true,
            original   : value
        };
    }

    static normalizeColumn(data, column) {
        const affected = [];
        const invalid  = [];

        data.forEach((row, idx) => {
            const before = row[column];
            if (!before) return;

            const { normalized, valid, reason } = this.normalize(before);

            if (!valid) {
                invalid.push({ rowIndex: idx, value: before, reason });
                return;
            }

            if (String(before) !== normalized) {
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

// cleaning/DedupMerger.js
export class DedupMerger {

    // إزالة التكرار الكامل
    static removeDuplicates(data, columns = null) {
        const seen       = new Map();
        const duplicates = [];
        const cleaned    = [];

        data.forEach((row, idx) => {
            // إذا columns محدد → نبني المفتاح منها فقط
            const keyObj = columns
                ? Object.fromEntries(columns.map(c => [c, row[c]]))
                : row;
            const key = JSON.stringify(keyObj);

            if (seen.has(key)) {
                duplicates.push({
                    rowIndex    : idx,
                    firstSeenAt : seen.get(key),
                    row
                });
            } else {
                seen.set(key, idx);
                cleaned.push(row);
            }
        });

        return {
            cleaned,
            duplicates,
            removed : duplicates.length,
            count   : duplicates.length
        };
    }

    // دمج الصفوف المتكررة (يحتفظ بأكمل صف)
    static mergeByKey(data, keyColumn) {
        const groups  = new Map();
        const merged  = [];
        const actions = [];

        // تجميع حسب المفتاح
        data.forEach((row, idx) => {
            const key = String(row[keyColumn] || "").trim().toLowerCase();
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push({ row, idx });
        });

        // دمج كل مجموعة
        groups.forEach((rows, key) => {
            if (rows.length === 1) {
                merged.push(rows[0].row);
                return;
            }

            // اختيار الصف الأكمل (أقل قيم فارغة)
            const best = rows.reduce((a, b) => {
                const aEmpty = Object.values(a.row)
                    .filter(v => v === "" || v === null || v === undefined).length;
                const bEmpty = Object.values(b.row)
                    .filter(v => v === "" || v === null || v === undefined).length;
                return aEmpty <= bEmpty ? a : b;
            });

            // ملء الفراغات من الصفوف الأخرى
            const mergedRow = { ...best.row };
            rows.forEach(({ row }) => {
                Object.keys(row).forEach(col => {
                    if (
                        (mergedRow[col] === "" ||
                         mergedRow[col] === null ||
                         mergedRow[col] === undefined) &&
                        row[col] !== "" &&
                        row[col] !== null &&
                        row[col] !== undefined
                    ) {
                        mergedRow[col] = row[col];
                    }
                });
            });

            merged.push(mergedRow);
            actions.push({
                key,
                mergedCount : rows.length,
                keptRow     : best.idx,
                description : `دمج ${rows.length} صفوف بنفس "${keyColumn}"`
            });
        });

        return {
            cleaned : merged,
            actions,
            removed : data.length - merged.length,
            count   : data.length - merged.length
        };
    }
}

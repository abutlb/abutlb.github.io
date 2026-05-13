// cleaning/SmartFiller.js
export class SmartFiller {

    // ── التوصية الذكية ───────────────────────────────────────────
    // يحلل العمود ويوصي بأفضل طريقة ملء
    static recommend(columnProfile) {
        const { type, outliers, topValues, nonEmpty, total } = columnProfile;
        const emptyPct = ((total - nonEmpty) / total) * 100;

        // إذا أكثر من 70% فارغ → لا تملأ، احذف العمود
        if (emptyPct > 70) {
            return {
                method     : "drop_column",
                reason     : `${emptyPct.toFixed(0)}% من القيم فارغة — يُنصح بحذف العمود`,
                confidence : "عالية",
                risk       : "منخفض"
            };
        }

        if (type === "number") {
            // إذا يوجد قيم متطرفة كثيرة → Median أفضل من Mean
            const outlierPct = outliers?.pct || 0;
            if (outlierPct > 5) {
                return {
                    method     : "median",
                    reason     : `يوجد ${outlierPct}% قيم متطرفة — الوسيط أكثر استقراراً من المتوسط`,
                    confidence : "عالية",
                    risk       : "منخفض"
                };
            }
            return {
                method     : "mean",
                reason     : "البيانات الرقمية موزعة بشكل طبيعي — المتوسط مناسب",
                confidence : "عالية",
                risk       : "منخفض"
            };
        }

        if (type === "text") {
            // إذا Cardinality منخفض (categorical) → Mode
            const uniqueRatio = columnProfile.cardinality?.ratio || 1;
            if (uniqueRatio < 0.1) {
                return {
                    method     : "mode",
                    reason     : `العمود تصنيفي (${columnProfile.cardinality?.unique} قيمة فريدة) — القيمة الأكثر تكراراً مناسبة`,
                    confidence : "متوسطة",
                    risk       : "منخفض"
                };
            }
            return {
                method     : "constant",
                value      : "غير محدد",
                reason     : "نص بتنوع عالٍ — يُنصح بقيمة ثابتة أو الحذف",
                confidence : "منخفضة",
                risk       : "متوسط"
            };
        }

        if (type === "date") {
            return {
                method     : "median_date",
                reason     : "التاريخ الوسيط يحافظ على التوزيع الزمني",
                confidence : "متوسطة",
                risk       : "متوسط"
            };
        }

        if (type === "boolean") {
            return {
                method     : "mode",
                reason     : "القيمة الأكثر شيوعاً مناسبة للبيانات المنطقية",
                confidence : "متوسطة",
                risk       : "منخفض"
            };
        }

        return {
            method     : "drop_rows",
            reason     : "لا يمكن تحديد طريقة ملء مناسبة — يُنصح بحذف الصفوف",
            confidence : "منخفضة",
            risk       : "عالٍ"
        };
    }

    // ── تطبيق الملء ─────────────────────────────────────────────
    static fill(data, column, method, options = {}) {
        const affected = [];

        // جمع القيم غير الفارغة للحسابات
        const nonEmptyVals = data
            .map(r => r[column])
            .filter(v => v !== "" && v !== null && v !== undefined);

        // حساب قيمة الملء
        const fillValue = this._calcFillValue(nonEmptyVals, method, options);

        // تطبيق الملء
        data.forEach((row, idx) => {
            const val = row[column];
            const isEmpty = val === "" || val === null || val === undefined;

            if (isEmpty) {
                affected.push({
                    rowIndex : idx,
                    before   : val,
                    after    : fillValue
                });
                row[column] = fillValue;
            }
        });

        return {
            affected,
            fillValue,
            count : affected.length
        };
    }

    static _calcFillValue(values, method, options) {
        switch (method) {

            case "mean": {
                const nums = values.map(Number).filter(n => !isNaN(n));
                if (nums.length === 0) return 0;
                return +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(4);
            }

            case "median": {
                const nums = values.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
                if (nums.length === 0) return 0;
                const mid = Math.floor(nums.length / 2);
                return nums.length % 2 === 0
                    ? +((nums[mid - 1] + nums[mid]) / 2).toFixed(4)
                    : nums[mid];
            }

            case "mode": {
                const freq = {};
                values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
                return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
            }

            case "median_date": {
                const dates = values
                    .map(v => new Date(v).getTime())
                    .filter(t => !isNaN(t))
                    .sort((a, b) => a - b);
                if (dates.length === 0) return "";
                const mid = Math.floor(dates.length / 2);
                return new Date(dates[mid]).toISOString().split("T")[0];
            }

            case "constant":
                return options.value ?? "غير محدد";

            case "forward_fill": {
                // يُطبَّق بشكل مختلف — يرجع null هنا
                return null;
            }

            default:
                return "";
        }
    }

    // Forward Fill — يملأ بقيمة الصف السابق
    static forwardFill(data, column) {
        const affected = [];
        let lastValue  = null;

        data.forEach((row, idx) => {
            const val     = row[column];
            const isEmpty = val === "" || val === null || val === undefined;

            if (!isEmpty) {
                lastValue = val;
            } else if (lastValue !== null) {
                affected.push({ rowIndex: idx, before: val, after: lastValue });
                row[column] = lastValue;
            }
        });

        return { affected, count: affected.length };
    }

    // Drop Rows — حذف الصفوف الفارغة
    static dropRows(data, columns) {
        const toRemove = new Set();

        data.forEach((row, idx) => {
            const hasEmpty = columns.some(col => {
                const v = row[col];
                return v === "" || v === null || v === undefined;
            });
            if (hasEmpty) toRemove.add(idx);
        });

        const cleaned = data.filter((_, idx) => !toRemove.has(idx));
        return {
            cleaned,
            removed : toRemove.size,
            count   : toRemove.size
        };
    }
}

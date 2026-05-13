// cleaning/OutlierHandler.js
export class OutlierHandler {

    // كشف الـ Outliers وإرجاع indices
    static detect(data, column, method = "iqr") {
        const nums = data
            .map((row, idx) => ({ val: parseFloat(row[column]), idx }))
            .filter(x => !isNaN(x.val));

        if (nums.length < 4) return { outliers: [], bounds: null };

        if (method === "iqr")    return this._detectIQR(nums);
        if (method === "zscore") return this._detectZScore(nums);

        return { outliers: [], bounds: null };
    }

    static _detectIQR(nums) {
        const sorted = [...nums].sort((a, b) => a.val - b.val);
        const vals   = sorted.map(x => x.val);

        const q1 = vals[Math.floor(vals.length * 0.25)];
        const q3 = vals[Math.floor(vals.length * 0.75)];
        const iqr = q3 - q1;

        const lower = q1 - 1.5 * iqr;
        const upper = q3 + 1.5 * iqr;

        return {
            outliers : nums.filter(x => x.val < lower || x.val > upper),
            bounds   : { lower: +lower.toFixed(4), upper: +upper.toFixed(4) },
            method   : "iqr"
        };
    }

    static _detectZScore(nums) {
        const vals   = nums.map(x => x.val);
        const mean   = vals.reduce((a, b) => a + b, 0) / vals.length;
        const stdDev = Math.sqrt(
            vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / vals.length
        );

        return {
            outliers : nums.filter(x => Math.abs((x.val - mean) / stdDev) > 3),
            bounds   : {
                lower: +(mean - 3 * stdDev).toFixed(4),
                upper: +(mean + 3 * stdDev).toFixed(4)
            },
            method   : "zscore"
        };
    }

    // معالجة الـ Outliers
    static handle(data, column, strategy, detectionMethod = "iqr") {
        const { outliers, bounds } = this.detect(data, column, detectionMethod);
        if (outliers.length === 0) return { affected: [], count: 0 };

        const outlierIndices = new Set(outliers.map(x => x.idx));
        const affected       = [];

        // حساب المتوسط للاستبدال
        const nonOutlierVals = data
            .filter((_, i) => !outlierIndices.has(i))
            .map(r => parseFloat(r[column]))
            .filter(n => !isNaN(n));

        const mean = nonOutlierVals.length > 0
            ? nonOutlierVals.reduce((a, b) => a + b, 0) / nonOutlierVals.length
            : 0;

        if (strategy === "remove") {
            // نضع علامة للحذف لاحقاً
            outliers.forEach(({ idx, val }) => {
                affected.push({ rowIndex: idx, before: val, after: null, action: "remove" });
                data[idx][column] = "__REMOVE__";
            });

        } else if (strategy === "cap") {
            outliers.forEach(({ idx, val }) => {
                const capped = val < bounds.lower ? bounds.lower : bounds.upper;
                affected.push({ rowIndex: idx, before: val, after: capped, action: "cap" });
                data[idx][column] = capped;
            });

        } else if (strategy === "replace_mean") {
            outliers.forEach(({ idx, val }) => {
                const rounded = +mean.toFixed(4);
                affected.push({ rowIndex: idx, before: val, after: rounded, action: "replace" });
                data[idx][column] = rounded;
            });
        }

        // إزالة الصفوف المعلّمة
        const cleaned = strategy === "remove"
            ? data.filter(row => row[column] !== "__REMOVE__")
            : data;

        return {
            affected,
            count  : affected.length,
            bounds,
            cleaned: strategy === "remove" ? cleaned : null
        };
    }
}

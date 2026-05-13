// core/ProfilerEngine.js
export class ProfilerEngine {

    static profile(data, columns) {
        const results = {};

        columns.forEach(col => {
            results[col] = this.profileColumn(data, col);
        });

        results.__dataset__ = this.profileDataset(data, columns, results);

        return results;
    }

    // ─── تحليل عمود واحد ───────────────────────────────────────
    static profileColumn(data, column) {
        const raw    = data.map(r => r[column]);
        const nonEmpty = raw.filter(v => v !== "" && v !== null && v !== undefined);
        const type   = this.detectType(nonEmpty);

        return {
            column,
            type,
            // --- الأساسيات ---
            total      : raw.length,
            nonEmpty   : nonEmpty.length,
            empty      : raw.length - nonEmpty.length,
            emptyPct   : +(( (raw.length - nonEmpty.length) / raw.length) * 100).toFixed(2),
            unique     : new Set(nonEmpty).size,
            uniquePct  : +((new Set(nonEmpty).size / raw.length) * 100).toFixed(2),

            // --- Cardinality ---
            cardinality: this.calcCardinality(nonEmpty),

            // --- Patterns ---
            patterns   : this.detectPatterns(nonEmpty),
            mixedTypes : this.detectMixedTypes(nonEmpty),
            hiddenSpaces: this.detectHiddenSpaces(raw),
            unicodeIssues: this.detectUnicodeIssues(nonEmpty),

            // --- Frequency ---
            topValues  : this.getTopValues(nonEmpty, 10),
            rareValues : this.getRareValues(nonEmpty, 3),

            // --- Numeric stats (إذا كان رقمياً) ---
            ...(type === "number" ? this.numericStats(nonEmpty) : {}),

            // --- Outliers (إذا كان رقمياً) ---
            ...(type === "number" ? this.detectOutliers(nonEmpty) : {}),

            // --- Entropy ---
            entropy    : this.calcEntropy(nonEmpty),

            // --- هل العمود ثابت؟ ---
            isConstant : new Set(nonEmpty).size === 1,

            // --- هل شبه فارغ؟ ---
            isNearEmpty: ((raw.length - nonEmpty.length) / raw.length) > 0.7,
        };
    }

    // ─── كشف النوع ─────────────────────────────────────────────
    static detectType(values) {
        if (values.length === 0) return "unknown";
        const sample = values.slice(0, 50);

        const isNum  = sample.every(v => !isNaN(parseFloat(v)) && isFinite(v));
        if (isNum) return "number";

        const dateRx = /^\d{4}[-/]\d{2}[-/]\d{2}|^\d{2}[-/]\d{2}[-/]\d{4}/;
        const isDate = sample.every(v => dateRx.test(String(v)) || !isNaN(Date.parse(v)));
        if (isDate) return "date";

        const bools  = ["true","false","yes","no","1","0","نعم","لا","صح","خطأ"];
        const isBool = sample.every(v => bools.includes(String(v).toLowerCase()));
        if (isBool) return "boolean";

        return "text";
    }

    // ─── Cardinality ────────────────────────────────────────────
    static calcCardinality(values) {
        const unique = new Set(values).size;
        const ratio  = unique / values.length;

        let level;
        if (ratio === 1)        level = "فريد تماماً (Primary Key محتمل)";
        else if (ratio > 0.9)   level = "عالي جداً";
        else if (ratio > 0.5)   level = "عالي";
        else if (ratio > 0.1)   level = "متوسط";
        else if (ratio > 0.01)  level = "منخفض";
        else                    level = "منخفض جداً (Categorical)";

        return { unique, ratio: +ratio.toFixed(3), level };
    }

    // ─── Entropy ────────────────────────────────────────────────
    static calcEntropy(values) {
        if (values.length === 0) return 0;
        const freq = {};
        values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });

        let entropy = 0;
        const n = values.length;
        Object.values(freq).forEach(count => {
            const p = count / n;
            entropy -= p * Math.log2(p);
        });

        return +entropy.toFixed(3);
    }

    // ─── Numeric Stats ──────────────────────────────────────────
    static numericStats(values) {
        const nums = values.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (nums.length === 0) return {};

        const sum  = nums.reduce((a, b) => a + b, 0);
        const mean = sum / nums.length;
        const mid  = Math.floor(nums.length / 2);
        const median = nums.length % 2 === 0
            ? (nums[mid - 1] + nums[mid]) / 2
            : nums[mid];

        const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / nums.length;
        const stdDev   = Math.sqrt(variance);

        return {
            min    : nums[0],
            max    : nums[nums.length - 1],
            mean   : +mean.toFixed(2),
            median : +median.toFixed(2),
            stdDev : +stdDev.toFixed(2),
            sum    : +sum.toFixed(2),
            q1     : nums[Math.floor(nums.length * 0.25)],
            q3     : nums[Math.floor(nums.length * 0.75)],
        };
    }

    // ─── Outlier Detection (IQR + Z-Score) ──────────────────────
    static detectOutliers(values) {
        const nums = values.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (nums.length < 4) return { outliers: { iqr: [], zscore: [] } };

        // IQR Method
        const q1  = nums[Math.floor(nums.length * 0.25)];
        const q3  = nums[Math.floor(nums.length * 0.75)];
        const iqr = q3 - q1;
        const lowerIQR = q1 - 1.5 * iqr;
        const upperIQR = q3 + 1.5 * iqr;
        const iqrOutliers = nums.filter(n => n < lowerIQR || n > upperIQR);

        // Z-Score Method
        const mean   = nums.reduce((a, b) => a + b, 0) / nums.length;
        const stdDev = Math.sqrt(
            nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / nums.length
        );
        const zOutliers = nums.filter(n => Math.abs((n - mean) / stdDev) > 3);

        return {
            outliers: {
                iqr    : iqrOutliers,
                zscore : zOutliers,
                count  : Math.max(iqrOutliers.length, zOutliers.length),
                pct    : +((iqrOutliers.length / nums.length) * 100).toFixed(2),
                bounds : { lower: +lowerIQR.toFixed(2), upper: +upperIQR.toFixed(2) }
            }
        };
    }

    // ─── Pattern Detection ──────────────────────────────────────
    static detectPatterns(values) {
        const patterns = {};
        values.forEach(v => {
            const p = this.getPattern(String(v));
            patterns[p] = (patterns[p] || 0) + 1;
        });

        return Object.entries(patterns)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([pattern, count]) => ({
                pattern,
                count,
                pct: +((count / values.length) * 100).toFixed(1)
            }));
    }

    static getPattern(value) {
        return value
            .replace(/[A-Z]/g, "A")
            .replace(/[a-z]/g, "a")
            .replace(/[\u0600-\u06FF]/g, "ع")
            .replace(/[0-9]/g, "9")
            .replace(/\s/g, "_");
    }

    // ─── Mixed Types ────────────────────────────────────────────
    static detectMixedTypes(values) {
        const types = new Set(values.map(v => {
            if (!isNaN(parseFloat(v)) && isFinite(v)) return "number";
            if (!isNaN(Date.parse(v))) return "date";
            return "text";
        }));
        return {
            hasMixed : types.size > 1,
            types    : Array.from(types)
        };
    }

    // ─── Hidden Whitespaces ─────────────────────────────────────
    static detectHiddenSpaces(values) {
        const affected = values.filter(v =>
            typeof v === "string" && (v !== v.trim() || /\s{2,}/.test(v))
        );
        return {
            count : affected.length,
            pct   : +((affected.length / values.length) * 100).toFixed(1)
        };
    }

    // ─── Unicode Issues ─────────────────────────────────────────
    static detectUnicodeIssues(values) {
        const issues = values.filter(v => {
            const s = String(v);
            return /[\uFFFD\u200B\u200C\u200D\uFEFF]/.test(s);
        });
        return {
            count : issues.length,
            hasIssues: issues.length > 0
        };
    }

    // ─── Top / Rare Values ──────────────────────────────────────
    static getTopValues(values, n = 10) {
        const freq = {};
        values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(([value, count]) => ({
                value,
                count,
                pct: +((count / values.length) * 100).toFixed(1)
            }));
    }

    static getRareValues(values, threshold = 3) {
        const freq = {};
        values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
        return Object.entries(freq)
            .filter(([, count]) => count <= threshold)
            .map(([value, count]) => ({ value, count }));
    }

    // ─── Dataset-level Analysis ─────────────────────────────────
    static profileDataset(data, columns, colResults) {
        // Correlation Matrix للأعمدة الرقمية
        const numericCols = columns.filter(c => colResults[c]?.type === "number");
        const correlation = this.calcCorrelationMatrix(data, numericCols);

        // Null Heatmap data
        const nullHeatmap = columns.map(col => ({
            column : col,
            nullPct: colResults[col]?.emptyPct || 0
        }));

        // Schema Drift (مقارنة بالـ snapshot السابق إذا وُجد)
        const constantCols = columns.filter(c => colResults[c]?.isConstant);
        const nearEmptyCols = columns.filter(c => colResults[c]?.isNearEmpty);
        const highCardCols  = columns.filter(
            c => colResults[c]?.cardinality?.ratio > 0.9
        );

        return {
            totalRows    : data.length,
            totalColumns : columns.length,
            totalCells   : data.length * columns.length,
            totalEmpty   : columns.reduce((sum, c) => sum + (colResults[c]?.empty || 0), 0),
            correlation,
            nullHeatmap,
            constantCols,
            nearEmptyCols,
            highCardCols,
            duplicateRows: this.countDuplicates(data)
        };
    }

    // ─── Correlation Matrix ─────────────────────────────────────
    static calcCorrelationMatrix(data, numericCols) {
        if (numericCols.length < 2) return {};
        const matrix = {};

        numericCols.forEach(col1 => {
            matrix[col1] = {};
            numericCols.forEach(col2 => {
                matrix[col1][col2] = col1 === col2
                    ? 1
                    : this.pearsonCorrelation(data, col1, col2);
            });
        });

        return matrix;
    }

    static pearsonCorrelation(data, col1, col2) {
        const pairs = data
            .map(r => [parseFloat(r[col1]), parseFloat(r[col2])])
            .filter(([a, b]) => !isNaN(a) && !isNaN(b));

        if (pairs.length < 3) return null;

        const n  = pairs.length;
        const m1 = pairs.reduce((s, [a]) => s + a, 0) / n;
        const m2 = pairs.reduce((s, [, b]) => s + b, 0) / n;

        let num = 0, d1 = 0, d2 = 0;
        pairs.forEach(([a, b]) => {
            num += (a - m1) * (b - m2);
            d1  += Math.pow(a - m1, 2);
            d2  += Math.pow(b - m2, 2);
        });

        const denom = Math.sqrt(d1 * d2);
        return denom === 0 ? 0 : +(num / denom).toFixed(3);
    }

    // ─── Duplicate Rows ─────────────────────────────────────────
    static countDuplicates(data) {
        const seen = new Set();
        let count  = 0;
        data.forEach(row => {
            const key = JSON.stringify(row);
            if (seen.has(key)) count++;
            else seen.add(key);
        });
        return count;
    }
}

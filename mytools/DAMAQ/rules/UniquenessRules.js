// rules/UniquenessRules.js

export const UniquenessRules = {

    // عمود واحد فريد
    uniqueColumn(column) {
        return {
            id     : `unique_${column}`,
            type   : "uniqueness",
            nameAr : `فريد: "${column}"`,
            evaluate(data) {
                const seen       = new Map();
                const violations = [];

                data.forEach((row, idx) => {
                    const val = String(row[column] || "").trim().toLowerCase();
                    if (!val) return;

                    if (seen.has(val)) {
                        violations.push({
                            rowIndex     : idx,
                            column,
                            value        : row[column],
                            firstSeenAt  : seen.get(val),
                            reason       : `القيمة "${row[column]}" مكررة`
                        });
                    } else {
                        seen.set(val, idx);
                    }
                });

                return {
                    passed        : violations.length === 0,
                    violations,
                    duplicateCount: violations.length,
                    score         : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary       : `${violations.length} قيمة مكررة في "${column}"`
                };
            }
        };
    },

    // مفتاح مركب فريد (مثال: اسم + تاريخ الميلاد)
    compositeKey(columns) {
        return {
            id     : `composite_key_${columns.join("_")}`,
            type   : "uniqueness",
            nameAr : `مفتاح مركب فريد: [${columns.join(", ")}]`,
            evaluate(data) {
                const seen       = new Map();
                const violations = [];

                data.forEach((row, idx) => {
                    const key = columns
                        .map(c => String(row[c] || "").trim().toLowerCase())
                        .join("|");

                    if (seen.has(key)) {
                        violations.push({
                            rowIndex   : idx,
                            columns,
                            values     : Object.fromEntries(columns.map(c => [c, row[c]])),
                            firstSeenAt: seen.get(key),
                            reason     : `التركيبة [${columns.join(", ")}] مكررة`
                        });
                    } else {
                        seen.set(key, idx);
                    }
                });

                return {
                    passed        : violations.length === 0,
                    violations,
                    duplicateCount: violations.length,
                    score         : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary       : `${violations.length} تكرار في المفتاح المركب`
                };
            }
        };
    },

    // كشف التكرار الجزئي (Fuzzy Duplicate) بناءً على تشابه النص
    fuzzyDuplicate(column, threshold = 0.85) {
        return {
            id     : `fuzzy_${column}`,
            type   : "uniqueness",
            nameAr : `تكرار تقريبي: "${column}" (تشابه > ${threshold * 100}%)`,
            evaluate(data) {
                const values     = data.map((r, i) => ({ val: String(r[column] || "").trim(), idx: i }))
                                       .filter(x => x.val !== "");
                const violations = [];

                // Levenshtein similarity
                const similarity = (a, b) => {
                    if (a === b) return 1;
                    const longer  = a.length > b.length ? a : b;
                    const shorter = a.length > b.length ? b : a;
                    if (longer.length === 0) return 1;
                    const dist = this._levenshtein(longer, shorter);
                    return (longer.length - dist) / longer.length;
                };

                for (let i = 0; i < values.length; i++) {
                    for (let j = i + 1; j < values.length; j++) {
                        const sim = similarity(
                            values[i].val.toLowerCase(),
                            values[j].val.toLowerCase()
                        );
                        if (sim >= threshold && sim < 1) {
                            violations.push({
                                rowIndex1 : values[i].idx,
                                rowIndex2 : values[j].idx,
                                value1    : values[i].val,
                                value2    : values[j].val,
                                similarity: +(sim * 100).toFixed(1),
                                reason    : `تشابه ${(sim * 100).toFixed(1)}% — قد يكون تكراراً`
                            });
                        }
                    }
                }

                return {
                    passed  : violations.length === 0,
                    violations: violations.slice(0, 50), // أول 50 فقط
                    score   : violations.length === 0 ? 100 : 70,
                    summary : `${violations.length} زوج متشابه محتمل`
                };
            },

            _levenshtein(a, b) {
                const dp = Array.from({ length: a.length + 1 },
                    (_, i) => Array.from({ length: b.length + 1 },
                        (_, j) => i === 0 ? j : j === 0 ? i : 0));
                for (let i = 1; i <= a.length; i++)
                    for (let j = 1; j <= b.length; j++)
                        dp[i][j] = a[i-1] === b[j-1]
                            ? dp[i-1][j-1]
                            : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
                return dp[a.length][b.length];
            }
        };
    }
};

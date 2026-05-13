// rules/ConsistencyRules.js

export const ConsistencyRules = {

    // تاريخ البداية قبل تاريخ النهاية
    dateOrder(startCol, endCol) {
        return {
            id     : `date_order_${startCol}_${endCol}`,
            type   : "consistency",
            nameAr : `الترتيب الزمني: "${startCol}" قبل "${endCol}"`,
            evaluate(data) {
                const violations = [];

                data.forEach((row, idx) => {
                    const start = new Date(row[startCol]);
                    const end   = new Date(row[endCol]);

                    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

                    if (start >= end) {
                        violations.push({
                            rowIndex : idx,
                            values   : { [startCol]: row[startCol], [endCol]: row[endCol] },
                            reason   : `"${startCol}" (${row[startCol]}) يجب أن يكون قبل "${endCol}" (${row[endCol]})`
                        });
                    }
                });

                return {
                    passed    : violations.length === 0,
                    violations,
                    score     : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary   : `${violations.length} انتهاك في ترتيب التواريخ`
                };
            }
        };
    },

    // قيمة A يجب أن تكون أكبر من قيمة B
    numericComparison(greaterCol, lessCol, operator = ">") {
        return {
            id     : `num_compare_${greaterCol}_${operator}_${lessCol}`,
            type   : "consistency",
            nameAr : `مقارنة رقمية: "${greaterCol}" ${operator} "${lessCol}"`,
            evaluate(data) {
                const violations = [];
                const ops = {
                    ">"  : (a, b) => a > b,
                    ">=" : (a, b) => a >= b,
                    "<"  : (a, b) => a < b,
                    "<=" : (a, b) => a <= b,
                    "="  : (a, b) => a === b
                };
                const compare = ops[operator] || ops[">"];

                data.forEach((row, idx) => {
                    const a = parseFloat(row[greaterCol]);
                    const b = parseFloat(row[lessCol]);
                    if (isNaN(a) || isNaN(b)) return;

                    if (!compare(a, b)) {
                        violations.push({
                            rowIndex : idx,
                            values   : { [greaterCol]: a, [lessCol]: b },
                            reason   : `"${greaterCol}" (${a}) يجب أن يكون ${operator} "${lessCol}" (${b})`
                        });
                    }
                });

                return {
                    passed  : violations.length === 0,
                    violations,
                    score   : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary : `${violations.length} انتهاك في المقارنة الرقمية`
                };
            }
        };
    },

    // توحيد تنسيق عمود معين (كل القيم بنفس النمط)
    uniformFormat(column) {
        return {
            id     : `uniform_format_${column}`,
            type   : "consistency",
            nameAr : `توحيد التنسيق: "${column}"`,
            evaluate(data) {
                // كشف النمط السائد
                const patterns = {};
                const getPattern = v => String(v)
                    .replace(/[A-Z]/g, "A").replace(/[a-z]/g, "a")
                    .replace(/[\u0600-\u06FF]/g, "ع").replace(/\d/g, "9");

                data.forEach(row => {
                    const val = row[column];
                    if (!val) return;
                    const p = getPattern(val);
                    patterns[p] = (patterns[p] || 0) + 1;
                });

                const dominant = Object.entries(patterns)
                    .sort((a, b) => b[1] - a[1])[0];

                if (!dominant) return { passed: true, violations: [], score: 100 };

                const violations = [];
                data.forEach((row, idx) => {
                    const val = row[column];
                    if (!val) return;
                    if (getPattern(val) !== dominant[0]) {
                        violations.push({
                            rowIndex : idx,
                            value    : val,
                            expected : dominant[0],
                            reason   : `تنسيق غير متوافق مع النمط السائد`
                        });
                    }
                });

                return {
                    passed        : violations.length === 0,
                    violations,
                    dominantPattern: dominant[0],
                    score         : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary       : `${violations.length} قيمة بتنسيق مختلف`
                };
            }
        };
    },

    // قيمة عمود تعتمد على قيمة عمود آخر
    // مثال: إذا نوع الحساب = "شركة" → السجل التجاري مطلوب
    crossColumnDependency(ifColumn, ifValue, thenColumn, thenRule) {
        return {
            id     : `cross_dep_${ifColumn}_${thenColumn}`,
            type   : "consistency",
            nameAr : `تبعية: إذا "${ifColumn}" = "${ifValue}" ← "${thenColumn}" يجب أن يكون صحيحاً`,
            evaluate(data) {
                const violations = [];

                data.forEach((row, idx) => {
                    const condMet = String(row[ifColumn] || "").trim().toLowerCase()
                        === String(ifValue).toLowerCase();

                    if (!condMet) return;

                    const val    = row[thenColumn];
                    const result = thenRule.validate(val);

                    if (!result.valid) {
                        violations.push({
                            rowIndex: idx,
                            column  : thenColumn,
                            value   : val,
                            reason  : result.reason
                        });
                    }
                });

                return {
                    passed  : violations.length === 0,
                    violations,
                    score   : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary : `${violations.length} انتهاك في التبعية المشروطة`
                };
            }
        };
    }
};

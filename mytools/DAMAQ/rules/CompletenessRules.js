// rules/CompletenessRules.js

export const CompletenessRules = {

    // حقل إلزامي بسيط
    mandatory(column) {
        return {
            id      : `mandatory_${column}`,
            type    : "completeness",
            nameAr  : `الحقل الإلزامي: ${column}`,
            column,
            evaluate(data) {
                const violations = [];

                data.forEach((row, idx) => {
                    const val = row[column];
                    const isEmpty = val === undefined
                        || val === null
                        || String(val).trim() === "";

                    if (isEmpty) {
                        violations.push({
                            rowIndex : idx,
                            column,
                            value    : val,
                            reason   : `الحقل "${column}" إلزامي ولا يمكن أن يكون فارغاً`
                        });
                    }
                });

                return {
                    passed    : violations.length === 0,
                    violations,
                    score     : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary   : `${violations.length} صف يفتقر للحقل "${column}"`
                };
            }
        };
    },

    // حقل إلزامي مشروط
    // مثال: إذا كان country = "SA" → nationalID مطلوب
    conditionalMandatory(column, conditionColumn, conditionValue) {
        return {
            id     : `cond_mandatory_${column}`,
            type   : "completeness",
            nameAr : `إلزامي مشروط: "${column}" مطلوب عندما "${conditionColumn}" = "${conditionValue}"`,
            column,
            evaluate(data) {
                const violations = [];

                data.forEach((row, idx) => {
                    const condVal   = String(row[conditionColumn] || "").trim().toLowerCase();
                    const targetVal = String(row[column] || "").trim();
                    const condMet   = condVal === String(conditionValue).toLowerCase();

                    if (condMet && targetVal === "") {
                        violations.push({
                            rowIndex       : idx,
                            column,
                            conditionColumn,
                            conditionValue,
                            reason: `"${column}" مطلوب لأن "${conditionColumn}" = "${conditionValue}"`
                        });
                    }
                });

                const applicableRows = data.filter(row =>
                    String(row[conditionColumn] || "").trim().toLowerCase()
                    === String(conditionValue).toLowerCase()
                ).length;

                return {
                    passed       : violations.length === 0,
                    violations,
                    applicableRows,
                    score        : applicableRows > 0
                        ? +((1 - violations.length / applicableRows) * 100).toFixed(1)
                        : 100,
                    summary: `${violations.length} انتهاك من أصل ${applicableRows} صف مشروط`
                };
            }
        };
    },

    // نسبة اكتمال مقبولة (مثال: لا يزيد الفراغ عن 10%)
    completenessThreshold(column, maxEmptyPct = 10) {
        return {
            id     : `threshold_${column}`,
            type   : "completeness",
            nameAr : `حد الاكتمال: "${column}" لا يتجاوز ${maxEmptyPct}% فراغ`,
            column,
            evaluate(data) {
                const empty = data.filter(row => {
                    const val = row[column];
                    return val === undefined || val === null || String(val).trim() === "";
                }).length;

                const emptyPct = (empty / data.length) * 100;
                const passed   = emptyPct <= maxEmptyPct;

                return {
                    passed,
                    emptyCount : empty,
                    emptyPct   : +emptyPct.toFixed(1),
                    threshold  : maxEmptyPct,
                    score      : passed ? 100 : +(100 - (emptyPct - maxEmptyPct)).toFixed(1),
                    summary    : `${emptyPct.toFixed(1)}% فراغ — الحد المسموح ${maxEmptyPct}%`
                };
            }
        };
    }
};

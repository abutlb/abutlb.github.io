// rules/IntegrityRules.js

export const IntegrityRules = {

    // التحقق من وجود القيمة في مجموعة مرجعية
    referentialIntegrity(column, referenceValues, referenceName = "") {
        return {
            id     : `ref_integrity_${column}`,
            type   : "integrity",
            nameAr : `سلامة المرجع: "${column}" موجود في ${referenceName || "القائمة المرجعية"}`,
            evaluate(data) {
                const refSet     = new Set(
                    referenceValues.map(v => String(v).trim().toLowerCase())
                );
                const violations = [];

                data.forEach((row, idx) => {
                    const val = String(row[column] || "").trim();
                    if (!val) return;

                    if (!refSet.has(val.toLowerCase())) {
                        violations.push({
                            rowIndex : idx,
                            column,
                            value    : val,
                            reason   : `القيمة "${val}" غير موجودة في ${referenceName || "القائمة المرجعية"}`
                        });
                    }
                });

                return {
                    passed  : violations.length === 0,
                    violations,
                    score   : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary : `${violations.length} قيمة غير موجودة في المرجع`
                };
            }
        };
    },

    // التحقق من تطابق عمودين (مثال: ID في جدولين)
    crossDatasetIntegrity(column, referenceData, referenceColumn) {
        return {
            id     : `cross_integrity_${column}`,
            type   : "integrity",
            nameAr : `تطابق البيانات: "${column}" موجود في مجموعة البيانات المرجعية`,
            evaluate(data) {
                const refSet = new Set(
                    referenceData.map(r =>
                        String(r[referenceColumn] || "").trim().toLowerCase()
                    )
                );
                const violations = [];

                data.forEach((row, idx) => {
                    const val = String(row[column] || "").trim();
                    if (!val) return;

                    if (!refSet.has(val.toLowerCase())) {
                        violations.push({
                            rowIndex : idx,
                            column,
                            value    : val,
                            reason   : `"${val}" غير موجود في البيانات المرجعية`
                        });
                    }
                });

                return {
                    passed  : violations.length === 0,
                    violations,
                    score   : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary : `${violations.length} قيمة لا تجد مطابقاً في المرجع`
                };
            }
        };
    },

    // التحقق من عدم وجود قيم null في مجموعة أعمدة معاً
    noNullGroup(columns) {
        return {
            id     : `no_null_group_${columns.join("_")}`,
            type   : "integrity",
            nameAr : `لا فراغ في المجموعة: [${columns.join(", ")}]`,
            evaluate(data) {
                const violations = [];

                data.forEach((row, idx) => {
                    const emptyInGroup = columns.filter(col => {
                        const val = row[col];
                        return val === undefined || val === null || String(val).trim() === "";
                    });

                    if (emptyInGroup.length > 0) {
                        violations.push({
                            rowIndex     : idx,
                            emptyColumns : emptyInGroup,
                            reason       : `الأعمدة [${emptyInGroup.join(", ")}] فارغة في نفس الصف`
                        });
                    }
                });

                return {
                    passed  : violations.length === 0,
                    violations,
                    score   : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary : `${violations.length} صف يحتوي فراغاً في مجموعة الأعمدة`
                };
            }
        };
    }
};

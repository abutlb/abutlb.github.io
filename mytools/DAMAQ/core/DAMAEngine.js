// core/DAMAEngine.js
export class DAMAEngine {

    // أوزان الأبعاد الافتراضية (قابلة للتخصيص)
    static DEFAULT_WEIGHTS = {
        completeness : 0.20,
        validity     : 0.20,
        consistency  : 0.15,
        accuracy     : 0.15,
        timeliness   : 0.10,
        uniqueness   : 0.10,
        integrity    : 0.10
    };

    static evaluate(data, columns, profileResults, options = {}) {
        const weights = options.weights || this.DEFAULT_WEIGHTS;

        const dimensions = {
            completeness : this.calcCompleteness(data, columns, profileResults),
            validity     : this.calcValidity(data, columns, profileResults),
            consistency  : this.calcConsistency(data, columns, profileResults),
            accuracy     : this.calcAccuracy(data, columns, profileResults),
            timeliness   : this.calcTimeliness(data, columns, profileResults),
            uniqueness   : this.calcUniqueness(data, columns, profileResults),
            integrity    : this.calcIntegrity(data, columns, profileResults),
        };

        // الدرجة الكلية المرجحة
        const overall = Object.entries(dimensions).reduce((sum, [key, dim]) => {
            return sum + (dim.score * (weights[key] || 0));
        }, 0);

        return {
            dimensions,
            overall        : Math.round(overall),
            weights,
            grade          : this.getGrade(overall),
            recommendations: this.generateRecommendations(dimensions),
            evaluatedAt    : new Date().toISOString()
        };
    }

    // ── 1. Completeness ─────────────────────────────────────────
    static calcCompleteness(data, columns, profile) {
        const totalCells = data.length * columns.length;
        const emptyCells = profile.__dataset__?.totalEmpty || 0;
        const score      = ((totalCells - emptyCells) / totalCells) * 100;

        const worstCols = columns
            .filter(c => profile[c]?.emptyPct > 20)
            .map(c => ({ column: c, emptyPct: profile[c].emptyPct }))
            .sort((a, b) => b.emptyPct - a.emptyPct);

        return {
            score    : +score.toFixed(1),
            emptyCells,
            totalCells,
            worstCols,
            details  : `${emptyCells} خلية فارغة من أصل ${totalCells}`
        };
    }

    // ── 2. Validity ─────────────────────────────────────────────
    static calcValidity(data, columns, profile) {
        let valid = 0, total = 0;
        const issues = [];

        columns.forEach(col => {
            const p = profile[col];
            if (!p) return;

            // Mixed types = مشكلة validity
            if (p.mixedTypes?.hasMixed) {
                issues.push({
                    column : col,
                    issue  : `أنواع بيانات مختلطة: ${p.mixedTypes.types.join(", ")}`
                });
            }

            // Unicode issues
            if (p.unicodeIssues?.hasIssues) {
                issues.push({
                    column : col,
                    issue  : `مشاكل Unicode في ${p.unicodeIssues.count} قيمة`
                });
            }

            // نحسب نسبة القيم الصالحة
            const colValid = p.nonEmpty - (p.mixedTypes?.hasMixed ? p.rareValues?.length || 0 : 0);
            valid += Math.max(0, colValid);
            total += p.total;
        });

        const score = total > 0 ? (valid / total) * 100 : 100;

        return {
            score  : +score.toFixed(1),
            issues,
            details: `${issues.length} مشكلة validity مكتشفة`
        };
    }

    // ── 3. Consistency ──────────────────────────────────────────
    static calcConsistency(data, columns, profile) {
        let consistencyScore = 100;
        const issues = [];

        columns.forEach(col => {
            const p = profile[col];
            if (!p || p.nonEmpty === 0) return;

            // إذا الأنماط متعددة جداً → عدم تناسق
            if (p.patterns?.length > 3) {
                const dominantPct = p.patterns[0]?.pct || 0;
                if (dominantPct < 70) {
                    const penalty = (100 - dominantPct) * 0.3;
                    consistencyScore -= penalty / columns.length;
                    issues.push({
                        column : col,
                        issue  : `أنماط متعددة — النمط السائد فقط ${dominantPct}%`
                    });
                }
            }

            // Hidden spaces = عدم تناسق
            if (p.hiddenSpaces?.pct > 5) {
                issues.push({
                    column : col,
                    issue  : `${p.hiddenSpaces.count} قيمة تحتوي مسافات مخفية`
                });
            }
        });

        return {
            score  : +Math.max(0, consistencyScore).toFixed(1),
            issues,
            details: `${issues.length} مشكلة تناسق مكتشفة`
        };
    }

    // ── 4. Accuracy ─────────────────────────────────────────────
    static calcAccuracy(data, columns, profile) {
        let totalOutliers = 0;
        let totalNumeric  = 0;
        const issues = [];

        columns.forEach(col => {
            const p = profile[col];
            if (!p || p.type !== "number") return;

            totalNumeric += p.nonEmpty;
            const outlierCount = p.outliers?.count || 0;
            totalOutliers += outlierCount;

            if (outlierCount > 0) {
                issues.push({
                    column : col,
                    issue  : `${outlierCount} قيمة متطرفة (${p.outliers?.pct}%)`,
                    bounds : p.outliers?.bounds
                });
            }
        });

        const score = totalNumeric > 0
            ? ((totalNumeric - totalOutliers) / totalNumeric) * 100
            : 90; // لا أعمدة رقمية → نفترض دقة جيدة

        return {
            score  : +score.toFixed(1),
            totalOutliers,
            issues,
            details: `${totalOutliers} قيمة متطرفة في الأعمدة الرقمية`
        };
    }

    // ── 5. Timeliness ───────────────────────────────────────────
    static calcTimeliness(data, columns, profile) {
        const dateCols = columns.filter(c => profile[c]?.type === "date");

        if (dateCols.length === 0) {
            return {
                score  : 85,
                details: "لا توجد أعمدة تاريخ — تقييم افتراضي",
                issues : []
            };
        }

        const now    = Date.now();
        let recent   = 0;
        let total    = 0;
        const issues = [];

        dateCols.forEach(col => {
            data.forEach(row => {
                const val = row[col];
                if (!val) return;
                const d = new Date(val);
                if (isNaN(d.getTime())) return;
                total++;
                const ageDays = (now - d.getTime()) / 86400000;
                if (ageDays <= 365) recent++;
                else if (ageDays > 365 * 3) {
                    issues.push({ column: col, value: val, ageDays: Math.round(ageDays) });
                }
            });
        });

        const score = total > 0 ? (recent / total) * 100 : 85;

        return {
            score  : +score.toFixed(1),
            dateCols,
            issues : issues.slice(0, 10),
            details: `${recent} من ${total} تاريخ خلال السنة الماضية`
        };
    }

    // ── 6. Uniqueness ───────────────────────────────────────────
    static calcUniqueness(data, columns, profile) {
        const dupRows  = profile.__dataset__?.duplicateRows || 0;
        const score    = ((data.length - dupRows) / data.length) * 100;

        // كشف الأعمدة التي تبدو Primary Key
        const pkCandidates = columns.filter(
            c => profile[c]?.cardinality?.ratio === 1
        );

        return {
            score       : +score.toFixed(1),
            duplicateRows: dupRows,
            pkCandidates,
            details     : `${dupRows} صف مكرر من أصل ${data.length}`
        };
    }

    // ── 7. Integrity ────────────────────────────────────────────
    static calcIntegrity(data, columns, profile) {
        // في هذه المرحلة: نقيس سلامة البنية الداخلية
        const constantCols  = profile.__dataset__?.constantCols || [];
        const nearEmptyCols = profile.__dataset__?.nearEmptyCols || [];

        let score = 100;
        const issues = [];

        if (constantCols.length > 0) {
            score -= constantCols.length * 5;
            issues.push({
                type   : "constant_columns",
                columns: constantCols,
                issue  : `${constantCols.length} عمود ثابت القيمة (لا قيمة تحليلية)`
            });
        }

        if (nearEmptyCols.length > 0) {
            score -= nearEmptyCols.length * 8;
            issues.push({
                type   : "near_empty_columns",
                columns: nearEmptyCols,
                issue  : `${nearEmptyCols.length} عمود شبه فارغ (>70% فراغ)`
            });
        }

        return {
            score  : +Math.max(0, score).toFixed(1),
            constantCols,
            nearEmptyCols,
            issues,
            details: `${issues.length} مشكلة سلامة بنية مكتشفة`
        };
    }

    // ── Grade ───────────────────────────────────────────────────
    static getGrade(score) {
        if (score >= 90) return { label: "ممتاز",  color: "green",  icon: "🟢" };
        if (score >= 75) return { label: "جيد جداً", color: "blue",  icon: "🔵" };
        if (score >= 60) return { label: "جيد",    color: "yellow", icon: "🟡" };
        if (score >= 40) return { label: "ضعيف",   color: "orange", icon: "🟠" };
        return                  { label: "حرج",    color: "red",    icon: "🔴" };
    }

    // ── Recommendations ─────────────────────────────────────────
    static generateRecommendations(dimensions) {
        const recs = [];

        if (dimensions.completeness.score < 90)
            recs.push({
                priority : "عالية",
                dimension: "الاكتمال",
                action   : "معالجة القيم المفقودة في الأعمدة: " +
                           dimensions.completeness.worstCols
                               .map(c => c.column).join(", ")
            });

        if (dimensions.validity.score < 85)
            recs.push({
                priority : "عالية",
                dimension: "الصلاحية",
                action   : "تصحيح مشاكل أنواع البيانات والـ Unicode"
            });

        if (dimensions.uniqueness.duplicateRows > 0)
            recs.push({
                priority : "متوسطة",
                dimension: "التفرد",
                action   : `إزالة ${dimensions.uniqueness.duplicateRows} صف مكرر`
            });

        if (dimensions.accuracy.totalOutliers > 0)
            recs.push({
                priority : "متوسطة",
                dimension: "الدقة",
                action   : `مراجعة ${dimensions.accuracy.totalOutliers} قيمة متطرفة`
            });

        if (dimensions.integrity.constantCols?.length > 0)
            recs.push({
                priority : "منخفضة",
                dimension: "السلامة",
                action   : `حذف الأعمدة الثابتة: ${dimensions.integrity.constantCols.join(", ")}`
            });

        return recs.sort((a, b) =>
            ["عالية","متوسطة","منخفضة"].indexOf(a.priority) -
            ["عالية","متوسطة","منخفضة"].indexOf(b.priority)
        );
    }
}

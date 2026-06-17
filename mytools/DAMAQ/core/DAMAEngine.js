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
        const weights  = options.weights  || this.DEFAULT_WEIGHTS;
        const metadata = options.metadata || {};

        const dimensions = {
            completeness : this.calcCompleteness(data, columns, profileResults),
            validity     : this.calcValidity(data, columns, profileResults),
            consistency  : this.calcConsistency(data, columns, profileResults),
            accuracy     : this.calcAccuracy(data, columns, profileResults),
            timeliness   : this.calcTimeliness(data, columns, profileResults, metadata),
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
        const issues = [];
        let totalPenalty = 0;
        let colsChecked  = 0;

        columns.forEach(col => {
            const p = profile[col];
            if (!p || p.nonEmpty === 0) return;
            colsChecked++;

            let colPenalty = 0;

            // أنواع بيانات مختلطة
            if (p.mixedTypes?.hasMixed) {
                issues.push({
                    column : col,
                    issue  : `أنواع بيانات مختلطة: ${p.mixedTypes.types.join(", ")}`
                });
                colPenalty += 30;
            }

            // مشاكل Unicode
            if (p.unicodeIssues?.hasIssues) {
                const unicodePct = (p.unicodeIssues.count / p.nonEmpty) * 100;
                issues.push({
                    column : col,
                    issue  : `مشاكل Unicode في ${p.unicodeIssues.count} قيمة (${unicodePct.toFixed(1)}%)`
                });
                colPenalty += Math.min(20, unicodePct);
            }

            // مسافات مخفية كثيرة
            if (p.hiddenSpaces?.pct > 10) {
                colPenalty += Math.min(15, p.hiddenSpaces.pct * 0.3);
            }

            totalPenalty += Math.min(colPenalty, 100);
        });

        const avgPenalty = colsChecked > 0 ? totalPenalty / colsChecked : 0;
        const score      = Math.max(0, 100 - avgPenalty);

        return {
            score  : +score.toFixed(1),
            issues,
            details: issues.length === 0
                ? "لا مشاكل validity — البيانات صالحة"
                : `${issues.length} مشكلة validity مكتشفة`
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
    static calcTimeliness(data, columns, profile, metadata = {}) {
        const dateCols = columns.filter(c => profile[c]?.type === "date");

        // ── لا توجد أعمدة تاريخ: نستخدم metadata الملف ──────────
        if (dateCols.length === 0) {
            if (metadata.fileLastModified) {
                const ageDays = (Date.now() - new Date(metadata.fileLastModified).getTime())
                    / 86400000;

                const score =
                    ageDays <=  30 ? 100 :
                    ageDays <=  90 ?  90 :
                    ageDays <= 180 ?  75 :
                    ageDays <= 365 ?  60 :
                    ageDays <= 730 ?  35 : 15;

                const ageText =
                    ageDays <  30  ? `${Math.round(ageDays)} يوماً` :
                    ageDays < 365  ? `${Math.round(ageDays / 30)} شهراً` :
                                     `${(ageDays / 365).toFixed(1)} سنة`;

                const statusText =
                    score >= 90 ? "حديثة" :
                    score >= 75 ? "مقبولة" :
                    score >= 60 ? "قديمة نسبياً" : "قديمة جداً";

                return {
                    score  : score,
                    ageDays: Math.round(ageDays),
                    issues : score < 60 ? [{
                        issue: `الملف لم يُعدَّل منذ ${ageText} — البيانات قد تكون قديمة`
                    }] : [],
                    details: `عمر الملف ${ageText} — البيانات ${statusText}`,
                    source : "fileMetadata"
                };
            }

            // لا أعمدة تاريخ ولا metadata
            return {
                score  : 100,
                details: "لا توجد أعمدة تاريخ — لا ينطبق هذا البُعد",
                issues : [],
                skipped: true
            };
        }

        // ── أعمدة تاريخ موجودة: قياس نسبة التواريخ الحديثة ──────
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
            details: `${recent} من ${total} تاريخ خلال السنة الماضية`,
            source : "dateColumns"
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

        // توصية الحداثة — بناءً على عمر الملف أو أعمدة التاريخ
        const tl = dimensions.timeliness;
        if (!tl.skipped && tl.score < 75) {
            const priority = tl.score < 40 ? "عالية" : "متوسطة";
            const action   = tl.source === "fileMetadata"
                ? `تحديث البيانات — الملف قديم (${tl.details.split("—")[0].trim()})`
                : `مراجعة التواريخ القديمة — ${tl.issues?.length || 0} تاريخ تجاوز 3 سنوات`;
            recs.push({ priority, dimension: "الحداثة", action });
        }

        return recs.sort((a, b) =>
            ["عالية","متوسطة","منخفضة"].indexOf(a.priority) -
            ["عالية","متوسطة","منخفضة"].indexOf(b.priority)
        );
    }
}

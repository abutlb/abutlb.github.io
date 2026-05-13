// core/CleaningEngine.js
import { SmartFiller }     from "../cleaning/SmartFiller.js";
import { OutlierHandler }  from "../cleaning/OutlierHandler.js";
import { DedupMerger }     from "../cleaning/DedupMerger.js";
import { TextNormalizer }  from "../cleaning/TextNormalizer.js";
import { DateNormalizer }  from "../cleaning/DateNormalizer.js";
import { PhoneNormalizer } from "../cleaning/PhoneNormalizer.js";
import { EncodingFixer }   from "../cleaning/EncodingFixer.js";
import { AuditLog }        from "../cleaning/AuditLog.js";

export class CleaningEngine {

    constructor(store) {
        this.store    = store;
        this.auditLog = new AuditLog();
        // نسخة عمل منفصلة — لا نعدل الأصل
        this.data     = JSON.parse(JSON.stringify(store.workingData));
        this.columns  = [...store.columns];
    }

    // ── 1. ملء القيم المفقودة ────────────────────────────────────
    fillMissing(column, method, options = {}) {
        let result;

        if (method === "forward_fill") {
            result = SmartFiller.forwardFill(this.data, column);
        } else if (method === "drop_rows") {
            result = SmartFiller.dropRows(this.data, [column]);
            this.data = result.cleaned;
        } else {
            result = SmartFiller.fill(this.data, column, method, options);
        }

        this.auditLog.log({
            type       : "fill_missing",
            column,
            method,
            affected   : result.count,
            description: `ملء ${result.count} قيمة فارغة في "${column}" بطريقة "${method}"`
        });

        return result;
    }

    // ملء ذكي تلقائي — يستخدم التوصية
    autoFill(column) {
        const profile     = this.store.profileResults?.[column];
        if (!profile) return null;

        const recommendation = SmartFiller.recommend(profile);

        if (recommendation.method === "drop_column") {
            this._dropColumn(column);
            return { action: "dropped_column", ...recommendation };
        }

        return {
            ...this.fillMissing(column, recommendation.method, {
                value: recommendation.value
            }),
            recommendation
        };
    }

    // ── 2. معالجة القيم المتطرفة ─────────────────────────────────
    handleOutliers(column, strategy = "cap", method = "iqr") {
        const result = OutlierHandler.handle(this.data, column, strategy, method);

        if (strategy === "remove" && result.cleaned) {
            this.data = result.cleaned;
        }

        this.auditLog.log({
            type       : "handle_outliers",
            column,
            method     : `${strategy} (${method})`,
            affected   : result.count,
            description: `معالجة ${result.count} قيمة متطرفة في "${column}" بطريقة "${strategy}"`
        });

        return result;
    }

    // ── 3. إزالة التكرار ─────────────────────────────────────────
    removeDuplicates(columns = null) {
        const result  = DedupMerger.removeDuplicates(this.data, columns);
        this.data     = result.cleaned;

        this.auditLog.log({
            type       : "remove_duplicates",
            column     : columns ? columns.join(", ") : "الكل",
            method     : "exact_match",
            affected   : result.removed,
            description: `إزالة ${result.removed} صف مكرر`
        });

        return result;
    }

    // ── 4. توحيد النصوص ──────────────────────────────────────────
    normalizeText(column, options = {}) {
        const result = TextNormalizer.normalizeColumn(this.data, column, options);

        this.auditLog.log({
            type       : "normalize_text",
            column,
            method     : "text_normalization",
            affected   : result.count,
            description: `توحيد ${result.count} قيمة نصية في "${column}"`
        });

        return result;
    }

    // ── 5. توحيد التواريخ ────────────────────────────────────────
    normalizeDates(column) {
        const result = DateNormalizer.normalizeColumn(this.data, column);

        this.auditLog.log({
            type       : "normalize_dates",
            column,
            method     : "YYYY-MM-DD",
            affected   : result.count,
            description: `توحيد ${result.count} تاريخ في "${column}" إلى YYYY-MM-DD`
        });

        return result;
    }

    // ── 6. توحيد أرقام الجوال ────────────────────────────────────
    normalizePhones(column) {
        const result = PhoneNormalizer.normalizeColumn(this.data, column);

        this.auditLog.log({
            type       : "normalize_phones",
            column,
            method     : "saudi_format",
            affected   : result.count,
            description: `توحيد ${result.count} رقم جوال في "${column}"`
        });

        return result;
    }

    // ── 7. إصلاح الترميز ─────────────────────────────────────────
    fixEncoding(column) {
        const result = EncodingFixer.fixColumn(this.data, column);

        this.auditLog.log({
            type       : "fix_encoding",
            column,
            method     : "unicode_fix",
            affected   : result.count,
            description: `إصلاح ${result.count} قيمة بمشاكل ترميز في "${column}"`
        });

        return result;
    }

    // ── تنظيف شامل تلقائي ────────────────────────────────────────
    autoCleanAll(profileResults) {
        const actions = [];

        this.columns.forEach(column => {
            const profile = profileResults[column];
            if (!profile) return;

            // 1. إصلاح الترميز أولاً دائماً
            if (profile.unicodeIssues?.hasIssues) {
                const r = this.fixEncoding(column);
                if (r.count > 0) actions.push(`إصلاح ترميز "${column}": ${r.count} قيمة`);
            }

            // 2. توحيد النصوص
            if (profile.type === "text" && profile.hiddenSpaces?.count > 0) {
                const r = this.normalizeText(column, { trimSpaces: true });
                if (r.count > 0) actions.push(`توحيد نصوص "${column}": ${r.count} قيمة`);
            }

            // 3. توحيد التواريخ
            if (profile.type === "date") {
                const r = this.normalizeDates(column);
                if (r.count > 0) actions.push(`توحيد تواريخ "${column}": ${r.count} قيمة`);
            }

            // 4. ملء القيم المفقودة بالتوصية الذكية
            if (profile.emptyPct > 0 && profile.emptyPct <= 70) {
                const r = this.autoFill(column);
                if (r?.count > 0) actions.push(`ملء فراغات "${column}": ${r.count} قيمة`);
            }

            // 5. معالجة القيم المتطرفة
            if (profile.type === "number" && (profile.outliers?.count || 0) > 0) {
                const r = this.handleOutliers(column, "cap", "iqr");
                if (r.count > 0) actions.push(`معالجة قيم متطرفة "${column}": ${r.count} قيمة`);
            }
        });

        // 6. إزالة التكرار دائماً في النهاية
        const dedup = this.removeDuplicates();
        if (dedup.removed > 0) actions.push(`إزالة تكرار: ${dedup.removed} صف`);

        return { actions, auditLog: this.auditLog.summary() };
    }

    // ── حذف عمود ─────────────────────────────────────────────────
    _dropColumn(column) {
        this.data.forEach(row => delete row[column]);
        this.columns = this.columns.filter(c => c !== column);

        this.auditLog.log({
            type       : "drop_column",
            column,
            method     : "high_null_rate",
            affected   : this.data.length,
            description: `حذف العمود "${column}" بسبب ارتفاع نسبة الفراغ`
        });
    }

    // ── الحصول على النتيجة النهائية ──────────────────────────────
    getResult() {
        return {
            data     : this.data,
            columns  : this.columns,
            auditLog : this.auditLog.summary(),
            rowCount : this.data.length,
            colCount : this.columns.length
        };
    }
}

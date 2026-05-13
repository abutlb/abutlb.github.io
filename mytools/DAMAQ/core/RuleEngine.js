// core/RuleEngine.js
import { CompletenessRules } from "../rules/CompletenessRules.js";
import { ValidityRules }     from "../rules/ValidityRules.js";
import { ConsistencyRules }  from "../rules/ConsistencyRules.js";
import { UniquenessRules }   from "../rules/UniquenessRules.js";
import { TimelinessRules }   from "../rules/TimelinessRules.js";
import { IntegrityRules }    from "../rules/IntegrityRules.js";

export class RuleEngine {

    constructor() {
        this.rules   = [];   // قائمة القواعد المفعّلة
        this.results = [];   // نتائج آخر تشغيل
    }

    // ── إضافة قاعدة ─────────────────────────────────────────────
    addRule(rule) {
        this.rules.push(rule);
        return this; // للـ chaining
    }

    // ── إضافة مجموعة قواعد ──────────────────────────────────────
    addRules(rulesArray) {
        rulesArray.forEach(r => this.addRule(r));
        return this;
    }

    // ── حذف قاعدة ───────────────────────────────────────────────
    removeRule(ruleId) {
        this.rules = this.rules.filter(r => r.id !== ruleId);
        return this;
    }

    // ── تشغيل كل القواعد ────────────────────────────────────────
    run(data) {
        this.results = this.rules.map(rule => {
            try {
                const result = rule.evaluate(data);
                return {
                    ruleId    : rule.id,
                    ruleName  : rule.nameAr,
                    type      : rule.type,
                    ...result,
                    status    : result.passed ? "✅ نجح" : "❌ فشل"
                };
            } catch (err) {
                return {
                    ruleId  : rule.id,
                    ruleName: rule.nameAr,
                    type    : rule.type,
                    passed  : false,
                    score   : 0,
                    error   : err.message,
                    status  : "⚠️ خطأ في التنفيذ"
                };
            }
        });

        return this.getSummary();
    }

    // ── ملخص النتائج ─────────────────────────────────────────────
    getSummary() {
        const passed   = this.results.filter(r => r.passed).length;
        const failed   = this.results.filter(r => !r.passed).length;
        const total    = this.results.length;

        // تجميع حسب النوع
        const byType = {};
        this.results.forEach(r => {
            if (!byType[r.type]) byType[r.type] = { passed: 0, failed: 0, score: 0, count: 0 };
            byType[r.type].count++;
            byType[r.type].score += r.score || 0;
            if (r.passed) byType[r.type].passed++;
            else          byType[r.type].failed++;
        });

        // متوسط الدرجة لكل نوع
        Object.keys(byType).forEach(type => {
            byType[type].avgScore = +(byType[type].score / byType[type].count).toFixed(1);
        });

        // أشد الانتهاكات
        const topViolations = this.results
            .filter(r => !r.passed && r.violations?.length > 0)
            .sort((a, b) => (b.violations?.length || 0) - (a.violations?.length || 0))
            .slice(0, 5);

        return {
            total,
            passed,
            failed,
            passRate    : total > 0 ? +((passed / total) * 100).toFixed(1) : 100,
            byType,
            topViolations,
            results     : this.results,
            ranAt       : new Date().toISOString()
        };
    }

    // ── بناء قواعد من Template ───────────────────────────────────
    static fromTemplate(template, data, columns) {
        const engine = new RuleEngine();

        // قواعد الاكتمال
        template.mandatoryFields?.forEach(col => {
            if (columns.includes(col))
                engine.addRule(CompletenessRules.mandatory(col));
        });

        // قواعد الصلاحية السعودية
        template.saudiFields?.forEach(({ column, type }) => {
            if (!columns.includes(column)) return;
            const rule = ValidityRules[type];
            if (rule) {
                engine.addRule({
                    ...rule,
                    id    : `${rule.id}_${column}`,
                    column,
                    evaluate(d) {
                        const violations = [];
                        d.forEach((row, idx) => {
                            const val = row[column];
                            if (!val) return;
                            const result = rule.validate(val);
                            if (!result.valid) {
                                violations.push({ rowIndex: idx, value: val, reason: result.reason });
                            }
                        });
                        return {
                            passed  : violations.length === 0,
                            violations,
                            score   : +((1 - violations.length / d.length) * 100).toFixed(1),
                            summary : `${violations.length} قيمة غير صالحة في "${column}"`
                        };
                    }
                });
            }
        });

        // قواعد التناسق
        template.dateOrders?.forEach(({ start, end }) => {
            if (columns.includes(start) && columns.includes(end))
                engine.addRule(ConsistencyRules.dateOrder(start, end));
        });

        // قواعد التفرد
        template.uniqueColumns?.forEach(col => {
            if (columns.includes(col))
                engine.addRule(UniquenessRules.uniqueColumn(col));
        });

        return engine;
    }

    // ── تصدير القواعد كـ JSON (للحفظ والاستعادة) ────────────────
    exportRules() {
        return JSON.stringify(
            this.rules.map(r => ({
                id    : r.id,
                type  : r.type,
                nameAr: r.nameAr
            })),
            null, 2
        );
    }
}

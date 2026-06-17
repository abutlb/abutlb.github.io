// scenarios/FamilyScenario.js — تحليل السيناريو العائلي

import { fmtK, fmtPct } from "../utils/Formatters.js";

export class FamilyScenario {

    static calculate(inputs, base) {
        const familySize   = Math.max(1, inputs.familySize   || 4);
        const currentAge   = inputs.currentAge  || 32;
        const children     = inputs.childrenCount || 0;
        const { netOwnership, netRent, years, futureValue, monthly } = base;

        const stage = currentAge < 35 ? 'مرحلة البناء والتأسيس'
                    : currentAge < 50 ? 'مرحلة الاستقرار والنمو'
                    :                   'مرحلة ما قبل التقاعد';

        const costPerMember = netOwnership / familySize / years / 12;
        const rentPerMember = netRent      / familySize / years / 12;

        // سنوات الحاجة للاستقرار الدراسي للأطفال
        const schoolYears = children > 0 ? Math.min(18, Math.max(0, 18 - (currentAge - 30))) : 0;

        // الميراث المتوقع
        const inheritance = futureValue;

        return {
            familySize, currentAge, children, stage,
            costPerMember, rentPerMember,
            schoolYears, inheritance,
            insights: this._buildInsights({ familySize, currentAge, children,
                stage, schoolYears, monthly, base, inputs }),
        };
    }

    static _buildInsights({ familySize, currentAge, children,
                            stage, schoolYears, monthly, base, inputs }) {
        const items = [];

        if (children > 0 && schoolYears > 5) {
            items.push({
                icon: '🏫', color: 'blue',
                text: `مع ${children} أطفال وحاجة ${schoolYears} سنة من الاستقرار الدراسي، التملك يوفر بيئة ثابتة.`,
            });
        }

        if (currentAge > 50) {
            items.push({
                icon: '🎯', color: 'purple',
                text: `في مرحلة ما قبل التقاعد، التملك يلغي عبء الإيجار عند انخفاض الدخل مستقبلاً.`,
            });
        }

        if (familySize >= 5) {
            items.push({
                icon: '👨‍👩‍👧‍👦', color: 'emerald',
                text: `الأسرة الكبيرة (${familySize} أفراد) تستفيد أكثر من ثبات التكاليف في التملك مقابل تصاعد الإيجار.`,
            });
        }

        items.push({
            icon: '🏦', color: 'amber',
            text: `القيمة المتوقعة للعقار عند إنهاء التمويل: ${fmtK(base.futureValue)} — ثروة قابلة للتوريث.`,
        });

        return items;
    }
}

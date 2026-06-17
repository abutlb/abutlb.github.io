// scenarios/PersonalScenario.js — تحليل إضافي للسيناريو الشخصي

import { fmtK, fmtPct } from "../utils/Formatters.js";

export class PersonalScenario {

    static calculate(inputs, base) {
        const { netOwnership, netRent, years, monthly, futureValue,
                invested, investedFV, price } = base;

        // نسبة القسط من الراتب (لو أدخل المستخدم راتبه — اختياري)
        const monthlyIncome = inputs.monthlyIncome || 0;
        const debtRatio     = monthlyIncome > 0 ? (monthly / monthlyIncome) * 100 : null;

        // معدل تكلفة الإيجار لو استمر بدون تملك
        const rentIfForever = base.cumRent * (years / (years || 1)) * 2;

        return {
            debtRatio,
            savingsRequired: base.downPayment + base.closingCostAmt,
            monthlySavings:  (base.downPayment + base.closingCostAmt) / 24, // لو يريد الادخار خلال سنتين
            priceToRentRatio: price / (inputs.monthlyRent * 12),
            insights: this._buildInsights(base, inputs, debtRatio),
        };
    }

    static _buildInsights(base, inputs, debtRatio) {
        const items = [];
        const ptr = base.price / (inputs.monthlyRent * 12);

        if (ptr < 15) {
            items.push({ icon: '✅', text: `نسبة السعر للإيجار (${ptr.toFixed(0)}x) ممتازة — الشراء منطقي جداً.`, color: 'emerald' });
        } else if (ptr < 20) {
            items.push({ icon: '🟡', text: `نسبة السعر للإيجار (${ptr.toFixed(0)}x) معقولة.`, color: 'amber' });
        } else {
            items.push({ icon: '⚠️', text: `نسبة السعر للإيجار مرتفعة (${ptr.toFixed(0)}x) — العقار مكلف نسبياً.`, color: 'red' });
        }

        if (debtRatio !== null) {
            if (debtRatio <= 30) items.push({ icon: '✅', text: `نسبة القسط للراتب (${fmtPct(debtRatio)}) آمنة.`, color: 'emerald' });
            else if (debtRatio <= 45) items.push({ icon: '🟡', text: `نسبة القسط للراتب (${fmtPct(debtRatio)}) مقبولة لكن تحتاج متابعة.`, color: 'amber' });
            else items.push({ icon: '🔴', text: `نسبة القسط للراتب (${fmtPct(debtRatio)}) مرتفعة — قد تضغط على ميزانيتك.`, color: 'red' });
        }

        if (inputs.appreciation >= 5) {
            items.push({ icon: '📈', text: 'توقعات ارتفاع العقار مرتفعة — التملك المبكر يزيد المكسب.', color: 'blue' });
        }

        return items;
    }
}

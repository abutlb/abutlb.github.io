// scenarios/InvestmentScenario.js — تحليل السيناريو الاستثماري

import { fmtK, fmtPct } from "../utils/Formatters.js";

export class InvestmentScenario {

    static calculate(inputs, base) {
        const invRentM  = inputs.invRent     || 0;
        const vacancy   = (inputs.vacancyRate || 8) / 100;
        const mgmt      = (inputs.mgmtFee    || 5) / 100;
        const maintRate = (inputs.maintenance || 1) / 100;
        const insRate   = (inputs.insuranceRate || 0.3) / 100;
        const { price, monthly, years, futureValue } = base;

        // ── العائد الإجمالي ──
        const grossAnn   = invRentM * 12 * (1 - vacancy);
        const grossYield = price > 0 ? (grossAnn / price) * 100 : 0;

        // ── صافي العائد ──
        const opex    = price * maintRate + price * insRate + grossAnn * mgmt;
        const netAnn  = grossAnn - opex;
        const netYield = price > 0 ? (netAnn / price) * 100 : 0;

        // ── التدفق النقدي الشهري بعد القسط ──
        const cashFlow = netAnn / 12 - monthly;

        // ── فترة الاسترداد ──
        const payback = netAnn > 0 ? price / netAnn : Infinity;

        // ── إجمالي الدخل الإيجاري خلال فترة الاحتفاظ ──
        const totalRentalIncome = netAnn * years;

        // ── ROI الكلي = (ربح البيع + إجمالي الإيجار) / التكلفة الأولية ──
        const initialCost = base.downPayment + base.closingCostAmt;
        const capitalGain = futureValue - price;
        const totalROI    = initialCost > 0
            ? ((capitalGain + totalRentalIncome) / initialCost) * 100 : 0;

        return {
            invRentM, grossAnn, netAnn, grossYield, netYield,
            cashFlow, payback, totalRentalIncome, totalROI, futureValue,
            rating: this._rating(netYield),
            insights: this._buildInsights({ netYield, cashFlow, grossYield, payback, totalROI }),
        };
    }

    static _rating(netYield) {
        if (netYield >= 7) return { label: 'استثمار ممتاز',  color: 'emerald', icon: '✅' };
        if (netYield >= 5) return { label: 'استثمار جيد',    color: 'blue',    icon: '👍' };
        if (netYield >= 3) return { label: 'استثمار مقبول',  color: 'amber',   icon: '⚠️' };
        return               { label: 'عائد متدني',          color: 'red',     icon: '❌' };
    }

    static _buildInsights({ netYield, cashFlow, grossYield, payback, totalROI }) {
        const items = [];

        items.push({
            icon: netYield >= 5 ? '✅' : '⚠️',
            color: netYield >= 5 ? 'emerald' : 'amber',
            text: `صافي العائد ${fmtPct(netYield)} — ${netYield >= 5
                ? 'يتجاوز متوسط السوق الإيجاري (4-5%).'
                : 'قريب من الحد الأدنى للكفاءة الاستثمارية.'}`,
        });

        if (cashFlow < 0) {
            items.push({
                icon: '🔴', color: 'red',
                text: `عجز تدفق نقدي شهري (${fmtK(Math.abs(cashFlow))}) — القسط أعلى من الدخل الإيجاري الصافي.`,
            });
        } else {
            items.push({
                icon: '💰', color: 'emerald',
                text: `تدفق نقدي إيجابي ${fmtK(cashFlow)} شهرياً — الإيجار يغطي القسط ويزيد.`,
            });
        }

        if (payback < 20) {
            items.push({
                icon: '📅', color: 'blue',
                text: `تسترد رأس مالك من الإيجار وحده خلال ${payback.toFixed(0)} سنة.`,
            });
        }

        items.push({
            icon: '📊', color: 'purple',
            text: `العائد الكلي (إيجار + ارتفاع القيمة) على رأس المال الأولي: ${fmtPct(totalROI)}.`,
        });

        return items;
    }
}

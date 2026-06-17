// ui/AnalysisTab.js — تبويب التحليل المالي: جدول + فرصة بديلة

import { fmt, fmtK, fmtPct } from "../utils/Formatters.js";

export class AnalysisTab {

    render(store, chartBuilder) {
        const { results } = store;
        const { base }    = results;

        this._renderCompTable(base);
        this._renderOpportunityCost(base);

        // الرسوم البيانية
        chartBuilder.buildLineChart('lineChart',  base.yearData);
        chartBuilder.buildPieChart('pieChart',    base);
        chartBuilder.buildBarChart('barChart',    base.yearData);
    }

    // ── جدول المقارنة التفصيلية ───────────────────────────────────
    _renderCompTable(base) {
        const el = document.getElementById('compTableBody');
        if (!el) return;

        const rows = [
            ['الدفعة المقدمة',                    fmtK(base.downPayment),               '—'],
            ['القسط/الإيجار الشهري (أول سنة)',    fmtK(base.monthly),                   fmtK(base.inputs.monthlyRent)],
            [`إجمالي المدفوعات (${base.years} سنة)`, fmtK(base.cumOwn),                fmtK(base.cumRent)],
            ['إجمالي فوائد التمويل',              fmtK(base.totalInterest),              '—'],
            ['الصيانة والتأمين',                   fmtK(base.totalMaint + base.totalIns), '—'],
            ['رسوم التوثيق والشراء',               fmtK(base.closingCostAmt),             '—'],
            ['قيمة العقار المستقبلية',             fmtK(base.futureValue),                '—', 'emerald'],
            ['تكاليف البيع',                       fmtK(base.sellingCostAmt),             '—', 'red'],
            ['صافي قيمة البيع',                   fmtK(base.netFutureVal),               '—', 'emerald'],
        ];

        el.innerHTML = rows.map(([lbl, buy, rent, color]) => `
            <tr>
                <td class="font-bold">${lbl}</td>
                <td class="${color ? `text-${color}-600 dark:text-${color}-400 font-bold` : ''}">${buy}</td>
                <td class="text-gray-500 dark:text-gray-400">${rent}</td>
            </tr>`).join('') + `
            <tr class="bg-blue-50/50 dark:bg-blue-900/10">
                <td class="font-black text-sm">صافي التكلفة الحقيقية</td>
                <td class="font-black text-blue-700 dark:text-blue-400 text-base">${fmtK(base.netOwnership)}</td>
                <td class="font-black text-purple-700 dark:text-purple-400 text-base">${fmtK(base.cumRent)}</td>
            </tr>`;
    }

    // ── تكلفة الفرصة البديلة ─────────────────────────────────────
    _renderOpportunityCost(base) {
        const el = document.getElementById('oppContent');
        if (!el) return;

        const better = base.futureValue >= base.investedFV ? 'العقار' : 'الاستثمار';
        const diff   = Math.abs(base.futureValue - base.investedFV);

        el.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                    <p class="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                        <i class="fas fa-seedling ml-1"></i>لو استثمرت الدفعة المقدمة
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        ${fmtK(base.invested)} بعائد ${base.inputs.investRate}% / ${base.years} سنة
                    </p>
                    <p class="text-xl font-black text-blue-800 dark:text-blue-300">${fmtK(base.investedFV)}</p>
                    <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">ربح ${fmtK(base.investedGain)}</p>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                    <p class="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                        <i class="fas fa-home ml-1"></i>قيمة عقارك
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        نمو ${base.inputs.appreciation}% سنوياً / ${base.years} سنة
                    </p>
                    <p class="text-xl font-black text-purple-800 dark:text-purple-300">${fmtK(base.futureValue)}</p>
                    <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">ربح ${fmtK(base.futureValue - base.price)}</p>
                </div>
                <div class="bg-${base.futureValue >= base.investedFV ? 'emerald' : 'amber'}-50
                            dark:bg-${base.futureValue >= base.investedFV ? 'emerald' : 'amber'}-900/20
                            rounded-xl p-4 border border-${base.futureValue >= base.investedFV ? 'emerald' : 'amber'}-100
                            dark:border-${base.futureValue >= base.investedFV ? 'emerald' : 'amber'}-800">
                    <p class="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                        <i class="fas fa-balance-scale ml-1"></i>الأفضل نمواً لرأس المال
                    </p>
                    <p class="text-xl font-black text-gray-800 dark:text-white mt-3">${better}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">بفارق ${fmtK(diff)}</p>
                </div>
            </div>`;
    }
}

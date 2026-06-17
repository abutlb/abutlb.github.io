// ui/ScenarioTab.js — تبويب السيناريو المتخصص (عائلي / استثماري)

import { fmtK, fmtPct } from "../utils/Formatters.js";

export class ScenarioTab {

    render(store, chartBuilder) {
        const { scenario, results } = store;
        const { base, scenarioData } = results;

        const familyPanel = document.getElementById('familyPanel');
        const investPanel = document.getElementById('investPanel');
        if (familyPanel) familyPanel.classList.add('hidden');
        if (investPanel) investPanel.classList.add('hidden');

        if (scenario === 'family' && scenarioData) {
            familyPanel?.classList.remove('hidden');
            this._renderFamily(scenarioData, base);
            chartBuilder.buildNetWorthChart(
                'netWorthChart', base.yearData,
                base.netWorthOwn, base.netWorthRent
            );
        }

        if (scenario === 'investment' && scenarioData) {
            investPanel?.classList.remove('hidden');
            this._renderInvestment(scenarioData, base, store.inputs);
            chartBuilder.buildNetWorthChart(
                'netWorthChart2', base.yearData,
                base.netWorthOwn, base.netWorthRent
            );
            chartBuilder.buildCashFlowChart(
                'cashFlowChart', base.yearData, base.monthly,
                store.inputs.invRent,
                store.inputs.rentIncrease,
                store.inputs.vacancyRate,
                store.inputs.mgmtFee
            );
        }
    }

    // ── السيناريو العائلي ─────────────────────────────────────────
    _renderFamily(fd, base) {
        const el = document.getElementById('familyContent');
        if (!el) return;

        el.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-2">
                        <i class="fas fa-map-signs text-blue-600 dark:text-blue-400 text-sm"></i>
                    </div>
                    <p class="font-black text-sm text-gray-800 dark:text-white">${fd.stage}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">العمر ${fd.currentAge}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center mb-2">
                        <i class="fas fa-users text-emerald-600 dark:text-emerald-400 text-sm"></i>
                    </div>
                    <p class="font-black text-sm text-gray-800 dark:text-white">${fd.familySize} أفراد</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${fd.children} أطفال</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mb-2">
                        <i class="fas fa-user-tag text-purple-600 dark:text-purple-400 text-sm"></i>
                    </div>
                    <p class="font-black text-sm text-gray-800 dark:text-white">${fmtK(fd.costPerMember)}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">للفرد / شهر (تملك)</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center mb-2">
                        <i class="fas fa-landmark text-amber-600 dark:text-amber-400 text-sm"></i>
                    </div>
                    <p class="font-black text-sm text-gray-800 dark:text-white">${fmtK(fd.inheritance)}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">الميراث المتوقع</p>
                </div>
            </div>

            ${fd.insights.map(i => `
                <div class="flex items-start gap-3 p-3 rounded-xl bg-${i.color}-50 dark:bg-${i.color}-900/20
                            border border-${i.color}-100 dark:border-${i.color}-800 mb-2">
                    <span class="text-lg flex-shrink-0">${i.icon}</span>
                    <p class="text-sm text-gray-700 dark:text-gray-300">${i.text}</p>
                </div>`).join('')}`;
    }

    // ── السيناريو الاستثماري ──────────────────────────────────────
    _renderInvestment(inv, base, inputs) {
        const el = document.getElementById('investContent');
        if (!el) return;

        const cfClass  = inv.cashFlow >= 0 ? 'emerald' : 'red';
        const cfPrefix = inv.cashFlow >= 0 ? '+' : '';

        el.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                ${[
                    { lbl:'العائد الإجمالي',          val: fmtPct(inv.grossYield), color:'blue',    icon:'fa-percent'       },
                    { lbl:'صافي العائد',              val: fmtPct(inv.netYield),   color:'emerald', icon:'fa-check-circle'  },
                    { lbl:'التدفق النقدي / شهر',      val: cfPrefix + fmtK(inv.cashFlow), color: cfClass, icon: inv.cashFlow >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down' },
                    { lbl:'الدخل الإيجاري الصافي/سنة', val: fmtK(inv.netAnn),     color:'amber',   icon:'fa-coins'         },
                    { lbl:'فترة استرداد رأس المال',   val: inv.payback < 100 ? `${inv.payback.toFixed(0)} سنة` : '∞', color:'purple', icon:'fa-clock' },
                    { lbl:'ROI الكلي',                val: fmtPct(inv.totalROI),  color:'indigo',  icon:'fa-chart-bar'     },
                ].map(k => `
                    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div class="w-8 h-8 bg-${k.color}-100 dark:bg-${k.color}-900/40 rounded-lg flex items-center justify-center mb-2">
                            <i class="fas ${k.icon} text-${k.color}-600 dark:text-${k.color}-400 text-xs"></i>
                        </div>
                        <p class="text-lg font-black text-gray-800 dark:text-white">${k.val}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${k.lbl}</p>
                    </div>`).join('')}
            </div>

            <div class="bg-${inv.rating.color}-50 dark:bg-${inv.rating.color}-900/20 rounded-xl p-4
                        border-r-4 border-${inv.rating.color}-500 mb-4">
                <p class="font-black mb-1">${inv.rating.icon} ${inv.rating.label}</p>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                    ${inv.insights[0]?.text || ''}
                </p>
            </div>

            ${inv.insights.slice(1).map(i => `
                <div class="flex items-start gap-3 p-3 rounded-xl bg-${i.color}-50 dark:bg-${i.color}-900/20
                            border border-${i.color}-100 dark:border-${i.color}-800 mb-2">
                    <span class="text-base flex-shrink-0">${i.icon}</span>
                    <p class="text-sm text-gray-700 dark:text-gray-300">${i.text}</p>
                </div>`).join('')}

            <div class="ch-card mt-3" style="margin-bottom:0;">
                <div class="ch-title">التدفق النقدي الشهري خلال سنوات الاحتفاظ</div>
                <canvas id="cashFlowChart" height="200"></canvas>
            </div>`;
    }
}

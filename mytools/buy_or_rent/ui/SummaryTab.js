// ui/SummaryTab.js — تبويب الملخص: حكم القرار + KPIs + مقياس القرار

import { fmtK, fmtPct } from "../utils/Formatters.js";

export class SummaryTab {

    render(store) {
        const { results, scenario } = store;
        const { base, recommendation: rec, scenarioData } = results;

        // إخفاء صندوق السيناريو دائماً في البداية
        document.getElementById('scenarioSummaryBox')?.classList.add('hidden');

        this._renderVerdict(rec, base);
        this._renderKPIs(base);
        this._renderMeter(rec);
        this._renderKeyNumbers(base, rec);
        if (scenario !== 'personal') this._renderScenarioSummary(scenario, scenarioData);
    }

    // ── بطاقة الحكم ──────────────────────────────────────────────
    _renderVerdict(rec, base) {
        const el = document.getElementById('verdictCard');
        if (!el) return;

        const gradients = {
            buy:     'from-emerald-600 to-teal-600',
            rent:    'from-amber-500 to-orange-600',
            neutral: 'from-indigo-600 to-violet-600',
        };

        el.className = `bg-gradient-to-br ${gradients[rec.verdict]} rounded-2xl p-5 text-white mb-5 relative overflow-hidden`;
        el.innerHTML = `
            <div class="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
            <div class="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div class="relative flex items-start gap-4">
                <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    ${rec.icon}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-white/65 text-xs font-bold uppercase tracking-widest mb-1">قرار BOR</p>
                    <p class="text-xl font-black mb-1">${rec.title}</p>
                    <p class="text-white/80 text-sm leading-relaxed">${rec.text}</p>
                </div>
                <div class="text-left flex-shrink-0 hidden md:block">
                    <p class="text-white/60 text-xs mb-1">الفارق المالي</p>
                    <p class="text-2xl font-black">${fmtK(Math.abs(rec.diff))}</p>
                    <p class="text-white/60 text-xs mt-0.5">
                        لصالح ${rec.diff < 0 ? 'التملك' : 'الإيجار'}
                    </p>
                </div>
            </div>`;
    }

    // ── KPI Cards ────────────────────────────────────────────────
    _renderKPIs(base) {
        const kpis = [
            { id: 'kpiOwn',     val: fmtK(base.netOwnership), lbl: 'صافي تكلفة التملك',      icon: 'fa-home',           color: 'blue'   },
            { id: 'kpiRent',    val: fmtK(base.cumRent),      lbl: 'إجمالي تكلفة الإيجار',   icon: 'fa-key',            color: 'purple' },
            { id: 'kpiMonthly', val: fmtK(base.monthly),      lbl: 'القسط الشهري',            icon: 'fa-money-bill-wave', color: 'emerald'},
            { id: 'kpiFuture',  val: fmtK(base.futureValue),  lbl: 'قيمة العقار المستقبلية', icon: 'fa-chart-line',     color: 'amber'  },
        ];

        kpis.forEach(k => {
            const el = document.getElementById(k.id);
            if (!el) return;
            el.innerHTML = `
                <div class="w-9 h-9 bg-${k.color}-100 dark:bg-${k.color}-900/40 rounded-xl
                            flex items-center justify-center mx-auto mb-2">
                    <i class="fas ${k.icon} text-${k.color}-600 dark:text-${k.color}-400 text-sm"></i>
                </div>
                <p class="text-xl font-black text-gray-800 dark:text-white">${k.val}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${k.lbl}</p>`;
        });
    }

    // ── مقياس القرار ─────────────────────────────────────────────
    _renderMeter(rec) {
        const cursor = document.getElementById('meterCursor');
        const label  = document.getElementById('meterLabel');
        if (!cursor || !label) return;

        cursor.style.left = rec.score + '%';
        label.textContent = rec.label;

        const colorMap = {
            buy:     'text-emerald-600 dark:text-emerald-400',
            rent:    'text-amber-600 dark:text-amber-400',
            neutral: 'text-gray-500 dark:text-gray-400',
        };
        label.className = `text-sm font-black ${colorMap[rec.verdict]}`;
    }

    // ── الأرقام الرئيسية ──────────────────────────────────────────
    _renderKeyNumbers(base, rec) {
        const el = document.getElementById('keyNumbers');
        if (!el) return;

        const items = [
            {
                val: fmtK(base.futureValue - base.price),
                lbl: 'الربح من ارتفاع قيمة العقار',
                color: 'emerald',
                sub: `بعد ${base.years} سنة`,
            },
            {
                val: fmtK(base.netFutureVal),
                lbl: 'صافي قيمة البيع المستقبلي',
                color: 'blue',
                sub: 'بعد سداد القرض والرسوم',
            },
            {
                val: fmtK(base.totalInterest),
                lbl: 'إجمالي فوائد التمويل',
                color: 'red',
                sub: `على ${base.inputs.loanYears} سنة`,
            },
            {
                val: base.breakEvenYear ? `السنة ${base.breakEvenYear}` : `> ${base.years} سنة`,
                lbl: 'نقطة التعادل',
                color: 'purple',
                sub: 'التملك يصبح أرخص بعدها',
            },
            {
                val: fmtK(base.investedGain),
                lbl: 'عائد الاستثمار البديل للدفعة',
                color: 'amber',
                sub: `بعائد ${base.inputs.investRate}% سنوياً`,
            },
            {
                val: fmtK(base.downPayment),
                lbl: 'الدفعة المقدمة المطلوبة',
                color: 'slate',
                sub: `${base.inputs.downPaymentPct}% من سعر العقار`,
            },
        ];

        el.innerHTML = items.map(k => `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700
                        hover:shadow-sm transition-shadow">
                <p class="text-lg font-black text-${k.color}-600 dark:text-${k.color}-400">${k.val}</p>
                <p class="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">${k.lbl}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">${k.sub}</p>
            </div>`).join('');
    }

    // ── ملخص السيناريو داخل تبويب الملخص ─────────────────────────
    _renderScenarioSummary(scenario, scenarioData) {
        const el = document.getElementById('scenarioSummaryBox');
        if (!el || !scenarioData) return;
        el.classList.remove('hidden');

        if (scenario === 'family') {
            const fd = scenarioData;
            el.innerHTML = `
                <div class="sec-hdr"><i class="fas fa-users text-xs"></i> أبرز الأرقام العائلية</div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                        <p class="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">مرحلة الحياة</p>
                        <p class="font-black text-gray-800 dark:text-white text-sm">${fd.stage}</p>
                    </div>
                    <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
                        <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">تكلفة التملك للفرد/شهر</p>
                        <p class="font-black text-gray-800 dark:text-white">${fmtK(fd.costPerMember)}</p>
                    </div>
                    <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
                        <p class="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">الميراث المتوقع</p>
                        <p class="font-black text-gray-800 dark:text-white">${fmtK(fd.inheritance)}</p>
                    </div>
                </div>`;
        }

        if (scenario === 'investment') {
            const inv = scenarioData;
            el.innerHTML = `
                <div class="sec-hdr"><i class="fas fa-chart-line text-xs"></i> أبرز مؤشرات الاستثمار</div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    ${[
                        { lbl: 'صافي العائد', val: fmtPct(inv.netYield), color: 'emerald' },
                        { lbl: 'التدفق النقدي/شهر', val: (inv.cashFlow >= 0 ? '+' : '') + fmtK(inv.cashFlow), color: inv.cashFlow >= 0 ? 'emerald' : 'red' },
                        { lbl: 'فترة الاسترداد', val: inv.payback < 100 ? `${inv.payback.toFixed(0)} سنة` : '∞', color: 'blue' },
                        { lbl: 'ROI الكلي', val: fmtPct(inv.totalROI), color: 'amber' },
                    ].map(k => `
                        <div class="bg-${k.color}-50 dark:bg-${k.color}-900/20 rounded-xl p-3 border border-${k.color}-100 dark:border-${k.color}-800 text-center">
                            <p class="text-lg font-black text-${k.color}-700 dark:text-${k.color}-400">${k.val}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${k.lbl}</p>
                        </div>`).join('')}
                </div>`;
        }
    }
}

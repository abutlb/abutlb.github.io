// ui/ResultsRenderer.js — عارض النتائج الموحد (بدون تبويبات)

import { fmtK, fmtPct } from "../utils/Formatters.js";

export class ResultsRenderer {

    render(store, chartBuilder) {
        const { results, scenario } = store;
        const { base, recommendation: rec, scenarioData } = results;

        chartBuilder.destroyAll();

        this._renderVerdict(rec);
        this._renderKPIs(base);
        this._renderKeyNumbers(base);
        this._renderCharts(base, chartBuilder);
        this._renderCompTable(base);
        this._renderOppCost(base);
        this._renderScenario(scenario, scenarioData, base, chartBuilder);
        this._renderYearTable(base.yearData, base.inputs.sellingCosts);
    }

    // ── الحكم ────────────────────────────────────────────────────
    _renderVerdict(rec) {
        const card = document.getElementById('verdictCard');
        if (!card) return;

        const classes = {
            buy:     'verdict-buy',
            rent:    'verdict-rent',
            neutral: 'verdict-neutral',
        };
        card.className = `verdict-card ${classes[rec.verdict]} fade-up`;

        document.getElementById('verdictEmoji').textContent = rec.icon;
        document.getElementById('verdictTitle').textContent = rec.title;
        document.getElementById('verdictText').textContent  = rec.text;

        const diffAmt = document.getElementById('verdictDiffAmt');
        const diffLbl = document.getElementById('verdictDiffLbl');
        if (diffAmt) diffAmt.textContent = fmtK(Math.abs(rec.diff));
        if (diffLbl) diffLbl.textContent = `لصالح ${rec.diff < 0 ? 'التملك' : 'الإيجار'}`;

        const dot   = document.getElementById('meterDot');
        const fill  = document.getElementById('meterFill');
        const label = document.getElementById('meterScoreLabel');
        if (dot)   dot.style.left   = rec.score + '%';
        if (fill)  fill.style.width = rec.score + '%';
        if (label) label.textContent = rec.label;
    }

    // ── KPIs ──────────────────────────────────────────────────────
    _renderKPIs(base) {
        this._setText('kpiOwn',     fmtK(base.netOwnership));
        this._setText('kpiRent',    fmtK(base.cumRent));
        this._setText('kpiMonthly', fmtK(base.monthly));
        this._setText('kpiFuture',  fmtK(base.futureValue));
    }

    // ── أرقام إضافية ─────────────────────────────────────────────
    _renderKeyNumbers(base) {
        const el = document.getElementById('keyNumbers');
        if (!el) return;

        const items = [
            {
                val:   fmtK(base.futureValue - base.price),
                lbl:   'الربح من ارتفاع القيمة',
                sub:   `بعد ${base.years} سنة`,
                color: 'var(--buy)',
            },
            {
                val:   base.breakEvenYear ? `السنة ${base.breakEvenYear}` : `> ${base.years} سنة`,
                lbl:   'نقطة التعادل',
                sub:   'التملك يصبح أرخص بعدها',
                color: 'var(--primary)',
            },
            {
                val:   fmtK(base.totalInterest),
                lbl:   'إجمالي فوائد التمويل',
                sub:   `على ${base.inputs.loanYears} سنة`,
                color: 'var(--danger)',
            },
            {
                val:   fmtK(base.investedGain),
                lbl:   'عائد الاستثمار البديل',
                sub:   `بمعدل ${base.inputs.investRate}% سنوياً`,
                color: 'var(--rent)',
            },
            {
                val:   fmtK(base.netFutureVal),
                lbl:   'صافي قيمة البيع المستقبلي',
                sub:   'بعد سداد القرض والرسوم',
                color: 'var(--primary)',
            },
            {
                val:   fmtK(base.downPayment),
                lbl:   'الدفعة المقدمة',
                sub:   `${base.inputs.downPaymentPct}% من سعر العقار`,
                color: 'var(--muted)',
            },
        ];

        el.innerHTML = items.map(k => `
            <div class="kpi-item" style="text-align:right;padding:12px 14px">
                <div class="kpi-val" style="font-size:1rem;color:${k.color};text-align:right">${k.val}</div>
                <div style="font-size:.72rem;font-weight:700;color:var(--text);margin-top:3px">${k.lbl}</div>
                <div style="font-size:.63rem;color:var(--muted);margin-top:2px">${k.sub}</div>
            </div>`).join('');
    }

    // ── الرسوم البيانية ───────────────────────────────────────────
    _renderCharts(base, chartBuilder) {
        chartBuilder.buildLineChart('lineChart', base.yearData);
        chartBuilder.buildPieChart('pieChart', base);
        chartBuilder.buildBarChart('barChart', base.yearData);
        chartBuilder.buildNetWorthChart('netWorthChart', base.yearData, base.netWorthOwn, base.netWorthRent);
    }

    // ── جدول المقارنة ─────────────────────────────────────────────
    _renderCompTable(base) {
        const tbody = document.getElementById('compTableBody');
        if (!tbody) return;

        const rows = [
            { lbl: 'القسط / الإيجار الشهري',       own: fmtK(base.monthly),            rent: fmtK(base.yearData[0]?.monthlyRent ?? 0) },
            { lbl: 'الدفعة المقدمة + تكاليف الإغلاق', own: fmtK(base.downPayment + base.closingCostAmt), rent: '—' },
            { lbl: 'إجمالي الفوائد',                 own: fmtK(base.totalInterest),     rent: '—' },
            { lbl: 'الصيانة والتأمين',               own: fmtK(base.totalMaint + base.totalIns), rent: '—' },
            { lbl: 'إجمالي الإيجار المدفوع',          own: '—',                           rent: fmtK(base.cumRent) },
            { lbl: 'تكاليف البيع',                   own: fmtK(base.sellingCostAmt),    rent: '—' },
            { lbl: 'القيمة المستقبلية للعقار',        own: `+${fmtK(base.futureValue)}`, rent: '—' },
            { lbl: 'عائد الاستثمار البديل للدفعة',    own: '—',                           rent: `+${fmtK(base.investedFV)}` },
        ];

        tbody.innerHTML = rows.map(r => `
            <tr>
                <td>${r.lbl}</td>
                <td style="text-align:center">${r.own}</td>
                <td style="text-align:center">${r.rent}</td>
            </tr>`).join('');

        this._setText('compTotalOwn',  fmtK(base.netOwnership));
        this._setText('compTotalRent', fmtK(base.netRent));
    }

    // ── تكلفة الفرصة ─────────────────────────────────────────────
    _renderOppCost(base) {
        const el = document.getElementById('oppContent');
        if (!el) return;

        el.innerHTML = `
            <div class="opp-item">
                <div class="opp-item-val" style="color:var(--primary)">${fmtK(base.downPayment)}</div>
                <div class="opp-item-lbl">الدفعة المقدمة</div>
                <div class="opp-item-sub">المبلغ المستثمر بدلاً</div>
            </div>
            <div class="opp-item">
                <div class="opp-item-val" style="color:var(--rent)">${fmtK(base.investedFV)}</div>
                <div class="opp-item-lbl">قيمة الاستثمار البديل</div>
                <div class="opp-item-sub">بعد ${base.years} سنة @ ${base.inputs.investRate}%</div>
            </div>
            <div class="opp-item">
                <div class="opp-item-val" style="color:var(--buy)">${fmtK(base.futureValue)}</div>
                <div class="opp-item-lbl">قيمة العقار المستقبلية</div>
                <div class="opp-item-sub">بعد ${base.years} سنة @ ${base.inputs.appreciation}%</div>
            </div>`;
    }

    // ── السيناريو ─────────────────────────────────────────────────
    _renderScenario(scenario, data, base, chartBuilder) {
        const section = document.getElementById('scenarioSection');
        const content = document.getElementById('scenarioContent');
        if (!section || !content) return;

        if (scenario === 'personal' || !data) {
            section.style.display = 'none';
            return;
        }
        section.style.display = 'block';

        if (scenario === 'family')     this._renderFamily(data, base, content);
        if (scenario === 'investment') this._renderInvestment(data, base, content, chartBuilder);
    }

    _renderFamily(fd, base, content) {
        content.innerHTML = `
            <div class="sec-label">
                <i class="fas fa-users" style="color:var(--primary)"></i>
                تحليل السيناريو العائلي
            </div>
            <div class="fam-grid">
                ${[
                    { val: fd.stage,               lbl: 'مرحلة الحياة',          color:'var(--primary)' },
                    { val: fmtK(fd.costPerMember),  lbl: 'تكلفة التملك للفرد/شهر', color:'var(--buy)'     },
                    { val: fmtK(fd.rentPerMember),  lbl: 'الإيجار للفرد/شهر',      color:'var(--rent)'    },
                    { val: fd.schoolYears + ' سنة', lbl: 'سنوات الدراسة المتبقية',  color:'var(--primary)' },
                    { val: fmtK(fd.inheritance),    lbl: 'الميراث المتوقع',         color:'var(--buy)'     },
                    { val: fmtK(fd.savingsRequired ?? base.downPayment), lbl: 'المدخرات المطلوبة', color:'var(--muted)' },
                ].map(k => `
                    <div class="kpi-item" style="text-align:right;padding:12px 14px">
                        <div class="kpi-val" style="font-size:.95rem;color:${k.color}">${k.val}</div>
                        <div class="kpi-lbl">${k.lbl}</div>
                    </div>`).join('')}
            </div>
            ${fd.insights.map(i => `<div class="insight"><span class="insight-icon">${i.icon}</span>${i.text}</div>`).join('')}`;
    }

    _renderInvestment(inv, base, content, chartBuilder) {
        const ratingColor = {
            'استثمار ممتاز': 'var(--buy)',
            'استثمار جيد':   'var(--buy)',
            'استثمار مقبول': 'var(--rent)',
            'عائد متدني':    'var(--danger)',
        }[inv.rating] ?? 'var(--muted)';

        content.innerHTML = `
            <div class="sec-label">
                <i class="fas fa-building" style="color:var(--primary)"></i>
                تحليل السيناريو الاستثماري
            </div>
            <div class="inv-grid">
                ${[
                    { val: fmtPct(inv.grossYield), lbl: 'العائد الإجمالي',    color:'var(--buy)'     },
                    { val: fmtPct(inv.netYield),   lbl: 'صافي العائد',        color:'var(--buy)'     },
                    { val: (inv.cashFlow >= 0 ? '+' : '') + fmtK(inv.cashFlow), lbl: 'التدفق النقدي/شهر', color: inv.cashFlow >= 0 ? 'var(--buy)' : 'var(--danger)' },
                    { val: inv.payback < 100 ? inv.payback.toFixed(0) + ' سنة' : '∞', lbl: 'فترة الاسترداد', color:'var(--primary)' },
                    { val: fmtPct(inv.totalROI),   lbl: 'إجمالي العائد ROI',  color:'var(--rent)'    },
                    { val: inv.rating,             lbl: 'التقييم',            color: ratingColor      },
                ].map(k => `
                    <div class="kpi-item" style="text-align:right;padding:12px 14px">
                        <div class="kpi-val" style="font-size:.95rem;color:${k.color}">${k.val}</div>
                        <div class="kpi-lbl">${k.lbl}</div>
                    </div>`).join('')}
            </div>
            ${inv.insights.map(i => `<div class="insight"><span class="insight-icon">${i.icon}</span>${i.text}</div>`).join('')}
            <div class="chart-card" style="margin-top:14px">
                <div class="chart-title">التدفق النقدي الشهري المتوقع (ريال)</div>
                <canvas id="cashFlowChart" height="200"></canvas>
            </div>`;

        chartBuilder.buildCashFlowChart(
            'cashFlowChart',
            base.yearData,
            base.monthly,
            base.inputs.invRent,
            base.inputs.rentIncrease,
            base.inputs.vacancyRate,
            base.inputs.mgmtFee
        );
    }

    // ── الجدول السنوي ─────────────────────────────────────────────
    _renderYearTable(yearData, sellingRatePct) {
        const tbody = document.getElementById('yearTableBody');
        if (!tbody || !yearData) return;

        tbody.innerHTML = yearData.map(y => {
            const buyBetter = y.cumOwn < y.cumRent;
            return `
                <tr>
                    <td>${y.year}</td>
                    <td>${fmtK(y.monthly)} / ${fmtK(y.monthlyRent)}</td>
                    <td>${fmtK(y.cumOwn)}</td>
                    <td>${fmtK(y.cumRent)}</td>
                    <td>${fmtK(y.equity)}</td>
                    <td>${fmtK(y.propValue)}</td>
                    <td>
                        <span class="bdg ${buyBetter ? 'bdg-g' : 'bdg-y'}">
                            ${buyBetter ? '🏠 تملك' : '🔑 إيجار'}
                        </span>
                    </td>
                </tr>`;
        }).join('');
    }

    // ── مساعد ────────────────────────────────────────────────────
    _setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }
}

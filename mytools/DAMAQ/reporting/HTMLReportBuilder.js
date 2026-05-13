// reporting/HTMLReportBuilder.js
import { ChartBuilder } from "./ChartBuilder.js";

export class HTMLReportBuilder {

    static build(store, options = {}) {
        const dama    = store.damaResults;
        const profile = store.profileResults;
        const meta    = store.metadata || {};
        const rules   = store.ruleResults;
        const audit   = store.cleanedData
            ? store.auditLog
            : null;

        // ── رسم الـ Charts ────────────────────────────────────────
        const charts = this._buildCharts(dama, profile, store.columns);

        // ── Executive Summary ─────────────────────────────────────
        const execSummary = this._buildExecSummary(dama, profile, store, rules);

        return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير جودة البيانات — ${meta.fileName || "Dataset"}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: "Segoe UI", Tahoma, Arial, sans-serif;
            background : #F8FAFC;
            color      : #1F2937;
            direction  : rtl;
        }

        /* ── Cover Page ── */
        .cover {
            background : linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #06B6D4 100%);
            color      : white;
            padding    : 60px 40px;
            min-height : 280px;
            display    : flex;
            flex-direction: column;
            justify-content: center;
        }
        .cover h1 { font-size: 2.2rem; margin-bottom: 8px; }
        .cover h2 { font-size: 1.2rem; opacity: 0.85; font-weight: 400; }
        .cover-meta {
            margin-top : 24px;
            display    : flex;
            gap        : 32px;
            flex-wrap  : wrap;
        }
        .cover-meta-item { opacity: 0.9; font-size: 0.9rem; }
        .cover-meta-item strong { display: block; font-size: 1.1rem; }

        /* ── Layout ── */
        .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
        .section    { margin-bottom: 40px; }
        .section-title {
            font-size     : 1.3rem;
            font-weight   : 700;
            color         : #1E40AF;
            border-bottom : 3px solid #DBEAFE;
            padding-bottom: 8px;
            margin-bottom : 20px;
        }

        /* ── Score Cards ── */
        .cards-grid {
            display              : grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap                  : 16px;
            margin-bottom        : 24px;
        }
        .card {
            background   : white;
            border-radius: 12px;
            padding      : 20px 16px;
            text-align   : center;
            box-shadow   : 0 2px 8px rgba(0,0,0,0.07);
            border-top   : 4px solid #3B82F6;
        }
        .card.green  { border-top-color: #10B981; }
        .card.yellow { border-top-color: #F59E0B; }
        .card.red    { border-top-color: #EF4444; }
        .card-value {
            font-size  : 2rem;
            font-weight: 800;
            color      : #1F2937;
        }
        .card-label {
            font-size : 0.8rem;
            color     : #6B7280;
            margin-top: 4px;
        }

        /* ── DAMA Dimensions ── */
        .dama-grid {
            display              : grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap                  : 16px;
        }
        .dama-card {
            background   : white;
            border-radius: 10px;
            padding      : 16px;
            box-shadow   : 0 2px 6px rgba(0,0,0,0.06);
        }
        .dama-card-header {
            display        : flex;
            justify-content: space-between;
            align-items    : center;
            margin-bottom  : 10px;
        }
        .dama-name  { font-weight: 600; font-size: 0.9rem; }
        .dama-score { font-weight: 800; font-size: 1.2rem; }
        .progress-bar {
            height       : 8px;
            background   : #E5E7EB;
            border-radius: 4px;
            overflow     : hidden;
        }
        .progress-fill {
            height       : 8px;
            border-radius: 4px;
            transition   : width 0.5s ease;
        }
        .bg-green  { background: #10B981; }
        .bg-yellow { background: #F59E0B; }
        .bg-orange { background: #F97316; }
        .bg-red    { background: #EF4444; }
        .text-green  { color: #10B981; }
        .text-yellow { color: #F59E0B; }
        .text-red    { color: #EF4444; }

        /* ── Charts ── */
        .charts-grid {
            display              : grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap                  : 24px;
        }
        .chart-card {
            background   : white;
            border-radius: 12px;
            padding      : 20px;
            box-shadow   : 0 2px 8px rgba(0,0,0,0.07);
            text-align   : center;
        }
        .chart-card h4 {
            font-size    : 0.95rem;
            font-weight  : 600;
            color        : #374151;
            margin-bottom: 12px;
        }
        .chart-card img { max-width: 100%; border-radius: 8px; }

        /* ── Tables ── */
        .report-table {
            width          : 100%;
            border-collapse: collapse;
            background     : white;
            border-radius  : 10px;
            overflow       : hidden;
            box-shadow     : 0 2px 6px rgba(0,0,0,0.06);
            font-size      : 0.85rem;
        }
        .report-table th {
            background : #EFF6FF;
            color      : #1E40AF;
            padding    : 12px 16px;
            text-align : right;
            font-weight: 600;
        }
        .report-table td {
            padding      : 10px 16px;
            border-bottom: 1px solid #F3F4F6;
            text-align   : right;
        }
        .report-table tr:hover td { background: #F9FAFB; }
        .report-table tr:last-child td { border-bottom: none; }

        /* ── Badges ── */
        .badge {
            display      : inline-block;
            padding      : 2px 10px;
            border-radius: 20px;
            font-size    : 0.75rem;
            font-weight  : 600;
        }
        .badge-green  { background: #D1FAE5; color: #065F46; }
        .badge-yellow { background: #FEF3C7; color: #92400E; }
        .badge-red    { background: #FEE2E2; color: #991B1B; }
        .badge-blue   { background: #DBEAFE; color: #1E40AF; }

        /* ── Executive Summary ── */
        .exec-box {
            background   : white;
            border-radius: 12px;
            padding      : 24px;
            box-shadow   : 0 2px 8px rgba(0,0,0,0.07);
            border-right : 5px solid #3B82F6;
        }
        .exec-box p {
            line-height  : 1.8;
            color        : #374151;
            font-size    : 0.95rem;
        }

        /* ── Recommendations ── */
        .rec-item {
            display      : flex;
            gap          : 12px;
            padding      : 14px 16px;
            background   : white;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow   : 0 1px 4px rgba(0,0,0,0.06);
            align-items  : flex-start;
        }
        .rec-priority {
            padding      : 3px 10px;
            border-radius: 20px;
            font-size    : 0.75rem;
            font-weight  : 700;
            white-space  : nowrap;
        }
        .rec-high   { background: #FEE2E2; color: #991B1B; }
        .rec-medium { background: #FEF3C7; color: #92400E; }
        .rec-low    { background: #DBEAFE; color: #1E40AF; }

        /* ── Footer ── */
        .footer {
            background : #1F2937;
            color      : #9CA3AF;
            text-align : center;
            padding    : 20px;
            font-size  : 0.8rem;
            margin-top : 40px;
        }

        @media print {
            .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .card  { break-inside: avoid; }
        }
    </style>
</head>
<body>

<!-- ══════════════════════════════════════════ -->
<!--  COVER PAGE                               -->
<!-- ══════════════════════════════════════════ -->
<div class="cover">
    <h1>📊 تقرير جودة البيانات</h1>
    <h2>${meta.fileName || "مجموعة البيانات"}</h2>
    <div class="cover-meta">
        <div class="cover-meta-item">
            <strong>${meta.rowCount?.toLocaleString("ar-SA") || "—"}</strong>
            عدد السجلات
        </div>
        <div class="cover-meta-item">
            <strong>${meta.columnCount || "—"}</strong>
            عدد الأعمدة
        </div>
        <div class="cover-meta-item">
            <strong>${dama?.overall ?? "—"}/100</strong>
            درجة الجودة
        </div>
        <div class="cover-meta-item">
            <strong>${new Date().toLocaleDateString("ar-SA")}</strong>
            تاريخ التقرير
        </div>
    </div>
</div>

<div class="container">

<!-- ══════════════════════════════════════════ -->
<!--  1. EXECUTIVE SUMMARY                     -->
<!-- ══════════════════════════════════════════ -->
<div class="section">
    <h2 class="section-title">📋 الملخص التنفيذي</h2>
    <div class="exec-box">
        <p>${execSummary}</p>
    </div>
</div>

<!-- ══════════════════════════════════════════ -->
<!--  2. OVERALL SCORE                         -->
<!-- ══════════════════════════════════════════ -->
<div class="section">
    <h2 class="section-title">🎯 الدرجة الكلية</h2>
    <div class="cards-grid">
        <div class="card ${this._gradeClass(dama?.overall)}">
            <div class="card-value">${dama?.overall ?? "—"}</div>
            <div class="card-label">درجة الجودة الكلية</div>
        </div>
        <div class="card">
            <div class="card-value">${dama?.grade?.icon || ""} ${dama?.grade?.label || "—"}</div>
            <div class="card-label">التقييم</div>
        </div>
        <div class="card">
            <div class="card-value">${meta.rowCount?.toLocaleString("ar-SA") || "—"}</div>
            <div class="card-label">إجمالي السجلات</div>
        </div>
        <div class="card ${this._gradeClass(
            profile?.__dataset__
                ? 100 - (profile.__dataset__.totalEmpty /
                    profile.__dataset__.totalCells * 100)
                : 100
        )}">
            <div class="card-value">
                ${profile?.__dataset__
                    ? (100 - (profile.__dataset__.totalEmpty /
                       profile.__dataset__.totalCells * 100)).toFixed(1)
                    : "—"}%
            </div>
            <div class="card-label">اكتمال البيانات</div>
        </div>
        <div class="card ${profile?.__dataset__?.duplicateRows > 0 ? "red" : "green"}">
            <div class="card-value">
                ${profile?.__dataset__?.duplicateRows ?? "0"}
            </div>
            <div class="card-label">صفوف مكررة</div>
        </div>
    </div>

    <!-- Gauge Chart -->
    <div class="chart-card" style="max-width:300px; margin:0 auto;">
        <img src="${charts.gauge}" alt="درجة الجودة">
    </div>
</div>

<!-- ══════════════════════════════════════════ -->
<!--  3. DAMA DIMENSIONS                       -->
<!-- ══════════════════════════════════════════ -->
<div class="section">
    <h2 class="section-title">📐 أبعاد DAMA السبعة</h2>
    <div class="dama-grid">
        ${this._buildDAMACards(dama)}
    </div>
</div>

<!-- ══════════════════════════════════════════ -->
<!--  4. CHARTS                                -->
<!-- ══════════════════════════════════════════ -->
<div class="section">
    <h2 class="section-title">📈 الرسوم البيانية</h2>
    <div class="charts-grid">
        <div class="chart-card">
            <h4>درجات أبعاد DAMA</h4>
            <img src="${charts.damaBar}" alt="DAMA Dimensions">
        </div>
        <div class="chart-card">
            <h4>توزيع أنواع البيانات</h4>
            <img src="${charts.typeDonut}" alt="Data Types">
        </div>
        <div class="chart-card" style="grid-column: 1 / -1;">
            <h4>توزيع القيم الفارغة لكل عمود</h4>
            <img src="${charts.nullHeatmap}" alt="Null Heatmap">
        </div>
    </div>
</div>

<!-- ══════════════════════════════════════════ -->
<!--  5. COLUMN ANALYSIS                       -->
<!-- ══════════════════════════════════════════ -->
<div class="section">
    <h2 class="section-title">🔍 تحليل الأعمدة</h2>
    <table class="report-table">
        <thead>
            <tr>
                <th>العمود</th>
                <th>النوع</th>
                <th>الاكتمال</th>
                <th>فريد</th>
                <th>Cardinality</th>
                <th>القيم المتطرفة</th>
                <th>الحالة</th>
            </tr>
        </thead>
        <tbody>
            ${this._buildColumnRows(profile, store.columns)}
        </tbody>
    </table>
</div>

<!-- ══════════════════════════════════════════ -->
<!--  6. RULES RESULTS                         -->
<!-- ══════════════════════════════════════════ -->
${rules ? `
<div class="section">
    <h2 class="section-title">📏 نتائج قواعد الجودة</h2>
    <div class="cards-grid" style="grid-template-columns: repeat(3, 1fr); max-width: 500px;">
        <div class="card">
            <div class="card-value">${rules.total}</div>
            <div class="card-label">إجمالي القواعد</div>
        </div>
        <div class="card green">
            <div class="card-value">${rules.passed}</div>
            <div class="card-label">نجحت</div>
        </div>
        <div class="card ${rules.failed > 0 ? "red" : "green"}">
            <div class="card-value">${rules.failed}</div>
            <div class="card-label">فشلت</div>
        </div>
    </div>
    <table class="report-table" style="margin-top: 16px;">
        <thead>
            <tr>
                <th>القاعدة</th>
                <th>النوع</th>
                <th>الحالة</th>
                <th>الدرجة</th>
                <th>الملخص</th>
            </tr>
        </thead>
        <tbody>
            ${rules.results.map(r => `
            <tr>
                <td>${r.ruleName}</td>
                <td><span class="badge badge-blue">${r.type}</span></td>
                <td>
                    <span class="badge ${r.passed ? "badge-green" : "badge-red"}">
                        ${r.passed ? "✅ نجح" : "❌ فشل"}
                    </span>
                </td>
                <td><strong>${r.score}%</strong></td>
                <td>${r.summary || "—"}</td>
            </tr>`).join("")}
        </tbody>
    </table>
</div>` : ""}

<!-- ══════════════════════════════════════════ -->
<!--  7. RECOMMENDATIONS                       -->
<!-- ══════════════════════════════════════════ -->
${dama?.recommendations?.length > 0 ? `
<div class="section">
    <h2 class="section-title">💡 التوصيات</h2>
    ${dama.recommendations.map(rec => `
    <div class="rec-item">
        <span class="rec-priority ${
            rec.priority === "عالية"   ? "rec-high"   :
            rec.priority === "متوسطة" ? "rec-medium" : "rec-low"
        }">
            ${rec.priority}
        </span>
        <div>
            <strong style="font-size:0.9rem; color:#374151;">
                ${rec.dimension}
            </strong>
            <p style="font-size:0.85rem; color:#6B7280; margin-top:4px;">
                ${rec.action}
            </p>
        </div>
    </div>`).join("")}
</div>` : ""}

<!-- ══════════════════════════════════════════ -->
<!--  8. AUDIT LOG                             -->
<!-- ══════════════════════════════════════════ -->
${audit?.entries?.length > 0 ? `
<div class="section">
    <h2 class="section-title">📝 سجل التعديلات</h2>
    <table class="report-table">
        <thead>
            <tr>
                <th>#</th>
                <th>الوقت</th>
                <th>النوع</th>
                <th>العمود</th>
                <th>الصفوف المتأثرة</th>
                <th>الوصف</th>
            </tr>
        </thead>
        <tbody>
            ${audit.entries.map(e => `
            <tr>
                <td>${e.id}</td>
                <td style="font-size:0.8rem; color:#6B7280;">
                    ${new Date(e.timestamp).toLocaleString("ar-SA")}
                </td>
                <td><span class="badge badge-blue">${e.type}</span></td>
                <td>${e.column || "الكل"}</td>
                <td><strong>${e.affected || 0}</strong></td>
                <td>${e.description || "—"}</td>
            </tr>`).join("")}
        </tbody>
    </table>
</div>` : ""}

</div><!-- /container -->

<div class="footer">
    تم إنشاء هذا التقرير بواسطة نظام تحليل جودة البيانات
    — ${new Date().toLocaleString("ar-SA")}
</div>

</body>
</html>`;
    }

    // ── بناء الـ Charts ──────────────────────────────────────────
    static _buildCharts(dama, profile, columns) {
        const charts = {};

        // Gauge
        const gaugeCanvas = ChartBuilder.createOffscreen(300, 200);
        ChartBuilder.drawGauge(gaugeCanvas, dama?.overall || 0);
        charts.gauge = ChartBuilder.toBase64(gaugeCanvas);

        // DAMA Bar
        if (dama?.dimensions) {
            const dimNames = {
                completeness:"الاكتمال", validity:"الصلاحية",
                consistency:"التناسق",  accuracy:"الدقة",
                timeliness:"الحداثة",   uniqueness:"التفرد",
                integrity:"السلامة"
            };
            const labels = Object.keys(dama.dimensions).map(k => dimNames[k] || k);
            const values = Object.values(dama.dimensions).map(d => d.score);
            const colors = values.map(v =>
                v >= 80 ? "#10B981" : v >= 60 ? "#F59E0B" : "#EF4444"
            );
            const barCanvas = ChartBuilder.createOffscreen(500, 280);
            ChartBuilder.drawBar(barCanvas, labels, values, { color: colors });
            charts.damaBar = ChartBuilder.toBase64(barCanvas);
        }

        // Type Donut
        if (profile && columns) {
            const typeCounts = {};
            columns.forEach(col => {
                const t = profile[col]?.type || "unknown";
                typeCounts[t] = (typeCounts[t] || 0) + 1;
            });
            const donutCanvas = ChartBuilder.createOffscreen(340, 260);
            ChartBuilder.drawDonut(
                donutCanvas,
                Object.keys(typeCounts),
                Object.values(typeCounts),
                { title: "الأنواع" }
            );
            charts.typeDonut = ChartBuilder.toBase64(donutCanvas);
        }

        // Null Heatmap
        if (profile && columns) {
            const nullPcts = columns.map(c => profile[c]?.emptyPct || 0);
            const hmH      = Math.max(200, columns.length * 26 + 40);
            const hmCanvas = ChartBuilder.createOffscreen(600, hmH);
            ChartBuilder.drawHeatmap(hmCanvas, columns, nullPcts);
            charts.nullHeatmap = ChartBuilder.toBase64(hmCanvas);
        }

        return charts;
    }

    // ── DAMA Cards HTML ──────────────────────────────────────────
    static _buildDAMACards(dama) {
        if (!dama?.dimensions) return "";
        const dimNames = {
            completeness:"الاكتمال", validity:"الصلاحية",
            consistency:"التناسق",  accuracy:"الدقة",
            timeliness:"الحداثة",   uniqueness:"التفرد",
            integrity:"السلامة"
        };

        return Object.entries(dama.dimensions).map(([key, dim]) => {
            const color =
                dim.score >= 80 ? "green" :
                dim.score >= 60 ? "yellow" :
                dim.score >= 40 ? "orange" : "red";

            return `
            <div class="dama-card">
                <div class="dama-card-header">
                    <span class="dama-name">${dimNames[key] || key}</span>
                    <span class="dama-score text-${color}">${dim.score}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill bg-${color}"
                         style="width:${dim.score}%"></div>
                </div>
                <p style="font-size:0.75rem; color:#6B7280; margin-top:8px;">
                    ${dim.details || ""}
                </p>
            </div>`;
        }).join("");
    }

    // ── Column Rows HTML ─────────────────────────────────────────
    static _buildColumnRows(profile, columns) {
        if (!profile || !columns) return "";

        return columns.map(col => {
            const p = profile[col];
            if (!p) return "";

            const completeness = (100 - p.emptyPct).toFixed(1);
            const status =
                p.isConstant   ? `<span class="badge badge-yellow">ثابت</span>` :
                p.isNearEmpty  ? `<span class="badge badge-red">شبه فارغ</span>` :
                p.emptyPct > 20? `<span class="badge badge-yellow">يحتاج مراجعة</span>` :
                                 `<span class="badge badge-green">جيد</span>`;

            return `
            <tr>
                <td><strong>${col}</strong></td>
                <td><span class="badge badge-blue">${p.type}</span></td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div class="progress-bar" style="width:80px; display:inline-block;">
                            <div class="progress-fill ${
                                completeness >= 90 ? "bg-green" :
                                completeness >= 70 ? "bg-yellow" : "bg-red"
                            }" style="width:${completeness}%"></div>
                        </div>
                        ${completeness}%
                    </div>
                </td>
                <td>${p.unique?.toLocaleString("ar-SA") || "—"}</td>
                <td>${p.cardinality?.level || "—"}</td>
                <td>${p.outliers?.count > 0
                    ? `<span class="badge badge-yellow">${p.outliers.count}</span>`
                    : `<span class="badge badge-green">لا يوجد</span>`}
                </td>
                <td>${status}</td>
            </tr>`;
        }).join("");
    }

    // ── Executive Summary Text ───────────────────────────────────
    static _buildExecSummary(dama, profile, store, rules) {
        const overall    = dama?.overall || 0;
        const grade      = dama?.grade?.label || "—";
        const rowCount   = store.metadata?.rowCount || 0;
        const colCount   = store.metadata?.columnCount || 0;
        const emptyPct   = profile?.__dataset__
            ? ((profile.__dataset__.totalEmpty /
                profile.__dataset__.totalCells) * 100).toFixed(1)
            : "0";
        const dupRows    = profile?.__dataset__?.duplicateRows || 0;
        const rulesPassed = rules
            ? `اجتازت البيانات ${rules.passed} من أصل ${rules.total} قاعدة جودة.`
            : "";
        const topRec     = dama?.recommendations?.[0]?.action || "";

        return `
            تم تحليل مجموعة بيانات تحتوي على
            <strong>${rowCount.toLocaleString("ar-SA")} سجل</strong>
            و<strong>${colCount} عمود</strong>.
            حصلت البيانات على درجة جودة إجمالية
            <strong>${overall}/100 (${grade})</strong>
            وفق معايير DAMA الدولية.
            تبلغ نسبة القيم المفقودة <strong>${emptyPct}%</strong>
            ${dupRows > 0
                ? `، وتم رصد <strong>${dupRows} سجل مكرر</strong>`
                : "، ولا توجد سجلات مكررة"}.
            ${rulesPassed}
            ${topRec
                ? `<br><br>أبرز توصية: <strong>${topRec}</strong>.`
                : ""}
        `;
    }

    // ── Grade CSS Class ──────────────────────────────────────────
    static _gradeClass(score) {
        if (score >= 80) return "green";
        if (score >= 60) return "yellow";
        return "red";
    }
}

// reporting/HTMLReportBuilder.js
import { ChartBuilder } from "./ChartBuilder.js";

export class HTMLReportBuilder {

    static build(store, options = {}) {
        const dama    = store.damaResults;
        const profile = store.profileResults;
        const meta    = store.metadata || {};
        const rules   = store.ruleResults;

        const charts      = this._buildCharts(dama, profile, store.columns);
        const execSummary = this._buildExecSummary(dama, profile, store, rules);
        const dateStr     = new Date().toLocaleDateString("ar-SA", {
            year: "numeric", month: "long", day: "numeric"
        });
        const overall = dama?.overall ?? 0;

        const completenessVal = profile?.__dataset__
            ? (100 - profile.__dataset__.totalEmpty / profile.__dataset__.totalCells * 100).toFixed(1)
            : "—";
        const dupRows = profile?.__dataset__?.duplicateRows ?? 0;

        return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>تقرير جودة البيانات — ${meta.fileName || "Dataset"}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet">
<style>
/* ── RESET ── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

/* ── VARIABLES ── */
:root{
    --navy:#0F172A; --blu-dk:#1E3A8A; --blu:#2563EB; --blu-lt:#3B82F6;
    --blu-bg:#EFF6FF; --blu-100:#DBEAFE;
    --grn:#10B981; --grn-bg:#D1FAE5; --grn-tx:#065F46;
    --yel:#F59E0B; --yel-bg:#FEF3C7; --yel-tx:#92400E;
    --red:#EF4444; --red-bg:#FEE2E2; --red-tx:#991B1B;
    --org:#F97316;
    --g50:#F9FAFB; --g100:#F3F4F6; --g200:#E5E7EB;
    --g400:#9CA3AF; --g500:#6B7280; --g700:#374151; --g800:#1F2937;
}

/* ── BASE ── */
body{font-family:'Tajawal','Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;line-height:1.6;color:var(--g800);}

/* ── PRINT RULES ── */
@page{size:A4;margin:14mm 18mm;}
@page :first{margin:0;}
@media print{
    body{background:white;padding:0;}
    .page{page-break-before:always;break-before:page;box-shadow:none;margin:0;border-radius:0;}
    .page:first-child{page-break-before:auto;break-before:auto;}
    .page-inner{padding:0;}
    .cover{min-height:297mm;}
    *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
}

/* ── SCREEN ── */
@media screen{
    body{background:#94A3B8;padding:32px 0;min-width:860px;}
    .page{width:794px;min-height:1123px;margin:0 auto 32px;background:white;
          box-shadow:0 4px 32px rgba(0,0,0,.18),0 1px 6px rgba(0,0,0,.1);
          border-radius:2px;overflow:hidden;}
    .page-inner{padding:44px 52px 36px;min-height:1123px;display:flex;flex-direction:column;}
}

/* ══════════════ COVER ══════════════ */
.cover{
    background:linear-gradient(155deg,#020817 0%,#0F1729 30%,#1E3A8A 65%,#2563EB 100%);
    color:white;min-height:1123px;display:flex;flex-direction:column;position:relative;overflow:hidden;
}
.cv-blob{position:absolute;border-radius:50%;}
.cv-b1{width:500px;height:500px;top:-200px;left:-100px;
        background:radial-gradient(circle,rgba(37,99,235,.28) 0%,transparent 70%);}
.cv-b2{width:360px;height:360px;bottom:-100px;right:-80px;
        background:radial-gradient(circle,rgba(59,130,246,.2) 0%,transparent 70%);}
.cv-b3{width:220px;height:220px;top:42%;right:90px;
        background:radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%);}

.cv-top{padding:36px 52px 0;display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1;}
.cv-logo{font-size:1.65rem;font-weight:800;letter-spacing:-1px;color:white;}
.cv-logo span{color:#60A5FA;}
.cv-tagline{font-size:.7rem;color:rgba(255,255,255,.42);margin-top:3px;letter-spacing:.3px;}
.cv-date-lbl{font-size:.7rem;color:rgba(255,255,255,.4);text-align:left;line-height:1.6;}

.cv-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
         padding:36px 52px;text-align:center;position:relative;z-index:1;}
.cv-ring{margin-bottom:22px;}
.cv-file{font-size:1.6rem;font-weight:800;color:white;margin-bottom:8px;
         max-width:580px;word-break:break-word;line-height:1.3;}
.cv-sub{font-size:.88rem;color:rgba(255,255,255,.52);margin-bottom:22px;}
.cv-pill{display:inline-flex;align-items:center;gap:8px;
         background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);
         border-radius:100px;padding:7px 22px;font-size:.88rem;font-weight:700;}

.cv-bottom{padding:0 52px 48px;position:relative;z-index:1;}
.cv-meta{display:grid;grid-template-columns:repeat(4,1fr);
         border:1px solid rgba(255,255,255,.12);border-radius:14px;
         overflow:hidden;background:rgba(255,255,255,.06);}
.cv-cell{padding:18px 16px;text-align:center;border-left:1px solid rgba(255,255,255,.08);}
.cv-cell:last-child{border-left:none;}
.cv-cell .v{display:block;font-size:1.3rem;font-weight:800;color:white;margin-bottom:3px;}
.cv-cell .l{font-size:.68rem;color:rgba(255,255,255,.48);}

/* ══════════════ PAGE HEADER ══════════════ */
.ph{display:flex;justify-content:space-between;align-items:center;
    margin-bottom:26px;padding-bottom:14px;border-bottom:2px solid var(--blu-100);}
.ph-left{display:flex;align-items:center;gap:12px;}
.ph-icon{width:36px;height:36px;border-radius:10px;background:var(--blu-bg);
         display:flex;align-items:center;justify-content:center;font-size:1.05rem;flex-shrink:0;}
.ph-text{font-size:1.22rem;font-weight:800;color:var(--blu-dk);}
.ph-tag{font-size:.68rem;color:var(--g400);background:var(--g100);padding:4px 12px;border-radius:100px;}

/* ══════════════ PAGE FOOTER ══════════════ */
.pf{padding-top:14px;border-top:1px solid var(--g100);
    display:flex;justify-content:space-between;align-items:center;
    font-size:.68rem;color:var(--g400);margin-top:24px;}

/* ══════════════ SECTION LABEL ══════════════ */
.sl{font-size:.7rem;font-weight:700;color:var(--blu);letter-spacing:.8px;
    text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.sl::after{content:"";flex:1;height:1px;background:var(--g100);}

/* ══════════════ EXEC BOX ══════════════ */
.exec{background:var(--blu-bg);border:1px solid var(--blu-100);
      border-right:4px solid var(--blu);border-radius:12px;
      padding:22px 24px;margin-bottom:22px;break-inside:avoid;page-break-inside:avoid;}
.exec p{font-size:.88rem;line-height:2.15;color:var(--g700);}

/* ══════════════ KPI GRID ══════════════ */
.kpi-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:22px;}
.kpi{border:1px solid var(--g200);border-radius:12px;padding:14px 10px;
     text-align:center;background:white;break-inside:avoid;page-break-inside:avoid;}
.kpi-v{font-size:1.55rem;font-weight:800;line-height:1.1;margin-bottom:4px;color:var(--g800);}
.kpi-l{font-size:.68rem;color:var(--g500);}
.kpi-blu  {border-color:var(--blu-lt);background:var(--blu-bg);}
.kpi-grn  {border-color:var(--grn);   background:var(--grn-bg);}
.kpi-yel  {border-color:var(--yel);   background:var(--yel-bg);}
.kpi-red  {border-color:var(--red);   background:var(--red-bg);}

/* ══════════════ GAUGE ══════════════ */
.gauge-wrap{display:flex;justify-content:center;margin-bottom:10px;}
.gauge-box{border:1px solid var(--g200);border-radius:12px;padding:16px 28px;background:white;
           text-align:center;display:inline-flex;flex-direction:column;align-items:center;
           break-inside:avoid;page-break-inside:avoid;}
.gauge-cap{font-size:.72rem;color:var(--g400);margin-top:6px;}

/* ══════════════ DAMA GRID ══════════════ */
.dama-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;}
.dc{border:1px solid var(--g200);border-radius:12px;padding:14px 16px;background:white;
    break-inside:avoid;page-break-inside:avoid;}
.dc-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.dc-name{font-weight:700;font-size:.86rem;display:flex;align-items:center;gap:6px;color:var(--g700);}
.dc-score{font-size:1.28rem;font-weight:800;}
.s-grn{color:var(--grn);} .s-yel{color:var(--yel);} .s-org{color:var(--org);} .s-red{color:var(--red);}
.bar{height:6px;background:var(--g100);border-radius:3px;overflow:hidden;margin-bottom:7px;}
.bf{height:6px;border-radius:3px;}
.f-grn{background:var(--grn);} .f-yel{background:var(--yel);} .f-org{background:var(--org);} .f-red{background:var(--red);}
.dc-note{font-size:.68rem;color:var(--g400);line-height:1.4;}

/* ══════════════ CHARTS ══════════════ */
.ch-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
.ch-box{border:1px solid var(--g200);border-radius:12px;padding:16px;background:white;
        text-align:center;break-inside:avoid;page-break-inside:avoid;}
.ch-ttl{font-size:.78rem;font-weight:700;color:var(--g700);margin-bottom:10px;}
.ch-box img{max-width:100%;border-radius:6px;}

/* ══════════════ DIM SUMMARY (in chart page) ══════════════ */
.ds-row{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--g100);}
.ds-row:last-child{border-bottom:none;}
.ds-name{flex:1;font-size:.78rem;font-weight:600;color:var(--g700);}
.ds-track{width:90px;height:5px;background:var(--g200);border-radius:3px;overflow:hidden;flex-shrink:0;}
.ds-fill{height:5px;border-radius:3px;}
.ds-pill{font-size:.72rem;font-weight:800;padding:2px 8px;border-radius:100px;min-width:42px;text-align:center;}

/* ══════════════ TABLE ══════════════ */
.tbl-wrap{border:1px solid var(--g200);border-radius:12px;overflow:hidden;}
.tbl{width:100%;border-collapse:collapse;font-size:.79rem;}
.tbl thead th{background:linear-gradient(90deg,#1E3A8A,#2563EB);color:white;
              padding:11px 13px;text-align:right;font-weight:700;font-size:.75rem;white-space:nowrap;}
.tbl tbody tr{break-inside:avoid;page-break-inside:avoid;}
.tbl tbody td{padding:9px 13px;border-bottom:1px solid var(--g100);vertical-align:middle;}
.tbl tbody tr:nth-child(even) td{background:var(--g50);}
.tbl tbody tr:last-child td{border-bottom:none;}

/* ══════════════ BADGES ══════════════ */
.bdg{display:inline-block;padding:2px 9px;border-radius:100px;font-size:.7rem;font-weight:700;}
.b-grn{background:var(--grn-bg);color:var(--grn-tx);}
.b-yel{background:var(--yel-bg);color:var(--yel-tx);}
.b-red{background:var(--red-bg);color:var(--red-tx);}
.b-blu{background:var(--blu-bg);color:var(--blu-dk);}
.b-gry{background:var(--g100);color:var(--g700);}

/* ══════════════ PROGRESS (table) ══════════════ */
.pg{display:flex;align-items:center;gap:7px;}
.pg-tr{width:68px;height:5px;background:var(--g200);border-radius:3px;overflow:hidden;display:inline-block;flex-shrink:0;}
.pg-fl{height:5px;border-radius:3px;}

/* ══════════════ RECS ══════════════ */
.rec{display:flex;gap:14px;padding:13px 16px;background:white;
     border:1px solid var(--g200);border-right:3px solid transparent;border-radius:10px;
     break-inside:avoid;page-break-inside:avoid;margin-bottom:8px;}
.rec.rh{border-right-color:var(--red);}
.rec.rm{border-right-color:var(--yel);}
.rec.rl{border-right-color:var(--blu);}
.rec-bdg{padding:3px 11px;border-radius:100px;font-size:.68rem;font-weight:800;
         white-space:nowrap;align-self:flex-start;margin-top:3px;}
.rec-title{font-size:.85rem;font-weight:700;color:var(--g700);margin-bottom:2px;}
.rec-act{font-size:.78rem;color:var(--g500);line-height:1.5;}

/* ══════════════ NO-BREAK ══════════════ */
.nb{break-inside:avoid;page-break-inside:avoid;}
</style>
</head>
<body>

<!-- ═══════════════════════════════
     PAGE 1 — COVER
═══════════════════════════════ -->
<div class="page">
<div class="cover">
    <div class="cv-blob cv-b1"></div>
    <div class="cv-blob cv-b2"></div>
    <div class="cv-blob cv-b3"></div>

    <div class="cv-top">
        <div>
            <div class="cv-logo">DAM<span>AQ</span></div>
            <div class="cv-tagline">نظام تحليل جودة البيانات · DAMA Framework</div>
        </div>
        <div class="cv-date-lbl">
            <div>تاريخ التقرير</div>
            <div style="font-weight:700;color:rgba(255,255,255,.7);">${dateStr}</div>
        </div>
    </div>

    <div class="cv-body">
        <div class="cv-ring">${this._scoreRing(overall, 176)}</div>
        <div class="cv-file">${meta.fileName || "مجموعة البيانات"}</div>
        <div class="cv-sub">تقرير تحليل جودة البيانات وفق معايير DAMA الدولية</div>
        <div class="cv-pill">${dama?.grade?.icon || ""}&nbsp; ${dama?.grade?.label || "—"}</div>
    </div>

    <div class="cv-bottom">
        <div class="cv-meta">
            <div class="cv-cell">
                <span class="v">${meta.rowCount?.toLocaleString("ar-SA") || "—"}</span>
                <span class="l">إجمالي السجلات</span>
            </div>
            <div class="cv-cell">
                <span class="v">${meta.columnCount || "—"}</span>
                <span class="l">عدد الأعمدة</span>
            </div>
            <div class="cv-cell">
                <span class="v">${completenessVal}${completenessVal !== "—" ? "%" : ""}</span>
                <span class="l">اكتمال البيانات</span>
            </div>
            <div class="cv-cell">
                <span class="v">${meta.fileLastModified
                    ? new Date(meta.fileLastModified).toLocaleDateString("ar-SA")
                    : new Date().toLocaleDateString("ar-SA")}</span>
                <span class="l">${meta.fileLastModified ? "آخر تعديل للملف" : "تاريخ الرفع"}</span>
            </div>
        </div>
    </div>
</div>
</div>

<!-- ═══════════════════════════════
     PAGE 2 — EXECUTIVE SUMMARY
═══════════════════════════════ -->
<div class="page">
<div class="page-inner">

    <div class="ph">
        <div class="ph-left">
            <div class="ph-icon">📋</div>
            <span class="ph-text">الملخص التنفيذي</span>
        </div>
        <span class="ph-tag">DAMAQ · تقرير جودة البيانات</span>
    </div>

    <div class="exec nb"><p>${execSummary}</p></div>

    <div class="sl">المؤشرات الرئيسية</div>
    <div class="kpi-grid">
        <div class="kpi kpi-blu nb">
            <div class="kpi-v">${overall}</div>
            <div class="kpi-l">درجة الجودة الكلية</div>
        </div>
        <div class="kpi nb">
            <div class="kpi-v">${dama?.grade?.icon || ""} ${dama?.grade?.label || "—"}</div>
            <div class="kpi-l">التقييم</div>
        </div>
        <div class="kpi nb">
            <div class="kpi-v">${meta.rowCount?.toLocaleString("ar-SA") || "—"}</div>
            <div class="kpi-l">إجمالي السجلات</div>
        </div>
        <div class="kpi ${this._gradeKpi(parseFloat(completenessVal))} nb">
            <div class="kpi-v">${completenessVal}${completenessVal !== "—" ? "%" : ""}</div>
            <div class="kpi-l">اكتمال البيانات</div>
        </div>
        <div class="kpi ${dupRows > 0 ? "kpi-yel" : "kpi-grn"} nb">
            <div class="kpi-v">${dupRows}</div>
            <div class="kpi-l">سجلات مكررة</div>
        </div>
    </div>

    <div class="sl">مقياس الجودة الكلية</div>
    <div class="gauge-wrap nb">
        <div class="gauge-box">
            <img src="${charts.gauge}" alt="مقياس الجودة" style="max-height:190px;">
            <span class="gauge-cap">درجة الجودة الإجمالية — ${overall}/100</span>
        </div>
    </div>

    <div class="pf">
        <span>DAMAQ · نظام تحليل جودة البيانات</span>
        <span>${meta.fileName || ""} · ${dateStr}</span>
    </div>
</div>
</div>

<!-- ═══════════════════════════════
     PAGE 3 — DAMA 7 DIMENSIONS
═══════════════════════════════ -->
<div class="page">
<div class="page-inner">

    <div class="ph">
        <div class="ph-left">
            <div class="ph-icon">📐</div>
            <span class="ph-text">أبعاد DAMA السبعة</span>
        </div>
        <span class="ph-tag">DAMA-DMBOK Framework</span>
    </div>

    <div class="sl">تقييم الأبعاد</div>
    <div class="dama-grid">
        ${this._buildDAMACards(dama)}
    </div>

    <div class="sl">التحليل البياني للأبعاد</div>
    <div class="ch-box nb" style="text-align:center;">
        <div class="ch-ttl">درجات أبعاد DAMA السبعة</div>
        <img src="${charts.damaBar}" alt="DAMA Dimensions" style="max-height:230px;max-width:100%;">
    </div>

    <div class="pf">
        <span>DAMAQ · نظام تحليل جودة البيانات</span>
        <span>${meta.fileName || ""} · ${dateStr}</span>
    </div>
</div>
</div>

<!-- ═══════════════════════════════
     PAGE 4 — VISUAL ANALYSIS
═══════════════════════════════ -->
<div class="page">
<div class="page-inner">

    <div class="ph">
        <div class="ph-left">
            <div class="ph-icon">📈</div>
            <span class="ph-text">التحليل البياني</span>
        </div>
        <span class="ph-tag">Data Profiling Charts</span>
    </div>

    <div class="sl">توزيع البيانات والمؤشرات</div>
    <div class="ch-grid">
        <div class="ch-box nb">
            <div class="ch-ttl">توزيع أنواع البيانات</div>
            <img src="${charts.typeDonut}" alt="Data Types" style="max-height:200px;">
        </div>
        <div class="ch-box nb" style="text-align:right;">
            <div class="ch-ttl" style="text-align:right;">ملخص درجات الأبعاد</div>
            ${this._buildDimSummaryRows(dama)}
        </div>
    </div>

    <div class="sl">توزيع القيم الفارغة</div>
    <div class="ch-box nb">
        <div class="ch-ttl">نسبة القيم الفارغة لكل عمود</div>
        <img src="${charts.nullHeatmap}" alt="Null Distribution" style="max-width:100%;">
    </div>

    <div class="pf">
        <span>DAMAQ · نظام تحليل جودة البيانات</span>
        <span>${meta.fileName || ""} · ${dateStr}</span>
    </div>
</div>
</div>

<!-- ═══════════════════════════════
     PAGE 5 — COLUMN ANALYSIS
═══════════════════════════════ -->
<div class="page">
<div class="page-inner">

    <div class="ph">
        <div class="ph-left">
            <div class="ph-icon">🔍</div>
            <span class="ph-text">تحليل الأعمدة</span>
        </div>
        <span class="ph-tag">${store.columns?.length || 0} عمود</span>
    </div>

    <div class="sl">ملف تعريف الأعمدة</div>
    <div class="tbl-wrap">
        <table class="tbl">
            <thead>
                <tr>
                    <th>العمود</th>
                    <th>النوع</th>
                    <th>الاكتمال</th>
                    <th>فريد</th>
                    <th>التكرارية</th>
                    <th>متطرفة</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>${this._buildColumnRows(profile, store.columns)}</tbody>
        </table>
    </div>

    <div class="pf">
        <span>DAMAQ · نظام تحليل جودة البيانات</span>
        <span>${meta.fileName || ""} · ${dateStr}</span>
    </div>
</div>
</div>

${rules?.results?.length > 0 || (dama?.recommendations?.length ?? 0) > 0 ? `
<!-- ═══════════════════════════════
     PAGE 6 — RULES & RECOMMENDATIONS
═══════════════════════════════ -->
<div class="page">
<div class="page-inner">

    <div class="ph">
        <div class="ph-left">
            <div class="ph-icon">💡</div>
            <span class="ph-text">النتائج والتوصيات</span>
        </div>
        <span class="ph-tag">Quality Rules & Recommendations</span>
    </div>

    ${rules?.results?.length > 0 ? `
    <div class="sl">نتائج قواعد الجودة</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:380px;margin-bottom:16px;">
        <div class="kpi nb"><div class="kpi-v">${rules.total}</div><div class="kpi-l">إجمالي</div></div>
        <div class="kpi kpi-grn nb"><div class="kpi-v">${rules.passed}</div><div class="kpi-l">نجحت</div></div>
        <div class="kpi ${rules.failed > 0 ? "kpi-red" : "kpi-grn"} nb"><div class="kpi-v">${rules.failed}</div><div class="kpi-l">فشلت</div></div>
    </div>
    <div class="tbl-wrap" style="margin-bottom:24px;">
        <table class="tbl">
            <thead>
                <tr><th>القاعدة</th><th>النوع</th><th>الحالة</th><th>الدرجة</th><th>الملخص</th></tr>
            </thead>
            <tbody>
                ${(rules.results || []).map(r => `
                <tr>
                    <td><strong>${r.ruleName}</strong></td>
                    <td><span class="bdg b-blu">${r.type}</span></td>
                    <td><span class="bdg ${r.passed ? "b-grn" : "b-red"}">${r.passed ? "✅ نجح" : "❌ فشل"}</span></td>
                    <td><strong>${r.score}%</strong></td>
                    <td style="font-size:.74rem;">${r.summary || "—"}</td>
                </tr>`).join("")}
            </tbody>
        </table>
    </div>` : ""}

    ${(dama?.recommendations?.length ?? 0) > 0 ? `
    <div class="sl">التوصيات والإجراءات</div>
    ${dama.recommendations.map(rec => {
        const cls = rec.priority === "عالية" ? "rh" : rec.priority === "متوسطة" ? "rm" : "rl";
        const bdgStyle = rec.priority === "عالية"
            ? "background:var(--red-bg);color:var(--red-tx);"
            : rec.priority === "متوسطة"
            ? "background:var(--yel-bg);color:var(--yel-tx);"
            : "background:var(--blu-bg);color:var(--blu-dk);";
        return `<div class="rec ${cls}">
            <span class="rec-bdg" style="${bdgStyle}">${rec.priority}</span>
            <div>
                <div class="rec-title">${rec.dimension}</div>
                <div class="rec-act">${rec.action}</div>
            </div>
        </div>`;
    }).join("")}` : ""}

    <div class="pf">
        <span>DAMAQ · نظام تحليل جودة البيانات</span>
        <span>${meta.fileName || ""} · ${dateStr}</span>
    </div>
</div>
</div>` : ""}

</body>
</html>`;
    }

    // ── Score Ring SVG ──────────────────────────────────────────
    static _scoreRing(score, size = 176) {
        const r     = size * 0.36;
        const cx    = size / 2;
        const cy    = size / 2;
        const circ  = 2 * Math.PI * r;
        const dash  = (Math.min(score, 100) / 100) * circ;
        const sw    = size * 0.074;
        const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
        const fs1   = Math.round(size * 0.22);
        const fs2   = Math.round(size * 0.1);
        const ty2   = cy + Math.round(size * 0.13);
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="${sw}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
          stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}" stroke-linecap="round"
          transform="rotate(-90 ${cx} ${cy})"/>
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-family="Tajawal,sans-serif"
        font-size="${fs1}" font-weight="800" fill="white">${score}</text>
  <text x="${cx}" y="${ty2}" text-anchor="middle" font-family="Tajawal,sans-serif"
        font-size="${fs2}" fill="rgba(255,255,255,.5)">/ 100</text>
</svg>`;
    }

    // ── Dim Summary Rows (page 4 right column) ──────────────────
    static _buildDimSummaryRows(dama) {
        if (!dama?.dimensions) return "";
        const names = {
            completeness:"الاكتمال", validity:"الصلاحية",
            consistency:"التناسق",  accuracy:"الدقة",
            timeliness:"الحداثة",   uniqueness:"التفرد",
            integrity:"السلامة"
        };
        const icons = {
            completeness:"📦", validity:"✅", consistency:"🔗",
            accuracy:"🎯", timeliness:"⏱️", uniqueness:"🔑", integrity:"🛡️"
        };
        return `<div style="padding:4px 0;">` +
            Object.entries(dama.dimensions).map(([k, d]) => {
                const color  = d.score >= 80 ? "var(--grn)" : d.score >= 60 ? "var(--yel)" : "var(--red)";
                const bgPill = d.score >= 80 ? "var(--grn-bg)" : d.score >= 60 ? "var(--yel-bg)" : "var(--red-bg)";
                const txPill = d.score >= 80 ? "var(--grn-tx)" : d.score >= 60 ? "var(--yel-tx)" : "var(--red-tx)";
                return `<div class="ds-row">
    <span class="ds-name">${icons[k] || "•"} ${names[k] || k}</span>
    <div class="ds-track"><div class="ds-fill" style="width:${d.score}%;background:${color};"></div></div>
    <span class="ds-pill" style="background:${bgPill};color:${txPill};">${d.score}%</span>
</div>`;
            }).join("") + `</div>`;
    }

    // ── DAMA Cards ───────────────────────────────────────────────
    static _buildDAMACards(dama) {
        if (!dama?.dimensions) return "";
        const names = {
            completeness:"الاكتمال", validity:"الصلاحية",
            consistency:"التناسق",  accuracy:"الدقة",
            timeliness:"الحداثة",   uniqueness:"التفرد",
            integrity:"السلامة"
        };
        const icons = {
            completeness:"📦", validity:"✅", consistency:"🔗",
            accuracy:"🎯", timeliness:"⏱️", uniqueness:"🔑", integrity:"🛡️"
        };
        return Object.entries(dama.dimensions).map(([key, dim], idx) => {
            const sc = dim.score;
            const sc_cls = sc >= 80 ? "s-grn" : sc >= 60 ? "s-yel" : sc >= 40 ? "s-org" : "s-red";
            const f_cls  = sc >= 80 ? "f-grn" : sc >= 60 ? "f-yel" : sc >= 40 ? "f-org" : "f-red";
            const span   = idx === 6 ? ' style="grid-column:1/-1;max-width:340px;"' : '';
            return `<div class="dc"${span}>
    <div class="dc-top">
        <span class="dc-name">${icons[key] || "•"} ${names[key] || key}</span>
        <span class="dc-score ${sc_cls}">${dim.score}%</span>
    </div>
    <div class="bar"><div class="bf ${f_cls}" style="width:${dim.score}%;"></div></div>
    <div class="dc-note">
        ${dim.details || (dim.skipped ? "⚡ لا ينطبق" : "")}
        ${dim.source === "fileMetadata" ? `<br><span style="opacity:.7;">📁 مصدر: بيانات الملف</span>` : ""}
        ${dim.source === "dateColumns"  ? `<br><span style="opacity:.7;">📅 مصدر: أعمدة التاريخ</span>` : ""}
    </div>
</div>`;
        }).join("");
    }

    // ── Column Rows ──────────────────────────────────────────────
    static _buildColumnRows(profile, columns) {
        if (!profile || !columns) return "";
        return columns.map(col => {
            const p = profile[col];
            if (!p) return "";
            const comp = (100 - p.emptyPct).toFixed(1);
            const pgColor = comp >= 90 ? "var(--grn)" : comp >= 70 ? "var(--yel)" : "var(--red)";
            const status  =
                p.isConstant  ? `<span class="bdg b-yel">ثابت</span>` :
                p.isNearEmpty ? `<span class="bdg b-red">شبه فارغ</span>` :
                p.emptyPct>20 ? `<span class="bdg b-yel">يحتاج مراجعة</span>` :
                                `<span class="bdg b-grn">جيد</span>`;
            return `<tr>
    <td><strong>${col}</strong></td>
    <td><span class="bdg b-blu">${p.type}</span></td>
    <td><div class="pg">
        <div class="pg-tr"><div class="pg-fl" style="width:${comp}%;background:${pgColor};"></div></div>
        <span style="font-size:.76rem;">${comp}%</span>
    </div></td>
    <td>${p.unique?.toLocaleString("ar-SA") || "—"}</td>
    <td>${p.cardinality?.level || "—"}</td>
    <td>${p.outliers?.count > 0
        ? `<span class="bdg b-yel">${p.outliers.count}</span>`
        : `<span class="bdg b-grn">لا يوجد</span>`}</td>
    <td>${status}</td>
</tr>`;
        }).join("");
    }

    // ── Executive Summary Text ───────────────────────────────────
    static _buildExecSummary(dama, profile, store, rules) {
        const overall  = dama?.overall || 0;
        const grade    = dama?.grade?.label || "—";
        const meta     = store.metadata || {};
        const rowCount = meta.rowCount   || 0;
        const colCount = meta.columnCount || 0;
        const emptyPct = profile?.__dataset__
            ? ((profile.__dataset__.totalEmpty / profile.__dataset__.totalCells) * 100).toFixed(1)
            : "0";
        const dupRows  = profile?.__dataset__?.duplicateRows || 0;
        const rulesTxt = rules?.results?.length > 0
            ? `اجتازت البيانات ${rules.passed} من أصل ${rules.total} قاعدة جودة. `
            : "";
        const topRec   = dama?.recommendations?.[0]?.action || "";

        const timeliness = dama?.dimensions?.timeliness;
        let timeTxt = "";
        if (timeliness?.source === "fileMetadata") {
            timeTxt = `درجة حداثة البيانات <strong>${timeliness.score}/100</strong> — ${timeliness.details.split("—")[0].trim()}.`;
        } else if (timeliness?.source === "dateColumns") {
            timeTxt = `درجة حداثة البيانات <strong>${timeliness.score}/100</strong> بناءً على أعمدة التاريخ.`;
        }

        const fileInfo = meta.fileLastModified
            ? `الملف <strong>${meta.fileName || ""}</strong> آخر تعديل له كان ${new Date(meta.fileLastModified).toLocaleDateString("ar-SA")}.`
            : "";

        return `تم تحليل مجموعة بيانات تحتوي على
            <strong>${rowCount.toLocaleString("ar-SA")} سجل</strong>
            و<strong>${colCount} عمود</strong>.
            حصلت البيانات على درجة جودة إجمالية
            <strong>${overall}/100 (${grade})</strong>
            وفق معايير DAMA الدولية.
            تبلغ نسبة القيم المفقودة <strong>${emptyPct}%</strong>${dupRows > 0
                ? `، وتم رصد <strong>${dupRows} سجل مكرر</strong>` : "، ولا توجد سجلات مكررة"}.
            ${timeTxt ? `<br>${timeTxt}` : ""}
            ${fileInfo ? `<br>${fileInfo}` : ""}
            ${rulesTxt}${topRec ? `<br><br>أبرز توصية: <strong>${topRec}</strong>.` : ""}`;
    }

    // ── Charts ───────────────────────────────────────────────────
    static _buildCharts(dama, profile, columns) {
        const charts = {};

        const gaugeC = ChartBuilder.createOffscreen(300, 200);
        ChartBuilder.drawGauge(gaugeC, dama?.overall || 0);
        charts.gauge = ChartBuilder.toBase64(gaugeC);

        if (dama?.dimensions) {
            const dimNames = {
                completeness:"الاكتمال", validity:"الصلاحية",
                consistency:"التناسق",  accuracy:"الدقة",
                timeliness:"الحداثة",   uniqueness:"التفرد",
                integrity:"السلامة"
            };
            const labels = Object.keys(dama.dimensions).map(k => dimNames[k] || k);
            const values = Object.values(dama.dimensions).map(d => d.score);
            const colors = values.map(v => v >= 80 ? "#10B981" : v >= 60 ? "#F59E0B" : "#EF4444");
            const barC   = ChartBuilder.createOffscreen(560, 300);
            ChartBuilder.drawBar(barC, labels, values, { color: colors });
            charts.damaBar = ChartBuilder.toBase64(barC);
        }

        if (profile && columns) {
            const typeCounts = {};
            columns.forEach(col => {
                const t = profile[col]?.type || "unknown";
                typeCounts[t] = (typeCounts[t] || 0) + 1;
            });
            const donutC = ChartBuilder.createOffscreen(340, 260);
            ChartBuilder.drawDonut(donutC, Object.keys(typeCounts), Object.values(typeCounts), { title: "الأنواع" });
            charts.typeDonut = ChartBuilder.toBase64(donutC);

            const nullPcts = columns.map(c => profile[c]?.emptyPct || 0);
            const hmH      = Math.max(200, columns.length * 26 + 40);
            const hmC      = ChartBuilder.createOffscreen(640, hmH);
            ChartBuilder.drawHeatmap(hmC, columns, nullPcts);
            charts.nullHeatmap = ChartBuilder.toBase64(hmC);
        }

        return charts;
    }

    // ── Helpers ──────────────────────────────────────────────────
    static _gradeKpi(score) {
        if (isNaN(score)) return "";
        if (score >= 80) return "kpi-grn";
        if (score >= 60) return "kpi-yel";
        return "kpi-red";
    }

    static _gradeClass(score) {
        if (score >= 80) return "green";
        if (score >= 60) return "yellow";
        return "red";
    }
}

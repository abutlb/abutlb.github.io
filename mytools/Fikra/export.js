// =====================================================
//  FIKRA — export.js
//  المسؤوليات:
//  1. قراءة البيانات من localStorage
//  2. حقن البيانات في القالب المختار
//  3. فتح تاب جديد جاهز للطباعة كـ PDF
// =====================================================

const STORAGE_KEY = 'fikra_project';

// ─────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────
const esc = str =>
    String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const or = (val, fallback = '—') =>
    (val && String(val).trim()) ? val : fallback;

const list = (arr, fallback = '—') =>
    arr && arr.length
        ? arr.map(i => `<li>${esc(typeof i === 'string' ? i : i.name)}</li>`).join('')
        : `<li>${fallback}</li>`;

const chips = (arr, color = '#3d5afe') =>
    arr && arr.length
        ? arr.map(i => `
            <span style="display:inline-flex;align-items:center;
                         padding:3px 10px;border-radius:999px;
                         font-size:11px;font-weight:700;
                         background:${color}18;color:${color};
                         border:1.5px solid ${color}30;
                         margin:2px;">
                ${esc(typeof i === 'string' ? i : i.name)}
            </span>`).join('')
        : '<span style="color:#9ca3af">—</span>';

const priorityLabel = p => ({
    must  : { label: 'Must Have',   color: '#dc2626', bg: '#fef2f2' },
    should: { label: 'Should Have', color: '#d97706', bg: '#fffbeb' },
    could : { label: 'Could Have',  color: '#2563eb', bg: '#eff6ff' },
}[p] || { label: p, color: '#6b7280', bg: '#f9fafb' });

const today = () => new Date().toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric'
});


// ─────────────────────────────────────────────────────
//  SHARED PRINT WRAPPER
// ─────────────────────────────────────────────────────
function printWrap(title, projectName, bodyHTML, accentColor = '#3d5afe') {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${esc(projectName)} — ${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
<style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{
        font-family:'Tajawal',sans-serif;
        background:#fff;color:#1e2433;
        font-size:13px;line-height:1.6;
        padding:0;
    }
    @page{size:A4;margin:1.5cm}
    @media print{
        .no-print{display:none!important}
        body{padding:0}
        .page-break{page-break-before:always}
    }
    /* Print Button */
    .print-bar{
        position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);
        display:flex;gap:.75rem;z-index:999;
    }
    .print-btn{
        display:inline-flex;align-items:center;gap:.4rem;
        padding:.6rem 1.4rem;border-radius:999px;
        font-family:inherit;font-size:13px;font-weight:700;
        cursor:pointer;border:none;transition:all 150ms;
        box-shadow:0 4px 14px rgba(0,0,0,.15);
    }
    .print-btn--primary{background:${accentColor};color:#fff}
    .print-btn--primary:hover{filter:brightness(1.1)}
    .print-btn--ghost{background:#fff;color:#374151;border:1.5px solid #e5e7eb}
    .print-btn--ghost:hover{border-color:${accentColor};color:${accentColor}}
</style>
</head>
<body>

${bodyHTML}

<!-- Print Bar -->
<div class="print-bar no-print">
    <button class="print-btn print-btn--primary" onclick="window.print()">
        🖨️ طباعة / حفظ PDF
    </button>
    <button class="print-btn print-btn--ghost" onclick="window.close()">
        ✕ إغلاق
    </button>
</div>

</body>
</html>`;
}


// =====================================================
//  TEMPLATE 1 — الكلاسيكي
// =====================================================
function buildT1Classic(s) {
    const accent = '#3d5afe';

    const featuresRows = s.features.length
        ? s.features.map(f => {
            const p = priorityLabel(f.priority);
            return `
            <tr>
                <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;
                           font-weight:600">${esc(f.name)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;text-align:center">
                    <span style="padding:2px 8px;border-radius:999px;font-size:11px;
                                 font-weight:700;background:${p.bg};color:${p.color}">
                        ${p.label}
                    </span>
                </td>
            </tr>`;
        }).join('')
        : `<tr><td colspan="2" style="padding:12px;color:#9ca3af;text-align:center">لا توجد مميزات</td></tr>`;

    const kpiRows = s.metrics.kpis.length
        ? s.metrics.kpis.map(k => `
            <tr>
                <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;font-weight:600">
                    ${esc(k.name)}
                </td>
                <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;
                           text-align:center;font-weight:700;color:${accent}">
                    ${esc(k.target)}
                </td>
            </tr>`).join('')
        : `<tr><td colspan="2" style="padding:12px;color:#9ca3af;text-align:center">لا توجد مؤشرات</td></tr>`;

    const phaseItems = s.timeline.phases.length
        ? s.timeline.phases.map((ph, i) => {
            const colors = ['#3d5afe','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4'];
            const c = colors[i % colors.length];
            return `
            <div style="display:flex;align-items:center;gap:10px;
                        padding:10px;border-radius:10px;
                        background:#f9fafb;margin-bottom:6px">
                <div style="width:10px;height:10px;border-radius:50%;
                            background:${c};flex-shrink:0"></div>
                <span style="flex:1;font-weight:600">${esc(ph.name)}</span>
                <span style="font-size:11px;color:#9ca3af">${esc(ph.duration)}</span>
            </div>`;
        }).join('')
        : '<p style="color:#9ca3af">لا توجد مراحل</p>';

    const body = `
<div style="max-width:760px;margin:0 auto;padding:2rem 1.5rem">

    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding-bottom:1.5rem;border-bottom:3px solid ${accent};margin-bottom:2rem">
        <div style="display:flex;align-items:center;gap:12px">
            <div style="width:48px;height:48px;border-radius:14px;
                        background:${accent};display:flex;align-items:center;
                        justify-content:center;color:#fff;font-size:22px;font-weight:900">
                ف
            </div>
            <div>
                <h1 style="font-size:22px;font-weight:900;color:#1e2433;line-height:1.2">
                    ${esc(s.projectName)}
                </h1>
                <p style="font-size:12px;color:#9ca3af">وثيقة MVP — ${today()}</p>
            </div>
        </div>
        <div style="text-align:left">
            <span style="padding:4px 12px;border-radius:999px;font-size:11px;
                         font-weight:700;background:${accent}15;color:${accent}">
                ${esc(or(s.solution.approach, 'MVP'))}
            </span>
        </div>
    </div>

    <!-- Grid: المشكلة + الحل -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">

        <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb">
            <h2 style="font-size:13px;font-weight:800;color:${accent};margin-bottom:.5rem">
                🔍 المشكلة
            </h2>
            <p style="font-size:12px;color:#374151;line-height:1.7">
                ${esc(or(s.problem.statement))}
            </p>
            ${s.problem.audience ? `
            <div style="margin-top:.75rem;padding:.5rem .75rem;border-radius:8px;
                        background:#f9fafb;font-size:11px;color:#6b7280">
                <strong>الجمهور:</strong> ${esc(s.problem.audience)}
            </div>` : ''}
            ${s.problem.painPoints.length ? `
            <div style="margin-top:.5rem">
                ${chips(s.problem.painPoints, '#ef4444')}
            </div>` : ''}
        </div>

        <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb">
            <h2 style="font-size:13px;font-weight:800;color:#10b981;margin-bottom:.5rem">
                💡 الحل
            </h2>
            <p style="font-size:12px;color:#374151;line-height:1.7">
                ${esc(or(s.solution.statement))}
            </p>
            ${s.solution.valueProp ? `
            <div style="margin-top:.75rem;padding:.5rem .75rem;border-radius:8px;
                        background:#ecfdf5;font-size:11px;color:#065f46;font-weight:600">
                ✓ ${esc(s.solution.valueProp)}
            </div>` : ''}
            ${s.solution.differentiation ? `
            <p style="margin-top:.5rem;font-size:11px;color:#6b7280;line-height:1.6">
                <strong>الميزة التنافسية:</strong> ${esc(s.solution.differentiation)}
            </p>` : ''}
        </div>

    </div>

    <!-- المميزات -->
    <div style="margin-bottom:1.5rem">
        <h2 style="font-size:14px;font-weight:800;color:#1e2433;margin-bottom:.75rem;
                   padding-bottom:.5rem;border-bottom:2px solid #f3f4f6">
            ⭐ المميزات
        </h2>
        <table style="width:100%;border-collapse:collapse">
            <thead>
                <tr style="background:#f9fafb">
                    <th style="padding:8px 10px;text-align:right;font-size:11px;
                               color:#6b7280;border-bottom:1.5px solid #e5e7eb">الميزة</th>
                    <th style="padding:8px 10px;text-align:center;font-size:11px;
                               color:#6b7280;border-bottom:1.5px solid #e5e7eb;width:120px">الأولوية</th>
                </tr>
            </thead>
            <tbody>${featuresRows}</tbody>
        </table>
    </div>

    <!-- Grid: المقاييس + الجدول -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">

        <div>
            <h2 style="font-size:14px;font-weight:800;color:#1e2433;margin-bottom:.75rem;
                       padding-bottom:.5rem;border-bottom:2px solid #f3f4f6">
                📊 المقاييس
            </h2>
            ${s.metrics.goal ? `
            <div style="padding:.625rem .875rem;border-radius:10px;
                        background:${accent}10;border:1px solid ${accent}20;
                        font-size:12px;color:#374151;margin-bottom:.75rem">
                <strong>الهدف:</strong> ${esc(s.metrics.goal)}
            </div>` : ''}
            <table style="width:100%;border-collapse:collapse">
                <tbody>${kpiRows}</tbody>
            </table>
        </div>

        <div>
            <h2 style="font-size:14px;font-weight:800;color:#1e2433;margin-bottom:.75rem;
                       padding-bottom:.5rem;border-bottom:2px solid #f3f4f6">
                📅 الجدول الزمني
            </h2>
            ${s.timeline.start ? `
            <div style="display:flex;gap:8px;margin-bottom:.75rem">
                <span style="padding:3px 10px;border-radius:999px;font-size:11px;
                             font-weight:700;background:#ecfdf5;color:#065f46">
                    بدء: ${esc(s.timeline.start)}
                </span>
                <span style="padding:3px 10px;border-radius:999px;font-size:11px;
                             font-weight:700;background:#eff6ff;color:#1d4ed8">
                    إطلاق: ${esc(s.timeline.launch)}
                </span>
            </div>` : ''}
            ${phaseItems}
        </div>

    </div>

    <!-- Grid: نموذج الربح + التقنية -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">

        <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb">
            <h2 style="font-size:13px;font-weight:800;color:#f59e0b;margin-bottom:.5rem">
                💰 نموذج الربح
            </h2>
            <p style="font-size:12px;font-weight:700;color:#374151;margin-bottom:.5rem">
                ${esc(or(s.business.model))}
            </p>
            ${s.business.price ? `
            <p style="font-size:11px;color:#6b7280">
                <strong>السعر:</strong> ${esc(s.business.price)}
            </p>` : ''}
            ${s.business.revenueGoal ? `
            <p style="font-size:11px;color:#6b7280">
                <strong>هدف الإيراد:</strong> ${esc(s.business.revenueGoal)}
            </p>` : ''}
            ${s.business.revenues.length ? `
            <div style="margin-top:.5rem">${chips(s.business.revenues, '#10b981')}</div>` : ''}
        </div>

        <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb">
            <h2 style="font-size:13px;font-weight:800;color:#8b5cf6;margin-bottom:.5rem">
                ⚙️ التقنية
            </h2>
            ${s.tech.productType ? `
            <p style="font-size:11px;color:#6b7280;margin-bottom:.5rem">
                <strong>نوع المنتج:</strong> ${esc(s.tech.productType)}
            </p>` : ''}
            <div style="margin-bottom:.5rem">${chips(s.tech.stack, '#8b5cf6')}</div>
            ${s.tech.challenges ? `
            <p style="font-size:11px;color:#6b7280;line-height:1.6">
                <strong>التحديات:</strong> ${esc(s.tech.challenges)}
            </p>` : ''}
        </div>

    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:1rem;border-top:1px solid #f3f4f6;
                font-size:11px;color:#d1d5db">
        تم إنشاؤه بواسطة فكرة MVP Designer — ${today()}
    </div>

</div>`;

    return printWrap('الكلاسيكي', s.projectName, body, accent);
}


// =====================================================
//  TEMPLATE 2 — المستثمر
// =====================================================
function buildT2Investor(s) {
    const accent = '#1a30c8';

    const mustFeatures = s.features.filter(f => f.priority === 'must');
    const shouldFeatures = s.features.filter(f => f.priority === 'should');

    const body = `
<div style="max-width:720px;margin:0 auto;padding:2rem 1.5rem">

    <!-- Cover -->
    <div style="background:linear-gradient(135deg,${accent},#6080ff);
                border-radius:20px;padding:2rem;color:#fff;
                margin-bottom:1.5rem;position:relative;overflow:hidden">
        <div style="position:absolute;top:-20px;left:-20px;width:120px;height:120px;
                    border-radius:50%;background:rgba(255,255,255,.06)"></div>
        <div style="position:absolute;bottom:-30px;right:-30px;width:160px;height:160px;
                    border-radius:50%;background:rgba(255,255,255,.04)"></div>
        <p style="font-size:11px;opacity:.7;margin-bottom:.5rem;font-weight:600">
            عرض تمويل — MVP
        </p>
        <h1 style="font-size:28px;font-weight:900;margin-bottom:.5rem;line-height:1.2">
            ${esc(s.projectName)}
        </h1>
        <p style="font-size:14px;opacity:.85;line-height:1.6;max-width:500px">
            ${esc(or(s.solution.valueProp, s.solution.statement))}
        </p>
        <div style="margin-top:1.25rem;display:flex;gap:.75rem;flex-wrap:wrap">
            <span style="padding:4px 14px;border-radius:999px;font-size:11px;
                         font-weight:700;background:rgba(255,255,255,.2)">
                ${esc(or(s.solution.approach, 'MVP'))}
            </span>
            ${s.business.model ? `
            <span style="padding:4px 14px;border-radius:999px;font-size:11px;
                         font-weight:700;background:rgba(255,255,255,.2)">
                ${esc(s.business.model)}
            </span>` : ''}
            ${s.timeline.launch ? `
            <span style="padding:4px 14px;border-radius:999px;font-size:11px;
                         font-weight:700;background:rgba(255,255,255,.2)">
                إطلاق: ${esc(s.timeline.launch)}
            </span>` : ''}
        </div>
    </div>

    <!-- فرصة السوق -->
    <div style="padding:1.25rem;border-radius:14px;border:1.5px solid #e5e7eb;
                margin-bottom:1rem">
        <h2 style="font-size:14px;font-weight:800;color:${accent};margin-bottom:.75rem">
            🎯 فرصة السوق
        </h2>
        <p style="font-size:12px;color:#374151;line-height:1.7;margin-bottom:.75rem">
            ${esc(or(s.problem.statement))}
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
            <div style="padding:.75rem;border-radius:10px;background:#f9fafb">
                <p style="font-size:10px;color:#9ca3af;font-weight:600;margin-bottom:.25rem">
                    الجمهور المستهدف
                </p>
                <p style="font-size:12px;font-weight:700;color:#1e2433">
                    ${esc(or(s.problem.audience))}
                </p>
            </div>
            <div style="padding:.75rem;border-radius:10px;background:#f9fafb">
                <p style="font-size:10px;color:#9ca3af;font-weight:600;margin-bottom:.25rem">
                    حجم السوق
                </p>
                <p style="font-size:12px;font-weight:700;color:#1e2433">
                    ${esc(or(s.problem.marketSize))}
                </p>
            </div>
        </div>
    </div>

    <!-- الحل والميزة التنافسية -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
        <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb">
            <h2 style="font-size:13px;font-weight:800;color:#10b981;margin-bottom:.5rem">
                💡 الحل
            </h2>
            <p style="font-size:12px;color:#374151;line-height:1.7">
                ${esc(or(s.solution.statement))}
            </p>
        </div>
        <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb">
            <h2 style="font-size:13px;font-weight:800;color:#f59e0b;margin-bottom:.5rem">
                🏆 الميزة التنافسية
            </h2>
            <p style="font-size:12px;color:#374151;line-height:1.7">
                ${esc(or(s.solution.differentiation))}
            </p>
            ${s.solution.competitors.length ? `
            <div style="margin-top:.5rem">
                <p style="font-size:10px;color:#9ca3af;margin-bottom:.25rem">المنافسون:</p>
                ${chips(s.solution.competitors, '#8b5cf6')}
            </div>` : ''}
        </div>
    </div>

    <!-- نموذج الربح -->
    <div style="padding:1.25rem;border-radius:14px;
                background:linear-gradient(135deg,#ecfdf5,#f0fdf4);
                border:1.5px solid #a7f3d0;margin-bottom:1rem">
        <h2 style="font-size:14px;font-weight:800;color:#065f46;margin-bottom:.75rem">
            💰 نموذج الربح
        </h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem">
            <div style="text-align:center;padding:.75rem;border-radius:10px;background:#fff">
                <p style="font-size:10px;color:#9ca3af;font-weight:600;margin-bottom:.25rem">النموذج</p>
                <p style="font-size:12px;font-weight:800;color:#065f46">
                    ${esc(or(s.business.model))}
                </p>
            </div>
            <div style="text-align:center;padding:.75rem;border-radius:10px;background:#fff">
                <p style="font-size:10px;color:#9ca3af;font-weight:600;margin-bottom:.25rem">السعر</p>
                <p style="font-size:12px;font-weight:800;color:#065f46">
                    ${esc(or(s.business.price))}
                </p>
            </div>
            <div style="text-align:center;padding:.75rem;border-radius:10px;background:#fff">
                <p style="font-size:10px;color:#9ca3af;font-weight:600;margin-bottom:.25rem">هدف الإيراد</p>
                <p style="font-size:12px;font-weight:800;color:#065f46">
                    ${esc(or(s.business.revenueGoal))}
                </p>
            </div>
        </div>
    </div>

    <!-- المميزات الأساسية -->
    ${mustFeatures.length || shouldFeatures.length ? `
    <div style="margin-bottom:1rem">
        <h2 style="font-size:14px;font-weight:800;color:#1e2433;margin-bottom:.75rem;
                   padding-bottom:.5rem;border-bottom:2px solid #f3f4f6">
            ⭐ المميزات الأساسية
        </h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
            ${mustFeatures.map(f => `
            <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;
                        border-radius:10px;background:#fef2f2;border:1px solid #fecaca">
                <span style="color:#dc2626;font-size:12px">●</span>
                <span style="font-size:12px;font-weight:600;color:#374151">${esc(f.name)}</span>
            </div>`).join('')}
            ${shouldFeatures.map(f => `
            <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;
                        border-radius:10px;background:#fffbeb;border:1px solid #fde68a">
                <span style="color:#d97706;font-size:12px">●</span>
                <span style="font-size:12px;font-weight:600;color:#374151">${esc(f.name)}</span>
            </div>`).join('')}
        </div>
    </div>` : ''}

    <!-- مؤشرات النجاح -->
    ${s.metrics.kpis.length ? `
    <div style="padding:1.25rem;border-radius:14px;border:1.5px solid #e5e7eb;margin-bottom:1rem">
        <h2 style="font-size:14px;font-weight:800;color:#1e2433;margin-bottom:.75rem">
            📊 مؤشرات النجاح
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.5rem">
            ${s.metrics.kpis.map(k => `
            <div style="padding:.75rem;border-radius:10px;background:#f9fafb;text-align:center">
                <p style="font-size:14px;font-weight:900;color:${accent}">${esc(k.target)}</p>
                <p style="font-size:10px;color:#6b7280;font-weight:600">${esc(k.name)}</p>
            </div>`).join('')}
        </div>
    </div>` : ''}

    <!-- Footer -->
    <div style="text-align:center;padding-top:1rem;border-top:1px solid #f3f4f6;
                font-size:11px;color:#d1d5db">
        ${esc(s.projectName)} — وثيقة تمويل MVP — ${today()}
    </div>

</div>`;

    return printWrap('المستثمر', s.projectName, body, accent);
}


// =====================================================
//  TEMPLATE 3 — Pitch Deck (صفحة واحدة)
// =====================================================
function buildT3Pitch(s) {
    const accent = '#7c3aed';

    const body = `
<div style="max-width:680px;margin:0 auto;padding:1.5rem">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:1.5rem">
        <div style="width:56px;height:56px;border-radius:16px;
                    background:linear-gradient(135deg,${accent},#a855f7);
                    display:flex;align-items:center;justify-content:center;
                    color:#fff;font-size:24px;font-weight:900;
                    margin:0 auto .75rem">ف</div>
        <h1 style="font-size:26px;font-weight:900;color:#1e2433;margin-bottom:.25rem">
            ${esc(s.projectName)}
        </h1>
        <p style="font-size:14px;color:#6b7280;max-width:480px;margin:0 auto;line-height:1.6">
            ${esc(or(s.solution.valueProp, s.solution.statement))}
        </p>
    </div>

    <!-- 3 Boxes -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;margin-bottom:1.25rem">
        <div style="padding:1rem;border-radius:14px;background:#fef2f2;border:1.5px solid #fecaca;text-align:center">
            <p style="font-size:22px;margin-bottom:.25rem">😣</p>
            <p style="font-size:11px;font-weight:800;color:#dc2626;margin-bottom:.35rem">المشكلة</p>
            <p style="font-size:11px;color:#374151;line-height:1.5">
                ${esc(s.problem.statement?.slice(0, 100) || '—')}
                ${(s.problem.statement?.length || 0) > 100 ? '…' : ''}
            </p>
        </div>
        <div style="padding:1rem;border-radius:14px;background:#ecfdf5;border:1.5px solid #a7f3d0;text-align:center">
            <p style="font-size:22px;margin-bottom:.25rem">💡</p>
            <p style="font-size:11px;font-weight:800;color:#065f46;margin-bottom:.35rem">الحل</p>
            <p style="font-size:11px;color:#374151;line-height:1.5">
                ${esc(s.solution.statement?.slice(0, 100) || '—')}
                ${(s.solution.statement?.length || 0) > 100 ? '…' : ''}
            </p>
        </div>
        <div style="padding:1rem;border-radius:14px;background:#eff6ff;border:1.5px solid #bfdbfe;text-align:center">
            <p style="font-size:22px;margin-bottom:.25rem">🏆</p>
            <p style="font-size:11px;font-weight:800;color:#1d4ed8;margin-bottom:.35rem">الميزة</p>
            <p style="font-size:11px;color:#374151;line-height:1.5">
                ${esc(s.solution.differentiation?.slice(0, 100) || '—')}
                ${(s.solution.differentiation?.length || 0) > 100 ? '…' : ''}
            </p>
        </div>
    </div>

    <!-- المميزات + المقاييس -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem">
        <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb">
            <p style="font-size:12px;font-weight:800;color:#1e2433;margin-bottom:.5rem">⭐ أبرز المميزات</p>
            ${s.features.slice(0, 5).map(f => {
                const p = priorityLabel(f.priority);
                return `<div style="display:flex;align-items:center;gap:6px;
                                    padding:4px 0;border-bottom:1px solid #f9fafb">
                    <span style="width:6px;height:6px;border-radius:50%;
                                 background:${p.color};flex-shrink:0"></span>
                    <span style="font-size:11px;color:#374151;font-weight:600">${esc(f.name)}</span>
                </div>`;
            }).join('') || '<p style="font-size:11px;color:#9ca3af">—</p>'}
        </div>
        <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb">
            <p style="font-size:12px;font-weight:800;color:#1e2433;margin-bottom:.5rem">📊 مؤشرات النجاح</p>
            ${s.metrics.kpis.slice(0, 4).map(k => `
            <div style="display:flex;justify-content:space-between;align-items:center;
                        padding:4px 0;border-bottom:1px solid #f9fafb">
                <span style="font-size:11px;color:#374151;font-weight:600">${esc(k.name)}</span>
                <span style="font-size:11px;font-weight:800;color:${accent}">${esc(k.target)}</span>
            </div>`).join('') || '<p style="font-size:11px;color:#9ca3af">—</p>'}
        </div>
    </div>

    <!-- نموذج الربح + التقنية -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem">
        <div style="padding:1rem;border-radius:14px;
                    background:linear-gradient(135deg,#fdf4ff,#faf5ff);
                    border:1.5px solid #e9d5ff">
            <p style="font-size:12px;font-weight:800;color:${accent};margin-bottom:.5rem">💰 نموذج الربح</p>
            <p style="font-size:13px;font-weight:900;color:#1e2433">${esc(or(s.business.model))}</p>
            ${s.business.price ? `<p style="font-size:11px;color:#6b7280;margin-top:.25rem">${esc(s.business.price)}</p>` : ''}
            ${s.business.revenueGoal ? `<p style="font-size:11px;color:#6b7280">هدف: ${esc(s.business.revenueGoal)}</p>` : ''}
        </div>
        <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb">
            <p style="font-size:12px;font-weight:800;color:#1e2433;margin-bottom:.5rem">⚙️ التقنية</p>
            <div>${chips(s.tech.stack.slice(0, 6), accent)}</div>
            ${s.tech.productType ? `<p style="font-size:11px;color:#6b7280;margin-top:.35rem">نوع: ${esc(s.tech.productType)}</p>` : ''}
        </div>
    </div>

    <!-- الجدول الزمني -->
    ${s.timeline.phases.length ? `
    <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb;margin-bottom:1.25rem">
        <p style="font-size:12px;font-weight:800;color:#1e2433;margin-bottom:.75rem">📅 الجدول الزمني</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${s.timeline.phases.map((ph, i) => {
                const colors = ['#3d5afe','#10b981','#f59e0b','#8b5cf6','#ec4899'];
                const c = colors[i % colors.length];
                return `<div style="flex:1;min-width:100px;padding:8px;border-radius:8px;
                                    background:${c}12;border:1.5px solid ${c}30;text-align:center">
                    <p style="font-size:11px;font-weight:700;color:${c}">${esc(ph.name)}</p>
                    <p style="font-size:10px;color:#9ca3af">${esc(ph.duration)}</p>
                </div>`;
            }).join('')}
        </div>
    </div>` : ''}

    <!-- Footer -->
    <div style="text-align:center;font-size:11px;color:#d1d5db;padding-top:.75rem;
                border-top:1px solid #f3f4f6">
        ${esc(s.projectName)} — Pitch Deck — ${today()}
    </div>

</div>`;

    return printWrap('Pitch Deck', s.projectName, body, accent);
}


// =====================================================
//  TEMPLATE 4 — التقني
// =====================================================
function buildT4Technical(s) {
    const accent = '#0891b2';

    const featsByPriority = {
        must  : s.features.filter(f => f.priority === 'must'),
        should: s.features.filter(f => f.priority === 'should'),
        could : s.features.filter(f => f.priority === 'could'),
    };

    const body = `
<div style="max-width:760px;margin:0 auto;padding:2rem 1.5rem">

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:12px;
                padding-bottom:1rem;border-bottom:3px solid ${accent};margin-bottom:1.5rem">
        <div style="width:44px;height:44px;border-radius:12px;
                    background:${accent};display:flex;align-items:center;
                    justify-content:center;color:#fff;font-size:20px;font-weight:900">
            ف
        </div>
        <div>
            <h1 style="font-size:20px;font-weight:900;color:#1e2433">${esc(s.projectName)}</h1>
            <p style="font-size:11px;color:#9ca3af">المواصفات التقنية — ${today()}</p>
        </div>
        ${s.tech.productType ? `
        <span style="margin-right:auto;padding:4px 12px;border-radius:999px;
                     font-size:11px;font-weight:700;background:${accent}15;color:${accent}">
            ${esc(s.tech.productType)}
        </span>` : ''}
    </div>

    <!-- Stack التقني -->
    <div style="padding:1.25rem;border-radius:14px;
                background:#f0f9ff;border:1.5px solid #bae6fd;margin-bottom:1rem">
        <h2 style="font-size:14px;font-weight:800;color:${accent};margin-bottom:.75rem">
            ⚙️ Stack التقني
        </h2>
        <div style="margin-bottom:.5rem">${chips(s.tech.stack, accent)}</div>
        ${s.tech.challenges ? `
        <div style="margin-top:.75rem;padding:.625rem .875rem;border-radius:10px;
                    background:#fff;border:1px solid #bae6fd">
            <p style="font-size:11px;font-weight:700;color:${accent};margin-bottom:.25rem">
                التحديات التقنية:
            </p>
            <p style="font-size:12px;color:#374151;line-height:1.6">
                ${esc(s.tech.challenges)}
            </p>
        </div>` : ''}
    </div>

    <!-- وصف الحل التقني -->
    <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb;margin-bottom:1rem">
        <h2 style="font-size:13px;font-weight:800;color:#1e2433;margin-bottom:.5rem">
            💡 الحل التقني
        </h2>
        <p style="font-size:12px;color:#374151;line-height:1.7">
            ${esc(or(s.solution.statement))}
        </p>
        ${s.solution.approach ? `
        <span style="display:inline-block;margin-top:.5rem;padding:3px 10px;
                     border-radius:999px;font-size:11px;font-weight:700;
                     background:${accent}12;color:${accent}">
            ${esc(s.solution.approach)}
        </span>` : ''}
    </div>

    <!-- MoSCoW -->
    <div style="margin-bottom:1rem">
        <h2 style="font-size:14px;font-weight:800;color:#1e2433;margin-bottom:.75rem;
                   padding-bottom:.5rem;border-bottom:2px solid #f3f4f6">
            📋 المميزات — MoSCoW
        </h2>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem">
            ${['must','should','could'].map(p => {
                const info = priorityLabel(p);
                const items = featsByPriority[p];
                return `
                <div style="border-radius:12px;overflow:hidden;border:1.5px solid ${info.color}30">
                    <div style="padding:8px 10px;background:${info.bg};
                                font-size:11px;font-weight:800;color:${info.color}">
                        ${info.label} (${items.length})
                    </div>
                    <div style="padding:8px;background:#fff">
                        ${items.length
                            ? items.map(f => `
                            <div style="padding:4px 6px;font-size:11px;color:#374151;
                                        font-weight:600;border-bottom:1px solid #f9fafb">
                                ${esc(f.name)}
                            </div>`).join('')
                            : '<p style="font-size:11px;color:#9ca3af;padding:4px 6px">—</p>'
                        }
                    </div>
                </div>`;
            }).join('')}
        </div>
    </div>

    <!-- الجدول الزمني التفصيلي -->
    <div style="margin-bottom:1rem">
        <h2 style="font-size:14px;font-weight:800;color:#1e2433;margin-bottom:.75rem;
                   padding-bottom:.5rem;border-bottom:2px solid #f3f4f6">
            📅 خطة التطوير
        </h2>
        ${s.timeline.start ? `
        <div style="display:flex;gap:8px;margin-bottom:.75rem">
            <span style="padding:3px 10px;border-radius:999px;font-size:11px;
                         font-weight:700;background:#ecfdf5;color:#065f46">
                بدء: ${esc(s.timeline.start)}
            </span>
            <span style="padding:3px 10px;border-radius:999px;font-size:11px;
                         font-weight:700;background:#eff6ff;color:#1d4ed8">
                إطلاق: ${esc(s.timeline.launch)}
            </span>
        </div>` : ''}
        ${s.timeline.phases.map((ph, i) => {
            const colors = [accent,'#10b981','#f59e0b','#8b5cf6','#ec4899'];
            const c = colors[i % colors.length];
            return `
            <div style="display:flex;align-items:center;gap:10px;
                        padding:10px 12px;border-radius:10px;
                        border:1.5px solid ${c}25;background:${c}08;margin-bottom:6px">
                <div style="width:28px;height:28px;border-radius:8px;
                            background:${c};color:#fff;font-size:11px;
                            font-weight:800;display:flex;align-items:center;
                            justify-content:center;flex-shrink:0">
                    ${i + 1}
                </div>
                <span style="flex:1;font-size:12px;font-weight:700;color:#1e2433">
                    ${esc(ph.name)}
                </span>
                <span style="font-size:11px;color:#9ca3af;font-weight:600">
                    ${esc(ph.duration)}
                </span>
            </div>`;
        }).join('') || '<p style="color:#9ca3af;font-size:12px">لا توجد مراحل</p>'}
    </div>

    <!-- KPIs -->
    ${s.metrics.kpis.length ? `
    <div style="padding:1rem;border-radius:14px;border:1.5px solid #e5e7eb;margin-bottom:1rem">
        <h2 style="font-size:13px;font-weight:800;color:#1e2433;margin-bottom:.75rem">
            📊 مؤشرات الأداء
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.5rem">
            ${s.metrics.kpis.map(k => `
            <div style="padding:.75rem;border-radius:10px;background:#f0f9ff;
                        border:1px solid #bae6fd;text-align:center">
                <p style="font-size:15px;font-weight:900;color:${accent}">${esc(k.target)}</p>
                <p style="font-size:10px;color:#6b7280;font-weight:600">${esc(k.name)}</p>
            </div>`).join('')}
        </div>
    </div>` : ''}

    <!-- Footer -->
    <div style="text-align:center;padding-top:1rem;border-top:1px solid #f3f4f6;
                font-size:11px;color:#d1d5db">
        ${esc(s.projectName)} — المواصفات التقنية — ${today()}
    </div>

</div>`;

    return printWrap('التقني', s.projectName, body, accent);
}


// =====================================================
//  TEMPLATE 5 — المبسط
// =====================================================
function buildT5Minimal(s) {
    const accent = '#374151';

    const body = `
<div style="max-width:620px;margin:0 auto;padding:3rem 2rem;
            font-family:'Tajawal',sans-serif">

    <!-- Header -->
    <div style="margin-bottom:2.5rem">
        <h1 style="font-size:32px;font-weight:900;color:#111827;
                   line-height:1.2;margin-bottom:.5rem">
            ${esc(s.projectName)}
        </h1>
        <p style="font-size:15px;color:#6b7280;line-height:1.6;
                  border-right:3px solid #e5e7eb;padding-right:.75rem">
            ${esc(or(s.solution.valueProp, s.solution.statement))}
        </p>
        <p style="font-size:11px;color:#9ca3af;margin-top:.75rem">${today()}</p>
    </div>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #f3f4f6;margin-bottom:2rem">

    <!-- المشكلة -->
    <div style="margin-bottom:2rem">
        <h2 style="font-size:11px;font-weight:800;color:#9ca3af;
                   letter-spacing:.08em;text-transform:uppercase;margin-bottom:.5rem">
            المشكلة
        </h2>
        <p style="font-size:13px;color:#374151;line-height:1.8">
            ${esc(or(s.problem.statement))}
        </p>
        ${s.problem.audience ? `
        <p style="font-size:12px;color:#9ca3af;margin-top:.5rem">
            الجمهور: <strong style="color:#374151">${esc(s.problem.audience)}</strong>
        </p>` : ''}
    </div>

    <!-- الحل -->
    <div style="margin-bottom:2rem">
        <h2 style="font-size:11px;font-weight:800;color:#9ca3af;
                   letter-spacing:.08em;margin-bottom:.5rem">
            الحل
        </h2>
        <p style="font-size:13px;color:#374151;line-height:1.8">
            ${esc(or(s.solution.statement))}
        </p>
    </div>

    <!-- المميزات -->
    ${s.features.length ? `
    <div style="margin-bottom:2rem">
        <h2 style="font-size:11px;font-weight:800;color:#9ca3af;
                   letter-spacing:.08em;margin-bottom:.75rem">
            المميزات
        </h2>
        ${s.features.map(f => {
            const p = priorityLabel(f.priority);
            return `<div style="display:flex;align-items:center;gap:10px;
                                padding:8px 0;border-bottom:1px solid #f9fafb">
                <span style="width:6px;height:6px;border-radius:50%;
                             background:${p.color};flex-shrink:0"></span>
                <span style="font-size:13px;color:#374151;flex:1">${esc(f.name)}</span>
                <span style="font-size:10px;font-weight:700;color:${p.color};
                             padding:1px 8px;border-radius:999px;background:${p.bg}">
                    ${p.label}
                </span>
            </div>`;
        }).join('')}
    </div>` : ''}

    <!-- نموذج الربح -->
    <div style="margin-bottom:2rem">
        <h2 style="font-size:11px;font-weight:800;color:#9ca3af;
                   letter-spacing:.08em;margin-bottom:.5rem">
            نموذج الربح
        </h2>
        <p style="font-size:13px;color:#374151;font-weight:700">
            ${esc(or(s.business.model))}
        </p>
        ${s.business.price ? `<p style="font-size:12px;color:#6b7280;margin-top:.25rem">السعر: ${esc(s.business.price)}</p>` : ''}
        ${s.business.revenueGoal ? `<p style="font-size:12px;color:#6b7280">الهدف: ${esc(s.business.revenueGoal)}</p>` : ''}
    </div>

    <!-- التقنية -->
    ${s.tech.stack.length ? `
    <div style="margin-bottom:2rem">
        <h2 style="font-size:11px;font-weight:800;color:#9ca3af;
                   letter-spacing:.08em;margin-bottom:.5rem">
            التقنية
        </h2>
        <div>${chips(s.tech.stack, '#374151')}</div>
    </div>` : ''}

    <!-- الجدول الزمني -->
    ${s.timeline.phases.length ? `
    <div style="margin-bottom:2rem">
        <h2 style="font-size:11px;font-weight:800;color:#9ca3af;
                   letter-spacing:.08em;margin-bottom:.5rem">
            الجدول الزمني
        </h2>
        ${s.timeline.phases.map((ph, i) => `
        <div style="display:flex;align-items:center;gap:10px;
                    padding:6px 0;border-bottom:1px solid #f9fafb">
            <span style="font-size:11px;color:#9ca3af;font-weight:700;
                         width:20px;text-align:center">${i + 1}</span>
            <span style="font-size:13px;color:#374151;flex:1">${esc(ph.name)}</span>
            <span style="font-size:11px;color:#9ca3af">${esc(ph.duration)}</span>
        </div>`).join('')}
    </div>` : ''}

    <!-- Footer -->
    <hr style="border:none;border-top:1px solid #f3f4f6;margin-top:2rem;margin-bottom:1rem">
    <p style="font-size:11px;color:#d1d5db;text-align:center">
        ${esc(s.projectName)} — وثيقة MVP — ${today()}
    </p>

</div>`;

    return printWrap('المبسط', s.projectName, body, accent);
}


// ─────────────────────────────────────────────────────
//  MAIN EXPORT FUNCTION
// ─────────────────────────────────────────────────────
const BUILDERS = {
    't1-classic'  : buildT1Classic,
    't2-investor' : buildT2Investor,
    't3-pitch'    : buildT3Pitch,
    't4-technical': buildT4Technical,
    't5-minimal'  : buildT5Minimal,
};

window.exportProject = function(templateId) {
    // قراءة البيانات
    let state;
    try {
        state = JSON.parse(localStorage.getItem('fikra_project') || '{}');
    } catch(e) {
        alert('تعذّر قراءة البيانات');
        return;
    }

    if (!state.projectName) {
        alert('لا توجد بيانات للتصدير');
        return;
    }

    const builder = BUILDERS[templateId];
    if (!builder) {
        alert('القالب غير موجود');
        return;
    }

    const html = builder(state);

    // فتح تاب جديد
    const tab = window.open('', '_blank');
    if (!tab) {
        alert('يرجى السماح بالـ popups لهذا الموقع');
        return;
    }
    tab.document.open();
    tab.document.write(html);
    tab.document.close();
};

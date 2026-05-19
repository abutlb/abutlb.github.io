/**
 * FIKRA — sections/S8_Summary.js
 * ─────────────────────────────────────────────
 * القسم الثامن والأخير: الملخص التنفيذي
 *
 * المهام:
 *  - تجميع كل بيانات الـ Store وعرضها كـ Executive Summary
 *  - حساب نسبة اكتمال المشروع
 *  - تصدير الملخص بصيغ متعددة (PDF / Markdown / JSON)
 *  - عرض Readiness Score مع توصيات
 *  - Pitch Deck Preview مبسّط
 * ─────────────────────────────────────────────
 */

import Store from "../core/Store.js";
import Bus, { EVENTS } from "../core/EventBus.js";
import Toast from "../ui/ToastManager.js";


/* ─────────────────────────────────────────────────────────
   READINESS CRITERIA — معايير الجاهزية
───────────────────────────────────────────────────────── */
const READINESS_CRITERIA = [
    {
        id     : "problem",
        label  : "تعريف المشكلة",
        weight : 15,
        check  : (d) => !!(d.problem?.statement?.length >= 20),
    },
    {
        id     : "audience",
        label  : "الجمهور المستهدف",
        weight : 10,
        check  : (d) => !!(d.problem?.audience),
    },
    {
        id     : "solution",
        label  : "وصف الحل",
        weight : 15,
        check  : (d) => !!(d.solution?.statement?.length >= 20),
    },
    {
        id     : "valueProp",
        label  : "القيمة المقترحة",
        weight : 10,
        check  : (d) => !!(d.solution?.valueProp),
    },
    {
        id     : "features",
        label  : "مميزات الـ MVP",
        weight : 15,
        check  : (d) => (d.features?.items?.length ?? 0) >= 3,
    },
    {
        id     : "metrics",
        label  : "مقاييس النجاح",
        weight : 10,
        check  : (d) => !!(d.metrics?.primaryGoal) ||
                        (d.metrics?.kpis?.length ?? 0) >= 1,
    },
    {
        id     : "timeline",
        label  : "الجدول الزمني",
        weight : 10,
        check  : (d) => !!(d.timeline?.launchDate),
    },
    {
        id     : "business",
        label  : "نموذج العمل",
        weight : 10,
        check  : (d) => !!(d.business?.model),
    },
    {
        id     : "tech",
        label  : "الـ Tech Stack",
        weight : 5,
        check  : (d) => !!(d.tech?.platform),
    },
];

/* ─────────────────────────────────────────────────────────
   EXPORT FORMATS
───────────────────────────────────────────────────────── */
const EXPORT_FORMATS = [
    { id: "markdown", label: "Markdown",    icon: "fa-file-code"    },
    { id: "json",     label: "JSON",        icon: "fa-file-lines"   },
    { id: "print",    label: "طباعة / PDF", icon: "fa-file-pdf"     },
];


/* ─────────────────────────────────────────────────────────
   SECTION DEFINITION
───────────────────────────────────────────────────────── */
export default {

    key  : "summary",
    label: "الملخص",
    icon : "fa-flag-checkered",


    /* ─────────────────────────────────────────
       template
    ───────────────────────────────────────── */
    template(data = {}) {
        return `
        <div class="space-y-6">

            <!-- ── Readiness Score ──────────── -->
            <div id="readiness-card">
                <!-- تُبنى في onMount -->
            </div>

            <!-- ── Executive Summary ────────── -->
            <div id="exec-summary">
                <!-- تُبنى في onMount -->
            </div>

            <!-- ── Pitch Snapshot ───────────── -->
            <div id="pitch-snapshot">
                <!-- تُبنى في onMount -->
            </div>

            <!-- ── Export Actions ───────────── -->
            <div class="field-group">

                <label class="field-label">
                    <i class="fas fa-file-export text-brand-500"></i>
                    تصدير الملخص
                </label>

                <div class="flex flex-wrap gap-3">
                    ${EXPORT_FORMATS.map(fmt => `
                        <button
                            type="button"
                            class="export-btn"
                            data-export="${fmt.id}">
                            <i class="fas ${fmt.icon} text-sm"></i>
                            ${fmt.label}
                        </button>
                    `).join("")}
                </div>

            </div>

            <!-- ── Checklist ────────────────── -->
            <div id="checklist-card">
                <!-- تُبنى في onMount -->
            </div>

        </div>
        `;
    },


    /* ─────────────────────────────────────────
       onMount
    ───────────────────────────────────────── */
    onMount({ el }) {
        this._el   = el;
        this._data = this._collectData();

        this._renderReadiness();
        this._renderExecSummary();
        this._renderPitchSnapshot();
        this._renderChecklist();
        this._bindExportButtons();

        // إعادة البناء عند تغيير أي بيانات
        Bus.on(EVENTS.STORE_CHANGED, () => {
            this._data = this._collectData();
            this._renderReadiness();
            this._renderExecSummary();
            this._renderPitchSnapshot();
            this._renderChecklist();
        });
    },


    /* ─────────────────────────────────────────
       _collectData — تجميع كل البيانات
    ───────────────────────────────────────── */
    _collectData() {
        return {
            meta    : Store.getAll?.()?.meta     ?? {},
            problem : Store.get("problem")       ?? {},
            solution: Store.get("solution")      ?? {},
            features: Store.get("features")      ?? {},
            metrics : Store.get("metrics")       ?? {},
            timeline: Store.get("timeline")      ?? {},
            business: Store.get("business")      ?? {},
            tech    : Store.get("tech")          ?? {},
        };
    },


    /* ─────────────────────────────────────────
       _calcReadiness — حساب نسبة الجاهزية
    ───────────────────────────────────────── */
    _calcReadiness() {
        const d = this._data;
        let score = 0;

        const results = READINESS_CRITERIA.map(criterion => {
            const passed = criterion.check(d);
            if (passed) score += criterion.weight;
            return { ...criterion, passed };
        });

        return { score, results };
    },


    /* ─────────────────────────────────────────
       _renderReadiness — بطاقة نسبة الجاهزية
    ───────────────────────────────────────── */
    _renderReadiness() {
        const card = this._el.querySelector("#readiness-card");
        if (!card) return;

        const { score, results } = this._calcReadiness();

        const level = score >= 85 ? { label: "جاهز للإطلاق 🚀",  color: "green",  icon: "fa-rocket"        }
                    : score >= 65 ? { label: "قريب من الجاهزية",  color: "brand",  icon: "fa-circle-check"  }
                    : score >= 40 ? { label: "يحتاج مزيداً",      color: "yellow", icon: "fa-triangle-exclamation" }
                    :               { label: "في البداية",         color: "red",    icon: "fa-hourglass-start" };

        const passedCount = results.filter(r => r.passed).length;

        card.innerHTML = `
            <div class="readiness-card readiness-card--${level.color}">

                <!-- Header -->
                <div class="flex items-center justify-between mb-4">

                    <div>
                        <p class="text-xs font-bold text-gray-500
                                  dark:text-gray-400 mb-0.5">
                            Readiness Score
                        </p>
                        <h3 class="text-lg font-black
                                   text-gray-800 dark:text-gray-100
                                   flex items-center gap-2">
                            <i class="fas ${level.icon}
                                       text-${level.color}-500"></i>
                            ${level.label}
                        </h3>
                    </div>

                    <!-- Score Circle -->
                    <div class="score-circle score-circle--${level.color}">
                        <svg viewBox="0 0 36 36" class="score-svg">
                            <path class="score-track"
                                d="M18 2.0845
                                   a 15.9155 15.9155 0 0 1 0 31.831
                                   a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            <path class="score-fill score-fill--${level.color}"
                                stroke-dasharray="${score}, 100"
                                d="M18 2.0845
                                   a 15.9155 15.9155 0 0 1 0 31.831
                                   a 15.9155 15.9155 0 0 1 0 -31.831"/>
                        </svg>
                        <div class="score-text">
                            <span class="score-num">${score}</span>
                            <span class="score-pct">%</span>
                        </div>
                    </div>

                </div>

                <!-- Progress Bar -->
                <div class="h-2 bg-gray-100 dark:bg-gray-800
                            rounded-full overflow-hidden mb-3">
                    <div class="h-full rounded-full transition-all
                                duration-700 bg-${level.color}-500"
                         style="width: ${score}%">
                    </div>
                </div>

                <!-- Criteria Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    ${results.map(r => `
                        <div class="readiness-criterion
                                    readiness-criterion--${r.passed
                                        ? "pass" : "fail"}">
                            <i class="fas ${r.passed
                                ? "fa-circle-check text-green-500"
                                : "fa-circle-xmark text-gray-300"
                            } text-xs flex-shrink-0"></i>
                            <span class="text-xs truncate">
                                ${r.label}
                            </span>
                        </div>
                    `).join("")}
                </div>

                <!-- Summary Line -->
                <p class="text-xs text-gray-400 dark:text-gray-500
                          mt-3 text-center">
                    ${passedCount} من ${results.length} معايير مكتملة
                    ${score < 100 ? `— أكمل الأقسام الناقصة لرفع النسبة` : ""}
                </p>

            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _renderExecSummary — الملخص التنفيذي
    ───────────────────────────────────────── */
    _renderExecSummary() {
        const container = this._el.querySelector("#exec-summary");
        if (!container) return;

        const d = this._data;

        const projectName = d.meta?.projectName
            || Store.get("meta.projectName")
            || "مشروعك";

        const mustFeatures = (d.features?.items ?? [])
            .filter(f => f.priority === "must")
            .slice(0, 3);

        const topKPIs = (d.metrics?.kpis ?? []).slice(0, 3);

        const launchDate = d.timeline?.launchDate
            ? new Date(d.timeline.launchDate).toLocaleDateString("ar-SA", {
                year: "numeric", month: "long", day: "numeric",
              })
            : null;

        const phases = (d.timeline?.phases ?? []);

        container.innerHTML = `
            <div class="exec-summary-card">

                <!-- Title -->
                <div class="exec-summary-header">
                    <div class="exec-summary-icon">
                        <i class="fas fa-file-contract
                                   text-brand-500 text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-base font-black
                                   text-gray-800 dark:text-gray-100">
                            الملخص التنفيذي
                        </h2>
                        <p class="text-xs text-gray-400
                                  dark:text-gray-500">
                            ${projectName}
                        </p>
                    </div>
                </div>

                <div class="space-y-5 mt-5">

                    <!-- المشكلة -->
                    ${d.problem?.statement ? `
                        <div class="exec-section">
                            <h4 class="exec-section-title">
                                <i class="fas fa-magnifying-glass
                                           text-brand-500"></i>
                                المشكلة
                            </h4>
                            <p class="exec-section-body">
                                ${this._escape(d.problem.statement)}
                            </p>
                            ${d.problem.audience ? `
                                <p class="exec-section-meta">
                                    <i class="fas fa-users text-xs"></i>
                                    الجمهور:
                                    <strong>
                                        ${this._escape(d.problem.audience)}
                                    </strong>
                                </p>
                            ` : ""}
                            ${(d.problem.painPoints ?? []).length > 0 ? `
                                <div class="flex flex-wrap gap-1.5 mt-2">
                                    ${d.problem.painPoints.map(p => `
                                        <span class="exec-tag exec-tag--red">
                                            ${this._escape(p)}
                                        </span>
                                    `).join("")}
                                </div>
                            ` : ""}
                        </div>
                    ` : this._emptySection("المشكلة", "S1")}


                    <!-- الحل -->
                    ${d.solution?.statement ? `
                        <div class="exec-section">
                            <h4 class="exec-section-title">
                                <i class="fas fa-lightbulb
                                           text-brand-500"></i>
                                الحل
                            </h4>
                            <p class="exec-section-body">
                                ${this._escape(d.solution.statement)}
                            </p>
                            ${d.solution.valueProp ? `
                                <div class="exec-highlight">
                                    <i class="fas fa-star text-yellow-400
                                               text-xs flex-shrink-0"></i>
                                    <p class="text-xs font-bold
                                               text-gray-700 dark:text-gray-200">
                                        ${this._escape(d.solution.valueProp)}
                                    </p>
                                </div>
                            ` : ""}
                            ${d.solution.differentiation ? `
                                <p class="exec-section-meta mt-2">
                                    <i class="fas fa-trophy text-xs"></i>
                                    التميز:
                                    ${this._escape(d.solution.differentiation)}
                                </p>
                            ` : ""}
                        </div>
                    ` : this._emptySection("الحل", "S2")}


                    <!-- مميزات الـ MVP -->
                    ${mustFeatures.length > 0 ? `
                        <div class="exec-section">
                            <h4 class="exec-section-title">
                                <i class="fas fa-list-check
                                           text-brand-500"></i>
                                أبرز مميزات الـ MVP
                                <span class="text-xs text-gray-400
                                             font-normal">
                                    (${(d.features?.items ?? []).length}
                                    ميزة إجمالاً)
                                </span>
                            </h4>
                            <div class="space-y-1.5">
                                ${mustFeatures.map(f => `
                                    <div class="flex items-center gap-2">
                                        <i class="fas fa-circle-exclamation
                                                   text-red-400 text-xs
                                                   flex-shrink-0"></i>
                                        <span class="text-sm
                                                     text-gray-700
                                                     dark:text-gray-200">
                                            ${this._escape(f.name)}
                                        </span>
                                        <span class="exec-tag exec-tag--gray
                                                     mr-auto">
                                            ${f.effort === "high"
                                                ? "جهد عالٍ"
                                                : f.effort === "medium"
                                                    ? "جهد متوسط"
                                                    : "جهد منخفض"}
                                        </span>
                                    </div>
                                `).join("")}
                                ${(d.features?.items ?? []).length > 3 ? `
                                    <p class="text-xs text-gray-400
                                              dark:text-gray-500 mt-1">
                                        + ${(d.features.items.length - 3)}
                                        ميزة أخرى...
                                    </p>
                                ` : ""}
                            </div>
                        </div>
                    ` : this._emptySection("مميزات الـ MVP", "S3")}


                    <!-- المقاييس -->
                    ${d.metrics?.primaryGoal || topKPIs.length > 0 ? `
                        <div class="exec-section">
                            <h4 class="exec-section-title">
                                <i class="fas fa-chart-line
                                           text-brand-500"></i>
                                أهداف النجاح
                            </h4>
                            ${d.metrics.primaryGoal ? `
                                <div class="exec-highlight mb-2">
                                    <i class="fas fa-bullseye
                                               text-brand-500 text-xs
                                               flex-shrink-0"></i>
                                    <p class="text-xs font-bold
                                               text-gray-700
                                               dark:text-gray-200">
                                        ${this._escape(d.metrics.primaryGoal)}
                                    </p>
                                </div>
                            ` : ""}
                            ${d.metrics.northStar ? `
                                <p class="exec-section-meta">
                                    <i class="fas fa-star text-xs"></i>
                                    North Star:
                                    <strong>
                                        ${this._escape(d.metrics.northStar)}
                                    </strong>
                                </p>
                            ` : ""}
                            ${topKPIs.length > 0 ? `
                                <div class="flex flex-wrap gap-1.5 mt-2">
                                    ${topKPIs.map(k => `
                                        <span class="exec-tag exec-tag--green">
                                            ${this._escape(k.name)}:
                                            ${this._escape(k.target)}
                                            ${this._escape(k.unit)}
                                        </span>
                                    `).join("")}
                                </div>
                            ` : ""}
                        </div>
                    ` : this._emptySection("المقاييس", "S4")}


                    <!-- الجدول الزمني -->
                    ${launchDate || phases.length > 0 ? `
                        <div class="exec-section">
                            <h4 class="exec-section-title">
                                <i class="fas fa-calendar-days
                                           text-brand-500"></i>
                                الجدول الزمني
                            </h4>
                            ${launchDate ? `
                                <p class="exec-section-meta mb-2">
                                    <i class="fas fa-rocket text-xs"></i>
                                    الإطلاق المستهدف:
                                    <strong>${launchDate}</strong>
                                </p>
                            ` : ""}
                            ${phases.length > 0 ? `
                                <div class="flex flex-wrap gap-1.5">
                                    ${phases.map((ph, i) => `
                                        <span class="exec-tag
                                                     exec-tag--${ph.color
                                                         ?? "brand"}">
                                            ${i + 1}. ${this._escape(ph.name)}
                                        </span>
                                    `).join("")}
                                </div>
                            ` : ""}
                        </div>
                    ` : this._emptySection("الجدول الزمني", "S5")}


                    <!-- نموذج العمل -->
                    ${d.business?.model ? `
                        <div class="exec-section">
                            <h4 class="exec-section-title">
                                <i class="fas fa-sack-dollar
                                           text-brand-500"></i>
                                نموذج العمل
                            </h4>
                            <div class="flex flex-wrap gap-2 items-center">
                                <span class="exec-tag exec-tag--yellow">
                                    ${this._escape(d.business.model
                                        .toUpperCase())}
                                </span>
                                ${d.business.fundingStage ? `
                                    <span class="exec-tag exec-tag--gray">
                                        ${this._escape(
                                            d.business.fundingStage
                                        )}
                                    </span>
                                ` : ""}
                                ${d.business.fundingAmount ? `
                                    <span class="exec-section-meta">
                                        <i class="fas fa-coins text-xs"></i>
                                        ${this._escape(
                                            d.business.fundingAmount
                                        )}
                                    </span>
                                ` : ""}
                            </div>
                            ${(d.business.revenueStreams ?? []).length > 0 ? `
                                <div class="flex flex-wrap gap-1.5 mt-2">
                                    ${d.business.revenueStreams.map(s => `
                                        <span class="exec-tag exec-tag--green">
                                            ${this._escape(s.name)}
                                            ${s.price
                                                ? `— ${this._escape(s.price)}
                                                   ${this._escape(s.currency)}`
                                                : ""}
                                        </span>
                                    `).join("")}
                                </div>
                            ` : ""}
                        </div>
                    ` : this._emptySection("نموذج العمل", "S6")}


                    <!-- الـ Tech Stack -->
                    ${d.tech?.platform ? `
                        <div class="exec-section">
                            <h4 class="exec-section-title">
                                <i class="fas fa-microchip
                                           text-brand-500"></i>
                                الـ Tech Stack
                            </h4>
                            <p class="exec-section-meta mb-2">
                                <i class="fas fa-layer-group text-xs"></i>
                                المنصة:
                                <strong>
                                    ${this._escape(d.tech.platform)}
                                </strong>
                                ${d.tech.architecture ? `
                                    &nbsp;·&nbsp;
                                    ${this._escape(d.tech.architecture)}
                                ` : ""}
                            </p>
                            ${(d.tech.stack ?? []).length > 0 ? `
                                <div class="flex flex-wrap gap-1.5">
                                    ${d.tech.stack.slice(0, 8).map(t => `
                                        <span class="exec-tag exec-tag--blue">
                                            ${this._escape(t.name)}
                                        </span>
                                    `).join("")}
                                    ${d.tech.stack.length > 8 ? `
                                        <span class="exec-tag exec-tag--gray">
                                            +${d.tech.stack.length - 8} أخرى
                                        </span>
                                    ` : ""}
                                </div>
                            ` : ""}
                        </div>
                    ` : this._emptySection("الـ Tech Stack", "S7")}

                </div>

            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _renderPitchSnapshot — بطاقة Pitch
    ───────────────────────────────────────── */
    _renderPitchSnapshot() {
        const container = this._el.querySelector("#pitch-snapshot");
        if (!container) return;

        const d = this._data;

        const problem  = d.problem?.statement;
        const solution = d.solution?.statement;
        const value    = d.solution?.valueProp;
        const audience = d.problem?.audience;
        const model    = d.business?.model;
        const launch   = d.timeline?.launchDate;

        // لا نعرض الـ Pitch لو البيانات قليلة جداً
        const hasEnough = problem && solution;
        if (!hasEnough) {
            container.innerHTML = "";
            return;
        }

        container.innerHTML = `
            <div class="pitch-card">

                <!-- Header -->
                <div class="pitch-card-header">
                    <i class="fas fa-presentation-screen
                               text-white text-lg"></i>
                    <div>
                        <h3 class="text-sm font-black text-white">
                            Pitch Snapshot
                        </h3>
                        <p class="text-xs text-white/60">
                            ملخص في 30 ثانية
                        </p>
                    </div>
                </div>

                <!-- Pitch Body -->
                <div class="pitch-card-body">

                    <!-- One-liner -->
                    <div class="pitch-oneliner">
                        <p class="text-sm font-bold
                                   text-gray-700 dark:text-gray-200
                                   leading-relaxed">
                            ${audience
                                ? `نحن نساعد
                                   <strong class="text-brand-600
                                                  dark:text-brand-400">
                                       ${this._escape(audience)}
                                   </strong> على`
                                : "نحن نحل مشكلة"
                            }
                            ${value
                                ? `<strong class="text-brand-600
                                               dark:text-brand-400">
                                       ${this._escape(value)}
                                   </strong>`
                                : `حل المشكلة التالية`
                            }
                            ${model
                                ? `عبر نموذج
                                   <strong class="text-brand-600
                                                  dark:text-brand-400">
                                       ${this._escape(model.toUpperCase())}
                                   </strong>`
                                : ""
                            }
                        </p>
                    </div>

                    <!-- 3-Column Snapshot -->
                    <div class="grid grid-cols-3 gap-3 mt-4">

                        <!-- Problem -->
                        <div class="pitch-col">
                            <p class="pitch-col-title">
                                <i class="fas fa-magnifying-glass"></i>
                                المشكلة
                            </p>
                            <p class="pitch-col-body line-clamp-3">
                                ${this._escape(problem)}
                            </p>
                        </div>

                        <!-- Solution -->
                        <div class="pitch-col">
                            <p class="pitch-col-title">
                                <i class="fas fa-lightbulb"></i>
                                الحل
                            </p>
                            <p class="pitch-col-body line-clamp-3">
                                ${this._escape(solution)}
                            </p>
                        </div>

                        <!-- Traction / Launch -->
                        <div class="pitch-col">
                            <p class="pitch-col-title">
                                <i class="fas fa-rocket"></i>
                                الإطلاق
                            </p>
                            <p class="pitch-col-body">
                                ${launch
                                    ? new Date(launch).toLocaleDateString(
                                        "ar-SA",
                                        { year: "numeric", month: "long" }
                                      )
                                    : "لم يُحدد بعد"
                                }
                            </p>
                            ${(d.features?.items ?? []).length > 0 ? `
                                <p class="text-[10px] text-gray-400
                                          dark:text-gray-500 mt-1">
                                    ${d.features.items.length} ميزة في الـ MVP
                                </p>
                            ` : ""}
                        </div>

                    </div>

                </div>

            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _renderChecklist — قائمة المراجعة
    ───────────────────────────────────────── */
    _renderChecklist() {
        const card = this._el.querySelector("#checklist-card");
        if (!card) return;

        const { results } = this._calcReadiness();
        const failed = results.filter(r => !r.passed);

        if (failed.length === 0) {
            card.innerHTML = `
                <div class="checklist-done">
                    <i class="fas fa-party-horn text-3xl
                               text-green-400 mb-3"></i>
                    <h3 class="text-base font-black
                               text-gray-700 dark:text-gray-200 mb-1">
                        مشروعك مكتمل! 🎉
                    </h3>
                    <p class="text-sm text-gray-400 dark:text-gray-500">
                        جميع المعايير الأساسية مكتملة —
                        أنت جاهز للإطلاق
                    </p>
                </div>
            `;
            return;
        }

        card.innerHTML = `
            <div class="checklist-card">

                <p class="text-xs font-black text-gray-500
                          dark:text-gray-400 mb-3 flex items-center gap-2">
                    <i class="fas fa-clipboard-list text-brand-500"></i>
                    ما يحتاج اكتمالاً
                    <span class="text-gray-300 dark:text-gray-600
                                 font-normal">
                        (${failed.length} بند)
                    </span>
                </p>

                <div class="space-y-2">
                    ${failed.map(r => `
                        <div class="checklist-item">
                            <i class="fas fa-circle-xmark
                                       text-red-400 text-sm
                                       flex-shrink-0"></i>
                            <div class="flex-1">
                                <p class="text-sm font-bold
                                           text-gray-700 dark:text-gray-200">
                                    ${r.label}
                                </p>
                                <p class="text-xs text-gray-400
                                          dark:text-gray-500">
                                    ${this._getHint(r.id)}
                                </p>
                            </div>
                            <span class="text-xs font-bold
                                         text-brand-500">
                                +${r.weight}%
                            </span>
                        </div>
                    `).join("")}
                </div>

            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _getHint — تلميح لكل معيار ناقص
    ───────────────────────────────────────── */
    _getHint(id) {
        const hints = {
            problem   : "اكتب وصفاً للمشكلة (20 حرف على الأقل) في القسم الأول",
            audience  : "حدد جمهورك المستهدف في القسم الأول",
            solution  : "اشرح الحل بوضوح (20 حرف على الأقل) في القسم الثاني",
            valueProp : "أضف القيمة المقترحة في القسم الثاني",
            features  : "أضف 3 مميزات على الأقل للـ MVP في القسم الثالث",
            metrics   : "حدد هدفاً رئيسياً أو أضف KPI واحد في القسم الرابع",
            timeline  : "حدد تاريخ الإطلاق المستهدف في القسم الخامس",
            business  : "اختر نموذج الربح في القسم السادس",
            tech      : "حدد المنصة الرئيسية في القسم السابع",
        };
        return hints[id] ?? "أكمل هذا القسم";
    },


    /* ─────────────────────────────────────────
       _bindExportButtons — ربط أزرار التصدير
    ───────────────────────────────────────── */
    _bindExportButtons() {
        this._el.querySelectorAll("[data-export]").forEach(btn => {
            btn.addEventListener("click", () => {
                const format = btn.getAttribute("data-export");

                switch (format) {
                    case "markdown": this._exportMarkdown(); break;
                    case "json"    : this._exportJSON();     break;
                    case "print"   : this._exportPrint();    break;
                }
            });
        });
    },


    /* ─────────────────────────────────────────
       _exportMarkdown
    ───────────────────────────────────────── */
    _exportMarkdown() {
        const d    = this._data;
        const name = Store.get("meta.projectName") || "مشروعي";
        const { score } = this._calcReadiness();

        const md = [
            `# ${name} — Executive Summary`,
            `> Readiness Score: **${score}%**`,
            `> Generated by FIKRA — ${new Date().toLocaleDateString("ar-SA")}`,
            "",

            `## 🔍 المشكلة`,
            d.problem?.statement || "_لم يُحدد_",
            d.problem?.audience
                ? `\n**الجمهور:** ${d.problem.audience}` : "",
            (d.problem?.painPoints ?? []).length > 0
                ? `\n**Pain Points:** ${d.problem.painPoints.join(" · ")}`
                : "",
            "",

            `## 💡 الحل`,
            d.solution?.statement || "_لم يُحدد_",
            d.solution?.valueProp
                ? `\n**القيمة:** ${d.solution.valueProp}` : "",
            d.solution?.differentiation
                ? `\n**التميز:** ${d.solution.differentiation}` : "",
            "",

            `## ⚡ مميزات الـ MVP`,
            ...(d.features?.items ?? []).map(f =>
                `- [${f.priority === "must" ? "!" : " "}] **${f.name}**` +
                ` (${f.priority} · ${f.effort})`
            ),
            "",

            `## 📈 المقاييس`,
            d.metrics?.primaryGoal
                ? `**الهدف:** ${d.metrics.primaryGoal}` : "",
            d.metrics?.northStar
                ? `**North Star:** ${d.metrics.northStar}` : "",
            ...(d.metrics?.kpis ?? []).map(k =>
                `- ${k.name}: **${k.target} ${k.unit}**`
            ),
            "",

            `## 🗓️ الجدول الزمني`,
            d.timeline?.startDate
                ? `**البداية:** ${d.timeline.startDate}` : "",
            d.timeline?.launchDate
                ? `**الإطلاق:** ${d.timeline.launchDate}` : "",
            ...(d.timeline?.phases ?? []).map((ph, i) =>
                `${i + 1}. **${ph.name}**` +
                (ph.startDate ? ` (${ph.startDate} → ${ph.endDate})` : "")
            ),
            "",

            `## 💰 نموذج العمل`,
            d.business?.model
                ? `**النموذج:** ${d.business.model.toUpperCase()}` : "",
            d.business?.fundingStage
                ? `**التمويل:** ${d.business.fundingStage}` : "",
            ...(d.business?.revenueStreams ?? []).map(s =>
                `- ${s.name}` +
                (s.price ? `: ${s.price} ${s.currency}` : "")
            ),
            "",

            `## ⚙️ الـ Tech Stack`,
            d.tech?.platform
                ? `**المنصة:** ${d.tech.platform}` : "",
            d.tech?.architecture
                ? `**المعمارية:** ${d.tech.architecture}` : "",
            d.tech?.hosting
                ? `**الاستضافة:** ${d.tech.hosting}` : "",
            (d.tech?.stack ?? []).length > 0
                ? `**التقنيات:** ${d.tech.stack.map(t => t.name).join(", ")}`
                : "",
            "",
        ].filter(line => line !== undefined).join("\n");

        this._downloadFile(`${name}.md`, md, "text/markdown");
        Toast.success("تم تصدير الملخص بصيغة Markdown ✓");
    },


    /* ─────────────────────────────────────────
       _exportJSON
    ───────────────────────────────────────── */
    _exportJSON() {
        const name = Store.get("meta.projectName") || "مشروعي";
        const { score, results } = this._calcReadiness();

        const payload = {
            meta: {
                projectName   : name,
                exportedAt    : new Date().toISOString(),
                readinessScore: score,
                generatedBy   : "FIKRA",
            },
            data    : this._data,
            readiness: results.map(r => ({
                id    : r.id,
                label : r.label,
                passed: r.passed,
                weight: r.weight,
            })),
        };

        this._downloadFile(
            `${name}.json`,
            JSON.stringify(payload, null, 2),
            "application/json"
        );

        Toast.success("تم تصدير البيانات بصيغة JSON ✓");
    },


    /* ─────────────────────────────────────────
       _exportPrint — طباعة / PDF
    ───────────────────────────────────────── */
    _exportPrint() {
        Toast.info("جارٍ تحضير الطباعة...");

        // إضافة class للـ body يُفعّل print styles
        document.body.classList.add("print-mode");

        setTimeout(() => {
            window.print();
            document.body.classList.remove("print-mode");
        }, 300);
    },


    /* ─────────────────────────────────────────
       _downloadFile — تنزيل ملف
    ───────────────────────────────────────── */
    _downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");

        a.href     = url;
        a.download = filename;
        a.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },


    /* ─────────────────────────────────────────
       _emptySection — placeholder للأقسام الفارغة
    ───────────────────────────────────────── */
    _emptySection(label, sectionKey) {
        return `
            <div class="exec-section exec-section--empty">
                <h4 class="exec-section-title opacity-40">
                    ${label}
                </h4>
                <p class="text-xs text-gray-300 dark:text-gray-600 italic">
                    لم يُكتمل هذا القسم بعد
                </p>
            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _escape
    ───────────────────────────────────────── */
    _escape(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g,  "&amp;")
            .replace(/</g,  "&lt;")
            .replace(/>/g,  "&gt;")
            .replace(/"/g,  "&quot;")
            .replace(/'/g,  "&#39;");
    },
};

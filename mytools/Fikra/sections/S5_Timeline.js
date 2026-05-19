/**
 * FIKRA — sections/S5_Timeline.js
 * ─────────────────────────────────────────────
 * القسم الخامس: الجدول الزمني
 *
 * الحقول:
 *  - startDate   : تاريخ بداية المشروع
 *  - launchDate  : تاريخ الإطلاق المستهدف
 *  - phases[]    : المراحل
 *    - id        : معرّف فريد
 *    - name      : اسم المرحلة
 *    - startDate : بداية المرحلة
 *    - endDate   : نهاية المرحلة
 *    - color     : لون المرحلة
 *    - milestones[]: المعالم داخل المرحلة
 *  - teamSize    : حجم الفريق
 *  - workMode    : full-time / part-time / mixed
 * ─────────────────────────────────────────────
 */

import Store from "../core/Store.js";
import Toast from "../ui/ToastManager.js";


/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const PHASE_COLORS = [
    "brand", "blue", "green", "yellow", "purple", "pink", "orange",
];

const WORK_MODES = [
    { value: "",           label: "اختر نمط العمل...", disabled: true  },
    { value: "full-time",  label: "Full-time — دوام كامل"               },
    { value: "part-time",  label: "Part-time — دوام جزئي"               },
    { value: "mixed",      label: "Mixed — مزيج من الاثنين"             },
    { value: "freelance",  label: "Freelancers — مستقلون"               },
];

const MAX_PHASES     = 6;
const MAX_MILESTONES = 5;

/* ─────────────────────────────────────────────────────────
   PHASE TEMPLATES — مراحل جاهزة
───────────────────────────────────────────────────────── */
const PHASE_TEMPLATES = [
    {
        name      : "Discovery & Planning",
        durationW : 2,
        color     : "blue",
        milestones: ["تحديد المتطلبات", "تصميم الـ wireframes"],
    },
    {
        name      : "Design",
        durationW : 2,
        color     : "purple",
        milestones: ["تصميم الـ UI", "مراجعة التصميم"],
    },
    {
        name      : "Development",
        durationW : 6,
        color     : "brand",
        milestones: ["إعداد البيئة", "تطوير الـ backend", "تطوير الـ frontend"],
    },
    {
        name      : "Testing & QA",
        durationW : 2,
        color     : "yellow",
        milestones: ["اختبار الوظائف", "إصلاح الأخطاء"],
    },
    {
        name      : "Launch",
        durationW : 1,
        color     : "green",
        milestones: ["الإطلاق التجريبي", "جمع الـ feedback"],
    },
];


/* ─────────────────────────────────────────────────────────
   SECTION DEFINITION
───────────────────────────────────────────────────────── */
export default {

    key  : "timeline",
    label: "الجدول الزمني",
    icon : "fa-calendar-days",


    /* ─────────────────────────────────────────
       template
    ───────────────────────────────────────── */
    template(data = {}) {
        return `
        <div class="space-y-6">


            <!-- ── التواريخ الرئيسية ─────────── -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <!-- تاريخ البداية -->
                <div class="field-group mb-0">
                    <label class="field-label" for="tl-start-date">
                        <i class="fas fa-play text-brand-500"></i>
                        تاريخ البداية
                    </label>
                    <input
                        id="tl-start-date"
                        type="date"
                        class="fikra-input"
                        data-field="startDate"
                        value="${this._escape(data.startDate ?? "")}"
                    >
                </div>

                <!-- تاريخ الإطلاق -->
                <div class="field-group mb-0">
                    <label class="field-label" for="tl-launch-date">
                        <i class="fas fa-rocket text-brand-500"></i>
                        تاريخ الإطلاق المستهدف
                        <span class="text-red-400">*</span>
                    </label>
                    <input
                        id="tl-launch-date"
                        type="date"
                        class="fikra-input"
                        data-field="launchDate"
                        value="${this._escape(data.launchDate ?? "")}"
                    >
                    <p class="fikra-error-msg hidden"
                       data-error="launchDate"></p>
                </div>

            </div>


            <!-- ── Duration Badge (يظهر بعد اختيار التاريخين) ── -->
            <div id="duration-badge" class="hidden">
                <!-- تُبنى في onMount -->
            </div>


            <!-- ── الفريق ────────────────────── -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <!-- حجم الفريق -->
                <div class="field-group mb-0">
                    <label class="field-label" for="tl-team-size">
                        <i class="fas fa-users text-brand-500"></i>
                        حجم الفريق
                        <span class="text-xs text-gray-400 font-normal">
                            (اختياري)
                        </span>
                    </label>
                    <input
                        id="tl-team-size"
                        type="number"
                        class="fikra-input"
                        data-field="teamSize"
                        placeholder="عدد أعضاء الفريق"
                        min="1"
                        max="100"
                        value="${this._escape(data.teamSize ?? "")}"
                    >
                </div>

                <!-- نمط العمل -->
                <div class="field-group mb-0">
                    <label class="field-label" for="tl-work-mode">
                        <i class="fas fa-briefcase text-brand-500"></i>
                        نمط العمل
                        <span class="text-xs text-gray-400 font-normal">
                            (اختياري)
                        </span>
                    </label>
                    <select
                        id="tl-work-mode"
                        class="fikra-select"
                        data-field="workMode">
                        ${WORK_MODES.map(opt => `
                            <option
                                value="${opt.value}"
                                ${opt.disabled ? "disabled" : ""}
                                ${data.workMode === opt.value
                                    ? "selected" : ""}
                                ${!data.workMode && opt.disabled
                                    ? "selected" : ""}>
                                ${opt.label}
                            </option>
                        `).join("")}
                    </select>
                </div>

            </div>


            <!-- ── Gantt / Timeline Visual ───── -->
            <div id="gantt-wrap" class="hidden">
                <!-- تُبنى في onMount -->
            </div>


            <!-- ── المراحل Header ────────────── -->
            <div class="flex items-center justify-between">
                <label class="field-label mb-0">
                    <i class="fas fa-layer-group text-brand-500"></i>
                    مراحل المشروع
                    <span class="text-xs text-gray-400 font-normal ml-1">
                        (${(data.phases ?? []).length} / ${MAX_PHASES})
                    </span>
                </label>

                <!-- زر إضافة مرحلة -->
                <button
                    id="add-phase-btn"
                    type="button"
                    class="btn-sm-primary">
                    <i class="fas fa-plus text-xs"></i>
                    مرحلة جديدة
                </button>
            </div>


            <!-- ── Phases List ───────────────── -->
            <div id="phases-list" class="space-y-3">
                <!-- تُبنى في onMount -->
            </div>


            <!-- ── Phases Empty ──────────────── -->
            <div id="phases-empty"
                 class="kpis-empty-state hidden">
                <i class="fas fa-layer-group text-2xl
                           text-gray-300 dark:text-gray-600 mb-2"></i>
                <p class="text-sm text-gray-400 dark:text-gray-500">
                    لا توجد مراحل — أضف من القوالب أدناه
                </p>
            </div>


            <!-- ── Phase Templates ───────────── -->
            <div class="field-group">
                <p class="text-xs font-bold text-gray-500
                          dark:text-gray-400 mb-2 flex items-center gap-2">
                    <i class="fas fa-bolt text-yellow-400"></i>
                    قوالب جاهزة — اضغط للإضافة الفورية
                </p>
                <div id="phase-suggestions"
                     class="flex flex-wrap gap-2">
                    ${PHASE_TEMPLATES.map(t => `
                        <button
                            type="button"
                            class="suggestion-chip"
                            data-phase-name="${this._escape(t.name)}"
                            data-phase-duration="${t.durationW}"
                            data-phase-color="${t.color}"
                            data-phase-milestones="${this._escape(
                                JSON.stringify(t.milestones)
                            )}">
                            + ${this._escape(t.name)}
                        </button>
                    `).join("")}
                </div>
            </div>


        </div>
        `;
    },


    /* ─────────────────────────────────────────
       onMount
    ───────────────────────────────────────── */
    onMount({ el }) {
        this._el     = el;
        this._phases = Store.get("timeline.phases") ?? [];

        this._bindDateWatcher();
        this._renderPhases();
        this._bindAddPhase();
        this._bindSuggestions();
        this._updateDurationBadge();
        this._renderGantt();
    },


    /* ─────────────────────────────────────────
       _bindDateWatcher — مراقبة التواريخ
    ───────────────────────────────────────── */
    _bindDateWatcher() {
        const startEl  = this._el.querySelector("[data-field='startDate']");
        const launchEl = this._el.querySelector("[data-field='launchDate']");

        const onChange = () => {
            this._updateDurationBadge();
            this._renderGantt();
        };

        startEl?.addEventListener("change",  onChange);
        launchEl?.addEventListener("change", onChange);
    },


    /* ─────────────────────────────────────────
       _updateDurationBadge
    ───────────────────────────────────────── */
    _updateDurationBadge() {
        const badge    = this._el.querySelector("#duration-badge");
        if (!badge) return;

        const startVal  = Store.get("timeline.startDate")
            ?? this._el.querySelector("[data-field='startDate']")?.value;
        const launchVal = Store.get("timeline.launchDate")
            ?? this._el.querySelector("[data-field='launchDate']")?.value;

        if (!startVal || !launchVal) {
            badge.classList.add("hidden");
            return;
        }

        const start  = new Date(startVal);
        const launch = new Date(launchVal);
        const diffMs = launch - start;

        if (diffMs <= 0) {
            badge.classList.remove("hidden");
            badge.innerHTML = `
                <div class="duration-badge duration-badge--warn">
                    <i class="fas fa-triangle-exclamation"></i>
                    تاريخ الإطلاق يجب أن يكون بعد تاريخ البداية
                </div>
            `;
            return;
        }

        const days  = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const weeks = Math.ceil(days / 7);
        const months = (diffMs / (1000 * 60 * 60 * 24 * 30.44)).toFixed(1);

        // تحديد لون الـ badge بناءً على المدة
        const badgeType = weeks <= 4  ? "green"
                        : weeks <= 12 ? "brand"
                        : weeks <= 24 ? "yellow"
                        :               "red";

        badge.classList.remove("hidden");
        badge.innerHTML = `
            <div class="duration-badge duration-badge--${badgeType}">

                <div class="flex items-center gap-2">
                    <i class="fas fa-clock text-sm"></i>
                    <span class="font-black">مدة المشروع</span>
                </div>

                <div class="flex items-center gap-4 mt-2 flex-wrap">

                    <div class="duration-stat">
                        <span class="duration-stat-val">${days}</span>
                        <span class="duration-stat-label">يوم</span>
                    </div>

                    <div class="duration-stat">
                        <span class="duration-stat-val">${weeks}</span>
                        <span class="duration-stat-label">أسبوع</span>
                    </div>

                    <div class="duration-stat">
                        <span class="duration-stat-val">${months}</span>
                        <span class="duration-stat-label">شهر</span>
                    </div>

                </div>

                ${weeks > 24 ? `
                    <p class="text-xs mt-2 opacity-80">
                        <i class="fas fa-lightbulb ml-1"></i>
                        مدة طويلة — فكر في تقسيم الـ MVP لمراحل أصغر
                    </p>
                ` : ""}

            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _renderGantt — مخطط Gantt مبسّط
    ───────────────────────────────────────── */
    _renderGantt() {
        const wrap = this._el.querySelector("#gantt-wrap");
        if (!wrap) return;

        if (this._phases.length === 0) {
            wrap.classList.add("hidden");
            return;
        }

        const startVal  = Store.get("timeline.startDate")
            ?? this._el.querySelector("[data-field='startDate']")?.value;
        const launchVal = Store.get("timeline.launchDate")
            ?? this._el.querySelector("[data-field='launchDate']")?.value;

        // نحتاج على الأقل تاريخ بداية أو إطلاق لرسم الـ Gantt
        const projectStart = startVal
            ? new Date(startVal)
            : new Date();

        const projectEnd = launchVal
            ? new Date(launchVal)
            : new Date(projectStart.getTime() +
                this._phases.reduce((s, p) => {
                    const d = p.endDate && p.startDate
                        ? new Date(p.endDate) - new Date(p.startDate)
                        : 7 * 24 * 60 * 60 * 1000;
                    return s + d;
                }, 0));

        const totalMs = projectEnd - projectStart;
        if (totalMs <= 0) {
            wrap.classList.add("hidden");
            return;
        }

        wrap.classList.remove("hidden");

        wrap.innerHTML = `
            <div class="gantt-container">

                <p class="text-xs font-black text-gray-500
                          dark:text-gray-400 mb-3 flex items-center gap-2">
                    <i class="fas fa-chart-gantt text-brand-500"></i>
                    مخطط Gantt
                </p>

                <div class="gantt-chart">
                    ${this._phases.map(phase => {

                        const phaseStart = phase.startDate
                            ? new Date(phase.startDate)
                            : projectStart;
                        const phaseEnd   = phase.endDate
                            ? new Date(phase.endDate)
                            : new Date(phaseStart.getTime() +
                                7 * 24 * 60 * 60 * 1000);

                        const left  = Math.max(0,
                            ((phaseStart - projectStart) / totalMs) * 100
                        );
                        const width = Math.min(100 - left,
                            ((phaseEnd - phaseStart) / totalMs) * 100
                        );

                        return `
                        <div class="gantt-row">

                            <!-- Phase Name -->
                            <div class="gantt-label">
                                <span class="gantt-color-dot
                                             bg-${phase.color ?? "brand"}-500">
                                </span>
                                <span class="truncate text-xs
                                             text-gray-600 dark:text-gray-300">
                                    ${this._escape(phase.name)}
                                </span>
                            </div>

                            <!-- Bar Track -->
                            <div class="gantt-track">
                                <div
                                    class="gantt-bar bg-${phase.color ?? "brand"}-500"
                                    style="left: ${left.toFixed(1)}%;
                                           width: ${Math.max(width, 3).toFixed(1)}%"
                                    title="${this._escape(phase.name)}
${phase.startDate ?? "—"} → ${phase.endDate ?? "—"}">
                                </div>

                                <!-- Milestones dots -->
                                ${(phase.milestones ?? []).map((m, mi) => {
                                    const dotPos = left +
                                        (width * ((mi + 1) /
                                        (phase.milestones.length + 1)));
                                    return `
                                        <div class="gantt-milestone"
                                             style="left: ${dotPos.toFixed(1)}%"
                                             title="${this._escape(m)}">
                                        </div>
                                    `;
                                }).join("")}
                            </div>

                        </div>
                        `;
                    }).join("")}
                </div>

                <!-- Legend -->
                <div class="flex items-center gap-4 mt-3 flex-wrap">
                    <div class="flex items-center gap-1.5 text-xs
                                text-gray-400 dark:text-gray-500">
                        <div class="w-3 h-3 rounded-sm bg-brand-500"></div>
                        مرحلة
                    </div>
                    <div class="flex items-center gap-1.5 text-xs
                                text-gray-400 dark:text-gray-500">
                        <div class="w-2 h-2 rounded-full bg-white
                                    border-2 border-gray-400"></div>
                        معلم
                    </div>
                </div>

            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _renderPhases — عرض المراحل
    ───────────────────────────────────────── */
    _renderPhases() {
        const listEl  = this._el.querySelector("#phases-list");
        const emptyEl = this._el.querySelector("#phases-empty");
        const header  = this._el.querySelector("#add-phase-btn")
            ?.closest(".flex")
            ?.querySelector(".field-label");

        if (!listEl) return;

        // تحديث العداد في الـ header
        if (header) {
            header.querySelector("span").textContent =
                `(${this._phases.length} / ${MAX_PHASES})`;
        }

        if (this._phases.length === 0) {
            listEl.classList.add("hidden");
            emptyEl?.classList.remove("hidden");
            this._renderGantt();
            return;
        }

        listEl.classList.remove("hidden");
        emptyEl?.classList.add("hidden");

        listEl.innerHTML = this._phases.map((phase, idx) => `
            <div class="phase-card"
                 data-phase-id="${phase.id}">

                <!-- Phase Header -->
                <div class="phase-card-header">

                    <!-- Color Dot + Name -->
                    <div class="flex items-center gap-2 flex-1 min-w-0">

                        <!-- Color Picker -->
                        <div class="phase-color-picker"
                             data-phase-id="${phase.id}">
                            <div class="w-4 h-4 rounded-full flex-shrink-0
                                        bg-${phase.color ?? "brand"}-500
                                        cursor-pointer ring-2 ring-offset-1
                                        ring-${phase.color ?? "brand"}-300"
                                 title="تغيير اللون">
                            </div>
                        </div>

                        <!-- Name (inline edit) -->
                        <p class="phase-name font-black text-sm
                                   text-gray-700 dark:text-gray-200
                                   flex-1 min-w-0"
                           contenteditable="true"
                           data-phase-id="${phase.id}"
                           data-phase-field="name"
                           spellcheck="false">
                            ${this._escape(phase.name)}
                        </p>

                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 flex-shrink-0">

                        <!-- Toggle collapse -->
                        <button type="button"
                            class="feat-action-btn"
                            data-phase-id="${phase.id}"
                            data-action="toggle-phase"
                            title="طيّ / توسيع">
                            <i class="fas fa-chevron-down text-xs
                                       transition-transform
                                       ${phase._collapsed
                                           ? "-rotate-90" : ""}">
                            </i>
                        </button>

                        <!-- Delete -->
                        <button type="button"
                            class="feat-action-btn feat-action-btn--danger"
                            data-phase-id="${phase.id}"
                            data-action="delete-phase"
                            title="حذف المرحلة">
                            <i class="fas fa-trash text-xs"></i>
                        </button>

                    </div>

                </div>


                <!-- Phase Body (collapsible) -->
                <div class="phase-card-body
                            ${phase._collapsed ? "hidden" : ""}">

                    <!-- التواريخ -->
                    <div class="grid grid-cols-2 gap-3 mb-3">

                        <div>
                            <label class="text-xs text-gray-400
                                          dark:text-gray-500 mb-1 block">
                                تاريخ البداية
                            </label>
                            <input
                                type="date"
                                class="fikra-input text-xs"
                                data-phase-id="${phase.id}"
                                data-phase-field="startDate"
                                value="${this._escape(phase.startDate ?? "")}"
                            >
                        </div>

                        <div>
                            <label class="text-xs text-gray-400
                                          dark:text-gray-500 mb-1 block">
                                تاريخ الانتهاء
                            </label>
                            <input
                                type="date"
                                class="fikra-input text-xs"
                                data-phase-id="${phase.id}"
                                data-phase-field="endDate"
                                value="${this._escape(phase.endDate ?? "")}"
                            >
                        </div>

                    </div>

                    <!-- المعالم -->
                    <div class="milestones-section">

                        <p class="text-xs font-bold text-gray-500
                                  dark:text-gray-400 mb-2
                                  flex items-center gap-1.5">
                            <i class="fas fa-flag text-brand-400 text-[10px]"></i>
                            المعالم
                            <span class="text-gray-300 dark:text-gray-600">
                                (${(phase.milestones ?? []).length}
                                / ${MAX_MILESTONES})
                            </span>
                        </p>

                        <!-- Milestones List -->
                        <div class="space-y-1.5 mb-2"
                             id="milestones-${phase.id}">
                            ${(phase.milestones ?? []).map((m, mi) => `
                                <div class="milestone-item">
                                    <i class="fas fa-circle-dot
                                               text-${phase.color ?? "brand"}-400
                                               text-[10px] flex-shrink-0 mt-0.5">
                                    </i>
                                    <span class="text-xs text-gray-600
                                                 dark:text-gray-300 flex-1"
                                          contenteditable="true"
                                          data-phase-id="${phase.id}"
                                          data-milestone-idx="${mi}"
                                          spellcheck="false">
                                        ${this._escape(m)}
                                    </span>
                                    <button type="button"
                                        class="text-gray-300 dark:text-gray-600
                                               hover:text-red-400 transition
                                               flex-shrink-0"
                                        data-phase-id="${phase.id}"
                                        data-milestone-idx="${mi}"
                                        data-action="delete-milestone">
                                        <i class="fas fa-xmark text-[10px]"></i>
                                    </button>
                                </div>
                            `).join("")}
                        </div>

                        <!-- Add Milestone -->
                        ${(phase.milestones ?? []).length < MAX_MILESTONES ? `
                            <div class="flex gap-2">
                                <input
                                    type="text"
                                    class="fikra-input flex-1 text-xs"
                                    id="milestone-input-${phase.id}"
                                    placeholder="أضف معلماً..."
                                    maxlength="80"
                                >
                                <button type="button"
                                    class="btn-icon"
                                    data-phase-id="${phase.id}"
                                    data-action="add-milestone">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                        ` : `
                            <p class="text-xs text-gray-400
                                      dark:text-gray-500 italic">
                                وصلت للحد الأقصى من المعالم
                            </p>
                        `}

                    </div>

                </div>

            </div>
        `).join("");

        this._bindPhaseEvents(listEl);
        this._updateSuggestions();
        this._renderGantt();
    },


    /* ─────────────────────────────────────────
       _bindPhaseEvents
    ───────────────────────────────────────── */
    _bindPhaseEvents(listEl) {

        // ── Inline edit (phase name) ──────────
        listEl.querySelectorAll("[data-phase-field='name']").forEach(el => {
            const id = el.getAttribute("data-phase-id");
            el.addEventListener("blur", () => {
                const val = el.textContent.trim();
                if (!val) return;
                this._updatePhase(id, { name: val });
            });
            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    el.blur();
                }
            });
        });

        // ── Date inputs ───────────────────────
        listEl.querySelectorAll(
            "[data-phase-field='startDate'], [data-phase-field='endDate']"
        ).forEach(inp => {
            const id    = inp.getAttribute("data-phase-id");
            const field = inp.getAttribute("data-phase-field");
            inp.addEventListener("change", () => {
                this._updatePhase(id, { [field]: inp.value });
            });
        });

        // ── Action buttons ────────────────────
        listEl.querySelectorAll("[data-action]").forEach(btn => {
            btn.addEventListener("click", () => {
                const action  = btn.getAttribute("data-action");
                const phaseId = btn.getAttribute("data-phase-id");

                switch (action) {

                    case "toggle-phase": {
                        const phase = this._phases.find(p => p.id === phaseId);
                        if (phase) {
                            phase._collapsed = !phase._collapsed;
                            this._renderPhases();
                        }
                        break;
                    }

                    case "delete-phase": {
                        const phase = this._phases.find(p => p.id === phaseId);
                        this._phases = this._phases.filter(
                            p => p.id !== phaseId
                        );
                        this._save();
                        this._renderPhases();
                        Toast.success(
                            `تم حذف مرحلة "${phase?.name ?? ""}"`
                        );
                        break;
                    }

                    case "add-milestone": {
                        const input = this._el.querySelector(
                            `#milestone-input-${phaseId}`
                        );
                        const val = input?.value.trim();
                        if (!val) return;

                        const phase = this._phases.find(p => p.id === phaseId);
                        if (!phase) return;

                        phase.milestones = phase.milestones ?? [];
                        if (phase.milestones.length >= MAX_MILESTONES) {
                            Toast.warning("الحد الأقصى 5 معالم لكل مرحلة");
                            return;
                        }

                        phase.milestones.push(val);
                        this._save();
                        this._renderPhases();
                        break;
                    }

                    case "delete-milestone": {
                        const mi    = parseInt(
                            btn.getAttribute("data-milestone-idx")
                        );
                        const phase = this._phases.find(p => p.id === phaseId);
                        if (!phase) return;

                        phase.milestones.splice(mi, 1);
                        this._save();
                        this._renderPhases();
                        break;
                    }
                }
            });
        });

        // ── Milestone inline edit ─────────────
        listEl.querySelectorAll("[data-milestone-idx]").forEach(el => {
            if (!el.hasAttribute("contenteditable")) return;
            const phaseId = el.getAttribute("data-phase-id");
            const mi      = parseInt(el.getAttribute("data-milestone-idx"));

            el.addEventListener("blur", () => {
                const val   = el.textContent.trim();
                const phase = this._phases.find(p => p.id === phaseId);
                if (!phase || !val) return;
                phase.milestones[mi] = val;
                this._save();
            });

            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    el.blur();
                }
            });
        });

        // ── Color picker ──────────────────────
        listEl.querySelectorAll(".phase-color-picker").forEach(picker => {
            picker.addEventListener("click", () => {
                const id    = picker.getAttribute("data-phase-id");
                const phase = this._phases.find(p => p.id === id);
                if (!phase) return;

                const current = PHASE_COLORS.indexOf(phase.color ?? "brand");
                const next    = PHASE_COLORS[(current + 1) % PHASE_COLORS.length];

                this._updatePhase(id, { color: next });
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindAddPhase
    ───────────────────────────────────────── */
    _bindAddPhase() {
        const btn = this._el.querySelector("#add-phase-btn");
        if (!btn) return;

        btn.addEventListener("click", () => {
            if (this._phases.length >= MAX_PHASES) {
                Toast.warning(`الحد الأقصى ${MAX_PHASES} مراحل`);
                return;
            }

            this._addPhase({
                name      : `مرحلة ${this._phases.length + 1}`,
                color     : PHASE_COLORS[this._phases.length % PHASE_COLORS.length],
                milestones: [],
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindSuggestions
    ───────────────────────────────────────── */
    _bindSuggestions() {
        const container = this._el.querySelector("#phase-suggestions");
        if (!container) return;

        container.querySelectorAll("[data-phase-name]").forEach(btn => {
            btn.addEventListener("click", () => {
                const name       = btn.getAttribute("data-phase-name");
                const durationW  = parseInt(
                    btn.getAttribute("data-phase-duration") ?? "1"
                );
                const color      = btn.getAttribute("data-phase-color");
                const milestones = JSON.parse(
                    btn.getAttribute("data-phase-milestones") ?? "[]"
                );

                if (this._phases.length >= MAX_PHASES) {
                    Toast.warning(`الحد الأقصى ${MAX_PHASES} مراحل`);
                    return;
                }

                if (this._phases.some(p => p.name === name)) {
                    Toast.warning(`"${name}" موجودة بالفعل`);
                    return;
                }

                // حساب التواريخ تلقائياً
                const { startDate, endDate } =
                    this._calcPhaseDates(durationW);

                this._addPhase({
                    name, color, milestones, startDate, endDate,
                });

                Toast.success(`تمت إضافة مرحلة "${name}"`);
            });
        });
    },


    /* ─────────────────────────────────────────
       _calcPhaseDates — حساب تواريخ المرحلة
    ───────────────────────────────────────── */
    _calcPhaseDates(durationWeeks) {
        // آخر مرحلة موجودة
        const last = this._phases[this._phases.length - 1];

        const startDate = last?.endDate
            ? last.endDate
            : Store.get("timeline.startDate")
              ?? new Date().toISOString().split("T")[0];

        const start  = new Date(startDate);
        const end    = new Date(
            start.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000
        );

        return {
            startDate: start.toISOString().split("T")[0],
            endDate  : end.toISOString().split("T")[0],
        };
    },


    /* ─────────────────────────────────────────
       _updateSuggestions
    ───────────────────────────────────────── */
    _updateSuggestions() {
        const container = this._el?.querySelector("#phase-suggestions");
        if (!container) return;

        const names = this._phases.map(p => p.name);

        container.querySelectorAll("[data-phase-name]").forEach(btn => {
            const name    = btn.getAttribute("data-phase-name");
            const isAdded = names.includes(name);
            btn.classList.toggle("suggestion-chip--active", isAdded);
            btn.textContent = isAdded ? `✓ ${name}` : `+ ${name}`;
            btn.disabled    = isAdded;
        });
    },


    /* ─────────────────────────────────────────
       _addPhase
    ───────────────────────────────────────── */
    _addPhase(phase) {
        this._phases.push({
            id        : `phase_${Date.now()}_${Math.random()
                          .toString(36).slice(2, 7)}`,
            name      : phase.name       ?? "مرحلة جديدة",
            color     : phase.color      ?? "brand",
            startDate : phase.startDate  ?? "",
            endDate   : phase.endDate    ?? "",
            milestones: phase.milestones ?? [],
            _collapsed: false,
        });

        this._save();
        this._renderPhases();
    },


    /* ─────────────────────────────────────────
       _updatePhase
    ───────────────────────────────────────── */
    _updatePhase(id, changes) {
        const idx = this._phases.findIndex(p => p.id === id);
        if (idx < 0) return;
        this._phases[idx] = { ...this._phases[idx], ...changes };
        this._save();
        this._renderPhases();
    },


    /* ─────────────────────────────────────────
       _save
    ───────────────────────────────────────── */
    _save() {
        Store.set("timeline.phases", [...this._phases]);
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

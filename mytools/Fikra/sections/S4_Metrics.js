/**
 * FIKRA — sections/S4_Metrics.js
 * ─────────────────────────────────────────────
 * القسم الرابع: المقاييس وأهداف النجاح
 *
 * الحقول:
 *  - primaryGoal  : الهدف الرئيسي من الـ MVP
 *  - successDate  : تاريخ قياس النجاح
 *  - kpis[]       : مؤشرات الأداء الرئيسية
 *    - id         : معرّف فريد
 *    - name       : اسم المقياس
 *    - target     : الهدف الرقمي
 *    - unit       : الوحدة (مستخدم / ريال / %)
 *    - current    : القيمة الحالية
 *    - category   : growth / revenue / engagement / quality
 *  - northStar    : مقياس النجم الشمالي
 * ─────────────────────────────────────────────
 */

import Store from "../core/Store.js";
import Toast from "../ui/ToastManager.js";


/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const KPI_CATEGORIES = {
    growth     : { label: "نمو",        icon: "fa-arrow-trend-up",  color: "green"  },
    revenue    : { label: "إيرادات",    icon: "fa-dollar-sign",     color: "yellow" },
    engagement : { label: "تفاعل",      icon: "fa-heart",           color: "pink"   },
    quality    : { label: "جودة",       icon: "fa-star",            color: "blue"   },
};

const UNITS = [
    "مستخدم", "عميل", "ريال", "دولار", "%",
    "تقييم", "طلب", "تنزيل", "زيارة", "أخرى",
];

const MAX_KPIS = 8;

/* ─────────────────────────────────────────────────────────
   KPI TEMPLATES — اقتراحات جاهزة
───────────────────────────────────────────────────────── */
const KPI_TEMPLATES = [
    {
        name    : "عدد المستخدمين النشطين",
        target  : "1000",
        unit    : "مستخدم",
        category: "growth",
    },
    {
        name    : "معدل الاحتفاظ الشهري",
        target  : "40",
        unit    : "%",
        category: "engagement",
    },
    {
        name    : "الإيراد الشهري المتكرر",
        target  : "10000",
        unit    : "ريال",
        category: "revenue",
    },
    {
        name    : "تقييم المستخدمين",
        target  : "4.5",
        unit    : "تقييم",
        category: "quality",
    },
    {
        name    : "معدل التحويل",
        target  : "5",
        unit    : "%",
        category: "growth",
    },
    {
        name    : "عدد التنزيلات",
        target  : "5000",
        unit    : "تنزيل",
        category: "growth",
    },
];

/* ─────────────────────────────────────────────────────────
   PRIMARY GOAL EXAMPLES
───────────────────────────────────────────────────────── */
const GOAL_EXAMPLES = [
    "التحقق من وجود طلب حقيقي على المنتج",
    "الوصول لأول 100 مستخدم مدفوع",
    "إثبات أن المستخدمين يعودون أسبوعياً",
    "تحقيق أول 10,000 ريال إيراد",
];


/* ─────────────────────────────────────────────────────────
   SECTION DEFINITION
───────────────────────────────────────────────────────── */
export default {

    key  : "metrics",
    label: "المقاييس",
    icon : "fa-chart-line",


    /* ─────────────────────────────────────────
       template
    ───────────────────────────────────────── */
    template(data = {}) {
        return `
        <div class="space-y-6">


            <!-- ── الهدف الرئيسي ────────────── -->
            <div class="field-group">

                <label class="field-label" for="metrics-primary-goal">
                    <i class="fas fa-bullseye text-brand-500"></i>
                    ما هدفك الرئيسي من الـ MVP؟
                    <span class="text-red-400">*</span>
                </label>

                <input
                    id="metrics-primary-goal"
                    type="text"
                    class="fikra-input"
                    data-field="primaryGoal"
                    placeholder="مثال: التحقق من وجود طلب حقيقي على المنتج"
                    value="${this._escape(data.primaryGoal ?? "")}"
                    maxlength="150"
                >

                <p class="fikra-error-msg hidden"
                   data-error="primaryGoal"></p>

                <!-- أمثلة -->
                <div class="mt-2 flex flex-wrap gap-2"
                     id="goal-examples">
                    ${GOAL_EXAMPLES.map(ex => `
                        <button
                            type="button"
                            class="example-pill"
                            data-example="${this._escape(ex)}">
                            ${ex}
                        </button>
                    `).join("")}
                </div>

            </div>


            <!-- ── النجم الشمالي ─────────────── -->
            <div class="field-group">

                <label class="field-label" for="metrics-north-star">
                    <i class="fas fa-star text-brand-500"></i>
                    مقياس النجم الشمالي
                    <span class="text-xs text-gray-400 font-normal">
                        (North Star Metric)
                    </span>
                </label>

                <input
                    id="metrics-north-star"
                    type="text"
                    class="fikra-input"
                    data-field="northStar"
                    placeholder="مثال: عدد المشاريع المكتملة أسبوعياً"
                    value="${this._escape(data.northStar ?? "")}"
                    maxlength="120"
                >

                <p class="field-hint">
                    <i class="fas fa-circle-info text-blue-400"></i>
                    المقياس الواحد الذي يعكس قيمة منتجك بشكل أفضل من أي مقياس آخر
                </p>

            </div>


            <!-- ── تاريخ قياس النجاح ──────────── -->
            <div class="field-group">

                <label class="field-label" for="metrics-success-date">
                    <i class="fas fa-calendar-check text-brand-500"></i>
                    متى ستقيس النجاح؟
                    <span class="text-xs text-gray-400 font-normal">
                        (اختياري)
                    </span>
                </label>

                <input
                    id="metrics-success-date"
                    type="date"
                    class="fikra-input"
                    data-field="successDate"
                    value="${this._escape(data.successDate ?? "")}"
                >

            </div>


            <!-- ── KPIs Header ───────────────── -->
            <div class="flex items-center justify-between">
                <label class="field-label mb-0">
                    <i class="fas fa-gauge-high text-brand-500"></i>
                    مؤشرات الأداء الرئيسية (KPIs)
                    <span class="text-xs text-gray-400 font-normal">
                        (اختياري)
                    </span>
                </label>

                <!-- فلتر الفئات -->
                <div class="flex gap-1.5" id="kpi-filter">
                    <button type="button"
                        class="kpi-filter-btn kpi-filter-btn--active"
                        data-kpi-filter="all">
                        الكل
                    </button>
                    ${Object.entries(KPI_CATEGORIES).map(([key, cat]) => `
                        <button type="button"
                            class="kpi-filter-btn"
                            data-kpi-filter="${key}">
                            <i class="fas ${cat.icon} text-[10px]"></i>
                        </button>
                    `).join("")}
                </div>
            </div>


            <!-- ── KPIs Stats ────────────────── -->
            <div id="kpis-stats" class="hidden">
                <!-- تُبنى في onMount لو في KPIs -->
            </div>


            <!-- ── KPIs List ─────────────────── -->
            <div id="kpis-list" class="space-y-3">
                <!-- تُبنى في onMount -->
            </div>


            <!-- ── KPI Empty State ───────────── -->
            <div id="kpis-empty"
                 class="kpis-empty-state hidden">
                <i class="fas fa-chart-bar text-2xl
                           text-gray-300 dark:text-gray-600 mb-2"></i>
                <p class="text-sm text-gray-400 dark:text-gray-500">
                    لا توجد مقاييس — أضف من الاقتراحات أدناه
                </p>
            </div>


            <!-- ── Add KPI Form ──────────────── -->
            <div class="add-feature-form" id="add-kpi-form">

                <p class="text-xs font-black text-gray-500
                          dark:text-gray-400 mb-3 flex items-center gap-2">
                    <i class="fas fa-plus-circle text-brand-500"></i>
                    إضافة مقياس جديد
                </p>

                <div class="grid grid-cols-2 gap-3 mb-3">

                    <!-- اسم المقياس -->
                    <input
                        id="kpi-name"
                        type="text"
                        class="fikra-input col-span-2"
                        placeholder="اسم المقياس..."
                        maxlength="80"
                    >

                    <!-- الهدف -->
                    <input
                        id="kpi-target"
                        type="text"
                        class="fikra-input"
                        placeholder="الهدف الرقمي..."
                        maxlength="30"
                    >

                    <!-- الوحدة -->
                    <select id="kpi-unit" class="fikra-select">
                        ${UNITS.map(u => `
                            <option value="${u}">${u}</option>
                        `).join("")}
                    </select>

                    <!-- الفئة -->
                    <select id="kpi-category" class="fikra-select col-span-2">
                        ${Object.entries(KPI_CATEGORIES).map(([key, cat]) => `
                            <option value="${key}">
                                ${cat.label}
                            </option>
                        `).join("")}
                    </select>

                </div>

                <button
                    id="kpi-add-btn"
                    type="button"
                    class="btn-primary w-full">
                    <i class="fas fa-plus text-sm"></i>
                    إضافة المقياس
                </button>

            </div>


            <!-- ── KPI Templates ─────────────── -->
            <div class="field-group">
                <p class="text-xs font-bold text-gray-500
                          dark:text-gray-400 mb-2 flex items-center gap-2">
                    <i class="fas fa-bolt text-yellow-400"></i>
                    مقاييس شائعة — اضغط للإضافة الفورية
                </p>
                <div id="kpi-suggestions"
                     class="flex flex-wrap gap-2">
                    ${KPI_TEMPLATES.map(t => `
                        <button
                            type="button"
                            class="suggestion-chip"
                            data-kpi-name="${this._escape(t.name)}"
                            data-kpi-target="${t.target}"
                            data-kpi-unit="${t.unit}"
                            data-kpi-category="${t.category}">
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
        this._kpis   = Store.get("metrics.kpis") ?? [];
        this._filter = "all";

        this._initGoalExamples();
        this._renderKPIs();
        this._bindAddForm();
        this._bindSuggestions();
        this._bindKPIFilter();
    },


    /* ─────────────────────────────────────────
       _initGoalExamples
    ───────────────────────────────────────── */
    _initGoalExamples() {
        const container = this._el.querySelector("#goal-examples");
        const input     = this._el.querySelector("[data-field='primaryGoal']");
        if (!container || !input) return;

        container.querySelectorAll("[data-example]").forEach(btn => {
            btn.addEventListener("click", () => {
                input.value = btn.getAttribute("data-example");
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.focus();

                container.querySelectorAll("[data-example]").forEach(b => {
                    b.classList.toggle("example-pill--active", b === btn);
                });
            });
        });

        // تعليم المثال الحالي
        const current = Store.get("metrics.primaryGoal") ?? "";
        container.querySelectorAll("[data-example]").forEach(btn => {
            if (btn.getAttribute("data-example") === current) {
                btn.classList.add("example-pill--active");
            }
        });
    },


    /* ─────────────────────────────────────────
       _renderKPIs — عرض قائمة الـ KPIs
    ───────────────────────────────────────── */
    _renderKPIs() {
        this._renderKPIStats();
        this._renderKPIList();
        this._updateSuggestions();
    },


    /* ─────────────────────────────────────────
       _renderKPIStats
    ───────────────────────────────────────── */
    _renderKPIStats() {
        const statsEl = this._el.querySelector("#kpis-stats");
        if (!statsEl) return;

        if (this._kpis.length === 0) {
            statsEl.classList.add("hidden");
            return;
        }

        statsEl.classList.remove("hidden");

        const byCategory = Object.keys(KPI_CATEGORIES).map(cat => ({
            cat,
            count: this._kpis.filter(k => k.category === cat).length,
        })).filter(c => c.count > 0);

        statsEl.innerHTML = `
            <div class="flex flex-wrap gap-2 p-3
                        bg-gray-50 dark:bg-gray-800/50
                        rounded-xl border border-gray-100
                        dark:border-gray-800">

                <span class="text-xs font-bold text-gray-500
                             dark:text-gray-400 flex items-center gap-1">
                    <i class="fas fa-layer-group text-brand-500"></i>
                    ${this._kpis.length} مقياس
                </span>

                <span class="text-gray-200 dark:text-gray-700">|</span>

                ${byCategory.map(({ cat, count }) => `
                    <span class="text-xs font-medium
                                 text-${KPI_CATEGORIES[cat].color}-500
                                 flex items-center gap-1">
                        <i class="fas ${KPI_CATEGORIES[cat].icon}
                                   text-[10px]"></i>
                        ${KPI_CATEGORIES[cat].label}: ${count}
                    </span>
                `).join(`
                    <span class="text-gray-200 dark:text-gray-700">·</span>
                `)}

            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _renderKPIList
    ───────────────────────────────────────── */
    _renderKPIList() {
        const listEl  = this._el.querySelector("#kpis-list");
        const emptyEl = this._el.querySelector("#kpis-empty");
        if (!listEl) return;

        // فلترة
        const filtered = this._filter === "all"
            ? this._kpis
            : this._kpis.filter(k => k.category === this._filter);

        if (this._kpis.length === 0) {
            listEl.classList.add("hidden");
            emptyEl?.classList.remove("hidden");
            return;
        }

        listEl.classList.remove("hidden");
        emptyEl?.classList.add("hidden");

        listEl.innerHTML = filtered.map(kpi => {

            const cat      = KPI_CATEGORIES[kpi.category] ?? KPI_CATEGORIES.growth;
            const progress = this._calcProgress(kpi);

            return `
            <div class="kpi-card" data-kpi-id="${kpi.id}">

                <!-- Category Badge -->
                <div class="kpi-category-badge
                            kpi-category-badge--${cat.color}">
                    <i class="fas ${cat.icon} text-[10px]"></i>
                    ${cat.label}
                </div>

                <!-- KPI Content -->
                <div class="flex items-start gap-3 mt-2">

                    <!-- Info -->
                    <div class="flex-1 min-w-0">

                        <!-- Name (inline edit) -->
                        <p class="kpi-name"
                           contenteditable="true"
                           data-kpi-id="${kpi.id}"
                           data-kpi-field="name"
                           spellcheck="false">
                            ${this._escape(kpi.name)}
                        </p>

                        <!-- Target + Unit -->
                        <div class="flex items-center gap-2 mt-1.5
                                    flex-wrap">

                            <span class="text-xs text-gray-400
                                         dark:text-gray-500">
                                الهدف:
                            </span>

                            <!-- Target (inline edit) -->
                            <span class="kpi-target-val"
                                  contenteditable="true"
                                  data-kpi-id="${kpi.id}"
                                  data-kpi-field="target"
                                  spellcheck="false">
                                ${this._escape(kpi.target)}
                            </span>

                            <span class="text-xs font-bold
                                         text-brand-600 dark:text-brand-400">
                                ${this._escape(kpi.unit)}
                            </span>

                            <!-- Current value -->
                            <span class="text-xs text-gray-400
                                         dark:text-gray-500 mr-2">
                                الحالي:
                            </span>
                            <input
                                type="text"
                                class="kpi-current-input"
                                data-kpi-id="${kpi.id}"
                                data-kpi-field="current"
                                value="${this._escape(kpi.current ?? "0")}"
                                placeholder="0"
                                maxlength="20"
                            >
                            <span class="text-xs text-gray-400
                                         dark:text-gray-500">
                                ${this._escape(kpi.unit)}
                            </span>

                        </div>

                        <!-- Progress Bar -->
                        ${progress !== null ? `
                            <div class="mt-2">
                                <div class="flex justify-between
                                            text-[10px] text-gray-400
                                            dark:text-gray-500 mb-1">
                                    <span>التقدم</span>
                                    <span>${progress}%</span>
                                </div>
                                <div class="h-1 bg-gray-100
                                            dark:bg-gray-800 rounded-full
                                            overflow-hidden">
                                    <div class="h-full rounded-full
                                                transition-all duration-500
                                                bg-${cat.color}-400"
                                         style="width: ${Math.min(progress, 100)}%">
                                    </div>
                                </div>
                            </div>
                        ` : ""}

                    </div>

                    <!-- Delete -->
                    <button
                        type="button"
                        class="feat-action-btn feat-action-btn--danger
                               flex-shrink-0 mt-1"
                        data-kpi-id="${kpi.id}"
                        data-action="delete-kpi"
                        title="حذف المقياس">
                        <i class="fas fa-trash text-xs"></i>
                    </button>

                </div>

            </div>
            `;
        }).join("");

        this._bindKPIListEvents(listEl);
    },


    /* ─────────────────────────────────────────
       _bindKPIListEvents
    ───────────────────────────────────────── */
    _bindKPIListEvents(listEl) {

        // ── Inline edit ───────────────────────
        listEl.querySelectorAll("[contenteditable]").forEach(el => {
            const id    = el.getAttribute("data-kpi-id");
            const field = el.getAttribute("data-kpi-field");

            el.addEventListener("blur", () => {
                const val = el.textContent.trim();
                if (!val) return;
                this._updateKPI(id, { [field]: val });
            });

            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    el.blur();
                }
            });
        });

        // ── Current value input ───────────────
        listEl.querySelectorAll("[data-kpi-field='current']").forEach(inp => {
            const id = inp.getAttribute("data-kpi-id");
            inp.addEventListener("change", () => {
                this._updateKPI(id, { current: inp.value.trim() });
            });
        });

        // ── Delete ────────────────────────────
        listEl.querySelectorAll("[data-action='delete-kpi']").forEach(btn => {
            btn.addEventListener("click", () => {
                const id  = btn.getAttribute("data-kpi-id");
                const kpi = this._kpis.find(k => k.id === id);

                if (!kpi) return;

                this._kpis = this._kpis.filter(k => k.id !== id);
                this._save();
                this._renderKPIs();
                Toast.success(`تم حذف "${kpi.name}"`);
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindAddForm
    ───────────────────────────────────────── */
    _bindAddForm() {
        const nameEl     = this._el.querySelector("#kpi-name");
        const targetEl   = this._el.querySelector("#kpi-target");
        const unitEl     = this._el.querySelector("#kpi-unit");
        const categoryEl = this._el.querySelector("#kpi-category");
        const addBtn     = this._el.querySelector("#kpi-add-btn");

        if (!addBtn) return;

        const add = () => {
            const name   = nameEl?.value.trim();
            const target = targetEl?.value.trim();

            if (!name) {
                nameEl?.classList.add("error");
                nameEl?.focus();
                Toast.error("اكتب اسم المقياس أولاً");
                return;
            }

            if (this._kpis.length >= MAX_KPIS) {
                Toast.warning(`الحد الأقصى ${MAX_KPIS} مقاييس`);
                return;
            }

            nameEl.classList.remove("error");

            this._addKPI({
                name    : name,
                target  : target  || "—",
                unit    : unitEl?.value     ?? "مستخدم",
                category: categoryEl?.value ?? "growth",
                current : "0",
            });

            // تنظيف
            if (nameEl)   nameEl.value   = "";
            if (targetEl) targetEl.value = "";
            nameEl?.focus();
        };

        addBtn.addEventListener("click", add);
        nameEl?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                add();
            }
        });
    },


    /* ─────────────────────────────────────────
       _bindSuggestions
    ───────────────────────────────────────── */
    _bindSuggestions() {
        const container = this._el.querySelector("#kpi-suggestions");
        if (!container) return;

        container.querySelectorAll("[data-kpi-name]").forEach(btn => {
            btn.addEventListener("click", () => {
                const name     = btn.getAttribute("data-kpi-name");
                const target   = btn.getAttribute("data-kpi-target");
                const unit     = btn.getAttribute("data-kpi-unit");
                const category = btn.getAttribute("data-kpi-category");

                if (this._kpis.length >= MAX_KPIS) {
                    Toast.warning(`الحد الأقصى ${MAX_KPIS} مقاييس`);
                    return;
                }

                if (this._kpis.some(k => k.name === name)) {
                    Toast.warning(`"${name}" موجود بالفعل`);
                    return;
                }

                this._addKPI({ name, target, unit, category, current: "0" });
                Toast.success(`تمت إضافة "${name}"`);
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindKPIFilter
    ───────────────────────────────────────── */
    _bindKPIFilter() {
        const bar = this._el.querySelector("#kpi-filter");
        if (!bar) return;

        bar.querySelectorAll("[data-kpi-filter]").forEach(btn => {
            btn.addEventListener("click", () => {
                this._filter = btn.getAttribute("data-kpi-filter");

                bar.querySelectorAll("[data-kpi-filter]").forEach(b => {
                    b.classList.toggle(
                        "kpi-filter-btn--active",
                        b === btn
                    );
                });

                this._renderKPIList();
            });
        });
    },


    /* ─────────────────────────────────────────
       _updateSuggestions
    ───────────────────────────────────────── */
    _updateSuggestions() {
        const container = this._el?.querySelector("#kpi-suggestions");
        if (!container) return;

        const names = this._kpis.map(k => k.name);

        container.querySelectorAll("[data-kpi-name]").forEach(btn => {
            const name    = btn.getAttribute("data-kpi-name");
            const isAdded = names.includes(name);
            btn.classList.toggle("suggestion-chip--active", isAdded);
            btn.textContent = isAdded ? `✓ ${name}` : `+ ${name}`;
            btn.disabled    = isAdded;
        });
    },


    /* ─────────────────────────────────────────
       _addKPI
    ───────────────────────────────────────── */
    _addKPI(kpi) {
        this._kpis.push({
            id      : `kpi_${Date.now()}_${Math.random()
                        .toString(36).slice(2, 7)}`,
            name    : kpi.name,
            target  : kpi.target   ?? "—",
            unit    : kpi.unit     ?? "مستخدم",
            category: kpi.category ?? "growth",
            current : kpi.current  ?? "0",
        });

        this._save();
        this._renderKPIs();
    },


    /* ─────────────────────────────────────────
       _updateKPI
    ───────────────────────────────────────── */
    _updateKPI(id, changes) {
        const idx = this._kpis.findIndex(k => k.id === id);
        if (idx < 0) return;
        this._kpis[idx] = { ...this._kpis[idx], ...changes };
        this._save();
        this._renderKPIs();
    },


    /* ─────────────────────────────────────────
       _calcProgress — نسبة التقدم
    ───────────────────────────────────────── */
    _calcProgress(kpi) {
        const current = parseFloat(kpi.current);
        const target  = parseFloat(kpi.target);

        if (isNaN(current) || isNaN(target) || target === 0) return null;

        return Math.round((current / target) * 100);
    },


    /* ─────────────────────────────────────────
       _save
    ───────────────────────────────────────── */
    _save() {
        Store.set("metrics.kpis", [...this._kpis]);
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

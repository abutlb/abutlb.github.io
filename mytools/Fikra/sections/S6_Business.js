/**
 * FIKRA — sections/S6_Business.js
 * ─────────────────────────────────────────────
 * القسم السادس: نموذج العمل والإيرادات
 *
 * الحقول:
 *  - model          : نموذج الربح الرئيسي
 *  - revenueStreams[]: مصادر الإيراد
 *    - id           : معرّف فريد
 *    - name         : اسم المصدر
 *    - type         : recurring / one-time / usage
 *    - price        : السعر
 *    - currency     : العملة
 *    - notes        : ملاحظات
 *  - costItems[]    : بنود التكلفة
 *    - id           : معرّف فريد
 *    - name         : اسم البند
 *    - amount       : المبلغ
 *    - currency     : العملة
 *    - frequency    : monthly / one-time / yearly
 *  - breakEvenUnits : نقطة التعادل (وحدات)
 *  - fundingStage   : مرحلة التمويل
 *  - fundingAmount  : مبلغ التمويل المستهدف
 * ─────────────────────────────────────────────
 */

import Store from "../core/Store.js";
import Toast from "../ui/ToastManager.js";


/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const BUSINESS_MODELS = [
    { value: "",             label: "اختر نموذج الربح...",    disabled: true  },
    { value: "saas",         label: "SaaS — اشتراك شهري/سنوي"                },
    { value: "marketplace",  label: "Marketplace — عمولة على المعاملات"       },
    { value: "freemium",     label: "Freemium — مجاني مع ميزات مدفوعة"       },
    { value: "one-time",     label: "One-time — دفع مرة واحدة"               },
    { value: "advertising",  label: "Advertising — إعلانات"                  },
    { value: "licensing",    label: "Licensing — ترخيص"                      },
    { value: "consulting",   label: "Consulting — استشارات وخدمات"           },
    { value: "hardware",     label: "Hardware — بيع أجهزة"                   },
    { value: "hybrid",       label: "Hybrid — نموذج مختلط"                   },
    { value: "other",        label: "أخرى"                                   },
];

const REVENUE_TYPES = {
    recurring : { label: "متكرر",      icon: "fa-rotate",       color: "green"  },
    "one-time": { label: "مرة واحدة",  icon: "fa-bolt",         color: "blue"   },
    usage     : { label: "حسب الاستخدام", icon: "fa-gauge",     color: "yellow" },
};

const COST_FREQUENCIES = {
    monthly   : { label: "شهري",   multiplier: 12  },
    yearly    : { label: "سنوي",   multiplier: 1   },
    "one-time": { label: "مرة واحدة", multiplier: 0 },
};

const CURRENCIES    = ["ريال", "دولار", "يورو", "جنيه"];
const FUNDING_STAGES = [
    { value: "",          label: "اختر المرحلة...",  disabled: true },
    { value: "bootstrap", label: "Bootstrapped — تمويل ذاتي"       },
    { value: "pre-seed",  label: "Pre-seed"                         },
    { value: "seed",      label: "Seed"                             },
    { value: "series-a",  label: "Series A"                         },
    { value: "grant",     label: "منحة حكومية / مسرّع"             },
];

const MAX_STREAMS = 6;
const MAX_COSTS   = 8;

/* ─────────────────────────────────────────────────────────
   REVENUE STREAM TEMPLATES
───────────────────────────────────────────────────────── */
const STREAM_TEMPLATES = [
    { name: "اشتراك شهري",      type: "recurring",  price: "99",   currency: "ريال" },
    { name: "اشتراك سنوي",      type: "recurring",  price: "999",  currency: "ريال" },
    { name: "خطة Enterprise",   type: "recurring",  price: "499",  currency: "دولار" },
    { name: "عمولة المعاملات",  type: "usage",      price: "2.5",  currency: "%"    },
    { name: "إعلانات",          type: "recurring",  price: "",     currency: "ريال" },
    { name: "خدمات مخصصة",      type: "one-time",   price: "",     currency: "ريال" },
];

/* ─────────────────────────────────────────────────────────
   COST TEMPLATES
───────────────────────────────────────────────────────── */
const COST_TEMPLATES = [
    { name: "استضافة الخوادم",  amount: "200",  currency: "ريال",  frequency: "monthly"   },
    { name: "رواتب الفريق",     amount: "",     currency: "ريال",  frequency: "monthly"   },
    { name: "تسويق ومحتوى",     amount: "500",  currency: "ريال",  frequency: "monthly"   },
    { name: "أدوات وبرمجيات",   amount: "150",  currency: "ريال",  frequency: "monthly"   },
    { name: "تصميم وبراندينج",  amount: "",     currency: "ريال",  frequency: "one-time"  },
    { name: "قانوني ومحاسبة",   amount: "",     currency: "ريال",  frequency: "yearly"    },
];


/* ─────────────────────────────────────────────────────────
   SECTION DEFINITION
───────────────────────────────────────────────────────── */
export default {

    key  : "business",
    label: "نموذج العمل",
    icon : "fa-sack-dollar",


    /* ─────────────────────────────────────────
       template
    ───────────────────────────────────────── */
    template(data = {}) {
        return `
        <div class="space-y-6">


            <!-- ── نموذج الربح ──────────────── -->
            <div class="field-group">

                <label class="field-label" for="biz-model">
                    <i class="fas fa-building-columns text-brand-500"></i>
                    نموذج الربح الرئيسي
                    <span class="text-red-400">*</span>
                </label>

                <select
                    id="biz-model"
                    class="fikra-select"
                    data-field="model">
                    ${BUSINESS_MODELS.map(opt => `
                        <option
                            value="${opt.value}"
                            ${opt.disabled ? "disabled" : ""}
                            ${data.model === opt.value ? "selected" : ""}
                            ${!data.model && opt.disabled ? "selected" : ""}>
                            ${opt.label}
                        </option>
                    `).join("")}
                </select>

                <p class="fikra-error-msg hidden"
                   data-error="model"></p>

                <!-- Model Description Badge -->
                <div id="model-desc-badge" class="mt-2 hidden">
                    <!-- تُبنى في onMount -->
                </div>

            </div>


            <!-- ── مرحلة التمويل ─────────────── -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div class="field-group mb-0">
                    <label class="field-label" for="biz-funding-stage">
                        <i class="fas fa-seedling text-brand-500"></i>
                        مرحلة التمويل
                        <span class="text-xs text-gray-400 font-normal">
                            (اختياري)
                        </span>
                    </label>
                    <select
                        id="biz-funding-stage"
                        class="fikra-select"
                        data-field="fundingStage">
                        ${FUNDING_STAGES.map(opt => `
                            <option
                                value="${opt.value}"
                                ${opt.disabled ? "disabled" : ""}
                                ${data.fundingStage === opt.value
                                    ? "selected" : ""}
                                ${!data.fundingStage && opt.disabled
                                    ? "selected" : ""}>
                                ${opt.label}
                            </option>
                        `).join("")}
                    </select>
                </div>

                <div class="field-group mb-0">
                    <label class="field-label" for="biz-funding-amount">
                        <i class="fas fa-coins text-brand-500"></i>
                        التمويل المستهدف
                        <span class="text-xs text-gray-400 font-normal">
                            (اختياري)
                        </span>
                    </label>
                    <input
                        id="biz-funding-amount"
                        type="text"
                        class="fikra-input"
                        data-field="fundingAmount"
                        placeholder="مثال: 500,000 ريال"
                        value="${this._escape(data.fundingAmount ?? "")}"
                        maxlength="50"
                    >
                </div>

            </div>


            <!-- ── Financial Summary ─────────── -->
            <div id="financial-summary" class="hidden">
                <!-- تُبنى في onMount -->
            </div>


            <!-- ── مصادر الإيراد ─────────────── -->
            <div>

                <div class="flex items-center justify-between mb-3">
                    <label class="field-label mb-0">
                        <i class="fas fa-arrow-trend-up text-brand-500"></i>
                        مصادر الإيراد
                        <span class="text-xs text-gray-400 font-normal">
                            (${(data.revenueStreams ?? []).length}
                            / ${MAX_STREAMS})
                        </span>
                    </label>
                    <button
                        id="add-stream-btn"
                        type="button"
                        class="btn-sm-primary">
                        <i class="fas fa-plus text-xs"></i>
                        مصدر جديد
                    </button>
                </div>

                <!-- Streams List -->
                <div id="streams-list" class="space-y-2">
                    <!-- تُبنى في onMount -->
                </div>

                <!-- Streams Empty -->
                <div id="streams-empty"
                     class="kpis-empty-state hidden">
                    <i class="fas fa-arrow-trend-up text-2xl
                               text-gray-300 dark:text-gray-600 mb-2"></i>
                    <p class="text-sm text-gray-400 dark:text-gray-500">
                        لا توجد مصادر إيراد — أضف من القوالب أدناه
                    </p>
                </div>

                <!-- Stream Templates -->
                <div class="mt-3">
                    <p class="text-xs font-bold text-gray-500
                              dark:text-gray-400 mb-2 flex items-center gap-2">
                        <i class="fas fa-bolt text-yellow-400"></i>
                        قوالب شائعة
                    </p>
                    <div id="stream-suggestions"
                         class="flex flex-wrap gap-2">
                        ${STREAM_TEMPLATES.map(t => `
                            <button
                                type="button"
                                class="suggestion-chip"
                                data-stream-name="${this._escape(t.name)}"
                                data-stream-type="${t.type}"
                                data-stream-price="${t.price}"
                                data-stream-currency="${t.currency}">
                                + ${this._escape(t.name)}
                            </button>
                        `).join("")}
                    </div>
                </div>

            </div>


            <!-- ── بنود التكلفة ──────────────── -->
            <div>

                <div class="flex items-center justify-between mb-3">
                    <label class="field-label mb-0">
                        <i class="fas fa-arrow-trend-down text-brand-500"></i>
                        بنود التكلفة
                        <span class="text-xs text-gray-400 font-normal">
                            (${(data.costItems ?? []).length}
                            / ${MAX_COSTS})
                        </span>
                    </label>
                    <button
                        id="add-cost-btn"
                        type="button"
                        class="btn-sm-primary">
                        <i class="fas fa-plus text-xs"></i>
                        بند جديد
                    </button>
                </div>

                <!-- Costs List -->
                <div id="costs-list" class="space-y-2">
                    <!-- تُبنى في onMount -->
                </div>

                <!-- Costs Empty -->
                <div id="costs-empty"
                     class="kpis-empty-state hidden">
                    <i class="fas fa-arrow-trend-down text-2xl
                               text-gray-300 dark:text-gray-600 mb-2"></i>
                    <p class="text-sm text-gray-400 dark:text-gray-500">
                        لا توجد بنود تكلفة — أضف من القوالب أدناه
                    </p>
                </div>

                <!-- Cost Templates -->
                <div class="mt-3">
                    <p class="text-xs font-bold text-gray-500
                              dark:text-gray-400 mb-2 flex items-center gap-2">
                        <i class="fas fa-bolt text-yellow-400"></i>
                        بنود شائعة
                    </p>
                    <div id="cost-suggestions"
                         class="flex flex-wrap gap-2">
                        ${COST_TEMPLATES.map(t => `
                            <button
                                type="button"
                                class="suggestion-chip"
                                data-cost-name="${this._escape(t.name)}"
                                data-cost-amount="${t.amount}"
                                data-cost-currency="${t.currency}"
                                data-cost-frequency="${t.frequency}">
                                + ${this._escape(t.name)}
                            </button>
                        `).join("")}
                    </div>
                </div>

            </div>


            <!-- ── نقطة التعادل ──────────────── -->
            <div class="field-group">

                <label class="field-label" for="biz-break-even">
                    <i class="fas fa-scale-balanced text-brand-500"></i>
                    نقطة التعادل المستهدفة
                    <span class="text-xs text-gray-400 font-normal">
                        (اختياري)
                    </span>
                </label>

                <div class="flex gap-3">
                    <input
                        id="biz-break-even"
                        type="number"
                        class="fikra-input flex-1"
                        data-field="breakEvenUnits"
                        placeholder="عدد العملاء / الوحدات"
                        min="1"
                        value="${this._escape(
                            String(data.breakEvenUnits ?? "")
                        )}"
                    >
                    <div id="break-even-badge"
                         class="hidden flex-shrink-0 self-center">
                        <!-- تُبنى في onMount -->
                    </div>
                </div>

                <p class="field-hint">
                    <i class="fas fa-circle-info text-blue-400"></i>
                    عدد العملاء أو الوحدات المطلوبة لتغطية التكاليف الشهرية
                </p>

            </div>


        </div>
        `;
    },


    /* ─────────────────────────────────────────
       onMount
    ───────────────────────────────────────── */
    onMount({ el }) {
        this._el      = el;
        this._streams = Store.get("business.revenueStreams") ?? [];
        this._costs   = Store.get("business.costItems")     ?? [];

        this._bindModelSelect();
        this._renderStreams();
        this._renderCosts();
        this._bindAddStream();
        this._bindAddCost();
        this._bindStreamSuggestions();
        this._bindCostSuggestions();
        this._bindBreakEven();
        this._updateFinancialSummary();
    },


    /* ─────────────────────────────────────────
       _bindModelSelect — وصف نموذج الربح
    ───────────────────────────────────────── */
    _bindModelSelect() {
        const select   = this._el.querySelector("[data-field='model']");
        const badgeEl  = this._el.querySelector("#model-desc-badge");
        if (!select || !badgeEl) return;

        const MODEL_DESCRIPTIONS = {
            saas        : "تفرض رسوماً دورية مقابل الوصول للمنتج — إيراد متوقع ومستقر.",
            marketplace : "تأخذ نسبة من كل معاملة بين البائع والمشتري.",
            freemium    : "الأساس مجاني والميزات المتقدمة مدفوعة — يبني قاعدة مستخدمين كبيرة.",
            "one-time"  : "دفع مرة واحدة للحصول على المنتج — بسيط لكن يحتاج مبيعات مستمرة.",
            advertising : "إيراد من الإعلانات — يحتاج حجم مستخدمين كبير.",
            licensing   : "تبيع حق استخدام تقنيتك أو محتواك لآخرين.",
            consulting  : "خدمات مخصصة وبشرية — هامش ربح عالٍ لكن غير قابل للتوسع بسهولة.",
            hardware    : "بيع أجهزة مادية — تكاليف تصنيع وسلسلة توريد.",
            hybrid      : "مزيج من نماذج متعددة — مرونة أعلى وتعقيد أكبر.",
        };

        const update = () => {
            const val  = select.value;
            const desc = MODEL_DESCRIPTIONS[val];

            if (!desc) {
                badgeEl.classList.add("hidden");
                return;
            }

            badgeEl.classList.remove("hidden");
            badgeEl.innerHTML = `
                <div class="model-desc-badge">
                    <i class="fas fa-circle-info text-brand-500
                               flex-shrink-0 mt-0.5"></i>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        ${desc}
                    </p>
                </div>
            `;
        };

        select.addEventListener("change", update);
        update(); // تشغيل فوري
    },


    /* ─────────────────────────────────────────
       _renderStreams — عرض مصادر الإيراد
    ───────────────────────────────────────── */
    _renderStreams() {
        const listEl  = this._el.querySelector("#streams-list");
        const emptyEl = this._el.querySelector("#streams-empty");
        if (!listEl) return;

        if (this._streams.length === 0) {
            listEl.classList.add("hidden");
            emptyEl?.classList.remove("hidden");
            this._updateFinancialSummary();
            return;
        }

        listEl.classList.remove("hidden");
        emptyEl?.classList.add("hidden");

        listEl.innerHTML = this._streams.map(stream => {
            const typeConf = REVENUE_TYPES[stream.type] ?? REVENUE_TYPES.recurring;

            return `
            <div class="revenue-card" data-stream-id="${stream.id}">

                <!-- Type Badge -->
                <div class="revenue-type-badge
                            revenue-type-badge--${typeConf.color}">
                    <i class="fas ${typeConf.icon} text-[10px]"></i>
                    ${typeConf.label}
                </div>

                <div class="flex items-center gap-3 mt-2">

                    <!-- Name (inline edit) -->
                    <p class="flex-1 text-sm font-bold
                               text-gray-700 dark:text-gray-200
                               min-w-0 truncate"
                       contenteditable="true"
                       data-stream-id="${stream.id}"
                       data-stream-field="name"
                       spellcheck="false">
                        ${this._escape(stream.name)}
                    </p>

                    <!-- Price -->
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                        <input
                            type="text"
                            class="w-20 fikra-input text-xs text-center"
                            data-stream-id="${stream.id}"
                            data-stream-field="price"
                            value="${this._escape(stream.price ?? "")}"
                            placeholder="السعر"
                            maxlength="15"
                        >
                        <select
                            class="fikra-select text-xs w-20"
                            data-stream-id="${stream.id}"
                            data-stream-field="currency">
                            ${CURRENCIES.map(c => `
                                <option value="${c}"
                                    ${stream.currency === c
                                        ? "selected" : ""}>
                                    ${c}
                                </option>
                            `).join("")}
                        </select>
                    </div>

                    <!-- Type toggle -->
                    <select
                        class="fikra-select text-xs w-28 flex-shrink-0"
                        data-stream-id="${stream.id}"
                        data-stream-field="type">
                        ${Object.entries(REVENUE_TYPES).map(([val, t]) => `
                            <option value="${val}"
                                ${stream.type === val ? "selected" : ""}>
                                ${t.label}
                            </option>
                        `).join("")}
                    </select>

                    <!-- Delete -->
                    <button type="button"
                        class="feat-action-btn feat-action-btn--danger
                               flex-shrink-0"
                        data-stream-id="${stream.id}"
                        data-action="delete-stream">
                        <i class="fas fa-trash text-xs"></i>
                    </button>

                </div>

            </div>
            `;
        }).join("");

        this._bindStreamEvents(listEl);
        this._updateStreamSuggestions();
        this._updateFinancialSummary();
    },


    /* ─────────────────────────────────────────
       _bindStreamEvents
    ───────────────────────────────────────── */
    _bindStreamEvents(listEl) {

        // ── Inline edit (name) ────────────────
        listEl.querySelectorAll("[data-stream-field='name']").forEach(el => {
            const id = el.getAttribute("data-stream-id");
            el.addEventListener("blur", () => {
                const val = el.textContent.trim();
                if (!val) return;
                this._updateStream(id, { name: val });
            });
            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter") { e.preventDefault(); el.blur(); }
            });
        });

        // ── Price + Currency + Type ───────────
        listEl.querySelectorAll(
            "[data-stream-field='price'], " +
            "[data-stream-field='currency'], " +
            "[data-stream-field='type']"
        ).forEach(inp => {
            const id    = inp.getAttribute("data-stream-id");
            const field = inp.getAttribute("data-stream-field");
            const evt   = inp.tagName === "SELECT" ? "change" : "input";
            inp.addEventListener(evt, () => {
                this._updateStream(id, { [field]: inp.value });
            });
        });

        // ── Delete ────────────────────────────
        listEl.querySelectorAll("[data-action='delete-stream']").forEach(btn => {
            btn.addEventListener("click", () => {
                const id     = btn.getAttribute("data-stream-id");
                const stream = this._streams.find(s => s.id === id);
                this._streams = this._streams.filter(s => s.id !== id);
                this._saveStreams();
                this._renderStreams();
                Toast.success(`تم حذف "${stream?.name ?? ""}"`);
            });
        });
    },


    /* ─────────────────────────────────────────
       _renderCosts — عرض بنود التكلفة
    ───────────────────────────────────────── */
    _renderCosts() {
        const listEl  = this._el.querySelector("#costs-list");
        const emptyEl = this._el.querySelector("#costs-empty");
        if (!listEl) return;

        if (this._costs.length === 0) {
            listEl.classList.add("hidden");
            emptyEl?.classList.remove("hidden");
            this._updateFinancialSummary();
            return;
        }

        listEl.classList.remove("hidden");
        emptyEl?.classList.add("hidden");

        listEl.innerHTML = this._costs.map(cost => {
            const freqConf = COST_FREQUENCIES[cost.frequency]
                ?? COST_FREQUENCIES.monthly;

            return `
            <div class="cost-card" data-cost-id="${cost.id}">

                <div class="flex items-center gap-3">

                    <!-- Icon -->
                    <div class="w-8 h-8 rounded-lg bg-red-50
                                dark:bg-red-900/20 flex items-center
                                justify-center flex-shrink-0">
                        <i class="fas fa-minus text-red-400 text-xs"></i>
                    </div>

                    <!-- Name (inline edit) -->
                    <p class="flex-1 text-sm font-bold
                               text-gray-700 dark:text-gray-200
                               min-w-0 truncate"
                       contenteditable="true"
                       data-cost-id="${cost.id}"
                       data-cost-field="name"
                       spellcheck="false">
                        ${this._escape(cost.name)}
                    </p>

                    <!-- Amount + Currency -->
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                        <input
                            type="text"
                            class="w-20 fikra-input text-xs text-center"
                            data-cost-id="${cost.id}"
                            data-cost-field="amount"
                            value="${this._escape(cost.amount ?? "")}"
                            placeholder="المبلغ"
                            maxlength="15"
                        >
                        <select
                            class="fikra-select text-xs w-20"
                            data-cost-id="${cost.id}"
                            data-cost-field="currency">
                            ${CURRENCIES.map(c => `
                                <option value="${c}"
                                    ${cost.currency === c ? "selected" : ""}>
                                    ${c}
                                </option>
                            `).join("")}
                        </select>
                    </div>

                    <!-- Frequency -->
                    <select
                        class="fikra-select text-xs w-28 flex-shrink-0"
                        data-cost-id="${cost.id}"
                        data-cost-field="frequency">
                        ${Object.entries(COST_FREQUENCIES).map(([val, f]) => `
                            <option value="${val}"
                                ${cost.frequency === val ? "selected" : ""}>
                                ${f.label}
                            </option>
                        `).join("")}
                    </select>

                    <!-- Delete -->
                    <button type="button"
                        class="feat-action-btn feat-action-btn--danger
                               flex-shrink-0"
                        data-cost-id="${cost.id}"
                        data-action="delete-cost">
                        <i class="fas fa-trash text-xs"></i>
                    </button>

                </div>

            </div>
            `;
        }).join("");

        this._bindCostEvents(listEl);
        this._updateCostSuggestions();
        this._updateFinancialSummary();
    },


    /* ─────────────────────────────────────────
       _bindCostEvents
    ───────────────────────────────────────── */
    _bindCostEvents(listEl) {

        listEl.querySelectorAll("[data-cost-field='name']").forEach(el => {
            const id = el.getAttribute("data-cost-id");
            el.addEventListener("blur", () => {
                const val = el.textContent.trim();
                if (!val) return;
                this._updateCost(id, { name: val });
            });
            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter") { e.preventDefault(); el.blur(); }
            });
        });

        listEl.querySelectorAll(
            "[data-cost-field='amount'], " +
            "[data-cost-field='currency'], " +
            "[data-cost-field='frequency']"
        ).forEach(inp => {
            const id    = inp.getAttribute("data-cost-id");
            const field = inp.getAttribute("data-cost-field");
            const evt   = inp.tagName === "SELECT" ? "change" : "input";
            inp.addEventListener(evt, () => {
                this._updateCost(id, { [field]: inp.value });
            });
        });

        listEl.querySelectorAll("[data-action='delete-cost']").forEach(btn => {
            btn.addEventListener("click", () => {
                const id   = btn.getAttribute("data-cost-id");
                const cost = this._costs.find(c => c.id === id);
                this._costs = this._costs.filter(c => c.id !== id);
                this._saveCosts();
                this._renderCosts();
                Toast.success(`تم حذف "${cost?.name ?? ""}"`);
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindAddStream
    ───────────────────────────────────────── */
    _bindAddStream() {
        const btn = this._el.querySelector("#add-stream-btn");
        if (!btn) return;

        btn.addEventListener("click", () => {
            if (this._streams.length >= MAX_STREAMS) {
                Toast.warning(`الحد الأقصى ${MAX_STREAMS} مصادر إيراد`);
                return;
            }
            this._addStream({
                name    : `مصدر إيراد ${this._streams.length + 1}`,
                type    : "recurring",
                price   : "",
                currency: "ريال",
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindAddCost
    ───────────────────────────────────────── */
    _bindAddCost() {
        const btn = this._el.querySelector("#add-cost-btn");
        if (!btn) return;

        btn.addEventListener("click", () => {
            if (this._costs.length >= MAX_COSTS) {
                Toast.warning(`الحد الأقصى ${MAX_COSTS} بنود تكلفة`);
                return;
            }
            this._addCost({
                name     : `بند تكلفة ${this._costs.length + 1}`,
                amount   : "",
                currency : "ريال",
                frequency: "monthly",
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindStreamSuggestions
    ───────────────────────────────────────── */
    _bindStreamSuggestions() {
        const container = this._el.querySelector("#stream-suggestions");
        if (!container) return;

        container.querySelectorAll("[data-stream-name]").forEach(btn => {
            btn.addEventListener("click", () => {
                const name     = btn.getAttribute("data-stream-name");
                const type     = btn.getAttribute("data-stream-type");
                const price    = btn.getAttribute("data-stream-price");
                const currency = btn.getAttribute("data-stream-currency");

                if (this._streams.length >= MAX_STREAMS) {
                    Toast.warning(`الحد الأقصى ${MAX_STREAMS} مصادر`);
                    return;
                }
                if (this._streams.some(s => s.name === name)) {
                    Toast.warning(`"${name}" موجود بالفعل`);
                    return;
                }

                this._addStream({ name, type, price, currency });
                Toast.success(`تمت إضافة "${name}"`);
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindCostSuggestions
    ───────────────────────────────────────── */
    _bindCostSuggestions() {
        const container = this._el.querySelector("#cost-suggestions");
        if (!container) return;

        container.querySelectorAll("[data-cost-name]").forEach(btn => {
            btn.addEventListener("click", () => {
                const name      = btn.getAttribute("data-cost-name");
                const amount    = btn.getAttribute("data-cost-amount");
                const currency  = btn.getAttribute("data-cost-currency");
                const frequency = btn.getAttribute("data-cost-frequency");

                if (this._costs.length >= MAX_COSTS) {
                    Toast.warning(`الحد الأقصى ${MAX_COSTS} بنود`);
                    return;
                }
                if (this._costs.some(c => c.name === name)) {
                    Toast.warning(`"${name}" موجود بالفعل`);
                    return;
                }

                this._addCost({ name, amount, currency, frequency });
                Toast.success(`تمت إضافة "${name}"`);
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindBreakEven — حساب نقطة التعادل
    ───────────────────────────────────────── */
    _bindBreakEven() {
        const input   = this._el.querySelector("[data-field='breakEvenUnits']");
        const badgeEl = this._el.querySelector("#break-even-badge");
        if (!input || !badgeEl) return;

        const update = () => {
            const units = parseFloat(input.value);
            if (!units || units <= 0) {
                badgeEl.classList.add("hidden");
                return;
            }

            // حساب التكلفة الشهرية الكلية
            const monthlyCost = this._calcMonthlyCost();

            if (monthlyCost <= 0) {
                badgeEl.classList.add("hidden");
                return;
            }

            const costPerUnit = monthlyCost / units;

            badgeEl.classList.remove("hidden");
            badgeEl.innerHTML = `
                <div class="break-even-badge">
                    <span class="text-xs text-gray-400
                                 dark:text-gray-500">
                        تكلفة الوحدة:
                    </span>
                    <span class="text-sm font-black text-brand-600
                                 dark:text-brand-400">
                        ${costPerUnit.toFixed(1)}
                        <span class="text-xs font-normal">ريال</span>
                    </span>
                </div>
            `;

            this._updateFinancialSummary();
        };

        input.addEventListener("input", update);
        update();
    },


    /* ─────────────────────────────────────────
       _updateFinancialSummary — ملخص مالي
    ───────────────────────────────────────── */
    _updateFinancialSummary() {
        const summaryEl = this._el.querySelector("#financial-summary");
        if (!summaryEl) return;

        const hasData = this._streams.length > 0 || this._costs.length > 0;
        if (!hasData) {
            summaryEl.classList.add("hidden");
            return;
        }

        summaryEl.classList.remove("hidden");

        const monthlyCost   = this._calcMonthlyCost();
        const breakEvenUnits = parseFloat(
            Store.get("business.breakEvenUnits") ??
            this._el.querySelector("[data-field='breakEvenUnits']")?.value
            ?? 0
        );

        // تقدير الإيراد الشهري (من الـ streams ذات السعر الرقمي)
        const monthlyRevEst = this._streams.reduce((sum, s) => {
            const price = parseFloat(s.price);
            if (isNaN(price)) return sum;
            if (s.type === "recurring") return sum + price;
            return sum;
        }, 0);

        const netMonthly = monthlyRevEst - monthlyCost;
        const isProfit   = netMonthly >= 0;

        summaryEl.innerHTML = `
            <div class="financial-summary-card">

                <p class="text-xs font-black text-gray-500
                          dark:text-gray-400 mb-3 flex items-center gap-2">
                    <i class="fas fa-calculator text-brand-500"></i>
                    ملخص مالي تقديري
                </p>

                <div class="grid grid-cols-3 gap-3">

                    <!-- التكلفة الشهرية -->
                    <div class="fin-stat-card fin-stat-card--red">
                        <span class="fin-stat-label">التكلفة الشهرية</span>
                        <span class="fin-stat-val text-red-500">
                            ${monthlyCost > 0
                                ? monthlyCost.toLocaleString("ar-SA")
                                : "—"}
                            ${monthlyCost > 0 ? "<span class='text-xs'>ريال</span>" : ""}
                        </span>
                    </div>

                    <!-- الإيراد المتكرر -->
                    <div class="fin-stat-card fin-stat-card--green">
                        <span class="fin-stat-label">الإيراد المتكرر</span>
                        <span class="fin-stat-val text-green-500">
                            ${monthlyRevEst > 0
                                ? monthlyRevEst.toLocaleString("ar-SA")
                                : "—"}
                            ${monthlyRevEst > 0
                                ? "<span class='text-xs'>ريال</span>" : ""}
                        </span>
                    </div>

                    <!-- الصافي -->
                    <div class="fin-stat-card
                                ${isProfit
                                    ? "fin-stat-card--green"
                                    : "fin-stat-card--red"}">
                        <span class="fin-stat-label">الصافي</span>
                        <span class="fin-stat-val
                                     ${isProfit
                                         ? "text-green-500"
                                         : "text-red-500"}">
                            ${(monthlyRevEst > 0 || monthlyCost > 0)
                                ? (isProfit ? "+" : "") +
                                  netMonthly.toLocaleString("ar-SA")
                                : "—"}
                            ${(monthlyRevEst > 0 || monthlyCost > 0)
                                ? "<span class='text-xs'>ريال</span>" : ""}
                        </span>
                    </div>

                </div>

                ${breakEvenUnits > 0 && monthlyCost > 0 ? `
                    <div class="mt-3 pt-3 border-t border-gray-100
                                dark:border-gray-800 text-xs
                                text-gray-400 dark:text-gray-500
                                flex items-center gap-2">
                        <i class="fas fa-scale-balanced text-brand-400"></i>
                        نقطة التعادل عند
                        <strong class="text-gray-600 dark:text-gray-300">
                            ${breakEvenUnits.toLocaleString("ar-SA")} وحدة
                        </strong>
                        — تكلفة الوحدة:
                        <strong class="text-brand-600 dark:text-brand-400">
                            ${(monthlyCost / breakEvenUnits).toFixed(1)} ريال
                        </strong>
                    </div>
                ` : ""}

            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _calcMonthlyCost — التكلفة الشهرية
    ───────────────────────────────────────── */
    _calcMonthlyCost() {
        return this._costs.reduce((sum, cost) => {
            const amount = parseFloat(cost.amount);
            if (isNaN(amount)) return sum;

            const freq = COST_FREQUENCIES[cost.frequency];
            if (!freq) return sum;

            // one-time لا تُحتسب في الشهري
            if (cost.frequency === "one-time") return sum;

            // yearly → تقسيم على 12
            if (cost.frequency === "yearly") return sum + (amount / 12);

            return sum + amount;
        }, 0);
    },


    /* ─────────────────────────────────────────
       _updateStreamSuggestions
    ───────────────────────────────────────── */
    _updateStreamSuggestions() {
        const container = this._el?.querySelector("#stream-suggestions");
        if (!container) return;
        const names = this._streams.map(s => s.name);
        container.querySelectorAll("[data-stream-name]").forEach(btn => {
            const name    = btn.getAttribute("data-stream-name");
            const isAdded = names.includes(name);
            btn.classList.toggle("suggestion-chip--active", isAdded);
            btn.textContent = isAdded ? `✓ ${name}` : `+ ${name}`;
            btn.disabled    = isAdded;
        });
    },


    /* ─────────────────────────────────────────
       _updateCostSuggestions
    ───────────────────────────────────────── */
    _updateCostSuggestions() {
        const container = this._el?.querySelector("#cost-suggestions");
        if (!container) return;
        const names = this._costs.map(c => c.name);
        container.querySelectorAll("[data-cost-name]").forEach(btn => {
            const name    = btn.getAttribute("data-cost-name");
            const isAdded = names.includes(name);
            btn.classList.toggle("suggestion-chip--active", isAdded);
            btn.textContent = isAdded ? `✓ ${name}` : `+ ${name}`;
            btn.disabled    = isAdded;
        });
    },


    /* ─────────────────────────────────────────
       _addStream
    ───────────────────────────────────────── */
    _addStream(stream) {
        this._streams.push({
            id      : `stream_${Date.now()}_${Math.random()
                        .toString(36).slice(2, 7)}`,
            name    : stream.name     ?? "مصدر إيراد",
            type    : stream.type     ?? "recurring",
            price   : stream.price    ?? "",
            currency: stream.currency ?? "ريال",
        });
        this._saveStreams();
        this._renderStreams();
    },


    /* ─────────────────────────────────────────
       _addCost
    ───────────────────────────────────────── */
    _addCost(cost) {
        this._costs.push({
            id       : `cost_${Date.now()}_${Math.random()
                         .toString(36).slice(2, 7)}`,
            name     : cost.name      ?? "بند تكلفة",
            amount   : cost.amount    ?? "",
            currency : cost.currency  ?? "ريال",
            frequency: cost.frequency ?? "monthly",
        });
        this._saveCosts();
        this._renderCosts();
    },


    /* ─────────────────────────────────────────
       _updateStream / _updateCost
    ───────────────────────────────────────── */
    _updateStream(id, changes) {
        const idx = this._streams.findIndex(s => s.id === id);
        if (idx < 0) return;
        this._streams[idx] = { ...this._streams[idx], ...changes };
        this._saveStreams();
        this._updateFinancialSummary();
    },

    _updateCost(id, changes) {
        const idx = this._costs.findIndex(c => c.id === id);
        if (idx < 0) return;
        this._costs[idx] = { ...this._costs[idx], ...changes };
        this._saveCosts();
        this._updateFinancialSummary();
    },


    /* ─────────────────────────────────────────
       _saveStreams / _saveCosts
    ───────────────────────────────────────── */
    _saveStreams() {
        Store.set("business.revenueStreams", [...this._streams]);
    },

    _saveCosts() {
        Store.set("business.costItems", [...this._costs]);
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

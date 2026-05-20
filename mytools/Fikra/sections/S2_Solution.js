/**
 * FIKRA — sections/S2_Solution.js
 * ─────────────────────────────────────────────
 * القسم الثاني: تعريف الحل
 *
 * الحقول:
 *  - statement       : وصف الحل الرئيسي
 *  - valueProp       : القيمة المقترحة (Value Proposition)
 *  - differentiation : ما يميزك عن المنافسين
 *  - competitors     : المنافسون (chips)
 *  - approach        : نهج التنفيذ (B2B / B2C / B2B2C / Other)
 * ─────────────────────────────────────────────
 */

import Store     from "../core/Store.js";
import Validator from "../core/Validator.js";
import Toast     from "../ui/ToastManager.js";


/* ─────────────────────────────────────────────────────────
   APPROACH OPTIONS
───────────────────────────────────────────────────────── */
const APPROACHES = [
    { value: "",       label: "اختر نهج التنفيذ...", disabled: true  },
    { value: "b2c",    label: "B2C — مباشرة للمستخدم"               },
    { value: "b2b",    label: "B2B — للشركات والمؤسسات"              },
    { value: "b2b2c",  label: "B2B2C — عبر شركاء للمستخدم"          },
    { value: "b2g",    label: "B2G — للجهات الحكومية"               },
    { value: "other",  label: "أخرى"                                 },
];

/* ─────────────────────────────────────────────────────────
   VALUE PROP EXAMPLES — أمثلة جاهزة للإلهام
───────────────────────────────────────────────────────── */
const VALUE_PROP_EXAMPLES = [
    "نوفر 80% من الوقت المستغرق في...",
    "نخفض التكلفة بنسبة 60% مقارنة بـ...",
    "الحل الوحيد الذي يجمع بين...",
    "نضمن نتائج أسرع بـ 3x من...",
];


/* ─────────────────────────────────────────────────────────
   SECTION DEFINITION
───────────────────────────────────────────────────────── */
export default {

    key  : "solution",
    label: "الحل",
    icon : "fa-lightbulb",


    /* ─────────────────────────────────────────
       template
    ───────────────────────────────────────── */
    template(data = {}) {
        return `
        <div class="space-y-6">

            <!-- ── وصف الحل ─────────────────── -->
            <div class="field-group">

                <label class="field-label" for="solution-statement">
                    <i class="fas fa-wand-magic-sparkles text-brand-500"></i>
                    كيف يحل مشروعك هذه المشكلة؟
                    <span class="text-red-400">*</span>
                </label>

                <div class="relative">
                    <textarea
                        id="solution-statement"
                        class="fikra-textarea"
                        data-field="statement"
                        placeholder="مثال: منصة ويب تتيح لرواد الأعمال توثيق مشاريعهم خطوة بخطوة عبر wizard تفاعلي، وتصديرها بقالب احترافي في دقائق..."
                        rows="4"
                        maxlength="500"
                    >${this._escape(data.statement ?? "")}</textarea>

                    <span class="char-counter"
                          data-counter="statement"
                          data-max="500">
                        ${(data.statement ?? "").length} / 500
                    </span>
                </div>

                <p class="fikra-error-msg hidden"
                   data-error="statement"></p>

                <p class="field-hint">
                    <i class="fas fa-lightbulb text-yellow-400"></i>
                    ركّز على الـ "كيف" — اشرح الآلية بوضوح
                </p>

            </div>


            <!-- ── القيمة المقترحة ───────────── -->
            <div class="field-group">

                <label class="field-label" for="solution-value-prop">
                    <i class="fas fa-star text-brand-500"></i>
                    ما القيمة التي تقدمها للمستخدم؟
                    <span class="text-red-400">*</span>
                </label>

                <input
                    id="solution-value-prop"
                    type="text"
                    class="fikra-input"
                    data-field="valueProp"
                    placeholder="مثال: نوفر 80% من الوقت في توثيق المشاريع"
                    value="${this._escape(data.valueProp ?? "")}"
                    maxlength="200"
                >

                <p class="fikra-error-msg hidden"
                   data-error="valueProp"></p>

                <!-- أمثلة للإلهام -->
                <div class="mt-2 flex flex-wrap gap-2"
                     id="value-prop-examples">
                    ${VALUE_PROP_EXAMPLES.map(ex => `
                        <button
                            type="button"
                            class="example-pill"
                            data-example="${this._escape(ex)}">
                            ${ex}
                        </button>
                    `).join("")}
                </div>

            </div>


            <!-- ── نهج التنفيذ ───────────────── -->
            <div class="field-group">

                <label class="field-label" for="solution-approach">
                    <i class="fas fa-route text-brand-500"></i>
                    نهج التنفيذ
                    <span class="text-red-400">*</span>
                </label>

                <select
                    id="solution-approach"
                    class="fikra-select"
                    data-field="approach">
                    ${APPROACHES.map(opt => `
                        <option
                            value="${opt.value}"
                            ${opt.disabled ? "disabled" : ""}
                            ${data.approach === opt.value ? "selected" : ""}
                            ${!data.approach && opt.disabled ? "selected" : ""}>
                            ${opt.label}
                        </option>
                    `).join("")}
                </select>

                <p class="fikra-error-msg hidden"
                   data-error="approach"></p>

            </div>


            <!-- ── التمييز عن المنافسين ──────── -->
            <div class="field-group">

                <label class="field-label" for="solution-diff">
                    <i class="fas fa-trophy text-brand-500"></i>
                    ما الذي يميزك عن المنافسين؟
                    <span class="text-xs text-gray-400 font-normal">
                        (اختياري)
                    </span>
                </label>

                <div class="relative">
                    <textarea
                        id="solution-diff"
                        class="fikra-textarea"
                        data-field="differentiation"
                        placeholder="مثال: نحن الوحيدون الذين نجمع بين الـ wizard التفاعلي والتصدير الاحترافي في أداة واحدة مجانية..."
                        rows="3"
                        maxlength="300"
                    >${this._escape(data.differentiation ?? "")}</textarea>

                    <span class="char-counter"
                          data-counter="differentiation"
                          data-max="300">
                        ${(data.differentiation ?? "").length} / 300
                    </span>
                </div>

                <p class="fikra-error-msg hidden"
                   data-error="differentiation"></p>

            </div>


            <!-- ── المنافسون ─────────────────── -->
            <div class="field-group">

                <label class="field-label">
                    <i class="fas fa-chess text-brand-500"></i>
                    المنافسون الرئيسيون
                    <span class="text-xs text-gray-400 font-normal">
                        (اختياري)
                    </span>
                </label>

                <!-- Chips المنافسين -->
                <div id="competitors-chips"
                     class="chips-container"
                     data-field="competitors"
                     data-type="chips">
                    <!-- تُبنى في onMount -->
                </div>

                <!-- إدخال منافس جديد -->
                <div class="flex gap-2 mt-3">
                    <input
                        id="competitor-input"
                        type="text"
                        class="fikra-input flex-1"
                        placeholder="اسم المنافس أو البديل الحالي..."
                        maxlength="60"
                    >
                    <button
                        id="competitor-add-btn"
                        type="button"
                        class="btn-icon"
                        aria-label="إضافة منافس">
                        <i class="fas fa-plus text-sm"></i>
                    </button>
                </div>

                <p class="field-hint">
                    <i class="fas fa-circle-info text-blue-400"></i>
                    يشمل البدائل غير المباشرة — مثل Excel أو الطرق اليدوية
                </p>

            </div>


            <!-- ── Comparison Card (يظهر لو في منافسين) ── -->
            <div id="comparison-card"
                 class="hidden">
                <!-- تُبنى في onMount لو في منافسين -->
            </div>

        </div>
        `;
    },


    /* ─────────────────────────────────────────
       onMount
    ───────────────────────────────────────── */
    onMount({ el }) {
        this._el = el;

        this._initCharCounters();
        this._initValuePropExamples();
        this._initComparisonCard();
        this._initCompetitorChips();
    },


    /* ─────────────────────────────────────────
       _initCharCounters
    ───────────────────────────────────────── */
    _initCharCounters() {
        this._el.querySelectorAll("[data-counter]").forEach(counter => {
            const field   = counter.getAttribute("data-counter");
            const max     = parseInt(counter.getAttribute("data-max"));
            const inputEl = this._el.querySelector(
                `[data-field="${field}"]`
            );
            if (!inputEl) return;

            const update = () => {
                const len = inputEl.value.length;
                counter.textContent = `${len} / ${max}`;
                counter.classList.toggle("text-red-400",   len >= max * 0.9);
                counter.classList.toggle("text-gray-400",  len <  max * 0.9);
            };

            inputEl.addEventListener("input", update);
            update();
        });
    },


    /* ─────────────────────────────────────────
       _initValuePropExamples — أمثلة القيمة
    ───────────────────────────────────────── */
    _initValuePropExamples() {
        const container = this._el.querySelector("#value-prop-examples");
        const input     = this._el.querySelector(
            "[data-field='valueProp']"
        );
        if (!container || !input) return;

        container.querySelectorAll("[data-example]").forEach(btn => {
            btn.addEventListener("click", () => {
                const example = btn.getAttribute("data-example");

                // حقن المثال في الـ input
                input.value = example;
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.focus();

                // تحديث الـ active state
                container.querySelectorAll("[data-example]").forEach(b => {
                    b.classList.toggle(
                        "example-pill--active",
                        b === btn
                    );
                });

                Toast.info("تم تطبيق المثال — عدّله ليناسب مشروعك");
            });
        });

        // لو القيمة الحالية تطابق مثال → نعلّمه
        const current = Store.get("solution.valueProp") ?? "";
        if (current) {
            container.querySelectorAll("[data-example]").forEach(btn => {
                if (btn.getAttribute("data-example") === current) {
                    btn.classList.add("example-pill--active");
                }
            });
        }
    },


    /* ─────────────────────────────────────────
       _initCompetitorChips
    ───────────────────────────────────────── */
    _initCompetitorChips() {
        const container = this._el.querySelector("#competitors-chips");
        const input     = this._el.querySelector("#competitor-input");
        const addBtn    = this._el.querySelector("#competitor-add-btn");

        if (!container) return;

        let items = Store.get("solution.competitors") ?? [];

        const render = () => {
            container.innerHTML = items.length === 0
                ? `<p class="text-xs text-gray-400 dark:text-gray-500
                             italic py-1">
                       لا يوجد منافسون مضافون بعد
                   </p>`
                : items.map((item, i) => `
                    <span class="chip chip--competitor">
                        ${this._escape(item)}
                        <button
                            type="button"
                            class="chip-remove"
                            data-chip-index="${i}"
                            aria-label="حذف ${this._escape(item)}">
                            <i class="fas fa-xmark text-[10px]"></i>
                        </button>
                    </span>
                `).join("");

            // ربط أزرار الحذف
            container.querySelectorAll(".chip-remove").forEach(btn => {
                btn.addEventListener("click", () => {
                    const idx = parseInt(btn.getAttribute("data-chip-index"));
                    items.splice(idx, 1);
                    Store.set("solution.competitors", [...items]);
                    render();
                    this._updateComparisonCard(items);
                });
            });

            // تحديث الـ comparison card
            this._updateComparisonCard(items);
        };

        // إضافة منافس
        const add = () => {
            const val = input?.value.trim();
            if (!val) return;

            if (items.includes(val)) {
                Toast.warning("هذا المنافس مضاف بالفعل");
                return;
            }
            if (items.length >= 6) {
                Toast.warning("الحد الأقصى 6 منافسين");
                return;
            }

            items.push(val);
            Store.set("solution.competitors", [...items]);
            render();

            if (input) {
                input.value = "";
                input.focus();
            }
        };

        addBtn?.addEventListener("click", add);
        input?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                add();
            }
        });

        render();
    },


    /* ─────────────────────────────────────────
       _initComparisonCard — بطاقة المقارنة
    ───────────────────────────────────────── */
    _initComparisonCard() {
        const card  = this._el.querySelector("#comparison-card");
        const items = Store.get("solution.competitors") ?? [];
        if (!card) return;

        this._updateComparisonCard = (competitors) => {
            if (!competitors || competitors.length === 0) {
                card.classList.add("hidden");
                return;
            }

            card.classList.remove("hidden");

            const projectName =
                Store.get("meta.projectName") || "مشروعك";

            card.innerHTML = `
                <div class="comparison-card">

                    <p class="text-xs font-bold text-gray-500
                               dark:text-gray-400 mb-3 flex items-center gap-2">
                        <i class="fas fa-table-columns text-brand-500"></i>
                        مقارنة سريعة
                    </p>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs">
                            <thead>
                                <tr>
                                    <th class="comparison-th text-right">
                                        المعيار
                                    </th>
                                    <th class="comparison-th text-center
                                               text-brand-600 dark:text-brand-400">
                                        <i class="fas fa-lightbulb ml-1"></i>
                                        ${this._escape(projectName)}
                                    </th>
                                    ${competitors.map(c => `
                                        <th class="comparison-th text-center
                                                   text-gray-400">
                                            ${this._escape(c)}
                                        </th>
                                    `).join("")}
                                </tr>
                            </thead>
                            <tbody>
                                ${[
                                    "السعر",
                                    "سهولة الاستخدام",
                                    "الميزات",
                                    "الدعم",
                                ].map((criterion, ri) => `
                                    <tr class="${ri % 2 === 0
                                        ? "bg-gray-50 dark:bg-gray-800/30"
                                        : ""}">
                                        <td class="comparison-td font-medium
                                                   text-gray-600 dark:text-gray-300">
                                            ${criterion}
                                        </td>
                                        <!-- مشروعك -->
                                        <td class="comparison-td text-center">
                                            <input
                                                type="text"
                                                class="comparison-input"
                                                data-field="comparison.${ri}.self"
                                                value="${this._escape(
                                                    Store.get(
                                                        `solution.comparison.${ri}.self`
                                                    ) ?? ""
                                                )}"
                                                placeholder="—"
                                            >
                                        </td>
                                        <!-- المنافسون -->
                                        ${competitors.map((_, ci) => `
                                            <td class="comparison-td text-center">
                                                <input
                                                    type="text"
                                                    class="comparison-input"
                                                    data-field="comparison.${ri}.c${ci}"
                                                    value="${this._escape(
                                                        Store.get(
                                                            `solution.comparison.${ri}.c${ci}`
                                                        ) ?? ""
                                                    )}"
                                                    placeholder="—"
                                                >
                                            </td>
                                        `).join("")}
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>

                    <p class="field-hint mt-3">
                        <i class="fas fa-circle-info text-blue-400"></i>
                        اكتب مثلاً: مجاني، سهل، محدود، ممتاز...
                    </p>

                </div>
            `;

            // ربط inputs الجدول بالـ Store
            card.querySelectorAll("[data-field]").forEach(input => {
                const field = `solution.${input.getAttribute("data-field")}`;
                input.addEventListener("input", () => {
                    Store.set(field, input.value);
                });
            });
        };

        // تشغيل أول مرة
        this._updateComparisonCard(items);
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

/**
 * FIKRA — sections/S1_Problem.js
 * ─────────────────────────────────────────────
 * القسم الأول: تعريف المشكلة
 *
 * الحقول:
 *  - statement   : وصف المشكلة الرئيسية
 *  - audience    : الجمهور المستهدف
 *  - painPoints  : نقاط الألم (chips)
 *  - marketSize  : حجم السوق (اختياري)
 * ─────────────────────────────────────────────
 */

import Store     from "../core/Store.js";
import Validator from "../core/Validator.js";
import Toast     from "../ui/ToastManager.js";


/* ─────────────────────────────────────────────────────────
   PAIN POINTS — الاقتراحات الجاهزة
───────────────────────────────────────────────────────── */
const PAIN_SUGGESTIONS = [
    "ضياع الوقت",
    "تكلفة عالية",
    "تجربة مستخدم سيئة",
    "عدم وجود بديل",
    "صعوبة الوصول",
    "نقص المعلومات",
    "عملية يدوية ومتعبة",
    "عدم الموثوقية",
];


/* ─────────────────────────────────────────────────────────
   SECTION DEFINITION
───────────────────────────────────────────────────────── */
export default {

    key  : "problem",
    label: "المشكلة",
    icon : "fa-magnifying-glass",


    /* ─────────────────────────────────────────
       template — HTML القسم
    ───────────────────────────────────────── */
    template(data = {}) {
        return `
        <div class="space-y-6">

            <!-- ── وصف المشكلة ──────────────── -->
            <div class="field-group">

                <label class="field-label" for="problem-statement">
                    <i class="fas fa-pen-to-square text-brand-500"></i>
                    ما المشكلة التي يحلها مشروعك؟
                    <span class="text-red-400">*</span>
                </label>

                <div class="relative">
                    <textarea
                        id="problem-statement"
                        class="fikra-textarea"
                        data-field="statement"
                        placeholder="مثال: يجد أصحاب المشاريع الصغيرة صعوبة في توثيق أفكارهم بشكل منظم قبل البدء في التطوير..."
                        rows="4"
                        maxlength="500"
                    >${this._escape(data.statement ?? "")}</textarea>

                    <!-- عداد الحروف -->
                    <span class="char-counter"
                          data-counter="statement"
                          data-max="500">
                        ${(data.statement ?? "").length} / 500
                    </span>
                </div>

                <p class="fikra-error-msg hidden"
                   data-error="statement"></p>

                <!-- Hint -->
                <p class="field-hint">
                    <i class="fas fa-lightbulb text-yellow-400"></i>
                    اشرح المشكلة من منظور المستخدم — ليس من منظور الحل
                </p>

            </div>


            <!-- ── الجمهور المستهدف ──────────── -->
            <div class="field-group">

                <label class="field-label" for="problem-audience">
                    <i class="fas fa-users text-brand-500"></i>
                    من هو جمهورك المستهدف؟
                    <span class="text-red-400">*</span>
                </label>

                <input
                    id="problem-audience"
                    type="text"
                    class="fikra-input"
                    data-field="audience"
                    placeholder="مثال: رواد الأعمال في مرحلة الـ pre-seed"
                    value="${this._escape(data.audience ?? "")}"
                    maxlength="150"
                >

                <p class="fikra-error-msg hidden"
                   data-error="audience"></p>

            </div>


            <!-- ── نقاط الألم ────────────────── -->
            <div class="field-group">

                <label class="field-label">
                    <i class="fas fa-triangle-exclamation text-brand-500"></i>
                    نقاط الألم الرئيسية
                    <span class="text-xs text-gray-400 font-normal">
                        (اختياري)
                    </span>
                </label>

                <!-- Chips المختارة -->
                <div id="pain-chips"
                     class="chips-container"
                     data-field="painPoints"
                     data-type="chips">
                    <!-- تُبنى في onMount -->
                </div>

                <!-- اقتراحات جاهزة -->
                <div class="mt-3">
                    <p class="text-xs text-gray-400 dark:text-gray-500
                               mb-2 font-medium">
                        اقتراحات سريعة:
                    </p>
                    <div id="pain-suggestions"
                         class="flex flex-wrap gap-2">
                        ${PAIN_SUGGESTIONS.map(s => `
                            <button
                                type="button"
                                class="suggestion-chip"
                                data-suggestion="${this._escape(s)}">
                                + ${s}
                            </button>
                        `).join("")}
                    </div>
                </div>

                <!-- إدخال يدوي -->
                <div class="flex gap-2 mt-3">
                    <input
                        id="pain-custom-input"
                        type="text"
                        class="fikra-input flex-1"
                        placeholder="أضف نقطة ألم مخصصة..."
                        maxlength="80"
                    >
                    <button
                        id="pain-add-btn"
                        type="button"
                        class="btn-icon"
                        aria-label="إضافة">
                        <i class="fas fa-plus text-sm"></i>
                    </button>
                </div>

                <p class="fikra-error-msg hidden"
                   data-error="painPoints"></p>

            </div>


            <!-- ── حجم السوق ─────────────────── -->
            <div class="field-group">

                <label class="field-label" for="problem-market">
                    <i class="fas fa-chart-pie text-brand-500"></i>
                    حجم السوق المستهدف
                    <span class="text-xs text-gray-400 font-normal">
                        (اختياري)
                    </span>
                </label>

                <div class="grid grid-cols-2 gap-3">

                    <!-- TAM -->
                    <div>
                        <label class="text-xs text-gray-400
                                      dark:text-gray-500 mb-1 block">
                            TAM — السوق الكلي
                        </label>
                        <input
                            type="text"
                            class="fikra-input"
                            data-field="marketSize.tam"
                            placeholder="مثال: $5B"
                            value="${this._escape(data.marketSize?.tam ?? "")}"
                            maxlength="30"
                        >
                    </div>

                    <!-- SAM -->
                    <div>
                        <label class="text-xs text-gray-400
                                      dark:text-gray-500 mb-1 block">
                            SAM — السوق المتاح
                        </label>
                        <input
                            type="text"
                            class="fikra-input"
                            data-field="marketSize.sam"
                            placeholder="مثال: $500M"
                            value="${this._escape(data.marketSize?.sam ?? "")}"
                            maxlength="30"
                        >
                    </div>

                </div>

                <p class="field-hint mt-2">
                    <i class="fas fa-circle-info text-blue-400"></i>
                    TAM = إجمالي السوق · SAM = الجزء القابل للاستهداف
                </p>

            </div>

        </div>
        `;
    },


    /* ─────────────────────────────────────────
       onMount — بعد الـ render مباشرة
    ───────────────────────────────────────── */
    onMount({ el }) {
        this._el = el;

        // بناء الـ chips من الـ Store
        this._initChips();

        // ربط عداد الحروف
        this._initCharCounters();

        // ربط اقتراحات الـ pain points
        this._initSuggestions();

        // ربط زر الإضافة اليدوية
        this._initCustomInput();
    },


    /* ─────────────────────────────────────────
       _initChips — بناء نظام الـ chips
    ───────────────────────────────────────── */
    _initChips() {
        const container = this._el.querySelector("#pain-chips");
        if (!container) return;

        // قراءة البيانات الحالية
        let items = Store.get("problem.painPoints") ?? [];

        const render = () => {
            container.innerHTML = items.length === 0
                ? `<p class="text-xs text-gray-400 dark:text-gray-500
                             italic py-1">
                       لا توجد نقاط ألم بعد — أضف من الاقتراحات أدناه
                   </p>`
                : items.map((item, i) => `
                    <span class="chip">
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
                    Store.set("problem.painPoints", [...items]);
                    render();
                    this._updateSuggestions(items);
                });
            });
        };

        // حفظ الـ render للاستخدام من الخارج
        this._renderChips = render;
        this._getItems    = () => items;
        this._addItem     = (val) => {
            const trimmed = val.trim();
            if (!trimmed)                 return false;
            if (items.includes(trimmed))  {
                Toast.warning("هذه النقطة موجودة بالفعل");
                return false;
            }
            if (items.length >= 8) {
                Toast.warning("الحد الأقصى 8 نقاط ألم");
                return false;
            }
            items.push(trimmed);
            Store.set("problem.painPoints", [...items]);
            render();
            this._updateSuggestions(items);
            return true;
        };

        render();
    },


    /* ─────────────────────────────────────────
       _initCharCounters — عداد الحروف
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

                // تحذير عند الاقتراب من الحد
                if (len >= max * 0.9) {
                    counter.classList.add("text-red-400");
                    counter.classList.remove("text-gray-400");
                } else {
                    counter.classList.remove("text-red-400");
                    counter.classList.add("text-gray-400");
                }
            };

            inputEl.addEventListener("input", update);
            update(); // تحديث فوري
        });
    },


    /* ─────────────────────────────────────────
       _initSuggestions — ربط الاقتراحات
    ───────────────────────────────────────── */
    _initSuggestions() {
        const container = this._el.querySelector("#pain-suggestions");
        if (!container) return;

        // تحديث حالة الأزرار بناءً على المختار
        this._updateSuggestions = (items) => {
            container.querySelectorAll("[data-suggestion]").forEach(btn => {
                const val      = btn.getAttribute("data-suggestion");
                const selected = items.includes(val);

                btn.classList.toggle("suggestion-chip--active", selected);
                btn.textContent = selected ? `✓ ${val}` : `+ ${val}`;
            });
        };

        // ربط الأحداث
        container.querySelectorAll("[data-suggestion]").forEach(btn => {
            btn.addEventListener("click", () => {
                const val   = btn.getAttribute("data-suggestion");
                const items = this._getItems?.() ?? [];

                if (items.includes(val)) {
                    // إلغاء التحديد
                    const idx = items.indexOf(val);
                    items.splice(idx, 1);
                    Store.set("problem.painPoints", [...items]);
                    this._renderChips?.();
                    this._updateSuggestions(items);
                } else {
                    this._addItem?.(val);
                }
            });
        });

        // تحديث الحالة الأولية
        const current = Store.get("problem.painPoints") ?? [];
        this._updateSuggestions(current);
    },


    /* ─────────────────────────────────────────
       _initCustomInput — الإدخال اليدوي
    ───────────────────────────────────────── */
    _initCustomInput() {
        const input  = this._el.querySelector("#pain-custom-input");
        const addBtn = this._el.querySelector("#pain-add-btn");

        if (!input || !addBtn) return;

        const add = () => {
            const val = input.value.trim();
            if (!val) return;

            const added = this._addItem?.(val);
            if (added) {
                input.value = "";
                input.focus();
                Toast.success(`تمت إضافة "${val}"`);
            }
        };

        addBtn.addEventListener("click", add);

        // Enter في الـ input
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                add();
            }
        });
    },


    /* ─────────────────────────────────────────
       _escape — حماية من XSS
    ───────────────────────────────────────── */
    _escape(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    },
};

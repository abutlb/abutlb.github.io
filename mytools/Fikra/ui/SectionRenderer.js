/**
 * FIKRA — ui/SectionRenderer.js
 * ─────────────────────────────────────────────
 * المحرك الرئيسي لعرض أقسام الـ Wizard
 */

import Bus,    { EVENTS } from "../core/EventBus.js";
import Store              from "../core/Store.js";
import Router, { STEPS  } from "../core/Router.js";
import Validator          from "../core/Validator.js";
import Toast              from "./ToastManager.js";
import ProgressBar        from "./ProgressBar.js";


/* ─────────────────────────────────────────────────────
   SECTION REGISTRY
───────────────────────────────────────────────────── */
const SECTION_LOADERS = {
    1: () => import("../sections/S1_Problem.js"),
    2: () => import("../sections/S2_Solution.js"),
    3: () => import("../sections/S3_Features.js"),
    4: () => import("../sections/S4_Metrics.js"),
    5: () => import("../sections/S5_Timeline.js"),
    6: () => import("../sections/S6_Business.js"),
    7: () => import("../sections/S7_Tech.js"),
    8: () => import("../sections/S8_Summary.js"),
};

const TOTAL_STEPS = Object.keys(SECTION_LOADERS).length;


/* ─────────────────────────────────────────────────────
   CLASS
───────────────────────────────────────────────────── */
class SectionRenderer {

    constructor() {
        /** @type {HTMLElement|null} */
        this._app = null;

        /** @type {number} */
        this._current = 1;

        /** @type {Map<number, object>} */
        this._cache = new Map();

        /** @type {AbortController|null} */
        this._abortCtrl = null;

        /** @type {boolean} */
        this._initialized = false;
    }


    /* ─────────────────────────────────────────
       init
    ───────────────────────────────────────── */
    init() {
        if (this._initialized) return;

        // ← الـ container الصحيح من index.html
        this._app = document.getElementById("screen-wizard");

        if (!this._app) {
            console.error("[SectionRenderer] #screen-wizard غير موجود في الـ DOM");
            return;
        }

        // الاستماع لأحداث الـ Router
        Bus.on(EVENTS.STEP_CHANGED, ({ to, from }) => {
            this._animateTransition(from, to);
        });

        this._initialized = true;
    }


    /* ─────────────────────────────────────────
       render — عرض قسم محدد
    ───────────────────────────────────────── */
    async render(stepId, skipAnim = false) {
        if (!this._app) {
            console.error("[SectionRenderer] لم يتم استدعاء init() بعد");
            return;
        }

        // إلغاء أي render سابق لم يكتمل
        this._abortCtrl?.abort();
        this._abortCtrl = new AbortController();
        const { signal } = this._abortCtrl;

        this._current = stepId;

        try {
            // تحميل الـ section module
            const section = await this._loadSection(stepId);
            if (signal.aborted) return;

            // بناء الـ HTML
            const html = this._buildShell(stepId, section);

            // حقن في الـ DOM
            if (!skipAnim) {
                await this._swapContent(html);
            } else {
                this._app.innerHTML = html;
            }

            if (signal.aborted) return;

            // ربط البيانات
            this._hydrate(stepId, section);

            // ربط أزرار التنقل
            this._bindNavButtons(stepId);

            // تشغيل onMount للـ section
            section.onMount?.({
                el    : this._app,
                store : Store,
                bus   : Bus,
                stepId,
            });

            // تحديث الـ ProgressBar
            ProgressBar.setStep(stepId);

            // حفظ الخطوة الحالية
            Store.set("meta.currentSection", stepId);

            // scroll للأعلى
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (err) {
            if (err.name === "AbortError") return;
            console.error(`[SectionRenderer] خطأ في render الخطوة ${stepId}:`, err);
            this._renderError(stepId);
        }
    }


    /* ─────────────────────────────────────────
       _loadSection
    ───────────────────────────────────────── */
    async _loadSection(stepId) {
        if (this._cache.has(stepId)) {
            return this._cache.get(stepId);
        }

        const loader = SECTION_LOADERS[stepId];
        if (!loader) throw new Error(`Section ${stepId} غير موجود`);

        const mod     = await loader();
        const section = mod.default ?? mod;

        this._cache.set(stepId, section);
        return section;
    }


    /* ─────────────────────────────────────────
       _buildShell — HTML الهيكل الكامل
    ───────────────────────────────────────── */
    _buildShell(stepId, section) {
        const isFirst = stepId === 1;
        const isLast  = stepId === TOTAL_STEPS;

        // بيانات القسم من الـ Store
        const sectionData = Store.getSection?.(section.key) ?? {};

        return `
            <div class="section-wrapper"
                 data-section="${section.key}"
                 data-step="${stepId}">

                <!-- Header -->
                <div class="section-header">
                    <div class="section-icon-wrap">
                        <i class="fas ${section.icon}"></i>
                    </div>
                    <div>
                        <p class="section-step-label">
                            الخطوة ${stepId} من ${TOTAL_STEPS}
                        </p>
                        <h2 class="section-title">
                            ${section.label}
                        </h2>
                    </div>
                </div>

                <!-- Body -->
                <div class="section-body">
                    ${section.template(sectionData)}
                </div>

                <!-- Footer -->
                <div class="section-footer">

                    <button
                        id="btn-back"
                        type="button"
                        class="btn-nav btn-back ${isFirst ? "invisible" : ""}"
                        ${isFirst ? "tabindex='-1'" : ""}
                        aria-label="الخطوة السابقة">
                        <i class="fas fa-arrow-right text-sm"></i>
                        <span>السابق</span>
                    </button>

                    <span class="text-xs text-gray-400 dark:text-gray-500 font-medium">
                        ${stepId} / ${TOTAL_STEPS}
                    </span>

                    <button
                        id="btn-next"
                        type="button"
                        class="btn-nav btn-next"
                        aria-label="${isLast ? "إنهاء وعرض الملخص" : "الخطوة التالية"}">
                        <span>${isLast ? "إنهاء 🎉" : "التالي"}</span>
                        ${isLast ? "" : `<i class="fas fa-arrow-left text-sm"></i>`}
                    </button>

                </div>

            </div>
        `;
    }


    /* ─────────────────────────────────────────
       _hydrate — ربط البيانات بالـ inputs
    ───────────────────────────────────────── */
    _hydrate(stepId, section) {
        const sectionEl = this._app.querySelector(
            `[data-section="${section.key}"]`
        );
        if (!sectionEl) return;

        const sectionData = Store.getSection?.(section.key) ?? {};

        // ملء الـ inputs بالبيانات المحفوظة
        sectionEl.querySelectorAll("[data-field]").forEach(el => {
            const field = el.getAttribute("data-field");
            const value = this._getNestedValue(sectionData, field);

            if (value === undefined || value === null) return;

            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.value = value;
            } else if (el.tagName === "SELECT") {
                el.value = value;
            }
            // الـ chips تتعامل معها الـ section في onMount
        });

        // ربط التغييرات بالـ Store
        sectionEl.querySelectorAll("[data-field]").forEach(el => {
            const field   = el.getAttribute("data-field");
            const saveKey = `${section.key}.${field}`;

            const handler = this._debounce(() => {
                const val = el.type === "checkbox" ? el.checked : el.value;
                Store.set(saveKey, val);
                Bus.emit(EVENTS.STORE_CHANGED, { key: saveKey, value: val });
            }, 300);

            el.addEventListener("input",  handler);
            el.addEventListener("change", handler);
        });
    }


    /* ─────────────────────────────────────────
       _bindNavButtons
    ───────────────────────────────────────── */
    _bindNavButtons(stepId) {
        const btnNext = this._app.querySelector("#btn-next");
        const btnBack = this._app.querySelector("#btn-back");

        // زر التالي
        btnNext?.addEventListener("click", async () => {
            const section = await this._loadSection(stepId);
            const data    = Store.getSection?.(section.key) ?? {};

            const result = Validator.validate(section.key, data);

            // دعم كلا الشكلين: { valid, errors } أو errors مباشرة
            const isValid = result?.valid ?? (Object.keys(result ?? {}).length === 0);
            const errors  = result?.errors ?? result;

            if (!isValid) {
                Validator.showErrors?.(section.key, errors);
                Toast.error("أكمل الحقول المطلوبة أولاً");
                this._scrollToFirstError();
                return;
            }

            Validator.clearErrors?.(section.key);
            ProgressBar.markDone?.(stepId);
            Bus.emit(EVENTS.STEP_COMPLETED, { stepId });

            if (stepId < TOTAL_STEPS) {
                Router.next?.() ?? this.render(stepId + 1);
            } else {
                // آخر خطوة → عرض الملخص / Preview
                Bus.emit(EVENTS.WIZARD_COMPLETE);
                Toast.success("أحسنت! مشروعك جاهز 🎉");
            }
        });

        // زر الرجوع
        btnBack?.addEventListener("click", () => {
            Router.back?.() ?? this.render(stepId - 1);
        });
    }


    /* ─────────────────────────────────────────
       _animateTransition
    ───────────────────────────────────────── */
    async _animateTransition(from, to) {
        if (!this._app) return;

        const goingForward = to > from;
        const outClass     = goingForward ? "slide-out-left"  : "slide-out-right";
        const inClass      = goingForward ? "slide-in-right"  : "slide-in-left";

        const current = this._app.querySelector(".section-wrapper");
        if (current) {
            current.classList.add(outClass);
            await this._wait(200);
        }

        await this.render(to, true);

        const next = this._app.querySelector(".section-wrapper");
        if (next) {
            next.classList.add(inClass);
            requestAnimationFrame(() => {
                next.classList.remove(inClass);
                next.classList.add("slide-in-active");
                setTimeout(() => next.classList.remove("slide-in-active"), 300);
            });
        }
    }


    /* ─────────────────────────────────────────
       _swapContent — fade transition
    ───────────────────────────────────────── */
    async _swapContent(html) {
        this._app.style.transition = "opacity 0.15s ease";
        this._app.style.opacity    = "0";

        await this._wait(150);

        this._app.innerHTML = html;

        requestAnimationFrame(() => {
            this._app.style.opacity = "1";
        });
    }


    /* ─────────────────────────────────────────
       _renderError
    ───────────────────────────────────────── */
    _renderError(stepId) {
        if (!this._app) return;
        this._app.innerHTML = `
            <div class="flex flex-col items-center justify-center
                        min-h-[300px] gap-4 text-center p-8">
                <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30
                            rounded-2xl flex items-center justify-center">
                    <i class="fas fa-circle-exclamation text-red-500 text-2xl"></i>
                </div>
                <h3 class="text-lg font-black text-gray-700 dark:text-gray-200">
                    تعذّر تحميل الخطوة ${stepId}
                </h3>
                <p class="text-sm text-gray-400 dark:text-gray-500">
                    تحقق من الـ Console أو أعد تحميل الصفحة
                </p>
                <button onclick="window.location.reload()"
                    class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700
                           text-white text-sm font-bold rounded-xl transition">
                    إعادة التحميل
                </button>
            </div>
        `;
    }


    /* ─────────────────────────────────────────
       Helpers
    ───────────────────────────────────────── */
    _scrollToFirstError() {
        const firstError = this._app?.querySelector(
            ".fikra-input.error, .fikra-textarea.error"
        );
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError?.focus({ preventScroll: true });
    }

    _getNestedValue(obj, path) {
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
    }

    _debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    _wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ── Aliases ──────────────────────────────
    goTo(stepId) {
        return this.render(stepId);
    }

    currentSection() {
        return this._current;
    }
}


/* ─────────────────────────────────────────────────────
   Singleton Export
───────────────────────────────────────────────────── */
export default new SectionRenderer();

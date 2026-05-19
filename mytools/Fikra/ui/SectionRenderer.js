/**
 * FIKRA — ui/SectionRenderer.js
 * ─────────────────────────────────────────────
 * المحرك الرئيسي لعرض أقسام الـ Wizard
 *
 * المسؤوليات:
 *  1. تحميل section من مجلد sections/
 *  2. حقن البيانات من Store في الـ inputs
 *  3. ربط الـ inputs بالـ Store (two-way binding)
 *  4. ربط أزرار Next / Back
 *  5. تشغيل الـ Validator على كل قسم
 *
 * الاستخدام:
 *   import SectionRenderer from "./ui/SectionRenderer.js";
 *   SectionRenderer.init();
 *   SectionRenderer.render(1);
 * ─────────────────────────────────────────────
 */

import Bus,       { EVENTS } from "../core/EventBus.js";
import Store                 from "../core/Store.js";
import Router,    { STEPS  } from "../core/Router.js";
import Validator             from "../core/Validator.js";
import Toast                 from "./ToastManager.js";
import ProgressBar           from "./ProgressBar.js";


/* ─────────────────────────────────────────────────────────
   SECTION REGISTRY — خريطة الأقسام
───────────────────────────────────────────────────────── */
const SECTIONS = {
    1: () => import("../sections/S1_Problem.js"),
    2: () => import("../sections/S2_Solution.js"),
    3: () => import("../sections/S3_Features.js"),
    4: () => import("../sections/S4_Metrics.js"),
    5: () => import("../sections/S5_Timeline.js"),
    6: () => import("../sections/S6_Business.js"),
    7: () => import("../sections/S7_Tech.js"),
    8: () => import("../sections/S8_Summary.js"),
};

const TOTAL_STEPS = Object.keys(SECTIONS).length;


/* ─────────────────────────────────────────────────────────
   SECTION RENDERER CLASS
───────────────────────────────────────────────────────── */
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

        this._app = document.getElementById("app");

        // الاستماع للأحداث
        Bus.on(EVENTS.STEP_CHANGED, ({ to, from }) => {
            this._animateTransition(from, to);
        });

        this._initialized = true;
    }


    /* ─────────────────────────────────────────
       render — عرض قسم محدد
    ───────────────────────────────────────── */
    /**
     * @param {number}  stepId
     * @param {boolean} skipAnim
     */
    async render(stepId, skipAnim = false) {
        if (!this._app) return;

        // إلغاء أي render سابق لم يكتمل
        this._abortCtrl?.abort();
        this._abortCtrl = new AbortController();
        const { signal } = this._abortCtrl;

        this._current = stepId;

        try {
            // ── تحميل الـ section module ──────
            const section = await this._loadSection(stepId);
            if (signal.aborted) return;

            // ── بناء الـ HTML ─────────────────
            const html = this._buildShell(stepId, section);

            // ── حقن في الـ DOM ────────────────
            if (!skipAnim) {
                await this._swapContent(html);
            } else {
                this._app.innerHTML = html;
            }

            if (signal.aborted) return;

            // ── hydrate: ربط البيانات ─────────
            this._hydrate(stepId, section);

            // ── ربط الأزرار ───────────────────
            this._bindNavButtons(stepId);

            // ── تشغيل onMount للـ section ──────
            section.onMount?.({
                el      : this._app,
                store   : Store,
                bus     : Bus,
                stepId,
            });

            // ── تحديث الـ ProgressBar ─────────
            ProgressBar.setStep(stepId);

            // ── scroll للأعلى ─────────────────
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (err) {
            if (err.name === "AbortError") return;
            console.error(`[SectionRenderer] خطأ في render الخطوة ${stepId}:`, err);
            this._renderError(stepId);
        }
    }


    /* ─────────────────────────────────────────
       _loadSection — تحميل الـ module
    ───────────────────────────────────────── */
    async _loadSection(stepId) {
        // من الـ cache أولاً
        if (this._cache.has(stepId)) {
            return this._cache.get(stepId);
        }

        const loader = SECTIONS[stepId];
        if (!loader) throw new Error(`Section ${stepId} غير موجود`);

        const mod = await loader();

        // نتحقق أن الـ module فيه default export
        const section = mod.default ?? mod;
        this._cache.set(stepId, section);

        return section;
    }


    /* ─────────────────────────────────────────
       _buildShell — بناء HTML الهيكل الكامل
    ───────────────────────────────────────── */
    /**
     * @param {number} stepId
     * @param {object} section — { key, label, icon, template() }
     * @returns {string}
     */
    _buildShell(stepId, section) {
        const isFirst = stepId === 1;
        const isLast  = stepId === TOTAL_STEPS;
        const step    = STEPS.find(s => s.id === stepId);

        return `
            <!-- ── Section Wrapper ── -->
            <div class="section-wrapper"
                 data-section="${section.key}"
                 data-step="${stepId}">

                <!-- ── Section Header ── -->
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

                <!-- ── Section Body (محتوى الـ section) ── -->
                <div class="section-body">
                    ${section.template(Store.getSection(section.key))}
                </div>

                <!-- ── Section Footer (أزرار التنقل) ── -->
                <div class="section-footer">

                    <!-- زر الرجوع -->
                    <button
                        id="btn-back"
                        type="button"
                        class="btn-nav btn-back
                               ${isFirst ? "invisible" : ""}"
                        ${isFirst ? "tabindex='-1'" : ""}
                        aria-label="الخطوة السابقة">
                        <i class="fas fa-arrow-right text-sm"></i>
                        <span>السابق</span>
                    </button>

                    <!-- مؤشر الخطوة (وسط) -->
                    <span class="text-xs text-gray-400
                                 dark:text-gray-500 font-medium">
                        ${stepId} / ${TOTAL_STEPS}
                    </span>

                    <!-- زر التالي / إنهاء -->
                    <button
                        id="btn-next"
                        type="button"
                        class="btn-nav btn-next"
                        aria-label="${isLast ? "إنهاء وعرض الملخص" : "الخطوة التالية"}">
                        <span>${isLast ? "إنهاء 🎉" : "التالي"}</span>
                        ${isLast
                            ? ""
                            : `<i class="fas fa-arrow-left text-sm"></i>`
                        }
                    </button>

                </div>

            </div>
        `;
    }


    /* ─────────────────────────────────────────
       _hydrate — ربط البيانات بالـ inputs
    ───────────────────────────────────────── */
    /**
     * يملأ الـ inputs بالبيانات المحفوظة
     * ويربطها بالـ Store عند التغيير
     *
     * @param {number} stepId
     * @param {object} section
     */
    _hydrate(stepId, section) {
        const sectionEl = this._app.querySelector(
            `[data-section="${section.key}"]`
        );
        if (!sectionEl) return;

        const sectionData = Store.getSection(section.key);

        // ── ملء الـ inputs ────────────────────
        sectionEl.querySelectorAll("[data-field]").forEach(el => {
            const field = el.getAttribute("data-field");
            const value = this._getNestedValue(sectionData, field);

            if (value === undefined || value === null) return;

            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.value = value;
            } else if (el.tagName === "SELECT") {
                el.value = value;
            } else if (el.dataset.type === "chips") {
                // الـ chips تتعامل معها الـ section نفسها في onMount
            }
        });

        // ── ربط التغييرات بالـ Store ──────────
        sectionEl.querySelectorAll("[data-field]").forEach(el => {
            const field    = el.getAttribute("data-field");
            const saveKey  = `${section.key}.${field}`;

            const handler = this._debounce((e) => {
                const val = el.type === "checkbox"
                    ? el.checked
                    : el.value;

                Store.set(saveKey, val);

                // live validation
                Validator.attachLiveValidation(el, section.key, field);

            }, 300);

            el.addEventListener("input",  handler);
            el.addEventListener("change", handler);
        });

        // ── live validation للـ inputs ────────
        sectionEl.querySelectorAll("[data-field]").forEach(el => {
            const field = el.getAttribute("data-field");
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                Validator.attachLiveValidation(el, section.key, field);
            }
        });
    }


    /* ─────────────────────────────────────────
       _bindNavButtons — ربط أزرار التنقل
    ───────────────────────────────────────── */
    _bindNavButtons(stepId) {
        const btnNext = this._app.querySelector("#btn-next");
        const btnBack = this._app.querySelector("#btn-back");

        // ── زر التالي ─────────────────────────
        btnNext?.addEventListener("click", async () => {
            const section    = await this._loadSection(stepId);
            const sectionKey = section.key;
            const data       = Store.getSection(sectionKey);

            // تشغيل الـ validation
            const { valid, errors, warnings } =
                Validator.validate(sectionKey, data);

            if (!valid) {
                Validator.showErrors(sectionKey, errors, warnings);
                Toast.error("أكمل الحقول المطلوبة أولاً");

                // scroll لأول خطأ
                this._scrollToFirstError();
                return;
            }

            // مسح الأخطاء
            Validator.clearErrors(sectionKey);

            // تعليم الخطوة كمكتملة
            ProgressBar.markDone(stepId);
            Bus.emit(EVENTS.STEP_COMPLETED, { stepId });

            // الانتقال للتالي
            Router.next();
        });

        // ── زر الرجوع ─────────────────────────
        btnBack?.addEventListener("click", () => {
            Router.back();
        });

        // ── keyboard shortcut ─────────────────
        // Enter = التالي (لو مش داخل textarea)
        document.addEventListener("keydown", this._keyHandler = (e) => {
            if (
                e.key      === "Enter"  &&
                e.ctrlKey  === false    &&
                e.metaKey  === false    &&
                document.activeElement?.tagName !== "TEXTAREA" &&
                document.activeElement?.tagName !== "BUTTON"
            ) {
                btnNext?.click();
            }
        }, { once: true });
    }


    /* ─────────────────────────────────────────
       _animateTransition — animation الانتقال
    ───────────────────────────────────────── */
    /**
     * @param {number} from
     * @param {number} to
     */
    async _animateTransition(from, to) {
        if (!this._app) return;

        const goingForward = to > from;
        const outClass     = goingForward ? "slide-out-left"  : "slide-out-right";
        const inClass      = goingForward ? "slide-in-right"  : "slide-in-left";

        // ── خروج المحتوى الحالي ───────────────
        const current = this._app.querySelector(".section-wrapper");
        if (current) {
            current.classList.add(outClass);
            await this._wait(200);
        }

        // ── عرض الـ section الجديد ────────────
        await this.render(to, true);

        // ── دخول المحتوى الجديد ───────────────
        const next = this._app.querySelector(".section-wrapper");
        if (next) {
            next.classList.add(inClass);
            requestAnimationFrame(() => {
                next.classList.remove(inClass);
                next.classList.add("slide-in-active");
                setTimeout(() =>
                    next.classList.remove("slide-in-active"), 300
                );
            });
        }
    }


    /* ─────────────────────────────────────────
       _swapContent — تبديل المحتوى بـ fade
    ───────────────────────────────────────── */
    async _swapContent(html) {
        // fade out
        this._app.style.transition = "opacity 0.15s ease";
        this._app.style.opacity    = "0";

        await this._wait(150);

        this._app.innerHTML = html;

        // fade in
        requestAnimationFrame(() => {
            this._app.style.opacity = "1";
        });
    }


    /* ─────────────────────────────────────────
       _renderError — عرض رسالة خطأ
    ───────────────────────────────────────── */
    _renderError(stepId) {
        this._app.innerHTML = `
            <div class="flex flex-col items-center justify-center
                        min-h-[300px] gap-4 text-center p-8">
                <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30
                            rounded-2xl flex items-center justify-center">
                    <i class="fas fa-circle-exclamation
                               text-red-500 text-2xl"></i>
                </div>
                <h3 class="text-lg font-black text-gray-700
                           dark:text-gray-200">
                    تعذّر تحميل هذه الخطوة
                </h3>
                <p class="text-sm text-gray-400 dark:text-gray-500">
                    تحقق من الاتصال أو أعد تحميل الصفحة
                </p>
                <button onclick="window.location.reload()"
                    class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700
                           text-white text-sm font-bold rounded-xl
                           transition">
                    إعادة التحميل
                </button>
            </div>
        `;
    }


    /* ─────────────────────────────────────────
       _scrollToFirstError
    ───────────────────────────────────────── */
    _scrollToFirstError() {
        const firstError = this._app.querySelector(
            ".fikra-input.error, .fikra-textarea.error"
        );
        firstError?.scrollIntoView({
            behavior: "smooth",
            block   : "center",
        });
        firstError?.focus({ preventScroll: true });
    }


    /* ─────────────────────────────────────────
       _getNestedValue
    ───────────────────────────────────────── */
    _getNestedValue(obj, path) {
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
    }


    /* ─────────────────────────────────────────
       _debounce
    ───────────────────────────────────────── */
    _debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }


    /* ─────────────────────────────────────────
       _wait — promise-based setTimeout
    ───────────────────────────────────────── */
    _wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // alias لـ render() للتوافق مع app.js
    goTo(stepId) {
        return this.render(stepId);
    }
    
    currentSection() {
        return this._current;
    }

}


/* ─────────────────────────────────────────────────────────
   Singleton Export
───────────────────────────────────────────────────────── */
const SectionRendererInstance = new SectionRenderer();
export default SectionRendererInstance;

/**
 * FIKRA — ui/ProgressBar.js
 * ─────────────────────────────────────────────
 * إدارة شريط التقدم + مؤشرات الخطوات
 * في أعلى الـ Wizard
 *
 * الاستخدام:
 *   import ProgressBar from "./ui/ProgressBar.js";
 *   ProgressBar.init();
 *
 *   // يتحدث تلقائياً عبر EventBus
 *   // أو يدوياً:
 *   ProgressBar.setStep(3);
 *   ProgressBar.markDone(2);
 * ─────────────────────────────────────────────
 */

import Bus,    { EVENTS } from "../core/EventBus.js";
import Router, { STEPS  } from "../core/Router.js";


/* ─────────────────────────────────────────────────────────
   PROGRESS BAR CLASS
───────────────────────────────────────────────────────── */
class ProgressBar {

    constructor() {
        /** @type {HTMLElement|null} */
        this._stepsEl  = null;

        /** @type {HTMLElement|null} */
        this._fillEl   = null;

        /** @type {number} */
        this._current  = 1;

        /** @type {Set<number>} */
        this._done     = new Set();

        /** @type {boolean} */
        this._initialized = false;
    }


    /* ─────────────────────────────────────────
       init
    ───────────────────────────────────────── */
    init() {
        if (this._initialized) return;

        this._stepsEl = document.getElementById("steps-indicator");
        this._fillEl  = document.getElementById("progress-fill");

        // بناء الـ steps dots
        this._buildSteps();

        // الاستماع للأحداث
        Bus.on(EVENTS.STEP_CHANGED,   ({ to })     => this.setStep(to));
        Bus.on(EVENTS.STEP_COMPLETED, ({ stepId }) => this.markDone(stepId));

        this._initialized = true;
    }


    /* ─────────────────────────────────────────
       setStep — تحديث الخطوة الحالية
    ───────────────────────────────────────── */
    /**
     * @param {number} stepId
     */
    setStep(stepId) {
        this._current = stepId;
        this._render();
    }


    /* ─────────────────────────────────────────
       markDone — تعليم خطوة كمكتملة
    ───────────────────────────────────────── */
    /**
     * @param {number} stepId
     */
    markDone(stepId) {
        this._done.add(stepId);
        this._render();
    }


    /* ─────────────────────────────────────────
       reset — إعادة تعيين
    ───────────────────────────────────────── */
    reset() {
        this._current = 1;
        this._done.clear();
        this._render();
    }


    /* ─────────────────────────────────────────
       _buildSteps — بناء الـ DOM مرة واحدة
    ───────────────────────────────────────── */
    _buildSteps() {
        if (!this._stepsEl) return;

        this._stepsEl.innerHTML = "";

        STEPS.forEach((step, index) => {

            // ── Step Wrapper ──────────────────
            const wrapper = document.createElement("div");
            wrapper.className = "flex flex-col items-center gap-0.5 flex-shrink-0";
            wrapper.setAttribute("data-step-wrapper", step.id);

            // ── Dot ───────────────────────────
            const dot = document.createElement("button");
            dot.className        = "step-dot pending";
            dot.setAttribute("data-step-dot", step.id);
            dot.setAttribute("aria-label", `الخطوة ${step.id}: ${step.label}`);
            dot.setAttribute("type", "button");
            dot.innerHTML        = `
                <span class="step-dot-content">
                    ${step.id}
                </span>
            `;

            // click على الـ dot → navigate
            dot.addEventListener("click", () => {
                Router.goTo(step.id);
            });

            // ── Label ─────────────────────────
            const label = document.createElement("span");
            label.className = "step-label pending";
            label.setAttribute("data-step-label", step.id);

            // نخفي الـ labels على الشاشات الصغيرة
            label.classList.add("hidden", "sm:block");
            label.textContent = step.label;

            wrapper.appendChild(dot);
            wrapper.appendChild(label);
            this._stepsEl.appendChild(wrapper);

            // ── Connector Line (بين الـ steps) ──
            if (index < STEPS.length - 1) {
                const line = document.createElement("div");
                line.className = "step-line pending mt-[-14px]";
                line.setAttribute("data-step-line", step.id);
                this._stepsEl.appendChild(line);
            }
        });

        // أول render
        this._render();
    }


    /* ─────────────────────────────────────────
       _render — تحديث الـ UI
    ───────────────────────────────────────── */
    _render() {
        if (!this._stepsEl) return;

        STEPS.forEach(step => {
            const dot   = this._stepsEl.querySelector(
                `[data-step-dot="${step.id}"]`
            );
            const label = this._stepsEl.querySelector(
                `[data-step-label="${step.id}"]`
            );
            const line  = this._stepsEl.querySelector(
                `[data-step-line="${step.id}"]`
            );

            if (!dot) return;

            const isDone    = this._done.has(step.id);
            const isActive  = this._current === step.id;
            const isPending = !isDone && !isActive;

            // ── Dot state ─────────────────────
            dot.className = `step-dot ${
                isDone   ? "done"    :
                isActive ? "active"  :
                           "pending"
            }`;

            // محتوى الـ dot
            dot.querySelector(".step-dot-content").innerHTML = isDone
                ? `<i class="fas fa-check text-[10px]"></i>`
                : `${step.id}`;

            // tooltip
            dot.setAttribute(
                "title",
                isDone   ? `${step.label} ✓` :
                isActive ? `${step.label} (الحالي)` :
                           step.label
            );

            // ── Label state ───────────────────
            if (label) {
                label.className = `step-label hidden sm:block ${
                    isDone   ? "done"    :
                    isActive ? "active"  :
                               "pending"
                }`;
            }

            // ── Line state ────────────────────
            if (line) {
                line.className = `step-line mt-[-14px] ${
                    isDone ? "done" : "pending"
                }`;
            }
        });

        // ── Progress Fill ─────────────────────
        this._updateFill();

        // ── Accessibility ─────────────────────
        this._updateAria();
    }


    /* ─────────────────────────────────────────
       _updateFill — تحديث شريط التقدم
    ───────────────────────────────────────── */
    _updateFill() {
        if (!this._fillEl) return;

        // نحسب النسبة بناءً على الخطوات المكتملة + الحالية
        const completedCount = this._done.size;
        const totalSteps     = STEPS.length;

        // الخطوة الحالية تضيف نصف خطوة للشريط
        const activeBonus = this._done.has(this._current) ? 0 : 0.5;
        const raw         = ((completedCount + activeBonus) / totalSteps) * 100;
        const percent     = Math.min(Math.round(raw), 100);

        this._fillEl.style.width = `${percent}%`;

        // تغيير لون الشريط عند الاكتمال
        if (percent === 100) {
            this._fillEl.className = `
                h-1 rounded-full transition-all duration-500
                bg-gradient-to-l from-brand-400 to-brand-600
            `.trim().replace(/\s+/g, " ");
        }
    }


    /* ─────────────────────────────────────────
       _updateAria — تحديث الـ accessibility
    ───────────────────────────────────────── */
    _updateAria() {
        const wrap = document.getElementById("progress-bar-wrap");
        if (!wrap) return;

        const percent = Math.round(
            (this._done.size / STEPS.length) * 100
        );

        wrap.setAttribute("role",            "progressbar");
        wrap.setAttribute("aria-valuenow",   percent);
        wrap.setAttribute("aria-valuemin",   "0");
        wrap.setAttribute("aria-valuemax",   "100");
        wrap.setAttribute("aria-label",
            `تقدم المشروع: ${percent}% — الخطوة ${this._current} من ${STEPS.length}`
        );
    }

    // alias لـ setStep() للتوافق مع app.js
update(stepId) {
    return this.setStep(stepId);
}

}


/* ─────────────────────────────────────────────────────────
   Singleton Export
───────────────────────────────────────────────────────── */
const ProgressBarInstance = new ProgressBar();
export default ProgressBarInstance;

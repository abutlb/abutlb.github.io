/**
 * FIKRA — core/Router.js
 * ─────────────────────────────────────────────
 * إدارة التنقل بين الـ 7 أقسام (Wizard Steps)
 * + التحكم في إظهار/إخفاء الـ screens
 *
 * الاستخدام:
 *   import Router from "./core/Router.js";
 *
 *   Router.init();
 *   Router.goTo(2);
 *   Router.next();
 *   Router.prev();
 *   Router.goToPreview();
 *   Router.goToLanding();
 * ─────────────────────────────────────────────
 */

import Bus,  { EVENTS } from "./EventBus.js";
import Store             from "./Store.js";


/* ─────────────────────────────────────────────────────────
   STEPS DEFINITION — تعريف الـ 7 أقسام
───────────────────────────────────────────────────────── */
export const STEPS = [
    {
        id       : 1,
        key      : "problem",
        label    : "المشكلة",
        icon     : "fa-triangle-exclamation",
        color    : "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-500",
        required : true,
    },
    {
        id       : 2,
        key      : "solution",
        label    : "الحل",
        icon     : "fa-lightbulb",
        color    : "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-500",
        required : true,
    },
    {
        id       : 3,
        key      : "features",
        label    : "المميزات",
        icon     : "fa-list-check",
        color    : "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-500",
        required : true,
    },
    {
        id       : 4,
        key      : "metrics",
        label    : "المقاييس",
        icon     : "fa-chart-line",
        color    : "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-500",
        required : false,
    },
    {
        id       : 5,
        key      : "timeline",
        label    : "الجدول",
        icon     : "fa-calendar-days",
        color    : "bg-orange-100 dark:bg-orange-900/30",
        iconColor: "text-orange-500",
        required : false,
    },
    {
        id       : 6,
        key      : "business",
        label    : "نموذج الربح",
        icon     : "fa-coins",
        color    : "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-500",
        required : false,
    },
    {
        id       : 7,
        key      : "tech",
        label    : "التقنية",
        icon     : "fa-code",
        color    : "bg-brand-100 dark:bg-brand-900/30",
        iconColor: "text-brand-500",
        required : false,
    },
];


/* ─────────────────────────────────────────────────────────
   SCREENS
───────────────────────────────────────────────────────── */
const SCREENS = {
    LANDING : "landing",
    WIZARD  : "wizard",
    PREVIEW : "preview",
};


/* ─────────────────────────────────────────────────────────
   ROUTER CLASS
───────────────────────────────────────────────────────── */
class Router {

    constructor() {
        /** @type {string} */
        this._currentScreen = SCREENS.LANDING;

        /** @type {number} — 1-indexed */
        this._currentStep = 1;

        /** @type {Set<number>} — الأقسام المكتملة */
        this._completedSteps = new Set();

        /** @type {boolean} */
        this._initialized = false;
    }


    /* ─────────────────────────────────────────
       init — تهيئة الـ Router
    ───────────────────────────────────────── */
    init() {
        if (this._initialized) return;

        // استعادة الـ completed steps من الـ Store
        this._restoreCompletedSteps();

        // ربط أزرار الـ header
        this._bindHeaderButtons();

        this._initialized = true;
    }


    /* ─────────────────────────────────────────
       goToLanding — الانتقال للصفحة الرئيسية
    ───────────────────────────────────────── */
    goToLanding() {
        this._currentScreen = SCREENS.LANDING;
        this._currentStep   = 1;

        this._showScreen(SCREENS.LANDING);
        this._hideProgressBar();
        this._updateHeaderButtons(SCREENS.LANDING);
    }


    /* ─────────────────────────────────────────
       startWizard — بدء الـ Wizard من القسم 1
    ───────────────────────────────────────── */
    startWizard() {
        this._currentScreen = SCREENS.WIZARD;
        this._currentStep   = 1;

        this._showScreen(SCREENS.WIZARD);
        this._showProgressBar();
        this._updateHeaderButtons(SCREENS.WIZARD);

        Bus.emit(EVENTS.STEP_CHANGED, {
            from: 0,
            to  : 1,
            step: this._getStep(1),
        });
    }


    /* ─────────────────────────────────────────
       goTo — الانتقال لخطوة معينة
    ───────────────────────────────────────── */
    /**
     * @param {number} stepId — 1 to 7
     * @param {boolean} force — تجاوز الـ validation
     */
    goTo(stepId, force = false) {
        const step = this._getStep(stepId);
        if (!step) {
            console.warn(`[Router] الخطوة ${stepId} غير موجودة`);
            return;
        }

        // لا نسمح بالقفز لخطوة لم تُكتمل ما قبلها (إلا بـ force)
        if (!force && stepId > 1) {
            const prevCompleted = this._isPrevCompleted(stepId);
            if (!prevCompleted) {
                Bus.emit(EVENTS.TOAST_SHOW, {
                    msg : "أكمل القسم الحالي أولاً",
                    type: "warning"
                });
                return;
            }
        }

        const from = this._currentStep;
        this._currentStep = stepId;

        // التأكد أننا في الـ wizard screen
        if (this._currentScreen !== SCREENS.WIZARD) {
            this._currentScreen = SCREENS.WIZARD;
            this._showScreen(SCREENS.WIZARD);
            this._showProgressBar();
            this._updateHeaderButtons(SCREENS.WIZARD);
        }

        Bus.emit(EVENTS.STEP_CHANGED, {
            from,
            to  : stepId,
            step: this._getStep(stepId),
        });
    }


    /* ─────────────────────────────────────────
       next — الخطوة التالية
    ───────────────────────────────────────── */
    next() {
        if (this._currentStep >= STEPS.length) {
            // آخر خطوة → اذهب للـ preview
            this.goToPreview();
            return;
        }
        this.goTo(this._currentStep + 1, true);
    }


    /* ─────────────────────────────────────────
       prev — الخطوة السابقة
    ───────────────────────────────────────── */
    prev() {
        if (this._currentStep <= 1) {
            // أول خطوة → اسأل عن الرجوع للـ landing
            Bus.emit(EVENTS.MODAL_OPEN, {
                id  : "confirm-back-landing",
                data: {}
            });
            return;
        }
        this.goTo(this._currentStep - 1, true);
    }


    /* ─────────────────────────────────────────
       markCompleted — تعليم خطوة كمكتملة
    ───────────────────────────────────────── */
    /**
     * @param {number} stepId
     */
    markCompleted(stepId) {
        this._completedSteps.add(stepId);

        Bus.emit(EVENTS.STEP_COMPLETED, {
            step    : this._getStep(stepId),
            stepId,
            total   : STEPS.length,
            completed: this._completedSteps.size,
        });
    }


    /* ─────────────────────────────────────────
       isCompleted — هل الخطوة مكتملة؟
    ───────────────────────────────────────── */
    /**
     * @param {number} stepId
     * @returns {boolean}
     */
    isCompleted(stepId) {
        return this._completedSteps.has(stepId);
    }


    /* ─────────────────────────────────────────
       goToPreview — الانتقال لشاشة المعاينة
    ───────────────────────────────────────── */
    goToPreview() {
        this._currentScreen = SCREENS.PREVIEW;

        this._showScreen(SCREENS.PREVIEW);
        this._hideProgressBar();
        this._updateHeaderButtons(SCREENS.PREVIEW);

        Bus.emit(EVENTS.PREVIEW_OPEN);
    }


    /* ─────────────────────────────────────────
       backFromPreview — الرجوع من المعاينة
    ───────────────────────────────────────── */
    backFromPreview() {
        this._currentScreen = SCREENS.WIZARD;

        this._showScreen(SCREENS.WIZARD);
        this._showProgressBar();
        this._updateHeaderButtons(SCREENS.WIZARD);

        Bus.emit(EVENTS.PREVIEW_CLOSE);

        // أعد إطلاق الـ step الحالي
        Bus.emit(EVENTS.STEP_CHANGED, {
            from: null,
            to  : this._currentStep,
            step: this._getStep(this._currentStep),
        });
    }


    /* ─────────────────────────────────────────
       getCurrentStep — الخطوة الحالية
    ───────────────────────────────────────── */
    getCurrentStep() {
        return this._getStep(this._currentStep);
    }


    /* ─────────────────────────────────────────
       getCurrentStepId
    ───────────────────────────────────────── */
    getCurrentStepId() {
        return this._currentStep;
    }


    /* ─────────────────────────────────────────
       getCurrentScreen
    ───────────────────────────────────────── */
    getCurrentScreen() {
        return this._currentScreen;
    }


    /* ─────────────────────────────────────────
       getProgress — نسبة التقدم في الـ wizard
    ───────────────────────────────────────── */
    /**
     * @returns {number} 0–100
     */
    getProgress() {
        return Math.round(
            ((this._currentStep - 1) / STEPS.length) * 100
        );
    }


    /* ─────────────────────────────────────────
       getAllSteps
    ───────────────────────────────────────── */
    getAllSteps() {
        return [...STEPS];
    }


    /* ─────────────────────────────────────────
       _getStep — Helper
    ───────────────────────────────────────── */
    _getStep(stepId) {
        return STEPS.find(s => s.id === stepId) ?? null;
    }


    /* ─────────────────────────────────────────
       _isPrevCompleted
    ───────────────────────────────────────── */
    _isPrevCompleted(stepId) {
        // نتحقق فقط من الـ required steps
        for (let i = 1; i < stepId; i++) {
            const step = this._getStep(i);
            if (step?.required && !this._completedSteps.has(i)) {
                return false;
            }
        }
        return true;
    }


    /* ─────────────────────────────────────────
       _restoreCompletedSteps
    ───────────────────────────────────────── */
    _restoreCompletedSteps() {
        // نتحقق من الـ Store لكل section
        STEPS.forEach(step => {
            const section = Store.getSection(step.key);
            if (this._isSectionFilled(step.key, section)) {
                this._completedSteps.add(step.id);
            }
        });
    }


    /* ─────────────────────────────────────────
       _isSectionFilled — هل القسم مكتمل؟
    ───────────────────────────────────────── */
    _isSectionFilled(key, data) {
        if (!data) return false;

        const checks = {
            problem : () => !!data.statement && !!data.audience,
            solution: () => !!data.statement && !!data.valueProp,
            features: () => data.items?.length > 0,
            metrics : () => !!data.primaryGoal,
            timeline: () => !!data.launchDate,
            business: () => !!data.model,
            tech    : () =>
                data.frontend?.length > 0 ||
                data.backend?.length  > 0 ||
                data.database?.length > 0,
        };

        return checks[key]?.() ?? false;
    }


    /* ─────────────────────────────────────────
       _showScreen — إظهار screen وإخفاء الباقي
    ───────────────────────────────────────── */
    _showScreen(screen) {
        const screens = {
            [SCREENS.LANDING] : document.getElementById("screen-landing"),
            [SCREENS.WIZARD]  : document.getElementById("screen-wizard"),
            [SCREENS.PREVIEW] : document.getElementById("screen-preview"),
        };

        Object.entries(screens).forEach(([name, el]) => {
            if (!el) return;
            if (name === screen) {
                el.classList.remove("hidden");
                el.classList.add("animate-fade-up");
                // نزيل الـ animation class بعد ما تخلص
                setTimeout(() =>
                    el.classList.remove("animate-fade-up"), 400
                );
            } else {
                el.classList.add("hidden");
            }
        });
    }


    /* ─────────────────────────────────────────
       _showProgressBar / _hideProgressBar
    ───────────────────────────────────────── */
    _showProgressBar() {
        const bar = document.getElementById("progress-bar-wrap");
        bar?.classList.remove("hidden");
        bar?.classList.add("flex");
    }

    _hideProgressBar() {
        const bar = document.getElementById("progress-bar-wrap");
        bar?.classList.add("hidden");
        bar?.classList.remove("flex");
    }


    /* ─────────────────────────────────────────
       _updateHeaderButtons
    ───────────────────────────────────────── */
    _updateHeaderButtons(screen) {
        const newProjectBtn = document.getElementById("new-project-btn");
        const exportBtn     = document.getElementById("export-btn");
        const projectBadge  = document.getElementById("project-badge");
        const badgeName     = document.getElementById("project-badge-name");

        const isWizardOrPreview =
            screen === SCREENS.WIZARD ||
            screen === SCREENS.PREVIEW;

        // New Project button
        this._toggleEl(newProjectBtn, isWizardOrPreview, "flex");

        // Export button — فقط في الـ preview
        this._toggleEl(exportBtn, screen === SCREENS.PREVIEW, "flex");

        // Project badge
        if (isWizardOrPreview) {
            const name = Store.get("meta.projectName");
            if (name && badgeName) {
                badgeName.textContent = name;
                this._toggleEl(projectBadge, true, "flex");
            }
        } else {
            this._toggleEl(projectBadge, false, "flex");
        }
    }


    /* ─────────────────────────────────────────
       _bindHeaderButtons
    ───────────────────────────────────────── */
    _bindHeaderButtons() {
        // Logo → Landing
        document.getElementById("logo-btn")
            ?.addEventListener("click", () => {
                if (this._currentScreen !== SCREENS.LANDING) {
                    Bus.emit(EVENTS.MODAL_OPEN, {
                        id  : "confirm-back-landing",
                        data: {}
                    });
                }
            });

        // New Project
        document.getElementById("new-project-btn")
            ?.addEventListener("click", () => {
                Bus.emit(EVENTS.MODAL_OPEN, {
                    id  : "confirm-new-project",
                    data: {}
                });
            });

        // Export
        document.getElementById("export-btn")
            ?.addEventListener("click", () => {
                Bus.emit(EVENTS.MODAL_OPEN, {
                    id  : "export-options",
                    data: {}
                });
            });
    }


    /* ─────────────────────────────────────────
       _toggleEl — إظهار/إخفاء عنصر
    ───────────────────────────────────────── */
    _toggleEl(el, show, displayClass = "block") {
        if (!el) return;
        if (show) {
            el.classList.remove("hidden");
            el.classList.add(displayClass);
        } else {
            el.classList.add("hidden");
            el.classList.remove(displayClass);
        }
    }
}


/* ─────────────────────────────────────────────────────────
   Singleton Export
───────────────────────────────────────────────────────── */
const RouterInstance = new Router();
export default RouterInstance;
export { SCREENS };

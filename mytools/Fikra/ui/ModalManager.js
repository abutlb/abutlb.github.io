/**
 * FIKRA — ui/ModalManager.js
 * ─────────────────────────────────────────────
 * نظام النوافذ المنبثقة — modal واحد يخدم الكل
 *
 * الاستخدام المباشر:
 *   import Modal from "./ui/ModalManager.js";
 *
 *   Modal.open("confirm-new-project");
 *   Modal.open("export-options", { projectName: "فكرة" });
 *   Modal.close();
 *
 * أو عبر EventBus:
 *   Bus.emit(EVENTS.MODAL_OPEN,  { id: "confirm-back-landing" });
 *   Bus.emit(EVENTS.MODAL_CLOSE);
 * ─────────────────────────────────────────────
 */

import Bus,    { EVENTS } from "../core/EventBus.js";
import Router             from "../core/Router.js";
import Store              from "../core/Store.js";
import Toast              from "./ToastManager.js";


/* ─────────────────────────────────────────────────────────
   MODAL TEMPLATES — كل modal له template خاص
───────────────────────────────────────────────────────── */
const TEMPLATES = {

    /* ── تأكيد مشروع جديد ──────────────────── */
    "confirm-new-project": (data) => `
        <div class="p-6">

            <!-- Icon -->
            <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30
                        rounded-2xl flex items-center justify-center
                        mx-auto mb-4">
                <i class="fas fa-rotate-right text-red-500 text-xl"></i>
            </div>

            <!-- Title -->
            <h3 class="text-lg font-black text-gray-800
                       dark:text-gray-100 text-center mb-2">
                بدء مشروع جديد؟
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400
                      text-center mb-6 leading-relaxed">
                سيتم حذف كل بيانات المشروع الحالي
                <strong class="text-gray-700 dark:text-gray-300">
                    "${data?.projectName || Store.get("meta.projectName") || "بدون اسم"}"
                </strong>
                بشكل نهائي.
            </p>

            <!-- Actions -->
            <div class="flex gap-3">
                <button data-modal-action="cancel"
                    class="flex-1 py-2.5 rounded-xl border
                           border-gray-200 dark:border-gray-700
                           text-gray-600 dark:text-gray-300
                           text-sm font-bold hover:bg-gray-50
                           dark:hover:bg-gray-800 transition">
                    إلغاء
                </button>
                <button data-modal-action="confirm-new"
                    class="flex-1 py-2.5 rounded-xl
                           bg-red-500 hover:bg-red-600
                           text-white text-sm font-black
                           transition shadow-lg shadow-red-500/20">
                    نعم، ابدأ من جديد
                </button>
            </div>

        </div>
    `,

    /* ── تأكيد الرجوع للـ Landing ──────────── */
    "confirm-back-landing": () => `
        <div class="p-6">

            <div class="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30
                        rounded-2xl flex items-center justify-center
                        mx-auto mb-4">
                <i class="fas fa-arrow-right text-yellow-500 text-xl"></i>
            </div>

            <h3 class="text-lg font-black text-gray-800
                       dark:text-gray-100 text-center mb-2">
                الرجوع للصفحة الرئيسية؟
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400
                      text-center mb-6 leading-relaxed">
                بياناتك محفوظة تلقائياً —
                يمكنك العودة ومتابعة العمل لاحقاً.
            </p>

            <div class="flex gap-3">
                <button data-modal-action="cancel"
                    class="flex-1 py-2.5 rounded-xl border
                           border-gray-200 dark:border-gray-700
                           text-gray-600 dark:text-gray-300
                           text-sm font-bold hover:bg-gray-50
                           dark:hover:bg-gray-800 transition">
                    تابع العمل
                </button>
                <button data-modal-action="confirm-back"
                    class="flex-1 py-2.5 rounded-xl
                           bg-yellow-500 hover:bg-yellow-600
                           text-white text-sm font-black transition">
                    نعم، ارجع
                </button>
            </div>

        </div>
    `,

    /* ── خيارات التصدير ─────────────────────── */
    "export-options": (data) => `
        <div class="p-6">

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-lg font-black text-gray-800
                               dark:text-gray-100">
                        تصدير المشروع
                    </h3>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        اختر صيغة التصدير المناسبة
                    </p>
                </div>
                <button data-modal-action="cancel"
                    class="w-8 h-8 rounded-xl bg-gray-100
                           dark:bg-gray-800 flex items-center
                           justify-center text-gray-400
                           hover:text-gray-600 dark:hover:text-gray-200
                           transition">
                    <i class="fas fa-xmark text-sm"></i>
                </button>
            </div>

            <!-- Export Options -->
            <div class="space-y-3 mb-6">

                <!-- PDF -->
                <button data-modal-action="export-pdf"
                    class="w-full flex items-center gap-4 p-4
                           bg-gray-50 dark:bg-gray-800/50
                           hover:bg-red-50 dark:hover:bg-red-900/20
                           border border-gray-200 dark:border-gray-700
                           hover:border-red-300 dark:hover:border-red-800
                           rounded-xl transition group">
                    <div class="w-10 h-10 bg-red-100 dark:bg-red-900/40
                                rounded-xl flex items-center justify-center
                                flex-shrink-0 group-hover:scale-110 transition">
                        <i class="fas fa-file-pdf text-red-500"></i>
                    </div>
                    <div class="text-right flex-1">
                        <p class="text-sm font-black text-gray-700
                                  dark:text-gray-200">
                            تصدير PDF
                        </p>
                        <p class="text-xs text-gray-400 dark:text-gray-500">
                            جاهز للطباعة والمشاركة
                        </p>
                    </div>
                    <i class="fas fa-chevron-left text-gray-300
                              dark:text-gray-600 text-xs"></i>
                </button>

                <!-- JSON -->
                <button data-modal-action="export-json"
                    class="w-full flex items-center gap-4 p-4
                           bg-gray-50 dark:bg-gray-800/50
                           hover:bg-blue-50 dark:hover:bg-blue-900/20
                           border border-gray-200 dark:border-gray-700
                           hover:border-blue-300 dark:hover:border-blue-800
                           rounded-xl transition group">
                    <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/40
                                rounded-xl flex items-center justify-center
                                flex-shrink-0 group-hover:scale-110 transition">
                        <i class="fas fa-file-code text-blue-500"></i>
                    </div>
                    <div class="text-right flex-1">
                        <p class="text-sm font-black text-gray-700
                                  dark:text-gray-200">
                            تصدير JSON
                        </p>
                        <p class="text-xs text-gray-400 dark:text-gray-500">
                            نسخة احتياطية كاملة للبيانات
                        </p>
                    </div>
                    <i class="fas fa-chevron-left text-gray-300
                              dark:text-gray-600 text-xs"></i>
                </button>

                <!-- Markdown -->
                <button data-modal-action="export-md"
                    class="w-full flex items-center gap-4 p-4
                           bg-gray-50 dark:bg-gray-800/50
                           hover:bg-purple-50 dark:hover:bg-purple-900/20
                           border border-gray-200 dark:border-gray-700
                           hover:border-purple-300 dark:hover:border-purple-800
                           rounded-xl transition group">
                    <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/40
                                rounded-xl flex items-center justify-center
                                flex-shrink-0 group-hover:scale-110 transition">
                        <i class="fas fa-hashtag text-purple-500"></i>
                    </div>
                    <div class="text-right flex-1">
                        <p class="text-sm font-black text-gray-700
                                  dark:text-gray-200">
                            تصدير Markdown
                        </p>
                        <p class="text-xs text-gray-400 dark:text-gray-500">
                            مناسب للـ GitHub و Notion
                        </p>
                    </div>
                    <i class="fas fa-chevron-left text-gray-300
                              dark:text-gray-600 text-xs"></i>
                </button>

            </div>

            <!-- Template Selector -->
            <div class="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p class="text-xs font-bold text-gray-500
                          dark:text-gray-400 mb-3">
                    قالب التصدير
                </p>
                <div class="flex gap-2" id="template-selector">

                    <button data-template="modern"
                        class="template-btn flex-1 py-2 rounded-lg
                               text-xs font-bold transition border-2
                               border-brand-500 bg-brand-50
                               dark:bg-brand-900/20 text-brand-600
                               dark:text-brand-400">
                        Modern
                    </button>
                    <button data-template="minimal"
                        class="template-btn flex-1 py-2 rounded-lg
                               text-xs font-bold transition border-2
                               border-transparent bg-gray-100
                               dark:bg-gray-800 text-gray-500
                               dark:text-gray-400
                               hover:border-gray-300">
                        Minimal
                    </button>
                    <button data-template="dark"
                        class="template-btn flex-1 py-2 rounded-lg
                               text-xs font-bold transition border-2
                               border-transparent bg-gray-100
                               dark:bg-gray-800 text-gray-500
                               dark:text-gray-400
                               hover:border-gray-300">
                        Dark
                    </button>

                </div>
            </div>

        </div>
    `,

    /* ── تأكيد حذف feature ──────────────────── */
    "confirm-delete-feature": (data) => `
        <div class="p-6">

            <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30
                        rounded-2xl flex items-center justify-center
                        mx-auto mb-4">
                <i class="fas fa-trash text-red-500 text-xl"></i>
            </div>

            <h3 class="text-lg font-black text-gray-800
                       dark:text-gray-100 text-center mb-2">
                حذف الميزة؟
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400
                      text-center mb-6">
                سيتم حذف
                <strong class="text-gray-700 dark:text-gray-300">
                    "${data?.featureName || "هذه الميزة"}"
                </strong>
                بشكل نهائي.
            </p>

            <div class="flex gap-3">
                <button data-modal-action="cancel"
                    class="flex-1 py-2.5 rounded-xl border
                           border-gray-200 dark:border-gray-700
                           text-gray-600 dark:text-gray-300
                           text-sm font-bold hover:bg-gray-50
                           dark:hover:bg-gray-800 transition">
                    إلغاء
                </button>
                <button data-modal-action="confirm-delete"
                        data-feature-id="${data?.featureId || ""}"
                    class="flex-1 py-2.5 rounded-xl
                           bg-red-500 hover:bg-red-600
                           text-white text-sm font-black
                           transition">
                    احذف
                </button>
            </div>

        </div>
    `,

    /* ── معلومات عن فكرة ────────────────────── */
    "about": () => `
        <div class="p-6">

            <!-- Header -->
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-gradient-to-br
                            from-brand-400 to-brand-700
                            rounded-2xl flex items-center justify-center
                            mx-auto mb-3 shadow-lg shadow-brand-500/30">
                    <i class="fas fa-lightbulb text-white text-2xl"></i>
                </div>
                <h3 class="text-xl font-black text-gray-800
                           dark:text-gray-100">
                    فكرة
                </h3>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    MVP Designer — v1.0.0
                </p>
            </div>

            <!-- Description -->
            <p class="text-sm text-gray-500 dark:text-gray-400
                      text-center leading-relaxed mb-6">
                أداة مجانية تساعدك على توثيق مشروعك
                من الفكرة للـ MVP في دقائق،
                وتصديره بقالب احترافي.
            </p>

            <!-- Features -->
            <div class="space-y-2 mb-6">
                ${[
                    ["fa-lock",        "بياناتك محفوظة محلياً فقط — لا سيرفر"],
                    ["fa-code-branch", "مفتوح المصدر على GitHub"],
                    ["fa-heart",       "مبني بـ Vanilla JS — بدون frameworks"],
                ].map(([icon, text]) => `
                    <div class="flex items-center gap-3 text-sm
                                text-gray-600 dark:text-gray-300">
                        <i class="fas ${icon} text-brand-500 w-4 text-center"></i>
                        <span>${text}</span>
                    </div>
                `).join("")}
            </div>

            <button data-modal-action="cancel"
                class="w-full py-2.5 rounded-xl
                       bg-brand-600 hover:bg-brand-700
                       text-white text-sm font-black transition">
                حسناً 👍
            </button>

        </div>
    `,
};


/* ─────────────────────────────────────────────────────────
   MODAL MANAGER CLASS
───────────────────────────────────────────────────────── */
class ModalManager {

    constructor() {
        /** @type {HTMLElement|null} */
        this._overlay = null;

        /** @type {HTMLElement|null} */
        this._box     = null;

        /** @type {string|null} */
        this._current = null;

        /** @type {object|null} */
        this._data    = null;

        /** @type {boolean} */
        this._initialized = false;
    }


    /* ─────────────────────────────────────────
       init
    ───────────────────────────────────────── */
    init() {
        if (this._initialized) return;

        this._overlay = document.getElementById("modal-overlay");
        this._box     = document.getElementById("modal-box");

        // إغلاق عند الضغط على الـ overlay
        this._overlay?.addEventListener("click", (e) => {
            if (e.target === this._overlay) this.close();
        });

        // إغلاق بـ Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this._current) this.close();
        });

        // الاستماع لـ EventBus
        Bus.on(EVENTS.MODAL_OPEN,  ({ id, data } = {}) => this.open(id, data));
        Bus.on(EVENTS.MODAL_CLOSE, ()                   => this.close());

        this._initialized = true;
    }


    /* ─────────────────────────────────────────
       open — فتح modal
    ───────────────────────────────────────── */
    /**
     * @param {string} id   — اسم الـ modal
     * @param {object} data — بيانات إضافية
     */
    open(id, data = {}) {
        const template = TEMPLATES[id];
        if (!template) {
            console.warn(`[ModalManager] Modal "${id}" غير موجود`);
            return;
        }

        this._current = id;
        this._data    = data;

        // حقن المحتوى
        this._box.innerHTML = template(data);

        // ربط الأزرار
        this._bindActions(id, data);

        // ربط الـ template selector لو موجود
        if (id === "export-options") {
            this._bindTemplateSelector();
        }

        // إظهار الـ overlay
        this._overlay.classList.remove("hidden");

        // animation
        requestAnimationFrame(() => {
            this._box.classList.add("animate-fade-up");
            setTimeout(() =>
                this._box.classList.remove("animate-fade-up"), 400
            );
        });

        // focus trap — نركّز على أول زر
        setTimeout(() => {
            this._box.querySelector("button")?.focus();
        }, 50);

        // منع scroll الـ body
        document.body.style.overflow = "hidden";
    }


    /* ─────────────────────────────────────────
       close — إغلاق الـ modal
    ───────────────────────────────────────── */
    close() {
        if (!this._current) return;

        this._overlay.classList.add("hidden");
        this._box.innerHTML   = "";
        this._current         = null;
        this._data            = null;

        // إعادة الـ scroll
        document.body.style.overflow = "";

        Bus.emit(EVENTS.MODAL_CLOSE);
    }


    /* ─────────────────────────────────────────
       _bindActions — ربط أزرار الـ modal
    ───────────────────────────────────────── */
    _bindActions(id, data) {
        this._box.querySelectorAll("[data-modal-action]")
            .forEach(btn => {
                btn.addEventListener("click", () => {
                    const action = btn.getAttribute("data-modal-action");
                    this._handleAction(action, id, data, btn);
                });
            });
    }


    /* ─────────────────────────────────────────
       _handleAction — معالجة الأحداث
    ───────────────────────────────────────── */
    _handleAction(action, modalId, data, btn) {
        switch (action) {

            // ── إلغاء (كل الـ modals) ─────────
            case "cancel":
                this.close();
                break;

            // ── مشروع جديد ────────────────────
            case "confirm-new":
                Store.reset();
                Router.goToLanding();
                this.close();
                Toast.success("تم مسح المشروع — ابدأ من جديد 🚀");
                break;

            // ── رجوع للـ landing ──────────────
            case "confirm-back":
                Router.goToLanding();
                this.close();
                break;

            // ── تصدير PDF ─────────────────────
            case "export-pdf":
                this.close();
                Bus.emit(EVENTS.EXPORT_STARTED, { type: "pdf" });
                break;

            // ── تصدير JSON ────────────────────
            case "export-json":
                this.close();
                Bus.emit(EVENTS.EXPORT_STARTED, { type: "json" });
                break;

            // ── تصدير Markdown ────────────────
            case "export-md":
                this.close();
                Bus.emit(EVENTS.EXPORT_STARTED, { type: "markdown" });
                break;

            // ── حذف feature ───────────────────
            case "confirm-delete": {
                const featureId = btn.getAttribute("data-feature-id");
                if (featureId) {
                    Bus.emit(EVENTS.FEATURE_REMOVED, { id: featureId });
                    Toast.success("تم حذف الميزة");
                }
                this.close();
                break;
            }

            default:
                console.warn(`[ModalManager] action غير معروف: "${action}"`);
                this.close();
        }
    }


    /* ─────────────────────────────────────────
       _bindTemplateSelector — اختيار القالب
    ───────────────────────────────────────── */
    _bindTemplateSelector() {
        const selector = this._box.querySelector("#template-selector");
        if (!selector) return;

        // الـ template الحالي من الـ Store
        const currentTemplate = Store.get("meta.templateId") || "modern";

        // تحديث الـ active state
        this._updateTemplateBtns(selector, currentTemplate);

        selector.querySelectorAll("[data-template]").forEach(btn => {
            btn.addEventListener("click", () => {
                const templateId = btn.getAttribute("data-template");
                Store.setTemplate(templateId);
                this._updateTemplateBtns(selector, templateId);
            });
        });
    }


    /* ─────────────────────────────────────────
       _updateTemplateBtns
    ───────────────────────────────────────── */
    _updateTemplateBtns(selector, activeId) {
        selector.querySelectorAll("[data-template]").forEach(btn => {
            const id       = btn.getAttribute("data-template");
            const isActive = id === activeId;

            btn.className = `template-btn flex-1 py-2 rounded-lg
                text-xs font-bold transition border-2
                ${isActive
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                    : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                }
            `.trim().replace(/\s+/g, " ");
        });
    }
}


/* ─────────────────────────────────────────────────────────
   Singleton Export
───────────────────────────────────────────────────────── */
const ModalInstance = new ModalManager();
export default ModalInstance;

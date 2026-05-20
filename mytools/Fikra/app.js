/**
 * FIKRA — app.js
 * ─────────────────────────────────────────────
 * نقطة الدخول الرئيسية
 */

import Store           from "./core/Store.js";
import Router          from "./core/Router.js";
import Bus, { EVENTS } from "./core/EventBus.js";
import Validator       from "./core/Validator.js";
import SectionRenderer from "./ui/SectionRenderer.js";
import ToastManager    from "./ui/ToastManager.js";
import ThemeToggle     from "./ui/ThemeToggle.js";
import ProgressBar     from "./ui/ProgressBar.js";
import ModalManager    from "./ui/ModalManager.js";

import S1_Problem  from "./sections/S1_Problem.js";
import S2_Solution from "./sections/S2_Solution.js";
import S3_Features from "./sections/S3_Features.js";
import S4_Metrics  from "./sections/S4_Metrics.js";
import S5_Timeline from "./sections/S5_Timeline.js";
import S6_Business from "./sections/S6_Business.js";
import S7_Tech     from "./sections/S7_Tech.js";
import S8_Summary  from "./sections/S8_Summary.js";


/* ─────────────────────────────────────────────────────
   SECTIONS REGISTRY
───────────────────────────────────────────────────── */
const SECTIONS = [
    S1_Problem,
    S2_Solution,
    S3_Features,
    S4_Metrics,
    S5_Timeline,
    S6_Business,
    S7_Tech,
    S8_Summary,
];


/* ─────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────── */
function init() {

    // 1. Theme
    ThemeToggle.init();

    // 2. Toast
    ToastManager.init();

    // 3. Modal
    ModalManager.init();

    // 4. Auto-save (قبل أي شيء آخر)
    _initAutoSave();

    // 5. Keyboard shortcuts
    _initKeyboardShortcuts();

    // 6. Project Name + زر البداية
    _initProjectName();

    // 7. New Project button
    _initNewProjectBtn();
}


/* ─────────────────────────────────────────────────────
   PROJECT NAME + START BUTTON
───────────────────────────────────────────────────── */
function _initProjectName() {
    const nameInput = document.querySelector("#landing-project-name");
    const startBtn  = document.querySelector("#start-btn");

    if (!nameInput || !startBtn) return;

    // تفعيل/تعطيل الزر بناءً على الإدخال
    const toggleBtn = () => {
        startBtn.disabled = nameInput.value.trim().length === 0;
    };
    nameInput.addEventListener("input", toggleBtn);
    toggleBtn();

    // Enter يضغط الزر
    nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !startBtn.disabled) startBtn.click();
    });

    // الضغط على "ابدأ التصميم"
    startBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        if (!name) return;

        // حفظ الاسم
        Store.set("meta.projectName", name);
        Store.persist();

        // تحديث عنوان الصفحة
        document.title = `${name} — فكرة`;

        // badge الهيدر
        _showProjectBadge(name);

        // إظهار أزرار الهيدر
        document.querySelector("#new-project-btn")
            ?.classList.replace("hidden", "flex");
        document.querySelector("#export-btn")
            ?.classList.replace("hidden", "flex");

        // إخفاء Landing وإظهار Wizard
        document.querySelector("#screen-landing")
            ?.classList.add("hidden");
        document.querySelector("#screen-wizard")
            ?.classList.remove("hidden");

        // إظهار Progress Bar
        document.querySelector("#progress-bar-wrap")
            ?.classList.remove("hidden");

        // تشغيل الـ Wizard
        _startWizard();
    });

    // لو في مشروع محفوظ → اعرضه مباشرة
    const savedName = Store.get("meta.projectName");
    if (savedName) {
        nameInput.value = savedName;
        toggleBtn();
    }
}


/* ─────────────────────────────────────────────────────
   START WIZARD
───────────────────────────────────────────────────── */
function _startWizard() {

    // تهيئة SectionRenderer
    SectionRenderer.init();

    // تهيئة ProgressBar
    ProgressBar.init({
        container: document.querySelector("#steps-indicator"),
        fill     : document.querySelector("#progress-fill"),
        sections : SECTIONS,
    });

    // تهيئة Router
    Router.init({
        sections: SECTIONS,
        onChange: (idx) => {
            SectionRenderer.render(idx);
            ProgressBar.setStep(idx);
        },
    });

    // عرض أول قسم (أو القسم المحفوظ)
    const savedIdx = Store.get("meta.currentSection") ?? 1;
    SectionRenderer.render(savedIdx);
    ProgressBar.setStep(savedIdx);
}


/* ─────────────────────────────────────────────────────
   SHOW PROJECT BADGE
───────────────────────────────────────────────────── */
function _showProjectBadge(name) {
    const badge     = document.querySelector("#project-badge");
    const badgeName = document.querySelector("#project-badge-name");
    if (!badge || !badgeName) return;

    badgeName.textContent = name;
    badge.classList.remove("hidden");
    badge.classList.add("flex");
}


/* ─────────────────────────────────────────────────────
   NEW PROJECT BUTTON
───────────────────────────────────────────────────── */
function _initNewProjectBtn() {
    const btn = document.querySelector("#new-project-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        ModalManager.confirm({
            title  : "بدء مشروع جديد",
            message: "سيتم مسح بيانات المشروع الحالي. هل أنت متأكد؟",
            onConfirm: () => {
                Store.clear();
                window.location.reload();
            },
        });
    });
}


/* ─────────────────────────────────────────────────────
   AUTO-SAVE
───────────────────────────────────────────────────── */
function _initAutoSave() {
    // حفظ عند إغلاق الصفحة
    window.addEventListener("beforeunload", () => {
        Store.persist();
    });

    // حفظ كل 30 ثانية
    setInterval(() => {
        Store.persist();
        _showSaveIndicator();
    }, 30_000);

    // حفظ عند أي تغيير في الـ Store
    Bus.on(EVENTS.STORE_CHANGED, () => {
        Store.persist();
    });
}

function _showSaveIndicator() {
    const indicator = document.querySelector("#save-indicator");
    if (!indicator) return;

    indicator.classList.replace("opacity-0", "opacity-100");
    setTimeout(() => {
        indicator.classList.replace("opacity-100", "opacity-0");
    }, 2000);
}


/* ─────────────────────────────────────────────────────
   KEYBOARD SHORTCUTS
───────────────────────────────────────────────────── */
function _initKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {

        // Ctrl/Cmd + S → حفظ
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            Store.persist();
            ToastManager.success("تم الحفظ ✓");
            return;
        }

        // Alt + ← → الخطوة السابقة
        if (e.altKey && e.key === "ArrowLeft") {
            e.preventDefault();
            Router.back?.();
            return;
        }

        // Alt + → → الخطوة التالية
        if (e.altKey && e.key === "ArrowRight") {
            e.preventDefault();
            document.querySelector("#btn-next")?.click();
            return;
        }

        // Escape → إغلاق الـ Modal
        if (e.key === "Escape") {
            ModalManager.close();
        }
    });
}


/* ─────────────────────────────────────────────────────
   BOOT
───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", init);

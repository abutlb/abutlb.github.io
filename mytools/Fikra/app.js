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

    // 4. Store
    // Store.init();

    // 5. Progress Bar
    ProgressBar.init({
        container: document.querySelector("#progress-bar"),
        sections : SECTIONS,
    });

    // 6. Section Renderer
    SectionRenderer.init({
        container: document.querySelector("#section-container"),
        sections : SECTIONS,
        onNext   : _handleNext,
        onPrev   : _handlePrev,
    });

    // 7. Router
    Router.init({
        sections: SECTIONS,
        onChange: (idx) => {
            SectionRenderer.goTo(idx);
            ProgressBar.update(idx);
        },
    });

    // 8. Auto-save
    _initAutoSave();

    // 9. Store → UI sync
    _bindStoreSync();

    // 10. Project Name
    _initProjectName();

    // 11. Keyboard shortcuts
    _initKeyboardShortcuts();

    // 12. Render أول قسم
    const savedIdx = Store.get("meta.currentSection") ?? 0;
    SectionRenderer.goTo(savedIdx);
    ProgressBar.update(savedIdx);
}


/* ─────────────────────────────────────────────────────
   NAVIGATION HANDLERS
───────────────────────────────────────────────────── */
function _handleNext(currentIdx, data) {

    const section = SECTIONS[currentIdx];
    const errors  = Validator.validate(section.key, data);

    if (errors && Object.keys(errors).length > 0) {
        Validator.showErrors(
            document.querySelector("#section-container"),
            errors
        );
        ToastManager.error("أكمل الحقول المطلوبة أولاً");
        return false;
    }

    _saveSection(section.key, data);

    const nextIdx = currentIdx + 1;
    if (nextIdx < SECTIONS.length) {
        SectionRenderer.goTo(nextIdx);
        ProgressBar.update(nextIdx);
        Store.set("meta.currentSection", nextIdx);
        Router.push(nextIdx);

        if (nextIdx === SECTIONS.length - 1) {
            ToastManager.success("وصلت للملخص النهائي! 🎉");
        }
    }

    return true;
}

function _handlePrev(currentIdx) {
    const prevIdx = currentIdx - 1;
    if (prevIdx >= 0) {
        SectionRenderer.goTo(prevIdx);
        ProgressBar.update(prevIdx);
        Store.set("meta.currentSection", prevIdx);
        Router.push(prevIdx);
    }
}


/* ─────────────────────────────────────────────────────
   SAVE SECTION DATA
───────────────────────────────────────────────────── */
function _saveSection(key, data) {
    if (!data || typeof data !== "object") return;

    Object.entries(data).forEach(([field, value]) => {
        Store.set(`${key}.${field}`, value);
    });

    Bus.emit(EVENTS.STORE_CHANGED, { key });
}


/* ─────────────────────────────────────────────────────
   STORE → UI SYNC
───────────────────────────────────────────────────── */
function _bindStoreSync() {
    const container = document.querySelector("#section-container");
    if (!container) return;

    container.addEventListener("input",  _onFieldChange);
    container.addEventListener("change", _onFieldChange);
}

function _onFieldChange(e) {
    const el    = e.target;
    const field = el.getAttribute("data-field");
    if (!field) return;

    const section = SectionRenderer.currentSection();
    if (!section) return;

    const key   = `${section.key}.${field}`;
    const value = el.type === "checkbox" ? el.checked : el.value;

    Store.set(key, value);
    Bus.emit(EVENTS.STORE_CHANGED, { key, value });
}


/* ─────────────────────────────────────────────────────
   AUTO-SAVE
───────────────────────────────────────────────────── */
function _initAutoSave() {
    window.addEventListener("beforeunload", () => {
        Store.persist();
    });

    setInterval(() => {
        Store.persist();
        _showSaveIndicator();
    }, 30_000);

    Bus.on(EVENTS.STORE_CHANGED, () => {
        Store.persist();
    });
}

function _showSaveIndicator() {
    const indicator = document.querySelector("#save-indicator");
    if (!indicator) return;

    indicator.classList.remove("opacity-0");
    indicator.classList.add("opacity-100");

    setTimeout(() => {
        indicator.classList.remove("opacity-100");
        indicator.classList.add("opacity-0");
    }, 2000);
}


/* ─────────────────────────────────────────────────────
   PROJECT NAME
───────────────────────────────────────────────────── */
function _initProjectName() {

    const nameInput = document.querySelector("#landing-project-name");
    const startBtn  = document.querySelector("#start-btn");

    if (!nameInput || !startBtn) return;

    // ── تفعيل/تعطيل زر البداية حسب الإدخال ──
    const toggleBtn = () => {
        const hasValue = nameInput.value.trim().length > 0;
        startBtn.disabled = !hasValue;
    };

    nameInput.addEventListener("input", toggleBtn);
    toggleBtn(); // حالة أولية

    // ── Enter يشغّل الزر ──
    nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !startBtn.disabled) {
            startBtn.click();
        }
    });

    // ── الضغط على زر البداية ──
    startBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        if (!name) return;

        // حفظ اسم المشروع
        Store.initProject(name);

        // تحديث عنوان الصفحة
        document.title = `${name} — فكرة`;

        // إظهار badge الاسم في الهيدر
        const badge     = document.querySelector("#project-badge");
        const badgeName = document.querySelector("#project-badge-name");
        if (badge && badgeName) {
            badgeName.textContent = name;
            badge.classList.remove("hidden");
            badge.classList.add("flex");
        }

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

        // تهيئة الـ Wizard وعرض أول قسم
        ProgressBar.init();
        SectionRenderer.init();
        SectionRenderer.render(1);
    });

    // ── لو في مشروع محفوظ → اعرضه مباشرة ──
    if (Store.hasProject()) {
        const savedName = Store.get("meta.projectName");
        nameInput.value = savedName;
        toggleBtn();
    }
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

        // Alt + ← / → → التنقل
        if (e.altKey) {
            const current = Store.get("meta.currentSection") ?? 0;

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                _handlePrev(current);
            }

            if (e.key === "ArrowRight") {
                e.preventDefault();
                document.querySelector("#btn-next")?.click();
            }
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

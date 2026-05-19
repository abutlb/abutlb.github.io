/**
 * FIKRA — ui/ThemeToggle.js
 * ─────────────────────────────────────────────
 * إدارة الـ Dark / Light Mode
 *
 * الاستخدام:
 *   import ThemeToggle from "./ui/ThemeToggle.js";
 *   ThemeToggle.init();
 * ─────────────────────────────────────────────
 */

import Bus, { EVENTS } from "../core/EventBus.js";


/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const STORAGE_KEY = "fikra_theme";
const THEMES      = { LIGHT: "light", DARK: "dark" };


/* ─────────────────────────────────────────────────────────
   THEME TOGGLE CLASS
───────────────────────────────────────────────────────── */
class ThemeToggle {

    constructor() {
        /** @type {"light"|"dark"} */
        this._theme = THEMES.LIGHT;

        /** @type {HTMLElement|null} */
        this._btn  = null;

        /** @type {HTMLElement|null} */
        this._icon = null;

        /** @type {boolean} */
        this._initialized = false;
    }


    /* ─────────────────────────────────────────
       init — تهيئة الـ ThemeToggle
    ───────────────────────────────────────── */
    init() {
        if (this._initialized) return;

        this._btn  = document.getElementById("theme-toggle");
        this._icon = document.getElementById("theme-icon");

        // قراءة الـ theme الحالي من الـ HTML class
        // (تم تعيينه مبكراً في index.html لتجنب الوميض)
        this._theme = document.documentElement.classList.contains("dark")
            ? THEMES.DARK
            : THEMES.LIGHT;

        // تحديث الأيقونة بناءً على الـ theme الحالي
        this._updateIcon();

        // ربط الزر
        this._btn?.addEventListener("click", () => this.toggle());

        // الاستماع لـ EventBus (لو module ثاني أراد تغيير الـ theme)
        Bus.on(EVENTS.THEME_CHANGED, ({ theme } = {}) => {
            if (theme && theme !== this._theme) {
                this._applyTheme(theme);
            }
        });

        // الاستماع لتغيير تفضيل النظام
        window.matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", (e) => {
                // نغيّر فقط لو المستخدم لم يختر يدوياً
                if (!localStorage.getItem(STORAGE_KEY)) {
                    this._applyTheme(
                        e.matches ? THEMES.DARK : THEMES.LIGHT,
                        false // لا نحفظ في localStorage
                    );
                }
            });

        this._initialized = true;
    }


    /* ─────────────────────────────────────────
       toggle — تبديل الـ theme
    ───────────────────────────────────────── */
    toggle() {
        const next = this._theme === THEMES.LIGHT
            ? THEMES.DARK
            : THEMES.LIGHT;

        this._applyTheme(next);
    }


    /* ─────────────────────────────────────────
       setTheme — تعيين theme محدد
    ───────────────────────────────────────── */
    /**
     * @param {"light"|"dark"} theme
     */
    setTheme(theme) {
        if (theme !== THEMES.LIGHT && theme !== THEMES.DARK) return;
        this._applyTheme(theme);
    }


    /* ─────────────────────────────────────────
       getTheme — قراءة الـ theme الحالي
    ───────────────────────────────────────── */
    getTheme() {
        return this._theme;
    }


    /* ─────────────────────────────────────────
       isDark
    ───────────────────────────────────────── */
    isDark() {
        return this._theme === THEMES.DARK;
    }


    /* ─────────────────────────────────────────
       _applyTheme — تطبيق الـ theme
    ───────────────────────────────────────── */
    /**
     * @param {"light"|"dark"} theme
     * @param {boolean}        save  — هل نحفظ في localStorage؟
     */
    _applyTheme(theme, save = true) {
        const html = document.documentElement;

        // تبديل الـ class
        if (theme === THEMES.DARK) {
            html.classList.remove("light");
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
            html.classList.add("light");
        }

        this._theme = theme;

        // حفظ في localStorage
        if (save) {
            localStorage.setItem(STORAGE_KEY, theme);
        }

        // تحديث الأيقونة مع animation
        this._updateIcon();

        // إطلاق الحدث
        Bus.emit(EVENTS.THEME_CHANGED, { theme });
    }


    /* ─────────────────────────────────────────
       _updateIcon — تحديث أيقونة الزر
    ───────────────────────────────────────── */
    _updateIcon() {
        if (!this._icon) return;

        // animation بسيطة — rotate + fade
        this._icon.style.transition = "transform 0.3s ease, opacity 0.2s ease";
        this._icon.style.opacity    = "0";
        this._icon.style.transform  = "rotate(90deg) scale(0.7)";

        setTimeout(() => {
            if (this._theme === THEMES.DARK) {
                // في الـ dark mode → أظهر شمس
                this._icon.className =
                    "fas fa-sun text-yellow-400 text-sm";
                this._btn?.setAttribute("aria-label", "التحويل للوضع الفاتح");
            } else {
                // في الـ light mode → أظهر قمر
                this._icon.className =
                    "fas fa-moon text-gray-500 text-sm";
                this._btn?.setAttribute("aria-label", "التحويل للوضع الداكن");
            }

            this._icon.style.opacity   = "1";
            this._icon.style.transform = "rotate(0deg) scale(1)";
        }, 150);
    }
}


/* ─────────────────────────────────────────────────────────
   Singleton Export
───────────────────────────────────────────────────────── */
const ThemeToggleInstance = new ThemeToggle();
export default ThemeToggleInstance;

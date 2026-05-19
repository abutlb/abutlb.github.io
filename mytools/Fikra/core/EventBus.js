/**
 * FIKRA — core/EventBus.js
 * ─────────────────────────────────────────────
 * نظام تواصل بين الـ modules بدون dependencies
 * مبني على نمط Publisher / Subscriber
 *
 * الاستخدام:
 *   import Bus from "./core/EventBus.js";
 *
 *   Bus.on("store:updated", (data) => { ... });
 *   Bus.emit("store:updated", { key: "problem" });
 *   Bus.off("store:updated", handler);
 *   Bus.once("app:ready", () => { ... });
 * ─────────────────────────────────────────────
 */

class EventBus {

    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this._listeners = new Map();

        /** تتبع الـ once listeners لإزالتها بعد أول استدعاء */
        /** @type {Map<Function, Function>} */
        this._onceWrappers = new Map();
    }


    /* ─────────────────────────────────────────
       on — الاشتراك في حدث
    ───────────────────────────────────────── */
    /**
     * @param {string}   event   — اسم الحدث
     * @param {Function} handler — الدالة المستدعاة
     * @returns {Function} unsubscribe — دالة لإلغاء الاشتراك
     */
    on(event, handler) {
        if (typeof handler !== "function") {
            console.warn(`[EventBus] on("${event}"): handler ليس دالة`);
            return () => {};
        }

        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }

        this._listeners.get(event).add(handler);

        // يرجع دالة unsubscribe مباشرة — مريحة للاستخدام
        return () => this.off(event, handler);
    }


    /* ─────────────────────────────────────────
       once — اشتراك لمرة واحدة فقط
    ───────────────────────────────────────── */
    /**
     * @param {string}   event
     * @param {Function} handler
     * @returns {Function} unsubscribe
     */
    once(event, handler) {
        if (typeof handler !== "function") {
            console.warn(`[EventBus] once("${event}"): handler ليس دالة`);
            return () => {};
        }

        // نلف الـ handler بـ wrapper يحذف نفسه بعد أول استدعاء
        const wrapper = (payload) => {
            handler(payload);
            this.off(event, wrapper);
            this._onceWrappers.delete(handler);
        };

        // نحفظ الـ wrapper مربوطاً بالـ handler الأصلي
        // علشان لو المستخدم استدعى off بالـ handler الأصلي يشتغل صح
        this._onceWrappers.set(handler, wrapper);

        return this.on(event, wrapper);
    }


    /* ─────────────────────────────────────────
       off — إلغاء الاشتراك
    ───────────────────────────────────────── */
    /**
     * @param {string}   event
     * @param {Function} handler
     */
    off(event, handler) {
        if (!this._listeners.has(event)) return;

        const listeners = this._listeners.get(event);

        // لو كان once، نحذف الـ wrapper مش الـ handler الأصلي
        const target = this._onceWrappers.get(handler) ?? handler;

        listeners.delete(target);
        this._onceWrappers.delete(handler);

        // نظّف الـ Map لو ما في مشتركين
        if (listeners.size === 0) {
            this._listeners.delete(event);
        }
    }


    /* ─────────────────────────────────────────
       emit — إطلاق حدث
    ───────────────────────────────────────── */
    /**
     * @param {string} event
     * @param {*}      payload — البيانات المرسلة (اختياري)
     */
    emit(event, payload) {
        if (!this._listeners.has(event)) return;

        // نسخ الـ Set قبل الـ iteration
        // لأن الـ once قد يعدّل الـ Set أثناء الـ loop
        const listeners = [...this._listeners.get(event)];

        listeners.forEach(handler => {
            try {
                handler(payload);
            } catch (err) {
                console.error(
                    `[EventBus] خطأ في handler الحدث "${event}":`,
                    err
                );
            }
        });
    }


    /* ─────────────────────────────────────────
       offAll — إلغاء كل مشتركي حدث معين
    ───────────────────────────────────────── */
    /**
     * @param {string} event
     */
    offAll(event) {
        this._listeners.delete(event);
    }


    /* ─────────────────────────────────────────
       clear — مسح كل شيء (للـ testing أو reset)
    ───────────────────────────────────────── */
    clear() {
        this._listeners.clear();
        this._onceWrappers.clear();
    }


    /* ─────────────────────────────────────────
       debug — عرض الأحداث المسجّلة (dev only)
    ───────────────────────────────────────── */
    debug() {
        if (this._listeners.size === 0) {
            console.log("[EventBus] لا يوجد أحداث مسجّلة");
            return;
        }

        console.group("[EventBus] الأحداث المسجّلة:");
        this._listeners.forEach((handlers, event) => {
            console.log(`  📡 ${event} — ${handlers.size} handler(s)`);
        });
        console.groupEnd();
    }
}


/* ─────────────────────────────────────────────────────────
   Singleton — نفس الـ instance في كل الـ modules
───────────────────────────────────────────────────────── */
const Bus = new EventBus();
export default Bus;


/* ─────────────────────────────────────────────────────────
   EVENTS REGISTRY — كل أسماء الأحداث في مكان واحد
   استخدم EVENTS.xxx بدل strings مباشرة لتجنب الأخطاء
───────────────────────────────────────────────────────── */
export const EVENTS = Object.freeze({

    // ── App ──────────────────────────────────
    APP_READY          : "app:ready",
    APP_RESET          : "app:reset",

    // ── Store ────────────────────────────────
    STORE_UPDATED      : "store:updated",       // payload: { key, value }
    STORE_CLEARED      : "store:cleared",

    // ── Router / Navigation ──────────────────
    STEP_CHANGED       : "router:stepChanged",  // payload: { from, to }
    STEP_COMPLETED     : "router:stepCompleted",// payload: { step }

    // ── Sections ─────────────────────────────
    SECTION_SAVED      : "section:saved",       // payload: { sectionId }
    SECTION_VALIDATED  : "section:validated",   // payload: { sectionId, valid }

    // ── Features (drag & drop) ───────────────
    FEATURE_ADDED      : "features:added",      // payload: { feature }
    FEATURE_REMOVED    : "features:removed",    // payload: { id }
    FEATURE_REORDERED  : "features:reordered",  // payload: { features[] }

    // ── Export ───────────────────────────────
    EXPORT_STARTED     : "export:started",      // payload: { type }
    EXPORT_DONE        : "export:done",         // payload: { type }
    EXPORT_ERROR       : "export:error",        // payload: { type, error }

    // ── UI ───────────────────────────────────
    TOAST_SHOW         : "ui:toast",            // payload: { msg, type }
    MODAL_OPEN         : "ui:modalOpen",        // payload: { id, data }
    MODAL_CLOSE        : "ui:modalClose",
    THEME_CHANGED      : "ui:themeChanged",     // payload: { theme }
    PREVIEW_OPEN       : "ui:previewOpen",
    PREVIEW_CLOSE      : "ui:previewClose",
});

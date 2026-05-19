/**
 * FIKRA — core/Store.js
 * ─────────────────────────────────────────────
 * إدارة حالة التطبيق + حفظ تلقائي في localStorage
 *
 * الاستخدام:
 *   import Store from "./core/Store.js";
 *
 *   Store.set("problem.statement", "نص المشكلة");
 *   Store.get("problem.statement");
 *   Store.getSection("problem");
 *   Store.reset();
 * ─────────────────────────────────────────────
 */

import Bus, { EVENTS } from "./EventBus.js";

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const STORAGE_KEY    = "fikra_project";
const STORAGE_META   = "fikra_meta";
const DEBOUNCE_DELAY = 400; // ms — تأخير الحفظ لتجنب الكتابة المتكررة


/* ─────────────────────────────────────────────────────────
   DEFAULT STATE — هيكل البيانات الكامل للمشروع
───────────────────────────────────────────────────────── */
const DEFAULT_STATE = {

    // ── معلومات المشروع الأساسية ──────────────
    meta: {
        projectName : "",
        createdAt   : null,
        updatedAt   : null,
        version     : "1.0.0",
        templateId  : "modern",   // القالب المختار للتصدير
    },

    // ── القسم 1: المشكلة ──────────────────────
    problem: {
        statement   : "",   // وصف المشكلة
        audience    : "",   // الجمهور المستهدف
        painPoints  : [],   // [ { id, text } ]
        marketSize  : "",   // حجم السوق (اختياري)
    },

    // ── القسم 2: الحل ─────────────────────────
    solution: {
        statement       : "",   // وصف الحل
        valueProp       : "",   // Value Proposition
        differentiation : "",   // ما يميّزه عن المنافسين
        competitors     : [],   // [ { id, name, weakness } ]
    },

    // ── القسم 3: الـ Features ─────────────────
    features: {
        items: [],
        // item: {
        //   id       : string,
        //   name     : string,
        //   desc     : string,
        //   priority : "must" | "should" | "could",
        //   order    : number
        // }
        outOfScope: [],  // [ { id, text } ] — خارج الـ MVP
    },

    // ── القسم 4: مقاييس النجاح ────────────────
    metrics: {
        primaryGoal : "",   // الهدف الرئيسي
        kpis        : [],   // [ { id, name, target, unit } ]
        successAt   : "",   // "نجح المشروع لو..."
    },

    // ── القسم 5: الجدول الزمني ────────────────
    timeline: {
        startDate   : "",
        launchDate  : "",
        phases      : [],
        // phase: {
        //   id      : string,
        //   name    : string,
        //   duration: string,
        //   tasks   : string
        // }
        totalWeeks  : "",
    },

    // ── القسم 6: نموذج الربح ──────────────────
    business: {
        model       : "",   // نوع نموذج الربح (SaaS, Freemium, ...)
        revenueDesc : "",   // وصف مصدر الدخل
        pricing     : "",   // نموذج التسعير
        costs       : [],   // [ { id, name, amount, type } ]
        breakEven   : "",   // نقطة التعادل
    },

    // ── القسم 7: الـ Stack التقني ─────────────
    tech: {
        frontend    : [],   // [ { id, name, icon } ]
        backend     : [],
        database    : [],
        devops      : [],
        thirdParty  : [],   // APIs & Services
        notes       : "",   // ملاحظات تقنية إضافية
    },
};


/* ─────────────────────────────────────────────────────────
   STORE CLASS
───────────────────────────────────────────────────────── */
class Store {

    constructor() {
        /** @type {object} — الحالة الحالية */
        this._state = null;

        /** @type {number|null} — debounce timer */
        this._saveTimer = null;

        /** @type {boolean} */
        this._initialized = false;

        this._init();
    }


    /* ─────────────────────────────────────────
       _init — تهيئة الـ Store
    ───────────────────────────────────────── */
    _init() {
        const saved = this._load();

        if (saved) {
            // دمج البيانات المحفوظة مع الـ DEFAULT_STATE
            // لضمان وجود أي keys جديدة أضفناها لاحقاً
            this._state = this._deepMerge(
                this._deepClone(DEFAULT_STATE),
                saved
            );
        } else {
            this._state = this._deepClone(DEFAULT_STATE);
        }

        this._initialized = true;
    }


    /* ─────────────────────────────────────────
       get — قراءة قيمة بـ dot notation
    ───────────────────────────────────────── */
    /**
     * @param {string} path — مثال: "problem.statement"
     * @param {*}      fallback
     * @returns {*}
     */
    get(path, fallback = null) {
        if (!path) return this._deepClone(this._state);

        const keys   = path.split(".");
        let   target = this._state;

        for (const key of keys) {
            if (target === null || target === undefined) return fallback;
            target = target[key];
        }

        return target === undefined ? fallback : this._deepClone(target);
    }


    /* ─────────────────────────────────────────
       set — تعيين قيمة بـ dot notation
    ───────────────────────────────────────── */
    /**
     * @param {string} path
     * @param {*}      value
     * @param {boolean} silent — لو true ما يطلق event
     */
    set(path, value, silent = false) {
        if (!path) return;

        const keys   = path.split(".");
        let   target = this._state;

        // نتنقل للـ parent
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (
                target[key] === null     ||
                target[key] === undefined||
                typeof target[key] !== "object"
            ) {
                target[key] = {};
            }
            target = target[key];
        }

        const lastKey  = keys[keys.length - 1];
        const oldValue = target[lastKey];
        const newValue = this._deepClone(value);

        // ما نحفظ لو القيمة نفسها
        if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return;

        target[lastKey] = newValue;

        // تحديث updatedAt
        this._state.meta.updatedAt = new Date().toISOString();

        // حفظ مع debounce
        this._scheduleSave();

        // إطلاق الحدث
        if (!silent) {
            Bus.emit(EVENTS.STORE_UPDATED, { key: path, value: newValue });
        }
    }


    /* ─────────────────────────────────────────
       setSection — تحديث قسم كامل
    ───────────────────────────────────────── */
    /**
     * @param {string} section — مثال: "problem"
     * @param {object} data
     * @param {boolean} silent
     */
    setSection(section, data, silent = false) {
        if (!this._state[section]) {
            console.warn(`[Store] القسم "${section}" غير موجود`);
            return;
        }

        this._state[section] = this._deepMerge(
            this._deepClone(this._state[section]),
            this._deepClone(data)
        );

        this._state.meta.updatedAt = new Date().toISOString();
        this._scheduleSave();

        if (!silent) {
            Bus.emit(EVENTS.STORE_UPDATED, {
                key  : section,
                value: this._deepClone(this._state[section])
            });
        }
    }


    /* ─────────────────────────────────────────
       getSection — قراءة قسم كامل
    ───────────────────────────────────────── */
    /**
     * @param {string} section
     * @returns {object}
     */
    getSection(section) {
        if (!this._state[section]) return null;
        return this._deepClone(this._state[section]);
    }


    /* ─────────────────────────────────────────
       getAll — قراءة الحالة كاملة
    ───────────────────────────────────────── */
    getAll() {
        return this._deepClone(this._state);
    }


    /* ─────────────────────────────────────────
       initProject — بدء مشروع جديد
    ───────────────────────────────────────── */
    /**
     * @param {string} projectName
     */
    initProject(projectName) {
        this._state              = this._deepClone(DEFAULT_STATE);
        this._state.meta.projectName = projectName.trim();
        this._state.meta.createdAt   = new Date().toISOString();
        this._state.meta.updatedAt   = new Date().toISOString();

        this._saveNow();

        Bus.emit(EVENTS.STORE_UPDATED, {
            key  : "meta",
            value: this._deepClone(this._state.meta)
        });
    }


    /* ─────────────────────────────────────────
       reset — مسح كل شيء
    ───────────────────────────────────────── */
    reset() {
        this._state = this._deepClone(DEFAULT_STATE);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_META);

        Bus.emit(EVENTS.STORE_CLEARED);
    }


    /* ─────────────────────────────────────────
       hasProject — هل يوجد مشروع محفوظ؟
    ───────────────────────────────────────── */
    hasProject() {
        return !!(
            this._state.meta.projectName &&
            this._state.meta.createdAt
        );
    }


    /* ─────────────────────────────────────────
       getCompletionRate — نسبة اكتمال المشروع
    ───────────────────────────────────────── */
    /**
     * @returns {{ total: number, filled: number, percent: number }}
     */
    getCompletionRate() {
        const checks = [
            // problem
            !!this._state.problem.statement,
            !!this._state.problem.audience,
            this._state.problem.painPoints.length > 0,

            // solution
            !!this._state.solution.statement,
            !!this._state.solution.valueProp,

            // features
            this._state.features.items.length > 0,

            // metrics
            !!this._state.metrics.primaryGoal,
            this._state.metrics.kpis.length > 0,

            // timeline
            !!this._state.timeline.launchDate,

            // business
            !!this._state.business.model,

            // tech
            this._state.tech.frontend.length > 0 ||
            this._state.tech.backend.length  > 0,
        ];

        const filled  = checks.filter(Boolean).length;
        const total   = checks.length;
        const percent = Math.round((filled / total) * 100);

        return { total, filled, percent };
    }


    /* ─────────────────────────────────────────
       setTemplate — تغيير قالب التصدير
    ───────────────────────────────────────── */
    /**
     * @param {"modern"|"minimal"|"dark"} templateId
     */
    setTemplate(templateId) {
        this.set("meta.templateId", templateId);
    }


    /* ─────────────────────────────────────────
       _scheduleSave — حفظ مع debounce
    ───────────────────────────────────────── */
    _scheduleSave() {
        if (this._saveTimer) clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => {
            this._saveNow();
            this._saveTimer = null;
        }, DEBOUNCE_DELAY);
    }


    /* ─────────────────────────────────────────
       _saveNow — حفظ فوري في localStorage
    ───────────────────────────────────────── */
    _saveNow() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(this._state)
            );
        } catch (err) {
            // localStorage ممتلئ أو disabled
            console.warn("[Store] فشل الحفظ:", err.message);
            Bus.emit(EVENTS.TOAST_SHOW, {
                msg : "تعذّر الحفظ التلقائي — مساحة التخزين ممتلئة",
                type: "warning"
            });
        }
    }


    /* ─────────────────────────────────────────
       _load — تحميل من localStorage
    ───────────────────────────────────────── */
    _load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            console.warn("[Store] بيانات localStorage تالفة — سيتم إعادة التهيئة");
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    }


    /* ─────────────────────────────────────────
       _deepClone — نسخ عميق
    ───────────────────────────────────────── */
    _deepClone(obj) {
        if (obj === null || typeof obj !== "object") return obj;
        return JSON.parse(JSON.stringify(obj));
    }


    /* ─────────────────────────────────────────
       _deepMerge — دمج عميق (target ← source)
    ───────────────────────────────────────── */
    _deepMerge(target, source) {
        if (!source || typeof source !== "object") return target;

        for (const key of Object.keys(source)) {
            if (
                source[key] !== null          &&
                typeof source[key] === "object" &&
                !Array.isArray(source[key])
            ) {
                if (!target[key] || typeof target[key] !== "object") {
                    target[key] = {};
                }
                this._deepMerge(target[key], source[key]);
            } else {
                // Arrays والقيم البسيطة تُستبدل مباشرة
                target[key] = source[key];
            }
        }

        return target;
    }

    // ── Aliases للتوافق مع app.js ──────────────
persist() {
    return this._saveNow();
}

save() {
    return this._saveNow();
}

}


/* ─────────────────────────────────────────────────────────
   Singleton Export
───────────────────────────────────────────────────────── */
const StoreInstance = new Store();
export default StoreInstance;

/* تصدير الـ DEFAULT_STATE للاستخدام في الـ testing أو الـ reset */
export { DEFAULT_STATE };

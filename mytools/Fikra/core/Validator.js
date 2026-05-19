/**
 * FIKRA — core/Validator.js
 * ─────────────────────────────────────────────
 * التحقق من صحة بيانات كل قسم قبل الانتقال
 *
 * الاستخدام:
 *   import Validator from "./core/Validator.js";
 *
 *   const result = Validator.validate("problem", data);
 *   // { valid: true, errors: {}, warnings: {} }
 *
 *   Validator.showErrors("problem", result.errors);
 *   Validator.clearErrors("problem");
 * ─────────────────────────────────────────────
 */

import Bus, { EVENTS } from "./EventBus.js";


/* ─────────────────────────────────────────────────────────
   RULES — قواعد التحقق لكل قسم
───────────────────────────────────────────────────────── */
const RULES = {

    /* ── القسم 1: المشكلة ──────────────────── */
    problem: {
        statement: [
            {
                test   : v => v && v.trim().length >= 20,
                message: "وصف المشكلة يجب أن يكون 20 حرفاً على الأقل",
            },
            {
                test   : v => v && v.trim().length <= 500,
                message: "وصف المشكلة لا يتجاوز 500 حرف",
            },
        ],
        audience: [
            {
                test   : v => v && v.trim().length >= 5,
                message: "حدّد الجمهور المستهدف (5 أحرف على الأقل)",
            },
        ],
        painPoints: [
            {
                test   : v => Array.isArray(v) && v.length >= 1,
                message: "أضف نقطة ألم واحدة على الأقل",
                type   : "warning",  // تحذير مش خطأ
            },
        ],
    },

    /* ── القسم 2: الحل ─────────────────────── */
    solution: {
        statement: [
            {
                test   : v => v && v.trim().length >= 20,
                message: "وصف الحل يجب أن يكون 20 حرفاً على الأقل",
            },
            {
                test   : v => v && v.trim().length <= 500,
                message: "وصف الحل لا يتجاوز 500 حرف",
            },
        ],
        valueProp: [
            {
                test   : v => v && v.trim().length >= 10,
                message: "أضف قيمة مقترحة (10 أحرف على الأقل)",
            },
        ],
        differentiation: [
            {
                test   : v => !v || v.trim().length <= 300,
                message: "التمييز لا يتجاوز 300 حرف",
            },
        ],
    },

    /* ── القسم 3: المميزات ─────────────────── */
    features: {
        items: [
            {
                test   : v => Array.isArray(v) && v.length >= 1,
                message: "أضف ميزة واحدة على الأقل",
            },
            {
                test   : v => Array.isArray(v) && v.length <= 20,
                message: "الحد الأقصى 20 ميزة للـ MVP",
                type   : "warning",
            },
            {
                // تأكد أن كل ميزة فيها اسم
                test   : v => !Array.isArray(v) ||
                              v.every(f => f.name && f.name.trim().length > 0),
                message: "بعض المميزات ليس لها اسم",
            },
        ],
    },

    /* ── القسم 4: المقاييس ─────────────────── */
    metrics: {
        primaryGoal: [
            {
                test   : v => v && v.trim().length >= 10,
                message: "حدّد الهدف الرئيسي (10 أحرف على الأقل)",
            },
        ],
        kpis: [
            {
                test   : v => Array.isArray(v) && v.length >= 1,
                message: "أضف مقياساً واحداً على الأقل",
                type   : "warning",
            },
        ],
    },

    /* ── القسم 5: الجدول الزمني ────────────── */
    timeline: {
        launchDate: [
            {
                test   : v => !!v,
                message: "حدّد تاريخ الإطلاق المتوقع",
            },
            {
                test   : v => {
                    if (!v) return true;
                    return new Date(v) > new Date();
                },
                message: "تاريخ الإطلاق يجب أن يكون في المستقبل",
                type   : "warning",
            },
        ],
        startDate: [
            {
                test   : v => {
                    if (!v) return true; // اختياري
                    return new Date(v) <= new Date();
                },
                message: "تاريخ البداية يجب أن يكون في الماضي أو اليوم",
                type   : "warning",
            },
        ],
    },

    /* ── القسم 6: نموذج الربح ──────────────── */
    business: {
        model: [
            {
                test   : v => v && v.trim().length >= 3,
                message: "حدّد نموذج الربح",
            },
        ],
        revenueDesc: [
            {
                test   : v => !v || v.trim().length <= 400,
                message: "الوصف لا يتجاوز 400 حرف",
            },
        ],
    },

    /* ── القسم 7: التقنية ──────────────────── */
    tech: {
        _custom: (data) => {
            // تحقق مخصص: يجب اختيار تقنية واحدة على الأقل
            const hasAny =
                data.frontend?.length   > 0 ||
                data.backend?.length    > 0 ||
                data.database?.length   > 0 ||
                data.devops?.length     > 0 ||
                data.thirdParty?.length > 0;

            if (!hasAny) {
                return {
                    _tech: "اختر تقنية واحدة على الأقل من أي فئة"
                };
            }
            return {};
        }
    },
};


/* ─────────────────────────────────────────────────────────
   VALIDATOR CLASS
───────────────────────────────────────────────────────── */
class Validator {

    constructor() {
        /** تتبع الـ errors المعروضة حالياً */
        /** @type {Map<string, string[]>} */
        this._activeErrors = new Map();
    }


    /* ─────────────────────────────────────────
       validate — التحقق من قسم كامل
    ───────────────────────────────────────── */
    /**
     * @param {string} sectionKey — مثال: "problem"
     * @param {object} data       — بيانات القسم
     * @returns {{
     *   valid    : boolean,
     *   errors   : Object<string, string>,
     *   warnings : Object<string, string>
     * }}
     */
    validate(sectionKey, data) {
        const rules    = RULES[sectionKey];
        const errors   = {};
        const warnings = {};

        if (!rules) {
            return { valid: true, errors, warnings };
        }

        // ── تحقق مخصص (_custom) ──────────────
        if (typeof rules._custom === "function") {
            const customErrors = rules._custom(data);
            Object.assign(errors, customErrors);
        }

        // ── تحقق بالـ rules ───────────────────
        for (const [field, fieldRules] of Object.entries(rules)) {
            if (field === "_custom") continue;

            const value = this._getNestedValue(data, field);

            for (const rule of fieldRules) {
                const passed = this._safeTest(rule.test, value);

                if (!passed) {
                    if (rule.type === "warning") {
                        // لا نضع warning لو في error مسبق
                        if (!errors[field]) {
                            warnings[field] = rule.message;
                        }
                    } else {
                        errors[field]   = rule.message;
                        delete warnings[field]; // نزيل الـ warning لو في error
                        break; // أول خطأ يكفي لكل field
                    }
                }
            }
        }

        const valid = Object.keys(errors).length === 0;

        // إطلاق حدث التحقق
        Bus.emit(EVENTS.SECTION_VALIDATED, {
            sectionId: sectionKey,
            valid,
            errors,
            warnings,
        });

        return { valid, errors, warnings };
    }


    /* ─────────────────────────────────────────
       validateField — تحقق من حقل واحد فقط
    ───────────────────────────────────────── */
    /**
     * @param {string} sectionKey
     * @param {string} field
     * @param {*}      value
     * @returns {{ valid: boolean, error: string|null, warning: string|null }}
     */
    validateField(sectionKey, field, value) {
        const rules      = RULES[sectionKey];
        const fieldRules = rules?.[field];

        if (!fieldRules) return { valid: true, error: null, warning: null };

        let error   = null;
        let warning = null;

        for (const rule of fieldRules) {
            const passed = this._safeTest(rule.test, value);
            if (!passed) {
                if (rule.type === "warning") {
                    warning = rule.message;
                } else {
                    error = rule.message;
                    break;
                }
            }
        }

        return {
            valid  : !error,
            error,
            warning,
        };
    }


    /* ─────────────────────────────────────────
       showErrors — عرض الأخطاء على الـ DOM
    ───────────────────────────────────────── */
    /**
     * @param {string}              sectionKey
     * @param {Object<string,string>} errors
     * @param {Object<string,string>} warnings
     */
    showErrors(sectionKey, errors = {}, warnings = {}) {
        // نظّف الأخطاء القديمة أولاً
        this.clearErrors(sectionKey);

        const allMessages = {};

        // دمج الـ errors والـ warnings
        Object.entries(errors).forEach(([field, msg]) => {
            allMessages[field] = { msg, type: "error" };
        });
        Object.entries(warnings).forEach(([field, msg]) => {
            if (!allMessages[field]) {
                allMessages[field] = { msg, type: "warning" };
            }
        });

        const fieldIds = [];

        Object.entries(allMessages).forEach(([field, { msg, type }]) => {
            const inputEl = this._findInput(sectionKey, field);
            const msgEl   = this._findMsgEl(sectionKey, field);

            if (inputEl) {
                inputEl.classList.add(
                    type === "error" ? "error" : "warning-input"
                );
                fieldIds.push(`${sectionKey}.${field}`);
            }

            if (msgEl) {
                msgEl.innerHTML = `
                    <i class="fas fa-${type === "error"
                        ? "circle-exclamation"
                        : "triangle-exclamation"
                    }"></i>
                    ${msg}
                `;
                msgEl.className = type === "error"
                    ? "fikra-error-msg"
                    : "fikra-error-msg text-yellow-500";
                msgEl.classList.remove("hidden");
            }
        });

        this._activeErrors.set(sectionKey, fieldIds);
    }


    /* ─────────────────────────────────────────
       clearErrors — مسح أخطاء قسم
    ───────────────────────────────────────── */
    /**
     * @param {string} sectionKey
     */
    clearErrors(sectionKey) {
        const section = document.querySelector(
            `[data-section="${sectionKey}"]`
        );
        if (!section) return;

        // نظّف كل الـ inputs
        section.querySelectorAll(".fikra-input, .fikra-textarea, .fikra-select")
            .forEach(el => {
                el.classList.remove("error", "warning-input");
            });

        // نظّف كل الـ error messages
        section.querySelectorAll(".fikra-error-msg")
            .forEach(el => {
                el.textContent = "";
                el.classList.add("hidden");
            });

        this._activeErrors.delete(sectionKey);
    }


    /* ─────────────────────────────────────────
       clearAllErrors — مسح كل الأخطاء
    ───────────────────────────────────────── */
    clearAllErrors() {
        this._activeErrors.forEach((_, key) => this.clearErrors(key));
        this._activeErrors.clear();
    }


    /* ─────────────────────────────────────────
       attachLiveValidation — تحقق فوري عند الكتابة
    ───────────────────────────────────────── */
    /**
     * يربط الـ input بالـ validation تلقائياً
     * @param {HTMLElement} inputEl
     * @param {string}      sectionKey
     * @param {string}      field
     */
    attachLiveValidation(inputEl, sectionKey, field) {
        if (!inputEl) return;

        let debounceTimer = null;

        const validate = () => {
            const value  = inputEl.value;
            const result = this.validateField(sectionKey, field, value);
            const msgEl  = this._findMsgEl(sectionKey, field);

            if (!result.valid && value.length > 0) {
                inputEl.classList.add("error");
                inputEl.classList.remove("warning-input");
                if (msgEl) {
                    msgEl.innerHTML = `
                        <i class="fas fa-circle-exclamation"></i>
                        ${result.error}
                    `;
                    msgEl.className = "fikra-error-msg";
                    msgEl.classList.remove("hidden");
                }
            } else if (result.warning && value.length > 0) {
                inputEl.classList.remove("error");
                inputEl.classList.add("warning-input");
                if (msgEl) {
                    msgEl.innerHTML = `
                        <i class="fas fa-triangle-exclamation"></i>
                        ${result.warning}
                    `;
                    msgEl.className = "fikra-error-msg text-yellow-500";
                    msgEl.classList.remove("hidden");
                }
            } else {
                inputEl.classList.remove("error", "warning-input");
                if (msgEl) {
                    msgEl.textContent = "";
                    msgEl.classList.add("hidden");
                }
            }
        };

        // debounce 300ms
        inputEl.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(validate, 300);
        });

        // تحقق فوري عند مغادرة الـ input
        inputEl.addEventListener("blur", validate);
    }


    /* ─────────────────────────────────────────
       getRequiredFields — الحقول المطلوبة لقسم
    ───────────────────────────────────────── */
    /**
     * @param {string} sectionKey
     * @returns {string[]}
     */
    getRequiredFields(sectionKey) {
        const rules = RULES[sectionKey];
        if (!rules) return [];

        return Object.entries(rules)
            .filter(([field, fieldRules]) => {
                if (field === "_custom") return false;
                return fieldRules.some(r => !r.type); // بدون type = required
            })
            .map(([field]) => field);
    }


    /* ─────────────────────────────────────────
       _getNestedValue — قراءة قيمة nested
    ───────────────────────────────────────── */
    _getNestedValue(obj, path) {
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
    }


    /* ─────────────────────────────────────────
       _safeTest — تشغيل الـ test بأمان
    ───────────────────────────────────────── */
    _safeTest(testFn, value) {
        try {
            return testFn(value);
        } catch {
            return false;
        }
    }


    /* ─────────────────────────────────────────
       _findInput — إيجاد الـ input في الـ DOM
    ───────────────────────────────────────── */
    _findInput(sectionKey, field) {
        return document.querySelector(
            `[data-section="${sectionKey}"] [data-field="${field}"]`
        );
    }


    /* ─────────────────────────────────────────
       _findMsgEl — إيجاد عنصر رسالة الخطأ
    ───────────────────────────────────────── */
    _findMsgEl(sectionKey, field) {
        return document.querySelector(
            `[data-section="${sectionKey}"] [data-error="${field}"]`
        );
    }
}


/* ─────────────────────────────────────────────────────────
   Singleton Export
───────────────────────────────────────────────────────── */
const ValidatorInstance = new Validator();
export default ValidatorInstance;

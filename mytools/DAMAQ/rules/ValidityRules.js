// rules/ValidityRules.js

export const ValidityRules = {

    // ══════════════════════════════════════════
    //  التنسيقات السعودية 🇸🇦
    // ══════════════════════════════════════════

    saudiNationalID: {
        id         : "saudi_national_id",
        nameAr     : "رقم الهوية الوطنية السعودية",
        description: "10 أرقام، يبدأ بـ 1 (مواطن) أو 2 (مقيم)",
        validate(value) {
            const v = String(value).trim();
            if (!/^\d{10}$/.test(v))
                return { valid: false, reason: "يجب أن يكون 10 أرقام" };
            if (!["1", "2"].includes(v[0]))
                return { valid: false, reason: "يجب أن يبدأ بـ 1 أو 2" };
            return { valid: true };
        }
    },

    saudiPhone: {
        id         : "saudi_phone",
        nameAr     : "رقم الجوال السعودي",
        description: "يبدأ بـ 05 أو +9665 أو 9665",
        validate(value) {
            const v = String(value).trim().replace(/[\s\-()]/g, "");
            const patterns = [
                /^05\d{8}$/,           // 05xxxxxxxx
                /^\+9665\d{8}$/,       // +9665xxxxxxxx
                /^9665\d{8}$/,         // 9665xxxxxxxx
                /^5\d{8}$/             // 5xxxxxxxx
            ];
            if (patterns.some(p => p.test(v)))
                return { valid: true };
            return {
                valid : false,
                reason: "تنسيق غير صحيح — مثال صحيح: 0512345678"
            };
        }
    },

    saudiIBAN: {
        id         : "saudi_iban",
        nameAr     : "رقم الآيبان السعودي",
        description: "SA متبوعاً بـ 22 رقم",
        validate(value) {
            const v = String(value).trim().replace(/\s/g, "").toUpperCase();
            if (!/^SA\d{22}$/.test(v))
                return { valid: false, reason: "يجب أن يبدأ بـ SA ويتبعه 22 رقم" };
            return { valid: true };
        }
    },

    saudiPostalCode: {
        id         : "saudi_postal_code",
        nameAr     : "الرمز البريدي السعودي",
        description: "5 أرقام",
        validate(value) {
            const v = String(value).trim();
            if (!/^\d{5}$/.test(v))
                return { valid: false, reason: "يجب أن يكون 5 أرقام بالضبط" };
            return { valid: true };
        }
    },

    saudiCR: {
        id         : "saudi_cr",
        nameAr     : "السجل التجاري",
        description: "10 أرقام",
        validate(value) {
            const v = String(value).trim();
            if (!/^\d{10}$/.test(v))
                return { valid: false, reason: "يجب أن يكون 10 أرقام" };
            return { valid: true };
        }
    },

    saudiVAT: {
        id         : "saudi_vat",
        nameAr     : "الرقم الضريبي",
        description: "15 رقم، يبدأ وينتهي بـ 3",
        validate(value) {
            const v = String(value).trim();
            if (!/^\d{15}$/.test(v))
                return { valid: false, reason: "يجب أن يكون 15 رقم" };
            if (v[0] !== "3" || v[14] !== "3")
                return { valid: false, reason: "يجب أن يبدأ وينتهي بـ 3" };
            return { valid: true };
        }
    },

    // ══════════════════════════════════════════
    //  تنسيقات عامة
    // ══════════════════════════════════════════

    email: {
        id         : "email",
        nameAr     : "البريد الإلكتروني",
        description: "تنسيق بريد إلكتروني صحيح",
        validate(value) {
            const v = String(value).trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
                return { valid: false, reason: "تنسيق البريد غير صحيح" };
            return { valid: true };
        }
    },

    url: {
        id         : "url",
        nameAr     : "رابط URL",
        description: "رابط يبدأ بـ http أو https",
        validate(value) {
            try {
                new URL(String(value).trim());
                return { valid: true };
            } catch {
                return { valid: false, reason: "رابط URL غير صحيح" };
            }
        }
    },

    dateISO: {
        id         : "date_iso",
        nameAr     : "تاريخ ISO",
        description: "تنسيق YYYY-MM-DD",
        validate(value) {
            const v = String(value).trim();
            if (!/^\d{4}-\d{2}-\d{2}$/.test(v))
                return { valid: false, reason: "يجب أن يكون بتنسيق YYYY-MM-DD" };
            const d = new Date(v);
            if (isNaN(d.getTime()))
                return { valid: false, reason: "تاريخ غير صحيح" };
            return { valid: true };
        }
    },

    positiveNumber: {
        id         : "positive_number",
        nameAr     : "رقم موجب",
        description: "قيمة رقمية أكبر من صفر",
        validate(value) {
            const n = parseFloat(value);
            if (isNaN(n))
                return { valid: false, reason: "ليست قيمة رقمية" };
            if (n <= 0)
                return { valid: false, reason: "يجب أن تكون أكبر من صفر" };
            return { valid: true };
        }
    },

    // ══════════════════════════════════════════
    //  بناء قواعد ديناميكية
    // ══════════════════════════════════════════

    // نطاق رقمي مخصص
    numericRange(min, max) {
        return {
            id         : `range_${min}_${max}`,
            nameAr     : `نطاق رقمي (${min} - ${max})`,
            description: `القيمة يجب أن تكون بين ${min} و ${max}`,
            validate(value) {
                const n = parseFloat(value);
                if (isNaN(n))
                    return { valid: false, reason: "ليست قيمة رقمية" };
                if (n < min || n > max)
                    return {
                        valid : false,
                        reason: `القيمة ${n} خارج النطاق المسموح (${min} - ${max})`
                    };
                return { valid: true };
            }
        };
    },

    // قائمة قيم مسموحة
    allowedValues(values, caseSensitive = false) {
        return {
            id         : "allowed_values",
            nameAr     : "قيم مسموحة",
            description: `القيمة يجب أن تكون ضمن: ${values.join(", ")}`,
            validate(value) {
                const v = caseSensitive
                    ? String(value).trim()
                    : String(value).trim().toLowerCase();
                const allowed = caseSensitive
                    ? values
                    : values.map(x => String(x).toLowerCase());
                if (!allowed.includes(v))
                    return {
                        valid : false,
                        reason: `القيمة "${value}" غير مسموحة — القيم المسموحة: ${values.join(", ")}`
                    };
                return { valid: true };
            }
        };
    },

    // Regex مخصص
    regex(pattern, flags = "i", description = "") {
        return {
            id         : "custom_regex",
            nameAr     : "نمط مخصص",
            description: description || `يجب أن يطابق النمط: ${pattern}`,
            validate(value) {
                const rx = new RegExp(pattern, flags);
                if (!rx.test(String(value).trim()))
                    return {
                        valid : false,
                        reason: `القيمة لا تطابق النمط المطلوب`
                    };
                return { valid: true };
            }
        };
    },

    // طول النص
    textLength(min, max) {
        return {
            id         : `length_${min}_${max}`,
            nameAr     : `طول النص (${min} - ${max})`,
            description: `عدد الأحرف يجب أن يكون بين ${min} و ${max}`,
            validate(value) {
                const len = String(value).trim().length;
                if (len < min || len > max)
                    return {
                        valid : false,
                        reason: `الطول ${len} خارج النطاق (${min} - ${max})`
                    };
                return { valid: true };
            }
        };
    }
};

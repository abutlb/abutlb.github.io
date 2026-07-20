// core/Settings.js
// حفظ واسترجاع إعدادات المستخدم (الشكل/الألوان/آخر تبويب) من localStorage

const KEY = "qrgen_settings";

const DEFAULTS = {
    dotType: "square",
    roundedCorners: false,
    errorLevel: "M",
    size: 512,
    margin: 4,
    dotColor: "#000000",
    bgColor: "#ffffff",
    bgTransparent: false,
    format: "png",
    lastTab: "single",
};

export class Settings {
    static load() {
        try {
            const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
            return { ...DEFAULTS, ...saved };
        } catch {
            return { ...DEFAULTS };
        }
    }

    static save(partial) {
        const current = Settings.load();
        const next = { ...current, ...partial };
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
    }
}

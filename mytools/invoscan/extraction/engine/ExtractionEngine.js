// extraction/engine/ExtractionEngine.js — المحرك الرئيسي لتنسيق الـ plugins

export class ExtractionEngine {
    constructor() {
        this._plugins = [];
    }

    // تسجيل plugin — قابل للتسلسل: engine.use(a).use(b)
    use(plugin) {
        this._plugins.push(plugin);
        return this;
    }

    // تشغيل جميع الـ plugins واختيار أعلى confidence لكل حقل
    extract(rawText) {
        const best = {}; // field → { value, confidence, method, plugin }

        for (const plugin of this._plugins) {
            let results;
            try {
                results = plugin.extract(rawText);
            } catch (e) {
                console.warn(`[ExtractionEngine] plugin "${plugin.name}" failed:`, e.message);
                continue;
            }

            for (const [field, result] of Object.entries(results)) {
                if (!result) continue;
                // للمصفوفات (items): خذ النتيجة الأطول
                const isArr = Array.isArray(result.value);
                const better = !best[field]
                    || (isArr
                        ? (result.value.length > (best[field].value?.length ?? 0))
                        : (result.confidence > best[field].confidence));
                if (better) {
                    best[field] = { ...result, plugin: plugin.name };
                }
            }
        }

        // فصل القيم عن الـ metadata
        const values = {};
        const meta   = {};
        for (const [field, r] of Object.entries(best)) {
            values[field] = r.value;
            meta[field]   = r;
        }

        return { values, meta };
    }
}

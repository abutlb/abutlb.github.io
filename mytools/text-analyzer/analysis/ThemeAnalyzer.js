// analysis/ThemeAnalyzer.js — كشف المواضيع + التصنيفات المخصصة (الميزة 2)

const STORAGE_KEY = 'ta_custom_themes';

export class ThemeAnalyzer {
    constructor(defaultThemes = {}) {
        this._defaults = { ...defaultThemes };
        this._custom   = this._loadCustom();
    }

    _loadCustom() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    }

    _saveCustom() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._custom));
        } catch {}
    }

    getAllThemes() {
        return { ...this._defaults, ...this._custom };
    }

    getCustomThemes() {
        return { ...this._custom };
    }

    addTheme(name, keywords) {
        if (!name?.trim()) return false;
        this._custom[name.trim()] = keywords.map(k => k.trim()).filter(Boolean);
        this._saveCustom();
        return true;
    }

    removeTheme(name) {
        if (name in this._custom) {
            delete this._custom[name];
            this._saveCustom();
            return true;
        }
        return false;
    }

    getKeywords(theme) {
        const all = this.getAllThemes();
        return all[theme] ?? [];
    }

    detect(text) {
        if (!text) return 'أخرى';
        const lower = text.toLowerCase().replace(/_/g, ' ');
        const all   = this.getAllThemes();

        let best = { theme: 'أخرى', score: 0 };

        for (const [theme, keywords] of Object.entries(all)) {
            let score = 0;
            for (const kw of keywords) {
                if (lower.includes(kw.replace(/_/g, ' '))) score++;
            }
            if (score > best.score) best = { theme, score };
        }

        return best.theme;
    }

    distribute(textData) {
        const counts = {};
        for (const item of textData) {
            counts[item.theme] = (counts[item.theme] ?? 0) + 1;
        }
        return Object.entries(counts)
            .map(([theme, count]) => ({ theme, count }))
            .sort((a, b) => b.count - a.count);
    }
}

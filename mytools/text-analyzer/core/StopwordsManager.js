// core/StopwordsManager.js — إدارة كلمات التوقف (الميزة 12)

const STORAGE_KEY = 'ta_stopwords_custom';

export class StopwordsManager {
    constructor(defaults = []) {
        this._defaults = new Set(defaults);
        this._custom   = new Set(this._loadCustom());
    }

    _loadCustom() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    }

    _saveCustom() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...this._custom]));
        } catch {}
    }

    getAll() {
        return new Set([...this._defaults, ...this._custom]);
    }

    getCustom() {
        return [...this._custom].sort();
    }

    getDefaults() {
        return [...this._defaults].sort();
    }

    add(word) {
        const w = word.trim();
        if (!w || this._defaults.has(w)) return false;
        this._custom.add(w);
        this._saveCustom();
        return true;
    }

    remove(word) {
        const removed = this._custom.delete(word);
        if (removed) this._saveCustom();
        return removed;
    }

    has(word) {
        return this._defaults.has(word) || this._custom.has(word);
    }

    reset() {
        this._custom.clear();
        this._saveCustom();
    }
}

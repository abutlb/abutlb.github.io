// i18n/Lang.js — singleton language manager
import { T } from './translations.js';

const STORAGE_KEY = 'invoscan-lang';

class LangManager {
  constructor() {
    this._lang      = localStorage.getItem(STORAGE_KEY) || 'ar';
    this._listeners = [];
  }

  get()       { return this._lang; }
  t(key)      { return T[this._lang]?.[key] ?? T.ar[key] ?? key; }
  isRTL()     { return this._lang === 'ar'; }

  set(lang) {
    if (lang === this._lang) return;
    this._lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    this._applyDOM();
    this._listeners.forEach(fn => fn(lang));
  }

  toggle() { this.set(this._lang === 'ar' ? 'en' : 'ar'); }

  onChange(fn) { this._listeners.push(fn); }

  // Apply data-i18n attributes across the whole page
  _applyDOM() {
    const dir = this.isRTL() ? 'rtl' : 'ltr';
    document.documentElement.lang = this._lang;
    document.documentElement.dir  = dir;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const val = this.t(key);
      if (val !== undefined) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const val = this.t(key);
      if (val !== undefined) el.placeholder = val;
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      const val = this.t(key);
      if (val !== undefined) el.title = val;
    });

    // Update lang toggle button
    const btn = document.getElementById('btn-lang');
    if (btn) btn.textContent = this.t('langToggle');
  }

  // Call once on DOMContentLoaded to set initial state
  init() { this._applyDOM(); }
}

export const Lang = new LangManager();

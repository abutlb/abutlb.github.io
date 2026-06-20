// ui/SettingsPanel.js — لوحة إعدادات BYOK متعددة المزودين
import { AIRouter }                     from '../ai/AIRouter.js';
import { PROVIDERS, lsKey, lsModel, LS_PROVIDER } from '../ai/BaseAIClient.js';
import { Lang }                         from '../i18n/Lang.js';

export class SettingsPanel {
    constructor() {
        this._overlay  = document.getElementById('settings-overlay');
        this._provider = localStorage.getItem(LS_PROVIDER) || 'gemini';
        this._init();
    }

    _init() {
        // بناء واجهة الـ providers
        this._renderProviders();

        // إغلاق
        this._overlay?.addEventListener('click', e => {
            if (e.target === this._overlay) this.close();
        });
        document.getElementById('btn-settings-close')
            ?.addEventListener('click', () => this.close());

        // أزرار الحفظ / الاختبار / المسح
        document.getElementById('btn-save-key')?.addEventListener('click',  () => this._save());
        document.getElementById('btn-clear-key')?.addEventListener('click', () => this._clear());
        document.getElementById('btn-test-key')?.addEventListener('click',  () => this._test());

        // تغيير النموذج
        document.getElementById('ai-model-select')?.addEventListener('change', e => {
            localStorage.setItem(lsModel(this._provider), e.target.value);
        });

        this._syncToolbar();
        Lang.onChange(() => { this._renderProviders(); this._loadCurrent(); });
    }

    open()  { if (this._overlay) this._overlay.style.display = 'flex'; this._loadCurrent(); }
    close() { if (this._overlay) this._overlay.style.display = 'none'; }
    hasKey(){ return AIRouter.isEnabled(); }

    // ── Render provider cards ───────────────────────────
    _renderProviders() {
        const container = document.getElementById('provider-cards');
        if (!container) return;

        container.innerHTML = Object.values(PROVIDERS).map(p => `
            <button class="provider-card ${p.id === this._provider ? 'active' : ''}"
                    data-provider="${p.id}" type="button">
                <i class="fab ${p.icon}" style="color:${p.color};font-size:1.2rem"></i>
                <span class="pc-name">${p.name}</span>
                <span class="pc-company">${p.company}</span>
                ${p.free ? `<span class="pc-free">${Lang.t('aiFree')}</span>` : ''}
                ${localStorage.getItem(lsKey(p.id)) ? '<span class="pc-connected"><i class="fas fa-check-circle"></i></span>' : ''}
            </button>
        `).join('');

        container.querySelectorAll('.provider-card').forEach(btn => {
            btn.addEventListener('click', () => {
                this._provider = btn.dataset.provider;
                localStorage.setItem(LS_PROVIDER, this._provider);
                this._renderProviders();
                this._loadCurrent();
                this._status('', '');
            });
        });
    }

    // تحميل بيانات المزود الحالي في الـ form
    _loadCurrent() {
        const p     = PROVIDERS[this._provider];
        const key   = localStorage.getItem(lsKey(this._provider))   || '';
        const model = localStorage.getItem(lsModel(this._provider))  || p.models[0].id;

        const inp = document.getElementById('gemini-key-input');
        if (inp) { inp.value = key; inp.placeholder = p.keyHint; }

        const sel = document.getElementById('ai-model-select');
        if (sel) {
            sel.innerHTML = p.models.map(m =>
                `<option value="${m.id}" ${m.id === model ? 'selected' : ''}>${m.label}</option>`
            ).join('');
        }

        const link = document.getElementById('settings-key-link');
        if (link) {
            link.href = p.keyUrl;
            link.innerHTML = `<i class="fas fa-external-link-alt"></i> ${Lang.isRTL() ? `احصل على مفتاح ${p.name} مجاناً ←` : `Get a free ${p.name} key →`}`;
        }
    }

    _save() {
        const key = document.getElementById('gemini-key-input')?.value?.trim();
        if (!key) { this._status(Lang.t('aiEnterKey'), 'warn'); return; }
        localStorage.setItem(lsKey(this._provider), key);
        localStorage.setItem(LS_PROVIDER, this._provider);
        const model = document.getElementById('ai-model-select')?.value;
        if (model) localStorage.setItem(lsModel(this._provider), model);
        this._status(Lang.t('aiSaved'), 'success');
        this._renderProviders();
        this._syncToolbar();
    }

    _clear() {
        localStorage.removeItem(lsKey(this._provider));
        const inp = document.getElementById('gemini-key-input');
        if (inp) inp.value = '';
        this._status(Lang.t('aiCleared'), 'warn');
        this._renderProviders();
        this._syncToolbar();
    }

    async _test() {
        const key   = document.getElementById('gemini-key-input')?.value?.trim();
        const model = document.getElementById('ai-model-select')?.value;
        if (!key) { this._status(Lang.t('aiEnterKey'), 'warn'); return; }
        this._status(Lang.t('aiTesting'), 'loading');
        try {
            await AIRouter.test(this._provider, key, model);
            this._status(`✓ ${PROVIDERS[this._provider].name} ${Lang.t('aiWorking')}`, 'success');
        } catch (e) {
            this._status(`${Lang.t('aiFailed')}: ` + e.message, 'error');
        }
    }

    _status(msg, type) {
        const el = document.getElementById('key-status');
        if (!el) return;
        el.textContent    = msg;
        el.className      = `key-status ${type}`;
        el.style.display  = msg ? 'block' : 'none';
    }

    _syncToolbar() {
        const badge = document.getElementById('ai-mode-badge');
        if (!badge) return;
        const enabled = AIRouter.isEnabled();
        badge.style.display = enabled ? 'flex' : 'none';
        if (enabled) {
            const p = PROVIDERS[localStorage.getItem(LS_PROVIDER)] || PROVIDERS.gemini;
            badge.innerHTML = `<i class="fab ${p.icon}"></i> ${p.name}`;
            badge.style.background = `linear-gradient(135deg, ${p.color}cc, ${p.color})`;
        }
    }
}

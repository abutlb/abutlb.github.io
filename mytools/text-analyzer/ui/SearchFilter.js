// ui/SearchFilter.js — البحث والفلترة الديناميكية (الميزتان 5، 9)

export class SearchFilter {
    constructor(store, onUpdate) {
        this._store    = store;
        this._onUpdate = onUpdate;
        this._debounce = null;
    }

    init() {
        const searchInput = document.getElementById('searchInput');
        const sentFilter  = document.getElementById('sentimentFilter');
        const themeFilter = document.getElementById('themeFilter');

        searchInput?.addEventListener('input', () => {
            clearTimeout(this._debounce);
            this._debounce = setTimeout(() => {
                this._store.setFilter('search', searchInput.value);
                this._onUpdate();
            }, 300);
        });

        sentFilter?.addEventListener('change', () => {
            this._store.setFilter('sentiment', sentFilter.value);
            this._onUpdate();
        });

        themeFilter?.addEventListener('change', () => {
            this._store.setFilter('theme', themeFilter.value);
            this._onUpdate();
        });
    }

    updateThemeOptions(themeData) {
        const sel = document.getElementById('themeFilter');
        if (!sel) return;
        const cur = sel.value;
        sel.innerHTML = '<option value="all">كل المواضيع</option>' +
            themeData.map(t => `<option value="${t.theme}" ${t.theme === cur ? 'selected' : ''}>${t.theme}</option>`).join('');
    }

    reset() {
        const searchInput = document.getElementById('searchInput');
        const sentFilter  = document.getElementById('sentimentFilter');
        const themeFilter = document.getElementById('themeFilter');
        if (searchInput) searchInput.value = '';
        if (sentFilter)  sentFilter.value  = 'all';
        if (themeFilter) themeFilter.value = 'all';
        this._store.setFilter('search',    '');
        this._store.setFilter('sentiment', 'all');
        this._store.setFilter('theme',     'all');
    }
}

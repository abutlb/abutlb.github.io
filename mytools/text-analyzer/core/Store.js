// core/Store.js — مدير الحالة المركزي

export class Store {
    constructor() {
        this.rawData        = [];
        this.headers        = [];
        this.selectedColumn = '';
        this.dateColumn     = '';
        this.groupColumn    = '';
        this.textData       = [];
        this.filteredData   = [];
        this.analysisResults = null;
        this.filters = {
            sentiment: 'all',
            theme:     'all',
            search:    '',
        };
        this._listeners = [];
    }

    subscribe(fn) {
        this._listeners.push(fn);
    }

    _notify() {
        this._listeners.forEach(fn => fn(this));
    }

    setRawData(rawData, headers) {
        this.rawData    = rawData;
        this.headers    = headers;
        this._notify();
    }

    setColumns({ selectedColumn, dateColumn, groupColumn }) {
        this.selectedColumn = selectedColumn ?? this.selectedColumn;
        this.dateColumn     = dateColumn     ?? this.dateColumn;
        this.groupColumn    = groupColumn    ?? this.groupColumn;
        this._notify();
    }

    setTextData(textData) {
        this.textData    = textData;
        this.filteredData = textData;
        this._notify();
    }

    setAnalysisResults(results) {
        this.analysisResults = results;
        this._notify();
    }

    setFilter(key, value) {
        this.filters[key] = value;
        this._applyFilters();
        this._notify();
    }

    _applyFilters() {
        let data = this.textData;
        const { sentiment, theme, search } = this.filters;
        if (sentiment && sentiment !== 'all') data = data.filter(d => d.sentiment === sentiment);
        if (theme     && theme     !== 'all') data = data.filter(d => d.theme     === theme);
        if (search    && search.trim()) {
            const q = search.trim().toLowerCase();
            data = data.filter(d => d.original.toLowerCase().includes(q));
        }
        this.filteredData = data;
    }

    reset() {
        this.rawData         = [];
        this.headers         = [];
        this.selectedColumn  = '';
        this.dateColumn      = '';
        this.groupColumn     = '';
        this.textData        = [];
        this.filteredData    = [];
        this.analysisResults = null;
        this.filters         = { sentiment: 'all', theme: 'all', search: '' };
        this._notify();
    }
}

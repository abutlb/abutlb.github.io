// core/Store.js — حالة التطبيق المركزية

export class Store {

    constructor() {
        this.scenario = 'personal';
        this.inputs   = {};
        this.results  = null;
    }

    setScenario(sc) {
        this.scenario = sc;
    }

    setInputs(inputs) {
        this.inputs = { ...inputs };
    }

    setResults(results) {
        this.results = results;
    }

    hasResults() {
        return this.results !== null;
    }
}

// ui/YearlyTab.js — تبويب الجدول السنوي التفصيلي

import { fmtK } from "../utils/Formatters.js";

export class YearlyTab {

    constructor() {
        this._allYearData   = [];
        this._sellingRate   = 0;
    }

    render(store) {
        const { base } = store.results;
        this._allYearData = base.yearData;
        this._sellingRate = base.inputs.sellingCosts / 100;
        this._buildTable('all');
    }

    // استدعاؤها من الـ filter event
    applyFilter(value) {
        this._buildTable(value);
    }

    _buildTable(filter) {
        let rows = this._allYearData;
        if (filter === '5') {
            rows = rows.filter((d, i) =>
                d.year % 5 === 0 || i === 0 || i === rows.length - 1
            );
        } else if (filter === '10') {
            rows = rows.filter((d, i) =>
                d.year % 10 === 0 || i === 0 || i === rows.length - 1
            );
        }

        const tbody = document.getElementById('yearTableBody');
        if (!tbody) return;

        tbody.innerHTML = rows.map(d => {
            const fv     = d.propValue;
            const netOwn = d.cumOwn - (fv * (1 - this._sellingRate) - d.remainingLoan);
            const better = netOwn <= d.cumRent
                ? '<span class="bdg bdg-g">تملك</span>'
                : '<span class="bdg bdg-y">إيجار</span>';

            const equityClass = d.equity >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400';

            return `<tr>
                <td class="font-bold text-center">${d.year}</td>
                <td>${fmtK(d.monthly)}</td>
                <td>${fmtK(d.monthlyRent)}</td>
                <td class="${equityClass} font-bold">${fmtK(d.equity)}</td>
                <td>${fmtK(d.cumOwn)}</td>
                <td>${fmtK(d.cumRent)}</td>
                <td class="text-center">${better}</td>
            </tr>`;
        }).join('');
    }
}

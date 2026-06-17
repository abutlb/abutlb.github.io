// reporting/ChartBuilder.js — إنشاء وإدارة الرسوم البيانية

import { fmtK } from "../utils/Formatters.js";

export class ChartBuilder {

    constructor() {
        this._charts = {};
    }

    _destroy(id) {
        if (this._charts[id]) {
            this._charts[id].destroy();
            delete this._charts[id];
        }
    }

    _isDark() {
        return document.documentElement.classList.contains('dark');
    }

    _gridColor() {
        return this._isDark() ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';
    }

    _tickFont(size = 10) {
        return { family: 'Tajawal', size };
    }

    _borderColor() {
        return this._isDark() ? '#1e293b' : '#ffffff';
    }

    // ── خط التكاليف التراكمية ────────────────────────────────────
    buildLineChart(canvasId, yearData) {
        this._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this._charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: yearData.map(d => `${d.year}`),
                datasets: [
                    {
                        label: 'التملك (تراكمي)',
                        data: yearData.map(d => d.cumOwn),
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37,99,235,.07)',
                        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5,
                    },
                    {
                        label: 'الإيجار (تراكمي)',
                        data: yearData.map(d => d.cumRent),
                        borderColor: '#a855f7',
                        backgroundColor: 'rgba(168,85,247,.07)',
                        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5,
                    },
                ],
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { labels: { font: this._tickFont(11), boxWidth: 12 } } },
                scales: {
                    y: {
                        grid: { color: this._gridColor() },
                        ticks: { callback: v => fmtK(v), font: this._tickFont(10) },
                    },
                    x: {
                        grid: { color: this._gridColor() },
                        ticks: { font: this._tickFont(10), maxTicksLimit: 10 },
                    },
                },
            },
        });
    }

    // ── دائري: توزيع تكاليف التملك ──────────────────────────────
    buildPieChart(canvasId, { downPayment, totalInterest, totalMaint, totalIns, closingCostAmt }) {
        this._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this._charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['دفعة مقدمة', 'فوائد التمويل', 'صيانة', 'تأمين', 'رسوم توثيق'],
                datasets: [{
                    data: [downPayment, totalInterest, totalMaint, totalIns, closingCostAmt],
                    backgroundColor: ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    borderColor: this._borderColor(),
                }],
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'right', labels: { font: this._tickFont(11), boxWidth: 10 } },
                    tooltip: { callbacks: { label: ctx => ` ${fmtK(ctx.raw)}` } },
                },
            },
        });
    }

    // ── أعمدة: مقارنة التكاليف السنوية ──────────────────────────
    buildBarChart(canvasId, yearData) {
        this._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const step    = Math.max(1, Math.floor(yearData.length / 10));
        const sampled = yearData.filter((_, i) =>
            (i + 1) % step === 0 || i === 0 || i === yearData.length - 1
        );

        this._charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sampled.map(d => `س${d.year}`),
                datasets: [
                    {
                        label: 'تكلفة التملك',
                        data: sampled.map(d => d.ownershipYear),
                        backgroundColor: 'rgba(37,99,235,.75)',
                        borderRadius: 5,
                    },
                    {
                        label: 'تكلفة الإيجار',
                        data: sampled.map(d => d.yearRent),
                        backgroundColor: 'rgba(168,85,247,.75)',
                        borderRadius: 5,
                    },
                ],
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { labels: { font: this._tickFont(11), boxWidth: 10 } } },
                scales: {
                    y: {
                        grid: { color: this._gridColor() },
                        ticks: { callback: v => fmtK(v), font: this._tickFont(9) },
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: this._tickFont(9) },
                    },
                },
            },
        });
    }

    // ── خط: بناء الثروة صافي الملكية vs الاستثمار البديل ────────
    buildNetWorthChart(canvasId, yearData, netWorthOwn, netWorthRent) {
        this._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this._charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: yearData.map(d => `${d.year}`),
                datasets: [
                    {
                        label: 'حقوق الملكية (عقار)',
                        data: netWorthOwn,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,.07)',
                        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5,
                    },
                    {
                        label: 'نمو الاستثمار البديل',
                        data: netWorthRent,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245,158,11,.07)',
                        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5,
                    },
                ],
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { labels: { font: this._tickFont(11), boxWidth: 12 } } },
                scales: {
                    y: {
                        grid: { color: this._gridColor() },
                        ticks: { callback: v => fmtK(v), font: this._tickFont(10) },
                    },
                    x: {
                        grid: { color: this._gridColor() },
                        ticks: { font: this._tickFont(10), maxTicksLimit: 10 },
                    },
                },
            },
        });
    }

    // ── خط: التدفق النقدي الشهري (للاستثماري) ───────────────────
    buildCashFlowChart(canvasId, yearData, monthly, invRentM, rentInc, vacancyRate, mgmtFee) {
        this._destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const cashFlows = yearData.map(d => {
            const grossMonthly = invRentM * (1 + (rentInc / 100)) ** (d.year - 1)
                                * (1 - vacancyRate / 100) * (1 - mgmtFee / 100);
            return +(grossMonthly - monthly).toFixed(0);
        });

        this._charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: yearData.map(d => `س${d.year}`),
                datasets: [{
                    label: 'التدفق النقدي الشهري',
                    data: cashFlows,
                    backgroundColor: cashFlows.map(v =>
                        v >= 0 ? 'rgba(16,185,129,.75)' : 'rgba(239,68,68,.75)'
                    ),
                    borderRadius: 4,
                }],
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: this._gridColor() },
                        ticks: { callback: v => fmtK(v), font: this._tickFont(9) },
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: this._tickFont(9), maxTicksLimit: 12 },
                    },
                },
            },
        });
    }

    destroyAll() {
        Object.keys(this._charts).forEach(id => this._destroy(id));
    }
}

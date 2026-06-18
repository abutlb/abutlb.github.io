// ui/ChartBuilder.js — بناء جميع الرسوم البيانية

export class ChartBuilder {
    constructor() {
        this._instances = new Map();
    }

    _destroy(id) {
        const ch = this._instances.get(id);
        if (ch) { ch.destroy(); this._instances.delete(id); }
    }

    _ctx(id) {
        const canvas = document.getElementById(id);
        if (!canvas) return null;
        this._destroy(id);
        return canvas.getContext('2d');
    }

    _save(id, instance) {
        this._instances.set(id, instance);
        return instance;
    }

    destroyAll() {
        this._instances.forEach(ch => ch.destroy());
        this._instances.clear();
    }

    buildWordFreqChart(id, words) {
        const ctx = this._ctx(id);
        if (!ctx || !words.length) return;
        return this._save(id, new Chart(ctx, {
            type: 'bar',
            data: {
                labels: words.slice(0, 15).map(w => w.text),
                datasets: [{ data: words.slice(0, 15).map(w => w.count), backgroundColor: 'rgba(220,38,38,.7)', borderColor: 'rgba(220,38,38,1)', borderWidth: 1 }],
            },
            options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } },
        }));
    }

    buildNgramChart(id, ngrams, color = '#7c3aed') {
        const ctx = this._ctx(id);
        if (!ctx || !ngrams.length) return;
        return this._save(id, new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ngrams.slice(0, 12).map(n => n.text),
                datasets: [{ data: ngrams.slice(0, 12).map(n => n.count), backgroundColor: color + 'b3', borderColor: color, borderWidth: 1 }],
            },
            options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } },
        }));
    }

    buildSentimentChart(id, stats) {
        const ctx = this._ctx(id);
        if (!ctx) return;
        return this._save(id, new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['إيجابي', 'سلبي', 'محايد'],
                datasets: [{ data: [stats.positive, stats.negative, stats.neutral], backgroundColor: ['rgba(16,185,129,.8)', 'rgba(220,38,38,.8)', 'rgba(107,114,128,.6)'], borderWidth: 2 }],
            },
            options: { plugins: { legend: { position: 'bottom' } } },
        }));
    }

    buildLengthChart(id, ranges) {
        const ctx = this._ctx(id);
        if (!ctx) return;
        return this._save(id, new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ranges),
                datasets: [{ label: 'عدد التعليقات', data: Object.values(ranges), backgroundColor: 'rgba(79,70,229,.7)', borderColor: 'rgba(79,70,229,1)', borderWidth: 1 }],
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
        }));
    }

    buildThemeChart(id, themeData) {
        const ctx = this._ctx(id);
        if (!ctx || !themeData.length) return;
        const colors = themeData.map((_, i) => `hsla(${(i * 137) % 360},70%,60%,.75)`);
        return this._save(id, new Chart(ctx, {
            type: 'pie',
            data: {
                labels: themeData.map(t => t.theme),
                datasets: [{ data: themeData.map(t => t.count), backgroundColor: colors, borderWidth: 1 }],
            },
            options: { plugins: { legend: { position: 'right', rtl: true, labels: { font: { family: 'Tajawal', size: 11 } } } } },
        }));
    }

    buildTimelineChart(id, timeline) {
        const ctx = this._ctx(id);
        if (!ctx || !timeline.length) return;
        return this._save(id, new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeline.map(t => t.label),
                datasets: [
                    { label: 'إيجابي', data: timeline.map(t => t.positive), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.15)', tension: .4, fill: true },
                    { label: 'سلبي',   data: timeline.map(t => t.negative), borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,.15)',  tension: .4, fill: true },
                    { label: 'إجمالي', data: timeline.map(t => t.total),    borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.1)',   tension: .4, fill: false, borderDash: [4,4] },
                ],
            },
            options: { plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } },
        }));
    }

    buildGroupChart(id, groups) {
        const ctx = this._ctx(id);
        if (!ctx || !groups.length) return;
        return this._save(id, new Chart(ctx, {
            type: 'bar',
            data: {
                labels: groups.map(g => g.group),
                datasets: [
                    { label: 'إيجابي', data: groups.map(g => g.positive), backgroundColor: 'rgba(16,185,129,.7)' },
                    { label: 'سلبي',   data: groups.map(g => g.negative), backgroundColor: 'rgba(220,38,38,.7)'  },
                    { label: 'محايد',  data: groups.map(g => g.neutral),  backgroundColor: 'rgba(107,114,128,.5)' },
                ],
            },
            options: { plugins: { legend: { position: 'bottom' } }, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } },
        }));
    }
}

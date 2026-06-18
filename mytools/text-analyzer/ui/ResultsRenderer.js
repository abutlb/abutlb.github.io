// ui/ResultsRenderer.js — عرض جميع نتائج التحليل

export class ResultsRenderer {

    render(store, charts) {
        const { analysisResults: r, filteredData, textData } = store;
        if (!r) return;

        this._renderStats(r.sentimentStats, textData);
        this._renderTopWords(r.frequency?.words ?? []);
        this._renderRepeated(textData);
        this._renderOutliers(r.outliers);
        this._renderNegativeList(textData);

        charts.buildWordFreqChart('wordCloudChart', r.frequency?.words ?? []);
        charts.buildNgramChart('bigramChart', r.frequency?.bigrams ?? [], '#7c3aed');
        charts.buildNgramChart('trigramChart', r.frequency?.trigrams ?? [], '#0891b2');
        charts.buildSentimentChart('sentimentChart', r.sentimentStats);
        charts.buildLengthChart('lengthDistributionChart', r.lengthDist);
        charts.buildThemeChart('themeDistributionChart', r.themeDistribution ?? []);

        this._renderThemeTable(r.themeDistribution ?? [], textData.length);
        this._renderThemeSelector(r.themeDistribution ?? [], store);

        if (r.timeline) {
            charts.buildTimelineChart('timelineChart', r.timeline);
            this._renderTimelineVisible(true);
        } else {
            this._renderTimelineVisible(false);
        }

        if (r.groups) {
            charts.buildGroupChart('groupChart', r.groups);
            this._renderGroupTable(r.groups);
            this._renderGroupVisible(true);
        } else {
            this._renderGroupVisible(false);
        }

        this._renderFilteredTable(filteredData);
        this._renderSuggestions(r.suggestions ?? []);
        this._renderNumbers(r.numbers);
    }

    _renderStats(stats, textData) {
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('totalCount',    stats.total);
        set('positiveCount', stats.positive);
        set('negativeCount', stats.negative);
        set('neutralCount',  stats.neutral);

        const allWords  = textData.reduce((s, d) => s + d.wordCount, 0);
        const uniqueEl  = document.getElementById('uniqueWordsCount');
        const avgEl     = document.getElementById('avgWordsCount');
        if (uniqueEl && avgEl) {
            const allTokens = [...new Set(textData.flatMap(d => d.original.split(/\s+/)))];
            uniqueEl.textContent = allTokens.length;
            avgEl.textContent    = stats.total ? Math.round(allWords / stats.total) : 0;
        }
    }

    _renderTopWords(words) {
        const tbody = document.getElementById('topWordsTable')?.querySelector('tbody');
        if (!tbody) return;
        if (!words.length) { tbody.innerHTML = '<tr><td colspan="3" class="text-center py-3 text-gray-400">لا توجد بيانات</td></tr>'; return; }
        tbody.innerHTML = words.slice(0, 20).map((w, i) => `
            <tr>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center text-gray-500">${i + 1}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600">${w.text}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center font-bold text-red-600 dark:text-red-400">${w.count}</td>
            </tr>`).join('');
    }

    _renderRepeated(textData) {
        const tbody = document.getElementById('repeatedCommentsTable')?.querySelector('tbody');
        if (!tbody) return;
        const freq = new Map();
        textData.forEach(d => freq.set(d.original, (freq.get(d.original) ?? 0) + 1));
        const repeated = [...freq.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (!repeated.length) { tbody.innerHTML = '<tr><td colspan="2" class="text-center py-3 text-gray-400">لا يوجد</td></tr>'; return; }
        tbody.innerHTML = repeated.map(([text, count]) => `
            <tr>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-sm">${text}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center font-bold text-red-600 dark:text-red-400">${count}</td>
            </tr>`).join('');
    }

    _renderOutliers(outliers) {
        if (!outliers) return;

        const renderList = (id, items, extraFn) => {
            const el = document.getElementById(id);
            if (!el || !items?.length) return;
            el.innerHTML = items.map(item => `
                <div class="mb-2 p-2 rounded bg-gray-50 dark:bg-gray-700/50 text-sm border border-gray-200 dark:border-gray-600">
                    <span class="text-xs text-gray-400 ml-2">${extraFn(item)}</span>
                    ${item.original.slice(0, 120)}${item.original.length > 120 ? '...' : ''}
                </div>`).join('');
        };

        renderList('longestComments',  outliers.longest,      i => `${i.wordCount} كلمة`);
        renderList('shortestComments', outliers.shortest,     i => `${i.wordCount} كلمة`);
        renderList('mostNegativeComments', outliers.mostNegative, i => `سلبية`);
    }

    _renderNegativeList(textData) {
        const el = document.getElementById('negativeExpressionsList');
        if (!el) return;
        const neg = textData.filter(d => d.sentiment === 'سلبي').sort((a, b) => b.wordCount - a.wordCount).slice(0, 10);
        el.innerHTML = neg.length
            ? neg.map(d => `<li class="text-red-600 dark:text-red-400 text-sm py-1">${d.original}</li>`).join('')
            : '<li class="text-gray-400">لا توجد تعليقات سلبية</li>';
    }

    _renderThemeTable(themeData, total) {
        const tbody = document.getElementById('themeDistributionTable')?.querySelector('tbody');
        if (!tbody) return;
        tbody.innerHTML = themeData.map(({ theme, count }) => `
            <tr>
                <td class="py-1 px-2 border-b dark:border-gray-600">${theme}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center">${count}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center">${total ? (count / total * 100).toFixed(1) : 0}%</td>
            </tr>`).join('');
    }

    _renderThemeSelector(themeData, store) {
        const sel = document.getElementById('themeSelector');
        if (!sel) return;
        const cur = sel.value;
        sel.innerHTML = '<option value="">-- اختر موضوعاً --</option>' +
            themeData.map(({ theme }) => `<option value="${theme}" ${theme === cur ? 'selected' : ''}>${theme}</option>`).join('');
    }

    _renderFilteredTable(data) {
        const tbody = document.getElementById('filteredResultsTable')?.querySelector('tbody');
        const countEl = document.getElementById('filteredCount');
        if (!tbody) return;
        if (countEl) countEl.textContent = data.length;
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-gray-400">لا توجد نتائج</td></tr>'; return; }
        tbody.innerHTML = data.slice(0, 200).map((d, i) => `
            <tr>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center text-gray-400 text-xs">${i + 1}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-sm">${d.original}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center text-xs">${d.theme}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center text-xs ${d.sentiment === 'سلبي' ? 'text-red-500' : d.sentiment === 'إيجابي' ? 'text-green-500' : 'text-gray-400'}">${d.sentiment}</td>
            </tr>`).join('');
    }

    _renderSuggestions(suggestions) {
        const el = document.getElementById('suggestionsList');
        if (!el) return;
        if (!suggestions.length) { el.innerHTML = '<li class="text-gray-400">لم يتم اكتشاف مقترحات</li>'; return; }
        el.innerHTML = suggestions.slice(0, 30).map(s => `
            <li class="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 text-sm">
                <span class="text-blue-700 dark:text-blue-300">${s.text}</span>
                <span class="text-xs text-gray-400 mr-2 block">${s.theme} · ${s.sentiment}</span>
            </li>`).join('');
    }

    _renderNumbers(numbers) {
        if (!numbers) return;
        const el = document.getElementById('numbersSummary');
        if (!el || !numbers.summary?.length) return;
        el.innerHTML = numbers.summary.map(s => `
            <div class="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800 mb-2">
                <span class="font-bold text-purple-700 dark:text-purple-300">${s.unit}</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">متوسط: <strong>${s.avg}</strong> | مذكور ${s.count} مرة | نطاق: ${s.min}–${s.max}</span>
            </div>`).join('');
    }

    _renderTimelineVisible(show) {
        const el = document.getElementById('timelineSection');
        if (el) el.style.display = show ? '' : 'none';
    }

    _renderGroupVisible(show) {
        const el = document.getElementById('groupSection');
        if (el) el.style.display = show ? '' : 'none';
    }

    _renderGroupTable(groups) {
        const tbody = document.getElementById('groupTable')?.querySelector('tbody');
        if (!tbody) return;
        tbody.innerHTML = groups.map(g => `
            <tr>
                <td class="py-1 px-2 border-b dark:border-gray-600">${g.group}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center">${g.total}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center text-green-600">${g.posRate}%</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center text-red-600">${g.negRate}%</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center">${g.avgWords}</td>
                <td class="py-1 px-2 border-b dark:border-gray-600 text-center text-xs">${g.topTheme}</td>
            </tr>`).join('');
    }
}

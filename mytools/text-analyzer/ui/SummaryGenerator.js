// ui/SummaryGenerator.js — الملخص التنفيذي التلقائي (الميزة 11)

export class SummaryGenerator {

    static generate(store) {
        const { textData, analysisResults } = store;
        if (!textData.length || !analysisResults) return '';

        const {
            sentimentStats: stats,
            frequency: freq,
            themeDistribution: themes,
            suggestions,
            numbers,
            outliers,
            timeline,
            groups,
        } = analysisResults;

        const total    = stats.total;
        const posRate  = Math.round(stats.positive / total * 100);
        const negRate  = Math.round(stats.negative / total * 100);
        const neutRate = 100 - posRate - negRate;

        const topTheme  = themes?.[0]?.theme ?? '—';
        const topWord   = freq?.words?.[0]?.text ?? '—';
        const topBigram = freq?.bigrams?.[0]?.text ?? null;

        const sentiment =
            posRate >= 60 ? 'إيجابية في معظمها' :
            negRate >= 60 ? 'سلبية في معظمها'   :
            posRate > negRate ? 'إيجابية بشكل عام' :
            'متباينة المشاعر';

        let summary = `تم تحليل <strong>${total}</strong> تعليق/نص، وتبيّن أن الآراء <strong>${sentiment}</strong>. `;
        summary += `إذ بلغت نسبة الآراء الإيجابية <strong>${posRate}%</strong>، `;
        summary += `والسلبية <strong>${negRate}%</strong>، `;
        if (neutRate > 0) summary += `والمحايدة <strong>${neutRate}%</strong>. `;

        summary += `أبرز الموضوعات التي تكررت في التعليقات كانت "<strong>${topTheme}</strong>"، `;
        summary += `وأكثر الكلمات استخداماً هي "<strong>${topWord}</strong>"`;
        if (topBigram) summary += ` وعبارة "<strong>${topBigram}</strong>"`;
        summary += '. ';

        if (suggestions?.length > 0) {
            summary += `كما استُخلص <strong>${suggestions.length}</strong> مقترح `;
            summary += `وطلب مباشر من النصوص. `;
        }

        if (numbers?.summary?.length > 0) {
            const waitTime = numbers.summary.find(s => s.unit === 'وقت_انتظار' || s.unit === 'ساعة');
            if (waitTime) {
                summary += `متوسط وقت الانتظار المذكور في التعليقات <strong>${waitTime.avg} ${waitTime.unit}</strong>. `;
            }
        }

        if (timeline?.length >= 3) {
            const last  = timeline[timeline.length - 1];
            const first = timeline[0];
            const trend = last.positive > first.positive ? 'تحسناً' : 'تراجعاً';
            summary += `المؤشرات الزمنية تُظهر ${trend} في المشاعر الإيجابية خلال الفترة. `;
        }

        if (outliers?.mostNegative?.length > 0) {
            summary += `أبرز التعليقات السلبية تضمنت مخاوف حول: `;
            const themes = [...new Set(outliers.mostNegative.map(i => i.theme))].slice(0, 3);
            summary += themes.map(t => `<strong>${t}</strong>`).join(' و') + '. ';
        }

        return summary;
    }

    static generateHTML(store) {
        const raw = this.generate(store);
        if (!raw) return '<p class="text-gray-400 dark:text-gray-500">لا توجد بيانات كافية لإنشاء الملخص التنفيذي.</p>';
        return `<div class="leading-loose text-gray-700 dark:text-gray-300 text-sm">${raw}</div>`;
    }
}

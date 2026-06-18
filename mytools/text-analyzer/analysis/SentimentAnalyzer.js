// analysis/SentimentAnalyzer.js — تحليل المشاعر + الشذوذات (الميزة 10)

import { NEGATIVE_KEYWORDS, POSITIVE_KEYWORDS } from '../data/analyzer-data.js';

const NEG_SET = new Set(NEGATIVE_KEYWORDS.map(w => w.replace(/_/g, ' ')));
const POS_SET = new Set(POSITIVE_KEYWORDS.map(w => w.replace(/_/g, ' ')));

const NEGATION = /لا |لم |لن |ما |مو |ليس |غير /;

export class SentimentAnalyzer {

    static analyze(text) {
        if (!text) return 'محايد';
        const lower = text.toLowerCase().replace(/_/g, ' ');

        let posScore = 0;
        let negScore = 0;

        for (const kw of POS_SET) {
            if (lower.includes(kw)) posScore++;
        }
        for (const kw of NEG_SET) {
            if (lower.includes(kw)) negScore++;
        }

        // إذا كانت هناك نفي قبل كلمة إيجابية
        if (NEGATION.test(lower)) {
            negScore += 0.5;
        }

        if (posScore === 0 && negScore === 0) return 'محايد';
        if (posScore > negScore) return 'إيجابي';
        if (negScore > posScore) return 'سلبي';
        return 'محايد';
    }

    static detectOutliers(textData) {
        if (textData.length === 0) return { longest: [], mostNegative: [], shortest: [] };

        const sorted = [...textData].sort((a, b) => b.wordCount - a.wordCount);
        const longest  = sorted.slice(0, 5);
        const shortest = sorted.slice(-5).reverse();

        const negatives = textData.filter(d => d.sentiment === 'سلبي');
        const negScored = negatives.map(d => {
            let score = 0;
            const lower = d.original.toLowerCase().replace(/_/g, ' ');
            for (const kw of NEG_SET) {
                if (lower.includes(kw)) score++;
            }
            return { ...d, negScore: score };
        }).sort((a, b) => b.negScore - a.negScore);

        return {
            longest,
            shortest,
            mostNegative: negScored.slice(0, 5),
        };
    }

    static getSummaryStats(textData) {
        const total    = textData.length;
        const pos      = textData.filter(d => d.sentiment === 'إيجابي').length;
        const neg      = textData.filter(d => d.sentiment === 'سلبي').length;
        const neutral  = total - pos - neg;
        return { total, positive: pos, negative: neg, neutral };
    }
}

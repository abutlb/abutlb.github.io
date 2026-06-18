// analysis/FrequencyAnalyzer.js — تحليل التكرار والـ N-gram (الميزة 1)

import { Tokenizer } from '../core/Tokenizer.js';

export class FrequencyAnalyzer {

    static analyze(textData, stopwords, topN = 30) {
        const wordFreq    = new Map();
        const bigramFreq  = new Map();
        const trigramFreq = new Map();

        for (const item of textData) {
            const words = Tokenizer.tokenize(item.original, stopwords);

            for (const w of words) {
                wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
            }

            for (const bg of Tokenizer.getBigrams(words)) {
                bigramFreq.set(bg, (bigramFreq.get(bg) ?? 0) + 1);
            }

            for (const tg of Tokenizer.getTrigrams(words)) {
                trigramFreq.set(tg, (trigramFreq.get(tg) ?? 0) + 1);
            }
        }

        const toArray = (map) =>
            [...map.entries()]
                .map(([text, count]) => ({ text, count }))
                .sort((a, b) => b.count - a.count);

        return {
            words:    toArray(wordFreq).slice(0, topN),
            bigrams:  toArray(bigramFreq).slice(0, topN),
            trigrams: toArray(trigramFreq).slice(0, topN),
            uniqueWords: wordFreq.size,
            totalWords:  [...wordFreq.values()].reduce((s, n) => s + n, 0),
        };
    }

    static getLengthDistribution(textData) {
        const ranges = { '1-5': 0, '6-10': 0, '11-20': 0, '21-30': 0, '31+': 0 };
        for (const item of textData) {
            const n = item.wordCount;
            if      (n <= 5)  ranges['1-5']++;
            else if (n <= 10) ranges['6-10']++;
            else if (n <= 20) ranges['11-20']++;
            else if (n <= 30) ranges['21-30']++;
            else              ranges['31+']++;
        }
        return ranges;
    }
}

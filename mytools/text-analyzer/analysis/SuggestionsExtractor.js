// analysis/SuggestionsExtractor.js — استخراج المقترحات والأرقام (الميزتان 7، 8)

import { SUGGESTION_PATTERNS, NUMBER_PATTERNS } from '../data/analyzer-data.js';

export class SuggestionsExtractor {

    static extractSuggestions(textData) {
        const results = [];

        for (const item of textData) {
            const text = item.original;

            for (const pattern of SUGGESTION_PATTERNS) {
                const re = new RegExp(pattern.source, pattern.flags);
                let match;
                while ((match = re.exec(text)) !== null) {
                    const suggestion = (match[1] ?? match[0]).trim();
                    if (suggestion.length >= 5) {
                        results.push({
                            text:       suggestion,
                            source:     text,
                            sentiment:  item.sentiment,
                            theme:      item.theme,
                        });
                    }
                }
            }
        }

        return this._deduplicate(results);
    }

    static extractNumbers(textData) {
        const results = [];

        for (const item of textData) {
            const text = item.original;

            for (const { regex, unit } of NUMBER_PATTERNS) {
                const re = new RegExp(regex.source, regex.flags);
                let match;
                while ((match = re.exec(text)) !== null) {
                    const value = parseFloat(match[1]);
                    if (!isNaN(value)) {
                        results.push({
                            value,
                            unit,
                            context:   text,
                            sentiment: item.sentiment,
                            theme:     item.theme,
                        });
                    }
                }
            }
        }

        return results;
    }

    static summarizeNumbers(numbers) {
        const byUnit = {};
        for (const n of numbers) {
            if (!byUnit[n.unit]) byUnit[n.unit] = [];
            byUnit[n.unit].push(n.value);
        }

        return Object.entries(byUnit).map(([unit, values]) => {
            const sorted = [...values].sort((a, b) => a - b);
            const avg    = values.reduce((s, v) => s + v, 0) / values.length;
            return {
                unit,
                count: values.length,
                avg:   Math.round(avg * 10) / 10,
                min:   sorted[0],
                max:   sorted[sorted.length - 1],
                values,
            };
        });
    }

    static _deduplicate(arr) {
        const seen = new Set();
        return arr.filter(item => {
            const key = item.text.trim().slice(0, 60);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
}

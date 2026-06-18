// core/Tokenizer.js — معالجة النصوص العربية

export class Tokenizer {

    static normalize(text) {
        if (!text) return '';
        return text
            .replace(/[أإآا]/g, 'ا')
            .replace(/[ة]/g,    'ه')
            .replace(/[ى]/g,    'ي')
            .replace(/ؤ/g,      'و')
            .replace(/ئ/g,      'ي')
            .replace(/[ًٌٍَُِّْ]/g, '')   // تشكيل
            .replace(/[^؀-ۿݐ-ݿ\s\d]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    static tokenize(text, stopwords = new Set()) {
        const normalized = this.normalize(text);
        return normalized
            .split(/\s+/)
            .map(w => w.trim())
            .filter(w => w.length >= 2 && !stopwords.has(w));
    }

    static getBigrams(words) {
        const bigrams = [];
        for (let i = 0; i < words.length - 1; i++) {
            bigrams.push(`${words[i]} ${words[i + 1]}`);
        }
        return bigrams;
    }

    static getTrigrams(words) {
        const trigrams = [];
        for (let i = 0; i < words.length - 2; i++) {
            trigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
        }
        return trigrams;
    }

    static wordCount(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    static charCount(text) {
        if (!text) return 0;
        return text.replace(/\s/g, '').length;
    }
}

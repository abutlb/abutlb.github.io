// core/OCREngine.js — Tesseract.js wrapper مع progress وتحسين الدقة

export class OCREngine {
    constructor(onProgress) {
        this.onProgress = onProgress || (() => {});
        this._worker    = null;
        this._cancelled = false;
    }

    // Initialize Tesseract worker (Arabic + English)
    async init() {
        if (!window.Tesseract) throw new Error('Tesseract.js لم يُحمَّل');
        this._cancelled = false;
        this._worker = await window.Tesseract.createWorker(['ara', 'eng'], 1, {
            logger: m => {
                if (m.status === 'recognizing text') {
                    this.onProgress(Math.round(m.progress * 100), m.status);
                } else if (m.status) {
                    this.onProgress(null, m.status);
                }
            },
        });
        return this;
    }

    // Recognize text from canvas (returns { text, confidence, words })
    async recognize(canvas) {
        if (!this._worker) await this.init();
        if (this._cancelled) throw new Error('cancelled');

        const dataURL = canvas.toDataURL('image/png');
        const result  = await this._worker.recognize(dataURL);

        return {
            text:       result.data.text || '',
            confidence: Math.round(result.data.confidence || 0),
            words:      result.data.words || [],
            lines:      result.data.lines || [],
        };
    }

    // Recognize multiple canvases and concatenate results
    async recognizeAll(canvases) {
        let fullText  = '';
        let totalConf = 0;
        let allWords  = [];

        for (let i = 0; i < canvases.length; i++) {
            if (this._cancelled) throw new Error('cancelled');
            this.onProgress(null, `OCR صفحة ${i + 1} من ${canvases.length}`);
            const res = await this.recognize(canvases[i]);
            fullText  += (fullText ? '\n\n' : '') + res.text;
            totalConf += res.confidence;
            allWords   = allWords.concat(res.words);
        }

        return {
            text:       fullText,
            confidence: Math.round(totalConf / canvases.length),
            words:      allWords,
        };
    }

    cancel() {
        this._cancelled = true;
    }

    async destroy() {
        if (this._worker) {
            try { await this._worker.terminate(); } catch {}
            this._worker = null;
        }
    }

    // Interpret confidence as quality label
    static qualityLabel(confidence) {
        if (confidence >= 75) return { label: 'جودة عالية', cls: 'q-high',   icon: 'fa-check-circle',      pct: confidence };
        if (confidence >= 45) return { label: 'جودة متوسطة', cls: 'q-medium', icon: 'fa-exclamation-circle', pct: confidence };
        return                       { label: 'جودة منخفضة', cls: 'q-low',    icon: 'fa-times-circle',       pct: confidence };
    }
}

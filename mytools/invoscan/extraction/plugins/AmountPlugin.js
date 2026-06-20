import { BasePlugin }     from '../engine/BasePlugin.js';
import { normD, cleanAmt } from '../utils.js';

export class AmountPlugin extends BasePlugin {
    get name() { return 'amounts'; }

    extract(rawText) {
        const t = normD(rawText);
        return {
            subtotal: this._subtotal(t) || this._miss(),
            tax:      this._tax(t)      || this._miss(),
            discount: this._discount(t) || this._miss(),
            total:    this._total(t)    || this._miss(),
        };
    }

    _subtotal(t) {
        return this._try(t, [
            { re: /(?:المجموع\s*الفرعي|Subtotal|Sub-?total|Total\s*Before\s*VAT|الاجمالي\s*قبل\s*الضريبة)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i, confidence: 0.92, method: 'labeled', post: cleanAmt },
        ]);
    }

    _tax(t) {
        return this._try(t, [
            { re: /ضريبة\s*القيمة\s*المضافة\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i,    confidence: 0.93, method: 'arabic-vat', post: cleanAmt },
            { re: /\bVAT\b\s*[\t:：]\s*([\d,،]+(?:\.\d+)?)/i,                        confidence: 0.88, method: 'english-vat', post: cleanAmt },
            { re: /\b(?:GST|Tax)\b\s*[\t:：]\s*([\d,،]+(?:\.\d+)?)/i,                confidence: 0.82, method: 'gst-tax', post: cleanAmt },
        ]);
    }

    _discount(t) {
        return this._try(t, [
            { re: /(?:اجمالي\s*خصم\s*العروض|Total\s*Discount)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i, confidence: 0.93, method: 'total-discount', post: cleanAmt },
            { re: /(?:خصم|Discount)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i,                           confidence: 0.75, method: 'discount', post: cleanAmt },
        ]);
    }

    _total(t) {
        return this._try(t, [
            { re: /Grand\s*Total\s*(?:\([^)]*\))?\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i,              confidence: 0.95, method: 'grand-total-en', post: cleanAmt },
            { re: /(?:الاجمالي|الإجمالي)\s*\([^)]*\)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i,          confidence: 0.95, method: 'grand-total-ar', post: cleanAmt },
            { re: /(?:الإجمالي\s*الكلي|المبلغ\s*الإجمالي)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i,     confidence: 0.92, method: 'total-ar', post: cleanAmt },
            { re: /(?:Total\s*Due|Total\s*Amount|Amount\s*Due)\s*[\t :：]?\s*([\d,،]+(?:\.\d+)?)/i, confidence: 0.88, method: 'total-due', post: cleanAmt },
            { re: /(?:الإجمالي|Total)\s*[\t:：]\s*([\d,،]+(?:\.\d+)?)/i,                           confidence: 0.65, method: 'fallback', post: cleanAmt },
        ]);
    }
}

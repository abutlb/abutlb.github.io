import { BasePlugin } from '../engine/BasePlugin.js';
import { normD }      from '../utils.js';

export class MetaPlugin extends BasePlugin {
    get name() { return 'meta'; }

    extract(rawText) {
        const t = normD(rawText);
        return {
            poNumber:     this._poNumber(t)     || this._miss(),
            currency:     this._currency(t)     || this._miss(),
            paymentTerms: this._paymentTerms(t) || this._miss(),
            notes:        this._notes(t)        || this._miss(),
        };
    }

    _poNumber(t) {
        return this._try(t, [
            { re: /(?:رقم\s*أمر\s*الشراء|P\.?O\.?\s*(?:No|Number)?|Purchase\s*Order)\s*[:：#]?\s*([A-Za-z0-9\-\/]{2,20})/i, confidence: 0.90, method: 'labeled' },
        ]);
    }

    _currency(t) {
        const m = t.match(/\b(SAR|USD|AED|EUR|GBP|EGP|KWD|BHD|OMR)\b/i);
        if (m) return this._hit(m[1].toUpperCase(), 0.85, 'iso-code');
        if (/ريال\s*سعودي|ر\.س/.test(t)) return this._hit('SAR', 0.80, 'arabic-sar');
        return null;
    }

    _paymentTerms(t) {
        return this._try(t, [
            { re: /(?:شروط\s*الدفع|طريقة\s*الدفع|Payment\s*Terms?)\s*[:：]\s*([^\n\r\t]{3,60})/i, confidence: 0.88, method: 'labeled' },
        ]);
    }

    _notes(t) {
        return this._try(t, [
            { re: /(?:ملاحظات|Notes?|Remarks?|تعليق)\s*[:：]\s*([^\n\r]{5,200})/i, confidence: 0.80, method: 'labeled' },
        ]);
    }
}

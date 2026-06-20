import { BasePlugin } from '../engine/BasePlugin.js';
import { normD }      from '../utils.js';

export class VatPlugin extends BasePlugin {
    get name() { return 'vat'; }

    extract(rawText) {
        const t = normD(rawText);
        const result = this._try(t, [
            { re: /(?:الرقم\s*الضريبي|رقم\s*ضريبة)\s*[:：]\s*([0-9]{5,20})/i,    confidence: 0.95, method: 'arabic-vat', post: v => v.split(/\s+/)[0] },
            { re: /VAT\s*(?:No|Number|Reg|Registration)\.?\s*[:：]\s*([0-9]{5,20})/i, confidence: 0.90, method: 'english-vat', post: v => v.split(/\s+/)[0] },
            { re: /TRN\s*[:：]\s*([0-9]{5,20})/i,                                  confidence: 0.85, method: 'trn',        post: v => v.split(/\s+/)[0] },
            { re: /\b(3\d{14})\b/, confidence: 0.70, method: 'saudi-vat-pattern' }, // السعودية تبدأ بـ 3 وطولها 15
        ]);
        return { vatNumber: result || this._miss() };
    }
}

import { BasePlugin }        from '../engine/BasePlugin.js';
import { normD, cleanValue } from '../utils.js';

export class CustomerPlugin extends BasePlugin {
    get name() { return 'customer'; }

    extract(rawText) {
        const t      = normD(rawText);
        const result = this._try(t, [
            { re: /(?:اسم\s*العميل)\s*[:：]\s*([^\n\r\t:]{3,50})/i,                   confidence: 0.95, method: 'arabic-customer', post: cleanValue },
            { re: /(?:Customer\s*Name|Customer)\s*[:：]\s*([^\n\r\t:]{3,50})/i,        confidence: 0.90, method: 'english-customer', post: cleanValue },
            { re: /(?:العميل|المشتري|Client|Bill\s*To|Sold\s*To)\s*[:：]\s*([^\n\r\t:]{3,50})/i, confidence: 0.80, method: 'bill-to', post: cleanValue },
        ]);
        return { customer: result || this._miss() };
    }
}

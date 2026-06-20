import { BasePlugin } from '../engine/BasePlugin.js';
import { normD }      from '../utils.js';

export class InvoiceNumberPlugin extends BasePlugin {
    get name() { return 'invoice-number'; }

    extract(rawText) {
        const t      = normD(rawText);
        const result = this._try(t, [
            { re: /(?:رقم\s*الفاتورة|فاتورة\s*رقم)\s*[:：]\s*([A-Za-z0-9\-\/]{4,})/i,          confidence: 0.95, method: 'arabic-label',  post: v => v.split(/\s+/)[0] },
            { re: /Invoice\s*(?:No|Number|#|Num)\.?\s*[:：]\s*([A-Za-z0-9\-\/]{4,})/i,            confidence: 0.90, method: 'english-label', post: v => v.split(/\s+/)[0] },
            { re: /(?:رقم\s*الأمر|Order\s*(?:No|Number))\s*[:：]\s*([A-Za-z0-9\-\/]{4,})/i,      confidence: 0.70, method: 'order-number',  post: v => v.split(/\s+/)[0] },
            { re: /(?:INV|FAT|INVOICE)[.\-\s]?([A-Za-z0-9\-\/]{3,})/i,                            confidence: 0.60, method: 'prefix',        post: v => v.split(/\s+/)[0] },
        ]);
        return { invoiceNumber: result || this._miss() };
    }
}

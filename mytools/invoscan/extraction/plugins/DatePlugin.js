import { BasePlugin } from '../engine/BasePlugin.js';
import { normD }      from '../utils.js';

export class DatePlugin extends BasePlugin {
    get name() { return 'date'; }

    extract(rawText) {
        const t = normD(rawText);
        return {
            date:    this._date(t)    || this._miss(),
            dueDate: this._dueDate(t) || this._miss(),
        };
    }

    _date(t) {
        return this._try(t, [
            { re: /(?:تاريخ[^\n\r:：]*|Issue\s*Date|Invoice\s*Date)\s*[:：]\s*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i, confidence: 0.95, method: 'labeled-iso' },
            { re: /(?:تاريخ[^\n\r:：]*|Date)\s*[:：]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i, confidence: 0.90, method: 'labeled-dmy' },
            { re: /\b(\d{4}-\d{2}-\d{2})\b/, confidence: 0.50, method: 'bare-iso' },
            { re: /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/, confidence: 0.40, method: 'bare-dmy' },
        ]);
    }

    _dueDate(t) {
        return this._try(t, [
            { re: /(?:تاريخ\s*الاستحقاق|موعد\s*السداد|Due\s*Date|Payment\s*Due)\s*[:：]\s*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i, confidence: 0.95, method: 'labeled-iso' },
            { re: /(?:تاريخ\s*الاستحقاق|Due\s*Date)\s*[:：]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i, confidence: 0.90, method: 'labeled-dmy' },
        ]);
    }
}

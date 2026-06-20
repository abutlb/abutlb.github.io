import { BasePlugin }           from '../engine/BasePlugin.js';
import { normD, cleanValue }    from '../utils.js';

function clean(v) {
    v = cleanValue(v);
    // إذا الاسم يبدأ عربي → أوقف عند أول كلمة إنجليزية كبيرة
    const enStart = v.search(/[A-Z][a-z]/);
    if (enStart > 3) return v.slice(0, enStart).trim() || v;
    return v;
}

export class SupplierPlugin extends BasePlugin {
    get name() { return 'supplier'; }

    extract(rawText) {
        const t = normD(rawText);
        const result = this._try(t, [
            { re: /(?:From|Vendor|Supplier|Bill\s*From|Issued\s*By)\s*[:：]\s*([^\n\r\t]{3,60})/i, confidence: 0.90, method: 'english-label', post: clean },
            { re: /(?:من|المورد|الشركة\s*المورِّدة)\s*[:：]\s*([^\n\r\t]{3,60})/i,                 confidence: 0.90, method: 'arabic-label',  post: clean },
            { re: /(?:اسم\s*الشركة|Company\s*Name)\s*[:：]\s*([^\n\r\t]{3,60})/i,                  confidence: 0.85, method: 'company-name',  post: clean },
        ]);
        return { supplier: result || this._miss() };
    }
}

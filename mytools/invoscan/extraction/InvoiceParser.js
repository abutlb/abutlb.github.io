// extraction/InvoiceParser.js — المنسّق الرئيسي: يشغّل الـ plugins ثم الـ AI اختيارياً

import { Lang }                from '../i18n/Lang.js';
import { ExtractionEngine }    from './engine/ExtractionEngine.js';
import { DatePlugin }          from './plugins/DatePlugin.js';
import { InvoiceNumberPlugin } from './plugins/InvoiceNumberPlugin.js';
import { SupplierPlugin }      from './plugins/SupplierPlugin.js';
import { CustomerPlugin }      from './plugins/CustomerPlugin.js';
import { VatPlugin }           from './plugins/VatPlugin.js';
import { MetaPlugin }          from './plugins/MetaPlugin.js';
import { TablePlugin }         from './plugins/TablePlugin.js';
import { AmountPlugin }        from './plugins/AmountPlugin.js';
import { AIRouter }            from '../ai/AIRouter.js';

// محرك واحد مشترك — يُبنى مرة واحدة
const engine = new ExtractionEngine()
    .use(new DatePlugin())
    .use(new InvoiceNumberPlugin())
    .use(new SupplierPlugin())
    .use(new CustomerPlugin())
    .use(new VatPlugin())
    .use(new MetaPlugin())
    .use(new TablePlugin())
    .use(new AmountPlugin());

export class InvoiceParser {
    static async parse(rawText, confidence = 0) {
        // 1. استخراج بالـ plugins (دائماً يعمل، بدون إنترنت)
        const { values, meta } = engine.extract(rawText);

        // 2. استخراج بالـ AI إذا كان هناك مزود مفعّل
        let aiUsed = false;

        if (AIRouter.isEnabled()) {
            try {
                const aiResult = await AIRouter.extract(rawText);
                // الـ AI يُكسب على الـ plugins في كل حقل غير فارغ
                for (const [k, v] of Object.entries(aiResult)) {
                    if (Array.isArray(v)) {
                        if (v.length > 0) values[k] = v;
                    } else if (v !== null && v !== undefined && String(v).trim()) {
                        values[k] = String(v).trim();
                    }
                }
                aiUsed = true;
            } catch (e) {
                console.warn('[InvoiceParser] AI extraction failed, using plugins:', e.message);
            }
        }

        return {
            invoiceNumber: values.invoiceNumber || '',
            date:          values.date          || '',
            dueDate:       values.dueDate        || '',
            supplier:      values.supplier       || '',
            customer:      values.customer       || '',
            vatNumber:     values.vatNumber      || '',
            poNumber:      values.poNumber       || '',
            currency:      values.currency       || '',
            paymentTerms:  values.paymentTerms   || '',
            notes:         values.notes          || '',
            items:         values.items          || [],
            subtotal:      values.subtotal       || '',
            tax:           values.tax            || '',
            discount:      values.discount       || '',
            total:         values.total          || '',
            // meta
            confidence,
            rawText,
            _meta:   meta,
            _aiUsed: aiUsed,
        };
    }

    static headerFields() {
        const t = k => Lang.t(k);
        return [
            { key: 'invoiceNumber', label: t('invoiceNumber'), icon: 'fa-hashtag',        wide: false },
            { key: 'date',          label: t('date'),           icon: 'fa-calendar',       wide: false },
            { key: 'dueDate',       label: t('dueDate'),        icon: 'fa-calendar-check', wide: false },
            { key: 'supplier',      label: t('supplier'),       icon: 'fa-building',       wide: true  },
            { key: 'customer',      label: t('customer'),       icon: 'fa-user',           wide: true  },
            { key: 'vatNumber',     label: t('vatNumber'),      icon: 'fa-receipt',        wide: false },
            { key: 'poNumber',      label: t('poNumber'),       icon: 'fa-file-alt',       wide: false },
            { key: 'currency',      label: t('currency'),       icon: 'fa-coins',          wide: false },
            { key: 'paymentTerms',  label: t('paymentTerms'),   icon: 'fa-handshake',      wide: true  },
            { key: 'notes',         label: t('notes'),          icon: 'fa-sticky-note',    wide: true  },
        ];
    }

    static totalFields() {
        const t = k => Lang.t(k);
        return [
            { key: 'subtotal', label: t('subtotal'), cls: '' },
            { key: 'discount', label: t('discount'), cls: '' },
            { key: 'tax',      label: t('tax'),      cls: '' },
            { key: 'total',    label: t('total'),    cls: 'grand' },
        ];
    }
}

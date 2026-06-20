// extraction/InvoiceParser.js — المنسّق الرئيسي: يشغّل الـ plugins ثم الـ AI اختيارياً

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
        return [
            { key: 'invoiceNumber', label: 'رقم الفاتورة',       icon: 'fa-hashtag',        wide: false },
            { key: 'date',          label: 'تاريخ الفاتورة',      icon: 'fa-calendar',       wide: false },
            { key: 'dueDate',       label: 'تاريخ الاستحقاق',    icon: 'fa-calendar-check', wide: false },
            { key: 'supplier',      label: 'المورد / الشركة',     icon: 'fa-building',       wide: true  },
            { key: 'customer',      label: 'العميل / المشتري',    icon: 'fa-user',           wide: true  },
            { key: 'vatNumber',     label: 'الرقم الضريبي',       icon: 'fa-receipt',        wide: false },
            { key: 'poNumber',      label: 'رقم أمر الشراء',      icon: 'fa-file-alt',       wide: false },
            { key: 'currency',      label: 'العملة',               icon: 'fa-coins',          wide: false },
            { key: 'paymentTerms',  label: 'شروط الدفع',          icon: 'fa-handshake',      wide: true  },
            { key: 'notes',         label: 'ملاحظات',              icon: 'fa-sticky-note',    wide: true  },
        ];
    }

    static totalFields() {
        return [
            { key: 'subtotal', label: 'المجموع الفرعي', cls: '' },
            { key: 'discount', label: 'الخصم',           cls: '' },
            { key: 'tax',      label: 'الضريبة (VAT)',   cls: '' },
            { key: 'total',    label: 'الإجمالي الكلي', cls: 'grand' },
        ];
    }
}

// extraction/InvoiceParser.js — المنسّق الرئيسي لاستخراج بيانات الفاتورة

import { FieldExtractor } from './FieldExtractor.js';
import { TableExtractor } from './TableExtractor.js';

export class InvoiceParser {
    // Parse raw OCR/PDF text into structured invoice data
    static parse(rawText, confidence = 0) {
        const fields = FieldExtractor.extract(rawText);
        const table  = TableExtractor.extract(rawText);

        return {
            // Header fields
            invoiceNumber: fields.invoiceNumber,
            date:          fields.date,
            dueDate:       fields.dueDate,
            supplier:      fields.supplier,
            customer:      fields.customer,
            vatNumber:     fields.vatNumber,
            poNumber:      fields.poNumber,
            currency:      fields.currency,
            paymentTerms:  fields.paymentTerms,
            notes:         fields.notes,

            // Line items
            items: table.items,

            // Totals
            subtotal: table.subtotal,
            tax:      table.tax,
            discount: table.discount,
            total:    table.total,

            // Meta
            rawText,
            confidence,
        };
    }

    // Structured field definitions for UI rendering
    static headerFields() {
        return [
            { key: 'invoiceNumber', label: 'رقم الفاتورة',       icon: 'fa-hashtag',         wide: false },
            { key: 'date',          label: 'تاريخ الفاتورة',      icon: 'fa-calendar',        wide: false },
            { key: 'dueDate',       label: 'تاريخ الاستحقاق',    icon: 'fa-calendar-check',  wide: false },
            { key: 'supplier',      label: 'المورد / الشركة',     icon: 'fa-building',        wide: true  },
            { key: 'customer',      label: 'العميل / المشتري',    icon: 'fa-user',            wide: true  },
            { key: 'vatNumber',     label: 'الرقم الضريبي',       icon: 'fa-receipt',         wide: false },
            { key: 'poNumber',      label: 'رقم أمر الشراء',      icon: 'fa-file-alt',        wide: false },
            { key: 'currency',      label: 'العملة',               icon: 'fa-coins',           wide: false },
            { key: 'paymentTerms',  label: 'شروط الدفع',          icon: 'fa-handshake',       wide: true  },
            { key: 'notes',         label: 'ملاحظات',              icon: 'fa-sticky-note',     wide: true  },
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

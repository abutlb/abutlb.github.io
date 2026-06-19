// export/CSVExporter.js — تصدير CSV

export class CSVExporter {
    static export(data) {
        const rows = [];
        const q = v => `"${String(v || '').replace(/"/g, '""')}"`;

        // Summary block
        rows.push(['بيانات الفاتورة'].map(q).join(','));
        rows.push([q('رقم الفاتورة'),     q(data.invoiceNumber)].join(','));
        rows.push([q('تاريخ الفاتورة'),   q(data.date)].join(','));
        rows.push([q('تاريخ الاستحقاق'),  q(data.dueDate)].join(','));
        rows.push([q('المورد'),            q(data.supplier)].join(','));
        rows.push([q('العميل'),            q(data.customer)].join(','));
        rows.push([q('الرقم الضريبي'),    q(data.vatNumber)].join(','));
        rows.push([q('رقم أمر الشراء'),   q(data.poNumber)].join(','));
        rows.push([q('العملة'),            q(data.currency)].join(','));
        rows.push([q('شروط الدفع'),       q(data.paymentTerms)].join(','));
        rows.push(['']);

        // Items block
        rows.push([q('#'), q('الوصف'), q('الكمية'), q('سعر الوحدة'), q('الإجمالي')].join(','));
        (data.items || []).forEach((item, i) => {
            rows.push([i + 1, q(item.description), q(item.qty), q(item.unitPrice), q(item.total)].join(','));
        });
        rows.push(['']);

        // Totals
        rows.push([q('المجموع الفرعي'), q(data.subtotal)].join(','));
        rows.push([q('الخصم'),          q(data.discount)].join(','));
        rows.push([q('الضريبة'),        q(data.tax)].join(','));
        rows.push([q('الإجمالي الكلي'), q(data.total)].join(','));

        const csv  = '﻿' + rows.join('\r\n'); // BOM for Arabic Excel compatibility
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const name = (data.invoiceNumber || data.filename || 'فاتورة').replace(/[\/\\:*?"<>|]/g, '_');
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = `InvoScan_${name}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        return true;
    }
}

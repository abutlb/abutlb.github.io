// export/CSVExporter.js
const bi = (ar, en) => `${ar} | ${en}`;

export class CSVExporter {

  // Single invoice → vertical layout
  static export(data) {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [];

    rows.push([q(bi('الحقل','Field')), q(bi('القيمة','Value'))].join(','));
    [
      [bi('رقم الفاتورة','Invoice No.'),    data.invoiceNumber],
      [bi('تاريخ الفاتورة','Date'),          data.date],
      [bi('تاريخ الاستحقاق','Due Date'),     data.dueDate],
      [bi('المورد','Supplier'),              data.supplier],
      [bi('العميل','Customer'),              data.customer],
      [bi('الرقم الضريبي','VAT No.'),        data.vatNumber],
      [bi('رقم أمر الشراء','PO No.'),        data.poNumber],
      [bi('العملة','Currency'),              data.currency],
      [bi('شروط الدفع','Payment Terms'),     data.paymentTerms],
      [bi('المجموع الفرعي','Subtotal'),       data.subtotal],
      [bi('الخصم','Discount'),               data.discount],
      [bi('الضريبة','Tax / VAT'),            data.tax],
      [bi('الإجمالي الكلي','Grand Total'),   data.total],
    ].forEach(([label, val]) => rows.push([q(label), q(val)].join(',')));

    const items     = data.items || [];
    const hasDisc   = items.some(it => it.discount  && it.discount  !== '');
    const hasVatPct = items.some(it => it.vatPct    && it.vatPct    !== '');
    const hasVatAmt = items.some(it => it.vatAmount && it.vatAmount !== '');

    rows.push(['']);
    const hdrRow = [q('#'), q(bi('الوصف','Description')), q(bi('الكمية','Qty')),
                    q(bi('سعر الوحدة','Unit Price')),
                    ...(hasDisc   ? [q(bi('الخصم','Discount'))]            : []),
                    ...(hasVatPct ? [q(bi('ضريبة %','VAT %'))]             : []),
                    ...(hasVatAmt ? [q(bi('قيمة الضريبة','VAT Amount'))]   : []),
                    q(bi('الإجمالي','Total'))];
    rows.push(hdrRow.join(','));
    items.forEach((item, i) => {
      const row = [i + 1, q(item.description), q(item.qty), q(item.unitPrice),
                   ...(hasDisc   ? [q(item.discount  || '')] : []),
                   ...(hasVatPct ? [q(item.vatPct    || '')] : []),
                   ...(hasVatAmt ? [q(item.vatAmount || '')] : []),
                   q(item.total)];
      rows.push(row.join(','));
    });

    CSVExporter._dl(rows, data.invoiceNumber || data.filename || 'Invoice');
    return true;
  }

  // Batch → flat CSV, one row per invoice
  static exportBatch(results) {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = [
      '#',
      bi('رقم الفاتورة','Invoice No.'),
      bi('تاريخ الفاتورة','Date'),
      bi('تاريخ الاستحقاق','Due Date'),
      bi('المورد','Supplier'),
      bi('العميل','Customer'),
      bi('الرقم الضريبي','VAT No.'),
      bi('رقم أمر الشراء','PO No.'),
      bi('العملة','Currency'),
      bi('شروط الدفع','Payment Terms'),
      bi('المجموع الفرعي','Subtotal'),
      bi('الخصم','Discount'),
      bi('الضريبة','Tax / VAT'),
      bi('الإجمالي الكلي','Grand Total'),
      bi('اسم الملف','File Name'),
    ];
    const rows = [headers.map(q).join(',')];
    results.forEach((d, i) => rows.push([
      i + 1,
      q(d.invoiceNumber), q(d.date), q(d.dueDate),
      q(d.supplier), q(d.customer), q(d.vatNumber), q(d.poNumber),
      q(d.currency), q(d.paymentTerms), q(d.subtotal), q(d.discount),
      q(d.tax), q(d.total), q(d.filename),
    ].join(',')));

    const date = new Date().toISOString().slice(0, 10);
    CSVExporter._dl(rows, `batch_${date}`);
    return true;
  }

  static _dl(rows, name) {
    const csv  = '﻿' + rows.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const safe = String(name).replace(/[\/\\:*?"<>|]/g, '_');
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `InvoScan_${safe}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
}

// export/ExcelExporter.js

// ── Shared style helpers ──────────────────────────────────────────────────
const CLR = {
  primary:  'FF2563EB',
  success:  'FF059669',
  white:    'FFFFFFFF',
  altRow:   'FFF8FAFC',
  altRow2:  'FFEFF6FF',
  border:   'FFE2E8F0',
  totalBg:  'FFDBEAFE',
};
const fill  = hex => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: hex } });
const bdr   = () => ({ style: 'thin', color: { argb: CLR.border } });
const allBdr = () => ({ top: bdr(), left: bdr(), bottom: bdr(), right: bdr() });
const hdrStyle = (ws, row, colorHex = CLR.primary) => {
  row.height = 28;
  row.eachCell(cell => {
    cell.font      = { bold: true, size: 11, color: { argb: CLR.white } };
    cell.fill      = fill(colorHex);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border    = allBdr();
  });
};

// Bilingual column header helper: "عربي | English"
const bi = (ar, en) => `${ar} | ${en}`;

// ── Single-invoice export (2 sheets: header fields + line items) ──────────
export class ExcelExporter {
  static async export(data) {
    if (!window.ExcelJS) throw new Error('ExcelJS لم يُحمَّل');
    const wb = new window.ExcelJS.Workbook();
    wb.creator = 'InvoScan'; wb.created = wb.modified = new Date();

    const summaryWs = wb.addWorksheet(bi('بيانات الفاتورة','Invoice Data'),
                                      { views: [{ rightToLeft: true }] });
    ExcelExporter._buildSummarySheet(summaryWs, data);

    const itemsWs = wb.addWorksheet(bi('البنود','Line Items'),
                                    { views: [{ rightToLeft: true }] });
    ExcelExporter._buildItemsSheet(itemsWs, data);

    const buffer = await wb.xlsx.writeBuffer();
    const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const name   = (data.invoiceNumber || data.filename || 'Invoice').replace(/[\/\\:*?"<>|]/g, '_');
    ExcelExporter._dl(blob, `InvoScan_${name}.xlsx`);
    return true;
  }

  static _buildSummarySheet(ws, data) {
    // Title
    ws.mergeCells('A1:B1');
    Object.assign(ws.getCell('A1'), {
      value: 'InvoScan — بيانات الفاتورة | Invoice Data',
      font:  { bold: true, size: 13, color: { argb: CLR.white } },
      fill:  fill(CLR.primary),
      alignment: { horizontal: 'center', vertical: 'middle' },
    });
    ws.getRow(1).height = 32;

    const rows = [
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
      [bi('ملاحظات','Notes'),                data.notes],
    ];

    rows.forEach(([label, value], i) => {
      const r = ws.getRow(i + 2);
      r.height = 22;
      const cA = r.getCell(1), cB = r.getCell(2);
      cA.value = label;  cB.value = value ?? '—';
      cA.font  = { bold: true, size: 11 };
      cB.font  = { size: 11 };
      const rowFill = fill(i % 2 === 0 ? CLR.white : CLR.altRow);
      cA.fill  = fill(CLR.altRow2); cB.fill = rowFill;
      [cA, cB].forEach(c => {
        c.alignment = { vertical: 'middle', readingOrder: 'rightToLeft', wrapText: true };
        c.border    = allBdr();
      });
    });

    ws.getColumn(1).width = 32;
    ws.getColumn(2).width = 44;
  }

  static _buildItemsSheet(ws, data) {
    const items     = data.items || [];
    const hasDisc   = items.some(it => it.discount  && it.discount  !== '');
    const hasVatPct = items.some(it => it.vatPct    && it.vatPct    !== '');
    const hasVatAmt = items.some(it => it.vatAmount && it.vatAmount !== '');

    const headers = [
      '#',
      bi('الوصف','Description'),
      bi('الكمية','Qty'),
      bi('سعر الوحدة','Unit Price'),
      ...(hasDisc   ? [bi('الخصم','Discount')]           : []),
      ...(hasVatPct ? [bi('ضريبة %','VAT %')]            : []),
      ...(hasVatAmt ? [bi('قيمة الضريبة','VAT Amount')]  : []),
      bi('الإجمالي','Total'),
    ];
    hdrStyle(ws, ws.addRow(headers));

    items.forEach((item, i) => {
      const row = [
        i + 1,
        item.description || '',
        item.qty         || '',
        item.unitPrice   || '',
        ...(hasDisc   ? [item.discount  || ''] : []),
        ...(hasVatPct ? [item.vatPct    || ''] : []),
        ...(hasVatAmt ? [item.vatAmount || ''] : []),
        item.total || '',
      ];
      const r = ws.addRow(row);
      r.height = 22;
      r.eachCell(cell => {
        cell.font      = { size: 11 };
        cell.fill      = fill(i % 2 === 0 ? CLR.white : CLR.altRow);
        cell.alignment = { vertical: 'middle', readingOrder: 'rightToLeft', wrapText: true };
        cell.border    = allBdr();
      });
    });

    // Totals footer
    if (items.length) {
      const lastCol = headers.length;
      ws.addRow([]);
      [
        [bi('المجموع الفرعي','Subtotal'), data.subtotal],
        [bi('الخصم','Discount'),          data.discount],
        [bi('الضريبة','Tax / VAT'),       data.tax],
        [bi('الإجمالي الكلي','Grand Total'), data.total],
      ].forEach(([label, val], i) => {
        if (!val && i !== 3) return;
        const isGrand = i === 3;
        const rowData = Array(lastCol).fill('');
        rowData[lastCol - 2] = label;
        rowData[lastCol - 1] = val ?? '';
        const r  = ws.addRow(rowData);
        const lc = r.getCell(lastCol - 1), vc = r.getCell(lastCol);
        lc.font = vc.font = { bold: isGrand, size: isGrand ? 12 : 11,
                              color: isGrand ? { argb: CLR.primary } : undefined };
        if (isGrand) lc.fill = vc.fill = fill(CLR.totalBg);
        [lc, vc].forEach(c => {
          c.alignment = { readingOrder: 'rightToLeft', vertical: 'middle' };
          c.border    = allBdr();
        });
        r.height = isGrand ? 26 : 22;
      });
    }

    // Dynamic column widths
    const widths = [5, 44, 10, 16,
      ...(hasDisc   ? [14] : []),
      ...(hasVatPct ? [10] : []),
      ...(hasVatAmt ? [16] : []),
      16];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  }

  // ── Batch export: FLAT TABLE (no sheet-per-invoice) ───────────────────
  static async exportBatch(results) {
    if (!window.ExcelJS) throw new Error('ExcelJS لم يُحمَّل');
    const wb = new window.ExcelJS.Workbook();
    wb.creator = 'InvoScan'; wb.created = wb.modified = new Date();

    // Sheet 1 — one row per invoice
    const invoicesWs = wb.addWorksheet(bi('الفواتير','Invoices'),
                                       { views: [{ rightToLeft: true }] });
    ExcelExporter._buildFlatInvoices(invoicesWs, results);

    // Sheet 2 — all line items across all invoices
    const itemsWs = wb.addWorksheet(bi('البنود','Line Items'),
                                    { views: [{ rightToLeft: true }] });
    ExcelExporter._buildFlatItems(itemsWs, results);

    const buffer = await wb.xlsx.writeBuffer();
    const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const date   = new Date().toISOString().slice(0, 10);
    ExcelExporter._dl(blob, `InvoScan_batch_${date}.xlsx`);
    return true;
  }

  static _buildFlatInvoices(ws, results) {
    // Title row
    const colCount = 15;
    ws.mergeCells(1, 1, 1, colCount);
    Object.assign(ws.getCell('A1'), {
      value: `InvoScan — ${bi('ملخص الفواتير','Invoices Summary')}  (${results.length} ${bi('فاتورة','invoices')})`,
      font:  { bold: true, size: 13, color: { argb: CLR.white } },
      fill:  fill(CLR.primary),
      alignment: { horizontal: 'center', vertical: 'middle' },
    });
    ws.getRow(1).height = 30;

    // Header row
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
    hdrStyle(ws, ws.addRow(headers));

    // Enable auto-filter on header row
    ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: headers.length } };

    // Data rows
    results.forEach((d, i) => {
      const r = ws.addRow([
        i + 1,
        d.invoiceNumber  || '',
        d.date           || '',
        d.dueDate        || '',
        d.supplier       || '',
        d.customer       || '',
        d.vatNumber      || '',
        d.poNumber       || '',
        d.currency       || '',
        d.paymentTerms   || '',
        d.subtotal       || '',
        d.discount       || '',
        d.tax            || '',
        d.total          || '',
        d.filename       || '',
      ]);
      r.height = 22;
      r.eachCell(cell => {
        cell.font      = { size: 11 };
        cell.fill      = fill(i % 2 === 0 ? CLR.white : CLR.altRow);
        cell.alignment = { vertical: 'middle', readingOrder: 'rightToLeft', wrapText: false };
        cell.border    = allBdr();
      });
    });

    // Freeze header rows
    ws.views = [{ state: 'frozen', ySplit: 2, rightToLeft: true }];

    // Column widths
    [5, 20, 14, 14, 30, 30, 18, 16, 10, 18, 14, 12, 12, 16, 28]
      .forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  }

  static _buildFlatItems(ws, results) {
    // Title row
    const colCount = 7;
    ws.mergeCells(1, 1, 1, colCount);
    Object.assign(ws.getCell('A1'), {
      value: `InvoScan — ${bi('بنود الفواتير','Line Items')}`,
      font:  { bold: true, size: 13, color: { argb: CLR.white } },
      fill:  fill(CLR.success),
      alignment: { horizontal: 'center', vertical: 'middle' },
    });
    ws.getRow(1).height = 30;

    const headers = [
      '#',
      bi('رقم الفاتورة','Invoice No.'),
      bi('المورد','Supplier'),
      bi('تاريخ الفاتورة','Date'),
      bi('الوصف','Description'),
      bi('الكمية','Qty'),
      bi('سعر الوحدة','Unit Price'),
      bi('الإجمالي','Total'),
    ];
    hdrStyle(ws, ws.addRow(headers), CLR.success);
    ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: headers.length } };

    let rowNum = 0;
    results.forEach(d => {
      const items = d.items || [];
      if (!items.length) {
        // Invoice with no items → still one row so it's not lost
        rowNum++;
        const r = ws.addRow([rowNum, d.invoiceNumber || '', d.supplier || '', d.date || '', bi('لا توجد بنود','No items'), '', '', d.total || '']);
        _applyDataRow(r, rowNum, true);
        return;
      }
      items.forEach(item => {
        rowNum++;
        const r = ws.addRow([
          rowNum,
          d.invoiceNumber  || '',
          d.supplier       || '',
          d.date           || '',
          item.description || '',
          item.qty         || '',
          item.unitPrice   || '',
          item.total       || '',
        ]);
        _applyDataRow(r, rowNum, false);
      });
    });

    ws.views = [{ state: 'frozen', ySplit: 2, rightToLeft: true }];
    [5, 20, 26, 14, 50, 8, 14, 14]
      .forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    function _applyDataRow(r, idx, muted) {
      r.height = 22;
      r.eachCell(cell => {
        cell.font      = { size: 11, italic: muted, color: muted ? { argb: 'FF94A3B8' } : undefined };
        cell.fill      = fill((idx - 1) % 2 === 0 ? CLR.white : CLR.altRow);
        cell.alignment = { vertical: 'middle', readingOrder: 'rightToLeft', wrapText: false };
        cell.border    = allBdr();
      });
    }
  }

  static _dl(blob, filename) {
    const a = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
}

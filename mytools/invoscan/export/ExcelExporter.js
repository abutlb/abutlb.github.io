// export/ExcelExporter.js — تصدير Excel منسق باستخدام ExcelJS

export class ExcelExporter {
    static async export(data) {
        if (!window.ExcelJS) throw new Error('ExcelJS لم يُحمَّل');
        const wb = new window.ExcelJS.Workbook();
        wb.creator  = 'InvoScan';
        wb.created  = new Date();
        wb.modified = new Date();

        // Sheet 1: Invoice Summary
        const summary = wb.addWorksheet('بيانات الفاتورة', { views: [{ rightToLeft: true }] });
        ExcelExporter._buildSummarySheet(summary, data);

        // Sheet 2: Line Items
        const items = wb.addWorksheet('بنود الفاتورة', { views: [{ rightToLeft: true }] });
        ExcelExporter._buildItemsSheet(items, data);

        // Generate and download
        const buffer = await wb.xlsx.writeBuffer();
        const blob   = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const name = (data.invoiceNumber || data.filename || 'فاتورة').replace(/[\/\\:*?"<>|]/g, '_');
        ExcelExporter._download(blob, `InvoScan_${name}.xlsx`);
        return true;
    }

    static _buildSummarySheet(ws, data) {
        const accent  = { argb: 'FF2563EB' };
        const white   = { argb: 'FFFFFFFF' };
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: accent };
        const altFill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        const border     = { style: 'thin', color: { argb: 'FFE2E8F0' } };
        const allBorders = { top: border, left: border, bottom: border, right: border };

        // Title row
        ws.mergeCells('A1:B1');
        const title = ws.getCell('A1');
        title.value = 'بيانات الفاتورة — InvoScan';
        title.font  = { bold: true, size: 14, color: white };
        title.fill  = headerFill;
        title.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' };
        ws.getRow(1).height = 32;

        const fields = [
            ['رقم الفاتورة',      data.invoiceNumber],
            ['تاريخ الفاتورة',    data.date],
            ['تاريخ الاستحقاق',  data.dueDate],
            ['المورد / الشركة',   data.supplier],
            ['العميل',            data.customer],
            ['الرقم الضريبي',     data.vatNumber],
            ['رقم أمر الشراء',    data.poNumber],
            ['العملة',            data.currency],
            ['شروط الدفع',        data.paymentTerms],
            ['المجموع الفرعي',    data.subtotal],
            ['الخصم',             data.discount],
            ['الضريبة (VAT)',      data.tax],
            ['الإجمالي الكلي',    data.total],
            ['ملاحظات',           data.notes],
        ];

        fields.forEach(([label, value], i) => {
            const row    = ws.getRow(i + 2);
            const cellA  = row.getCell(1);
            const cellB  = row.getCell(2);
            cellA.value  = label;
            cellB.value  = value || '—';
            cellA.font   = { bold: true, size: 11 };
            cellB.font   = { size: 11 };
            cellA.fill   = altFill;
            if (i % 2 === 0) cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
            else             cellB.fill = altFill;
            cellA.alignment = { readingOrder: 'rightToLeft', vertical: 'middle' };
            cellB.alignment = { readingOrder: 'rightToLeft', vertical: 'middle' };
            cellA.border  = allBorders;
            cellB.border  = allBorders;
            row.height    = 22;
        });

        ws.getColumn(1).width = 26;
        ws.getColumn(2).width = 40;
    }

    static _buildItemsSheet(ws, data) {
        const accent   = { argb: 'FF2563EB' };
        const white    = { argb: 'FFFFFFFF' };
        const altFill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        const border   = { style: 'thin', color: { argb: 'FFE2E8F0' } };
        const borders  = { top: border, left: border, bottom: border, right: border };
        const hdrFill  = { type: 'pattern', pattern: 'solid', fgColor: accent };

        // Header row
        const headers = ['#', 'الوصف / البند', 'الكمية', 'سعر الوحدة', 'الإجمالي'];
        const hdrRow  = ws.addRow(headers);
        hdrRow.height = 28;
        hdrRow.eachCell(cell => {
            cell.font      = { bold: true, color: white, size: 11 };
            cell.fill      = hdrFill;
            cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' };
            cell.border    = borders;
        });

        // Data rows
        (data.items || []).forEach((item, i) => {
            const row = ws.addRow([
                i + 1,
                item.description || '',
                item.qty         || '',
                item.unitPrice   || '',
                item.total       || '',
            ]);
            row.height = 22;
            row.eachCell(cell => {
                cell.font      = { size: 11 };
                cell.fill      = i % 2 === 0 ? { type: 'pattern', pattern: 'solid', fgColor: white.argb ? { argb: 'FFFFFFFF' } : white } : altFill;
                cell.alignment = { readingOrder: 'rightToLeft', vertical: 'middle' };
                cell.border    = borders;
            });
        });

        // Totals section
        if (data.items?.length) {
            ws.addRow([]);
            const totals = [
                ['', '', '', 'المجموع الفرعي',  data.subtotal],
                ['', '', '', 'الخصم',            data.discount],
                ['', '', '', 'الضريبة (VAT)',     data.tax],
                ['', '', '', 'الإجمالي الكلي',   data.total],
            ];
            totals.forEach(([,,,label, val], i) => {
                if (!val && label !== 'الإجمالي الكلي') return;
                const row = ws.addRow(['', '', '', label, val || '']);
                const lc  = row.getCell(4);
                const vc  = row.getCell(5);
                const isGrand = i === 3;
                lc.font = vc.font = { bold: isGrand, size: isGrand ? 12 : 11, color: isGrand ? accent : undefined };
                lc.alignment = vc.alignment = { readingOrder: 'rightToLeft' };
                if (isGrand) {
                    lc.fill = vc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
                }
                row.height = isGrand ? 26 : 22;
            });
        }

        ws.getColumn(1).width = 5;
        ws.getColumn(2).width = 42;
        ws.getColumn(3).width = 10;
        ws.getColumn(4).width = 16;
        ws.getColumn(5).width = 16;
    }

    static _download(blob, filename) {
        const a   = document.createElement('a');
        a.href    = URL.createObjectURL(blob);
        a.download= filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
}

// parsers/ExcelParser.js
// يعتمد على مكتبة SheetJS (XLSX) المحملة مسبقاً
export class ExcelParser {

    static parse(arrayBuffer) {
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, {
            type: "array",
            cellDates: true,   // تحويل تواريخ Excel تلقائياً
            cellNF: true,      // الحفاظ على تنسيق الأرقام
        });

        const sheets = {};
        const warnings = [];

        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                defval: "",    // القيم الفارغة = نص فارغ
                raw: false     // تحويل كل القيم لنصوص
            });

            if (jsonData.length === 0) {
                warnings.push(`الورقة "${sheetName}" فارغة`);
                return;
            }

            const headers = jsonData[0].map(h =>
                h !== null && h !== undefined ? String(h).trim() : `عمود_${Math.random()}`
            );

            const rows = [];
            for (let i = 1; i < jsonData.length; i++) {
                const rowArr = jsonData[i];
                // تخطي الصفوف الفارغة كلياً
                if (rowArr.every(v => v === "" || v === null || v === undefined))
                    continue;

                const row = {};
                headers.forEach((header, idx) => {
                    row[header] = rowArr[idx] !== undefined
                        ? String(rowArr[idx]).trim()
                        : "";
                });
                rows.push(row);
            }

            sheets[sheetName] = {
                data: rows,
                columns: headers,
                rowCount: rows.length,
                columnCount: headers.length
            };
        });

        // نرجع الورقة الأولى افتراضياً مع معلومات باقي الأوراق
        const firstSheet = sheets[workbook.SheetNames[0]];

        return {
            ...firstSheet,
            allSheets: sheets,
            sheetNames: workbook.SheetNames,
            activeSheet: workbook.SheetNames[0],
            warnings
        };
    }

    // تغيير الورقة النشطة
    static switchSheet(parseResult, sheetName) {
        if (!parseResult.allSheets[sheetName]) {
            throw new Error(`الورقة "${sheetName}" غير موجودة`);
        }
        return {
            ...parseResult,
            ...parseResult.allSheets[sheetName],
            activeSheet: sheetName
        };
    }
}

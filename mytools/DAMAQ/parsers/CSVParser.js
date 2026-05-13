// parsers/CSVParser.js
export class CSVParser {

    static parse(fileContent) {
        // كشف الـ delimiter تلقائياً (فاصلة أو فاصلة منقوطة أو tab)
        const delimiter = this.detectDelimiter(fileContent);

        // كشف الـ encoding مشاكل
        const encoding = this.detectEncoding(fileContent);

        const lines = fileContent.split(/\r?\n/);
        const headers = this.parseLine(lines[0], delimiter);

        const data = [];
        const warnings = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = this.parseLine(line, delimiter);

            // تحذير إذا عدد القيم لا يتطابق مع الـ headers
            if (values.length !== headers.length) {
                warnings.push(
                    `الصف ${i + 1}: عدد القيم (${values.length}) ` +
                    `لا يتطابق مع عدد الأعمدة (${headers.length})`
                );
            }

            const row = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx] !== undefined
                    ? this.cleanValue(values[idx])
                    : "";
            });
            data.push(row);
        }

        return {
            data,
            columns: headers,
            delimiter,
            encoding,
            rowCount: data.length,
            columnCount: headers.length,
            warnings
        };
    }

    // كشف الـ delimiter الأكثر تكراراً في السطر الأول
    static detectDelimiter(content) {
        const firstLine = content.split(/\r?\n/)[0];
        const candidates = [",", ";", "\t", "|"];
        let best = ",";
        let maxCount = 0;

        candidates.forEach(d => {
            const count = firstLine.split(d).length - 1;
            if (count > maxCount) {
                maxCount = count;
                best = d;
            }
        });

        return best;
    }

    // كشف مشاكل الـ encoding
    static detectEncoding(content) {
        const hasArabic = /[\u0600-\u06FF]/.test(content);
        const hasLatin  = /[a-zA-Z]/.test(content);
        const hasMojibake = /[Ã¢â‚¬â€œ]/.test(content); // علامة encoding خاطئ

        return {
            hasArabic,
            hasLatin,
            hasMojibake,
            recommended: hasMojibake ? "UTF-8 (مشكلة encoding محتملة)" : "UTF-8"
        };
    }

    // تحليل سطر CSV مع دعم القيم بين علامات اقتباس
    static parseLine(line, delimiter) {
        const result = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const next = line[i + 1];

            if (char === '"' && inQuotes && next === '"') {
                // علامة اقتباس مضاعفة داخل قيمة → اقتباس واحد
                current += '"';
                i++;
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                result.push(current);
                current = "";
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }

    // تنظيف القيمة من المسافات الزائدة والاقتباسات
    static cleanValue(value) {
        if (typeof value !== "string") return value;
        return value.trim().replace(/^"|"$/g, "");
    }
}

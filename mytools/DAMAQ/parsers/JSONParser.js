// parsers/JSONParser.js
export class JSONParser {

    static parse(fileContent) {
        let raw;
        try {
            raw = JSON.parse(fileContent);
        } catch (e) {
            throw new Error("ملف JSON غير صالح: " + e.message);
        }

        const validation = this.validate(raw);
        if (validation.errors.length > 0) {
            throw new Error(validation.errors.join("\n"));
        }

        const shape = this.detectShape(raw);
        const array = this.extractArray(raw, shape);
        const flatData = array.map(row => this.flattenObject(row));
        const columns = this.extractColumns(flatData);

        return {
            data: flatData,
            columns,
            originalShape: shape.type,
            rowCount: flatData.length,
            columnCount: columns.length,
            warnings: validation.warnings
        };
    }

    static validate(raw) {
        const errors = [];
        const warnings = [];

        if (raw === null || raw === undefined)
            errors.push("الملف فارغ تماماً");

        if (typeof raw !== "object")
            errors.push("JSON يجب أن يكون كائناً أو مصفوفة");

        if (Array.isArray(raw) && raw.length === 0)
            errors.push("المصفوفة فارغة، لا توجد بيانات");

        if (Array.isArray(raw) && raw.length > 100000)
            warnings.push("الملف كبير — سيتم المعالجة على دفعات");

        if (Array.isArray(raw) && raw.length > 0) {
            const sample = raw.slice(0, 10);
            const firstKeys = Object.keys(sample[0] || {});
            sample.forEach((row, i) => {
                const rowKeys = Object.keys(row);
                if (rowKeys.length !== firstKeys.length) {
                    warnings.push(
                        `الصف ${i + 1} يحتوي أعمدة مختلفة عن باقي البيانات`
                    );
                }
            });
        }

        return { errors, warnings };
    }

    static detectShape(raw) {
        if (Array.isArray(raw)) {
            if (raw.length === 0)
                return { type: "empty_array" };
            if (typeof raw[0] === "object" && !Array.isArray(raw[0]))
                return { type: "array_of_objects" };
            if (Array.isArray(raw[0]))
                return { type: "array_of_arrays" };
        }

        if (typeof raw === "object" && !Array.isArray(raw)) {
            for (const key of Object.keys(raw)) {
                if (Array.isArray(raw[key])) {
                    return { type: "object_with_array", arrayKey: key };
                }
            }
            return { type: "single_object" };
        }

        return { type: "unknown" };
    }

    static extractArray(raw, shape) {
        switch (shape.type) {
            case "array_of_objects":
                return raw;
            case "object_with_array":
                return raw[shape.arrayKey];
            case "single_object":
                return [raw];
            case "array_of_arrays": {
                const headers = raw[0];
                return raw.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
                    return obj;
                });
            }
            default:
                throw new Error("شكل JSON غير مدعوم");
        }
    }

    static flattenObject(obj, prefix = "", depth = 0) {
        if (depth > 3) return { [prefix]: JSON.stringify(obj) };
        const result = {};

        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (value === null || value === undefined) {
                result[newKey] = "";
            } else if (Array.isArray(value)) {
                result[newKey] = value.join(", ");
            } else if (typeof value === "object") {
                Object.assign(result, this.flattenObject(value, newKey, depth + 1));
            } else {
                result[newKey] = value;
            }
        }
        return result;
    }

    static extractColumns(flatData) {
        const columnSet = new Set();
        flatData.forEach(row => Object.keys(row).forEach(k => columnSet.add(k)));
        return Array.from(columnSet);
    }
}

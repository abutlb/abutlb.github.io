// core/DataStore.js
export class DataStore {

    constructor() {
        this.reset();
    }

    reset() {
        this.originalData    = null;   // البيانات الأصلية — لا تُعدَّل أبداً
        this.workingData     = null;   // نسخة العمل الحالية
        this.cleanedData     = null;   // البيانات بعد التنظيف
        this.columns         = [];
        this.metadata        = {};     // معلومات الملف
        this.profileResults  = null;   // نتائج الـ Profiler
        this.damaResults     = null;   // نتائج DAMA
        this.ruleResults     = [];     // نتائج القواعد
        this.auditLog        = [];     // سجل كل التعديلات
        this.cache           = new Map();
    }

    // تحميل البيانات الجديدة
    load(parseResult, fileInfo) {
        this.reset();
        this.originalData = Object.freeze(           // تجميد — لا تعديل
            JSON.parse(JSON.stringify(parseResult.data))
        );
        this.workingData  = JSON.parse(JSON.stringify(parseResult.data));
        this.columns      = [...parseResult.columns];
        this.metadata     = {
            fileName        : fileInfo.name,
            fileSize        : fileInfo.size,
            fileType        : fileInfo.type,
            fileLastModified: fileInfo.lastModified
                ? new Date(fileInfo.lastModified).toISOString()
                : null,
            uploadedAt      : new Date().toISOString(),
            rowCount        : parseResult.rowCount,
            columnCount     : parseResult.columnCount,
            warnings        : parseResult.warnings || [],
            ...parseResult.metadata
        };
    }

    // إضافة إجراء للـ Audit Log
    addAuditEntry(action) {
        this.auditLog.push({
            id        : this.auditLog.length + 1,
            timestamp : new Date().toISOString(),
            ...action
            // مثال: { type: "fill_missing", column: "العمر", method: "median", affected: 12 }
        });
    }

    // الحصول على إحصاءات سريعة لعمود معين
    getColumnStats(columnName) {
        const cacheKey = `stats_${columnName}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        const values = this.workingData.map(row => row[columnName]);
        const nonEmpty = values.filter(v => v !== "" && v !== null && v !== undefined);

        const stats = {
            total    : values.length,
            nonEmpty : nonEmpty.length,
            empty    : values.length - nonEmpty.length,
            unique   : new Set(nonEmpty).size,
            emptyPct : ((values.length - nonEmpty.length) / values.length * 100).toFixed(1)
        };

        this.cache.set(cacheKey, stats);
        return stats;
    }

    // مسح الـ cache عند تعديل البيانات
    invalidateCache() {
        this.cache.clear();
    }

    // snapshot للمقارنة قبل/بعد
    snapshot() {
        return JSON.parse(JSON.stringify(this.workingData));
    }
}

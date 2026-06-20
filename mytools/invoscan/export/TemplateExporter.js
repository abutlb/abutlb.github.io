// export/TemplateExporter.js — حفظ / تحميل / استيراد / تصدير القوالب

const LS_KEY = 'invoscan-templates';

export class TemplateExporter {
    static list() {
        try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
        catch { return []; }
    }

    static save(template) {
        if (!template.id) template.id = (crypto.randomUUID?.() || Date.now().toString(36));
        const templates = TemplateExporter.list();
        const idx = templates.findIndex(t => t.id === template.id);
        if (idx >= 0) templates[idx] = template;
        else templates.push(template);
        localStorage.setItem(LS_KEY, JSON.stringify(templates));
        return template;
    }

    static delete(id) {
        const kept = TemplateExporter.list().filter(t => t.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(kept));
    }

    static exportJSON(template) {
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const a = Object.assign(document.createElement('a'), {
            href:     URL.createObjectURL(blob),
            download: `invoscan-${(template.name || 'template').replace(/[^a-z0-9أ-ي]/gi, '_')}.json`,
        });
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    static async importJSON(file) {
        const text = await file.text();
        const tmpl = JSON.parse(text);
        if (!Array.isArray(tmpl.regions)) throw new Error('ملف القالب غير صحيح');
        tmpl.id = tmpl.id || (crypto.randomUUID?.() || Date.now().toString(36));
        return TemplateExporter.save(tmpl);
    }
}

// core/TemplateMatcher.js — يبحث في القوالب المحفوظة عن تطابق مع النص

import { TemplateExporter } from '../export/TemplateExporter.js';

export class TemplateMatcher {
    // يُرجع أول قالب تطابق anchor مع النص الخام
    static findMatch(rawText) {
        const templates = TemplateExporter.list();
        for (const t of templates) {
            if (t.anchor && rawText.includes(t.anchor)) return t;
        }
        return null;
    }

    static hasTemplates() {
        return TemplateExporter.list().length > 0;
    }
}

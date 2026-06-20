// extraction/engine/BasePlugin.js — الفئة الأساسية لجميع الـ plugins

export class BasePlugin {
    get name() { return 'base'; }

    // كل plugin يُطبّق هذه الدالة ويُرجع:
    // { fieldName: { value, confidence (0-1), method } }
    extract(rawText) { return {}; }

    // مساعد: يجرّب patterns مرتّبة ويُرجع أول تطابق مع confidence
    // كل trial: { re, confidence, method, post? }
    _try(text, trials) {
        for (const { re, confidence, method, post } of trials) {
            const m = text.match(re);
            if (m?.[1]?.trim()) {
                let value = m[1].trim();
                if (post) value = post(value);
                return { value: value || '', confidence, method };
            }
        }
        return null;
    }

    _hit(value, confidence, method) {
        return { value: (value || '').trim(), confidence, method };
    }

    _miss() {
        return { value: '', confidence: 0, method: 'none' };
    }
}

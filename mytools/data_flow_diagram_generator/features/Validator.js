// features/Validator.js — قواعد التحقق من صحة مخطط DFD

export class Validator {
    static validate(store) {
        const issues = [];
        const err  = (msg, nodeId) => issues.push({ type: 'error',   msg, nodeId });
        const warn = (msg, nodeId) => issues.push({ type: 'warning', msg, nodeId });

        if (!store.nodes.length) {
            warn('المخطط فارغ — لا توجد عناصر بعد');
            return issues;
        }

        // Count in/out edges per node
        const inCount  = new Map();
        const outCount = new Map();
        store.nodes.forEach(n => { inCount.set(n.id, 0); outCount.set(n.id, 0); });
        store.edges.forEach(e => {
            inCount.set(e.to,   (inCount.get(e.to)   || 0) + 1);
            outCount.set(e.from,(outCount.get(e.from) || 0) + 1);
        });

        store.nodes.forEach(n => {
            const inn  = inCount.get(n.id)  || 0;
            const out  = outCount.get(n.id) || 0;

            if (n.type === 'process') {
                if (!inn)  err(`العملية "${n.label}" (${n.number}) لا يوجد لها مدخل`, n.id);
                if (!out)  err(`العملية "${n.label}" (${n.number}) لا يوجد لها مخرج`, n.id);
            }

            if (n.type === 'entity' && (inn + out) === 0) {
                warn(`الكيان "${n.label}" غير مرتبط بأي تدفق`, n.id);
            }

            if (n.type === 'datastore' && (inn + out) === 0) {
                warn(`مخزن البيانات "${n.label}" غير مرتبط بأي تدفق`, n.id);
            }

            if (!n.label?.trim()) {
                warn(`عنصر بدون تسمية (${n.type})`, n.id);
            }
        });

        // Forbidden direct connections: entity ↔ datastore
        store.edges.forEach(e => {
            const fn = store.getNode(e.from), tn = store.getNode(e.to);
            if (!fn || !tn) return;
            const pair = [fn.type, tn.type].sort().join('-');
            if (pair === 'datastore-entity') {
                err(`ربط مباشر بين كيان "${fn.label}" ومخزن "${tn.label}" — يجب المرور عبر عملية`, e.id);
            }
            if (pair === 'datastore-datastore') {
                err(`ربط مباشر بين مخزنين "${fn.label}" و"${tn.label}" — غير مسموح في DFD`, e.id);
            }
            if (!e.label?.trim()) {
                warn(`تدفق بدون تسمية بين "${fn.label}" و"${tn.label}"`, e.id);
            }
        });

        // Duplicate edges
        const edgeKeys = new Set();
        store.edges.forEach(e => {
            const k = `${e.from}→${e.to}`;
            if (edgeKeys.has(k)) warn(`تدفق مكرر بين نفس العنصرين`);
            else edgeKeys.add(k);
        });

        return issues;
    }
}

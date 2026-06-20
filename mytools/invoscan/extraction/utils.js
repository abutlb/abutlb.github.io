// extraction/utils.js — utilities مشتركة بين الـ plugins

export function normD(s) {
    return (s || '').replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

export function cleanAmt(s) {
    return normD(s || '').replace(/[,،\s]/g, '').trim();
}

export function toFloat(s) {
    return parseFloat(cleanAmt(s).replace(',', '.')) || 0;
}

export function dedup(s) {
    if (!s || s.length < 6) return s;
    const half  = Math.ceil(s.length / 2);
    const first = s.slice(0, half).trim();
    const rest  = s.slice(half).trim();
    if (rest.startsWith(first) || first === rest) return first;
    const words  = s.split(/\s+/);
    const unique = [];
    const seen   = new Set();
    for (const w of words) {
        if (!seen.has(w)) { seen.add(w); unique.push(w); }
    }
    return unique.join(' ').trim();
}

export function trimBilingual(s) {
    if (!s) return '';
    s = s.replace(/\s*[:：][A-Za-z\s.]+$/, '').trim();
    s = s.replace(/^[A-Za-z\s.:]+[:：]\s*/, '').trim();
    return s;
}

export function cleanValue(s) {
    return dedup(trimBilingual((s || '').trim())).trim();
}

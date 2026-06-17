// utils/Formatters.js — تنسيق الأرقام والنصوص

export const fmt = n =>
    new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' ﷼';

export const fmtK = n => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' م ﷼';
    if (abs >= 1_000)     return Math.round(n / 1_000) + ' ألف ﷼';
    return fmt(n);
};

export const fmtPct = (n, decimals = 1) => n.toFixed(decimals) + '%';

export const fmtYears = n => n === 1 ? 'سنة واحدة' : `${n} سنة`;

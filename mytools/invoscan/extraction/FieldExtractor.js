// extraction/FieldExtractor.js — استخراج حقول الفاتورة (عربي + إنجليزي)

function normD(s) {
    return (s || '').replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

// Remove trailing English labels like ":Name Customer" that appear in bilingual PDFs
function trimBilingual(s) {
    if (!s) return '';
    // Remove trailing ":[A-Za-z\s]+" (English label after Arabic value)
    s = s.replace(/\s*[:：][A-Za-z\s.]+$/, '').trim();
    // Remove leading ":English Label" at start
    s = s.replace(/^[A-Za-z\s.:]+[:：]\s*/, '').trim();
    return s;
}

// Deduplicate: "عبدالله التويجري عبدالله التويجري" → "عبدالله التويجري"
function dedup(s) {
    if (!s || s.length < 6) return s;
    const half = Math.ceil(s.length / 2);
    const first = s.slice(0, half).trim();
    const rest  = s.slice(half).trim();
    if (rest.startsWith(first) || first === rest) return first;
    // Word-level dedup
    const words  = s.split(/\s+/);
    const unique = [];
    const seen   = new Set();
    for (const w of words) {
        if (!seen.has(w)) { seen.add(w); unique.push(w); }
    }
    return unique.join(' ').trim();
}

// Clean extracted value: dedup + trim bilingual suffix + trim spaces
function clean(s) {
    return dedup(trimBilingual((s || '').trim())).trim();
}

// Take only first match from any pattern
function firstMatch(text, patterns) {
    for (const p of patterns) {
        const m = text.match(p);
        if (m && m[1]?.trim()) return clean(m[1].trim());
    }
    return '';
}

export class FieldExtractor {
    static extract(rawText) {
        const t = normD(rawText);
        return {
            invoiceNumber: FieldExtractor.invoiceNumber(t),
            date:          FieldExtractor.date(t),
            dueDate:       FieldExtractor.dueDate(t),
            supplier:      FieldExtractor.supplier(t),
            customer:      FieldExtractor.customer(t),
            vatNumber:     FieldExtractor.vatNumber(t),
            poNumber:      FieldExtractor.poNumber(t),
            currency:      FieldExtractor.currency(t),
            paymentTerms:  FieldExtractor.paymentTerms(t),
            notes:         FieldExtractor.notes(t),
        };
    }

    static invoiceNumber(t) {
        const v = firstMatch(t, [
            // Arabic: "رقم الفاتورة: 68124619180283"
            /(?:رقم\s*الفاتورة|فاتورة\s*رقم)\s*[:：]\s*([A-Za-z0-9\-\/]+)/i,
            // English: "Invoice No.: 68124619180283"
            /Invoice\s*(?:No|Number|#|Num)\.?\s*[:：]\s*([A-Za-z0-9\-\/]+)/i,
            // Generic fallback
            /(?:INV|FAT)[.\-]?\s*([A-Za-z0-9\-\/]{4,})/i,
        ]);
        // Take only first token (before any space/duplicate)
        return v ? v.split(/\s+/)[0] : '';
    }

    static date(t) {
        // Handles: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, with optional time
        return firstMatch(t, [
            // "تاريخ الاصدار : 2026-06-18 ..." or "Issue Date: 2026-06-18"
            /(?:تاريخ[^\n\r:：]*|Issue\s*Date)\s*[:：]\s*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i,
            // "تاريخ : 18/06/2026"
            /(?:تاريخ[^\n\r:：]*|Date)\s*[:：]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
            // Bare YYYY-MM-DD anywhere
            /\b(\d{4}-\d{2}-\d{2})\b/,
            // Bare DD/MM/YYYY
            /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/,
        ]);
    }

    static dueDate(t) {
        return firstMatch(t, [
            /(?:تاريخ\s*الاستحقاق|موعد\s*السداد|Due\s*Date|Payment\s*Due)\s*[:：]\s*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i,
            /(?:تاريخ\s*الاستحقاق|Due\s*Date)\s*[:：]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        ]);
    }

    static supplier(t) {
        const v = firstMatch(t, [
            // "From: Aldawaa Medical Company" or "من : شركة الدواء"
            /(?:From|Vendor|Supplier|Bill\s*From)\s*[:：]\s*([^\n\r\t]{3,60})/i,
            /(?:من|المورد|الشركة\s*المورِّدة)\s*[:：]\s*([^\n\r\t]{3,60})/i,
            /(?:اسم\s*الشركة|Company\s*Name)\s*[:：]\s*([^\n\r\t]{3,60})/i,
        ]);
        // Prefer English company name if mixed; take first meaningful part
        if (!v) return '';
        // If starts with Arabic text, take up to English portion start
        const enStart = v.search(/[A-Z][a-z]/);
        if (enStart > 3) return v.slice(0, enStart).trim() || v;
        return v;
    }

    static customer(t) {
        const v = firstMatch(t, [
            // "Customer Name: عبدالله التويجري"
            /(?:اسم\s*العميل|Customer\s*Name|Customer)\s*[:：]\s*([^\n\r\t:]{3,50})/i,
            /(?:العميل|المشتري|Bill\s*To|Sold\s*To|Client)\s*[:：]\s*([^\n\r\t:]{3,50})/i,
        ]);
        return v;
    }

    static vatNumber(t) {
        const v = firstMatch(t, [
            /(?:الرقم\s*الضريبي|رقم\s*ضريبة|VAT\s*(?:No|Number|Reg)\.?|TRN|VAT\s*Number)\s*[:：]\s*([0-9]{5,20})/i,
        ]);
        return v ? v.split(/\s+/)[0] : '';
    }

    static poNumber(t) {
        return firstMatch(t, [
            /(?:رقم\s*أمر\s*الشراء|P\.?O\.?\s*(?:No|Number)?|Purchase\s*Order)\s*[:：#]?\s*([A-Za-z0-9\-\/]{2,20})/i,
        ]);
    }

    static currency(t) {
        const m = t.match(/\b(SAR|USD|AED|EUR|GBP|ر\.س|ريال\s*سعودي)\b/i);
        return m ? m[1].toUpperCase() : '';
    }

    static paymentTerms(t) {
        return firstMatch(t, [
            /(?:شروط\s*الدفع|طريقة\s*الدفع|Payment\s*Terms?)\s*[:：]\s*([^\n\r\t]{3,50})/i,
        ]);
    }

    static notes(t) {
        return firstMatch(t, [
            /(?:ملاحظات|Notes?|Remarks?)\s*[:：]\s*([^\n\r]{5,200})/i,
        ]);
    }
}

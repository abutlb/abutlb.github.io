// core/textEncoding.js
//
// مكتبة qr-code-styling (وبداخلها qrcode-generator) تستخدم معالج بايتات افتراضي
// معطوب لأي نص يحتوي أحرفاً خارج نطاق Latin-1: يأخذ (charCode & 255) لكل حرف،
// فيقصّ البت العلوي من أي حرف عربي (code > 255) وينتج بايتات تالفة.
//
// الحل: نحوّل النص بأنفسنا إلى تسلسل بايتات UTF-8 الصحيح، ثم نبنيه كسلسلة نصية
// كل حرف فيها ≤ 255 (binary string). عندها معالج البايتات المعطوب في المكتبة
// يستخرج كل بايت كما هو دون أي قصّ، فتُطبع في مصفوفة QR بايتات UTF-8 سليمة
// تماماً — وأي قارئ QR حديث (الذي يفترض UTF-8 افتراضياً لمحتوى Byte mode)
// يعرضها بشكل صحيح. النصوص الإنجليزية/الأرقام غير متأثرة إطلاقاً لأن ترميز
// UTF-8 لرموز ASCII مطابق تماماً للبايت الأصلي.

export function toUtf8SafeString(str) {
    if (!str) return str;
    const bytes = new TextEncoder().encode(str);
    let out = "";
    for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
    return out;
}

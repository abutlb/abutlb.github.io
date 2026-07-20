// core/QRTypeBuilder.js
// يبني نص الترميز (payload) لكل نوع رمز QR من حقول الإدخال

export class QRTypeBuilder {

    static build(type, fields = {}) {
        switch (type) {
            case "link":  return fields.content || "";
            case "wifi":  return QRTypeBuilder._wifi(fields);
            case "vcard": return QRTypeBuilder._vcard(fields);
            case "email": return QRTypeBuilder._email(fields);
            case "sms":   return QRTypeBuilder._sms(fields);
            case "tel":   return fields.phone ? `tel:${fields.phone}` : "";
            case "geo":   return QRTypeBuilder._geo(fields);
            default:      return "";
        }
    }

    // خاصة بمواصفة WiFi/vCard — تهريب \ ; , : "
    static _esc(s = "") {
        return String(s).replace(/([\\;,:"])/g, "\\$1");
    }

    static _wifi(f) {
        if (!f.ssid) return "";
        const sec = f.security || "WPA";
        const pass = sec === "nopass" ? "" : QRTypeBuilder._esc(f.password);
        return `WIFI:T:${sec};S:${QRTypeBuilder._esc(f.ssid)};P:${pass};H:${f.hidden ? "true" : "false"};;`;
    }

    static _vcard(f) {
        if (!f.name) return "";
        const lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `N:${QRTypeBuilder._esc(f.name)};;;`,
            `FN:${QRTypeBuilder._esc(f.name)}`,
            f.org   ? `ORG:${QRTypeBuilder._esc(f.org)}`     : null,
            f.title ? `TITLE:${QRTypeBuilder._esc(f.title)}` : null,
            f.phone ? `TEL:${QRTypeBuilder._esc(f.phone)}`   : null,
            f.email ? `EMAIL:${QRTypeBuilder._esc(f.email)}` : null,
            "END:VCARD",
        ];
        return lines.filter(Boolean).join("\n");
    }

    static _email(f) {
        if (!f.to) return "";
        const params = new URLSearchParams();
        if (f.subject) params.set("subject", f.subject);
        if (f.body)    params.set("body", f.body);
        const qs = params.toString();
        return `mailto:${f.to}${qs ? "?" + qs : ""}`;
    }

    static _sms(f) {
        if (!f.phone) return "";
        return `SMSTO:${f.phone}:${f.message || ""}`;
    }

    static _geo(f) {
        if (!f.lat || !f.lng) return "";
        return `geo:${f.lat},${f.lng}`;
    }
}

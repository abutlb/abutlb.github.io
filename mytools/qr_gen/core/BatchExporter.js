// core/BatchExporter.js
// يولّد عدة رموز QR من قائمة عناصر ويصدرها كملف ZIP واحد (JSZip)
import { toUtf8SafeString } from "./textEncoding.js";

export class BatchExporter {

    static slug(text, maxLen = 24) {
        return String(text)
            .replace(/[^a-zA-Z0-9؀-ۿ]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, maxLen);
    }

    // items: { content: string, name?: string }[]
    // baseOptions: إعدادات qr-code-styling المشتركة (بدون data)
    static async exportZip(items, baseOptions, extension = "png", onProgress) {
        const zip = new JSZip();
        const used = new Set();

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const qr = new QRCodeStyling({ ...baseOptions, data: toUtf8SafeString(item.content) });
            const blob = await qr.getRawData(extension);

            const index = String(i + 1).padStart(3, "0");
            const base  = BatchExporter.slug(item.name || item.content);
            let name = base ? `qr-${index}-${base}` : `qr-${index}`;
            while (used.has(name)) name += "-x";
            used.add(name);

            zip.file(`${name}.${extension}`, blob);
            onProgress?.(i + 1, items.length);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(zipBlob);
        a.download = "qr-codes.zip";
        a.click();
        URL.revokeObjectURL(a.href);
    }
}

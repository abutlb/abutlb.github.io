// core/ImageProcessor.js — تحسين جودة الصورة قبل OCR

export class ImageProcessor {
    // Main preprocessing pipeline for best OCR results
    static preprocess(canvas) {
        const out = document.createElement('canvas');
        out.width  = canvas.width;
        out.height = canvas.height;
        const ctx = out.getContext('2d');
        ctx.drawImage(canvas, 0, 0);

        const imageData = ctx.getImageData(0, 0, out.width, out.height);
        ImageProcessor._grayscale(imageData.data);
        ImageProcessor._enhanceContrast(imageData.data);
        ctx.putImageData(imageData, 0, 0);
        return out;
    }

    // Load an image File → canvas
    static async fileToCanvas(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                // Upscale if small for better OCR
                const scale  = Math.max(1, 2000 / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width  = Math.round(img.width  * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas);
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('فشل تحميل الصورة')); };
            img.src = url;
        });
    }

    // Convert to grayscale (luminance formula)
    static _grayscale(data) {
        for (let i = 0; i < data.length; i += 4) {
            const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = g;
        }
    }

    // Enhance contrast: stretch histogram
    static _enhanceContrast(data, factor = 1.4) {
        for (let i = 0; i < data.length; i += 4) {
            const v = data[i];
            const enhanced = Math.min(255, Math.max(0, (v - 128) * factor + 128));
            data[i] = data[i + 1] = data[i + 2] = enhanced;
        }
    }

    // Canvas → base64 data URL for Tesseract
    static toDataURL(canvas) {
        return canvas.toDataURL('image/png');
    }

    // Create small thumbnail for preview (max 280px wide)
    static thumbnail(canvas, maxW = 280) {
        const scale = Math.min(1, maxW / canvas.width);
        const thumb = document.createElement('canvas');
        thumb.width  = Math.round(canvas.width  * scale);
        thumb.height = Math.round(canvas.height * scale);
        const ctx = thumb.getContext('2d');
        ctx.drawImage(canvas, 0, 0, thumb.width, thumb.height);
        return thumb;
    }
}

// core/QRRenderer.js
// يغلّف مكتبة QRCodeStyling — رسم/تحديث/تحميل رمز واحد داخل حاوية DOM

export class QRRenderer {

    constructor(container) {
        this.container = container;
        this.instance  = null;
    }

    // options: شكل مكتبة qr-code-styling كاملاً (data, width, height, dotsOptions...)
    render(options) {
        if (!options.data) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-qrcode"></i>
                    <p class="text-sm">أدخل محتوى لعرض رمز QR</p>
                </div>`;
            this.instance = null;
            return;
        }

        if (!this.instance) {
            this.instance = new QRCodeStyling(options);
            this.container.innerHTML = "";
            this.instance.append(this.container);
        } else {
            this.instance.update(options);
        }
    }

    download(name, extension) {
        this.instance?.download({ name, extension });
    }

    async getBlob(extension = "png") {
        if (!this.instance) return null;
        return await this.instance.getRawData(extension);
    }
}

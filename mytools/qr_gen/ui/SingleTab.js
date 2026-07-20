// ui/SingleTab.js
import { QRTypeBuilder } from "../core/QRTypeBuilder.js";
import { QRRenderer }    from "../core/QRRenderer.js";

const TYPE_FIELDS = {
    link: [
        { key: "content", label: "الرابط أو النص", type: "textarea", placeholder: "https://example.com أو أي نص..." },
    ],
    wifi: [
        { key: "ssid",     label: "اسم الشبكة (SSID)", type: "text",   placeholder: "MyNetwork" },
        { key: "password", label: "كلمة المرور",       type: "text",   placeholder: "••••••••" },
        { key: "security", label: "نوع الأمان",        type: "select", options: [["WPA", "WPA / WPA2"], ["WEP", "WEP"], ["nopass", "بدون كلمة مرور"]] },
    ],
    vcard: [
        { key: "name",  label: "الاسم الكامل",              type: "text" },
        { key: "phone", label: "رقم الهاتف",                type: "text" },
        { key: "email", label: "البريد الإلكتروني",          type: "text" },
        { key: "org",   label: "الجهة (اختياري)",            type: "text" },
        { key: "title", label: "المسمى الوظيفي (اختياري)",   type: "text" },
    ],
    email: [
        { key: "to",      label: "البريد الإلكتروني",     type: "text" },
        { key: "subject", label: "الموضوع (اختياري)",      type: "text" },
        { key: "body",    label: "نص الرسالة (اختياري)",   type: "textarea" },
    ],
    sms: [
        { key: "phone",   label: "رقم الهاتف", type: "text" },
        { key: "message", label: "نص الرسالة", type: "textarea" },
    ],
    tel: [
        { key: "phone", label: "رقم الهاتف", type: "text" },
    ],
    geo: [
        { key: "lat", label: "خط العرض (Latitude)",  type: "text", placeholder: "24.7136" },
        { key: "lng", label: "خط الطول (Longitude)", type: "text", placeholder: "46.6753" },
    ],
};

const TYPE_LABELS = {
    link: "🔗 نص / رابط", wifi: "📶 شبكة WiFi", vcard: "👤 بطاقة اتصال",
    email: "📧 بريد إلكتروني", sms: "💬 رسالة نصية", tel: "📞 رقم هاتف", geo: "📍 موقع جغرافي",
};

const SHAPES = [
    ["square",         "⬛ مربعات"],
    ["dots",           "⚫ نقاط"],
    ["rounded",        "🔵 مدوّر"],
    ["extra-rounded",  "🟣 مدوّر كامل"],
    ["classy",         "💎 كلاسيك"],
    ["classy-rounded", "✨ كلاسيك مدوّر"],
];

const PALETTE = ["#db2777", "#0d9488", "#c2410c", "#7c3aed", "#dc2626", "#16a34a", "#2563eb", "#000000"];

export class SingleTab {

    constructor(containerId, toast) {
        this.container = document.getElementById(containerId);
        this.toast     = toast;

        this.type        = "link";
        this.fieldsByType = Object.fromEntries(Object.keys(TYPE_FIELDS).map(t => [t, {}]));
        this.style = {
            dotColor: "#000000", bgColor: "#ffffff", bgTransparent: false,
            dotType: "square", roundedCorners: false,
            errorLevel: "M", size: 512, margin: 4,
            logo: null,
        };
        this.renderer = null;

        this.render();
    }

    render() {
        this.container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- ── يسار (بصرياً): الشكل واللوغو ── -->
            <div class="order-3 lg:order-1 space-y-5">
                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-3
                               flex items-center gap-2">
                        <i class="fas fa-shapes text-blue-500 text-xs"></i>الشكل والإعدادات
                    </h3>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">شكل النقاط</label>
                    <div id="qr-shape-grid" class="grid grid-cols-2 gap-2 mb-4"></div>

                    <div class="flex items-center justify-between mb-4">
                        <span class="text-sm text-gray-700 dark:text-gray-300">زوايا مدوّرة</span>
                        <button id="qr-rounded-toggle" role="switch" aria-checked="false"
                                class="toggle-sw" aria-label="زوايا مدوّرة"></button>
                    </div>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">مستوى تصحيح الخطأ</label>
                    <select id="qr-error-level" class="dm-select mb-4">
                        <option value="L">منخفض (L) — 7%</option>
                        <option value="M" selected>متوسط (M) — 15%</option>
                        <option value="Q">عالي (Q) — 25%</option>
                        <option value="H">مرتفع جداً (H) — 30%</option>
                    </select>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">
                        حجم التصدير: <span id="qr-size-val" class="text-blue-600 dark:text-blue-400">512px</span>
                    </label>
                    <input id="qr-size" type="range" min="256" max="1024" step="16" value="512"
                           class="w-full mb-1" aria-label="حجم التصدير">
                    <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-4">
                        <span>256px</span><span>1024px</span>
                    </div>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">
                        الهامش: <span id="qr-margin-val" class="text-blue-600 dark:text-blue-400">4</span>
                    </label>
                    <input id="qr-margin" type="range" min="0" max="30" step="1" value="4"
                           class="w-full" aria-label="الهامش">
                    <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>بدون</span><span>كبير</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-3
                               flex items-center gap-2">
                        <i class="fas fa-image text-blue-500 text-xs"></i>الشعار (logo)
                    </h3>
                    <div id="qr-logo-drop" class="logo-drop">
                        <input type="file" id="qr-logo-input" accept="image/*" aria-label="رفع اللوغو">
                        <i class="fas fa-folder-open text-2xl text-amber-400 mb-2"></i>
                        <p class="text-sm font-bold text-gray-600 dark:text-gray-400">اضغط لرفع اللوغو</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG بخلفية شفافة — الأفضل</p>
                    </div>
                    <button id="qr-logo-remove" class="hidden mt-2 w-full text-xs font-bold
                            text-red-500 hover:text-red-600 py-1.5">
                        <i class="fas fa-trash-alt ml-1"></i>إزالة الشعار
                    </button>
                </div>
            </div>

            <!-- ── وسط: المعاينة ── -->
            <div class="order-1 lg:order-2 space-y-5">
                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <div id="qr-preview" class="flex items-center justify-center min-h-[280px]"></div>

                    <div class="grid grid-cols-2 gap-2 my-4">
                        <div class="stat-mini"><div class="num" id="qr-stat-error">M</div><div class="lbl">الخطأ</div></div>
                        <div class="stat-mini"><div class="num" id="qr-stat-size">512px</div><div class="lbl">الحجم</div></div>
                        <div class="stat-mini"><div class="num" id="qr-stat-logo">—</div><div class="lbl">اللوغو</div></div>
                        <div class="stat-mini"><div class="num" id="qr-stat-shape">square</div><div class="lbl">الشكل</div></div>
                    </div>

                    <p class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2
                              uppercase tracking-wide">تحميل</p>
                    <div class="grid grid-cols-3 gap-2 mb-3">
                        <button id="qr-dl-png" class="shape-btn flex-col py-3" aria-label="تحميل PNG">
                            🖼️ PNG<span class="text-[10px] font-normal text-gray-400">شفاف</span>
                        </button>
                        <button id="qr-dl-svg" class="shape-btn flex-col py-3" aria-label="تحميل SVG">
                            ✏️ SVG<span class="text-[10px] font-normal text-gray-400">متجه</span>
                        </button>
                        <button id="qr-dl-jpg" class="shape-btn flex-col py-3" aria-label="تحميل JPG">
                            📷 JPG<span class="text-[10px] font-normal text-gray-400">صغير</span>
                        </button>
                    </div>
                    <button id="qr-share-wa"
                        class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white
                               font-bold text-sm rounded-xl transition-colors flex items-center
                               justify-center gap-2">
                        <i class="fab fa-whatsapp"></i>مشاركة عبر واتساب
                    </button>
                </div>
            </div>

            <!-- ── يمين: المحتوى والألوان ── -->
            <div class="order-2 lg:order-3 space-y-5">
                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-3
                               flex items-center gap-2">
                        <i class="fas fa-pen text-blue-500 text-xs"></i>المحتوى
                    </h3>
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">نوع رمز QR</label>
                    <select id="qr-type-select" class="dm-select mb-3">
                        ${Object.entries(TYPE_LABELS).map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}
                    </select>
                    <div id="qr-fields"></div>
                </div>

                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-3
                               flex items-center gap-2">
                        <i class="fas fa-palette text-blue-500 text-xs"></i>الألوان
                    </h3>
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">لون النقاط</label>
                    <div class="flex items-center gap-2 mb-3">
                        <span id="qr-dot-hex" class="text-xs text-gray-400 font-mono">#000000</span>
                        <input type="color" id="qr-dot-color" value="#000000"
                               class="w-8 h-8 rounded cursor-pointer border-0" aria-label="لون النقاط">
                    </div>
                    <div id="qr-dot-palette" class="flex flex-wrap gap-2 mb-4"></div>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">لون الخلفية</label>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-gray-700 dark:text-gray-300">شفاف</span>
                        <input type="checkbox" id="qr-bg-transparent" class="w-4 h-4" aria-label="خلفية شفافة">
                    </div>
                    <div class="flex items-center gap-2">
                        <span id="qr-bg-hex" class="text-xs text-gray-400 font-mono">#ffffff</span>
                        <input type="color" id="qr-bg-color" value="#ffffff"
                               class="w-8 h-8 rounded cursor-pointer border-0" aria-label="لون الخلفية">
                    </div>
                </div>
            </div>
        </div>`;

        this._renderShapeGrid();
        this._renderPalette();
        this._renderFields();
        this._wire();

        this.renderer = new QRRenderer(document.getElementById("qr-preview"));
        this._update();
    }

    _renderShapeGrid() {
        const grid = document.getElementById("qr-shape-grid");
        grid.innerHTML = SHAPES.map(([v, l]) => `
            <button type="button" class="shape-btn ${v === this.style.dotType ? "active" : ""}"
                    data-shape="${v}">${l}</button>`).join("");
        grid.querySelectorAll("[data-shape]").forEach(btn => {
            btn.addEventListener("click", () => {
                this.style.dotType = btn.dataset.shape;
                grid.querySelectorAll(".shape-btn").forEach(b => b.classList.toggle("active", b === btn));
                this._update();
            });
        });
    }

    _renderPalette() {
        const wrap = document.getElementById("qr-dot-palette");
        wrap.innerHTML = PALETTE.map(c => `
            <button type="button" class="color-swatch" style="background:${c}"
                    data-color="${c}" aria-label="لون ${c}"></button>`).join("");
        wrap.querySelectorAll("[data-color]").forEach(btn => {
            btn.addEventListener("click", () => {
                this.style.dotColor = btn.dataset.color;
                document.getElementById("qr-dot-color").value = btn.dataset.color;
                document.getElementById("qr-dot-hex").textContent = btn.dataset.color;
                this._update();
            });
        });
    }

    _renderFields() {
        const fields = TYPE_FIELDS[this.type];
        const values = this.fieldsByType[this.type];
        const wrap = document.getElementById("qr-fields");

        wrap.innerHTML = fields.map(f => {
            const val = values[f.key] ?? "";
            if (f.type === "textarea") {
                return `
                <div class="mb-3">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">${f.label}</label>
                    <textarea data-field="${f.key}" rows="3" placeholder="${f.placeholder || ""}"
                              class="dm-input resize-none">${val}</textarea>
                </div>`;
            }
            if (f.type === "select") {
                return `
                <div class="mb-3">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">${f.label}</label>
                    <select data-field="${f.key}" class="dm-select">
                        ${f.options.map(([v, l]) => `<option value="${v}" ${v === val ? "selected" : ""}>${l}</option>`).join("")}
                    </select>
                </div>`;
            }
            return `
            <div class="mb-3">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                               mb-1.5 uppercase tracking-wide">${f.label}</label>
                <input type="text" data-field="${f.key}" value="${val}"
                       placeholder="${f.placeholder || ""}" class="dm-input">
            </div>`;
        }).join("");

        wrap.querySelectorAll("[data-field]").forEach(el => {
            el.addEventListener("input", () => {
                this.fieldsByType[this.type][el.dataset.field] = el.value;
                this._update();
            });
        });
    }

    _wire() {
        document.getElementById("qr-type-select").addEventListener("change", e => {
            this.type = e.target.value;
            this._renderFields();
            this._update();
        });

        document.getElementById("qr-rounded-toggle").addEventListener("click", e => {
            const on = e.currentTarget.getAttribute("aria-checked") === "true";
            e.currentTarget.setAttribute("aria-checked", String(!on));
            this.style.roundedCorners = !on;
            this._update();
        });

        document.getElementById("qr-error-level").addEventListener("change", e => {
            this.style.errorLevel = e.target.value;
            this._update();
        });

        const sizeInp = document.getElementById("qr-size");
        sizeInp.addEventListener("input", e => {
            this.style.size = +e.target.value;
            document.getElementById("qr-size-val").textContent = `${this.style.size}px`;
            this._update();
        });

        const marginInp = document.getElementById("qr-margin");
        marginInp.addEventListener("input", e => {
            this.style.margin = +e.target.value;
            document.getElementById("qr-margin-val").textContent = this.style.margin;
            this._update();
        });

        document.getElementById("qr-dot-color").addEventListener("input", e => {
            this.style.dotColor = e.target.value;
            document.getElementById("qr-dot-hex").textContent = e.target.value;
            this._update();
        });

        document.getElementById("qr-bg-color").addEventListener("input", e => {
            this.style.bgColor = e.target.value;
            document.getElementById("qr-bg-hex").textContent = e.target.value;
            this._update();
        });

        document.getElementById("qr-bg-transparent").addEventListener("change", e => {
            this.style.bgTransparent = e.target.checked;
            this._update();
        });

        document.getElementById("qr-logo-input").addEventListener("change", e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                this.style.logo = reader.result;
                document.getElementById("qr-logo-remove").classList.remove("hidden");
                this._update();
            };
            reader.readAsDataURL(file);
        });

        document.getElementById("qr-logo-remove").addEventListener("click", () => {
            this.style.logo = null;
            document.getElementById("qr-logo-input").value = "";
            document.getElementById("qr-logo-remove").classList.add("hidden");
            this._update();
        });

        document.getElementById("qr-dl-png").addEventListener("click", () => this._download("png"));
        document.getElementById("qr-dl-svg").addEventListener("click", () => this._download("svg"));
        document.getElementById("qr-dl-jpg").addEventListener("click", () => this._download("jpeg"));

        document.getElementById("qr-share-wa").addEventListener("click", () => {
            const content = this._content();
            if (!content) { this.toast.show("أدخل محتوى أولاً", "warn"); return; }
            const text = encodeURIComponent(content);
            window.open(`https://wa.me/?text=${text}`, "_blank");
        });
    }

    _content() {
        return QRTypeBuilder.build(this.type, this.fieldsByType[this.type]);
    }

    _buildOptions(data) {
        return {
            width: this.style.size,
            height: this.style.size,
            data,
            margin: this.style.margin,
            qrOptions: { errorCorrectionLevel: this.style.errorLevel },
            dotsOptions: { color: this.style.dotColor, type: this.style.dotType },
            backgroundOptions: { color: this.style.bgTransparent ? "rgba(0,0,0,0)" : this.style.bgColor },
            cornersSquareOptions: { type: this.style.roundedCorners ? "extra-rounded" : "square", color: this.style.dotColor },
            cornersDotOptions: { type: this.style.roundedCorners ? "dot" : "square", color: this.style.dotColor },
            image: this.style.logo || undefined,
            imageOptions: { crossOrigin: "anonymous", imageSize: 0.4, margin: 4, hideBackgroundDots: true },
        };
    }

    _update() {
        const data = this._content();
        this.renderer.render(this._buildOptions(data));

        document.getElementById("qr-stat-error").textContent = this.style.errorLevel;
        document.getElementById("qr-stat-size").textContent  = `${this.style.size}px`;
        document.getElementById("qr-stat-logo").textContent  = this.style.logo ? "✓" : "—";
        document.getElementById("qr-stat-shape").textContent = this.style.dotType;
    }

    _download(extension) {
        const data = this._content();
        if (!data) { this.toast.show("أدخل محتوى أولاً", "warn"); return; }
        this.renderer.download("qr-code", extension);
        this.toast.show("تم تحميل رمز QR");
    }
}

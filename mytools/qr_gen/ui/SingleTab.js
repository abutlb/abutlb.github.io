// ui/SingleTab.js
import { QRTypeBuilder } from "../core/QRTypeBuilder.js";
import { QRRenderer }    from "../core/QRRenderer.js";
import { i18n }          from "../core/i18n.js";
import { Settings }      from "../core/Settings.js";

const TYPE_FIELDS = {
    link: [
        { key: "content", labelKey: "fieldContent", type: "textarea", phKey: "fieldContentPh" },
    ],
    wifi: [
        { key: "ssid",     labelKey: "fieldSsid",     type: "text",   phKey: "fieldSsidPh" },
        { key: "password", labelKey: "fieldPassword", type: "text",   phKey: "fieldPasswordPh" },
        { key: "security", labelKey: "fieldSecurity", type: "select", options: [["WPA", "secWpa"], ["WEP", "secWep"], ["nopass", "secNone"]] },
    ],
    vcard: [
        { key: "name",  labelKey: "fieldName",     type: "text" },
        { key: "phone", labelKey: "fieldPhone",    type: "text" },
        { key: "email", labelKey: "fieldEmail",    type: "text" },
        { key: "org",   labelKey: "fieldOrg",      type: "text" },
        { key: "title", labelKey: "fieldJobTitle", type: "text" },
    ],
    email: [
        { key: "to",      labelKey: "fieldEmailTo", type: "text" },
        { key: "subject", labelKey: "fieldSubject", type: "text" },
        { key: "body",    labelKey: "fieldBody",    type: "textarea" },
    ],
    sms: [
        { key: "phone",   labelKey: "fieldPhone",   type: "text" },
        { key: "message", labelKey: "fieldMessage", type: "textarea" },
    ],
    tel: [
        { key: "phone", labelKey: "fieldPhone", type: "text" },
    ],
    geo: [
        { key: "lat", labelKey: "fieldLat", type: "text", phKey: null, placeholder: "24.7136" },
        { key: "lng", labelKey: "fieldLng", type: "text", phKey: null, placeholder: "46.6753" },
    ],
};

const TYPE_KEYS = ["link", "wifi", "vcard", "email", "sms", "tel", "geo"];
const TYPE_LABEL_KEYS = {
    link: "typeLink", wifi: "typeWifi", vcard: "typeVcard",
    email: "typeEmail", sms: "typeSms", tel: "typeTel", geo: "typeGeo",
};

const SHAPES = [
    ["square", "shapeSquare"], ["dots", "shapeDots"], ["rounded", "shapeRounded"],
    ["extra-rounded", "shapeExtraRounded"], ["classy", "shapeClassy"], ["classy-rounded", "shapeClassyRounded"],
];

const PALETTE = ["#db2777", "#0d9488", "#c2410c", "#7c3aed", "#dc2626", "#16a34a", "#2563eb", "#000000"];

// تباين نسبي بسيط بين لونين (WCAG luminance ratio)
function relLuminance(hex) {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    const f = v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(hex1, hex2) {
    const l1 = relLuminance(hex1), l2 = relLuminance(hex2);
    const [a, b] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (a + 0.05) / (b + 0.05);
}

function looksLikeIncompleteLink(text) {
    const t = text.trim();
    if (!t) return false;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) return false;
    if (/^(mailto:|tel:|sms:|geo:|WIFI:|BEGIN:VCARD)/i.test(t)) return false;
    return /^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(t);
}

export class SingleTab {

    constructor(containerId, toast, savedSettings = {}) {
        this.container = document.getElementById(containerId);
        this.toast     = toast;

        this.type        = "link";
        this.fieldsByType = Object.fromEntries(TYPE_KEYS.map(t => [t, {}]));
        this.style = {
            dotColor: savedSettings.dotColor ?? "#000000",
            bgColor: savedSettings.bgColor ?? "#ffffff",
            bgTransparent: savedSettings.bgTransparent ?? false,
            dotType: savedSettings.dotType ?? "square",
            roundedCorners: savedSettings.roundedCorners ?? false,
            errorLevel: savedSettings.errorLevel ?? "M",
            size: savedSettings.size ?? 512,
            margin: savedSettings.margin ?? 4,
            logo: null,
        };
        this.renderer = null;

        this.render();
    }

    render() {
        const t = k => i18n.t(k);

        this.container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- ── يسار (بصرياً): الشكل واللوغو ── -->
            <div class="order-3 lg:order-1 space-y-5">
                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-3
                               flex items-center gap-2">
                        <i class="fas fa-shapes text-blue-500 text-xs"></i>${t("shapeTitle")}
                    </h3>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">${t("dotShapeLabel")}</label>
                    <div id="qr-shape-grid" class="grid grid-cols-2 gap-2 mb-4"></div>

                    <div class="flex items-center justify-between mb-4">
                        <span class="text-sm text-gray-700 dark:text-gray-300">${t("roundedCornersLabel")}</span>
                        <button id="qr-rounded-toggle" role="switch" aria-checked="${this.style.roundedCorners}"
                                class="toggle-sw" aria-label="${t("roundedCornersLabel")}"></button>
                    </div>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">${t("errorLevelLabel")}</label>
                    <select id="qr-error-level" class="dm-select mb-4">
                        <option value="L" ${this.style.errorLevel === "L" ? "selected" : ""}>${t("errorLow")}</option>
                        <option value="M" ${this.style.errorLevel === "M" ? "selected" : ""}>${t("errorMedium")}</option>
                        <option value="Q" ${this.style.errorLevel === "Q" ? "selected" : ""}>${t("errorHigh")}</option>
                        <option value="H" ${this.style.errorLevel === "H" ? "selected" : ""}>${t("errorVeryHigh")}</option>
                    </select>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">
                        ${t("sizeLabel")}: <span id="qr-size-val" class="text-blue-600 dark:text-blue-400">${this.style.size}px</span>
                    </label>
                    <input id="qr-size" type="range" min="256" max="1024" step="16" value="${this.style.size}"
                           class="w-full mb-1" aria-label="${t("sizeLabel")}">
                    <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-4">
                        <span>256px</span><span>1024px</span>
                    </div>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">
                        ${t("marginLabel")}: <span id="qr-margin-val" class="text-blue-600 dark:text-blue-400">${this.style.margin}</span>
                    </label>
                    <input id="qr-margin" type="range" min="0" max="30" step="1" value="${this.style.margin}"
                           class="w-full" aria-label="${t("marginLabel")}">
                    <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>${t("marginNone")}</span><span>${t("marginLarge")}</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-3
                               flex items-center gap-2">
                        <i class="fas fa-image text-blue-500 text-xs"></i>${t("logoTitle")}
                    </h3>
                    <label class="logo-drop block">
                        <input type="file" id="qr-logo-input" accept="image/*" aria-label="${t("logoTitle")}">
                        <i class="fas fa-folder-open text-2xl text-amber-400 mb-2"></i>
                        <p class="text-sm font-bold text-gray-600 dark:text-gray-400">${t("logoDropText")}</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">${t("logoDropHint")}</p>
                    </label>
                    <button id="qr-logo-remove" class="hidden mt-2 w-full text-xs font-bold
                            text-red-500 hover:text-red-600 py-1.5">
                        <i class="fas fa-trash-alt ml-1"></i>${t("logoRemove")}
                    </button>
                    <div id="qr-logo-warning" class="hidden mt-2 text-xs text-amber-600 dark:text-amber-400
                                flex items-start gap-1.5">
                        <i class="fas fa-triangle-exclamation mt-0.5 flex-shrink-0"></i>
                        <span>${t("warnLargeLogo")}</span>
                    </div>
                </div>
            </div>

            <!-- ── وسط: المعاينة ── -->
            <div class="order-1 lg:order-2 space-y-5">
                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <div id="qr-preview" class="flex items-center justify-center min-h-[280px]"></div>

                    <div id="qr-contrast-warning" class="hidden mb-3 text-xs text-amber-600 dark:text-amber-400
                                flex items-start gap-1.5 bg-amber-50 dark:bg-amber-900/20
                                border border-amber-200 dark:border-amber-800 rounded-lg p-2">
                        <i class="fas fa-triangle-exclamation mt-0.5 flex-shrink-0"></i>
                        <span>${t("warnLowContrast")}</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 my-4">
                        <div class="stat-mini"><div class="num" id="qr-stat-error">${this.style.errorLevel}</div><div class="lbl">${t("statError")}</div></div>
                        <div class="stat-mini"><div class="num" id="qr-stat-size">${this.style.size}px</div><div class="lbl">${t("statSize")}</div></div>
                        <div class="stat-mini"><div class="num" id="qr-stat-logo">—</div><div class="lbl">${t("statLogo")}</div></div>
                        <div class="stat-mini"><div class="num" id="qr-stat-shape">${this.style.dotType}</div><div class="lbl">${t("statShape")}</div></div>
                    </div>

                    <div id="qr-actions" class="hidden">
                        <p class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2
                                  uppercase tracking-wide">${t("downloadTitle")}</p>
                        <div class="grid grid-cols-3 gap-2 mb-3">
                            <button id="qr-dl-png" class="shape-btn flex-col py-3" aria-label="${t("dlPng")}">
                                🖼️ PNG<span class="text-[10px] font-normal text-gray-400">${t("dlPngHint")}</span>
                            </button>
                            <button id="qr-dl-svg" class="shape-btn flex-col py-3" aria-label="${t("dlSvg")}">
                                ✏️ SVG<span class="text-[10px] font-normal text-gray-400">${t("dlSvgHint")}</span>
                            </button>
                            <button id="qr-dl-jpg" class="shape-btn flex-col py-3" aria-label="${t("dlJpg")}">
                                📷 JPG<span class="text-[10px] font-normal text-gray-400">${t("dlJpgHint")}</span>
                            </button>
                        </div>
                        <button id="qr-share-wa"
                            class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white
                                   font-bold text-sm rounded-xl transition-colors flex items-center
                                   justify-center gap-2">
                            <i class="fab fa-whatsapp"></i>${t("shareWhatsapp")}
                        </button>
                    </div>
                </div>
            </div>

            <!-- ── يمين: المحتوى والألوان ── -->
            <div class="order-2 lg:order-3 space-y-5">
                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-3
                               flex items-center gap-2">
                        <i class="fas fa-pen text-blue-500 text-xs"></i>${t("contentTitle")}
                    </h3>
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">${t("qrTypeLabel")}</label>
                    <select id="qr-type-select" class="dm-select mb-3">
                        ${TYPE_KEYS.map(v => `<option value="${v}" ${v === this.type ? "selected" : ""}>${t(TYPE_LABEL_KEYS[v])}</option>`).join("")}
                    </select>
                    <div id="qr-fields"></div>
                </div>

                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-3
                               flex items-center gap-2">
                        <i class="fas fa-palette text-blue-500 text-xs"></i>${t("colorsTitle")}
                    </h3>
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">${t("dotColorLabel")}</label>
                    <div class="flex items-center gap-2 mb-3">
                        <span id="qr-dot-hex" class="text-xs text-gray-400 font-mono">${this.style.dotColor}</span>
                        <input type="color" id="qr-dot-color" value="${this.style.dotColor}"
                               class="w-8 h-8 rounded cursor-pointer border-0" aria-label="${t("dotColorLabel")}">
                    </div>
                    <div id="qr-dot-palette" class="flex flex-wrap gap-2 mb-4"></div>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">${t("bgColorLabel")}</label>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-gray-700 dark:text-gray-300">${t("transparentLabel")}</span>
                        <input type="checkbox" id="qr-bg-transparent" class="w-4 h-4"
                               ${this.style.bgTransparent ? "checked" : ""} aria-label="${t("transparentLabel")}">
                    </div>
                    <div class="flex items-center gap-2">
                        <span id="qr-bg-hex" class="text-xs text-gray-400 font-mono">${this.style.bgColor}</span>
                        <input type="color" id="qr-bg-color" value="${this.style.bgColor}"
                               class="w-8 h-8 rounded cursor-pointer border-0" aria-label="${t("bgColorLabel")}">
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
        grid.innerHTML = SHAPES.map(([v, labelKey]) => `
            <button type="button" class="shape-btn ${v === this.style.dotType ? "active" : ""}"
                    data-shape="${v}">${i18n.t(labelKey)}</button>`).join("");
        grid.querySelectorAll("[data-shape]").forEach(btn => {
            btn.addEventListener("click", () => {
                this.style.dotType = btn.dataset.shape;
                Settings.save({ dotType: this.style.dotType });
                grid.querySelectorAll(".shape-btn").forEach(b => b.classList.toggle("active", b === btn));
                this._update();
            });
        });
    }

    _renderPalette() {
        const wrap = document.getElementById("qr-dot-palette");
        wrap.innerHTML = PALETTE.map(c => `
            <button type="button" class="color-swatch" style="background:${c}"
                    data-color="${c}" aria-label="color ${c}"></button>`).join("");
        wrap.querySelectorAll("[data-color]").forEach(btn => {
            btn.addEventListener("click", () => {
                this.style.dotColor = btn.dataset.color;
                Settings.save({ dotColor: this.style.dotColor });
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
            const label = i18n.t(f.labelKey);
            const placeholder = f.phKey ? i18n.t(f.phKey) : (f.placeholder || "");
            if (f.type === "textarea") {
                return `
                <div class="mb-3">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">${label}</label>
                    <textarea data-field="${f.key}" rows="3" placeholder="${placeholder}"
                              class="dm-input resize-none">${val}</textarea>
                </div>`;
            }
            if (f.type === "select") {
                return `
                <div class="mb-3">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">${label}</label>
                    <select data-field="${f.key}" class="dm-select">
                        ${f.options.map(([v, lk]) => `<option value="${v}" ${v === val ? "selected" : ""}>${i18n.t(lk)}</option>`).join("")}
                    </select>
                </div>`;
            }
            return `
            <div class="mb-3">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                               mb-1.5 uppercase tracking-wide">${label}</label>
                <input type="text" data-field="${f.key}" value="${val}"
                       placeholder="${placeholder}" class="dm-input">
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
            Settings.save({ roundedCorners: this.style.roundedCorners });
            this._update();
        });

        document.getElementById("qr-error-level").addEventListener("change", e => {
            this.style.errorLevel = e.target.value;
            Settings.save({ errorLevel: this.style.errorLevel });
            this._update();
        });

        document.getElementById("qr-size").addEventListener("input", e => {
            this.style.size = +e.target.value;
            document.getElementById("qr-size-val").textContent = `${this.style.size}px`;
            Settings.save({ size: this.style.size });
            this._update();
        });

        document.getElementById("qr-margin").addEventListener("input", e => {
            this.style.margin = +e.target.value;
            document.getElementById("qr-margin-val").textContent = this.style.margin;
            Settings.save({ margin: this.style.margin });
            this._update();
        });

        document.getElementById("qr-dot-color").addEventListener("input", e => {
            this.style.dotColor = e.target.value;
            document.getElementById("qr-dot-hex").textContent = e.target.value;
            Settings.save({ dotColor: this.style.dotColor });
            this._update();
        });

        document.getElementById("qr-bg-color").addEventListener("input", e => {
            this.style.bgColor = e.target.value;
            document.getElementById("qr-bg-hex").textContent = e.target.value;
            Settings.save({ bgColor: this.style.bgColor });
            this._update();
        });

        document.getElementById("qr-bg-transparent").addEventListener("change", e => {
            this.style.bgTransparent = e.target.checked;
            Settings.save({ bgTransparent: this.style.bgTransparent });
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
            if (!this._validate(content)) return;
            window.open(`https://wa.me/?text=${encodeURIComponent(content)}`, "_blank");
        });
    }

    _content() {
        return QRTypeBuilder.build(this.type, this.fieldsByType[this.type]);
    }

    // تحقق قبل التحميل/المشاركة — يرجع true إذا كان المحتوى صالحاً
    _validate(content) {
        if (!content) {
            this.toast.show(i18n.t("errNoContent"), "warn");
            return false;
        }
        if (this.type === "link" && looksLikeIncompleteLink(content)) {
            this.toast.show(i18n.t("errIncompleteLink"), "warn");
            return false;
        }
        return true;
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

        const shapeLabelKey = SHAPES.find(([v]) => v === this.style.dotType)?.[1];

        document.getElementById("qr-stat-error").textContent = this.style.errorLevel;
        document.getElementById("qr-stat-size").textContent  = `${this.style.size}px`;
        document.getElementById("qr-stat-logo").textContent  = this.style.logo ? "✓" : "—";
        document.getElementById("qr-stat-shape").textContent = shapeLabelKey ? i18n.t(shapeLabelKey) : this.style.dotType;

        document.getElementById("qr-actions").classList.toggle("hidden", !data);

        // تنبيه التباين — الخلفية الشفافة تُعامل كأنها أبيض (أغلب الخلفيات الحقيقية فاتحة)
        const contrastWarn = document.getElementById("qr-contrast-warning");
        const effectiveBg = this.style.bgTransparent ? "#ffffff" : this.style.bgColor;
        const showContrastWarn = !!data && contrastRatio(this.style.dotColor, effectiveBg) < 3;
        contrastWarn.classList.toggle("hidden", !showContrastWarn);

        // تنبيه الشعار — فقط إذا كان هناك شعار فعلياً ومستوى تصحيح الخطأ منخفض
        // (لا حاجة للتنبيه مع Q/H لأن التصحيح العالي يستوعب تغطية الشعار بأمان)
        const logoRisksReadability = !!this.style.logo && (this.style.errorLevel === "L" || this.style.errorLevel === "M");
        document.getElementById("qr-logo-warning").classList.toggle("hidden", !logoRisksReadability);
    }

    _download(extension) {
        const data = this._content();
        if (!this._validate(data)) return;
        this.renderer.download("qr-code", extension);
        this.toast.show(i18n.t("toastDownloaded"));
    }
}

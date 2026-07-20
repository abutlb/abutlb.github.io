// ui/BatchTab.js
import { BatchExporter } from "../core/BatchExporter.js";

const SHAPES = [
    ["square", "⬛ مربعات"], ["dots", "⚫ نقاط"], ["rounded", "🔵 مدوّر"],
    ["extra-rounded", "🟣 مدوّر كامل"], ["classy", "💎 كلاسيك"], ["classy-rounded", "✨ كلاسيك مدوّر"],
];

export class BatchTab {

    constructor(containerId, toast) {
        this.container = document.getElementById(containerId);
        this.toast     = toast;
        this.items     = [];          // { content, name }[]
        this.excelRows = null;        // صفوف الإكسل الخام بعد الرفع
        this.excelCols = [];
        this.style = { dotColor: "#000000", bgColor: "#ffffff", dotType: "square", errorLevel: "M", logo: null };
        this.render();
    }

    render() {
        this.container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <div class="lg:col-span-1 space-y-5">
                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-3
                               flex items-center gap-2">
                        <i class="fas fa-list text-blue-500 text-xs"></i>قائمة المحتوى
                    </h3>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mb-2">
                        كل عنصر بين الفواصل = رمز QR واحد (روابط، نصوص، أرقام...)
                    </p>
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">الفاصل بين العناصر</label>
                    <select id="batch-delimiter" class="dm-select mb-3">
                        <option value="newline">سطر جديد</option>
                        <option value="comma">فاصلة ( , )</option>
                        <option value="semicolon">فاصلة منقوطة ( ; )</option>
                    </select>
                    <textarea id="batch-list" rows="8" placeholder="https://example.com/1&#10;https://example.com/2&#10;https://example.com/3"
                              class="dm-input resize-none font-mono text-xs" dir="ltr"></textarea>
                    <button id="batch-generate"
                        class="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                               font-bold text-sm rounded-xl transition-colors flex items-center
                               justify-center gap-2">
                        <i class="fas fa-bolt"></i>توليد المعاينة
                    </button>

                    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2
                                  uppercase tracking-wide">أو استورد من Excel / CSV</p>
                        <label class="logo-drop !p-3 block">
                            <input type="file" id="batch-excel-input" accept=".xlsx,.xls,.csv" aria-label="رفع ملف Excel">
                            <i class="fas fa-file-excel text-emerald-500 mb-1"></i>
                            <p class="text-xs font-bold text-gray-600 dark:text-gray-400">اضغط لرفع ملف</p>
                        </label>

                        <div id="batch-excel-mapping" class="hidden mt-3 space-y-2">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                               mb-1">عمود الرابط / المحتوى</label>
                                <select id="batch-col-content" class="dm-select"></select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                               mb-1">عمود اسم الملف (اختياري)</label>
                                <select id="batch-col-name" class="dm-select">
                                    <option value="">— بدون (ترقيم تلقائي) —</option>
                                </select>
                            </div>
                            <button id="batch-excel-generate"
                                class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white
                                       text-sm font-bold rounded-lg transition-colors">
                                توليد من الملف
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-3
                               flex items-center gap-2">
                        <i class="fas fa-palette text-blue-500 text-xs"></i>الشكل والألوان
                    </h3>
                    <div id="batch-shape-grid" class="grid grid-cols-2 gap-2 mb-4"></div>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">لون النقاط</label>
                    <div class="flex items-center gap-2 mb-3">
                        <span id="batch-dot-hex" class="text-xs text-gray-400 font-mono">#000000</span>
                        <input type="color" id="batch-dot-color" value="#000000"
                               class="w-8 h-8 rounded cursor-pointer border-0" aria-label="لون النقاط">
                    </div>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">مستوى تصحيح الخطأ</label>
                    <select id="batch-error-level" class="dm-select mb-3">
                        <option value="L">منخفض (L)</option>
                        <option value="M" selected>متوسط (M)</option>
                        <option value="Q">عالي (Q)</option>
                        <option value="H">مرتفع جداً (H)</option>
                    </select>

                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                   mb-1.5 uppercase tracking-wide">صيغة الملفات</label>
                    <select id="batch-format" class="dm-select mb-4">
                        <option value="png">PNG</option>
                        <option value="svg">SVG</option>
                        <option value="jpeg">JPG</option>
                    </select>

                    <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400
                                       mb-1.5 uppercase tracking-wide">الشعار (اختياري)</label>
                        <label class="logo-drop !p-3 block">
                            <input type="file" id="batch-logo-input" accept="image/*" aria-label="رفع اللوغو">
                            <i class="fas fa-image text-amber-400 mb-1"></i>
                            <p class="text-xs font-bold text-gray-600 dark:text-gray-400">اضغط لرفع اللوغو</p>
                        </label>
                        <button id="batch-logo-remove" class="hidden mt-2 w-full text-xs font-bold
                                text-red-500 hover:text-red-600 py-1">
                            <i class="fas fa-trash-alt ml-1"></i>إزالة الشعار
                        </button>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-2">
                <div class="bg-white dark:bg-gray-900 border border-gray-200
                            dark:border-gray-800 rounded-xl p-4">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-black text-gray-800 dark:text-gray-200
                                   flex items-center gap-2">
                            <i class="fas fa-th text-blue-500 text-xs"></i>
                            المعاينة (<span id="batch-count">0</span>)
                        </h3>
                        <button id="batch-download-zip" disabled
                            class="py-2 px-4 bg-emerald-600 hover:bg-emerald-700
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   text-white font-bold text-sm rounded-lg transition-colors
                                   flex items-center gap-2">
                            <i class="fas fa-file-zipper"></i>تحميل الكل كـ ZIP
                        </button>
                    </div>
                    <div id="batch-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        <div class="empty-state col-span-full">
                            <i class="fas fa-qrcode"></i>
                            <p class="text-sm">الصق قائمة أو استورد ملف Excel ثم اضغط توليد</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        this._renderShapeGrid();
        this._wire();
    }

    _renderShapeGrid() {
        const grid = document.getElementById("batch-shape-grid");
        grid.innerHTML = SHAPES.map(([v, l]) => `
            <button type="button" class="shape-btn ${v === this.style.dotType ? "active" : ""}"
                    data-shape="${v}">${l}</button>`).join("");
        grid.querySelectorAll("[data-shape]").forEach(btn => {
            btn.addEventListener("click", () => {
                this.style.dotType = btn.dataset.shape;
                grid.querySelectorAll(".shape-btn").forEach(b => b.classList.toggle("active", b === btn));
            });
        });
    }

    _wire() {
        document.getElementById("batch-dot-color").addEventListener("input", e => {
            this.style.dotColor = e.target.value;
            document.getElementById("batch-dot-hex").textContent = e.target.value;
        });

        document.getElementById("batch-error-level").addEventListener("change", e => {
            this.style.errorLevel = e.target.value;
        });

        document.getElementById("batch-generate").addEventListener("click", () => this._generateFromText());
        document.getElementById("batch-download-zip").addEventListener("click", () => this._downloadZip());

        document.getElementById("batch-excel-input").addEventListener("change", e => this._loadExcel(e.target.files?.[0]));
        document.getElementById("batch-excel-generate").addEventListener("click", () => this._generateFromExcel());

        document.getElementById("batch-logo-input").addEventListener("change", e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                this.style.logo = reader.result;
                document.getElementById("batch-logo-remove").classList.remove("hidden");
                if (this.items.length) this._renderGrid();
            };
            reader.readAsDataURL(file);
        });

        document.getElementById("batch-logo-remove").addEventListener("click", () => {
            this.style.logo = null;
            document.getElementById("batch-logo-input").value = "";
            document.getElementById("batch-logo-remove").classList.add("hidden");
            if (this.items.length) this._renderGrid();
        });
    }

    _splitItems(raw) {
        const delimiter = document.getElementById("batch-delimiter").value;
        const pattern = { newline: /\r?\n/, comma: /[,\r\n]/, semicolon: /[;\r\n]/ }[delimiter] ?? /\r?\n/;
        return raw.split(pattern).map(s => s.trim()).filter(Boolean);
    }

    _generateFromText() {
        const raw = document.getElementById("batch-list").value;
        const contents = this._splitItems(raw);
        this._setItems(contents.map(content => ({ content, name: null })));
    }

    // ── استيراد Excel / CSV ──
    async _loadExcel(file) {
        if (!file) return;
        try {
            const buf = await file.arrayBuffer();
            const wb  = XLSX.read(new Uint8Array(buf), { type: "array" });
            const ws  = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

            if (!rows.length) {
                this.toast.show("الملف فارغ أو لا يحتوي بيانات", "warn");
                return;
            }

            this.excelRows = rows;
            this.excelCols = Object.keys(rows[0]);

            const contentSel = document.getElementById("batch-col-content");
            const nameSel    = document.getElementById("batch-col-name");
            contentSel.innerHTML = this.excelCols.map(c => `<option value="${c}">${c}</option>`).join("");
            nameSel.innerHTML = `<option value="">— بدون (ترقيم تلقائي) —</option>` +
                this.excelCols.map(c => `<option value="${c}">${c}</option>`).join("");

            // تخمين عمود المحتوى تلقائياً (رابط/link/url) إن وُجد
            const guess = this.excelCols.find(c => /رابط|link|url|content|محتوى/i.test(c));
            if (guess) contentSel.value = guess;
            const nameGuess = this.excelCols.find(c => /اسم|name|filename|ملف/i.test(c));
            if (nameGuess) nameSel.value = nameGuess;

            document.getElementById("batch-excel-mapping").classList.remove("hidden");
            this.toast.show(`تم تحميل ${rows.length} صف — حدّد الأعمدة ثم اضغط توليد`);
        } catch (e) {
            this.toast.show(`خطأ في قراءة الملف: ${e.message}`, "error");
        }
    }

    _generateFromExcel() {
        if (!this.excelRows) return;
        const contentCol = document.getElementById("batch-col-content").value;
        const nameCol     = document.getElementById("batch-col-name").value;

        const items = this.excelRows
            .map(row => ({
                content: String(row[contentCol] ?? "").trim(),
                name: nameCol ? String(row[nameCol] ?? "").trim() || null : null,
            }))
            .filter(it => it.content);

        if (!items.length) {
            this.toast.show("لا توجد قيم صالحة في عمود المحتوى المختار", "warn");
            return;
        }
        this._setItems(items);
    }

    // ── مشترك بين مصدري الإدخال ──
    _setItems(items) {
        this.items = items;
        document.getElementById("batch-count").textContent = this.items.length;
        const zipBtn = document.getElementById("batch-download-zip");

        if (!this.items.length) {
            document.getElementById("batch-grid").innerHTML = `
                <div class="empty-state col-span-full">
                    <i class="fas fa-qrcode"></i>
                    <p class="text-sm">الصق قائمة أو استورد ملف Excel ثم اضغط توليد</p>
                </div>`;
            zipBtn.disabled = true;
            return;
        }

        this._renderGrid();
        zipBtn.disabled = false;
        this.toast.show(`تم توليد ${this.items.length} رمز`);
    }

    _renderGrid() {
        const grid = document.getElementById("batch-grid");
        grid.innerHTML = this.items.map((_, i) => `<div class="batch-item" id="batch-item-${i}"></div>`).join("");

        this.items.forEach((item, i) => {
            const el = document.getElementById(`batch-item-${i}`);
            const qr = new QRCodeStyling({
                width: 160, height: 160, data: item.content, margin: 4,
                qrOptions: { errorCorrectionLevel: this.style.errorLevel },
                dotsOptions: { color: this.style.dotColor, type: this.style.dotType },
                backgroundOptions: { color: "#ffffff" },
                image: this.style.logo || undefined,
                imageOptions: { crossOrigin: "anonymous", imageSize: 0.4, margin: 4, hideBackgroundDots: true },
            });
            qr.append(el);
            const p = document.createElement("p");
            p.textContent = item.name || item.content;
            p.title = item.name || item.content;
            el.appendChild(p);
        });
    }

    async _downloadZip() {
        if (!this.items.length) return;
        const format = document.getElementById("batch-format").value;
        const btn = document.getElementById("batch-download-zip");
        const origHTML = btn.innerHTML;
        btn.disabled = true;

        const baseOptions = {
            width: 512, height: 512, margin: 4,
            qrOptions: { errorCorrectionLevel: this.style.errorLevel },
            dotsOptions: { color: this.style.dotColor, type: this.style.dotType },
            backgroundOptions: { color: "#ffffff" },
            image: this.style.logo || undefined,
            imageOptions: { crossOrigin: "anonymous", imageSize: 0.4, margin: 4, hideBackgroundDots: true },
        };

        try {
            await BatchExporter.exportZip(this.items, baseOptions, format, (done, total) => {
                btn.innerHTML = `<div class="spinner"></div><span>جاري التحميل ${done}/${total}...</span>`;
            });
            this.toast.show(`تم تحميل ${this.items.length} رمز داخل ملف ZIP`);
        } catch (e) {
            this.toast.show(`خطأ في التصدير: ${e.message}`, "error");
        }

        btn.innerHTML = origHTML;
        btn.disabled = false;
    }
}

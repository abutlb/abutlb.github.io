// ui/CleanerTab.js
import { CleaningEngine } from "../core/CleaningEngine.js";
import { SmartFiller }    from "../cleaning/SmartFiller.js";
import { DAMAEngine }     from "../core/DAMAEngine.js";
import { ProfilerEngine } from "../core/ProfilerEngine.js";

export class CleanerTab {

    constructor(containerId, store) {
        this.container = document.getElementById(containerId);
        this.store     = store;
        this.engine    = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6">

            <!-- ── يسار: خيارات التنظيف ── -->
            <div class="md:w-1/3 space-y-4">

                <!-- التنظيف التلقائي -->
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                        <i class="fas fa-magic ml-2"></i>تنظيف تلقائي ذكي
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        يحلل البيانات ويطبق أفضل استراتيجية تنظيف تلقائياً
                    </p>
                    <button id="auto-clean-btn"
                        class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700
                               text-white font-medium rounded-lg transition">
                        <i class="fas fa-robot ml-2"></i>تنظيف تلقائي
                    </button>
                </div>

                <!-- توصيات ذكية لكل عمود -->
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                        <i class="fas fa-lightbulb ml-2"></i>توصيات ذكية
                    </h3>
                    <div id="smart-recommendations" class="space-y-2">
                        ${this._renderRecommendations()}
                    </div>
                </div>

                <!-- خيارات يدوية -->
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                        <i class="fas fa-sliders-h ml-2"></i>تنظيف يدوي
                    </h3>

                    <div class="space-y-3">
                        <!-- اختيار العمود -->
                        <div>
                            <label class="block text-sm font-medium
                                          text-gray-700 dark:text-gray-300 mb-1">
                                العمود
                            </label>
                            <select id="clean-column"
                                class="w-full p-2 border rounded-md bg-white
                                       dark:bg-gray-700 text-gray-700
                                       dark:text-gray-300">
                                ${this.store.columns.map(c =>
                                    `<option value="${c}">${c}</option>`
                                ).join("")}
                            </select>
                        </div>

                        <!-- العملية -->
                        <div>
                            <label class="block text-sm font-medium
                                          text-gray-700 dark:text-gray-300 mb-1">
                                العملية
                            </label>
                            <select id="clean-operation"
                                class="w-full p-2 border rounded-md bg-white
                                       dark:bg-gray-700 text-gray-700
                                       dark:text-gray-300">
                                <option value="fill_mean">ملء بالمتوسط</option>
                                <option value="fill_median">ملء بالوسيط</option>
                                <option value="fill_mode">ملء بالأكثر تكراراً</option>
                                <option value="fill_constant">ملء بقيمة ثابتة</option>
                                <option value="forward_fill">Forward Fill</option>
                                <option value="drop_rows">حذف الصفوف الفارغة</option>
                                <option value="outlier_cap">تحديد القيم المتطرفة</option>
                                <option value="outlier_remove">إزالة القيم المتطرفة</option>
                                <option value="normalize_text">توحيد النصوص</option>
                                <option value="normalize_dates">توحيد التواريخ</option>
                                <option value="normalize_phones">توحيد الجوال</option>
                                <option value="fix_encoding">إصلاح الترميز</option>
                            </select>
                        </div>

                        <!-- قيمة ثابتة (تظهر عند الحاجة) -->
                        <div id="constant-val-container" class="hidden">
                            <input type="text" id="constant-val"
                                placeholder="القيمة الثابتة"
                                class="w-full p-2 border rounded-md bg-white
                                       dark:bg-gray-700 text-gray-700
                                       dark:text-gray-300">
                        </div>

                        <button id="apply-clean-btn"
                            class="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700
                                   text-white font-medium rounded-lg transition">
                            <i class="fas fa-play ml-2"></i>تطبيق
                        </button>
                    </div>
                </div>

                <!-- إزالة التكرار -->
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                        <i class="fas fa-copy ml-2"></i>إزالة التكرار
                    </h3>
                    <button id="dedup-btn"
                        class="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700
                               text-white font-medium rounded-lg transition">
                        <i class="fas fa-trash-alt ml-2"></i>إزالة الصفوف المكررة
                    </button>
                </div>

                <!-- تصدير -->
                <button id="export-cleaned-btn"
                    class="w-full py-3 px-4 bg-green-600 hover:bg-green-700
                           text-white font-bold rounded-lg transition
                           disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    <i class="fas fa-file-export ml-2"></i>تصدير البيانات المنظفة
                </button>
            </div>

            <!-- ── يمين: المعاينة والنتائج ── -->
            <div class="md:w-2/3 space-y-4">

                <!-- مقارنة قبل/بعد -->
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400">
                            <i class="fas fa-exchange-alt ml-2"></i>معاينة البيانات
                        </h3>
                        <div class="flex gap-2">
                            <button id="view-original-btn"
                                class="py-1 px-3 text-sm bg-blue-100 text-blue-700
                                       dark:bg-blue-900 dark:text-blue-300
                                       rounded-lg font-medium">
                                الأصلية
                            </button>
                            <button id="view-cleaned-btn"
                                class="py-1 px-3 text-sm bg-gray-200 text-gray-600
                                       dark:bg-gray-600 dark:text-gray-300
                                       rounded-lg font-medium">
                                المنظفة
                            </button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-white dark:bg-gray-700
                                      rounded-lg overflow-hidden text-sm">
                            <thead id="preview-head"
                                class="bg-gray-100 dark:bg-gray-600"></thead>
                            <tbody id="preview-body"
                                class="divide-y divide-gray-200
                                       dark:divide-gray-600"></tbody>
                        </table>
                    </div>
                </div>

                <!-- سجل التعديلات -->
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400">
                            <i class="fas fa-history ml-2"></i>سجل التعديلات
                        </h3>
                        <button id="export-audit-btn"
                            class="text-sm py-1 px-3 bg-gray-200 dark:bg-gray-600
                                   text-gray-700 dark:text-gray-300
                                   rounded-lg hover:bg-gray-300 transition">
                            <i class="fas fa-download ml-1"></i>تصدير السجل
                        </button>
                    </div>
                    <div id="audit-log-list" class="space-y-2 max-h-60 overflow-y-auto">
                        <p class="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                            لا توجد تعديلات بعد
                        </p>
                    </div>
                </div>

                <!-- مقارنة الجودة قبل/بعد -->
                <div id="quality-comparison" class="hidden bg-gray-50
                     dark:bg-gray-800 p-4 rounded-lg">
                    <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                        <i class="fas fa-chart-bar ml-2"></i>تحسن الجودة
                    </h3>
                    <div class="grid grid-cols-2 gap-4" id="quality-compare-grid"></div>
                </div>
            </div>
        </div>`;

        this._initEngine();
        this._bindEvents();
        this._renderPreview("original");
    }

    _initEngine() {
        this.engine = new CleaningEngine(this.store);
    }

    _renderRecommendations() {
        if (!this.store.profileResults) {
            return `<p class="text-gray-500 text-sm">قم بتحليل البيانات أولاً</p>`;
        }

        return this.store.columns.map(col => {
            const profile = this.store.profileResults[col];
            if (!profile || profile.emptyPct === 0) return "";

            const rec = SmartFiller.recommend(profile);
            const riskColor = {
                "منخفض"  : "text-green-600 dark:text-green-400",
                "متوسط"  : "text-yellow-600 dark:text-yellow-400",
                "عالٍ"   : "text-red-600 dark:text-red-400"
            }[rec.risk] || "text-gray-600";

            return `
            <div class="p-3 bg-white dark:bg-gray-700 rounded-lg border
                        border-gray-200 dark:border-gray-600">
                <div class="flex justify-between items-start mb-1">
                    <span class="text-sm font-medium text-gray-700
                                 dark:text-gray-300">${col}</span>
                    <span class="text-xs ${riskColor} font-medium">
                        خطر ${rec.risk}
                    </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    ${rec.reason}
                </p>
                <button onclick="cleanerTab.applyRecommendation('${col}', '${rec.method}')"
                    class="text-xs py-1 px-2 bg-blue-600 text-white
                           rounded hover:bg-blue-700 transition">
                    تطبيق: ${rec.method}
                </button>
            </div>`;
        }).filter(Boolean).join("") ||
        `<p class="text-green-600 dark:text-green-400 text-sm text-center py-2">
            ✅ لا توجد قيم مفقودة
        </p>`;
    }

    applyRecommendation(column, method) {
        this.engine.fillMissing(column, method);
        this._updateUI();
    }

    _bindEvents() {
        // تنظيف تلقائي
        document.getElementById("auto-clean-btn")
            ?.addEventListener("click", () => {
                const result = this.engine.autoCleanAll(this.store.profileResults);
                this._updateUI();
                this._showAutoCleanSummary(result);
            });

        // تطبيق يدوي
        document.getElementById("apply-clean-btn")
            ?.addEventListener("click", () => this._applyManual());

        // إزالة تكرار
        document.getElementById("dedup-btn")
            ?.addEventListener("click", () => {
                this.engine.removeDuplicates();
                this._updateUI();
            });

        // تبديل العرض
        document.getElementById("view-original-btn")
            ?.addEventListener("click", () => this._renderPreview("original"));
        document.getElementById("view-cleaned-btn")
            ?.addEventListener("click", () => this._renderPreview("cleaned"));

        // إظهار حقل القيمة الثابتة
        document.getElementById("clean-operation")
            ?.addEventListener("change", (e) => {
                const show = e.target.value === "fill_constant";
                document.getElementById("constant-val-container")
                    .classList.toggle("hidden", !show);
            });

        // تصدير
        document.getElementById("export-cleaned-btn")
            ?.addEventListener("click", () => this._exportCleaned());

        document.getElementById("export-audit-btn")
            ?.addEventListener("click", () => this._exportAudit());
    }

    _applyManual() {
        const column    = document.getElementById("clean-column").value;
        const operation = document.getElementById("clean-operation").value;

        const opMap = {
            fill_mean      : () => this.engine.fillMissing(column, "mean"),
            fill_median    : () => this.engine.fillMissing(column, "median"),
            fill_mode      : () => this.engine.fillMissing(column, "mode"),
            fill_constant  : () => this.engine.fillMissing(column, "constant", {
                value: document.getElementById("constant-val").value
            }),
            forward_fill   : () => this.engine.fillMissing(column, "forward_fill"),
            drop_rows      : () => this.engine.fillMissing(column, "drop_rows"),
            outlier_cap    : () => this.engine.handleOutliers(column, "cap"),
            outlier_remove : () => this.engine.handleOutliers(column, "remove"),
            normalize_text : () => this.engine.normalizeText(column),
            normalize_dates: () => this.engine.normalizeDates(column),
            normalize_phones: () => this.engine.normalizePhones(column),
            fix_encoding   : () => this.engine.fixEncoding(column)
        };

        opMap[operation]?.();
        this._updateUI();
    }

    _updateUI() {
        const result = this.engine.getResult();

        // تحديث المعاينة
        this._renderPreview("cleaned");

        // تحديث سجل التعديلات
        this._renderAuditLog(result.auditLog);

        // تفعيل زر التصدير
        document.getElementById("export-cleaned-btn").disabled = false;

        // مقارنة الجودة
        this._renderQualityComparison(result.data, result.columns);
    }

    _renderPreview(mode) {
        const data    = mode === "original"
            ? this.store.originalData
            : this.engine?.data || this.store.originalData;
        const columns = mode === "original"
            ? this.store.columns
            : this.engine?.columns || this.store.columns;

        const head = document.getElementById("preview-head");
        const body = document.getElementById("preview-body");
        if (!head || !body) return;

        head.innerHTML = `<tr class="text-right">
            ${columns.map(c => `
                <th class="py-2 px-3 text-xs font-medium
                            text-gray-700 dark:text-gray-300">
                    ${c}
                </th>`).join("")}
        </tr>`;

        body.innerHTML = data.slice(0, 10).map(row => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-600 text-right">
                ${columns.map(col => `
                    <td class="py-2 px-3 text-xs text-gray-600 dark:text-gray-400">
                        ${row[col] ?? ""}
                    </td>`).join("")}
            </tr>`).join("");

        // تحديث أزرار التبديل
        document.getElementById("view-original-btn")
            ?.classList.toggle("bg-blue-100", mode === "original");
        document.getElementById("view-cleaned-btn")
            ?.classList.toggle("bg-blue-100", mode === "cleaned");
    }

    _renderAuditLog(summary) {
        const list = document.getElementById("audit-log-list");
        if (!list || summary.totalActions === 0) return;

        list.innerHTML = summary.entries.slice().reverse().map(e => `
            <div class="flex items-start gap-3 p-2 bg-white dark:bg-gray-700
                        rounded-lg text-xs">
                <span class="text-gray-400 whitespace-nowrap">
                    ${new Date(e.timestamp).toLocaleTimeString("ar-SA")}
                </span>
                <span class="flex-1 text-gray-700 dark:text-gray-300">
                    ${e.description}
                </span>
                <span class="text-blue-600 dark:text-blue-400 font-medium
                             whitespace-nowrap">
                    ${e.affected} صف
                </span>
            </div>`).join("");
    }

    _renderQualityComparison(cleanedData, cleanedColumns) {
        const container = document.getElementById("quality-comparison");
        const grid      = document.getElementById("quality-compare-grid");
        if (!container || !grid) return;

        const originalDama = this.store.damaResults;
        if (!originalDama) return;

        // إعادة حساب DAMA على البيانات المنظفة
        const cleanedProfile = ProfilerEngine.profile(cleanedData, cleanedColumns);
        const cleanedDama    = DAMAEngine.evaluate(cleanedData, cleanedColumns, cleanedProfile);

        container.classList.remove("hidden");

        const dims = ["completeness", "validity", "consistency",
                      "accuracy", "timeliness", "uniqueness", "integrity"];

        grid.innerHTML = dims.map(dim => {
            const before = originalDama.dimensions[dim]?.score || 0;
            const after  = cleanedDama.dimensions[dim]?.score  || 0;
            const diff   = after - before;
            const arrow  = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
            const color  = diff > 0
                ? "text-green-600 dark:text-green-400"
                : diff < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400";

            const dimNames = {
                completeness : "الاكتمال",
                validity     : "الصلاحية",
                consistency  : "التناسق",
                accuracy     : "الدقة",
                timeliness   : "الحداثة",
                uniqueness   : "التفرد",
                integrity    : "السلامة"
            };

            return `
            <div class="bg-white dark:bg-gray-700 p-3 rounded-lg">
                <p class="text-xs font-medium text-gray-600
                           dark:text-gray-400 mb-2">
                    ${dimNames[dim]}
                </p>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                        ${before}%
                    </span>
                    <span class="text-lg font-bold ${color}">
                        ${arrow} ${Math.abs(diff).toFixed(1)}%
                    </span>
                    <span class="text-sm font-bold
                        ${after >= 80
                            ? "text-green-600 dark:text-green-400"
                            : after >= 60
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"}">
                        ${after}%
                    </span>
                </div>
                <!-- شريط التقدم -->
                <div class="mt-2 relative h-2 bg-gray-200
                             dark:bg-gray-600 rounded-full overflow-hidden">
                    <!-- قبل -->
                    <div class="absolute h-2 bg-gray-400 dark:bg-gray-500
                                rounded-full opacity-40"
                         style="width: ${before}%">
                    </div>
                    <!-- بعد -->
                    <div class="absolute h-2 rounded-full transition-all duration-700
                        ${after >= 80 ? "bg-green-500"
                            : after >= 60 ? "bg-yellow-500"
                            : "bg-red-500"}"
                         style="width: ${after}%">
                    </div>
                </div>
            </div>`;
        }).join("");

        // ── الدرجة الكلية قبل/بعد ───────────────────────────────
        const overallBefore = originalDama.overall;
        const overallAfter  = cleanedDama.overall;
        const overallDiff   = overallAfter - overallBefore;

        grid.insertAdjacentHTML("afterend", `
            <div class="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg
                        border-2 border-blue-200 dark:border-blue-800">
                <div class="flex items-center justify-between">
                    <div class="text-center">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            الجودة قبل التنظيف
                        </p>
                        <p class="text-3xl font-bold text-gray-700
                                   dark:text-gray-300">
                            ${overallBefore}
                        </p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold
                            ${overallDiff >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"}">
                            ${overallDiff >= 0 ? "+" : ""}${overallDiff.toFixed(1)}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            التغيير
                        </p>
                    </div>
                    <div class="text-center">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            الجودة بعد التنظيف
                        </p>
                        <p class="text-3xl font-bold
                            ${overallAfter >= 80
                                ? "text-green-600 dark:text-green-400"
                                : overallAfter >= 60
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-red-600 dark:text-red-400"}">
                            ${overallAfter}
                        </p>
                    </div>
                </div>
            </div>
        `);

        // حفظ النتائج الجديدة في الـ store
        this.store.cleanedData   = cleanedData;
        this.store.cleanedDama   = cleanedDama;
    }

    // ── تصدير البيانات المنظفة ───────────────────────────────────
    _exportCleaned() {
        const result  = this.engine.getResult();
        const data    = result.data;
        const columns = result.columns;

        // بناء CSV
        const rows = [
            columns,
            ...data.map(row => columns.map(c => row[c] ?? ""))
        ];

        const csv = rows
            .map(r =>
                r.map(cell =>
                    `"${String(cell ?? "").replace(/"/g, '""')}"`
                ).join(",")
            )
            .join("\n");

        // BOM لدعم العربية في Excel
        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });
        const url = URL.createObjectURL(blob);
        const a   = Object.assign(document.createElement("a"), {
            href     : url,
            download : `cleaned_${this.store.metadata?.fileName || "data"}`
                       + `_${new Date().toISOString().slice(0,10)}.csv`
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ── تصدير سجل التعديلات ─────────────────────────────────────
    _exportAudit() {
        const csv  = this.engine.auditLog.toCSV();
        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });
        const url = URL.createObjectURL(blob);
        const a   = Object.assign(document.createElement("a"), {
            href     : url,
            download : `audit_log_${new Date().toISOString().slice(0,10)}.csv`
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ── ملخص التنظيف التلقائي ────────────────────────────────────
    _showAutoCleanSummary(result) {
        if (result.actions.length === 0) {
            alert("✅ البيانات نظيفة — لم تكن هناك حاجة لأي تعديل");
            return;
        }

        const msg = [
            `✅ اكتمل التنظيف التلقائي`,
            ``,
            `الإجراءات المنفذة (${result.actions.length}):`,
            ...result.actions.map(a => `• ${a}`),
            ``,
            `إجمالي الخلايا المعدلة: ${result.auditLog.totalAffected}`
        ].join("\n");

        alert(msg);
    }
}


// ui/ReportTab.js
import { ReportEngine } from "../core/ReportEngine.js";

export class ReportTab {

    constructor(containerId, store) {
        this.container = document.getElementById(containerId);
        this.store     = store;
        this.engine    = new ReportEngine(store);
        this.render();
    }

    render() {
        this.container.innerHTML = `
        <div class="space-y-6">

            <!-- معاينة سريعة -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                    <i class="fas fa-eye ml-2"></i>معاينة التقرير
                </h3>

                <!-- بطاقات الملخص -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    ${this._summaryCards()}
                </div>

                <!-- أبعاد DAMA -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    ${this._damaCards()}
                </div>

                <!-- زر المعاينة الكاملة -->
                <button id="preview-report-btn"
                    class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700
                           text-white font-bold rounded-lg transition">
                    <i class="fas fa-external-link-alt ml-2"></i>
                    معاينة التقرير الكامل في نافذة جديدة
                </button>
            </div>

            <!-- خيارات التصدير -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                    <i class="fas fa-file-export ml-2"></i>تصدير التقرير
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <!-- HTML -->
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg
                                border border-gray-200 dark:border-gray-600">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900
                                        rounded-lg flex items-center justify-center">
                                <i class="fas fa-file-code text-orange-600
                                          dark:text-orange-400 text-lg"></i>
                            </div>
                            <div>
                                <p class="font-bold text-gray-700 dark:text-gray-300">
                                    HTML
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    تقرير تفاعلي كامل
                                </p>
                            </div>
                        </div>
                        <button id="export-html-btn"
                            class="w-full py-2 px-3 bg-orange-600 hover:bg-orange-700
                                   text-white text-sm font-medium rounded-lg transition">
                            <i class="fas fa-download ml-1"></i>تحميل HTML
                        </button>
                    </div>

                    <!-- PDF -->
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg
                                border border-gray-200 dark:border-gray-600">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 bg-red-100 dark:bg-red-900
                                        rounded-lg flex items-center justify-center">
                                <i class="fas fa-file-pdf text-red-600
                                          dark:text-red-400 text-lg"></i>
                            </div>
                            <div>
                                <p class="font-bold text-gray-700 dark:text-gray-300">
                                    PDF
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    طباعة أو حفظ كـ PDF
                                </p>
                            </div>
                        </div>
                        <button id="export-pdf-btn"
                            class="w-full py-2 px-3 bg-red-600 hover:bg-red-700
                                   text-white text-sm font-medium rounded-lg transition">
                            <i class="fas fa-print ml-1"></i>طباعة / PDF
                        </button>
                    </div>

                    <!-- Excel -->
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg
                                border border-gray-200 dark:border-gray-600">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 bg-green-100 dark:bg-green-900
                                        rounded-lg flex items-center justify-center">
                                <i class="fas fa-file-excel text-green-600
                                          dark:text-green-400 text-lg"></i>
                            </div>
                            <div>
                                <p class="font-bold text-gray-700 dark:text-gray-300">
                                    Excel
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    6 أوراق — بيانات + تحليل + قواعد
                                </p>
                            </div>
                        </div>
                        <button id="export-excel-btn"
                            class="w-full py-2 px-3 bg-green-600 hover:bg-green-700
                                   text-white text-sm font-medium rounded-lg transition">
                            <i class="fas fa-download ml-1"></i>تحميل Excel
                        </button>
                    </div>
                </div>

                <!-- تصدير الكل -->
                <button id="export-all-btn"
                    class="mt-4 w-full py-3 px-4 bg-purple-600 hover:bg-purple-700
                           text-white font-bold rounded-lg transition">
                    <i class="fas fa-layer-group ml-2"></i>
                    تصدير الكل دفعة واحدة (HTML + Excel)
                </button>
            </div>

            <!-- محتوى التقرير المضمّن -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                    <i class="fas fa-list-alt ml-2"></i>محتويات التقرير
                </h3>
                <div class="space-y-2">
                    ${this._reportContents()}
                </div>
            </div>

        </div>`;

        this._bindEvents();
    }

    // ── بطاقات الملخص ────────────────────────────────────────────
    _summaryCards() {
        const dama  = this.store.damaResults;
        const meta  = this.store.metadata || {};
        const prof  = this.store.profileResults;

        const overall   = dama?.overall ?? "—";
        const grade     = dama?.grade?.label || "—";
        const gradeIcon = dama?.grade?.icon  || "";
        const dupRows   = prof?.__dataset__?.duplicateRows ?? 0;
        const emptyPct  = prof?.__dataset__
            ? ((prof.__dataset__.totalEmpty /
                prof.__dataset__.totalCells) * 100).toFixed(1)
            : "0";

        const scoreColor =
            overall >= 80 ? "text-green-600 dark:text-green-400" :
            overall >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                            "text-red-600 dark:text-red-400";

        return `
        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
            <p class="text-3xl font-black ${scoreColor}">${overall}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                درجة الجودة
            </p>
        </div>
        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold text-gray-700 dark:text-gray-300">
                ${gradeIcon} ${grade}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                التقييم
            </p>
        </div>
        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
            <p class="text-3xl font-black
                ${parseFloat(emptyPct) <= 5
                    ? "text-green-600 dark:text-green-400"
                    : parseFloat(emptyPct) <= 20
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"}">
                ${emptyPct}%
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                قيم مفقودة
            </p>
        </div>
        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
            <p class="text-3xl font-black
                ${dupRows === 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"}">
                ${dupRows}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                صفوف مكررة
            </p>
        </div>`;
    }

    // ── بطاقات DAMA ──────────────────────────────────────────────
    _damaCards() {
        const dama = this.store.damaResults;
        if (!dama?.dimensions) {
            return `<p class="text-gray-500 dark:text-gray-400 text-sm col-span-4
                              text-center py-2">
                        قم بتشغيل التحليل أولاً
                    </p>`;
        }

        const dimNames = {
            completeness : "الاكتمال",
            validity     : "الصلاحية",
            consistency  : "التناسق",
            accuracy     : "الدقة",
            timeliness   : "الحداثة",
            uniqueness   : "التفرد",
            integrity    : "السلامة"
        };

        return Object.entries(dama.dimensions).map(([key, dim]) => {
            const color =
                dim.score >= 80 ? "green" :
                dim.score >= 60 ? "yellow" :
                                  "red";

            const colorClasses = {
                green  : {
                    text : "text-green-600 dark:text-green-400",
                    bar  : "bg-green-500",
                    bg   : "bg-green-50 dark:bg-green-900/20"
                },
                yellow : {
                    text : "text-yellow-600 dark:text-yellow-400",
                    bar  : "bg-yellow-500",
                    bg   : "bg-yellow-50 dark:bg-yellow-900/20"
                },
                red    : {
                    text : "text-red-600 dark:text-red-400",
                    bar  : "bg-red-500",
                    bg   : "bg-red-50 dark:bg-red-900/20"
                }
            }[color];

            return `
            <div class="bg-white dark:bg-gray-700 p-3 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-medium text-gray-600
                                 dark:text-gray-400">
                        ${dimNames[key] || key}
                    </span>
                    <span class="text-sm font-black ${colorClasses.text}">
                        ${dim.score}%
                    </span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-600
                            rounded-full h-1.5">
                    <div class="h-1.5 rounded-full ${colorClasses.bar}
                                transition-all duration-700"
                         style="width: ${dim.score}%">
                    </div>
                </div>
            </div>`;
        }).join("");
    }

    // ── محتويات التقرير ──────────────────────────────────────────
    _reportContents() {
        const dama    = this.store.damaResults;
        const rules   = this.store.ruleResults;
        const cleaned = this.store.cleanedData;
        const audit   = this.store.auditLog;

        const sections = [
            {
                icon    : "fas fa-file-alt",
                title   : "الملخص التنفيذي",
                desc    : "نظرة عامة على جودة البيانات",
                included: true
            },
            {
                icon    : "fas fa-chart-pie",
                title   : "درجة الجودة الكلية",
                desc    : `${dama?.overall ?? "—"}/100 — ${dama?.grade?.label || "—"}`,
                included: !!dama
            },
            {
                icon    : "fas fa-ruler-combined",
                title   : "أبعاد DAMA السبعة",
                desc    : "تفصيل كل بُعد مع الدرجة والتفاصيل",
                included: !!dama?.dimensions
            },
            {
                icon    : "fas fa-chart-bar",
                title   : "الرسوم البيانية",
                desc    : "Gauge + Bar + Donut + Null Heatmap",
                included: !!dama
            },
            {
                icon    : "fas fa-table",
                title   : "تحليل الأعمدة",
                desc    : `${this.store.columns?.length || 0} عمود — نوع، اكتمال، cardinality`,
                included: !!this.store.profileResults
            },
            {
                icon    : "fas fa-check-double",
                title   : "نتائج قواعد الجودة",
                desc    : rules
                    ? `${rules.total} قاعدة — ${rules.passed} نجح / ${rules.failed} فشل`
                    : "لم يتم تشغيل قواعد",
                included: !!rules
            },
            {
                icon    : "fas fa-lightbulb",
                title   : "التوصيات",
                desc    : `${dama?.recommendations?.length || 0} توصية مرتبة بالأولوية`,
                included: (dama?.recommendations?.length || 0) > 0
            },
            {
                icon    : "fas fa-history",
                title   : "سجل التعديلات",
                desc    : audit?.entries?.length > 0
                    ? `${audit.entries.length} إجراء تنظيف`
                    : "لم يتم تنظيف البيانات",
                included: (audit?.entries?.length || 0) > 0
            }
        ];

        return sections.map(s => `
        <div class="flex items-center gap-3 p-3 bg-white dark:bg-gray-700
                    rounded-lg border border-gray-200 dark:border-gray-600">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center
                ${s.included
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-gray-100 dark:bg-gray-600"}">
                <i class="${s.icon} text-sm
                    ${s.included
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400"}">
                </i>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ${s.title}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    ${s.desc}
                </p>
            </div>
            <span class="text-xs font-medium px-2 py-1 rounded-full
                ${s.included
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400"}">
                ${s.included ? "✅ مضمّن" : "⬜ غير متاح"}
            </span>
        </div>`).join("");
    }

    // ── ربط الأحداث ──────────────────────────────────────────────
    _bindEvents() {
        document.getElementById("preview-report-btn")
            ?.addEventListener("click", () => {
                this.engine.preview();
            });

        document.getElementById("export-html-btn")
            ?.addEventListener("click", () => {
                this.engine.exportHTML();
                this._showToast("✅ تم تحميل تقرير HTML");
            });

        document.getElementById("export-pdf-btn")
            ?.addEventListener("click", () => {
                this.engine.exportPDF();
                this._showToast("🖨️ جاري فتح نافذة الطباعة...");
            });

        document.getElementById("export-excel-btn")
            ?.addEventListener("click", () => {
                this.engine.exportExcel();
                this._showToast("✅ تم تحميل ملف Excel");
            });

        document.getElementById("export-all-btn")
            ?.addEventListener("click", () => {
                this.engine.exportAll();
                this._showToast("✅ جاري تصدير الكل...");
            });
    }

    // ── Toast Notification ────────────────────────────────────────
    _showToast(message) {
        const toast = document.createElement("div");
        toast.className = `
            fixed bottom-6 left-1/2 -translate-x-1/2
            bg-gray-900 text-white text-sm font-medium
            px-5 py-3 rounded-xl shadow-lg z-50
            transition-all duration-300 opacity-0
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        // ظهور
        requestAnimationFrame(() => {
            toast.classList.remove("opacity-0");
            toast.classList.add("opacity-100");
        });

        // اختفاء بعد 3 ثوانٍ
        setTimeout(() => {
            toast.classList.remove("opacity-100");
            toast.classList.add("opacity-0");
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
}


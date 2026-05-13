// app.js — النسخة النهائية
import { CSVParser }      from "./parsers/CSVParser.js";
import { JSONParser }     from "./parsers/JSONParser.js";
import { ExcelParser }    from "./parsers/ExcelParser.js";
import { DataStore }      from "./core/DataStore.js";
import { ProfilerEngine } from "./core/ProfilerEngine.js";
import { DAMAEngine }     from "./core/DAMAEngine.js";
import { RuleBuilderUI }  from "./ui/RuleBuilderUI.js";
import { CleanerTab }     from "./ui/CleanerTab.js";
import { ReportTab }      from "./ui/ReportTab.js";

// ── Instance واحد يعيش طول عمر التطبيق ─────────────────────
const store = new DataStore();

// ══════════════════════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════════════════════
document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.getElementById("theme-icon").className =
        isDark
            ? "fas fa-sun text-yellow-400 text-sm"
            : "fas fa-moon text-gray-600 text-sm";
});

// ══════════════════════════════════════════════════════════════
//  TAB NAVIGATION
// ══════════════════════════════════════════════════════════════
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

function switchTab(tabId) {
    // إخفاء كل المحتويات
    document.querySelectorAll(".tab-content")
        .forEach(el => el.classList.add("hidden"));

    // إزالة active من كل الأزرار
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove(
            "active", "text-blue-600", "dark:text-blue-400",
            "border-blue-600", "dark:border-blue-400",
            "bg-white", "dark:bg-gray-900"
        );
        btn.classList.add(
            "text-gray-500", "dark:text-gray-400",
            "border-transparent"
        );
    });

    // إظهار المحتوى المطلوب
    const content = document.getElementById(`tab-${tabId}`);
    content?.classList.remove("hidden");
    content?.classList.add("fade-in");

    // تفعيل الزر
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add(
            "active", "text-blue-600", "dark:text-blue-400",
            "border-blue-600", "dark:border-blue-400",
            "bg-white", "dark:bg-gray-900"
        );
        activeBtn.classList.remove(
            "text-gray-500", "dark:text-gray-400",
            "border-transparent"
        );
    }
}

// ══════════════════════════════════════════════════════════════
//  DRAG & DROP
// ══════════════════════════════════════════════════════════════
const dropZone = document.getElementById("drop-zone");

["dragenter", "dragover"].forEach(evt => {
    dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.add("drop-zone-active");
        document.getElementById("drop-zone-dragging")
            .classList.remove("hidden");
    });
});

["dragleave", "drop"].forEach(evt => {
    dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.remove("drop-zone-active");
        document.getElementById("drop-zone-dragging")
            .classList.add("hidden");
    });
});

dropZone.addEventListener("drop", e => {
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
});

// ══════════════════════════════════════════════════════════════
//  FILE INPUT
// ══════════════════════════════════════════════════════════════
document.getElementById("data-upload")
    .addEventListener("change", e => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    });

document.getElementById("new-file-btn")
    .addEventListener("click", () => {
        document.getElementById("main-app")
            .classList.add("hidden");
        document.getElementById("upload-screen")
            .classList.remove("hidden");
        document.getElementById("new-file-btn")
            .classList.add("hidden");
        // reset input
        document.getElementById("data-upload").value = "";
    });

// ══════════════════════════════════════════════════════════════
//  HANDLE FILE
// ══════════════════════════════════════════════════════════════
async function handleFile(file) {
    // التحقق من الحجم (50MB)
    if (file.size > 50 * 1024 * 1024) {
        showError("حجم الملف يتجاوز 50MB — يرجى استخدام ملف أصغر");
        return;
    }

    // التحقق من الامتداد
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "json", "xlsx", "xls"].includes(ext)) {
        showError(`الصيغة .${ext} غير مدعومة — يُقبل: CSV، JSON، Excel`);
        return;
    }

    hideError();
    showLoading("جاري قراءة الملف...");
    setProgress(15);

    try {
        setProgress(35);
        const parsed = await parseFile(file, ext);
        setProgress(70);

        store.load(parsed, file);
        setProgress(90);

        // تحديث الواجهة
        showMainApp(file, parsed);
        setProgress(100);

        setTimeout(() => hideProgress(), 600);

        // تفعيل زر التحليل
        document.getElementById("analyze-btn").disabled = false;

        // تهيئة الـ Tabs
        onDataLoaded();

        showToast(`✅ تم تحميل ${parsed.rowCount.toLocaleString("ar-SA")} سجل`, "success");

    } catch (err) {
        hideLoading();
        hideProgress();
        showError(err.message);
    }
}

// ══════════════════════════════════════════════════════════════
//  PARSE FILE
// ══════════════════════════════════════════════════════════════
async function parseFile(file, ext) {
    if (ext === "json") {
        const text = await file.text();
        return JSONParser.parse(text);
    }
    if (ext === "csv") {
        const text = await file.text();
        return CSVParser.parse(text);
    }
    if (ext === "xlsx" || ext === "xls") {
        const buffer = await file.arrayBuffer();
        return ExcelParser.parse(buffer);
    }
    throw new Error(`صيغة غير مدعومة: .${ext}`);
}

// ══════════════════════════════════════════════════════════════
//  SHOW MAIN APP
// ══════════════════════════════════════════════════════════════
function showMainApp(file, parsed) {
    hideLoading();

    // إخفاء شاشة الرفع
    document.getElementById("upload-screen").classList.add("hidden");

    // إظهار التطبيق
    document.getElementById("main-app").classList.remove("hidden");
    document.getElementById("new-file-btn").classList.remove("hidden");

    // File Info Bar
    const extIcons = {
        csv  : "fa-file-csv text-green-500",
        json : "fa-file-code text-yellow-500",
        xlsx : "fa-file-excel text-emerald-500",
        xls  : "fa-file-excel text-emerald-500"
    };
    const ext = file.name.split(".").pop().toLowerCase();
    document.getElementById("file-type-icon").className =
        `fas ${extIcons[ext] || "fa-file text-blue-500"}`;

    document.getElementById("file-name-display").textContent = file.name;
    document.getElementById("file-meta-display").textContent =
        `${parsed.rowCount.toLocaleString("ar-SA")} سجل · ` +
        `${parsed.columnCount} عمود · ` +
        `${(file.size / 1024).toFixed(1)} KB`;

    // Header Status
    const statusEl = document.getElementById("file-status");
    statusEl.classList.remove("hidden");
    statusEl.classList.add("flex");
    document.getElementById("file-status-text").textContent =
        `${file.name} — جاهز للتحليل`;

    // Stats
    document.getElementById("stat-rows").textContent =
        parsed.rowCount.toLocaleString("ar-SA");
    document.getElementById("stat-cols").textContent =
        parsed.columnCount;

    // Warnings
    if (parsed.warnings?.length > 0) {
        const badge = document.getElementById("warnings-badge");
        badge.classList.remove("hidden");
        badge.classList.add("flex");
        document.getElementById("warnings-count").textContent =
            `${parsed.warnings.length} تحذير`;
        document.getElementById("warnings-list").innerHTML =
            parsed.warnings.map(w => `
                <p class="text-xs text-yellow-700 dark:text-yellow-400
                           flex items-start gap-2">
                    <i class="fas fa-dot-circle mt-0.5 flex-shrink-0"></i>
                    ${w}
                </p>`).join("");
    }
}

// ══════════════════════════════════════════════════════════════
//  ANALYZE BUTTON
// ══════════════════════════════════════════════════════════════
document.getElementById("analyze-btn").addEventListener("click", () => {
    if (!store.workingData) return;

    const btn = document.getElementById("analyze-btn");
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner"></div> جاري التحليل...`;

    showProgressBar();
    setProgress(20);

    // setTimeout لإعطاء المتصفح فرصة لتحديث الـ UI
    setTimeout(() => {
        try {
            setProgress(40);

            // ── المرحلة 1: Profiling ──
            const profile = ProfilerEngine.profile(
                store.workingData,
                store.columns
            );
            store.profileResults = profile;
            setProgress(65);

            // ── المرحلة 2: DAMA Scoring ──
            const dama = DAMAEngine.evaluate(
                store.workingData,
                store.columns,
                profile
            );
            store.damaResults = dama;
            setProgress(85);

            // ── تحديث الواجهة ──
            renderOverview(dama, profile);
            renderProfilerTable(profile, store.columns);
            setProgress(100);

            setTimeout(() => hideProgress(), 600);

            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-redo"></i> إعادة التحليل`;

            // تحديث ReportTab
            window.reportTab?.render();

            showToast("✅ اكتمل التحليل", "success");
            switchTab("overview");

        } catch (err) {
            hideProgress();
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-play"></i> تشغيل التحليل`;
            showToast("❌ خطأ في التحليل: " + err.message, "error");
        }
    }, 50);
});

// ══════════════════════════════════════════════════════════════
//  RENDER OVERVIEW
// ══════════════════════════════════════════════════════════════
function renderOverview(dama, profile) {
    // Overall Score
    document.getElementById("overall-score").textContent = dama.overall;
    document.getElementById("overall-grade").textContent =
        `${dama.grade.icon} ${dama.grade.label}`;

    // Stats
    const emptyPct = profile.__dataset__
        ? ((profile.__dataset__.totalEmpty /
            profile.__dataset__.totalCells) * 100).toFixed(1)
        : "0";
    document.getElementById("stat-empty").textContent = `${emptyPct}%`;

    // DAMA Dimensions
    const dimNames = {
        completeness : "الاكتمال",
        validity     : "الصلاحية",
        consistency  : "التناسق",
        accuracy     : "الدقة",
        timeliness   : "الحداثة",
        uniqueness   : "التفرد",
        integrity    : "السلامة"
    };

    document.getElementById("dama-dimensions-grid").innerHTML =
        Object.entries(dama.dimensions).map(([key, dim]) => {
            const color =
                dim.score >= 80 ? { text: "text-green-600 dark:text-green-400",
                                    bar : "bg-green-500" } :
                dim.score >= 60 ? { text: "text-yellow-600 dark:text-yellow-400",
                                    bar : "bg-yellow-500" } :
                                  { text: "text-red-600 dark:text-red-400",
                                    bar : "bg-red-500" };
            return `
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4
                        border border-gray-200 dark:border-gray-700 fade-in">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-semibold text-gray-700
                                 dark:text-gray-300">
                        ${dimNames[key] || key}
                    </span>
                    <span class="text-lg font-black ${color.text}">
                        ${dim.score}%
                    </span>
                </div>
                <div class="health-bar">
                    <div class="health-fill ${color.bar}"
                         style="width: ${dim.score}%">
                    </div>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ${dim.details || ""}
                </p>
            </div>`;
        }).join("");

    // Recommendations
    document.getElementById("overview-recommendations").innerHTML =
        dama.recommendations.length === 0
            ? `<div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl
                           border border-green-200 dark:border-green-800
                           text-center">
                   <i class="fas fa-check-circle text-green-500 text-xl mb-2"></i>
                   <p class="text-sm text-green-700 dark:text-green-400 font-medium">
                       لا توجد توصيات — البيانات بجودة ممتازة!
                   </p>
               </div>`
            : dama.recommendations.map(rec => `
            <div class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800
                        rounded-xl border border-gray-200 dark:border-gray-700
                        fade-in">
                <span class="text-xs font-bold px-2 py-1 rounded-full
                    whitespace-nowrap
                    ${rec.priority === "عالية"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : rec.priority === "متوسطة"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}">
                    ${rec.priority}
                </span>
                <div>
                    <p class="text-sm font-semibold text-gray-700
                               dark:text-gray-300">
                        ${rec.dimension}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        ${rec.action}
                    </p>
                </div>
            </div>`).join("");
}

// ══════════════════════════════════════════════════════════════
//  RENDER PROFILER TABLE
// ══════════════════════════════════════════════════════════════
function renderProfilerTable(profile, columns) {
    const tbody = document.getElementById("profiler-table-body");

    tbody.innerHTML = columns.map(col => {
        const p = profile[col];
        if (!p) return "";

        const completeness = (100 - p.emptyPct).toFixed(1);
        const barColor =
            completeness >= 90 ? "bg-green-500" :
            completeness >= 70 ? "bg-yellow-500" : "bg-red-500";

        const typeBadge = {
            number  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            text    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            date    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            boolean : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        }[p.type] || "bg-gray-100 text-gray-700";

        const status =
            p.isConstant  ? `<span class="text-xs px-2 py-0.5 rounded-full
                                bg-yellow-100 text-yellow-700
                                dark:bg-yellow-900/30 dark:text-yellow-400">
                                ثابت</span>` :
            p.isNearEmpty ? `<span class="text-xs px-2 py-0.5 rounded-full
                                bg-red-100 text-red-700
                                dark:bg-red-900/30 dark:text-red-400">
                                شبه فارغ</span>` :
            p.emptyPct > 20? `<span class="text-xs px-2 py-0.5 rounded-full
                                bg-yellow-100 text-yellow-700
                                dark:bg-yellow-900/30 dark:text-yellow-400">
                                يحتاج مراجعة</span>` :
                             `<span class="text-xs px-2 py-0.5 rounded-full
                                bg-green-100 text-green-700
                                dark:bg-green-900/30 dark:text-green-400">
                                جيد</span>`;

        return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td class="py-3 px-4">
                <span class="font-semibold text-gray-800 dark:text-gray-200">
                    ${col}
                </span>
            </td>
            <td class="py-3 px-4">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium
                             ${typeBadge}">
                    ${p.type}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                    <div class="health-bar w-20">
                        <div class="health-fill ${barColor}"
                             style="width: ${completeness}%">
                        </div>
                    </div>
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                        ${completeness}%
                    </span>
                </div>
            </td>
            <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                ${p.unique?.toLocaleString("ar-SA") || "—"}
                <span class="text-xs text-gray-400">(${p.uniquePct}%)</span>
            </td>
            <td class="py-3 px-4">
                ${(p.outliers?.count || 0) > 0
                    ? `<span class="text-xs px-2 py-0.5 rounded-full
                           bg-orange-100 text-orange-700
                           dark:bg-orange-900/30 dark:text-orange-400">
                           ${p.outliers.count} قيمة
                       </span>`
                    : `<span class="text-xs text-green-600
                                   dark:text-green-400">لا يوجد</span>`}
            </td>
            <td class="py-3 px-4">${status}</td>
            <td class="py-3 px-4">
                <button onclick="openColumnModal('${col}')"
                    class="text-xs py-1 px-3 bg-blue-50 dark:bg-blue-900/20
                           text-blue-600 dark:text-blue-400 rounded-lg
                           hover:bg-blue-100 dark:hover:bg-blue-900/40
                           transition font-medium">
                    <i class="fas fa-search-plus ml-1"></i>تفاصيل
                </button>
            </td>
        </tr>`;
    }).join("");

    // ── فلاتر البحث ──
    document.getElementById("col-search")
        ?.addEventListener("input", filterProfilerTable);
    document.getElementById("col-type-filter")
        ?.addEventListener("change", filterProfilerTable);
    document.getElementById("col-health-filter")
        ?.addEventListener("change", filterProfilerTable);
}

function filterProfilerTable() {
    const search  = document.getElementById("col-search").value.toLowerCase();
    const type    = document.getElementById("col-type-filter").value;
    const health  = document.getElementById("col-health-filter").value;
    const profile = store.profileResults;

    document.querySelectorAll("#profiler-table-body tr").forEach(row => {
        const colName = row.querySelector("td:first-child")
            ?.textContent.trim().toLowerCase() || "";
        const p = profile?.[
            store.columns.find(c => c.toLowerCase() === colName)
        ];
        if (!p) return;

        const matchSearch = !search || colName.includes(search);
        const matchType   = !type   || p.type === type;
        const completeness = 100 - p.emptyPct;
        const matchHealth =
            !health ||
            (health === "good"     && completeness >= 90) ||
            (health === "warning"  && completeness >= 50 && completeness < 90) ||
            (health === "critical" && completeness < 50);

        row.style.display =
            matchSearch && matchType && matchHealth ? "" : "none";
    });
}

// ══════════════════════════════════════════════════════════════
//  COLUMN DETAIL MODAL
// ══════════════════════════════════════════════════════════════
window.openColumnModal = function(colName) {
    const p = store.profileResults?.[colName];
    if (!p) return;

    document.getElementById("modal-col-name").textContent = colName;
    document.getElementById("modal-content").innerHTML =
        buildModalContent(p, colName);
    document.getElementById("col-detail-modal")
        .classList.remove("hidden");
};

window.closeModal = function() {
    document.getElementById("col-detail-modal").classList.add("hidden");
};

// إغلاق بالنقر على الخلفية
document.getElementById("col-detail-modal")
    ?.addEventListener("click", e => {
        if (e.target === e.currentTarget) closeModal();
    });

function buildModalContent(p, colName) {
    const stats = [
        { label: "النوع",        value: p.type },
        { label: "الإجمالي",     value: p.total?.toLocaleString("ar-SA") },
        { label: "غير فارغ",     value: p.nonEmpty?.toLocaleString("ar-SA") },
        { label: "فارغ",         value: `${p.empty} (${p.emptyPct}%)` },
        { label: "فريد",         value: `${p.unique} (${p.uniquePct}%)` },
        { label: "Cardinality",  value: p.cardinality?.level },
        { label: "Entropy",      value: p.entropy },
    ];

    if (p.type === "number") {
        stats.push(
            { label: "الحد الأدنى", value: p.min },
            { label: "الحد الأقصى", value: p.max },
            { label: "المتوسط",     value: p.mean },
            { label: "الوسيط",      value: p.median },
            { label: "الانحراف",    value: p.stdDev },
            { label: "Q1",          value: p.q1 },
            { label: "Q3",          value: p.q3 },
        );
    }

    return `
    <div class="space-y-5">

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            ${stats.map(s => `
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">${s.label}</p>
                <p class="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                    ${s.value ?? "—"}
                </p>
            </div>`).join("")}
        </div>

        <!-- Top Values -->
        ${p.topValues?.length > 0 ? `
        <div>
            <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                أكثر القيم تكراراً
            </h4>
            <div class="space-y-1.5">
                ${p.topValues.slice(0, 5).map(v => `
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-600 dark:text-gray-400
                                 w-32 truncate" title="${v.value}">
                        ${v.value}
                    </span>
                    <div class="flex-1 health-bar">
                        <div class="health-fill bg-blue-500"
                             style="width: ${v.pct}%">
                        </div>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400 w-16
                                 text-left">
                        ${v.count} (${v.pct}%)
                    </span>
                </div>`).join("")}
            </div>
        </div>` : ""}

        <!-- Outliers -->
        ${p.outliers?.count > 0 ? `
        <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg
                    border border-orange-200 dark:border-orange-800">
            <h4 class="text-sm font-bold text-orange-700
                       dark:text-orange-400 mb-2">
                <i class="fas fa-exclamation-triangle ml-1"></i>
                القيم المتطرفة (${p.outliers.count})
            </h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-white dark:bg-gray-800 rounded p-2">
                    <p class="text-gray-500 dark:text-gray-400">الحد الأدنى</p>
                    <p class="font-bold text-gray-800 dark:text-gray-200">
                        ${p.outliers.bounds?.lower ?? "—"}
                    </p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded p-2">
                    <p class="text-gray-500 dark:text-gray-400">الحد الأقصى</p>
                    <p class="font-bold text-gray-800 dark:text-gray-200">
                        ${p.outliers.bounds?.upper ?? "—"}
                    </p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded p-2">
                    <p class="text-gray-500 dark:text-gray-400">عدد القيم</p>
                    <p class="font-bold text-orange-600 dark:text-orange-400">
                        ${p.outliers.count}
                    </p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded p-2">
                    <p class="text-gray-500 dark:text-gray-400">النسبة</p>
                    <p class="font-bold text-orange-600 dark:text-orange-400">
                        ${p.outliers.pct}%
                    </p>
                </div>
            </div>
        </div>` : ""}

        <!-- Patterns -->
        ${p.patterns?.length > 0 ? `
        <div>
            <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                أنماط البيانات
            </h4>
            <div class="space-y-1.5">
                ${p.patterns.map(pt => `
                <div class="flex items-center justify-between text-xs
                            bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <code class="text-purple-600 dark:text-purple-400
                                 font-mono">
                        ${pt.pattern}
                    </code>
                    <span class="text-gray-500 dark:text-gray-400">
                        ${pt.count} (${pt.pct}%)
                    </span>
                </div>`).join("")}
            </div>
        </div>` : ""}

        <!-- Mixed Types Warning -->
        ${p.mixedTypes?.hasMixed ? `
        <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg
                    border border-red-200 dark:border-red-800">
            <p class="text-sm font-bold text-red-700 dark:text-red-400">
                <i class="fas fa-exclamation-circle ml-1"></i>
                أنواع بيانات مختلطة
            </p>
            <p class="text-xs text-red-600 dark:text-red-400 mt-1">
                الأنواع المكتشفة: ${p.mixedTypes.types.join("، ")}
            </p>
        </div>` : ""}

        <!-- Hidden Spaces -->
        ${p.hiddenSpaces?.count > 0 ? `
        <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg
                    border border-yellow-200 dark:border-yellow-800">
            <p class="text-sm font-bold text-yellow-700 dark:text-yellow-400">
                <i class="fas fa-eye-slash ml-1"></i>
                مسافات مخفية
            </p>
            <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                ${p.hiddenSpaces.count} قيمة تحتوي مسافات زائدة
                (${p.hiddenSpaces.pct}%)
            </p>
        </div>` : ""}

        <!-- Unicode Issues -->
        ${p.unicodeIssues?.hasIssues ? `
        <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg
                    border border-red-200 dark:border-red-800">
            <p class="text-sm font-bold text-red-700 dark:text-red-400">
                <i class="fas fa-font ml-1"></i>
                مشاكل Unicode
            </p>
            <p class="text-xs text-red-600 dark:text-red-400 mt-1">
                ${p.unicodeIssues.count} قيمة تحتوي أحرف غير صالحة
            </p>
        </div>` : ""}

    </div>`;
}

// ══════════════════════════════════════════════════════════════
//  ON DATA LOADED — تهيئة كل الـ Tabs
// ══════════════════════════════════════════════════════════════
function onDataLoaded() {
    window.ruleBuilderUI = new RuleBuilderUI("rule-builder-container", store);
    window.cleanerTab    = new CleanerTab("cleaner-tab-container", store);
    window.reportTab     = new ReportTab("report-tab-container", store);
}

// ══════════════════════════════════════════════════════════════
//  WARNINGS TOGGLE
// ══════════════════════════════════════════════════════════════
window.toggleWarnings = function() {
    document.getElementById("warnings-list")
        .classList.toggle("hidden");
};

// ══════════════════════════════════════════════════════════════
//  PROGRESS BAR HELPERS
// ══════════════════════════════════════════════════════════════
function showProgressBar() {
    document.getElementById("progress-bar-container")
        .classList.remove("hidden");
    setProgress(0);
}

function hideProgress() {
    setProgress(100);
    setTimeout(() => {
        document.getElementById("progress-bar-container")
            .classList.add("hidden");
        setProgress(0);
    }, 400);
}

function setProgress(pct) {
    document.getElementById("progress-bar").style.width = `${pct}%`;
    document.getElementById("upload-progress-fill").style.width = `${pct}%`;
}

// ══════════════════════════════════════════════════════════════
//  LOADING HELPERS
// ══════════════════════════════════════════════════════════════
function showLoading(msg = "جاري المعالجة...") {
    document.getElementById("upload-loading").classList.remove("hidden");
    document.getElementById("loading-text").textContent = msg;
    showProgressBar();
}

function hideLoading() {
    document.getElementById("upload-loading").classList.add("hidden");
}

// ══════════════════════════════════════════════════════════════
//  ERROR HELPERS
// ══════════════════════════════════════════════════════════════
function showError(msg) {
    hideLoading();
    const el = document.getElementById("upload-error");
    el.classList.remove("hidden");
    document.getElementById("error-text").textContent = msg;
}

function hideError() {
    document.getElementById("upload-error").classList.add("hidden");
}

// ══════════════════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // اختفاء بعد 3 ثوانٍ
    setTimeout(() => {
        toast.style.opacity    = "0";
        toast.style.transform  = "translateY(8px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ══════════════════════════════════════════════════════════════
//  KEYBOARD SHORTCUTS
// ══════════════════════════════════════════════════════════════
document.addEventListener("keydown", e => {
    // Escape → إغلاق Modal
    if (e.key === "Escape") closeModal();

    // Ctrl+D → Dark Mode Toggle
    if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        document.getElementById("theme-toggle").click();
    }

    // Ctrl+Enter → تشغيل التحليل
    if (e.ctrlKey && e.key === "Enter") {
        const btn = document.getElementById("analyze-btn");
        if (!btn.disabled) btn.click();
    }
});


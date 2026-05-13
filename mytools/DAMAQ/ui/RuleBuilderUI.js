// ui/RuleBuilderUI.js
import { RuleEngine }        from "../core/RuleEngine.js";
import { CompletenessRules } from "../rules/CompletenessRules.js";
import { ValidityRules }     from "../rules/ValidityRules.js";
import { ConsistencyRules }  from "../rules/ConsistencyRules.js";
import { UniquenessRules }   from "../rules/UniquenessRules.js";
import { TimelinessRules }   from "../rules/TimelinessRules.js";

export class RuleBuilderUI {

    constructor(containerId, store) {
        this.container = document.getElementById(containerId);
        this.store     = store;
        this.engine    = new RuleEngine();
        this.render();
    }

    render() {
        this.container.innerHTML = `
        <div class="space-y-6">

            <!-- بناء قاعدة جديدة -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                    <i class="fas fa-plus-circle ml-2"></i>إضافة قاعدة جديدة
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <!-- نوع القاعدة -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700
                                      dark:text-gray-300 mb-1">نوع القاعدة</label>
                        <select id="rule-type" class="w-full p-2 border rounded-md
                            bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <option value="">-- اختر النوع --</option>
                            <option value="mandatory">إلزامي (Completeness)</option>
                            <option value="cond_mandatory">إلزامي مشروط</option>
                            <option value="saudi_id">هوية وطنية سعودية</option>
                            <option value="saudi_phone">جوال سعودي</option>
                            <option value="saudi_iban">آيبان سعودي</option>
                            <option value="saudi_vat">رقم ضريبي</option>
                            <option value="email">بريد إلكتروني</option>
                            <option value="range">نطاق رقمي</option>
                            <option value="allowed_values">قيم مسموحة</option>
                            <option value="regex">نمط مخصص (Regex)</option>
                            <option value="unique">فريد (Uniqueness)</option>
                            <option value="date_order">ترتيب تواريخ</option>
                            <option value="max_age">حداثة البيانات</option>
                            <option value="not_future">لا يكون في المستقبل</option>
                        </select>
                    </div>

                    <!-- العمود المستهدف -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700
                                      dark:text-gray-300 mb-1">العمود</label>
                        <select id="rule-column" class="w-full p-2 border rounded-md
                            bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <option value="">-- اختر العمود --</option>
                            ${this.store.columns.map(c =>
                                `<option value="${c}">${c}</option>`
                            ).join("")}
                        </select>
                    </div>

                    <!-- معاملات إضافية (تتغير حسب النوع) -->
                    <div id="rule-params" class="space-y-2"></div>
                </div>

                <button id="add-rule-btn"
                    class="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700
                           text-white font-medium rounded-lg transition">
                    <i class="fas fa-plus ml-2"></i>إضافة القاعدة
                </button>
            </div>

            <!-- قائمة القواعد المضافة -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                    <i class="fas fa-list ml-2"></i>القواعد المضافة
                    <span id="rules-count"
                          class="mr-2 text-sm bg-blue-100 text-blue-700
                                 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        0
                    </span>
                </h3>
                <div id="rules-list" class="space-y-2">
                    <p class="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                        لم تتم إضافة أي قواعد بعد
                    </p>
                </div>
            </div>

            <!-- تشغيل القواعد -->
            <button id="run-rules-btn"
                class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700
                       text-white font-bold rounded-lg transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
                disabled>
                <i class="fas fa-play ml-2"></i>تشغيل القواعد على البيانات
            </button>

            <!-- نتائج القواعد -->
            <div id="rule-results" class="hidden space-y-4"></div>
        </div>`;

        this._bindEvents();
    }

    _bindEvents() {
        // تغيير نوع القاعدة → تحديث المعاملات
        document.getElementById("rule-type")
            .addEventListener("change", () => this._updateParams());

        // إضافة قاعدة
        document.getElementById("add-rule-btn")
            .addEventListener("click", () => this._addRule());

        // تشغيل القواعد
        document.getElementById("run-rules-btn")
            .addEventListener("click", () => this._runRules());
    }

    _updateParams() {
        const type      = document.getElementById("rule-type").value;
        const container = document.getElementById("rule-params");

        const paramTemplates = {
            range: `
                <input type="number" id="param-min" placeholder="الحد الأدنى"
                    class="w-full p-2 border rounded-md bg-white dark:bg-gray-700
                           text-gray-700 dark:text-gray-300">
                <input type="number" id="param-max" placeholder="الحد الأقصى"
                    class="w-full p-2 border rounded-md bg-white dark:bg-gray-700
                           text-gray-700 dark:text-gray-300 mt-2">`,

            allowed_values: `
                <input type="text" id="param-values"
                    placeholder="القيم مفصولة بفاصلة: ذكر, أنثى"
                    class="w-full p-2 border rounded-md bg-white dark:bg-gray-700
                           text-gray-700 dark:text-gray-300">`,

            regex: `
                <input type="text" id="param-regex" placeholder="النمط: ^[A-Z]{2}\\d{4}$"
                    class="w-full p-2 border rounded-md bg-white dark:bg-gray-700
                           text-gray-700 dark:text-gray-300">`,

            cond_mandatory: `
                <select id="param-cond-col"
                    class="w-full p-2 border rounded-md bg-white dark:bg-gray-700
                           text-gray-700 dark:text-gray-300">
                    ${this.store.columns.map(c =>
                        `<option value="${c}">${c}</option>`
                    ).join("")}
                </select>
                <input type="text" id="param-cond-val" placeholder="القيمة الشرطية"
                    class="w-full p-2 border rounded-md bg-white dark:bg-gray-700
                           text-gray-700 dark:text-gray-300 mt-2">`,

            date_order: `
                <select id="param-end-col"
                    class="w-full p-2 border rounded-md bg-white dark:bg-gray-700
                           text-gray-700 dark:text-gray-300">
                    <option value="">عمود تاريخ النهاية</option>
                    ${this.store.columns.map(c =>
                        `<option value="${c}">${c}</option>`
                    ).join("")}
                </select>`,

            max_age: `
                <input type="number" id="param-max-days" placeholder="الحد الأقصى بالأيام"
                    class="w-full p-2 border rounded-md bg-white dark:bg-gray-700
                           text-gray-700 dark:text-gray-300">`
        };

        container.innerHTML = paramTemplates[type] || "";
    }

    _addRule() {
        const type   = document.getElementById("rule-type").value;
        const column = document.getElementById("rule-column").value;

        if (!type || !column) {
            alert("يرجى اختيار نوع القاعدة والعمود");
            return;
        }

        let rule;

        try {
            rule = this._buildRule(type, column);
        } catch (e) {
            alert("خطأ في بناء القاعدة: " + e.message);
            return;
        }

        this.engine.addRule(rule);
        this._renderRulesList();

        document.getElementById("run-rules-btn").disabled = false;
    }

    _buildRule(type, column) {
        switch (type) {
            case "mandatory":
                return CompletenessRules.mandatory(column);

            case "cond_mandatory": {
                const condCol = document.getElementById("param-cond-col").value;
                const condVal = document.getElementById("param-cond-val").value;
                if (!condCol || !condVal) throw new Error("يرجى تحديد العمود الشرطي والقيمة");
                return CompletenessRules.conditionalMandatory(column, condCol, condVal);
            }

            case "saudi_id":
                return this._wrapValidityRule(ValidityRules.saudiNationalID, column);

            case "saudi_phone":
                return this._wrapValidityRule(ValidityRules.saudiPhone, column);

            case "saudi_iban":
                return this._wrapValidityRule(ValidityRules.saudiIBAN, column);

            case "saudi_vat":
                return this._wrapValidityRule(ValidityRules.saudiVAT, column);

            case "email":
                return this._wrapValidityRule(ValidityRules.email, column);

            case "range": {
                const min = parseFloat(document.getElementById("param-min").value);
                const max = parseFloat(document.getElementById("param-max").value);
                if (isNaN(min) || isNaN(max)) throw new Error("يرجى إدخال الحد الأدنى والأقصى");
                return this._wrapValidityRule(ValidityRules.numericRange(min, max), column);
            }

            case "allowed_values": {
                const vals = document.getElementById("param-values").value
                    .split(",").map(v => v.trim()).filter(Boolean);
                if (vals.length === 0) throw new Error("يرجى إدخال القيم المسموحة");
                return this._wrapValidityRule(ValidityRules.allowedValues(vals), column);
            }

            case "regex": {
                const pattern = document.getElementById("param-regex").value;
                if (!pattern) throw new Error("يرجى إدخال النمط");
                return this._wrapValidityRule(ValidityRules.regex(pattern), column);
            }

            case "unique":
                return UniquenessRules.uniqueColumn(column);

            case "date_order": {
                const endCol = document.getElementById("param-end-col").value;
                if (!endCol) throw new Error("يرجى اختيار عمود تاريخ النهاية");
                return ConsistencyRules.dateOrder(column, endCol);
            }

            case "max_age": {
                const days = parseInt(document.getElementById("param-max-days").value);
                if (isNaN(days)) throw new Error("يرجى إدخال عدد الأيام");
                return TimelinessRules.maxAge(column, days);
            }

            case "not_future":
                return TimelinessRules.notFuture(column);

            default:
                throw new Error("نوع قاعدة غير معروف");
        }
    }

    // تغليف قواعد Validity لتعمل على عمود محدد
    _wrapValidityRule(validityRule, column) {
        return {
            id     : `${validityRule.id}_${column}`,
            type   : "validity",
            nameAr : `${validityRule.nameAr}: "${column}"`,
            evaluate(data) {
                const violations = [];
                data.forEach((row, idx) => {
                    const val = row[column];
                    if (val === undefined || val === null || String(val).trim() === "") return;
                    const result = validityRule.validate(val);
                    if (!result.valid) {
                        violations.push({ rowIndex: idx, value: val, reason: result.reason });
                    }
                });
                return {
                    passed  : violations.length === 0,
                    violations,
                    score   : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary : `${violations.length} قيمة غير صالحة في "${column}"`
                };
            }
        };
    }

    _renderRulesList() {
        const list  = document.getElementById("rules-list");
        const count = document.getElementById("rules-count");

        count.textContent = this.engine.rules.length;

        if (this.engine.rules.length === 0) {
            list.innerHTML = `<p class="text-gray-500 text-sm text-center py-4">
                لم تتم إضافة أي قواعد بعد</p>`;
            return;
        }

        list.innerHTML = this.engine.rules.map(rule => `
            <div class="flex items-center justify-between p-3 bg-white
                        dark:bg-gray-700 rounded-lg">
                <div class="flex items-center gap-3">
                    <span class="text-xs px-2 py-1 rounded font-medium
                        ${this._typeColor(rule.type)}">
                        ${rule.type}
                    </span>
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                        ${rule.nameAr}
                    </span>
                </div>
                <button onclick="ruleBuilderUI.removeRule('${rule.id}')"
                    class="text-red-500 hover:text-red-700 transition text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join("");
    }

    removeRule(ruleId) {
        this.engine.removeRule(ruleId);
        this._renderRulesList();
        if (this.engine.rules.length === 0)
            document.getElementById("run-rules-btn").disabled = true;
    }

    _typeColor(type) {
        const colors = {
            completeness : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
            validity     : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
            consistency  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
            uniqueness   : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
            timeliness   : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
            integrity    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
        };
        return colors[type] || "bg-gray-100 text-gray-700";
    }

    _runRules() {
        if (!this.store.workingData || this.engine.rules.length === 0) return;

        const summary = this.engine.run(this.store.workingData);
        this.store.ruleResults = summary;
        this._renderResults(summary);
    }

    _renderResults(summary) {
        const container = document.getElementById("rule-results");
        container.classList.remove("hidden");

        container.innerHTML = `

            <!-- ملخص عام -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                    <i class="fas fa-clipboard-check ml-2"></i>نتائج القواعد
                </h3>

                <!-- بطاقات الملخص -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-gray-800 dark:text-gray-200">
                            ${summary.total}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">إجمالي القواعد</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-green-600 dark:text-green-400">
                            ${summary.passed}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">قواعد نجحت</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-red-600 dark:text-red-400">
                            ${summary.failed}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">قواعد فشلت</p>
                    </div>
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            ${summary.passRate}%
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">معدل النجاح</p>
                    </div>
                </div>

                <!-- النتائج حسب النوع -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    ${Object.entries(summary.byType).map(([type, stats]) => `
                        <div class="bg-white dark:bg-gray-700 p-3 rounded-lg">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs font-bold px-2 py-1 rounded
                                    ${this._typeColor(type)}">
                                    ${type}
                                </span>
                                <span class="text-sm font-bold
                                    ${stats.avgScore >= 80
                                        ? "text-green-600 dark:text-green-400"
                                        : stats.avgScore >= 60
                                            ? "text-yellow-600 dark:text-yellow-400"
                                            : "text-red-600 dark:text-red-400"}">
                                    ${stats.avgScore}%
                                </span>
                            </div>
                            <div class="w-full bg-gray-200 dark:bg-gray-600
                                        rounded-full h-2">
                                <div class="h-2 rounded-full transition-all duration-500
                                    ${stats.avgScore >= 80
                                        ? "bg-green-500"
                                        : stats.avgScore >= 60
                                            ? "bg-yellow-500"
                                            : "bg-red-500"}"
                                    style="width: ${stats.avgScore}%">
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ${stats.passed} نجح / ${stats.failed} فشل
                            </p>
                        </div>
                    `).join("")}
                </div>

                <!-- أشد الانتهاكات -->
                ${summary.topViolations.length > 0 ? `
                <div>
                    <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-3">
                        <i class="fas fa-exclamation-triangle text-red-500 ml-2"></i>
                        أشد الانتهاكات
                    </h4>
                    <div class="space-y-2">
                        ${summary.topViolations.map(v => `
                            <div class="flex items-start gap-3 p-3 bg-red-50
                                        dark:bg-red-900/20 rounded-lg border
                                        border-red-200 dark:border-red-800">
                                <i class="fas fa-times-circle text-red-500 mt-0.5"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-700
                                               dark:text-gray-300">
                                        ${v.ruleName}
                                    </p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                        ${v.summary}
                                    </p>
                                </div>
                                <span class="text-xs font-bold text-red-600
                                             dark:text-red-400 whitespace-nowrap">
                                    ${v.violations?.length || 0} انتهاك
                                </span>
                            </div>
                        `).join("")}
                    </div>
                </div>` : ""}
            </div>

            <!-- تفاصيل كل قاعدة -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                    <i class="fas fa-list-alt ml-2"></i>تفاصيل القواعد
                </h3>
                <div class="space-y-3">
                    ${summary.results.map(r => `
                        <details class="bg-white dark:bg-gray-700 rounded-lg
                                        overflow-hidden">
                            <summary class="flex items-center justify-between
                                            p-4 cursor-pointer
                                            hover:bg-gray-50 dark:hover:bg-gray-600
                                            transition-colors">
                                <div class="flex items-center gap-3">
                                    <span class="${r.passed
                                        ? "text-green-500"
                                        : "text-red-500"}">
                                        ${r.passed ? "✅" : "❌"}
                                    </span>
                                    <span class="text-sm font-medium text-gray-700
                                                 dark:text-gray-300">
                                        ${r.ruleName}
                                    </span>
                                    <span class="text-xs px-2 py-0.5 rounded
                                        ${this._typeColor(r.type)}">
                                        ${r.type}
                                    </span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-sm font-bold
                                        ${r.score >= 80
                                            ? "text-green-600 dark:text-green-400"
                                            : r.score >= 60
                                                ? "text-yellow-600 dark:text-yellow-400"
                                                : "text-red-600 dark:text-red-400"}">
                                        ${r.score}%
                                    </span>
                                    <i class="fas fa-chevron-down text-gray-400
                                              text-xs"></i>
                                </div>
                            </summary>

                            <!-- تفاصيل الانتهاكات -->
                            ${!r.passed && r.violations?.length > 0 ? `
                            <div class="border-t border-gray-200 dark:border-gray-600
                                        p-4">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    ${r.summary}
                                </p>
                                <div class="overflow-x-auto">
                                    <table class="min-w-full text-xs">
                                        <thead>
                                            <tr class="bg-gray-100 dark:bg-gray-600">
                                                <th class="py-2 px-3 text-right
                                                           text-gray-700
                                                           dark:text-gray-300">
                                                    رقم الصف
                                                </th>
                                                <th class="py-2 px-3 text-right
                                                           text-gray-700
                                                           dark:text-gray-300">
                                                    القيمة
                                                </th>
                                                <th class="py-2 px-3 text-right
                                                           text-gray-700
                                                           dark:text-gray-300">
                                                    السبب
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200
                                                      dark:divide-gray-600">
                                            ${r.violations.slice(0, 10).map(v => `
                                                <tr class="hover:bg-gray-50
                                                           dark:hover:bg-gray-600">
                                                    <td class="py-2 px-3
                                                               text-gray-600
                                                               dark:text-gray-400">
                                                        ${(v.rowIndex ?? 0) + 1}
                                                    </td>
                                                    <td class="py-2 px-3
                                                               text-gray-600
                                                               dark:text-gray-400
                                                               font-mono">
                                                        ${v.value ?? "—"}
                                                    </td>
                                                    <td class="py-2 px-3
                                                               text-red-600
                                                               dark:text-red-400">
                                                        ${v.reason ?? "—"}
                                                    </td>
                                                </tr>
                                            `).join("")}
                                        </tbody>
                                    </table>
                                    ${r.violations.length > 10 ? `
                                        <p class="text-xs text-gray-500
                                                   dark:text-gray-400 mt-2 text-center">
                                            + ${r.violations.length - 10} انتهاك إضافي
                                        </p>
                                    ` : ""}
                                </div>
                            </div>` : ""}
                        </details>
                    `).join("")}
                </div>
            </div>

            <!-- تصدير النتائج -->
            <div class="flex gap-3">
                <button id="export-rules-report-btn"
                    class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700
                           text-white font-medium rounded-lg transition">
                    <i class="fas fa-file-export ml-2"></i>تصدير تقرير القواعد
                </button>
                <button id="save-rules-btn"
                    class="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700
                           text-white font-medium rounded-lg transition">
                    <i class="fas fa-save ml-2"></i>حفظ القواعد
                </button>
            </div>
        `;

        // ربط أزرار التصدير
        document.getElementById("export-rules-report-btn")
            ?.addEventListener("click", () => this._exportReport(summary));

        document.getElementById("save-rules-btn")
            ?.addEventListener("click", () => this._saveRules());
    }

    // ── تصدير تقرير القواعد ─────────────────────────────────────
    _exportReport(summary) {
        const rows = [
            ["القاعدة", "النوع", "الحالة", "الدرجة", "الملخص"],
            ...summary.results.map(r => [
                r.ruleName,
                r.type,
                r.passed ? "نجح" : "فشل",
                `${r.score}%`,
                r.summary || ""
            ])
        ];

        const csv = rows.map(r =>
            r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ).join("\n");

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement("a"), {
            href: url, download: "rule_results.csv"
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ── حفظ القواعد كـ JSON ──────────────────────────────────────
    _saveRules() {
        const json = this.engine.exportRules();
        const blob = new Blob([json], { type: "application/json" });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement("a"), {
            href: url, download: "my_rules.json"
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

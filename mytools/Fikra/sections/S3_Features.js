/**
 * FIKRA — sections/S3_Features.js
 * ─────────────────────────────────────────────
 * القسم الثالث: مميزات الـ MVP
 *
 * الحقول:
 *  - items[]  : قائمة المميزات
 *    - id       : معرّف فريد
 *    - name     : اسم الميزة
 *    - desc     : وصف مختصر
 *    - priority : must / should / could
 *    - effort   : low / medium / high
 *    - status   : planned / in-progress / done
 *
 * المميزات:
 *  - Drag & Drop لإعادة الترتيب
 *  - فلترة بالـ priority
 *  - MoSCoW matrix تلقائية
 *  - تقدير الجهد الكلي
 * ─────────────────────────────────────────────
 */

import Store  from "../core/Store.js";
import Bus,   { EVENTS } from "../core/EventBus.js";
import Modal  from "../ui/ModalManager.js";
import Toast  from "../ui/ToastManager.js";


/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const PRIORITY = {
    must   : { label: "Must Have",   color: "red",    icon: "fa-circle-exclamation" },
    should : { label: "Should Have", color: "yellow", icon: "fa-circle-up"          },
    could  : { label: "Could Have",  color: "blue",   icon: "fa-circle-minus"       },
};

const EFFORT = {
    low    : { label: "منخفض",  score: 1 },
    medium : { label: "متوسط",  score: 2 },
    high   : { label: "عالٍ",   score: 3 },
};

const STATUS = {
    planned     : { label: "مخطط",      color: "gray"   },
    "in-progress": { label: "جارٍ",     color: "blue"   },
    done        : { label: "مكتمل",     color: "green"  },
};

const MAX_FEATURES = 20;

/* ─────────────────────────────────────────────────────────
   FEATURE SUGGESTIONS — اقتراحات جاهزة
───────────────────────────────────────────────────────── */
const FEATURE_SUGGESTIONS = [
    { name: "تسجيل الدخول",       priority: "must",   effort: "low"    },
    { name: "لوحة التحكم",        priority: "must",   effort: "medium" },
    { name: "إشعارات البريد",     priority: "should", effort: "low"    },
    { name: "تطبيق الجوال",       priority: "could",  effort: "high"   },
    { name: "تقارير وإحصائيات",   priority: "should", effort: "medium" },
    { name: "دعم متعدد اللغات",   priority: "could",  effort: "medium" },
    { name: "API عام",            priority: "could",  effort: "high"   },
    { name: "نظام الدفع",         priority: "must",   effort: "high"   },
];


/* ─────────────────────────────────────────────────────────
   SECTION DEFINITION
───────────────────────────────────────────────────────── */
export default {

    key  : "features",
    label: "مميزات الـ MVP",
    icon : "fa-list-check",


    /* ─────────────────────────────────────────
       template
    ───────────────────────────────────────── */
    template(data = {}) {
        return `
        <div class="space-y-6">

            <!-- ── Header + Stats ───────────── -->
            <div class="features-stats-bar"
                 id="features-stats">
                <!-- تُبنى في onMount -->
            </div>


            <!-- ── Filter Bar ───────────────── -->
            <div class="flex items-center gap-2 flex-wrap"
                 id="filter-bar">

                <span class="text-xs font-bold text-gray-500
                             dark:text-gray-400">
                    عرض:
                </span>

                ${["all", "must", "should", "could"].map(f => `
                    <button
                        type="button"
                        class="filter-btn ${f === "all" ? "filter-btn--active" : ""}"
                        data-filter="${f}">
                        ${f === "all" ? "الكل" : PRIORITY[f]?.label ?? f}
                    </button>
                `).join("")}

                <!-- MoSCoW toggle -->
                <button
                    type="button"
                    id="moscow-toggle"
                    class="filter-btn mr-auto"
                    data-active="false">
                    <i class="fas fa-table-cells text-xs"></i>
                    عرض MoSCoW
                </button>

            </div>


            <!-- ── MoSCoW Matrix (مخفي افتراضياً) ── -->
            <div id="moscow-matrix" class="hidden">
                <!-- تُبنى في onMount -->
            </div>


            <!-- ── Features List ────────────── -->
            <div id="features-list"
                 class="features-list"
                 data-field="items"
                 data-type="sortable">
                <!-- تُبنى في onMount -->
            </div>


            <!-- ── Empty State ──────────────── -->
            <div id="features-empty"
                 class="hidden features-empty">
                <div class="w-16 h-16 bg-brand-100 dark:bg-brand-900/30
                            rounded-2xl flex items-center justify-center
                            mx-auto mb-4">
                    <i class="fas fa-list-check
                               text-brand-500 text-2xl"></i>
                </div>
                <h3 class="text-base font-black text-gray-700
                           dark:text-gray-200 mb-1">
                    لا توجد مميزات بعد
                </h3>
                <p class="text-sm text-gray-400 dark:text-gray-500">
                    أضف أول ميزة للـ MVP من الأسفل
                </p>
            </div>


            <!-- ── Add Feature Form ──────────── -->
            <div class="add-feature-form" id="add-feature-form">

                <p class="text-xs font-black text-gray-500
                          dark:text-gray-400 mb-3 flex items-center gap-2">
                    <i class="fas fa-plus-circle text-brand-500"></i>
                    إضافة ميزة جديدة
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

                    <!-- اسم الميزة -->
                    <input
                        id="feat-name"
                        type="text"
                        class="fikra-input sm:col-span-2"
                        placeholder="اسم الميزة..."
                        maxlength="80"
                    >

                    <!-- الأولوية -->
                    <select id="feat-priority" class="fikra-select">
                        <option value="must">Must Have ⚡</option>
                        <option value="should" selected>Should Have</option>
                        <option value="could">Could Have</option>
                    </select>

                    <!-- الجهد -->
                    <select id="feat-effort" class="fikra-select">
                        <option value="low">جهد منخفض</option>
                        <option value="medium" selected>جهد متوسط</option>
                        <option value="high">جهد عالٍ</option>
                    </select>

                    <!-- الوصف -->
                    <textarea
                        id="feat-desc"
                        class="fikra-textarea sm:col-span-2"
                        placeholder="وصف مختصر للميزة (اختياري)..."
                        rows="2"
                        maxlength="200"
                    ></textarea>

                </div>

                <!-- زر الإضافة -->
                <button
                    id="feat-add-btn"
                    type="button"
                    class="btn-primary w-full">
                    <i class="fas fa-plus text-sm"></i>
                    إضافة للـ MVP
                </button>

            </div>


            <!-- ── Suggestions ───────────────── -->
            <div class="field-group">
                <p class="text-xs font-bold text-gray-500
                          dark:text-gray-400 mb-2 flex items-center gap-2">
                    <i class="fas fa-bolt text-yellow-400"></i>
                    اقتراحات شائعة — اضغط للإضافة الفورية
                </p>
                <div id="feat-suggestions"
                     class="flex flex-wrap gap-2">
                    ${FEATURE_SUGGESTIONS.map(s => `
                        <button
                            type="button"
                            class="suggestion-chip"
                            data-feat-name="${this._escape(s.name)}"
                            data-feat-priority="${s.priority}"
                            data-feat-effort="${s.effort}">
                            + ${this._escape(s.name)}
                        </button>
                    `).join("")}
                </div>
            </div>

        </div>
        `;
    },


    /* ─────────────────────────────────────────
       onMount
    ───────────────────────────────────────── */
    onMount({ el }) {
        this._el      = el;
        this._filter  = "all";
        this._items   = Store.get("features.items") ?? [];

        this._renderAll();
        this._bindAddForm();
        this._bindSuggestions();
        this._bindFilterBar();
        this._bindMoSCoWToggle();

        // الاستماع لحذف feature من الـ Modal
        Bus.on(EVENTS.FEATURE_REMOVED, ({ id }) => {
            this._removeItem(id);
        });
    },


    /* ─────────────────────────────────────────
       _renderAll — تحديث كل الـ UI
    ───────────────────────────────────────── */
    _renderAll() {
        this._renderStats();
        this._renderList();
        this._renderMoSCoW();
        this._updateSuggestions();
    },


    /* ─────────────────────────────────────────
       _renderStats — شريط الإحصائيات
    ───────────────────────────────────────── */
    _renderStats() {
        const statsEl = this._el.querySelector("#features-stats");
        if (!statsEl) return;

        const total    = this._items.length;
        const must     = this._items.filter(f => f.priority === "must").length;
        const should   = this._items.filter(f => f.priority === "should").length;
        const could    = this._items.filter(f => f.priority === "could").length;
        const effort   = this._calcTotalEffort();
        const done     = this._items.filter(f => f.status === "done").length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        statsEl.innerHTML = `

            <!-- العداد الكلي -->
            <div class="stat-card">
                <span class="stat-value">${total}</span>
                <span class="stat-label">ميزة</span>
            </div>

            <!-- Must Have -->
            <div class="stat-card stat-card--red">
                <span class="stat-value text-red-500">${must}</span>
                <span class="stat-label">Must</span>
            </div>

            <!-- Should Have -->
            <div class="stat-card stat-card--yellow">
                <span class="stat-value text-yellow-500">${should}</span>
                <span class="stat-label">Should</span>
            </div>

            <!-- Could Have -->
            <div class="stat-card stat-card--blue">
                <span class="stat-value text-blue-500">${could}</span>
                <span class="stat-label">Could</span>
            </div>

            <!-- الجهد الكلي -->
            <div class="stat-card mr-auto">
                <span class="stat-value text-brand-500">${effort}</span>
                <span class="stat-label">نقطة جهد</span>
            </div>

            <!-- شريط التقدم -->
            ${total > 0 ? `
                <div class="w-full mt-3 col-span-full">
                    <div class="flex justify-between text-xs
                                text-gray-400 dark:text-gray-500 mb-1">
                        <span>التقدم</span>
                        <span>${done} / ${total} مكتمل (${progress}%)</span>
                    </div>
                    <div class="h-1.5 bg-gray-100 dark:bg-gray-800
                                rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-l
                                    from-brand-400 to-brand-600
                                    rounded-full transition-all duration-500"
                             style="width: ${progress}%">
                        </div>
                    </div>
                </div>
            ` : ""}
        `;
    },


    /* ─────────────────────────────────────────
       _renderList — قائمة المميزات
    ───────────────────────────────────────── */
    _renderList() {
        const listEl  = this._el.querySelector("#features-list");
        const emptyEl = this._el.querySelector("#features-empty");
        if (!listEl) return;

        // فلترة
        const filtered = this._filter === "all"
            ? this._items
            : this._items.filter(f => f.priority === this._filter);

        // Empty state
        if (this._items.length === 0) {
            listEl.classList.add("hidden");
            emptyEl?.classList.remove("hidden");
            return;
        }

        listEl.classList.remove("hidden");
        emptyEl?.classList.add("hidden");

        listEl.innerHTML = filtered.map((feat, i) => `
            <div class="feature-card"
                 data-feat-id="${feat.id}"
                 draggable="true">

                <!-- Drag Handle -->
                <div class="drag-handle"
                     aria-label="اسحب لإعادة الترتيب">
                    <i class="fas fa-grip-vertical text-gray-300
                               dark:text-gray-600 text-sm"></i>
                </div>

                <!-- Priority Badge -->
                <div class="priority-badge priority-badge--${feat.priority}">
                    <i class="fas ${PRIORITY[feat.priority]?.icon} text-[10px]"></i>
                    ${PRIORITY[feat.priority]?.label ?? feat.priority}
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">

                    <!-- Name (قابل للتعديل inline) -->
                    <p class="feature-name"
                       contenteditable="true"
                       data-feat-field="name"
                       data-feat-id="${feat.id}"
                       spellcheck="false">
                        ${this._escape(feat.name)}
                    </p>

                    <!-- Desc -->
                    ${feat.desc ? `
                        <p class="feature-desc">
                            ${this._escape(feat.desc)}
                        </p>
                    ` : ""}

                    <!-- Meta row -->
                    <div class="flex items-center gap-3 mt-2 flex-wrap">

                        <!-- Effort -->
                        <span class="meta-badge">
                            <i class="fas fa-gauge text-[10px]"></i>
                            ${EFFORT[feat.effort]?.label ?? feat.effort}
                        </span>

                        <!-- Status selector -->
                        <select
                            class="status-select status-select--${feat.status ?? "planned"}"
                            data-feat-id="${feat.id}"
                            data-feat-field="status">
                            ${Object.entries(STATUS).map(([val, s]) => `
                                <option value="${val}"
                                    ${(feat.status ?? "planned") === val
                                        ? "selected" : ""}>
                                    ${s.label}
                                </option>
                            `).join("")}
                        </select>

                    </div>
                </div>

                <!-- Actions -->
                <div class="feature-actions">

                    <!-- تعديل الأولوية -->
                    <button
                        type="button"
                        class="feat-action-btn"
                        data-feat-id="${feat.id}"
                        data-action="cycle-priority"
                        title="تغيير الأولوية">
                        <i class="fas fa-arrow-up-short-wide
                                   text-gray-400 text-xs"></i>
                    </button>

                    <!-- حذف -->
                    <button
                        type="button"
                        class="feat-action-btn feat-action-btn--danger"
                        data-feat-id="${feat.id}"
                        data-action="delete"
                        title="حذف الميزة">
                        <i class="fas fa-trash text-xs"></i>
                    </button>

                </div>

            </div>
        `).join("");

        // ربط الأحداث
        this._bindListEvents(listEl);
        this._initDragDrop(listEl);
    },


    /* ─────────────────────────────────────────
       _bindListEvents
    ───────────────────────────────────────── */
    _bindListEvents(listEl) {

        // ── Inline edit (name) ────────────────
        listEl.querySelectorAll("[contenteditable]").forEach(el => {
            const id    = el.getAttribute("data-feat-id");
            const field = el.getAttribute("data-feat-field");

            el.addEventListener("blur", () => {
                const val = el.textContent.trim();
                if (!val) {
                    el.textContent =
                        this._items.find(f => f.id === id)?.name ?? "";
                    return;
                }
                this._updateItem(id, { [field]: val });
            });

            // Enter → blur
            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    el.blur();
                }
            });
        });

        // ── Status select ─────────────────────
        listEl.querySelectorAll("[data-feat-field='status']").forEach(sel => {
            sel.addEventListener("change", () => {
                const id = sel.getAttribute("data-feat-id");
                this._updateItem(id, { status: sel.value });
                // تحديث لون الـ select
                sel.className = `status-select status-select--${sel.value}`;
            });
        });

        // ── Action buttons ────────────────────
        listEl.querySelectorAll("[data-action]").forEach(btn => {
            btn.addEventListener("click", () => {
                const id     = btn.getAttribute("data-feat-id");
                const action = btn.getAttribute("data-action");

                if (action === "delete") {
                    const feat = this._items.find(f => f.id === id);
                    Modal.open("confirm-delete-feature", {
                        featureId  : id,
                        featureName: feat?.name ?? "هذه الميزة",
                    });
                }

                if (action === "cycle-priority") {
                    const feat  = this._items.find(f => f.id === id);
                    const order = ["must", "should", "could"];
                    const next  = order[
                        (order.indexOf(feat?.priority ?? "must") + 1) % 3
                    ];
                    this._updateItem(id, { priority: next });
                    Toast.info(
                        `الأولوية: ${PRIORITY[next].label}`
                    );
                }
            });
        });
    },


    /* ─────────────────────────────────────────
       _initDragDrop — Drag & Drop لإعادة الترتيب
    ───────────────────────────────────────── */
    _initDragDrop(listEl) {
        let dragSrc = null;

        listEl.querySelectorAll(".feature-card").forEach(card => {

            card.addEventListener("dragstart", (e) => {
                dragSrc = card;
                card.classList.add("dragging");
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", card.dataset.featId);
            });

            card.addEventListener("dragend", () => {
                card.classList.remove("dragging");
                listEl.querySelectorAll(".drag-over")
                    .forEach(c => c.classList.remove("drag-over"));
            });

            card.addEventListener("dragover", (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (card !== dragSrc) {
                    listEl.querySelectorAll(".drag-over")
                        .forEach(c => c.classList.remove("drag-over"));
                    card.classList.add("drag-over");
                }
            });

            card.addEventListener("drop", (e) => {
                e.preventDefault();
                if (!dragSrc || dragSrc === card) return;

                const srcId  = dragSrc.dataset.featId;
                const destId = card.dataset.featId;

                const srcIdx  = this._items.findIndex(f => f.id === srcId);
                const destIdx = this._items.findIndex(f => f.id === destId);

                if (srcIdx < 0 || destIdx < 0) return;

                // إعادة الترتيب
                const [moved] = this._items.splice(srcIdx, 1);
                this._items.splice(destIdx, 0, moved);

                this._save();
                this._renderAll();
            });
        });
    },


    /* ─────────────────────────────────────────
       _renderMoSCoW — مصفوفة MoSCoW
    ───────────────────────────────────────── */
    _renderMoSCoW() {
        const matrix = this._el.querySelector("#moscow-matrix");
        if (!matrix || matrix.classList.contains("hidden")) return;

        matrix.innerHTML = `
            <div class="moscow-grid">
                ${Object.entries(PRIORITY).map(([key, conf]) => `
                    <div class="moscow-col moscow-col--${conf.color}">

                        <div class="moscow-col-header">
                            <i class="fas ${conf.icon} text-xs"></i>
                            ${conf.label}
                            <span class="moscow-count">
                                ${this._items.filter(f =>
                                    f.priority === key
                                ).length}
                            </span>
                        </div>

                        <div class="moscow-col-body">
                            ${this._items
                                .filter(f => f.priority === key)
                                .map(f => `
                                    <div class="moscow-item">
                                        <i class="fas fa-grip-dots
                                                   text-gray-300 text-[10px]"></i>
                                        <span>${this._escape(f.name)}</span>
                                    </div>
                                `).join("") ||
                                `<p class="text-xs text-gray-300
                                           dark:text-gray-600 italic text-center
                                           py-2">
                                    لا يوجد
                                </p>`
                            }
                        </div>

                    </div>
                `).join("")}
            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _bindAddForm — ربط فورم الإضافة
    ───────────────────────────────────────── */
    _bindAddForm() {
        const nameEl     = this._el.querySelector("#feat-name");
        const priorityEl = this._el.querySelector("#feat-priority");
        const effortEl   = this._el.querySelector("#feat-effort");
        const descEl     = this._el.querySelector("#feat-desc");
        const addBtn     = this._el.querySelector("#feat-add-btn");

        if (!addBtn) return;

        const add = () => {
            const name = nameEl?.value.trim();
            if (!name) {
                nameEl?.classList.add("error");
                nameEl?.focus();
                Toast.error("اكتب اسم الميزة أولاً");
                return;
            }

            if (this._items.length >= MAX_FEATURES) {
                Toast.warning(`الحد الأقصى ${MAX_FEATURES} ميزة للـ MVP`);
                return;
            }

            nameEl.classList.remove("error");

            this._addItem({
                name    : name,
                priority: priorityEl?.value ?? "should",
                effort  : effortEl?.value  ?? "medium",
                desc    : descEl?.value.trim() ?? "",
                status  : "planned",
            });

            // تنظيف الفورم
            if (nameEl)     nameEl.value     = "";
            if (descEl)     descEl.value     = "";
            if (priorityEl) priorityEl.value = "should";
            if (effortEl)   effortEl.value   = "medium";
            nameEl?.focus();
        };

        addBtn.addEventListener("click", add);

        // Enter في حقل الاسم
        nameEl?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                add();
            }
        });
    },


    /* ─────────────────────────────────────────
       _bindSuggestions
    ───────────────────────────────────────── */
    _bindSuggestions() {
        const container = this._el.querySelector("#feat-suggestions");
        if (!container) return;

        container.querySelectorAll("[data-feat-name]").forEach(btn => {
            btn.addEventListener("click", () => {
                const name     = btn.getAttribute("data-feat-name");
                const priority = btn.getAttribute("data-feat-priority");
                const effort   = btn.getAttribute("data-feat-effort");

                if (this._items.length >= MAX_FEATURES) {
                    Toast.warning(`الحد الأقصى ${MAX_FEATURES} ميزة`);
                    return;
                }

                // تجنب التكرار
                if (this._items.some(f => f.name === name)) {
                    Toast.warning(`"${name}" موجودة بالفعل`);
                    return;
                }

                this._addItem({ name, priority, effort, status: "planned" });
                Toast.success(`تمت إضافة "${name}"`);
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindFilterBar
    ───────────────────────────────────────── */
    _bindFilterBar() {
        const bar = this._el.querySelector("#filter-bar");
        if (!bar) return;

        bar.querySelectorAll("[data-filter]").forEach(btn => {
            btn.addEventListener("click", () => {
                this._filter = btn.getAttribute("data-filter");

                // تحديث الـ active state
                bar.querySelectorAll("[data-filter]").forEach(b => {
                    b.classList.toggle(
                        "filter-btn--active",
                        b === btn
                    );
                });

                this._renderList();
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindMoSCoWToggle
    ───────────────────────────────────────── */
    _bindMoSCoWToggle() {
        const btn    = this._el.querySelector("#moscow-toggle");
        const matrix = this._el.querySelector("#moscow-matrix");
        if (!btn || !matrix) return;

        btn.addEventListener("click", () => {
            const isActive = btn.getAttribute("data-active") === "true";

            if (isActive) {
                matrix.classList.add("hidden");
                btn.setAttribute("data-active", "false");
                btn.classList.remove("filter-btn--active");
            } else {
                matrix.classList.remove("hidden");
                btn.setAttribute("data-active", "true");
                btn.classList.add("filter-btn--active");
                this._renderMoSCoW();
            }
        });
    },


    /* ─────────────────────────────────────────
       _updateSuggestions — تعليم المضافة
    ───────────────────────────────────────── */
    _updateSuggestions() {
        const container = this._el?.querySelector("#feat-suggestions");
        if (!container) return;

        const names = this._items.map(f => f.name);

        container.querySelectorAll("[data-feat-name]").forEach(btn => {
            const name     = btn.getAttribute("data-feat-name");
            const isAdded  = names.includes(name);
            btn.classList.toggle("suggestion-chip--active", isAdded);
            btn.textContent = isAdded ? `✓ ${name}` : `+ ${name}`;
            btn.disabled    = isAdded;
        });
    },


    /* ─────────────────────────────────────────
       _addItem
    ───────────────────────────────────────── */
    _addItem(feat) {
        const newItem = {
            id      : `feat_${Date.now()}_${Math.random()
                        .toString(36).slice(2, 7)}`,
            name    : feat.name,
            desc    : feat.desc    ?? "",
            priority: feat.priority ?? "should",
            effort  : feat.effort   ?? "medium",
            status  : feat.status   ?? "planned",
        };

        this._items.push(newItem);
        this._save();
        this._renderAll();
    },


    /* ─────────────────────────────────────────
       _removeItem
    ───────────────────────────────────────── */
    _removeItem(id) {
        this._items = this._items.filter(f => f.id !== id);
        this._save();
        this._renderAll();
    },


    /* ─────────────────────────────────────────
       _updateItem
    ───────────────────────────────────────── */
    _updateItem(id, changes) {
        const idx = this._items.findIndex(f => f.id === id);
        if (idx < 0) return;
        this._items[idx] = { ...this._items[idx], ...changes };
        this._save();
        this._renderAll();
    },


    /* ─────────────────────────────────────────
       _calcTotalEffort
    ───────────────────────────────────────── */
    _calcTotalEffort() {
        return this._items.reduce((sum, f) => {
            return sum + (EFFORT[f.effort]?.score ?? 1);
        }, 0);
    },


    /* ─────────────────────────────────────────
       _save — حفظ في Store
    ───────────────────────────────────────── */
    _save() {
        Store.set("features.items", [...this._items]);
    },


    /* ─────────────────────────────────────────
       _escape
    ───────────────────────────────────────── */
    _escape(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g,  "&amp;")
            .replace(/</g,  "&lt;")
            .replace(/>/g,  "&gt;")
            .replace(/"/g,  "&quot;")
            .replace(/'/g,  "&#39;");
    },
};

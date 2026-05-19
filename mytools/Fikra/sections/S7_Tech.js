/**
 * FIKRA — sections/S7_Tech.js
 * ─────────────────────────────────────────────
 * القسم السابع: الـ Tech Stack والبنية التقنية
 *
 * الحقول:
 *  - platform        : المنصة الرئيسية
 *  - stack[]         : التقنيات المختارة
 *    - id            : معرّف فريد
 *    - name          : اسم التقنية
 *    - category      : frontend / backend / database / devops / other
 *    - icon          : أيقونة (devicon class)
 *    - reason        : سبب الاختيار
 *  - architecture    : نوع المعمارية
 *  - hosting         : منصة الاستضافة
 *  - repoUrl         : رابط الـ Repository
 *  - techRisks[]     : المخاطر التقنية
 *  - mvpApproach     : نهج بناء الـ MVP (build / buy / hybrid)
 * ─────────────────────────────────────────────
 */

import Store from "../core/Store.js";
import Toast from "../ui/ToastManager.js";


/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const PLATFORMS = [
    { value: "",          label: "اختر المنصة...",          disabled: true  },
    { value: "web",       label: "🌐 Web App"                               },
    { value: "mobile",    label: "📱 Mobile App (iOS / Android)"            },
    { value: "desktop",   label: "🖥️ Desktop App"                          },
    { value: "api",       label: "🔌 API / Backend Service"                 },
    { value: "extension", label: "🧩 Browser Extension"                     },
    { value: "bot",       label: "🤖 Bot / Automation"                      },
    { value: "ai",        label: "🧠 AI / ML Product"                       },
    { value: "multi",     label: "🔀 Multi-platform"                        },
];

const ARCHITECTURES = [
    { value: "",           label: "اختر المعمارية...",       disabled: true  },
    { value: "monolith",   label: "Monolith — تطبيق واحد متكامل"            },
    { value: "microservices", label: "Microservices — خدمات مستقلة"         },
    { value: "serverless", label: "Serverless — بدون خوادم ثابتة"           },
    { value: "jamstack",   label: "JAMstack — frontend + APIs"              },
    { value: "spa",        label: "SPA — Single Page Application"           },
    { value: "ssr",        label: "SSR — Server Side Rendering"             },
    { value: "mobile-native", label: "Native Mobile"                        },
    { value: "cross-platform", label: "Cross-platform (React Native / Flutter)" },
];

const HOSTING_OPTIONS = [
    { value: "",        label: "اختر منصة الاستضافة...",    disabled: true  },
    { value: "vercel",  label: "Vercel"                                      },
    { value: "netlify", label: "Netlify"                                     },
    { value: "aws",     label: "AWS"                                         },
    { value: "gcp",     label: "Google Cloud"                                },
    { value: "azure",   label: "Microsoft Azure"                             },
    { value: "railway", label: "Railway"                                     },
    { value: "render",  label: "Render"                                      },
    { value: "digitalocean", label: "DigitalOcean"                          },
    { value: "supabase", label: "Supabase"                                   },
    { value: "firebase", label: "Firebase"                                   },
    { value: "other",   label: "أخرى"                                        },
];

const MVP_APPROACHES = [
    { value: "",       label: "اختر النهج...",               disabled: true  },
    { value: "build",  label: "Build — بناء من الصفر"                       },
    { value: "buy",    label: "Buy / No-code — أدوات جاهزة"                 },
    { value: "hybrid", label: "Hybrid — مزيج من الاثنين"                    },
];

const STACK_CATEGORIES = {
    frontend : { label: "Frontend",  icon: "fa-display",        color: "blue"   },
    backend  : { label: "Backend",   icon: "fa-server",         color: "green"  },
    database : { label: "Database",  icon: "fa-database",       color: "yellow" },
    devops   : { label: "DevOps",    icon: "fa-gears",          color: "purple" },
    ai       : { label: "AI / ML",   icon: "fa-brain",          color: "pink"   },
    other    : { label: "أخرى",      icon: "fa-puzzle-piece",   color: "gray"   },
};

const MAX_STACK  = 15;
const MAX_RISKS  = 6;

/* ─────────────────────────────────────────────────────────
   TECH SUGGESTIONS — مكتبة التقنيات الجاهزة
───────────────────────────────────────────────────────── */
const TECH_LIBRARY = {
    frontend: [
        { name: "React",       icon: "devicon-react-original"        },
        { name: "Vue.js",      icon: "devicon-vuejs-plain"           },
        { name: "Next.js",     icon: "devicon-nextjs-plain"          },
        { name: "Nuxt.js",     icon: "devicon-nuxtjs-plain"          },
        { name: "Svelte",      icon: "devicon-svelte-plain"          },
        { name: "Tailwind CSS",icon: "devicon-tailwindcss-plain"     },
        { name: "TypeScript",  icon: "devicon-typescript-plain"      },
    ],
    backend: [
        { name: "Node.js",     icon: "devicon-nodejs-plain"          },
        { name: "Python",      icon: "devicon-python-plain"          },
        { name: "Laravel",     icon: "devicon-laravel-plain"         },
        { name: "Django",      icon: "devicon-django-plain"          },
        { name: "FastAPI",     icon: "devicon-fastapi-plain"         },
        { name: "Go",          icon: "devicon-go-plain"              },
        { name: "Rust",        icon: "devicon-rust-plain"            },
    ],
    database: [
        { name: "PostgreSQL",  icon: "devicon-postgresql-plain"      },
        { name: "MySQL",       icon: "devicon-mysql-plain"           },
        { name: "MongoDB",     icon: "devicon-mongodb-plain"         },
        { name: "Redis",       icon: "devicon-redis-plain"           },
        { name: "Supabase",    icon: "devicon-supabase-plain"        },
        { name: "Firebase",    icon: "devicon-firebase-plain"        },
        { name: "SQLite",      icon: "devicon-sqlite-plain"          },
    ],
    devops: [
        { name: "Docker",      icon: "devicon-docker-plain"          },
        { name: "GitHub Actions", icon: "devicon-github-original"   },
        { name: "Kubernetes",  icon: "devicon-kubernetes-plain"      },
        { name: "Nginx",       icon: "devicon-nginx-plain"           },
        { name: "Terraform",   icon: "devicon-terraform-plain"       },
    ],
    ai: [
        { name: "OpenAI API",  icon: "fa-brain"                      },
        { name: "LangChain",   icon: "fa-link"                       },
        { name: "Hugging Face",icon: "fa-face-smile"                 },
        { name: "TensorFlow",  icon: "devicon-tensorflow-original"   },
        { name: "PyTorch",     icon: "devicon-pytorch-plain"         },
    ],
};

/* ─────────────────────────────────────────────────────────
   TECH RISK TEMPLATES
───────────────────────────────────────────────────────── */
const RISK_TEMPLATES = [
    "تعقيد التكامل مع APIs خارجية",
    "أداء قاعدة البيانات عند التوسع",
    "أمان بيانات المستخدمين",
    "تكاليف الاستضافة عند النمو",
    "صعوبة توظيف كفاءات بالـ stack المختار",
    "اعتماد على third-party قد يتوقف",
];


/* ─────────────────────────────────────────────────────────
   SECTION DEFINITION
───────────────────────────────────────────────────────── */
export default {

    key  : "tech",
    label: "الـ Tech Stack",
    icon : "fa-microchip",


    /* ─────────────────────────────────────────
       template
    ───────────────────────────────────────── */
    template(data = {}) {
        return `
        <div class="space-y-6">


            <!-- ── المنصة والمعمارية ─────────── -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <!-- المنصة -->
                <div class="field-group mb-0">
                    <label class="field-label" for="tech-platform">
                        <i class="fas fa-layer-group text-brand-500"></i>
                        المنصة الرئيسية
                        <span class="text-red-400">*</span>
                    </label>
                    <select
                        id="tech-platform"
                        class="fikra-select"
                        data-field="platform">
                        ${PLATFORMS.map(opt => `
                            <option
                                value="${opt.value}"
                                ${opt.disabled ? "disabled" : ""}
                                ${data.platform === opt.value
                                    ? "selected" : ""}
                                ${!data.platform && opt.disabled
                                    ? "selected" : ""}>
                                ${opt.label}
                            </option>
                        `).join("")}
                    </select>
                    <p class="fikra-error-msg hidden"
                       data-error="platform"></p>
                </div>

                <!-- المعمارية -->
                <div class="field-group mb-0">
                    <label class="field-label" for="tech-arch">
                        <i class="fas fa-sitemap text-brand-500"></i>
                        المعمارية
                        <span class="text-xs text-gray-400 font-normal">
                            (اختياري)
                        </span>
                    </label>
                    <select
                        id="tech-arch"
                        class="fikra-select"
                        data-field="architecture">
                        ${ARCHITECTURES.map(opt => `
                            <option
                                value="${opt.value}"
                                ${opt.disabled ? "disabled" : ""}
                                ${data.architecture === opt.value
                                    ? "selected" : ""}
                                ${!data.architecture && opt.disabled
                                    ? "selected" : ""}>
                                ${opt.label}
                            </option>
                        `).join("")}
                    </select>
                </div>

            </div>


            <!-- ── الاستضافة ونهج الـ MVP ─────── -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <!-- الاستضافة -->
                <div class="field-group mb-0">
                    <label class="field-label" for="tech-hosting">
                        <i class="fas fa-cloud text-brand-500"></i>
                        منصة الاستضافة
                        <span class="text-xs text-gray-400 font-normal">
                            (اختياري)
                        </span>
                    </label>
                    <select
                        id="tech-hosting"
                        class="fikra-select"
                        data-field="hosting">
                        ${HOSTING_OPTIONS.map(opt => `
                            <option
                                value="${opt.value}"
                                ${opt.disabled ? "disabled" : ""}
                                ${data.hosting === opt.value
                                    ? "selected" : ""}
                                ${!data.hosting && opt.disabled
                                    ? "selected" : ""}>
                                ${opt.label}
                            </option>
                        `).join("")}
                    </select>
                </div>

                <!-- نهج الـ MVP -->
                <div class="field-group mb-0">
                    <label class="field-label" for="tech-mvp-approach">
                        <i class="fas fa-rocket text-brand-500"></i>
                        نهج بناء الـ MVP
                        <span class="text-xs text-gray-400 font-normal">
                            (اختياري)
                        </span>
                    </label>
                    <select
                        id="tech-mvp-approach"
                        class="fikra-select"
                        data-field="mvpApproach">
                        ${MVP_APPROACHES.map(opt => `
                            <option
                                value="${opt.value}"
                                ${opt.disabled ? "disabled" : ""}
                                ${data.mvpApproach === opt.value
                                    ? "selected" : ""}
                                ${!data.mvpApproach && opt.disabled
                                    ? "selected" : ""}>
                                ${opt.label}
                            </option>
                        `).join("")}
                    </select>
                </div>

            </div>


            <!-- ── رابط الـ Repo ─────────────── -->
            <div class="field-group">
                <label class="field-label" for="tech-repo">
                    <i class="fab fa-github text-brand-500"></i>
                    رابط الـ Repository
                    <span class="text-xs text-gray-400 font-normal">
                        (اختياري)
                    </span>
                </label>
                <input
                    id="tech-repo"
                    type="url"
                    class="fikra-input"
                    data-field="repoUrl"
                    placeholder="https://github.com/username/repo"
                    value="${this._escape(data.repoUrl ?? "")}"
                    dir="ltr"
                >
            </div>


            <!-- ── Stack Header ──────────────── -->
            <div>

                <div class="flex items-center justify-between mb-3">
                    <label class="field-label mb-0">
                        <i class="fas fa-cubes text-brand-500"></i>
                        الـ Tech Stack
                        <span class="text-xs text-gray-400 font-normal"
                              id="stack-counter">
                            (0 / ${MAX_STACK})
                        </span>
                    </label>

                    <!-- Category Filter -->
                    <div class="flex gap-1" id="stack-cat-filter">
                        <button type="button"
                            class="kpi-filter-btn kpi-filter-btn--active"
                            data-cat-filter="all">
                            الكل
                        </button>
                        ${Object.entries(STACK_CATEGORIES).map(([key, cat]) => `
                            <button type="button"
                                class="kpi-filter-btn"
                                data-cat-filter="${key}"
                                title="${cat.label}">
                                <i class="fas ${cat.icon} text-[10px]"></i>
                            </button>
                        `).join("")}
                    </div>
                </div>


                <!-- Stack Visual (Badges) -->
                <div id="stack-badges"
                     class="min-h-[60px] p-3 rounded-xl
                            bg-gray-50 dark:bg-gray-800/50
                            border border-dashed border-gray-200
                            dark:border-gray-700
                            flex flex-wrap gap-2 mb-3">
                    <!-- تُبنى في onMount -->
                </div>


                <!-- Tech Library Tabs -->
                <div id="tech-library" class="space-y-3">
                    <!-- تُبنى في onMount -->
                </div>


                <!-- Custom Tech Input -->
                <div class="flex gap-2 mt-3">

                    <input
                        id="custom-tech-name"
                        type="text"
                        class="fikra-input flex-1"
                        placeholder="أضف تقنية مخصصة..."
                        maxlength="40"
                    >

                    <select id="custom-tech-cat"
                            class="fikra-select w-32">
                        ${Object.entries(STACK_CATEGORIES).map(([key, cat]) => `
                            <option value="${key}">${cat.label}</option>
                        `).join("")}
                    </select>

                    <button
                        id="custom-tech-add"
                        type="button"
                        class="btn-icon"
                        aria-label="إضافة">
                        <i class="fas fa-plus text-sm"></i>
                    </button>

                </div>

            </div>


            <!-- ── المخاطر التقنية ───────────── -->
            <div class="field-group">

                <label class="field-label">
                    <i class="fas fa-shield-halved text-brand-500"></i>
                    المخاطر التقنية
                    <span class="text-xs text-gray-400 font-normal">
                        (اختياري)
                    </span>
                </label>

                <!-- Risks Chips -->
                <div id="risks-chips"
                     class="chips-container mb-3">
                    <!-- تُبنى في onMount -->
                </div>

                <!-- Risk Suggestions -->
                <div class="flex flex-wrap gap-2 mb-3"
                     id="risk-suggestions">
                    ${RISK_TEMPLATES.map(r => `
                        <button type="button"
                            class="suggestion-chip"
                            data-risk="${this._escape(r)}">
                            + ${this._escape(r)}
                        </button>
                    `).join("")}
                </div>

                <!-- Custom Risk Input -->
                <div class="flex gap-2">
                    <input
                        id="custom-risk-input"
                        type="text"
                        class="fikra-input flex-1"
                        placeholder="أضف مخاطرة تقنية مخصصة..."
                        maxlength="100"
                    >
                    <button
                        id="custom-risk-add"
                        type="button"
                        class="btn-icon"
                        aria-label="إضافة">
                        <i class="fas fa-plus text-sm"></i>
                    </button>
                </div>

            </div>


            <!-- ── Stack Summary Card ────────── -->
            <div id="stack-summary" class="hidden">
                <!-- تُبنى في onMount -->
            </div>


        </div>
        `;
    },


    /* ─────────────────────────────────────────
       onMount
    ───────────────────────────────────────── */
    onMount({ el }) {
        this._el     = el;
        this._stack  = Store.get("tech.stack")      ?? [];
        this._risks  = Store.get("tech.techRisks")  ?? [];
        this._catFilter = "all";

        this._renderStackBadges();
        this._renderTechLibrary();
        this._bindCustomTechInput();
        this._renderRisks();
        this._bindRiskSuggestions();
        this._bindCustomRiskInput();
        this._bindCatFilter();
        this._updateStackSummary();
    },


    /* ─────────────────────────────────────────
       _renderStackBadges — عرض التقنيات المختارة
    ───────────────────────────────────────── */
    _renderStackBadges() {
        const container = this._el.querySelector("#stack-badges");
        const counter   = this._el.querySelector("#stack-counter");
        if (!container) return;

        // تحديث العداد
        if (counter) {
            counter.textContent = `(${this._stack.length} / ${MAX_STACK})`;
        }

        const filtered = this._catFilter === "all"
            ? this._stack
            : this._stack.filter(t => t.category === this._catFilter);

        if (this._stack.length === 0) {
            container.innerHTML = `
                <p class="text-xs text-gray-300 dark:text-gray-600
                           italic w-full text-center py-2">
                    اختر التقنيات من المكتبة أدناه
                </p>
            `;
            return;
        }

        container.innerHTML = filtered.map(tech => {
            const cat = STACK_CATEGORIES[tech.category] ?? STACK_CATEGORIES.other;
            return `
                <div class="tech-badge tech-badge--${cat.color}"
                     data-tech-id="${tech.id}"
                     title="${this._escape(tech.reason ?? "")}">

                    <!-- Icon -->
                    ${tech.icon?.startsWith("devicon")
                        ? `<i class="${tech.icon} colored text-base"></i>`
                        : `<i class="fas ${tech.icon ?? "fa-code"}
                                    text-xs"></i>`
                    }

                    <!-- Name -->
                    <span class="text-xs font-bold">
                        ${this._escape(tech.name)}
                    </span>

                    <!-- Category dot -->
                    <span class="tech-cat-dot
                                 bg-${cat.color}-400"
                          title="${cat.label}">
                    </span>

                    <!-- Remove -->
                    <button type="button"
                        class="tech-remove-btn"
                        data-tech-id="${tech.id}"
                        aria-label="حذف ${this._escape(tech.name)}">
                        <i class="fas fa-xmark text-[9px]"></i>
                    </button>

                </div>
            `;
        }).join("");

        // ربط أزرار الحذف
        container.querySelectorAll(".tech-remove-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-tech-id");
                this._removeTech(id);
            });
        });
    },


    /* ─────────────────────────────────────────
       _renderTechLibrary — مكتبة التقنيات
    ───────────────────────────────────────── */
    _renderTechLibrary() {
        const container = this._el.querySelector("#tech-library");
        if (!container) return;

        const categories = this._catFilter === "all"
            ? Object.keys(TECH_LIBRARY)
            : Object.keys(TECH_LIBRARY).filter(c => c === this._catFilter);

        container.innerHTML = categories.map(cat => {
            const catConf = STACK_CATEGORIES[cat];
            const techs   = TECH_LIBRARY[cat] ?? [];

            return `
            <div class="tech-lib-section">

                <p class="text-xs font-bold text-${catConf.color}-500
                          flex items-center gap-1.5 mb-2">
                    <i class="fas ${catConf.icon} text-[10px]"></i>
                    ${catConf.label}
                </p>

                <div class="flex flex-wrap gap-2">
                    ${techs.map(tech => {
                        const isAdded = this._stack.some(
                            t => t.name === tech.name
                        );
                        return `
                            <button type="button"
                                class="tech-lib-btn
                                       ${isAdded
                                           ? "tech-lib-btn--active"
                                           : ""}"
                                data-lib-name="${this._escape(tech.name)}"
                                data-lib-icon="${tech.icon}"
                                data-lib-cat="${cat}"
                                ${isAdded ? "disabled" : ""}>

                                ${tech.icon?.startsWith("devicon")
                                    ? `<i class="${tech.icon} colored
                                                text-sm"></i>`
                                    : `<i class="fas ${tech.icon}
                                                text-xs"></i>`
                                }

                                <span class="text-xs">
                                    ${this._escape(tech.name)}
                                </span>

                                ${isAdded
                                    ? `<i class="fas fa-check
                                                text-[9px]"></i>`
                                    : `<i class="fas fa-plus
                                                text-[9px]"></i>`
                                }

                            </button>
                        `;
                    }).join("")}
                </div>

            </div>
            `;
        }).join("");

        // ربط أزرار المكتبة
        container.querySelectorAll("[data-lib-name]").forEach(btn => {
            btn.addEventListener("click", () => {
                const name = btn.getAttribute("data-lib-name");
                const icon = btn.getAttribute("data-lib-icon");
                const cat  = btn.getAttribute("data-lib-cat");

                this._addTech({ name, icon, category: cat });
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindCustomTechInput
    ───────────────────────────────────────── */
    _bindCustomTechInput() {
        const nameEl = this._el.querySelector("#custom-tech-name");
        const catEl  = this._el.querySelector("#custom-tech-cat");
        const addBtn = this._el.querySelector("#custom-tech-add");

        if (!addBtn) return;

        const add = () => {
            const name = nameEl?.value.trim();
            if (!name) {
                nameEl?.focus();
                Toast.error("اكتب اسم التقنية أولاً");
                return;
            }

            if (this._stack.length >= MAX_STACK) {
                Toast.warning(`الحد الأقصى ${MAX_STACK} تقنية`);
                return;
            }

            if (this._stack.some(t => t.name === name)) {
                Toast.warning(`"${name}" موجودة بالفعل`);
                return;
            }

            this._addTech({
                name,
                icon    : "fa-code",
                category: catEl?.value ?? "other",
            });

            if (nameEl) nameEl.value = "";
            nameEl?.focus();
        };

        addBtn.addEventListener("click", add);
        nameEl?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { e.preventDefault(); add(); }
        });
    },


    /* ─────────────────────────────────────────
       _renderRisks — عرض المخاطر
    ───────────────────────────────────────── */
    _renderRisks() {
        const container = this._el.querySelector("#risks-chips");
        if (!container) return;

        container.innerHTML = this._risks.length === 0
            ? `<p class="text-xs text-gray-400 dark:text-gray-500
                         italic py-1">
                   لا توجد مخاطر مضافة بعد
               </p>`
            : this._risks.map((risk, i) => `
                <span class="chip chip--risk">
                    <i class="fas fa-triangle-exclamation
                               text-[10px] text-yellow-500"></i>
                    ${this._escape(risk)}
                    <button type="button"
                        class="chip-remove"
                        data-risk-idx="${i}"
                        aria-label="حذف">
                        <i class="fas fa-xmark text-[10px]"></i>
                    </button>
                </span>
            `).join("");

        // ربط حذف المخاطر
        container.querySelectorAll(".chip-remove").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-risk-idx"));
                this._risks.splice(idx, 1);
                this._saveRisks();
                this._renderRisks();
                this._updateRiskSuggestions();
            });
        });

        this._updateRiskSuggestions();
    },


    /* ─────────────────────────────────────────
       _bindRiskSuggestions
    ───────────────────────────────────────── */
    _bindRiskSuggestions() {
        const container = this._el.querySelector("#risk-suggestions");
        if (!container) return;

        container.querySelectorAll("[data-risk]").forEach(btn => {
            btn.addEventListener("click", () => {
                const risk = btn.getAttribute("data-risk");

                if (this._risks.length >= MAX_RISKS) {
                    Toast.warning(`الحد الأقصى ${MAX_RISKS} مخاطر`);
                    return;
                }

                if (this._risks.includes(risk)) {
                    // toggle — إلغاء التحديد
                    const idx = this._risks.indexOf(risk);
                    this._risks.splice(idx, 1);
                } else {
                    this._risks.push(risk);
                }

                this._saveRisks();
                this._renderRisks();
            });
        });
    },


    /* ─────────────────────────────────────────
       _bindCustomRiskInput
    ───────────────────────────────────────── */
    _bindCustomRiskInput() {
        const input  = this._el.querySelector("#custom-risk-input");
        const addBtn = this._el.querySelector("#custom-risk-add");
        if (!addBtn) return;

        const add = () => {
            const val = input?.value.trim();
            if (!val) return;

            if (this._risks.length >= MAX_RISKS) {
                Toast.warning(`الحد الأقصى ${MAX_RISKS} مخاطر`);
                return;
            }

            if (this._risks.includes(val)) {
                Toast.warning("هذه المخاطرة موجودة بالفعل");
                return;
            }

            this._risks.push(val);
            this._saveRisks();
            this._renderRisks();

            if (input) { input.value = ""; input.focus(); }
        };

        addBtn.addEventListener("click", add);
        input?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { e.preventDefault(); add(); }
        });
    },


    /* ─────────────────────────────────────────
       _bindCatFilter — فلتر الفئات
    ───────────────────────────────────────── */
    _bindCatFilter() {
        const bar = this._el.querySelector("#stack-cat-filter");
        if (!bar) return;

        bar.querySelectorAll("[data-cat-filter]").forEach(btn => {
            btn.addEventListener("click", () => {
                this._catFilter = btn.getAttribute("data-cat-filter");

                bar.querySelectorAll("[data-cat-filter]").forEach(b => {
                    b.classList.toggle(
                        "kpi-filter-btn--active",
                        b === btn
                    );
                });

                this._renderStackBadges();
                this._renderTechLibrary();
            });
        });
    },


    /* ─────────────────────────────────────────
       _updateRiskSuggestions
    ───────────────────────────────────────── */
    _updateRiskSuggestions() {
        const container = this._el?.querySelector("#risk-suggestions");
        if (!container) return;

        container.querySelectorAll("[data-risk]").forEach(btn => {
            const risk    = btn.getAttribute("data-risk");
            const isAdded = this._risks.includes(risk);
            btn.classList.toggle("suggestion-chip--active", isAdded);
            btn.textContent = isAdded ? `✓ ${risk}` : `+ ${risk}`;
        });
    },


    /* ─────────────────────────────────────────
       _updateStackSummary — بطاقة الملخص
    ───────────────────────────────────────── */
    _updateStackSummary() {
        const summaryEl = this._el.querySelector("#stack-summary");
        if (!summaryEl) return;

        if (this._stack.length === 0) {
            summaryEl.classList.add("hidden");
            return;
        }

        summaryEl.classList.remove("hidden");

        // تجميع بالفئة
        const byCategory = Object.entries(STACK_CATEGORIES).map(([key, cat]) => ({
            key,
            cat,
            items: this._stack.filter(t => t.category === key),
        })).filter(g => g.items.length > 0);

        summaryEl.innerHTML = `
            <div class="stack-summary-card">

                <p class="text-xs font-black text-gray-500
                          dark:text-gray-400 mb-3 flex items-center gap-2">
                    <i class="fas fa-cubes text-brand-500"></i>
                    ملخص الـ Stack
                    <span class="text-gray-300 dark:text-gray-600 font-normal">
                        — ${this._stack.length} تقنية
                    </span>
                </p>

                <div class="space-y-3">
                    ${byCategory.map(({ key, cat, items }) => `
                        <div>
                            <p class="text-xs font-bold
                                       text-${cat.color}-500
                                       flex items-center gap-1.5 mb-1.5">
                                <i class="fas ${cat.icon} text-[10px]"></i>
                                ${cat.label}
                            </p>
                            <div class="flex flex-wrap gap-1.5">
                                ${items.map(tech => `
                                    <span class="inline-flex items-center
                                                 gap-1 px-2 py-1 rounded-lg
                                                 bg-${cat.color}-50
                                                 dark:bg-${cat.color}-900/20
                                                 text-${cat.color}-700
                                                 dark:text-${cat.color}-300
                                                 text-xs font-medium">
                                        ${tech.icon?.startsWith("devicon")
                                            ? `<i class="${tech.icon}
                                                        colored text-sm"></i>`
                                            : `<i class="fas ${tech.icon
                                                ?? "fa-code"} text-[10px]"></i>`
                                        }
                                        ${this._escape(tech.name)}
                                    </span>
                                `).join("")}
                            </div>
                        </div>
                    `).join("")}
                </div>

                ${this._risks.length > 0 ? `
                    <div class="mt-4 pt-3 border-t border-gray-100
                                dark:border-gray-800">
                        <p class="text-xs font-bold text-yellow-500
                                  flex items-center gap-1.5 mb-2">
                            <i class="fas fa-shield-halved text-[10px]"></i>
                            المخاطر التقنية (${this._risks.length})
                        </p>
                        <div class="space-y-1">
                            ${this._risks.map(r => `
                                <p class="text-xs text-gray-500
                                          dark:text-gray-400
                                          flex items-start gap-1.5">
                                    <i class="fas fa-triangle-exclamation
                                               text-yellow-400 text-[10px]
                                               mt-0.5 flex-shrink-0"></i>
                                    ${this._escape(r)}
                                </p>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}

            </div>
        `;
    },


    /* ─────────────────────────────────────────
       _addTech
    ───────────────────────────────────────── */
    _addTech(tech) {
        if (this._stack.length >= MAX_STACK) {
            Toast.warning(`الحد الأقصى ${MAX_STACK} تقنية`);
            return;
        }

        if (this._stack.some(t => t.name === tech.name)) {
            Toast.warning(`"${tech.name}" موجودة بالفعل`);
            return;
        }

        this._stack.push({
            id      : `tech_${Date.now()}_${Math.random()
                        .toString(36).slice(2, 7)}`,
            name    : tech.name,
            icon    : tech.icon     ?? "fa-code",
            category: tech.category ?? "other",
            reason  : tech.reason   ?? "",
        });

        this._saveStack();
        this._renderStackBadges();
        this._renderTechLibrary();
        this._updateStackSummary();
    },


    /* ─────────────────────────────────────────
       _removeTech
    ───────────────────────────────────────── */
    _removeTech(id) {
        const tech = this._stack.find(t => t.id === id);
        this._stack = this._stack.filter(t => t.id !== id);
        this._saveStack();
        this._renderStackBadges();
        this._renderTechLibrary();
        this._updateStackSummary();
        Toast.success(`تم حذف "${tech?.name ?? ""}"`);
    },


    /* ─────────────────────────────────────────
       _saveStack / _saveRisks
    ───────────────────────────────────────── */
    _saveStack() {
        Store.set("tech.stack", [...this._stack]);
    },

    _saveRisks() {
        Store.set("tech.techRisks", [...this._risks]);
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

/**
 * FIKRA — ui/ToastManager.js
 */

import Bus, { EVENTS } from "../core/EventBus.js";


/* ─────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────── */
const CONFIG = {
    maxToasts   : 4,
    duration    : {
        success : 3000,
        error   : 5000,
        warning : 4000,
        info    : 3500,
        loading : null,
    },
    animDuration: 250,
};


/* ─────────────────────────────────────────────────────────
   TOAST TYPES CONFIG
───────────────────────────────────────────────────── */
const TYPES = {
    success: { icon: "fa-circle-check",        iconColor: "text-green-500",  barColor: "bg-green-500"  },
    error  : { icon: "fa-circle-xmark",        iconColor: "text-red-500",    barColor: "bg-red-500"    },
    warning: { icon: "fa-triangle-exclamation",iconColor: "text-yellow-500", barColor: "bg-yellow-500" },
    info   : { icon: "fa-circle-info",         iconColor: "text-blue-500",   barColor: "bg-blue-500"   },
    loading: { icon: null,                     iconColor: "text-brand-500",  barColor: "bg-brand-500"  },
};


/* ─────────────────────────────────────────────────────────
   TOAST MANAGER CLASS
───────────────────────────────────────────────────── */
class ToastManager {

    constructor() {
        /** @type {Map<string, { el: HTMLElement, timer: number|null }>} */
        this._toasts    = new Map();
        this._container = null;
        this._idCounter = 0;
        this._ready     = false;

        // محاولة أولى — لو الـ DOM جاهز
        if (document.readyState !== "loading") {
            this._setup();
        } else {
            document.addEventListener("DOMContentLoaded", () => this._setup());
        }
    }


    /* ─────────────────────────────────────────
       init — يُستدعى من app.js صراحةً
    ───────────────────────────────────────── */
    init() {
        this._setup();
    }


    /* ─────────────────────────────────────────
       _setup — إعداد الـ container والـ events
    ───────────────────────────────────────── */
    _setup() {
        if (this._ready) return; // منع التكرار
        this._ready = true;

        // البحث عن container موجود في الـ HTML
        this._container = document.getElementById("toast-container");

        // لو ما موجود — نصنعه
        if (!this._container) {
            this._container = document.createElement("div");
            this._container.id = "toast-container";
            document.body.appendChild(this._container);
        }

        // الاستماع لـ EventBus
        Bus.on(EVENTS.TOAST_SHOW, ({ msg, type = "info", duration } = {}) => {
            this.show(msg, type, duration);
        });
    }


    /* ─────────────────────────────────────────
       show
    ───────────────────────────────────────── */
    show(msg, type = "info", duration = undefined) {
        // fallback لو الـ DOM لم يكن جاهزاً بعد
        if (!this._container) this._setup();
        if (!this._container || !msg) return "";

        // حذف أقدم toast عند الوصول للحد الأقصى
        if (this._toasts.size >= CONFIG.maxToasts) {
            const firstId = this._toasts.keys().next().value;
            this._remove(firstId, true);
        }

        const id       = `toast-${++this._idCounter}`;
        const typeConf = TYPES[type] ?? TYPES.info;
        const dur      = duration !== undefined
            ? duration
            : CONFIG.duration[type] ?? 3000;

        const el = this._buildEl(id, msg, type, typeConf, dur);
        this._container.appendChild(el);

        requestAnimationFrame(() => el.classList.add("toast-enter"));

        let timer = null;
        if (dur !== null) {
            timer = setTimeout(() => this._remove(id), dur);
        }

        this._toasts.set(id, { el, timer });
        return id;
    }


    /* ─────────────────────────────────────────
       dismiss / dismissAll / update
    ───────────────────────────────────────── */
    dismiss(id)    { this._remove(id); }
    dismissAll()   { [...this._toasts.keys()].forEach(id => this._remove(id)); }

    update(id, msg, newType = "success") {
        const toast = this._toasts.get(id);
        if (!toast) return;

        const { el, timer } = toast;
        const typeConf      = TYPES[newType] ?? TYPES.success;
        const dur           = CONFIG.duration[newType] ?? 3000;

        const iconWrap = el.querySelector(".toast-icon");
        if (iconWrap) {
            iconWrap.innerHTML = `
                <i class="fas ${typeConf.icon}
                   ${typeConf.iconColor} text-base"></i>
            `;
        }

        const msgEl = el.querySelector(".toast-msg");
        if (msgEl) msgEl.textContent = msg;

        const bar = el.querySelector(".toast-bar");
        if (bar) {
            bar.className = `toast-bar absolute bottom-0 right-0
                             h-0.5 rounded-full ${typeConf.barColor}`;
            bar.style.transition = `width ${dur}ms linear`;
            requestAnimationFrame(() => { bar.style.width = "0%"; });
        }

        if (timer) clearTimeout(timer);
        const newTimer = setTimeout(() => this._remove(id), dur);
        this._toasts.set(id, { el, timer: newTimer });
    }


    /* ─────────────────────────────────────────
       Shorthand methods
    ───────────────────────────────────────── */
    success(msg, duration) { return this.show(msg, "success", duration); }
    error  (msg, duration) { return this.show(msg, "error",   duration); }
    warning(msg, duration) { return this.show(msg, "warning", duration); }
    info   (msg, duration) { return this.show(msg, "info",    duration); }
    loading(msg)           { return this.show(msg, "loading", null);     }


    /* ─────────────────────────────────────────
       _buildEl
    ───────────────────────────────────────── */
    _buildEl(id, msg, type, typeConf, dur) {
        const el = document.createElement("div");
        el.id    = id;
        el.setAttribute("role", "alert");
        el.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
        el.className = [
            "pointer-events-auto",
            "flex items-center gap-3",
            "bg-white dark:bg-gray-800",
            "border border-gray-200 dark:border-gray-700",
            "rounded-2xl shadow-lg shadow-black/10",
            "px-4 py-3 min-w-[260px] max-w-[360px]",
            "overflow-hidden relative",
            "cursor-pointer select-none",
        ].join(" ");

        const iconHtml = type === "loading"
            ? `<div class="spinner flex-shrink-0"></div>`
            : `<i class="fas ${typeConf.icon} ${typeConf.iconColor} text-base flex-shrink-0"></i>`;

        const barHtml = dur !== null ? `
            <div class="toast-bar absolute bottom-0 right-0
                        h-0.5 rounded-full ${typeConf.barColor}"
                 style="width: 100%">
            </div>
        ` : "";

        el.innerHTML = `
            <div class="toast-icon flex-shrink-0">${iconHtml}</div>
            <p class="toast-msg text-sm font-semibold
                       text-gray-700 dark:text-gray-200
                       leading-snug flex-1">
                ${this._escapeHtml(msg)}
            </p>
            <button class="toast-close flex-shrink-0 w-5 h-5 rounded-full
                           flex items-center justify-center
                           text-gray-400 hover:text-gray-600
                           dark:hover:text-gray-200 transition-colors"
                    aria-label="إغلاق">
                <i class="fas fa-xmark text-xs"></i>
            </button>
            ${barHtml}
        `;

        if (dur !== null) {
            requestAnimationFrame(() => {
                const bar = el.querySelector(".toast-bar");
                if (bar) {
                    bar.style.transition = `width ${dur}ms linear`;
                    requestAnimationFrame(() => { bar.style.width = "0%"; });
                }
            });
        }

        el.addEventListener("click", () => this._remove(id));
        return el;
    }


    /* ─────────────────────────────────────────
       _remove
    ───────────────────────────────────────── */
    _remove(id, instant = false) {
        const toast = this._toasts.get(id);
        if (!toast) return;

        const { el, timer } = toast;
        if (timer) clearTimeout(timer);
        this._toasts.delete(id);

        if (instant || !el.isConnected) {
            el.remove();
            return;
        }

        el.classList.remove("toast-enter");
        el.classList.add("toast-leave");
        setTimeout(() => el.remove(), CONFIG.animDuration);
    }


    /* ─────────────────────────────────────────
       _escapeHtml
    ───────────────────────────────────────── */
    _escapeHtml(str) {
        const div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
}


/* ─────────────────────────────────────────────────────────
   Singleton Export
───────────────────────────────────────────────────── */
const Toast = new ToastManager();
export default Toast;

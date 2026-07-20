// app.js — نقطة الدخول
import { SingleTab } from "./ui/SingleTab.js";
import { BatchTab }  from "./ui/BatchTab.js";

// ══════════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════════
class Toast {
    constructor() {
        this.container = document.getElementById("toast-container");
    }
    show(message, type = "success", ms = 3000) {
        const cls = { success: "t-success", error: "t-error", info: "t-info", warn: "t-warn" };
        const ico = { success: "fa-check-circle", error: "fa-exclamation-circle", info: "fa-info-circle", warn: "fa-exclamation-triangle" };
        const el = document.createElement("div");
        el.className = `toast-item ${cls[type] ?? cls.success}`;
        el.innerHTML = `<i class="fas ${ico[type] ?? ico.success} text-sm"></i><span>${message}</span>`;
        this.container.appendChild(el);
        setTimeout(() => el.classList.add("out"), ms);
        setTimeout(() => el.remove(), ms + 350);
    }
}

const toast = new Toast();

// ══════════════════════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════════════════════
document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.getElementById("theme-icon").className =
        isDark ? "fas fa-sun text-yellow-400 text-sm" : "fas fa-moon text-gray-600 text-sm";
});

// ══════════════════════════════════════════════════════════════
//  TAB NAVIGATION
// ══════════════════════════════════════════════════════════════
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

function switchTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove(
            "active", "text-blue-600", "dark:text-blue-400",
            "border-blue-600", "dark:border-blue-400",
            "bg-white", "dark:bg-gray-900"
        );
        btn.classList.add("text-gray-500", "dark:text-gray-400", "border-transparent");
    });

    const content = document.getElementById(`tab-${tabId}`);
    content?.classList.remove("hidden");
    content?.classList.add("fade-in");

    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add(
            "active", "text-blue-600", "dark:text-blue-400",
            "border-blue-600", "dark:border-blue-400",
            "bg-white", "dark:bg-gray-900"
        );
        activeBtn.classList.remove("text-gray-500", "dark:text-gray-400", "border-transparent");
    }
}

// ══════════════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════════════
window.singleTab = new SingleTab("tab-single-container", toast);
window.batchTab  = new BatchTab("tab-batch-container", toast);

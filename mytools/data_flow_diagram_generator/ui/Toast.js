// ui/Toast.js — إشعارات خفيفة

export class Toast {
    constructor(containerId = 'toast-container') {
        this.el = document.getElementById(containerId);
    }

    show(msg, type = 'success', duration = 3000) {
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.textContent = msg;
        this.el.appendChild(t);

        setTimeout(() => {
            t.style.opacity  = '0';
            t.style.transform = 'translateY(8px)';
            setTimeout(() => t.remove(), 300);
        }, duration);
    }

    success(msg) { this.show(msg, 'success'); }
    error(msg)   { this.show(msg, 'error'); }
    warning(msg) { this.show(msg, 'warning'); }
}

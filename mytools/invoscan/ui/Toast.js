// ui/Toast.js

export class Toast {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    show(msg, type = 'success', duration = 3000) {
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.textContent = msg;
        this.container.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(8px)';
            el.style.transition = 'opacity .3s, transform .3s';
            setTimeout(() => el.remove(), 320);
        }, duration);
    }

    success(msg) { this.show(msg, 'success'); }
    error(msg)   { this.show(msg, 'error', 4500); }
    warning(msg) { this.show(msg, 'warning'); }
}

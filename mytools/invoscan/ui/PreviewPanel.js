// ui/PreviewPanel.js — معاينة صفحات المستند مع تنقل

import { ImageProcessor } from '../core/ImageProcessor.js';

export class PreviewPanel {
    constructor() {
        this._wrap    = document.getElementById('preview-pages-wrap');
        this._nav     = document.getElementById('preview-nav');
        this._pageInfo= document.getElementById('page-info-lbl');
        this._prevBtn = document.getElementById('btn-prev-page');
        this._nextBtn = document.getElementById('btn-next-page');
        this._pages   = [];
        this._current = 0;
        this._prevBtn?.addEventListener('click', () => this.goto(this._current - 1));
        this._nextBtn?.addEventListener('click', () => this.goto(this._current + 1));
    }

    // Load canvases array into preview panel
    setPages(canvases) {
        this._pages = canvases;
        this._current = 0;
        this._wrap.innerHTML = '';

        canvases.forEach((c, i) => {
            const thumb = ImageProcessor.thumbnail(c, 280);
            const item  = document.createElement('div');
            item.className = 'preview-page-item' + (i === 0 ? ' active' : '');
            item.appendChild(thumb);
            item.addEventListener('click', () => this.goto(i));
            this._wrap.appendChild(item);
        });

        // Show navigation only for multi-page
        if (this._nav) {
            this._nav.style.display = canvases.length > 1 ? 'flex' : 'none';
        }
        this._updateInfo();
    }

    goto(index) {
        const clamped = Math.max(0, Math.min(this._pages.length - 1, index));
        this._current = clamped;

        this._wrap.querySelectorAll('.preview-page-item').forEach((el, i) => {
            el.classList.toggle('active', i === clamped);
        });

        // Scroll active page into view
        const active = this._wrap.querySelectorAll('.preview-page-item')[clamped];
        active?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        this._updateInfo();
    }

    _updateInfo() {
        if (this._pageInfo) {
            this._pageInfo.textContent = `صفحة ${this._current + 1} من ${this._pages.length}`;
        }
    }

    clear() {
        this._pages = [];
        this._wrap.innerHTML = '';
        if (this._nav) this._nav.style.display = 'none';
    }
}

// ui/ProgressPanel.js — لوحة تقدم المعالجة
import { Lang } from '../i18n/Lang.js';

const STAGES = ['stage-load', 'stage-render', 'stage-preprocess', 'stage-ocr', 'stage-extract'];

export class ProgressPanel {
    constructor() {
        this._fill    = document.getElementById('proc-bar-fill');
        this._pct     = document.getElementById('proc-pct');
        this._status  = document.getElementById('proc-status-msg');
        this._fname   = document.getElementById('proc-filename');
        this._badge   = document.getElementById('proc-page-badge');
        this._canvas  = document.getElementById('proc-canvas');
        this._current = -1;
    }

    setFile(name) {
        this._fname.textContent = name;
        this.reset();
    }

    reset() {
        this.setProgress(0, Lang.t('preparing'));
        this._current = -1;
        STAGES.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.classList.remove('active', 'done'); }
        });
    }

    setStage(index) {
        STAGES.forEach((id, i) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.toggle('done',   i < index);
            el.classList.toggle('active', i === index);
        });
        this._current = index;
    }

    doneStage(index) {
        const el = document.getElementById(STAGES[index]);
        if (el) { el.classList.remove('active'); el.classList.add('done'); }
    }

    setProgress(pct, msg) {
        if (pct !== null) {
            this._fill.style.width = pct + '%';
            this._pct.textContent  = pct + '%';
        }
        if (msg) this._status.textContent = msg;
    }

    showPageCanvas(canvas, pageNum) {
        const ctx = this._canvas.getContext('2d');
        const maxW = 380, maxH = window.innerHeight - 180;
        const scale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);
        this._canvas.width  = canvas.width  * scale;
        this._canvas.height = canvas.height * scale;
        ctx.drawImage(canvas, 0, 0, this._canvas.width, this._canvas.height);
        if (this._badge) this._badge.textContent = `${Lang.t('procPage')} ${pageNum}`;
    }
}

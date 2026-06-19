// core/FileHandler.js — التحقق من الملفات والرفع

const MAX_SIZE_MB = 20;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTS  = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

export class FileHandler {
    constructor(dropzoneEl, fileInputEl, callbacks) {
        this.dz  = dropzoneEl;
        this.inp = fileInputEl;
        this.cb  = callbacks; // { onFiles(files), onError(msg) }
        this._bind();
    }

    _bind() {
        // Drag events
        this.dz.addEventListener('dragenter', e => { e.preventDefault(); this.dz.classList.add('drag-over'); });
        this.dz.addEventListener('dragover',  e => { e.preventDefault(); this.dz.classList.add('drag-over'); });
        this.dz.addEventListener('dragleave', e => {
            if (!this.dz.contains(e.relatedTarget)) this.dz.classList.remove('drag-over');
        });
        this.dz.addEventListener('drop', e => {
            e.preventDefault();
            this.dz.classList.remove('drag-over');
            this._handleFiles(Array.from(e.dataTransfer.files));
        });

        // Click to browse
        this.dz.addEventListener('click', () => this.inp.click());

        // File input change
        this.inp.addEventListener('change', e => {
            this._handleFiles(Array.from(e.target.files));
            e.target.value = '';
        });
    }

    _handleFiles(files) {
        const valid = [];
        for (const f of files) {
            const err = this._validate(f);
            if (err) { this.cb.onError(err); continue; }
            valid.push(f);
        }
        if (valid.length) this.cb.onFiles(valid);
    }

    _validate(file) {
        const ext  = '.' + file.name.split('.').pop().toLowerCase();
        const ok   = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(ext);
        if (!ok) return `نوع الملف غير مدعوم: ${file.name}`;
        const mb = file.size / 1024 / 1024;
        if (mb > MAX_SIZE_MB) return `الملف ${file.name} أكبر من ${MAX_SIZE_MB}MB (${mb.toFixed(1)}MB)`;
        return null;
    }

    static fileIcon(file) {
        if (file.type === 'application/pdf') return 'fas fa-file-pdf';
        return 'fas fa-file-image';
    }

    static formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }
}

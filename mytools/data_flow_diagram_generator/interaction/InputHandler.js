// interaction/InputHandler.js — معالج جميع أحداث الإدخال

import { EdgeShape } from '../diagram/EdgeShape.js';

export class InputHandler {
    constructor(svgEl, store, renderer, history, callbacks) {
        this.svg      = svgEl;
        this.store    = store;
        this.renderer = renderer;
        this.history  = history;
        this.cb       = callbacks;  // { onRender, onPropsShow, onPropsHide, onEdgeRequest }

        // Drag state
        this._drag   = null;   // { nodeId, startMX, startMY, startNX, startNY }
        // Pan state
        this._pan    = null;   // { startMX, startMY, startTx, startTy }
        // Rubber band
        this._rubber = null;   // { x1, y1, x2, y2 }
        // Connect: waiting for second node
        this._connectFrom = null;
        // Live cursor position for connect preview
        this._cursor = null;

        this._bind();
    }

    // ── Event binding ────────────────────────────────────────
    _bind() {
        this.svg.addEventListener('mousedown',  e => this._onDown(e));
        this.svg.addEventListener('mousemove',  e => this._onMove(e));
        this.svg.addEventListener('mouseup',    e => this._onUp(e));
        this.svg.addEventListener('mouseleave', e => this._onLeave(e));
        this.svg.addEventListener('wheel',      e => this._onWheel(e), { passive: false });
        this.svg.addEventListener('dblclick',   e => this._onDbl(e));
    }

    // ── Identify target ──────────────────────────────────────
    _findNode(e) {
        let el = e.target;
        while (el && el !== this.svg) {
            if (el.classList?.contains('dfd-node')) return el.dataset.id;
            el = el.parentElement;
        }
        return null;
    }

    _findEdge(e) {
        let el = e.target;
        while (el && el !== this.svg) {
            if (el.classList?.contains('dfd-edge')) return el.dataset.id;
            el = el.parentElement;
        }
        return null;
    }

    // ── Mouse Down ───────────────────────────────────────────
    _onDown(e) {
        if (e.button !== 0) return;
        const s  = this.store;
        const cp = this.renderer.screenToCanvas(e.clientX, e.clientY);
        const nId = this._findNode(e);
        const eId = this._findEdge(e);

        // ── Connect mode ──────────────────────────────────────
        if (s.mode === 'connect') {
            if (nId) {
                if (!this._connectFrom) {
                    this._connectFrom = nId;
                    this._cursor = cp;
                    this.cb.onRender();
                } else if (nId !== this._connectFrom) {
                    this.cb.onEdgeRequest(this._connectFrom, nId);
                    this._connectFrom = null;
                    this._cursor = null;
                    this.cb.onRender();
                }
            }
            return;
        }

        // ── Pan mode (or middle-click) ────────────────────────
        if (s.mode === 'pan' || e.button === 1) {
            this._pan = { startMX: e.clientX, startMY: e.clientY, startTx: s.tx, startTy: s.ty };
            this.svg.style.cursor = 'grabbing';
            return;
        }

        // ── Select mode ───────────────────────────────────────
        if (nId) {
            if (!e.shiftKey && !s.selectedIds.has(nId)) s.clearSelection();
            s.select(nId, true);
            const node = s.getNode(nId);
            this._drag = { nodeId: nId, startMX: e.clientX, startMY: e.clientY, startNX: node.x, startNY: node.y };
            this.cb.onPropsShow(nId);
            this.cb.onRender();
            return;
        }

        if (eId) {
            s.clearSelection();
            s.select(eId, true);
            this.cb.onPropsShow(eId, 'edge');
            this.cb.onRender();
            return;
        }

        // Click on empty canvas → start rubber band
        if (!e.shiftKey) s.clearSelection();
        this._rubber = { x1: cp.x, y1: cp.y, x2: cp.x, y2: cp.y };
        this.cb.onPropsHide();
        this.cb.onRender();
    }

    // ── Mouse Move ───────────────────────────────────────────
    _onMove(e) {
        const s  = this.store;
        const cp = this.renderer.screenToCanvas(e.clientX, e.clientY);

        if (this._connectFrom) {
            this._cursor = cp;
            const fn = s.getNode(this._connectFrom);
            if (fn) {
                const sp = EdgeShape._cp(fn, cp.x, cp.y);
                this.renderer.setUIContent(EdgeShape.renderPreview(sp, cp));
                this.renderer.render();
            }
            return;
        }

        if (this._pan) {
            s.tx = this._pan.startTx + (e.clientX - this._pan.startMX);
            s.ty = this._pan.startTy + (e.clientY - this._pan.startMY);
            this.cb.onRender();
            return;
        }

        if (this._drag) {
            const dx = (e.clientX - this._drag.startMX) / s.scale;
            const dy = (e.clientY - this._drag.startMY) / s.scale;
            const node = s.getNode(this._drag.nodeId);
            if (node) {
                node.x = s.snapOn ? Math.round((this._drag.startNX + dx) / 20) * 20 : this._drag.startNX + dx;
                node.y = s.snapOn ? Math.round((this._drag.startNY + dy) / 20) * 20 : this._drag.startNY + dy;
            }
            this.cb.onRender();
            return;
        }

        if (this._rubber) {
            this._rubber.x2 = cp.x;
            this._rubber.y2 = cp.y;
            const rb = this._rubber;
            const x = Math.min(rb.x1, rb.x2), y = Math.min(rb.y1, rb.y2);
            const w = Math.abs(rb.x2 - rb.x1), h = Math.abs(rb.y2 - rb.y1);
            this.renderer.setUIContent(
                `<rect x="${x}" y="${y}" width="${w}" height="${h}"
                 fill="var(--accent-faint)" stroke="var(--accent)" stroke-width="1" stroke-dasharray="4,2"/>`
            );
            this.cb.onRender();
        }
    }

    // ── Mouse Up ─────────────────────────────────────────────
    _onUp(e) {
        const s = this.store;

        if (this._pan) {
            this._pan = null;
            this.svg.style.cursor = '';
            return;
        }

        if (this._drag) {
            this.history.push();
            this._drag = null;
            return;
        }

        if (this._rubber) {
            const rb = this._rubber;
            const minX = Math.min(rb.x1, rb.x2), maxX = Math.max(rb.x1, rb.x2);
            const minY = Math.min(rb.y1, rb.y2), maxY = Math.max(rb.y1, rb.y2);
            s.nodes.forEach(n => {
                if (n.x >= minX && n.x <= maxX && n.y >= minY && n.y <= maxY) {
                    s.select(n.id, true);
                }
            });
            this._rubber = null;
            this.renderer.clearUI();
            this.cb.onRender();
        }
    }

    _onLeave() {
        if (this._pan)  { this._pan = null; this.svg.style.cursor = ''; }
    }

    // ── Scroll Wheel → Zoom ──────────────────────────────────
    _onWheel(e) {
        e.preventDefault();
        const s = this.store;
        const r = this.svg.getBoundingClientRect();
        const mx = e.clientX - r.left;
        const my = e.clientY - r.top;
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(0.1, Math.min(5, s.scale * (1 + delta)));
        const ratio = newScale / s.scale;
        s.tx = mx - (mx - s.tx) * ratio;
        s.ty = my - (my - s.ty) * ratio;
        s.scale = newScale;
        this.cb.onRender();
    }

    // ── Double Click → edit label ────────────────────────────
    _onDbl(e) {
        const s  = this.store;
        const nId = this._findNode(e);
        if (nId) {
            const node = s.getNode(nId);
            const newLabel = prompt('تعديل التسمية:', node.label);
            if (newLabel !== null) {
                node.label = newLabel.trim() || node.label;
                this.history.push();
                this.cb.onRender();
                this.cb.onPropsShow(nId);
            }
            return;
        }
        // Double click on empty canvas → add process
        if (s.mode === 'select') {
            const cp = this.renderer.screenToCanvas(e.clientX, e.clientY);
            const n  = s.createNode('process', cp.x - 50, cp.y - 50);
            s.addNode(n);
            s.clearSelection();
            s.select(n.id);
            this.history.push();
            this.cb.onRender();
            this.cb.onPropsShow(n.id);
        }
    }

    // ── Keyboard ─────────────────────────────────────────────
    bindKeys() {
        window.addEventListener('keydown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            const s = this.store;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                s.deleteSelected();
                this.history.push();
                this.cb.onPropsHide();
                this.cb.onRender();
            }

            if ((e.key === 'z' && (e.ctrlKey || e.metaKey)) && !e.shiftKey) {
                e.preventDefault();
                if (this.history.undo()) { this.cb.onPropsHide(); this.cb.onRender(); }
            }

            if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
                (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
                e.preventDefault();
                if (this.history.redo()) { this.cb.onPropsHide(); this.cb.onRender(); }
            }

            if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                s.nodes.forEach(n => s.select(n.id, true));
                this.cb.onRender();
            }

            if (e.key === 'Escape') {
                this._connectFrom = null;
                this._cursor = null;
                this.renderer.clearUI();
                s.clearSelection();
                this.cb.onPropsHide();
                this.cb.onRender();
            }

            if (e.key === 'v' && !e.ctrlKey) this.cb.onSetMode('select');
            if (e.key === 'c' && !e.ctrlKey) this.cb.onSetMode('connect');
            if (e.key === 'h' && !e.ctrlKey) this.cb.onSetMode('pan');
        });
    }

    cancelConnect() {
        this._connectFrom = null;
        this._cursor = null;
        this.renderer.clearUI();
    }
}

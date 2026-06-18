// diagram/Renderer.js — المحرك الرئيسي للرسم على SVG

import { NodeShape } from './NodeShape.js';
import { EdgeShape }  from './EdgeShape.js';

export class Renderer {
    constructor(svgEl, store) {
        this.svg    = svgEl;
        this.store  = store;
        this._vp    = svgEl.querySelector('#vp');
        this._edges = svgEl.querySelector('#layer-edges');
        this._nodes = svgEl.querySelector('#layer-nodes');
        this._ui    = svgEl.querySelector('#layer-ui');
        this._grid  = svgEl.querySelector('#grid-bg');
        this._uiContent = '';
    }

    render() {
        const s = this.store;

        // Apply viewport transform
        this._vp.setAttribute('transform', `translate(${s.tx},${s.ty}) scale(${s.scale})`);

        // Grid
        this._grid.setAttribute('visibility', s.gridOn ? 'visible' : 'hidden');
        this._grid.setAttribute('fill',
            `url(#grid-${document.documentElement.classList.contains('dark') ? 'dark' : 'light'})`
        );

        // Edges (render before nodes so nodes appear on top)
        this._edges.innerHTML = s.edges
            .map(e => EdgeShape.render(e, s.getNode(e.from), s.getNode(e.to), s.selectedIds.has(e.id)))
            .join('');

        // Nodes
        this._nodes.innerHTML = s.nodes
            .map(n => NodeShape.render(n, s.selectedIds.has(n.id)))
            .join('');

        // UI overlay (rubber band, connect preview)
        this._ui.innerHTML = this._uiContent;
    }

    setUIContent(html) {
        this._uiContent = html;
    }

    clearUI() {
        this._uiContent = '';
        this._ui.innerHTML = '';
    }

    // ── Convert screen coords → canvas coords ───────────────
    screenToCanvas(sx, sy) {
        const r = this.svg.getBoundingClientRect();
        return {
            x: (sx - r.left - this.store.tx) / this.store.scale,
            y: (sy - r.top  - this.store.ty) / this.store.scale,
        };
    }

    // ── Build clean exportable SVG (no selection, white bg) ──
    buildExportSVG() {
        const s      = this.store;
        const bounds = s.getBounds();
        if (!bounds) return null;

        const pad = 50;
        const W   = bounds.maxX - bounds.minX + pad * 2;
        const H   = bounds.maxY - bounds.minY + pad * 2;
        const dx  = -bounds.minX + pad;
        const dy  = -bounds.minY + pad;

        // Temporarily shift all nodes, clear selection
        const savedSel = new Set(s.selectedIds);
        s.selectedIds.clear();
        s.nodes.forEach(n => { n.x += dx; n.y += dy; });

        // Render with shifted positions
        const edgesHTML = s.edges
            .map(e => EdgeShape.render(e, s.getNode(e.from), s.getNode(e.to), false))
            .join('');
        const nodesHTML = s.nodes
            .map(n => NodeShape.render(n, false))
            .join('');

        // Restore original positions
        s.nodes.forEach(n => { n.x -= dx; n.y -= dy; });
        s.selectedIds = savedSel;

        // Inline all CSS variables so SVG is self-contained
        const styles = `
        :root {
            --entity-bg:#f0fdf4;--entity-stroke:#16a34a;--entity-stroke-sel:#2563eb;--entity-sel:#dbeafe;--entity-text:#14532d;
            --process-bg:#eff6ff;--process-stroke:#3b82f6;--process-stroke-sel:#2563eb;--process-sel:#dbeafe;--process-text:#1e3a8a;--process-num:#1d4ed8;
            --store-bg:#faf5ff;--store-stroke:#7c3aed;--store-stroke-sel:#2563eb;--store-sel:#ede9fe;--store-text:#3b0764;--store-num:#6d28d9;
            --note-bg:#fffbeb;--note-stroke:#f59e0b;--note-stroke-sel:#d97706;--note-sel:#fef9c3;--note-text:#92400e;
            --edge-stroke:#64748b;--accent:#2563eb;--surface:#ffffff;--text:#0f172a;--text-2:#475569;
        }`;

        const defs = this.svg.querySelector('defs').outerHTML;

        return `<svg xmlns="http://www.w3.org/2000/svg"
            width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
            style="background:#ffffff;font-family:Tajawal,sans-serif">
            <defs>
                <marker id="arr-default" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L9,3 L0,6 Z" fill="#64748b"/>
                </marker>
                <marker id="arr-accent" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L9,3 L0,6 Z" fill="#2563eb"/>
                </marker>
            </defs>
            <style>${styles}</style>
            ${edgesHTML}${nodesHTML}
        </svg>`;
    }
}

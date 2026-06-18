// ui/MiniMap.js — الخريطة المصغرة

const MM_W = 160, MM_H = 100;

export class MiniMap {
    constructor(svgId, store) {
        this.svg   = document.getElementById(svgId);
        this.store = store;
    }

    render() {
        const s      = this.store;
        const bounds = s.getBounds();

        const bg  = document.documentElement.classList.contains('dark') ? '#1e293b' : '#f8fafc';
        this.svg.querySelector('#mm-bg')?.setAttribute('fill', bg);

        if (!bounds) {
            this.svg.querySelector('#mm-nodes')?.setAttribute('html', '');
            return;
        }

        const pad = 20;
        const bW  = bounds.maxX - bounds.minX + pad * 2;
        const bH  = bounds.maxY - bounds.minY + pad * 2;
        const sc  = Math.min(MM_W / bW, MM_H / bH);
        const ox  = (MM_W - bW * sc) / 2 - (bounds.minX - pad) * sc;
        const oy  = (MM_H - bH * sc) / 2 - (bounds.minY - pad) * sc;

        const colorMap = {
            entity: '#16a34a', process: '#3b82f6',
            datastore: '#7c3aed', annotation: '#f59e0b',
        };

        const nodesHTML = s.nodes.map(n => {
            const x = n.x * sc + ox, y = n.y * sc + oy;
            const w = n.w * sc, h = n.h * sc;
            const fill = colorMap[n.type] || '#64748b';
            if (n.type === 'process') {
                const r = Math.max(3, w / 2);
                return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity=".55"/>`;
            }
            return `<rect x="${x - w/2}" y="${y - h/2}" width="${Math.max(4,w)}" height="${Math.max(3,h)}" rx="1" fill="${fill}" opacity=".55"/>`;
        }).join('');

        const edgesHTML = s.edges.map(e => {
            const fn = s.getNode(e.from), tn = s.getNode(e.to);
            if (!fn || !tn) return '';
            return `<line x1="${fn.x*sc+ox}" y1="${fn.y*sc+oy}" x2="${tn.x*sc+ox}" y2="${tn.y*sc+oy}" stroke="#94a3b8" stroke-width=".8" opacity=".6"/>`;
        }).join('');

        document.getElementById('mm-nodes').innerHTML = edgesHTML + nodesHTML;

        // Viewport indicator
        const svgEl = document.getElementById('dfd-svg');
        if (svgEl) {
            const r  = svgEl.getBoundingClientRect();
            const vx = (-s.tx / s.scale) * sc + ox;
            const vy = (-s.ty / s.scale) * sc + oy;
            const vW = (r.width  / s.scale) * sc;
            const vH = (r.height / s.scale) * sc;
            const rect = document.getElementById('mm-viewport');
            if (rect) {
                rect.setAttribute('x', vx); rect.setAttribute('y', vy);
                rect.setAttribute('width', vW); rect.setAttribute('height', vH);
            }
        }
    }
}

// diagram/EdgeShape.js — رسم تدفقات البيانات (الأسهم)

const esc = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export class EdgeShape {

    // ── Connection point on node boundary ────────────────────
    static _cp(node, tx, ty) {
        const dx = tx - node.x, dy = ty - node.y;
        const d  = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / d, uy = dy / d;

        if (node.type === 'process') {
            const r = node.w / 2 + 2;
            return { x: node.x + ux * r, y: node.y + uy * r };
        }

        const hw = node.w / 2 + 2, hh = node.h / 2 + 2;
        const scx = hw / Math.abs(dx || 0.001);
        const scy = hh / Math.abs(dy || 0.001);
        return {
            x: node.x + dx * Math.min(scx, scy),
            y: node.y + dy * Math.min(scx, scy),
        };
    }

    // ── Render single edge ───────────────────────────────────
    static render(edge, fromNode, toNode, selected) {
        if (!fromNode || !toNode) return '';

        const sp = EdgeShape._cp(fromNode, toNode.x, toNode.y);
        const ep = EdgeShape._cp(toNode,   fromNode.x, fromNode.y);
        const mx = (sp.x + ep.x) / 2;
        const my = (sp.y + ep.y) / 2;

        const stroke = selected ? 'var(--accent)' : 'var(--edge-stroke)';
        const sw     = selected ? 2 : 1.5;
        const arr    = selected ? 'arr-accent' : 'arr-default';
        const lbl    = edge.label || '';

        let labelSVG = '';
        if (lbl) {
            const w = Math.min(lbl.length * 7.5 + 20, 140);
            labelSVG = `
            <rect x="${mx - w / 2}" y="${my - 11}" width="${w}" height="22" rx="5"
                  fill="var(--surface)" stroke="${stroke}" stroke-width="0.8" opacity=".96"/>
            <text x="${mx}" y="${my + 1}" text-anchor="middle" dominant-baseline="middle"
                  font-family="Tajawal,sans-serif" font-size="11"
                  fill="${selected ? 'var(--accent)' : 'var(--text-2)'}">${esc(lbl)}</text>`;
        }

        return `<g class="dfd-edge" data-id="${edge.id}" style="cursor:pointer">
            <line x1="${sp.x}" y1="${sp.y}" x2="${ep.x}" y2="${ep.y}" stroke="transparent" stroke-width="12"/>
            <line x1="${sp.x}" y1="${sp.y}" x2="${ep.x}" y2="${ep.y}"
                  stroke="${stroke}" stroke-width="${sw}" marker-end="url(#${arr})"/>
            ${labelSVG}
        </g>`;
    }

    // ── Preview line while connecting ────────────────────────
    static renderPreview(from, to) {
        return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
            stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="6,3"
            marker-end="url(#arr-accent)" opacity=".7"/>`;
    }
}

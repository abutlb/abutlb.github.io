// diagram/NodeShape.js — رسم أشكال العناصر بمعيار Yourdon-DeMarco

const esc = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrapText(text, maxCh = 14) {
    if (!text) return [''];
    const words = String(text).split(' ');
    const lines = []; let cur = '';
    for (const w of words) {
        if ((cur + w).length > maxCh && cur) { lines.push(cur.trim()); cur = ''; }
        cur += w + ' ';
    }
    if (cur.trim()) lines.push(cur.trim());
    return lines.slice(0, 3);
}

function multilineText(lines, x, cy, fz, fill, bold = false, anchor = 'middle') {
    if (!lines.length) return '';
    const lh = fz * 1.45;
    const totalH = (lines.length - 1) * lh;
    const startY = cy - totalH / 2;
    const fw = bold ? 'font-weight="700"' : '';
    const tspans = lines.map((l, i) =>
        `<tspan x="${x}" ${i === 0 ? `y="${startY}"` : `dy="${lh}"`}>${esc(l)}</tspan>`
    ).join('');
    return `<text text-anchor="${anchor}" font-family="Tajawal,sans-serif" font-size="${fz}" fill="${fill}" ${fw}>${tspans}</text>`;
}

export class NodeShape {

    // ── External Entity ─── rectangle ───────────────────────
    static entity(n, selected) {
        const hw = n.w / 2, hh = n.h / 2;
        const fill   = selected ? 'var(--entity-sel)'   : 'var(--entity-bg)';
        const stroke = selected ? 'var(--entity-stroke-sel)' : 'var(--entity-stroke)';
        const sw     = selected ? 2.5 : 1.5;
        const lines  = wrapText(n.label, 16);
        const txtFill = 'var(--entity-text)';
        const selRing = selected
            ? `<rect x="${-hw - 4}" y="${-hh - 4}" width="${n.w + 8}" height="${n.h + 8}" rx="6" fill="none" stroke="var(--accent)" stroke-width="1" stroke-dasharray="4,3"/>`
            : '';
        return `
        ${selRing}
        <rect x="${-hw}" y="${-hh}" width="${n.w}" height="${n.h}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
        ${multilineText(lines, 0, 0, 12, txtFill, true)}`;
    }

    // ── Process ─── circle with horizontal divider ───────────
    static process(n, selected) {
        const r = n.w / 2;
        const fill   = selected ? 'var(--process-sel)' : 'var(--process-bg)';
        const stroke = selected ? 'var(--process-stroke-sel)' : 'var(--process-stroke)';
        const sw     = selected ? 2.5 : 1.5;
        const numY   = -r * 0.28;
        const lblLines = wrapText(n.label, 12);
        const lblY   = r * 0.15 + (lblLines.length > 1 ? 6 : 4);
        const selRing = selected
            ? `<circle cx="0" cy="0" r="${r + 5}" fill="none" stroke="var(--accent)" stroke-width="1" stroke-dasharray="4,3"/>`
            : '';
        return `
        ${selRing}
        <circle cx="0" cy="0" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
        <line x1="${-r + 5}" y1="${-r * 0.05}" x2="${r - 5}" y2="${-r * 0.05}" stroke="${stroke}" stroke-width="1.2"/>
        ${multilineText([n.number || '?'], 0, numY, 10, 'var(--process-num)', true)}
        ${multilineText(lblLines, 0, lblY, 11, 'var(--process-text)')}`;
    }

    // ── Data Store ─── open rectangle (Yourdon style) ────────
    static datastore(n, selected) {
        const hw = n.w / 2, hh = n.h / 2;
        const fill   = selected ? 'var(--store-sel)' : 'var(--store-bg)';
        const stroke = selected ? 'var(--store-stroke-sel)' : 'var(--store-stroke)';
        const sw     = selected ? 2.5 : 1.5;
        const idW    = 40;
        const selRing = selected
            ? `<rect x="${-hw - 4}" y="${-hh - 4}" width="${n.w + 8}" height="${n.h + 8}" rx="4" fill="none" stroke="var(--accent)" stroke-width="1" stroke-dasharray="4,3"/>`
            : '';
        return `
        ${selRing}
        <rect x="${-hw}" y="${-hh}" width="${n.w}" height="${n.h}" fill="${fill}" stroke="none"/>
        <line x1="${-hw}" y1="${-hh}" x2="${hw}" y2="${-hh}" stroke="${stroke}" stroke-width="${sw}"/>
        <line x1="${-hw}" y1="${hh}" x2="${hw}" y2="${hh}" stroke="${stroke}" stroke-width="${sw}"/>
        <line x1="${-hw}" y1="${-hh}" x2="${-hw}" y2="${hh}" stroke="${stroke}" stroke-width="${sw}"/>
        <line x1="${-hw + idW}" y1="${-hh}" x2="${-hw + idW}" y2="${hh}" stroke="${stroke}" stroke-width="1.2"/>
        ${multilineText([n.number || 'D?'], -hw + idW / 2, 0, 9, 'var(--store-num)', true)}
        ${multilineText(wrapText(n.label, 14), -hw + idW + (n.w - idW) / 2, 0, 12, 'var(--store-text)')}`;
    }

    // ── Annotation ─── dashed rectangle ──────────────────────
    static annotation(n, selected) {
        const hw = n.w / 2, hh = n.h / 2;
        const fill   = selected ? 'var(--note-sel)' : 'var(--note-bg)';
        const stroke = selected ? 'var(--note-stroke-sel)' : 'var(--note-stroke)';
        const sw     = selected ? 2 : 1.5;
        const lines  = wrapText(n.label, 18);
        return `
        <rect x="${-hw}" y="${-hh}" width="${n.w}" height="${n.h}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="5,3"/>
        ${multilineText(lines, 0, 0, 11, 'var(--note-text)')}`;
    }

    // ── Connection point for edge routing ────────────────────
    static connectionPoint(node, targetX, targetY) {
        const dx = targetX - node.x;
        const dy = targetY - node.y;
        const d  = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / d, uy = dy / d;

        if (node.type === 'process') {
            const r = node.w / 2 + 2;
            return { x: node.x + ux * r, y: node.y + uy * r };
        }

        const hw = node.w / 2 + 2, hh = node.h / 2 + 2;
        const scx = hw / Math.abs(dx || 0.001);
        const scy = hh / Math.abs(dy || 0.001);
        const sc  = Math.min(scx, scy);
        return { x: node.x + dx * sc, y: node.y + dy * sc };
    }

    // ── Full node SVG (wrapped in <g>) ────────────────────────
    static render(node, selected) {
        let inner = '';
        if (node.type === 'entity')     inner = NodeShape.entity(node, selected);
        else if (node.type === 'process')    inner = NodeShape.process(node, selected);
        else if (node.type === 'datastore')  inner = NodeShape.datastore(node, selected);
        else if (node.type === 'annotation') inner = NodeShape.annotation(node, selected);

        return `<g class="dfd-node" data-id="${node.id}" data-type="${node.type}" transform="translate(${node.x},${node.y})" style="cursor:move">${inner}</g>`;
    }
}

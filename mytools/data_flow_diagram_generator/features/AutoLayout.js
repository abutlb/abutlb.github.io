// features/AutoLayout.js — ترتيب تلقائي هرمي بخوارزمية BFS

const COL_W = 240;
const ROW_H = 140;

export class AutoLayout {
    static apply(store) {
        if (!store.nodes.length) return;

        // Build adjacency and in-degree map
        const inDeg = new Map();
        const adj   = new Map();
        store.nodes.forEach(n => { inDeg.set(n.id, 0); adj.set(n.id, []); });
        store.edges.forEach(e => {
            inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
            adj.get(e.from)?.push(e.to);
        });

        // BFS layering
        const layers = new Map();
        const queue  = [];
        store.nodes.forEach(n => {
            if (!inDeg.get(n.id)) { layers.set(n.id, 0); queue.push(n.id); }
        });

        // If no roots (cycle), assign layer 0 to all
        if (!queue.length) {
            store.nodes.forEach(n => { layers.set(n.id, 0); queue.push(n.id); });
        }

        while (queue.length) {
            const id = queue.shift();
            const ly = layers.get(id) || 0;
            (adj.get(id) || []).forEach(toId => {
                if (!layers.has(toId) || layers.get(toId) <= ly) {
                    layers.set(toId, ly + 1);
                    queue.push(toId);
                }
            });
        }

        // Group nodes by layer
        const groups = new Map();
        store.nodes.forEach(n => {
            const l = layers.get(n.id) || 0;
            if (!groups.has(l)) groups.set(l, []);
            groups.get(l).push(n);
        });

        // Position nodes within each layer
        const startX = 200, startY = 300;
        groups.forEach((nodes, layer) => {
            const totalH = (nodes.length - 1) * ROW_H;
            nodes.forEach((node, i) => {
                node.x = startX + layer * COL_W;
                node.y = startY + i * ROW_H - totalH / 2;
            });
        });
    }
}

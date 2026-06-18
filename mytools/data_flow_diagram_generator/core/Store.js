// core/Store.js — مصدر الحقيقة الوحيد للتطبيق

export const GRID = 20;
export const SNAP = v => Math.round(v / GRID) * GRID;

export const NODE_DEFAULTS = {
    entity:     { w: 140, h: 60  },
    process:    { w: 100, h: 100 },
    datastore:  { w: 170, h: 52  },
    annotation: { w: 160, h: 72  },
};

export function uid() {
    return '_' + Math.random().toString(36).slice(2, 9);
}

export class Store {
    constructor() {
        this.nodes   = [];
        this.edges   = [];
        this.project = { name: '', author: '', level: '0', created: '' };

        // View transform
        this.tx    = 0;
        this.ty    = 0;
        this.scale = 1;

        // Interaction state
        this.mode        = 'select';  // 'select' | 'connect' | 'pan'
        this.selectedIds = new Set();
        this.snapOn      = true;
        this.gridOn      = true;

        // Auto-numbering counters
        this._pCtr = 1;
        this._dCtr = 1;
    }

    // ── Node factory ────────────────────────────────────────
    createNode(type, x, y) {
        const def = NODE_DEFAULTS[type] || { w: 120, h: 60 };
        const cx  = this.snapOn ? SNAP(x) : x;
        const cy  = this.snapOn ? SNAP(y) : y;
        const n = {
            id: uid(), type, label: Store._defaultLabel(type),
            x: cx, y: cy, w: def.w, h: def.h,
            number: '', description: '',
        };
        if (type === 'process')   n.number = String(this._pCtr++);
        if (type === 'datastore') n.number = 'D' + this._dCtr++;
        return n;
    }

    static _defaultLabel(type) {
        return { entity: 'كيان', process: 'عملية', datastore: 'مخزن', annotation: 'ملاحظة' }[type] || '';
    }

    addNode(node) {
        this.nodes.push(node);
    }

    removeNode(id) {
        this.nodes  = this.nodes.filter(n => n.id !== id);
        this.edges  = this.edges.filter(e => e.from !== id && e.to !== id);
        this.selectedIds.delete(id);
    }

    // ── Edge factory ────────────────────────────────────────
    createEdge(from, to, label = '', description = '') {
        return { id: uid(), from, to, label, description };
    }

    addEdge(edge) {
        this.edges.push(edge);
    }

    removeEdge(id) {
        this.edges = this.edges.filter(e => e.id !== id);
        this.selectedIds.delete(id);
    }

    // ── Selection helpers ───────────────────────────────────
    select(id, additive = false) {
        if (!additive) this.selectedIds.clear();
        this.selectedIds.add(id);
    }

    clearSelection() {
        this.selectedIds.clear();
    }

    deleteSelected() {
        [...this.selectedIds].forEach(id => {
            if (this.getNode(id))  this.removeNode(id);
            else if (this.getEdge(id)) this.removeEdge(id);
        });
        this.selectedIds.clear();
    }

    // ── Getters ─────────────────────────────────────────────
    getNode(id)  { return this.nodes.find(n => n.id === id); }
    getEdge(id)  { return this.edges.find(e => e.id === id); }

    getStats() {
        return {
            entities:  this.nodes.filter(n => n.type === 'entity').length,
            processes: this.nodes.filter(n => n.type === 'process').length,
            stores:    this.nodes.filter(n => n.type === 'datastore').length,
            flows:     this.edges.length,
        };
    }

    getBounds() {
        if (!this.nodes.length) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.nodes.forEach(n => {
            minX = Math.min(minX, n.x - n.w / 2);
            maxX = Math.max(maxX, n.x + n.w / 2);
            minY = Math.min(minY, n.y - n.h / 2);
            maxY = Math.max(maxY, n.y + n.h / 2);
        });
        return { minX, minY, maxX, maxY };
    }

    // ── Serialization ────────────────────────────────────────
    serialize() {
        return {
            nodes: this.nodes, edges: this.edges,
            project: this.project,
            _pCtr: this._pCtr, _dCtr: this._dCtr,
        };
    }

    deserialize(data) {
        this.nodes   = data.nodes   || [];
        this.edges   = data.edges   || [];
        this.project = data.project || { name: '', author: '', level: '0' };
        this._pCtr   = data._pCtr   || 1;
        this._dCtr   = data._dCtr   || 1;
        this.selectedIds.clear();
    }

    // ── Snapshot for history ─────────────────────────────────
    snapshot() {
        return JSON.parse(JSON.stringify({ nodes: this.nodes, edges: this.edges, _pCtr: this._pCtr, _dCtr: this._dCtr }));
    }

    restoreSnapshot(snap) {
        this.nodes  = snap.nodes;
        this.edges  = snap.edges;
        this._pCtr  = snap._pCtr;
        this._dCtr  = snap._dCtr;
        this.selectedIds.clear();
    }
}

// ui/PropsPanel.js — لوحة الخصائص للعنصر المحدد

import { T } from './i18n.js';

const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

export class PropsPanel {
    constructor(panelId, store, history, onRender) {
        this.panel    = document.getElementById(panelId);
        this.store    = store;
        this.history  = history;
        this.onRender = onRender;
    }

    show(id, kind = 'node') {
        const s = this.store;
        const item = kind === 'edge' ? s.getEdge(id) : s.getNode(id);
        if (!item) return;

        this.panel.classList.add('visible');

        if (kind === 'edge') {
            this._renderEdge(item);
        } else {
            this._renderNode(item);
        }
    }

    hide() {
        this.panel.classList.remove('visible');
        const body = this.panel.querySelector('#props-body');
        if (body) body.innerHTML = '';
    }

    _renderNode(node) {
        const tr = T();
        const typeLabel = tr.props.types[node.type] || node.type;

        const typeColor = {
            entity: 'var(--entity-stroke)', process: 'var(--process-stroke)',
            datastore: 'var(--store-stroke)', annotation: 'var(--note-stroke)',
        }[node.type] || 'var(--accent)';

        let html = `
            <div class="props-type-badge" style="color:${typeColor}">
                ${PropsPanel._icon(node.type)} ${typeLabel}
            </div>
            <div class="prop-field">
                <label>${tr.props.label}</label>
                <input id="prop-label" class="prop-input" value="${esc(node.label)}">
            </div>`;

        if (node.type === 'process') {
            html += `<div class="prop-field">
                <label>${tr.props.number}</label>
                <input id="prop-number" class="prop-input" value="${esc(node.number)}">
            </div>`;
        }

        if (node.type === 'datastore') {
            html += `<div class="prop-field">
                <label>${tr.props.storeId}</label>
                <input id="prop-number" class="prop-input" value="${esc(node.number)}">
            </div>`;
        }

        html += `<div class="prop-field">
            <label>${tr.props.description}</label>
            <textarea id="prop-desc" class="prop-input prop-textarea">${esc(node.description)}</textarea>
        </div>
        <div class="prop-coords">
            <span>X: ${Math.round(node.x)}</span>
            <span>Y: ${Math.round(node.y)}</span>
            <span>${node.w} × ${node.h}</span>
        </div>
        <button class="btn-delete" id="prop-delete">
            <i class="fas fa-trash"></i> ${tr.props.deleteNode}
        </button>`;

        this.panel.querySelector('#props-body').innerHTML = html;
        this._bindNodeEvents(node);
    }

    _renderEdge(edge) {
        const tr    = T();
        const fn    = this.store.getNode(edge.from);
        const tn    = this.store.getNode(edge.to);
        const fromLbl = fn ? fn.label : edge.from;
        const toLbl   = tn ? tn.label : edge.to;

        const html = `
            <div class="props-type-badge" style="color:var(--edge-stroke)">
                <i class="fas fa-arrow-right"></i> ${tr.props.types.edge}
            </div>
            <div class="props-flow-path">${esc(fromLbl)} → ${esc(toLbl)}</div>
            <div class="prop-field">
                <label>${tr.props.flowLabel}</label>
                <input id="prop-label" class="prop-input" value="${esc(edge.label)}">
            </div>
            <div class="prop-field">
                <label>${tr.props.flowDesc}</label>
                <textarea id="prop-desc" class="prop-input prop-textarea">${esc(edge.description)}</textarea>
            </div>
            <button class="btn-delete" id="prop-delete">
                <i class="fas fa-trash"></i> ${tr.props.deleteEdge}
            </button>`;

        this.panel.querySelector('#props-body').innerHTML = html;
        this._bindEdgeEvents(edge);
    }

    _bindNodeEvents(node) {
        const s = this.store;
        const h = this.history;
        const render = this.onRender;

        const labelEl  = document.getElementById('prop-label');
        const numberEl = document.getElementById('prop-number');
        const descEl   = document.getElementById('prop-desc');
        const delBtn   = document.getElementById('prop-delete');

        labelEl?.addEventListener('input',  () => { node.label  = labelEl.value;  render(); });
        labelEl?.addEventListener('change', () => h.push());
        numberEl?.addEventListener('input',  () => { node.number = numberEl.value; render(); });
        numberEl?.addEventListener('change', () => h.push());
        descEl?.addEventListener('input',   () => { node.description = descEl.value; });
        descEl?.addEventListener('change',  () => h.push());

        delBtn?.addEventListener('click', () => {
            s.removeNode(node.id);
            h.push();
            this.hide();
            render();
        });
    }

    _bindEdgeEvents(edge) {
        const s = this.store;
        const h = this.history;
        const render = this.onRender;

        const labelEl = document.getElementById('prop-label');
        const descEl  = document.getElementById('prop-desc');
        const delBtn  = document.getElementById('prop-delete');

        labelEl?.addEventListener('input',  () => { edge.label = labelEl.value; render(); });
        labelEl?.addEventListener('change', () => h.push());
        descEl?.addEventListener('input',   () => { edge.description = descEl.value; });
        descEl?.addEventListener('change',  () => h.push());

        delBtn?.addEventListener('click', () => {
            s.removeEdge(edge.id);
            h.push();
            this.hide();
            render();
        });
    }

    static _icon(type) {
        return {
            entity:    '<i class="fas fa-square-full"></i>',
            process:   '<i class="fas fa-circle"></i>',
            datastore: '<i class="fas fa-database"></i>',
            annotation:'<i class="fas fa-sticky-note"></i>',
        }[type] || '';
    }
}

// app.js — نقطة الدخول | مولد مخططات DFD

import { Store }        from './core/Store.js';
import { History }      from './core/History.js';
import { Renderer }     from './diagram/Renderer.js';
import { InputHandler } from './interaction/InputHandler.js';
import { AutoLayout }   from './features/AutoLayout.js';
import { Validator }    from './features/Validator.js';
import { TEMPLATES }    from './features/Templates.js';
import { PropsPanel }   from './ui/PropsPanel.js';
import { MiniMap }      from './ui/MiniMap.js';
import { Toast }        from './ui/Toast.js';
import { SVGExporter }  from './export/SVGExporter.js';
import { PNGExporter }  from './export/PNGExporter.js';
import { JSONExporter } from './export/JSONExporter.js';
import { TRANSLATIONS, getLang, T } from './ui/i18n.js';

// ── Instances ────────────────────────────────────────────
const store    = new Store();
const history  = new History(store);
const svg      = document.getElementById('dfd-svg');
const renderer = new Renderer(svg, store);
const minimap  = new MiniMap('mm-svg', store);
const toast    = new Toast('toast-container');
const props    = new PropsPanel('props-panel', store, history, render);

// Expose for drop handler
window.app = { onDrop };

// ════════════════════════════════════════════════════════
//  RENDER
// ════════════════════════════════════════════════════════
function render() {
    renderer.render();
    minimap.render();
    updateStats();
    updateZoomBadge();
    updateUndoRedoState();
}

function updateStats() {
    const s = store.getStats();
    document.getElementById('stat-entities').textContent  = s.entities;
    document.getElementById('stat-processes').textContent = s.processes;
    document.getElementById('stat-stores').textContent    = s.stores;
    document.getElementById('stat-flows').textContent     = s.flows;
}

function updateZoomBadge() {
    document.getElementById('zoom-badge').textContent = Math.round(store.scale * 100) + '%';
}

function updateUndoRedoState() {
    document.getElementById('btn-undo').disabled = !history.canUndo();
    document.getElementById('btn-redo').disabled = !history.canRedo();
}

// ════════════════════════════════════════════════════════
//  LANGUAGE SYSTEM
// ════════════════════════════════════════════════════════
function resolvePath(obj, path) {
    return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

function applyLang(lang) {
    const tr = TRANSLATIONS[lang] || TRANSLATIONS.ar;

    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir  = tr.dir;

    // Update lang button label (show the OTHER language to switch to)
    document.getElementById('lang-label').textContent = lang === 'ar' ? 'EN' : 'ع';

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const val = resolvePath(tr, el.dataset.i18n);
        if (val !== undefined) el.textContent = val;
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const val = resolvePath(tr, el.dataset.i18nPh);
        if (val !== undefined) el.placeholder = val;
    });

    // Update select options
    document.querySelectorAll('[data-i18n-opt]').forEach(el => {
        const val = resolvePath(tr, el.dataset.i18nOpt);
        if (val !== undefined) el.textContent = val;
    });

    // Shortcuts list — [[key]] notation → <kbd>key</kbd>
    const shortcutsEl = document.getElementById('shortcuts-list');
    if (shortcutsEl && tr.shortcuts) {
        shortcutsEl.innerHTML = tr.shortcuts.map(s =>
            `<div>${s.replace(/\[\[(.+?)\]\]/g, (_, k) => `<kbd>${k}</kbd>`)}</div>`
        ).join('');
    }

    // Page title
    document.title = tr.logo.name + ' — ' + tr.logo.sub;

    // Update props panel if open (re-render if selection exists)
    if (store.selectedIds.size === 1) {
        const id = [...store.selectedIds][0];
        if (store.getNode(id))      props.show(id, 'node');
        else if (store.getEdge(id)) props.show(id, 'edge');
    }

    render();
}

// Language toggle button
document.getElementById('btn-lang').addEventListener('click', () => {
    const current = getLang();
    const next    = current === 'ar' ? 'en' : 'ar';
    localStorage.setItem('dfd-lang', next);
    applyLang(next);
    toast.show(T().toast.langChanged);
});

// ════════════════════════════════════════════════════════
//  INPUT HANDLER
// ════════════════════════════════════════════════════════
const input = new InputHandler(svg, store, renderer, history, {
    onRender:    render,
    onPropsShow: (id, kind) => props.show(id, kind),
    onPropsHide: ()         => props.hide(),
    onEdgeRequest: openEdgeModal,
    onSetMode:   setMode,
});

input.bindKeys();

// ════════════════════════════════════════════════════════
//  DARK MODE
// ════════════════════════════════════════════════════════
document.getElementById('btn-theme').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('dfd-theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-icon').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    render();
});

// ════════════════════════════════════════════════════════
//  MODE BUTTONS
// ════════════════════════════════════════════════════════
function setMode(mode) {
    store.mode = mode;
    input.cancelConnect();
    svg.className = 'mode-' + mode;
    ['select', 'connect', 'pan'].forEach(m => {
        document.getElementById('btn-mode-' + m)?.classList.toggle('active', m === mode);
    });
}

document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

// ════════════════════════════════════════════════════════
//  TOOLBAR BUTTONS
// ════════════════════════════════════════════════════════
document.getElementById('btn-undo').addEventListener('click', () => {
    if (history.undo()) { props.hide(); render(); }
});

document.getElementById('btn-redo').addEventListener('click', () => {
    if (history.redo()) { props.hide(); render(); }
});

document.getElementById('btn-delete').addEventListener('click', () => {
    store.deleteSelected(); history.push(); props.hide(); render();
});

document.getElementById('btn-zoom-in').addEventListener('click',  () => zoom(0.15));
document.getElementById('btn-zoom-out').addEventListener('click', () => zoom(-0.15));
document.getElementById('btn-fit').addEventListener('click', fitView);

document.getElementById('btn-grid').addEventListener('click', function() {
    store.gridOn = !store.gridOn;
    this.classList.toggle('active', store.gridOn);
    render();
    toast.show(store.gridOn ? T().toast.gridOn : T().toast.gridOff);
});

document.getElementById('btn-snap').addEventListener('click', function() {
    store.snapOn = !store.snapOn;
    this.classList.toggle('active', store.snapOn);
    toast.show(store.snapOn ? T().toast.snapOn : T().toast.snapOff);
});

document.getElementById('btn-layout').addEventListener('click', () => {
    AutoLayout.apply(store); history.push(); fitView();
    toast.success(T().toast.layoutDone);
});

document.getElementById('btn-validate').addEventListener('click', showValidation);

// ── Save / Load ─────────────────────────────────────────
document.getElementById('btn-save').addEventListener('click', () => {
    updateProjectFromUI();
    JSONExporter.save(store);
    toast.success(T().toast.saved);
});

document.getElementById('btn-open').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', e => {
    JSONExporter.load(store, e.target, () => {
        syncUIFromProject();
        fitView();
        toast.success(T().toast.loaded);
    });
});

// ── Export ──────────────────────────────────────────────
document.getElementById('btn-export-svg').addEventListener('click', () => {
    if (SVGExporter.export(renderer, store.project.name || 'DFD'))
        toast.success(T().toast.svgExported);
    else toast.warning(T().toast.noContent);
});

document.getElementById('btn-export-png').addEventListener('click', async () => {
    try {
        await PNGExporter.export(renderer, store.project.name || 'DFD');
        toast.success(T().toast.pngExported);
    } catch { toast.warning(T().toast.noContent); }
});

document.getElementById('btn-export-pdf').addEventListener('click', async () => {
    if (!window.jspdf) { toast.error(T().toast.pdfNotLoaded); return; }
    try {
        await PNGExporter.exportPDF(renderer, store.project.name || 'DFD');
        toast.success(T().toast.pdfExported);
    } catch { toast.warning(T().toast.noContent); }
});

document.getElementById('btn-print').addEventListener('click', printDiagram);

document.getElementById('btn-share').addEventListener('click', () => {
    updateProjectFromUI();
    const url = JSONExporter.toURL(store);
    navigator.clipboard?.writeText(url)
        .then(() => toast.success(T().toast.urlCopied))
        .catch(() => prompt(T().toast.urlManual, url));
});

// ── Presentation mode ────────────────────────────────────
document.getElementById('btn-present').addEventListener('click', () => {
    const svgStr = renderer.buildExportSVG();
    if (!svgStr) { toast.warning(T().toast.noPreview); return; }
    document.getElementById('pres-content').innerHTML =
        svgStr.replace('<svg ', '<svg style="max-width:95vw;max-height:90vh;border-radius:12px" ');
    document.getElementById('presentation-mode').classList.add('open');
});

document.getElementById('pres-exit').addEventListener('click', () => {
    document.getElementById('presentation-mode').classList.remove('open');
});

// ════════════════════════════════════════════════════════
//  PALETTE: Click to add
// ════════════════════════════════════════════════════════
document.querySelectorAll('.node-card').forEach(card => {
    card.addEventListener('click', () => {
        const type = card.dataset.type;
        const r = svg.getBoundingClientRect();
        const cx = (r.width  / 2 - store.tx) / store.scale;
        const cy = (r.height / 2 - store.ty) / store.scale;
        const n  = store.createNode(type, cx, cy);
        store.addNode(n);
        store.clearSelection();
        store.select(n.id);
        history.push();
        render();
        props.show(n.id);
    });

    card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('dfd-node-type', card.dataset.type);
    });
});

// ════════════════════════════════════════════════════════
//  DROP on canvas
// ════════════════════════════════════════════════════════
function onDrop(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData('dfd-node-type');
    if (!type) return;
    const cp = renderer.screenToCanvas(e.clientX, e.clientY);
    const n  = store.createNode(type, cp.x, cp.y);
    store.addNode(n);
    store.clearSelection();
    store.select(n.id);
    history.push();
    render();
    props.show(n.id);
}

// ════════════════════════════════════════════════════════
//  TEMPLATES
// ════════════════════════════════════════════════════════
document.querySelectorAll('[data-tpl]').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.dataset.tpl;
        if (store.nodes.length && !confirm(T().toast.tplConfirm)) return;
        const tpl  = TEMPLATES[name];
        if (!tpl) return;
        store.deserialize({ nodes: tpl.nodes, edges: tpl.edges, project: { name: tpl.name, level: tpl.level, author: '' }, _pCtr: 4, _dCtr: 4 });
        syncUIFromProject();
        history.push();
        fitView();
        toast.success(T().toast.tplLoaded + tpl.name);
    });
});

// ════════════════════════════════════════════════════════
//  EDGE MODAL
// ════════════════════════════════════════════════════════
let _pendingEdge = null;

function openEdgeModal(fromId, toId) {
    _pendingEdge = { fromId, toId };
    document.getElementById('edge-label').value = '';
    document.getElementById('edge-desc').value  = '';
    document.getElementById('edge-modal').classList.add('open');
    setTimeout(() => document.getElementById('edge-label').focus(), 60);
}

document.getElementById('edge-confirm').addEventListener('click', confirmEdge);
document.getElementById('edge-cancel').addEventListener('click',  cancelEdge);
document.getElementById('edge-label').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmEdge();
    if (e.key === 'Escape') cancelEdge();
});

function confirmEdge() {
    if (!_pendingEdge) return;
    const lbl  = document.getElementById('edge-label').value.trim();
    const desc = document.getElementById('edge-desc').value.trim();
    store.addEdge(store.createEdge(_pendingEdge.fromId, _pendingEdge.toId, lbl, desc));
    history.push();
    render();
    _pendingEdge = null;
    document.getElementById('edge-modal').classList.remove('open');
}

function cancelEdge() {
    _pendingEdge = null;
    document.getElementById('edge-modal').classList.remove('open');
}

// ════════════════════════════════════════════════════════
//  VALIDATION — now uses i18n messages
// ════════════════════════════════════════════════════════
function showValidation() {
    const tr     = T();
    const issues = runValidation(store, tr.validation);
    const box    = document.getElementById('val-results');

    if (!issues.length) {
        box.innerHTML = `<div class="val-item val-ok">
            <i class="fas fa-check-circle" style="margin-top:2px"></i>
            <span>${tr.val.ok}</span>
        </div>`;
    } else {
        const errors   = issues.filter(i => i.type === 'error');
        const warnings = issues.filter(i => i.type === 'warning');
        let html = '';
        if (errors.length) {
            html += `<div style="font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">${tr.val.errors} (${errors.length})</div>`;
            html += errors.map(i => `<div class="val-item val-error"><i class="fas fa-times-circle" style="margin-top:2px;flex-shrink:0"></i><span>${i.msg}</span></div>`).join('');
        }
        if (warnings.length) {
            html += `<div style="font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin:10px 0 6px">${tr.val.warnings} (${warnings.length})</div>`;
            html += warnings.map(i => `<div class="val-item val-warning"><i class="fas fa-exclamation-triangle" style="margin-top:2px;flex-shrink:0"></i><span>${i.msg}</span></div>`).join('');
        }
        box.innerHTML = html;
    }
    document.getElementById('val-modal').classList.add('open');
}

function runValidation(store, vm) {
    const issues = [];
    const err    = (msg) => issues.push({ type: 'error',   msg });
    const warn   = (msg) => issues.push({ type: 'warning', msg });

    if (!store.nodes.length) { warn(vm.noElements); return issues; }

    const inC = new Map(), outC = new Map();
    store.nodes.forEach(n => { inC.set(n.id, 0); outC.set(n.id, 0); });
    store.edges.forEach(e => {
        inC.set(e.to,    (inC.get(e.to)    || 0) + 1);
        outC.set(e.from, (outC.get(e.from) || 0) + 1);
    });

    store.nodes.forEach(n => {
        if (n.type === 'process') {
            if (!inC.get(n.id))  err(vm.noInput(n));
            if (!outC.get(n.id)) err(vm.noOutput(n));
        }
        if (n.type === 'entity'    && !(inC.get(n.id) + outC.get(n.id))) warn(vm.unlinkedEntity(n));
        if (n.type === 'datastore' && !(inC.get(n.id) + outC.get(n.id))) warn(vm.unlinkedStore(n));
        if (!n.label?.trim()) warn(vm.noLabel(n));
    });

    const seen = new Set();
    store.edges.forEach(e => {
        const fn = store.getNode(e.from), tn = store.getNode(e.to);
        if (!fn || !tn) return;
        const pair = [fn.type, tn.type].sort().join('-');
        if (pair === 'datastore-entity')  err(vm.entityStore(fn, tn));
        if (pair === 'datastore-datastore') err(vm.storeStore(fn, tn));
        if (!e.label?.trim()) warn(vm.noFlowLabel(fn, tn));
        const key = `${e.from}→${e.to}`;
        if (seen.has(key)) warn(vm.duplicate());
        seen.add(key);
    });

    return issues;
}

document.getElementById('val-close').addEventListener('click', () => {
    document.getElementById('val-modal').classList.remove('open');
});

// ════════════════════════════════════════════════════════
//  ZOOM HELPERS
// ════════════════════════════════════════════════════════
function zoom(delta) {
    const r  = svg.getBoundingClientRect();
    const cx = r.width / 2, cy = r.height / 2;
    const ns = Math.max(0.1, Math.min(5, store.scale * (1 + delta)));
    const ratio = ns / store.scale;
    store.tx = cx - (cx - store.tx) * ratio;
    store.ty = cy - (cy - store.ty) * ratio;
    store.scale = ns;
    render();
}

function fitView() {
    const bounds = store.getBounds();
    if (!bounds) { store.tx = 0; store.ty = 0; store.scale = 1; render(); return; }
    const r   = svg.getBoundingClientRect();
    const pad = 80;
    const bW  = bounds.maxX - bounds.minX + pad * 2;
    const bH  = bounds.maxY - bounds.minY + pad * 2;
    store.scale = Math.min((r.width - pad) / bW, (r.height - pad) / bH, 2);
    store.tx    = (r.width  - (bounds.minX + bounds.maxX) * store.scale) / 2;
    store.ty    = (r.height - (bounds.minY + bounds.maxY) * store.scale) / 2;
    render();
}

// ════════════════════════════════════════════════════════
//  PRINT
// ════════════════════════════════════════════════════════
function printDiagram() {
    const svgStr = renderer.buildExportSVG();
    if (!svgStr) { toast.warning(T().toast.noPrint); return; }
    updateProjectFromUI();
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head>
        <meta charset="UTF-8"><title>${store.project.name || 'DFD'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
        <style>@page{size:A4;margin:15mm}body{margin:0;font-family:Tajawal,sans-serif;display:flex;flex-direction:column;align-items:center}
        h1{font-size:16px;margin:0 0 4px}p{font-size:11px;color:#64748b;margin:0 0 14px}svg{max-width:100%;height:auto}</style>
    </head><body>
        <h1>${store.project.name || 'Data Flow Diagram'}</h1>
        <p>${store.project.author ? store.project.author + ' — ' : ''}${store.project.level} | ${new Date().toLocaleDateString()}</p>
        ${svgStr}
        <script>window.onload=()=>window.print();<\/script>
    </body></html>`);
    w.document.close();
}

// ════════════════════════════════════════════════════════
//  PROPS PANEL CLOSE
// ════════════════════════════════════════════════════════
document.getElementById('props-close').addEventListener('click', () => {
    store.clearSelection();
    props.hide();
    render();
});

// ════════════════════════════════════════════════════════
//  PROJECT INFO SYNC
// ════════════════════════════════════════════════════════
function updateProjectFromUI() {
    store.project.name     = document.getElementById('proj-name').value.trim();
    store.project.author   = document.getElementById('proj-author').value.trim();
    store.project.level    = document.getElementById('proj-level').value;
    store.project.modified = new Date().toISOString();
}

function syncUIFromProject() {
    document.getElementById('proj-name').value   = store.project.name   || '';
    document.getElementById('proj-author').value = store.project.author || '';
    document.getElementById('proj-level').value  = store.project.level  || '0';
}

['proj-name', 'proj-author', 'proj-level'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateProjectFromUI);
});

// ════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════
// Restore from URL hash if present
if (JSONExporter.fromURL(store)) {
    syncUIFromProject();
    setTimeout(fitView, 100);
    toast.success(T().toast.restored);
}

// Apply language (restores localStorage preference)
applyLang(getLang());

// Sync dark mode icon
if (document.documentElement.classList.contains('dark')) {
    document.getElementById('theme-icon').className = 'fas fa-sun';
}

// Initial render
render();
setTimeout(() => toast.show(T().toast.welcome), 700);

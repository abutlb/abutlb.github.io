/* ══════════════════════════════════════════════════════════
   ناسج — app.js
   نسج البيانات | ES6 Classes + Private Fields
══════════════════════════════════════════════════════════ */

/* ════════════════════════════
   UTILITIES
════════════════════════════ */
const $ = id => document.getElementById(id);

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
                        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function fmt(n) {
  return Number(n).toLocaleString('ar-SA');
}

function fileIcon(name) {
  return name.toLowerCase().endsWith('.csv') ? 'fa-file-csv' : 'fa-file-excel';
}
function fileColor(name) {
  return name.toLowerCase().endsWith('.csv') ? 'text-emerald-500' : 'text-emerald-600';
}

/* ════════════════════════════
   Toast
════════════════════════════ */
class Toast {
  #c = $('toast-container');

  show(msg, type = 'success', ms = 3000) {
    const cls = { success:'t-success', error:'t-error', info:'t-info', warn:'t-warn' };
    const ico = { success:'fa-check-circle', error:'fa-exclamation-circle', info:'fa-info-circle', warn:'fa-exclamation-triangle' };
    const el = document.createElement('div');
    el.className = `toast-item ${cls[type] ?? cls.success}`;
    el.innerHTML = `<i class="fas ${ico[type] ?? ico.success} text-sm"></i><span>${esc(msg)}</span>`;
    this.#c.appendChild(el);
    setTimeout(() => el.classList.add('out'), ms);
    setTimeout(() => el.remove(), ms + 350);
  }
}

/* ════════════════════════════
   FileLoader  (SheetJS)
════════════════════════════ */
class FileLoader {
  static async load(file) {
    const buf = await file.arrayBuffer();
    const wb  = XLSX.read(new Uint8Array(buf), { type: 'array', cellText: false, cellDates: true });

    const sheets = wb.SheetNames.map(sName => {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sName], { defval: '', raw: false });
      const columns = rows.length ? Object.keys(rows[0]) : [];
      return { name: sName, rows, columns, rowCount: rows.length };
    });

    return {
      id       : uid(),
      fileName : file.name,
      fileSize : file.size,
      isCSV    : file.name.toLowerCase().endsWith('.csv'),
      sheets,
      activeSheet: 0,
    };
  }
}

/* ════════════════════════════
   DataMerger  (JOIN بمفتاح)
════════════════════════════ */
class DataMerger {
  static merge({ baseRows, baseKey, lookups }) {
    let result = baseRows.map(r => ({ ...r }));

    for (const { rows: lookupRows, key: lookupKey, joinType } of lookups) {
      const idx = new Map();
      for (const row of lookupRows) {
        const k = String(row[lookupKey] ?? '').trim().toLowerCase();
        if (!idx.has(k)) idx.set(k, []);
        idx.get(k).push(row);
      }

      const merged  = [];
      const usedKeys = new Set();

      for (const baseRow of result) {
        const k       = String(baseRow[baseKey] ?? '').trim().toLowerCase();
        const matches = idx.get(k) ?? [];
        usedKeys.add(k);

        if (joinType === 'inner' && matches.length === 0) continue;

        if (matches.length === 0) {
          merged.push({ ...baseRow });
        } else {
          for (const m of matches) {
            const out = { ...baseRow };
            for (const [col, val] of Object.entries(m)) {
              if (col === lookupKey) continue;
              out[col in out ? `${col}_2` : col] = val;
            }
            merged.push(out);
          }
        }
      }

      /* OUTER JOIN: إضافة صفوف غير المتطابقة من ملف البحث */
      if (joinType === 'outer') {
        for (const row of lookupRows) {
          const k = String(row[lookupKey] ?? '').trim().toLowerCase();
          if (!usedKeys.has(k)) {
            const out = {};
            for (const col of Object.keys(result[0] ?? {})) out[col] = '';
            for (const [col, val] of Object.entries(row)) {
              if (col === lookupKey) {
                out[baseKey] = val;
              } else {
                out[col in out ? `${col}_2` : col] = val;
              }
            }
            merged.push(out);
          }
        }
      }

      result = merged;
    }

    return result;
  }
}

/* ════════════════════════════
   AppendMerger  (تكديس عمودي)
════════════════════════════ */
class AppendMerger {
  static merge({ files, addSourceCol, dedupKey, conflictMode }) {
    /* Stack all files vertically */
    const stacked = [];
    for (const { rows, name } of files) {
      for (const row of rows) {
        const r = { ...row };
        if (addSourceCol) r['المصدر'] = name;
        stacked.push(r);
      }
    }

    if (!dedupKey || conflictMode === 'all') {
      return { rows: stacked, dupCount: 0 };
    }

    return AppendMerger.#handleDuplicates(stacked, dedupKey, conflictMode);
  }

  static #handleDuplicates(rows, keyCol, mode) {
    const groups = new Map();
    const order  = [];

    for (const row of rows) {
      const k = String(row[keyCol] ?? '').trim().toLowerCase();
      if (!groups.has(k)) { groups.set(k, []); order.push(k); }
      groups.get(k).push(row);
    }

    let dupCount = 0;
    const result = [];

    for (const k of order) {
      const group = groups.get(k);
      if (group.length === 1) {
        result.push(group[0]);
      } else {
        dupCount += group.length - 1;
        switch (mode) {
          case 'first':
            result.push(group[0]);
            break;
          case 'last':
            result.push(group[group.length - 1]);
            break;
          case 'highlight':
            result.push(group[0]);
            for (const r of group.slice(1)) {
              result.push({ ...r, _isDuplicate: true });
            }
            break;
        }
      }
    }

    return { rows: result, dupCount };
  }
}

/* ════════════════════════════
   DataCleaner
════════════════════════════ */
class DataCleaner {
  static clean(rows, opts) {
    const before = rows.length;
    let out = rows.map(r => ({ ...r }));

    /* Fill empty values */
    if (opts.fillEmpty && opts.fillValue !== '') {
      out = out.map(row => {
        const r = { ...row };
        for (const k of Object.keys(r)) {
          if (k === '_isDuplicate') continue;
          if (r[k] === '' || r[k] == null) r[k] = opts.fillValue;
        }
        return r;
      });
    }

    /* Remove duplicates */
    let dupesRemoved = 0;
    if (opts.removeDupes) {
      const cols = opts.dupeColumns.length ? opts.dupeColumns : null;
      const seen = new Set();
      out = out.filter(row => {
        const key = cols
          ? cols.map(c => String(row[c] ?? '')).join('|')
          : Object.entries(row).filter(([k]) => k !== '_isDuplicate').map(([,v]) => String(v)).join('|');
        if (seen.has(key)) { dupesRemoved++; return false; }
        seen.add(key);
        return true;
      });
    }

    /* Row filters */
    let filtered = 0;
    for (const f of (opts.filters ?? [])) {
      if (!f.col || !f.op || f.val === undefined) continue;
      const before2 = out.length;
      out = out.filter(row => {
        const cell = String(row[f.col] ?? '').toLowerCase();
        const val  = String(f.val).toLowerCase();
        switch (f.op) {
          case 'eq'       : return cell === val;
          case 'neq'      : return cell !== val;
          case 'contains' : return cell.includes(val);
          case 'starts'   : return cell.startsWith(val);
          case 'gt'       : return parseFloat(cell) >  parseFloat(val);
          case 'lt'       : return parseFloat(cell) <  parseFloat(val);
          case 'notempty' : return cell.trim() !== '';
          case 'empty'    : return cell.trim() === '';
          default         : return true;
        }
      });
      filtered += before2 - out.length;
    }

    return { rows: out, stats: { before, after: out.length, dupesRemoved, filtered } };
  }
}

/* ════════════════════════════
   ExcelExporter  (ExcelJS)
════════════════════════════ */
class ExcelExporter {
  static async export(rows, opts = {}) {
    if (!rows.length) return;

    /* Filter out internal flag columns */
    const allCols    = Object.keys(rows[0]);
    const cols       = allCols.filter(c => c !== '_isDuplicate');
    const rightToLeft = opts.rightToLeft ?? true;

    const wb      = new ExcelJS.Workbook();
    wb.creator    = 'ناسج';
    wb.created    = new Date();

    const addSheet = (wb, sheetName, data) => {
      const ws = wb.addWorksheet(sheetName);

      /* Header row */
      ws.addRow(cols);
      const hRow = ws.getRow(1);
      hRow.height = 24;
      hRow.eachCell(cell => {
        cell.fill      = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF7C3AED' } };
        cell.font      = { bold:true, color:{ argb:'FFFFFFFF' }, size:10, name:'Calibri' };
        cell.alignment = { horizontal:'center', vertical:'middle', wrapText:false };
        cell.border    = { bottom:{ style:'thin', color:{ argb:'FF5B21B6' } } };
      });

      /* Data rows */
      data.forEach((row, i) => {
        const isDup = !!row._isDuplicate;
        const r     = ws.addRow(cols.map(c => row[c] ?? ''));

        if (isDup) {
          /* Highlighted duplicate row — light red */
          r.eachCell(cell => {
            cell.fill      = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFDE8E8' } };
            cell.font      = { size:9, name:'Calibri', color:{ argb:'FF991B1B' } };
            cell.alignment = { vertical:'middle', wrapText:false };
          });
        } else {
          if (i % 2 === 0) {
            r.eachCell(cell => {
              cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF5F3FF' } };
            });
          }
          r.eachCell(cell => {
            cell.alignment = { vertical:'middle', wrapText:false };
            cell.font      = { size:9, name:'Calibri' };
          });
        }
        r.height = 18;
      });

      /* Auto column widths */
      ws.columns.forEach((col, i) => {
        const header  = cols[i] ?? '';
        const maxData = Math.min(50, ...data.slice(0, 50).map(r => String(r[header] ?? '').length));
        col.width     = Math.min(40, Math.max(header.length + 4, maxData + 2, 10));
      });

      /* Freeze header + sheet direction */
      ws.views = [{ state:'frozen', ySplit:1, rightToLeft }];

      /* Auto filter */
      ws.autoFilter = { from:{ row:1, column:1 }, to:{ row:1, column:cols.length } };
    };

    if (opts.format === 'multi' && opts.sourceFiles?.length) {
      for (const sf of opts.sourceFiles) {
        addSheet(wb, sf.name.substring(0, 30), sf.rows);
      }
      addSheet(wb, 'مدمج', rows);
    } else {
      addSheet(wb, opts.sheetName ?? 'البيانات المنسوجة', rows);
    }

    /* Write & download */
    const buffer = await wb.xlsx.writeBuffer();
    const blob   = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const a      = document.createElement('a');
    a.href       = URL.createObjectURL(blob);
    a.download   = `${opts.filename ?? 'nasij_output'}.xlsx`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

/* ════════════════════════════════════════════════════════════
   NasijApp  ← Main Controller
════════════════════════════════════════════════════════════ */
class NasijApp {
  #files      = new Map();   // id → parsed file object
  #toast      = new Toast();
  #result     = null;        // { rows, stats, columns }
  #activeTab  = 'files';
  #filters    = [];          // [{id, col, op, val}]
  #mergeMode  = 'join';      // 'join' | 'append'

  constructor() {
    this.#wireTheme();
    this.#wireUpload();
    this.#wireTabNav();
    this.#wireMerge();
    this.#wireExport();
  }

  /* ══════════════════════════
     THEME
  ══════════════════════════ */
  #wireTheme() {
    const btn  = $('theme-toggle');
    const icon = $('theme-icon');
    const sync = () => {
      const dark = document.documentElement.classList.contains('dark');
      icon.className = `fas ${dark ? 'fa-sun' : 'fa-moon'} text-sm`;
    };
    sync();
    btn.addEventListener('click', () => {
      const dark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('nasij_theme', dark ? 'dark' : 'light');
      sync();
    });
  }

  /* ══════════════════════════
     UPLOAD SCREEN
  ══════════════════════════ */
  #wireUpload() {
    const zone = $('drop-zone');
    const inp  = $('file-input');
    const inp2 = $('file-input-extra');
    const btn  = $('btn-start');

    zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drop-active'); });
    zone.addEventListener('dragleave', ()  => zone.classList.remove('drop-active'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drop-active');
      this.#addFiles([...e.dataTransfer.files]);
    });
    zone.addEventListener('click', () => inp.click());

    inp .addEventListener('change', e => { this.#addFiles([...e.target.files]); e.target.value = ''; });
    inp2.addEventListener('change', e => { this.#addFiles([...e.target.files]); e.target.value = ''; });

    btn.addEventListener('click', () => {
      if (this.#files.size < 2) { this.#toast.show('يجب رفع ملفين على الأقل', 'warn'); return; }
      this.#showApp();
    });
  }

  async #addFiles(fileList) {
    const valid = fileList.filter(f => /\.(csv|xlsx|xls)$/i.test(f.name));
    if (!valid.length) { this.#toast.show('يُقبل فقط CSV و Excel', 'error'); return; }

    for (const file of valid) {
      $('upload-loading').classList.remove('hidden');
      try {
        const parsed = await FileLoader.load(file);
        for (const [, f] of this.#files) {
          if (f.fileName === parsed.fileName) {
            this.#toast.show(`الملف "${parsed.fileName}" محمّل مسبقاً`, 'warn');
            continue;
          }
        }
        this.#files.set(parsed.id, parsed);
      } catch (e) {
        this.#toast.show(`خطأ في قراءة ${file.name}: ${e.message}`, 'error');
      }
    }
    $('upload-loading').classList.add('hidden');
    this.#renderUploadList();
    this.#updateStartBtn();
  }

  #renderUploadList() {
    const container = $('upload-file-list');
    if (!this.#files.size) { container.innerHTML = ''; return; }

    container.innerHTML = [...this.#files.values()].map(f => `
      <div class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700 rounded-lg fade-in">
        <i class="fas ${fileIcon(f.fileName)} ${fileColor(f.fileName)} text-sm"></i>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
          ${esc(f.fileName)}
        </span>
        <span class="text-xs text-gray-400 dark:text-gray-500">
          ${fmt(f.sheets[0].rowCount)} صف
        </span>
        <button class="text-gray-400 hover:text-red-500 transition-colors px-1"
                onclick="app.removeFile('${f.id}')" title="حذف">
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>`).join('');
  }

  removeFile(id) {
    this.#files.delete(id);
    this.#renderUploadList();
    this.#updateStartBtn();
    if (this.#files.size < 2) this.#showUpload();
  }

  #updateStartBtn() {
    const btn   = $('btn-start');
    const count = this.#files.size;
    btn.disabled = count < 2;
    btn.querySelector('span').textContent = count < 2
      ? `ابدأ النسج (${count} / 2 ملف على الأقل)`
      : `ابدأ النسج ← (${count} ملف)`;
  }

  /* ══════════════════════════
     SCREEN SWITCH
  ══════════════════════════ */
  #showApp() {
    $('upload-screen').classList.add('hidden');
    $('main-app').classList.remove('hidden');
    this.#renderFilesTab();
    this.#renderMergeTab();
    this.#renderCleaningTab();
    $('btn-new-session').classList.remove('hidden');
  }

  #showUpload() {
    $('main-app').classList.add('hidden');
    $('upload-screen').classList.remove('hidden');
    $('btn-new-session').classList.add('hidden');
    this.#result = null;
  }

  /* ══════════════════════════
     TAB NAVIGATION
  ══════════════════════════ */
  #wireTabNav() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.#switchTab(btn.dataset.tab));
    });
    $('btn-new-session').addEventListener('click', () => {
      this.#files.clear();
      this.#result  = null;
      this.#filters = [];
      this.#renderUploadList();
      this.#updateStartBtn();
      this.#showUpload();
    });
  }

  #switchTab(name) {
    this.#activeTab = name;
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === name);
    });
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.toggle('hidden', c.id !== `tab-${name}`);
    });
    if (name === 'preview' && !this.#result) this.#runMerge();
    if (name === 'export'  && !this.#result) this.#runMerge();
  }

  /* ══════════════════════════
     FILES TAB
  ══════════════════════════ */
  #renderFilesTab() {
    const grid = $('files-grid');
    grid.innerHTML = [...this.#files.values()].map(f => {
      const sheet = f.sheets[f.activeSheet];
      return `
        <div class="file-card fade-in">
          <button class="remove-btn" onclick="app.removeFile('${f.id}')" title="حذف الملف">
            <i class="fas fa-times text-xs"></i>
          </button>
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-violet-50 dark:bg-violet-900/30 rounded-xl
                        flex items-center justify-center flex-shrink-0">
              <i class="fas ${fileIcon(f.fileName)} ${fileColor(f.fileName)} text-lg"></i>
            </div>
            <div class="flex-1 overflow-hidden">
              <p class="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">
                ${esc(f.fileName)}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500">
                ${(f.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          ${f.sheets.length > 1 ? `
            <div class="mb-3">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                الورقة النشطة
              </label>
              <select class="dm-select" onchange="app.setSheet('${f.id}', this.value)">
                ${f.sheets.map((s,i) => `<option value="${i}" ${i===f.activeSheet?'selected':''}>${esc(s.name)}</option>`).join('')}
              </select>
            </div>
          ` : ''}
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="stat-mini">
              <div class="num text-base">${fmt(sheet.rowCount)}</div>
              <div class="lbl">صف</div>
            </div>
            <div class="stat-mini">
              <div class="num text-base">${sheet.columns.length}</div>
              <div class="lbl">عمود</div>
            </div>
            <div class="stat-mini">
              <div class="num text-base">${f.isCSV ? 'CSV' : 'XLSX'}</div>
              <div class="lbl">نوع</div>
            </div>
          </div>
          ${sheet.columns.length ? `
            <div class="mt-3 flex flex-wrap gap-1">
              ${sheet.columns.slice(0,6).map(c => `
                <span class="text-xs px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20
                             text-violet-700 dark:text-violet-300 rounded-full border
                             border-violet-100 dark:border-violet-800">${esc(c)}</span>`).join('')}
              ${sheet.columns.length > 6 ? `<span class="text-xs text-gray-400">+${sheet.columns.length - 6}</span>` : ''}
            </div>
          ` : ''}
        </div>`;
    }).join('');
  }

  setSheet(fileId, sheetIndex) {
    const f = this.#files.get(fileId);
    if (!f) return;
    f.activeSheet = +sheetIndex;
    this.#renderFilesTab();
    this.#renderMergeTab();
    this.#result = null;
  }

  /* ══════════════════════════
     MERGE TAB
  ══════════════════════════ */
  #renderMergeTab() {
    const files  = [...this.#files.values()];
    const allCols = files.flatMap(f => f.sheets[f.activeSheet].columns);
    const uniqueCols = [...new Set(allCols)];

    /* Base file options */
    const opts = files.map(f => `<option value="${f.id}">${esc(f.fileName)}</option>`).join('');
    $('merge-base-select').innerHTML = `<option value="">— اختر الملف الأساسي —</option>${opts}`;
    $('merge-base-key').innerHTML    = `<option value="">— اختر العمود —</option>`;

    /* Lookup blocks */
    $('merge-lookups').innerHTML = files.map(f => {
      const sheet   = f.sheets[f.activeSheet];
      const colOpts = sheet.columns.map(c =>
        `<option value="${esc(c)}">${esc(c)}</option>`).join('');
      return `
        <div class="lookup-block" id="lookup-${f.id}">
          <div class="flex items-center gap-2 mb-3">
            <i class="fas ${fileIcon(f.fileName)} ${fileColor(f.fileName)} text-sm"></i>
            <span class="text-sm font-bold text-gray-700 dark:text-gray-300">${esc(f.fileName)}</span>
            <span class="text-xs text-gray-400 dark:text-gray-500">(ملف البحث)</span>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                مفتاح هذا الملف
              </label>
              <select id="lk-key-${f.id}" class="dm-select">
                <option value="">— اختر العمود —</option>${colOpts}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                نوع الربط
              </label>
              <div class="join-pills mt-1">
                <div class="join-pill">
                  <input type="radio" name="jt-${f.id}" id="jt-left-${f.id}" value="left" checked>
                  <label for="jt-left-${f.id}">
                    <i class="fas fa-align-right text-xs"></i>الكل من الأساسي
                  </label>
                </div>
                <div class="join-pill">
                  <input type="radio" name="jt-${f.id}" id="jt-inner-${f.id}" value="inner">
                  <label for="jt-inner-${f.id}">
                    <i class="fas fa-compress-arrows-alt text-xs"></i>المطابق فقط
                  </label>
                </div>
                <div class="join-pill">
                  <input type="radio" name="jt-${f.id}" id="jt-outer-${f.id}" value="outer">
                  <label for="jt-outer-${f.id}">
                    <i class="fas fa-expand-arrows-alt text-xs"></i>كل الصفوف
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    /* Populate append dedup key options */
    const dedupSel = $('append-dedup-key');
    if (dedupSel) {
      dedupSel.innerHTML = `<option value="">— بلا مقارنة —</option>` +
        uniqueCols.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    }

    /* Wire base file change */
    $('merge-base-select').addEventListener('change', e => {
      this.#onBaseFileChange(e.target.value);
    });
  }

  #onBaseFileChange(baseId) {
    const f = this.#files.get(baseId);
    if (!f) {
      $('merge-base-key').innerHTML = `<option value="">— اختر العمود —</option>`;
      return;
    }
    const cols = f.sheets[f.activeSheet].columns;
    $('merge-base-key').innerHTML = `<option value="">— اختر العمود —</option>` +
      cols.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');

    for (const [id] of this.#files) {
      const block = $(`lookup-${id}`);
      if (block) block.style.display = (id === baseId) ? 'none' : '';
    }
  }

  /* ══════════════════════════
     MERGE WIRING
  ══════════════════════════ */
  #wireMerge() {
    $('btn-run-merge').addEventListener('click', () => this.#runMerge());

    /* Mode selector cards */
    document.querySelectorAll('input[name="merge-mode"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.#mergeMode = radio.value;
        this.#result    = null;
        const joinSec   = $('join-section');
        const appendSec = $('append-section');
        if (joinSec)   joinSec.classList.toggle('hidden',   this.#mergeMode !== 'join');
        if (appendSec) appendSec.classList.toggle('hidden', this.#mergeMode !== 'append');
      });
    });
  }

  /* ══════════════════════════
     RUN MERGE DISPATCHER
  ══════════════════════════ */
  #runMerge() {
    if (this.#mergeMode === 'append') {
      this.#runAppendMerge();
    } else {
      this.#runJoinMerge();
    }
  }

  /* JOIN mode */
  #runJoinMerge() {
    const baseId  = $('merge-base-select').value;
    const baseKey = $('merge-base-key').value;

    if (!baseId)  { this.#toast.show('اختر الملف الأساسي أولاً', 'warn'); this.#switchTab('merge'); return; }
    if (!baseKey) { this.#toast.show('اختر مفتاح الملف الأساسي', 'warn'); this.#switchTab('merge'); return; }

    const baseFile = this.#files.get(baseId);
    const baseRows = baseFile.sheets[baseFile.activeSheet].rows;

    const lookups = [];
    for (const [id, f] of this.#files) {
      if (id === baseId) continue;
      const key = $(`lk-key-${id}`)?.value ?? '';
      if (!key) {
        this.#toast.show(`اختر مفتاح ربط لـ: ${f.fileName}`, 'warn');
        this.#switchTab('merge');
        return;
      }
      const jt = document.querySelector(`input[name="jt-${id}"]:checked`)?.value ?? 'left';
      lookups.push({ rows: f.sheets[f.activeSheet].rows, key, joinType: jt });
    }

    let merged;
    try {
      merged = DataMerger.merge({ baseRows, baseKey, lookups });
    } catch (e) {
      this.#toast.show(`خطأ في الدمج: ${e.message}`, 'error');
      return;
    }

    this.#finalizeMerge(merged);
  }

  /* APPEND (تكديس) mode */
  #runAppendMerge() {
    const files = [...this.#files.values()].map(f => ({
      name : f.fileName.replace(/\.\w+$/, ''),
      rows : f.sheets[f.activeSheet].rows,
    }));

    const addSourceCol  = $('opt-source-col').getAttribute('aria-checked') === 'true';
    const dedupKey      = $('append-dedup-key').value;
    const conflictMode  = document.querySelector('input[name="dup-mode"]:checked')?.value ?? 'first';

    let appendResult;
    try {
      appendResult = AppendMerger.merge({ files, addSourceCol, dedupKey, conflictMode });
    } catch (e) {
      this.#toast.show(`خطأ في التكديس: ${e.message}`, 'error');
      return;
    }

    if (appendResult.dupCount > 0) {
      const modeLabel = { first:'احتُفظ بالأول', last:'احتُفظ بالأخير',
                          all:'احتُفظ بالكل', highlight:'مُبرَّز بالأحمر' };
      this.#toast.show(
        `وُجد ${fmt(appendResult.dupCount)} تكرار — ${modeLabel[conflictMode] ?? ''}`,
        'info', 4000
      );
    }

    this.#finalizeMerge(appendResult.rows);
  }

  /* Common cleanup + render after either merge mode */
  #finalizeMerge(merged) {
    const cleaning = this.#getCleaningConfig();
    const { rows, stats } = DataCleaner.clean(merged, cleaning);

    const columns = Object.keys(rows[0] ?? {}).filter(c => c !== '_isDuplicate');
    this.#result  = { rows, stats, columns };
    this.#renderPreview();
    this.#renderExportStats();
    this.#toast.show(`تم النسج: ${fmt(rows.length)} صف · ${columns.length} عمود`);
  }

  /* ══════════════════════════
     CLEANING TAB
  ══════════════════════════ */
  #renderCleaningTab() {
    this.#renderFilters();
  }

  #getCleaningConfig() {
    return {
      removeDupes : $('opt-dedup').getAttribute('aria-checked') === 'true',
      dupeColumns : [],
      fillEmpty   : $('opt-fill').getAttribute('aria-checked') === 'true',
      fillValue   : $('fill-value').value.trim() || '—',
      filters     : this.#filters,
    };
  }

  #renderFilters() {
    const container = $('filters-list');
    if (!this.#filters.length) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-filter"></i>
          <p class="text-sm">لا توجد فلاتر — انقر «إضافة فلتر»</p>
        </div>`;
      return;
    }

    const allCols = this.#result?.columns
      ?? [...this.#files.values()].flatMap(f => f.sheets[f.activeSheet].columns);

    const ops = [
      { v:'eq',       l:'يساوي' },
      { v:'neq',      l:'لا يساوي' },
      { v:'contains', l:'يحتوي على' },
      { v:'starts',   l:'يبدأ بـ' },
      { v:'gt',       l:'أكبر من' },
      { v:'lt',       l:'أصغر من' },
      { v:'notempty', l:'ليس فارغاً' },
      { v:'empty',    l:'فارغ' },
    ];
    const colOpts = allCols.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    const opOpts  = ops.map(o => `<option value="${o.v}">${o.l}</option>`).join('');

    container.innerHTML = this.#filters.map(f => `
      <div class="filter-row fade-in" data-fid="${f.id}">
        <select class="filter-inp dm-select" style="width:auto;min-width:120px"
                onchange="app.setFilter('${f.id}','col',this.value)">
          <option value="">العمود</option>${colOpts}
        </select>
        <select class="filter-inp dm-select" style="width:auto;min-width:110px"
                onchange="app.setFilter('${f.id}','op',this.value)">
          ${opOpts}
        </select>
        <input class="filter-inp flex-1" type="text" placeholder="القيمة"
               value="${esc(f.val ?? '')}"
               oninput="app.setFilter('${f.id}','val',this.value)">
        <button onclick="app.removeFilter('${f.id}')"
                class="text-red-400 hover:text-red-600 transition-colors px-1">
          <i class="fas fa-trash-alt text-xs"></i>
        </button>
      </div>`).join('');

    this.#filters.forEach(f => {
      const row  = container.querySelector(`[data-fid="${f.id}"]`);
      if (!row) return;
      const colEl = row.querySelector('select:nth-child(1)');
      const opEl  = row.querySelector('select:nth-child(2)');
      if (colEl) colEl.value = f.col ?? '';
      if (opEl)  opEl.value  = f.op  ?? 'eq';
    });
  }

  setFilter(id, field, val) {
    const f = this.#filters.find(x => x.id === id);
    if (f) f[field] = val;
    this.#result = null;
  }

  removeFilter(id) {
    this.#filters = this.#filters.filter(x => x.id !== id);
    this.#renderFilters();
    this.#result = null;
  }

  /* ══════════════════════════
     PREVIEW TAB
  ══════════════════════════ */
  #renderPreview() {
    if (!this.#result?.rows.length) {
      $('preview-table-wrap').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-table"></i>
          <p class="text-sm">لا توجد بيانات — تحقق من إعدادات الدمج</p>
        </div>`;
      return;
    }

    const { rows, stats, columns } = this.#result;
    const LIMIT  = 200;
    const sample = rows.slice(0, LIMIT);

    $('preview-stats').innerHTML = `
      <div class="stat-mini">
        <div class="num">${fmt(stats.before)}</div>
        <div class="lbl">قبل التنظيف</div>
      </div>
      <div class="stat-mini">
        <div class="num text-violet-700 dark:text-violet-400">${fmt(stats.after)}</div>
        <div class="lbl">بعد التنظيف</div>
      </div>
      <div class="stat-mini">
        <div class="num text-red-500">${fmt(stats.dupesRemoved)}</div>
        <div class="lbl">مكرر محذوف</div>
      </div>
      <div class="stat-mini">
        <div class="num text-amber-500">${fmt(stats.filtered)}</div>
        <div class="lbl">صف مُصفَّى</div>
      </div>
      <div class="stat-mini">
        <div class="num">${columns.length}</div>
        <div class="lbl">عمود</div>
      </div>`;

    $('preview-table-wrap').innerHTML = `
      <div class="preview-wrap">
        <table class="preview-table">
          <thead><tr>
            <th style="min-width:40px">#</th>
            ${columns.map(c => `<th>${esc(c)}</th>`).join('')}
          </tr></thead>
          <tbody>
            ${sample.map((row, i) => `
              <tr ${row._isDuplicate ? 'class="dup-row"' : ''}>
                <td class="text-gray-400 dark:text-gray-500 text-center">${i+1}</td>
                ${columns.map(c => `<td title="${esc(row[c])}">${esc(row[c])}</td>`).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${rows.length > LIMIT ? `
        <p class="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
          عرض أول ${LIMIT} صف من ${fmt(rows.length)}. التصدير يشمل الكل.
        </p>` : ''}`;
  }

  /* ══════════════════════════
     EXPORT TAB
  ══════════════════════════ */
  #renderExportStats() {
    if (!this.#result) return;
    const { rows, columns } = this.#result;
    $('export-summary').innerHTML = `
      <div class="flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-900/20
                  border border-violet-100 dark:border-violet-800 rounded-xl mb-5">
        <div class="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-xl
                    flex items-center justify-center flex-shrink-0">
          <i class="fas fa-check-circle text-violet-600 dark:text-violet-400"></i>
        </div>
        <div>
          <p class="text-sm font-bold text-violet-700 dark:text-violet-300">
            البيانات جاهزة للتصدير
          </p>
          <p class="text-xs text-violet-600/70 dark:text-violet-400/70">
            ${fmt(rows.length)} صف · ${columns.length} عمود
          </p>
        </div>
      </div>`;
  }

  #wireExport() {
    /* Cleaning toggles */
    [$('opt-dedup'), $('opt-fill')].forEach(btn => {
      btn.addEventListener('click', e => {
        const v = e.currentTarget.getAttribute('aria-checked') === 'true';
        e.currentTarget.setAttribute('aria-checked', String(!v));
        this.#result = null;
      });
    });

    /* Append source-col toggle */
    const srcColBtn = $('opt-source-col');
    if (srcColBtn) {
      srcColBtn.addEventListener('click', () => {
        const v = srcColBtn.getAttribute('aria-checked') === 'true';
        srcColBtn.setAttribute('aria-checked', String(!v));
        this.#result = null;
      });
    }

    /* Add filter */
    $('btn-add-filter').addEventListener('click', () => {
      this.#filters.push({ id: uid(), col:'', op:'eq', val:'' });
      this.#renderFilters();
      this.#result = null;
    });

    /* Download */
    $('btn-download').addEventListener('click', async () => {
      if (!this.#result?.rows.length) {
        if (this.#mergeMode === 'join' && !$('merge-base-select').value) {
          this.#toast.show('أعِد إعداد الدمج أولاً', 'warn');
          this.#switchTab('merge');
          return;
        }
        this.#runMerge();
        if (!this.#result?.rows.length) return;
      }

      const format      = document.querySelector('input[name="out-format"]:checked')?.value ?? 'single';
      const filename    = $('out-filename').value.trim()  || 'nasij_output';
      const sheetName   = $('out-sheetname').value.trim() || 'البيانات المنسوجة';
      const rightToLeft = document.querySelector('input[name="sheet-dir"]:checked')?.value !== 'ltr';

      const btn      = $('btn-download');
      const origHTML = btn.innerHTML;
      btn.innerHTML  = '<div class="spinner"></div><span>جاري التصدير...</span>';
      btn.disabled   = true;

      try {
        await ExcelExporter.export(this.#result.rows, {
          format, filename, sheetName, rightToLeft,
          sourceFiles: format === 'multi'
            ? [...this.#files.values()].map(f => ({
                name : f.fileName.replace(/\.\w+$/, ''),
                rows : f.sheets[f.activeSheet].rows,
              }))
            : undefined,
        });
        this.#toast.show(`تم تصدير "${filename}.xlsx" بنجاح`);
      } catch (e) {
        this.#toast.show(`خطأ في التصدير: ${e.message}`, 'error');
      }

      btn.innerHTML = origHTML;
      btn.disabled  = false;
    });
  }
}

/* ════════════════════════════
   BOOT
════════════════════════════ */
let app;
document.addEventListener('DOMContentLoaded', () => { app = new NasijApp(); });

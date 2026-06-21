/* ══════════════════════════════════════════════════════════
   Schedule Builder — app.js
   Architecture: ES6 Classes with Private Fields (#)
══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const DAYS = [
  { key:'Sun', label:'الأحد',    short:'أحد', wknd:false },
  { key:'Mon', label:'الاثنين',  short:'اثن', wknd:false },
  { key:'Tue', label:'الثلاثاء', short:'ثلا', wknd:false },
  { key:'Wed', label:'الأربعاء', short:'أرب', wknd:false },
  { key:'Thu', label:'الخميس',   short:'خمي', wknd:false },
  { key:'Fri', label:'الجمعة',   short:'جمع', wknd:true  },
  { key:'Sat', label:'السبت',    short:'سبت', wknd:true  },
];

const EVENT_TYPES = {
  work     : { label:'عمل',     color:'#3b82f6', rgb:'59,130,246',   icon:'fa-briefcase'   },
  study    : { label:'دراسة',   color:'#8b5cf6', rgb:'139,92,246',   icon:'fa-book'        },
  exercise : { label:'رياضة',   color:'#22c55e', rgb:'34,197,94',    icon:'fa-dumbbell'    },
  personal : { label:'شخصي',    color:'#f97316', rgb:'249,115,22',   icon:'fa-user'        },
  social   : { label:'اجتماعي', color:'#ec4899', rgb:'236,72,153',   icon:'fa-users'       },
  other    : { label:'أخرى',    color:'#64748b', rgb:'100,116,139',  icon:'fa-ellipsis-h'  },
};

const DEF_CFG = {
  startH : 7,
  endH   : 22,
  intv   : 60,
  wknd   : true,
  title  : 'جدولي الأسبوعي',
};

/* ══════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════ */
const $ = id => document.getElementById(id);

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtTime(h, m) {
  const period = h >= 12 ? 'م' : 'ص';
  const h12    = h % 12 || 12;
  const mm     = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
  return `${h12}${mm} ${period}`;
}

/* ══════════════════════════════════════════
   Store (localStorage wrapper)
══════════════════════════════════════════ */
class Store {
  static get(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  static set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
}

/* ══════════════════════════════════════════
   Toast
══════════════════════════════════════════ */
class Toast {
  #container = $('toast-container');

  show(message, type = 'success', duration = 2800) {
    const icons = {
      success : 'fa-check-circle',
      error   : 'fa-exclamation-circle',
      info    : 'fa-info-circle',
    };
    const styles = {
      success : 'toast-success',
      error   : 'toast-error',
      info    : 'toast-info',
    };

    const el = document.createElement('div');
    el.className = `toast-item ${styles[type] ?? styles.success}`;
    el.innerHTML = `<i class="fas ${icons[type] ?? icons.success} text-sm"></i><span>${esc(message)}</span>`;
    this.#container.appendChild(el);

    setTimeout(() => el.classList.add('toast-out'), duration);
    setTimeout(() => el.remove(), duration + 350);
  }
}

/* ══════════════════════════════════════════
   Confirm (replaces window.confirm)
══════════════════════════════════════════ */
class Confirm {
  #overlay  = $('conf-modal');
  #msgEl    = $('conf-msg');
  #okBtn    = $('conf-ok');
  #cancelBtn = $('conf-cancel');

  ask(message) {
    return new Promise(resolve => {
      this.#msgEl.textContent = message;
      this.#overlay.classList.remove('hidden');

      const close = (val) => {
        this.#overlay.classList.add('hidden');
        this.#okBtn    .removeEventListener('click', onYes);
        this.#cancelBtn.removeEventListener('click', onNo);
        resolve(val);
      };
      const onYes = () => close(true);
      const onNo  = () => close(false);

      this.#okBtn    .addEventListener('click', onYes, { once: true });
      this.#cancelBtn.addEventListener('click', onNo,  { once: true });
    });
  }
}

/* ══════════════════════════════════════════
   EventModal
══════════════════════════════════════════ */
class EventModal {
  #overlay    = $('ev-modal');
  #form       = $('ev-form');
  #titleInp   = $('ev-title-inp');
  #descInp    = $('ev-desc-inp');
  #heading    = $('ev-modal-heading');
  #deleteBtn  = $('ev-delete-btn');
  #onSave;
  #onDelete;

  constructor() {
    this.#buildTypeGrid();
    this.#wireEvents();
  }

  #buildTypeGrid() {
    $('ev-type-grid').innerHTML = Object.entries(EVENT_TYPES).map(([key, t]) => `
      <div class="type-opt">
        <input type="radio" name="ev-type" id="et-${key}" value="${key}" ${key === 'work' ? 'checked' : ''}>
        <label for="et-${key}" style="--tc:${t.color}">
          <i class="fas ${t.icon}"></i>
          <span>${t.label}</span>
        </label>
      </div>`).join('');
  }

  #wireEvents() {
    $('ev-modal-close').addEventListener('click', () => this.close());
    $('ev-cancel-btn') .addEventListener('click', () => this.close());

    this.#overlay.addEventListener('click', e => {
      if (e.target === this.#overlay) this.close();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !this.#overlay.classList.contains('hidden')) this.close();
    });

    this.#form.addEventListener('submit', e => {
      e.preventDefault();
      const type = this.#form.querySelector('input[name="ev-type"]:checked')?.value ?? 'other';
      this.#onSave?.({
        title       : this.#titleInp.value.trim(),
        type,
        description : this.#descInp.value.trim(),
      });
      this.close();
    });

    this.#deleteBtn.addEventListener('click', () => {
      this.#onDelete?.();
      this.close();
    });
  }

  open({ day, time, event = null, onSave, onDelete }) {
    this.#onSave   = onSave;
    this.#onDelete = onDelete;

    const [h, m]  = time.split(':').map(Number);
    const dayLabel = DAYS.find(d => d.key === day)?.label ?? day;
    this.#heading.textContent = `${dayLabel} — ${fmtTime(h, m)}`;

    if (event) {
      this.#titleInp.value = event.title;
      this.#descInp.value  = event.description ?? '';
      const radio = this.#form.querySelector(`input[value="${event.type}"]`);
      if (radio) radio.checked = true;
      this.#deleteBtn.classList.remove('hidden');
    } else {
      this.#form.reset();
      const radio = this.#form.querySelector('input[value="work"]');
      if (radio) radio.checked = true;
      this.#deleteBtn.classList.add('hidden');
    }

    this.#overlay.classList.remove('hidden');
    setTimeout(() => this.#titleInp.focus(), 50);
  }

  close() { this.#overlay.classList.add('hidden'); }
}

/* ══════════════════════════════════════════
   ScheduleGrid
══════════════════════════════════════════ */
class ScheduleGrid {
  #container = $('sched-grid');
  #onClick;

  constructor(onClick) {
    this.#onClick = onClick;
  }

  render(events, cfg) {
    const days  = cfg.wknd ? DAYS : DAYS.filter(d => !d.wknd);
    const slots = this.#buildSlots(cfg.startH, cfg.endH, cfg.intv);

    let html = `<div class="sched" style="grid-template-columns: 4.25rem repeat(${days.length}, minmax(80px, 1fr))">`;

    // ── Header ──
    html += `<div class="sched-corner"><i class="fas fa-clock text-xs opacity-60 text-white"></i></div>`;
    for (const day of days) {
      html += `<div class="sched-hdr ${day.wknd ? 'weekend' : ''}">
        <span class="day-name">${day.label}</span>
        ${day.wknd ? `<span class="day-wknd">عطلة</span>` : ''}
      </div>`;
    }

    // ── Rows ──
    for (const [h, m] of slots) {
      html += `<div class="sched-time">${fmtTime(h, m)}</div>`;

      for (const day of days) {
        const key = `${day.key}-${h}:${m}`;
        const ev  = events[key];

        html += `<div class="sched-cell" data-day="${day.key}" data-time="${h}:${m}"
                      tabindex="0" role="button"
                      aria-label="إضافة نشاط — ${day.label} ${fmtTime(h, m)}">`;

        if (ev) {
          const t = EVENT_TYPES[ev.type] ?? EVENT_TYPES.other;
          html += `<div class="ev-block" style="--ev-color:${t.color}">
            <span class="ev-badge"><i class="fas ${t.icon}"></i>${t.label}</span>
            <span class="ev-title">${esc(ev.title)}</span>
            ${ev.description ? `<span class="ev-desc">${esc(ev.description)}</span>` : ''}
          </div>`;
        }

        html += `</div>`;
      }
    }

    html += `</div>`;
    this.#container.innerHTML = html;

    this.#container.querySelectorAll('.sched-cell').forEach(cell => {
      const trigger = () => this.#onClick(cell.dataset.day, cell.dataset.time);
      cell.addEventListener('click', trigger);
      cell.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
      });
    });
  }

  #buildSlots(startH, endH, intv) {
    const slots = [];
    let min = startH * 60;
    while (min < endH * 60) {
      slots.push([Math.floor(min / 60), min % 60]);
      min += intv;
    }
    return slots;
  }
}

/* ══════════════════════════════════════════
   TEMPLATES
══════════════════════════════════════════ */
const TEMPLATES = {

  work() {
    const ev = {};
    const add = (d, h, title, type, description = '') => {
      ev[`${d}-${h}:0`] = { title, type, description };
    };
    for (const d of ['Sun','Mon','Tue','Wed','Thu']) {
      add(d,  8, 'تخطيط اليوم',         'work',     'مراجعة البريد والمهام');
      add(d,  9, 'عمل محوري',            'work');
      add(d, 10, 'عمل محوري',            'work');
      add(d, 11, 'عمل محوري',            'work');
      add(d, 13, 'استراحة الغداء',        'personal');
      add(d, 14, 'اجتماعات ومتابعة',     'work',     'تحديث حالة المشاريع');
      add(d, 15, 'اجتماعات ومتابعة',     'work');
      add(d, 17, 'مراجعة اليوم',         'work',     'تحديث قوائم المهام');
      add(d, 18, 'وقت شخصي',             'personal');
    }
    add('Mon', 17, 'رياضة',              'exercise');
    add('Wed', 17, 'رياضة',              'exercise');
    add('Fri', 10, 'تحضير الأسبوع',      'work',     'مراجعة الأهداف');
    add('Sat', 10, 'مهام شخصية',          'personal');
    add('Sat', 14, 'وقت عائلي',          'social');
    return ev;
  },

  study() {
    const ev = {};
    const add = (d, h, title, type, description = '') => {
      ev[`${d}-${h}:0`] = { title, type, description };
    };
    for (const d of DAYS.map(x => x.key)) {
      add(d,  8, 'إفطار وتخطيط',          'personal');
      add(d, 13, 'غداء وراحة',             'personal');
    }
    for (const d of ['Mon','Wed','Fri']) {
      add(d,  9, 'محاضرة رئيسية',          'study');
      add(d, 11, 'مراجعة المحاضرة',        'study',    'تدوين ملاحظات');
    }
    for (const d of ['Tue','Thu']) {
      add(d,  9, 'مذاكرة مكثفة',           'study');
      add(d, 14, 'مجموعة دراسية',          'study',    'مراجعة جماعية');
    }
    for (const d of ['Sun','Mon','Tue','Wed','Thu']) {
      add(d, 20, 'مراجعة خفيفة',           'study',    'قبل النوم');
    }
    add('Mon', 17, 'رياضة',               'exercise');
    add('Thu', 17, 'رياضة',               'exercise');
    add('Fri', 18, 'وقت اجتماعي',          'social');
    add('Sat', 14, 'مراجعة أسبوعية',       'study');
    add('Sun',  9, 'تخطيط الأسبوع',        'study',    'ترتيب الأولويات');
    return ev;
  },

  balanced() {
    const ev = {};
    const add = (d, h, title, type, description = '') => {
      ev[`${d}-${h}:0`] = { title, type, description };
    };
    for (const d of ['Sun','Mon','Tue','Wed','Thu']) {
      add(d,  8, 'تخطيط',                  'work');
      add(d,  9, 'عمل',                     'work');
      add(d, 10, 'عمل',                     'work');
      add(d, 11, 'عمل',                     'work');
      add(d, 13, 'غداء',                    'personal');
      add(d, 14, 'عمل',                     'work');
      add(d, 15, 'عمل',                     'work');
      add(d, 19, 'عشاء',                    'personal');
      add(d, 20, 'وقت شخصي',               'personal', 'هوايات / قراءة');
    }
    for (const d of ['Mon','Wed','Fri']) add(d, 17, 'رياضة',           'exercise');
    for (const d of ['Tue','Thu'])       add(d, 17, 'نشاط اجتماعي',    'social');
    add('Sat', 10, 'تمرين صباحي',           'exercise');
    add('Sat', 15, 'نشاط اجتماعي',          'social');
    add('Fri', 19, 'خروجة عشاء',            'social');
    add('Sun', 18, 'تحضير الأسبوع',         'work');
    return ev;
  },

  fitness() {
    const ev = {};
    const add = (d, h, title, type, description = '') => {
      ev[`${d}-${h}:0`] = { title, type, description };
    };
    for (const d of DAYS.map(x => x.key)) {
      add(d,  7, 'إفطار صحي',              'personal', 'بروتين + خضروات');
      add(d, 12, 'غداء صحي',               'personal');
      add(d, 19, 'عشاء خفيف',              'personal');
    }
    for (const d of ['Sun','Mon','Tue','Wed','Thu']) {
      add(d,  9, 'عمل / دراسة',            'work');
      add(d, 10, 'عمل / دراسة',            'work');
    }
    add('Mon', 17, 'تمارين القوة — صدر',   'exercise');
    add('Tue', 17, 'كارديو',               'exercise', 'جري 30 دقيقة');
    add('Wed', 17, 'يوم راحة نشط',          'exercise', 'مشي / يوجا');
    add('Thu', 17, 'تمارين القوة — أرجل',  'exercise');
    add('Fri', 17, 'تدريب متنوع',           'exercise', 'كروس فت');
    add('Sat',  9, 'تمرين طويل',            'exercise', 'تحمل واستمرارية');
    add('Sun', 16, 'يوجا واسترخاء',         'exercise', 'استشفاء');
    add('Wed', 20, 'لقاء أصدقاء',           'social');
    add('Sat', 18, 'نشاط اجتماعي',          'social');
    return ev;
  },

  social() {
    const ev = {};
    const add = (d, h, title, type, description = '') => {
      ev[`${d}-${h}:0`] = { title, type, description };
    };
    for (const d of ['Sun','Mon','Tue','Wed','Thu']) {
      add(d,  9, 'عمل / دراسة',            'work');
      add(d, 12, 'غداء مع زملاء',          'social');
      add(d, 13, 'عمل / دراسة',            'work');
    }
    add('Mon', 18, 'عشاء عائلي',           'social');
    add('Tue', 18, 'ورشة / دورة',          'social',   'تعلم جماعي');
    add('Wed', 18, 'رياضة جماعية',          'social');
    add('Thu', 18, 'خروجة عشاء',           'social');
    add('Fri', 18, 'سهرة اجتماعية',        'social');
    add('Sat', 10, 'تمرين جماعي',          'exercise');
    add('Sat', 14, 'نزهة / رحلة',          'social');
    add('Sat', 18, 'تجمع اجتماعي',         'social');
    add('Sun', 11, 'فطور متأخر',           'social',   'مع العائلة');
    add('Sun', 18, 'عشاء عائلي',           'social',   'ختام الأسبوع');
    return ev;
  },

  empty() { return {}; },
};

/* ══════════════════════════════════════════
   ScheduleApp  (main controller)
══════════════════════════════════════════ */
class ScheduleApp {
  /* Private fields */
  #ev      = {};
  #cfg     = { ...DEF_CFG };
  #grid;
  #modal;
  #toast;
  #confirm;

  constructor() {
    this.#ev   = Store.get('sb_ev',  {});
    this.#cfg  = { ...DEF_CFG, ...Store.get('sb_cfg', {}) };

    this.#toast   = new Toast();
    this.#confirm = new Confirm();
    this.#modal   = new EventModal();
    this.#grid    = new ScheduleGrid((day, time) => this.#openCell(day, time));

    this.#syncSettingsUI();
    this.#wireControls();
    this.#initTheme();
    this.#render();
  }

  /* ── Private methods ── */

  #render() {
    this.#grid.render(this.#ev, this.#cfg);
  }

  #openCell(day, time) {
    const key = `${day}-${time}`;
    this.#modal.open({
      day,
      time,
      event    : this.#ev[key] ?? null,
      onSave   : ev => { this.#ev[key] = ev; this.#persist(); this.#render(); },
      onDelete : ()  => { delete this.#ev[key]; this.#persist(); this.#render(); },
    });
  }

  #persist() {
    Store.set('sb_ev',  this.#ev);
    Store.set('sb_cfg', this.#cfg);
  }

  #toggleSettings(open) {
    $('settings-panel').classList.toggle('hidden', !open);
    $('side-overlay')  .classList.toggle('hidden', !open);
    $('btn-settings')  .setAttribute('aria-pressed', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  #syncSettingsUI() {
    $('inp-title').value = this.#cfg.title;
    $('s-start')  .value = String(this.#cfg.startH);
    $('s-end')    .value = String(this.#cfg.endH);
    $('s-intv')   .value = String(this.#cfg.intv);
    $('s-wknd')   .setAttribute('aria-checked', String(this.#cfg.wknd));
  }

  #initTheme() {
    const updateIcon = () => {
      const dark = document.documentElement.classList.contains('dark');
      $('theme-icon').className = `fas ${dark ? 'fa-sun' : 'fa-moon'} text-sm`;
      $('theme-icon').parentElement.title = dark ? 'وضع فاتح' : 'وضع مظلم';
    };
    updateIcon();

    $('btn-dark').addEventListener('click', () => {
      const dark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('sb_theme', dark ? 'dark' : 'light');
      updateIcon();
    });
  }

  #wireControls() {

    /* Title input */
    $('inp-title').addEventListener('input', e => {
      this.#cfg.title = e.target.value.trim() || DEF_CFG.title;
    });

    /* Save */
    $('btn-save').addEventListener('click', () => {
      this.#cfg.title = $('inp-title').value.trim() || DEF_CFG.title;
      this.#persist();
      this.#toast.show('تم الحفظ بنجاح');
    });

    /* Clear */
    $('btn-clear').addEventListener('click', async () => {
      if (!await this.#confirm.ask('هل تريد مسح الجدول بالكامل؟ لا يمكن التراجع.')) return;
      this.#ev = {};
      this.#persist();
      this.#render();
      this.#toast.show('تم مسح الجدول', 'info');
    });

    /* Print */
    $('btn-print').addEventListener('click', () => window.print());

    /* Export image */
    $('btn-export').addEventListener('click', () => this.#exportImage());

    /* Settings open/close */
    $('btn-settings')  .addEventListener('click', () => this.#toggleSettings(true));
    $('settings-close').addEventListener('click', () => this.#toggleSettings(false));
    $('side-overlay')  .addEventListener('click', () => this.#toggleSettings(false));

    /* Apply settings */
    $('btn-apply').addEventListener('click', () => {
      const startH = +$('s-start').value;
      const endH   = +$('s-end').value;
      if (startH >= endH) {
        this.#toast.show('وقت البداية يجب أن يكون قبل وقت النهاية', 'error');
        return;
      }
      this.#cfg.startH = startH;
      this.#cfg.endH   = endH;
      this.#cfg.intv   = +$('s-intv').value;
      this.#cfg.wknd   = $('s-wknd').getAttribute('aria-checked') === 'true';
      this.#persist();
      this.#render();
      this.#toggleSettings(false);
      this.#toast.show('تم تطبيق الإعدادات');
    });

    /* Weekend toggle */
    $('s-wknd').addEventListener('click', e => {
      const cur = e.currentTarget.getAttribute('aria-checked') === 'true';
      e.currentTarget.setAttribute('aria-checked', String(!cur));
    });

    /* Templates modal */
    $('btn-tpl')        .addEventListener('click', () => $('tpl-modal').classList.remove('hidden'));
    $('tpl-modal-close').addEventListener('click', () => $('tpl-modal').classList.add('hidden'));
    $('tpl-modal')      .addEventListener('click', e => {
      if (e.target === $('tpl-modal')) $('tpl-modal').classList.add('hidden');
    });

    document.querySelectorAll('[data-tpl]').forEach(card => {
      card.addEventListener('click', async () => {
        const key     = card.dataset.tpl;
        const hasData = Object.keys(this.#ev).length > 0;

        if (hasData && !await this.#confirm.ask('سيُستبدل الجدول الحالي بالكامل. هل تريد المتابعة؟')) return;

        this.#ev = TEMPLATES[key]?.() ?? {};
        this.#persist();
        this.#render();
        $('tpl-modal').classList.add('hidden');
        this.#toast.show('تم تطبيق القالب');
      });
    });
  }

  async #exportImage() {
    const btn = $('btn-export');

    if (!window.html2canvas) {
      const origHTML = btn.innerHTML;
      btn.innerHTML  = '<i class="fas fa-spinner fa-spin text-sm"></i>';
      btn.disabled   = true;

      try {
        await new Promise((resolve, reject) => {
          const s   = document.createElement('script');
          s.src     = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
          s.onload  = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      } catch {
        this.#toast.show('تعذّر تحميل مكتبة التصدير', 'error');
        btn.innerHTML = origHTML;
        btn.disabled  = false;
        return;
      }

      btn.innerHTML = origHTML;
      btn.disabled  = false;
    }

    try {
      const canvas = await html2canvas($('sched-grid'), { scale: 2, useCORS: true });
      const a = document.createElement('a');
      a.download = `${this.#cfg.title || 'الجدول'}.png`;
      a.href     = canvas.toDataURL('image/png');
      a.click();
      this.#toast.show('تم تصدير الجدول كصورة');
    } catch {
      this.#toast.show('تعذّر تصدير الجدول', 'error');
    }
  }
}

/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => new ScheduleApp());

/* ============================================================
   THEME MANAGER — cheat_sheet project
   استخدام: أضف <script src="../assets/js/theme.js"></script>
   في أي صفحة وسيعمل تلقائياً
============================================================ */

const ThemeManager = (() => {

  const THEMES = [
    { id: 'dark',   label: 'داكن',   emoji: '🌙' },
    { id: 'light',  label: 'فاتح',   emoji: '☀️' },
    { id: 'warm',   label: 'دافئ',   emoji: '🔥' },
    { id: 'forest', label: 'طبيعي',  emoji: '🌿' },
  ];

  const STORAGE_KEY = 'cs_theme';
  const DEFAULT     = 'dark';

  /* ── قراءة الثيم المحفوظ ── */
  function getSaved() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT;
  }

  /* ── تطبيق الثيم ── */
  function apply(themeId) {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem(STORAGE_KEY, themeId);
    /* تحديث الدوائر النشطة */
    document.querySelectorAll('.theme-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.t === themeId);
    });
    /* تحديث الـ tooltip */
    const found = THEMES.find(t => t.id === themeId);
    const label = document.getElementById('cs-theme-label');
    if (label && found) label.textContent = found.emoji + ' ' + found.label;
  }

  /* ── بناء الـ widget وحقنه في الصفحة ── */
  function buildWidget() {
    const wrapper = document.createElement('div');
    wrapper.id = 'cs-theme-switcher';
    wrapper.setAttribute('title', 'تغيير الثيم');

    const lbl = document.createElement('span');
    lbl.id = 'cs-theme-label';
    lbl.style.cssText = 'font-size:12px;color:var(--text-muted);white-space:nowrap;padding:0 4px;';
    wrapper.appendChild(lbl);

    THEMES.forEach(t => {
      const dot = document.createElement('button');
      dot.className    = 'theme-dot';
      dot.dataset.t    = t.id;
      dot.title        = t.label;
      dot.setAttribute('aria-label', 'ثيم ' + t.label);
      dot.addEventListener('click', () => apply(t.id));
      wrapper.appendChild(dot);
    });

    /* ابحث عن حاوية الهيدر أو أضفه floating */
    const headerSlot = document.getElementById('cs-theme-slot');
    if (headerSlot) {
      headerSlot.appendChild(wrapper);
    } else {
      /* Floating fallback */
      wrapper.style.cssText += `
        position:fixed; bottom:24px; left:24px; z-index:999;
        box-shadow: var(--shadow);
      `;
      document.body.appendChild(wrapper);
    }
  }

  /* ── Init ── */
  function init() {
    buildWidget();
    apply(getSaved());
  }

  /* ── تشغيل بعد تحميل DOM ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── API عام ── */
  return { apply, getSaved, THEMES };

})();

/* ============================================================
   FOOTER.JS — مشترك لجميع الصفحات
   الاستخدام: أضف <div id="cs-footer"></div> في أي صفحة
============================================================ */

const FooterComponent = (() => {

  /* ══════════════════════════════════════════
     HELPERS — تحديد المسار الصحيح
  ══════════════════════════════════════════ */

  /**
   * هل نحن في الصفحة الرئيسية؟
   * يعمل مع GitHub Pages وlocal وأي domain
   */
function isHomePage() {
  return document.documentElement.dataset.page === 'home';
}


  /**
   * بناء رابط نسبي صحيح من أي صفحة داخلية
   * للرجوع للـ root (الصفحة الرئيسية)
   *
   * مثال:
   *   /cheat_sheet/data_analysis/index.html → href = "../index.html"
   *   /cheat_sheet/index.html               → href = "./index.html"  (لن يُستخدم)
   */
  function getRootHref() {
    const path  = window.location.pathname;
    const parts = path.replace(/\/$/, '').split('/').filter(Boolean);

    /*
      depth = عدد المستويات تحت الـ root
      /cheat_sheet/data_analysis/index.html
        parts = ['cheat_sheet', 'data_analysis', 'index.html']
        depth = parts.length - 2  (نطرح repo + filename)
              = 1  →  نحتاج "../"
    */
    const hasFile   = parts[parts.length - 1]?.includes('.');
    const depth     = hasFile ? parts.length - 2 : parts.length - 1;
    const goUp      = Math.max(depth, 0);

    if (goUp === 0) return './index.html';
    return '../'.repeat(goUp) + 'index.html';
  }

  /* ══════════════════════════════════════════
     BACK BUTTON
  ══════════════════════════════════════════ */
  function injectBackButton() {
    if (isHomePage()) return;

    const rootHref = '../index.html'; // بديل ثابت لصفحة الرئيسية، getRootHref() قد لا يعمل في بعض البيئات

    /* Styles */
    const style = document.createElement('style');
    style.textContent = `
      #cs-back-btn {
        position: fixed;
        top: 2rem;
        right:   1.5rem;
        z-index: 9999;
      }
      #cs-back-btn a {
        display: flex;
        align-items: center;
        gap: .5rem;
        padding: .55rem 1.1rem;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 999px;
        color: var(--text-secondary);
        font-size: .82rem;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,.22);
        transition: all .25s ease;
        font-family: inherit;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        white-space: nowrap;
      }
      #cs-back-btn a:hover {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
        transform: translateX(4px);
        box-shadow: 0 6px 24px var(--accent-border);
      }
      #cs-back-btn .back-arrow {
        display: inline-block;
        transition: transform .25s ease;
        font-style: normal;
      }
      #cs-back-btn a:hover .back-arrow {
        transform: translateX(3px);
      }
    `;
    document.head.appendChild(style);

    /* HTML */
    const wrap = document.createElement('div');
    wrap.id = 'cs-back-btn';
    wrap.innerHTML = `
      <a href="${rootHref}" aria-label="الرجوع للصفحة الرئيسية">
        <i class="back-arrow">←</i>
        <span>الرئيسية</span>
      </a>`;
    document.body.appendChild(wrap);
  }

  /* ══════════════════════════════════════════
     FOOTER HTML
  ══════════════════════════════════════════ */
  const FOOTER_HTML = `
    <footer id="cs-footer-inner">

      <!-- موجة علوية -->
      <div style="line-height:0;margin-bottom:-1px;overflow:hidden">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg"
             preserveAspectRatio="none"
             style="width:100%;height:48px;display:block">
          <path d="M0,24 C240,48 480,0 720,24 C960,48 1200,0 1440,24 L1440,48 L0,48 Z"
                fill="var(--bg-card)" opacity="0.35"/>
        </svg>
      </div>

      <div class="csf-body">
        <div class="csf-grid">

          <!-- العمود 1: الهوية -->
          <div class="csf-col csf-col-brand">
            <div class="csf-brand">
              <div class="csf-brand-icon">📊</div>
              <div>
                <div class="csf-brand-name">CheatSheet Hub</div>
                <div class="csf-brand-sub">مراجع تفاعلية للمطورين</div>
              </div>
            </div>

            <p class="csf-desc">
              مجموعة مراجع تفاعلية شاملة تغطي أهم المجالات التقنية —
              من تحليل البيانات إلى تعلم الآلة وقواعد البيانات.
            </p>

            <!-- Social -->
            <div class="csf-socials">
              <a href="https://github.com/abutlb" class="csf-social" title="GitHub" target="_blank" rel="noopener">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18
                  6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703
                  -2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11
                  -1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531
                  1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338
                  -2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688
                  -.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564
                  9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296
                  2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7
                  1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359
                  .309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268
                  .18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
              <a href="https://x.com/abutlb" class="csf-social" title="Twitter / X" target="_blank" rel="noopener">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17
                  l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.865
                  l4.265 5.638L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117
                  L17.083 19.77z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/abdullah-altwijri-b053b1234/" class="csf-social" title="LinkedIn" target="_blank" rel="noopener">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037
                  -1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414
                  v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37
                  4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065
                  2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z
                  M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24
                  1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774
                  23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- العمود 2: موارد مفيدة -->
          <div class="csf-col">
            <h4 class="csf-col-title">📚 موارد مفيدة</h4>
            <ul class="csf-links">
              <li><a href="https://pandas.pydata.org/docs/"    target="_blank" class="csf-link">📦 Pandas Docs</a></li>
              <li><a href="https://numpy.org/doc/"             target="_blank" class="csf-link">🔢 NumPy Docs</a></li>
              <li><a href="https://scikit-learn.org/stable/"   target="_blank" class="csf-link">🤖 Scikit-learn</a></li>
              <li><a href="https://matplotlib.org/"            target="_blank" class="csf-link">📈 Matplotlib</a></li>
              <li><a href="https://www.kaggle.com/"            target="_blank" class="csf-link">🏆 Kaggle</a></li>
              <li><a href="https://docs.python.org/3/"         target="_blank" class="csf-link">🐍 Python Docs</a></li>
              <li><a href="https://sql-practice.com/"          target="_blank" class="csf-link">🗃️ SQL Practice</a></li>
            </ul>
          </div>

          <!-- العمود 3: إحصائيات -->
          <div class="csf-col">
            <h4 class="csf-col-title">📊 إحصائيات المشروع</h4>
            <div class="csf-stats">
              <div class="csf-stat">
                <span class="csf-stat-num" id="csf-stat-pages">—</span>
                <span class="csf-stat-lbl">صفحة</span>
              </div>
              <div class="csf-stat">
                <span class="csf-stat-num" id="csf-stat-terms">—</span>
                <span class="csf-stat-lbl">مصطلح</span>
              </div>
              <div class="csf-stat">
                <span class="csf-stat-num" id="csf-stat-snippets">—</span>
                <span class="csf-stat-lbl">كود جاهز</span>
              </div>
            </div>

            <div class="csf-theme-note">
              <span>🎨</span>
              <span>غيّر الثيم من الزر أعلى الصفحة</span>
            </div>

            <!-- رابط الرئيسية -->
            <a id="csf-home-link" href="#" class="csf-home-link">
              🏠 الصفحة الرئيسية
            </a>
          </div>

        </div>

        <!-- Divider -->
        <div class="csf-divider"></div>

        <!-- Bottom -->
        <div class="csf-bottom">
          <span>
            بُني بـ <span style="color:var(--accent)">♥</span>
            باستخدام Tailwind CSS · Vanilla JS · Theme System
          </span>
          <span id="csf-year"></span>
        </div>

      </div>
    </footer>`;

  /* ══════════════════════════════════════════
     FOOTER CSS
  ══════════════════════════════════════════ */
  const FOOTER_CSS = `
    #cs-footer-inner {
      background: var(--bg-surface, var(--bg-card));
      border-top: 1px solid var(--border);
      margin-top: 5rem;
    }
    .csf-body {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 1.5rem;
    }
    .csf-grid {
      display: grid;
      grid-template-columns: 1.8fr 1fr 1fr;
      gap: 2.5rem;
    }
    @media (max-width: 860px) {
      .csf-grid { grid-template-columns: 1fr 1fr; }
      .csf-col-brand { grid-column: 1 / -1; }
    }
    @media (max-width: 520px) {
      .csf-grid { grid-template-columns: 1fr; }
    }

    /* Brand */
    .csf-brand {
      display: flex;
      align-items: center;
      gap: .75rem;
      margin-bottom: .9rem;
    }
    .csf-brand-icon {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: .75rem;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;
      box-shadow: 0 4px 12px var(--accent-border, rgba(99,102,241,.3));
    }
    .csf-brand-name {
      font-size: 1rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .csf-brand-sub {
      font-size: .7rem;
      color: var(--text-muted);
      margin-top: .1rem;
    }
    .csf-desc {
      font-size: .8rem;
      color: var(--text-muted);
      line-height: 1.75;
      margin: 0 0 1rem;
    }

    /* Socials */
    .csf-socials {
      display: flex;
      gap: .45rem;
    }
    .csf-social {
      width: 2rem;
      height: 2rem;
      border-radius: .5rem;
      background: var(--bg-base);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      text-decoration: none;
      transition: all .2s ease;
    }
    .csf-social:hover {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
      transform: translateY(-2px);
    }

    /* Column */
    .csf-col-title {
      font-size: .75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 .9rem;
      text-transform: uppercase;
      letter-spacing: .06em;
    }

    /* Links */
    .csf-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }
    .csf-link {
      font-size: .82rem;
      color: var(--text-muted);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: .4rem;
      transition: color .2s ease, gap .2s ease;
    }
    .csf-link:hover {
      color: var(--accent);
      gap: .6rem;
    }

    /* Stats */
    .csf-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: .5rem;
      margin-bottom: .85rem;
    }
    .csf-stat {
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: .6rem;
      padding: .65rem .4rem;
      text-align: center;
    }
    .csf-stat-num {
      display: block;
      font-size: 1.35rem;
      font-weight: 900;
      color: var(--accent);
      line-height: 1;
    }
    .csf-stat-lbl {
      display: block;
      font-size: .65rem;
      color: var(--text-muted);
      margin-top: .2rem;
    }

    /* Theme note */
    .csf-theme-note {
      display: flex;
      align-items: center;
      gap: .5rem;
      background: var(--accent-bg, rgba(99,102,241,.08));
      border: 1px solid var(--accent-border, rgba(99,102,241,.2));
      border-radius: .6rem;
      padding: .5rem .75rem;
      font-size: .75rem;
      color: var(--text-secondary);
      margin-bottom: .75rem;
    }

    /* Home link */
    .csf-home-link {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      font-size: .8rem;
      font-weight: 600;
      color: var(--accent);
      text-decoration: none;
      padding: .4rem .85rem;
      border: 1px solid var(--accent-border, rgba(99,102,241,.3));
      border-radius: .6rem;
      background: var(--accent-bg, rgba(99,102,241,.06));
      transition: all .2s ease;
    }
    .csf-home-link:hover {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }

    /* Divider + Bottom */
    .csf-divider {
      border-top: 1px solid var(--border-subtle, var(--border));
      margin: 1.75rem 0 1rem;
      opacity: .5;
    }
    .csf-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: .5rem;
      font-size: .75rem;
      color: var(--text-muted);
      padding-bottom: .5rem;
    }
  `;

  /* ══════════════════════════════════════════
     INJECT
  ══════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('csf-styles')) return;
    const s = document.createElement('style');
    s.id = 'csf-styles';
    s.textContent = FOOTER_CSS;
    document.head.appendChild(s);
  }

  function injectHTML() {
    let slot = document.getElementById('cs-footer');
    if (!slot) {
      slot = document.createElement('div');
      slot.id = 'cs-footer';
      document.body.appendChild(slot);
    }
    slot.innerHTML = FOOTER_HTML;
  }

  /* ══════════════════════════════════════════
     POPULATE DATA
  ══════════════════════════════════════════ */
  function populateData() {
    /* رابط الصفحة الرئيسية */
    const homeLink = document.getElementById('csf-home-link');
    if (homeLink) homeLink.href = getRootHref();

    /* الإحصائيات من PAGES_DATA */
    if (typeof PAGES_DATA === 'undefined') return;

    const totalTerms    = PAGES_DATA.reduce((s, p) => s + (p.terms    || 0), 0);
    const totalSnippets = PAGES_DATA.reduce((s, p) => s + (p.snippets || 0), 0);

    animateCount('csf-stat-pages',    PAGES_DATA.length);
    animateCount('csf-stat-terms',    totalTerms);
    animateCount('csf-stat-snippets', totalSnippets);
  }

  /* ══════════════════════════════════════════
     ANIMATED COUNTER
  ══════════════════════════════════════════ */
  function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let cur = 0;
    const step  = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(timer);
    }, 40);
  }

  /* ══════════════════════════════════════════
     YEAR
  ══════════════════════════════════════════ */
  function setYear() {
    const el = document.getElementById('csf-year');
    if (el) el.textContent = `© ${new Date().getFullYear()} CheatSheet Hub`;
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  function init() {
    injectBackButton();
    injectStyles();
    injectHTML();
    setYear();

    if (typeof PAGES_DATA !== 'undefined') {
      populateData();
    } else {
      document.addEventListener('pages-loaded', populateData);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { refresh: populateData };

})();

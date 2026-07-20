/* ============================================================
   APP.JS — data-cleaning page
   كل المنطق هنا، لا توجد بيانات
============================================================ */

/* ─── State ─── */
let activeCategory = 'all';
let quizIndex      = 0;
let quizScore      = 0;
let quizAnswered   = false;

/* ─── Category labels ─── */
const CAT_LABELS = {
  all:       'الكل',
  missing:   '❓ مفقودة',
  duplicate: '🔁 تكرارات',
  outlier:   '🚨 شذوذ',
  transform: '🔄 تحويل',
  validate:  '✅ تحقق',
};

/* ─── Level badge styles ─── */
const LEVEL_STYLE = {
  'مبتدئ': 'background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3)',
  'متوسط': 'background:rgba(234,179,8,0.15);color:#facc15;border:1px solid rgba(234,179,8,0.3)',
  'متقدم': 'background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)',
};

/* ============================================================
   BOOT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  buildCatFilters();
  renderTerms(TERMS);
  renderProcessSteps();
  renderCaseStudy();
  renderCheatSheet();
  renderQuiz();

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});

/* ============================================================
   NAVIGATION
============================================================ */
function showSection(name) {
  document.querySelectorAll('[id^="section-"]').forEach(s => {
    s.className = 'section-hidden';
  });

  const target = document.getElementById('section-' + name);
  if (target) target.className = 'section-visible';

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const activeTab = document.getElementById('tab-' + name);
  if (activeTab) activeTab.classList.add('active');

  if (name === 'casestudy') {
    setTimeout(() => {
      document.querySelectorAll('.progress-bar').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    }, 350);
  }

  if (name === 'quiz') renderQuizProgress();
}

/* ============================================================
   TERMS — عرض البطاقات
============================================================ */
function renderTerms(list) {
  const grid = document.getElementById('termsGrid');

  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:.75rem">🔍</div>
        <p style="font-size:.95rem">لا توجد نتائج مطابقة للبحث</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(t => `
    <div class="card"
         style="cursor:pointer;padding:1.25rem"
         onclick="openModal(${t.id})"
         role="button"
         aria-label="عرض تفاصيل ${t.title}">

      <div style="display:flex;align-items:flex-start;
                  justify-content:space-between;margin-bottom:.85rem">
        <div style="display:flex;align-items:center;gap:.75rem">
          <span style="font-size:1.75rem;line-height:1">${t.icon}</span>
          <div>
            <div style="font-weight:700;color:var(--text-primary);
                        font-size:.95rem">${t.title}</div>
            <div style="font-size:.72rem;color:var(--text-muted);
                        margin-top:.1rem">${t.en}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;
                    align-items:flex-end;gap:.35rem;flex-shrink:0">
          <span class="badge" style="${LEVEL_STYLE[t.level]}">${t.level}</span>
          <span class="badge">${CAT_LABELS[t.category]}</span>
        </div>
      </div>

      <p style="font-size:.85rem;color:var(--text-secondary);
                line-height:1.65;margin:0">${t.short}</p>

      <div style="margin-top:1rem;padding-top:.75rem;
                  border-top:1px solid var(--border-subtle);
                  display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:.72rem;color:var(--text-muted);
                     display:flex;align-items:center;gap:.4rem">
          <span style="width:6px;height:6px;border-radius:50%;
                       background:var(--accent);display:inline-block"></span>
          انقر للتفاصيل والكود
        </span>
        <span style="color:var(--text-muted);font-size:.85rem">←</span>
      </div>
    </div>`).join('');
}

/* ─── بناء أزرار الفلتر ─── */
function buildCatFilters() {
  const container = document.getElementById('catFilters');
  if (!container) return;

  container.innerHTML = Object.entries(CAT_LABELS).map(([key, label]) => `
    <button
      class="cat-btn"
      data-cat="${key}"
      onclick="filterByCategory('${key}')"
      style="padding:.4rem 1rem;border-radius:.6rem;font-size:.75rem;
             font-weight:600;cursor:pointer;transition:all .2s ease;
             border:1px solid ${key === 'all' ? 'var(--accent)' : 'var(--border)'};
             background:${key === 'all' ? 'var(--accent)' : 'var(--bg-card)'};
             color:${key === 'all' ? '#fff' : 'var(--text-secondary)'}">
      ${label}
    </button>`).join('');
}

/* ─── فلترة بالبحث ─── */
function filterTerms() {
  const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const filtered = TERMS.filter(t =>
    (activeCategory === 'all' || t.category === activeCategory) &&
    (!q ||
      t.title.includes(q)            ||
      t.en.toLowerCase().includes(q) ||
      t.short.includes(q)            ||
      t.desc.includes(q)
    )
  );
  renderTerms(filtered);
}

/* ─── فلترة بالفئة ─── */
function filterByCategory(cat) {
  activeCategory = cat;

  document.querySelectorAll('.cat-btn').forEach(btn => {
    const isActive = btn.dataset.cat === cat;
    btn.style.background  = isActive ? 'var(--accent)'  : 'var(--bg-card)';
    btn.style.color       = isActive ? '#fff'            : 'var(--text-secondary)';
    btn.style.borderColor = isActive ? 'var(--accent)'   : 'var(--border)';
  });

  filterTerms();
}

/* ============================================================
   MODAL
============================================================ */
function openModal(id) {
  const t = TERMS.find(x => x.id === id);
  if (!t) return;

  document.getElementById('modalIcon').textContent  = t.icon;
  document.getElementById('modalTitle').textContent = `${t.title} — ${t.en}`;

  const badge = document.getElementById('modalBadge');
  badge.textContent = `${t.level} · ${CAT_LABELS[t.category]}`;
  badge.setAttribute('style', LEVEL_STYLE[t.level] + ';display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;margin-top:4px');

  document.getElementById('modalDesc').textContent = t.desc;

  const fEl = document.getElementById('modalFormula');
  if (t.formula) {
    fEl.style.display = 'block';
    fEl.innerHTML = `
      <div style="background:var(--bg-base);border:1px solid var(--border);
                  border-radius:.75rem;padding:.75rem 1rem;
                  font-family:'Courier New',monospace;font-size:.85rem;
                  text-align:center;color:var(--accent-light);
                  direction:ltr;letter-spacing:.03em;word-break:break-all">
        ${t.formula}
      </div>`;
  } else {
    fEl.style.display = 'none';
  }

  const cEl = document.getElementById('modalCode');
  if (t.code) {
    cEl.style.display    = 'block';
    cEl.style.whiteSpace = 'pre';
    cEl.style.fontFamily = 'monospace';
    cEl.textContent      = t.code.trim();
  } else {
    cEl.style.display = 'none';
  }

  document.getElementById('modalExample').textContent = t.example;

  document.getElementById('termModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('termModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   PROCESS STEPS
============================================================ */
function renderProcessSteps() {
  const container = document.getElementById('processSteps');
  if (!container) return;

  container.innerHTML = PROCESS_STEPS.map((s, i) => `
    <div style="background:var(--bg-card);border:1px solid var(--border);
                border-radius:1rem;overflow:hidden;
                box-shadow:var(--shadow-card);transition:box-shadow .3s ease">

      <div style="display:flex;align-items:center;gap:1rem;
                  padding:1.1rem 1.25rem;cursor:pointer;user-select:none"
           onclick="toggleStep(${i})"
           role="button"
           aria-expanded="false"
           aria-controls="step-body-${i}">

        <div style="width:2.25rem;height:2.25rem;border-radius:.6rem;
                    background:var(--accent);display:flex;align-items:center;
                    justify-content:center;font-weight:900;color:#fff;
                    font-size:.8rem;flex-shrink:0">${s.num}</div>

        <span style="font-size:1.4rem;line-height:1">${s.icon}</span>

        <div style="flex:1;min-width:0">
          <div style="font-weight:700;color:var(--text-primary)">${s.title}</div>
          <div style="font-size:.8rem;color:var(--text-secondary);
                      margin-top:.15rem">${s.desc}</div>
        </div>

        <div style="display:flex;align-items:center;gap:.6rem;flex-shrink:0">
          <span class="badge">${s.time} من الوقت</span>
          <span id="step-arrow-${i}"
                style="color:var(--text-muted);transition:transform .3s ease;
                       display:inline-block;font-size:.8rem">▼</span>
        </div>
      </div>

      <div id="step-body-${i}"
           style="display:none;padding:0 1.25rem 1.25rem">
        <div style="border-top:1px solid var(--border-subtle);
                    margin-bottom:1rem;padding-top:1rem;
                    display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">

          <div>
            <div style="font-size:.7rem;font-weight:700;color:var(--text-muted);
                        text-transform:uppercase;letter-spacing:.06em;
                        margin-bottom:.6rem">المهام الرئيسية</div>
            <ul style="list-style:none;padding:0;margin:0;
                       display:flex;flex-direction:column;gap:.5rem">
              ${s.details.map(d => `
                <li style="display:flex;align-items:center;gap:.5rem;
                           font-size:.85rem;color:var(--text-secondary)">
                  <span style="width:6px;height:6px;border-radius:50%;
                               background:var(--accent);flex-shrink:0"></span>
                  ${d}
                </li>`).join('')}
            </ul>
          </div>

          <div>
            <div style="font-size:.7rem;font-weight:700;color:var(--text-muted);
                        text-transform:uppercase;letter-spacing:.06em;
                        margin-bottom:.6rem">الأدوات المستخدمة</div>
            <div style="display:flex;flex-wrap:wrap;gap:.4rem">
              ${s.tools.map(tool => `<span class="badge">${tool}</span>`).join('')}
            </div>
          </div>

        </div>
      </div>
    </div>`).join('');
}

function toggleStep(i) {
  const body  = document.getElementById(`step-body-${i}`);
  const arrow = document.getElementById(`step-arrow-${i}`);
  const isOpen = body.style.display !== 'none';

  body.style.display    = isOpen ? 'none'         : 'block';
  arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

/* ============================================================
   CASE STUDY
============================================================ */
function renderCaseStudy() {
  const container = document.getElementById('caseSteps');
  if (!container) return;

  container.innerHTML = CASE_STEPS.map(s => `
    <div style="background:var(--bg-card);border:1px solid var(--border);
                border-radius:1rem;padding:1.25rem;
                box-shadow:var(--shadow-card)">

      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.85rem">
        <div style="width:2rem;height:2rem;border-radius:.5rem;
                    background:var(--accent);display:flex;align-items:center;
                    justify-content:center;font-weight:700;color:#fff;
                    font-size:.8rem;flex-shrink:0">${s.step}</div>
        <span style="font-size:1.2rem;line-height:1">${s.icon}</span>
        <span style="font-weight:700;color:var(--text-primary)">${s.title}</span>
      </div>

      <p style="font-size:.875rem;color:var(--text-secondary);
                margin:0 0 .85rem;line-height:1.6">${s.content}</p>

      ${s.code ? `
        <div class="code-block" style="padding:1rem;margin-bottom:.85rem">
          <pre style="margin:0;white-space:pre;overflow-x:auto">${s.code}</pre>
        </div>` : ''}

      <div style="background:var(--accent-bg);border:1px solid var(--accent-border);
                  border-radius:.75rem;padding:.85rem 1rem;
                  font-size:.85rem;color:var(--text-secondary);
                  line-height:1.65;white-space:pre-line">
        ${s.insight}
      </div>

    </div>`).join('');
}

/* ============================================================
   CHEAT SHEET
============================================================ */
function renderCheatSheet() {
  const grid = document.getElementById('cheatSheetGrid');
  if (!grid) return;

  grid.innerHTML = CHEAT_SHEETS.map((cs, i) => `
    <div style="background:var(--bg-card);border:1px solid var(--border);
                border-radius:1rem;overflow:hidden;
                box-shadow:var(--shadow-card)">

      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:.75rem 1.1rem;
                  border-bottom:1px solid var(--border)">
        <span style="font-weight:700;font-size:.9rem;
                     color:var(--text-primary)">${cs.title}</span>
        <button id="copy-btn-${i}"
                onclick="copyCode(${i})"
                style="font-size:.75rem;color:var(--text-muted);
                       background:var(--bg-base);border:1px solid var(--border);
                       padding:.3rem .85rem;border-radius:.5rem;cursor:pointer;
                       display:flex;align-items:center;gap:.35rem;
                       transition:all .2s ease">
          <span id="copy-icon-${i}">📋</span> نسخ
        </button>
      </div>

      <div class="code-block"
           style="border:none;border-radius:0;padding:1.1rem">
        <pre id="code-block-${i}"
             style="margin:0;white-space:pre;overflow-x:auto">${cs.code}</pre>
      </div>

    </div>`).join('');
}

function copyCode(i) {
  const code = document.getElementById(`code-block-${i}`).textContent;
  navigator.clipboard.writeText(code).then(() => {
    const icon = document.getElementById(`copy-icon-${i}`);
    const btn  = document.getElementById(`copy-btn-${i}`);
    icon.textContent      = '✅';
    btn.style.color       = '#4ade80';
    btn.style.borderColor = '#4ade80';
    setTimeout(() => {
      icon.textContent      = '📋';
      btn.style.color       = '';
      btn.style.borderColor = '';
    }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = code;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

/* ============================================================
   QUIZ
============================================================ */
function renderQuizProgress() {
  const container = document.getElementById('quizProgress');
  if (!container) return;

  container.innerHTML = QUIZ.map((_, i) => {
    let bg = 'background:var(--border)';
    if (i < quizIndex)   bg = 'background:var(--accent)';
    if (i === quizIndex) bg = 'background:var(--accent-light)';
    return `
      <div style="width:10px;height:10px;border-radius:50%;
                  ${bg};transition:background .3s ease"></div>`;
  }).join('');
}

function renderQuiz() {
  renderQuizProgress();

  if (quizIndex >= QUIZ.length) {
    showQuizResult();
    return;
  }

  const q = QUIZ[quizIndex];

  document.getElementById('quizResult').classList.add('hidden');
  document.getElementById('quizContainer').style.display = 'block';

  document.getElementById('quizContainer').innerHTML = `
    <div style="background:var(--bg-card);border:1px solid var(--border);
                border-radius:1rem;padding:1.5rem;
                box-shadow:var(--shadow-card);animation:csPageFadeIn .35s ease">

      <div style="display:flex;align-items:center;justify-content:space-between;
                  margin-bottom:1.25rem">
        <span style="font-size:.8rem;color:var(--text-muted)">
          سؤال ${quizIndex + 1} من ${QUIZ.length}
        </span>
        <span class="badge">النقاط: ${quizScore} / ${quizIndex}</span>
      </div>

      <h3 style="font-size:1.05rem;font-weight:700;color:var(--text-primary);
                 line-height:1.6;margin:0 0 1.25rem">${q.q}</h3>

      <div id="optionsContainer"
           style="display:flex;flex-direction:column;gap:.65rem">
        ${q.options.map((opt, i) => `
          <button
            class="quiz-option"
            data-index="${i}"
            onclick="answerQuiz(${i})"
            style="width:100%;text-align:right;padding:.9rem 1.1rem;
                   border-radius:.75rem;border:1px solid var(--border);
                   background:var(--bg-base);color:var(--text-secondary);
                   font-size:.875rem;cursor:pointer;
                   display:flex;align-items:center;gap:.75rem;
                   transition:all .2s ease">
            <span style="width:1.75rem;height:1.75rem;border-radius:.4rem;
                         background:var(--bg-card);border:1px solid var(--border);
                         display:flex;align-items:center;justify-content:center;
                         font-size:.75rem;font-weight:700;color:var(--text-muted);
                         flex-shrink:0">
              ${['أ','ب','ج','د'][i]}
            </span>
            <span style="flex:1;line-height:1.5">${opt}</span>
          </button>`).join('')}
      </div>

      <div id="explanationBox"
           style="display:none;margin-top:1rem;
                  background:var(--accent-bg);border:1px solid var(--accent-border);
                  border-radius:.75rem;padding:.85rem 1rem;
                  font-size:.85rem;color:var(--text-secondary);line-height:1.6">
      </div>

      <div id="nextBtnWrap" style="display:none;margin-top:1rem">
        <button onclick="nextQuestion()"
                class="btn-accent"
                style="width:100%;padding:.85rem;font-size:.95rem;
                       border-radius:.75rem;text-align:center">
          ${quizIndex + 1 < QUIZ.length ? 'السؤال التالي ←' : 'عرض النتيجة 🎉'}
        </button>
      </div>

    </div>`;
}

function answerQuiz(selected) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q       = QUIZ[quizIndex];
  const options = document.querySelectorAll('.quiz-option');

  options.forEach((btn, i) => {
    btn.style.cursor = 'default';
    btn.onclick      = null;

    if (i === q.correct) {
      btn.style.background  = 'rgba(34,197,94,0.12)';
      btn.style.borderColor = '#4ade80';
      btn.style.color       = '#4ade80';
      const badge = btn.querySelector('span:first-child');
      if (badge) {
        badge.style.background  = 'rgba(34,197,94,0.2)';
        badge.style.borderColor = '#4ade80';
        badge.style.color       = '#4ade80';
      }
    }

    if (i === selected && selected !== q.correct) {
      btn.style.background  = 'rgba(239,68,68,0.12)';
      btn.style.borderColor = '#f87171';
      btn.style.color       = '#f87171';
      const badge = btn.querySelector('span:first-child');
      if (badge) {
        badge.style.background  = 'rgba(239,68,68,0.2)';
        badge.style.borderColor = '#f87171';
        badge.style.color       = '#f87171';
      }
    }
  });

  if (selected === q.correct) quizScore++;

  const expBox = document.getElementById('explanationBox');
  expBox.style.display = 'block';
  expBox.innerHTML = `
    <span style="font-weight:700;color:${selected === q.correct ? '#4ade80' : '#f87171'}">
      ${selected === q.correct ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة'}
    </span>
    <br/><br/>💡 ${q.explanation}`;

  document.getElementById('nextBtnWrap').style.display = 'block';
}

function nextQuestion() {
  quizIndex++;
  quizAnswered = false;
  renderQuiz();
}

function showQuizResult() {
  document.getElementById('quizContainer').style.display = 'none';

  const result = document.getElementById('quizResult');
  result.classList.remove('hidden');

  const pct   = Math.round((quizScore / QUIZ.length) * 100);
  const total = QUIZ.length;

  let emoji, title, color;
  if (pct >= 80) {
    emoji = '🏆'; title = 'ممتاز! أنت مهندس بيانات محترف!';
    color = '#4ade80';
  } else if (pct >= 60) {
    emoji = '🎯'; title = 'جيد جداً! تقريباً وصلت!';
    color = '#facc15';
  } else if (pct >= 40) {
    emoji = '📚'; title = 'راجع المصطلحات وحاول مجدداً';
    color = '#fb923c';
  } else {
    emoji = '💪'; title = 'لا تستسلم — المراجعة هي المفتاح!';
    color = '#f87171';
  }

  document.getElementById('resultEmoji').textContent = emoji;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultTitle').style.color = color;
  document.getElementById('resultScore').textContent =
    `أجبت على ${quizScore} من ${total} أسئلة بشكل صحيح (${pct}%)`;
}

function resetQuiz() {
  quizIndex    = 0;
  quizScore    = 0;
  quizAnswered = false;

  document.getElementById('quizResult').classList.add('hidden');
  document.getElementById('quizContainer').style.display = 'block';

  renderQuiz();
}

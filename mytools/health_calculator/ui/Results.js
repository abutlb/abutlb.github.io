import { getBMICategory, getBMINeedlePercent } from '../core/Metrics.js';
import { DIMENSION_META, getScoreLabel, getAssessmentText } from '../core/HealthScorer.js';
import { REC_SECTION_META, GOAL_LABELS }                   from '../core/Recommender.js';
import { getFoodRecommendations }                           from '../data/foods.js';
import { getNutrientRecommendations }                       from '../data/nutrients.js';
import { analyzeLabResults, LAB_GROUP_META, getLabSummary } from '../core/LabAnalyzer.js';

function el(id) { return document.getElementById(id); }
function set(id, v) { const e = el(id); if (e) e.textContent = v; }

export function renderAll(state) {
  const { metrics, scores, recs, plan, form } = state;
  updateQuickStats(metrics, scores);
  renderBMI(metrics);
  renderCalories(metrics, form);
  renderScores(scores);
  renderRecommendations(recs, form, metrics);
  renderWeightPlan(plan, metrics);
  renderLabResults(form?.labs, form?.gender);
  showResults();
}

export function updateQuickStats(metrics, scores) {
  if (!metrics) return;
  const cat = getBMICategory(metrics.bmi);
  set('stat-bmi',       metrics.bmi.toFixed(1));
  set('stat-bmi-label', cat.label);
  set('stat-calories',  Math.round(metrics.targetCalories).toLocaleString());
  set('stat-score',     scores?.overall ?? '--');
  if (scores) {
    const lbl = getScoreLabel(scores.overall);
    const el2 = el('stat-score-label');
    if (el2) { el2.textContent = lbl.text; el2.className = `text-xs ${lbl.cls}`; }
  }
  set('stat-ideal',     metrics.idealWeight + ' كجم');
}

function renderBMI(metrics) {
  const cat  = getBMICategory(metrics.bmi);
  const pct  = getBMINeedlePercent(metrics.bmi);

  set('res-bmi',     metrics.bmi.toFixed(1));
  set('res-bmi-cat', cat.label);
  set('res-ideal',   metrics.idealWeight + ' كجم');
  set('res-range',   `${metrics.healthyRange.min} – ${metrics.healthyRange.max} كجم`);

  const bmiEl = el('res-bmi');
  if (bmiEl) bmiEl.className = `text-5xl font-bold mb-1 ${cat.cls}`;

  const needle = el('bmi-needle');
  if (needle) { needle.style.right = pct + '%'; needle.style.left = ''; }
}

function renderCalories(metrics, form) {
  set('res-bmr',     Math.round(metrics.bmr).toLocaleString() + ' سعرة');
  set('res-tdee',    Math.round(metrics.tdee).toLocaleString() + ' سعرة');
  set('res-target',  Math.round(metrics.targetCalories).toLocaleString() + ' سعرة');
  set('res-water',   metrics.waterNeeds + ' لتر');
  set('res-protein', metrics.macros.protein.g + 'ج');
  set('res-carbs',   metrics.macros.carbs.g + 'ج');
  set('res-fat',     metrics.macros.fat.g + 'ج');
  set('res-protein-pct', metrics.macros.protein.pct + '%');
  set('res-carbs-pct',   metrics.macros.carbs.pct + '%');
  set('res-fat-pct',     metrics.macros.fat.pct + '%');

  const goalLabel = GOAL_LABELS[form.primaryGoal] ?? '';
  set('res-goal-label', goalLabel);
}

function renderScores(scores) {
  const overall = getScoreLabel(scores.overall);

  set('res-overall-score', scores.overall);
  set('res-overall-label', overall.text);
  set('res-overall-assess', getAssessmentText('cardiovascular', scores.overall));

  const ring = el('overall-ring');
  if (ring) {
    ring.setAttribute('stroke-dasharray', `${scores.overall} ${100 - scores.overall}`);
    const RING_COLORS = {
      'bg-emerald-500': '#10b981',
      'bg-sky-500':     '#0ea5e9',
      'bg-teal-500':    '#14b8a6',
      'bg-amber-500':   '#f59e0b',
      'bg-red-500':     '#ef4444',
    };
    ring.setAttribute('stroke', RING_COLORS[overall.bg] ?? '#0ea5e9');
  }

  const container = el('dimension-scores');
  if (!container) return;
  container.innerHTML = Object.keys(DIMENSION_META).map(key => {
    const { ar, icon }  = DIMENSION_META[key];
    const score         = scores[key];
    const lbl           = getScoreLabel(score);
    const assess        = getAssessmentText(key, score);
    return `
      <div class="dim-row">
        <div class="dim-header">
          <span class="dim-icon">${icon}</span>
          <span class="dim-name">${ar}</span>
          <span class="dim-score ${lbl.cls} font-bold">${score}</span>
          <span class="dim-label text-xs ${lbl.cls}">${lbl.text}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${lbl.bg}" style="width:${score}%;transition:width 0.8s ease"></div>
        </div>
        <p class="dim-assess">${assess}</p>
      </div>`;
  }).join('');
}

function renderRecommendations(recs, form, metrics) {
  const foods     = getFoodRecommendations(form, metrics);
  const nutrients = getNutrientRecommendations(form);
  const container = el('recs-content');
  if (!container) return;

  const sections = Object.entries(REC_SECTION_META)
    .filter(([key]) => recs[key]?.length > 0)
    .map(([key, meta]) => `
      <div class="rec-section">
        <h4 class="rec-title">${meta.icon} ${meta.label}</h4>
        <ul class="rec-list">
          ${recs[key].map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>`).join('');

  const foodsHtml = `
    <div class="rec-section">
      <h4 class="rec-title">🍽️ الأطعمة المُوصى بها</h4>
      <div class="food-grid">
        ${foods.map(f => `
          <div class="food-card">
            <span class="food-icon">${f.icon}</span>
            <div>
              <div class="food-name">${f.name}</div>
              <div class="food-benefit">${f.benefit}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;

  const nutrientsHtml = `
    <div class="rec-section">
      <h4 class="rec-title">💊 الفيتامينات والمعادن المهمة</h4>
      <div class="nutrient-grid">
        ${nutrients.map(n => `
          <div class="nutrient-card">
            <div class="nutrient-header">
              <span>${n.icon}</span>
              <strong>${n.name}</strong>
            </div>
            <div class="nutrient-amount">${n.amount}</div>
            <div class="nutrient-source">المصادر: ${n.source}</div>
            <div class="nutrient-why">الفائدة: ${n.why}</div>
          </div>`).join('')}
      </div>
    </div>`;

  container.innerHTML = sections + foodsHtml + nutrientsHtml;
}

function renderWeightPlan(plan, metrics) {
  const section = el('section-weight-plan');
  if (!plan || plan.type === 'maintain') {
    section?.classList.add('hidden');
    return;
  }
  section?.classList.remove('hidden');

  const content = el('weight-plan-content');
  if (!content) return;

  const isLoss = plan.type === 'loss';
  const arrow  = isLoss ? '📉' : '📈';

  content.innerHTML = `
    <div class="plan-message">${arrow} ${plan.message}</div>
    <div class="plan-stats">
      <div class="plan-stat">
        <div class="label">السعرات للهدف</div>
        <div class="value text-sky-600">${plan.dailyCalories.toLocaleString()}</div>
        <div class="unit">سعرة/يوم</div>
      </div>
      <div class="plan-stat">
        <div class="label">المدة المتوقعة</div>
        <div class="value text-emerald-600">${plan.weeksNeeded}</div>
        <div class="unit">أسبوع (~${plan.monthsNeeded} شهر)</div>
      </div>
      <div class="plan-stat">
        <div class="label">الوزن الحالي</div>
        <div class="value text-slate-700 dark:text-slate-200">${plan.currentWeight}</div>
        <div class="unit">كجم</div>
      </div>
      <div class="plan-stat">
        <div class="label">الوزن المستهدف</div>
        <div class="value text-purple-600">${plan.targetWeight}</div>
        <div class="unit">كجم</div>
      </div>
    </div>
    <p class="plan-note">
      ⚠️ هذه تقديرات تقريبية. الاستشارة مع أخصائي تغذية تعطي نتائج أفضل.
    </p>`;
}

function renderLabResults(labs, gender) {
  const section = el('section-labs');
  if (!labs || !section) return;

  const results = analyzeLabResults(labs, gender ?? 'male');
  if (results.length === 0) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');

  const summary = getLabSummary(results);

  const summaryEl = el('labs-summary');
  if (summaryEl) {
    const summaryItems = [
      { label: 'مؤشر محلّل', val: summary.total, cls: 'text-sky-600' },
      { label: 'يحتاج اهتماماً', val: summary.abnormal, cls: summary.abnormal ? 'text-amber-600' : 'text-emerald-600' },
      { label: 'حالة حرجة', val: summary.critical, cls: summary.critical ? 'text-red-600' : 'text-emerald-600' },
    ];
    summaryEl.innerHTML = `
      <div class="lab-summary-row">
        ${summaryItems.map(s => `
          <div class="lab-summary-stat">
            <div class="value ${s.cls}">${s.val}</div>
            <div class="label">${s.label}</div>
          </div>`).join('')}
      </div>`;
  }

  // Group results
  const grouped = {};
  for (const r of results) {
    if (!grouped[r.group]) grouped[r.group] = [];
    grouped[r.group].push(r);
  }

  const contentEl = el('labs-content');
  if (!contentEl) return;

  contentEl.innerHTML = Object.entries(grouped).map(([grp, items]) => {
    const meta = LAB_GROUP_META[grp] ?? { label: grp, icon: '🔬' };
    return `
      <div class="lab-group">
        <h4 class="lab-group-title">${meta.icon} ${meta.label}</h4>
        ${items.map(r => renderLabItem(r)).join('')}
      </div>`;
  }).join('');
}

function renderLabItem(r) {
  const recsHtml = r.recs.length
    ? `<ul class="lab-recs">${r.recs.map(rec =>
        `<li class="${rec.startsWith('⚕️') ? 'lab-rec-medical' : ''}">${rec}</li>`
      ).join('')}</ul>`
    : '';

  return `
    <div class="lab-item ${r.status.bg}">
      <div class="lab-item-header">
        <span class="lab-icon">${r.icon}</span>
        <span class="lab-name">${r.nameAr}</span>
        <span class="lab-value">${r.value} <small>${r.unit}</small></span>
        <span class="lab-badge ${r.status.cls}">${r.status.dot} ${r.status.ar}</span>
      </div>
      ${recsHtml}
    </div>`;
}

function showResults() {
  el('results-placeholder')?.classList.add('hidden');
  el('results-content')?.classList.remove('hidden');
  el('section-charts')?.classList.remove('hidden');
}

export function showError(msg) {
  const toastEl = document.createElement('div');
  toastEl.className = 'toast toast-error';
  toastEl.textContent = msg;
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3500);
}

export function showSuccess(msg) {
  const toastEl = document.createElement('div');
  toastEl.className = 'toast toast-success';
  toastEl.textContent = msg;
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 2500);
}

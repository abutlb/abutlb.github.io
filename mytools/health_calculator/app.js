import {
  calculateBMI, getBMICategory, calculateBMR, calculateTDEE,
  calculateIdealWeight, getHealthyWeightRange, calculateMacros,
  calculateWaterNeeds, calculateTargetCalories,
} from './core/Metrics.js';
import { scoreAll }                     from './core/HealthScorer.js';
import { buildWeightPlan }              from './core/WeightPlanner.js';
import { generateRecommendations }      from './core/Recommender.js';
import { renderAll, updateQuickStats, showError, showSuccess } from './ui/Results.js';
import { renderCharts }                 from './ui/Charts.js';
import {
  readForm, validateForm, applyToForm,
  activateToggle, setupRangeDisplays, setupGoalVisibility, resetForm,
} from './ui/Form.js';
import { saveState, loadState, clearState } from './storage.js';

const state = {
  form:    null,
  metrics: null,
  scores:  null,
  recs:    null,
  plan:    null,
};

function computeMetrics(form) {
  const bmr    = calculateBMR(form.weightKg, form.heightCm, form.age, form.gender, form.bmrFormula, form.bodyFat);
  const tdee   = calculateTDEE(bmr, form.activityLevel);
  const bmi    = calculateBMI(form.weightKg, form.heightCm);
  const macros = calculateMacros(calculateTargetCalories(tdee, form.primaryGoal, form.weightChangeRate), form.macroDistribution);

  return {
    bmi,
    bmr,
    tdee,
    idealWeight:    calculateIdealWeight(form.heightCm, form.gender),
    healthyRange:   getHealthyWeightRange(form.heightCm),
    waterNeeds:     calculateWaterNeeds(form.weightKg, form.activityLevel),
    targetCalories: calculateTargetCalories(tdee, form.primaryGoal, form.weightChangeRate),
    macros,
  };
}

function onCalculate() {
  const form   = readForm();
  const errors = validateForm(form);
  if (errors.length) { showError(errors[0]); return; }

  const metrics = computeMetrics(form);
  const scores  = scoreAll(form, metrics);
  const recs    = generateRecommendations(form, metrics, scores);
  const plan    = buildWeightPlan(form, metrics, form.weightChangeRate);

  Object.assign(state, { form, metrics, scores, recs, plan });

  renderAll(state);
  setTimeout(() => renderCharts(metrics, scores, plan, isDark()), 100);
  saveState(state);
  showSuccess('✅ تم حساب حالتك الصحية');

  document.getElementById('results-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function onQuickUpdate() {
  const form = readForm();
  if (!form.age || !form.heightCm || !form.weightKg) return;
  const metrics = computeMetrics(form);
  const scores  = scoreAll(form, metrics);
  updateQuickStats(metrics, scores);
}

function isDark() {
  return document.documentElement.classList.contains('dark');
}

function toggleTheme() {
  const html = document.documentElement;
  html.classList.toggle('dark');
  localStorage.setItem('hc-theme', isDark() ? 'dark' : 'light');
  syncThemeToggle();
}

function syncThemeToggle() {
  const btn  = document.getElementById('btn-theme');
  const dark = isDark();
  if (btn) btn.textContent = dark ? '☀️' : '🌙';
  document.body.classList.toggle('dark-mode', dark);
}

function loadTheme() {
  const saved = localStorage.getItem('hc-theme');
  const pref  = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && pref)) document.documentElement.classList.add('dark');
  syncThemeToggle();
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`)?.classList.remove('hidden');
    });
  });
}

function setupToggleGroups() {
  document.querySelectorAll('.toggle-group').forEach(group => {
    group.querySelectorAll('[data-value]').forEach(btn => {
      btn.addEventListener('click', () => {
        activateToggle(group.id, btn.dataset.value);
        onQuickUpdate();
      });
    });
  });
}

function setupLiveUpdate() {
  const liveIds = ['in-age', 'in-height', 'in-weight', 'in-activity', 'in-sleep', 'in-water'];
  liveIds.forEach(id => {
    document.getElementById(id)?.addEventListener('input', onQuickUpdate);
    document.getElementById(id)?.addEventListener('change', onQuickUpdate);
  });
}

function onSave() {
  if (!state.form) { showError('احسب أولاً قبل الحفظ'); return; }
  if (saveState(state)) showSuccess('✅ تم الحفظ');
}

function onReset() {
  resetForm();
  clearState();
  document.getElementById('results-placeholder')?.classList.remove('hidden');
  document.getElementById('results-content')?.classList.add('hidden');
  document.getElementById('section-charts')?.classList.add('hidden');
  Object.assign(state, { form: null, metrics: null, scores: null, recs: null, plan: null });
  ['stat-bmi','stat-bmi-label','stat-calories','stat-score','stat-score-label','stat-ideal']
    .forEach(id => { const e = document.getElementById(id); if (e) e.textContent = '--'; });
}

function init() {
  loadTheme();
  setupTabs();
  setupToggleGroups();
  setupRangeDisplays();
  setupGoalVisibility();
  setupLiveUpdate();

  document.getElementById('btn-calculate')?.addEventListener('click', onCalculate);
  document.getElementById('btn-reset')?.addEventListener('click', onReset);
  document.getElementById('btn-save')?.addEventListener('click', onSave);
  document.getElementById('btn-print')?.addEventListener('click', () => window.print());
  document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);

  const saved = loadState();
  if (saved?.form) {
    applyToForm(saved);
    onQuickUpdate();
  }

  const cy = document.getElementById('currentYear');
  if (cy) cy.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', init);

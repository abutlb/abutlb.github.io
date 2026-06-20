import { DIMENSION_META } from '../core/HealthScorer.js';

let radarChart  = null;
let macroChart  = null;
let weightChart = null;

function destroyAll() {
  [radarChart, macroChart, weightChart].forEach(c => c?.destroy());
  radarChart = macroChart = weightChart = null;
}

export function renderCharts(metrics, scores, plan, isDark) {
  destroyAll();

  const textColor  = isDark ? '#cbd5e1' : '#475569';
  const gridColor  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  renderRadar(scores, textColor, gridColor);
  renderMacro(metrics.macros, textColor);
  if (plan && plan.type !== 'maintain') {
    renderWeight(plan, isDark);
    document.getElementById('chart-weight-card').classList.remove('hidden');
  } else {
    document.getElementById('chart-weight-card').classList.add('hidden');
  }
}

function renderRadar(scores, textColor, gridColor) {
  const ctx = document.getElementById('canvas-radar');
  if (!ctx) return;

  const dims   = Object.keys(DIMENSION_META);
  const labels = dims.map(k => DIMENSION_META[k].ar);
  const data   = dims.map(k => scores[k]);

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label:                 'مؤشرات الصحة',
        data,
        backgroundColor:       'rgba(14,165,233,0.15)',
        borderColor:           'rgba(14,165,233,0.8)',
        pointBackgroundColor:  'rgba(14,165,233,1)',
        pointBorderColor:      '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(14,165,233,1)',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 25, color: textColor, font: { size: 10 }, backdropColor: 'transparent' },
          grid:        { color: gridColor },
          angleLines:  { color: gridColor },
          pointLabels: { color: textColor, font: { size: 11 } },
        },
      },
      plugins: { legend: { display: false } },
    },
  });
}

function renderMacro(macros, textColor) {
  const ctx = document.getElementById('canvas-macro');
  if (!ctx) return;

  macroChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['بروتين', 'كربوهيدرات', 'دهون'],
      datasets: [{
        data:            [macros.protein.pct, macros.carbs.pct, macros.fat.pct],
        backgroundColor: ['rgba(14,165,233,0.85)', 'rgba(34,197,94,0.85)', 'rgba(245,158,11,0.85)'],
        borderColor:     ['#0ea5e9', '#22c55e', '#f59e0b'],
        borderWidth: 2,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position:  'bottom',
          labels:    { color: textColor, font: { size: 12 }, padding: 16 },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw}% (${
              [macros.protein.g, macros.carbs.g, macros.fat.g][ctx.dataIndex]
            }ج)`,
          },
        },
      },
    },
  });
}

function renderWeight(plan, isDark) {
  const ctx = document.getElementById('canvas-weight');
  if (!ctx) return;

  const isLoss  = plan.type === 'loss';
  const color   = isLoss ? '#22c55e' : '#0ea5e9';
  const labels  = plan.projections.map(p => `أسبوع ${p.week}`);
  const data    = plan.projections.map(p => p.weight);

  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label:           `الوزن المتوقع (كجم)`,
        data,
        borderColor:     color,
        backgroundColor: color + '22',
        fill:            true,
        tension:         0.3,
        pointRadius:     3,
        pointBackgroundColor: color,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: isDark ? '#94a3b8' : '#64748b', maxTicksLimit: 8, font: { size: 10 } },
          grid:  { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        },
        y: {
          ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 },
                   callback: v => `${v} كجم` },
          grid:  { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} كجم`,
          },
        },
      },
    },
  });
}

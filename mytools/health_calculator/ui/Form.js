import { toKg, toCm } from '../core/Metrics.js';

function el(id) { return document.getElementById(id); }
function val(id) { return el(id)?.value ?? ''; }
function num(id) { return parseFloat(val(id)) || 0; }
function checked(id) { return el(id)?.checked ?? false; }

export function readForm() {
  const unit = el('in-unit')?.dataset.active ?? 'metric';
  const rawH = num('in-height');
  const rawW = num('in-weight');

  return {
    unitSystem:       unit,
    age:              parseInt(val('in-age'))  || 0,
    gender:           el('in-gender')?.dataset.active ?? 'male',
    heightCm:         unit === 'imperial' ? toCm(rawH, 'imperial') : rawH,
    weightKg:         unit === 'imperial' ? toKg(rawW, 'imperial') : rawW,
    activityLevel:    val('in-activity') || 'moderate',

    bodyFat:          num('in-body-fat')   || null,
    bloodPressure:    val('in-bp')         || '',
    restingHR:        num('in-hr')         || null,
    bloodSugar:       val('in-sugar')      || '',

    sleepHours:       parseFloat(val('in-sleep'))  || 7,
    waterIntake:      parseFloat(val('in-water'))  || 2,
    stressLevel:      el('in-stress')?.dataset.active ?? 'moderate',
    smoking:          checked('in-smoking'),
    alcohol:          checked('in-alcohol'),
    meditation:       checked('in-meditation'),
    balancedDiet:     checked('in-balanced-diet'),
    processedFood:    checked('in-processed'),
    dietType:         val('in-diet-type') || 'balanced',
    fruits:           checked('in-fruits'),
    vegetables:       checked('in-vegetables'),
    grains:           checked('in-grains'),
    protein:          checked('in-protein'),
    dairy:            checked('in-dairy'),
    cardio:           checked('in-cardio'),
    strength:         checked('in-strength'),
    flexibility:      checked('in-flexibility'),
    hiit:             checked('in-hiit'),
    sports:           checked('in-sports'),
    exerciseFreq:     val('in-exercise-freq') || 'sometimes',

    primaryGoal:      val('in-goal')        || 'maintain',
    targetWeightKg:   (() => {
      const tw = num('in-target-weight');
      const u  = unit;
      return tw ? (u === 'imperial' ? toKg(tw, 'imperial') : tw) : 0;
    })(),
    macroDistribution: val('in-macro-dist') || 'balanced',
    bmrFormula:        val('in-bmr-formula')|| 'mifflin',
    weightChangeRate:  parseFloat(val('in-weight-rate')) || 0.5,

    diabetes:         checked('in-diabetes'),
    hypertension:     checked('in-hypertension'),
    heartDisease:     checked('in-heart'),
    thyroid:          checked('in-thyroid'),
    mentalHealth:     checked('in-mental-health'),

    labs: readLabData(),
  };
}

export function readLabData() {
  const labNum = id => {
    const v = parseFloat(document.getElementById(id)?.value);
    return isNaN(v) ? null : v;
  };
  return {
    vitamin_d:     labNum('lab-vitamin-d'),
    b12:           labNum('lab-b12'),
    ferritin:      labNum('lab-ferritin'),
    folate:        labNum('lab-folate'),
    glucose:       labNum('lab-glucose'),
    hba1c:         labNum('lab-hba1c'),
    cholesterol:   labNum('lab-cholesterol'),
    ldl:           labNum('lab-ldl'),
    hdl:           labNum('lab-hdl'),
    triglycerides: labNum('lab-triglycerides'),
    tsh:           labNum('lab-tsh'),
    hemoglobin:    labNum('lab-hemoglobin'),
    uric_acid:     labNum('lab-uric-acid'),
  };
}

export function validateForm(data) {
  const errors = [];
  if (!data.age || data.age < 10 || data.age > 120)   errors.push('أدخل عمراً صحيحاً (10–120 سنة)');
  if (!data.heightCm || data.heightCm < 100)           errors.push('أدخل طولاً صحيحاً (أكبر من 100 سم)');
  if (!data.weightKg || data.weightKg < 20)            errors.push('أدخل وزناً صحيحاً (أكبر من 20 كجم)');
  return errors;
}

export function applyToForm(saved) {
  if (!saved?.form) return;
  const f = saved.form;

  const setVal = (id, v) => { if (el(id) && v !== undefined && v !== null) el(id).value = v; };
  const setCk  = (id, v) => { if (el(id)) el(id).checked = !!v; };

  setVal('in-age',           f.age);
  setVal('in-height',        f.unitSystem === 'imperial' ? f.heightCm / 2.54 / 12 : f.heightCm);
  setVal('in-weight',        f.unitSystem === 'imperial' ? f.weightKg * 2.20462 : f.weightKg);
  setVal('in-activity',      f.activityLevel);
  setVal('in-body-fat',      f.bodyFat);
  setVal('in-bp',            f.bloodPressure);
  setVal('in-hr',            f.restingHR);
  setVal('in-sugar',         f.bloodSugar);
  setVal('in-sleep',         f.sleepHours);
  setVal('in-water',         f.waterIntake);
  setVal('in-diet-type',     f.dietType);
  setVal('in-exercise-freq', f.exerciseFreq);
  setVal('in-goal',          f.primaryGoal);
  setVal('in-target-weight', f.targetWeightKg || '');
  setVal('in-macro-dist',    f.macroDistribution);
  setVal('in-bmr-formula',   f.bmrFormula);
  setVal('in-weight-rate',   f.weightChangeRate);

  setCk('in-smoking',       f.smoking);
  setCk('in-alcohol',       f.alcohol);
  setCk('in-meditation',    f.meditation);
  setCk('in-balanced-diet', f.balancedDiet);
  setCk('in-processed',     f.processedFood);
  setCk('in-fruits',        f.fruits);
  setCk('in-vegetables',    f.vegetables);
  setCk('in-grains',        f.grains);
  setCk('in-protein',       f.protein);
  setCk('in-dairy',         f.dairy);
  setCk('in-cardio',        f.cardio);
  setCk('in-strength',      f.strength);
  setCk('in-flexibility',   f.flexibility);
  setCk('in-hiit',          f.hiit);
  setCk('in-sports',        f.sports);
  setCk('in-diabetes',      f.diabetes);
  setCk('in-hypertension',  f.hypertension);
  setCk('in-heart',         f.heartDisease);
  setCk('in-thyroid',       f.thyroid);
  setCk('in-mental-health', f.mentalHealth);

  if (f.gender) activateToggle('in-gender', f.gender);
  if (f.stressLevel) activateToggle('in-stress', f.stressLevel);
  if (f.unitSystem) activateToggle('in-unit', f.unitSystem);

  el('disp-sleep')&&(el('disp-sleep').textContent = f.sleepHours);
  el('disp-water')&&(el('disp-water').textContent = f.waterIntake);

  if (f.labs) {
    const LAB_ID_MAP = {
      vitamin_d: 'lab-vitamin-d', b12: 'lab-b12', ferritin: 'lab-ferritin',
      folate: 'lab-folate', glucose: 'lab-glucose', hba1c: 'lab-hba1c',
      cholesterol: 'lab-cholesterol', ldl: 'lab-ldl', hdl: 'lab-hdl',
      triglycerides: 'lab-triglycerides', tsh: 'lab-tsh',
      hemoglobin: 'lab-hemoglobin', uric_acid: 'lab-uric-acid',
    };
    for (const [key, domId] of Object.entries(LAB_ID_MAP)) {
      if (f.labs[key] != null) setVal(domId, f.labs[key]);
    }
  }
}

export function activateToggle(containerId, value) {
  const container = el(containerId);
  if (!container) return;
  container.dataset.active = value;
  container.querySelectorAll('[data-value]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === value);
  });
}

export function setupRangeDisplays() {
  el('in-sleep')?.addEventListener('input', e => {
    if (el('disp-sleep')) el('disp-sleep').textContent = e.target.value;
  });
  el('in-water')?.addEventListener('input', e => {
    if (el('disp-water')) el('disp-water').textContent = e.target.value;
  });
}

export function setupGoalVisibility() {
  const goalSelect = el('in-goal');
  const targetWrap = el('target-weight-wrap');
  const rateWrap   = el('rate-wrap');
  if (!goalSelect) return;

  const update = () => {
    const g = goalSelect.value;
    const showTarget = ['weight_loss', 'weight_gain', 'muscle_gain'].includes(g);
    const showRate   = ['weight_loss', 'weight_gain', 'muscle_gain'].includes(g);
    targetWrap?.classList.toggle('hidden', !showTarget);
    rateWrap?.classList.toggle('hidden', !showRate);
  };
  goalSelect.addEventListener('change', update);
  update();
}

export function resetForm() {
  document.getElementById('health-form')?.reset();
  activateToggle('in-gender', 'male');
  activateToggle('in-stress', 'moderate');
  activateToggle('in-unit', 'metric');
  if (el('disp-sleep')) el('disp-sleep').textContent = '7';
  if (el('disp-water')) el('disp-water').textContent = '2';
}

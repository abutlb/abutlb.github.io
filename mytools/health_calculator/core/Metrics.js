const BMR_FORMULAS = {
  mifflin: (w, h, a, g) =>
    g === 'male' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161,
  harris: (w, h, a, g) =>
    g === 'male'
      ? 88.362 + 13.397*w + 4.799*h - 5.677*a
      : 447.593 + 9.247*w + 3.098*h - 4.330*a,
  katch: (w, _h, _a, _g, bf) => {
    const bfSafe = Math.max(5, Math.min(60, bf ?? 20));
    return 370 + 21.6 * w * (1 - bfSafe / 100);
  },
};

const ACTIVITY_MULTIPLIERS = {
  sedentary:   1.200,
  light:       1.375,
  moderate:    1.550,
  active:      1.725,
  very_active: 1.900,
};

export function calculateBMI(weightKg, heightCm) {
  const hm = heightCm / 100;
  return weightKg / (hm * hm);
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { key: 'underweight', label: 'نقص وزن',         cls: 'text-blue-500',   color: '#3b82f6' };
  if (bmi < 25)   return { key: 'normal',       label: 'وزن طبيعي',       cls: 'text-green-500',  color: '#22c55e' };
  if (bmi < 30)   return { key: 'overweight',   label: 'زيادة وزن',       cls: 'text-yellow-500', color: '#eab308' };
  if (bmi < 35)   return { key: 'obese1',       label: 'سمنة درجة أولى',  cls: 'text-orange-500', color: '#f97316' };
  if (bmi < 40)   return { key: 'obese2',       label: 'سمنة درجة ثانية', cls: 'text-red-500',    color: '#ef4444' };
  return           { key: 'obese3',             label: 'سمنة مرضية',      cls: 'text-red-700',    color: '#991b1b' };
}

export function getBMINeedlePercent(bmi) {
  const MIN = 10, MAX = 45;
  return Math.min(100, Math.max(0, ((bmi - MIN) / (MAX - MIN)) * 100));
}

export function calculateBMR(weightKg, heightCm, age, gender, formula = 'mifflin', bodyFatPct = null) {
  const fn = BMR_FORMULAS[formula] ?? BMR_FORMULAS.mifflin;
  return fn(weightKg, heightCm, age, gender, bodyFatPct);
}

export function calculateTDEE(bmr, activityLevel) {
  return bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55);
}

export function calculateIdealWeight(heightCm, gender) {
  const inches = heightCm / 2.54;
  const ex     = inches - 60;
  const hamwi    = gender === 'male' ? 48   + 2.70 * ex : 45.5 + 2.20 * ex;
  const devine   = gender === 'male' ? 50   + 2.30 * ex : 45.5 + 2.30 * ex;
  const robinson = gender === 'male' ? 52   + 1.90 * ex : 49   + 1.70 * ex;
  const miller   = gender === 'male' ? 56.2 + 1.41 * ex : 53.1 + 1.36 * ex;
  return +((hamwi + devine + robinson + miller) / 4 * 0.453592).toFixed(1);
}

export function getHealthyWeightRange(heightCm) {
  const hm = heightCm / 100;
  return {
    min: +(18.5 * hm * hm).toFixed(1),
    max: +(24.9 * hm * hm).toFixed(1),
  };
}

export function calculateMacros(calories, distribution = 'balanced') {
  const RATIOS = {
    balanced:      { p: 0.30, c: 0.40, f: 0.30 },
    low_carb:      { p: 0.35, c: 0.25, f: 0.40 },
    high_protein:  { p: 0.40, c: 0.30, f: 0.30 },
    keto:          { p: 0.25, c: 0.05, f: 0.70 },
    mediterranean: { p: 0.25, c: 0.45, f: 0.30 },
  };
  const r = RATIOS[distribution] ?? RATIOS.balanced;
  return {
    protein: { pct: Math.round(r.p * 100), g: Math.round(calories * r.p / 4) },
    carbs:   { pct: Math.round(r.c * 100), g: Math.round(calories * r.c / 4) },
    fat:     { pct: Math.round(r.f * 100), g: Math.round(calories * r.f / 9) },
  };
}

export function calculateWaterNeeds(weightKg, activityLevel) {
  const bonus = ['active', 'very_active'].includes(activityLevel) ? 0.5 : 0;
  return +(weightKg * 0.033 + bonus).toFixed(1);
}

export function calculateTargetCalories(tdee, primaryGoal, weightChangeRate = 0.5) {
  const daily = Math.round(weightChangeRate * 7700 / 7);
  if (primaryGoal === 'weight_loss') return Math.max(1200, Math.round(tdee - daily));
  if (primaryGoal === 'weight_gain' || primaryGoal === 'muscle_gain') return Math.round(tdee + daily);
  return Math.round(tdee);
}

export function toKg(value, unit) {
  return unit === 'imperial' ? value / 2.20462 : value;
}

export function toCm(value, unit) {
  if (unit !== 'imperial') return value;
  const feet   = Math.floor(value);
  const inches = Math.round((value - feet) * 100);
  return feet * 30.48 + inches * 2.54;
}

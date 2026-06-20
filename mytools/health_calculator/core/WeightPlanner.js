const KCAL_PER_KG = 7700;

export function buildWeightPlan(formData, metrics, weightChangeRate = 0.5) {
  const { primaryGoal, targetWeightKg, weightKg } = formData;
  const { tdee, idealWeight } = metrics;

  if (!['weight_loss', 'weight_gain', 'muscle_gain'].includes(primaryGoal)) {
    return {
      type: 'maintain',
      dailyCalories: Math.round(tdee),
      macros: metrics.macros,
      message: 'هدفك الحفاظ على وزنك الحالي.',
    };
  }

  const target    = targetWeightKg > 0 ? targetWeightKg : idealWeight;
  const diff      = +(target - weightKg).toFixed(1);
  const isLoss    = diff < 0;
  const absDiff   = Math.abs(diff);
  const rate      = weightChangeRate;
  const weeks     = Math.max(1, Math.ceil(absDiff / rate));
  const dailyAdj  = Math.round(rate * KCAL_PER_KG / 7);
  const dailyCal  = isLoss
    ? Math.max(1200, Math.round(tdee - dailyAdj))
    : Math.round(tdee + dailyAdj);

  const projections = [];
  const step = Math.max(1, Math.ceil(weeks / 12));
  for (let w = 0; w <= weeks; w += step) {
    let proj = weightKg + (isLoss ? -1 : 1) * rate * w;
    proj = isLoss ? Math.max(proj, target) : Math.min(proj, target);
    projections.push({ week: w, weight: +proj.toFixed(1) });
  }
  if (projections[projections.length - 1].week !== weeks) {
    projections.push({ week: weeks, weight: +target.toFixed(1) });
  }

  return {
    type:         isLoss ? 'loss' : 'gain',
    currentWeight: weightKg,
    targetWeight:  target,
    diff,
    weeklyRate:    rate,
    weeksNeeded:   weeks,
    monthsNeeded:  Math.ceil(weeks / 4.33),
    dailyCalories: dailyCal,
    projections,
    message: isLoss
      ? `لفقدان ${absDiff} كجم ستحتاج ~${weeks} أسبوع (${Math.ceil(weeks/4.33)} شهر)`
      : `لزيادة ${absDiff} كجم ستحتاج ~${weeks} أسبوع (${Math.ceil(weeks/4.33)} شهر)`,
  };
}

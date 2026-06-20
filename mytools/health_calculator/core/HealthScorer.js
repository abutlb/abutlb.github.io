function clamp(v) { return Math.min(100, Math.max(0, Math.round(v))); }

export function scoreCardiovascular(data, metrics) {
  let s = 70;
  const { bmi } = metrics;
  if (bmi < 18.5)      s -= 10;
  else if (bmi < 25)   s += 10;
  else if (bmi < 30)   s -= 10;
  else if (bmi < 35)   s -= 20;
  else                  s -= 30;

  const actAdj = { sedentary: -15, light: -5, moderate: 5, active: 10, very_active: 15 };
  s += actAdj[data.activityLevel] ?? 0;

  if (data.smoking)    s -= 20;
  if (data.alcohol)    s -= 5;

  if (data.restingHR) {
    if (data.restingHR < 60)       s += 10;
    else if (data.restingHR < 70)  s += 5;
    else if (data.restingHR >= 90) s -= 10;
    else if (data.restingHR >= 80) s -= 5;
  }
  if (data.bloodPressure === 'normal')  s += 5;
  else if (['high', 'low'].includes(data.bloodPressure)) s -= 10;
  if (data.hypertension)  s -= 10;
  if (data.heartDisease)  s -= 15;

  return clamp(s);
}

export function scoreFitness(data) {
  let s = 60;
  const actAdj  = { sedentary: -20, light: -10, moderate: 10, active: 20, very_active: 30 };
  const freqAdj = { never: -20, rarely: -10, sometimes: 0, often: 10, daily: 20 };
  s += actAdj[data.activityLevel]   ?? 0;
  s += freqAdj[data.exerciseFreq]   ?? 0;
  if (data.cardio)      s += 5;
  if (data.strength)    s += 5;
  if (data.flexibility) s += 5;
  if (data.hiit)        s += 5;
  if (data.sports)      s += 5;
  return clamp(s);
}

export function scoreNutrition(data) {
  let s = 55;
  const dietAdj = { balanced: 10, mediterranean: 15, vegetarian: 8, vegan: 8, keto: 2, paleo: 2 };
  s += dietAdj[data.dietType] ?? 0;
  if (data.fruits)        s += 8;
  if (data.vegetables)    s += 10;
  if (data.grains)        s += 5;
  if (data.protein)       s += 5;
  if (data.dairy)         s += 3;
  if (data.processedFood) s -= 15;
  if (data.balancedDiet)  s += 8;
  if (data.waterIntake >= 2.5) s += 5;
  return clamp(s);
}

export function scoreMental(data) {
  let s = 70;
  const stressAdj = { low: 10, moderate: -10, high: -20 };
  s += stressAdj[data.stressLevel] ?? 0;
  if (data.sleepHours >= 7 && data.sleepHours <= 9) s += 10;
  else if (data.sleepHours < 6) s -= 15;
  else if (data.sleepHours < 7) s -= 5;
  if (data.meditation) s += 10;
  if (data.smoking)    s -= 5;
  if (data.mentalHealth) s -= 10;
  return clamp(s);
}

export function scoreSleep(data) {
  let s = 65;
  if (data.sleepHours < 5)       s -= 30;
  else if (data.sleepHours < 6)  s -= 20;
  else if (data.sleepHours < 7)  s -= 10;
  else if (data.sleepHours <= 8) s += 20;
  else if (data.sleepHours <= 9) s += 10;
  const stressAdj = { low: 5, moderate: -5, high: -15 };
  s += stressAdj[data.stressLevel] ?? 0;
  return clamp(s);
}

export function scoreHydration(data) {
  let s = 50;
  if (data.waterIntake < 1)      s -= 20;
  else if (data.waterIntake < 2) s += 0;
  else if (data.waterIntake < 3) s += 20;
  else if (data.waterIntake < 4) s += 30;
  else                            s += 40;
  return clamp(s);
}

export function scoreAll(data, metrics) {
  const cardiovascular = scoreCardiovascular(data, metrics);
  const fitness        = scoreFitness(data);
  const nutrition      = scoreNutrition(data);
  const mental         = scoreMental(data);
  const sleep          = scoreSleep(data);
  const hydration      = scoreHydration(data);
  const vals    = [cardiovascular, fitness, nutrition, mental, sleep, hydration];
  const overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return { cardiovascular, fitness, nutrition, mental, sleep, hydration, overall };
}

export function getScoreLabel(score) {
  if (score >= 85) return { text: 'ممتاز',        cls: 'text-emerald-500', bg: 'bg-emerald-500' };
  if (score >= 70) return { text: 'جيد جداً',     cls: 'text-sky-500',    bg: 'bg-sky-500'     };
  if (score >= 55) return { text: 'جيد',          cls: 'text-teal-500',   bg: 'bg-teal-500'    };
  if (score >= 40) return { text: 'متوسط',        cls: 'text-amber-500',  bg: 'bg-amber-500'   };
  return             { text: 'يحتاج تحسين',      cls: 'text-red-500',    bg: 'bg-red-500'     };
}

export function getAssessmentText(dimension, score) {
  const TEXTS = {
    cardiovascular: [
      'صحة القلب ممتازة، استمر في النشاط المنتظم.',
      'صحة القلب جيدة، حافظ على نشاطك البدني.',
      'صحة القلب مقبولة، زد نشاطك تدريجياً.',
      'يُنصح بزيادة النشاط وتحسين نمط الحياة.',
      'راجع طبيبك وابدأ ببرنامج صحي شامل.',
    ],
    fitness: [
      'لياقتك ممتازة، نوّع تمارينك للحفاظ عليها.',
      'لياقتك جيدة، يمكن تحسينها بتنويع التمارين.',
      'لياقتك مقبولة، زد وتيرة التمارين.',
      'ابدأ ببرنامج تمارين منتظم تدريجياً.',
      'استشر مدرباً مؤهلاً لبدء برنامج مناسب.',
    ],
    nutrition: [
      'نظامك الغذائي ممتاز ومتنوع.',
      'نظامك الغذائي جيد، زد تنوع الأطعمة الصحية.',
      'نظامك مقبول، قلل الأطعمة المصنعة.',
      'هناك حاجة لتحسين جودة غذائك.',
      'استشر أخصائي تغذية لوضع خطة غذائية.',
    ],
    mental: [
      'صحتك النفسية ممتازة، استمر في الاسترخاء.',
      'صحتك النفسية جيدة، حافظ على التوازن.',
      'صحتك مقبولة، مارس تقنيات إدارة التوتر.',
      'قد تعاني من ضغط نفسي، خصص وقتاً للاسترخاء.',
      'فكّر في طلب دعم متخصص للصحة النفسية.',
    ],
    sleep: [
      'أنماط نومك صحية جداً، أحسنت.',
      'نومك جيد، حافظ على مواعيد ثابتة.',
      'نومك مقبول، حسّن بيئة نومك.',
      'قد تعاني من مشاكل في النوم، طبّق عادات صحية.',
      'راجع طبيبك إن كانت مشاكل النوم مزمنة.',
    ],
    hydration: [
      'مستوى ترطيبك مثالي.',
      'ترطيبك جيد، استمر في شرب الماء بانتظام.',
      'ترطيبك مقبول، حاول زيادة شرب الماء.',
      'قد تعاني من نقص ترطيب، احمل زجاجة ماء.',
      'أنت بحاجة لزيادة كبيرة في شرب الماء.',
    ],
  };
  const idx = score >= 85 ? 0 : score >= 70 ? 1 : score >= 55 ? 2 : score >= 40 ? 3 : 4;
  return TEXTS[dimension]?.[idx] ?? '';
}

export const DIMENSION_META = {
  cardiovascular: { ar: 'صحة القلب',      icon: '❤️' },
  fitness:        { ar: 'اللياقة البدنية', icon: '💪' },
  nutrition:      { ar: 'التغذية',         icon: '🥗' },
  mental:         { ar: 'الصحة النفسية',   icon: '🧠' },
  sleep:          { ar: 'النوم',           icon: '😴' },
  hydration:      { ar: 'الترطيب',        icon: '💧' },
};

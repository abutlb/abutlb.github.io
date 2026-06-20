export function generateRecommendations(data, metrics, scores) {
  const recs = {
    nutrition:  [],
    exercise:   [],
    lifestyle:  [],
    weight:     [],
    medical:    [],
  };

  // ── Nutrition ──────────────────────────────────────────────
  if (!data.fruits || !data.vegetables) {
    recs.nutrition.push('أضف 5 حصص من الفواكه والخضروات يومياً للحصول على الفيتامينات والألياف.');
  }
  if (data.processedFood) {
    recs.nutrition.push('قلّل الأطعمة المصنعة واستبدلها بأطعمة كاملة وطازجة.');
  }
  if (data.waterIntake < 2.5) {
    recs.nutrition.push(`زد شرب الماء إلى ${metrics.waterNeeds} لتر يومياً على الأقل.`);
  }
  if (data.primaryGoal === 'muscle_gain') {
    recs.nutrition.push(`استهدف ${metrics.macros.protein.g}ج من البروتين يومياً (1.6–2.2ج لكل كجم).`);
  }
  if (scores.nutrition < 55) {
    recs.nutrition.push('تناول البروتين في كل وجبة للحفاظ على كتلة العضلات وتعزيز الشبع.');
  }
  if (data.dietType === 'keto' && !data.vegetables) {
    recs.nutrition.push('حتى مع الكيتو، احرص على الخضروات قليلة الكارب كالسبانخ والكوسا.');
  }

  // ── Exercise ────────────────────────────────────────────────
  if (data.activityLevel === 'sedentary' || data.exerciseFreq === 'never') {
    recs.exercise.push('ابدأ بالمشي 20–30 دقيقة يومياً وزد تدريجياً إلى 150 دقيقة أسبوعياً.');
  } else if (scores.fitness < 60) {
    recs.exercise.push('حاول الوصول إلى 150 دقيقة من النشاط المتوسط أسبوعياً.');
  }
  if (!data.strength) {
    recs.exercise.push('أضف تمارين قوة مرتين أسبوعياً لتقوية العضلات والعظام.');
  }
  if (!data.cardio) {
    recs.exercise.push('أضف تمارين هوائية: مشي سريع، سباحة، أو ركوب دراجة.');
  }
  if (!data.flexibility && data.age > 40) {
    recs.exercise.push('أضف تمديدات ويوغا لتحسين المرونة وتقليل آلام المفاصل.');
  }

  // ── Lifestyle ───────────────────────────────────────────────
  if (data.sleepHours < 7) {
    recs.lifestyle.push('احرص على 7–9 ساعات نوم ليلياً لتحسين الأيض وصحة القلب.');
  }
  if (data.stressLevel === 'high') {
    recs.lifestyle.push('مارس التأمل أو التنفس العميق 10 دقائق يومياً لخفض التوتر.');
  }
  if (data.smoking) {
    recs.lifestyle.push('الإقلاع عن التدخين أهم قرار لصحتك — استشر طبيبك للدعم والعلاج.');
  }
  if (data.alcohol) {
    recs.lifestyle.push('قلّل الكحول أو تجنبه لتحسين صحة الكبد وجودة النوم.');
  }
  if (!data.meditation && data.stressLevel !== 'low') {
    recs.lifestyle.push('جرّب 5 دقائق يومياً من التأمل أو اليقظة الذهنية.');
  }

  // ── Weight ──────────────────────────────────────────────────
  const { bmi, healthyRange } = metrics;
  if (bmi < 18.5) {
    recs.weight.push(`وزنك الحالي منخفض. استهدف الوصول للنطاق الصحي (${healthyRange.min}–${healthyRange.max} كجم).`);
    recs.weight.push('زد السعرات 300–500 يومياً من أطعمة مغذية وغنية بالبروتين.');
  } else if (bmi >= 25 && bmi < 30) {
    recs.weight.push(`خفّض الوزن تدريجياً للنطاق الصحي (${healthyRange.min}–${healthyRange.max} كجم).`);
    recs.weight.push('خفض 500 سعرة يومياً مع زيادة النشاط يعطيك 0.5 كجم/أسبوع بأمان.');
  } else if (bmi >= 30) {
    recs.weight.push('السمنة تزيد خطر الأمراض المزمنة. ابدأ بتغييرات صغيرة ومستدامة.');
    recs.weight.push('استشر أخصائي تغذية لوضع خطة متكاملة لفقدان الوزن.');
  }

  // ── Medical ─────────────────────────────────────────────────
  if (data.diabetes) {
    recs.medical.push('راقب سكر الدم بانتظام وتشاور مع طبيبك قبل أي تغيير في النظام الغذائي.');
  }
  if (data.hypertension) {
    recs.medical.push('قلّل الصوديوم إلى أقل من 2300 ملغ/يوم وقِس الضغط بانتظام.');
  }
  if (data.heartDisease) {
    recs.medical.push('استشر طبيبك قبل البدء بأي برنامج رياضي جديد.');
  }
  if (data.thyroid) {
    recs.medical.push('مشاكل الغدة الدرقية تؤثر على الأيض — تأكد من انتظام علاجك.');
  }

  return recs;
}

export const GOAL_LABELS = {
  maintain:        'الحفاظ على الوزن',
  weight_loss:     'إنقاص الوزن',
  weight_gain:     'زيادة الوزن',
  muscle_gain:     'بناء العضلات',
  improve_fitness: 'تحسين اللياقة',
};

export const REC_SECTION_META = {
  nutrition:  { icon: '🥗', label: 'التغذية' },
  exercise:   { icon: '🏋️', label: 'الرياضة والنشاط' },
  lifestyle:  { icon: '🌙', label: 'نمط الحياة' },
  weight:     { icon: '⚖️', label: 'الوزن' },
  medical:    { icon: '🏥', label: 'ملاحظات طبية' },
};

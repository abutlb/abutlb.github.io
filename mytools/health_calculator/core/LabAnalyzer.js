// Status levels (ordered worst→best→worst for display)
const S = {
  CRITICAL_LOW:   { key: 'critical_low',   ar: 'نقص حاد',        cls: 'text-red-600',    bg: 'bg-red-100 dark:bg-red-900/30',    dot: '🔴' },
  LOW:            { key: 'low',            ar: 'منخفض',           cls: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', dot: '🟠' },
  BORDERLINE_LOW: { key: 'borderline_low', ar: 'على الحد الأدنى', cls: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', dot: '🟡' },
  NORMAL:         { key: 'normal',         ar: 'طبيعي',           cls: 'text-emerald-600',bg: 'bg-emerald-100 dark:bg-emerald-900/30', dot: '🟢' },
  BORDERLINE_HIGH:{ key: 'borderline_high',ar: 'على الحد الأعلى', cls: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', dot: '🟡' },
  HIGH:           { key: 'high',           ar: 'مرتفع',           cls: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', dot: '🟠' },
  CRITICAL_HIGH:  { key: 'critical_high',  ar: 'مرتفع بشكل حاد', cls: 'text-red-600',    bg: 'bg-red-100 dark:bg-red-900/30',    dot: '🔴' },
};

function classify(val, steps) {
  for (const [status, max] of steps) {
    if (val <= max) return status;
  }
  return steps[steps.length - 1][0];
}

// ── Marker definitions ─────────────────────────────────
const MARKERS = {

  vitamin_d: {
    nameAr: 'فيتامين د (25-OH)',
    icon: '☀️',
    unit: 'ng/mL',
    group: 'vitamins',
    getStatus(v) {
      if (v < 10)  return S.CRITICAL_LOW;
      if (v < 20)  return S.LOW;
      if (v < 30)  return S.BORDERLINE_LOW;
      if (v <= 100) return S.NORMAL;
      return S.CRITICAL_HIGH;
    },
    recs: {
      critical_low:   ['تعرّض للشمس 20-30 دقيقة يومياً قبل الساعة 10 صباحاً', 'كل سمك السلمون والتونة والسردين أسبوعياً', 'صفار البيض والكبدة مصادر جيدة', '⚕️ ضروري: تحدث مع طبيبك لجرعة D3 علاجية (قد تصل 50,000 وحدة أسبوعياً)'],
      low:            ['15-20 دقيقة تعرض للشمس يومياً', 'أكثر من الأسماك الدهنية في نظامك', '⚕️ استشر طبيبك عن مكمل D3 (2000-4000 وحدة يومياً)'],
      borderline_low: ['تعرّض منتظم للشمس، خاصة في الصباح', 'راقب المستوى كل 6 أشهر', 'يمكن تناول مكمل D3 بجرعة 1000 وحدة يومياً'],
      high:           ['تجنّب مكملات الفيتامين د مؤقتاً', '⚕️ راجع طبيبك لتقييم الجرعة'],
      critical_high:  ['⚕️ أوقف أي مكملات فيتامين د فوراً وراجع طبيبك'],
    },
  },

  b12: {
    nameAr: 'فيتامين ب12',
    icon: '🧬',
    unit: 'pg/mL',
    group: 'vitamins',
    getStatus(v) {
      if (v < 200) return S.LOW;
      if (v < 300) return S.BORDERLINE_LOW;
      if (v <= 900) return S.NORMAL;
      return S.HIGH;
    },
    recs: {
      low:            ['كل الكبدة مرة في الأسبوع (أغنى مصدر لب12)', 'اللحوم الحمراء والدجاج والأسماك يومياً', 'البيض ومنتجات الألبان مصادر ممتازة', '⚕️ استشر طبيبك عن حقن أو مكمل ب12'],
      borderline_low: ['احرص على بروتين حيواني في كل وجبة', 'إذا كنت نباتياً استشر طبيبك عن المكمل'],
      high:           ['مستوى مرتفع غير مقلق عادةً، لكن أخبر طبيبك إذا كنت لا تتناول مكملات'],
    },
  },

  ferritin: {
    nameAr: 'فيريتين (مخزون الحديد)',
    icon: '🩸',
    unit: 'ng/mL',
    group: 'minerals',
    getStatus(v, gender) {
      const low  = 12;
      const bLow = gender === 'female' ? 25 : 30;
      const high = gender === 'female' ? 150 : 300;
      if (v < low)   return S.CRITICAL_LOW;
      if (v < bLow)  return S.BORDERLINE_LOW;
      if (v <= high) return S.NORMAL;
      return S.HIGH;
    },
    recs: {
      critical_low:   ['⚕️ نقص الحديد يحتاج علاجاً طبياً — راجع طبيبك', 'كل الكبدة والكلى واللحوم الحمراء يومياً', 'اشرب عصير البرتقال مع وجبات الحديد (فيتامين C يعزز الامتصاص)', 'تجنب الشاي والقهوة مع وجبات الحديد بساعتين'],
      borderline_low: ['زد من اللحوم الحمراء والدواجن في نظامك', 'المكسرات والبقوليات والخضار الورقية الداكنة', 'اشرب عصير البرتقال مع وجبات تحتوي حديد'],
      high:           ['⚕️ فيريتين مرتفع قد يدل على التهاب أو اضطراب — راجع طبيبك'],
    },
  },

  folate: {
    nameAr: 'حمض الفوليك (ب9)',
    icon: '🥬',
    unit: 'ng/mL',
    group: 'vitamins',
    getStatus(v) {
      if (v < 3)  return S.LOW;
      if (v < 5)  return S.BORDERLINE_LOW;
      if (v <= 20) return S.NORMAL;
      return S.HIGH;
    },
    recs: {
      low:            ['كل الخضار الورقية الداكنة يومياً (سبانخ، بقدونس، جرجير)', 'البقوليات والعدس والفول مصادر ممتازة', 'الكبدة والبيض، الأفوكادو والبروكلي', '⚕️ للنساء في سن الإنجاب: مكمل حمض الفوليك ضروري'],
      borderline_low: ['سلطة خضراء كبيرة يومياً', 'أضف البقوليات لوجبة واحدة على الأقل يومياً'],
    },
  },

  glucose: {
    nameAr: 'سكر الصيام',
    icon: '🍬',
    unit: 'mg/dL',
    group: 'sugar',
    getStatus(v) {
      if (v < 70)  return S.LOW;
      if (v <= 99) return S.NORMAL;
      if (v <= 125) return S.BORDERLINE_HIGH;
      return S.CRITICAL_HIGH;
    },
    recs: {
      low:            ['لا تتأخر في وجباتك — كل كل 3-4 ساعات', 'ابق سكراً سريعاً (عصير أو مربى) معك دائماً', '⚕️ إذا كررت الانخفاض راجع طبيبك'],
      borderline_high:['قلّل السكريات البسيطة والمشروبات المحلاة', 'اتبع نظام صيام متقطع أو قلّل الكربوهيدرات', 'تمرين المشي بعد الأكل يخفض السكر بشكل ملحوظ', '⚕️ راجع طبيبك لمتابعة دورية'],
      critical_high:  ['⚕️ مستوى يدل على سكري — يجب مراجعة الطبيب فوراً', 'تجنّب السكريات والنشويات البيضاء', 'مشي 30 دقيقة يومياً مهم جداً'],
    },
  },

  hba1c: {
    nameAr: 'HbA1c (سكر 3 أشهر)',
    icon: '📊',
    unit: '%',
    group: 'sugar',
    getStatus(v) {
      if (v < 5.7)  return S.NORMAL;
      if (v < 6.5)  return S.BORDERLINE_HIGH;
      return S.CRITICAL_HIGH;
    },
    recs: {
      borderline_high:['هذا تحذير مبكر — يمكن عكسه بتغيير النمط الآن', 'قلّل الكربوهيدرات المكررة (خبز أبيض، أرز، معجنات)', 'تمرين منتظم 150 دقيقة أسبوعياً', 'خسارة 5-10% من وزنك تحدث فرقاً كبيراً', '⚕️ راجع طبيبك كل 6 أشهر'],
      critical_high:  ['⚕️ يحتاج متابعة طبية — راجع طبيبك لوضع خطة علاجية', 'نظام غذائي منخفض الكربوهيدرات تحت إشراف أخصائي'],
    },
  },

  cholesterol: {
    nameAr: 'الكوليسترول الكلي',
    icon: '🫀',
    unit: 'mg/dL',
    group: 'lipids',
    getStatus(v) {
      if (v < 200) return S.NORMAL;
      if (v < 240) return S.BORDERLINE_HIGH;
      return S.HIGH;
    },
    recs: {
      borderline_high:['قلّل الدهون المشبعة (زبدة، شحوم، لحم دهني)', 'أكثر من الشوفان والبقوليات (تخفض الكوليسترول)، الأفوكادو وزيت الزيتون', 'تمرين هوائي 3-4 مرات أسبوعياً'],
      high:           ['⚕️ مستوى مرتفع — يحتاج متابعة طبية', 'امتنع تماماً عن الدهون المتحولة (وجبات سريعة، بسكويت مصنع)', 'أوميجا-3 من السمك يساعد على خفض الكوليسترول'],
    },
  },

  ldl: {
    nameAr: 'LDL (الكوليسترول الضار)',
    icon: '⚠️',
    unit: 'mg/dL',
    group: 'lipids',
    getStatus(v) {
      if (v < 100) return S.NORMAL;
      if (v < 130) return S.BORDERLINE_LOW;
      if (v < 160) return S.BORDERLINE_HIGH;
      if (v < 190) return S.HIGH;
      return S.CRITICAL_HIGH;
    },
    recs: {
      borderline_low: ['الوضع جيد ولكن انتبه لنظامك الغذائي'],
      borderline_high:['قلّل من اللحوم الدهنية ومنتجات الألبان كاملة الدسم', 'أضف الألياف: شوفان، تفاح، شعير', 'تمرين منتظم يرفع HDL ويخفض LDL'],
      high:           ['⚕️ راجع طبيبك — قد يحتاج تدخلاً دوائياً', 'تجنّب الدهون المشبعة والمتحولة بالكامل'],
      critical_high:  ['⚕️ مستوى خطر على القلب — راجع طبيبك فوراً'],
    },
  },

  hdl: {
    nameAr: 'HDL (الكوليسترول الجيد)',
    icon: '💚',
    unit: 'mg/dL',
    group: 'lipids',
    getStatus(v, gender) {
      const lowThresh = gender === 'female' ? 50 : 40;
      const bLow      = gender === 'female' ? 60 : 50;
      if (v < lowThresh) return S.CRITICAL_LOW;
      if (v < bLow)      return S.BORDERLINE_LOW;
      if (v < 60)        return S.NORMAL;
      return S.NORMAL; // >= 60 is optimal, still normal
    },
    recs: {
      critical_low:   ['⚕️ HDL منخفض يزيد خطر أمراض القلب — راجع طبيبك', 'التمرين الهوائي المنتظم هو أفضل طريقة لرفع HDL', 'أوميجا-3 وزيت الزيتون يرفعان HDL', 'الإقلاع عن التدخين يرفع HDL بشكل ملحوظ'],
      borderline_low: ['زد من التمرين الهوائي (مشي، سباحة)', 'الأفوكادو، المكسرات، زيت الزيتون تساعد', 'تجنّب الكربوهيدرات المكررة'],
    },
  },

  triglycerides: {
    nameAr: 'ثلاثيات الجلسيريد',
    icon: '🧪',
    unit: 'mg/dL',
    group: 'lipids',
    getStatus(v) {
      if (v < 150) return S.NORMAL;
      if (v < 200) return S.BORDERLINE_HIGH;
      if (v < 500) return S.HIGH;
      return S.CRITICAL_HIGH;
    },
    recs: {
      borderline_high:['قلّل السكر والمشروبات المحلاة بشكل كبير', 'السكريات البسيطة (حلويات، عصائر) هي السبب الأول', 'تمرين منتظم يخفض الثلاثيات بسرعة'],
      high:           ['⚕️ مستوى مرتفع — راجع طبيبك', 'أوقف السكريات والكحول تماماً', 'أوميجا-3 يخفض الثلاثيات بشكل مثبت علمياً'],
      critical_high:  ['⚕️ مستوى خطير — يحتاج علاجاً فورياً، راجع طبيبك'],
    },
  },

  tsh: {
    nameAr: 'TSH (الغدة الدرقية)',
    icon: '🦋',
    unit: 'mIU/L',
    group: 'hormones',
    getStatus(v) {
      if (v < 0.4)  return S.LOW;      // فرط نشاط
      if (v <= 4.0) return S.NORMAL;
      if (v <= 10)  return S.HIGH;     // قصور
      return S.CRITICAL_HIGH;
    },
    recs: {
      low:            ['⚕️ TSH منخفض يشير لفرط نشاط الغدة الدرقية — راجع طبيبك فوراً', 'قد تعاني من خفقان، عصبية، أو فقدان وزن غير مبرر'],
      high:           ['⚕️ TSH مرتفع يشير لخمول الغدة الدرقية — راجع طبيبك', 'قد تعاني من تعب، زيادة وزن، أو برودة مستمرة'],
      critical_high:  ['⚕️ قصور حاد في الدرقية — يحتاج علاجاً دوائياً فورياً'],
    },
  },

  hemoglobin: {
    nameAr: 'هيموجلوبين',
    icon: '🩺',
    unit: 'g/dL',
    group: 'blood',
    getStatus(v, gender) {
      const low  = gender === 'female' ? 12   : 13.5;
      const high = gender === 'female' ? 15.5 : 17.5;
      if (v < low)   return S.LOW;
      if (v <= high) return S.NORMAL;
      return S.HIGH;
    },
    recs: {
      low:            ['فقر الدم — كل الكبدة واللحوم الحمراء يومياً', 'السبانخ والبقوليات والبيض مصادر جيدة', 'فيتامين C مع وجبات الحديد لتحسين الامتصاص', '⚕️ إذا استمر راجع طبيبك لمعرفة السبب'],
      high:           ['⚕️ هيموجلوبين مرتفع يحتاج تقييماً طبياً', 'اشرب ماء كافياً', 'تجنّب التدخين الذي يرفع الهيموجلوبين'],
    },
  },

  uric_acid: {
    nameAr: 'حمض اليوريك',
    icon: '🦴',
    unit: 'mg/dL',
    group: 'blood',
    getStatus(v, gender) {
      const high = gender === 'female' ? 6.0 : 7.2;
      if (v <= high) return S.NORMAL;
      if (v <= high + 1) return S.BORDERLINE_HIGH;
      return S.HIGH;
    },
    recs: {
      borderline_high:['قلّل من اللحوم الحمراء والمأكولات البحرية', 'اشرب 2-3 لتر ماء يومياً للتخلص من حمض اليوريك', 'تجنّب المشروبات المحلاة بالفركتوز'],
      high:           ['⚕️ مستوى مرتفع يزيد خطر النقرس — راجع طبيبك', 'امتنع عن اللحوم المصنعة والسردين والكبدة', 'الكرز وعصير الليمون قد يساعدان على الخفض'],
    },
  },
};

// ── Public API ─────────────────────────────────────────

export function analyzeLabResults(labData, gender) {
  const results = [];

  for (const [key, marker] of Object.entries(MARKERS)) {
    const val = labData[key];
    if (val === null || val === undefined || val === '' || isNaN(val)) continue;

    const status   = marker.getStatus(parseFloat(val), gender);
    const recsList = marker.recs[status.key] ?? [];

    results.push({
      key,
      nameAr:   marker.nameAr,
      icon:     marker.icon,
      unit:     marker.unit,
      group:    marker.group,
      value:    parseFloat(val),
      status,
      recs:     recsList,
      isNormal: status.key === 'normal',
    });
  }

  return results;
}

export const LAB_GROUP_META = {
  vitamins:  { label: 'الفيتامينات والمعادن', icon: '💊' },
  minerals:  { label: 'المعادن',              icon: '⚗️' },
  sugar:     { label: 'السكر والأيض',         icon: '🍬' },
  lipids:    { label: 'دهون الدم',            icon: '🫀' },
  hormones:  { label: 'الهرمونات',            icon: '🦋' },
  blood:     { label: 'صورة الدم',            icon: '🩸' },
};

export function getLabSummary(labResults) {
  const abnormal = labResults.filter(r => !r.isNormal);
  const critical = labResults.filter(r =>
    r.status.key === 'critical_low' || r.status.key === 'critical_high');
  return { total: labResults.length, abnormal: abnormal.length, critical: critical.length };
}

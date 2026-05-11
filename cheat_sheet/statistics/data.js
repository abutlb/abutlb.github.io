/* ============================================================
   DATA.JS — statistics page
   جميع البيانات هنا فقط، لا يوجد أي منطق
============================================================ */

const TERMS = [
  {
    id:1, icon:"📊", title:"الإحصاء الوصفي", en:"Descriptive Statistics",
    category:"descriptive", level:"مبتدئ",
    short:"تلخيص البيانات وفهمها عبر مقاييس المركز والتشتت والشكل.",
    desc:"الإحصاء الوصفي يصف ما هو موجود في البيانات دون تعميم. يشمل مقاييس النزعة المركزية (mean, median, mode)، مقاييس التشتت (std, IQR)، وشكل التوزيع (skewness, kurtosis). الخطوة الأولى في أي تحليل.",
    formula:"لا صيغة واحدة — مجموعة مقاييس تصف البيانات معاً",
    code:`import pandas as pd
import numpy as np

data = pd.Series([23, 25, 28, 22, 30, 25, 27, 24, 26, 25])

print(f"المتوسط:            {data.mean():.2f}")
print(f"الوسيط:             {data.median():.2f}")
print(f"المنوال:            {data.mode()[0]}")
print(f"الانحراف المعياري:  {data.std():.2f}")
print(f"الربيع الأول Q1:    {data.quantile(.25):.2f}")
print(f"الربيع الثالث Q3:   {data.quantile(.75):.2f}")
print(f"الالتواء:           {data.skew():.2f}")`,
    example:"💡 تقرير مبيعات شهري: المتوسط 25,000 ريال، الوسيط 24,500 — البيانات متماثلة تقريباً."
  },
  {
    id:2, icon:"🔍", title:"الإحصاء الاستدلالي", en:"Inferential Statistics",
    category:"inferential", level:"متوسط",
    short:"استخدام عينة لاستنتاج خصائص المجتمع الكلي.",
    desc:"الإحصاء الاستدلالي يتجاوز وصف البيانات إلى التعميم. نأخذ عينة ونستنتج منها خصائص المجتمع الأكبر. يعتمد على نظرية الاحتمالات وفترات الثقة واختبارات الفرضيات.",
    formula:"خطأ المعاينة = σ / √n",
    code:`import numpy as np
from scipy import stats

# عينة من مجتمع
sample = np.random.normal(loc=50, scale=10, size=100)

# تقدير متوسط المجتمع بفترة ثقة 95%
confidence = 0.95
mean = sample.mean()
se   = stats.sem(sample)
ci   = stats.t.interval(confidence, df=len(sample)-1,
                         loc=mean, scale=se)

print(f"متوسط العينة: {mean:.2f}")
print(f"فترة الثقة 95%: ({ci[0]:.2f}, {ci[1]:.2f})")`,
    example:"💡 استطلاع 1000 شخص يُعطي نتائج قابلة للتعميم على ملايين — بشرط العينة العشوائية."
  },
  {
    id:3, icon:"🎯", title:"فترة الثقة", en:"Confidence Interval",
    category:"inferential", level:"متوسط",
    short:"نطاق من القيم يحتوي المعامل الحقيقي للمجتمع بنسبة ثقة محددة.",
    desc:"فترة الثقة 95% تعني: لو كررنا التجربة 100 مرة، ستحتوي 95 فترة على القيمة الحقيقية. كلما زادت حجم العينة ضاقت الفترة وزادت الدقة. لا تعني أن الاحتمال 95% أن القيمة داخل الفترة!",
    formula:"CI = x̄ ± z × (σ/√n)",
    code:`import numpy as np
from scipy import stats

data = np.array([12, 15, 14, 13, 16, 14, 15, 13, 14, 15])

mean = data.mean()
n    = len(data)
se   = stats.sem(data)

# فترة ثقة 95%
ci_95 = stats.t.interval(0.95, df=n-1, loc=mean, scale=se)
# فترة ثقة 99%
ci_99 = stats.t.interval(0.99, df=n-1, loc=mean, scale=se)

print(f"المتوسط: {mean:.2f}")
print(f"CI 95%: ({ci_95[0]:.2f}, {ci_95[1]:.2f})")
print(f"CI 99%: ({ci_99[0]:.2f}, {ci_99[1]:.2f})")`,
    example:"💡 متوسط رضا العملاء 4.2 ± 0.3 — يعني القيمة الحقيقية بين 3.9 و4.5 بثقة 95%."
  },
  {
    id:4, icon:"🧪", title:"اختبار الفرضيات", en:"Hypothesis Testing",
    category:"hypothesis", level:"متوسط",
    short:"إجراء منهجي لاتخاذ قرار إحصائي بناءً على بيانات العينة.",
    desc:"نبدأ بفرضية العدم H₀ (لا يوجد أثر) والفرضية البديلة H₁. نحسب إحصاء الاختبار ونقارنه بالقيمة الحرجة أو نحسب P-value. إذا كان P-value أقل من مستوى الدلالة α نرفض H₀.",
    formula:"إحصاء الاختبار = (قيمة العينة - قيمة H₀) / الخطأ المعياري",
    code:`from scipy import stats
import numpy as np

# هل متوسط الرواتب يختلف عن 5000؟
salaries = np.array([5200, 4800, 5100, 5300, 4900,
                     5400, 5000, 5150, 4950, 5250])

t_stat, p_value = stats.ttest_1samp(salaries, popmean=5000)

print(f"إحصاء t:  {t_stat:.3f}")
print(f"P-value:  {p_value:.4f}")

alpha = 0.05
if p_value < alpha:
    print("✅ نرفض H₀ — يوجد فرق دال إحصائياً")
else:
    print("❌ لا نرفض H₀ — لا يوجد فرق دال")`,
    example:"💡 هل الحملة الإعلانية الجديدة رفعت المبيعات فعلاً؟ اختبار الفرضيات يجيب بموضوعية."
  },
  {
    id:5, icon:"📉", title:"P-Value", en:"P-Value",
    category:"hypothesis", level:"متوسط",
    short:"احتمال الحصول على نتائج مثل عينتنا أو أشد — بافتراض صحة H₀.",
    desc:"P-value ليس احتمال صحة الفرضية! هو احتمال رؤية بياناتنا أو بيانات أكثر تطرفاً لو كانت H₀ صحيحة. P < 0.05 يعني النتيجة نادرة جداً لو لم يكن هناك أثر حقيقي.",
    formula:"P-value = P(البيانات | H₀ صحيحة)",
    code:`from scipy import stats
import numpy as np

# مقارنة مجموعتين: قبل وبعد التدريب
before = np.array([65, 70, 68, 72, 66, 69, 71, 67])
after  = np.array([72, 78, 75, 80, 70, 76, 79, 73])

# اختبار t للعينات المرتبطة
t_stat, p_value = stats.ttest_rel(before, after)

print(f"متوسط قبل: {before.mean():.1f}")
print(f"متوسط بعد: {after.mean():.1f}")
print(f"P-value:   {p_value:.6f}")

if p_value < 0.05:
    print("✅ التدريب أثّر إيجابياً — النتيجة دالة إحصائياً")`,
    example:"💡 P = 0.03 يعني: لو لم يكن للتدريب أثر، احتمال رؤية هذه النتيجة 3% فقط."
  },
  {
    id:6, icon:"⚠️", title:"خطأ النوع الأول والثاني", en:"Type I & Type II Error",
    category:"hypothesis", level:"متقدم",
    short:"رفض فرضية صحيحة (α) أو قبول فرضية خاطئة (β) — المقايضة الجوهرية.",
    desc:"خطأ النوع I (False Positive): نرفض H₀ وهي صحيحة — احتماله = α. خطأ النوع II (False Negative): لا نرفض H₀ وهي خاطئة — احتماله = β. تقليل أحدهما يزيد الآخر. القوة الإحصائية = 1 - β.",
    formula:"α = P(رفض H₀ | H₀ صحيحة)  |  β = P(قبول H₀ | H₀ خاطئة)",
    code:`from scipy import stats
import numpy as np

def calculate_power(effect_size, n, alpha=0.05):
    """حساب القوة الإحصائية"""
    critical_value = stats.norm.ppf(1 - alpha/2)
    se = 1 / np.sqrt(n)
    power = (1 - stats.norm.cdf(critical_value - effect_size/se) +
             stats.norm.cdf(-critical_value - effect_size/se))
    return power

for n in [10, 30, 50, 100]:
    power = calculate_power(effect_size=0.5, n=n)
    print(f"n={n:3d} → القوة = {power:.2%}")`,
    example:"💡 في الطب: خطأ I = تشخيص مريض سليم. خطأ II = إغفال مرض حقيقي — الثاني أخطر!"
  },
  {
    id:7, icon:"🔔", title:"التوزيع الطبيعي", en:"Normal Distribution",
    category:"distributions", level:"مبتدئ",
    short:"توزيع متماثل على شكل جرس — أساس معظم الأساليب الإحصائية.",
    desc:"التوزيع الطبيعي يتحدد بمعاملين فقط: المتوسط μ والانحراف المعياري σ. قاعدة 68-95-99.7: 68% من البيانات ضمن σ واحد، 95% ضمن 2σ، 99.7% ضمن 3σ. يُستخدم في اختبارات الفرضيات والفترات الثقة.",
    formula:"f(x) = (1/σ√2π) × e^(-(x-μ)²/2σ²)",
    code:`import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

mu, sigma = 50, 10
x = np.linspace(mu - 4*sigma, mu + 4*sigma, 300)
y = stats.norm.pdf(x, mu, sigma)

plt.figure(figsize=(9, 4))
plt.plot(x, y, 'b-', linewidth=2)

# تلوين المناطق
for z, color, label in [(1,'#4ade8055','68%'), (2,'#facc1533','95%')]:
    plt.fill_between(x, y,
                     where=(x >= mu-z*sigma) & (x <= mu+z*sigma),
                     color=color, label=f'±{z}σ = {label}')

plt.title('التوزيع الطبيعي — قاعدة 68-95-99.7')
plt.legend()
plt.show()`,
    example:"💡 درجات الاختبارات، الطول البشري، أخطاء القياس — كلها تتبع التوزيع الطبيعي."
  },
  {
    id:8, icon:"🎲", title:"التوزيع ذو الحدين", en:"Binomial Distribution",
    category:"distributions", level:"متوسط",
    short:"توزيع عدد النجاحات في n تجربة مستقلة — كل تجربة نتيجتها نجاح أو فشل.",
    desc:"يُستخدم عندما: التجارب مستقلة، كل تجربة لها نتيجتان فقط، احتمال النجاح p ثابت. مثال: عدد العملاء الذين يشترون من أصل 100 زائر.",
    formula:"P(X=k) = C(n,k) × pᵏ × (1-p)^(n-k)",
    code:`from scipy import stats
import numpy as np
import matplotlib.pyplot as plt

n, p = 20, 0.3  # 20 زيارة، احتمال شراء 30%

x = np.arange(0, n+1)
pmf = stats.binom.pmf(x, n, p)

print(f"المتوسط المتوقع: {n*p:.1f} عملية شراء")
print(f"P(X=6): {stats.binom.pmf(6, n, p):.4f}")
print(f"P(X≤6): {stats.binom.cdf(6, n, p):.4f}")

plt.bar(x, pmf, alpha=0.7)
plt.xlabel('عدد المشتريات')
plt.title(f'التوزيع ذو الحدين (n={n}, p={p})')
plt.show()`,
    example:"💡 من أصل 100 بريد إلكتروني، كم شخصاً سيضغط على الرابط؟ (معدل النقر 25%)"
  },
  {
    id:9, icon:"⚡", title:"توزيع بواسون", en:"Poisson Distribution",
    category:"distributions", level:"متوسط",
    short:"يصف عدد الأحداث في فترة زمنية أو مكان محدد — عندما تكون الأحداث نادرة ومستقلة.",
    desc:"يُستخدم لنمذجة: عدد الطلبات في ساعة، عدد الأعطال في يوم، عدد الزوار في دقيقة. المعامل الوحيد هو λ (معدل الحدوث). المتوسط والتباين كلاهما = λ.",
    formula:"P(X=k) = (λᵏ × e^(-λ)) / k!",
    code:`from scipy import stats
import numpy as np
import matplotlib.pyplot as plt

lambda_rate = 5  # متوسط 5 طلبات في الساعة

x = np.arange(0, 15)
pmf = stats.poisson.pmf(x, lambda_rate)

print(f"P(لا طلبات):     {stats.poisson.pmf(0, lambda_rate):.4f}")
print(f"P(5 طلبات):      {stats.poisson.pmf(5, lambda_rate):.4f}")
print(f"P(أكثر من 8):    {1 - stats.poisson.cdf(8, lambda_rate):.4f}")

plt.bar(x, pmf, alpha=0.7, color='#818cf8')
plt.title(f'توزيع بواسون (λ={lambda_rate})')
plt.xlabel('عدد الطلبات')
plt.show()`,
    example:"💡 مركز اتصال يستقبل 10 مكالمات/ساعة — بواسون يساعد في تحديد عدد الموظفين المطلوب."
  },
  {
    id:10, icon:"🔗", title:"معامل ارتباط بيرسون", en:"Pearson Correlation",
    category:"correlation", level:"متوسط",
    short:"يقيس قوة واتجاه العلاقة الخطية بين متغيرين — من -1 إلى +1.",
    desc:"r = +1: ارتباط طردي تام. r = -1: ارتباط عكسي تام. r = 0: لا علاقة خطية. يفترض أن البيانات طبيعية التوزيع. حساس للقيم الشاذة. تحذير: الارتباط لا يعني السببية!",
    formula:"r = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / √[Σ(xᵢ-x̄)²·Σ(yᵢ-ȳ)²]",
    code:`import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

np.random.seed(42)
x = np.random.randn(50)
y = 0.8 * x + 0.2 * np.random.randn(50)

r, p_value = stats.pearsonr(x, y)

print(f"معامل الارتباط r: {r:.3f}")
print(f"P-value:          {p_value:.6f}")

if abs(r) > 0.7:   strength = "قوي"
elif abs(r) > 0.4: strength = "متوسط"
else:              strength = "ضعيف"

direction = "طردي" if r > 0 else "عكسي"
print(f"التفسير: ارتباط {direction} {strength}")`,
    example:"💡 الإنفاق الإعلاني والمبيعات r=0.85 — ارتباط طردي قوي جداً."
  },
  {
    id:11, icon:"🏅", title:"ارتباط سبيرمان", en:"Spearman Correlation",
    category:"correlation", level:"متوسط",
    short:"بديل بيرسون للبيانات غير الطبيعية أو الترتيبية — يعتمد على الرتب.",
    desc:"ارتباط سبيرمان يحوّل القيم إلى رتب ثم يحسب الارتباط. أقل حساسية للقيم الشاذة. يُستخدم مع البيانات الترتيبية (تقييمات 1-5) أو عندما لا يتحقق شرط التوزيع الطبيعي.",
    formula:"ρ = 1 - (6Σdᵢ²) / (n(n²-1))  حيث dᵢ = فرق الرتب",
    code:`from scipy import stats
import numpy as np

# تقييمات المنتج من محكّمين مختلفين
judge1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
judge2 = [1, 3, 2, 5, 4, 7, 6, 9, 8, 10]

pearson_r,  p1 = stats.pearsonr(judge1, judge2)
spearman_r, p2 = stats.spearmanr(judge1, judge2)

print(f"بيرسون:   r={pearson_r:.3f}  (p={p1:.4f})")
print(f"سبيرمان:  ρ={spearman_r:.3f}  (p={p2:.4f})")

# مثال مع قيمة شاذة
judge2_outlier = judge2.copy()
judge2_outlier[-1] = 1  # قيمة شاذة
print(f"\nمع قيمة شاذة:")
print(f"بيرسون:   {stats.pearsonr(judge1, judge2_outlier)[0]:.3f}  ← تأثر!")
print(f"سبيرمان:  {stats.spearmanr(judge1, judge2_outlier)[0]:.3f}  ← مستقر")`,
    example:"💡 تقييم المطاعم من 1-5 نجوم — بيانات ترتيبية تستدعي سبيرمان لا بيرسون."
  },
  {
    id:12, icon:"📐", title:"الانحدار الخطي البسيط", en:"Simple Linear Regression",
    category:"correlation", level:"متوسط",
    short:"يجد أفضل خط مستقيم للتنبؤ بمتغير تابع من متغير مستقل واحد.",
    desc:"الانحدار يتجاوز الارتباط — يعطينا معادلة للتنبؤ. β₀ هو نقطة التقاطع مع المحور، β₁ هو الميل (كم يتغير y لكل وحدة في x). R² يخبرنا كم نسبة التباين يفسرها النموذج.",
    formula:"y = β₀ + β₁x + ε  |  β₁ = r × (σy/σx)",
    code:`from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error
import numpy as np

# ساعات الدراسة مقابل الدرجة
hours  = np.array([[1],[2],[3],[4],[5],[6],[7],[8]])
grades = np.array([45, 55, 60, 65, 70, 78, 85, 90])

model = LinearRegression().fit(hours, grades)

print(f"الميل β₁:       {model.coef_[0]:.2f} درجة/ساعة")
print(f"التقاطع β₀:     {model.intercept_:.2f}")
print(f"R²:             {r2_score(grades, model.predict(hours)):.3f}")

# تنبؤ
new_hours = np.array([[9]])
print(f"\nتنبؤ لـ 9 ساعات: {model.predict(new_hours)[0]:.1f} درجة")`,
    example:"💡 كل ساعة دراسة إضافية ترفع الدرجة 6 نقاط — هذا ما يخبرنا به الميل β₁."
  },
  {
    id:13, icon:"🎯", title:"أخذ العينات", en:"Sampling",
    category:"sampling", level:"مبتدئ",
    short:"اختيار مجموعة فرعية من المجتمع لتمثيله — الطريقة تحدد موثوقية النتائج.",
    desc:"أنواع العينات: العشوائية البسيطة (كل فرد فرصة متساوية)، الطبقية (تقسيم لطبقات)، العنقودية (تقسيم لمجموعات)، الملائمة (الأسهل لكن الأضعف). حجم العينة يؤثر مباشرة على دقة التقديرات.",
    formula:"حجم العينة = (z² × p × (1-p)) / e²",
    code:`import numpy as np

# مجتمع افتراضي
np.random.seed(42)
population = np.random.normal(50, 15, size=10000)

# عينة عشوائية بسيطة
simple_sample = np.random.choice(population, size=100, replace=False)

# عينة طبقية (مثال مبسط)
low    = population[population < 40]
medium = population[(population >= 40) & (population < 60)]
high   = population[population >= 60]

stratified = np.concatenate([
    np.random.choice(low,    size=20, replace=False),
    np.random.choice(medium, size=60, replace=False),
    np.random.choice(high,   size=20, replace=False)
])

print(f"متوسط المجتمع:          {population.mean():.2f}")
print(f"عينة عشوائية بسيطة:     {simple_sample.mean():.2f}")
print(f"عينة طبقية:             {stratified.mean():.2f}")`,
    example:"💡 استطلاع رأي: العينة الطبقية تضمن تمثيل كل الفئات العمرية بنسبها الصحيحة."
  },
  {
    id:14, icon:"📌", title:"مقاييس النزعة المركزية", en:"Central Tendency",
    category:"central_tendency", level:"مبتدئ",
    short:"المتوسط والوسيط والمنوال — ثلاثة مقاييس تصف مركز البيانات بطرق مختلفة.",
    desc:"المتوسط: متأثر بالقيم الشاذة. الوسيط: مقاوم للشذوذ، أفضل للبيانات المنحرفة. المنوال: للبيانات الفئوية. القاعدة: إذا كان التوزيع متماثلاً استخدم المتوسط، وإذا كان منحرفاً استخدم الوسيط.",
    formula:"المتوسط = Σx/n  |  الوسيط = القيمة الوسطى  |  المنوال = الأعلى تكراراً",
    code:`import numpy as np
from scipy import stats

# بيانات طبيعية
symmetric = np.array([10, 12, 14, 15, 16, 18, 20])
# بيانات منحرفة (وجود ثري!)
skewed    = np.array([10, 12, 14, 15, 16, 18, 200])

for name, data in [("متماثلة", symmetric), ("منحرفة", skewed)]:
    mean   = np.mean(data)
    median = np.median(data)
    mode   = stats.mode(data).mode
    print(f"\n{name}:")
    print(f"  المتوسط: {mean:.1f}")
    print(f"  الوسيط:  {median:.1f}")
    print(f"  المنوال: {mode}")
    print(f"  التوصية: {'المتوسط ✅' if abs(mean-median)<2 else 'الوسيط ✅'}")`,
    example:"💡 متوسط دخل حي فيه مليارديرات مضلل — الوسيط يعكس الواقع بشكل أدق."
  },
  {
    id:15, icon:"📏", title:"مقاييس التشتت", en:"Measures of Dispersion",
    category:"dispersion", level:"مبتدئ",
    short:"المدى والتباين والانحراف المعياري وIQR — تصف كيف تتوزع البيانات حول مركزها.",
    desc:"المدى: بسيط لكن حساس للشذوذ. التباين: متوسط مربعات الانحرافات. الانحراف المعياري: جذر التباين، بنفس وحدة البيانات. IQR: مدى الربيعين الأوسط — مقاوم للشذوذ.",
    formula:"σ² = Σ(xᵢ-μ)²/n  |  σ = √σ²  |  IQR = Q3 - Q1",
    code:`import numpy as np

data = np.array([15, 18, 20, 22, 25, 28, 30, 35, 40, 100])

print(f"المدى:                  {data.max() - data.min()}")
print(f"التباين:                {np.var(data):.2f}")
print(f"الانحراف المعياري:      {np.std(data):.2f}")

Q1  = np.percentile(data, 25)
Q3  = np.percentile(data, 75)
IQR = Q3 - Q1
print(f"IQR (Q3-Q1):            {IQR:.2f}")
print(f"حدود الشذوذ:")
print(f"  أقل من: {Q1 - 1.5*IQR:.2f}")
print(f"  أكثر من: {Q3 + 1.5*IQR:.2f}")

# بدون القيمة الشاذة
clean = data[data < 50]
print(f"\nالانحراف بدون شاذة: {np.std(clean):.2f}  ← أصغر بكثير!")`,
    example:"💡 صندوقان استثماريان بنفس المتوسط — الانحراف المعياري يكشف أيهما أكثر استقراراً."
  },
  {
    id:16, icon:"📊", title:"الالتواء والتفرطح", en:"Skewness & Kurtosis",
    category:"descriptive", level:"متقدم",
    short:"يصفان شكل التوزيع — هل هو متماثل؟ وهل له ذيول ثقيلة أم خفيفة؟",
    desc:"الالتواء (Skewness): موجب = ذيل يمين (قيم عالية شاذة)، سالب = ذيل يسار. التفرطح (Kurtosis): عالٍ = ذيول ثقيلة وقمة حادة، منخفض = ذيول خفيفة وقمة مسطحة. مهمان لاختيار الاختبار الإحصائي المناسب.",
    formula:"Skewness = E[(x-μ)³]/σ³  |  Kurtosis = E[(x-μ)⁴]/σ⁴ - 3",
    code:`import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

# توزيعات مختلفة الشكل
normal    = np.random.normal(0, 1, 1000)
right_skew = np.random.exponential(1, 1000)   # التواء يميني
left_skew  = -np.random.exponential(1, 1000)  # التواء يساري

for name, data in [("طبيعي", normal),
                   ("التواء يميني", right_skew),
                   ("التواء يساري", left_skew)]:
    sk = stats.skew(data)
    ku = stats.kurtosis(data)
    print(f"{name:15s} → الالتواء: {sk:+.2f}  التفرطح: {ku:+.2f}")`,
    example:"💡 دخل الأفراد: التواء يميني قوي — معظم الناس دخل منخفض وقلة قليلة دخل ضخم جداً."
  },
  {
    id:17, icon:"🔢", title:"نظرية الحد المركزي", en:"Central Limit Theorem",
    category:"inferential", level:"متقدم",
    short:"توزيع المتوسطات يقترب من الطبيعي مع زيادة حجم العينة — بغض النظر عن توزيع المجتمع.",
    desc:"نظرية الحد المركزي هي الأساس الذي تقوم عليه معظم الاختبارات الإحصائية. تقول: مهما كان توزيع المجتمع، إذا أخذنا عينات كافية (n≥30) فإن توزيع المتوسطات سيكون طبيعياً تقريباً.",
    formula:"x̄ ~ N(μ, σ²/n)  عندما n كبير",
    code:`import numpy as np
import matplotlib.pyplot as plt

# مجتمع غير طبيعي (منحرف جداً)
population = np.random.exponential(scale=2, size=100000)
print(f"الالتواء في المجتمع: {population.std():.2f}")

fig, axes = plt.subplots(1, 3, figsize=(12, 4))

for idx, n in enumerate([5, 30, 100]):
    sample_means = [np.mean(np.random.choice(population, n))
                    for _ in range(1000)]
    axes[idx].hist(sample_means, bins=30, density=True,
                   alpha=0.7, color='#818cf8')
    axes[idx].set_title(f'n = {n}')
    axes[idx].set_xlabel('متوسط العينة')

plt.suptitle('نظرية الحد المركزي — المتوسطات تصبح طبيعية')
plt.tight_layout()
plt.show()`,
    example:"💡 حتى لو توزيع المبيعات اليومية غريب الشكل، متوسط 30 يوم سيكون طبيعي التوزيع."
  },
  {
    id:18, icon:"🧮", title:"اختبار كاي تربيع", en:"Chi-Square Test",
    category:"hypothesis", level:"متوسط",
    short:"يختبر العلاقة بين متغيرين فئويين — هل الارتباط بينهما حقيقي أم صدفة؟",
    desc:"اختبار χ² يقارن التوزيع المُلاحَظ بالتوزيع المتوقع لو لم تكن هناك علاقة. يُستخدم لـ: اختبار الاستقلالية بين متغيرين فئويين، واختبار حسن المطابقة (هل البيانات تتبع توزيعاً معيناً؟).",
    formula:"χ² = Σ (O - E)² / E",
    code:`from scipy import stats
import numpy as np

# هل الجنس يؤثر على تفضيل المنتج؟
# جدول التقاطع: [ذكور, إناث] × [منتج A, منتج B, منتج C]
observed = np.array([
    [30, 20, 10],   # ذكور
    [15, 25, 20]    # إناث
])

chi2, p_value, dof, expected = stats.chi2_contingency(observed)

print(f"χ² = {chi2:.3f}")
print(f"درجات الحرية: {dof}")
print(f"P-value: {p_value:.4f}")
print()
if p_value < 0.05:
    print("✅ يوجد ارتباط دال بين الجنس وتفضيل المنتج")
else:
    print("❌ لا يوجد ارتباط دال — التفضيل مستقل عن الجنس")`,
    example:"💡 هل منطقة السكن تؤثر على قناة الشراء المفضلة (أونلاين/متجر)؟ χ² يجيب."
  },
  {
    id:19, icon:"📋", title:"ANOVA", en:"Analysis of Variance",
    category:"hypothesis", level:"متقدم",
    short:"مقارنة متوسطات أكثر من مجموعتين في وقت واحد — بدلاً من t-tests متعددة.",
    desc:"ANOVA تختبر: هل يوجد فرق دال بين متوسطات k مجموعة؟ H₀: جميع المتوسطات متساوية. إذا رفضنا H₀ نحتاج اختبارات Post-hoc (مثل Tukey) لمعرفة أي المجموعات تختلف.",
    formula:"F = تباين بين المجموعات / تباين داخل المجموعات",
    code:`from scipy import stats
import numpy as np

# مقارنة أداء 3 فرق مبيعات
team_a = np.array([85, 90, 88, 92, 87, 91])
team_b = np.array([78, 82, 80, 79, 83, 81])
team_c = np.array([92, 95, 93, 97, 94, 96])

f_stat, p_value = stats.f_oneway(team_a, team_b, team_c)

print(f"F-statistic: {f_stat:.3f}")
print(f"P-value:     {p_value:.6f}")

if p_value < 0.05:
    print("✅ يوجد فرق دال بين الفرق")
    print(f"  متوسط A: {team_a.mean():.1f}")
    print(f"  متوسط B: {team_b.mean():.1f}")
    print(f"  متوسط C: {team_c.mean():.1f}")`,
    example:"💡 مقارنة فعالية 4 حملات تسويقية — ANOVA تكشف هل الفروق حقيقية أم صدفة."
  },
  {
    id:20, icon:"🗺️", title:"التوزيع الاحتمالي", en:"Probability Distribution",
    category:"distributions", level:"مبتدئ",
    short:"دالة تصف احتمال كل قيمة ممكنة لمتغير عشوائي.",
    desc:"التوزيعات المتقطعة (Discrete): قيم محددة — ذو الحدين، بواسون. التوزيعات المستمرة (Continuous): أي قيمة في نطاق — الطبيعي، الأسي، t-student. اختيار التوزيع الصحيح أساس النمذجة الإحصائية.",
    formula:"P(a ≤ X ≤ b) = ∫ₐᵇ f(x)dx  (مستمر)  |  P(X=k) = f(k)  (متقطع)",
    code:`from scipy import stats
import numpy as np
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, figsize=(10, 8))

# طبيعي
x = np.linspace(-4, 4, 200)
axes[0,0].plot(x, stats.norm.pdf(x))
axes[0,0].set_title('طبيعي Normal')

# t-student
for df in [1, 5, 30]:
    axes[0,1].plot(x, stats.t.pdf(x, df), label=f'df={df}')
axes[0,1].legend()
axes[0,1].set_title('t-Student')

# ذو الحدين
k = np.arange(0, 21)
axes[1,0].bar(k, stats.binom.pmf(k, 20, 0.4), alpha=0.7)
axes[1,0].set_title('ذو الحدين Binomial')

# بواسون
axes[1,1].bar(k, stats.poisson.pmf(k, 5), alpha=0.7, color='#f472b6')
axes[1,1].set_title('بواسون Poisson')

plt.tight_layout()
plt.show()`,
    example:"💡 قبل بناء أي نموذج، تحديد التوزيع الصحيح يوفر عليك أخطاء فادحة لاحقاً."
  },
  {
    id:21, icon:"🔬", title:"اختبار t", en:"T-Test",
    category:"hypothesis", level:"متوسط",
    short:"مقارنة متوسطين — عينة واحدة، عينتان مستقلتان، أو عينتان مرتبطتان.",
    desc:"ثلاثة أنواع: One-sample (مقارنة بقيمة محددة)، Independent (مجموعتان مختلفتان)، Paired (نفس المجموعة قبل وبعد). يفترض التوزيع الطبيعي — استخدم Mann-Whitney كبديل لا معلمي.",
    formula:"t = (x̄ - μ₀) / (s/√n)  |  t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)",
    code:`from scipy import stats
import numpy as np

# مقارنة مبيعات قبل وبعد تحديث الموقع
before = np.array([120, 135, 128, 142, 118, 130, 125, 138])
after  = np.array([145, 158, 152, 165, 140, 155, 148, 162])

# اختبار t للعينات المرتبطة (Paired)
t_stat, p_value = stats.ttest_rel(before, after)

print(f"متوسط قبل: {before.mean():.1f}")
print(f"متوسط بعد: {after.mean():.1f}")
print(f"الفرق:     {after.mean()-before.mean():.1f} (+{(after.mean()/before.mean()-1)*100:.1f}%)")
print(f"t = {t_stat:.3f},  p = {p_value:.6f}")

if p_value < 0.05:
    print("✅ التحديث رفع المبيعات بشكل دال إحصائياً")`,
    example:"💡 هل تحديث واجهة التطبيق رفع معدل التحويل فعلاً؟ اختبار t يحكم."
  },
  {
    id:22, icon:"📦", title:"المئينيات والربيعيات", en:"Percentiles & Quartiles",
    category:"dispersion", level:"مبتدئ",
    short:"تقسيم البيانات إلى أجزاء متساوية — لفهم موضع أي قيمة بين البقية.",
    desc:"المئين ke يعني أن k% من البيانات أقل منه. الربيعيات تقسم البيانات إلى 4 أجزاء: Q1=25%، Q2=50% (الوسيط)، Q3=75%. IQR = Q3-Q1 يمثل الـ50% الوسطى من البيانات.",
    formula:"IQR = Q3 - Q1  |  حدود الشذوذ: [Q1-1.5×IQR, Q3+1.5×IQR]",
    code:`import numpy as np
import matplotlib.pyplot as plt

data = np.random.normal(70, 15, 200)
data = np.clip(data, 0, 100)

Q1  = np.percentile(data, 25)
Q2  = np.percentile(data, 50)
Q3  = np.percentile(data, 75)
IQR = Q3 - Q1

print(f"Q1  (25%): {Q1:.1f}")
print(f"Q2  (50%): {Q2:.1f}")
print(f"Q3  (75%): {Q3:.1f}")
print(f"IQR:       {IQR:.1f}")
print(f"حد أدنى للشذوذ:  {Q1 - 1.5*IQR:.1f}")
print(f"حد أعلى للشذوذ: {Q3 + 1.5*IQR:.1f}")

# مخطط الصندوق
plt.boxplot(data, vert=False)
plt.title('Box Plot — الربيعيات والشذوذ')
plt.show()`,
    example:"💡 طالب في المئين 85 يعني أداؤه أفضل من 85% من زملائه."
  },
  {
    id:23, icon:"🌊", title:"الالتواء", en:"Skewness",
    category:"descriptive", level:"متوسط",
    short:"يقيس عدم تماثل التوزيع — هل البيانات منحازة لجهة معينة؟",
    desc:"التوزيع المتماثل: skewness ≈ 0. الالتواء الموجب (يميني): ذيل طويل يمين، المتوسط > الوسيط. الالتواء السالب (يساري): ذيل طويل يسار، المتوسط < الوسيط. يؤثر على اختيار المقياس المناسب.",
    formula:"Skewness = E[(X-μ)³] / σ³",
    code:`import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

np.random.seed(42)
symmetric  = np.random.normal(50, 10, 1000)
right_skew = np.random.exponential(10, 1000) + 30
left_skew  = 100 - np.random.exponential(10, 1000)

fig, axes = plt.subplots(1, 3, figsize=(12, 4))
datasets = [("متماثل", symmetric, '#4ade80'),
            ("التواء يميني +", right_skew, '#f87171'),
            ("التواء يساري -", left_skew, '#818cf8')]

for ax, (name, data, color) in zip(axes, datasets):
    ax.hist(data, bins=30, color=color, alpha=0.7)
    sk = stats.skew(data)
    ax.set_title(f'{name}\nskewness = {sk:.2f}')
    ax.axvline(np.mean(data), color='red', linestyle='--', label='mean')
    ax.axvline(np.median(data), color='blue', linestyle='--', label='median')
    ax.legend(fontsize=8)

plt.tight_layout()
plt.show()`,
    example:"💡 توزيع الثروات: التواء يميني شديد — قلة تملك الغالبية، وكثيرون يملكون القليل."
  },
  {
    id:24, icon:"🏗️", title:"تحليل المكونات الرئيسية", en:"PCA",
    category:"correlation", level:"متقدم",
    short:"تقليل أبعاد البيانات مع الحفاظ على أكبر قدر من المعلومات.",
    desc:"PCA يحوّل المتغيرات المترابطة إلى مكونات مستقلة مرتبة حسب التباين الذي تفسره. يُستخدم لتصوير البيانات عالية الأبعاد، وتسريع النماذج، وإزالة التداخل الخطي (Multicollinearity).",
    formula:"Z = XW  حيث W مصفوفة المتجهات الذاتية لمصفوفة التغاير",
    code:`from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
# بيانات 4 أبعاد
X = np.random.randn(200, 4)
X[:, 1] = X[:, 0] * 0.9 + np.random.randn(200) * 0.3
X[:, 2] = X[:, 0] * 0.7 + np.random.randn(200) * 0.5

# تطبيق PCA
X_scaled = StandardScaler().fit_transform(X)
pca = PCA()
pca.fit(X_scaled)

variance_ratio = pca.explained_variance_ratio_
cumulative     = np.cumsum(variance_ratio)

for i, (var, cum) in enumerate(zip(variance_ratio, cumulative)):
    print(f"PC{i+1}: {var:.2%}  (تراكمي: {cum:.2%})")

# المكونان الأولان يفسران معظم التباين
pca_2d = PCA(n_components=2).fit_transform(X_scaled)
plt.scatter(pca_2d[:, 0], pca_2d[:, 1], alpha=0.5)
plt.title('البيانات في بُعدين بعد PCA')
plt.show()`,
    example:"💡 100 متغير لوصف العملاء → PCA تختصرها في 5 مكونات تحمل 90% من المعلومات."
  }
];

/* ─────────────────────────────────────────── */

const PROCESS_STEPS = [
  {
    num:"01", icon:"❓", title:"تحديد السؤال الإحصائي",
    desc:"ما الذي تريد قياسه أو اختباره؟ تحديد المتغيرات ونوعها.",
    details:[
      "هل المتغيرات فئوية أم رقمية؟",
      "هل تريد وصفاً أم استدلالاً؟",
      "ما حجم العينة المتاح؟",
      "ما مستوى الدلالة المقبول؟"
    ],
    tools:["Notion", "Miro", "Google Docs"],
    time:"10-15%"
  },
  {
    num:"02", icon:"🎯", title:"جمع البيانات والعينة",
    desc:"اختيار طريقة أخذ العينة المناسبة لضمان تمثيل المجتمع.",
    details:[
      "تحديد المجتمع الإحصائي",
      "اختيار طريقة العينة (عشوائية/طبقية)",
      "حساب الحجم الكافي للعينة",
      "التحقق من غياب التحيز"
    ],
    tools:["Python random", "Google Forms", "SurveyMonkey"],
    time:"15-20%"
  },
  {
    num:"03", icon:"📊", title:"الإحصاء الوصفي",
    desc:"تلخيص البيانات وفهم توزيعها قبل أي اختبار.",
    details:[
      "مقاييس النزعة المركزية",
      "مقاييس التشتت",
      "فحص شكل التوزيع (الالتواء والتفرطح)",
      "اكتشاف القيم الشاذة"
    ],
    tools:["Pandas", "NumPy", "Matplotlib", "Seaborn"],
    time:"20-25%"
  },
  {
    num:"04", icon:"🧪", title:"اختيار الاختبار المناسب",
    desc:"نوع البيانات وعدد المجموعات يحددان الاختبار الصحيح.",
    details:[
      "رقمي مجموعتان → t-test",
      "رقمي أكثر من مجموعتين → ANOVA",
      "فئوي → Chi-Square",
      "التحقق من افتراضات الاختبار"
    ],
    tools:["SciPy", "Statsmodels", "Pingouin"],
    time:"15-20%"
  },
  {
    num:"05", icon:"🔍", title:"تطبيق الاختبار وتفسير النتائج",
    desc:"حساب الإحصاء وتفسير P-value وحجم الأثر.",
    details:[
      "حساب إحصاء الاختبار",
      "مقارنة P-value بـ α",
      "حساب حجم الأثر (Effect Size)",
      "فترات الثقة للنتائج"
    ],
    tools:["SciPy", "Statsmodels", "Python"],
    time:"20-25%"
  },
  {
    num:"06", icon:"📢", title:"التقرير والتوصيات",
    desc:"ترجمة النتائج الإحصائية إلى قرارات مفهومة.",
    details:[
      "تصوير النتائج بوضوح",
      "ذكر القيود والافتراضات",
      "التوصيات العملية",
      "الدلالة العملية vs الإحصائية"
    ],
    tools:["Jupyter Notebook", "Matplotlib", "PowerPoint"],
    time:"10-15%"
  }
];

/* ─────────────────────────────────────────── */

const CASE_STEPS = [
  {
    step:1, icon:"❓", title:"المشكلة",
    content:"شركة تطوير تريد معرفة: هل التدريب الجديد رفع أداء الموظفين فعلاً؟ وهل يختلف الأثر بين الأقسام المختلفة؟",
    code:null,
    insight:"🎯 الهدف: إثبات أو نفي فعالية البرنامج بأدلة إحصائية — لا بمجرد الانطباع."
  },
  {
    step:2, icon:"🎯", title:"جمع البيانات",
    content:"قياس أداء 60 موظفاً (30 تدربوا، 30 لم يتدربوا) قبل وبعد البرنامج.",
    code:`import pandas as pd
import numpy as np

np.random.seed(42)
n = 30

data = pd.DataFrame({
    'employee_id':  range(1, n*2+1),
    'group':        ['trained']*n + ['control']*n,
    'score_before': np.concatenate([
        np.random.normal(70, 8, n),
        np.random.normal(69, 8, n)
    ]),
    'score_after':  np.concatenate([
        np.random.normal(82, 7, n),
        np.random.normal(71, 8, n)
    ])
})
data['improvement'] = data['score_after'] - data['score_before']
print(data.groupby('group')[['score_before','score_after','improvement']].mean().round(2))`,
    insight:"✅ البيانات جاهزة: مجموعة التدريب ومجموعة الضبط بنفس الخصائص الأولية."
  },
  {
    step:3, icon:"📊", title:"الإحصاء الوصفي",
    content:"فحص التوزيعات والتأكد من الافتراضات قبل الاختبار.",
    code:`from scipy import stats

trained = data[data['group']=='trained']['improvement']
control = data[data['group']=='control']['improvement']

for name, grp in [("المتدربون", trained), ("الضبط", control)]:
    print(f"{name}:")
    print(f"  المتوسط:  {grp.mean():.2f}")
    print(f"  الانحراف: {grp.std():.2f}")
    print(f"  الالتواء: {stats.skew(grp):.2f}")

# اختبار الطبيعية
_, p_trained = stats.shapiro(trained)
_, p_control = stats.shapiro(control)
print(f"\nShapiro-Wilk: p_trained={p_trained:.3f}, p_control={p_control:.3f}")
print("✅ كلاهما طبيعي التوزيع — يمكن استخدام t-test" if min(p_trained,p_control)>0.05 else "⚠️ استخدم Mann-Whitney")`,
    insight:"📌 الالتواء قريب من الصفر والتوزيع طبيعي — شروط t-test محققة."
  },
  {
    step:4, icon:"🧪", title:"اختبار الفرضية",
    content:"H₀: لا فرق في التحسن بين المجموعتين. H₁: المتدربون تحسنوا أكثر.",
    code:`from scipy import stats

trained = data[data['group']=='trained']['improvement']
control = data[data['group']=='control']['improvement']

# اختبار t للعينات المستقلة
t_stat, p_value = stats.ttest_ind(trained, control)

# حجم الأثر (Cohen's d)
pooled_std = np.sqrt((trained.std()**2 + control.std()**2) / 2)
cohens_d   = (trained.mean() - control.mean()) / pooled_std

print(f"t-statistic: {t_stat:.3f}")
print(f"P-value:     {p_value:.6f}")
print(f"Cohen's d:   {cohens_d:.2f}")

if   cohens_d < 0.2: effect = "ضعيف"
elif cohens_d < 0.5: effect = "متوسط"
else:                effect = "كبير"

print(f"حجم الأثر:   {effect}")`,
    insight:"✅ p < 0.05 → نرفض H₀. Cohen's d يخبرنا أن الأثر كبير — ليس مجرد دلالة إحصائية!"
  },
  {
    step:5, icon:"📊", title:"التحليل العميق",
    content:"هل يختلف أثر التدريب بين الأقسام؟ ANOVA تجيب.",
    code:`from scipy import stats

# أداء المتدربين مقسماً على 3 أقسام
dept_a = trained_data[trained_data['dept']=='A']['improvement']
dept_b = trained_data[trained_data['dept']=='B']['improvement']
dept_c = trained_data[trained_data['dept']=='C']['improvement']

f_stat, p_value = stats.f_oneway(dept_a, dept_b, dept_c)

print(f"F-statistic: {f_stat:.3f}")
print(f"P-value:     {p_value:.4f}")

for dept, grp in [('A', dept_a), ('B', dept_b), ('C', dept_c)]:
    print(f"قسم {dept}: متوسط التحسن = {grp.mean():.1f} نقطة")`,
    insight:"📌 الاكتشاف: قسم A استفاد أكثر بفارق واضح — يستحق دراسة سبب الفرق."
  },
  {
    step:6, icon:"📢", title:"التوصيات",
    content:"نتائج قابلة للتنفيذ بناءً على الأدلة الإحصائية.",
    code:null,
    insight:`✅ البرنامج فعّال — التحسن دال إحصائياً وعملياً (Cohen's d كبير)
✅ توسيع البرنامج لجميع الأقسام بأولوية للأقسام الأقل أداءً
✅ دراسة أسباب تفوق قسم A لتطبيقها على البقية
✅ قياس الأثر بعد 6 أشهر للتحقق من الاستدامة

📈 العائد المتوقع: رفع الإنتاجية الكلية 12-15% خلال ربع سنة`
  }
];

/* ─────────────────────────────────────────── */

const CHEAT_SHEETS = [
  {
    title:"📊 الإحصاء الوصفي السريع",
    code:`import numpy as np
from scipy import stats

data = df['column']

# النزعة المركزية
np.mean(data)           # المتوسط
np.median(data)         # الوسيط
stats.mode(data).mode   # المنوال

# التشتت
np.std(data)            # الانحراف المعياري
np.var(data)            # التباين
np.percentile(data, 25) # Q1
np.percentile(data, 75) # Q3
stats.iqr(data)         # IQR مباشرة

# الشكل
stats.skew(data)        # الالتواء
stats.kurtosis(data)    # التفرطح`
  },
  {
    title:"🧪 اختبارات الفرضيات",
    code:`from scipy import stats

# مقارنة بقيمة محددة
stats.ttest_1samp(data, popmean=50)

# مجموعتان مستقلتان
stats.ttest_ind(group1, group2)

# قبل وبعد (مرتبطتان)
stats.ttest_rel(before, after)

# أكثر من مجموعتين
stats.f_oneway(g1, g2, g3)

# فئوي × فئوي
stats.chi2_contingency(contingency_table)

# بديل لا معلمي لـ t-test
stats.mannwhitneyu(group1, group2)
stats.wilcoxon(before, after)`
  },
  {
    title:"📈 التوزيعات الاحتمالية",
    code:`from scipy import stats

# طبيعي
stats.norm.pdf(x, loc=0, scale=1)   # الكثافة
stats.norm.cdf(x, loc=0, scale=1)   # التراكمي
stats.norm.ppf(0.95)                 # المئين 95

# t-student
stats.t.interval(0.95, df=29,
                 loc=mean, scale=se) # فترة ثقة

# ذو الحدين
stats.binom.pmf(k=5, n=20, p=0.3)  # P(X=5)
stats.binom.cdf(k=5, n=20, p=0.3)  # P(X≤5)

# بواسون
stats.poisson.pmf(k=3, mu=5)        # P(X=3)
stats.poisson.cdf(k=3, mu=5)        # P(X≤3)`
  },
  {
    title:"🔗 الارتباط والانحدار",
    code:`from scipy import stats
from sklearn.linear_model import LinearRegression
import numpy as np

# بيرسون
r, p = stats.pearsonr(x, y)

# سبيرمان (للبيانات الترتيبية)
rho, p = stats.spearmanr(x, y)

# انحدار خطي بسيط
model = LinearRegression()
model.fit(X.reshape(-1,1), y)
print(f"β₁ = {model.coef_[0]:.3f}")
print(f"β₀ = {model.intercept_:.3f}")
print(f"R² = {model.score(X.reshape(-1,1), y):.3f}")

# تنبؤ
y_pred = model.predict([[new_x]])`
  },
  {
    title:"🎯 فترات الثقة",
    code:`from scipy import stats
import numpy as np

data = np.array([...])
n    = len(data)
mean = data.mean()
se   = stats.sem(data)

# فترة ثقة 95% (t-distribution)
ci_95 = stats.t.interval(
    0.95, df=n-1, loc=mean, scale=se
)

# فترة ثقة 99%
ci_99 = stats.t.interval(
    0.99, df=n-1, loc=mean, scale=se
)

print(f"المتوسط:  {mean:.2f}")
print(f"CI 95%:  ({ci_95[0]:.2f}, {ci_95[1]:.2f})")
print(f"CI 99%:  ({ci_99[0]:.2f}, {ci_99[1]:.2f})")`
  },
  {
    title:"📦 PCA تقليل الأبعاد",
    code:`from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np

# 1. تطبيع البيانات (ضروري!)
X_scaled = StandardScaler().fit_transform(X)

# 2. تطبيق PCA
pca = PCA()
pca.fit(X_scaled)

# 3. نسبة التباين لكل مكون
print(pca.explained_variance_ratio_)

# 4. اختيار عدد المكونات (95% من التباين)
pca_95 = PCA(n_components=0.95)
X_reduced = pca_95.fit_transform(X_scaled)
print(f"الأبعاد: {X.shape[1]} → {X_reduced.shape[1]}")`
  },
  {
    title:"🔬 اختبار الطبيعية",
    code:`from scipy import stats
import numpy as np

data = np.array([...])

# Shapiro-Wilk (أفضل للعينات الصغيرة n<50)
stat, p = stats.shapiro(data)
print(f"Shapiro-Wilk: p={p:.4f}")

# Kolmogorov-Smirnov (للعينات الكبيرة)
stat, p = stats.kstest(data, 'norm',
    args=(data.mean(), data.std()))
print(f"K-S Test: p={p:.4f}")

# القرار
alpha = 0.05
if p > alpha:
    print("✅ البيانات طبيعية التوزيع")
else:
    print("⚠️ البيانات ليست طبيعية — استخدم اختباراً لا معلمياً")`
  },
  {
    title:"📏 حجم العينة",
    code:`import numpy as np
from scipy import stats

def sample_size_mean(margin_error, std, confidence=0.95):
    """حجم العينة لتقدير المتوسط"""
    z = stats.norm.ppf((1 + confidence) / 2)
    return int(np.ceil((z * std / margin_error) ** 2))

def sample_size_proportion(margin_error, p=0.5, confidence=0.95):
    """حجم العينة لتقدير النسبة"""
    z = stats.norm.ppf((1 + confidence) / 2)
    return int(np.ceil((z**2 * p * (1-p)) / margin_error**2))

# أمثلة
print(sample_size_mean(margin_error=2, std=10))
print(sample_size_proportion(margin_error=0.03))`
  }
];

/* ─────────────────────────────────────────── */

const QUIZ = [
  {
    q:"ما الفرق الجوهري بين المتوسط والوسيط؟",
    options:[
      "لا فرق — كلاهما يقيس نفس الشيء",
      "المتوسط حساس للقيم الشاذة، الوسيط مقاوم لها",
      "الوسيط يُستخدم فقط للبيانات الفئوية",
      "المتوسط دائماً أكبر من الوسيط"
    ],
    answer:1,
    explanation:"المتوسط يتأثر بأي قيمة شاذة — قيمة واحدة متطرفة تكفي لتشويهه. الوسيط يعكس مركز البيانات الحقيقي بغض النظر عن الشذوذ."
  },
  {
    q:"P-value = 0.03 ومستوى الدلالة α = 0.05. ما القرار الصحيح؟",
    options:[
      "نقبل فرضية العدم H₀",
      "نرفض فرضية العدم H₀",
      "لا يمكن اتخاذ قرار",
      "نحتاج بيانات أكثر"
    ],
    answer:1,
    explanation:"بما أن P-value (0.03) < α (0.05)، نرفض H₀. النتيجة دالة إحصائياً — احتمال رؤية هذه البيانات لو كانت H₀ صحيحة هو 3% فقط."
  },
  {
    q:"ما التوزيع الأنسب لنمذجة عدد المكالمات الواردة في ساعة؟",
    options:[
      "التوزيع الطبيعي",
      "التوزيع ذو الحدين",
      "توزيع بواسون",
      "توزيع t-student"
    ],
    answer:2,
    explanation:"بواسون مصمم خصيصاً لعدد الأحداث في فترة زمنية محددة — المكالمات، الطلبات، الأعطال. شرطه: الأحداث مستقلة ومعدلها ثابت."
  },
  {
    q:"عندك 4 مجموعات وتريد مقارنة متوسطاتها. ما الاختبار المناسب؟",
    options:[
      "4 اختبارات t منفصلة",
      "Chi-Square",
      "ANOVA",
      "اختبار بيرسون"
    ],
    answer:2,
    explanation:"ANOVA تقارن أكثر من مجموعتين في وقت واحد. إجراء t-tests متعددة يضخّم خطأ النوع الأول — كل اختبار إضافي يزيد احتمال الخطأ."
  },
  {
    q:"ما معنى فترة الثقة 95%؟",
    options:[
      "احتمال 95% أن القيمة الحقيقية داخل الفترة",
      "لو كررنا التجربة 100 مرة، 95 فترة ستحتوي القيمة الحقيقية",
      "95% من البيانات تقع داخل الفترة",
      "الفترة صحيحة بنسبة 95%"
    ],
    answer:1,
    explanation:"التفسير الصحيح: الإجراء يُنتج فترات تحتوي القيمة الحقيقية 95% من الوقت — ليس أن هذه الفترة بالذات لها احتمال 95%."
  }
];


/* ============================================================
   DATA.JS — data-cleaning page
   جميع البيانات هنا فقط، لا يوجد أي منطق
============================================================ */

const TERMS = [
  {
    id:1, icon:"❓", title:"القيم المفقودة", en:"Missing Values",
    category:"missing", level:"مبتدئ",
    short:"خلايا فارغة أو NaN في البيانات — تسبب أخطاء في النماذج وتشوّه التحليل.",
    desc:"القيم المفقودة تظهر لأسباب عديدة: خطأ في الإدخال، بيانات لم تُجمع، أو قيم غير منطبقة. Pandas يمثّلها بـ NaN (Not a Number). أول خطوة دائماً: افهم سبب الغياب قبل أن تقرر كيف تعالجه — الحذف ليس دائماً الحل!",
    formula:"نسبة المفقودة = (عدد NaN / إجمالي الصفوف) × 100%",
    code:`import pandas as pd

df = pd.read_csv('data.csv')

# اكتشاف القيم المفقودة
print(df.isnull().sum())           # عدد المفقودة لكل عمود
print(df.isnull().mean() * 100)    # النسبة المئوية

# خريطة حرارية للمفقودة
import seaborn as sns
import matplotlib.pyplot as plt
sns.heatmap(df.isnull(), cbar=False, cmap='viridis')
plt.title('خريطة القيم المفقودة')
plt.show()`,
    example:"💡 عمود 'الراتب' يحتوي 30% قيم مفقودة — هل لأن الموظفين رفضوا الإفصاح؟ أم خطأ في الإدخال؟"
  },
  {
    id:2, icon:"🗑️", title:"حذف الصفوف", en:"dropna",
    category:"missing", level:"مبتدئ",
    short:"إزالة الصفوف أو الأعمدة التي تحتوي قيماً مفقودة — مناسب عند نسبة مفقودة منخفضة.",
    desc:"dropna مناسب فقط إذا كانت نسبة المفقودة أقل من 5% وكانت المفقودة عشوائية. الحذف الكثير يُفقد معلومات ثمينة ويُحيّز التحليل. استخدم `thresh` لتحديد الحد الأدنى للقيم غير المفقودة.",
    formula:"لا تحذف إذا: نسبة المفقودة > 5-10% أو البيانات غير عشوائية",
    code:`import pandas as pd

df = pd.read_csv('data.csv')

# حذف أي صف به قيمة مفقودة واحدة
df_clean = df.dropna()

# حذف فقط إذا كل القيم مفقودة
df_clean = df.dropna(how='all')

# احتفظ بالصف إذا كانت 3 قيم على الأقل موجودة
df_clean = df.dropna(thresh=3)

# حذف بعمود محدد فقط
df_clean = df.dropna(subset=['age', 'salary'])

print(f"قبل: {len(df)} | بعد: {len(df_clean)}")`,
    example:"💡 إذا كان عمود 'الرأي الاختياري' فارغاً في 40% من الصفوف — احذف العمود لا الصفوف."
  },
  {
    id:3, icon:"🔧", title:"تعبئة البيانات", en:"Imputation",
    category:"missing", level:"متوسط",
    short:"استبدال القيم المفقودة بقيمة محسوبة — أفضل من الحذف عند كثرة المفقودة.",
    desc:"أساليب التعبئة تتدرج من البسيط للمتقدم: تعبئة ثابتة (صفر/نص)، تعبئة بالإحصاء (متوسط/وسيط/منوال)، تعبئة بالمجاور (ffill/bfill)، وتعبئة بنماذج تعلم الآلة (KNN، MICE). اختر بناءً على نوع البيانات وطبيعة الغياب.",
    formula:"مستمر: استخدم الوسيط | فئوي: استخدم المنوال | زمني: استخدم ffill",
    code:`import pandas as pd
from sklearn.impute import SimpleImputer, KNNImputer

df = pd.read_csv('data.csv')

# تعبئة بسيطة
df['age'].fillna(df['age'].median(), inplace=True)
df['city'].fillna(df['city'].mode()[0], inplace=True)
df['notes'].fillna('غير محدد', inplace=True)

# تعبئة زمنية (للسلاسل الزمنية)
df['price'].fillna(method='ffill', inplace=True)  # للأمام
df['price'].fillna(method='bfill', inplace=True)  # للخلف

# تعبئة متقدمة بـ KNN
imputer = KNNImputer(n_neighbors=5)
df_filled = pd.DataFrame(
    imputer.fit_transform(df[['age','salary','score']]),
    columns=['age','salary','score']
)`,
    example:"💡 عمود 'العمر': استخدم الوسيط لأنه أقل تأثراً بالقيم الشاذة من المتوسط."
  },
  {
    id:4, icon:"🔁", title:"التكرارات", en:"Duplicates",
    category:"duplicate", level:"مبتدئ",
    short:"صفوف مكررة تظهر من دمج مصادر متعددة أو أخطاء إدخال — تُشوّه الإحصاء والنماذج.",
    desc:"التكرارات الكاملة سهلة الاكتشاف، لكن التكرارات الجزئية (نفس الشخص بإملاء مختلف) أصعب. حدد مفتاح التكرار بدقة — هل تكرار الاسم وحده كافٍ للحكم؟ أم تحتاج الاسم + تاريخ الميلاد معاً؟",
    formula:"مفتاح التكرار = مجموعة الأعمدة التي تحدد هوية كل سجل",
    code:`import pandas as pd

df = pd.read_csv('data.csv')

# اكتشاف التكرارات
print(f"التكرارات الكاملة: {df.duplicated().sum()}")

# تكرارات جزئية (بعمود محدد)
print(df.duplicated(subset=['name', 'birth_date']).sum())

# عرض الصفوف المكررة
print(df[df.duplicated(keep=False)])

# حذف التكرارات — الاحتفاظ بالأول
df.drop_duplicates(inplace=True)

# الاحتفاظ بآخر تكرار
df.drop_duplicates(subset=['email'], keep='last', inplace=True)`,
    example:"💡 بيانات عملاء تحتوي 'أحمد محمد' مرتين — هل شخصان مختلفان أم نفس الشخص؟ تحقق من الهاتف أو الرقم الوطني."
  },
  {
    id:5, icon:"🚨", title:"القيم الشاذة", en:"Outliers",
    category:"outlier", level:"متوسط",
    short:"قيم بعيدة جداً عن باقي البيانات — قد تكون أخطاءً أو اكتشافات مهمة.",
    desc:"القيم الشاذة تُشوّه المتوسطات والنماذج الخطية. لكن تحذير: ليست كل قيمة شاذة خطأً! مبيعات مليون ريال في يوم واحد قد تكون حدثاً حقيقياً. القرار: هل تحذف؟ تعبئ؟ أم تحتفظ وتُعالج بنموذج متحمّل للشذوذ؟",
    formula:"شاذ: x < Q1 − 1.5×IQR   أو   x > Q3 + 1.5×IQR",
    code:`import pandas as pd
import numpy as np

df = pd.read_csv('data.csv')

# طريقة IQR
Q1 = df['salary'].quantile(0.25)
Q3 = df['salary'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR

outliers = df[(df['salary'] < lower) | (df['salary'] > upper)]
print(f"عدد الشاذة: {len(outliers)}")

# حذف الشاذة
df_clean = df[(df['salary'] >= lower) & (df['salary'] <= upper)]

# تحديد (Capping) بدل الحذف
df['salary'] = df['salary'].clip(lower=lower, upper=upper)`,
    example:"💡 راتب 500 ريال وسط رواتب 8,000-15,000 ريال — احتمال خطأ إدخال (مثلاً 5,000 أُدخلت 500)."
  },
  {
    id:6, icon:"📐", title:"Z-Score", en:"Z-Score / Standard Score",
    category:"outlier", level:"متوسط",
    short:"يقيس عدد الانحرافات المعيارية التي تبعد القيمة عن المتوسط — شائع لاكتشاف الشذوذ.",
    desc:"Z-Score يعمل بشكل أمثل على البيانات ذات التوزيع الطبيعي. القيمة شاذة إذا كان |Z| > 3 (بعض الحالات تستخدم 2.5). ميزته: يعطيك مقياساً موحداً بغض النظر عن وحدة القياس الأصلية.",
    formula:"Z = (x − μ) / σ   →   شاذ إذا |Z| > 3",
    code:`import pandas as pd
import numpy as np
from scipy import stats

df = pd.read_csv('data.csv')

# حساب Z-Score
z_scores = np.abs(stats.zscore(df['salary'].dropna()))

# تحديد الشاذة (Z > 3)
outlier_mask = z_scores > 3
print(f"الشاذة: {outlier_mask.sum()}")

# حذف الصفوف الشاذة
df_clean = df[z_scores <= 3]

# مقارنة الطريقتين
print(f"IQR يحذف: بناءً على الربيعيات")
print(f"Z-Score يحذف: بناءً على التوزيع الطبيعي")`,
    example:"💡 طالب درجته 150 من 100 → Z-Score سيكشفها فوراً كقيمة مستحيلة."
  },
  {
    id:7, icon:"🏷️", title:"أنواع البيانات", en:"Data Types",
    category:"transform", level:"مبتدئ",
    short:"تحديد النوع الصحيح لكل عمود — خطأ النوع يُسبب أخطاء صامتة في التحليل.",
    desc:"Pandas يُخمّن النوع عند التحميل وقد يُخطئ. العمود 'العمر' قد يُقرأ كـ object إذا احتوى نصاً واحداً. أعمدة الفئات category تُوفّر الذاكرة بنسبة 90%+ مقارنة بـ object. التواريخ datetime تُتيح عمليات زمنية قوية.",
    formula:"object (نص) → أبطأ وأكبر | int/float → أسرع | category → توفير ذاكرة",
    code:`import pandas as pd

df = pd.read_csv('data.csv')
print(df.dtypes)       # فحص الأنواع الحالية

# تصحيح الأنواع
df['age']       = df['age'].astype(int)
df['salary']    = df['salary'].astype(float)
df['hire_date'] = pd.to_datetime(df['hire_date'])
df['dept']      = df['dept'].astype('category')
df['is_active'] = df['is_active'].astype(bool)

# تنظيف قبل التحويل (إزالة الرموز)
df['salary'] = (
    df['salary']
    .astype(str)
    .str.replace(',', '', regex=False)
    .str.replace(' ريال', '', regex=False)
    .astype(float)
)`,
    example:"💡 عمود 'السعر' فيه '1,500 ريال' — لا يمكن تحويله لرقم مباشرة، يجب تنظيف النص أولاً."
  },
  {
    id:8, icon:"📝", title:"توحيد النصوص", en:"String Normalization",
    category:"transform", level:"مبتدئ",
    short:"توحيد الكتابة، الحروف الكبيرة، المسافات، والإملاء — أساسي للمطابقة والتجميع.",
    desc:"النصوص أكثر ما يحتاج تنظيفاً. 'الرياض' و'رياض' و'RIYADH' قد تمثل نفس المدينة. Pandas يوفّر .str accessor قوياً لكل عمليات النصوص. مكتبة re للـ Regex تُكمّل ما لا يقدر عليه Pandas.",
    formula:"strip → lower → replace → regex → mapping",
    code:`import pandas as pd
import re

df = pd.read_csv('data.csv')

# التنظيف الأساسي
df['name'] = (
    df['name']
    .str.strip()              # إزالة المسافات الزائدة
    .str.lower()              # حروف صغيرة
    .str.replace(r'\s+', ' ', regex=True)  # مسافات مزدوجة
)

# توحيد التصنيفات
city_map = {
    'الرياض': 'الرياض', 'رياض': 'الرياض', 'riyadh': 'الرياض',
    'جدة': 'جدة', 'jeddah': 'جدة', 'jda': 'جدة',
}
df['city'] = df['city'].str.strip().str.lower().map(city_map)

# استخراج بـ Regex
df['phone_clean'] = df['phone'].str.extract(r'(\d{10})')`,
    example:"💡 'ahmed' و'Ahmed' و'AHMED' → كلها نفس الشخص بعد .str.lower()"
  },
  {
    id:9, icon:"📅", title:"معالجة التواريخ", en:"Date Parsing",
    category:"transform", level:"متوسط",
    short:"تحويل النصوص إلى datetime لاستخراج اليوم والشهر والسنة وحساب الفروق الزمنية.",
    desc:"التواريخ المخزّنة كنص عديمة الفائدة للتحليل الزمني. بعد التحويل لـ datetime تستطيع استخراج مكونات الوقت، فلترة بالنطاق، حساب فترات، وإعادة التجميع بالأسبوع أو الشهر أو الربع.",
    formula:"pd.to_datetime(col, format='%Y-%m-%d', errors='coerce')",
    code:`import pandas as pd

df = pd.read_csv('data.csv')

# تحويل التاريخ (errors='coerce' يحوّل الخاطئ لـ NaT)
df['hire_date'] = pd.to_datetime(df['hire_date'], errors='coerce')
df['birth_date'] = pd.to_datetime(df['birth_date'], format='%d/%m/%Y')

# استخراج المكونات
df['hire_year']  = df['hire_date'].dt.year
df['hire_month'] = df['hire_date'].dt.month
df['hire_day']   = df['hire_date'].dt.day_name()

# حساب العمر والمدة
today = pd.Timestamp.today()
df['age']     = (today - df['birth_date']).dt.days // 365
df['seniority'] = (today - df['hire_date']).dt.days // 365`,
    example:"💡 'hire_date' كنص → بعد التحويل تستطيع تصفية 'الموظفين الذين بدأوا في 2020' بسطر واحد."
  },
  {
    id:10, icon:"🔢", title:"تشفير الفئات", en:"Categorical Encoding",
    category:"transform", level:"متوسط",
    short:"تحويل النصوص الفئوية لأرقام — ضروري لمعظم نماذج تعلم الآلة.",
    desc:"نماذج تعلم الآلة تحتاج أرقاماً. اختيار طريقة التشفير مهم: Label Encoding للفئات ذات ترتيب طبيعي (صغير/متوسط/كبير)، One-Hot للفئات المتساوية (مدينة/جنسية)، Target Encoding للفئات عالية الكثافة.",
    formula:"Label: {A:0, B:1, C:2} | One-Hot: A=[1,0,0], B=[0,1,0]",
    code:`import pandas as pd
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder

df = pd.read_csv('data.csv')

# One-Hot Encoding (للفئات بدون ترتيب)
df = pd.get_dummies(df, columns=['city', 'department'], drop_first=True)

# Label Encoding (للفئات ذات ترتيب)
le = LabelEncoder()
df['gender_enc'] = le.fit_transform(df['gender'])

# Ordinal Encoding (مع تحديد الترتيب)
oe = OrdinalEncoder(categories=[['Junior', 'Mid', 'Senior']])
df['level_enc'] = oe.fit_transform(df[['level']])

# Map يدوي (الأوضح والأبسط)
df['status_enc'] = df['status'].map({'inactive': 0, 'active': 1})`,
    example:"💡 عمود 'الحجم': صغير/متوسط/كبير → Label Encoding (0/1/2) لأن الترتيب مهم."
  },
  {
    id:11, icon:"📊", title:"تحجيم البيانات", en:"Feature Scaling",
    category:"transform", level:"متوسط",
    short:"توحيد نطاق الأرقام — ضروري للخوارزميات المعتمدة على المسافة والتدرج.",
    desc:"خوارزميات مثل KNN وSVM وشبكات عصبية تتأثر بنطاق الأرقام. راتب 50,000 وعمر 30 — الراتب سيطغى على النموذج. Standard Scaler مناسب للتوزيعات الطبيعية، MinMax للنطاقات المعروفة، Robust للبيانات ذات شذوذ كثير.",
    formula:"Standard: z=(x−μ)/σ | MinMax: x'=(x−min)/(max−min)",
    code:`import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.model_selection import train_test_split

df = pd.read_csv('data.csv')
features = ['age', 'salary', 'experience']

X_train, X_test = train_test_split(df[features], test_size=0.2)

# Standard Scaler (μ=0, σ=1)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # fit على التدريب فقط!
X_test_scaled  = scaler.transform(X_test)        # transform فقط على الاختبار

# MinMaxScaler (النطاق 0-1)
mm = MinMaxScaler()
X_scaled = mm.fit_transform(X_train)

# RobustScaler (للبيانات ذات شذوذ كثير)
rs = RobustScaler()
X_scaled = rs.fit_transform(X_train)`,
    example:"💡 تحذير: دائماً fit على بيانات التدريب فقط، ثم transform على الاختبار — لتجنب data leakage."
  },
  {
    id:12, icon:"⚗️", title:"هندسة الميزات", en:"Feature Engineering",
    category:"transform", level:"متوسط",
    short:"إنشاء أعمدة جديدة من البيانات الموجودة لمساعدة النماذج على التعلم بشكل أفضل.",
    desc:"النماذج تتعلم من الميزات التي تُعطيها. أحياناً الميزة الجديدة تحسّن الأداء أكثر من تعديل الخوارزمية. أمثلة: عمر الموظف من تاريخ الميلاد، نسبة الربح من الإيراد والتكلفة، تصنيف رقمي لفئة نصية.",
    formula:"ميزة جديدة = دالة (ميزات موجودة)",
    code:`import pandas as pd
import numpy as np

df = pd.read_csv('data.csv')
df['hire_date'] = pd.to_datetime(df['hire_date'])

# من التواريخ
today = pd.Timestamp.today()
df['seniority_years'] = (today - df['hire_date']).dt.days // 365
df['is_senior']       = (df['seniority_years'] >= 5).astype(int)

# من الأرقام
df['salary_age_ratio'] = df['salary'] / df['age']
df['log_salary']       = np.log1p(df['salary'])  # لتقليل التفاوت الكبير

# فئات من أرقام
df['age_group'] = pd.cut(
    df['age'],
    bins=[18, 25, 35, 45, 100],
    labels=['شاب', 'متوسط', 'ناضج', 'خبير']
)`,
    example:"💡 بدل إعطاء النموذج 'تاريخ التوظيف'، أعطه 'عدد سنوات الخبرة' — أكثر معنى مباشرة."
  },
  {
    id:13, icon:"🔬", title:"تشخيص البيانات", en:"Data Profiling",
    category:"validate", level:"مبتدئ",
    short:"فحص شامل لجودة البيانات قبل أي معالجة — الخطوة الأولى دائماً.",
    desc:"قبل أن تُنظّف، افهم ما أمامك. التشخيص يكشف التوزيعات، الأنماط، المفقودة، والعلاقات. مكتبة ydata-profiling (سابقاً pandas-profiling) تُولّد تقريراً كاملاً بسطر واحد. هذه الخطوة توفّر ساعات من التخمين.",
    formula:"لا تُنظّف قبل أن تفهم — البيانات تحكي قصة",
    code:`import pandas as pd

df = pd.read_csv('data.csv')

# ─── تشخيص يدوي سريع ───
print("=== الحجم ===")
print(df.shape)

print("\n=== الأنواع ===")
print(df.dtypes)

print("\n=== الإحصاء ===")
print(df.describe(include='all'))

print("\n=== المفقودة ===")
missing = df.isnull().mean() * 100
print(missing[missing > 0].sort_values(ascending=False))

print("\n=== التكرارات ===")
print(f"كاملة: {df.duplicated().sum()}")

# ─── تقرير تلقائي ───
# pip install ydata-profiling
from ydata_profiling import ProfileReport
report = ProfileReport(df, title="تقرير البيانات")
report.to_file("report.html")`,
    example:"💡 يdata-profiling يكشف في ثوانٍ: توزيعات، ارتباطات، مفقودة، وتحذيرات — لا تبدأ بدونه!"
  },
  {
    id:14, icon:"⚠️", title:"التحقق من الصحة", en:"Data Validation",
    category:"validate", level:"متوسط",
    short:"التحقق من أن البيانات منطقية وضمن النطاقات المسموحة — قبل وبعد التنظيف.",
    desc:"التحقق يتجاوز اكتشاف المفقودة — هل العمر بين 18 و120؟ هل الراتب موجب؟ هل الكود البريدي 5 أرقام؟ مكتبة Great Expectations وPandera تتيح تعريف قواعد التحقق كود وتشغيلها على أي بيانات جديدة تلقائياً.",
    formula:"التحقق = قواعد أعمال + قيود منطقية + اتساق العلاقات",
    code:`import pandas as pd
import pandera as pa
from pandera import Column, DataFrameSchema, Check

df = pd.read_csv('data.csv')

# تحقق يدوي
issues = []
if (df['age'] < 18).any():
    issues.append("عمر أقل من 18")
if (df['salary'] < 0).any():
    issues.append("راتب سالب")
if df['email'].duplicated().any():
    issues.append("إيميلات مكررة")
print("مشاكل:", issues)

# تحقق بـ Pandera
schema = DataFrameSchema({
    'age':    Column(int,   Check.between(18, 120)),
    'salary': Column(float, Check.greater_than(0)),
    'email':  Column(str,   Check.str_matches(r'.+@.+\..+')),
})
schema.validate(df)  # يرمي خطأ إذا فشل`,
    example:"💡 موظف عمره 5 سنوات في بياناتك؟ التحقق يكشفه فوراً ويمنعه من الوصول للنموذج."
  },
  {
    id:15, icon:"🔗", title:"دمج البيانات", en:"Merging & Joining",
    category:"validate", level:"متوسط",
    short:"ربط جداول متعددة بمفتاح مشترك — أساس العمل مع قواعد بيانات متعددة.",
    desc:"الدمج في Pandas يشبه SQL JOIN. inner join يحتفظ بالتطابقات فقط، left join يحتفظ بكل اليسار، outer join بكل منهما. بعد الدمج تحقق من الحجم: هل زاد غير متوقع؟ قد تكون مفاتيح مكررة تسبب تكاثر الصفوف (Fanout).",
    formula:"pd.merge(df1, df2, on='key', how='inner/left/right/outer')",
    code:`import pandas as pd

employees = pd.read_csv('employees.csv')   # id, name, dept_id
departments = pd.read_csv('departments.csv')  # dept_id, dept_name

# Inner Join
merged = pd.merge(employees, departments, on='dept_id', how='inner')

# Left Join (احتفظ بكل الموظفين حتى بدون قسم)
merged = pd.merge(employees, departments, on='dept_id', how='left')

# فحص ما بعد الدمج
print(f"قبل: {len(employees)} موظف")
print(f"بعد: {len(merged)} صف")  # هل تضاعف؟

# اكتشاف مفاتيح مكررة (Fanout)
if len(merged) > len(employees):
    print("⚠️ تكاثر — المفتاح غير فريد في الجدول الثاني!")`,
    example:"💡 دمج بيانات المبيعات مع بيانات المنتجات — تحقق أن رقم المنتج فريد في جدول المنتجات أولاً."
  },
  {
    id:16, icon:"🏗️", title:"خط أنابيب التنظيف", en:"Cleaning Pipeline",
    category:"validate", level:"متقدم",
    short:"تحويل خطوات التنظيف لكود قابل للإعادة والتطبيق على بيانات جديدة — الاحتراف الحقيقي.",
    desc:"كتابة خطوات التنظيف كدوال ودمجها في Pipeline يضمن الاتساق، يُسهّل الاختبار، ويمكّن التطبيق التلقائي على بيانات الإنتاج. Scikit-learn Pipeline يدمج المعالجة مع النموذج في خطوة واحدة.",
    formula:"Pipeline = خطوة1 → خطوة2 → ... → النموذج",
    code:`import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer

# تعريف الأعمدة
num_cols = ['age', 'salary', 'experience']
cat_cols = ['city', 'department']

# Pipeline للأعمدة الرقمية
num_pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler',  StandardScaler()),
])

# Pipeline للأعمدة الفئوية
cat_pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore')),
])

# دمج الكل
preprocessor = ColumnTransformer([
    ('num', num_pipeline, num_cols),
    ('cat', cat_pipeline, cat_cols),
])

# تطبيق على بيانات جديدة — نفس الخطوات تلقائياً
X_train_clean = preprocessor.fit_transform(X_train)
X_test_clean  = preprocessor.transform(X_test)`,
    example:"💡 Pipeline = وصفة مكتوبة — أعطها بيانات جديدة فتُعيد نفس التنظيف بدقة وبدون أخطاء."
  }
];

/* ─────────────────────────────────────────── */

const PROCESS_STEPS = [
  {
    num:"01", icon:"🔬", title:"التشخيص الأولي",
    desc:"اكتشف ما أمامك قبل أن تبدأ — البيانات تحكي قصة.",
    details:[
      "df.info() و df.describe()",
      "رسم خريطة القيم المفقودة",
      "فحص أنواع البيانات",
      "تقرير ydata-profiling الشامل"
    ],
    tools:["Pandas", "ydata-profiling", "Matplotlib", "Seaborn"],
    time:"10-15%"
  },
  {
    num:"02", icon:"❓", title:"معالجة القيم المفقودة",
    desc:"اتخذ قراراً لكل عمود بناءً على طبيعة الغياب ونسبته.",
    details:[
      "احسب نسبة المفقودة لكل عمود",
      "< 5%: احذف الصفوف بأمان",
      "5-30%: عبّئ بوسيط/منوال/KNN",
      "> 30%: فكّر في حذف العمود"
    ],
    tools:["Pandas dropna()", "SimpleImputer", "KNNImputer", "MICE"],
    time:"20-25%"
  },
  {
    num:"03", icon:"🔁", title:"إزالة التكرارات",
    desc:"حدد مفتاح التكرار بدقة ثم احسم القرار.",
    details:[
      "تكرارات كاملة: drop_duplicates()",
      "تكرارات جزئية: حدد subset",
      "keep='first' أو 'last' بحسب السياق",
      "تحقق من الحجم قبل وبعد"
    ],
    tools:["Pandas duplicated()", "drop_duplicates()", "Record Linkage"],
    time:"10%"
  },
  {
    num:"04", icon:"🚨", title:"كشف الشذوذ ومعالجته",
    desc:"اكتشف القيم الشاذة ثم اتخذ قراراً مدروساً.",
    details:[
      "IQR للتوزيعات المنحرفة",
      "Z-Score للتوزيعات الطبيعية",
      "Visualization: boxplot وhistogram",
      "قرار: حذف، تحديد (clip)، أو الإبقاء"
    ],
    tools:["IQR", "Z-Score", "Seaborn boxplot", "Isolation Forest"],
    time:"15-20%"
  },
  {
    num:"05", icon:"🔄", title:"التحويل وتوحيد الصيغ",
    desc:"حوّل البيانات للنوع الصحيح وأضف الميزات المفيدة.",
    details:[
      "تصحيح أنواع البيانات (astype)",
      "توحيد النصوص (strip/lower/replace)",
      "تحويل التواريخ (to_datetime)",
      "Encoding وScaling وهندسة الميزات"
    ],
    tools:["Pandas str", "to_datetime()", "LabelEncoder", "StandardScaler"],
    time:"25-30%"
  },
  {
    num:"06", icon:"✅", title:"التحقق النهائي والتوثيق",
    desc:"تأكد من جودة البيانات وبنِ Pipeline قابلاً للإعادة.",
    details:[
      "df.describe() بعد التنظيف — هل المنطق سليم؟",
      "فحص المفقودة مرة أخرى",
      "تشغيل قواعد التحقق (Pandera)",
      "بنِ Pipeline لبيانات الإنتاج"
    ],
    tools:["Pandera", "Great Expectations", "sklearn Pipeline", "dbt"],
    time:"10%"
  }
];

/* ─────────────────────────────────────────── */

const CASE_STEPS = [
  {
    step:1, icon:"📋", title:"المشكلة",
    content:"قسم الموارد البشرية يريد تحليل بيانات الموظفين لفهم معدلات الاستقالة. البيانات مستخرجة من 3 أنظمة مختلفة تم دمجها يدوياً على مدار سنوات.",
    code:null,
    insight:"🎯 التحدي: بيانات من 3 مصادر = تنسيقات مختلفة، تكرارات، وقيم مفقودة كثيرة."
  },
  {
    step:2, icon:"🔬", title:"التشخيص الأولي",
    content:"أول نظرة على البيانات — 1,200 موظف، 14 عمود.",
    code:`import pandas as pd
df = pd.read_csv('hr_data.csv')

print(df.shape)        # (1200, 14)
print(df.dtypes)
print(df.isnull().mean() * 100)
# salary        : 18.3% مفقودة
# birth_date    :  8.7% مفقودة
# department    :  2.1% مفقودة
# manager_id    : 31.0% مفقودة  ← عمود مشكلة

print(df.duplicated().sum())  # 47 تكراراً`,
    insight:"⚠️ اكتشفنا: manager_id مفقودة 31% — قرار: نحذف العمود كاملاً. salary يحتاج imputation."
  },
  {
    step:3, icon:"🔁", title:"إزالة التكرارات",
    content:"47 صفاً مكرراً — ظهرت من دمج البيانات اليدوي.",
    code:`# التحقق من التكرارات
dupes = df[df.duplicated(subset=['employee_id'], keep=False)]
print(f"الصفوف المكررة: {len(dupes)}")

# الاحتفاظ بآخر إدخال (الأحدث)
df.drop_duplicates(
    subset=['employee_id'],
    keep='last',
    inplace=True
)
print(f"بعد الإزالة: {len(df)} موظف")  # 1,153`,
    insight:"✅ تم حذف 47 تكراراً — اخترنا 'last' لأن آخر إدخال يحتوي البيانات الأحدث."
  },
  {
    step:4, icon:"❓", title:"معالجة القيم المفقودة",
    content:"معالجة كل عمود بقرار مدروس بناءً على طبيعة البيانات.",
    code:`# إسقاط العمود ذو المفقودة الكثيرة
df.drop(columns=['manager_id'], inplace=True)

# salary: وسيط حسب القسم (أذكى من الوسيط الكلي)
df['salary'] = df.groupby('department')['salary']\
    .transform(lambda x: x.fillna(x.median()))

# birth_date: إسقاط الصفوف (8.7% فقط)
df.dropna(subset=['birth_date'], inplace=True)

# department: منوال الكل
df['department'].fillna(df['department'].mode()[0], inplace=True)

print(df.isnull().sum().sum())  # 0 — لا مفقودة`,
    insight:"✅ الوسيط حسب القسم أدق بكثير من الوسيط الكلي — راتب مبرمج ≠ راتب محاسب."
  },
  {
    step:5, icon:"🔄", title:"التوحيد والتحويل",
    content:"تنظيف الأنواع والتناقضات الموجودة في البيانات.",
    code:`# تصحيح التواريخ
df['hire_date']  = pd.to_datetime(df['hire_date'], errors='coerce')
df['birth_date'] = pd.to_datetime(df['birth_date'], errors='coerce')

# هندسة الميزات
today = pd.Timestamp.today()
df['age']         = (today - df['birth_date']).dt.days // 365
df['seniority']   = (today - df['hire_date']).dt.days // 365

# توحيد الجنس (3 أشكال مختلفة في البيانات)
df['gender'] = df['gender'].str.strip().str.lower()\
    .map({'m':'ذكر','male':'ذكر','f':'أنثى','female':'أنثى'})

# الراتب: إزالة الرموز
df['salary'] = df['salary'].astype(str)\
    .str.replace(',','').str.replace(' SAR','').astype(float)`,
    insight:"🎯 اكتشفنا 'male' و'Male' و'M' كلها تعني نفس الشيء — 180 صفاً كانت ستتجاهلها أي مجموعة!"
  },
  {
    step:6, icon:"🚨", title:"كشف الشذوذ والتحقق",
    content:"فحص أخير للتأكد من منطقية البيانات.",
    code:`import numpy as np

# شذوذ في الراتب
Q1 = df['salary'].quantile(0.25)
Q3 = df['salary'].quantile(0.75)
IQR = Q3 - Q1
outliers = df[
    (df['salary'] < Q1 - 1.5*IQR) |
    (df['salary'] > Q3 + 1.5*IQR)
]
print(f"رواتب شاذة: {len(outliers)}")  # 12

# تحقق منطقي
print((df['age'] < 18).sum())     # 0 ✅
print((df['salary'] < 0).sum())   # 0 ✅
print((df['seniority'] < 0).sum()) # 0 ✅`,
    insight:"✅ 12 راتباً شاذاً — بعد التحقق اليدوي: 8 أخطاء إدخال، 4 حقيقية (مدراء تنفيذيون). احتفظنا بها."
  }
];

/* ─────────────────────────────────────────── */

const CHEAT_SHEETS = [
  {
    title:"🔬 التشخيص الأولي",
    code:`import pandas as pd

df = pd.read_csv('data.csv')

# الحجم والأنواع
df.shape            # (صفوف, أعمدة)
df.dtypes           # أنواع البيانات
df.info()           # نظرة شاملة

# الإحصاء الوصفي
df.describe()                   # للأرقام
df.describe(include='object')   # للنصوص

# المفقودة
df.isnull().sum()               # العدد
df.isnull().mean() * 100        # النسبة %

# التكرارات
df.duplicated().sum()                     # كاملة
df.duplicated(subset=['id']).sum()        # جزئية

# الفريدة لكل عمود
df.nunique()
df['col'].value_counts()`
  },
  {
    title:"❓ معالجة القيم المفقودة",
    code:`import pandas as pd
from sklearn.impute import SimpleImputer, KNNImputer

# الحذف
df.dropna()                          # أي مفقودة
df.dropna(how='all')                 # كلها مفقودة
df.dropna(thresh=3)                  # أقل من 3 موجودة
df.dropna(subset=['age','salary'])   # بأعمدة محددة

# التعبئة
df['col'].fillna(0)                                 # بصفر
df['col'].fillna('غير محدد')                        # بنص
df['col'].fillna(df['col'].mean())                  # بالمتوسط
df['col'].fillna(df['col'].median())                # بالوسيط
df['col'].fillna(df['col'].mode()[0])               # بالمنوال
df['col'].fillna(method='ffill')                    # تعبئة للأمام
df.groupby('dept')['sal'].transform(
    lambda x: x.fillna(x.median()))                # وسيط حسب مجموعة

# KNN
imp = KNNImputer(n_neighbors=5)
df_filled = pd.DataFrame(imp.fit_transform(df), columns=df.columns)`
  },
  {
    title:"🚨 اكتشاف الشذوذ ومعالجته",
    code:`import pandas as pd
import numpy as np
from scipy import stats

# IQR
Q1  = df['col'].quantile(0.25)
Q3  = df['col'].quantile(0.75)
IQR = Q3 - Q1
lower, upper = Q1 - 1.5*IQR, Q3 + 1.5*IQR

# اكتشاف
outliers = df[(df['col'] < lower) | (df['col'] > upper)]

# حذف
df_clean = df[(df['col'] >= lower) & (df['col'] <= upper)]

# تحديد (Capping) — أذكى من الحذف
df['col'] = df['col'].clip(lower=lower, upper=upper)

# Z-Score
z = np.abs(stats.zscore(df['col'].dropna()))
df_clean = df[z <= 3]

# Boxplot للتصوير
import seaborn as sns
sns.boxplot(x=df['col'])`
  },
  {
    title:"🔄 تحويل أنواع البيانات",
    code:`import pandas as pd

# تحويل الأنواع
df['age']     = df['age'].astype(int)
df['price']   = df['price'].astype(float)
df['active']  = df['active'].astype(bool)
df['cat_col'] = df['cat_col'].astype('category')

# التواريخ
df['date'] = pd.to_datetime(df['date'], errors='coerce')
df['date'] = pd.to_datetime(df['date'], format='%d/%m/%Y')

# استخراج من التاريخ
df['year']      = df['date'].dt.year
df['month']     = df['date'].dt.month
df['weekday']   = df['date'].dt.day_name()
df['days_ago']  = (pd.Timestamp.today() - df['date']).dt.days

# تنظيف الأرقام المكتوبة كنص
df['salary'] = (
    df['salary'].astype(str)
    .str.replace(',', '')
    .str.replace(' SAR', '')
    .astype(float)
)`
  },
  {
    title:"📝 توحيد النصوص",
    code:`import pandas as pd

# تنظيف أساسي
df['name'] = (
    df['name']
    .str.strip()                        # مسافات زائدة
    .str.lower()                        # حروف صغيرة
    .str.replace(r'\s+', ' ', regex=True)  # مسافات مزدوجة
)

# استبدال قيم
gender_map = {
    'm': 'ذكر', 'male': 'ذكر',
    'f': 'أنثى', 'female': 'أنثى',
}
df['gender'] = df['gender'].str.strip().str.lower().map(gender_map)

# استخراج بـ Regex
df['phone_clean'] = df['phone'].str.extract(r'(\d{10})')
df['domain']      = df['email'].str.extract(r'@(.+)')

# التحقق
df['valid_email'] = df['email'].str.match(r'.+@.+\..+')
df['valid_phone'] = df['phone'].str.match(r'^05\d{8}$')`
  },
  {
    title:"⚗️ Encoding وScaling",
    code:`import pandas as pd
from sklearn.preprocessing import (
    StandardScaler, MinMaxScaler,
    LabelEncoder, OrdinalEncoder
)

# One-Hot Encoding (للفئات بلا ترتيب)
df = pd.get_dummies(df, columns=['city', 'dept'], drop_first=True)

# Label Encoding (فئتان أو ترتيب طبيعي)
le = LabelEncoder()
df['gender_enc'] = le.fit_transform(df['gender'])

# Ordinal Encoding (مع ترتيب محدد)
oe = OrdinalEncoder(categories=[['Junior','Mid','Senior']])
df['level_enc'] = oe.fit_transform(df[['level']])

# Standard Scaler
sc = StandardScaler()
df[['age','salary']] = sc.fit_transform(df[['age','salary']])

# MinMax Scaler (النطاق 0-1)
mm = MinMaxScaler()
df[['score']] = mm.fit_transform(df[['score']])

# ⚠️ دائماً: fit على التدريب فقط، transform على الاختبار`
  }
];

/* ─────────────────────────────────────────── */

const QUIZ = [
  {
    q:"متى تستخدم dropna() بدلاً من fillna() لمعالجة القيم المفقودة؟",
    options:[
      "دائماً — الحذف أسلم من التعبئة",
      "عندما تكون نسبة المفقودة منخفضة (أقل من 5%) والقيم مفقودة بشكل عشوائي",
      "عندما تكون نسبة المفقودة عالية (أكثر من 30%)",
      "dropna وfillna يعطيان نفس النتيجة دائماً"
    ],
    correct:1,
    explanation:"الحذف آمن فقط عند نسبة منخفضة جداً ومفقودة عشوائية. عند النسب العالية يفقد الحذف معلومات ثمينة ويُحيّز التحليل — التعبئة بالوسيط أو KNN أفضل."
  },
  {
    q:"ما الفرق الجوهري بين Label Encoding وOne-Hot Encoding؟",
    options:[
      "One-Hot أسرع في التنفيذ",
      "Label Encoding للفئات ذات ترتيب طبيعي، One-Hot للفئات المتساوية بدون ترتيب",
      "Label Encoding يُستخدم فقط للنصوص الإنجليزية",
      "لا فرق بينهما في تأثيرهما على النموذج"
    ],
    correct:1,
    explanation:"Label Encoding (0,1,2...) يوحي للنموذج بترتيب بين الفئات. إذا لم يكن هناك ترتيب (مدن، أقسام) استخدم One-Hot لتجنب هذا الوهم الرياضي."
  },
  {
    q:"لماذا يجب أن تطبّق StandardScaler على بيانات التدريب فقط ثم تستخدم transform على الاختبار؟",
    options:[
      "لتوفير وقت الحساب",
      "لأن scaler.fit على الاختبار يُعطي نتائج أدق",
      "لمنع تسرب المعلومات (Data Leakage) من بيانات الاختبار للنموذج",
      "كلاهما صحيح — الفرق في السرعة فقط"
    ],
    correct:2,
    explanation:"إذا فعلت fit على كل البيانات، فالنموذج 'يرى' إحصاءات الاختبار ضمنياً — وهذا غش! يجب أن تكون بيانات الاختبار مجهولة تماماً حتى تحصل على تقييم حقيقي."
  },
  {
    q:"متى تختار طريقة IQR على Z-Score لكشف القيم الشاذة؟",
    options:[
      "دائماً — IQR أفضل في كل الحالات",
      "عندما تكون البيانات تتبع التوزيع الطبيعي",
      "عندما البيانات منحرفة أو تحتوي قيم شاذة كثيرة (IQR أقل تأثراً بها)",
      "Z-Score أفضل دائماً لأنه يستخدم الانحراف المعياري"
    ],
    correct:2,
    explanation:"Z-Score يفترض التوزيع الطبيعي ويتأثر بالشذوذ نفسه الذي يحاول اكتشافه! IQR يعتمد على الربيعيات وهو أكثر مقاومة — الخيار الأفضل للبيانات الواقعية غير الطبيعية."
  },
  {
    q:"ما المشكلة إذا زاد حجم البيانات بعد دمج (merge) جدولين؟",
    options:[
      "لا مشكلة — زيادة الحجم طبيعية بعد الدمج",
      "المفتاح المستخدم في الدمج غير فريد في أحد الجدولين (Fanout) مما أنشأ صفوفاً مكررة",
      "ذاكرة الكمبيوتر غير كافية",
      "تنسيق الملف غير صحيح"
    ],
    correct:1,
    explanation:"إذا كان 'dept_id' في جدول الأقسام مكرراً، فكل موظف سيُربط بكل الأقسام المتطابقة — ينتج صفوف اصطناعية. تحقق دائماً: هل المفتاح فريد في الجدول الثاني قبل الدمج؟"
  }
];

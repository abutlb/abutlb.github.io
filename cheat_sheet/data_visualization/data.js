/* ============================================================
   DATA.JS — Data Visualization CheatSheet
============================================================ */

/* ══════════════════════════════════════════
   TERMS
══════════════════════════════════════════ */
const TERMS = [
  {
    id: 1,
    icon: "📊",
    title: "المخطط الشريطي",
    en: "Bar Chart",
    category: "charts",
    level: "مبتدئ",
    short: "أفضل طريقة لمقارنة قيم فئات مختلفة — أفقي أو عمودي.",
    desc: "المخطط الشريطي يُستخدم لمقارنة قيم فئات منفصلة. العمودي (Vertical) للمقارنة العامة، الأفقي (Horizontal) عندما تكون أسماء الفئات طويلة. يجب أن يبدأ المحور Y من الصفر دائماً.",
    code: `import matplotlib.pyplot as plt
import numpy as np

categories = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو']
values     = [45, 62, 38, 71, 55]
colors     = ['#6366f1' if v == max(values) else '#94a3b8' for v in values]

fig, ax = plt.subplots(figsize=(9, 5))
bars = ax.bar(categories, values, color=colors,
              edgecolor='white', linewidth=1.5, width=0.6)

# إضافة القيم فوق الأعمدة
for bar, val in zip(bars, values):
    ax.text(bar.get_x() + bar.get_width()/2,
            bar.get_height() + 1,
            str(val), ha='center', va='bottom',
            fontsize=10, fontweight='bold')

ax.set_title('المبيعات الشهرية', fontsize=14, fontweight='bold', pad=15)
ax.set_ylabel('المبيعات (ألف ريال)')
ax.set_ylim(0, max(values) * 1.2)
ax.spines[['top', 'right']].set_visible(False)
ax.grid(axis='y', alpha=0.3, linestyle='--')
plt.tight_layout()
plt.show()`,
    example: "مقارنة مبيعات 5 فروع — المخطط الشريطي يوضح الفرق بوضوح دفعة واحدة."
  },
  {
    id: 2,
    icon: "📈",
    title: "المخطط الخطي",
    en: "Line Chart",
    category: "charts",
    level: "مبتدئ",
    short: "الأمثل لعرض الاتجاهات عبر الزمن — يُظهر الصعود والهبوط بوضوح.",
    desc: "المخطط الخطي مثالي للبيانات الزمنية المتسلسلة. يُظهر الاتجاه (Trend) والتذبذب (Volatility). يمكن رسم خطوط متعددة للمقارنة بين سلاسل زمنية مختلفة.",
    code: `import matplotlib.pyplot as plt
import numpy as np

months  = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
sales   = [45, 52, 48, 70, 65, 80]
targets = [50, 55, 55, 60, 65, 70]

fig, ax = plt.subplots(figsize=(10, 5))

ax.plot(months, sales,   'o-', color='#6366f1', linewidth=2.5,
        markersize=7, label='الفعلي', zorder=3)
ax.plot(months, targets, 's--', color='#94a3b8', linewidth=1.8,
        markersize=6, label='المستهدف', zorder=2)

# تظليل المنطقة تحت الخط
ax.fill_between(months, sales, alpha=0.1, color='#6366f1')

ax.set_title('الأداء مقابل الهدف', fontsize=14, fontweight='bold')
ax.legend(loc='upper left')
ax.spines[['top', 'right']].set_visible(False)
ax.grid(alpha=0.3, linestyle='--')
plt.tight_layout()
plt.show()`,
    example: "تتبع نمو المستخدمين شهرياً — الخط يكشف الاتجاه العام بسرعة."
  },
  {
    id: 3,
    icon: "🥧",
    title: "المخطط الدائري",
    en: "Pie / Donut Chart",
    category: "charts",
    level: "مبتدئ",
    short: "لعرض النسب المئوية — استخدمه فقط مع 5 فئات أو أقل.",
    desc: "المخطط الدائري يُظهر نسبة كل فئة من الإجمالي. القاعدة الذهبية: لا تستخدمه مع أكثر من 5 فئات. Donut Chart (الحلقي) أحدث وأوضح للقراءة.",
    code: `import matplotlib.pyplot as plt

labels  = ['منتج A', 'منتج B', 'منتج C', 'منتج D', 'أخرى']
sizes   = [35, 25, 20, 12, 8]
colors  = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e2e8f0']
explode = (0.05, 0, 0, 0, 0)  # إبراز الأكبر

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Pie عادي
ax1.pie(sizes, labels=labels, colors=colors,
        explode=explode, autopct='%1.1f%%',
        startangle=90, pctdistance=0.85)
ax1.set_title('Pie Chart')

# Donut
wedges, texts, autotexts = ax2.pie(
    sizes, labels=labels, colors=colors,
    autopct='%1.1f%%', startangle=90,
    wedgeprops=dict(width=0.5))
ax2.set_title('Donut Chart')

plt.tight_layout()
plt.show()`,
    example: "توزيع حصص السوق بين 4 شركات — الدائري يُظهر الهيمنة بوضوح."
  },
  {
    id: 4,
    icon: "🔵",
    title: "مخطط التشتت",
    en: "Scatter Plot",
    category: "charts",
    level: "متوسط",
    short: "يكشف العلاقة بين متغيرين — هل هي طردية أم عكسية أم لا علاقة؟",
    desc: "Scatter Plot يُظهر العلاقة (Correlation) بين متغيرين. كل نقطة تمثل مشاهدة واحدة. يمكن إضافة بُعد ثالث عبر حجم النقاط (Bubble Chart) أو لونها.",
    code: `import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
n = 100

# بيانات بعلاقة طردية + ضوضاء
x = np.random.uniform(20, 80, n)
y = 2.5 * x + np.random.normal(0, 15, n)

# تلوين بالقيمة
colors = y / y.max()

fig, ax = plt.subplots(figsize=(8, 6))
scatter = ax.scatter(x, y, c=colors, cmap='viridis',
                     s=60, alpha=0.7, edgecolors='white',
                     linewidth=0.5)

# خط الانحدار
m, b = np.polyfit(x, y, 1)
x_line = np.linspace(x.min(), x.max(), 100)
ax.plot(x_line, m * x_line + b, 'r--',
        linewidth=2, label=f'y = {m:.1f}x + {b:.0f}')

plt.colorbar(scatter, ax=ax, label='القيمة')
ax.set_xlabel('المتغير X')
ax.set_ylabel('المتغير Y')
ax.set_title('مخطط التشتت مع خط الانحدار')
ax.legend()
ax.spines[['top', 'right']].set_visible(False)
plt.tight_layout()
plt.show()`,
    example: "العلاقة بين الإنفاق الإعلاني والمبيعات — هل الإعلان يؤثر فعلاً؟"
  },
  {
    id: 5,
    icon: "📦",
    title: "مخطط الصندوق",
    en: "Box Plot",
    category: "charts",
    level: "متوسط",
    short: "يُلخص التوزيع الإحصائي كاملاً — الوسيط والربيعيات والشذوذ.",
    desc: "Box Plot يعرض: الوسيط (الخط الأوسط)، الربيع الأول Q1 والثالث Q3 (الصندوق)، المدى الكلي (الخطوط)، والقيم الشاذة (النقاط). مثالي لمقارنة توزيعات متعددة.",
    code: `import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
data = {
    'قسم A': np.random.normal(75, 10, 100),
    'قسم B': np.random.normal(65, 15, 100),
    'قسم C': np.random.normal(80,  8, 100),
    'قسم D': np.random.normal(70, 20, 100),
}

fig, ax = plt.subplots(figsize=(9, 6))

bp = ax.boxplot(data.values(), labels=data.keys(),
                patch_artist=True, notch=False,
                medianprops=dict(color='white', linewidth=2))

colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd']
for patch, color in zip(bp['boxes'], colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.8)

ax.set_title('مقارنة أداء الأقسام', fontsize=14, fontweight='bold')
ax.set_ylabel('درجة الأداء')
ax.spines[['top', 'right']].set_visible(False)
ax.grid(axis='y', alpha=0.3, linestyle='--')
plt.tight_layout()
plt.show()`,
    example: "مقارنة رواتب 4 أقسام — الصندوق يكشف التباين والشذوذ دفعة واحدة."
  },
  {
    id: 6,
    icon: "🌡️",
    title: "خريطة الحرارة",
    en: "Heatmap",
    category: "charts",
    level: "متوسط",
    short: "تصوير مصفوفة البيانات بالألوان — مثالية لمصفوفة الارتباط.",
    desc: "Heatmap تُحوّل الأرقام إلى ألوان لكشف الأنماط في مصفوفة البيانات. الاستخدام الأشهر: مصفوفة الارتباط بين المتغيرات، وأنماط الاستخدام الزمني.",
    code: `import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd

# مصفوفة ارتباط وهمية
features = ['السعر', 'الجودة', 'التقييم', 'المبيعات', 'الإعلان']
np.random.seed(42)
data = np.random.rand(5, 5)
corr = (data + data.T) / 2
np.fill_diagonal(corr, 1)

df_corr = pd.DataFrame(corr, index=features, columns=features)

fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(df_corr,
            annot=True, fmt='.2f',
            cmap='RdYlGn',
            vmin=-1, vmax=1,
            center=0,
            square=True,
            linewidths=0.5,
            ax=ax)

ax.set_title('مصفوفة الارتباط', fontsize=14,
             fontweight='bold', pad=15)
plt.tight_layout()
plt.show()`,
    example: "مصفوفة الارتباط بين 10 متغيرات — الألوان تكشف العلاقات القوية فوراً."
  },
  {
    id: 7,
    icon: "📉",
    title: "الهيستوغرام",
    en: "Histogram",
    category: "charts",
    level: "مبتدئ",
    short: "يُظهر توزيع متغير واحد — هل البيانات طبيعية أم منحرفة؟",
    desc: "Histogram يُقسّم البيانات إلى فترات (Bins) ويعرض تكرار كل فترة. يكشف شكل التوزيع: طبيعي، منحرف يميناً/يساراً، أو ثنائي القمة. اختيار عدد الـ Bins مهم جداً.",
    code: `import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

np.random.seed(42)
data = np.concatenate([
    np.random.normal(60, 10, 700),
    np.random.normal(85, 8,  300)
])

fig, ax = plt.subplots(figsize=(9, 5))

n, bins, patches = ax.hist(data, bins=30,
                            color='#6366f1', alpha=0.7,
                            edgecolor='white', linewidth=0.5,
                            density=True)

# منحنى KDE
kde_x = np.linspace(data.min(), data.max(), 300)
kde   = stats.gaussian_kde(data)
ax.plot(kde_x, kde(kde_x), 'r-', linewidth=2.5, label='KDE')

# خطوط المتوسط والوسيط
ax.axvline(data.mean(),   color='#f59e0b', linestyle='--',
           linewidth=2, label=f'المتوسط: {data.mean():.1f}')
ax.axvline(np.median(data), color='#10b981', linestyle='-.',
           linewidth=2, label=f'الوسيط: {np.median(data):.1f}')

ax.set_title('توزيع الدرجات', fontsize=14, fontweight='bold')
ax.set_xlabel('الدرجة')
ax.set_ylabel('الكثافة')
ax.legend()
ax.spines[['top', 'right']].set_visible(False)
plt.tight_layout()
plt.show()`,
    example: "توزيع درجات الطلاب — الهيستوغرام يكشف إذا كان التوزيع طبيعياً أم لا."
  },
  {
    id: 8,
    icon: "🎨",
    title: "مبادئ التصميم",
    en: "Design Principles",
    category: "design",
    level: "متوسط",
    short: "قواعد تحويل المخطط من مجرد رسم إلى قصة بصرية مقنعة.",
    desc: "مبادئ تصوير البيانات الفعّال: تقليل الحبر غير الضروري (Data-Ink Ratio)، اختيار الألوان بعناية، الوضوح قبل الجمال، وتوجيه عين القارئ نحو الرسالة الرئيسية.",
    code: `import matplotlib.pyplot as plt
import matplotlib as mpl

# ── ثيم احترافي مخصص ──
plt.rcParams.update({
    'figure.facecolor':  '#0f172a',
    'axes.facecolor':    '#1e293b',
    'axes.edgecolor':    '#334155',
    'axes.labelcolor':   '#94a3b8',
    'xtick.color':       '#64748b',
    'ytick.color':       '#64748b',
    'text.color':        '#e2e8f0',
    'grid.color':        '#334155',
    'grid.linestyle':    '--',
    'grid.alpha':        0.5,
    'font.family':       'sans-serif',
    'font.size':         11,
    'axes.titlesize':    14,
    'axes.titleweight':  'bold',
    'axes.titlepad':     15,
    'figure.dpi':        150,
})

# ── لوحة ألوان متناسقة ──
PALETTE = {
    'primary':   '#6366f1',
    'secondary': '#8b5cf6',
    'success':   '#10b981',
    'warning':   '#f59e0b',
    'danger':    '#ef4444',
    'muted':     '#64748b',
}

print("✅ الثيم الاحترافي جاهز للاستخدام")
print(f"الألوان المتاحة: {list(PALETTE.keys())}")`,
    example: "تطبيق ثيم موحد على كل المخططات يعطي تقاريرك مظهراً احترافياً متسقاً."
  },
  {
    id: 9,
    icon: "🗺️",
    title: "المخططات المتعددة",
    en: "Subplots",
    category: "layout",
    level: "متوسط",
    short: "عرض عدة مخططات في لوحة واحدة — لوحة تحكم مصغّرة.",
    desc: "Subplots تتيح عرض مخططات متعددة في شبكة منظمة. مفيدة لمقارنة جوانب مختلفة من نفس البيانات أو بناء لوحة تحكم (Dashboard) بسيطة.",
    code: `import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
sales  = [45, 62, 38, 71, 55, 80]
costs  = [30, 40, 35, 45, 38, 50]
profit = [s - c for s, c in zip(sales, costs)]
data   = np.random.normal(60, 15, 200)

fig = plt.figure(figsize=(14, 8))
fig.suptitle('لوحة تحكم المبيعات', fontsize=16,
             fontweight='bold', y=1.02)

# 1. خطي
ax1 = fig.add_subplot(2, 2, 1)
ax1.plot(months, sales, 'o-', color='#6366f1', linewidth=2)
ax1.set_title('المبيعات')
ax1.spines[['top','right']].set_visible(False)

# 2. شريطي
ax2 = fig.add_subplot(2, 2, 2)
colors = ['#10b981' if p > 0 else '#ef4444' for p in profit]
ax2.bar(months, profit, color=colors)
ax2.set_title('الأرباح')
ax2.spines[['top','right']].set_visible(False)

# 3. هيستوغرام
ax3 = fig.add_subplot(2, 2, 3)
ax3.hist(data, bins=20, color='#8b5cf6', alpha=0.7, edgecolor='white')
ax3.set_title('توزيع الدرجات')
ax3.spines[['top','right']].set_visible(False)

# 4. دائري
ax4 = fig.add_subplot(2, 2, 4)
ax4.pie([35, 25, 20, 20], labels=['A','B','C','D'],
        colors=['#6366f1','#8b5cf6','#a78bfa','#c4b5fd'],
        autopct='%1.0f%%', startangle=90)
ax4.set_title('حصص السوق')

plt.tight_layout()
plt.show()`,
    example: "لوحة تحكم بـ 4 مخططات تعطي صورة شاملة عن الأداء في نظرة واحدة."
  },
  {
    id: 10,
    icon: "✨",
    title: "Seaborn — مخططات إحصائية",
    en: "Seaborn Statistical Plots",
    category: "libraries",
    level: "متوسط",
    short: "مكتبة فوق Matplotlib تُنتج مخططات إحصائية جميلة بكود أقل.",
    desc: "Seaborn مبنية فوق Matplotlib وتُضيف: مخططات إحصائية جاهزة، تكامل مع Pandas DataFrames، ثيمات جميلة افتراضياً، وفترات ثقة تلقائية.",
    code: `import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

sns.set_theme(style='darkgrid', palette='viridis')
np.random.seed(42)

# بيانات تجريبية
df = pd.DataFrame({
    'الخبرة':  np.random.randint(1, 15, 100),
    'الراتب':  np.random.normal(8000, 2000, 100),
    'القسم':   np.random.choice(['تقنية','مبيعات','تسويق'], 100),
    'التقييم': np.random.uniform(3, 5, 100)
})
df['الراتب'] = df['الراتب'] + df['الخبرة'] * 500

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Regression plot
sns.regplot(data=df, x='الخبرة', y='الراتب',
            scatter_kws={'alpha': 0.5}, ax=axes[0])
axes[0].set_title('الخبرة vs الراتب')

# Violin plot
sns.violinplot(data=df, x='القسم', y='الراتب',
               palette='viridis', ax=axes[1])
axes[1].set_title('توزيع الرواتب بالقسم')

plt.tight_layout()
plt.show()`,
    example: "sns.regplot() يرسم Scatter + خط انحدار + فترة ثقة بسطر واحد."
  },
  {
    id: 11,
    icon: "⚡",
    title: "Plotly — مخططات تفاعلية",
    en: "Plotly Interactive Charts",
    category: "libraries",
    level: "متوسط",
    short: "مخططات تفاعلية للويب — Hover وZoom وFilter بدون كود إضافي.",
    desc: "Plotly تُنتج مخططات HTML تفاعلية. المستخدم يستطيع: التحويم لرؤية القيم، التكبير والتصغير، إخفاء/إظهار السلاسل، وتحميل الصورة. مثالية للتقارير والـ Dashboards.",
    code: `import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np

np.random.seed(42)
df = pd.DataFrame({
    'الشهر':   ['يناير','فبراير','مارس','أبريل','مايو','يونيو'] * 2,
    'المبيعات': np.random.randint(40, 90, 12),
    'الفرع':   ['الرياض'] * 6 + ['جدة'] * 6
})

# مخطط خطي تفاعلي
fig = px.line(df,
              x='الشهر', y='المبيعات',
              color='الفرع',
              markers=True,
              title='مقارنة المبيعات بين الفروع',
              template='plotly_dark',
              color_discrete_sequence=['#6366f1', '#10b981'])

fig.update_layout(
    font_family='sans-serif',
    hovermode='x unified',
    legend=dict(orientation='h', y=1.1)
)

fig.update_traces(line_width=2.5, marker_size=8)
fig.show()`,
    example: "تقرير مبيعات تفاعلي — المدير يُحوّم على أي نقطة ليرى القيمة الدقيقة."
  },
  {
    id: 12,
    icon: "🎯",
    title: "اختيار المخطط الصحيح",
    en: "Chart Selection Guide",
    category: "design",
    level: "مبتدئ",
    short: "القاعدة الذهبية: نوع البيانات والسؤال يحددان المخطط المناسب.",
    desc: "اختيار المخطط الخاطئ يُشوّه الرسالة. الدليل: مقارنة فئات → شريطي، اتجاه زمني → خطي، علاقة بين متغيرين → تشتت، توزيع → هيستوغرام، نسب → دائري (أقل من 5 فئات).",
    code: `# دليل اختيار المخطط
CHART_GUIDE = {
    "مقارنة فئات":        "Bar Chart — عمودي أو أفقي",
    "اتجاه زمني":         "Line Chart — مع تظليل اختياري",
    "توزيع متغير":        "Histogram + KDE",
    "علاقة متغيرين":      "Scatter Plot + Regression",
    "نسب مئوية":          "Pie/Donut — أقل من 5 فئات فقط",
    "مقارنة توزيعات":     "Box Plot أو Violin Plot",
    "مصفوفة ارتباط":      "Heatmap",
    "جزء من كل":          "Stacked Bar أو Treemap",
    "توزيع جغرافي":       "Choropleth Map",
    "تدفق/انتقال":        "Sankey Diagram",
}

for question, chart in CHART_GUIDE.items():
    print(f"{'السؤال:':<20} {question}")
    print(f"{'المخطط:':<20} {chart}")
    print("-" * 45)`,
    example: "سؤال: 'ما نسبة كل منتج من المبيعات؟' → الجواب: Pie Chart أو Donut."
  },
  {
    id: 13,
    icon: "🌈",
    title: "نظرية الألوان",
    en: "Color Theory in DataViz",
    category: "design",
    level: "متوسط",
    short: "الألوان تنقل معنى — استخدمها بوعي لتعزيز الرسالة.",
    desc: "في تصوير البيانات: الألوان المتسلسلة للبيانات المستمرة، المتباينة للفئات المنفصلة، والمتشعبة للبيانات ذات مركز (مثل الانحراف عن الصفر). راعِ دائماً عمى الألوان.",
    code: `import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np

fig, axes = plt.subplots(1, 3, figsize=(14, 3))

data = np.random.rand(8, 8)

# 1. Sequential — للبيانات المستمرة
im1 = axes[0].imshow(data, cmap='Blues')
axes[0].set_title('Sequential\n(بيانات مستمرة)')
plt.colorbar(im1, ax=axes[0])

# 2. Diverging — للانحراف عن مركز
data_div = data * 2 - 1
im2 = axes[1].imshow(data_div, cmap='RdBu_r', vmin=-1, vmax=1)
axes[1].set_title('Diverging\n(انحراف عن مركز)')
plt.colorbar(im2, ax=axes[1])

# 3. Qualitative — للفئات المنفصلة
data_cat = np.random.randint(0, 5, (8, 8))
im3 = axes[2].imshow(data_cat, cmap='Set2')
axes[2].set_title('Qualitative\n(فئات منفصلة)')
plt.colorbar(im3, ax=axes[2])

plt.suptitle('أنواع لوحات الألوان', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.show()`,
    example: "مخطط الحرارة للأرباح والخسائر → Diverging (أحمر/أزرق) أوضح من Sequential."
  },
  {
    id: 14,
    icon: "📐",
    title: "Matplotlib — الأساسيات",
    en: "Matplotlib Fundamentals",
    category: "libraries",
    level: "مبتدئ",
    short: "Figure وAxes وArtists — فهم الهيكل يفتح كل إمكانيات Matplotlib.",
    desc: "Matplotlib تعمل بمفهوم Figure (اللوحة الكاملة) وAxes (منطقة الرسم). كل عنصر مرئي هو Artist. فهم هذا الهيكل يُمكّنك من التحكم الكامل في كل تفصيلة.",
    code: `import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2 * np.pi, 100)

# الطريقة الاحترافية — Object-Oriented
fig, ax = plt.subplots(figsize=(9, 5))

# رسم
ax.plot(x, np.sin(x), label='sin(x)', color='#6366f1', linewidth=2)
ax.plot(x, np.cos(x), label='cos(x)', color='#10b981', linewidth=2,
        linestyle='--')

# تخصيص المحاور
ax.set_xlim(0, 2 * np.pi)
ax.set_ylim(-1.3, 1.3)
ax.set_xticks([0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi])
ax.set_xticklabels(['0', 'π/2', 'π', '3π/2', '2π'])

# العناوين والتسميات
ax.set_title('الدوال المثلثية', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('الزاوية (راديان)')
ax.set_ylabel('القيمة')

# تنسيق
ax.legend(loc='upper right', framealpha=0.9)
ax.spines[['top', 'right']].set_visible(False)
ax.grid(alpha=0.3, linestyle='--')
ax.axhline(y=0, color='gray', linewidth=0.8, alpha=0.5)

plt.tight_layout()
plt.show()`,
    example: "fig, ax = plt.subplots() هي الطريقة الاحترافية — تعطيك تحكماً كاملاً."
  }
];

/* ══════════════════════════════════════════
   PROCESS STEPS
══════════════════════════════════════════ */
const PROCESS_STEPS = [
  {
    num: "01",
    icon: "❓",
    title: "تحديد السؤال والجمهور",
    desc: "ما الرسالة التي تريد إيصالها؟ ولمن؟",
    time: "10%",
    details: [
      "ما القرار الذي سيتخذه الجمهور بعد رؤية المخطط؟",
      "هل الجمهور تقني أم إداري؟",
      "هل المخطط للاستكشاف أم للعرض؟",
      "كم متغيراً تحتاج لعرضه؟",
      "ما الوسيط: ورقة، شاشة، تقرير PDF؟"
    ],
    tools: ["Pen & Paper", "Miro", "FigJam"]
  },
  {
    num: "02",
    icon: "🔍",
    title: "استكشاف البيانات",
    desc: "فهم البيانات قبل رسمها — نوعها وتوزيعها وشذوذها",
    time: "25%",
    details: [
      "تحديد نوع كل متغير: مستمر، فئوي، زمني",
      "فحص القيم المفقودة والشاذة",
      "حساب الإحصاءات الوصفية الأساسية",
      "رسم مخططات استكشافية أولية",
      "تحديد الأنماط والعلاقات المثيرة للاهتمام"
    ],
    tools: ["Pandas", "NumPy", "Matplotlib", "Seaborn"]
  },
  {
    num: "03",
    icon: "🎯",
    title: "اختيار نوع المخطط",
    desc: "المخطط الصحيح يُبسّط الرسالة — الخاطئ يُشوّشها",
    time: "15%",
    details: [
      "مقارنة فئات → Bar Chart",
      "اتجاه زمني → Line Chart",
      "توزيع → Histogram / Box Plot",
      "علاقة → Scatter Plot",
      "نسب (< 5 فئات) → Pie / Donut"
    ],
    tools: ["Chart Chooser", "Data Viz Catalogue"]
  },
  {
    num: "04",
    icon: "🎨",
    title: "البناء والتصميم",
    desc: "رسم المخطط وتطبيق مبادئ التصميم الجيد",
    time: "35%",
    details: [
      "اختيار لوحة ألوان متناسقة ومناسبة",
      "إزالة العناصر غير الضرورية (Chartjunk)",
      "إضافة عناوين وتسميات واضحة",
      "ضمان قراءة المحاور بشكل صحيح",
      "اختبار المخطط مع شخص آخر"
    ],
    tools: ["Matplotlib", "Seaborn", "Plotly", "ColorBrewer"]
  },
  {
    num: "05",
    icon: "📤",
    title: "التصدير والمشاركة",
    desc: "حفظ المخطط بالجودة والصيغة المناسبة",
    time: "15%",
    details: [
      "PNG/JPG للعروض والتقارير",
      "SVG للمواقع والطباعة عالية الجودة",
      "HTML للمخططات التفاعلية",
      "PDF للتقارير الرسمية",
      "DPI مناسب: 150 للشاشة، 300 للطباعة"
    ],
    tools: ["savefig()", "Plotly HTML", "Tableau", "Power BI"]
  }
];

/* ══════════════════════════════════════════
   CASE STUDY
══════════════════════════════════════════ */
const CASE_STEPS = [
  {
    step: "01",
    icon: "📋",
    title: "المشكلة: تقرير أداء المتجر الإلكتروني",
    content: "المدير يريد فهم أداء المتجر خلال 2024 — المبيعات، أفضل المنتجات، وأنماط الشراء. البيانات: 12,000 طلب، 50 منتج، 8,000 عميل.",
    code: null,
    insight: "📊 البيانات المتاحة:\n• orders.csv — 12,000 طلب بتواريخ وقيم\n• products.csv — 50 منتج بالفئات والأسعار\n• customers.csv — 8,000 عميل بالمناطق\n\nالهدف: لوحة تحكم بصرية شاملة في صفحة واحدة"
  },
  {
    step: "02",
    icon: "🔧",
    title: "تحضير البيانات",
    content: "نحمّل البيانات ونحسب المقاييس الأساسية قبل الرسم.",
    code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# تحميل البيانات
np.random.seed(42)
dates    = pd.date_range('2024-01-01', '2024-12-31', freq='D')
n        = 12000

df = pd.DataFrame({
    'date':     np.random.choice(dates, n),
    'product':  np.random.choice(['لابتوب','هاتف','سماعة','شاشة','لوحة مفاتيح'], n,
                                  p=[0.15, 0.30, 0.25, 0.15, 0.15]),
    'amount':   np.random.lognormal(7, 0.8, n),
    'region':   np.random.choice(['الرياض','جدة','الدمام','مكة'], n,
                                  p=[0.40, 0.30, 0.20, 0.10]),
    'quantity': np.random.randint(1, 5, n)
})

df['month']   = df['date'].dt.month
df['weekday'] = df['date'].dt.dayofweek

print(f"✅ تم تحميل {len(df):,} طلب")
print(df.describe().round(2))`,
    insight: "💡 الإحصاءات الأولية:\n• متوسط قيمة الطلب: 1,847 ريال\n• أعلى قيمة: 12,400 ريال\n• أكثر منتج مبيعاً: الهاتف (30%)"
  },
  {
    step: "03",
    icon: "📈",
    title: "المبيعات الشهرية — خطي",
    content: "نرسم اتجاه المبيعات عبر الأشهر لاكتشاف الموسمية.",
    code: `monthly = df.groupby('month')['amount'].sum() / 1000

fig, ax = plt.subplots(figsize=(11, 4))

ax.fill_between(monthly.index, monthly.values,
                alpha=0.15, color='#6366f1')
ax.plot(monthly.index, monthly.values,
        'o-', color='#6366f1', linewidth=2.5,
        markersize=8, markerfacecolor='white',
        markeredgewidth=2)

# تمييز أعلى شهر
peak = monthly.idxmax()
ax.annotate(f'ذروة\n{monthly[peak]:.0f}K',
            xy=(peak, monthly[peak]),
            xytext=(peak - 1.5, monthly[peak] + 50),
            arrowprops=dict(arrowstyle='->', color='#f59e0b'),
            color='#f59e0b', fontweight='bold', fontsize=9)

months_ar = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
             'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
ax.set_xticks(range(1, 13))
ax.set_xticklabels(months_ar, rotation=30, ha='right')
ax.set_title('المبيعات الشهرية 2024', fontsize=13, fontweight='bold')
ax.set_ylabel('المبيعات (ألف ريال)')
ax.spines[['top','right']].set_visible(False)
ax.grid(alpha=0.3, linestyle='--')
plt.tight_layout()
plt.show()`,
    insight: "📈 الاكتشاف:\n• ذروة المبيعات في نوفمبر (موسم الجمعة البيضاء)\n• أدنى مبيعات في فبراير\n• نمو واضح في النصف الثاني من العام"
  },
  {
    step: "04",
    icon: "🏆",
    title: "أفضل المنتجات — شريطي أفقي",
    content: "نقارن إجمالي مبيعات كل منتج بمخطط شريطي أفقي.",
    code: `product_sales = (df.groupby('product')['amount']
                   .sum()
                   .sort_values()
                   / 1000)

fig, ax = plt.subplots(figsize=(9, 4))

colors = ['#6366f1' if i == len(product_sales)-1
          else '#94a3b8'
          for i in range(len(product_sales))]

bars = ax.barh(product_sales.index, product_sales.values,
               color=colors, height=0.6, edgecolor='white')

# القيم على اليمين
for bar, val in zip(bars, product_sales.values):
    ax.text(val + 20, bar.get_y() + bar.get_height()/2,
            f'{val:,.0f}K', va='center', fontsize=9,
            fontweight='bold', color='var(--text-primary)')

ax.set_title('إجمالي المبيعات بالمنتج', fontsize=13, fontweight='bold')
ax.set_xlabel('المبيعات (ألف ريال)')
ax.spines[['top','right','left']].set_visible(False)
ax.tick_params(left=False)
ax.grid(axis='x', alpha=0.3, linestyle='--')
plt.tight_layout()
plt.show()`,
    insight: "🏆 النتائج:\n• الهاتف الأعلى مبيعاً بفارق كبير\n• اللابتوب ثانياً رغم عدد الوحدات الأقل\n• لوحة المفاتيح تحتاج مراجعة استراتيجية"
  },
  {
    step: "05",
    icon: "🌡️",
    title: "أنماط الشراء — خريطة حرارة",
    content: "نكشف في أي أيام وأشهر يكون الشراء أعلى.",
    code: `pivot = df.pivot_table(
    values='amount', index='weekday',
    columns='month', aggfunc='sum'
) / 1000

days_ar = ['الإثنين','الثلاثاء','الأربعاء',
           'الخميس','الجمعة','السبت','الأحد']
months_short = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

pivot.index   = days_ar
pivot.columns = months_short

fig, ax = plt.subplots(figsize=(13, 5))
sns.heatmap(pivot, cmap='YlOrRd',
            annot=True, fmt='.0f',
            linewidths=0.5, ax=ax,
            cbar_kws={'label': 'المبيعات (K ريال)'})

ax.set_title('خريطة حرارة المبيعات: اليوم × الشهر',
             fontsize=13, fontweight='bold', pad=15)
ax.set_xlabel('الشهر')
ax.set_ylabel('اليوم')
plt.tight_layout()
plt.show()`,
    insight: "🌡️ الأنماط المكتشفة:\n• الجمعة والسبت الأعلى مبيعاً في كل الأشهر\n• نوفمبر وديسمبر الأحمر الداكن = موسم الذروة\n• الثلاثاء الأقل نشاطاً — فرصة لحملات مستهدفة"
  }
];

/* ══════════════════════════════════════════
   CHEAT SHEETS
══════════════════════════════════════════ */
const CHEAT_SHEETS = [
  {
    title: "📊 Matplotlib — الأساسيات",
    code: `import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(9, 5))

# أنواع المخططات الأساسية
ax.plot(x, y)                    # خطي
ax.bar(x, y)                     # شريطي عمودي
ax.barh(x, y)                    # شريطي أفقي
ax.scatter(x, y)                 # تشتت
ax.hist(data, bins=30)           # هيستوغرام
ax.pie(sizes, labels=labels)     # دائري
ax.boxplot(data)                 # صندوق

# تخصيص
ax.set_title('العنوان', fontsize=14, fontweight='bold')
ax.set_xlabel('المحور X')
ax.set_ylabel('المحور Y')
ax.legend(loc='upper right')
ax.spines[['top','right']].set_visible(False)
ax.grid(alpha=0.3, linestyle='--')

# حفظ
plt.tight_layout()
plt.savefig('chart.png', dpi=150, bbox_inches='tight')
plt.show()`
  },
  {
    title: "🎨 Seaborn — مخططات إحصائية",
    code: `import seaborn as sns
import matplotlib.pyplot as plt

sns.set_theme(style='whitegrid', palette='viridis')

# مخططات شائعة
sns.histplot(data=df, x='col', kde=True)
sns.boxplot(data=df, x='cat', y='num')
sns.violinplot(data=df, x='cat', y='num')
sns.scatterplot(data=df, x='x', y='y', hue='cat')
sns.lineplot(data=df, x='date', y='value', hue='group')
sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='RdYlGn')
sns.pairplot(df, hue='category')
sns.regplot(data=df, x='x', y='y')
sns.countplot(data=df, x='category', order=df['category'].value_counts().index)
sns.barplot(data=df, x='cat', y='num', estimator='mean', errorbar='ci')`
  },
  {
    title: "⚡ Plotly Express — تفاعلي",
    code: `import plotly.express as px

# مخططات سريعة
fig = px.bar(df, x='cat', y='val', color='group',
             title='عنوان', template='plotly_dark')

fig = px.line(df, x='date', y='value', color='series',
              markers=True)

fig = px.scatter(df, x='x', y='y', color='cat',
                 size='val', hover_data=['name'])

fig = px.pie(df, values='val', names='cat',
             hole=0.4)  # Donut

fig = px.histogram(df, x='col', nbins=30, color='cat')

fig = px.box(df, x='cat', y='num', color='cat')

fig = px.heatmap(corr_df)

# تخصيص مشترك
fig.update_layout(hovermode='x unified', font_family='sans-serif')
fig.update_traces(marker_line_width=0.5)
fig.show()
fig.write_html('chart.html')`
  },
  {
    title: "🌈 لوحات الألوان الجاهزة",
    code: `# Matplotlib Colormaps
# Sequential (بيانات مستمرة)
'Blues', 'Greens', 'Oranges', 'viridis', 'plasma', 'YlOrRd'

# Diverging (انحراف عن مركز)
'RdBu_r', 'RdYlGn', 'coolwarm', 'bwr'

# Qualitative (فئات منفصلة)
'Set1', 'Set2', 'Set3', 'tab10', 'Paired'

# ── لوحة ألوان مخصصة ──
COLORS = ['#6366f1','#8b5cf6','#10b981',
          '#f59e0b','#ef4444','#06b6d4']

# ── Seaborn palettes ──
sns.set_palette('viridis')
sns.color_palette('husl', n_colors=8)
sns.color_palette('RdYlGn', as_cmap=True)

# ── Plotly color sequences ──
import plotly.express as px
px.colors.qualitative.Plotly
px.colors.sequential.Viridis
px.colors.diverging.RdBu`
  },
  {
    title: "📐 Subplots وLayout",
    code: `import matplotlib.pyplot as plt

# شبكة بسيطة
fig, axes = plt.subplots(2, 3, figsize=(14, 8))
ax = axes[0, 0]  # الصف الأول، العمود الأول

# مساحات مختلفة
fig = plt.figure(figsize=(14, 8))
ax1 = fig.add_subplot(2, 2, (1, 2))  # يأخذ عمودين
ax2 = fig.add_subplot(2, 2, 3)
ax3 = fig.add_subplot(2, 2, 4)

# GridSpec للتحكم الكامل
from matplotlib.gridspec import GridSpec
gs  = GridSpec(2, 3, figure=fig,
               hspace=0.4, wspace=0.3)
ax1 = fig.add_subplot(gs[0, :])     # الصف الأول كاملاً
ax2 = fig.add_subplot(gs[1, 0:2])
ax3 = fig.add_subplot(gs[1, 2])

# تنسيق مشترك
for ax in axes.flat:
    ax.spines[['top','right']].set_visible(False)
    ax.grid(alpha=0.3, linestyle='--')

plt.tight_layout()
plt.savefig('dashboard.png', dpi=150, bbox_inches='tight')`
  },
  {
    title: "💾 حفظ وتصدير المخططات",
    code: `import matplotlib.pyplot as plt

# PNG — للعروض والتقارير
plt.savefig('chart.png',
            dpi=150,
            bbox_inches='tight',
            facecolor='white')

# SVG — للويب والطباعة
plt.savefig('chart.svg', bbox_inches='tight')

# PDF — للتقارير الرسمية
plt.savefig('chart.pdf', bbox_inches='tight')

# حفظ في الذاكرة (للويب)
from io import BytesIO
buf = BytesIO()
plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
buf.seek(0)

# Plotly — HTML تفاعلي
fig.write_html('interactive.html',
               include_plotlyjs='cdn')

# Plotly — صورة ثابتة
fig.write_image('chart.png', width=1200,
                height=600, scale=2)`
  }
];

/* ══════════════════════════════════════════
   QUIZ
══════════════════════════════════════════ */
const QUIZ = [
  {
    q: "أي مخطط الأنسب لعرض اتجاه المبيعات عبر 12 شهراً؟",
    options: [
      "Pie Chart — لأنه يُظهر النسب",
      "Bar Chart — لأنه يقارن الفئات",
      "Line Chart — لأنه يُظهر الاتجاه الزمني",
      "Scatter Plot — لأنه يُظهر العلاقات"
    ],
    correct: 2,
    explanation: "Line Chart مصمم للبيانات الزمنية المتسلسلة — يُظهر الاتجاه (صعود/هبوط) والتذبذب بوضوح. Bar Chart أفضل لمقارنة فئات منفصلة."
  },
  {
    q: "ما الحد الأقصى الموصى به لعدد الفئات في Pie Chart؟",
    options: ["2 فئات", "5 فئات", "10 فئات", "لا حد"],
    correct: 1,
    explanation: "القاعدة الذهبية: لا تستخدم Pie Chart مع أكثر من 5 فئات. العين البشرية تصعب عليها مقارنة الزوايا الصغيرة — استخدم Bar Chart بدلاً منه."
  },
  {
    q: "ما الفرق بين Sequential وDiverging في لوحات الألوان؟",
    options: [
      "لا فرق — كلاهما للبيانات المستمرة",
      "Sequential للبيانات المستمرة، Diverging للانحراف عن مركز",
      "Diverging للفئات، Sequential للأرقام",
      "Sequential للمخططات الثلاثية الأبعاد فقط"
    ],
    correct: 1,
    explanation: "Sequential (مثل Blues) للبيانات من صفر لأعلى. Diverging (مثل RdBu) للبيانات ذات مركز مثل الأرباح والخسائر — الأحمر للسالب والأزرق للموجب."
  },
  {
    q: "أي مخطط يُظهر الوسيط والربيعيات والقيم الشاذة دفعة واحدة؟",
    options: [
      "Histogram",
      "Bar Chart",
      "Box Plot",
      "Line Chart"
    ],
    correct: 2,
    explanation: "Box Plot (مخطط الصندوق) يعرض: الوسيط (الخط الأوسط)، Q1 وQ3 (الصندوق)، المدى الكلي (الخطوط)، والقيم الشاذة (النقاط المنفصلة)."
  },
  {
    q: "ما الفرق الرئيسي بين Matplotlib وPlotly؟",
    options: [
      "Matplotlib أسرع في الرسم",
      "Plotly مجاني وMatplotlib مدفوع",
      "Plotly ينتج مخططات تفاعلية للويب، Matplotlib ينتج صوراً ثابتة",
      "Matplotlib يدعم Python فقط"
    ],
    correct: 2,
    explanation: "Matplotlib ينتج صوراً ثابتة (PNG/SVG/PDF) مثالية للتقارير. Plotly ينتج HTML تفاعلياً — المستخدم يُحوّم ويكبّر ويُصدّر. كلاهما مجاني."
  }
];

/* ============================================================
   DATA.JS — data-analysis page
   جميع البيانات هنا فقط، لا يوجد أي منطق
============================================================ */

const TERMS = [
  {
    id:1, icon:"📊", title:"المتوسط الحسابي", en:"Mean",
    category:"stats", level:"مبتدئ",
    short:"مجموع القيم مقسوماً على عددها — أكثر مقاييس النزعة المركزية شيوعاً.",
    desc:"المتوسط الحسابي هو حاصل جمع جميع القيم ثم قسمتها على عددها. يمثّل مركز البيانات لكنه حساس جداً للقيم الشاذة — قيمة متطرفة واحدة تكفي لتشويه الصورة.",
    formula:"μ = (Σx) / n",
    code:`import numpy as np\ndata = [10, 20, 30, 40, 50]\nmean = np.mean(data)\nprint(f"المتوسط: {mean}")  # 30.0`,
    example:"💡 متوسط رواتب 5 موظفين = (3000+4000+5000+6000+7000) ÷ 5 = 5000 ريال"
  },
  {
    id:2, icon:"📍", title:"الوسيط", en:"Median",
    category:"stats", level:"مبتدئ",
    short:"القيمة الوسطى بعد الترتيب — أقل تأثراً بالقيم الشاذة.",
    desc:"الوسيط هو القيمة التي تقع في المنتصف عند ترتيب البيانات تصاعدياً. إذا كان عدد القيم زوجياً يُحسب بأخذ متوسط القيمتين الوسطيتين. يُفضَّل على المتوسط عند وجود قيم متطرفة.",
    formula:"إذا n فردي: القيمة رقم (n+1)/2 | إذا n زوجي: متوسط القيمتين الوسطيتين",
    code:`import numpy as np\ndata = [10, 20, 30, 1000, 50]\nmedian = np.median(data)\nprint(f"الوسيط: {median}")   # 30.0\nprint(f"المتوسط: {np.mean(data)}")  # 222.0 ← مشوّه!`,
    example:"💡 أسعار منازل في حي: الوسيط أفضل لأن قصراً واحداً لا يشوّه الصورة."
  },
  {
    id:3, icon:"🎯", title:"المنوال", en:"Mode",
    category:"stats", level:"مبتدئ",
    short:"القيمة الأكثر تكراراً في البيانات.",
    desc:"المنوال هو القيمة ذات أعلى تكرار. يمكن أن تكون للبيانات منوال واحد أو منوالان أو أكثر. مفيد جداً للبيانات الفئوية ولتحديد الأنماط الأكثر شيوعاً.",
    formula:"القيمة ذات أعلى تكرار في التوزيع",
    code:`from scipy import stats\ndata = [1, 2, 2, 3, 3, 3, 4]\nresult = stats.mode(data)\nprint(f"المنوال: {result.mode[0]}")  # 3\nprint(f"التكرار: {result.count[0]}")  # 3`,
    example:"💡 في متجر ملابس، المقاس M هو المنوال — يساعد في تحديد كميات المخزون."
  },
  {
    id:4, icon:"📏", title:"الانحراف المعياري", en:"Standard Deviation",
    category:"stats", level:"متوسط",
    short:"يقيس مدى تشتت البيانات حول المتوسط — كلما قلّ كانت البيانات أكثر تجانساً.",
    desc:"الانحراف المعياري يخبرنا كم تبتعد القيم عن المتوسط في المتوسط. قيمة صغيرة = بيانات متقاربة. قيمة كبيرة = تشتت واسع. يُستخدم في اكتشاف القيم الشاذة وفهم التوزيع.",
    formula:"σ = √(Σ(xᵢ - μ)² / n)",
    code:`import numpy as np\ndata = [10, 12, 11, 13, 10, 12]\nstd = np.std(data)\nvar = np.var(data)\nprint(f"الانحراف المعياري: {std:.2f}")\nprint(f"التباين: {var:.2f}")`,
    example:"💡 درجات طلاب — انحراف 2 يعني تقارب، انحراف 15 يعني فجوة كبيرة بين الطلاب."
  },
  {
    id:5, icon:"🔗", title:"الارتباط", en:"Correlation",
    category:"stats", level:"متوسط",
    short:"يقيس قوة واتجاه العلاقة بين متغيرين — من -1 إلى +1.",
    desc:"معامل الارتباط يخبرنا إذا كان متغيران يتحركان معاً. +1 = ارتباط طردي تام، -1 = ارتباط عكسي تام، 0 = لا علاقة. تحذير مهم: الارتباط لا يعني السببية!",
    formula:"r = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / √[Σ(xᵢ-x̄)²·Σ(yᵢ-ȳ)²]",
    code:`import numpy as np\nx = [1, 2, 3, 4, 5]\ny = [2, 4, 5, 4, 5]\ncorr = np.corrcoef(x, y)[0, 1]\nprint(f"معامل الارتباط: {corr:.2f}")\n# تفسير\nif abs(corr) > 0.7: print("ارتباط قوي")\nelif abs(corr) > 0.4: print("ارتباط متوسط")\nelse: print("ارتباط ضعيف")`,
    example:"💡 الحرارة ومبيعات المثلجات — ارتباط طردي قوي جداً (+0.9)"
  },
  {
    id:6, icon:"🚨", title:"القيم الشاذة", en:"Outliers",
    category:"data", level:"متوسط",
    short:"قيم تبتعد بشكل غير طبيعي — قد تكون خطأ أو اكتشافاً مهماً.",
    desc:"القيم الشاذة تُكتشف بقاعدة IQR أو Z-Score. أحياناً تكون أخطاء إدخال، وأحياناً تكشف عن احتيال أو ظاهرة مثيرة تستحق التحقيق.",
    formula:"شاذ إذا: x < Q1 - 1.5×IQR  أو  x > Q3 + 1.5×IQR",
    code:`import numpy as np\ndata = [10, 12, 11, 13, 10, 12, 100]\nQ1 = np.percentile(data, 25)\nQ3 = np.percentile(data, 75)\nIQR = Q3 - Q1\nlower = Q1 - 1.5 * IQR\nupper = Q3 + 1.5 * IQR\noutliers = [x for x in data if x < lower or x > upper]\nprint(f"القيم الشاذة: {outliers}")  # [100]`,
    example:"💡 صفقة بـ 1,000,000 ريال وسط صفقات 500-2000 ريال — شاذة وتستحق التحقيق!"
  },
  {
    id:7, icon:"🧹", title:"تنظيف البيانات", en:"Data Cleaning",
    category:"data", level:"مبتدئ",
    short:"معالجة البيانات الناقصة والمكررة والخاطئة قبل التحليل.",
    desc:"يشمل: معالجة القيم المفقودة (حذف أو تعبئة)، إزالة التكرارات، تصحيح أنواع البيانات، توحيد التنسيقات. المحللون يقضون 60-80% من وقتهم في هذه المرحلة!",
    formula:"لا صيغة رياضية — عملية منطقية منهجية",
    code:`import pandas as pd\ndf = pd.read_csv('data.csv')\n\n# فحص المشاكل\nprint(df.isnull().sum())       # القيم المفقودة\nprint(df.duplicated().sum())   # التكرارات\n\n# المعالجة\ndf['age'].fillna(df['age'].median(), inplace=True)\ndf['city'].fillna('غير محدد', inplace=True)\ndf.drop_duplicates(inplace=True)\ndf['date'] = pd.to_datetime(df['date'])`,
    example:"💡 عمود 'العمر' يحتوي '25' و'twenty-five' و'25 years' — يجب توحيدها إلى 25."
  },
  {
    id:8, icon:"📦", title:"DataFrame", en:"DataFrame",
    category:"data", level:"مبتدئ",
    short:"جدول بيانات ثنائي الأبعاد في Pandas — العمود الفقري لتحليل البيانات بـ Python.",
    desc:"DataFrame يشبه جدول Excel لكن بقوة برمجية هائلة. له صفوف وأعمدة، كل عمود يمكن أن يكون من نوع بيانات مختلف. يدعم عمليات تصفية وتجميع وتحويل قوية جداً.",
    formula:"df = pd.DataFrame(data)",
    code:`import pandas as pd\ndata = {\n  'الاسم':   ['أحمد', 'سارة', 'محمد'],\n  'العمر':   [25, 30, 28],\n  'الراتب':  [5000, 7000, 6000]\n}\ndf = pd.DataFrame(data)\nprint(df.head())        # عرض البيانات\nprint(df.describe())    # إحصاء سريع\nprint(df.dtypes)        # أنواع الأعمدة`,
    example:"💡 كل صف = عميل، كل عمود = خاصية (الاسم، العمر، المشتريات...)"
  },
  {
    id:9, icon:"🔔", title:"التوزيع الطبيعي", en:"Normal Distribution",
    category:"stats", level:"متوسط",
    short:"توزيع على شكل جرس متماثل — معظم البيانات الطبيعية تتبعه.",
    desc:"التوزيع الطبيعي هو الأكثر شيوعاً في الطبيعة. قاعدة 68-95-99.7: 68% من البيانات ضمن انحراف واحد، 95% ضمن انحرافين، 99.7% ضمن ثلاثة انحرافات معيارية.",
    formula:"f(x) = (1/σ√2π) × e^(-(x-μ)²/2σ²)",
    code:`import numpy as np\nimport matplotlib.pyplot as plt\n\n# توليد بيانات طبيعية\ndata = np.random.normal(loc=50, scale=10, size=1000)\n\nprint(f"المتوسط: {data.mean():.1f}")   # ≈ 50\nprint(f"الانحراف: {data.std():.1f}")  # ≈ 10\n\nplt.hist(data, bins=30, density=True, alpha=0.7)\nplt.title('التوزيع الطبيعي')\nplt.show()`,
    example:"💡 الطول البشري، درجات الاختبارات، أخطاء القياس — كلها تتبع التوزيع الطبيعي."
  },
  {
    id:10, icon:"📉", title:"الانحدار الخطي", en:"Linear Regression",
    category:"ml", level:"متوسط",
    short:"يجد أفضل خط مستقيم للتنبؤ بقيمة متغير بناءً على آخر.",
    desc:"الانحدار الخطي يُنشئ معادلة خط للتنبؤ بمتغير تابع بناءً على متغير مستقل. يُستخدم على نطاق واسع في التنبؤ بالمبيعات والأسعار والطلب.",
    formula:"y = β₀ + β₁x + ε",
    code:`from sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import r2_score\nimport numpy as np\n\nX = np.array([[1],[2],[3],[4],[5]])\ny = np.array([2, 4, 5, 4, 5])\n\nmodel = LinearRegression().fit(X, y)\ny_pred = model.predict(X)\n\nprint(f"الميل (β₁): {model.coef_[0]:.2f}")\nprint(f"التقاطع (β₀): {model.intercept_:.2f}")\nprint(f"R²: {r2_score(y, y_pred):.2f}")`,
    example:"💡 التنبؤ بسعر منزل بناءً على مساحته — كل متر إضافي يرفع السعر بمقدار ثابت."
  },
  {
    id:11, icon:"🌳", title:"شجرة القرار", en:"Decision Tree",
    category:"ml", level:"متقدم",
    short:"نموذج يُقسّم البيانات بسلسلة أسئلة ثنائية للتصنيف أو التنبؤ.",
    desc:"شجرة القرار تُقسّم البيانات بشكل متكرر بناءً على أفضل معيار فصل. سهلة التفسير والشرح لغير التقنيين، لكنها عرضة للـ Overfitting بدون تقليم (Pruning).",
    formula:"Gini = 1 - Σpᵢ²  |  Entropy = -Σpᵢ·log₂(pᵢ)",
    code:`from sklearn.tree import DecisionTreeClassifier\nfrom sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\n\nX, y = load_iris(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n\nmodel = DecisionTreeClassifier(max_depth=3, random_state=42)\nmodel.fit(X_train, y_train)\nprint(f"الدقة: {model.score(X_test, y_test):.2%}")`,
    example:"💡 هل يشتري العميل؟ → العمر > 30؟ → الدخل > 5000؟ → نعم/لا"
  },
  {
    id:12, icon:"⚖️", title:"التحيز والتباين", en:"Bias & Variance",
    category:"ml", level:"متقدم",
    short:"التوازن الجوهري — تحيز زائد = بسيط جداً، تباين زائد = معقد جداً.",
    desc:"التحيز (Bias) = النموذج لا يلتقط الأنماط الحقيقية (Underfitting). التباين (Variance) = النموذج يحفظ البيانات بدل أن يتعلم (Overfitting). الهدف إيجاد التوازن المثالي.",
    formula:"خطأ إجمالي = تحيز² + تباين + ضوضاء لا يمكن تجنبها",
    code:`from sklearn.model_selection import cross_val_score\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.linear_model import LogisticRegression\n\n# Underfitting: نموذج بسيط جداً\nlr_scores = cross_val_score(LogisticRegression(), X, y, cv=5)\n\n# Overfitting: نموذج معقد جداً\ndt_scores = cross_val_score(DecisionTreeClassifier(max_depth=None), X, y, cv=5)\n\nprint(f"Logistic (Bias عالٍ): {lr_scores.mean():.2f}")\nprint(f"Tree (Variance عالٍ): {dt_scores.mean():.2f}")`,
    example:"💡 حفظ إجابات الامتحان بدون فهم = Overfitting — ينجح في نفس الأسئلة فقط!"
  },
  {
    id:13, icon:"📊", title:"المدرج التكراري", en:"Histogram",
    category:"viz", level:"مبتدئ",
    short:"يُظهر توزيع البيانات الرقمية عبر فترات متساوية.",
    desc:"المدرج التكراري يُقسّم نطاق البيانات إلى فترات (bins) ويعرض عدد القيم في كل فترة. يساعد في فهم شكل التوزيع: طبيعي؟ منحرف؟ ثنائي القمة؟",
    formula:"عرض الفترة = (max - min) / عدد الفترات",
    code:`import matplotlib.pyplot as plt\nimport numpy as np\n\ndata = np.random.normal(50, 15, 500)\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.hist(data, bins=20, edgecolor='white', alpha=0.8)\nax.axvline(np.mean(data), color='red', linestyle='--', label='المتوسط')\nax.axvline(np.median(data), color='green', linestyle='--', label='الوسيط')\nax.legend()\nax.set_title('توزيع البيانات')\nplt.show()`,
    example:"💡 توزيع أعمار العملاء يُظهر أن الفئة 25-35 هي الأكثر شراءً."
  },
  {
    id:14, icon:"🔵", title:"مخطط التشتت", en:"Scatter Plot",
    category:"viz", level:"مبتدئ",
    short:"يُظهر العلاقة بين متغيرين رقميين — كل نقطة تمثل ملاحظة.",
    desc:"مخطط التشتت يضع كل ملاحظة كنقطة في فضاء ثنائي الأبعاد. يُستخدم لاكتشاف الارتباطات والأنماط والقيم الشاذة بصرياً قبل أي تحليل رقمي.",
    formula:"نقطة (xᵢ, yᵢ) لكل ملاحظة i",
    code:`import matplotlib.pyplot as plt\nimport numpy as np\n\nnp.random.seed(42)\nx = np.random.randn(100)\ny = 2 * x + np.random.randn(100) * 0.5\n\nplt.figure(figsize=(7, 5))\nplt.scatter(x, y, alpha=0.6, s=50)\n# إضافة خط الانحدار\nm, b = np.polyfit(x, y, 1)\nplt.plot(x, m*x+b, 'r--', label=f'y={m:.1f}x+{b:.1f}')\nplt.legend()\nplt.title('مخطط التشتت مع خط الانحدار')\nplt.show()`,
    example:"💡 الإنفاق الإعلاني مقابل المبيعات — نقاط مرتفعة في كليهما = ارتباط طردي."
  },
  {
    id:15, icon:"🗃️", title:"SQL", en:"Structured Query Language",
    category:"data", level:"مبتدئ",
    short:"لغة الاستعلام عن قواعد البيانات العلائقية — أساسي لكل محلل بيانات.",
    desc:"SQL تُتيح استخراج وتصفية وتجميع البيانات من قواعد البيانات. معظم بيانات الشركات مخزنة في قواعد SQL. إتقانها يوفر ساعات من العمل اليدوي.",
    formula:"SELECT cols FROM table WHERE cond GROUP BY col ORDER BY col LIMIT n",
    code:`-- أفضل 5 عملاء بالمبيعات في 2024\nSELECT\n  customer_name,\n  COUNT(*)            AS num_orders,\n  SUM(amount)         AS total_sales,\n  AVG(amount)         AS avg_order\nFROM orders\nWHERE order_date >= '2024-01-01'\n  AND status = 'completed'\nGROUP BY customer_name\nHAVING total_sales > 10000\nORDER BY total_sales DESC\nLIMIT 5;`,
    example:"💡 سطر واحد من SQL يُنجز ما يستغرق ساعات في Excel."
  },
  {
    id:16, icon:"🔢", title:"المصفوفة", en:"Matrix / Array",
    category:"data", level:"متوسط",
    short:"هيكل بيانات متعدد الأبعاد — أساس العمليات الرياضية في تحليل البيانات.",
    desc:"المصفوفات في NumPy تُتيح عمليات رياضية فعّالة على كميات ضخمة من البيانات. الضرب المصفوفي يُستخدم في الانحدار والشبكات العصبية وتحليل المكونات الرئيسية.",
    formula:"Cᵢⱼ = Σₖ Aᵢₖ × Bₖⱼ",
    code:`import numpy as np\n\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[5, 6], [7, 8]])\n\nprint("ضرب مصفوفات:")\nprint(np.dot(A, B))\n# [[19 22]\n#  [43 50]]\n\nprint("\\nالمحول (Transpose):")\nprint(A.T)\n\nprint("\\nالمعكوس (Inverse):")\nprint(np.linalg.inv(A))`,
    example:"💡 في الشبكات العصبية: كل طبقة = ضرب مصفوفة الأوزان × مصفوفة المدخلات."
  }
];

/* ─────────────────────────────────────────── */

const PROCESS_STEPS = [
  {
    num:"01", icon:"❓", title:"تحديد المشكلة",
    desc:"الخطوة الأهم — تحديد السؤال الذي تريد الإجابة عليه بدقة.",
    details:[
      "ما الهدف من التحليل؟",
      "من سيستخدم النتائج؟",
      "ما المقاييس التي ستحدد النجاح؟",
      "ما البيانات المتاحة؟"
    ],
    tools:["Notion","Miro","Google Docs"],
    time:"10-20%"
  },
  {
    num:"02", icon:"🗄️", title:"جمع البيانات",
    desc:"الحصول على البيانات من مصادرها المختلفة.",
    details:[
      "قواعد البيانات (SQL)",
      "APIs والويب",
      "ملفات CSV / Excel",
      "الاستبيانات والمسوحات"
    ],
    tools:["SQL","Python requests","Scrapy","Google Forms"],
    time:"15-25%"
  },
  {
    num:"03", icon:"🧹", title:"تنظيف البيانات",
    desc:"معالجة القيم المفقودة والشاذة والمكررة.",
    details:[
      "القيم المفقودة: حذف أو تعبئة",
      "القيم الشاذة: فحص وقرار",
      "التكرارات: إزالة",
      "أنواع البيانات: تصحيح"
    ],
    tools:["Pandas","OpenRefine","Excel Power Query"],
    time:"40-60%"
  },
  {
    num:"04", icon:"🔍", title:"الاستكشاف (EDA)",
    desc:"فهم البيانات عبر الإحصاء الوصفي والتصوير.",
    details:[
      "الإحصاء الوصفي (mean, std...)",
      "التوزيعات والأنماط",
      "العلاقات بين المتغيرات",
      "الفرضيات الأولية"
    ],
    tools:["Pandas","Matplotlib","Seaborn","Plotly"],
    time:"15-20%"
  },
  {
    num:"05", icon:"🤖", title:"النمذجة والتحليل",
    desc:"تطبيق النماذج الإحصائية أو تعلم الآلة.",
    details:[
      "اختيار النموذج المناسب",
      "تدريب النموذج",
      "التحقق والاختبار",
      "ضبط المعاملات (Hyperparameters)"
    ],
    tools:["Scikit-learn","Statsmodels","XGBoost"],
    time:"10-20%"
  },
  {
    num:"06", icon:"📢", title:"التقرير والتوصيات",
    desc:"تحويل النتائج إلى قرارات قابلة للتنفيذ.",
    details:[
      "تصوير النتائج بوضوح",
      "ربط النتائج بالأهداف التجارية",
      "التوصيات العملية",
      "عرض القيود والمخاطر"
    ],
    tools:["Tableau","Power BI","Jupyter Notebook","Google Slides"],
    time:"10-15%"
  }
];

/* ─────────────────────────────────────────── */

const CASE_STEPS = [
  {
    step:1, icon:"❓", title:"المشكلة",
    content:"متجر إلكتروني يلاحظ تراجع مبيعاته 15% في الربع الأخير. السؤال: لماذا؟ وكيف نعكس الاتجاه؟",
    code:null,
    insight:"🎯 الهدف: تحديد المنتجات والشرائح الأكثر تراجعاً وفهم السبب الجذري."
  },
  {
    step:2, icon:"🗄️", title:"جمع البيانات",
    content:"استخراج بيانات المبيعات من قاعدة البيانات للـ 12 شهر الماضية.",
    code:`SELECT\n  product_id,\n  category,\n  sale_date,\n  customer_age,\n  region,\n  amount\nFROM sales\nWHERE sale_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)\nORDER BY sale_date;`,
    insight:"✅ النتيجة: 50,000 سجل مبيعات جاهزة للتحليل."
  },
  {
    step:3, icon:"🧹", title:"تنظيف البيانات",
    content:"فحص البيانات ومعالجة المشاكل المكتشفة.",
    code:`import pandas as pd\n\ndf = pd.read_csv('sales.csv')\nprint(df.isnull().sum())\n# customer_age: 320 قيمة مفقودة\n\ndf['customer_age'].fillna(\n    df['customer_age'].median(), inplace=True\n)\ndf.drop_duplicates(inplace=True)\nprint(f"البيانات النظيفة: {len(df)} سجل")`,
    insight:"✅ تم معالجة 365 مشكلة في البيانات — 0.7% من الإجمالي."
  },
  {
    step:4, icon:"🔍", title:"الاستكشاف (EDA)",
    content:"تحليل الأنماط واكتشاف المشكلة الحقيقية.",
    code:`import pandas as pd\n\ncategory_sales = (\n    df.groupby(['category', 'month'])['amount']\n    .sum()\n    .unstack()\n)\nprint(category_sales)\n\n# النتيجة:\n# الإلكترونيات : -35%  ← المشكلة الرئيسية!\n# الملابس      : +5%\n# المنزل       : -2%`,
    insight:"🎯 الاكتشاف: فئة الإلكترونيات وحدها مسؤولة عن 80% من التراجع!"
  },
  {
    step:5, icon:"📊", title:"التحليل العميق",
    content:"تحليل سبب تراجع الإلكترونيات بالتحديد.",
    code:`# ارتباط السعر بالمبيعات\nelec = df[df['category'] == 'electronics']\ncorr = elec[['price', 'sales']].corr()\nprint(f"الارتباط: {corr.iloc[0,1]:.2f}")  # -0.78\n\n# بيانات خارجية: منافس خفّض أسعاره 20%\n# في أكتوبر — يتزامن مع بداية التراجع`,
    insight:"📌 السبب: منافس رئيسي خفّض أسعاره — ارتباط سلبي قوي بين سعرنا والمبيعات."
  },
  {
    step:6, icon:"📢", title:"التوصيات",
    content:"قرارات قابلة للتنفيذ مباشرةً بناءً على التحليل.",
    code:null,
    insight:"✅ تخفيض أسعار الإلكترونيات 10-15%\n✅ حملة تسويقية مستهدفة للفئة 25-35 سنة\n✅ عروض تجميعية مع فئة الملابس (Cross-sell)\n✅ مراقبة أسعار المنافسين أسبوعياً\n\n📈 النتيجة بعد 3 أشهر: +23% مبيعات"
  }
];

/* ─────────────────────────────────────────── */

const CHEAT_SHEETS = [
  {
    title:"📦 Pandas الأساسيات",
    code:`import pandas as pd\n\n# تحميل البيانات\ndf = pd.read_csv('file.csv')\ndf = pd.read_excel('file.xlsx')\n\n# استكشاف سريع\ndf.head()           # أول 5 صفوف\ndf.tail()           # آخر 5 صفوف\ndf.shape            # (صفوف, أعمدة)\ndf.info()           # أنواع البيانات\ndf.describe()       # إحصاء وصفي\ndf.isnull().sum()   # القيم المفقودة\ndf.duplicated().sum() # التكرارات`
  },
  {
    title:"🧹 تنظيف البيانات",
    code:`# القيم المفقودة\ndf.dropna()                      # حذف الصفوف\ndf.fillna(0)                     # تعبئة بصفر\ndf.fillna(df.mean(numeric_only=True))  # بالمتوسط\ndf['col'].fillna(method='ffill') # تعبئة للأمام\n\n# التكرارات\ndf.drop_duplicates(inplace=True)\n\n# تغيير النوع\ndf['age']  = df['age'].astype(int)\ndf['date'] = pd.to_datetime(df['date'])\ndf['cat']  = df['cat'].astype('category')`
  },
  {
    title:"📊 الإحصاء الوصفي",
    code:`import numpy as np\n\ndata = df['column']\n\n# النزعة المركزية\nnp.mean(data)        # المتوسط\nnp.median(data)      # الوسيط\ndata.mode()[0]       # المنوال\n\n# التشتت\nnp.std(data)         # الانحراف المعياري\nnp.var(data)         # التباين\ndata.quantile(.25)   # Q1 الربيع الأول\ndata.quantile(.75)   # Q3 الربيع الثالث\ndata.quantile(.75) - data.quantile(.25)  # IQR`
  },
  {
    title:"🔍 تصفية وتجميع",
    code:`# التصفية\ndf[df['age'] > 25]\ndf[(df['age'] > 25) & (df['city'] == 'الرياض')]\ndf[df['name'].str.contains('أحمد')]\ndf[df['status'].isin(['active', 'pending'])]\n\n# التجميع\ndf.groupby('category')['sales'].sum()\ndf.groupby('category').agg({\n    'sales':  ['sum', 'mean', 'count'],\n    'profit': 'sum'\n})\n\n# الترتيب\ndf.sort_values('sales', ascending=False)`
  },
  {
    title:"📈 التصوير السريع",
    code:`import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# مدرج تكراري\ndf['age'].hist(bins=20)\n\n# مخطط تشتت\nplt.scatter(df['x'], df['y'], alpha=0.6)\n\n# خريطة حرارة للارتباط\nsns.heatmap(df.corr(), annot=True, cmap='coolwarm')\n\n# مخطط صندوق\nsns.boxplot(x='category', y='sales', data=df)\n\n# مخطط شريطي\ndf.groupby('cat')['sales'].sum().plot(kind='bar')\n\nplt.tight_layout()\nplt.show()`
  },
  {
    title:"🤖 نموذج بسيط",
    code:`from sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import r2_score, mean_squared_error\nimport numpy as np\n\n# تقسيم البيانات\nX = df[['feature1', 'feature2']]\ny = df['target']\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\n# تدريب وتقييم\nmodel = LinearRegression().fit(X_train, y_train)\ny_pred = model.predict(X_test)\nprint(f"R²:   {r2_score(y_test, y_pred):.3f}")\nprint(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.3f}")`
  }
];

/* ─────────────────────────────────────────── */

const QUIZ = [
  {
    q:"ما الفرق الرئيسي بين المتوسط والوسيط؟",
    options:[
      "لا فرق بينهما — يعطيان نفس النتيجة دائماً",
      "الوسيط أقل تأثراً بالقيم الشاذة من المتوسط",
      "المتوسط دائماً أكبر من الوسيط",
      "الوسيط يُستخدم فقط للبيانات الفئوية"
    ],
    correct:1,
    explanation:"الوسيط يمثل القيمة الوسطى بعد الترتيب، لذا لا تؤثر فيه القيم المتطرفة كما يتأثر المتوسط. مثال: [1,2,3,4,100] — الوسيط=3 والمتوسط=22!"
  },
  {
    q:"ماذا يعني معامل ارتباط يساوي -0.9؟",
    options:[
      "لا علاقة بين المتغيرين",
      "ارتباط طردي قوي جداً",
      "ارتباط عكسي قوي جداً",
      "ارتباط ضعيف وغير مهم"
    ],
    correct:2,
    explanation:"القيمة -0.9 قريبة من -1 مما يعني ارتباطاً عكسياً قوياً جداً — عندما يرتفع أحد المتغيرين ينخفض الآخر بشكل واضح ومنتظم."
  },
  {
    q:"ما الخطوة التي يقضي فيها محللو البيانات أكثر وقتهم؟",
    options:[
      "النمذجة وتعلم الآلة",
      "تنظيف البيانات ومعالجتها",
      "عرض النتائج والتقارير",
      "جمع البيانات من المصادر"
    ],
    correct:1,
    explanation:"يُقدَّر أن المحللين يقضون 60-80% من وقتهم في تنظيف البيانات ومعالجتها — وهي الأساس الذي يبنى عليه أي تحليل موثوق."
  },
  {
    q:"ما الذي يكشفه الانحراف المعياري الكبير؟",
    options:[
      "البيانات متقاربة ومتجانسة حول المتوسط",
      "البيانات متشتتة وبعيدة عن المتوسط",
      "المتوسط مرتفع جداً",
      "وجود قيم شاذة فقط دون غيرها"
    ],
    correct:1,
    explanation:"الانحراف المعياري الكبير يعني أن القيم متباعدة عن المتوسط — تشتت عالٍ. مثال: درجات [20, 50, 80] لها انحراف أكبر بكثير من [48, 50, 52]."
  },
  {
    q:"ما الفرق بين Overfitting وUnderfitting؟",
    options:[
      "Overfitting = نموذج بسيط، Underfitting = نموذج معقد",
      "Overfitting = يحفظ بيانات التدريب ويفشل مع الجديدة، Underfitting = لا يتعلم الأنماط أصلاً",
      "لا فرق بينهما في الأداء العملي",
      "Overfitting أفضل دائماً لأنه يحقق دقة أعلى"
    ],
    correct:1,
    explanation:"Overfitting يحفظ البيانات التدريبية بشكل مفرط فيفشل مع بيانات جديدة. Underfitting لا يلتقط الأنماط الأساسية أصلاً. الهدف التوازن بينهما."
  }
];

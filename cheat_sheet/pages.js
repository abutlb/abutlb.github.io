const PAGES_DATA = [
  {
    slug:        "data_analysis",
    icon:        "📊",
    title:       "تحليل البيانات",
    subtitle:    "Data Analysis",
    desc:        "المصطلحات الأساسية، خطوات التحليل، دراسة حالة واقعية، وكود Python جاهز.",
    tags:        ["Python", "Pandas", "NumPy", "Statistics"],
    level:       "مبتدئ → متقدم",
    terms:       16,
    snippets:    6,
    status:      "published",
    color:       "indigo",
    updated:     "2026-04-19",
    image: {
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format&fit=crop",
      alt: "Data Analysis Dashboard"
    }
  },
  {
    slug:        "machine-learning",
    icon:        "🤖",
    title:       "تعلم الآلة",
    subtitle:    "Machine Learning",
    desc:        "الخوارزميات الأساسية، مقاييس التقييم، pipeline كامل من البيانات للنموذج.",
    tags:        ["Scikit-learn", "XGBoost", "Neural Nets"],
    level:       "متوسط → متقدم",
    terms:       20,
    snippets:    8,
    status:      "coming-soon",
    color:       "purple",
    updated:     null,
    image: {
      src: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80&auto=format&fit=crop",
      alt: "Machine Learning AI"
    }
  },
  {
    slug:        "sql",
    icon:        "🗃️",
    title:       "SQL",
    subtitle:    "Structured Query Language",
    desc:        "استعلامات SQL من الأساسيات إلى المتقدم — Joins، Subqueries، Window Functions.",
    tags:        ["PostgreSQL", "MySQL", "SQLite"],
    level:       "مبتدئ → متوسط",
    terms:       18,
    snippets:    10,
    status:      "coming-soon",
    color:       "yellow",
    updated:     null,
    image: {
      src: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80&auto=format&fit=crop",
      alt: "Database SQL"
    }
  },
  {
    slug:        "data-visualization",
    icon:        "📈",
    title:       "تصوير البيانات",
    subtitle:    "Data Visualization",
    desc:        "أنواع المخططات، متى تستخدم كل منها، وكيف تبني لوحة تحكم احترافية.",
    tags:        ["Matplotlib", "Seaborn", "Plotly", "Tableau"],
    level:       "مبتدئ → متوسط",
    terms:       14,
    snippets:    7,
    status:      "coming-soon",
    color:       "green",
    updated:     null,
    image: {
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&auto=format&fit=crop",
      alt: "Data Visualization Charts"
    }
  },
  {
    slug:        "python_basics",
    icon:        "🐍",
    title:       "Python الأساسيات",
    subtitle:    "Python Fundamentals",
    desc:        "البنى الأساسية، الدوال، OOP، والمكتبات الأكثر استخداماً في تحليل البيانات.",
    tags:        ["Python 3", "OOP", "List Comprehension"],
    level:       "مبتدئ",
    terms:       22,
    snippets:    12,
    status:      "published",
    color:       "blue",
    updated:     "2026-04-19",
    image: {
      src: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80&auto=format&fit=crop",
      alt: "Python Programming"
    }
  },
  {
    slug:        "statistics",
    icon:        "📐",
    title:       "الإحصاء",
    subtitle:    "Statistics",
    desc:        "الإحصاء الوصفي والاستدلالي، اختبارات الفرضيات، وتوزيعات الاحتمال.",
    tags:        ["Descriptive", "Inferential", "Hypothesis Testing"],
    level:       "متوسط → متقدم",
    terms:       24,
    snippets:    8,
    status:      "coming-soon",
    color:       "pink",
    updated:     null,
    image: {
      src: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80&auto=format&fit=crop",
      alt: "Statistics Math"
    }
  }
];

document.dispatchEvent(new CustomEvent('pages-loaded'));

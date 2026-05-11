const PAGES_DATA = [
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
    slug:        "sql",
    icon:        "🗃️",
    title:       "SQL",
    subtitle:    "Structured Query Language",
    desc:        "استعلامات SQL من الأساسيات إلى المتقدم — Joins، Subqueries، Window Functions.",
    tags:        ["PostgreSQL", "MySQL", "SQLite"],
    level:       "مبتدئ → متوسط",
    terms:       18,
    snippets:    10,
    status:      "published",
    color:       "yellow",
    updated:     "2026-05-11",
    image: {
      src: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80&auto=format&fit=crop",
      alt: "Database SQL"
    }
  },
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
    slug:        "statistics",
    icon:        "📐",
    title:       "الإحصاء",
    subtitle:    "Statistics",
    desc:        "الإحصاء الوصفي والاستدلالي، اختبارات الفرضيات، وتوزيعات الاحتمال.",
    tags:        ["Descriptive", "Inferential", "Hypothesis Testing"],
    level:       "متوسط → متقدم",
    terms:       24,
    snippets:    8,
    status:      "published",
    color:       "pink",
    updated:     "2026-05-11",
    image: {
      src: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80&auto=format&fit=crop",
      alt: "Statistics Math"
    }
  },
  {
    slug:        "data_visualization",
    icon:        "📈",
    title:       "تصوير البيانات",
    subtitle:    "Data Visualization",
    desc:        "أنواع المخططات، متى تستخدم كل منها، وكيف تبني لوحة تحكم احترافية.",
    tags:        ["Matplotlib", "Seaborn", "Plotly", "Tableau"],
    level:       "مبتدئ → متوسط",
    terms:       14,
    snippets:    5,
    status:      "published",
    color:       "green",
    updated:     "2026-05-11",
    image: {
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&auto=format&fit=crop",
      alt: "Data Visualization Charts"
    }
  },
  {
    slug:        "machine_learning",
    icon:        "🤖",
    title:       "تعلم الآلة",
    subtitle:    "Machine Learning",
    desc:        "الخوارزميات الأساسية، مقاييس التقييم، pipeline كامل من البيانات للنموذج.",
    tags:        ["Scikit-learn", "XGBoost", "Neural Nets"],
    level:       "متوسط → متقدم",
    terms:       20,
    snippets:    8,
    status:      "published",
    color:       "purple",
    updated:     "2026-05-11",
    image: {
      src: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80&auto=format&fit=crop",
      alt: "Machine Learning AI"
    }
  },
    {
    slug:        "data_cleaning",
    icon:        "🧹",
    title:       "تنظيف البيانات",
    subtitle:    "Data Cleaning",
    desc:        "معالجة القيم المفقودة، الشذوذ، التكرارات، وهندسة الميزات — أساس أي مشروع بيانات.",
    tags:        ["Pandas", "NumPy", "Scikit-learn", "Feature Engineering"],
    level:       "مبتدئ → متوسط",
    terms:       16,
    snippets:    8,
    status:      "coming_soon",
    color:       "orange",
    updated:     "2026-05-11",
    image: {
      src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80&auto=format&fit=crop",
      alt: "Data Cleaning Pipeline"
    }
  },
  {
    slug:        "databases",
    icon:        "🗄️",
    title:       "قواعد البيانات",
    subtitle:    "Databases",
    desc:        "تصميم قواعد البيانات العلائقية، PostgreSQL، NoSQL، وأنماط الاستعلام المتقدمة.",
    tags:        ["PostgreSQL", "MongoDB", "Redis", "Schema Design"],
    level:       "متوسط",
    terms:       18,
    snippets:    10,
    status:      "coming_soon",
    color:       "teal",
    updated:     "2026-05-11",
    image: {
      src: "https://images.unsplash.com/photo-1775259690399-22879d21e926?q=80&w=1170&auto=format&fit=crop",
      alt: "Database Architecture"
    }
  }

];

document.dispatchEvent(new CustomEvent('pages-loaded'));

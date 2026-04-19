/* ============================================================
   DATA.JS — Python Basics CheatSheet
============================================================ */

/* ══════════════════════════════════════════
   TERMS
══════════════════════════════════════════ */
const TERMS = [
  {
    id: 1,
    icon: "🐍",
    title: "المتغيرات وأنواع البيانات",
    en: "Variables & Data Types",
    category: "basics",
    level: "مبتدئ",
    short: "Python يحدد نوع المتغير تلقائياً — لا تحتاج تكتب النوع صراحةً.",
    desc: "Python لغة ذات تحديد ديناميكي للأنواع (Dynamically Typed)، بمعنى أن المتغير يأخذ نوعه من القيمة المسندة إليه. الأنواع الأساسية: int، float، str، bool، NoneType.",
    code: `# الأنواع الأساسية
x      = 42          # int
pi     = 3.14        # float
name   = "أحمد"      # str
active = True        # bool
empty  = None        # NoneType

# التحقق من النوع
print(type(x))       # <class 'int'>

# التحويل بين الأنواع
age_str = str(25)    # "25"
num     = int("10")  # 10
f       = float(5)   # 5.0

# f-string
print(f"مرحباً {name}، عمرك {x} سنة")`,
    example: "x = 10 ثم x = 'مرحبا' — Python يقبل هذا لأن النوع يتغير ديناميكياً."
  },
  {
    id: 2,
    icon: "📋",
    title: "القوائم",
    en: "Lists",
    category: "structures",
    level: "مبتدئ",
    short: "قائمة مرتبة وقابلة للتعديل تقبل أي نوع من البيانات.",
    desc: "List هي من أكثر هياكل البيانات استخداماً في Python. مرتبة، قابلة للتعديل (mutable)، وتقبل تكرار العناصر.",
    code: `fruits = ["تفاح", "موز", "برتقال"]

# الوصول
print(fruits[0])      # تفاح
print(fruits[-1])     # برتقال

# Slicing
print(fruits[0:2])    # ['تفاح', 'موز']

# التعديل
fruits.append("عنب")
fruits.insert(1, "مانجو")
fruits.remove("موز")
popped = fruits.pop()

# List Comprehension
squares = [x**2 for x in range(1, 6)]
evens   = [x for x in range(20) if x % 2 == 0]`,
    example: "fruits[-1] يعطي آخر عنصر — الفهرس السالب يعد من الآخر."
  },
  {
    id: 3,
    icon: "📦",
    title: "القواميس",
    en: "Dictionaries",
    category: "structures",
    level: "مبتدئ",
    short: "تخزين البيانات بصيغة مفتاح: قيمة — سريع جداً في البحث.",
    desc: "Dictionary يخزن البيانات كأزواج مفتاح-قيمة. منذ Python 3.7 يحافظ على ترتيب الإدراج. البحث فيه O(1) بسبب Hash Table.",
    code: `person = {
    "name": "أحمد",
    "age":  28,
    "city": "الرياض"
}

# الوصول
print(person["name"])
print(person.get("job", "N/A"))  # بدون خطأ

# التعديل
person["age"] = 29
person["job"] = "مطور"

# الحذف
del person["city"]

# التكرار
for key, value in person.items():
    print(f"{key}: {value}")

# Dict Comprehension
squares = {x: x**2 for x in range(1, 6)}`,
    example: "person.get('job', 'N/A') أأمن من person['job'] — لا يرمي KeyError لو المفتاح غير موجود."
  },
  {
    id: 4,
    icon: "🔒",
    title: "المجموعات والصفوف",
    en: "Sets & Tuples",
    category: "structures",
    level: "مبتدئ",
    short: "Tuple ثابتة لا تتغير، Set لا تقبل التكرار وسريعة في التحقق.",
    desc: "Tuple مثل List لكنها غير قابلة للتعديل (immutable). Set مجموعة غير مرتبة لا تقبل تكرار العناصر، ممتازة لعمليات المجموعات الرياضية.",
    code: `# Tuple
coords = (24.7, 46.7)
x, y   = coords       # Unpacking

# Set
tags = {"python", "data", "ml", "python"}
print(tags)  # {'python', 'data', 'ml'}

tags.add("ai")
tags.discard("data")

# عمليات المجموعات
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a & b)   # {3, 4}        — تقاطع
print(a | b)   # {1,2,3,4,5,6} — اتحاد
print(a - b)   # {1, 2}        — فرق
print(a ^ b)   # {1,2,5,6}     — فرق متماثل`,
    example: "set([1,1,2,2,3]) ينتج {1,2,3} — أسرع طريقة لإزالة المكررات."
  },
  {
    id: 5,
    icon: "🔄",
    title: "الحلقات",
    en: "Loops",
    category: "control",
    level: "مبتدئ",
    short: "for للتكرار على عناصر، while للتكرار بشرط — مع enumerate وzip.",
    desc: "Python توفر for loop أنيقة تتكرر على أي iterable مباشرة. enumerate تعطيك الفهرس مع العنصر، zip تجمع قوائم متعددة.",
    code: `fruits = ["تفاح", "موز", "عنب"]

# for عادي
for fruit in fruits:
    print(fruit)

# range
for i in range(2, 10, 2):  # 2,4,6,8
    print(i)

# enumerate
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}. {fruit}")

# zip
names  = ["أحمد", "سارة", "محمد"]
scores = [95, 88, 92]
for name, score in zip(names, scores):
    print(f"{name}: {score}")

# while
count = 0
while count < 5:
    count += 1`,
    example: "enumerate(list, start=1) يعطيك الفهرس والعنصر معاً — لا تحتاج متغير i منفصل."
  },
  {
    id: 6,
    icon: "⚙️",
    title: "الدوال",
    en: "Functions",
    category: "functions",
    level: "مبتدئ",
    short: "كتلة كود قابلة لإعادة الاستخدام — تدعم قيم افتراضية وargs وkwargs.",
    desc: "الدوال في Python تُعرَّف بـ def. تدعم قيم افتراضية، *args لعدد غير محدد من الوسائط، **kwargs لوسائط مسماة، وإرجاع قيم متعددة.",
    code: `# قيمة افتراضية
def power(base, exp=2):
    return base ** exp

print(power(3))      # 9
print(power(2, 10))  # 1024

# *args
def total(*numbers):
    return sum(numbers)

print(total(1, 2, 3, 4))  # 10

# **kwargs
def profile(**info):
    for k, v in info.items():
        print(f"{k}: {v}")

profile(name="أحمد", age=28)

# إرجاع قيم متعددة
def min_max(lst):
    return min(lst), max(lst)

lo, hi = min_max([3, 1, 9, 2])

# Lambda
nums = [3, 1, 4, 1, 5]
nums.sort(key=lambda x: -x)`,
    example: "def add(a, b=0): return a+b — استدعاء add(5) يعطي 5 بدون خطأ."
  },
  {
    id: 7,
    icon: "🏗️",
    title: "البرمجة الكائنية",
    en: "OOP — Classes",
    category: "oop",
    level: "متوسط",
    short: "تنظيم الكود في كائنات تجمع البيانات والسلوك معاً.",
    desc: "OOP في Python تقوم على الكلاسات. كل كلاس يحدد خصائص (attributes) وسلوكيات (methods). تدعم الوراثة والتغليف وتعدد الأشكال.",
    code: `class Animal:
    kingdom = "Animalia"  # class attribute

    def __init__(self, name, sound):
        self.name  = name
        self.sound = sound
        self._age  = 0

    def speak(self):
        return f"{self.name} يقول: {self.sound}"

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError("العمر لا يكون سالباً")
        self._age = value

# الوراثة
class Dog(Animal):
    def __init__(self, name):
        super().__init__(name, "هاو")

    def speak(self):
        return super().speak() + " 🐕"

dog = Dog("ريكس")
print(dog.speak())
dog.age = 3`,
    example: "super().__init__() يستدعي constructor الكلاس الأب — ضروري عند الوراثة."
  },
  {
    id: 8,
    icon: "⚠️",
    title: "معالجة الأخطاء",
    en: "Exception Handling",
    category: "advanced",
    level: "متوسط",
    short: "try/except/finally لالتقاط الأخطاء ومنع تعطل البرنامج.",
    desc: "Exception Handling يمنع البرنامج من التوقف المفاجئ. try يحتوي الكود الخطر، except يلتقط الخطأ، else ينفذ إذا لم يكن هناك خطأ، finally ينفذ دائماً.",
    code: `try:
    data   = int(input("أدخل رقماً: "))
    result = 100 / data
except ValueError:
    print("الإدخال ليس رقماً!")
except ZeroDivisionError:
    print("لا يمكن القسمة على صفر!")
except Exception as e:
    print(f"خطأ غير متوقع: {e}")
else:
    print(f"النتيجة: {result}")
finally:
    print("انتهى البرنامج")

# خطأ مخصص
class AgeError(ValueError):
    pass

def set_age(age):
    if age < 0 or age > 150:
        raise AgeError(f"عمر غير صالح: {age}")
    return age

# Context Manager
with open("file.txt", "r") as f:
    content = f.read()`,
    example: "finally ينفذ دائماً حتى لو حدث خطأ — مثالي لإغلاق الاتصالات والملفات."
  },
  {
    id: 9,
    icon: "🎯",
    title: "Decorators",
    en: "Decorators",
    category: "advanced",
    level: "متقدم",
    short: "دوال تُغلّف دوالاً أخرى لإضافة سلوك إضافي بدون تعديل الكود الأصلي.",
    desc: "Decorator يسمح بإضافة وظيفة لدالة موجودة بدون تعديلها. يُستخدم في: Logging، Caching، Authentication، Timing.",
    code: `import time, functools

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start  = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} ← {time.time()-start:.4f}s")
        return result
    return wrapper

@timer
def slow():
    time.sleep(1)
    return "تم!"

slow()  # slow ← 1.0012s

# Decorator مع معاملات
def repeat(n):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("مرحبا!")

# lru_cache
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2: return n
    return fibonacci(n-1) + fibonacci(n-2)`,
    example: "@timer فوق أي دالة يقيس وقت تنفيذها تلقائياً بدون تعديل الدالة نفسها."
  },
  {
    id: 10,
    icon: "🔁",
    title: "Generators",
    en: "Generators & Iterators",
    category: "advanced",
    level: "متقدم",
    short: "توليد القيم واحدة بواحدة بدل تخزينها كلها في الذاكرة.",
    desc: "Generator دالة تستخدم yield بدل return. تولّد القيم عند الطلب (lazy evaluation) مما يوفر الذاكرة مع البيانات الضخمة.",
    code: `import sys

def countdown(n):
    while n > 0:
        yield n
        n -= 1

for num in countdown(5):
    print(num)  # 5,4,3,2,1

# Generator Expression
squares_gen = (x**2 for x in range(1_000_000))
print(next(squares_gen))  # 0
print(next(squares_gen))  # 1

# مقارنة الذاكرة
list_c = [x**2 for x in range(10000)]
gen_e  = (x**2 for x in range(10000))

print(sys.getsizeof(list_c))  # ~87624 bytes
print(sys.getsizeof(gen_e))   # ~208 bytes فقط!

# قراءة ملف ضخم
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield line.strip()`,
    example: "(x**2 for x in range(1M)) يحجز 208 bytes فقط بينما القائمة تحجز ~8MB."
  },
  {
    id: 11,
    icon: "📁",
    title: "التعامل مع الملفات",
    en: "File Handling",
    category: "basics",
    level: "مبتدئ",
    short: "قراءة وكتابة الملفات النصية وJSON وCSV بسهولة.",
    desc: "Python تتعامل مع الملفات عبر open() مع Context Manager. تدعم أوضاع: r للقراءة، w للكتابة، a للإلحاق.",
    code: `# قراءة
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()
    lines   = f.readlines()

# كتابة
with open("out.txt", "w", encoding="utf-8") as f:
    f.write("مرحباً!\n")

# JSON
import json

data = {"name": "أحمد", "skills": ["Python", "SQL"]}

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open("data.json", "r", encoding="utf-8") as f:
    loaded = json.load(f)

# CSV
import csv

with open("data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name","age"])
    writer.writeheader()
    writer.writerow({"name": "أحمد", "age": 28})`,
    example: "with open() يغلق الملف تلقائياً حتى لو حدث خطأ — أفضل من open/close اليدوي."
  },
  {
    id: 12,
    icon: "⚡",
    title: "Comprehensions",
    en: "List & Dict Comprehensions",
    category: "advanced",
    level: "متوسط",
    short: "كتابة حلقات وتحويلات في سطر واحد أنيق وأسرع.",
    desc: "Comprehensions طريقة Python الأنيقة لبناء قوائم وقواميس ومجموعات في سطر واحد. أسرع من الحلقات التقليدية لأنها محسّنة داخلياً.",
    code: `# List
squares = [x**2 for x in range(10)]
evens   = [x for x in range(20) if x % 2 == 0]
clean   = [n.strip() for n in ["  أحمد  ", "  سارة  "]]

# Dict
word_len = {w: len(w) for w in ["python", "data", "ml"]}
# {'python': 6, 'data': 4, 'ml': 2}

# Set
unique_sq = {x**2 for x in [-2,-1,0,1,2]}
# {0, 1, 4}

# Nested — تسطيح قائمة
matrix = [[1,2,3],[4,5,6],[7,8,9]]
flat   = [n for row in matrix for n in row]
# [1,2,3,4,5,6,7,8,9]

# مع شرط مركب
results = [
    x for x in range(100)
    if x % 2 == 0
    if x % 3 == 0
]  # مضاعفات 6`,
    example: "[x**2 for x in range(10) if x%2==0] — مربعات الأعداد الزوجية في سطر واحد."
  },
  {
    id: 13,
    icon: "🧵",
    title: "البرمجة الوظيفية",
    en: "Functional Programming",
    category: "advanced",
    level: "متوسط",
    short: "map وfilter وreduce وlambda لمعالجة البيانات بأسلوب وظيفي.",
    desc: "Python تدعم البرمجة الوظيفية عبر: map لتطبيق دالة على كل عنصر، filter للتصفية، reduce للتجميع، lambda للدوال المجهولة.",
    code: `from functools import reduce

nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# map
squares = list(map(lambda x: x**2, nums))

# filter
evens   = list(filter(lambda x: x % 2 == 0, nums))

# reduce
total   = reduce(lambda acc, x: acc + x, nums)  # 55

# sorted مع key
people = [
    {"name": "أحمد", "age": 28},
    {"name": "سارة", "age": 24},
]
by_age = sorted(people, key=lambda p: p["age"])

# any / all
has_even = any(x % 2 == 0 for x in nums)  # True
all_pos  = all(x > 0      for x in nums)  # True

# zip + map
a    = [1, 2, 3]
b    = [4, 5, 6]
sums = list(map(lambda x, y: x + y, a, b))
# [5, 7, 9]`,
    example: "list(map(str, [1,2,3])) يحول القائمة لـ ['1','2','3'] في سطر واحد."
  },
  {
    id: 14,
    icon: "⏱️",
    title: "Async / Await",
    en: "Asynchronous Programming",
    category: "advanced",
    level: "متقدم",
    short: "تنفيذ مهام متعددة بالتوازي دون حجب البرنامج — مثالي لـ API calls.",
    desc: "asyncio يتيح البرمجة غير المتزامنة. async def تعرّف coroutine، await تنتظر نتيجة عملية بطيئة دون حجب باقي الكود.",
    code: `import asyncio

async def greet(name, delay):
    await asyncio.sleep(delay)
    print(f"مرحباً {name}!")

async def main():
    # بالتوازي — يستغرق 2 ثانية فقط
    await asyncio.gather(
        greet("أحمد",  1),
        greet("سارة",  2),
        greet("محمد",  1.5),
    )

asyncio.run(main())

# طلبات HTTP متوازية
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.json()

async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, u) for u in urls]
        return await asyncio.gather(*tasks)`,
    example: "asyncio.gather() يشغل 10 طلبات API بالتوازي بدل الانتظار واحداً تلو الآخر."
  }
];

/* ══════════════════════════════════════════
   PROCESS STEPS
══════════════════════════════════════════ */
const PROCESS_STEPS = [
  {
    num: "01",
    icon: "🛠️",
    title: "تثبيت Python وإعداد البيئة",
    desc: "تحميل Python وإعداد virtual environment وتثبيت المكتبات",
    time: "10%",
    details: [
      "تحميل Python 3.11+ من python.org",
      "إنشاء virtual environment بـ python -m venv env",
      "تفعيل البيئة: source env/bin/activate",
      "تثبيت المكتبات: pip install",
      "إعداد VS Code مع Python extension"
    ],
    tools: ["Python 3.11+", "pip", "venv", "VS Code", "Jupyter"]
  },
  {
    num: "02",
    icon: "📐",
    title: "الأساسيات والبنى",
    desc: "المتغيرات، الشروط، الحلقات، وهياكل البيانات",
    time: "25%",
    details: [
      "أنواع البيانات: int, float, str, bool, None",
      "هياكل البيانات: list, dict, set, tuple",
      "الشروط: if / elif / else",
      "الحلقات: for, while, enumerate, zip",
      "String formatting وf-strings"
    ],
    tools: ["REPL", "Jupyter Notebook", "Python Tutor"]
  },
  {
    num: "03",
    icon: "⚙️",
    title: "الدوال والوحدات",
    desc: "كتابة دوال قابلة لإعادة الاستخدام وتنظيم الكود",
    time: "20%",
    details: [
      "تعريف الدوال بـ def وإرجاع القيم",
      "المعاملات الافتراضية و*args و**kwargs",
      "Lambda functions",
      "استيراد الوحدات والمكتبات",
      "إنشاء modules وpackages"
    ],
    tools: ["functools", "itertools", "collections", "os", "sys"]
  },
  {
    num: "04",
    icon: "🏗️",
    title: "البرمجة الكائنية OOP",
    desc: "Classes، Inheritance، وDesign Patterns",
    time: "20%",
    details: [
      "تعريف Classes وInstance attributes",
      "الوراثة والـ super()",
      "Dunder methods: __init__, __repr__, __str__",
      "Properties وsetters",
      "Dataclasses للكلاسات البسيطة"
    ],
    tools: ["abc", "dataclasses", "pydantic"]
  },
  {
    num: "05",
    icon: "🚀",
    title: "المفاهيم المتقدمة",
    desc: "Decorators، Generators، Async، وType Hints",
    time: "25%",
    details: [
      "Decorators وfunctools.wraps",
      "Generators ويكلد yield",
      "Context Managers وwith",
      "Async / Await وasyncio",
      "Type Hints وmypy"
    ],
    tools: ["asyncio", "aiohttp", "mypy", "typing", "contextlib"]
  }
];

/* ══════════════════════════════════════════
   CASE STUDY
══════════════════════════════════════════ */
const CASE_STEPS = [
  {
    step: "01",
    icon: "🎯",
    title: "المشكلة: تحليل بيانات المبيعات",
    content: "لديك ملف CSV يحتوي 50,000 سجل مبيعات. المطلوب: تنظيف البيانات، حساب الإحصائيات، وإيجاد أفضل 10 منتجات — بدون أي مكتبة خارجية.",
    code: null,
    insight: "📋 البيانات الخام:\n• 50,000 صف\n• أعمدة: date, product, qty, price, customer\n• مشاكل: قيم مفقودة، تواريخ بصيغ مختلفة، أسماء مكررة"
  },
  {
    step: "02",
    icon: "📥",
    title: "قراءة وتنظيف البيانات",
    content: "نقرأ الملف ونعالج المشاكل الشائعة: القيم المفقودة، التكرارات، وتوحيد الصيغ.",
    code: `import csv
from datetime import datetime

def load_sales(filepath):
    sales = []
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                sale = {
                    "date":    datetime.strptime(
                                 row["date"].strip(), "%Y-%m-%d"),
                    "product": row["product"].strip().lower(),
                    "qty":     int(row["qty"]   or 0),
                    "price":   float(row["price"] or 0),
                }
                if sale["qty"] > 0 and sale["price"] > 0:
                    sales.append(sale)
            except (ValueError, KeyError):
                continue
    return sales

sales = load_sales("sales.csv")
print(f"✓ تم تحميل {len(sales):,} سجل نظيف")`,
    insight: "💡 نتيجة التنظيف:\n• قبل: 50,000 صف\n• بعد: 47,832 صف صالح\n• محذوف: 2,168 صف تالف"
  },
  {
    step: "03",
    icon: "📊",
    title: "حساب الإحصائيات",
    content: "نحسب إجمالي المبيعات والمتوسط والانحراف المعياري.",
    code: `import statistics

revenues = [s["qty"] * s["price"] for s in sales]

stats = {
    "total":  sum(revenues),
    "mean":   statistics.mean(revenues),
    "median": statistics.median(revenues),
    "stdev":  statistics.stdev(revenues),
    "min":    min(revenues),
    "max":    max(revenues),
}

print(f"إجمالي الإيرادات: {stats['total']:,.0f} ريال")
print(f"متوسط الصفقة:     {stats['mean']:,.2f} ريال")`,
    insight: "📈 الإحصائيات:\n• إجمالي الإيرادات: 2,847,320 ريال\n• متوسط الصفقة: 59.5 ريال\n• أعلى صفقة: 4,200 ريال"
  },
  {
    step: "04",
    icon: "🏆",
    title: "أفضل 10 منتجات",
    content: "نجمّع المبيعات بالمنتج ونرتبها تنازلياً.",
    code: `from collections import defaultdict

by_product = defaultdict(lambda: {"revenue": 0, "qty": 0})
for s in sales:
    p = s["product"]
    by_product[p]["revenue"] += s["qty"] * s["price"]
    by_product[p]["qty"]     += s["qty"]

top10 = sorted(
    by_product.items(),
    key=lambda item: item[1]["revenue"],
    reverse=True
)[:10]

print(f"{'الرتبة':<6} {'المنتج':<25} {'الإيراد':>15}")
print("-" * 50)
for rank, (product, data) in enumerate(top10, 1):
    print(f"{rank:<6} {product.title():<25} "
          f"{data['revenue']:>14,.0f}")`,
    insight: "🎯 النتيجة:\n• أفضل منتج: لابتوب برو — 340,200 ريال\n• أعلى 10 منتجات = 68% من الإيرادات"
  },
  {
    step: "05",
    icon: "💾",
    title: "حفظ النتائج",
    content: "نحفظ التقرير النهائي بصيغة JSON وCSV.",
    code: `import json

report = {
    "generated_at": datetime.now().isoformat(),
    "total_records": len(sales),
    "statistics":    stats,
    "top_products": [
        {"rank": i+1, "product": p.title(),
         "revenue": round(d["revenue"], 2), "qty": d["qty"]}
        for i, (p, d) in enumerate(top10)
    ]
}

with open("report.json", "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False,
              indent=2, default=str)

with open("top10.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(
        f, fieldnames=["rank","product","revenue","qty"])
    writer.writeheader()
    writer.writerows(report["top_products"])

print("✅ تم حفظ report.json و top10.csv")`,
    insight: "✅ الملفات المنتجة:\n• report.json — تقرير كامل\n• top10.csv — جاهز لـ Excel\n• وقت التنفيذ: 1.2 ثانية"
  }
];

/* ══════════════════════════════════════════
   CHEAT SHEETS
══════════════════════════════════════════ */
const CHEAT_SHEETS = [
  {
    title: "🔤 String Methods",
    code: `s = "  Hello, World!  "

s.strip()            # "Hello, World!"
s.lower()            # "  hello, world!  "
s.upper()            # "  HELLO, WORLD!  "
s.replace("o", "0")  # "  Hell0, W0rld!  "
s.split(",")         # ['  Hello', ' World!  ']
s.startswith("  H")  # True
s.find("World")      # 9
s.count("l")         # 3
s.strip().title()    # "Hello, World!"
",".join(["a","b"])  # "a,b"
f"{'x':^10}"         # "    x     "`
  },
  {
    title: "📋 List Methods",
    code: `lst = [3, 1, 4, 1, 5, 9]

lst.append(7)          # إضافة للآخر
lst.insert(0, 0)       # إضافة في موضع
lst.remove(1)          # حذف أول تطابق
lst.pop()              # حذف وإرجاع الأخير
lst.sort()             # ترتيب تصاعدي
lst.sort(reverse=True) # ترتيب تنازلي
sorted(lst)            # نسخة مرتبة جديدة
lst.reverse()          # عكس
lst.index(5)           # موضع العنصر
lst.count(1)           # عدد مرات التكرار
lst.extend([8, 9])     # دمج قائمة
lst.clear()            # تفريغ
len(lst)               # الطول
5 in lst               # True / False`
  },
  {
    title: "📦 Dict Methods",
    code: `d = {"a": 1, "b": 2, "c": 3}

d.keys()              # dict_keys([...])
d.values()            # dict_values([...])
d.items()             # dict_items([...])
d.get("x", 0)         # 0 بدون KeyError
d.setdefault("d", 4)  # يضيف لو غير موجود
d.update({"e": 5})    # دمج قاموس
d.pop("a")            # حذف وإرجاع
d.copy()              # نسخة سطحية
d.clear()             # تفريغ

# دمج قاموسين (Python 3.9+)
merged = d1 | d2
d1 |= d2`
  },
  {
    title: "🔢 Built-in Functions",
    code: `nums = [3, 1, 4, 1, 5, 9]

len(nums)          # 6
sum(nums)          # 23
min(nums)          # 1
max(nums)          # 9
abs(-5)            # 5
round(3.14159, 2)  # 3.14
pow(2, 10)         # 1024
divmod(17, 5)      # (3, 2)

# تحويل الأنواع
int("42")          # 42
float("3.14")      # 3.14
str(100)           # "100"
list("abc")        # ['a','b','c']
set([1,1,2])       # {1, 2}

# أخرى
enumerate(nums)    # (0,3),(1,1),...
zip([1,2],[3,4])   # (1,3),(2,4)
any(x>5 for x in nums)  # True
all(x>0 for x in nums)  # True`
  },
  {
    title: "🎨 F-Strings متقدمة",
    code: `score = 95.678
num   = 1234567

f"{score:.2f}"        # "95.68"
f"{num:,}"            # "1,234,567"
f"{0.85:.1%}"         # "85.0%"
f"{255:08b}"          # "11111111"
f"{255:#x}"           # "0xff"

# محاذاة
f"{'left':<10}|"      # "left      |"
f"{'right':>10}|"     # "      right|"
f"{'center':^10}|"    # "  center  |"
f"{'fill':*^10}|"     # "**fill****|"

# تعبيرات
f"{2 ** 10}"          # "1024"
f"{'✓' if score>90 else '✗'}"  # "✓"`
  },
  {
    title: "⚡ One-Liners مفيدة",
    code: `# قلب قائمة
rev = lst[::-1]

# إزالة المكررات مع الحفاظ على الترتيب
unique = list(dict.fromkeys(lst))

# تسطيح قائمة متداخلة
flat = [x for sub in nested for x in sub]

# أكثر عنصر تكراراً
from collections import Counter
most = Counter(lst).most_common(1)[0]

# Swap متغيرين
a, b = b, a

# قيمة افتراضية
value = data.get("key") or "افتراضي"

# دمج قوائم
combined = [*list1, *list2]

# فرز قاموس بالقيمة
sorted_d = dict(sorted(d.items(), key=lambda x: x[1]))

# تحويل قائمتين لقاموس
d = dict(zip(keys, values))`
  }
];

/* ══════════════════════════════════════════
   QUIZ
══════════════════════════════════════════ */
const QUIZ = [
  {
    q: "ما الفرق بين list و tuple في Python؟",
    options: [
      "لا فرق، كلاهما متطابق",
      "List قابلة للتعديل (mutable)، Tuple غير قابلة للتعديل (immutable)",
      "Tuple أسرع في الإضافة والحذف",
      "List لا تقبل أنواع مختلطة"
    ],
    correct: 1,
    explanation: "List يمكن تعديلها بعد الإنشاء (append, remove...)، بينما Tuple ثابتة — مما يجعلها أسرع في القراءة وأكثر أماناً للبيانات الثابتة."
  },
  {
    q: "ما ناتج: [x**2 for x in range(5) if x % 2 != 0]؟",
    options: [
      "[0, 1, 4, 9, 16]",
      "[1, 9]",
      "[1, 4, 9]",
      "[0, 4, 16]"
    ],
    correct: 1,
    explanation: "range(5) يعطي [0,1,2,3,4]. الشرط x%2!=0 يبقي الأفراد [1,3]. مربعاتهم [1, 9]."
  },
  {
    q: "ما الكلمة المفتاحية التي تحول دالة عادية إلى Generator؟",
    options: ["return", "async", "yield", "generate"],
    correct: 2,
    explanation: "yield تحول الدالة لـ Generator — تولّد قيمة واحدة في كل مرة وتحافظ على حالتها بين الاستدعاءات."
  },
  {
    q: "ما الفرق بين == و is في Python؟",
    options: [
      "لا فرق، كلاهما يقارن القيم",
      "== يقارن القيم، is يقارن هوية الكائن في الذاكرة",
      "is يقارن القيم، == يقارن الأنواع",
      "== للأرقام فقط، is للنصوص فقط"
    ],
    correct: 1,
    explanation: "== يتحقق من تساوي القيم. is يتحقق من أن المتغيرين يشيران لنفس الكائن في الذاكرة. لا تستخدم is لمقارنة القيم!"
  },
  {
    q: "ما ناتج: dict.fromkeys(['a','b','c'], 0)؟",
    options: [
      "{'a': None, 'b': None, 'c': None}",
      "['a', 'b', 'c']",
      "{'a': 0, 'b': 0, 'c': 0}",
      "خطأ في الكود"
    ],
    correct: 2,
    explanation: "dict.fromkeys(iterable, value) ينشئ قاموساً بمفاتيح من الـ iterable وكل قيمة تساوي value المحددة."
  },
  {
    q: "ما الغرض من @functools.wraps في الـ Decorator؟",
    options: [
      "تسريع تنفيذ الـ Decorator",
      "الحفاظ على اسم وdocstring الدالة الأصلية",
      "منع تداخل الـ Decorators",
      "تحويل الدالة لـ async"
    ],
    correct: 1,
    explanation: "بدون @functools.wraps، اسم الدالة المُزيّنة يصبح 'wrapper'. wraps@ يحافظ على __name__ و__doc__ الأصليين."
  },
  {
    q: "أي من التالي يوفّر الذاكرة أكثر مع بيانات ضخمة؟",
    options: [
      "[x**2 for x in range(1000000)]",
      "(x**2 for x in range(1000000))",
      "list(map(lambda x: x**2, range(1000000)))",
      "tuple(x**2 for x in range(1000000))"
    ],
    correct: 1,
    explanation: "Generator Expression (الأقواس الدائرية) يولّد القيم عند الطلب فقط — يحجز ~208 bytes بينما القائمة تحجز ~8MB."
  },
  {
    q: "ما الناتج: a, *b, c = [1, 2, 3, 4, 5]؟",
    options: [
      "خطأ في الكود",
      "a=1, b=[2,3,4], c=5",
      "a=1, b=2, c=5",
      "a=[1], b=[2,3,4], c=[5]"
    ],
    correct: 1,
    explanation: "Extended Unpacking في Python — * يجمع العناصر الوسطى في قائمة. a=1 (أول)، b=[2,3,4] (الوسط)، c=5 (آخر)."
  }
];

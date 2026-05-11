/* ============================================================
   DATA.JS — sql page
============================================================ */

const TERMS = [
  {
    id:1, icon:"🔍", title:"SELECT & WHERE", en:"SELECT & WHERE",
    category:"أساسيات", level:"مبتدئ",
    short:"حجر الأساس — حدد الأعمدة التي تريدها وصفّها بشروط.",
    desc:"SELECT تحدد الأعمدة التي تريد استرجاعها، FROM تحدد الجدول، WHERE تصفي الصفوف بناءً على شروط. تجنب SELECT * في الإنتاج لأنه يجلب بيانات غير ضرورية ويبطئ الاستعلام.",
    formula:"SELECT col1, col2 FROM table WHERE condition;",
    code:`-- استرجاع العملاء النشطين فوق 25 سنة
SELECT name, email, age
FROM customers
WHERE status = 'active'
  AND age > 25
ORDER BY age DESC;`,
    example:"💡 تجنب SELECT * دائماً — حدد الأعمدة التي تحتاجها فقط لتحسين الأداء."
  },
  {
    id:2, icon:"🔗", title:"JOINs", en:"JOINs",
    category:"أساسيات", level:"مبتدئ",
    short:"دمج صفوف من جدولين عبر عمود مشترك.",
    desc:"INNER JOIN يجلب الصفوف المتطابقة فقط. LEFT JOIN يجلب كل صفوف الجدول الأيسر والمتطابق من الأيمن (NULL إذا لم يوجد). RIGHT JOIN عكسه. FULL JOIN يجلب الكل.",
    formula:"SELECT ... FROM A [INNER|LEFT|RIGHT] JOIN B ON A.id = B.a_id;",
    code:`-- كل طلب مع اسم العميل (حتى لو لا يوجد عميل → NULL)
SELECT
  o.order_id,
  o.amount,
  c.name AS customer_name
FROM orders AS o
LEFT JOIN customers AS c ON o.customer_id = c.id;`,
    example:"💡 INNER JOIN = تقاطع، LEFT JOIN = كل اليسار + ما يقابله من اليمين."
  },
  {
    id:3, icon:"📊", title:"GROUP BY & HAVING", en:"GROUP BY & HAVING",
    category:"أساسيات", level:"متوسط",
    short:"جمّع الصفوف ثم صفّ المجموعات — WHERE للصفوف، HAVING للمجموعات.",
    desc:"GROUP BY يجمّع الصفوف بنفس القيمة. دوال التجميع: COUNT, SUM, AVG, MIN, MAX. HAVING تصفي بعد التجميع (لا يمكن استخدام WHERE مع دوال التجميع).",
    formula:"SELECT col, AGG() FROM table GROUP BY col HAVING AGG() > val;",
    code:`-- أفضل 5 عملاء بالمبيعات (أكثر من 3 طلبات)
SELECT
  customer_id,
  COUNT(*)       AS total_orders,
  SUM(amount)    AS total_sales,
  AVG(amount)    AS avg_order
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING COUNT(*) > 3
ORDER BY total_sales DESC
LIMIT 5;`,
    example:"💡 WHERE تعمل قبل التجميع، HAVING تعمل بعده — هذا الفرق الجوهري."
  },
  {
    id:4, icon:"🪟", title:"Window Functions", en:"Window Functions",
    category:"متقدم", level:"متقدم",
    short:"احسب على نافذة من الصفوف دون دمجها — الأقوى في SQL.",
    desc:"تختلف عن GROUP BY بأنها لا تدمج الصفوف. PARTITION BY تقسم البيانات لمجموعات، ORDER BY تحدد الترتيب داخل النافذة. دوال شائعة: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM, AVG.",
    formula:"FUNC() OVER (PARTITION BY col ORDER BY col ROWS BETWEEN ...)",
    code:`-- ترتيب الموظفين بالراتب داخل كل قسم + المتوسط المتحرك
SELECT
  name,
  department,
  salary,
  RANK()        OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
  AVG(salary)   OVER (PARTITION BY department)                      AS dept_avg,
  LAG(salary,1) OVER (PARTITION BY department ORDER BY salary DESC) AS prev_salary
FROM employees;`,
    example:"💡 ترتيب الطلاب داخل كل فصل بشكل منفصل — بدون Window Functions ستحتاج استعلامات فرعية معقدة."
  },
  {
    id:5, icon:"📜", title:"CTE", en:"Common Table Expression",
    category:"متقدم", level:"متوسط",
    short:"جدول مؤقت مسمى داخل الاستعلام — يجعل الكود أوضح وأسهل للصيانة.",
    desc:"CTE تبدأ بـ WITH وتعيش فقط داخل الاستعلام الواحد. تسمح بتقسيم المنطق المعقد لخطوات، وإعادة استخدام نفس الاستعلام الفرعي أكثر من مرة. Recursive CTE تحل مشاكل البيانات الهرمية.",
    formula:"WITH name AS (SELECT ...) SELECT ... FROM name;",
    code:`-- أعلى منطقة مبيعاً في كل شهر
WITH monthly_sales AS (
  SELECT
    region,
    DATE_TRUNC('month', sale_date) AS month,
    SUM(amount)                    AS total
  FROM sales
  GROUP BY region, month
),
ranked AS (
  SELECT *,
    RANK() OVER (PARTITION BY month ORDER BY total DESC) AS rnk
  FROM monthly_sales
)
SELECT region, month, total
FROM ranked
WHERE rnk = 1;`,
    example:"💡 بدلاً من Subquery متداخلة معقدة، قسّم المنطق لخطوات مسماة واضحة."
  },
  {
    id:6, icon:"🔎", title:"Subquery", en:"Subquery",
    category:"متقدم", level:"متوسط",
    short:"استعلام داخل استعلام — في SELECT أو WHERE أو FROM.",
    desc:"Subquery يمكن أن يكون في WHERE (لتصفية بناءً على نتيجة)، في FROM (كجدول مؤقت)، أو في SELECT (كعمود محسوب). Correlated Subquery يشير للاستعلام الخارجي وهو أبطأ — استبدله بـ JOIN أو CTE عند الإمكان.",
    formula:"SELECT ... FROM t WHERE col IN (SELECT col FROM t2 WHERE ...);",
    code:`-- العملاء الذين أنفقوا أكثر من متوسط الكل
SELECT name, total_spent
FROM customers
WHERE total_spent > (
  SELECT AVG(total_spent) FROM customers
);

-- استخدام Subquery في FROM
SELECT dept, avg_sal
FROM (
  SELECT department AS dept, AVG(salary) AS avg_sal
  FROM employees
  GROUP BY department
) AS dept_summary
WHERE avg_sal > 5000;`,
    example:"💡 إذا كان الـ Subquery يُنفَّذ لكل صف (Correlated) → استبدله بـ JOIN لتحسين الأداء."
  },
  {
    id:7, icon:"🔑", title:"Primary & Foreign Key", en:"Primary & Foreign Key",
    category:"أساسيات", level:"مبتدئ",
    short:"المفاتيح التي تضمن سلامة البيانات وتربط الجداول.",
    desc:"Primary Key: معرّف فريد لكل صف، لا يقبل NULL ولا تكرار. Foreign Key: يشير لـ Primary Key في جدول آخر ويضمن التكامل المرجعي — لا يمكن إضافة قيمة غير موجودة في الجدول الأصل.",
    formula:null,
    code:`CREATE TABLE customers (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  amount      DECIMAL(10,2),
  FOREIGN KEY (customer_id)
    REFERENCES customers(id)
    ON DELETE CASCADE
);`,
    example:"💡 ON DELETE CASCADE: عند حذف عميل تُحذف طلباته تلقائياً. ON DELETE RESTRICT: يمنع الحذف إذا وجدت طلبات."
  },
  {
    id:8, icon:"⚡", title:"Index", en:"Index",
    category:"أداء", level:"متوسط",
    short:"هيكل بيانات يسرّع البحث — كفهرس الكتاب.",
    desc:"Index يسرّع استعلامات WHERE و JOIN و ORDER BY على الأعمدة المفهرسة. لكنه يبطئ INSERT/UPDATE/DELETE ويأخذ مساحة. أضف فهارس على الأعمدة الأكثر استخداماً في الفلترة والربط.",
    formula:"CREATE INDEX idx_name ON table(column);",
    code:`-- فهرس بسيط
CREATE INDEX idx_orders_customer
  ON orders(customer_id);

-- فهرس مركب (ترتيب الأعمدة مهم!)
CREATE INDEX idx_orders_status_date
  ON orders(status, order_date DESC);

-- فهرس فريد
CREATE UNIQUE INDEX idx_users_email
  ON users(email);

-- فحص استخدام الفهارس
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42;`,
    example:"💡 Full Table Scan على جدول 10M صف = ثوانٍ. Index Scan = ميلي ثانية."
  },
  {
    id:9, icon:"🤖", title:"ORM", en:"Object-Relational Mapping",
    category:"ORM", level:"متوسط",
    short:"يترجم كود البرمجة إلى SQL تلقائياً — سرعة تطوير مقابل تحكم أقل.",
    desc:"ORM يمثّل جداول قاعدة البيانات كـ Classes/Models في لغة البرمجة. يولّد SQL تلقائياً ويتعامل مع الاتصالات. أمثلة: Sequelize (JS)، SQLAlchemy (Python)، Prisma (TS)، Eloquent (PHP).",
    formula:null,
    code:`// Sequelize (Node.js)
// بدلاً من: SELECT * FROM users WHERE id = 1
const user = await User.findByPk(1);

// بدلاً من: INSERT INTO users (name, email) VALUES (...)
const newUser = await User.create({ name: 'أحمد', email: 'a@a.com' });

// بدلاً من: SELECT u.*, p.* FROM users u JOIN posts p ON ...
const user = await User.findOne({
  where: { id: 1 },
  include: [Post]   // ← Eager Loading
});`,
    example:"💡 ORM رائع للتطوير السريع، لكن للاستعلامات المعقدة أو الحرجة للأداء — اكتب SQL مباشرة."
  },
  {
    id:10, icon:"🚨", title:"N+1 Problem", en:"N+1 Problem",
    category:"ORM", level:"متقدم",
    short:"أشهر مشكلة أداء في ORM — استعلام لكل صف بدلاً من استعلام واحد.",
    desc:"تحدث عند جلب قائمة (1 استعلام) ثم الدوران عليها وجلب بيانات مرتبطة لكل عنصر (N استعلام). الحل: Eager Loading الذي يستخدم JOIN أو IN لجلب كل شيء مرة واحدة.",
    formula:"المشكلة: 1 + N queries | الحل: 1 أو 2 queries",
    code:`// ❌ N+1 Problem
const posts = await Post.findAll();        // 1 query
for (const post of posts) {
  const author = await post.getUser();     // N queries!
  console.log(post.title, author.name);
}

// ✅ Eager Loading — الحل
const posts = await Post.findAll({
  include: [{ model: User, as: 'author' }] // 1 query with JOIN
});

// ✅ Python SQLAlchemy
posts = db.query(Post).options(
  joinedload(Post.author)  # Eager Loading
).all()`,
    example:"💡 100 مقال = 101 استعلام مع N+1. مع Eager Loading = استعلام واحد فقط."
  },
  {
    id:11, icon:"🔄", title:"Transactions", en:"Transactions",
    category:"متقدم", level:"متوسط",
    short:"مجموعة عمليات تُنفَّذ كوحدة واحدة — إما كلها أو لا شيء.",
    desc:"Transaction تضمن ACID: Atomicity (كل أو لا شيء)، Consistency (البيانات صحيحة دائماً)، Isolation (العمليات المتزامنة لا تتداخل)، Durability (البيانات محفوظة بعد الـ Commit). ROLLBACK يتراجع عن كل شيء عند الخطأ.",
    formula:"BEGIN; ... COMMIT; / ROLLBACK;",
    code:`-- تحويل رصيد بين حسابين — يجب أن يتم معاً أو لا يتم
BEGIN;

UPDATE accounts
SET balance = balance - 500
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 500
WHERE account_id = 2;

-- التحقق قبل الحفظ
DO $$
BEGIN
  IF (SELECT balance FROM accounts WHERE account_id = 1) < 0 THEN
    RAISE EXCEPTION 'رصيد غير كافٍ';
  END IF;
END $$;

COMMIT;
-- عند أي خطأ: ROLLBACK تلقائياً`,
    example:"💡 بدون Transaction: قد يُخصم من حساب A ولا يُضاف لـ B عند انقطاع الاتصال!"
  },
  {
    id:12, icon:"📋", title:"EXPLAIN & ANALYZE", en:"EXPLAIN & ANALYZE",
    category:"أداء", level:"متقدم",
    short:"افهم كيف تنفذ قاعدة البيانات استعلامك قبل التحسين.",
    desc:"EXPLAIN يعرض خطة التنفيذ المتوقعة. EXPLAIN ANALYZE ينفذ الاستعلام فعلاً ويعرض الأوقات الحقيقية. ابحث عن: Seq Scan على جداول كبيرة (يحتاج Index)، وعن Nested Loop مع صفوف كثيرة.",
    formula:"EXPLAIN [ANALYZE] SELECT ...;",
    code:`-- فحص خطة التنفيذ
EXPLAIN ANALYZE
SELECT o.*, c.name
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'pending'
  AND o.created_at > NOW() - INTERVAL '7 days';

-- ما تبحث عنه في النتيجة:
-- ✅ Index Scan  → يستخدم الفهرس (سريع)
-- ⚠️  Seq Scan   → مسح كامل (بطيء على جداول كبيرة)
-- 📊 actual time → الوقت الفعلي
-- 📊 rows        → عدد الصفوف المعالجة`,
    example:"💡 قبل إضافة أي Index، استخدم EXPLAIN ANALYZE لتأكد أن المشكلة فعلاً في غياب الفهرس."
  }
];

/* ─────────────────────────────────────────── */

const PROCESS_STEPS = [
  {
    num:"01", icon:"🤔", title:"فهم المتطلب",
    desc:"ترجم السؤال البشري إلى منطق بيانات — ما الجداول والأعمدة والشروط؟",
    details:[
      "تحديد الجداول المطلوبة",
      "فهم العلاقات بين الجداول",
      "تحديد شروط التصفية والتجميع",
      "تحديد شكل النتيجة المطلوبة"
    ],
    tools:["Schema Diagram", "ERD", "Documentation"],
    time:"20%"
  },
  {
    num:"02", icon:"✍️", title:"كتابة الاستعلام الأولي",
    desc:"صيغ استعلاماً يعطي النتيجة الصحيحة أولاً — الأداء لاحقاً.",
    details:[
      "ابدأ بـ SELECT, FROM, WHERE",
      "أضف JOINs حسب الحاجة",
      "أضف GROUP BY و HAVING",
      "تحقق من صحة النتائج"
    ],
    tools:["DBeaver", "TablePlus", "pgAdmin", "VS Code SQLTools"],
    time:"25%"
  },
  {
    num:"03", icon:"🔬", title:"تحليل خطة التنفيذ",
    desc:"استخدم EXPLAIN ANALYZE لفهم كيف تنفذ قاعدة البيانات استعلامك.",
    details:[
      "هل يوجد Seq Scan على جدول كبير؟",
      "هل تُستخدم الفهارس الموجودة؟",
      "ما الجزء الأبطأ في الاستعلام؟",
      "كم صفاً يتم معالجته فعلاً؟"
    ],
    tools:["EXPLAIN ANALYZE", "EXPLAIN BUFFERS", "pg_stat_statements"],
    time:"20%"
  },
  {
    num:"04", icon:"⚡", title:"التحسين",
    desc:"أضف فهارس أو أعد كتابة الاستعلام بناءً على ما وجدته.",
    details:[
      "أضف Index على أعمدة WHERE و JOIN",
      "استبدل Subquery بـ JOIN أو CTE",
      "استبدل SELECT * بأعمدة محددة",
      "استخدم LIMIT عند الإمكان"
    ],
    tools:["CREATE INDEX", "CTE", "Materialized View"],
    time:"25%"
  },
  {
    num:"05", icon:"✅", title:"الاختبار والتوثيق",
    desc:"تأكد من صحة النتائج وسرعة الاستعلام، ووثّق ما فعلته.",
    details:[
      "قارن نتائج الاستعلام القديم والجديد",
      "قس زمن الاستجابة قبل وبعد",
      "اختبر مع أحجام بيانات مختلفة",
      "وثّق الفهارس المضافة وسببها"
    ],
    tools:["Unit Tests", "Query Benchmarks"],
    time:"10%"
  }
];

/* ─────────────────────────────────────────── */

const CASE_STEPS = [
  {
    step:1, icon:"❓", title:"المشكلة",
    content:"تطبيق مدونة يعرض قائمة المقالات مع اسم الكاتب وعدد التعليقات. الصفحة تستغرق 4 ثوانٍ للتحميل!",
    code:null,
    insight:"🎯 الهدف: تحديد سبب البطء وإصلاحه — نشك في مشكلة N+1."
  },
  {
    step:2, icon:"🤖", title:"الكود المشكلة (N+1)",
    content:"المطور كتب كوداً بسيطاً باستخدام ORM يبدو صحيحاً، لكنه يولّد استعلامات كثيرة.",
    code:`// ❌ الكود المشكلة
const posts = await Post.findAll();  // 1 query

for (const post of posts) {
  // N query لكل مقال!
  post.author   = await User.findByPk(post.userId);
  post.comments = await Comment.count({ where: { postId: post.id } });
}

// النتيجة: 100 مقال = 201 استعلام 😱`,
    insight:"🚨 مع 100 مقال: 1 + 100 + 100 = 201 استعلام. كل استعلام له تكلفة شبكة وقاعدة بيانات."
  },
  {
    step:3, icon:"🔬", title:"التشخيص بـ EXPLAIN",
    content:"نفحص الاستعلامات المُولَّدة ونستخدم EXPLAIN ANALYZE.",
    code:`-- الاستعلام المُولَّد لكل مقال
EXPLAIN ANALYZE
SELECT * FROM users WHERE id = 42;

-- النتيجة:
-- Seq Scan on users (cost=0.00..1.05 rows=1)
--   Filter: (id = 42)
--   actual time=0.018..0.019 rows=1
--
-- ⚠️ لا يوجد Index على users.id ؟!
-- (في الواقع PK دائماً مفهرس، لكن المشكلة في التكرار)`,
    insight:"📊 كل استعلام فردي سريع (0.02ms)، لكن 200 استعلام × 0.02ms + تكلفة الشبكة = ثوانٍ!"
  },
  {
    step:4, icon:"✅", title:"الحل: Eager Loading + SQL مباشر",
    content:"نحل المشكلة بطريقتين: Eager Loading في ORM، أو استعلام SQL واحد مباشر.",
    code:`// ✅ الحل 1: Eager Loading في Sequelize
const posts = await Post.findAll({
  include: [
    { model: User,    as: 'author',   attributes: ['name'] },
    { model: Comment, as: 'comments', attributes: [] }
  ],
  attributes: {
    include: [[
      Sequelize.fn('COUNT', Sequelize.col('comments.id')),
      'commentCount'
    ]]
  },
  group: ['Post.id', 'author.id']
});

// ✅ الحل 2: SQL مباشر (أوضح وأسرع)
SELECT
  p.id,
  p.title,
  u.name          AS author_name,
  COUNT(c.id)     AS comment_count
FROM posts     AS p
JOIN users     AS u ON p.user_id    = u.id
LEFT JOIN comments AS c ON c.post_id = p.id
GROUP BY p.id, u.name
ORDER BY p.created_at DESC
LIMIT 20;`,
    insight:"⚡ النتيجة: من 201 استعلام إلى استعلام واحد. من 4 ثوانٍ إلى 40ms — تحسن 100x!"
  },
  {
    step:5, icon:"⚡", title:"إضافة الفهارس",
    content:"نضيف فهارس على الأعمدة المستخدمة في JOIN و WHERE.",
    code:`-- فحص الأعمدة المستخدمة في الاستعلام
-- posts.user_id  ← مستخدم في JOIN
-- comments.post_id ← مستخدم في JOIN
-- posts.created_at ← مستخدم في ORDER BY

CREATE INDEX idx_posts_user_id
  ON posts(user_id);

CREATE INDEX idx_comments_post_id
  ON comments(post_id);

CREATE INDEX idx_posts_created_at
  ON posts(created_at DESC);

-- التحقق
EXPLAIN ANALYZE
SELECT p.id, p.title, u.name, COUNT(c.id)
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id, u.name
ORDER BY p.created_at DESC LIMIT 20;
-- ✅ الآن: Index Scan بدلاً من Seq Scan`,
    insight:"🏆 النتيجة النهائية: 4000ms → 12ms. تحسن 333x بتغييرين فقط: Eager Loading + Indexes."
  },
  {
    step:6, icon:"📢", title:"الدروس المستفادة",
    content:"ما تعلمناه من هذه الحالة.",
    code:null,
    insight:"✅ دائماً استخدم Eager Loading عند جلب بيانات مرتبطة\n✅ راقب الاستعلامات المُولَّدة من ORM في بيئة التطوير\n✅ أضف فهارس على أعمدة JOIN و WHERE و ORDER BY\n✅ استخدم EXPLAIN ANALYZE قبل وبعد أي تحسين\n✅ للاستعلامات المعقدة — اكتب SQL مباشرة بدلاً من ORM"
  }
];

/* ─────────────────────────────────────────── */

const CHEAT_SHEETS = [
  {
    title:"🔍 SELECT الأساسيات",
    code:`-- الأساسيات
SELECT col1, col2           FROM table;
SELECT DISTINCT col         FROM table;       -- بدون تكرار
SELECT col AS alias         FROM table;       -- تسمية مستعارة
SELECT *                    FROM table LIMIT 10; -- أول 10 صفوف

-- الشروط
WHERE col = 'value'
WHERE col != 'value'
WHERE col > 100 AND col < 500
WHERE col IN ('a', 'b', 'c')
WHERE col BETWEEN 10 AND 50
WHERE col LIKE 'أحمد%'       -- يبدأ بـ أحمد
WHERE col IS NULL
WHERE col IS NOT NULL`
  },
  {
    title:"🔗 JOINs المرجع السريع",
    code:`-- INNER JOIN: الصفوف المتطابقة فقط
SELECT * FROM a INNER JOIN b ON a.id = b.a_id;

-- LEFT JOIN: كل A + المتطابق من B
SELECT * FROM a LEFT JOIN b ON a.id = b.a_id;

-- RIGHT JOIN: كل B + المتطابق من A
SELECT * FROM a RIGHT JOIN b ON a.id = b.a_id;

-- FULL JOIN: كل A وكل B
SELECT * FROM a FULL JOIN b ON a.id = b.a_id;

-- SELF JOIN: الجدول مع نفسه
SELECT e.name, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;`
  },
  {
    title:"📊 دوال التجميع",
    code:`SELECT
  COUNT(*)           AS total_rows,
  COUNT(col)         AS non_null_count,
  COUNT(DISTINCT col) AS unique_count,
  SUM(amount)        AS total,
  AVG(amount)        AS average,
  MIN(amount)        AS minimum,
  MAX(amount)        AS maximum,
  ROUND(AVG(amount), 2) AS avg_rounded,
  STDDEV(amount)     AS std_deviation,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median
FROM orders
WHERE status = 'completed'
GROUP BY category
HAVING COUNT(*) > 10
ORDER BY total DESC;`
  },
  {
    title:"🪟 Window Functions",
    code:`SELECT
  name,
  department,
  salary,

  -- ترتيب
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC),
  RANK()       OVER (PARTITION BY department ORDER BY salary DESC),
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC),

  -- إحصاء على النافذة
  SUM(salary)  OVER (PARTITION BY department) AS dept_total,
  AVG(salary)  OVER (PARTITION BY department) AS dept_avg,
  COUNT(*)     OVER (PARTITION BY department) AS dept_count,

  -- الصف السابق / التالي
  LAG(salary, 1)  OVER (ORDER BY salary) AS prev_salary,
  LEAD(salary, 1) OVER (ORDER BY salary) AS next_salary,

  -- النسبة المئوية
  PERCENT_RANK() OVER (ORDER BY salary) AS pct_rank
FROM employees;`
  },
  {
    title:"📜 CTE و Subquery",
    code:`-- CTE بسيط
WITH high_value_customers AS (
  SELECT customer_id, SUM(amount) AS total
  FROM orders
  GROUP BY customer_id
  HAVING SUM(amount) > 10000
)
SELECT c.name, h.total
FROM customers c
JOIN high_value_customers h ON c.id = h.customer_id;

-- CTE متعدد
WITH
  sales    AS (SELECT region, SUM(amount) AS total FROM orders GROUP BY region),
  avg_sale AS (SELECT AVG(total) AS avg FROM sales)
SELECT region, total
FROM sales, avg_sale
WHERE total > avg;

-- Subquery في WHERE
SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);`
  },
  {
    title:"⚡ الأداء والفهارس",
    code:`-- إنشاء فهارس
CREATE INDEX idx_name      ON table(column);
CREATE INDEX idx_composite ON table(col1, col2);
CREATE UNIQUE INDEX idx_u  ON table(email);
CREATE INDEX idx_partial   ON orders(status)
  WHERE status = 'pending';  -- Partial Index

-- فحص الاستعلام
EXPLAIN SELECT ...;
EXPLAIN ANALYZE SELECT ...;
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT ...;

-- إحصاءات الجداول
SELECT schemaname, tablename, n_live_tup, n_dead_tup
FROM pg_stat_user_tables;

-- الفهارس غير المستخدمة
SELECT indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;`
  }
];

/* ─────────────────────────────────────────── */

const QUIZ = [
  {
    q:"ما الفرق بين WHERE و HAVING؟",
    options:[
      "لا فرق بينهما — يمكن استخدام أي منهما",
      "WHERE تصفي الصفوف قبل التجميع، HAVING تصفي المجموعات بعد GROUP BY",
      "HAVING أسرع من WHERE دائماً",
      "WHERE تعمل مع JOINs فقط"
    ],
    correct:1,
    explanation:"WHERE تعمل على الصفوف الفردية قبل أي تجميع. HAVING تعمل على نتائج GROUP BY. لذلك لا يمكن كتابة WHERE COUNT(*) > 5 — يجب استخدام HAVING."
  },
  {
    q:"ما هي مشكلة N+1 في ORM؟",
    options:[
      "استعلام واحد يجلب N ضعف البيانات المطلوبة",
      "جلب قائمة بـ 1 استعلام ثم N استعلام إضافي لكل عنصر",
      "استخدام N فهرس في استعلام واحد",
      "تنفيذ نفس الاستعلام N مرة بالتوازي"
    ],
    correct:1,
    explanation:"N+1 تحدث عند جلب قائمة (1 استعلام) ثم الدوران عليها وجلب بيانات مرتبطة لكل عنصر (N استعلام). الحل هو Eager Loading الذي يستخدم JOIN لجلب كل شيء مرة واحدة."
  },
  {
    q:"ما الفرق بين RANK() و DENSE_RANK()؟",
    options:[
      "لا فرق بينهما",
      "RANK() يترك فجوات في الترتيب عند التعادل، DENSE_RANK() لا يترك فجوات",
      "DENSE_RANK() أسرع من RANK()",
      "RANK() يعمل مع PARTITION BY فقط"
    ],
    correct:1,
    explanation:"مثال: ثلاثة موظفين بنفس الراتب. RANK() يعطيهم 1,1,1 ثم القادم يأخذ 4. DENSE_RANK() يعطيهم 1,1,1 ثم القادم يأخذ 2 — بدون فجوة."
  },
  {
    q:"متى يجب إضافة Index على عمود؟",
    options:[
      "على كل الأعمدة دائماً لتسريع كل شيء",
      "على الأعمدة المستخدمة كثيراً في WHERE و JOIN و ORDER BY",
      "فقط على Primary Key",
      "على الأعمدة التي تحتوي قيم NULL"
    ],
    correct:1,
    explanation:"Index يسرّع القراءة لكنه يبطئ الكتابة ويأخذ مساحة. أضفه على الأعمدة المستخدمة في WHERE و JOIN و ORDER BY. تجنب إضافته على أعمدة نادرة الاستخدام في الفلترة."
  },
  {
    q:"ما ميزة CTE على Subquery المتداخلة؟",
    options:[
      "CTE دائماً أسرع من Subquery",
      "CTE يمكن إعادة استخدامه عدة مرات في نفس الاستعلام وهو أوضح للقراءة",
      "CTE يحفظ النتائج على القرص",
      "CTE يعمل فقط مع PostgreSQL"
    ],
    correct:1,
    explanation:"CTE يجعل الاستعلامات المعقدة أوضح بتقسيمها لخطوات مسماة، ويمكن الرجوع إليه أكثر من مرة في نفس الاستعلام بدلاً من تكرار نفس الـ Subquery. أما الأداء فيعتمد على قاعدة البيانات."
  }
];
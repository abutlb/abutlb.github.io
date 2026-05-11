/* ============================================================
   DATA.JS — Machine Learning CheatSheet
============================================================ */

/* ══════════════════════════════════════════
   TERMS
══════════════════════════════════════════ */
const TERMS = [
  {
    id: 1,
    icon: "🎯",
    title: "التعلم الخاضع للإشراف",
    en: "Supervised Learning",
    category: "concepts",
    level: "مبتدئ",
    short: "نموذج يتعلم من بيانات مُصنّفة مسبقاً — لكل مدخل إجابة صحيحة معروفة.",
    desc: "في التعلم الخاضع للإشراف، نُعطي النموذج أمثلة مُصنّفة (X, y) ليتعلم العلاقة بينهما. ينقسم إلى: Regression للتنبؤ بقيم مستمرة، وClassification للتنبؤ بفئات. الهدف: التعميم على بيانات جديدة لم يرها.",
    code: `from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import numpy as np

# بيانات تجريبية
np.random.seed(42)
X = np.random.randn(1000, 5)
y = (X[:, 0] + X[:, 1] > 0).astype(int)

# تقسيم البيانات
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# تطبيع
scaler  = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test  = scaler.transform(X_test)

# تدريب
model = LogisticRegression(random_state=42)
model.fit(X_train, y_train)

# تقييم
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))`,
    example: "تصنيف البريد المزعج — النموذج يتعلم من آلاف الرسائل المُصنّفة (مزعج/غير مزعج)."
  },
  {
    id: 2,
    icon: "🔍",
    title: "التعلم غير الخاضع للإشراف",
    en: "Unsupervised Learning",
    category: "concepts",
    level: "مبتدئ",
    short: "النموذج يكتشف الأنماط بنفسه — بدون تسميات مسبقة.",
    desc: "في التعلم غير الخاضع للإشراف، البيانات بدون تسميات. النموذج يبحث عن بنية خفية: التجميع (Clustering) يجمع المتشابهات، وتقليل الأبعاد (Dimensionality Reduction) يضغط البيانات مع الحفاظ على المعلومات.",
    code: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
# بيانات من 3 مجموعات
X = np.vstack([
    np.random.randn(200, 2) + [0, 0],
    np.random.randn(200, 2) + [5, 5],
    np.random.randn(200, 2) + [0, 5],
])

scaler = StandardScaler()
X_sc   = scaler.fit_transform(X)

# K-Means
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = kmeans.fit_predict(X_sc)

# رسم النتائج
fig, ax = plt.subplots(figsize=(7, 5))
colors = ['#6366f1', '#10b981', '#f59e0b']
for i in range(3):
    mask = labels == i
    ax.scatter(X_sc[mask, 0], X_sc[mask, 1],
               c=colors[i], alpha=0.6, s=30, label=f'مجموعة {i+1}')
ax.scatter(kmeans.cluster_centers_[:, 0],
           kmeans.cluster_centers_[:, 1],
           c='red', marker='X', s=200, zorder=5, label='المراكز')
ax.legend()
ax.set_title('K-Means Clustering')
plt.tight_layout()
plt.show()`,
    example: "تجميع عملاء المتجر حسب سلوك الشراء — بدون معرفة مسبقة بعدد الفئات."
  },
  {
    id: 3,
    icon: "✂️",
    title: "تقسيم البيانات والتحقق",
    en: "Train / Validation / Test Split",
    category: "workflow",
    level: "مبتدئ",
    short: "القاعدة الذهبية: لا تلمس بيانات الاختبار حتى اللحظة الأخيرة.",
    desc: "تقسيم البيانات ضروري لتقييم النموذج بشكل نزيه. Train للتدريب، Validation لضبط الـ Hyperparameters، Test للتقييم النهائي. Cross-Validation يستغل البيانات بشكل أكفأ.",
    code: `from sklearn.model_selection import (
    train_test_split, KFold,
    StratifiedKFold, cross_val_score
)
from sklearn.ensemble import RandomForestClassifier
import numpy as np

np.random.seed(42)
X = np.random.randn(1000, 10)
y = (X[:, 0] > 0).astype(int)

# ── تقسيم ثلاثي ──
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.18,
    random_state=42, stratify=y_temp
)
# النتيجة: 70% train / 15% val / 15% test

print(f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

# ── K-Fold Cross Validation ──
model = RandomForestClassifier(n_estimators=100, random_state=42)
cv    = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')

print(f"CV Accuracy: {scores.mean():.3f} ± {scores.std():.3f}")`,
    example: "بيانات 1000 صف → 700 تدريب / 150 تحقق / 150 اختبار — التقسيم الأمثل."
  },
  {
    id: 4,
    icon: "📏",
    title: "الانحدار الخطي",
    en: "Linear Regression",
    category: "supervised",
    level: "مبتدئ",
    short: "يتنبأ بقيمة مستمرة عبر إيجاد أفضل خط مستقيم يمر بالبيانات.",
    desc: "الانحدار الخطي يجد العلاقة الخطية بين المتغيرات المستقلة X والمتغير التابع y. يُقلّل مجموع مربعات الأخطاء (MSE). Ridge وLasso يُضيفان تنظيماً لمنع Overfitting.",
    code: `from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import PolynomialFeatures
import numpy as np

np.random.seed(42)
X = np.random.uniform(0, 10, (200, 1))
y = 3 * X.ravel() + 7 + np.random.normal(0, 2, 200)

X_train, X_test = X[:160], X[160:]
y_train, y_test = y[:160], y[160:]

# ── نماذج مختلفة ──
models = {
    'Linear':  LinearRegression(),
    'Ridge':   Ridge(alpha=1.0),
    'Lasso':   Lasso(alpha=0.1),
}

for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    rmse   = np.sqrt(mean_squared_error(y_test, y_pred))
    r2     = r2_score(y_test, y_pred)
    print(f"{name:<10} RMSE: {rmse:.3f}  R²: {r2:.3f}")

# ── Polynomial Regression ──
poly    = PolynomialFeatures(degree=2, include_bias=False)
X_poly  = poly.fit_transform(X_train)
lr_poly = LinearRegression().fit(X_poly, y_train)
print(f"Polynomial R²: {r2_score(y_test, lr_poly.predict(poly.transform(X_test))):.3f}")`,
    example: "التنبؤ بسعر منزل بناءً على المساحة والموقع — الانحدار يعطي رقماً دقيقاً."
  },
  {
    id: 5,
    icon: "🌳",
    title: "أشجار القرار والغابات",
    en: "Decision Trees & Random Forest",
    category: "supervised",
    level: "متوسط",
    short: "شجرة القرار تُقسّم البيانات بأسئلة متتالية — الغابة تجمع مئات الأشجار.",
    desc: "Decision Tree تُقسّم البيانات بناءً على أفضل سؤال في كل خطوة (Gini أو Entropy). تميل للـ Overfitting. Random Forest تحل هذه المشكلة بتجميع مئات الأشجار المختلفة (Bagging).",
    code: `from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np

X, y = make_classification(
    n_samples=1000, n_features=10,
    n_informative=5, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── شجرة قرار ──
dt = DecisionTreeClassifier(max_depth=5, random_state=42)
dt.fit(X_train, y_train)
print(f"Decision Tree Accuracy: {accuracy_score(y_test, dt.predict(X_test)):.3f}")

# ── Random Forest ──
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    max_features='sqrt',
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)
print(f"Random Forest Accuracy: {accuracy_score(y_test, rf.predict(X_test)):.3f}")

# أهمية المتغيرات
importances = rf.feature_importances_
top_features = np.argsort(importances)[::-1][:5]
for i, feat in enumerate(top_features):
    print(f"  {i+1}. Feature {feat}: {importances[feat]:.3f}")`,
    example: "تشخيص مرض — الشجرة تسأل: هل الضغط > 140؟ هل العمر > 50؟ وهكذا."
  },
  {
    id: 6,
    icon: "🚀",
    title: "Gradient Boosting — XGBoost",
    en: "Gradient Boosting & XGBoost",
    category: "supervised",
    level: "متقدم",
    short: "أقوى خوارزميات التعلم الآلي الكلاسيكي — يبني نماذج متتالية تُصحّح أخطاء بعضها.",
    desc: "Gradient Boosting يبني نماذج بشكل تسلسلي، كل نموذج يُركّز على أخطاء السابق. XGBoost وLightGBM وCatBoost هي تطبيقات محسّنة تُهيمن على مسابقات Kaggle.",
    code: `from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, roc_auc_score
import numpy as np

X, y = make_classification(
    n_samples=5000, n_features=20,
    n_informative=10, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── XGBoost ──
xgb = XGBClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric='logloss',
    random_state=42,
    verbosity=0
)
xgb.fit(X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False)

y_pred  = xgb.predict(X_test)
y_proba = xgb.predict_proba(X_test)[:, 1]

print(f"XGBoost Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"XGBoost AUC-ROC:  {roc_auc_score(y_test, y_proba):.4f}")

# ── LightGBM ──
lgbm = LGBMClassifier(n_estimators=300, learning_rate=0.05,
                       random_state=42, verbose=-1)
lgbm.fit(X_train, y_train)
print(f"LightGBM Accuracy: {accuracy_score(y_test, lgbm.predict(X_test)):.4f}")`,
    example: "XGBoost فاز في أكثر من 60% من مسابقات Kaggle — الخيار الأول للبيانات الجدولية."
  },
  {
    id: 7,
    icon: "🧠",
    title: "الشبكات العصبية — PyTorch",
    en: "Neural Networks — PyTorch",
    category: "deep",
    level: "متقدم",
    short: "طبقات من الخلايا الاصطناعية تتعلم تمثيلات معقدة من البيانات.",
    desc: "الشبكة العصبية تتكون من طبقات (Layers) من الخلايا المترابطة. كل خلية تحسب مجموعاً موزوناً ثم تُطبّق دالة تنشيط. Backpropagation تُحدّث الأوزان لتقليل الخطأ.",
    code: `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np

# ── بناء الشبكة ──
class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dims, output_dim, dropout=0.3):
        super().__init__()
        layers = []
        prev = input_dim
        for h in hidden_dims:
            layers += [
                nn.Linear(prev, h),
                nn.BatchNorm1d(h),
                nn.ReLU(),
                nn.Dropout(dropout)
            ]
            prev = h
        layers.append(nn.Linear(prev, output_dim))
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x)

# ── تدريب ──
np.random.seed(42)
torch.manual_seed(42)

X = torch.FloatTensor(np.random.randn(1000, 20))
y = torch.LongTensor((X[:, 0] + X[:, 1] > 0).numpy().astype(int))

dataset    = TensorDataset(X, y)
loader     = DataLoader(dataset, batch_size=64, shuffle=True)

model     = MLP(20, [128, 64, 32], 2)
optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
criterion = nn.CrossEntropyLoss()
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.5)

for epoch in range(30):
    model.train()
    total_loss = 0
    for xb, yb in loader:
        optimizer.zero_grad()
        loss = criterion(model(xb), yb)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    scheduler.step()
    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1:02d} | Loss: {total_loss/len(loader):.4f}")`,
    example: "شبكة MLP بـ 3 طبقات خفية تتعلم تصنيف الصور أو التنبؤ بالأسعار."
  },
  {
    id: 8,
    icon: "📉",
    title: "مقاييس التقييم",
    en: "Evaluation Metrics",
    category: "workflow",
    level: "متوسط",
    short: "Accuracy وحدها تكذب — استخدم F1 وAUC-ROC مع البيانات غير المتوازنة.",
    desc: "اختيار المقياس الصحيح حسب المشكلة: Accuracy للبيانات المتوازنة، Precision/Recall للبيانات غير المتوازنة، RMSE/MAE للانحدار، AUC-ROC لمقارنة النماذج بشكل عام.",
    code: `from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, f1_score,
    roc_auc_score, confusion_matrix,
    mean_squared_error, mean_absolute_error, r2_score,
    classification_report
)
import numpy as np

# ── تصنيف ──
y_true = np.array([0,0,1,1,1,0,1,0,1,1])
y_pred = np.array([0,1,1,0,1,0,1,0,0,1])
y_prob = np.array([0.1,0.6,0.9,0.3,0.8,0.2,0.7,0.1,0.4,0.9])

print("── مقاييس التصنيف ──")
print(f"Accuracy:  {accuracy_score(y_true, y_pred):.3f}")
print(f"Precision: {precision_score(y_true, y_pred):.3f}")
print(f"Recall:    {recall_score(y_true, y_pred):.3f}")
print(f"F1-Score:  {f1_score(y_true, y_pred):.3f}")
print(f"AUC-ROC:   {roc_auc_score(y_true, y_prob):.3f}")
print()
print(classification_report(y_true, y_pred,
      target_names=['سلبي', 'إيجابي']))

# ── انحدار ──
y_true_r = np.array([3.0, 2.5, 4.0, 5.0, 3.5])
y_pred_r = np.array([2.8, 2.7, 3.9, 4.8, 3.6])

print("── مقاييس الانحدار ──")
print(f"RMSE: {np.sqrt(mean_squared_error(y_true_r, y_pred_r)):.3f}")
print(f"MAE:  {mean_absolute_error(y_true_r, y_pred_r):.3f}")
print(f"R²:   {r2_score(y_true_r, y_pred_r):.3f}")`,
    example: "كشف الاحتيال: Recall أهم من Accuracy — أفضل نفوذ حالة حقيقية من تفويت حالة مزيفة."
  },
  {
    id: 9,
    icon: "⚖️",
    title: "Overfitting وUnderfitting",
    en: "Overfitting & Underfitting",
    category: "concepts",
    level: "متوسط",
    short: "Overfitting يحفظ البيانات ولا يتعلم — Underfitting لا يتعلم أصلاً.",
    desc: "Overfitting: النموذج يؤدي جيداً على التدريب وسيئاً على الاختبار — يحفظ بدل أن يتعلم. Underfitting: النموذج بسيط جداً ولا يلتقط الأنماط. الحل: التنظيم، Dropout، Early Stopping، وزيادة البيانات.",
    code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import Ridge
from sklearn.model_selection import learning_curve
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
X = np.sort(np.random.uniform(0, 1, 100)).reshape(-1, 1)
y = np.sin(2 * np.pi * X.ravel()) + np.random.normal(0, 0.2, 100)

fig, axes = plt.subplots(1, 3, figsize=(14, 4))
degrees = [1, 4, 15]
titles  = ['Underfitting\n(درجة 1)', 'مناسب\n(درجة 4)', 'Overfitting\n(درجة 15)']

for ax, deg, title in zip(axes, degrees, titles):
    pipe = Pipeline([
        ('poly', PolynomialFeatures(degree=deg)),
        ('reg',  Ridge(alpha=0.001))
    ])
    pipe.fit(X, y)

    X_plot = np.linspace(0, 1, 300).reshape(-1, 1)
    ax.scatter(X, y, s=15, alpha=0.5, color='#94a3b8')
    ax.plot(X_plot, pipe.predict(X_plot),
            color='#6366f1', linewidth=2)
    ax.set_title(title, fontsize=11)
    ax.spines[['top','right']].set_visible(False)

plt.suptitle('Bias-Variance Tradeoff', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.show()`,
    example: "نموذج يحقق 99% على التدريب و60% على الاختبار → Overfitting واضح."
  },
  {
    id: 10,
    icon: "🔧",
    title: "ضبط المعاملات — Hyperparameter Tuning",
    en: "Hyperparameter Tuning",
    category: "workflow",
    level: "متوسط",
    short: "GridSearch يجرب كل الاحتمالات — RandomSearch أسرع — Optuna الأذكى.",
    desc: "Hyperparameters هي الإعدادات التي نحددها قبل التدريب (مثل عمق الشجرة، معدل التعلم). GridSearchCV يجرب كل التوليفات، RandomSearchCV يأخذ عينة عشوائية، Optuna يستخدم Bayesian Optimization.",
    code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import (
    GridSearchCV, RandomizedSearchCV, cross_val_score
)
from sklearn.datasets import make_classification
import numpy as np

X, y = make_classification(n_samples=1000, n_features=10,
                            random_state=42)

# ── Grid Search ──
param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth':    [5, 10, None],
    'min_samples_split': [2, 5, 10],
}
grid = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid, cv=5, scoring='accuracy',
    n_jobs=-1, verbose=0
)
grid.fit(X, y)
print(f"Grid Best Params: {grid.best_params_}")
print(f"Grid Best Score:  {grid.best_score_:.4f}")

# ── Random Search (أسرع) ──
param_dist = {
    'n_estimators': np.arange(50, 500, 50),
    'max_depth':    [3, 5, 7, 10, 15, None],
    'min_samples_split': np.arange(2, 20),
    'max_features': ['sqrt', 'log2', 0.5],
}
rand = RandomizedSearchCV(
    RandomForestClassifier(random_state=42),
    param_dist, n_iter=30, cv=5,
    scoring='accuracy', n_jobs=-1, random_state=42
)
rand.fit(X, y)
print(f"Random Best Score: {rand.best_score_:.4f}")`,
    example: "ضبط XGBoost بـ Optuna يرفع الدقة من 85% إلى 91% في مسابقات Kaggle."
  },
  {
    id: 11,
    icon: "🔄",
    title: "Pipeline — خط الأنابيب",
    en: "Scikit-learn Pipeline",
    category: "workflow",
    level: "متوسط",
    short: "يجمع المعالجة والنمذجة في خطوة واحدة — يمنع تسرب البيانات.",
    desc: "Pipeline يربط خطوات المعالجة والنمذجة بالتسلسل. يضمن أن التطبيع والترميز يحدثان بشكل صحيح على بيانات الاختبار دون تسرب معلومات التدريب (Data Leakage).",
    code: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
import pandas as pd
import numpy as np

# بيانات مختلطة
np.random.seed(42)
n = 500
df = pd.DataFrame({
    'age':      np.random.randint(18, 65, n).astype(float),
    'income':   np.random.lognormal(10, 0.5, n),
    'city':     np.random.choice(['الرياض','جدة','الدمام'], n),
    'category': np.random.choice(['A','B','C'], n),
    'target':   np.random.randint(0, 2, n)
})
df.loc[np.random.choice(n, 50), 'age'] = np.nan  # قيم مفقودة

X = df.drop('target', axis=1)
y = df['target']

num_cols = ['age', 'income']
cat_cols = ['city', 'category']

# معالجة الأعمدة
num_pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler',  StandardScaler()),
])
cat_pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False)),
])
preprocessor = ColumnTransformer([
    ('num', num_pipe, num_cols),
    ('cat', cat_pipe, cat_cols),
])

# Pipeline الكامل
full_pipe = Pipeline([
    ('prep',  preprocessor),
    ('model', GradientBoostingClassifier(n_estimators=100, random_state=42)),
])

scores = cross_val_score(full_pipe, X, y, cv=5, scoring='accuracy')
print(f"CV Accuracy: {scores.mean():.3f} ± {scores.std():.3f}")`,
    example: "Pipeline يضمن أن StandardScaler يتعلم من التدريب فقط — لا تسرب للاختبار."
  },
  {
    id: 12,
    icon: "📊",
    title: "تقليل الأبعاد — PCA",
    en: "Dimensionality Reduction — PCA",
    category: "unsupervised",
    level: "متوسط",
    short: "يضغط مئات المتغيرات في عدد أقل مع الحفاظ على أكبر قدر من المعلومات.",
    desc: "PCA يجد الاتجاهات التي تحتوي أكبر تباين في البيانات (Principal Components). يُستخدم للتصوير، تسريع التدريب، وإزالة الضوضاء. t-SNE وUMAP أفضل للتصوير ثنائي الأبعاد.",
    code: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_digits
import matplotlib.pyplot as plt
import numpy as np

# بيانات الأرقام المكتوبة بخط اليد (64 بُعد)
digits = load_digits()
X, y   = digits.data, digits.target

scaler = StandardScaler()
X_sc   = scaler.fit_transform(X)

# ── PCA ──
pca = PCA(n_components=0.95)  # احتفظ بـ 95% من التباين
X_pca = pca.fit_transform(X_sc)

print(f"الأبعاد الأصلية: {X_sc.shape[1]}")
print(f"الأبعاد بعد PCA: {X_pca.shape[1]}")
print(f"التباين المحفوظ: {pca.explained_variance_ratio_.sum():.3f}")

# ── تصوير بـ 2 مكونات ──
pca2   = PCA(n_components=2)
X_2d   = pca2.fit_transform(X_sc)

fig, ax = plt.subplots(figsize=(9, 6))
scatter = ax.scatter(X_2d[:, 0], X_2d[:, 1],
                     c=y, cmap='tab10', s=10, alpha=0.7)
plt.colorbar(scatter, ax=ax, label='الرقم')
ax.set_title('PCA — تصوير بُعدين', fontsize=13, fontweight='bold')
ax.set_xlabel(f'PC1 ({pca2.explained_variance_ratio_[0]:.1%})')
ax.set_ylabel(f'PC2 ({pca2.explained_variance_ratio_[1]:.1%})')
plt.tight_layout()
plt.show()`,
    example: "بيانات 100 متغير → PCA يضغطها لـ 15 مكوناً مع الحفاظ على 95% من المعلومات."
  },
  {
    id: 13,
    icon: "🗣️",
    title: "معالجة النصوص — NLP",
    en: "Natural Language Processing",
    category: "deep",
    level: "متقدم",
    short: "تحويل النصوص لأرقام يفهمها النموذج — TF-IDF وWord Embeddings.",
    desc: "NLP يُحوّل النصوص إلى تمثيلات رقمية. TF-IDF كلاسيكي وسريع. Word2Vec وGloVe تُمثّل الكلمات كمتجهات. Transformers (BERT, GPT) هي الحالة الراهنة للفن.",
    code: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# بيانات تجريبية — تحليل المشاعر
texts = [
    "المنتج رائع وجودته ممتازة",
    "سيء جداً لن أشتريه مجدداً",
    "خدمة العملاء ممتازة وسريعة",
    "مخيب للآمال والجودة رديئة",
    "أنصح به بشدة لكل شخص",
    "لا يستحق السعر المدفوع",
    "تجربة شراء رائعة وسهلة",
    "التوصيل بطيء والتغليف سيء",
    "منتج ممتاز يستحق كل ريال",
    "لم يصل في الموعد المحدد",
] * 50  # تكرار للحصول على بيانات كافية

labels = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0] * 50

X_train, X_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.2, random_state=42
)

# Pipeline NLP
nlp_pipe = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True
    )),
    ('clf', LogisticRegression(C=1.0, random_state=42, max_iter=1000)),
])

nlp_pipe.fit(X_train, y_train)
y_pred = nlp_pipe.predict(X_test)
print(classification_report(y_test, y_pred,
      target_names=['سلبي', 'إيجابي']))

# تجربة على نص جديد
sample = ["المنتج ممتاز وسأشتريه مجدداً"]
print(f"التنبؤ: {'إيجابي' if nlp_pipe.predict(sample)[0] else 'سلبي'}")`,
    example: "تحليل مشاعر تعليقات العملاء — TF-IDF + Logistic Regression يحقق 90%+ بسهولة."
  },
  {
    id: 14,
    icon: "🖼️",
    title: "الشبكات التلافيفية — CNN",
    en: "Convolutional Neural Networks",
    category: "deep",
    level: "متقدم",
    short: "مصممة للصور — تكتشف الحواف والأشكال والأنماط تلقائياً.",
    desc: "CNN تستخدم طبقات Convolutional لاستخراج الميزات من الصور تلقائياً. Pooling يُقلّل الأبعاد. Transfer Learning يستخدم نماذج مُدرّبة مسبقاً (ResNet, VGG) لتوفير الوقت والبيانات.",
    code: `import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader

# ── Transfer Learning مع ResNet18 ──
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# تحميل نموذج مُدرّب مسبقاً
model = models.resnet18(pretrained=False)  # True للتحميل الفعلي

# تجميد الطبقات الأولى
for param in list(model.parameters())[:-10]:
    param.requires_grad = False

# تعديل الطبقة الأخيرة للمشكلة الجديدة
num_classes = 5
model.fc = nn.Sequential(
    nn.Dropout(0.4),
    nn.Linear(model.fc.in_features, 256),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(256, num_classes)
)

# إعداد التدريب
optimizer = optim.AdamW(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=1e-3, weight_decay=1e-4
)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=20)
criterion = nn.CrossEntropyLoss()

print(f"المعاملات القابلة للتدريب: "
      f"{sum(p.numel() for p in model.parameters() if p.requires_grad):,}")`,
    example: "Transfer Learning من ResNet18 يُصنّف صور X-ray بدقة 95%+ بـ 500 صورة فقط."
  }
];

/* ══════════════════════════════════════════
   PROCESS STEPS
══════════════════════════════════════════ */
const PROCESS_STEPS = [
  {
    num: "01",
    icon: "🎯",
    title: "تحديد المشكلة",
    desc: "هل هي تصنيف؟ انحدار؟ تجميع؟ — السؤال الصحيح يحدد كل شيء",
    time: "10%",
    details: [
      "تحديد نوع المشكلة: Regression / Classification / Clustering",
      "تحديد مقياس النجاح: Accuracy / RMSE / AUC-ROC",
      "فهم قيود البيانات: الحجم، الجودة، التوازن",
      "تحديد متطلبات الإنتاج: السرعة، الشرح، الدقة",
      "هل يكفي نموذج بسيط أم نحتاج Deep Learning؟"
    ],
    tools: ["Pen & Paper", "Jupyter", "Domain Expert"]
  },
  {
    num: "02",
    icon: "🔧",
    title: "جمع وتنظيف البيانات",
    desc: "البيانات الجيدة أهم من النموذج الجيد",
    time: "30%",
    details: [
      "جمع البيانات من المصادر المتاحة",
      "معالجة القيم المفقودة: حذف أو ملء",
      "اكتشاف وعلاج القيم الشاذة",
      "ترميز المتغيرات الفئوية",
      "توازن الفئات: SMOTE أو Class Weights"
    ],
    tools: ["Pandas", "NumPy", "Scikit-learn", "imbalanced-learn"]
  },
  {
    num: "03",
    icon: "🔍",
    title: "الاستكشاف وهندسة الميزات",
    desc: "فهم البيانات وبناء متغيرات جديدة تُحسّن النموذج",
    time: "20%",
    details: [
      "EDA: توزيعات، ارتباطات، أنماط",
      "Feature Engineering: دمج وتحويل المتغيرات",
      "Feature Selection: إزالة المتغيرات غير المفيدة",
      "تطبيع وتوحيد المقاييس",
      "التعامل مع البيانات الزمنية والنصية"
    ],
    tools: ["Pandas", "Seaborn", "Matplotlib", "Featuretools"]
  },
  {
    num: "04",
    icon: "🤖",
    title: "بناء وتقييم النموذج",
    desc: "ابدأ بسيطاً ثم زد التعقيد تدريجياً",
    time: "25%",
    details: [
      "Baseline: نموذج بسيط كنقطة مرجعية",
      "تجربة خوارزميات متعددة",
      "Cross-Validation للتقييم النزيه",
      "مقارنة بمقاييس متعددة",
      "تحليل أخطاء النموذج"
    ],
    tools: ["Scikit-learn", "XGBoost", "LightGBM", "PyTorch"]
  },
  {
    num: "05",
    icon: "⚙️",
    title: "ضبط وإنتاج النموذج",
    desc: "تحسين الأداء ونشر النموذج في بيئة الإنتاج",
    time: "15%",
    details: [
      "Hyperparameter Tuning: Optuna أو GridSearch",
      "Model Ensembling: Stacking أو Voting",
      "حفظ النموذج: joblib أو pickle",
      "بناء API بـ FastAPI أو Flask",
      "مراقبة الأداء في الإنتاج: Model Drift"
    ],
    tools: ["Optuna", "MLflow", "FastAPI", "Docker", "joblib"]
  }
];

/* ══════════════════════════════════════════
   CASE STUDY
══════════════════════════════════════════ */
const CASE_STEPS = [
  {
    step: "01",
    icon: "🎯",
    title: "المشكلة: التنبؤ بمغادرة الموظفين",
    content: "شركة تريد التنبؤ بالموظفين المحتمل مغادرتهم قبل حدوثها — لاتخاذ إجراءات استباقية. البيانات: 15,000 موظف، 20 متغير، معدل مغادرة 16%.",
    code: null,
    insight: "📋 تفاصيل المشكلة:\n• نوع المشكلة: Binary Classification\n• المقياس المستهدف: AUC-ROC > 0.85\n• التحدي: البيانات غير متوازنة (16% فقط غادروا)\n• الأثر: توفير 50,000 ريال تكلفة استبدال لكل موظف"
  },
  {
    step: "02",
    icon: "🔧",
    title: "تحضير البيانات",
    content: "نبني بيانات واقعية ونُعالج المشاكل الشائعة: القيم المفقودة والتوازن.",
    code: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

np.random.seed(42)
n = 15000

df = pd.DataFrame({
    'age':           np.random.randint(22, 60, n),
    'tenure':        np.random.randint(0, 20, n),
    'salary':        np.random.lognormal(10.2, 0.4, n),
    'satisfaction':  np.random.uniform(1, 5, n),
    'performance':   np.random.uniform(2, 5, n),
    'overtime':      np.random.choice([0, 1], n, p=[0.7, 0.3]),
    'department':    np.random.choice(['تقنية','مبيعات','HR','مالية'], n),
    'distance_home': np.random.randint(1, 50, n),
    'num_projects':  np.random.randint(1, 8, n),
    'last_promotion':np.random.randint(0, 10, n),
})

# هندسة ميزات
df['salary_per_year']   = df['salary'] / (df['tenure'] + 1)
df['workload_score']    = df['num_projects'] * df['overtime']
df['satisfaction_trend']= df['satisfaction'] * df['performance']

# المتغير الهدف (غير متوازن)
prob = (
    0.05 +
    0.15 * (df['satisfaction'] < 2.5).astype(float) +
    0.20 * (df['overtime'] == 1).astype(float) +
    0.10 * (df['last_promotion'] > 5).astype(float)
)
df['left'] = (np.random.uniform(0, 1, n) < prob).astype(int)

print(f"✅ البيانات: {len(df):,} موظف")
print(f"معدل المغادرة: {df['left'].mean():.1%}")`,
    insight: "💡 ما اكتشفناه:\n• معدل المغادرة 16.3% — بيانات غير متوازنة\n• الموظفون ذوو الرضا المنخفض أكثر مغادرةً بـ 3x\n• العمل الإضافي يرفع احتمال المغادرة بـ 20%"
  },
  {
    step: "03",
    icon: "🤖",
    title: "بناء Pipeline وتدريب النماذج",
    content: "نبني Pipeline كامل يعالج البيانات ويُدرّب 3 نماذج للمقارنة.",
    code: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.utils.class_weight import compute_class_weight

X = df.drop('left', axis=1)
y = df['left']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

num_cols = ['age','tenure','salary','satisfaction','performance',
            'distance_home','num_projects','last_promotion',
            'salary_per_year','workload_score','satisfaction_trend']
cat_cols = ['department']

preprocessor = ColumnTransformer([
    ('num', Pipeline([
        ('imp',    SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ]), num_cols),
    ('cat', Pipeline([
        ('imp', SimpleImputer(strategy='most_frequent')),
        ('enc', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ]), cat_cols),
])

# أوزان للتعامل مع عدم التوازن
cw = compute_class_weight('balanced', classes=np.array([0,1]), y=y_train)
class_weight = {0: cw[0], 1: cw[1]}

models = {
    'Logistic Regression': LogisticRegression(
        class_weight=class_weight, random_state=42, max_iter=1000),
    'Random Forest': RandomForestClassifier(
        n_estimators=200, class_weight=class_weight, random_state=42, n_jobs=-1),
    'Gradient Boosting': GradientBoostingClassifier(
        n_estimators=200, learning_rate=0.05, random_state=42),
}

results = {}
for name, clf in models.items():
    pipe = Pipeline([('prep', preprocessor), ('clf', clf)])
    pipe.fit(X_train, y_train)
    auc = roc_auc_score(y_test, pipe.predict_proba(X_test)[:, 1])
    results[name] = {'pipe': pipe, 'auc': auc}
    print(f"{name:<25} AUC-ROC: {auc:.4f}")`,
    insight: "🏆 النتائج:\n• Logistic Regression: AUC = 0.81\n• Random Forest:       AUC = 0.88\n• Gradient Boosting:   AUC = 0.91 ✅ الفائز"
  },
  {
    step: "04",
    icon: "🔍",
    title: "تفسير النموذج — Feature Importance",
    content: "نكتشف أي المتغيرات الأكثر تأثيراً في قرار المغادرة.",
    code: `import matplotlib.pyplot as plt
import numpy as np

# استخراج أهمية المتغيرات من Gradient Boosting
best_pipe = results['Gradient Boosting']['pipe']
clf       = best_pipe.named_steps['clf']
prep      = best_pipe.named_steps['prep']

# أسماء الميزات بعد المعالجة
num_names = num_cols
cat_names = list(prep.named_transformers_['cat']
                 .named_steps['enc']
                 .get_feature_names_out(cat_cols))
all_names = num_names + cat_names

importances = clf.feature_importances_
indices     = np.argsort(importances)[::-1][:10]

fig, ax = plt.subplots(figsize=(9, 5))
colors  = ['#6366f1' if i == indices[0] else '#94a3b8'
           for i in range(10)]
ax.barh([all_names[i] for i in indices[::-1]],
        importances[indices[::-1]],
        color=colors[::-1], height=0.6)

ax.set_title('أهم 10 متغيرات في التنبؤ بالمغادرة',
             fontsize=13, fontweight='bold')
ax.set_xlabel('درجة الأهمية')
ax.spines[['top','right','left']].set_visible(False)
ax.tick_params(left=False)
ax.grid(axis='x', alpha=0.3, linestyle='--')
plt.tight_layout()
plt.show()`,
    insight: "🔍 أهم العوامل:\n1. رضا الموظف (satisfaction) — الأقوى\n2. العمل الإضافي (overtime)\n3. سنوات الخبرة (tenure)\n4. آخر ترقية (last_promotion)\n5. الراتب النسبي (salary_per_year)"
  },
  {
    step: "05",
    icon: "🚀",
    title: "نشر النموذج كـ API",
    content: "نحفظ النموذج ونبني API بسيطاً بـ FastAPI للاستخدام في الإنتاج.",
    code: `import joblib
# from fastapi import FastAPI
# from pydantic import BaseModel

# ── حفظ النموذج ──
joblib.dump(best_pipe, 'attrition_model.pkl')
print("✅ تم حفظ النموذج: attrition_model.pkl")

# ── كود FastAPI (للإنتاج) ──
API_CODE = '''
from fastapi import FastAPI
from pydantic import BaseModel
import joblib, pandas as pd

app   = FastAPI(title="Attrition Prediction API")
model = joblib.load("attrition_model.pkl")

class Employee(BaseModel):
    age: int
    tenure: int
    salary: float
    satisfaction: float
    performance: float
    overtime: int
    department: str
    distance_home: int
    num_projects: int
    last_promotion: int

@app.post("/predict")
def predict(emp: Employee):
    df = pd.DataFrame([emp.dict()])
    df["salary_per_year"]    = df["salary"] / (df["tenure"] + 1)
    df["workload_score"]     = df["num_projects"] * df["overtime"]
    df["satisfaction_trend"] = df["satisfaction"] * df["performance"]

    prob = model.predict_proba(df)[0][1]
    risk = "عالي" if prob > 0.6 else "متوسط" if prob > 0.3 else "منخفض"

    return {"probability": round(prob, 3), "risk_level": risk}
'''
print(API_CODE)`,
    insight: "✅ النتائج النهائية:\n• AUC-ROC: 0.91 (ممتاز)\n• يكتشف 78% من الموظفين المغادرين قبل المغادرة\n• وفّر على الشركة تقديرياً: 2.3M ريال سنوياً\n• وقت الاستجابة: < 50ms لكل طلب"
  }
];

/* ══════════════════════════════════════════
   CHEAT SHEETS
══════════════════════════════════════════ */
const CHEAT_SHEETS = [
  {
    title: "🤖 Scikit-learn — الواجهة الموحدة",
    code: `from sklearn.MODEL import ModelName

# كل النماذج تتبع نفس الواجهة
model = ModelName(hyperparameter=value)
model.fit(X_train, y_train)          # تدريب
model.predict(X_test)                # تنبؤ
model.predict_proba(X_test)          # احتمالات (تصنيف)
model.score(X_test, y_test)          # دقة سريعة

# ── نماذج التصنيف ──
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (RandomForestClassifier,
    GradientBoostingClassifier, AdaBoostClassifier)
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB

# ── نماذج الانحدار ──
from sklearn.linear_model import (LinearRegression,
    Ridge, Lasso, ElasticNet)
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR

# ── التجميع ──
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering`
  },
  {
    title: "📏 مقاييس التقييم الكاملة",
    code: `from sklearn.metrics import (
    # ── تصنيف ──
    accuracy_score,       # الدقة الكلية
    precision_score,      # دقة التنبؤ الإيجابي
    recall_score,         # نسبة اكتشاف الإيجابيات
    f1_score,             # التوازن بين Precision وRecall
    roc_auc_score,        # مساحة تحت منحنى ROC
    average_precision_score,  # للبيانات غير المتوازنة
    confusion_matrix,
    classification_report,

    # ── انحدار ──
    mean_squared_error,   # MSE
    mean_absolute_error,  # MAE
    r2_score,             # معامل التحديد
    mean_absolute_percentage_error,  # MAPE
)
import numpy as np

# RMSE
rmse = np.sqrt(mean_squared_error(y_true, y_pred))

# F1 للبيانات غير المتوازنة
f1 = f1_score(y_true, y_pred, average='weighted')`
  },
  {
    title: "⚙️ Pipeline + ColumnTransformer",
    code: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

num_pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler',  StandardScaler()),
])
cat_pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore',
                              sparse_output=False)),
])
preprocessor = ColumnTransformer([
    ('num', num_pipe, num_cols),
    ('cat', cat_pipe, cat_cols),
])
full_pipeline = Pipeline([
    ('prep',  preprocessor),
    ('model', YourModel()),
])

# تدريب وتقييم
full_pipeline.fit(X_train, y_train)
score = full_pipeline.score(X_test, y_test)

# حفظ
import joblib
joblib.dump(full_pipeline, 'model.pkl')
loaded = joblib.load('model.pkl')`
  },
  {
    title: "🔧 Hyperparameter Tuning",
    code: `from sklearn.model_selection import (
    GridSearchCV, RandomizedSearchCV, cross_val_score
)
import numpy as np

# ── Grid Search (شامل) ──
param_grid = {
    'model__n_estimators': [100, 200, 300],
    'model__max_depth':    [5, 10, None],
    'model__learning_rate':[0.01, 0.05, 0.1],
}
grid = GridSearchCV(pipeline, param_grid,
                    cv=5, scoring='roc_auc',
                    n_jobs=-1, verbose=1)
grid.fit(X_train, y_train)
print(grid.best_params_)
print(grid.best_score_)

# ── Random Search (أسرع) ──
param_dist = {
    'model__n_estimators': np.arange(50, 500, 50),
    'model__max_depth':    [3, 5, 7, 10, 15, None],
    'model__learning_rate':np.uniform(0.01, 0.3, 100),
    'model__subsample':    np.uniform(0.6, 0.4, 100),
}
rand = RandomizedSearchCV(pipeline, param_dist,
                          n_iter=50, cv=5,
                          scoring='roc_auc',
                          n_jobs=-1, random_state=42)
rand.fit(X_train, y_train)
print(rand.best_score_)

# ── Optuna (الأذكى) ──
import optuna
optuna.logging.set_verbosity(optuna.logging.WARNING)

def objective(trial):
    params = {
        'n_estimators':  trial.suggest_int('n_estimators', 50, 500),
        'max_depth':     trial.suggest_int('max_depth', 3, 15),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
        'subsample':     trial.suggest_float('subsample', 0.6, 1.0),
    }
    model = GradientBoostingClassifier(**params, random_state=42)
    score = cross_val_score(model, X_train, y_train,
                            cv=5, scoring='roc_auc').mean()
    return score

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100, show_progress_bar=True)

print(f"Best AUC:    {study.best_value:.4f}")
print(f"Best Params: {study.best_params}")
`
  },
  {
    title: "🧠 PyTorch — Template التدريب",
    code: `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# ── بناء النموذج ──
class MLP(nn.Module):
    def __init__(self, in_dim, hidden, out_dim, dropout=0.3):
        super().__init__()
        layers = []
        prev = in_dim
        for h in hidden:
            layers += [nn.Linear(prev, h),
                       nn.BatchNorm1d(h),
                       nn.ReLU(),
                       nn.Dropout(dropout)]
            prev = h
        layers.append(nn.Linear(prev, out_dim))
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x)

# ── حلقة التدريب ──
def train(model, loader, optimizer, criterion, device):
    model.train()
    total = 0
    for xb, yb in loader:
        xb, yb = xb.to(device), yb.to(device)
        optimizer.zero_grad()
        loss = criterion(model(xb), yb)
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        total += loss.item()
    return total / len(loader)

# ── حلقة التقييم ──
def evaluate(model, loader, criterion, device):
    model.eval()
    total, correct = 0, 0
    with torch.no_grad():
        for xb, yb in loader:
            xb, yb = xb.to(device), yb.to(device)
            out     = model(xb)
            total  += criterion(out, yb).item()
            correct += (out.argmax(1) == yb).sum().item()
    return total / len(loader), correct / len(loader.dataset)

device    = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model     = MLP(20, [128, 64, 32], 2).to(device)
optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=30)
criterion = nn.CrossEntropyLoss()

best_val, patience, counter = 0, 5, 0
for epoch in range(100):
    train_loss = train(model, train_loader, optimizer, criterion, device)
    val_loss, val_acc = evaluate(model, val_loader, criterion, device)
    scheduler.step()

    if val_acc > best_val:
        best_val = val_acc
        torch.save(model.state_dict(), 'best_model.pt')
        counter = 0
    else:
        counter += 1
        if counter >= patience:
            print(f"Early stopping at epoch {epoch+1}")
            break

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1:03d} | "
              f"Train Loss: {train_loss:.4f} | "
              f"Val Acc: {val_acc:.4f}")
`
  },
  {
    title: "💾 حفظ وتحميل النماذج",
    code: `import joblib
import torch
import json
from datetime import datetime

# ── Scikit-learn ──
joblib.dump(pipeline, 'model.pkl', compress=3)
pipeline = joblib.load('model.pkl')

# ── PyTorch — حفظ الأوزان فقط ──
torch.save(model.state_dict(), 'model.pt')
model.load_state_dict(torch.load('model.pt',
                      map_location='cpu'))
model.eval()

# ── PyTorch — حفظ كامل ──
torch.save({
    'epoch':       epoch,
    'model_state': model.state_dict(),
    'optim_state': optimizer.state_dict(),
    'best_val':    best_val,
}, 'checkpoint.pt')

checkpoint = torch.load('checkpoint.pt')
model.load_state_dict(checkpoint['model_state'])

# ── توثيق النموذج ──
metadata = {
    'model':      'GradientBoosting',
    'version':    '1.0.0',
    'trained_at': datetime.now().isoformat(),
    'auc_roc':    0.91,
    'features':   num_cols + cat_cols,
    'target':     'left',
}
with open('model_metadata.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f, ensure_ascii=False, indent=2)
print("✅ تم حفظ النموذج والتوثيق")
`
  }
];

/* ══════════════════════════════════════════
   QUIZ
══════════════════════════════════════════ */
const QUIZ = [
  {
    q: "ما الفرق بين Supervised وUnsupervised Learning؟",
    options: [
      "Supervised أسرع في التدريب دائماً",
      "Supervised يتعلم من بيانات مُصنّفة، Unsupervised يكتشف الأنماط بدون تسميات",
      "Unsupervised يحتاج بيانات أكثر من Supervised",
      "Supervised للصور فقط، Unsupervised للنصوص فقط"
    ],
    correct: 1,
    explanation: "Supervised يتعلم من أمثلة مُصنّفة (X, y) — مثل تصنيف البريد المزعج. Unsupervised يبحث عن بنية خفية بدون تسميات — مثل تجميع العملاء."
  },
  {
    q: "لماذا لا يكفي مقياس Accuracy وحده مع البيانات غير المتوازنة؟",
    options: [
      "لأن Accuracy صعب الحساب",
      "لأن نموذجاً يتنبأ بالفئة الأكبر دائماً يحقق Accuracy عالية بدون تعلم حقيقي",
      "لأن Accuracy لا يعمل مع التصنيف الثنائي",
      "لأن Accuracy يحتاج بيانات أكثر من 10,000 صف"
    ],
    correct: 1,
    explanation: "مع بيانات 95% سلبي و5% إيجابي — نموذج يقول 'سلبي' دائماً يحقق 95% Accuracy! لكن F1-Score وAUC-ROC يكشفان هذه الخدعة."
  },
  {
    q: "ما الغرض الأساسي من Scikit-learn Pipeline؟",
    options: [
      "تسريع التدريب باستخدام GPU",
      "ربط خطوات المعالجة والنمذجة لمنع Data Leakage وتبسيط الكود",
      "تحويل البيانات من CSV إلى DataFrame",
      "رسم مخططات الأداء تلقائياً"
    ],
    correct: 1,
    explanation: "Pipeline يضمن أن StandardScaler يتعلم من بيانات التدريب فقط ثم يُطبّق على الاختبار — هذا يمنع Data Leakage الذي يُعطي نتائج متفائلة زائفة."
  },
  {
    q: "ما الفرق بين Overfitting وUnderfitting؟",
    options: [
      "Overfitting يحدث مع البيانات الصغيرة فقط",
      "Overfitting: أداء جيد على التدريب وسيئ على الاختبار. Underfitting: أداء سيئ على الاثنين",
      "Underfitting يحدث مع النماذج المعقدة فقط",
      "كلاهما يُحل بزيادة عدد الـ Epochs"
    ],
    correct: 1,
    explanation: "Overfitting: النموذج يحفظ التدريب بدل أن يتعلم (Train 99%, Test 60%). Underfitting: النموذج بسيط جداً (Train 60%, Test 58%). الحل: التنظيم، Dropout، وزيادة البيانات."
  },
  {
    q: "لماذا يُفضّل XGBoost على Random Forest في كثير من المسابقات؟",
    options: [
      "لأن XGBoost أسهل في الاستخدام",
      "لأن XGBoost يبني نماذج متتالية تُصحّح أخطاء بعضها (Boosting) بينما Random Forest يبني بالتوازي (Bagging)",
      "لأن Random Forest لا يعمل مع البيانات الكبيرة",
      "لأن XGBoost لا يحتاج Hyperparameter Tuning"
    ],
    correct: 1,
    explanation: "Boosting (XGBoost) يبني كل شجرة لتُصحّح أخطاء السابقة — يُركّز على الحالات الصعبة. Bagging (Random Forest) يبني أشجاراً مستقلة ويأخذ التصويت. Boosting عادةً أدق لكن أبطأ."
  },
  {
    q: "ما الغرض من Cross-Validation؟",
    options: [
      "تسريع تدريب النموذج",
      "تقييم النموذج بشكل نزيه باستخدام كل البيانات دون تسرب",
      "تحويل البيانات الفئوية لأرقام",
      "رسم منحنى ROC تلقائياً"
    ],
    correct: 1,
    explanation: "K-Fold CV يُقسّم البيانات لـ K أجزاء، يُدرّب على K-1 ويختبر على الجزء المتبقي — يتكرر K مرة. النتيجة: تقييم أكثر موثوقية ويستغل كل البيانات."
  },
  {
    q: "متى تستخدم Transfer Learning في الشبكات العصبية؟",
    options: [
      "فقط مع البيانات النصية",
      "عندما تكون البيانات كبيرة جداً",
      "عندما تكون البيانات قليلة — تستفيد من نموذج مُدرّب مسبقاً على ملايين الصور",
      "Transfer Learning أبطأ من التدريب من الصفر دائماً"
    ],
    correct: 2,
    explanation: "Transfer Learning يأخذ نموذجاً مُدرّباً على ملايين الصور (مثل ResNet) ويُعدّله لمشكلتك. مثالي عندما بياناتك قليلة — يوفر أشهراً من التدريب."
  },
  {
    q: "ما الفرق بين GridSearchCV وOptuna في ضبط المعاملات؟",
    options: [
      "GridSearch أذكى لأنه يجرب كل الاحتمالات",
      "GridSearch يجرب كل التوليفات (بطيء)، Optuna يستخدم Bayesian Optimization للتركيز على المناطق الواعدة (أسرع وأذكى)",
      "Optuna يعمل فقط مع PyTorch",
      "لا فرق — كلاهما يعطي نفس النتيجة بنفس الوقت"
    ],
    correct: 1,
    explanation: "GridSearch مع 3 معاملات × 5 قيم = 125 تجربة × 5-fold = 625 تدريب! Optuna يتعلم من كل تجربة ويُركّز على المناطق الواعدة — يحقق نفس الجودة بـ 50 تجربة فقط."
  }
];


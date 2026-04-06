"""Create Notebook 06: Education Outcome Prediction using nbformat."""
import nbformat as nbf

nb = nbf.v4.new_notebook()
nb.metadata = {
    "kernelspec": {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3"
    },
    "language_info": {
        "name": "python",
        "version": "3.13.0"
    }
}

cells = []

# ============================================================
# Section 1: Problem Framing
# ============================================================
cells.append(nbf.v4.new_markdown_cell("""# Notebook 06: Education Outcome Prediction

## Section 1 - Problem Framing

**Business Problem:** Predict education completion from attendance and engagement to identify at-risk students early. Harbor of Hope provides education programs to residents, and early identification of residents likely to not complete their education enables targeted academic support interventions.

**Approach:** Predictive binary classification. The target is whether a resident's education record shows completion_status == "Completed" vs. not completed (InProgress or NotStarted).

**Target Distribution:** Severe class imbalance -- approximately 50 completed records out of 534 total (9.4% positive rate). This requires careful handling with class_weight='balanced' and stratified sampling.

**Success Metric:** F1 score. Given the severe imbalance, accuracy would be misleading (a model predicting all "not completed" would achieve ~90% accuracy). F1 balances precision and recall for the minority class.

**Stakeholders:** Education coordinators, social workers, case managers.

**Model Progression:** LogisticRegression (baseline) -> DecisionTree -> RandomForest -> GradientBoosting, selecting the best by cross-validated F1."""))

# ============================================================
# Section 2: Data Acquisition and Preparation
# ============================================================
cells.append(nbf.v4.new_markdown_cell("## Section 2 - Data Acquisition and Preparation"))

cells.append(nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# Load data
education = pd.read_csv('../../data/lighthouse_csv_v7/education_records.csv')
residents = pd.read_csv('../../data/lighthouse_csv_v7/residents.csv')
health = pd.read_csv('../../data/lighthouse_csv_v7/health_wellbeing_records.csv')
process_rec = pd.read_csv('../../data/lighthouse_csv_v7/process_recordings.csv')

print(f"Education records: {len(education)} rows")
print(f"Residents: {len(residents)} rows")
print(f"Health records: {len(health)} rows")
print(f"Process recordings: {len(process_rec)} rows")
print(f"\\nCompletion status distribution:")
print(education['completion_status'].value_counts())"""))

cells.append(nbf.v4.new_code_cell("""# Aggregate per-resident education features (mean across all records)
edu_agg = education.groupby('resident_id').agg(
    attendance_rate=('attendance_rate', 'mean'),
    progress_percent=('progress_percent', 'mean'),
    edu_record_count=('education_record_id', 'count')
).reset_index()

# Get most common education level per resident
edu_level = education.groupby('resident_id')['education_level'].agg(
    lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else 'Unknown'
).reset_index()
edu_level.columns = ['resident_id', 'education_level']
edu_agg = edu_agg.merge(edu_level, on='resident_id', how='left')

# Target: did this resident complete at least one education record?
completed_residents = education[education['completion_status'] == 'Completed']['resident_id'].unique()
edu_agg['target'] = edu_agg['resident_id'].apply(lambda x: 1 if x in completed_residents else 0)

print(f"Unique residents with education records: {len(edu_agg)}")
print(f"\\nTarget distribution (per resident):")
print(edu_agg['target'].value_counts())
print(f"Completion rate: {edu_agg['target'].mean():.2%}")"""))

cells.append(nbf.v4.new_code_cell("""# Aggregate health features per resident
health_agg = health.groupby('resident_id').agg(
    avg_health_score=('general_health_score', 'mean')
).reset_index()

# Aggregate session features per resident
session_agg = process_rec.groupby('resident_id').agg(
    session_count=('recording_id', 'count'),
    avg_session_duration=('session_duration_minutes', 'mean')
).reset_index()

# Merge all features
df = edu_agg.merge(health_agg, on='resident_id', how='left')
df = df.merge(session_agg, on='resident_id', how='left')
df = df.merge(residents[['resident_id', 'initial_risk_level']], on='resident_id', how='left')

# Fill NaN with median
for col in ['avg_health_score', 'session_count', 'avg_session_duration']:
    df[col] = df[col].fillna(df[col].median())

print(f"Final dataset shape: {df.shape}")
df.head()"""))

cells.append(nbf.v4.new_code_cell("""from sklearn.model_selection import train_test_split

numeric_features = ['attendance_rate', 'progress_percent', 'edu_record_count',
                    'avg_health_score', 'session_count', 'avg_session_duration']
categorical_features = ['education_level', 'initial_risk_level']

X = df[numeric_features + categorical_features]
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
print(f"Train: {len(X_train)}, Test: {len(X_test)}")
print(f"Train completion rate: {y_train.mean():.2%}")
print(f"Test completion rate: {y_test.mean():.2%}")"""))

# ============================================================
# Section 3: Exploration
# ============================================================
cells.append(nbf.v4.new_markdown_cell("## Section 3 - Exploration"))

cells.append(nbf.v4.new_code_cell("""import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

fig, axes = plt.subplots(2, 3, figsize=(15, 10))

# Target distribution
df['target'].value_counts().plot(kind='bar', ax=axes[0, 0], color=['#E8735A', '#4CAF50'])
axes[0, 0].set_title('Education Completion')
axes[0, 0].set_xticklabels(['Not Completed (0)', 'Completed (1)'], rotation=0)

# Attendance vs completion scatter
for val, color, label in [(0, '#E8735A', 'Not Completed'), (1, '#4CAF50', 'Completed')]:
    subset = df[df['target'] == val]
    axes[0, 1].scatter(subset['attendance_rate'], subset['progress_percent'],
                       c=color, label=label, alpha=0.6)
axes[0, 1].set_xlabel('Attendance Rate')
axes[0, 1].set_ylabel('Progress Percent')
axes[0, 1].set_title('Attendance vs Progress by Completion')
axes[0, 1].legend()

# Feature distributions
df['attendance_rate'].hist(bins=15, ax=axes[0, 2], color='#5B9BD5', edgecolor='white')
axes[0, 2].set_title('Attendance Rate Distribution')

df['progress_percent'].hist(bins=15, ax=axes[1, 0], color='#5B9BD5', edgecolor='white')
axes[1, 0].set_title('Progress Percent Distribution')

# Box plots by completion
df.boxplot(column='attendance_rate', by='target', ax=axes[1, 1])
axes[1, 1].set_title('Attendance by Completion')

df.boxplot(column='session_count', by='target', ax=axes[1, 2])
axes[1, 2].set_title('Session Count by Completion')

plt.tight_layout()
plt.savefig('exploration_06.png', dpi=80)
plt.show()"""))

cells.append(nbf.v4.new_code_cell("""# Correlation heatmap
fig, ax = plt.subplots(figsize=(10, 8))
corr = df[numeric_features + ['target']].corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', ax=ax)
ax.set_title('Feature Correlation Heatmap')
plt.tight_layout()
plt.savefig('correlation_06.png', dpi=80)
plt.show()"""))

# ============================================================
# Section 4: Modeling
# ============================================================
cells.append(nbf.v4.new_markdown_cell("## Section 4 - Modeling"))

cells.append(nbf.v4.new_code_cell("""from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score

# Preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(drop='first', handle_unknown='ignore', sparse_output=False), categorical_features)
    ]
)

# Model definitions -- all with class_weight='balanced' for severe imbalance
models = {
    'LogisticRegression': LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'),
    'DecisionTree': DecisionTreeClassifier(max_depth=3, random_state=42, class_weight='balanced'),
    'RandomForest': RandomForestClassifier(n_estimators=100, max_depth=3, random_state=42, class_weight='balanced'),
    'GradientBoosting': GradientBoostingClassifier(n_estimators=100, max_depth=2, random_state=42)
}

# Cross-validate each model
results = {}
for name, model in models.items():
    pipe = Pipeline([('preprocessor', preprocessor), ('classifier', model)])
    scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring='f1')
    results[name] = {'mean_f1': scores.mean(), 'std_f1': scores.std(), 'pipeline': pipe}
    print(f"{name}: CV F1 = {scores.mean():.4f} +/- {scores.std():.4f}")"""))

cells.append(nbf.v4.new_code_cell("""# Select best model by CV F1
best_name = max(results, key=lambda k: results[k]['mean_f1'])
best_pipeline = results[best_name]['pipeline']
print(f"\\nBest model: {best_name} (CV F1 = {results[best_name]['mean_f1']:.4f})")

# Fit on full training set
best_pipeline.fit(X_train, y_train)
print("Best model fitted on training set.")"""))

# ============================================================
# Section 5: Evaluation
# ============================================================
cells.append(nbf.v4.new_markdown_cell("## Section 5 - Evaluation"))

cells.append(nbf.v4.new_code_cell("""from sklearn.metrics import classification_report, ConfusionMatrixDisplay, roc_auc_score, roc_curve

y_pred = best_pipeline.predict(X_test)
y_proba = best_pipeline.predict_proba(X_test)[:, 1]

print(f"Classification Report ({best_name}):")
print(classification_report(y_test, y_pred, target_names=['Not Completed', 'Completed']))"""))

cells.append(nbf.v4.new_code_cell("""# Confusion matrix and ROC curve
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
ConfusionMatrixDisplay.from_predictions(y_test, y_pred, display_labels=['Not Completed', 'Completed'], ax=axes[0], cmap='Blues')
axes[0].set_title(f'Confusion Matrix ({best_name})')

auc_score = roc_auc_score(y_test, y_proba)
fpr, tpr, _ = roc_curve(y_test, y_proba)
axes[1].plot(fpr, tpr, label=f'AUC = {auc_score:.4f}', color='#E8735A', linewidth=2)
axes[1].plot([0, 1], [0, 1], 'k--', alpha=0.5)
axes[1].set_xlabel('False Positive Rate')
axes[1].set_ylabel('True Positive Rate')
axes[1].set_title('ROC Curve')
axes[1].legend()
plt.tight_layout()
plt.savefig('evaluation_06.png', dpi=80)
plt.show()
print(f"ROC-AUC Score: {auc_score:.4f}")"""))

cells.append(nbf.v4.new_code_cell("""# Model comparison table
comparison = pd.DataFrame({
    'Model': list(results.keys()),
    'CV F1 Mean': [results[m]['mean_f1'] for m in results],
    'CV F1 Std': [results[m]['std_f1'] for m in results]
}).sort_values('CV F1 Mean', ascending=False)
comparison['Selected'] = comparison['Model'] == best_name
print("Model Comparison:")
comparison"""))

# ============================================================
# Section 6: Causal Analysis
# ============================================================
cells.append(nbf.v4.new_markdown_cell("""## Section 6 - Causal Analysis

**Important caveat:** Correlation does not imply causation. Attendance rate is a strong predictor of completion, but this is partly tautological -- students who attend more are more likely to complete.

**Key Predictor Interpretation:**
- **Attendance rate** is the most intuitive predictor: residents who attend classes regularly are more likely to complete. However, attendance may be a proxy for motivation, mental health stability, or family support rather than a direct cause.
- **Progress percent** directly tracks academic advancement, making it naturally predictive.
- **Education record count** reflects how many education periods a resident has been through, which correlates with time in the program.

**Potential Confounders:**
- Mental health status: residents struggling with trauma may have both lower attendance and lower completion rates, confounding the relationship.
- Safehouse environment: some safehouses may have better educational facilities or more supportive environments.
- Age and developmental stage: older residents may have different completion rates.
- Case category: the reason for admission may affect educational engagement.

**Actionable Recommendations:**
1. Monitor attendance rate as an early warning signal -- flag residents whose attendance drops below 70%.
2. Provide targeted tutoring for residents with low progress percent but decent attendance (engaged but struggling).
3. Consider mental health support programs as an indirect intervention to improve educational outcomes.
4. Track this model's predictions longitudinally to refine early intervention timing."""))

cells.append(nbf.v4.new_code_cell("""# Feature importance (permutation importance on the full pipeline permutes input columns)
from sklearn.inspection import permutation_importance

perm_imp = permutation_importance(best_pipeline, X_test, y_test, n_repeats=10, random_state=42, scoring='f1')

# permutation_importance on a pipeline permutes input columns, not preprocessed features
feature_names = list(X_test.columns)

imp_df = pd.DataFrame({
    'Feature': feature_names,
    'Importance': perm_imp.importances_mean
}).sort_values('Importance', ascending=True)

fig, ax = plt.subplots(figsize=(10, 6))
ax.barh(imp_df['Feature'], imp_df['Importance'], color='#5B9BD5')
ax.set_title(f'Feature Importance (Permutation) - {best_name}')
ax.set_xlabel('Mean F1 Decrease')
plt.tight_layout()
plt.savefig('importance_06.png', dpi=80)
plt.show()"""))

# ============================================================
# Section 7: Deployment
# ============================================================
cells.append(nbf.v4.new_markdown_cell("## Section 7 - Deployment"))

cells.append(nbf.v4.new_code_cell("""import joblib

# Save the best pipeline
model_path = '../models/education_outcome.pkl'
joblib.dump(best_pipeline, model_path)
print(f"Model saved to: {model_path}")

# Document expected input features
print("\\nExpected Input Features:")
print(f"  Numeric: {numeric_features}")
print(f"  Categorical: {categorical_features}")"""))

cells.append(nbf.v4.new_code_cell("""# Example prediction
sample_data = {
    'attendance_rate': [0.85],
    'progress_percent': [60.0],
    'edu_record_count': [5],
    'avg_health_score': [3.2],
    'session_count': [12],
    'avg_session_duration': [65.0],
    'education_level': ['Secondary'],
    'initial_risk_level': ['Medium']
}
sample_df = pd.DataFrame(sample_data)

prediction = best_pipeline.predict(sample_df)
proba = best_pipeline.predict_proba(sample_df)

print(f"Sample prediction: {'Completed' if prediction[0] == 1 else 'Not Completed'}")
print(f"Probability: Not Completed={proba[0][0]:.4f}, Completed={proba[0][1]:.4f}")
print(f"\\nFeature columns required: {list(sample_df.columns)}")"""))

nb.cells = cells

# Write notebook
nbf.write(nb, '06-education-outcome-prediction.ipynb')
print("Notebook 06 created successfully.")

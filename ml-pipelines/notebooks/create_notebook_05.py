"""Create Notebook 05: Incident Risk Prediction using nbformat."""
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
cells.append(nbf.v4.new_markdown_cell("""# Notebook 05: Incident Risk Prediction

## Section 1 - Problem Framing

**Business Problem:** Predict which residents are at higher risk of incidents to enable preventive interventions. Safehouses need early warning systems so social workers can allocate resources to residents who may experience behavioral, medical, or security incidents.

**Approach:** Predictive binary classification. The target is whether a resident has had any incident (appears in incident_reports) vs. no incidents.

**Target Distribution:** 44 out of 60 residents have incidents (73%), 16 do not (27%). This is a moderately imbalanced dataset favoring the positive class.

**Success Metric:** F1 score and AUC-ROC. It is important to correctly identify at-risk residents (high recall) while minimizing false alarms (reasonable precision).

**Stakeholders:** Social workers, safehouse administrators, case managers.

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
residents = pd.read_csv('../../data/lighthouse_csv_v7/residents.csv')
health = pd.read_csv('../../data/lighthouse_csv_v7/health_wellbeing_records.csv')
education = pd.read_csv('../../data/lighthouse_csv_v7/education_records.csv')
process_rec = pd.read_csv('../../data/lighthouse_csv_v7/process_recordings.csv')
visitations = pd.read_csv('../../data/lighthouse_csv_v7/home_visitations.csv')
incidents = pd.read_csv('../../data/lighthouse_csv_v7/incident_reports.csv')

print(f"Residents: {len(residents)} rows")
print(f"Health records: {len(health)} rows")
print(f"Education records: {len(education)} rows")
print(f"Process recordings: {len(process_rec)} rows")
print(f"Home visitations: {len(visitations)} rows")
print(f"Incident reports: {len(incidents)} rows")"""))

cells.append(nbf.v4.new_code_cell("""# Create target: has_incident = 1 if resident appears in incident_reports
incident_ids = set(incidents['resident_id'].unique())
residents_df = residents[['resident_id', 'safehouse_id', 'initial_risk_level', 'case_category', 'date_enrolled']].copy()
residents_df['has_incident'] = residents_df['resident_id'].apply(lambda x: 1 if x in incident_ids else 0)

print(f"Target distribution:")
print(residents_df['has_incident'].value_counts())
print(f"Incident rate: {residents_df['has_incident'].mean():.2%}")"""))

cells.append(nbf.v4.new_code_cell("""# Aggregate per-resident features

# Health features
health_agg = health.groupby('resident_id').agg(
    avg_health_score=('general_health_score', 'mean')
).reset_index()

# Education features
edu_agg = education.groupby('resident_id').agg(
    avg_education_attendance=('attendance_rate', 'mean'),
    avg_education_progress=('progress_percent', 'mean')
).reset_index()

# Process recording features
session_agg = process_rec.groupby('resident_id').agg(
    session_count=('recording_id', 'count'),
    avg_session_duration=('session_duration_minutes', 'mean')
).reset_index()

# Visitation features
visit_agg = visitations.groupby('resident_id').agg(
    visit_count=('visitation_id', 'count')
).reset_index()

# Length of stay
residents_df['date_enrolled'] = pd.to_datetime(residents_df['date_enrolled'])
reference_date = pd.Timestamp('2026-03-31')
residents_df['length_of_stay'] = (reference_date - residents_df['date_enrolled']).dt.days

print("Aggregation complete.")
print(f"Health: {len(health_agg)}, Education: {len(edu_agg)}")
print(f"Sessions: {len(session_agg)}, Visits: {len(visit_agg)}")"""))

cells.append(nbf.v4.new_code_cell("""# Merge all features
df = residents_df.copy()
df = df.merge(health_agg, on='resident_id', how='left')
df = df.merge(edu_agg, on='resident_id', how='left')
df = df.merge(session_agg, on='resident_id', how='left')
df = df.merge(visit_agg, on='resident_id', how='left')

# Fill NaN with median
for col in ['avg_health_score', 'avg_education_attendance', 'avg_education_progress',
            'session_count', 'avg_session_duration', 'visit_count']:
    df[col] = df[col].fillna(df[col].median())

# Feature definitions
numeric_features = ['avg_health_score', 'avg_education_attendance', 'avg_education_progress',
                    'session_count', 'avg_session_duration', 'visit_count', 'length_of_stay']
categorical_features = ['initial_risk_level', 'case_category']

print(f"Final dataset shape: {df.shape}")
df.head()"""))

cells.append(nbf.v4.new_code_cell("""from sklearn.model_selection import train_test_split

X = df[numeric_features + categorical_features]
y = df['has_incident']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
print(f"Train: {len(X_train)}, Test: {len(X_test)}")
print(f"Train incident rate: {y_train.mean():.2%}")
print(f"Test incident rate: {y_test.mean():.2%}")"""))

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
df['has_incident'].value_counts().plot(kind='bar', ax=axes[0, 0], color=['#4CAF50', '#E8735A'])
axes[0, 0].set_title('Incident Distribution')
axes[0, 0].set_xticklabels(['No Incident (0)', 'Has Incident (1)'], rotation=0)

# Feature distributions
for i, col in enumerate(['avg_health_score', 'avg_education_attendance', 'avg_education_progress']):
    ax = axes[0, 1 + i] if i < 2 else axes[1, 0]
    df[col].hist(bins=15, ax=ax, color='#5B9BD5', edgecolor='white')
    ax.set_title(f'{col}')

# Compare features by incident status
df.boxplot(column='session_count', by='has_incident', ax=axes[1, 1])
axes[1, 1].set_title('Session Count by Incident Status')

df.boxplot(column='length_of_stay', by='has_incident', ax=axes[1, 2])
axes[1, 2].set_title('Length of Stay by Incident Status')

plt.tight_layout()
plt.savefig('exploration_05.png', dpi=80)
plt.show()"""))

cells.append(nbf.v4.new_code_cell("""# Correlation heatmap
fig, ax = plt.subplots(figsize=(10, 8))
corr = df[numeric_features + ['has_incident']].corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', ax=ax)
ax.set_title('Feature Correlation Heatmap')
plt.tight_layout()
plt.savefig('correlation_05.png', dpi=80)
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

# Model definitions with class_weight='balanced' for 73/27 imbalance
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
print(classification_report(y_test, y_pred, target_names=['No Incident', 'Has Incident']))"""))

cells.append(nbf.v4.new_code_cell("""# Confusion matrix and ROC curve
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
ConfusionMatrixDisplay.from_predictions(y_test, y_pred, display_labels=['No Incident', 'Has Incident'], ax=axes[0], cmap='Blues')
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
plt.savefig('evaluation_05.png', dpi=80)
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

**Important caveat:** Correlation does not imply causation. The features identified as predictive of incident risk are associations, not proven causes.

**Risk Factors vs. Confounders:**
- **Initial risk level** may correlate with incidents because higher-risk residents face more challenges, but it could also reflect referral bias (higher-risk referrals get more monitoring, leading to more documented incidents).
- **Length of stay** is ambiguous: longer stays could mean more time for incidents to occur, or could indicate residents who need more support.
- **Session count** could be both a risk factor (residents with more issues get more sessions) and a protective factor (more sessions = better support).

**Potential Confounders:**
- Reporting bias: some safehouses or social workers may document incidents more thoroughly.
- Seasonal effects: incidents may cluster around holidays or transition periods.
- Pre-existing conditions not captured in the available data.

**Actionable Recommendations:**
1. Flag new residents with high initial risk levels for enhanced monitoring in the first 30 days.
2. Use model predictions as one input (not the sole determinant) for resource allocation.
3. Investigate whether increased session frequency can serve as a protective intervention.
4. Standardize incident reporting across safehouses to reduce reporting bias."""))

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
plt.savefig('importance_05.png', dpi=80)
plt.show()"""))

# ============================================================
# Section 7: Deployment
# ============================================================
cells.append(nbf.v4.new_markdown_cell("## Section 7 - Deployment"))

cells.append(nbf.v4.new_code_cell("""import joblib

# Save the best pipeline
model_path = '../models/incident_risk.pkl'
joblib.dump(best_pipeline, model_path)
print(f"Model saved to: {model_path}")

# Document expected input features
print("\\nExpected Input Features:")
print(f"  Numeric: {numeric_features}")
print(f"  Categorical: {categorical_features}")"""))

cells.append(nbf.v4.new_code_cell("""# Example prediction
sample_data = {
    'avg_health_score': [3.1],
    'avg_education_attendance': [0.75],
    'avg_education_progress': [50.0],
    'session_count': [20],
    'avg_session_duration': [60.0],
    'visit_count': [12],
    'length_of_stay': [365],
    'initial_risk_level': ['High'],
    'case_category': ['Surrendered']
}
sample_df = pd.DataFrame(sample_data)

prediction = best_pipeline.predict(sample_df)
proba = best_pipeline.predict_proba(sample_df)

print(f"Sample prediction: {'Has Incident Risk' if prediction[0] == 1 else 'Low Risk'}")
print(f"Probability: No Incident={proba[0][0]:.4f}, Has Incident={proba[0][1]:.4f}")
print(f"\\nFeature columns required: {list(sample_df.columns)}")"""))

nb.cells = cells

# Write notebook
nbf.write(nb, '05-incident-risk-prediction.ipynb')
print("Notebook 05 created successfully.")

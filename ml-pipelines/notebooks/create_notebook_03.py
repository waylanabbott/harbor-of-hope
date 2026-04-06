"""Create Notebook 03: Reintegration Readiness Classifier using nbformat."""
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
cells.append(nbf.v4.new_markdown_cell("""# Notebook 03: Reintegration Readiness Classifier

## Section 1 - Problem Framing

**Business Problem:** Predict which residents are likely to complete reintegration, enabling targeted resource allocation. Harbor of Hope operates multiple safehouses and needs to identify residents who may need additional support early in their stay to improve reintegration outcomes.

**Approach:** Predictive binary classification. The target is whether a resident's reintegration_status is "Completed" versus not completed (In Progress, On Hold, or Not Started).

**Success Metric:** F1 score. The class split is approximately 32% Completed / 68% Not Completed, so F1 is more informative than accuracy for this moderately imbalanced dataset.

**Stakeholders:** Case managers, social workers, safehouse administrators.

**Model Progression:** LogisticRegression (baseline) -> DecisionTree -> RandomForest -> GradientBoosting, selecting the best by cross-validated F1."""))

# ============================================================
# Section 2: Data Acquisition and Preparation
# ============================================================
cells.append(nbf.v4.new_markdown_cell("## Section 2 - Data Acquisition and Preparation"))

cells.append(nbf.v4.new_code_cell("""import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# Load all relevant data
residents = pd.read_csv('../../data/lighthouse_csv_v7/residents.csv')
education = pd.read_csv('../../data/lighthouse_csv_v7/education_records.csv')
health = pd.read_csv('../../data/lighthouse_csv_v7/health_wellbeing_records.csv')
process_rec = pd.read_csv('../../data/lighthouse_csv_v7/process_recordings.csv')
incidents = pd.read_csv('../../data/lighthouse_csv_v7/incident_reports.csv')
visitations = pd.read_csv('../../data/lighthouse_csv_v7/home_visitations.csv')
interventions = pd.read_csv('../../data/lighthouse_csv_v7/intervention_plans.csv')

print(f"Residents: {len(residents)} rows")
print(f"Education records: {len(education)} rows")
print(f"Health records: {len(health)} rows")
print(f"Process recordings: {len(process_rec)} rows")
print(f"Incidents: {len(incidents)} rows")
print(f"Home visitations: {len(visitations)} rows")
print(f"Intervention plans: {len(interventions)} rows")"""))

cells.append(nbf.v4.new_code_cell("""# Aggregate per-resident features

# Education features
edu_agg = education.groupby('resident_id').agg(
    avg_education_progress=('progress_percent', 'mean'),
    avg_attendance=('attendance_rate', 'mean')
).reset_index()

# Health features
health_agg = health.groupby('resident_id').agg(
    avg_health_score=('general_health_score', 'mean')
).reset_index()

# Process recording features
session_agg = process_rec.groupby('resident_id').agg(
    session_count=('recording_id', 'count'),
    positive_session_ratio=('progress_noted', 'mean')
).reset_index()

# Incident features
incident_agg = incidents.groupby('resident_id').agg(
    incident_count=('incident_id', 'count')
).reset_index()

# Home visitation features
visit_agg = visitations.groupby('resident_id').agg(
    visit_count=('visitation_id', 'count')
).reset_index()
# Positive visit ratio
visitations['is_favorable'] = (visitations['visit_outcome'] == 'Favorable').astype(int)
visit_pos = visitations.groupby('resident_id')['is_favorable'].mean().reset_index()
visit_pos.columns = ['resident_id', 'positive_visit_ratio']
visit_agg = visit_agg.merge(visit_pos, on='resident_id', how='left')

# Intervention plan features -- use target_value as proxy for completion metric
interv_agg = interventions.groupby('resident_id').agg(
    intervention_completion=('target_value', 'mean')
).reset_index()

print("Aggregation complete.")
print(f"Edu: {len(edu_agg)}, Health: {len(health_agg)}, Sessions: {len(session_agg)}")
print(f"Incidents: {len(incident_agg)}, Visits: {len(visit_agg)}, Interventions: {len(interv_agg)}")"""))

cells.append(nbf.v4.new_code_cell("""# Merge all features with residents
df = residents[['resident_id', 'initial_risk_level', 'case_category', 'reintegration_status']].copy()

df = df.merge(edu_agg, on='resident_id', how='left')
df = df.merge(health_agg, on='resident_id', how='left')
df = df.merge(session_agg, on='resident_id', how='left')
df = df.merge(incident_agg, on='resident_id', how='left')
df = df.merge(visit_agg, on='resident_id', how='left')
df = df.merge(interv_agg, on='resident_id', how='left')

# Fill NaN for residents without incidents (no incident = 0 incidents)
df['incident_count'] = df['incident_count'].fillna(0)

# Fill other NaN with column medians
for col in ['avg_education_progress', 'avg_attendance', 'avg_health_score',
            'session_count', 'positive_session_ratio', 'visit_count',
            'positive_visit_ratio', 'intervention_completion']:
    df[col] = df[col].fillna(df[col].median())

# Binary target
df['target'] = (df['reintegration_status'] == 'Completed').astype(int)

print(f"Final dataset shape: {df.shape}")
print(f"\\nTarget distribution:")
print(df['target'].value_counts())
print(f"Completion rate: {df['target'].mean():.2%}")
df.head()"""))

cells.append(nbf.v4.new_code_cell("""from sklearn.model_selection import train_test_split

numeric_features = ['avg_education_progress', 'avg_attendance', 'avg_health_score',
                    'session_count', 'positive_session_ratio', 'incident_count',
                    'visit_count', 'positive_visit_ratio', 'intervention_completion']
categorical_features = ['initial_risk_level', 'case_category']

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
axes[0, 0].set_title('Reintegration Completion')
axes[0, 0].set_xticklabels(['Not Completed (0)', 'Completed (1)'], rotation=0)

# Feature distributions
for i, col in enumerate(['avg_education_progress', 'avg_attendance', 'avg_health_score']):
    ax = axes[0, 1 + i] if i < 2 else axes[1, 0]
    df[col].hist(bins=15, ax=ax, color='#5B9BD5', edgecolor='white')
    ax.set_title(f'{col}')

# Session count by target
df.boxplot(column='session_count', by='target', ax=axes[1, 1])
axes[1, 1].set_title('Session Count by Completion')

# Incident count by target
df.boxplot(column='incident_count', by='target', ax=axes[1, 2])
axes[1, 2].set_title('Incident Count by Completion')

plt.tight_layout()
plt.savefig('exploration_03.png', dpi=80)
plt.show()"""))

cells.append(nbf.v4.new_code_cell("""# Correlation heatmap
fig, ax = plt.subplots(figsize=(10, 8))
corr = df[numeric_features + ['target']].corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', ax=ax)
ax.set_title('Feature Correlation Heatmap')
plt.tight_layout()
plt.savefig('correlation_03.png', dpi=80)
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

# Model definitions -- all with class_weight='balanced' for 32/68 imbalance
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
plt.savefig('evaluation_03.png', dpi=80)
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

**Important caveat:** Correlation does not imply causation. The features identified as important by the model are *predictive* of reintegration completion, but they may not be *causes* of successful reintegration.

**Potential Confounders:**
- **Selection bias:** Residents with higher initial risk levels may receive more intensive services, confounding the relationship between service utilization and outcomes.
- **Case category effects:** Different case categories (Surrendered, Abandoned, Foundling, Neglected) have different baseline probabilities of successful reintegration due to underlying family dynamics.
- **External factors:** Family cooperation, community resources, and economic conditions are not captured in this dataset but strongly influence reintegration success.

**Key Predictor Interpretation:**
- High attendance and education progress may indicate engagement, which correlates with readiness.
- Session count alone does not capture quality of therapeutic engagement.
- Incident count may reflect behavioral challenges but also better monitoring.

**Actionable Recommendations:**
1. Use model predictions to flag residents who may need additional support early in their stay.
2. Focus on improving attendance and education engagement as these are modifiable factors.
3. Consider additional data collection on family engagement and community support."""))

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
plt.savefig('importance_03.png', dpi=80)
plt.show()"""))

# ============================================================
# Section 7: Deployment
# ============================================================
cells.append(nbf.v4.new_markdown_cell("## Section 7 - Deployment"))

cells.append(nbf.v4.new_code_cell("""import joblib

# Save the best pipeline
model_path = '../models/reintegration.pkl'
joblib.dump(best_pipeline, model_path)
print(f"Model saved to: {model_path}")

# Document expected input features
print("\\nExpected Input Features:")
print(f"  Numeric: {numeric_features}")
print(f"  Categorical: {categorical_features}")"""))

cells.append(nbf.v4.new_code_cell("""# Example prediction
sample_data = {
    'avg_education_progress': [55.0],
    'avg_attendance': [0.80],
    'avg_health_score': [3.2],
    'session_count': [15],
    'positive_session_ratio': [0.7],
    'incident_count': [2],
    'visit_count': [10],
    'positive_visit_ratio': [0.6],
    'intervention_completion': [3.5],
    'initial_risk_level': ['Medium'],
    'case_category': ['Surrendered']
}
sample_df = pd.DataFrame(sample_data)

prediction = best_pipeline.predict(sample_df)
proba = best_pipeline.predict_proba(sample_df)

print(f"Sample prediction: {'Completed' if prediction[0] == 1 else 'Not Completed'}")
print(f"Probability: Not Completed={proba[0][0]:.4f}, Completed={proba[0][1]:.4f}")
print(f"\\nFeature columns required: {list(sample_df.columns)}")"""))

nb.cells = cells

# Write notebook
nbf.write(nb, '03-reintegration-readiness.ipynb')
print("Notebook 03 created successfully.")

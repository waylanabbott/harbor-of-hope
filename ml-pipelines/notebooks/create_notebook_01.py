"""Create Notebook 01: Donor Churn Classifier using nbformat."""
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
cells.append(nbf.v4.new_markdown_cell("""# Notebook 01: Donor Churn Classifier

## Section 1 - Problem Framing

**Business Problem:** Identify at-risk donors before they lapse to enable targeted retention campaigns. Harbor of Hope relies on recurring monetary donations to fund safehouse operations, and losing donors without early warning reduces the organization's ability to plan long-term programs.

**Approach:** Predictive binary classification. We label supporters as "churned" if they have not made a monetary donation in the last 90 days and "retained" otherwise.

**Success Metric:** F1 score -- this balances precision (not wasting outreach on retained donors) and recall (not missing truly at-risk donors). Given the moderate class imbalance in churn datasets, F1 is more informative than accuracy.

**Stakeholders:** Fundraising team, case managers, executive leadership.

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
supporters = pd.read_csv('../../data/lighthouse_csv_v7/supporters.csv')
donations = pd.read_csv('../../data/lighthouse_csv_v7/donations.csv')

print(f"Supporters: {len(supporters)} rows")
print(f"Donations: {len(donations)} rows")
print(f"Donation types: {donations['donation_type'].value_counts().to_dict()}")"""))

cells.append(nbf.v4.new_code_cell("""# Filter to monetary donations only
monetary = donations[donations['donation_type'] == 'Monetary'].copy()
monetary['donation_date'] = pd.to_datetime(monetary['donation_date'])
print(f"Monetary donations: {len(monetary)} rows")

# Reference date for recency calculation
reference_date = monetary['donation_date'].max()
print(f"Reference date (latest donation): {reference_date}")"""))

cells.append(nbf.v4.new_code_cell("""# Engineer RFM features per supporter
rfm = monetary.groupby('supporter_id').agg(
    recency=('donation_date', lambda x: (reference_date - x.max()).days),
    frequency=('donation_id', 'count'),
    monetary_total=('amount', 'sum'),
    monetary_avg=('amount', 'mean'),
    monetary_std=('amount', 'std'),
    first_donation=('donation_date', 'min')
).reset_index()

# Fill NaN std (single donation supporters)
rfm['monetary_std'] = rfm['monetary_std'].fillna(0)

# Tenure: days from first donation to reference date
rfm['tenure_days'] = (reference_date - rfm['first_donation']).dt.days
rfm.drop(columns=['first_donation'], inplace=True)

print(f"RFM features for {len(rfm)} supporters")
rfm.head()"""))

cells.append(nbf.v4.new_code_cell("""# Merge with supporter demographics
df = rfm.merge(supporters[['supporter_id', 'supporter_type', 'acquisition_channel', 'status', 'region']],
               on='supporter_id', how='left')

# Create binary target: churned if no donation in last 90 days
df['churned'] = (df['recency'] > 90).astype(int)

print(f"Dataset shape: {df.shape}")
print(f"\\nTarget distribution:")
print(df['churned'].value_counts())
print(f"\\nChurn rate: {df['churned'].mean():.2%}")
df.head()"""))

cells.append(nbf.v4.new_code_cell("""from sklearn.model_selection import train_test_split

# Define features
numeric_features = ['recency', 'frequency', 'monetary_total', 'monetary_avg', 'monetary_std', 'tenure_days']
categorical_features = ['supporter_type', 'acquisition_channel', 'region']

X = df[numeric_features + categorical_features]
y = df['churned']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
print(f"Train: {len(X_train)}, Test: {len(X_test)}")
print(f"Train churn rate: {y_train.mean():.2%}")
print(f"Test churn rate: {y_test.mean():.2%}")"""))

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
df['churned'].value_counts().plot(kind='bar', ax=axes[0, 0], color=['#4CAF50', '#E8735A'])
axes[0, 0].set_title('Churn Distribution')
axes[0, 0].set_xticklabels(['Retained (0)', 'Churned (1)'], rotation=0)

# RFM distributions
for i, col in enumerate(['recency', 'frequency', 'monetary_total']):
    ax = axes[0, 1] if i == 0 else axes[0, 2] if i == 1 else axes[1, 0]
    df[col].hist(bins=15, ax=ax, color='#5B9BD5', edgecolor='white')
    ax.set_title(f'{col} Distribution')

# Box plots by churn
df.boxplot(column='monetary_total', by='churned', ax=axes[1, 1])
axes[1, 1].set_title('Monetary Total by Churn Status')

df.boxplot(column='recency', by='churned', ax=axes[1, 2])
axes[1, 2].set_title('Recency by Churn Status')

plt.tight_layout()
plt.savefig('exploration_01.png', dpi=80)
plt.show()
print("Class balance:")
print(df['churned'].value_counts())"""))

cells.append(nbf.v4.new_code_cell("""# Correlation heatmap of numeric features
fig, ax = plt.subplots(figsize=(8, 6))
corr = df[numeric_features + ['churned']].corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', ax=ax)
ax.set_title('Feature Correlation Heatmap')
plt.tight_layout()
plt.savefig('correlation_01.png', dpi=80)
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

# Model definitions
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

# Fit best model on full training set
best_pipeline.fit(X_train, y_train)
print("Best model fitted on training set.")"""))

# ============================================================
# Section 5: Evaluation
# ============================================================
cells.append(nbf.v4.new_markdown_cell("## Section 5 - Evaluation"))

cells.append(nbf.v4.new_code_cell("""from sklearn.metrics import classification_report, ConfusionMatrixDisplay, roc_auc_score, roc_curve

# Classification report on test set
y_pred = best_pipeline.predict(X_test)
y_proba = best_pipeline.predict_proba(X_test)[:, 1]

print(f"Classification Report ({best_name}):")
print(classification_report(y_test, y_pred, target_names=['Retained', 'Churned']))"""))

cells.append(nbf.v4.new_code_cell("""# Confusion matrix
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
ConfusionMatrixDisplay.from_predictions(y_test, y_pred, display_labels=['Retained', 'Churned'], ax=axes[0], cmap='Blues')
axes[0].set_title(f'Confusion Matrix ({best_name})')

# ROC curve
auc_score = roc_auc_score(y_test, y_proba)
fpr, tpr, _ = roc_curve(y_test, y_proba)
axes[1].plot(fpr, tpr, label=f'AUC = {auc_score:.4f}', color='#E8735A', linewidth=2)
axes[1].plot([0, 1], [0, 1], 'k--', alpha=0.5)
axes[1].set_xlabel('False Positive Rate')
axes[1].set_ylabel('True Positive Rate')
axes[1].set_title('ROC Curve')
axes[1].legend()
plt.tight_layout()
plt.savefig('evaluation_01.png', dpi=80)
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

**Important caveat:** The features identified as important by the model are *predictive* of churn, but correlation does not imply causation. For example:
- **Recency** is mechanically correlated with the churn label (since churn is defined by recency > 90 days). This is a definitional relationship, not a causal one.
- **Tenure** may reflect loyalty, but long-tenure donors who churn could be responding to external factors (economic downturn, life changes) rather than organizational issues.
- **Seasonal giving patterns** could confound the model -- donors who only give during holidays may appear churned mid-year.

**Potential Confounders:** Economic conditions, seasonal giving patterns, life events, competing charity appeals, donor fatigue.

**Actionable Recommendations:**
1. Target high-recency donors (60-90 days since last donation) with personalized outreach before they cross the churn threshold.
2. Segment donors by acquisition channel and tailor retention strategies.
3. Monitor frequency trends to identify declining engagement early."""))

cells.append(nbf.v4.new_code_cell("""# Feature importance (permutation importance on the full pipeline permutes input columns)
from sklearn.inspection import permutation_importance

perm_imp = permutation_importance(best_pipeline, X_test, y_test, n_repeats=10, random_state=42, scoring='f1')

# permutation_importance on a pipeline permutes input columns, not preprocessed features
feature_names = list(X_test.columns)

# Create importance DataFrame
imp_df = pd.DataFrame({
    'Feature': feature_names,
    'Importance': perm_imp.importances_mean
}).sort_values('Importance', ascending=True)

fig, ax = plt.subplots(figsize=(10, 6))
ax.barh(imp_df['Feature'], imp_df['Importance'], color='#5B9BD5')
ax.set_title(f'Feature Importance (Permutation) - {best_name}')
ax.set_xlabel('Mean F1 Decrease')
plt.tight_layout()
plt.savefig('importance_01.png', dpi=80)
plt.show()"""))

# ============================================================
# Section 7: Deployment
# ============================================================
cells.append(nbf.v4.new_markdown_cell("## Section 7 - Deployment"))

cells.append(nbf.v4.new_code_cell("""import joblib

# Save the best pipeline
model_path = '../models/donor_churn.pkl'
joblib.dump(best_pipeline, model_path)
print(f"Model saved to: {model_path}")

# Document expected input features
print("\\nExpected Input Features:")
print(f"  Numeric: {numeric_features}")
print(f"  Categorical: {categorical_features}")"""))

cells.append(nbf.v4.new_code_cell("""# Example prediction
sample_data = {
    'recency': [30],
    'frequency': [5],
    'monetary_total': [2500.0],
    'monetary_avg': [500.0],
    'monetary_std': [100.0],
    'tenure_days': [365],
    'supporter_type': ['MonetaryDonor'],
    'acquisition_channel': ['SocialMedia'],
    'region': ['Luzon']
}
sample_df = pd.DataFrame(sample_data)

prediction = best_pipeline.predict(sample_df)
proba = best_pipeline.predict_proba(sample_df)

print(f"Sample prediction: {'Churned' if prediction[0] == 1 else 'Retained'}")
print(f"Probability: Retained={proba[0][0]:.4f}, Churned={proba[0][1]:.4f}")

# Feature names the model expects
print(f"\\nFeature columns required: {list(sample_df.columns)}")"""))

nb.cells = cells

# Write notebook
nbf.write(nb, '01-donor-churn-classifier.ipynb')
print("Notebook 01 created successfully.")

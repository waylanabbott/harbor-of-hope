# Phase 4: ML Pipelines + Flask API - Research

**Researched:** 2026-04-06
**Domain:** Machine learning pipelines (scikit-learn), Jupyter notebooks, Flask API serving
**Confidence:** HIGH

## Summary

Phase 4 requires building 8 ML pipelines as fully executable Jupyter notebooks, saving trained models with joblib, and serving them via a Flask REST API that the .NET backend calls. The data is small (60 supporters, 420 donations, 812 social media posts, 60 residents, 2,819 process recordings, etc.) which means all classical ML approaches will work well and training will be fast (seconds, not minutes).

The 8 pipelines split into 4 predictive (classification/regression) and 4 explanatory (OLS regression with coefficient interpretation). Each notebook follows a mandatory 7-section structure: Problem Framing, Data Acquisition & Preparation, Exploration, Modeling, Evaluation, Causal Analysis, Deployment. Predictive models must show Logistic Regression baseline -> Decision Tree -> Random Forest/GBM progression. Explanatory models use OLS with assumption checking (linearity, normality, homoscedasticity, VIF).

The Flask API is straightforward: load 8 joblib models at startup, expose prediction endpoints, add a health check. The .NET backend calls Flask via HttpClient. All ML libraries except Flask and Jupyter are already installed on the system (scikit-learn 1.8.0, pandas 2.2.3, numpy 2.4.2, matplotlib 3.10.1, seaborn 0.13.2, statsmodels 0.14.6, joblib 1.5.3).

**Primary recommendation:** Build notebooks as pure Python scripts first (for Claude execution), then convert to .ipynb format. Use scikit-learn Pipeline objects to bundle preprocessing + model for clean joblib serialization. Flask API uses a single `/predict/<model_name>` pattern with model-specific input validation.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ML-01 | Donor Churn Prediction pipeline (predictive) | Supporters (60 rows) + donations (420 rows) provide RFM features; target = churned (no donation in 90 days); LogReg -> DTree -> RF/GBM |
| ML-02 | Social Media Post Effectiveness pipeline (explanatory) | Social media posts (812 rows) with 39 columns including engagement metrics and donation_referrals; OLS on post factors -> donation referrals |
| ML-03 | Resident Reintegration Readiness pipeline (predictive) | Residents (60) joined with education (534), health (534), process recordings (2819), incidents (100), visitations (1337); target = reintegration_status == "Completed" |
| ML-04 | Counseling Session Effectiveness pipeline (explanatory) | Process recordings (2819 rows) with emotional_state_observed/end and interventions_applied; OLS on session factors -> emotional improvement score |
| ML-05 | Incident Risk Prediction pipeline (predictive) | 44 unique residents have incidents out of 60 total; features from health, education, visitation, session history; binary classification |
| ML-06 | Education Outcome Prediction pipeline (predictive) | Education records (534 rows) with attendance_rate and progress_percent; target = completion_status or progress_percent; features from attendance, health, sessions |
| ML-07 | Donation Forecasting pipeline (predictive) | Donations (420 rows) with dates and amounts; time series or regression approach; forecast monthly donation totals |
| ML-08 | Safehouse Capacity/Outcomes pipeline (explanatory) | Safehouse monthly metrics (450 rows) with avg_education_progress, avg_health_score, incident_count; OLS on safehouse factors -> outcome metrics |
| ML-09 | All notebooks fully executable top-to-bottom in Jupyter | Notebooks must use .ipynb format, reference CSV files with relative paths, include all imports, produce all outputs inline |
| ML-10 | ML models served via Flask API endpoints called from .NET backend | Flask app loads 8 joblib models, exposes REST endpoints, .NET backend calls via HttpClient with typed DTOs |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| scikit-learn | 1.8.0 | ML model training and inference | Already installed. Supports LogReg, DecisionTree, RandomForest, GradientBoosting. Note: `penalty` param on LogisticRegression deprecated in 1.8, use `solver` defaults |
| pandas | 2.2.3 | Data loading, feature engineering, manipulation | Already installed. Read CSVs, merge tables, create features |
| numpy | 2.4.2 | Numerical operations | Already installed. Required by scikit-learn |
| matplotlib | 3.10.1 | Visualization in notebooks | Already installed. Confusion matrices, feature importance, residual plots |
| seaborn | 0.13.2 | Statistical visualizations | Already installed. Heatmaps, distribution plots, pair plots |
| statsmodels | 0.14.6 | OLS regression with diagnostics | Already installed. Required for explanatory models: OLS, VIF, assumption tests |
| joblib | 1.5.3 | Model serialization | Already installed. Save/load sklearn Pipeline objects as .pkl files |
| Flask | 3.1.3 | ML API web framework | NOT installed -- must install. Serves prediction endpoints |
| flask-cors | 6.0.2 | CORS for Flask API | NOT installed -- must install. Note: v6.x not v4.x as in STACK.md |
| gunicorn | 25.3.0 | Production WSGI server | NOT installed -- must install. For Azure deployment |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jupyter / notebook | latest | Notebook execution and format | NOT installed -- must install for .ipynb creation and validation |
| nbformat | latest | Programmatic .ipynb creation | Convert Python scripts to notebook format programmatically |
| scipy | (comes with sklearn) | Statistical tests | Shapiro-Wilk for normality, other assumption tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Flask | FastAPI | FastAPI has auto-generated OpenAPI docs but adds async complexity not needed for sync sklearn predict calls. Course specifies Flask. |
| statsmodels OLS | sklearn LinearRegression | sklearn LR has no p-values, no VIF, no assumption diagnostics. statsmodels is required for explanatory models. |
| joblib | pickle | joblib is optimized for large numpy arrays inside sklearn estimators. Use joblib. |

**Installation:**
```bash
pip3 install flask flask-cors gunicorn jupyter notebook nbformat
```

## Architecture Patterns

### Recommended Project Structure
```
ml-pipelines/
  notebooks/
    01-donor-churn-classifier.ipynb
    02-social-media-effectiveness.ipynb
    03-reintegration-readiness.ipynb
    04-counseling-effectiveness.ipynb
    05-incident-risk-prediction.ipynb
    06-education-outcome-prediction.ipynb
    07-donation-forecasting.ipynb
    08-safehouse-capacity-outcomes.ipynb
  models/                              # Saved joblib models
    donor_churn.pkl
    social_media.pkl
    reintegration.pkl
    counseling.pkl
    incident_risk.pkl
    education_outcome.pkl
    donation_forecast.pkl
    safehouse_outcomes.pkl
  flask_api/
    app.py                             # Flask application
    requirements.txt                   # Python dependencies for deployment
  data -> ../data/lighthouse_csv_v7/   # Symlink or relative path reference
```

### Pattern 1: Notebook 7-Section Structure (Mandatory)
**What:** Every notebook must follow the exact 7-section structure from the course spec.
**When to use:** All 8 notebooks.
**Structure:**
```python
# Section 1: Problem Framing
# - Business problem statement
# - Predictive vs explanatory approach declaration
# - Success metric definition
# - Stakeholder identification

# Section 2: Data Acquisition & Preparation
# - Load CSVs with pd.read_csv
# - Join relevant tables
# - Feature engineering
# - Handle missing values
# - Encode categoricals
# - Train/test split

# Section 3: Exploration (EDA)
# - Distribution plots
# - Correlation heatmaps
# - Feature-target relationships
# - Key statistical summaries

# Section 4: Modeling
# - PREDICTIVE: LogReg baseline -> DecisionTree -> RF/GBM, cross-validation
# - EXPLANATORY: OLS regression, check assumptions (linearity, normality, homoscedasticity, VIF)

# Section 5: Evaluation
# - PREDICTIVE: Accuracy, Precision, Recall, F1, AUC-ROC, Confusion Matrix
# - EXPLANATORY: R-squared, Adj R-squared, RMSE, residual plots, coefficient table

# Section 6: Causal Analysis
# - Feature importance / coefficient interpretation
# - Correlation != causation discussion
# - Confounders discussion
# - Actionable business recommendations

# Section 7: Deployment
# - Save model with joblib
# - Document Flask API endpoint
# - Show example API call and response
```

### Pattern 2: Predictive Pipeline Template
**What:** Standard approach for the 4 predictive models (ML-01, ML-03, ML-05, ML-06)
**Example:**
```python
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib

# Feature/target split
X = df[feature_cols]
y = df[target_col]

# Preprocessing pipeline
numeric_features = [...]
categorical_features = [...]
preprocessor = ColumnTransformer(transformers=[
    ('num', StandardScaler(), numeric_features),
    ('cat', OneHotEncoder(drop='first', handle_unknown='ignore'), categorical_features)
])

# Train/test split (stratified for classification)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Model progression: baseline -> interpretable -> best performance
models = {
    'Logistic Regression': Pipeline([('preprocessor', preprocessor),
                                     ('classifier', LogisticRegression(max_iter=1000, random_state=42))]),
    'Decision Tree': Pipeline([('preprocessor', preprocessor),
                               ('classifier', DecisionTreeClassifier(random_state=42))]),
    'Random Forest': Pipeline([('preprocessor', preprocessor),
                               ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))]),
    'Gradient Boosting': Pipeline([('preprocessor', preprocessor),
                                   ('classifier', GradientBoostingClassifier(n_estimators=100, random_state=42))]),
}

# Cross-validate all, pick best, evaluate on test set
for name, model in models.items():
    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1')
    print(f"{name}: CV F1 = {scores.mean():.3f} +/- {scores.std():.3f}")

# Train best model on full training set, evaluate on test
best_model = models['Random Forest']  # or whichever is best
best_model.fit(X_train, y_train)
y_pred = best_model.predict(X_test)

# Save entire pipeline (preprocessor + model) as single .pkl
joblib.dump(best_model, 'models/model_name.pkl')
```

### Pattern 3: Explanatory Pipeline Template (OLS)
**What:** Standard approach for the 4 explanatory models (ML-02, ML-04, ML-08)
**Example:**
```python
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
import pandas as pd
import numpy as np

# Prepare features (one-hot encode categoricals manually for statsmodels)
X = pd.get_dummies(df[feature_cols], drop_first=True)
X = sm.add_constant(X)  # Add intercept
y = df[target_col]

# Fit OLS
model = sm.OLS(y, X).fit()
print(model.summary())

# Check assumptions
# 1. VIF for multicollinearity
vif_data = pd.DataFrame({
    'Feature': X.columns[1:],  # skip constant
    'VIF': [variance_inflation_factor(X.values, i) for i in range(1, X.shape[1])]
})
print(vif_data.sort_values('VIF', ascending=False))

# 2. Residual normality (Shapiro-Wilk)
from scipy.stats import shapiro
stat, p = shapiro(model.resid)
print(f"Shapiro-Wilk: stat={stat:.4f}, p={p:.4f}")

# 3. Homoscedasticity (Breusch-Pagan)
from statsmodels.stats.diagnostic import het_breuschpagan
bp_stat, bp_p, _, _ = het_breuschpagan(model.resid, model.model.exog)
print(f"Breusch-Pagan: stat={bp_stat:.4f}, p={bp_p:.4f}")

# For deployment: save sklearn pipeline version for predictions
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline as SkPipeline
sklearn_model = SkPipeline([
    ('preprocessor', preprocessor),
    ('regressor', LinearRegression())
])
sklearn_model.fit(X_train_raw, y_train)
joblib.dump(sklearn_model, 'models/model_name.pkl')
```

### Pattern 4: Flask API with Model Loading
**What:** Single Flask app serving all 8 models
**Example:**
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # Configure origins for production

# Load all models at startup
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
models = {}
model_files = {
    'donor-churn': 'donor_churn.pkl',
    'social-media': 'social_media.pkl',
    'reintegration': 'reintegration.pkl',
    'counseling': 'counseling.pkl',
    'incident-risk': 'incident_risk.pkl',
    'education-outcome': 'education_outcome.pkl',
    'donation-forecast': 'donation_forecast.pkl',
    'safehouse-outcomes': 'safehouse_outcomes.pkl',
}

for name, filename in model_files.items():
    path = os.path.join(MODEL_DIR, filename)
    if os.path.exists(path):
        models[name] = joblib.load(path)
        print(f"Loaded model: {name}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'models_loaded': list(models.keys())
    })

@app.route('/predict/<model_name>', methods=['POST'])
def predict(model_name):
    if model_name not in models:
        return jsonify({'error': f'Model {model_name} not found'}), 404
    try:
        data = request.get_json()
        df = pd.DataFrame([data['features']])
        model = models[model_name]
        prediction = model.predict(df)
        result = {'prediction': prediction.tolist()}
        # Add probabilities for classifiers
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(df)
            result['probabilities'] = proba.tolist()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5050, debug=True)
```

### Pattern 5: .NET HttpClient Integration
**What:** .NET backend calling Flask API for predictions
**Example:**
```csharp
// In Program.cs -- register named HttpClient
builder.Services.AddHttpClient("MlApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["MlApiUrl"] ?? "http://localhost:5050");
    client.Timeout = TimeSpan.FromSeconds(10);
});

// In Controller or Service
public class MlPredictionService(IHttpClientFactory httpClientFactory)
{
    private readonly HttpClient _client = httpClientFactory.CreateClient("MlApi");

    public async Task<ChurnPrediction?> PredictChurnAsync(DonorFeatures features)
    {
        var response = await _client.PostAsJsonAsync("/predict/donor-churn",
            new { features });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<ChurnPrediction>();
    }
}
```

### Anti-Patterns to Avoid
- **Training in Flask:** Never train models inside the Flask app. Train in notebooks, save with joblib, load in Flask.
- **Raw pickle instead of joblib:** joblib handles numpy arrays more efficiently and is the sklearn standard.
- **Separate preprocessor and model serialization:** Always save the entire sklearn Pipeline (preprocessor + model) as a single .pkl file. This avoids preprocessing drift between training and inference.
- **Hardcoded file paths in notebooks:** Use `os.path.join(os.path.dirname(__file__), '..', 'data', ...)` or relative paths from the notebook's location.
- **Not using stratified splits:** For classification with imbalanced classes (especially churn), always use `stratify=y` in `train_test_split`.
- **Forgetting to set random_state:** All models and splits must use `random_state=42` for reproducibility.
- **Ignoring OLS assumptions for explanatory models:** The whole point of explanatory models is coefficient interpretation. If assumptions are violated, coefficients are unreliable. Always check VIF, residual normality, and homoscedasticity.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Feature preprocessing | Custom scaling/encoding functions | sklearn ColumnTransformer + Pipeline | Handles train/test transform consistently, saves with model |
| OLS with diagnostics | Manual matrix math | statsmodels OLS + diagnostic tests | Built-in summary(), VIF, Breusch-Pagan, Shapiro-Wilk |
| Confusion matrix display | Manual matplotlib grid | sklearn ConfusionMatrixDisplay | One-liner, properly formatted |
| Cross-validation | Manual fold splitting | sklearn cross_val_score / cross_validate | Handles stratification, multiple metrics |
| Feature importance plot | Manual bar charts | sklearn permutation_importance or model.feature_importances_ | Standardized, handles pipeline objects |
| Model comparison table | Manual dict building | pandas DataFrame from cv results | Clean tabular comparison |
| Notebook creation | Manual JSON construction | nbformat.v4.new_notebook() | Handles cell metadata, kernel spec correctly |

## Common Pitfalls

### Pitfall 1: Small Dataset Overfitting
**What goes wrong:** With only 60 supporters/residents, tree-based models perfectly memorize training data.
**Why it happens:** Decision trees and random forests can easily overfit 60 rows.
**How to avoid:** Use cross-validation (CV=5 minimum, consider leave-one-out for 60-row datasets). Limit max_depth on trees. Report CV scores, not just training scores. Be transparent about dataset size limitations in the notebook.
**Warning signs:** 100% training accuracy with significantly lower test accuracy.

### Pitfall 2: Target Leakage in Feature Engineering
**What goes wrong:** Using future data to predict past outcomes (e.g., using total_donations to predict churn when total_donations includes post-churn period).
**Why it happens:** Features computed from the full dataset inadvertently include target information.
**How to avoid:** For churn: compute features only from data BEFORE the churn observation window. For reintegration: use only features available at the time of prediction.
**Warning signs:** Suspiciously high accuracy (>95%) on small datasets.

### Pitfall 3: Imbalanced Classes
**What goes wrong:** Model predicts majority class for everything, gets high accuracy but useless predictions.
**Why it happens:** Donors: 45 active vs 15 inactive. Residents: 19 completed reintegration vs 41 not.
**How to avoid:** Use stratified splits, report F1/recall/precision (not just accuracy), consider class_weight='balanced' on classifiers, use AUC-ROC as primary metric.
**Warning signs:** High accuracy but near-zero recall on minority class.

### Pitfall 4: Multicollinearity in OLS Models
**What goes wrong:** Coefficients become unstable and uninterpretable.
**Why it happens:** Correlated features (e.g., impressions, reach, likes are all correlated in social media data).
**How to avoid:** Check VIF before interpreting coefficients. Drop or combine features with VIF > 10. Use domain knowledge to select non-redundant features.
**Warning signs:** Large coefficient standard errors, sign changes when features are added/removed.

### Pitfall 5: Notebook Not Executable Top-to-Bottom
**What goes wrong:** Notebook works when cells are run in a custom order but fails when run sequentially.
**Why it happens:** Cells depend on variables defined in out-of-order execution during development.
**How to avoid:** After building, do "Restart Kernel & Run All" (or use nbconvert --execute). Every cell must work in sequence.
**Warning signs:** NameError or undefined variable errors when running fresh.

### Pitfall 6: scikit-learn 1.8 LogisticRegression Deprecation
**What goes wrong:** Deprecation warnings about `penalty` parameter.
**Why it happens:** In sklearn 1.8.0, `penalty` on LogisticRegression is deprecated.
**How to avoid:** Use default parameters or explicitly set `penalty=None` if no regularization is desired. For regularized logistic regression, the default solver handles it automatically.
**Warning signs:** FutureWarning about penalty parameter.

### Pitfall 7: Interventions Column Has Comma-Separated Values
**What goes wrong:** Treating interventions_applied as a single categorical feature loses multi-intervention information.
**Why it happens:** The column contains values like "Caring, Teaching, Legal Services" -- multiple interventions per session.
**How to avoid:** Split and one-hot encode each intervention separately: `df['has_Caring'] = df['interventions_applied'].str.contains('Caring')`.
**Warning signs:** Hundreds of unique "categories" when the real unique interventions are only 4 (Caring, Teaching, Legal Services, Healing).

### Pitfall 8: Emotional State Encoding for Pipeline 4
**What goes wrong:** Treating emotional states as purely nominal loses the ordinal information.
**Why it happens:** The spec explicitly defines an ordinal encoding: Distressed=1, Withdrawn=2, Angry=3, Anxious=4, Sad=5, Calm=6, Hopeful=7, Happy=8.
**How to avoid:** Use the spec's ordinal encoding exactly. Target = end_score - start_score. Positive = improvement.
**Warning signs:** Using one-hot encoding for emotional states in the explanatory model.

## Code Examples

### Donor Churn Feature Engineering
```python
import pandas as pd
import numpy as np

supporters = pd.read_csv('../data/lighthouse_csv_v7/supporters.csv')
donations = pd.read_csv('../data/lighthouse_csv_v7/donations.csv')

# Only monetary donations with amounts
monetary = donations[donations['donation_type'] == 'Monetary'].copy()
monetary['donation_date'] = pd.to_datetime(monetary['donation_date'])

# Reference date for recency calculations
reference_date = monetary['donation_date'].max()

# RFM features per supporter
rfm = monetary.groupby('supporter_id').agg(
    recency=('donation_date', lambda x: (reference_date - x.max()).days),
    frequency=('donation_id', 'count'),
    monetary_total=('amount', 'sum'),
    monetary_avg=('amount', 'mean'),
    monetary_std=('amount', 'std'),
    first_donation=('donation_date', 'min'),
    last_donation=('donation_date', 'max'),
).reset_index()

rfm['tenure_days'] = (reference_date - rfm['first_donation']).dt.days
rfm['monetary_std'] = rfm['monetary_std'].fillna(0)

# Add supporter demographics
df = rfm.merge(supporters[['supporter_id', 'supporter_type', 'acquisition_channel',
                            'status', 'region']], on='supporter_id')

# Target: churned = no donation in last 90 days
df['churned'] = (df['recency'] > 90).astype(int)
```

### Social Media OLS Setup
```python
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor

smp = pd.read_csv('../data/lighthouse_csv_v7/social_media_posts.csv')

# Feature selection for OLS
features = pd.get_dummies(smp[['platform', 'post_type', 'media_type', 'day_of_week',
                                'has_call_to_action', 'content_topic', 'sentiment_tone',
                                'features_resident_story', 'is_boosted', 'num_hashtags',
                                'caption_length', 'post_hour', 'follower_count_at_post']],
                          drop_first=True)
features = sm.add_constant(features)
target = smp['donation_referrals']

model = sm.OLS(target, features).fit()
print(model.summary())

# Check multicollinearity
vif = pd.DataFrame({
    'Feature': features.columns[1:],
    'VIF': [variance_inflation_factor(features.values, i) for i in range(1, features.shape[1])]
}).sort_values('VIF', ascending=False)
print(vif.head(10))
```

### Emotional State Encoding (Pipeline 4)
```python
# Per the course spec, encode emotional states ordinally
emotion_map = {
    'Distressed': 1, 'Withdrawn': 2, 'Angry': 3, 'Anxious': 4,
    'Sad': 5, 'Calm': 6, 'Hopeful': 7, 'Happy': 8
}

pr = pd.read_csv('../data/lighthouse_csv_v7/process_recordings.csv')
pr['start_score'] = pr['emotional_state_observed'].map(emotion_map)
pr['end_score'] = pr['emotional_state_end'].map(emotion_map)
pr['emotional_improvement'] = pr['end_score'] - pr['start_score']

# Target for OLS: emotional_improvement
# This is the dependent variable
```

### Notebook Creation with nbformat
```python
import nbformat as nbf
import json

def create_notebook(cells_content, notebook_path):
    """Create a .ipynb file from a list of (cell_type, source) tuples."""
    nb = nbf.v4.new_notebook()
    nb.metadata['kernelspec'] = {
        'display_name': 'Python 3',
        'language': 'python',
        'name': 'python3'
    }
    for cell_type, source in cells_content:
        if cell_type == 'markdown':
            nb.cells.append(nbf.v4.new_markdown_cell(source))
        elif cell_type == 'code':
            nb.cells.append(nbf.v4.new_code_cell(source))
    with open(notebook_path, 'w') as f:
        nbf.write(nb, f)
```

## Data Profile Summary

Critical data characteristics that affect ML pipeline design:

| Dataset | Rows | Key Features | Target Variable | Notes |
|---------|------|-------------|-----------------|-------|
| Supporters + Donations | 60 + 420 | RFM features, supporter type, acquisition channel | churned (binary) | Very small dataset (60 supporters). Use CV, regularization |
| Social Media Posts | 812 | 39 columns: platform, type, engagement metrics | donation_referrals (continuous) | Good size for OLS. Many potential features, watch multicollinearity |
| Residents (joined) | 60 | Demographics, risk levels, case categories | reintegration_status (binary) | Very small. Need aggressive feature selection |
| Process Recordings | 2,819 | Session type, duration, interventions, emotional states | emotional_improvement (ordinal diff) | Largest dataset. 4 intervention types appear in combos |
| Incident Reports | 100 | Incident type, severity, resolved, resident_id | has_incident (binary, at resident level) | 44 of 60 residents have incidents |
| Education Records | 534 | Level, attendance_rate, progress_percent, completion_status | completion_status or progress_percent | Monthly records per resident |
| Donations (time series) | 420 | Date, amount, type, campaign | Monthly total amount | Aggregate to monthly for forecasting |
| Safehouse Metrics | 450 | Monthly stats per safehouse: education, health, incidents | avg_education_progress or avg_health_score | 9 safehouses x 50 months |

### Class Balance Issues
- **Donor churn:** ~45 active / ~15 inactive supporters (75/25 split) -- moderate imbalance
- **Reintegration:** 19 completed / 41 not completed (32/68 split) -- moderate imbalance
- **Incidents:** 44 residents with incidents / 16 without (73/27 split)
- **Education completion:** 50 completed / 424 in-progress / 60 not started -- severe imbalance if binary

## Pipeline-Specific Design Decisions

### Pipeline 1: Donor Churn (Predictive)
- **Target construction:** Churned = active supporter with no monetary donation in last 90 days. Only consider supporters with 2+ donations (exclude one-time donors).
- **Features:** RFM (recency, frequency, monetary), tenure, channel diversity, is_recurring proportion, supporter_type, acquisition_channel, region.
- **Challenge:** Only 60 supporters. Use leave-one-out or 5-fold CV with stratification.

### Pipeline 2: Social Media Effectiveness (Explanatory)
- **Target:** donation_referrals (count) or estimated_donation_value_php (continuous).
- **Key features for OLS:** platform, post_type, media_type, has_call_to_action, content_topic, is_boosted, post_hour, day_of_week, features_resident_story.
- **Control variables:** follower_count_at_post (accounts for organic reach differences).
- **Challenge:** Multicollinearity between engagement metrics (impressions, reach, likes). DO NOT use engagement metrics as features -- they are outcomes of the same process, not causes of donations.

### Pipeline 3: Reintegration Readiness (Predictive)
- **Target:** reintegration_status == "Completed" (binary).
- **Features:** Aggregate per-resident: avg education progress, avg health score, session count, progress_noted ratio, emotional improvement trend, incident count, visit outcome distribution, intervention plan completion, length of stay.
- **Challenge:** Only 60 residents. Heavy feature engineering from 6 related tables.

### Pipeline 4: Counseling Effectiveness (Explanatory)
- **Target:** emotional_improvement (end_score - start_score using ordinal encoding).
- **Features:** session_type (Individual vs Group), session_duration_minutes, has_Caring/Teaching/Legal/Healing (multi-hot from interventions_applied), resident demographics.
- **Challenge:** Interventions column is comma-separated, must split into binary indicators.

### Pipeline 5: Incident Risk (Predictive)
- **Target:** Binary -- did this resident have any incident in a given period?
- **Features:** Aggregate resident-level: health scores, education attendance, session participation, risk level, case category, length of stay.
- **Challenge:** 44/60 residents have incidents -- nearly everyone. Consider severity or count as target instead.

### Pipeline 6: Education Outcome (Predictive)
- **Target:** completion_status (binary: Completed vs not) or progress_percent (continuous).
- **Features:** attendance_rate, education_level, health scores, session participation, incident count.
- **Challenge:** Temporal data -- monthly records. Use latest record or aggregate features.

### Pipeline 7: Donation Forecasting (Predictive)
- **Target:** Monthly total donation amount.
- **Approach:** Aggregate donations by month, use time-based features (month, year, lag values, rolling averages).
- **Challenge:** Only ~24-30 monthly data points. Simple approach: linear regression with time features. Alternatively, treat as regression with lagged features.

### Pipeline 8: Safehouse Capacity/Outcomes (Explanatory)
- **Target:** avg_education_progress or avg_health_score.
- **Features:** active_residents (occupancy), capacity_girls/capacity_staff (from safehouses), process_recording_count, home_visitation_count, incident_count, region.
- **Challenge:** Only 9 safehouses but 450 monthly records. Use panel data approach.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| pickle for model saving | joblib for sklearn models | Long-standing recommendation | Better handling of large numpy arrays |
| Manual feature scaling | sklearn Pipeline with ColumnTransformer | sklearn 0.20+ | Prevents train/test leakage, single serialization |
| penalty param in LogReg | Deprecated in sklearn 1.8 | sklearn 1.8.0 (2026) | Use default solver settings, avoid explicit penalty param |
| flask-cors 4.x | flask-cors 6.0.2 | 2025-2026 | Security improvements, path specificity changes |
| statsmodels for OLS | statsmodels 0.14.6 (stable) | Ongoing | Still the standard for explanatory modeling in Python |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python 3 | All ML work | Yes | 3.13.1 | -- |
| scikit-learn | Model training | Yes | 1.8.0 | -- |
| pandas | Data manipulation | Yes | 2.2.3 | -- |
| numpy | Numerical ops | Yes | 2.4.2 | -- |
| matplotlib | Visualization | Yes | 3.10.1 | -- |
| seaborn | Statistical plots | Yes | 0.13.2 | -- |
| statsmodels | OLS regression | Yes | 0.14.6 | -- |
| joblib | Model serialization | Yes | 1.5.3 | -- |
| Flask | API serving | No | -- | Must install: pip3 install flask |
| flask-cors | CORS for Flask | No | -- | Must install: pip3 install flask-cors |
| gunicorn | Production WSGI | No | -- | Must install: pip3 install gunicorn |
| Jupyter | Notebook execution | No | -- | Must install: pip3 install jupyter notebook |
| nbformat | Notebook creation | No | -- | Must install: pip3 install nbformat |

**Missing dependencies with no fallback:**
- None -- all missing dependencies can be installed via pip

**Missing dependencies with fallback:**
- None needed -- straightforward pip install for Flask, flask-cors, gunicorn, jupyter, nbformat

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Python unittest / pytest + nbconvert for notebook validation |
| Config file | None -- create in Wave 0 |
| Quick run command | `python3 -c "import joblib; m = joblib.load('ml-pipelines/models/donor_churn.pkl'); print('OK')"` |
| Full suite command | `jupyter nbconvert --execute --to notebook ml-pipelines/notebooks/*.ipynb` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ML-01 | Donor churn model trains and predicts | smoke | `python3 -c "import joblib; m=joblib.load('ml-pipelines/models/donor_churn.pkl'); print(m)"` | Wave 0 |
| ML-02 | Social media OLS runs and produces summary | smoke | `python3 -c "import joblib; m=joblib.load('ml-pipelines/models/social_media.pkl'); print(m)"` | Wave 0 |
| ML-03 | Reintegration model trains and predicts | smoke | `python3 -c "import joblib; m=joblib.load('ml-pipelines/models/reintegration.pkl'); print(m)"` | Wave 0 |
| ML-04 | Counseling OLS runs with coefficient output | smoke | `python3 -c "import joblib; m=joblib.load('ml-pipelines/models/counseling.pkl'); print(m)"` | Wave 0 |
| ML-05 | Incident risk model trains and predicts | smoke | `python3 -c "import joblib; m=joblib.load('ml-pipelines/models/incident_risk.pkl'); print(m)"` | Wave 0 |
| ML-06 | Education outcome model trains and predicts | smoke | `python3 -c "import joblib; m=joblib.load('ml-pipelines/models/education_outcome.pkl'); print(m)"` | Wave 0 |
| ML-07 | Donation forecast model produces predictions | smoke | `python3 -c "import joblib; m=joblib.load('ml-pipelines/models/donation_forecast.pkl'); print(m)"` | Wave 0 |
| ML-08 | Safehouse outcomes OLS produces summary | smoke | `python3 -c "import joblib; m=joblib.load('ml-pipelines/models/safehouse_outcomes.pkl'); print(m)"` | Wave 0 |
| ML-09 | All notebooks execute top-to-bottom | integration | `jupyter nbconvert --execute --to notebook ml-pipelines/notebooks/*.ipynb` | Wave 0 |
| ML-10 | Flask API returns predictions for all models | integration | `curl -X POST http://localhost:5050/predict/donor-churn -H 'Content-Type: application/json' -d '{"features": {...}}'` | Wave 0 |

### Sampling Rate
- **Per task commit:** Verify model .pkl files exist and load
- **Per wave merge:** Run Flask API health check + one predict call per model
- **Phase gate:** All 8 notebooks execute via nbconvert; Flask API responds to all 8 endpoints

### Wave 0 Gaps
- [ ] Install Flask, flask-cors, gunicorn, jupyter, nbformat: `pip3 install flask flask-cors gunicorn jupyter notebook nbformat`
- [ ] Create `ml-pipelines/` directory structure (notebooks/, models/, flask_api/)
- [ ] Create `ml-pipelines/flask_api/requirements.txt` with pinned versions

## Open Questions

1. **Notebook format: Write as .ipynb directly or convert from .py?**
   - What we know: Claude can generate .ipynb JSON directly or write Python scripts and convert with nbformat.
   - What's unclear: Whether direct .ipynb generation produces clean outputs (cell outputs need to be populated by execution).
   - Recommendation: Write notebooks as .ipynb using nbformat programmatically, then execute with `jupyter nbconvert --execute` to populate outputs. This ensures ML-09 (executable top-to-bottom).

2. **Flask API port and .NET configuration**
   - What we know: Flask defaults to port 5000 (macOS uses 5000 for AirPlay). .NET runs on port 5001/5002.
   - What's unclear: What port to use for Flask in development vs production.
   - Recommendation: Use port 5050 for Flask locally. Store as config value `MlApiUrl` in .NET appsettings.json.

3. **Donation Forecasting approach with limited data**
   - What we know: Only ~24-30 monthly aggregated data points for time series.
   - What's unclear: Whether true time-series methods (ARIMA) are viable with so few points.
   - Recommendation: Use simple regression with time-based features (month, lag-1, lag-3, rolling mean). Frame as regression, not time-series forecasting. This is more defensible academically.

4. **Model file sizes and Git**
   - What we know: joblib .pkl files can be several MB each.
   - What's unclear: Whether .pkl files should be committed to Git.
   - Recommendation: Commit .pkl files to Git. They are small (KB-range for these tiny datasets) and the spec expects them in the repo for grading. Add a note about this not being production practice.

## Sources

### Primary (HIGH confidence)
- [scikit-learn 1.8.0 Release Highlights](https://scikit-learn.org/stable/auto_examples/release_highlights/plot_release_highlights_1_8_0.html) - LogisticRegression penalty deprecation, Python 3.11-3.14 support
- [scikit-learn 1.8.0 documentation](https://scikit-learn.org/stable/) - Pipeline, ColumnTransformer, classification/regression APIs
- [statsmodels OLS documentation](https://www.statsmodels.org/stable/regression.html) - OLS regression, VIF, diagnostic tests
- Local environment verification: scikit-learn 1.8.0, pandas 2.2.3, numpy 2.4.2, statsmodels 0.14.6, matplotlib 3.10.1, seaborn 0.13.2, joblib 1.5.3 -- all verified installed
- [PyPI: Flask 3.1.3](https://pypi.org/project/flask/) - Latest Flask version
- [PyPI: flask-cors 6.0.2](https://pypi.org/project/flask-cors/) - Latest flask-cors version (updated from STACK.md's 4.x)

### Secondary (MEDIUM confidence)
- [flask-cors changelog](https://github.com/corydolphin/flask-cors/blob/main/CHANGELOG.md) - Breaking changes in v6.0 (path specificity, private network access defaults)
- Course spec (Intex.md) - Mandatory 7-section notebook structure, emotional state encoding, churn definition

### Tertiary (LOW confidence)
- None -- all findings verified against installed libraries and course spec

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified as installed or available via pip. Versions confirmed.
- Architecture: HIGH - Patterns directly from scikit-learn docs and Flask standard practices. Small dataset sizes well-characterized.
- Pitfalls: HIGH - Data profiling reveals exact class distributions, column formats, and dataset sizes. Known sklearn 1.8 deprecation verified.
- Data design: HIGH - All 17 CSVs examined with row counts, column names, value distributions, and class balance checks.

**Research date:** 2026-04-06
**Valid until:** 2026-04-10 (project deadline)

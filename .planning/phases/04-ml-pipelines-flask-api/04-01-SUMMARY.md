---
phase: 04-ml-pipelines-flask-api
plan: 01
subsystem: ml
tags: [scikit-learn, jupyter, classification, joblib, pandas, matplotlib]

# Dependency graph
requires:
  - phase: 01-foundation-auth
    provides: CSV data files seeded in data/lighthouse_csv_v7/
provides:
  - 4 predictive ML notebooks (01, 03, 05, 06) with 7-section structure
  - 4 serialized sklearn Pipeline .pkl model files (donor_churn, reintegration, incident_risk, education_outcome)
  - Notebook generation scripts for reproducibility
affects: [04-03 Flask API, 05-integration-polish]

# Tech tracking
tech-stack:
  added: [scikit-learn 1.8, nbformat, nbconvert, matplotlib, seaborn]
  patterns: [sklearn Pipeline with ColumnTransformer, nbformat programmatic notebook generation, permutation_importance for feature analysis]

key-files:
  created:
    - ml-pipelines/notebooks/01-donor-churn-classifier.ipynb
    - ml-pipelines/notebooks/03-reintegration-readiness.ipynb
    - ml-pipelines/notebooks/05-incident-risk-prediction.ipynb
    - ml-pipelines/notebooks/06-education-outcome-prediction.ipynb
    - ml-pipelines/models/donor_churn.pkl
    - ml-pipelines/models/reintegration.pkl
    - ml-pipelines/models/incident_risk.pkl
    - ml-pipelines/models/education_outcome.pkl
    - ml-pipelines/notebooks/create_notebook_01.py
    - ml-pipelines/notebooks/create_notebook_03.py
    - ml-pipelines/notebooks/create_notebook_05.py
    - ml-pipelines/notebooks/create_notebook_06.py
  modified:
    - .gitignore

key-decisions:
  - "Each model uses sklearn Pipeline wrapping ColumnTransformer (StandardScaler + OneHotEncoder) for reproducible preprocessing"
  - "permutation_importance used for feature analysis (works on pipeline input columns, not preprocessed features)"
  - "All classifiers use class_weight='balanced' to handle imbalanced datasets"
  - "Best model selected by cross-validated F1 score from 4-model progression (LogReg, DTree, RF, GBM)"

patterns-established:
  - "Pattern: 7-section notebook structure (Problem Framing, Data Acquisition, Exploration, Modeling, Evaluation, Causal Analysis, Deployment)"
  - "Pattern: nbformat programmatic notebook generation with create_notebook_XX.py scripts"
  - "Pattern: Model serialization with joblib.dump to ml-pipelines/models/*.pkl"
  - "Pattern: 4-model progression with CV=5 F1 scoring for model selection"

requirements-completed: [ML-01, ML-03, ML-05, ML-06, ML-09]

# Metrics
duration: 14min
completed: 2026-04-06
---

# Phase 04 Plan 01: Predictive ML Notebooks Summary

**4 predictive classification pipelines (donor churn, reintegration readiness, incident risk, education outcome) with 7-section structure, 4-model progression, and serialized .pkl model files**

## Performance

- **Duration:** 14 min
- **Started:** 2026-04-06T21:04:35Z
- **Completed:** 2026-04-06T21:18:38Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Created 4 fully executable Jupyter notebooks following mandatory 7-section structure
- Trained and serialized 4 sklearn Pipeline models with ColumnTransformer preprocessing
- All notebooks show LogReg -> DecisionTree -> RandomForest -> GradientBoosting model progression
- All models use cross-validation (cv=5) with F1 scoring and class_weight='balanced'
- Best models selected automatically: DecisionTree (churn), LogisticRegression (reintegration), RandomForest (incident risk), GradientBoosting (education outcome)

## Task Commits

Each task was committed atomically:

1. **Task 1: Setup infrastructure and create Notebooks 01 and 03** - `8a267b4` (feat)
2. **Task 2: Create Notebooks 05 and 06** - `9805fb8` (feat)

## Files Created/Modified
- `ml-pipelines/notebooks/01-donor-churn-classifier.ipynb` - Donor churn binary classifier using RFM features from supporters/donations CSVs
- `ml-pipelines/notebooks/03-reintegration-readiness.ipynb` - Reintegration completion predictor using aggregated resident features
- `ml-pipelines/notebooks/05-incident-risk-prediction.ipynb` - Incident risk binary classifier from health/education/session/visit features
- `ml-pipelines/notebooks/06-education-outcome-prediction.ipynb` - Education completion predictor from attendance and engagement features
- `ml-pipelines/models/donor_churn.pkl` - Serialized DecisionTreeClassifier pipeline (best by CV F1)
- `ml-pipelines/models/reintegration.pkl` - Serialized LogisticRegression pipeline (best by CV F1)
- `ml-pipelines/models/incident_risk.pkl` - Serialized RandomForestClassifier pipeline (best by CV F1)
- `ml-pipelines/models/education_outcome.pkl` - Serialized GradientBoostingClassifier pipeline (best by CV F1)
- `ml-pipelines/notebooks/create_notebook_01.py` - Notebook generation script for reproducibility
- `ml-pipelines/notebooks/create_notebook_03.py` - Notebook generation script for reproducibility
- `ml-pipelines/notebooks/create_notebook_05.py` - Notebook generation script for reproducibility
- `ml-pipelines/notebooks/create_notebook_06.py` - Notebook generation script for reproducibility
- `.gitignore` - Added ml-pipelines/notebooks/*.png to ignore generated plots

## Decisions Made
- Used sklearn Pipeline wrapping ColumnTransformer for end-to-end preprocessing + classification in a single serializable object
- permutation_importance operates on input columns (not preprocessed features) when applied to a Pipeline -- feature_names = X_test.columns
- All classifiers use class_weight='balanced' to handle varying degrees of class imbalance across datasets
- intervention_plans.csv uses target_value (not completion_percentage which doesn't exist) as proxy for completion metric
- health_wellbeing_records.csv uses general_health_score (not health_score which doesn't exist)
- Education outcome uses resident-level aggregation (did any education record complete?) rather than record-level prediction

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed feature importance array length mismatch**
- **Found during:** Task 1 (Notebook 01 execution)
- **Issue:** permutation_importance on a sklearn Pipeline permutes input columns (9 columns), not preprocessed features (18 after OneHotEncoding). Using preprocessor.get_feature_names_out() returned 18 names for 9 importance values.
- **Fix:** Changed feature_names to use X_test.columns (input column names) instead of preprocessor output names
- **Files modified:** create_notebook_01.py, create_notebook_03.py, create_notebook_05.py, create_notebook_06.py
- **Verification:** All 4 notebooks execute without errors
- **Committed in:** 8a267b4, 9805fb8

**2. [Rule 3 - Blocking] Adapted to actual CSV column names**
- **Found during:** Task 1 (Data exploration)
- **Issue:** Plan referenced columns that don't exist: health_score (actual: general_health_score), mental_health_status (doesn't exist), completion_percentage in intervention_plans (actual: target_value)
- **Fix:** Used actual column names from CSV files throughout all notebooks
- **Files modified:** All 4 create_notebook_*.py scripts
- **Verification:** All data loads and aggregates correctly
- **Committed in:** 8a267b4, 9805fb8

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
- jupyter command not in PATH; resolved by using `python3 -m jupyter nbconvert` instead

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 .pkl model files ready for Flask API serving (Plan 04-03)
- Model input features documented in each notebook's Section 7
- Example prediction calls shown for API implementation reference

## Self-Check: PASSED

- All 8 artifact files exist (4 notebooks + 4 model .pkl files)
- Both task commits verified (8a267b4, 9805fb8)
- All 4 models load with joblib and contain valid sklearn Pipeline objects

---
*Phase: 04-ml-pipelines-flask-api*
*Completed: 2026-04-06*

---
phase: 04-ml-pipelines-flask-api
plan: 02
subsystem: ml
tags: [statsmodels, ols, sklearn, regression, joblib, pandas, scipy, explanatory-models, donation-forecasting]

# Dependency graph
requires:
  - phase: 01-foundation-auth
    provides: Database with CSV-seeded tables providing source data for ML models
provides:
  - Social media effectiveness OLS explanatory model + sklearn Pipeline (social_media.pkl)
  - Counseling session effectiveness OLS explanatory model + sklearn Pipeline (counseling.pkl)
  - Donation forecasting regression model with GradientBoosting Pipeline (donation_forecast.pkl)
  - Safehouse capacity/outcomes OLS explanatory model + sklearn Pipeline (safehouse_outcomes.pkl)
  - 4 fully executable Jupyter notebooks (02, 04, 07, 08) with 7-section structure
affects: [04-03-PLAN (Flask API needs these .pkl files to serve predictions)]

# Tech tracking
tech-stack:
  added: [statsmodels OLS, scipy.stats.shapiro, statsmodels.stats.diagnostic.het_breuschpagan, GradientBoostingRegressor]
  patterns: [explanatory OLS with VIF/Shapiro-Wilk/Breusch-Pagan diagnostics, separate statsmodels analysis + sklearn Pipeline serialization, temporal train-test split for time-based data]

key-files:
  created:
    - ml-pipelines/notebooks/02-social-media-effectiveness.ipynb
    - ml-pipelines/notebooks/04-counseling-effectiveness.ipynb
    - ml-pipelines/notebooks/07-donation-forecasting.ipynb
    - ml-pipelines/notebooks/08-safehouse-capacity-outcomes.ipynb
    - ml-pipelines/models/social_media.pkl
    - ml-pipelines/models/counseling.pkl
    - ml-pipelines/models/donation_forecast.pkl
    - ml-pipelines/models/safehouse_outcomes.pkl
  modified: []

key-decisions:
  - "Social media model uses only controllable post factors as features (not engagement outcomes like impressions/likes) to avoid endogeneity"
  - "Counseling model uses ordinal emotional encoding per spec: Distressed=1 through Happy=8"
  - "Donation forecasting uses GradientBoostingRegressor (best CV RMSE) with temporal split and lag/rolling features"
  - "Safehouse outcomes drops new_admissions/departures features since columns don't exist in CSV data"

patterns-established:
  - "OLS explanatory pattern: statsmodels sm.OLS for analysis + sklearn LinearRegression Pipeline for deployment serialization"
  - "Diagnostic suite: VIF multicollinearity check, Shapiro-Wilk normality test, Breusch-Pagan homoscedasticity test"
  - "Temporal split: for time-ordered data, use chronological split (not random shuffle)"

requirements-completed: [ML-02, ML-04, ML-07, ML-08, ML-09]

# Metrics
duration: 16min
completed: 2026-04-06
---

# Phase 04 Plan 02: Explanatory OLS and Donation Forecasting Notebooks Summary

**3 explanatory OLS notebooks (social media, counseling, safehouse outcomes) with VIF/normality/homoscedasticity diagnostics, plus 1 donation forecasting notebook with GradientBoosting regression -- all producing sklearn Pipeline .pkl files for Flask API deployment**

## Performance

- **Duration:** 16 min
- **Started:** 2026-04-06T21:04:43Z
- **Completed:** 2026-04-06T21:21:14Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created 3 explanatory OLS notebooks (02-social-media, 04-counseling, 08-safehouse) with full diagnostic suites: VIF multicollinearity, Shapiro-Wilk normality, Breusch-Pagan homoscedasticity
- Created 1 donation forecasting notebook (07) with temporal train/test split, lag/rolling features, and model progression selecting GradientBoosting as best performer
- All 4 notebooks follow mandatory 7-section structure and execute top-to-bottom without errors
- All 4 notebooks save sklearn Pipeline .pkl files for Flask API deployment (statsmodels OLS objects cannot be serialized)

## Task Commits

Each task was committed atomically:

1. **Task 1: Notebooks 02 (Social Media) and 04 (Counseling)** - `0c4381a` (feat)
2. **Task 2: Notebooks 07 (Donation Forecasting) and 08 (Safehouse Outcomes)** - `4237dda` (feat)

## Files Created/Modified
- `ml-pipelines/notebooks/02-social-media-effectiveness.ipynb` - Social media post effectiveness OLS with controllable-factors-only feature selection
- `ml-pipelines/notebooks/04-counseling-effectiveness.ipynb` - Counseling session effectiveness OLS with ordinal emotional encoding and binary intervention indicators
- `ml-pipelines/notebooks/07-donation-forecasting.ipynb` - Monthly donation forecasting with lag features and GradientBoosting regression
- `ml-pipelines/notebooks/08-safehouse-capacity-outcomes.ipynb` - Safehouse capacity/outcomes OLS with derived per-resident metrics
- `ml-pipelines/models/social_media.pkl` - sklearn LinearRegression Pipeline for social media predictions
- `ml-pipelines/models/counseling.pkl` - sklearn LinearRegression Pipeline for counseling effectiveness predictions
- `ml-pipelines/models/donation_forecast.pkl` - sklearn GradientBoostingRegressor Pipeline for donation forecasting
- `ml-pipelines/models/safehouse_outcomes.pkl` - sklearn LinearRegression Pipeline for safehouse outcome predictions

## Decisions Made
- **Social media features:** Used only controllable post factors (platform, post_type, media_type, CTA, etc.) and excluded engagement outcomes (impressions, reach, likes) to avoid endogeneity bias
- **Emotional encoding:** Applied spec-mandated ordinal encoding (Distressed=1 through Happy=8) for emotional states in counseling model
- **Donation forecast model selection:** GradientBoostingRegressor selected as best model by cross-validation RMSE over LinearRegression, DecisionTree, and RandomForest
- **Temporal split for donations:** Used chronological 80/20 split (not random shuffle) to respect time ordering

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed non-existent columns from safehouse model**
- **Found during:** Task 2 (Notebook 08 creation)
- **Issue:** Plan specified `new_admissions` and `departures` as features, but these columns do not exist in `safehouse_monthly_metrics.csv`
- **Fix:** Removed both columns from feature lists, adjusted all code referencing them
- **Files modified:** `ml-pipelines/notebooks/08-safehouse-capacity-outcomes.ipynb`
- **Verification:** Notebook executes successfully with remaining features
- **Committed in:** 4237dda (Task 2 commit)

**2. [Rule 1 - Bug] Fixed statsmodels attribute name**
- **Found during:** Task 1 (Notebook 02/04 execution)
- **Issue:** Used `model.fstatistic[0]` which doesn't exist; correct attribute is `model.fvalue`
- **Fix:** Changed `model.fstatistic[0]` to `model.fvalue` in all notebooks
- **Files modified:** All 4 notebooks
- **Verification:** All notebooks execute without AttributeError
- **Committed in:** 0c4381a, 4237dda (both task commits)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 .pkl model files are ready for Flask API Plan 03 to load and serve
- Expected input features documented in each notebook's Section 7
- Model types: 3 LinearRegression Pipelines (social_media, counseling, safehouse_outcomes) + 1 GradientBoostingRegressor Pipeline (donation_forecast)

## Self-Check: PASSED

- All 8 created files verified present on disk
- Both commit hashes (0c4381a, 4237dda) verified in git log
- All 4 .pkl files load successfully with joblib
- All 4 notebooks contain executed outputs

---
*Phase: 04-ml-pipelines-flask-api*
*Completed: 2026-04-06*

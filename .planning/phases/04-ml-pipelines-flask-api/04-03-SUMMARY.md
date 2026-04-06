---
phase: 04-ml-pipelines-flask-api
plan: 03
subsystem: api
tags: [flask, python, ml-serving, joblib, dotnet, httpclient, scikit-learn]

requires:
  - phase: 04-ml-pipelines-flask-api (plans 01+02)
    provides: 8 trained .pkl model files in ml-pipelines/models/
provides:
  - Flask API serving 8 ML models on port 5050 with health and predict endpoints
  - .NET MlPredictionService proxying Flask API via HttpClient
  - .NET MlPredictionController (AdminOnly) with health and predict routes
  - MlPredictionDtos for typed request/response handling
affects: [05-reports-analytics-responsiveness, deployment]

tech-stack:
  added: [flask==3.1.3, flask-cors==6.0.2, gunicorn==23.0.0]
  patterns: [Flask model serving with joblib, .NET HttpClient proxy to Python ML API]

key-files:
  created:
    - ml-pipelines/flask_api/app.py
    - ml-pipelines/flask_api/requirements.txt
    - backend/HarborOfHope.API/Services/MlPredictionService.cs
    - backend/HarborOfHope.API/Controllers/MlPredictionController.cs
    - backend/HarborOfHope.API/DTOs/MlPredictionDtos.cs
  modified:
    - backend/HarborOfHope.API/Program.cs
    - backend/HarborOfHope.API/appsettings.json

key-decisions:
  - "AuthPolicies in Data namespace (not Infrastructure) -- matched existing codebase convention"
  - "Generic /predict/<model_name> route instead of 8 separate endpoints -- cleaner API surface"
  - "Pinned requirements.txt to actual installed versions for reproducibility"

patterns-established:
  - "Flask ML API pattern: load models at startup with joblib, single dynamic route for predictions"
  - ".NET HttpClient proxy pattern: named client MlApi with IHttpClientFactory + scoped service"

requirements-completed: [ML-09, ML-10]

duration: 4min
completed: 2026-04-06
---

# Phase 04 Plan 03: Flask API + .NET Proxy Summary

**Flask API serving 8 ML models on port 5050 with .NET HttpClient proxy controller under AdminOnly policy**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-06T21:24:11Z
- **Completed:** 2026-04-06T21:28:18Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Flask API loads all 8 trained .pkl models at startup and serves predictions via POST /predict/<model_name>
- Health endpoint returns loaded/missing model lists; classifiers include predict_proba and risk_level labels
- .NET MlPredictionService wraps HttpClient calls to Flask; MlPredictionController (AdminOnly) proxies predictions
- All 8 prediction endpoints tested and verified with sample feature data

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Flask API serving all 8 models** - `dae4b8f` (feat)
2. **Task 2: Create .NET HttpClient proxy service and ML prediction controller** - `dc56dc0` (feat)

## Files Created/Modified
- `ml-pipelines/flask_api/app.py` - Flask app loading 8 models with /health and /predict/<model> endpoints
- `ml-pipelines/flask_api/requirements.txt` - Pinned Python dependencies for Flask deployment
- `backend/HarborOfHope.API/Services/MlPredictionService.cs` - HttpClient wrapper for Flask API calls
- `backend/HarborOfHope.API/Controllers/MlPredictionController.cs` - AdminOnly controller with health and predict routes
- `backend/HarborOfHope.API/DTOs/MlPredictionDtos.cs` - Request/response records for ML predictions
- `backend/HarborOfHope.API/Program.cs` - Added MlApi HttpClient registration and MlPredictionService DI
- `backend/HarborOfHope.API/appsettings.json` - Added MlApiUrl configuration key

## Decisions Made
- Used `HarborOfHope.API.Data.AuthPolicies` namespace (matching existing codebase) instead of `Infrastructure` as plan suggested
- Pinned requirements.txt to actual installed versions (flask 3.1.3, scikit-learn 1.8.0, etc.) instead of plan's approximate versions
- Used generic /predict/<model_name> route pattern in Flask matching the .NET proxy route structure

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed AuthPolicies namespace reference**
- **Found during:** Task 2 (Controller creation)
- **Issue:** Plan referenced `HarborOfHope.API.Infrastructure.AuthPolicies` but AuthPolicies is in `HarborOfHope.API.Data` namespace
- **Fix:** Used correct `using HarborOfHope.API.Data` import in controller
- **Files modified:** backend/HarborOfHope.API/Controllers/MlPredictionController.cs
- **Verification:** dotnet build succeeds with 0 errors
- **Committed in:** dc56dc0

**2. [Rule 1 - Bug] Corrected requirements.txt versions to match installed packages**
- **Found during:** Task 1 (requirements.txt creation)
- **Issue:** Plan specified approximate versions (flask 3.1.3, flask-cors 6.0.2, etc.) but actual installed versions differed
- **Fix:** Checked actual installed versions and pinned to those exact versions for deployment reproducibility
- **Files modified:** ml-pipelines/flask_api/requirements.txt
- **Verification:** All packages import correctly, Flask starts without issues
- **Committed in:** dae4b8f

---

**Total deviations:** 2 auto-fixed (1 blocking namespace, 1 version pinning)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None -- all models loaded successfully, all prediction endpoints returned valid results, .NET build passed on first attempt.

## User Setup Required
None -- no external service configuration required.

## Next Phase Readiness
- Flask API ready to serve predictions; start with `python3 ml-pipelines/flask_api/app.py`
- .NET backend ready to proxy ML predictions via api/mlprediction/predict/{modelName}
- Phase 5 (reports/analytics) can wire ML prediction results into dashboard charts
- Deployment phase will need gunicorn for production Flask serving on Azure

## Self-Check: PASSED

All 6 files verified present. Both commit hashes (dae4b8f, dc56dc0) found in git log.

---
*Phase: 04-ml-pipelines-flask-api*
*Completed: 2026-04-06*

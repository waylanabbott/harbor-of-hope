---
phase: 05-reports-ml-integration
plan: 01
subsystem: api
tags: [dotnet, ef-core, linq, reports, ml-prediction, typescript, recharts]

# Dependency graph
requires:
  - phase: 01-foundation-auth
    provides: "AppDbContext, AuthPolicies, MlPredictionService DI registration"
  - phase: 04-ml-pipelines-flask-api
    provides: "Flask ML API with donor-churn model and .NET proxy service"
provides:
  - "ReportsController with 4 data aggregation endpoints"
  - "ReportsDtos with 5 DTO records"
  - "Frontend TypeScript interfaces for all report data"
  - "Frontend API modules for reports and ML prediction calls"
affects: [05-02-reports-ui, reports-page, supporters-churn-badges]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Bulk-load then sequential ML call pattern for batch predictions"
    - "RFM feature computation in C# matching notebook feature engineering"

key-files:
  created:
    - backend/HarborOfHope.API/Controllers/ReportsController.cs
    - backend/HarborOfHope.API/DTOs/ReportsDtos.cs
    - frontend/src/types/Reports.ts
    - frontend/src/lib/reportsApi.ts
    - frontend/src/lib/mlApi.ts
  modified: []

key-decisions:
  - "Bulk-load supporters and donations before ML loop to avoid N+1 database queries"
  - "Sequential ML API calls (Flask is single-threaded) with bulk data pre-fetch"
  - "Population std dev for monetary_std matching sklearn default"

patterns-established:
  - "Reports endpoint pattern: LINQ GroupBy with projection into typed DTOs"
  - "Batch ML prediction pattern: bulk DB load, sequential API calls, graceful Unknown fallback"

requirements-completed: [RPT-01, RPT-02, RPT-03, RPT-04, RPT-05, DONR-06]

# Metrics
duration: 2min
completed: 2026-04-06
---

# Phase 05 Plan 01: Reports API and ML Integration Summary

**ReportsController with 4 endpoints (donation-trends, resident-outcomes, safehouse-comparison, batch-churn) plus frontend TypeScript types and API modules for reports and ML predictions**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-06T21:58:20Z
- **Completed:** 2026-04-06T22:00:11Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- ReportsController with 4 AdminOnly endpoints for donation trends, resident outcomes, safehouse comparison, and batch churn prediction
- ReportsDtos with 5 typed record DTOs matching all report data shapes
- Frontend TypeScript interfaces and API fetch functions for all report endpoints and ML prediction calls
- Batch churn endpoint computes RFM features (recency, frequency, monetary_total, monetary_avg, monetary_std, tenure_days) matching notebook feature engineering

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ReportsController and ReportsDtos** - `8478c41` (feat)
2. **Task 2: Create frontend types and API modules** - `e9c995a` (feat)

## Files Created/Modified
- `backend/HarborOfHope.API/Controllers/ReportsController.cs` - 4 report endpoints with EF Core queries and ML batch prediction
- `backend/HarborOfHope.API/DTOs/ReportsDtos.cs` - 5 DTO records for report data shapes
- `frontend/src/types/Reports.ts` - 5 TypeScript interfaces matching backend DTOs
- `frontend/src/lib/reportsApi.ts` - 4 fetch functions for report endpoints
- `frontend/src/lib/mlApi.ts` - fetchMlPrediction and fetchMlHealth functions

## Decisions Made
- Bulk-load all supporters and donations before the ML prediction loop to avoid N+1 database queries
- Sequential ML API calls rather than parallel (Flask is single-threaded, parallel would cause queuing)
- Population standard deviation for monetary_std (matching sklearn's default behavior)
- Graceful "Unknown" fallback when ML API is unavailable (returns ChurnPrediction with RiskLevel="Unknown", probability=0)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All report endpoints ready for Plan 02 to build the ReportsPage UI with Recharts
- Frontend API modules ready for direct import in report page components
- Churn predictions available for SupportersPage churn badge integration

## Self-Check: PASSED

All 5 created files verified on disk. Both task commits (8478c41, e9c995a) verified in git log.

---
*Phase: 05-reports-ml-integration*
*Completed: 2026-04-06*

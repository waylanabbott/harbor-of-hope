---
phase: 06-polish-final-deploy
plan: 02
subsystem: infra
tags: [azure, deployment, spa-hosting, cors, dotnet, flask, vite, postgresql]

requires:
  - phase: 01-foundation-auth
    provides: ".NET backend with Identity, PostgreSQL, CORS, cookie auth"
  - phase: 04-ml-pipelines
    provides: "Flask API serving 8 ML models via /predict/<model_name>"
  - phase: 03-public-donor
    provides: "React SPA with public and donor pages"
provides:
  - ".NET configured to serve React SPA from wwwroot with fallback routing"
  - "Production appsettings with warning-level logging"
  - "Vite build output directed to backend wwwroot"
  - "Flask CORS restricted via ALLOWED_ORIGINS environment variable"
  - "Azure deployment script provisioning all resources"
  - "Deployment documentation with prerequisites and troubleshooting"
affects: [06-03]

tech-stack:
  added: [azure-cli, gunicorn]
  patterns: ["SPA fallback routing via UseStaticFiles + MapFallbackToFile", "Environment-based CORS configuration for Flask"]

key-files:
  created:
    - backend/HarborOfHope.API/appsettings.Production.json
    - azure-deploy/deploy.sh
    - azure-deploy/README-DEPLOY.md
  modified:
    - backend/HarborOfHope.API/Program.cs
    - frontend/vite.config.ts
    - ml-pipelines/flask_api/app.py

key-decisions:
  - "SPA served from same .NET origin (UseStaticFiles + MapFallbackToFile) -- no separate static hosting needed"
  - "Connection string and MlApiUrl set via Azure App Service Configuration, not in source files (SEC-06)"
  - "Shared App Service Plan (B1 Linux) for both .NET and Flask services"
  - "Flask CORS controlled by ALLOWED_ORIGINS env var for production restriction"

patterns-established:
  - "SPA fallback pattern: UseStaticFiles after UseAuthorization, MapFallbackToFile after MapControllers"
  - "Azure deployment: single bash script with env var overrides and required DB_ADMIN_PASSWORD"

requirements-completed: [DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04]

duration: 2min
completed: 2026-04-06
---

# Phase 6 Plan 2: Azure Deployment Config Summary

**SPA hosting middleware in .NET, production settings, Flask CORS restriction, and Azure deployment script provisioning PostgreSQL + dual App Services**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-06T22:13:33Z
- **Completed:** 2026-04-06T22:16:22Z
- **Tasks:** 2 of 3 (Task 3 is checkpoint:human-action for Azure login)
- **Files modified:** 6

## Accomplishments

- .NET backend configured to serve React SPA from wwwroot with fallback routing for client-side routes
- Production appsettings created with warning-level logging (no secrets in source)
- Vite build output redirected to backend wwwroot folder for seamless SPA hosting
- Flask API CORS and MODEL_DIR made configurable via environment variables
- Comprehensive Azure deployment script (208 lines) that provisions all resources and deploys code
- Deployment README with prerequisites, usage, verification, and troubleshooting documentation

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure .NET SPA hosting + production settings + Flask CORS** - `23ec72c` (feat)
2. **Task 2: Create Azure deployment script and documentation** - `943df72` (feat)
3. **Task 3: Azure CLI login and subscription verification** - checkpoint:human-action (pending)

## Files Created/Modified

- `backend/HarborOfHope.API/Program.cs` - Added UseStaticFiles() and MapFallbackToFile("index.html") for SPA hosting
- `backend/HarborOfHope.API/appsettings.Production.json` - Production logging config (Warning level)
- `frontend/vite.config.ts` - Build output set to ../backend/HarborOfHope.API/wwwroot
- `ml-pipelines/flask_api/app.py` - ALLOWED_ORIGINS and MODEL_DIR from environment variables
- `azure-deploy/deploy.sh` - Full Azure provisioning and deployment script (executable)
- `azure-deploy/README-DEPLOY.md` - Deployment prerequisites, usage, and troubleshooting guide

## Decisions Made

- SPA served from same .NET origin via UseStaticFiles + MapFallbackToFile -- eliminates need for separate static file hosting or CORS for frontend in production
- All secrets (connection string, MlApiUrl) configured via Azure App Service Configuration environment variables, never in source files (SEC-06 compliance)
- Shared App Service Plan (Linux B1) for .NET and Flask to minimize cost
- Flask CORS controlled by ALLOWED_ORIGINS environment variable -- defaults to permissive for development, restricted in production

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Azure CLI login is required before deployment can proceed.** Task 3 (checkpoint:human-action) requires:
1. Azure CLI installed (`brew install azure-cli`)
2. Azure account with active subscription
3. Login via `az login`
4. Verification via `az account show`

## Next Phase Readiness

- All deployment configuration files ready
- Deploy script ready to execute once Azure CLI is authenticated
- Plan 06-03 can run deploy.sh after user completes Azure login checkpoint

## Self-Check: PASSED

- All 6 created/modified files verified present on disk
- Commit `23ec72c` (Task 1) verified in git log
- Commit `943df72` (Task 2) verified in git log
- .NET backend builds successfully with 0 warnings, 0 errors

---
*Phase: 06-polish-final-deploy*
*Completed: 2026-04-06 (Tasks 1-2; Task 3 pending user action)*

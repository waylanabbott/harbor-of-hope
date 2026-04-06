---
phase: 01-foundation-auth
plan: 01
subsystem: database, api, ui
tags: [dotnet, efcore, postgresql, npgsql, csvhelper, react, vite, mui, typescript]

# Dependency graph
requires: []
provides:
  - 17-table EF Core domain model (AppDbContext) with indexes and relationships
  - CSV seeder for all 17 tables (~8,100 rows) in dependency order
  - .NET 10 Web API project with Swagger at localhost:5001
  - React/TypeScript frontend with MUI theme and Vite proxy at localhost:3000
affects: [01-foundation-auth, 02-admin-donor-pages, 03-public-analytics, 04-ml-pipelines, 05-integration-polish, 06-deploy-final]

# Tech tracking
tech-stack:
  added: [Npgsql.EntityFrameworkCore.PostgreSQL 10.0.1, CsvHelper 33.1.0, Swashbuckle.AspNetCore 10.1.7, Microsoft.EntityFrameworkCore.Design 10.0.5, "@mui/material 6.x", "@emotion/react 11.x", "react-router-dom 7.x", "axios 1.x", "vite 6.4.2", "qrcode 1.5.x"]
  patterns: [EF Core Code-First with snake_case Column attributes, CsvHelper PrepareHeaderForMatch for snake_case mapping, design-time DbContext factory, Vite proxy for same-origin API calls]

key-files:
  created:
    - backend/HarborOfHope.API/Data/AppDbContext.cs
    - backend/HarborOfHope.API/Data/SeedData.cs
    - backend/HarborOfHope.API/Data/AppDbContextFactory.cs
    - backend/HarborOfHope.API/Data/Entities/ (17 entity files)
    - backend/HarborOfHope.API/Program.cs
    - frontend/src/theme.ts
    - frontend/src/main.tsx
    - frontend/src/App.tsx
    - frontend/vite.config.ts
  modified:
    - backend/HarborOfHope.API/appsettings.Development.json
    - backend/HarborOfHope.API/Properties/launchSettings.json
    - frontend/index.html

key-decisions:
  - "Upgraded Swashbuckle from 6.6.2 to 10.1.7 for .NET 10 compatibility (6.6.2 has broken GetSwagger method)"
  - "Added design-time DbContext factory to decouple EF migrations from runtime Swagger initialization"
  - "Used PrepareHeaderForMatch for snake_case CSV header mapping instead of per-property Name attributes"
  - "Created DoubleToIntConverter ClassMap for partner_assignments.safehouse_id (CSV has 8.0 format)"
  - "Downgraded from Vite 8 (scaffolded default) to Vite 6 per stack constraints"

patterns-established:
  - "Entity classes use [Table] and [Column] attributes with snake_case names matching CSV headers"
  - "AppDbContext configures all relationships, indexes, and decimal precision in OnModelCreating"
  - "SeedData uses generic SeedTable method with CsvHelper for CSV-to-entity mapping"
  - "Frontend uses ThemeProvider + CssBaseline + BrowserRouter wrapping App component"
  - "Vite proxy routes /api and /signin-google to backend at localhost:5001"

requirements-completed: [DATA-01, DATA-02, DATA-03]

# Metrics
duration: 10min
completed: 2026-04-06
---

# Phase 01 Plan 01: Project Scaffold Summary

**EF Core 17-table domain model with CSV seeding, .NET 10 API with Swagger, and React/MUI frontend with coral/cream/Nunito theme**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-06T18:11:12Z
- **Completed:** 2026-04-06T18:20:53Z
- **Tasks:** 2
- **Files modified:** 47

## Accomplishments
- Created complete .NET 10 backend with all 17 EF Core entity classes matching CSV column schemas exactly
- Configured AppDbContext with 17 DbSets, FK relationships, 10 indexes on frequently queried columns, and decimal precision for all currency/rate fields
- Implemented CsvHelper-based seeder that loads all 17 CSV files (~8,100 rows) in correct dependency order
- Scaffolded React/TypeScript frontend with MUI v6 warm nonprofit theme (coral #E8735A, cream #FFF8F0, Nunito font)
- Configured Vite proxy to route /api and /signin-google to .NET backend

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold backend project, create all 17 entity classes, AppDbContext with indexes, and CSV seeder** - `857679c` (feat)
2. **Task 2: Scaffold frontend project with MUI theme, Vite proxy, and basic app shell** - `394b84c` (feat)

## Files Created/Modified

### Backend
- `backend/HarborOfHope.API/HarborOfHope.API.csproj` - Project file with Npgsql, CsvHelper, Swashbuckle packages
- `backend/HarborOfHope.API/Program.cs` - Minimal startup with PostgreSQL, CORS, Swagger, migration + seed
- `backend/HarborOfHope.API/appsettings.json` - Base configuration
- `backend/HarborOfHope.API/appsettings.Development.json` - Dev config with PostgreSQL connection string
- `backend/HarborOfHope.API/Properties/launchSettings.json` - HTTPS on port 5001
- `backend/HarborOfHope.API/Data/AppDbContext.cs` - 17-table DbContext with relationships, indexes, decimal precision
- `backend/HarborOfHope.API/Data/AppDbContextFactory.cs` - Design-time factory for EF migrations
- `backend/HarborOfHope.API/Data/SeedData.cs` - CSV seeder with CsvHelper, dependency-ordered, DoubleToInt converter
- `backend/HarborOfHope.API/Data/Entities/Safehouse.cs` - Safehouse entity (PK: safehouse_id)
- `backend/HarborOfHope.API/Data/Entities/Resident.cs` - Resident entity (47 columns, 8 sub_cat booleans, age as string)
- `backend/HarborOfHope.API/Data/Entities/Supporter.cs` - Supporter entity
- `backend/HarborOfHope.API/Data/Entities/Donation.cs` - Donation entity with decimal amount/estimated_value
- `backend/HarborOfHope.API/Data/Entities/DonationAllocation.cs` - Allocation entity with FKs to donation + safehouse
- `backend/HarborOfHope.API/Data/Entities/InKindDonationItem.cs` - In-kind donation items
- `backend/HarborOfHope.API/Data/Entities/EducationRecord.cs` - Education tracking per resident
- `backend/HarborOfHope.API/Data/Entities/HealthWellbeingRecord.cs` - Health scores per resident
- `backend/HarborOfHope.API/Data/Entities/ProcessRecording.cs` - Counseling session recordings
- `backend/HarborOfHope.API/Data/Entities/HomeVisitation.cs` - Home visit records
- `backend/HarborOfHope.API/Data/Entities/IncidentReport.cs` - Incident reports with FKs to resident + safehouse
- `backend/HarborOfHope.API/Data/Entities/InterventionPlan.cs` - Intervention plans per resident
- `backend/HarborOfHope.API/Data/Entities/Partner.cs` - Partner organizations
- `backend/HarborOfHope.API/Data/Entities/PartnerAssignment.cs` - Partner-to-safehouse assignments
- `backend/HarborOfHope.API/Data/Entities/SocialMediaPost.cs` - Social media engagement data
- `backend/HarborOfHope.API/Data/Entities/SafehouseMonthlyMetric.cs` - Monthly aggregate metrics
- `backend/HarborOfHope.API/Data/Entities/PublicImpactSnapshot.cs` - Public impact reports with JSON payload
- `backend/HarborOfHope.API/Migrations/Harbor/` - InitApp migration (3 files)

### Frontend
- `frontend/package.json` - Dependencies: MUI v6, React Router, Axios, qrcode
- `frontend/vite.config.ts` - Vite 6 config with proxy for /api and /signin-google
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/index.html` - Nunito font, Harbor of Hope title
- `frontend/src/main.tsx` - ThemeProvider + CssBaseline + BrowserRouter entry point
- `frontend/src/App.tsx` - Routes shell with placeholder home route
- `frontend/src/theme.ts` - MUI theme: coral #E8735A, cream #FFF8F0, charcoal #2D2D2D, Nunito, rounded corners

### Root
- `.gitignore` - Ignores bin/obj, node_modules, data files, IDE files

## Decisions Made
- **Swashbuckle 10.1.7 instead of 6.6.2**: Swashbuckle 6.6.2 has a broken `GetSwagger` method in .NET 10 -- the `SwaggerGenerator` class is incompatible. Upgraded to 10.1.7 which is built for .NET 10.
- **Design-time DbContext factory**: Added `AppDbContextFactory` implementing `IDesignTimeDbContextFactory<AppDbContext>` to allow `dotnet ef migrations add` to work without starting the full application (which triggers the incompatible Swashbuckle issue at design time).
- **PrepareHeaderForMatch for CSV mapping**: Instead of adding `[Name("snake_case")]` attributes to every property, used CsvHelper's `PrepareHeaderForMatch` configuration to strip underscores and lowercase -- matching PascalCase C# properties to snake_case CSV headers automatically.
- **Vite 6 downgrade**: The latest `create-vite@9` scaffolds Vite 8 by default. Downgraded to Vite 6.4.2 per the stack constraints ("Do NOT use Vite 8 -- too new, less documented").
- **DeleteBehavior.Restrict on parent FKs**: Foreign keys to parent entities (Safehouse, Supporter) use `Restrict` to prevent accidental cascading deletes of critical reference data.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Swashbuckle 6.6.2 incompatible with .NET 10**
- **Found during:** Task 1 (migration generation)
- **Issue:** `dotnet ef migrations add` failed because Swashbuckle 6.6.2 throws `Method 'GetSwagger' does not have an implementation` when the app tries to start for design-time services
- **Fix:** Upgraded Swashbuckle to 10.1.7 and added a design-time DbContext factory
- **Files modified:** HarborOfHope.API.csproj, Data/AppDbContextFactory.cs
- **Verification:** Migration generated successfully, build passes with 0 errors
- **Committed in:** 857679c (Task 1 commit)

**2. [Rule 3 - Blocking] Vite 8 scaffolded instead of required Vite 6**
- **Found during:** Task 2 (frontend scaffold)
- **Issue:** `create-vite@9` installs Vite 8 by default, which violates stack constraint
- **Fix:** Downgraded vite to 6.4.2 and @vitejs/plugin-react to 4.x
- **Files modified:** frontend/package.json, frontend/package-lock.json
- **Verification:** `npx vite --version` returns 6.4.2, TypeScript compiles clean
- **Committed in:** 394b84c (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking issues)
**Impact on plan:** Both fixes were necessary to complete the planned work. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## Known Stubs
None -- this plan creates the data layer and project scaffolding with no UI data binding.

## User Setup Required
None - no external service configuration required for this plan.

## Next Phase Readiness
- Backend compiles and has 17-table schema ready for migrations against PostgreSQL
- Frontend compiles with MUI theme, ready for auth pages (Plan 02) and admin pages (Plan 02-03)
- Database seeder is ready -- will populate all tables on first `dotnet run` once PostgreSQL is running
- Port 5001 (HTTPS) configured for backend, port 3000 for frontend with proxy

## Self-Check: PASSED

- All 9 key files verified present
- All 17 entity files verified (17/17)
- Commit 857679c verified in git log
- Commit 394b84c verified in git log
- Backend `dotnet build` succeeds with 0 errors, 0 warnings
- Frontend `npx tsc --noEmit` succeeds with 0 errors

---
*Phase: 01-foundation-auth*
*Completed: 2026-04-06*

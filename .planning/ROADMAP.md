# Roadmap: Harbor of Hope

## Overview

Harbor of Hope delivers a full-stack nonprofit platform in 6 phases across 4 days. The build front-loads database, authentication, and security infrastructure (Phase 1) because every feature depends on them. Admin CRUD pages follow (Phase 2) to make the app demonstrably functional for grading even if later phases slip. Public-facing pages and the donor portal (Phase 3) are built next since they depend on donation data from Phase 2. ML pipelines are trained and deployed as a Flask API (Phase 4), then integrated into the application UI alongside the reports page (Phase 5). Final polish, responsive design, accessibility auditing, and full Azure deployment close out the build (Phase 6).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation + Auth** - Database schema, CSV seeding, ASP.NET Identity with RBAC, security headers, and skeleton Azure deploy
- [ ] **Phase 2: Admin CRUD + Dashboard** - Caseload inventory, donors/contributions, process recordings, home visitations, admin dashboard, and input security
- [ ] **Phase 3: Public Pages + Donor Portal** - Landing page, public impact dashboard, donor portal, privacy policy, cookie consent, and dark mode
- [ ] **Phase 4: ML Pipelines + Flask API** - Train 8 ML models in Jupyter notebooks, deploy Flask prediction API
- [ ] **Phase 5: Reports + ML Integration** - Reports/analytics page with charts, ML predictions surfaced in admin UI (churn badges, readiness scores, recommendations)
- [ ] **Phase 6: Polish + Final Deploy** - Responsive design, Lighthouse accessibility, full Azure deployment with all services connected

## Phase Details

### Phase 1: Foundation + Auth
**Goal**: Users can register, log in (email or Google), and access role-appropriate content on a working application backed by a seeded PostgreSQL database with security headers active
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, AUTH-10, SEC-01, SEC-02, SEC-03, SEC-06
**Success Criteria** (what must be TRUE):
  1. PostgreSQL database exists with all 17 tables created and seeded from CSV data (~8,100 rows loaded)
  2. User can create an account with a 14+ character passphrase, log in, and stay logged in across browser refresh
  3. User can log in via Google OAuth as an alternative to email/password
  4. Admin, donor, and visitor roles exist -- unauthenticated users are blocked from protected routes and CUD endpoints return 401/403
  5. CSP, HSTS, and HTTPS are active in the deployed skeleton -- no secrets exist in source code
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md -- Scaffold backend + frontend, 17 EF Core entities, AppDbContext with indexes, CSV seeder, MUI theme
- [ ] 01-02-PLAN.md -- ASP.NET Identity, AuthController, Google OAuth, MFA, security headers, password policy, test accounts
- [ ] 01-03-PLAN.md -- Frontend auth pages (login/register/MFA/logout), AuthContext, ProtectedRoute, role-gated routing

### Phase 2: Admin CRUD + Dashboard
**Goal**: Case managers can manage all resident and donor data through complete CRUD interfaces, and view an admin dashboard summarizing key metrics
**Depends on**: Phase 1
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, CASE-01, CASE-02, CASE-03, CASE-04, CASE-05, CASE-06, CASE-07, DONR-01, DONR-02, DONR-03, DONR-04, DONR-05, PROC-01, PROC-02, PROC-03, VISIT-01, VISIT-02, VISIT-03, SEC-04, SEC-05
**Success Criteria** (what must be TRUE):
  1. Admin can view, create, edit, and delete resident records with search, filters (safehouse/status/category/risk), sortable columns, pagination, and color-coded risk badges
  2. Admin can view, create, edit, and delete supporter and donation records with pagination
  3. Admin can create, view, edit, and delete counseling session records and home visitation records per resident
  4. Admin dashboard displays 4+ metric cards (total residents, active cases, total donations, reintegration rate), a recent donations table, a residents-needing-attention table, and the OKR gauge
  5. All delete operations show a confirmation dialog, and all form inputs are sanitized against injection
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

### Phase 3: Public Pages + Donor Portal
**Goal**: Visitors can learn about the mission and view anonymized impact data, while authenticated donors can see their own contribution history and impact
**Depends on**: Phase 2
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PORTAL-01, PORTAL-02
**Success Criteria** (what must be TRUE):
  1. Visitor can view landing page with hero section, mission cards, impact statistics, and a "Donate Now" call-to-action
  2. Visitor can view public impact dashboard showing anonymized aggregated data (total residents served, donations received, reintegration rate)
  3. Visitor can access privacy policy page from footer and sees a functional GDPR cookie consent banner
  4. Visitor can toggle dark mode and the preference persists via browser cookie
  5. Donor can log in and view their own donation history and impact summary (no access to other donors' data)
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: ML Pipelines + Flask API
**Goal**: All 8 ML models are trained, documented in executable Jupyter notebooks, and served via a Flask API that the .NET backend can call
**Depends on**: Phase 1 (needs seeded data for training)
**Requirements**: ML-01, ML-02, ML-03, ML-04, ML-05, ML-06, ML-07, ML-08, ML-09, ML-10
**Success Criteria** (what must be TRUE):
  1. All 8 Jupyter notebooks run fully top-to-bottom without errors and produce trained .pkl model files
  2. Flask API is running with 8 prediction endpoints (one per pipeline) that accept input and return predictions
  3. .NET backend can call Flask API endpoints and receive valid prediction responses (donor churn, post effectiveness, reintegration readiness, counseling effectiveness, incident risk, education outcome, donation forecast, safehouse capacity)
  4. Each notebook contains clear documentation of feature engineering, model selection rationale, and performance metrics
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Reports + ML Integration
**Goal**: Admin can view reports with data-driven charts and ML-powered insights are surfaced directly in the admin CRUD pages where they are actionable
**Depends on**: Phase 2, Phase 4
**Requirements**: RPT-01, RPT-02, RPT-03, RPT-04, RPT-05, DONR-06
**Success Criteria** (what must be TRUE):
  1. Admin can view donation trends (line/bar chart over time), resident outcomes (reintegration status breakdown), and safehouse comparison metrics on the reports page
  2. Reports page displays social media posting recommendations from ML Pipeline 2 and counseling effectiveness insights from ML Pipeline 4
  3. Donor list in the donors/contributions page shows ML-predicted churn risk level (Low/Medium/High) as a color-coded badge next to each donor
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 05-01: TBD

### Phase 6: Polish + Final Deploy
**Goal**: The application is responsive, accessible, and fully deployed to Azure with all three services (React, .NET, Flask) connected and test accounts ready for grading
**Depends on**: Phase 3, Phase 5
**Requirements**: A11Y-01, A11Y-02, A11Y-03, A11Y-04, DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04
**Success Criteria** (what must be TRUE):
  1. All pages achieve Lighthouse accessibility score >= 90%
  2. All pages render correctly at desktop (1440px, 1024px), tablet (768px), and mobile (375px) with hamburger menu and responsive tables
  3. Frontend, .NET backend, Flask ML API, and PostgreSQL are all deployed to Azure and communicating correctly
  4. Site is publicly accessible via URL with three working test accounts: admin (no MFA), donor (no MFA, linked to donations), and one MFA-enabled account
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6
Note: Phase 4 depends only on Phase 1 (not Phase 2/3), enabling potential parallel work with Phases 2-3.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Auth | 0/3 | Planned | - |
| 2. Admin CRUD + Dashboard | 0/3 | Not started | - |
| 3. Public Pages + Donor Portal | 0/2 | Not started | - |
| 4. ML Pipelines + Flask API | 0/2 | Not started | - |
| 5. Reports + ML Integration | 0/1 | Not started | - |
| 6. Polish + Final Deploy | 0/2 | Not started | - |

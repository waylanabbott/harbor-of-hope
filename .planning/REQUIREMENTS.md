# Requirements: Harbor of Hope

**Defined:** 2026-04-06
**Core Value:** Case managers can efficiently track residents while donors see their contribution impact -- all secured with proper authentication and RBAC.

## v1 Requirements

### Public Pages

- [ ] **PUB-01**: Visitor can view landing page with hero, mission cards, impact stats, and "Donate Now" CTA
- [ ] **PUB-02**: Visitor can view public impact dashboard with anonymized aggregated data (total residents served, donations received, reintegration rate)
- [ ] **PUB-03**: Visitor can view privacy policy page linked from footer
- [ ] **PUB-04**: Visitor sees GDPR cookie consent banner that is functional (not just cosmetic)
- [ ] **PUB-05**: Visitor can toggle dark mode via browser-accessible cookie

### Authentication & Authorization

- [ ] **AUTH-01**: User can create account with email and password (14+ char passphrase policy)
- [ ] **AUTH-02**: User can log in with email/password and session persists across browser refresh
- [ ] **AUTH-03**: User can log in with Google OAuth (third-party auth)
- [ ] **AUTH-04**: At least one account type has MFA/2FA enabled
- [ ] **AUTH-05**: Admin role can Create, Update, Delete data on all admin pages
- [ ] **AUTH-06**: Donor role can view own donation history and impact only
- [ ] **AUTH-07**: Unauthenticated users can only access public pages (home, impact, privacy, login)
- [ ] **AUTH-08**: All CUD API endpoints require authentication and return 401/403 for unauthorized access
- [ ] **AUTH-09**: Login/auth-check endpoints do NOT require authentication
- [ ] **AUTH-10**: Three test accounts created: admin (no MFA), donor (no MFA, linked to donations), MFA-enabled account

### Admin Dashboard

- [ ] **DASH-01**: Admin can view dashboard with 4+ metric cards (total residents, active cases, total donations, reintegration rate)
- [ ] **DASH-02**: Admin can view recent donations table on dashboard
- [ ] **DASH-03**: Admin can view residents needing attention table on dashboard
- [ ] **DASH-04**: Admin dashboard displays OKR metric (Resident Reintegration Rate) prominently as gauge/number + trend

### Caseload Inventory

- [ ] **CASE-01**: Admin can view paginated table of all residents with sortable columns
- [ ] **CASE-02**: Admin can filter residents by safehouse, status, category, and risk level
- [ ] **CASE-03**: Admin can search residents by name/case number
- [ ] **CASE-04**: Admin can create a new resident record
- [ ] **CASE-05**: Admin can edit an existing resident record
- [ ] **CASE-06**: Admin can delete a resident record with confirmation dialog
- [ ] **CASE-07**: Resident records display risk level with color-coded badges (Critical=red, High=orange, Medium=yellow, Low=green)

### Donors & Contributions

- [ ] **DONR-01**: Admin can view paginated table of all supporters/donors
- [ ] **DONR-02**: Admin can view donation records for each supporter
- [ ] **DONR-03**: Admin can create new supporter and donation records
- [ ] **DONR-04**: Admin can edit supporter and donation records
- [ ] **DONR-05**: Admin can delete supporter/donation records with confirmation dialog
- [ ] **DONR-06**: Donor churn risk level (Low/Medium/High) displayed as badge next to each donor (from ML Pipeline 1)

### Process Recordings

- [ ] **PROC-01**: Admin can create a new counseling session record for a resident
- [ ] **PROC-02**: Admin can view session history per resident
- [ ] **PROC-03**: Admin can edit and delete session records with confirmation

### Home Visitations

- [ ] **VISIT-01**: Admin can log a new home visit for a resident
- [ ] **VISIT-02**: Admin can view visit history per resident
- [ ] **VISIT-03**: Admin can edit and delete visit records with confirmation

### Reports & Analytics

- [ ] **RPT-01**: Admin can view donation trends chart (line/bar chart over time)
- [ ] **RPT-02**: Admin can view resident outcomes chart (reintegration status breakdown)
- [ ] **RPT-03**: Admin can view safehouse comparison metrics
- [ ] **RPT-04**: Admin can view social media posting recommendations card (from ML Pipeline 2)
- [ ] **RPT-05**: Reports page displays counseling effectiveness insights (from ML Pipeline 4)

### Donor Portal

- [ ] **PORTAL-01**: Donor can log in and view their own donation history
- [ ] **PORTAL-02**: Donor can view impact summary of their contributions

### Security

- [ ] **SEC-01**: HTTPS/TLS enabled with valid certificate (HTTP redirects to HTTPS)
- [ ] **SEC-02**: Content-Security-Policy HTTP header set with appropriate directives
- [ ] **SEC-03**: HSTS enabled in production
- [ ] **SEC-04**: Data sanitization / input encoding on all form inputs
- [ ] **SEC-05**: Delete operations require confirmation dialog
- [ ] **SEC-06**: No passwords, API keys, or connection strings in source code (env vars or secrets manager)

### Responsiveness & Accessibility

- [ ] **A11Y-01**: All pages achieve Lighthouse accessibility score >= 90%
- [ ] **A11Y-02**: All pages render correctly at desktop (1440px, 1024px), tablet (768px), and mobile (375px)
- [ ] **A11Y-03**: Navigation uses hamburger menu on mobile
- [ ] **A11Y-04**: Tables use horizontal scroll or card layout on mobile

### Database & Data

- [ ] **DATA-01**: PostgreSQL database with all 17 tables matching the schema
- [ ] **DATA-02**: Database seeded from CSV files (all 17 tables, ~8,100 rows)
- [ ] **DATA-03**: Proper indexes on frequently queried columns

### ML Pipelines

- [ ] **ML-01**: Donor Churn Prediction pipeline (predictive) -- classify donors as at-risk or retained, display risk badges in app
- [ ] **ML-02**: Social Media Post Effectiveness pipeline (explanatory) -- OLS regression on post factors, display posting recommendations in app
- [ ] **ML-03**: Resident Reintegration Readiness pipeline (predictive) -- classify residents by reintegration likelihood, display readiness score in caseload
- [ ] **ML-04**: Counseling Session Effectiveness pipeline (explanatory) -- which session types/interventions drive emotional improvement
- [ ] **ML-05**: Incident Risk Prediction pipeline (predictive) -- predict which residents are at higher risk of incidents
- [ ] **ML-06**: Education Outcome Prediction pipeline (predictive) -- predict education completion/GPA from attendance and engagement
- [ ] **ML-07**: Donation Forecasting pipeline (predictive) -- forecast future donation amounts by period
- [ ] **ML-08**: Safehouse Capacity/Outcomes pipeline (explanatory) -- which safehouse factors drive better resident outcomes
- [ ] **ML-09**: All notebooks fully executable top-to-bottom in Jupyter
- [ ] **ML-10**: ML models served via Flask API endpoints called from .NET backend

### Deployment

- [ ] **DEPLOY-01**: Frontend and backend deployed to Microsoft Azure
- [ ] **DEPLOY-02**: PostgreSQL database deployed to Azure Database for PostgreSQL
- [ ] **DEPLOY-03**: Flask ML API deployed and accessible from .NET backend
- [ ] **DEPLOY-04**: Site publicly accessible via URL

## v2 Requirements

### Enhanced Features (deferred)

- **V2-01**: Real-time notifications for case managers when risk levels change
- **V2-02**: Batch operations on caseload table (bulk status update)
- **V2-03**: Export reports as PDF/CSV
- **V2-04**: Email notifications to donors on new impact milestones
- **V2-05**: Advanced ML model monitoring and retraining pipeline

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat/messaging | Not in spec, high complexity |
| Native mobile app | Web responsive is sufficient per spec |
| Payment processing | No live transactions required |
| File/document uploads | Not in spec requirements |
| Email service integration | Not required for grading |
| Real-time WebSocket updates | Standard REST sufficient for demo |
| Multi-language/i18n | Not in spec |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Pending |
| AUTH-07 | Phase 1 | Pending |
| AUTH-08 | Phase 1 | Pending |
| AUTH-09 | Phase 1 | Pending |
| AUTH-10 | Phase 1 | Pending |
| SEC-01 | Phase 1 | Pending |
| SEC-02 | Phase 1 | Pending |
| SEC-03 | Phase 1 | Pending |
| SEC-06 | Phase 1 | Pending |
| DASH-01 | Phase 2 | Pending |
| DASH-02 | Phase 2 | Pending |
| DASH-03 | Phase 2 | Pending |
| DASH-04 | Phase 2 | Pending |
| CASE-01 | Phase 2 | Pending |
| CASE-02 | Phase 2 | Pending |
| CASE-03 | Phase 2 | Pending |
| CASE-04 | Phase 2 | Pending |
| CASE-05 | Phase 2 | Pending |
| CASE-06 | Phase 2 | Pending |
| CASE-07 | Phase 2 | Pending |
| DONR-01 | Phase 2 | Pending |
| DONR-02 | Phase 2 | Pending |
| DONR-03 | Phase 2 | Pending |
| DONR-04 | Phase 2 | Pending |
| DONR-05 | Phase 2 | Pending |
| PROC-01 | Phase 2 | Pending |
| PROC-02 | Phase 2 | Pending |
| PROC-03 | Phase 2 | Pending |
| VISIT-01 | Phase 2 | Pending |
| VISIT-02 | Phase 2 | Pending |
| VISIT-03 | Phase 2 | Pending |
| SEC-04 | Phase 2 | Pending |
| SEC-05 | Phase 2 | Pending |
| PUB-01 | Phase 3 | Pending |
| PUB-02 | Phase 3 | Pending |
| PUB-03 | Phase 3 | Pending |
| PUB-04 | Phase 3 | Pending |
| PUB-05 | Phase 3 | Pending |
| PORTAL-01 | Phase 3 | Pending |
| PORTAL-02 | Phase 3 | Pending |
| ML-01 | Phase 4 | Pending |
| ML-02 | Phase 4 | Pending |
| ML-03 | Phase 4 | Pending |
| ML-04 | Phase 4 | Pending |
| ML-05 | Phase 4 | Pending |
| ML-06 | Phase 4 | Pending |
| ML-07 | Phase 4 | Pending |
| ML-08 | Phase 4 | Pending |
| ML-09 | Phase 4 | Pending |
| ML-10 | Phase 4 | Pending |
| RPT-01 | Phase 5 | Pending |
| RPT-02 | Phase 5 | Pending |
| RPT-03 | Phase 5 | Pending |
| RPT-04 | Phase 5 | Pending |
| RPT-05 | Phase 5 | Pending |
| DONR-06 | Phase 5 | Pending |
| A11Y-01 | Phase 6 | Pending |
| A11Y-02 | Phase 6 | Pending |
| A11Y-03 | Phase 6 | Pending |
| A11Y-04 | Phase 6 | Pending |
| DEPLOY-01 | Phase 6 | Pending |
| DEPLOY-02 | Phase 6 | Pending |
| DEPLOY-03 | Phase 6 | Pending |
| DEPLOY-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 72 total
- Mapped to phases: 72
- Unmapped: 0

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after roadmap creation (traceability populated)*

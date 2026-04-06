# Requirements: Harbor of Hope

**Defined:** 2026-04-06
**Core Value:** Case managers can efficiently track residents while donors see their contribution impact -- all secured with proper authentication and RBAC.

## v1 Requirements

### Public Pages

- [x] **PUB-01**: Visitor can view landing page with hero, mission cards, impact stats, and "Donate Now" CTA
- [x] **PUB-02**: Visitor can view public impact dashboard with anonymized aggregated data (total residents served, donations received, reintegration rate)
- [x] **PUB-03**: Visitor can view privacy policy page linked from footer
- [x] **PUB-04**: Visitor sees GDPR cookie consent banner that is functional (not just cosmetic)
- [x] **PUB-05**: Visitor can toggle dark mode via browser-accessible cookie

### Authentication & Authorization

- [x] **AUTH-01**: User can create account with email and password (14+ char passphrase policy)
- [x] **AUTH-02**: User can log in with email/password and session persists across browser refresh
- [x] **AUTH-03**: User can log in with Google OAuth (third-party auth)
- [x] **AUTH-04**: At least one account type has MFA/2FA enabled
- [x] **AUTH-05**: Admin role can Create, Update, Delete data on all admin pages
- [x] **AUTH-06**: Donor role can view own donation history and impact only
- [x] **AUTH-07**: Unauthenticated users can only access public pages (home, impact, privacy, login)
- [x] **AUTH-08**: All CUD API endpoints require authentication and return 401/403 for unauthorized access
- [x] **AUTH-09**: Login/auth-check endpoints do NOT require authentication
- [x] **AUTH-10**: Three test accounts created: admin (no MFA), donor (no MFA, linked to donations), MFA-enabled account

### Admin Dashboard

- [x] **DASH-01**: Admin can view dashboard with 4+ metric cards (total residents, active cases, total donations, reintegration rate)
- [x] **DASH-02**: Admin can view recent donations table on dashboard
- [x] **DASH-03**: Admin can view residents needing attention table on dashboard
- [x] **DASH-04**: Admin dashboard displays OKR metric (Resident Reintegration Rate) prominently as gauge/number + trend

### Caseload Inventory

- [x] **CASE-01**: Admin can view paginated table of all residents with sortable columns
- [x] **CASE-02**: Admin can filter residents by safehouse, status, category, and risk level
- [x] **CASE-03**: Admin can search residents by name/case number
- [x] **CASE-04**: Admin can create a new resident record
- [x] **CASE-05**: Admin can edit an existing resident record
- [x] **CASE-06**: Admin can delete a resident record with confirmation dialog
- [x] **CASE-07**: Resident records display risk level with color-coded badges (Critical=red, High=orange, Medium=yellow, Low=green)

### Donors & Contributions

- [x] **DONR-01**: Admin can view paginated table of all supporters/donors
- [x] **DONR-02**: Admin can view donation records for each supporter
- [x] **DONR-03**: Admin can create new supporter and donation records
- [x] **DONR-04**: Admin can edit supporter and donation records
- [x] **DONR-05**: Admin can delete supporter/donation records with confirmation dialog
- [ ] **DONR-06**: Donor churn risk level (Low/Medium/High) displayed as badge next to each donor (from ML Pipeline 1)

### Process Recordings

- [x] **PROC-01**: Admin can create a new counseling session record for a resident
- [x] **PROC-02**: Admin can view session history per resident
- [x] **PROC-03**: Admin can edit and delete session records with confirmation

### Home Visitations

- [x] **VISIT-01**: Admin can log a new home visit for a resident
- [x] **VISIT-02**: Admin can view visit history per resident
- [x] **VISIT-03**: Admin can edit and delete visit records with confirmation

### Reports & Analytics

- [ ] **RPT-01**: Admin can view donation trends chart (line/bar chart over time)
- [ ] **RPT-02**: Admin can view resident outcomes chart (reintegration status breakdown)
- [ ] **RPT-03**: Admin can view safehouse comparison metrics
- [ ] **RPT-04**: Admin can view social media posting recommendations card (from ML Pipeline 2)
- [ ] **RPT-05**: Reports page displays counseling effectiveness insights (from ML Pipeline 4)

### Donor Portal

- [x] **PORTAL-01**: Donor can log in and view their own donation history
- [x] **PORTAL-02**: Donor can view impact summary of their contributions

### Security

- [x] **SEC-01**: HTTPS/TLS enabled with valid certificate (HTTP redirects to HTTPS)
- [x] **SEC-02**: Content-Security-Policy HTTP header set with appropriate directives
- [x] **SEC-03**: HSTS enabled in production
- [x] **SEC-04**: Data sanitization / input encoding on all form inputs
- [x] **SEC-05**: Delete operations require confirmation dialog
- [x] **SEC-06**: No passwords, API keys, or connection strings in source code (env vars or secrets manager)

### Responsiveness & Accessibility

- [ ] **A11Y-01**: All pages achieve Lighthouse accessibility score >= 90%
- [ ] **A11Y-02**: All pages render correctly at desktop (1440px, 1024px), tablet (768px), and mobile (375px)
- [ ] **A11Y-03**: Navigation uses hamburger menu on mobile
- [ ] **A11Y-04**: Tables use horizontal scroll or card layout on mobile

### Database & Data

- [x] **DATA-01**: PostgreSQL database with all 17 tables matching the schema
- [x] **DATA-02**: Database seeded from CSV files (all 17 tables, ~8,100 rows)
- [x] **DATA-03**: Proper indexes on frequently queried columns

### ML Pipelines

- [x] **ML-01**: Donor Churn Prediction pipeline (predictive) -- classify donors as at-risk or retained, display risk badges in app
- [ ] **ML-02**: Social Media Post Effectiveness pipeline (explanatory) -- OLS regression on post factors, display posting recommendations in app
- [x] **ML-03**: Resident Reintegration Readiness pipeline (predictive) -- classify residents by reintegration likelihood, display readiness score in caseload
- [ ] **ML-04**: Counseling Session Effectiveness pipeline (explanatory) -- which session types/interventions drive emotional improvement
- [x] **ML-05**: Incident Risk Prediction pipeline (predictive) -- predict which residents are at higher risk of incidents
- [x] **ML-06**: Education Outcome Prediction pipeline (predictive) -- predict education completion/GPA from attendance and engagement
- [ ] **ML-07**: Donation Forecasting pipeline (predictive) -- forecast future donation amounts by period
- [ ] **ML-08**: Safehouse Capacity/Outcomes pipeline (explanatory) -- which safehouse factors drive better resident outcomes
- [x] **ML-09**: All notebooks fully executable top-to-bottom in Jupyter
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
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| AUTH-06 | Phase 1 | Complete |
| AUTH-07 | Phase 1 | Complete |
| AUTH-08 | Phase 1 | Complete |
| AUTH-09 | Phase 1 | Complete |
| AUTH-10 | Phase 1 | Complete |
| SEC-01 | Phase 1 | Complete |
| SEC-02 | Phase 1 | Complete |
| SEC-03 | Phase 1 | Complete |
| SEC-06 | Phase 1 | Complete |
| DASH-01 | Phase 2 | Complete |
| DASH-02 | Phase 2 | Complete |
| DASH-03 | Phase 2 | Complete |
| DASH-04 | Phase 2 | Complete |
| CASE-01 | Phase 2 | Complete |
| CASE-02 | Phase 2 | Complete |
| CASE-03 | Phase 2 | Complete |
| CASE-04 | Phase 2 | Complete |
| CASE-05 | Phase 2 | Complete |
| CASE-06 | Phase 2 | Complete |
| CASE-07 | Phase 2 | Complete |
| DONR-01 | Phase 2 | Complete |
| DONR-02 | Phase 2 | Complete |
| DONR-03 | Phase 2 | Complete |
| DONR-04 | Phase 2 | Complete |
| DONR-05 | Phase 2 | Complete |
| PROC-01 | Phase 2 | Complete |
| PROC-02 | Phase 2 | Complete |
| PROC-03 | Phase 2 | Complete |
| VISIT-01 | Phase 2 | Complete |
| VISIT-02 | Phase 2 | Complete |
| VISIT-03 | Phase 2 | Complete |
| SEC-04 | Phase 2 | Complete |
| SEC-05 | Phase 2 | Complete |
| PUB-01 | Phase 3 | Complete |
| PUB-02 | Phase 3 | Complete |
| PUB-03 | Phase 3 | Complete |
| PUB-04 | Phase 3 | Complete |
| PUB-05 | Phase 3 | Complete |
| PORTAL-01 | Phase 3 | Complete |
| PORTAL-02 | Phase 3 | Complete |
| ML-01 | Phase 4 | Complete |
| ML-02 | Phase 4 | Pending |
| ML-03 | Phase 4 | Complete |
| ML-04 | Phase 4 | Pending |
| ML-05 | Phase 4 | Complete |
| ML-06 | Phase 4 | Complete |
| ML-07 | Phase 4 | Pending |
| ML-08 | Phase 4 | Pending |
| ML-09 | Phase 4 | Complete |
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

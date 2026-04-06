# Harbor of Hope

## What This Is

A full-stack web application for "Harbor of Hope," a nonprofit operating safe homes for girls who are survivors of trafficking in Central America. The app serves three audiences: case managers who track residents across safehouses, donors who view their contribution impact, and the public who learn about the mission and donate. Built as a BYU INTEX project spanning IS 413 (features), IS 414 (security), and IS 455 (ML/analytics).

## Core Value

Case managers can efficiently track and manage residents across safehouses while donors can see exactly how their contributions create impact — all secured with proper authentication and role-based access.

## Requirements

### Validated

- ✓ Database seeded with all 17 tables from CSV data — Phase 1
- ✓ ASP.NET Identity with RBAC (admin, donor, visitor roles) — Phase 1
- ✓ Google OAuth third-party authentication — Phase 1
- ✓ MFA/2FA on at least one account type — Phase 1
- ✓ HTTPS/TLS with CSP headers and HSTS — Phase 1
- ✓ Admin dashboard with metric cards, tables, and charts — Phase 2
- ✓ Caseload inventory page with filters, search, CRUD, pagination — Phase 2
- ✓ Donors & contributions page with supporter list, donation records, CRUD — Phase 2
- ✓ Process recording page for counseling session notes per resident — Phase 2
- ✓ Home visitation page for logging and viewing visit history — Phase 2
- ✓ Data sanitization on all form inputs — Phase 2
- ✓ OKR metric: Resident Reintegration Rate displayed prominently — Phase 2

### Active

- [ ] Public landing page with hero, mission, impact stats, and donate CTA
- [ ] Public impact dashboard with anonymized aggregated data
- [ ] Reports & analytics page with donation trends and resident outcome charts
- [ ] Privacy policy page with GDPR cookie consent
- [ ] Dark mode toggle using browser cookie
- [ ] Responsive design (desktop + mobile) with Lighthouse accessibility >= 90%
- [ ] 6-8 ML pipelines deployed and integrated into the app
- [ ] Deploy to Microsoft Azure (App Service + Azure PostgreSQL)
- [ ] Donor-facing login showing donation history and impact

### Out of Scope

- Real-time chat/messaging — not required by spec, high complexity
- Mobile native app — web responsive is sufficient
- Payment processing — no live donation transactions required
- Email notifications — not in spec requirements
- File/document uploads — not required for MVP

## Context

**Academic context:** BYU INTEX project due Friday April 10, 2026 at 10:00 AM. Three separate video demos required (IS 413 features, IS 414 security, IS 455 ML). Presentation is 20 min + 5 min Q&A. Team of 4 but building solo with Claude.

**Data:** 17 CSV files (~8,100 rows total) covering safehouses, residents, supporters, donations, process recordings, home visitations, education records, health records, intervention plans, incident reports, social media posts, safehouse metrics, and public impact snapshots. All downloaded to `data/lighthouse_csv_v7/`.

**Personas:**
- Maria (case manager) — manages 15-20 girls across safehouses daily, needs data-dense views
- David (donor) — wants to see impact of contributions, needs trust and transparency

**UI direction:** Warm nonprofit style (Design 2) — coral (#E8735A) primary, cream (#FFF8F0) backgrounds, charcoal (#2D2D2D) text, Nunito font, rounded corners, soft shadows. Empathetic and hopeful feel. Sidebar navigation for admin pages.

**Auth pattern reference:** Class project at `/Users/waylansmac/AuthN and AuthZ/RootkitIdentityW26/` provides the exact ASP.NET Identity setup pattern, including password policy, Google OAuth, cookie config, CORS, HSTS, and security headers.

**ML pipelines (8 total):**
1. Donor Churn Prediction (predictive) — required
2. Social Media Post Effectiveness (explanatory) — required
3. Resident Reintegration Readiness (predictive) — bonus
4. Counseling Session Effectiveness (explanatory) — bonus
5. Incident Risk Prediction (predictive) — extra
6. Education Outcome Prediction (predictive) — extra
7. Donation Forecasting (predictive) — extra
8. Safehouse Capacity/Outcomes (explanatory) — extra

## Constraints

- **Tech stack**: React + TypeScript (Vite) frontend, .NET 10 / C# Web API backend, PostgreSQL, Python ML — specified by course
- **Timeline**: Due April 10, 2026 at 10:00 AM — 4 days from initialization
- **Password policy**: RequiredLength=14, RequireDigit=false, RequireLowercase=false, RequireNonAlphanumeric=false, RequireUppercase=false, RequiredUniqueChars=1 — from IS 414 class
- **Security**: CSP must be HTTP header (not meta tag), HSTS enabled, delete confirmations required
- **Database**: PostgreSQL on Azure (not SQLite in production)
- **ML**: Notebooks must be fully executable top-to-bottom, Jupyter format in `ml-pipelines/` folder
- **Deployment**: Microsoft Azure (App Service + Azure Database for PostgreSQL) — account not yet set up
- **Test accounts**: Must create admin (no MFA), donor (no MFA, linked to donations), and MFA-enabled account before submission

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Warm nonprofit UI (Design 2 style) | Empathetic feel appropriate for the mission; coral/cream palette welcoming for donors | — Pending |
| 8 ML pipelines instead of 2 required | Safety margin — over-deliver to ensure strong ML grade across scenarios | — Pending |
| Follow class auth pattern exactly | RootkitIdentityW26 has proven IS 414 pattern (password policy, Google OAuth, cookies, CORS) | — Pending |
| PostgreSQL from start (no SQLite) | Spec requires real DBMS; avoid migration pain later | — Pending |
| Build entire project solo | Team not contributing code; Claude handles all implementation | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-06 after Phase 2 completion*

# Project Research Summary

**Project:** Harbor of Hope
**Domain:** Nonprofit case management + donor engagement platform (anti-trafficking safehouse context)
**Researched:** 2026-04-06
**Confidence:** HIGH

## Executive Summary

Harbor of Hope is a full-stack nonprofit platform that combines case management (resident tracking, counseling notes, home visitations) with donor engagement (donation history, impact transparency) and predictive ML analytics (8 scikit-learn pipelines). Experts build this type of product as a three-tier architecture: a React SPA for all UI, a .NET Web API for business logic and auth, and a Python Flask microservice for ML inference, all backed by PostgreSQL. The project has a proven reference implementation (RootkitIdentityW26) for the authentication layer, a fixed dataset of 17 CSV files (~8,100 rows), and a hard deadline of April 10 -- a 4-day sprint. The stack is locked by course requirements with no room for deviation on core technologies.

The recommended approach is to front-load all infrastructure: PostgreSQL schema, CSV seeding, ASP.NET Identity auth, and a skeleton Azure deployment on Day 1. This is non-negotiable because every feature depends on the database and authentication. CRUD pages and ML pipelines follow in parallel tracks once the foundation is stable. The warm coral/cream design system (MUI v6 + Nunito font) should be applied from the first component built, not retrofitted later. The architecture should use a single PostgreSQL database with a single merged DbContext (Identity + domain tables) to avoid migration conflicts under time pressure.

The key risks are: (1) CSP headers blocking the React frontend in production (test from Day 1), (2) cookie-based auth failing cross-origin during development (use Vite proxy), (3) Azure deployment failing on the last day (deploy a skeleton on Day 1), and (4) Lighthouse accessibility scoring below 90% due to color contrast issues with the coral palette (darken coral to #D4603F for body text). All four risks are preventable with early action, catastrophic if deferred.

## Key Findings

### Recommended Stack

The stack is locked by course requirements: React 19 + TypeScript + Vite 6 on the frontend, .NET 10 with ASP.NET Identity on the backend, PostgreSQL on Azure, and Flask + scikit-learn for ML serving. The key discretionary choices are MUI v6 (not v7, not Bootstrap) for the component library, Recharts for data visualization, react-hook-form + zod v4 for forms, and CsvHelper for database seeding. These choices optimize for development speed and documentation availability within the 4-day timeline.

**Core technologies (locked):**
- React 19 + TypeScript + Vite 6: Frontend SPA framework and toolchain
- .NET 10 + ASP.NET Identity: Backend API with cookie-based auth and RBAC
- PostgreSQL 16+: Primary database on Azure Flexible Server
- Flask 3.x + scikit-learn 1.6.x: ML model serving (8 pipelines)

**Key discretionary choices:**
- MUI v6: Warm themed component library (NOT v7 -- too new, breaking changes)
- Recharts 3.8.x: Declarative React charting (NOT Nivo or D3)
- react-hook-form + zod v4: Performant forms with type-safe validation
- CsvHelper 33.x: Reliable CSV parsing for 17-table seed

**Critical version constraints:**
- MUI must be v6, not v7 (v7 shipped March 2026, limited docs)
- Vite must be v6, not v8 (too new)
- Npgsql.EFCore.PostgreSQL 10.0.1 requires EF Core >= 10.0.4
- scikit-learn 1.6.x requires Python 3.12 (avoid 3.13+)

### Expected Features

**Must have (table stakes -- all are spec requirements):**
- Database schema + seeding from 17 CSVs (foundation for everything)
- ASP.NET Identity with 3 roles (admin, donor, visitor) + Google OAuth + MFA
- Landing page with hero, mission, impact stats, donate CTA
- Admin dashboard with metric cards, charts, and OKR (reintegration rate)
- Caseload inventory with full CRUD, search, filter, pagination (highest complexity page)
- Donors & contributions with CRUD
- Process recordings and home visitations pages
- Reports & analytics with Recharts visualizations
- Donor portal with donation history and impact view
- Public impact dashboard with anonymized data
- 6-8 ML pipelines deployed and integrated into UI
- Privacy policy + GDPR cookie consent + dark mode toggle
- HTTPS/CSP/HSTS + data sanitization + delete confirmations
- Responsive design + Lighthouse accessibility >= 90%
- Azure deployment (App Service + PostgreSQL)

**Should have (differentiators):**
- All 8 ML pipelines (spec requires 6-8; delivering 8 provides a safety margin)
- ML-powered donor churn risk indicators visible in the donor list UI
- Cohesive warm/empathetic design (coral/cream/Nunito) -- most student projects look generic

**Defer (v2+):**
- Email notifications, file uploads, multi-language support, real-time collaboration

**Anti-features to avoid entirely:**
- Real-time chat, live payment processing, complex donor segmentation engine, i18n

### Architecture Approach

The system follows a standard three-tier architecture: React SPA communicating over HTTPS with cookie auth to a .NET 10 Web API, which proxies ML requests to an internal Flask service. The .NET backend serves the React build as static files in production, eliminating CORS entirely. A single PostgreSQL database holds both ASP.NET Identity tables (auto-prefixed `AspNet*`) and the 17 domain tables. The Flask ML API is an internal service called only by the .NET backend -- never by the browser directly.

**Major components:**
1. **React SPA** (Vite + React Router) -- public pages, admin dashboard, donor portal, all forms and charts
2. **.NET 10 Web API** (ASP.NET Identity + EF Core) -- auth, CRUD controllers grouped by aggregate, ML proxy, CSV seeding
3. **Flask ML API** (scikit-learn + joblib) -- 8 prediction endpoints, models loaded at startup
4. **PostgreSQL** (single Azure Flexible Server) -- Identity tables + 17 domain tables in one database

**Key architectural decisions:**
- Single DbContext merging Identity + domain (avoids dual-context migration conflicts)
- Backend-mediated ML proxy (React never calls Flask directly)
- Cookie-based auth with Vite proxy in dev, same-origin in prod
- Controllers grouped by aggregate/persona, not by table
- DTOs for all API responses (never expose EF entities)

### Critical Pitfalls

1. **CSP headers break React rendering** -- Vite may inject inline scripts that violate strict CSP. Set `build.assetsInlineLimit: 0`, self-host Nunito font, allow `style-src 'unsafe-inline'` for MUI/Recharts. Test CSP from Day 1.
2. **Cookie auth fails cross-origin in development** -- React on port 3000 and .NET on port 5001 are different origins. Use Vite proxy for `/api/*` to make everything same-origin. In production, serve React from .NET (no CORS needed).
3. **EF Core migrations break switching from SQLite to PostgreSQL** -- Never copy reference project migrations. Start fresh with `UseNpgsql()`. Enable `Npgsql.EnableLegacyTimestampBehavior`. Always specify `--context` in migration commands.
4. **17-table CSV seeding fails on foreign key order or date parsing** -- Use runtime seeding (not `HasData()`), CsvHelper for parsing, explicit `DateTime.Parse` with `InvariantCulture`, and seed in strict FK-dependency order.
5. **Azure deployment fails on Day 4 with no time to debug** -- Deploy a skeleton .NET app to Azure on Day 1. Validate database connection with SSL, Google OAuth redirect URIs, and Flask reachability early. Never deploy for the first time on submission day.

## Implications for Roadmap

Based on research, the architecture has clear dependency chains that dictate a 5-phase structure compressed into 4 days. The critical insight is that auth + database must come first, and Azure deployment must be validated early (Day 1), not deferred.

### Phase 1: Foundation + Skeleton Deploy
**Rationale:** Every feature depends on the database schema, seeded data, and authentication. The architecture research shows all CRUD, ML, and analytics features require these to exist. Deploying a skeleton to Azure on Day 1 eliminates the highest-risk pitfall (Pitfall 5: deployment failure).
**Delivers:** Working .NET API with PostgreSQL, all 17 tables created and seeded, ASP.NET Identity with 3 roles, React shell with routing and MUI theme, Vite proxy configured, CSP headers active, skeleton deployed to Azure.
**Addresses features:** Database schema + seeding, auth (Identity + RBAC), project scaffolding, security header baseline.
**Avoids pitfalls:** SQLite-to-PostgreSQL migration disaster (Pitfall 3), CSV seeding failures (Pitfall 4), cookie auth cross-origin issues (Pitfall 2), CSP breaking React (Pitfall 1), Azure deployment failure (Pitfall 5), HSTS localhost poisoning (Pitfall 7), DbContext migration conflicts (Pitfall 10).

### Phase 2: Core CRUD + Admin Dashboard
**Rationale:** Case management CRUD is the highest-complexity, highest-value feature set. It requires auth and seeded data from Phase 1. Admin dashboard aggregates require CRUD data to exist. Building CRUD pages first means the app is demonstrably functional for grading even if later phases run short.
**Delivers:** Resident CRUD with search/filter/pagination, supporter/donation CRUD, process recordings, home visitations, admin dashboard with metric cards and charts.
**Addresses features:** Caseload inventory, donors & contributions, process recordings, home visitations, admin dashboard, delete confirmations, responsive data tables.
**Uses:** MUI DataTable pattern, react-hook-form + zod for all forms, Recharts for dashboard charts, EF Core with `.Include()` for related data (avoids N+1 pitfall).

### Phase 3: Public Pages + Donor Portal + Security
**Rationale:** Public pages (landing, impact dashboard) are independent of admin CRUD and can be built in parallel. Donor portal requires donation data from Phase 2. Google OAuth and MFA are security requirements that should be validated before final deployment.
**Delivers:** Landing page, public impact dashboard, donor dashboard with history and impact, privacy policy page, GDPR cookie consent banner, dark mode toggle, Google OAuth, MFA on admin accounts.
**Addresses features:** Landing page, public impact dashboard, donor portal, privacy policy, cookie consent, dark mode, Google OAuth, MFA/2FA.
**Avoids pitfalls:** Google OAuth redirect URI mismatch (Pitfall 6) -- add Azure redirect URI when implementing.

### Phase 4: ML Pipelines + Integration
**Rationale:** ML models need stable, seeded data for training. The Flask API is additive -- the main app functions without it. Training 8 models in Jupyter notebooks is a parallelizable workstream. Integration into the .NET backend via the ML proxy pattern is straightforward once the Flask API is running.
**Delivers:** 8 trained models (.pkl files), Flask API with 8 prediction endpoints, .NET MlProxyService + PredictionsController, reports & analytics page with ML predictions, donor churn risk indicators in UI.
**Addresses features:** 6-8 ML pipelines, reports & analytics, ML churn indicators on donor list.
**Avoids pitfalls:** Flask unreachable from .NET (Pitfall 8) -- use server-to-server calls, include model files in deployment.

### Phase 5: Polish + Final Deploy
**Rationale:** Security hardening and accessibility are easier to apply to a complete app. Final Azure deployment connects all services. This phase is also the buffer for anything that overran from earlier phases.
**Delivers:** Lighthouse accessibility >= 90% on all pages, input sanitization audit, full Azure deployment with all three services connected, test accounts (admin with MFA, donor, visitor), final CSP/HSTS verification in production.
**Addresses features:** Responsive design, accessibility, data sanitization, Azure deployment (full), warm empathetic UI consistency check.
**Avoids pitfalls:** Lighthouse below 90 (Pitfall 9) -- run audit on every page. Deploy all services together with correct environment variables.

### Phase Ordering Rationale

- **Phase 1 first** because the architecture dependency graph shows every subsequent feature requires database + auth. The pitfalls research identifies 6 of 10 critical pitfalls as Phase 1 issues.
- **Phase 2 before Phase 3** because CRUD pages are the core product and provide the data that the donor portal and public dashboard aggregate. Building CRUD first ensures a gradable product exists even if later phases slip.
- **Phase 3 before Phase 4** because public pages and security (OAuth, MFA) are spec requirements with clear grading weight, while ML integration is additive. Also, ML training benefits from having all application code stable.
- **Phase 4 before Phase 5** because ML integration needs testing time and Flask deployment verification. Polish and final deploy come last as the catch-all.
- **Phase 5 last** because Lighthouse auditing, sanitization review, and final deployment are verification activities that require a complete product.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** CSV seeding order and CsvHelper column mapping for the specific 17 CSV files need careful implementation. The dual-vs-single DbContext decision has strong opinions in the research (recommendation: single context).
- **Phase 4:** ML pipeline specifics (which features to use, model selection per pipeline, how to format prediction results for UI display) need per-model research. The 8 pipeline types span classification, regression, and clustering.

Phases with standard patterns (skip research-phase):
- **Phase 2:** CRUD with EF Core + React forms is extremely well-documented. The reference project provides the exact auth pattern. MUI DataTable and Recharts have extensive examples.
- **Phase 3:** Landing pages, cookie consent banners, and dark mode toggles are commodity patterns. Google OAuth setup is documented step-by-step in Microsoft Learn.
- **Phase 5:** Lighthouse accessibility fixes follow a known checklist. Azure deployment is documented in the reference project and Microsoft tutorials.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies locked by course. Versions verified against npm/NuGet registries and official release notes. Reference project provides proven patterns. |
| Features | HIGH | Feature list derived from spec requirements + competitive analysis of Bloomerang, Blackbaud, CaseWorthy. Every feature mapped to spec requirement or explicit differentiator rationale. |
| Architecture | HIGH | Architecture validated against reference project code. Dual DbContext, cookie auth, ML proxy patterns all proven. CSV seeding order derived from actual FK analysis of the 17 CSV files. |
| Pitfalls | HIGH | 10 critical pitfalls identified from reference project code, official docs, and community reports. Each includes prevention strategy and recovery cost. Phase-to-pitfall mapping is explicit. |

**Overall confidence:** HIGH

### Gaps to Address

- **Exact CSV column-to-entity mapping:** The 17 CSV files need column names mapped to C# entity properties. CsvHelper can auto-map by convention but edge cases (snake_case to PascalCase, nullable fields, date formats) need validation during Phase 1 implementation.
- **ML pipeline feature engineering:** Which columns from which tables feed into each of the 8 ML models is not yet specified. This needs per-pipeline research during Phase 4 planning. The Jupyter notebooks must be fully executable top-to-bottom per spec.
- **Coral color contrast:** The primary coral (#E8735A) fails WCAG contrast on white backgrounds (3.2:1 vs required 4.5:1). The darker alternative (#D4603F at 4.7:1) needs visual validation to ensure it still feels "warm" and not "red."
- **Azure cost/credits:** Azure deployment requires active credits. If the student Azure subscription has limited credits, the PostgreSQL Flexible Server cost needs monitoring. The research does not confirm available credit balance.
- **MFA TOTP testing:** While ASP.NET Identity has built-in TOTP support, the end-to-end flow (QR code generation, authenticator app scan, code verification) needs to be tested with an actual authenticator app before demo day.

## Sources

### Primary (HIGH confidence)
- Reference project: `/Users/waylansmac/AuthN and AuthZ/RootkitIdentityW26/` -- proven auth, CORS, CSP, HSTS patterns
- [Npgsql EF Core 10.0 Release Notes](https://www.npgsql.org/efcore/release-notes/10.0.html) -- PostgreSQL provider features
- [Microsoft Learn: Google OAuth in ASP.NET Core 10](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/google-logins?view=aspnetcore-10.0) -- OAuth setup
- [Microsoft Learn: Azure Flask + PostgreSQL Tutorial](https://learn.microsoft.com/en-us/azure/app-service/tutorial-python-postgresql-app-flask) -- deployment pattern
- [MUI Theming Documentation](https://mui.com/material-ui/customization/theming/) -- createTheme API
- [npm: recharts 3.8.1](https://www.npmjs.com/package/recharts), [npm: zod 4.3.6](https://www.npmjs.com/package/zod), [npm: react-hook-form 7.72.1](https://www.npmjs.com/package/react-hook-form) -- version verification

### Secondary (MEDIUM confidence)
- [Speakeasy: Nivo vs Recharts comparison](https://www.speakeasy.com/blog/nivo-vs-recharts) -- charting library selection
- [codewithmukesh: EF Core 10 Seeding](https://codewithmukesh.com/blog/seeding-initial-data-efcore/) -- seeding patterns
- [Bloomerang: Best Donor Management Software 2026](https://bloomerang.com/blog/donor-management-software/) -- feature landscape
- [CivicTrack: 7 Must-Have Features in Case Management Software](https://www.civictrack.com/post/7-must-have-features-in-case-management-software-for-nonprofits-2026) -- case management expectations
- [Andrew Lock: Cross-origin ASP.NET Core Identity](https://andrewlock.net/making-authenticated-cross-origin-requests-with-aspnetcore-identity/) -- cookie auth patterns

### Tertiary (LOW confidence)
- None -- all findings corroborated by multiple sources

---
*Research completed: 2026-04-06*
*Ready for roadmap: yes*

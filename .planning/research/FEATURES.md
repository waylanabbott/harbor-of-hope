# Feature Research

**Domain:** Nonprofit case management + donor engagement platform (anti-trafficking safehouse context)
**Researched:** 2026-04-06
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or earns a poor grade.

#### Public-Facing

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Landing page with hero, mission, impact stats, donate CTA | Every nonprofit site has this; it is the front door. Donors bounce without a clear value proposition within 5 seconds. | LOW | Use warm coral/cream palette. Hero image, 3-4 impact stat cards, clear CTA button. Static content, fast to build. |
| Privacy policy page | Legal requirement for any site collecting data. GDPR and state laws mandate disclosure. | LOW | Can be templated. Link in footer. |
| GDPR cookie consent banner | Required by law if any non-essential cookies exist (dark mode cookie counts). Non-compliant banners invalidate consent entirely under GDPR. | MEDIUM | Must default non-essential cookies to OFF. Reject-all must be as easy as accept-all (single click). Must be keyboard-navigable and screen-reader accessible per WCAG 2.2. |
| Responsive design (mobile + desktop) | 60%+ of nonprofit web traffic is mobile. Graders will test on multiple viewports. | MEDIUM | Use CSS Grid/Flexbox with mobile-first breakpoints. Sidebar nav collapses to hamburger on mobile. Tables need horizontal scroll or card-based responsive pattern. |
| Lighthouse accessibility >= 90% | Spec requirement. Standard expectation for modern web apps. WCAG 2.2 Level AA is the enforceable standard as of EAA June 2025. | MEDIUM | Requires: 4.5:1 contrast ratios, ARIA labels on interactive elements, keyboard navigation, alt text on images, semantic HTML, proper heading hierarchy. Test early and continuously. |
| HTTPS/TLS with CSP and HSTS | Security baseline for any app handling PII. Azure App Service provides TLS by default. | LOW | CSP must be HTTP header (not meta tag per spec constraint). HSTS tells browsers to always use HTTPS. Configure once in middleware. |
| Data sanitization on all form inputs | Prevents XSS and injection. Table stakes for any app accepting user input. | LOW | Server-side validation on all endpoints. Client-side for UX only. ASP.NET model binding handles much of this, but add explicit sanitization. |

#### Authentication & Authorization

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Login/registration with role-based access | Every multi-user app needs auth. RBAC is standard for case management (case managers see everything; donors see only their data; visitors see only public). | MEDIUM | Three roles: admin, donor, visitor. ASP.NET Identity handles this natively. Follow the class auth pattern from RootkitIdentityW26. |
| Google OAuth | Social login is expected for modern apps. Reduces friction for donor sign-up. Spec requirement. | MEDIUM | Use ASP.NET Identity external login providers. Requires Google Cloud Console setup for client ID/secret. |
| MFA/2FA on at least one account type | Security requirement for apps handling sensitive data (trafficking survivor info). Spec requirement. | MEDIUM | TOTP-based (authenticator app) is simplest. Apply to admin accounts at minimum. ASP.NET Identity has built-in TOTP support. |
| Delete confirmations | Users expect a safety net before destructive actions. Spec requirement. | LOW | Modal dialog with "Are you sure?" before any DELETE operation. Both client-side confirmation and server-side soft-delete consideration. |

#### Admin Case Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Admin dashboard with metric cards and charts | Every case management platform has an at-a-glance overview. Case managers need to see caseload health instantly. | MEDIUM | Key metrics: total residents, total donors, donations this month, reintegration rate (the OKR metric). Use chart library (Recharts) for trends. |
| Caseload inventory (residents) with CRUD, filters, search, pagination | Core of any case management system. A centralized client database is the #1 must-have feature per every source reviewed. Without this, the product has no purpose. | HIGH | Table with sortable columns, text search, filter dropdowns (by safehouse, status, age). Pagination required for 200+ residents. Full CRUD with form validation. This is the most complex single page. |
| Donors & contributions page with CRUD | Standard donor management feature. Case managers need to see who gives, how much, and when. | MEDIUM | Supporter list with donation records. Link donations to donors. Filter by date range, amount. |
| Process recording page (counseling session notes) | Standard in social work case management. Counseling documentation is legally required in most jurisdictions for service-based nonprofits. | MEDIUM | Notes linked to specific resident. Date, counselor, session type, content fields. List view per resident with add/edit. Case note functionality should be flexible: accessible, customizable, and timely. |
| Home visitation page | Standard for community-based nonprofits doing outreach. Social workers document incidents observed, client circumstances, progress, and goals during visits. | MEDIUM | Visit records linked to resident. Date, visitor, location, notes, follow-up actions. List view with filters. |
| Reports & analytics page | Data-driven storytelling is essential for nonprofits in 2026. Reporting reduces admin stress and strengthens funding conversations. | HIGH | Donation trends over time (line chart), resident outcome distributions (bar chart), safehouse capacity (gauge or bar). Aggregated and anonymized where appropriate. |

#### Donor Portal

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Donor login showing donation history | Bloomerang, DonorPerfect, and every major platform include donor portals as a core feature. Donors expect to see their giving history. | MEDIUM | Authenticated view filtered to logged-in donor. Table of donations with date, amount, campaign. Totals and summary stats. |
| Donor impact view | 75% of donors look for impact information before donating. Transparency is the #1 trust builder. | MEDIUM | Show anonymized aggregate outcomes that the donor's contributions supported. Connect donations to programs/safehouses. Charts or infographics preferred over raw numbers. |

### Differentiators (Competitive Advantage)

Features that set this project apart from a baseline INTEX submission. Not required, but valued by graders and demonstrate sophistication.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 8 ML pipelines integrated into the app | Spec requires 6-8. Most teams do 2 required pipelines. Delivering all 8 with clean integration into the UI creates a safety margin and demonstrates ML mastery. | HIGH | 2 required (donor churn, social media effectiveness), 2 bonus (reintegration readiness, counseling effectiveness), 4 extra (incident risk, education outcomes, donation forecasting, safehouse capacity). Each needs: trained model, API endpoint, UI display of predictions/results. |
| Public impact dashboard with anonymized data | Most INTEX projects have a static landing page. A live, data-driven public dashboard showing anonymized aggregated outcomes (reintegration rates, program reach, donation impact) builds trust and is what modern nonprofit transparency looks like. | MEDIUM | Pull from public_impact_snapshots and safehouse_metrics tables. Charts showing trends over time. No PII exposed. This is what Databox, Klipfolio, and real nonprofits recommend for donor trust. |
| Dark mode toggle via browser cookie | Uncommon in INTEX projects. Demonstrates cookie handling, CSS custom properties, and attention to UX preferences. Spec explicitly calls this out. | LOW | Toggle button in header/nav. Store preference in cookie (not localStorage per spec). Use CSS custom properties for theme switching. Ensure both themes pass 4.5:1 contrast ratio. ARIA: aria-pressed on toggle button. |
| OKR metric (Resident Reintegration Rate) displayed prominently | Connecting a specific organizational KPI to the UI shows strategic thinking beyond CRUD. Nonprofits in 2026 are emphasizing quantitative impact, financial efficiency, and beneficiary outcomes as key KPI categories. | LOW | Calculate from resident data. Display as a large, prominent metric on admin dashboard and public impact dashboard. Trend line showing improvement over time. |
| ML-powered donor churn early warning | The American Red Cross saw 80% accuracy flagging at-risk donors with similar approaches. Nonprofits using predictive AI see 20-30% increases in response rates. Showing this in the UI (flagged donors, risk scores) is a strong differentiator. | MEDIUM | Already building the model as required pipeline. The differentiator is the UI integration: color-coded risk indicators on donor list, sortable by churn risk, actionable insights displayed. |
| Warm, empathetic UI design | Most INTEX projects use default Bootstrap or generic Material UI. A cohesive, mission-appropriate design (coral/cream, Nunito font, soft shadows, rounded corners) creates an emotional connection and demonstrates design intentionality. | LOW | Already decided in PROJECT.md. Apply consistently across all pages. The design itself is the differentiator -- most student projects look like student projects. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems, especially under a 4-day deadline.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time chat/messaging | Seems useful for case managers to communicate | Requires WebSocket infrastructure, persistent connections, message queue, notification system. 3-5 day project by itself. Adds massive complexity for minimal demo value. | Already in Out of Scope. If communication is needed, link to external tools or add a simple notes field. |
| Live payment processing | "Donors should be able to donate on the site" | PCI DSS compliance, payment gateway integration (Stripe/PayPal), error handling for financial transactions, refund logic. Legal liability concerns. Not required by spec. | Show donation history and impact. Donation records are seeded data. A "Donate" CTA can link to a placeholder or external page. |
| Email notifications | "Notify donors when their contribution makes impact" | Requires email service (SendGrid/SES), email templates, delivery tracking, unsubscribe management, spam compliance. | Display impact on the donor portal. In-app information is sufficient for demo. |
| File/document uploads | "Case managers should upload files for residents" | File storage (Azure Blob), virus scanning, file type validation, storage costs, upload size limits. | Text-based notes fields for process recordings and visitation logs are sufficient. The spec does not require file uploads. |
| Real-time collaborative editing | "Multiple case managers editing same record" | Requires operational transforms or CRDTs, WebSocket connections, conflict resolution. Extremely complex. | Optimistic concurrency with last-write-wins or version conflict detection is sufficient for a demo. |
| Comprehensive audit trail | "Track every change to every record" | Requires event sourcing or change data capture, significant storage, complex query patterns, retention policies. | Delete confirmations (required by spec) provide the critical safety net. Simple created/updated timestamps on records are sufficient. |
| Complex donor segmentation engine | "Segment donors by 20 different criteria with boolean logic" | Over-engineered for 8,100 rows of data. Complex UI for filter builder. | Simple filter dropdowns (by amount range, date range, frequency) cover the actual use cases. |
| Internationalization (i18n) | "The nonprofit operates in Central America, should support Spanish" | Requires translation management, RTL support consideration, locale-aware formatting. Doubles UI testing burden. | English-only for the demo. The nonprofit staff and donors in the spec are English-speaking. |

## Feature Dependencies

```
[ASP.NET Identity + RBAC]
    |
    |--requires--> [Database schema + seeded data]
    |
    |--enables--> [Admin dashboard]
    |                 |--requires--> [Caseload inventory CRUD]
    |                 |--requires--> [Donors & contributions CRUD]
    |                 |--requires--> [Reports & analytics]
    |
    |--enables--> [Donor portal]
    |                 |--requires--> [Donor login]
    |                 |--requires--> [Donation history view]
    |                 |--requires--> [Impact view]
    |
    |--enables--> [Google OAuth]
    |--enables--> [MFA/2FA]

[Database schema + seeded data]
    |--enables--> [All CRUD pages]
    |--enables--> [ML pipelines (need training data)]
    |--enables--> [Public impact dashboard]
    |--enables--> [Reports & analytics]

[ML pipelines (Python)]
    |--requires--> [Database with seeded data]
    |--produces--> [Trained models + API endpoints]
    |--enables--> [ML predictions in admin dashboard]
    |--enables--> [Donor churn indicators on donor list]

[Landing page + public pages]
    |--independent (no auth required)
    |--enhanced-by--> [Public impact dashboard]

[Dark mode toggle]
    |--independent (CSS + cookie, no backend dependency)
    |--must-work-with--> [All pages]

[Cookie consent banner]
    |--must-load-before--> [Dark mode cookie]
    |--independent of backend]

[HTTPS/CSP/HSTS]
    |--infrastructure-level (configure once)]
    |--must-be-active-for--> [All pages]
```

### Dependency Notes

- **Auth requires database:** ASP.NET Identity tables must exist before any login works. Database seeding is the very first backend task.
- **All CRUD requires auth:** Every admin page needs role checking. Build auth before building pages.
- **ML requires seeded data:** Models cannot be trained without the 17 CSV tables loaded. Database seeding must precede ML work.
- **Reports require CRUD data:** Analytics pages aggregate data from the tables that CRUD pages manage. Build CRUD first, reports second.
- **Public pages are independent:** Landing page, privacy policy, and cookie consent have zero backend dependencies. Can be built in parallel with backend work.
- **Dark mode is independent:** Pure frontend feature (CSS variables + cookie). Can be implemented at any time and applied globally.
- **Cookie consent must precede dark mode cookie:** If cookie consent is implemented, the dark mode cookie should respect the consent state. However, dark mode is a functional/preference cookie, not a tracking cookie -- many implementations exempt it from consent requirements.

## MVP Definition

### Launch With (v1 -- Due April 10)

All of these are spec requirements. Missing any risks grade penalties.

- [ ] Database schema + seeded data from 17 CSVs -- foundation for everything
- [ ] ASP.NET Identity with 3 roles (admin, donor, visitor) -- gates all authenticated features
- [ ] Google OAuth + MFA/2FA on admin accounts -- spec security requirements
- [ ] Landing page with hero, mission, impact stats, donate CTA -- public face
- [ ] Admin dashboard with metric cards + OKR (reintegration rate) -- admin entry point
- [ ] Caseload inventory with CRUD, search, filter, pagination -- core case management
- [ ] Donors & contributions with CRUD -- core donor management
- [ ] Process recording page -- counseling documentation
- [ ] Home visitation page -- visit logging
- [ ] Reports & analytics with charts -- data storytelling
- [ ] Donor portal with donation history + impact view -- donor experience
- [ ] Public impact dashboard -- transparency and trust
- [ ] Privacy policy page + GDPR cookie consent -- legal compliance
- [ ] Dark mode toggle via cookie -- spec requirement
- [ ] HTTPS/TLS, CSP headers, HSTS -- security baseline
- [ ] Data sanitization on all inputs -- security baseline
- [ ] Responsive design with Lighthouse accessibility >= 90% -- accessibility requirement
- [ ] Delete confirmations on all destructive actions -- security requirement
- [ ] 6-8 ML pipelines deployed + integrated into app -- ML requirement
- [ ] Deploy to Azure (App Service + PostgreSQL) -- deployment requirement

### Add After Validation (v1.x)

Not needed for submission but would improve the product if time permits.

- [ ] Loading skeletons on data-heavy pages -- better perceived performance
- [ ] Export to CSV/PDF on reports page -- common request from case managers
- [ ] Bulk operations on caseload inventory -- efficiency for large caseloads
- [ ] More granular role permissions (e.g., read-only case manager) -- operational flexibility

### Future Consideration (v2+)

Features to defer until after submission deadline.

- [ ] Email notifications for donors -- requires email service integration
- [ ] File uploads for case documentation -- requires blob storage
- [ ] Multi-language support (Spanish) -- doubles UI work
- [ ] Real-time collaboration on case notes -- extreme complexity

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Database schema + seeding | HIGH | MEDIUM | P1 |
| Auth (Identity + RBAC + OAuth + MFA) | HIGH | MEDIUM | P1 |
| Landing page | HIGH | LOW | P1 |
| Caseload inventory CRUD | HIGH | HIGH | P1 |
| Donors & contributions CRUD | HIGH | MEDIUM | P1 |
| Admin dashboard with metrics | HIGH | MEDIUM | P1 |
| Process recording page | MEDIUM | MEDIUM | P1 |
| Home visitation page | MEDIUM | MEDIUM | P1 |
| Reports & analytics | HIGH | HIGH | P1 |
| Donor portal (history + impact) | HIGH | MEDIUM | P1 |
| Public impact dashboard | HIGH | MEDIUM | P1 |
| ML pipelines (8 total) | HIGH | HIGH | P1 |
| Privacy policy + cookie consent | MEDIUM | LOW | P1 |
| Dark mode toggle | LOW | LOW | P1 |
| HTTPS/CSP/HSTS | HIGH | LOW | P1 |
| Responsive design + accessibility | HIGH | MEDIUM | P1 |
| Delete confirmations | MEDIUM | LOW | P1 |
| Data sanitization | HIGH | LOW | P1 |
| Azure deployment | HIGH | MEDIUM | P1 |
| Warm empathetic UI design | MEDIUM | LOW | P2 |
| ML churn risk indicators in donor list | MEDIUM | LOW | P2 |
| Loading skeletons | LOW | LOW | P3 |
| CSV/PDF export | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for submission (spec requirement)
- P2: Should have, adds differentiation value
- P3: Nice to have, defer if time-constrained

## Competitor Feature Analysis

| Feature | Bloomerang | Blackbaud RE NXT | CaseWorthy | Our Approach |
|---------|------------|------------------|------------|--------------|
| Donor database + history | Full CRM with retention scoring | Enterprise donor management | Basic donor tracking | Donors & contributions page with CRUD, linked to ML churn prediction |
| Donor portal | Self-service portal with giving history | Limited portal, mostly admin-facing | No donor portal | Authenticated donor view with history + anonymized impact metrics |
| Case management | Not a case management tool | Not a case management tool | Full case management with intake, assessment, outcomes | Caseload inventory with CRUD, process recordings, home visitations, resident tracking |
| Impact reporting | Donation reports and retention dashboards | Extensive reporting suite | Program outcome tracking | Public impact dashboard (anonymized) + admin reports & analytics with charts |
| ML/AI analytics | Basic donor insights | Wealth screening, predictive giving | No ML | 8 ML pipelines covering donor behavior, resident outcomes, operational forecasting |
| Role-based access | Admin roles for staff | Granular permissions | Role-based case access | 3-tier RBAC (admin, donor, visitor) with ASP.NET Identity |
| Dark mode | No | No | No | Cookie-based dark mode toggle -- uncommon differentiator |
| Accessibility | Varies | Enterprise compliance | Basic | Lighthouse >= 90% target with WCAG 2.2 Level AA practices |

**Key insight:** No single competitor combines case management AND donor management AND ML analytics in one platform. Blackbaud and Bloomerang focus on donors; CaseWorthy focuses on cases. Our platform bridges both domains, which is unusual and demonstrates the breadth of the spec requirements.

## Sources

- [7 Must-Have Features in Case Management Software for Nonprofits (2026)](https://www.civictrack.com/post/7-must-have-features-in-case-management-software-for-nonprofits-2026) -- case management feature expectations
- [Nonprofit Case Management Software: Top 5 Solutions in 2026](https://www.societ.com/blog/nonprofit-resources/nonprofit-case-management-software-top-5-solutions/) -- centralized client database as #1 feature
- [The 18+ Best Donor Management Software Options for 2026](https://bloomerang.com/blog/donor-management-software/) -- donor management feature landscape
- [Best 13 Donor Management Software Platforms: 2026 Guide](https://neonone.com/resources/blog/donor-management-software/) -- AI-driven analytics becoming standard
- [The Ultimate Guide to Nonprofit Dashboards](https://databox.com/nonprofit-kpi-dashboard) -- KPI categories and dashboard best practices
- [Real-Time Charity Monitoring: Building Effective Impact Dashboards](https://www.fireflygiving.com/blog/real-time-charity-monitoring-building-effective-impact-dashboards-for-nonprofits/) -- impact dashboard patterns
- [How to Improve Nonprofit Transparency](https://donorbox.org/nonprofit-blog/nonprofit-transparency) -- 75% of donors check impact before donating
- [Machine Learning Guide: Maximizing Nonprofit Impact Through Predictive Analytics](https://www.fireflygiving.com/blog/machine-learning-guide-maximizing-nonprofit-impact-through-predictive-analytics/) -- ML in nonprofit context
- [Machine Learning Donor Retention: Strategies for Nonprofits](https://bluewing.co/blog/machine-learning-donor-retention-strategies-for-nonprofits/) -- donor churn prediction approaches
- [Web Accessibility (WCAG) and Cookie Banners: The 2026 Compliance Checklist](https://cookie-script.com/guides/web-accessibility-and-cookie-banners-compliance-checklist) -- WCAG 2.2 cookie consent requirements
- [Cookie Banner Design 2026 | Compliance & UX Best Practices](https://secureprivacy.ai/blog/cookie-banner-design-2026) -- reject-all must be single click
- [3 Steps to GDPR Compliance for Nonprofit Websites (2026)](https://morweb.org/post/3-steps-gdpr-compliance-nonprofit-website) -- GDPR requirements for nonprofits
- [Data Security in Case Management](https://www.planstreet.com/data-security-in-case-management-protecting-sensitive-information) -- RBAC and security for case data

---
*Feature research for: Nonprofit case management + donor engagement platform*
*Researched: 2026-04-06*

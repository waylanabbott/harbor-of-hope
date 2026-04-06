---
phase: 03-public-pages-donor-portal
plan: 02
subsystem: ui
tags: [react, mui, recharts, landing-page, donor-portal, dark-mode, cookie-consent, routing]

requires:
  - phase: 03-public-pages-donor-portal-plan-01
    provides: PublicController, DonorPortalController, API modules, TypeScript types, ThemeModeProvider, DarkModeToggle, CookieConsentBanner, Footer
  - phase: 02-admin-crud-dashboard
    provides: AppLayout with AdminSidebar, App.tsx routing, MetricCard component
provides:
  - LandingPage with hero, mission cards, live impact stats, and donate CTA
  - PublicImpactPage with 4 Recharts charts (health scores, donations, residents, education)
  - PrivacyPolicyPage with Harbor of Hope specific privacy content
  - DonorDashboard with impact summary cards and allocation breakdown table
  - DonorHistoryPage with paginated donation history table
  - AppLayout with DarkModeToggle, Footer, CookieConsentBanner, and role-aware navigation
  - Full routing for all public and donor pages
affects: [05-reports-ml-integration, 06-polish-final-deploy]

tech-stack:
  added: []
  patterns: [public page pattern with useEffect data fetching from publicApi, donor page pattern with authenticated fetching from donorPortalApi, role-aware nav links in AppLayout, Recharts chart pattern with ResponsiveContainer inside Paper]

key-files:
  created:
    - frontend/src/pages/public/LandingPage.tsx
    - frontend/src/pages/public/PublicImpactPage.tsx
    - frontend/src/pages/public/PrivacyPolicyPage.tsx
    - frontend/src/pages/donor/DonorDashboard.tsx
    - frontend/src/pages/donor/DonorHistoryPage.tsx
  modified:
    - frontend/src/components/layout/AppLayout.tsx
    - frontend/src/App.tsx

key-decisions:
  - "LandingPage uses linear-gradient overlay on hero.png for readable white text over background image"
  - "PublicImpactPage filters null-metric snapshots and sorts by month ascending for chronological charts"
  - "DonorDashboard uses inline Card components instead of MetricCard for layout flexibility with 4-column grid"
  - "AppLayout renders Footer and CookieConsentBanner outside conditional admin/public branch so they appear on all pages"

patterns-established:
  - "Public page pattern: Container + useEffect fetch + loading CircularProgress + error state"
  - "Donor page pattern: same as public but data fetched from donorPortalApi (authenticated)"
  - "Chart page pattern: Paper wrapper with Typography title + ResponsiveContainer(height=300) + Recharts component"
  - "Role-aware nav: derive isAdmin/isDonor from authSession.roles, conditionally show nav Button links"

requirements-completed: [PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PORTAL-01, PORTAL-02]

duration: 5min
completed: 2026-04-06
---

# Phase 3 Plan 2: Public Pages + Donor Portal Summary

**5 page components (Landing, Impact, Privacy, Donor Dashboard, Donor History) with Recharts charts, role-aware navigation, and full routing wired into AppLayout**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-06T20:30:00Z
- **Completed:** 2026-04-06T20:38:47Z
- **Tasks:** 3 (2 auto + 1 human-verify)
- **Files modified:** 7

## Accomplishments

- LandingPage renders hero section with background image, 3 mission cards, 4 live impact stats from PublicController, and a donate CTA section
- PublicImpactPage renders 4 Recharts charts (health scores, donations, residents, education) from anonymized impact snapshot data
- PrivacyPolicyPage displays Harbor of Hope specific privacy policy with cookie types, data security, and user rights sections
- DonorDashboard shows impact summary cards (total donated, donation count, first/latest dates) and allocation breakdown table
- DonorHistoryPage shows donation history table with date, type, campaign, amount, and recurring status
- AppLayout updated with DarkModeToggle in AppBar, Footer on all pages, CookieConsentBanner, and role-aware navigation (admin/donor/visitor)
- All routes wired: /, /impact, /privacy, /donor/dashboard, /donor/donations with ProtectedRoute for donor pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Public pages -- LandingPage, PublicImpactPage, PrivacyPolicyPage** - `1a380fa` (feat)
2. **Task 2: Donor portal pages, AppLayout update, and App.tsx routing** - `aeb77a2` (feat)
3. **Task 3: Visual verification of all Phase 3 requirements** - Human verified: approved (no commit, checkpoint task)

## Files Created/Modified

- `frontend/src/pages/public/LandingPage.tsx` - Hero section, mission cards, live impact stats from API, donate CTA
- `frontend/src/pages/public/PublicImpactPage.tsx` - 4 Recharts charts with anonymized monthly impact data and recent updates
- `frontend/src/pages/public/PrivacyPolicyPage.tsx` - Harbor of Hope specific privacy policy content
- `frontend/src/pages/donor/DonorDashboard.tsx` - Donor impact summary with metric cards and allocation table
- `frontend/src/pages/donor/DonorHistoryPage.tsx` - Donor donation history in a table with recurring status chips
- `frontend/src/components/layout/AppLayout.tsx` - Added DarkModeToggle, Footer, CookieConsentBanner, role-aware nav links
- `frontend/src/App.tsx` - Wired all 5 new pages into routing with ProtectedRoute for donor pages

## Decisions Made

- LandingPage uses linear-gradient overlay on hero.png for readable white text over background image
- PublicImpactPage filters out snapshots where all metric fields are null and sorts by month ascending for chronological charts
- DonorDashboard uses inline Card components instead of reusing MetricCard for more layout flexibility with the 4-column grid
- AppLayout renders Footer and CookieConsentBanner outside the conditional admin/public branch so they appear on all pages including admin

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All public-facing pages complete -- visitors can view landing page, impact dashboard, and privacy policy
- Donor portal complete -- authenticated donors can view their donation history and impact summary
- Phase 3 fully complete (both plans) -- ready for Phase 4 (ML Pipelines) or Phase 5 (Reports + ML Integration)
- Dark mode, cookie consent, and Footer are active on all pages
- All 7 Phase 3 requirements (PUB-01 through PUB-05, PORTAL-01, PORTAL-02) verified by human testing

## Self-Check: PASSED

- All 7 files verified present on disk (5 created, 2 modified)
- Both task commits (1a380fa, aeb77a2) verified in git log
- Task 3 human-verify checkpoint approved
- No stubs detected in any created/modified files

---
*Phase: 03-public-pages-donor-portal*
*Completed: 2026-04-06*

---
phase: 03-public-pages-donor-portal
plan: 01
subsystem: api, ui
tags: [dotnet, react, dark-mode, cookie-consent, mui-theme, public-api, donor-portal]

requires:
  - phase: 01-foundation-auth
    provides: ASP.NET Identity with RBAC, AppDbContext, AuthPolicies, apiFetch, MUI theme
  - phase: 02-admin-crud-dashboard
    provides: DashboardController pattern, existing DTOs and controllers
provides:
  - PublicController with unauthenticated stats and impact endpoints
  - DonorPortalController with donor-authenticated donation history and impact endpoints
  - DonorOnly authorization policy
  - Frontend TypeScript types for public and donor data
  - API modules (publicApi.ts, donorPortalApi.ts) using apiFetch
  - Dark mode theming with getDesignTokens(mode) and ThemeModeProvider
  - Cookie consent banner gating non-essential cookies
  - DarkModeToggle and Footer components
affects: [03-02-public-pages-donor-portal, 05-deployment]

tech-stack:
  added: [react-cookie-consent, js-cookie, @types/js-cookie]
  patterns: [getDesignTokens(mode) for light/dark theme, ThemeModeProvider context wrapping app, cookie consent gating non-essential cookies, public API controller without Authorize attribute, donor API deriving SupporterId from authenticated user]

key-files:
  created:
    - backend/HarborOfHope.API/Controllers/PublicController.cs
    - backend/HarborOfHope.API/Controllers/DonorPortalController.cs
    - backend/HarborOfHope.API/DTOs/PublicStatsDto.cs
    - backend/HarborOfHope.API/DTOs/PublicImpactSnapshotDto.cs
    - backend/HarborOfHope.API/DTOs/DonorDonationDto.cs
    - backend/HarborOfHope.API/DTOs/DonorImpactDto.cs
    - backend/HarborOfHope.API/DTOs/AllocationSummaryDto.cs
    - frontend/src/types/PublicImpact.ts
    - frontend/src/types/DonorPortal.ts
    - frontend/src/lib/publicApi.ts
    - frontend/src/lib/donorPortalApi.ts
    - frontend/src/context/ThemeContext.tsx
    - frontend/src/components/ui/CookieConsentBanner.tsx
    - frontend/src/components/ui/DarkModeToggle.tsx
    - frontend/src/components/layout/Footer.tsx
  modified:
    - backend/HarborOfHope.API/Data/AuthPolicies.cs
    - backend/HarborOfHope.API/Program.cs
    - frontend/src/theme.ts
    - frontend/src/main.tsx
    - frontend/package.json

key-decisions:
  - "MetricPayloadJson parsed server-side by replacing single quotes with double quotes -- no raw Python dicts sent to frontend"
  - "Dark mode cookie only persists when cookie consent is accepted via hasConsent() gate"
  - "ThemeModeProvider replaces static ThemeProvider in main.tsx, internally wrapping ThemeProvider + CssBaseline"
  - "Default theme export kept for backward compatibility during transition"

patterns-established:
  - "Public API pattern: controller without [Authorize] attribute for unauthenticated endpoints"
  - "Donor API pattern: derive SupporterId from UserManager.GetUserAsync(User), never from request params"
  - "Theme mode pattern: getDesignTokens(mode) returns ThemeOptions, ThemeModeProvider wraps app"
  - "Cookie consent pattern: hasConsent() checks getCookieConsentValue before Cookies.set"

requirements-completed: [PUB-02, PUB-04, PUB-05, PORTAL-01, PORTAL-02]

duration: 3min
completed: 2026-04-06
---

# Phase 3 Plan 1: Backend APIs + Frontend Infrastructure Summary

**Public/Donor API controllers with dark mode theming, cookie consent, and typed API modules for the public pages and donor portal**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-06T20:22:23Z
- **Completed:** 2026-04-06T20:26:14Z
- **Tasks:** 2
- **Files modified:** 21

## Accomplishments

- PublicController exposes aggregated stats and parsed impact snapshots without authentication (no PII)
- DonorPortalController provides authenticated donation history and impact summary, deriving SupporterId from the logged-in user
- Dark mode toggle with cookie persistence gated by GDPR cookie consent banner
- Theme refactored from static to dynamic getDesignTokens(mode) supporting light and dark palettes
- All frontend types, API modules, and components created for Plan 02 to consume

## Task Commits

Each task was committed atomically:

1. **Task 1: Backend APIs -- PublicController, DonorPortalController, DTOs, DonorOnly policy** - `0d0dc2c` (feat)
2. **Task 2: Frontend infrastructure -- npm deps, types, API modules, dark mode, cookie consent, Footer** - `61706e8` (feat)

## Files Created/Modified

- `backend/HarborOfHope.API/Data/AuthPolicies.cs` - Added DonorOnly policy constant
- `backend/HarborOfHope.API/Program.cs` - Registered DonorOnly authorization policy
- `backend/HarborOfHope.API/DTOs/PublicStatsDto.cs` - Aggregated public stats DTO
- `backend/HarborOfHope.API/DTOs/PublicImpactSnapshotDto.cs` - Impact snapshot with parsed metrics
- `backend/HarborOfHope.API/DTOs/DonorDonationDto.cs` - Donor donation history DTO
- `backend/HarborOfHope.API/DTOs/DonorImpactDto.cs` - Donor impact summary DTO
- `backend/HarborOfHope.API/DTOs/AllocationSummaryDto.cs` - Allocation breakdown DTO
- `backend/HarborOfHope.API/Controllers/PublicController.cs` - Unauthenticated public data endpoints
- `backend/HarborOfHope.API/Controllers/DonorPortalController.cs` - Donor-authenticated endpoints
- `frontend/src/types/PublicImpact.ts` - TypeScript types for public stats and impact snapshots
- `frontend/src/types/DonorPortal.ts` - TypeScript types for donor donations and impact
- `frontend/src/lib/publicApi.ts` - API module for public data fetching
- `frontend/src/lib/donorPortalApi.ts` - API module for donor portal data fetching
- `frontend/src/theme.ts` - Refactored to getDesignTokens(mode) with light/dark palettes
- `frontend/src/context/ThemeContext.tsx` - ThemeModeProvider and useThemeMode with consent-gated cookie persistence
- `frontend/src/components/ui/CookieConsentBanner.tsx` - GDPR cookie consent with accept/decline
- `frontend/src/components/ui/DarkModeToggle.tsx` - Sun/moon icon toggle for dark mode
- `frontend/src/components/layout/Footer.tsx` - Footer with copyright and privacy policy link
- `frontend/src/main.tsx` - Replaced static ThemeProvider with ThemeModeProvider
- `frontend/package.json` - Added react-cookie-consent, js-cookie, @types/js-cookie

## Decisions Made

- MetricPayloadJson parsed server-side by replacing single quotes with double quotes -- no raw Python dicts sent to frontend
- Dark mode cookie only persists when cookie consent is accepted via hasConsent() gate
- ThemeModeProvider replaces static ThemeProvider in main.tsx, internally wrapping ThemeProvider + CssBaseline
- Default theme export kept in theme.ts for backward compatibility during transition

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All backend endpoints ready for Plan 02 page components to consume
- All frontend types, API modules, and UI infrastructure ready for Plan 02
- ThemeModeProvider and CookieConsentBanner can be used by any component immediately
- DarkModeToggle ready to be placed in AppBar by Plan 02
- Footer ready to be placed in AppLayout by Plan 02

## Self-Check: PASSED

- All 15 created files verified present on disk
- Both task commits (0d0dc2c, 61706e8) verified in git log
- Backend builds with 0 errors
- Frontend TypeScript compiles with 0 errors

---
*Phase: 03-public-pages-donor-portal*
*Completed: 2026-04-06*

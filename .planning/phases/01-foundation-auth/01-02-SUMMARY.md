---
phase: 01-foundation-auth
plan: 02
subsystem: auth, api
tags: [aspnet-identity, postgresql, google-oauth, mfa, totp, csp, hsts, cookie-auth, rbac]

# Dependency graph
requires:
  - phase: 01-foundation-auth/01
    provides: "17-table EF Core domain model (AppDbContext) with PostgreSQL, .NET 10 API project"
provides:
  - ASP.NET Identity with PostgreSQL (AuthIdentityDbContext on identity schema)
  - ApplicationUser with SupporterId property for donor linking
  - AuthController with 11 endpoints (session, OAuth, MFA management)
  - Cookie-based auth (HttpOnly, SameSite=Lax, Secure=Always, 7-day sliding)
  - Password policy (14 char passphrase, no complexity requirements)
  - Google OAuth conditional configuration
  - MFA/TOTP setup and verification endpoints
  - SecurityHeaders middleware (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
  - HSTS in non-development environments
  - 3 test accounts seeded at startup (admin, donor, mfa)
  - CORS configured for frontend origin with credentials
affects: [01-foundation-auth, 02-admin-donor-pages, 03-public-analytics, 05-integration-polish, 06-deploy-final]

# Tech tracking
tech-stack:
  added: [Microsoft.AspNetCore.Identity.EntityFrameworkCore 10.0.5, Microsoft.AspNetCore.Authentication.Google 10.0.5]
  patterns: [cookie-based session auth with 401/403 API responses, conditional Google OAuth registration, security headers middleware with Swagger exemption, design-time DbContext factory for Identity migrations]

key-files:
  created:
    - backend/HarborOfHope.API/Data/ApplicationUser.cs
    - backend/HarborOfHope.API/Data/AuthIdentityDbContext.cs
    - backend/HarborOfHope.API/Data/AuthRoles.cs
    - backend/HarborOfHope.API/Data/AuthPolicies.cs
    - backend/HarborOfHope.API/Data/AuthIdentityGenerator.cs
    - backend/HarborOfHope.API/Data/AuthIdentityDbContextFactory.cs
    - backend/HarborOfHope.API/Controllers/AuthController.cs
    - backend/HarborOfHope.API/Infrastructure/SecurityHeaders.cs
    - backend/HarborOfHope.API/Migrations/Identity/ (3 migration files)
  modified:
    - backend/HarborOfHope.API/Program.cs
    - backend/HarborOfHope.API/HarborOfHope.API.csproj
    - backend/HarborOfHope.API/appsettings.Development.json
    - .gitignore

key-decisions:
  - "Cookie auth returns 401/403 instead of redirect for API calls (SPA pattern)"
  - "Connection string moved from appsettings.Development.json to dotnet user-secrets (SEC-06)"
  - "All test accounts use same password HarborOfHope2026! for grading simplicity"
  - "External OAuth users default to Donor role"
  - "Design-time factory added for AuthIdentityDbContext (same pattern as AppDbContext)"
  - "Fixed gitignore data/ to /data/ so backend Data/ directory is not ignored on case-insensitive macOS"

patterns-established:
  - "AuthController uses primary constructor injection for UserManager, SignInManager, IConfiguration"
  - "SecurityHeaders middleware skips CSP on Swagger paths in development"
  - "Identity uses separate schema (identity) on same PostgreSQL database as app data"
  - "Google OAuth conditionally registered only when credentials are configured"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-08, AUTH-09, AUTH-10, SEC-01, SEC-02, SEC-03, SEC-06]

# Metrics
duration: 5min
completed: 2026-04-06
---

# Phase 01 Plan 02: Identity + Auth Pipeline Summary

**ASP.NET Identity with cookie auth, AuthController (11 endpoints for session/OAuth/MFA), SecurityHeaders middleware (CSP/HSTS), password policy (14-char passphrase), and 3 seeded test accounts on PostgreSQL**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-06T18:28:01Z
- **Completed:** 2026-04-06T18:33:00Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- Built complete ASP.NET Identity auth system with 11 API endpoints covering login, registration, logout, session check, Google OAuth flow, and MFA management
- Configured IS 414 security requirements: 14-char password policy, HttpOnly/Secure/Lax cookies, CSP via HTTP header, HSTS in production, X-Frame-Options DENY
- Created 3 test accounts (admin@harbor.local, donor@harbor.local, mfa@harbor.local) with role assignments seeded at startup
- Moved connection string out of source code into dotnet user-secrets

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Identity DbContext, ApplicationUser, roles, policies, AuthIdentityGenerator, and SecurityHeaders middleware** - `340699f` (feat)
2. **Task 2: Create AuthController, update Program.cs with full auth pipeline, generate Identity migration** - `c876eba` (feat)

## Files Created/Modified

### Created
- `backend/HarborOfHope.API/Data/ApplicationUser.cs` - Extended IdentityUser with SupporterId for donor linking
- `backend/HarborOfHope.API/Data/AuthIdentityDbContext.cs` - Identity DbContext using identity schema on PostgreSQL
- `backend/HarborOfHope.API/Data/AuthRoles.cs` - Admin and Donor role constants
- `backend/HarborOfHope.API/Data/AuthPolicies.cs` - AdminOnly policy constant
- `backend/HarborOfHope.API/Data/AuthIdentityGenerator.cs` - Seeds 3 test accounts with roles at startup
- `backend/HarborOfHope.API/Data/AuthIdentityDbContextFactory.cs` - Design-time factory for Identity migrations
- `backend/HarborOfHope.API/Controllers/AuthController.cs` - 11 endpoints: me, login, register, logout, providers, external-login, external-callback, manage/2fa, manage/2fa/setup, manage/2fa/verify, manage/2fa/disable
- `backend/HarborOfHope.API/Infrastructure/SecurityHeaders.cs` - CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy middleware
- `backend/HarborOfHope.API/Migrations/Identity/` - InitIdentity migration (3 files)

### Modified
- `backend/HarborOfHope.API/Program.cs` - Full auth pipeline: Identity, Google OAuth, password policy, cookie config, CORS, HSTS, SecurityHeaders, seeding
- `backend/HarborOfHope.API/HarborOfHope.API.csproj` - Added Identity.EntityFrameworkCore and Authentication.Google packages, user-secrets ID
- `backend/HarborOfHope.API/appsettings.Development.json` - Removed connection string (moved to user-secrets)
- `.gitignore` - Fixed data/ to /data/ for case-insensitive filesystem compatibility

## Decisions Made
- **Cookie auth returns 401/403 instead of redirect**: SPA pattern -- API should return status codes, not HTML redirects. Added OnRedirectToLogin (401) and OnRedirectToAccessDenied (403) handlers.
- **Connection string in user-secrets**: SEC-06 compliance. Removed from appsettings.Development.json, stored via `dotnet user-secrets set`.
- **All test accounts use same password (HarborOfHope2026!)**: Simplifies grading demos. All three accounts use the same 14+ char passphrase.
- **External OAuth defaults to Donor role**: Self-registered users (both email and OAuth) get Donor role by default.
- **Design-time factory for AuthIdentityDbContext**: Required for `dotnet ef migrations add` to work without starting full application.
- **Fixed gitignore data/ pattern**: macOS case-insensitive filesystem caused `data/` to match `Data/`. Changed to `/data/` (root-only).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] gitignore data/ pattern blocking backend Data/ directory**
- **Found during:** Task 1 (git add failed)
- **Issue:** The `data/` pattern in .gitignore matched `backend/HarborOfHope.API/Data/` on macOS (case-insensitive filesystem)
- **Fix:** Changed `data/` to `/data/` so it only matches the root-level data directory
- **Files modified:** .gitignore
- **Verification:** `git check-ignore` confirms backend Data files are no longer ignored
- **Committed in:** 340699f (Task 1 commit)

**2. [Rule 3 - Blocking] Missing design-time factory for AuthIdentityDbContext**
- **Found during:** Task 2 (migration generation)
- **Issue:** `dotnet ef migrations add` requires a design-time factory since Program.cs uses runtime configuration
- **Fix:** Created AuthIdentityDbContextFactory implementing IDesignTimeDbContextFactory
- **Files modified:** backend/HarborOfHope.API/Data/AuthIdentityDbContextFactory.cs
- **Verification:** Migration generated successfully
- **Committed in:** c876eba (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking issues)
**Impact on plan:** Both fixes were necessary to complete the planned work. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## Known Stubs
None -- all endpoints are fully implemented with real Identity service calls. No placeholder data or hardcoded responses.

## User Setup Required

**Google OAuth requires manual configuration.** To enable Google login:
1. Create OAuth 2.0 Client ID at Google Cloud Console -> APIs & Services -> Credentials
2. Add `http://localhost:5001/signin-google` to Authorized redirect URIs
3. Store credentials:
   ```bash
   cd backend/HarborOfHope.API
   dotnet user-secrets set "Authentication:Google:ClientId" "<your-client-id>"
   dotnet user-secrets set "Authentication:Google:ClientSecret" "<your-client-secret>"
   ```
4. Google OAuth is conditionally enabled -- the app works without credentials (login/register still function).

## Next Phase Readiness
- Auth backbone complete: Identity, RBAC, session management, OAuth, MFA all configured
- Frontend auth pages (Plan 03) can call all 11 AuthController endpoints
- Admin pages can use [Authorize(Policy = "AdminOnly")] for protection
- Donor pages can use [Authorize(Roles = "Donor")] and filter by SupporterId
- SecurityHeaders active on all responses (CSP, X-Frame-Options, etc.)
- Google OAuth ready pending credential configuration

## Self-Check: PASSED

- All 8 key created files verified present
- Migrations/Identity/ directory verified present (3 files)
- Commit 340699f verified in git log
- Commit c876eba verified in git log
- Backend `dotnet build` succeeds with 0 errors, 0 warnings
- AuthController has 11 endpoints verified
- Program.cs middleware order verified correct

---
*Phase: 01-foundation-auth*
*Completed: 2026-04-06*

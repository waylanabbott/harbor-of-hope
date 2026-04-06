# Phase 3: Public Pages + Donor Portal - Research

**Researched:** 2026-04-06
**Domain:** Public-facing pages (landing, impact dashboard, privacy, cookie consent, dark mode) + authenticated donor portal (donation history, impact summary)
**Confidence:** HIGH

## Summary

Phase 3 builds the public-facing half of the application and the donor portal. The public pages require NO authentication and serve visitors who want to learn about Harbor of Hope's mission and see anonymized impact data. The donor portal requires Donor role authentication and lets authenticated donors see their own donation history and the impact of their contributions.

The existing codebase already provides most infrastructure: MUI theme (coral/cream/Nunito), AuthContext with role-based session data (including `supporterId` on the session), ProtectedRoute with Donor role support, a DashboardController that computes aggregated stats, an `apiFetch` helper, a Vite proxy, reusable MetricCard and ReintegrationGauge components, and 50 rows of `public_impact_snapshots` data with anonymized monthly metrics (health scores, education progress, total residents, donation totals). The key addition is the public-facing API endpoints (no `[Authorize]`), new frontend pages, cookie consent infrastructure, and dark mode toggle.

**Primary recommendation:** Build two new backend controllers -- `PublicController` (no auth, returns aggregated/anonymized stats from existing tables) and `DonorPortalController` (Donor auth, returns donations filtered by the logged-in user's `supporterId`). On the frontend, add 5 new pages (Landing, PublicImpact, PrivacyPolicy, DonorDashboard, DonorHistory), install `react-cookie-consent` and `js-cookie`, create a ThemeContext for dark mode toggle via cookie, and wire a GDPR cookie consent banner that functionally blocks non-essential cookies until consent is given.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PUB-01 | Landing page with hero, mission cards, impact stats, "Donate Now" CTA | Existing hero.png asset, MetricCard component reusable, PublicController returns aggregated stats. Standard MUI landing page with Box/Container/Grid/Card/Button components. |
| PUB-02 | Public impact dashboard with anonymized aggregated data | `public_impact_snapshots` table has 50 rows of monthly anonymized data with metric_payload_json. PublicController endpoint returns this data. Recharts (already installed) for trend charts. |
| PUB-03 | Privacy policy page linked from footer | Static content page. Must be customized to Harbor of Hope (not generic placeholder). Add Footer component to AppLayout with link. |
| PUB-04 | GDPR cookie consent banner (functional, not cosmetic) | react-cookie-consent v10.0.1 with enableDeclineButton + onAccept/onDecline callbacks. Must block dark mode cookie until consent. getCookieConsentValue for checking consent state. |
| PUB-05 | Dark mode toggle via browser cookie | js-cookie v3.0.5 for read/write. ThemeContext wrapping ThemeProvider with two createTheme variants. Cookie NOT httpOnly (browser-accessible). MUI palette.mode: 'dark'/'light'. |
| PORTAL-01 | Donor can log in and view own donation history | ApplicationUser.SupporterId already exists, donor test account has SupporterId=1. DonorPortalController filters donations by supporterId from auth claims. |
| PORTAL-02 | Donor can view impact summary of their contributions | DonorPortalController computes sum of donations, allocation breakdown by safehouse/program area, count of donations. Uses existing DonationAllocation join data. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

The CLAUDE.md file directs all work through GSD workflows. Key constraints:
- Use GSD entry points (`/gsd:quick`, `/gsd:debug`, `/gsd:execute-phase`) for all file changes
- Do not make direct repo edits outside a GSD workflow unless explicitly asked
- Tech stack locked: React 19 + TypeScript + Vite 6, .NET 10 backend, PostgreSQL
- MUI v6 (not v7), Recharts for charts
- Cookie auth with native fetch + credentials:include (not axios -- note: axios IS in package.json but apiFetch uses native fetch)
- Auth API uses native fetch with credentials:include for cookie transport
- CSP header already set via SecurityHeaders middleware
- HSTS guarded by IsDevelopment() check

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @mui/material | ^6.5.0 | UI components for all pages | Installed |
| @emotion/react + @emotion/styled | ^11.14.x | CSS-in-JS for MUI | Installed |
| recharts | ^3.8.1 | Charts for public impact dashboard | Installed |
| react-router-dom | ^7.14.0 | Client-side routing | Installed |
| @mui/icons-material | ^6.5.0 | Icons for landing page, nav | Installed |

### New Dependencies (must install)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-cookie-consent | 10.0.1 | GDPR cookie consent banner | Drop-in banner component with accept/decline callbacks, customizable styling, getCookieConsentValue for checking consent. 700K+ weekly downloads. |
| js-cookie | 3.0.5 | Read/write browser cookies | Dark mode cookie must be browser-accessible (not httpOnly). Lightweight (2KB), TypeScript support via @types/js-cookie. |
| @types/js-cookie | 3.0.6 | TypeScript definitions for js-cookie | Required for TypeScript compilation. |

**Installation:**
```bash
cd frontend
npm install react-cookie-consent js-cookie
npm install -D @types/js-cookie
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-cookie-consent | Custom banner | Custom misses edge cases: consent expiry, cookie name conflicts, decline flow. Not worth hand-rolling for a 4-day sprint. |
| js-cookie | document.cookie directly | js-cookie handles encoding, path/domain options, SameSite. document.cookie is error-prone. |
| Separate dark theme object | MUI colorSchemes API | colorSchemes is newer MUI feature, adds complexity. Two separate createTheme calls with palette.mode is simpler and well-documented. |

## Architecture Patterns

### New File Structure
```
frontend/src/
  components/
    layout/
      AppLayout.tsx          # MODIFY: add Footer, dark mode toggle in AppBar
      AdminSidebar.tsx       # UNCHANGED
      Footer.tsx             # NEW: privacy policy link, site info
    ui/
      CookieConsentBanner.tsx # NEW: wraps react-cookie-consent
      DarkModeToggle.tsx     # NEW: IconButton with sun/moon icon
  context/
    AuthContext.tsx           # UNCHANGED
    ThemeContext.tsx          # NEW: dark mode state + cookie persistence
  pages/
    public/
      LandingPage.tsx         # NEW: hero, mission cards, impact stats, CTA
      PublicImpactPage.tsx    # NEW: anonymized charts + stats
      PrivacyPolicyPage.tsx   # NEW: Harbor of Hope privacy policy
    donor/
      DonorDashboard.tsx      # NEW: replaces placeholder, impact summary
      DonorHistoryPage.tsx    # NEW: donation history table
  lib/
    publicApi.ts              # NEW: fetch public stats (no auth)
    donorPortalApi.ts         # NEW: fetch donor-specific data
  types/
    PublicImpact.ts           # NEW: types for public endpoint responses
    DonorPortal.ts            # NEW: types for donor portal responses
  theme.ts                    # MODIFY: export light AND dark theme creators

backend/HarborOfHope.API/
  Controllers/
    PublicController.cs       # NEW: [AllowAnonymous] endpoints for public data
    DonorPortalController.cs  # NEW: [Authorize] with Donor policy
  DTOs/
    PublicImpactDto.cs        # NEW: response DTOs for public endpoints
    DonorPortalDto.cs         # NEW: response DTOs for donor portal
  Data/
    AuthPolicies.cs           # MODIFY: add DonorOnly policy
```

### Pattern 1: Public API Controller (No Auth)
**What:** A controller that returns aggregated/anonymized data without requiring authentication.
**When to use:** PUB-01 (impact stats on landing) and PUB-02 (public impact dashboard).
**Why important:** The existing DashboardController has `[Authorize(Policy = AuthPolicies.AdminOnly)]`. Public endpoints MUST NOT be behind auth. Create a separate controller.

```csharp
[ApiController]
[Route("api/[controller]")]
public class PublicController(AppDbContext db) : ControllerBase
{
    // No [Authorize] attribute -- this is intentionally public

    [HttpGet("stats")]
    public async Task<ActionResult<PublicStatsDto>> GetPublicStats()
    {
        var totalResidents = await db.Residents.CountAsync();
        var totalDonations = await db.Donations.SumAsync(d => d.Amount);
        var completedReintegrations = await db.Residents
            .CountAsync(r => r.ReintegrationStatus == "Completed");

        return Ok(new PublicStatsDto
        {
            TotalResidentsServed = totalResidents,
            TotalDonationsReceived = totalDonations,
            SuccessfulReintegrations = completedReintegrations
        });
    }

    [HttpGet("impact")]
    public async Task<ActionResult<List<PublicImpactSnapshotDto>>> GetImpactSnapshots()
    {
        var snapshots = await db.PublicImpactSnapshots
            .Where(s => s.IsPublished)
            .OrderByDescending(s => s.SnapshotDate)
            .Select(s => new PublicImpactSnapshotDto
            {
                SnapshotDate = s.SnapshotDate,
                Headline = s.Headline,
                SummaryText = s.SummaryText,
                MetricPayloadJson = s.MetricPayloadJson
            })
            .ToListAsync();

        return Ok(snapshots);
    }
}
```

### Pattern 2: Donor Portal Controller (Donor Auth + SupporterId Filtering)
**What:** Controller that uses the logged-in user's SupporterId claim to filter data.
**When to use:** PORTAL-01 and PORTAL-02.
**Critical insight:** The `ApplicationUser.SupporterId` is already returned by `GET /api/auth/me`. The DonorPortalController must retrieve the current user from Identity, read their SupporterId, and filter donations by it. If SupporterId is null, return empty (user is not linked to a supporter record).

```csharp
[ApiController]
[Route("api/donor")]
[Authorize(Policy = AuthPolicies.DonorOnly)]  // NEW policy
public class DonorPortalController(
    AppDbContext db,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet("donations")]
    public async Task<ActionResult<List<DonorDonationDto>>> GetMyDonations()
    {
        var user = await userManager.GetUserAsync(User);
        if (user?.SupporterId == null) return Ok(new List<DonorDonationDto>());

        var donations = await db.Donations
            .Where(d => d.SupporterId == user.SupporterId)
            .OrderByDescending(d => d.DonationDate)
            .Select(d => new DonorDonationDto
            {
                DonationId = d.DonationId,
                Amount = d.Amount,
                DonationType = d.DonationType,
                DonationDate = d.DonationDate,
                CampaignName = d.CampaignName,
                IsRecurring = d.IsRecurring
            })
            .ToListAsync();

        return Ok(donations);
    }

    [HttpGet("impact")]
    public async Task<ActionResult<DonorImpactDto>> GetMyImpact()
    {
        var user = await userManager.GetUserAsync(User);
        if (user?.SupporterId == null)
            return Ok(new DonorImpactDto());

        var supporterId = user.SupporterId.Value;

        var totalDonated = await db.Donations
            .Where(d => d.SupporterId == supporterId)
            .SumAsync(d => d.Amount);

        var donationCount = await db.Donations
            .CountAsync(d => d.SupporterId == supporterId);

        // Get allocation breakdown (how donations were distributed)
        var allocations = await db.DonationAllocations
            .Where(da => da.Donation != null && da.Donation.SupporterId == supporterId)
            .Include(da => da.Safehouse)
            .GroupBy(da => new { da.Safehouse!.Name, da.ProgramArea })
            .Select(g => new AllocationSummaryDto
            {
                SafehouseName = g.Key.Name,
                ProgramArea = g.Key.ProgramArea,
                TotalAllocated = g.Sum(a => a.AmountAllocated)
            })
            .ToListAsync();

        return Ok(new DonorImpactDto
        {
            TotalDonated = totalDonated,
            DonationCount = donationCount,
            Allocations = allocations
        });
    }
}
```

### Pattern 3: Dark Mode Toggle with Cookie Persistence
**What:** ThemeContext provides theme mode state + toggle function. Reads initial value from `js-cookie`, writes to cookie on toggle. Cookie is NOT httpOnly (browser-accessible per spec).
**When to use:** PUB-05.

```typescript
// ThemeContext.tsx
import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Cookies from 'js-cookie';
import { getDesignTokens } from '../theme';

interface ThemeContextValue {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = Cookies.get('darkMode');
    return saved === 'true' ? 'dark' : 'light';
  });

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      Cookies.set('darkMode', String(next === 'dark'), {
        expires: 365,
        sameSite: 'Lax',
        // NOT httpOnly -- must be browser-accessible per spec
      });
      return next;
    });
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be inside ThemeModeProvider');
  return context;
}
```

### Pattern 4: GDPR Cookie Consent (Functional, Not Cosmetic)
**What:** Cookie consent banner that blocks non-essential cookies until the user accepts. The dark mode cookie is "non-essential" -- it must only be set AFTER consent is given.
**When to use:** PUB-04.
**Critical distinction:** "Functional" means: (1) banner stores consent state in its own cookie, (2) non-essential cookies are NOT set until user accepts, (3) if user declines, non-essential cookies are removed.

```typescript
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent';

// Check if consent was given before setting any non-essential cookie
export function hasConsent(): boolean {
  return getCookieConsentValue('harborCookieConsent') === 'true';
}

// In the CookieConsentBanner component:
<CookieConsent
  location="bottom"
  cookieName="harborCookieConsent"
  enableDeclineButton
  declineButtonText="Decline"
  buttonText="Accept"
  onAccept={() => {
    // Non-essential cookies can now be set
    // Dark mode preference will persist on next toggle
  }}
  onDecline={() => {
    // Remove any non-essential cookies
    Cookies.remove('darkMode');
  }}
  style={{ background: '#2D2D2D' }}
  buttonStyle={{ background: '#E8735A', color: '#fff', borderRadius: 24 }}
  declineButtonStyle={{ background: 'transparent', border: '1px solid #fff', color: '#fff', borderRadius: 24 }}
>
  We use cookies to enhance your experience. Essential cookies are required
  for the site to function. Non-essential cookies help us remember your
  preferences like dark mode.
</CookieConsent>
```

**Integration with dark mode:** The `toggleMode` function in ThemeContext must check `hasConsent()` before writing the cookie. If no consent, dark mode still toggles visually (in-memory state) but does NOT persist to a cookie.

### Pattern 5: Donor-Aware Navigation in AppLayout
**What:** AppLayout must show different nav links based on role: Admin sees "Dashboard" linking to /admin/dashboard, Donor sees "My Dashboard" linking to /donor/dashboard. Unauthenticated users see "Home" and "Login".
**When to use:** Modifying AppLayout.

```typescript
// In AppLayout, after auth is loaded:
const isAdmin = authSession.roles.includes('Admin');
const isDonor = authSession.roles.includes('Donor');

// Nav links:
// - Always: Home
// - If Admin: Dashboard (admin), other admin links in sidebar
// - If Donor: My Dashboard, My Donations
// - If unauthenticated: Login, Register
```

### Anti-Patterns to Avoid
- **Reusing DashboardController for public data:** DashboardController is admin-only. Do NOT remove `[Authorize]` or add `[AllowAnonymous]` to it. Create a separate PublicController.
- **Exposing PII in public endpoints:** Public endpoints must NEVER return individual resident names, supporter names, or any personally identifiable information. Only aggregated counts and averages.
- **Setting darkMode cookie before consent:** The cookie consent requirement is FUNCTIONAL. Dark mode toggle must check consent state before persisting to cookie. In-memory toggle is fine without consent.
- **Making donor portal show other donors' data:** DonorPortalController MUST filter by the authenticated user's SupporterId. Never accept a supporterId from the request -- always derive from the auth context.
- **httpOnly on dark mode cookie:** Spec explicitly requires browser-accessible cookie. Do NOT set httpOnly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie consent UI + logic | Custom banner + cookie management | react-cookie-consent | Handles consent state, cookie expiry, accept/decline callbacks, SSR safety. Edge cases around cookie domain, path, SameSite are already solved. |
| Cookie read/write | document.cookie parsing | js-cookie | document.cookie is a semicolon-delimited string. Parsing it manually misses encoding, domain scoping, and expiry management. |
| Dark mode theming | Manual CSS class toggle | MUI createTheme with palette.mode | MUI automatically adjusts ALL component colors (background, paper, text, dividers) for dark mode. Manual approach would require overriding dozens of components. |
| Impact data charts | SVG/Canvas from scratch | Recharts (already installed) | Recharts provides responsive containers, tooltips, legends, and animations. Already installed and used in admin dashboard. |
| Privacy policy content | Generic "lorem ipsum" | Customized Harbor of Hope policy | Spec explicitly requires customized content, not a generic placeholder. |

## Common Pitfalls

### Pitfall 1: Dark Mode Cookie Set Before Consent
**What goes wrong:** Dark mode toggle writes a cookie immediately. Grader tests cookie consent by clearing cookies, declining consent, toggling dark mode, and checking if a cookie was set. It was -- GDPR violation.
**Why it happens:** Developer treats dark mode cookie as "essential" when it is clearly a preference cookie.
**How to avoid:** ThemeContext toggleMode checks `hasConsent()` before calling `Cookies.set()`. Dark mode state lives in React state (in-memory) regardless -- cookie is only for persistence.
**Warning signs:** Cookie appears in DevTools even after declining consent.

### Pitfall 2: Public API Accidentally Leaks PII
**What goes wrong:** PublicController returns individual supporter names, donation amounts per person, or resident details. This violates privacy requirements and potentially GDPR.
**Why it happens:** Developer copies query patterns from admin controllers that include names.
**How to avoid:** Public endpoints return ONLY: aggregate counts (total residents served), aggregate sums (total donations received), percentages (reintegration rate), and data from `public_impact_snapshots` table which is pre-anonymized. NEVER join to supporters or residents by name.
**Warning signs:** Public API response contains any `name`, `email`, or `caseControlNo` field.

### Pitfall 3: Donor Portal Returns All Donations Instead of User's Own
**What goes wrong:** Donor logs in and sees ALL donations in the system instead of just theirs.
**Why it happens:** Developer forgets to filter by SupporterId, or uses a supporterId from query params instead of from the authenticated user.
**How to avoid:** DonorPortalController ALWAYS reads SupporterId from `userManager.GetUserAsync(User).SupporterId`. Never accept it as a route or query parameter.
**Warning signs:** Donor sees hundreds of donations when supporter #1 has ~7 donations in the seed data.

### Pitfall 4: ThemeProvider Wrapped Wrong -- Dark Mode Doesn't Apply
**What goes wrong:** Dark mode toggle changes state but UI doesn't update. Or it updates the App but not the CssBaseline.
**Why it happens:** ThemeProvider must wrap CssBaseline to control background color. If ThemeProvider is below CssBaseline in the component tree, background stays light.
**How to avoid:** ThemeModeProvider wraps BOTH ThemeProvider AND CssBaseline. In main.tsx, replace the static `<ThemeProvider>` with `<ThemeModeProvider>` which internally renders both.
**Warning signs:** Text colors change but background stays cream/white.

### Pitfall 5: Footer Not Visible on Admin Pages
**What goes wrong:** Footer renders on public pages but not admin pages because admin pages use the sidebar layout with flex:1 on the content area.
**Why it happens:** AppLayout has two branches: admin (sidebar + content) and public (Container + Outlet). Footer must appear in BOTH branches.
**How to avoid:** Place Footer outside the conditional branch, at the bottom of the AppLayout Box, after both the admin and public content areas.
**Warning signs:** Privacy policy link missing when navigating admin pages.

### Pitfall 6: DonorOnly Policy Not Registered
**What goes wrong:** DonorPortalController returns 403 for ALL users including donors.
**Why it happens:** AuthPolicies only defines AdminOnly. The DonorOnly policy is never registered in Program.cs.
**How to avoid:** Add `options.AddPolicy("DonorOnly", policy => policy.RequireRole(AuthRoles.Donor));` in Program.cs AddAuthorization block. Alternatively, use `[Authorize(Roles = "Donor")]` attribute directly (skips policy registration).
**Warning signs:** Donor login works but /api/donor/* returns 403.

### Pitfall 7: metric_payload_json is Python Dict String Not JSON
**What goes wrong:** Frontend tries to JSON.parse the metric_payload_json field and gets a syntax error.
**Why it happens:** The CSV data uses Python dict format with single quotes: `{'month': '2023-01', ...}` instead of valid JSON `{"month": "2023-01", ...}`.
**How to avoid:** Either parse on the backend (replace single quotes with double quotes and convert to proper JSON), or return parsed DTO fields directly from the backend. Preferred: parse in the C# controller and return typed DTO fields.
**Warning signs:** `SyntaxError: Unexpected token '` in browser console when rendering impact charts.

## Code Examples

### Landing Page Hero Section (PUB-01)
```typescript
// LandingPage.tsx -- hero section with mission + CTA
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import heroImage from '../../assets/hero.png';

// Hero section
<Box
  sx={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    py: { xs: 8, md: 12 },
    textAlign: 'center',
  }}
>
  <Container maxWidth="md">
    <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
      Harbor of Hope
    </Typography>
    <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
      Safe homes for girls who are survivors of trafficking in Central America
    </Typography>
    <Button
      variant="contained"
      size="large"
      href="#donate"
      sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
    >
      Donate Now
    </Button>
  </Container>
</Box>
```

### Public Impact Chart with Recharts (PUB-02)
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Data from /api/public/impact endpoint (parsed metric_payload_json)
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={snapshots}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="avgHealthScore" stroke="#5B8C7A" name="Avg Health Score" />
    <Line type="monotone" dataKey="donationsTotal" stroke="#E8735A" name="Monthly Donations ($)" />
  </LineChart>
</ResponsiveContainer>
```

### Dark Theme Design Tokens (PUB-05)
```typescript
// theme.ts -- export function for both modes
export function getDesignTokens(mode: 'light' | 'dark') {
  return {
    palette: {
      mode,
      primary: { main: '#E8735A' },
      secondary: { main: '#5B8C7A' },
      ...(mode === 'light'
        ? {
            background: { default: '#FFF8F0', paper: '#FFFFFF' },
            text: { primary: '#2D2D2D', secondary: '#6B6B6B' },
          }
        : {
            background: { default: '#121212', paper: '#1E1E1E' },
            text: { primary: '#FFFFFF', secondary: '#B0B0B0' },
          }),
    },
    typography: {
      fontFamily: '"Nunito", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      // ... same as current
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light'
              ? '0 2px 12px rgba(0,0,0,0.08)'
              : '0 2px 12px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiButton: {
        styleOverrides: { root: { borderRadius: 24 } },
      },
    },
  };
}
```

### DonorOnly Policy Registration
```csharp
// In Program.cs AddAuthorization block
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthPolicies.AdminOnly, policy => policy.RequireRole(AuthRoles.Admin));
    options.AddPolicy(AuthPolicies.DonorOnly, policy => policy.RequireRole(AuthRoles.Donor));
});

// In AuthPolicies.cs
public static class AuthPolicies
{
    public const string AdminOnly = "AdminOnly";
    public const string DonorOnly = "DonorOnly";
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MUI palette.mode in createTheme | MUI colorSchemes API | MUI v6 | colorSchemes is more automatic but adds complexity. For this project, direct palette.mode is simpler and well-documented. Use palette.mode. |
| Generic placeholder privacy policy | Customized per-org policy | GDPR requirement | Must reference Harbor of Hope by name, describe data collected, explain cookie usage, provide contact info. |
| Cosmetic cookie banners | Functional cookie consent | GDPR enforcement | Banner must actually block non-essential cookies until consent given. Not just a dismissible notification. |

## Open Questions

1. **"Donate Now" CTA destination**
   - What we know: PUB-01 requires a "Donate Now" CTA button
   - What's unclear: No payment processing is in scope (explicitly out of scope). The button needs a destination.
   - Recommendation: Link to an anchor section on the landing page with a message like "Contact us to contribute" or link to a placeholder /donate page that explains how to donate (mail, phone, etc.). Do NOT build payment processing.

2. **Supporter #1 donation count**
   - What we know: donor@harbor.local has SupporterId=1, which maps to "Mila Alvarez" in supporters.csv
   - What's unclear: Exactly how many donations supporter #1 has in the seed data
   - Recommendation: Query will work regardless of count. If supporter #1 has few or no donations, the portal still renders correctly with empty states.

3. **metric_payload_json format**
   - What we know: CSV stores Python-format dicts with single quotes
   - What's unclear: Whether the seeder stored them as-is or converted to valid JSON
   - Recommendation: Backend should parse and return typed DTO fields. If JSON parsing fails, fall back to string replacement of single quotes before parsing.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual browser testing (no automated test framework set up) |
| Config file | none |
| Quick run command | Manual: open browser, navigate to pages |
| Full suite command | Manual: test all 7 requirements end-to-end |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PUB-01 | Landing page renders hero, mission cards, stats, CTA | manual | Navigate to / in browser | N/A |
| PUB-02 | Public impact dashboard shows anonymized data + charts | manual | Navigate to /impact in browser | N/A |
| PUB-03 | Privacy policy page accessible from footer link | manual | Click footer link, verify content | N/A |
| PUB-04 | Cookie consent banner blocks non-essential cookies | manual | Clear cookies, reload, decline, check no darkMode cookie set | N/A |
| PUB-05 | Dark mode toggle changes theme, persists via cookie | manual | Toggle dark mode, check document.cookie, refresh page | N/A |
| PORTAL-01 | Donor sees own donation history after login | manual | Login as donor@harbor.local, navigate to /donor/dashboard | N/A |
| PORTAL-02 | Donor sees impact summary of contributions | manual | Verify total donated, allocation breakdown on donor dashboard | N/A |

### Sampling Rate
- **Per task commit:** Manual browser check of affected pages
- **Per wave merge:** Full manual walkthrough of all 7 requirements
- **Phase gate:** All 7 requirements manually verified before `/gsd:verify-work`

### Wave 0 Gaps
None -- no automated test infrastructure exists in this project. All validation is manual browser testing. This is acceptable for a 4-day academic sprint.

## Environment Availability

Step 2.6: No new external dependencies beyond what is already available. All tools are npm packages installed locally.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js + npm | Frontend build | Yes | (already used) | -- |
| .NET 10 SDK | Backend build | Yes | (already used) | -- |
| PostgreSQL | Database | Yes | (already used) | -- |
| react-cookie-consent | PUB-04 | No (not installed yet) | 10.0.1 (npm) | npm install |
| js-cookie | PUB-05 | No (not installed yet) | 3.0.5 (npm) | npm install |

**Missing dependencies with no fallback:** None
**Missing dependencies with fallback:** react-cookie-consent and js-cookie are npm packages to install -- trivial, no risk.

## Sources

### Primary (HIGH confidence)
- Existing codebase: All files in `/Users/waylansmac/INTEX 2026/` -- examined theme.ts, AppLayout.tsx, AuthContext.tsx, ProtectedRoute.tsx, App.tsx, main.tsx, DashboardController.cs, AuthController.cs, ApplicationUser.cs, AppDbContext.cs, AuthIdentityGenerator.cs, AuthPolicies.cs, Program.cs, SecurityHeaders.cs, vite.config.ts, package.json, PublicImpactSnapshot.cs, Supporter.cs, Donation.cs, DonationAllocation.cs
- [npm: react-cookie-consent 10.0.1](https://www.npmjs.com/package/react-cookie-consent) -- verified latest version
- [npm: js-cookie 3.0.5](https://www.npmjs.com/package/js-cookie) -- verified latest version
- [MUI Dark Mode Documentation](https://mui.com/material-ui/customization/dark-mode/) -- palette.mode API
- CSV data: `public_impact_snapshots.csv` (50 rows of anonymized monthly metrics)

### Secondary (MEDIUM confidence)
- [GitHub: react-cookie-consent](https://github.com/Mastermindzh/react-cookie-consent) -- enableDeclineButton, onAccept/onDecline API
- [KindaCode: React MUI Dark/Light Toggle](https://www.kindacode.com/article/react-mui-create-dark-light-theme-toggle/) -- ThemeContext pattern

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified against npm registry, existing codebase examined
- Architecture: HIGH -- patterns derive from existing codebase conventions (controller pattern, apiFetch, ProtectedRoute)
- Pitfalls: HIGH -- identified from direct codebase analysis (metric_payload_json format, SupporterId linkage, auth policy registration)

**Research date:** 2026-04-06
**Valid until:** 2026-04-10 (project due date)

# Phase 1: Foundation + Auth - Research

**Researched:** 2026-04-06
**Domain:** .NET 10 + ASP.NET Identity + PostgreSQL + React/TypeScript + Vite (cookie-based auth, RBAC, CSV seeding, security headers)
**Confidence:** HIGH

## Summary

Phase 1 builds the entire infrastructure layer: a PostgreSQL database with 17 tables seeded from CSV, ASP.NET Identity authentication with email/password + Google OAuth + MFA, role-based access control (Admin/Donor), security headers (CSP via HTTP header, HSTS in production), and HTTPS enforcement. The React/TypeScript frontend provides login, registration, MFA management, and role-gated routing. This phase has zero dependencies and everything in later phases depends on it.

The reference project at `/Users/waylansmac/AuthN and AuthZ/RootkitIdentityW26/` provides a proven, working pattern for every auth feature. The strategy is to adapt this pattern directly -- replacing SQLite with PostgreSQL (Npgsql), expanding roles from Admin/Customer to Admin/Donor, and widening the security headers middleware to accommodate a React SPA served from .NET in production.

**Primary recommendation:** Follow the reference project's Program.cs pattern exactly, substituting `UseNpgsql()` for `UseSqlite()`. Use a single PostgreSQL database with two DbContexts (same connection string, separate schemas). Build runtime CSV seeding with CsvHelper in dependency order. Set CSP headers from day one with `style-src 'unsafe-inline'` to accommodate MUI/Emotion CSS-in-JS.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | PostgreSQL database with all 17 tables matching the schema | CSV headers analyzed -- all 17 tables documented with column types. Use EF Core Code-First with Npgsql provider. Two DbContexts on single database. |
| DATA-02 | Database seeded from CSV files (all 17 tables, ~8,100 rows) | CsvHelper 33.1.0 for parsing. Runtime seeder (not HasData). Dependency order documented. Row counts verified: 8,108 total rows across 17 tables. |
| DATA-03 | Proper indexes on frequently queried columns | EF Core auto-indexes PKs and FKs. Manual indexes needed on: resident_id (6 tables), supporter_id (donations), safehouse_id (3 tables), session_date, donation_date. |
| AUTH-01 | User can create account with email and password (14+ char passphrase) | Reference project pattern: `AddIdentityApiEndpoints<ApplicationUser>()` + `MapIdentityApi<ApplicationUser>()`. Password policy: RequiredLength=14, all other requirements false. |
| AUTH-02 | User can log in with email/password and session persists across browser refresh | Cookie-based auth with `SameSite=Lax`, `HttpOnly=true`, `SecurePolicy=Always`. 7-day expiry with sliding expiration. Vite proxy makes cookies same-origin in dev. |
| AUTH-03 | User can log in with Google OAuth | Reference AuthController has complete external login flow: `/api/auth/external-login` -> Google -> `/api/auth/external-callback` -> cookie. Requires Google OAuth credentials in user secrets. |
| AUTH-04 | At least one account type has MFA/2FA enabled | Reference ManageMFAPage.tsx + `/api/auth/manage/2fa` endpoint from ASP.NET Identity. Uses TOTP with QR code. Requires `qrcode` npm package. |
| AUTH-05 | Admin role can CRUD all admin pages | `[Authorize(Policy = "AdminOnly")]` on controllers. Policy requires Admin role. |
| AUTH-06 | Donor role can view own donation history and impact only | `[Authorize(Roles = "Donor")]` on donor endpoints. Filter by authenticated user's linked supporter_id. |
| AUTH-07 | Unauthenticated users can only access public pages | Frontend: `ProtectedRoute` component redirects to login. Backend: `[Authorize]` on all non-public endpoints. |
| AUTH-08 | All CUD API endpoints require authentication and return 401/403 | `[Authorize]` attribute on all POST/PUT/DELETE controller actions. Unauthenticated -> 401, wrong role -> 403. |
| AUTH-09 | Login/auth-check endpoints do NOT require authentication | `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/providers` are public. Reference pattern already handles this correctly. |
| AUTH-10 | Three test accounts created | AuthIdentityGenerator pattern from reference. Create: admin@harbor.local (Admin, no MFA), donor@harbor.local (Donor, linked to supporter_id, no MFA), mfa@harbor.local (Admin, MFA enabled). |
| SEC-01 | HTTPS/TLS enabled with valid certificate | `app.UseHttpsRedirection()` in pipeline. Dev: dotnet dev cert. Prod: Azure App Service provides TLS automatically. |
| SEC-02 | Content-Security-Policy HTTP header set | SecurityHeaders middleware from reference. Adapted CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'`. Must be HTTP header, not meta tag. |
| SEC-03 | HSTS enabled in production | `app.UseHsts()` wrapped in `if (!app.Environment.IsDevelopment())` guard. Exact pattern from reference. |
| SEC-06 | No passwords, API keys, or connection strings in source code | Use `dotnet user-secrets` for development (Google OAuth creds, DB connection string). Azure App Service Configuration for production. No secrets in appsettings.json or source. |
</phase_requirements>

## Standard Stack

### Core (Phase 1 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.1 | EF Core provider for PostgreSQL | Official provider. Replaces SQLite from reference. Requires EF Core >= 10.0.4. |
| Microsoft.EntityFrameworkCore | 10.0.x | ORM for database access | Handles all 17 tables + migrations. Proven in reference project. |
| Microsoft.EntityFrameworkCore.Design | 10.0.x | Design-time migration tooling | Required for `dotnet ef migrations add`. |
| Microsoft.AspNetCore.Identity.EntityFrameworkCore | 10.0.x | Identity storage in PostgreSQL | Users, roles, claims, tokens, MFA in PostgreSQL. |
| Microsoft.AspNetCore.Authentication.Google | 10.0.5 | Google OAuth external login | Proven in reference at 10.0.5. `AddGoogle()` with ClientId/ClientSecret. |
| CsvHelper | 33.1.0 | CSV parsing for database seeding | Industry standard. Handles quoted fields, embedded commas, encoding. |
| Swashbuckle.AspNetCore | 6.6.2 | Swagger UI for API testing | Matches reference. Useful for development/grading. |
| React | 19.x | Frontend UI library | Matches reference project. |
| TypeScript | ~5.7 | Type safety | Matches reference project pinned version. |
| Vite | 6.x | Build tool + dev server | Matches reference. Proxy config for same-origin cookies. |
| @mui/material | 6.x | Component library | NOT v7. v6 is stable, well-documented. |
| @emotion/react + @emotion/styled | 11.x | CSS-in-JS for MUI v6 | Required peer dependency. |
| react-router-dom | 7.x | Client-side routing | Matches reference at ^7.4.0. |
| axios | 1.x | HTTP client | `withCredentials: true` for cookie auth. Interceptors for global error handling. |
| qrcode | 1.5.x | QR code generation for MFA setup | Used in reference ManageMFAPage for TOTP enrollment. |

### Supporting (Phase 1)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/qrcode | 1.5.x | TypeScript types for qrcode | MFA setup page. |
| @types/js-cookie | 3.x | TypeScript types for js-cookie | If dark mode toggle is in Phase 1 scope (likely Phase 3). |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Two DbContexts (same DB) | Single DbContext inheriting IdentityDbContext | Simpler but mixes Identity concerns with domain models. Two contexts is proven in reference. |
| Cookie auth | JWT tokens | Cookies are simpler (no token management), HttpOnly prevents XSS access. JWT adds frontend complexity for no benefit. |
| Vite proxy (dev) | SameSite=None + CORS credentials | Proxy is simpler, avoids cross-origin cookie complexity. |
| CsvHelper | Manual StreamReader | Never. CsvHelper handles edge cases that manual parsing misses. |

**Installation (Backend):**
```bash
dotnet new webapi -n HarborOfHope.API --framework net10.0
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 10.0.1
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Authentication.Google
dotnet add package CsvHelper --version 33.1.0
dotnet add package Swashbuckle.AspNetCore --version 6.6.2
```

**Installation (Frontend):**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @mui/material @emotion/react @emotion/styled
npm install react-router-dom axios
npm install qrcode
npm install -D @types/qrcode
```

## Architecture Patterns

### Recommended Project Structure (Phase 1)

```
backend/
  HarborOfHope.API/
    Controllers/
      AuthController.cs          # Session, OAuth, MFA (adapted from reference)
    Data/
      AppDbContext.cs            # 17-table domain context
      IdentityDbContext.cs       # ASP.NET Identity context (same DB, identity schema)
      ApplicationUser.cs         # Extended IdentityUser
      AuthPolicies.cs            # Policy constants (AdminOnly)
      AuthRoles.cs               # Role constants (Admin, Donor)
      AuthIdentityGenerator.cs   # Seed default users + roles at startup
      SeedData.cs                # CSV import logic (17 tables)
      Entities/                  # All 17 entity classes
        Safehouse.cs
        Resident.cs
        Supporter.cs
        Donation.cs
        DonationAllocation.cs
        ... (13 more)
    Infrastructure/
      SecurityHeaders.cs         # CSP, security header middleware
    Migrations/
      Harbor/                    # AppDbContext migrations
      Identity/                  # IdentityDbContext migrations
    Program.cs                   # DI, CORS, auth, middleware pipeline
    appsettings.json             # Non-secret config only
    appsettings.Development.json # Dev overrides (no secrets!)

frontend/
  src/
    components/
      auth/
        ProtectedRoute.tsx       # Role-based route guard
        LoginForm.tsx            # Email/password + MFA fields
        RegisterForm.tsx         # Registration with 14-char minimum
        MfaSetup.tsx             # TOTP QR code + verification
      layout/
        AppLayout.tsx            # Shell (placeholder for sidebar later)
    pages/
      auth/
        LoginPage.tsx
        RegisterPage.tsx
        ManageMfaPage.tsx
        LogoutPage.tsx
    context/
      AuthContext.tsx             # Auth state (adapted from reference)
    lib/
      authApi.ts                 # Auth fetch wrappers (adapted from reference)
    types/
      AuthSession.ts
      TwoFactorStatus.ts
    App.tsx                      # Router setup
    main.tsx                     # Entry point, providers
    theme.ts                     # MUI theme (coral/cream/Nunito)
  vite.config.ts                 # Proxy /api to .NET backend
  index.html
```

### Pattern 1: Program.cs Middleware Pipeline

**What:** The exact middleware ordering from the reference project, adapted for PostgreSQL and the Harbor of Hope domain.

**When to use:** Always. This is THE foundation of the backend.

**Example (adapted from reference Program.cs):**
```csharp
var builder = WebApplication.CreateBuilder(args);
const string FrontendCorsPolicy = "FrontendClient";
var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:3000";

// -- Services --
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// PostgreSQL (SINGLE database, TWO contexts)
var connString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connString));
builder.Services.AddDbContext<AuthIdentityDbContext>(options => options.UseNpgsql(connString));

// Identity
builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AuthIdentityDbContext>();

// Google OAuth (conditional)
var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
{
    builder.Services.AddAuthentication()
        .AddGoogle(options =>
        {
            options.ClientId = googleClientId;
            options.ClientSecret = googleClientSecret;
            options.SignInScheme = IdentityConstants.ExternalScheme;
            options.CallbackPath = "/signin-google";
        });
}

// Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthPolicies.AdminOnly, policy => policy.RequireRole(AuthRoles.Admin));
});

// Password policy (IS 414 requirement)
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequiredLength = 14;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredUniqueChars = 1;
});

// Cookie config
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(frontendUrl)
            .AllowCredentials()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// -- Startup seeding --
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

using (var scope = app.Services.CreateScope())
{
    // Apply pending migrations
    var appDb = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var identityDb = scope.ServiceProvider.GetRequiredService<AuthIdentityDbContext>();
    await identityDb.Database.MigrateAsync();
    await appDb.Database.MigrateAsync();

    // Seed roles + default users
    await AuthIdentityGenerator.GenerateDefaultIdentityAsync(scope.ServiceProvider, app.Configuration);
    // Seed CSV data
    await SeedData.SeedAsync(appDb);
}

// -- Middleware pipeline (ORDER MATTERS) --
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
app.UseSecurityHeaders();
app.UseCors(FrontendCorsPolicy);
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGroup("/api/auth").MapIdentityApi<ApplicationUser>();
app.Run();
```

### Pattern 2: Two DbContexts on Single Database

**What:** `AuthIdentityDbContext` manages ASP.NET Identity tables (auto-prefixed `AspNet*`). `AppDbContext` manages the 17 domain tables. Both use the same PostgreSQL connection string. Identity tables get their own schema to avoid collisions.

**When to use:** Always for this project. Matches reference project architecture.

**Example:**
```csharp
// IdentityDbContext -- identity schema
public class AuthIdentityDbContext : IdentityDbContext<ApplicationUser>
{
    public AuthIdentityDbContext(DbContextOptions<AuthIdentityDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasDefaultSchema("identity");
    }
}

// AppDbContext -- public schema (default)
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Safehouse> Safehouses => Set<Safehouse>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<Supporter> Supporters => Set<Supporter>();
    public DbSet<Donation> Donations => Set<Donation>();
    // ... all 17 tables
}
```

**Migration commands (always specify context):**
```bash
dotnet ef migrations add InitIdentity --context AuthIdentityDbContext --output-dir Migrations/Identity
dotnet ef migrations add InitApp --context AppDbContext --output-dir Migrations/Harbor
dotnet ef database update --context AuthIdentityDbContext
dotnet ef database update --context AppDbContext
```

### Pattern 3: CSP for React SPA with MUI

**What:** Content-Security-Policy adapted from the reference but widened to allow MUI's Emotion CSS-in-JS (which injects inline styles) and self-hosted fonts.

**Example:**
```csharp
public static class SecurityHeaders
{
    public const string ContentSecurityPolicy =
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +  // Required for MUI/Emotion
        "font-src 'self'; " +
        "img-src 'self' data:; " +               // data: for QR code images
        "frame-ancestors 'none'; " +
        "object-src 'none'; " +
        "base-uri 'self'";

    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        var environment = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();
        return app.Use(async (context, next) =>
        {
            context.Response.OnStarting(() =>
            {
                if (!(environment.IsDevelopment() && context.Request.Path.StartsWithSegments("/swagger")))
                {
                    context.Response.Headers["Content-Security-Policy"] = ContentSecurityPolicy;
                    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
                    context.Response.Headers["X-Frame-Options"] = "DENY";
                    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
                }
                return Task.CompletedTask;
            });
            await next();
        });
    }
}
```

### Pattern 4: Vite Proxy for Same-Origin Cookies

**What:** Vite dev server proxies `/api/*` to .NET backend, making cookies same-origin. Eliminates cross-origin cookie issues during development.

**Example:**
```typescript
// vite.config.ts (adapted from reference)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/signin-google': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    assetsInlineLimit: 0,  // Prevent inline assets (CSP compliance)
  },
});
```

### Pattern 5: AuthContext + authApi (adapted from reference)

**What:** React AuthContext wraps the app, calling `/api/auth/me` on mount. All auth API calls go through typed functions in `lib/authApi.ts`. The frontend uses `credentials: 'include'` on every fetch for cookie transport.

**Exact reference pattern to adapt:**
- `AuthContext.tsx` -- copy verbatim from reference, no changes needed
- `authApi.ts` -- copy from reference. Update `DefaultExternalReturnPath` from `/catalog` to `/admin/dashboard`
- `AuthSession.ts` -- copy verbatim
- `TwoFactorStatus.ts` -- copy verbatim
- `LoginPage.tsx` -- adapt from Bootstrap to MUI components
- `RegisterPage.tsx` -- adapt from Bootstrap to MUI
- `ManageMfaPage.tsx` -- adapt from Bootstrap to MUI, change issuer from "Rootkit Rootbeer" to "Harbor of Hope"
- `LogoutPage.tsx` -- adapt from reference

### Anti-Patterns to Avoid
- **Copying SQLite migrations:** Never. Start fresh with `dotnet ef migrations add` against PostgreSQL. SQLite migrations contain incompatible SQL.
- **Using `HasData()` for 8,100 rows:** Creates enormous migration files. Use runtime seeding with SeedData.cs.
- **Calling `fetch()` without `credentials: 'include'`:** Cookies will not be sent, auth will silently fail. Use Vite proxy to avoid this entirely.
- **Enabling HSTS in development:** Poisons localhost. Always guard with `!app.Environment.IsDevelopment()`.
- **Storing secrets in appsettings.json:** Use `dotnet user-secrets` for dev, Azure App Service Configuration for prod.
- **Single ApplicationUser table for linking donor to supporter:** Instead store `supporter_id` as a custom claim or an extra property on ApplicationUser, look up by email match.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV parsing | Manual StreamReader with Split(',') | CsvHelper 33.1.0 | Quoted fields, embedded commas, encoding edge cases |
| Password hashing | Custom bcrypt/argon2 | ASP.NET Identity | Built-in, audited, handles salt + iteration count |
| Cookie management | Manual Set-Cookie headers | ConfigureApplicationCookie | Handles SameSite, HttpOnly, Secure, expiry, sliding |
| OAuth flow | Manual redirect/callback handling | AddGoogle() + AuthController pattern | State parameter, PKCE, token exchange already handled |
| MFA/TOTP | Custom TOTP implementation | Identity's `/manage/2fa` endpoint | Key generation, QR URI, verification, recovery codes built in |
| Role-based auth | Custom middleware checking user table | AddAuthorization + policies + [Authorize] | Claims-based, policy system, attribute-driven |
| CORS configuration | Manual headers in middleware | AddCors + UseCors | Handles preflight, credentials, allowed origins correctly |
| Migration management | Manual SQL scripts | EF Core migrations (`dotnet ef`) | Schema versioning, rollback, provider-specific SQL generation |
| QR code rendering | Canvas/SVG manual drawing | qrcode npm package | Handles error correction, sizing, data URL output |

## Database Schema (from CSV analysis)

### Table Dependency Order (for seeding)

This order respects foreign key constraints:

```
1.  safehouses           (9 rows)   -- no FK dependencies
2.  residents            (60 rows)  -- FK: safehouse_id -> safehouses
3.  supporters           (60 rows)  -- no FK dependencies
4.  partners             (30 rows)  -- no FK dependencies
5.  donations            (420 rows) -- FK: supporter_id -> supporters
6.  donation_allocations (521 rows) -- FK: donation_id -> donations, safehouse_id -> safehouses
7.  in_kind_donation_items (129 rows) -- FK: donation_id -> donations
8.  education_records    (534 rows) -- FK: resident_id -> residents
9.  health_wellbeing_records (534 rows) -- FK: resident_id -> residents
10. process_recordings   (2819 rows) -- FK: resident_id -> residents
11. home_visitations     (1337 rows) -- FK: resident_id -> residents
12. incident_reports     (100 rows) -- FK: resident_id -> residents, safehouse_id -> safehouses
13. intervention_plans   (180 rows) -- FK: resident_id -> residents
14. partner_assignments  (48 rows)  -- FK: partner_id -> partners, safehouse_id -> safehouses
15. social_media_posts   (812 rows) -- no FK (referral_post_id is self-ref on donations)
16. safehouse_monthly_metrics (450 rows) -- FK: safehouse_id -> safehouses
17. public_impact_snapshots (50 rows) -- no FK dependencies
```

**Total: 8,133 rows** (header lines excluded from counts)

### Key Column Types to Watch

| Table | Column | CSV Format | C# Type | Notes |
|-------|--------|------------|---------|-------|
| residents | date_of_birth | `2008-08-31` | DateTime | Parse with InvariantCulture |
| residents | date_of_admission | `2023-10-17` | DateTime | |
| residents | created_at | `2023-10-17 00:00:00` | DateTime | Different format than date-only fields |
| residents | sub_cat_* (8 cols) | `True`/`False` | bool | CsvHelper handles this automatically |
| residents | age_upon_admission | `15 Years 9 months` | string | Text, not numeric -- store as string |
| residents | present_age | `17 Years 6 months` | string | Text, not numeric -- store as string |
| residents | length_of_stay | `2 Years 4 months` | string | Text, not numeric -- store as string |
| donations | amount | `717.18` | decimal | Use decimal for currency, never float |
| donations | is_recurring | `True`/`False` | bool | |
| partner_assignments | safehouse_id | `8.0` | int | Has decimal point -- parse as double then cast to int, or handle in CsvHelper mapping |
| public_impact_snapshots | metric_payload_json | Python dict string | string | Store as text/jsonb. Note: uses single quotes (Python-style), not valid JSON. May need conversion. |
| social_media_posts | created_at | `2023-01-05 18:52:00` | DateTime | Includes time component |
| social_media_posts | engagement_rate | `0.1105` | decimal | |
| process_recordings | notes_restricted | (empty or text) | string? | Nullable field |

### Indexes to Create (DATA-03)

EF Core auto-creates indexes on primary keys and configured foreign keys. Additional indexes needed for query performance:

```csharp
// In AppDbContext.OnModelCreating
modelBuilder.Entity<Resident>()
    .HasIndex(r => r.SafehouseId);
modelBuilder.Entity<Resident>()
    .HasIndex(r => r.CaseStatus);
modelBuilder.Entity<Resident>()
    .HasIndex(r => r.CurrentRiskLevel);

modelBuilder.Entity<Donation>()
    .HasIndex(d => d.SupporterId);
modelBuilder.Entity<Donation>()
    .HasIndex(d => d.DonationDate);

modelBuilder.Entity<ProcessRecording>()
    .HasIndex(p => p.ResidentId);
modelBuilder.Entity<ProcessRecording>()
    .HasIndex(p => p.SessionDate);

modelBuilder.Entity<HomeVisitation>()
    .HasIndex(h => h.ResidentId);

modelBuilder.Entity<DonationAllocation>()
    .HasIndex(da => da.DonationId);
modelBuilder.Entity<DonationAllocation>()
    .HasIndex(da => da.SafehouseId);
```

## Test Accounts (AUTH-10)

Three accounts seeded at startup via AuthIdentityGenerator:

| Account | Email | Password | Role | MFA | Special |
|---------|-------|----------|------|-----|---------|
| Admin | admin@harbor.local | HarborOfHope2026! | Admin | No | Full CRUD access |
| Donor | donor@harbor.local | HarborDonor2026!! | Donor | No | Linked to supporter_id=1 (Mila Alvarez) via email claim or ApplicationUser property |
| MFA User | mfa@harbor.local | HarborSecure2026! | Admin | Yes (TOTP) | MFA enabled programmatically at seed time or manually after first run |

**Note on MFA seeding:** ASP.NET Identity's TOTP setup requires a shared key generated at runtime. You cannot pre-seed a fully configured MFA account -- the user must go through the setup flow once. Strategy: create the mfa@harbor.local account at startup, then document that the demo includes enabling MFA via the ManageMFA page as part of the security demo.

**Password length:** All passwords are 16+ characters to exceed the 14-character minimum requirement.

## Common Pitfalls

### Pitfall 1: SQLite Migrations Copied to PostgreSQL
**What goes wrong:** Reference project has SQLite-specific migration files. Copying them fails with PostgreSQL syntax errors.
**Why it happens:** EF Core migrations are provider-specific. `TEXT` vs `text`, timestamp handling differs.
**How to avoid:** Delete any copied Migrations folder. Start fresh: `dotnet ef migrations add InitIdentity --context AuthIdentityDbContext`. Never reuse SQLite migrations.
**Warning signs:** `Npgsql.PostgresException: 42601: syntax error` during migration.

### Pitfall 2: Cookie Auth Fails in Development (Cross-Origin)
**What goes wrong:** Login succeeds but subsequent requests are unauthenticated. Cookie not sent.
**Why it happens:** React on port 3000, .NET on port 5001 = different origins. SameSite=Lax only sends cookies on top-level navigations.
**How to avoid:** Use Vite proxy (Pattern 4 above). All `/api/*` requests go through Vite to .NET, making everything same-origin. Keep SameSite=Lax (more secure than None).
**Warning signs:** Login returns 200 but `/api/auth/me` returns `isAuthenticated: false`.

### Pitfall 3: CSP Blocks React Rendering
**What goes wrong:** Blank white page in production. Console shows "Refused to apply inline style."
**Why it happens:** MUI/Emotion injects inline styles. Reference CSP `default-src 'self'` blocks them.
**How to avoid:** Use widened CSP with `style-src 'self' 'unsafe-inline'`. Also set `build.assetsInlineLimit: 0` in Vite config. Self-host Nunito font instead of loading from Google Fonts CDN.
**Warning signs:** Works in Vite dev (no CSP enforcement) but blank in production.

### Pitfall 4: CSV Seeding Foreign Key Violations
**What goes wrong:** Seeding fails because donations are inserted before supporters, or residents before safehouses.
**Why it happens:** CSV files have relational dependencies that must be loaded in order.
**How to avoid:** Follow the dependency order documented above (safehouses first, then residents, etc.). Use `SaveChanges()` per table, not per row. Guard with `if (await dbContext.Safehouses.AnyAsync()) return;`.
**Warning signs:** `Npgsql.PostgresException: 23503: insert or update on table "donations" violates foreign key constraint`.

### Pitfall 5: Npgsql Timestamp UTC Requirement
**What goes wrong:** `Cannot write DateTime with Kind=Unspecified to PostgreSQL type 'timestamp with time zone'`.
**Why it happens:** Npgsql 6+ requires DateTime values to have explicit Kind (UTC or Local). CSV dates parse as Unspecified.
**How to avoid:** Set `AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);` at the top of Program.cs, before any EF Core operations. This allows Unspecified DateTime values.
**Warning signs:** Exception on first `SaveChanges()` after inserting any entity with a DateTime field.

### Pitfall 6: HSTS Poisoning localhost
**What goes wrong:** Enabling HSTS in development makes ALL localhost apps redirect to HTTPS permanently.
**Why it happens:** Browser caches HSTS header for localhost. Persists across restarts.
**How to avoid:** Always wrap `app.UseHsts()` in `if (!app.Environment.IsDevelopment())`. Copy reference pattern exactly.
**Warning signs:** `http://localhost:3000` auto-redirects to `https://localhost:3000`.

### Pitfall 7: Two DbContext Migration History Collision
**What goes wrong:** Both contexts try to create `__EFMigrationsHistory` table in same schema.
**Why it happens:** Single database with two contexts sharing default schema.
**How to avoid:** Put Identity context in its own schema: `builder.HasDefaultSchema("identity")`. Use separate migration output directories: `--output-dir Migrations/Identity` and `--output-dir Migrations/Harbor`.
**Warning signs:** `relation "__EFMigrationsHistory" already exists`.

### Pitfall 8: partner_assignments.safehouse_id Has Decimal Values
**What goes wrong:** CsvHelper fails parsing `8.0` as int for safehouse_id.
**Why it happens:** CSV has floating-point formatting for integer foreign keys.
**How to avoid:** Use a custom CsvHelper ClassMap that reads safehouse_id as double and converts to int, or pre-process the CSV, or use a nullable int with custom converter.
**Warning signs:** `FormatException` or `TypeConverterException` during seeding.

## Code Examples

### CSV Seeding with CsvHelper (Runtime)

```csharp
// SeedData.cs
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

public static class SeedData
{
    private const string CsvPath = "data/lighthouse_csv_v7";

    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Safehouses.AnyAsync()) return; // Already seeded

        // Seed in dependency order
        await SeedTable<Safehouse>(context, "safehouses.csv");
        await context.SaveChangesAsync();

        await SeedTable<Resident>(context, "residents.csv");
        await context.SaveChangesAsync();

        await SeedTable<Supporter>(context, "supporters.csv");
        await context.SaveChangesAsync();

        await SeedTable<Partner>(context, "partners.csv");
        await context.SaveChangesAsync();

        await SeedTable<Donation>(context, "donations.csv");
        await context.SaveChangesAsync();

        // ... continue for all 17 tables in order
    }

    private static async Task SeedTable<T>(DbContext context, string fileName) where T : class
    {
        var path = Path.Combine(CsvPath, fileName);
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HeaderValidated = null,
            MissingFieldFound = null,
        });
        var records = csv.GetRecords<T>().ToList();
        context.Set<T>().AddRange(records);
    }
}
```

### AuthIdentityGenerator (adapted from reference)

```csharp
public static class AuthIdentityGenerator
{
    public static async Task GenerateDefaultIdentityAsync(
        IServiceProvider serviceProvider, IConfiguration configuration)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // Create roles
        foreach (var roleName in new[] { AuthRoles.Admin, AuthRoles.Donor })
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // Admin account
        await CreateUserIfNotExists(userManager, "admin@harbor.local",
            "HarborOfHope2026!", AuthRoles.Admin);

        // Donor account
        await CreateUserIfNotExists(userManager, "donor@harbor.local",
            "HarborDonor2026!!", AuthRoles.Donor);

        // MFA account (MFA setup done manually via UI)
        await CreateUserIfNotExists(userManager, "mfa@harbor.local",
            "HarborSecure2026!", AuthRoles.Admin);
    }

    private static async Task CreateUserIfNotExists(
        UserManager<ApplicationUser> userManager,
        string email, string password, string role)
    {
        if (await userManager.FindByEmailAsync(email) != null) return;

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };
        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new Exception($"Failed to create {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        await userManager.AddToRoleAsync(user, role);
    }
}
```

### ProtectedRoute Component (MUI version)

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  role?: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, authSession } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && !authSession.roles.includes(role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SQLite for dev | PostgreSQL everywhere | Project decision | No provider-switching pain. Same DB in dev and prod. |
| HasData() seeding | Runtime SeedData.cs | EF Core best practice | No migration bloat for 8,100 rows |
| JWT tokens in localStorage | HttpOnly cookies | Security best practice | No XSS token theft. Simpler frontend. |
| Separate Identity DB | Same DB, separate schema | Project optimization | Saves Azure cost, allows SQL joins if needed |
| Meta tag CSP | HTTP header CSP | IS 414 requirement | `frame-ancestors` directive only works in HTTP header |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| .NET 10 SDK | Backend build/run | Yes | 10.0.101 | -- |
| Node.js | Frontend build/run | Yes | 22.21.0 | -- |
| npm | Package management | Yes | 10.9.4 | -- |
| PostgreSQL | Database | Yes | 14.17 (Homebrew) | -- |
| PostgreSQL service | Running DB | Yes (just started) | 14.17 | `brew services start postgresql@14` |
| Python 3 | ML (Phase 4, not Phase 1) | Yes | 3.13.1 | -- |
| dotnet-ef CLI | Migrations | Yes | 10.0.3 | -- |
| psql | DB administration | Yes | 14.17 | -- |

**Missing dependencies with no fallback:** None -- all Phase 1 dependencies are installed.

**Missing dependencies with fallback:** None.

**Note:** PostgreSQL was installed but not running. It was started successfully during this research (`brew services start postgresql@14`). A PostgreSQL database will need to be created: `createdb harborofhope`.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual validation (no test framework configured yet) |
| Config file | None -- Wave 0 will establish if needed |
| Quick run command | `dotnet build` (backend compiles) + `npm run build` (frontend compiles) |
| Full suite command | Manual verification against success criteria |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | 17 tables exist in PostgreSQL | smoke | `dotnet ef database update --context AppDbContext && psql harborofhope -c "\dt"` | N/A (CLI) |
| DATA-02 | All CSV data seeded (~8,100 rows) | smoke | `psql harborofhope -c "SELECT 'safehouses', count(*) FROM safehouses UNION ALL SELECT 'residents', count(*) FROM residents UNION ALL ..."` | N/A (CLI) |
| DATA-03 | Indexes on frequent columns | smoke | `psql harborofhope -c "\di"` | N/A (CLI) |
| AUTH-01 | Register with 14+ char password | manual | POST `/api/auth/register` via Swagger with short password (expect 400) then with valid password (expect 200) | N/A |
| AUTH-02 | Login persists across refresh | manual | Login via UI, refresh page, verify `/api/auth/me` still returns authenticated | N/A |
| AUTH-03 | Google OAuth login | manual | Click Google login button, complete OAuth flow, verify session | N/A |
| AUTH-04 | MFA/2FA functional | manual | Navigate to /mfa, scan QR, enter TOTP code, verify login with MFA | N/A |
| AUTH-05 | Admin CRUD access | smoke | GET `/api/residents` as admin (200), as unauthenticated (401) | N/A |
| AUTH-06 | Donor sees own data only | smoke | GET `/api/donor/donations` as donor (200, filtered), as admin (403 or different data) | N/A |
| AUTH-07 | Unauthenticated blocked | smoke | GET `/api/residents` without auth cookie (expect 401) | N/A |
| AUTH-08 | CUD endpoints require auth | smoke | POST/PUT/DELETE without cookie (expect 401), with wrong role (expect 403) | N/A |
| AUTH-09 | Auth endpoints are public | smoke | GET `/api/auth/me` without cookie (expect 200 with isAuthenticated: false) | N/A |
| AUTH-10 | Three test accounts exist | smoke | Login as each account via Swagger | N/A |
| SEC-01 | HTTPS redirect | manual | Navigate to http://localhost:5001, verify redirect to https | N/A |
| SEC-02 | CSP header present | smoke | `curl -I https://localhost:5001/api/auth/me -k \| grep Content-Security-Policy` | N/A |
| SEC-03 | HSTS in production | manual | Check response headers when `ASPNETCORE_ENVIRONMENT=Production` | N/A |
| SEC-06 | No secrets in source | smoke | `grep -r "Password\|Secret\|ConnectionString" backend/ --include="*.json" --include="*.cs" \| grep -v user-secrets \| grep -v appsettings.Development` | N/A |

### Sampling Rate
- **Per task commit:** `dotnet build && cd frontend && npm run build` (compiles without errors)
- **Per wave merge:** Full manual verification of success criteria
- **Phase gate:** All 17 requirements verified before `/gsd:verify-work`

### Wave 0 Gaps
- No formal test framework is needed for Phase 1. Validation is via build success, database inspection, and manual API testing through Swagger.
- If automated testing is desired later, add xUnit for backend and Vitest for frontend in a later phase.

## Open Questions

1. **Google OAuth credentials**
   - What we know: Reference project uses `dotnet user-secrets` for ClientId/ClientSecret. Google Cloud Console project needed.
   - What's unclear: Whether the user already has a Google Cloud project with OAuth credentials configured.
   - Recommendation: Plan includes a task to set up user secrets. If no Google Cloud project exists, document the setup steps (create project -> configure OAuth consent screen -> create credentials -> add redirect URIs).

2. **Donor-to-Supporter linking**
   - What we know: AUTH-06 requires donor to see their own donation history. Donations are linked to supporters by `supporter_id`.
   - What's unclear: How to link an authenticated user (Identity) to a supporter record (AppDbContext).
   - Recommendation: Add a `SupporterId` property to `ApplicationUser`. Set it when creating the donor test account. For the test donor, link to supporter_id=1 (Mila Alvarez).

3. **MFA pre-seeding**
   - What we know: AUTH-10 requires an MFA-enabled test account. AUTH-04 requires MFA working.
   - What's unclear: Whether MFA can be fully pre-seeded programmatically (TOTP shared key + verified).
   - Recommendation: Create the account at startup. MFA enrollment happens during demo setup or via a seed script that calls the Identity API internally. Document the manual step.

4. **public_impact_snapshots.metric_payload_json format**
   - What we know: CSV contains Python dict strings with single quotes (e.g., `{'month': '2023-01', ...}`).
   - What's unclear: Whether to store as text or convert to valid JSON (double quotes).
   - Recommendation: Store as text/string in the entity. Convert to valid JSON at read time if needed for API responses. This is a Phase 3 concern (public impact dashboard), not Phase 1.

## Sources

### Primary (HIGH confidence)
- Reference project: `/Users/waylansmac/AuthN and AuthZ/RootkitIdentityW26/` -- Complete working auth pattern with Program.cs, AuthController.cs, SecurityHeaders.cs, AuthIdentityGenerator.cs, AuthContext.tsx, authApi.ts, LoginPage.tsx, ManageMFAPage.tsx, vite.config.ts
- CSV data directory: `/Users/waylansmac/INTEX 2026/data/lighthouse_csv_v7/` -- All 17 CSV files examined (headers, row counts, data types)
- `.planning/research/STACK.md` -- Verified stack with versions and compatibility
- `.planning/research/PITFALLS.md` -- 10 pitfalls documented with prevention strategies
- `.planning/research/ARCHITECTURE.md` -- System architecture, project structure, patterns

### Secondary (MEDIUM confidence)
- [Npgsql EF Core 10.0 Release Notes](https://www.npgsql.org/efcore/release-notes/10.0.html) -- Verified Npgsql 10.0.1 features
- [Microsoft Learn: Google OAuth in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/google-logins) -- Official Google auth setup

### Tertiary (LOW confidence)
- None. All findings verified against reference project code or official documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All versions verified against reference project and NuGet/npm registries
- Architecture: HIGH -- Patterns proven in working reference project, adapted for PostgreSQL
- Database schema: HIGH -- All 17 CSV files examined, column types documented, dependency order verified
- Auth patterns: HIGH -- Complete reference implementation exists and compiles
- Pitfalls: HIGH -- Documented from reference project analysis and official docs

**Research date:** 2026-04-06
**Valid until:** 2026-04-10 (project due date)

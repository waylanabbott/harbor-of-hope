# Architecture Research

**Domain:** Nonprofit case management + donor engagement platform
**Researched:** 2026-04-06
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
                         CLIENTS
 ┌──────────────────────────────────────────────────────┐
 │  Browser (React + TypeScript, Vite)                  │
 │  ┌────────────┐ ┌────────────┐ ┌────────────────┐   │
 │  │  Public     │ │  Donor     │ │  Admin/Case    │   │
 │  │  Pages      │ │  Portal    │ │  Management    │   │
 │  └──────┬─────┘ └──────┬─────┘ └──────┬─────────┘   │
 │         │              │              │              │
 │  ┌──────┴──────────────┴──────────────┴───────────┐  │
 │  │  AuthContext  │  API Layer (fetch)  │  Router   │  │
 │  └──────────────────────┬─────────────────────────┘  │
 └─────────────────────────┼────────────────────────────┘
                           │ HTTPS (cookies)
                           ▼
 ┌─────────────────────────────────────────────────────────┐
 │  .NET 10 Web API (ASP.NET Identity)                     │
 │  ┌──────────┐ ┌──────────────┐ ┌──────────────────────┐ │
 │  │  Auth     │ │  Domain      │ │  ML Proxy            │ │
 │  │  Endpoints│ │  Controllers │ │  Controller          │ │
 │  └────┬─────┘ └──────┬───────┘ └──────┬───────────────┘ │
 │       │              │                │                 │
 │  ┌────┴──────────────┴────────┐  ┌────┴──────────┐     │
 │  │  Services Layer            │  │  HttpClient   │     │
 │  └────────────┬───────────────┘  │  to Flask     │     │
 │               │                  └────┬──────────┘     │
 │  ┌────────────┴───────────────┐       │                │
 │  │  EF Core (2 DbContexts)   │       │                │
 │  │  IdentityDb │ AppDb        │       │                │
 │  └──────┬──────┴──────┬───────┘       │                │
 └─────────┼─────────────┼──────────────┼────────────────┘
           │             │              │
           ▼             ▼              ▼
 ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐
 │ PostgreSQL  │ │ PostgreSQL   │ │ Flask ML API     │
 │ Identity DB │ │ App DB       │ │ (scikit-learn)   │
 │ (ASP.NET    │ │ (17 tables)  │ │ 8 endpoints      │
 │  tables)    │ │              │ │                  │
 └─────────────┘ └──────────────┘ └──────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| React SPA | All UI rendering, client-side routing, form handling | Vite + React Router + Context API |
| AuthContext | Session state, role checks, login/logout coordination | React Context wrapping `/api/auth/me` |
| API Layer (frontend) | All HTTP calls to .NET backend, error handling | Typed fetch wrappers in `lib/` folder |
| Auth Endpoints | Registration, login, logout, MFA, Google OAuth, session | ASP.NET Identity API endpoints + custom AuthController |
| Domain Controllers | CRUD for all 17 domain tables, role-gated | One controller per aggregate (not per table) |
| ML Proxy Controller | Forwards prediction requests to Flask, returns results | Single controller, HttpClient to Flask |
| Services Layer | Business logic, data transformation, validation | Service classes injected into controllers |
| IdentityDbContext | ASP.NET Identity tables (users, roles, claims, tokens) | IdentityDbContext<ApplicationUser> on PostgreSQL |
| AppDbContext | All 17 domain tables (residents, donations, etc.) | DbContext with DbSet per entity |
| Flask ML API | Runs trained models, returns predictions/explanations | Flask endpoints wrapping scikit-learn `.pkl` files |

## Recommended Project Structure

### Backend (.NET)

```
backend/
├── HarborOfHope.API/
│   ├── Controllers/
│   │   ├── AuthController.cs          # Session, OAuth, MFA (from reference)
│   │   ├── ResidentsController.cs     # Resident CRUD + search
│   │   ├── SafehousesController.cs    # Safehouse management
│   │   ├── SupportersController.cs    # Supporter/donor CRUD
│   │   ├── DonationsController.cs     # Donations + allocations
│   │   ├── CaseRecordsController.cs   # Process recordings, visitations, incidents
│   │   ├── ResidentServicesController.cs  # Education, health, interventions
│   │   ├── OutreachController.cs      # Social media, partners, impact snapshots
│   │   ├── AnalyticsController.cs     # Aggregated stats for dashboards
│   │   └── PredictionsController.cs   # ML proxy to Flask
│   ├── Data/
│   │   ├── AppDbContext.cs            # 17-table domain context
│   │   ├── IdentityDbContext.cs       # ASP.NET Identity context
│   │   ├── ApplicationUser.cs         # Extended IdentityUser (optional)
│   │   ├── AuthPolicies.cs            # Policy constants
│   │   ├── AuthRoles.cs               # Role constants (Admin, Donor)
│   │   ├── SeedData.cs                # CSV import logic
│   │   └── Entities/
│   │       ├── Resident.cs
│   │       ├── Safehouse.cs
│   │       ├── Supporter.cs
│   │       ├── Donation.cs
│   │       ├── DonationAllocation.cs
│   │       ├── InKindDonationItem.cs
│   │       ├── ProcessRecording.cs
│   │       ├── HomeVisitation.cs
│   │       ├── EducationRecord.cs
│   │       ├── HealthWellbeingRecord.cs
│   │       ├── InterventionPlan.cs
│   │       ├── IncidentReport.cs
│   │       ├── SocialMediaPost.cs
│   │       ├── Partner.cs
│   │       ├── PartnerAssignment.cs
│   │       ├── SafehouseMonthlyMetric.cs
│   │       └── PublicImpactSnapshot.cs
│   ├── DTOs/
│   │   ├── ResidentDto.cs             # Stripped-down response models
│   │   ├── DonationDto.cs
│   │   ├── DashboardStatsDto.cs
│   │   └── PredictionResultDto.cs
│   ├── Services/
│   │   ├── ResidentService.cs
│   │   ├── DonationService.cs
│   │   ├── AnalyticsService.cs
│   │   └── MlProxyService.cs          # HttpClient wrapper for Flask
│   ├── Infrastructure/
│   │   └── SecurityHeaders.cs         # CSP, HSTS middleware
│   ├── Migrations/                    # EF Core migrations (both contexts)
│   ├── Program.cs                     # DI, CORS, auth, middleware pipeline
│   ├── appsettings.json
│   └── appsettings.Development.json
```

### Frontend (React)

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Shell with sidebar + header
│   │   │   ├── AdminSidebar.tsx       # Admin navigation sidebar
│   │   │   ├── PublicHeader.tsx       # Public page header/nav
│   │   │   └── Footer.tsx
│   │   ├── ui/
│   │   │   ├── DataTable.tsx          # Reusable table with pagination
│   │   │   ├── MetricCard.tsx         # Dashboard stat card
│   │   │   ├── ConfirmDialog.tsx      # Delete confirmation modal
│   │   │   ├── SearchFilter.tsx       # Search + filter bar
│   │   │   └── DarkModeToggle.tsx     # Theme toggle (cookie-based)
│   │   ├── charts/
│   │   │   ├── DonationTrendsChart.tsx
│   │   │   ├── OutcomeChart.tsx
│   │   │   └── PredictionDisplay.tsx  # ML prediction results
│   │   ├── forms/
│   │   │   ├── ResidentForm.tsx       # Add/edit resident
│   │   │   ├── DonationForm.tsx       # Add/edit donation
│   │   │   └── SessionNoteForm.tsx    # Process recording form
│   │   └── auth/
│   │       ├── ProtectedRoute.tsx     # Role-based route guard
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       └── MfaSetup.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── LandingPage.tsx        # Hero, mission, stats, donate CTA
│   │   │   ├── ImpactDashboard.tsx    # Public anonymized data
│   │   │   ├── PrivacyPolicyPage.tsx
│   │   │   └── CookiePolicyPage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── LogoutPage.tsx
│   │   │   └── ManageMfaPage.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx     # Metrics, charts, overview
│   │   │   ├── ResidentsPage.tsx      # Caseload inventory
│   │   │   ├── ResidentDetailPage.tsx # Single resident view
│   │   │   ├── SupportersPage.tsx     # Donors & contributions
│   │   │   ├── DonationsPage.tsx      # Donation records
│   │   │   ├── ProcessRecordingsPage.tsx  # Counseling notes
│   │   │   ├── HomeVisitationsPage.tsx    # Visit logs
│   │   │   ├── ReportsPage.tsx        # Analytics + ML predictions
│   │   │   └── IncidentsPage.tsx      # Incident management
│   │   └── donor/
│   │       └── DonorDashboard.tsx     # Donor's own history + impact
│   ├── context/
│   │   ├── AuthContext.tsx            # Auth state (from reference pattern)
│   │   ├── CookieConsentContext.tsx   # GDPR consent state
│   │   └── ThemeContext.tsx           # Dark mode state
│   ├── lib/
│   │   ├── authApi.ts                 # Auth fetch wrappers (from reference)
│   │   ├── residentsApi.ts            # Resident CRUD calls
│   │   ├── donationsApi.ts            # Donation CRUD calls
│   │   ├── caseRecordsApi.ts          # Process recordings, visitations
│   │   ├── analyticsApi.ts            # Dashboard data, reports
│   │   └── predictionsApi.ts          # ML prediction calls
│   ├── types/
│   │   ├── AuthSession.ts            # Auth types (from reference)
│   │   ├── Resident.ts
│   │   ├── Donation.ts
│   │   ├── Supporter.ts
│   │   ├── CaseRecord.ts
│   │   └── Prediction.ts
│   ├── App.tsx                        # Router setup
│   ├── main.tsx                       # Entry point, providers
│   └── index.css                      # Global styles, design tokens
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### ML Service (Python)

```
ml-api/
├── app.py                             # Flask app, all endpoints
├── models/
│   ├── donor_churn.pkl                # Trained model artifacts
│   ├── social_media_effectiveness.pkl
│   ├── reintegration_readiness.pkl
│   ├── counseling_effectiveness.pkl
│   ├── incident_risk.pkl
│   ├── education_outcome.pkl
│   ├── donation_forecast.pkl
│   └── safehouse_outcomes.pkl
├── requirements.txt                   # Flask, scikit-learn, pandas, etc.
└── Dockerfile                         # For Azure deployment

ml-pipelines/
├── 01_donor_churn.ipynb               # Training notebooks
├── 02_social_media.ipynb
├── 03_reintegration.ipynb
├── 04_counseling.ipynb
├── 05_incident_risk.ipynb
├── 06_education.ipynb
├── 07_donation_forecast.ipynb
└── 08_safehouse_outcomes.ipynb
```

### Structure Rationale

- **Controllers grouped by aggregate, not table:** Residents, their education, health, and intervention records are logically related. But controllers should group by API consumer need: `CaseRecordsController` handles process recordings, visitations, and incidents because Maria (the case manager persona) accesses them together. `ResidentServicesController` handles education, health, and interventions because they are sub-records of a resident.
- **DTOs separate from entities:** Entities map to database columns (including sensitive fields like `notes_restricted`). DTOs are what the API returns, stripping sensitive data based on role. Never return entities directly from controllers.
- **Services layer exists but stays thin:** With 4 days, services should contain the business logic that does not belong in controllers (aggregation, filtering, ML proxy calls) but should not over-abstract. No repository pattern -- EF Core's DbContext already is the repository.
- **Frontend lib/ folder = API boundary:** Every backend call goes through a typed function in `lib/`. Components never call `fetch()` directly. This makes it trivial to change endpoints, add error handling, or mock for testing.
- **Pages mirror routes 1:1:** Each file in `pages/` corresponds to exactly one route. Layout wraps them via React Router's `<Outlet />`. No routing logic inside page components.

## Architectural Patterns

### Pattern 1: Dual DbContext (Identity + Application)

**What:** Two separate EF Core DbContexts pointing at two separate PostgreSQL databases on the same Azure server. `IdentityDbContext` manages ASP.NET Identity tables (users, roles, claims, tokens, MFA). `AppDbContext` manages the 17 domain tables.

**When to use:** When Identity is a cross-cutting concern that should not pollute domain models. The reference project (`RootkitIdentityW26`) already proves this pattern works.

**Trade-offs:**
- Pro: Clean separation, Identity migrations do not touch domain schema
- Pro: Can use the proven reference project pattern verbatim
- Con: Cannot do EF Core joins between Identity users and domain data (e.g., linking supporters to user accounts)
- Mitigation: Store `supporter_id` in a custom claim or in `ApplicationUser` as a property. Look up by email match when needed.

**Example:**
```csharp
// Program.cs — two connection strings, two contexts
builder.Services.AddDbContext<IdentityDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("IdentityConnection")));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("AppConnection")));

// Alternatively: SINGLE database, two contexts pointing at same connection string
// This allows raw SQL joins if needed while keeping EF concerns separate
```

**Recommendation for this project:** Use a SINGLE PostgreSQL database with two DbContexts pointing at the same connection string. Identity tables get auto-prefixed (`AspNet*`), so there are no naming collisions with domain tables. This avoids the cost of a second Azure PostgreSQL instance and allows raw SQL joins between Identity users and supporters if needed, while maintaining the clean separation the reference project demonstrates.

### Pattern 2: Cookie-Based Authentication with CORS

**What:** ASP.NET Identity issues HttpOnly cookies. React SPA sends `credentials: 'include'` on every fetch. CORS allows the Vite dev server origin with credentials.

**When to use:** Always for this project. The reference pattern is proven and matches IS 414 requirements.

**Trade-offs:**
- Pro: HttpOnly cookies are not accessible to JavaScript (XSS safe)
- Pro: SameSite=Lax prevents CSRF for GET requests
- Pro: No token management logic in frontend
- Con: CORS configuration must be exact (origin, not wildcard, when credentials are used)

**Example:**
```csharp
// CORS — must match Vite dev server URL exactly
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")  // Vite dev
            .AllowCredentials()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Cookie config — matches reference exactly
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
});
```

### Pattern 3: Role-Based Route Protection (Three Tiers)

**What:** Three access levels enforced at both backend (policies) and frontend (route guards).

| Route Group | Who | Backend | Frontend |
|-------------|-----|---------|----------|
| Public (`/`, `/impact`, `/privacy`) | Everyone | No `[Authorize]` | No guard |
| Donor (`/donor/*`) | Authenticated donors | `[Authorize(Roles = "Donor")]` | `<ProtectedRoute role="Donor">` |
| Admin (`/admin/*`) | Admins/case managers | `[Authorize(Policy = "AdminOnly")]` | `<ProtectedRoute role="Admin">` |

**When to use:** Always. Backend is the real enforcement; frontend guards are UX convenience only.

**Example:**
```typescript
// ProtectedRoute.tsx
function ProtectedRoute({ role, children }: { role?: string; children: ReactNode }) {
  const { isAuthenticated, isLoading, authSession } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && !authSession.roles.includes(role)) return <Navigate to="/" />;

  return <>{children}</>;
}
```

### Pattern 4: ML Proxy (Backend-Mediated)

**What:** The React frontend never calls the Flask ML API directly. Instead, the .NET backend has a `PredictionsController` that forwards requests to Flask via `HttpClient`, validates input, and returns results. Flask is an internal service, not exposed to the internet.

**When to use:** Always. Direct browser-to-Flask calls would require a second CORS config, expose the ML API publicly, and bypass authentication.

**Trade-offs:**
- Pro: Single API surface for the frontend
- Pro: Flask does not need auth, CORS, or HTTPS -- it is internal
- Pro: .NET can cache predictions, validate inputs, log usage
- Con: Extra network hop adds latency (~10-50ms, negligible for predictions)

**Example:**
```csharp
// MlProxyService.cs
public class MlProxyService
{
    private readonly HttpClient _http;

    public MlProxyService(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri("http://localhost:5050");  // Flask
    }

    public async Task<PredictionResult> GetDonorChurnPrediction(int supporterId)
    {
        var response = await _http.GetAsync($"/predict/donor-churn/{supporterId}");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<PredictionResult>();
    }
}

// Registration in Program.cs
builder.Services.AddHttpClient<MlProxyService>();
```

```python
# Flask app.py
@app.route('/predict/donor-churn/<int:supporter_id>')
def predict_donor_churn(supporter_id):
    # Load model, get features from request or DB, predict
    model = joblib.load('models/donor_churn.pkl')
    features = get_supporter_features(supporter_id)  # from DB or passed in
    prediction = model.predict_proba([features])[0]
    return jsonify({
        'supporter_id': supporter_id,
        'churn_probability': float(prediction[1]),
        'risk_level': 'high' if prediction[1] > 0.7 else 'medium' if prediction[1] > 0.4 else 'low'
    })
```

### Pattern 5: CSV Seeding via Startup Logic

**What:** On application startup (or via a one-time migration), read CSV files and bulk-insert into PostgreSQL using EF Core. Use `HasData()` in `OnModelCreating` only for small reference data (like safehouses). Use a `SeedData.cs` class called from `Program.cs` for the larger CSV files.

**When to use:** For the 17-table seed. `HasData()` bakes data into migrations (bad for 8,100 rows). A startup seeder checks if tables are empty and inserts only when needed.

**Trade-offs:**
- Pro: Idempotent (checks before inserting)
- Pro: CSV files stay in the repo for reproducibility
- Pro: Does not bloat migration files
- Con: First startup is slower (~2-5 seconds for 8,100 rows)

**Example:**
```csharp
// SeedData.cs
public static class SeedData
{
    public static async Task SeedAsync(AppDbContext db, string csvDirectory)
    {
        if (await db.Safehouses.AnyAsync()) return;  // Already seeded

        var safehouses = ReadCsv<Safehouse>(Path.Combine(csvDirectory, "safehouses.csv"));
        db.Safehouses.AddRange(safehouses);

        var residents = ReadCsv<Resident>(Path.Combine(csvDirectory, "residents.csv"));
        db.Residents.AddRange(residents);

        // ... all 17 tables in FK-dependency order
        await db.SaveChangesAsync();
    }

    private static List<T> ReadCsv<T>(string path) { /* CsvHelper parsing */ }
}

// Program.cs
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await SeedData.SeedAsync(db, "data/lighthouse_csv_v7");
}
```

## Data Flow

### Request Flow (Standard CRUD)

```
[User clicks "Save Resident"]
    ↓
[ResidentForm.tsx] → onSubmit handler
    ↓
[lib/residentsApi.ts] → fetch("/api/residents", { method: "POST", credentials: "include", body })
    ↓ HTTPS + cookie
[.NET Middleware] → CORS check → Cookie auth → Role check
    ↓
[ResidentsController.cs] → [Authorize(Policy = "AdminOnly")]
    ↓
[ResidentService.cs] → Validate, map DTO → Entity
    ↓
[AppDbContext] → db.Residents.Add(entity) → SaveChangesAsync()
    ↓
[PostgreSQL] → INSERT INTO residents (...)
    ↓ (response bubbles back up)
[ResidentDto] ← mapped from entity
    ↓
[JSON response] → 201 Created
    ↓
[residentsApi.ts] → returns typed ResidentDto
    ↓
[ResidentForm.tsx] → updates UI, shows success
```

### ML Prediction Flow

```
[Admin clicks "Predict Churn" on ReportsPage]
    ↓
[predictionsApi.ts] → fetch("/api/predictions/donor-churn/42", { credentials: "include" })
    ↓ HTTPS + cookie
[PredictionsController.cs] → [Authorize(Policy = "AdminOnly")]
    ↓
[MlProxyService.cs] → HttpClient.GetAsync("http://flask:5050/predict/donor-churn/42")
    ↓ HTTP (internal network)
[Flask app.py] → load model → predict → return JSON
    ↓
[MlProxyService.cs] → deserialize → return PredictionResult
    ↓
[PredictionsController.cs] → Ok(result)
    ↓
[predictionsApi.ts] → typed PredictionResult
    ↓
[PredictionDisplay.tsx] → renders probability, risk level, explanation
```

### Authentication Flow

```
[User submits login form]
    ↓
[authApi.ts] → fetch("/api/auth/login?useCookies=true", { credentials: "include", body: { email, password } })
    ↓
[ASP.NET Identity] → validate credentials → issue cookie
    ↓
[Set-Cookie header] → HttpOnly, Secure, SameSite=Lax
    ↓
[authApi.ts] → success
    ↓
[AuthContext.tsx] → refreshAuthState() → fetch("/api/auth/me")
    ↓
[AuthController.cs] → reads cookie → returns { isAuthenticated, roles, email }
    ↓
[AuthContext] → updates state → ProtectedRoute re-evaluates → user sees admin/donor pages
```

### Key Data Flows

1. **Public impact dashboard:** Browser loads `/impact` → `analyticsApi.ts` calls `/api/analytics/public-impact` (no auth) → `AnalyticsController` queries `PublicImpactSnapshots` table → returns anonymized aggregate data → charts render.

2. **Donor viewing their impact:** Donor logs in → `DonorDashboard` calls `/api/donations/my-donations` → controller reads user email from cookie claims → matches to `supporter_id` via email lookup in Supporters table → returns donation history + allocation details → donor sees where money went.

3. **Case manager daily workflow:** Admin logs in → `AdminDashboard` calls `/api/analytics/dashboard-stats` → returns counts, recent activity, alerts → Maria clicks into `ResidentsPage` → paginated, filterable list of residents → clicks resident → `ResidentDetailPage` loads all sub-records (education, health, interventions, process recordings, visitations) via parallel API calls.

4. **CSV seeding on first deploy:** App starts → `Program.cs` runs migrations → `SeedData.SeedAsync()` checks if `Safehouses` table is empty → reads 17 CSVs in FK-dependency order → bulk inserts 8,100 rows → app is ready.

## Database Schema: Three Domains

### Domain Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CASE MANAGEMENT                              │
│  ┌────────────┐                                                    │
│  │ Safehouses │──┐                                                 │
│  └────────────┘  │ 1:N                                             │
│       │          ▼                                                  │
│       │    ┌────────────┐                                          │
│       │    │ Residents  │──────────────────────────────────┐       │
│       │    └────────────┘                                  │       │
│       │         │ 1:N          1:N          1:N            │ 1:N   │
│       │         ▼              ▼            ▼              ▼       │
│       │  ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│       │  │ ProcessRecs  │ │ HomeVisit│ │ EduRecs  │ │HealthRecs │ │
│       │  └──────────────┘ └──────────┘ └──────────┘ └───────────┘ │
│       │         │ 1:N          1:N                                  │
│       │         ▼              ▼                                    │
│       │  ┌──────────────┐ ┌──────────────┐                         │
│       │  │ Interventions│ │ IncidentRpts │                         │
│       │  └──────────────┘ └──────────────┘                         │
│       │                                                            │
│  ┌────┴───────────────┐                                            │
│  │ SafehouseMetrics   │  (monthly aggregates per safehouse)        │
│  └────────────────────┘                                            │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     DONOR / SUPPORT                                 │
│  ┌─────────────┐                                                   │
│  │ Supporters  │──┐                                                │
│  └─────────────┘  │ 1:N                                            │
│                   ▼                                                 │
│            ┌────────────┐                                          │
│            │ Donations  │──┐                                       │
│            └────────────┘  │ 1:N              1:N                  │
│                            ▼                   ▼                    │
│                 ┌──────────────────┐  ┌─────────────────────┐      │
│                 │DonationAllocations│  │ InKindDonationItems│      │
│                 └──────────────────┘  └─────────────────────┘      │
│                        │                                           │
│                        ▼ (FK to Safehouses)                        │
│              Links to Case Management domain                       │
│                                                                    │
│  ┌────────────┐  ┌─────────────────────┐                           │
│  │ Partners   │──│ PartnerAssignments  │──→ Safehouses             │
│  └────────────┘  └─────────────────────┘                           │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  OUTREACH / COMMUNICATION                           │
│  ┌──────────────────┐   ┌──────────────────────┐                   │
│  │ SocialMediaPosts │   │ PublicImpactSnapshots │                   │
│  └──────────────────┘   └──────────────────────┘                   │
│  (standalone tables, no FKs to other domains)                      │
│  (Donations.referral_post_id → SocialMediaPosts is the one link)  │
└────────────────────────────────────────────────────────────────────┘
```

### CSV Seeding Order (FK Dependencies)

Tables must be seeded in this order to satisfy foreign key constraints:

1. `safehouses` (9 rows) -- no dependencies
2. `residents` (60 rows) -- depends on safehouses
3. `supporters` (60 rows) -- no dependencies
4. `partners` (30 rows) -- no dependencies
5. `social_media_posts` (812 rows) -- no dependencies
6. `public_impact_snapshots` (50 rows) -- no dependencies
7. `donations` (420 rows) -- depends on supporters, optionally social_media_posts
8. `donation_allocations` (521 rows) -- depends on donations, safehouses
9. `in_kind_donation_items` (129 rows) -- depends on donations
10. `partner_assignments` (48 rows) -- depends on partners, safehouses
11. `process_recordings` (2,819 rows) -- depends on residents
12. `home_visitations` (1,337 rows) -- depends on residents
13. `education_records` (534 rows) -- depends on residents
14. `health_wellbeing_records` (534 rows) -- depends on residents
15. `intervention_plans` (180 rows) -- depends on residents
16. `incident_reports` (100 rows) -- depends on residents, safehouses
17. `safehouse_monthly_metrics` (450 rows) -- depends on safehouses

### Linking Donors to Identity Users

The `supporters` table has an `email` column. When a donor registers through ASP.NET Identity, their email becomes the link between the two systems. The recommended approach:

1. Donor registers (Identity creates user with email)
2. Donor is assigned the "Donor" role
3. When donor accesses `/donor/dashboard`, the backend looks up `supporters` by email match
4. If matched, return that supporter's donation history
5. If no match, show an empty state ("No donation records linked to this account")

No foreign key between Identity and app DB is needed. Email is the join key, queried at runtime.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users (this project) | Single Azure App Service, single PostgreSQL instance, Flask as sidecar. No caching, no CDN, no optimization needed. |
| 100-1k users | Add response caching on dashboard/analytics endpoints. Consider Azure CDN for static assets. |
| 1k+ users | Move Flask ML API to separate Azure App Service. Add Redis cache for prediction results. Consider read replicas for PostgreSQL. |

### Scaling Priorities

1. **First bottleneck:** The ML prediction endpoints. scikit-learn models are CPU-bound and run synchronously in Flask. For this project, predictions are infrequent (admin-only), so it does not matter. At scale, add response caching (predictions for the same input rarely change).
2. **Second bottleneck:** Dashboard aggregation queries. `AnalyticsController` runs COUNT/AVG/GROUP BY across multiple tables. For 8,100 rows, these are instant. At scale, pre-compute monthly aggregates (the `safehouse_monthly_metrics` table already does this pattern).

## Anti-Patterns

### Anti-Pattern 1: Exposing Entities as API Responses

**What people do:** Return EF Core entity objects directly from controllers (`return Ok(resident)`).
**Why it's wrong:** Entities contain sensitive fields (`notes_restricted`), navigation properties that cause circular serialization, and database concerns (tracking state) that leak to the client. Changing the database schema accidentally changes the API contract.
**Do this instead:** Map to DTOs before returning. Use a simple mapping method or AutoMapper. Strip `notes_restricted` unless the caller has the Admin role.

### Anti-Pattern 2: Frontend Calling Flask Directly

**What people do:** Configure CORS on Flask and have React call it alongside the .NET API.
**Why it's wrong:** Two APIs to secure, two CORS configs, Flask needs its own auth middleware, ML endpoints are publicly accessible, and the frontend needs to manage two base URLs.
**Do this instead:** Route all ML requests through the .NET backend's `PredictionsController`. Flask stays internal, unauthenticated, simple.

### Anti-Pattern 3: Single "God Controller"

**What people do:** Put all 17 tables' CRUD into one massive controller.
**Why it's wrong:** Violates single responsibility, makes the file unmanageable, and makes route naming inconsistent.
**Do this instead:** Group controllers by aggregate/persona concern. One controller per logical API area (residents, donations, case records, analytics, predictions).

### Anti-Pattern 4: Putting Business Logic in React Components

**What people do:** Calculate aggregates, filter data, or enforce business rules in the frontend.
**Why it's wrong:** Business logic in the frontend is not enforceable (can be bypassed), duplicates work if multiple clients exist, and makes the frontend harder to maintain.
**Do this instead:** Compute aggregates and enforce rules in the .NET backend. The frontend only displays data and captures input.

### Anti-Pattern 5: Using localStorage for Auth Tokens

**What people do:** Store JWT tokens in localStorage and send them via Authorization header.
**Why it's wrong:** localStorage is accessible to JavaScript, making tokens vulnerable to XSS. The IS 414 grading rubric likely penalizes this.
**Do this instead:** Use HttpOnly cookies (the reference project pattern). The browser manages the cookie automatically; JavaScript never touches the auth token.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google OAuth | ASP.NET Identity external login provider | Configured via `AddGoogle()` in Program.cs. Callback redirects to frontend. Reference project provides exact pattern. |
| Azure PostgreSQL | EF Core `UseNpgsql()` | Connection string in appsettings. Use `Npgsql.EntityFrameworkCore.PostgreSQL` NuGet package. |
| Azure App Service | Deployment target for .NET + React | React builds to `wwwroot/` or separate static web app. .NET serves API. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| React SPA to .NET API | HTTPS REST + cookies | CORS policy must match Vite dev origin. Production uses same-origin (served from same App Service). |
| .NET API to Flask ML | HTTP REST (internal) | No auth, no CORS. HttpClient registered via DI. Flask runs on port 5050 (or Azure internal URL). |
| .NET API to PostgreSQL (Identity) | EF Core IdentityDbContext | Managed by ASP.NET Identity. Do not query these tables directly except for custom claims. |
| .NET API to PostgreSQL (App) | EF Core AppDbContext | All domain data access. Migrations managed separately from Identity. |
| Jupyter Notebooks to CSV Data | File system read | Notebooks in `ml-pipelines/` read CSVs from `data/lighthouse_csv_v7/`, train models, save `.pkl` to `ml-api/models/`. |
| Flask ML to Model Files | `joblib.load()` | Flask loads `.pkl` files at startup. No database access from Flask (features passed in request body from .NET). |

## Build Order (Dependencies)

The architecture has clear dependency chains that dictate build order:

```
Phase 1: Foundation (nothing depends on anything else yet)
├── .NET project scaffold + Program.cs + dual DbContext
├── Entity classes for all 17 tables
├── EF Core migrations (create all tables)
├── CSV seeding logic
├── React project scaffold + routing shell + layout components
└── AuthContext + auth pages (from reference project)

Phase 2: Core Data (depends on Phase 1 DB + auth)
├── Resident CRUD (controller → service → DTOs)
├── Safehouse CRUD
├── Supporter/Donation CRUD
├── Frontend pages: ResidentsPage, SupportersPage, DonationsPage
└── Admin dashboard with basic metrics

Phase 3: Case Management Features (depends on Phase 2 residents)
├── Process recordings CRUD
├── Home visitations CRUD
├── Education, health, intervention records
├── Incident reports
├── Frontend pages for each
└── Resident detail page (aggregates all sub-records)

Phase 4: Public + Donor (depends on Phase 2 donations)
├── Public landing page
├── Public impact dashboard
├── Donor dashboard (donation history, impact)
├── Privacy policy + cookie consent
└── Dark mode toggle

Phase 5: ML Integration (depends on Phase 2 data + Phase 3 if using case data)
├── Train all 8 models in Jupyter notebooks
├── Flask API with 8 endpoints
├── MlProxyService + PredictionsController in .NET
├── Reports & analytics page in frontend
└── Prediction display components

Phase 6: Security Hardening + Deploy (depends on everything)
├── CSP headers, HSTS
├── MFA setup for test account
├── Input sanitization audit
├── Lighthouse accessibility check
├── Azure deployment config
└── Test accounts (admin, donor, MFA)
```

**Key dependency insight:** Auth and database schema must come first because every subsequent feature depends on them. ML integration comes late because the notebooks need stable data to train on, and the Flask API is additive (the app works without it). Security hardening is last because it is easier to apply CSP/HSTS to a complete app than to debug them while building features.

## Sources

- Reference project: `/Users/waylansmac/AuthN and AuthZ/RootkitIdentityW26/` (proven ASP.NET Identity + React pattern from IS 414 class)
- [ASP.NET Core Web API Best Practices](https://code-maze.com/aspnetcore-webapi-best-practices/) -- controller/service structure patterns
- [Using Multiple EF Core DbContexts](https://www.milanjovanovic.tech/blog/using-multiple-ef-core-dbcontext-in-single-application) -- dual DbContext pattern
- [EF Core Data Seeding](https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding) -- HasData vs runtime seeding tradeoffs
- [React Folder Structure 2025](https://www.robinwieruch.de/react-folder-structure/) -- pages/components/lib organization
- [React + Vite Project Structure](https://www.mintlify.com/R0N7w7/vite-ts-react-tailwind-shadcn-router-template/structure/overview) -- routing and layout patterns
- CSV schema analysis: 17 files in `data/lighthouse_csv_v7/` (~8,100 rows total)

---
*Architecture research for: Harbor of Hope nonprofit case management + donor platform*
*Researched: 2026-04-06*

# Pitfalls Research

**Domain:** Nonprofit case management + donor platform (React + .NET + PostgreSQL + Flask ML + Azure)
**Researched:** 2026-04-06
**Confidence:** HIGH (verified against reference project code + official docs + community reports)

## Critical Pitfalls

### Pitfall 1: CSP Headers Break the React Frontend

**What goes wrong:**
You add a strict `Content-Security-Policy` header on the .NET backend (required for IS 414 grading) and the React app stops rendering entirely. The browser console shows CSP violations for inline scripts. Vite's build output may contain inline module preload helpers that violate `script-src 'self'`. CSS-in-JS or inline styles also break under `style-src 'self'`.

**Why it happens:**
The reference project's CSP is `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'`. This blocks ALL inline scripts and styles. Vite may inject small inline scripts for module preloading. Google Fonts (if used for Nunito) would be blocked by `default-src 'self'` since it loads from `fonts.googleapis.com` and `fonts.gstatic.com`.

**How to avoid:**
1. Self-host the Nunito font (download and serve from `/fonts/`) instead of loading from Google Fonts CDN.
2. Set Vite's `build.assetsInlineLimit: 0` to prevent any asset inlining.
3. Use a CSP that allows your actual needs:
   ```
   default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'
   ```
   Note: `'unsafe-inline'` for styles is often necessary for React component-level styles. Avoid `'unsafe-inline'` for scripts -- that defeats the purpose.
4. If any charting library (Recharts, Chart.js) injects inline styles, you need `style-src 'unsafe-inline'`.
5. Test CSP headers EARLY -- not on the last day.

**Warning signs:**
- Blank white page in production but works in dev (Vite dev server bypasses CSP)
- Console errors: "Refused to execute inline script" or "Refused to apply inline style"
- Fonts not loading, charts not rendering

**Phase to address:**
Phase 1 (Foundation) -- set CSP header from day one with the React app rendering. Adjust as features are added. Do NOT save security headers for the end.

---

### Pitfall 2: Cookie Authentication Fails Cross-Origin Between React and .NET

**What goes wrong:**
You log in successfully via the .NET API but subsequent React requests arrive unauthenticated. The auth cookie is never sent back. The `/api/auth/me` endpoint always returns `isAuthenticated: false`. Google OAuth callback works on the backend but the cookie is not set in the browser.

**Why it happens:**
The reference project uses `SameSite = SameSiteMode.Lax` in cookie config. In development, React on `localhost:3000` (Vite) and .NET on `localhost:5000` are different ORIGINS (different ports = cross-origin). With `SameSite=Lax`, cookies are only sent for top-level navigations, not for `fetch()` calls from a different origin.

In production on Azure, if React is served from a different domain than the API, the same problem occurs.

**How to avoid:**
1. **Development:** Use Vite proxy to route `/api/*` requests through the Vite dev server to the .NET backend. This makes everything same-origin from the browser's perspective:
   ```typescript
   // vite.config.ts
   server: {
     proxy: {
       '/api': {
         target: 'https://localhost:5001',
         changeOrigin: true,
         secure: false
       }
     }
   }
   ```
   With this approach, keep `SameSite=Lax` (more secure).

2. **Production:** Serve the React build output as static files FROM the .NET app (using `app.UseStaticFiles()` and a catch-all fallback). This makes frontend and API same-origin. No CORS needed in production at all.

3. **If you must use separate origins:** Change to `SameSite=None` + `SecurePolicy=Always` + `AllowCredentials()` in CORS + `credentials: 'include'` on every fetch call. But this is harder to get right and less secure.

4. **Always** include `credentials: 'include'` (or use `withCredentials: true` in axios) in frontend API calls when not using a proxy.

**Warning signs:**
- Login API returns 200 OK but next request is 401
- `Set-Cookie` header visible in login response but cookie not stored
- Works in Swagger/Postman but not from React
- Google OAuth redirect lands on frontend but user is not authenticated

**Phase to address:**
Phase 1 (Foundation) -- CORS + cookie config must be the FIRST thing validated, before building any features.

---

### Pitfall 3: EF Core Migration Disaster When Switching from SQLite to PostgreSQL

**What goes wrong:**
The reference project uses `UseSqlite()` for both DbContexts. When switching to `UseNpgsql()`, existing migrations break because they contain SQLite-specific SQL. Column types differ (e.g., `TEXT` vs `text`, `INTEGER` vs `integer`). Timestamp handling is different -- Npgsql has strict UTC requirements. Migration history becomes inconsistent if you try to patch rather than regenerate.

**Why it happens:**
EF Core migrations are provider-specific. The reference project's `20260323173923_InitialIdentity` migration was generated against SQLite. Running it against PostgreSQL will either fail or produce incorrect schema.

**How to avoid:**
1. **Never copy SQLite migrations.** Start fresh with PostgreSQL from the very first migration.
2. Install `Npgsql.EntityFrameworkCore.PostgreSQL` and remove any SQLite references.
3. Configure both DbContexts to use PostgreSQL:
   ```csharp
   builder.Services.AddDbContext<HarborDbContext>(options =>
       options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
   builder.Services.AddDbContext<AuthIdentityDbContext>(options =>
       options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
   ```
4. Use `DbContextOptions<TContext>` (typed) in constructors, not bare `DbContextOptions`.
5. When running migrations with two contexts, always specify `--context`:
   ```bash
   dotnet ef migrations add Initial --context HarborDbContext
   dotnet ef migrations add InitialIdentity --context AuthIdentityDbContext
   ```
6. Enable legacy timestamp behavior to avoid UTC conversion headaches:
   ```csharp
   AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
   ```

**Warning signs:**
- `Npgsql.PostgresException: 42601: syntax error` on migration
- `Cannot write DateTime with Kind=Unspecified to PostgreSQL type 'timestamp with time zone'`
- Tables created with wrong column types
- `__EFMigrationsHistory` conflicts between contexts

**Phase to address:**
Phase 1 (Foundation) -- PostgreSQL setup and clean migration must happen before ANY other development.

---

### Pitfall 4: 17-Table CSV Seeding Blows Up or Takes Forever

**What goes wrong:**
You use EF Core's `HasData()` in `OnModelCreating` to seed 8,100 rows from CSV. Every migration now contains thousands of `InsertData` operations. Migration files become enormous. Seeding fails on foreign key order (e.g., inserting `donations` before `supporters` exist). Reseeding requires a migration reset. Date formats in CSV don't parse correctly for PostgreSQL.

**Why it happens:**
`HasData()` bakes seed data into migrations -- fine for 10 roles, terrible for 8,100 data rows. Also, the CSV files have relational dependencies (residents reference safehouses, donations reference supporters, etc.) that must be loaded in correct order.

**How to avoid:**
1. **Use runtime seeding, not `HasData()`.** Write a `DataSeeder` class that runs at startup:
   ```csharp
   // In Program.cs after app.Build()
   using var scope = app.Services.CreateScope();
   var seeder = new DataSeeder(scope.ServiceProvider);
   await seeder.SeedAsync();
   ```
2. **Parse CSV with CsvHelper** (NuGet package) -- do not hand-roll CSV parsing.
3. **Seed in dependency order:**
   ```
   safehouses (9 rows) -> residents (60 rows) -> supporters (60 rows)
   -> partners (30 rows) -> donations (420 rows) -> donation_allocations (521 rows)
   -> education_records -> health_wellbeing_records -> process_recordings (2819 rows)
   -> home_visitations (1337 rows) -> incident_reports -> intervention_plans
   -> partner_assignments -> social_media_posts -> safehouse_monthly_metrics
   -> public_impact_snapshots -> in_kind_donation_items
   ```
4. **Handle date parsing explicitly** -- the CSV has formats like `2023-10-17` and `2023-10-17 00:00:00`. Use `DateTime.Parse()` with `CultureInfo.InvariantCulture`.
5. **Use `SaveChanges()` in batches** (per table, not per row) to avoid timeout issues.
6. **Guard against re-seeding:** Check `if (await dbContext.Safehouses.AnyAsync()) return;`

**Warning signs:**
- Migration file is megabytes in size
- `dotnet ef database update` takes minutes or hangs
- Foreign key constraint violations during seeding
- `FormatException` on date/boolean parsing from CSV

**Phase to address:**
Phase 1 (Foundation) -- database schema + seeding must be complete and validated before building CRUD pages.

---

### Pitfall 5: Azure Deployment Fails on Day 4 with No Time to Debug

**What goes wrong:**
Everything works locally. On deployment day (April 9-10), Azure App Service returns 500 errors, the database connection fails, the Flask ML service is unreachable, environment variables are missing, and you spend 3+ hours debugging infrastructure instead of recording demos.

**Why it happens:**
Azure deployment has many moving parts: App Service configuration, database firewall rules, connection strings with SSL requirements, environment variables, CORS origins, Google OAuth redirect URIs, Flask as a separate service. Students typically leave deployment to the end.

**How to avoid:**
1. **Deploy a skeleton app to Azure on Day 1.** Even a "Hello World" .NET API on Azure App Service + Azure Database for PostgreSQL. This validates:
   - Azure account works
   - Database connection with SSL (`sslmode=require` in connection string)
   - App Service runs .NET 10
   - You know the deploy workflow
2. **Azure PostgreSQL connection string format:**
   ```
   Host=myserver.postgres.database.azure.com;Database=harborofhope;Username=adminuser;Password=xxx;SSL Mode=Require;Trust Server Certificate=true
   ```
3. **Use Azure App Service Configuration** for environment variables, not `appsettings.json` for secrets.
4. **Flask ML service:** Deploy as a separate Azure App Service (Python runtime) or as a container. Configure internal networking or use the public URL with an API key.
5. **Google OAuth:** Add `https://yourapp.azurewebsites.net/signin-google` as an authorized redirect URI in Google Cloud Console BEFORE demo day.
6. **CORS origin:** Update to `https://yourapp.azurewebsites.net` in production config. Better yet, serve React from .NET so no CORS is needed.
7. **Deployment script:** Use `dotnet publish -c Release -o ./publish` and deploy the `publish` folder, or use GitHub Actions.

**Warning signs:**
- You are on Day 3 and have never deployed to Azure
- "It works on my machine" is your only testing
- Azure account shows $0 credits remaining
- Connection string works locally but not on Azure (missing SSL)

**Phase to address:**
Phase 1 (Foundation) -- deploy skeleton immediately. Phase 4 (Polish) -- final deployment with all services connected. NEVER deploy for the first time on submission day.

---

### Pitfall 6: Google OAuth Redirect URI Mismatch in Production

**What goes wrong:**
Google OAuth login works perfectly on `localhost:3000` but returns `Error 400: redirect_uri_mismatch` after deploying to Azure. Users cannot log in via Google on the production site.

**Why it happens:**
The Google Cloud Console OAuth credentials have `http://localhost:5000/signin-google` as the authorized redirect URI. In production, the callback URL is `https://yourapp.azurewebsites.net/signin-google`. Google requires an EXACT match -- protocol, domain, port, and path must all match.

**How to avoid:**
1. Add BOTH redirect URIs in Google Cloud Console:
   - `http://localhost:5001/signin-google` (development, HTTPS with dev cert)
   - `https://yourapp.azurewebsites.net/signin-google` (production)
2. Use environment-specific `FrontendUrl` configuration so the AuthController builds correct redirect URLs.
3. Test Google OAuth immediately after deploying to Azure -- do not wait until demo day.

**Warning signs:**
- Google login works locally but not on Azure
- Error 400 page from Google with "redirect_uri_mismatch"
- OAuth callback hits the wrong URL protocol (http vs https)

**Phase to address:**
Phase 3 (Security) or whenever Google OAuth is implemented. Must be verified before final deployment.

---

### Pitfall 7: HSTS Poisons localhost During Development

**What goes wrong:**
You enable `app.UseHsts()` during development. The browser caches the HSTS header for localhost and now ALL localhost applications (other projects, Vite dev server, etc.) are forced to HTTPS. Your Vite dev server on `http://localhost:3000` stops loading because the browser auto-redirects to `https://localhost:3000` which has no cert.

**Why it happens:**
HSTS headers tell the browser "never connect to this host via HTTP again for X seconds." When applied to `localhost`, this affects ALL localhost applications. The browser caches this aggressively and it persists across restarts.

**How to avoid:**
The reference project already handles this correctly:
```csharp
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
```
**Copy this pattern exactly.** Never enable HSTS in development. If you accidentally enable it:
1. Chrome: Go to `chrome://net-internals/#hsts`, find `localhost`, click "Delete"
2. Firefox: Clear all site data for localhost

**Warning signs:**
- `http://localhost:3000` auto-redirects to `https://localhost:3000`
- Browser shows "connection not secure" for localhost
- Other local development projects break

**Phase to address:**
Phase 1 (Foundation) -- set the HSTS guard from the start. Never remove the `IsDevelopment()` check.

---

### Pitfall 8: Flask ML Service Unreachable from .NET Backend

**What goes wrong:**
You train ML models in Jupyter notebooks and save them with joblib. You create a Flask API to serve predictions. The .NET backend calls the Flask API and gets connection refused, timeout, or CORS errors. In Azure, the two services cannot find each other.

**Why it happens:**
Flask runs on a different port (e.g., 5002) than .NET (5001). In development, this is another cross-origin issue. In production, two separate Azure App Services need to communicate via HTTP. Flask's default development server is single-threaded and not production-ready. Model files (.pkl/.joblib) may not be included in the deployment.

**How to avoid:**
1. **Development:** .NET calls Flask via `HttpClient` to `http://localhost:5002/predict`. No CORS needed (server-to-server calls don't have CORS). Add Flask URL to `appsettings.Development.json`.
2. **Production:** Deploy Flask to a separate Azure App Service (Python runtime). Store the Flask URL in Azure App Service Configuration for the .NET app.
3. **Flask setup:**
   ```python
   from flask import Flask, request, jsonify
   import joblib
   app = Flask(__name__)
   models = {}

   @app.before_first_request  # or load at module level
   def load_models():
       models['donor_churn'] = joblib.load('models/donor_churn.pkl')

   @app.route('/predict/donor-churn', methods=['POST'])
   def predict_donor_churn():
       data = request.get_json()
       prediction = models['donor_churn'].predict([data['features']])
       return jsonify({'prediction': prediction.tolist()})
   ```
4. **Include model files in deployment.** Add `.pkl`/`.joblib` files to the Flask project directory. Do NOT gitignore them (they need to deploy).
5. **Use Gunicorn in production** (`gunicorn app:app`), not Flask's built-in server.
6. **Timeout handling:** .NET `HttpClient` should have a reasonable timeout (30s) for ML predictions.

**Warning signs:**
- `HttpRequestException: Connection refused` in .NET logs
- Flask works in Postman but not from .NET
- Model files not found in production (FileNotFoundError)
- Flask app crashes under concurrent requests (development server)

**Phase to address:**
Phase 2 (Features) -- ML integration should be built and tested locally before deployment. Phase 4 (Polish) -- deployment verification.

---

### Pitfall 9: Lighthouse Accessibility Score Below 90 Due to Missing Basics

**What goes wrong:**
You build all features, the app looks great, but Lighthouse scores 60-70 on accessibility. Common failures: missing alt text on images, low color contrast, missing form labels, heading hierarchy violations, missing lang attribute, no skip-to-content link, focus indicators removed by CSS reset.

**Why it happens:**
Accessibility is not visible until you audit. Developers focus on visual design and functionality. The warm coral (#E8735A) on cream (#FFF8F0) palette may have insufficient contrast ratio (WCAG requires 4.5:1 for normal text, 3:1 for large text). Custom UI components often miss ARIA attributes.

**How to avoid:**
1. **Set `lang="en"` on the `<html>` tag** in `index.html`. Free 3-5 points.
2. **All images need `alt` attributes.** Decorative images get `alt=""`.
3. **All form inputs need associated `<label>` elements** (or `aria-label`).
4. **Check color contrast:** Coral #E8735A on white has 3.2:1 ratio -- FAILS for normal text. Use coral only for large text/headings, or darken to #D4603F (4.7:1) for body text.
5. **Heading hierarchy:** One `<h1>` per page, then `<h2>`, `<h3>` in order. Never skip levels.
6. **Focus indicators:** Never use `outline: none` globally. Ensure all interactive elements have visible focus styles.
7. **Button elements for actions, anchor elements for navigation.** Never use `<div onClick>`.
8. **ARIA for custom components:** Sidebar nav needs `role="navigation"`, data tables need proper `<th scope>`.
9. **Run Lighthouse after EACH page is built,** not at the end. It takes 30 seconds per page.

**Warning signs:**
- No `alt` attributes anywhere in JSX
- Using `<div>` for clickable elements
- Color contrast checker shows failures for primary palette
- CSS includes `* { outline: none; }`

**Phase to address:**
Every phase -- accessibility must be built in from the start. Run Lighthouse on each page immediately after building it.

---

### Pitfall 10: Two DbContexts Sharing One PostgreSQL Database Create Migration Conflicts

**What goes wrong:**
The reference project uses separate databases (two SQLite files) for Identity and app data. When consolidating to a single PostgreSQL database (common on Azure to save cost), migrations from both contexts collide. Both try to create the `__EFMigrationsHistory` table. Tables from one context's migration may depend on another context's tables not yet created.

**Why it happens:**
The reference project's architecture with two `DbContext`s works cleanly with two separate SQLite databases. On a single PostgreSQL database, both contexts share the migration history table and schema namespace.

**How to avoid:**
Option A: **Use a single DbContext** that inherits from `IdentityDbContext<ApplicationUser>` and also includes all application `DbSet<>` properties. This is simplest for a 4-day project.

Option B: **Separate schemas per context** (if you need two contexts):
```csharp
// In AuthIdentityDbContext
protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);
    builder.HasDefaultSchema("identity");
}

// Migration command
dotnet ef migrations add Init --context AuthIdentityDbContext --output-dir Migrations/Identity
dotnet ef migrations add Init --context HarborDbContext --output-dir Migrations/Harbor
```

**Recommendation for this project:** Use a single DbContext. Two contexts add complexity with zero benefit when using one database. The 4-day timeline does not afford debugging migration conflicts.

**Warning signs:**
- `Npgsql.PostgresException: 42P07: relation "__EFMigrationsHistory" already exists`
- Migrations from one context reference tables from another
- `dotnet ef database update` updates the wrong context

**Phase to address:**
Phase 1 (Foundation) -- decide single vs. dual context BEFORE creating any migrations.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single DbContext for Identity + data | Simpler migrations, faster setup | Harder to separate concerns later | Always acceptable for 4-day project |
| `'unsafe-inline'` in `style-src` CSP | Charts and styled components work | Weaker CSP for style injection | Acceptable -- React inline styles are common and safe |
| Hardcoded seed data order | No need for dependency detection | Breaks if schema changes | Acceptable for fixed dataset |
| Loading all ML models at Flask startup | Simple code, fast predictions | High memory usage, slow cold start | Acceptable with 8 models at small scale |
| Serving React static files from .NET | Eliminates CORS entirely | Frontend and backend coupled | Best approach for this project |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| React <-> .NET Auth | Not including `credentials: 'include'` in fetch calls | Use Vite proxy in dev, serve static files from .NET in prod |
| .NET <-> PostgreSQL | Using SQLite connection string format | Use `Host=;Database=;Username=;Password=;SSL Mode=Require` |
| .NET <-> Flask ML | Calling Flask from React (CORS issue) | Call Flask from .NET backend only (server-to-server, no CORS) |
| Google OAuth <-> Azure | Forgetting to add production redirect URI | Add both localhost AND Azure URIs to Google Cloud Console |
| Vite <-> CSP | Assuming Vite build is CSP-clean | Set `assetsInlineLimit: 0`, self-host fonts, test CSP early |
| EF Core <-> CSV dates | Assuming CSV dates parse automatically | Use `DateTime.Parse(value, CultureInfo.InvariantCulture)` explicitly |
| Azure PostgreSQL <-> EF Core | Not requiring SSL in connection string | Always include `SSL Mode=Require;Trust Server Certificate=true` |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all 2,819 process recordings at once | Page takes 5+ seconds, browser hangs | Server-side pagination (`?page=1&pageSize=25`) | Immediately with full dataset |
| N+1 queries on related entities | Each table row triggers additional DB queries | Use `.Include()` for related data | With 60+ residents * related records |
| Flask loading models per request | 2-5s response time per prediction | Load models once at startup | First prediction request |
| No pagination on admin tables | Browser DOM has 8,000+ elements | Paginate all data tables, 25 rows default | Any table with 100+ rows |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Using `SameSite=None` without `Secure` | Cookies sent over HTTP, session hijacking | Always pair `SameSite=None` with `SecurePolicy=Always` |
| CSP via `<meta>` tag instead of HTTP header | `frame-ancestors` and `report-uri` directives ignored | IS 414 requires HTTP header -- use middleware, not meta tag |
| Exposing resident PII in public API | GDPR violation, sensitive data exposure | Public endpoints return only aggregated/anonymized data |
| Not sanitizing form inputs server-side | SQL injection, XSS | Use EF Core parameterized queries (default), validate DTOs with DataAnnotations |
| Default Identity password `Rootkit2026!Admin` in production | Account compromise | Use environment variables for default admin credentials in production |
| Missing `[Authorize]` on admin endpoints | Unauthenticated access to case management data | Apply `[Authorize(Policy = "Admin")]` to all admin controllers |
| MFA not tested before demo | Demo fails when showing MFA requirement | Create MFA-enabled test account and verify TOTP flow works |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading states on data-heavy pages | Users think app is broken | Show skeleton loaders or spinners during data fetch |
| Delete without confirmation | Accidental data loss | Modal confirmation dialog (required by IS 414 spec) |
| Mobile sidebar always visible | Content hidden on small screens | Collapsible hamburger menu on mobile |
| Dark mode toggle resets on navigation | Annoying flicker, inconsistent experience | Store preference in cookie (per spec), read on page load |
| No empty states for tables | Blank page looks broken | "No records found" message with action suggestion |
| Charts unreadable on mobile | Data visualization useless | Use responsive chart containers, simplify on mobile |

## "Looks Done But Isn't" Checklist

- [ ] **Auth:** Login works but logout does not clear the cookie -- verify `POST /api/auth/logout` clears session AND frontend state
- [ ] **CRUD:** Create/Edit forms work but validation errors are not shown -- verify server validation errors display in UI
- [ ] **Delete:** Delete button exists but no confirmation dialog -- IS 414 requires confirmation dialogs
- [ ] **Pagination:** Page 1 loads but "Next" button does nothing -- verify page 2+ returns correct data
- [ ] **Dark mode:** Toggle works but cookie is not set -- verify `document.cookie` contains the preference and persists across pages
- [ ] **CSP:** Header is set but only in development -- verify header present in Azure production response
- [ ] **HSTS:** Header is set but not in production -- verify `Strict-Transport-Security` in production response headers
- [ ] **HTTPS:** Works locally with dev cert but Azure serves HTTP -- verify Azure is configured for HTTPS-only
- [ ] **Privacy policy:** Page exists but no cookie consent banner -- GDPR requires opt-in consent
- [ ] **MFA:** TOTP setup page exists but verification flow is not tested -- scan QR, enter code, verify it works
- [ ] **ML predictions:** Flask endpoint works in isolation but .NET never calls it -- verify end-to-end from React -> .NET -> Flask -> response
- [ ] **Responsive:** Desktop looks good but never tested on mobile viewport -- open Chrome DevTools, toggle device toolbar
- [ ] **Accessibility:** Pages look complete but Lighthouse score is 65 -- run audit on EVERY page

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CSP blocks React rendering | LOW | Widen CSP directives, redeploy. Takes 10 minutes. |
| Cookie auth not working cross-origin | MEDIUM | Add Vite proxy or serve static files from .NET. Takes 1-2 hours. |
| SQLite migrations copied to PostgreSQL | MEDIUM | Delete Migrations folder, regenerate from scratch. Takes 30-60 minutes. |
| CSV seeding fails on foreign keys | LOW | Reorder seed operations. Takes 30 minutes. |
| Azure deployment fails on Day 4 | HIGH | Could take 3+ hours debugging. Deploy earlier to prevent this entirely. |
| Google OAuth redirect mismatch | LOW | Add correct URI to Google Console. Takes 5 minutes + propagation. |
| HSTS poisoned localhost | LOW | Clear HSTS in browser settings. Takes 2 minutes. |
| Flask unreachable from .NET | MEDIUM | Verify URLs, check firewall, test with curl. Takes 30-60 minutes. |
| Lighthouse score below 90 | MEDIUM | Systematic fixes (alt, labels, contrast, headings). Takes 1-2 hours per page. |
| Two DbContext migration conflict | HIGH | Merge to single context, regenerate migrations, reseed. Takes 2-3 hours. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CSP breaks React | Phase 1: Foundation | React renders with CSP header active in browser |
| Cookie auth cross-origin | Phase 1: Foundation | Login persists across page navigation in React |
| SQLite -> PostgreSQL migration | Phase 1: Foundation | `dotnet ef database update` succeeds against PostgreSQL |
| CSV seeding failures | Phase 1: Foundation | All 17 tables populated, row counts match CSV files |
| Azure deployment failure | Phase 1: Foundation (skeleton) + Phase 4: Polish (full) | App accessible at `*.azurewebsites.net` |
| Google OAuth redirect mismatch | Phase 3: Security | Google login works on Azure URL |
| HSTS in development | Phase 1: Foundation | `IsDevelopment()` guard present in middleware pipeline |
| Flask ML unreachable | Phase 2: Features | .NET endpoint returns ML prediction from Flask |
| Lighthouse < 90 | Every phase | Lighthouse accessibility >= 90 on each completed page |
| DbContext migration conflict | Phase 1: Foundation | Single context decision made, migrations clean |

## Sources

- Reference project code: `/Users/waylansmac/AuthN and AuthZ/RootkitIdentityW26/` -- actual patterns for auth, CORS, CSP, HSTS
- [ASP.NET Core SameSite cookies](https://learn.microsoft.com/en-us/aspnet/core/security/samesite?view=aspnetcore-10.0) -- official docs on cookie behavior
- [Andrew Lock: Making authenticated cross-origin requests with ASP.NET Core Identity](https://andrewlock.net/making-authenticated-cross-origin-requests-with-aspnetcore-identity/) -- deep dive on cookie + CORS
- [Npgsql EF Core Provider](https://www.npgsql.org/efcore/) -- PostgreSQL provider docs
- [EF Core Data Seeding](https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding) -- HasData vs runtime seeding
- [Seeding Initial Data in EF Core 10](https://codewithmukesh.com/blog/seeding-initial-data-efcore/) -- UseSeeding vs HasData comparison
- [React CSP Guide](https://www.stackhawk.com/blog/react-content-security-policy-guide-what-it-is-and-how-to-enable-it/) -- CSP + React interaction
- [Vite CSP nonce issue #9719](https://github.com/vitejs/vite/issues/9719) -- Vite inline script CSP problems
- [Azure PostgreSQL TLS/SSL](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/how-to-connect-tls-ssl) -- SSL connection requirements
- [HSTS in ASP.NET Core](https://joonasw.net/view/hsts-in-aspnet-core/) -- why HSTS breaks localhost
- [Rick Strahl: HSTS localhost fix](https://weblog.west-wind.com/posts/2022/Oct/24/HSTS-Fix-automatic-rerouting-of-http-to-https-on-localhost-in-Web-Browsers) -- recovery steps
- [Lighthouse accessibility scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring) -- how scores are calculated
- [Azure App Service Flask deployment](https://learn.microsoft.com/en-us/azure/app-service/quickstart-python) -- Flask on Azure
- [Multiple DbContext in EF Core](https://www.milanjovanovic.tech/blog/using-multiple-ef-core-dbcontext-in-single-application) -- schema separation patterns

---
*Pitfalls research for: Harbor of Hope nonprofit case management + donor platform*
*Researched: 2026-04-06*

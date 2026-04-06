<!-- GSD:project-start source:PROJECT.md -->
## Project

**Harbor of Hope**

A full-stack web application for "Harbor of Hope," a nonprofit operating safe homes for girls who are survivors of trafficking in Central America. The app serves three audiences: case managers who track residents across safehouses, donors who view their contribution impact, and the public who learn about the mission and donate. Built as a BYU INTEX project spanning IS 413 (features), IS 414 (security), and IS 455 (ML/analytics).

**Core Value:** Case managers can efficiently track and manage residents across safehouses while donors can see exactly how their contributions create impact — all secured with proper authentication and role-based access.

### Constraints

- **Tech stack**: React + TypeScript (Vite) frontend, .NET 10 / C# Web API backend, PostgreSQL, Python ML — specified by course
- **Timeline**: Due April 10, 2026 at 10:00 AM — 4 days from initialization
- **Password policy**: RequiredLength=14, RequireDigit=false, RequireLowercase=false, RequireNonAlphanumeric=false, RequireUppercase=false, RequiredUniqueChars=1 — from IS 414 class
- **Security**: CSP must be HTTP header (not meta tag), HSTS enabled, delete confirmations required
- **Database**: PostgreSQL on Azure (not SQLite in production)
- **ML**: Notebooks must be fully executable top-to-bottom, Jupyter format in `ml-pipelines/` folder
- **Deployment**: Microsoft Azure (App Service + Azure Database for PostgreSQL) — account not yet set up
- **Test accounts**: Must create admin (no MFA), donor (no MFA, linked to donations), and MFA-enabled account before submission
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies (LOCKED by course requirements)
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.x | Frontend UI library | Locked by course. React 19 is current stable, matches reference project |
| TypeScript | ~5.7 | Type safety for frontend | Locked by course. Matches reference project's pinned version |
| Vite | 6.x | Frontend build tool + dev server | Locked by course. v6 is stable, matches reference project. Do NOT use Vite 8 (too new, less documented) |
| .NET 10 (LTS) | 10.0.x | Backend Web API | Locked by course. Released Nov 2025, LTS through Nov 2028. Reference project already targets net10.0 |
| ASP.NET Identity | 10.0.x | Authentication + RBAC | Locked by course. Exact pattern proven in RootkitIdentityW26 reference project |
| PostgreSQL | 16+ | Primary database | Locked by course. Azure Database for PostgreSQL Flexible Server |
| Python + Flask | 3.12+ / Flask 3.x | ML model serving API | Locked by course. Serves 8 scikit-learn pipelines as REST endpoints |
| scikit-learn | 1.6.x | ML model training | Locked by course. Used in Jupyter notebooks for all 8 pipelines |
| Microsoft Azure | App Service + Azure DB for PostgreSQL | Cloud hosting | Locked by course. App Service for .NET backend, separate App Service for Flask |
### Frontend Component Library
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| MUI (Material UI) | 6.x | Component library for warm nonprofit UI | Use v6, NOT v7. v6 has far more documentation, tutorials, and community answers. v7 shipped March 2026 with breaking changes (slot API standardization, package layout changes). For a 4-day sprint you need max googleability. MUI's createTheme makes coral/cream palette trivial: set primary.main to #E8735A, background.default to #FFF8F0, and typography.fontFamily to Nunito. Built-in dark mode via colorSchemes. Every component supports borderRadius via theme.shape.borderRadius. |
| @emotion/react + @emotion/styled | 11.x | CSS-in-JS runtime for MUI v6 | Required peer dependency for MUI v6. v6 still uses Emotion (Pigment CSS is opt-in only). |
- **Not Bootstrap:** Reference project uses Bootstrap but it lacks theming depth for the warm coral/cream/Nunito design system. Bootstrap looks "Bootstrap-y" and is hard to make feel empathetic/nonprofit-warm.
- **Not Chakra UI:** Good alternative, but smaller ecosystem, less component variety. MUI has DataGrid, DatePicker, etc. in MUI X.
- **Not Ant Design:** Enterprise/Chinese design language. Wrong aesthetic for a nonprofit empathy-focused app.
- **Not Tailwind:** Not a component library. Would require building every component from scratch. Wrong choice for a 4-day sprint.
### Charting Library
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Recharts | 3.8.x | Donation trends, resident outcomes, analytics charts | Best balance of simplicity and capability. Declarative React API (each axis, line, bar is a React component). 24.8K GitHub stars, active releases through March 2026. Perfect for the 6-8 chart types needed: line charts (donation trends), bar charts (safehouse metrics), pie charts (allocation breakdown), area charts (resident outcomes over time). Built-in responsive container, tooltips, legends, and animations. |
- **Not Nivo:** Beautiful charts but documentation is sparse and property objects are undocumented. Harder to debug in a 4-day sprint.
- **Not Victory:** Good accessibility but lower adoption, more verbose API.
- **Not Chart.js/react-chartjs-2:** Canvas-based, not SVG. Harder to style consistently with MUI theme colors.
- **Not D3 directly:** Way too low-level for this timeline. Recharts wraps D3 internally.
### Backend Libraries (.NET)
| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.1 | EF Core provider for PostgreSQL | Official PostgreSQL provider for EF Core 10. Replaces Microsoft.EntityFrameworkCore.Sqlite from reference project. Supports JSON complex types, partial JSON updates. UseNpgsql() instead of UseSqlite(). |
| Microsoft.EntityFrameworkCore | 10.0.x | ORM for database access | Already used in reference project at 10.0.0. Handles all 17 tables, migrations, seeding. |
| Microsoft.EntityFrameworkCore.Design | 10.0.x | Design-time migrations | Required for `dotnet ef migrations add` commands. Already in reference project. |
| Microsoft.AspNetCore.Identity.EntityFrameworkCore | 10.0.x | Identity storage in PostgreSQL | Already proven in reference project at 10.0.0. Stores users, roles, claims in PostgreSQL instead of SQLite. |
| Microsoft.AspNetCore.Authentication.Google | 10.0.3+ | Google OAuth external login | Latest stable for .NET 10. Reference project has 10.0.5. Proven pattern: AddGoogle() with ClientId/ClientSecret from user secrets. |
| CsvHelper | 33.1.0 | Read CSV files for database seeding | Industry standard for .NET CSV parsing. Map CSV columns to entity classes. Use in a custom seeder that runs on first startup to populate all 17 tables from data/lighthouse_csv_v7/. |
| Swashbuckle.AspNetCore | 6.6.2+ | Swagger/OpenAPI UI for API testing | Reference project already uses it. While .NET 10 has built-in OpenAPI, Swashbuckle provides the familiar Swagger UI for development/grading. Keep it simple. |
### Frontend Libraries (npm)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-router-dom | 7.x | Client-side routing | Already used in reference project at ^7.4.0. Handles all page navigation: landing, dashboard, CRUD pages, auth pages. |
| react-hook-form | 7.72.x | Form state management | Every CRUD form: resident records, donations, process recordings, home visitations. Performant (no re-renders on every keystroke). |
| @hookform/resolvers | 5.2.x | Validation resolver for react-hook-form | Connects Zod schemas to react-hook-form. Ensures type-safe form validation. |
| zod | 4.x | Schema validation | Define validation schemas for all form inputs. TypeScript-first with static type inference. v4 is 14x faster than v3 with 57% smaller core. Use @zod/mini (1.9KB gzipped) if bundle size matters. |
| axios | 1.x | HTTP client for API calls | Preferred over fetch for: request/response interceptors (attach auth cookies globally), automatic JSON parsing, consistent error handling. withCredentials: true for cookie-based auth. |
| react-icons | 5.6.x | Icon library | Bundles Font Awesome, Material, Heroicons in one package. Tree-shakable (only import what you use). For sidebar nav icons, dashboard cards, action buttons. |
| react-cookie-consent | 10.0.x | GDPR cookie consent banner | Required by spec. Drop-in banner component. Customizable to match coral/cream theme. |
| js-cookie | 3.x | Cookie read/write utility | Dark mode toggle stored as browser cookie (spec requirement). Set/get "darkMode" cookie value. |
### ML/Python Stack
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Flask | 3.x | Lightweight web framework for ML API | Serves prediction endpoints. One route per ML pipeline (8 total). Simpler than FastAPI for this use case (no async needed, models are fast). |
| flask-cors | 4.x | CORS handling for Flask | Required so .NET backend or React frontend can call Flask API. Allow origins for your Azure domain. |
| scikit-learn | 1.6.x | ML model training and inference | All 8 pipelines: classification (churn, readiness), regression (forecasting), clustering. Trained in Jupyter, serialized with joblib. |
| joblib | 1.4.x | Model serialization | Save trained models as .pkl files. Load once at Flask app startup, serve predictions from memory. Faster and more reliable than pickle for numpy arrays inside sklearn estimators. |
| pandas | 2.2.x | Data manipulation | Read CSVs in Jupyter notebooks, feature engineering, data preprocessing. Also used in Flask for incoming prediction request transformation. |
| numpy | 2.x | Numerical operations | Required by scikit-learn and pandas. Array operations in pipelines. |
| gunicorn | 22.x | Production WSGI server | Flask's built-in server is development-only. Gunicorn serves Flask in production on Azure App Service (Linux). |
| jupyter | 4.x | Interactive notebooks | All 8 ML pipelines developed as .ipynb files in ml-pipelines/ folder. Must be fully executable top-to-bottom per spec. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint 9.x + typescript-eslint | TypeScript linting | Already configured in reference project. Flat config format (eslint.config.js). |
| Prettier 3.x | Code formatting | Already in reference project. Prevents style debates. |
| @vitejs/plugin-react 4.x | Vite React integration | Already in reference project. Fast HMR, JSX transform. |
| dotnet-ef (CLI tool) | EF Core migrations | Run `dotnet tool install --global dotnet-ef`. Generate and apply database migrations. |
## Installation
### Frontend
# Scaffold project
# Core dependencies
# Type definitions
# Dev dependencies (auto-included by Vite template)
# eslint, prettier, typescript, @vitejs/plugin-react already included
### Backend (.NET)
# Create project
# Core packages
# Tools
### ML/Python
# Create virtual environment
# Core packages
# Freeze for deployment
### Google Font (Nunito)
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| MUI v6 | Chakra UI | If you want simpler API with less component variety. Not this project -- MUI's DataGrid and theming depth are needed. |
| MUI v6 | MUI v7 | If starting a project with 2+ months timeline. v7 has better slot API but too new for a 4-day sprint. |
| Recharts | Nivo | If you need server-side rendered charts or Canvas rendering for huge datasets. Not this project -- ~8K rows is small. |
| Recharts | Chart.js (react-chartjs-2) | If you need Canvas-based rendering or are already familiar with Chart.js. Recharts is more React-idiomatic. |
| axios | fetch (native) | If bundle size is critical and you don't need interceptors. This project benefits from axios interceptors for auth cookie management. |
| react-hook-form + zod | Formik + Yup | If team already knows Formik. react-hook-form is more performant (fewer re-renders) and zod v4 is faster than Yup. |
| Flask | FastAPI | If you need async endpoints or auto-generated OpenAPI docs. Flask is simpler for synchronous scikit-learn prediction calls and is the course-specified technology. |
| CsvHelper | Manual StreamReader | Never. CsvHelper handles edge cases (quoted fields, embedded commas, encoding) that manual parsing misses. |
| Swashbuckle | Microsoft.AspNetCore.OpenApi (built-in) | If building a new .NET 10 project from scratch. But Swashbuckle's Swagger UI is more useful for development and matches the reference project. |
| joblib | pickle | If serializing non-sklearn objects. joblib is optimized for numpy arrays inside sklearn estimators. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Bootstrap | Wrong aesthetic for warm nonprofit UI. Hard to customize deeply. Every Bootstrap site looks like Bootstrap. | MUI with custom createTheme |
| Tailwind CSS | Not a component library. Would require building every component from scratch. Fatal for a 4-day timeline. | MUI (pre-built components) |
| MUI v7 | Released March 2026. Breaking changes in slot API and package layout. Limited tutorials/Stack Overflow answers. | MUI v6 (stable, well-documented) |
| Vite 8 | Too new (announced recently). Reference project uses Vite 6. Stick with proven. | Vite 6.x |
| SQLite | Not a production DBMS. Course requires PostgreSQL. Reference project uses SQLite but spec says Azure PostgreSQL. | PostgreSQL via Npgsql |
| Entity Framework InMemory | Not a real database. Cannot test PostgreSQL-specific features. | PostgreSQL locally via Docker or direct install |
| Redux / Zustand | Overkill for this app. No complex client-side state management needed. Server state is in the database, fetched via API. | React useState/useContext + axios calls |
| NextJS / Remix | Course specifies Vite SPA. These are meta-frameworks with SSR complexity. Not needed. | Vite + React Router |
| Django / FastAPI | Course specifies Flask for ML serving. Don't add a second Python framework. | Flask |
| pickle (for models) | Less efficient for sklearn objects with large numpy arrays. Security risks with untrusted pickle files. | joblib |
| D3.js (directly) | Extremely low-level. Would take days to build one chart. | Recharts (wraps D3) |
| Formik | Performance issues with large forms (re-renders entire form on every change). Less actively maintained than react-hook-form. | react-hook-form |
| Yup | Slower than Zod v4 (14x parsing speed improvement). No TypeScript-first design. | zod v4 |
## Stack Patterns
### Pattern 1: MUI Theme for Warm Nonprofit Aesthetic
### Pattern 2: Dark Mode via Cookie
### Pattern 3: ASP.NET Identity with PostgreSQL (adapt from reference)
### Pattern 4: CSV Seeding with CsvHelper
### Pattern 5: Flask ML API with joblib
# app.py
# Load all models once at startup
### Pattern 6: Azure Deployment Architecture
- Serve React build as static files from .NET App Service (no separate Static Web App needed). Configure fallback routing in .NET for SPA client-side routes.
- Flask gets its own App Service because it needs a Python runtime. .NET backend proxies or React calls Flask directly (configure CORS).
- Single PostgreSQL Flexible Server with two databases (cheaper than two servers).
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| MUI @mui/material 6.x | React 18 or 19 | v6 supports both. Use React 19 (matches reference project). |
| MUI @mui/material 6.x | @emotion/react 11.x, @emotion/styled 11.x | Required peer deps. Install together. |
| Recharts 3.8.x | React 18 or 19 | Full compatibility confirmed. |
| react-router-dom 7.x | React 19 | Reference project already uses 7.4.0 with React 19. |
| react-hook-form 7.72.x | React 19 | Confirmed compatible. |
| zod 4.x | @hookform/resolvers 5.2.x | v5.2.2 includes fix for Zod 4 resolver output type. |
| Npgsql.EFCore.PostgreSQL 10.0.1 | EF Core 10.0.x | Requires >= 10.0.4 EF Core. Use latest 10.0.x. |
| .NET 10 | PostgreSQL 14-17 | Npgsql supports PostgreSQL 12+, but Azure Flexible Server runs 14-17. |
| scikit-learn 1.6.x | Python 3.12+ | Full compatibility. Do not use Python 3.13+ (some native deps may lag). |
| Flask 3.x | Python 3.12+ | Werkzeug 3.x included. |
## Sources
- [Npgsql EF Core 10.0 Release Notes](https://www.npgsql.org/efcore/release-notes/10.0.html) -- Verified Npgsql 10.0.1 features (JSON complex types, partial updates) -- HIGH confidence
- [NuGet: Npgsql.EntityFrameworkCore.PostgreSQL 10.0.1](https://www.nuget.org/packages/npgsql.entityframeworkcore.postgresql) -- Verified version and EF Core 10.0.4+ requirement -- HIGH confidence
- [Microsoft Learn: Google OAuth in ASP.NET Core 10](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/google-logins?view=aspnetcore-10.0) -- Official Google auth setup for .NET 10 -- HIGH confidence
- [NuGet: Microsoft.AspNetCore.Authentication.Google 10.0.3](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.Google) -- Verified latest stable version -- HIGH confidence
- [npm: recharts 3.8.1](https://www.npmjs.com/package/recharts) -- Verified latest version, active maintenance -- HIGH confidence
- [npm: @mui/material](https://www.npmjs.com/package/@mui/material) -- Verified v7.3.9 is latest (so v6.x is previous stable) -- HIGH confidence
- [MUI Theming Documentation](https://mui.com/material-ui/customization/theming/) -- createTheme API for palette, typography, shape -- HIGH confidence
- [MUI Palette Documentation](https://mui.com/material-ui/customization/palette/) -- Custom color configuration -- HIGH confidence
- [npm: react-hook-form 7.72.1](https://www.npmjs.com/package/react-hook-form) -- Verified latest version -- HIGH confidence
- [npm: zod 4.3.6](https://www.npmjs.com/package/zod) -- Verified v4 with 14x performance improvement -- HIGH confidence
- [Speakeasy: Nivo vs Recharts](https://www.speakeasy.com/blog/nivo-vs-recharts) -- Comparison analysis favoring Recharts for simplicity -- MEDIUM confidence
- [NuGet: CsvHelper 33.1.0](https://www.nuget.org/packages/csvhelper/) -- Verified latest version -- HIGH confidence
- [codewithmukesh: EF Core 10 Seeding](https://codewithmukesh.com/blog/seeding-initial-data-efcore/) -- UseSeeding/UseAsyncSeeding patterns -- MEDIUM confidence
- [Microsoft Learn: Azure Flask + PostgreSQL Tutorial](https://learn.microsoft.com/en-us/azure/app-service/tutorial-python-postgresql-app-flask) -- Azure deployment pattern -- HIGH confidence
- [Announcing .NET 10](https://devblogs.microsoft.com/dotnet/announcing-dotnet-10/) -- Confirmed Nov 2025 release, LTS -- HIGH confidence
- [MUI v7 Migration Guide](https://mui.com/material-ui/migration/upgrade-to-v7/) -- Breaking changes documented -- HIGH confidence
- Reference project: `/Users/waylansmac/AuthN and AuthZ/RootkitIdentityW26/` -- Proven auth pattern with .NET 10 + React 19 + React Router 7 -- HIGH confidence (local, verified)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

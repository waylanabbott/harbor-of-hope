# Phase 2: Admin CRUD + Dashboard - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete admin experience: dashboard with metric cards and OKR gauge, caseload inventory (residents) CRUD with filters/search/pagination, donors & contributions CRUD, process recordings CRUD, home visitations CRUD. All admin pages behind sidebar navigation. All forms sanitized, all deletes confirmed.

</domain>

<decisions>
## Implementation Decisions

### Table Layout
- **D-01:** Use MUI Table (not DataGrid) for all data tables — lightweight, full theme control, manual sort/filter/pagination
- **D-02:** Standard row density showing 5-6 key columns, with expandable rows to reveal all fields on click
- **D-03:** Color-coded risk badges on resident rows (Critical=red, High=orange, Medium=yellow, Low=green)

### Dashboard Design
- **D-04:** Metric cards use big number style — large stat number with label and subtle trend indicator, coral accent color
- **D-05:** 4 metric cards: Total Residents, Active Cases, Total Donations, Reintegration Rate
- **D-06:** OKR metric (Reintegration Rate) displayed as a circular gauge/progress ring, prominently placed
- **D-07:** Recent donations table and residents-needing-attention table below the metric cards

### CRUD Flow
- **D-08:** Create/Edit forms appear in MUI Dialog (modal) overlays — user stays in context of the table
- **D-09:** Delete confirmation is a simple MUI Dialog: "Are you sure you want to delete [name]?" with Cancel and red Delete button
- **D-10:** All form inputs sanitized — use react-hook-form + zod for validation, server-side input encoding

### Sidebar Navigation
- **D-11:** Collapsible MUI Drawer sidebar — full icons + labels, collapses to icon-only on smaller screens
- **D-12:** Flat navigation list: Dashboard, Residents, Donors, Sessions, Visits, Reports — all top-level with icons
- **D-13:** Replace the current AppBar-only layout with sidebar + content area layout for admin pages

### Claude's Discretion
- Pagination size (10/25/50 per page — standard approach)
- Sort column defaults per table
- Chart library choice for dashboard charts (Recharts recommended from stack research)
- Form field grouping/tabs for complex resident forms (40+ fields)
- Loading states and skeleton screens
- Error handling UI patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 Artifacts
- `.planning/phases/01-foundation-auth/01-01-SUMMARY.md` — Entity classes, AppDbContext, seed data patterns
- `.planning/phases/01-foundation-auth/01-02-SUMMARY.md` — Auth endpoints, security headers, test accounts

### Stack & Architecture
- `.planning/research/STACK.md` — MUI v6, Recharts, react-hook-form + zod, CsvHelper
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, API structure

### Reference Project
- `/Users/waylansmac/AuthN and AuthZ/RootkitIdentityW26/` — Auth patterns (already adapted in Phase 1)

### Existing Codebase
- `frontend/src/theme.ts` — MUI theme config (coral/cream/Nunito)
- `frontend/src/components/layout/AppLayout.tsx` — Current layout (needs sidebar upgrade)
- `frontend/src/context/AuthContext.tsx` — Auth state for role checks
- `frontend/src/components/auth/ProtectedRoute.tsx` — Role-based route protection
- `backend/HarborOfHope.API/Data/AppDbContext.cs` — All 17 DbSets with indexes
- `backend/HarborOfHope.API/Data/Entities/` — All entity classes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AuthContext` + `ProtectedRoute` — admin routes already gated, role checks available via `useAuth()`
- `AppLayout` — has AppBar with nav links, needs upgrade to include sidebar Drawer
- MUI theme — warm nonprofit palette already configured in `theme.ts`
- `authApi.ts` — fetch wrapper pattern with `credentials: 'include'` to reuse for CRUD API calls

### Established Patterns
- Cookie-based auth with `credentials: 'include'` on all API calls
- TypeScript types in `frontend/src/types/` directory
- Pages in `frontend/src/pages/` directory
- Components in `frontend/src/components/` directory
- Backend controllers in `backend/HarborOfHope.API/Controllers/`
- Backend entities in `backend/HarborOfHope.API/Data/Entities/`

### Integration Points
- New API controllers needed: ResidentsController, SupportersController, DonationsController, ProcessRecordingsController, HomeVisitationsController, DashboardController
- Frontend routes added to `App.tsx` inside the admin ProtectedRoute wrapper
- Sidebar nav items link to the admin routes
- Dashboard fetches aggregated data from a DashboardController endpoint

</code_context>

<specifics>
## Specific Ideas

- Expandable table rows to show all resident fields (40+ columns) without navigating away
- Resident risk badges should use MUI Chip component with color variants
- OKR gauge should be a Recharts RadialBarChart or similar circular visualization
- Forms for residents should handle the many boolean subcategory fields (sub_cat_orphaned, sub_cat_trafficked, etc.) as checkbox groups

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-admin-crud-dashboard*
*Context gathered: 2026-04-06*

# Phase 2: Admin CRUD + Dashboard - Research

**Researched:** 2026-04-06
**Domain:** Full-stack CRUD interfaces (React + MUI frontend, ASP.NET Core controllers, EF Core data layer) with admin dashboard
**Confidence:** HIGH

## Summary

Phase 2 builds the complete admin experience on top of Phase 1's foundation: 17 EF Core entities, cookie-based auth, MUI theme, and role-gated routes. The work divides into three major subsystems: (1) backend CRUD controllers with pagination/sorting/filtering for residents, supporters, donations, process recordings, and home visitations plus a dashboard aggregation endpoint; (2) frontend reusable components -- sidebar navigation, data tables, form dialogs, metric cards, confirmation dialogs; (3) page-level integration wiring forms to APIs, tables to data, and the dashboard to aggregated stats.

The stack is fully locked: MUI Table (not DataGrid), react-hook-form + zod for forms, Recharts for the OKR gauge and dashboard charts, MUI Drawer for sidebar. The existing `authApi.ts` fetch-with-credentials pattern provides the API call template. The main architectural decision is introducing DTOs to avoid exposing raw entities (especially `notes_restricted` fields) and building a reusable `DataTable` component that all CRUD pages share.

**Primary recommendation:** Build backend controllers first (they can be tested via Swagger), then reusable frontend components (DataTable, ConfirmDialog, FormDialog, MetricCard, sidebar), then wire up pages. The resident form is by far the most complex (47 columns, 10 boolean sub-categories) -- handle it with tabbed/grouped sections inside the modal.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use MUI Table (not DataGrid) for all data tables -- lightweight, full theme control, manual sort/filter/pagination
- **D-02:** Standard row density showing 5-6 key columns, with expandable rows to reveal all fields on click
- **D-03:** Color-coded risk badges on resident rows (Critical=red, High=orange, Medium=yellow, Low=green)
- **D-04:** Metric cards use big number style -- large stat number with label and subtle trend indicator, coral accent color
- **D-05:** 4 metric cards: Total Residents, Active Cases, Total Donations, Reintegration Rate
- **D-06:** OKR metric (Reintegration Rate) displayed as a circular gauge/progress ring, prominently placed
- **D-07:** Recent donations table and residents-needing-attention table below the metric cards
- **D-08:** Create/Edit forms appear in MUI Dialog (modal) overlays -- user stays in context of the table
- **D-09:** Delete confirmation is a simple MUI Dialog: "Are you sure you want to delete [name]?" with Cancel and red Delete button
- **D-10:** All form inputs sanitized -- use react-hook-form + zod for validation, server-side input encoding
- **D-11:** Collapsible MUI Drawer sidebar -- full icons + labels, collapses to icon-only on smaller screens
- **D-12:** Flat navigation list: Dashboard, Residents, Donors, Sessions, Visits, Reports -- all top-level with icons
- **D-13:** Replace the current AppBar-only layout with sidebar + content area layout for admin pages

### Claude's Discretion
- Pagination size (10/25/50 per page -- standard approach)
- Sort column defaults per table
- Chart library choice for dashboard charts (Recharts recommended from stack research)
- Form field grouping/tabs for complex resident forms (40+ fields)
- Loading states and skeleton screens
- Error handling UI patterns

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | Admin can view dashboard with 4+ metric cards | MetricCard component + DashboardController aggregation endpoint |
| DASH-02 | Admin can view recent donations table on dashboard | DashboardController returns recent donations; reuse DataTable component |
| DASH-03 | Admin can view residents needing attention table | DashboardController returns high-risk/critical residents; DataTable with risk badges |
| DASH-04 | Admin dashboard displays OKR metric (Reintegration Rate) prominently | Recharts RadialBarChart for circular gauge; DashboardController calculates rate |
| CASE-01 | Admin can view paginated table of all residents with sortable columns | ResidentsController with skip/take pagination + MUI Table with TableSortLabel |
| CASE-02 | Admin can filter residents by safehouse, status, category, risk level | Query string params on GET /api/residents; frontend filter dropdowns |
| CASE-03 | Admin can search residents by name/case number | Search param on GET /api/residents; debounced TextField input |
| CASE-04 | Admin can create a new resident record | POST /api/residents + ResidentFormDialog with zod validation |
| CASE-05 | Admin can edit an existing resident record | PUT /api/residents/{id} + pre-populated ResidentFormDialog |
| CASE-06 | Admin can delete a resident record with confirmation | DELETE /api/residents/{id} + ConfirmDialog component |
| CASE-07 | Resident records display risk level with color-coded badges | MUI Chip with color mapping per risk level |
| DONR-01 | Admin can view paginated table of all supporters | SupportersController with pagination + DataTable |
| DONR-02 | Admin can view donation records for each supporter | Expandable row or nested table showing supporter's donations |
| DONR-03 | Admin can create new supporter and donation records | POST endpoints + SupporterFormDialog + DonationFormDialog |
| DONR-04 | Admin can edit supporter and donation records | PUT endpoints + pre-populated forms |
| DONR-05 | Admin can delete supporter/donation records with confirmation | DELETE endpoints + ConfirmDialog |
| PROC-01 | Admin can create a new counseling session record | POST /api/process-recordings + SessionFormDialog |
| PROC-02 | Admin can view session history per resident | GET /api/process-recordings?residentId={id} or via resident detail |
| PROC-03 | Admin can edit and delete session records with confirmation | PUT/DELETE endpoints + ConfirmDialog |
| VISIT-01 | Admin can log a new home visit for a resident | POST /api/home-visitations + VisitFormDialog |
| VISIT-02 | Admin can view visit history per resident | GET /api/home-visitations?residentId={id} |
| VISIT-03 | Admin can edit and delete visit records with confirmation | PUT/DELETE endpoints + ConfirmDialog |
| SEC-04 | Data sanitization / input encoding on all form inputs | zod schemas strip/validate all inputs; server-side HtmlEncoder on text fields |
| SEC-05 | Delete operations require confirmation dialog | ConfirmDialog component used on all delete actions |

</phase_requirements>

## Standard Stack

### Core (already installed or locked)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @mui/material | ^6.5.0 | Component library (Table, Dialog, Drawer, Chip, Card) | Installed |
| @emotion/react | ^11.14.0 | MUI CSS-in-JS runtime | Installed |
| @emotion/styled | ^11.14.1 | MUI styled components | Installed |
| react-router-dom | ^7.14.0 | Client-side routing | Installed |
| react | ^19.2.4 | UI library | Installed |

### New Dependencies (must install for Phase 2)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | 7.72.1 | Form state management for all CRUD modals | Performant (uncontrolled inputs), minimal re-renders on 47-field resident form |
| @hookform/resolvers | 5.2.2 | Connects zod schemas to react-hook-form | Bridge library; v5.2.2 has Zod 4 fix |
| zod | 4.3.6 | Schema validation for all form inputs (SEC-04) | TypeScript-first, 14x faster than v3, static type inference |
| recharts | 3.8.1 | OKR gauge (RadialBarChart) and dashboard mini-charts | Declarative React API, SVG-based, theme-compatible |
| @mui/icons-material | 7.3.9 | Sidebar nav icons, action buttons, metric card icons | Native MUI integration, tree-shakable, consistent with MUI theme |

**Note on @mui/icons-material version:** The latest version (7.3.9) is MUI v7 but the icons package is backward-compatible with MUI v6 components. The icons are just SvgIcon wrappers -- no breaking changes. This is confirmed by MUI's own documentation showing v6 projects using icons-material. Alternatively, `react-icons` (5.6.x) could be used but adds an extra dependency with different icon styling conventions.

### Installation

```bash
cd frontend
npm install react-hook-form @hookform/resolvers zod recharts @mui/icons-material
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MUI Table (manual) | MUI DataGrid (MUI X) | DataGrid is heavier, requires separate @mui/x-data-grid package, less theme control. User locked to Table. |
| MUI Dialog for forms | Dedicated detail pages | Modals keep context, but detail pages handle complex forms better. Locked to Dialog. |
| @mui/icons-material | react-icons | react-icons bundles multiple icon sets (FA, Material, Heroicons) but MUI icons integrate natively with MUI theme sizing/color. |
| Recharts RadialBarChart | Custom SVG gauge | Recharts handles animation, responsive sizing. No reason to hand-roll. |
| zod | yup | Zod v4 is 14x faster, TypeScript-first, smaller. Locked to zod. |

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
backend/HarborOfHope.API/
  Controllers/
    AuthController.cs          # EXISTS
    ResidentsController.cs     # NEW - Resident CRUD + search/filter/pagination
    SupportersController.cs    # NEW - Supporter/donor CRUD
    DonationsController.cs     # NEW - Donation CRUD
    ProcessRecordingsController.cs  # NEW - Session CRUD
    HomeVisitationsController.cs    # NEW - Visit CRUD
    DashboardController.cs     # NEW - Aggregated stats for dashboard
  DTOs/
    PagedResult.cs             # NEW - Generic pagination wrapper
    ResidentListDto.cs         # NEW - Slim resident for table rows
    ResidentDetailDto.cs       # NEW - Full resident for edit form
    ResidentCreateDto.cs       # NEW - Create/update input model
    SupporterDto.cs            # NEW
    DonationDto.cs             # NEW
    ProcessRecordingDto.cs     # NEW
    HomeVisitationDto.cs       # NEW
    DashboardStatsDto.cs       # NEW - 4 metrics + recent data

frontend/src/
  components/
    layout/
      AppLayout.tsx            # MODIFY - Add sidebar + responsive layout
      AdminSidebar.tsx         # NEW - Collapsible MUI Drawer
    ui/
      DataTable.tsx            # NEW - Reusable table with sort/pagination
      MetricCard.tsx           # NEW - Dashboard stat card
      ConfirmDialog.tsx        # NEW - Delete confirmation modal
      FormDialog.tsx           # NEW - Wrapper for react-hook-form in Dialog
      RiskBadge.tsx            # NEW - Color-coded risk Chip
      SearchFilterBar.tsx      # NEW - Search + filter dropdowns
    charts/
      ReintegrationGauge.tsx   # NEW - Recharts RadialBarChart OKR gauge
    forms/
      ResidentForm.tsx         # NEW - 47-field form with grouped sections
      SupporterForm.tsx        # NEW
      DonationForm.tsx         # NEW
      ProcessRecordingForm.tsx # NEW
      HomeVisitationForm.tsx   # NEW
  pages/
    admin/
      AdminDashboard.tsx       # NEW - Metrics, gauge, recent tables
      ResidentsPage.tsx        # NEW - Caseload table + CRUD
      SupportersPage.tsx       # NEW - Donors table + CRUD
      ProcessRecordingsPage.tsx # NEW - Sessions table + CRUD
      HomeVisitationsPage.tsx  # NEW - Visits table + CRUD
  lib/
    api.ts                     # NEW - Base fetch helper (reuse authApi pattern)
    residentsApi.ts            # NEW - Resident CRUD calls
    supportersApi.ts           # NEW - Supporter CRUD calls
    donationsApi.ts            # NEW - Donation CRUD calls
    processRecordingsApi.ts    # NEW - Session CRUD calls
    homeVisitationsApi.ts      # NEW - Visit CRUD calls
    dashboardApi.ts            # NEW - Dashboard stats call
  types/
    Resident.ts                # NEW - TypeScript interfaces
    Supporter.ts               # NEW
    Donation.ts                # NEW
    ProcessRecording.ts        # NEW
    HomeVisitation.ts          # NEW
    Dashboard.ts               # NEW
    Pagination.ts              # NEW - PagedResult<T> generic
```

### Pattern 1: Generic Paginated API Response

**What:** A standard wrapper for all paginated list endpoints.
**When to use:** Every table endpoint (residents, supporters, donations, sessions, visits).

Backend DTO:
```csharp
public class PagedResult<T>
{
    public List<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
```

Frontend type:
```typescript
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### Pattern 2: Controller with Pagination, Sort, Filter

**What:** Standard ASP.NET Core controller pattern for list endpoints.
**When to use:** Every CRUD controller.

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class ResidentsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ResidentListDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = "residentId",
        [FromQuery] string? sortDir = "asc",
        [FromQuery] string? search = null,
        [FromQuery] int? safehouseId = null,
        [FromQuery] string? status = null,
        [FromQuery] string? riskLevel = null,
        [FromQuery] string? category = null)
    {
        var query = db.Residents.Include(r => r.Safehouse).AsQueryable();

        // Filters
        if (safehouseId.HasValue) query = query.Where(r => r.SafehouseId == safehouseId);
        if (!string.IsNullOrEmpty(status)) query = query.Where(r => r.CaseStatus == status);
        if (!string.IsNullOrEmpty(riskLevel)) query = query.Where(r => r.CurrentRiskLevel == riskLevel);
        if (!string.IsNullOrEmpty(category)) query = query.Where(r => r.CaseCategory == category);

        // Search
        if (!string.IsNullOrEmpty(search))
            query = query.Where(r =>
                (r.CaseControlNo != null && r.CaseControlNo.Contains(search)) ||
                (r.InternalCode != null && r.InternalCode.Contains(search)));

        // Sort
        query = (sortBy?.ToLower(), sortDir?.ToLower()) switch
        {
            ("casestatus", "desc") => query.OrderByDescending(r => r.CaseStatus),
            ("casestatus", _) => query.OrderBy(r => r.CaseStatus),
            ("safehouseid", "desc") => query.OrderByDescending(r => r.SafehouseId),
            ("safehouseid", _) => query.OrderBy(r => r.SafehouseId),
            (_, "desc") => query.OrderByDescending(r => r.ResidentId),
            _ => query.OrderBy(r => r.ResidentId),
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ResidentListDto { /* map fields */ })
            .ToListAsync();

        return Ok(new PagedResult<ResidentListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResidentDetailDto>> GetById(int id) { /* ... */ }

    [HttpPost]
    public async Task<ActionResult<ResidentDetailDto>> Create(ResidentCreateDto dto) { /* ... */ }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, ResidentCreateDto dto) { /* ... */ }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id) { /* ... */ }
}
```

### Pattern 3: Frontend API Layer (fetch with credentials)

**What:** Typed fetch wrappers following the established `authApi.ts` pattern.
**When to use:** Every API call module.

```typescript
// lib/api.ts -- base helper
const API_BASE = '/api';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API error: ${response.status}`);
  }

  return response.json();
}

// lib/residentsApi.ts
export function fetchResidents(params: ResidentQueryParams): Promise<PagedResult<ResidentListItem>> {
  const qs = new URLSearchParams();
  qs.set('page', String(params.page));
  qs.set('pageSize', String(params.pageSize));
  if (params.sortBy) qs.set('sortBy', params.sortBy);
  if (params.sortDir) qs.set('sortDir', params.sortDir);
  if (params.search) qs.set('search', params.search);
  if (params.safehouseId) qs.set('safehouseId', String(params.safehouseId));
  if (params.status) qs.set('status', params.status);
  if (params.riskLevel) qs.set('riskLevel', params.riskLevel);
  return apiFetch(`/residents?${qs}`);
}

export function createResident(data: ResidentFormData): Promise<ResidentDetail> {
  return apiFetch('/residents', { method: 'POST', body: JSON.stringify(data) });
}
```

### Pattern 4: react-hook-form + zod + MUI Dialog

**What:** Form validation pattern for CRUD modals.
**When to use:** Every Create/Edit form dialog.

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const supporterSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(200),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  supporterType: z.string().min(1, 'Type is required'),
  organizationName: z.string().max(200).optional(),
  // ... more fields
});

type SupporterFormData = z.infer<typeof supporterSchema>;

function SupporterFormDialog({ open, onClose, onSubmit, initialData }: Props) {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SupporterFormData>({
    resolver: zodResolver(supporterSchema),
    defaultValues: initialData ?? { displayName: '', email: '', supporterType: '' },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Supporter' : 'Add Supporter'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="displayName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Display Name"
                fullWidth
                margin="normal"
                error={!!errors.displayName}
                helperText={errors.displayName?.message}
              />
            )}
          />
          {/* More fields */}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {initialData ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
```

### Pattern 5: Collapsible MUI Drawer Sidebar

**What:** Admin sidebar with icon+label navigation that collapses to icon-only.
**When to use:** Admin layout wrapper.

```typescript
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  IconButton, useMediaQuery, useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED_WIDTH = 64;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { label: 'Residents', icon: <PeopleIcon />, path: '/admin/residents' },
  { label: 'Donors', icon: <VolunteerActivismIcon />, path: '/admin/donors' },
  { label: 'Sessions', icon: <PsychologyIcon />, path: '/admin/sessions' },
  { label: 'Visits', icon: <HomeIcon />, path: '/admin/visits' },
  { label: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
];
```

### Pattern 6: Reusable DataTable with Sort + Pagination

**What:** A generic table component wrapping MUI Table with sort headers, pagination, and optional expandable rows.
**When to use:** Every CRUD list page.

```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (column: string) => void;
  renderExpandedRow?: (row: T) => React.ReactNode;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  loading?: boolean;
}
```

### Pattern 7: Dashboard Aggregation Endpoint

**What:** Single endpoint returning all dashboard data in one call.
**When to use:** AdminDashboard page load.

```csharp
[HttpGet]
public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
{
    var totalResidents = await db.Residents.CountAsync();
    var activeCases = await db.Residents.CountAsync(r => r.CaseStatus == "Active");
    var totalDonations = await db.Donations.SumAsync(d => d.Amount);

    var totalForReintegration = await db.Residents.CountAsync(r => r.ReintegrationType != null);
    var completedReintegration = await db.Residents.CountAsync(r => r.ReintegrationStatus == "Completed");
    var reintegrationRate = totalForReintegration > 0
        ? (double)completedReintegration / totalForReintegration * 100
        : 0;

    var recentDonations = await db.Donations
        .Include(d => d.Supporter)
        .OrderByDescending(d => d.DonationDate)
        .Take(5)
        .Select(d => new RecentDonationDto { /* map */ })
        .ToListAsync();

    var residentsNeedingAttention = await db.Residents
        .Include(r => r.Safehouse)
        .Where(r => r.CurrentRiskLevel == "Critical" || r.CurrentRiskLevel == "High")
        .OrderBy(r => r.CurrentRiskLevel == "Critical" ? 0 : 1)
        .Take(5)
        .Select(r => new AttentionResidentDto { /* map */ })
        .ToListAsync();

    return Ok(new DashboardStatsDto
    {
        TotalResidents = totalResidents,
        ActiveCases = activeCases,
        TotalDonations = totalDonations,
        ReintegrationRate = Math.Round(reintegrationRate, 1),
        RecentDonations = recentDonations,
        ResidentsNeedingAttention = residentsNeedingAttention,
    });
}
```

### Anti-Patterns to Avoid

- **Returning entities directly from controllers:** Never return `Resident` entities with `notes_restricted` field. Always map to DTOs that omit sensitive data.
- **Client-side pagination with all data loaded:** With 60 residents it might seem fine, but process recordings have 2,819 rows. Always paginate server-side.
- **Inline form validation without zod:** Every form must use zod schemas. No ad-hoc `if (!name) setError(...)` patterns. This satisfies SEC-04.
- **Building separate layouts for each admin page:** One `AppLayout` with sidebar and `<Outlet />` for all admin routes. Never duplicate sidebar code.
- **Using axios:** The codebase uses native `fetch` with `credentials: 'include'`. Stay consistent. Do not introduce axios.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | react-hook-form + zod | 47-field forms need schema validation, not imperative checks |
| Circular gauge | Custom SVG path calculations | Recharts RadialBarChart | Animation, responsive sizing, tooltips built in |
| Sortable table headers | Manual sort state + arrow icons | MUI TableSortLabel | Handles ARIA, icons, active state |
| Pagination controls | Custom page number buttons | MUI TablePagination | Handles rows-per-page selector, page navigation, total display |
| Delete confirmation | window.confirm() | MUI Dialog (ConfirmDialog component) | Styled, accessible, matches app theme (SEC-05) |
| Input sanitization | Manual regex sanitization | zod schemas + server HtmlEncoder | zod validates client-side; .NET HtmlEncoder handles server-side encoding |
| Collapsible sidebar | CSS-only sidebar toggle | MUI Drawer (persistent variant) | Handles animation, backdrop, breakpoint detection |

**Key insight:** MUI has first-class components for every UI element in this phase. The primary coding work is wiring data to components, not building components.

## Common Pitfalls

### Pitfall 1: react-hook-form defaultValues not resetting on edit
**What goes wrong:** Opening a form for "Edit Resident A" then opening "Edit Resident B" shows Resident A's data because `defaultValues` only apply on first mount.
**Why it happens:** `useForm` captures `defaultValues` at mount time. If the Dialog stays mounted and only `open` toggles, the form keeps stale values.
**How to avoid:** Use `reset(newData)` in a `useEffect` when `initialData` changes, OR use `key={selectedId}` on the form component to force remount.
**Warning signs:** Edit form shows wrong data after editing a different record.

### Pitfall 2: EF Core Include causing N+1 queries on list endpoints
**What goes wrong:** Including navigation properties on paginated list endpoints loads excessive data and generates many SQL queries.
**Why it happens:** `Include(r => r.Safehouse)` is fine for showing safehouse name, but `Include(r => r.ProcessRecordings)` on a list endpoint loads all child records for every resident on the page.
**How to avoid:** Only Include navigation properties needed for the DTO. For list endpoints, only include direct FK references (Safehouse). Use `.Select()` projection to pick only needed columns.
**Warning signs:** Slow API responses on list endpoints; large JSON payloads.

### Pitfall 3: Zod v4 import path differences from v3
**What goes wrong:** Code examples using `import { z } from 'zod'` may work, but Zod v4 also offers `@zod/mini` for smaller bundles.
**Why it happens:** Zod v4 restructured its API. Some patterns changed.
**How to avoid:** Use standard `import { z } from 'zod'` -- it works in v4. For @hookform/resolvers, use `import { zodResolver } from '@hookform/resolvers/zod'` -- v5.2.2 has the Zod 4 fix.
**Warning signs:** TypeScript errors on zod schema type inference.

### Pitfall 4: CORS credentials and JSON content-type mismatch
**What goes wrong:** POST/PUT requests fail with 415 or CORS errors.
**Why it happens:** Forgetting `Content-Type: application/json` header, or the controller expects `[FromBody]` but receives form-encoded data.
**How to avoid:** All API calls use `apiFetch()` helper which sets `Content-Type: application/json` and `credentials: 'include'`. Controller parameters use `[FromBody]` for POST/PUT and `[FromQuery]` for GET.
**Warning signs:** 415 Unsupported Media Type or CORS preflight failures.

### Pitfall 5: DeleteBehavior.Restrict preventing cascade deletes
**What goes wrong:** Deleting a supporter with donations returns 500 error because the FK constraint prevents deletion.
**Why it happens:** Phase 1 set `DeleteBehavior.Restrict` on parent FKs to prevent accidental cascade deletes.
**How to avoid:** When deleting a supporter, first check for related donations and return a clear error message ("Cannot delete supporter with existing donations. Delete donations first."). OR cascade-delete child records in the controller logic. The Restrict behavior is intentional and correct.
**Warning signs:** 500 errors on delete operations with related records.

### Pitfall 6: MUI Drawer z-index overlapping AppBar
**What goes wrong:** Sidebar appears behind or over the AppBar incorrectly.
**Why it happens:** MUI Drawer has `zIndex: theme.zIndex.drawer` (1200) vs AppBar `zIndex: theme.zIndex.appBar` (1100).
**How to avoid:** Use `variant="persistent"` Drawer, not `variant="temporary"`. Set the main content area's `marginLeft` to the drawer width. AppBar should shift too, or span full width with `zIndex` above drawer.
**Warning signs:** Visual overlap between sidebar and top bar.

### Pitfall 7: Resident form complexity (47 columns)
**What goes wrong:** A single-column form with 47 fields is unusable. Users scroll forever.
**Why it happens:** Resident entity has 47 columns including 10 boolean sub-categories, dates, free-text fields.
**How to avoid:** Group fields into logical tabs or sections inside the modal: (1) Basic Info (case number, safehouse, status, sex, DOB), (2) Categories & Sub-categories (10 boolean checkboxes as a checkbox group), (3) Family Background (5 boolean fields), (4) Case Management (dates, social worker, assessment), (5) Reintegration (type, status, risk levels). Use MUI Stepper or simple Tabs inside the Dialog.
**Warning signs:** Form is a single long scroll; users abandon edits.

## Code Examples

### Reusable MetricCard Component

```typescript
import { Card, CardContent, Typography, Box } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

function MetricCard({ title, value, icon, color = '#E8735A' }: MetricCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h3" sx={{ color, fontWeight: 800 }}>{value}</Typography>
          </Box>
          <Box sx={{ color, opacity: 0.7, fontSize: 40 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}
```

### Recharts OKR Circular Gauge

```typescript
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface ReintegrationGaugeProps {
  rate: number; // 0-100
}

function ReintegrationGauge({ rate }: ReintegrationGaugeProps) {
  const data = [{ value: rate, fill: '#E8735A' }];

  return (
    <Box sx={{ textAlign: 'center' }}>
      <RadialBarChart
        width={200} height={200}
        innerRadius="70%" outerRadius="90%"
        data={data}
        startAngle={90} endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="value" cornerRadius={10} background clockWise />
      </RadialBarChart>
      <Typography variant="h4" sx={{ mt: -12, position: 'relative' }}>
        {rate}%
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Reintegration Rate
      </Typography>
    </Box>
  );
}
```

### RiskBadge Component

```typescript
import { Chip } from '@mui/material';

const riskColors: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
  Critical: 'error',    // red
  High: 'warning',      // orange
  Medium: 'info',       // (override to yellow via sx)
  Low: 'success',       // green
};

function RiskBadge({ level }: { level: string | null }) {
  if (!level) return null;
  return (
    <Chip
      label={level}
      color={riskColors[level] ?? 'default'}
      size="small"
      sx={level === 'Medium' ? { bgcolor: '#FFC107', color: '#000' } : undefined}
    />
  );
}
```

### ConfirmDialog Component

```typescript
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### Server-Side Input Sanitization (SEC-04)

```csharp
using System.Text.Encodings.Web;

// In controller Create/Update methods:
private static string? Sanitize(string? input)
    => input is null ? null : HtmlEncoder.Default.Encode(input.Trim());

[HttpPost]
public async Task<ActionResult<ResidentDetailDto>> Create([FromBody] ResidentCreateDto dto)
{
    var resident = new Resident
    {
        CaseControlNo = Sanitize(dto.CaseControlNo),
        InternalCode = Sanitize(dto.InternalCode),
        CaseStatus = Sanitize(dto.CaseStatus),
        // ... map all fields with Sanitize() for string fields
        SubCatOrphaned = dto.SubCatOrphaned, // booleans don't need sanitization
        SafehouseId = dto.SafehouseId,        // ints don't need sanitization
    };

    db.Residents.Add(resident);
    await db.SaveChangesAsync();
    return CreatedAtAction(nameof(GetById), new { id = resident.ResidentId }, MapToDetail(resident));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik + Yup | react-hook-form + zod | 2024 | zod v4 is 14x faster, TypeScript-native |
| MUI DataGrid for all tables | MUI Table for simple cases, DataGrid for complex | MUI v6 | Table is lighter, more customizable |
| Full-page CRUD forms | Modal/dialog forms | UX best practice | Users stay in list context |
| Client-side data fetching with useEffect | TanStack Query or SWR | 2024 | For this project, simple useEffect + useState is fine given the timeline |
| Separate REST calls per dashboard card | Single aggregation endpoint | Architecture pattern | One network request instead of 4-6 |

**Note:** TanStack Query (React Query) would be the modern approach for data fetching with caching, but adds another dependency and learning curve. For a 4-day sprint, simple `useEffect` + `useState` + loading state is sufficient and proven in the existing auth code.

## Open Questions

1. **Resident name field**
   - What we know: The CSV data does not appear to have a `first_name`/`last_name` field for residents. Residents are identified by `case_control_no` and `internal_code`. The entity has no name columns.
   - What's unclear: How to show "resident name" in the delete confirmation dialog ("Are you sure you want to delete [name]?")
   - Recommendation: Use `internal_code` as the identifier in delete confirmations: "Are you sure you want to delete resident LS-0001?" This matches the case management workflow where case numbers identify residents, not names (privacy protection).

2. **Expandable row implementation for 47-column resident**
   - What we know: D-02 calls for expandable rows to show all fields.
   - What's unclear: Whether the expansion should show ALL 47 fields or just the ones not in the table columns.
   - Recommendation: Show the remaining fields not in the table columns (5-6 columns shown + ~40 in expansion). Group expanded fields into labeled sections for readability.

3. **Donations page vs. Supporters page**
   - What we know: Requirements mention both supporter CRUD and donation CRUD. The data model has Supporter -> Donation (one-to-many).
   - What's unclear: Whether these should be one page ("Donors" in nav showing supporters with nested donations) or two separate pages.
   - Recommendation: One "Donors" page showing supporters table with expandable rows revealing their donations. Create/Edit donation records from within the supporter context. This matches the nav decision (D-12: "Donors" is one nav item, not two).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Frontend build | TBD | TBD | -- |
| .NET 10 SDK | Backend build | TBD | TBD | -- |
| PostgreSQL | Database | TBD | TBD | -- |

Step 2.6: External dependencies were validated in Phase 1 (all three are available and working). No new external dependencies introduced in Phase 2 -- only npm packages added to the existing project.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual testing via Swagger UI (backend) + browser (frontend) |
| Config file | None -- no automated test framework configured |
| Quick run command | `dotnet build` (backend) + `npx tsc --noEmit` (frontend) |
| Full suite command | Build verification + Swagger endpoint testing |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | 4 metric cards render with correct values | manual | Browser: navigate to /admin/dashboard | N/A |
| DASH-02 | Recent donations table shows 5 recent entries | manual | Browser: check dashboard | N/A |
| DASH-03 | Residents needing attention table shows Critical/High risk | manual | Browser: check dashboard | N/A |
| DASH-04 | OKR gauge shows reintegration rate | manual | Browser: check dashboard gauge | N/A |
| CASE-01 | Paginated residents table with sort | manual | Swagger: GET /api/residents?page=1&pageSize=10&sortBy=residentId | N/A |
| CASE-02 | Filter by safehouse/status/category/risk | manual | Swagger: GET /api/residents?safehouseId=1&status=Active | N/A |
| CASE-03 | Search by name/case number | manual | Swagger: GET /api/residents?search=C0043 | N/A |
| CASE-04 | Create resident | manual | Swagger: POST /api/residents + browser form | N/A |
| CASE-05 | Edit resident | manual | Swagger: PUT /api/residents/1 + browser form | N/A |
| CASE-06 | Delete resident with confirmation | manual | Browser: delete button -> confirm dialog | N/A |
| CASE-07 | Risk badges (Critical=red, High=orange, Medium=yellow, Low=green) | manual | Browser: check resident table rows | N/A |
| DONR-01 | Paginated supporters table | manual | Swagger: GET /api/supporters | N/A |
| DONR-02 | View donations per supporter | manual | Browser: expand supporter row | N/A |
| DONR-03 | Create supporter + donation | manual | Swagger + browser forms | N/A |
| DONR-04 | Edit supporter + donation | manual | Swagger + browser forms | N/A |
| DONR-05 | Delete supporter/donation with confirmation | manual | Browser: delete -> confirm | N/A |
| PROC-01 | Create session record | manual | Swagger: POST /api/process-recordings | N/A |
| PROC-02 | View session history per resident | manual | Swagger: GET /api/process-recordings?residentId=1 | N/A |
| PROC-03 | Edit/delete sessions with confirmation | manual | Swagger + browser | N/A |
| VISIT-01 | Log home visit | manual | Swagger: POST /api/home-visitations | N/A |
| VISIT-02 | View visit history per resident | manual | Swagger: GET /api/home-visitations?residentId=1 | N/A |
| VISIT-03 | Edit/delete visits with confirmation | manual | Swagger + browser | N/A |
| SEC-04 | Input sanitization on forms | manual | Submit `<script>alert(1)</script>` in text field, verify encoding | N/A |
| SEC-05 | Delete confirmation dialog | manual | Click delete, verify dialog appears before action | N/A |

### Sampling Rate
- **Per task commit:** `dotnet build` (0 errors) + `npx tsc --noEmit` (0 errors)
- **Per wave merge:** Full Swagger endpoint verification for all CRUD operations
- **Phase gate:** All requirements manually verified before `/gsd:verify-work`

### Wave 0 Gaps
None -- this project uses manual testing via Swagger and browser. No automated test framework to set up. Build verification serves as the automated gate.

## Project Constraints (from CLAUDE.md)

No CLAUDE.md file found in the project root. No additional project-specific constraints beyond what is documented in CONTEXT.md and PROJECT.md.

## Data Volume Reference

Understanding the data volumes helps plan pagination defaults and performance expectations:

| Table | Row Count | Relevance to Phase 2 |
|-------|-----------|----------------------|
| residents | 60 | Primary CRUD table (CASE-*) |
| supporters | 60 | Donor table (DONR-*) |
| donations | 420 | Nested under supporters (DONR-02) |
| process_recordings | 2,819 | Session table (PROC-*) -- largest, needs server pagination |
| home_visitations | 1,337 | Visit table (VISIT-*) -- needs server pagination |
| safehouses | 9 | Filter dropdown values (CASE-02) |
| donation_allocations | 521 | Sub-records of donations |

**Pagination recommendation:** Default page size of 10 with options for 25 and 50. This is particularly important for process_recordings (2,819 rows) and home_visitations (1,337 rows).

## Sources

### Primary (HIGH confidence)
- Existing codebase: Entity classes, AppDbContext, AuthController, theme.ts, authApi.ts -- verified by reading source files
- Phase 1 summaries: 01-01-SUMMARY.md, 01-02-SUMMARY.md -- verified project state
- CONTEXT.md user decisions -- locked implementation choices

### Secondary (MEDIUM confidence)
- [MUI Drawer documentation](https://mui.com/material-ui/react-drawer/) -- Drawer variants and responsive patterns
- [Recharts RadialBarChart](https://recharts.github.io/en-US/api/RadialBarChart/) -- Circular gauge API
- [react-hook-form + zod + MUI integration](https://dev.to/ashishxcode/the-ultimate-react-hook-form-zod-pattern-for-reusable-create-and-edit-forms-38l) -- Form pattern verification
- [ASP.NET Core 10 CRUD with EF Core](https://codewithmukesh.com/blog/aspnet-core-webapi-crud-with-entity-framework-core-full-course/) -- Controller pattern
- [Pagination, Sorting & Searching in ASP.NET Core](https://codewithmukesh.com/blog/pagination-sorting-searching-aspnet-core-webapi/) -- Server-side pagination pattern
- [MUI Icons Material](https://www.npmjs.com/package/@mui/icons-material) -- Version 7.3.9 backward-compatible with MUI v6

### Tertiary (LOW confidence)
- None -- all findings cross-verified with official documentation or codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries verified against npm registry; existing codebase patterns established in Phase 1
- Architecture: HIGH -- Controller+DTO+PagedResult is standard ASP.NET Core pattern; frontend patterns follow established authApi.ts conventions
- Pitfalls: HIGH -- Based on direct codebase analysis (DeleteBehavior.Restrict, 47-column entity, existing fetch pattern) and well-documented library gotchas

**Research date:** 2026-04-06
**Valid until:** 2026-04-10 (project deadline)

---
*Phase: 02-admin-crud-dashboard*
*Researched: 2026-04-06*

# Phase 2: Admin CRUD + Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 02-admin-crud-dashboard
**Areas discussed:** Table layout, Dashboard design, CRUD flow, Sidebar nav

---

## Table Layout

| Option | Description | Selected |
|--------|-------------|----------|
| MUI Table | Standard MUI Table with manual sort/filter/pagination. Lightweight, full control. | ✓ |
| MUI DataGrid | Feature-rich data grid with built-in sort, filter, pagination. Heavier. | |
| Card grid | Card-based layout. More visual but harder to scan 60+ records. | |
| You decide | Claude picks best approach per page. | |

**User's choice:** MUI Table (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Compact | Dense rows, key fields only, click to expand. | |
| Standard | Medium density, 5-6 visible columns. | ✓ (modified) |
| Detailed | Show as many columns as possible. | |

**User's choice:** Standard but with option to show more — expandable rows to see all info
**Notes:** User wants standard default density but ability for users to expand and see all fields

---

## Dashboard Design

| Option | Description | Selected |
|--------|-------------|----------|
| Big numbers | Large stat number with label and trend indicator. | ✓ |
| Mini charts | Each card has a sparkline chart. | |
| Icon + number | Large icon alongside the number. | |

**User's choice:** Big numbers (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Circular gauge | Large circular progress ring showing percentage. | ✓ |
| Big percentage | Hero-sized number with progress bar underneath. | |
| Trend card | Number with line chart over 12 months. | |

**User's choice:** Circular gauge

---

## CRUD Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Modal dialogs | Form in centered dialog overlay. User stays in table context. | ✓ |
| Side drawer | Form slides from right. Table stays visible. | |
| Full page | Navigate to dedicated form page. | |
| You decide | Claude picks per page based on form complexity. | |

**User's choice:** Modal dialogs (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Simple dialog | "Are you sure?" with Cancel/Delete buttons. Delete in red. | ✓ |
| Type to confirm | Must type name or 'DELETE' to confirm. | |
| Undo toast | Delete immediately, show undo toast for 5 seconds. | |

**User's choice:** Simple dialog (Recommended)

---

## Sidebar Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Collapsible | Full sidebar with icons + labels. Collapses to icon-only. MUI Drawer. | ✓ |
| Always expanded | Fixed sidebar always showing icons + labels. | |
| Top nav only | No sidebar, use AppBar with dropdowns. | |

**User's choice:** Collapsible (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Flat list | Dashboard, Residents, Donors, Sessions, Visits, Reports — all top-level. | ✓ |
| Grouped | Sections: Overview, Case Management, Support. | |
| You decide | Claude organizes based on page structure. | |

**User's choice:** Flat list (Recommended)

---

## Claude's Discretion

- Pagination size defaults
- Sort column defaults per table
- Chart library (Recharts recommended)
- Form field grouping for complex resident forms
- Loading/skeleton states
- Error handling UI patterns

## Deferred Ideas

None

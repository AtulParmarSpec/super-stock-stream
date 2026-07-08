
## Scope

The three docs describe a full IT Asset & Inventory ERP module. Current app already has: Dashboard, Assets (list/detail, CRUD, lifecycle actions), Assignments, Transfers, Maintenance, Masters (Companies, Offices, Departments, Employees, Vendors, Categories, Brands, Vendor Evaluations), and Reports. Missing pieces (Epics 4–9): **Inventory Requests, My Approvals, Quotations/RFQ, Purchase Orders, Goods Receipt (GRN), Bills**, plus dashboard/notification/report enhancements.

This plan delivers all missing screens as fully wired mock-data UI (client-side store, same pattern as existing modules — no backend). All state machines and role concepts stay UI-only.

## What I will build

### 1. Data layer — `src/lib/procurement-data.ts`
Mock entities + seed data + status enums:
- `InventoryRequest` (requester, category, type New/Replacement/Return, urgency, justification, status, resolvedAssetId)
- `Quotation` (RFQ #, items, vendor responses with price/delivery/validity/status Won/Lost)
- `PurchaseOrder` (PO #, vendor, items, totals, status, costCenter, approvals, linked quotation)
- `GoodsReceipt` (GRN #, PO ref, line items with qtyReceived/condition, receiver)
- `Bill` (invoice #, PO ref, amount, tax, due date, status, 3-way match result)
- `Approval` (unified item across Request/RFQ/PO/Bill with decision, comments, SLA)
- `ActivityEvent` (audit log entry for dashboard feed)

### 2. New routes (under `src/routes/`)
| Route | Purpose |
|---|---|
| `requests.tsx` / `requests.index.tsx` / `requests.$id.tsx` | Employee self-service — raise, track, detail with comments trail |
| `approvals.tsx` | Unified approval inbox: type, ref#, requester/vendor, value, age, SLA dot; Approve / Reject / More Info actions; "Approve & Assign" for requests |
| `quotations.tsx` / `quotations.$id.tsx` | RFQ list + create; detail = side-by-side vendor response comparison, mark Won, one-click "Create PO" |
| `purchase-orders.tsx` / `purchase-orders.$id.tsx` | PO list; detail with items, approval trail, "Send to Vendor", "Record GRN", "Record Bill" |
| `receipts.tsx` | GRN list across POs, with condition + discrepancy flags |
| `bills.tsx` / `bills.$id.tsx` | Bill list, 3-way match badge (OK / variance %), approve, vendor ledger link |

### 3. Enhancements to existing screens
- **Dashboard**: add "My Pending Actions" widget (counts by type deep-linked to `/approvals`); Recent Activity feed pulls from `ActivityEvent` store instead of static array; Export Report → CSV of KPIs.
- **Sidebar** (`src/components/app-sidebar.tsx`): new group "Procurement" with Requests, Approvals, Quotations, POs, Receipts, Bills.
- **Vendor detail** (`src/routes/masters.vendors.tsx`): tabs for Quotations / POs / Bills / Evaluations history (currently flat CRUD). Preferred-vendor auto-flag when avg rating ≥ 4.0 over last 3.
- **Assets**: "Bulk Import (CSV)" action + "Print QR Tag" preview modal (SVG QR placeholder). Software License category shows extra fields (seatsTotal/seatsUsed/renewalDate).
- **Reports**: add PO Aging, Bill Aging, Request Turnaround, Warranty Expiry (30/60/90) views.

### 4. Wire-up rules
- All screens reactive via existing `useStore()` pub/sub.
- Status transitions enforced in mutation helpers (e.g., approving a request with a matching Available asset assigns it; marking a quotation "Won" moves siblings to "Lost" and enables Create PO; recording a GRN for all lines closes the PO and auto-creates Asset rows for serialized categories; approving a Bill runs 3-way match against PO+GRN).
- Every mutation appends to `ActivityEvent` and fires a `sonner` toast.

## Out of scope (call out to user)
- No real backend / Lovable Cloud (mock data only, matching current app).
- No auth/RBAC enforcement — role menus stay visible to everyone; roles shown as labels on approvals.
- No real email / PDF generation — "Send to Vendor" and "Download PO" are UI stubs with toast confirmation.
- No barcode/QR library — QR is a decorative SVG placeholder.

## Delivery order
1. `procurement-data.ts` + store helpers.
2. Sidebar + route shells.
3. Requests → Approvals (linked pair) → validates end-to-end request flow.
4. Quotations → PO → GRN → Bills (procurement chain).
5. Dashboard widget + vendor tabs + reports additions.
6. Typecheck + smoke click-through via Playwright.

Estimated file impact: ~15 new files, ~8 edits. Ping me if you want to trim scope (e.g., drop Bills/3-way-match to a later pass) before I start.

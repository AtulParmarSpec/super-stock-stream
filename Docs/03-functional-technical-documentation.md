# Asset / Inventory Management Module — Functional & Technical Documentation

**Project:** Spectrum ERP — spec_specv2
**Status:** Draft v1.0

---

## 1. Purpose

This document specifies the functional behavior and a suggested technical design for the new **Asset / Inventory Management** module, covering: Dashboard, Inventory Listing, Vendor & Vendor Evaluation, Quotation, Purchase Order, Goods Receipt, Bills, Request for Inventory, and My Approvals.

Reference apps used for UX inspiration:
- IT asset dashboard/listing pattern (categories, status breakdown, assignment, warranty tracking)
- Zoho Inventory-style Bills/PO concepts (PO → Bill → payment status lifecycle)

---

## 2. Status Lifecycles (State Machines)

### 2.1 Asset Status
```
Available → Assigned → Available (on return)
Available/Assigned → In Maintenance → Available/Assigned
Available/Assigned → In Transfer → Available/Assigned (new location/owner)
Available/Assigned → Retired → Scrapped
Assigned → Lost (manual flag, requires incident note)
```

### 2.2 Inventory Request Status
```
Draft → Submitted → Pending Approval → Approved → Assigned/Fulfilled
                                 └──→ Rejected
Approved (no stock) → Procurement Triggered → Fulfilled (once PO received)
```

### 2.3 Quotation (RFQ) / Vendor Response Status
```
RFQ: Draft → Sent → Responses Received → Closed
Vendor Response: Sent → Received → Under Review → Won / Lost → Expired
```

### 2.4 Purchase Order Status
```
Draft → Pending Approval → Approved → Sent to Vendor
     → Partially Received → Fully Received → Closed
     → Cancelled (from Draft/Pending/Approved)
```

### 2.5 Bill Status
```
Draft → Pending Approval → Approved → Sent to Finance/AP → Paid
                                                        └──→ Overdue
```

### 2.6 Approval (generic, used by Requests/Quotations/POs/Bills)
```
Pending → Approved / Rejected / More Info Requested
Pending (past SLA) → Escalated
```

---

## 3. Screen-Level Functional Specification

### 3.1 Dashboard
- **KPI cards:** Total Assets, Assigned, Available, In Maintenance, Retired, Scrapped (with trend delta).
- **Charts:** Status breakdown (donut/bar), Asset value by category (bar), Request turnaround time (line, Phase 3).
- **Recent Activity feed:** last N events across Assets/Requests/POs.
- **My Pending Actions widget:** count + shortcut into My Approvals.
- **Filters:** by Company/Office/Department (multi-company support).
- **Export:** PDF/Excel snapshot of current view.

### 3.2 Inventory Listing (Asset Register)
- **List columns:** Asset Tag, Name, Category, Group/Department, Status, Assigned To, Location, Warranty Expiry, [Actions].
- **Detail page tabs:** Overview, Assignment History, Maintenance Log, Transfer Log, Documents (invoice/warranty), Linked PO/Bill.
- **Actions:** Add Asset, Edit, Assign/Reassign, Transfer, Mark Maintenance, Retire/Scrap, Print Tag (QR/barcode), Bulk Import (CSV/Excel).
- **Validation:** Asset Tag unique per company; Serial No. unique where `is_serialized = true`.

### 3.3 Request for Inventory
- **Form fields:** Category, Request Type (New/Replacement/Return), Specs/Description, Justification, Urgency (Low/Med/High), Attachments.
- **Routing rule:** category → approver group mapping (e.g., Laptop/Software → IT; Furniture/Facility → Infra/Admin; Onboarding kit → HR) — configurable lookup table, not hard-coded if-else.
- **Auto-suggestion:** if an `Available` asset matches category/specs, show "1 matching asset in stock" to speed up approval.
- **My Requests view:** requester's own requests with live status + comments trail.

### 3.4 My Approvals
- **Unified queue:** merges pending items from Inventory Requests, Quotations, POs, Bills where `approver_id = current_user` OR `approver_role` matches user's role and item is unassigned.
- **Row data:** Type, Title/Reference #, Requested By/Vendor, Value (if applicable), Age (days pending), SLA indicator (green/amber/red).
- **Actions:** Approve, Reject (comment required), Request More Info, Delegate.
- **Approve & Assign:** for Inventory Requests, approving with an available asset selected performs assignment in the same action.

### 3.5 Vendor Master
- **Fields:** Name, Category, Contact, Address, Tax ID, Bank Details, Payment Terms, Status, Preferred flag.
- **Tabs:** Overview, Quotations (history), POs (history), Bills (history), Evaluations (scorecard trend).

### 3.6 Vendor Evaluation
- **Trigger points:** manually anytime, or prompted after a PO is "Closed."
- **Scoring:** Quality, Pricing, Delivery Timeliness, Support/SLA, Compliance — each 1–5, weighted average = Overall Score.
- **Output:** feeds Vendor's rolling average; crossing configurable threshold sets `is_preferred = true`.

### 3.7 Quotation (RFQ)
- **Create RFQ:** add line items (category, description, specs, qty), select vendors (prefer "Preferred Vendor" suggestions), send.
- **Record responses:** manually enter or upload vendor's quotation PDF per vendor; capture price, delivery days, validity, terms.
- **Compare:** side-by-side table across vendors for the same RFQ.
- **Finalize:** mark one response "Won" (siblings auto → "Lost"); requires approver role per configured threshold.
- **Generate PO:** "Create PO" button on a Won response opens a pre-filled draft PO.

### 3.8 Purchase Order
- **Create:** from Won quotation (pre-filled) or blank (manual).
- **Fields:** Vendor, Items (category/description/qty/unit price), Cost Center/Department, Delivery Address, Expected Delivery Date, Terms.
- **Approval:** multi-level per value threshold (configurable matrix).
- **Dispatch:** generate PO PDF, email to vendor from system, log sent timestamp.
- **Amendment:** revise qty/price on an approved PO → triggers re-approval, keeps version history.

### 3.9 Goods Receipt (GRN) — sub-flow of PO
- **Record receipt:** against PO line items — qty received, condition (OK/Damaged/Shortage), receiver, date.
- **Partial receipt:** PO stays "Partially Received" until all lines fulfilled or short-closed with reason.
- **Auto asset creation:** for `is_serialized` categories, one Asset record per unit received (status = Available, linked to PO/vendor/cost); for non-serialized categories, increments a stock quantity counter instead of individual Asset rows.
- **Discrepancy flag:** shortage/damage recorded against the PO line, visible on Vendor Evaluation screen as an input signal.

### 3.10 Bills
- **Create Bill:** linked to a PO, capture invoice number/date/amount/tax/due date, attach vendor invoice.
- **3-way match:** compare Bill amount/qty vs. PO vs. GRN; flag variance beyond tolerance (e.g., ±2%) for manual review before approval.
- **Approval:** Dept Head/Finance per threshold.
- **Handoff:** on approval, status → "Sent to Finance/AP" (integration point) or tracked to "Paid" standalone if no separate Finance module exists.
- **Vendor Ledger:** per-vendor bill history, outstanding/paid, aging buckets (0-30/31-60/60+ days).

---

## 4. Suggested API Surface (REST-style — align with existing API conventions)

```
GET    /api/assets                     list + filters
POST   /api/assets                     create (manual add)
GET    /api/assets/{id}                detail + history
PATCH  /api/assets/{id}                update / status change
POST   /api/assets/{id}/assign         assign to employee
POST   /api/assets/{id}/transfer       transfer location/owner
POST   /api/assets/{id}/maintenance    start/end maintenance
POST   /api/assets/{id}/retire         retire/scrap

GET    /api/vendors | POST /api/vendors | GET/PATCH /api/vendors/{id}
POST   /api/vendors/{id}/evaluations   submit evaluation
GET    /api/vendors/{id}/scorecard     rating history

GET    /api/inventory-requests | POST /api/inventory-requests
GET    /api/inventory-requests/{id}
POST   /api/inventory-requests/{id}/approve
POST   /api/inventory-requests/{id}/reject

GET    /api/quotations | POST /api/quotations
POST   /api/quotations/{id}/responses         record vendor response
POST   /api/quotations/{id}/responses/{rid}/win
POST   /api/quotations/{id}/responses/{rid}/generate-po

GET    /api/purchase-orders | POST /api/purchase-orders
POST   /api/purchase-orders/{id}/approve
POST   /api/purchase-orders/{id}/send
POST   /api/purchase-orders/{id}/receipts       create GRN
GET    /api/purchase-orders/{id}/receipts

GET    /api/bills | POST /api/bills
POST   /api/bills/{id}/approve
GET    /api/bills/{id}/match-status             3-way match result

GET    /api/approvals/my                        unified "My Approvals" feed
POST   /api/approvals/{id}/decision
```

*(Exact routing/versioning/auth headers should follow whatever convention already exists in trunk — e.g., `/api/v1/...`, JWT/session auth, tenant/company scoping headers.)*

---

## 5. Notifications Matrix

| Event | Notify |
|---|---|
| Request submitted | Approver group |
| Request approved/rejected | Requester |
| Quotation sent | Vendor (external email) |
| Quotation won/lost | Procurement owner, vendor (optional) |
| PO approved | Vendor, Store/Receiving team |
| Goods received | Procurement owner, Requester (if tied to their request) |
| Bill due soon / overdue | Finance/Procurement owner |
| Approval pending > SLA | Approver + escalation to their manager |

---

## 6. Reporting Suite (Phase 3+)

- Asset Register (full export)
- Warranty Expiry Report (next 30/60/90 days)
- Vendor Performance Scorecard Report
- PO Aging Report
- Bill/Invoice Aging Report
- Inventory Request Turnaround Time Report
- Asset Utilization Report (Assigned vs. Available ratio by category/department)

---

## 7. Assumptions & Items to Validate Against Existing Codebase

Since the local trunk path and `localhost:8090` instance could not be accessed from this environment, the following are **assumptions** to validate once the code/schema is shared:

1. An existing Employee/HR master and Org (Company/Office/Department) master exist and can be referenced by ID.
2. An existing RBAC/permission framework exists and can be extended with new module permissions rather than building auth from scratch.
3. No existing generic "Purchase/Procurement" module exists yet in ERP that would overlap PO/Bills scope — **please confirm**, to avoid duplicate build.
4. Standard REST/MVC + relational DB backend (naming above is illustrative; adjust to actual ORM/migration conventions).
5. File/document storage service already exists for attachments (quotation PDFs, invoices).
6. Notification/email service already exists and can be reused.

---

## 8. Next Steps

1. Share (or upload) representative existing module code — folder structure, one existing CRUD module, DB migration/schema file, and existing user-story/ticket template — so this documentation can be revised to match conventions exactly.
2. Confirm the Open Questions listed in the Implementation Plan (esp. whether a Procurement module already exists, and Bills→Payment integration).
3. Confirm MVP scope/phasing against your sprint capacity.
4. Once confirmed, this documentation can be converted into Jira epics/stories with story points, and a DB schema/ERD diagram can be generated.

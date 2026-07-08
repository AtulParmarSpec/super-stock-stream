# Asset / Inventory Management Module — User Stories

**Epic:** Global ERP — IT Asset & Inventory Management
**Prepared for:** Spectrum ERP (spec_specv2)
**Status:** Draft v1.0

---

## 0. Roles Referenced in This Document

| Role | Description |
|---|---|
| Employee / Consultant | End user who requests inventory/hardware/software |
| HR | Approves requests tied to onboarding/offboarding, initiates non-IT procurement |
| IT | Approves & fulfills laptop/software/access-related requests, manages assets |
| Infra / Admin | Approves & fulfills office equipment, network, facility-related assets |
| Procurement Owner | HR/IT/Infra user who creates quotations & POs (same people, different task) |
| Store / Receiving Team | Receives physical goods against a PO and adds them to inventory |
| Vendor | External supplier who submits quotations and fulfills POs |
| Finance (existing module) | Processes vendor payment against Bills — assumed to already exist in ERP; this module hands off to it |

---

## Epic 1 — Asset & Inventory Dashboard

**As an** HR/IT/Infra/Admin user
**I want** a single dashboard summarizing asset health, stock, and pending actions
**So that** I can track inventory status and act on bottlenecks without digging through lists

### Stories

1. **US-101 — Summary KPIs**
   As a dashboard viewer, I want to see total assets, assigned, available, in-maintenance, retired, and scrapped counts, so I get an at-a-glance fleet health view.
   *AC:* Cards show live counts + delta vs. previous period; clicking a card deep-links to the filtered Inventory Listing.

4. **US-102 — Recent Activity Feed**
   As an approver, I want a feed of recent actions (Assigned, Created, Maintenance Started, Transferred, Retired), so I have visibility into inventory movement.

5. **US-103 — My Pending Actions Widget**
   As an HR/IT/Infra/Admin approver, I want a widget showing my pending approvals, quotations awaiting my decision, and POs awaiting receipt, so I don't miss SLAs.

6. **US-104 — Export Dashboard Report**
   As a manager, I want to export the dashboard summary (PDF/Excel), so I can share it in review meetings.

---

## Epic 2 — Inventory Listing (Asset Register)

**As an** IT/Infra/Admin user
**I want** a searchable, filterable master list of all assets
**So that** I can track ownership, location, warranty, and lifecycle of every item

### Stories

7. **US-201 — View Asset List**
   Columns: Asset Tag, Name/Model, Category, Group/Department, Status, Assigned To, Location, Warranty Expiry.
   *AC:* Paginated, sortable, server-side search by tag/name/serial number.

8. **US-202 — Filter & Segment**
   Filter by category, status, location, department, warranty expiring within N days.

9. **US-203 — Add Asset Manually**
   As a Store/Receiving user, I want to manually add an asset (outside the PO flow, e.g., a donated or transferred item), capturing tag, category, brand/model, serial no., cost, vendor, warranty, and location.

10. **US-204 — Asset Detail Page**
    View full history of an asset: assignment history, maintenance log, transfer log, linked PO/Bill, attached invoice/warranty documents.

11. **US-205 — Bulk Import**
    As an Admin, I want to bulk-import assets via CSV/Excel during initial migration.

12. **US-206 — Assign / Reassign / Transfer**
    As an IT/Infra user, I want to assign an available asset to an employee, or transfer it between employees/locations, with an e-signature/acknowledgement step.

13. **US-207 — Maintenance & Retirement**
    Mark an asset "In Maintenance" (with vendor/ticket ref) or "Retired/Scrapped" (with reason and disposal method), auto-updating dashboard counts.

14. **US-208 — Barcode / QR / Asset Tag Generation**
    Generate a printable QR/barcode label per asset for physical tracking.

15. **US-209 — Software License Tracking**
    As IT, I want license assets to additionally track seats used/available and renewal date, so we avoid over/under-licensing.

---

## Epic 3 — Vendor Master & Vendor Evaluation

**As a** Procurement Owner (HR/IT/Infra)
**I want** a vendor master with performance evaluation
**So that** I can select reliable, cost-effective suppliers

### Stories

16. **US-301 — Vendor Master CRUD**
    Fields: name, category (hardware/software/services), contact person, email/phone, address, GSTIN/Tax ID, bank details, payment terms, status (Active/Blacklisted).

17. **US-302 — Vendor Document Repository**
    Attach vendor contracts, NDAs, empanelment certificates.

18. **US-303 — Vendor Evaluation Form**
    As HR/IT/Infra, I want to score a vendor after each PO cycle on Quality, Pricing, Delivery Timeliness, Support/SLA adherence, and Compliance, producing a weighted overall rating (1–5).

19. **US-304 — Vendor Scorecard History**
    View trend of a vendor's ratings over time and across departments, to inform future vendor selection.

20. **US-305 — Preferred Vendor Flagging**
    Auto/manually flag "Preferred Vendor" once average rating crosses a threshold (e.g., ≥4.0 over last 3 evaluations); preferred vendors are pre-selected when creating quotation requests.

---

## Epic 4 — Quotation Management

**As an** HR/IT/Infra procurement owner
**I want** to request and compare quotations from multiple vendors
**So that** I get the best value before committing to a purchase

### Stories

21. **US-401 — Create Quotation Request**
    Add line items (category, description, specs, qty) and send RFQ to one or more selected vendors.

22. **US-402 — Record Vendor Quotations**
    Log each vendor's quoted price, delivery timeline, validity, and terms against the same RFQ — either entered manually or uploaded as a vendor PDF/attachment.

23. **US-403 — Side-by-Side Comparison**
    Compare multiple vendor quotations for the same RFQ in a single view (price, delivery, warranty terms) to support decision-making.

24. **US-404 — Approve / Finalize (Win) a Quotation**
    Mark one vendor's quotation as "Won"; all sibling quotations auto-move to "Lost."
    *AC:* Requires approver role (IT/Infra Head or Finance, per approval matrix/threshold).

25. **US-405 — Generate PO Directly from Won Quotation**
    One-click "Create PO" from a Won quotation, pre-filling vendor, items, pricing, and terms into a draft PO for review.

26. **US-406 — Quotation Status Lifecycle**
    Draft → Sent → Received → Under Review → Won/Lost → Expired.

27. **US-407 — Quotation Validity Alerts**
    Notify procurement owner when a pending quotation is nearing its validity expiry.

---

## Epic 5 — Purchase Order (PO) Management

**As an** HR/IT/Infra procurement owner
**I want** to raise and track Purchase Orders
**So that** procurement is auditable and tied to budget/approval

### Stories

28. **US-501 — Create PO from Quotation**
    Auto-generated from a Won quotation (see US-405); editable before submission.

29. **US-502 — Create PO Manually**
    As a procurement owner, I want to create a PO directly (no prior quotation) for routine/low-value or existing-contract purchases.

30. **US-503 — PO Approval Workflow**
    Multi-level approval based on PO value thresholds (e.g., <₹50k: Dept Head; ₹50k–₹5L: Dept Head + Finance; >₹5L: + CXO), configurable per company policy.

31. **US-504 — PO Status Tracking**
    Draft → Pending Approval → Approved → Sent to Vendor → Partially Received → Fully Received → Closed → Cancelled.

32. **US-505 — PO to Vendor Dispatch**
    Generate a PDF PO document and email/share it to the vendor from within the system.

33. **US-506 — Link PO to Budget/Cost Center**
    Tag PO to a department/cost center/budget line for financial tracking (integration point with existing Finance module).

34. **US-507 — PO Amendment**
    Support revising quantity/price on an approved PO with a re-approval trail (avoid silent edits).

---

## Epic 6 — Goods Receipt & Add to Inventory

**As a** Store/Receiving Team member
**I want** to receive ordered goods against a PO and push them into inventory
**So that** stock reflects reality and assets are traceable to their PO/vendor

### Stories

35. **US-601 — Goods Receipt Note (GRN)**
    Against a PO, record received quantity, date, condition (OK/Damaged/Shortage), and receiver name.

36. **US-602 — Partial Receipt**
    Support partial deliveries; PO remains "Partially Received" until all items are received or short-closed.

37. **US-603 — Auto-Create Asset Records**
    On receipt of serialized items (laptops, monitors, servers), auto-create individual Asset records (status = Available) pre-filled with category/model/cost/vendor/PO/warranty start date; bulk/non-serialized items (cables, toner) increment a stock quantity instead.

38. **US-604 — Discrepancy Handling**
    Flag shortage/damage against a PO line for follow-up with the vendor (linked to Vendor Evaluation scoring).

---

## Epic 7 — Bills / Vendor Invoices

**As a** Procurement/Finance user
**I want** to record and match vendor bills against POs and GRNs
**So that** payments are only made for what was ordered and received

### Stories

39. **US-701 — Record Vendor Bill**
    Capture invoice number, date, amount, tax, due date, and attach the vendor's invoice PDF, linked to a PO.

40. **US-702 — 3-Way Match**
    System validates Bill vs. PO vs. GRN quantities/amounts and flags mismatches before approval.

41. **US-703 — Bill Approval**
    Route bill for approval (Dept Head/Finance) before it's marked payable.

42. **US-704 — Payment Status Tracking**
    Track Bill status: Draft → Pending Approval → Approved → Sent to Finance/AP → Paid → Overdue.
    *AC:* Actual payment execution may be delegated to an existing Finance/AP module via integration; this module tracks status only unless otherwise scoped.

43. **US-705 — Vendor Ledger View**
    Per-vendor view of all bills, amounts paid/outstanding, aging.

---

## Epic 8 — Request for Inventory (Employee Self-Service)

**As an** Employee/Consultant
**I want** to request hardware/software/inventory items
**So that** I can get the equipment I need through a transparent, trackable process

### Stories

44. **US-801 — Raise Inventory Request**
    Select category (Laptop, Monitor, Peripheral, Software License, Access Card, etc.), specify justification, urgency, and preferred specs; system auto-routes to the correct approver group.

45. **US-802 — Request Types**
    Support New Request, Replacement (with reason: damaged/lost/upgrade), and Return.

46. **US-803 — Track My Requests**
    View status of submitted requests: Pending Approval → Approved → Assigned → Fulfilled, or Rejected (with reason).

47. **US-804 — Attach Justification Docs**
    Attach manager approval email, business justification, or damage photos (for replacement requests).

48. **US-805 — Auto-Suggest from Available Stock**
    If a matching available asset exists in inventory, requester/approver sees it suggested for immediate assignment instead of triggering new procurement.

49. **US-806 — Acknowledgement / Digital Sign-off**
    On assignment, requester digitally acknowledges receipt & responsibility for the asset (condition, accessories).

---

## Epic 9 — My Approvals

**As** HR/IT/Infra/Admin
**I want** a unified approval queue
**So that** I can review and act on inventory requests, quotations, POs, and bills awaiting my decision

### Stories

50. **US-901 — Unified Approval Inbox**
    Single "My Approvals" screen listing all pending items across modules (Inventory Requests, Quotations, POs, Bills) assigned to the logged-in approver, with type, requester, amount/value, and age.

51. **US-902 — Approve / Reject with Comments**
    Each item supports Approve, Reject, or Request More Info, with mandatory comments on rejection.

52. **US-903 — Approve & Assign in One Step**
    For Inventory Requests, approving can simultaneously trigger asset assignment (from available stock) or flag it for procurement if stock is insufficient.

53. **US-904 — Delegate Approval**
    Approver can delegate their approval authority temporarily (e.g., during leave) to a backup approver.

54. **US-905 — Approval History / Audit Trail**
    Full immutable log of who approved/rejected what and when, for compliance/audit.

55. **US-906 — SLA & Escalation Notifications**
    Auto-reminder/escalation if an item sits pending beyond a configurable SLA (e.g., 2 business days).

---

## Cross-Cutting / Non-Functional Stories

56. **US-951 — Role-Based Access Control**
    Menu/actions visible per role (Employee, HR, IT, Infra, Admin, Finance, Store) per the Permissions Matrix (see documentation doc).

57. **US-952 — Notifications**
    Email/in-app notifications for request submitted, approval needed, approved/rejected, PO sent, goods received, bill due.

58. **US-953 — Audit Log**
    Every create/update/status-change across Assets, Vendors, Quotations, POs, Bills, Requests, Approvals is logged with actor, timestamp, before/after values.

59. **US-954 — Multi-Company / Multi-Location Support**
    Inventory, vendors, and approvals scoped by Company/Office/Department, consistent with existing ERP masters.

60. **US-955 — Reporting & Export**
    Standard reports: Asset Register, Warranty Expiry, Vendor Performance, PO Aging, Bill Aging, Request Turnaround Time — exportable to Excel/PDF.

---

## Prioritization (Suggested MVP vs. Phase 2)

| Priority | Scope |
|---|---|
| **MVP (Phase 1)** | Asset Master + Inventory Listing, Request for Inventory, My Approvals (request approval + direct assignment from stock), basic Dashboard, Vendor Master |
| **Phase 2** | Quotation Management, PO Management (manual + from quotation), Goods Receipt → auto asset creation |
| **Phase 3** | Bills + 3-way match, Vendor Evaluation & scorecards, advanced Dashboard analytics, SLA escalations, bulk import |

*(Open for discussion — adjust based on your team's sprint capacity.)*

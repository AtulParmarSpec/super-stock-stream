# Asset / Inventory Management Module — Implementation Plan

**Project:** Spectrum ERP — spec_specv2
**Module:** Asset / Inventory Management (IT & General Asset Lifecycle)
**Status:** Draft v1.0

---

## 1. Objective

Add a new ERP module that lets HR/IT/Infra/Admin teams manage the full IT asset lifecycle —
**Request → Approval → (Quotation → PO) → Receipt → Inventory → Assignment → Maintenance/Retirement**
— with vendor and bill management, inside the existing Spectrum ERP, matching the current project's UI/UX, auth, and data conventions.

> **Note:** This plan is written from the requirements you provided and public reference apps (AssetFlow-style dashboard, Zoho Inventory-style PO/Bills concepts). It assumes standard ERP conventions (role-based menu, REST/MVC backend, relational DB). Once you share the existing trunk code structure (framework, ORM, module folder pattern, auth/permission system, existing "PO/Bills" if Finance/Procurement already has one), this plan should be revised to match exactly — flagged as **[ALIGN WITH EXISTING CODE]** throughout.

---

## 2. High-Level Process Flow

```
                         ┌─────────────────────────────┐
                         │  Employee / Consultant       │
                         │  raises Inventory Request    │
                         └───────────────┬──────────────┘
                                         ▼
                         ┌─────────────────────────────┐
                         │  My Approvals (HR/IT/Infra)  │
                         └───────────────┬──────────────┘
                     Stock available?    │      Stock NOT available
                    ┌────────────────────┴────────────────────┐
                    ▼                                          ▼
        Assign existing asset                    ┌───────────────────────────┐
        → status = Assigned                      │  Create Quotation Request  │
        → requester acknowledges                 │  (send RFQ to N vendors)   │
                                                  └───────────┬───────────────┘
                                                              ▼
                                                  Compare quotations → Win/Finalize
                                                              ▼
                                        ┌─────────────────────┴─────────────────────┐
                                        ▼                                           ▼
                          Generate PO directly from                     Create PO manually
                          the Won Quotation                             (no prior quotation)
                                        └─────────────────────┬─────────────────────┘
                                                              ▼
                                                    PO Approval workflow
                                                              ▼
                                                    PO sent to Vendor
                                                              ▼
                                          Receiving Team: Goods Receipt (GRN)
                                                              ▼
                                     Auto-create Asset record(s) → status = Available
                                                              ▼
                                     Vendor Bill recorded → 3-way match (PO/GRN/Bill)
                                                              ▼
                                          Bill approved → handed to Finance/AP
                                                              ▼
                                          Vendor Evaluation logged for this cycle
```

---

## 3. Module Breakdown & Screens

| # | Screen | Primary Roles | Depends On |
|---|---|---|---|
| 1 | Dashboard | All | Assets, Requests, POs, Bills (aggregation) |
| 2 | Inventory Listing (Asset Register) | IT/Infra/Admin, view: all | Asset Category, Vendor masters |
| 3 | Request for Inventory | Employee/Consultant | Asset Category master |
| 4 | My Approvals | HR/IT/Infra/Admin | Requests, Quotations, POs, Bills |
| 5 | Vendor Master | HR/IT/Infra/Admin | — (base master) |
| 6 | Vendor Evaluation | HR/IT/Infra/Admin | Vendor, PO |
| 7 | Quotation | HR/IT/Infra (procurement owners) | Vendor, Inventory Request (optional link) |
| 8 | Purchase Order (PO) | HR/IT/Infra (procurement owners) | Quotation (optional), Vendor |
| 9 | Goods Receipt (GRN) — sub-screen of PO | Store/Receiving | PO |
| 10 | Bills | Procurement/Finance | PO, GRN, Vendor |

---

## 4. Data Model (Entity Summary)

> Field lists are indicative; align exactly with existing naming/ID conventions in trunk.

- **AssetCategory** (id, name, parent_category, is_serialized, is_software_license)
- **Asset** (id, asset_tag, name, category_id, brand, model, serial_no, status, assigned_to_employee_id, department_id, location_id/office_id, purchase_cost, po_id, vendor_id, purchase_date, warranty_end_date, license_seats_total, license_seats_used, created_by, updated_at)
- **AssetHistory / AuditLog** (id, asset_id, action, from_status, to_status, actor_id, notes, timestamp)
- **Vendor** (id, name, category, contact_person, email, phone, address, tax_id, bank_details, payment_terms, status, is_preferred)
- **VendorEvaluation** (id, vendor_id, po_id, evaluator_id, quality_score, pricing_score, delivery_score, support_score, compliance_score, overall_score, comments, evaluated_at)
- **Quotation (RFQ)** (id, rfq_number, requested_by, department_id, status, created_at)
- **QuotationVendorResponse** (id, quotation_id, vendor_id, quoted_amount, delivery_days, validity_date, terms, status: sent/received/won/lost/expired, attachment_url)
- **QuotationItem** (id, quotation_id, category_id, description, specs, qty)
- **PurchaseOrder** (id, po_number, vendor_id, quotation_id (nullable), status, total_amount, cost_center_id, created_by, approved_by, approved_at, sent_at)
- **POItem** (id, po_id, category_id, description, qty, unit_price)
- **GoodsReceipt (GRN)** (id, po_id, received_by, received_date, status)
- **GRNItem** (id, grn_id, po_item_id, qty_received, condition, remarks)
- **Bill (Vendor Invoice)** (id, bill_number, vendor_id, po_id, invoice_no, invoice_date, amount, tax_amount, due_date, status, attachment_url)
- **InventoryRequest** (id, requester_id, category_id, request_type: new/replacement/return, justification, urgency, status, resolved_asset_id, created_at)
- **Approval** (id, entity_type: request/quotation/po/bill, entity_id, approver_id, approver_role, decision, comments, decided_at, sla_due_at)

**Key relationships:**
`InventoryRequest → Approval (1:N)`, `Quotation 1:N QuotationVendorResponse`, `Won QuotationVendorResponse → PurchaseOrder (1:1, optional)`, `PurchaseOrder 1:N GoodsReceipt`, `GoodsReceipt → Asset (1:N, auto-created)`, `PurchaseOrder 1:N Bill`, `Vendor 1:N VendorEvaluation`.

---

## 5. Roles & Permissions Matrix (Draft)

| Action | Employee/Consultant | HR | IT | Infra/Admin | Store/Receiving | Finance |
|---|---|---|---|---|---|---|
| Raise Inventory Request | ✅ | ✅ | ✅ | ✅ | – | – |
| Approve Inventory Request | – | ✅ (non-IT) | ✅ (IT assets) | ✅ (facility/infra) | – | – |
| View Dashboard | – | ✅ | ✅ | ✅ | ✅ (limited) | ✅ (limited) |
| Manage Asset Register | – | View only | ✅ | ✅ | View only | View only |
| Manage Vendor Master | – | ✅ | ✅ | ✅ | – | View only |
| Vendor Evaluation | – | ✅ | ✅ | ✅ | – | View only |
| Create/Send Quotation (RFQ) | – | ✅ | ✅ | ✅ | – | – |
| Approve/Finalize Quotation | – | ✅ (threshold) | ✅ (threshold) | ✅ (threshold) | – | ✅ (above threshold) |
| Create PO | – | ✅ | ✅ | ✅ | – | – |
| Approve PO | – | ✅ (threshold) | ✅ (threshold) | ✅ (threshold) | – | ✅ (above threshold) |
| Goods Receipt (GRN) | – | – | – | – | ✅ | – |
| Record Bill | – | – | – | – | – | ✅ (or Procurement) |
| Approve Bill / Payment | – | – | – | – | – | ✅ |

*(Exact thresholds/approval chains to be confirmed with your team — see Open Questions.)*

---

## 6. Suggested Delivery Phases

### Phase 1 — Foundation & Self-Service (MVP)
- Masters: Asset Category, Vendor
- Inventory Listing (Asset Register) — CRUD, filters, detail view, history
- Request for Inventory (employee raise request)
- My Approvals (approve/reject + direct assignment from available stock)
- Basic Dashboard (KPIs + status breakdown)
- RBAC & notifications foundation

### Phase 2 — Procurement Flow
- Quotation (RFQ) creation, vendor responses, comparison, Win/Lose
- PO creation (from quotation + manual), PO approval workflow, PO PDF/dispatch
- Goods Receipt (GRN) → auto asset creation, partial receipt handling

### Phase 3 — Financials & Vendor Governance
- Bills + 3-way match (PO/GRN/Bill)
- Vendor Evaluation & scorecards, Preferred Vendor logic
- Advanced Dashboard analytics (asset value by category, vendor performance)
- SLA escalation notifications, bulk import, barcode/QR labels

### Phase 4 — Hardening
- Reporting suite, audit exports, performance tuning, UAT, training docs, go-live

*(Sprint-by-sprint breakdown can be added once your team's sprint length and velocity are known — see Open Questions.)*

---

## 7. Integration Points With Existing ERP

| Existing Area (assumed) | Integration Need |
|---|---|
| Employee/HR Master | Requester identity, department, reporting manager for approvals |
| Org Structure (Company/Office/Department) | Location & cost-center tagging on Assets/POs |
| Finance/AP module (if exists) | Handoff of approved Bills for payment execution |
| Auth/RBAC framework | Reuse existing roles or extend with new Asset-module permissions |
| Notification service | Reuse existing email/in-app notification engine |
| Document storage | Reuse existing file/attachment storage for quotations, invoices, contracts |

**[ALIGN WITH EXISTING CODE]** — Once trunk code is shared, confirm: framework/language, existing module folder convention, existing "Procurement" or "Purchase" module (if any, to avoid duplication), ID/tag numbering conventions, and existing UI component library.

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Duplicate procurement logic if a Purchase/Procurement module already exists in ERP | Review trunk code first; extend rather than duplicate |
| Approval matrix varies by company/department | Make thresholds & approver chains configurable, not hard-coded |
| 3-way match complexity (partial receipts, price variance) | Start with a tolerance-based match (e.g., ±2%) and manual override with reason |
| Asset auto-creation from GRN creating bad data (wrong specs) | Require Store team to confirm/edit auto-drafted asset before finalizing |
| Scope creep into full Finance/AP | Explicitly scope Bills module to "track & approve," not "pay," unless confirmed otherwise |

---

## 9. Open Questions (Need Your Input)

1. Does the existing ERP already have a generic **Procurement/Purchase Order** module (for non-IT purchases) that this should reuse/extend, rather than build fresh?
2. What is the actual **tech stack** (backend framework, DB, frontend framework) so the plan/docs can match conventions exactly?
3. Does **Bills → Payment** need to integrate with an existing Finance/AP/Accounts module, or should payment status be tracked standalone in this module?
4. What are the actual **approval thresholds/hierarchy** (by PO/bill amount) per company policy?
5. Should **Software License** assets get a dedicated sub-flow (seats, renewal reminders) or be treated as a category within the same Asset model?
6. Any existing **asset tagging/numbering convention** already in use (physical asset tags) that must be respected?

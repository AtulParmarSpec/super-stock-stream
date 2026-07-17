// Procurement & approvals mock data — Inventory Requests, Quotations (RFQ),
// Purchase Orders, Goods Receipts, Bills, unified Approvals feed, and
// Activity events. All state is mutated in-place; consumers call bump().

import { bump, uid } from "./store";
import { assets } from "./inventory-data";

// ---------- Inventory Requests ----------
export type RequestType = "New" | "Replacement" | "Return";
export type Urgency = "Low" | "Medium" | "High";
export type RequestStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Procurement Triggered"
  | "Fulfilled"
  | "Rejected";

export interface RequestComment {
  id: string;
  author: string;
  when: string;
  text: string;
}

export interface InventoryRequest {
  id: string;
  reqNo: string;
  requester: string;
  department: string;
  category: string;
  type: RequestType;
  urgency: Urgency;
  justification: string;
  status: RequestStatus;
  approverGroup: "IT" | "HR" | "Infra/Admin";
  createdOn: string;
  resolvedAssetTag?: string;
  comments: RequestComment[];
}

// ---------- Quotations (RFQ) ----------
export type RfqStatus = "Draft" | "Sent" | "Responses Received" | "Closed";
export type VendorResponseStatus = "Sent" | "Received" | "Won" | "Lost" | "Expired";

export interface QuotationItem {
  id: string;
  category: string;
  description: string;
  qty: number;
}
export interface VendorResponse {
  id: string;
  vendor: string;
  amount: number;
  deliveryDays: number;
  validityDate: string;
  terms: string;
  status: VendorResponseStatus;
}
export interface Quotation {
  id: string;
  rfqNo: string;
  requester: string;
  department: string;
  status: RfqStatus;
  createdOn: string;
  items: QuotationItem[];
  responses: VendorResponse[];
  linkedRequestId?: string;
}

// ---------- Purchase Orders ----------
export type POStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Sent to Vendor"
  | "Partially Received"
  | "Fully Received"
  | "Closed"
  | "Cancelled";

export interface POItem {
  id: string;
  category: string;
  description: string;
  qty: number;
  unitPrice: number;
  qtyReceived: number;
}
export interface PurchaseOrder {
  id: string;
  poNo: string;
  vendor: string;
  status: POStatus;
  costCenter: string;
  createdBy: string;
  createdOn: string;
  expectedDelivery: string;
  totalAmount: number;
  items: POItem[];
  linkedQuotationId?: string;
  sentAt?: string;
}

// ---------- Goods Receipts (GRN) ----------
export type GRNCondition = "OK" | "Damaged" | "Shortage";
export interface GRNLine {
  id: string;
  poItemId: string;
  description: string;
  qtyReceived: number;
  condition: GRNCondition;
  remarks: string;
}
export interface GoodsReceipt {
  id: string;
  grnNo: string;
  poNo: string;
  poId: string;
  vendor: string;
  receivedBy: string;
  receivedOn: string;
  lines: GRNLine[];
}

// ---------- Bills ----------
export type BillStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Sent to Finance"
  | "Paid"
  | "Overdue";

export interface Bill {
  id: string;
  billNo: string;
  invoiceNo: string;
  vendor: string;
  poNo: string;
  poId: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  tax: number;
  status: BillStatus;
  matchResult?: "Matched" | "Variance" | "Not Checked";
  variancePct?: number;
}

// ---------- Approvals ----------
export type ApprovalEntity = "Request" | "Quotation" | "PO" | "Bill";
export type ApprovalDecision = "Pending" | "Approved" | "Rejected" | "More Info";
export interface ApprovalItem {
  id: string;
  entityType: ApprovalEntity;
  entityId: string;
  reference: string;
  requester: string;
  role: "IT" | "HR" | "Infra/Admin" | "Finance";
  value?: number;
  raisedOn: string;
  slaDueOn: string;
  decision: ApprovalDecision;
  comments?: string;
  decidedBy?: string;
  decidedOn?: string;
}

// ---------- Activity Feed / Audit ----------
export interface ActivityEvent {
  id: string;
  action: string;
  entity: string;
  actor: string;
  at: string;
}
export const activity: ActivityEvent[] = [
  { id: "act-seed-1", action: "PO Approved", entity: "PO-2026-0142", actor: "N. Patel", at: "2h ago" },
  { id: "act-seed-2", action: "Request Submitted", entity: "REQ-2026-0203", actor: "Priya N.", at: "4h ago" },
  { id: "act-seed-3", action: "Bill Approved", entity: "BIL-2026-0088", actor: "N. Becker", at: "1d ago" },
  { id: "act-seed-4", action: "Goods Received", entity: "GRN-2026-0071", actor: "Store SF", at: "1d ago" },
  { id: "act-seed-5", action: "Quotation Won", entity: "RFQ-2026-0055", actor: "IT Admin", at: "2d ago" },
];

export function logActivity(action: string, entity: string, actor = "IT Admin") {
  activity.unshift({ id: uid("act"), action, entity, actor, at: "just now" });
  if (activity.length > 40) activity.pop();
}

// ---------- Seeds ----------
const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysFromNow = (n: number) => iso(new Date(today.getTime() + n * 86400000));

export const inventoryRequests: InventoryRequest[] = [
  {
    id: "req-1", reqNo: "REQ-2026-0201", requester: "Sarah Chen", department: "Engineering",
    category: "Laptop", type: "New", urgency: "High",
    justification: "Onboarding for backend hire starting Mon.",
    status: "Pending Approval", approverGroup: "IT", createdOn: daysFromNow(-2),
    comments: [{ id: "c1", author: "Sarah Chen", when: daysFromNow(-2), text: "Please prioritise — start date confirmed." }],
  },
  {
    id: "req-2", reqNo: "REQ-2026-0202", requester: "David Park", department: "Design",
    category: "Software License", type: "New", urgency: "Medium",
    justification: "Adobe CC seat for freelance designer.",
    status: "Approved", approverGroup: "IT", createdOn: daysFromNow(-4),
    comments: [],
  },
  {
    id: "req-3", reqNo: "REQ-2026-0203", requester: "Priya Natarajan", department: "Product",
    category: "Mobile Device", type: "Replacement", urgency: "Low",
    justification: "Existing device battery swollen.",
    status: "Pending Approval", approverGroup: "IT", createdOn: daysFromNow(-1),
    comments: [],
  },
  {
    id: "req-4", reqNo: "REQ-2026-0204", requester: "Fatima Idris", department: "Sales",
    category: "Peripheral", type: "New", urgency: "Low",
    justification: "Headset for client calls.",
    status: "Fulfilled", approverGroup: "IT", createdOn: daysFromNow(-9),
    resolvedAssetTag: "IT-2024-023",
    comments: [],
  },
  {
    id: "req-5", reqNo: "REQ-2026-0205", requester: "Noah Becker", department: "Finance",
    category: "Monitor", type: "New", urgency: "Medium",
    justification: "Second monitor for month-end close.",
    status: "Procurement Triggered", approverGroup: "IT", createdOn: daysFromNow(-6),
    comments: [],
  },
];

export const quotations: Quotation[] = [
  {
    id: "rfq-1", rfqNo: "RFQ-2026-0055", requester: "IT Admin", department: "IT",
    status: "Closed", createdOn: daysFromNow(-15),
    items: [
      { id: "qi-1", category: "Laptop", description: "MacBook Pro 16 M3 Max, 36GB/1TB", qty: 5 },
      { id: "qi-2", category: "Monitor", description: "Dell U2723QE 27\" 4K", qty: 5 },
    ],
    responses: [
      { id: "vr-1", vendor: "Apple Inc.", amount: 18995, deliveryDays: 7, validityDate: daysFromNow(20), terms: "Net 30, on-site warranty", status: "Won" },
      { id: "vr-2", vendor: "Dell Technologies", amount: 19750, deliveryDays: 5, validityDate: daysFromNow(20), terms: "Net 45", status: "Lost" },
      { id: "vr-3", vendor: "Lenovo", amount: 17800, deliveryDays: 10, validityDate: daysFromNow(20), terms: "Net 30", status: "Lost" },
    ],
  },
  {
    id: "rfq-2", rfqNo: "RFQ-2026-0056", requester: "N. Patel", department: "Infra",
    status: "Responses Received", createdOn: daysFromNow(-6),
    items: [
      { id: "qi-3", category: "Server", description: "Dell PowerEdge R760 Xeon Gold", qty: 2 },
    ],
    responses: [
      { id: "vr-4", vendor: "Dell Technologies", amount: 44000, deliveryDays: 21, validityDate: daysFromNow(14), terms: "Net 45", status: "Received" },
      { id: "vr-5", vendor: "HPE Enterprise", amount: 46500, deliveryDays: 18, validityDate: daysFromNow(14), terms: "Net 30", status: "Received" },
    ],
  },
  {
    id: "rfq-3", rfqNo: "RFQ-2026-0057", requester: "IT Admin", department: "IT",
    status: "Sent", createdOn: daysFromNow(-1),
    items: [
      { id: "qi-4", category: "Software License", description: "Microsoft 365 E5 — 100 seats", qty: 100 },
    ],
    responses: [
      { id: "vr-6", vendor: "Microsoft", amount: 42000, deliveryDays: 1, validityDate: daysFromNow(30), terms: "Annual, auto-renew", status: "Sent" },
    ],
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1", poNo: "PO-2026-0140", vendor: "Apple Inc.", status: "Fully Received",
    costCenter: "CC-1001", createdBy: "IT Admin", createdOn: daysFromNow(-14),
    expectedDelivery: daysFromNow(-7), totalAmount: 18995, linkedQuotationId: "rfq-1",
    sentAt: daysFromNow(-13),
    items: [
      { id: "poi-1", category: "Laptop", description: "MacBook Pro 16 M3 Max", qty: 5, unitPrice: 3499, qtyReceived: 5 },
      { id: "poi-2", category: "Monitor", description: "Dell U2723QE", qty: 5, unitPrice: 619, qtyReceived: 5 },
    ],
  },
  {
    id: "po-2", poNo: "PO-2026-0141", vendor: "Cisco Systems", status: "Partially Received",
    costCenter: "CC-1004", createdBy: "N. Patel", createdOn: daysFromNow(-10),
    expectedDelivery: daysFromNow(3), totalAmount: 25000,
    sentAt: daysFromNow(-9),
    items: [
      { id: "poi-3", category: "Network Equipment", description: "Catalyst 9300-48P", qty: 2, unitPrice: 12500, qtyReceived: 1 },
    ],
  },
  {
    id: "po-3", poNo: "PO-2026-0142", vendor: "Microsoft", status: "Approved",
    costCenter: "CC-1001", createdBy: "IT Admin", createdOn: daysFromNow(-2),
    expectedDelivery: daysFromNow(1), totalAmount: 42000,
    items: [
      { id: "poi-4", category: "Software License", description: "Microsoft 365 E5 x100", qty: 100, unitPrice: 420, qtyReceived: 0 },
    ],
  },
  {
    id: "po-4", poNo: "PO-2026-0143", vendor: "Dell Technologies", status: "Pending Approval",
    costCenter: "CC-1004", createdBy: "N. Patel", createdOn: daysFromNow(-1),
    expectedDelivery: daysFromNow(21), totalAmount: 44000, linkedQuotationId: "rfq-2",
    items: [
      { id: "poi-5", category: "Server", description: "PowerEdge R760", qty: 2, unitPrice: 22000, qtyReceived: 0 },
    ],
  },
];

export const goodsReceipts: GoodsReceipt[] = [
  {
    id: "grn-1", grnNo: "GRN-2026-0070", poNo: "PO-2026-0140", poId: "po-1",
    vendor: "Apple Inc.", receivedBy: "Store SF", receivedOn: daysFromNow(-7),
    lines: [
      { id: "gl-1", poItemId: "poi-1", description: "MacBook Pro 16 M3 Max", qtyReceived: 5, condition: "OK", remarks: "" },
      { id: "gl-2", poItemId: "poi-2", description: "Dell U2723QE", qtyReceived: 5, condition: "OK", remarks: "" },
    ],
  },
  {
    id: "grn-2", grnNo: "GRN-2026-0071", poNo: "PO-2026-0141", poId: "po-2",
    vendor: "Cisco Systems", receivedBy: "Store SFDC", receivedOn: daysFromNow(-1),
    lines: [
      { id: "gl-3", poItemId: "poi-3", description: "Catalyst 9300-48P", qtyReceived: 1, condition: "OK", remarks: "Second unit delayed" },
    ],
  },
];

export const bills: Bill[] = [
  {
    id: "bil-1", billNo: "BIL-2026-0087", invoiceNo: "APL-INV-90881", vendor: "Apple Inc.",
    poNo: "PO-2026-0140", poId: "po-1", invoiceDate: daysFromNow(-6), dueDate: daysFromNow(24),
    amount: 18995, tax: 1710, status: "Paid", matchResult: "Matched", variancePct: 0,
  },
  {
    id: "bil-2", billNo: "BIL-2026-0088", invoiceNo: "CSC-2026-4412", vendor: "Cisco Systems",
    poNo: "PO-2026-0141", poId: "po-2", invoiceDate: daysFromNow(-1), dueDate: daysFromNow(29),
    amount: 12750, tax: 1148, status: "Pending Approval", matchResult: "Variance", variancePct: 2.0,
  },
];

export const approvals: ApprovalItem[] = [
  {
    id: "apr-1", entityType: "Request", entityId: "req-1", reference: "REQ-2026-0201",
    requester: "Sarah Chen", role: "IT", raisedOn: daysFromNow(-2), slaDueOn: daysFromNow(0),
    decision: "Pending",
  },
  {
    id: "apr-2", entityType: "Request", entityId: "req-3", reference: "REQ-2026-0203",
    requester: "Priya Natarajan", role: "IT", raisedOn: daysFromNow(-1), slaDueOn: daysFromNow(1),
    decision: "Pending",
  },
  {
    id: "apr-3", entityType: "PO", entityId: "po-4", reference: "PO-2026-0143",
    requester: "N. Patel", role: "Finance", value: 44000, raisedOn: daysFromNow(-1),
    slaDueOn: daysFromNow(1), decision: "Pending",
  },
  {
    id: "apr-4", entityType: "Bill", entityId: "bil-2", reference: "BIL-2026-0088",
    requester: "AP Clerk", role: "Finance", value: 12750, raisedOn: daysFromNow(-1),
    slaDueOn: daysFromNow(2), decision: "Pending",
  },
];

// ---------- Mutations ----------

export function createRequest(input: Omit<InventoryRequest, "id" | "reqNo" | "status" | "createdOn" | "comments">) {
  const req: InventoryRequest = {
    ...input,
    id: uid("req"),
    reqNo: `REQ-2026-${String(200 + inventoryRequests.length + 1).padStart(4, "0")}`,
    status: "Pending Approval",
    createdOn: daysFromNow(0),
    comments: [],
  };
  inventoryRequests.push(req);
  approvals.push({
    id: uid("apr"), entityType: "Request", entityId: req.id, reference: req.reqNo,
    requester: req.requester, role: req.approverGroup === "HR" ? "HR" : req.approverGroup === "Infra/Admin" ? "Infra/Admin" : "IT",
    raisedOn: req.createdOn, slaDueOn: daysFromNow(2), decision: "Pending",
  });
  logActivity("Request Submitted", req.reqNo, req.requester);
  bump();
  return req;
}

export function decideRequest(reqId: string, decision: "Approved" | "Rejected", comments: string) {
  const r = inventoryRequests.find((x) => x.id === reqId);
  if (!r) return;
  if (decision === "Approved") {
    const match = assets.find((a) => a.status === "Available" && a.category === r.category);
    if (match) {
      match.status = "Assigned";
      match.assignedTo = r.requester;
      match.department = r.department;
      r.status = "Fulfilled";
      r.resolvedAssetTag = match.assetTag;
      logActivity("Request Fulfilled from stock", `${r.reqNo} → ${match.assetTag}`);
    } else {
      r.status = "Procurement Triggered";
      logActivity("Procurement Triggered", r.reqNo);
    }
  } else {
    r.status = "Rejected";
    logActivity("Request Rejected", r.reqNo);
  }
  if (comments) r.comments.push({ id: uid("c"), author: "Approver", when: daysFromNow(0), text: comments });
  const apr = approvals.find((a) => a.entityType === "Request" && a.entityId === reqId && a.decision === "Pending");
  if (apr) {
    apr.decision = decision;
    apr.comments = comments;
    apr.decidedBy = "Current User";
    apr.decidedOn = daysFromNow(0);
  }
  bump();
}

export function decideApproval(aprId: string, decision: "Approved" | "Rejected" | "More Info", comments: string) {
  const a = approvals.find((x) => x.id === aprId);
  if (!a) return;
  a.decision = decision;
  a.comments = comments;
  a.decidedBy = "Current User";
  a.decidedOn = daysFromNow(0);
  if (a.entityType === "Request") {
    if (decision === "Approved" || decision === "Rejected") decideRequest(a.entityId, decision, comments);
  } else if (a.entityType === "PO") {
    const po = purchaseOrders.find((p) => p.id === a.entityId);
    if (po && decision === "Approved") { po.status = "Approved"; logActivity("PO Approved", po.poNo); }
    if (po && decision === "Rejected") { po.status = "Cancelled"; logActivity("PO Rejected", po.poNo); }
  } else if (a.entityType === "Bill") {
    const b = bills.find((x) => x.id === a.entityId);
    if (b && decision === "Approved") { b.status = "Approved"; logActivity("Bill Approved", b.billNo); }
    if (b && decision === "Rejected") { b.status = "Draft"; logActivity("Bill Rejected", b.billNo); }
  } else if (a.entityType === "Quotation") {
    const q = quotations.find((x) => x.id === a.entityId);
    if (q && decision === "Approved") { q.status = "Closed"; logActivity("Quotation Finalized", q.rfqNo); }
  }
  bump();
}

export function markResponseWon(rfqId: string, responseId: string) {
  const q = quotations.find((x) => x.id === rfqId);
  if (!q) return;
  q.responses.forEach((r) => { r.status = r.id === responseId ? "Won" : "Lost"; });
  q.status = "Closed";
  logActivity("Quotation Won", q.rfqNo);
  bump();
}

export function createPOFromQuotation(rfqId: string, responseId: string) {
  const q = quotations.find((x) => x.id === rfqId);
  const r = q?.responses.find((x) => x.id === responseId);
  if (!q || !r) return null;
  const po: PurchaseOrder = {
    id: uid("po"),
    poNo: `PO-2026-${String(140 + purchaseOrders.length + 1).padStart(4, "0")}`,
    vendor: r.vendor, status: "Draft", costCenter: "CC-1001",
    createdBy: "IT Admin", createdOn: daysFromNow(0),
    expectedDelivery: daysFromNow(r.deliveryDays),
    totalAmount: r.amount,
    linkedQuotationId: q.id,
    items: q.items.map((i) => ({
      id: uid("poi"), category: i.category, description: i.description,
      qty: i.qty, unitPrice: Math.round(r.amount / q.items.reduce((s, x) => s + x.qty, 0)), qtyReceived: 0,
    })),
  };
  purchaseOrders.push(po);
  logActivity("PO Created from Quotation", `${po.poNo} ← ${q.rfqNo}`);
  bump();
  return po;
}

export function sendPO(poId: string) {
  const po = purchaseOrders.find((p) => p.id === poId);
  if (!po) return;
  po.status = "Sent to Vendor";
  po.sentAt = daysFromNow(0);
  logActivity("PO Sent to Vendor", po.poNo);
  bump();
}

export function submitPOForApproval(poId: string) {
  const po = purchaseOrders.find((p) => p.id === poId);
  if (!po) return;
  po.status = "Pending Approval";
  approvals.push({
    id: uid("apr"), entityType: "PO", entityId: po.id, reference: po.poNo,
    requester: po.createdBy, role: "Finance", value: po.totalAmount,
    raisedOn: daysFromNow(0), slaDueOn: daysFromNow(2), decision: "Pending",
  });
  logActivity("PO Submitted for Approval", po.poNo);
  bump();
}

export function createGRN(poId: string, receivedBy: string, lines: { poItemId: string; qtyReceived: number; condition: GRNCondition; remarks: string }[]) {
  const po = purchaseOrders.find((p) => p.id === poId);
  if (!po) return null;
  const grn: GoodsReceipt = {
    id: uid("grn"),
    grnNo: `GRN-2026-${String(70 + goodsReceipts.length + 1).padStart(4, "0")}`,
    poNo: po.poNo, poId: po.id, vendor: po.vendor, receivedBy, receivedOn: daysFromNow(0),
    lines: lines.map((l) => {
      const item = po.items.find((i) => i.id === l.poItemId);
      return { id: uid("gl"), poItemId: l.poItemId, description: item?.description ?? "", qtyReceived: l.qtyReceived, condition: l.condition, remarks: l.remarks };
    }),
  };
  goodsReceipts.push(grn);
  // Update qty received + PO status
  for (const l of lines) {
    const item = po.items.find((i) => i.id === l.poItemId);
    if (item) item.qtyReceived = Math.min(item.qty, item.qtyReceived + l.qtyReceived);
  }
  const allReceived = po.items.every((i) => i.qtyReceived >= i.qty);
  const anyReceived = po.items.some((i) => i.qtyReceived > 0);
  po.status = allReceived ? "Fully Received" : anyReceived ? "Partially Received" : po.status;
  logActivity("Goods Received", grn.grnNo);
  bump();
  return grn;
}

export function createBill(input: Omit<Bill, "id" | "billNo" | "status" | "matchResult" | "variancePct">) {
  const po = purchaseOrders.find((p) => p.id === input.poId);
  const poTotal = po?.totalAmount ?? 0;
  const variance = poTotal > 0 ? Math.abs(((input.amount - poTotal) / poTotal) * 100) : 0;
  const bill: Bill = {
    ...input,
    id: uid("bil"),
    billNo: `BIL-2026-${String(87 + bills.length + 1).padStart(4, "0")}`,
    status: "Pending Approval",
    matchResult: variance <= 2 ? "Matched" : "Variance",
    variancePct: Math.round(variance * 10) / 10,
  };
  bills.push(bill);
  approvals.push({
    id: uid("apr"), entityType: "Bill", entityId: bill.id, reference: bill.billNo,
    requester: "AP Clerk", role: "Finance", value: bill.amount,
    raisedOn: daysFromNow(0), slaDueOn: daysFromNow(3), decision: "Pending",
  });
  logActivity("Bill Recorded", bill.billNo);
  bump();
  return bill;
}

// ---------- Standalone creators (used by "New" dialogs on list pages) ----------

export function createRfq(input: {
  requester: string; department: string; items: { category: string; description: string; qty: number }[]; vendors: string[];
}) {
  const rfq: Quotation = {
    id: uid("rfq"),
    rfqNo: `RFQ-2026-${String(55 + quotations.length + 1).padStart(4, "0")}`,
    requester: input.requester,
    department: input.department,
    status: "Sent",
    createdOn: daysFromNow(0),
    items: input.items.map((i) => ({ id: uid("qi"), category: i.category, description: i.description, qty: i.qty })),
    responses: input.vendors.map((v) => ({
      id: uid("vr"), vendor: v, amount: 0, deliveryDays: 0, validityDate: daysFromNow(14), terms: "", status: "Sent" as VendorResponseStatus,
    })),
  };
  quotations.push(rfq);
  logActivity("RFQ Created", rfq.rfqNo, input.requester);
  bump();
  return rfq;
}

export function createPO(input: {
  vendor: string; costCenter: string; createdBy: string; expectedDelivery: string;
  items: { category: string; description: string; qty: number; unitPrice: number }[];
}) {
  const total = input.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const po: PurchaseOrder = {
    id: uid("po"),
    poNo: `PO-2026-${String(140 + purchaseOrders.length + 1).padStart(4, "0")}`,
    vendor: input.vendor, status: "Draft", costCenter: input.costCenter,
    createdBy: input.createdBy, createdOn: daysFromNow(0),
    expectedDelivery: input.expectedDelivery, totalAmount: total,
    items: input.items.map((i) => ({
      id: uid("poi"), category: i.category, description: i.description,
      qty: i.qty, unitPrice: i.unitPrice, qtyReceived: 0,
    })),
  };
  purchaseOrders.push(po);
  logActivity("PO Created", po.poNo, input.createdBy);
  bump();
  return po;
}


import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Send, PackageCheck, Receipt } from "lucide-react";
import { PageShell, ToneBadge } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import {
  purchaseOrders, sendPO, submitPOForApproval, createGRN, createBill,
  type PurchaseOrder, type POStatus, type GRNCondition,
} from "@/lib/procurement-data";
import { toast } from "sonner";

export const Route = createFileRoute("/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders — AssetFlow" }] }),
  component: POsPage,
});

function toneFor(s: POStatus) {
  if (s === "Fully Received" || s === "Closed") return "success" as const;
  if (s === "Partially Received" || s === "Sent to Vendor") return "info" as const;
  if (s === "Cancelled") return "destructive" as const;
  if (s === "Pending Approval") return "warning" as const;
  return "muted" as const;
}

function POsPage() {
  useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [grn, setGrn] = useState<PurchaseOrder | null>(null);
  const [bill, setBill] = useState<PurchaseOrder | null>(null);
  const [grnLines, setGrnLines] = useState<Record<string, { qty: number; condition: GRNCondition; remarks: string }>>({});
  const [billForm, setBillForm] = useState({ invoiceNo: "", amount: 0, tax: 0, invoiceDate: "", dueDate: "" });

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return purchaseOrders.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      return !t || [r.poNo, r.vendor, r.costCenter].some((v) => v.toLowerCase().includes(t));
    });
  }, [q, status]);

  function openGRN(po: PurchaseOrder) {
    const init: typeof grnLines = {};
    for (const i of po.items) init[i.id] = { qty: Math.max(0, i.qty - i.qtyReceived), condition: "OK", remarks: "" };
    setGrnLines(init);
    setGrn(po);
  }
  function submitGRN() {
    if (!grn) return;
    const lines = Object.entries(grnLines)
      .filter(([, v]) => v.qty > 0)
      .map(([poItemId, v]) => ({ poItemId, qtyReceived: v.qty, condition: v.condition, remarks: v.remarks }));
    if (!lines.length) { toast.error("Enter received quantity on at least one line"); return; }
    createGRN(grn.id, "Store SF", lines);
    toast.success("Goods Receipt recorded");
    setGrn(null);
  }
  function openBill(po: PurchaseOrder) {
    setBillForm({
      invoiceNo: "", amount: po.totalAmount, tax: Math.round(po.totalAmount * 0.09),
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    });
    setBill(po);
  }
  function submitBill() {
    if (!bill) return;
    if (!billForm.invoiceNo.trim()) { toast.error("Invoice # is required"); return; }
    const b = createBill({
      invoiceNo: billForm.invoiceNo, vendor: bill.vendor, poNo: bill.poNo, poId: bill.id,
      invoiceDate: billForm.invoiceDate, dueDate: billForm.dueDate,
      amount: Number(billForm.amount), tax: Number(billForm.tax),
    });
    toast.success(`${b.billNo} recorded — ${b.matchResult === "Matched" ? "3-way match OK" : `${b.variancePct}% variance flagged`}`);
    setBill(null);
  }

  return (
    <PageShell title="Purchase Orders" description="Raise, approve, dispatch, and receive against POs.">
      <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search PO # / vendor / cost center..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Draft", "Pending Approval", "Approved", "Sent to Vendor", "Partially Received", "Fully Received", "Closed", "Cancelled"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[320px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-mono text-xs">{po.poNo}</TableCell>
                <TableCell className="font-medium">{po.vendor}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{po.costCenter}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{po.createdOn}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{po.expectedDelivery}</TableCell>
                <TableCell className="text-right font-mono">${po.totalAmount.toLocaleString()}</TableCell>
                <TableCell><ToneBadge tone={toneFor(po.status)}>{po.status}</ToneBadge></TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {po.status === "Draft" && (
                      <Button size="sm" variant="outline" onClick={() => { submitPOForApproval(po.id); toast.success("Submitted for approval"); }}>Submit</Button>
                    )}
                    {po.status === "Approved" && (
                      <Button size="sm" variant="outline" onClick={() => { sendPO(po.id); toast.success(`PO dispatched to ${po.vendor}`); }}>
                        <Send className="mr-1 h-3 w-3" />Send
                      </Button>
                    )}
                    {(po.status === "Sent to Vendor" || po.status === "Partially Received") && (
                      <Button size="sm" variant="outline" onClick={() => openGRN(po)}><PackageCheck className="mr-1 h-3 w-3" />GRN</Button>
                    )}
                    {(po.status === "Fully Received" || po.status === "Partially Received") && (
                      <Button size="sm" variant="outline" onClick={() => openBill(po)}><Receipt className="mr-1 h-3 w-3" />Bill</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!grn} onOpenChange={(o) => !o && setGrn(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Goods Receipt — {grn?.poNo}</DialogTitle></DialogHeader>
          {grn && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Prev Received</TableHead>
                  <TableHead className="w-[100px]">Receiving</TableHead>
                  <TableHead className="w-[140px]">Condition</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grn.items.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.description}</TableCell>
                    <TableCell className="text-right">{i.qty}</TableCell>
                    <TableCell className="text-right">{i.qtyReceived}</TableCell>
                    <TableCell>
                      <Input type="number" min={0} max={i.qty - i.qtyReceived}
                        value={grnLines[i.id]?.qty ?? 0}
                        onChange={(e) => setGrnLines((s) => ({ ...s, [i.id]: { ...s[i.id], qty: Number(e.target.value) } }))} />
                    </TableCell>
                    <TableCell>
                      <Select value={grnLines[i.id]?.condition ?? "OK"}
                        onValueChange={(v) => setGrnLines((s) => ({ ...s, [i.id]: { ...s[i.id], condition: v as GRNCondition } }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["OK", "Damaged", "Shortage"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input value={grnLines[i.id]?.remarks ?? ""}
                        onChange={(e) => setGrnLines((s) => ({ ...s, [i.id]: { ...s[i.id], remarks: e.target.value } }))} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrn(null)}>Cancel</Button>
            <Button onClick={submitGRN}>Record Receipt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!bill} onOpenChange={(o) => !o && setBill(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Bill — {bill?.poNo}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label className="mb-1.5 block text-xs">Invoice #</Label>
              <Input value={billForm.invoiceNo} onChange={(e) => setBillForm({ ...billForm, invoiceNo: e.target.value })} /></div>
            <div><Label className="mb-1.5 block text-xs">Invoice Date</Label>
              <Input type="date" value={billForm.invoiceDate} onChange={(e) => setBillForm({ ...billForm, invoiceDate: e.target.value })} /></div>
            <div><Label className="mb-1.5 block text-xs">Amount</Label>
              <Input type="number" value={billForm.amount} onChange={(e) => setBillForm({ ...billForm, amount: Number(e.target.value) })} /></div>
            <div><Label className="mb-1.5 block text-xs">Tax</Label>
              <Input type="number" value={billForm.tax} onChange={(e) => setBillForm({ ...billForm, tax: Number(e.target.value) })} /></div>
            <div className="col-span-2"><Label className="mb-1.5 block text-xs">Due Date</Label>
              <Input type="date" value={billForm.dueDate} onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })} /></div>
            <div className="col-span-2 rounded-md bg-muted p-2 text-xs text-muted-foreground">
              3-way match runs on save: Bill vs. PO total vs. GRN quantities. Variance {'>'}2% flags for review.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBill(null)}>Cancel</Button>
            <Button onClick={submitBill}>Save & Match</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Plus } from "lucide-react";
import { PageShell, MetricStrip, ToneBadge } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore, bump } from "@/lib/store";
import { bills, purchaseOrders, createBill, logActivity, type BillStatus } from "@/lib/procurement-data";
import { vendors } from "@/lib/operations-data";
import { toast } from "sonner";

export const Route = createFileRoute("/bills")({
  head: () => ({ meta: [{ title: "Bills — AssetFlow" }] }),
  component: BillsPage,
});

function toneFor(s: BillStatus) {
  if (s === "Paid") return "success" as const;
  if (s === "Overdue") return "destructive" as const;
  if (s === "Approved" || s === "Sent to Finance") return "info" as const;
  if (s === "Pending Approval") return "warning" as const;
  return "muted" as const;
}

function BillsPage() {
  useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [openNew, setOpenNew] = useState(false);
  const emptyForm = () => ({
    invoiceNo: "", vendor: vendors[0]?.name ?? "", poNo: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    amount: 0, tax: 0,
  });
  const [form, setForm] = useState(emptyForm());

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return bills.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      return !t || [b.billNo, b.invoiceNo, b.vendor, b.poNo].some((v) => v.toLowerCase().includes(t));
    });
  }, [q, status]);

  const totals = useMemo(() => ({
    total: bills.reduce((s, b) => s + b.amount + b.tax, 0),
    outstanding: bills.filter((b) => b.status !== "Paid").reduce((s, b) => s + b.amount + b.tax, 0),
    overdue: bills.filter((b) => b.status === "Overdue").length,
    flagged: bills.filter((b) => b.matchResult === "Variance").length,
  }), []);

  const vendorPOs = useMemo(
    () => purchaseOrders.filter((p) => p.vendor === form.vendor),
    [form.vendor],
  );

  function markPaid(id: string) {
    const b = bills.find((x) => x.id === id);
    if (!b) return;
    b.status = "Paid";
    logActivity("Bill Paid", b.billNo);
    bump();
    toast.success(`${b.billNo} marked paid`);
  }

  function submitNew() {
    if (!form.invoiceNo.trim()) { toast.error("Invoice # is required"); return; }
    if (!form.vendor) { toast.error("Vendor is required"); return; }
    if (Number(form.amount) <= 0) { toast.error("Amount must be > 0"); return; }
    const po = purchaseOrders.find((p) => p.poNo === form.poNo);
    const b = createBill({
      invoiceNo: form.invoiceNo, vendor: form.vendor,
      poNo: form.poNo || "—", poId: po?.id ?? "",
      invoiceDate: form.invoiceDate, dueDate: form.dueDate,
      amount: Number(form.amount), tax: Number(form.tax),
    });
    toast.success(`${b.billNo} recorded${b.matchResult ? ` — ${b.matchResult}` : ""}`);
    setOpenNew(false); setForm(emptyForm());
  }

  return (
    <PageShell
      title="Bills"
      description="Vendor invoices with 3-way match against POs and receipts."
      actions={<Button size="sm" onClick={() => setOpenNew(true)}><Plus className="mr-2 h-4 w-4" />New Bill</Button>}
    >
      <MetricStrip items={[
        { label: "Total billed", value: `$${(totals.total / 1000).toFixed(1)}k` },
        { label: "Outstanding", value: `$${(totals.outstanding / 1000).toFixed(1)}k` },
        { label: "Overdue", value: totals.overdue },
        { label: "Variance flagged", value: totals.flagged },
      ]} />

      <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search bills..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Draft", "Pending Approval", "Approved", "Sent to Finance", "Paid", "Overdue"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill #</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>PO</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>3-way Match</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.billNo}</TableCell>
                <TableCell className="font-mono text-xs">{b.invoiceNo}</TableCell>
                <TableCell className="font-medium">{b.vendor}</TableCell>
                <TableCell className="font-mono text-xs">{b.poNo}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.dueDate}</TableCell>
                <TableCell className="text-right font-mono">${(b.amount + b.tax).toLocaleString()}</TableCell>
                <TableCell>
                  <ToneBadge tone={b.matchResult === "Matched" ? "success" : b.matchResult === "Variance" ? "warning" : "muted"}>
                    {b.matchResult === "Variance" ? `Variance ${b.variancePct}%` : b.matchResult ?? "—"}
                  </ToneBadge>
                </TableCell>
                <TableCell><ToneBadge tone={toneFor(b.status)}>{b.status}</ToneBadge></TableCell>
                <TableCell className="text-right">
                  {b.status === "Approved" && (
                    <Button size="sm" variant="outline" onClick={() => markPaid(b.id)}>Mark Paid</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openNew} onOpenChange={(o) => { setOpenNew(o); if (!o) setForm(emptyForm()); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Bill</DialogTitle>
            <DialogDescription>Record a vendor invoice. Link to a PO to run a 3-way match automatically.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <Label className="mb-1.5 block text-xs">Invoice #</Label>
              <Input value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Vendor</Label>
              <Select value={form.vendor} onValueChange={(v) => setForm({ ...form, vendor: v, poNo: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="mb-1.5 block text-xs">Link to PO (optional)</Label>
              <Select value={form.poNo || "__none"} onValueChange={(v) => setForm({ ...form, poNo: v === "__none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="No PO — standalone invoice" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">No PO — standalone invoice</SelectItem>
                  {vendorPOs.map((p) => <SelectItem key={p.id} value={p.poNo}>{p.poNo} · ${p.totalAmount.toLocaleString()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Invoice Date</Label>
              <Input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Amount</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Tax</Label>
              <Input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} />
            </div>
            <div className="col-span-2 rounded-md bg-muted p-2 text-xs text-muted-foreground">
              Total: <span className="font-mono font-semibold text-foreground">${(Number(form.amount) + Number(form.tax)).toLocaleString()}</span>
              {form.poNo && " · 3-way match runs on save."}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>Cancel</Button>
            <Button onClick={submitNew}>Create Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

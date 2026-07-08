import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageShell, MetricStrip, ToneBadge } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useStore, bump } from "@/lib/store";
import { bills, logActivity, type BillStatus } from "@/lib/procurement-data";
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

  function markPaid(id: string) {
    const b = bills.find((x) => x.id === id);
    if (!b) return;
    b.status = "Paid";
    logActivity("Bill Paid", b.billNo);
    bump();
    toast.success(`${b.billNo} marked paid`);
  }

  return (
    <PageShell title="Bills" description="Vendor invoices with 3-way match against POs and receipts.">
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
    </PageShell>
  );
}

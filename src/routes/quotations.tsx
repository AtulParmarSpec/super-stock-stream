import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Award, FileText } from "lucide-react";
import { PageShell, ToneBadge } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import {
  quotations, markResponseWon, createPOFromQuotation, type Quotation, type RfqStatus,
} from "@/lib/procurement-data";
import { toast } from "sonner";

export const Route = createFileRoute("/quotations")({
  head: () => ({ meta: [{ title: "Quotations (RFQ) — AssetFlow" }] }),
  component: QuotationsPage,
});

function toneFor(s: RfqStatus) {
  return s === "Closed" ? "success" : s === "Responses Received" ? "info" : s === "Sent" ? "warning" : "muted";
}

function QuotationsPage() {
  useStore();
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Quotation | null>(null);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return quotations.filter((r) => !t || [r.rfqNo, r.requester, r.department].some((v) => v.toLowerCase().includes(t)));
  }, [q]);

  function win(rfqId: string, responseId: string) {
    markResponseWon(rfqId, responseId);
    toast.success("Vendor response marked Won — siblings moved to Lost");
    setDetail(quotations.find((x) => x.id === rfqId) ?? null);
  }
  function createPO(rfqId: string, responseId: string) {
    const po = createPOFromQuotation(rfqId, responseId);
    if (po) toast.success(`Draft ${po.poNo} created — see Purchase Orders`);
  }

  return (
    <PageShell
      title="Quotations (RFQ)"
      description="Request, record, and compare vendor quotations."
      actions={<Button size="sm" onClick={() => toast.info("Use existing RFQs — new RFQ wizard is a Phase 2+ enhancement")}><Plus className="mr-2 h-4 w-4" /> New RFQ</Button>}
    >
      <div className="flex rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search RFQs..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFQ #</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Vendors</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.rfqNo}</TableCell>
                <TableCell>{r.requester}</TableCell>
                <TableCell>{r.department}</TableCell>
                <TableCell className="text-right">{r.items.length}</TableCell>
                <TableCell className="text-right">{r.responses.length}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.createdOn}</TableCell>
                <TableCell><ToneBadge tone={toneFor(r.status)}>{r.status}</ToneBadge></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setDetail(r)}>Compare</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{detail?.rfqNo} — Vendor Comparison</DialogTitle>
            <DialogDescription>Side-by-side comparison of vendor responses.</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="rounded-md border p-3 text-sm">
                <div className="font-medium">Items</div>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {detail.items.map((i) => (
                    <li key={i.id}>{i.description} × {i.qty}</li>
                  ))}
                </ul>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Delivery</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.responses.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.vendor}</TableCell>
                      <TableCell className="text-right font-mono">${r.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{r.deliveryDays}d</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.validityDate}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.terms}</TableCell>
                      <TableCell><ToneBadge tone={r.status === "Won" ? "success" : r.status === "Lost" ? "destructive" : "muted"}>{r.status}</ToneBadge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {r.status !== "Won" && r.status !== "Lost" && (
                            <Button size="sm" variant="outline" onClick={() => win(detail.id, r.id)}><Award className="mr-1 h-3 w-3" />Mark Won</Button>
                          )}
                          {r.status === "Won" && (
                            <Button size="sm" onClick={() => createPO(detail.id, r.id)}><FileText className="mr-1 h-3 w-3" />Create PO</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

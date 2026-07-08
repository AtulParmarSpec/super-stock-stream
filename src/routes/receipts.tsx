import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageShell, ToneBadge } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { goodsReceipts } from "@/lib/procurement-data";

export const Route = createFileRoute("/receipts")({
  head: () => ({ meta: [{ title: "Goods Receipts — AssetFlow" }] }),
  component: ReceiptsPage,
});

function ReceiptsPage() {
  useStore();
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return goodsReceipts.filter((r) => !t || [r.grnNo, r.poNo, r.vendor].some((v) => v.toLowerCase().includes(t)));
  }, [q]);

  return (
    <PageShell title="Goods Receipts (GRN)" description="Every physical receipt against a PO, including condition and discrepancy flags.">
      <div className="flex rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search GRN / PO / vendor..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((g) => {
          const hasDiscrepancy = g.lines.some((l) => l.condition !== "OK");
          return (
            <div key={g.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{g.grnNo}</span>
                    <ToneBadge tone={hasDiscrepancy ? "warning" : "success"}>{hasDiscrepancy ? "Discrepancy" : "Clean receipt"}</ToneBadge>
                  </div>
                  <div className="text-xs text-muted-foreground">{g.vendor} · PO {g.poNo} · Received {g.receivedOn} by {g.receivedBy}</div>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty Received</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {g.lines.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.description}</TableCell>
                      <TableCell className="text-right">{l.qtyReceived}</TableCell>
                      <TableCell><ToneBadge tone={l.condition === "OK" ? "success" : "destructive"}>{l.condition}</ToneBadge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.remarks || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

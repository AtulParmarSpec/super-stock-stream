import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Download, Plus, Search, Truck } from "lucide-react";
import { transfers, type TransferStatus } from "@/lib/operations-data";
import { PageShell, MetricStrip, ToneBadge } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { NewTransferDialog } from "@/components/dialogs";

export const Route = createFileRoute("/transfers")({
  head: () => ({ meta: [{ title: "Transfers — AssetFlow" }] }),
  component: TransfersPage,
});

const statusOptions: TransferStatus[] = ["Pending Approval", "In Transit", "Completed", "Rejected"];

function statusTone(s: TransferStatus) {
  return s === "In Transit" ? "info" : s === "Completed" ? "success" : s === "Rejected" ? "destructive" : "warning";
}

function TransfersPage() {
  useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TransferStatus | "all">("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => transfers.filter((t) => {
    const matchQ = q.trim() === "" || [t.transferNo, t.assetTag, t.assetName, t.fromLocation, t.toLocation].some((v) => v.toLowerCase().includes(q.toLowerCase()));
    const matchS = status === "all" || t.status === status;
    return matchQ && matchS;
  }), [q, status]);

  const counts = {
    inTransit: transfers.filter((t) => t.status === "In Transit").length,
    pending: transfers.filter((t) => t.status === "Pending Approval").length,
    completed: transfers.filter((t) => t.status === "Completed").length,
    rejected: transfers.filter((t) => t.status === "Rejected").length,
  };

  return (
    <PageShell
      title="Transfers"
      description="Move assets between offices, warehouses, and remote locations with full chain-of-custody."
      actions={
        <>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Transfer</Button>
        </>
      }
    >
      <MetricStrip items={[
        { label: "In Transit", value: counts.inTransit, hint: "En route now" },
        { label: "Pending Approval", value: counts.pending, hint: "Awaiting manager" },
        { label: "Completed (30d)", value: counts.completed, hint: "Delivered & received" },
        { label: "Rejected", value: counts.rejected, hint: "Needs review" },
      ]} />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by transfer no., asset, or location..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as TransferStatus | "all")}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-40">Transfer #</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length ? filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs font-medium">{t.transferNo}</TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{t.assetName}</div>
                  <div className="text-xs font-mono text-muted-foreground">{t.assetTag}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-foreground">{t.fromLocation}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">{t.toLocation}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> {t.carrier}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.requestedOn}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.expectedArrival}</TableCell>
                <TableCell><ToneBadge tone={statusTone(t.status)}>{t.status}</ToneBadge></TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No transfers match your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewTransferDialog open={open} onOpenChange={setOpen} />
    </PageShell>
  );
}

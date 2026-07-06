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
import { Download, Plus, Search, Wrench } from "lucide-react";
import {
  maintenanceTickets, type MaintenanceStatus, type MaintenancePriority,
} from "@/lib/operations-data";
import { PageShell, MetricStrip, ToneBadge } from "@/components/page-shell";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { NewMaintenanceDialog } from "@/components/dialogs";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — AssetFlow" }] }),
  component: MaintenancePage,
});

const statusOptions: MaintenanceStatus[] = ["Scheduled", "In Progress", "Awaiting Parts", "Completed", "Cancelled"];

function statusTone(s: MaintenanceStatus) {
  return s === "In Progress" ? "info" : s === "Completed" ? "success" : s === "Awaiting Parts" ? "warning" : s === "Cancelled" ? "muted" : "primary";
}

function priorityDot(p: MaintenancePriority) {
  const map: Record<MaintenancePriority, string> = { Critical: "bg-destructive", High: "bg-warning", Medium: "bg-info", Low: "bg-muted-foreground" };
  return <span className="inline-flex items-center gap-1.5 text-sm text-foreground"><span className={cn("h-2 w-2 rounded-full", map[p])} />{p}</span>;
}

function MaintenancePage() {
  useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<MaintenanceStatus | "all">("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => maintenanceTickets.filter((t) => {
    const matchQ = q.trim() === "" || [t.ticketNo, t.assetTag, t.assetName, t.summary, t.vendor, t.assignedTech].some((v) => v.toLowerCase().includes(q.toLowerCase()));
    const matchS = status === "all" || t.status === status;
    return matchQ && matchS;
  }), [q, status]);

  const counts = {
    open: maintenanceTickets.filter((t) => t.status === "In Progress" || t.status === "Awaiting Parts").length,
    scheduled: maintenanceTickets.filter((t) => t.status === "Scheduled").length,
    critical: maintenanceTickets.filter((t) => t.priority === "Critical" && t.status !== "Completed" && t.status !== "Cancelled").length,
    completed: maintenanceTickets.filter((t) => t.status === "Completed").length,
  };

  return (
    <PageShell
      title="Maintenance"
      description="Preventive schedules, warranty repairs, and vendor SLA tracking."
      actions={
        <>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Ticket</Button>
        </>
      }
    >
      <MetricStrip items={[
        { label: "Open", value: counts.open, hint: "In progress or awaiting parts" },
        { label: "Scheduled", value: counts.scheduled, hint: "Upcoming service windows" },
        { label: "Critical", value: counts.critical, hint: "P0 / P1 tickets" },
        { label: "Completed (30d)", value: counts.completed, hint: "Closed this month" },
      ]} />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by ticket, asset, vendor, or technician..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as MaintenanceStatus | "all")}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
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
              <TableHead className="w-36">Ticket</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Vendor / Tech</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length ? filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs font-medium">{t.ticketNo}</TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{t.assetName}</div>
                  <div className="text-xs font-mono text-muted-foreground">{t.assetTag}</div>
                </TableCell>
                <TableCell className="max-w-[240px] text-sm text-foreground"><span className="line-clamp-2">{t.summary}</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" /> {t.type}</span>
                </TableCell>
                <TableCell>{priorityDot(t.priority)}</TableCell>
                <TableCell>
                  <div className="text-sm text-foreground">{t.vendor}</div>
                  <div className="text-xs text-muted-foreground">{t.assignedTech}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.openedOn}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.eta}</TableCell>
                <TableCell><ToneBadge tone={statusTone(t.status)}>{t.status}</ToneBadge></TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={9} className="h-32 text-center text-muted-foreground">No tickets match your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewMaintenanceDialog open={open} onOpenChange={setOpen} />
    </PageShell>
  );
}

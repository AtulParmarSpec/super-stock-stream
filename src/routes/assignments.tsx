import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, Search, UserPlus } from "lucide-react";
import { assignments, type AssignmentStatus } from "@/lib/operations-data";
import { PageShell, MetricStrip, ToneBadge } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { NewAssignmentDialog } from "@/components/dialogs";

export const Route = createFileRoute("/assignments")({
  head: () => ({
    meta: [
      { title: "Assignments — AssetFlow" },
      { name: "description", content: "Track active, pending, and returned asset assignments across the organization." },
    ],
  }),
  component: AssignmentsPage,
});

const statusOptions: AssignmentStatus[] = ["Active", "Pending Return", "Returned", "Overdue"];

function statusTone(s: AssignmentStatus) {
  return s === "Active" ? "primary" : s === "Returned" ? "muted" : s === "Overdue" ? "destructive" : "warning";
}

function AssignmentsPage() {
  useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AssignmentStatus | "all">("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => assignments.filter((a) => {
    const matchQ = q.trim() === "" || [a.assetTag, a.assetName, a.employee, a.department].some((v) => v.toLowerCase().includes(q.toLowerCase()));
    const matchS = status === "all" || a.status === status;
    return matchQ && matchS;
  }), [q, status]);

  const counts = {
    active: assignments.filter((a) => a.status === "Active").length,
    overdue: assignments.filter((a) => a.status === "Overdue").length,
    pending: assignments.filter((a) => a.status === "Pending Return").length,
    returned: assignments.filter((a) => a.status === "Returned").length,
  };

  return (
    <PageShell
      title="Assignments"
      description="Track who has what — active issuances, loaner returns, and overdue items."
      actions={
        <>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => setOpen(true)}><UserPlus className="mr-2 h-4 w-4" /> New Assignment</Button>
        </>
      }
    >
      <MetricStrip items={[
        { label: "Active", value: counts.active, hint: "Currently issued" },
        { label: "Overdue", value: counts.overdue, hint: "Past return date" },
        { label: "Pending Return", value: counts.pending, hint: "Awaiting check-in" },
        { label: "Returned (30d)", value: counts.returned, hint: "Closed this month" },
      ]} />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by employee, asset tag, or department..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as AssignmentStatus | "all")}>
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
              <TableHead className="w-36">Assignment</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Due Back</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length ? filtered.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs font-medium">{a.id.toUpperCase()}</TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{a.assetName}</div>
                  <Link to="/assets" className="text-xs font-mono text-muted-foreground hover:text-primary hover:underline">{a.assetTag}</Link>
                </TableCell>
                <TableCell className="text-sm text-foreground">{a.employee}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.department}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.location}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.assignedOn}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.dueBack ?? "—"}</TableCell>
                <TableCell><ToneBadge tone={statusTone(a.status)}>{a.status}</ToneBadge></TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No assignments match your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewAssignmentDialog open={open} onOpenChange={setOpen} />
    </PageShell>
  );
}

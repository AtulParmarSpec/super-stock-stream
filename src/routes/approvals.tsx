import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X, MessageSquare } from "lucide-react";
import { PageShell, MetricStrip, ToneBadge } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { approvals, decideApproval, type ApprovalItem } from "@/lib/procurement-data";
import { toast } from "sonner";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "My Approvals — AssetFlow" }] }),
  component: ApprovalsPage,
});

function slaTone(due: string) {
  const days = Math.round((new Date(due).getTime() - Date.now()) / 86400000);
  if (days < 0) return { tone: "destructive" as const, label: `Overdue by ${-days}d` };
  if (days <= 1) return { tone: "warning" as const, label: `${days}d left` };
  return { tone: "success" as const, label: `${days}d left` };
}

function ApprovalsPage() {
  useStore();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("Pending");
  const [decideOn, setDecideOn] = useState<{ item: ApprovalItem; decision: "Approved" | "Rejected" | "More Info" } | null>(null);
  const [comment, setComment] = useState("");

  const rows = useMemo(() => approvals.filter((a) => {
    if (typeFilter !== "all" && a.entityType !== typeFilter) return false;
    if (statusFilter !== "all" && a.decision !== statusFilter) return false;
    return true;
  }), [typeFilter, statusFilter]);

  const counts = useMemo(() => ({
    pending: approvals.filter((a) => a.decision === "Pending").length,
    request: approvals.filter((a) => a.decision === "Pending" && a.entityType === "Request").length,
    po: approvals.filter((a) => a.decision === "Pending" && a.entityType === "PO").length,
    bill: approvals.filter((a) => a.decision === "Pending" && a.entityType === "Bill").length,
  }), []);

  function submit() {
    if (!decideOn) return;
    if (decideOn.decision === "Rejected" && !comment.trim()) { toast.error("Comment is required on reject"); return; }
    decideApproval(decideOn.item.id, decideOn.decision, comment);
    toast.success(`${decideOn.item.reference} — ${decideOn.decision}`);
    setDecideOn(null); setComment("");
  }

  return (
    <PageShell title="My Approvals" description="Unified approval inbox across Requests, Quotations, POs, and Bills.">
      <MetricStrip items={[
        { label: "Pending total", value: counts.pending },
        { label: "Requests", value: counts.request },
        { label: "Purchase Orders", value: counts.po },
        { label: "Bills", value: counts.bill },
      ]} />

      <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {["Request", "Quotation", "PO", "Bill"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All decisions</SelectItem>
            {["Pending", "Approved", "Rejected", "More Info"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead className="w-[240px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? rows.map((a) => {
              const sla = slaTone(a.slaDueOn);
              return (
                <TableRow key={a.id}>
                  <TableCell><ToneBadge tone="info">{a.entityType}</ToneBadge></TableCell>
                  <TableCell className="font-mono text-xs">{a.reference}</TableCell>
                  <TableCell>{a.requester}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.role}</TableCell>
                  <TableCell className="text-right">{a.value ? `$${a.value.toLocaleString()}` : "—"}</TableCell>
                  <TableCell><ToneBadge tone={sla.tone}>{sla.label}</ToneBadge></TableCell>
                  <TableCell><ToneBadge tone={a.decision === "Approved" ? "success" : a.decision === "Rejected" ? "destructive" : a.decision === "More Info" ? "warning" : "muted"}>{a.decision}</ToneBadge></TableCell>
                  <TableCell className="text-right">
                    {a.decision === "Pending" ? (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => setDecideOn({ item: a, decision: "Approved" })}>
                          <Check className="mr-1 h-3 w-3" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDecideOn({ item: a, decision: "More Info" })}>
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDecideOn({ item: a, decision: "Rejected" })}>
                          <X className="mr-1 h-3 w-3" />Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Decided {a.decidedOn}</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No approvals match your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!decideOn} onOpenChange={(o) => !o && setDecideOn(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{decideOn?.decision} — {decideOn?.item.reference}</DialogTitle></DialogHeader>
          <div className="py-2">
            <Textarea rows={4} placeholder={decideOn?.decision === "Rejected" ? "Reason for rejection (required)" : "Optional comment"} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecideOn(null)}>Cancel</Button>
            <Button onClick={submit}>Confirm {decideOn?.decision}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

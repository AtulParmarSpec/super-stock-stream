import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { PageShell, ToneBadge } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import {
  inventoryRequests, createRequest, type RequestStatus, type Urgency, type RequestType,
} from "@/lib/procurement-data";
import { toast } from "sonner";

export const Route = createFileRoute("/requests")({
  head: () => ({ meta: [{ title: "Inventory Requests — AssetFlow" }] }),
  component: RequestsPage,
});

const CATEGORIES = ["Laptop", "Desktop", "Monitor", "Mobile Device", "Peripheral", "Software License", "Network Equipment", "Server", "Printer", "Furniture"];

function toneFor(status: RequestStatus) {
  switch (status) {
    case "Fulfilled": return "success" as const;
    case "Approved": return "info" as const;
    case "Rejected": return "destructive" as const;
    case "Procurement Triggered": return "warning" as const;
    case "Pending Approval": return "warning" as const;
    default: return "muted" as const;
  }
}

function RequestsPage() {
  useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    requester: "Sarah Chen", department: "Engineering", category: "Laptop",
    type: "New" as RequestType, urgency: "Medium" as Urgency, justification: "",
    approverGroup: "IT" as "IT" | "HR" | "Infra/Admin",
  });

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return inventoryRequests.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!t) return true;
      return [r.reqNo, r.requester, r.category, r.department].some((v) => v.toLowerCase().includes(t));
    });
  }, [q, status]);

  function submit() {
    if (!form.justification.trim()) { toast.error("Justification is required"); return; }
    createRequest(form);
    toast.success("Request submitted for approval");
    setOpen(false);
    setForm({ ...form, justification: "" });
  }

  return (
    <PageShell
      title="Inventory Requests"
      description="Employee self-service — raise, track, and manage inventory requests."
      actions={<Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Request</Button>}
    >
      <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by ref, requester, category..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Pending Approval", "Approved", "Procurement Triggered", "Fulfilled", "Rejected"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref #</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Approver</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Resolved Asset</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.reqNo}</TableCell>
                <TableCell className="font-medium">{r.requester}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell><ToneBadge tone={r.urgency === "High" ? "destructive" : r.urgency === "Medium" ? "warning" : "muted"}>{r.urgency}</ToneBadge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.approverGroup}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.createdOn}</TableCell>
                <TableCell><ToneBadge tone={toneFor(r.status)}>{r.status}</ToneBadge></TableCell>
                <TableCell className="font-mono text-xs">{r.resolvedAssetTag ?? "—"}</TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No requests match.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Inventory Request</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label className="mb-1.5 block text-xs">Requester</Label>
              <Input value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })} /></div>
            <div><Label className="mb-1.5 block text-xs">Department</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div><Label className="mb-1.5 block text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><Label className="mb-1.5 block text-xs">Request Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as RequestType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["New", "Replacement", "Return"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><Label className="mb-1.5 block text-xs">Urgency</Label>
              <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v as Urgency })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Low", "Medium", "High"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><Label className="mb-1.5 block text-xs">Approver Group</Label>
              <Select value={form.approverGroup} onValueChange={(v) => setForm({ ...form, approverGroup: v as "IT" | "HR" | "Infra/Admin" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["IT", "HR", "Infra/Admin"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="col-span-2"><Label className="mb-1.5 block text-xs">Justification</Label>
              <Textarea rows={3} value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} placeholder="Business reason, urgency drivers, specs..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

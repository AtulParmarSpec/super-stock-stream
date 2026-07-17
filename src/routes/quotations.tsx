import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Award, FileText, Trash2 } from "lucide-react";
import { PageShell, ToneBadge } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import {
  quotations, markResponseWon, createPOFromQuotation, createRfq, type Quotation, type RfqStatus,
} from "@/lib/procurement-data";
import { vendors, categoryMasters } from "@/lib/operations-data";
import { toast } from "sonner";

export const Route = createFileRoute("/quotations")({
  head: () => ({ meta: [{ title: "Quotations (RFQ) — AssetFlow" }] }),
  component: QuotationsPage,
});

function toneFor(s: RfqStatus) {
  return s === "Closed" ? "success" : s === "Responses Received" ? "info" : s === "Sent" ? "warning" : "muted";
}

type NewItem = { category: string; description: string; qty: number };

function QuotationsPage() {
  useStore();
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Quotation | null>(null);
  const [openNew, setOpenNew] = useState(false);
  const [form, setForm] = useState<{ requester: string; department: string; vendors: string[]; items: NewItem[] }>({
    requester: "IT Admin", department: "IT", vendors: [], items: [{ category: "Laptop", description: "", qty: 1 }],
  });

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

  function resetForm() {
    setForm({ requester: "IT Admin", department: "IT", vendors: [], items: [{ category: "Laptop", description: "", qty: 1 }] });
  }
  function toggleVendor(v: string) {
    setForm((s) => ({ ...s, vendors: s.vendors.includes(v) ? s.vendors.filter((x) => x !== v) : [...s.vendors, v] }));
  }
  function addItem() { setForm((s) => ({ ...s, items: [...s.items, { category: "Laptop", description: "", qty: 1 }] })); }
  function removeItem(i: number) { setForm((s) => ({ ...s, items: s.items.filter((_, idx) => idx !== i) })); }
  function submitNew() {
    if (!form.requester.trim() || !form.department.trim()) { toast.error("Requester & department required"); return; }
    if (!form.vendors.length) { toast.error("Pick at least one vendor"); return; }
    const items = form.items.filter((i) => i.description.trim() && i.qty > 0);
    if (!items.length) { toast.error("Add at least one item"); return; }
    const r = createRfq({ requester: form.requester, department: form.department, items, vendors: form.vendors });
    toast.success(`${r.rfqNo} created`);
    setOpenNew(false); resetForm();
  }

  return (
    <PageShell
      title="Quotations (RFQ)"
      description="Request, record, and compare vendor quotations."
      actions={<Button size="sm" onClick={() => setOpenNew(true)}><Plus className="mr-2 h-4 w-4" /> New RFQ</Button>}
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

      <Dialog open={openNew} onOpenChange={(o) => { setOpenNew(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>New RFQ</DialogTitle>
            <DialogDescription>Request quotations from vendors for the listed items.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-xs">Requester</Label>
                <Input value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-xs font-medium">Items</Label>
                <Button size="sm" variant="outline" onClick={addItem}><Plus className="mr-1 h-3 w-3" />Add item</Button>
              </div>
              <div className="space-y-2">
                {form.items.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2">
                    <div className="col-span-3">
                      <Select value={it.category} onValueChange={(v) => setForm((s) => ({ ...s, items: s.items.map((x, idx) => idx === i ? { ...x, category: v } : x) }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{categoryMasters.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Input className="col-span-7" placeholder="Description" value={it.description}
                      onChange={(e) => setForm((s) => ({ ...s, items: s.items.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x) }))} />
                    <Input className="col-span-1" type="number" min={1} value={it.qty}
                      onChange={(e) => setForm((s) => ({ ...s, items: s.items.map((x, idx) => idx === i ? { ...x, qty: Number(e.target.value) } : x) }))} />
                    <Button className="col-span-1" size="icon" variant="ghost" onClick={() => removeItem(i)} disabled={form.items.length === 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Invite vendors</Label>
              <div className="flex flex-wrap gap-2 rounded-md border p-3">
                {vendors.map((v) => {
                  const active = form.vendors.includes(v.name);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVendor(v.name)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>Cancel</Button>
            <Button onClick={submitNew}>Create RFQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

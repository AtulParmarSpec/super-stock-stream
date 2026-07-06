import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Star } from "lucide-react";
import { PageShell, MetricStrip, ToneBadge } from "@/components/page-shell";
import {
  vendors, vendorEvaluations, evaluationWeights, computeOverall,
  type VendorEvaluation,
} from "@/lib/operations-data";
import { bump, uid, useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/masters/vendor-evaluations")({
  head: () => ({
    meta: [
      { title: "Vendor Evaluations — AssetFlow" },
      { name: "description", content: "Score vendors on delivery, quality, pricing, support, and compliance." },
    ],
  }),
  component: VendorEvaluationsPage,
});

function scoreTone(n: number) {
  if (n >= 85) return "success";
  if (n >= 70) return "warning";
  return "destructive";
}

function VendorEvaluationsPage() {
  useStore();
  const [open, setOpen] = useState(false);
  const [vendor, setVendor] = useState("");
  const [period, setPeriod] = useState(`Q${Math.floor(new Date().getMonth() / 3) + 1}-${new Date().getFullYear()}`);
  const [delivery, setDelivery] = useState(80);
  const [quality, setQuality] = useState(80);
  const [pricing, setPricing] = useState(80);
  const [support, setSupport] = useState(80);
  const [compliance, setCompliance] = useState(80);
  const [remarks, setRemarks] = useState("");

  const rows = useMemo(() => vendorEvaluations, []);

  function submit() {
    if (!vendor) { toast.error("Vendor is required"); return; }
    const overall = computeOverall({ delivery, quality, pricing, support, compliance });
    vendorEvaluations.unshift({
      id: uid("ve"), vendor, period, delivery, quality, pricing, support, compliance, overall, remarks,
    });
    bump();
    toast.success(`Evaluation added — overall ${overall}`);
    setOpen(false);
    setVendor(""); setRemarks("");
  }

  return (
    <PageShell
      title="Vendor Evaluations"
      description="Score vendors on delivery, quality, pricing, support, and compliance."
      actions={<Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Evaluation</Button>}
    >
      <MetricStrip items={[
        { label: "On-Time Delivery", value: `Weight ${evaluationWeights.delivery}%` },
        { label: "Product Quality", value: `Weight ${evaluationWeights.quality}%` },
        { label: "Pricing Competitiveness", value: `Weight ${evaluationWeights.pricing}%` },
        { label: "Responsiveness / Support", value: `Weight ${evaluationWeights.support}%` },
      ]} />

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <Star className="h-4 w-4 text-warning" />
          <h3 className="text-sm font-semibold text-foreground">Evaluation History</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Vendor</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Delivery</TableHead>
              <TableHead className="text-right">Quality</TableHead>
              <TableHead className="text-right">Pricing</TableHead>
              <TableHead className="text-right">Support</TableHead>
              <TableHead className="text-right">Compliance</TableHead>
              <TableHead>Overall</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((v: VendorEvaluation) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium text-foreground">{v.vendor}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{v.period}</TableCell>
                <TableCell className="text-right text-sm">{v.delivery}</TableCell>
                <TableCell className="text-right text-sm">{v.quality}</TableCell>
                <TableCell className="text-right text-sm">{v.pricing}</TableCell>
                <TableCell className="text-right text-sm">{v.support}</TableCell>
                <TableCell className="text-right text-sm">{v.compliance}</TableCell>
                <TableCell><ToneBadge tone={scoreTone(v.overall)} className={cn("font-mono")}>{v.overall.toFixed(1)}</ToneBadge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{v.remarks || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Vendor Evaluation</DialogTitle>
            <DialogDescription>Score each criterion out of 100. Overall is auto-computed using weighted average.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 sm:col-span-1">
              <Label className="mb-1.5 block text-xs font-medium">Vendor <span className="text-destructive">*</span></Label>
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="mb-1.5 block text-xs font-medium">Period</Label>
              <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Q1-2026" />
            </div>
            {[
              { l: "Delivery", v: delivery, s: setDelivery },
              { l: "Quality", v: quality, s: setQuality },
              { l: "Pricing", v: pricing, s: setPricing },
              { l: "Support", v: support, s: setSupport },
              { l: "Compliance", v: compliance, s: setCompliance },
            ].map((f) => (
              <div key={f.l} className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-xs font-medium">{f.l} (0-100)</Label>
                <Input type="number" min={0} max={100} value={f.v} onChange={(e) => f.s(Math.min(100, Math.max(0, Number(e.target.value))))} />
              </div>
            ))}
            <div className="col-span-2">
              <Label className="mb-1.5 block text-xs font-medium">Overall (auto)</Label>
              <div className="rounded-md border border-border bg-muted px-3 py-2 font-mono text-sm">
                {computeOverall({ delivery, quality, pricing, support, compliance }).toFixed(1)}
              </div>
            </div>
            <div className="col-span-2">
              <Label className="mb-1.5 block text-xs font-medium">Remarks</Label>
              <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Save evaluation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

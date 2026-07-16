import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageShell, MetricStrip, ToneBadge } from "@/components/page-shell";
import { vendors, vendorEvaluations } from "@/lib/operations-data";
import { assets } from "@/lib/inventory-data";
import {
  quotations, purchaseOrders, bills,
} from "@/lib/procurement-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/masters/vendors/$id")({
  head: () => ({ meta: [{ title: "Vendor Details — AssetFlow" }] }),
  loader: ({ params }) => {
    const v = vendors.find((x) => x.id === params.id);
    if (!v) throw notFound();
    return { id: params.id };
  },
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Vendor not found. <Link to="/masters/vendors" className="text-primary underline">Back to vendors</Link>
    </div>
  ),
  component: VendorDetail,
});

function VendorDetail() {
  useStore();
  const { id } = Route.useLoaderData();
  const vendor = vendors.find((v) => v.id === id)!;

  const rfqs = quotations.filter((q) => q.responses.some((r) => r.vendor === vendor.name));
  const pos = purchaseOrders.filter((p) => p.vendor === vendor.name);
  const vBills = bills.filter((b) => b.vendor === vendor.name);
  const evals = vendorEvaluations.filter((e) => e.vendor === vendor.name);
  const vAssets = assets.filter((a) => a.vendor === vendor.name);

  const avgScore = evals.length ? evals.slice(0, 3).reduce((s, e) => s + e.overall, 0) / Math.min(3, evals.length) : 0;
  const preferred = avgScore >= 80;

  const totalSpend = pos.reduce((s, p) => s + p.totalAmount, 0);

  return (
    <PageShell
      title={vendor.name}
      description={`${vendor.code} · ${vendor.category} · ${vendor.contact}`}
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link to="/masters/vendors"><ArrowLeft className="mr-2 h-4 w-4" /> All vendors</Link>
        </Button>
      }
    >
      <MetricStrip items={[
        { label: "SLA Tier", value: vendor.slaTier },
        { label: "Active Contracts", value: vendor.activeContracts },
        { label: "Total PO Spend", value: `$${(totalSpend / 1000).toFixed(1)}k` },
        { label: preferred ? "Preferred vendor" : "Avg score (last 3)", value: avgScore ? avgScore.toFixed(1) : "—" },
      ]} />

      <Tabs defaultValue="pos">
        <TabsList>
          <TabsTrigger value="pos">Purchase Orders ({pos.length})</TabsTrigger>
          <TabsTrigger value="rfqs">Quotations ({rfqs.length})</TabsTrigger>
          <TabsTrigger value="bills">Bills ({vBills.length})</TabsTrigger>
          <TabsTrigger value="evals">Evaluations ({evals.length})</TabsTrigger>
          <TabsTrigger value="assets">Assets ({vAssets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow>
              <TableHead>PO #</TableHead><TableHead>Created</TableHead>
              <TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {pos.length ? pos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.poNo}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.createdOn}</TableCell>
                  <TableCell><ToneBadge tone="info">{p.status}</ToneBadge></TableCell>
                  <TableCell className="text-right font-mono">${p.totalAmount.toLocaleString()}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="h-20 text-center text-muted-foreground">No purchase orders.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="rfqs" className="rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow>
              <TableHead>RFQ #</TableHead><TableHead>Created</TableHead>
              <TableHead>Response</TableHead><TableHead className="text-right">Quoted</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rfqs.length ? rfqs.map((q) => {
                const r = q.responses.find((x) => x.vendor === vendor.name)!;
                return (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs">{q.rfqNo}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{q.createdOn}</TableCell>
                    <TableCell>
                      <ToneBadge tone={r.status === "Won" ? "success" : r.status === "Lost" ? "muted" : "info"}>{r.status}</ToneBadge>
                    </TableCell>
                    <TableCell className="text-right font-mono">${r.amount.toLocaleString()}</TableCell>
                  </TableRow>
                );
              }) : <TableRow><TableCell colSpan={4} className="h-20 text-center text-muted-foreground">No quotations.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="bills" className="rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Bill #</TableHead><TableHead>Invoice</TableHead>
              <TableHead>Due</TableHead><TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {vBills.length ? vBills.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.billNo}</TableCell>
                  <TableCell className="font-mono text-xs">{b.invoiceNo}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.dueDate}</TableCell>
                  <TableCell><ToneBadge tone={b.status === "Paid" ? "success" : b.status === "Overdue" ? "destructive" : "warning"}>{b.status}</ToneBadge></TableCell>
                  <TableCell className="text-right font-mono">${(b.amount + b.tax).toLocaleString()}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">No bills.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="evals" className="rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Period</TableHead><TableHead className="text-right">Delivery</TableHead>
              <TableHead className="text-right">Quality</TableHead><TableHead className="text-right">Pricing</TableHead>
              <TableHead className="text-right">Support</TableHead><TableHead className="text-right">Overall</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {evals.length ? evals.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.period}</TableCell>
                  <TableCell className="text-right">{e.delivery}</TableCell>
                  <TableCell className="text-right">{e.quality}</TableCell>
                  <TableCell className="text-right">{e.pricing}</TableCell>
                  <TableCell className="text-right">{e.support}</TableCell>
                  <TableCell className="text-right font-semibold">{e.overall}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6} className="h-20 text-center text-muted-foreground">No evaluations yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="assets" className="rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tag</TableHead><TableHead>Name</TableHead>
              <TableHead>Status</TableHead><TableHead className="text-right">Cost</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {vAssets.length ? vAssets.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">
                    <Link to="/assets/$id" params={{ id: a.id }} className="hover:text-primary hover:underline">{a.assetTag}</Link>
                  </TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell><ToneBadge tone="muted">{a.status}</ToneBadge></TableCell>
                  <TableCell className="text-right font-mono">${a.cost.toLocaleString()}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="h-20 text-center text-muted-foreground">No assets sourced from this vendor.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

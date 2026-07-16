import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { PageShell, MetricStrip } from "@/components/page-shell";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { assets, inventoryGroups, type AssetStatus } from "@/lib/inventory-data";
import { maintenanceTickets, vendors } from "@/lib/operations-data";
import { purchaseOrders, bills } from "@/lib/procurement-data";
import { useStore } from "@/lib/store";


export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — AssetFlow" },
      { name: "description", content: "Inventory reports — category, group, status, value, maintenance, and vendor exposure." },
    ],
  }),
  component: ReportsPage,
});

const palette = ["#3b6fa0", "#5a8a5c", "#a0522d", "#9b72cf", "#2d8a9e", "#c4654a", "#718096", "#d4842a", "#4b5563", "#0e7490", "#7c3aed"];

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m ? <>{children}</> : null;
}

function ReportsPage() {
  useStore();
  const [report, setReport] = useState("overview");

  const byCategory = useMemo(() => {
    const map = new Map<string, { name: string; count: number; value: number }>();
    for (const a of assets) {
      const cur = map.get(a.category) ?? { name: a.category, count: 0, value: 0 };
      cur.count++;
      cur.value += a.cost;
      map.set(a.category, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, []);

  const byGroup = useMemo(() => {
    return inventoryGroups.map((g) => ({
      name: g,
      count: assets.filter((a) => a.inventoryGroup === g).length,
      value: assets.filter((a) => a.inventoryGroup === g).reduce((s, a) => s + a.cost, 0),
    })).filter((r) => r.count > 0);
  }, []);

  const byStatus = useMemo(() => {
    const statuses: AssetStatus[] = ["Available", "Assigned", "In Maintenance", "Retired", "Scrapped", "Lost", "In Transfer"];
    return statuses.map((s, i) => ({ name: s, value: assets.filter((a) => a.status === s).length, fill: palette[i % palette.length] }))
      .filter((s) => s.value > 0);
  }, []);

  const byVendor = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of assets) map.set(a.vendor, (map.get(a.vendor) ?? 0) + a.cost);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, []);

  const maintenanceByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of maintenanceTickets) map.set(t.status, (map.get(t.status) ?? 0) + 1);
    return Array.from(map.entries()).map(([name, count], i) => ({ name, count, fill: palette[i % palette.length] }));
  }, []);

  const agingBuckets = ["0-15d", "16-30d", "31-60d", "61-90d", "90+d"];
  function bucket(days: number) {
    if (days <= 15) return agingBuckets[0];
    if (days <= 30) return agingBuckets[1];
    if (days <= 60) return agingBuckets[2];
    if (days <= 90) return agingBuckets[3];
    return agingBuckets[4];
  }

  const poAging = useMemo(() => {
    const open = purchaseOrders.filter((p) => p.status !== "Fully Received" && p.status !== "Closed" && p.status !== "Cancelled");
    const map = new Map(agingBuckets.map((b) => [b, { name: b, count: 0, value: 0 }]));
    for (const p of open) {
      const age = Math.max(0, Math.floor((Date.now() - new Date(p.createdOn).getTime()) / 86400000));
      const b = map.get(bucket(age))!;
      b.count++; b.value += p.totalAmount;
    }
    return Array.from(map.values());
  }, []);

  const billAging = useMemo(() => {
    const open = bills.filter((b) => b.status !== "Paid");
    const map = new Map(agingBuckets.map((b) => [b, { name: b, count: 0, value: 0 }]));
    for (const b of open) {
      const overdue = Math.max(0, Math.floor((Date.now() - new Date(b.dueDate).getTime()) / 86400000));
      const bucketRow = map.get(bucket(overdue))!;
      bucketRow.count++; bucketRow.value += b.amount + b.tax;
    }
    return Array.from(map.values());
  }, []);

  const totalValue = assets.reduce((s, a) => s + a.cost, 0);
  const activeAssets = assets.filter((a) => a.status !== "Scrapped" && a.status !== "Retired" && a.status !== "Lost").length;


  function exportReport() {
    const map: Record<string, { name: string; [k: string]: number | string }[]> = {
      overview: byCategory,
      group: byGroup,
      status: byStatus.map((s) => ({ name: s.name, count: s.value })),
      vendor: byVendor.map((v) => ({ name: v.name, spend: v.value })),
      maintenance: maintenanceByStatus.map((m) => ({ name: m.name, count: m.count })),
      poAging: poAging.map((b) => ({ name: b.name, count: b.count, value: b.value })),
      billAging: billAging.map((b) => ({ name: b.name, count: b.count, value: b.value })),
    };

    const rows = map[report] ?? [];
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String((r as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `report-${report}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageShell
      title="Reports"
      description="Executive-ready summaries of your inventory, spend, and operations."
      actions={
        <>
          <Select value={report} onValueChange={setReport}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Inventory Overview</SelectItem>
              <SelectItem value="group">By Inventory Group</SelectItem>
              <SelectItem value="status">By Status</SelectItem>
              <SelectItem value="vendor">Vendor Spend</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="poAging">PO Aging</SelectItem>
              <SelectItem value="billAging">Bill Aging</SelectItem>
            </SelectContent>

          </Select>
          <Button variant="outline" size="sm" onClick={exportReport}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </>
      }
    >
      <MetricStrip items={[
        { label: "Total Assets", value: assets.length },
        { label: "Active Assets", value: activeAssets, hint: "Excludes retired / scrapped / lost" },
        { label: "Total Value", value: `$${(totalValue / 1000).toFixed(1)}k` },
        { label: "Open Tickets", value: maintenanceTickets.filter((t) => t.status !== "Completed" && t.status !== "Cancelled").length },
      ]} />

      {report === "overview" && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><CardTitle className="text-base font-semibold">Assets & Value by Category</CardTitle></div>
            <CardDescription>Count and acquisition cost per asset category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ClientOnly>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#3b6fa0" name="Count" isAnimationActive={false} />
                    <Bar yAxisId="right" dataKey="value" fill="#5a8a5c" name="Value ($)" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      )}

      {report === "group" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Assets by Inventory Group</CardTitle>
            <CardDescription>Distribution across IT, HR, Admin, Infra, and other groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ClientOnly>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byGroup}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b6fa0" name="Assets" isAnimationActive={false} />
                    <Bar dataKey="value" fill="#c4654a" name="Value ($)" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      )}

      {report === "status" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
            <CardDescription>Current lifecycle status of every asset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ClientOnly>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={110} isAnimationActive={false} label>
                      {byStatus.map((s, i) => <Cell key={i} fill={s.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      )}

      {report === "vendor" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Vendor Spend — Top {byVendor.length}</CardTitle>
            <CardDescription>Cumulative acquisition value grouped by vendor · {vendors.length} vendors on record</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ClientOnly>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byVendor} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={140} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b6fa0" name="Spend ($)" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      )}

      {report === "maintenance" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Maintenance Tickets by Status</CardTitle>
            <CardDescription>Operational load across service pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ClientOnly>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceByStatus}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" isAnimationActive={false}>
                      {maintenanceByStatus.map((m, i) => <Cell key={i} fill={m.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}

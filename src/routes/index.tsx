import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import {
  assets,
  categoryDistribution,
  recentActivity,
  computeStatusCounts,
  type AssetStatus,
} from "@/lib/inventory-data";
import { employees } from "@/lib/operations-data";
import { useStore } from "@/lib/store";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AssetFlow" },
      { name: "description", content: "Enterprise IT inventory dashboard with asset metrics, status breakdown, and recent activity." },
      { property: "og:title", content: "Dashboard — AssetFlow" },
      { property: "og:description", content: "Enterprise IT inventory dashboard with asset metrics and activity." },
    ],
  }),
  component: DashboardPage,
});

type DrillKey = "total" | "assigned" | "available" | "maintenance" | "retired" | "scrapped" | null;

function DashboardPage() {
  useStore();
  const [drill, setDrill] = useState<DrillKey>(null);
  const [assignee, setAssignee] = useState<string>("all");

  const statusCounts = useMemo(() => computeStatusCounts(), []);
  const totalAssets = assets.length;

  const metrics: {
    key: Exclude<DrillKey, null>;
    label: string;
    value: number;
    change: string;
    trend: "up" | "down" | "neutral";
  }[] = [
    { key: "total", label: "Total Assets", value: totalAssets, change: "+12 this quarter", trend: "up" },
    { key: "assigned", label: "Assigned", value: statusCounts.Assigned, change: "+3 this month", trend: "up" },
    { key: "available", label: "Available", value: statusCounts.Available, change: "-2 this week", trend: "down" },
    { key: "maintenance", label: "In Maintenance", value: statusCounts["In Maintenance"], change: "No change", trend: "neutral" },
    { key: "retired", label: "Retired", value: statusCounts.Retired, change: "Awaiting disposal", trend: "neutral" },
    { key: "scrapped", label: "Scrapped", value: statusCounts.Scrapped, change: "Written off", trend: "neutral" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of your IT asset inventory across all locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button size="sm" asChild>
            <Link to="/assets">View Assets</Link>
          </Button>
        </div>
      </div>

      <div className="page-content space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.key}
              metric={metric}
              active={drill === metric.key}
              onClick={() => setDrill(drill === metric.key ? null : metric.key)}
            />
          ))}
        </section>

        {drill === "total" && <TotalAssetsDrill onClose={() => setDrill(null)} />}
        {drill === "assigned" && (
          <AssignedDrill
            assignee={assignee}
            setAssignee={setAssignee}
            onClose={() => {
              setDrill(null);
              setAssignee("all");
            }}
          />
        )}
        {drill && drill !== "total" && drill !== "assigned" && (
          <SimpleStatusDrill drill={drill} onClose={() => setDrill(null)} />
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Asset Status Breakdown</CardTitle>
              <CardDescription>Current status distribution across the fleet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="h-64 w-full min-w-0">
                  <ClientOnly>
                    <PieChart width={280} height={256}>
                      <Pie
                        data={categoryDistribution}
                        cx={140}
                        cy={128}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ClientOnly>
                </div>
                <div className="space-y-3">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <StatusDot status={status} />
                        <span className="text-sm font-medium text-foreground">{status}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {count} ({Math.round((count / totalAssets) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <CardDescription>Latest actions across the inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {activity.asset}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} · {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Asset Value by Category</CardTitle>
              <CardDescription>Total acquisition cost grouped by asset category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full min-w-0">
                <ClientOnly>
                  <BarChart
                    width={1000}
                    height={288}
                    data={categoryDistribution}
                    margin={{ top: 16, right: 16, bottom: 8, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#3b6fa0" isAnimationActive={false} />
                  </BarChart>
                </ClientOnly>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function TotalAssetsDrill({ onClose }: { onClose: () => void }) {
  const rows = useMemo(() => {
    const map = new Map<string, Record<AssetStatus, number> & { total: number }>();
    for (const a of assets) {
      const cur = map.get(a.category) ?? {
        Available: 0, Assigned: 0, "In Maintenance": 0, Retired: 0, Scrapped: 0, Lost: 0, "In Transfer": 0, total: 0,
      };
      cur[a.status]++;
      cur.total++;
      map.set(a.category, cur);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Total Assets — by Category</CardTitle>
          <CardDescription>Breakdown of assets across categories and status</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Maintenance</TableHead>
                <TableHead className="text-right">Retired</TableHead>
                <TableHead className="text-right">Scrapped</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(([cat, counts]) => (
                <TableRow key={cat}>
                  <TableCell className="font-medium">{cat}</TableCell>
                  <TableCell className="text-right">{counts.total}</TableCell>
                  <TableCell className="text-right">{counts.Assigned}</TableCell>
                  <TableCell className="text-right">{counts.Available}</TableCell>
                  <TableCell className="text-right">{counts["In Maintenance"]}</TableCell>
                  <TableCell className="text-right">{counts.Retired}</TableCell>
                  <TableCell className="text-right">{counts.Scrapped}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignedDrill({
  assignee,
  setAssignee,
  onClose,
}: {
  assignee: string;
  setAssignee: (v: string) => void;
  onClose: () => void;
}) {
  const assigneeOptions = useMemo(() => {
    const names = new Set<string>();
    for (const a of assets) {
      if (a.status === "Assigned" && a.assignedTo) names.add(a.assignedTo);
    }
    for (const e of employees) names.add(e.name);
    return Array.from(names).sort();
  }, []);

  const filtered = useMemo(() => {
    const list = assets.filter((a) => a.status === "Assigned" && a.assignedTo);
    if (assignee === "all") return list;
    return list.filter((a) => a.assignedTo === assignee);
  }, [assignee]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold">Assigned Inventory</CardTitle>
          <CardDescription>
            Filter by employee or consultant to see all assets currently assigned
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {assigneeOptions.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Serial No.</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-20 text-center text-sm text-muted-foreground">
                    No assets assigned to this person.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">
                      <Link to="/assets/$id" params={{ id: a.id }} className="text-primary hover:underline">
                        {a.assetTag}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>{a.assignedTo}</TableCell>
                    <TableCell>{a.department ?? "—"}</TableCell>
                    <TableCell>{a.location}</TableCell>
                    <TableCell className="font-mono text-xs">{a.serialNumber}</TableCell>
                    <TableCell className="text-right">${a.cost.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function SimpleStatusDrill({ drill, onClose }: { drill: Exclude<DrillKey, null | "total" | "assigned">; onClose: () => void }) {
  const statusMap: Record<typeof drill, AssetStatus> = {
    available: "Available",
    maintenance: "In Maintenance",
    retired: "Retired",
    scrapped: "Scrapped",
  };
  const status = statusMap[drill];
  const rows = assets.filter((a) => a.status === status);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{status} Assets</CardTitle>
          <CardDescription>{rows.length} asset{rows.length === 1 ? "" : "s"}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-sm text-muted-foreground">
                    No assets in this status.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">
                      <Link to="/assets/$id" params={{ id: a.id }} className="text-primary hover:underline">
                        {a.assetTag}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>{a.location}</TableCell>
                    <TableCell>{a.vendor}</TableCell>
                    <TableCell className="text-right">${a.cost.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  metric,
  active,
  onClick,
}: {
  metric: { label: string; value: number; change: string; trend: "up" | "down" | "neutral" };
  active: boolean;
  onClick: () => void;
}) {
  const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    metric.trend === "up"
      ? "text-success"
      : metric.trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "metric-card text-left transition-colors hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40",
        active && "border-primary ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {metric.value}
          </p>
        </div>
        <div className={cn("rounded-md p-2 bg-muted", trendColor)}>
          <TrendIcon className="h-4 w-4" />
        </div>
      </div>
      <p className={cn("mt-2 text-xs font-medium", trendColor)}>{metric.change}</p>
    </button>
  );
}

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "Available"
      ? "bg-success"
      : status === "Assigned"
      ? "bg-primary"
      : status === "In Maintenance"
      ? "bg-warning"
      : status === "In Transfer"
      ? "bg-info"
      : status === "Lost"
      ? "bg-destructive"
      : "bg-muted-foreground";

  return <span className={cn("h-2.5 w-2.5 rounded-full", color)} />;
}

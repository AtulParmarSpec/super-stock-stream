import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  dashboardMetrics,
  categoryDistribution,
  recentActivity,
  statusCounts,
  totalAssets,
  totalAssetValue,
} from "@/lib/inventory-data";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
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

function DashboardPage() {
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
          {dashboardMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

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
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryDistribution}
                      margin={{ top: 16, right: 16, bottom: 8, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--color-primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ClientOnly>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: (typeof dashboardMetrics)[0] }) {
  const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    metric.trend === "up"
      ? "text-success"
      : metric.trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <div className="metric-card">
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
    </div>
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

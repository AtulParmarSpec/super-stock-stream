import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="page-content space-y-4">{children}</div>
    </div>
  );
}

export function MetricStrip({
  items,
}: {
  items: { label: string; value: string | number; hint?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((m) => (
        <div
          key={m.label}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {m.label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{m.value}</p>
          {m.hint && (
            <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}

type Tone = "success" | "primary" | "warning" | "info" | "destructive" | "muted";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

export function ToneBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("status-badge", toneClasses[tone], className)}
    >
      {children}
    </Badge>
  );
}

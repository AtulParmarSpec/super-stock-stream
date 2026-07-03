import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { brandModels } from "@/lib/operations-data";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/masters/brands")({
  head: () => ({ meta: [{ title: "Brands & Models — AssetFlow" }] }),
  component: BrandsMaster,
});

function BrandsMaster() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => brandModels.filter((b) =>
      q.trim() === "" || [b.brand, b.model, b.category].some((v) => v.toLowerCase().includes(q.toLowerCase()))
    ),
    [q]
  );
  return (
    <PageShell
      title="Brands & Models"
      description="Approved product catalog — brands, models, and SKU variants."
      actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Model</Button>}
    >
      <div className="flex rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search brands or models..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Brand</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">SKUs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium text-foreground">{b.brand}</TableCell>
                <TableCell className="text-sm text-foreground">{b.model}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{b.category}</TableCell>
                <TableCell className="text-right text-sm text-foreground">{b.skuCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}

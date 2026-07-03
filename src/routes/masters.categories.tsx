import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { categoryMasters } from "@/lib/operations-data";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/masters/categories")({
  head: () => ({ meta: [{ title: "Categories — AssetFlow" }] }),
  component: CategoriesMaster,
});

function CategoriesMaster() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => categoryMasters.filter((c) =>
      q.trim() === "" || [c.code, c.name, c.parent].some((v) => v.toLowerCase().includes(q.toLowerCase()))
    ),
    [q]
  );
  return (
    <PageShell
      title="Categories"
      description="Asset taxonomy driving classification, depreciation, and reporting."
      actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Category</Button>}
    >
      <div className="flex rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search categories..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-28">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="text-right">Assets</TableHead>
              <TableHead className="text-right">Depreciation (yrs)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs font-medium">{c.code}</TableCell>
                <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.parent}</TableCell>
                <TableCell className="text-right text-sm text-foreground">{c.assetsCount.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">{c.depreciationYears}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}

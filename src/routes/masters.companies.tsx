import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { companies } from "@/lib/operations-data";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/masters/companies")({
  head: () => ({ meta: [{ title: "Companies — AssetFlow" }] }),
  component: CompaniesMaster,
});

function CompaniesMaster() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => companies.filter((c) =>
      q.trim() === "" || [c.code, c.name, c.region, c.taxId].some((v) => v.toLowerCase().includes(q.toLowerCase()))
    ),
    [q]
  );

  return (
    <PageShell
      title="Companies"
      description="Legal entities and regional operating companies."
      actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Company</Button>}
    >
      <div className="flex rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search companies..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-32">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Tax ID</TableHead>
              <TableHead className="text-right">Entities</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs font-medium">{c.code}</TableCell>
                <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.region}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{c.taxId}</TableCell>
                <TableCell className="text-right text-sm text-foreground">{c.entities}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}

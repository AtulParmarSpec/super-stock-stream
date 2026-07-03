import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { departments } from "@/lib/operations-data";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/masters/departments")({
  head: () => ({ meta: [{ title: "Departments — AssetFlow" }] }),
  component: DepartmentsMaster,
});

function DepartmentsMaster() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => departments.filter((d) =>
      q.trim() === "" || [d.code, d.name, d.manager, d.costCenter].some((v) => v.toLowerCase().includes(q.toLowerCase()))
    ),
    [q]
  );
  return (
    <PageShell
      title="Departments"
      description="Organizational units with cost centers and managers."
      actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Department</Button>}
    >
      <div className="flex rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search departments..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead className="text-right">Headcount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs font-medium">{d.code}</TableCell>
                <TableCell className="font-medium text-foreground">{d.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.manager}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{d.costCenter}</TableCell>
                <TableCell className="text-right text-sm text-foreground">{d.headcount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { employees } from "@/lib/operations-data";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/masters/employees")({
  head: () => ({ meta: [{ title: "Employees — AssetFlow" }] }),
  component: EmployeesMaster,
});

function EmployeesMaster() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => employees.filter((e) =>
      q.trim() === "" || [e.empNo, e.name, e.email, e.department, e.office, e.title].some((v) => v.toLowerCase().includes(q.toLowerCase()))
    ),
    [q]
  );
  return (
    <PageShell
      title="Employees"
      description="Directory of employees who can be assigned assets."
      actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" /> Import from HRIS</Button>}
    >
      <div className="flex rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email, or department..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-28">Emp #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Office</TableHead>
              <TableHead className="text-right">Assets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs font-medium">{e.empNo}</TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.email}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.department}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.office}</TableCell>
                <TableCell className="text-right text-sm text-foreground">{e.assetsAssigned}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}

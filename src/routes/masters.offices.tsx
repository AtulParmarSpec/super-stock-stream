import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { offices } from "@/lib/operations-data";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/masters/offices")({
  head: () => ({ meta: [{ title: "Offices — AssetFlow" }] }),
  component: OfficesMaster,
});

function OfficesMaster() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => offices.filter((o) =>
      q.trim() === "" || [o.code, o.name, o.city, o.country, o.company].some((v) => v.toLowerCase().includes(q.toLowerCase()))
    ),
    [q]
  );
  return (
    <PageShell
      title="Offices"
      description="Physical locations and remote hubs mapped to companies."
      actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Office</Button>}
    >
      <div className="flex rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search offices..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-28">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Headcount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs font-medium">{o.code}</TableCell>
                <TableCell className="font-medium text-foreground">{o.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{o.company}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{o.city}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{o.country}</TableCell>
                <TableCell className="text-right text-sm text-foreground">{o.headcount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}

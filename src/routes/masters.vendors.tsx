import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { vendors } from "@/lib/operations-data";
import { PageShell, ToneBadge } from "@/components/page-shell";

export const Route = createFileRoute("/masters/vendors")({
  head: () => ({ meta: [{ title: "Vendors — AssetFlow" }] }),
  component: VendorsMaster,
});

function VendorsMaster() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => vendors.filter((v) =>
      q.trim() === "" || [v.code, v.name, v.category, v.contact].some((val) => val.toLowerCase().includes(q.toLowerCase()))
    ),
    [q]
  );
  return (
    <PageShell
      title="Vendors"
      description="Suppliers, resellers, and MSPs with active SLAs."
      actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Vendor</Button>}
    >
      <div className="flex rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search vendors..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>SLA Tier</TableHead>
              <TableHead className="text-right">Contracts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono text-xs font-medium">{v.code}</TableCell>
                <TableCell className="font-medium text-foreground">{v.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{v.category}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{v.contact}</TableCell>
                <TableCell>
                  <ToneBadge tone={v.slaTier === "Platinum" ? "primary" : v.slaTier === "Gold" ? "warning" : "muted"}>
                    {v.slaTier}
                  </ToneBadge>
                </TableCell>
                <TableCell className="text-right text-sm text-foreground">{v.activeContracts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}

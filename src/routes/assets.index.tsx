import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft, ChevronRight, Download, Filter, Layers, MoreHorizontal, Plus, Search, SlidersHorizontal, Upload,
} from "lucide-react";
import {
  assets, inventoryGroups, type AssetStatus, type AssetCategory,
} from "@/lib/inventory-data";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { AssetFormDialog } from "@/components/dialogs";
import { BulkImportDialog } from "@/components/bulk-import-dialog";


export const Route = createFileRoute("/assets/")({
  head: () => ({
    meta: [
      { title: "Assets — AssetFlow" },
      { name: "description", content: "Browse and manage all IT assets in the enterprise inventory." },
      { property: "og:title", content: "Assets — AssetFlow" },
      { property: "og:description", content: "Browse and manage all IT assets in the enterprise inventory." },
    ],
  }),
  component: AssetsPage,
});

const PAGE_SIZE = 10;

const statusOptions: AssetStatus[] = [
  "Available", "Assigned", "In Maintenance", "Retired", "Scrapped", "Lost", "In Transfer",
];
const categoryOptions: AssetCategory[] = [
  "Laptop", "Desktop", "Monitor", "Server", "Network Equipment", "Mobile Device", "Printer", "Peripheral", "Software License",
];

function AssetsPage() {
  useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "all">("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);


  const filtered = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        search.trim() === "" ||
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        asset.assignedTo?.toLowerCase().includes(search.toLowerCase()) ||
        asset.department?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
      const matchesGroup = groupFilter === "all" || asset.inventoryGroup === groupFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesGroup;
    });
  }, [search, statusFilter, categoryFilter, groupFilter]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageAssets = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Assets</h1>
          <p className="text-sm text-muted-foreground">Manage all IT assets across locations, departments, and groups</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCsv(filtered)}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Bulk Import
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Asset
          </Button>

        </div>
      </div>

      <div className="page-content space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, tag, serial, employee, or department..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-row">
            <Select value={groupFilter} onValueChange={(v) => { setGroupFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-40"><Layers className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Group" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {inventoryGroups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as AssetStatus | "all"); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-40"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v as AssetCategory | "all"); setPage(1); }}>
              <SelectTrigger className="w-full lg:w-44"><SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-32">Asset Tag</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Warranty</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageAssets.length > 0 ? pageAssets.map((asset) => (
                  <TableRow key={asset.id} className="group">
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      <Link to="/assets/$id" params={{ id: asset.id }} className="hover:text-primary hover:underline">
                        {asset.assetTag}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{asset.name}</div>
                      <div className="text-xs text-muted-foreground">{asset.brand} {asset.model}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{asset.category}</TableCell>
                    <TableCell><Badge variant="outline" className="status-badge bg-muted text-foreground">{asset.inventoryGroup}</Badge></TableCell>
                    <TableCell><StatusBadge status={asset.status} /></TableCell>
                    <TableCell className="text-sm text-foreground">{asset.assignedTo || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{asset.location}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{asset.warrantyExpiry || "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/assets/$id" params={{ id: asset.id }}>View & manage</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      No assets match your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} assets
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {pageCount || 1}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AssetFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <BulkImportDialog open={importOpen} onOpenChange={setImportOpen} />

    </div>
  );
}

function exportCsv(rows: { assetTag: string; name: string; category: string; inventoryGroup: string; status: string; assignedTo: string | null; location: string; warrantyExpiry: string; cost: number }[]) {
  const header = ["Tag", "Name", "Category", "Group", "Status", "Assigned To", "Location", "Warranty", "Cost"];
  const body = rows.map((r) => [r.assetTag, r.name, r.category, r.inventoryGroup, r.status, r.assignedTo ?? "", r.location, r.warrantyExpiry, r.cost].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [header.join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "assets.csv"; a.click();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }: { status: AssetStatus }) {
  const variants: Record<AssetStatus, string> = {
    Available: "bg-success/10 text-success hover:bg-success/20",
    Assigned: "bg-primary/10 text-primary hover:bg-primary/20",
    "In Maintenance": "bg-warning/10 text-warning hover:bg-warning/20",
    Retired: "bg-muted text-muted-foreground hover:bg-muted/80",
    Scrapped: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    Lost: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    "In Transfer": "bg-info/10 text-info hover:bg-info/20",
  };
  return <Badge variant="outline" className={cn("status-badge", variants[status])}>{status}</Badge>;
}

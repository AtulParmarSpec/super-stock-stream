import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Briefcase, Building2, Calendar, CalendarClock, CreditCard, Edit, FileText,
  MapPin, MoreHorizontal, Package, QrCode, RotateCcw, Trash2, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { assets, getAssetById, type AssetStatus } from "@/lib/inventory-data";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { AssetActionDialog, AssetFormDialog, type AssetAction } from "@/components/dialogs";
import { QrLabelDialog } from "@/components/qr-label-dialog";


export const Route = createFileRoute("/assets/$id")({
  head: () => ({
    meta: [
      { title: "Asset Details — AssetFlow" },
      { name: "description", content: "Detailed view of an enterprise IT asset." },
    ],
  }),
  loader: async ({ params }) => {
    if (!getAssetById(params.id)) throw notFound();
    return { id: params.id };
  },
  notFoundComponent: AssetNotFound,
  component: AssetDetailPage,
});

function AssetNotFound() {
  const { id } = useParams({ from: "/assets/$id" });
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-muted p-4"><Package className="h-8 w-8 text-muted-foreground" /></div>
      <h1 className="mt-6 text-2xl font-semibold text-foreground">Asset not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">No asset with ID <code className="font-mono text-xs">{id}</code>.</p>
      <Button className="mt-6" asChild><Link to="/assets">Back to assets</Link></Button>
    </div>
  );
}

function AssetDetailPage() {
  useStore();
  const { id } = Route.useLoaderData();
  const asset = assets.find((a) => a.id === id);
  const [action, setAction] = useState<AssetAction | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);


  if (!asset) return <AssetNotFound />;

  const detailGroups = [
    { title: "Identification", icon: Package, items: [
      { label: "Asset Tag", value: asset.assetTag },
      { label: "Serial Number", value: asset.serialNumber },
      { label: "Category", value: asset.category },
      { label: "Brand / Model", value: `${asset.brand} ${asset.model}` },
      { label: "Inventory Group", value: asset.inventoryGroup },
    ] },
    { title: "Assignment", icon: Briefcase, items: [
      { label: "Status", value: asset.status },
      { label: "Assigned To", value: asset.assignedTo || "—" },
      { label: "Department", value: asset.department || "—" },
      { label: "Location", value: asset.location },
    ] },
    { title: "Purchase & Warranty", icon: CalendarClock, items: [
      { label: "Purchase Date", value: asset.purchaseDate },
      { label: "Warranty Expiry", value: asset.warrantyExpiry || "—" },
      { label: "Vendor", value: asset.vendor },
      { label: "Cost", value: `$${asset.cost.toLocaleString()}` },
      { label: "PO Number", value: asset.poNumber || "—" },
      { label: "Invoice No", value: asset.invoiceNo || "—" },
    ] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to="/assets"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{asset.name}</h1>
              <StatusBadge status={asset.status} />
            </div>
            <p className="text-sm text-muted-foreground">{asset.assetTag} · {asset.brand} {asset.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
            <QrCode className="mr-2 h-4 w-4" /> Print QR Tag
          </Button>

          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setAction("assign")}>Assign to employee</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAction("transfer")}>Transfer to location</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAction("maintenance")}>Request maintenance</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAction("return")}>Return to inventory</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAction("retire")}>Mark as retired</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAction("scrap")} className="text-destructive">Mark as scrapped</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="page-content grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {detailGroups.map((group) => (
            <Card key={group.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <group.icon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base font-semibold">{group.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <div className="text-sm font-medium text-foreground">
                        {item.label === "Status" ? <StatusBadge status={item.value as AssetStatus} /> : item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent><p className="whitespace-pre-line text-sm text-foreground">{asset.notes || "—"}</p></CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              <CardDescription>Common lifecycle actions for this asset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" size="sm" onClick={() => setAction("assign")}>
                <Briefcase className="mr-2 h-4 w-4" /> Assign to Employee
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setAction("transfer")}>
                <Building2 className="mr-2 h-4 w-4" /> Transfer Location
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setAction("maintenance")}>
                <Wrench className="mr-2 h-4 w-4" /> Request Maintenance
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setAction("return")}>
                <RotateCcw className="mr-2 h-4 w-4" /> Return to Inventory
              </Button>
              <Separator className="my-2" />
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" size="sm" onClick={() => setAction("retire")}>
                <Calendar className="mr-2 h-4 w-4" /> Mark as Retired
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" size="sm" onClick={() => setAction("scrap")}>
                <Trash2 className="mr-2 h-4 w-4" /> Mark as Scrapped
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Financials</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CreditCard className="h-4 w-4" />Acquisition Cost</div>
                <span className="font-semibold text-foreground">${asset.cost.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarClock className="h-4 w-4" />Warranty Remaining</div>
                <WarrantyRemaining expiry={asset.warrantyExpiry} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />Current Location</div>
                <span className="text-sm font-medium text-foreground">{asset.location}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AssetActionDialog asset={asset} action={action} open={!!action} onOpenChange={(o) => !o && setAction(null)} />
      <AssetFormDialog open={editOpen} onOpenChange={setEditOpen} editing={asset} />
      <QrLabelDialog asset={asset} open={qrOpen} onOpenChange={setQrOpen} />
    </div>
  );
}


function StatusBadge({ status }: { status: AssetStatus }) {
  const variants: Record<AssetStatus, string> = {
    Available: "bg-success/10 text-success",
    Assigned: "bg-primary/10 text-primary",
    "In Maintenance": "bg-warning/10 text-warning",
    Retired: "bg-muted text-muted-foreground",
    Scrapped: "bg-destructive/10 text-destructive",
    Lost: "bg-destructive/10 text-destructive",
    "In Transfer": "bg-info/10 text-info",
  };
  return <Badge variant="outline" className={cn("status-badge", variants[status])}>{status}</Badge>;
}

function WarrantyRemaining({ expiry }: { expiry: string }) {
  if (!expiry) return <span className="text-sm text-muted-foreground">—</span>;
  const expiryDate = new Date(expiry);
  const today = new Date();
  const days = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  let label = `${days} days`;
  if (days < 0) label = "Expired";
  else if (days === 0) label = "Expires today";
  else if (days <= 30) label = `${days} days left`;
  else if (days <= 90) label = `${Math.floor(days / 30)} months left`;
  else label = `${Math.floor(days / 365)} years left`;
  const color = days < 0 ? "text-destructive" : days <= 90 ? "text-warning" : "text-success";
  return <span className={cn("font-semibold", color)}>{label}</span>;
}

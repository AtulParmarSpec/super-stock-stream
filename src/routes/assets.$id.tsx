import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CalendarClock,
  CreditCard,
  Edit,
  FileText,
  MapPin,
  MoreHorizontal,
  Package,
  Printer,
  RotateCcw,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { assets, type AssetStatus } from "@/lib/inventory-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assets/$id")({
  head: () => ({
    meta: [
      { title: "Asset Details — AssetFlow" },
      { name: "description", content: "Detailed view of an enterprise IT asset." },
      { property: "og:title", content: "Asset Details — AssetFlow" },
      { property: "og:description", content: "Detailed view of an enterprise IT asset." },
    ],
  }),
  loader: async ({ params }) => {
    const asset = assets.find((a) => a.id === params.id);
    if (!asset) throw notFound();
    return { asset };
  },
  notFoundComponent: AssetNotFound,
  component: AssetDetailPage,
});

function AssetNotFound() {
  const { id } = useParams({ from: "/assets/$id" });
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-muted p-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-foreground">Asset not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn't find an asset with ID <code className="font-mono text-xs">{id}</code>. It may have been removed or the URL might be incorrect.
      </p>
      <Button className="mt-6" asChild>
        <Link to="/assets">Back to assets</Link>
      </Button>
    </div>
  );
}

function AssetDetailPage() {
  const { asset } = Route.useLoaderData();

  const detailGroups = [
    {
      title: "Identification",
      icon: Package,
      items: [
        { label: "Asset Tag", value: asset.assetTag },
        { label: "Serial Number", value: asset.serialNumber },
        { label: "Category", value: asset.category },
        { label: "Brand / Model", value: `${asset.brand} ${asset.model}` },
      ],
    },
    {
      title: "Assignment",
      icon: Briefcase,
      items: [
        { label: "Status", value: asset.status },
        { label: "Assigned To", value: asset.assignedTo || "—" },
        { label: "Department", value: asset.department || "—" },
        { label: "Location", value: asset.location },
      ],
    },
    {
      title: "Purchase & Warranty",
      icon: CalendarClock,
      items: [
        { label: "Purchase Date", value: asset.purchaseDate },
        { label: "Warranty Expiry", value: asset.warrantyExpiry },
        { label: "Vendor", value: asset.vendor },
        { label: "Cost", value: `$${asset.cost.toLocaleString()}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to="/assets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {asset.name}
              </h1>
              <StatusBadge status={asset.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {asset.assetTag} · {asset.brand} {asset.model}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Assign to employee</DropdownMenuItem>
              <DropdownMenuItem>Transfer to location</DropdownMenuItem>
              <DropdownMenuItem>Request maintenance</DropdownMenuItem>
              <DropdownMenuItem>Mark as retired</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Report lost</DropdownMenuItem>
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
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {item.label === "Status" ? (
                          <StatusBadge status={item.value as AssetStatus} />
                        ) : (
                          item.value
                        )}
                      </p>
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
            <CardContent>
              <p className="text-sm text-foreground">{asset.notes}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              <CardDescription>Common lifecycle actions for this asset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" size="sm">
                <Briefcase className="mr-2 h-4 w-4" />
                Assign to Employee
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Building2 className="mr-2 h-4 w-4" />
                Transfer Location
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Wrench className="mr-2 h-4 w-4" />
                Request Maintenance
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Return to Inventory
              </Button>
              <Separator className="my-2" />
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                size="sm"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Mark as Retired
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Financials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  Acquisition Cost
                </div>
                <span className="font-semibold text-foreground">
                  ${asset.cost.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  Warranty Remaining
                </div>
                <WarrantyRemaining expiry={asset.warrantyExpiry} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Current Location
                </div>
                <span className="text-sm font-medium text-foreground">{asset.location}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AssetStatus }) {
  const variants: Record<AssetStatus, string> = {
    Available: "bg-success/10 text-success hover:bg-success/20",
    Assigned: "bg-primary/10 text-primary hover:bg-primary/20",
    "In Maintenance": "bg-warning/10 text-warning hover:bg-warning/20",
    Retired: "bg-muted text-muted-foreground hover:bg-muted/80",
    Lost: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    "In Transfer": "bg-info/10 text-info hover:bg-info/20",
  };

  return (
    <Badge variant="outline" className={cn("status-badge", variants[status])}>
      {status}
    </Badge>
  );
}

function WarrantyRemaining({ expiry }: { expiry: string }) {
  const expiryDate = new Date(expiry);
  const today = new Date();
  const days = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let label = `${days} days`;
  if (days < 0) label = "Expired";
  else if (days === 0) label = "Expires today";
  else if (days <= 30) label = `${days} days left`;
  else if (days <= 90) label = `${Math.floor(days / 30)} months left`;
  else label = `${Math.floor(days / 365)} years left`;

  const color =
    days < 0 ? "text-destructive" : days <= 90 ? "text-warning" : "text-success";

  return <span className={cn("font-semibold", color)}>{label}</span>;
}

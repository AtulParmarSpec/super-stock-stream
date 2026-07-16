import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { MasterPage } from "@/components/master-page";
import { vendors, type Vendor } from "@/lib/operations-data";

export const Route = createFileRoute("/masters/vendors")({
  head: () => ({ meta: [{ title: "Vendors — AssetFlow" }] }),
  component: () => (
    <MasterPage<Vendor>
      title="Vendors"
      description="Suppliers, resellers, and MSPs with active SLAs."
      entityLabel="Vendor"
      data={vendors}
      idPrefix="vnd"
      searchKeys={["code", "name", "category", "contact"]}
      extraActions={
        <Button variant="outline" size="sm" asChild>
          <Link to="/masters/vendor-evaluations"><Star className="mr-2 h-4 w-4" /> Vendor Evaluations</Link>
        </Button>
      }
      columns={[
        { key: "code", header: "Code", className: "font-mono text-xs font-medium" },
        {
          key: "name", header: "Name", className: "font-medium",
          render: (row) => (
            <Link to="/masters/vendors/$id" params={{ id: row.id }} className="text-foreground hover:text-primary hover:underline">
              {row.name}
            </Link>
          ),
        },
        { key: "category", header: "Category" },
        { key: "contact", header: "Contact", className: "text-xs text-muted-foreground" },
        { key: "slaTier", header: "SLA Tier" },
        { key: "activeContracts", header: "Contracts", align: "right" },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "category", label: "Category", type: "select", options: ["Hardware", "Software", "Networking", "Server / Storage", "Peripherals", "Security", "Services"] },
        { key: "contact", label: "Contact" },
        { key: "slaTier", label: "SLA Tier", type: "select", options: ["Platinum", "Gold", "Silver"] },
        { key: "activeContracts", label: "Active Contracts", type: "number" },
      ]}
      makeDefaults={() => ({ slaTier: "Silver", activeContracts: 0 })}
    />
  ),
});


import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
import { brandModels, type BrandModel } from "@/lib/operations-data";

export const Route = createFileRoute("/masters/brands")({
  head: () => ({ meta: [{ title: "Brands & Models — AssetFlow" }] }),
  component: () => (
    <MasterPage<BrandModel>
      title="Brands & Models"
      description="Approved product catalog — brands, models, and SKU variants."
      entityLabel="Model"
      data={brandModels}
      idPrefix="bm"
      searchKeys={["brand", "model", "category"]}
      columns={[
        { key: "brand", header: "Brand", className: "font-medium text-foreground" },
        { key: "model", header: "Model" },
        { key: "category", header: "Category" },
        { key: "skuCount", header: "SKUs", align: "right" },
      ]}
      fields={[
        { key: "brand", label: "Brand", required: true },
        { key: "model", label: "Model", required: true },
        { key: "category", label: "Category", type: "select", options: ["Laptop", "Desktop", "Monitor", "Server", "Network Equipment", "Mobile Device", "Printer", "Peripheral", "Software License"] },
        { key: "skuCount", label: "SKU Count", type: "number" },
      ]}
      makeDefaults={() => ({ skuCount: 1 })}
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
import { categoryMasters, type CategoryMaster } from "@/lib/operations-data";

export const Route = createFileRoute("/masters/categories")({
  head: () => ({ meta: [{ title: "Categories — AssetFlow" }] }),
  component: () => (
    <MasterPage<CategoryMaster>
      title="Categories"
      description="Asset taxonomy driving classification, depreciation, and reporting."
      entityLabel="Category"
      data={categoryMasters}
      idPrefix="cat"
      searchKeys={["code", "name", "parent"]}
      columns={[
        { key: "code", header: "Code", className: "font-mono text-xs font-medium" },
        { key: "name", header: "Name", className: "font-medium text-foreground" },
        { key: "parent", header: "Parent" },
        { key: "assetsCount", header: "Assets", align: "right" },
        { key: "depreciationYears", header: "Depreciation (yrs)", align: "right" },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "parent", label: "Parent", type: "select", options: ["Hardware", "Software", "Services"] },
        { key: "assetsCount", label: "Assets Count", type: "number" },
        { key: "depreciationYears", label: "Depreciation Years", type: "number" },
      ]}
      makeDefaults={() => ({ parent: "Hardware", assetsCount: 0, depreciationYears: 3 })}
    />
  ),
});

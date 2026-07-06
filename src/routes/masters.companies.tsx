import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
import { companies, type Company } from "@/lib/operations-data";

export const Route = createFileRoute("/masters/companies")({
  head: () => ({ meta: [{ title: "Companies — AssetFlow" }] }),
  component: () => (
    <MasterPage<Company>
      title="Companies"
      description="Legal entities and regional operating companies."
      entityLabel="Company"
      data={companies}
      idPrefix="cmp"
      searchKeys={["code", "name", "region", "taxId"]}
      columns={[
        { key: "code", header: "Code", className: "font-mono text-xs font-medium" },
        { key: "name", header: "Name", className: "font-medium text-foreground" },
        { key: "region", header: "Region" },
        { key: "taxId", header: "Tax ID", className: "font-mono text-xs text-muted-foreground" },
        { key: "entities", header: "Entities", align: "right" },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "region", label: "Region", type: "select", options: ["North America", "EMEA", "APAC", "LATAM"], required: true },
        { key: "taxId", label: "Tax ID" },
        { key: "entities", label: "Entities", type: "number" },
      ]}
      makeDefaults={() => ({ entities: 1, region: "North America" })}
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
import { offices, companies, type Office } from "@/lib/operations-data";

export const Route = createFileRoute("/masters/offices")({
  head: () => ({ meta: [{ title: "Offices — AssetFlow" }] }),
  component: () => (
    <MasterPage<Office>
      title="Offices"
      description="Physical locations and remote hubs mapped to companies."
      entityLabel="Office"
      data={offices}
      idPrefix="off"
      searchKeys={["code", "name", "city", "country", "company"]}
      columns={[
        { key: "code", header: "Code", className: "font-mono text-xs font-medium" },
        { key: "name", header: "Name", className: "font-medium text-foreground" },
        { key: "company", header: "Company", className: "font-mono text-xs text-muted-foreground" },
        { key: "city", header: "City" },
        { key: "country", header: "Country" },
        { key: "headcount", header: "Headcount", align: "right" },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "company", label: "Company", type: "select", options: companies.map((c) => c.code), required: true },
        { key: "city", label: "City" },
        { key: "country", label: "Country" },
        { key: "headcount", label: "Headcount", type: "number" },
      ]}
      makeDefaults={() => ({ headcount: 0 })}
    />
  ),
});

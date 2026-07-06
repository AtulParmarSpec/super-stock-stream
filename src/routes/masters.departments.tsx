import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
import { departments, type Department } from "@/lib/operations-data";

export const Route = createFileRoute("/masters/departments")({
  head: () => ({ meta: [{ title: "Departments — AssetFlow" }] }),
  component: () => (
    <MasterPage<Department>
      title="Departments"
      description="Organizational units with cost centers and managers."
      entityLabel="Department"
      data={departments}
      idPrefix="dep"
      searchKeys={["code", "name", "manager", "costCenter"]}
      columns={[
        { key: "code", header: "Code", className: "font-mono text-xs font-medium" },
        { key: "name", header: "Name", className: "font-medium text-foreground" },
        { key: "manager", header: "Manager" },
        { key: "costCenter", header: "Cost Center", className: "font-mono text-xs text-muted-foreground" },
        { key: "headcount", header: "Headcount", align: "right" },
      ]}
      fields={[
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "manager", label: "Manager" },
        { key: "costCenter", label: "Cost Center" },
        { key: "headcount", label: "Headcount", type: "number" },
      ]}
      makeDefaults={() => ({ headcount: 0 })}
    />
  ),
});

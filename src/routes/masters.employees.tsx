import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
import { employees, departments, offices, type Employee } from "@/lib/operations-data";

export const Route = createFileRoute("/masters/employees")({
  head: () => ({ meta: [{ title: "Employees — AssetFlow" }] }),
  component: () => (
    <MasterPage<Employee>
      title="Employees"
      description="Directory of employees who can be assigned assets."
      entityLabel="Employee"
      data={employees}
      idPrefix="emp"
      searchKeys={["empNo", "name", "email", "department", "office", "title"]}
      columns={[
        { key: "empNo", header: "Emp #", className: "font-mono text-xs font-medium" },
        { key: "name", header: "Name", className: "font-medium text-foreground" },
        { key: "email", header: "Email", className: "text-xs text-muted-foreground" },
        { key: "title", header: "Title" },
        { key: "department", header: "Department" },
        { key: "office", header: "Office" },
        { key: "assetsAssigned", header: "Assets", align: "right" },
      ]}
      fields={[
        { key: "empNo", label: "Employee #", required: true },
        { key: "name", label: "Full Name", required: true },
        { key: "email", label: "Email", required: true },
        { key: "title", label: "Title" },
        { key: "department", label: "Department", type: "select", options: departments.map((d) => d.name) },
        { key: "office", label: "Office", type: "select", options: offices.map((o) => o.name) },
        { key: "assetsAssigned", label: "Assets Assigned", type: "number" },
      ]}
      makeDefaults={() => ({ assetsAssigned: 0 })}
    />
  ),
});

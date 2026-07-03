import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2, MapPin, Users, Box, Layers, Cpu, ArrowRight,
} from "lucide-react";
import {
  companies, offices, departments, employees, vendors, categoryMasters, brandModels,
} from "@/lib/operations-data";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/masters/")({
  head: () => ({
    meta: [
      { title: "Masters — AssetFlow" },
      { name: "description", content: "Reference data for companies, offices, departments, employees, vendors, and catalogs." },
      { property: "og:title", content: "Masters — AssetFlow" },
      { property: "og:description", content: "Reference data for companies, offices, departments, employees, vendors, and catalogs." },
    ],
  }),
  component: MastersIndex,
});

const tiles = [
  { title: "Companies", url: "/masters/companies", icon: Building2, count: companies.length, hint: "Legal entities" },
  { title: "Offices", url: "/masters/offices", icon: MapPin, count: offices.length, hint: "Physical locations" },
  { title: "Departments", url: "/masters/departments", icon: Users, count: departments.length, hint: "Org units & cost centers" },
  { title: "Employees", url: "/masters/employees", icon: Users, count: employees.length, hint: "Sample directory" },
  { title: "Vendors", url: "/masters/vendors", icon: Box, count: vendors.length, hint: "Suppliers & SLAs" },
  { title: "Categories", url: "/masters/categories", icon: Layers, count: categoryMasters.length, hint: "Asset taxonomy" },
  { title: "Brands & Models", url: "/masters/brands", icon: Cpu, count: brandModels.length, hint: "Product catalog" },
];

function MastersIndex() {
  return (
    <PageShell
      title="Masters"
      description="Reference data that powers every module — companies, locations, org structure, and catalogs."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.title}
            to={t.url}
            className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <t.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{t.title}</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="text-xs text-muted-foreground">{t.hint}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{t.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Box,
  Briefcase,
  Building2,
  CheckSquare,
  ClipboardList,
  Cpu,
  FileSignature,
  FileText,
  Inbox,
  Layers,
  LayoutDashboard,
  MapPin,
  Package,
  PackageCheck,
  Receipt,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Users,
  Wrench,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Assets", url: "/assets", icon: Package },
  { title: "Assignments", url: "/assignments", icon: Briefcase },
  { title: "Transfers", url: "/transfers", icon: Layers },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Reports", url: "/reports", icon: FileText },
];

const procurementNav: NavItem[] = [
  { title: "Requests", url: "/requests", icon: Inbox },
  { title: "My Approvals", url: "/approvals", icon: CheckSquare },
  { title: "Quotations", url: "/quotations", icon: FileSignature },
  { title: "Purchase Orders", url: "/purchase-orders", icon: ShoppingCart },
  { title: "Goods Receipts", url: "/receipts", icon: PackageCheck },
  { title: "Bills", url: "/bills", icon: Receipt },
];

const masterNav: NavItem[] = [
  { title: "Companies", url: "/masters/companies", icon: Building2 },
  { title: "Offices", url: "/masters/offices", icon: MapPin },
  { title: "Departments", url: "/masters/departments", icon: Users },
  { title: "Employees", url: "/masters/employees", icon: Users },
  { title: "Vendors", url: "/masters/vendors", icon: Box },
  { title: "Vendor Evaluations", url: "/masters/vendor-evaluations", icon: Star },
  { title: "Categories", url: "/masters/categories", icon: Layers },
  { title: "Brands & Models", url: "/masters/brands", icon: Cpu },
];

const adminNav: NavItem[] = [
  { title: "Users & Roles", url: "/admin/users", icon: Shield },
  { title: "Settings", url: "/admin/settings", icon: Settings },
  { title: "Audit Log", url: "/admin/audit", icon: ClipboardList },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];


export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight text-sidebar-foreground">
                AssetFlow
              </span>
              <span className="text-xs text-muted-foreground">Enterprise</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Inventory</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3",
                        isActive(item.url) && "font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Procurement</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {procurementNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3",
                        isActive(item.url) && "font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Masters</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {masterNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3",
                        isActive(item.url) && "font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3",
                        isActive(item.url) && "font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="rounded-md bg-sidebar-accent p-2 text-xs text-sidebar-accent-foreground">
            <p className="font-medium">v1.0</p>
            <p className="mt-0.5 text-muted-foreground">Enterprise IT Inventory</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

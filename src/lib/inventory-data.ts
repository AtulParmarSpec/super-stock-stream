export type AssetStatus =
  | "Available"
  | "Assigned"
  | "In Maintenance"
  | "Retired"
  | "Lost"
  | "In Transfer";

export type AssetCategory =
  | "Laptop"
  | "Desktop"
  | "Monitor"
  | "Server"
  | "Network Equipment"
  | "Mobile Device"
  | "Printer"
  | "Peripheral"
  | "Software License";

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  status: AssetStatus;
  assignedTo: string | null;
  department: string | null;
  location: string;
  purchaseDate: string;
  warrantyExpiry: string;
  vendor: string;
  cost: number;
  notes: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export const assets: Asset[] = [
  {
    id: "asset-1",
    assetTag: "IT-2024-001",
    name: "MacBook Pro 16",
    category: "Laptop",
    brand: "Apple",
    model: "MacBook Pro 16 M3 Max",
    serialNumber: "C02XYZ123456",
    status: "Assigned",
    assignedTo: "Sarah Chen",
    department: "Engineering",
    location: "San Francisco HQ",
    purchaseDate: "2024-01-15",
    warrantyExpiry: "2027-01-15",
    vendor: "Apple Inc.",
    cost: 3499,
    notes: "Senior engineer workstation",
  },
  {
    id: "asset-2",
    assetTag: "IT-2024-002",
    name: "Dell Ultrasharp 27",
    category: "Monitor",
    brand: "Dell",
    model: "U2723QE",
    serialNumber: "SN-DELL-78901",
    status: "Assigned",
    assignedTo: "Sarah Chen",
    department: "Engineering",
    location: "San Francisco HQ",
    purchaseDate: "2024-01-15",
    warrantyExpiry: "2027-01-15",
    vendor: "Dell Technologies",
    cost: 679,
    notes: "Paired with MacBook Pro docking station",
  },
  {
    id: "asset-3",
    assetTag: "IT-2024-003",
    name: "ThinkPad X1 Carbon",
    category: "Laptop",
    brand: "Lenovo",
    model: "ThinkPad X1 Carbon Gen 12",
    serialNumber: "PF-123456-7890",
    status: "Available",
    assignedTo: null,
    department: null,
    location: "New York Office",
    purchaseDate: "2024-02-20",
    warrantyExpiry: "2027-02-20",
    vendor: "Lenovo",
    cost: 2199,
    notes: "Spare laptop for new hires",
  },
  {
    id: "asset-4",
    assetTag: "IT-2024-004",
    name: "iPhone 15 Pro",
    category: "Mobile Device",
    brand: "Apple",
    model: "iPhone 15 Pro 256GB",
    serialNumber: "IMEI-123456789012",
    status: "Assigned",
    assignedTo: "Michael Torres",
    department: "Sales",
    location: "Chicago Office",
    purchaseDate: "2024-03-01",
    warrantyExpiry: "2026-03-01",
    vendor: "Apple Inc.",
    cost: 1199,
    notes: "Sales team mobile device",
  },
  {
    id: "asset-5",
    assetTag: "IT-2024-005",
    name: "HPE ProLiant DL380",
    category: "Server",
    brand: "HPE",
    model: "ProLiant DL380 Gen11",
    serialNumber: "HPE-SN-987654",
    status: "In Maintenance",
    assignedTo: null,
    department: "Infrastructure",
    location: "San Francisco Data Center",
    purchaseDate: "2023-08-10",
    warrantyExpiry: "2026-08-10",
    vendor: "HPE Enterprise",
    cost: 18500,
    notes: "Primary application server",
  },
  {
    id: "asset-6",
    assetTag: "IT-2024-006",
    name: "Cisco Catalyst 9300",
    category: "Network Equipment",
    brand: "Cisco",
    model: "Catalyst 9300-48P",
    serialNumber: "CISCO-SN-123456",
    status: "Assigned",
    assignedTo: "Network Team",
    department: "Infrastructure",
    location: "San Francisco Data Center",
    purchaseDate: "2023-11-05",
    warrantyExpiry: "2028-11-05",
    vendor: "Cisco Systems",
    cost: 12500,
    notes: "Core switch stack",
  },
  {
    id: "asset-7",
    assetTag: "IT-2024-007",
    name: "Microsoft 365 E5",
    category: "Software License",
    brand: "Microsoft",
    model: "Microsoft 365 E5",
    serialNumber: "MS-E5-123456789",
    status: "Assigned",
    assignedTo: "Emma Wilson",
    department: "Product",
    location: "Remote",
    purchaseDate: "2024-01-01",
    warrantyExpiry: "2025-01-01",
    vendor: "Microsoft",
    cost: 420,
    notes: "Annual subscription, renews automatically",
  },
  {
    id: "asset-8",
    assetTag: "IT-2024-008",
    name: "Dell Precision 7770",
    category: "Laptop",
    brand: "Dell",
    model: "Precision 7770 Mobile Workstation",
    serialNumber: "DELL-PREC-7770-1",
    status: "In Maintenance",
    assignedTo: "David Park",
    department: "Design",
    location: "Austin Office",
    purchaseDate: "2023-05-12",
    warrantyExpiry: "2026-05-12",
    vendor: "Dell Technologies",
    cost: 4299,
    notes: "Screen replacement in progress",
  },
  {
    id: "asset-9",
    assetTag: "IT-2024-009",
    name: "iPad Pro 12.9",
    category: "Mobile Device",
    brand: "Apple",
    model: "iPad Pro 12.9 M2",
    serialNumber: "ABC-IPAD-123456",
    status: "Available",
    assignedTo: null,
    department: null,
    location: "San Francisco HQ",
    purchaseDate: "2024-04-10",
    warrantyExpiry: "2026-04-10",
    vendor: "Apple Inc.",
    cost: 1299,
    notes: "Conference room tablet",
  },
  {
    id: "asset-10",
    assetTag: "IT-2024-010",
    name: "Logitech MX Keys Combo",
    category: "Peripheral",
    brand: "Logitech",
    model: "MX Keys S + MX Master 3S",
    serialNumber: "LOGI-MX-789012",
    status: "Assigned",
    assignedTo: "Rachel Kim",
    department: "Engineering",
    location: "San Francisco HQ",
    purchaseDate: "2024-02-01",
    warrantyExpiry: "2026-02-01",
    vendor: "Logitech",
    cost: 229,
    notes: "Keyboard and mouse combo",
  },
  {
    id: "asset-11",
    assetTag: "IT-2024-011",
    name: "HP LaserJet Pro",
    category: "Printer",
    brand: "HP",
    model: "LaserJet Pro MFP 4101",
    serialNumber: "HP-LJ-123456",
    status: "Available",
    assignedTo: null,
    department: null,
    location: "New York Office",
    purchaseDate: "2023-09-20",
    warrantyExpiry: "2026-09-20",
    vendor: "HP Enterprise",
    cost: 549,
    notes: "Floor printer",
  },
  {
    id: "asset-12",
    assetTag: "IT-2024-012",
    name: "Surface Laptop Studio 2",
    category: "Laptop",
    brand: "Microsoft",
    model: "Surface Laptop Studio 2",
    serialNumber: "MS-SLS-654321",
    status: "In Transfer",
    assignedTo: "Pending",
    department: "Sales",
    location: "Chicago Office",
    purchaseDate: "2024-03-15",
    warrantyExpiry: "2027-03-15",
    vendor: "Microsoft",
    cost: 2499,
    notes: "Being transferred to new sales hire",
  },
  {
    id: "asset-13",
    assetTag: "IT-2024-013",
    name: "Samsung Odyssey G9",
    category: "Monitor",
    brand: "Samsung",
    model: "Odyssey G9 49\"",
    serialNumber: "SAM-ODYSSEY-987",
    status: "Assigned",
    assignedTo: "Alex Morgan",
    department: "Engineering",
    location: "San Francisco HQ",
    purchaseDate: "2023-12-01",
    warrantyExpiry: "2026-12-01",
    vendor: "Samsung Business",
    cost: 1499,
    notes: "Ultrawide development monitor",
  },
  {
    id: "asset-14",
    assetTag: "IT-2024-014",
    name: "Jira Software Premium",
    category: "Software License",
    brand: "Atlassian",
    model: "Jira Premium 100 users",
    serialNumber: "ATL-JIRA-2024-01",
    status: "Assigned",
    assignedTo: "Engineering Team",
    department: "Engineering",
    location: "All Offices",
    purchaseDate: "2024-01-01",
    warrantyExpiry: "2025-01-01",
    vendor: "Atlassian",
    cost: 12000,
    notes: "Annual enterprise license",
  },
  {
    id: "asset-15",
    assetTag: "IT-2024-015",
    name: "Dell PowerEdge R760",
    category: "Server",
    brand: "Dell",
    model: "PowerEdge R760",
    serialNumber: "DELL-R760-456789",
    status: "Available",
    assignedTo: null,
    department: "Infrastructure",
    location: "San Francisco Data Center",
    purchaseDate: "2024-05-01",
    warrantyExpiry: "2027-05-01",
    vendor: "Dell Technologies",
    cost: 22000,
    notes: "Backup server, ready for provisioning",
  },
  {
    id: "asset-16",
    assetTag: "IT-2024-016",
    name: "Lenovo ThinkVision P40w",
    category: "Monitor",
    brand: "Lenovo",
    model: "ThinkVision P40w-20 40\"",
    serialNumber: "LEN-P40W-123789",
    status: "Retired",
    assignedTo: null,
    department: null,
    location: "Storage",
    purchaseDate: "2021-06-15",
    warrantyExpiry: "2024-06-15",
    vendor: "Lenovo",
    cost: 1699,
    notes: "Out of warranty, awaiting disposal",
  },
  {
    id: "asset-17",
    assetTag: "IT-2024-017",
    name: "Cisco Meraki MX75",
    category: "Network Equipment",
    brand: "Cisco",
    model: "Meraki MX75 Security Appliance",
    serialNumber: "MERAKI-MX75-456",
    status: "Assigned",
    assignedTo: "Security Team",
    department: "Infrastructure",
    location: "Austin Office",
    purchaseDate: "2024-02-28",
    warrantyExpiry: "2029-02-28",
    vendor: "Cisco Meraki",
    cost: 8500,
    notes: "Branch office firewall",
  },
  {
    id: "asset-18",
    assetTag: "IT-2024-018",
    name: "Google Pixel 8 Pro",
    category: "Mobile Device",
    brand: "Google",
    model: "Pixel 8 Pro 128GB",
    serialNumber: "PIXEL-8PRO-789",
    status: "Lost",
    assignedTo: "James Wilson",
    department: "Sales",
    location: "Unknown",
    purchaseDate: "2023-11-15",
    warrantyExpiry: "2025-11-15",
    vendor: "Google",
    cost: 999,
    notes: "Reported lost during travel, insurance claim pending",
  },
  {
    id: "asset-19",
    assetTag: "IT-2024-019",
    name: "Adobe Creative Cloud",
    category: "Software License",
    brand: "Adobe",
    model: "Creative Cloud All Apps",
    serialNumber: "ADOBE-CC-2024-05",
    status: "Assigned",
    assignedTo: "Design Team",
    department: "Design",
    location: "Austin Office",
    purchaseDate: "2024-05-01",
    warrantyExpiry: "2025-05-01",
    vendor: "Adobe",
    cost: 600,
    notes: "Monthly subscription for design team",
  },
  {
    id: "asset-20",
    assetTag: "IT-2024-020",
    name: "YubiKey 5 NFC",
    category: "Peripheral",
    brand: "Yubico",
    model: "YubiKey 5 NFC",
    serialNumber: "YUBI-5NFC-123456",
    status: "Assigned",
    assignedTo: "All Employees",
    department: "Security",
    location: "All Offices",
    purchaseDate: "2024-01-10",
    warrantyExpiry: "2027-01-10",
    vendor: "Yubico",
    cost: 55,
    notes: "2FA hardware keys, bulk purchase",
  },
];

export const statusCounts = {
  Available: assets.filter((a) => a.status === "Available").length,
  Assigned: assets.filter((a) => a.status === "Assigned").length,
  "In Maintenance": assets.filter((a) => a.status === "In Maintenance").length,
  Retired: assets.filter((a) => a.status === "Retired").length,
  Lost: assets.filter((a) => a.status === "Lost").length,
  "In Transfer": assets.filter((a) => a.status === "In Transfer").length,
};

export const totalAssets = assets.length;
export const totalAssetValue = assets.reduce((sum, a) => sum + a.cost, 0);

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Total Assets",
    value: totalAssets.toString(),
    change: "+12 this quarter",
    trend: "up",
  },
  {
    label: "Assigned",
    value: statusCounts.Assigned.toString(),
    change: "+3 this month",
    trend: "up",
  },
  {
    label: "Available",
    value: statusCounts.Available.toString(),
    change: "-2 this week",
    trend: "down",
  },
  {
    label: "In Maintenance",
    value: statusCounts["In Maintenance"].toString(),
    change: "No change",
    trend: "neutral",
  },
  {
    label: "Warranty Expiring Soon",
    value: "4",
    change: "Within 90 days",
    trend: "neutral",
  },
  {
    label: "Total Asset Value",
    value: `$${(totalAssetValue / 1000).toFixed(1)}k`,
    change: "+8.4% YoY",
    trend: "up",
  },
];

export const categoryDistribution = [
  { name: "Laptop", value: 4, fill: "var(--color-primary)" },
  { name: "Monitor", value: 3, fill: "var(--color-info)" },
  { name: "Server", value: 2, fill: "var(--color-chart-2)" },
  { name: "Network Equipment", value: 2, fill: "var(--color-chart-3)" },
  { name: "Mobile Device", value: 3, fill: "var(--color-chart-4)" },
  { name: "Software License", value: 3, fill: "var(--color-chart-5)" },
  { name: "Peripheral", value: 2, fill: "var(--color-muted-foreground)" },
  { name: "Printer", value: 1, fill: "var(--color-warning)" },
];

export const recentActivity = [
  { id: 1, action: "Assigned", asset: "IT-2024-003 ThinkPad X1 Carbon", user: "Alex Morgan", time: "2 hours ago" },
  { id: 2, action: "Created", asset: "IT-2024-020 YubiKey 5 NFC", user: "IT Admin", time: "5 hours ago" },
  { id: 3, action: "Maintenance Started", asset: "IT-2024-008 Dell Precision 7770", user: "David Park", time: "1 day ago" },
  { id: 4, action: "Transferred", asset: "IT-2024-012 Surface Laptop Studio 2", user: "IT Admin", time: "1 day ago" },
  { id: 5, action: "Retired", asset: "IT-2024-016 Lenovo ThinkVision P40w", user: "IT Admin", time: "3 days ago" },
];

export function getAssetById(id: string): Asset | undefined {
  return assets.find((a) => a.id === id);
}

export function getAssetsByStatus(status: AssetStatus): Asset[] {
  return assets.filter((a) => a.status === status);
}

export function getAssetsByCategory(category: AssetCategory): Asset[] {
  return assets.filter((a) => a.category === category);
}

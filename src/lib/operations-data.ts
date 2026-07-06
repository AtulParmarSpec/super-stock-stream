// Mock data for Assignments, Transfers, Maintenance, and Masters modules.

export type AssignmentStatus = "Active" | "Pending Return" | "Returned" | "Overdue";

export interface Assignment {
  id: string;
  assetTag: string;
  assetName: string;
  employee: string;
  department: string;
  location: string;
  assignedOn: string;
  dueBack: string | null;
  status: AssignmentStatus;
  assignedBy: string;
}

export const assignments: Assignment[] = [
  { id: "asg-1001", assetTag: "IT-2024-001", assetName: "MacBook Pro 16", employee: "Sarah Chen", department: "Engineering", location: "San Francisco HQ", assignedOn: "2024-01-16", dueBack: null, status: "Active", assignedBy: "IT Admin" },
  { id: "asg-1002", assetTag: "IT-2024-002", assetName: "Dell Ultrasharp 27", employee: "Sarah Chen", department: "Engineering", location: "San Francisco HQ", assignedOn: "2024-01-16", dueBack: null, status: "Active", assignedBy: "IT Admin" },
  { id: "asg-1003", assetTag: "IT-2024-004", assetName: "iPhone 15 Pro", employee: "Michael Torres", department: "Sales", location: "Chicago Office", assignedOn: "2024-03-02", dueBack: null, status: "Active", assignedBy: "J. Rivera" },
  { id: "asg-1004", assetTag: "IT-2024-010", assetName: "Logitech MX Keys Combo", employee: "Rachel Kim", department: "Engineering", location: "San Francisco HQ", assignedOn: "2024-02-02", dueBack: null, status: "Active", assignedBy: "IT Admin" },
  { id: "asg-1005", assetTag: "IT-2024-013", assetName: "Samsung Odyssey G9", employee: "Alex Morgan", department: "Engineering", location: "San Francisco HQ", assignedOn: "2023-12-04", dueBack: null, status: "Active", assignedBy: "IT Admin" },
  { id: "asg-1006", assetTag: "IT-2024-021", assetName: "iPad Pro 12.9 (loaner)", employee: "Priya Natarajan", department: "Product", location: "Remote", assignedOn: "2024-05-10", dueBack: "2024-06-10", status: "Overdue", assignedBy: "IT Admin" },
  { id: "asg-1007", assetTag: "IT-2024-018", assetName: "Google Pixel 8 Pro", employee: "James Wilson", department: "Sales", location: "Chicago Office", assignedOn: "2023-11-16", dueBack: null, status: "Pending Return", assignedBy: "J. Rivera" },
  { id: "asg-1008", assetTag: "IT-2024-022", assetName: "ThinkPad T14 (loaner)", employee: "Noah Becker", department: "Finance", location: "New York Office", assignedOn: "2024-04-01", dueBack: "2024-05-01", status: "Returned", assignedBy: "IT Admin" },
  { id: "asg-1009", assetTag: "IT-2024-023", assetName: "MX Master 3S", employee: "Chen Wei", department: "Design", location: "Austin Office", assignedOn: "2024-04-18", dueBack: null, status: "Active", assignedBy: "IT Admin" },
  { id: "asg-1010", assetTag: "IT-2024-024", assetName: "AirPods Pro (2nd gen)", employee: "Fatima Idris", department: "Sales", location: "New York Office", assignedOn: "2024-05-22", dueBack: null, status: "Active", assignedBy: "J. Rivera" },
];

export type TransferStatus = "In Transit" | "Pending Approval" | "Completed" | "Rejected";

export interface Transfer {
  id: string;
  transferNo: string;
  assetTag: string;
  assetName: string;
  fromLocation: string;
  toLocation: string;
  requestedBy: string;
  requestedOn: string;
  expectedArrival: string;
  carrier: string;
  status: TransferStatus;
}

export const transfers: Transfer[] = [
  { id: "trf-2001", transferNo: "TRF-2024-0142", assetTag: "IT-2024-012", assetName: "Surface Laptop Studio 2", fromLocation: "San Francisco HQ", toLocation: "Chicago Office", requestedBy: "IT Admin", requestedOn: "2024-05-28", expectedArrival: "2024-06-02", carrier: "FedEx Priority", status: "In Transit" },
  { id: "trf-2002", transferNo: "TRF-2024-0141", assetTag: "IT-2024-015", assetName: "Dell PowerEdge R760", fromLocation: "San Francisco DC", toLocation: "Austin Office", requestedBy: "N. Patel", requestedOn: "2024-05-25", expectedArrival: "2024-06-05", carrier: "UPS Freight", status: "Pending Approval" },
  { id: "trf-2003", transferNo: "TRF-2024-0140", assetTag: "IT-2024-009", assetName: "iPad Pro 12.9", fromLocation: "San Francisco HQ", toLocation: "New York Office", requestedBy: "IT Admin", requestedOn: "2024-05-20", expectedArrival: "2024-05-24", carrier: "FedEx Standard", status: "Completed" },
  { id: "trf-2004", transferNo: "TRF-2024-0139", assetTag: "IT-2024-011", assetName: "HP LaserJet Pro", fromLocation: "New York Office", toLocation: "Austin Office", requestedBy: "IT Admin", requestedOn: "2024-05-15", expectedArrival: "2024-05-22", carrier: "UPS Ground", status: "Completed" },
  { id: "trf-2005", transferNo: "TRF-2024-0138", assetTag: "IT-2024-017", assetName: "Cisco Meraki MX75", fromLocation: "Austin Office", toLocation: "San Francisco DC", requestedBy: "Security Team", requestedOn: "2024-05-14", expectedArrival: "2024-05-19", carrier: "Internal Courier", status: "Rejected" },
  { id: "trf-2006", transferNo: "TRF-2024-0137", assetTag: "IT-2024-003", assetName: "ThinkPad X1 Carbon", fromLocation: "New York Office", toLocation: "Remote", requestedBy: "N. Patel", requestedOn: "2024-05-12", expectedArrival: "2024-05-18", carrier: "FedEx Priority", status: "Completed" },
  { id: "trf-2007", transferNo: "TRF-2024-0136", assetTag: "IT-2024-025", assetName: "Dell Latitude 7440", fromLocation: "Warehouse", toLocation: "San Francisco HQ", requestedBy: "IT Admin", requestedOn: "2024-05-10", expectedArrival: "2024-05-14", carrier: "UPS Ground", status: "In Transit" },
];

export type MaintenanceStatus = "Scheduled" | "In Progress" | "Awaiting Parts" | "Completed" | "Cancelled";
export type MaintenancePriority = "Low" | "Medium" | "High" | "Critical";
export type MaintenanceType = "Preventive" | "Corrective" | "Warranty Repair" | "Upgrade";

export interface MaintenanceTicket {
  id: string;
  ticketNo: string;
  assetTag: string;
  assetName: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reportedBy: string;
  assignedTech: string;
  vendor: string;
  openedOn: string;
  eta: string;
  summary: string;
}

export const maintenanceTickets: MaintenanceTicket[] = [
  { id: "mnt-3001", ticketNo: "MNT-24-0091", assetTag: "IT-2024-008", assetName: "Dell Precision 7770", type: "Warranty Repair", priority: "High", status: "In Progress", reportedBy: "David Park", assignedTech: "M. Alvarez", vendor: "Dell Technologies", openedOn: "2024-05-24", eta: "2024-06-03", summary: "Screen replacement — vertical lines on display" },
  { id: "mnt-3002", ticketNo: "MNT-24-0090", assetTag: "IT-2024-005", assetName: "HPE ProLiant DL380", type: "Preventive", priority: "Medium", status: "Scheduled", reportedBy: "Infra Team", assignedTech: "K. Osei", vendor: "HPE Enterprise", openedOn: "2024-05-22", eta: "2024-06-10", summary: "Quarterly firmware + thermal service" },
  { id: "mnt-3003", ticketNo: "MNT-24-0089", assetTag: "IT-2024-006", assetName: "Cisco Catalyst 9300", type: "Upgrade", priority: "Low", status: "Awaiting Parts", reportedBy: "Network Team", assignedTech: "T. Nakamura", vendor: "Cisco Systems", openedOn: "2024-05-18", eta: "2024-06-15", summary: "48-port PoE module expansion" },
  { id: "mnt-3004", ticketNo: "MNT-24-0088", assetTag: "IT-2024-017", assetName: "Cisco Meraki MX75", type: "Corrective", priority: "Critical", status: "In Progress", reportedBy: "Security Team", assignedTech: "T. Nakamura", vendor: "Cisco Meraki", openedOn: "2024-05-16", eta: "2024-05-30", summary: "Intermittent VPN tunnel drops at branch" },
  { id: "mnt-3005", ticketNo: "MNT-24-0087", assetTag: "IT-2024-011", assetName: "HP LaserJet Pro", type: "Corrective", priority: "Low", status: "Completed", reportedBy: "Office Manager", assignedTech: "J. Rivera", vendor: "HP Enterprise", openedOn: "2024-05-05", eta: "2024-05-08", summary: "Fuser replacement, jam clearing" },
  { id: "mnt-3006", ticketNo: "MNT-24-0086", assetTag: "IT-2024-013", assetName: "Samsung Odyssey G9", type: "Warranty Repair", priority: "Medium", status: "Completed", reportedBy: "Alex Morgan", assignedTech: "M. Alvarez", vendor: "Samsung Business", openedOn: "2024-04-28", eta: "2024-05-10", summary: "Backlight flicker — panel swap" },
  { id: "mnt-3007", ticketNo: "MNT-24-0085", assetTag: "IT-2024-001", assetName: "MacBook Pro 16", type: "Preventive", priority: "Low", status: "Cancelled", reportedBy: "Sarah Chen", assignedTech: "—", vendor: "Apple Inc.", openedOn: "2024-04-20", eta: "2024-04-25", summary: "Battery calibration — resolved remotely" },
];

// ============ MASTERS ============

export interface Company { id: string; code: string; name: string; taxId: string; region: string; entities: number; }
export const companies: Company[] = [
  { id: "cmp-1", code: "ACM-US", name: "Acme Software Inc.", taxId: "US-84-1023456", region: "North America", entities: 4 },
  { id: "cmp-2", code: "ACM-EU", name: "Acme Software EMEA Ltd.", taxId: "IE-12345678A", region: "EMEA", entities: 3 },
  { id: "cmp-3", code: "ACM-APAC", name: "Acme Software APAC Pte.", taxId: "SG-201900142K", region: "APAC", entities: 2 },
  { id: "cmp-4", code: "ACM-LATAM", name: "Acme Software LatAm S.A.", taxId: "BR-27.865.190/0001", region: "LATAM", entities: 1 },
];

export interface Office { id: string; code: string; name: string; company: string; city: string; country: string; headcount: number; }
export const offices: Office[] = [
  { id: "off-1", code: "SFO-HQ", name: "San Francisco HQ", company: "ACM-US", city: "San Francisco", country: "USA", headcount: 480 },
  { id: "off-2", code: "NYC-01", name: "New York Office", company: "ACM-US", city: "New York", country: "USA", headcount: 220 },
  { id: "off-3", code: "CHI-01", name: "Chicago Office", company: "ACM-US", city: "Chicago", country: "USA", headcount: 95 },
  { id: "off-4", code: "AUS-01", name: "Austin Office", company: "ACM-US", city: "Austin", country: "USA", headcount: 140 },
  { id: "off-5", code: "DUB-01", name: "Dublin Office", company: "ACM-EU", city: "Dublin", country: "Ireland", headcount: 180 },
  { id: "off-6", code: "BLR-01", name: "Bengaluru Office", company: "ACM-APAC", city: "Bengaluru", country: "India", headcount: 320 },
  { id: "off-7", code: "SIN-01", name: "Singapore Office", company: "ACM-APAC", city: "Singapore", country: "Singapore", headcount: 60 },
  { id: "off-8", code: "SAO-01", name: "São Paulo Office", company: "ACM-LATAM", city: "São Paulo", country: "Brazil", headcount: 55 },
];

export interface Department { id: string; code: string; name: string; manager: string; headcount: number; costCenter: string; }
export const departments: Department[] = [
  { id: "dep-1", code: "ENG", name: "Engineering", manager: "S. Chen", headcount: 512, costCenter: "CC-1001" },
  { id: "dep-2", code: "PRD", name: "Product", manager: "E. Wilson", headcount: 84, costCenter: "CC-1002" },
  { id: "dep-3", code: "DSN", name: "Design", manager: "D. Park", headcount: 46, costCenter: "CC-1003" },
  { id: "dep-4", code: "SLS", name: "Sales", manager: "J. Rivera", headcount: 210, costCenter: "CC-2001" },
  { id: "dep-5", code: "MKT", name: "Marketing", manager: "L. Ahmed", headcount: 72, costCenter: "CC-2002" },
  { id: "dep-6", code: "FIN", name: "Finance", manager: "N. Becker", headcount: 38, costCenter: "CC-3001" },
  { id: "dep-7", code: "HR", name: "People Ops", manager: "K. Adeyemi", headcount: 24, costCenter: "CC-3002" },
  { id: "dep-8", code: "INF", name: "Infrastructure", manager: "N. Patel", headcount: 44, costCenter: "CC-1004" },
  { id: "dep-9", code: "SEC", name: "Security", manager: "T. Nakamura", headcount: 22, costCenter: "CC-1005" },
];

export interface Employee { id: string; empNo: string; name: string; email: string; department: string; office: string; title: string; assetsAssigned: number; }
export const employees: Employee[] = [
  { id: "emp-1", empNo: "E-10231", name: "Sarah Chen", email: "sarah.chen@acme.com", department: "Engineering", office: "San Francisco HQ", title: "Staff Engineer", assetsAssigned: 3 },
  { id: "emp-2", empNo: "E-10344", name: "Michael Torres", email: "m.torres@acme.com", department: "Sales", office: "Chicago Office", title: "Account Executive", assetsAssigned: 2 },
  { id: "emp-3", empNo: "E-10412", name: "Rachel Kim", email: "rachel.kim@acme.com", department: "Engineering", office: "San Francisco HQ", title: "Senior Engineer", assetsAssigned: 2 },
  { id: "emp-4", empNo: "E-10508", name: "Alex Morgan", email: "alex.morgan@acme.com", department: "Engineering", office: "San Francisco HQ", title: "Principal Engineer", assetsAssigned: 4 },
  { id: "emp-5", empNo: "E-10622", name: "David Park", email: "david.park@acme.com", department: "Design", office: "Austin Office", title: "Design Lead", assetsAssigned: 2 },
  { id: "emp-6", empNo: "E-10741", name: "Emma Wilson", email: "emma.wilson@acme.com", department: "Product", office: "Remote", title: "VP Product", assetsAssigned: 3 },
  { id: "emp-7", empNo: "E-10855", name: "James Wilson", email: "james.wilson@acme.com", department: "Sales", office: "Chicago Office", title: "Sales Manager", assetsAssigned: 1 },
  { id: "emp-8", empNo: "E-10963", name: "Priya Natarajan", email: "p.natarajan@acme.com", department: "Product", office: "Remote", title: "Product Manager", assetsAssigned: 2 },
  { id: "emp-9", empNo: "E-11024", name: "Noah Becker", email: "n.becker@acme.com", department: "Finance", office: "New York Office", title: "Controller", assetsAssigned: 1 },
  { id: "emp-10", empNo: "E-11133", name: "Fatima Idris", email: "f.idris@acme.com", department: "Sales", office: "New York Office", title: "SDR", assetsAssigned: 1 },
];

export interface Vendor { id: string; code: string; name: string; category: string; contact: string; slaTier: "Platinum" | "Gold" | "Silver"; activeContracts: number; }
export const vendors: Vendor[] = [
  { id: "vnd-1", code: "V-APL", name: "Apple Inc.", category: "Hardware", contact: "biz@apple.com", slaTier: "Platinum", activeContracts: 4 },
  { id: "vnd-2", code: "V-DEL", name: "Dell Technologies", category: "Hardware", contact: "enterprise@dell.com", slaTier: "Platinum", activeContracts: 6 },
  { id: "vnd-3", code: "V-LEN", name: "Lenovo", category: "Hardware", contact: "sales@lenovo.com", slaTier: "Gold", activeContracts: 3 },
  { id: "vnd-4", code: "V-HPE", name: "HPE Enterprise", category: "Server / Storage", contact: "accounts@hpe.com", slaTier: "Platinum", activeContracts: 2 },
  { id: "vnd-5", code: "V-CIS", name: "Cisco Systems", category: "Networking", contact: "orders@cisco.com", slaTier: "Platinum", activeContracts: 5 },
  { id: "vnd-6", code: "V-MSF", name: "Microsoft", category: "Software", contact: "volume@microsoft.com", slaTier: "Platinum", activeContracts: 8 },
  { id: "vnd-7", code: "V-ADB", name: "Adobe", category: "Software", contact: "enterprise@adobe.com", slaTier: "Gold", activeContracts: 2 },
  { id: "vnd-8", code: "V-ATL", name: "Atlassian", category: "Software", contact: "billing@atlassian.com", slaTier: "Gold", activeContracts: 3 },
  { id: "vnd-9", code: "V-LOG", name: "Logitech", category: "Peripherals", contact: "b2b@logitech.com", slaTier: "Silver", activeContracts: 1 },
  { id: "vnd-10", code: "V-YUB", name: "Yubico", category: "Security", contact: "sales@yubico.com", slaTier: "Silver", activeContracts: 1 },
];

export interface CategoryMaster { id: string; code: string; name: string; parent: string; assetsCount: number; depreciationYears: number; }
export const categoryMasters: CategoryMaster[] = [
  { id: "cat-1", code: "HW-LAP", name: "Laptop", parent: "Hardware", assetsCount: 412, depreciationYears: 4 },
  { id: "cat-2", code: "HW-DSK", name: "Desktop", parent: "Hardware", assetsCount: 88, depreciationYears: 4 },
  { id: "cat-3", code: "HW-MON", name: "Monitor", parent: "Hardware", assetsCount: 640, depreciationYears: 5 },
  { id: "cat-4", code: "HW-SRV", name: "Server", parent: "Hardware", assetsCount: 34, depreciationYears: 5 },
  { id: "cat-5", code: "HW-NET", name: "Network Equipment", parent: "Hardware", assetsCount: 62, depreciationYears: 6 },
  { id: "cat-6", code: "HW-MOB", name: "Mobile Device", parent: "Hardware", assetsCount: 305, depreciationYears: 3 },
  { id: "cat-7", code: "HW-PRT", name: "Printer", parent: "Hardware", assetsCount: 24, depreciationYears: 5 },
  { id: "cat-8", code: "HW-PER", name: "Peripheral", parent: "Hardware", assetsCount: 870, depreciationYears: 3 },
  { id: "cat-9", code: "SW-LIC", name: "Software License", parent: "Software", assetsCount: 1240, depreciationYears: 1 },
];

export interface BrandModel { id: string; brand: string; model: string; category: string; skuCount: number; }
export const brandModels: BrandModel[] = [
  { id: "bm-1", brand: "Apple", model: "MacBook Pro 16 M3 Max", category: "Laptop", skuCount: 3 },
  { id: "bm-2", brand: "Apple", model: "iPhone 15 Pro", category: "Mobile Device", skuCount: 4 },
  { id: "bm-3", brand: "Apple", model: "iPad Pro 12.9 M2", category: "Mobile Device", skuCount: 2 },
  { id: "bm-4", brand: "Dell", model: "U2723QE Ultrasharp 27", category: "Monitor", skuCount: 1 },
  { id: "bm-5", brand: "Dell", model: "Precision 7770", category: "Laptop", skuCount: 2 },
  { id: "bm-6", brand: "Dell", model: "PowerEdge R760", category: "Server", skuCount: 3 },
  { id: "bm-7", brand: "Lenovo", model: "ThinkPad X1 Carbon Gen 12", category: "Laptop", skuCount: 2 },
  { id: "bm-8", brand: "HPE", model: "ProLiant DL380 Gen11", category: "Server", skuCount: 4 },
  { id: "bm-9", brand: "Cisco", model: "Catalyst 9300-48P", category: "Network Equipment", skuCount: 2 },
  { id: "bm-10", brand: "Cisco", model: "Meraki MX75", category: "Network Equipment", skuCount: 1 },
  { id: "bm-11", brand: "Microsoft", model: "Surface Laptop Studio 2", category: "Laptop", skuCount: 2 },
  { id: "bm-12", brand: "Samsung", model: "Odyssey G9 49\"", category: "Monitor", skuCount: 1 },
  { id: "bm-13", brand: "Logitech", model: "MX Keys S + MX Master 3S", category: "Peripheral", skuCount: 3 },
  { id: "bm-14", brand: "Yubico", model: "YubiKey 5 NFC", category: "Peripheral", skuCount: 2 },
];

// ============ VENDOR EVALUATIONS ============

export interface VendorEvaluation {
  id: string;
  vendor: string;
  period: string;
  delivery: number;
  quality: number;
  pricing: number;
  support: number;
  compliance: number;
  overall: number;
  remarks: string;
}

export const evaluationWeights = {
  delivery: 25,
  quality: 25,
  pricing: 20,
  support: 15,
  compliance: 15,
};

export function computeOverall(v: Omit<VendorEvaluation, "id" | "vendor" | "period" | "overall" | "remarks">): number {
  const w = evaluationWeights;
  return Math.round(
    (v.delivery * w.delivery + v.quality * w.quality + v.pricing * w.pricing + v.support * w.support + v.compliance * w.compliance) /
      100 * 10,
  ) / 10;
}

export const vendorEvaluations: VendorEvaluation[] = [
  { id: "ve-1", vendor: "OfficeMart Wholesale", period: "Q3-2026", delivery: 90, quality: 57, pricing: 88, support: 63, compliance: 95, overall: 78.0, remarks: "" },
  { id: "ve-2", vendor: "PrimeCompute Distributors", period: "Q1-2026", delivery: 65, quality: 70, pricing: 75, support: 60, compliance: 80, overall: 69.5, remarks: "Support turnaround needs improvement." },
  { id: "ve-3", vendor: "TechSupplies Pvt Ltd", period: "Q1-2026", delivery: 92, quality: 88, pricing: 80, support: 85, compliance: 95, overall: 88.0, remarks: "Consistent delivery, minor pricing gaps." },
];

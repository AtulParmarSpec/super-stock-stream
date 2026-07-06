import { useState, type ReactNode } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { bump, uid } from "@/lib/store";
import type { Asset, AssetCategory, AssetStatus } from "@/lib/inventory-data";
import { assets, inventoryGroups } from "@/lib/inventory-data";
import {
  companies, offices, departments, employees, vendors, brandModels, categoryMasters,
  assignments, transfers, maintenanceTickets,
  type MaintenancePriority, type MaintenanceType,
} from "@/lib/operations-data";

const categoryOptions: AssetCategory[] = [
  "Laptop", "Desktop", "Monitor", "Server", "Network Equipment",
  "Mobile Device", "Printer", "Peripheral", "Software License",
];

const statusOptions: AssetStatus[] = [
  "Available", "Assigned", "In Maintenance", "Retired", "Scrapped", "Lost", "In Transfer",
];

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>;
}
function Field({ label, required, children, span = 1 }: { label: string; required?: boolean; children: ReactNode; span?: 1 | 2 | 3 }) {
  const cls = span === 3 ? "sm:col-span-3" : span === 2 ? "sm:col-span-2" : "";
  return (
    <div className={cls}>
      <Label className="mb-1.5 block text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ============ ADD / EDIT ASSET ============

export function AssetFormDialog({
  open, onOpenChange, editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Asset | null;
}) {
  const [v, setV] = useState<Partial<Asset>>(() => editing ?? {
    assetTag: `IT-${new Date().getFullYear()}-${String(assets.length + 1).padStart(3, "0")}`,
    status: "Available",
    inventoryGroup: "IT",
    purchaseDate: new Date().toISOString().slice(0, 10),
    orderDate: new Date().toISOString().slice(0, 10),
    inventoryDate: new Date().toISOString().slice(0, 10),
  });

  function set<K extends keyof Asset>(k: K, val: Asset[K] | undefined) {
    setV((s) => ({ ...s, [k]: val }));
  }

  function save() {
    const required: (keyof Asset)[] = ["assetTag", "name", "category", "brand", "model", "serialNumber", "vendor", "location", "purchaseDate", "cost", "inventoryGroup"];
    for (const r of required) {
      if (v[r] === undefined || v[r] === "" || v[r] === null) {
        toast.error(`${String(r)} is required`);
        return;
      }
    }
    if (editing) {
      const idx = assets.findIndex((a) => a.id === editing.id);
      if (idx >= 0) assets[idx] = { ...editing, ...v } as Asset;
      toast.success("Asset updated");
    } else {
      const asset: Asset = {
        id: uid("asset"),
        assetTag: v.assetTag!,
        name: v.name!,
        category: v.category as AssetCategory,
        brand: v.brand!,
        model: v.model!,
        serialNumber: v.serialNumber!,
        status: (v.status as AssetStatus) ?? "Available",
        assignedTo: v.assignedTo ?? null,
        department: v.department ?? null,
        location: v.location!,
        purchaseDate: v.purchaseDate!,
        warrantyExpiry: v.warrantyExpiry ?? "",
        vendor: v.vendor!,
        cost: Number(v.cost) || 0,
        notes: v.notes ?? "",
        inventoryGroup: v.inventoryGroup!,
        supplier: v.supplier,
        unit: v.unit,
        storageLocation: v.storageLocation,
        sellPrice: v.sellPrice ? Number(v.sellPrice) : undefined,
        invoiceNo: v.invoiceNo,
        orderDate: v.orderDate,
        inventoryDate: v.inventoryDate,
        receivedDate: v.receivedDate,
        receivedBy: v.receivedBy,
        description: v.description,
        poNumber: v.poNumber,
        companyEntity: v.companyEntity,
      };
      assets.push(asset);
      toast.success("Asset added");
    }
    bump();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Asset" : "New Asset — Purchase / Intake"}</DialogTitle>
          <DialogDescription>
            Full procurement record. Fields marked <span className="text-destructive">*</span> are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Identification</h3>
            <FieldGrid>
              <Field label="Asset Tag" required><Input value={v.assetTag ?? ""} onChange={(e) => set("assetTag", e.target.value)} /></Field>
              <Field label="Item / Name" required><Input value={v.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Serial Number" required><Input value={v.serialNumber ?? ""} onChange={(e) => set("serialNumber", e.target.value)} /></Field>
              <Field label="Category" required>
                <Select value={v.category ?? ""} onValueChange={(val) => set("category", val as AssetCategory)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Brand" required>
                <Select value={v.brand ?? ""} onValueChange={(val) => set("brand", val)}>
                  <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(brandModels.map((b) => b.brand))).map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Model" required>
                <Select value={v.model ?? ""} onValueChange={(val) => set("model", val)}>
                  <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent>
                    {brandModels.filter((b) => !v.brand || b.brand === v.brand).map((b) => <SelectItem key={b.id} value={b.model}>{b.model}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Inventory Group" required>
                <Select value={v.inventoryGroup ?? ""} onValueChange={(val) => set("inventoryGroup", val)}>
                  <SelectTrigger><SelectValue placeholder="Group" /></SelectTrigger>
                  <SelectContent>{inventoryGroups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={v.status ?? "Available"} onValueChange={(val) => set("status", val as AssetStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Unit"><Input value={v.unit ?? ""} onChange={(e) => set("unit", e.target.value)} placeholder="e.g. pcs, box" /></Field>
            </FieldGrid>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Procurement</h3>
            <FieldGrid>
              <Field label="Company">
                <Select value={v.companyEntity ?? ""} onValueChange={(val) => set("companyEntity", val)}>
                  <SelectTrigger><SelectValue placeholder="Company entity" /></SelectTrigger>
                  <SelectContent>{companies.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Vendor" required>
                <Select value={v.vendor ?? ""} onValueChange={(val) => set("vendor", val)}>
                  <SelectTrigger><SelectValue placeholder="Vendor" /></SelectTrigger>
                  <SelectContent>{vendors.map((vn) => <SelectItem key={vn.id} value={vn.name}>{vn.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Supplier / Reseller"><Input value={v.supplier ?? ""} onChange={(e) => set("supplier", e.target.value)} /></Field>
              <Field label="PO Number"><Input value={v.poNumber ?? ""} onChange={(e) => set("poNumber", e.target.value)} /></Field>
              <Field label="Invoice No"><Input value={v.invoiceNo ?? ""} onChange={(e) => set("invoiceNo", e.target.value)} /></Field>
              <Field label="Purchase Price" required><Input type="number" value={v.cost ?? ""} onChange={(e) => set("cost", Number(e.target.value))} /></Field>
              <Field label="Sell Price"><Input type="number" value={v.sellPrice ?? ""} onChange={(e) => set("sellPrice", Number(e.target.value))} /></Field>
              <Field label="Order Date"><Input type="date" value={v.orderDate ?? ""} onChange={(e) => set("orderDate", e.target.value)} /></Field>
              <Field label="Purchase Date" required><Input type="date" value={v.purchaseDate ?? ""} onChange={(e) => set("purchaseDate", e.target.value)} /></Field>
              <Field label="Inventory Date"><Input type="date" value={v.inventoryDate ?? ""} onChange={(e) => set("inventoryDate", e.target.value)} /></Field>
              <Field label="Received Date"><Input type="date" value={v.receivedDate ?? ""} onChange={(e) => set("receivedDate", e.target.value)} /></Field>
              <Field label="Received By"><Input value={v.receivedBy ?? ""} onChange={(e) => set("receivedBy", e.target.value)} /></Field>
              <Field label="Warranty Expiry"><Input type="date" value={v.warrantyExpiry ?? ""} onChange={(e) => set("warrantyExpiry", e.target.value)} /></Field>
            </FieldGrid>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Location & Assignment</h3>
            <FieldGrid>
              <Field label="Location" required>
                <Select value={v.location ?? ""} onValueChange={(val) => set("location", val)}>
                  <SelectTrigger><SelectValue placeholder="Office" /></SelectTrigger>
                  <SelectContent>
                    {offices.map((o) => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Storage Location"><Input value={v.storageLocation ?? ""} onChange={(e) => set("storageLocation", e.target.value)} placeholder="Rack / shelf / room" /></Field>
              <Field label="Department">
                <Select value={v.department ?? ""} onValueChange={(val) => set("department", val)}>
                  <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Assigned To">
                <Select value={v.assignedTo ?? ""} onValueChange={(val) => set("assignedTo", val)}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </FieldGrid>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Description & Notes</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Description" span={3}>
                <Textarea rows={2} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Purchase description..." />
              </Field>
              <Field label="Internal Notes" span={3}>
                <Textarea rows={2} value={v.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
              </Field>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{editing ? "Save changes" : "Create asset"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ ASSET LIFECYCLE ACTIONS ============

export type AssetAction = "assign" | "transfer" | "maintenance" | "return" | "retire" | "scrap";

const actionMeta: Record<AssetAction, { title: string; desc: string; cta: string }> = {
  assign:      { title: "Assign to Employee",   desc: "Issue this asset to an employee.", cta: "Assign" },
  transfer:    { title: "Transfer Location",    desc: "Move this asset to another office or warehouse.", cta: "Create transfer" },
  maintenance: { title: "Request Maintenance",  desc: "Open a maintenance ticket for this asset.", cta: "Open ticket" },
  return:      { title: "Return to Inventory",  desc: "Bring the asset back to Available stock.", cta: "Return" },
  retire:      { title: "Mark as Retired",      desc: "Retire this asset — it will no longer be in active use.", cta: "Retire" },
  scrap:       { title: "Mark as Scrapped",     desc: "Scrap this asset. It will be marked for disposal.", cta: "Scrap" },
};

export function AssetActionDialog({
  asset, action, open, onOpenChange,
}: {
  asset: Asset;
  action: AssetAction | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [employee, setEmployee] = useState(asset.assignedTo ?? "");
  const [department, setDepartment] = useState(asset.department ?? "");
  const [toLocation, setToLocation] = useState("");
  const [carrier, setCarrier] = useState("Internal Courier");
  const [priority, setPriority] = useState<MaintenancePriority>("Medium");
  const [mtType, setMtType] = useState<MaintenanceType>("Corrective");
  const [summary, setSummary] = useState("");
  const [reason, setReason] = useState("");

  if (!action) return null;
  const meta = actionMeta[action];

  function submit() {
    const idx = assets.findIndex((a) => a.id === asset.id);
    if (idx < 0) return;
    const target = assets[idx];
    const today = new Date().toISOString().slice(0, 10);

    if (action === "assign") {
      if (!employee) { toast.error("Please select an employee"); return; }
      target.status = "Assigned";
      target.assignedTo = employee;
      target.department = department || target.department;
      assignments.unshift({
        id: uid("asg"), assetTag: target.assetTag, assetName: target.name,
        employee, department: department || target.department || "—",
        location: target.location, assignedOn: today, dueBack: null,
        status: "Active", assignedBy: "IT Admin",
      });
      toast.success(`${target.name} assigned to ${employee}`);
    } else if (action === "transfer") {
      if (!toLocation) { toast.error("Destination is required"); return; }
      const from = target.location;
      target.status = "In Transfer";
      target.location = toLocation;
      const num = `TRF-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(4, "0")}`;
      transfers.unshift({
        id: uid("trf"), transferNo: num, assetTag: target.assetTag, assetName: target.name,
        fromLocation: from, toLocation, requestedBy: "IT Admin", requestedOn: today,
        expectedArrival: today, carrier, status: "In Transit",
      });
      toast.success(`Transfer ${num} created`);
    } else if (action === "maintenance") {
      if (!summary) { toast.error("Summary is required"); return; }
      target.status = "In Maintenance";
      const num = `MNT-${new Date().getFullYear().toString().slice(-2)}-${String(maintenanceTickets.length + 1).padStart(4, "0")}`;
      maintenanceTickets.unshift({
        id: uid("mnt"), ticketNo: num, assetTag: target.assetTag, assetName: target.name,
        type: mtType, priority, status: "Scheduled", reportedBy: "IT Admin",
        assignedTech: "—", vendor: target.vendor, openedOn: today, eta: today, summary,
      });
      toast.success(`Ticket ${num} opened`);
    } else if (action === "return") {
      target.status = "Available";
      target.assignedTo = null;
      target.department = null;
      const openAsg = assignments.find((a) => a.assetTag === target.assetTag && (a.status === "Active" || a.status === "Overdue" || a.status === "Pending Return"));
      if (openAsg) openAsg.status = "Returned";
      toast.success(`${target.name} returned to inventory`);
    } else if (action === "retire") {
      target.status = "Retired";
      target.assignedTo = null;
      target.notes = reason ? `[Retired] ${reason}\n${target.notes}` : target.notes;
      toast.success(`${target.name} marked retired`);
    } else if (action === "scrap") {
      target.status = "Scrapped";
      target.assignedTo = null;
      target.notes = reason ? `[Scrapped] ${reason}\n${target.notes}` : target.notes;
      toast.success(`${target.name} marked scrapped`);
    }

    bump();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>{meta.desc} — {asset.assetTag} · {asset.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {action === "assign" && (
            <>
              <Field label="Employee" required>
                <Select value={employee} onValueChange={setEmployee}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.name}>{e.name} — {e.department}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Department">
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </>
          )}
          {action === "transfer" && (
            <>
              <Field label="Destination" required>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger><SelectValue placeholder="Destination location" /></SelectTrigger>
                  <SelectContent>
                    {offices.filter((o) => o.name !== asset.location).map((o) => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}
                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Carrier">
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Internal Courier", "FedEx Standard", "FedEx Priority", "UPS Ground", "UPS Freight", "DHL"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}
          {action === "maintenance" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Type">
                  <Select value={mtType} onValueChange={(v) => setMtType(v as MaintenanceType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(["Preventive", "Corrective", "Warranty Repair", "Upgrade"] as MaintenanceType[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Priority">
                  <Select value={priority} onValueChange={(v) => setPriority(v as MaintenancePriority)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(["Low", "Medium", "High", "Critical"] as MaintenancePriority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Summary" required>
                <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Describe the issue or work needed..." />
              </Field>
            </>
          )}
          {action === "return" && (
            <p className="text-sm text-muted-foreground">
              This returns the asset to Available stock and closes any open assignment.
            </p>
          )}
          {(action === "retire" || action === "scrap") && (
            <Field label="Reason">
              <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional reason / disposal notes..." />
            </Field>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} variant={action === "scrap" || action === "retire" ? "destructive" : "default"}>{meta.cta}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ NEW ASSIGNMENT / TRANSFER / MAINTENANCE ============

export function NewAssignmentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [assetId, setAssetId] = useState("");
  const [employee, setEmployee] = useState("");
  const [department, setDepartment] = useState("");
  const [dueBack, setDueBack] = useState("");

  function submit() {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) { toast.error("Select an asset"); return; }
    if (!employee) { toast.error("Select an employee"); return; }
    const today = new Date().toISOString().slice(0, 10);
    asset.status = "Assigned";
    asset.assignedTo = employee;
    if (department) asset.department = department;
    assignments.unshift({
      id: uid("asg"), assetTag: asset.assetTag, assetName: asset.name,
      employee, department: department || asset.department || "—",
      location: asset.location, assignedOn: today, dueBack: dueBack || null,
      status: "Active", assignedBy: "IT Admin",
    });
    bump();
    toast.success("Assignment created");
    onOpenChange(false);
    setAssetId(""); setEmployee(""); setDepartment(""); setDueBack("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Assignment</DialogTitle><DialogDescription>Issue an available asset to an employee.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Asset" required>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>{assets.filter((a) => a.status === "Available").map((a) => <SelectItem key={a.id} value={a.id}>{a.assetTag} — {a.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Employee" required>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Department">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Due Back"><Input type="date" value={dueBack} onChange={(e) => setDueBack(e.target.value)} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create assignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NewTransferDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [assetId, setAssetId] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [carrier, setCarrier] = useState("Internal Courier");
  const [eta, setEta] = useState("");

  function submit() {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) { toast.error("Select an asset"); return; }
    if (!toLocation) { toast.error("Destination is required"); return; }
    const today = new Date().toISOString().slice(0, 10);
    const from = asset.location;
    asset.status = "In Transfer";
    asset.location = toLocation;
    const num = `TRF-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(4, "0")}`;
    transfers.unshift({
      id: uid("trf"), transferNo: num, assetTag: asset.assetTag, assetName: asset.name,
      fromLocation: from, toLocation, requestedBy: "IT Admin", requestedOn: today,
      expectedArrival: eta || today, carrier, status: "Pending Approval",
    });
    bump();
    toast.success(`Transfer ${num} created`);
    onOpenChange(false);
    setAssetId(""); setToLocation(""); setEta("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Transfer</DialogTitle><DialogDescription>Move an asset between locations.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Asset" required>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>{assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.assetTag} — {a.name} ({a.location})</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Destination" required>
            <Select value={toLocation} onValueChange={setToLocation}>
              <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
              <SelectContent>
                {offices.map((o) => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Carrier">
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Internal Courier", "FedEx Standard", "FedEx Priority", "UPS Ground", "UPS Freight", "DHL"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="ETA"><Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NewMaintenanceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [assetId, setAssetId] = useState("");
  const [type, setType] = useState<MaintenanceType>("Corrective");
  const [priority, setPriority] = useState<MaintenancePriority>("Medium");
  const [vendor, setVendor] = useState("");
  const [summary, setSummary] = useState("");
  const [eta, setEta] = useState("");

  function submit() {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) { toast.error("Select an asset"); return; }
    if (!summary) { toast.error("Summary is required"); return; }
    const today = new Date().toISOString().slice(0, 10);
    asset.status = "In Maintenance";
    const num = `MNT-${new Date().getFullYear().toString().slice(-2)}-${String(maintenanceTickets.length + 1).padStart(4, "0")}`;
    maintenanceTickets.unshift({
      id: uid("mnt"), ticketNo: num, assetTag: asset.assetTag, assetName: asset.name,
      type, priority, status: "Scheduled", reportedBy: "IT Admin", assignedTech: "—",
      vendor: vendor || asset.vendor, openedOn: today, eta: eta || today, summary,
    });
    bump();
    toast.success(`Ticket ${num} opened`);
    onOpenChange(false);
    setAssetId(""); setSummary(""); setVendor(""); setEta("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Maintenance Ticket</DialogTitle><DialogDescription>Log a preventive or corrective service request.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Asset" required>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>{assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.assetTag} — {a.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={type} onValueChange={(v) => setType(v as MaintenanceType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["Preventive", "Corrective", "Warranty Repair", "Upgrade"] as MaintenanceType[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={priority} onValueChange={(v) => setPriority(v as MaintenancePriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["Low", "Medium", "High", "Critical"] as MaintenancePriority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Vendor">
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger><SelectValue placeholder="Vendor" /></SelectTrigger>
                <SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="ETA"><Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} /></Field>
          </div>
          <Field label="Summary" required>
            <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Describe the issue or work needed..." />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Open ticket</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper referenced by categoryMasters imports elsewhere.
export function _forceCategoryMastersImport() { return categoryMasters.length; }

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { bump, uid } from "@/lib/store";
import { assets, type Asset, type AssetCategory, type AssetStatus } from "@/lib/inventory-data";

const SAMPLE = `assetTag,name,category,brand,model,serialNumber,status,location,inventoryGroup,vendor,cost
IT-2026-901,MacBook Air 15,Laptop,Apple,MacBook Air 15 M3,MAC901X,Available,San Francisco HQ,Engineering,Apple Inc.,1499
IT-2026-902,Dell U2723,Monitor,Dell,U2723QE,DEL902Y,Available,New York Office,IT,Dell Technologies,619`;

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells: string[] = [];
    let cur = ""; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { cells.push(cur); cur = ""; continue; }
      cur += ch;
    }
    cells.push(cur);
    const row: Record<string, string> = {};
    header.forEach((h, i) => { row[h] = (cells[i] ?? "").trim(); });
    return row;
  });
}

export function BulkImportDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [text, setText] = useState(SAMPLE);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setText(String(r.result ?? ""));
    r.readAsText(f);
  }

  function importAll() {
    const rows = parseCsv(text);
    if (!rows.length) { toast.error("No rows detected"); return; }
    let added = 0; let skipped = 0;
    for (const r of rows) {
      if (!r.assetTag || !r.name || !r.category) { skipped++; continue; }
      const asset: Asset = {
        id: uid("ast"),
        assetTag: r.assetTag,
        name: r.name,
        category: r.category as AssetCategory,
        brand: r.brand ?? "",
        model: r.model ?? "",
        serialNumber: r.serialNumber ?? "",
        status: (r.status as AssetStatus) || "Available",
        assignedTo: null,
        department: r.department || null,
        location: r.location ?? "Warehouse",
        purchaseDate: r.purchaseDate ?? new Date().toISOString().slice(0, 10),
        warrantyExpiry: r.warrantyExpiry ?? "",
        vendor: r.vendor ?? "",
        cost: Number(r.cost || 0),
        notes: r.notes ?? "Imported via bulk CSV.",
        inventoryGroup: r.inventoryGroup ?? "IT",
      };
      assets.push(asset);
      added++;
    }
    bump();
    toast.success(`Imported ${added} assets${skipped ? ` · skipped ${skipped}` : ""}`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Assets (CSV)</DialogTitle>
          <DialogDescription>
            Paste CSV data or upload a file. Required columns: <code>assetTag, name, category</code>.
            Optional: brand, model, serialNumber, status, location, inventoryGroup, department,
            vendor, cost, purchaseDate, warrantyExpiry, notes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Upload .csv file</Label>
            <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium">Or paste CSV</Label>
            <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={importAll}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

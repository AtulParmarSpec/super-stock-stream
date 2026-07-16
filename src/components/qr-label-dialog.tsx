import { useMemo } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { Asset } from "@/lib/inventory-data";

// Deterministic pseudo-QR pattern (visual only, not a scannable code).
function patternFor(seed: string, size = 21): boolean[][] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const grid: boolean[][] = [];
  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x++) {
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
      row.push((h & 1) === 1);
    }
    grid.push(row);
  }
  // Three finder squares (top-left, top-right, bottom-left)
  const corners: [number, number][] = [[0, 0], [0, size - 7], [size - 7, 0]];
  for (const [oy, ox] of corners) {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      const edge = y === 0 || y === 6 || x === 0 || x === 6;
      const inner = y >= 2 && y <= 4 && x >= 2 && x <= 4;
      grid[oy + y][ox + x] = edge || inner;
    }
  }
  return grid;
}

function QRSvg({ value, size = 168 }: { value: string; size?: number }) {
  const grid = useMemo(() => patternFor(value), [value]);
  const n = grid.length;
  const cell = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded border bg-white">
      <rect width={size} height={size} fill="#ffffff" />
      {grid.map((row, y) => row.map((on, x) => on ? (
        <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#0a0a0a" />
      ) : null))}
    </svg>
  );
}

function Barcode({ value }: { value: string }) {
  // Alternating bar widths derived from char codes — decorative only.
  const bars = Array.from(value).flatMap((ch) => {
    const c = ch.charCodeAt(0);
    return [1 + (c % 3), 1, 1 + ((c >> 2) % 3), 1];
  });
  const total = bars.reduce((s, w) => s + w, 0);
  let x = 0;
  return (
    <svg viewBox={`0 0 ${total} 40`} className="h-12 w-full">
      {bars.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={40} fill="#0a0a0a" /> : null;
        x += w;
        return rect;
      })}
    </svg>
  );
}

export function QrLabelDialog({
  asset, open, onOpenChange,
}: { asset: Asset; open: boolean; onOpenChange: (v: boolean) => void }) {
  function printLabel() {
    const w = window.open("", "_blank", "width=420,height=520");
    if (!w) return;
    const svg = document.getElementById("qr-label-print")?.outerHTML ?? "";
    w.document.write(`<html><head><title>${asset.assetTag} label</title>
      <style>body{font-family:ui-sans-serif,system-ui;margin:24px;text-align:center}</style>
      </head><body>${svg}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),200)}</script></body></html>`);
    w.document.close();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asset Label — {asset.assetTag}</DialogTitle>
        </DialogHeader>
        <div id="qr-label-print" className="mx-auto flex w-[280px] flex-col items-center gap-3 rounded-lg border border-border bg-white p-4 text-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider">AssetFlow</p>
          <QRSvg value={asset.assetTag} />
          <div className="text-center">
            <p className="font-mono text-sm font-semibold">{asset.assetTag}</p>
            <p className="text-xs">{asset.brand} {asset.model}</p>
            <p className="text-[10px] text-slate-500">SN: {asset.serialNumber}</p>
          </div>
          <Barcode value={asset.assetTag} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={printLabel}><Printer className="mr-2 h-4 w-4" /> Print label</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

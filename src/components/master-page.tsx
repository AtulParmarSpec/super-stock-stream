import { useMemo, useState, type ReactNode } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { toast } from "sonner";
import { bump, uid, useStore } from "@/lib/store";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type FieldType = "text" | "number" | "select" | "textarea";

export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  type?: FieldType;
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
  width?: "half" | "full";
}

export interface ColumnDef<T> {
  key: keyof T & string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
}

export interface MasterPageProps<T extends { id: string }> {
  title: string;
  description?: string;
  entityLabel: string; // e.g. "Company"
  data: T[];
  idPrefix: string;
  columns: ColumnDef<T>[];
  fields: FieldDef<T>[];
  searchKeys: (keyof T & string)[];
  makeDefaults?: () => Partial<T>;
  extraActions?: ReactNode;
}

export function MasterPage<T extends { id: string }>(props: MasterPageProps<T>) {
  useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null);
  const [values, setValues] = useState<Partial<T>>({});

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return props.data;
    return props.data.filter((r) =>
      props.searchKeys.some((k) => String((r as Record<string, unknown>)[k] ?? "").toLowerCase().includes(term)),
    );
  }, [q, props.data, props.searchKeys]);

  function startAdd() {
    setEditing(null);
    setValues((props.makeDefaults?.() ?? {}) as Partial<T>);
    setOpen(true);
  }

  function startEdit(row: T) {
    setEditing(row);
    setValues({ ...row });
    setOpen(true);
  }

  function save() {
    for (const f of props.fields) {
      if (f.required && !String(values[f.key] ?? "").trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    if (editing) {
      const idx = props.data.findIndex((r) => r.id === editing.id);
      if (idx >= 0) props.data[idx] = { ...editing, ...values } as T;
      toast.success(`${props.entityLabel} updated`);
    } else {
      const item = { id: uid(props.idPrefix), ...(values as object) } as T;
      props.data.push(item);
      toast.success(`${props.entityLabel} added`);
    }
    bump();
    setOpen(false);
  }

  function doDelete(row: T) {
    const idx = props.data.findIndex((r) => r.id === row.id);
    if (idx >= 0) props.data.splice(idx, 1);
    bump();
    toast.success(`${props.entityLabel} deleted`);
    setConfirmDelete(null);
  }

  return (
    <PageShell
      title={props.title}
      description={props.description}
      actions={
        <>
          {props.extraActions}
          <Button size="sm" onClick={startAdd}>
            <Plus className="mr-2 h-4 w-4" /> New {props.entityLabel}
          </Button>
        </>
      }
    >
      <div className="flex rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={`Search ${props.title.toLowerCase()}...`} value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {props.columns.map((c) => (
                <TableHead key={c.key} className={c.align === "right" ? "text-right" : ""}>
                  {c.header}
                </TableHead>
              ))}
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? rows.map((row) => (
              <TableRow key={row.id}>
                {props.columns.map((c) => (
                  <TableCell key={c.key} className={[c.align === "right" ? "text-right" : "", c.className ?? ""].join(" ")}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(row)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={props.columns.length + 1} className="h-32 text-center text-muted-foreground">
                  No records match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${props.entityLabel}` : `New ${props.entityLabel}`}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the record details below." : `Add a new ${props.entityLabel.toLowerCase()} to the master.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {props.fields.map((f) => (
              <div key={f.key} className={f.width === "full" ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                <Label className="mb-1.5 block text-xs font-medium">
                  {f.label} {f.required && <span className="text-destructive">*</span>}
                </Label>
                {f.type === "select" ? (
                  <Select value={String(values[f.key] ?? "")} onValueChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}>
                    <SelectTrigger><SelectValue placeholder={f.placeholder ?? `Select ${f.label}`} /></SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : f.type === "textarea" ? (
                  <Textarea
                    placeholder={f.placeholder}
                    value={String(values[f.key] ?? "")}
                    onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
                  />
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    placeholder={f.placeholder}
                    value={String(values[f.key] ?? "")}
                    onChange={(e) => setValues((s) => ({
                      ...s,
                      [f.key]: f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value,
                    }))}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {props.entityLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the record from the master data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && doDelete(confirmDelete)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

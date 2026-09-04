import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { ArrowLeft, Download, Trash2, Upload } from "lucide-react";
import { Link } from "wouter";
import { Footer, Navbar } from "@/components/FasiliCareShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Role = "user" | "admin" | "tech";

export default function AdminUsers() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const query = trpc.admin.users.useQuery();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<Record<number, { name: string; role: Role; points: string }>>({});
  const update = trpc.admin.updateUser.useMutation({ onSuccess: () => { toast.success("User updated"); utils.admin.users.invalidate(); }, onError: error => toast.error(error.message) });
  const remove = trpc.admin.deleteUser.useMutation({ onSuccess: () => { toast.success("User deleted"); utils.admin.users.invalidate(); }, onError: error => toast.error(error.message) });
  const importUsers = trpc.admin.importUsers.useMutation({ onSuccess: result => { toast.success(`${result.count} users imported!`); utils.admin.users.invalidate(); }, onError: error => toast.error(error.message) });
  const confirmAction = (message: string, action: () => void) => toast(message, { action: { label: "Confirm", onClick: action } });

  const downloadTemplate = () => {
    const sheet = XLSX.utils.json_to_sheet([{ Name: "Alex Commuter", Email: "alex@example.com" }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Users");
    XLSX.writeFile(workbook, "fasilicare-users-template.xlsx");
  };
  const parseWorkbook = async (file: File) => {
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets.Users ?? workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) return toast.error("This workbook has no readable sheet.");
      const rows = XLSX.utils.sheet_to_json<{ Name?: string; Email?: string }>(sheet);
      const values = rows.map(row => ({ name: row.Name?.trim() ?? null, email: row.Email?.trim().toLowerCase() ?? null, openId: `imported:${row.Email?.trim().toLowerCase()}` })).filter(row => row.name && row.email);
      if (!values.length) return toast.error("No valid Name and Email rows found.");
      importUsers.mutate(values);
    } catch {
      toast.error("Could not read this Excel file.");
    }
  };

  if (user?.role !== "admin") return <><Navbar /><main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="text-3xl font-black">Admin access required</h1><Link href="/" className="mt-4 inline-block font-bold text-orange-600">Return home</Link></main></>;
  return <div className="min-h-screen bg-[#fffaf2]"><Navbar /><main className="mx-auto max-w-6xl px-5 py-10"><Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft className="size-4" /> Operations</Link><div className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Admin / people</p><h1 className="mt-2 text-4xl font-black">User management</h1><p className="mt-2 text-slate-600">Keep every contributor’s access and reputation accurate.</p></div><div className="flex gap-2"><Button variant="outline" onClick={downloadTemplate}><Download className="mr-2 size-4" /> Download template</Button><Button onClick={() => inputRef.current?.click()} className="bg-orange-500 text-white"><Upload className="mr-2 size-4" /> Upload Excel</Button><input ref={inputRef} type="file" accept=".xlsx,.xls" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) void parseWorkbook(file); event.currentTarget.value = ""; }} /></div></div><div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm"><div className="hidden grid-cols-[1fr_140px_130px_150px] gap-4 border-b px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-400 md:grid"><span>Contributor</span><span>Role</span><span>Reputation</span><span>Actions</span></div>{query.isLoading ? <div className="space-y-3 p-6">{[1,2,3].map(item => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div> : query.data?.map(item => { const draft = editing[item.id] ?? { name: item.name ?? "", role: item.role as Role, points: String(item.reputationPoints ?? item.reputation ?? 0) }; return <div key={item.id} className="grid gap-4 border-b px-5 py-4 last:border-0 md:grid-cols-[1fr_140px_130px_150px] md:items-center"><div><Link href={`/profile/${item.id}`} className="font-bold hover:text-orange-600">{item.name || "Unnamed commuter"}</Link><p className="text-xs text-slate-400">{item.email || "No email"}</p></div><select value={draft.role} onChange={event => setEditing({ ...editing, [item.id]: { ...draft, role: event.target.value as Role } })} className="h-9 rounded-lg border px-2 text-xs font-bold"><option value="user">User</option><option value="tech">Technician</option><option value="admin">Admin</option></select><input type="number" min="0" value={draft.points} onChange={event => setEditing({ ...editing, [item.id]: { ...draft, points: event.target.value } })} className="h-9 rounded-lg border px-2 text-sm font-bold" /><div className="flex gap-2"><Button size="sm" disabled={update.isPending} onClick={() => update.mutate({ userId: item.id, name: draft.name, role: draft.role, reputationPoints: Number(draft.points) })}>Save</Button><Button aria-label={`Delete ${item.name || item.email}`} disabled={item.id === user.id} onClick={() => confirmAction(`Delete ${item.name || "this user"}?`, () => remove.mutate({ userId: item.id }))} variant="outline" size="icon" className="text-red-600"><Trash2 className="size-4" /></Button></div></div>; })}</div></main><Footer /></div>;
}

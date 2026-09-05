import React from "react";
import { Ban, Check, LayoutDashboard, MapPin, ShieldCheck, Ticket, Trash2, UserRound, X } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Manage Users", icon: UserRound },
  { id: "locations", label: "Manage Locations", icon: MapPin },
  { id: "tickets", label: "Triage Queue", icon: Ticket },
] as const;
type Tab = (typeof tabs)[number]["id"];

type Props = { initialTab?: Tab };

export default function AdminDashboard({ initialTab = "overview" }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = React.useState<Tab>(initialTab);
  const utils = trpc.useUtils();
  const users = trpc.admin.users.useQuery(undefined, { enabled: user?.role === "admin" });
  const tickets = trpc.admin.tickets.useQuery(undefined, { enabled: user?.role === "admin" });
  const locations = trpc.locations.unverified.useQuery(undefined, { enabled: user?.role === "admin" });
  const analytics = trpc.analytics.useQuery(undefined, { enabled: user?.role === "admin" });
  const ban = trpc.admin.banUser.useMutation({ onSuccess: () => { toast.success("Access updated"); utils.admin.users.invalidate(); }, onError: e => toast.error(e.message) });
  const removeAvatar = trpc.admin.removeAvatar.useMutation({ onSuccess: () => { toast.success("Avatar removed"); utils.admin.users.invalidate(); }, onError: e => toast.error(e.message) });
  const verify = trpc.locations.verify.useMutation({ onSuccess: () => { toast.success("Location approved"); utils.locations.unverified.invalidate(); }, onError: e => toast.error(e.message) });
  const removeLocation = trpc.locations.remove.useMutation({ onSuccess: () => { toast.success("Location rejected"); utils.locations.unverified.invalidate(); }, onError: e => toast.error(e.message) });

  if (user?.role !== "admin") return <main className="mx-auto max-w-xl px-5 py-24 text-center"><ShieldCheck className="mx-auto size-12 text-orange-500" /><h1 className="mt-5 text-3xl font-black">Admin access required</h1><Link href="/" className="mt-4 inline-block font-bold text-orange-600">Return home</Link></main>;

  const openTickets = tickets.data?.filter(ticket => ticket.status !== "resolved").length ?? 0;
  const bannedUsers = users.data?.filter(item => item.isBanned).length ?? 0;
  return <div className="min-h-screen bg-[#f6f7f9] text-[#102a43]">
    <div className="mx-auto flex max-w-375 gap-0 lg:p-5">
      <aside className="hidden w-64 shrink-0 flex-col rounded-4xl bg-[#102a43] p-5 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3 border-b border-white/10 pb-6"><span className="grid size-10 place-items-center rounded-2xl bg-orange-500 text-xl">✦</span><span><strong className="block text-lg">FasiliCare</strong><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">control room</span></span></Link>
        <p className="mt-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Moderation</p>
        <nav className="mt-3 space-y-1">{tabs.map(item => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${tab === item.id ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon className="size-4" />{item.label}</button>; })}</nav>
        <div className="mt-auto rounded-2xl bg-white/10 p-4"><p className="text-xs text-slate-300">Signed in as</p><p className="mt-1 truncate font-bold">{user.email || user.name}</p><Link href="/" className="mt-3 block text-xs font-bold text-orange-300">Back to community</Link></div>
      </aside>
      <main className="min-w-0 flex-1 p-5 lg:px-8 lg:py-4"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">FasiliCare / admin</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Keep the city moving.</h1><p className="mt-2 text-sm text-slate-500">A focused workspace for trust, triage, and transit quality.</p></div><div className="flex gap-2 lg:hidden">{tabs.map(item => <Button key={item.id} size="icon" variant={tab === item.id ? "default" : "outline"} title={item.label} onClick={() => setTab(item.id)}><item.icon className="size-4" /></Button>)}</div></div>
        {tab === "overview" && <Overview openTickets={openTickets} users={users.data?.length ?? 0} bannedUsers={bannedUsers} pendingLocations={locations.data?.length ?? 0} resolved={analytics.data?.resolved ?? 0} />}
        {tab === "users" && <UsersTable users={users.data ?? []} onBan={(id, isBanned) => ban.mutate({ userId: id, isBanned })} onRemoveAvatar={id => removeAvatar.mutate({ userId: id })} />}
        {tab === "locations" && <LocationsTable locations={locations.data ?? []} onApprove={id => verify.mutate({ locationId: id })} onReject={id => removeLocation.mutate({ locationId: id })} />}
        {tab === "tickets" && <TicketsTable tickets={tickets.data ?? []} />}
      </main>
    </div>
  </div>;
}

function Overview({ openTickets, users, bannedUsers, pendingLocations, resolved }: { openTickets: number; users: number; bannedUsers: number; pendingLocations: number; resolved: number }) {
  return <><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Open queue", openTickets, "Needs attention", "text-orange-600"], ["Contributors", users, "Community members", "text-[#102a43]"], ["Resolved", resolved, "Closed successfully", "text-emerald-600"], ["Unverified places", pendingLocations, `${bannedUsers} banned accounts`, "text-rose-600"]].map(([label, value, detail, color]) => <Card key={label as string} className="border-0 shadow-sm"><CardContent className="p-5"><p className="text-sm font-bold text-slate-500">{label}</p><p className={`mt-3 text-4xl font-black ${color}`}>{value}</p><p className="mt-2 text-xs font-semibold text-slate-400">{detail}</p></CardContent></Card>)}</div><div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]"><Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-lg">Moderation pulse</CardTitle></CardHeader><CardContent><div className="flex items-center gap-4 rounded-2xl bg-orange-50 p-4"><div className="grid size-11 place-items-center rounded-xl bg-orange-500 text-white"><ShieldCheck className="size-5" /></div><div><p className="font-bold">Trust is a product feature.</p><p className="mt-1 text-sm text-slate-500">Review accounts and places before they shape the public board.</p></div></div></CardContent></Card><Card className="border-0 bg-[#102a43] text-white shadow-sm"><CardHeader><CardTitle className="text-lg">Quick actions</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-slate-300"><p>• Approve verified transit locations</p><p>• Keep banned accounts from reporting</p><p>• Resolve high-impact tickets first</p></CardContent></Card></div></>;
}

function UsersTable({ users, onBan, onRemoveAvatar }: { users: Array<{ id: number; name: string | null; email: string | null; role: string; image: string | null; reputationPoints: number; isBanned: boolean }>; onBan: (id: number, isBanned: boolean) => void; onRemoveAvatar: (id: number) => void }) {
  return <section className="mt-8"><div className="mb-4"><h2 className="text-2xl font-black">Manage users</h2><p className="mt-1 text-sm text-slate-500">Moderate access without browser prompts.</p></div><Card className="overflow-hidden border-0 shadow-sm"><div className="hidden grid-cols-[1fr_120px_110px_220px] gap-4 border-b px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 md:grid"><span>Contributor</span><span>Role</span><span>Status</span><span>Actions</span></div>{users.map(item => <div key={item.id} className="grid gap-4 border-b px-5 py-4 last:border-0 md:grid-cols-[1fr_120px_110px_220px] md:items-center"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-orange-100 font-black text-orange-700">{item.image ? <img src={item.image} alt="" className="size-full object-cover" /> : item.name?.[0] || "?"}</div><div><p className="font-bold">{item.name || "Unnamed commuter"}</p><p className="text-xs text-slate-500">{item.email || "No email"}</p></div></div><Badge className="w-fit rounded-full bg-slate-100 text-slate-700">{item.role}</Badge><Badge className={`w-fit rounded-full ${item.isBanned ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>{item.isBanned ? "Banned" : "Active"}</Badge><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => onBan(item.id, !item.isBanned)}>{item.isBanned ? <Check className="mr-1 size-3" /> : <Ban className="mr-1 size-3" />}{item.isBanned ? "Unban" : "Ban"}</Button>{item.image && <Button size="sm" variant="ghost" onClick={() => onRemoveAvatar(item.id)}><X className="mr-1 size-3" />Avatar</Button>}</div></div>)}</Card></section>;
}

function LocationsTable({ locations, onApprove, onReject }: { locations: Array<{ id: number; name: string; type: string; createdAt: Date }>; onApprove: (id: number) => void; onReject: (id: number) => void }) {
  return <section className="mt-8"><h2 className="text-2xl font-black">Manage locations</h2><p className="mt-1 text-sm text-slate-500">Review places suggested by the community.</p><Card className="mt-4 overflow-hidden border-0 shadow-sm"><div className="grid grid-cols-[1fr_120px_160px] gap-4 border-b px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400"><span>Location</span><span>Type</span><span>Review</span></div>{locations.length ? locations.map(location => <div key={location.id} className="grid grid-cols-[1fr_120px_160px] items-center gap-4 border-b px-5 py-4 last:border-0"><div><p className="font-bold">{location.name}</p><p className="text-xs text-slate-500">Suggested by community</p></div><Badge className="w-fit rounded-full bg-orange-100 text-orange-700">{location.type}</Badge><div className="flex gap-2"><Button size="sm" onClick={() => onApprove(location.id)}><Check className="mr-1 size-3" />Approve</Button><Button size="sm" variant="ghost" onClick={() => onReject(location.id)}><Trash2 className="mr-1 size-3" />Reject</Button></div></div>) : <p className="p-8 text-center text-sm text-slate-500">No unverified locations waiting.</p>}</Card></section>;
}

function TicketsTable({ tickets }: { tickets: Array<{ id: number; issueDesc: string; status: string; urgency: string; locationName: string | null; upvoteCount: number }> }) {
  return <section className="mt-8"><h2 className="text-2xl font-black">Triage queue</h2><p className="mt-1 text-sm text-slate-500">A scan-friendly view of active community reports.</p><Card className="mt-4 overflow-hidden border-0 shadow-sm">{tickets.length ? tickets.map(ticket => <div key={ticket.id} className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 last:border-0"><div><p className="font-bold">{ticket.issueDesc}</p><p className="mt-1 text-xs text-slate-500">{ticket.locationName || "Unknown location"} · {ticket.upvoteCount} support</p></div><div className="flex gap-2"><Badge className="rounded-full bg-orange-100 text-orange-700">{ticket.urgency}</Badge><Badge className="rounded-full bg-slate-100 text-slate-700">{ticket.status}</Badge></div></div>) : <p className="p-8 text-center text-sm text-slate-500">No active tickets.</p>}</Card></section>;
}

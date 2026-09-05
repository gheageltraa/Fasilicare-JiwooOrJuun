import React from "react";
import { ArrowLeft, BusFront, Wrench } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload, Footer, Navbar } from "@/components/FasiliCareShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { toast } from "sonner";
import AdminDashboard from "./AdminDashboard";

export function Admin() { return <AdminDashboard />; }

function TechGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "tech") return <><Navbar /><main className="mx-auto max-w-xl px-5 py-24 text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-orange-100 text-orange-600"><Wrench /></div><h1 className="mt-5 text-3xl font-black">Technician access required</h1><Link href="/" className="mt-6 inline-block text-sm font-bold text-orange-600">Return to community</Link></main></>;
  return <>{children}</>;
}

export function Tech() {
  const utils = trpc.useUtils();
  const query = trpc.tickets.tasks.useQuery();
  const start = trpc.tickets.startRepair.useMutation({ onSuccess: () => { toast.success("Repair started"); utils.tickets.tasks.invalidate(); }, onError: error => toast.error(error.message) });
  const resolve = trpc.tickets.resolve.useMutation({ onSuccess: () => { toast.success("Ticket resolved"); utils.tickets.tasks.invalidate(); }, onError: error => toast.error(error.message) });
  return <TechGate><div className="min-h-screen bg-[#fffaf2]"><Navbar /><main className="mx-auto max-w-6xl px-5 py-10"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft className="size-4" /> Community</Link><div className="mt-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Operations / field team</p><h1 className="mt-2 text-4xl font-black tracking-tight">Today&apos;s task board</h1><p className="mt-2 text-slate-600">Start each repair, then close the loop with a live proof photo.</p></div>{query.isLoading ? <p className="mt-8 text-center text-slate-500">Loading task board...</p> : query.isError ? <p className="mt-8 text-center text-red-700">Task board could not be loaded.</p> : <div className="mt-8 grid gap-5 lg:grid-cols-2">{query.data?.map(ticket => <TechCard key={ticket.id} ticket={ticket} onStart={() => start.mutate({ ticketId: ticket.id })} onResolve={input => resolve.mutate(input)} />)}{!query.data?.length && <div className="col-span-full rounded-3xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center"><BusFront className="mx-auto size-10 text-orange-400" /><p className="mt-3 font-black text-[#102a43]">No active work orders right now.</p></div>}</div>}</main><Footer /></div></TechGate>;
}

function TechCard({ ticket, onStart, onResolve }: { ticket: any; onStart: () => void; onResolve: (input: { ticketId: number; proofUrl: string }) => void }) {
  const [proof, setProof] = React.useState("");
  return <div className="rounded-3xl bg-white p-5 shadow-[0_8px_35px_rgba(16,42,67,.07)]"><div className="flex items-center justify-between"><Badge className="rounded-full bg-slate-100 text-slate-700">{ticket.status.replace("_", " ").toUpperCase()}</Badge><span className="text-xs font-bold text-slate-400">#{ticket.id}</span></div><img src={ticket.photoUrl} alt="Reported issue" className="mt-4 h-44 w-full rounded-2xl object-cover" /><h2 className="mt-4 font-bold leading-6">{ticket.issueDesc}</h2><p className="mt-2 text-sm font-semibold text-slate-500">{ticket.locationName} · {ticket.urgency.toUpperCase()} priority</p><div className="mt-5">{ticket.status === "approved" && <Button onClick={onStart} className="w-full rounded-xl bg-orange-500 py-5 font-bold text-white hover:bg-orange-600">Start Repair</Button>}{ticket.status === "in_progress" && <><CloudinaryUpload label={proof ? "Proof ready · upload another" : "Upload live proof"} onUploaded={setProof} />{proof && <Button onClick={() => onResolve({ ticketId: ticket.id, proofUrl: proof })} className="mt-3 w-full rounded-xl bg-[#102a43] py-5 font-bold text-white">Finish Repair</Button>}</>}</div></div>;
}

export function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const demo = trpc.auth.demoLogin.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); navigate("/"); }, onError: error => toast.error(error.message) });
  return <div className="min-h-screen bg-[#102a43] px-5 py-10 text-white"><div className="mx-auto flex min-h-[80vh] max-w-5xl items-center"><div className="grid w-full overflow-hidden rounded-4xl bg-white text-[#102a43] shadow-2xl md:grid-cols-2"><div className="bg-orange-500 p-8 sm:p-12"><Link href="/" className="text-sm font-bold text-white/80">← FasiliCare</Link><div className="mt-24"><p className="text-sm font-black uppercase tracking-[0.2em] text-orange-950/60">Public transport care</p><h1 className="mt-3 text-5xl font-black leading-none text-white">Make the ride<br />better.</h1><p className="mt-5 max-w-xs leading-7 text-orange-950/75">One clear report can move a whole team.</p></div></div><div className="p-8 sm:p-12"><div className="grid size-12 place-items-center rounded-2xl bg-[#102a43] text-2xl text-orange-400">✦</div><h2 className="mt-10 text-3xl font-black">Welcome to FasiliCare</h2><p className="mt-2 text-slate-600">Sign in with Google, or use a ready-made demo role.</p><Button onClick={startLogin} className="mt-8 w-full rounded-xl bg-[#102a43] py-6 font-bold text-white">Login with Google</Button><div className="my-7 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Hackathon Demo Mode</div><div className="grid gap-3">{([["admin", "Login as Admin"], ["user", "Login as Commuter"], ["tech", "Login as Technician"]] as const).map(([role, label]) => <Button key={role} disabled={demo.isPending} onClick={() => demo.mutate({ role })} variant="outline" className="rounded-xl py-5 font-bold">{label}</Button>)}</div></div></div></div></div>;
}

import { ArrowLeft, Award, Flag, MapPin } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Footer, Navbar } from "@/components/FasiliCareShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function PublicProfile() {
  const [, params] = useRoute("/profile/:id");
  const userId = Number(params?.id);
  const { isAuthenticated } = useAuth();
  const q = trpc.publicProfiles.detail.useQuery({ userId }, { enabled: Number.isInteger(userId) });
  const report = trpc.publicProfiles.report.useMutation({ onSuccess: () => toast.success("Report sent to FasiliCare admins"), onError: error => toast.error(error.message) });
  if (q.isLoading) return <><Navbar /><main className="mx-auto max-w-3xl px-5 py-20 text-center text-slate-500">Loading public profile...</main><Footer /></>;
  if (q.isError || !q.data) return <><Navbar /><main className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="text-2xl font-black">Profile not found</h1><Link href="/" className="mt-4 inline-block font-bold text-orange-600">Back to community</Link></main><Footer /></>;
  const points = q.data.reputation;
  const level = points >= 500 ? "FasiliCare Master" : points >= 300 ? "Community Guardian" : points >= 100 ? "Active Commuter" : "Rookie Reporter";
  const reports = q.data.reports.filter(ticket => ticket.status !== "resolved");
  return <div className="min-h-screen bg-[#fffaf2] text-[#102a43]"><Navbar /><main className="mx-auto max-w-3xl px-5 py-10"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft className="size-4" /> Community</Link><section className="mt-8 rounded-3xl bg-[#102a43] p-8 text-white"><div className="flex flex-wrap items-start justify-between gap-5"><div className="flex items-center gap-4">{q.data.image ? <img src={q.data.image} alt={q.data.name || "Profile"} className="size-20 rounded-3xl object-cover" /> : <div className="grid size-20 place-items-center rounded-3xl bg-orange-500 text-3xl font-black">{q.data.name?.[0] || "C"}</div>}<div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Public commuter profile</p><h1 className="mt-2 text-3xl font-black">{q.data.name || "Commuter"}</h1><p className="mt-1 text-slate-300">{q.data.role.toUpperCase()} · {level} · {points} points</p></div></div>{isAuthenticated && <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => report.mutate({ userId, reason: "Community profile report" })}><Flag className="mr-2 size-4" />Report user</Button>}</div><div className="mt-6 flex items-center gap-2 text-sm text-slate-300"><Award className="size-4 text-orange-300" /> Community contributor</div></section><section className="mt-6"><h2 className="text-2xl font-black">Public reports</h2><div className="mt-4 space-y-3">{reports.map(ticket => <Link key={ticket.id} href={`/ticket/${ticket.id}`} className="block rounded-2xl bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center gap-2"><Badge className="rounded-full bg-orange-100 text-orange-700">{ticket.status.toUpperCase()}</Badge><Badge className="rounded-full bg-slate-100 text-slate-600">{ticket.urgency.toUpperCase()}</Badge></div><p className="mt-3 font-bold">{ticket.issueDesc}</p><p className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-500"><MapPin className="size-3 text-orange-500" />{ticket.locationName} · {ticket.upvoteCount} support</p></Link>)}{!reports.length && <p className="rounded-2xl border border-dashed border-orange-200 p-6 text-center text-slate-500">No active public reports.</p>}</div></section></main><Footer /></div>;
}

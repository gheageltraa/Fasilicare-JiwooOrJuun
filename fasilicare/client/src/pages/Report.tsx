import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Footer, Navbar, CloudinaryUpload } from "@/components/FasiliCareShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { filterLocations } from "@/lib/locations";
import { toast } from "sonner";

const categories = ["AC", "Elevator", "Door", "Lighting", "Seat", "Toilet", "Escalator", "Other"] as const;

export default function Report() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const locations = trpc.locations.list.useQuery();
  const [query, setQuery] = useState("");
  const [locationId, setLocationId] = useState<number>();
  const [locationLabel, setLocationLabel] = useState("");
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Other");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "critical">("low");
  const createLocation = trpc.locations.create.useMutation();
  const create = trpc.tickets.create.useMutation({ onSuccess: () => { toast.success("Report submitted to the community"); navigate("/"); }, onError: e => toast.error(e.message) });
  const filtered = useMemo(() => filterLocations(locations.data ?? [], query), [locations.data, query]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!locationId || !photoUrl) return toast.error("Choose a location and upload a photo first.");
    if (desc.trim().length < 12) return toast.error("Please add at least 12 characters of detail.");
    create.mutate({ issueDesc: desc, photoUrl, locationId, category, urgency });
  };
  const chooseCustom = async () => {
    const name = query.trim();
    if (name.length < 2) return;
    try {
      const location = await createLocation.mutateAsync({ name, type: "Custom" });
      setLocationId(location.id); setLocationLabel(location.name); setOpen(false); setQuery("");
      toast.success("Custom location added for admin review");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create location"); }
  };

  if (!isAuthenticated) return <><Navbar /><div className="mx-auto max-w-lg px-5 py-20 text-center"><h1 className="text-3xl font-black">Sign in to report an issue</h1><p className="mt-2 text-slate-600">A verified account helps keep community reports trustworthy.</p></div></>;
  return <div className="min-h-screen bg-[#fffaf2] text-[#102a43]"><Navbar /><main className="mx-auto max-w-3xl px-5 py-10"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600"><ArrowLeft className="size-4" /> Back to community reports</Link><div className="mt-8 max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">New report</p><h1 className="mt-2 text-4xl font-black tracking-tight">Found a facility that needs care?</h1><p className="mt-3 leading-7 text-slate-600">Provide enough context for the maintenance team to act quickly. A clear photo helps guide the response.</p><form onSubmit={submit} className="mt-8 space-y-6"><div><label className="mb-2 block text-sm font-bold">Where is the issue?</label><Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="outline" role="combobox" className="h-12 w-full justify-between rounded-xl border-orange-100 bg-white px-4 font-semibold text-[#102a43]"><span className="flex items-center gap-2 truncate"><MapPin className="size-4 text-orange-500" />{locationLabel || "Search stations, stops, or transit lines"}</span><ChevronsUpDown className="size-4 text-slate-400" /></Button></PopoverTrigger><PopoverContent className="w-[min(600px,calc(100vw-2.5rem))] p-0"><Command><CommandInput placeholder="Type a station or stop..." value={query} onValueChange={value => { setQuery(value); setLocationId(undefined); setLocationLabel(""); }} /><CommandList><CommandEmpty>No verified location found.</CommandEmpty><CommandGroup heading="Verified transit locations">{filtered.map(location => <CommandItem key={location.id} value={`${location.name} ${location.type}`} onSelect={() => { setLocationId(location.id); setLocationLabel(location.name); setQuery(""); setOpen(false); }}><Check className={`size-4 ${locationId === location.id ? "opacity-100" : "opacity-0"}`} /><span>{location.name}</span><span className="ml-auto text-xs text-slate-400">{location.type}</span></CommandItem>)}</CommandGroup>{query.trim().length > 1 && !filtered.some(location => location.name.toLowerCase() === query.trim().toLowerCase()) && <CommandGroup heading="Community suggestion"><CommandItem value={`create ${query}`} onSelect={() => void chooseCustom()}><span className="font-bold text-orange-600">Create custom location: “{query.trim()}”</span></CommandItem></CommandGroup>}</CommandList></Command></PopoverContent></Popover><p className="mt-2 text-xs text-slate-500">New places are sent to admins for verification.</p></div><div><label className="mb-2 block text-sm font-bold">What needs attention?</label><Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what commuters should know..." className="min-h-32 rounded-xl border-orange-100 bg-white" /></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Category<select value={category} onChange={e => setCategory(e.target.value as (typeof categories)[number])} className="mt-2 h-11 w-full rounded-xl border border-orange-100 bg-white px-3 font-semibold">{categories.map(item => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-bold">Urgency<select value={urgency} onChange={e => setUrgency(e.target.value as typeof urgency)} className="mt-2 h-11 w-full rounded-xl border border-orange-100 bg-white px-3 font-semibold"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label></div><CloudinaryUpload label={photoUrl ? "Evidence ready · upload another" : "Upload evidence photo"} onUploaded={setPhotoUrl} /><Button type="submit" disabled={create.isPending || createLocation.isPending} className="w-full rounded-xl bg-orange-500 py-6 font-black text-white hover:bg-orange-600">Submit community report</Button></form></div></main><Footer /></div>;
}

import React from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Award,
  BusFront,
  KeyRound,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";
import { CloudinaryUpload, Footer, Navbar } from "@/components/FasiliCareShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Echoes() {
  const locations = trpc.locations.list.useQuery();
  const [locationId, setLocationId] = React.useState<number>();
  const [search, setSearch] = React.useState("");
  const [date, setDate] = React.useState("");
  const archive = trpc.tickets.resolved.useQuery();
  const rows =
    archive.data?.filter(
      ticket =>
        (!locationId || ticket.locationId === locationId) &&
        ticket.issueDesc.toLowerCase().includes(search.toLowerCase()) &&
        (!date ||
          new Date(ticket.updatedAt).toISOString().slice(0, 10) === date)
    ) ?? [];
  if (archive.isLoading || locations.isLoading)
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-5xl px-5 py-20 text-center text-slate-500">
          Loading resolved echoes…
        </main>
        <Footer />
      </>
    );
  if (archive.isError || locations.isError)
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-5xl px-5 py-20 text-center text-red-700">
          The resolved archive could not be loaded. Please refresh and try
          again.
        </main>
        <Footer />
      </>
    );
  return (
    <div className="min-h-screen bg-[#fffaf2] text-[#102a43]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
        >
          <ArrowLeft className="size-4" /> Community
        </Link>
        <div className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
            Resolved archive
          </p>
          <h1 className="mt-2 text-4xl font-black">
            Echoes of a better commute
          </h1>
          <p className="mt-2 text-slate-600">
            See the issues the community helped move from report to resolution.
          </p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resolved reports"
              className="h-11 rounded-xl border-orange-100 bg-white pl-10"
            />
          </div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="h-11 rounded-xl border border-orange-100 bg-white px-3 text-sm font-semibold"
          />
          <select
            value={locationId ?? "all"}
            onChange={e =>
              setLocationId(
                e.target.value === "all" ? undefined : Number(e.target.value)
              )
            }
            className="h-11 rounded-xl border border-orange-100 bg-white px-3 text-sm font-semibold"
          >
            <option value="all">All locations</option>
            {locations.data?.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {rows.map(ticket => (
            <Link
              key={ticket.id}
              href={`/ticket/${ticket.id}`}
              className="block overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={ticket.proofUrl || ticket.photoUrl}
                alt="Resolved ticket"
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <p className="text-xs font-bold text-emerald-600">
                  RESOLVED · {new Date(ticket.updatedAt).toLocaleDateString()}
                </p>
                <h2 className="mt-2 font-bold">{ticket.issueDesc}</h2>
                <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="size-4 text-orange-500" />
                  {ticket.locationName}
                </p>
                <p className="mt-3 text-xs font-bold text-orange-600">
                  Open full detail and discussion →
                </p>
              </div>
            </Link>
          ))}
          {!rows.length && (
            <div className="col-span-full rounded-3xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
              <BusFront className="mx-auto size-10 text-orange-400" />
              <p className="mt-3 font-black text-[#102a43]">
                No resolved incidents match these filters yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Smooth travels ahead—try another station or search term.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Profile() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const profile = trpc.user.profile.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const mine = trpc.tickets.mine.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const updateImage = trpc.user.updateImage.useMutation({
    onSuccess: () => {
      toast.success("Profile picture updated");
      utils.user.profile.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const [username, setUsername] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  React.useEffect(() => {
    if (profile.data?.username) setUsername(profile.data.username);
  }, [profile.data?.username]);
  const updateUsername = trpc.user.updateUsername.useMutation({
    onSuccess: () => {
      toast.success("Username updated");
      utils.user.profile.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const changePassword = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: error => toast.error(error.message),
  });
  if (!isAuthenticated)
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-xl px-5 py-20 text-center">
          <h1 className="text-3xl font-black">Sign in to see your profile</h1>
        </main>
        <Footer />
      </>
    );
  if (profile.isLoading)
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-xl px-5 py-20 text-center text-slate-500">
          Loading profile…
        </main>
        <Footer />
      </>
    );
  if (profile.isError || !profile.data)
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-xl px-5 py-20 text-center text-red-700">
          Your profile could not be loaded. Please refresh and try again.
        </main>
        <Footer />
      </>
    );
  const points = profile.data.reputation;
  const level =
    points >= 500
      ? "👑 FasiliCare Master"
      : points >= 300
        ? "🛡️ Community Guardian"
        : points >= 100
          ? "🔎 Active Commuter"
          : "🌱 Rookie Reporter";
  const displayUsername = username || profile.data.username || "";
  return (
    <div className="min-h-screen bg-[#fffaf2] text-[#102a43]">
      <Navbar />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
        >
          <ArrowLeft className="size-4" /> Community
        </Link>
        <section className="mt-8 rounded-3xl bg-[#102a43] p-8 text-white">
          <div className="flex items-center gap-5">
            {profile.data.image ? (
              <img
                src={profile.data.image}
                alt="Google profile"
                className="size-20 rounded-3xl object-cover"
              />
            ) : (
              <div className="grid size-20 place-items-center rounded-3xl bg-orange-500 text-3xl font-black">
                {profile.data.name?.[0] || "C"}
              </div>
            )}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
                Your commuter profile
              </p>
              <h1 className="mt-2 text-3xl font-black">
                {profile.data.name || "Commuter"}
              </h1>
              <p className="mt-1 text-slate-300">{profile.data.email}</p>
            </div>
          </div>
          <div className="mt-5">
            <CloudinaryUpload
              label="Edit profile picture"
              onUploaded={image => updateImage.mutate({ image })}
            />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <Award className="size-5 text-orange-400" />
              <p className="mt-3 text-2xl font-black">{points}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Reputation points
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-2xl font-black">{level}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-300">
                Current level
              </p>
            </div>
          </div>
        </section>
        <section className="mt-5 grid gap-5 md:grid-cols-2">
          <form className="rounded-3xl border border-orange-100 bg-white p-6" onSubmit={event => { event.preventDefault(); updateUsername.mutate({ username }); }}>
            <h2 className="text-xl font-black">Your username</h2>
            <p className="mt-1 text-sm text-slate-500">This is how other commuters find you.</p>
            <Label htmlFor="profile-username" className="mt-5 block">Username</Label>
            <Input id="profile-username" value={displayUsername} onChange={event => setUsername(event.target.value)} className="mt-2" minLength={3} required />
            <Button className="mt-4 w-full bg-orange-500" disabled={updateUsername.isPending}>Save username</Button>
          </form>
          <form className="rounded-3xl border border-orange-100 bg-white p-6" onSubmit={event => { event.preventDefault(); if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; } changePassword.mutate({ currentPassword, newPassword }); }}>
            <h2 className="text-xl font-black">Change password</h2>
            <p className="mt-1 text-sm text-slate-500">Use at least 8 characters.</p>
            <Label htmlFor="current-password" className="mt-5 block">Current password</Label><Input id="current-password" type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className="mt-2" required />
            <Label htmlFor="new-password" className="mt-4 block">New password</Label><Input id="new-password" type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} className="mt-2" minLength={8} required />
            <Label htmlFor="confirm-password" className="mt-4 block">Confirm new password</Label><Input id="confirm-password" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="mt-2" minLength={8} required />
            <Button className="mt-4 w-full bg-[#102a43]" disabled={changePassword.isPending}>Update password</Button>
          </form>
        </section>
        <section className="mt-5 rounded-3xl border border-orange-100 bg-white p-6">
          <h2 className="text-xl font-black">How to earn points</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Earn <strong>+10 points</strong> when you submit a useful report. If
            the maintenance team resolves it, you receive an additional{" "}
            <strong>+50 points</strong>. Clear photos and specific details help
            the team act faster.
          </p>
          <h3 className="mt-6 text-lg font-black">Reputation levels</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <p>
              🌱 <strong>Rookie Reporter</strong> · 0–99 points
            </p>
            <p>
              🔎 <strong>Active Commuter</strong> · 100–299 points
            </p>
            <p>
              🛡️ <strong>Community Guardian</strong> · 300–499 points
            </p>
            <p>
              👑 <strong>FasiliCare Master</strong> · 500+ points
            </p>
          </div>
        </section>
        <section className="mt-5 rounded-3xl border border-orange-100 bg-white p-6">
          <h2 className="text-xl font-black">My reports</h2>
          {mine.isLoading ? (
            <p className="mt-3 text-sm text-slate-500">
              Loading your report timeline…
            </p>
          ) : mine.isError ? (
            <p className="mt-3 text-sm text-red-700">
              Your report history could not be loaded.
            </p>
          ) : mine.data?.length ? (
            <div className="mt-4 space-y-3">
              {mine.data.map(ticket => {
                const stages = [
                  "pending",
                  "approved",
                  "in_progress",
                  "resolved",
                ];
                const current = stages.indexOf(ticket.status);
                return (
                  <Link
                    key={ticket.id}
                    href={`/ticket/${ticket.id}`}
                    className="block rounded-2xl bg-orange-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span>
                        <strong className="block text-sm">
                          {ticket.issueDesc}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {ticket.locationName} ·{" "}
                          {new Date(ticket.createdAt).toLocaleString()}
                        </span>
                      </span>
                      <span className="text-xs font-black text-orange-700">
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-1">
                      {stages.map((stage, index) => (
                        <div key={stage}>
                          <div
                            className={`h-2 rounded-full ${index <= current ? "bg-orange-500" : "bg-orange-100"}`}
                          />
                          <p className="mt-1 text-[9px] font-bold uppercase text-slate-500">
                            {stage === "in_progress" ? "IN PROGRESS" : stage}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                      {ticket.startedAt && (
                        <span>
                          Started At ·{" "}
                          {new Date(ticket.startedAt).toLocaleString()}
                        </span>
                      )}
                      {ticket.resolvedAt && (
                        <span>
                          Resolved At ·{" "}
                          {new Date(ticket.resolvedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No reports submitted yet.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

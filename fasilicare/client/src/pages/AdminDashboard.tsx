import React from "react";
import {
  Ban,
  Check,
  KeyRound,
  LayoutDashboard,
  MapPin,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Ticket,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Tab = "overview" | "users" | "locations" | "tickets";
const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Manage Users", icon: UserRound },
  { id: "locations", label: "Manage Locations", icon: MapPin },
  { id: "tickets", label: "Triage Queue", icon: Ticket },
];
const categories = [
  "AC",
  "Elevator",
  "Door",
  "Lighting",
  "Seat",
  "Toilet",
  "Escalator",
  "Other",
] as const;
const statuses = ["pending", "approved", "assigned", "in_progress", "resolved"] as const;
const urgencies = ["low", "medium", "high", "critical"] as const;

type Props = { initialTab?: Tab };
export default function AdminDashboard({ initialTab = "overview" }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = React.useState<Tab>(initialTab);
  const utils = trpc.useUtils();
  const users = trpc.admin.users.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const tickets = trpc.admin.tickets.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const locations = trpc.locations.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const analytics = trpc.analytics.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const refreshUsers = () => utils.admin.users.invalidate();
  const refreshLocations = () => {
    utils.locations.list.invalidate();
    utils.locations.unverified.invalidate();
  };
  const refreshTickets = () => {
    utils.admin.tickets.invalidate();
    utils.tickets.feed.invalidate();
  };
  const onError = (error: { message: string }) => toast.error(error.message);
  const ban = trpc.admin.banUser.useMutation({
    onSuccess: refreshUsers,
    onError,
  });
  const removeAvatar = trpc.admin.removeAvatar.useMutation({
    onSuccess: refreshUsers,
    onError,
  });
  const updateUser = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("User updated");
      refreshUsers();
    },
    onError,
  });
  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted");
      refreshUsers();
    },
    onError,
  });
  const changePassword = trpc.auth.adminPassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated");
      refreshUsers();
    },
    onError,
  });
  const createLocation = trpc.locations.create.useMutation({
    onSuccess: () => {
      toast.success("Location created");
      refreshLocations();
    },
    onError,
  });
  const updateLocation = trpc.locations.update.useMutation({
    onSuccess: () => {
      toast.success("Location updated");
      refreshLocations();
    },
    onError,
  });
  const deleteLocation = trpc.locations.remove.useMutation({
    onSuccess: () => {
      toast.success("Location deleted");
      refreshLocations();
    },
    onError,
  });
  const editTicket = trpc.admin.editTicket.useMutation({
    onSuccess: () => {
      toast.success("Ticket updated");
      refreshTickets();
    },
    onError,
  });
  const deleteTicket = trpc.admin.deleteTicket.useMutation({
    onSuccess: () => {
      toast.success("Ticket deleted");
      refreshTickets();
    },
    onError,
  });
  if (user?.role !== "admin")
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <ShieldCheck className="mx-auto size-12 text-orange-500" />
        <h1 className="mt-5 text-3xl font-black">Admin access required</h1>
        <Link href="/" className="mt-4 inline-block font-bold text-orange-600">
          Return home
        </Link>
      </main>
    );
  const openTickets =
    tickets.data?.filter(item => item.status !== "resolved").length ?? 0;
  const bannedUsers = users.data?.filter(item => item.isBanned).length ?? 0;
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#102a43]">
      <div className="mx-auto flex max-w-375 gap-0 lg:p-5">
        <aside className="hidden w-64 shrink-0 flex-col rounded-4xl bg-[#102a43] p-5 text-white lg:flex">
          <Link
            href="/"
            className="flex items-center gap-3 border-b border-white/10 pb-6"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-orange-500 text-xl">
              ✦
            </span>
            <span>
              <strong className="block text-lg">FasiliCare</strong>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">
                control room
              </span>
            </span>
          </Link>
          <p className="mt-8 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Moderation
          </p>
          <nav className="mt-3 space-y-1">
            {tabs.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${tab === item.id ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">Signed in as</p>
            <p className="mt-1 truncate font-bold">{user.email || user.name}</p>
            <Link
              href="/"
              className="mt-3 block text-xs font-bold text-orange-300"
            >
              Back to community
            </Link>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-5 lg:px-8 lg:py-4">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                FasiliCare / admin
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Keep the city moving.
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Create, review, edit, and remove every operational record.
              </p>
            </div>
            <div className="flex gap-2 lg:hidden">
              {tabs.map(item => (
                <Button
                  key={item.id}
                  size="icon"
                  variant={tab === item.id ? "default" : "outline"}
                  title={item.label}
                  onClick={() => setTab(item.id)}
                >
                  <item.icon className="size-4" />
                </Button>
              ))}
            </div>
          </header>
          {tab === "overview" && (
            <Overview
              openTickets={openTickets}
              users={users.data?.length ?? 0}
              bannedUsers={bannedUsers}
              locations={locations.data?.length ?? 0}
              resolved={analytics.data?.resolved ?? 0}
            />
          )}
          {tab === "users" && (
            <UsersTable
              users={users.data ?? []}
              onBan={(id, value) => ban.mutate({ userId: id, isBanned: value })}
              onRemoveAvatar={id => removeAvatar.mutate({ userId: id })}
              onUpdate={input => updateUser.mutate(input)}
              onDelete={id => deleteUser.mutate({ userId: id })}
              onChangePassword={(userId, password) =>
                changePassword.mutate({ userId, password })
              }
            />
          )}
          {tab === "locations" && (
            <LocationsTable
              locations={locations.data ?? []}
              onCreate={input => createLocation.mutate(input)}
              onUpdate={input => updateLocation.mutate(input)}
              onDelete={id => deleteLocation.mutate({ locationId: id })}
            />
          )}
          {tab === "tickets" && (
            <TicketsTable
              tickets={tickets.data ?? []}
              onUpdate={input => editTicket.mutate(input)}
              onDelete={id => deleteTicket.mutate({ ticketId: id })}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function Overview({
  openTickets,
  users,
  bannedUsers,
  locations,
  resolved,
}: {
  openTickets: number;
  users: number;
  bannedUsers: number;
  locations: number;
  resolved: number;
}) {
  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Open queue", openTickets, "Needs attention", "text-orange-600"],
          ["Contributors", users, "Community members", "text-[#102a43]"],
          ["Resolved", resolved, "Closed successfully", "text-emerald-600"],
          [
            "Locations",
            locations,
            `${bannedUsers} banned accounts`,
            "text-rose-600",
          ],
        ].map(([label, value, detail, color]) => (
          <Card key={label as string} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-bold text-slate-500">{label}</p>
              <p className={`mt-3 text-4xl font-black ${color}`}>{value}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">
                {detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Moderation pulse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="font-bold">Trust is a product feature.</p>
              <p className="mt-1 text-sm text-slate-500">
                Every row is editable, auditable, and reversible where it
                matters.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[#102a43] text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Edit roles and reputation</p>
            <p>• Approve or remove locations</p>
            <p>• Clean up spam tickets</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

type UserRow = {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "admin" | "tech";
  image: string | null;
  reputationPoints: number;
  isBanned: boolean;
};
function UsersTable({
  users,
  onBan,
  onRemoveAvatar,
  onUpdate,
  onDelete,
  onChangePassword,
}: {
  users: UserRow[];
  onBan: (id: number, value: boolean) => void;
  onRemoveAvatar: (id: number) => void;
  onUpdate: (input: {
    userId: number;
    role?: "user" | "admin" | "tech";
    reputationPoints?: number;
  }) => void;
  onDelete: (id: number) => void;
  onChangePassword: (userId: number, password: string) => void;
}) {
  const [drafts, setDrafts] = React.useState<
    Record<number, { role: UserRow["role"]; points: string }>
  >({});
  const [passwordUser, setPasswordUser] = React.useState<UserRow | null>(null);
  const [password, setPassword] = React.useState("");
  const draft = (item: UserRow) =>
    drafts[item.id] ?? {
      role: item.role,
      points: String(item.reputationPoints ?? 0),
    };
  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-black">Manage users</h2>
        <p className="mt-1 text-sm text-slate-500">
          Roles, reputation, bans, avatars, and deletion in one table.
        </p>
      </div>
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="hidden grid-cols-[1fr_110px_110px_260px] gap-4 border-b px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 md:grid">
          <span>Contributor</span>
          <span>Role</span>
          <span>Reputation</span>
          <span>Actions</span>
        </div>
        {users.map(item => {
          const value = draft(item);
          return (
            <div
              key={item.id}
              className="grid gap-4 border-b px-5 py-4 last:border-0 md:grid-cols-[1fr_110px_110px_260px] md:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-orange-100 font-black text-orange-700">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    item.name?.[0] || "?"
                  )}
                </div>
                <div>
                  <p className="font-bold">{item.name || "Unnamed commuter"}</p>
                  <p className="text-xs text-slate-500">
                    {item.email || "No email"}
                  </p>
                  <Badge
                    className={`mt-1 rounded-full ${item.isBanned ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {item.isBanned ? "Banned" : "Active"}
                  </Badge>
                </div>
              </div>
              <select
                aria-label={`Role for ${item.name || item.id}`}
                value={value.role}
                onChange={event =>
                  setDrafts(current => ({
                    ...current,
                    [item.id]: {
                      ...value,
                      role: event.target.value as UserRow["role"],
                    },
                  }))
                }
                className="h-9 rounded-lg border border-orange-100 bg-white px-2 text-sm font-bold"
              >
                <option value="user">USER</option>
                <option value="admin">ADMIN</option>
                <option value="tech">TECH</option>
              </select>
              <Input
                value={value.points}
                onChange={event =>
                  setDrafts(current => ({
                    ...current,
                    [item.id]: { ...value, points: event.target.value },
                  }))
                }
                className="h-9"
                type="number"
                aria-label={`Reputation for ${item.name || item.id}`}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    onUpdate({
                      userId: item.id,
                      role: value.role,
                      reputationPoints: Math.max(0, Number(value.points) || 0),
                    })
                  }
                >
                  <Save className="mr-1 size-3" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPasswordUser(item);
                    setPassword("");
                  }}
                >
                  <KeyRound className="mr-1 size-3" />
                  Change password
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBan(item.id, !item.isBanned)}
                >
                  {item.isBanned ? (
                    <Check className="mr-1 size-3" />
                  ) : (
                    <Ban className="mr-1 size-3" />
                  )}
                  {item.isBanned ? "Unban" : "Ban"}
                </Button>
                {item.image && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveAvatar(item.id)}
                  >
                    <X className="mr-1 size-3" />
                    Avatar
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="mr-1 size-3" />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </Card>
      <Dialog
        open={!!passwordUser}
        onOpenChange={open => !open && setPasswordUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change user password</DialogTitle>
            <DialogDescription>
              Set a new password for {passwordUser?.name || "this account"}.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            minLength={8}
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordUser(null)}>
              Cancel
            </Button>
            <Button
              disabled={password.length < 8 || !passwordUser}
              onClick={() => passwordUser && onChangePassword(passwordUser.id, password)}
            >
              Update password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

type LocationRow = {
  id: number;
  name: string;
  type: string;
  isVerified: boolean;
};
function LocationsTable({
  locations,
  onCreate,
  onUpdate,
  onDelete,
}: {
  locations: LocationRow[];
  onCreate: (input: {
    name: string;
    type: string;
    isVerified: boolean;
  }) => void;
  onUpdate: (input: {
    locationId: number;
    name: string;
    type: string;
    isVerified: boolean;
  }) => void;
  onDelete: (id: number) => void;
}) {
  const [newName, setNewName] = React.useState("");
  const [newType, setNewType] = React.useState("Custom");
  const [drafts, setDrafts] = React.useState<
    Record<number, { name: string; type: string; isVerified: boolean }>
  >({});
  const draft = (item: LocationRow) =>
    drafts[item.id] ?? {
      name: item.name,
      type: item.type,
      isVerified: item.isVerified,
    };
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Manage all locations</h2>
          <p className="mt-1 text-sm text-slate-500">
            Verified and community-created places share one editable table.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            value={newName}
            onChange={event => setNewName(event.target.value)}
            placeholder="New location name"
            className="w-48"
          />
          <Input
            value={newType}
            onChange={event => setNewType(event.target.value)}
            placeholder="Type"
            className="w-28"
          />
          <Button
            onClick={() => {
              if (!newName.trim()) return;
              onCreate({
                name: newName.trim(),
                type: newType.trim() || "Custom",
                isVerified: true,
              });
              setNewName("");
            }}
          >
            <Plus className="mr-1 size-4" />
            Add
          </Button>
        </div>
      </div>
      <Card className="mt-4 overflow-hidden border-0 shadow-sm">
        <div className="hidden grid-cols-[1fr_130px_120px_260px] gap-4 border-b px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 md:grid">
          <span>Location</span>
          <span>Type</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {locations.map(item => {
          const value = draft(item);
          return (
            <div
              key={item.id}
              className="grid gap-3 border-b px-5 py-4 last:border-0 md:grid-cols-[1fr_130px_120px_260px] md:items-center"
            >
              <Input
                value={value.name}
                onChange={event =>
                  setDrafts(current => ({
                    ...current,
                    [item.id]: { ...value, name: event.target.value },
                  }))
                }
              />
              <Input
                value={value.type}
                onChange={event =>
                  setDrafts(current => ({
                    ...current,
                    [item.id]: { ...value, type: event.target.value },
                  }))
                }
              />
              <Badge
                className={`w-fit rounded-full ${value.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}
              >
                {value.isVerified ? "Verified" : "Pending"}
              </Badge>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => onUpdate({ locationId: item.id, ...value })}
                >
                  <Save className="mr-1 size-3" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onUpdate({
                      locationId: item.id,
                      ...value,
                      isVerified: !value.isVerified,
                    })
                  }
                >
                  {value.isVerified ? "Unverify" : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="mr-1 size-3" />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </Card>
    </section>
  );
}

type TicketRow = {
  id: number;
  issueDesc: string;
  category: string | null;
  status: string;
  urgency: string;
  locationName: string | null;
  upvoteCount: number;
};
type TechnicianRow = { id: number; name: string | null; email: string | null };
function TicketsTable({
  tickets,
  onUpdate,
  onDelete,
}: {
  tickets: TicketRow[];
  onUpdate: (input: {
    ticketId: number;
    issueDesc: string;
    category: (typeof categories)[number];
    urgency: (typeof urgencies)[number];
    status: (typeof statuses)[number];
  }) => void;
  onDelete: (id: number) => void;
}) {
  const utils = trpc.useUtils();
  const technicians = trpc.tickets.technicians.useQuery();
  const assign = trpc.tickets.assign.useMutation({
    onSuccess: () => {
      toast.success("Ticket approved and assigned");
      setAssigningTicket(null);
      utils.admin.tickets.invalidate();
      utils.tickets.triage.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const [assigningTicket, setAssigningTicket] = React.useState<TicketRow | null>(null);
  const [technicianId, setTechnicianId] = React.useState("");
  const [drafts, setDrafts] = React.useState<
    Record<
      number,
      {
        issueDesc: string;
        category: (typeof categories)[number];
        urgency: (typeof urgencies)[number];
        status: (typeof statuses)[number];
      }
    >
  >({});
  const draft = (item: TicketRow) =>
    drafts[item.id] ?? {
      issueDesc: item.issueDesc,
      category: (item.category || "Other") as (typeof categories)[number],
      urgency: item.urgency as (typeof urgencies)[number],
      status: item.status as (typeof statuses)[number],
    };
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-black">Triage queue</h2>
      <p className="mt-1 text-sm text-slate-500">
        Edit category, urgency, status, or remove spam reports.
      </p>
      <Card className="mt-4 overflow-hidden border-0 shadow-sm">
        {tickets.length ? (
          tickets.map(item => {
            const value = draft(item);
            return (
              <div
                key={item.id}
                className="grid gap-3 border-b px-5 py-4 last:border-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1">
                    <Input
                      value={value.issueDesc}
                      onChange={event =>
                        setDrafts(current => ({
                          ...current,
                          [item.id]: {
                            ...value,
                            issueDesc: event.target.value,
                          },
                        }))
                      }
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      {item.locationName || "Unknown location"} ·{" "}
                      {item.upvoteCount} support
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#102a43]"
                    onClick={() => onUpdate({ ticketId: item.id, ...value })}
                  >
                    <Pencil className="mr-1 size-3" />
                    Save edit
                  </Button>
                  {(item.status === "pending" || item.status === "approved") && (
                    <Button
                      size="sm"
                      className="bg-orange-500 text-white hover:bg-orange-600"
                      onClick={() => {
                        setAssigningTicket(item);
                        setTechnicianId("");
                      }}
                    >
                      <UserRound className="mr-1 size-3" />
                      Approve &amp; Assign
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="mr-1 size-3" />
                    Delete
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={value.category}
                    onChange={event =>
                      setDrafts(current => ({
                        ...current,
                        [item.id]: {
                          ...value,
                          category: event.target
                            .value as (typeof categories)[number],
                        },
                      }))
                    }
                    className="h-9 rounded-lg border border-orange-100 bg-white px-2 text-sm"
                  >
                    <option value="Other">Other</option>
                    {categories
                      .filter(category => category !== "Other")
                      .map(category => (
                        <option key={category}>{category}</option>
                      ))}
                  </select>
                  <select
                    value={value.urgency}
                    onChange={event =>
                      setDrafts(current => ({
                        ...current,
                        [item.id]: {
                          ...value,
                          urgency: event.target
                            .value as (typeof urgencies)[number],
                        },
                      }))
                    }
                    className="h-9 rounded-lg border border-orange-100 bg-white px-2 text-sm"
                  >
                    {urgencies.map(option => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <select
                    value={value.status}
                    onChange={event =>
                      setDrafts(current => ({
                        ...current,
                        [item.id]: {
                          ...value,
                          status: event.target
                            .value as (typeof statuses)[number],
                        },
                      }))
                    }
                    className="h-9 rounded-lg border border-orange-100 bg-white px-2 text-sm"
                  >
                    {statuses.map(option => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">No tickets.</p>
        )}
      </Card>
      <Dialog open={!!assigningTicket} onOpenChange={open => !open && setAssigningTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve &amp; Assign ticket</DialogTitle>
            <DialogDescription>
              Choose a technician to move this ticket into the assigned queue.
            </DialogDescription>
          </DialogHeader>
          <select
            value={technicianId}
            onChange={event => setTechnicianId(event.target.value)}
            className="h-10 w-full rounded-lg border border-orange-100 bg-white px-3 text-sm font-semibold"
          >
            <option value="">Select a technician</option>
            {technicians.data?.map((technician: TechnicianRow) => (
              <option key={technician.id} value={technician.id}>
                {technician.name || technician.email || `Technician #${technician.id}`}
              </option>
            ))}
          </select>
          {!technicians.isLoading && !technicians.data?.length && (
            <p className="text-sm text-rose-600">No technician accounts are available.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssigningTicket(null)}>Cancel</Button>
            <Button
              disabled={!assigningTicket || !technicianId || assign.isPending}
              onClick={() => assigningTicket && assign.mutate({ ticketId: assigningTicket.id, technicianId: Number(technicianId) })}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Confirm assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

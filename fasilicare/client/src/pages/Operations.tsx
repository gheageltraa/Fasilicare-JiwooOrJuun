import React from "react";
import { ArrowLeft, BusFront, Wrench } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloudinaryUpload, Footer, Navbar } from "@/components/FasiliCareShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { apiUrl } from "@/const";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import AdminDashboard from "./AdminDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Admin() {
  return <AdminDashboard />;
}

function TechGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "tech")
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-xl px-5 py-24 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-orange-100 text-orange-600">
            <Wrench />
          </div>
          <h1 className="mt-5 text-3xl font-black">
            Technician access required
          </h1>
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-bold text-orange-600"
          >
            Return to community
          </Link>
        </main>
      </>
    );
  return <>{children}</>;
}

export function Tech() {
  const utils = trpc.useUtils();
  const query = trpc.tickets.tasks.useQuery();
  const start = trpc.tickets.startRepair.useMutation({
    onSuccess: () => {
      toast.success("Repair started");
      utils.tickets.tasks.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const resolve = trpc.tickets.resolve.useMutation({
    onSuccess: () => {
      toast.success("Ticket resolved");
      utils.tickets.tasks.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  return (
    <TechGate>
      <div className="min-h-screen bg-[#fffaf2]">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
          >
            <ArrowLeft className="size-4" /> Community
          </Link>
          <div className="mt-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
              Operations / field team
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Today&apos;s task board
            </h1>
            <p className="mt-2 text-slate-600">
              Start each repair, then close the loop with a live proof photo.
            </p>
          </div>
          {query.isLoading ? (
            <p className="mt-8 text-center text-slate-500">
              Loading task board...
            </p>
          ) : query.isError ? (
            <p className="mt-8 text-center text-red-700">
              Task board could not be loaded.
            </p>
          ) : (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {query.data?.map(ticket => (
                <TechCard
                  key={ticket.id}
                  ticket={ticket}
                  onStart={() => start.mutate({ ticketId: ticket.id })}
                  onResolve={input => resolve.mutate(input)}
                />
              ))}
              {!query.data?.length && (
                <div className="col-span-full rounded-3xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
                  <BusFront className="mx-auto size-10 text-orange-400" />
                  <p className="mt-3 font-black text-[#102a43]">
                    No active work orders right now.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </TechGate>
  );
}

function TechCard({
  ticket,
  onStart,
  onResolve,
}: {
  ticket: any;
  onStart: () => void;
  onResolve: (input: { ticketId: number; proofUrl: string }) => void;
}) {
  const [proof, setProof] = React.useState("");
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_8px_35px_rgba(16,42,67,.07)]">
      <div className="flex items-center justify-between">
        <Badge className="rounded-full bg-slate-100 text-slate-700">
          {ticket.status.replace("_", " ").toUpperCase()}
        </Badge>
        <span className="text-xs font-bold text-slate-400">#{ticket.id}</span>
      </div>
      <img
        src={ticket.photoUrl}
        alt="Reported issue"
        className="mt-4 h-44 w-full rounded-2xl object-cover"
      />
      <h2 className="mt-4 font-bold leading-6">{ticket.issueDesc}</h2>
      <p className="mt-2 text-sm font-semibold text-slate-500">
        {ticket.locationName} · {ticket.urgency.toUpperCase()} priority
      </p>
      <div className="mt-5">
        {ticket.status === "approved" && (
          <Button
            onClick={onStart}
            className="w-full rounded-xl bg-orange-500 py-5 font-bold text-white hover:bg-orange-600"
          >
            Start Repair
          </Button>
        )}
        {ticket.status === "in_progress" && (
          <>
            <CloudinaryUpload
              label={
                proof ? "Proof ready · upload another" : "Upload live proof"
              }
              onUploaded={setProof}
            />
            {proof && (
              <Button
                onClick={() =>
                  onResolve({ ticketId: ticket.id, proofUrl: proof })
                }
                className="mt-3 w-full rounded-xl bg-[#102a43] py-5 font-bold text-white"
              >
                Finish Repair
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const form = useForm();
  const [loginError, setLoginError] = React.useState("");
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const submitLogin = async () => {
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${apiUrl}/api/login`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ login, password }) });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Could not sign you in.");
      await utils.auth.me.invalidate();
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not sign you in.";
      setLoginError(message);
      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  };
  return (
    <AuthShell>
      <Card className="border-0 bg-white/95 shadow-2xl dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-3xl font-black">Welcome back</CardTitle>
          <CardDescription>
            Sign in with your FasiliCare account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={event => {
                event.preventDefault();
                void submitLogin();
              }}
            >
              <div>
                <Label htmlFor="login">Email or username</Label>
                <Input
                  id="login"
                  value={login}
                  onChange={event => setLogin(event.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              <Button
                disabled={isLoggingIn}
                className="w-full bg-orange-500 py-6 font-bold text-white"
              >
                Sign in
              </Button>
              {loginError && (
                <p className="text-sm font-semibold text-red-600">
                  {loginError}
                </p>
              )}
            </form>
          </Form>
          <GoogleButton />
          <p className="mt-5 text-center text-sm text-slate-500">
            New here?{" "}
            <Link href="/signup" className="font-bold text-orange-600">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

export function GoogleButton() {
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const signInWithGoogle = async () => {
    if (!supabase) {
      setError("Google sign-in is not configured yet.");
      return;
    }
    setError("");
    setPending(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/login" },
    });
    if (authError) {
      setError(authError.message);
      toast.error(authError.message);
      setPending(false);
    }
  };
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>or continue with</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <Button type="button" variant="outline" disabled={pending} onClick={() => void signInWithGoogle()} className="mt-4 w-full border-slate-200 py-6 font-bold transition hover:border-orange-300 hover:bg-orange-50">
        <span className="mr-2 grid size-6 place-items-center rounded-full bg-white text-sm font-black shadow-sm">G</span>
        Sign in with Google
      </Button>
      {error && <p className="mt-2 text-center text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#102a43] px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full">
          <Link
            href="/"
            className="mb-6 block text-sm font-bold text-orange-300"
          >
            ← FasiliCare
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}

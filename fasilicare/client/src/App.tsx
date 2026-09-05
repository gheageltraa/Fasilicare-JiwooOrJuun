import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Report from "@/pages/Report";
import Ticket from "@/pages/Ticket";
import { Echoes, Profile } from "@/pages/Additional";
import Analytics from "@/pages/Analytics";
import { Admin, Login, Tech, AuthShell } from "@/pages/Operations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import PublicProfile from "@/pages/PublicProfile";
import { Link, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { apiUrl } from "@/const";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />
      <Route path={"/report"} component={Report} />
      <Route path={"/ticket/:id"} component={Ticket} />
      <Route path={"/echoes"} component={Echoes} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/profile/:id"} component={PublicProfile} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/analytics"} component={Analytics} />
      <Route path={"/tech"} component={Tech} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Signup() {
  const [, navigate] = useLocation();
  const [registerError, setRegisterError] = React.useState("");
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const form = useForm();
  return (
    <AuthShell>
      <Card className="border-0 bg-white/95 shadow-2xl dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-3xl font-black">
            Join the movement
          </CardTitle>
          <CardDescription>
            Create your local FasiliCare identity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={event => { event.preventDefault(); setRegisterError(""); setIsRegistering(true); void fetch(`${apiUrl}/api/register`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email, username, password }) }).then(async response => { const body = (await response.json()) as { error?: string }; if (!response.ok) throw new Error(body.error || "Could not create your account."); navigate("/"); }).catch(error => { const message = error instanceof Error ? error.message : "Could not create your account."; setRegisterError(message); toast.error(message); }).finally(() => setIsRegistering(false)); }}>
            <div>
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="signup-username">Username</Label>
              <Input
                id="signup-username"
                value={username}
                onChange={event => setUsername(event.target.value)}
                className="mt-2"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                3+ characters, letters, numbers, dots, dashes, or underscores.
              </p>
            </div>
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="mt-2"
                minLength={8}
                required
              />
            </div>
            <Button
              disabled={isRegistering}
              className="w-full bg-orange-500 py-6 font-bold text-white"
            >
              Create account
            </Button>
              {registerError && <p className="text-sm font-semibold text-red-600">{registerError}</p>}
            </form>
          </Form>
          <p className="mt-5 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-orange-600">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

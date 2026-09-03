import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Report from "@/pages/Report";
import Ticket from "@/pages/Ticket";
import { Echoes, Profile } from "@/pages/Additional";
import Analytics from "@/pages/Analytics";
import { Admin, Login, Tech } from "@/pages/Operations";
import PublicProfile from "@/pages/PublicProfile";
import AdminUsers from "@/pages/AdminUsers";
import AdminTickets from "@/pages/AdminTickets";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/report"} component={Report} />
      <Route path={"/ticket/:id"} component={Ticket} />
      <Route path={"/echoes"} component={Echoes} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/profile/:id"} component={PublicProfile} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/tickets"} component={AdminTickets} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/analytics"} component={Analytics} />
      <Route path={"/tech"} component={Tech} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

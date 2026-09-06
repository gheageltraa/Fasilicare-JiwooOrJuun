import { Link } from "wouter";
import { ArrowUp, MapPin, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Footer, Navbar } from "@/components/FasiliCareShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const statusLabel: Record<string, string> = {
  pending: "PENDING",
  approved: "APPROVED",
  assigned: "ASSIGNED",
  in_progress: "IN PROGRESS",
  resolved: "RESOLVED",
};
const urgencyLabel: Record<string, string> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  critical: "CRITICAL",
};
const formatDate = (date: Date | string) =>
  new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
function TrainSkeleton() {
  return (
    <div
      className="grid gap-4 md:grid-cols-2"
      aria-label="Loading community reports"
    >
      {[1, 2].map(item => (
        <div
          key={item}
          className="relative h-44 overflow-hidden rounded-3xl bg-white p-5"
        >
          <div className="h-4 w-24 rounded-full bg-slate-100" />
          <div className="mt-4 h-5 w-4/5 rounded-full bg-slate-100" />
          <div className="mt-3 h-4 w-3/5 rounded-full bg-slate-100" />
          <div className="train-sweep absolute inset-y-0 -left-1/2 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const feed = trpc.tickets.feed.useQuery();
  const utils = trpc.useUtils();
  const upvote = trpc.tickets.upvote.useMutation({
    onSuccess: () => {
      toast.success("Thanks for supporting this report");
      utils.tickets.feed.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  return (
    <div className="min-h-screen bg-[#fffaf2] text-[#102a43]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-12">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="grid gap-10 pb-14 lg:grid-cols-[1.1fr_.9fr] lg:items-end"
        >
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
              <Sparkles className="size-3.5" /> Keep our journeys moving
              together
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-7xl">
              Small report.
              <br />
              <span className="text-orange-500">Big impact.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              FasiliCare turns everyday transit observations into visible,
              accountable action—powered by the people who rely on public
              transport every day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link href="/report">
                  <Button className="rounded-full bg-orange-500 px-6 py-6 text-base font-bold text-white shadow-xl shadow-orange-500/25 hover:bg-orange-600">
                    <Plus className="mr-2 size-5" /> Report an issue
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="rounded-full bg-orange-500 px-6 py-6 text-base font-bold text-white shadow-xl shadow-orange-500/25 hover:bg-orange-600"
                >
                  <Plus className="mr-2 size-5" /> Sign in to report
                </Button>
              )}
              <a
                href="#feed"
                className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#102a43] shadow-sm transition hover:border-orange-300"
              >
                View community reports
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#102a43] p-8 text-white shadow-2xl shadow-slate-900/20">
            <div className="absolute -right-16 -top-20 size-56 rounded-full bg-orange-500/25 blur-2xl" />
            <div className="relative">
              <div className="transit-marquee" aria-hidden="true">
                ▰◈▰
              </div>
              <div className="flex items-center justify-between">
                <ShieldCheck className="size-8 text-orange-400" />
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-orange-200">
                  LIVE BOARD
                </span>
              </div>
              <p className="mt-16 text-4xl font-black tracking-tight">
                Your voice
                <br />
                moves the city.
              </p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
                Support important reports. Community validation helps field
                teams set repair priorities.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    className="mt-5 flex cursor-pointer flex-wrap items-center gap-2 transition-colors"
                    aria-label="Learn how FasiliCare supports the Sustainable Development Goals"
                  >
                    <div className="flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 shadow-sm backdrop-blur-sm hover:bg-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                      <span>SDG 9: Industry &amp; Infrastructure</span>
                    </div>
                    <div className="flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 shadow-sm backdrop-blur-sm hover:bg-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0 20" /><path d="M2 12h20" /></svg>
                      <span>SDG 11: Sustainable Cities</span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl border-slate-200 bg-white p-7 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:p-8">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight sm:text-3xl">
                      FasiliCare&apos;s Global Impact
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Aligning with the UN Sustainable Development Goals
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-5 grid gap-5">
                    <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                      <div className="flex items-start gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-500 dark:bg-blue-400/20 dark:text-blue-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                        </div>
                        <div>
                          <h3 className="font-black text-blue-700 dark:text-blue-300">SDG 9 - Industry, Innovation and Infrastructure</h3>
                          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">FasiliCare provides an innovative digital infrastructure that bridges the gap between commuters and maintenance teams. By crowdsourcing facility data, we ensure public transit systems remain resilient, responsive, and continuously upgraded.</p>
                        </div>
                      </div>
                    </section>
                    <section className="rounded-2xl border border-orange-100 bg-orange-50/70 p-5 dark:border-orange-400/20 dark:bg-orange-400/10">
                      <div className="flex items-start gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-400/20 dark:text-orange-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0 20" /><path d="M2 12h20" /></svg>
                        </div>
                        <div>
                          <h3 className="font-black text-orange-700 dark:text-orange-300">SDG 11 - Sustainable Cities and Communities</h3>
                          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Public transport is the backbone of a sustainable city. FasiliCare directly empowers citizens to report hazards and maintenance needs, creating safer, more accessible, and resilient urban mobility networks for everyone.</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-5 text-sm text-slate-300">
                <span className="status-live bg-emerald-400" /> Community
                reporting is open
              </div>
            </div>
          </div>
        </motion.section>
        <section id="feed" className="scroll-mt-24">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                Community pulse
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Reports that need support
              </h2>
            </div>
            <span className="text-sm font-semibold text-slate-500">
              {feed.data?.length ?? 0} active reports
            </span>
          </div>
          {feed.isLoading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-slate-500">
              <TrainSkeleton />
            </div>
          ) : feed.isError ? (
            <div className="rounded-3xl bg-red-50 p-10 text-center text-red-700">
              The community board is temporarily unavailable. Please try again.
            </div>
          ) : feed.data?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {feed.data.map(ticket => (
                <Card
                  key={ticket.id}
                  style={{
                    animationDelay: `${Math.min(ticket.id % 6, 5) * 45}ms`,
                  }}
                  className={`fasili-enter group overflow-hidden rounded-3xl border-0 bg-white shadow-[0_8px_35px_rgba(16,42,67,.07)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,42,67,.12)] ${ticket.urgency === "critical" ? "ring-2 ring-red-600" : ticket.urgency === "high" ? "ring-2 ring-red-400" : ""}`}
                >
                  <div className="grid sm:grid-cols-[150px_1fr]">
                    <img
                      src={ticket.photoUrl}
                      alt="Reported facility"
                      className="h-44 w-full object-cover sm:h-full"
                    />
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex gap-2">
                          <Badge className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-100">
                            <span
                              className={`status-live ${ticket.status === "in_progress" ? "bg-amber-500" : ticket.urgency === "critical" ? "bg-red-500" : "bg-orange-400"}`}
                            />
                            {statusLabel[ticket.status]}
                          </Badge>
                          <Badge
                            className={`rounded-full hover:bg-transparent ${ticket.urgency === "critical" ? "bg-red-200 text-red-800" : ticket.urgency === "high" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            {urgencyLabel[ticket.urgency]}
                          </Badge>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          #{ticket.id}
                        </span>
                      </div>
                      <Link href={`/ticket/${ticket.id}`}>
                        <h3 className="mt-3 line-clamp-3 font-bold leading-6 text-[#102a43] hover:text-orange-600">
                          {ticket.issueDesc}
                        </h3>
                      </Link>
                      <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                        <MapPin className="size-4 text-orange-500" />
                        {ticket.locationName} · {ticket.category || "Other"}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-400">
                        {formatDate(ticket.createdAt)}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs font-semibold text-slate-400">
                          {ticket.upvoteCount} support ·{" "}
                          {ticket.authorId ? (
                            <Link
                              href={`/profile/${ticket.authorId}`}
                              className="hover:text-orange-600"
                            >
                              {ticket.authorName || "a commuter"}
                            </Link>
                          ) : (
                            "a commuter"
                          )}
                        </span>
                        <Button
                          disabled={!isAuthenticated || upvote.isPending}
                          onClick={() =>
                            isAuthenticated
                              ? upvote.mutate({ ticketId: ticket.id })
                              : toast.info("Sign in to support a report")
                          }
                          className="rounded-full bg-[#102a43] text-white hover:bg-slate-800"
                        >
                          <ArrowUp className="mr-1.5 size-4" /> Support
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/60 p-12 text-center">
              <h3 className="text-xl font-black">
                No active incidents reported.
              </h3>
              <p className="mt-2 text-slate-600">
                Smooth travels ahead. Be the first to report a facility that
                needs care.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

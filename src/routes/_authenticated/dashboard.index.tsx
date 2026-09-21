import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, Eye, Star, XCircle } from "lucide-react";
import { CandidateShell } from "./dashboard";
import { StatCard } from "@/components/layout/DashboardShell";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { user, profile } = useAuth();

  const applications = useQuery({
    queryKey: ["my-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, job:jobs(id, title, company:companies(name, logo_url))")
        .eq("candidate_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = applications.data ?? [];
  const count = (status: string) => rows.filter((row) => row.status === status).length;

  return (
    <CandidateShell
      title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
      subtitle="Here's how your job search is going."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total applications" value={rows.length} icon={ClipboardList} />
        <StatCard label="Under review" value={count("under_review")} icon={Eye} />
        <StatCard label="Shortlisted" value={count("shortlisted")} icon={Star} />
        <StatCard label="Rejected" value={count("rejected")} icon={XCircle} />
      </div>

      <div className="mt-8 rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-semibold">Recently applied</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/applications">View all</Link>
          </Button>
        </div>

        {applications.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : rows.length ? (
          <ul className="divide-y">
            {rows.slice(0, 5).map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.job?.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {row.job?.company?.name} · applied {timeAgo(row.created_at).toLowerCase()}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={<CheckCircle2 className="size-6" />}
              title="No applications yet"
              description="Find a role that fits and apply — your applications will show up here."
              action={
                <Button asChild>
                  <Link to="/jobs" search={{ page: 1 }}>
                    Browse jobs
                  </Link>
                </Button>
              }
            />
          </div>
        )}
      </div>
    </CandidateShell>
  );
}

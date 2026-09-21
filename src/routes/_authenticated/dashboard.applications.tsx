import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CandidateShell } from "./dashboard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { user } = useAuth();
  const applications = useQuery({
    queryKey: ["my-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, job:jobs(id, title, location, company:companies(name))")
        .eq("candidate_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = applications.data ?? [];

  return (
    <CandidateShell title="My applications" subtitle="Track the status of every role you applied to.">
      {applications.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : rows.length ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="hidden grid-cols-[2fr_1.2fr_1fr_1fr] gap-4 border-b bg-secondary/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
            <span>Role</span>
            <span>Company</span>
            <span>Applied</span>
            <span>Status</span>
          </div>
          <ul className="divide-y">
            {rows.map((row) => (
              <li
                key={row.id}
                className="grid gap-2 px-5 py-4 md:grid-cols-[2fr_1.2fr_1fr_1fr] md:items-center md:gap-4"
              >
                <Link
                  to="/jobs/$jobId"
                  params={{ jobId: row.job_id }}
                  className="font-medium hover:text-primary"
                >
                  {row.job?.title}
                </Link>
                <span className="text-sm text-muted-foreground">{row.job?.company?.name}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={row.status} />
                </div>
                {row.interview_note ? (
                  <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground md:col-span-4">
                    <span className="font-medium text-foreground">Interview details: </span>
                    {row.interview_note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState
          title="No applications yet"
          description="Once you apply to a role it will appear here with its live status."
          action={
            <Button asChild>
              <Link to="/jobs" search={{ page: 1 }}>
                Find jobs
              </Link>
            </Button>
          }
        />
      )}
    </CandidateShell>
  );
}

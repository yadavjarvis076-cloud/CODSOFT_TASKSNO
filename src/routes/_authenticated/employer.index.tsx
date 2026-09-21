import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CheckCircle2, Clock, FileText } from "lucide-react";
import { EmployerShell } from "./employer";
import { StatCard } from "@/components/layout/DashboardShell";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyApplications, fetchMyCompany, fetchMyJobs } from "@/lib/employer";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/employer/")({
  component: EmployerOverview,
});

function EmployerOverview() {
  const { user } = useAuth();
  const company = useQuery({
    queryKey: ["my-company", user?.id],
    enabled: !!user,
    queryFn: () => fetchMyCompany(user!.id),
  });
  const jobs = useQuery({
    queryKey: ["my-jobs", user?.id],
    enabled: !!user,
    queryFn: () => fetchMyJobs(user!.id),
  });
  const applications = useQuery({
    queryKey: ["employer-applications", user?.id],
    enabled: !!user,
    queryFn: () => fetchMyApplications(user!.id),
  });

  const jobRows = jobs.data ?? [];
  const appRows = applications.data ?? [];

  return (
    <EmployerShell title="Employer overview" subtitle="Your hiring activity at a glance.">
      {!company.isLoading && !company.data ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-warning/40 bg-warning/10 p-5">
          <p className="text-sm">Set up your company profile so candidates know who's hiring.</p>
          <Button asChild size="sm">
            <Link to="/employer/company">Create company profile</Link>
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total jobs" value={jobRows.length} icon={Briefcase} />
        <StatCard
          label="Active jobs"
          value={jobRows.filter((job) => job.status === "published").length}
          icon={CheckCircle2}
        />
        <StatCard label="Applications" value={appRows.length} icon={FileText} />
        <StatCard
          label="Pending review"
          value={appRows.filter((row) => row.status === "applied").length}
          icon={Clock}
        />
      </div>

      <div className="mt-8 rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-semibold">Recent applications</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/employer/applications" search={{ jobId: undefined }}>
              View all
            </Link>
          </Button>
        </div>
        {appRows.length ? (
          <ul className="divide-y">
            {appRows.slice(0, 5).map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.full_name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {row.job?.title} · {timeAgo(row.created_at).toLowerCase()}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No applications yet"
              description="Publish a role and candidates will start applying."
              action={
                <Button asChild>
                  <Link to="/employer/post">Post a job</Link>
                </Button>
              }
            />
          </div>
        )}
      </div>
    </EmployerShell>
  );
}

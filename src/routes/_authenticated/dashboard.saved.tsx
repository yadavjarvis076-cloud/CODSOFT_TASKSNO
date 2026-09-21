import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CandidateShell } from "./dashboard";
import { JobCard } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { JobWithCompany } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/dashboard/saved")({
  component: SavedJobsPage,
});

function SavedJobsPage() {
  const { user } = useAuth();
  const saved = useQuery({
    queryKey: ["saved-jobs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("id, job:jobs(*, company:companies(*))")
        .eq("candidate_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function remove(id: string) {
    await supabase.from("saved_jobs").delete().eq("id", id);
    toast.success("Removed from saved jobs");
    void saved.refetch();
  }

  const rows = saved.data ?? [];

  return (
    <CandidateShell title="Saved jobs" subtitle="Roles you bookmarked to revisit later.">
      {rows.length ? (
        <div className="space-y-4">
          {rows.map((row) =>
            row.job ? (
              <div key={row.id} className="relative">
                <JobCard job={row.job as unknown as JobWithCompany} />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove saved job"
                  className="absolute right-3 top-3"
                  onClick={() => remove(row.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ) : null,
          )}
        </div>
      ) : (
        <EmptyState
          title="Nothing saved yet"
          description="Tap Save job on any role to keep it here."
          action={
            <Button asChild>
              <Link to="/jobs" search={{ page: 1 }}>
                Browse jobs
              </Link>
            </Button>
          }
        />
      )}
    </CandidateShell>
  );
}

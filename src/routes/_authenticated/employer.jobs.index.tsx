import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, EyeOff, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { EmployerShell } from "./employer";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyJobs } from "@/lib/employer";
import { labelOf, JOB_TYPES, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/employer/jobs/")({
  component: ManageJobsPage,
});

const FILTERS = ["all", "published", "draft", "closed"] as const;

function ManageJobsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const jobs = useQuery({
    queryKey: ["my-jobs", user?.id],
    enabled: !!user,
    queryFn: () => fetchMyJobs(user!.id),
  });

  const rows = (jobs.data ?? []).filter((job) => filter === "all" || job.status === filter);

  async function toggleStatus(id: string, status: string) {
    const next = status === "published" ? "closed" : "published";
    const { error } = await supabase.from("jobs").update({ status: next as never }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(next === "published" ? "Job published" : "Job unpublished");
    void jobs.refetch();
  }

  async function remove() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("jobs").delete().eq("id", pendingDelete);
    setPendingDelete(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Job deleted");
    void jobs.refetch();
  }

  return (
    <EmployerShell title="Manage jobs" subtitle="Edit, publish or close your listings.">
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <Button
            key={option}
            size="sm"
            variant={filter === option ? "default" : "outline"}
            onClick={() => setFilter(option)}
            className="capitalize"
          >
            {option}
          </Button>
        ))}
      </div>

      {rows.length ? (
        <div className="space-y-4">
          {rows.map((job) => (
            <div key={job.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to="/jobs/$jobId"
                    params={{ jobId: job.id }}
                    className="font-semibold hover:text-primary"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {labelOf(JOB_TYPES, job.job_type)} · {job.location} · posted{" "}
                    {timeAgo(job.created_at).toLowerCase()}
                  </p>
                </div>
                <Badge variant={job.status === "published" ? "default" : "secondary"} className="capitalize">
                  {job.status}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/employer/applications" search={{ jobId: job.id }}>
                    <Users className="size-4" /> {job.applicants_count} applicant
                    {job.applicants_count === 1 ? "" : "s"}
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/employer/jobs/$jobId/edit" params={{ jobId: job.id }}>
                    <Pencil className="size-4" /> Edit
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleStatus(job.id, job.status)}>
                  {job.status === "published" ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  {job.status === "published" ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setPendingDelete(job.id)}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No jobs here"
          description="Post your first role to start receiving applications."
          action={
            <Button asChild>
              <Link to="/employer/post">Post a job</Link>
            </Button>
          }
        />
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              The listing and its applications will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete job</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EmployerShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { EmployerShell } from "./employer";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyApplications, fetchMyJobs } from "@/lib/employer";
import { APPLICATION_STATUSES } from "@/lib/format";
import { resumeDownloadUrl } from "@/lib/resume";

export const Route = createFileRoute("/_authenticated/employer/applications")({
  validateSearch: (search: Record<string, unknown>) => ({
    jobId: typeof search['jobId'] === "string" ? search['jobId'] : undefined,
  }),
  component: EmployerApplicationsPage,
});

function EmployerApplicationsPage() {
  const { jobId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");

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

  const rows = (applications.data ?? []).filter(
    (row) =>
      (!jobId || row.job_id === jobId) && (statusFilter === "all" || row.status === statusFilter),
  );

  async function setStatus(id: string, status: string) {
    const { error } = await supabase
      .from("applications")
      .update({ status: status as never })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Status updated — the candidate can see it now.");
    void applications.refetch();
  }

  async function saveNote(id: string) {
    const { error } = await supabase.from("applications").update({ interview_note: note }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNoteFor(null);
    setNote("");
    toast.success("Interview details sent to the candidate");
    void applications.refetch();
  }

  async function openResume(path: string | null) {
    if (!path) {
      toast.error("No resume attached");
      return;
    }
    try {
      window.open(await resumeDownloadUrl(path), "_blank", "noopener");
    } catch {
      toast.error("Could not open the resume");
    }
  }

  return (
    <EmployerShell title="Applications" subtitle="Review candidates and move them through your pipeline.">
      <div className="mb-5 flex flex-wrap gap-3">
        <Select
          value={jobId ?? "all"}
          onValueChange={(value) =>
            navigate({ search: { jobId: value === "all" ? undefined : value } })
          }
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All jobs</SelectItem>
            {(jobs.data ?? []).map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {APPLICATION_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rows.length ? (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{row.full_name}</p>
                  <p className="text-sm text-muted-foreground">{row.job?.title}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-4" /> {row.email}
                    </span>
                    {row.phone ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-4" /> {row.phone}
                      </span>
                    ) : null}
                    <span>Applied {new Date(row.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <StatusBadge status={row.status} />
              </div>

              {row.cover_letter ? (
                <p className="mt-4 whitespace-pre-line rounded-lg bg-secondary p-4 text-sm">
                  {row.cover_letter}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => openResume(row.resume_url)}>
                  <FileText className="size-4" /> {row.resume_name ?? "View resume"}
                </Button>
                <Select value={row.status} onValueChange={(value) => setStatus(row.id, value)}>
                  <SelectTrigger className="h-9 w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setNoteFor(noteFor === row.id ? null : row.id);
                    setNote(row.interview_note ?? "");
                  }}
                >
                  Send interview info
                </Button>
              </div>

              {noteFor === row.id ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Interview date, time, format and joining link…"
                  />
                  <Button size="sm" onClick={() => saveNote(row.id)}>
                    Save & notify
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No applications match"
          description="Try a different job or status filter."
        />
      )}
    </EmployerShell>
  );
}

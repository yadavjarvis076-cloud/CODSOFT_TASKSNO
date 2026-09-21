import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmployerShell } from "./employer";
import { JobForm, fromLines, toLines, type JobFormValues } from "@/components/employer/JobForm";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/employer/jobs/$jobId/edit")({
  component: EditJobPage,
});

function EditJobPage() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();

  const job = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function submit(values: JobFormValues, status: "draft" | "published") {
    const { error } = await supabase
      .from("jobs")
      .update({
        title: values.title.trim(),
        category: values.category,
        job_type: values.job_type as never,
        workplace_type: values.workplace_type as never,
        experience_level: values.experience_level as never,
        location: values.location || "Remote",
        salary_min: values.salary_min ? Number(values.salary_min) : null,
        salary_max: values.salary_max ? Number(values.salary_max) : null,
        description: values.description,
        responsibilities: toLines(values.responsibilities),
        requirements: toLines(values.requirements),
        benefits: toLines(values.benefits),
        skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
        application_deadline: values.application_deadline || null,
        status: status as never,
      })
      .eq("id", jobId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Job updated");
    navigate({ to: "/employer/jobs" });
  }

  if (job.isLoading) {
    return (
      <EmployerShell title="Edit job">
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </EmployerShell>
    );
  }

  if (!job.data) {
    return (
      <EmployerShell title="Edit job">
        <p className="text-muted-foreground">This job no longer exists.</p>
      </EmployerShell>
    );
  }

  const row = job.data;

  return (
    <EmployerShell title="Edit job" subtitle={row.title}>
      <JobForm
        submitLabel="Save & publish"
        onSubmit={submit}
        initial={{
          title: row.title,
          category: row.category,
          job_type: row.job_type,
          workplace_type: row.workplace_type,
          experience_level: row.experience_level,
          location: row.location,
          salary_min: row.salary_min ? String(row.salary_min) : "",
          salary_max: row.salary_max ? String(row.salary_max) : "",
          description: row.description,
          responsibilities: fromLines(row.responsibilities),
          requirements: fromLines(row.requirements),
          benefits: fromLines(row.benefits),
          skills: (row.skills ?? []).join(", "),
          application_deadline: row.application_deadline
            ? String(row.application_deadline).slice(0, 10)
            : "",
        }}
      />
    </EmployerShell>
  );
}

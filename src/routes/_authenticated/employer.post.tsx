import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmployerShell } from "./employer";
import { JobForm, emptyJob, toLines, type JobFormValues } from "@/components/employer/JobForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyCompany } from "@/lib/employer";

export const Route = createFileRoute("/_authenticated/employer/post")({
  component: PostJobPage,
});

function PostJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const company = useQuery({
    queryKey: ["my-company", user?.id],
    enabled: !!user,
    queryFn: () => fetchMyCompany(user!.id),
  });

  async function submit(values: JobFormValues, status: "draft" | "published") {
    if (!user || !company.data) return;
    const { error } = await supabase.from("jobs").insert({
      employer_id: user.id,
      company_id: company.data.id,
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
      status,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "published" ? "Job published" : "Draft saved");
    navigate({ to: "/employer/jobs" });
  }

  if (!company.isLoading && !company.data) {
    return (
      <EmployerShell title="Post a job">
        <div className="rounded-xl border bg-card p-8 text-center">
          <h2 className="font-semibold">Create your company profile first</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Jobs are published under your company, so we need those details first.
          </p>
          <Button asChild className="mt-4">
            <Link to="/employer/company">Set up company</Link>
          </Button>
        </div>
      </EmployerShell>
    );
  }

  return (
    <EmployerShell title="Post a job" subtitle="Publish now or save it as a draft.">
      <JobForm initial={emptyJob} submitLabel="Publish job" onSubmit={submit} />
    </EmployerShell>
  );
}

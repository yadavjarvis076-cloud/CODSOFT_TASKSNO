import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CalendarClock,
  Check,
  IndianRupee,
  MapPin,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/layout/SiteShell";
import { CompanyAvatar, JobCard } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchJob, fetchSimilarJobs } from "@/lib/api";
import {
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  WORKPLACE_TYPES,
  formatSalary,
  labelOf,
  timeAgo,
} from "@/lib/format";

export const Route = createFileRoute("/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Job details — JobConnect" },
      { name: "description", content: "Read the full role description and apply on JobConnect." },
      { property: "og:title", content: "Job details — JobConnect" },
      { property: "og:description", content: "Read the full role description and apply on JobConnect." },
    ],
  }),
  component: JobDetailPage,
});

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const jobQuery = useQuery({ queryKey: ["job", jobId], queryFn: () => fetchJob(jobId) });
  const job = jobQuery.data;

  const similar = useQuery({
    queryKey: ["similar-jobs", jobId, job?.category],
    queryFn: () => fetchSimilarJobs(job!),
    enabled: !!job,
  });

  const applied = useQuery({
    queryKey: ["application-exists", jobId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, status")
        .eq("job_id", jobId)
        .eq("candidate_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const saved = useQuery({
    queryKey: ["saved-job", jobId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("job_id", jobId)
        .eq("candidate_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  async function toggleSave() {
    if (!user) {
      toast.error("Sign in to save jobs");
      navigate({ to: "/auth", search: { mode: "login" } });
      return;
    }
    if (saved.data) {
      await supabase.from("saved_jobs").delete().eq("id", saved.data.id);
      toast.success("Removed from saved jobs");
    } else {
      const { error } = await supabase
        .from("saved_jobs")
        .insert({ candidate_id: user.id, job_id: jobId });
      if (error) {
        toast.error("Could not save this job");
        return;
      }
      toast.success("Job saved");
    }
    void saved.refetch();
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: job?.title ?? "Job", url });
        return;
      } catch {
        /* user dismissed */
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }

  function apply() {
    if (!user) {
      toast.info("Sign in or create an account to apply");
      navigate({ to: "/auth", search: { mode: "login" } });
      return;
    }
    navigate({ to: "/apply/$jobId", params: { jobId } });
  }

  if (jobQuery.isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto w-full max-w-5xl animate-pulse px-4 py-12">
          <div className="h-40 rounded-xl bg-muted" />
          <div className="mt-6 h-72 rounded-xl bg-muted" />
        </div>
      </SiteShell>
    );
  }

  if (!job) {
    return (
      <SiteShell>
        <div className="mx-auto w-full max-w-3xl px-4 py-20">
          <EmptyState
            title="Job not found"
            description="This role may have been closed or removed."
            action={
              <Button asChild>
                <Link to="/jobs" search={{ page: 1 }}>
                  Browse all jobs
                </Link>
              </Button>
            }
          />
        </div>
      </SiteShell>
    );
  }

  const isOwner = user?.id === job.employer_id;
  const company = job.company;

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <Link
          to="/jobs"
          search={{ page: 1 }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to jobs
        </Link>

        <div className="mt-5 rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-start gap-4">
            <CompanyAvatar name={company?.name ?? "Company"} logoUrl={company?.logo_url} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold sm:text-3xl">{job.title}</h1>
              <p className="mt-1 text-muted-foreground">
                {company?.name} · {job.category}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {job.location || "Flexible"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="size-4" /> {labelOf(JOB_TYPES, job.job_type)} ·{" "}
                  {labelOf(WORKPLACE_TYPES, job.workplace_type)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IndianRupee className="size-4" />
                  {formatSalary(job.salary_min, job.salary_max, job.currency)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <TrendingUp className="size-4" /> {labelOf(EXPERIENCE_LEVELS, job.experience_level)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="size-4" /> Posted {timeAgo(job.created_at).toLowerCase()}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4" /> {job.applicants_count} applicants
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {isOwner ? (
              <>
                <Button asChild>
                  <Link to="/employer/jobs/$jobId/edit" params={{ jobId }}>
                    Edit job
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/employer/applications" search={{ jobId }}>
                    View applications ({job.applicants_count})
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={apply}
                  disabled={!!applied.data || role === "employer" || role === "admin"}
                >
                  {applied.data ? (
                    <>
                      <Check className="size-4" /> Applied
                    </>
                  ) : (
                    "Apply now"
                  )}
                </Button>
                <Button size="lg" variant="outline" onClick={toggleSave}>
                  {saved.data ? (
                    <>
                      <BookmarkCheck className="size-4" /> Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="size-4" /> Save job
                    </>
                  )}
                </Button>
              </>
            )}
            <Button size="lg" variant="ghost" onClick={share}>
              <Share2 className="size-4" /> Share
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Section title="Job description">
              <p className="whitespace-pre-line text-muted-foreground">{job.description}</p>
            </Section>

            {job.responsibilities.length ? (
              <Section title="Responsibilities">
                <BulletList items={job.responsibilities} />
              </Section>
            ) : null}

            {job.requirements.length ? (
              <Section title="Requirements">
                <BulletList items={job.requirements} />
              </Section>
            ) : null}

            {job.skills.length ? (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Section>
            ) : null}

            {job.benefits.length ? (
              <Section title="Benefits">
                <BulletList items={job.benefits} />
              </Section>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="flex items-center gap-2 font-semibold">
                <Building2 className="size-4" /> About {company?.name}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">{company?.description}</p>
              <Separator className="my-4" />
              <dl className="space-y-2 text-sm">
                <Row label="Industry" value={company?.industry} />
                <Row label="Company size" value={company?.company_size} />
                <Row label="Location" value={company?.location} />
                <Row label="Founded" value={company?.founded_year?.toString()} />
              </dl>
              {company?.website ? (
                <Button asChild variant="outline" className="mt-4 w-full">
                  <a href={company.website} target="_blank" rel="noreferrer">
                    Visit website
                  </a>
                </Button>
              ) : null}
            </div>

            {job.application_deadline ? (
              <div className="rounded-xl border bg-card p-5 text-sm">
                <p className="font-semibold">Application deadline</p>
                <p className="mt-1 text-muted-foreground">
                  {new Date(job.application_deadline).toLocaleDateString()}
                </p>
              </div>
            ) : null}
          </aside>
        </div>

        {similar.data?.length ? (
          <section className="mt-12">
            <h2 className="text-xl font-bold">Similar jobs</h2>
            <div className="mt-4 grid gap-4">
              {similar.data.map((item) => (
                <JobCard key={item.id} job={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </SiteShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Row({ label, value }: { label: string; value?: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

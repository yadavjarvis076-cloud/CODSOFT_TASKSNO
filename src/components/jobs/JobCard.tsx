import { Link } from "@tanstack/react-router";
import { Briefcase, Clock, IndianRupee, MapPin, TrendingUp } from "lucide-react";
import type { JobWithCompany } from "@/lib/api";
import {
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  WORKPLACE_TYPES,
  formatSalary,
  initials,
  labelOf,
  timeAgo,
} from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CompanyAvatar({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl?: string | null | undefined;
  size?: "sm" | "md" | "lg" | undefined;
}) {
  const dim = size === "lg" ? "size-16 text-lg" : size === "sm" ? "size-9 text-xs" : "size-12 text-sm";
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={`${dim} shrink-0 rounded-xl border object-cover`}
      />
    );
  }
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-xl border bg-secondary font-semibold text-secondary-foreground`}
    >
      {initials(name)}
    </div>
  );
}

export function JobCard({ job, applied }: { job: JobWithCompany; applied?: boolean }) {
  const company = job.company;
  return (
    <article className="card-lift group rounded-xl border bg-card p-5 hover:card-lift-hover">
      <div className="flex gap-4">
        <CompanyAvatar name={company?.name ?? "Company"} logoUrl={company?.logo_url} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">
                <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="hover:text-primary">
                  {job.title}
                </Link>
              </h3>
              <p className="truncate text-sm text-muted-foreground">{company?.name ?? "Confidential"}</p>
            </div>
            {applied ? <Badge variant="secondary">Applied</Badge> : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" /> {job.location || "Flexible"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="size-4" /> {labelOf(JOB_TYPES, job.job_type)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IndianRupee className="size-4" />
              {formatSalary(job.salary_min, job.salary_max, job.currency)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="size-4" /> {labelOf(EXPERIENCE_LEVELS, job.experience_level)}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{labelOf(WORKPLACE_TYPES, job.workplace_type)}</Badge>
              <Badge variant="outline">{job.category}</Badge>
              {job.skills.slice(0, 2).map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> {timeAgo(job.created_at)}
              </span>
              <Button asChild size="sm">
                <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                  View details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-5">
      <div className="flex gap-4">
        <div className="size-12 rounded-xl bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-3 w-1/4 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

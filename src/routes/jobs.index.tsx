import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { SearchBar } from "@/components/jobs/SearchBar";
import { JobCard, JobCardSkeleton } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchJobs, type JobFilters } from "@/lib/api";
import {
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  JOB_TYPES,
  WORKPLACE_TYPES,
  formatSalary,
} from "@/lib/format";

export interface JobSearch {
  keyword?: string | undefined;
  location?: string | undefined;
  category?: string | undefined;
  jobType?: string[] | undefined;
  experience?: string[] | undefined;
  workplace?: string[] | undefined;
  salaryMin?: number | undefined;
  posted?: number | undefined;
  sort?: "newest" | "salary" | undefined;
  page?: number | undefined;
}

const PAGE_SIZE = 8;

export const Route = createFileRoute("/jobs/")({
  validateSearch: (search: Record<string, unknown>): JobSearch => ({
    keyword: typeof search["keyword"] === "string" ? search["keyword"] : undefined,
    location: typeof search["location"] === "string" ? search["location"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    jobType: Array.isArray(search["jobType"]) ? (search["jobType"] as string[]) : undefined,
    experience: Array.isArray(search["experience"]) ? (search["experience"] as string[]) : undefined,
    workplace: Array.isArray(search["workplace"]) ? (search["workplace"] as string[]) : undefined,
    salaryMin: typeof search["salaryMin"] === "number" ? search["salaryMin"] : undefined,
    posted: typeof search["posted"] === "number" ? search["posted"] : undefined,
    sort: search["sort"] === "salary" ? "salary" : "newest",
    page: typeof search["page"] === "number" ? search["page"] : 1,
  }),
  head: () => ({
    meta: [
      { title: "Find jobs — JobConnect" },
      {
        name: "description",
        content:
          "Search and filter open roles by keyword, location, category, job type, experience and salary.",
      },
      { property: "og:title", content: "Find jobs — JobConnect" },
      { property: "og:description", content: "Search and filter open roles that match your skills." },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs/" });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters: JobFilters = {
    keyword: search.keyword ?? "",
    location: search.location ?? "",
    category: search.category ?? "",
    jobTypes: search.jobType ?? [],
    experienceLevels: search.experience ?? [],
    workplaceTypes: search.workplace ?? [],
    salaryMin: search.salaryMin ?? 0,
    postedWithinDays: search.posted ?? 0,
    sort: search.sort ?? "newest",
    page: search.page ?? 1,
    pageSize: PAGE_SIZE,
  };

  const jobsQuery = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobs(filters),
  });

  function update(next: Partial<JobSearch>, resetPage = true) {
    navigate({
      search: (prev: JobSearch) => ({ ...prev, ...next, ...(resetPage ? { page: 1 } : {}) }),
    });
  }

  function toggle(key: "jobType" | "experience" | "workplace", value: string) {
    const current = search[key] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update({ [key]: next.length ? next : undefined } as Partial<JobSearch>);
  }

  const total = jobsQuery.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = search.page ?? 1;

  const activeCount =
    (search.category ? 1 : 0) +
    (search.jobType?.length ?? 0) +
    (search.experience?.length ?? 0) +
    (search.workplace?.length ?? 0) +
    (search.salaryMin ? 1 : 0) +
    (search.posted ? 1 : 0);

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold">Category</Label>
        <Select
          value={search.category ?? "all"}
          onValueChange={(value) => update({ category: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="mt-2 w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {JOB_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FilterGroup
        title="Job type"
        options={JOB_TYPES}
        selected={search.jobType ?? []}
        onToggle={(value) => toggle("jobType", value)}
      />
      <FilterGroup
        title="Workplace"
        options={WORKPLACE_TYPES}
        selected={search.workplace ?? []}
        onToggle={(value) => toggle("workplace", value)}
      />
      <FilterGroup
        title="Experience level"
        options={EXPERIENCE_LEVELS}
        selected={search.experience ?? []}
        onToggle={(value) => toggle("experience", value)}
      />

      <div>
        <Label className="text-sm font-semibold">Minimum salary</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          {search.salaryMin ? formatSalary(search.salaryMin) : "Any"}
        </p>
        <Slider
          className="mt-3"
          value={[search.salaryMin ?? 0]}
          min={0}
          max={3000000}
          step={100000}
          onValueChange={([value]) => update({ salaryMin: value || undefined })}
        />
      </div>

      <div>
        <Label className="text-sm font-semibold">Date posted</Label>
        <Select
          value={String(search.posted ?? 0)}
          onValueChange={(value) => update({ posted: Number(value) || undefined })}
        >
          <SelectTrigger className="mt-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any time</SelectItem>
            <SelectItem value="1">Last 24 hours</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeCount > 0 ? (
        <Button
          variant="ghost"
          className="w-full"
          onClick={() =>
            navigate({
              search: (): JobSearch => ({
                keyword: search.keyword,
                location: search.location,
                page: 1,
              }),
            })
          }
        >
          <X className="size-4" /> Clear filters
        </Button>
      ) : null}
    </div>
  );

  return (
    <SiteShell>
      <div className="surface-soft border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <h1 className="text-3xl font-bold sm:text-4xl">Find jobs</h1>
          <p className="mt-2 text-muted-foreground">
            {total} {total === 1 ? "role" : "roles"} matching your search.
          </p>
          <div className="mt-6">
            <SearchBar
              initialKeyword={search.keyword ?? ""}
              initialLocation={search.location ?? ""}
              size="sm"
              onSearch={(keyword, location) =>
                update({ keyword: keyword || undefined, location: location || undefined })
              }
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">Filters</h2>
            {FilterPanel}
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen((v) => !v)}>
              <SlidersHorizontal className="size-4" /> Filters
              {activeCount ? ` (${activeCount})` : ""}
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Sort by</Label>
              <Select
                value={search.sort ?? "newest"}
                onValueChange={(value) => update({ sort: value as "newest" | "salary" })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="salary">Highest salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtersOpen ? (
            <div className="mb-6 rounded-xl border bg-card p-5 lg:hidden">{FilterPanel}</div>
          ) : null}

          {jobsQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : jobsQuery.data?.jobs.length ? (
            <div className="space-y-4">
              {jobsQuery.data.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No jobs match these filters"
              description="Try widening your search — remove a filter or search a different keyword."
              action={
                <Button variant="outline" onClick={() => navigate({ search: (): JobSearch => ({ page: 1 }) })}>
                  Reset search
                </Button>
              }
            />
          )}

          {pages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => update({ page: page - 1 }, false)}
              >
                Previous
              </Button>
              <span className="px-3 text-sm text-muted-foreground">
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                disabled={page >= pages}
                onClick={() => update({ page: page + 1 }, false)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </SiteShell>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <Label className="text-sm font-semibold">{title}</Label>
      <div className="mt-3 space-y-2.5">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

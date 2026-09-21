import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileUp,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { SearchBar } from "@/components/jobs/SearchBar";
import { JobCard, JobCardSkeleton, CompanyAvatar } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import {
  fetchCategoryCounts,
  fetchCompanies,
  fetchCompanyJobCounts,
  fetchFeaturedJobs,
  fetchPlatformStats,
} from "@/lib/api";
import heroImage from "@/assets/hero-team.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JobConnect — Find Your Next Opportunity" },
      {
        name: "description",
        content:
          "Search thousands of roles from hiring companies, apply with your resume and track every application in one place.",
      },
      { property: "og:title", content: "JobConnect — Find Your Next Opportunity" },
      {
        property: "og:description",
        content: "Search jobs, apply with your resume and track every application in one place.",
      },
    ],
  }),
  component: Home,
});

const HOW_IT_WORKS = [
  {
    icon: Users,
    title: "Create your profile",
    text: "Sign up as a candidate or employer and complete a profile that stands out.",
  },
  {
    icon: Search,
    title: "Search and match",
    text: "Filter by role, location, salary and experience to find the right fit fast.",
  },
  {
    icon: FileUp,
    title: "Apply with your resume",
    text: "Upload a resume once and apply to any role in a couple of clicks.",
  },
  {
    icon: Send,
    title: "Track every update",
    text: "Follow your application from review to interview with live status updates.",
  },
];

function Home() {
  const navigate = useNavigate();
  const featured = useQuery({ queryKey: ["featured-jobs"], queryFn: () => fetchFeaturedJobs(6) });
  const categories = useQuery({ queryKey: ["category-counts"], queryFn: fetchCategoryCounts });
  const companies = useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });
  const companyCounts = useQuery({ queryKey: ["company-job-counts"], queryFn: fetchCompanyJobCounts });
  const stats = useQuery({ queryKey: ["platform-stats"], queryFn: fetchPlatformStats });

  function search(keyword: string, location: string) {
    navigate({ to: "/jobs", search: { keyword, location, page: 1 } });
  }

  return (
    <SiteShell>
      {/* Hero */}
      <section className="surface-hero text-ink-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5" /> New roles added every day
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Find Your Next Opportunity
            </h1>
            <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
              JobConnect brings candidates and hiring teams together. Discover roles that match your
              skills, apply in minutes and follow every application from one dashboard.
            </p>

            <div className="mt-8">
              <SearchBar onSearch={search} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="size-4" /> Free for candidates
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="size-4" /> Verified employers
              </span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <img
              src={heroImage}
              alt="Professionals collaborating in a modern office"
              className="aspect-4/3 w-full rounded-3xl border border-white/10 object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-10 lg:grid-cols-4">
          {[
            { label: "Open roles", value: stats.data?.jobs ?? 0 },
            { label: "Hiring companies", value: stats.data?.companies ?? 0 },
            { label: "Job categories", value: Object.keys(categories.data ?? {}).length },
            { label: "Avg. reply time", value: "48h" },
          ].map((item) => (
            <div key={item.label}>
              <p className="font-display text-3xl font-bold">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured jobs */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured jobs</h2>
            <p className="mt-2 text-muted-foreground">Fresh openings from teams hiring right now.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/jobs" search={{ page: 1 }}>
              Browse all jobs <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {featured.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)
            : featured.data?.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </section>

      {/* Categories */}
      <section className="surface-soft border-y">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">Popular categories</h2>
          <p className="mt-2 text-muted-foreground">Explore the fields where teams are hiring most.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(categories.data ?? {}).map(([category, count]) => (
              <Link
                key={category}
                to="/jobs"
                search={{ category, page: 1 }}
                className="card-lift rounded-xl border bg-card p-5 hover:card-lift-hover"
              >
                <p className="font-semibold">{category}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {count} open {count === 1 ? "role" : "roles"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Companies */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured companies</h2>
            <p className="mt-2 text-muted-foreground">Teams building great products and growing fast.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/companies">
              All companies <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.data?.slice(0, 6).map((company) => (
            <div key={company.id} className="card-lift rounded-xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <CompanyAvatar name={company.name} logoUrl={company.logo_url} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{company.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {company.industry} · {company.location}
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{company.description}</p>
              <p className="mt-4 text-sm font-medium text-primary">
                {companyCounts.data?.[company.id] ?? 0} open roles
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="surface-soft border-y">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={step.title} className="rounded-xl border bg-card p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <p className="mt-4 text-xs font-semibold text-muted-foreground">STEP {index + 1}</p>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="surface-hero flex flex-col items-start gap-6 rounded-3xl px-8 py-12 text-ink-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Hiring, or looking for your next role?</h2>
            <p className="mt-2 max-w-xl text-ink-muted">
              Create a free account in under a minute. Candidates apply with one profile, employers
              post roles and manage every applicant in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "register" }}>
                Get started
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/jobs" search={{ page: 1 }}>
                <Building2 className="size-4" /> Browse jobs
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

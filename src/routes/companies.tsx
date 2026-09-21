import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Globe, MapPin, Users } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { CompanyAvatar } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { fetchCompanies, fetchCompanyJobCounts } from "@/lib/api";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Companies hiring on JobConnect" },
      {
        name: "description",
        content: "Browse verified companies hiring on JobConnect and see their open roles.",
      },
      { property: "og:title", content: "Companies hiring on JobConnect" },
      { property: "og:description", content: "Browse verified companies and their open roles." },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const companies = useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });
  const counts = useQuery({ queryKey: ["company-job-counts"], queryFn: fetchCompanyJobCounts });

  return (
    <SiteShell>
      <div className="surface-soft border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold sm:text-4xl">Companies hiring now</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Get to know the teams behind the roles — their size, industry and what they are building.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        {companies.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl border bg-card" />
            ))}
          </div>
        ) : companies.data?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.data.map((company) => (
              <div key={company.id} className="card-lift flex flex-col rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                  <CompanyAvatar name={company.name} logoUrl={company.logo_url} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{company.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{company.industry}</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
                  {company.description}
                </p>
                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <p className="inline-flex items-center gap-2">
                    <MapPin className="size-4" /> {company.location}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Users className="size-4" /> {company.company_size} employees
                  </p>
                  {company.website ? (
                    <p className="inline-flex items-center gap-2">
                      <Globe className="size-4" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:text-primary"
                      >
                        Website
                      </a>
                    </p>
                  ) : null}
                </div>
                <Button asChild variant="outline" className="mt-5">
                  <Link to="/jobs" search={{ keyword: company.name, page: 1 }}>
                    {counts.data?.[company.id] ?? 0} open roles
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No companies yet" description="Employer profiles will appear here." />
        )}
      </div>
    </SiteShell>
  );
}

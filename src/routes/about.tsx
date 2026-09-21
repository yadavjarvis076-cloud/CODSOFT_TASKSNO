import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, HeartHandshake, ShieldCheck, Target } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About JobConnect" },
      {
        name: "description",
        content:
          "JobConnect is a recruitment platform built to make hiring transparent for candidates and simple for employers.",
      },
      { property: "og:title", content: "About JobConnect" },
      {
        property: "og:description",
        content: "Transparent hiring for candidates, simple recruiting for employers.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: Target, title: "Relevant matches", text: "Filters that surface the roles actually worth your time." },
  { icon: ShieldCheck, title: "Verified employers", text: "Every company profile is owned and maintained by the hiring team." },
  { icon: HeartHandshake, title: "Transparent status", text: "Candidates see exactly where each application stands." },
  { icon: Building2, title: "Built for teams", text: "Post roles, review applicants and move people through your pipeline." },
];

function AboutPage() {
  return (
    <SiteShell>
      <div className="surface-soft border-b">
        <div className="mx-auto w-full max-w-4xl px-4 py-16">
          <h1 className="text-3xl font-bold sm:text-4xl">Hiring should be clear on both sides</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            JobConnect is a job search and recruitment platform. Candidates build one profile and
            apply anywhere on the platform; employers publish roles and manage the whole pipeline
            without spreadsheets or lost email threads.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-xl border bg-card p-5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <value.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold">{value.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{value.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border bg-card p-8">
          <h2 className="text-xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-muted-foreground">
            Create a candidate account to apply for roles, or an employer account to start hiring.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/auth" search={{ mode: "register" }}>
                Create an account
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/jobs" search={{ page: 1 }}>
                Browse jobs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/layout/SiteShell";
import { Field } from "./dashboard.profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadResume, validateResume } from "@/lib/resume";

export const Route = createFileRoute("/_authenticated/apply/$jobId")({
  component: ApplyPage,
});

function ApplyPage() {
  const { jobId } = Route.useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    cover_letter: "",
    portfolio_url: "",
    linkedin_url: "",
  });

  const job = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, employer_id, company:companies(name)")
        .eq("id", jobId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const candidate = useQuery({
    queryKey: ["candidate-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const existing = useQuery({
    queryKey: ["application-exists", jobId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("candidate_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      full_name: current.full_name || profile?.full_name || "",
      email: current.email || user?.email || "",
      phone: current.phone || candidate.data?.phone || "",
      portfolio_url: current.portfolio_url || candidate.data?.portfolio_url || "",
      linkedin_url: current.linkedin_url || candidate.data?.linkedin_url || "",
    }));
  }, [profile, user, candidate.data]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    const savedResume = candidate.data?.resume_url;
    if (!file && !savedResume) {
      toast.error("Please attach your resume.");
      return;
    }
    setBusy(true);
    try {
      let resumePath = savedResume ?? null;
      let resumeName = candidate.data?.resume_name ?? null;
      if (file) {
        resumePath = await uploadResume(user.id, file);
        resumeName = file.name;
        await supabase
          .from("candidate_profiles")
          .upsert({ user_id: user.id, resume_url: resumePath, resume_name: resumeName });
      }

      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        candidate_id: user.id,
        employer_id: job.data?.employer_id ?? null,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        cover_letter: form.cover_letter || null,
        portfolio_url: form.portfolio_url || null,
        linkedin_url: form.linkedin_url || null,
        resume_url: resumePath,
        resume_name: resumeName,
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("You have already applied to this job.");
          return;
        }
        throw error;
      }
      toast.success("Application submitted!");
      navigate({ to: "/dashboard/applications" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit application");
    } finally {
      setBusy(false);
    }
  }

  if (existing.data) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <CheckCircle2 className="mx-auto size-10 text-success" />
          <h1 className="mt-4 text-2xl font-semibold">You've already applied</h1>
          <p className="mt-2 text-muted-foreground">
            Track the status of this application from your dashboard.
          </p>
          <Button asChild className="mt-6">
            <Link to="/dashboard/applications">View my applications</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm text-muted-foreground">Applying for</p>
        <h1 className="font-display text-3xl font-semibold">{job.data?.title ?? "…"}</h1>
        <p className="text-muted-foreground">{job.data?.company?.name}</p>

        <form onSubmit={submit} className="mt-8 space-y-5 rounded-xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="LinkedIn (optional)">
              <Input
                value={form.linkedin_url}
                onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Portfolio (optional)">
            <Input
              value={form.portfolio_url}
              onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
            />
          </Field>

          <Field label="Cover letter">
            <Textarea
              rows={6}
              value={form.cover_letter}
              onChange={(e) => setForm({ ...form, cover_letter: e.target.value })}
              placeholder="Tell the employer why you're a great fit."
            />
          </Field>

          <div>
            <p className="text-sm font-medium">Resume</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-4">
              <FileText className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {file?.name ?? candidate.data?.resume_name ?? "No file selected"}
              </span>
              <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                {file || candidate.data?.resume_url ? "Replace" : "Upload"}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">PDF, DOC or DOCX up to 5 MB.</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(event) => {
                const picked = event.target.files?.[0];
                if (!picked) return;
                const problem = validateResume(picked);
                if (problem) {
                  toast.error(problem);
                  return;
                }
                setFile(picked);
              }}
            />
          </div>

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? <Loader2 className="size-4 animate-spin" /> : null} Submit application
          </Button>
        </form>
      </div>
    </SiteShell>
  );
}

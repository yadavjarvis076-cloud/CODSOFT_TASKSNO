import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CandidateShell } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfilePage,
});

interface Entry {
  title: string;
  organization: string;
  period: string;
  description: string;
}

const emptyEntry: Entry = { title: "", organization: "", period: "", description: "" };

function ProfilePage() {
  const { user, profile, refresh } = useAuth();
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [form, setForm] = useState({
    phone: "",
    location: "",
    headline: "",
    bio: "",
    skills: "",
    portfolio_url: "",
    linkedin_url: "",
    github_url: "",
  });
  const [education, setEducation] = useState<Entry[]>([]);
  const [experience, setExperience] = useState<Entry[]>([]);
  const [certifications, setCertifications] = useState<Entry[]>([]);

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

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setAvatarUrl(profile?.avatar_url ?? "");
  }, [profile]);

  useEffect(() => {
    const row = candidate.data;
    if (!row) return;
    setForm({
      phone: row.phone ?? "",
      location: row.location ?? "",
      headline: row.headline ?? "",
      bio: row.bio ?? "",
      skills: (row.skills ?? []).join(", "),
      portfolio_url: row.portfolio_url ?? "",
      linkedin_url: row.linkedin_url ?? "",
      github_url: row.github_url ?? "",
    });
    setEducation((row.education as unknown as Entry[]) ?? []);
    setExperience((row.experience as unknown as Entry[]) ?? []);
    setCertifications((row.certifications as unknown as Entry[]) ?? []);
  }, [candidate.data]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), avatar_url: avatarUrl.trim() || null })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const { error } = await supabase.from("candidate_profiles").upsert({
        user_id: user.id,
        phone: form.phone || null,
        location: form.location || null,
        headline: form.headline || null,
        bio: form.bio || null,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        portfolio_url: form.portfolio_url || null,
        linkedin_url: form.linkedin_url || null,
        github_url: form.github_url || null,
        education: education as never,
        experience: experience as never,
        certifications: certifications as never,
      });
      if (error) throw error;
      await refresh();
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <CandidateShell title="My profile" subtitle="Employers see this when you apply.">
      <form onSubmit={save} className="max-w-3xl space-y-6">
        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Basic details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </Field>
            <Field label="Email">
              <Input value={user?.email ?? ""} disabled />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </Field>
            <Field label="Location">
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Bengaluru, India"
              />
            </Field>
            <Field label="Profile photo URL" hint="Paste a link to your photo">
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
            </Field>
            <Field label="Professional headline">
              <Input
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="Frontend developer · React & TypeScript"
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="About you">
              <Textarea
                rows={5}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="A short summary of your experience and what you're looking for."
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Skills" hint="Separate with commas">
              <Input
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="React, TypeScript, SQL"
              />
            </Field>
          </div>
        </section>

        <EntrySection
          title="Work experience"
          entries={experience}
          setEntries={setExperience}
          titleLabel="Job title"
          orgLabel="Company"
        />
        <EntrySection
          title="Education"
          entries={education}
          setEntries={setEducation}
          titleLabel="Degree"
          orgLabel="Institution"
        />
        <EntrySection
          title="Certifications"
          entries={certifications}
          setEntries={setCertifications}
          titleLabel="Certification"
          orgLabel="Issuer"
        />

        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Links</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Portfolio">
              <Input
                value={form.portfolio_url}
                onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                placeholder="https://"
              />
            </Field>
            <Field label="LinkedIn">
              <Input
                value={form.linkedin_url}
                onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/"
              />
            </Field>
            <Field label="GitHub">
              <Input
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                placeholder="https://github.com/"
              />
            </Field>
          </div>
        </section>

        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null} Save profile
        </Button>
      </form>
    </CandidateShell>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function EntrySection({
  title,
  entries,
  setEntries,
  titleLabel,
  orgLabel,
}: {
  title: string;
  entries: Entry[];
  setEntries: (entries: Entry[]) => void;
  titleLabel: string;
  orgLabel: string;
}) {
  function update(index: number, patch: Partial<Entry>) {
    setEntries(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={() => setEntries([...entries, { ...emptyEntry }])}>
          <Plus className="size-4" /> Add
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing added yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  value={entry.title}
                  placeholder={titleLabel}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
                <Input
                  value={entry.organization}
                  placeholder={orgLabel}
                  onChange={(e) => update(index, { organization: e.target.value })}
                />
                <Input
                  value={entry.period}
                  placeholder="2022 – 2024"
                  onChange={(e) => update(index, { period: e.target.value })}
                />
              </div>
              <Textarea
                className="mt-3"
                rows={2}
                value={entry.description}
                placeholder="Optional description"
                onChange={(e) => update(index, { description: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-destructive"
                onClick={() => setEntries(entries.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" /> Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmployerShell } from "./employer";
import { Field } from "./dashboard.profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyCompany } from "@/lib/employer";

export const Route = createFileRoute("/_authenticated/employer/company")({
  component: CompanyProfilePage,
});

function CompanyProfilePage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    logo_url: "",
    description: "",
    industry: "",
    company_size: "",
    website: "",
    location: "",
    founded_year: "",
    linkedin: "",
    twitter: "",
  });

  const company = useQuery({
    queryKey: ["my-company", user?.id],
    enabled: !!user,
    queryFn: () => fetchMyCompany(user!.id),
  });

  useEffect(() => {
    const row = company.data;
    if (!row) return;
    const social = (row.social_links ?? {}) as Record<string, string>;
    setForm({
      name: row.name ?? "",
      logo_url: row.logo_url ?? "",
      description: row.description ?? "",
      industry: row.industry ?? "",
      company_size: row.company_size ?? "",
      website: row.website ?? "",
      location: row.location ?? "",
      founded_year: row.founded_year ? String(row.founded_year) : "",
      linkedin: social['linkedin'] ?? "",
      twitter: social['twitter'] ?? "",
    });
  }, [company.data]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const payload = {
        owner_id: user.id,
        name: form.name.trim(),
        logo_url: form.logo_url || null,
        description: form.description || null,
        industry: form.industry || null,
        company_size: form.company_size || null,
        website: form.website || null,
        location: form.location || null,
        founded_year: form.founded_year ? Number(form.founded_year) : null,
        social_links: { linkedin: form.linkedin, twitter: form.twitter } as never,
      };
      const query = company.data
        ? supabase.from("companies").update(payload).eq("id", company.data.id)
        : supabase.from("companies").insert(payload);
      const { error } = await query;
      if (error) throw error;
      toast.success("Company profile saved");
      void company.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save company");
    } finally {
      setBusy(false);
    }
  }

  return (
    <EmployerShell title="Company profile" subtitle="This appears on every job you post.">
      <form onSubmit={save} className="max-w-3xl space-y-6">
        <section className="rounded-xl border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Logo URL">
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
            </Field>
            <Field label="Industry">
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </Field>
            <Field label="Company size">
              <Input
                value={form.company_size}
                onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                placeholder="51-200"
              />
            </Field>
            <Field label="Website">
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Field>
            <Field label="Founded year">
              <Input
                type="number"
                value={form.founded_year}
                onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="About the company">
              <Textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="LinkedIn">
              <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
            </Field>
            <Field label="X / Twitter">
              <Input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
            </Field>
          </div>
        </section>

        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null} Save company
        </Button>
      </form>
    </EmployerShell>
  );
}

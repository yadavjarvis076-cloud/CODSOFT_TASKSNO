import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPERIENCE_LEVELS, JOB_CATEGORIES, JOB_TYPES, WORKPLACE_TYPES } from "@/lib/format";

export interface JobFormValues {
  title: string;
  category: string;
  job_type: string;
  workplace_type: string;
  experience_level: string;
  location: string;
  salary_min: string;
  salary_max: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string;
  benefits: string;
  application_deadline: string;
}

export const emptyJob: JobFormValues = {
  title: "",
  category: JOB_CATEGORIES[0] ?? "Engineering",
  job_type: "full-time",
  workplace_type: "on-site",
  experience_level: "mid",
  location: "",
  salary_min: "",
  salary_max: "",
  description: "",
  responsibilities: "",
  requirements: "",
  skills: "",
  benefits: "",
  application_deadline: "",
};

export function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function fromLines(value: string[] | null | undefined) {
  return (value ?? []).join("\n");
}

export function JobForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: JobFormValues;
  submitLabel: string;
  onSubmit: (values: JobFormValues, status: "draft" | "published") => Promise<void>;
}) {
  const [values, setValues] = useState<JobFormValues>(initial);
  const [busy, setBusy] = useState<"draft" | "published" | null>(null);

  function set<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(status: "draft" | "published") {
    if (!values.title.trim() || !values.description.trim()) return;
    setBusy(status);
    try {
      await onSubmit(values, status);
    } finally {
      setBusy(null);
    }
  }

  return (
    <form
      className="max-w-3xl space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submit("published");
      }}
    >
      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Role basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Wrap label="Job title">
            <Input value={values.title} onChange={(e) => set("title", e.target.value)} required />
          </Wrap>
          <Wrap label="Category">
            <Picker value={values.category} onChange={(v) => set("category", v)} options={JOB_CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </Wrap>
          <Wrap label="Job type">
            <Picker value={values.job_type} onChange={(v) => set("job_type", v)} options={JOB_TYPES} />
          </Wrap>
          <Wrap label="Workplace">
            <Picker value={values.workplace_type} onChange={(v) => set("workplace_type", v)} options={WORKPLACE_TYPES} />
          </Wrap>
          <Wrap label="Experience level">
            <Picker value={values.experience_level} onChange={(v) => set("experience_level", v)} options={EXPERIENCE_LEVELS} />
          </Wrap>
          <Wrap label="Location">
            <Input value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="Bengaluru, India" />
          </Wrap>
          <Wrap label="Salary min (₹ / year)">
            <Input type="number" value={values.salary_min} onChange={(e) => set("salary_min", e.target.value)} />
          </Wrap>
          <Wrap label="Salary max (₹ / year)">
            <Input type="number" value={values.salary_max} onChange={(e) => set("salary_max", e.target.value)} />
          </Wrap>
          <Wrap label="Application deadline">
            <Input
              type="date"
              value={values.application_deadline}
              onChange={(e) => set("application_deadline", e.target.value)}
            />
          </Wrap>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Details</h2>
        <Wrap label="Description">
          <Textarea rows={6} value={values.description} onChange={(e) => set("description", e.target.value)} required />
        </Wrap>
        <Wrap label="Responsibilities" hint="One per line">
          <Textarea rows={5} value={values.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} />
        </Wrap>
        <Wrap label="Requirements" hint="One per line">
          <Textarea rows={5} value={values.requirements} onChange={(e) => set("requirements", e.target.value)} />
        </Wrap>
        <Wrap label="Benefits" hint="One per line">
          <Textarea rows={4} value={values.benefits} onChange={(e) => set("benefits", e.target.value)} />
        </Wrap>
        <Wrap label="Skills" hint="Separate with commas">
          <Input value={values.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, Node.js" />
        </Wrap>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy !== null}>
          {busy === "published" ? <Loader2 className="size-4 animate-spin" /> : null} {submitLabel}
        </Button>
        <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void submit("draft")}>
          {busy === "draft" ? <Loader2 className="size-4 animate-spin" /> : null} Save draft
        </Button>
      </div>
    </form>
  );
}

function Wrap({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Picker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly { readonly value: string; readonly label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

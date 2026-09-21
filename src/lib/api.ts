import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
export type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
export type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
export type CandidateProfileRow = Database["public"]["Tables"]["candidate_profiles"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type AppRole = Database["public"]["Enums"]["app_role"];
export type ApplicationStatus = Database["public"]["Enums"]["application_status"];

export type JobWithCompany = JobRow & { company: CompanyRow | null };

export interface JobFilters {
  keyword?: string;
  location?: string;
  category?: string;
  jobTypes?: string[];
  experienceLevels?: string[];
  workplaceTypes?: string[];
  salaryMin?: number;
  postedWithinDays?: number;
  sort?: "newest" | "salary";
  page?: number;
  pageSize?: number;
}

const JOB_SELECT = "*, company:companies(*)";

export async function fetchJobs(filters: JobFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;

  let query = supabase
    .from("jobs")
    .select(JOB_SELECT, { count: "exact" })
    .eq("status", "published");

  if (filters.keyword?.trim()) {
    const term = `%${filters.keyword.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term}`);
  }
  if (filters.location?.trim()) {
    query = query.ilike("location", `%${filters.location.trim()}%`);
  }
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.jobTypes?.length) query = query.in("job_type", filters.jobTypes as JobRow["job_type"][]);
  if (filters.experienceLevels?.length)
    query = query.in("experience_level", filters.experienceLevels as JobRow["experience_level"][]);
  if (filters.workplaceTypes?.length)
    query = query.in("workplace_type", filters.workplaceTypes as JobRow["workplace_type"][]);
  if (filters.salaryMin) query = query.gte("salary_max", filters.salaryMin);
  if (filters.postedWithinDays) {
    const since = new Date(Date.now() - filters.postedWithinDays * 86_400_000).toISOString();
    query = query.gte("created_at", since);
  }

  query =
    filters.sort === "salary"
      ? query.order("salary_max", { ascending: false, nullsFirst: false })
      : query.order("created_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw error;
  return { jobs: (data ?? []) as JobWithCompany[], total: count ?? 0, page, pageSize };
}

export async function fetchJob(id: string) {
  const { data, error } = await supabase.from("jobs").select(JOB_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as JobWithCompany | null;
}

export async function fetchSimilarJobs(job: JobWithCompany) {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("status", "published")
    .eq("category", job.category)
    .neq("id", job.id)
    .order("created_at", { ascending: false })
    .limit(3);
  if (error) throw error;
  return (data ?? []) as JobWithCompany[];
}

export async function fetchFeaturedJobs(limit = 6) {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as JobWithCompany[];
}

export async function fetchCompanies() {
  const { data, error } = await supabase.from("companies").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchCompanyJobCounts() {
  const { data, error } = await supabase.from("jobs").select("company_id").eq("status", "published");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.company_id] = (counts[row.company_id] ?? 0) + 1;
  return counts;
}

export async function fetchPlatformStats() {
  const [jobs, companies] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("companies").select("id", { count: "exact", head: true }),
  ]);
  return { jobs: jobs.count ?? 0, companies: companies.count ?? 0 };
}

export async function fetchCategoryCounts() {
  const { data, error } = await supabase.from("jobs").select("category").eq("status", "published");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.category] = (counts[row.category] ?? 0) + 1;
  return counts;
}

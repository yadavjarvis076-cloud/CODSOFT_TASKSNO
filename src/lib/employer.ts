import { supabase } from "@/integrations/supabase/client";

export async function fetchMyCompany(userId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchMyJobs(userId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(name, logo_url)")
    .eq("employer_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMyApplications(userId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs(id, title)")
    .eq("employer_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

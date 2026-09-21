import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, FileText, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell, StatCard, type NavItem } from "@/components/layout/DashboardShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_NAV: NavItem[] = [{ label: "Overview", icon: Users, to: "/admin", exact: true }];

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { role } = useAuth();

  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const jobs = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, status, location, company:companies(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const applications = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id, full_name, email, status, created_at, job:jobs(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function deleteJob(id: string) {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Job removed");
    void jobs.refetch();
  }

  if (role && role !== "admin") {
    return (
      <DashboardShell title="Admin" nav={ADMIN_NAV}>
        <div className="rounded-xl border bg-card p-8 text-center">
          <h2 className="font-semibold">You don't have access to this area</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Only platform administrators can view moderation tools.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const userRows = users.data ?? [];

  return (
    <DashboardShell title="Admin" subtitle="Platform moderation and oversight." nav={ADMIN_NAV}>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Users" value={userRows.length} icon={Users} />
        <StatCard label="Jobs" value={(jobs.data ?? []).length} icon={Briefcase} />
        <StatCard label="Applications" value={(applications.data ?? []).length} icon={FileText} />
      </div>

      <Tabs defaultValue="users" className="mt-8">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 rounded-xl border bg-card">
          <ul className="divide-y">
            {userRows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{row.full_name ?? "Unnamed user"}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">User</Badge>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="jobs" className="mt-4 rounded-xl border bg-card">
          <ul className="divide-y">
            {(jobs.data ?? []).map((job) => (
              <li key={job.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.company?.name} · {job.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {job.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteJob(job.id)}
                  >
                    <Trash2 className="size-4" /> Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="applications" className="mt-4 rounded-xl border bg-card">
          <ul className="divide-y">
            {(applications.data ?? []).map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{row.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.job?.title} · {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}

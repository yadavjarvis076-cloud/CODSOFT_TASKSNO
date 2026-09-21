import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmployerShell } from "./employer";
import { Field } from "./dashboard.profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/employer/settings")({
  component: EmployerSettingsPage,
});

function EmployerSettingsPage() {
  const { user, profile, refresh } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveName(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
    toast.success("Details saved");
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({
      password,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({ current_password: currentPassword } as any),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCurrentPassword("");
    setPassword("");
    toast.success("Password updated");
  }

  return (
    <EmployerShell title="Account settings" subtitle="Manage your recruiter account.">
      <div className="max-w-xl space-y-6">
        <form onSubmit={saveName} className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Your details</h2>
          <Field label="Full name">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input value={user?.email ?? ""} disabled />
          </Field>
          <Button type="submit">Save</Button>
        </form>

        <form onSubmit={changePassword} className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Change password</h2>
          <Field label="Current password">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </Field>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : null} Update password
          </Button>
        </form>
      </div>
    </EmployerShell>
  );
}

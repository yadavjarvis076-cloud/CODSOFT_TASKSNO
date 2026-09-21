import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CandidateShell } from "./dashboard";
import { Field } from "./dashboard.profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

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

  async function deleteAccount() {
    if (!user) return;
    await supabase.from("candidate_profiles").delete().eq("user_id", user.id);
    await supabase.auth.signOut();
    toast.success("Your profile data was removed and you have been signed out.");
    navigate({ to: "/", replace: true });
  }

  return (
    <CandidateShell title="Account settings" subtitle="Manage your sign-in details.">
      <div className="max-w-xl space-y-6">
        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Email</h2>
          <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
        </section>

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

        <section className="rounded-xl border border-destructive/30 bg-card p-6">
          <h2 className="font-semibold text-destructive">Danger zone</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Deleting your account removes your candidate profile and signs you out.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4">
                Delete account data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes your candidate profile, resume link and saved preferences. This cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAccount}>Yes, delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </CandidateShell>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Briefcase, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, dashboardPath } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "register" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: Mode } => ({
    mode:
      search["mode"] === "register" || search["mode"] === "forgot" || search["mode"] === "login"
        ? (search["mode"] as Mode)
        : "login",
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account — JobConnect" },
      {
        name: "description",
        content: "Sign in to JobConnect or create a candidate or employer account to start hiring.",
      },
      { property: "og:title", content: "Sign in — JobConnect" },
      { property: "og:description", content: "Access your JobConnect candidate or employer account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "login" } = Route.useSearch();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"candidate" | "employer">("candidate");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<null | "confirm" | "reset">(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: dashboardPath(role), replace: true });
  }, [loading, user, role, navigate]);

  function setMode(next: Mode) {
    setSent(null);
    navigate({ to: "/auth", search: { mode: next } });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "register") {
        if (fullName.trim().length < 2) throw new Error("Please enter your full name.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim(), role: accountType },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent("confirm");
          toast.success("Account created. Check your email to confirm it.");
        } else {
          toast.success("Welcome to JobConnect");
        }
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Signed in");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("reset");
        toast.success("Password reset link sent");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="surface-hero hidden flex-col justify-between p-12 text-ink-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">JobConnect</span>
        </Link>
        <div>
          <h2 className="max-w-md text-3xl font-bold">
            One account. Every opportunity, and every applicant.
          </h2>
          <p className="mt-4 max-w-md text-ink-muted">
            Candidates apply with a single profile and track status in real time. Employers post
            roles and manage the full hiring pipeline.
          </p>
        </div>
        <p className="text-sm text-ink-muted">Trusted by teams hiring across engineering, design and data.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="size-5" />
            </span>
            <span className="font-display text-lg font-bold">JobConnect</span>
          </Link>

          <h1 className="text-2xl font-bold">
            {mode === "register"
              ? "Create your account"
              : mode === "forgot"
                ? "Reset your password"
                : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "register"
              ? "Join as a candidate to apply, or as an employer to hire."
              : mode === "forgot"
                ? "We'll email you a secure link to set a new password."
                : "Sign in to continue to your dashboard."}
          </p>

          {sent ? (
            <div className="mt-8 rounded-xl border bg-card p-6 text-center">
              <Mail className="mx-auto size-8 text-primary" />
              <h2 className="mt-4 font-semibold">Check your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {sent === "confirm"
                  ? `We sent a confirmation link to ${email}. Click it to activate your account.`
                  : `We sent a password reset link to ${email}.`}
              </p>
              <Button variant="outline" className="mt-5" onClick={() => setMode("login")}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              {mode === "register" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {(["candidate", "employer"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAccountType(type)}
                        className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                          accountType === type
                            ? "border-primary bg-primary/5 text-foreground"
                            : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <span className="block font-semibold capitalize">{type}</span>
                        <span className="text-xs">
                          {type === "candidate" ? "Looking for a job" : "Hiring for my team"}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      className="mt-1.5"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jarvis Yadav"
                      required
                    />
                  </div>
                </>
              ) : null}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              {mode !== "forgot" ? (
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "login" ? (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    ) : null}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    className="mt-1.5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {mode === "register"
                  ? "Create account"
                  : mode === "forgot"
                    ? "Send reset link"
                    : "Sign in"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "register" ? (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="font-medium text-primary hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to JobConnect?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="font-medium text-primary hover:underline"
                >
                  Create an account
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

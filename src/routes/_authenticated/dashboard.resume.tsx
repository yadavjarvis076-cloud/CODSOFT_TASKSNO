import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { CandidateShell } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { resumeDownloadUrl, uploadResume, validateResume } from "@/lib/resume";

export const Route = createFileRoute("/_authenticated/dashboard/resume")({
  component: ResumePage,
});

function ResumePage() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const candidate = useQuery({
    queryKey: ["candidate-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_profiles")
        .select("resume_url, resume_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function onFile(file: File) {
    if (!user) return;
    const problem = validateResume(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    setBusy(true);
    setProgress(25);
    try {
      const path = await uploadResume(user.id, file);
      setProgress(75);
      const { error } = await supabase
        .from("candidate_profiles")
        .upsert({ user_id: user.id, resume_url: path, resume_name: file.name });
      if (error) throw error;
      setProgress(100);
      toast.success("Resume uploaded");
      void candidate.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  async function view() {
    if (!candidate.data?.resume_url) return;
    try {
      const url = await resumeDownloadUrl(candidate.data.resume_url);
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("Could not open the resume");
    }
  }

  return (
    <CandidateShell title="Resume" subtitle="Upload once, then apply to any role in seconds.">
      <div className="max-w-2xl space-y-6">
        {candidate.data?.resume_url ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="font-medium">{candidate.data.resume_name ?? "Resume"}</p>
                <p className="text-sm text-muted-foreground">Stored securely</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={view}>
                View
              </Button>
              <Button variant="secondary" onClick={() => inputRef.current?.click()}>
                Replace
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<UploadCloud className="size-6" />}
            title="No resume uploaded"
            description="Add a PDF, DOC or DOCX up to 5 MB."
            action={<Button onClick={() => inputRef.current?.click()}>Upload resume</Button>}
          />
        )}

        {busy || progress > 0 ? (
          <div>
            <Progress value={progress} />
            <p className="mt-2 text-sm text-muted-foreground">
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" /> Uploading…
                </span>
              ) : (
                "Done"
              )}
            </p>
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onFile(file);
            event.target.value = "";
          }}
        />
      </div>
    </CandidateShell>
  );
}

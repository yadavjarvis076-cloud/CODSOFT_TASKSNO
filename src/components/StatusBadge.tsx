import { cn } from "@/lib/utils";
import { APPLICATION_STATUSES, labelOf } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/api";

const styles: Record<ApplicationStatus, string> = {
  applied: "bg-secondary text-secondary-foreground",
  under_review: "bg-info/12 text-info",
  shortlisted: "bg-accent/20 text-accent-foreground",
  interview: "bg-primary/12 text-primary",
  rejected: "bg-destructive/12 text-destructive",
  hired: "bg-success/15 text-success",
};

export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[status],
        className,
      )}
    >
      {labelOf(APPLICATION_STATUSES, status)}
    </span>
  );
}

export const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
] as const;

export const WORKPLACE_TYPES = [
  { value: "on-site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "intern", label: "Intern" },
  { value: "entry", label: "Entry level" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Principal" },
] as const;

export const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Data",
  "Product",
  "Marketing",
  "Electronics",
  "Sales",
  "Operations",
] as const;

export const APPLICATION_STATUSES = [
  { value: "applied", label: "Applied" },
  { value: "under_review", label: "Under review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
] as const;

export function labelOf(list: readonly { value: string; label: string }[], value?: string | null) {
  return list.find((item) => item.value === value)?.label ?? value ?? "";
}

export function formatSalary(min?: number | null, max?: number | null, currency = "INR") {
  if (!min && !max) return "Salary not disclosed";
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "";
  const short = (n: number) =>
    n >= 100000 ? `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `${Math.round(n / 1000)}k`;
  if (min && max) return `${symbol}${short(min)} – ${symbol}${short(max)}`;
  const only = (min ?? max) as number;
  return `${symbol}${short(only)}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  if (diff < day) return "Today";
  const days = Math.floor(diff / day);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

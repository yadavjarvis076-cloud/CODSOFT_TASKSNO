import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FileText, LayoutDashboard, Bookmark, Settings, UploadCloud, User } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";

export const CANDIDATE_NAV: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard", exact: true },
  { label: "My Profile", icon: User, to: "/dashboard/profile" },
  { label: "My Applications", icon: FileText, to: "/dashboard/applications" },
  { label: "Saved Jobs", icon: Bookmark, to: "/dashboard/saved" },
  { label: "Resume", icon: UploadCloud, to: "/dashboard/resume" },
  { label: "Account Settings", icon: Settings, to: "/dashboard/settings" },
];

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: () => <Outlet />,
});

export function CandidateShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title={title} {...(subtitle ? { subtitle } : {})} nav={CANDIDATE_NAV}>
      {children}
    </DashboardShell>
  );
}

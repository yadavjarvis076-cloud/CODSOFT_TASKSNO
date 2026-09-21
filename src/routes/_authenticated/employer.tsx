import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Building2, FileText, LayoutDashboard, ListChecks, PlusCircle, Settings } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";

export const EMPLOYER_NAV: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, to: "/employer", exact: true },
  { label: "Company Profile", icon: Building2, to: "/employer/company" },
  { label: "Post a Job", icon: PlusCircle, to: "/employer/post" },
  { label: "Manage Jobs", icon: ListChecks, to: "/employer/jobs" },
  { label: "Applications", icon: FileText, to: "/employer/applications" },
  { label: "Account Settings", icon: Settings, to: "/employer/settings" },
];

export const Route = createFileRoute("/_authenticated/employer")({
  component: () => <Outlet />,
});

export function EmployerShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title={title} {...(subtitle ? { subtitle } : {})} nav={EMPLOYER_NAV}>
      {children}
    </DashboardShell>
  );
}

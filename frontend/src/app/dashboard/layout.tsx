"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Calendar,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Search,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { teacherRedirect } from "@/lib/paths";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

const studentLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/teachers", label: "Find teachers", icon: Search },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/lessons", label: "Lessons", icon: Calendar },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const login =
        pathname.startsWith("/dashboard/admin")
          ? "/login/admin"
          : pathname.startsWith("/dashboard/teacher")
            ? "/login/teacher"
            : "/login";
      router.push(`${login}?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.role === "ADMIN" && !pathname.startsWith("/dashboard/admin")) {
      router.replace("/dashboard/admin");
      return;
    }
    if (user.role === "TEACHER") {
      const next = teacherRedirect(pathname);
      if (next) router.replace(next);
      return;
    }
    if (
      user.role === "STUDENT" &&
      (pathname.startsWith("/dashboard/teacher") || pathname.startsWith("/dashboard/admin"))
    ) {
      router.replace("/dashboard");
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="px-4 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="skeleton mx-auto h-10 w-48" />
          <p className="mt-4 text-navy/60">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (user.role !== "STUDENT") return <>{children}</>;

  return (
    <WorkspaceShell
      tone="student"
      kicker="Student studio"
      title={`${user.firstName} ${user.lastName}`}
      subtitle="Find teachers, send enquiries and keep your lesson plan in one place."
      links={studentLinks}
    >
      {children}
    </WorkspaceShell>
  );
}

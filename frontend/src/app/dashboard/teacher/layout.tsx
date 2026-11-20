"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Bell,
  CalendarClock,
  CreditCard,
  Eye,
  History,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserRound,
  Wallet,
  Banknote,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

const teacherLinks = [
  { href: "/dashboard/teacher", label: "Dashboard overview", icon: LayoutDashboard },
  { href: "/dashboard/teacher/profile", label: "My profile", icon: UserRound },
  { href: "/dashboard/teacher/preview", label: "Profile preview", icon: Eye },
  { href: "/dashboard/teacher/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/teacher/enquiries", label: "Student enquiries", icon: Inbox },
  { href: "/dashboard/teacher/wallet", label: "Advertising credit", icon: Wallet },
  { href: "/dashboard/teacher/recharge", label: "Recharge account", icon: CreditCard },
  { href: "/dashboard/teacher/history", label: "Contact history", icon: History },
  { href: "/dashboard/teacher/availability", label: "Teaching availability", icon: CalendarClock },
  { href: "/dashboard/teacher/payments", label: "Payment settings", icon: Banknote },
  { href: "/dashboard/teacher/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/teacher/account", label: "Account settings", icon: Settings },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !user || user.role !== "TEACHER") return;
    if (!user.emailVerified && pathname !== "/dashboard/teacher/verify") {
      router.replace("/dashboard/teacher/verify");
      return;
    }
    const emptyWallet = Number(user.teacher?.walletBalance || 0) <= 0;
    const fillingProfile =
      pathname.startsWith("/dashboard/teacher/profile") || pathname.startsWith("/dashboard/teacher/preview");
    if (user.emailVerified && user.teacher?.status === "PENDING" && emptyWallet && fillingProfile) {
      router.replace("/dashboard/teacher/recharge?next=/dashboard/teacher/profile");
    }
  }, [loading, user, pathname, router]);

  if (!user || user.role !== "TEACHER") return <>{children}</>;

  return (
    <WorkspaceShell
      tone="teacher"
      kicker="Teacher studio"
      title={`${user.firstName} ${user.lastName}`}
      subtitle="Keep 100% of lesson fees. Advertising credits pay for new student contacts only."
      links={teacherLinks}
    >
      {children}
    </WorkspaceShell>
  );
}

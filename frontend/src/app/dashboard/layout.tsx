"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Search,
  Inbox,
  MessageSquare,
  Calendar,
  UserRound,
  Wallet,
  Shield,
  Users,
  Landmark,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const studentLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/teachers", label: "Find teachers", icon: Search },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/lessons", label: "Lessons", icon: Calendar },
];

const teacherLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/wallet", label: "Advertising wallet", icon: Wallet },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/lessons", label: "Lessons", icon: Calendar },
];

const adminLinks = [
  { href: "/dashboard/admin", label: "Admin home", icon: Shield },
  { href: "/dashboard/admin/teachers", label: "Teachers", icon: Users },
  { href: "/dashboard/admin/finance", label: "Finance", icon: Landmark },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/dashboard");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="px-4 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="skeleton mx-auto h-10 w-48" />
          <p className="mt-4 text-navy/60">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const links =
    user.role === "ADMIN" ? adminLinks : user.role === "TEACHER" ? teacherLinks : studentLinks;

  return (
    <div className="bg-[linear-gradient(180deg,#0b1f3a_0%,#0b1f3a_168px,#f4efe6_168px)]">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-5 text-cream">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">{user.role.toLowerCase()} workspace</p>
        <h1 className="mt-1 font-display text-3xl">
          {user.firstName} {user.lastName}
        </h1>
        <p className="mt-1 text-sm text-cream/60">{user.email}</p>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 md:flex-row">
        <aside className="w-full shrink-0 md:w-60">
          <div className="rounded-[1.6rem] bg-white p-4 shadow-sm">
            <nav className="flex flex-col gap-1 text-sm">
              {links.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 ${
                      active ? "bg-navy text-cream" : "text-navy/80 hover:bg-cream"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="mt-3 flex items-center gap-2 rounded-full px-3 py-2 text-left text-navy/50 hover:bg-cream"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </nav>
          </div>
        </aside>
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}
